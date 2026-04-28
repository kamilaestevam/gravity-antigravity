/**
 * nfDespesa.ts — CRUD de despesas da NF Importacao
 * Todas as queries filtram por tenant_id + company_id (zero-trust)
 */

import { Router, Request, Response, NextFunction } from 'express'
import { z } from 'zod'
import { AppError, transitarStatus, type NfStatus } from '../services/nfStatusEngine.js'
import { gerarId, PREFIXOS } from '../lib/idGenerator.js'
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

// ── Zod Schemas ─────────────────────────────────────────────────────────────

const DespesaCreateSchema = z.object({
  tipo: z.string().min(1),
  descricao: z.string().optional(),
  valor_total: z.number().min(0),
  moeda: z.string().default('BRL'),
  taxa_cambio: z.number().optional(),
  valor_brl: z.number().min(0).optional(),
  metodo_rateio: z.enum([
    'PESO_LIQUIDO',
    'PESO_BRUTO',
    'VALOR_CIF',
    'VALOR_FOB',
    'QUANTIDADE',
    'VALOR_II',
    'IGUAL',
    'MANUAL',
  ]).default('VALOR_CIF'),
  catalogo_despesa_id: z.string().optional(),
  fornecedor: z.string().optional(),
  numero_documento: z.string().optional(),
  data_documento: z.string().optional(),
  observacoes: z.string().optional(),
})

const DespesaUpdateSchema = DespesaCreateSchema.partial()

const SmartReadSchema = z.object({
  storage_key: z.string().min(1),
  nome_arquivo: z.string().min(1),
  mime_type: z.string().optional(),
})

const AplicarTemplateSchema = z.object({
  template_id: z.string().min(1),
})

const EDITABLE_STATUSES = ['rascunho', 'em_composicao']

// ── Helpers ─────────────────────────────────────────────────────────────────

async function findNfEditable(prisma: PrismaClient, nfId: string, tenantId: string, companyId: string) {
  const where: Record<string, unknown> = { id: nfId, tenant_id: tenantId }
  if (companyId) where.company_id = companyId

  const nf = await prisma.nFImportacao.findFirst({ where })
  if (!nf) throw new AppError('NF Importacao nao encontrada', 404, 'NOT_FOUND')
  if (!EDITABLE_STATUSES.includes(nf.status)) {
    throw new AppError(
      `Despesas so podem ser modificadas quando NF esta em rascunho ou em_composicao (atual: ${nf.status})`,
      422,
      'NOT_EDITABLE'
    )
  }
  return nf
}

// ── GET /:id_nf/despesas — Listar despesas ──────────────────────────────────

router.get('/:id_nf/despesas', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { tenantId, prisma, companyId } = ctx(req)

    const where: Record<string, unknown> = { id: req.params.id_nf, tenant_id: tenantId }
    if (companyId) where.company_id = companyId

    const nf = await prisma.nFImportacao.findFirst({ where, select: { id: true } })
    if (!nf) throw new AppError('NF Importacao nao encontrada', 404, 'NOT_FOUND')

    const despesas = await prisma.nFImportacaoDespesas.findMany({
      where: { nf_importacao_id: req.params.id_nf, tenant_id: tenantId },
      orderBy: { created_at: 'asc' },
      include: {
        rateios: { orderBy: { created_at: 'asc' } },
      },
    })

    res.json({ data: despesas })
  } catch (err) { next(err) }
})

// ── POST /:id_nf/despesas — Adicionar despesa ───────────────────────────────

router.post('/:id_nf/despesas', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { tenantId, userId, prisma, companyId } = ctx(req)
    const body = DespesaCreateSchema.parse(req.body)

    const nf = await findNfEditable(prisma, req.params.id_nf, tenantId, companyId)

    const count = await prisma.nFImportacaoDespesas.count({ where: { tenant_id: tenantId } })
    const despesa = await prisma.nFImportacaoDespesas.create({
      data: {
        id: gerarId(PREFIXOS.DESPESA, count + 1),
        tenant_id: tenantId,
        company_id: nf.company_id,
        product_id: 'nf-importacao',
        user_id: userId,
        nf_importacao_id: req.params.id_nf,
        tipo: body.tipo,
        descricao: body.descricao ?? null,
        valor_total: body.valor_total,
        moeda: body.moeda,
        taxa_cambio: body.taxa_cambio ?? null,
        valor_brl: body.valor_brl ?? null,
        metodo_rateio: body.metodo_rateio,
        catalogo_despesa_id: body.catalogo_despesa_id ?? null,
        fornecedor: body.fornecedor ?? null,
        numero_documento: body.numero_documento ?? null,
        data_documento: body.data_documento ? new Date(body.data_documento) : null,
        observacoes: body.observacoes ?? null,
        created_by: userId,
      },
    })

    // Transitar para em_composicao se rascunho (primeira despesa)
    if (nf.status === 'rascunho') {
      await transitarStatus({
        prisma,
        nfId: req.params.id_nf,
        tenantId,
        companyId: nf.company_id,
        statusNovo: 'em_composicao' as NfStatus,
        userId,
        descricao: 'Primeira despesa adicionada — NF em composicao',
      })
    }

    res.status(201).json(despesa)
  } catch (err) { next(err) }
})

// ── PUT /:id_nf/despesas/:id_despesa — Atualizar despesa ────────────────────

router.put('/:id_nf/despesas/:id_despesa', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { tenantId, userId, prisma, companyId } = ctx(req)
    const body = DespesaUpdateSchema.parse(req.body)

    await findNfEditable(prisma, req.params.id_nf, tenantId, companyId)

    const existing = await prisma.nFImportacaoDespesas.findFirst({
      where: { id: req.params.id_despesa, nf_importacao_id: req.params.id_nf, tenant_id: tenantId },
    })
    if (!existing) throw new AppError('Despesa nao encontrada', 404, 'NOT_FOUND')

    const updateData: Record<string, unknown> = { ...body, updated_by: userId }
    if (body.data_documento) updateData.data_documento = new Date(body.data_documento)

    const despesa = await prisma.nFImportacaoDespesas.update({
      where: { id: req.params.id_despesa },
      data: updateData,
    })

    res.json(despesa)
  } catch (err) { next(err) }
})

// ── DELETE /:id_nf/despesas/:id_despesa — Remover despesa ───────────────────

router.delete('/:id_nf/despesas/:id_despesa', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { tenantId, prisma, companyId } = ctx(req)

    await findNfEditable(prisma, req.params.id_nf, tenantId, companyId)

    const existing = await prisma.nFImportacaoDespesas.findFirst({
      where: { id: req.params.id_despesa, nf_importacao_id: req.params.id_nf, tenant_id: tenantId },
    })
    if (!existing) throw new AppError('Despesa nao encontrada', 404, 'NOT_FOUND')

    // Deletar rateios associados primeiro
    await prisma.nFImportacaoRateio.deleteMany({
      where: { nf_despesa_id: req.params.id_despesa, tenant_id: tenantId },
    })

    await prisma.nFImportacaoDespesas.delete({ where: { id: req.params.id_despesa } })
    res.status(204).send()
  } catch (err) { next(err) }
})

// ── POST /:id_nf/despesas/smart-read — Placeholder para upload Smart Read ───

router.post('/:id_nf/despesas/smart-read', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { tenantId, prisma, companyId } = ctx(req)
    const body = SmartReadSchema.parse(req.body)

    const where: Record<string, unknown> = { id: req.params.id_nf, tenant_id: tenantId }
    if (companyId) where.company_id = companyId

    const nf = await prisma.nFImportacao.findFirst({ where, select: { id: true, status: true } })
    if (!nf) throw new AppError('NF Importacao nao encontrada', 404, 'NOT_FOUND')
    if (!EDITABLE_STATUSES.includes(nf.status)) {
      throw new AppError('NF nao esta em status editavel', 422, 'NOT_EDITABLE')
    }

    // Placeholder: Smart Read sera implementado com integracao OCR+AI
    // Por enquanto retorna aceite do upload para processamento assincrono
    res.status(202).json({
      message: 'Documento recebido para processamento Smart Read',
      nf_importacao_id: req.params.id_nf,
      storage_key: body.storage_key,
      nome_arquivo: body.nome_arquivo,
      status: 'processando',
    })
  } catch (err) { next(err) }
})

// ── POST /:id_nf/despesas/aplicar-template — Aplicar template de despesas ───

router.post('/:id_nf/despesas/aplicar-template', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { tenantId, userId, prisma, companyId } = ctx(req)
    const body = AplicarTemplateSchema.parse(req.body)

    const nf = await findNfEditable(prisma, req.params.id_nf, tenantId, companyId)

    // Buscar template com itens
    const template = await prisma.nfDespesaTemplate.findFirst({
      where: { id: body.template_id, tenant_id: tenantId },
      include: { itens: true },
    })

    if (!template) {
      throw new AppError('Template nao encontrado', 404, 'NOT_FOUND')
    }

    // Criar despesas a partir dos itens do template
    const despesasCriadas: Array<Record<string, unknown>> = []
    const despesaCount = await prisma.nFImportacaoDespesas.count({ where: { tenant_id: tenantId } })

    for (let i = 0; i < template.itens.length; i++) {
      const templateItem = template.itens[i]
      const despesa = await prisma.nFImportacaoDespesas.create({
        data: {
          id: gerarId(PREFIXOS.DESPESA, despesaCount + i + 1),
          tenant_id: tenantId,
          company_id: nf.company_id,
          product_id: 'nf-importacao',
          user_id: userId,
          nf_importacao_id: req.params.id_nf,
          tipo: (templateItem as Record<string, unknown>).tipo as string,
          descricao: (templateItem as Record<string, unknown>).descricao as string ?? null,
          valor_total: 0,
          moeda: 'BRL',
          metodo_rateio: (templateItem as Record<string, unknown>).metodo_rateio as string ?? 'VALOR_CIF',
          created_by: userId,
        },
      })
      despesasCriadas.push(despesa as unknown as Record<string, unknown>)
    }

    // Transitar para em_composicao se rascunho
    if (nf.status === 'rascunho' && despesasCriadas.length > 0) {
      await transitarStatus({
        prisma,
        nfId: req.params.id_nf,
        tenantId,
        companyId: nf.company_id,
        statusNovo: 'em_composicao' as NfStatus,
        userId,
        descricao: `Template "${template.nome}" aplicado — NF em composicao`,
      })
    }

    res.status(201).json({
      message: `Template aplicado: ${despesasCriadas.length} despesas criadas`,
      template_id: body.template_id,
      template_nome: template.nome,
      despesas_criadas: despesasCriadas.length,
    })
  } catch (err) { next(err) }
})

export { router as nfDespesaRouter }
