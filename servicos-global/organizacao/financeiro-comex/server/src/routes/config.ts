/**
 * config.ts — CRUD de configuracoes do Financeiro Comex
 * Sub-rotas: /categorias, /condicoes
 * Todas as queries filtram por tenant_id (zero-trust)
 */

import { Router, Request, Response, NextFunction } from 'express'
import { z } from 'zod'
import { AppError } from '../lib/AppError.js'
import type { PrismaClient } from '@prisma/client'

const router = Router()

function ctx(req: Request) {
  return {
    tenantId: (req as unknown as Record<string, unknown>).tenantId as string,
    userId: (req as unknown as Record<string, unknown>).userId as string,
    prisma: (req as unknown as Record<string, unknown>).prisma as PrismaClient,
    companyId: req.headers['x-id-workspace'] as string || '',
  }
}

// ══════════════════════════════════════════════════════════════════════════════
// CATEGORIAS — /config/categorias
// ══════════════════════════════════════════════════════════════════════════════

const CategoriaCreateSchema = z.object({
  company_id: z.string().min(1),
  codigo: z.string().min(1),
  nome: z.string().min(1),
  grupo_custo: z.enum(['IMPOSTOS_FEDERAIS', 'CUSTO_OPERACIONAL']),
  tipo_operacao: z.enum(['IMPORTACAO', 'EXPORTACAO']).nullable().optional(),
  conta_contabil: z.string().optional(),
  centro_custo: z.string().optional(),
  ativo: z.boolean().default(true),
})

const CategoriaUpdateSchema = CategoriaCreateSchema.partial().omit({ company_id: true })

router.get('/categorias', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { tenantId, prisma, companyId } = ctx(req)
    const { tipo_operacao, grupo_custo, ativo } = req.query

    const where: Record<string, unknown> = { tenant_id: tenantId }
    if (companyId) where.company_id = companyId
    if (tipo_operacao) {
      where.tipo_operacao = { in: [tipo_operacao, null] }
    }
    if (grupo_custo) where.grupo_custo = grupo_custo
    if (ativo !== undefined) where.ativo = ativo === 'true'

    const categorias = await prisma.financeiroCategorias.findMany({
      where,
      orderBy: [{ codigo: 'asc' }],
    })

    res.json({ data: categorias })
  } catch (err) { next(err) }
})

router.post('/categorias', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { tenantId, prisma } = ctx(req)
    const body = CategoriaCreateSchema.parse(req.body)

    const existing = await prisma.financeiroCategorias.findFirst({
      where: { tenant_id: tenantId, company_id: body.company_id, codigo: body.codigo },
    })
    if (existing) throw new AppError(`Categoria com codigo "${body.codigo}" ja existe`, 409, 'DUPLICATE')

    const categoria = await prisma.financeiroCategorias.create({
      data: {
        tenant_id: tenantId,
        company_id: body.company_id,
        codigo: body.codigo,
        nome: body.nome,
        grupo_custo: body.grupo_custo,
        tipo_operacao: body.tipo_operacao ?? null,
        conta_contabil: body.conta_contabil ?? null,
        centro_custo: body.centro_custo ?? null,
        ativo: body.ativo,
      },
    })

    res.status(201).json(categoria)
  } catch (err) { next(err) }
})

router.put('/categorias/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { tenantId, prisma } = ctx(req)
    const body = CategoriaUpdateSchema.parse(req.body)

    const existing = await prisma.financeiroCategorias.findFirst({
      where: { id: req.params.id, tenant_id: tenantId },
    })
    if (!existing) throw new AppError('Categoria nao encontrada', 404, 'NOT_FOUND')

    const categoria = await prisma.financeiroCategorias.update({
      where: { id: req.params.id },
      data: body,
    })

    res.json(categoria)
  } catch (err) { next(err) }
})

router.delete('/categorias/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { tenantId, prisma } = ctx(req)

    const existing = await prisma.financeiroCategorias.findFirst({
      where: { id: req.params.id, tenant_id: tenantId },
    })
    if (!existing) throw new AppError('Categoria nao encontrada', 404, 'NOT_FOUND')

    // Verificar se ha lancamentos usando esta categoria
    const emUso = await prisma.financeiroLancamento.findFirst({
      where: { categoria_id: req.params.id, tenant_id: tenantId },
    })
    if (emUso) {
      // Desativar ao inves de excluir para preservar historico
      await prisma.financeiroCategorias.update({
        where: { id: req.params.id },
        data: { ativo: false },
      })
      res.json({ message: 'Categoria desativada pois possui lancamentos vinculados' })
      return
    }

    await prisma.financeiroCategorias.delete({ where: { id: req.params.id } })
    res.status(204).send()
  } catch (err) { next(err) }
})

// ══════════════════════════════════════════════════════════════════════════════
// CONDICOES DE PAGAMENTO — /config/condicoes
// ══════════════════════════════════════════════════════════════════════════════

const CondicaoCreateSchema = z.object({
  company_id: z.string().min(1),
  codigo: z.string().min(1),
  descricao: z.string().min(1),
  dias_prazo: z.number().int().min(0).nullable().optional(),
  ativo: z.boolean().default(true),
})

const CondicaoUpdateSchema = CondicaoCreateSchema.partial().omit({ company_id: true })

router.get('/condicoes', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { tenantId, prisma, companyId } = ctx(req)

    const where: Record<string, unknown> = { tenant_id: tenantId }
    if (companyId) where.company_id = companyId
    if (req.query.ativo !== undefined) where.ativo = req.query.ativo === 'true'

    const condicoes = await prisma.financeiroCondicaoPagamento.findMany({
      where,
      orderBy: [{ codigo: 'asc' }],
    })

    res.json({ data: condicoes })
  } catch (err) { next(err) }
})

router.post('/condicoes', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { tenantId, prisma } = ctx(req)
    const body = CondicaoCreateSchema.parse(req.body)

    const existing = await prisma.financeiroCondicaoPagamento.findFirst({
      where: { tenant_id: tenantId, company_id: body.company_id, codigo: body.codigo },
    })
    if (existing) throw new AppError(`Condicao com codigo "${body.codigo}" ja existe`, 409, 'DUPLICATE')

    const condicao = await prisma.financeiroCondicaoPagamento.create({
      data: {
        tenant_id: tenantId,
        company_id: body.company_id,
        codigo: body.codigo,
        descricao: body.descricao,
        dias_prazo: body.dias_prazo ?? null,
        ativo: body.ativo,
      },
    })

    res.status(201).json(condicao)
  } catch (err) { next(err) }
})

router.put('/condicoes/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { tenantId, prisma } = ctx(req)
    const body = CondicaoUpdateSchema.parse(req.body)

    const existing = await prisma.financeiroCondicaoPagamento.findFirst({
      where: { id: req.params.id, tenant_id: tenantId },
    })
    if (!existing) throw new AppError('Condicao nao encontrada', 404, 'NOT_FOUND')

    const condicao = await prisma.financeiroCondicaoPagamento.update({
      where: { id: req.params.id },
      data: body,
    })

    res.json(condicao)
  } catch (err) { next(err) }
})

router.delete('/condicoes/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { tenantId, prisma } = ctx(req)

    const existing = await prisma.financeiroCondicaoPagamento.findFirst({
      where: { id: req.params.id, tenant_id: tenantId },
    })
    if (!existing) throw new AppError('Condicao nao encontrada', 404, 'NOT_FOUND')

    await prisma.financeiroCondicaoPagamento.delete({ where: { id: req.params.id } })
    res.status(204).send()
  } catch (err) { next(err) }
})

export { router as configRouter }
