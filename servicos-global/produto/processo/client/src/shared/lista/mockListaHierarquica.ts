/**
 * mockListaHierarquica.ts — Mock 3 camadas: Processo → Pedido → Item.
 * Substituir por API agregada (BFF Processo) na Onda 7.
 */
import type { Pedido, PedidoItem } from './pedidoTypes'

export interface ProcessoAvoLinha {
  id_processo: string
  numero_processo: string
  tipo_operacao_processo: 'importacao' | 'exportacao'
  rotulo_status_processo: string
  cor_status_processo: string
  referencia_interna_processo: string | null
  nome_importador: string
  nome_exportador: string
  valor_total_agregado: number
  moeda_agregada: string
  peso_bruto_agregado: number
  data_criacao_processo: string
  responsavel_processo: string
}

export type FilhoLinhaLista =
  | { camada: 'pedido'; pedido: Pedido }
  | { camada: 'item'; item: PedidoItem }

export const fmtMoedaLista = (v: number, moeda: string) =>
  v.toLocaleString('pt-BR', { style: 'currency', currency: moeda })

export const fmtPesoLista = (kg: number) =>
  `${kg.toLocaleString('pt-BR')} kg`

export const fmtDataLista = (iso?: string) =>
  iso ? new Date(iso).toLocaleDateString('pt-BR') : '—'

const ORG = 'org_mock'
const WS = 'ws_mock'

function criarPedidoMock(p: Partial<Pedido> & Pick<Pedido, 'id' | 'numero_pedido'> & { id_processo: string }): Pedido {
  return {
    id: p.id,
    tenant_id: ORG,
    company_id: WS,
    tipo_operacao: p.tipo_operacao ?? 'importacao',
    numero_pedido: p.numero_pedido,
    status: p.status ?? 'aberto',
    importacao_exportador_id: 'exp-1',
    exportacao_importador_id: 'imp-1',
    nome_exportador: p.nome_exportador ?? 'Exportador Mock',
    nome_importador: p.nome_importador ?? 'Acme Importações Ltda.',
    incoterm: 'CIF',
    moeda_pedido: p.moeda_pedido ?? 'USD',
    valor_total_pedido: p.valor_total_pedido ?? 10_000,
    casas_decimais_valor_pedido: 2,
    quantidade_total_pedido: 100,
    casas_decimais_quantidade_pedido: 2,
    condicao_pagamento: '30/60/90',
    data_emissao_pedido: p.data_emissao_pedido ?? '2026-01-15',
    id_processo: p.id_processo,
    ...p,
  } as Pedido
}

function criarItemMock(p: Partial<PedidoItem> & Pick<PedidoItem, 'id' | 'pedido_id' | 'part_number'>): PedidoItem {
  return {
    id: p.id,
    tenant_id: ORG,
    company_id: WS,
    pedido_id: p.pedido_id,
    part_number: p.part_number,
    ncm: p.ncm ?? '8471.30.12',
    descricao_item: p.descricao_item ?? 'Componente eletrônico',
    quantidade_inicial_pedido: 50,
    quantidade_atual_pedido: p.quantidade_atual_pedido ?? 50,
    quantidade_pronta_total_item_pedido: 0,
    quantidade_transferida_pedido: 0,
    quantidade_cancelada_pedido: 0,
    casas_decimais_quantidade_item: 2,
    moeda_item: 'USD',
    valor_total_item: 5_000,
    casas_decimais_valor_item: 2,
    ...p,
  } as PedidoItem
}

const PEDIDOS: Array<Pedido & { id_processo: string }> = [
  criarPedidoMock({ id: 'ped-1', id_processo: 'proc-1', numero_pedido: 'PO-2026/001', valor_total_pedido: 45_000, nome_exportador: 'Shanghai Electronics Co.' }),
  criarPedidoMock({ id: 'ped-2', id_processo: 'proc-1', numero_pedido: 'PO-2026/002', valor_total_pedido: 63_050, status: 'em_andamento', nome_exportador: 'Shenzhen Parts Ltd.' }),
  criarPedidoMock({ id: 'ped-3', id_processo: 'proc-2', numero_pedido: 'PO-2026/003', valor_total_pedido: 54_200, nome_exportador: 'Korea Tech Ltd.' }),
  criarPedidoMock({ id: 'ped-4', id_processo: 'proc-3', numero_pedido: 'PO-2026/004', valor_total_pedido: 32_900, status: 'consolidado', nome_exportador: 'Vietnam Goods SA' }),
]

const ITENS: PedidoItem[] = [
  criarItemMock({ id: 'item-1', pedido_id: 'ped-1', part_number: 'PCB-4401', descricao_item: 'Placa mãe industrial' }),
  criarItemMock({ id: 'item-2', pedido_id: 'ped-1', part_number: 'CAP-2200', descricao_item: 'Capacitor SMD' }),
  criarItemMock({ id: 'item-3', pedido_id: 'ped-2', part_number: 'LCD-9910', descricao_item: 'Display TFT 10"' }),
  criarItemMock({ id: 'item-4', pedido_id: 'ped-3', part_number: 'MEM-8GB', descricao_item: 'Memória DDR5 8GB' }),
  criarItemMock({ id: 'item-5', pedido_id: 'ped-3', part_number: 'SSD-512', descricao_item: 'SSD NVMe 512GB' }),
  criarItemMock({ id: 'item-6', pedido_id: 'ped-4', part_number: 'TXT-100', descricao_item: 'Tecido algodão cru' }),
]

export const MOCK_PROCESSOS_AVO: ProcessoAvoLinha[] = [
  {
    id_processo: 'proc-1',
    numero_processo: 'Gravity-00001/26',
    tipo_operacao_processo: 'importacao',
    rotulo_status_processo: 'Embarque',
    cor_status_processo: '#a78bfa',
    referencia_interna_processo: 'REF-ACME-0150',
    nome_importador: 'Acme Importações Ltda.',
    nome_exportador: 'Shanghai Electronics Co.',
    valor_total_agregado: 108_050,
    moeda_agregada: 'USD',
    peso_bruto_agregado: 18_771,
    data_criacao_processo: '2026-01-10',
    responsavel_processo: 'Daniel Martins',
  },
  {
    id_processo: 'proc-2',
    numero_processo: 'Gravity-00002/26',
    tipo_operacao_processo: 'importacao',
    rotulo_status_processo: 'Desembaraço',
    cor_status_processo: '#fbbf24',
    referencia_interna_processo: 'REF-ACME-0149',
    nome_importador: 'Acme Importações Ltda.',
    nome_exportador: 'Korea Tech Ltd.',
    valor_total_agregado: 54_200,
    moeda_agregada: 'USD',
    peso_bruto_agregado: 8_400,
    data_criacao_processo: '2026-01-22',
    responsavel_processo: 'Marina Albuquerque',
  },
  {
    id_processo: 'proc-3',
    numero_processo: 'Gravity-00003/26',
    tipo_operacao_processo: 'importacao',
    rotulo_status_processo: 'Concluído',
    cor_status_processo: '#10b981',
    referencia_interna_processo: 'REF-ACME-0148',
    nome_importador: 'Acme Importações Ltda.',
    nome_exportador: 'Vietnam Goods SA',
    valor_total_agregado: 32_900,
    moeda_agregada: 'USD',
    peso_bruto_agregado: 5_100,
    data_criacao_processo: '2025-12-15',
    responsavel_processo: 'Rafael Mendes',
  },
]

export function pedidosDoProcesso(id_processo: string): Pedido[] {
  return PEDIDOS.filter(p => p.id_processo === id_processo)
}

export function itensDoPedido(id_pedido: string): PedidoItem[] {
  return ITENS.filter(i => i.pedido_id === id_pedido)
}

export function filhosDoProcesso(id_processo: string): FilhoLinhaLista[] {
  const linhas: FilhoLinhaLista[] = []
  for (const pedido of pedidosDoProcesso(id_processo)) {
    linhas.push({ camada: 'pedido', pedido })
    for (const item of itensDoPedido(pedido.id)) {
      linhas.push({ camada: 'item', item })
    }
  }
  return linhas
}

export function idFilhoLinha(l: FilhoLinhaLista): string {
  return l.camada === 'pedido' ? `ped-${l.pedido.id}` : `item-${l.item.id}`
}
