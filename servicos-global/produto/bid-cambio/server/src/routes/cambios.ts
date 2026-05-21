/**
 * cambios.ts — Rotas de Gestao de Parcelas de Cambio (Pilar 1)
 * CRUD de parcelas, agendamento, pagamento, retorno a pendente
 */

import { Router, Request, Response, NextFunction } from 'express'
import { z } from 'zod'
import { AppError } from '../lib/errors.js'
import { agendarParcelas, pagarParcela, retornarParaPendente, recalcularParcelas } from '../services/parcelaEngine.js'
import { atividadesIntegration, historicoIntegration } from '../services/tenantIntegrations.js'

export const cambiosRouter = Router()

// --- Schemas Zod ---

const listarSchema = z.object({
  status_parcela_bid_cambio: z.enum(['PENDENTE', 'AGENDADO', 'PAGO']).optional(),
  moeda_parcela_bid_cambio: z.string().optional(),
  data_vencimento_inicio: z.string().optional(),
  data_vencimento_fim: z.string().optional(),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(50),
})

const agendarSchema = z.object({
  parcela_ids: z.array(z.string()).min(1),
  data_agendamento_parcela_bid_cambio: z.string().refine(d => !isNaN(Date.parse(d)), 'Data invalida'),
})

const pagarSchema = z.object({
  id_parcela_bid_cambio: z.string(),
  valor_pago_parcela_bid_cambio: z.number().positive(),
  taxa_fechamento_parcela_bid_cambio: z.number().positive(),
  banco_corretora_parcela_bid_cambio: z.string().min(1),
  numero_contrato_cambio_parcela_bid_cambio: z.string().optional(),
  anexos: z.array(z.object({
    nome_arquivo_anexo_bid_cambio: z.string().optional(),
    nome_original_anexo_bid_cambio: z.string(),
    url_anexo_bid_cambio: z.string().url(),
    categoria_anexo_bid_cambio: z.string().optional(),
  })).optional(),
})

// --- GET /api/v1/bid-cambio/cambios ---
cambiosRouter.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const query = listarSchema.parse(req.query)
    const prisma = req.prisma!
    const skip = (query.page - 1) * query.limit

    const where: Record<string, unknown> = {}
    if (query.status_parcela_bid_cambio) where.status_parcela_bid_cambio = query.status_parcela_bid_cambio
    if (query.moeda_parcela_bid_cambio) where.moeda_parcela_bid_cambio = query.moeda_parcela_bid_cambio
    if (query.data_vencimento_inicio || query.data_vencimento_fim) {
      const dataRange: { gte?: Date; lte?: Date } = {}
      if (query.data_vencimento_inicio) dataRange.gte = new Date(query.data_vencimento_inicio)
      if (query.data_vencimento_fim) dataRange.lte = new Date(query.data_vencimento_fim)
      where.data_vencimento_parcela_bid_cambio = dataRange
    }

    const [parcelas, total] = await Promise.all([
      (prisma as any).bidCambioParcela.findMany({
        where,
        orderBy: { data_vencimento_parcela_bid_cambio: 'asc' },
        skip,
        take: query.limit,
        include: { anexos: true },
      }),
      (prisma as any).bidCambioParcela.count({ where }),
    ])

    res.json({
      data: parcelas,
      pagination: {
        page: query.page,
        limit: query.limit,
        total,
        pages: Math.ceil(total / query.limit),
      },
    })
  } catch (err) { next(err) }
})

// --- GET /api/v1/bid-cambio/cambios/totais ---
cambiosRouter.get('/totais', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const prisma = req.prisma!
    const statusFilter = req.query.status_parcela_bid_cambio as string | undefined

    const where: Record<string, unknown> = {}
    if (statusFilter) where.status_parcela_bid_cambio = statusFilter

    const totais = await (prisma as any).bidCambioParcela.groupBy({
      by: ['moeda_parcela_bid_cambio'],
      where: { ...where, status_parcela_bid_cambio: { in: ['PENDENTE', 'AGENDADO'] } },
      _sum: { valor_a_pagar_parcela_bid_cambio: true, valor_a_pagar_brl_parcela_bid_cambio: true },
      _count: true,
    })

    res.json(totais)
  } catch (err) { next(err) }
})

// --- GET /api/v1/bid-cambio/cambios/:id ---
cambiosRouter.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parcela = await (req.prisma as any).bidCambioParcela.findFirst({
      where: { id_parcela_bid_cambio: req.params.id },
      include: { anexos: true },
    })
    if (!parcela) throw new AppError('Parcela nao encontrada', 404, 'NOT_FOUND')
    res.json(parcela)
  } catch (err) { next(err) }
})

// --- POST /api/v1/bid-cambio/cambios/agendar ---
cambiosRouter.post('/agendar', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const input = agendarSchema.parse(req.body)
    const tenantId = req.tenantId!
    const userId = req.headers['x-id-usuario'] as string

    const result = await agendarParcelas(req.prisma!, tenantId, userId, input)

    historicoIntegration.registrar(tenantId, userId, {
      acao: 'AGENDAR_CAMBIO',
      entidade: 'BidCambioParcela',
      entidade_id: input.parcela_ids.join(','),
      detalhes: { data_agendamento_parcela_bid_cambio: input.data_agendamento_parcela_bid_cambio, total: result.agendadas },
    })

    res.json(result)
  } catch (err) { next(err) }
})

// --- POST /api/v1/bid-cambio/cambios/pagar ---
cambiosRouter.post('/pagar', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const input = pagarSchema.parse(req.body)
    const tenantId = req.tenantId!
    const userId = req.headers['x-id-usuario'] as string

    const result = await pagarParcela(req.prisma!, tenantId, userId, input)

    historicoIntegration.registrar(tenantId, userId, {
      acao: 'PAGAR_CAMBIO',
      entidade: 'BidCambioParcela',
      entidade_id: input.id_parcela_bid_cambio,
      detalhes: { valor: result.valor_pago_parcela_bid_cambio, taxa: result.taxa_fechamento_parcela_bid_cambio, banco: input.banco_corretora_parcela_bid_cambio },
    })

    atividadesIntegration.parcelaPaga(tenantId, userId, {
      referencia: input.id_parcela_bid_cambio,
      valor: result.valor_pago_parcela_bid_cambio.toFixed(2),
      moeda: 'USD',
    })

    res.json(result)
  } catch (err) { next(err) }
})

// --- POST /api/v1/bid-cambio/cambios/retornar-pendente ---
cambiosRouter.post('/retornar-pendente', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id_parcela_bid_cambio } = z.object({ id_parcela_bid_cambio: z.string() }).parse(req.body)
    const result = await retornarParaPendente(req.prisma!, id_parcela_bid_cambio)

    historicoIntegration.registrar(req.tenantId!, req.headers['x-id-usuario'] as string, {
      acao: 'RETORNAR_PENDENTE',
      entidade: 'BidCambioParcela',
      entidade_id: id_parcela_bid_cambio,
    })

    res.json(result)
  } catch (err) { next(err) }
})

// --- POST /api/v1/bid-cambio/cambios/exportar ---

const exportarSchema = z.object({
  formato: z.enum(['csv', 'xlsx']).default('csv'),
  status_parcela_bid_cambio: z.enum(['PENDENTE', 'AGENDADO', 'PAGO']).optional(),
  moeda_parcela_bid_cambio: z.string().optional(),
})

const CSV_HEADERS = [
  'Referencia', 'Pedido', 'Exportador', 'Moeda', 'Cambio Total',
  '% Parcela', 'Valor a Pagar', 'Valor BRL', 'Parcela', 'Total Parcelas',
  'Status', 'Vencimento', 'Agendamento', 'Pagamento', 'Taxa Fechamento',
  'Banco/Corretora', 'Contrato Cambio',
]

function parcelaToCsvRow(p: Record<string, unknown>): string {
  const fields = [
    p.referencia_processo_parcela_bid_cambio ?? '',
    p.numero_pedido_parcela_bid_cambio ?? '',
    p.exportador_parcela_bid_cambio ?? '',
    p.moeda_parcela_bid_cambio ?? '',
    p.cambio_total_parcela_bid_cambio ?? '',
    p.porcentagem_parcela_bid_cambio ?? '',
    p.valor_a_pagar_parcela_bid_cambio ?? '',
    p.valor_a_pagar_brl_parcela_bid_cambio ?? '',
    p.numero_parcela_bid_cambio ?? '',
    p.total_parcelas_parcela_bid_cambio ?? '',
    p.status_parcela_bid_cambio ?? '',
    p.data_vencimento_parcela_bid_cambio ? new Date(p.data_vencimento_parcela_bid_cambio as string).toISOString().split('T')[0] : '',
    p.data_agendamento_parcela_bid_cambio ? new Date(p.data_agendamento_parcela_bid_cambio as string).toISOString().split('T')[0] : '',
    p.data_pagamento_parcela_bid_cambio ? new Date(p.data_pagamento_parcela_bid_cambio as string).toISOString().split('T')[0] : '',
    p.taxa_fechamento_parcela_bid_cambio ?? '',
    p.banco_corretora_parcela_bid_cambio ?? '',
    p.numero_contrato_cambio_parcela_bid_cambio ?? '',
  ]
  return fields.map(f => `"${String(f).replace(/"/g, '""')}"`).join(';')
}

cambiosRouter.post('/exportar', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const input = exportarSchema.parse(req.body)
    const prisma = req.prisma!

    const where: Record<string, unknown> = {}
    if (input.status_parcela_bid_cambio) where.status_parcela_bid_cambio = input.status_parcela_bid_cambio
    if (input.moeda_parcela_bid_cambio) where.moeda_parcela_bid_cambio = input.moeda_parcela_bid_cambio

    const parcelas = await (prisma as any).bidCambioParcela.findMany({
      where,
      orderBy: [{ data_vencimento_parcela_bid_cambio: 'asc' }, { numero_parcela_bid_cambio: 'asc' }],
      take: 10000,
    })

    if (input.formato === 'csv') {
      const bom = '﻿'
      const header = CSV_HEADERS.map(h => `"${h}"`).join(';')
      const rows = parcelas.map((p: Record<string, unknown>) => parcelaToCsvRow(p))
      const csv = bom + [header, ...rows].join('\r\n')

      res.setHeader('Content-Type', 'text/csv; charset=utf-8')
      res.setHeader('Content-Disposition', `attachment; filename="cambios_${new Date().toISOString().split('T')[0]}.csv"`)
      res.send(csv)
      return
    }

    // XLSX: retornar JSON estruturado para o frontend gerar via SheetJS
    res.json({
      formato: 'xlsx',
      headers: CSV_HEADERS,
      rows: parcelas.map((p: Record<string, unknown>) => [
        p.referencia_processo_parcela_bid_cambio, p.numero_pedido_parcela_bid_cambio, p.exportador_parcela_bid_cambio, p.moeda_parcela_bid_cambio,
        p.cambio_total_parcela_bid_cambio, p.porcentagem_parcela_bid_cambio, p.valor_a_pagar_parcela_bid_cambio, p.valor_a_pagar_brl_parcela_bid_cambio,
        p.numero_parcela_bid_cambio, p.total_parcelas_parcela_bid_cambio, p.status_parcela_bid_cambio,
        p.data_vencimento_parcela_bid_cambio, p.data_agendamento_parcela_bid_cambio, p.data_pagamento_parcela_bid_cambio,
        p.taxa_fechamento_parcela_bid_cambio, p.banco_corretora_parcela_bid_cambio, p.numero_contrato_cambio_parcela_bid_cambio,
      ]),
      total: parcelas.length,
    })
  } catch (err) { next(err) }
})
