/**
 * analise-riscos-cache-progresso-smart-read.ts — persistência da análise no JSON de progresso
 */

import { z } from 'zod'
import { AnaliseRiscosLeituraResponseSchema } from './analise-riscos-leitura-smart-read.js'

export const AnaliseRiscosCacheProgressoLeituraSchema = z.record(
  z.string(),
  AnaliseRiscosLeituraResponseSchema,
)

export type AnaliseRiscosCacheProgressoLeitura = z.infer<
  typeof AnaliseRiscosCacheProgressoLeituraSchema
>

export function extrairCacheAnaliseRiscosProgresso(
  bruto: unknown,
): AnaliseRiscosCacheProgressoLeitura | null {
  if (!bruto || typeof bruto !== 'object') return null
  const candidato = (bruto as { analise_riscos_cache?: unknown }).analise_riscos_cache
  const resultado = AnaliseRiscosCacheProgressoLeituraSchema.safeParse(candidato)
  return resultado.success ? resultado.data : null
}

export function mesclarCacheAnaliseRiscosProgresso(
  sessao: Record<string, unknown>,
  chave: string,
  resposta: z.infer<typeof AnaliseRiscosLeituraResponseSchema>,
): Record<string, unknown> {
  const atual = extrairCacheAnaliseRiscosProgresso(sessao) ?? {}
  return {
    ...sessao,
    analise_riscos_cache: {
      ...atual,
      [chave]: resposta,
    },
  }
}
