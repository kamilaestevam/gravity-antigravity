/**
 * dashboard.ts — Rotas GET /api/v1/dashboard/kpis e /api/v1/dashboard/recentes
 * Adaptado de: servicos-global/tenant/dashboard/server/routes.ts
 *
 * Usa req.prisma (injetado pelo tenantIsolationMiddleware) — tenant_id já filtrado.
 * Nunca expõe dados de outros tenants.
 */

import { Router, Request, Response, NextFunction } from 'express'
import { z } from 'zod'
import { PrismaClient } from '@prisma/client'
import {
  getCachedKPIs,
  setCachedKPIs,
  getCachedRecentes,
  setCachedRecentes,
  type DashboardKPIs,
  type SimulacaoRecente,
} from '../lib/dashboardCache.js'

export const dashboardRouter = Router()

// ─── Tipagem do req enriquecido pelo tenantIsolationMiddleware ─────────────────
type TenantRequest = Request & { prisma: PrismaClient; tenantId: string }

// ─── GET /api/v1/dashboard/kpis ───────────────────────────────────────────────
dashboardRouter.get('/kpis', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantReq = req as TenantRequest
    const tenantId = tenantReq.tenantId

    // Cache hit
    const cached = getCachedKPIs(tenantId)
    if (cached) return res.json({ source: 'cache', data: cached })

    const prisma = tenantReq.prisma

    // Contagem total e por status
    const [total, finalizadas, rascunhos] = await Promise.all([
      prisma.estimativa.count(),
      prisma.estimativa.count({ where: { status: 'criada' } }),
      prisma.estimativa.count({ where: { status: 'rascunho' } }),
    ])

    // Agregações de Landed Cost
    const landedCostAgg = await prisma.estimativa.aggregate({
      _avg:  { landed_cost_brl: true },
      _max:  { landed_cost_brl: true },
      _min:  { landed_cost_brl: true },
    })

    // Total CIF USD (valor_produto quando moeda = USD + frete + seguro)
    // Aproximação: soma do valor_produto em USD convertido via ptax
    const cifAgg = await (prisma as any).$queryRaw<{ total: number }[]>`
      SELECT COALESCE(SUM(valor_produto / NULLIF(ptax_utilizada, 0)), 0) AS total
      FROM estimativas_trade
      WHERE tenant_id = ${tenantId}
        AND moeda_produto = 'USD'
    `
    const totalCifUsd = cifAgg?.[0]?.total ?? null

    // Viabilidade: baseada em status_viabilidade se existir, fallback por percentual de impostos
    // Como o schema usa 'status' (rascunho|criada|arquivada), classificamos por threshold de tributos
    const estimativasViabilidade = await (prisma as any).$queryRaw<
      { nivel: string; qtd: bigint }[]
    >`
      SELECT
        CASE
          WHEN total_tributos / NULLIF(landed_cost_brl, 0) <= 0.30 THEN 'viavel'
          WHEN total_tributos / NULLIF(landed_cost_brl, 0) <= 0.50 THEN 'atencao'
          ELSE 'inviavel'
        END AS nivel,
        COUNT(*) AS qtd
      FROM estimativas_trade
      WHERE tenant_id = ${tenantId}
        AND landed_cost_brl > 0
      GROUP BY nivel
    `

    const viabilidadeMap = { viavel: 0, atencao: 0, inviavel: 0 }
    for (const row of estimativasViabilidade) {
      const k = row.nivel as keyof typeof viabilidadeMap
      if (k in viabilidadeMap) {
        viabilidadeMap[k] = Number(row.qtd)
      }
    }

    const data: DashboardKPIs = {
      totalSimulacoes:    total,
      finalizadas,
      rascunhos,
      mediaLandedCostBrl: landedCostAgg._avg.landed_cost_brl,
      maiorLandedCostBrl: landedCostAgg._max.landed_cost_brl,
      menorLandedCostBrl: landedCostAgg._min.landed_cost_brl,
      totalCifUsd: totalCifUsd ? Number(totalCifUsd) : null,
      viavel:    viabilidadeMap.viavel,
      atencao:   viabilidadeMap.atencao,
      inviavel:  viabilidadeMap.inviavel,
    }

    setCachedKPIs(tenantId, data)
    res.json({ source: 'db', data })
  } catch (err) {
    console.error('[Dashboard Server] Error:', err)
    next(err)
  }
})

// ─── GET /api/v1/dashboard/recentes ──────────────────────────────────────────
dashboardRouter.get('/recentes', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantReq = req as TenantRequest
    const tenantId = tenantReq.tenantId

    const cached = getCachedRecentes(tenantId)
    if (cached) return res.json({ source: 'cache', data: cached })

    const prisma = tenantReq.prisma

    const raw = await prisma.estimativa.findMany({
      orderBy: { data_simulacao: 'desc' },
      take: 10,
      select: {
        id:              true,
        ncm:             true,
        pais_origem:     true,
        valor_produto:   true,
        moeda_produto:   true,
        ptax_utilizada:  true,
        landed_cost_brl: true,
        status:          true,
        data_simulacao:  true,
      },
    })

    const data: SimulacaoRecente[] = raw.map((e) => ({
      id:             e.id,
      ncm:            e.ncm,
      pais_origem:    e.pais_origem,
      // Converte para USD equivalente se moeda não for USD
      valor_fob_usd:
        e.moeda_produto === 'USD'
          ? e.valor_produto
          : e.ptax_utilizada > 0
            ? e.valor_produto / e.ptax_utilizada
            : null,
      landed_cost_brl: e.landed_cost_brl,
      status:          e.status,
      data_simulacao:  e.data_simulacao.toISOString().split('T')[0],
    }))

    setCachedRecentes(tenantId, data)
    res.json({ source: 'db', data })
  } catch (err) {
    next(err)
  }
})
