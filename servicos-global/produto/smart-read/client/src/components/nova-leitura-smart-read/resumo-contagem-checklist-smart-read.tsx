/**
 * ResumoContagemChecklistSmartRead — badges CONFORME / ATENÇÃO / FALHA / PENDENTE / N/A
 */

type Props = {
  verde: number
  amarelo: number
  vermelho: number
  pendente: number
  na?: number
  classe?: string
}

export function ResumoContagemChecklistSmartRead({
  verde,
  amarelo,
  vermelho,
  pendente,
  na = 0,
  classe = '',
}: Props) {
  return (
    <div
      className={`sr-conf-checklist-resumo${classe ? ` ${classe}` : ''}`}
      aria-label="Resumo do checklist"
    >
      <span className="sr-conf-checklist-contagem sr-conf-checklist-contagem--verde">
        {verde} CONFORME
      </span>
      <span className="sr-conf-checklist-contagem sr-conf-checklist-contagem--amarelo">
        {amarelo} ATENÇÃO
      </span>
      <span className="sr-conf-checklist-contagem sr-conf-checklist-contagem--vermelho">
        {vermelho} FALHA
      </span>
      <span className="sr-conf-checklist-contagem sr-conf-checklist-contagem--pendente">
        {pendente} PENDENTE
      </span>
      {na > 0 && (
        <span className="sr-conf-checklist-contagem sr-conf-checklist-contagem--na">
          {na} N/A
        </span>
      )}
    </div>
  )
}
