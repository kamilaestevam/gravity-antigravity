/**
 * modal-checklist-conferencia-nova-leitura-smart-read.tsx — checklist em modal (visão geral unificada)
 */

import { useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { ClipboardText, X } from '@phosphor-icons/react'
import type { DocumentoAnaliseRisco } from '../../../../shared/analise-riscos-leitura-smart-read'
import {
  agruparChecklistPorSecao,
  contarChecklistPorStatus,
  listarDocumentosOpcoesChecklistCompleto,
  montarChecklistMatrizInvoice,
  montarResumoGeralChecklistInvoices,
  VALOR_TODAS_INVOICES_CHECKLIST,
  vereditoDeContagemChecklist,
  type ParametrosChecklistMatrizInvoice,
  type ResumoInvoiceChecklist,
  type SubdocumentoOpcaoChecklist,
} from '../../../../shared/montar-checklist-matriz-invoice-smart-read'
import {
  agruparChecklistPackingListPorSecao,
  calcularScoreChecklistPackingList,
  combinarResumoGeralComPackingLists,
  montarChecklistMatrizPackingList,
  montarResumoChecklistPackingLists,
  percentualConformeChecklistPackingList,
} from '../../../../shared/montar-checklist-matriz-packing-list-smart-read'
import {
  ROTULO_SECAO_MATRIZ_PACKING_LIST,
  type SecaoMatrizPackingList,
} from '../../../../shared/matriz-validacao-packing-list-smart-read'
import {
  agruparChecklistAwbPorSecao,
  calcularScoreChecklistAwb,
  combinarResumoGeralComAwbs,
  ehTipoAwbChecklist,
  montarChecklistMatrizAwb,
  montarResumoChecklistAwbs,
  percentualConformeChecklistAwb,
} from '../../../../shared/montar-checklist-matriz-awb-smart-read'
import {
  ROTULO_SECAO_MATRIZ_AWB,
  type SecaoMatrizAwb,
} from '../../../../shared/matriz-validacao-awb-smart-read'
import { ChecklistConferenciaCorpoSmartRead } from './checklist-conferencia-corpo-smart-read'
import { montarClassificacaoProdutoChecklist } from '../../../../shared/montar-classificacao-produto-checklist-smart-read'
import { InfograficoChecklistGeralSmartRead } from './infografico-checklist-geral-smart-read'
import { ResumoContagemChecklistSmartRead } from './resumo-contagem-checklist-smart-read'
import { resolverRotuloInvoiceChecklistInicial } from '../../shared/checklist-marcacao-usuario-smart-read'

type Props = {
  aberto: boolean
  onFechar: () => void
  documentos: DocumentoAnaliseRisco[]
  nomeArquivo: string
  subdocumentosSidebar: readonly SubdocumentoOpcaoChecklist[]
  parametrosChecklist: Omit<ParametrosChecklistMatrizInvoice, 'rotulo_documento'>
  rotuloDocumentoInicial?: string | null
  indiceDocumentoInicial?: number | null
  onVerRisco?: (riscoId: string) => void
  avisoAnalise?: string | null
}

export function ModalChecklistConferenciaNovaLeituraSmartRead({
  aberto,
  onFechar,
  documentos,
  nomeArquivo,
  subdocumentosSidebar,
  parametrosChecklist,
  rotuloDocumentoInicial = null,
  indiceDocumentoInicial = null,
  onVerRisco,
  avisoAnalise = null,
}: Props) {
  const documentosOpcoes = useMemo(
    () => listarDocumentosOpcoesChecklistCompleto(nomeArquivo, subdocumentosSidebar, documentos),
    [documentos, nomeArquivo, subdocumentosSidebar],
  )

  const rotuloInicialPadrao = useMemo(
    () =>
      resolverRotuloInvoiceChecklistInicial(
        rotuloDocumentoInicial,
        documentosOpcoes,
        VALOR_TODAS_INVOICES_CHECKLIST,
        indiceDocumentoInicial,
      ),
    [documentosOpcoes, rotuloDocumentoInicial, indiceDocumentoInicial],
  )

  const [filtroVisaoGeral, setFiltroVisaoGeral] = useState<string>(rotuloInicialPadrao)
  const abertoAnteriorRef = useRef(false)

  const resumoGeral = useMemo(() => {
    const resumoInvoices = montarResumoGeralChecklistInvoices({
      ...parametrosChecklist,
      documentos,
    })
    const resumosPackingList = montarResumoChecklistPackingLists({
      ...parametrosChecklist,
      documentos,
    })
    const resumosAwb = montarResumoChecklistAwbs({
      ...parametrosChecklist,
      documentos,
    })
    return combinarResumoGeralComAwbs(
      combinarResumoGeralComPackingLists(resumoInvoices, resumosPackingList),
      resumosAwb,
    )
  }, [parametrosChecklist, documentos])

  const mostrarDetalheInvoice = filtroVisaoGeral !== VALOR_TODAS_INVOICES_CHECKLIST
  const rotuloChecklistAtivo = mostrarDetalheInvoice ? filtroVisaoGeral : null

  const documentoAtivoEhPackingList = useMemo(() => {
    if (!rotuloChecklistAtivo) return false
    const opcao = documentosOpcoes.find((doc) => doc.rotulo === rotuloChecklistAtivo)
    return !!opcao && opcao.tipo_documento.toUpperCase().includes('PACKING')
  }, [documentosOpcoes, rotuloChecklistAtivo])

  const documentoAtivoEhAwb = useMemo(() => {
    if (!rotuloChecklistAtivo) return false
    const opcao = documentosOpcoes.find((doc) => doc.rotulo === rotuloChecklistAtivo)
    return !!opcao && ehTipoAwbChecklist(opcao.tipo_documento)
  }, [documentosOpcoes, rotuloChecklistAtivo])

  const checklistInvoice = useMemo(() => {
    if (!rotuloChecklistAtivo || documentoAtivoEhPackingList || documentoAtivoEhAwb) return []
    return montarChecklistMatrizInvoice({
      ...parametrosChecklist,
      documentos,
      rotulo_documento: rotuloChecklistAtivo,
    })
  }, [documentoAtivoEhAwb, documentoAtivoEhPackingList, documentos, parametrosChecklist, rotuloChecklistAtivo])

  const secoesInvoice = useMemo(
    () => agruparChecklistPorSecao(checklistInvoice),
    [checklistInvoice],
  )

  const checklistPackingList = useMemo(() => {
    if (!rotuloChecklistAtivo || !documentoAtivoEhPackingList) return []
    return montarChecklistMatrizPackingList({
      ...parametrosChecklist,
      documentos,
      rotulo_documento: rotuloChecklistAtivo,
    })
  }, [documentoAtivoEhPackingList, documentos, parametrosChecklist, rotuloChecklistAtivo])

  const secoesPackingList = useMemo(
    () => agruparChecklistPackingListPorSecao(checklistPackingList),
    [checklistPackingList],
  )

  const scorePackingList = useMemo(() => {
    if (checklistPackingList.length === 0) return null
    return calcularScoreChecklistPackingList(
      checklistPackingList,
      parametrosChecklist.pipelineConcluido && !parametrosChecklist.carregando,
    )
  }, [checklistPackingList, parametrosChecklist.carregando, parametrosChecklist.pipelineConcluido])

  const checklistAwb = useMemo(() => {
    if (!rotuloChecklistAtivo || !documentoAtivoEhAwb) return []
    return montarChecklistMatrizAwb({
      ...parametrosChecklist,
      documentos,
      rotulo_documento: rotuloChecklistAtivo,
    })
  }, [documentoAtivoEhAwb, documentos, parametrosChecklist, rotuloChecklistAtivo])

  const secoesAwb = useMemo(() => agruparChecklistAwbPorSecao(checklistAwb), [checklistAwb])

  const scoreAwb = useMemo(() => {
    if (checklistAwb.length === 0) return null
    return calcularScoreChecklistAwb(
      checklistAwb,
      parametrosChecklist.pipelineConcluido && !parametrosChecklist.carregando,
    )
  }, [checklistAwb, parametrosChecklist.carregando, parametrosChecklist.pipelineConcluido])

  const opcoesInvoice = useMemo(
    () =>
      documentosOpcoes.map((doc) => ({
        valor: doc.rotulo,
        rotulo: doc.numero_invoice
          ? `${doc.numero_invoice} · ${doc.nome_arquivo}`
          : `${doc.nome_arquivo} · ${doc.tipo_documento}`,
      })),
    [documentosOpcoes],
  )

  const opcoesSelecaoGeral = useMemo(
    () => [{ valor: VALOR_TODAS_INVOICES_CHECKLIST, rotulo: 'Todas' }, ...opcoesInvoice],
    [opcoesInvoice],
  )

  const contagemDetalheInvoice = useMemo(() => {
    if (!rotuloChecklistAtivo) return resumoGeral.contagem_global
    if (documentoAtivoEhPackingList) return contarChecklistPorStatus(checklistPackingList)
    if (documentoAtivoEhAwb) return contarChecklistPorStatus(checklistAwb)
    const porInvoice = resumoGeral.por_invoice.find((inv) => inv.rotulo === rotuloChecklistAtivo)
    if (porInvoice) return porInvoice.contagem
    return contarChecklistPorStatus(checklistInvoice)
  }, [
    checklistAwb,
    checklistInvoice,
    checklistPackingList,
    documentoAtivoEhAwb,
    documentoAtivoEhPackingList,
    resumoGeral,
    rotuloChecklistAtivo,
  ])

  const documentoDestaque = useMemo((): ResumoInvoiceChecklist | null => {
    if (!rotuloChecklistAtivo || !mostrarDetalheInvoice) return null
    if (documentoAtivoEhPackingList) {
      const opcao = documentosOpcoes.find((doc) => doc.rotulo === rotuloChecklistAtivo)
      if (!opcao) return null
      const contagem = contarChecklistPorStatus(checklistPackingList)
      return {
        ...opcao,
        contagem,
        percentual_conforme: percentualConformeChecklistPackingList(contagem),
        veredito: vereditoDeContagemChecklist(contagem),
      }
    }
    if (documentoAtivoEhAwb) {
      const opcao = documentosOpcoes.find((doc) => doc.rotulo === rotuloChecklistAtivo)
      if (!opcao) return null
      const contagem = contarChecklistPorStatus(checklistAwb)
      return {
        ...opcao,
        contagem,
        percentual_conforme: percentualConformeChecklistAwb(contagem),
        veredito: vereditoDeContagemChecklist(contagem),
      }
    }
    const porInvoice = resumoGeral.por_invoice.find((inv) => inv.rotulo === rotuloChecklistAtivo)
    if (porInvoice) return porInvoice
    const opcao = documentosOpcoes.find((doc) => doc.rotulo === rotuloChecklistAtivo)
    if (!opcao) return null
    const contagem = contarChecklistPorStatus(checklistInvoice)
    const percentual_conforme =
      contagem.total === 0
        ? 0
        : Math.round(((contagem.verde + contagem.na) / contagem.total) * 100)
    return {
      ...opcao,
      contagem,
      percentual_conforme,
      veredito: vereditoDeContagemChecklist(contagem),
    }
  }, [
    checklistAwb,
    checklistInvoice,
    checklistPackingList,
    documentoAtivoEhAwb,
    documentoAtivoEhPackingList,
    documentosOpcoes,
    mostrarDetalheInvoice,
    resumoGeral.por_invoice,
    rotuloChecklistAtivo,
  ])

  const classificacaoProduto = useMemo(() => {
    if (!rotuloChecklistAtivo || documentoAtivoEhPackingList || documentoAtivoEhAwb) return []
    return montarClassificacaoProdutoChecklist({
      documentos,
      riscos: parametrosChecklist.riscos,
      rotulo_documento: rotuloChecklistAtivo,
      pipelineConcluido: parametrosChecklist.pipelineConcluido,
      carregando: parametrosChecklist.carregando,
    })
  }, [documentoAtivoEhAwb, documentoAtivoEhPackingList, documentos, parametrosChecklist, rotuloChecklistAtivo])

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
                {resumoGeral.total_invoices} documento(s) · {contagem.total} avaliações · {percentual}%
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
        {avisoAnalise ? (
          <p className="sr-chk-modal-aviso-analise" role="status">
            {avisoAnalise}
          </p>
        ) : null}

        <div className="sr-chk-modal-corpo">
          {documentosOpcoes.length === 0 ? (
            <p className="sr-conf-vazio">Nenhum documento encontrado nesta leitura.</p>
          ) : (
            <InfograficoChecklistGeralSmartRead
              resumo={resumoGeral}
              onSelecionarInvoice={selecionarInvoiceNaVisaoGeral}
              documentoDestaque={documentoDestaque}
              selecaoInvoice={{
                id: 'sr-chk-select-invoice',
                opcoes: opcoesSelecaoGeral,
                valor: filtroVisaoGeral,
                aoMudarValor: aoMudarFiltroVisaoGeral,
              }}
            >
              {mostrarDetalheInvoice && rotuloChecklistAtivo ? (
                <>
                  {documentoAtivoEhPackingList ? (
                    <>
                      {scorePackingList ? (
                        <div className="sr-chk-modal-score-pl" role="status">
                          <span className="sr-chk-modal-score-pl-item">
                            <strong>Score documental:</strong>{' '}
                            {scorePackingList.pendente ? 'calculando…' : `${scorePackingList.score}/100`}
                          </span>
                          <span className="sr-chk-modal-score-pl-item">
                            <strong>Classificação de risco:</strong>{' '}
                            {scorePackingList.pendente
                              ? 'calculando…'
                              : scorePackingList.rotulo_classificacao}
                          </span>
                          {scorePackingList.gates_falhos.length > 0 ? (
                            <span className="sr-chk-modal-score-pl-item sr-chk-modal-score-pl-item--gate">
                              <strong>Gate(s):</strong> {scorePackingList.gates_falhos.join(', ')}
                            </span>
                          ) : null}
                        </div>
                      ) : null}
                      <ChecklistConferenciaCorpoSmartRead
                        secoes={secoesPackingList}
                        todasSecoesAbertas
                        onVerRisco={onVerRisco}
                        rotuloInvoice={rotuloChecklistAtivo}
                        idPrefixo="sr-chk-modal-geral-pl"
                        classeCorpo="sr-chk-modal-checklist-corpo"
                        rotuloSecao={(secao) =>
                          ROTULO_SECAO_MATRIZ_PACKING_LIST[secao as SecaoMatrizPackingList] ?? secao
                        }
                      />
                    </>
                  ) : documentoAtivoEhAwb ? (
                    <>
                      {scoreAwb ? (
                        <div className="sr-chk-modal-score-pl" role="status">
                          <span className="sr-chk-modal-score-pl-item">
                            <strong>Score documental:</strong>{' '}
                            {scoreAwb.pendente ? 'calculando…' : `${scoreAwb.score}/100`}
                          </span>
                          <span className="sr-chk-modal-score-pl-item">
                            <strong>Classificação de risco:</strong>{' '}
                            {scoreAwb.pendente ? 'calculando…' : scoreAwb.rotulo_classificacao}
                          </span>
                          {scoreAwb.gates_falhos.length > 0 ? (
                            <span className="sr-chk-modal-score-pl-item sr-chk-modal-score-pl-item--gate">
                              <strong>Gate(s):</strong> {scoreAwb.gates_falhos.join(', ')}
                            </span>
                          ) : null}
                        </div>
                      ) : null}
                      <ChecklistConferenciaCorpoSmartRead
                        secoes={secoesAwb}
                        todasSecoesAbertas
                        onVerRisco={onVerRisco}
                        rotuloInvoice={rotuloChecklistAtivo}
                        idPrefixo="sr-chk-modal-geral-awb"
                        classeCorpo="sr-chk-modal-checklist-corpo"
                        rotuloSecao={(secao) =>
                          ROTULO_SECAO_MATRIZ_AWB[secao as SecaoMatrizAwb] ?? secao
                        }
                      />
                    </>
                  ) : (
                    <ChecklistConferenciaCorpoSmartRead
                      secoes={secoesInvoice}
                      todasSecoesAbertas
                      onVerRisco={onVerRisco}
                      rotuloInvoice={rotuloChecklistAtivo}
                      idPrefixo="sr-chk-modal-geral-inv"
                      classeCorpo="sr-chk-modal-checklist-corpo"
                      classificacaoProduto={classificacaoProduto}
                    />
                  )}
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
