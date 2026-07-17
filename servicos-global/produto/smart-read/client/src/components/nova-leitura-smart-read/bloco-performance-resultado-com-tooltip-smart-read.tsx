/**
 * Tooltip estilo Insights nos blocos de performance do passo Resultado.
 */

import { type ReactElement } from 'react'
import { Info } from '@phosphor-icons/react'
import {
  TooltipGraficoInsightsSmartRead,
  useHoverTooltipInsightsSmartRead,
  type ConteudoTooltipInsightsSmartRead,
} from '../tooltip-grafico-insights-smart-read'

export type MetricasPerformanceResultadoSmartRead = {
  validados: number
  ajustesForma: number
  corrigidos: number
  pctValidados: number
  pctAjustes: number
  pctCorrigidos: number
  comparados: number
}

type TipoBlocoPerformanceResultado = 'validados' | 'ajuste' | 'corrigidos'

const COR_VALIDADO = '#22c55e'
const COR_AJUSTE = '#f59e0b'
const COR_CORRIGIDO = '#ef4444'

function montarConteudoTooltipPerformance(
  tipo: TipoBlocoPerformanceResultado,
  metricas: MetricasPerformanceResultadoSmartRead,
): ConteudoTooltipInsightsSmartRead {
  const barra = [
    { cor: COR_VALIDADO, pct: metricas.pctValidados },
    { cor: COR_AJUSTE, pct: metricas.pctAjustes },
    { cor: COR_CORRIGIDO, pct: metricas.pctCorrigidos },
  ]

  const linhas = [
    {
      cor: COR_VALIDADO,
      rotulo: 'Validados',
      valor: metricas.validados,
      pct: metricas.pctValidados,
    },
    {
      cor: COR_AJUSTE,
      rotulo: 'Ajustes de forma',
      valor: metricas.ajustesForma,
      pct: metricas.pctAjustes,
    },
    {
      cor: COR_CORRIGIDO,
      rotulo: 'Corrigidos (IA)',
      valor: metricas.corrigidos,
      pct: metricas.pctCorrigidos,
    },
  ]

  if (tipo === 'validados') {
    return {
      titulo: 'Dados validados',
      subtitulo: 'Conferência alinhada à extração',
      total: metricas.validados,
      totalRotulo: `de ${metricas.comparados} campos`,
      barra,
      linhas,
    }
  }

  if (tipo === 'ajuste') {
    return {
      titulo: 'Ajustes de forma',
      subtitulo: 'Formatação ou equivalência',
      total: metricas.ajustesForma,
      totalRotulo: `de ${metricas.comparados} campos`,
      barra,
      linhas,
    }
  }

  return {
    titulo: 'Corrigidos (IA)',
    subtitulo: 'Correção real na conferência',
    total: metricas.corrigidos,
    totalRotulo: `de ${metricas.comparados} campos`,
    barra,
    linhas,
  }
}

type Props = {
  tipo: TipoBlocoPerformanceResultado
  metricas: MetricasPerformanceResultadoSmartRead
  children: ReactElement
}

export function BlocoPerformanceResultadoComTooltip({ tipo, metricas, children }: Props) {
  const { estado, aoEntrar, aoSair } = useHoverTooltipInsightsSmartRead<ConteudoTooltipInsightsSmartRead>()

  const conteudo = montarConteudoTooltipPerformance(tipo, metricas)

  return (
    <>
      <div
        className="sr-res-perf-bloco-host"
        tabIndex={0}
        onMouseEnter={(evento) => aoEntrar(evento, conteudo)}
        onMouseLeave={aoSair}
        onFocus={(evento) => aoEntrar(evento, conteudo)}
        onBlur={aoSair}
      >
        {children}
        <Info
          size={14}
          weight="duotone"
          className="sr-res-perf-bloco-info"
          aria-hidden
        />
      </div>
      {estado && (
        <TooltipGraficoInsightsSmartRead ancora={estado.ancora} conteudo={estado.dados} />
      )}
    </>
  )
}
