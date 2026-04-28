import { Request, Response, NextFunction } from 'express'
import { PrismaClient } from '../../../generated/index.js'
import { AppError } from '../lib/errors.js'
import { AlertRuleSchema, AlertEventUpdateSchema } from '../schemas/history.schema.js'
import { extractAuthUser } from '../lib/visibility.js'

const prisma = new PrismaClient({ datasources: { db: { url: process.env.TENANT_DATABASE_URL } } })

// GET /alerts
export async function listAlerts(req: Request, res: Response, next: NextFunction) {
  try {
    const tenant_id = (req.headers['x-id-organizacao'] as string) || (req as any).auth?.tenantId
    if (!tenant_id) throw AppError.unauthorized('tenant_id obrigatório')

    const user = extractAuthUser(req)
    const isGravityAdmin = user?.role === 'SUPER_ADMIN' || user?.role === 'ADMIN'

    const status = req.query.status as string | undefined
    const limit = Math.min(Number(req.query.limit ?? 50), 100)

    const alerts = await prisma.alertaData.findMany({
      where: {
        ...(isGravityAdmin ? {} : { tenant_id }),
        ...(status ? { status: status as any } : {}),
      },
      include: { rule: { select: { name: true } } },
      orderBy: { created_at: 'desc' },
      take: limit,
    })

    res.json({ data: alerts })
  } catch (error) {
    next(error)
  }
}

// PATCH /alerts/:id
export async function updateAlert(req: Request, res: Response, next: NextFunction) {
  try {
    const tenant_id = (req.headers['x-id-organizacao'] as string) || (req as any).auth?.tenantId
    if (!tenant_id) throw AppError.unauthorized('tenant_id obrigatório')

    const parsed = AlertEventUpdateSchema.safeParse(req.body)
    if (!parsed.success) throw AppError.validation(parsed.error.issues[0].message)

    const user = extractAuthUser(req)

    const alert = await prisma.alertaData.findFirst({
      where: { id: req.params.id, tenant_id },
    })
    if (!alert) throw AppError.notFound('Alerta')

    const updated = await prisma.alertaData.update({
      where: { id: req.params.id },
      data: {
        status: parsed.data.status,
        notes: parsed.data.notes,
        reviewed_by: user?.id,
        reviewed_at: new Date(),
      },
    })

    res.json(updated)
  } catch (error) {
    next(error)
  }
}

// GET /alert-rules
export async function listRules(req: Request, res: Response, next: NextFunction) {
  try {
    const tenant_id = (req.headers['x-id-organizacao'] as string) || (req as any).auth?.tenantId
    if (!tenant_id) throw AppError.unauthorized('tenant_id obrigatório')

    const user = extractAuthUser(req)
    const isGravityAdmin = user?.role === 'SUPER_ADMIN' || user?.role === 'ADMIN'

    const rules = await prisma.alertaRegra.findMany({
      where: isGravityAdmin
        ? {}
        : { OR: [{ tenant_id }, { tenant_id: null }] },
      orderBy: { created_at: 'asc' },
    })

    res.json({ data: rules })
  } catch (error) {
    next(error)
  }
}

// POST /alert-rules
export async function createRule(req: Request, res: Response, next: NextFunction) {
  try {
    const tenant_id = (req.headers['x-id-organizacao'] as string) || (req as any).auth?.tenantId
    if (!tenant_id) throw AppError.unauthorized('tenant_id obrigatório')

    const parsed = AlertRuleSchema.safeParse(req.body)
    if (!parsed.success) throw AppError.validation(parsed.error.issues[0].message)

    const user = extractAuthUser(req)
    const isGravityAdmin = user?.role === 'SUPER_ADMIN' || user?.role === 'ADMIN'

    const rule = await prisma.alertaRegra.create({
      data: {
        ...parsed.data,
        tenant_id: isGravityAdmin ? null : tenant_id,
      },
    })

    res.status(201).json(rule)
  } catch (error) {
    next(error)
  }
}

// PUT /alert-rules/:id
export async function updateRule(req: Request, res: Response, next: NextFunction) {
  try {
    const tenant_id = (req.headers['x-id-organizacao'] as string) || (req as any).auth?.tenantId
    if (!tenant_id) throw AppError.unauthorized('tenant_id obrigatório')

    const parsed = AlertRuleSchema.safeParse(req.body)
    if (!parsed.success) throw AppError.validation(parsed.error.issues[0].message)

    const user = extractAuthUser(req)
    const isGravityAdmin = user?.role === 'SUPER_ADMIN' || user?.role === 'ADMIN'

    const existing = await prisma.alertaRegra.findFirst({
      where: {
        id: req.params.id,
        ...(isGravityAdmin ? {} : { tenant_id }),
      },
    })
    if (!existing) throw AppError.notFound('Regra de alerta')

    const updated = await prisma.alertaRegra.update({
      where: { id: req.params.id },
      data: parsed.data,
    })

    res.json(updated)
  } catch (error) {
    next(error)
  }
}

// DELETE /alert-rules/:id
export async function deleteRule(req: Request, res: Response, next: NextFunction) {
  try {
    const tenant_id = (req.headers['x-id-organizacao'] as string) || (req as any).auth?.tenantId
    if (!tenant_id) throw AppError.unauthorized('tenant_id obrigatório')

    const user = extractAuthUser(req)
    const isGravityAdmin = user?.role === 'SUPER_ADMIN' || user?.role === 'ADMIN'

    const existing = await prisma.alertaRegra.findFirst({
      where: {
        id: req.params.id,
        ...(isGravityAdmin ? {} : { tenant_id }),
      },
    })
    if (!existing) throw AppError.notFound('Regra de alerta')

    await prisma.alertaRegra.delete({ where: { id: req.params.id } })

    res.status(204).send()
  } catch (error) {
    next(error)
  }
}
