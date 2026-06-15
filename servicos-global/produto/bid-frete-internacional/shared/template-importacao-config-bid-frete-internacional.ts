import type { CampoImportacaoBidFreteInternacional } from './tipos-importacao-bid-frete-internacional'

/** Listas dinâmicas (Cadastros) — aba oculta `_Listas`, paridade Pedido. Valores = rótulo `SIGLA — Nome`. */
export interface ListasCadastrosTemplateBid {
  portos: readonly string[]
  aeroportos: readonly string[]
  paises: readonly string[]
  containers: readonly string[]
  moedas: readonly string[]
}

export type ChaveListaCadastrosTemplateBid = keyof ListasCadastrosTemplateBid

export type ConfigSelectTemplateBid =
  | { tipo: 'inline'; opcoes: readonly string[] }
  | { tipo: 'lista'; chave: ChaveListaCadastrosTemplateBid }

/** Rótulos humanos — paridade OPERACAO_LABELS / MODAL_LABELS / STATUS_LABELS (lista). */
export const MAPAS_ROTULO_ENUM_IMPORTACAO_BID: Partial<
  Record<CampoImportacaoBidFreteInternacional, Readonly<Record<string, string>>>
> = {
  tipo_operacao_cotacao_bid_frete_internacional: {
    IMPORTACAO: 'Importação',
    EXPORTACAO: 'Exportação',
  },
  modal_cotacao_bid_frete_internacional: {
    MARITIMO: 'Marítimo',
    AEREO: 'Aéreo',
    RODOVIARIO: 'Rodoviário',
  },
  modalidade_cotacao_bid_frete_internacional: {
    FCL: 'FCL',
    LCL: 'LCL',
    AEREO_GERAL: 'Aéreo Geral',
    RODOVIARIO_FTL: 'FTL',
    RODOVIARIO_LTL: 'LTL',
  },
  status_cotacao_bid_frete_internacional: {
    RASCUNHO: 'Rascunho',
    ENVIADA_FORNECEDORES: 'Enviada ao fornecedor',
    EM_COTACAO: 'Em cotação',
    AGUARDANDO_APROVACAO: 'Aprovação pendente',
    APROVADA: 'Aprovada',
    REPROVADA: 'Reprovada',
    CANCELADA: 'Cancelada',
    FALTA_INFORMACAO: 'Falta de informação',
    EXPIRADA: 'Expirada',
  },
  visibilidade_cotacao_bid_frete_internacional: {
    DIRECIONADA: 'Direcionada',
    ABERTA: 'Aberta',
  },
}

export const CAMPOS_CADASTRO_IMPORTACAO_BID: ReadonlySet<CampoImportacaoBidFreteInternacional> = new Set([
  'porto_origem_cotacao_bid_frete_internacional',
  'porto_destino_cotacao_bid_frete_internacional',
  'aeroporto_origem_cotacao_bid_frete_internacional',
  'aeroporto_destino_cotacao_bid_frete_internacional',
  'origem_pais_cotacao_bid_frete_internacional',
  'destino_pais_cotacao_bid_frete_internacional',
  'tipo_container_cotacao_bid_frete_internacional',
])

/** Moedas padrão da lista (moeda_meta). */
export const MOEDAS_PADRAO_TEMPLATE_BID = ['USD', 'EUR', 'BRL', 'GBP', 'CNY'] as const

function opcoesRotuloEnum(
  mapa: Readonly<Record<string, string>>,
): readonly string[] {
  return Object.values(mapa)
}

/** Opções inline — rótulos legíveis (não siglas cruas). */
export function opcoesInlineRotuloTemplateBid(
  campo: CampoImportacaoBidFreteInternacional,
): readonly string[] {
  const mapa = MAPAS_ROTULO_ENUM_IMPORTACAO_BID[campo]
  if (mapa) return opcoesRotuloEnum(mapa)

  if (campo === 'incoterm_cotacao_bid_frete_internacional') {
    return ['EXW', 'FCA', 'CPT', 'CIP', 'DAP', 'DPU', 'DDP', 'FAS', 'FOB', 'CFR', 'CIF']
  }
  if (campo === 'anonima_cotacao_bid_frete_internacional') {
    return ['Sim', 'Nao']
  }
  if (campo === 'moeda_meta_cotacao_bid_frete_internacional') {
    return [...MOEDAS_PADRAO_TEMPLATE_BID]
  }

  return []
}

function selectInlineTemplateBid(
  campo: CampoImportacaoBidFreteInternacional,
): ConfigSelectTemplateBid {
  return { tipo: 'inline', opcoes: opcoesInlineRotuloTemplateBid(campo) }
}

/** Select por campo — espelha selects editáveis da lista. */
export const SELECT_TEMPLATE_BID: Partial<Record<CampoImportacaoBidFreteInternacional, ConfigSelectTemplateBid>> = {
  tipo_operacao_cotacao_bid_frete_internacional: selectInlineTemplateBid('tipo_operacao_cotacao_bid_frete_internacional'),
  status_cotacao_bid_frete_internacional: selectInlineTemplateBid('status_cotacao_bid_frete_internacional'),
  modal_cotacao_bid_frete_internacional: selectInlineTemplateBid('modal_cotacao_bid_frete_internacional'),
  modalidade_cotacao_bid_frete_internacional: selectInlineTemplateBid('modalidade_cotacao_bid_frete_internacional'),
  porto_origem_cotacao_bid_frete_internacional: { tipo: 'lista', chave: 'portos' },
  aeroporto_origem_cotacao_bid_frete_internacional: { tipo: 'lista', chave: 'aeroportos' },
  origem_pais_cotacao_bid_frete_internacional: { tipo: 'lista', chave: 'paises' },
  porto_destino_cotacao_bid_frete_internacional: { tipo: 'lista', chave: 'portos' },
  aeroporto_destino_cotacao_bid_frete_internacional: { tipo: 'lista', chave: 'aeroportos' },
  destino_pais_cotacao_bid_frete_internacional: { tipo: 'lista', chave: 'paises' },
  tipo_container_cotacao_bid_frete_internacional: { tipo: 'lista', chave: 'containers' },
  incoterm_cotacao_bid_frete_internacional: selectInlineTemplateBid('incoterm_cotacao_bid_frete_internacional'),
  moeda_meta_cotacao_bid_frete_internacional: { tipo: 'lista', chave: 'moedas' },
  visibilidade_cotacao_bid_frete_internacional: selectInlineTemplateBid('visibilidade_cotacao_bid_frete_internacional'),
  anonima_cotacao_bid_frete_internacional: selectInlineTemplateBid('anonima_cotacao_bid_frete_internacional'),
}

/** numFmt por coluna — paridade FORMATO_EXCEL_POR_TIPO do Pedido. */
export const FORMATO_EXCEL_CAMPO_BID: Partial<Record<CampoImportacaoBidFreteInternacional, string>> = {
  quantidade_volume_cotacao_bid_frete_internacional: '#,##0',
  peso_kg_cotacao_bid_frete_internacional: '#,##0.00',
  cubagem_m3_cotacao_bid_frete_internacional: '#,##0.000',
  valor_meta_cotacao_bid_frete_internacional: '#,##0.00',
  ncm_cotacao_bid_frete_internacional: '0000"."00"."00',
  data_limite_resposta_cotacao_bid_frete_internacional: 'dd/mm/yyyy',
  data_aprovacao_cotacao_bid_frete_internacional: 'dd/mm/yyyy',
  data_cancelamento_cotacao_bid_frete_internacional: 'dd/mm/yyyy',
}

export function listasCadastrosPadraoTemplateBid(): ListasCadastrosTemplateBid {
  return {
    portos: [],
    aeroportos: [],
    paises: [],
    containers: [],
    moedas: [...MOEDAS_PADRAO_TEMPLATE_BID],
  }
}
