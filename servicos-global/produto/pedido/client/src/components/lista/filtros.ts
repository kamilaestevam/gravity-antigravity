/**
 * filtros.ts — Tipos e helpers de filtro da ListaPedidos
 *
 * Exporta tipos FiltroAtivo, FiltrosAtivosMap e helpers usados tanto pelo
 * FiltroPopoverColuna quanto pela ListaPedidos (chips, ordenação, etc.).
 */

import type { GTColuna } from '@nucleo/tabela-virtual-global'
import type { Pedido } from '../../shared/types'

// ── Tipos de filtro ───────────────────────────────────────────────────────────

export type FiltroTexto  = { tipo: 'texto';  valor: string }
export type FiltroEnum   = { tipo: 'enum';   valor: Set<string> }
export type FiltroNumero = { tipo: 'numero'; valor: { min?: number; max?: number } }
export type FiltroAtivo  = FiltroTexto | FiltroEnum | FiltroNumero

export type FiltrosAtivosMap = Record<string, FiltroAtivo>

// ── Helpers de filtragem ──────────────────────────────────────────────────────

export function rotulofiltro(_campo: string, filtro: FiltroAtivo): string {
  if (filtro.tipo === 'texto') return filtro.valor
  if (filtro.tipo === 'enum') return Array.from(filtro.valor).join(', ')
  if (filtro.tipo === 'numero') {
    const { min, max } = filtro.valor
    if (min != null && max != null) return `${min} — ${max}`
    if (min != null) return `≥ ${min}`
    if (max != null) return `≤ ${max}`
  }
  return ''
}

export function detectarTipoColuna(col: GTColuna<Pedido>): 'texto' | 'numero' | 'enum' {
  if (col.tipo === 'numero') return 'numero'
  if (col.tipo === 'badge' || col.key === 'tipo_operacao' || col.key === 'status' || col.key === 'incoterm') return 'enum'
  return 'texto'
}

/** Mapeia valor raw → label legível para exibição no filtro */
export const LABELS_FILTRO: Record<string, Record<string, string>> = {
  tipo_operacao: { importacao: 'Importação', exportacao: 'Exportação' },
  status: {
    rascunho:      'Rascunho',
    aberto:        'Aberto',
    transferencia: 'Em Transferência',
    consolidado:   'Consolidado',
    cancelado:     'Cancelado',
  },
}

/** Inverte LABELS_FILTRO: label → raw (para aplicar filtro com valor real do banco) */
export const LABELS_FILTRO_INVERSO: Record<string, Record<string, string>> = Object.fromEntries(
  Object.entries(LABELS_FILTRO).map(([campo, map]) => [
    campo,
    Object.fromEntries(Object.entries(map).map(([raw, label]) => [label, raw])),
  ]),
)
