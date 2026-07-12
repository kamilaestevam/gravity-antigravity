import React, { useMemo } from 'react'
import { FunnelSimple } from '@phosphor-icons/react'
import { useTranslation } from 'react-i18next'
import {
  buildSerieTermometro,
  formatarMoedaInsightsBidFrete,
} from '@produto/bid-frete-internacional/client/src/shared/infograficos-fluxo-cotacao-bid-frete-internacional'
import { GraficoAreaTermometro } from '@produto/bid-frete-internacional/client/src/shared/graficos-insights-cotacao-bid-frete-internacional'
import { HISTORICO_DEMO_TERMOMETRO_PAINEL_INSIGHTS } from './manual-bid-frete-mock-historico-termometro-painel-insights'
import { PROPOSTAS_DEMO_PAINEL_INSIGHTS_BID_FRETE } from './manual-bid-frete-mock-propostas-painel-insights'

/** Manual §7.02 — Termômetro histórico com histórico simulado e gráfico real. */
export function ManualBidFreteSimuladorTermometroInsights() {
  const { t } = useTranslation()

  const termometro = useMemo(
    () => buildSerieTermometro(
      PROPOSTAS_DEMO_PAINEL_INSIGHTS_BID_FRETE,
      HISTORICO_DEMO_TERMOMETRO_PAINEL_INSIGHTS,
      'CONTRATADO',
      'FRETE_BASE',
    ),
    [],
  )

  const moeda = PROPOSTAS_DEMO_PAINEL_INSIGHTS_BID_FRETE[0]?.moeda_proposta_bid_frete_internacional ?? 'USD'
  const valorMercado = termometro.termometroMedia6Meses != null
    ? formatarMoedaInsightsBidFrete(termometro.termometroMedia6Meses, moeda)
    : '—'
  const valorDele = termometro.termometroValorDele != null
    ? formatarMoedaInsightsBidFrete(termometro.termometroValorDele, moeda)
    : '—'
  const rotuloComponente = t('bidfrete.detalhe_cotacao.cockpit_termometro_componente_frete', 'Frete base')

  return (
    <article className="dc-smart-card dc-smart-card--termometro">
      <header className="dc-smart-card-head dc-smart-card-head--termometro">
        <span>{t('bidfrete.detalhe_cotacao.cockpit_termometro', 'Termômetro histórico')}</span>
        <div className="dc-termometro-head-acoes">
          <button
            type="button"
            className="dc-termometro-filtros-botao"
            aria-label={t(
              'bidfrete.detalhe_cotacao.cockpit_termometro_filtros_aria',
              'Filtros do termômetro histórico',
            )}
            title={t('bidfrete.detalhe_cotacao.cockpit_termometro_filtros', 'Filtros')}
          >
            <FunnelSimple weight="bold" size={13} aria-hidden />
            <span className="dc-termometro-filtros-botao-rotulo">
              {t('bidfrete.detalhe_cotacao.cockpit_termometro_filtros', 'Filtros')}
            </span>
          </button>
        </div>
      </header>
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
          <span className="dc-smart-termometro-contexto" title={rotuloComponente}>
            {rotuloComponente}
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
    </article>
  )
}
