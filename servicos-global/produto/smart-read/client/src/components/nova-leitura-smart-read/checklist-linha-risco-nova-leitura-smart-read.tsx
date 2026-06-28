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
}

export function ChecklistLinhaRiscoNovaLeituraSmartRead({
  risco,
  documentos,
  parametrosChecklist,
}: Props) {
  const secoes = useMemo(() => {
    const invoices = listarInvoicesChecklist(documentos)
    const itensRisco = invoices.flatMap((inv) =>
      montarChecklistMatrizInvoice({
        ...parametrosChecklist,
        rotulo_documento: inv.rotulo,
      }).filter((item) => item.risco_id === risco.id),
    )
    return agruparChecklistPorSecao(itensRisco)
  }, [documentos, parametrosChecklist, risco.id])

  if (secoes.length === 0) return null

  return (
    <ChecklistConferenciaCorpoSmartRead
      secoes={secoes}
      todasSecoesAbertas
      idPrefixo={`sr-risco-chk-linha-${risco.id}`}
      classeCorpo="sr-risco-inline-checklist-corpo"
    />
  )
}
