/**
 * PedidosLista.tsx — Tabela cheia de pedidos (visual identico ao
 * /pedido/pedidos/lista).
 *
 * NOTA: enquanto o backend/banco nao esta estruturado, esta tela usa
 * dados mockados (MOCK_PEDIDOS abaixo) para mostrar todas as colunas
 * visuais (Nº Pedido, Tipo Operacao, Workspace, Importador, Exportador,
 * Ref Importador, Ref Exportador, Incoterm, Portos, Pais Origem,
 * Fabricante etc.) e os status tabs (Rascunho, Aberto, Em Andamento,
 * Aprovado, Transferido, Consolidado, Cancelado).
 *
 * Quando o backend estiver pronto, trocar MOCK_PEDIDOS por chamadas
 * aos endpoints reais (filtrando por processo_id).
 */

import React, { useState, useMemo, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { Package, Plus, Eye, PencilSimple, X } from '@phosphor-icons/react'
import { PaginaGlobal } from '@nucleo/pagina-global'
import { CabecalhoGlobal } from '@nucleo/cabecalho-global'
import { TabelaVirtualGlobal } from '@nucleo/tabela-virtual-global'
import type {
  GTColuna,
  GTAcao,
  GTAcaoLote,
  GTAcaoExport,
  GTAbaTipo,
} from '@nucleo/tabela-virtual-global'
import { BotaoGlobal } from '@nucleo/botao-global'
import { PedidosTabs } from './PedidosTabs'

// ── Tipo Mock (campos visuais da lista, sem contrato de banco ainda) ────────

type MockStatus =
  | 'rascunho'
  | 'aberto'
  | 'em_andamento'
  | 'aprovado'
  | 'transferido'
  | 'consolidado'
  | 'cancelado'

type MockTipoOperacao = 'importacao' | 'exportacao'

interface MockPedido {
  id: string
  numero: string
  tipo_operacao: MockTipoOperacao
  status: MockStatus
  workspace: string
  importador: string
  exportador: string
  ref_importador: string
  ref_exportador: string
  incoterm: string
  porto_origem: string
  porto_destino: string
  pais_origem: string
  fabricante: string
  valor_fob: number
  moeda: string
  peso_bruto: number
  created_at: string
}

interface MockItem {
  id: string
  pedido_id: string
  numero_item: string
  descricao: string
  ncm: string
  quantidade: number
  unidade: string
  valor_unitario: number
  valor_total: number
}

// ── Mock data ───────────────────────────────────────────────────────────────

const MOCK_STATUS_LIST: { nome: MockStatus; rotulo: string; cor: string }[] = [
  { nome: 'rascunho',     rotulo: 'Rascunho',     cor: '#94a3b8' },
  { nome: 'aberto',       rotulo: 'Aberto',       cor: '#22d3ee' },
  { nome: 'em_andamento', rotulo: 'Em Andamento', cor: '#a78bfa' },
  { nome: 'aprovado',     rotulo: 'Aprovado',     cor: '#34d399' },
  { nome: 'transferido',  rotulo: 'Transferido',  cor: '#818cf8' },
  { nome: 'consolidado',  rotulo: 'Consolidado',  cor: '#facc15' },
  { nome: 'cancelado',    rotulo: 'Cancelado',    cor: '#f87171' },
]

const MOCK_PEDIDOS: MockPedido[] = [
  { id: 'p1',  numero: 'PO-2026-001', tipo_operacao: 'importacao', status: 'em_andamento', workspace: 'CDE Comex',     importador: 'Acme Importações Ltda.',     exportador: 'Shanghai Electronics Co.', ref_importador: 'RC-4821', ref_exportador: 'SH-2026-A1', incoterm: 'CIF', porto_origem: 'Shanghai',     porto_destino: 'Santos',   pais_origem: 'CN', fabricante: 'Shanghai Electronics', valor_fob: 68_400, moeda: 'USD', peso_bruto: 12_300, created_at: '2026-01-15T00:00:00Z' },
  { id: 'p2',  numero: 'PO-2026-002', tipo_operacao: 'importacao', status: 'aprovado',    workspace: 'CDE Comex',     importador: 'Acme Importações Ltda.',     exportador: 'Shanghai Electronics Co.', ref_importador: 'RC-4822', ref_exportador: 'SH-2026-A2', incoterm: 'CIF', porto_origem: 'Shanghai',     porto_destino: 'Santos',   pais_origem: 'CN', fabricante: 'Shanghai Electronics', valor_fob: 32_650, moeda: 'USD', peso_bruto:  5_200, created_at: '2026-01-22T00:00:00Z' },
  { id: 'p3',  numero: 'PO-2026-003', tipo_operacao: 'importacao', status: 'rascunho',    workspace: 'CDE Comex',     importador: 'Acme Importações Ltda.',     exportador: 'Shanghai Electronics Co.', ref_importador: 'RC-4823', ref_exportador: 'SH-2026-A3', incoterm: 'EXW', porto_origem: 'Shanghai',     porto_destino: 'Santos',   pais_origem: 'CN', fabricante: 'Shanghai Electronics', valor_fob:  7_000, moeda: 'USD', peso_bruto:  1_271, created_at: '2026-02-05T00:00:00Z' },
  { id: 'p4',  numero: 'PO-2026-004', tipo_operacao: 'importacao', status: 'aberto',      workspace: 'JLK Exportador', importador: 'Beta Trading S/A',           exportador: 'Hamburg Components GmbH',  ref_importador: 'BTR-1500', ref_exportador: 'HC-26-77',   incoterm: 'FOB', porto_origem: 'Hamburg',      porto_destino: 'Itajaí',   pais_origem: 'DE', fabricante: 'Hamburg Components',   valor_fob: 142_800, moeda: 'EUR', peso_bruto: 24_500, created_at: '2026-02-10T00:00:00Z' },
  { id: 'p5',  numero: 'PO-2026-005', tipo_operacao: 'exportacao', status: 'em_andamento', workspace: 'JLK Exportador', importador: 'Latin Coffee Inc.',          exportador: 'Cooperativa Cerrado Brasil', ref_importador: 'LC-44',    ref_exportador: 'COOP-2026-005', incoterm: 'FOB', porto_origem: 'Santos',       porto_destino: 'New York', pais_origem: 'BR', fabricante: 'Coop. Cerrado',       valor_fob:  88_000, moeda: 'USD', peso_bruto: 18_400, created_at: '2026-02-12T00:00:00Z' },
  { id: 'p6',  numero: 'PO-2026-006', tipo_operacao: 'importacao', status: 'consolidado', workspace: 'CDE Comex',     importador: 'Acme Importações Ltda.',     exportador: 'Yiwu Trading Co.',          ref_importador: 'RC-4824', ref_exportador: 'YW-2026-09',  incoterm: 'CIF', porto_origem: 'Ningbo',       porto_destino: 'Santos',   pais_origem: 'CN', fabricante: 'Yiwu Industrial',     valor_fob:  21_500, moeda: 'USD', peso_bruto:  3_800, created_at: '2026-02-18T00:00:00Z' },
  { id: 'p7',  numero: 'PO-2026-007', tipo_operacao: 'importacao', status: 'transferido', workspace: 'CDE Comex',     importador: 'Acme Importações Ltda.',     exportador: 'Tokyo Precision Co.',       ref_importador: 'RC-4825', ref_exportador: 'TP-26-01',    incoterm: 'CFR', porto_origem: 'Tokyo',        porto_destino: 'Santos',   pais_origem: 'JP', fabricante: 'Tokyo Precision',     valor_fob:  56_200, moeda: 'JPY', peso_bruto:  9_100, created_at: '2026-02-20T00:00:00Z' },
  { id: 'p8',  numero: 'PO-2026-008', tipo_operacao: 'importacao', status: 'aprovado',    workspace: 'JLK Exportador', importador: 'Beta Trading S/A',           exportador: 'Seoul Tech Industries',     ref_importador: 'BTR-1501', ref_exportador: 'STI-2026-12', incoterm: 'FOB', porto_origem: 'Busan',        porto_destino: 'Itajaí',   pais_origem: 'KR', fabricante: 'Seoul Tech',          valor_fob:  74_900, moeda: 'USD', peso_bruto: 11_700, created_at: '2026-02-22T00:00:00Z' },
  { id: 'p9',  numero: 'PO-2026-009', tipo_operacao: 'exportacao', status: 'em_andamento', workspace: 'JLK Exportador', importador: 'European Distribution BV',    exportador: 'Acme Mineração Ltda.',       ref_importador: 'EUD-200',  ref_exportador: 'AM-2026-009', incoterm: 'CIF', porto_origem: 'Paranaguá',    porto_destino: 'Rotterdam', pais_origem: 'BR', fabricante: 'Acme Mineração',      valor_fob: 215_300, moeda: 'EUR', peso_bruto: 48_200, created_at: '2026-02-25T00:00:00Z' },
  { id: 'p10', numero: 'PO-2026-010', tipo_operacao: 'importacao', status: 'aberto',      workspace: 'CDE Comex',     importador: 'Acme Importações Ltda.',     exportador: 'Vietnam Garment Co.',       ref_importador: 'RC-4826', ref_exportador: 'VG-2026-08',  incoterm: 'FOB', porto_origem: 'Ho Chi Minh', porto_destino: 'Santos',   pais_origem: 'VN', fabricante: 'Vietnam Garment',     valor_fob:  12_300, moeda: 'USD', peso_bruto:  2_400, created_at: '2026-03-01T00:00:00Z' },
  { id: 'p11', numero: 'PO-2026-011', tipo_operacao: 'importacao', status: 'cancelado',   workspace: 'CDE Comex',     importador: 'Acme Importações Ltda.',     exportador: 'Mumbai Pharma Pvt Ltd.',     ref_importador: 'RC-4827', ref_exportador: 'MP-26-A',     incoterm: 'CIP', porto_origem: 'Mumbai',       porto_destino: 'Santos',   pais_origem: 'IN', fabricante: 'Mumbai Pharma',       valor_fob:   4_800, moeda: 'USD', peso_bruto:    320, created_at: '2026-03-03T00:00:00Z' },
  { id: 'p12', numero: 'PO-2026-012', tipo_operacao: 'importacao', status: 'em_andamento', workspace: 'CDE Comex',     importador: 'Acme Importações Ltda.',     exportador: 'Antwerp Chemicals NV',       ref_importador: 'RC-4828', ref_exportador: 'AC-2026-44', incoterm: 'CIF', porto_origem: 'Antwerp',      porto_destino: 'Santos',   pais_origem: 'BE', fabricante: 'Antwerp Chemicals',   valor_fob: 168_500, moeda: 'EUR', peso_bruto: 32_100, created_at: '2026-03-05T00:00:00Z' },
]

const MOCK_ITENS: Record<string, MockItem[]> = {
  p1: [
    { id: 'p1-1', pedido_id: 'p1', numero_item: '1', descricao: 'Roteador 5G dual-band — modelo R-2400', ncm: '8517.62.99', quantidade: 200, unidade: 'UN', valor_unitario: 215.00, valor_total: 43_000 },
    { id: 'p1-2', pedido_id: 'p1', numero_item: '2', descricao: 'Antena setorial 3.5GHz — modelo A-SEC35', ncm: '8517.62.99', quantidade: 100, unidade: 'UN', valor_unitario: 180.00, valor_total: 18_000 },
    { id: 'p1-3', pedido_id: 'p1', numero_item: '3', descricao: 'Cabo coaxial RG-58 — bobina 100m', ncm: '8544.49.00', quantidade:  80, unidade: 'UN', valor_unitario:  92.50, valor_total:  7_400 },
  ],
  p2: [
    { id: 'p2-1', pedido_id: 'p2', numero_item: '1', descricao: 'Fonte de alimentação 48V/10A', ncm: '8504.40.90', quantidade: 150, unidade: 'UN', valor_unitario: 145.00, valor_total: 21_750 },
    { id: 'p2-2', pedido_id: 'p2', numero_item: '2', descricao: 'Suporte de fixação para torre', ncm: '7308.30.00', quantidade:  80, unidade: 'UN', valor_unitario:  95.00, valor_total:  7_600 },
  ],
}

// ── Helpers ────────────────────────────────────────────────────────────────

const fmtMoney = (val: number, moeda = 'USD') =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: moeda }).format(val)

const fmtPeso = (val: number) =>
  `${val.toLocaleString('pt-BR', { maximumFractionDigits: 0 })} kg`

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString('pt-BR')

const PEDIDO_PORT = import.meta.env.VITE_PEDIDO_PORT
  ?? (typeof window !== 'undefined' ? window.location.port : '')

function abrirPedido(pedidoId: string, modo: 'ver' | 'editar') {
  const path = modo === 'editar'
    ? `/pedido/pedidos/${pedidoId}/editar`
    : `/pedido/pedidos/${pedidoId}`
  const portSuffix = PEDIDO_PORT ? `:${PEDIDO_PORT}` : ''
  const url = `${window.location.protocol}//${window.location.hostname}${portSuffix}${path}`
  window.open(url, '_blank', 'noopener,noreferrer')
}

// ── Componente ──────────────────────────────────────────────────────────────

export default function PedidosLista() {
  const { t } = useTranslation()
  const [abaAtiva, setAbaAtiva] = useState<string>('todos')
  const [busca, setBusca] = useState('')
  const [sortCampo, setSortCampo] = useState('numero')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')

  // ── Filtragem client-side sobre MOCK_PEDIDOS ─────────────────────────────

  const pedidosFiltrados = useMemo<MockPedido[]>(() => {
    let arr = MOCK_PEDIDOS
    if (abaAtiva !== 'todos') {
      arr = arr.filter(p => p.status === abaAtiva)
    }
    if (busca.trim()) {
      const q = busca.trim().toLowerCase()
      arr = arr.filter(p =>
        p.numero.toLowerCase().includes(q) ||
        p.importador.toLowerCase().includes(q) ||
        p.exportador.toLowerCase().includes(q) ||
        p.ref_importador.toLowerCase().includes(q)
      )
    }
    arr = [...arr].sort((a, b) => {
      const va = (a as unknown as Record<string, unknown>)[sortCampo] as string | number
      const vb = (b as unknown as Record<string, unknown>)[sortCampo] as string | number
      if (va == null || vb == null) return 0
      if (va < vb) return sortDir === 'asc' ? -1 : 1
      if (va > vb) return sortDir === 'asc' ? 1 : -1
      return 0
    })
    return arr
  }, [abaAtiva, busca, sortCampo, sortDir])

  const carregarItens = useCallback(
    (pedido: MockPedido): Promise<MockItem[]> =>
      Promise.resolve(MOCK_ITENS[pedido.id] ?? []),
    []
  )

  // ── Abas (status tabs) ───────────────────────────────────────────────────

  const abas: GTAbaTipo[] = [
    { valor: 'todos', label: 'Todos' },
    ...MOCK_STATUS_LIST.map(s => ({ valor: s.nome, label: s.rotulo, cor: s.cor })),
  ]

  // ── Colunas pai (lista de pedidos) — espelha /pedido/pedidos/lista ───────

  const colunasPai: GTColuna<MockPedido>[] = [
    { key: 'numero',          label: 'Nº Pedido',          sortavel: true, naoOcultavel: true,
      tooltipTitulo: 'Número do Pedido',
      tooltipDescricao: 'Identificador único do pedido de compra' },
    { key: 'tipo_operacao',   label: 'Tipo de Operação',
      tooltipTitulo: 'Tipo de Operação',
      tooltipDescricao: 'Importação ou Exportação',
      render: (_v, row) => {
        const isImp = row.tipo_operacao === 'importacao'
        const color = isImp ? '#22d3ee' : '#a78bfa'
        const label = isImp ? 'Importação' : 'Exportação'
        return (
          <span style={{
            display: 'inline-flex', alignItems: 'center',
            padding: '0.125rem 0.5rem', borderRadius: '9999px',
            fontSize: '0.6875rem', fontWeight: 700, textTransform: 'uppercase',
            background: `${color}22`, color, border: `1px solid ${color}44`,
          }}>{label}</span>
        )
      },
    },
    { key: 'status',          label: 'Status',
      tooltipTitulo: 'Status do Pedido',
      tooltipDescricao: 'Situação atual do pedido dentro do fluxo',
      render: (_v, row) => {
        const cfg = MOCK_STATUS_LIST.find(s => s.nome === row.status)
        const cor = cfg?.cor ?? '#94a3b8'
        return (
          <span style={{
            display: 'inline-flex', alignItems: 'center',
            padding: '0.125rem 0.5rem', borderRadius: '9999px',
            fontSize: '0.6875rem', fontWeight: 700, textTransform: 'uppercase',
            background: `${cor}22`, color: cor, border: `1px solid ${cor}44`,
          }}>{cfg?.rotulo ?? row.status}</span>
        )
      },
    },
    { key: 'workspace',       label: 'Workspace',       sortavel: true },
    { key: 'importador',      label: 'Importador',      sortavel: true },
    { key: 'exportador',      label: 'Exportador',      sortavel: true },
    { key: 'ref_importador',  label: 'Ref. Importador' },
    { key: 'ref_exportador',  label: 'Ref. Exportador' },
    { key: 'incoterm',        label: 'Incoterm' },
    { key: 'porto_origem',    label: 'Porto de Origem' },
    { key: 'porto_destino',   label: 'Porto de Destino' },
    { key: 'pais_origem',     label: 'País Origem' },
    { key: 'fabricante',      label: 'Fabricante' },
    { key: 'valor_fob',       label: 'Valor FOB', align: 'right', sortavel: true,
      render: (_v, row) => <span>{fmtMoney(row.valor_fob, row.moeda)}</span> },
    { key: 'moeda',           label: 'Moeda' },
    { key: 'peso_bruto',      label: 'Peso Bruto', align: 'right', sortavel: true,
      render: (_v, row) => <span>{fmtPeso(row.peso_bruto)}</span> },
    { key: 'created_at',      label: 'Data',     sortavel: true,
      render: (_v, row) => <span>{fmtDate(row.created_at)}</span> },
  ]

  // ── Colunas filhas (itens do pedido) ─────────────────────────────────────

  const colunasFilha: GTColuna<MockItem>[] = [
    { key: 'numero_item',     label: 'Nº Item' },
    { key: 'descricao',       label: 'Descrição' },
    { key: 'ncm',             label: 'NCM' },
    { key: 'quantidade',      label: 'Qtd.', align: 'right' },
    { key: 'unidade',         label: 'Unid.' },
    { key: 'valor_unitario',  label: 'Vlr. Unit.', align: 'right',
      render: (_v, row) => <span>{fmtMoney(row.valor_unitario)}</span> },
    { key: 'valor_total',     label: 'Vlr. Total', align: 'right',
      render: (_v, row) => <span>{fmtMoney(row.valor_total)}</span> },
  ]

  // ── Ações ───────────────────────────────────────────────────────────────

  const acoes: GTAcao<MockPedido>[] = [
    { id: 'ver',     tooltip: 'Ver no produto Pedido',    icone: <Eye          size={16} weight="duotone" />,
      onClick: (row) => abrirPedido(row.id, 'ver') },
    { id: 'editar',  tooltip: 'Editar no produto Pedido', icone: <PencilSimple size={16} weight="duotone" />,
      onClick: (row) => abrirPedido(row.id, 'editar') },
    { id: 'cancelar', tooltip: 'Cancelar pedido', icone: <X size={16} weight="duotone" />, variant: 'danger',
      visivel: (row) => row.status !== 'cancelado',
      onClick: () => { /* TODO modal de confirmacao */ } },
  ]

  const acoesLote: GTAcaoLote<MockPedido>[] = [
    { id: 'cancelar_lote', label: 'Cancelar selecionados', variant: 'danger',
      onClick: () => { /* TODO */ } },
  ]

  const acoesExportacao: GTAcaoExport[] = [
    { label: 'CSV',   onClick: () => { /* TODO */ } },
    { label: 'Excel', onClick: () => { /* TODO */ } },
  ]

  // ── Render ───────────────────────────────────────────────────────────────

  return (
    <PaginaGlobal
      className="ws-fade-up"
      layout="lista"
      cabecalho={
        <CabecalhoGlobal
          icone={<Package weight="duotone" size={22} />}
          titulo={t('processo.pedidos.titulo', 'Pedidos')}
          subtitulo={t('processo.pedidos.subtitulo', 'Pedidos de compra vinculados a este processo')}
        />
      }
    >
      <PedidosTabs />
      {/* PaginaGlobal.pg-conteudo-area NAO usa flex — entao `flex:1` aqui
          colapsa pra 0. Uso min-height pra garantir altura visivel
          (virtual scrolling precisa de altura explicita do parent). */}
      <div style={{ minHeight: 'calc(100vh - 260px)', display: 'flex', flexDirection: 'column' }}>
        <TabelaVirtualGlobal<MockPedido, MockItem>
          exibirCabecalhoQuandoVazio
          dados={pedidosFiltrados}
          colunas={colunasPai}
          itemId={(p) => p.id}
          colunasFilhas={colunasFilha}
          onCarregarFilhos={carregarItens}
          filhoId={(filho) => filho.id}
          itensPorPagina={50}
          abas={abas}
          abaAtiva={abaAtiva}
          onMudarAba={setAbaAtiva}
          acoes={acoes}
          acoesLote={acoesLote}
          acoesExportacao={acoesExportacao}
          acoesBarra={
            <BotaoGlobal variante="primario" icone={<Plus size={16} />}>
              Novo Pedido
            </BotaoGlobal>
          }
          onBuscar={setBusca}
          placeholderBusca="Buscar pedidos..."
          onOrdenar={(campo, dir) => { setSortCampo(campo); setSortDir(dir) }}
          sortCampo={sortCampo}
          sortDir={sortDir}
          carregando={false}
          emptyIcon={<Package weight="duotone" size={48} />}
          emptyTitle="Nenhum pedido encontrado"
          emptyDescription="Ajuste os filtros ou crie um novo pedido"
          ariaLabel="Tabela de pedidos de compra"
        />
      </div>
    </PaginaGlobal>
  )
}
