/**
 * montar-zip-exportacao-simulador-smart-doc.ts — ZIP no formato legado DATI (paridade Smart Read)
 *
 * Estrutura por PDF de origem:
 *   {stem}/
 *     1-PACKING_LIST.pdf | .json | .txt | .xlsx
 *     2-INVOICE.pdf      | .json | .txt | .xlsx
 *     {nome-original}.pdf
 */

import type { ArquivoDemoSimulador } from './arquivos-demo-simulador-smart-doc'
import type { DocumentoSimulador, TipoDocumentoSimulador } from './documentos-preview-simulador-smart-doc'
import {
  obterSecoesConferenciaSimulador,
  type SecaoConferenciaSimulador,
} from './dados-conferencia-simulador-smart-doc'

export type ArquivoZipSimulador = {
  nome: string
  dados: Uint8Array
}

const ASSINATURA_LOCAL = 0x04034b50
const ASSINATURA_CENTRAL = 0x02014b50
const ASSINATURA_FIM = 0x06054b50

const enc = new TextEncoder()

function crc32(bytes: Uint8Array): number {
  let crc = 0xffffffff
  for (let i = 0; i < bytes.length; i += 1) {
    crc ^= bytes[i]
    for (let j = 0; j < 8; j += 1) {
      const mask = -(crc & 1)
      crc = (crc >>> 1) ^ (0xedb88320 & mask)
    }
  }
  return (crc ^ 0xffffffff) >>> 0
}

function writeUint32LE(view: DataView, offset: number, value: number) {
  view.setUint32(offset, value, true)
}

function writeUint16LE(view: DataView, offset: number, value: number) {
  view.setUint16(offset, value, true)
}

export function montarZipExportacaoSimulador(arquivos: ArquivoZipSimulador[]): Blob {
  const partes: Uint8Array[] = []
  const central: Uint8Array[] = []
  let offset = 0

  for (const arquivo of arquivos) {
    const nomeBytes = enc.encode(arquivo.nome)
    const dados = arquivo.dados
    const crc = crc32(dados)

    const local = new Uint8Array(30 + nomeBytes.length + dados.length)
    const lv = new DataView(local.buffer)
    writeUint32LE(lv, 0, ASSINATURA_LOCAL)
    writeUint16LE(lv, 4, 20)
    writeUint16LE(lv, 6, 0)
    writeUint16LE(lv, 8, 0)
    writeUint16LE(lv, 10, 0)
    writeUint16LE(lv, 12, 0)
    writeUint32LE(lv, 14, crc)
    writeUint32LE(lv, 18, dados.length)
    writeUint32LE(lv, 22, dados.length)
    writeUint16LE(lv, 26, nomeBytes.length)
    writeUint16LE(lv, 28, 0)
    local.set(nomeBytes, 30)
    local.set(dados, 30 + nomeBytes.length)
    partes.push(local)
    offset += local.length

    const cent = new Uint8Array(46 + nomeBytes.length)
    const cv = new DataView(cent.buffer)
    writeUint32LE(cv, 0, ASSINATURA_CENTRAL)
    writeUint16LE(cv, 4, 20)
    writeUint16LE(cv, 6, 20)
    writeUint16LE(cv, 8, 0)
    writeUint16LE(cv, 10, 0)
    writeUint16LE(cv, 12, 0)
    writeUint16LE(cv, 14, 0)
    writeUint32LE(cv, 16, crc)
    writeUint32LE(cv, 20, dados.length)
    writeUint32LE(cv, 24, dados.length)
    writeUint16LE(cv, 28, nomeBytes.length)
    writeUint16LE(cv, 30, 0)
    writeUint16LE(cv, 32, 0)
    writeUint16LE(cv, 34, 0)
    writeUint16LE(cv, 36, 0)
    writeUint32LE(cv, 38, 0)
    writeUint32LE(cv, 42, offset - local.length)
    cent.set(nomeBytes, 46)
    central.push(cent)
  }

  const centralSize = central.reduce((acc, c) => acc + c.length, 0)
  const centralOffset = offset

  const fim = new Uint8Array(22)
  const fv = new DataView(fim.buffer)
  writeUint32LE(fv, 0, ASSINATURA_FIM)
  writeUint16LE(fv, 4, 0)
  writeUint16LE(fv, 6, 0)
  writeUint16LE(fv, 8, arquivos.length)
  writeUint16LE(fv, 10, arquivos.length)
  writeUint32LE(fv, 12, centralSize)
  writeUint32LE(fv, 16, centralOffset)
  writeUint16LE(fv, 20, 0)

  const total = partes.reduce((n, p) => n + p.length, 0) + centralSize + fim.length
  const zip = new Uint8Array(total)
  let pos = 0
  for (const p of partes) {
    zip.set(p, pos)
    pos += p.length
  }
  for (const c of central) {
    zip.set(c, pos)
    pos += c.length
  }
  zip.set(fim, pos)

  return new Blob([zip], { type: 'application/zip' })
}

function sanitizarNomeArquivo(nome: string): string {
  return nome.replace(/[\\/:*?"<>|]+/g, '-').trim() || 'leitura'
}

function resolverStemPdf(nomeArquivo: string): string {
  return sanitizarNomeArquivo(nomeArquivo.replace(/\.pdf$/i, ''))
}

function resolverTipoDati(tipo: TipoDocumentoSimulador): string {
  if (tipo === 'packing-list') return 'PACKING_LIST'
  if (tipo === 'bill-of-lading') return 'BL'
  return 'INVOICE'
}

function injetarCaminho(objeto: Record<string, unknown>, caminho: string, valor: string | null): void {
  const partes = caminho.split('.')
  let atual: Record<string, unknown> = objeto
  for (let i = 0; i < partes.length - 1; i += 1) {
    const parte = partes[i]
    const proximo = atual[parte]
    if (proximo === undefined || proximo === null || typeof proximo !== 'object' || Array.isArray(proximo)) {
      atual[parte] = {}
    }
    atual = atual[parte] as Record<string, unknown>
  }
  atual[partes[partes.length - 1]] = valor ?? ''
}

function montarDadosJsonDocumento(doc: DocumentoSimulador): Record<string, unknown> {
  const secoes = obterSecoesConferenciaSimulador(doc)
  const dados: Record<string, unknown> = {}
  for (const secao of secoes) {
    for (const campo of secao.campos) {
      injetarCaminho(dados, campo.chave, campo.valor)
    }
  }
  return dados
}

function montarJsonDocumento(doc: DocumentoSimulador): Uint8Array {
  const payload = {
    fileType: resolverTipoDati(doc.tipo),
    data: montarDadosJsonDocumento(doc),
  }
  return enc.encode(JSON.stringify(payload, null, 2))
}

function montarTxtDocumento(doc: DocumentoSimulador): Uint8Array {
  const secoes = obterSecoesConferenciaSimulador(doc)
  const linhas: string[] = [resolverTipoDati(doc.tipo), '']
  for (const secao of secoes) {
    linhas.push(`== ${secao.titulo} ==`)
    for (const campo of secao.campos) {
      linhas.push(`${campo.rotulo}: ${campo.valor ?? '-'}`)
    }
    linhas.push('')
  }
  return enc.encode(linhas.join('\n'))
}

function escaparXml(valor: string): string {
  return valor
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function montarXlsxDocumento(doc: DocumentoSimulador): Uint8Array {
  const secoes = obterSecoesConferenciaSimulador(doc)
  const linhas = secoes.flatMap((secao) =>
    secao.campos.map((campo) => ({
      secao: secao.titulo,
      rotulo: campo.rotulo,
      caminho: campo.chave,
      valor: campo.valor ?? '',
    })),
  )

  const ths = ['Seção', 'Campo', 'Caminho', 'Valor']
    .map((coluna) => `<th>${escaparXml(coluna)}</th>`)
    .join('')
  const trs = linhas
    .map((linha) => {
      const tds = [linha.secao, linha.rotulo, linha.caminho, linha.valor]
        .map((valor) => `<td>${escaparXml(valor)}</td>`)
        .join('')
      return `<tr>${tds}</tr>`
    })
    .join('')

  const html = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel"><head><meta charset="UTF-8"></head><body><table border="1"><thead><tr>${ths}</tr></thead><tbody>${trs}</tbody></table></body></html>`
  return enc.encode(html)
}

function pdfEscape(valor: string): string {
  return valor.replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)')
}

function latin1Bytes(texto: string): Uint8Array {
  const saida = new Uint8Array(texto.length)
  for (let i = 0; i < texto.length; i += 1) {
    const code = texto.charCodeAt(i)
    saida[i] = code > 255 ? 63 : code
  }
  return saida
}

function montarLinhasPdf(secoes: SecaoConferenciaSimulador[], titulo: string): string[] {
  const linhas: string[] = [titulo, '']
  let secaoAtual = ''
  for (const secao of secoes) {
    if (secao.titulo !== secaoAtual) {
      secaoAtual = secao.titulo
      linhas.push(`== ${secao.titulo} ==`)
    }
    for (const campo of secao.campos) {
      linhas.push(`${campo.rotulo}: ${campo.valor ?? '-'}`)
    }
  }
  return linhas
}

function gerarPdfMinimo(titulo: string, linhasCorpo: string[]): Uint8Array {
  const linhasPorPagina = 48
  const paginas: string[][] = []
  for (let i = 0; i < linhasCorpo.length; i += linhasPorPagina) {
    paginas.push(linhasCorpo.slice(i, i + linhasPorPagina))
  }
  if (paginas.length === 0) paginas.push([titulo])

  const objetos: string[] = []
  objetos.push('<< /Type /Catalog /Pages 2 0 R >>')
  const numerosPagina = paginas.map((_, indice) => 5 + indice * 2)
  objetos.push(
    `<< /Type /Pages /Kids [${numerosPagina.map((n) => `${n} 0 R`).join(' ')}] /Count ${paginas.length} >>`,
  )
  objetos.push('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>')

  for (const linhas of paginas) {
    let stream = 'BT\n/F1 9 Tf\n12 TL\n40 800 Td\n'
    for (const linha of linhas) stream += `(${pdfEscape(linha)}) Tj T*\n`
    stream += 'ET'
    objetos.push(`<< /Length ${latin1Bytes(stream).length} >>\nstream\n${stream}\nendstream`)
    const numContents = objetos.length
    objetos.push(
      `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 3 0 R >> >> /Contents ${numContents} 0 R >>`,
    )
  }

  let pdf = '%PDF-1.4\n'
  const offsets: number[] = []
  objetos.forEach((corpo, indice) => {
    offsets[indice] = pdf.length
    pdf += `${indice + 1} 0 obj\n${corpo}\nendobj\n`
  })
  const xrefStart = pdf.length
  pdf += `xref\n0 ${objetos.length + 1}\n0000000000 65535 f \n`
  for (const off of offsets) pdf += `${String(off).padStart(10, '0')} 00000 n \n`
  pdf += `trailer\n<< /Size ${objetos.length + 1} /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF`
  return latin1Bytes(pdf)
}

function montarPdfDocumento(doc: DocumentoSimulador): Uint8Array {
  const secoes = obterSecoesConferenciaSimulador(doc)
  const titulo = resolverTipoDati(doc.tipo)
  return gerarPdfMinimo(titulo, montarLinhasPdf(secoes, titulo))
}

function montarPdfOriginal(arq: ArquivoDemoSimulador): Uint8Array {
  const stem = resolverStemPdf(arq.nome)
  const linhas = [
    `Documento original: ${arq.nome}`,
    'Smart Docs — demonstração landing Gravity',
    '',
    'Documentos identificados:',
    ...arq.documentosIdentificados.map(
      (doc, indice) => `${indice + 1}. ${resolverTipoDati(doc.tipo)} — ${doc.rotulo}`,
    ),
    '',
    'No produto real, este arquivo é o PDF enviado na leitura.',
  ]
  return gerarPdfMinimo(stem, linhas)
}

function montarPacoteArquivoOrigem(arq: ArquivoDemoSimulador): ArquivoZipSimulador[] {
  const stem = resolverStemPdf(arq.nome)
  const pasta = stem
  const nomeOriginal = sanitizarNomeArquivo(arq.nome)
  const saida: ArquivoZipSimulador[] = []

  arq.documentosIdentificados.forEach((doc, indice) => {
    const prefixo = `${indice + 1}-${resolverTipoDati(doc.tipo)}`
    const base = `${pasta}/${prefixo}`
    saida.push(
      { nome: `${base}.pdf`, dados: montarPdfDocumento(doc) },
      { nome: `${base}.json`, dados: montarJsonDocumento(doc) },
      { nome: `${base}.txt`, dados: montarTxtDocumento(doc) },
      { nome: `${base}.xlsx`, dados: montarXlsxDocumento(doc) },
    )
  })

  saida.push({ nome: `${pasta}/${nomeOriginal}`, dados: montarPdfOriginal(arq) })
  return saida
}

export function montarArquivosZipExportacaoSimulador(alvo: ArquivoDemoSimulador[]): ArquivoZipSimulador[] {
  return alvo.flatMap((arq) => montarPacoteArquivoOrigem(arq))
}

export function montarNomeZipExportacaoSimulador(
  alvo: ArquivoDemoSimulador[],
  rotuloLeitura: string,
): string {
  if (alvo.length === 1) {
    return `${sanitizarNomeArquivo(alvo[0].nome)}-docs.zip`
  }
  const base = sanitizarNomeArquivo(rotuloLeitura).replace(/\s+/g, ' ')
  return `${base}-docs.zip`
}

export function dispararDownloadBlobSimulador(blob: Blob, nomeArquivo: string): void {
  const url = URL.createObjectURL(blob)
  const ancora = document.createElement('a')
  ancora.href = url
  ancora.download = nomeArquivo
  ancora.rel = 'noopener'
  document.body.appendChild(ancora)
  ancora.click()
  ancora.remove()
  window.setTimeout(() => URL.revokeObjectURL(url), 2000)
}

