// src/schemas/assinatura-produto-gravity.ts
// Contrato bilateral (Mandamento 09) entre frontend e backend
// para a rota /api/v1/organizacoes/me/assinaturas-produto-gravity.
//
// Nomes idênticos ao schema.prisma (configurador/prisma/schema.prisma).

import { z } from 'zod'

// ─── Enums (idênticos ao Prisma) ────────────────────────────────────────────

export const statusAssinaturaProdutoGravitySchema = z.enum([
  'ATIVA',
  'EM_TESTE',
  'SUSPENSA',
  'CANCELADA',
])
export type StatusAssinaturaProdutoGravity = z.infer<
  typeof statusAssinaturaProdutoGravitySchema
>

export const tipoCobrancaProdutoGravitySchema = z.enum([
  'MENSAL',
  'POR_PROCESSO',
  'POR_DOCUMENTO',
  'POR_ESTIMATIVA',
  'POR_DI_DUIMP',
  'POR_DUE',
  'POR_PRODUTO',
  'POR_FLUXO',
  'POR_LPCO',
])
export type TipoCobrancaProdutoGravity = z.infer<
  typeof tipoCobrancaProdutoGravitySchema
>

export const statusProdutoGravitySchema = z.enum([
  'ATIVO',
  'SUSPENSO',
  'EM_BREVE',
  'LEGADO',
  'INATIVO',
])

// ─── Sub-schemas ────────────────────────────────────────────────────────────

export const produtoCatalogoSchema = z.object({
  id_produto_gravity:               z.string(),
  slug_produto_gravity:             z.string(),
  nome_produto_gravity:             z.string(),
  descricao_produto_gravity:        z.string(),
  tipo_cobranca_produto_gravity:    tipoCobrancaProdutoGravitySchema,
  preco_unitario_produto_gravity:   z.string(),
  moeda_unitario_produto_gravity:   z.string(),
  status_produto_gravity:           statusProdutoGravitySchema,
})
export type ProdutoCatalogo = z.infer<typeof produtoCatalogoSchema>

export const configuracaoAssinaturaSchema = z.object({
  ativo_configuracao_produto_gravity:    z.boolean(),
  configuracao_config_produto_gravity:   z.unknown(),
})

export const ativacaoProdutoGravityWorkspaceSchema = z.object({
  id_produto_gravity_workspace:    z.string(),
  id_workspace:                    z.string(),
  ativo_produto_gravity_workspace: z.boolean(),
  workspace: z.object({
    nome_workspace:       z.string(),
    subdominio_workspace: z.string().nullable(),
  }),
})
export type AtivacaoProdutoGravityWorkspace = z.infer<
  typeof ativacaoProdutoGravityWorkspaceSchema
>

// ─── Schema principal ───────────────────────────────────────────────────────

export const assinaturaProdutoGravitySchema = z.object({
  id_assinatura_produto_gravity:                  z.string(),
  id_produto_gravity:                             z.string(),
  status_assinatura_produto_gravity:              statusAssinaturaProdutoGravitySchema,
  data_fim_teste_assinatura_produto_gravity:      z.string().datetime().nullable(),
  data_inicio_periodo_assinatura_produto_gravity: z.string().datetime().nullable(),
  data_fim_periodo_assinatura_produto_gravity:    z.string().datetime().nullable(),
  data_cancelamento_assinatura_produto_gravity:   z.string().datetime().nullable(),
  data_criacao_assinatura_produto_gravity:        z.string().datetime(),
  produto:                                        produtoCatalogoSchema,
  configuracao:                                   configuracaoAssinaturaSchema.nullable(),
  ativacoes_produto_gravity:                      z.array(ativacaoProdutoGravityWorkspaceSchema),
})
export type AssinaturaProdutoGravity = z.infer<typeof assinaturaProdutoGravitySchema>

// ─── Response schemas ───────────────────────────────────────────────────────

export const listaAssinaturasProdutoGravitySchema = z.object({
  assinaturas: z.array(assinaturaProdutoGravitySchema),
})

// ─── Request schemas ────────────────────────────────────────────────────────

export const assinarProdutoRequestSchema = z.object({
  slug_produto_gravity: z.string().min(1),
})

export const toggleWorkspaceAssinaturaRequestSchema = z.object({
  ativo_produto_gravity_workspace: z.boolean(),
})
