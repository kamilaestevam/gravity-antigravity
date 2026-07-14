import {
  CAMPOS_BLOQUEADOS_ITEM,
  CAMPOS_BLOQUEADOS_PEDIDO,
} from '../../../../servicos-global/produto/pedido/shared/camposEdicaoMassa'
import { COLUNAS_LISTA_SIMULADOR_PEDIDO } from './colunas-lista-simulador-pedido'
import type { LinhaListaPedidoSimulador } from './dados-lista-simulador-pedido'

export type TipoCampoEdicaoMassaSimulador = 'texto' | 'select' | 'numero' | 'data' | 'ncm'
export type OperacaoCampoMassaSimulador =
  | 'substituir'
  | 'somar'
  | 'subtrair'
  | 'percentual'
  | 'avancar_dias'
  | 'recuar_dias'
export type NivelEdicaoMassaSimulador = 'pedido' | 'item' | 'combinado'

export type DefinicaoCampoEdicaoMassaSimulador = {
  campo: string
  rotulo: string
  tipo: TipoCampoEdicaoMassaSimulador
  nivel: 'pedido' | 'item'
  grupo: string
  opcoes?: { valor: string; rotulo: string }[]
  visivel?: (pedidos: LinhaListaPedidoSimulador[]) => boolean
}

export const OPERACOES_POR_TIPO_MASSA_SIMULADOR: Record<
  TipoCampoEdicaoMassaSimulador,
  OperacaoCampoMassaSimulador[]
> = {
  texto: ['substituir'],
  select: ['substituir'],
  ncm: ['substituir'],
  numero: ['substituir', 'somar', 'subtrair', 'percentual'],
  data: ['substituir', 'avancar_dias', 'recuar_dias'],
}

export const ROTULOS_OPERACAO_MASSA_SIMULADOR: Record<OperacaoCampoMassaSimulador, string> = {
  substituir: 'Substituir',
  somar: 'Somar',
  subtrair: 'Subtrair',
  percentual: 'Percentual (%)',
  avancar_dias: 'Avançar dias',
  recuar_dias: 'Recuar dias',
}

export const ROTULOS_OPERACAO_RESUMO_MASSA_SIMULADOR: Record<OperacaoCampoMassaSimulador, string> = {
  substituir: 'Novo valor',
  somar: 'Somar',
  subtrair: 'Subtrair',
  percentual: 'Aplicar %',
  avancar_dias: 'Avançar',
  recuar_dias: 'Recuar',
}

const CAMPOS_BLOQUEADOS_EXTRA_SIMULADOR = new Set([
  'numero_pedido',
  'quantidade_pronta_itens_pedido_total',
  'saldo_itens_do_pedido',
  'quantidade_transferida_total',
  'quantidade_cancelada_total_pedido',
  'data_consolidacao_pedido',
  'ids_origem_consolidacao_pedido',
])

const CAMPOS_SOMENTE_ITEM = new Set([
  'descricao_item',
  'ncm',
  'valor_por_unidade_item',
  'part_number_item',
])

const STATUS_OPCOES = [
  { valor: 'RASCUNHO', rotulo: 'Rascunho' },
  { valor: 'ABERTO', rotulo: 'Aberto' },
  { valor: 'EM ANDAMENTO', rotulo: 'Em Andamento' },
  { valor: 'TRANSFERIDO', rotulo: 'Transferido' },
  { valor: 'CONSOLIDADO', rotulo: 'Consolidado' },
]

const TIPO_OPERACAO_OPCOES = [
  { valor: 'IMPORTAÇÃO', rotulo: 'Importação' },
  { valor: 'EXPORTAÇÃO', rotulo: 'Exportação' },
]

const INCOTERM_OPCOES = ['EXW', 'FCA', 'CPT', 'CIP', 'DAP', 'DPU', 'DDP', 'FAS', 'FOB', 'CFR', 'CIF'].map((v) => ({
  valor: v,
  rotulo: v,
}))

const MOEDA_OPCOES = ['USD', 'EUR', 'BRL', 'GBP', 'CNY'].map((v) => ({ valor: v, rotulo: v }))

const WORKSPACE_OPCOES = [
  'FILIAL SC',
  'MATRIZ SP',
  'FILIAL PR',
  'IMPORTADOR LTDA',
  'EXPORTADOR LTDA',
].map((v) => ({ valor: v, rotulo: v }))

const PORTO_OPCOES = [
  'SHENZHEN', 'YOKOHAMA', 'HAMBURG', 'ROTTERDAM', 'SANTOS', 'PARANAGUÁ', 'GENOVA', 'LONDON',
].map((v) => ({ valor: v, rotulo: v }))

const PAIS_OPCOES = [
  'BRASIL', 'CHINA', 'ALEMANHA', 'EUA', 'JAPÃO', 'FRANÇA', 'ITÁLIA', 'HOLANDA',
].map((v) => ({ valor: v, rotulo: v }))

const AEROPORTO_OPCOES = ['GRU', 'VCP', 'MIA', 'FRA', 'PVG', 'NRT', 'LHR'].map((v) => ({
  valor: v,
  rotulo: v,
}))

const UNIDADE_OPCOES = ['UN', 'KG', 'MT', 'PAR'].map((v) => ({ valor: v, rotulo: v }))

const VOLUME_OPCOES = ['CAIXA', 'PALLET', 'CONTAINER', 'SACO'].map((v) => ({ valor: v, rotulo: v }))

const COBERTURA_OPCOES = ['ACC', 'ACE', 'ACD'].map((v) => ({ valor: v, rotulo: v }))

const OPCOES_COLUNA_USUARIO: Record<string, { valor: string; rotulo: string }[]> = {
  'coluna_usuario:prioridade_embarque': [
    { valor: 'Alta', rotulo: 'Alta' },
    { valor: 'Média', rotulo: 'Média' },
    { valor: 'Baixa', rotulo: 'Baixa' },
  ],
  'coluna_usuario:inspecao_obrigatoria': [
    { valor: 'Sim', rotulo: '✓ Sim' },
    { valor: 'Não', rotulo: '✗ Não' },
  ],
  'coluna_usuario:tag_risco': [
    { valor: 'Baixo', rotulo: 'Baixo' },
    { valor: 'Médio', rotulo: 'Médio' },
    { valor: 'Alto', rotulo: 'Alto' },
  ],
}

function campoBloqueado(campo: string): boolean {
  return (
    CAMPOS_BLOQUEADOS_PEDIDO.has(campo) ||
    CAMPOS_BLOQUEADOS_ITEM.has(campo) ||
    CAMPOS_BLOQUEADOS_EXTRA_SIMULADOR.has(campo)
  )
}

function inferirGrupo(campo: string): string {
  if (campo.startsWith('coluna_usuario:')) return 'Personalizadas'
  if (campo.startsWith('data_')) return 'Datas'
  if (['status', 'tipo_operacao', 'id_workspace', 'referencia_importador', 'referencia_exportador'].includes(campo)) {
    return 'Identificação'
  }
  if (campo.includes('exportador') || campo.includes('importador')) return 'Exportador / Importador'
  if (campo.includes('fabricante')) return 'Fabricante'
  if (campo.includes('ope') || campo === 'cnpj_raiz_empresa_responsavel') return 'OPE'
  if (['incoterm', 'moeda_pedido', 'moeda_cambio_pedido', 'cobertura_cambial', 'condicao_pagamento', 'condicao_pagamento_siscomex', 'taxa_cambio_estimada', 'valor_total_cambio_pedido', 'contrato_cambio_id_pedido'].includes(campo)) {
    return 'Comercial'
  }
  if (['porto_', 'aeroporto_', 'local_de_'].some((p) => campo.startsWith(p))) return 'Logística'
  if (['descricao_item', 'ncm', 'part_number_item', 'valor_por_unidade_item'].includes(campo)) return 'Produto'
  if (['unidade_comercializada_pedido', 'tipo_volume_pedido', 'quantidade_volumes_pedido', 'peso_', 'cubagem_'].some((p) => campo.includes(p))) {
    return 'Físico'
  }
  if (campo.startsWith('anexo_') || campo.startsWith('numero_')) return 'Documentos'
  return 'Detalhes'
}

function inferirTipo(campo: string): TipoCampoEdicaoMassaSimulador {
  if (campo === 'ncm') return 'ncm'
  if (campo.startsWith('data_')) return 'data'
  if (
    campo === 'status' ||
    campo === 'tipo_operacao' ||
    campo === 'id_workspace' ||
    campo === 'incoterm' ||
    campo === 'moeda_pedido' ||
    campo === 'moeda_cambio_pedido' ||
    campo === 'cobertura_cambial' ||
    campo === 'condicao_pagamento_siscomex' ||
    campo.startsWith('porto_') ||
    campo.startsWith('aeroporto_') ||
    campo.startsWith('local_de_') ||
    campo === 'unidade_comercializada_pedido' ||
    campo === 'tipo_volume_pedido' ||
    campo === 'pais_exportador' ||
    campo === 'pais_fabricante' ||
    campo === 'pais_ope' ||
    campo in OPCOES_COLUNA_USUARIO
  ) {
    return 'select'
  }
  if (
    campo.startsWith('coluna_usuario:') &&
    ['sla_dias', 'score_fornecedor', 'frete_estimado', 'margem_prevista'].some((s) => campo.includes(s))
  ) {
    return 'numero'
  }
  if (campo.includes('quantidade_') || campo.includes('casas_decimais_') || campo === 'taxa_cambio_estimada') {
    return 'numero'
  }
  return 'texto'
}

function inferirOpcoes(campo: string): { valor: string; rotulo: string }[] | undefined {
  if (campo === 'status') return STATUS_OPCOES
  if (campo === 'tipo_operacao') return TIPO_OPERACAO_OPCOES
  if (campo === 'incoterm') return INCOTERM_OPCOES
  if (campo === 'id_workspace') return WORKSPACE_OPCOES
  if (campo === 'moeda_pedido' || campo === 'moeda_cambio_pedido') return MOEDA_OPCOES
  if (campo.startsWith('porto_')) return PORTO_OPCOES
  if (campo.startsWith('local_de_') || campo === 'pais_exportador' || campo === 'pais_fabricante' || campo === 'pais_ope') {
    return PAIS_OPCOES
  }
  if (campo.startsWith('aeroporto_')) return AEROPORTO_OPCOES
  if (campo === 'unidade_comercializada_pedido') return UNIDADE_OPCOES
  if (campo === 'tipo_volume_pedido') return VOLUME_OPCOES
  if (campo === 'cobertura_cambial') return COBERTURA_OPCOES
  return OPCOES_COLUNA_USUARIO[campo]
}

function inferirNivel(campo: string): 'pedido' | 'item' {
  return CAMPOS_SOMENTE_ITEM.has(campo) ? 'item' : 'pedido'
}

function criarDefinicao(
  campo: string,
  rotulo: string,
): DefinicaoCampoEdicaoMassaSimulador | null {
  if (campoBloqueado(campo)) return null
  const def: DefinicaoCampoEdicaoMassaSimulador = {
    campo,
    rotulo,
    tipo: inferirTipo(campo),
    nivel: inferirNivel(campo),
    grupo: inferirGrupo(campo),
    opcoes: inferirOpcoes(campo),
  }
  if (campo === 'nome_exportador') {
    def.visivel = (pedidos) => pedidos.every((p) => p.tipoOperacao === 'IMPORTAÇÃO')
  }
  if (campo === 'nome_importador') {
    def.visivel = (pedidos) => pedidos.every((p) => p.tipoOperacao === 'EXPORTAÇÃO')
  }
  return def
}

/** Catálogo derivado das colunas do simulador — mesma regra do produto real (lista → massa). */
export const DEFINICOES_CAMPOS_EDICAO_MASSA_SIMULADOR: DefinicaoCampoEdicaoMassaSimulador[] =
  COLUNAS_LISTA_SIMULADOR_PEDIDO
    .map((col) => criarDefinicao(col.id, col.label))
    .filter((d): d is DefinicaoCampoEdicaoMassaSimulador => d != null)

export function camposEdicaoMassaParaNivelSimulador(
  nivel: NivelEdicaoMassaSimulador,
  pedidos: LinhaListaPedidoSimulador[],
): DefinicaoCampoEdicaoMassaSimulador[] {
  const filtrarVisivel = (lista: DefinicaoCampoEdicaoMassaSimulador[]) =>
    lista.filter((d) => !d.visivel || d.visivel(pedidos))

  if (nivel === 'pedido') {
    return filtrarVisivel(DEFINICOES_CAMPOS_EDICAO_MASSA_SIMULADOR.filter((d) => d.nivel === 'pedido'))
  }
  if (nivel === 'item') {
    return filtrarVisivel(DEFINICOES_CAMPOS_EDICAO_MASSA_SIMULADOR.filter((d) => d.nivel === 'item'))
  }
  return filtrarVisivel(DEFINICOES_CAMPOS_EDICAO_MASSA_SIMULADOR)
}

export function formataNcmSimulador(raw: string): string {
  const d = raw.replace(/\D/g, '').slice(0, 8)
  if (d.length <= 4) return d
  if (d.length <= 6) return `${d.slice(0, 4)}.${d.slice(4)}`
  return `${d.slice(0, 4)}.${d.slice(4, 6)}.${d.slice(6)}`
}
