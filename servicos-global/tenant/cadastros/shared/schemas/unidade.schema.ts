import { z } from 'zod'

/**
 * Validação Unidade — catálogo global.
 */
export const tipoUnidadeEnum = z.enum(['peso', 'quantidade', 'comprimento', 'volume'])

export const unidadeSchema = z.object({
  codigo: z.string().min(1, 'codigo obrigatório').max(8, 'codigo de unidade tem no máximo 8 caracteres'),
  nome: z.string().min(1, 'nome obrigatório'),
  tipo: tipoUnidadeEnum,
  ativo: z.boolean(),
})

export const criarUnidadeSchema = unidadeSchema.extend({
  ativo: z.boolean().default(true),
})
export const atualizarUnidadeSchema = unidadeSchema.partial().omit({ codigo: true })

export type Unidade = z.infer<typeof unidadeSchema>
export type CriarUnidadeInput = z.infer<typeof criarUnidadeSchema>
export type AtualizarUnidadeInput = z.infer<typeof atualizarUnidadeSchema>
export type TipoUnidade = z.infer<typeof tipoUnidadeEnum>
