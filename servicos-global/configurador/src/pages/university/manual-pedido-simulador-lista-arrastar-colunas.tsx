import { ListaSimuladorPedido } from '../../../../../nucleo-global/Telas-manual-marketing/produtos-gravity/pedido/lista-simulador-pedido'
import '../../../../../nucleo-global/Telas-manual-marketing/produtos-gravity/pedido/lista-simulador-pedido.css'
import '../../../../../nucleo-global/Telas-manual-marketing/produtos-gravity/pedido/pedido-simulator.css'
import { PERFIS_EMPRESA_SIMULADOR } from '../../../../../nucleo-global/Telas-manual-marketing/produtos-gravity/smart-doc/dados-cliente-maduro-simulador-smart-doc'

const EMPRESAS_DEMO_LISTA_ARRASTAR = Object.values(PERFIS_EMPRESA_SIMULADOR).slice(0, 1)

/** Manual Pedido § Lista · Customizar — demo automática de arrastar colunas na tabela (sem interação). */
export function ManualPedidoSimuladorListaArrastarColunas() {
  return (
    <div className="sim-pedido-lista-arrastar-bloco">
      <div
        id="sim-pedido-lista-arrastar-colunas"
        className="uni-player-aula__figura sim-pedido-lista-arrastar-demo"
      >
        <ListaSimuladorPedido
          empresasSelecionadas={EMPRESAS_DEMO_LISTA_ARRASTAR}
          modoDemonstracaoArrastarColunas
        />
      </div>
    </div>
  )
}
