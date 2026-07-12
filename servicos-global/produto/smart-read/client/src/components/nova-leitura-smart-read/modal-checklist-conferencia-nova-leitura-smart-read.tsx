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
import {
  agruparChecklistBlPorSecao,
  calcularScoreChecklistBl,
  combinarResumoGeralComBls,
  ehTipoBlChecklist,
  montarChecklistMatrizBl,
  montarResumoChecklistBls,
  percentualConformeChecklistBl,
} from '../../../../shared/montar-checklist-matriz-bl-smart-read'
import {
  ROTULO_SECAO_MATRIZ_BL,
  type SecaoMatrizBl,
} from '../../../../shared/matriz-validacao-bl-smart-read'
import {
  agruparChecklistCertificadoOrigemPorSecao,
  calcularScoreChecklistCertificadoOrigem,
  combinarResumoGeralComCertificadosOrigem,
  ehTipoCertificadoOrigemChecklist,
  montarChecklistMatrizCertificadoOrigem,
  montarResumoChecklistCertificadosOrigem,
  percentualConformeChecklistCertificadoOrigem,
} from '../../../../shared/montar-checklist-matriz-certificado-origem-smart-read'
import {
  ROTULO_SECAO_MATRIZ_CERTIFICADO_ORIGEM,
  type SecaoMatrizCertificadoOrigem,
} from '../../../../shared/matriz-validacao-certificado-origem-smart-read'
import {
  agruparChecklistCertificadoFitossanitarioPorSecao,
  calcularScoreChecklistCertificadoFitossanitario,
  combinarResumoGeralComCertificadosFitossanitario,
  ehTipoCertificadoFitossanitarioChecklist,
  montarChecklistMatrizCertificadoFitossanitario,
  montarResumoChecklistCertificadosFitossanitario,
  percentualConformeChecklistCertificadoFitossanitario,
} from '../../../../shared/montar-checklist-matriz-certificado-fitossanitario-smart-read'
import {
  ROTULO_SECAO_MATRIZ_CERTIFICADO_FITOSSANITARIO,
  type SecaoMatrizCertificadoFitossanitario,
} from '../../../../shared/matriz-validacao-certificado-fitossanitario-smart-read'
import {
  agruparChecklistPedidoCompraPorSecao,
  calcularScoreChecklistPedidoCompra,
  combinarResumoGeralComPedidosCompra,
  ehTipoPedidoCompraChecklist,
  montarChecklistMatrizPedidoCompra,
  montarResumoChecklistPedidosCompra,
  percentualConformeChecklistPedidoCompra,
} from '../../../../shared/montar-checklist-matriz-pedido-compra-smart-read'
import {
  ROTULO_SECAO_MATRIZ_PEDIDO_COMPRA,
  type SecaoMatrizPedidoCompra,
} from '../../../../shared/matriz-validacao-pedido-compra-smart-read'
import {
  agruparChecklistPedidoVendaPorSecao,
  calcularScoreChecklistPedidoVenda,
  combinarResumoGeralComPedidosVenda,
  ehTipoPedidoVendaChecklist,
  montarChecklistMatrizPedidoVenda,
  montarResumoChecklistPedidosVenda,
  percentualConformeChecklistPedidoVenda,
} from '../../../../shared/montar-checklist-matriz-pedido-venda-smart-read'
import {
  ROTULO_SECAO_MATRIZ_PEDIDO_VENDA,
  type SecaoMatrizPedidoVenda,
} from '../../../../shared/matriz-validacao-pedido-venda-smart-read'
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
    const resumosBl = montarResumoChecklistBls({
      ...parametrosChecklist,
      documentos,
    })
    const resumosCo = montarResumoChecklistCertificadosOrigem({
      ...parametrosChecklist,
      documentos,
    })
    const resumosCf = montarResumoChecklistCertificadosFitossanitario({
      ...parametrosChecklist,
      documentos,
    })
    const resumosPc = montarResumoChecklistPedidosCompra({
      ...parametrosChecklist,
      documentos,
    })
    const resumosPv = montarResumoChecklistPedidosVenda({
      ...parametrosChecklist,
      documentos,
    })
    return combinarResumoGeralComPedidosVenda(
      combinarResumoGeralComPedidosCompra(
        combinarResumoGeralComCertificadosFitossanitario(
          combinarResumoGeralComCertificadosOrigem(
            combinarResumoGeralComBls(
              combinarResumoGeralComAwbs(
                combinarResumoGeralComPackingLists(resumoInvoices, resumosPackingList),
                resumosAwb,
              ),
              resumosBl,
            ),
            resumosCo,
          ),
          resumosCf,
        ),
        resumosPc,
      ),
      resumosPv,
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

  const documentoAtivoEhBl = useMemo(() => {
    if (!rotuloChecklistAtivo) return false
    const opcao = documentosOpcoes.find((doc) => doc.rotulo === rotuloChecklistAtivo)
    return !!opcao && ehTipoBlChecklist(opcao.tipo_documento)
  }, [documentosOpcoes, rotuloChecklistAtivo])

  const documentoAtivoEhCo = useMemo(() => {
    if (!rotuloChecklistAtivo) return false
    const opcao = documentosOpcoes.find((doc) => doc.rotulo === rotuloChecklistAtivo)
    return !!opcao && ehTipoCertificadoOrigemChecklist(opcao.tipo_documento)
  }, [documentosOpcoes, rotuloChecklistAtivo])

  const documentoAtivoEhCf = useMemo(() => {
    if (!rotuloChecklistAtivo) return false
    const opcao = documentosOpcoes.find((doc) => doc.rotulo === rotuloChecklistAtivo)
    return !!opcao && ehTipoCertificadoFitossanitarioChecklist(opcao.tipo_documento)
  }, [documentosOpcoes, rotuloChecklistAtivo])

  const documentoAtivoEhPc = useMemo(() => {
    if (!rotuloChecklistAtivo) return false
    const opcao = documentosOpcoes.find((doc) => doc.rotulo === rotuloChecklistAtivo)
    return !!opcao && ehTipoPedidoCompraChecklist(opcao.tipo_documento)
  }, [documentosOpcoes, rotuloChecklistAtivo])

  const documentoAtivoEhPv = useMemo(() => {
    if (!rotuloChecklistAtivo) return false
    const opcao = documentosOpcoes.find((doc) => doc.rotulo === rotuloChecklistAtivo)
    return !!opcao && ehTipoPedidoVendaChecklist(opcao.tipo_documento)
  }, [documentosOpcoes, rotuloChecklistAtivo])

  const checklistInvoice = useMemo(() => {
    if (
      !rotuloChecklistAtivo ||
      documentoAtivoEhPackingList ||
      documentoAtivoEhAwb ||
      documentoAtivoEhBl ||
      documentoAtivoEhCo ||
      documentoAtivoEhCf ||
      documentoAtivoEhPc ||
      documentoAtivoEhPv
    )
      return []
    return montarChecklistMatrizInvoice({
      ...parametrosChecklist,
      documentos,
      rotulo_documento: rotuloChecklistAtivo,
    })
  }, [
    documentoAtivoEhAwb,
    documentoAtivoEhBl,
    documentoAtivoEhCo,
    documentoAtivoEhCf,
    documentoAtivoEhPc,
    documentoAtivoEhPv,
    documentoAtivoEhPackingList,
    documentos,
    parametrosChecklist,
    rotuloChecklistAtivo,
  ])

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

  const checklistBl = useMemo(() => {
    if (!rotuloChecklistAtivo || !documentoAtivoEhBl) return []
    return montarChecklistMatrizBl({
      ...parametrosChecklist,
      documentos,
      rotulo_documento: rotuloChecklistAtivo,
    })
  }, [documentoAtivoEhBl, documentos, parametrosChecklist, rotuloChecklistAtivo])

  const secoesBl = useMemo(() => agruparChecklistBlPorSecao(checklistBl), [checklistBl])

  const scoreBl = useMemo(() => {
    if (checklistBl.length === 0) return null
    return calcularScoreChecklistBl(
      checklistBl,
      parametrosChecklist.pipelineConcluido && !parametrosChecklist.carregando,
    )
  }, [checklistBl, parametrosChecklist.carregando, parametrosChecklist.pipelineConcluido])

  const checklistCo = useMemo(() => {
    if (!rotuloChecklistAtivo || !documentoAtivoEhCo) return []
    return montarChecklistMatrizCertificadoOrigem({
      ...parametrosChecklist,
      documentos,
      rotulo_documento: rotuloChecklistAtivo,
    })
  }, [documentoAtivoEhCo, documentos, parametrosChecklist, rotuloChecklistAtivo])

  const secoesCo = useMemo(
    () => agruparChecklistCertificadoOrigemPorSecao(checklistCo),
    [checklistCo],
  )

  const scoreCo = useMemo(() => {
    if (checklistCo.length === 0) return null
    return calcularScoreChecklistCertificadoOrigem(
      checklistCo,
      parametrosChecklist.pipelineConcluido && !parametrosChecklist.carregando,
    )
  }, [checklistCo, parametrosChecklist.carregando, parametrosChecklist.pipelineConcluido])

  const checklistCf = useMemo(() => {
    if (!rotuloChecklistAtivo || !documentoAtivoEhCf) return []
    return montarChecklistMatrizCertificadoFitossanitario({
      ...parametrosChecklist,
      documentos,
      rotulo_documento: rotuloChecklistAtivo,
    })
  }, [documentoAtivoEhCf, documentos, parametrosChecklist, rotuloChecklistAtivo])

  const secoesCf = useMemo(
    () => agruparChecklistCertificadoFitossanitarioPorSecao(checklistCf),
    [checklistCf],
  )

  const scoreCf = useMemo(() => {
    if (checklistCf.length === 0) return null
    return calcularScoreChecklistCertificadoFitossanitario(
      checklistCf,
      parametrosChecklist.pipelineConcluido && !parametrosChecklist.carregando,
    )
  }, [checklistCf, parametrosChecklist.carregando, parametrosChecklist.pipelineConcluido])

  const checklistPc = useMemo(() => {
    if (!rotuloChecklistAtivo || !documentoAtivoEhPc) return []
    return montarChecklistMatrizPedidoCompra({
      ...parametrosChecklist,
      documentos,
      rotulo_documento: rotuloChecklistAtivo,
    })
  }, [documentoAtivoEhPc, documentos, parametrosChecklist, rotuloChecklistAtivo])

  const secoesPc = useMemo(
    () => agruparChecklistPedidoCompraPorSecao(checklistPc),
    [checklistPc],
  )

  const scorePc = useMemo(() => {
    if (checklistPc.length === 0) return null
    return calcularScoreChecklistPedidoCompra(
      checklistPc,
      parametrosChecklist.pipelineConcluido && !parametrosChecklist.carregando,
    )
  }, [checklistPc, parametrosChecklist.carregando, parametrosChecklist.pipelineConcluido])

  const checklistPv = useMemo(() => {
    if (!rotuloChecklistAtivo || !documentoAtivoEhPv) return []
    return montarChecklistMatrizPedidoVenda({
      ...parametrosChecklist,
      documentos,
      rotulo_documento: rotuloChecklistAtivo,
    })
  }, [documentoAtivoEhPv, documentos, parametrosChecklist, rotuloChecklistAtivo])

  const secoesPv = useMemo(
    () => agruparChecklistPedidoVendaPorSecao(checklistPv),
    [checklistPv],
  )

  const scorePv = useMemo(() => {
    if (checklistPv.length === 0) return null
    return calcularScoreChecklistPedidoVenda(
      checklistPv,
      parametrosChecklist.pipelineConcluido && !parametrosChecklist.carregando,
    )
  }, [checklistPv, parametrosChecklist.carregando, parametrosChecklist.pipelineConcluido])

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
    if (documentoAtivoEhBl) return contarChecklistPorStatus(checklistBl)
    if (documentoAtivoEhCo) return contarChecklistPorStatus(checklistCo)
    if (documentoAtivoEhCf) return contarChecklistPorStatus(checklistCf)
    if (documentoAtivoEhPc) return contarChecklistPorStatus(checklistPc)
    if (documentoAtivoEhPv) return contarChecklistPorStatus(checklistPv)
    const porInvoice = resumoGeral.por_invoice.find((inv) => inv.rotulo === rotuloChecklistAtivo)
    if (porInvoice) return porInvoice.contagem
    return contarChecklistPorStatus(checklistInvoice)
  }, [
    checklistAwb,
    checklistBl,
    checklistCo,
    checklistCf,
    checklistInvoice,
    checklistPc,
    checklistPv,
    checklistPackingList,
    documentoAtivoEhAwb,
    documentoAtivoEhBl,
    documentoAtivoEhCo,
    documentoAtivoEhCf,
    documentoAtivoEhPc,
    documentoAtivoEhPv,
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
    if (documentoAtivoEhBl) {
      const opcao = documentosOpcoes.find((doc) => doc.rotulo === rotuloChecklistAtivo)
      if (!opcao) return null
      const contagem = contarChecklistPorStatus(checklistBl)
      return {
        ...opcao,
        contagem,
        percentual_conforme: percentualConformeChecklistBl(contagem),
        veredito: vereditoDeContagemChecklist(contagem),
      }
    }
    if (documentoAtivoEhCo) {
      const opcao = documentosOpcoes.find((doc) => doc.rotulo === rotuloChecklistAtivo)
      if (!opcao) return null
      const contagem = contarChecklistPorStatus(checklistCo)
      return {
        ...opcao,
        contagem,
        percentual_conforme: percentualConformeChecklistCertificadoOrigem(contagem),
        veredito: vereditoDeContagemChecklist(contagem),
      }
    }
    if (documentoAtivoEhCf) {
      const opcao = documentosOpcoes.find((doc) => doc.rotulo === rotuloChecklistAtivo)
      if (!opcao) return null
      const contagem = contarChecklistPorStatus(checklistCf)
      return {
        ...opcao,
        contagem,
        percentual_conforme: percentualConformeChecklistCertificadoFitossanitario(contagem),
        veredito: vereditoDeContagemChecklist(contagem),
      }
    }
    if (documentoAtivoEhPc) {
      const opcao = documentosOpcoes.find((doc) => doc.rotulo === rotuloChecklistAtivo)
      if (!opcao) return null
      const contagem = contarChecklistPorStatus(checklistPc)
      return {
        ...opcao,
        contagem,
        percentual_conforme: percentualConformeChecklistPedidoCompra(contagem),
        veredito: vereditoDeContagemChecklist(contagem),
      }
    }
    if (documentoAtivoEhPv) {
      const opcao = documentosOpcoes.find((doc) => doc.rotulo === rotuloChecklistAtivo)
      if (!opcao) return null
      const contagem = contarChecklistPorStatus(checklistPv)
      return {
        ...opcao,
        contagem,
        percentual_conforme: percentualConformeChecklistPedidoVenda(contagem),
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
    checklistBl,
    checklistCo,
    checklistCf,
    checklistPc,
    checklistPv,
    checklistPackingList,
    documentoAtivoEhAwb,
    documentoAtivoEhBl,
    documentoAtivoEhCo,
    documentoAtivoEhCf,
    documentoAtivoEhPc,
    documentoAtivoEhPv,
    documentoAtivoEhPackingList,
    documentosOpcoes,
    mostrarDetalheInvoice,
    resumoGeral.por_invoice,
    rotuloChecklistAtivo,
  ])

  const classificacaoProduto = useMemo(() => {
    if (
      !rotuloChecklistAtivo ||
      documentoAtivoEhPackingList ||
      documentoAtivoEhAwb ||
      documentoAtivoEhBl ||
      documentoAtivoEhCo ||
      documentoAtivoEhCf ||
      documentoAtivoEhPc ||
      documentoAtivoEhPv
    )
      return []
    return montarClassificacaoProdutoChecklist({
      documentos,
      riscos: parametrosChecklist.riscos,
      rotulo_documento: rotuloChecklistAtivo,
      pipelineConcluido: parametrosChecklist.pipelineConcluido,
      carregando: parametrosChecklist.carregando,
    })
  }, [
    documentoAtivoEhAwb,
    documentoAtivoEhBl,
    documentoAtivoEhCo,
    documentoAtivoEhCf,
    documentoAtivoEhPc,
    documentoAtivoEhPv,
    documentoAtivoEhPackingList,
    documentos,
    parametrosChecklist,
    rotuloChecklistAtivo,
  ])

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
              emAnalise={parametrosChecklist.carregando}
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
                  ) : documentoAtivoEhBl ? (
                    <>
                      {scoreBl ? (
                        <div className="sr-chk-modal-score-pl" role="status">
                          <span className="sr-chk-modal-score-pl-item">
                            <strong>Score documental:</strong>{' '}
                            {scoreBl.pendente ? 'calculando…' : `${scoreBl.score}/100`}
                          </span>
                          <span className="sr-chk-modal-score-pl-item">
                            <strong>Classificação de risco:</strong>{' '}
                            {scoreBl.pendente ? 'calculando…' : scoreBl.rotulo_classificacao}
                          </span>
                          {scoreBl.gates_falhos.length > 0 ? (
                            <span className="sr-chk-modal-score-pl-item sr-chk-modal-score-pl-item--gate">
                              <strong>Gate(s):</strong> {scoreBl.gates_falhos.join(', ')}
                            </span>
                          ) : null}
                        </div>
                      ) : null}
                      <ChecklistConferenciaCorpoSmartRead
                        secoes={secoesBl}
                        todasSecoesAbertas
                        onVerRisco={onVerRisco}
                        rotuloInvoice={rotuloChecklistAtivo}
                        idPrefixo="sr-chk-modal-geral-bl"
                        classeCorpo="sr-chk-modal-checklist-corpo"
                        rotuloSecao={(secao) =>
                          ROTULO_SECAO_MATRIZ_BL[secao as SecaoMatrizBl] ?? secao
                        }
                      />
                    </>
                  ) : documentoAtivoEhCo ? (
                    <>
                      {scoreCo ? (
                        <div className="sr-chk-modal-score-pl" role="status">
                          <span className="sr-chk-modal-score-pl-item">
                            <strong>Score documental:</strong>{' '}
                            {scoreCo.pendente ? 'calculando…' : `${scoreCo.score}/100`}
                          </span>
                          <span className="sr-chk-modal-score-pl-item">
                            <strong>Classificação de risco:</strong>{' '}
                            {scoreCo.pendente ? 'calculando…' : scoreCo.rotulo_classificacao}
                          </span>
                          {scoreCo.gates_falhos.length > 0 ? (
                            <span className="sr-chk-modal-score-pl-item sr-chk-modal-score-pl-item--gate">
                              <strong>Gate(s):</strong> {scoreCo.gates_falhos.join(', ')}
                            </span>
                          ) : null}
                        </div>
                      ) : null}
                      <ChecklistConferenciaCorpoSmartRead
                        secoes={secoesCo}
                        todasSecoesAbertas
                        onVerRisco={onVerRisco}
                        rotuloInvoice={rotuloChecklistAtivo}
                        idPrefixo="sr-chk-modal-geral-co"
                        classeCorpo="sr-chk-modal-checklist-corpo"
                        rotuloSecao={(secao) =>
                          ROTULO_SECAO_MATRIZ_CERTIFICADO_ORIGEM[
                            secao as SecaoMatrizCertificadoOrigem
                          ] ?? secao
                        }
                      />
                    </>
                  ) : documentoAtivoEhCf ? (
                    <>
                      {scoreCf ? (
                        <div className="sr-chk-modal-score-pl" role="status">
                          <span className="sr-chk-modal-score-pl-item">
                            <strong>Score documental:</strong>{' '}
                            {scoreCf.pendente ? 'calculando…' : `${scoreCf.score}/100`}
                          </span>
                          <span className="sr-chk-modal-score-pl-item">
                            <strong>Classificação de risco:</strong>{' '}
                            {scoreCf.pendente ? 'calculando…' : scoreCf.rotulo_classificacao}
                          </span>
                          {scoreCf.gates_falhos.length > 0 ? (
                            <span className="sr-chk-modal-score-pl-item sr-chk-modal-score-pl-item--gate">
                              <strong>Gate(s):</strong> {scoreCf.gates_falhos.join(', ')}
                            </span>
                          ) : null}
                        </div>
                      ) : null}
                      <ChecklistConferenciaCorpoSmartRead
                        secoes={secoesCf}
                        todasSecoesAbertas
                        onVerRisco={onVerRisco}
                        rotuloInvoice={rotuloChecklistAtivo}
                        idPrefixo="sr-chk-modal-geral-cf"
                        classeCorpo="sr-chk-modal-checklist-corpo"
                        rotuloSecao={(secao) =>
                          ROTULO_SECAO_MATRIZ_CERTIFICADO_FITOSSANITARIO[
                            secao as SecaoMatrizCertificadoFitossanitario
                          ] ?? secao
                        }
                      />
                    </>
                  ) : documentoAtivoEhPc ? (
                    <>
                      {scorePc ? (
                        <div className="sr-chk-modal-score-pl" role="status">
                          <span className="sr-chk-modal-score-pl-item">
                            <strong>Score documental:</strong>{' '}
                            {scorePc.pendente ? 'calculando…' : `${scorePc.score}/100`}
                          </span>
                          <span className="sr-chk-modal-score-pl-item">
                            <strong>Classificação de risco:</strong>{' '}
                            {scorePc.pendente ? 'calculando…' : scorePc.rotulo_classificacao}
                          </span>
                          {scorePc.gates_falhos.length > 0 ? (
                            <span className="sr-chk-modal-score-pl-item sr-chk-modal-score-pl-item--gate">
                              <strong>Gate(s):</strong> {scorePc.gates_falhos.join(', ')}
                            </span>
                          ) : null}
                        </div>
                      ) : null}
                      <ChecklistConferenciaCorpoSmartRead
                        secoes={secoesPc}
                        todasSecoesAbertas
                        onVerRisco={onVerRisco}
                        rotuloInvoice={rotuloChecklistAtivo}
                        idPrefixo="sr-chk-modal-geral-pc"
                        classeCorpo="sr-chk-modal-checklist-corpo"
                        rotuloSecao={(secao) =>
                          ROTULO_SECAO_MATRIZ_PEDIDO_COMPRA[secao as SecaoMatrizPedidoCompra] ?? secao
                        }
                      />
                    </>
                  ) : documentoAtivoEhPv ? (
                    <>
                      {scorePv ? (
                        <div className="sr-chk-modal-score-pl" role="status">
                          <span className="sr-chk-modal-score-pl-item">
                            <strong>Score documental:</strong>{' '}
                            {scorePv.pendente ? 'calculando…' : `${scorePv.score}/100`}
                          </span>
                          <span className="sr-chk-modal-score-pl-item">
                            <strong>Classificação de risco:</strong>{' '}
                            {scorePv.pendente ? 'calculando…' : scorePv.rotulo_classificacao}
                          </span>
                          {scorePv.gates_falhos.length > 0 ? (
                            <span className="sr-chk-modal-score-pl-item sr-chk-modal-score-pl-item--gate">
                              <strong>Gate(s):</strong> {scorePv.gates_falhos.join(', ')}
                            </span>
                          ) : null}
                        </div>
                      ) : null}
                      <ChecklistConferenciaCorpoSmartRead
                        secoes={secoesPv}
                        todasSecoesAbertas
                        onVerRisco={onVerRisco}
                        rotuloInvoice={rotuloChecklistAtivo}
                        idPrefixo="sr-chk-modal-geral-pv"
                        classeCorpo="sr-chk-modal-checklist-corpo"
                        rotuloSecao={(secao) =>
                          ROTULO_SECAO_MATRIZ_PEDIDO_VENDA[secao as SecaoMatrizPedidoVenda] ?? secao
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
