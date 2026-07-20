/**
 * simular-estimativa-custo.ts — POST /api/v1/simula-custo/simular
 * Executa a simulação fiscal: tenta o Portal Único Siscomex, cai para o
 * Gravity Cloud Engine local (7 passos) em caso de indisponibilidade.
 */
import { Router, Request, Response, NextFunction } from 'express'
import { AppError } from '../lib/erros.js'
import { executarCalculoEstimativaCusto } from '../lib/motor-calculo-estimativa-custo.js'
import { SimularEstimativaCustoSchema } from '../schemas/estimativa-custo-schema.js'
import { tokenPool } from '../services/pool-tokens-siscomex.js'
import { siscomex } from '../connectors/siscomex.js'
import { getLatestPtax } from '../connectors/bacen.js'

export const simularEstimativaCustoRouter = Router()

simularEstimativaCustoRouter.post('/simular', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parsed = SimularEstimativaCustoSchema.safeParse(req.body)
    if (!parsed.success) {
      throw new AppError(`Payload inválido: ${parsed.error.issues.map(i => `${i.path.join('.')}: ${i.message}`).join('; ')}`, 400, 'VALIDATION_ERROR')
    }
    const entrada = parsed.data

    // 1. PTAX — se não informada, busca via BACEN
    const ptaxVenda = entrada.ptax_venda ?? (await getLatestPtax(entrada.moeda_produto_estimativa_custo)).venda

    // 2. hCaptcha — resolve via pool em background
    const hCaptchaToken = await tokenPool.getToken()

    // 3. Tentativa: simulação externa oficial via Portal Único Siscomex
    const resultadoExterno = await siscomex.simularCalculoPublico({ ...entrada, ptax_venda: ptaxVenda, hCaptchaToken })
    if (resultadoExterno && resultadoExterno.sucesso) {
      return res.status(200).json({
        resultado: resultadoExterno.data,
        fonte_calculo_estimativa_custo: 'siscomex',
        ptax_utilizada_estimativa_custo: ptaxVenda,
      })
    }

    // 4. Fallback: Gravity Cloud Engine local (7 passos)
    const resultado = executarCalculoEstimativaCusto({
      ncm_estimativa_custo: entrada.ncm_estimativa_custo,
      valor_produto_estimativa_custo: entrada.valor_produto_estimativa_custo,
      moeda_produto_estimativa_custo: entrada.moeda_produto_estimativa_custo,
      ptax_venda: ptaxVenda,
      valor_frete_estimativa_custo: entrada.valor_frete_estimativa_custo,
      moeda_frete_estimativa_custo: entrada.moeda_frete_estimativa_custo,
      valor_seguro_estimativa_custo: entrada.valor_seguro_estimativa_custo,
      moeda_seguro_estimativa_custo: entrada.moeda_seguro_estimativa_custo,
      taxas_origem: entrada.taxas_origem,
      taxas_destino: entrada.taxas_destino,
      uf_desembaraco_estimativa_custo: entrada.uf_desembaraco_estimativa_custo,
      aliquota_ii_estimativa_custo: entrada.aliquota_ii_estimativa_custo,
      aliquota_ipi_estimativa_custo: entrada.aliquota_ipi_estimativa_custo,
      aliquota_pis_estimativa_custo: entrada.aliquota_pis_estimativa_custo,
      aliquota_cofins_estimativa_custo: entrada.aliquota_cofins_estimativa_custo,
      aliquota_icms_estimativa_custo: entrada.aliquota_icms_estimativa_custo,
      reducao_ii_estimativa_custo: entrada.reducao_ii_estimativa_custo,
    })

    return res.status(200).json({
      resultado,
      fonte_calculo_estimativa_custo: 'gravity-engine',
      ptax_utilizada_estimativa_custo: ptaxVenda,
    })
  } catch (err) { next(err) }
})
