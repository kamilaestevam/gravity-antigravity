import { DocManualUmaSecao } from './manual-configurador-ui'
import { DOC_ADMIN_METADADOS, DOC_ADMIN_SECAO } from './manual-admin-conteudo'

export function DocAdminManual() {
  return (
    <DocManualUmaSecao
      secao={DOC_ADMIN_SECAO}
      metadados={DOC_ADMIN_METADADOS}
      manualSlug="admin"
      secoesAbertasInicial={[1, 2, 3, 4, 5]}
    />
  )
}
