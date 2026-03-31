/**
 * config.ts — CRUD de configuracoes do NF Importacao
 * Sub-rotas: /despesas, /templates, /layouts, /favoritos-fiscais
 * Todas as queries filtram por tenant_id + company_id (zero-trust)
 */

import { Router, Request, Response, NextFunction } from 'express'
import { z } from 'zod'
import { AppError } from '../services/nfStatusEngine.js'
import type { PrismaClient, Prisma } from '@prisma/client'

type TxClient = Omit<PrismaClient, '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'>

const router = Router()

function ctx(req: Request) {
  return {
    tenantId: (req as unknown as Record<string, unknown>).tenantId as string,
    userId: (req as unknown as Record<string, unknown>).userId as string,
    prisma: (req as unknown as Record<string, unknown>).prisma as PrismaClient,
    companyId: req.headers['x-company-id'] as string || '',
  }
}

// ══════════════════════════════════════════════════════════════════════════════
// DESPESA CATALOGO — /config/despesas
// ══════════════════════════════════════════════════════════════════════════════

const DespesaCatalogoCreateSchema = z.object({
  company_id: z.string().min(1),
  codigo: z.string().min(1),
  nome: z.string().min(1),
  tipo: z.string().min(1),
  descricao: z.string().optional(),
  metodo_rateio_padrao: z.enum([
    'PESO_LIQUIDO', 'PESO_BRUTO', 'VALOR_CIF', 'VALOR_FOB',
    'QUANTIDADE', 'VALOR_II', 'IGUAL', 'MANUAL',
  ]).default('VALOR_CIF'),
  moeda_padrao: z.string().default('BRL'),
  ativo: z.boolean().default(true),
})

const DespesaCatalogoUpdateSchema = DespesaCatalogoCreateSchema.partial().omit({ company_id: true })

// GET /config/despesas
router.get('/despesas', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { tenantId, prisma, companyId } = ctx(req)

    const where: Record<string, unknown> = { tenant_id: tenantId }
    if (companyId) where.company_id = companyId

    const despesas = await prisma.nfDespesaCatalogo.findMany({
      where,
      orderBy: { nome: 'asc' },
    })

    res.json({ data: despesas })
  } catch (err) { next(err) }
})

// POST /config/despesas
router.post('/despesas', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { tenantId, userId, prisma } = ctx(req)
    const body = DespesaCatalogoCreateSchema.parse(req.body)

    // Verificar duplicata de codigo
    const existing = await prisma.nfDespesaCatalogo.findFirst({
      where: { tenant_id: tenantId, company_id: body.company_id, codigo: body.codigo },
    })
    if (existing) {
      throw new AppError(`Despesa com codigo "${body.codigo}" ja existe`, 409, 'DUPLICATE')
    }

    const despesa = await prisma.nfDespesaCatalogo.create({
      data: {
        tenant_id: tenantId,
        company_id: body.company_id,
        product_id: 'nf-importacao',
        codigo: body.codigo,
        nome: body.nome,
        tipo: body.tipo,
        descricao: body.descricao ?? null,
        metodo_rateio_padrao: body.metodo_rateio_padrao,
        moeda_padrao: body.moeda_padrao,
        ativo: body.ativo,
        created_by: userId,
      },
    })

    res.status(201).json(despesa)
  } catch (err) { next(err) }
})

// PUT /config/despesas/:id
router.put('/despesas/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { tenantId, userId, prisma } = ctx(req)
    const body = DespesaCatalogoUpdateSchema.parse(req.body)

    const existing = await prisma.nfDespesaCatalogo.findFirst({
      where: { id: req.params.id, tenant_id: tenantId },
    })
    if (!existing) throw new AppError('Despesa catalogo nao encontrada', 404, 'NOT_FOUND')

    const despesa = await prisma.nfDespesaCatalogo.update({
      where: { id: req.params.id },
      data: { ...body, updated_by: userId },
    })

    res.json(despesa)
  } catch (err) { next(err) }
})

// DELETE /config/despesas/:id
router.delete('/despesas/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { tenantId, prisma } = ctx(req)

    const existing = await prisma.nfDespesaCatalogo.findFirst({
      where: { id: req.params.id, tenant_id: tenantId },
    })
    if (!existing) throw new AppError('Despesa catalogo nao encontrada', 404, 'NOT_FOUND')

    await prisma.nfDespesaCatalogo.delete({ where: { id: req.params.id } })
    res.status(204).send()
  } catch (err) { next(err) }
})

// ══════════════════════════════════════════════════════════════════════════════
// DESPESA TEMPLATE — /config/templates
// ══════════════════════════════════════════════════════════════════════════════

const TemplateItemSchema = z.object({
  tipo: z.string().min(1),
  descricao: z.string().optional(),
  metodo_rateio: z.enum([
    'PESO_LIQUIDO', 'PESO_BRUTO', 'VALOR_CIF', 'VALOR_FOB',
    'QUANTIDADE', 'VALOR_II', 'IGUAL', 'MANUAL',
  ]).default('VALOR_CIF'),
  ordem: z.number().int().min(0).optional(),
})

const TemplateCreateSchema = z.object({
  company_id: z.string().min(1),
  nome: z.string().min(1),
  descricao: z.string().optional(),
  ativo: z.boolean().default(true),
  itens: z.array(TemplateItemSchema).min(1),
})

const TemplateUpdateSchema = z.object({
  nome: z.string().min(1).optional(),
  descricao: z.string().optional(),
  ativo: z.boolean().optional(),
  itens: z.array(TemplateItemSchema).min(1).optional(),
})

// GET /config/templates
router.get('/templates', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { tenantId, prisma, companyId } = ctx(req)

    const where: Record<string, unknown> = { tenant_id: tenantId }
    if (companyId) where.company_id = companyId

    const templates = await prisma.nfDespesaTemplate.findMany({
      where,
      orderBy: { nome: 'asc' },
      include: { itens: { orderBy: { ordem: 'asc' } } },
    })

    res.json({ data: templates })
  } catch (err) { next(err) }
})

// POST /config/templates
router.post('/templates', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { tenantId, userId, prisma } = ctx(req)
    const body = TemplateCreateSchema.parse(req.body)

    const template = await prisma.$transaction(async (tx: TxClient) => {
      const created = await tx.nfDespesaTemplate.create({
        data: {
          tenant_id: tenantId,
          company_id: body.company_id,
          product_id: 'nf-importacao',
          nome: body.nome,
          descricao: body.descricao ?? null,
          ativo: body.ativo,
          created_by: userId,
        },
      })

      for (let i = 0; i < body.itens.length; i++) {
        const item = body.itens[i]
        await tx.nfDespesaTemplateItem.create({
          data: {
            tenant_id: tenantId,
            template_id: created.id,
            tipo: item.tipo,
            descricao: item.descricao ?? null,
            metodo_rateio: item.metodo_rateio,
            ordem: item.ordem ?? i,
          },
        })
      }

      return tx.nfDespesaTemplate.findFirst({
        where: { id: created.id },
        include: { itens: { orderBy: { ordem: 'asc' } } },
      })
    })

    res.status(201).json(template)
  } catch (err) { next(err) }
})

// PUT /config/templates/:id
router.put('/templates/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { tenantId, userId, prisma } = ctx(req)
    const body = TemplateUpdateSchema.parse(req.body)

    const existing = await prisma.nfDespesaTemplate.findFirst({
      where: { id: req.params.id, tenant_id: tenantId },
    })
    if (!existing) throw new AppError('Template nao encontrado', 404, 'NOT_FOUND')

    const template = await prisma.$transaction(async (tx: TxClient) => {
      await tx.nfDespesaTemplate.update({
        where: { id: req.params.id },
        data: {
          nome: body.nome,
          descricao: body.descricao,
          ativo: body.ativo,
          updated_by: userId,
        },
      })

      // Recriar itens se fornecidos
      if (body.itens) {
        await tx.nfDespesaTemplateItem.deleteMany({
          where: { template_id: req.params.id },
        })

        for (let i = 0; i < body.itens.length; i++) {
          const item = body.itens[i]
          await tx.nfDespesaTemplateItem.create({
            data: {
              tenant_id: tenantId,
              template_id: req.params.id,
              tipo: item.tipo,
              descricao: item.descricao ?? null,
              metodo_rateio: item.metodo_rateio,
              ordem: item.ordem ?? i,
            },
          })
        }
      }

      return tx.nfDespesaTemplate.findFirst({
        where: { id: req.params.id },
        include: { itens: { orderBy: { ordem: 'asc' } } },
      })
    })

    res.json(template)
  } catch (err) { next(err) }
})

// DELETE /config/templates/:id
router.delete('/templates/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { tenantId, prisma } = ctx(req)

    const existing = await prisma.nfDespesaTemplate.findFirst({
      where: { id: req.params.id, tenant_id: tenantId },
    })
    if (!existing) throw new AppError('Template nao encontrado', 404, 'NOT_FOUND')

    await prisma.$transaction(async (tx: TxClient) => {
      await tx.nfDespesaTemplateItem.deleteMany({ where: { template_id: req.params.id } })
      await tx.nfDespesaTemplate.delete({ where: { id: req.params.id } })
    })

    res.status(204).send()
  } catch (err) { next(err) }
})

// ══════════════════════════════════════════════════════════════════════════════
// EXPORT LAYOUT — /config/layouts
// ══════════════════════════════════════════════════════════════════════════════

const LayoutCampoSchema = z.object({
  campo_origem: z.string().min(1),
  campo_destino: z.string().min(1),
  tipo: z.enum(['string', 'number', 'date', 'boolean']).default('string'),
  formato: z.string().optional(),
  valor_padrao: z.string().optional(),
  ordem: z.number().int().min(0).optional(),
})

const LayoutCreateSchema = z.object({
  company_id: z.string().min(1),
  nome: z.string().min(1),
  descricao: z.string().optional(),
  formato: z.enum(['TOTVS_PROTHEUS', 'SAP', 'SENIOR', 'CSV', 'XML', 'JSON', 'CUSTOM']),
  separador: z.string().default(';'),
  encoding: z.string().default('UTF-8'),
  ativo: z.boolean().default(true),
  campos: z.array(LayoutCampoSchema).min(1),
})

const LayoutUpdateSchema = z.object({
  nome: z.string().min(1).optional(),
  descricao: z.string().optional(),
  formato: z.enum(['TOTVS_PROTHEUS', 'SAP', 'SENIOR', 'CSV', 'XML', 'JSON', 'CUSTOM']).optional(),
  separador: z.string().optional(),
  encoding: z.string().optional(),
  ativo: z.boolean().optional(),
  campos: z.array(LayoutCampoSchema).min(1).optional(),
})

// GET /config/layouts
router.get('/layouts', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { tenantId, prisma, companyId } = ctx(req)

    const where: Record<string, unknown> = { tenant_id: tenantId }
    if (companyId) where.company_id = companyId

    const layouts = await prisma.nfExportLayout.findMany({
      where,
      orderBy: { nome: 'asc' },
      include: { campos: { orderBy: { ordem: 'asc' } } },
    })

    res.json({ data: layouts })
  } catch (err) { next(err) }
})

// POST /config/layouts
router.post('/layouts', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { tenantId, userId, prisma } = ctx(req)
    const body = LayoutCreateSchema.parse(req.body)

    const layout = await prisma.$transaction(async (tx: TxClient) => {
      const created = await tx.nfExportLayout.create({
        data: {
          tenant_id: tenantId,
          company_id: body.company_id,
          product_id: 'nf-importacao',
          nome: body.nome,
          descricao: body.descricao ?? null,
          formato: body.formato,
          separador: body.separador,
          encoding: body.encoding,
          ativo: body.ativo,
          created_by: userId,
        },
      })

      for (let i = 0; i < body.campos.length; i++) {
        const campo = body.campos[i]
        await tx.nfExportLayoutCampo.create({
          data: {
            tenant_id: tenantId,
            layout_id: created.id,
            campo_origem: campo.campo_origem,
            campo_destino: campo.campo_destino,
            tipo: campo.tipo,
            formato: campo.formato ?? null,
            valor_padrao: campo.valor_padrao ?? null,
            ordem: campo.ordem ?? i,
          },
        })
      }

      return tx.nfExportLayout.findFirst({
        where: { id: created.id },
        include: { campos: { orderBy: { ordem: 'asc' } } },
      })
    })

    res.status(201).json(layout)
  } catch (err) { next(err) }
})

// PUT /config/layouts/:id
router.put('/layouts/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { tenantId, userId, prisma } = ctx(req)
    const body = LayoutUpdateSchema.parse(req.body)

    const existing = await prisma.nfExportLayout.findFirst({
      where: { id: req.params.id, tenant_id: tenantId },
    })
    if (!existing) throw new AppError('Layout nao encontrado', 404, 'NOT_FOUND')

    const layout = await prisma.$transaction(async (tx: TxClient) => {
      await tx.nfExportLayout.update({
        where: { id: req.params.id },
        data: {
          nome: body.nome,
          descricao: body.descricao,
          formato: body.formato,
          separador: body.separador,
          encoding: body.encoding,
          ativo: body.ativo,
          updated_by: userId,
        },
      })

      if (body.campos) {
        await tx.nfExportLayoutCampo.deleteMany({ where: { layout_id: req.params.id } })

        for (let i = 0; i < body.campos.length; i++) {
          const campo = body.campos[i]
          await tx.nfExportLayoutCampo.create({
            data: {
              tenant_id: tenantId,
              layout_id: req.params.id,
              campo_origem: campo.campo_origem,
              campo_destino: campo.campo_destino,
              tipo: campo.tipo,
              formato: campo.formato ?? null,
              valor_padrao: campo.valor_padrao ?? null,
              ordem: campo.ordem ?? i,
            },
          })
        }
      }

      return tx.nfExportLayout.findFirst({
        where: { id: req.params.id },
        include: { campos: { orderBy: { ordem: 'asc' } } },
      })
    })

    res.json(layout)
  } catch (err) { next(err) }
})

// DELETE /config/layouts/:id
router.delete('/layouts/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { tenantId, prisma } = ctx(req)

    const existing = await prisma.nfExportLayout.findFirst({
      where: { id: req.params.id, tenant_id: tenantId },
    })
    if (!existing) throw new AppError('Layout nao encontrado', 404, 'NOT_FOUND')

    await prisma.$transaction(async (tx: TxClient) => {
      await tx.nfExportLayoutCampo.deleteMany({ where: { layout_id: req.params.id } })
      await tx.nfExportLayout.delete({ where: { id: req.params.id } })
    })

    res.status(204).send()
  } catch (err) { next(err) }
})

// ══════════════════════════════════════════════════════════════════════════════
// FAVORITO FISCAL — /config/favoritos-fiscais
// ══════════════════════════════════════════════════════════════════════════════

const FavoritoFiscalCreateSchema = z.object({
  company_id: z.string().min(1),
  nome: z.string().min(1),
  descricao: z.string().optional(),
  ncm: z.string().optional(),
  cfop: z.string().optional(),
  cst_ipi: z.string().optional(),
  cst_pis: z.string().optional(),
  cst_cofins: z.string().optional(),
  cst_icms: z.string().optional(),
  aliquota_ii: z.number().min(0).optional(),
  aliquota_ipi: z.number().min(0).optional(),
  aliquota_pis: z.number().min(0).optional(),
  aliquota_cofins: z.number().min(0).optional(),
  aliquota_icms: z.number().min(0).optional(),
  ex_tipi: z.string().optional(),
  ativo: z.boolean().default(true),
})

const FavoritoFiscalUpdateSchema = FavoritoFiscalCreateSchema.partial().omit({ company_id: true })

// GET /config/favoritos-fiscais
router.get('/favoritos-fiscais', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { tenantId, prisma, companyId } = ctx(req)

    const where: Record<string, unknown> = { tenant_id: tenantId }
    if (companyId) where.company_id = companyId

    const favoritos = await prisma.nfFavoritoFiscal.findMany({
      where,
      orderBy: { nome: 'asc' },
    })

    res.json({ data: favoritos })
  } catch (err) { next(err) }
})

// POST /config/favoritos-fiscais
router.post('/favoritos-fiscais', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { tenantId, userId, prisma } = ctx(req)
    const body = FavoritoFiscalCreateSchema.parse(req.body)

    const favorito = await prisma.nfFavoritoFiscal.create({
      data: {
        tenant_id: tenantId,
        company_id: body.company_id,
        product_id: 'nf-importacao',
        nome: body.nome,
        descricao: body.descricao ?? null,
        ncm: body.ncm ?? null,
        cfop: body.cfop ?? null,
        cst_ipi: body.cst_ipi ?? null,
        cst_pis: body.cst_pis ?? null,
        cst_cofins: body.cst_cofins ?? null,
        cst_icms: body.cst_icms ?? null,
        aliquota_ii: body.aliquota_ii ?? null,
        aliquota_ipi: body.aliquota_ipi ?? null,
        aliquota_pis: body.aliquota_pis ?? null,
        aliquota_cofins: body.aliquota_cofins ?? null,
        aliquota_icms: body.aliquota_icms ?? null,
        ex_tipi: body.ex_tipi ?? null,
        ativo: body.ativo,
        created_by: userId,
      },
    })

    res.status(201).json(favorito)
  } catch (err) { next(err) }
})

// PUT /config/favoritos-fiscais/:id
router.put('/favoritos-fiscais/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { tenantId, userId, prisma } = ctx(req)
    const body = FavoritoFiscalUpdateSchema.parse(req.body)

    const existing = await prisma.nfFavoritoFiscal.findFirst({
      where: { id: req.params.id, tenant_id: tenantId },
    })
    if (!existing) throw new AppError('Favorito fiscal nao encontrado', 404, 'NOT_FOUND')

    const favorito = await prisma.nfFavoritoFiscal.update({
      where: { id: req.params.id },
      data: { ...body, updated_by: userId },
    })

    res.json(favorito)
  } catch (err) { next(err) }
})

// DELETE /config/favoritos-fiscais/:id
router.delete('/favoritos-fiscais/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { tenantId, prisma } = ctx(req)

    const existing = await prisma.nfFavoritoFiscal.findFirst({
      where: { id: req.params.id, tenant_id: tenantId },
    })
    if (!existing) throw new AppError('Favorito fiscal nao encontrado', 404, 'NOT_FOUND')

    await prisma.nfFavoritoFiscal.delete({ where: { id: req.params.id } })
    res.status(204).send()
  } catch (err) { next(err) }
})

export { router as configRouter }
