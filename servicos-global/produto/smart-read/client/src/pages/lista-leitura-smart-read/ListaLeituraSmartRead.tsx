/**
 * ListaLeituraSmartRead — lista principal (default) com KPI cards nativos + tabela
 */

import { useMemo, useState } from 'react'
import { ListaLeituraCardsSmartRead } from '../../components/lista-leitura-cards-smart-read'
import { TabelaTransacoesLeituraSmartRead } from '../../components/tabela-transacoes-leitura-smart-read'
import { ProvedorMetodologiaSavingInsightsSmartRead } from '../insights-smart-read/metodologia-saving-insights-smart-read'
import {
  filtrarTransacoesPorSegmento,
  useTransacoesLeituraSmartRead,
  type SegmentoListaLeitura,
} from '../../shared/use-transacoes-leitura-smart-read'
import '../../shared/smart-read-leituras.css'

const SEGMENTOS: { id: SegmentoListaLeitura; rotulo: string }[] = [
  { id: 'envios', rotulo: 'Visão geral' },
  { id: 'transacoes-api', rotulo: 'Transações API' },
]

export default function ListaLeituraSmartRead() {
  const [segmento, setSegmento] = useState<SegmentoListaLeitura>('envios')
  const dados = useTransacoesLeituraSmartRead(segmento)

  const transacoesFiltradas = useMemo(
    () => filtrarTransacoesPorSegmento(dados.transacoes, segmento),
    [dados.transacoes, segmento],
  )

  return (
    <ProvedorMetodologiaSavingInsightsSmartRead>
    <div className="sr-pagina sr-pagina--lista">
      <ListaLeituraCardsSmartRead
        transacoes={transacoesFiltradas}
        totalLeituras={dados.metricaLeituras ?? dados.total}
        carregando={dados.carregando}
      />

      <div className="sr-toolbar-lista sr-toolbar-lista--segmentos">
        <div className="sr-segmento-tabs" role="tablist" aria-label="Segmento de envios">
          {SEGMENTOS.map((item) => (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={segmento === item.id}
              className={`sr-segmento-tab${segmento === item.id ? ' sr-segmento-tab--ativa' : ''}`}
              onClick={() => setSegmento(item.id)}
            >
              {item.rotulo}
            </button>
          ))}
        </div>
      </div>

      <div className="sr-tabela-wrapper sr-tabela-wrapper--faixa-unificada">
        <TabelaTransacoesLeituraSmartRead
          transacoes={transacoesFiltradas}
          total={dados.total}
          pagina={dados.pagina}
          carregando={dados.carregando}
          erro={dados.erro}
          termoBusca={dados.termoBusca}
          onBuscar={(termo) => {
            dados.setTermoBusca(termo)
            dados.aplicarBusca(termo)
          }}
          onRecarregar={() => void dados.recarregar()}
          onPaginaChange={dados.setPagina}
          tituloPainel={segmento === 'transacoes-api' ? 'Transações API' : 'Envios'}
          segmento={segmento}
          onSegmentoChange={setSegmento}
        />
      </div>
    </div>
    </ProvedorMetodologiaSavingInsightsSmartRead>
  )
}
