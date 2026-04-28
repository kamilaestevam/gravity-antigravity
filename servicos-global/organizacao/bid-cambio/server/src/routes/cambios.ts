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
  status: z.enum(['PENDENTE', 'AGENDADO', 'PAGO']).optional(),
  moeda: z.string().optional(),
  data_vencimento_inicio: z.string().optional(),
  data_vencimento_fim: z.string().optional(),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(50),
})

const agendarSchema = z.object({
  parcela_ids: z.array(z.string()).min(1),
  data_agendamento: z.string().refine(d => !isNaN(Date.parse(d)), 'Data invalida'),
})

const pagarSchema = z.object({
  parcela_id: z.string(),
  valor_pago: z.number().positive(),
  taxa_fechamento: z.number().positive(),
  banco_corretora: z.string().min(1),
  numero_contrato: z.string().optional(),
  anexos: z.array(z.object({
    nome_arquivo: z.string().optional(),
    nome_original: z.string(),
    url: z.string().url(),
    categoria: z.string().optional(),
  })).optional(),
})

// --- GET /api/v1/bid-cambio/cambios ---
cambiosRouter.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const query = listarSchema.parse(req.query)
    const prisma = req.prisma!
    const skip = (query.page - 1) * query.limit

    const where: Record<string, unknown> = {}
    if (query.status) where.status = query.status
    if (query.moeda) where.moeda = query.moeda
    if (query.data_vencimento_inicio || query.data_vencimento_fim) {
      const dataRange: { gte?: Date; lte?: Date } = {}
      if (query.data_vencimento_inicio) dataRange.gte = new Date(query.data_vencimento_inicio)
      if (query.data_vencimento_fim) dataRange.lte = new Date(query.data_vencimento_fim)
      where.data_vencimento = dataRange
    }

    const [parcelas, total] = await Promise.all([
      (prisma as any).parcelaCambio.findMany({
        where,
        orderBy: { data_vencimento: 'asc' },
        skip,
        take: query.limit,
        include: { anexos: true },
      }),
      (prisma as any).parcelaCambio.count({ where }),
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
    const statusFilter = req.query.status as string | undefined

    const where: Record<string, unknown> = {}
    if (statusFilter) where.status = statusFilter

    const totais = await (prisma as any).parcelaCambio.groupBy({
      by: ['moeda'],
      where: { ...where, status: { in: ['PENDENTE', 'AGENDADO'] } },
      _sum: { valor_a_pagar: true, valor_a_pagar_brl: true },
      _count: true,
    })

    res.json(totais)
  } catch (err) { next(err) }
})

// --- GET /api/v1/bid-cambio/cambios/:id ---
cambiosRouter.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parcela = await (req.prisma as any).parcelaCambio.findFirst({
      where: { id: req.params.id },
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
      entidade: 'ParcelaCambio',
      entidade_id: input.parcela_ids.join(','),
      detalhes: { data_agendamento: input.data_agendamento, total: result.agendadas },
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
      entidade: 'ParcelaCambio',
      entidade_id: input.parcela_id,
      detalhes: { valor: result.valor_pago, taxa: result.taxa, banco: input.banco_corretora },
    })

    atividadesIntegration.parcelaPaga(tenantId, userId, {
      referencia: input.parcela_id,
      valor: result.valor_pago.toFixed(2),
      moeda: 'USD',
    })

    res.json(result)
  } catch (err) { next(err) }
})

// --- POST /api/v1/bid-cambio/cambios/retornar-pendente ---
cambiosRouter.post('/retornar-pendente', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { parcela_id } = z.object({ parcela_id: z.string() }).parse(req.body)
    const result = await retornarParaPendente(req.prisma!, parcela_id)

    historicoIntegration.registrar(req.tenantId!, req.headers['x-id-usuario'] as string, {
      acao: 'RETORNAR_PENDENTE',
      entidade: 'ParcelaCambio',
      entidade_id: parcela_id,
    })

    res.json(result)
  } catch (err) { next(err) }
})

// --- POST /api/v1/bid-cambio/cambios/exportar ---

const exportarSchema = z.object({
  formato: z.enum(['csv', 'xlsx']).default('csv'),
  status: z.enum(['PENDENTE', 'AGENDADO', 'PAGO']).optional(),
  moeda: z.string().optional(),
})

const CSV_HEADERS = [
  'Referencia', 'Pedido', 'Exportador', 'Moeda', 'Cambio Total',
  '% Parcela', 'Valor a Pagar', 'Valor BRL', 'Parcela', 'Total Parcelas',
  'Status', 'Vencimento', 'Agendamento', 'Pagamento', 'Taxa Fechamento',
  'Banco/Corretora', 'Contrato Cambio',
]

function parcelaToCsvRow(p: Record<string, unknown>): string {
  const fields = [
    p.referencia_processo ?? '',
    p.numero_pedido ?? '',
    p.exportador ?? '',
    p.moeda ?? '',
    p.cambio_total ?? '',
    p.porcentagem_parcela ?? '',
    p.valor_a_pagar ?? '',
    p.valor_a_pagar_brl ?? '',
    p.numero_parcela ?? '',
    p.total_parcelas ?? '',
    p.status ?? '',
    p.data_vencimento ? new Date(p.data_vencimento as string).toISOString().split('T')[0] : '',
    p.data_agendamento ? new Date(p.data_agendamento as string).toISOString().split('T')[0] : '',
    p.data_pagamento ? new Date(p.data_pagamento as string).toISOString().split('T')[0] : '',
    p.taxa_fechamento ?? '',
    p.banco_corretora ?? '',
    p.numero_contrato_cambio ?? '',
  ]
  return fields.map(f => `"${String(f).replace(/"/g, '""')}"`).join(';')
}

cambiosRouter.post('/exportar', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const input = exportarSchema.parse(req.body)
    const prisma = req.prisma!

    const where: Record<string, unknown> = {}
    if (input.status) where.status = input.status
    if (input.moeda) where.moeda = input.moeda

    const parcelas = await (prisma as any).parcelaCambio.findMany({
      where,
      orderBy: [{ data_vencimento: 'asc' }, { numero_parcela: 'asc' }],
      take: 10000,
    })

    if (input.formato === 'csv') {
      const bom = '\uFEFF'
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
        p.referencia_processo, p.numero_pedido, p.exportador, p.moeda,
        p.cambio_total, p.porcentagem_parcela, p.valor_a_pagar, p.valor_a_pagar_brl,
        p.numero_parcela, p.total_parcelas, p.status,
        p.data_vencimento, p.data_agendamento, p.data_pagamento,
        p.taxa_fechamento, p.banco_corretora, p.numero_contrato_cambio,
      ]),
      total: parcelas.length,
    })
  } catch (err) { next(err) }
})
