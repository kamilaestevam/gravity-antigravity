/**
 * uso-llm-leitura-smart-read.ts — contrato bilateral tokens LLM (Gemini) na jornada
 */

import { z } from 'zod'

export const AcaoUsoLlmLeituraSmartReadEnum = z.enum([
  'classificacao_fiscal',
  'analise_riscos',
  'qa_consultor',
])

export const UsoLlmChamadaLeituraSmartReadSchema = z.object({
  tokens_entrada: z.number().int().min(0),
  tokens_saida: z.number().int().min(0),
  tokens_total: z.number().int().min(0),
})

export const ResumoUsoLlmLeituraSmartReadSchema = z.object({
  tokens_entrada: z.number().int().min(0),
  tokens_saida: z.number().int().min(0),
  tokens_total: z.number().int().min(0),
  total_chamadas: z.number().int().min(0),
  custo_usd: z.number().min(0),
})

export type AcaoUsoLlmLeituraSmartRead = z.infer<typeof AcaoUsoLlmLeituraSmartReadEnum>
export type UsoLlmChamadaLeituraSmartRead = z.infer<typeof UsoLlmChamadaLeituraSmartReadSchema>
export type ResumoUsoLlmLeituraSmartRead = z.infer<typeof ResumoUsoLlmLeituraSmartReadSchema>

export function somarUsoLlmChamadasLeituraSmartRead(
  chamadas: UsoLlmChamadaLeituraSmartRead[],
): UsoLlmChamadaLeituraSmartRead {
  let tokens_entrada = 0
  let tokens_saida = 0
  for (const chamada of chamadas) {
    tokens_entrada += chamada.tokens_entrada
    tokens_saida += chamada.tokens_saida
  }
  return {
    tokens_entrada,
    tokens_saida,
    tokens_total: tokens_entrada + tokens_saida,
  }
}

/**
 * Atualiza contador após chamada LLM — usa resumo persistido quando disponível;
 * senão acumula `chamada` (ex.: banco indisponível ou log ainda não gravado).
 */
export function atualizarResumoTokensAposChamadaLlm(
  anterior: ResumoUsoLlmLeituraSmartRead,
  resumoLeitura: ResumoUsoLlmLeituraSmartRead | null | undefined,
  chamada: UsoLlmChamadaLeituraSmartRead | null | undefined,
): ResumoUsoLlmLeituraSmartRead {
  if (resumoLeitura && resumoLeitura.tokens_total >= anterior.tokens_total && resumoLeitura.tokens_total > 0) {
    return resumoLeitura
  }

  if (!chamada || chamada.tokens_total <= 0) {
    return resumoLeitura ?? anterior
  }

  const base = resumoLeitura && resumoLeitura.tokens_total > anterior.tokens_total ? resumoLeitura : anterior
  return ResumoUsoLlmLeituraSmartReadSchema.parse({
    tokens_entrada: base.tokens_entrada + chamada.tokens_entrada,
    tokens_saida: base.tokens_saida + chamada.tokens_saida,
    tokens_total: base.tokens_total + chamada.tokens_total,
    total_chamadas: base.total_chamadas + 1,
    custo_usd: base.custo_usd,
  })
}

/** Preços USD por 1M tokens (Gemini flash — alinhado à GABI) */
const PRECOS_GEMINI_USD_POR_MILHAO: Record<string, { entrada: number; saida: number }> = {
  'gemini-2.5-flash': { entrada: 0.15, saida: 0.6 },
  'gemini-2.0-flash': { entrada: 0.075, saida: 0.3 },
  'gemini-2.5-pro': { entrada: 1.25, saida: 10.0 },
}

export function calcularCustoUsdGeminiLeituraSmartRead(
  modelo: string,
  tokensEntrada: number,
  tokensSaida: number,
): number {
  const precos = PRECOS_GEMINI_USD_POR_MILHAO[modelo] ?? { entrada: 1.0, saida: 3.0 }
  return (tokensEntrada * precos.entrada + tokensSaida * precos.saida) / 1_000_000
}

/** Exibição discreta: 842 → "842", 12400 → "12,4k", 1500000 → "1,5M" */
export function formatarTokensDiscretoLeituraSmartRead(total: number): string {
  if (!Number.isFinite(total) || total < 0) return '0'
  if (total < 10_000) return total.toLocaleString('pt-BR')
  if (total < 1_000_000) {
    const mil = total / 1000
    const casas = mil >= 100 ? 0 : 1
    return `${mil.toLocaleString('pt-BR', { maximumFractionDigits: casas, minimumFractionDigits: casas })}k`
  }
  const milhao = total / 1_000_000
  return `${milhao.toLocaleString('pt-BR', { maximumFractionDigits: 1, minimumFractionDigits: 1 })}M`
}
