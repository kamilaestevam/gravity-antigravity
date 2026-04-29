import { z } from 'zod'

/**
 * Validação Moeda — catálogo global (sem id_organizacao).
 * - codigo_moeda: ISO 4217 (3 letras maiúsculas)
 */
const moedaCodigoRegex = /^[A-Z]{3}$/

export const moedaSchema = z.object({
  codigo_moeda: z.string().regex(moedaCodigoRegex, 'codigo_moeda precisa ser ISO 4217 (3 letras maiúsculas, ex: BRL, USD)'),
  nome_moeda: z.string().min(1, 'nome_moeda obrigatório'),
  simbolo_moeda: z.string().min(1, 'simbolo_moeda obrigatório'),
  ativo_moeda: z.boolean(),
})

export const criarMoedaSchema = moedaSchema.extend({
  ativo_moeda: z.boolean().default(true),
})
export const atualizarMoedaSchema = moedaSchema.partial().omit({ codigo_moeda: true })

export type Moeda = z.infer<typeof moedaSchema>
export type CriarMoedaInput = z.infer<typeof criarMoedaSchema>
export type AtualizarMoedaInput = z.infer<typeof atualizarMoedaSchema>
