import { z } from 'zod'

export const tipoCambioSiscomexEnum = z.enum([
  'cobertura_cambial',
  'modalidade_pagamento',
])

export const cambioSiscomexSchema = z.object({
  codigo_cambio_siscomex:    z.string().min(1),
  tipo_cambio_siscomex:        tipoCambioSiscomexEnum,
  nome_cambio_siscomex:        z.string().min(1),
  descricao_cambio_siscomex:   z.string().nullable().optional(),
  ordem_cambio_siscomex:       z.number().int(),
  ativo_cambio_siscomex:       z.boolean(),
})

export const listaCambioSiscomexSchema = z.object({
  itens: z.array(cambioSiscomexSchema),
  total: z.number(),
})

export type CambioSiscomex = z.infer<typeof cambioSiscomexSchema>
export type TipoCambioSiscomex = z.infer<typeof tipoCambioSiscomexEnum>
