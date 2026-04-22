import { z } from 'zod'

/**
 * Validação Moeda — catálogo global (sem id_organizacao).
 * - codigo: ISO 4217 (3 letras maiúsculas)
 */
const moedaCodigoRegex = /^[A-Z]{3}$/

export const moedaSchema = z.object({
  codigo: z.string().regex(moedaCodigoRegex, 'codigo precisa ser ISO 4217 (3 letras maiúsculas, ex: BRL, USD)'),
  nome: z.string().min(1, 'nome obrigatório'),
  simbolo: z.string().min(1, 'simbolo obrigatório'),
  ativo: z.boolean(),
})

export const criarMoedaSchema = moedaSchema.extend({
  ativo: z.boolean().default(true),
})
export const atualizarMoedaSchema = moedaSchema.partial().omit({ codigo: true })

export type Moeda = z.infer<typeof moedaSchema>
export type CriarMoedaInput = z.infer<typeof criarMoedaSchema>
export type AtualizarMoedaInput = z.infer<typeof atualizarMoedaSchema>
