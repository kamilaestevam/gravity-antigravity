import { mkdirSync, writeFileSync } from 'fs'
import { join } from 'path'
import { tmpdir } from 'os'
import { getBoss } from './pg-boss.js'
import { PrismaClient, Prisma } from '../../../generated/index.js'

// Lazy initialization — evita ESM hoisting ler process.env antes do dotenv.config()
let _prisma: PrismaClient | undefined
function getPrisma(): PrismaClient {
  if (!_prisma) {
    _prisma = new PrismaClient({ datasources: { db: { url: process.env.ORGANIZACAO_DATABASE_URL } } })
  }
  return _prisma
}

export const EXPORT_QUEUE = 'audit:log:export'
export const EXPORT_DIR = join(tmpdir(), 'gravity-exports')

export interface ExportJobInput {
  jobId: string
  id_organizacao: string
  formato_exportar_resultado: 'csv' | 'json'
  filters: {
    tipo_ator_historico_log?: string
    modulo_historico_log?: string
    acao_historico_log?: string
    status_historico_log?: string
    startDate?: string
    endDate?: string
  }
}

const CSV_HEADERS = [
  'id_historico_log', 'data_criacao_historico_log', 'id_organizacao',
  'tipo_ator_historico_log', 'id_ator_historico_log', 'nome_ator_historico_log',
  'ip_ator_historico_log', 'modulo_historico_log', 'tipo_recurso_historico_log', 'id_recurso_historico_log',
  'acao_historico_log', 'detalhe_acao_historico_log', 'status_historico_log',
]

export async function startExportWorker(): Promise<void> {
  const boss = getBoss()

  mkdirSync(EXPORT_DIR, { recursive: true })

  await boss.work<ExportJobInput>(
    EXPORT_QUEUE,
    { teamSize: 2, teamConcurrency: 2 },
    async (job) => {
      const { jobId, id_organizacao, formato_exportar_resultado, filters } = job.data

      const where: Prisma.HistoricoLogWhereInput = {
        id_organizacao,
        ...(filters.tipo_ator_historico_log ? { tipo_ator_historico_log: filters.tipo_ator_historico_log as any } : {}),
        ...(filters.modulo_historico_log ? { modulo_historico_log: filters.modulo_historico_log } : {}),
        ...(filters.acao_historico_log ? { acao_historico_log: filters.acao_historico_log } : {}),
        ...(filters.status_historico_log ? { status_historico_log: filters.status_historico_log as any } : {}),
        ...(filters.startDate || filters.endDate
          ? {
              data_criacao_historico_log: {
                ...(filters.startDate ? { gte: new Date(filters.startDate) } : {}),
                ...(filters.endDate ? { lte: new Date(filters.endDate) } : {}),
              },
            }
          : {}),
      }

      const logs = await getPrisma().historicoLog.findMany({
        where,
        orderBy: { data_criacao_historico_log: 'desc' },
      })

        let content: string
      if (formato_exportar_resultado === 'json') {
        content = JSON.stringify(logs, null, 2)
      } else {
        const rows = logs.map((l) =>
          [
            l.id_historico_log, l.data_criacao_historico_log.toISOString(), l.id_organizacao,
            l.tipo_ator_historico_log, l.id_ator_historico_log,
            l.nome_ator_historico_log, l.ip_ator_historico_log ?? '', l.modulo_historico_log,
            l.tipo_recurso_historico_log, l.id_recurso_historico_log ?? '',
            l.acao_historico_log, `"${l.detalhe_acao_historico_log.replace(/"/g, '""')}"`, l.status_historico_log,
          ].join(',')
        )
        content = [CSV_HEADERS.join(','), ...rows].join('\n')
      }

      // Ponto Cego 6 — persistir no banco (sobrevive a restarts do Railway)
      // Fallback para filesystem se a migração ainda não rodou (ExportResult não existe)
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24h
      try {
        await (getPrisma() as any).exportarResultado.upsert({
          where: { id_exportar_resultado: jobId },
          create: {
            id_exportar_resultado: jobId,
            id_organizacao,
            formato_exportar_resultado,
            conteudo_exportar_resultado: content,
            status_exportar_resultado: 'ready',
            contagem_registros_exportar_resultado: logs.length,
            filtros_exportar_resultado: job.data.filters as object,
            expira_em_exportar_resultado: expiresAt,
          },
          update: {
            conteudo_exportar_resultado: content,
            status_exportar_resultado: 'ready',
            contagem_registros_exportar_resultado: logs.length,
            expira_em_exportar_resultado: expiresAt,
          },
        })
      } catch {
        // Fallback: filesystem (desenvolvimento / antes da migração)
        mkdirSync(EXPORT_DIR, { recursive: true })
        writeFileSync(join(EXPORT_DIR, `${jobId}.${formato_exportar_resultado}`), content, 'utf-8')
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
 * Deleta ExportResult cujo expira_em_exportar_resultado já passou.
 * Roda uma vez na inicialização e depois a cada hora.
 */
function startExportCleanupJob(): void {
  const run = async () => {
    try {
      const deleted = await (getPrisma() as any).exportarResultado.deleteMany({
        where: { expira_em_exportar_resultado: { lt: new Date() } },
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
