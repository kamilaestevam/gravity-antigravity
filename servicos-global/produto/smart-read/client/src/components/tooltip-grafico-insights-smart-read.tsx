import { useRef, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'

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
  explicacao?: string
  categorias?: Array<{ rotulo: string; texto: string; cor?: string }>
  total?: ReactNode
  totalRotulo?: string
  barra?: SegmentoBarraTooltipInsightsSmartRead[]
  linhas: LinhaTooltipInsightsSmartRead[]
}

export type AncoraTooltipInsightsSmartRead = {
  /** Centro horizontal do alvo (coordenada da viewport) */
  cx: number
  /** Topo do alvo (coordenada da viewport) */
  yTopo: number
  /** Base do alvo (coordenada da viewport) */
  yBase: number
}

const MARGEM_HORIZONTAL = 96
const LIMIAR_ACIMA = 92

/**
 * Tooltip inteligente reutilizável para os gráficos do dashboard de Insights.
 * Posicionamento adaptativo: aparece acima do alvo quando há espaço, senão abaixo,
 * e fica preso (clamp) às bordas do container para nunca vazar.
 *
 * Renderizado via portal em `document.body` com `position: fixed` para não ser
 * cortado por `overflow: hidden` nos cards do dashboard.
 */
export function TooltipGraficoInsightsSmartRead({
  ancora,
  conteudo,
}: {
  ancora: AncoraTooltipInsightsSmartRead
  conteudo: ConteudoTooltipInsightsSmartRead
}) {
  const larguraViewport = typeof window !== 'undefined' ? window.innerWidth : 1200
  const left = Math.min(
    Math.max(ancora.cx, MARGEM_HORIZONTAL),
    Math.max(MARGEM_HORIZONTAL, larguraViewport - MARGEM_HORIZONTAL),
  )
  const acima = ancora.yTopo > LIMIAR_ACIMA

  return createPortal(
    <div
      className={`sr-insights-tt sr-insights-tt--portal${acima ? '' : ' sr-insights-tt--abaixo'}`}
      style={{ left, top: acima ? ancora.yTopo - 10 : ancora.yBase + 14 }}
      role="tooltip"
    >
      <div className="sr-insights-tt__topo">
        <span className="sr-insights-tt__titulo">{conteudo.titulo}</span>
        {conteudo.subtitulo != null && (
          <span className="sr-insights-tt__sub">{conteudo.subtitulo}</span>
        )}
      </div>

      {conteudo.explicacao != null && (
        <p className="sr-insights-tt__explicacao">{conteudo.explicacao}</p>
      )}

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

      {conteudo.categorias != null && conteudo.categorias.length > 0 && (
        <div className="sr-insights-tt__categorias">
          <p className="sr-insights-tt__categorias-titulo">Como classificamos</p>
          {conteudo.categorias.map((item) => (
            <div className="sr-insights-tt__categoria" key={item.rotulo}>
              <span className="sr-insights-tt__categoria-rotulo">
                {item.cor != null && (
                  <i style={{ background: item.cor }} aria-hidden />
                )}
                {item.rotulo}
              </span>
              <span className="sr-insights-tt__categoria-texto">{item.texto}</span>
            </div>
          ))}
        </div>
      )}
    </div>,
    document.body,
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
    const alvo = evento.currentTarget.getBoundingClientRect()
    setEstado({
      ancora: {
        cx: alvo.left + alvo.width / 2,
        yTopo: alvo.top,
        yBase: alvo.bottom,
      },
      dados,
    })
  }

  function aoSair() {
    setEstado(null)
  }

  return { containerRef, estado, aoEntrar, aoSair }
}
