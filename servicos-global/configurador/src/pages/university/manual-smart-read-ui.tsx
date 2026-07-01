import { DocManualUmaSecao } from './manual-configurador-ui'
import { DOC_SMART_READ_METADADOS, DOC_SMART_READ_SECAO } from './manual-smart-read-conteudo'

export function DocSmartReadManual() {
  return (
    <DocManualUmaSecao
      secao={DOC_SMART_READ_SECAO}
      metadados={DOC_SMART_READ_METADADOS}
      secoesAbertasInicial={[1, 2, 3, 4, 5]}
    />
  )
}
