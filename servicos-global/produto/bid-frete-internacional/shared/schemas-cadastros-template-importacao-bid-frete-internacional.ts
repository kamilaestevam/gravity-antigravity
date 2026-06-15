import { z } from 'zod'

const itemPaisCadastroSchema = z.object({
  codigo_pais_iso_alpha2: z.string(),
  nome_pais_portugues: z.string(),
})

const itemPortoCadastroSchema = z.object({
  codigo_unlocode_porto: z.string(),
  nome_porto: z.string(),
})

const itemAeroportoCadastroSchema = z.object({
  codigo_iata_aeroporto: z.string().nullable().optional(),
  codigo_unlocode_aeroporto: z.string(),
  nome_aeroporto: z.string(),
})

const itemContainerCadastroSchema = z.object({
  codigo_iso_container: z.string().nullable(),
  tipo_container: z.string(),
  tamanho_container: z.string(),
  armador_dono_container: z.string().nullable(),
})

export const listaPaisesCadastroResponseSchema = z.object({
  itens: z.array(itemPaisCadastroSchema),
})

export const listaPortosCadastroResponseSchema = z.object({
  itens: z.array(itemPortoCadastroSchema),
})

export const listaAeroportosCadastroResponseSchema = z.object({
  itens: z.array(itemAeroportoCadastroSchema),
})

export const listaContainersCadastroResponseSchema = z.object({
  itens: z.array(itemContainerCadastroSchema),
})

export type ItemPaisCadastroTemplate = z.infer<typeof itemPaisCadastroSchema>
export type ItemPortoCadastroTemplate = z.infer<typeof itemPortoCadastroSchema>
export type ItemAeroportoCadastroTemplate = z.infer<typeof itemAeroportoCadastroSchema>
export type ItemContainerCadastroTemplate = z.infer<typeof itemContainerCadastroSchema>
