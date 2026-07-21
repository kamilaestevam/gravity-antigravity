/**
 * lista-simula-custo.tsx — Lista de Simulas.
 * Paridade visual com a Lista do Bid Frete Internacional (lp-*):
 * KPIs com subtexto + faixa de status pills + chrome unificado da tabela.
 * Título/subtítulo vêm do MenuTopoGlobal; pills de navegação, da toolbar.
 */
import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useShellStore } from '@gravity/shell'
import { CardBasicoGlobal } from '@nucleo/card-global'
import { BotaoGlobal } from '@nucleo/botao-global'
import { ModalConfirmarExcluirGlobal } from '@nucleo/modal-confirmar-excluir-global'
import { TabelaVirtualGlobal } from '@nucleo/tabela-virtual-global'
import type { GTColuna, GTAcao, GTAcaoExport, GTPreferencias } from '@nucleo/tabela-virtual-global'
import { exportarExcel, exportarCSV, exportarTXT, exportarXML, exportarJSON } from '@nucleo/export-utils'
import type { ColunasExport } from '@nucleo/export-utils'
import {
  Calculator, Eye, CopySimple, Archive, Trash, Plus,
  ClockCountdown, CheckCircle, CurrencyDollar,
  FileXls, FileCsv, FileText, FileCode, Code,
} from '@phosphor-icons/react'
import {
  listarSimulasCusto,
  obterKpisSimulaCusto,
  duplicarSimulaCusto,
  atualizarStatusSimulaCusto,
  excluirSimulaCusto,
} from '../shared/api'
import type { SimulaCusto, KpisSimulaCusto, StatusSimulaCusto } from '../shared/schemas-simula-custo'
import { STATUS_LABELS, STATUS_BADGE, OPERACAO_LABELS } from '../shared/types'
import { rotaSimulaCusto, rotaDetalheSimulaCusto } from '../shared/rotas-simula-custo'
import './lista-simula-custo.css'

const PREFS_KEY = 'simula-custo-lista-prefs'

/** Cores das pills de status — paridade lista-status-aba-estilo do Bid Frete. */
const STATUS_PILL_COR: Record<string, string> = {
  TODAS: '#818cf8',
  EM_CRIACAO: '#fbbf24',
  CRIADA: '#34d399',
  ARQUIVADA: '#94a3b8',
}

interface AbaStatusLista {
  valor: string
  label: string
  contagem: number
}

function StatusPillSimulaCusto({
  aba,
  ativa,
  onSelect,
}: {
  aba: AbaStatusLista
  ativa: boolean
  onSelect: (valor: string) => void
}) {
  const cor = STATUS_PILL_COR[aba.valor] ?? '#64748b'
  const ehTodas = aba.valor === 'TODAS'
  const estilo: React.CSSProperties = ehTodas
    ? { color: ativa ? '#c7d2fe' : 'var(--gtv-muted, #94a3b8)', background: 'transparent', borderColor: 'transparent' }
    : ativa
      ? { color: cor, background: `${cor}2e`, borderColor: `${cor}55`, boxShadow: `0 0 0 1px ${cor}22` }
      : { color: 'var(--gtv-muted, #94a3b8)', background: 'transparent', borderColor: 'transparent' }
  const estiloContagem: React.CSSProperties = ativa
    ? { background: cor, color: '#fff' }
    : { background: `${cor}22`, color: cor }

  return (
    <button
      type="button"
      role="tab"
      aria-selected={ativa}
      data-testid={`lista-status-tab-${aba.valor}`}
      className={[
        'lp-status-pill',
        ativa && !ehTodas ? 'lp-status-pill--ativa' : '',
        ehTodas ? 'lp-status-pill--todos' : '',
        ehTodas && ativa ? 'lp-status-pill--todos-selecionado' : '',
      ].filter(Boolean).join(' ')}
      style={estilo}
      onClick={() => onSelect(aba.valor)}
      title={aba.label}
    >
      <span className="lp-status-pill__dot" style={{ background: cor }} aria-hidden="true" />
      <span className="lp-status-pill__label">{aba.label}</span>
      <span className="lp-status-pill__contagem" style={estiloContagem}>{aba.contagem}</span>
    </button>
  )
}

const brl = (val: number | null) =>
  val != null
    ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val)
    : '—'

const dataBR = (iso: string | null) =>
  iso ? new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '—'

const COLUNAS_KEYS = [
  'numero_simula_custo',
  'status_simula_custo',
  'tipo_operacao_simula_custo',
  'ncm_simula_custo',
  'referencia_simula_custo',
  'custo_nacionalizado_brl_simula_custo',
  'total_tributos_simula_custo',
  'data_criacao_simula_custo',
]

function loadPrefs(): GTPreferencias {
  try {
    const raw = localStorage.getItem(PREFS_KEY)
    if (raw) return JSON.parse(raw) as GTPreferencias
  } catch { /* prefs corrompidas */ }
  return { colunas_visiveis: COLUNAS_KEYS }
}

export default function ListaSimulaCusto() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const addNotification = useShellStore(s => s.addNotification)

  const [simulas, setSimulas] = useState<SimulaCusto[]>([])
  const [simulaParaExcluir, setSimulaParaExcluir] = useState<SimulaCusto | null>(null)
  const [kpis, setKpis] = useState<KpisSimulaCusto>({
    total: 0, em_criacao: 0, criadas: 0, arquivadas: 0,
    custo_nacionalizado_medio_brl: 0, total_tributos_acumulado_brl: 0,
  })
  const [abaAtiva, setAbaAtiva] = useState<string>('TODAS')
  const [busca, setBusca] = useState('')
  const [carregando, setCarregando] = useState(true)
  const [preferencias, setPreferencias] = useState<GTPreferencias>(loadPrefs)

  const colunas: GTColuna<SimulaCusto>[] = useMemo(() => [
    {
      key: 'numero_simula_custo',
      label: t('simulacusto.simulas.tabela.numero', 'Número'),
      tipo: 'texto',
      naoOcultavel: true,
      sortavel: true,
      render: (val) => <span className="sc-est-mono">{String(val)}</span>,
    },
    {
      key: 'status_simula_custo',
      label: t('simulacusto.simulas.tabela.status', 'Status'),
      tipo: 'badge',
      filtravel: true,
      render: (val) => {
        const s = val as StatusSimulaCusto
        return <span className={`sc-est-badge sc-est-badge--${STATUS_BADGE[s]}`}>{STATUS_LABELS[s]}</span>
      },
    },
    {
      key: 'tipo_operacao_simula_custo',
      label: t('simulacusto.simulas.tabela.operacao', 'Operação'),
      tipo: 'texto',
      filtravel: true,
      render: (val) => OPERACAO_LABELS[val as keyof typeof OPERACAO_LABELS] ?? String(val),
    },
    {
      key: 'ncm_simula_custo',
      label: t('simulacusto.simulas.tabela.ncm', 'NCM'),
      tipo: 'texto',
      render: (val) => <span className="sc-est-mono-neutro">{String(val)}</span>,
    },
    {
      key: 'referencia_simula_custo',
      label: t('simulacusto.simulas.tabela.referencia', 'Referência'),
      tipo: 'texto',
      render: (val) => (val != null && val !== '' ? String(val) : '—'),
    },
    {
      key: 'custo_nacionalizado_brl_simula_custo',
      label: t('simulacusto.simulas.tabela.custo_nacionalizado', 'Custo Nacionalizado'),
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
      key: 'total_tributos_simula_custo',
      label: t('simulacusto.simulas.tabela.tributos', 'Tributos'),
      tipo: 'numero',
      align: 'right',
      render: (val) => brl(val as number | null),
    },
    {
      key: 'data_criacao_simula_custo',
      label: t('simulacusto.simulas.tabela.data', 'Data'),
      tipo: 'periodo',
      sortavel: true,
      render: (val) => dataBR(val as string | null),
    },
  ], [t])

  const colunasExport: ColunasExport[] = useMemo(() => [
    { header: t('simulacusto.simulas.tabela.numero', 'Número'), key: 'numero_simula_custo' },
    { header: t('simulacusto.simulas.tabela.status', 'Status'), key: 'status_simula_custo' },
    { header: t('simulacusto.simulas.tabela.operacao', 'Operação'), key: 'tipo_operacao_simula_custo' },
    { header: t('simulacusto.simulas.tabela.ncm', 'NCM'), key: 'ncm_simula_custo' },
    { header: t('simulacusto.simulas.tabela.referencia', 'Referência'), key: 'referencia_simula_custo' },
    { header: t('simulacusto.simulas.tabela.custo_nacionalizado', 'Custo Nacionalizado'), key: 'custo_nacionalizado_brl_simula_custo' },
    { header: t('simulacusto.simulas.tabela.tributos', 'Tributos'), key: 'total_tributos_simula_custo' },
    { header: t('simulacusto.simulas.tabela.data', 'Data'), key: 'data_criacao_simula_custo' },
  ], [t])

  const carregar = useCallback(async () => {
    setCarregando(true)
    try {
      const status = abaAtiva === 'TODAS' ? undefined : abaAtiva as StatusSimulaCusto
      const [listaRes, kpisRes] = await Promise.all([
        listarSimulasCusto({ status, limite: 100 }),
        obterKpisSimulaCusto(),
      ])
      setSimulas(listaRes.simulas_custo)
      setKpis(kpisRes)
    } catch {
      setSimulas([])
    } finally {
      setCarregando(false)
    }
  }, [abaAtiva])

  useEffect(() => { carregar() }, [carregar])

  const dadosFiltrados = useMemo(() => {
    if (!busca.trim()) return simulas
    const termo = busca.toLowerCase()
    return simulas.filter(e =>
      e.numero_simula_custo.toLowerCase().includes(termo) ||
      (e.referencia_simula_custo ?? '').toLowerCase().includes(termo) ||
      e.ncm_simula_custo.toLowerCase().includes(termo) ||
      STATUS_LABELS[e.status_simula_custo].toLowerCase().includes(termo) ||
      OPERACAO_LABELS[e.tipo_operacao_simula_custo].toLowerCase().includes(termo)
    )
  }, [simulas, busca])

  const acoes: GTAcao<SimulaCusto>[] = useMemo(() => [
    {
      id: 'ver',
      icone: <Eye weight="duotone" size={16} />,
      tooltip: t('simulacusto.simulas.acoes.ver_detalhes', 'Ver detalhes'),
      onClick: (item) => navigate(rotaDetalheSimulaCusto(item.id_simula_custo)),
    },
    {
      id: 'duplicar',
      icone: <CopySimple weight="duotone" size={16} />,
      tooltip: t('simulacusto.simulas.acoes.duplicar', 'Duplicar'),
      onClick: async (item) => {
        try {
          await duplicarSimulaCusto(item.id_simula_custo)
          addNotification({ type: 'success', message: t('simulacusto.simulas.duplicada_sucesso', 'Simula duplicada com sucesso.') })
          carregar()
        } catch {
          addNotification({ type: 'error', message: t('simulacusto.simulas.duplicada_erro', 'Não foi possível duplicar a simula.') })
        }
      },
    },
    {
      id: 'arquivar',
      icone: <Archive weight="duotone" size={16} />,
      tooltip: t('simulacusto.simulas.acoes.arquivar', 'Arquivar'),
      visivel: (item) => item.status_simula_custo !== 'ARQUIVADA',
      onClick: async (item) => {
        try {
          await atualizarStatusSimulaCusto(item.id_simula_custo, 'ARQUIVADA')
          addNotification({ type: 'success', message: t('simulacusto.simulas.arquivada_sucesso', 'Simula arquivada.') })
          carregar()
        } catch {
          addNotification({ type: 'error', message: t('simulacusto.simulas.arquivada_erro', 'Não foi possível arquivar a simula.') })
        }
      },
    },
    {
      id: 'excluir',
      icone: <Trash weight="duotone" size={16} />,
      tooltip: t('simulacusto.simulas.acoes.excluir', 'Excluir'),
      visivel: (item) => item.status_simula_custo === 'ARQUIVADA',
      onClick: (item) => setSimulaParaExcluir(item),
    },
  ], [navigate, carregar, addNotification, t])

  const handleConfirmarExclusao = useCallback(async () => {
    if (!simulaParaExcluir) return
    try {
      await excluirSimulaCusto(simulaParaExcluir.id_simula_custo)
      addNotification({ type: 'success', message: t('simulacusto.simulas.excluida_sucesso', 'Simula excluída definitivamente.') })
      carregar()
    } catch {
      addNotification({ type: 'error', message: t('simulacusto.simulas.excluida_erro', 'Não foi possível excluir a simula.') })
    } finally {
      setSimulaParaExcluir(null)
    }
  }, [simulaParaExcluir, addNotification, carregar, t])

  const acoesExportacao: GTAcaoExport[] = useMemo(() => {
    const dados = dadosFiltrados as unknown as Record<string, unknown>[]
    const opts = { nomeArquivo: 'simulas-custo' }
    return [
      { label: t('simulacusto.simulas.export_excel', 'Excel'), icone: <FileXls weight="duotone" size={16} />, onClick: () => exportarExcel(dados, colunasExport, { ...opts, titulo: t('simulacusto.simulas.export_titulo', 'Simulas de Custo') }) },
      { label: t('simulacusto.simulas.export_csv', 'CSV'), icone: <FileCsv weight="duotone" size={16} />, onClick: () => exportarCSV(dados, colunasExport, opts) },
      { label: t('simulacusto.simulas.export_txt', 'TXT'), icone: <FileText weight="duotone" size={16} />, onClick: () => exportarTXT(dados, colunasExport, opts) },
      { label: t('simulacusto.simulas.export_xml', 'XML'), icone: <FileCode weight="duotone" size={16} />, onClick: () => exportarXML(dados, colunasExport, opts) },
      { label: t('simulacusto.simulas.export_json', 'JSON'), icone: <Code weight="duotone" size={16} />, onClick: () => exportarJSON(dados, colunasExport, opts) },
    ]
  }, [dadosFiltrados, colunasExport, t])

  const abas: AbaStatusLista[] = useMemo(() => [
    { valor: 'TODAS', label: t('simulacusto.simulas.todas', 'Todas as simulas'), contagem: kpis.total },
    { valor: 'EM_CRIACAO', label: t('simulacusto.simulas.em_criacao', 'Em Criação'), contagem: kpis.em_criacao },
    { valor: 'CRIADA', label: t('simulacusto.simulas.criadas', 'Criadas'), contagem: kpis.criadas },
    { valor: 'ARQUIVADA', label: t('simulacusto.simulas.arquivadas', 'Arquivadas'), contagem: kpis.arquivadas },
  ], [kpis, t])

  /** «+ Nova» na barra da tabela — paridade acoesBarra do Bid Frete. */
  const acoesBarra = useMemo(() => (
    <BotaoGlobal
      variante="primario"
      tamanho="pequeno"
      icone={<Plus size={14} weight="bold" />}
      onClick={() => navigate(rotaSimulaCusto('simulas/nova'))}
    >
      {t('simulacusto.simulas.nova_curto', 'Nova')}
    </BotaoGlobal>
  ), [navigate, t])

  const handleSalvarPreferencias = useCallback((prefs: GTPreferencias) => {
    setPreferencias(prefs)
    localStorage.setItem(PREFS_KEY, JSON.stringify(prefs))
  }, [])

  return (
    <div className="ec-lista-page">
      {/* ── KPIs ── */}
      <div className="lp-stats-row">
        <div className="lp-cards">
          <CardBasicoGlobal
            icone={<Calculator weight="duotone" size={16} style={{ color: 'var(--ws-accent, #818cf8)' }} />}
            titulo={t('simulacusto.simulas.kpi_total', 'Total de Simulas')}
            valor={String(kpis.total)}
            subtexto={t('simulacusto.simulas.kpi_total_subtexto', {
              defaultValue: '{{arquivadas}} arquivadas',
              arquivadas: kpis.arquivadas,
            })}
          />
          <CardBasicoGlobal
            icone={<ClockCountdown weight="duotone" size={16} style={{ color: '#fbbf24' }} />}
            titulo={t('simulacusto.simulas.em_criacao', 'Em Criação')}
            valor={String(kpis.em_criacao)}
            subtexto={t('simulacusto.simulas.kpi_em_criacao_subtexto', 'Aguardando conclusão do cálculo')}
          />
          <CardBasicoGlobal
            icone={<CheckCircle weight="duotone" size={16} style={{ color: '#34d399' }} />}
            titulo={t('simulacusto.simulas.criadas', 'Criadas')}
            valor={String(kpis.criadas)}
            subtexto={t('simulacusto.simulas.kpi_criadas_subtexto', 'Com custo nacionalizado calculado')}
          />
          <CardBasicoGlobal
            icone={<CurrencyDollar weight="duotone" size={16} style={{ color: '#34d399' }} />}
            titulo={t('simulacusto.simulas.custo_medio', 'Custo Nacionalizado Médio')}
            valor={brl(kpis.custo_nacionalizado_medio_brl)}
            subtexto={t('simulacusto.simulas.kpi_custo_medio_subtexto', {
              defaultValue: 'Tributos acumulados {{tributos}}',
              tributos: brl(kpis.total_tributos_acumulado_brl),
            })}
          />
        </div>
      </div>

      {/* ── Faixa de status + tabela (chrome unificado) ── */}
      <div className="lp-tabela-wrapper lp-tabela-wrapper--faixa-unificada">
        <div className="lp-tabela-chrome">
          <nav className="lp-faixa-navegacao lp-faixa-navegacao--sem-paineis" aria-label={t('simulacusto.simulas.faixa_navegacao', 'Status da lista')}>
            <section className="lp-faixa-navegacao__status" aria-label={t('simulacusto.simulas.abas_status', 'Filtrar por status')}>
              <span id="ec-lista-status-label" className="lp-faixa-navegacao__secao-label">
                {t('simulacusto.simulas.status_secao', 'Status')}
              </span>
              <div className="lp-status-pills-row">
                <div className="lp-status-pills" role="tablist" aria-labelledby="ec-lista-status-label">
                  {abas.map(aba => (
                    <StatusPillSimulaCusto
                      key={aba.valor}
                      aba={aba}
                      ativa={abaAtiva === aba.valor}
                      onSelect={setAbaAtiva}
                    />
                  ))}
                </div>
              </div>
            </section>
          </nav>
          <TabelaVirtualGlobal<SimulaCusto>
            dados={dadosFiltrados}
            colunas={colunas}
            itemId={(item) => item.id_simula_custo}
            carregando={carregando}
            acoes={acoes}
            acoesExportacao={acoesExportacao}
            acoesBarra={acoesBarra}
            preferencias={preferencias}
            onSalvarPreferencias={handleSalvarPreferencias}
            onBuscar={setBusca}
            placeholderBusca={t('simulacusto.simulas.buscar', 'Buscar por número, NCM, referência…')}
            emptyTitle={t('simulacusto.simulas.vazio', 'Nenhuma simula encontrada')}
            emptyDescription={t('simulacusto.simulas.vazio_descricao', 'Crie a primeira simula para começar')}
            ariaLabel={t('simulacusto.simulas.aria_tabela', 'Tabela de simulas de custo')}
          />
        </div>
      </div>

      <ModalConfirmarExcluirGlobal
        aberto={simulaParaExcluir !== null}
        titulo={t('simulacusto.simulas.excluir_titulo', 'Excluir simula')}
        descricao={t('simulacusto.simulas.confirmar_exclusao', 'Excluir esta simula definitivamente?')}
        nomeItem={simulaParaExcluir?.numero_simula_custo}
        aoConfirmar={handleConfirmarExclusao}
        aoCancelar={() => setSimulaParaExcluir(null)}
      />
    </div>
  )
}
