/**
 * processoListaColunasConfig — colunas padrão, editáveis e export (paridade Pedido).
 */
import i18next from 'i18next'
import type { GTColuna } from '@nucleo/tabela-virtual-global'
import type { Pedido } from './pedidoTypes'
import { buildColunasAvo } from '../../components/lista/ColunasAvo'
import { buildColunasPai } from '../../components/lista/ColunasPai'
import { CAMPOS_LOGISTICA_PEDIDO } from './camposLogisticaPedido'
import type { ColunasExport } from './exportUtils'

const COLUNAS_PAI: GTColuna<Pedido>[] = buildColunasPai(
  i18next.t.bind(i18next),
  { unidadesPeso: [], unidadesCubagem: [], mapaFatorParaKg: {} },
)

export const COLUNAS_PAI_CHAVES: string[] = COLUNAS_PAI.map(c => c.key as string)

export const CHAVES_COLUNAS_AVO: string[] = buildColunasAvo(i18next.t.bind(i18next))
  .map(c => c.key as string)

export const CAMPOS_DERIVADOS_PAI = new Set([
  'valor_total_pedido',
  'quantidade_total_pedido',
  'quantidade_pronta_itens_pedido_total',
  'saldo_itens_do_pedido',
  'quantidade_transferida_total',
  'quantidade_cancelada_total_pedido',
  'peso_liquido_total_pedido',
  'peso_bruto_total_pedido',
  'cubagem_total_pedido',
])

export const CAMPOS_EDITAVEIS_PEDIDO: string[] = COLUNAS_PAI
  .filter(c => !CAMPOS_DERIVADOS_PAI.has(c.key as string) && c.editavel !== false)
  .map(c => c.key as string)

/** Campos editáveis na linha de processo (camada avô). */
export const CAMPOS_EDITAVEIS_PROCESSO: string[] = [
  'numero_processo',
  'referencia_interna_processo',
  'responsavel_processo',
]

const _COLUNAS_PADRAO_SEQUENCIA_PEDIDO: string[] = [
  'numero_pedido',
  'tipo_operacao',
  'status',
  'id_workspace',
  'nome_importador',
  'nome_exportador',
  'referencia_importador',
  'referencia_exportador',
  'incoterm',
  'porto_origem',
  'porto_destino',
  'local_de_origem',
  'local_de_destino',
  'aeroporto_origem',
  'aeroporto_destino',
  'descricao_item',
  'ncm',
  'moeda_pedido',
  'valor_por_unidade_item',
  'quantidade_total_pedido',
  'valor_total_pedido',
  'quantidade_pronta_itens_pedido_total',
  'unidade_comercializada_pedido',
  'quantidade_transferida_total',
  'saldo_itens_do_pedido',
  'quantidade_cancelada_total_pedido',
  'quantidade_volumes_pedido',
  'peso_liquido_total_pedido',
  'peso_bruto_total_pedido',
  'cubagem_total_pedido',
]

export const COLUNAS_PADRAO_VISIVEIS: string[] = [
  ...CHAVES_COLUNAS_AVO,
  ..._COLUNAS_PADRAO_SEQUENCIA_PEDIDO.filter(k => !CHAVES_COLUNAS_AVO.includes(k)),
  ...COLUNAS_PAI_CHAVES.filter(k =>
    !CHAVES_COLUNAS_AVO.includes(k) && !_COLUNAS_PADRAO_SEQUENCIA_PEDIDO.includes(k),
  ),
]

const EXCLUSIVOS_PEDIDO_ITEM = new Set<string>(['id_workspace', ...CAMPOS_LOGISTICA_PEDIDO])

export function camposEditaveisFilhosLista(): string[] {
  return CAMPOS_EDITAVEIS_PEDIDO.filter(k => !EXCLUSIVOS_PEDIDO_ITEM.has(k))
}

export const COLUNAS_SEM_REPLICACAO_PEDIDO_ITEM = new Set([
  'id_workspace',
  'numero_pedido',
  'valor_total_pedido',
  'valor_por_unidade_item',
  'valor_total_cambio_pedido',
  'quantidade_total_pedido',
  'saldo_itens_do_pedido',
  'quantidade_transferida_total',
  'quantidade_volumes_pedido',
  ...CAMPOS_LOGISTICA_PEDIDO,
])

export const COLUNAS_EXPORT_PROCESSO: ColunasExport[] = [
  { header: 'Camada',              key: '_tipo_linha',              largura: 12 },
  { header: 'Processo',            key: 'numero_processo',          largura: 18 },
  { header: 'Ref. interna',        key: 'referencia_interna_processo', largura: 20 },
  { header: 'Status processo',     key: 'rotulo_status_processo',   largura: 16 },
  { header: 'Nº Pedido',           key: 'numero_pedido',            largura: 18 },
  { header: 'Nº do Item',          key: 'numero_item',              largura: 20 },
  { header: 'Tipo de Operação',    key: 'tipo_operacao',            largura: 14 },
  { header: 'Status',              key: 'status',                   largura: 16 },
  { header: 'Importador',          key: 'nome_importador',          largura: 25 },
  { header: 'Exportador',          key: 'nome_exportador',          largura: 25 },
  { header: 'Referência Importador', key: 'referencia_importador',  largura: 20 },
  { header: 'Referência Exportador', key: 'referencia_exportador',  largura: 20 },
  { header: 'Incoterm',            key: 'incoterm',                 largura: 12 },
  { header: 'Descrição item',      key: 'descricao_item',           largura: 28 },
  { header: 'NCM',                 key: 'ncm',                      largura: 14 },
  { header: 'Valor total',         key: 'valor_total',              largura: 18 },
  { header: 'Qtd. inicial',        key: 'quantidade_inicial',       largura: 14 },
  { header: 'Data P.O',            key: 'data_emissao_pedido',      largura: 14 },
]
