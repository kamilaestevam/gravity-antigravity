import { ChartDonut, ChartLineUp, Clock, Files, Percent } from '@phosphor-icons/react'
import { CardBasicoGlobal } from '@nucleo/card-global'
import { formatarPercentualLeitura } from '../shared/formatacao-leitura-smart-read'
import type { MetricasInsightsLeituraSmartRead } from '../pages/insights-smart-read/calcular-metricas-insights-leitura-smart-read'

type Props = {
  totalLeituras: number | null
  totalPaginado: number
  metricas: MetricasInsightsLeituraSmartRead
  carregando?: boolean
}

export function CardsInsightsLeituraSmartRead({
  totalLeituras,
  totalPaginado,
  metricas,
  carregando,
}: Props) {
  const placeholder = carregando ? '…' : 'Em breve'
  const totalExibido = carregando ? '…' : (totalLeituras ?? totalPaginado)

  return (
    <div className="sr-insights-kpi-grid" aria-label="Indicadores Smart Read">
      <CardBasicoGlobal
        titulo="LEITURAS REALIZADAS"
        icone={<ChartLineUp weight="duotone" size={16} style={{ color: 'var(--ws-accent, #818cf8)' }} />}
        valor={totalExibido}
        subtexto="Total no workspace (API)"
        tooltip={
          <>
            <p className="cg-tooltip__row">
              <span>Total (API)</span>
              <strong>{totalLeituras ?? '—'}</strong>
            </p>
            <p className="cg-tooltip__row">
              <span>Amostra carregada</span>
              <strong>{totalPaginado}</strong>
            </p>
          </>
        }
      />
      <CardBasicoGlobal
        titulo="ARQUIVOS PROCESSADOS"
        icone={<Files weight="duotone" size={16} style={{ color: '#60a5fa' }} />}
        valor={carregando ? '…' : metricas.totalArquivos}
        subtexto="Soma na amostra atual"
        tooltip={<p className="cg-tooltip__row"><span>Arquivos vinculados às leituras visíveis</span></p>}
      />
      <CardBasicoGlobal
        titulo="TAXA DE CONCLUSÃO"
        icone={<Percent weight="duotone" size={16} style={{ color: '#a78bfa' }} />}
        valor={carregando ? '…' : formatarPercentualLeitura(metricas.taxaConclusao)}
        subtexto="Leituras concluídas na amostra"
        tooltip={<p className="cg-tooltip__row"><span>Concluídas ÷ total da amostra carregada</span></p>}
      />
      <CardBasicoGlobal
        titulo="PERFORMANCE DE ACERTOS"
        icone={<ChartDonut weight="duotone" size={16} style={{ color: '#34d399' }} />}
        valor={carregando ? '…' : formatarPercentualLeitura(metricas.mediaAcertos)}
        variante="sucesso"
        subtexto="Média das leituras com score"
        tooltip={<p className="cg-tooltip__row"><span>Média de acertos das leituras concluídas na amostra</span></p>}
      />
      <CardBasicoGlobal
        titulo="RECURSOS REDUZIDOS"
        icone={<Clock weight="duotone" size={16} style={{ color: '#818cf8' }} />}
        valor={placeholder}
        subtexto="Métrica em integração"
        tooltip={<p className="cg-tooltip__row"><span>Economia estimada de tempo operacional com OCR/IA</span></p>}
      />
    </div>
  )
}
