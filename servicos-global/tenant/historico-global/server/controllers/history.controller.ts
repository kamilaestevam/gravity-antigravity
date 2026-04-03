import { Request, Response, NextFunction } from 'express'
import { PrismaClient, Prisma } from '../../../generated/index.js'
import { AppError } from '../lib/errors.js'
import {
  IngestHistorySchema,
  ListHistoryQuerySchema,
  ExportHistoryQuerySchema,
} from '../schemas/history.schema.js'
import { AuditService } from '../services/audit.service.js'
import { buildVisibilityFilter, extractAuthUser } from '../lib/visibility.js'

const prisma = new PrismaClient()

// POST /logs
export async function ingestLog(req: Request, res: Response, next: NextFunction) {
  try {
    const tenant_id = (req.headers['x-tenant-id'] as string) || (req as any).auth?.tenantId
    if (!tenant_id) throw AppError.unauthorized('tenant_id obrigatório')

    const parsed = IngestHistorySchema.safeParse(req.body)
    if (!parsed.success) throw AppError.validation(parsed.error.issues[0].message)

    await AuditService.log({ tenant_id, ...parsed.data })

    return res.status(202).json({ accepted: true })
  } catch (error) {
    next(error)
  }
}

// GET /logs
export async function listLogs(req: Request, res: Response, next: NextFunction) {
  try {
    const tenant_id = (req.headers['x-tenant-id'] as string) || (req as any).auth?.tenantId
    if (!tenant_id) throw AppError.unauthorized('tenant_id obrigatório')

    const parsed = ListHistoryQuerySchema.safeParse(req.query)
    if (!parsed.success) throw AppError.validation(parsed.error.issues[0].message)

    const q = parsed.data

    const user = extractAuthUser(req)
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

    const logs = await prisma.historyLog.findMany({
      where,
      orderBy: { created_at: 'desc' },
      take: q.limit + 1, // +1 para saber se há próxima página
    })

    const hasMore = logs.length > q.limit
    const data = hasMore ? logs.slice(0, q.limit) : logs
    const nextCursor = hasMore ? data[data.length - 1].created_at.toISOString() : null

    res.json({ data, meta: { hasMore, nextCursor, limit: q.limit } })
  } catch (error) {
    next(error)
  }
}

// GET /logs/:id
export async function getLogById(req: Request, res: Response, next: NextFunction) {
  try {
    const tenant_id = (req.headers['x-tenant-id'] as string) || (req as any).auth?.tenantId
    if (!tenant_id) throw AppError.unauthorized('tenant_id obrigatório')

    const user = extractAuthUser(req)
    const visibilityFilter = user ? buildVisibilityFilter(user) : { tenant_id }

    const log = await prisma.historyLog.findFirst({
      where: { id: req.params.id, ...visibilityFilter },
    })

    if (!log) throw AppError.notFound('Log')

    res.json(log)
  } catch (error) {
    next(error)
  }
}

// GET /logs/export
export async function exportLogs(req: Request, res: Response, next: NextFunction) {
  try {
    const tenant_id = (req.headers['x-tenant-id'] as string) || (req as any).auth?.tenantId
    if (!tenant_id) throw AppError.unauthorized('tenant_id obrigatório')

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

    const count = await prisma.historyLog.count({ where })

    // Acima de 10.000: processar em background
    if (count > 10_000) {
      // TODO: enfileirar job de exportação e retornar link para download
      return res.status(202).json({
        message: 'Exportação em background iniciada. O download estará disponível em breve.',
        count,
      })
    }

    const logs = await prisma.historyLog.findMany({
      where,
      orderBy: { created_at: 'desc' },
    })

    if (q.format === 'json') {
      res.setHeader('Content-Type', 'application/json')
      res.setHeader('Content-Disposition', 'attachment; filename="audit-logs.json"')
      return res.json(logs)
    }

    // CSV
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
