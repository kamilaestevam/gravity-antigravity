import type { PerfilEmpresaSimulador } from '../smart-doc/dados-cliente-maduro-simulador-smart-doc'
import {
  popularCamposItemListaSimulador,
  popularCamposPedidoListaSimulador,
} from './popular-campos-lista-simulador-pedido'

export type StatusListaPedidoSimulador =
  | 'RASCUNHO'
  | 'ABERTO'
  | 'EM ANDAMENTO'
  | 'TRANSFERIDO'
  | 'CONSOLIDADO'

export type ItemListaPedidoSimulador = {
  id: string
  sequencia: number
  numeroItem: string
  alerta: boolean
  tipoOperacao: 'IMPORTAÇÃO' | 'EXPORTAÇÃO'
  status: StatusListaPedidoSimulador
  campos: Record<string, string | null>
}

export type LinhaListaPedidoSimulador = {
  id: string
  numeroPedido: string
  tipoOperacao: 'IMPORTAÇÃO' | 'EXPORTAÇÃO'
  status: StatusListaPedidoSimulador
  idEmpresa: string
  workspace: string
  exportador: string
  vincularExportador: boolean
  incoterm: string
  alertaIncoterm: boolean
  portoOrigem: string
  valorFob: number
  moeda: string
  dataAbertura: string
  itens: number
  detalhesItens: ItemListaPedidoSimulador[]
  campos: Record<string, string | null>
}

export type ResumoListaPedidoSimulador = {
  valorTotal: number
  totalPedidos: number
  totalItens: number
}

const WORKSPACE_POR_EMPRESA: Record<string, string> = {
  'filial-sc-importador': 'FILIAL SC',
  'matriz-sp-importador': 'MATRIZ SP',
  'filial-pr-exportador': 'FILIAL PR',
  'importador-ltda': 'IMPORTADOR LTDA',
  'exportador-ltda': 'EXPORTADOR LTDA',
}

function hashSimples(texto: string): number {
  let h = 0
  for (let i = 0; i < texto.length; i += 1) h = (h * 31 + texto.charCodeAt(i)) % 10000
  return h
}

function gerarItensLista(
  pedidoId: string,
  qtd: number,
  tipo: LinhaListaPedidoSimulador['tipoOperacao'],
  status: StatusListaPedidoSimulador,
  alertaPedido: boolean,
  numerosCustom?: string[],
  contextoPai?: Omit<ContextoLinhaLista, 'id' | 'qtdItens'>,
): ItemListaPedidoSimulador[] {
  const base = 1080900 + hashSimples(pedidoId)
  return Array.from({ length: qtd }, (_, i) => {
    const sequencia = i + 1
    const numeroItem = numerosCustom?.[i] ?? String(base + i + 1)
    const ctxItem = {
      ...(contextoPai ?? {
        numeroPedido: pedidoId,
        tipoOperacao: tipo,
        status,
        workspace: '',
        exportador: '',
        vincularExportador: false,
        incoterm: 'FOB',
        alertaIncoterm: false,
        portoOrigem: '—',
        valorFob: 0,
        moeda: 'USD',
        dataAbertura: '01/01/2026',
      }),
      id: `${pedidoId}-item-${sequencia}`,
      sequencia,
      numeroItem,
      qtdItens: qtd,
    }
    return {
      id: `${pedidoId}-item-${sequencia}`,
      sequencia,
      numeroItem,
      alerta: alertaPedido || i === 0,
      tipoOperacao: tipo,
      status,
      campos: popularCamposItemListaSimulador(ctxItem),
    }
  })
}

type ContextoLinhaLista = {
  id: string
  numeroPedido: string
  tipoOperacao: LinhaListaPedidoSimulador['tipoOperacao']
  status: StatusListaPedidoSimulador
  workspace: string
  exportador: string
  vincularExportador: boolean
  incoterm: string
  alertaIncoterm: boolean
  portoOrigem: string
  valorFob: number
  moeda: string
  dataAbertura: string
  qtdItens: number
}

function linha(
  id: string,
  idEmpresa: string,
  numero: string,
  tipo: LinhaListaPedidoSimulador['tipoOperacao'],
  status: StatusListaPedidoSimulador,
  exportador: string,
  vincular: boolean,
  incoterm: string,
  alerta: boolean,
  porto: string,
  valor: number,
  moeda: string,
  data: string,
  itens: number,
  itensCustom?: ItemListaPedidoSimulador[],
): LinhaListaPedidoSimulador {
  const numerosCons = numero.startsWith('PO-CONS') ? Array.from({ length: itens }, () => '1080936') : undefined
  const workspace = WORKSPACE_POR_EMPRESA[idEmpresa] ?? idEmpresa
  const ctx: ContextoLinhaLista = {
    id,
    numeroPedido: numero,
    tipoOperacao: tipo,
    status,
    workspace,
    exportador,
    vincularExportador: vincular,
    incoterm,
    alertaIncoterm: alerta,
    portoOrigem: porto,
    valorFob: valor,
    moeda,
    dataAbertura: data,
    qtdItens: itens,
  }
  const detalhesItens = itensCustom ?? gerarItensLista(id, itens, tipo, status, alerta || numero.startsWith('PO-CONS'), numerosCons, ctx)
  return {
    id,
    numeroPedido: numero,
    tipoOperacao: tipo,
    status,
    idEmpresa,
    workspace,
    exportador,
    vincularExportador: vincular,
    incoterm,
    alertaIncoterm: alerta,
    portoOrigem: porto,
    valorFob: valor,
    moeda,
    dataAbertura: data,
    itens,
    detalhesItens,
    campos: popularCamposPedidoListaSimulador(ctx),
  }
}

export const LISTA_PEDIDO_POR_EMPRESA_SIMULADOR: Record<string, LinhaListaPedidoSimulador[]> = {
  'filial-sc-importador': [
    linha('sc-1', 'filial-sc-importador', 'PO-9821', 'IMPORTAÇÃO', 'RASCUNHO', 'Asia Pacific Ltd', false, 'CIF', false, 'SHENZHEN', 45600, 'USD', '06/07/2026', 4),
    linha('sc-2', 'filial-sc-importador', 'PO-9818', 'IMPORTAÇÃO', 'ABERTO', 'Shenzhen Components', false, 'FOB', false, 'SHENZHEN', 28400, 'USD', '05/07/2026', 3),
    linha('sc-3', 'filial-sc-importador', 'PO-9812', 'IMPORTAÇÃO', 'EM ANDAMENTO', 'Nippon Parts Co.', false, 'EXW', true, 'YOKOHAMA', 67200, 'USD', '03/07/2026', 6),
    linha('sc-4', 'filial-sc-importador', 'PO-9805', 'IMPORTAÇÃO', 'TRANSFERIDO', 'Global Motors JP', false, 'CIF', false, 'TOKYO', 118900, 'USD', '28/06/2026', 8),
    linha('sc-5', 'filial-sc-importador', 'PO-9799', 'IMPORTAÇÃO', 'RASCUNHO', 'Vincular Exportador', true, 'DAP', false, '—', 0, 'USD', '27/06/2026', 2),
    linha('sc-6', 'filial-sc-importador', 'PO-9791', 'IMPORTAÇÃO', 'CONSOLIDADO', 'Korea Tech Ltd', false, 'CFR', false, 'BUSAN', 203400, 'USD', '24/06/2026', 12),
    linha('sc-7', 'filial-sc-importador', 'PO-9788', 'IMPORTAÇÃO', 'RASCUNHO', 'Vincular Exportador', true, 'FOB', true, '—', 0, 'USD', '22/06/2026', 1),
    linha('sc-8', 'filial-sc-importador', 'PO-9780', 'IMPORTAÇÃO', 'ABERTO', 'Taiwan Semicon', false, 'FCA', false, 'KAOHSIUNG', 34100, 'USD', '20/06/2026', 2),
  ],
  'matriz-sp-importador': [
    linha('sp-1', 'matriz-sp-importador', 'PO-CONS-2026/232', 'IMPORTAÇÃO', 'TRANSFERIDO', 'BRITISH ENGINES LTD', false, 'EXW', true, '—', 89200, 'GBP', '06/07/2026', 5),
    linha('sp-2', 'matriz-sp-importador', 'PO-9830', 'IMPORTAÇÃO', 'RASCUNHO', 'EuroParts GmbH', false, 'FAS', false, 'HAMBURG', 0, 'EUR', '06/07/2026', 3),
    linha('sp-3', 'matriz-sp-importador', 'PO-9825', 'IMPORTAÇÃO', 'RASCUNHO', 'Vincular Exportador', true, 'CFR', false, '—', 0, 'EUR', '04/07/2026', 2),
    linha('sp-4', 'matriz-sp-importador', 'PO-9819', 'IMPORTAÇÃO', 'EM ANDAMENTO', 'Rotterdam Supply', false, 'CIF', false, 'ROTTERDAM', 156700, 'EUR', '02/07/2026', 7),
    linha('sp-5', 'matriz-sp-importador', 'PO-9810', 'IMPORTAÇÃO', 'ABERTO', 'London Metals', false, 'DDP', false, 'LONDON', 44500, 'GBP', '30/06/2026', 4),
    linha('sp-6', 'matriz-sp-importador', 'PO-9801', 'IMPORTAÇÃO', 'RASCUNHO', 'Vincular Exportador', true, 'EXW', true, '—', 0, 'GBP', '28/06/2026', 1),
    linha('sp-7', 'matriz-sp-importador', 'PO-9795', 'IMPORTAÇÃO', 'TRANSFERIDO', 'Nordic Steel AB', false, 'FOB', false, 'GOTHENBURG', 98700, 'EUR', '25/06/2026', 6),
  ],
  'filial-pr-exportador': [
    linha('pr-1', 'filial-pr-exportador', 'PO-EX-441', 'EXPORTAÇÃO', 'ABERTO', 'Agro Export PR', false, 'FOB', false, 'PARANAGUÁ', 78400, 'USD', '06/07/2026', 5),
    linha('pr-2', 'filial-pr-exportador', 'PO-EX-438', 'EXPORTAÇÃO', 'EM ANDAMENTO', 'Midwest Foods US', false, 'CIF', false, 'PARANAGUÁ', 112000, 'USD', '05/07/2026', 8),
    linha('pr-3', 'filial-pr-exportador', 'PO-EX-430', 'EXPORTAÇÃO', 'RASCUNHO', 'Vincular Exportador', true, 'EXW', true, '—', 0, 'USD', '03/07/2026', 2),
    linha('pr-4', 'filial-pr-exportador', 'PO-EX-422', 'EXPORTAÇÃO', 'TRANSFERIDO', 'Detroit Auto Parts', false, 'FOB', false, 'SANTOS', 203500, 'USD', '01/07/2026', 10),
    linha('pr-5', 'filial-pr-exportador', 'PO-EX-415', 'EXPORTAÇÃO', 'CONSOLIDADO', 'Buenos Aires Trade', false, 'CFR', false, 'PARANAGUÁ', 67800, 'USD', '28/06/2026', 4),
    linha('pr-6', 'filial-pr-exportador', 'PO-EX-408', 'EXPORTAÇÃO', 'RASCUNHO', 'Vincular Exportador', true, 'DAP', false, '—', 0, 'USD', '26/06/2026', 1),
  ],
  'importador-ltda': [
    linha('im-1', 'importador-ltda', 'PO-7701', 'IMPORTAÇÃO', 'RASCUNHO', 'Paris Luxury SA', false, 'DAP', false, 'LE HAVRE', 0, 'EUR', '06/07/2026', 3),
    linha('im-2', 'importador-ltda', 'PO-7698', 'IMPORTAÇÃO', 'ABERTO', 'Hamburg Logistics', false, 'CIF', false, 'HAMBURG', 89400, 'EUR', '05/07/2026', 5),
    linha('im-3', 'importador-ltda', 'PO-7690', 'IMPORTAÇÃO', 'RASCUNHO', 'Vincular Exportador', true, 'FOB', true, '—', 0, 'EUR', '04/07/2026', 2),
    linha('im-4', 'importador-ltda', 'PO-7682', 'IMPORTAÇÃO', 'EM ANDAMENTO', 'Nordic Supply', false, 'EXW', false, 'OSLO', 52300, 'EUR', '02/07/2026', 4),
    linha('im-5', 'importador-ltda', 'PO-7675', 'IMPORTAÇÃO', 'TRANSFERIDO', 'Milan Fashion SpA', false, 'CFR', false, 'GENOVA', 178200, 'EUR', '30/06/2026', 9),
    linha('im-6', 'importador-ltda', 'PO-7668', 'IMPORTAÇÃO', 'RASCUNHO', 'Vincular Exportador', true, 'FAS', false, '—', 0, 'EUR', '28/06/2026', 1),
    linha('im-7', 'importador-ltda', 'PO-7660', 'IMPORTAÇÃO', 'CONSOLIDADO', 'Recife Components', false, 'DDP', false, 'RECIFE', 245600, 'BRL', '25/06/2026', 11),
  ],
  'exportador-ltda': [
    linha('ex-1', 'exportador-ltda', 'PO-SX-201', 'EXPORTAÇÃO', 'RASCUNHO', 'Café Santos Export', false, 'FOB', false, 'SANTOS', 0, 'USD', '06/07/2026', 2),
    linha('ex-2', 'exportador-ltda', 'PO-SX-198', 'EXPORTAÇÃO', 'ABERTO', 'Paris Roasters', false, 'CIF', false, 'SANTOS', 56700, 'EUR', '05/07/2026', 4),
    linha('ex-3', 'exportador-ltda', 'PO-SX-192', 'EXPORTAÇÃO', 'TRANSFERIDO', 'London Coffee Co', false, 'FOB', false, 'SANTOS', 89400, 'GBP', '03/07/2026', 6),
    linha('ex-4', 'exportador-ltda', 'PO-SX-185', 'EXPORTAÇÃO', 'RASCUNHO', 'Vincular Exportador', true, 'EXW', true, '—', 0, 'GBP', '01/07/2026', 1),
    linha('ex-5', 'exportador-ltda', 'PO-SX-178', 'EXPORTAÇÃO', 'EM ANDAMENTO', 'Felixstowe Importers', false, 'CFR', false, 'SANTOS', 43200, 'GBP', '29/06/2026', 3),
  ],
}

export function listarPedidosEmpresasSimulador(empresas: PerfilEmpresaSimulador[]): LinhaListaPedidoSimulador[] {
  const ids = empresas.map((e) => e.id)
  if (ids.length === 0) {
    return LISTA_PEDIDO_POR_EMPRESA_SIMULADOR['filial-sc-importador'] ?? []
  }
  return ids
    .flatMap((id) => LISTA_PEDIDO_POR_EMPRESA_SIMULADOR[id] ?? [])
    .sort((a, b) => b.dataAbertura.localeCompare(a.dataAbertura))
}

export function resumirListaPedidosSimulador(linhas: LinhaListaPedidoSimulador[]): ResumoListaPedidoSimulador {
  return {
    valorTotal: linhas.reduce((s, l) => s + l.valorFob, 0),
    totalPedidos: linhas.length,
    totalItens: linhas.reduce((s, l) => s + l.itens, 0),
  }
}

export function formatarValorListaPedidoSimulador(valor: number): string {
  return valor.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}
