import { Request, Response, NextFunction } from 'express'
import { PrismaClient } from '../../../generated/index.js'
import { AppError } from '../lib/errors.js'
import { AlertRuleSchema, AlertEventUpdateSchema } from '../schemas/history.schema.js'
import { extrairUsuarioAutenticado } from '../lib/visibility.js'

// Lazy initialization — evita ESM hoisting ler process.env antes do dotenv.config()
let _prisma: PrismaClient | undefined
function getPrisma(): PrismaClient {
  if (!_prisma) {
    _prisma = new PrismaClient({ datasources: { db: { url: process.env.ORGANIZACAO_DATABASE_URL } } })
  }
  return _prisma
}

// GET /alerts
export async function listAlerts(req: Request, res: Response, next: NextFunction) {
  try {
    const id_organizacao = (req.headers['x-id-organizacao'] as string) || (req as any).auth?.id_organizacao
    if (!id_organizacao) throw AppError.unauthorized('id_organizacao obrigatório')

    const usuario = extrairUsuarioAutenticado(req)
    const isGravityAdmin = usuario?.tipo_usuario === 'SUPER_ADMIN' || usuario?.tipo_usuario === 'ADMIN'

    const status_evento_alerta = req.query.status as string | undefined
    const limit = Math.min(Number(req.query.limit ?? 50), 100)

    const alerts = await getPrisma().alertaData.findMany({
      where: {
        ...(isGravityAdmin ? {} : { id_organizacao }),
        ...(status_evento_alerta ? { status_evento_alerta: status_evento_alerta as any } : {}),
      },
      include: { regra_evento_alerta: { select: { nome_regra_alerta: true } } },
      orderBy: { data_criacao_evento_alerta: 'desc' },
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
    const id_organizacao = (req.headers['x-id-organizacao'] as string) || (req as any).auth?.id_organizacao
    if (!id_organizacao) throw AppError.unauthorized('id_organizacao obrigatório')

    const parsed = AlertEventUpdateSchema.safeParse(req.body)
    if (!parsed.success) throw AppError.validation(parsed.error.issues[0].message)

    const usuario = extrairUsuarioAutenticado(req)

    const alert = await getPrisma().alertaData.findFirst({
      where: { id_evento_alerta: req.params.id, id_organizacao },
    })
    if (!alert) throw AppError.notFound('Alerta')

    const updated = await getPrisma().alertaData.update({
      where: { id_evento_alerta: req.params.id },
      data: {
        status_evento_alerta: parsed.data.status_evento_alerta,
        notas_evento_alerta: parsed.data.notas_evento_alerta,
        revisado_por_evento_alerta: usuario?.id_usuario,
        revisado_em_evento_alerta: new Date(),
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
    const id_organizacao = (req.headers['x-id-organizacao'] as string) || (req as any).auth?.id_organizacao
    if (!id_organizacao) throw AppError.unauthorized('id_organizacao obrigatório')

    const usuario = extrairUsuarioAutenticado(req)
    const isGravityAdmin = usuario?.tipo_usuario === 'SUPER_ADMIN' || usuario?.tipo_usuario === 'ADMIN'

    const rules = await getPrisma().alertaRegra.findMany({
      where: isGravityAdmin
        ? {}
        : { OR: [{ id_organizacao }, { id_organizacao: null }] },
      orderBy: { data_criacao_regra_alerta: 'asc' },
    })

    res.json({ data: rules })
  } catch (error) {
    next(error)
  }
}

// POST /alert-rules
export async function createRule(req: Request, res: Response, next: NextFunction) {
  try {
    const id_organizacao = (req.headers['x-id-organizacao'] as string) || (req as any).auth?.id_organizacao
    if (!id_organizacao) throw AppError.unauthorized('id_organizacao obrigatório')

    const parsed = AlertRuleSchema.safeParse(req.body)
    if (!parsed.success) throw AppError.validation(parsed.error.issues[0].message)

    const usuario = extrairUsuarioAutenticado(req)
    const isGravityAdmin = usuario?.tipo_usuario === 'SUPER_ADMIN' || usuario?.tipo_usuario === 'ADMIN'

    const rule = await getPrisma().alertaRegra.create({
      data: {
        ...parsed.data,
        id_organizacao: isGravityAdmin ? null : id_organizacao,
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
    const id_organizacao = (req.headers['x-id-organizacao'] as string) || (req as any).auth?.id_organizacao
    if (!id_organizacao) throw AppError.unauthorized('id_organizacao obrigatório')

    const parsed = AlertRuleSchema.safeParse(req.body)
    if (!parsed.success) throw AppError.validation(parsed.error.issues[0].message)

    const usuario = extrairUsuarioAutenticado(req)
    const isGravityAdmin = usuario?.tipo_usuario === 'SUPER_ADMIN' || usuario?.tipo_usuario === 'ADMIN'

    const existing = await getPrisma().alertaRegra.findFirst({
      where: {
        id_regra_alerta: req.params.id,
        ...(isGravityAdmin ? {} : { id_organizacao }),
      },
    })
    if (!existing) throw AppError.notFound('Regra de alerta')

    const updated = await getPrisma().alertaRegra.update({
      where: { id_regra_alerta: req.params.id },
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
    const id_organizacao = (req.headers['x-id-organizacao'] as string) || (req as any).auth?.id_organizacao
    if (!id_organizacao) throw AppError.unauthorized('id_organizacao obrigatório')

    const usuario = extrairUsuarioAutenticado(req)
    const isGravityAdmin = usuario?.tipo_usuario === 'SUPER_ADMIN' || usuario?.tipo_usuario === 'ADMIN'

    const existing = await getPrisma().alertaRegra.findFirst({
      where: {
        id_regra_alerta: req.params.id,
        ...(isGravityAdmin ? {} : { id_organizacao }),
      },
    })
    if (!existing) throw AppError.notFound('Regra de alerta')

    await getPrisma().alertaRegra.delete({ where: { id_regra_alerta: req.params.id } })

    res.status(204).send()
  } catch (error) {
    next(error)
  }
}
