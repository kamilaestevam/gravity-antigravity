/**
 * txtFixedFormatter.ts — Gera TXT com posicao fixa (SAP IDOC, TOTVS)
 *
 * Cada campo tem posicao_inicio + tamanho_fixo definidos no layout.
 * Alinhamento: LEFT (pad right), RIGHT (pad left), CENTER
 * Preenchimento: espaco (padrao) ou "0" (zero-fill para numeros)
 * Codificacao: UTF-8 ou ISO-8859-1
 */

import type { ExportRow, LayoutConfig, LayoutCampo, FormatOptions } from './index.js'
import { resolverValorCelula } from './index.js'

/**
 * Preenche um valor ate o tamanho fixo com alinhamento e caractere de padding
 */
function preencherCampo(
  valor: string,
  tamanho: number,
  alinhamento: string,
  preenchimento: string
): string {
  const padChar = preenchimento || ' '

  // Trunca se exceder tamanho
  const valorTruncado = valor.slice(0, tamanho)
  const diferenca = tamanho - valorTruncado.length

  if (diferenca <= 0) {
    return valorTruncado
  }

  switch (alinhamento) {
    case 'RIGHT':
      return padChar.repeat(diferenca) + valorTruncado
    case 'CENTER': {
      const padEsq = Math.floor(diferenca / 2)
      const padDir = diferenca - padEsq
      return padChar.repeat(padEsq) + valorTruncado + padChar.repeat(padDir)
    }
    case 'LEFT':
    default:
      return valorTruncado + padChar.repeat(diferenca)
  }
}

/**
 * Monta uma linha de posicao fixa usando campos do layout.
 * Campos sem posicao_inicio sao concatenados na ordem.
 * Campos com posicao_inicio sao posicionados absolutamente.
 */
function montarLinhaFixa(
  row: ExportRow,
  campos: LayoutCampo[],
  options: FormatOptions
): string {
  // Determinar se usamos posicionamento absoluto ou sequencial
  const usaPosicaoAbsoluta = campos.some((c) =>
    c.posicao_inicio !== undefined && c.posicao_inicio !== null
  )

  if (usaPosicaoAbsoluta) {
    return montarLinhaAbsoluta(row, campos, options)
  }

  return montarLinhaSequencial(row, campos, options)
}

/**
 * Campos posicionados absolutamente: posicao_inicio define onde cada campo comeca
 */
function montarLinhaAbsoluta(
  row: ExportRow,
  campos: LayoutCampo[],
  options: FormatOptions
): string {
  // Calcular tamanho total da linha
  let tamanhoTotal = 0
  for (const campo of campos) {
    const inicio = campo.posicao_inicio ?? 0
    const tamanho = campo.tamanho_fixo ?? 10
    const fim = inicio + tamanho
    if (fim > tamanhoTotal) {
      tamanhoTotal = fim
    }
  }

  // Inicializa linha com espacos
  const linha = new Array(tamanhoTotal).fill(' ')

  // Posiciona cada campo
  for (const campo of campos) {
    const inicio = campo.posicao_inicio ?? 0
    const tamanho = campo.tamanho_fixo ?? 10
    const valorStr = resolverValorCelula(row, campo, options)
    const valorPreenchido = preencherCampo(
      valorStr,
      tamanho,
      campo.alinhamento,
      campo.preenchimento ?? ' '
    )

    for (let i = 0; i < valorPreenchido.length && (inicio + i) < tamanhoTotal; i++) {
      linha[inicio + i] = valorPreenchido[i]
    }
  }

  return linha.join('')
}

/**
 * Campos sequenciais: concatenados na ordem, cada um com tamanho_fixo
 */
function montarLinhaSequencial(
  row: ExportRow,
  campos: LayoutCampo[],
  options: FormatOptions
): string {
  const partes: string[] = []

  for (const campo of campos) {
    const tamanho = campo.tamanho_fixo ?? 10
    const valorStr = resolverValorCelula(row, campo, options)
    partes.push(
      preencherCampo(
        valorStr,
        tamanho,
        campo.alinhamento,
        campo.preenchimento ?? ' '
      )
    )
  }

  return partes.join('')
}

/**
 * Substitui placeholders em template de header/footer para TXT fixo
 */
function resolverTemplate(template: string, totalLinhas: number): string {
  const agora = new Date()
  return template
    .replace(/\{data\}/g, agora.toISOString().slice(0, 10))
    .replace(/\{hora\}/g, agora.toISOString().slice(11, 19))
    .replace(/\{total_linhas\}/g, String(totalLinhas))
}

/**
 * Gera TXT com posicao fixa
 */
export function formatTxtFixed(
  rows: ExportRow[],
  layout: LayoutConfig | null,
  options: FormatOptions
): string {
  if (rows.length === 0) {
    return ''
  }

  if (!layout || layout.campos.length === 0) {
    // Sem layout: fallback para CSV com pipe
    const chaves = Object.keys(rows[0])
    const linhas: string[] = []
    for (const row of rows) {
      const vals = chaves.map((k) => {
        const v = row[k]
        return v === null || v === undefined ? '' : String(v)
      })
      linhas.push(vals.join('|'))
    }
    return linhas.join('\r\n')
  }

  const camposOrdenados = [...layout.campos].sort((a, b) => a.ordem - b.ordem)
  const linhas: string[] = []

  // Header template
  if (layout.has_header && layout.header_template) {
    linhas.push(resolverTemplate(layout.header_template, rows.length))
  }

  // Linhas de dados
  for (const row of rows) {
    linhas.push(montarLinhaFixa(row, camposOrdenados, options))
  }

  // Footer template
  if (layout.has_footer && layout.footer_template) {
    linhas.push(resolverTemplate(layout.footer_template, rows.length))
  }

  return linhas.join('\r\n')
}
