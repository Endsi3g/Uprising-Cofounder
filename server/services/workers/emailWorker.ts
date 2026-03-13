/**
 * emailWorker.ts
 * BullMQ Worker — Envoi asynchrone d'emails via Nodemailer
 *
 * Ce worker tourne en arrière-plan et consomme les jobs de la queue 'uprising-email'.
 * Il est initialisé au démarrage du serveur si UPSTASH_REDIS_URL est défini.
 */

import { Worker, Job } from 'bullmq';
import nodemailer from 'nodemailer';
import { Redis } from 'ioredis';
import type { EmailJobData } from '../queueService.js';

const REDIS_URL = process.env.UPSTASH_REDIS_URL;
const QUEUE_NAME = 'uprising-email';

// ── Transporter Nodemailer ─────────────────────────────────────────────────────

function createTransporter() {
  // SMTP configuré via env vars
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

// ── Processeur de job ──────────────────────────────────────────────────────────

async function processEmailJob(job: Job<EmailJobData>): Promise<void> {
  const { to, subject, html, from } = job.data;

  console.log(`[EmailWorker] 📧 Traitement job ${job.id}: envoi à ${to}`);

  const transporter = createTransporter();

  await transporter.sendMail({
    from: from || process.env.SMTP_FROM || `"Uprising Studio" <noreply@uprisingstudio.ca>`,
    to,
    subject,
    html,
  });

  console.log(`[EmailWorker] ✅ Email envoyé avec succès → ${to}`);
}

// ── Initialisation du Worker ───────────────────────────────────────────────────

export function startEmailWorker(): Worker<EmailJobData> | null {
  if (!REDIS_URL) {
    console.warn('[EmailWorker] UPSTASH_REDIS_URL manquant — worker désactivé.');
    return null;
  }

  const connection = new Redis(REDIS_URL, {
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
    tls: REDIS_URL.startsWith('rediss://') ? {} : undefined,
  });

  const worker = new Worker<EmailJobData>(QUEUE_NAME, processEmailJob, {
    connection,
    concurrency: 5, // Traite jusqu'à 5 emails simultanément
  });

  worker.on('completed', (job) => {
    console.log(`[EmailWorker] ✅ Job ${job.id} complété`);
  });

  worker.on('failed', (job, err) => {
    console.error(`[EmailWorker] ❌ Job ${job?.id} échoué:`, err.message);
  });

  console.log('[EmailWorker] 🟢 Worker email démarré');
  return worker;
}
