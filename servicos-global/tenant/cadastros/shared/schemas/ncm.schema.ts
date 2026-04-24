import { z } from 'zod'

/**
 * Validação NCM — catálogo global. Código com 8 dígitos numéricos.
 */
const ncmCodigoRegex = /^\d{8}$/

export const ncmSchema = z.object({
  codigo_ncm: z.string().regex(ncmCodigoRegex, 'codigo_ncm precisa ter exatamente 8 dígitos numéricos'),
  descricao_ncm: z.string().min(1, 'descricao_ncm obrigatória'),
  ipi_ncm: z.number().min(0, 'ipi_ncm precisa ser >= 0').nullable().optional(),
  ii_ncm: z.number().min(0, 'ii_ncm precisa ser >= 0').nullable().optional(),
  pis_ncm: z.number().min(0, 'pis_ncm precisa ser >= 0').nullable().optional(),
  cofins_ncm: z.number().min(0, 'cofins_ncm precisa ser >= 0').nullable().optional(),
  ativo_ncm: z.boolean(),
})

export const criarNCMSchema = ncmSchema.extend({
  ativo_ncm: z.boolean().default(true),
})
export const atualizarNCMSchema = ncmSchema.partial().omit({ codigo_ncm: true })

export type NCM = z.infer<typeof ncmSchema>
export type CriarNCMInput = z.infer<typeof criarNCMSchema>
export type AtualizarNCMInput = z.infer<typeof atualizarNCMSchema>
