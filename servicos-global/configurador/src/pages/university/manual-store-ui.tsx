import { DocManualUmaSecao } from './manual-configurador-ui'
import { DOC_STORE_METADADOS, DOC_STORE_SECAO } from './manual-store-conteudo'

export function DocStoreManual() {
  return (
    <DocManualUmaSecao
      secao={DOC_STORE_SECAO}
      metadados={DOC_STORE_METADADOS}
      secoesAbertasInicial={[1, 2]}
    />
  )
}
