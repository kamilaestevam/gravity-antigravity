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
import { toTemplateDto } from '../lib/dto.js'

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
  async (req: Request, res: Response, _next: NextFunction) => {
    const { tenantId } = req.auth

    const templates = await prisma.templateEmail.findMany({
      where: { id_organizacao_template_email: tenantId },
      orderBy: { nome_template_email: 'asc' },
    })

    res.json({ data: templates.map(toTemplateDto) })
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
      where: {
        id_organizacao_template_email: tenantId,
        slug_template_email: parse.data.slug,
      },
    })
    if (existing) {
      return next(new AppError(`Já existe um template com slug '${parse.data.slug}'`, 409, 'SLUG_CONFLICT'))
    }

    const template = await prisma.templateEmail.create({
      data: {
        id_organizacao_template_email: tenantId,
        id_usuario_template_email: userId,
        nome_template_email: parse.data.nome,
        slug_template_email: parse.data.slug,
        assunto_template_email: parse.data.assunto,
        corpo_html_template_email: parse.data.corpo_html,
        corpo_texto_template_email: parse.data.corpo_texto ?? null,
        variaveis_template_email: parse.data.variaveis,
        descricao_template_email: parse.data.descricao ?? null,
        ativo_template_email: parse.data.ativo,
      },
    })

    res.status(201).json({ data: toTemplateDto(template) })
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
      where: {
        id_template_email: id,
        id_organizacao_template_email: tenantId,
      },
    })
    if (!existing) {
      return next(new AppError('Template não encontrado', 404, 'TEMPLATE_NOT_FOUND'))
    }

    // Verificar conflito de slug se estiver sendo alterado
    if (parse.data.slug && parse.data.slug !== existing.slug_template_email) {
      const slugConflict = await prisma.templateEmail.findFirst({
        where: {
          id_organizacao_template_email: tenantId,
          slug_template_email: parse.data.slug,
          NOT: { id_template_email: id },
        },
      })
      if (slugConflict) {
        return next(new AppError(`Já existe um template com slug '${parse.data.slug}'`, 409, 'SLUG_CONFLICT'))
      }
    }

    const data: Record<string, unknown> = {}
    if (parse.data.nome !== undefined) data.nome_template_email = parse.data.nome
    if (parse.data.slug !== undefined) data.slug_template_email = parse.data.slug
    if (parse.data.assunto !== undefined) data.assunto_template_email = parse.data.assunto
    if (parse.data.corpo_html !== undefined) data.corpo_html_template_email = parse.data.corpo_html
    if (parse.data.corpo_texto !== undefined) data.corpo_texto_template_email = parse.data.corpo_texto
    if (parse.data.variaveis !== undefined) data.variaveis_template_email = parse.data.variaveis
    if (parse.data.descricao !== undefined) data.descricao_template_email = parse.data.descricao
    if (parse.data.ativo !== undefined) data.ativo_template_email = parse.data.ativo

    const updated = await prisma.templateEmail.update({
      where: { id_template_email: id },
      data,
    })

    res.json({ data: toTemplateDto(updated) })
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
      where: {
        id_template_email: id,
        id_organizacao_template_email: tenantId,
      },
    })
    if (!existing) {
      return next(new AppError('Template não encontrado', 404, 'TEMPLATE_NOT_FOUND'))
    }

    await prisma.templateEmail.delete({ where: { id_template_email: id } })

    res.status(204).send()
  }
)
