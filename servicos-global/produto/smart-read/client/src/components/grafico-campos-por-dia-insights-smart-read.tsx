import { useId, useLayoutEffect, useMemo, useRef, useState } from 'react'
import type {
  MetricaSerieTemporalInsightsSmartRead,
  PontoCamposPorDiaInsights,
} from '../pages/insights-smart-read/agrupar-campos-por-dia-insights-smart-read'
import {
  valorAcertoPontoSerieTemporal,
  valorErroPontoSerieTemporal,
  valorTotalPontoSerieTemporal,
} from '../pages/insights-smart-read/agrupar-campos-por-dia-insights-smart-read'

type Props = {
  serie: PontoCamposPorDiaInsights[]
  metrica?: MetricaSerieTemporalInsightsSmartRead
}

type HoverTooltip = {
  indice: number
  cx: number
  yTopo: number
}

const LARGURA_MINIMA_SLOT_DIA = 36
const LARGURA_MINIMA_SLOT_DIA_LONGO = 46

function larguraSlotDia(totalPontos: number): number {
  if (totalPontos > 45) return 52
  if (totalPontos > 21) return LARGURA_MINIMA_SLOT_DIA_LONGO
  return LARGURA_MINIMA_SLOT_DIA
}

export function GraficoCamposPorDiaInsightsSmartRead({ serie, metrica = 'campos' }: Props) {
  const [hover, setHover] = useState<HoverTooltip | null>(null)
  const wrapRef = useRef<HTMLDivElement>(null)
  const [larguraEncaixe, setLarguraEncaixe] = useState(0)
  const idBase = useId().replace(/:/g, '')
  const gradAcertoId = `sr-grad-acerto-${idBase}`
  const gradErroId = `sr-grad-erro-${idBase}`

  const maxTotal = useMemo(
    () => Math.max(...serie.map((p) => valorTotalPontoSerieTemporal(p, metrica)), 1),
    [serie, metrica],
  )

  const porDocumentos = metrica === 'documentos'
  const rotuloAcerto = porDocumentos ? 'Sem edição' : 'Acertos'
  const rotuloErro = porDocumentos ? 'Com edição' : 'Erros (editados)'

  const porDia = true
  const usarRolagemHorizontal = serie.length > 14
  const larguraSlot = larguraSlotDia(serie.length)
  const rotulosInclinados = serie.length > 7

  const pad = useMemo(
    () => ({
      top: 24,
      right: 16,
      bottom: rotulosInclinados ? 56 : 28,
      left: 36,
    }),
    [rotulosInclinados],
  )

  const larguraConteudoMinima = pad.left + pad.right + serie.length * larguraSlot

  useLayoutEffect(() => {
    if (usarRolagemHorizontal) {
      setLarguraEncaixe(0)
      return
    }

    const el = wrapRef.current
    if (!el) return

    const atualizarLargura = () => {
      const largura = Math.round(el.getBoundingClientRect().width)
      if (largura > 0) setLarguraEncaixe(largura)
    }

    atualizarLargura()
    const observer = new ResizeObserver(atualizarLargura)
    observer.observe(el)
    return () => observer.disconnect()
  }, [usarRolagemHorizontal, serie.length, metrica])

  const prontoEncaixe = usarRolagemHorizontal || larguraEncaixe > 0

  // Ao abrir/trocar o período em modo rolagem, exibir sempre o dia mais recente (à direita).
  useLayoutEffect(() => {
    if (!usarRolagemHorizontal) return
    const el = wrapRef.current
    if (!el) return
    el.scrollLeft = el.scrollWidth
  }, [usarRolagemHorizontal, serie.length, metrica])

  const { W, H, innerW, innerH, barW, yRotuloEixo } = useMemo(() => {
    const alturaPlot = 200
    const W = usarRolagemHorizontal
      ? Math.max(560, larguraConteudoMinima)
      : Math.max(larguraEncaixe, larguraConteudoMinima)
    const H = pad.top + alturaPlot + pad.bottom
    const innerW = W - pad.left - pad.right
    const innerH = H - pad.top - pad.bottom
    const barW = innerW / Math.max(serie.length, 1)
    const yRotuloEixo = pad.top + innerH + (rotulosInclinados ? 18 : 14)

    return { W, H, innerW, innerH, barW, yRotuloEixo }
  }, [usarRolagemHorizontal, larguraConteudoMinima, larguraEncaixe, pad, rotulosInclinados, serie.length])

  const gridTicks = [0, 0.25, 0.5, 0.75, 1]
  const pontoHover = hover != null ? serie[hover.indice] : null

  const mostrarRotulo = () => true

  function registrarHover(indice: number, xCentro: number, yTopo: number) {
    setHover({ indice, cx: xCentro, yTopo })
  }

  function renderRotuloEixo(x: number, w: number, rotulo: string, ativo: boolean) {
    const cx = x + w / 2
    const cor = ativo ? '#cbd5e1' : '#64748b'

    if (rotulosInclinados) {
      return (
        <text
          x={cx}
          y={yRotuloEixo}
          textAnchor="end"
          fill={cor}
          fontSize="10"
          fontWeight="600"
          transform={`rotate(-45, ${cx}, ${yRotuloEixo})`}
        >
          {rotulo}
        </text>
      )
    }

    return (
      <text x={cx} y={yRotuloEixo} textAnchor="middle" fill={cor} fontSize="10" fontWeight="600">
        {rotulo}
      </text>
    )
  }

  return (
    <div className="sr-insights-grafico-dia">
      <div
        ref={wrapRef}
        className={`sr-insights-grafico-dia__wrap${usarRolagemHorizontal ? '' : ' sr-insights-grafico-dia__wrap--encaixe'}`}
      >
        {!prontoEncaixe ? null : (
        <svg
          viewBox={`0 0 ${W} ${H}`}
          width={W}
          height={H}
          style={{ width: W, height: H, minWidth: W, flexShrink: 0 }}
          className={`sr-insights-grafico-dia__svg${usarRolagemHorizontal ? ' sr-insights-grafico-dia__svg--rolagem' : ' sr-insights-grafico-dia__svg--encaixe'}`}
          role="img"
          aria-label={porDocumentos ? 'Documentos extraídos por período' : 'Campos extraídos por período'}
        >
          <defs>
            <linearGradient id={gradAcertoId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#34d399" />
              <stop offset="100%" stopColor="#059669" />
            </linearGradient>
            <linearGradient id={gradErroId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f87171" />
              <stop offset="100%" stopColor="#dc2626" />
            </linearGradient>
          </defs>

          {gridTicks.map((tick, idx) => {
            const y = pad.top + tick * innerH
            const val = Math.round((1 - tick) * maxTotal)
            return (
              <g key={idx}>
                <line
                  x1={pad.left}
                  y1={y}
                  x2={W - pad.right}
                  y2={y}
                  stroke="rgba(255,255,255,0.06)"
                  strokeWidth="1"
                  strokeDasharray={tick === 1 ? undefined : '4,4'}
                />
                <text x={pad.left - 8} y={y + 4} textAnchor="end" fill="#64748b" fontSize="10" fontWeight="600">
                  {val}
                </text>
              </g>
            )
          })}

          {serie.map((ponto, i) => {
            const total = valorTotalPontoSerieTemporal(ponto, metrica)
            const acertos = valorAcertoPontoSerieTemporal(ponto, metrica)
            const erros = valorErroPontoSerieTemporal(ponto, metrica)
            const w = Math.max(4, barW * 0.52)
            const x = pad.left + i * barW + (barW - w) / 2
            const cx = x + w / 2
            const ativo = hover?.indice === i

            if (total === 0) {
              return (
                <g
                  key={ponto.chave_periodo}
                  className={`sr-insights-grafico-dia__slot${ativo ? ' sr-insights-grafico-dia__slot--ativa' : ''}`}
                  onMouseEnter={() => registrarHover(i, cx, pad.top + innerH)}
                  onMouseLeave={() => setHover(null)}
                >
                  <rect x={x - 4} y={pad.top} width={w + 8} height={innerH} fill="transparent" />
                  {porDia && (
                    <line
                      x1={cx}
                      y1={pad.top + innerH - 6}
                      x2={cx}
                      y2={pad.top + innerH}
                      stroke="rgba(148, 163, 184, 0.25)"
                      strokeWidth="1"
                    />
                  )}
                  {mostrarRotulo() && renderRotuloEixo(x, w, ponto.rotulo_periodo, false)}
                </g>
              )
            }

            const fullH = (total / maxTotal) * innerH
            const hErro = total > 0 ? (erros / total) * fullH : 0
            const hAcerto = total > 0 ? (acertos / total) * fullH : 0
            const yTop = pad.top + innerH - fullH
            const yAcerto = yTop
            const yErro = yTop + hAcerto + (hAcerto > 0 && hErro > 0 ? 1 : 0)
            const hAcertoDraw = Math.max(hAcerto > 0 ? 3 : 0, hAcerto - (hErro > 0 ? 1 : 0))
            const hErroDraw = Math.max(hErro > 0 ? 3 : 0, hErro - 1)
            const r = Math.min(5, hErroDraw / 2, w / 2)
            const botPath =
              hErroDraw > 0
                ? `M ${x} ${yErro} L ${x + w} ${yErro} L ${x + w} ${yErro + hErroDraw - r} A ${r} ${r} 0 0 1 ${x + w - r} ${yErro + hErroDraw} L ${x + r} ${yErro + hErroDraw} A ${r} ${r} 0 0 1 ${x} ${yErro + hErroDraw - r} Z`
                : ''

            return (
              <g
                key={ponto.chave_periodo}
                className={`sr-insights-grafico-dia__bar${ativo ? ' sr-insights-grafico-dia__bar--ativa' : ''}`}
                onMouseEnter={() => registrarHover(i, cx, yTop)}
                onMouseLeave={() => setHover(null)}
              >
                <rect x={x - 4} y={pad.top} width={w + 8} height={innerH} fill="transparent" />
                {hAcertoDraw > 0 && (
                  <rect
                    x={x}
                    y={yAcerto}
                    width={w}
                    height={hAcertoDraw}
                    rx={hErroDraw > 0 ? 0 : 5}
                    fill={`url(#${gradAcertoId})`}
                  />
                )}
                {hErroDraw > 0 && botPath && <path d={botPath} fill={`url(#${gradErroId})`} />}
                <text x={cx} y={yTop - 8} textAnchor="middle" fill="#fff" fontSize="11" fontWeight="700">
                  {total}
                </text>
                {mostrarRotulo() && renderRotuloEixo(x, w, ponto.rotulo_periodo, true)}
              </g>
            )
          })}
        </svg>
        )}
      </div>

      {pontoHover && hover && prontoEncaixe && (() => {
        const total = valorTotalPontoSerieTemporal(pontoHover, metrica)
        const acertos = valorAcertoPontoSerieTemporal(pontoHover, metrica)
        const erros = valorErroPontoSerieTemporal(pontoHover, metrica)
        const pctAcerto = total > 0 ? (acertos / total) * 100 : 0
        const pctErro = total > 0 ? (erros / total) * 100 : 0

        const scrollLeft = wrapRef.current?.scrollLeft ?? 0
        const clientW = wrapRef.current?.clientWidth ?? W
        const leftBruto = hover.cx - scrollLeft
        const left = Math.min(Math.max(leftBruto, 96), Math.max(96, clientW - 96))
        const acima = hover.yTopo > 92

        return (
          <div
            className={`sr-insights-grafico-dia__tooltip${acima ? '' : ' sr-insights-grafico-dia__tooltip--abaixo'}`}
            style={{ left, top: acima ? hover.yTopo - 10 : hover.yTopo + 14 }}
            role="tooltip"
          >
            <div className="sr-insights-grafico-dia__tooltip-topo">
              <span className="sr-insights-grafico-dia__tooltip-dia">{pontoHover.rotulo_periodo}</span>
              <span className="sr-insights-grafico-dia__tooltip-doc">
                {pontoHover.documentos} {pontoHover.documentos === 1 ? 'documento' : 'documentos'}
              </span>
            </div>

            <div className="sr-insights-grafico-dia__tooltip-total">
              <strong>{total}</strong>
              <span>{porDocumentos ? 'documentos' : 'campos lidos'}</span>
            </div>

            <div className="sr-insights-grafico-dia__tooltip-barra" aria-hidden>
              <span style={{ width: `${pctAcerto}%`, background: '#34d399' }} />
              <span style={{ width: `${pctErro}%`, background: '#f87171' }} />
            </div>

            <div className="sr-insights-grafico-dia__tooltip-linha">
              <span>
                <i style={{ background: '#34d399' }} /> {rotuloAcerto}
              </span>
              <strong>
                {acertos}
                <em>{pctAcerto.toFixed(0)}%</em>
              </strong>
            </div>
            <div className="sr-insights-grafico-dia__tooltip-linha">
              <span>
                <i style={{ background: '#f87171' }} /> {rotuloErro}
              </span>
              <strong>
                {erros}
                <em>{pctErro.toFixed(0)}%</em>
              </strong>
            </div>
          </div>
        )
      })()}

      <div className="sr-insights-grafico-dia__legenda">
        <span>
          <i style={{ background: '#34d399' }} /> {rotuloAcerto}
        </span>
        <span>
          <i style={{ background: '#f87171' }} /> {rotuloErro}
        </span>
      </div>
    </div>
  )
}
