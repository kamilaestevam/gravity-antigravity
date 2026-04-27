/**
 * nfImportacao.ts — Rotas CRUD de NF Importacao
 * Todas as queries filtram por tenant_id + company_id (zero-trust)
 * Status muda apenas via nfStatusEngine
 */

import { Router, Request, Response, NextFunction } from 'express'
import { z } from 'zod'
import { AppError, transitarStatus } from '../services/nfStatusEngine.js'
import { gerarId, PREFIXOS } from '../lib/idGenerator.js'
import type { PrismaClient, Prisma } from '@prisma/client'

type TxClient = Omit<PrismaClient, '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'>

const router = Router()

// ── Contexto de tenant (zero-trust) ────────────────────────────────────────

function ctx(req: Request) {
  return {
    tenantId: (req as unknown as Record<string, unknown>).tenantId as string,
    userId: (req as unknown as Record<string, unknown>).userId as string,
    prisma: (req as unknown as Record<string, unknown>).prisma as PrismaClient,
    companyId: req.headers['x-company-id'] as string || '',
  }
}

// ── Zod Schemas ─────────────────────────────────────────────────────────────

const NfListaQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  status: z.string().optional(),
  busca: z.string().optional(),
  ordenar_por: z.enum(['created_at', 'updated_at', 'numero_nf', 'status']).default('created_at'),
  direcao: z.enum(['asc', 'desc']).default('desc'),
})

const NfCreateSchema = z.object({
  company_id: z.string().min(1),
  numero_nf: z.string().optional(),
  serie: z.string().optional(),
  chave_acesso: z.string().optional(),
  tipo_operacao: z.enum(['importacao', 'importacao_indireta']).default('importacao'),
  natureza_operacao: z.string().optional(),
  data_emissao: z.string().optional(),
  data_entrada: z.string().optional(),
  exportador_nome: z.string().optional(),
  exportador_pais: z.string().optional(),
  importador_cnpj: z.string().optional(),
  importador_nome: z.string().optional(),
  moeda: z.string().default('USD'),
  taxa_cambio: z.number().optional(),
  valor_total_fob: z.number().optional(),
  valor_frete: z.number().optional(),
  valor_seguro: z.number().optional(),
  valor_total_cif: z.number().optional(),
  incoterm: z.string().optional(),
  via_transporte: z.string().optional(),
  porto_embarque: z.string().optional(),
  porto_destino: z.string().optional(),
  processo_id: z.string().optional(),
  di_numero: z.string().optional(),
  duimp_numero: z.string().optional(),
  canal_entrada: z.enum(['MANUAL', 'XML', 'SMART_READ', 'PORTAL_UNICO', 'PROCESSO']).default('MANUAL'),
  observacoes: z.string().optional(),
})

const NfUpdateSchema = NfCreateSchema.partial().omit({ company_id: true, canal_entrada: true })

// ── EDITABLE_STATUSES ───────────────────────────────────────────────────────

const EDITABLE_STATUSES = ['rascunho', 'em_composicao']

// ── GET / — Listar NFs (paginado + filtrado) ────────────────────────────────

router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { tenantId, prisma, companyId } = ctx(req)
    const query = NfListaQuerySchema.parse(req.query)

    const where: Record<string, unknown> = { tenant_id: tenantId }
    if (companyId) where.company_id = companyId
    if (query.status) where.status = query.status
    if (query.busca) {
      where.OR = [
        { numero_nf: { contains: query.busca, mode: 'insensitive' } },
        { chave_acesso: { contains: query.busca, mode: 'insensitive' } },
        { exportador_nome: { contains: query.busca, mode: 'insensitive' } },
        { importador_nome: { contains: query.busca, mode: 'insensitive' } },
        { di_numero: { contains: query.busca, mode: 'insensitive' } },
      ]
    }

    const skip = (query.page - 1) * query.limit

    const [data, total] = await Promise.all([
      prisma.nFImportacao.findMany({
        where,
        orderBy: { [query.ordenar_por]: query.direcao },
        skip,
        take: query.limit,
        include: {
          _count: { select: { itens: true, despesas: true } },
        },
      }),
      prisma.nFImportacao.count({ where }),
    ])

    res.json({ data, total, page: query.page, limit: query.limit })
  } catch (err) { next(err) }
})

// ── POST / — Criar NF (rascunho) ───────────────────────────────────────────

router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { tenantId, userId, prisma } = ctx(req)
    const body = NfCreateSchema.parse(req.body)

    const count = await prisma.nFImportacao.count({ where: { tenant_id: tenantId } })
    const id = gerarId(PREFIXOS.NF, count + 1)

    const nf = await prisma.$transaction(async (tx: TxClient) => {
      const created = await tx.nFImportacao.create({
        data: {
          id,
          tenant_id: tenantId,
          company_id: body.company_id,
          product_id: 'nf-importacao',
          user_id: userId,
          numero_nf: body.numero_nf ?? null,
          serie: body.serie ?? null,
          chave_acesso: body.chave_acesso ?? null,
          tipo_operacao: body.tipo_operacao,
          natureza_operacao: body.natureza_operacao ?? null,
          data_emissao: body.data_emissao ? new Date(body.data_emissao) : null,
          data_entrada: body.data_entrada ? new Date(body.data_entrada) : null,
          exportador_nome: body.exportador_nome ?? null,
          exportador_pais: body.exportador_pais ?? null,
          importador_cnpj: body.importador_cnpj ?? null,
          importador_nome: body.importador_nome ?? null,
          moeda: body.moeda,
          taxa_cambio: body.taxa_cambio ?? null,
          valor_total_fob: body.valor_total_fob ?? null,
          valor_frete: body.valor_frete ?? null,
          valor_seguro: body.valor_seguro ?? null,
          valor_total_cif: body.valor_total_cif ?? null,
          incoterm: body.incoterm ?? null,
          via_transporte: body.via_transporte ?? null,
          porto_embarque: body.porto_embarque ?? null,
          porto_destino: body.porto_destino ?? null,
          processo_id: body.processo_id ?? null,
          di_numero: body.di_numero ?? null,
          duimp_numero: body.duimp_numero ?? null,
          canal_entrada: body.canal_entrada,
          observacoes: body.observacoes ?? null,
          status: 'rascunho',
          created_by: userId,
        },
      })

      await tx.nFImportacaoHistorico.create({
        data: {
          tenant_id: tenantId,
          company_id: body.company_id,
          product_id: 'nf-importacao',
          user_id: userId,
          nf_importacao_id: id,
          evento: 'criacao',
          status_novo: 'rascunho',
          descricao: `NF Importacao criada via ${body.canal_entrada}`,
        },
      })

      return created
    })

    res.status(201).json(nf)
  } catch (err) { next(err) }
})

// ── GET /:id — Detalhar NF ─────────────────────────────────────────────────

router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { tenantId, prisma, companyId } = ctx(req)

    const where: Record<string, unknown> = { id: req.params.id, tenant_id: tenantId }
    if (companyId) where.company_id = companyId

    const nf = await prisma.nFImportacao.findFirst({
      where,
      include: {
        itens: { orderBy: { created_at: 'asc' } },
        despesas: {
          orderBy: { created_at: 'asc' },
          include: {
            rateios: { orderBy: { created_at: 'asc' } },
          },
        },
      },
    })

    if (!nf) {
      throw new AppError('NF Importacao nao encontrada', 404, 'NOT_FOUND')
    }

    res.json(nf)
  } catch (err) { next(err) }
})

// ── PUT /:id — Atualizar NF (apenas em status editavel) ────────────────────

router.put('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { tenantId, userId, prisma, companyId } = ctx(req)
    const body = NfUpdateSchema.parse(req.body)

    const where: Record<string, unknown> = { id: req.params.id, tenant_id: tenantId }
    if (companyId) where.company_id = companyId

    const existing = await prisma.nFImportacao.findFirst({ where })

    if (!existing) {
      throw new AppError('NF Importacao nao encontrada', 404, 'NOT_FOUND')
    }

    if (!EDITABLE_STATUSES.includes(existing.status)) {
      throw new AppError(
        `NF em status "${existing.status}" nao pode ser editada`,
        422,
        'NOT_EDITABLE'
      )
    }

    const updateData: Record<string, unknown> = { ...body, updated_by: userId }
    if (body.data_emissao) updateData.data_emissao = new Date(body.data_emissao)
    if (body.data_entrada) updateData.data_entrada = new Date(body.data_entrada)

    const nf = await prisma.nFImportacao.update({
      where: { id: req.params.id },
      data: updateData,
    })

    res.json(nf)
  } catch (err) { next(err) }
})

// ── DELETE /:id — Cancelar NF (soft delete via status engine) ───────────────

router.delete('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { tenantId, userId, prisma, companyId } = ctx(req)

    const where: Record<string, unknown> = { id: req.params.id, tenant_id: tenantId }
    if (companyId) where.company_id = companyId

    const existing = await prisma.nFImportacao.findFirst({ where })

    if (!existing) {
      throw new AppError('NF Importacao nao encontrada', 404, 'NOT_FOUND')
    }

    await transitarStatus({
      prisma,
      nfId: req.params.id,
      tenantId,
      companyId: existing.company_id,
      statusNovo: 'cancelada',
      userId,
      descricao: 'NF cancelada pelo usuario',
    })

    const updated = await prisma.nFImportacao.findFirst({ where: { id: req.params.id } })
    res.json(updated)
  } catch (err) { next(err) }
})

// ── POST /:id/duplicar — Duplicar NF como novo rascunho ────────────────────

router.post('/:id/duplicar', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { tenantId, userId, prisma, companyId } = ctx(req)

    const where: Record<string, unknown> = { id: req.params.id, tenant_id: tenantId }
    if (companyId) where.company_id = companyId

    const original = await prisma.nFImportacao.findFirst({
      where,
      include: { itens: true },
    })

    if (!original) {
      throw new AppError('NF Importacao nao encontrada', 404, 'NOT_FOUND')
    }

    const count = await prisma.nFImportacao.count({ where: { tenant_id: tenantId } })
    const novoId = gerarId(PREFIXOS.NF, count + 1)

    const novo = await prisma.$transaction(async (tx: TxClient) => {
      const created = await tx.nFImportacao.create({
        data: {
          id: novoId,
          tenant_id: tenantId,
          company_id: original.company_id,
          product_id: 'nf-importacao',
          user_id: userId,
          numero_nf: null,
          serie: original.serie,
          tipo_operacao: original.tipo_operacao,
          natureza_operacao: original.natureza_operacao,
          exportador_nome: original.exportador_nome,
          exportador_pais: original.exportador_pais,
          importador_cnpj: original.importador_cnpj,
          importador_nome: original.importador_nome,
          moeda: original.moeda,
          taxa_cambio: original.taxa_cambio,
          incoterm: original.incoterm,
          via_transporte: original.via_transporte,
          porto_embarque: original.porto_embarque,
          porto_destino: original.porto_destino,
          canal_entrada: 'MANUAL',
          observacoes: `Duplicado a partir de ${original.id}`,
          status: 'rascunho',
          created_by: userId,
        },
      })

      // Duplicar itens
      const itemCount = await tx.nFImportacaoItens.count({ where: { tenant_id: tenantId } })
      for (let i = 0; i < original.itens.length; i++) {
        const item = original.itens[i]
        await tx.nFImportacaoItens.create({
          data: {
            id: gerarId(PREFIXOS.ITEM, itemCount + i + 1),
            tenant_id: tenantId,
            company_id: original.company_id,
            product_id: 'nf-importacao',
            user_id: userId,
            nf_importacao_id: novoId,
            numero_item: item.numero_item,
            ncm: item.ncm,
            descricao: item.descricao,
            cfop: item.cfop,
            quantidade: item.quantidade,
            unidade_medida: item.unidade_medida,
            peso_liquido: item.peso_liquido,
            peso_bruto: item.peso_bruto,
            valor_unitario: item.valor_unitario,
            valor_fob: item.valor_fob,
            valor_frete_item: item.valor_frete_item,
            valor_seguro_item: item.valor_seguro_item,
            valor_cif: item.valor_cif,
            aliquota_ii: item.aliquota_ii,
            valor_ii: item.valor_ii,
            aliquota_ipi: item.aliquota_ipi,
            valor_ipi: item.valor_ipi,
            aliquota_pis: item.aliquota_pis,
            valor_pis: item.valor_pis,
            aliquota_cofins: item.aliquota_cofins,
            valor_cofins: item.valor_cofins,
            aliquota_icms: item.aliquota_icms,
            valor_icms: item.valor_icms,
            cst_ipi: item.cst_ipi,
            cst_pis: item.cst_pis,
            cst_cofins: item.cst_cofins,
            cst_icms: item.cst_icms,
          },
        })
      }

      await tx.nFImportacaoHistorico.create({
        data: {
          tenant_id: tenantId,
          company_id: original.company_id,
          product_id: 'nf-importacao',
          user_id: userId,
          nf_importacao_id: novoId,
          evento: 'duplicacao',
          status_novo: 'rascunho',
          descricao: `Duplicado a partir de ${original.id}`,
          dados_extras: { nf_origem_id: original.id },
        },
      })

      return created
    })

    res.status(201).json(novo)
  } catch (err) { next(err) }
})

export { router as nfImportacaoRouter }
