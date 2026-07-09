import { DocManualUmaSecao } from './manual-configurador-ui'
import { DOC_API_COCKPIT_METADADOS, DOC_API_COCKPIT_SECAO } from './manual-api-cockpit-conteudo'

export function DocApiCockpitManual() {
  return (
    <DocManualUmaSecao
      secao={DOC_API_COCKPIT_SECAO}
      metadados={DOC_API_COCKPIT_METADADOS}
    />
  )
}
