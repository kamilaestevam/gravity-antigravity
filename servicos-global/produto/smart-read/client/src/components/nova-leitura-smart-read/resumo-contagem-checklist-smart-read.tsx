/**
 * ResumoContagemChecklistSmartRead — badges CONFORME / ATENÇÃO / FALHA / PENDENTE
 */

type Props = {
  verde: number
  amarelo: number
  vermelho: number
  pendente: number
  classe?: string
}

export function ResumoContagemChecklistSmartRead({
  verde,
  amarelo,
  vermelho,
  pendente,
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
    </div>
  )
}
