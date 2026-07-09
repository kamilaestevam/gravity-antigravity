/**
 * ChecklistLinhaRiscoNovaLeituraSmartRead — só a(s) linha(s) da matriz ligada(s) ao risco
 */

import { useMemo } from 'react'
import type { DocumentoAnaliseRisco } from '../../../../shared/analise-riscos-leitura-smart-read'
import type { RiscoAduaneiroLeitura } from '../../shared/analisar-riscos-aduaneiros-leitura-smart-read'
import {
  agruparChecklistPorSecao,
  listarInvoicesChecklist,
  montarChecklistMatrizInvoice,
  type ParametrosChecklistMatrizInvoice,
} from '../../../../shared/montar-checklist-matriz-invoice-smart-read'
import { ChecklistConferenciaCorpoSmartRead } from './checklist-conferencia-corpo-smart-read'

type Props = {
  risco: RiscoAduaneiroLeitura
  documentos: DocumentoAnaliseRisco[]
  parametrosChecklist: Omit<ParametrosChecklistMatrizInvoice, 'rotulo_documento'>
  estaMarcado?: (chave: string) => boolean
  alternarMarcado?: (chave: string) => void
}

export function ChecklistLinhaRiscoNovaLeituraSmartRead({
  risco,
  documentos,
  parametrosChecklist,
  estaMarcado,
  alternarMarcado,
}: Props) {
  const grupos = useMemo(() => {
    const invoices = listarInvoicesChecklist(documentos)
    return invoices
      .map((inv) => ({
        rotulo: inv.rotulo,
        secoes: agruparChecklistPorSecao(
          montarChecklistMatrizInvoice({
            ...parametrosChecklist,
            rotulo_documento: inv.rotulo,
          }).filter((item) => item.risco_id === risco.id),
        ),
      }))
      .filter((grupo) => grupo.secoes.length > 0)
  }, [documentos, parametrosChecklist, risco.id])

  if (grupos.length === 0) return null

  return (
    <>
      {grupos.map((grupo) => (
        <ChecklistConferenciaCorpoSmartRead
          key={grupo.rotulo}
          secoes={grupo.secoes}
          todasSecoesAbertas
          rotuloInvoice={grupo.rotulo}
          estaMarcado={estaMarcado}
          alternarMarcado={alternarMarcado}
          idPrefixo={`sr-risco-chk-linha-${risco.id}`}
          classeCorpo="sr-risco-inline-checklist-corpo"
        />
      ))}
    </>
  )
}
