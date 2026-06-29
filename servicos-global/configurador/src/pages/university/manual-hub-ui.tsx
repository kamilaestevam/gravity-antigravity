import { DocManualUmaSecao } from './manual-configurador-ui'
import { DOC_HUB_METADADOS, DOC_HUB_SECAO } from './manual-hub-conteudo'

export function DocHubManual() {
  return <DocManualUmaSecao secao={DOC_HUB_SECAO} metadados={DOC_HUB_METADADOS} />
}
