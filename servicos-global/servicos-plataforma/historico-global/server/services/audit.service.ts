import { createHash } from 'crypto'
import { PrismaClient, AcaoExecutadaPor, EventoStatus } from '../../../generated/index.js'
import { getBoss } from '../queue/pg-boss.js'
import { captureException, captureMessage } from '../lib/sentry.js'

let _prisma: PrismaClient | null = null
function getPrisma(): PrismaClient {
  if (!_prisma) {
    _prisma = new PrismaClient({
      datasources: { db: { url: process.env.ORGANIZACAO_DATABASE_URL } },
    })
  }
  return _prisma
}

export const AUDIT_QUEUE = 'audit:log:ingestion'

export interface AuditLogInput {
  id_organizacao: string

  tipo_ator_historico_log: AcaoExecutadaPor
  id_ator_historico_log: string
  nome_ator_historico_log: string
  ip_ator_historico_log?: string
  metadata_ator_historico_log?: Record<string, unknown>

  modulo_historico_log: string
  tipo_recurso_historico_log: string
  id_recurso_historico_log?: string

  acao_historico_log: string
  detalhe_acao_historico_log: string

  estado_anterior_historico_log?: unknown
  estado_posterior_historico_log?: unknown

  status_historico_log?: EventoStatus
  mensagem_erro_historico_log?: string

  id_produto_historico_log?: string
  id_usuario?: string
}

export function computeIntegrityHash(input: AuditLogInput, createdAt: Date): string {
  const payload = JSON.stringify({
    id_organizacao: input.id_organizacao,
    tipo_ator_historico_log: input.tipo_ator_historico_log,
    id_ator_historico_log: input.id_ator_historico_log,
    modulo_historico_log: input.modulo_historico_log,
    tipo_recurso_historico_log: input.tipo_recurso_historico_log,
    id_recurso_historico_log: input.id_recurso_historico_log ?? null,
    acao_historico_log: input.acao_historico_log,
    detalhe_acao_historico_log: input.detalhe_acao_historico_log,
    estado_anterior_historico_log: input.estado_anterior_historico_log ?? null,
    estado_posterior_historico_log: input.estado_posterior_historico_log ?? null,
    status_historico_log: input.status_historico_log ?? 'SUCESSO',
    data_criacao_historico_log: createdAt.toISOString(),
  })
  return createHash('sha256').update(payload).digest('hex')
}

/**
 * Computa diff campo a campo entre dois snapshots de objeto.
 * Útil para serviços que precisam de diffs precisos no estado anterior/posterior.
 *
 * Exemplo:
 *   const { before, after } = AuditService.computeDiff(entityBefore, entityAfter)
 *   await AuditService.log({ ..., estado_anterior_historico_log: before, estado_posterior_historico_log: after })
 */
export function computeDiff<T extends Record<string, unknown>>(
  before: T,
  after: T
): { before: Partial<T>; after: Partial<T>; changed: boolean } {
  const allKeys = Array.from(new Set([...Object.keys(before), ...Object.keys(after)])) as (keyof T)[]
  const changedBefore: Partial<T> = {}
  const changedAfter: Partial<T> = {}

  for (const key of allKeys) {
    if (JSON.stringify(before[key]) !== JSON.stringify(after[key])) {
      changedBefore[key] = before[key]
      changedAfter[key] = after[key]
    }
  }

  return {
    before: changedBefore,
    after: changedAfter,
    changed: Object.keys(changedBefore).length > 0,
  }
}

/**
 * AuditService.log() — único ponto de gravação de audit logs.
 * Encaminha para a fila PG Boss (nunca bloqueia a operação principal).
 * Retorna imediatamente após enfileirar.
 *
 * Em caso de falha: emite alerta crítico via console.error (integrar Sentry em produção).
 * O log é perdido — monitorar a métrica `[AuditService] FALHA_CRITICA` no APM.
 */
export const AuditService = {
  async log(input: AuditLogInput): Promise<void> {
    try {
      const boss = getBoss()
      await boss.send(AUDIT_QUEUE, input, {
        retryLimit: 3,
        retryDelay: 5,
        retryBackoff: true,
      })
    } catch (error) {
      console.error('[AuditService] boss.send falhou:', (error as Error).message)
      // Fallback: persistir diretamente se a fila falhar
      try {
        await AuditService.persist(input)
      } catch (persistError) {
        console.error('[AuditService] persist direto falhou:', (persistError as Error).message)
        captureException(persistError, {
          tag: 'audit_queue_failure',
          id_organizacao: input.id_organizacao,
          id_ator_historico_log: input.id_ator_historico_log,
          acao_historico_log: input.acao_historico_log,
          modulo_historico_log: input.modulo_historico_log,
        })
      }
    }
  },

  /**
   * Persistência direta — chamada pelo worker, nunca pelos serviços.
   */
  async persist(input: AuditLogInput): Promise<string> {
    const createdAt = new Date()
    const hash_integridade_historico_log = computeIntegrityHash(input, createdAt)

    const log = await getPrisma().historicoLog.create({
      data: {
        id_organizacao: input.id_organizacao,
        tipo_ator_historico_log: input.tipo_ator_historico_log,
        id_ator_historico_log: input.id_ator_historico_log,
        nome_ator_historico_log: input.nome_ator_historico_log,
        ip_ator_historico_log: input.ip_ator_historico_log ?? null,
        metadata_ator_historico_log: (input.metadata_ator_historico_log as object) ?? null,
        modulo_historico_log: input.modulo_historico_log,
        tipo_recurso_historico_log: input.tipo_recurso_historico_log,
        id_recurso_historico_log: input.id_recurso_historico_log ?? null,
        acao_historico_log: input.acao_historico_log,
        detalhe_acao_historico_log: input.detalhe_acao_historico_log,
        estado_anterior_historico_log: (input.estado_anterior_historico_log as object) ?? null,
        estado_posterior_historico_log: (input.estado_posterior_historico_log as object) ?? null,
        status_historico_log: input.status_historico_log ?? EventoStatus.SUCESSO,
        mensagem_erro_historico_log: input.mensagem_erro_historico_log ?? null,
        hash_integridade_historico_log,
        id_produto_historico_log: input.id_produto_historico_log ?? null,
        id_usuario: input.id_usuario ?? null,
        data_criacao_historico_log: createdAt,
      },
    })

    return log.id_historico_log
  },
}
