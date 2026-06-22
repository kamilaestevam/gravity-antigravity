import { useRef, useState, type ReactNode, type RefObject } from 'react'

export type LinhaTooltipInsightsSmartRead = {
  cor: string
  rotulo: string
  valor: ReactNode
  pct?: number
}

export type SegmentoBarraTooltipInsightsSmartRead = {
  cor: string
  pct: number
}

export type ConteudoTooltipInsightsSmartRead = {
  titulo: string
  subtitulo?: string
  total?: ReactNode
  totalRotulo?: string
  barra?: SegmentoBarraTooltipInsightsSmartRead[]
  linhas: LinhaTooltipInsightsSmartRead[]
}

export type AncoraTooltipInsightsSmartRead = {
  /** x (centro do alvo) relativo ao conteúdo do container, já incluindo scroll horizontal */
  cx: number
  /** y do topo do alvo relativo ao topo visível do container */
  yTopo: number
}

const MARGEM_HORIZONTAL = 96
const LIMIAR_ACIMA = 92

/**
 * Tooltip inteligente reutilizável para os gráficos do dashboard de Insights.
 * Posicionamento adaptativo: aparece acima do alvo quando há espaço, senão abaixo,
 * e fica preso (clamp) às bordas do container para nunca vazar.
 *
 * O componente deve ser renderizado dentro de um elemento `position: relative`
 * (normalmente o mesmo que o `containerRef`, ou um ancestral comum).
 */
export function TooltipGraficoInsightsSmartRead({
  ancora,
  conteudo,
  containerRef,
}: {
  ancora: AncoraTooltipInsightsSmartRead
  conteudo: ConteudoTooltipInsightsSmartRead
  containerRef: RefObject<HTMLElement | null>
}) {
  const container = containerRef.current
  const scrollLeft = container?.scrollLeft ?? 0
  const clientW = container?.clientWidth ?? 240

  const leftBruto = ancora.cx - scrollLeft
  const left = Math.min(
    Math.max(leftBruto, MARGEM_HORIZONTAL),
    Math.max(MARGEM_HORIZONTAL, clientW - MARGEM_HORIZONTAL),
  )
  const acima = ancora.yTopo > LIMIAR_ACIMA

  return (
    <div
      className={`sr-insights-tt${acima ? '' : ' sr-insights-tt--abaixo'}`}
      style={{ left, top: acima ? ancora.yTopo - 10 : ancora.yTopo + 14 }}
      role="tooltip"
    >
      <div className="sr-insights-tt__topo">
        <span className="sr-insights-tt__titulo">{conteudo.titulo}</span>
        {conteudo.subtitulo != null && (
          <span className="sr-insights-tt__sub">{conteudo.subtitulo}</span>
        )}
      </div>

      {conteudo.total != null && (
        <div className="sr-insights-tt__total">
          <strong>{conteudo.total}</strong>
          {conteudo.totalRotulo != null && <span>{conteudo.totalRotulo}</span>}
        </div>
      )}

      {conteudo.barra != null && conteudo.barra.length > 0 && (
        <div className="sr-insights-tt__barra" aria-hidden>
          {conteudo.barra.map((seg, i) => (
            <span key={i} style={{ width: `${seg.pct}%`, background: seg.cor }} />
          ))}
        </div>
      )}

      {conteudo.linhas.map((linha, i) => (
        <div className="sr-insights-tt__linha" key={i}>
          <span>
            <i style={{ background: linha.cor }} /> {linha.rotulo}
          </span>
          <strong>
            {linha.valor}
            {linha.pct != null && <em>{linha.pct.toFixed(0)}%</em>}
          </strong>
        </div>
      ))}
    </div>
  )
}

/**
 * Gerencia o estado de hover para gráficos baseados em elementos HTML
 * (barras, linhas, fatias). Calcula a âncora a partir do retângulo do alvo
 * relativo ao container fornecido.
 */
export function useHoverTooltipInsightsSmartRead<T>() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [estado, setEstado] = useState<{
    ancora: AncoraTooltipInsightsSmartRead
    dados: T
  } | null>(null)

  function aoEntrar(evento: { currentTarget: Element }, dados: T) {
    const container = containerRef.current
    if (!container) return
    const alvo = evento.currentTarget.getBoundingClientRect()
    const base = container.getBoundingClientRect()
    const cx = alvo.left + alvo.width / 2 - base.left + container.scrollLeft
    const yTopo = alvo.top - base.top
    setEstado({ ancora: { cx, yTopo }, dados })
  }

  function aoSair() {
    setEstado(null)
  }

  return { containerRef, estado, aoEntrar, aoSair }
}
