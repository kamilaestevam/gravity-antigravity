/**
 * jsonFormatter.ts — Gera saida JSON a partir de linhas achatadas
 *
 * Suporta dois modos:
 * - Flat: array de objetos com campos do layout
 * - Nested: agrupa por NF (quando layout tem campos de cabecalho e itens)
 *
 * Numeros sao mantidos como numeros (nao strings).
 */

import type { ExportRow, LayoutConfig, LayoutCampo, FormatOptions } from './index.js'
import { aplicarTransformacao } from './index.js'

/**
 * Resolve o valor tipado de uma celula para JSON (preserva tipos nativos)
 */
function resolverValorJson(
  row: ExportRow,
  campo: LayoutCampo,
  options: FormatOptions
): string | number | boolean | null {
  const valorBruto = row[campo.campo_origem]

  if (valorBruto === null || valorBruto === undefined) {
    if (campo.valor_padrao !== undefined && campo.valor_padrao !== null) {
      if (campo.tipo_dado === 'NUMBER') {
        return Number(campo.valor_padrao) || 0
      }
      if (campo.tipo_dado === 'BOOLEAN') {
        return campo.valor_padrao === 'true'
      }
      return campo.valor_padrao
    }
    return null
  }

  if (campo.tipo_dado === 'NUMBER' && typeof valorBruto === 'number') {
    const casas = options.casas_decimais_valor ?? 2
    return Math.round((valorBruto + Number.EPSILON) * Math.pow(10, casas)) / Math.pow(10, casas)
  }

  if (campo.tipo_dado === 'BOOLEAN') {
    if (typeof valorBruto === 'number') return valorBruto !== 0
    if (typeof valorBruto === 'string') return valorBruto === 'true' || valorBruto === '1'
    return Boolean(valorBruto)
  }

  if (typeof valorBruto === 'string') {
    return aplicarTransformacao(valorBruto, campo.transformacao)
  }

  return valorBruto
}

/**
 * Gera JSON formatado a partir de linhas e layout
 */
export function formatJson(
  rows: ExportRow[],
  layout: LayoutConfig | null,
  options: FormatOptions
): string {
  if (rows.length === 0) {
    return JSON.stringify([], null, 2)
  }

  // Sem layout: exporta todas as colunas como estao
  if (!layout || layout.campos.length === 0) {
    return JSON.stringify(rows, null, 2)
  }

  const camposOrdenados = [...layout.campos].sort((a, b) => a.ordem - b.ordem)

  const resultado = rows.map((row) => {
    const obj: Record<string, string | number | boolean | null> = {}

    for (const campo of camposOrdenados) {
      const chave = campo.label || campo.campo_origem
      obj[chave] = resolverValorJson(row, campo, options)
    }

    return obj
  })

  return JSON.stringify(resultado, null, 2)
}
