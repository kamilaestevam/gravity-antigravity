import { z } from 'zod'

export const categoriaVolumeEnum = z.enum([
  'tambor',
  'caixa',
  'saco',
  'pallet',
  'granel',
  'sem_embalagem',
  'outros',
])

export const volumeSchema = z.object({
  codigo_volume: z.string().min(1).max(16),
  nome_volume: z.string().min(1),
  nome_volume_ingles: z.string().nullable().optional(),
  codigo_siscomex_volume: z.string().nullable().optional(),
  codigo_unece_rec21_volume: z.string().nullable().optional(),
  texto_especie_nfe_volume: z.string().min(1),
  categoria_volume: categoriaVolumeEnum,
  eh_unidade_carga_volume: z.boolean(),
  ativo_volume: z.boolean(),
})

export const criarVolumeSchema = volumeSchema.extend({
  eh_unidade_carga_volume: z.boolean().default(false),
  ativo_volume: z.boolean().default(true),
})

export const atualizarVolumeSchema = volumeSchema.partial().omit({ codigo_volume: true })

export type Volume = z.infer<typeof volumeSchema>
export type CriarVolumeInput = z.infer<typeof criarVolumeSchema>
export type AtualizarVolumeInput = z.infer<typeof atualizarVolumeSchema>
export type CategoriaVolume = z.infer<typeof categoriaVolumeEnum>
