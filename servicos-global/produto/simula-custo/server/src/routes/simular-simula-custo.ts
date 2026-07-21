/**
 * simular-simula-custo.ts — POST /api/v1/simula-custo/simular
 * Executa a simulação fiscal: tenta o Portal Único Siscomex, cai para o
 * Gravity Cloud Engine local (7 passos) em caso de indisponibilidade.
 */
import { Router, Request, Response, NextFunction } from 'express'
import { AppError } from '../lib/erros.js'
import { executarCalculoSimulaCusto } from '../lib/motor-calculo-simula-custo.js'
import { SimularSimulaCustoSchema } from '../schemas/simula-custo-schema.js'
import { tokenPool } from '../services/pool-tokens-siscomex.js'
import { siscomex } from '../connectors/siscomex.js'
import { obterPtaxVendaSimulaCusto } from '../lib/taxas-moeda-client.js'

export const simularSimulaCustoRouter = Router()

simularSimulaCustoRouter.post('/simular', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parsed = SimularSimulaCustoSchema.safeParse(req.body)
    if (!parsed.success) {
      throw new AppError(`Payload inválido: ${parsed.error.issues.map(i => `${i.path.join('.')}: ${i.message}`).join('; ')}`, 400, 'VALIDATION_ERROR')
    }
    const entrada = parsed.data

    // REGRA 05.1 — rejeita payload sem alíquotas (0 II + 0 PIS tipicamente = form sem fonte).
    // II/IPI podem ser 0% de verdade; exigimos que o cliente tenha validado no Cadastros.
    // Blindagem: PIS/COFINS legais de importação nunca podem vir zerados juntos sem II preenchido via fonte.
    if (
      entrada.aliquota_pis_simula_custo <= 0
      && entrada.aliquota_cofins_simula_custo <= 0
    ) {
      throw new AppError(
        'Alíquotas PIS/COFINS ausentes — valide o NCM no Cadastros antes de simular.',
        400,
        'ALIQUOTAS_AUSENTES',
      )
    }

    // 1. PTAX — se não informada, busca SSOT Configurador (taxas-moeda)
    const ptaxVenda = entrada.ptax_venda ?? await obterPtaxVendaSimulaCusto(entrada.moeda_produto_simula_custo)

    // 2. hCaptcha — resolve via pool em background
    const hCaptchaToken = await tokenPool.getToken()

    // 3. Tentativa: simulação externa oficial via Portal Único Siscomex
    const resultadoExterno = await siscomex.simularCalculoPublico({ ...entrada, ptax_venda: ptaxVenda, hCaptchaToken })
    if (resultadoExterno && resultadoExterno.sucesso) {
      return res.status(200).json({
        resultado: resultadoExterno.data,
        fonte_calculo_simula_custo: 'siscomex',
        ptax_utilizada_simula_custo: ptaxVenda,
      })
    }

    // 4. Fallback: Gravity Cloud Engine local (7 passos)
    const resultado = executarCalculoSimulaCusto({
      ncm_simula_custo: entrada.ncm_simula_custo,
      valor_produto_simula_custo: entrada.valor_produto_simula_custo,
      moeda_produto_simula_custo: entrada.moeda_produto_simula_custo,
      ptax_venda: ptaxVenda,
      valor_frete_simula_custo: entrada.valor_frete_simula_custo,
      moeda_frete_simula_custo: entrada.moeda_frete_simula_custo,
      valor_seguro_simula_custo: entrada.valor_seguro_simula_custo,
      moeda_seguro_simula_custo: entrada.moeda_seguro_simula_custo,
      taxas_origem: entrada.taxas_origem,
      taxas_destino: entrada.taxas_destino,
      uf_desembaraco_simula_custo: entrada.uf_desembaraco_simula_custo,
      aliquota_ii_simula_custo: entrada.aliquota_ii_simula_custo,
      aliquota_ipi_simula_custo: entrada.aliquota_ipi_simula_custo,
      aliquota_pis_simula_custo: entrada.aliquota_pis_simula_custo,
      aliquota_cofins_simula_custo: entrada.aliquota_cofins_simula_custo,
      aliquota_icms_simula_custo: entrada.aliquota_icms_simula_custo,
      aliquota_icms_interna_uf_simula_custo: entrada.aliquota_icms_interna_uf_simula_custo,
      modalidade_recolhimento_icms_simula_custo: entrada.modalidade_recolhimento_icms_simula_custo,
      reducao_ii_simula_custo: entrada.reducao_ii_simula_custo,
    })

    return res.status(200).json({
      resultado,
      fonte_calculo_simula_custo: 'gravity-engine',
      ptax_utilizada_simula_custo: ptaxVenda,
    })
  } catch (err) { next(err) }
})
