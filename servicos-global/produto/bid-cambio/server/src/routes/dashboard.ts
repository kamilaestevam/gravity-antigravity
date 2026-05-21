/**
 * dashboard.ts — Rotas de Dashboard e KPIs (Pilar 3 — Analytics)
 * Metricas agregadas, vencimentos proximos, indicadores de performance
 */

import { Router, Request, Response, NextFunction } from 'express'
import { AppError } from '../lib/errors.js'

export const dashboardRouter = Router()

// --- GET /api/v1/bid-cambio/dashboard ---
dashboardRouter.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const prisma = req.prisma!

    const agora = new Date()
    const inicioMes = new Date(agora.getFullYear(), agora.getMonth(), 1)
    const fimMes = new Date(agora.getFullYear(), agora.getMonth() + 1, 0)

    const [
      totalParcelas,
      parcelasPendentes,
      parcelasAgendadas,
      parcelasPagas,
      valorEmAberto,
      economiaMes,
      corretorasAtivas,
      cotacoesAbertas,
    ] = await Promise.all([
      // Total de parcelas
      (prisma as any).bidCambioParcela.count(),

      // Parcelas pendentes
      (prisma as any).bidCambioParcela.count({ where: { status_parcela_bid_cambio: 'PENDENTE' } }),

      // Parcelas agendadas
      (prisma as any).bidCambioParcela.count({ where: { status_parcela_bid_cambio: 'AGENDADO' } }),

      // Parcelas pagas (mes atual)
      (prisma as any).bidCambioParcela.count({
        where: {
          status_parcela_bid_cambio: 'PAGO',
          data_pagamento_parcela_bid_cambio: { gte: inicioMes, lte: fimMes },
        },
      }),

      // Valor em aberto (soma de pendentes + agendados)
      (prisma as any).bidCambioParcela.aggregate({
        where: { status_parcela_bid_cambio: { in: ['PENDENTE', 'AGENDADO'] } },
        _sum: { valor_a_pagar_parcela_bid_cambio: true, valor_a_pagar_brl_parcela_bid_cambio: true },
      }),

      // Economia acumulada no mes
      (prisma as any).bidCambioCotacao.aggregate({
        where: {
          status_cotacao_bid_cambio: 'APROVADA',
          data_atualizacao_cotacao_bid_cambio: { gte: inicioMes, lte: fimMes },
        },
        _sum: { economia_brl_cotacao_bid_cambio: true },
      }),

      // Corretoras ativas
      (prisma as any).bidCambioCorretora.count({ where: { status_corretora_bid_cambio: 'ATIVA' } }),

      // Cotacoes abertas (enviadas, aguardando respostas)
      (prisma as any).bidCambioCotacao.count({
        where: { status_cotacao_bid_cambio: 'ENVIADA_CORRETORAS' },
      }),
    ])

    res.json({
      parcelas: {
        total: totalParcelas,
        pendentes: parcelasPendentes,
        agendadas: parcelasAgendadas,
        pagas_mes: parcelasPagas,
      },
      financeiro: {
        valor_em_aberto: valorEmAberto._sum?.valor_a_pagar_parcela_bid_cambio ?? 0,
        valor_em_aberto_brl: valorEmAberto._sum?.valor_a_pagar_brl_parcela_bid_cambio ?? 0,
        economia_acumulada_mes: economiaMes._sum?.economia_brl_cotacao_bid_cambio ?? 0,
      },
      marketplace: {
        corretoras_ativas: corretorasAtivas,
        cotacoes_abertas: cotacoesAbertas,
      },
      periodo: {
        mes_referencia: `${agora.getFullYear()}-${String(agora.getMonth() + 1).padStart(2, '0')}`,
        inicio: inicioMes.toISOString(),
        fim: fimMes.toISOString(),
      },
    })
  } catch (err) { next(err) }
})

// --- GET /api/v1/bid-cambio/dashboard/vencimentos ---
dashboardRouter.get('/vencimentos', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const prisma = req.prisma!
    const dias = parseInt(req.query.dias as string) || 30

    const agora = new Date()
    const limite = new Date()
    limite.setDate(limite.getDate() + dias)

    const [vencimentos, vencidos, porMoeda] = await Promise.all([
      // Parcelas vencendo nos proximos N dias
      (prisma as any).bidCambioParcela.findMany({
        where: {
          status_parcela_bid_cambio: { in: ['PENDENTE', 'AGENDADO'] },
          data_vencimento_parcela_bid_cambio: { gte: agora, lte: limite },
        },
        orderBy: { data_vencimento_parcela_bid_cambio: 'asc' },
        select: {
          id_parcela_bid_cambio: true,
          referencia_processo_parcela_bid_cambio: true,
          moeda_parcela_bid_cambio: true,
          valor_a_pagar_parcela_bid_cambio: true,
          valor_a_pagar_brl_parcela_bid_cambio: true,
          data_vencimento_parcela_bid_cambio: true,
          status_parcela_bid_cambio: true,
        },
      }),

      // Parcelas ja vencidas (nao pagas)
      (prisma as any).bidCambioParcela.findMany({
        where: {
          status_parcela_bid_cambio: { in: ['PENDENTE', 'AGENDADO'] },
          data_vencimento_parcela_bid_cambio: { lt: agora },
        },
        orderBy: { data_vencimento_parcela_bid_cambio: 'asc' },
        select: {
          id_parcela_bid_cambio: true,
          referencia_processo_parcela_bid_cambio: true,
          moeda_parcela_bid_cambio: true,
          valor_a_pagar_parcela_bid_cambio: true,
          valor_a_pagar_brl_parcela_bid_cambio: true,
          data_vencimento_parcela_bid_cambio: true,
          status_parcela_bid_cambio: true,
        },
      }),

      // Agrupamento por moeda (proximos vencimentos)
      (prisma as any).bidCambioParcela.groupBy({
        by: ['moeda_parcela_bid_cambio'],
        where: {
          status_parcela_bid_cambio: { in: ['PENDENTE', 'AGENDADO'] },
          data_vencimento_parcela_bid_cambio: { gte: agora, lte: limite },
        },
        _sum: { valor_a_pagar_parcela_bid_cambio: true, valor_a_pagar_brl_parcela_bid_cambio: true },
        _count: true,
      }),
    ])

    res.json({
      proximos_vencimentos: {
        data: vencimentos,
        total: vencimentos.length,
        dias_consulta: dias,
      },
      vencidos: {
        data: vencidos,
        total: vencidos.length,
      },
      por_moeda: porMoeda,
    })
  } catch (err) { next(err) }
})
