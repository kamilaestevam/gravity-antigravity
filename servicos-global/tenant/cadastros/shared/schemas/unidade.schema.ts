import { z } from 'zod'

/**
 * Validação Unidade — catálogo global.
 */
export const tipoUnidadeEnum = z.enum(['peso', 'quantidade', 'comprimento', 'volume'])

export const unidadeSchema = z.object({
  codigo_unidade: z.string().min(1, 'codigo_unidade obrigatório').max(8, 'codigo_unidade tem no máximo 8 caracteres'),
  nome_unidade: z.string().min(1, 'nome_unidade obrigatório'),
  tipo_unidade: tipoUnidadeEnum,
  ativo_unidade: z.boolean(),
})

export const criarUnidadeSchema = unidadeSchema.extend({
  ativo_unidade: z.boolean().default(true),
})
export const atualizarUnidadeSchema = unidadeSchema.partial().omit({ codigo_unidade: true })

export type Unidade = z.infer<typeof unidadeSchema>
export type CriarUnidadeInput = z.infer<typeof criarUnidadeSchema>
export type AtualizarUnidadeInput = z.infer<typeof atualizarUnidadeSchema>
export type TipoUnidade = z.infer<typeof tipoUnidadeEnum>
