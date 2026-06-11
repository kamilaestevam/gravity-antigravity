/**
 * mockListaHierarquica.ts — Mock 3 camadas: Processo → Pedido → Item.
 * Substituir por API agregada (BFF Processo) na Onda 7.
 */
import type { Pedido, PedidoItem } from './pedidoTypes'
import {
  MOCK_PROCESSOS,
  ETAPAS_COR,
  ETAPAS_LABEL,
  type EtapaProcesso,
  type ProcessoLinha,
} from '../../pages/todos/_mocks'

export const ID_ORGANIZACAO_MOCK_LISTA = 'org_mock'

export interface ProcessoAvoLinha {
  id_processo: string
  id_organizacao: string
  numero_processo: string
  tipo_operacao_processo: 'importacao' | 'exportacao'
  /** Etapa do fluxo COMEX (abas da lista workspace). */
  etapa_atual: EtapaProcesso
  /** ID do status em Configurações (processo:status_config) ou etapa. */
  codigo_status_processo: string
  rotulo_status_processo: string
  cor_status_processo: string
  referencia_interna_processo: string | null
  nome_importador: string
  nome_exportador: string
  pais_origem: string
  pais_destino: string
  incoterm: string
  via_transporte: string
  valor_total_agregado: number
  moeda_agregada: string
  peso_bruto_agregado: number
  data_criacao_processo: string
  data_embarque?: string
  data_chegada?: string
  responsavel_processo: string
}

function processoWorkspaceParaAvo(linha: ProcessoLinha): ProcessoAvoLinha {
  return {
    id_processo: linha.id,
    id_organizacao: ID_ORGANIZACAO_MOCK_LISTA,
    numero_processo: linha.numero,
    tipo_operacao_processo: 'importacao',
    etapa_atual: linha.etapa_atual,
    codigo_status_processo: linha.etapa_atual,
    rotulo_status_processo: ETAPAS_LABEL[linha.etapa_atual],
    cor_status_processo: ETAPAS_COR[linha.etapa_atual],
    referencia_interna_processo: linha.numero.replace('IMP-', 'REF-'),
    nome_importador: linha.importador,
    nome_exportador: linha.exportador,
    pais_origem: linha.pais_origem,
    pais_destino: linha.pais_destino,
    incoterm: linha.incoterm,
    via_transporte: linha.via_transporte,
    valor_total_agregado: linha.valor_fob,
    moeda_agregada: linha.moeda,
    peso_bruto_agregado: linha.peso_bruto,
    data_criacao_processo: linha.data_abertura,
    data_embarque: linha.data_embarque,
    data_chegada: linha.data_chegada,
    responsavel_processo: linha.responsavel,
  }
}

export type FilhoLinhaLista =
  | { camada: 'pedido'; pedido: Pedido; sequencia_pedido: number }
  | { camada: 'item'; item: PedidoItem }

export const fmtMoedaLista = (v: number, moeda: string) =>
  v.toLocaleString('pt-BR', { style: 'currency', currency: moeda })

export const fmtPesoLista = (kg: number) =>
  `${kg.toLocaleString('pt-BR')} kg`

export const fmtDataLista = (iso?: string) =>
  iso ? new Date(iso).toLocaleDateString('pt-BR') : '—'

const ORG = ID_ORGANIZACAO_MOCK_LISTA
const WS = 'ws_mock'

function criarPedidoMock(
  p: Partial<Pedido> & Pick<Pedido, 'id' | 'numero_pedido'> & { id_processo: string },
): Pedido & { id_processo: string } {
  return {
    tenant_id: ORG,
    company_id: WS,
    tipo_operacao: 'importacao',
    status: 'aberto',
    importacao_exportador_id: 'exp-1',
    exportacao_importador_id: 'imp-1',
    nome_exportador: 'Exportador Mock',
    nome_importador: 'Acme Importações Ltda.',
    incoterm: 'CIF',
    moeda_pedido: 'USD',
    valor_total_pedido: 10_000,
    casas_decimais_valor_pedido: 2,
    quantidade_total_pedido: 100,
    casas_decimais_quantidade_pedido: 2,
    condicao_pagamento: '30/60/90',
    data_emissao_pedido: '2026-01-15',
    ...p,
  } as Pedido & { id_processo: string }
}

function criarItemMock(
  p: Partial<PedidoItem> & Pick<PedidoItem, 'id' | 'pedido_id' | 'part_number'>,
): PedidoItem {
  return {
    tenant_id: ORG,
    company_id: WS,
    ncm: '8471.30.12',
    descricao_item: 'Componente eletrônico',
    quantidade_inicial_pedido: 50,
    quantidade_atual_pedido: 50,
    quantidade_pronta_item: 0,
    quantidade_transferida_pedido: 0,
    quantidade_cancelada_pedido: 0,
    casas_decimais_quantidade_item: 2,
    moeda_item: 'USD',
    valor_total_item: 5_000,
    casas_decimais_valor_item: 2,
    ...p,
  } as PedidoItem
}

export const PEDIDOS_MOCK_INICIAL: Array<Pedido & { id_processo: string }> = [
  criarPedidoMock({ id: 'ped-1', id_processo: 'p1', numero_pedido: 'PO-2026-001', valor_total_pedido: 68_400, nome_exportador: 'Shanghai Electronics Co.', referencia_importador: 'RC-4821' }),
  criarPedidoMock({ id: 'ped-2', id_processo: 'p1', numero_pedido: 'PO-2026-002', valor_total_pedido: 32_650, status: 'em_andamento', nome_exportador: 'Shanghai Electronics Co.', referencia_importador: 'RC-4821-B' }),
  criarPedidoMock({ id: 'ped-3', id_processo: 'p1', numero_pedido: 'PO-2026-003', valor_total_pedido: 7_000, status: 'pendente', nome_exportador: 'Shanghai Electronics Co.', referencia_importador: 'RC-4821-C' }),
  criarPedidoMock({ id: 'ped-4', id_processo: 'p2', numero_pedido: 'PO-2026/003', valor_total_pedido: 54_200, nome_exportador: 'Korea Tech Ltd.', referencia_importador: 'REF-IMP-003' }),
  criarPedidoMock({ id: 'ped-5', id_processo: 'p3', numero_pedido: 'PO-2026/004', valor_total_pedido: 32_900, status: 'consolidado', nome_exportador: 'Vietnam Goods SA', referencia_importador: 'REF-IMP-004' }),
]

export const ITENS_MOCK_INICIAL: PedidoItem[] = [
  criarItemMock({ id: 'item-1', pedido_id: 'ped-1', sequencia_item: 1, part_number: 'PCB-4401', descricao_item: 'Placa mãe industrial' }),
  criarItemMock({ id: 'item-2', pedido_id: 'ped-1', sequencia_item: 2, part_number: 'CAP-2200', descricao_item: 'Capacitor SMD' }),
  criarItemMock({ id: 'item-3', pedido_id: 'ped-2', sequencia_item: 1, part_number: 'LCD-9910', descricao_item: 'Display TFT 10"' }),
  criarItemMock({ id: 'item-4', pedido_id: 'ped-3', sequencia_item: 1, part_number: 'MEM-8GB', descricao_item: 'Memória DDR5 8GB' }),
  criarItemMock({ id: 'item-5', pedido_id: 'ped-3', sequencia_item: 2, part_number: 'SSD-512', descricao_item: 'SSD NVMe 512GB' }),
  criarItemMock({ id: 'item-6', pedido_id: 'ped-4', sequencia_item: 1, part_number: 'TXT-100', descricao_item: 'Tecido algodão cru' }),
]

/** 7 processos do workspace — mesma fonte que TodosProcessosLista (Hub). */
export const MOCK_PROCESSOS_AVO: ProcessoAvoLinha[] = MOCK_PROCESSOS.map(processoWorkspaceParaAvo)

export function pedidosDoProcesso(
  id_processo: string,
  pedidos: ReadonlyArray<Pedido & { id_processo: string }> = PEDIDOS_MOCK_INICIAL,
): Pedido[] {
  return pedidos.filter(p => p.id_processo === id_processo)
}

export function pedidoPorId(
  id_pedido: string,
  pedidos: ReadonlyArray<Pedido & { id_processo: string }> = PEDIDOS_MOCK_INICIAL,
): (Pedido & { id_processo: string }) | undefined {
  return pedidos.find(p => p.id === id_pedido)
}

export function itensDoPedido(
  id_pedido: string,
  itens: ReadonlyArray<PedidoItem> = ITENS_MOCK_INICIAL,
): PedidoItem[] {
  return itens.filter(i => i.pedido_id === id_pedido)
}

export function todosIdsPedidoMock(
  pedidos: ReadonlyArray<Pedido & { id_processo: string }> = PEDIDOS_MOCK_INICIAL,
): string[] {
  return pedidos.map(p => p.id)
}

/** Filhos visíveis sob o processo — itens só quando o pedido está expandido. */
export function filhosVisiveisDoProcesso(
  id_processo: string,
  pedidosExpandidos: ReadonlySet<string>,
  pedidos: ReadonlyArray<Pedido & { id_processo: string }> = PEDIDOS_MOCK_INICIAL,
  itens: ReadonlyArray<PedidoItem> = ITENS_MOCK_INICIAL,
): FilhoLinhaLista[] {
  const linhas: FilhoLinhaLista[] = []
  const pedidosProcesso = pedidosDoProcesso(id_processo, pedidos)
  pedidosProcesso.forEach((pedido, indice) => {
    linhas.push({ camada: 'pedido', pedido, sequencia_pedido: indice + 1 })
    if (pedidosExpandidos.has(pedido.id)) {
      const itensPedido = itensDoPedido(pedido.id, itens)
      itensPedido.forEach((item, indiceItem) => {
        linhas.push({
          camada: 'item',
          item: {
            ...item,
            sequencia_item: item.sequencia_item ?? indiceItem + 1,
          },
        })
      })
    }
  })
  return linhas
}

/** @deprecated Preferir filhosVisiveisDoProcesso com controle de expand pedido */
export function filhosDoProcesso(id_processo: string): FilhoLinhaLista[] {
  return filhosVisiveisDoProcesso(id_processo, new Set(todosIdsPedidoMock()))
}

export function idFilhoLinha(l: FilhoLinhaLista): string {
  return l.camada === 'pedido' ? `ped-${l.pedido.id}` : `item-${l.item.id}`
}

/** Sequência do pedido entre os irmãos do mesmo processo (1-based). */
export function sequenciaPedidoNoProcesso(
  id_pedido: string,
  pedidos: ReadonlyArray<Pedido & { id_processo: string }>,
): number {
  const pedido = pedidos.find(p => p.id === id_pedido)
  if (!pedido) return 1
  const lista = pedidosDoProcesso(pedido.id_processo, pedidos)
  const indice = lista.findIndex(p => p.id === id_pedido)
  return indice >= 0 ? indice + 1 : 1
}
