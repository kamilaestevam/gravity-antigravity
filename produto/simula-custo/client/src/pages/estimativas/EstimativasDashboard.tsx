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
import { useTranslation } from 'react-i18next'
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
  Code,
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

// ─── Chaves de colunas (para preferências) ───────────────────────────────────

const COLUNAS_KEYS = ['numero', 'status', 'operacao', 'ncm', 'referencia', 'landed_cost_brl', 'total_tributos', 'data_geracao']

// ─── Preferências ─────────────────────────────────────────────────────────────

function loadPrefs(): GTPreferencias {
  try {
    const raw = localStorage.getItem(PREFS_KEY)
    if (raw) return JSON.parse(raw) as GTPreferencias
  } catch { /* ignore */ }
  return { colunas_visiveis: COLUNAS_KEYS }
}

// ─── Componente Principal ─────────────────────────────────────────────────────

export default function EstimativasDashboard() {
  const navigate = useNavigate()
  const { t } = useTranslation()

  const [estimativas, setEstimativas] = useState<Estimativa[]>([])
  const [kpis, setKpis] = useState<EstimativasKpis>({
    total: 0, em_criacao: 0, criadas: 0, arquivadas: 0,
    landed_cost_medio: 0, total_tributos_acumulado: 0,
  })
  const [abaAtiva, setAbaAtiva] = useState<string>('TODAS')
  const [busca, setBusca] = useState('')
  const [carregando, setCarregando] = useState(true)
  const [preferencias, setPreferencias] = useState<GTPreferencias>(loadPrefs)

  // ─── Colunas da tabela ──────────────────────────────────────────────────

  const colunas: GTColuna<Estimativa>[] = useMemo(() => [
    {
      key: 'numero',
      label: t('simulacusto.estimativas.tabela.numero'),
      tipo: 'texto',
      naoOcultavel: true,
      sortavel: true,
      render: (val) => <span className="sc-est-mono">{String(val)}</span>,
    },
    {
      key: 'status',
      label: t('simulacusto.estimativas.tabela.status'),
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
      label: t('simulacusto.estimativas.tabela.operacao'),
      tipo: 'texto',
      filtravel: true,
      render: (val) => OPERACAO_LABELS[val as keyof typeof OPERACAO_LABELS] ?? String(val),
    },
    {
      key: 'ncm',
      label: t('simulacusto.estimativas.tabela.ncm'),
      tipo: 'texto',
      render: (val) => <span className="sc-est-mono-neutro">{String(val)}</span>,
    },
    {
      key: 'referencia',
      label: t('simulacusto.estimativas.tabela.referencia'),
      tipo: 'texto',
      render: (val) => (val != null ? String(val) : '—'),
    },
    {
      key: 'landed_cost_brl',
      label: t('simulacusto.estimativas.tabela.landed_cost'),
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
      label: t('simulacusto.estimativas.tabela.tributos'),
      tipo: 'numero',
      align: 'right',
      render: (val) => brl(val as number | null),
    },
    {
      key: 'data_geracao',
      label: t('simulacusto.estimativas.tabela.data'),
      tipo: 'periodo',
      sortavel: true,
      render: (val) => dataBR(String(val)),
    },
  ], [t])

  // ─── Colunas de exportação ──────────────────────────────────────────────

  const colunasExport: ColunasExport[] = useMemo(() => [
    { header: t('simulacusto.estimativas.tabela.numero'),      key: 'numero' },
    { header: t('simulacusto.estimativas.tabela.status'),      key: 'status' },
    { header: t('simulacusto.estimativas.tabela.operacao'),    key: 'operacao' },
    { header: t('simulacusto.estimativas.tabela.ncm'),         key: 'ncm' },
    { header: t('simulacusto.estimativas.tabela.referencia'),  key: 'referencia' },
    { header: t('simulacusto.estimativas.tabela.landed_cost'), key: 'landed_cost_brl' },
    { header: t('simulacusto.estimativas.tabela.tributos'),    key: 'total_tributos' },
    { header: t('simulacusto.estimativas.tabela.data'),        key: 'data_geracao' },
  ], [t])

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
      tooltip: t('simulacusto.estimativas.acoes.ver_detalhes'),
      onClick: (item) => navigate(`/estimativas/${item.id}`),
    },
    {
      id: 'duplicar',
      icone: <CopySimple weight="duotone" size={16} />,
      tooltip: t('simulacusto.estimativas.acoes.duplicar'),
      onClick: async (item) => {
        await duplicarEstimativa(item.id)
        carregar()
      },
    },
    {
      id: 'arquivar',
      icone: <Archive weight="duotone" size={16} />,
      tooltip: t('simulacusto.estimativas.acoes.arquivar'),
      visivel: (item) => item.status !== 'ARQUIVADA',
      onClick: async (item) => {
        await atualizarStatusEstimativa(item.id, 'ARQUIVADA')
        carregar()
      },
    },
  ], [navigate, carregar, t])

  // ─── Exportação ──────────────────────────────────────────────────────────

  const acoesExportacao: GTAcaoExport[] = useMemo(() => {
    const dados = dadosFiltrados as unknown as Record<string, unknown>[]
    return [
      {
        label: t('simulacusto.estimativas.export_excel'),
        icone: <FileXls weight="duotone" size={16} />,
        onClick: () => exportarExcel(dados, colunasExport, { nomeArquivo: 'estimativas', titulo: t('simulacusto.estimativas.export_titulo') }),
      },
      {
        label: t('simulacusto.estimativas.export_csv'),
        icone: <FileCsv weight="duotone" size={16} />,
        onClick: () => exportarCSV(dados, colunasExport, { nomeArquivo: 'estimativas' }),
      },
      {
        label: t('simulacusto.estimativas.export_txt'),
        icone: <FileText weight="duotone" size={16} />,
        onClick: () => exportarTXT(dados, colunasExport, { nomeArquivo: 'estimativas' }),
      },
      {
        label: t('simulacusto.estimativas.export_xml'),
        icone: <FileCode weight="duotone" size={16} />,
        onClick: () => exportarXML(dados, colunasExport, { nomeArquivo: 'estimativas' }),
      },
      {
        label: t('simulacusto.estimativas.export_json'),
        icone: <Code weight="duotone" size={16} />,
        onClick: () => exportarJSON(dados, colunasExport, { nomeArquivo: 'estimativas' }),
      },
    ]
  }, [dadosFiltrados, colunasExport, t])

  // ─── Abas de status ──────────────────────────────────────────────────────

  const abas: GTAbaTipo[] = useMemo(() => [
    { valor: 'TODAS',      label: t('simulacusto.estimativas.todas'),       contagem: kpis.total },
    { valor: 'EM_CRIACAO', label: t('simulacusto.estimativas.em_criacao'),  contagem: kpis.em_criacao },
    { valor: 'CRIADA',     label: t('simulacusto.estimativas.criadas'),     contagem: kpis.criadas },
    { valor: 'ARQUIVADA',  label: t('simulacusto.estimativas.arquivadas'),  contagem: kpis.arquivadas },
  ], [kpis, t])

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
          titulo={t('simulacusto.estimativas.lista_titulo')}
          subtitulo={t('simulacusto.estimativas.lista_subtitulo')}
          acoes={
            <button
              className="gravity-btn gravity-btn--primary"
              onClick={() => navigate('/estimativas/nova')}
            >
              <Plus weight="bold" size={16} />
              {t('simulacusto.estimativas.nova')}
            </button>
          }
        />
      }
    >
      {/* ─── KPI Cards ────────────────────────────────────── */}
      <div className="sc-est-cards">
        <CardBasicoGlobal
          icone={<ChartBar weight="duotone" size={20} />}
          titulo={t('simulacusto.estimativas.kpi_total')}
          valor={kpis.total}
        />
        <CardBasicoGlobal
          icone={<ClockCountdown weight="duotone" size={20} />}
          titulo={t('simulacusto.estimativas.em_criacao')}
          valor={kpis.em_criacao}
          variante="aviso"
        />
        <CardBasicoGlobal
          icone={<CheckCircle weight="duotone" size={20} />}
          titulo={t('simulacusto.estimativas.criadas')}
          valor={kpis.criadas}
          variante="sucesso"
        />
        <CardBasicoGlobal
          icone={<CurrencyDollar weight="duotone" size={20} />}
          titulo={t('simulacusto.estimativas.landed_cost_medio')}
          valor={brl(kpis.landed_cost_medio)}
          variante="sucesso"
        />
      </div>

      {/* ─── Tabela Virtualizada ──────────────────────────── */}
      <div className="sc-est-tabela">
        <TabelaVirtualGlobal<Estimativa>
          dados={dadosFiltrados}
          colunas={colunas}
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
          placeholderBusca={t('simulacusto.estimativas.buscar')}
          emptyTitle={t('simulacusto.estimativas.vazio')}
          emptyDescription={t('simulacusto.estimativas.vazio_descricao')}
          ariaLabel={t('simulacusto.estimativas.aria_tabela')}
        />
      </div>
    </PaginaGlobal>
  )
}
