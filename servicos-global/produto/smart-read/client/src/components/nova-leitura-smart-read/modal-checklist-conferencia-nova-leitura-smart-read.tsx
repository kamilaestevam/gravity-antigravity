/**
 * modal-checklist-conferencia-nova-leitura-smart-read.tsx — checklist em modal (visão geral unificada)
 */

import { useEffect, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import { ClipboardText, X } from '@phosphor-icons/react'
import type { DocumentoAnaliseRisco } from '../../../../shared/analise-riscos-leitura-smart-read'
import {
  agruparChecklistPorSecao,
  listarInvoicesChecklist,
  montarChecklistMatrizInvoice,
  montarResumoGeralChecklistInvoices,
  VALOR_TODAS_INVOICES_CHECKLIST,
  type ParametrosChecklistMatrizInvoice,
} from '../../../../shared/montar-checklist-matriz-invoice-smart-read'
import { ChecklistConferenciaCorpoSmartRead } from './checklist-conferencia-corpo-smart-read'
import { InfograficoChecklistGeralSmartRead } from './infografico-checklist-geral-smart-read'
import { ResumoContagemChecklistSmartRead } from './resumo-contagem-checklist-smart-read'

type Props = {
  aberto: boolean
  onFechar: () => void
  documentos: DocumentoAnaliseRisco[]
  parametrosChecklist: Omit<ParametrosChecklistMatrizInvoice, 'rotulo_documento'>
  onVerRisco?: (riscoId: string) => void
}

export function ModalChecklistConferenciaNovaLeituraSmartRead({
  aberto,
  onFechar,
  documentos,
  parametrosChecklist,
  onVerRisco,
}: Props) {
  const [filtroVisaoGeral, setFiltroVisaoGeral] = useState<string>(VALOR_TODAS_INVOICES_CHECKLIST)

  const invoices = useMemo(() => listarInvoicesChecklist(documentos), [documentos])

  const resumoGeral = useMemo(
    () =>
      montarResumoGeralChecklistInvoices({
        ...parametrosChecklist,
        documentos,
      }),
    [parametrosChecklist, documentos],
  )

  const mostrarDetalheInvoice = filtroVisaoGeral !== VALOR_TODAS_INVOICES_CHECKLIST
  const rotuloChecklistAtivo = mostrarDetalheInvoice ? filtroVisaoGeral : null

  const checklistInvoice = useMemo(() => {
    if (!rotuloChecklistAtivo) return []
    return montarChecklistMatrizInvoice({
      ...parametrosChecklist,
      documentos,
      rotulo_documento: rotuloChecklistAtivo,
    })
  }, [parametrosChecklist, rotuloChecklistAtivo])

  const secoesInvoice = useMemo(
    () => agruparChecklistPorSecao(checklistInvoice),
    [checklistInvoice],
  )

  const opcoesInvoice = useMemo(
    () =>
      invoices.map((inv) => ({
        valor: inv.rotulo,
        rotulo: inv.numero_invoice
          ? `${inv.numero_invoice} · ${inv.nome_arquivo}`
          : `${inv.nome_arquivo} · ${inv.tipo_documento}`,
      })),
    [invoices],
  )

  const opcoesSelecaoGeral = useMemo(
    () => [{ valor: VALOR_TODAS_INVOICES_CHECKLIST, rotulo: 'Todas' }, ...opcoesInvoice],
    [opcoesInvoice],
  )

  const contagemDetalheInvoice = useMemo(() => {
    if (!rotuloChecklistAtivo) return resumoGeral.contagem_global
    return (
      resumoGeral.por_invoice.find((inv) => inv.rotulo === rotuloChecklistAtivo)?.contagem ??
      resumoGeral.contagem_global
    )
  }, [resumoGeral, rotuloChecklistAtivo])

  useEffect(() => {
    if (!aberto) return
    setFiltroVisaoGeral(VALOR_TODAS_INVOICES_CHECKLIST)
  }, [aberto, invoices])

  useEffect(() => {
    if (!aberto) return
    const anterior = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (ev: KeyboardEvent) => {
      if (ev.key === 'Escape') onFechar()
    }
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = anterior
      window.removeEventListener('keydown', onKey)
    }
  }, [aberto, onFechar])

  function selecionarInvoiceNaVisaoGeral(rotulo: string) {
    setFiltroVisaoGeral(rotulo)
  }

  function aoMudarFiltroVisaoGeral(valor: string | null) {
    setFiltroVisaoGeral(valor ?? VALOR_TODAS_INVOICES_CHECKLIST)
  }

  if (!aberto) return null

  const contagem = resumoGeral.contagem_global
  const percentual = resumoGeral.percentual_global

  return createPortal(
    <div
      className="sr-chk-modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-label="Checklist de conferência completo"
      onClick={onFechar}
    >
      <div className="sr-chk-modal-painel" onClick={(e) => e.stopPropagation()}>
        <header className="sr-chk-modal-cabecalho">
          <div className="sr-chk-modal-cabecalho-esq">
            <ClipboardText size={22} weight="duotone" className="sr-chk-modal-icone" aria-hidden />
            <div>
              <strong className="sr-chk-modal-titulo">Checklist de Conferência</strong>
              <p className="sr-chk-modal-subtitulo">
                {resumoGeral.total_invoices} invoice(s) · {contagem.total} avaliações · {percentual}%
                conforme
              </p>
            </div>
          </div>
          <div className="sr-conf-checklist-resumo" aria-label="Resumo do checklist">
            <span className="sr-conf-checklist-contagem sr-conf-checklist-contagem--verde">
              {contagem.verde} CONFORME
            </span>
            <span className="sr-conf-checklist-contagem sr-conf-checklist-contagem--amarelo">
              {contagem.amarelo} ATENÇÃO
            </span>
            <span className="sr-conf-checklist-contagem sr-conf-checklist-contagem--vermelho">
              {contagem.vermelho} FALHA
            </span>
            <span className="sr-conf-checklist-contagem sr-conf-checklist-contagem--pendente">
              {contagem.pendente} PENDENTE
            </span>
          </div>
          <button
            type="button"
            className="sr-chk-modal-fechar"
            onClick={onFechar}
            aria-label="Fechar checklist"
          >
            <X size={18} weight="bold" />
          </button>
        </header>

        <div className="sr-chk-modal-corpo">
          {invoices.length === 0 ? (
            <p className="sr-conf-vazio">Nenhuma invoice INVOICE encontrada nesta leitura.</p>
          ) : (
            <InfograficoChecklistGeralSmartRead
              resumo={resumoGeral}
              onSelecionarInvoice={selecionarInvoiceNaVisaoGeral}
              selecaoInvoice={{
                id: 'sr-chk-select-invoice',
                opcoes: opcoesSelecaoGeral,
                valor: filtroVisaoGeral,
                aoMudarValor: aoMudarFiltroVisaoGeral,
              }}
            >
              {mostrarDetalheInvoice && rotuloChecklistAtivo ? (
                <>
                  <ChecklistConferenciaCorpoSmartRead
                    secoes={secoesInvoice}
                    todasSecoesAbertas
                    onVerRisco={onVerRisco}
                    idPrefixo="sr-chk-modal-geral-inv"
                    classeCorpo="sr-chk-modal-checklist-corpo"
                  />
                  <ResumoContagemChecklistSmartRead
                    verde={contagemDetalheInvoice.verde}
                    amarelo={contagemDetalheInvoice.amarelo}
                    vermelho={contagemDetalheInvoice.vermelho}
                    pendente={contagemDetalheInvoice.pendente}
                    classe="sr-conf-checklist-resumo--rodape"
                  />
                </>
              ) : null}
            </InfograficoChecklistGeralSmartRead>
          )}
        </div>
      </div>
    </div>,
    document.body,
  )
}
