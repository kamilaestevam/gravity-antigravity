/**
 * xmlFormatter.ts — Gera XML de exportacao
 *
 * Estrutura basica estilo NF-e com escape de caracteres especiais.
 * Suporta mapeamento customizado de campos via layout.
 */

import type { ExportRow, LayoutConfig, LayoutCampo, FormatOptions } from './index.js'
import { aplicarTransformacao } from './index.js'

/**
 * Escapa caracteres especiais para XML valido
 */
function escaparXml(valor: string): string {
  return valor
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

/**
 * Gera nome de tag XML valido a partir de um label
 * Remove espacos, acentos e caracteres invalidos
 */
function sanitizarTagXml(nome: string): string {
  return nome
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')  // remove acentos
    .replace(/[^a-zA-Z0-9_.-]/g, '_') // substitui invalidos
    .replace(/^[^a-zA-Z_]/, '_')      // tag deve comecar com letra ou _
    .replace(/_+/g, '_')              // remove underscores duplicados
}

/**
 * Resolve valor para XML (sempre string, formatado)
 */
function resolverValorXml(
  row: ExportRow,
  campo: LayoutCampo,
  options: FormatOptions
): string {
  const valorBruto = row[campo.campo_origem]

  if (valorBruto === null || valorBruto === undefined) {
    return campo.valor_padrao ?? ''
  }

  if (typeof valorBruto === 'number') {
    const casas = campo.tipo_dado === 'NUMBER'
      ? (options.casas_decimais_valor ?? 2)
      : 2
    return valorBruto.toFixed(casas)
  }

  const valorStr = String(valorBruto)
  return aplicarTransformacao(valorStr, campo.transformacao)
}

/**
 * Gera XML com layout customizado
 */
function gerarXmlComLayout(
  rows: ExportRow[],
  layout: LayoutConfig,
  options: FormatOptions
): string {
  const camposOrdenados = [...layout.campos].sort((a, b) => a.ordem - b.ordem)
  const linhasXml: string[] = []

  linhasXml.push('<?xml version="1.0" encoding="' + escaparXml(layout.codificacao || 'UTF-8') + '"?>')
  linhasXml.push('<NfImportacao>')

  if (layout.has_header && layout.header_template) {
    linhasXml.push('  <Header>')
    linhasXml.push(`    <Info>${escaparXml(layout.header_template)}</Info>`)
    linhasXml.push('  </Header>')
  }

  linhasXml.push('  <Itens>')

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i]
    linhasXml.push(`    <Item seq="${i + 1}">`)

    for (const campo of camposOrdenados) {
      const tag = sanitizarTagXml(campo.label || campo.campo_origem)
      const valor = resolverValorXml(row, campo, options)
      linhasXml.push(`      <${tag}>${escaparXml(valor)}</${tag}>`)
    }

    linhasXml.push('    </Item>')
  }

  linhasXml.push('  </Itens>')

  if (layout.has_footer && layout.footer_template) {
    linhasXml.push('  <Footer>')
    linhasXml.push(`    <TotalItens>${rows.length}</TotalItens>`)
    linhasXml.push(`    <Info>${escaparXml(layout.footer_template)}</Info>`)
    linhasXml.push('  </Footer>')
  }

  linhasXml.push('</NfImportacao>')

  return linhasXml.join('\n')
}

/**
 * Gera XML sem layout (todas as colunas, tags = nomes dos campos)
 */
function gerarXmlSemLayout(rows: ExportRow[], options: FormatOptions): string {
  const linhasXml: string[] = []
  const codificacao = options.codificacao ?? 'UTF-8'

  linhasXml.push(`<?xml version="1.0" encoding="${escaparXml(codificacao)}"?>`)
  linhasXml.push('<NfImportacao>')
  linhasXml.push('  <Itens>')

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i]
    linhasXml.push(`    <Item seq="${i + 1}">`)

    for (const [chave, valor] of Object.entries(row)) {
      const tag = sanitizarTagXml(chave)
      if (valor === null || valor === undefined) {
        linhasXml.push(`      <${tag}/>`)
      } else {
        linhasXml.push(`      <${tag}>${escaparXml(String(valor))}</${tag}>`)
      }
    }

    linhasXml.push('    </Item>')
  }

  linhasXml.push('  </Itens>')
  linhasXml.push('</NfImportacao>')

  return linhasXml.join('\n')
}

/**
 * Gera XML de exportacao
 */
export function formatXml(
  rows: ExportRow[],
  layout: LayoutConfig | null,
  options: FormatOptions
): string {
  if (rows.length === 0) {
    const cod = layout?.codificacao ?? options.codificacao ?? 'UTF-8'
    return `<?xml version="1.0" encoding="${escaparXml(cod)}"?>\n<NfImportacao>\n  <Itens/>\n</NfImportacao>`
  }

  if (layout && layout.campos.length > 0) {
    return gerarXmlComLayout(rows, layout, options)
  }

  return gerarXmlSemLayout(rows, options)
}
