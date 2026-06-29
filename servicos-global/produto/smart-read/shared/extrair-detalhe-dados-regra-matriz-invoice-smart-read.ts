/**
 * extrair-detalhe-dados-regra-matriz-invoice-smart-read.ts
 * SSOT checklist — valores lidos nos dados extraídos por regra da matriz.
 */

import type { DocumentoAnaliseRisco } from './analise-riscos-leitura-smart-read.js'
import {
  achatarCamposDadosLeitura,
  montarItensParaClassificacaoFiscal,
  valorTextoComparacaoCampo,
} from './analise-riscos-leitura-smart-read.js'
import { rotuloDocumentoChecklistInvoice } from './montar-checklist-matriz-invoice-smart-read.js'

function valorCampo(mapa: Map<string, unknown>, caminhos: string[]): string | null {
  for (const caminho of caminhos) {
    const direto = mapa.get(caminho)
    if (direto !== undefined) {
      const texto = valorTextoComparacaoCampo(direto)
      if (texto) return texto
    }
  }
  for (const [chave, valor] of mapa) {
    for (const caminho of caminhos) {
      const base = caminho.replace(/\[\]/g, '')
      if (chave.includes(base) || chave.toLowerCase().includes(caminho.toLowerCase())) {
        const texto = valorTextoComparacaoCampo(valor)
        if (texto) return texto
      }
    }
  }
  return null
}

function documentosEscopo(
  documentos: DocumentoAnaliseRisco[],
  rotuloDocumento?: string | null,
): DocumentoAnaliseRisco[] {
  const invoices = documentos.filter((d) => d.tipo_documento.toUpperCase().includes('INVOICE'))
  if (!rotuloDocumento) return invoices
  return invoices.filter(
    (d) =>
      rotuloDocumentoChecklistInvoice(d.nome_arquivo, d.tipo_documento, d.indice) === rotuloDocumento,
  )
}

function extrairItensResumo(dados: Record<string, unknown>) {
  const rows = dados.items ?? dados.itens ?? dados.lineItems
  if (!Array.isArray(rows)) return []
  return rows.map((row, indice) => {
    const r = row as Record<string, unknown>
    return {
      indice,
      partNumber: valorTextoComparacaoCampo(r.partNumber ?? r.sku ?? r.itemCode),
      ncm: valorTextoComparacaoCampo(r.ncm ?? r.NCM),
      unidade: valorTextoComparacaoCampo(r.unit ?? r.uom),
      qty: valorTextoComparacaoCampo(r.itemQuantity ?? r.quantity ?? r.qty),
    }
  })
}

/** Retorna texto com o valor lido na extração para exibir no checklist (coluna Resultado). */
export function extrairDetalheDadosRegraMatrizInvoice(
  idRegra: string,
  documentos: DocumentoAnaliseRisco[],
  rotuloDocumento?: string | null,
): string | null {
  const docs = documentosEscopo(documentos, rotuloDocumento)
  if (docs.length === 0) return null

  const partes: string[] = []
  for (const doc of docs) {
    const mapa = achatarCamposDadosLeitura(doc.dados)
    const rotulo = rotuloDocumentoChecklistInvoice(doc.nome_arquivo, doc.tipo_documento, doc.indice)

    switch (idRegra) {
      case 'S1-01':
        partes.push(
          valorCampo(mapa, ['document.invoiceNumber', 'invoiceNumber', 'document.number']) ??
            'número não extraído',
        )
        break
      case 'S1-02':
        partes.push(
          valorCampo(mapa, ['document.issueDate', 'document.emissionDate', 'issueDate', 'date']) ??
            'data não extraída',
        )
        break
      case 'S1-03':
        partes.push(
          valorCampo(mapa, [
            'document.poNumber',
            'document.purchaseOrder',
            'poNumber',
            'proformaNumber',
            'document.proformaNumber',
          ]) ?? 'PO/Proforma não extraído',
        )
        break
      case 'S1-04':
        partes.push(
          valorCampo(mapa, ['document.pageCount', 'document.totalPages', 'pagination.total']) ??
            'paginação não extraída',
        )
        break
      case 'S2-01':
      case 'S2-02':
        partes.push(
          valorCampo(mapa, ['importer.cnpj', 'importer.taxId', 'buyer.cnpj']) ?? 'CNPJ não extraído',
        )
        break
      case 'S2-03':
        partes.push(valorCampo(mapa, ['importer.name', 'importer.companyName']) ?? 'razão social não extraída')
        break
      case 'S2-04':
        partes.push(valorCampo(mapa, ['importer.address']) ?? 'endereço não extraído')
        break
      case 'S2-05':
        partes.push(
          [
            valorCampo(mapa, ['exporter.name', 'seller.name']),
            valorCampo(mapa, ['exporter.taxId', 'exporter.taxId']),
          ]
            .filter(Boolean)
            .join(' · ') || 'exportador não extraído',
        )
        break
      case 'S2-06':
        partes.push(
          valorCampo(mapa, ['manufacturer.name', 'manufacturer']) ?? 'fabricante não extraído',
        )
        break
      case 'S2-07':
        partes.push(
          valorCampo(mapa, ['notifyParty.name', 'delivery.name', 'consignee.name']) ??
            'notify/delivery não extraído',
        )
        break
      case 'S3-01':
        partes.push(
          [
            valorCampo(mapa, ['document.incoterm', 'incoterm']),
            valorCampo(mapa, ['document.incotermLocation', 'incotermLocation']),
          ]
            .filter(Boolean)
            .join(' ') || 'Incoterm não extraído',
        )
        break
      case 'S3-02':
        partes.push(
          valorCampo(mapa, ['document.incotermLocation', 'incotermLocation']) ?? 'local Incoterm não extraído',
        )
        break
      case 'S3-03':
        partes.push(
          [
            valorCampo(mapa, ['document.originCountry', 'originCountry']),
            valorCampo(mapa, ['document.acquisitionCountry']),
          ]
            .filter(Boolean)
            .join(' · ') || 'rota não extraída',
        )
        break
      case 'S3-04':
        partes.push('análise normativa (RAG) sobre dados logísticos extraídos')
        break
      case 'S4-01': {
        const itens = extrairItensResumo(doc.dados)
        const comPn = itens.filter((i) => i.partNumber).length
        partes.push(itens.length === 0 ? 'sem linhas' : `${comPn}/${itens.length} linha(s) com PN`)
        break
      }
      case 'S4-02': {
        const descricoes = montarItensParaClassificacaoFiscal([doc])
          .map((i) => i.descricao?.trim())
          .filter((d): d is string => Boolean(d))
        partes.push(
          descricoes.length === 0
            ? 'descrição não extraída'
            : descricoes.map((d) => d.slice(0, 80)).join('; '),
        )
        break
      }
      case 'S4-03': {
        const itensDesc = montarItensParaClassificacaoFiscal([doc]).filter((i) => i.descricao?.trim())
        partes.push(
          itensDesc.length === 0
            ? 'descrição não extraída'
            : itensDesc
                .map((i) => `L${i.indice + 1}: ${i.descricao!.trim().slice(0, 60)}`)
                .join('; '),
        )
        break
      }
      case 'S4-04': {
        const itens = extrairItensResumo(doc.dados)
        const ncms = itens.map((i) => i.ncm).filter(Boolean)
        partes.push(ncms.length === 0 ? 'NCM não extraído' : ncms.join(', '))
        break
      }
      case 'S4-05': {
        const itens = extrairItensResumo(doc.dados)
        const comUn = itens.filter((i) => i.qty && i.unidade).length
        partes.push(itens.length === 0 ? 'sem linhas' : `${comUn}/${itens.length} com unidade`)
        break
      }
      case 'S5-01':
      case 'S5-02':
        partes.push(
          valorCampo(mapa, ['currency.type', 'currency', 'document.currency']) ?? 'moeda não extraída',
        )
        break
      case 'S5-03':
        partes.push(`${extrairItensResumo(doc.dados).length} linha(s) financeiras`)
        break
      case 'S5-04':
        partes.push(
          valorCampo(mapa, ['values.subtotal', 'subtotal', 'values.merchandiseTotal']) ??
            'subtotal não extraído',
        )
        break
      case 'S5-05':
        partes.push(
          valorCampo(mapa, ['values.totalDocumentValue', 'totalDocumentValue', 'totalValue']) ??
            'total não extraído',
        )
        break
      case 'S5-06':
        partes.push('rateio frete/desconto global (se extraído)')
        break
      case 'S6-01':
        partes.push(
          [
            valorCampo(mapa, ['payment.bankName', 'bank.name']),
            valorCampo(mapa, ['payment.account', 'bank.account']),
          ]
            .filter(Boolean)
            .join(' · ') || 'dados bancários não extraídos',
        )
        break
      case 'S6-02':
        partes.push(
          [
            valorCampo(mapa, ['payment.swift', 'bank.swift', 'swiftCode']) &&
              `SWIFT: ${valorCampo(mapa, ['payment.swift', 'bank.swift', 'swiftCode'])}`,
            valorCampo(mapa, ['payment.iban', 'bank.iban']) &&
              `IBAN: ${valorCampo(mapa, ['payment.iban', 'bank.iban'])}`,
          ]
            .filter(Boolean)
            .join(' · ') || 'SWIFT/IBAN não extraídos',
        )
        break
      case 'S6-03':
        partes.push(
          valorCampo(mapa, ['payment.terms', 'paymentTerms', 'document.paymentTerms']) ??
            'termos de pagamento não extraídos',
        )
        break
      case 'S7-01':
        partes.push(
          [
            valorCampo(mapa, ['weights.grossWeight', 'grossWeight']),
            valorCampo(mapa, ['weights.netWeight', 'netWeight']),
          ]
            .filter(Boolean)
            .join(' / ') || 'pesos não extraídos',
        )
        break
      case 'S7-02':
        partes.push(
          valorCampo(mapa, ['packages.count', 'packages.total', 'document.packageCount']) ??
            'volumes não extraídos',
        )
        break
      case 'S7-03':
        partes.push('embalagem — análise semântica dos itens/descrições')
        break
      case 'S8-01':
        partes.push(
          valorCampo(mapa, ['signature', 'document.signed', 'document.signature']) ??
            'assinatura não identificada na extração',
        )
        break
      default:
        break
    }

    if (docs.length > 1 && partes.length > 0) {
      partes[partes.length - 1] = `${rotulo}: ${partes[partes.length - 1]}`
    }
  }

  return partes.length > 0 ? partes.join(' · ') : null
}

/** Indica se há dado extraído suficiente para o motor LLM/RAG avaliar (não é veredito). */
export function regraMatrizTemDadoExtraido(
  idRegra: string,
  documentos: DocumentoAnaliseRisco[],
  rotuloDocumento?: string | null,
): boolean {
  const detalhe = extrairDetalheDadosRegraMatrizInvoice(idRegra, documentos, rotuloDocumento)
  if (!detalhe) return false
  return !/não extraíd|não identificad|sem linhas|ausente/i.test(detalhe)
}
