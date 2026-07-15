import type { KanbanItem } from '@nucleo/kanban-global'
import type { PerfilEmpresaSimulador } from '../smart-doc/dados-cliente-maduro-simulador-smart-doc'
import {
  listarPedidosEmpresasSimulador,
  type LinhaListaPedidoSimulador,
  type StatusListaPedidoSimulador,
} from './dados-lista-simulador-pedido'

export type StatusKanbanPedidoSimulador =
  | 'rascunho'
  | 'aberto'
  | 'em_andamento'
  | 'aprovado'
  | 'transferencia'
  | 'consolidado'
  | 'cancelado'

export type TipoOperacaoKanbanSimulador = 'importacao' | 'exportacao'

export type PedidoKanbanSimulador = {
  id: string
  numero_pedido: string
  tipo_operacao: TipoOperacaoKanbanSimulador
  status: StatusKanbanPedidoSimulador
  nome_exportador: string | null
  nome_importador: string | null
  valor_total_pedido: number | null
  moeda_pedido: string
  casas_decimais_valor_pedido: number
  incoterm: string | null
  numero_invoice: string | null
  numero_proforma: string | null
  referencia_exportador: string | null
  quantidade_total_pedido: number | null
  quantidade_pronta_itens_pedido_total: number | null
  quantidade_transferida_total: number | null
  quantidade_cancelada_total_pedido: number | null
  saldo_itens_do_pedido: number | null
  unidade_comercializada_pedido: string | null
  data_emissao_pedido: string | null
  data_prevista_coleta_pedido: string | null
  data_confirmada_coleta_pedido: string | null
  data_prevista_pedido_pronto: string | null
  data_confirmada_pedido_pronto: string | null
  data_prevista_inspecao_pedido: string | null
}

export interface PedidoKanbanItemSimulador extends KanbanItem {
  pedido: PedidoKanbanSimulador
}

export type KanbanCampoConfigSimulador = {
  campo: keyof PedidoKanbanSimulador | string
  label: string
  visivel: boolean
  ordem: number
}

export type KanbanPreferenciasSimulador = {
  card: {
    campos: KanbanCampoConfigSimulador[]
    dataCritica: string | null
  }
  abas: Array<{
    aba: 'pedido' | 'quantidades' | 'datas'
    campos: KanbanCampoConfigSimulador[]
  }>
}

export const KANBAN_PREFS_SIMULADOR_PEDIDO: KanbanPreferenciasSimulador = {
  card: {
    campos: [
      { campo: 'numero_pedido', label: 'Nº Pedido', visivel: false, ordem: 0 },
      { campo: 'nome_exportador', label: 'Exportador', visivel: true, ordem: 1 },
      { campo: 'nome_importador', label: 'Importador', visivel: true, ordem: 2 },
      { campo: 'valor_total_pedido', label: 'Valor Total', visivel: true, ordem: 3 },
      { campo: 'incoterm', label: 'Incoterm', visivel: true, ordem: 4 },
      { campo: 'numero_invoice', label: 'Nº Invoice', visivel: true, ordem: 5 },
      { campo: 'numero_proforma', label: 'Nº Proforma', visivel: false, ordem: 6 },
      { campo: 'status', label: 'Status', visivel: false, ordem: 7 },
    ],
    dataCritica: 'data_prevista_coleta_pedido',
  },
  abas: [
    {
      aba: 'pedido',
      campos: [
        { campo: 'numero_pedido', label: 'Nº Pedido', visivel: true, ordem: 0 },
        { campo: 'nome_exportador', label: 'Exportador', visivel: true, ordem: 1 },
        { campo: 'moeda_pedido', label: 'Moeda do Pedido/Item', visivel: true, ordem: 2 },
        { campo: 'numero_invoice', label: 'Nº Invoice', visivel: true, ordem: 3 },
        { campo: 'referencia_exportador', label: 'Ref. Exportador', visivel: true, ordem: 4 },
        { campo: 'tipo_operacao', label: 'Tipo de Operação', visivel: true, ordem: 5 },
        { campo: 'valor_total_pedido', label: 'Valor Total', visivel: true, ordem: 6 },
        { campo: 'incoterm', label: 'Incoterm', visivel: true, ordem: 7 },
        { campo: 'numero_proforma', label: 'Nº Proforma', visivel: true, ordem: 8 },
      ],
    },
    {
      aba: 'quantidades',
      campos: [
        { campo: 'quantidade_total_pedido', label: 'Qtd. Inicial', visivel: true, ordem: 0 },
        { campo: 'quantidade_pronta_itens_pedido_total', label: 'Qtd. Pronta', visivel: true, ordem: 1 },
        { campo: 'quantidade_transferida_total', label: 'Qtd. Transferida', visivel: true, ordem: 2 },
        { campo: 'quantidade_cancelada_total_pedido', label: 'Qtd. Cancelada', visivel: true, ordem: 3 },
        { campo: 'saldo_itens_do_pedido', label: 'Saldo', visivel: true, ordem: 4 },
      ],
    },
    {
      aba: 'datas',
      campos: [
        { campo: 'data_emissao_pedido', label: 'Data P.O.', visivel: true, ordem: 0 },
        { campo: 'data_prevista_coleta_pedido', label: 'Prev. Coleta', visivel: true, ordem: 1 },
        { campo: 'data_confirmada_coleta_pedido', label: 'Conf. Coleta', visivel: true, ordem: 2 },
        { campo: 'data_prevista_pedido_pronto', label: 'Prev. Pronto', visivel: true, ordem: 3 },
        { campo: 'data_confirmada_pedido_pronto', label: 'Conf. Pronto', visivel: true, ordem: 4 },
        { campo: 'data_prevista_inspecao_pedido', label: 'Prev. Inspeção', visivel: true, ordem: 5 },
      ],
    },
  ],
}

export const COLUNAS_KANBAN_SIMULADOR_PEDIDO: Array<{
  key: StatusKanbanPedidoSimulador
  label: string
  color: string
  isReadOnly?: true
}> = [
  { key: 'rascunho', label: 'Rascunho', color: '#94a3b8' },
  { key: 'aberto', label: 'Aberto', color: '#3b82f6' },
  { key: 'em_andamento', label: 'Em Andamento', color: '#f97316' },
  { key: 'aprovado', label: 'Aprovado', color: '#facc15' },
  { key: 'transferencia', label: 'Transferido', color: '#2dd4bf' },
  { key: 'consolidado', label: 'Consolidado', color: '#a78bfa' },
  { key: 'cancelado', label: 'Cancelado', color: '#ef4444', isReadOnly: true },
]

export const ROTULOS_STATUS_KANBAN_SIMULADOR: Record<StatusKanbanPedidoSimulador, string> = {
  rascunho: 'Rascunho',
  aberto: 'Aberto',
  em_andamento: 'Em Andamento',
  aprovado: 'Aprovado',
  transferencia: 'Transferido',
  consolidado: 'Consolidado',
  cancelado: 'Cancelado',
}

function parseDataBrParaIso(valor: string | null | undefined): string | null {
  if (!valor || valor === '—') return null
  const partes = valor.split('/')
  if (partes.length !== 3) return null
  const [dia, mes, ano] = partes
  if (!dia || !mes || !ano) return null
  return `${ano}-${mes.padStart(2, '0')}-${dia.padStart(2, '0')}`
}

function numeroOuNull(valor: string | null | undefined): number | null {
  if (valor == null || valor === '' || valor === '—') return null
  const n = Number(valor.replace(/\./g, '').replace(',', '.'))
  return Number.isFinite(n) ? n : null
}

export function statusListaParaKanban(status: StatusListaPedidoSimulador): StatusKanbanPedidoSimulador {
  switch (status) {
    case 'RASCUNHO':
      return 'rascunho'
    case 'ABERTO':
      return 'aberto'
    case 'EM ANDAMENTO':
      return 'em_andamento'
    case 'TRANSFERIDO':
      return 'transferencia'
    case 'CONSOLIDADO':
      return 'consolidado'
    default:
      return 'rascunho'
  }
}

function qtdInicialPedido(linha: LinhaListaPedidoSimulador): number {
  const campo = linha.campos.quantidade_total_pedido ?? linha.campos.qtd_inicial_total
  const n = numeroOuNull(campo)
  if (n != null) return n
  return Math.max(1, linha.itens * 10 + (linha.id.length % 17))
}

export function linhaListaParaPedidoKanban(linha: LinhaListaPedidoSimulador): PedidoKanbanSimulador {
  const campos = linha.campos
  const qtdInicial = qtdInicialPedido(linha)
  const qtdPronta = numeroOuNull(campos.quantidade_pronta_itens_pedido_total ?? campos.qtd_pronta_total) ?? 0
  const qtdTransferida = numeroOuNull(campos.quantidade_transferida_total ?? campos.qtd_transferida_total)
    ?? (linha.status === 'TRANSFERIDO' ? Math.round(qtdInicial * 0.35) : 0)
  const qtdCancelada = numeroOuNull(campos.quantidade_cancelada_total_pedido) ?? 0
  const saldo = Math.max(0, qtdInicial - qtdPronta - qtdTransferida - qtdCancelada)

  return {
    id: linha.id,
    numero_pedido: linha.numeroPedido,
    tipo_operacao: linha.tipoOperacao === 'IMPORTAÇÃO' ? 'importacao' : 'exportacao',
    status: statusListaParaKanban(linha.status),
    nome_exportador: linha.vincularExportador ? null : linha.exportador,
    nome_importador: campos.nome_importador ?? linha.workspace,
    valor_total_pedido: linha.valorFob,
    moeda_pedido: linha.moeda,
    casas_decimais_valor_pedido: 2,
    incoterm: linha.incoterm || null,
    numero_invoice: campos.numero_invoice ?? null,
    numero_proforma: campos.numero_proforma ?? null,
    referencia_exportador: campos.referencia_exportador ?? null,
    quantidade_total_pedido: qtdInicial,
    quantidade_pronta_itens_pedido_total: qtdPronta,
    quantidade_transferida_total: qtdTransferida,
    quantidade_cancelada_total_pedido: qtdCancelada,
    saldo_itens_do_pedido: saldo > 0 ? saldo : null,
    unidade_comercializada_pedido: campos.unidade_comercializada_pedido ?? 'UN',
    data_emissao_pedido: parseDataBrParaIso(campos.data_emissao_pedido ?? linha.dataAbertura),
    data_prevista_coleta_pedido: parseDataBrParaIso(campos.data_prevista_coleta_pedido),
    data_confirmada_coleta_pedido: parseDataBrParaIso(campos.data_confirmada_coleta_pedido),
    data_prevista_pedido_pronto: parseDataBrParaIso(campos.data_prevista_pedido_pronto),
    data_confirmada_pedido_pronto: parseDataBrParaIso(campos.data_confirmada_pedido_pronto),
    data_prevista_inspecao_pedido: parseDataBrParaIso(campos.data_prevista_inspecao_pedido),
  }
}

export function listarPedidosKanbanSimulador(
  empresas: PerfilEmpresaSimulador[],
): PedidoKanbanSimulador[] {
  return listarPedidosEmpresasSimulador(empresas).map(linhaListaParaPedidoKanban)
}

export function pedidosKanbanParaItens(pedidos: PedidoKanbanSimulador[]): PedidoKanbanItemSimulador[] {
  return pedidos.map(p => ({
    id: p.id,
    colunaKey: p.status,
    pedido: p,
  }))
}
