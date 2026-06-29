import { DocManualUmaSecao } from './manual-configurador-ui'
import { DOC_NAVEGACAO_METADADOS, DOC_NAVEGACAO_SECAO } from './manual-navegacao-conteudo'

export function DocNavegacaoManual() {
  return <DocManualUmaSecao secao={DOC_NAVEGACAO_SECAO} metadados={DOC_NAVEGACAO_METADADOS} />
}
