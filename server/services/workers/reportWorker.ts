/**
 * reportWorker.ts
 * BullMQ Worker — Génération asynchrone de rapports lourds
 *
 * Ce worker consomme les jobs de la queue 'uprising-report'.
 * Utilisé pour la génération de pitch decks, analyses de marché,
 * et modèles financiers qui peuvent prendre plusieurs secondes.
 */

import { Worker, Job } from 'bullmq';
import { Redis } from 'ioredis';
import type { ReportJobData } from '../queueService.js';

const REDIS_URL = process.env.UPSTASH_REDIS_URL;
const QUEUE_NAME = 'uprising-report';

// ── Processeur de job ──────────────────────────────────────────────────────────

async function processReportJob(job: Job<ReportJobData>): Promise<Record<string, unknown>> {
  const { userId, reportType, projectId, options } = job.data;

  console.log(`[ReportWorker] 📊 Traitement job ${job.id}: type=${reportType}, user=${userId}`);

  // Mettre à jour la progression
  await job.updateProgress(10);

  // Import dynamique pour éviter les imports circulaires
  const { generatePitchDeck, generateMarketAnalysis, generateFinancialModel } = await import('../aiService.js');

  let result: unknown;

  await job.updateProgress(30);

  switch (reportType) {
    case 'pitch':
      result = await generatePitchDeck({ userId, projectId, ...options } as any);
      break;
    case 'market':
      result = await generateMarketAnalysis({ userId, projectId, ...options } as any);
      break;
    case 'financial':
      result = await generateFinancialModel({ userId, projectId, ...options } as any);
      break;
    default:
      throw new Error(`Type de rapport inconnu: ${reportType}`);
  }

  await job.updateProgress(100);

  console.log(`[ReportWorker] ✅ Rapport ${reportType} généré pour user ${userId}`);

  return { success: true, reportType, userId, result };
}

// ── Initialisation du Worker ───────────────────────────────────────────────────

export function startReportWorker(): Worker<ReportJobData> | null {
  if (!REDIS_URL) {
    console.warn('[ReportWorker] UPSTASH_REDIS_URL manquant — worker désactivé.');
    return null;
  }

  const connection = new Redis(REDIS_URL, {
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
    tls: REDIS_URL.startsWith('rediss://') ? {} : undefined,
  });

  const worker = new Worker<ReportJobData>(QUEUE_NAME, processReportJob, {
    connection: connection as any,
    concurrency: 2, // Rapports lourds: limiter la concurrence
    limiter: {
      max: 10,
      duration: 60_000, // Max 10 rapports par minute
    },
  });

  worker.on('completed', (job, result) => {
    console.log(`[ReportWorker] ✅ Job ${job.id} complété (${result?.reportType})`);
  });

  worker.on('failed', (job, err) => {
    console.error(`[ReportWorker] ❌ Job ${job?.id} échoué:`, err.message);
  });

  worker.on('progress', (job, progress) => {
    console.log(`[ReportWorker] 📈 Job ${job.id} progression: ${progress}%`);
  });

  console.log('[ReportWorker] 🟢 Worker rapports démarré');
  return worker;
}
