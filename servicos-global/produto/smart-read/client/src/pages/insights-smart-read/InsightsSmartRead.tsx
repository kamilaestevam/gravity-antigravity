/**
 * InsightsSmartRead — KPIs, funil de status e leituras recentes (escopo isolado da Lista)
 */

import { useMemo } from 'react'
import { CardsInsightsLeituraSmartRead } from '../../components/cards-insights-leitura-smart-read'
import { PainelFunilStatusInsightsLeituraSmartRead } from '../../components/painel-funil-status-insights-leitura-smart-read'
import { ListaRecentesInsightsLeituraSmartRead } from '../../components/lista-recentes-insights-leitura-smart-read'
import { useTransacoesLeituraSmartRead } from '../../shared/use-transacoes-leitura-smart-read'
import { calcularMetricasInsightsLeituraSmartRead } from './calcular-metricas-insights-leitura-smart-read'
import '../../shared/smart-read-leituras.css'
import './insights-smart-read.css'

export default function InsightsSmartRead() {
  const { transacoes, metricaLeituras, total, carregando, erro } =
    useTransacoesLeituraSmartRead()

  const metricas = useMemo(
    () => calcularMetricasInsightsLeituraSmartRead(transacoes),
    [transacoes],
  )

  return (
    <div className="sr-pagina sr-pagina--insights">
      {erro && (
        <div className="sr-erro" role="alert">
          {erro}
        </div>
      )}

      <CardsInsightsLeituraSmartRead
        totalLeituras={metricaLeituras ?? total}
        totalPaginado={transacoes.length}
        metricas={metricas}
        carregando={carregando}
      />

      <div className="sr-insights-corpo">
        <PainelFunilStatusInsightsLeituraSmartRead
          metricas={metricas}
          amostraTotal={transacoes.length}
        />
        <ListaRecentesInsightsLeituraSmartRead recentes={metricas.recentes} />
      </div>
    </div>
  )
}
