// server/routes/usage.ts
// Rota de consumo/custo da Gabi IA — usada pelo API Cockpit
import { Router } from 'express'
import { z } from 'zod'
import prisma from '../lib/prisma.js'

export const usageRouter = Router()

const querySchema = z.object({
  month: z.string().regex(/^\d{4}-\d{2}$/).optional(), // ex: 2026-03
})

// GET /api/v1/gabi/uso — resumo de custo do mes
usageRouter.get('/api/v1/gabi/uso', async (req, res, next) => {
  try {
    const tenantId = req.headers['x-tenant-id'] as string
    const { month } = querySchema.parse(req.query)

    const now = new Date()
    const targetMonth = month || `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
    const [year, mon] = targetMonth.split('-').map(Number)
    const startDate = new Date(year, mon - 1, 1)
    const endDate = new Date(year, mon, 1)

    const logs = await prisma.gabiLogUso.findMany({
      where: {
        id_organizacao_gabi_log_uso: tenantId,
        data_criacao_gabi_log_uso: { gte: startDate, lt: endDate },
      },
      select: {
        modelo_gabi_log_uso: true,
        tokens_input_gabi_log_uso: true,
        tokens_output_gabi_log_uso: true,
        custo_usd_gabi_log_uso: true,
        data_criacao_gabi_log_uso: true,
      },
      orderBy: { data_criacao_gabi_log_uso: 'desc' },
    })

    // Agregacao por modelo
    const byModel: Record<string, { calls: number; tokensIn: number; tokensOut: number; cost: number }> = {}
    let totalCost = 0
    let totalTokensIn = 0
    let totalTokensOut = 0

    for (const log of logs) {
      const model = log.modelo_gabi_log_uso || 'unknown'
      if (!byModel[model]) {
        byModel[model] = { calls: 0, tokensIn: 0, tokensOut: 0, cost: 0 }
      }
      byModel[model].calls++
      byModel[model].tokensIn += log.tokens_input_gabi_log_uso
      byModel[model].tokensOut += log.tokens_output_gabi_log_uso
      byModel[model].cost += log.custo_usd_gabi_log_uso
      totalCost += log.custo_usd_gabi_log_uso
      totalTokensIn += log.tokens_input_gabi_log_uso
      totalTokensOut += log.tokens_output_gabi_log_uso
    }

    // Custo por dia (para grafico)
    const byDay: Record<string, number> = {}
    for (const log of logs) {
      const day = log.data_criacao_gabi_log_uso.toISOString().slice(0, 10)
      byDay[day] = (byDay[day] || 0) + log.custo_usd_gabi_log_uso
    }

    res.json({
      month: targetMonth,
      total_calls: logs.length,
      total_tokens_input: totalTokensIn,
      total_tokens_output: totalTokensOut,
      total_cost_usd: Math.round(totalCost * 1_000_000) / 1_000_000,
      by_model: byModel,
      by_day: byDay,
    })
  } catch (error) {
    next(error)
  }
})

// GET /api/v1/gabi/uso/historico — ultimos 6 meses
usageRouter.get('/api/v1/gabi/uso/historico', async (req, res, next) => {
  try {
    const tenantId = req.headers['x-tenant-id'] as string
    const sixMonthsAgo = new Date()
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)

    const logs = await prisma.gabiLogUso.findMany({
      where: {
        id_organizacao_gabi_log_uso: tenantId,
        data_criacao_gabi_log_uso: { gte: sixMonthsAgo },
      },
      select: {
        custo_usd_gabi_log_uso: true,
        tokens_input_gabi_log_uso: true,
        tokens_output_gabi_log_uso: true,
        data_criacao_gabi_log_uso: true,
      },
    })

    const byMonth: Record<string, { calls: number; cost: number; tokens: number }> = {}
    for (const log of logs) {
      const key = log.data_criacao_gabi_log_uso.toISOString().slice(0, 7) // YYYY-MM
      if (!byMonth[key]) {
        byMonth[key] = { calls: 0, cost: 0, tokens: 0 }
      }
      byMonth[key].calls++
      byMonth[key].cost += log.custo_usd_gabi_log_uso
      byMonth[key].tokens += log.tokens_input_gabi_log_uso + log.tokens_output_gabi_log_uso
    }

    res.json({ history: byMonth })
  } catch (error) {
    next(error)
  }
})
