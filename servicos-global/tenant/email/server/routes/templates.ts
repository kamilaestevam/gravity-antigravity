// server/routes/templates.ts
// CRUD completo de templates de email editáveis por tenant.
// GET    /api/v1/email/templates
// POST   /api/v1/email/templates
// PUT    /api/v1/email/templates/:id
// DELETE /api/v1/email/templates/:id

import { Router, Request, Response, NextFunction } from 'express'
import { z } from 'zod'
import { AppError } from '../lib/errors.js'
import { prisma } from '../lib/prisma.js'
import { authMiddleware } from '../middleware/auth.js'

export const templatesRouter = Router()

const templateSchema = z.object({
  nome: z.string().min(1).max(100),
  slug: z.string().min(1).max(100).regex(/^[a-z0-9-]+$/, 'Slug deve conter apenas letras minúsculas, números e hífens'),
  assunto: z.string().min(1).max(255),
  corpo_html: z.string().min(1),
  corpo_texto: z.string().optional(),
  variaveis: z.array(z.string()).default([]),
  descricao: z.string().optional(),
  ativo: z.boolean().default(true),
})

const templateUpdateSchema = templateSchema.partial()

// ---- Listar templates -------------------------------------------------------

templatesRouter.get(
  '/api/v1/email/templates',
  authMiddleware,
  async (req: Request, res: Response, next: NextFunction) => {
    const { tenantId } = req.auth

    const templates = await prisma.templateEmail.findMany({
      where: { tenant_id: tenantId },
      orderBy: { nome: 'asc' },
    })

    res.json({ data: templates })
  }
)

// ---- Criar template ---------------------------------------------------------

templatesRouter.post(
  '/api/v1/email/templates',
  authMiddleware,
  async (req: Request, res: Response, next: NextFunction) => {
    const parse = templateSchema.safeParse(req.body)
    if (!parse.success) {
      return next(new AppError(parse.error.errors[0].message, 422, 'VALIDATION_ERROR'))
    }

    const { tenantId, userId } = req.auth

    // Verificar slug duplicado no tenant
    const existing = await prisma.templateEmail.findFirst({
      where: { tenant_id: tenantId, slug: parse.data.slug },
    })
    if (existing) {
      return next(new AppError(`Já existe um template com slug '${parse.data.slug}'`, 409, 'SLUG_CONFLICT'))
    }

    const template = await prisma.templateEmail.create({
      data: {
        tenant_id: tenantId,
        user_id: userId,
        ...parse.data,
      },
    })

    res.status(201).json({ data: template })
  }
)

// ---- Atualizar template -----------------------------------------------------

templatesRouter.put(
  '/api/v1/email/templates/:id',
  authMiddleware,
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params
    const { tenantId } = req.auth

    const parse = templateUpdateSchema.safeParse(req.body)
    if (!parse.success) {
      return next(new AppError(parse.error.errors[0].message, 422, 'VALIDATION_ERROR'))
    }

    const existing = await prisma.templateEmail.findFirst({
      where: { id, tenant_id: tenantId },
    })
    if (!existing) {
      return next(new AppError('Template não encontrado', 404, 'TEMPLATE_NOT_FOUND'))
    }

    // Verificar conflito de slug se estiver sendo alterado
    if (parse.data.slug && parse.data.slug !== existing.slug) {
      const slugConflict = await prisma.templateEmail.findFirst({
        where: { tenant_id: tenantId, slug: parse.data.slug, NOT: { id } },
      })
      if (slugConflict) {
        return next(new AppError(`Já existe um template com slug '${parse.data.slug}'`, 409, 'SLUG_CONFLICT'))
      }
    }

    const updated = await prisma.templateEmail.update({
      where: { id },
      data: parse.data,
    })

    res.json({ data: updated })
  }
)

// ---- Deletar template -------------------------------------------------------

templatesRouter.delete(
  '/api/v1/email/templates/:id',
  authMiddleware,
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params
    const { tenantId } = req.auth

    const existing = await prisma.templateEmail.findFirst({
      where: { id, tenant_id: tenantId },
    })
    if (!existing) {
      return next(new AppError('Template não encontrado', 404, 'TEMPLATE_NOT_FOUND'))
    }

    await prisma.templateEmail.delete({ where: { id } })

    res.status(204).send()
  }
)
