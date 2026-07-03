import { DocManualUmaSecao } from './manual-configurador-ui'
import { DOC_PEDIDO_METADADOS, DOC_PEDIDO_SECAO } from './manual-pedido-conteudo'

export function DocPedidoManual() {
  return (
    <DocManualUmaSecao
      secao={DOC_PEDIDO_SECAO}
      metadados={DOC_PEDIDO_METADADOS}
      manualSlug="pedido"
    />
  )
}
