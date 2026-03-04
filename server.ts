import express from "express";
import { createServer as createViteServer } from "vite";
import { createServer as createHttpServer } from "http";
import { Server } from "socket.io";
import Database from "better-sqlite3";
import { v4 as uuidv4 } from "uuid";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { triggerCall } from "./server/services/blandService.ts";
import { sendSMS } from "./server/services/twilioService.ts";
import { syncLead } from "./server/services/twentyService.ts";
import { generateSpeech } from "./server/services/elevenLabsService.ts";

const db = new Database("app.db");
const JWT_SECRET = process.env.JWT_SECRET || "super-secret-key-for-dev";

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    name TEXT,
    role TEXT,
    goal TEXT,
    onboarding_completed INTEGER DEFAULT 0,
    notifications_enabled INTEGER DEFAULT 1,
    theme TEXT DEFAULT 'light',
    default_mode TEXT DEFAULT 'create',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS projects (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    mode TEXT CHECK(mode IN ('create', 'scale', 'analyse')) DEFAULT 'create',
    is_private INTEGER DEFAULT 0,
    user_id TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS cards (
    id TEXT PRIMARY KEY,
    project_id TEXT NOT NULL,
    title TEXT NOT NULL,
    content TEXT,
    position_x REAL DEFAULT 100,
    position_y REAL DEFAULT 100,
    phase INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES projects(id)
  );

  CREATE TABLE IF NOT EXISTS messages (
    id TEXT PRIMARY KEY,
    project_id TEXT NOT NULL,
    role TEXT CHECK(role IN ('user', 'assistant')),
    content TEXT,
    image TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES projects(id)
  );

  CREATE TABLE IF NOT EXISTS card_comments (
    id TEXT PRIMARY KEY,
    card_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    content TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (card_id) REFERENCES cards(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
  );

  CREATE INDEX IF NOT EXISTS idx_projects_user_id ON projects(user_id);
  CREATE INDEX IF NOT EXISTS idx_cards_project_id ON cards(project_id);
  CREATE INDEX IF NOT EXISTS idx_messages_project_id ON messages(project_id);
  CREATE INDEX IF NOT EXISTS idx_card_comments_card_id ON card_comments(card_id);
`);

try {
  db.exec("ALTER TABLE projects ADD COLUMN user_id TEXT REFERENCES users(id);");
} catch (e) {
  // Column might already exist
}

try {
  db.exec("ALTER TABLE projects ADD COLUMN is_private INTEGER DEFAULT 0;");
} catch (e) {
  // Column might already exist
}

// Fix projects table CHECK constraint if it only allows create and scale
try {
  const tableInfo = db.prepare("SELECT sql FROM sqlite_master WHERE type='table' AND name='projects'").get() as any;
  if (tableInfo && tableInfo.sql.includes("('create', 'scale')")) {
    db.exec(`
      PRAGMA foreign_keys=off;
      BEGIN TRANSACTION;
      CREATE TABLE projects_new (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        mode TEXT CHECK(mode IN ('create', 'scale', 'analyse')) DEFAULT 'create',
        is_private INTEGER DEFAULT 0,
        user_id TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
      );
      INSERT INTO projects_new SELECT * FROM projects;
      DROP TABLE projects;
      ALTER TABLE projects_new RENAME TO projects;
      CREATE INDEX IF NOT EXISTS idx_projects_user_id ON projects(user_id);
      COMMIT;
      PRAGMA foreign_keys=on;
    `);
    console.log("Migrated projects table CHECK constraint to include 'analyse'");
  }
} catch (e) {
  console.error("Failed to migrate projects table:", e);
}

const userColumnsToAdd = [
  "name TEXT",
  "role TEXT",
  "goal TEXT",
  "onboarding_completed INTEGER DEFAULT 0",
  "bland_api_key TEXT",
  "twilio_account_sid TEXT",
  "twilio_auth_token TEXT",
  "twilio_phone_number TEXT",
  "elevenlabs_api_key TEXT",
  "twenty_api_key TEXT",
  "credits INTEGER DEFAULT 100",
  "referral_code TEXT",
  "referred_by TEXT"
];

for (const col of userColumnsToAdd) {
  try {
    db.exec(`ALTER TABLE users ADD COLUMN ${col};`);
  } catch (e) {
    // Column might already exist
  }
}

// Auth Middleware
const authenticateToken = (req: any, res: any, next: any) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token == null) return res.sendStatus(401);

  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
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

  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) {
      req.user = null;
    } else {
      req.user = user;
    }
    next();
  });
};

async function startServer() {
  const app = express();
  const httpServer = createHttpServer(app);
  const io = new Server(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });
  const PORT = 3000;

  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ extended: true, limit: '50mb' }));

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
      // data: { projectId, cardId, x, y }
      socket.to(data.projectId).emit("card-moved", data);
    });

    socket.on("card-update", (data) => {
      // data: { projectId, cardId, title, content }
      socket.to(data.projectId).emit("card-updated", data);
    });

    socket.on("card-delete", (data) => {
      // data: { projectId, cardId }
      socket.to(data.projectId).emit("card-deleted", data);
    });

    socket.on("card-add", (data) => {
      // data: { projectId, card }
      socket.to(data.projectId).emit("card-added", data);
    });

    socket.on("project-update", (data) => {
      // data: { projectId, name, mode }
      socket.to(data.projectId).emit("project-updated", data);
    });

    socket.on("chat-message", (data) => {
      // data: { projectId, message }
      socket.to(data.projectId).emit("chat-message-received", data);
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

  // Auth Routes
  app.post("/api/auth/register", async (req, res) => {
    try {
      const { email, password, referralCode } = req.body;
      const existingUser = db.prepare("SELECT * FROM users WHERE email = ?").get(email);
      if (existingUser) {
        return res.status(400).json({ error: "Email already exists" });
      }

      const id = uuidv4();
      const password_hash = await bcrypt.hash(password, 10);
      
      // Generate a simple 8-char referral code
      const newReferralCode = Math.random().toString(36).substring(2, 10).toUpperCase();
      
      // Check if referred by someone
      let referredBy = null;
      if (referralCode) {
          const referrer: any = db.prepare("SELECT referral_code FROM users WHERE referral_code = ?").get(referralCode);
          if (referrer) {
              referredBy = referralCode;
              // Optional: Give credits to referrer here?
          }
      }

      db.prepare("INSERT INTO users (id, email, password_hash, credits, referral_code, referred_by) VALUES (?, ?, ?, 100, ?, ?)").run(id, email, password_hash, newReferralCode, referredBy);
      
      const token = jwt.sign({ id, email }, JWT_SECRET, { expiresIn: '7d' });
      res.json({ token, user: { id, email, notifications_enabled: 1, theme: 'light', default_mode: 'create', onboarding_completed: 0, credits: 100, referral_code: newReferralCode } });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Server error" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      const user: any = db.prepare("SELECT * FROM users WHERE email = ?").get(email);
      
      if (!user) {
        return res.status(400).json({ error: "Invalid credentials" });
      }

      const validPassword = await bcrypt.compare(password, user.password_hash);
      if (!validPassword) {
        return res.status(400).json({ error: "Invalid credentials" });
      }

      const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
      const { password_hash, ...userWithoutPassword } = user;
      res.json({ token, user: userWithoutPassword });
    } catch (error) {
      res.status(500).json({ error: "Server error" });
    }
  });

  app.post("/api/auth/reset-password", async (req, res) => {
    // Simplified reset password for demo purposes
    try {
      const { email, newPassword } = req.body;
      const user: any = db.prepare("SELECT * FROM users WHERE email = ?").get(email);
      
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      const password_hash = await bcrypt.hash(newPassword, 10);
      db.prepare("UPDATE users SET password_hash = ? WHERE email = ?").run(password_hash, email);
      
      res.json({ success: true, message: "Password updated successfully" });
    } catch (error) {
      res.status(500).json({ error: "Server error" });
    }
  });

  app.get("/api/auth/me", authenticateToken, (req: any, res: any) => {
    const user: any = db.prepare("SELECT * FROM users WHERE id = ?").get(req.user.id);
    if (!user) return res.status(404).json({ error: "User not found" });
    const { password_hash, ...safeUser } = user;
    res.json({ user: safeUser });
  });

  app.put("/api/users/onboarding", authenticateToken, (req: any, res: any) => {
    const { name, role, goal } = req.body;
    db.prepare("UPDATE users SET name = ?, role = ?, goal = ?, onboarding_completed = 1 WHERE id = ?")
      .run(name, role, goal, req.user.id);
    
    const user = db.prepare("SELECT id, email, name, role, goal, onboarding_completed, notifications_enabled, theme, default_mode FROM users WHERE id = ?").get(req.user.id);
    res.json({ user });
  });

  app.put("/api/users/settings", authenticateToken, (req: any, res: any) => {
    const { 
      notifications_enabled, 
      theme, 
      default_mode,
      bland_api_key,
      twilio_account_sid,
      twilio_auth_token,
      twilio_phone_number,
      elevenlabs_api_key,
      twenty_api_key
    } = req.body;

    db.prepare(`
      UPDATE users SET 
        notifications_enabled = ?, 
        theme = ?, 
        default_mode = ?,
        bland_api_key = ?,
        twilio_account_sid = ?,
        twilio_auth_token = ?,
        twilio_phone_number = ?,
        elevenlabs_api_key = ?,
        twenty_api_key = ?
      WHERE id = ?
    `).run(
      notifications_enabled ? 1 : 0, 
      theme, 
      default_mode, 
      bland_api_key,
      twilio_account_sid,
      twilio_auth_token,
      twilio_phone_number,
      elevenlabs_api_key,
      twenty_api_key,
      req.user.id
    );
    
    const user = db.prepare("SELECT * FROM users WHERE id = ?").get(req.user.id);
    // Remove password hash before sending back
    const { password_hash, ...safeUser } = user as any;
    res.json({ user: safeUser });
  });

  // API Routes
  app.get("/api/projects", authenticateToken, (req: any, res: any) => {
    const projects = db.prepare("SELECT * FROM projects WHERE user_id = ? ORDER BY created_at DESC").all(req.user.id);
    res.json(projects);
  });

  app.post("/api/projects", authenticateToken, (req: any, res: any) => {
    try {
      const { name, description, mode, is_private } = req.body;
      const id = uuidv4();
      db.prepare("INSERT INTO projects (id, name, description, mode, is_private, user_id) VALUES (?, ?, ?, ?, ?, ?)").run(id, name, description, mode || 'create', is_private ? 1 : 0, req.user.id);
      const project = db.prepare("SELECT * FROM projects WHERE id = ?").get(id);
      res.json(project);
    } catch (error: any) {
      console.error("Failed to create project:", error);
      res.status(500).json({ error: error.message || "Failed to create project" });
    }
  });

  app.get("/api/projects/:id", optionalAuthenticateToken, (req: any, res: any) => {
    const project = db.prepare("SELECT * FROM projects WHERE id = ?").get(req.params.id) as any;
    if (!project) return res.status(404).json({ error: "Not found" });
    if (project.is_private === 1 && (!req.user || project.user_id !== req.user.id)) {
      return res.status(403).json({ error: "Access denied" });
    }
    res.json(project);
  });

  app.put("/api/projects/:id", authenticateToken, (req: any, res: any) => {
    const { name, mode, is_private } = req.body;
    const project = db.prepare("SELECT * FROM projects WHERE id = ? AND (user_id = ? OR is_private = 0)").get(req.params.id, req.user.id);
    if (!project) return res.status(404).json({ error: "Project not found" });
    
    if (name !== undefined) {
      db.prepare("UPDATE projects SET name = ? WHERE id = ?").run(name, req.params.id);
    }
    if (mode !== undefined) {
      db.prepare("UPDATE projects SET mode = ? WHERE id = ?").run(mode, req.params.id);
    }
    if (is_private !== undefined) {
      db.prepare("UPDATE projects SET is_private = ? WHERE id = ?").run(is_private ? 1 : 0, req.params.id);
    }
    
    const updatedProject = db.prepare("SELECT * FROM projects WHERE id = ?").get(req.params.id);
    res.json(updatedProject);
  });

  app.delete("/api/projects/:id", authenticateToken, (req: any, res: any) => {
    const project = db.prepare("SELECT * FROM projects WHERE id = ? AND user_id = ?").get(req.params.id, req.user.id);
    if (!project) return res.status(404).json({ error: "Project not found or unauthorized" });

    const deleteProject = db.transaction(() => {
      const cards = db.prepare("SELECT id FROM cards WHERE project_id = ?").all(req.params.id);
      for (const card of cards) {
        db.prepare("DELETE FROM card_comments WHERE card_id = ?").run(card.id);
      }
      db.prepare("DELETE FROM cards WHERE project_id = ?").run(req.params.id);
      db.prepare("DELETE FROM messages WHERE project_id = ?").run(req.params.id);
      db.prepare("DELETE FROM projects WHERE id = ?").run(req.params.id);
    });

    deleteProject();
    res.json({ success: true });
  });

  app.get("/api/projects/:id/cards", optionalAuthenticateToken, (req: any, res: any) => {
    const project = db.prepare("SELECT * FROM projects WHERE id = ?").get(req.params.id) as any;
    if (!project) return res.status(404).json({ error: "Project not found" });
    if (project.is_private === 1 && (!req.user || project.user_id !== req.user.id)) {
      return res.status(403).json({ error: "Access denied" });
    }
    const cards = db.prepare("SELECT cards.* FROM cards WHERE project_id = ?").all(req.params.id);
    res.json(cards);
  });

  app.post("/api/projects/:id/cards", authenticateToken, (req: any, res: any) => {
    const project = db.prepare("SELECT * FROM projects WHERE id = ? AND (user_id = ? OR is_private = 0)").get(req.params.id, req.user.id);
    if (!project) return res.status(404).json({ error: "Project not found" });

    const { title, content, position_x, position_y, phase } = req.body;
    const id = uuidv4();
    db.prepare(
      "INSERT INTO cards (id, project_id, title, content, position_x, position_y, phase) VALUES (?, ?, ?, ?, ?, ?, ?)"
    ).run(id, req.params.id, title, content, position_x || 100, position_y || 100, phase || 1);
    const card = db.prepare("SELECT * FROM cards WHERE id = ?").get(id);
    res.json(card);
  });

  app.put("/api/cards/:id", authenticateToken, (req: any, res: any) => {
    const { title, content } = req.body;
    const card: any = db.prepare("SELECT projects.user_id FROM cards JOIN projects ON cards.project_id = projects.id WHERE cards.id = ?").get(req.params.id);
    if (!card || card.user_id !== req.user.id) return res.status(403).json({ error: "Forbidden" });

    db.prepare("UPDATE cards SET title = ?, content = ? WHERE id = ?").run(title, content, req.params.id);
    res.json({ success: true });
  });

  app.delete("/api/cards/:id", authenticateToken, (req: any, res: any) => {
    const card: any = db.prepare("SELECT projects.user_id FROM cards JOIN projects ON cards.project_id = projects.id WHERE cards.id = ?").get(req.params.id);
    if (!card || card.user_id !== req.user.id) return res.status(403).json({ error: "Forbidden" });

    db.prepare("DELETE FROM card_comments WHERE card_id = ?").run(req.params.id);
    db.prepare("DELETE FROM cards WHERE id = ?").run(req.params.id);
    res.json({ success: true });
  });

  app.put("/api/cards/:id/position", authenticateToken, (req: any, res: any) => {
    const { position_x, position_y } = req.body;
    // Verify ownership
    const card: any = db.prepare("SELECT projects.user_id FROM cards JOIN projects ON cards.project_id = projects.id WHERE cards.id = ?").get(req.params.id);
    if (!card || card.user_id !== req.user.id) return res.status(403).json({ error: "Forbidden" });

    db.prepare("UPDATE cards SET position_x = ?, position_y = ? WHERE id = ?").run(position_x, position_y, req.params.id);
    res.json({ success: true });
  });

  app.get("/api/projects/:id/messages", optionalAuthenticateToken, (req: any, res: any) => {
    const project = db.prepare("SELECT * FROM projects WHERE id = ?").get(req.params.id) as any;
    if (!project) return res.status(404).json({ error: "Project not found" });
    if (project.is_private === 1 && (!req.user || project.user_id !== req.user.id)) {
      return res.status(403).json({ error: "Access denied" });
    }
    const messages = db.prepare("SELECT * FROM messages WHERE project_id = ? ORDER BY created_at ASC").all(req.params.id);
    res.json(messages);
  });

  app.delete("/api/projects/:id/messages", authenticateToken, (req: any, res: any) => {
    const project = db.prepare("SELECT * FROM projects WHERE id = ? AND (user_id = ? OR is_private = 0)").get(req.params.id, req.user.id);
    if (!project) return res.status(404).json({ error: "Project not found" });

    db.prepare("DELETE FROM messages WHERE project_id = ?").run(req.params.id);
    res.json({ success: true });
  });

  app.post("/api/projects/:id/messages", authenticateToken, (req: any, res: any) => {
    const project = db.prepare("SELECT * FROM projects WHERE id = ? AND (user_id = ? OR is_private = 0)").get(req.params.id, req.user.id);
    if (!project) return res.status(404).json({ error: "Project not found" });

    const { role, content, image } = req.body;
    const id = uuidv4();
    db.prepare("INSERT INTO messages (id, project_id, role, content, image) VALUES (?, ?, ?, ?, ?)").run(id, req.params.id, role, content, image || null);
    const message = db.prepare("SELECT * FROM messages WHERE id = ?").get(id);
    res.json(message);
  });

  app.get("/api/cards/:id/comments", authenticateToken, (req: any, res: any) => {
    const comments = db.prepare(`
      SELECT card_comments.*, users.name, users.email 
      FROM card_comments 
      JOIN users ON card_comments.user_id = users.id 
      WHERE card_id = ? 
      ORDER BY created_at ASC
    `).all(req.params.id);
    res.json(comments);
  });

  app.post("/api/cards/:id/comments", authenticateToken, (req: any, res: any) => {
    const { content } = req.body;
    if (!content) return res.status(400).json({ error: "Content is required" });
    
    const id = uuidv4();
    db.prepare("INSERT INTO card_comments (id, card_id, user_id, content) VALUES (?, ?, ?, ?)").run(id, req.params.id, req.user.id, content);
    
    const comment = db.prepare(`
      SELECT card_comments.*, users.name, users.email 
      FROM card_comments 
      JOIN users ON card_comments.user_id = users.id 
      WHERE card_comments.id = ?
    `).get(id);
    res.json(comment);
  });

  // Demo Routes
  app.post("/api/demo/voice-call", authenticateToken, async (req: any, res: any) => {
    const { phoneNumber, agentId, task } = req.body;
    const user: any = db.prepare("SELECT bland_api_key FROM users WHERE id = ?").get(req.user.id);
    
    try {
      const result = await triggerCall(phoneNumber, agentId, task, user?.bland_api_key);
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: "Failed to trigger call" });
    }
  });

  app.post("/api/demo/sms", authenticateToken, async (req: any, res: any) => {
    const { to, body } = req.body;
    const user: any = db.prepare("SELECT twilio_account_sid, twilio_auth_token, twilio_phone_number FROM users WHERE id = ?").get(req.user.id);

    try {
      const result = await sendSMS(to, body, user?.twilio_account_sid, user?.twilio_auth_token, user?.twilio_phone_number);
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: "Failed to send SMS" });
    }
  });

  app.post("/api/crm/sync", authenticateToken, async (req: any, res: any) => {
    const { leadData } = req.body;
    const user: any = db.prepare("SELECT twenty_api_key FROM users WHERE id = ?").get(req.user.id);

    try {
      const result = await syncLead(leadData, user?.twenty_api_key);
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: "Failed to sync lead" });
    }
  });

  app.post("/api/demo/speech", authenticateToken, async (req: any, res: any) => {
    const { text, voiceId } = req.body;
    const user: any = db.prepare("SELECT elevenlabs_api_key FROM users WHERE id = ?").get(req.user.id);

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

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  }

  httpServer.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
