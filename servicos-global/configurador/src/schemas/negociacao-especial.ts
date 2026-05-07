// src/schemas/negociacao-especial.ts
// Contratos Zod bilaterais (Mandamentos 06+09) para o CRUD de negociacao_especial.
//
// Espelhos diretos do schema.prisma (model ProdutoGravityNegociacaoEspecial,
// @@map "negociacao_especial"). Qualquer rename aqui exige rename no MESMO commit
// nas rotas + service backend.

import { z } from 'zod'
import { negociacaoEspecialProdutoGravitySchema } from './produto-gravity-completo'

// ─── Request bodies ──────────────────────────────────────────────────────────

export const criarNegociacaoEspecialRequestSchema = z.object({
  id_organizacao:                       z.string().min(1),
  nome_organizacao_negociacao_especial: z.string().min(1).max(255),
  acordo_negociacao_especial:           z.string().min(1).max(2000),
  // Decimal aceito como string ("1500.00") ou null (acordo sem preço fixo)
  valor_unitario_negociacao_especial:   z.union([z.string(), z.number()]).nullable().optional(),
  moeda_negociacao_especial:            z.string().length(3).optional(), // ISO-4217 (default BRL no service)
  data_inicio_negociacao_especial:      z.string().datetime().nullable().optional(),
  data_fim_negociacao_especial:         z.string().datetime().nullable().optional(),
  ilimitado_prazo_negociacao_especial:  z.boolean().optional(),
})
export type CriarNegociacaoEspecialRequest = z.infer<typeof criarNegociacaoEspecialRequestSchema>

export const atualizarNegociacaoEspecialRequestSchema = z.object({
  // id_organizacao IMUTÁVEL — não aceita troca de org. Crie uma nova negociação se quiser.
  acordo_negociacao_especial:           z.string().min(1).max(2000).optional(),
  valor_unitario_negociacao_especial:   z.union([z.string(), z.number()]).nullable().optional(),
  moeda_negociacao_especial:            z.string().length(3).optional(),
  data_inicio_negociacao_especial:      z.string().datetime().nullable().optional(),
  data_fim_negociacao_especial:         z.string().datetime().nullable().optional(),
  ilimitado_prazo_negociacao_especial:  z.boolean().optional(),
})
export type AtualizarNegociacaoEspecialRequest = z.infer<typeof atualizarNegociacaoEspecialRequestSchema>

// ─── Responses ───────────────────────────────────────────────────────────────

export const listaNegociacaoEspecialProdutoGravitySchema = z.object({
  negociacao_especial: z.array(negociacaoEspecialProdutoGravitySchema),
})
export type ListaNegociacaoEspecialProdutoGravity = z.infer<
  typeof listaNegociacaoEspecialProdutoGravitySchema
>

export const negociacaoEspecialResponseSchema = z.object({
  negociacao_especial: negociacaoEspecialProdutoGravitySchema,
})
export type NegociacaoEspecialResponse = z.infer<typeof negociacaoEspecialResponseSchema>
