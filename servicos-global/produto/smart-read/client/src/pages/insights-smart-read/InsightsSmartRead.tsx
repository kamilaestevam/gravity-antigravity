/**
 * InsightsSmartRead — dashboard operacional (padrão BID Frete / bfd-dashboard)
 */

import { useMemo } from 'react'
import {
  KpiGridInsightsLeituraSmartRead,
  PainelBlAwbInsightsSmartRead,
  PainelCamposAcertosInsightsSmartRead,
  PainelRankingsEntidadeInsightsSmartRead,
  PainelSavingDetalheInsightsSmartRead,
  PainelTiposDocumentoInsightsSmartRead,
} from '../../components/insights-smart-read-paineis'
import { calcularMetricasInsightsLeituraSmartRead } from './calcular-metricas-insights-leitura-smart-read'
import { useDadosInsightsLeituraSmartRead } from './use-dados-insights-leitura-smart-read'
import '../../shared/smart-read-leituras.css'
import './insights-smart-read.css'

export default function InsightsSmartRead() {
  const { leiturasDetalhe, transacoes, carregando, erro } = useDadosInsightsLeituraSmartRead()

  const metricas = useMemo(
    () => calcularMetricasInsightsLeituraSmartRead(leiturasDetalhe, transacoes),
    [leiturasDetalhe, transacoes],
  )

  if (carregando && leiturasDetalhe.length === 0 && transacoes.length === 0) {
    return <div className="sr-insights-carregando">Carregando insights…</div>
  }

  return (
    <div className="sr-insights-dashboard">
      {erro && (
        <div className="sr-erro" role="alert">
          {erro}
        </div>
      )}

      <KpiGridInsightsLeituraSmartRead metricas={metricas} carregando={carregando} />

      <div className="sr-insights-linha-principal">
        <PainelTiposDocumentoInsightsSmartRead metricas={metricas} />
        <PainelCamposAcertosInsightsSmartRead metricas={metricas} />
        <PainelBlAwbInsightsSmartRead metricas={metricas} />
      </div>

      <div className="sr-insights-linha-secundaria">
        <PainelSavingDetalheInsightsSmartRead metricas={metricas} />
        <PainelRankingsEntidadeInsightsSmartRead metricas={metricas} />
      </div>
    </div>
  )
}
