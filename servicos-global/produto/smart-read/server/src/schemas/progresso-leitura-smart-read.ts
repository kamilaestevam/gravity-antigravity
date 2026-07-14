/**
 * Contratos Zod do progresso do wizard (bilateral front ↔ BFF).
 */
import { z } from 'zod'
import { LeituraSchema } from './leitura-smart-read.js'
import { AnaliseRiscosCacheProgressoLeituraSchema } from '../../../shared/analise-riscos-cache-progresso-smart-read.js'
import { normalizarPassoRegistroProgressoLeituraSmartRead } from '../../../shared/resolver-passo-retomar-leitura-smart-read.js'

export const EstadoProgressoLeituraSchema = z.object({
  passo: z.number().int().min(2).max(4),
  nome: z.string(),
  leitura: LeituraSchema,
  analise_riscos_cache: AnaliseRiscosCacheProgressoLeituraSchema.optional(),
})
export type EstadoProgressoLeitura = z.infer<typeof EstadoProgressoLeituraSchema>

export const DadosSessaoProgressoLeituraSchema = z.object({
  nome: z.string(),
  leitura: LeituraSchema,
  analise_riscos_cache: AnaliseRiscosCacheProgressoLeituraSchema.optional(),
})
export type DadosSessaoProgressoLeitura = z.infer<typeof DadosSessaoProgressoLeituraSchema>

export function montarRespostaProgressoLeitura(
  passo: number,
  dadosSessao: DadosSessaoProgressoLeitura,
): EstadoProgressoLeitura {
  const passoNormalizado = normalizarPassoRegistroProgressoLeituraSmartRead(
    passo,
    dadosSessao.leitura.status_leitura,
  )
  return EstadoProgressoLeituraSchema.parse({
    passo: passoNormalizado,
    nome: dadosSessao.nome,
    leitura: dadosSessao.leitura,
    ...(dadosSessao.analise_riscos_cache
      ? { analise_riscos_cache: dadosSessao.analise_riscos_cache }
      : {}),
  })
}

export function extrairDadosSessaoProgressoLeitura(bruto: unknown): DadosSessaoProgressoLeitura | null {
  const resultado = DadosSessaoProgressoLeituraSchema.safeParse(bruto)
  return resultado.success ? resultado.data : null
}
