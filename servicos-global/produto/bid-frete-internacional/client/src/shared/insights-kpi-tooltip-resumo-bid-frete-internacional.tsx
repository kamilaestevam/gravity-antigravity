/**
 * Blocos de resumo UX 10 nos tooltips dos KPIs Insights (cards 1 e 2).
 */

export type DistribuicaoModalInsightsKpiBidFreteInternacional = Array<{
  modal_cotacao_bid_frete_internacional: string
  count: number
}>

export function contagemModalDistribuicaoInsightsKpiBidFreteInternacional(
  distribuicao: DistribuicaoModalInsightsKpiBidFreteInternacional,
  modal: string,
): number {
  return distribuicao.find(d => d.modal_cotacao_bid_frete_internacional === modal)?.count ?? 0
}

export function montarDistribuicaoModalFallbackDeCotacoesInsightsKpiBidFreteInternacional(
  cotacoes: Array<{ modal_cotacao_bid_frete_internacional: string }>,
): DistribuicaoModalInsightsKpiBidFreteInternacional {
  const contagem = new Map<string, number>()
  for (const cotacao of cotacoes) {
    const modal = cotacao.modal_cotacao_bid_frete_internacional
    contagem.set(modal, (contagem.get(modal) ?? 0) + 1)
  }
  return [...contagem.entries()].map(([modal_cotacao_bid_frete_internacional, count]) => ({
    modal_cotacao_bid_frete_internacional,
    count,
  }))
}

type InsightsKpiTooltipResumoBidFreteInternacionalProps = {
  volumeRotulo: string
  volumeValor: string
  tituloContagem: string
  contagem: number
  linhasExtras?: Array<{ rotulo: string; valor: number; cor?: string }>
  distribuicaoModal: DistribuicaoModalInsightsKpiBidFreteInternacional
}

export function InsightsKpiTooltipResumoBidFreteInternacional({
  volumeRotulo,
  volumeValor,
  tituloContagem,
  contagem,
  linhasExtras,
  distribuicaoModal,
}: InsightsKpiTooltipResumoBidFreteInternacionalProps) {
  return (
    <div className="bfd-kpi-tooltip-insights">
      <div className="cg-tooltip__row">
        <span>{volumeRotulo}</span>
        <strong>{volumeValor}</strong>
      </div>
      <div className="cg-tooltip__row">
        <span>{tituloContagem}</span>
        <strong>{contagem}</strong>
      </div>
      {linhasExtras?.map(linha => (
        <div key={linha.rotulo} className="cg-tooltip__row">
          <span>{linha.rotulo}</span>
          <strong style={linha.cor ? { color: linha.cor } : undefined}>{linha.valor}</strong>
        </div>
      ))}
      <div className="cg-tooltip__row">
        <span>Marítimo</span>
        <strong style={{ color: '#34d399' }}>
          {contagemModalDistribuicaoInsightsKpiBidFreteInternacional(distribuicaoModal, 'MARITIMO')}
        </strong>
      </div>
      <div className="cg-tooltip__row">
        <span>Aéreo</span>
        <strong style={{ color: '#a78bfa' }}>
          {contagemModalDistribuicaoInsightsKpiBidFreteInternacional(distribuicaoModal, 'AEREO')}
        </strong>
      </div>
      <div className="cg-tooltip__row">
        <span>Rodoviário</span>
        <strong style={{ color: '#fbbf24' }}>
          {contagemModalDistribuicaoInsightsKpiBidFreteInternacional(distribuicaoModal, 'RODOVIARIO')}
        </strong>
      </div>
    </div>
  )
}
