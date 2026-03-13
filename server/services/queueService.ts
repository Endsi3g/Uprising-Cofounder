/**
 * queueService.ts
 * BullMQ + Upstash Redis — Service de file d'attente asynchrone
 *
 * Utiliser UPSTASH_REDIS_URL (format: rediss://default:TOKEN@host:PORT)
 * Compatible avec le tier gratuit Upstash.
 */

import { Queue, Worker, QueueEvents, Job } from 'bullmq';
import { Redis } from 'ioredis';

// ── Connexion Redis ────────────────────────────────────────────────────────────

const REDIS_URL = process.env.UPSTASH_REDIS_URL;

let connection: Redis | null = null;

function getRedisConnection(): Redis | null {
  if (!REDIS_URL) {
    console.warn('[Queue] UPSTASH_REDIS_URL non défini — file d\'attente désactivée.');
    return null;
  }

  if (connection) return connection;

  connection = new Redis(REDIS_URL, {
    maxRetriesPerRequest: null, // Requis pour BullMQ
    enableReadyCheck: false,
    tls: REDIS_URL.startsWith('rediss://') ? {} : undefined,
  });

  connection.on('connect', () => console.log('[Queue] ✅ Redis connecté'));
  connection.on('error', (err) => console.error('[Queue] ❌ Redis erreur:', err.message));

  return connection;
}

// ── Types de jobs ──────────────────────────────────────────────────────────────

export interface EmailJobData {
  to: string;
  subject: string;
  html: string;
  from?: string;
}

export interface ReportJobData {
  userId: string;
  reportType: 'market' | 'financial' | 'pitch';
  projectId?: string;
  options?: Record<string, unknown>;
}

// ── Noms des queues ────────────────────────────────────────────────────────────

export const QUEUE_NAMES = {
  EMAIL: 'uprising-email',
  REPORT: 'uprising-report',
} as const;

// ── Factory de Queue ───────────────────────────────────────────────────────────

function createQueue<T>(name: string): Queue<T> | null {
  const conn = getRedisConnection();
  if (!conn) return null;

  return new Queue<T>(name, {
    connection: conn,
    defaultJobOptions: {
      attempts: 3,
      backoff: { type: 'exponential', delay: 2000 },
      removeOnComplete: { count: 100 },
      removeOnFail: { count: 50 },
    },
  });
}

// ── Queues exportées ───────────────────────────────────────────────────────────

export const emailQueue = createQueue<EmailJobData>(QUEUE_NAMES.EMAIL);
export const reportQueue = createQueue<ReportJobData>(QUEUE_NAMES.REPORT);

// ── Helper: ajouter un job email ───────────────────────────────────────────────

export async function enqueueEmail(data: EmailJobData, priority = 0): Promise<string | null> {
  if (!emailQueue) {
    console.warn('[Queue] Email queue désactivée — envoi direct requis.');
    return null;
  }
  const job = await emailQueue.add('send-email', data, { priority });
  console.log(`[Queue] 📧 Email enqueued → job ID: ${job.id} (to: ${data.to})`);
  return job.id ?? null;
}

// ── Helper: ajouter un job rapport ────────────────────────────────────────────

export async function enqueueReport(data: ReportJobData): Promise<string | null> {
  if (!reportQueue) {
    console.warn('[Queue] Report queue désactivée.');
    return null;
  }
  const job = await reportQueue.add('generate-report', data, { delay: 0 });
  console.log(`[Queue] 📊 Report enqueued → job ID: ${job.id} (user: ${data.userId})`);
  return job.id ?? null;
}

// ── Graceful shutdown ──────────────────────────────────────────────────────────

export async function closeQueues(): Promise<void> {
  await emailQueue?.close();
  await reportQueue?.close();
  await connection?.quit();
  console.log('[Queue] Connexions Redis fermées proprement.');
}
