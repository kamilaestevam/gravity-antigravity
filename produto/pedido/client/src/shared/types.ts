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

  // Identificação do produto
  part_number: string
  ncm: string
  descricao: string
  descricao_completa?: string | null
  descricao_en?: string | null
  descricao_es?: string | null
  descricao_espelho_nf?: string | null
  texto_posicao_ncm?: string | null
  atributos_catalogo?: string | null

  // Quantidades
  quantidade_inicial: number
  quantidade_atual: number
  quantidade_pronta: number
  quantidade_transferida: number
  quantidade_cancelada: number
  casas_decimais_quantidade: number

  // Unidade comercializada
  unidade_comercializada_item: string | null
  casas_decimais_unidade_comercializada?: number

  // Unidade estatística
  unidade_estatistica?: string | null
  quantidade_unidade_estatistica?: number | null
  casas_decimais_unidade_estatistica?: number

  // Financeiro
  moeda_item: string
  valor_unitario: number | null
  casas_decimais_valor_unitario?: number
  valor_item: number | null
  casas_decimais_total_item: number

  // Pesos e cubagem
  peso_liquido_unitario?: number | null
  peso_bruto_unitario?: number | null
  cubagem_unitaria?: number | null
  casas_decimais_peso?: number
  casas_decimais_cubagem?: number

  // Embalagem e documentos
  tipo_embalagem?: string | null
  numero_lpco?: string | null
  anexo_lpco?: string | null
  numero_certificado_origem?: string | null
  data_certificado_origem?: string | null

  // Classificação
  grupo_produto?: string | null
  subgrupo_produto?: string | null
  campo_especial?: string | null

  // Datas do item
  data_inclusao_item?: string | null
  data_transferencia_item?: string | null
  data_consolidacao_item?: string | null

  // Datas LPCO
  data_prevista_conferencia_draft_lpco?: string | null
  data_confirmada_conferencia_draft_lpco?: string | null
  data_meta_conferencia_draft_lpco?: string | null
  data_prevista_aprovacao_draft_lpco?: string | null
  data_confirmada_aprovacao_draft_lpco?: string | null
  data_meta_aprovacao_draft_lpco?: string | null
  data_prevista_registro_lpco?: string | null
  data_confirmada_registro_lpco?: string | null
  data_meta_registro_lpco?: string | null
  data_prevista_resultado_analise_lpco?: string | null
  data_confirmada_resultado_analise_lpco?: string | null
  data_meta_resultado_analise_lpco?: string | null
  data_prevista_deferimento_lpco?: string | null
  data_confirmada_deferimento_lpco?: string | null
  data_meta_deferimento_lpco?: string | null
  data_confirmada_indeferimento_lpco?: string | null
  data_confirmada_exigencia_lpco?: string | null

  // Datas Certificado de Origem
  data_prevista_recebimento_draft_cert_origem?: string | null
  data_confirmada_recebimento_draft_cert_origem?: string | null
  data_meta_recebimento_draft_cert_origem?: string | null
  data_prevista_aprovacao_draft_cert_origem?: string | null
  data_confirmada_aprovacao_draft_cert_origem?: string | null
  data_meta_aprovacao_draft_cert_origem?: string | null
  data_prevista_envio_original_cert_origem?: string | null
  data_confirmada_envio_original_cert_origem?: string | null
  data_meta_envio_original_cert_origem?: string | null
  data_prevista_recebimento_original_cert_origem?: string | null
  data_confirmada_recebimento_original_cert_origem?: string | null
  data_meta_recebimento_original_cert_origem?: string | null
  data_cert_origem?: string | null

  // DUIMP — Dados gerais
  tipo_operacao_duimp?: string | null
  descricao_resumida_duimp?: string | null
  versao_produto_duimp?: string | null
  ncm_duimp?: string | null
  atributos_duimp?: string | null
  relacao_exportador_fabricante_duimp?: string | null
  vinculacao_preco_duimp?: string | null
  aplicacao_mercadoria_duimp?: string | null
  condicao_mercadoria_duimp?: string | null
  descricao_completa_duimp?: string | null
  descricao_complementar_duimp?: string | null

  // DUIMP — OPE exportador
  codigo_ope_duimp?: string | null
  versao_ope_duimp?: string | null
  nome_ope_duimp?: string | null
  endereco_ope_duimp?: string | null
  pais_ope_duimp?: string | null

  // DUIMP — OPE fabricante
  codigo_ope_fabricante_duimp?: string | null
  versao_ope_fabricante_duimp?: string | null
  nome_ope_fabricante_duimp?: string | null
  endereco_ope_fabricante_duimp?: string | null
  pais_fabricante_ope_duimp?: string | null

  // DUIMP — Quantidades
  quantidade_unidade_estatistica_duimp?: number | null
  unidade_estatistica_duimp?: string | null
  quantidade_unidade_comercializada_duimp?: number | null
  unidade_comercializada_duimp?: string | null
  peso_liquido_unitario_duimp?: number | null

  // DUIMP — Valoração
  moeda_produto_duimp?: string | null
  valor_unitario_duimp?: number | null
  valor_total_condicao_venda_duimp?: number | null
  incoterm_duimp?: string | null
  valor_condicao_venda_brl_duimp?: number | null
  valor_frete_internacional_brl_duimp?: number | null
  valor_seguro_internacional_brl_duimp?: number | null
  complemento_condicao_venda_duimp?: string | null
  tipo_acrescimo_deducao_duimp?: string | null
  denominacao_acrescimo_duimp?: string | null
  denominacao_deducao_duimp?: string | null
  moeda_acrescimo_deducao_duimp?: string | null
  valor_acrescimo_deducao_moeda_duimp?: number | null
  valor_acrescimo_deducao_brl_duimp?: number | null
  valor_local_embarque_brl_duimp?: number | null
  valor_aduaneiro_brl_duimp?: number | null
  metodo_valoracao_duimp?: string | null

  // DUIMP — Cobertura cambial
  tipo_cobertura_cambial_duimp?: string | null
  instituicao_financiadora_duimp?: string | null
  valor_cobertura_cambial_duimp?: number | null
  numero_rof_bacen_duimp?: string | null
  motivo_sem_cobertura_duimp?: string | null

  // DUIMP — Declaração vinculada
  tipo_declaracao_vinculada_duimp?: string | null
  numero_declaracao_vinculada_duimp?: string | null
  item_declaracao_vinculada_duimp?: string | null
  adicao_declaracao_vinculada_duimp?: string | null

  // DUIMP — Fundamento legal
  fundamento_legal_duimp?: string | null
  tributo_fundamento_legal_duimp?: string | null
  regime_tributacao_duimp?: string | null
  fundamento_duimp?: string | null
  campos_preenchimento_duimp?: string | null

  // DUIMP — II (Imposto de Importação)
  fundamento_legal_ii_duimp?: string | null
  base_calculo_ii_duimp?: number | null
  tipo_aliquota_ii_duimp?: string | null
  percentual_ii_duimp?: number | null
  valor_calculado_ii_duimp?: number | null
  valor_devido_ii_duimp?: number | null
  valor_suspenso_ii_duimp?: number | null
  valor_recolher_ii_duimp?: number | null

  // DUIMP — IPI
  fundamento_legal_ipi_duimp?: string | null
  base_calculo_ipi_duimp?: number | null
  tipo_aliquota_ipi_duimp?: string | null
  percentual_ipi_duimp?: number | null
  valor_calculado_ipi_duimp?: number | null
  valor_devido_ipi_duimp?: number | null
  valor_suspenso_ipi_duimp?: number | null
  valor_recolher_ipi_duimp?: number | null

  // DUIMP — PIS
  fundamento_legal_pis_duimp?: string | null
  base_calculo_pis_duimp?: number | null
  tipo_aliquota_pis_duimp?: string | null
  percentual_pis_duimp?: number | null
  valor_calculado_pis_duimp?: number | null
  valor_devido_pis_duimp?: number | null
  valor_suspenso_pis_duimp?: number | null
  valor_recolher_pis_duimp?: number | null

  // DUIMP — COFINS
  fundamento_legal_cofins_duimp?: string | null
  base_calculo_cofins_duimp?: number | null
  tipo_aliquota_cofins_duimp?: string | null
  percentual_cofins_duimp?: number | null
  valor_calculado_cofins_duimp?: number | null
  valor_devido_cofins_duimp?: number | null
  valor_suspenso_cofins_duimp?: number | null
  valor_recolher_cofins_duimp?: number | null

  // DUIMP — Tratamento administrativo
  existe_tratamento_administrativo_duimp?: string | null
  ultima_analise_trat_adm_duimp?: string | null
  item_trat_adm_duimp?: string | null
  tipo_trat_adm_duimp?: string | null
  descricao_trat_adm_duimp?: string | null
  orgao_trat_adm_duimp?: string | null
  numero_lpco_trat_adm_duimp?: string | null
  observacoes_trat_adm_duimp?: string | null

  // DUIMP — Débito em conta
  banco_debito_duimp?: string | null
  agencia_debito_duimp?: string | null
  conta_corrente_debito_duimp?: string | null
}

export interface Pedido {
  id: string
  tenant_id: string
  company_id: string
  tipo_operacao: TipoOperacao
  numero_pedido: string
  status: StatusPedido

  // Exportador
  importacao_exportador_id: string | null
  exportador_nome?: string | null
  id_exportador?: string | null
  endereco_exportador?: string | null
  pais_exportador?: string | null
  estado_exportador?: string | null
  cidade_exportador?: string | null
  zip_code_exportador?: string | null
  exportador_ou_fabricante?: string | null
  relacao_exportador_fabricante?: string | null

  // Contato do exportador
  nome_contato_exportador?: string | null
  email_contato_exportador?: string | null
  whatsapp_contato_exportador?: string | null
  cargo_contato_exportador?: string | null
  departamento_contato_exportador?: string | null

  // Fabricante
  fabricante_nome?: string | null
  id_fabricante?: string | null
  endereco_fabricante?: string | null
  pais_fabricante?: string | null
  estado_fabricante?: string | null
  cidade_fabricante?: string | null
  zip_code_fabricante?: string | null

  // OPE (Operador Estrangeiro)
  cnpj_raiz_empresa_responsavel?: string | null
  codigo_ope?: string | null
  situacao_ope?: string | null
  versao_ope?: string | null
  endereco_ope?: string | null
  pais_ope?: string | null
  nome_ope?: string | null
  estado_ope?: string | null
  cidade_ope?: string | null
  zip_code_ope?: string | null
  tin_ope?: string | null
  email_ope?: string | null

  // Exportacao
  exportacao_importador_id: string | null

  // Dados comerciais
  incoterm: string | null
  moeda_pedido: string
  valor_total_pedido: number | null
  casas_decimais_total_pedido: number
  quantidade_total_pedido: number | null
  casas_decimais_quantidade_total_pedido: number
  unidade_comercializada_pedido: string | null
  quantidade_volumes_pedido?: number | null

  // Catálogo
  partnumber_produto_pedido?: string | null
  referencia_interna_produto_catalogo?: string | null

  // Financeiro
  cobertura_cambial: string
  condicao_pagamento: string | null

  // Dados físicos
  peso_liquido_total_pedido?: number | null
  peso_bruto_total_pedido?: number | null
  cubagem_total_pedido?: number | null
  casas_decimais_peso_pedido?: number
  casas_decimais_cubagem_pedido?: number

  // Documentos
  numero_proforma?: string | null
  anexo_proforma?: string | null
  numero_invoice?: string | null
  anexo_invoice?: string | null
  anexo_pedido?: string | null
  referencia_importador?: string | null
  referencia_exportador?: string | null
  referencia_fabricante?: string | null

  // Datas principais
  data_emissao_pedido: string
  data_prevista_pedido_pronto?: string | null
  data_confirmada_pedido_pronto?: string | null
  data_meta_pedido_pronto?: string | null
  data_prevista_inspecao_pedido?: string | null
  data_confirmada_inspecao_pedido?: string | null
  data_meta_inspecao_pedido?: string | null
  data_prevista_coleta_pedido?: string | null
  data_confirmada_coleta_pedido?: string | null
  data_meta_coleta_pedido?: string | null
  data_consolidacao_pedido?: string | null
  data_transferencia_saldo_pedido?: string | null

  // Datas — Draft do Pedido
  data_prevista_recebimento_draft_pedido?: string | null
  data_confirmada_recebimento_draft_pedido?: string | null
  data_meta_recebimento_draft_pedido?: string | null
  data_prevista_aprovacao_draft_pedido?: string | null
  data_confirmada_aprovacao_draft_pedido?: string | null
  data_meta_aprovacao_draft_pedido?: string | null
  data_documento_pedido?: string | null

  // Datas — Draft da Proforma Invoice
  data_prevista_recebimento_draft_proforma?: string | null
  data_confirmada_recebimento_draft_proforma?: string | null
  data_meta_recebimento_draft_proforma?: string | null
  data_prevista_aprovacao_draft_proforma?: string | null
  data_confirmada_aprovacao_draft_proforma?: string | null
  data_meta_aprovacao_draft_proforma?: string | null

  // Datas — Original da Proforma Invoice
  data_prevista_envio_original_proforma?: string | null
  data_confirmada_envio_original_proforma?: string | null
  data_meta_envio_original_proforma?: string | null
  data_prevista_recebimento_original_proforma?: string | null
  data_confirmada_recebimento_original_proforma?: string | null
  data_meta_recebimento_original_proforma?: string | null
  data_proforma_invoice?: string | null

  // Datas — Draft da Invoice
  data_prevista_recebimento_draft_invoice?: string | null
  data_confirmada_recebimento_draft_invoice?: string | null
  data_meta_recebimento_draft_invoice?: string | null
  data_prevista_aprovacao_draft_invoice?: string | null
  data_confirmada_aprovacao_draft_invoice?: string | null
  data_meta_aprovacao_draft_invoice?: string | null

  // Datas — Original da Invoice
  data_prevista_envio_original_invoice?: string | null
  data_confirmada_envio_original_invoice?: string | null
  data_meta_envio_original_invoice?: string | null
  data_prevista_recebimento_original_invoice?: string | null
  data_confirmada_recebimento_original_invoice?: string | null
  data_meta_recebimento_original_invoice?: string | null
  data_invoice?: string | null

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
