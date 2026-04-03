/**
 * types.ts — Tipos do dominio Pedido
 *
 * Espelha os models e enums de servicos-global/tenant/processos-core/prisma/fragment.prisma
 */

// ── Status do Pedido ──────────────────────────────────────────────────────────

export type StatusPedido = 'draft' | 'aberto' | 'transferencia' | 'consolidado' | 'cancelado'

export const STATUS_PEDIDO_LABELS: Record<StatusPedido, string> = {
  draft: 'Rascunho',
  aberto: 'Aberto',
  transferencia: 'Em Transferencia',
  consolidado: 'Consolidado',
  cancelado: 'Cancelado',
}

// ── Tipo de Operacao ──────────────────────────────────────────────────────────

export type TipoOperacao = 'importacao' | 'exportacao'

export const TIPO_OPERACAO_LABELS: Record<TipoOperacao, string> = {
  importacao: 'Importacao',
  exportacao: 'Exportacao',
}

// ── Interfaces ────────────────────────────────────────────────────────────────

export interface PedidoItem {
  id: string
  tenant_id: string
  company_id: string
  pedido_id: string
  sequencia_item: number | null
  part_number: string
  ncm: string
  descricao: string
  unidade_comercializada_item: string | null
  quantidade_inicial: number
  quantidade_atual: number
  quantidade_pronta: number
  quantidade_transferida: number
  quantidade_cancelada: number
  casas_decimais_quantidade: number
  moeda_item: string
  valor_item: number | null
  valor_unitario: number | null
  casas_decimais_total_item: number
}

export interface Pedido {
  id: string
  tenant_id: string
  company_id: string
  tipo_operacao: TipoOperacao
  numero_pedido: string
  status: StatusPedido

  // Parceiros
  importacao_exportador_id: string | null
  exportacao_importador_id: string | null
  exportador_nome?: string
  fabricante_nome?: string

  // Dados comerciais
  incoterm: string | null
  moeda_pedido: string
  valor_total_pedido: number | null
  casas_decimais_total_pedido: number
  quantidade_total_pedido: number | null
  casas_decimais_quantidade_total_pedido: number
  unidade_comercializada_pedido: string | null

  // Financeiro
  cobertura_cambial: string
  condicao_pagamento: string | null

  // Datas
  data_emissao_pedido: string

  // Referencias
  numero_proforma?: string
  numero_invoice?: string
  referencia_importador?: string
  referencia_exportador?: string
  referencia_fabricante?: string

  // Itens
  itens: PedidoItem[]

  created_at: string
  updated_at: string
}

// ── Tipos para TabelaVirtualGlobal ────────────────────────────────────────────

export interface PedidoStatusConfig {
  id: string
  nome: string
  rotulo: string
  cor: string
  icone?: string
  ordem: number
  is_padrao: boolean
  is_sistema: boolean
}

export interface PedidoColunaConfig {
  id: string
  nome: string
  rotulo: string
  tipo: 'texto' | 'numero' | 'data' | 'select' | 'booleano'
  casas_decimais: number
  opcoes?: { valor: string; rotulo: string }[]
  ordem: number
  filtravel: boolean
  exibida_padrao: boolean
}

export interface PedidoPreferenciasColunas {
  colunas_visiveis: string[]
  colunas_largura?: Record<string, number>
}

export interface PedidosListResponse {
  data: Pedido[]
  nextCursor: string | null
  total: number
  hasMore: boolean
}

// ── Helpers de formatacao ─────────────────────────────────────────────────────

export function fmtQuantidade(valor: number, casas: number = 2): string {
  return valor.toLocaleString('pt-BR', {
    minimumFractionDigits: casas,
    maximumFractionDigits: casas,
  })
}

export function fmtMoeda(valor: number, moeda: string = 'USD'): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: moeda,
  }).format(valor)
}

export function fmtData(iso: string): string {
  return new Date(iso).toLocaleDateString('pt-BR')
}
