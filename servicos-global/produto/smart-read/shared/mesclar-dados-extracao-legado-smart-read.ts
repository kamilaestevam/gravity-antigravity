/**
 * mesclar-dados-extracao-legado-smart-read.ts
 * Preenche campos vazios do finalProcessingResult com valores do processingResult (IA).
 * O legado pode publicar final com template antes da IA terminar de popular itens (NCM, fabricante…).
 */

import { textoExtracaoEhPlaceholder } from './texto-analise-riscos-leitura-smart-read.js'

const CHAVES_METADADOS_EXTRACAO = new Set([
  'accuracy',
  'averageaccuracy',
  'score',
  'confidence',
  'origem',
  'sections',
  'groups',
  'categories',
  'fieldgroups',
  'fields',
  'campos',
])

export function valorCampoExtracaoLegadoPreenchido(valor: unknown): boolean {
  if (valor === null || valor === undefined || valor === '') return false
  if (typeof valor === 'string' && textoExtracaoEhPlaceholder(valor)) return false
  if (Array.isArray(valor)) return valor.length > 0
  if (typeof valor === 'object') return Object.keys(valor as Record<string, unknown>).length > 0
  return true
}

function mesclarArrayItensExtracao(preferido: unknown[], fallback: unknown[]): unknown[] {
  const tamanho = Math.max(preferido.length, fallback.length)
  const saida: unknown[] = []

  for (let indice = 0; indice < tamanho; indice++) {
    const brutoPreferido = preferido[indice]
    const brutoFallback = fallback[indice]

    if (
      brutoPreferido !== null &&
      typeof brutoPreferido === 'object' &&
      !Array.isArray(brutoPreferido) &&
      brutoFallback !== null &&
      typeof brutoFallback === 'object' &&
      !Array.isArray(brutoFallback)
    ) {
      saida.push(
        mesclarDadosExtracaoLegado(
          brutoPreferido as Record<string, unknown>,
          brutoFallback as Record<string, unknown>,
        ),
      )
      continue
    }

    if (valorCampoExtracaoLegadoPreenchido(brutoPreferido)) {
      saida.push(brutoPreferido)
      continue
    }

    saida.push(brutoFallback ?? brutoPreferido)
  }

  return saida
}

export function mesclarDadosExtracaoLegado(
  preferido: Record<string, unknown>,
  fallback: Record<string, unknown>,
): Record<string, unknown> {
  const saida: Record<string, unknown> = { ...preferido }

  for (const [chave, valorFallback] of Object.entries(fallback)) {
    if (CHAVES_METADADOS_EXTRACAO.has(chave.toLowerCase())) continue

    const valorPreferido = saida[chave]

    if (chave === 'items' && Array.isArray(valorPreferido) && Array.isArray(valorFallback)) {
      saida.items = mesclarArrayItensExtracao(valorPreferido, valorFallback)
      continue
    }

    if (
      valorPreferido !== null &&
      typeof valorPreferido === 'object' &&
      !Array.isArray(valorPreferido) &&
      valorFallback !== null &&
      typeof valorFallback === 'object' &&
      !Array.isArray(valorFallback)
    ) {
      saida[chave] = mesclarDadosExtracaoLegado(
        valorPreferido as Record<string, unknown>,
        valorFallback as Record<string, unknown>,
      )
      continue
    }

    if (
      !valorCampoExtracaoLegadoPreenchido(valorPreferido) &&
      valorCampoExtracaoLegadoPreenchido(valorFallback)
    ) {
      saida[chave] = valorFallback
    }
  }

  return saida
}

const CHAVES_CODIGO_FISCAL_ITEM = ['ncm', 'NCM', 'codigo_ncm', 'codigoNcm'] as const
const CHAVES_HS_ITEM = ['hsCode', 'hs_code', 'HSCode', 'hs'] as const

function primeiroCodigoPreenchido(
  linha: Record<string, unknown>,
  chaves: readonly string[],
): string | null {
  for (const chave of chaves) {
    const bruto = linha[chave]
    if (typeof bruto === 'string' && valorCampoExtracaoLegadoPreenchido(bruto)) return bruto
  }
  return null
}

/** Paridade DATI: NCM vazio mas hsCode preenchido → exibir como NCM na conferência. */
export function normalizarLinhaItemInvoiceConferencia(
  linha: Record<string, unknown>,
): Record<string, unknown> {
  const saida = { ...linha }
  const ncm = primeiroCodigoPreenchido(saida, CHAVES_CODIGO_FISCAL_ITEM)
  const hs = primeiroCodigoPreenchido(saida, CHAVES_HS_ITEM)

  if (!ncm && hs) {
    saida.ncm = hs
  }

  for (const chave of CHAVES_CODIGO_FISCAL_ITEM) {
    const valor = saida[chave]
    if (typeof valor === 'string' && textoExtracaoEhPlaceholder(valor)) {
      delete saida[chave]
    }
  }

  return saida
}

export function prepararDadosConferenciaLeitura(
  dados: Record<string, unknown> | null | undefined,
): Record<string, unknown> {
  if (!dados || typeof dados !== 'object') return {}

  const saida = { ...dados }
  if (Array.isArray(saida.items)) {
    saida.items = saida.items.map((bruto) => {
      if (bruto !== null && typeof bruto === 'object' && !Array.isArray(bruto)) {
        return normalizarLinhaItemInvoiceConferencia(bruto as Record<string, unknown>)
      }
      return bruto
    })
  }

  return saida
}
