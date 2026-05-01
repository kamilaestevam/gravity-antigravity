/**
 * types.ts — Tipos do dominio Pedido
 *
 * Espelha os models e enums de servicos-global/tenant/processos-core/prisma/fragment.prisma
 */

// ── Status do Pedido ──────────────────────────────────────────────────────────

export type PedidoStatus = 'draft' | 'aberto' | 'em_andamento' | 'aprovado' | 'transferencia' | 'consolidado' | 'cancelado'

export const STATUS_PEDIDO_LABELS: Record<PedidoStatus, string> = {
  draft:         'Rascunho',
  aberto:        'Aberto',
  em_andamento:  'Em Andamento',
  aprovado:      'Aprovado',
  transferencia: 'Transferido',
  consolidado:   'Consolidado',
  cancelado:     'Cancelado',
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
  descricao_item: string
  descricao_completa_item_pt?: string | null
  descricao_completa_item_en?: string | null
  descricao_completa_item_es?: string | null
  descricao_completa_item_nf?: string | null
  texto_posicao_ncm?: string | null
  atributos_catalogo?: string | null

  // Unidade
  unidade_comercializada_item?: string | null

  // Quantidades
  quantidade_inicial_pedido: number
  quantidade_atual_pedido: number
  quantidade_pronta_total_item_pedido: number
  quantidade_transferida_pedido: number
  quantidade_cancelada_pedido: number
  casas_decimais_quantidade_item: number

  // Datas por item
  data_emissao_pedido?: string | null

  // Financeiro
  incoterm?: string | null
  condicao_pagamento?: string | null
  moeda_item: string
  valor_total_item: number | null
  valor_por_unidade_item?: number | null
  casas_decimais_valor_item: number
  cobertura_cambial?: string
  nome_exportador?: string | null
  nome_importador?: string | null
  nome_fabricante?: string | null
  referencia_importador?: string | null
  referencia_exportador?: string | null
  referencia_fabricante?: string | null

  // Pesos e cubagem
  peso_liquido_unitario?: number | null
  peso_liquido_unidade_item?: string | null
  peso_bruto_unitario?: number | null
  peso_bruto_unidade_item?: string | null
  cubagem_unitaria?: number | null
  casas_decimais_peso_item?: number
  casas_decimais_cubagem_item?: number

  // Embalagem e documentos
  tipo_embalagem?: string | null
  numero_lpco?: string | null
  anexo_lpco?: string | null
  numero_certificado_origem?: string | null
  data_certificado_origem?: string | null

  // Classificação
  grupo_item?: string | null
  subgrupo_item?: string | null
  campo_especial_item?: string | null

  // Datas do item
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
  status: PedidoStatus

  // Exportador
  importacao_exportador_id: string | null
  nome_exportador?: string | null
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
  nome_fabricante?: string | null
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
  nome_importador?: string | null
  cnpj_importador?: string | null

  // Dados comerciais
  incoterm: string | null
  moeda_pedido: string
  valor_total_pedido: number | null
  casas_decimais_valor_pedido: number
  quantidade_total_pedido: number | null
  casas_decimais_quantidade_pedido: number
  unidade_comercializada_pedido?: string | null
  quantidade_volumes_pedido?: number | null

  // Agregados de itens (soma calculada pelo backend)
  quantidade_transferida_total?: number | null
  quantidade_pronta_itens_pedido_total?: number | null
  saldo_itens_do_pedido?: number | null
  quantidade_cancelada_total_pedido?: number | null
  ncms_distintos_count?: number | null

  // Divergência de itens — pré-computado pelo backend na list view
  // Elimina a necessidade de carregar itens no state apenas para exibir badges
  ncm_divergente?: boolean | null
  ncm_valor_unico?: string | null
  referencia_importador_divergente?: boolean | null
  referencia_exportador_divergente?: boolean | null
  incoterm_divergente?: boolean | null
  condicao_pagamento_divergente?: boolean | null
  nome_exportador_divergente?: boolean | null
  nome_importador_divergente?: boolean | null
  nome_fabricante_divergente?: boolean | null
  referencia_fabricante_divergente?: boolean | null
  cobertura_cambial_divergente?: boolean | null
  cobertura_cambial_valor_unico?: string | null
  data_emissao_pedido_divergente?: boolean | null
  data_emissao_pedido_valor_unico?: string | null

  // Financeiro
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

  // Rastreabilidade de consolidação
  pedidos_origem_id?: string[] | null

  created_at: string
  updated_at: string
}

// ── Consolidação de Pedidos ───────────────────────────────────────────────────

export interface CampoDivergente {
  campo: string
  rotulo: string
  valores: { pedido_id: string; numero_pedido: string; valor: string | number | null }[]
  valor_sugerido: string | number | null
}

export interface ItemConsolidado {
  part_number: string
  descricao_item: string
  ncm: string
  unidade_comercializada_item: string | null
  moeda_item: string
  valor_por_unidade_item: number | null
  quantidade_total: number
  pedidos_origem: string[]
  pode_fundir: boolean
}

export interface ConsolidacaoPreview {
  ids: string[]
  campos_divergentes: CampoDivergente[]
  campos_iguais: string[]
  itens: ItemConsolidado[]
  valor_total_soma: number
  moeda: string
  numero_sugerido: string
  /** Sinaliza que os pedidos possuem tipos de operação diferentes (Onda C). */
  conflito_tipo_operacao?: boolean
}

export interface ConsolidacaoPayload {
  ids: string[]
  numero_pedido: string
  campos_escolhidos: Record<string, string | number | null>
  fundir_itens_mesmo_part_number: boolean
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
  /** Total de itens (PedidoItem.count) no banco para o filtro atual — independente de paginação */
  totalItens?: number
  hasMore: boolean
}

// ── Transferência de Pedidos ──────────────────────────────────────────────────

/** Operações primitivas que compõem todos os cenários de transferência */
export type OperacaoTransfer = 'reduzir' | 'alocar' | 'transformar'

/** Cenários disponíveis de transferência */
export type CenarioTransfer =
  | 'reducao_simples'
  | 'split_novo_pedido'
  | 'split_pedido_existente'
  | 'multi_split'
  | 'substituicao_pura'
  | 'split_substituicao'
  | 'split_data'
  | 'split_destino_logistico'
  | 'transfer_intercompany'
  | 'reversao'
  | 'agrupamento_inverso'

/** Destino de quantidade em uma operação de transferência */
export interface TransferDestino {
  tipo: 'novo' | 'existente' | 'mesmo'
  /** Preenchido quando tipo = 'existente' */
  pedido_id?: string
  quantidade: number
  /** Cenários 5a, 5b — substituição de produto */
  part_number?: string
  /** Cenário 6 — split por data */
  data_embarque?: string
  /** Cenário 7 — split por destino logístico */
  porto_destino?: string
  /** Cenário 8 — transfer intercompany */
  company_id?: string
}

/** Payload enviado ao backend para preview e confirmação */
export interface TransferPayload {
  cenario: CenarioTransfer
  /** Pedido de origem */
  pedido_id: string
  /** Item de origem */
  item_id: string
  /** Quantidade removida do pedido de origem */
  quantidade_origem: number
  /** Destinos (1 para cenários simples, N para multi-split) */
  destinos: TransferDestino[]
  /** Número do novo pedido, quando o cenário cria um pedido novo */
  numero_pedido_novo?: string
  /** Apenas para cenário 'reversao' */
  reverter_transfer_id?: string
}

/** Resposta do endpoint de preview — mostra impacto sem alterar o banco */
export interface TransferPreview {
  cenario: CenarioTransfer
  origem: {
    pedido_numero: string
    item_part_number: string
    quantidade_atual_pedido: number
    quantidade_apos: number
    encerra: boolean
  }
  destinos: {
    tipo: 'novo' | 'existente'
    pedido_numero?: string
    quantidade: number
    alertas: string[]
  }[]
  alertas_globais: string[]
  /** Sinaliza que o pedido destino é de tipo de operação diferente do pedido origem (Onda C). */
  aviso_tipo_operacao?: boolean
}

/** Resposta do endpoint de confirmação */
export interface TransferResultado {
  pedido_origem_id: string
  pedidos_destino_ids: string[]
  pedidos_criados: string[]
  /** IDs de itens excluídos quando qty chegou a zero (se config ativo) */
  itens_excluidos: string[]
  /** IDs de pedidos encerrados quando qty total chegou a zero (se config ativo) */
  pedidos_encerrados: string[]
}

/** Registro de histórico de uma transferência (para reversão) */
export interface TransferHistorico {
  id: string
  pedido_origem_id: string
  item_origem_id: string
  cenario: CenarioTransfer
  quantidade_item_transferida: number
  destinos: TransferDestino[]
  revertido: boolean
  created_at: string
  created_by: string
}

// ── Edição em Massa ───────────────────────────────────────────────────────────

/** Tipos de campo suportados para edição em massa */
export type TipoCampoEdicao = 'texto' | 'numero' | 'data' | 'select' | 'usuario'

/** Operação aplicada ao campo */
export type OperacaoCampo =
  | 'substituir'    // todos os tipos
  | 'somar'         // numero
  | 'subtrair'      // numero
  | 'percentual'    // numero (ex: +10% → ×1.1)
  | 'avancar_dias'  // data
  | 'recuar_dias'   // data

/** Um campo a ser editado em massa */
export interface CampoEdicaoMassa {
  campo: string               // key do campo (ex: 'incoterm', 'data_embarque')
  tipo: TipoCampoEdicao
  nivel: 'pedido' | 'item'
  operacao: OperacaoCampo
  valor: string | number      // novo valor ou delta (para somar/percentual/dias)
}

/** Payload enviado ao backend */
export interface EdicaoMassaPayload {
  pedido_ids: string[]
  campos: CampoEdicaoMassa[]
  nivel: 'pedido' | 'item' | 'combinado'
}

/** Resposta do preview */
export interface EdicaoMassaPreview {
  pedidos_afetados: number
  itens_afetados: number
  campos: {
    campo: string
    nivel: 'pedido' | 'item'
    operacao: OperacaoCampo
    valor: string | number
    multiplos_valores: boolean    // true se pedidos selecionados têm valores diferentes
    valores_distintos?: string[]  // lista de valores atuais distintos (para exibir no UI)
    alertas: string[]
  }[]
  alertas_globais: string[]
  /** Detalhamento por pedido — valor atual e novo valor para cada campo */
  por_pedido?: Array<{
    pedido_id: string
    numero_pedido: string
    alteracoes: Array<{
      campo: string
      valor_atual: string | number | null
      valor_novo: string | number
    }>
  }>
}

/** Resposta do confirmar */
export interface EdicaoMassaResultado {
  pedidos_atualizados: number
  itens_atualizados: number
  campos_alterados: string[]
  erros: { pedido_id: string; motivo: string }[]
}

/** Campos calculados do Pedido — nunca editáveis em massa */
export const CAMPOS_BLOQUEADOS_PEDIDO = new Set([
  'valor_total_pedido',
  'quantidade_total_pedido',
  'quantidade_transferida_total',
  'status',
  'id',
  'tenant_id',
  'product_id',
  'created_at',
  'updated_at',
  'deleted_at',
])

/** Campos calculados do PedidoItem — nunca editáveis em massa */
export const CAMPOS_BLOQUEADOS_ITEM = new Set([
  'valor_total_item',
  'quantidade_atual_pedido',
  'id',
  'tenant_id',
  'pedido_id',
  'created_at',
  'updated_at',
])

// ── Smart Import ──────────────────────────────────────────────────────────────

/** Resultado do mapeamento de uma coluna do arquivo para o campo do sistema */
export interface ColunaMapeada {
  coluna_arquivo: string
  campo_sistema: string | null
  confianca: number
  nivel: 'auto' | 'confirmado' | 'manual' | 'ignorado'
  inferido_por: 'ia' | 'dados' | 'memoria' | 'usuario'
  /** Primeiro valor real encontrado no arquivo para esta coluna */
  exemplo_valor?: string | null
}

/** Uma linha bruta do arquivo (para exibição do documento original) */
export interface SmartImportLinhaRaw {
  linha: number
  valores: Record<string, string>
}

/** Resultado completo do parse + mapeamento IA */
export interface SmartImportPreview {
  preview_id: string
  total_linhas: number
  total_pedidos: number
  total_itens: number
  mapeamento: ColunaMapeada[]
  confianca_global: number
  memoria_aplicada: boolean
  linhas: SmartImportLinha[]
  /** Linhas brutas do arquivo para exibição do documento original */
  dados_brutos?: SmartImportLinhaRaw[]
  /** Extrator utilizado: 'gemini' | 'pdf-parse' | 'xlsx' | 'csv' | 'json' | 'xml' | 'txt' */
  extrator_usado?: string
}

/** Uma linha do arquivo apos mapeamento e validacao */
export interface SmartImportLinha {
  linha_arquivo: number
  numero_pedido: string | null
  status: 'ok' | 'aviso' | 'erro'
  alertas: SmartImportAlerta[]
  dados: Record<string, unknown>
}

export interface SmartImportAlerta {
  campo: string
  tipo: 'obrigatorio_ausente' | 'formato_invalido' | 'valor_negativo' | 'duplicado_sistema' | 'duplicado_arquivo'
  mensagem: string
  nivel: 'aviso' | 'erro'
}

/** Decisao do usuario para pedidos duplicados */
export type DecisaoDuplicata = 'sobrescrever' | 'criar' | 'pular'

/** Payload enviado ao backend para confirmar a importacao */
export interface SmartImportConfirmar {
  preview_id: string
  mapeamento_confirmado: ColunaMapeada[]
  decisoes_duplicatas: Record<string, DecisaoDuplicata>
  linhas_incluidas: number[]
  salvar_mapeamento: boolean
  /** Números de pedido editados pelo usuário: linha_arquivo → numero_pedido */
  numeros_editados?: Record<number, string>
  /** Fallback stateless: linhas do preview quando o cache do servidor expirar */
  linhas?: SmartImportLinha[]
}

/** Resultado retornado apos a importacao confirmada */
export interface SmartImportResultado {
  criados: number
  atualizados: number
  pulados: number
  erros: { linha: number; motivo: string }[]
  ids_criados: string[]
}

// ── Duplicar Pedidos ──────────────────────────────────────────────────────────

export interface DuplicarPayload {
  ids: string[]
  numeros?: Record<string, string>
}

export interface DuplicarItemPayload {
  pedido_id: string
  item_ids: string[]
}

export interface DuplicarResultado {
  criados: { original_id: string; novo_id: string; numero_pedido: string }[]
  erros: { id: string; motivo: string }[]
}

// ── Excluir Pedidos ───────────────────────────────────────────────────────────

export interface ExcluirPreview {
  permitidos: { id: string; numero_pedido: string; total_itens: number }[]
  bloqueados: { id: string; numero_pedido: string; status: string; motivo: string }[]
}

export interface ExcluirResultado {
  excluidos: number
  itens_excluidos: number
  pedidos_excluidos_por_sem_item: number
}

// ── Helpers de formatacao ─────────────────────────────────────────────────────

// ── Anexos ────────────────────────────────────────────────────────────────────

export interface Anexo {
  id: string
  tenant_id: string
  vinculo: 'pedido' | 'item'
  vinculo_id: string
  nome_arquivo: string
  tipo_arquivo: string          // MIME type
  tamanho_bytes: number
  descricao?: string
  categoria?: string
  storage_key: string           // path interno no storage
  uploaded_by: string
  uploaded_at: string
}

export interface AnexoUploadResultado {
  id: string
  nome_arquivo: string
  tamanho_bytes: number
  url_download: string
}

// ── PDF ───────────────────────────────────────────────────────────────────────

export interface TemplatePdf {
  id_template_pedido_pdf: string
  id_organizacao: string
  nome_template_pedido_pdf: string
  descricao_template_pedido_pdf?: string
  conteudo_html_template_pedido_pdf: string   // HTML com variáveis Handlebars
  data_criacao_template_pedido_pdf: string
  data_atualizacao_template_pedido_pdf: string
}

export interface GerarPdfPayload {
  pedido_id: string
  template_id: string
  salvar_como_anexo: boolean
}

export interface GerarPdfResultado {
  url_download: string
  anexo_id: string              // ID do anexo salvo
  is_pdf?: boolean              // false = fallback HTML (sem Puppeteer)
}

// ── Gerar Documento (multilíngue) ────────────────────────────────────────────

export type TipoDocumentoGerar = 'pedido_de_venda' | 'proforma_invoice' | 'invoice'
export type IdiomaDocumento = 'pt' | 'en' | 'es' | 'zh' | 'ja' | 'ar'

export interface GerarDocumentoPayload {
  pedido_id: string
  tipo_documento: TipoDocumentoGerar
  idioma: IdiomaDocumento
  salvar_como_anexo: boolean
}

// ── Colunas do Usuário ────────────────────────────────────────────────────────

export type TipoColunaUsuario =
  | 'texto'
  | 'numero'
  | 'data'
  | 'select'
  | 'checkbox'
  | 'percentual'
  | 'tipo_documento'
  | 'formula'

export type EscopoColunaUsuario = 'pedido' | 'item' | 'ambos'
export type VisibilidadeColunaUsuario = 'todos' | 'roles' | 'privado'

export interface ColunaUsuario {
  id: string
  tenant_id: string
  nome: string
  chave: string
  tipo: TipoColunaUsuario
  escopo: EscopoColunaUsuario
  visibilidade: VisibilidadeColunaUsuario
  roles_permitidas?: string[]
  obrigatorio: boolean
  opcoes?: string[]
  descricao?: string
  valor_padrao?: string
  /** Expressão da fórmula (ex: "quantidade_inicial_pedido - quantidade_transferida_item"). Presente quando tipo === 'formula'. */
  formula_expressao?: string
  /** Chaves de colunas das quais esta fórmula depende. Populado pelo engine ao salvar. */
  formula_dependencias?: string[]
  ordem: number
  ativo: boolean
  created_by: string
  created_at: string
}

export interface ValorColunaUsuario {
  id: string
  tenant_id: string
  coluna_id: string
  vinculo: 'pedido' | 'item'
  vinculo_id: string
  valor: string
}

// ── Helpers de formatacao ─────────────────────────────────────────────────────

export function fmtQuantidade(valor: number, casas: number = 2): string {
  return valor.toLocaleString('pt-BR', {
    minimumFractionDigits: casas,
    maximumFractionDigits: casas,
  })
}

// fmtData delega para formatarData() que lê o formato configurado pelo tenant.
// formatarData lê uma variável de módulo singleton — sem re-render, sem overhead.
export { formatarData as fmtData } from './useFormatoData'

export function fmtMoeda(valor: number, moeda: string = 'BRL'): string {
  return valor.toLocaleString('pt-BR', {
    style: 'currency',
    currency: moeda || 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

// ── Kanban Preferências ───────────────────────────────────────────────────────

export interface KanbanCampoConfig {
  campo:   string
  label:   string
  visivel: boolean
  ordem:   number
}

export interface KanbanAbaConfig {
  aba:    'pedido' | 'quantidades' | 'datas'
  campos: KanbanCampoConfig[]
}

export interface KanbanCardCampo {
  campo:   string
  label:   string
  visivel: boolean
  grupo?:  'parceiro' | 'pedido' | 'documentos' | 'progresso'
}

export interface KanbanCardConfig {
  campos:       KanbanCardCampo[]
  dataCritica:  string | null
}

export interface KanbanPreferencias {
  abas:             KanbanAbaConfig[]
  card:             KanbanCardConfig
  colunas_ocultas?: string[]
}

export interface KanbanCampoDisponivel {
  campo:      string
  label:      string
  categoria:  'pedido' | 'quantidades' | 'datas'
}

export const KANBAN_LIMITES: Record<string, number> = {
  pedido:      10,
  quantidades: 6,
  datas:       8,
}

export const KANBAN_CARD_CAMPOS_DISPONIVEIS: KanbanCardCampo[] = [
  { campo: 'nome_exportador',     label: 'Exportador',    visivel: true,  grupo: 'parceiro'   },
  { campo: 'nome_importador',     label: 'Importador',    visivel: false, grupo: 'parceiro'   },
  { campo: 'valor_total_pedido',  label: 'Valor Total',   visivel: true,  grupo: 'pedido'     },
  { campo: 'incoterm',            label: 'Incoterm',      visivel: true,  grupo: 'pedido'     },
  { campo: 'numero_itens_pedido', label: 'Nº de Itens',   visivel: false, grupo: 'pedido'     },
  { campo: 'numero_invoice',      label: 'Nº Invoice',    visivel: false, grupo: 'documentos' },
  { campo: 'numero_proforma',     label: 'Nº Proforma',   visivel: false, grupo: 'documentos' },
  { campo: 'saldo_bar',           label: 'Saldo (barra)', visivel: true,  grupo: 'progresso'  },
  { campo: 'status',              label: 'Status',        visivel: false, grupo: 'progresso'  },
]

export const KANBAN_CARD_GRUPOS: { key: 'parceiro' | 'pedido' | 'documentos' | 'progresso'; label: string }[] = [
  { key: 'parceiro',   label: 'Parceiro'        },
  { key: 'pedido',     label: 'Pedido'          },
  { key: 'documentos', label: 'Documentos'      },
  { key: 'progresso',  label: 'Status e Progresso' },
]

// Campos padrão quando usuário não configurou nada
export const KANBAN_PADRAO: KanbanPreferencias = {
  card: {
    campos: KANBAN_CARD_CAMPOS_DISPONIVEIS.map(c => ({ ...c })),
    dataCritica: 'data_prevista_coleta_pedido',
  },
  abas: [
    {
      aba: 'pedido',
      campos: [
        { campo: 'numero_pedido',       label: 'Nº Pedido',            visivel: true, ordem: 0 },
        { campo: 'tipo_operacao',       label: 'Tipo de Operação',     visivel: true, ordem: 1 },
        { campo: 'nome_exportador',     label: 'Exportador',           visivel: true, ordem: 2 },
        { campo: 'valor_total_pedido',  label: 'Valor Total',          visivel: true, ordem: 3 },
        { campo: 'moeda_pedido',        label: 'Moeda',                visivel: true, ordem: 4 },
        { campo: 'incoterm',            label: 'Incoterm',             visivel: true, ordem: 5 },
        { campo: 'numero_invoice',      label: 'Nº Invoice',           visivel: true, ordem: 6 },
        { campo: 'numero_proforma',     label: 'Nº Proforma',          visivel: true, ordem: 7 },
      ],
    },
    {
      aba: 'quantidades',
      campos: [
        { campo: 'quantidade_total_pedido',      label: 'Qtd. Inicial',      visivel: true, ordem: 0 },
        { campo: 'quantidade_pronta_itens_pedido_total', label: 'Qtd. Pronta',       visivel: true, ordem: 1 },
        { campo: 'quantidade_transferida_total',         label: 'Qtd. Transferida',  visivel: true, ordem: 2 },
        { campo: 'quantidade_cancelada_total_pedido',    label: 'Qtd. Cancelada',    visivel: true, ordem: 3 },
        { campo: 'saldo_itens_do_pedido',                label: 'Saldo',             visivel: true, ordem: 4 },
      ],
    },
    {
      aba: 'datas',
      campos: [
        { campo: 'data_emissao_pedido',             label: 'Data P.O.',           visivel: true, ordem: 0 },
        { campo: 'data_prevista_coleta_pedido',     label: 'Prev. Coleta',        visivel: true, ordem: 1 },
        { campo: 'data_confirmada_coleta_pedido',   label: 'Conf. Coleta',        visivel: true, ordem: 2 },
        { campo: 'data_prevista_pedido_pronto',     label: 'Prev. Pronto',        visivel: true, ordem: 3 },
        { campo: 'data_confirmada_pedido_pronto',   label: 'Conf. Pronto',        visivel: true, ordem: 4 },
        { campo: 'data_prevista_inspecao_pedido',   label: 'Prev. Inspeção',      visivel: true, ordem: 5 },
      ],
    },
  ],
}

// Todos os campos disponíveis para configurar nas abas
export const KANBAN_CAMPOS_DISPONIVEIS: KanbanCampoDisponivel[] = [
  // Aba Pedido
  { campo: 'numero_pedido',           label: 'Nº Pedido',                categoria: 'pedido'      },
  { campo: 'tipo_operacao',           label: 'Tipo de Operação',         categoria: 'pedido'      },
  { campo: 'nome_exportador',         label: 'Exportador',               categoria: 'pedido'      },
  { campo: 'nome_importador',         label: 'Importador',               categoria: 'pedido'      },
  { campo: 'valor_total_pedido',      label: 'Valor Total',              categoria: 'pedido'      },
  { campo: 'moeda_pedido',            label: 'Moeda',                    categoria: 'pedido'      },
  { campo: 'incoterm',                label: 'Incoterm',                 categoria: 'pedido'      },
  { campo: 'numero_invoice',          label: 'Nº Invoice',               categoria: 'pedido'      },
  { campo: 'numero_proforma',         label: 'Nº Proforma',              categoria: 'pedido'      },
  { campo: 'referencia_exportador',   label: 'Ref. Exportador',          categoria: 'pedido'      },
  { campo: 'referencia_importador',   label: 'Ref. Importador',          categoria: 'pedido'      },
  { campo: 'condicao_pagamento', label: 'Cond. Pagamento',        categoria: 'pedido'      },
  { campo: 'cobertura_cambial',        label: 'Cobertura Cambial',       categoria: 'pedido'      },
  { campo: 'peso_liquido_total_pedido', label: 'Peso Líquido',           categoria: 'pedido'      },
  { campo: 'peso_bruto_total_pedido', label: 'Peso Bruto',               categoria: 'pedido'      },
  // Aba Quantidades
  { campo: 'quantidade_total_pedido',      label: 'Qtd. Inicial',      categoria: 'quantidades' },
  { campo: 'quantidade_pronta_itens_pedido_total', label: 'Qtd. Pronta',       categoria: 'quantidades' },
  { campo: 'quantidade_transferida_total',         label: 'Qtd. Transferida',  categoria: 'quantidades' },
  { campo: 'quantidade_cancelada_total_pedido',    label: 'Qtd. Cancelada',    categoria: 'quantidades' },
  { campo: 'saldo_itens_do_pedido',                label: 'Saldo',             categoria: 'quantidades' },
  { campo: 'unidade_comercializada_pedido',        label: 'Unidade',           categoria: 'quantidades' },
  // Aba Datas
  { campo: 'data_emissao_pedido',                  label: 'Data P.O.',                  categoria: 'datas' },
  { campo: 'data_prevista_coleta_pedido',          label: 'Prev. Coleta',              categoria: 'datas' },
  { campo: 'data_confirmada_coleta_pedido',        label: 'Conf. Coleta',              categoria: 'datas' },
  { campo: 'data_meta_coleta_pedido',              label: 'Meta Coleta',               categoria: 'datas' },
  { campo: 'data_prevista_pedido_pronto',          label: 'Prev. Pronto',              categoria: 'datas' },
  { campo: 'data_confirmada_pedido_pronto',        label: 'Conf. Pronto',              categoria: 'datas' },
  { campo: 'data_meta_pedido_pronto',              label: 'Meta Pronto',               categoria: 'datas' },
  { campo: 'data_prevista_inspecao_pedido',        label: 'Prev. Inspeção',            categoria: 'datas' },
  { campo: 'data_confirmada_inspecao_pedido',      label: 'Conf. Inspeção',            categoria: 'datas' },
  { campo: 'data_meta_inspecao_pedido',            label: 'Meta Inspeção',             categoria: 'datas' },
  { campo: 'data_consolidacao_pedido',             label: 'Data Consolidação',         categoria: 'datas' },
]

// ── Snapshot — Política de Atualização (pedido_snapshot_atualizacao) ─────────

/**
 * Política por workspace de quando re-snapshotar dados do Cadastros nos pedidos.
 * Backend: tabela pedido_snapshot_atualizacao (model PedidoSnapshotAtualizacao).
 * Contrato JSON usa chaves curtas; backend converte para colunas Prisma DDD.
 */
export interface SnapshotAtualizacaoPolicy {
  atualiza_importador:  boolean
  atualiza_exportador:  boolean
  atualiza_fabricante:  boolean
  atualiza_agente:      boolean
  atualiza_despachante: boolean
  atualiza_armador:     boolean
  atualiza_ope:         boolean
  gatilho_emissao:      boolean
  gatilho_embarque:     boolean
  gatilho_desembaraco:  boolean
}
