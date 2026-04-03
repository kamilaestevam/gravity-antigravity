/**
 * EstimativasDashboard.tsx — Tela de lista padrão Gravity
 * Produto: SimulaCusto
 *
 * Padrão canônico de tela de lista:
 *   CardBasicoGlobal × 4 → KPIs
 *   TabelaVirtualGlobal  → tabela completa (abas, export, DnD, preferências)
 *
 * Preferências de coluna: localStorage (sem backend).
 * Exportação: @nucleo/export-utils (5 formatos).
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { PaginaGlobal } from '@nucleo/pagina-global'
import { CabecalhoGlobal } from '@nucleo/cabecalho-global'
import { CardBasicoGlobal } from '@nucleo/card-global'
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
import {
  Calculator,
  Plus,
  Eye,
  CopySimple,
  Archive,
  ChartBar,
  ClockCountdown,
  CheckCircle,
  CurrencyDollar,
  FileXls,
  FileCsv,
  FileText,
  FileCode,
  Brackets,
} from '@phosphor-icons/react'
import { getEstimativas, getEstimativasKpis, duplicarEstimativa, atualizarStatusEstimativa } from '../../shared/api'
import type { Estimativa, EstimativasKpis, EstimativaStatus } from '../../shared/types'
import { STATUS_LABELS, STATUS_BADGE, OPERACAO_LABELS } from '../../shared/types'
import './EstimativasDashboard.css'

// ─── Constantes ───────────────────────────────────────────────────────────────

const PREFS_KEY = 'sc-estimativas-prefs'

const brl = (val: number | null) =>
  val != null
    ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val)
    : '—'

const dataBR = (iso: string) =>
  new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })

// ─── Colunas da tabela ────────────────────────────────────────────────────────

const COLUNAS: GTColuna<Estimativa>[] = [
  {
    key: 'numero',
    label: 'Número',
    tipo: 'texto',
    naoOcultavel: true,
    sortavel: true,
    render: (val) => <span className="sc-est-mono">{String(val)}</span>,
  },
  {
    key: 'status',
    label: 'Status',
    tipo: 'badge',
    filtravel: true,
    render: (val) => {
      const s = val as EstimativaStatus
      const variante = STATUS_BADGE[s]
      return (
        <span className={`sc-est-badge sc-est-badge--${variante}`}>
          {STATUS_LABELS[s]}
        </span>
      )
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
    render: (val) => <span className="sc-est-mono-neutro">{String(val)}</span>,
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
        ? <span className="sc-est-valor-destaque">{brl(n)}</span>
        : <span className="sc-est-valor-vazio">—</span>
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

// ─── Colunas de exportação ────────────────────────────────────────────────────

const COLUNAS_EXPORT: ColunasExport[] = [
  { header: 'Número',       key: 'numero' },
  { header: 'Status',       key: 'status' },
  { header: 'Operação',     key: 'operacao' },
  { header: 'NCM',          key: 'ncm' },
  { header: 'Referência',   key: 'referencia' },
  { header: 'Landed Cost',  key: 'landed_cost_brl' },
  { header: 'Tributos',     key: 'total_tributos' },
  { header: 'Data',         key: 'data_geracao' },
]

// ─── Preferências ─────────────────────────────────────────────────────────────

function loadPrefs(): GTPreferencias {
  try {
    const raw = localStorage.getItem(PREFS_KEY)
    if (raw) return JSON.parse(raw) as GTPreferencias
  } catch { /* ignore */ }
  return { colunas_visiveis: COLUNAS.map(c => c.key) }
}

// ─── Componente Principal ─────────────────────────────────────────────────────

export default function EstimativasDashboard() {
  const navigate = useNavigate()

  const [estimativas, setEstimativas] = useState<Estimativa[]>([])
  const [kpis, setKpis] = useState<EstimativasKpis>({
    total: 0, em_criacao: 0, criadas: 0, arquivadas: 0,
    landed_cost_medio: 0, total_tributos_acumulado: 0,
  })
  const [abaAtiva, setAbaAtiva] = useState<string>('TODAS')
  const [busca, setBusca] = useState('')
  const [carregando, setCarregando] = useState(true)
  const [preferencias, setPreferencias] = useState<GTPreferencias>(loadPrefs)

  // ─── Carregar dados ──────────────────────────────────────────────────────

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

  // ─── Filtragem client-side por busca ─────────────────────────────────────

  const dadosFiltrados = useMemo(() => {
    if (!busca.trim()) return estimativas
    const termo = busca.toLowerCase()
    return estimativas.filter(e =>
      e.numero.toLowerCase().includes(termo) ||
      (e.referencia ?? '').toLowerCase().includes(termo) ||
      e.ncm.toLowerCase().includes(termo) ||
      STATUS_LABELS[e.status].toLowerCase().includes(termo) ||
      OPERACAO_LABELS[e.operacao].toLowerCase().includes(termo)
    )
  }, [estimativas, busca])

  // ─── Ações de linha ──────────────────────────────────────────────────────

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
      tooltip: 'Duplicar estimativa',
      onClick: async (item) => {
        await duplicarEstimativa(item.id)
        carregar()
      },
    },
    {
      id: 'arquivar',
      icone: <Archive weight="duotone" size={16} />,
      tooltip: 'Arquivar',
      visivel: (item) => item.status !== 'ARQUIVADA',
      onClick: async (item) => {
        await atualizarStatusEstimativa(item.id, 'ARQUIVADA')
        carregar()
      },
    },
  ], [navigate, carregar])

  // ─── Exportação ──────────────────────────────────────────────────────────

  const acoesExportacao: GTAcaoExport[] = useMemo(() => {
    const dados = dadosFiltrados as unknown as Record<string, unknown>[]
    return [
      {
        label: 'Excel (.xlsx)',
        icone: <FileXls weight="duotone" size={16} />,
        onClick: () => exportarExcel(dados, COLUNAS_EXPORT, { nomeArquivo: 'estimativas', titulo: 'Estimativas' }),
      },
      {
        label: 'CSV',
        icone: <FileCsv weight="duotone" size={16} />,
        onClick: () => exportarCSV(dados, COLUNAS_EXPORT, { nomeArquivo: 'estimativas' }),
      },
      {
        label: 'TXT',
        icone: <FileText weight="duotone" size={16} />,
        onClick: () => exportarTXT(dados, COLUNAS_EXPORT, { nomeArquivo: 'estimativas' }),
      },
      {
        label: 'XML',
        icone: <FileCode weight="duotone" size={16} />,
        onClick: () => exportarXML(dados, COLUNAS_EXPORT, { nomeArquivo: 'estimativas' }),
      },
      {
        label: 'JSON',
        icone: <Brackets weight="duotone" size={16} />,
        onClick: () => exportarJSON(dados, COLUNAS_EXPORT, { nomeArquivo: 'estimativas' }),
      },
    ]
  }, [dadosFiltrados])

  // ─── Abas de status ──────────────────────────────────────────────────────

  const abas: GTAbaTipo[] = useMemo(() => [
    { valor: 'TODAS',     label: 'Todas',      contagem: kpis.total },
    { valor: 'EM_CRIACAO', label: 'Em Criação', contagem: kpis.em_criacao },
    { valor: 'CRIADA',    label: 'Criadas',     contagem: kpis.criadas },
    { valor: 'ARQUIVADA', label: 'Arquivadas',  contagem: kpis.arquivadas },
  ], [kpis])

  // ─── Preferências ────────────────────────────────────────────────────────

  const handleSalvarPreferencias = useCallback((prefs: GTPreferencias) => {
    setPreferencias(prefs)
    localStorage.setItem(PREFS_KEY, JSON.stringify(prefs))
  }, [])

  // ─── Render ──────────────────────────────────────────────────────────────

  return (
    <PaginaGlobal
      className="sc-est-page"
      cabecalho={
        <CabecalhoGlobal
          icone={<Calculator weight="duotone" size={22} />}
          titulo="Lista"
          subtitulo="Estimativas de custo de importação"
          acoes={
            <button
              className="gravity-btn gravity-btn--primary"
              onClick={() => navigate('/estimativas/nova')}
            >
              <Plus weight="bold" size={16} />
              Nova Estimativa
            </button>
          }
        />
      }
    >
      {/* ─── KPI Cards ────────────────────────────────────── */}
      <div className="sc-est-cards">
        <CardBasicoGlobal
          icone={<ChartBar weight="duotone" size={20} />}
          titulo="Total"
          valor={kpis.total}
        />
        <CardBasicoGlobal
          icone={<ClockCountdown weight="duotone" size={20} />}
          titulo="Em Criação"
          valor={kpis.em_criacao}
          variante="aviso"
        />
        <CardBasicoGlobal
          icone={<CheckCircle weight="duotone" size={20} />}
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

      {/* ─── Tabela Virtualizada ──────────────────────────── */}
      <div className="sc-est-tabela">
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
    </PaginaGlobal>
  )
}
