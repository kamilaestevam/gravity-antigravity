import { ListaSimuladorPedido } from '../../../../../nucleo-global/Telas-manual-marketing/produtos-gravity/pedido/lista-simulador-pedido'
import { ConfigSimuladorPedidoProvider } from '../../../../../nucleo-global/Telas-manual-marketing/produtos-gravity/pedido/estado-config-simulador-pedido'
import '../../../../../nucleo-global/Telas-manual-marketing/produtos-gravity/pedido/lista-simulador-pedido.css'
import '../../../../../nucleo-global/Telas-manual-marketing/produtos-gravity/pedido/pedido-simulator.css'
import { PERFIS_EMPRESA_SIMULADOR } from '../../../../../nucleo-global/Telas-manual-marketing/produtos-gravity/smart-doc/dados-cliente-maduro-simulador-smart-doc'
import { ManualFaixaDemonstracaoAnimada } from './manual-faixa-demonstracao-animada'

const EMPRESAS_DEMO_LISTA_ARRASTAR = Object.values(PERFIS_EMPRESA_SIMULADOR).slice(0, 1)

/** Manual Smart Docs § Lista · Customizar — demo automática de arrastar colunas na tabela (sem interação). */
export function ManualSmartReadSimuladorListaArrastarColunas({
  fraseDemonstracaoAnimada,
}: {
  fraseDemonstracaoAnimada?: string
}) {
  return (
    <div className="sim-smart-read-lista-arrastar-bloco">
      {fraseDemonstracaoAnimada ? (
        <ManualFaixaDemonstracaoAnimada texto={fraseDemonstracaoAnimada} />
      ) : null}
      <div
        id="sim-smart-read-lista-arrastar-colunas"
        className="uni-player-aula__figura sim-smart-read-lista-arrastar-demo"
      >
        <ConfigSimuladorPedidoProvider>
          <ListaSimuladorPedido
            empresasSelecionadas={EMPRESAS_DEMO_LISTA_ARRASTAR}
            modoDemonstracaoArrastarColunas
          />
        </ConfigSimuladorPedidoProvider>
      </div>
    </div>
  )
}
