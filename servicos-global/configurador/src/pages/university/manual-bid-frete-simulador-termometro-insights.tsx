import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { createPortal } from 'react-dom'
import { Check, FunnelSimple } from '@phosphor-icons/react'
import { useTranslation } from 'react-i18next'
import {
  buildSerieTermometroBases,
  formatarMoedaInsightsBidFrete,
  type ComponentePrecoTermometro,
  type TipoBaseTermometroHistorico,
} from '@produto/bid-frete-internacional/client/src/shared/infograficos-fluxo-cotacao-bid-frete-internacional'
import { GraficoAreaTermometro } from '@produto/bid-frete-internacional/client/src/shared/graficos-insights-cotacao-bid-frete-internacional'
import { INCOTERMS } from '@produto/bid-frete-internacional/client/src/shared/types'
import { HISTORICO_DEMO_TERMOMETRO_PAINEL_INSIGHTS } from './manual-bid-frete-mock-historico-termometro-painel-insights'
import { PROPOSTAS_DEMO_PAINEL_INSIGHTS_BID_FRETE } from './manual-bid-frete-mock-propostas-painel-insights'
import { WrapperAlvoAffordanceBidFrete } from './manual-bid-frete-affordance-interativo'

type ManualBidFreteSimuladorTermometroInsightsProps = {
  interativo?: boolean
  ativo?: boolean
  destacarAffordance?: boolean
  cursorAlvo?: string
  rotuloAffordance?: string
  onSelecionar?: () => void
}

const COMPONENTES_TERMOMETRO: ComponentePrecoTermometro[] = [
  'FRETE_BASE',
  'TAXAS_ORIGEM',
  'TAXAS_DESTINO',
  'TOTAL',
]

const INCOTERM_COTACAO_DEMO = 'FOB'

function rotuloComponenteTermometro(
  componente: ComponentePrecoTermometro,
  t: (k: string, d?: string) => string,
): string {
  switch (componente) {
    case 'FRETE_BASE':
      return t('bidfrete.detalhe_cotacao.cockpit_termometro_componente_frete', 'Frete base')
    case 'TAXAS_ORIGEM':
      return t('bidfrete.detalhe_cotacao.cockpit_termometro_componente_origem', 'Taxas origem')
    case 'TAXAS_DESTINO':
      return t('bidfrete.detalhe_cotacao.cockpit_termometro_componente_destino', 'Taxas destino')
    case 'TOTAL':
      return t('bidfrete.detalhe_cotacao.cockpit_termometro_componente_total', 'Total')
    default:
      return componente
  }
}

/** Manual §7.02 — Termômetro histórico com histórico simulado, gráfico real e filtros do cockpit. */
export function ManualBidFreteSimuladorTermometroInsights({
  interativo = false,
  ativo = false,
  destacarAffordance = false,
  cursorAlvo,
  rotuloAffordance = 'Termômetro histórico',
  onSelecionar,
}: ManualBidFreteSimuladorTermometroInsightsProps) {
  const { t } = useTranslation()

  const [bases, setBases] = useState<TipoBaseTermometroHistorico[]>(['CONTRATADO'])
  const [componentes, setComponentes] = useState<ComponentePrecoTermometro[]>(['FRETE_BASE'])
  const [incotermsSelecionados, setIncotermsSelecionados] = useState<string[]>([])
  const [filtrosAbertos, setFiltrosAbertos] = useState(false)
  const filtroBotaoRef = useRef<HTMLDivElement>(null)
  const filtroPainelRef = useRef<HTMLDivElement>(null)
  const [filtroCoords, setFiltroCoords] = useState({ top: 0, right: 0 })

  const alternarIncoterm = useCallback((item: string) => {
    setIncotermsSelecionados((atual) => (
      atual.includes(item) ? atual.filter((i) => i !== item) : [...atual, item]
    ))
  }, [])

  const alternarBase = useCallback((item: TipoBaseTermometroHistorico) => {
    setBases((atual) => {
      const proximo = atual.includes(item)
        ? atual.filter((b) => b !== item)
        : [...atual, item]
      return proximo.length > 0 ? proximo : atual
    })
  }, [])

  const alternarComponente = useCallback((item: ComponentePrecoTermometro) => {
    setComponentes((atual) => {
      if (item === 'TOTAL') return ['TOTAL']
      const semTotal = atual.filter((c) => c !== 'TOTAL')
      const proximo = semTotal.includes(item)
        ? semTotal.filter((c) => c !== item)
        : [...semTotal, item]
      return proximo.length > 0 ? proximo : atual
    })
  }, [])

  const atualizarFiltroCoords = useCallback(() => {
    if (!filtroBotaoRef.current) return
    const r = filtroBotaoRef.current.getBoundingClientRect()
    setFiltroCoords({ top: r.bottom + 6, right: window.innerWidth - r.right })
  }, [])

  useEffect(() => {
    if (!filtrosAbertos) return
    atualizarFiltroCoords()
    window.addEventListener('resize', atualizarFiltroCoords)
    window.addEventListener('scroll', atualizarFiltroCoords, true)
    return () => {
      window.removeEventListener('resize', atualizarFiltroCoords)
      window.removeEventListener('scroll', atualizarFiltroCoords, true)
    }
  }, [filtrosAbertos, atualizarFiltroCoords])

  useEffect(() => {
    if (!filtrosAbertos) return
    function handleClick(e: MouseEvent) {
      const target = e.target as Node
      if (filtroBotaoRef.current?.contains(target)) return
      if (filtroPainelRef.current?.contains(target)) return
      setFiltrosAbertos(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [filtrosAbertos])

  const entradasBases = useMemo(
    () => bases.map((tipoBase) => ({
      tipoBase,
      historico: HISTORICO_DEMO_TERMOMETRO_PAINEL_INSIGHTS,
    })),
    [bases],
  )

  const termometro = useMemo(
    () => buildSerieTermometroBases(
      PROPOSTAS_DEMO_PAINEL_INSIGHTS_BID_FRETE,
      entradasBases,
      componentes,
    ),
    [entradasBases, componentes],
  )

  const moeda = PROPOSTAS_DEMO_PAINEL_INSIGHTS_BID_FRETE[0]?.moeda_proposta_bid_frete_internacional ?? 'USD'
  const valorMercado = termometro.termometroMedia6Meses != null
    ? formatarMoedaInsightsBidFrete(termometro.termometroMedia6Meses, moeda)
    : '—'
  const valorDele = termometro.termometroValorDele != null
    ? formatarMoedaInsightsBidFrete(termometro.termometroValorDele, moeda)
    : '—'
  const rotuloComponentes = componentes
    .map((item) => rotuloComponenteTermometro(item, t))
    .join(' + ')

  const filtrosDestacados =
    bases.length !== 1
    || bases[0] !== 'CONTRATADO'
    || componentes.length !== 1
    || componentes[0] !== 'FRETE_BASE'
    || incotermsSelecionados.length > 0

  const painelFiltros = filtrosAbertos && typeof document !== 'undefined'
    ? createPortal(
        <div
          ref={filtroPainelRef}
          className="dc-termometro-filtros-painel"
          style={{ top: filtroCoords.top, right: filtroCoords.right }}
          role="dialog"
          aria-label={t(
            'bidfrete.detalhe_cotacao.cockpit_termometro_filtros_aria',
            'Filtros do termômetro histórico',
          )}
        >
          <div
            className="dc-termometro-filtros-secao"
            role="listbox"
            aria-multiselectable="true"
            aria-label={t(
              'bidfrete.detalhe_cotacao.cockpit_termometro_seletor_aria',
              'Base do termômetro histórico',
            )}
          >
            <span className="dc-termometro-filtros-secao-titulo">
              {t('bidfrete.detalhe_cotacao.cockpit_termometro_base_label', 'Base')}
            </span>
            {(['CONTRATADO', 'PROPOSTAS_RECEBIDAS'] as const).map((item) => {
              const ativo = bases.includes(item)
              return (
                <button
                  key={item}
                  type="button"
                  role="option"
                  aria-selected={ativo}
                  className={`dc-termometro-filtros-opcao${ativo ? ' dc-termometro-filtros-opcao--ativa' : ''}`}
                  onClick={() => alternarBase(item)}
                >
                  <span
                    className={`dc-termometro-filtros-check dc-termometro-filtros-check--caixa${ativo ? ' dc-termometro-filtros-check--marcado' : ''}`}
                    aria-hidden
                  >
                    {ativo ? <Check size={11} weight="bold" /> : null}
                  </span>
                  {item === 'CONTRATADO'
                    ? t('bidfrete.detalhe_cotacao.cockpit_termometro_base_contratado', 'Contratado')
                    : t('bidfrete.detalhe_cotacao.cockpit_termometro_base_propostas', 'Propostas')}
                </button>
              )
            })}
          </div>
          <div className="dc-termometro-filtros-separador" role="separator" />
          <div
            className="dc-termometro-filtros-secao"
            role="listbox"
            aria-multiselectable="true"
            aria-label={t(
              'bidfrete.detalhe_cotacao.cockpit_termometro_componente_aria',
              'Componente de preço',
            )}
          >
            <span className="dc-termometro-filtros-secao-titulo">
              {t('bidfrete.detalhe_cotacao.cockpit_termometro_componente', 'Componente')}
            </span>
            {COMPONENTES_TERMOMETRO.map((item) => {
              const itemAtivo = componentes.includes(item)
              return (
                <button
                  key={item}
                  type="button"
                  role="option"
                  aria-selected={itemAtivo}
                  className={`dc-termometro-filtros-opcao${itemAtivo ? ' dc-termometro-filtros-opcao--ativa' : ''}`}
                  onClick={() => alternarComponente(item)}
                >
                  <span
                    className={`dc-termometro-filtros-check dc-termometro-filtros-check--caixa${itemAtivo ? ' dc-termometro-filtros-check--marcado' : ''}`}
                    aria-hidden
                  >
                    {itemAtivo ? <Check size={11} weight="bold" /> : null}
                  </span>
                  {rotuloComponenteTermometro(item, t)}
                </button>
              )
            })}
          </div>
          <div className="dc-termometro-filtros-separador" role="separator" />
          <div
            className="dc-termometro-filtros-secao"
            role="listbox"
            aria-multiselectable="true"
            aria-label={t(
              'bidfrete.detalhe_cotacao.cockpit_termometro_incoterm_aria',
              'Filtrar por incoterm',
            )}
          >
            <span className="dc-termometro-filtros-secao-titulo">
              {t('bidfrete.detalhe_cotacao.cockpit_termometro_incoterm_label', 'Incoterm')}
            </span>
            <button
              type="button"
              role="option"
              aria-selected={incotermsSelecionados.length === 0}
              className={`dc-termometro-filtros-opcao${incotermsSelecionados.length === 0 ? ' dc-termometro-filtros-opcao--ativa' : ''}`}
              onClick={() => setIncotermsSelecionados([])}
            >
              <span
                className={`dc-termometro-filtros-check dc-termometro-filtros-check--caixa${incotermsSelecionados.length === 0 ? ' dc-termometro-filtros-check--marcado' : ''}`}
                aria-hidden
              >
                {incotermsSelecionados.length === 0 ? <Check size={11} weight="bold" /> : null}
              </span>
              {t('bidfrete.detalhe_cotacao.cockpit_termometro_incoterm_todos', 'Todos')}
            </button>
            <div className="dc-termometro-filtros-incoterm-grid">
              {INCOTERMS.map((item) => {
                const itemAtivo = incotermsSelecionados.includes(item)
                const daCotacao = item === INCOTERM_COTACAO_DEMO
                return (
                  <button
                    key={item}
                    type="button"
                    role="option"
                    aria-selected={itemAtivo}
                    className={`dc-termometro-filtros-incoterm-chip${itemAtivo ? ' dc-termometro-filtros-incoterm-chip--ativo' : ''}${daCotacao ? ' dc-termometro-filtros-incoterm-chip--cotacao' : ''}`}
                    title={daCotacao
                      ? t(
                        'bidfrete.detalhe_cotacao.cockpit_termometro_incoterm_da_cotacao',
                        'Incoterm desta cotação',
                      )
                      : undefined}
                    onClick={() => alternarIncoterm(item)}
                  >
                    {item}
                  </button>
                )
              })}
            </div>
          </div>
        </div>,
        document.body,
      )
    : null

  const cabecalho = (
    <header className="dc-smart-card-head dc-smart-card-head--termometro">
      <span>{t('bidfrete.detalhe_cotacao.cockpit_termometro', 'Termômetro histórico')}</span>
      <div className="dc-termometro-head-acoes" ref={filtroBotaoRef}>
        <button
          type="button"
          className={`dc-termometro-filtros-botao${filtrosDestacados ? ' dc-termometro-filtros-botao--destacado' : ''}`}
          aria-haspopup="dialog"
          aria-expanded={filtrosAbertos}
          aria-label={t(
            'bidfrete.detalhe_cotacao.cockpit_termometro_filtros_aria',
            'Filtros do termômetro histórico',
          )}
          title={t('bidfrete.detalhe_cotacao.cockpit_termometro_filtros', 'Filtros')}
          onClick={() => setFiltrosAbertos((v) => !v)}
        >
          <FunnelSimple weight={filtrosDestacados ? 'fill' : 'bold'} size={13} aria-hidden />
          {!filtrosDestacados && (
            <span className="dc-termometro-filtros-botao-rotulo">
              {t('bidfrete.detalhe_cotacao.cockpit_termometro_filtros', 'Filtros')}
            </span>
          )}
        </button>
      </div>
    </header>
  )

  const canvas = (
    <div className="dc-smart-termometro-canvas">
      <div className="dc-smart-termometro-canvas-metricas">
        <div className="dc-smart-termometro-dele-mercado">
          <div className="dc-smart-termometro-preco">
            <span className="dc-smart-termometro-preco-rotulo">
              {t('bidfrete.detalhe_cotacao.cockpit_termometro_dele', 'Dele')}
            </span>
            <span className="dc-smart-valor-hero">{valorDele}</span>
          </div>
          <div className="dc-smart-termometro-preco dc-smart-termometro-preco--mercado">
            <span className="dc-smart-termometro-preco-rotulo">
              {t('bidfrete.detalhe_cotacao.cockpit_termometro_mercado', 'Mercado')}
            </span>
            <span className="dc-smart-valor-hero dc-smart-valor-hero--secundario">{valorMercado}</span>
            <span className="dc-smart-termometro-sub">
              {t('bidfrete.detalhe_cotacao.cockpit_termometro_media_6m', 'Média 6 Meses')}
            </span>
          </div>
        </div>
        <span className="dc-smart-termometro-contexto" title={rotuloComponentes}>
          {rotuloComponentes}
        </span>
      </div>
      <div className="dc-term-chart-slot">
        <GraficoAreaTermometro
          serie={termometro.serieHistorico6Meses ?? []}
          moeda={moeda}
          mediaFallback={termometro.termometroMedia6Meses}
          modoDemonstracao={false}
          preencherLarguraPlot
        />
      </div>
    </div>
  )

  if (!interativo) {
    return (
      <article className="dc-smart-card dc-smart-card--termometro">
        {cabecalho}
        {painelFiltros}
        {canvas}
      </article>
    )
  }

  return (
    <WrapperAlvoAffordanceBidFrete
      destacado={destacarAffordance}
      rotuloClique={rotuloAffordance}
      cursorAlvo={cursorAlvo}
      conviteViagemPeriodico={destacarAffordance}
      intervaloConviteSegundos={5}
      className={[
        'dc-smart-card',
        'dc-smart-card--termometro',
        'sim-insights-termometro-affordance',
        'sim-affordance-alvo--card-termometro',
      ].join(' ')}
      as="article"
    >
      {cabecalho}
      {painelFiltros}
      <button
        type="button"
        className={[
          'sim-insights-interativo',
          'sim-insights-termometro-shell',
          ativo ? 'sim-insights-interativo--ativa' : '',
        ].filter(Boolean).join(' ')}
        onClick={onSelecionar}
        aria-pressed={ativo}
      >
        {canvas}
      </button>
    </WrapperAlvoAffordanceBidFrete>
  )
}
