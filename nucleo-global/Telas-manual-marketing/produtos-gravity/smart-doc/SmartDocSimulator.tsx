import { Fragment, useEffect, useMemo, useRef, useState, type CSSProperties } from 'react'
import { CardKpiSimulador } from './card-kpi-simulador'
import {
  TooltipGraficoInsightsSimulador,
  formatarPercentualTooltipInsightsSimulador,
  useHoverTooltipInsightsSimulador,
} from './tooltip-grafico-insights-simulador'
import '../../../Layout/card-global/src/card.css'
import {
  FileText,
  MagnifyingGlass,
  Plus,
  ArrowRight,
  CheckCircle,
  Clock,
  Sparkle,
  Truck,
  CurrencyDollar,
  X,
  Check,
  Square,
  CheckSquare,
  Gear,
  CaretDown,
  CaretUp,
  Package,
  UserGear,
  TruckTrailer,
  Warehouse,
  ShieldStar,
  ListChecks,
  Files,
  Timer,
  TrendUp,
  ChartBar,
  ChartPie,
  ChartPieSlice,
  ListBullets,
  FileMagnifyingGlass,
  UserCircle,
  EnvelopeSimple,
  WhatsappLogo,
  Buildings,
  GraduationCap,
  Info,
  GlobeHemisphereWest,
} from '@phosphor-icons/react'
import './smart-doc-simulator.css'
import { NovaLeituraSimuladorSmartDoc } from './nova-leitura-simulador-smart-doc'
import { TutorialOpcionalSimuladorSmartDoc } from './tutorial-opcional-simulador-smart-doc'
import { resolverIdTelaShellSimulador } from './dados-tutorial-opcional-simulador-smart-doc'
import { useEfeitoDestaqueTutorialSimulador } from './efeito-destaque-tutorial-simulador-smart-doc'
import {
  deveExibirDespedidaShellSimulador,
  resolverConteudoDespedidaShellSimulador,
  URL_CONSULTOR_SMART_DOCS_SIMULADOR,
  type DestinoDespedidaSimulador,
  type PendenciaDespedidaSimulador,
} from './despedida-saida-nova-leitura-simulador-smart-doc'
import { ModalDespedidaSimuladorSmartDoc } from './modal-despedida-simulador-smart-doc'
import {
  formatarSavingSimulador,
  PERFIS_EMPRESA_SIMULADOR,
  agregarInsightsEmpresasSimulador,
  resolverRotuloEscopoEmpresasSimulador,
  type PeriodoPresetSimulador,
  type TipoParticipanteSimulador,
} from './dados-cliente-maduro-simulador-smart-doc'

type AbaVisualizacao = 'insights' | 'lista'
type PeriodoPreset = PeriodoPresetSimulador
type TipoParticipante = TipoParticipanteSimulador

const PERIODOS: PeriodoPreset[] = [7, 30, 60, 90]

const PRODUTOS_DROPDOWN = [
  { name: 'Pedido', icon: <Package size={14} weight="duotone" style={{ color: '#d97706' }} /> },
  { name: 'Bid Frete Internacional', icon: <Truck size={14} weight="duotone" style={{ color: '#2563eb' }} /> },
  { name: 'Bid Cambio', icon: <CurrencyDollar size={14} weight="duotone" style={{ color: '#0d9488' }} /> },
  { name: 'NF Import', icon: <FileText size={14} weight="duotone" style={{ color: '#7c3aed' }} /> },
  { name: 'Smart Docs', icon: <Sparkle size={14} weight="fill" style={{ color: '#818cf8' }} />, selected: true },
  { name: 'Processos', icon: <Files size={14} weight="duotone" style={{ color: '#eab308' }} />, subtitle: 'Visão unificada dos Prod...' },
]

const ICONES_PARTICIPANTE: Record<
  TipoParticipante,
  { cor: string; rotulo: string; render: () => JSX.Element }
> = {
  exportador: { cor: '#34d399', rotulo: 'Exportador', render: () => <Truck weight="duotone" size={14} /> },
  agente_carga: { cor: '#c084fc', rotulo: 'Agente de carga', render: () => <UserGear weight="duotone" size={14} /> },
  transportadora_rodoviaria: { cor: '#a3e635', rotulo: 'Transportadora rodoviária', render: () => <TruckTrailer weight="duotone" size={14} /> },
  armazem_alfandegado: { cor: '#fb923c', rotulo: 'Armazém alfandegado', render: () => <Warehouse weight="duotone" size={14} /> },
  despachante_aduaneiro: { cor: '#f472b6', rotulo: 'Despachante aduaneiro', render: () => <ShieldStar weight="duotone" size={14} /> },
}

const DESCRICAO_PARTICIPANTE: Record<TipoParticipante, string> = {
  exportador: 'Emissor em Invoice, Packing e documentos comerciais',
  agente_carga: 'Emissor em BL, AWB e conhecimentos de transporte',
  transportadora_rodoviaria: 'Transportadora do trecho rodoviário na operação',
  armazem_alfandegado: 'Recinto alfandegado ou terminal de armazenagem',
  despachante_aduaneiro: 'Despachante responsável pelo desembaraço aduaneiro',
}

function descricaoParticipanteSimulador(tipo: TipoParticipante): string {
  return DESCRICAO_PARTICIPANTE[tipo]
}

const EMPRESAS = Object.values(PERFIS_EMPRESA_SIMULADOR)

type IdEmpresa = (typeof EMPRESAS)[number]['id']

const MEU_ESPACO_ITENS = [
  { id: 'atividades', label: 'Minhas Atividades', icon: <CheckCircle size={14} weight="duotone" /> },
  { id: 'email', label: 'Email', icon: <EnvelopeSimple size={14} weight="duotone" /> },
  { id: 'whatsapp', label: 'WhatsApp', icon: <WhatsappLogo size={14} weight="duotone" /> },
] as const

function formatarNumeroSimulador(valor: number): string {
  return valor.toLocaleString('pt-BR')
}

function formatarPercentualSimulador(valor: number): string {
  return `${valor.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}%`
}

function formatarErrosEvitadosSimulador(errados: number): string {
  if (errados <= 0) return '0'
  return errados.toLocaleString('pt-BR')
}

function LinkBaseCalculoSimulador() {
  return (
    <button type="button" className="sr-insights-link-metodologia">
      Base de cálculo →
    </button>
  )
}

export function SmartDocSimulator({ onFecharSimulador }: { onFecharSimulador?: () => void }) {
  const [abaAtiva, setAbaAtiva] = useState<AbaVisualizacao>('insights')
  const [periodoAtivo, setPeriodoAtivo] = useState<PeriodoPreset>(30)
  const [tipoParticipante, setTipoParticipante] = useState<TipoParticipante>('exportador')
  const [productDropdownOpen, setProductDropdownOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [empresaDropdownOpen, setEmpresaDropdownOpen] = useState(false)
  const [empresaSearch, setEmpresaSearch] = useState('')
  const [idsEmpresasEscopo, setIdsEmpresasEscopo] = useState<IdEmpresa[]>(() =>
    EMPRESAS.map((empresa) => empresa.id),
  )
  const [meuEspacoAberto, setMeuEspacoAberto] = useState(false)
  const [meuEspacoItemAtivo, setMeuEspacoItemAtivo] = useState<string | null>(null)
  const [sidebarAtivo, setSidebarAtivo] = useState<'insights' | 'historico' | 'config'>('insights')
  const [modalNovoAberto, setModalNovoAberto] = useState(false)
  const [despedidaShellAberta, setDespedidaShellAberta] = useState(false)
  const [destinoNovaLeitura, setDestinoNovaLeitura] = useState<DestinoDespedidaSimulador | null>(null)
  const [wizardIniciado, setWizardIniciado] = useState(false)
  const [wizardCompletado, setWizardCompletado] = useState(false)
  const [barraDestaque, setBarraDestaque] = useState<number | null>(null)
  const [linhaListaExpandida, setLinhaListaExpandida] = useState<string | null>(null)
  const [rankingSelecionado, setRankingSelecionado] = useState<number | null>(null)
  const [novoDropdownAberto, setNovoDropdownAberto] = useState(false)
  const [iconeParticipanteTooltip, setIconeParticipanteTooltip] = useState<TipoParticipante | null>(null)

  const idTelaTutorial = resolverIdTelaShellSimulador({
    abaAtiva,
    sidebarAtivo,
    meuEspacoItemAtivo,
    modalNovoAberto,
    linhaListaExpandida,
  })
  const conteudoDespedidaShell = useMemo(
    () =>
      resolverConteudoDespedidaShellSimulador(
        idTelaTutorial ?? 'insights',
        wizardIniciado,
        wizardCompletado,
      ),
    [idTelaTutorial, wizardIniciado, wizardCompletado],
  )

  function fecharModalNovo() {
    setModalNovoAberto(false)
  }

  function solicitarFecharShell() {
    if (!onFecharSimulador) return
    if (
      !deveExibirDespedidaShellSimulador(wizardCompletado) ||
      !conteudoDespedidaShell
    ) {
      onFecharSimulador()
      return
    }
    setDespedidaShellAberta(true)
  }

  function falarComConsultorShell() {
    setDespedidaShellAberta(false)
    window.open(URL_CONSULTOR_SMART_DOCS_SIMULADOR, '_blank', 'noopener,noreferrer')
  }

  function fecharSairShell() {
    setDespedidaShellAberta(false)
    setModalNovoAberto(false)
    onFecharSimulador?.()
  }

  function irParaPendenciaShell(pendencia: PendenciaDespedidaSimulador) {
    if (!pendencia.destino) return
    setDespedidaShellAberta(false)
    setWizardIniciado(true)
    setDestinoNovaLeitura(pendencia.destino)
    setModalNovoAberto(true)
  }

  const refRaizTutorial = useRef<HTMLDivElement>(null)
  const prodDropdownRef = useRef<HTMLDivElement>(null)
  const empresaDropdownRef = useRef<HTMLDivElement>(null)
  const [alvoTutorialDestacado, setAlvoTutorialDestacado] = useState<string | null>(null)
  useEfeitoDestaqueTutorialSimulador(alvoTutorialDestacado, refRaizTutorial)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const target = e.target as Node
      if (prodDropdownRef.current && !prodDropdownRef.current.contains(target)) {
        setProductDropdownOpen(false)
      }
      if (empresaDropdownRef.current && !empresaDropdownRef.current.contains(target)) {
        setEmpresaDropdownOpen(false)
      }
    }
    if (productDropdownOpen || empresaDropdownOpen) {
      document.addEventListener('mousedown', handler)
    }
    return () => document.removeEventListener('mousedown', handler)
  }, [productDropdownOpen, empresaDropdownOpen])

  const chartTooltip = useHoverTooltipInsightsSimulador<{
    date: string
    val: number
    documentos: number
    acertos: number
    erros: number
  }>()
  const funilTooltip = useHoverTooltipInsightsSimulador<{ label: string; val: number; pct: number }>()
  const rankingTooltip = useHoverTooltipInsightsSimulador<{
    nome: string
    stats: string
    metrica: string
    tipo: 'acerto' | 'erro'
  }>()
  const acertosTooltip = useHoverTooltipInsightsSimulador<'corretos' | 'errados'>()

  const empresasSelecionadas = useMemo(
    () => EMPRESAS.filter((empresa) => idsEmpresasEscopo.includes(empresa.id)),
    [idsEmpresasEscopo],
  )
  const rotuloEmpresaEscopo = useMemo(
    () => resolverRotuloEscopoEmpresasSimulador(empresasSelecionadas),
    [empresasSelecionadas],
  )
  const insightsEscopo = useMemo(
    () => agregarInsightsEmpresasSimulador(empresasSelecionadas, periodoAtivo, tipoParticipante),
    [empresasSelecionadas, periodoAtivo, tipoParticipante],
  )
  const metricas = insightsEscopo.metricas
  const chartBarras = insightsEscopo.chartBarras
  const tiposDocumento = insightsEscopo.tiposDocumento
  const listaLeituras = insightsEscopo.listaLeituras
  const rankings = insightsEscopo.rankings
  const mesesUsoEscopo = insightsEscopo.mesesUso
  const leiturasPorMesEscopo = insightsEscopo.leiturasPorMes
  const pctCorretosDonut = metricas.taxaAcerto
  const pctErradosDonut = Math.max(0, 100 - pctCorretosDonut)

  const chartMax = useMemo(() => {
    return Math.max(...chartBarras.map((b) => b.val), 1)
  }, [chartBarras])

  const marcasEixoGrafico = useMemo(
    () => [1, 0.75, 0.5, 0.25, 0].map((tick) => Math.round((1 - tick) * chartMax)),
    [chartMax],
  )


  const empresasFiltradas = EMPRESAS.filter((e) =>
    e.nome.toLowerCase().includes(empresaSearch.toLowerCase()),
  )
  const idsEmpresasFiltradas = empresasFiltradas.map((empresa) => empresa.id)
  const todosFiltradosSelecionados =
    idsEmpresasFiltradas.length > 0 &&
    idsEmpresasFiltradas.every((id) => idsEmpresasEscopo.includes(id))

  function alternarEmpresaEscopo(id: IdEmpresa) {
    setIdsEmpresasEscopo((atual) => {
      if (atual.includes(id)) {
        if (atual.length === 1) return atual
        return atual.filter((item) => item !== id)
      }
      return [...atual, id]
    })
  }

  function definirEscopoEmpresasFiltradas(selecionar: boolean) {
    if (selecionar) {
      setIdsEmpresasEscopo((atual) => [...new Set([...atual, ...idsEmpresasFiltradas])])
      return
    }
    const restante = idsEmpresasEscopo.filter((id) => !idsEmpresasFiltradas.includes(id))
    setIdsEmpresasEscopo(restante.length > 0 ? restante : [idsEmpresasFiltradas[0]])
  }
  const produtosFiltrados = PRODUTOS_DROPDOWN.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  function renderInsights() {
    return (
      <>
        <div className="sds-kpi-grid" data-sds-tutorial-alvo="insights-kpis">
          <CardKpiSimulador
            className="sds-kpi-grid__card"
            titulo="DOCUMENTOS LIDOS"
            icone={<Files weight="duotone" size={16} style={{ color: 'var(--ws-accent, #818cf8)' }} />}
            valor={formatarNumeroSimulador(metricas.totalDocumentos)}
            tooltip={
              <>
                <p className="cg-tooltip__row">
                  <span>Cliente desde</span>
                  <strong>{mesesUsoEscopo} meses</strong>
                </p>
                <p className="cg-tooltip__row">
                  <span>Ritmo mensal</span>
                  <strong>{formatarNumeroSimulador(leiturasPorMesEscopo)} leituras</strong>
                </p>
                <p className="cg-tooltip__row">
                  <span>Documentos extraídos</span>
                  <strong>{formatarNumeroSimulador(metricas.totalDocumentos)}</strong>
                </p>
                <p className="cg-tooltip__row">
                  <span>Leituras na amostra</span>
                  <strong>{formatarNumeroSimulador(metricas.amostraLeituras)}</strong>
                </p>
                <p className="cg-tooltip__row">
                  <span>Tipos distintos</span>
                  <strong>{metricas.tiposDocumento}</strong>
                </p>
              </>
            }
          />
          <CardKpiSimulador
            className="sds-kpi-grid__card"
            titulo="CAMPOS LIDOS"
            icone={<ListChecks weight="duotone" size={16} style={{ color: '#60a5fa' }} />}
            valor={formatarNumeroSimulador(metricas.totalCampos)}
            tooltip={
              <>
                <p className="cg-tooltip__row">
                  <span>Total de campos</span>
                  <strong>{metricas.totalCampos}</strong>
                </p>
                <p className="cg-tooltip__row">
                  <span>Corretos</span>
                  <strong>{metricas.camposCorretos}</strong>
                </p>
                <p className="cg-tooltip__row">
                  <span>Errados</span>
                  <strong>{formatarErrosEvitadosSimulador(metricas.camposErrados)}</strong>
                </p>
                <p className="cg-tooltip__row">
                  <span>Taxa de acerto</span>
                  <strong>{formatarPercentualSimulador(metricas.taxaAcerto)}</strong>
                </p>
              </>
            }
          />
          <CardKpiSimulador
            className="sds-kpi-grid__card"
            titulo="SAVING DIGITAÇÃO"
            icone={<Timer weight="duotone" size={16} style={{ color: '#34d399' }} />}
            valor={formatarSavingSimulador(metricas.savingDigitaçãoMinutos)}
            variante="sucesso"
            tooltip={
              <>
                <p className="cg-tooltip__row">
                  <span>Tempo economizado</span>
                  <strong>{formatarSavingSimulador(metricas.savingDigitaçãoMinutos)}</strong>
                </p>
                <p className="cg-tooltip__row cg-tooltip__row--link-only">
                  <LinkBaseCalculoSimulador />
                </p>
              </>
            }
          />
          <CardKpiSimulador
            className="sds-kpi-grid__card"
            titulo="SAVING EM ERROS"
            icone={<TrendUp weight="duotone" size={16} style={{ color: '#a78bfa' }} />}
            valor={formatarErrosEvitadosSimulador(metricas.camposErrados)}
            tooltip={
              <>
                <p className="cg-tooltip__row">
                  <span>Erros evitados (estudo)</span>
                  <strong>{formatarErrosEvitadosSimulador(metricas.camposErrados)}</strong>
                </p>
                <p className="cg-tooltip__row">
                  <span>Tempo economizado</span>
                  <strong>{formatarSavingSimulador(metricas.savingErrosMinutos)}</strong>
                </p>
                <p className="cg-tooltip__row cg-tooltip__row--link-only">
                  <LinkBaseCalculoSimulador />
                </p>
              </>
            }
          />
        </div>

        <div className="sds-row-2">
          <div className="sds-card sds-card--grafico sds-card--com-tooltip" data-sds-tutorial-alvo="insights-evolucao">
            <div className="sds-card__head">
              <div className="sds-card__title">
                <ChartBar size={12} weight="duotone" style={{ color: '#3b82f6' }} />
                EVOLUÇÃO DIÁRIA
              </div>
              <div className="sds-periodo" role="group" aria-label="Período do gráfico">
                {PERIODOS.map((dias) => (
                  <button
                    key={dias}
                    type="button"
                    className={`sds-periodo__btn${periodoAtivo === dias ? ' sds-periodo__btn--active' : ''}`}
                    aria-pressed={periodoAtivo === dias}
                    onClick={() => {
                      setPeriodoAtivo(dias)
                      setBarraDestaque(null)
                      chartTooltip.aoSair()
                    }}
                  >
                    {dias}d
                  </button>
                ))}
              </div>
            </div>
            <div className="sr-insights-tt-host">
              <div className="sds-chart-bars" ref={chartTooltip.containerRef}>
                <div className="sds-chart-grid-y" aria-hidden>
                  {marcasEixoGrafico.map((val) => (
                    <span key={val}>{val}</span>
                  ))}
                </div>
                {chartBarras.map((b, i) => (
                  <div
                    key={`${periodoAtivo}-${b.date}`}
                    className={`sds-chart-bar-col${barraDestaque === i ? ' sds-chart-bar-col--active' : ''}`}
                    onMouseEnter={(e) => b.val > 0 && chartTooltip.aoEntrar(e, b)}
                    onMouseLeave={chartTooltip.aoSair}
                    onClick={() => setBarraDestaque(barraDestaque === i ? null : i)}
                  >
                    {b.val > 0 && (
                      <span className="sds-chart-bar-val" style={{ color: barraDestaque === i ? '#818cf8' : '#fff' }}>
                        {b.val}
                      </span>
                    )}
                    <div
                      className={`sds-chart-bar${barraDestaque === i ? ' sds-chart-bar--destaque' : ''}`}
                      style={{
                        height: b.val > 0 ? `${Math.max(8, (b.val / chartMax) * 140)}px` : 0,
                        opacity: barraDestaque === null || barraDestaque === i ? 1 : 0.35,
                      }}
                    />
                    <span style={{ fontSize: 9, fontWeight: 700, color: '#64748b', position: 'absolute', bottom: 2 }}>
                      {b.date}
                    </span>
                  </div>
                ))}
              </div>
              {chartTooltip.estado && (() => {
                const p = chartTooltip.estado.dados
                const total = p.val
                const pctAcerto = total > 0 ? (p.acertos / total) * 100 : 0
                const pctErro = total > 0 ? (p.erros / total) * 100 : 0
                return (
                  <TooltipGraficoInsightsSimulador
                    ancora={chartTooltip.estado.ancora}
                    containerRef={chartTooltip.containerRef}
                    conteudo={{
                      titulo: p.date,
                      subtitulo: `${p.documentos} ${p.documentos === 1 ? 'documento' : 'documentos'}`,
                      total,
                      totalRotulo: 'campos lidos',
                      barra: [
                        { cor: '#34d399', pct: pctAcerto },
                        { cor: '#f87171', pct: pctErro },
                      ],
                      linhas: [
                        { cor: '#34d399', rotulo: 'Acertos', valor: p.acertos, pct: pctAcerto },
                        { cor: '#f87171', rotulo: 'Erros (editados)', valor: p.erros, pct: pctErro },
                      ],
                    }}
                  />
                )
              })()}
            </div>
          </div>

          <div className="sds-card sds-card--com-tooltip" data-sds-tutorial-alvo="insights-donut">
            <div className="sds-card__title" style={{ marginBottom: 12 }}>
              <ChartPie size={12} weight="duotone" style={{ color: '#34d399' }} />
              CAMPOS LIDOS — CORRETOS × ERRADOS
            </div>
            <div className="sr-insights-tt-host" ref={acertosTooltip.containerRef}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
                <div
                  className="sds-campos-box sds-campos-box--ok"
                  onMouseEnter={(e) => acertosTooltip.aoEntrar(e, 'corretos')}
                  onMouseLeave={acertosTooltip.aoSair}
                >
                  <span style={{ fontSize: 10, color: '#64748b' }}>Corretos</span>
                  <p className="sds-campos-box__valor sds-text-success">{formatarNumeroSimulador(metricas.camposCorretos)}</p>
                </div>
                <div
                  className="sds-campos-box sds-campos-box--erro"
                  onMouseEnter={(e) => acertosTooltip.aoEntrar(e, 'errados')}
                  onMouseLeave={acertosTooltip.aoSair}
                >
                  <span style={{ fontSize: 10, color: '#64748b' }}>Errados</span>
                  <p className="sds-campos-box__valor sds-text-error">{formatarNumeroSimulador(metricas.camposErrados)}</p>
                </div>
              </div>
              {acertosTooltip.estado && (
                <TooltipGraficoInsightsSimulador
                  ancora={acertosTooltip.estado.ancora}
                  containerRef={acertosTooltip.containerRef}
                  preferirAcima
                  conteudo={{
                    titulo: acertosTooltip.estado.dados === 'corretos' ? 'Campos corretos' : 'Campos errados',
                    total: acertosTooltip.estado.dados === 'corretos' ? metricas.camposCorretos : metricas.camposErrados,
                    totalRotulo: 'na amostra',
                    linhas: [
                      {
                        cor: '#34d399',
                        rotulo: 'Taxa de acerto',
                        valor: formatarPercentualSimulador(metricas.taxaAcerto),
                      },
                      {
                        cor: '#f87171',
                        rotulo: 'Total de campos',
                        valor: metricas.totalCampos,
                      },
                    ],
                  }}
                />
              )}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 24, flex: 1 }}>
                <div
                  className="sds-donut-ring"
                  style={{
                    background: `conic-gradient(var(--sds-success) 0% ${pctCorretosDonut}%, var(--sds-error) ${pctCorretosDonut}% 100%)`,
                  }}
                >
                  <div className="sds-donut-hole" />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 11, fontWeight: 600 }}>
                  <span style={{ color: '#cbd5e1' }}>
                    <span className="sds-dot-success" />
                    Corretos {formatarPercentualSimulador(pctCorretosDonut)}
                  </span>
                  <span style={{ color: '#cbd5e1' }}>
                    <span className="sds-dot-error" />
                    Errados {formatarPercentualSimulador(pctErradosDonut)}
                  </span>
                  <span style={{ fontSize: 14, fontWeight: 800, color: '#fff' }}>{formatarPercentualSimulador(metricas.taxaAcerto)} acerto</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="sds-row-3">
          <div className="sds-card sds-card--com-tooltip" data-sds-tutorial-alvo="insights-tipos-documento">
            <div className="sds-card__title" style={{ marginBottom: 12 }}>
              <FileText size={12} weight="duotone" style={{ color: '#818cf8' }} />
              TIPOS DE DOCUMENTO
            </div>
            <div className="sr-insights-tt-host" ref={funilTooltip.containerRef}>
            {tiposDocumento.map((d) => (
              <div
                key={d.label}
                className="sds-funil-row"
                onMouseEnter={(e) => funilTooltip.aoEntrar(e, d)}
                onMouseLeave={funilTooltip.aoSair}
              >
                <span style={{ fontSize: 11, fontWeight: 600, color: '#cbd5e1' }}>{d.label}</span>
                <div className="sds-funil-bar">
                  <div className="sds-funil-fill" style={{ width: d.w }} />
                </div>
                <span style={{ fontWeight: 700 }}>{d.val}</span>
                <span style={{ color: '#64748b', fontSize: 10 }}>{formatarPercentualSimulador(d.pct)}</span>
              </div>
            ))}
            {funilTooltip.estado && (
              <TooltipGraficoInsightsSimulador
                ancora={funilTooltip.estado.ancora}
                containerRef={funilTooltip.containerRef}
                conteudo={{
                  titulo: funilTooltip.estado.dados.label,
                  total: funilTooltip.estado.dados.val,
                  totalRotulo: 'documentos',
                  linhas: [
                    { cor: '#818cf8', rotulo: 'Participação', valor: formatarPercentualTooltipInsightsSimulador(funilTooltip.estado.dados.pct) },
                    { cor: '#818cf8', rotulo: 'Total lidos', valor: metricas.totalDocumentos },
                  ],
                }}
              />
            )}
            </div>
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.04)', paddingTop: 12, marginTop: 'auto' }}>
              <div className="sds-card__title" style={{ color: '#f59e0b', marginBottom: 10 }}>
                <CurrencyDollar size={12} weight="bold" />
                ECONOMIA ESTIMADA
              </div>
              <div className="sds-economia-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div className="sds-campos-box sds-campos-box--ok">
                  <span className="sds-campos-box__rotulo">Digitação evitada</span>
                  <p className="sds-campos-box__valor sds-campos-box__valor--economia sds-text-success">
                    {formatarSavingSimulador(metricas.savingDigitaçãoMinutos)}
                  </p>
                </div>
                <div className="sds-campos-box sds-campos-box--erro">
                  <span className="sds-campos-box__rotulo">Correção de erros</span>
                  <p className="sds-campos-box__valor sds-campos-box__valor--economia sds-text-accent">
                    {formatarNumeroSimulador(metricas.camposErrados)}
                    <span className="sds-campos-box__unidade"> campos</span>
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="sds-card sds-card--com-tooltip" data-sds-tutorial-alvo="insights-ranking">
            <div className="sds-card__head">
              <div className="sds-card__title" style={{ color: '#f59e0b' }}>
                <Sparkle size={12} weight="bold" />
                RESULTADO POR TIPO DE FORNECEDOR
              </div>
              <div className="sds-tab-icones" role="tablist" aria-label="Tipo de emissor">
                {(Object.keys(ICONES_PARTICIPANTE) as TipoParticipante[]).map((tipo) => {
                  const icone = ICONES_PARTICIPANTE[tipo]
                  const ativo = tipoParticipante === tipo
                  return (
                    <div key={tipo} className="sds-tab-icone-wrap">
                      <button
                        type="button"
                        role="tab"
                        aria-selected={ativo}
                        aria-label={icone.rotulo}
                        className={`sds-tab-icone${ativo ? ' sds-tab-icone--active' : ''}`}
                        style={{ '--tab-cor': icone.cor, color: icone.cor } as CSSProperties}
                        onClick={() => {
                          setTipoParticipante(tipo)
                          setRankingSelecionado(null)
                        }}
                        onMouseEnter={() => setIconeParticipanteTooltip(tipo)}
                        onMouseLeave={() => setIconeParticipanteTooltip(null)}
                      >
                        {icone.render()}
                      </button>
                      {iconeParticipanteTooltip === tipo && (
                        <div className="sds-icone-tt" role="tooltip">
                          <strong>{icone.rotulo}</strong>
                          <span>{descricaoParticipanteSimulador(tipo)}</span>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
            <div className="sr-insights-tt-host" ref={rankingTooltip.containerRef} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, flex: 1 }}>
              <div className="sds-ranking-col">
                <span style={{ fontSize: 11, fontWeight: 800, color: '#cbd5e1' }}>Maiores acertos</span>
                {rankings.acertos.map((f, idx) => (
                  <div
                    key={f.name}
                    className={`sds-ranking-item${rankingSelecionado === idx ? ' sds-ranking-item--selected' : ''}`}
                    onMouseEnter={(e) =>
                      rankingTooltip.aoEntrar(e, {
                        nome: f.name,
                        stats: f.stats,
                        metrica: f.pct,
                        tipo: 'acerto',
                      })
                    }
                    onMouseLeave={rankingTooltip.aoSair}
                    onClick={() => setRankingSelecionado(rankingSelecionado === idx ? null : idx)}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                      <span style={{ fontSize: 11, fontWeight: 800 }}>
                        <span style={{ color: '#64748b', marginRight: 6 }}>{idx + 1}</span>
                        {f.name}
                      </span>
                      <span className="sds-text-success" style={{ fontSize: 10, fontWeight: 800 }}>{f.pct}</span>
                    </div>
                    <span style={{ fontSize: 10, color: '#64748b', marginLeft: 18 }}>{f.stats}</span>
                    <div className="sds-ranking-bar--acerto" />
                  </div>
                ))}
              </div>
              <div className="sds-ranking-col">
                <span style={{ fontSize: 11, fontWeight: 800, color: '#cbd5e1' }}>Maiores erros</span>
                {rankings.erros.map((f, idx) => (
                  <div
                    key={f.name}
                    className={`sds-ranking-item${rankingSelecionado === idx + 10 ? ' sds-ranking-item--selected' : ''}`}
                    onMouseEnter={(e) =>
                      rankingTooltip.aoEntrar(e, {
                        nome: f.name,
                        stats: f.stats,
                        metrica: f.err,
                        tipo: 'erro',
                      })
                    }
                    onMouseLeave={rankingTooltip.aoSair}
                    onClick={() => setRankingSelecionado(rankingSelecionado === idx + 10 ? null : idx + 10)}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                      <span style={{ fontSize: 11, fontWeight: 800 }}>
                        <span style={{ color: '#64748b', marginRight: 6 }}>{idx + 1}</span>
                        {f.name}
                      </span>
                      <span className="sds-text-error" style={{ fontSize: 10, fontWeight: 800 }}>{f.err}</span>
                    </div>
                    <span style={{ fontSize: 10, color: '#64748b', marginLeft: 18 }}>{f.stats}</span>
                    <div className="sds-ranking-bar--erro" />
                  </div>
                ))}
              </div>
              {rankingTooltip.estado && (
                <TooltipGraficoInsightsSimulador
                  ancora={rankingTooltip.estado.ancora}
                  containerRef={rankingTooltip.containerRef}
                  conteudo={{
                    titulo: rankingTooltip.estado.dados.nome,
                    subtitulo: ICONES_PARTICIPANTE[tipoParticipante].rotulo,
                    total: rankingTooltip.estado.dados.metrica,
                    totalRotulo: rankingTooltip.estado.dados.tipo === 'acerto' ? 'acerto' : 'erros',
                    linhas: [
                      {
                        cor: rankingTooltip.estado.dados.tipo === 'acerto' ? '#34d399' : '#f87171',
                        rotulo: 'Detalhe',
                        valor: rankingTooltip.estado.dados.stats,
                      },
                    ],
                  }}
                />
              )}
            </div>
          </div>
        </div>
      </>
    )
  }

  function renderLista() {
    return (
      <div className="sds-card" style={{ minHeight: 480 }} data-sds-tutorial-alvo="lista-tabela">
        <table className="sds-lista-table">
          <thead>
            <tr>
              <th>LEITURA</th>
              <th>STATUS</th>
              <th>DOCUMENTOS</th>
              <th>DATA</th>
            </tr>
          </thead>
          <tbody>
            {listaLeituras.map((row, indice) => (
              <Fragment key={row.id}>
                <tr
                  className={`sds-lista-row${linhaListaExpandida === row.id ? ' sds-lista-row--expanded' : ''}`}
                  onClick={() => setLinhaListaExpandida(linhaListaExpandida === row.id ? null : row.id)}
                  {...(indice === 0 ? { 'data-sds-tutorial-alvo': 'lista-linha' } : {})}
                >
                  <td style={{ fontWeight: 700 }}>{row.nome}</td>
                  <td>
                    <span
                      className={`sds-pill ${row.status === 'Conferido' ? 'sds-pill--ok' : 'sds-pill--proc'}`}
                      {...(indice === 0 ? { 'data-sds-tutorial-alvo': 'lista-status' } : {})}
                    >
                      {row.status}
                    </span>
                  </td>
                  <td>{row.docs}</td>
                  <td style={{ color: '#64748b' }}>{row.data}</td>
                </tr>
                {linhaListaExpandida === row.id && (
                  <tr>
                    <td colSpan={4} style={{ background: 'rgba(99,102,241,0.04)', padding: '12px 16px' }}>
                      <div
                        style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}
                        data-sds-tutorial-alvo="lista-detalhe-metricas"
                      >
                        <span style={{ fontSize: 11, color: '#94a3b8' }}>
                          Workspace: {rotuloEmpresaEscopo.nome} · {mesesUsoEscopo} meses · ~{leiturasPorMesEscopo.toLocaleString('pt-BR')} leituras/mês · Campos extraídos: {row.camposExtraidos} · Conferidos: {row.camposConferidos}
                        </span>
                        <button
                          type="button"
                          className="sds-btn-novo"
                          style={{ fontSize: 10, padding: '4px 10px' }}
                          data-sds-tutorial-alvo="lista-detalhe-insights"
                          onClick={(e) => {
                            e.stopPropagation()
                            setAbaAtiva('insights')
                          }}
                        >
                          Ver no Insights
                        </button>
                      </div>
                    </td>
                  </tr>
                )}
              </Fragment>
            ))}
          </tbody>
        </table>
      </div>
    )
  }

  return (
    <div className="sds-shell-wrap">
      {onFecharSimulador && (
        <button
          type="button"
          className="interactive-simulator-close"
          aria-label="Fechar demonstração"
          title="Fechar"
          onClick={(e) => {
            e.stopPropagation()
            solicitarFecharShell()
          }}
        >
          <X size={20} weight="bold" />
        </button>
      )}

    <div className="sds-root" ref={refRaizTutorial} onClick={(e) => e.stopPropagation()}>
      <aside className="sds-sidebar" data-sds-tutorial-alvo="shell-nav-lateral">
        <div className="sds-brand-wrapper" ref={prodDropdownRef}>
          <div
            className={`sds-brand${productDropdownOpen ? ' sds-brand--open' : ''}`}
            onClick={() => {
              setEmpresaDropdownOpen(false)
              setProductDropdownOpen((v) => !v)
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Sparkle size={16} weight="fill" style={{ color: '#818cf8' }} />
                <span style={{ fontWeight: 800, fontSize: 14 }}>Smart Docs</span>
              </div>
              <span style={{ fontSize: 10, color: '#64748b', marginLeft: 24 }}>by Gravity</span>
            </div>
            {productDropdownOpen ? <CaretUp size={14} /> : <CaretDown size={14} style={{ color: '#64748b' }} />}
          </div>

          {productDropdownOpen && (
            <div className="sds-dropdown" onClick={(e) => e.stopPropagation()}>
              <div style={{ position: 'relative' }}>
                <MagnifyingGlass size={12} style={{ position: 'absolute', left: 8, top: 9, color: '#475569' }} />
                <input
                  type="text"
                  className="sds-dropdown__search"
                  placeholder="Buscar produto..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="sds-dropdown__list">
              {produtosFiltrados.map((prod) => (
                <div
                  key={prod.name}
                  className={`sds-dropdown__item${prod.selected ? ' sds-dropdown__item--selected' : ''}`}
                  onClick={() => {
                    if (prod.selected) setProductDropdownOpen(false)
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    {prod.icon}
                    <div>
                      <span style={{ fontSize: 11, fontWeight: prod.selected ? 700 : 600, color: prod.selected ? '#818cf8' : '#cbd5e1' }}>
                        {prod.name}
                      </span>
                      {prod.subtitle && (
                        <span style={{ display: 'block', fontSize: 9, color: '#64748b' }}>{prod.subtitle}</span>
                      )}
                    </div>
                  </div>
                  {prod.selected && <Check size={12} weight="bold" style={{ color: '#818cf8', flexShrink: 0 }} />}
                  {!prod.selected && prod.subtitle && <ArrowRight size={12} style={{ color: '#64748b', flexShrink: 0 }} />}
                </div>
              ))}
              </div>
            </div>
          )}
        </div>

        <div className="sds-empresa-wrapper" ref={empresaDropdownRef} data-sds-tutorial-alvo="insights-seletor-filial">
          <button
            type="button"
            className={`sds-empresa${empresaDropdownOpen ? ' sds-empresa--open' : ''}`}
            aria-expanded={empresaDropdownOpen}
            aria-haspopup="listbox"
            onClick={() => {
              setEmpresaDropdownOpen((v) => !v)
              setProductDropdownOpen(false)
            }}
          >
            <div className="sds-empresa__avatar">
              {empresasSelecionadas.length === 1 ? (
                <span>{rotuloEmpresaEscopo.avatarLetra}</span>
              ) : (
                <Buildings size={14} weight="duotone" />
              )}
            </div>
            <div className="sds-empresa__info">
              <span className="sds-empresa__nome">{rotuloEmpresaEscopo.nome}</span>
              <span className="sds-empresa__plano">{rotuloEmpresaEscopo.plano}</span>
            </div>
            {empresaDropdownOpen ? <CaretUp size={12} weight="bold" /> : <CaretDown size={12} weight="bold" />}
          </button>

          {empresaDropdownOpen && (
            <div className="sds-empresa-dropdown" role="listbox" onClick={(e) => e.stopPropagation()}>
              <div className="sds-empresa-dropdown__search-wrap">
                <MagnifyingGlass size={12} />
                <input
                  type="text"
                  className="sds-empresa-dropdown__search"
                  placeholder="Buscar empresa…"
                  value={empresaSearch}
                  onChange={(e) => setEmpresaSearch(e.target.value)}
                />
              </div>
              {empresasFiltradas.length > 1 && (
                <div className="sds-empresa-dropdown__toolbar">
                  <button
                    type="button"
                    className="sds-empresa-dropdown__toolbar-btn"
                    onClick={() => definirEscopoEmpresasFiltradas(!todosFiltradosSelecionados)}
                  >
                    {todosFiltradosSelecionados ? 'Desmarcar tudo' : 'Selecionar tudo'}
                  </button>
                </div>
              )}
              <div className="sds-empresa-dropdown__list">
              {empresasFiltradas.map((empresa) => {
                const selecionada = idsEmpresasEscopo.includes(empresa.id)
                return (
                  <button
                    key={empresa.id}
                    type="button"
                    role="option"
                    aria-selected={selecionada}
                    className={`sds-empresa-item${selecionada ? ' sds-empresa-item--ativa' : ''}`}
                    onClick={() => alternarEmpresaEscopo(empresa.id)}
                  >
                    <span className="sds-empresa-item__check" aria-hidden>
                      {selecionada ? (
                        <CheckSquare size={16} weight="fill" style={{ color: '#818cf8' }} />
                      ) : (
                        <Square size={16} weight="regular" style={{ color: '#64748b' }} />
                      )}
                    </span>
                    <div className="sds-empresa-item__avatar">{empresa.nome.charAt(0)}</div>
                    <div className="sds-empresa-item__info">
                      <span className="sds-empresa-item__nome">{empresa.nome}</span>
                      <span className="sds-empresa-item__plano">{empresa.plano}</span>
                    </div>
                  </button>
                )
              })}
              </div>
              <div className="sds-empresa-dropdown__footer">
                <button type="button" className="sds-empresa-action">
                  <Plus size={12} weight="bold" />
                  Criar empresa
                </button>
                <button type="button" className="sds-empresa-action">
                  <Gear size={12} weight="duotone" />
                  Gerenciar empresas
                </button>
              </div>
            </div>
          )}
        </div>

        <div className={`sds-nav-group${meuEspacoAberto ? ' sds-nav-group--open' : ''}`} data-sds-tutorial-alvo="shell-meu-espaco-submenu">
          <button
            type="button"
            className={`sds-nav-item sds-nav-parent${meuEspacoAberto ? ' sds-nav-item--active' : ''}`}
            onClick={() => setMeuEspacoAberto((v) => !v)}
          >
            <UserCircle size={16} weight="duotone" />
            <span style={{ flex: 1 }}>Meu Espaço</span>
            {meuEspacoAberto ? <CaretUp size={12} weight="bold" /> : <CaretDown size={12} weight="bold" />}
          </button>
          {meuEspacoAberto && (
            <div className="sds-submenu">
              {MEU_ESPACO_ITENS.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className={`sds-nav-item sds-submenu-item${meuEspacoItemAtivo === item.id ? ' sds-nav-item--active' : ''}`}
                  onClick={() => {
                    setMeuEspacoItemAtivo(item.id)
                    setSidebarAtivo('insights')
                  }}
                >
                  {item.icon}
                  <span style={{ flex: 1 }}>{item.label}</span>
                  <span className="sds-nav-badge">Em Breve</span>
                </button>
              ))}
            </div>
          )}
        </div>

        <div>
          <span style={{ fontSize: 9, fontWeight: 700, color: '#475569', letterSpacing: '0.05em' }}>SMART DOCS</span>
          <button
            type="button"
            className={`sds-nav-item${sidebarAtivo === 'historico' ? ' sds-nav-item--active' : ''}`}
            onClick={() => {
              setSidebarAtivo('historico')
              setMeuEspacoItemAtivo(null)
            }}
            style={{ marginTop: 6 }}
          >
            <Clock size={14} />
            Histórico
          </button>
          <button
            type="button"
            className={`sds-nav-item${sidebarAtivo === 'config' ? ' sds-nav-item--active' : ''}`}
            onClick={() => {
              setSidebarAtivo('config')
              setMeuEspacoItemAtivo(null)
            }}
          >
            <Gear size={14} />
            Configurações
          </button>
        </div>
      </aside>

      <div className="sds-main">
        <div className="sds-main-header">
          <header className="sds-mtg-header" role="banner">
            <div className="sds-mtg-left">
              <div className="sds-mtg-page-header">
                <span className="sds-mtg-page-icon" aria-hidden="true">
                  {abaAtiva === 'insights' ? (
                    <FileText size={22} weight="duotone" />
                  ) : (
                    <ListBullets size={22} weight="duotone" />
                  )}
                </span>
                <span className="sds-mtg-page-title">
                  {abaAtiva === 'insights' ? 'Insights' : 'Lista'}
                </span>
              </div>
            </div>
            <div className="sds-mtg-right">
              <button type="button" className="sds-mtg-nav-btn" aria-label="Voltar ao Hub">
                <GlobeHemisphereWest size={13} weight="duotone" />
                Hub
              </button>
              <button type="button" className="sds-mtg-icon-btn" aria-label="Buscar na tela">
                <MagnifyingGlass size={17} />
              </button>
              <button type="button" className="sds-mtg-icon-btn" aria-label="Gravity University">
                <GraduationCap size={17} weight="duotone" />
              </button>
              <button type="button" className="sds-mtg-icon-btn" aria-label="Dicas" style={{ color: '#818cf8' }}>
                <Info size={17} weight="fill" />
              </button>
              <button type="button" className="sds-mtg-lang-btn" aria-label="Idioma">
                BR
              </button>
              <button type="button" className="sds-mtg-icon-btn" aria-label="Configurações">
                <Gear size={17} weight="duotone" />
              </button>
              <div className="sds-mtg-sep" aria-hidden="true" />
              <div className="sds-mtg-avatar" aria-hidden="true">D</div>
            </div>
          </header>

          <div className="smart-read-vis-toolbar">
            <nav className="srt-tabs" aria-label="Modo de visualização do Smart Docs" role="tablist">
              <button
                type="button"
                role="tab"
                aria-selected={abaAtiva === 'insights'}
                className={`srt-tab${abaAtiva === 'insights' ? ' srt-tab--active' : ''}`}
                onClick={() => setAbaAtiva('insights')}
                data-sds-tutorial-alvo="shell-aba-insights"
              >
                <ChartPieSlice weight="duotone" size={16} />
                <span>Insights</span>
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={abaAtiva === 'lista'}
                className={`srt-tab${abaAtiva === 'lista' ? ' srt-tab--active' : ''}`}
                onClick={() => setAbaAtiva('lista')}
                data-sds-tutorial-alvo="insights-aba-lista"
              >
                <ListBullets weight="duotone" size={16} />
                <span>Lista</span>
              </button>
            </nav>
            <div className="smart-read-vis-toolbar__acoes">
              <div className="sr-dropdown-novo">
                <button
                  type="button"
                  className="sds-btn-novo"
                  data-sds-tutorial-alvo="insights-novo"
                  aria-expanded={novoDropdownAberto}
                  aria-haspopup="menu"
                  onClick={() => setNovoDropdownAberto((v) => !v)}
                >
                  <Plus size={14} weight="bold" />
                  Novo
                  <CaretDown
                    size={12}
                    weight="bold"
                    style={{
                      marginLeft: 2,
                      transition: 'transform 0.15s',
                      transform: novoDropdownAberto ? 'rotate(180deg)' : 'none',
                    }}
                  />
                </button>
                {novoDropdownAberto && (
                  <div className="sr-dropdown-novo-menu sr-dropdown-novo-menu--direita" role="menu">
                    <button
                      type="button"
                      className="sr-dropdown-novo-item"
                      role="menuitem"
                      onClick={() => {
                        setNovoDropdownAberto(false)
                        setWizardIniciado(true)
                        setModalNovoAberto(true)
                      }}
                    >
                      <span className="sr-dropdown-novo-item-icone">
                        <FileMagnifyingGlass size={13} weight="duotone" />
                      </span>
                      <span>Nova Leitura</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="sds-content" data-sds-tutorial-alvo="shell-conteudo">
          {meuEspacoItemAtivo && (
            <div
              style={{ marginBottom: 12, padding: '8px 12px', background: 'rgba(99,102,241,0.08)', borderRadius: 8, fontSize: 11, color: '#94a3b8' }}
              data-sds-tutorial-alvo="shell-banner-preview"
            >
              {MEU_ESPACO_ITENS.find((i) => i.id === meuEspacoItemAtivo)?.label} — módulo em breve no tenant (simulação).
            </div>
          )}
          {sidebarAtivo === 'historico' && abaAtiva === 'insights' && !meuEspacoItemAtivo && (
            <div
              style={{ marginBottom: 12, padding: '8px 12px', background: 'rgba(99,102,241,0.08)', borderRadius: 8, fontSize: 11, color: '#94a3b8' }}
              data-sds-tutorial-alvo="shell-banner-historico"
            >
              Histórico — {rotuloEmpresaEscopo.nome} · últimos 30 dias (simulação).
            </div>
          )}
          {sidebarAtivo === 'config' && (
            <div
              style={{ marginBottom: 12, padding: '8px 12px', background: 'rgba(99,102,241,0.08)', borderRadius: 8, fontSize: 11, color: '#94a3b8' }}
              data-sds-tutorial-alvo="shell-banner-config"
            >
              Configurações — colunas e preferências de leitura (simulação).
            </div>
          )}
          {abaAtiva === 'insights' ? renderInsights() : renderLista()}
        </div>
      </div>

      <NovaLeituraSimuladorSmartDoc
        aberto={modalNovoAberto}
        onFechar={fecharModalNovo}
        onSairDemonstracao={fecharSairShell}
        onFluxoCompleto={() => setWizardCompletado(true)}
        destinoInicial={destinoNovaLeitura}
        onDestinoInicialConsumido={() => setDestinoNovaLeitura(null)}
        onIrParaLista={() => {
          setWizardCompletado(true)
          setAbaAtiva('lista')
          setLinhaListaExpandida('1')
        }}
      />

      {idTelaTutorial && (
        <TutorialOpcionalSimuladorSmartDoc
          idTela={idTelaTutorial}
          habilitado
          onAlvoDestacadoChange={setAlvoTutorialDestacado}
        />
      )}
    </div>

      {conteudoDespedidaShell && (
        <ModalDespedidaSimuladorSmartDoc
          aberto={despedidaShellAberta}
          conteudo={conteudoDespedidaShell}
          onContinuar={() => setDespedidaShellAberta(false)}
          onSair={falarComConsultorShell}
          onFecharSair={fecharSairShell}
          onPendencia={irParaPendenciaShell}
        />
      )}
    </div>
  )
}
