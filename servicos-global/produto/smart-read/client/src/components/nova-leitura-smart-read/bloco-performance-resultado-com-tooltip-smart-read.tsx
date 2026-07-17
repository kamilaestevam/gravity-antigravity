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

const LEGENDA_CATEGORIAS_PERFORMANCE = [
  {
    rotulo: 'Dados validados',
    cor: COR_VALIDADO,
    texto:
      'A IA extraiu certo ou você confirmou o mesmo valor de negócio na conferência',
  },
  {
    rotulo: 'Ajustes de forma',
    cor: COR_AJUSTE,
    texto:
      'Você mudou só formatação ou equivalência (data, moeda, porto abreviado) — o significado do campo não mudou',
  },
  {
    rotulo: 'Corrigidos (IA)',
    cor: COR_CORRIGIDO,
    texto:
      'A IA errou e você substituiu por outro valor na conferência — correção real do dado',
  },
] as const

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
      subtitulo: 'Acertos da IA',
      explicacao:
        'Soma os campos em que a extração original bate com a conferência — inclui itens que você só padronizou sem alterar o valor comercial',
      total: metricas.validados,
      totalRotulo: `de ${metricas.comparados} campos`,
      barra,
      linhas,
      categorias: [...LEGENDA_CATEGORIAS_PERFORMANCE],
    }
  }

  if (tipo === 'ajuste') {
    return {
      titulo: 'Ajustes de forma',
      subtitulo: 'Mesmo dado, outra escrita',
      explicacao:
        'Conta campos que você editou só para alinhar formato ou equivalência reconhecida pelo sistema — não entram como erro da IA',
      total: metricas.ajustesForma,
      totalRotulo: `de ${metricas.comparados} campos`,
      barra,
      linhas,
      categorias: [...LEGENDA_CATEGORIAS_PERFORMANCE],
    }
  }

  return {
    titulo: 'Corrigidos (IA)',
    subtitulo: 'Erros corrigidos na conferência',
    explicacao:
      'Conta campos em que o valor final ficou diferente do que a IA tinha extraído — aqui houve correção real do conteúdo',
    total: metricas.corrigidos,
    totalRotulo: `de ${metricas.comparados} campos`,
    barra,
    linhas,
    categorias: [...LEGENDA_CATEGORIAS_PERFORMANCE],
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
