import { Request, Response, NextFunction } from 'express'
import { existsSync, readFileSync } from 'fs'
import { join } from 'path'
import { randomUUID } from 'crypto'
import { PrismaClient, Prisma } from '../../../generated/index.js'
import { AppError } from '../lib/errors.js'
import {
  IngestHistorySchema,
  ListHistoryQuerySchema,
  ExportHistoryQuerySchema,
} from '../schemas/history.schema.js'
import { AuditService } from '../services/audit.service.js'
import { buildVisibilityFilter, extractAuthUser } from '../lib/visibility.js'
import { securityAudit } from '../lib/securityAuditLogger.js'
import { getBoss } from '../queue/pg-boss.js'
import { EXPORT_QUEUE, EXPORT_DIR } from '../queue/export-worker.js'

// Augmentação do Express.Request com req.auth injetado pelo middleware
// requireAuth do configurador (ver configurador/server/middleware/requireAuth.ts).
// Precisa ser idêntica à declaração do configurador para merge de tipos funcionar.
// Chamadas à historico-global que não passam por requireAuth (ex: internas com
// x-internal-key) devem usar x-id-organizacao header explicitamente.
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      auth: {
        id_usuario: string
        id_organizacao: string
        clerkUserId: string
        tipo_usuario: string
      }
    }
  }
}

/** Tipos de ator permitidos por chamadas com x-internal-key (serviços internos). */
const INTERNAL_ALLOWED_ACTOR_TYPES = new Set(['IA', 'API', 'JOB', 'INTEGRACAO'])

/** Metadados de job do PG Boss (tipagem local — a lib não exporta este shape). */
interface PgBossJobMeta {
  createdon?: string | Date
  completedon?: string | Date
}

let _prisma: PrismaClient | null = null
function getPrisma(): PrismaClient {
  if (!_prisma) _prisma = new PrismaClient({ datasources: { db: { url: process.env.ORGANIZACAO_DATABASE_URL } } })
  return _prisma
}
const INTERNAL_KEY = process.env.INTERNAL_SERVICE_KEY ?? ''

/** Limite superior do tamanho de página para queries de listagem. */
const MAX_PAGE_SIZE = 200

/** Extrai id_organizacao do request (header x-id-organizacao ou req.auth do middleware). */
function getIdOrganizacao(req: Request): string {
  // req.auth pode estar ausente em rotas com x-internal-key (chamadas inter-serviço)
  const authIdOrganizacao = (req as { auth?: { id_organizacao?: string } }).auth?.id_organizacao
  const idOrganizacao = (req.headers['x-id-organizacao'] as string) || authIdOrganizacao
  if (!idOrganizacao) throw AppError.unauthorized('id_organizacao obrigatório')
  return idOrganizacao
}

/** Extrai userId do req.auth se presente (null em chamadas internas). */
function getAuthUserId(req: Request): string | null {
  return (req as { auth?: { id_usuario?: string } }).auth?.id_usuario ?? null
}

// POST /logs
export async function ingestLog(req: Request, res: Response, next: NextFunction) {
  try {
    const id_organizacao = getIdOrganizacao(req)

    const parsed = IngestHistorySchema.safeParse(req.body)
    if (!parsed.success) throw AppError.validation(parsed.error.issues[0].message)

    // Ponto C — validar que id_ator_historico_log corresponde ao usuário autenticado.
    // Chamadas internas (x-internal-key) só podem gravar tipo_ator_historico_log ∈ {IA, API, JOB, INTEGRACAO}
    // — nunca USUARIO (um serviço interno não deve fingir ser um humano específico).
    const isInternalCall = req.headers['x-internal-key'] === INTERNAL_KEY && !!INTERNAL_KEY
    const authUserId = getAuthUserId(req)

    if (isInternalCall) {
      if (!INTERNAL_ALLOWED_ACTOR_TYPES.has(parsed.data.tipo_ator_historico_log)) {
        setImmediate(() => {
          securityAudit.crossTenantAttempt(id_organizacao, 'internal-service', {
            targetTenantId: id_organizacao,
            resource: `audit_log:invalid_internal_actor_type:${parsed.data.tipo_ator_historico_log}`,
            blocked: true,
          })
        })
        throw AppError.forbidden(
          `Chamadas internas só podem gravar tipo_ator_historico_log ∈ {IA, API, JOB, INTEGRACAO} — recebido: ${parsed.data.tipo_ator_historico_log}`
        )
      }
    } else if (
      authUserId &&
      parsed.data.tipo_ator_historico_log === 'USUARIO' &&
      parsed.data.id_ator_historico_log !== authUserId
    ) {
      setImmediate(() => {
        securityAudit.crossTenantAttempt(id_organizacao, authUserId, {
          targetTenantId: id_organizacao,
          resource: 'audit_log:actor_id_spoof',
          blocked: true,
        })
      })
      throw AppError.forbidden('id_ator_historico_log não corresponde ao usuário autenticado')
    }

    await AuditService.log({ id_organizacao, ...parsed.data })

    return res.status(202).json({ accepted: true })
  } catch (error) {
    next(error)
  }
}

// GET /logs
export async function listLogs(req: Request, res: Response, next: NextFunction) {
  try {
    const id_organizacao = getIdOrganizacao(req)

    const parsed = ListHistoryQuerySchema.safeParse(req.query)
    if (!parsed.success) throw AppError.validation(parsed.error.issues[0].message)

    const q = parsed.data
    // Cap de segurança: impede payloads gigantes de clientes maliciosos
    const safeLimit = Math.min(q.limit ?? 50, MAX_PAGE_SIZE)

    const user = extractAuthUser(req)

    // Ponto Cego 3 — detectar tentativa de ler dados de outra organização explicitamente
    const requestedIdOrganizacao = req.query.id_organizacao as string | undefined
    if (
      requestedIdOrganizacao &&
      user &&
      requestedIdOrganizacao !== user.id_organizacao &&
      user.role !== 'SUPER_ADMIN' &&
      user.role !== 'ADMIN'
    ) {
      setImmediate(() => {
        securityAudit.crossTenantAttempt(user.id_organizacao, user.id, {
          targetTenantId: requestedIdOrganizacao,
          resource: 'history_log:list',
          blocked: true,
        })
      })
      throw AppError.forbidden('Acesso negado a dados de outra organização')
    }

    const visibilityFilter = user
      ? buildVisibilityFilter(user)
      : { id_organizacao }

    // Construir filtro de data unificado (evita conflito de chave entre cursor e range)
    const createdAtFilter: Prisma.DateTimeFilter<'HistoricoLog'> = {}
    if (q.cursor) createdAtFilter.lt = new Date(q.cursor)
    if (q.startDate) createdAtFilter.gte = new Date(q.startDate)
    if (q.endDate) createdAtFilter.lte = new Date(q.endDate)

    const where: Prisma.HistoricoLogWhereInput = {
      ...visibilityFilter,
      ...(q.tipo_ator_historico_log ? { tipo_ator_historico_log: q.tipo_ator_historico_log } : {}),
      ...(q.id_ator_historico_log ? { id_ator_historico_log: q.id_ator_historico_log } : {}),
      ...(q.modulo_historico_log ? { modulo_historico_log: q.modulo_historico_log } : {}),
      ...(q.tipo_recurso_historico_log ? { tipo_recurso_historico_log: q.tipo_recurso_historico_log } : {}),
      ...(q.id_recurso_historico_log ? { id_recurso_historico_log: q.id_recurso_historico_log } : {}),
      ...(q.acao_historico_log ? { acao_historico_log: q.acao_historico_log } : {}),
      ...(q.status_historico_log ? { status_historico_log: q.status_historico_log } : {}),
      ...(q.id_produto_historico_log ? { id_produto_historico_log: q.id_produto_historico_log } : {}),
      ...(Object.keys(createdAtFilter).length > 0 ? { data_criacao_historico_log: createdAtFilter } : {}),
      ...(q.search
        ? {
            OR: [
              { detalhe_acao_historico_log: { contains: q.search, mode: 'insensitive' } },
              { nome_ator_historico_log: { contains: q.search, mode: 'insensitive' } },
              { tipo_recurso_historico_log: { contains: q.search, mode: 'insensitive' } },
            ],
          }
        : {}),
    }

    const logs = await getPrisma().historicoLog.findMany({
      where,
      orderBy: { data_criacao_historico_log: 'desc' },
      take: safeLimit + 1, // +1 para saber se há próxima página
    })

    const hasMore = logs.length > safeLimit
    const data = hasMore ? logs.slice(0, safeLimit) : logs
    const nextCursor = hasMore ? data[data.length - 1].data_criacao_historico_log.toISOString() : null

    res.json({ data, meta: { hasMore, nextCursor, limit: safeLimit } })
  } catch (error) {
    next(error)
  }
}

// GET /logs/:id
export async function getLogById(req: Request, res: Response, next: NextFunction) {
  try {
    const id_organizacao = getIdOrganizacao(req)

    const user = extractAuthUser(req)
    const visibilityFilter = user ? buildVisibilityFilter(user) : { id_organizacao }

    const log = await getPrisma().historicoLog.findFirst({
      where: { id_historico_log: req.params.id, ...visibilityFilter },
    })

    if (!log) {
      // Ponto Cego 3 — verificar se o log existe mas foi bloqueado por visibilidade (cross-organizacao)
      if (user && (user.role === 'STANDARD' || user.role === 'SUPPLIER')) {
        const exists = await getPrisma().historicoLog.count({ where: { id_historico_log: req.params.id } })
        if (exists > 0) {
          setImmediate(() => {
            securityAudit.crossTenantAttempt(user.id_organizacao, user.id, {
              targetTenantId: 'unknown',
              resource: `history_log:${req.params.id}`,
              blocked: true,
            })
          })
        }
      }
      throw AppError.notFound('Log')
    }

    // Ponto Cego 1 — logar acesso a registro individual sensível (assíncrono)
    if (user) {
      setImmediate(() => {
        AuditService.log({
          id_organizacao,
          tipo_ator_historico_log: 'USUARIO',
          id_ator_historico_log: user.id,
          nome_ator_historico_log: user.id,
          ip_ator_historico_log: req.ip,
          modulo_historico_log: 'historico',
          tipo_recurso_historico_log: 'HistoryLog',
          id_recurso_historico_log: log.id_historico_log,
          acao_historico_log: 'VISUALIZACAO',
          detalhe_acao_historico_log: `Visualizou log de auditoria #${log.id_historico_log} (${log.acao_historico_log} em ${log.modulo_historico_log})`,
          status_historico_log: 'SUCESSO',
          id_usuario: user.id,
        }).catch(() => {})
      })
    }

    res.json(log)
  } catch (error) {
    next(error)
  }
}

// GET /logs/export
export async function exportLogs(req: Request, res: Response, next: NextFunction) {
  try {
    const id_organizacao = getIdOrganizacao(req)

    const parsed = ExportHistoryQuerySchema.safeParse(req.query)
    if (!parsed.success) throw AppError.validation(parsed.error.issues[0].message)

    const q = parsed.data
    const user = extractAuthUser(req)
    const visibilityFilter = user ? buildVisibilityFilter(user) : { id_organizacao }

    const where: Prisma.HistoricoLogWhereInput = {
      ...visibilityFilter,
      ...(q.tipo_ator_historico_log ? { tipo_ator_historico_log: q.tipo_ator_historico_log } : {}),
      ...(q.modulo_historico_log ? { modulo_historico_log: q.modulo_historico_log } : {}),
      ...(q.acao_historico_log ? { acao_historico_log: q.acao_historico_log } : {}),
      ...(q.status_historico_log ? { status_historico_log: q.status_historico_log } : {}),
      ...(q.startDate || q.endDate
        ? {
            data_criacao_historico_log: {
              ...(q.startDate ? { gte: new Date(q.startDate) } : {}),
              ...(q.endDate ? { lte: new Date(q.endDate) } : {}),
            },
          }
        : {}),
    }

    const count = await getPrisma().historicoLog.count({ where })

    if (count > 10_000) {
      // Enfileira job de exportação via PG Boss
      const jobId = randomUUID()
      const boss = getBoss()
      await boss.send(EXPORT_QUEUE, {
        jobId,
        id_organizacao,
        formato_exportar_resultado: q.formato_exportar_resultado,
        filters: {
          tipo_ator_historico_log: q.tipo_ator_historico_log,
          modulo_historico_log: q.modulo_historico_log,
          acao_historico_log: q.acao_historico_log,
          status_historico_log: q.status_historico_log,
          startDate: q.startDate,
          endDate: q.endDate,
        },
      })

      return res.status(202).json({
        jobId,
        message: `Exportação em background iniciada (${count} registros). Verifique o status em /logs/export/${jobId}/status`,
        statusUrl: `/api/v1/historico/logs/export/${jobId}/status`,
        downloadUrl: `/api/v1/historico/logs/export/${jobId}/download`,
        count,
      })
    }

    const logs = await getPrisma().historicoLog.findMany({
      where,
      orderBy: { data_criacao_historico_log: 'desc' },
    })

    if (q.formato_exportar_resultado === 'json') {
      res.setHeader('Content-Type', 'application/json')
      res.setHeader('Content-Disposition', 'attachment; filename="audit-logs.json"')
      return res.json(logs)
    }

    // CSV síncrono (≤10k registros)
    const headers = [
      'id_historico_log', 'data_criacao_historico_log', 'id_organizacao',
      'tipo_ator_historico_log', 'id_ator_historico_log', 'nome_ator_historico_log',
      'ip_ator_historico_log', 'modulo_historico_log', 'tipo_recurso_historico_log', 'id_recurso_historico_log',
      'acao_historico_log', 'detalhe_acao_historico_log', 'status_historico_log',
    ]
    const rows = logs.map((l) =>
      [
        l.id_historico_log, l.data_criacao_historico_log.toISOString(), l.id_organizacao,
        l.tipo_ator_historico_log, l.id_ator_historico_log,
        l.nome_ator_historico_log, l.ip_ator_historico_log ?? '', l.modulo_historico_log,
        l.tipo_recurso_historico_log, l.id_recurso_historico_log ?? '',
        l.acao_historico_log, `"${l.detalhe_acao_historico_log.replace(/"/g, '""')}"`, l.status_historico_log,
      ].join(',')
    )

    res.setHeader('Content-Type', 'text/csv')
    res.setHeader('Content-Disposition', 'attachment; filename="audit-logs.csv"')
    res.send([headers.join(','), ...rows].join('\n'))
  } catch (error) {
    next(error)
  }
}

// GET /logs/export/:jobId/status
export async function exportJobStatus(req: Request, res: Response, next: NextFunction) {
  try {
    const id_organizacao = getIdOrganizacao(req)

    const { jobId } = req.params

    // Verificar no banco primeiro (persistente), depois filesystem (fallback dev)
    let ready = false
    let status = 'processing'
    try {
      // NOTE: exportResult pode não estar no schema composto em ambientes antigos —
      // o catch serve de fallback pra filesystem. O cast via PrismaClient genérico
      // permite build mesmo quando o modelo não está gerado.
      const prismaAny = getPrisma() as unknown as {
        exportarResultado: { findUnique: (args: { where: { id_exportar_resultado: string } }) => Promise<{ id_organizacao: string; status_exportar_resultado: string } | null> }
      }
      const result = await prismaAny.exportarResultado.findUnique({ where: { id_exportar_resultado: jobId } })
      if (result) {
        if (result.id_organizacao !== id_organizacao) throw AppError.forbidden('Acesso negado')
        ready = result.status_exportar_resultado === 'ready'
        status = result.status_exportar_resultado
      }
    } catch (err) {
      if (err instanceof AppError) throw err
      // Tabela não existe ainda — usar filesystem
      ready = existsSync(join(EXPORT_DIR, `${jobId}.csv`)) ||
              existsSync(join(EXPORT_DIR, `${jobId}.json`))
      status = ready ? 'ready' : 'processing'
    }

    // Também verificar via PG Boss para metadados do job
    const boss = getBoss()
    const job = (await boss.getJobById(EXPORT_QUEUE, jobId).catch(() => null)) as PgBossJobMeta | null

    res.json({
      jobId,
      status,
      ready,
      downloadUrl: ready ? `/api/v1/historico/logs/export/${jobId}/download` : null,
      createdAt: job?.createdon ?? null,
      completedAt: job?.completedon ?? null,
    })
  } catch (error) {
    next(error)
  }
}

// GET /logs/export/:jobId/download
export async function exportJobDownload(req: Request, res: Response, next: NextFunction) {
  try {
    const id_organizacao = getIdOrganizacao(req)

    const { jobId } = req.params

    // Ponto Cego 6 — ler do banco (persistente), fallback para filesystem (dev)
    try {
      const prismaAny = getPrisma() as unknown as {
        exportarResultado: {
          findUnique: (args: { where: { id_exportar_resultado: string } }) => Promise<
            { id_organizacao: string; status_exportar_resultado: string; formato_exportar_resultado: 'csv' | 'json'; conteudo_exportar_resultado: string } | null
          >
        }
      }
      const result = await prismaAny.exportarResultado.findUnique({ where: { id_exportar_resultado: jobId } })
      if (result) {
        if (result.id_organizacao !== id_organizacao) throw AppError.forbidden('Acesso negado')
        if (result.status_exportar_resultado !== 'ready') {
          throw AppError.notFound('Exportação ainda em processamento')
        }
        const mime = result.formato_exportar_resultado === 'json' ? 'application/json' : 'text/csv'
        res.setHeader('Content-Type', mime)
        res.setHeader('Content-Disposition', `attachment; filename="audit-logs-${jobId}.${result.formato_exportar_resultado}"`)
        return res.send(result.conteudo_exportar_resultado)
      }
    } catch (err) {
      if (err instanceof AppError) throw err
      // Tabela não existe — tentar filesystem
    }

    // Fallback filesystem (desenvolvimento)
    const jsonPath = join(EXPORT_DIR, `${jobId}.json`)
    const csvPath = join(EXPORT_DIR, `${jobId}.csv`)
    if (existsSync(jsonPath)) {
      res.setHeader('Content-Type', 'application/json')
      res.setHeader('Content-Disposition', `attachment; filename="audit-logs-${jobId}.json"`)
      return res.send(readFileSync(jsonPath, 'utf-8'))
    }
    if (existsSync(csvPath)) {
      res.setHeader('Content-Type', 'text/csv')
      res.setHeader('Content-Disposition', `attachment; filename="audit-logs-${jobId}.csv"`)
      return res.send(readFileSync(csvPath, 'utf-8'))
    }

    throw AppError.notFound('Arquivo de exportação — o job pode ainda estar em processamento')
  } catch (error) {
    next(error)
  }
}
