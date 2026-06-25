/**
 * InsightsSmartRead — dashboard operacional (padrão BID Frete / bfd-dashboard)
 */

import { useCallback, useMemo, useState } from 'react'
import { BotaoNovoListaSmartRead } from '../../components/botao-novo-lista-smart-read'
import { useSincronizarAcoesToolbarVisualizacao } from '../../components/acoes-toolbar-visualizacao-smart-read'
import { useSmartReadVisualizacao } from '../../components/smart-read-visualizacao-context'
import { ModalNovaLeituraSmartRead } from '../../components/nova-leitura-smart-read/modal-nova-leitura-smart-read'
import {
  KpiGridInsightsLeituraSmartRead,
  PainelCamposAcertosInsightsSmartRead,
  PainelGraficoCamposPorDiaInsightsSmartRead,
  PainelRankingsEntidadeInsightsSmartRead,
  PainelSavingDetalheInsightsSmartRead,
  PainelTiposDocumentoInsightsSmartRead,
} from '../../components/insights-smart-read-paineis'
import { calcularMetricasInsightsLeituraSmartRead } from './calcular-metricas-insights-leitura-smart-read'
import { ProvedorMetodologiaSavingInsightsSmartRead } from './metodologia-saving-insights-smart-read'
import { useDadosInsightsLeituraSmartRead } from './use-dados-insights-leitura-smart-read'
import '../../shared/smart-read-leituras.css'
import './insights-smart-read.css'

function ModalNovaLeituraInsights({
  aberto,
  arquivosIniciais,
  onFechar,
  onConcluido,
}: {
  aberto: boolean
  arquivosIniciais: File[]
  onFechar: () => void
  onConcluido: () => void
}) {
  return (
    <ModalNovaLeituraSmartRead
      aberto={aberto}
      arquivosIniciais={arquivosIniciais}
      idLeituraExistente={null}
      onFechar={onFechar}
      onConcluido={onConcluido}
    />
  )
}

export default function InsightsSmartRead() {
  const { painelAtivo } = useSmartReadVisualizacao()
  const { leiturasDetalhe, transacoes, carregando, erro, recarregarTudo } =
    useDadosInsightsLeituraSmartRead(painelAtivo('insights'))

  const [modalNovaLeituraAberto, setModalNovaLeituraAberto] = useState(false)
  const [arquivosNovaLeitura, setArquivosNovaLeitura] = useState<File[]>([])

  const abrirNovaLeitura = useCallback((arquivos: File[] = []) => {
    setArquivosNovaLeitura(arquivos)
    setModalNovaLeituraAberto(true)
  }, [])

  const fecharModalNovaLeitura = useCallback(() => {
    setModalNovaLeituraAberto(false)
    setArquivosNovaLeitura([])
    void recarregarTudo()
  }, [recarregarTudo])

  const acoesToolbarInsights = useMemo(
    () => <BotaoNovoListaSmartRead onAbrirNovaLeitura={() => abrirNovaLeitura()} />,
    [abrirNovaLeitura],
  )

  useSincronizarAcoesToolbarVisualizacao('insights', acoesToolbarInsights)

  const metricas = useMemo(
    () => calcularMetricasInsightsLeituraSmartRead(leiturasDetalhe, transacoes),
    [leiturasDetalhe, transacoes],
  )

  if (carregando && leiturasDetalhe.length === 0 && transacoes.length === 0) {
    return (
      <>
        <div className="sr-insights-carregando">Carregando insights…</div>
        <ModalNovaLeituraInsights
          aberto={modalNovaLeituraAberto}
          arquivosIniciais={arquivosNovaLeitura}
          onFechar={fecharModalNovaLeitura}
          onConcluido={() => void recarregarTudo()}
        />
      </>
    )
  }

  return (
    <ProvedorMetodologiaSavingInsightsSmartRead transacoes={transacoes}>
      <div className="sr-insights-dashboard">
        {erro && (
          <div className="sr-erro" role="alert">
            {erro}
          </div>
        )}

        <div className="sr-insights-grid">
          <KpiGridInsightsLeituraSmartRead metricas={metricas} carregando={carregando} />

          <PainelGraficoCamposPorDiaInsightsSmartRead
            className="sr-insights-grid__grafico"
            metricas={metricas}
            transacoes={transacoes}
          />
          <PainelCamposAcertosInsightsSmartRead
            className="sr-insights-grid__acertos"
            metricas={metricas}
          />

          <div className="sr-insights-grid__col-leve">
            <PainelTiposDocumentoInsightsSmartRead metricas={metricas} />
            <PainelSavingDetalheInsightsSmartRead metricas={metricas} />
          </div>
          <PainelRankingsEntidadeInsightsSmartRead
            className="sr-insights-grid__rankings"
            metricas={metricas}
          />
        </div>
      </div>

      <ModalNovaLeituraInsights
        aberto={modalNovaLeituraAberto}
        arquivosIniciais={arquivosNovaLeitura}
        onFechar={fecharModalNovaLeitura}
        onConcluido={() => void recarregarTudo()}
      />
    </ProvedorMetodologiaSavingInsightsSmartRead>
  )
}
