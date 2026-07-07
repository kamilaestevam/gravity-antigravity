import { DocManualUmaSecao } from './manual-configurador-ui'
import { DOC_BID_FRETE_METADADOS, DOC_BID_FRETE_SECAO } from './manual-bid-frete-conteudo'

export function DocBidFreteManual() {
  return (
    <DocManualUmaSecao
      secao={DOC_BID_FRETE_SECAO}
      metadados={DOC_BID_FRETE_METADADOS}
      manualSlug="bid-frete"
      secoesAbertasInicial={[1, 2, 3, 4, 5, 6, 7]}
    />
  )
}
