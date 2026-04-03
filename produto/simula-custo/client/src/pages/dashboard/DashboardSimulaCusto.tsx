/**
 * DashboardSimulaCusto.tsx — Visão Dashboard (padrão Gravity)
 * Produto: SimulaCusto
 *
 * Mesmo padrão do EstimativasDashboard:
 *   CardBasicoGlobal × 4  → KPIs
 *   TabelaVirtualGlobal   → lista de estimativas com abas, export, DnD, preferências
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { PaginaGlobal } from '@nucleo/pagina-global'
import { CabecalhoGlobal } from '@nucleo/cabecalho-global'
import { CardBasicoGlobal, CardGraficoGlobal } from '@nucleo/card-global'
import { TabelaVirtualGlobal } from '@nucleo/tabela-virtual-global'
import type {
  GTColuna,
  GTAcao,
  GTAcaoExport,
  GTAbaTipo,
  GTPreferencias,
} from '@nucleo/tabela-virtual-global'
import {
  exportarExcel,
  exportarCSV,
  exportarTXT,
  exportarXML,
  exportarJSON,
} from '@nucleo/export-utils'
import type { ColunasExport } from '@nucleo/export-utils'
import { SeletorVisualizacao } from '@nucleo/view-toggle-global'
import type { ViewMode } from '@nucleo/view-toggle-global'
import { BotaoGlobal } from '@nucleo/botao-global'
import {
  ChartBar,
  Plus,
  Eye,
  CopySimple,
  Archive,
  Calculator,
  ChartPieSlice,
  TrendUp,
  CurrencyDollar,
  FileXls,
  FileCsv,
  FileText,
  FileCode,
  Code,
} from '@phosphor-icons/react'
import { getEstimativas, getEstimativasKpis, duplicarEstimativa, atualizarStatusEstimativa } from '../../shared/api'
import type { Estimativa, EstimativasKpis, EstimativaStatus } from '../../shared/types'
import { STATUS_LABELS, STATUS_BADGE, OPERACAO_LABELS } from '../../shared/types'
import './DashboardSimulaCusto.css'

// ─── Constantes ───────────────────────────────────────────────────────────────

const PREFS_KEY = 'sc-dashboard-prefs'

const brl = (val: number | null) =>
  val != null
    ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val)
    : '—'

const dataBR = (iso: string) =>
  new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })

function loadPrefs(keys: string[]): GTPreferencias {
  try {
    const raw = localStorage.getItem(PREFS_KEY)
    if (raw) return JSON.parse(raw) as GTPreferencias
  } catch { /* ignore */ }
  return { colunas_visiveis: keys }
}

// ─── Colunas da tabela ────────────────────────────────────────────────────────

const COLUNAS: GTColuna<Estimativa>[] = [
  {
    key: 'numero',
    label: 'Número',
    tipo: 'texto',
    naoOcultavel: true,
    sortavel: true,
    render: (val) => <span className="sc-db-mono">{String(val)}</span>,
  },
  {
    key: 'status',
    label: 'Status',
    tipo: 'badge',
    filtravel: true,
    render: (val) => {
      const s = val as EstimativaStatus
      return <span className={`sc-db-badge sc-db-badge--${STATUS_BADGE[s]}`}>{STATUS_LABELS[s]}</span>
    },
  },
  {
    key: 'operacao',
    label: 'Operação',
    tipo: 'texto',
    filtravel: true,
    render: (val) => OPERACAO_LABELS[val as keyof typeof OPERACAO_LABELS] ?? String(val),
  },
  {
    key: 'ncm',
    label: 'NCM',
    tipo: 'texto',
    render: (val) => <span className="sc-db-mono-neutro">{String(val)}</span>,
  },
  {
    key: 'referencia',
    label: 'Referência',
    tipo: 'texto',
    render: (val) => (val != null ? String(val) : '—'),
  },
  {
    key: 'landed_cost_brl',
    label: 'Landed Cost',
    tipo: 'numero',
    align: 'right',
    sortavel: true,
    render: (val) => {
      const n = val as number | null
      return n != null
        ? <span className="sc-db-valor-destaque">{brl(n)}</span>
        : <span className="sc-db-valor-vazio">—</span>
    },
  },
  {
    key: 'total_tributos',
    label: 'Tributos',
    tipo: 'numero',
    align: 'right',
    render: (val) => brl(val as number | null),
  },
  {
    key: 'data_geracao',
    label: 'Data',
    tipo: 'periodo',
    sortavel: true,
    render: (val) => dataBR(String(val)),
  },
]

const COLUNAS_EXPORT: ColunasExport[] = [
  { header: 'Número',      key: 'numero' },
  { header: 'Status',      key: 'status' },
  { header: 'Operação',    key: 'operacao' },
  { header: 'NCM',         key: 'ncm' },
  { header: 'Referência',  key: 'referencia' },
  { header: 'Landed Cost', key: 'landed_cost_brl' },
  { header: 'Tributos',    key: 'total_tributos' },
  { header: 'Data',        key: 'data_geracao' },
]

// ─── Componente Principal ─────────────────────────────────────────────────────

export default function DashboardSimulaCusto() {
  const navigate = useNavigate()

  const [estimativas, setEstimativas] = useState<Estimativa[]>([])
  const [kpis, setKpis] = useState<EstimativasKpis>({
    total: 0, em_criacao: 0, criadas: 0, arquivadas: 0,
    landed_cost_medio: 0, total_tributos_acumulado: 0,
  })
  const [abaAtiva, setAbaAtiva]     = useState('TODAS')
  const [busca, setBusca]           = useState('')
  const [carregando, setCarregando] = useState(true)
  const [preferencias, setPreferencias] = useState<GTPreferencias>(
    () => loadPrefs(COLUNAS.map(c => c.key))
  )

  // ─── Dados ─────────────────────────────────────────────────────────────────

  const carregar = useCallback(async () => {
    setCarregando(true)
    try {
      const status = abaAtiva === 'TODAS' ? undefined : abaAtiva as EstimativaStatus
      const [listRes, kpisRes] = await Promise.all([
        getEstimativas({ status }),
        getEstimativasKpis(),
      ])
      setEstimativas(listRes.data)
      setKpis(kpisRes)
    } catch {
      setEstimativas([])
    } finally {
      setCarregando(false)
    }
  }, [abaAtiva])

  useEffect(() => { carregar() }, [carregar])

  // ─── Filtro client-side ─────────────────────────────────────────────────────

  const dadosFiltrados = useMemo(() => {
    if (!busca.trim()) return estimativas
    const q = busca.toLowerCase()
    return estimativas.filter(e =>
      e.numero.toLowerCase().includes(q) ||
      (e.referencia ?? '').toLowerCase().includes(q) ||
      e.ncm.toLowerCase().includes(q)
    )
  }, [estimativas, busca])

  // ─── Abas ──────────────────────────────────────────────────────────────────

  const abas: GTAbaTipo[] = useMemo(() => [
    { valor: 'TODAS',      label: 'Todas',      contagem: kpis.total },
    { valor: 'EM_CRIACAO', label: 'Em Criação', contagem: kpis.em_criacao },
    { valor: 'CRIADA',     label: 'Criadas',    contagem: kpis.criadas },
    { valor: 'ARQUIVADA',  label: 'Arquivadas', contagem: kpis.arquivadas },
  ], [kpis])

  // ─── Ações de linha ─────────────────────────────────────────────────────────

  const acoes: GTAcao<Estimativa>[] = useMemo(() => [
    {
      id: 'ver',
      icone: <Eye weight="duotone" size={16} />,
      tooltip: 'Ver detalhes',
      onClick: (item) => navigate(`/estimativas/${item.id}`),
    },
    {
      id: 'duplicar',
      icone: <CopySimple weight="duotone" size={16} />,
      tooltip: 'Duplicar',
      onClick: async (item) => { await duplicarEstimativa(item.id); carregar() },
    },
    {
      id: 'arquivar',
      icone: <Archive weight="duotone" size={16} />,
      tooltip: 'Arquivar',
      visivel: (item) => item.status !== 'ARQUIVADA',
      onClick: async (item) => { await atualizarStatusEstimativa(item.id, 'ARQUIVADA'); carregar() },
    },
  ], [navigate, carregar])

  // ─── Exportação ────────────────────────────────────────────────────────────

  const acoesExportacao: GTAcaoExport[] = useMemo(() => {
    const dados = dadosFiltrados as unknown as Record<string, unknown>[]
    return [
      { label: 'Excel (.xlsx)', icone: <FileXls weight="duotone" size={16} />,  onClick: () => exportarExcel(dados, COLUNAS_EXPORT, { nomeArquivo: 'estimativas' }) },
      { label: 'CSV',           icone: <FileCsv weight="duotone" size={16} />,  onClick: () => exportarCSV(dados, COLUNAS_EXPORT, { nomeArquivo: 'estimativas' }) },
      { label: 'TXT',           icone: <FileText weight="duotone" size={16} />, onClick: () => exportarTXT(dados, COLUNAS_EXPORT, { nomeArquivo: 'estimativas' }) },
      { label: 'XML',           icone: <FileCode weight="duotone" size={16} />, onClick: () => exportarXML(dados, COLUNAS_EXPORT, { nomeArquivo: 'estimativas' }) },
      { label: 'JSON',          icone: <Code weight="duotone" size={16} />, onClick: () => exportarJSON(dados, COLUNAS_EXPORT, { nomeArquivo: 'estimativas' }) },
    ]
  }, [dadosFiltrados])

  // ─── Preferências ──────────────────────────────────────────────────────────

  const handleSalvarPreferencias = useCallback((prefs: GTPreferencias) => {
    setPreferencias(prefs)
    localStorage.setItem(PREFS_KEY, JSON.stringify(prefs))
  }, [])

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <PaginaGlobal
      cabecalho={
        <CabecalhoGlobal
          icone={<ChartBar weight="duotone" size={22} />}
          titulo="Dashboard"
          subtitulo="Simulações de custo de importação e exportação"
          viewToggle={
            <SeletorVisualizacao
              view="dashboard"
              onChange={(v: ViewMode) => { if (v === 'lista') navigate('/estimativas') }}
            />
          }
          acoes={
            <BotaoGlobal
              variante="primario"
              tamanho="pequeno"
              icone={<Plus weight="bold" />}
              onClick={() => navigate('/estimativas/nova')}
            >
              Nova Estimativa
            </BotaoGlobal>
          }
        />
      }
    >
      <div className="sc-db-page">

        {/* ── KPI Cards ─────────────────────────────────────── */}
        <div className="sc-db-cards">
          <CardBasicoGlobal
            icone={<Calculator weight="duotone" size={20} />}
            titulo="Total"
            valor={kpis.total}
          />
          <CardBasicoGlobal
            icone={<TrendUp weight="duotone" size={20} />}
            titulo="Em Criação"
            valor={kpis.em_criacao}
            variante="aviso"
          />
          <CardBasicoGlobal
            icone={<ChartPieSlice weight="duotone" size={20} />}
            titulo="Criadas"
            valor={kpis.criadas}
            variante="sucesso"
          />
          <CardBasicoGlobal
            icone={<CurrencyDollar weight="duotone" size={20} />}
            titulo="Landed Cost Médio"
            valor={brl(kpis.landed_cost_medio)}
            variante="sucesso"
          />
        </div>

        {/* ── Tabela Virtualizada ────────────────────────────── */}
        <div className="sc-db-tabela">
          <TabelaVirtualGlobal<Estimativa>
            dados={dadosFiltrados}
            colunas={COLUNAS}
            itemId={(item) => item.id}
            carregando={carregando}
            abas={abas}
            abaAtiva={abaAtiva}
            onMudarAba={setAbaAtiva}
            acoes={acoes}
            acoesExportacao={acoesExportacao}
            preferencias={preferencias}
            onSalvarPreferencias={handleSalvarPreferencias}
            onBuscar={setBusca}
            placeholderBusca="Buscar por número, NCM, referência..."
            emptyTitle="Nenhuma estimativa encontrada"
            emptyDescription="Crie sua primeira estimativa de custo de importação."
            ariaLabel="Tabela de estimativas"
          />
        </div>

      </div>
    </PaginaGlobal>
  )
}
