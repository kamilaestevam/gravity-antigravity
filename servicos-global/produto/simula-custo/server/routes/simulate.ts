/**
 * simulate.ts — Route POST /api/v1/simula-custo
 * Valida payload com Zod e executa simulação via calculator.ts
 */

import { Router, Request, Response } from 'express'
import { z } from 'zod'
import { executarSimulacao, SimulacaoInput } from '../lib/calculator.js'

export const simulateRouter = Router()

const CategoriaEnum = z.enum([
  'infraestrutura',
  'suporte',
  'licenca',
  'integracao',
  'customizacao',
])

const ItemCategoriaSchema = z.object({
  categoria: CategoriaEnum,
  descricao: z.string().min(1),
  quantidade: z.number().int().positive(),
  precoUnitario: z.number().positive(),
})

const MetricasDashboardSchema = z.object({
  usuariosAtivos: z.number().nonnegative().optional(),
  volumeTransacoes: z.number().nonnegative().optional(),
})

const HistoricoRelatorioSchema = z.object({
  mediaGastoMensal: z.number().nonnegative().optional(),
  mesesHistorico: z.number().int().positive().optional(),
})

const SimulacaoInputSchema = z.object({
  tenantId: z.string().min(1),
  nomeServico: z.string().min(1),
  itens: z.array(ItemCategoriaSchema).min(1),
  descontoPercentual: z.number().min(0).max(100).optional(),
  metricasDashboard: MetricasDashboardSchema.optional(),
  historicoRelatorio: HistoricoRelatorioSchema.optional(),
})

/**
 * POST /api/v1/simula-custo
 * Executa uma simulação de custo para o tenant.
 */
simulateRouter.post('/', async (req: Request, res: Response) => {
  const parsed = SimulacaoInputSchema.safeParse(req.body)

  if (!parsed.success) {
    return res.status(400).json({
      error: 'Payload inválido',
      detalhes: parsed.error.flatten(),
    })
  }

  try {
    const input: SimulacaoInput = parsed.data
    const resultado = executarSimulacao(input)

    return res.status(200).json({
      success: true,
      data: resultado,
    })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erro interno na simulação'
    return res.status(500).json({ error: message })
  }
})
