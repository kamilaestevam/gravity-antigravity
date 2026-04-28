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
      (prisma as any).parcelaCambio.count(),

      // Parcelas pendentes
      (prisma as any).parcelaCambio.count({ where: { status: 'PENDENTE' } }),

      // Parcelas agendadas
      (prisma as any).parcelaCambio.count({ where: { status: 'AGENDADO' } }),

      // Parcelas pagas (mes atual)
      (prisma as any).parcelaCambio.count({
        where: {
          status: 'PAGO',
          data_pagamento: { gte: inicioMes, lte: fimMes },
        },
      }),

      // Valor em aberto (soma de pendentes + agendados)
      (prisma as any).parcelaCambio.aggregate({
        where: { status: { in: ['PENDENTE', 'AGENDADO'] } },
        _sum: { valor_a_pagar: true, valor_a_pagar_brl: true },
      }),

      // Economia acumulada no mes
      (prisma as any).cotacaoCambio.aggregate({
        where: {
          status: 'APROVADA',
          updated_at: { gte: inicioMes, lte: fimMes },
        },
        _sum: { economia_brl: true },
      }),

      // Corretoras ativas
      (prisma as any).corretora.count({ where: { status: 'ATIVA' } }),

      // Cotacoes abertas (enviadas, aguardando respostas)
      (prisma as any).cotacaoCambio.count({
        where: { status: 'ENVIADA_CORRETORAS' },
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
        valor_em_aberto: valorEmAberto._sum?.valor_a_pagar ?? 0,
        valor_em_aberto_brl: valorEmAberto._sum?.valor_a_pagar_brl ?? 0,
        economia_acumulada_mes: economiaMes._sum?.economia_brl ?? 0,
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
      (prisma as any).parcelaCambio.findMany({
        where: {
          status: { in: ['PENDENTE', 'AGENDADO'] },
          data_vencimento: { gte: agora, lte: limite },
        },
        orderBy: { data_vencimento: 'asc' },
        select: {
          id: true,
          referencia_processo: true,
          moeda: true,
          valor_a_pagar: true,
          valor_a_pagar_brl: true,
          data_vencimento: true,
          status: true,
        },
      }),

      // Parcelas ja vencidas (nao pagas)
      (prisma as any).parcelaCambio.findMany({
        where: {
          status: { in: ['PENDENTE', 'AGENDADO'] },
          data_vencimento: { lt: agora },
        },
        orderBy: { data_vencimento: 'asc' },
        select: {
          id: true,
          referencia_processo: true,
          moeda: true,
          valor_a_pagar: true,
          valor_a_pagar_brl: true,
          data_vencimento: true,
          status: true,
        },
      }),

      // Agrupamento por moeda (proximos vencimentos)
      (prisma as any).parcelaCambio.groupBy({
        by: ['moeda'],
        where: {
          status: { in: ['PENDENTE', 'AGENDADO'] },
          data_vencimento: { gte: agora, lte: limite },
        },
        _sum: { valor_a_pagar: true, valor_a_pagar_brl: true },
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
