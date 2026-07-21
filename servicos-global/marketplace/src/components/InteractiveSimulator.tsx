import { SmartDocSimulator } from '../../../../nucleo-global/Telas-manual-marketing/produtos-gravity/smart-doc/SmartDocSimulator'
import { PedidoSimulator } from '../../../../nucleo-global/Telas-manual-marketing/produtos-gravity/pedido/PedidoSimulator'
import { BidFreteSimulator } from '../../../../nucleo-global/Telas-manual-marketing/produtos-gravity/bid-frete/BidFreteSimulator'
import { X } from '@phosphor-icons/react'

interface SimulatorProps {
  productId: string
  onClose: () => void
}

const PRODUTOS_COM_SIMULADOR_COMPLETO = ['smart-read', 'pedido', 'bid-frete']

function InteractiveSimulatorContent({ productId, onClose }: SimulatorProps) {
  if (productId === 'smart-read') {
    return <SmartDocSimulator onFecharSimulador={onClose} />
  }
  if (productId === 'pedido') {
    return <PedidoSimulator onFecharSimulador={onClose} />
  }
  if (productId === 'bid-frete') {
    return <BidFreteSimulator onFecharSimulador={onClose} />
  }
  return null
}

export function InteractiveSimulator(props: SimulatorProps) {
  return (
    <div
      className="interactive-simulator-shell"
      onClick={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
    >
      {!PRODUTOS_COM_SIMULADOR_COMPLETO.includes(props.productId) && (
        <button
          type="button"
          className="interactive-simulator-close"
          aria-label="Fechar demonstração"
          title="Fechar"
          onClick={(e) => {
            e.stopPropagation()
            props.onClose()
          }}
        >
          <X size={20} weight="bold" />
        </button>
      )}
      <InteractiveSimulatorContent {...props} />
    </div>
  )
}
