// src/schemas/produto-gravity-completo.ts
// Contrato bilateral (Mandamento 09) entre frontend e backend para a rota
// GET /api/v1/produtos-gravity/:slug — retorna produto COMPLETO read-only para o
// modal "Configurar Assinatura" do workspace (espelho do admin).
//
// Nomes idênticos ao schema.prisma (configurador/prisma/schema.prisma).

import { z } from 'zod'
import {
  statusProdutoGravitySchema,
  tipoCobrancaProdutoGravitySchema,
} from './assinatura-produto-gravity'

// ─── Faixa de preço por volume ──────────────────────────────────────────────

export const faixaPrecoProdutoGravitySchema = z.object({
  id_faixa_preco_produto_gravity:        z.string(),
  id_produto_gravity_faixa_preco:        z.string(),
  faixa_de_faixa_preco_produto_gravity:  z.number(),
  faixa_ate_faixa_preco_produto_gravity: z.number().nullable(),
  preco_faixa_preco_produto_gravity:     z.string(), // Decimal serializado
  moeda_faixa_preco_produto_gravity:     z.string(),
  data_criacao_faixa_preco_produto_gravity: z.string().datetime(),
})
export type FaixaPrecoProdutoGravity = z.infer<typeof faixaPrecoProdutoGravitySchema>

// ─── Negociação especial (somente as da organização autenticada) ────────────

export const negociacaoEspecialProdutoGravitySchema = z.object({
  id_negociacao_especial_preco_produto_gravity:               z.string(),
  id_produto_gravity:                                         z.string(),
  id_organizacao:                                             z.string(),
  nome_organizacao_negociacao_especial_preco_produto_gravity: z.string(),
  acordo_negociacao_especial_preco_produto_gravity:           z.string(),
  data_inicio_negociacao_especial_preco_produto_gravity:      z.string().datetime().nullable(),
  data_fim_negociacao_especial_preco_produto_gravity:         z.string().datetime().nullable(),
  ilimitado_negociacao_especial_preco_produto_gravity:        z.boolean(),
  data_criacao_negociacao_especial_preco_produto_gravity:     z.string().datetime(),
  data_atualizacao_negociacao_especial_preco_produto_gravity: z.string().datetime(),
})
export type NegociacaoEspecialProdutoGravity = z.infer<
  typeof negociacaoEspecialProdutoGravitySchema
>

// ─── Limite de usuários ─────────────────────────────────────────────────────

export const limiteUsuarioProdutoGravitySchema = z.enum(['ILIMITADO', 'LIMITADO'])
export type LimiteUsuarioProdutoGravity = z.infer<typeof limiteUsuarioProdutoGravitySchema>

// ─── Produto Gravity COMPLETO ───────────────────────────────────────────────

export const produtoGravityCompletoSchema = z.object({
  // Dados básicos
  id_produto_gravity:              z.string(),
  nome_produto_gravity:            z.string(),
  slug_produto_gravity:            z.string(),
  descricao_produto_gravity:       z.string(),
  status_produto_gravity:          statusProdutoGravitySchema,
  data_lancamento_produto_gravity: z.string().datetime().nullable(),

  // Setup
  possui_setup_produto_gravity:    z.boolean(),
  preco_setup_produto_gravity:     z.string().nullable(), // Decimal serializado
  moeda_setup_produto_gravity:     z.string(),

  // Valor (cobrança/preços)
  tipo_cobranca_produto_gravity:   tipoCobrancaProdutoGravitySchema,
  preco_unitario_produto_gravity:  z.string(),
  moeda_unitario_produto_gravity:  z.string(),
  preco_minimo_produto_gravity:    z.string(),
  moeda_minimo_produto_gravity:    z.string(),
  preco_total_produto_gravity:     z.string().nullable(),
  moeda_total_produto_gravity:     z.string(),

  // Usuários
  tipo_limite_usuario_produto_gravity: limiteUsuarioProdutoGravitySchema,
  qtd_usuarios_base_produto_gravity:   z.number().nullable(),
  preco_usuario_extra_produto_gravity: z.string().nullable(),
  moeda_usuario_extra_produto_gravity: z.string(),

  // Help Desk
  horas_helpdesk_produto_gravity:   z.number(),
  preco_hora_extra_produto_gravity: z.string().nullable(),
  moeda_hora_extra_produto_gravity: z.string(),

  // GABI Tokens
  quota_gabi_mensal_produto_gravity: z.number(),

  // Metadata
  modulo_backend_produto_gravity: z.string().nullable(),
  publico_alvo_produto_gravity:   z.string().nullable(),

  // Timestamps
  data_criacao_produto_gravity:     z.string().datetime(),
  data_atualizacao_produto_gravity: z.string().datetime(),
  data_remocao_produto_gravity:     z.string().datetime().nullable(),

  // Relations (já filtradas pela organização autenticada)
  faixas_preco_produto_gravity: z.array(faixaPrecoProdutoGravitySchema),
  negociacoes_produto_gravity:  z.array(negociacaoEspecialProdutoGravitySchema),
})
export type ProdutoGravityCompleto = z.infer<typeof produtoGravityCompletoSchema>

// ─── Response wrapper ───────────────────────────────────────────────────────

export const produtoGravityCompletoResponseSchema = z.object({
  produto: produtoGravityCompletoSchema,
})
