import { startEmailWorker } from "./services/workers/emailWorker.ts";
import { startReportWorker } from "./services/workers/reportWorker.ts";
import express from "express";
import * as Sentry from "@sentry/node";
import { nodeProfilingIntegration } from "@sentry/profiling-node";
// vite dynamically imported
import { createServer as createHttpServer } from "http";
import { Server } from "socket.io";
import { PrismaClient } from "@prisma/client";
import { v4 as uuidv4 } from "uuid";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import helmet from "helmet";
import compression from "compression";
import rateLimit from "express-rate-limit";
import path from "path";
import cors from "cors";
import { z } from "zod";
import { triggerCall } from "./services/blandService.ts";
import { sendSMS } from "./services/twilioService.ts";
import { syncLead } from "./services/twentyService.ts";
import { generateSpeech } from "./services/elevenLabsService.ts";
import { sendEmail } from "./services/emailService.ts";
import { uploadImageToS3 } from "./services/s3Service.ts";
import crypto from "crypto";
import speakeasy from "speakeasy";
import qrcode from "qrcode";
import {
  chatWithCofounder,
  generatePitchDeck,
  generateMarketAnalysis,
  generateFinancialModel,
  analyzeIdea,
  generateIdeas,
} from "./services/aiService.ts";

// ── Security: force JWT_SECRET in production ──
const JWT_SECRET = process.env.JWT_SECRET || (process.env.NODE_ENV === "production" ? undefined : "super-secret-key-for-dev");
if (!JWT_SECRET) {
  console.error("FATAL: JWT_SECRET environment variable is required in production.");
  process.exit(1);
}

const CORS_ORIGIN = process.env.CORS_ORIGIN || "http://localhost:3000";
const APP_URL = process.env.APP_URL || "http://localhost:5173";
const IS_PROD = process.env.NODE_ENV === "production";

// ── Database ──
const prisma = new PrismaClient();

// ── Auth Middleware ──
const authenticateToken = (req: any, res: any, next: any) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token == null) return res.sendStatus(401);

  jwt.verify(token, JWT_SECRET as string, (err: any, user: any) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

const optionalAuthenticateToken = (req: any, res: any, next: any) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token == null) {
    req.user = null;
    return next();
  }

  jwt.verify(token, JWT_SECRET as string, (err: any, user: any) => {
    if (err) {
      req.user = null;
    } else {
      req.user = user;
    }
    next();
  });
};

// ── Input validation helpers ──
const validateEmail = (email: string): boolean => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
const sanitize = (str: string): string => str.replace(/[<>]/g, '').trim();

// ── Express App ──
export const app = express();

// Ensure to call this before importing any other modules!
Sentry.init({
  dsn: process.env.SENTRY_DSN || "",
  integrations: [
    // Add our Profiling integration
    nodeProfilingIntegration(),
  ],

  // Add Tracing by setting tracesSampleRate
  // We recommend adjusting this value in production
  tracesSampleRate: 1.0,

  // Set sampling rate for profiling
  // This is relative to tracesSampleRate
  profilesSampleRate: 1.0,
});

Sentry.setupExpressErrorHandler(app);

const httpServer = createHttpServer(app);

  // ── Security middleware ──
  app.use(helmet({
    contentSecurityPolicy: IS_PROD ? {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        imgSrc: ["'self'", "data:", "https:", "http:"],
        connectSrc: ["'self'", ...CORS_ORIGIN.split(',')],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        objectSrc: ["'none'"],
        mediaSrc: ["'self'"],
        frameSrc: ["'none'"],
      },
    } : false,
    crossOriginEmbedderPolicy: false,
  }));
  app.use(cors({
    origin: IS_PROD ? CORS_ORIGIN.split(',') : "*",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
  }));
  app.use(compression());

  // ── Rate limiting ──
  const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 20,
    message: { error: "Trop de tentatives. Réessayez dans 15 minutes." },
    standardHeaders: true,
    legacyHeaders: false,
  });

  const apiLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 100,
    message: { error: "Trop de requêtes. Réessayez dans une minute." },
    standardHeaders: true,
    legacyHeaders: false,
  });

  const aiLimiter = rateLimit({
    windowMs: 1 * 60 * 1000,
    max: 10,
    message: { error: "Trop de requêtes IA. Réessayez dans une minute." },
    standardHeaders: true,
    legacyHeaders: false,
  });

  // ── Socket.IO ──
  const io = new Server(httpServer, {
    cors: {
      origin: IS_PROD ? CORS_ORIGIN.split(',') : "*",
      methods: ["GET", "POST"]
    },
    maxHttpBufferSize: 5e7 // 50 MB
  });
  const PORT = parseInt(process.env.PORT || "3000", 10);

  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ extended: true, limit: '50mb' }));
  app.use(apiLimiter);

  // Socket.io Logic
  const roomUsers = new Map<string, Set<string>>();

  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    socket.on("join-project", (projectId) => {
      socket.join(projectId);
      
      if (!roomUsers.has(projectId)) {
        roomUsers.set(projectId, new Set());
      }
      roomUsers.get(projectId)?.add(socket.id);
      
      io.to(projectId).emit("presence-update", { count: roomUsers.get(projectId)?.size || 0 });
      console.log(`User ${socket.id} joined project ${projectId}`);
    });

    socket.on("card-move", (data) => {
      socket.to(data.projectId).emit("card-moved", data);
    });

    socket.on("card-update", (data) => {
      socket.to(data.projectId).emit("card-updated", data);
    });

    socket.on("card-delete", (data) => {
      socket.to(data.projectId).emit("card-deleted", data);
    });

    socket.on("card-add", (data) => {
      socket.to(data.projectId).emit("card-added", data);
    });

    socket.on("project-update", (data) => {
      socket.to(data.projectId).emit("project-updated", data);
    });

    socket.on("chat-message", (data) => {
      socket.to(data.projectId).emit("chat-message-received", data);
    });

    socket.on("comment-add", (data) => {
      socket.to(data.projectId).emit("comment-added", data);
    });

    socket.on("disconnecting", () => {
      socket.rooms.forEach(room => {
        if (roomUsers.has(room)) {
          roomUsers.get(room)?.delete(socket.id);
          io.to(room).emit("presence-update", { count: roomUsers.get(room)?.size || 0 });
        }
      });
    });

    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
    });
  });

  // ═══════════════════════════════════════════
  // Validation Schemas
  // ═══════════════════════════════════════════
  
  const registerSchema = z.object({
    email: z.string().email("Email invalide"),
    password: z.string().min(8, "Le mot de passe doit contenir au moins 8 caractères"),
    referralCode: z.string().optional()
  });

  const loginSchema = z.object({
    email: z.string().email("Email invalide"),
    password: z.string().min(1, "Mot de passe requis")
  });

  const mfaLoginSchema = z.object({
    userId: z.string().uuid("ID utilisateur invalide"),
    token: z.string().length(6, "Code MFA invalide")
  });

  const emailSchema = z.object({
    email: z.string().email("Email invalide")
  });

  const tokenSchema = z.object({
    token: z.string().min(1, "Token requis")
  });

  const resetPasswordSchema = z.object({
    token: z.string().min(1, "Token requis"),
    newPassword: z.string().min(8, "Le mot de passe doit contenir au moins 8 caractères")
  });

  const onboardingSchema = z.object({
    name: z.string().min(1, "Le nom est requis"),
    role: z.string().optional(),
    goal: z.string().optional()
  });

  const projectSchema = z.object({
    name: z.string().min(1, "Le nom du projet est requis"),
    description: z.string().optional(),
    mode: z.string().optional(),
    is_private: z.boolean().optional()
  });

  const projectUpdateSchema = z.object({
    name: z.string().optional(),
    mode: z.string().optional(),
    is_private: z.boolean().optional()
  });

  const cardSchema = z.object({
    title: z.string().min(1, "Titre requis"),
    content: z.string().optional(),
    position_x: z.number().optional(),
    position_y: z.number().optional(),
    phase: z.number().optional()
  });

  const cardUpdateSchema = z.object({
    title: z.string().optional(),
    content: z.string().optional()
  });

  // ═══════════════════════════════════════════
  // Auth Routes
  // ═══════════════════════════════════════════
  app.post("/api/auth/register", authLimiter, async (req, res) => {
    try {
      const validation = registerSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ error: validation.error.issues[0].message });
      }
      const { email, password, referralCode } = validation.data;

      const existingUser = await prisma.user.findUnique({ where: { email } });
      if (existingUser) {
        return res.status(400).json({ error: "Email already exists" });
      }

      const id = uuidv4();
      const password_hash = await bcrypt.hash(password, 12);
      
      const newReferralCode = Math.random().toString(36).substring(2, 10).toUpperCase();
      
      let referredBy = null;
      if (referralCode) {
          const referrer = await prisma.user.findFirst({ where: { referral_code: referralCode } });
          if (referrer) {
              referredBy = referralCode;
          }
      }

      const verification_token = crypto.randomBytes(32).toString('hex');

      await prisma.user.create({
        data: {
          id,
          email,
          password_hash,
          credits: 100,
          referral_code: newReferralCode,
          referred_by: referredBy,
          verification_token,
          is_verified: false,
        }
      });
      
      // Try to send email (don't block registration if email fails in dev)
      try {
        const verifyUrl = `${APP_URL}/verify-email?token=${verification_token}`;
        await sendEmail(email, "Vérifiez votre compte Uprising Cofounder", `Bienvenue ! Cliquez ici pour vérifier votre email : ${verifyUrl}`);
      } catch (err) {
        console.error("Failed to send verification email:", err);
      }

      const token = jwt.sign({ id, email }, JWT_SECRET as string, { expiresIn: '7d' });
      res.json({ token, user: { id, email, is_verified: false, mfa_enabled: false, notifications_enabled: true, theme: 'light', default_mode: 'create', onboarding_completed: false, credits: 100, referral_code: newReferralCode } });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Server error" });
    }
  });

  app.post("/api/auth/login", authLimiter, async (req, res) => {
    try {
      const validation = loginSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ error: validation.error.issues[0].message });
      }
      const { email, password } = validation.data;

      const user = await prisma.user.findUnique({ where: { email } });
      
      if (!user) {
        return res.status(400).json({ error: "Invalid credentials" });
      }

      const validPassword = await bcrypt.compare(password, user.password_hash);
      if (!validPassword) {
        return res.status(400).json({ error: "Invalid credentials" });
      }

      if (user.mfa_enabled === true) {
        return res.json({ mfa_required: true, userId: user.id }); // Client must display MFA input field
      }

      const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET as string, { expiresIn: '7d' });
      const { password_hash, mfa_secret, ...userWithoutPassword } = user;
      res.json({ token, user: userWithoutPassword });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Server error" });
    }
  });

  app.post("/api/auth/login-mfa", authLimiter, async (req, res) => {
    try {
      const validation = mfaLoginSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ error: validation.error.issues[0].message });
      }
      const { userId, token } = validation.data;

      const user = await prisma.user.findUnique({ where: { id: userId } });
      if (!user) return res.status(400).json({ error: "User not found" });

      const verified = speakeasy.totp.verify({
        secret: user.mfa_secret as string,
        encoding: 'base32',
        token
      });

      if (!verified) {
        return res.status(400).json({ error: "Code MFA invalide" });
      }

      const jwtToken = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET as string, { expiresIn: '7d' });
      const { password_hash, mfa_secret, ...userWithoutPassword } = user;
      res.json({ token: jwtToken, user: userWithoutPassword });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Server error" });
    }
  });

  app.post("/api/auth/verify-email", authLimiter, async (req, res) => {
    try {
      const validation = tokenSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ error: validation.error.issues[0].message });
      }
      const { token } = validation.data;

      const user = await prisma.user.findFirst({ where: { verification_token: token } });
      if (!user) return res.status(400).json({ error: "Jeton invalide ou expiré (Invalid token)" });

      await prisma.user.update({
        where: { id: user.id },
        data: {
          is_verified: true,
          verification_token: null,
        }
      });
      res.json({ success: true, message: "Email vérifié avec succès" });
    } catch (error) {
      res.status(500).json({ error: "Server error" });
    }
  });

  app.post("/api/auth/forgot-password", authLimiter, async (req, res) => {
    try {
      const validation = emailSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ error: validation.error.issues[0].message });
      }
      const { email } = validation.data;

      const user = await prisma.user.findFirst({
        where: { email: { equals: email, mode: 'insensitive' } }
      });
      if (!user) {
        // Obfuscate success
        return res.json({ success: true, message: "Si l'email existe, un lien de réinitialisation a été envoyé." });
      }

      const reset_token = crypto.randomBytes(32).toString('hex');
      const reset_token_expiry = new Date(Date.now() + 3600000); // 1 hour from now

      await prisma.user.updateMany({
        where: { email: { equals: email, mode: 'insensitive' } },
        data: {
          reset_token,
          reset_token_expiry,
        }
      });

      const resetUrl = `${APP_URL}/reset-password?token=${reset_token}`;
      try {
        await sendEmail(user.email, "Réinitialisation de votre mot de passe", `Cliquez sur ce lien pour réinitialiser votre mot de passe: ${resetUrl}`);
      } catch (err) {
        console.error("Erreur lors de l'envoi de l'email de réinitialisation:", err);
      }

      res.json({ success: true, message: "Si l'email existe, un lien de réinitialisation a été envoyé." });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Server error" });
    }
  });

  app.post("/api/auth/reset-password", authLimiter, async (req, res) => {
    try {
      const validation = resetPasswordSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ error: validation.error.issues[0].message });
      }
      const { token, newPassword } = validation.data;

      const user = await prisma.user.findFirst({ where: { reset_token: token } });
      
      if (!user || !user.reset_token_expiry || new Date(user.reset_token_expiry) < new Date()) {
        return res.status(400).json({ error: "Le lien de réinitialisation est invalide ou a expiré." });
      }

      const password_hash = await bcrypt.hash(newPassword, 12);
      await prisma.user.update({
        where: { id: user.id },
        data: {
          password_hash,
          reset_token: null,
          reset_token_expiry: null,
        }
      });
      
      res.json({ success: true, message: "Mot de passe mis à jour avec succès." });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Server error" });
    }
  });

  app.post("/api/auth/mfa/setup", authenticateToken, async (req, res) => {
    try {
      const secret = speakeasy.generateSecret({ name: `Uprising Cofounder (${(req as any).user.email})` });
      
      // We don't save it as active until they verify it
      await prisma.user.update({
        where: { id: (req as any).user.id },
        data: { mfa_secret: secret.base32 },
      });
      
      qrcode.toDataURL(secret.otpauth_url as string, (err, data_url) => {
        if (err) return res.status(500).json({ error: "Error generating QR code" });
        res.json({ secret: secret.base32, qr_code: data_url });
      });
    } catch (error) {
      res.status(500).json({ error: "Server error" });
    }
  });

  app.post("/api/auth/mfa/verify-setup", authenticateToken, async (req, res) => {
    try {
      const validation = tokenSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ error: validation.error.issues[0].message });
      }
      const { token } = validation.data;
      const user = await prisma.user.findUnique({ where: { id: (req as any).user.id }, select: { mfa_secret: true } });
      
      if (!user?.mfa_secret) return res.status(400).json({ error: "MFA n'a pas été initié" });

      const verified = speakeasy.totp.verify({
        secret: user.mfa_secret,
        encoding: 'base32',
        token
      });

      if (verified) {
        await prisma.user.update({
          where: { id: (req as any).user.id },
          data: { mfa_enabled: true }
        });
        res.json({ success: true, message: "MFA activé avec succès" });
      } else {
        res.status(400).json({ error: "Code invalide" });
      }
    } catch (error) {
      res.status(500).json({ error: "Server error" });
    }
  });

  app.get("/api/auth/me", authenticateToken, async (req: any, res: any) => {
    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    if (!user) return res.status(404).json({ error: "User not found" });
    const { password_hash, ...safeUser } = user;
    res.json({ user: safeUser });
  });

  app.put("/api/users/onboarding", authenticateToken, async (req: any, res: any) => {
    const validation = onboardingSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({ error: validation.error.issues[0].message });
    }
    const { name, role, goal } = validation.data;

    await prisma.user.update({
      where: { id: req.user.id },
      data: {
        name: sanitize(name),
        role: role || 'user',
        goal: goal ? sanitize(goal) : null,
        onboarding_completed: true,
      }
    });

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { id: true, email: true, name: true, role: true, goal: true, onboarding_completed: true, notifications_enabled: true, theme: true, default_mode: true }
    });
    res.json({ user });
  });

  app.put("/api/users/settings", authenticateToken, async (req: any, res: any) => {
    const { 
      notifications_enabled, 
      theme, 
      default_mode,
      bland_api_key,
      twilio_account_sid,
      twilio_auth_token,
      twilio_phone_number,
      elevenlabs_api_key,
      twenty_api_key,
      gemini_api_key
    } = req.body;

    await prisma.user.update({
      where: { id: req.user.id },
      data: {
        notifications_enabled: notifications_enabled ? true : false,
        theme,
        default_mode,
        bland_api_key,
        twilio_account_sid,
        twilio_auth_token,
        twilio_phone_number,
        elevenlabs_api_key,
        twenty_api_key,
        gemini_api_key
      }
    });
    
    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    if (user) {
      const { password_hash, ...safeUser } = user;
      res.json({ user: safeUser });
    } else {
      res.status(404).json({ error: "User not found" });
    }
  });

  // ═══════════════════════════════════════════
  // Project Routes (with pagination)
  // ═══════════════════════════════════════════
  app.get("/api/projects", authenticateToken, async (req: any, res: any) => {
    const limit = Math.min(parseInt(req.query.limit as string) || 50, 100);
    const offset = parseInt(req.query.offset as string) || 0;
    
    // Fetch projects where user is owner OR member
    const projects = await prisma.project.findMany({
      where: {
        deleted_at: null,
        OR: [
          { user_id: req.user.id },
          { members: { some: { user_id: req.user.id } } }
        ]
      },
      orderBy: { created_at: 'desc' },
      take: limit,
      skip: offset,
    });

    const total = await prisma.project.count({
      where: {
        deleted_at: null,
        OR: [
          { user_id: req.user.id },
          { members: { some: { user_id: req.user.id } } }
        ]
      }
    });
    
    res.json({ projects, total, limit, offset });
  });

  app.post("/api/projects", authenticateToken, async (req: any, res: any) => {
    try {
      const validation = projectSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ error: validation.error.issues[0].message });
      }
      const { name, description, mode, is_private } = validation.data;

      const id = uuidv4();
      const project = await prisma.project.create({
        data: {
          id,
          name: sanitize(name),
          description: description ? sanitize(description) : null,
          mode: mode || 'create',
          is_private: is_private ? true : false,
          user_id: req.user.id,
          members: {
            create: {
              user_id: req.user.id,
              role: 'owner'
            }
          }
        }
      });
      res.json(project);
    } catch (error: any) {
      console.error("Failed to create project:", error);
      res.status(500).json({ error: error.message || "Failed to create project" });
    }
  });

  app.get("/api/projects/:id", optionalAuthenticateToken, async (req: any, res: any) => {
    const project = await prisma.project.findFirst({
        where: { id: req.params.id, deleted_at: null },
        include: { members: true }
    });
    if (!project) return res.status(404).json({ error: "Not found" });
    if (project.is_private) {
      if (!req.user) return res.status(403).json({ error: "Access denied" });
      if (project.user_id !== req.user.id) {
        const isMember = project.members.some(m => m.user_id === req.user.id);
        if (!isMember) return res.status(403).json({ error: "Access denied" });
      }
    }
    res.json(project);
  });

  app.put("/api/projects/:id", authenticateToken, async (req: any, res: any) => {
    const validation = projectUpdateSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({ error: validation.error.issues[0].message });
    }
    const { name, mode, is_private } = validation.data;
    const project = await prisma.project.findFirst({
        where: { id: req.params.id, deleted_at: null },
        include: { members: true }
    });
    if (!project) return res.status(404).json({ error: "Project not found" });
    
    const member = project.members.find(m => m.user_id === req.user.id);
    const hasAccess = project.user_id === req.user.id || (member && (member.role === 'owner' || member.role === 'editor'));
    if (!hasAccess) return res.status(403).json({ error: "Access denied" });

    const updateData: any = {};
    if (name !== undefined) updateData.name = sanitize(name);
    if (mode !== undefined) updateData.mode = mode;
    if (is_private !== undefined) updateData.is_private = is_private ? true : false;
    
    if (Object.keys(updateData).length > 0) {
        updateData.updated_at = new Date();
        const updatedProject = await prisma.project.update({
            where: { id: req.params.id },
            data: updateData
        });
        return res.json(updatedProject);
    }
    
    res.json(project);
  });

  app.delete("/api/projects/:id", authenticateToken, async (req: any, res: any) => {
    const project = await prisma.project.findFirst({ 
        where: { id: req.params.id, deleted_at: null },
        include: { members: true }
    });
    if (!project) return res.status(404).json({ error: "Project not found" });

    const member = project.members.find(m => m.user_id === req.user.id);
    const isOwner = project.user_id === req.user.id || (member && member.role === 'owner');
    if (!isOwner) return res.status(403).json({ error: "Project not found or unauthorized" });

    await prisma.$transaction(async (tx) => {
      const cards = await tx.card.findMany({ where: { project_id: req.params.id, deleted_at: null }});
      const cardIds = cards.map(c => c.id);
      
      if (cardIds.length > 0) {
          await tx.cardComment.updateMany({
              where: { card_id: { in: cardIds } },
              data: { deleted_at: new Date() }
          });
      }
      
      await tx.card.updateMany({
          where: { project_id: req.params.id },
          data: { deleted_at: new Date() }
      });
      await tx.message.updateMany({
          where: { project_id: req.params.id },
          data: { deleted_at: new Date() }
      });
      await tx.project.update({
          where: { id: req.params.id },
          data: { deleted_at: new Date() }
      });
    });

    res.json({ success: true });
  });

  // ═══════════════════════════════════════════
  // Card Routes
  // ═══════════════════════════════════════════
  app.get("/api/projects/:id/cards", optionalAuthenticateToken, async (req: any, res: any) => {
    const project = await prisma.project.findFirst({
        where: { id: req.params.id, deleted_at: null },
        include: { members: true }
    });
    if (!project) return res.status(404).json({ error: "Project not found" });
    if (project.is_private) {
      if (!req.user) return res.status(403).json({ error: "Access denied" });
      if (project.user_id !== req.user.id) {
        const isMember = project.members.some(m => m.user_id === req.user.id);
        if (!isMember) return res.status(403).json({ error: "Access denied" });
      }
    }
    const cards = await prisma.card.findMany({ where: { project_id: req.params.id, deleted_at: null }});
    res.json(cards);
  });

  app.post("/api/projects/:id/cards", authenticateToken, async (req: any, res: any) => {
    const project = await prisma.project.findFirst({
        where: { id: req.params.id, deleted_at: null },
        include: { members: true }
    });
    if (!project) return res.status(404).json({ error: "Project not found" });

    const member = project.members.find(m => m.user_id === req.user.id);
    const hasAccess = project.user_id === req.user.id || (member && (member.role === 'owner' || member.role === 'editor')) || !project.is_private;
    if (!hasAccess) return res.status(403).json({ error: "Access denied" });

    const validation = cardSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({ error: validation.error.issues[0].message });
    }
    const { title, content, position_x, position_y, phase } = validation.data;
    const id = uuidv4();
    
    const card = await prisma.card.create({
        data: {
            id,
            project_id: req.params.id,
            title,
            content,
            position_x: position_x || 100,
            position_y: position_y || 100,
            phase: phase || 1,
        }
    });
    
    res.json(card);
  });

  app.put("/api/cards/:id", authenticateToken, async (req: any, res: any) => {
    const validation = cardUpdateSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({ error: validation.error.issues[0].message });
    }
    const { title, content } = validation.data;
    const card = await prisma.card.findFirst({ where: { id: req.params.id, deleted_at: null }});
    if (!card) return res.status(404).json({ error: "Card not found" });
    
    const project = await prisma.project.findFirst({
        where: { id: card.project_id, deleted_at: null },
        include: { members: true }
    });
    const member = project?.members.find(m => m.user_id === req.user.id);
    const hasAccess = project && (project.user_id === req.user.id || (member && (member.role === 'owner' || member.role === 'editor')) || !project.is_private);
    if (!hasAccess) return res.status(403).json({ error: "Forbidden" });

    await prisma.card.update({
        where: { id: req.params.id },
        data: { title, content, updated_at: new Date() }
    });
    
    res.json({ success: true });
  });

  app.delete("/api/cards/:id", authenticateToken, async (req: any, res: any) => {
    const card = await prisma.card.findFirst({ where: { id: req.params.id, deleted_at: null }});
    if (!card) return res.status(404).json({ error: "Card not found" });
    
    const project = await prisma.project.findFirst({
        where: { id: card.project_id, deleted_at: null },
        include: { members: true }
    });
    const member = project?.members.find(m => m.user_id === req.user.id);
    const hasAccess = project && (project.user_id === req.user.id || (member && (member.role === 'owner' || member.role === 'editor')) || !project.is_private);
    if (!hasAccess) return res.status(403).json({ error: "Forbidden" });

    await prisma.$transaction(async (tx) => {
        await tx.cardComment.updateMany({
            where: { card_id: req.params.id },
            data: { deleted_at: new Date() }
        });
        await tx.card.update({
            where: { id: req.params.id },
            data: { deleted_at: new Date() }
        });
    });

    res.json({ success: true });
  });

  app.put("/api/cards/:id/position", authenticateToken, async (req: any, res: any) => {
    const { position_x, position_y } = req.body;
    const card = await prisma.card.findFirst({ where: { id: req.params.id, deleted_at: null }});
    if (!card) return res.status(404).json({ error: "Card not found" });
    
    const project = await prisma.project.findFirst({
        where: { id: card.project_id, deleted_at: null },
        include: { members: true }
    });
    const member = project?.members.find(m => m.user_id === req.user.id);
    const hasAccess = project && (project.user_id === req.user.id || (member && (member.role === 'owner' || member.role === 'editor')) || !project.is_private);
    if (!hasAccess) return res.status(403).json({ error: "Forbidden" });

    await prisma.card.update({
        where: { id: req.params.id },
        data: { position_x, position_y, updated_at: new Date() }
    });
    
    res.json({ success: true });
  });

  // ═══════════════════════════════════════════
  // Messages Routes (with pagination)
  // ═══════════════════════════════════════════
  app.get("/api/projects/:id/messages", optionalAuthenticateToken, async (req: any, res: any) => {
    const project = await prisma.project.findFirst({
        where: { id: req.params.id, deleted_at: null },
        include: { members: true }
    });
    if (!project) return res.status(404).json({ error: "Project not found" });
    if (project.is_private) {
      if (!req.user) return res.status(403).json({ error: "Access denied" });
      if (project.user_id !== req.user.id) {
        const isMember = project.members.some(m => m.user_id === req.user.id);
        if (!isMember) return res.status(403).json({ error: "Access denied" });
      }
    }
    const limit = Math.min(parseInt(req.query.limit as string) || 100, 500);
    const offset = parseInt(req.query.offset as string) || 0;
    
    const messages = await prisma.message.findMany({
        where: { project_id: req.params.id, deleted_at: null },
        orderBy: { created_at: 'asc' },
        take: limit,
        skip: offset
    });
    
    const total = await prisma.message.count({
        where: { project_id: req.params.id, deleted_at: null }
    });
    
    res.json({ messages, total, limit, offset });
  });

  app.delete("/api/projects/:id/messages", authenticateToken, async (req: any, res: any) => {
    const project = await prisma.project.findFirst({
        where: { id: req.params.id, deleted_at: null },
        include: { members: true }
    });
    if (!project) return res.status(404).json({ error: "Project not found" });

    const member = project.members.find(m => m.user_id === req.user.id);
    const hasAccess = project.user_id === req.user.id || (member && (member.role === 'owner' || member.role === 'editor')) || !project.is_private;
    if (!hasAccess) return res.status(403).json({ error: "Access denied" });

    await prisma.message.updateMany({
        where: { project_id: req.params.id },
        data: { deleted_at: new Date() }
    });
    res.json({ success: true });
  });

  app.post("/api/projects/:id/messages", authenticateToken, async (req: any, res: any) => {
    const project = await prisma.project.findFirst({
        where: { id: req.params.id, deleted_at: null },
        include: { members: true }
    });
    if (!project) return res.status(404).json({ error: "Project not found" });

    const member = project.members.find(m => m.user_id === req.user.id);
    const hasAccess = project.user_id === req.user.id || (member && (member.role === 'owner' || member.role === 'editor')) || !project.is_private;
    if (!hasAccess) return res.status(403).json({ error: "Access denied" });

    const { role, content, image } = req.body;
    const id = uuidv4();
    
    let processedImage = image || null;
    if (processedImage && processedImage.startsWith("data:image")) {
      try {
        processedImage = await uploadImageToS3(processedImage);
      } catch (uploadError) {
        console.error("Failed to upload image to S3, storing base64 instead:", uploadError);
      }
    }

    const message = await prisma.message.create({
        data: {
            id,
            project_id: req.params.id,
            role,
            content,
            image: processedImage
        }
    });

    res.json(message);
  });

  // ═══════════════════════════════════════════
  // Card Comments
  // ═══════════════════════════════════════════
  app.get("/api/cards/:id/comments", authenticateToken, async (req: any, res: any) => {
    const comments = await prisma.cardComment.findMany({
        where: { card_id: req.params.id, deleted_at: null },
        include: { user: { select: { name: true, email: true } } },
        orderBy: { created_at: 'asc' }
    });
    // Transform specifically because the original sent user.name alongside the comment properties
    const transformedComments = comments.map(c => ({
        ...c,
        name: c.user?.name,
        email: c.user?.email,
        user: undefined // optionally remove user
    }));
    res.json(transformedComments);
  });

  app.post("/api/cards/:id/comments", authenticateToken, async (req: any, res: any) => {
    const { content } = req.body;
    if (!content) return res.status(400).json({ error: "Content is required" });
    
    const id = uuidv4();
    const comment = await prisma.cardComment.create({
        data: {
            id,
            card_id: req.params.id,
            user_id: req.user.id,
            content: sanitize(content)
        },
        include: { user: { select: { name: true, email: true } } }
    });
    
    res.json({
        ...comment,
        name: comment.user?.name,
        email: comment.user?.email,
        user: undefined
    });
  });

  // ═══════════════════════════════════════════
  // Project Members
  // ═══════════════════════════════════════════
  app.get("/api/projects/:id/members", authenticateToken, async (req: any, res: any) => {
    const project = await prisma.project.findFirst({
        where: { id: req.params.id, deleted_at: null },
        include: { members: true }
    });
    if (!project) return res.status(404).json({ error: "Project not found" });

    const member = project.members.find(m => m.user_id === req.user.id);
    const hasAccess = project.user_id === req.user.id || member;
    if (!hasAccess) return res.status(403).json({ error: "Access denied" });

    const members = await prisma.projectMember.findMany({
        where: { project_id: req.params.id },
        include: { user: { select: { id: true, name: true, email: true } } },
        orderBy: { joined_at: 'asc' }
    });
    
    const transformedMembers = members.map(m => ({
        member_id: m.id,
        role: m.role,
        joined_at: m.joined_at,
        id: m.user?.id,
        name: m.user?.name,
        email: m.user?.email
    }));
    res.json(transformedMembers);
  });

  app.post("/api/projects/:id/members", authenticateToken, async (req: any, res: any) => {
    const { email, role } = req.body;
    const project = await prisma.project.findFirst({
        where: { id: req.params.id, deleted_at: null },
        include: { members: true }
    });
    if (!project) return res.status(404).json({ error: "Project not found" });

    const currentMember = project.members.find(m => m.user_id === req.user.id);
    const isOwner = project.user_id === req.user.id || (currentMember && currentMember.role === 'owner');
    if (!isOwner) return res.status(403).json({ error: "Only owners can add members" });

    const userToAdd = await prisma.user.findUnique({ where: { email } });
    if (!userToAdd) return res.status(404).json({ error: "User not found" });

    try {
      const newMember = await prisma.projectMember.create({
          data: {
              id: uuidv4(),
              project_id: req.params.id,
              user_id: userToAdd.id,
              role: role || 'viewer'
          },
          include: { user: { select: { id: true, name: true, email: true } } }
      });
      
      res.json({
        member_id: newMember.id,
        role: newMember.role,
        joined_at: newMember.joined_at,
        id: newMember.user?.id,
        name: newMember.user?.name,
        email: newMember.user?.email
      });
    } catch (e: any) {
      if (e.code === 'P2002') { // Prisma unique constraint violation code
        return res.status(400).json({ error: "User is already a member" });
      }
      res.status(500).json({ error: "Failed to add member" });
    }
  });

  app.put("/api/projects/:id/members/:userId", authenticateToken, async (req: any, res: any) => {
    const { role } = req.body;
    const project = await prisma.project.findFirst({
        where: { id: req.params.id, deleted_at: null },
        include: { members: true }
    });
    if (!project) return res.status(404).json({ error: "Project not found" });

    const currentMember = project.members.find(m => m.user_id === req.user.id);
    const isOwner = project.user_id === req.user.id || (currentMember && currentMember.role === 'owner');
    
    if (!isOwner) {
      return res.status(403).json({ error: "Access denied" });
    }
    if (project.user_id === req.params.userId) {
      return res.status(400).json({ error: "Cannot change role of project creator" });
    }

    await prisma.projectMember.updateMany({
        where: { project_id: req.params.id, user_id: req.params.userId },
        data: { role }
    });
    res.json({ success: true });
  });

  app.delete("/api/projects/:id/members/:userId", authenticateToken, async (req: any, res: any) => {
    const project = await prisma.project.findFirst({
        where: { id: req.params.id, deleted_at: null },
        include: { members: true }
    });
    if (!project) return res.status(404).json({ error: "Project not found" });

    const currentMember = project.members.find(m => m.user_id === req.user.id);
    const isOwner = project.user_id === req.user.id || (currentMember && currentMember.role === 'owner');
    
    // User can remove themselves, or owner can remove anyone.
    if (!isOwner && req.user.id !== req.params.userId) {
      return res.status(403).json({ error: "Access denied" });
    }
    if (project.user_id === req.params.userId) {
      return res.status(400).json({ error: "Cannot remove the project creator" });
    }

    await prisma.projectMember.deleteMany({
        where: { project_id: req.params.id, user_id: req.params.userId }
    });
    res.json({ success: true });
  });

  // ═══════════════════════════════════════════
  // AI Routes (Server-side proxy — no API keys exposed to client)
  // ═══════════════════════════════════════════
  app.post("/api/ai/chat", authenticateToken, aiLimiter, async (req: any, res: any) => {
    try {
      const { messages, projectContext } = req.body;
      if (!messages || !Array.isArray(messages)) {
        return res.status(400).json({ error: "Messages array required" });
      }

      const user = await prisma.user.findUnique({ where: { id: req.user.id } });
      const userApiKey = user?.gemini_api_key || undefined;

      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');

      const stream = await chatWithCofounder(messages, projectContext || {}, userApiKey);
      
      for await (const chunk of stream) {
        const text = chunk.text;
        if (text) {
          res.write(`data: ${JSON.stringify({ text })}\n\n`);
        }
      }
      res.write(`data: [DONE]\n\n`);
      res.end();
    } catch (error: any) {
      console.error("AI Chat error:", error);
      if (!res.headersSent) {
        res.status(500).json({ error: "Erreur lors de la génération de la réponse IA." });
      } else {
        res.write(`data: ${JSON.stringify({ error: "Erreur IA" })}\n\n`);
        res.end();
      }
    }
  });

  app.post("/api/ai/pitch-deck", authenticateToken, aiLimiter, async (req: any, res: any) => {
    try {
      const { projectContext } = req.body;
      const user = await prisma.user.findUnique({ where: { id: req.user.id } });
      const result = await generatePitchDeck(projectContext, user?.gemini_api_key || undefined);
      res.json({ content: result });
    } catch (error) {
      console.error("Pitch deck error:", error);
      res.status(500).json({ error: "Erreur lors de la génération du pitch deck." });
    }
  });

  app.post("/api/ai/market-analysis", authenticateToken, aiLimiter, async (req: any, res: any) => {
    try {
      const { projectContext } = req.body;
      const user = await prisma.user.findUnique({ where: { id: req.user.id } });
      const result = await generateMarketAnalysis(projectContext, user?.gemini_api_key || undefined);
      res.json({ content: result });
    } catch (error) {
      console.error("Market analysis error:", error);
      res.status(500).json({ error: "Erreur lors de la génération de l'analyse de marché." });
    }
  });

  app.post("/api/ai/financial-model", authenticateToken, aiLimiter, async (req: any, res: any) => {
    try {
      const { projectContext } = req.body;
      const user = await prisma.user.findUnique({ where: { id: req.user.id } });
      const result = await generateFinancialModel(projectContext, user?.gemini_api_key || undefined);
      res.json({ content: result });
    } catch (error) {
      console.error("Financial model error:", error);
      res.status(500).json({ error: "Erreur lors de la génération du modèle financier." });
    }
  });

  app.post("/api/ai/analyze-idea", authenticateToken, aiLimiter, async (req: any, res: any) => {
    try {
      const { idea } = req.body;
      if (!idea) return res.status(400).json({ error: "L'idée est requise" });
      const user = await prisma.user.findUnique({ where: { id: req.user.id } });
      const result = await analyzeIdea(idea, user?.gemini_api_key || undefined);
      res.json(result);
    } catch (error) {
      console.error("Analyze idea error:", error);
      res.status(500).json({ error: "Erreur lors de l'analyse de l'idée." });
    }
  });

  app.post("/api/ai/generate-ideas", authenticateToken, aiLimiter, async (req: any, res: any) => {
    try {
      const { interests, businessType } = req.body;
      const user = await prisma.user.findUnique({ where: { id: req.user.id } });
      const result = await generateIdeas(interests, businessType, user?.gemini_api_key || undefined);
      res.json(result);
    } catch (error) {
      console.error("Generate ideas error:", error);
      res.status(500).json({ error: "Erreur lors de la génération d'idées." });
    }
  });

  // ═══════════════════════════════════════════
  // Demo/Integration Routes
  // ═══════════════════════════════════════════
  app.post("/api/demo/voice-call", authenticateToken, async (req: any, res: any) => {
    const { phoneNumber, agentId, task } = req.body;
    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    
    try {
      const result = await triggerCall(phoneNumber, agentId, task, user?.bland_api_key);
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: "Failed to trigger call" });
    }
  });

  app.post("/api/demo/sms", authenticateToken, async (req: any, res: any) => {
    const { to, body } = req.body;
    const user = await prisma.user.findUnique({ where: { id: req.user.id } });

    try {
      const result = await sendSMS(to, body, user?.twilio_account_sid, user?.twilio_auth_token, user?.twilio_phone_number);
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: "Failed to send SMS" });
    }
  });

  app.post("/api/crm/sync", authenticateToken, async (req: any, res: any) => {
    const { leadData } = req.body;
    const user = await prisma.user.findUnique({ where: { id: req.user.id } });

    try {
      const result = await syncLead(leadData, user?.twenty_api_key);
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: "Failed to sync lead" });
    }
  });

  app.post("/api/demo/speech", authenticateToken, async (req: any, res: any) => {
    const { text, voiceId } = req.body;
    const user = await prisma.user.findUnique({ where: { id: req.user.id } });

    try {
      const result = await generateSpeech(text, voiceId, user?.elevenlabs_api_key);
      if (Buffer.isBuffer(result) || result instanceof ArrayBuffer) {
        res.set('Content-Type', 'audio/mpeg');
        res.send(result);
      } else {
        res.json(result);
      }
    } catch (error) {
      res.status(500).json({ error: "Failed to generate speech" });
    }
  });

  // ═══════════════════════════════════════════
  // Healthcheck Route
  // ═══════════════════════════════════════════
  app.get("/api/health", (_req, res) => {
    res.status(200).json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // ═══════════════════════════════════════════
  // Serve static files & Vite middleware
  // ═══════════════════════════════════════════
  if (IS_PROD) {
    // Serve built frontend in production
    app.use(express.static(path.join(import.meta.dirname, "dist"), {
      maxAge: '1y',
      etag: true,
    }));
    // SPA fallback
    app.get("*", (_req, res) => {
      res.sendFile(path.join(import.meta.dirname, "dist", "index.html"));
    });
  }

async function startServer() {
  if (!IS_PROD) {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  }

  startEmailWorker();
  startReportWorker();
  httpServer.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT} [${IS_PROD ? 'PRODUCTION' : 'DEVELOPMENT'}]`);
  });
}

if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  startServer();
}

