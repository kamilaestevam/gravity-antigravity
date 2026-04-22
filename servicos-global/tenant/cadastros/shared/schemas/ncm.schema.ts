import { z } from 'zod'

/**
 * Validação NCM — catálogo global. Código com 8 dígitos numéricos.
 */
const ncmCodigoRegex = /^\d{8}$/

export const ncmSchema = z.object({
  codigo: z.string().regex(ncmCodigoRegex, 'codigo NCM precisa ter exatamente 8 dígitos numéricos'),
  descricao: z.string().min(1, 'descricao obrigatória'),
  ipi: z.number().min(0, 'ipi precisa ser >= 0').nullable().optional(),
  ii: z.number().min(0, 'ii precisa ser >= 0').nullable().optional(),
  ativo: z.boolean(),
})

export const criarNCMSchema = ncmSchema.extend({
  ativo: z.boolean().default(true),
})
export const atualizarNCMSchema = ncmSchema.partial().omit({ codigo: true })

export type NCM = z.infer<typeof ncmSchema>
export type CriarNCMInput = z.infer<typeof criarNCMSchema>
export type AtualizarNCMInput = z.infer<typeof atualizarNCMSchema>
