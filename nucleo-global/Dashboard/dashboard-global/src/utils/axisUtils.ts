/**
 * axisUtils.ts — Utilitários de eixo Y para widgets multi-campo
 *
 * Resolve qual eixo Y cada campo ocupa quando há tipos de unidade diferentes.
 * Regras (D3):
 *  - Máximo 2 tipos de unidade por widget
 *  - currency → eixo esquerdo (left)
 *  - number / percentage → eixo direito (right) quando coexiste com currency
 *  - Se todos os campos têm o mesmo tipo → dualAxis = false, todos em 'left'
 */

import type { FieldUnitType, CatalogField } from '../tipos.js'

export type YAxisSide = 'left' | 'right'

export interface AxisAssignment {
  /** Mapa fieldKey → lado do eixo Y */
  assignments: Record<string, YAxisSide>
  /** true quando há 2 grupos de unidades incompatíveis presentes */
  dualAxis: boolean
  /** Tipo de unidade do eixo esquerdo */
  leftUnit: FieldUnitType | null
  /** Tipo de unidade do eixo direito (null quando dualAxis=false) */
  rightUnit: FieldUnitType | null
}

/**
 * Determina se dois tipos de unidade são incompatíveis (precisam de eixo duplo).
 * currency vs number/percentage = incompatível.
 * number vs percentage = compatível (mesma escala relativa).
 */
function areUnitsIncompatible(a: FieldUnitType, b: FieldUnitType): boolean {
  if (a === b) return false
  const currencyGroup = new Set<FieldUnitType>(['currency'])
  const countGroup = new Set<FieldUnitType>(['number', 'percentage'])
  return (currencyGroup.has(a) && countGroup.has(b)) ||
         (countGroup.has(a) && currencyGroup.has(b))
}

/**
 * Resolve as atribuições de eixo Y para um conjunto de campos.
 *
 * @param fields - Campos selecionados com seus tipos de unidade
 * @returns AxisAssignment com assignments, dualAxis, leftUnit, rightUnit
 *
 * @example
 * resolveAxisAssignment([
 *   { key: 'valor_total',   type: 'currency' },
 *   { key: 'total_pedidos', type: 'number'   },
 * ])
 * // → { assignments: { valor_total: 'left', total_pedidos: 'right' }, dualAxis: true, leftUnit: 'currency', rightUnit: 'number' }
 */
export function resolveAxisAssignment(
  fields: Array<Pick<CatalogField, 'key' | 'type'>>,
): AxisAssignment {
  if (fields.length === 0) {
    return { assignments: {}, dualAxis: false, leftUnit: null, rightUnit: null }
  }

  // Filtra apenas tipos de unidade (exclui 'date' e 'string')
  const unitFields = fields.filter(
    (f): f is Array<Pick<CatalogField, 'key' | 'type'>> extends Array<infer T> ? T & { type: FieldUnitType } : never =>
      f.type === 'currency' || f.type === 'number' || f.type === 'percentage',
  )

  if (unitFields.length === 0) {
    const assignments: Record<string, YAxisSide> = {}
    for (const f of fields) assignments[f.key] = 'left'
    return { assignments, dualAxis: false, leftUnit: null, rightUnit: null }
  }

  const firstType = unitFields[0].type as FieldUnitType
  let secondType: FieldUnitType | null = null

  for (const f of unitFields) {
    const ft = f.type as FieldUnitType
    if (areUnitsIncompatible(firstType, ft)) {
      secondType = ft
      break
    }
  }

  const dualAxis = secondType !== null
  const leftUnit: FieldUnitType = firstType
  const rightUnit: FieldUnitType | null = dualAxis ? secondType : null

  const assignments: Record<string, YAxisSide> = {}
  for (const f of fields) {
    if (!dualAxis) {
      assignments[f.key] = 'left'
    } else {
      const ft = f.type as FieldUnitType
      assignments[f.key] = areUnitsIncompatible(leftUnit, ft) ? 'right' : 'left'
    }
  }

  return { assignments, dualAxis, leftUnit, rightUnit }
}

/**
 * Verifica se a adição de um novo tipo de unidade excederia o limite de 2 tipos incompatíveis.
 * Usado no DashboardConstrutorConsulta para bloquear seleção de 3º tipo diferente.
 *
 * @param existingTypes - Tipos já presentes na seleção atual
 * @param newType - Tipo do campo que o usuário quer adicionar
 * @returns true se a adição seria bloqueada
 */
export function wouldExceedUnitLimit(
  existingTypes: FieldUnitType[],
  newType: FieldUnitType,
): boolean {
  if (existingTypes.length === 0) return false

  const incompatibleTypesPresent = new Set<string>()
  const firstType = existingTypes[0]

  // Conta quantos grupos incompatíveis já existem
  for (const t of existingTypes) {
    if (areUnitsIncompatible(firstType, t)) {
      incompatibleTypesPresent.add(t)
    }
  }
  incompatibleTypesPresent.add(firstType)

  // Se já há 2 grupos e o novo tipo criaria um 3º grupo → bloquear
  if (incompatibleTypesPresent.size >= 2) {
    // Verifica se o novo tipo pertence a algum grupo já existente
    const belongsToExisting = [...incompatibleTypesPresent].some(
      existing => !areUnitsIncompatible(existing as FieldUnitType, newType),
    )
    return !belongsToExisting
  }

  return false
}

/**
 * Formata um valor numérico de acordo com o tipo de unidade.
 */
export function formatValueByUnit(value: number, unit: FieldUnitType): string {
  switch (unit) {
    case 'currency':
      return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
        maximumFractionDigits: 0,
      }).format(value)
    case 'percentage':
      return `${value.toFixed(1)}%`
    case 'number':
    default:
      return new Intl.NumberFormat('pt-BR').format(value)
  }
}

/**
 * Retorna o badge de tipo de unidade exibido no Passo 1 do DashboardConstrutorConsulta.
 */
export function unitBadgeLabel(type: CatalogField['type']): string {
  switch (type) {
    case 'currency':    return 'R$'
    case 'percentage':  return '%'
    case 'number':      return '#'
    case 'date':        return 'data'
    case 'string':      return 'texto'
    default:            return ''
  }
}

/** Paleta de cores fixa para séries múltiplas (D1) */
export const SERIES_COLORS: readonly string[] = [
  'var(--accent)',  // indigo — série 1
  '#34d399',        // verde  — série 2
  '#f59e0b',        // âmbar  — série 3
  '#f87171',        // vermelho — série 4
  '#60a5fa',        // azul   — série 5
] as const
