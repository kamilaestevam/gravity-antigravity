/**
 * lancamentos.ts — CRUD de lançamentos financeiros
 * Todas as queries filtram por tenant_id (zero-trust)
 */

import { Router, Request, Response, NextFunction } from 'express'
import { z } from 'zod'
import { AppError } from '../lib/AppError.js'
import { calcularValorBRL } from '../lib/currencyConverter.js'
import type { PrismaClient } from '@prisma/client'

const router = Router()

function ctx(req: Request) {
  return {
    tenantId: (req as unknown as Record<string, unknown>).tenantId as string,
    userId: (req as unknown as Record<string, unknown>).userId as string,
    prisma: (req as unknown as Record<string, unknown>).prisma as PrismaClient,
    companyId: (req.headers['x-id-workspace'] as string) || '',
  }
}

const LancamentoCreateSchema = z.object({
  financeiro_id: z.string().min(1),
  categoria_id: z.string().min(1),
  moeda: z.enum(['BRL', 'USD', 'EUR', 'GBP', 'CHF', 'CNY', 'ARS', 'UYU']),
  taxa_cambio: z.number().positive(),
  valor: z.number().positive(),
  fornecedor_id: z.string().optional(),
  fornecedor_nome: z.string().optional(),
  tipo_fornecedor: z.enum([
    'AGENTE_DE_CARGA', 'ARMADOR', 'CIA_AEREA', 'ARMAZEM_ALFANDEGADO', 'ARMAZEM',
    'TRANSPORTADORA_RODOVIARIA', 'SEGURADORA', 'CORRETORA_DE_CAMBIO', 'EXPORTADOR',
    'FABRICANTE', 'TRADING', 'DESPACHANTE', 'RECEITA_FEDERAL', 'OUTRO',
  ]).optional(),
  condicao_id: z.string().optional(),
  condicao_descricao: z.string().optional(),
  data_pagamento: z.string().datetime().optional(),
  data_vencimento: z.string().datetime().optional(),
  status_pagamento: z.enum(['PENDENTE', 'AGENDADO', 'PAGO']).default('PENDENTE'),
  observacao: z.string().max(500).optional(),
  despesa_aduaneira: z.boolean().default(false),
  despesa_nf: z.boolean().default(false),
  espelho_nf: z.boolean().default(true),
  tipo_documento: z.enum(['BOLETO', 'NOTA_FISCAL', 'DEMONSTRATIVO', 'FATURA', 'FATURAMENTO', 'OUTRO']).optional(),
  numero_documento: z.string().optional(),
  canal_entrada: z.enum(['MANUAL', 'XML_DUIMP', 'PORTAL_UNICO', 'SMART_READ', 'PLANILHA', 'EMAIL']).default('MANUAL'),
  icms_origem_portal: z.boolean().default(false),
})

const LancamentoUpdateSchema = LancamentoCreateSchema.partial().omit({ financeiro_id: true, canal_entrada: true })

const ListaQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(50),
  status: z.enum(['PENDENTE', 'AGENDADO', 'PAGO']).optional(),
  grupo_custo: z.enum(['IMPOSTOS_FEDERAIS', 'CUSTO_OPERACIONAL']).optional(),
  ordenar_por: z.enum(['created_at', 'data_pagamento', 'data_vencimento', 'valor_brl']).default('created_at'),
  direcao: z.enum(['asc', 'desc']).default('desc'),
})

// GET /:processoId/lancamentos
router.get('/:processoId/lancamentos', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { tenantId, prisma, companyId } = ctx(req)
    const query = ListaQuerySchema.parse(req.query)

    const financeiro = await prisma.financeiroProcesso.findFirst({
      where: { processo_id: req.params.processoId, tenant_id: tenantId },
    })
    if (!financeiro) throw new AppError('Processo financeiro nao encontrado', 404, 'NOT_FOUND')

    const where: Record<string, unknown> = {
      tenant_id: tenantId,
      financeiro_id: financeiro.id,
    }
    if (companyId) where.company_id = companyId
    if (query.status) where.status_pagamento = query.status
    if (query.grupo_custo) where.grupo_custo = query.grupo_custo

    const [total, lancamentos] = await Promise.all([
      prisma.financeiroLancamento.count({ where }),
      prisma.financeiroLancamento.findMany({
        where,
        orderBy: { [query.ordenar_por]: query.direcao },
        skip: (query.page - 1) * query.limit,
        take: query.limit,
        include: { categoria: true },
      }),
    ])

    res.json({
      data: lancamentos,
      meta: { total, page: query.page, limit: query.limit, pages: Math.ceil(total / query.limit) },
    })
  } catch (err) { next(err) }
})

// POST /:processoId/lancamentos
router.post('/:processoId/lancamentos', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { tenantId, userId, prisma, companyId } = ctx(req)
    const body = LancamentoCreateSchema.parse(req.body)

    const financeiro = await prisma.financeiroProcesso.findFirst({
      where: { processo_id: req.params.processoId, tenant_id: tenantId },
    })
    if (!financeiro) throw new AppError('Processo financeiro nao encontrado', 404, 'NOT_FOUND')

    const categoria = await prisma.financeiroCategorias.findFirst({
      where: { id: body.categoria_id, tenant_id: tenantId },
    })
    if (!categoria) throw new AppError('Categoria nao encontrada', 404, 'NOT_FOUND')

    const valor_brl = calcularValorBRL(body.valor, body.taxa_cambio)

    const lancamento = await prisma.financeiroLancamento.create({
      data: {
        tenant_id: tenantId,
        company_id: companyId || financeiro.company_id,
        financeiro_id: financeiro.id,
        categoria_id: body.categoria_id,
        categoria_nome: categoria.nome,
        grupo_custo: categoria.grupo_custo,
        moeda: body.moeda,
        taxa_cambio: body.taxa_cambio,
        valor: body.valor,
        valor_brl,
        fornecedor_id: body.fornecedor_id ?? null,
        fornecedor_nome: body.fornecedor_nome ?? null,
        tipo_fornecedor: body.tipo_fornecedor ?? null,
        condicao_id: body.condicao_id ?? null,
        condicao_descricao: body.condicao_descricao ?? null,
        data_pagamento: body.data_pagamento ? new Date(body.data_pagamento) : null,
        data_vencimento: body.data_vencimento ? new Date(body.data_vencimento) : null,
        status_pagamento: body.status_pagamento,
        observacao: body.observacao ?? null,
        despesa_aduaneira: body.despesa_aduaneira,
        despesa_nf: body.despesa_nf,
        espelho_nf: body.espelho_nf,
        tipo_documento: body.tipo_documento ?? null,
        numero_documento: body.numero_documento ?? null,
        canal_entrada: body.canal_entrada,
        icms_origem_portal: body.icms_origem_portal,
        created_by: userId,
      },
    })

    await recalcularTotais(prisma, financeiro.id, tenantId)

    res.status(201).json(lancamento)
  } catch (err) { next(err) }
})

// PUT /:processoId/lancamentos/:id
router.put('/:processoId/lancamentos/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { tenantId, userId, prisma } = ctx(req)
    const body = LancamentoUpdateSchema.parse(req.body)

    const existing = await prisma.financeiroLancamento.findFirst({
      where: { id: req.params.id, tenant_id: tenantId },
    })
    if (!existing) throw new AppError('Lancamento nao encontrado', 404, 'NOT_FOUND')

    let valor_brl = Number(existing.valor_brl)
    if (body.valor !== undefined || body.taxa_cambio !== undefined) {
      const valor = body.valor ?? Number(existing.valor)
      const taxa = body.taxa_cambio ?? Number(existing.taxa_cambio)
      valor_brl = calcularValorBRL(valor, taxa)
    }

    let categoria_nome = existing.categoria_nome
    let grupo_custo = existing.grupo_custo
    if (body.categoria_id) {
      const cat = await prisma.financeiroCategorias.findFirst({
        where: { id: body.categoria_id, tenant_id: tenantId },
      })
      if (!cat) throw new AppError('Categoria nao encontrada', 404, 'NOT_FOUND')
      categoria_nome = cat.nome
      grupo_custo = cat.grupo_custo
    }

    const lancamento = await prisma.financeiroLancamento.update({
      where: { id: req.params.id },
      data: {
        categoria_id: body.categoria_id ?? existing.categoria_id,
        categoria_nome,
        grupo_custo,
        moeda: body.moeda ?? existing.moeda,
        taxa_cambio: body.taxa_cambio ?? existing.taxa_cambio,
        valor: body.valor ?? existing.valor,
        valor_brl,
        fornecedor_id: body.fornecedor_id !== undefined ? body.fornecedor_id ?? null : existing.fornecedor_id,
        fornecedor_nome: body.fornecedor_nome !== undefined ? body.fornecedor_nome ?? null : existing.fornecedor_nome,
        tipo_fornecedor: body.tipo_fornecedor !== undefined ? body.tipo_fornecedor ?? null : existing.tipo_fornecedor,
        condicao_id: body.condicao_id !== undefined ? body.condicao_id ?? null : existing.condicao_id,
        condicao_descricao: body.condicao_descricao !== undefined ? body.condicao_descricao ?? null : existing.condicao_descricao,
        data_pagamento: body.data_pagamento !== undefined ? (body.data_pagamento ? new Date(body.data_pagamento) : null) : existing.data_pagamento,
        data_vencimento: body.data_vencimento !== undefined ? (body.data_vencimento ? new Date(body.data_vencimento) : null) : existing.data_vencimento,
        status_pagamento: body.status_pagamento ?? existing.status_pagamento,
        observacao: body.observacao !== undefined ? body.observacao ?? null : existing.observacao,
        despesa_aduaneira: body.despesa_aduaneira ?? existing.despesa_aduaneira,
        despesa_nf: body.despesa_nf ?? existing.despesa_nf,
        espelho_nf: body.espelho_nf ?? existing.espelho_nf,
        tipo_documento: body.tipo_documento !== undefined ? body.tipo_documento ?? null : existing.tipo_documento,
        numero_documento: body.numero_documento !== undefined ? body.numero_documento ?? null : existing.numero_documento,
      },
    })

    await recalcularTotais(prisma, existing.financeiro_id, tenantId)

    res.json(lancamento)
  } catch (err) { next(err) }
})

// DELETE /:processoId/lancamentos/:id
router.delete('/:processoId/lancamentos/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { tenantId, prisma } = ctx(req)

    const existing = await prisma.financeiroLancamento.findFirst({
      where: { id: req.params.id, tenant_id: tenantId },
    })
    if (!existing) throw new AppError('Lancamento nao encontrado', 404, 'NOT_FOUND')

    await prisma.financeiroLancamento.delete({ where: { id: req.params.id } })
    await recalcularTotais(prisma, existing.financeiro_id, tenantId)

    res.status(204).send()
  } catch (err) { next(err) }
})

// ── Helper: recalcular totalizadores do FinanceiroProcesso ──────────────────

async function recalcularTotais(prisma: PrismaClient, financeiroId: string, tenantId: string) {
  const lancamentos = await prisma.financeiroLancamento.findMany({
    where: { financeiro_id: financeiroId, tenant_id: tenantId },
    select: { valor_brl: true, valor: true, moeda: true, status_pagamento: true },
  })

  const numerarios = await prisma.financeiroNumerario.findMany({
    where: { financeiro_id: financeiroId, tenant_id: tenantId },
    select: { valor_total: true },
  })

  let total_brl = 0, total_usd = 0, total_eur = 0, total_outros = 0
  let pagos = 0, agendados = 0, pendente = 0

  for (const l of lancamentos) {
    const vbrl = Number(l.valor_brl)
    const v = Number(l.valor)
    total_brl += vbrl
    if (l.moeda === 'USD') total_usd += v
    else if (l.moeda === 'EUR') total_eur += v
    else if (l.moeda !== 'BRL') total_outros += vbrl
    if (l.status_pagamento === 'PAGO') pagos += vbrl
    else if (l.status_pagamento === 'AGENDADO') agendados += vbrl
    else pendente += vbrl
  }

  const adiantado = numerarios.reduce((s, n) => s + Number(n.valor_total), 0)
  // Saldo = Numerario - Custos (negativo = empresa ainda deve)
  const saldo = adiantado - total_brl

  await prisma.financeiroProcesso.update({
    where: { id: financeiroId },
    data: { total_brl, total_usd, total_eur, total_outros, pagos, agendados, pendente, adiantado, saldo },
  })
}

export { router as lancamentosRouter, recalcularTotais }
