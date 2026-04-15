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
// x-internal-key) devem usar x-tenant-id header explicitamente.
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      auth: {
        userId: string
        tenantId: string
        clerkUserId: string
        role: string
      }
    }
  }
}

/** Actor types permitidos por chamadas com x-internal-key (serviços internos). */
const INTERNAL_ALLOWED_ACTOR_TYPES = new Set(['AI', 'API', 'JOB', 'INTEGRATION'])

/** Metadados de job do PG Boss (tipagem local — a lib não exporta este shape). */
interface PgBossJobMeta {
  createdon?: string | Date
  completedon?: string | Date
}

let _prisma: PrismaClient | null = null
function getPrisma(): PrismaClient {
  if (!_prisma) _prisma = new PrismaClient({ datasources: { db: { url: process.env.TENANT_DATABASE_URL } } })
  return _prisma
}
const INTERNAL_KEY = process.env.INTERNAL_SERVICE_KEY ?? ''

/** Limite superior do tamanho de página para queries de listagem. */
const MAX_PAGE_SIZE = 200

/** Extrai tenant_id do request (header x-tenant-id ou req.auth do middleware). */
function getTenantId(req: Request): string {
  // req.auth pode estar ausente em rotas com x-internal-key (chamadas inter-serviço)
  const authTenantId = (req as { auth?: { tenantId?: string } }).auth?.tenantId
  const tenantId = (req.headers['x-tenant-id'] as string) || authTenantId
  if (!tenantId) throw AppError.unauthorized('tenant_id obrigatório')
  return tenantId
}

/** Extrai userId do req.auth se presente (null em chamadas internas). */
function getAuthUserId(req: Request): string | null {
  return (req as { auth?: { userId?: string } }).auth?.userId ?? null
}

// POST /logs
export async function ingestLog(req: Request, res: Response, next: NextFunction) {
  try {
    const tenant_id = getTenantId(req)

    const parsed = IngestHistorySchema.safeParse(req.body)
    if (!parsed.success) throw AppError.validation(parsed.error.issues[0].message)

    // Ponto C — validar que actor_id corresponde ao usuário autenticado.
    // Chamadas internas (x-internal-key) só podem gravar actor_type ∈ {AI, API, JOB, INTEGRATION}
    // — nunca USER (um serviço interno não deve fingir ser um humano específico).
    const isInternalCall = req.headers['x-internal-key'] === INTERNAL_KEY && !!INTERNAL_KEY
    const authUserId = getAuthUserId(req)

    if (isInternalCall) {
      if (!INTERNAL_ALLOWED_ACTOR_TYPES.has(parsed.data.actor_type)) {
        setImmediate(() => {
          securityAudit.crossTenantAttempt(tenant_id, 'internal-service', {
            targetTenantId: tenant_id,
            resource: `audit_log:invalid_internal_actor_type:${parsed.data.actor_type}`,
            blocked: true,
          })
        })
        throw AppError.forbidden(
          `Chamadas internas só podem gravar actor_type ∈ {AI, API, JOB, INTEGRATION} — recebido: ${parsed.data.actor_type}`
        )
      }
    } else if (
      authUserId &&
      parsed.data.actor_type === 'USER' &&
      parsed.data.actor_id !== authUserId
    ) {
      setImmediate(() => {
        securityAudit.crossTenantAttempt(tenant_id, authUserId, {
          targetTenantId: tenant_id,
          resource: 'audit_log:actor_id_spoof',
          blocked: true,
        })
      })
      throw AppError.forbidden('actor_id não corresponde ao usuário autenticado')
    }

    await AuditService.log({ tenant_id, ...parsed.data })

    return res.status(202).json({ accepted: true })
  } catch (error) {
    next(error)
  }
}

// GET /logs
export async function listLogs(req: Request, res: Response, next: NextFunction) {
  try {
    const tenant_id = getTenantId(req)

    const parsed = ListHistoryQuerySchema.safeParse(req.query)
    if (!parsed.success) throw AppError.validation(parsed.error.issues[0].message)

    const q = parsed.data
    // Cap de segurança: impede payloads gigantes de clientes maliciosos
    const safeLimit = Math.min(q.limit ?? 50, MAX_PAGE_SIZE)

    const user = extractAuthUser(req)

    // Ponto Cego 3 — detectar tentativa de ler dados de outro tenant explicitamente
    const requestedTenantId = req.query.tenant_id as string | undefined
    if (
      requestedTenantId &&
      user &&
      requestedTenantId !== user.tenant_id &&
      user.role !== 'SUPER_ADMIN' &&
      user.role !== 'ADMIN'
    ) {
      setImmediate(() => {
        securityAudit.crossTenantAttempt(user.tenant_id, user.id, {
          targetTenantId: requestedTenantId,
          resource: 'history_log:list',
          blocked: true,
        })
      })
      throw AppError.forbidden('Acesso negado a dados de outro tenant')
    }

    const visibilityFilter = user
      ? buildVisibilityFilter(user)
      : { tenant_id }

    // Construir filtro de data unificado (evita conflito de chave entre cursor e range)
    const createdAtFilter: Prisma.DateTimeFilter<'HistoryLog'> = {}
    if (q.cursor) createdAtFilter.lt = new Date(q.cursor)
    if (q.startDate) createdAtFilter.gte = new Date(q.startDate)
    if (q.endDate) createdAtFilter.lte = new Date(q.endDate)

    const where: Prisma.HistoryLogWhereInput = {
      ...visibilityFilter,
      ...(q.actor_type ? { actor_type: q.actor_type } : {}),
      ...(q.actor_id ? { actor_id: q.actor_id } : {}),
      ...(q.module ? { module: q.module } : {}),
      ...(q.resource_type ? { resource_type: q.resource_type } : {}),
      ...(q.resource_id ? { resource_id: q.resource_id } : {}),
      ...(q.action ? { action: q.action } : {}),
      ...(q.status ? { status: q.status } : {}),
      ...(q.product_id ? { product_id: q.product_id } : {}),
      ...(Object.keys(createdAtFilter).length > 0 ? { created_at: createdAtFilter } : {}),
      ...(q.search
        ? {
            OR: [
              { action_detail: { contains: q.search, mode: 'insensitive' } },
              { actor_name: { contains: q.search, mode: 'insensitive' } },
              { resource_type: { contains: q.search, mode: 'insensitive' } },
            ],
          }
        : {}),
    }

    const logs = await getPrisma().historyLog.findMany({
      where,
      orderBy: { created_at: 'desc' },
      take: safeLimit + 1, // +1 para saber se há próxima página
    })

    const hasMore = logs.length > safeLimit
    const data = hasMore ? logs.slice(0, safeLimit) : logs
    const nextCursor = hasMore ? data[data.length - 1].created_at.toISOString() : null

    res.json({ data, meta: { hasMore, nextCursor, limit: safeLimit } })
  } catch (error) {
    next(error)
  }
}

// GET /logs/:id
export async function getLogById(req: Request, res: Response, next: NextFunction) {
  try {
    const tenant_id = getTenantId(req)

    const user = extractAuthUser(req)
    const visibilityFilter = user ? buildVisibilityFilter(user) : { tenant_id }

    const log = await getPrisma().historyLog.findFirst({
      where: { id: req.params.id, ...visibilityFilter },
    })

    if (!log) {
      // Ponto Cego 3 — verificar se o log existe mas foi bloqueado por visibilidade (cross-tenant)
      if (user && (user.role === 'STANDARD' || user.role === 'SUPPLIER')) {
        const exists = await getPrisma().historyLog.count({ where: { id: req.params.id } })
        if (exists > 0) {
          setImmediate(() => {
            securityAudit.crossTenantAttempt(user.tenant_id, user.id, {
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
          tenant_id,
          actor_type: 'USER',
          actor_id: user.id,
          actor_name: user.id,
          actor_ip: req.ip,
          module: 'historico',
          resource_type: 'HistoryLog',
          resource_id: log.id,
          action: 'VISUALIZAÇÃO',
          action_detail: `Visualizou log de auditoria #${log.id} (${log.action} em ${log.module})`,
          status: 'SUCCESS',
          user_id: user.id,
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
    const tenant_id = getTenantId(req)

    const parsed = ExportHistoryQuerySchema.safeParse(req.query)
    if (!parsed.success) throw AppError.validation(parsed.error.issues[0].message)

    const q = parsed.data
    const user = extractAuthUser(req)
    const visibilityFilter = user ? buildVisibilityFilter(user) : { tenant_id }

    const where: Prisma.HistoryLogWhereInput = {
      ...visibilityFilter,
      ...(q.actor_type ? { actor_type: q.actor_type } : {}),
      ...(q.module ? { module: q.module } : {}),
      ...(q.action ? { action: q.action } : {}),
      ...(q.status ? { status: q.status } : {}),
      ...(q.startDate || q.endDate
        ? {
            created_at: {
              ...(q.startDate ? { gte: new Date(q.startDate) } : {}),
              ...(q.endDate ? { lte: new Date(q.endDate) } : {}),
            },
          }
        : {}),
    }

    const count = await getPrisma().historyLog.count({ where })

    if (count > 10_000) {
      // Enfileira job de exportação via PG Boss
      const jobId = randomUUID()
      const boss = getBoss()
      await boss.send(EXPORT_QUEUE, {
        jobId,
        tenant_id,
        format: q.format,
        filters: {
          actor_type: q.actor_type,
          module: q.module,
          action: q.action,
          status: q.status,
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

    const logs = await getPrisma().historyLog.findMany({
      where,
      orderBy: { created_at: 'desc' },
    })

    if (q.format === 'json') {
      res.setHeader('Content-Type', 'application/json')
      res.setHeader('Content-Disposition', 'attachment; filename="audit-logs.json"')
      return res.json(logs)
    }

    // CSV síncrono (≤10k registros)
    const headers = [
      'id', 'created_at', 'tenant_id', 'actor_type', 'actor_id', 'actor_name',
      'actor_ip', 'module', 'resource_type', 'resource_id',
      'action', 'action_detail', 'status',
    ]
    const rows = logs.map((l) =>
      [
        l.id, l.created_at.toISOString(), l.tenant_id, l.actor_type, l.actor_id,
        l.actor_name, l.actor_ip ?? '', l.module, l.resource_type, l.resource_id ?? '',
        l.action, `"${l.action_detail.replace(/"/g, '""')}"`, l.status,
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
    const tenant_id = getTenantId(req)

    const { jobId } = req.params

    // Verificar no banco primeiro (persistente), depois filesystem (fallback dev)
    let ready = false
    let status = 'processing'
    try {
      // NOTE: exportResult pode não estar no schema composto em ambientes antigos —
      // o catch serve de fallback pra filesystem. O cast via PrismaClient genérico
      // permite build mesmo quando o modelo não está gerado.
      const prismaAny = getPrisma() as unknown as {
        exportResult: { findUnique: (args: { where: { id: string } }) => Promise<{ tenant_id: string; status: string } | null> }
      }
      const result = await prismaAny.exportResult.findUnique({ where: { id: jobId } })
      if (result) {
        if (result.tenant_id !== tenant_id) throw AppError.forbidden('Acesso negado')
        ready = result.status === 'ready'
        status = result.status
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
    const tenant_id = getTenantId(req)

    const { jobId } = req.params

    // Ponto Cego 6 — ler do banco (persistente), fallback para filesystem (dev)
    try {
      const prismaAny = getPrisma() as unknown as {
        exportResult: {
          findUnique: (args: { where: { id: string } }) => Promise<
            { tenant_id: string; status: string; format: 'csv' | 'json'; content: string } | null
          >
        }
      }
      const result = await prismaAny.exportResult.findUnique({ where: { id: jobId } })
      if (result) {
        if (result.tenant_id !== tenant_id) throw AppError.forbidden('Acesso negado')
        if (result.status !== 'ready') {
          throw AppError.notFound('Exportação ainda em processamento')
        }
        const mime = result.format === 'json' ? 'application/json' : 'text/csv'
        res.setHeader('Content-Type', mime)
        res.setHeader('Content-Disposition', `attachment; filename="audit-logs-${jobId}.${result.format}"`)
        return res.send(result.content)
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
