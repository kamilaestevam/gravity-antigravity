/**
 * xmlParser.ts — Parser de XML DUIMP para lancamentos financeiros
 *
 * Extrai impostos do XML da Declaracao Unica de Importacao (DUIMP)
 * e converte para o formato de lancamento financeiro.
 */

import { parseString } from 'xml2js'
import { AppError } from '../lib/AppError.js'

export interface ImpostoExtraido {
  categoria_codigo: string
  categoria_nome: string
  moeda: string
  valor: number
  taxa_cambio: number
  valor_brl: number
  icms_origem_portal: boolean
}

// Mapeamento de campos XML para categorias do catalogo
const MAPA_IMPOSTOS: Record<string, { codigo: string; nome: string }> = {
  'II': { codigo: '001', nome: 'Imposto: I.I - Imposto de Importacao' },
  'IPI': { codigo: '002', nome: 'Imposto: IPI' },
  'PIS': { codigo: '003', nome: 'Imposto: PIS' },
  'COFINS': { codigo: '004', nome: 'Imposto: COFINS' },
  'ICMS': { codigo: '005', nome: 'Imposto: ICMS' },
  'AFRMM': { codigo: '010', nome: 'Marinha Mercante (AFRMM)' },
  'TAXA_SISCOMEX': { codigo: '011', nome: 'Taxa Siscomex' },
}

function parseXmlAsync(xmlString: string): Promise<Record<string, unknown>> {
  return new Promise((resolve, reject) => {
    parseString(xmlString, {
      explicitArray: false,
      mergeAttrs: true,
      explicitRoot: false,
      xmlns: false,
      // OWASP A04: DTD desabilitado para prevenir XXE
    }, (err, result) => {
      if (err) reject(err)
      else resolve(result as Record<string, unknown>)
    })
  })
}

function extractValue(obj: unknown, path: string[]): unknown {
  let current: unknown = obj
  for (const key of path) {
    if (current == null || typeof current !== 'object') return null
    current = (current as Record<string, unknown>)[key]
  }
  return current
}

function parseDecimal(value: unknown): number {
  if (value == null) return 0
  const str = String(value).replace(',', '.')
  const n = parseFloat(str)
  return isNaN(n) ? 0 : n
}

/**
 * Extrai impostos de um XML DUIMP
 * Suporta formato simplificado compativel com exportacoes do SISCOMEX
 */
export async function extrairImpostosXML(xmlString: string): Promise<ImpostoExtraido[]> {
  if (!xmlString || xmlString.trim().length === 0) {
    throw new AppError('XML vazio ou invalido', 400, 'INVALID_XML')
  }

  let parsed: Record<string, unknown>
  try {
    parsed = await parseXmlAsync(xmlString)
  } catch {
    throw new AppError('XML malformado. Verifique o arquivo DUIMP.', 400, 'INVALID_XML')
  }

  const impostos: ImpostoExtraido[] = []

  // Tenta extrair estrutura DUIMP padrao
  const duimp = extractValue(parsed, ['DUIMP']) ??
    extractValue(parsed, ['duimp']) ??
    extractValue(parsed, ['declaracao'])

  if (!duimp) {
    // Formato nao reconhecido — retorna lista vazia para o usuario revisar
    return []
  }

  // Extrair taxa de cambio (se disponivel no XML)
  const taxaGeral = parseDecimal(
    extractValue(duimp, ['cambio', 'taxa']) ??
    extractValue(duimp, ['CAMBIO', 'TAXA']) ??
    1.0
  ) || 1.0

  // Extrair cada imposto do mapa
  for (const [campo, info] of Object.entries(MAPA_IMPOSTOS)) {
    const campoLower = campo.toLowerCase()
    const valorNode =
      extractValue(duimp, ['impostos', campo]) ??
      extractValue(duimp, ['impostos', campoLower]) ??
      extractValue(duimp, [campo]) ??
      extractValue(duimp, [campoLower])

    if (valorNode == null) continue

    const valor = typeof valorNode === 'object'
      ? parseDecimal((valorNode as Record<string, unknown>)['valor'] ?? valorNode)
      : parseDecimal(valorNode)

    if (valor <= 0) continue

    const taxa = typeof valorNode === 'object'
      ? (parseDecimal((valorNode as Record<string, unknown>)['taxa_cambio']) || taxaGeral)
      : taxaGeral

    const moeda = (typeof valorNode === 'object'
      ? String((valorNode as Record<string, unknown>)['moeda'] ?? 'BRL')
      : 'BRL').toUpperCase()

    const valor_brl = moeda === 'BRL' ? valor : Math.round(valor * taxa * 10000) / 10000

    impostos.push({
      categoria_codigo: info.codigo,
      categoria_nome: info.nome,
      moeda,
      valor,
      taxa_cambio: taxa,
      valor_brl,
      icms_origem_portal: campo === 'ICMS',
    })
  }

  return impostos
}

// Alias para compatibilidade com importar.ts
export const parseXmlDuimp = extrairImpostosXML
