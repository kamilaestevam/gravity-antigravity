/**
 * Lista compacta de cotações nos tooltips dos KPIs Insights (link + data · tempo).
 */

import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import type { CotacaoInsightsDetalheCliente } from './insights-detalhe-bid-frete-internacional'
import { formatarLinhaDataTempoTooltipKpiInsights } from './insights-kpi-aguardando-resposta-bid-frete-internacional'
import { rotaDetalheCotacaoBidFreteInternacional } from './rotas-bid-frete-internacional'

type InsightsKpiTooltipListaBidFreteInternacionalProps = {
  resumo?: ReactNode
  cotacoes: CotacaoInsightsDetalheCliente[]
  total: number
  rotuloColunaData: string
  resolverDataReferencia: (cotacao: CotacaoInsightsDetalheCliente) => string | null | undefined
}

export function InsightsKpiTooltipListaBidFreteInternacional({
  resumo,
  cotacoes,
  total,
  rotuloColunaData,
  resolverDataReferencia,
}: InsightsKpiTooltipListaBidFreteInternacionalProps) {
  return (
    <div className="bfd-kpi-tooltip-insights">
      {resumo}
      {cotacoes.length > 0 && (
        <>
          {resumo != null && (
            <div className="cg-tooltip__divider" style={{ margin: '0.65rem 0 0.45rem' }} />
          )}
          <div className="bfd-kpi-tooltip-insights__head bfd-kpi-tooltip-insights__head--duas-colunas">
            <span>Cotação</span>
            <span>{rotuloColunaData}</span>
          </div>
          <div className="bfd-kpi-tooltip-insights__lista">
            {cotacoes.map(cotacao => (
              <div
                key={cotacao.id_cotacao_bid_frete_internacional}
                className="bfd-kpi-tooltip-insights__row bfd-kpi-tooltip-insights__row--duas-colunas"
              >
                <Link
                  to={rotaDetalheCotacaoBidFreteInternacional(cotacao.id_cotacao_bid_frete_internacional)}
                  className="bfd-kpi-tooltip-insights__link"
                >
                  {cotacao.numero_cotacao_bid_frete_internacional}
                </Link>
                <span>
                  {formatarLinhaDataTempoTooltipKpiInsights(resolverDataReferencia(cotacao))}
                </span>
              </div>
            ))}
          </div>
          {total > cotacoes.length && (() => {
            const restantes = total - cotacoes.length
            return (
              <p className="bfd-kpi-tooltip-insights__mais">
                {`+${restantes} cota${restantes > 1 ? 'ões' : 'ção'} não exibida${restantes > 1 ? 's' : ''}`}
              </p>
            )
          })()}
        </>
      )}
    </div>
  )
}
