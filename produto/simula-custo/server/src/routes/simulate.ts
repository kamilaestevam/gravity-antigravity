/**
 * simulate.ts — Route POST /api/v1/simula-custo
 * Skill: antigravity-criar-produto (Passo 7)
 * PRD: https://docs.google.com/document/d/1xOjYUtixZ0DI0O1Fws78lj2mAg1utTfuoO0667s_AfM
 */

import { Router, Request, Response } from 'express'
import { z } from 'zod'
import { executarCalculoFiscal, SimulacaoInput } from '../lib/calculator.js'
import { tokenPool } from '../services/tokenPool.js'
import { siscomex } from '../connectors/siscomex.js'
import { getLatestPtax } from '../connectors/bacen.js'

export const simulateRouter = Router()

const TaxaExtraSchema = z.object({
  nome: z.string().min(1),
  valor: z.number().nonnegative(),
  moeda: z.string().min(3).max(3),
})

const SimulacaoInputSchema = z.object({
  ncm: z.string().length(8),
  paisOrigem: z.string().length(2),
  dataFatoGerador: z.string(), // ISO date
  valorProduto: z.number().positive(),
  moedaProduto: z.string().length(3),
  ptaxVenda: z.number().positive().optional(),
  freteInter: z.number().nonnegative(),
  moedaFrete: z.string().length(3),
  seguroInter: z.number().nonnegative(),
  moedaSeguro: z.string().length(3),
  taxasOrigem: z.array(TaxaExtraSchema),
  taxasDestino: z.array(TaxaExtraSchema),
  ufDesembaraco: z.string().length(2),
  aliquotaII: z.number().min(0).max(1),
  aliquotaIPI: z.number().min(0).max(1),
  aliquotaPIS: z.number().min(0).max(1),
  aliquotaCOFINS: z.number().min(0).max(1),
  aliquotaICMS: z.number().min(0).max(1),
  reducaoII: z.number().min(0).max(1).optional(),
})

/**
 * POST /api/v1/simula-custo
 * Executa uma simulação de custo fiscal (Landed Cost).
 */
simulateRouter.post('/', async (req: Request, res: Response) => {
  const parsed = SimulacaoInputSchema.safeParse(req.body)

  if (!parsed.success) {
    return res.status(400).json({ error: 'Payload inválido', detalhes: parsed.error.flatten() })
  }

  try {
    const input: SimulacaoInput = parsed.data as any

    // 1. PTAX — Se não informada, busca via BACEN
    if (!input.ptaxVenda) {
      const ptax = await getLatestPtax(input.moedaProduto)
      input.ptaxVenda = ptax.venda
    }

    // 2. hCaptcha — Resolve via Pool em background
    const hCaptchaToken = await tokenPool.getToken()

    // 3. Simulação Externa via Portal Único Siscomex (Tentativa)
    const externalResult = await siscomex.simularCalculoPublico({
      ...input,
      hCaptchaToken
    })

    if (externalResult && externalResult.sucesso) {
      console.log('[SimulaCusto] Usando resultado externo oficial do Portal Único.')
      return res.status(200).json({ success: true, data: externalResult.data, source: 'siscomex' })
    }

    // 4. Fallback: Simulação Local (Engine de 7 passos — Gravity Cloud Engine)
    console.log('[SimulaCusto] Usando Engine Fiscal Local.')
    const resultado = executarCalculoFiscal(input as any)

    return res.status(200).json({
      success: true,
      data: {
        ...resultado,
        hCaptchaTokenUtilizado: hCaptchaToken.substring(0, 15) + '...',
        ptaxUtilizada: input.ptaxVenda
      },
      source: 'local_engine'
    })

  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erro interno na engine fiscal'
    return res.status(500).json({ error: message })
  }
})
