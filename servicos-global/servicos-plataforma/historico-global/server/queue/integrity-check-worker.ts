/**
 * integrity-check-worker.ts
 *
 * Job semanal de integridade: recalcula o SHA256 de cada HistoryLog
 * e alerta se o hash armazenado divergir do calculado.
 *
 * Conforme SKILL.md, Barreira 4:
 *   "Job semanal recalcula o hash de todos os logs e alerta via Sentry se houver discrepância."
 *
 * Em produção: substituir console.error por Sentry.captureMessage (ver TODO abaixo).
 */

import { createHash } from 'crypto'
import { getBoss } from './pg-boss.js'
import { PrismaClient } from '../../../generated/index.js'
import { captureMessage } from '../lib/sentry.js'

const prisma = new PrismaClient({ datasources: { db: { url: process.env.ORGANIZACAO_DATABASE_URL } } })

export const INTEGRITY_QUEUE = 'audit:integrity:check'

// Processar em lotes para não travar o banco
const BATCH_SIZE = 500

interface IntegrityCheckJobInput {
  /** Se presente, verifica apenas os logs desta organização. Senão, verifica todos. */
  id_organizacao?: string
  /** Offset para jobs em batches */
  offset?: number
}

interface IntegrityResult {
  checked: number
  tampered: number
  tamperedIds: string[]
}

/**
 * Recalcula o hash de um log com os mesmos campos usados na gravação original.
 * Deve ser idêntico a AuditService.computeIntegrityHash().
 */
function recomputeHash(log: {
  id_organizacao: string
  tipo_ator_historico_log: string
  id_ator_historico_log: string
  modulo_historico_log: string
  tipo_recurso_historico_log: string
  id_recurso_historico_log: string | null
  acao_historico_log: string
  detalhe_acao_historico_log: string
  estado_anterior_historico_log: unknown
  estado_posterior_historico_log: unknown
  status_historico_log: string
  data_criacao_historico_log: Date
}): string {
  const payload = JSON.stringify({
    id_organizacao: log.id_organizacao,
    tipo_ator_historico_log: log.tipo_ator_historico_log,
    id_ator_historico_log: log.id_ator_historico_log,
    modulo_historico_log: log.modulo_historico_log,
    tipo_recurso_historico_log: log.tipo_recurso_historico_log,
    id_recurso_historico_log: log.id_recurso_historico_log ?? null,
    acao_historico_log: log.acao_historico_log,
    detalhe_acao_historico_log: log.detalhe_acao_historico_log,
    estado_anterior_historico_log: log.estado_anterior_historico_log ?? null,
    estado_posterior_historico_log: log.estado_posterior_historico_log ?? null,
    status_historico_log: log.status_historico_log ?? 'SUCESSO',
    data_criacao_historico_log: log.data_criacao_historico_log.toISOString(),
  })
  return createHash('sha256').update(payload).digest('hex')
}

export async function startIntegrityCheckWorker(): Promise<void> {
  const boss = getBoss()

  await boss.work<IntegrityCheckJobInput>(
    INTEGRITY_QUEUE,
    { teamSize: 1, teamConcurrency: 1 }, // single worker — não sobrecarregar o banco
    async (job) => {
      const { id_organizacao, offset = 0 } = job.data

      const result = await checkBatch({ id_organizacao, offset })

      if (result.tampered > 0) {
        captureMessage('INTEGRITY_VIOLATION: logs adulterados detectados', 'fatal', {
          tampered: result.tampered,
          tamperedIds: result.tamperedIds,
          id_organizacao: id_organizacao ?? 'todos',
          offset,
        })
      }

      // Se havia mais registros neste offset, enfileira o próximo batch
      if (result.checked === BATCH_SIZE) {
        await boss.send(INTEGRITY_QUEUE, {
          id_organizacao,
          offset: offset + BATCH_SIZE,
        })
      } else {
        console.log(
          `[integrity-check] Verificação concluída — ${offset + result.checked} logs verificados, ${result.tampered} problema(s)`
        )
      }
    }
  )

  // Garantir que a queue existe antes de agendar
  await boss.createQueue(INTEGRITY_QUEUE).catch(() => { /* já existe */ })

  // Agendar execução semanal via cron PG Boss
  await boss.schedule(INTEGRITY_QUEUE, '0 3 * * 0', {}, { // Domingo 03:00
    tz: 'America/Sao_Paulo',
  })

  console.log('[historico] integrity-check-worker iniciado (cron: domingo 03h BRT)')
}

async function checkBatch(opts: { id_organizacao?: string; offset: number }): Promise<IntegrityResult> {
  const logs = await prisma.historicoLog.findMany({
    where: opts.id_organizacao ? { id_organizacao: opts.id_organizacao } : undefined,
    orderBy: { data_criacao_historico_log: 'asc' },
    skip: opts.offset,
    take: BATCH_SIZE,
    select: {
      id_historico_log: true,
      id_organizacao: true,
      tipo_ator_historico_log: true,
      id_ator_historico_log: true,
      modulo_historico_log: true,
      tipo_recurso_historico_log: true,
      id_recurso_historico_log: true,
      acao_historico_log: true,
      detalhe_acao_historico_log: true,
      estado_anterior_historico_log: true,
      estado_posterior_historico_log: true,
      status_historico_log: true,
      hash_integridade_historico_log: true,
      data_criacao_historico_log: true,
    },
  })

  const tamperedIds: string[] = []

  for (const log of logs) {
    const expected = recomputeHash(log)
    if (expected !== log.hash_integridade_historico_log) {
      tamperedIds.push(log.id_historico_log)
    }
  }

  return {
    checked: logs.length,
    tampered: tamperedIds.length,
    tamperedIds,
  }
}

/**
 * Dispara uma verificação de integridade imediata para uma organização específica.
 * Útil para investigações manuais ou testes.
 */
export async function triggerIntegrityCheck(id_organizacao?: string): Promise<void> {
  const boss = getBoss()
  await boss.send(INTEGRITY_QUEUE, { id_organizacao, offset: 0 })
  console.log(`[integrity-check] Verificação manual disparada para id_organizacao: ${id_organizacao ?? 'todos'}`)
}
