/**
 * Tooltip de gráficos Insights — paridade tooltip-grafico-insights-smart-read (sem portal).
 * Modo fixo: clique abre e mantém até fechar localmente (X) ou clique fora.
 */
import { useEffect, useRef, useState, type ReactNode, type RefObject } from 'react'
import { X } from '@phosphor-icons/react'

export type LinhaTooltipInsights = {
  cor: string
  rotulo: string
  valor: ReactNode
  pct?: number
}

export type ConteudoTooltipInsights = {
  titulo: string
  subtitulo?: string
  total?: ReactNode
  totalRotulo?: string
  barra?: { cor: string; pct: number }[]
  linhas: LinhaTooltipInsights[]
}

export type AncoraTooltipInsights = {
  cx: number
  yTopo: number
}

const MARGEM_HORIZONTAL = 48
const LIMIAR_ACIMA = 92
const ALTURA_ESTIMADA_TOOLTIP_PX = 128

export function formatarPercentualTooltipInsightsSimulador(pct: number): string {
  return `${pct.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}%`
}

function resolverPosicaoTooltip(
  ancora: AncoraTooltipInsights,
  container: HTMLElement | null,
  preferirAcima?: boolean,
): { acima: boolean; left: number } {
  const scrollLeft = container?.scrollLeft ?? 0
  const clientW = container?.clientWidth ?? 240
  const clientH = container?.clientHeight ?? 200

  const leftBruto = ancora.cx - scrollLeft
  const left = Math.min(
    Math.max(leftBruto, MARGEM_HORIZONTAL),
    Math.max(MARGEM_HORIZONTAL, clientW - MARGEM_HORIZONTAL),
  )

  if (preferirAcima) {
    return { acima: true, left }
  }

  const espacoAcima = ancora.yTopo
  const espacoAbaixo = clientH - ancora.yTopo
  const cabeAcima = espacoAcima >= ALTURA_ESTIMADA_TOOLTIP_PX
  const cabeAbaixo = espacoAbaixo >= ALTURA_ESTIMADA_TOOLTIP_PX

  let acima: boolean
  if (cabeAcima && cabeAbaixo) {
    acima = ancora.yTopo > LIMIAR_ACIMA
  } else if (cabeAcima) {
    acima = true
  } else if (cabeAbaixo) {
    acima = false
  } else {
    acima = espacoAcima >= espacoAbaixo
  }

  return { acima, left }
}

export function TooltipGraficoInsightsSimulador({
  ancora,
  conteudo,
  containerRef,
  preferirAcima,
  onFechar,
}: {
  ancora: AncoraTooltipInsights
  conteudo: ConteudoTooltipInsights
  containerRef: RefObject<HTMLElement | null>
  preferirAcima?: boolean
  onFechar?: () => void
}) {
  const container = containerRef.current
  const { acima, left } = resolverPosicaoTooltip(ancora, container, preferirAcima)
  const fixo = Boolean(onFechar)

  return (
    <div
      className={`sr-insights-tt${acima ? '' : ' sr-insights-tt--abaixo'}${fixo ? ' sr-insights-tt--fixo' : ''}`}
      style={{ left, top: acima ? ancora.yTopo - 8 : ancora.yTopo + 10 }}
      role="tooltip"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="sr-insights-tt__topo">
        <div className="sr-insights-tt__topo-esq">
          <span className="sr-insights-tt__titulo">{conteudo.titulo}</span>
          {conteudo.subtitulo != null && (
            <span className="sr-insights-tt__sub">{conteudo.subtitulo}</span>
          )}
        </div>
        {onFechar && (
          <button
            type="button"
            className="sr-insights-tt__fechar"
            onClick={onFechar}
            aria-label="Fechar detalhe"
          >
            <X size={12} weight="bold" />
          </button>
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
            {linha.pct != null && <em>{formatarPercentualTooltipInsightsSimulador(linha.pct)}</em>}
          </strong>
        </div>
      ))}
    </div>
  )
}

function calcularAncora(
  container: HTMLElement,
  alvo: Element,
): AncoraTooltipInsights {
  const rect = alvo.getBoundingClientRect()
  const base = container.getBoundingClientRect()
  return {
    cx: rect.left + rect.width / 2 - base.left + container.scrollLeft,
    yTopo: rect.top - base.top,
  }
}

export function useHoverTooltipInsightsSimulador<T>() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [estado, setEstado] = useState<{
    ancora: AncoraTooltipInsights
    dados: T
  } | null>(null)

  function aoEntrar(evento: { currentTarget: Element }, dados: T) {
    const container = containerRef.current
    if (!container) return
    setEstado({ ancora: calcularAncora(container, evento.currentTarget), dados })
  }

  function aoSair() {
    setEstado(null)
  }

  return { containerRef, estado, aoEntrar, aoSair }
}

export function useTooltipFixoInsightsSimulador<T>() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [estado, setEstado] = useState<{
    ancora: AncoraTooltipInsights
    dados: T
  } | null>(null)

  useEffect(() => {
    if (!estado) return
    function aoPointerFora(ev: MouseEvent) {
      const container = containerRef.current
      if (!container) return
      const alvo = ev.target
      if (alvo instanceof Node && container.contains(alvo)) return
      setEstado(null)
    }
    document.addEventListener('mousedown', aoPointerFora)
    return () => document.removeEventListener('mousedown', aoPointerFora)
  }, [estado])

  function aoClicar(evento: { currentTarget: Element; stopPropagation: () => void }, dados: T) {
    evento.stopPropagation()
    const container = containerRef.current
    if (!container) return
    const ancora = calcularAncora(container, evento.currentTarget)
    setEstado((prev) => {
      if (prev && prev.dados === dados) return null
      return { ancora, dados }
    })
  }

  function fechar() {
    setEstado(null)
  }

  return { containerRef, estado, aoClicar, fechar }
}
