import { z } from 'zod'
import { TIPOS_CERTIFICADO_GUIA_GRAVITY } from './certificado-guia-gravity.js'

export const guiaGravityJornadaSchema = z.object({
  id_guia_gravity_jornada_usuario: z.string(),
  data_inicio_jornada_guia_gravity: z.string().datetime(),
  dias_ofensiva_guia_gravity: z.number().int(),
  data_ultima_atividade_jornada_guia_gravity: z.string().datetime().nullable(),
})

export const guiaGravityAulaConclusaoSchema = z.object({
  slug_aula_guia_gravity: z.string(),
  slug_produto_guia_gravity: z.string(),
  xp_conquistado_aula_guia_gravity: z.number(),
  data_conclusao_aula_guia_gravity: z.string().datetime(),
})

export const guiaGravityCertificadoSchema = z.object({
  tipo_certificado_guia_gravity: z.enum(TIPOS_CERTIFICADO_GUIA_GRAVITY),
  numero_certificado_guia_gravity: z.string(),
  codigo_verificacao_certificado_guia_gravity: z.string(),
  data_emissao_certificado_guia_gravity: z.string().datetime(),
  xp_modulo_certificado_guia_gravity: z.number().int(),
  nivel_certificado_guia_gravity: z.number().int(),
})

export const guiaGravityRitmoSchema = z.object({
  delta_dias: z.number(),
  pct_real: z.number(),
  pct_ideal: z.number(),
  dias_decorridos: z.number(),
})

export const guiaGravityManualLidoSchema = z.object({
  slug_manual_guia_gravity: z.string(),
  data_leitura_manual_guia_gravity: z.string().datetime(),
})

export const guiaGravityJornadaResponseSchema = z.object({
  jornada: guiaGravityJornadaSchema,
  aulas_concluidas: z.array(guiaGravityAulaConclusaoSchema),
  certificados: z.array(guiaGravityCertificadoSchema),
  manuais_lidos: z.array(guiaGravityManualLidoSchema),
  manuais_total: z.number().int(),
  xp_total: z.number(),
  nivel: z.number().int(),
  ritmo: guiaGravityRitmoSchema,
})

export const guiaGravityRankingLinhaSchema = z.object({
  id_usuario: z.string(),
  nome_usuario: z.string(),
  xp_total: z.number(),
  posicao: z.number().int(),
  usuario_atual: z.boolean(),
})

export const guiaGravityRankingResponseSchema = z.object({
  ranking: z.array(guiaGravityRankingLinhaSchema),
})

export type GuiaGravityRankingResponse = z.infer<typeof guiaGravityRankingResponseSchema>

export type GuiaGravityJornadaResponse = z.infer<typeof guiaGravityJornadaResponseSchema>

export const concluirAulaGuiaGravityBodySchema = z.object({
  slug_produto_guia_gravity: z.string().min(1),
})

export const concluirAulaGuiaGravityResponseSchema = guiaGravityJornadaResponseSchema

export const verificarCertificadoGuiaGravityResponseSchema = z.object({
  valido: z.boolean(),
  certificado: guiaGravityCertificadoSchema
    .extend({
      nome_usuario: z.string(),
      nome_organizacao: z.string(),
    })
    .nullable(),
})

export type VerificarCertificadoGuiaGravityResponse = z.infer<
  typeof verificarCertificadoGuiaGravityResponseSchema
>
