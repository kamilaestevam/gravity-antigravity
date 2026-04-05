import { mkdirSync, writeFileSync } from 'fs'
import { join } from 'path'
import { tmpdir } from 'os'
import { getBoss } from './pg-boss.js'
import { PrismaClient, Prisma } from '../../../generated/index.js'

const prisma = new PrismaClient({ datasources: { db: { url: process.env.TENANT_DATABASE_URL } } })

export const EXPORT_QUEUE = 'audit:log:export'
export const EXPORT_DIR = join(tmpdir(), 'gravity-exports')

export interface ExportJobInput {
  jobId: string
  tenant_id: string
  format: 'csv' | 'json'
  filters: {
    actor_type?: string
    module?: string
    action?: string
    status?: string
    startDate?: string
    endDate?: string
  }
}

const CSV_HEADERS = [
  'id', 'created_at', 'tenant_id', 'actor_type', 'actor_id', 'actor_name',
  'actor_ip', 'module', 'resource_type', 'resource_id',
  'action', 'action_detail', 'status',
]

export async function startExportWorker(): Promise<void> {
  const boss = getBoss()

  mkdirSync(EXPORT_DIR, { recursive: true })

  await boss.work<ExportJobInput>(
    EXPORT_QUEUE,
    { teamSize: 2, teamConcurrency: 2 },
    async (job) => {
      const { jobId, tenant_id, format, filters } = job.data

      const where: Prisma.HistoryLogWhereInput = {
        tenant_id,
        ...(filters.actor_type ? { actor_type: filters.actor_type as any } : {}),
        ...(filters.module ? { module: filters.module } : {}),
        ...(filters.action ? { action: filters.action } : {}),
        ...(filters.status ? { status: filters.status as any } : {}),
        ...(filters.startDate || filters.endDate
          ? {
              created_at: {
                ...(filters.startDate ? { gte: new Date(filters.startDate) } : {}),
                ...(filters.endDate ? { lte: new Date(filters.endDate) } : {}),
              },
            }
          : {}),
      }

      const logs = await prisma.historyLog.findMany({
        where,
        orderBy: { created_at: 'desc' },
      })

        let content: string
      if (format === 'json') {
        content = JSON.stringify(logs, null, 2)
      } else {
        const rows = logs.map((l) =>
          [
            l.id, l.created_at.toISOString(), l.tenant_id, l.actor_type, l.actor_id,
            l.actor_name, l.actor_ip ?? '', l.module, l.resource_type, l.resource_id ?? '',
            l.action, `"${l.action_detail.replace(/"/g, '""')}"`, l.status,
          ].join(',')
        )
        content = [CSV_HEADERS.join(','), ...rows].join('\n')
      }

      // Ponto Cego 6 — persistir no banco (sobrevive a restarts do Railway)
      // Fallback para filesystem se a migração ainda não rodou (ExportResult não existe)
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24h
      try {
        await (prisma as any).exportResult.upsert({
          where: { id: jobId },
          create: {
            id: jobId,
            tenant_id,
            format,
            content,
            status: 'ready',
            record_count: logs.length,
            filters: job.data.filters as object,
            expires_at: expiresAt,
          },
          update: {
            content,
            status: 'ready',
            record_count: logs.length,
            expires_at: expiresAt,
          },
        })
      } catch {
        // Fallback: filesystem (desenvolvimento / antes da migração)
        mkdirSync(EXPORT_DIR, { recursive: true })
        writeFileSync(join(EXPORT_DIR, `${jobId}.${format}`), content, 'utf-8')
      }

      console.log(`[export-worker] Exportação ${jobId} concluída — ${logs.length} registros`)
    }
  )

  // Cleanup job: remove ExportResult expirados a cada hora
  startExportCleanupJob()

  console.log('[historico] export-worker iniciado')
}

// Intervalo de cleanup: 1 hora
const CLEANUP_INTERVAL_MS = 60 * 60 * 1000

/**
 * Deleta ExportResult cujo expires_at já passou.
 * Roda uma vez na inicialização e depois a cada hora.
 */
function startExportCleanupJob(): void {
  const run = async () => {
    try {
      const deleted = await (prisma as any).exportResult.deleteMany({
        where: { expires_at: { lt: new Date() } },
      })
      if (deleted.count > 0) {
        console.log(`[export-worker] Cleanup: ${deleted.count} exportação(ões) expirada(s) removida(s)`)
      }
    } catch {
      // Tabela ainda não existe — silencioso
    }
  }

  // Roda imediatamente no boot para limpar expirados de restarts anteriores
  run()

  const interval = setInterval(run, CLEANUP_INTERVAL_MS)
  if (interval.unref) interval.unref()
}
