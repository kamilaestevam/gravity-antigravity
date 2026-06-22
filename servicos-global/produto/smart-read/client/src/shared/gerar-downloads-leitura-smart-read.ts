/**
 * gerar-downloads-leitura-smart-read.ts
 * Geração client-side dos downloads das leituras, sem dependências externas.
 *
 * Layout LARGO (igual à planilha modelo de importação): cada CAMPO é uma COLUNA
 * e cada DOCUMENTO lido vira uma LINHA. Documentos são agrupados por tipo
 * (BL, Packing, Invoice...), 1 arquivo por tipo.
 * - 1 formato + 1 grupo → baixa direto.
 * - vários arquivos → ZIP flat ("Tipo.formato").
 * Formatos: CSV, Excel (.xls), TXT (colunas) + JSON/XML (estruturados) e PDF (legível).
 */

import {
  extrairDadosArquivoLocal,
  extrairDocumentosArquivoLocal,
  type ArquivoLocalNovaLeitura,
} from './tipo-arquivo-nova-leitura-smart-read'
import { extrairSecoesConferenciaLeitura } from './extrair-secoes-conferencia-leitura-smart-read'

export type FormatoDownloadLeitura = 'json' | 'csv' | 'txt' | 'xml' | 'xls' | 'pdf'

export const FORMATOS_DOWNLOAD_LEITURA: { id: FormatoDownloadLeitura; rotulo: string }[] = [
  { id: 'json', rotulo: 'JSON' },
  { id: 'xls', rotulo: 'Excel' },
  { id: 'pdf', rotulo: 'PDF' },
  { id: 'csv', rotulo: 'CSV' },
  { id: 'txt', rotulo: 'TXT' },
  { id: 'xml', rotulo: 'XML' },
]

export const TODOS_FORMATOS_DOWNLOAD: FormatoDownloadLeitura[] = FORMATOS_DOWNLOAD_LEITURA.map(
  (f) => f.id,
)

const MIME_POR_FORMATO: Record<FormatoDownloadLeitura, string> = {
  json: 'application/json',
  csv: 'text/csv;charset=utf-8',
  txt: 'text/plain;charset=utf-8',
  xml: 'application/xml;charset=utf-8',
  xls: 'application/vnd.ms-excel',
  pdf: 'application/pdf',
}

type LinhaDoc = { secao: string; campo: string; caminho: string; valor: string }
type DocumentoExport = { arquivo: string; linhas: LinhaDoc[]; dados: Record<string, unknown> }
type GrupoExport = { nome: string; tipo: string; documentos: DocumentoExport[] }
type Coluna = { caminho: string; header: string }

const enc = new TextEncoder()

// ── Coleta + agrupamento por tipo de documento ──────────────────────────────

function sanitizarNome(nome: string): string {
  return nome.replace(/[\\/:*?"<>|]+/g, '-').replace(/\s+/g, ' ').trim() || 'documento'
}

function agruparPorTipo(arquivos: ArquivoLocalNovaLeitura[]): GrupoExport[] {
  const grupos = new Map<string, GrupoExport>()

  for (const item of arquivos) {
    for (const doc of extrairDocumentosArquivoLocal(item)) {
      const dados = extrairDadosArquivoLocal(item, doc.indice) ?? {}
      const secoes = extrairSecoesConferenciaLeitura(dados)
      const linhas: LinhaDoc[] = secoes.flatMap((s) =>
        s.campos.map((c) => ({
          secao: s.titulo,
          campo: c.rotulo,
          caminho: c.chave,
          valor: c.valor ?? '',
        })),
      )

      const tipo = doc.tipo_documento
      const chave = tipo.toLowerCase()
      const grupo = grupos.get(chave) ?? { nome: sanitizarNome(tipo), tipo, documentos: [] }
      grupo.documentos.push({ arquivo: item.arquivo.name, linhas, dados })
      grupos.set(chave, grupo)
    }
  }

  return Array.from(grupos.values())
}

/** Colunas = união dos campos dos documentos do grupo (ordem de aparição). */
function colunasDoGrupo(grupo: GrupoExport): Coluna[] {
  const ordem: string[] = []
  const labelPorCaminho = new Map<string, string>()
  const secaoPorCaminho = new Map<string, string>()

  for (const doc of grupo.documentos) {
    for (const l of doc.linhas) {
      if (!labelPorCaminho.has(l.caminho)) {
        ordem.push(l.caminho)
        labelPorCaminho.set(l.caminho, l.campo)
        secaoPorCaminho.set(l.caminho, l.secao)
      }
    }
  }

  const contagemLabel = new Map<string, number>()
  for (const caminho of ordem) {
    const label = labelPorCaminho.get(caminho) ?? caminho
    contagemLabel.set(label, (contagemLabel.get(label) ?? 0) + 1)
  }

  return ordem.map((caminho) => {
    const label = labelPorCaminho.get(caminho) ?? caminho
    const header =
      (contagemLabel.get(label) ?? 0) > 1 ? `${label} (${secaoPorCaminho.get(caminho)})` : label
    return { caminho, header }
  })
}

function valorPorCaminhoDoc(doc: DocumentoExport): Map<string, string> {
  const mapa = new Map<string, string>()
  for (const l of doc.linhas) mapa.set(l.caminho, l.valor)
  return mapa
}

// ── Escapes ─────────────────────────────────────────────────────────────────

function escaparXml(valor: string): string {
  return valor
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function escaparCsv(valor: string): string {
  return /[";\n]/.test(valor) ? `"${valor.replace(/"/g, '""')}"` : valor
}

// ── Geradores por grupo (layout largo) ──────────────────────────────────────

function gerarCsvGrupo(grupo: GrupoExport): string {
  const colunas = colunasDoGrupo(grupo)
  const cabecalho = colunas.map((c) => escaparCsv(c.header)).join(';')
  const linhas = grupo.documentos.map((doc) => {
    const mapa = valorPorCaminhoDoc(doc)
    return colunas.map((c) => escaparCsv(mapa.get(c.caminho) ?? '')).join(';')
  })
  return '\ufeff' + [cabecalho, ...linhas].join('\n')
}

function gerarTxtGrupo(grupo: GrupoExport): string {
  const colunas = colunasDoGrupo(grupo)
  const cabecalho = colunas.map((c) => c.header).join('\t')
  const linhas = grupo.documentos.map((doc) => {
    const mapa = valorPorCaminhoDoc(doc)
    return colunas.map((c) => (mapa.get(c.caminho) ?? '').replace(/\s+/g, ' ')).join('\t')
  })
  return [cabecalho, ...linhas].join('\n')
}

function gerarXlsGrupo(grupo: GrupoExport): string {
  const colunas = colunasDoGrupo(grupo)
  const ths = colunas.map((c) => `<th>${escaparXml(c.header)}</th>`).join('')
  const trs = grupo.documentos
    .map((doc) => {
      const mapa = valorPorCaminhoDoc(doc)
      const tds = colunas.map((c) => `<td>${escaparXml(mapa.get(c.caminho) ?? '')}</td>`).join('')
      return `<tr>${tds}</tr>`
    })
    .join('')
  return `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel"><head><meta charset="UTF-8"><style>th{background:#1e293b;color:#fff;font-weight:bold;}</style></head><body><table border="1"><thead><tr>${ths}</tr></thead><tbody>${trs}</tbody></table></body></html>`
}

function gerarJsonGrupo(grupo: GrupoExport): string {
  return JSON.stringify(
    {
      tipo_documento: grupo.tipo,
      documentos: grupo.documentos.map((d) => ({ arquivo: d.arquivo, dados: d.dados })),
    },
    null,
    2,
  )
}

function gerarXmlGrupo(grupo: GrupoExport): string {
  const blocos = ['<?xml version="1.0" encoding="UTF-8"?>', `<documentos tipo="${escaparXml(grupo.tipo)}">`]
  for (const doc of grupo.documentos) {
    blocos.push(`  <documento arquivo="${escaparXml(doc.arquivo)}">`)
    for (const l of doc.linhas) {
      blocos.push(
        `    <campo caminho="${escaparXml(l.caminho)}" rotulo="${escaparXml(l.campo)}">${escaparXml(
          l.valor,
        )}</campo>`,
      )
    }
    blocos.push('  </documento>')
  }
  blocos.push('</documentos>')
  return blocos.join('\n')
}

// ── PDF mínimo (texto legível, Helvetica/WinAnsi, paginado) ─────────────────

function pdfEscape(s: string): string {
  return s.replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)')
}

function latin1Bytes(s: string): Uint8Array {
  const out = new Uint8Array(s.length)
  for (let i = 0; i < s.length; i++) {
    const code = s.charCodeAt(i)
    out[i] = code > 255 ? 63 : code
  }
  return out
}

function linhasTextoGrupo(grupo: GrupoExport): string[] {
  const out: string[] = []
  grupo.documentos.forEach((doc, i) => {
    if (grupo.documentos.length > 1) out.push('', `--- Documento ${i + 1} (${doc.arquivo}) ---`)
    let secao = ''
    for (const l of doc.linhas) {
      if (l.secao !== secao) {
        secao = l.secao
        out.push('', `== ${l.secao} ==`)
      }
      out.push(`${l.campo}: ${l.valor || '-'}`)
    }
  })
  return out
}

function gerarPdfGrupo(grupo: GrupoExport): Uint8Array {
  const linhasPorPagina = 50
  const todas = [grupo.tipo, ''].concat(linhasTextoGrupo(grupo))
  const paginas: string[][] = []
  for (let i = 0; i < todas.length; i += linhasPorPagina) {
    paginas.push(todas.slice(i, i + linhasPorPagina))
  }
  if (paginas.length === 0) paginas.push([grupo.tipo])

  const objetos: string[] = []
  objetos.push('<< /Type /Catalog /Pages 2 0 R >>')
  const numerosPagina = paginas.map((_, i) => 5 + i * 2)
  objetos.push(
    `<< /Type /Pages /Kids [${numerosPagina.map((n) => `${n} 0 R`).join(' ')}] /Count ${paginas.length} >>`,
  )
  objetos.push('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>')

  for (const linhas of paginas) {
    let stream = 'BT\n/F1 10 Tf\n14 TL\n50 800 Td\n'
    for (const l of linhas) stream += `(${pdfEscape(l)}) Tj T*\n`
    stream += 'ET'
    objetos.push(`<< /Length ${latin1Bytes(stream).length} >>\nstream\n${stream}\nendstream`)
    const numContents = objetos.length
    objetos.push(
      `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 3 0 R >> >> /Contents ${numContents} 0 R >>`,
    )
  }

  let pdf = '%PDF-1.4\n'
  const offsets: number[] = []
  objetos.forEach((corpo, i) => {
    offsets[i] = pdf.length
    pdf += `${i + 1} 0 obj\n${corpo}\nendobj\n`
  })
  const xrefStart = pdf.length
  pdf += `xref\n0 ${objetos.length + 1}\n0000000000 65535 f \n`
  for (const off of offsets) pdf += `${String(off).padStart(10, '0')} 00000 n \n`
  pdf += `trailer\n<< /Size ${objetos.length + 1} /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF`
  return latin1Bytes(pdf)
}

function arquivoGrupoFormato(
  grupo: GrupoExport,
  formato: FormatoDownloadLeitura,
): { nome: string; dados: Uint8Array } {
  switch (formato) {
    case 'json':
      return { nome: `${grupo.nome}.json`, dados: enc.encode(gerarJsonGrupo(grupo)) }
    case 'csv':
      return { nome: `${grupo.nome}.csv`, dados: enc.encode(gerarCsvGrupo(grupo)) }
    case 'txt':
      return { nome: `${grupo.nome}.txt`, dados: enc.encode(gerarTxtGrupo(grupo)) }
    case 'xml':
      return { nome: `${grupo.nome}.xml`, dados: enc.encode(gerarXmlGrupo(grupo)) }
    case 'xls':
      return { nome: `${grupo.nome}.xls`, dados: enc.encode(gerarXlsGrupo(grupo)) }
    case 'pdf':
      return { nome: `${grupo.nome}.pdf`, dados: gerarPdfGrupo(grupo) }
    default:
      return { nome: grupo.nome, dados: enc.encode('') }
  }
}

// ── ZIP "stored" (sem compressão, sem dependência) ──────────────────────────

const TABELA_CRC = (() => {
  const t = new Uint32Array(256)
  for (let n = 0; n < 256; n++) {
    let c = n
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
    t[n] = c >>> 0
  }
  return t
})()

function crc32(bytes: Uint8Array): number {
  let c = 0xffffffff
  for (let i = 0; i < bytes.length; i++) c = TABELA_CRC[(c ^ bytes[i]) & 0xff] ^ (c >>> 8)
  return (c ^ 0xffffffff) >>> 0
}

function gerarZip(arquivos: { nome: string; dados: Uint8Array }[]): Uint8Array {
  const locais: Uint8Array[] = []
  const centrais: Uint8Array[] = []
  let offset = 0

  for (const a of arquivos) {
    const nomeBytes = enc.encode(a.nome)
    const crc = crc32(a.dados)
    const tam = a.dados.length

    const lh = new DataView(new ArrayBuffer(30))
    lh.setUint32(0, 0x04034b50, true)
    lh.setUint16(4, 20, true)
    lh.setUint16(6, 0x0800, true)
    lh.setUint16(8, 0, true)
    lh.setUint16(10, 0, true)
    lh.setUint16(12, 0, true)
    lh.setUint32(14, crc, true)
    lh.setUint32(18, tam, true)
    lh.setUint32(22, tam, true)
    lh.setUint16(26, nomeBytes.length, true)
    lh.setUint16(28, 0, true)
    locais.push(new Uint8Array(lh.buffer), nomeBytes, a.dados)

    const ch = new DataView(new ArrayBuffer(46))
    ch.setUint32(0, 0x02014b50, true)
    ch.setUint16(4, 20, true)
    ch.setUint16(6, 20, true)
    ch.setUint16(8, 0x0800, true)
    ch.setUint16(10, 0, true)
    ch.setUint16(12, 0, true)
    ch.setUint16(14, 0, true)
    ch.setUint32(16, crc, true)
    ch.setUint32(20, tam, true)
    ch.setUint32(24, tam, true)
    ch.setUint16(28, nomeBytes.length, true)
    ch.setUint16(30, 0, true)
    ch.setUint16(32, 0, true)
    ch.setUint16(34, 0, true)
    ch.setUint16(36, 0, true)
    ch.setUint32(38, 0, true)
    ch.setUint32(42, offset, true)
    centrais.push(new Uint8Array(ch.buffer), nomeBytes)

    offset += 30 + nomeBytes.length + tam
  }

  const inicioCentral = offset
  const tamanhoCentral = centrais.reduce((s, p) => s + p.length, 0)

  const eocd = new DataView(new ArrayBuffer(22))
  eocd.setUint32(0, 0x06054b50, true)
  eocd.setUint16(4, 0, true)
  eocd.setUint16(6, 0, true)
  eocd.setUint16(8, arquivos.length, true)
  eocd.setUint16(10, arquivos.length, true)
  eocd.setUint32(12, tamanhoCentral, true)
  eocd.setUint32(16, inicioCentral, true)
  eocd.setUint16(20, 0, true)

  const partes = [...locais, ...centrais, new Uint8Array(eocd.buffer)]
  const total = partes.reduce((s, p) => s + p.length, 0)
  const saida = new Uint8Array(total)
  let p = 0
  for (const parte of partes) {
    saida.set(parte, p)
    p += parte.length
  }
  return saida
}

// ── Download ────────────────────────────────────────────────────────────────

function baixarBlob(conteudo: BlobPart, mime: string, nomeArquivo: string) {
  const blob = new Blob([conteudo], { type: mime })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = nomeArquivo
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}

function nomeBaseLeitura(arquivos: ArquivoLocalNovaLeitura[]): string {
  const nomeLeitura = arquivos[0]?.leitura?.nome_leitura
  if (nomeLeitura) return sanitizarNome(nomeLeitura)
  if (arquivos.length === 1) return sanitizarNome(arquivos[0].arquivo.name.replace(/\.[^.]+$/, ''))
  return `leituras-${arquivos.length}-arquivos`
}

export function baixarLeituras(
  arquivos: ArquivoLocalNovaLeitura[],
  formatos: FormatoDownloadLeitura[],
): void {
  if (arquivos.length === 0 || formatos.length === 0) return

  const grupos = agruparPorTipo(arquivos)
  if (grupos.length === 0) return

  const gerados: { nome: string; dados: Uint8Array; formato: FormatoDownloadLeitura }[] = []
  for (const grupo of grupos) {
    for (const formato of formatos) {
      const { nome, dados } = arquivoGrupoFormato(grupo, formato)
      gerados.push({ nome, dados, formato })
    }
  }

  if (gerados.length === 1) {
    const unico = gerados[0]
    baixarBlob(unico.dados, MIME_POR_FORMATO[unico.formato], unico.nome)
    return
  }

  const zip = gerarZip(gerados.map((g) => ({ nome: g.nome, dados: g.dados })))
  baixarBlob(zip, 'application/zip', `${nomeBaseLeitura(arquivos)}.zip`)
}
