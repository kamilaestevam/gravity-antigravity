/**
 * modal-checklist-conferencia-nova-leitura-smart-read.tsx — checklist em modal (visão geral unificada)
 */

import { useEffect, useMemo, useRef, useState } from 'react'
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
import { montarClassificacaoProdutoChecklist } from '../../../../shared/montar-classificacao-produto-checklist-smart-read'
import { InfograficoChecklistGeralSmartRead } from './infografico-checklist-geral-smart-read'
import { ResumoContagemChecklistSmartRead } from './resumo-contagem-checklist-smart-read'
import {
  chaveItemChecklistUsuario,
  contarConferenciaManualChecklist,
  resolverRotuloInvoiceChecklistInicial,
  usarChecklistMarcacaoUsuario,
} from '../../shared/checklist-marcacao-usuario-smart-read'

type Props = {
  aberto: boolean
  onFechar: () => void
  documentos: DocumentoAnaliseRisco[]
  parametrosChecklist: Omit<ParametrosChecklistMatrizInvoice, 'rotulo_documento'>
  chaveMarcacaoChecklist: string
  rotuloDocumentoInicial?: string | null
  onVerRisco?: (riscoId: string) => void
}

export function ModalChecklistConferenciaNovaLeituraSmartRead({
  aberto,
  onFechar,
  documentos,
  parametrosChecklist,
  chaveMarcacaoChecklist,
  rotuloDocumentoInicial = null,
  onVerRisco,
}: Props) {
  const invoices = useMemo(() => listarInvoicesChecklist(documentos), [documentos])

  const rotuloInicialPadrao = useMemo(
    () =>
      resolverRotuloInvoiceChecklistInicial(
        rotuloDocumentoInicial,
        invoices,
        VALOR_TODAS_INVOICES_CHECKLIST,
      ),
    [invoices, rotuloDocumentoInicial],
  )

  const [filtroVisaoGeral, setFiltroVisaoGeral] = useState<string>(rotuloInicialPadrao)
  const abertoAnteriorRef = useRef(false)
  const { estaMarcado, alternarMarcado, alternarMarcadosLote, marcados } =
    usarChecklistMarcacaoUsuario(chaveMarcacaoChecklist)

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

  const chavesMarcacaoInvoice = useMemo(
    () =>
      checklistInvoice.map((item) =>
        chaveItemChecklistUsuario(item.regra.id, rotuloChecklistAtivo),
      ),
    [checklistInvoice, rotuloChecklistAtivo],
  )

  const todosItensInvoiceMarcados = useMemo(
    () =>
      chavesMarcacaoInvoice.length > 0 &&
      chavesMarcacaoInvoice.every((chave) => marcados.has(chave)),
    [chavesMarcacaoInvoice, marcados],
  )

  const conferenciaManual = useMemo(() => {
    if (!rotuloChecklistAtivo || checklistInvoice.length === 0) return null
    const chaves = checklistInvoice.map((item) =>
      chaveItemChecklistUsuario(item.regra.id, rotuloChecklistAtivo),
    )
    return contarConferenciaManualChecklist(marcados, chaves)
  }, [checklistInvoice, rotuloChecklistAtivo, marcados])

  const classificacaoProduto = useMemo(() => {
    if (!rotuloChecklistAtivo) return []
    return montarClassificacaoProdutoChecklist({
      documentos,
      riscos: parametrosChecklist.riscos,
      rotulo_documento: rotuloChecklistAtivo,
      pipelineConcluido: parametrosChecklist.pipelineConcluido,
      carregando: parametrosChecklist.carregando,
    })
  }, [documentos, parametrosChecklist, rotuloChecklistAtivo])

  useEffect(() => {
    if (aberto && !abertoAnteriorRef.current) {
      setFiltroVisaoGeral(rotuloInicialPadrao)
    }
    abertoAnteriorRef.current = aberto
  }, [aberto, rotuloInicialPadrao])

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
          <ResumoContagemChecklistSmartRead
            verde={contagem.verde}
            amarelo={contagem.amarelo}
            vermelho={contagem.vermelho}
            pendente={contagem.pendente}
            na={contagem.na}
          />
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
              conferenciaManual={conferenciaManual}
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
                    rotuloInvoice={rotuloChecklistAtivo}
                    estaMarcado={estaMarcado}
                    alternarMarcado={alternarMarcado}
                    chavesMarcacaoLote={chavesMarcacaoInvoice}
                    todosMarcadosLote={todosItensInvoiceMarcados}
                    onAlternarMarcadosLote={(marcar) =>
                      alternarMarcadosLote(chavesMarcacaoInvoice, marcar)
                    }
                    onAlternarChavesLote={alternarMarcadosLote}
                    idPrefixo="sr-chk-modal-geral-inv"
                    classeCorpo="sr-chk-modal-checklist-corpo"
                    classificacaoProduto={classificacaoProduto}
                  />
                  <ResumoContagemChecklistSmartRead
                    verde={contagemDetalheInvoice.verde}
                    amarelo={contagemDetalheInvoice.amarelo}
                    vermelho={contagemDetalheInvoice.vermelho}
                    pendente={contagemDetalheInvoice.pendente}
                    na={contagemDetalheInvoice.na}
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
