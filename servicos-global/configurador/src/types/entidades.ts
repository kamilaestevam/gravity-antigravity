/**
 * tipos/entidades.ts
 * Definições core das entidades da plataforma vinculadas aos serviços globais (Onda 3).
 *
 * REGRA INVIOLÁVEL — Paridade Absoluta (Database Governance Regra 1):
 *   Front = Back = Banco. Nomes de campo aqui DEVEM ser idênticos ao Prisma schema.
 *   Fonte da verdade: configurador/prisma/schema.prisma
 *
 * Nenhum nome neste arquivo é inventado — todos vêm dos models:
 *   - Organizacao (mapeado de Organizacao no schema-composition)
 *   - ProdutoGravity
 *   - ProdutoGravityFaixaPreco
 *   - ProdutoGravityNegociacaoEspecial
 */

// Status do produto — espelha enum StatusProdutoGravity do Prisma
export type StatusGlobal = 'ATIVO' | 'SUSPENSO' | 'EM_BREVE' | 'LEGADO' | 'INATIVO'

// Tipo de cobrança — espelha enum TipoCobrancaGravity do Prisma
export type TipoCobrancaGravity =
  | 'MENSAL'
  | 'POR_PROCESSO'
  | 'POR_DOCUMENTO'
  | 'POR_ESTIMATIVA'
  | 'POR_DI_DUIMP'
  | 'POR_DUE'
  | 'POR_PRODUTO'
  | 'POR_FLUXO'
  | 'POR_LPCO'

// Limite de usuários — espelha enum ProdutoGravityLimiteUsuario do Prisma
export type ProdutoGravityLimiteUsuario = 'ILIMITADO' | 'LIMITADO'

// ── Faixa de Preço (model ProdutoGravityFaixaPreco) ─────────────────────────
export interface FaixaPreco {
  id_faixa_preco_produto_gravity: string
  id_produto_gravity_faixa_preco: string
  faixa_de_faixa_preco_produto_gravity: number
  faixa_ate_faixa_preco_produto_gravity?: number | null
  preco_faixa_preco_produto_gravity: string // Decimal serializado como string
  moeda_faixa_preco_produto_gravity: string
}

// ── Produto Gravity (model ProdutoGravity) ──────────────────────────────────
export interface ProdutoCatalogo {
  id_produto_gravity: string
  nome_produto_gravity: string
  slug_produto_gravity: string
  descricao_produto_gravity: string
  status_produto_gravity: StatusGlobal
  data_lancamento_produto_gravity?: string | null

  // Setup
  possui_setup_produto_gravity: boolean
  preco_setup_produto_gravity?: string | null
  moeda_setup_produto_gravity: string

  // Billing
  tipo_cobranca_produto_gravity: TipoCobrancaGravity
  preco_unitario_produto_gravity: string
  moeda_unitario_produto_gravity: string
  preco_minimo_produto_gravity: string
  moeda_minimo_produto_gravity: string
  preco_total_produto_gravity?: string | null
  moeda_total_produto_gravity: string

  // Users
  tipo_limite_usuario_produto_gravity: ProdutoGravityLimiteUsuario
  qtd_usuarios_base_produto_gravity?: number | null
  preco_usuario_extra_produto_gravity?: string | null
  moeda_usuario_extra_produto_gravity: string

  // Support
  horas_helpdesk_produto_gravity: number
  preco_hora_extra_produto_gravity?: string | null
  moeda_hora_extra_produto_gravity: string

  // GABI On-Demand
  quota_gabi_mensal_produto_gravity: number

  // Metadata
  modulo_backend_produto_gravity?: string | null
  publico_alvo_produto_gravity?: string | null

  // Relations (opcionais para hidratação)
  faixas_preco_produto_gravity?: FaixaPreco[]
}

// ── Negociação Especial (model ProdutoGravityNegociacaoEspecial) ────────────
export interface NegociacaoEspecial {
  id_negociacao_especial_preco_produto_gravity: string
  id_produto_gravity: string
  id_organizacao: string
  nome_organizacao_negociacao_especial_preco_produto_gravity: string
  acordo_negociacao_especial_preco_produto_gravity: string
  data_inicio_negociacao_especial_preco_produto_gravity?: string | null
  data_fim_negociacao_especial_preco_produto_gravity?: string | null
  ilimitado_negociacao_especial_preco_produto_gravity: boolean
}

// ── Organização (model Organizacao do schema-composition) ───────────────────
export interface Organizacao {
  id_organizacao: string
  nome_organizacao: string
  subdominio_organizacao: string
  status_organizacao: string
  data_criacao_organizacao: string
  _count?: {
    users: number
    companies: number
  }
}
