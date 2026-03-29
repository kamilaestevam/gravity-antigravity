/**
 * PedidosPage.tsx — Pedidos de compra vinculados ao processo
 *
 * TabelaCamadasGlobal: pedidos como camada pai, itens como camada filha.
 * Segue padroes do Configurador (Workspaces.tsx / Organizacao.tsx).
 */

import React, { useState } from 'react'
import {
  Package,
  Plus,
  Eye,
  PencilSimple,
  CurrencyDollar,
  Scales,
  Cube,
} from '@phosphor-icons/react'
import { PaginaGlobal } from '@nucleo/pagina-global'
import { CabecalhoGlobal } from '@nucleo/cabecalho-global'
import { CardBasicoGlobal } from '@nucleo/card-global'
import { TabelaCamadasGlobal } from '@nucleo/tabela-camadas-global'
import { StatusBadgeGlobal } from '@nucleo/status-badge-global'
import { BotaoGlobal } from '@nucleo/botao-global'
import { TooltipGlobal } from '@nucleo/tooltip-global'
import type { TCGColuna, TCGAcao } from '@nucleo/tabela-camadas-global'

// ── Tipos locais ──────────────────────────────────────────────────────────────

interface PedidoItem {
  id: string
  numero_item: number
  descricao: string
  ncm: string
  quantidade: number
  unidade: string
  valor_total: number
  status_li: string
}

interface Pedido {
  id: string
  numero: string
  exportador_nome: string
  status: string
  valor_fob: number
  moeda: string
  peso_bruto: number
  data_pedido: string
  itens: PedidoItem[]
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const fmtUSD = (val: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'USD' }).format(val)

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString('pt-BR')

const fmtPeso = (val: number) =>
  val.toLocaleString('pt-BR', { maximumFractionDigits: 2 })

// ── Status maps ───────────────────────────────────────────────────────────────

const STATUS_PEDIDO_LABELS: Record<string, string> = {
  pendente: 'Pendente',
  confirmado: 'Confirmado',
  em_transito: 'Em Transito',
  desembaracado: 'Desembaracado',
  entregue: 'Entregue',
  cancelado: 'Cancelado',
}

const STATUS_LI_LABELS: Record<string, string> = {
  pendente: 'Pendente',
  deferida: 'Deferida',
  indeferida: 'Indeferida',
  dispensada: 'Dispensada',
}

// ── Mock data ─────────────────────────────────────────────────────────────────

const PEDIDOS_MOCK: Pedido[] = [
  {
    id: 'ped-001',
    numero: 'PO-2026/001',
    exportador_nome: 'Shanghai Electronics Co.',
    status: 'confirmado',
    valor_fob: 84_250.00,
    moeda: 'USD',
    peso_bruto: 12_450.80,
    data_pedido: '2026-01-15',
    itens: [
      { id: 'item-001', numero_item: 1, descricao: 'Placa controladora PCB modelo X-200', ncm: '8542.31.90', quantidade: 5000, unidade: 'UN', valor_total: 35_000.00, status_li: 'deferida' },
      { id: 'item-002', numero_item: 2, descricao: 'Capacitor ceramico SMD 100nF', ncm: '8532.24.10', quantidade: 50_000, unidade: 'UN', valor_total: 12_500.00, status_li: 'dispensada' },
      { id: 'item-003', numero_item: 3, descricao: 'Conector USB-C macho SMT', ncm: '8536.69.90', quantidade: 10_000, unidade: 'UN', valor_total: 18_750.00, status_li: 'deferida' },
      { id: 'item-004', numero_item: 4, descricao: 'Dissipador de calor aluminio 40x40mm', ncm: '7616.99.00', quantidade: 5000, unidade: 'UN', valor_total: 18_000.00, status_li: 'pendente' },
    ],
  },
  {
    id: 'ped-002',
    numero: 'PO-2026/002',
    exportador_nome: 'Dongguan Plastics Ltd.',
    status: 'pendente',
    valor_fob: 23_800.00,
    moeda: 'USD',
    peso_bruto: 6_320.50,
    data_pedido: '2026-02-08',
    itens: [
      { id: 'item-005', numero_item: 1, descricao: 'Carcaca plastica ABS injetada modelo G-5', ncm: '3926.90.90', quantidade: 3000, unidade: 'UN', valor_total: 15_000.00, status_li: 'pendente' },
      { id: 'item-006', numero_item: 2, descricao: 'Tampa traseira policarbonato transparente', ncm: '3920.61.00', quantidade: 3000, unidade: 'UN', valor_total: 8_800.00, status_li: 'pendente' },
    ],
  },
]

// ── Colunas pai ───────────────────────────────────────────────────────────────

const colunasPai: TCGColuna<Pedido>[] = [
  {
    key: 'numero',
    label: 'Numero',
    tooltipTitulo: 'Numero do Pedido',
    tooltipDescricao: 'Identificador unico do pedido de compra no processo',
  },
  {
    key: 'exportador_nome',
    label: 'Exportador',
    tooltipTitulo: 'Exportador',
    tooltipDescricao: 'Fornecedor internacional responsavel pelo envio da mercadoria',
  },
  {
    key: 'status',
    label: 'Status',
    tooltipTitulo: 'Status do Pedido',
    tooltipDescricao: 'Situacao atual do pedido dentro do fluxo de importacao',
    render: (_val: string, row: Pedido) => (
      <StatusBadgeGlobal valor={STATUS_PEDIDO_LABELS[row.status] ?? row.status} genero="masculino" />
    ),
  },
  {
    key: 'valor_fob',
    label: 'Valor FOB',
    align: 'right',
    tooltipTitulo: 'Valor FOB',
    tooltipDescricao: 'Valor total da mercadoria no ponto de embarque em dolares',
    render: (_val: number, row: Pedido) => <span>{fmtUSD(row.valor_fob)}</span>,
  },
  {
    key: 'peso_bruto',
    label: 'Peso Bruto (kg)',
    align: 'right',
    tooltipTitulo: 'Peso Bruto',
    tooltipDescricao: 'Peso total do pedido incluindo embalagem em quilogramas',
    render: (_val: number, row: Pedido) => <span>{fmtPeso(row.peso_bruto)}</span>,
  },
  {
    key: 'data_pedido',
    label: 'Data Pedido',
    tooltipTitulo: 'Data do Pedido',
    tooltipDescricao: 'Data em que o pedido de compra foi emitido ao exportador',
    render: (_val: string, row: Pedido) => <span>{fmtDate(row.data_pedido)}</span>,
  },
]

// ── Colunas filha ─────────────────────────────────────────────────────────────

const colunasFilha: TCGColuna<PedidoItem>[] = [
  {
    key: 'numero_item',
    label: 'Item',
    tooltipTitulo: 'Numero do Item',
    tooltipDescricao: 'Sequencial do item dentro do pedido de compra',
    render: (_val: number, row: PedidoItem) => (
      <span>{String(row.numero_item).padStart(3, '0')}</span>
    ),
  },
  {
    key: 'descricao',
    label: 'Descricao',
    tooltipTitulo: 'Descricao do Item',
    tooltipDescricao: 'Nome comercial da mercadoria conforme fatura do exportador',
  },
  {
    key: 'ncm',
    label: 'NCM',
    tooltipTitulo: 'NCM',
    tooltipDescricao: 'Codigo da Nomenclatura Comum do Mercosul para classificacao fiscal',
    render: (_val: string, row: PedidoItem) => (
      <span style={{ fontFamily: 'var(--font-mono, monospace)', fontSize: '0.8125rem' }}>
        {row.ncm}
      </span>
    ),
  },
  {
    key: 'quantidade',
    label: 'Qtd.',
    align: 'right',
    tooltipTitulo: 'Quantidade',
    tooltipDescricao: 'Volume adquirido do item na unidade de medida informada',
    render: (_val: number, row: PedidoItem) => (
      <span>{row.quantidade.toLocaleString('pt-BR')} {row.unidade}</span>
    ),
  },
  {
    key: 'valor_total',
    label: 'Valor Total',
    align: 'right',
    tooltipTitulo: 'Valor Total',
    tooltipDescricao: 'Valor FOB total do item em dolares americanos',
    render: (_val: number, row: PedidoItem) => <span>{fmtUSD(row.valor_total)}</span>,
  },
  {
    key: 'status_li',
    label: 'Status LI',
    tooltipTitulo: 'Status da LI',
    tooltipDescricao: 'Situacao da Licenca de Importacao junto aos orgaos anuentes',
    render: (_val: string, row: PedidoItem) => (
      <StatusBadgeGlobal valor={STATUS_LI_LABELS[row.status_li] ?? row.status_li} genero="feminino" />
    ),
  },
]

// ── Acoes pai ─────────────────────────────────────────────────────────────────

const acoesPai: TCGAcao<Pedido>[] = [
  {
    id: 'ver',
    tooltip: 'Ver detalhes do pedido',
    icone: <Eye size={16} weight="duotone" />,
    onClick: (row: Pedido) => {
      console.log('Ver pedido:', row.id)
    },
  },
  {
    id: 'editar',
    tooltip: 'Editar dados do pedido',
    icone: <PencilSimple size={16} weight="duotone" />,
    onClick: (row: Pedido) => {
      console.log('Editar pedido:', row.id)
    },
  },
]

// ── Componente ────────────────────────────────────────────────────────────────

export default function PedidosPage() {
  const [carregando] = useState(false)
  const pedidos = PEDIDOS_MOCK

  // Stats calculados
  const totalPedidos = pedidos.length
  const valorFobTotal = pedidos.reduce((acc, p) => acc + p.valor_fob, 0)
  const pesoTotal = pedidos.reduce((acc, p) => acc + p.peso_bruto, 0)

  // Estado vazio
  const semPedidos = pedidos.length === 0

  return (
    <PaginaGlobal
      className="ws-fade-up"
      layout="lista"
      cabecalho={
        <CabecalhoGlobal
          icone={<Package weight="duotone" size={22} />}
          titulo="Pedidos"
          subtitulo="Pedidos de compra vinculados ao processo"
        />
      }
      stats={
        <>
          <CardBasicoGlobal
            titulo="Total Pedidos"
            icone={<Cube weight="duotone" size={16} style={{ color: 'var(--ws-accent)' }} />}
            valor={totalPedidos}
            subtexto={`${pedidos.reduce((a, p) => a + p.itens.length, 0)} itens no total`}
          />
          <CardBasicoGlobal
            titulo="Valor FOB Total"
            icone={<CurrencyDollar weight="duotone" size={16} style={{ color: '#34d399' }} />}
            valor={fmtUSD(valorFobTotal)}
            variante="sucesso"
            subtexto="Soma de todos os pedidos"
          />
          <CardBasicoGlobal
            titulo="Peso Total"
            icone={<Scales weight="duotone" size={16} style={{ color: '#fbbf24' }} />}
            valor={`${fmtPeso(pesoTotal)} kg`}
            variante="aviso"
            subtexto="Peso bruto acumulado"
          />
        </>
      }
      acoes={
        <BotaoGlobal variante="primario" icone={<Plus size={16} />}>
          Novo Pedido
        </BotaoGlobal>
      }
    >
      {semPedidos && !carregando ? (
        <div
          className="ws-fade-up ws-fade-up-d1"
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.75rem',
            padding: '4rem 2rem',
            color: 'var(--ws-muted)',
          }}
        >
          <Package weight="duotone" size={48} style={{ opacity: 0.4 }} />
          <span style={{ fontSize: '0.875rem' }}>Nenhum pedido cadastrado para este processo</span>
        </div>
      ) : (
        <TabelaCamadasGlobal<Pedido, PedidoItem>
          dados={pedidos}
          colunas={colunasPai}
          colunasFilhas={colunasFilha}
          filhos={(pedido) => pedido.itens ?? []}
          acoes={acoesPai}
          itemId={(pedido) => pedido.id}
          placeholderBusca="Buscar pedidos..."
          campoBusca="numero"
          mensagemVazio="Nenhum pedido encontrado para o filtro aplicado"
          carregando={carregando}
          itensPorPagina={10}
        />
      )}
    </PaginaGlobal>
  )
}
