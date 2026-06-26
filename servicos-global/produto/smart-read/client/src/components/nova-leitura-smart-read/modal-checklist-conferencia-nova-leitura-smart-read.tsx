/**
 * modal-checklist-conferencia-nova-leitura-smart-read.tsx — checklist: visão geral + por invoice
 */

import { useEffect, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import { ClipboardText, X } from '@phosphor-icons/react'
import { SelectGlobal } from '@nucleo/campo-select-global'
import type { DocumentoAnaliseRisco } from '../../../../shared/analise-riscos-leitura-smart-read'
import {
  agruparChecklistPorSecao,
  listarInvoicesChecklist,
  montarChecklistMatrizInvoice,
  montarResumoGeralChecklistInvoices,
  type ParametrosChecklistMatrizInvoice,
} from '../../../../shared/montar-checklist-matriz-invoice-smart-read'
import {
  ChecklistConferenciaCorpoSmartRead,
} from './checklist-conferencia-corpo-smart-read'
import { InfograficoChecklistGeralSmartRead } from './infografico-checklist-geral-smart-read'

type AbaChecklistModal = 'geral' | 'invoice'

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
  const [aba, setAba] = useState<AbaChecklistModal>('geral')
  const [rotuloInvoiceSelecionada, setRotuloInvoiceSelecionada] = useState<string | null>(null)

  const invoices = useMemo(() => listarInvoicesChecklist(documentos), [documentos])

  const resumoGeral = useMemo(
    () =>
      montarResumoGeralChecklistInvoices({
        ...parametrosChecklist,
        documentos,
      }),
    [parametrosChecklist, documentos],
  )

  const rotuloAtivo = rotuloInvoiceSelecionada ?? invoices[0]?.rotulo ?? null

  const checklistInvoice = useMemo(() => {
    if (!rotuloAtivo) return []
    return montarChecklistMatrizInvoice({
      ...parametrosChecklist,
      rotulo_documento: rotuloAtivo,
    })
  }, [parametrosChecklist, rotuloAtivo])

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

  useEffect(() => {
    if (!aberto) return
    setAba('geral')
    setRotuloInvoiceSelecionada(invoices[0]?.rotulo ?? null)
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

  function irParaInvoice(rotulo: string) {
    setRotuloInvoiceSelecionada(rotulo)
    setAba('invoice')
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

        <div className="sr-chk-modal-abas" role="tablist" aria-label="Modo do checklist">
          <button
            type="button"
            role="tab"
            aria-selected={aba === 'geral'}
            className={`sr-chk-modal-aba${aba === 'geral' ? ' sr-chk-modal-aba--ativa' : ''}`}
            onClick={() => setAba('geral')}
          >
            Visão geral
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={aba === 'invoice'}
            className={`sr-chk-modal-aba${aba === 'invoice' ? ' sr-chk-modal-aba--ativa' : ''}`}
            onClick={() => setAba('invoice')}
          >
            Por invoice
          </button>
        </div>

        <div className="sr-chk-modal-corpo">
          {aba === 'geral' ? (
            <InfograficoChecklistGeralSmartRead
              resumo={resumoGeral}
              onSelecionarInvoice={irParaInvoice}
            />
          ) : (
            <div className="sr-chk-modal-invoice-detalhe">
              <div className="sr-chk-modal-invoice-select">
                <label className="sr-chk-modal-invoice-select-rotulo" htmlFor="sr-chk-select-invoice">
                  Invoice
                </label>
                <SelectGlobal
                  id="sr-chk-select-invoice"
                  opcoes={opcoesInvoice}
                  valor={rotuloAtivo}
                  aoMudarValor={(v) => setRotuloInvoiceSelecionada(v == null ? null : String(v))}
                  buscavel
                  placeholder="Selecione a invoice…"
                  posicao="baixo"
                />
              </div>

              {rotuloAtivo ? (
                <ChecklistConferenciaCorpoSmartRead
                  secoes={secoesInvoice}
                  todasSecoesAbertas
                  onVerRisco={onVerRisco}
                  idPrefixo="sr-chk-modal-inv"
                  classeCorpo="sr-chk-modal-checklist-corpo"
                />
              ) : (
                <p className="sr-conf-vazio">Nenhuma invoice INVOICE encontrada nesta leitura.</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body,
  )
}
