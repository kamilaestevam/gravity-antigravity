// FiltrosColuna/detectarTipoColuna.ts
//
// Decide qual MODO de input o popover de filtro deve usar para uma coluna:
//   - 'numero': intervalo min/max
//   - 'enum'  : seleção múltipla (checkbox list)
//   - 'texto' : texto livre
//
// Regra padrão:
//   - `col.tipo === 'numero'` → 'numero'
//   - `col.tipo === 'badge'`  → 'enum' (badges sempre são valores discretos)
//   - caso contrário → 'texto'
//
// Consumers podem passar `tipoFiltroOverrides` para forçar 'enum' em colunas
// específicas (ex: Pedido força 'enum' para `id_workspace`, `status`, `incoterm`,
// `tipo_operacao`). Isso evita Pedido-specific keys hardcoded no nucleo-global.
//
// Refactor D9 (2026-05-13): promovido de produtos/pedido/Pedidos.tsx.

import type { GTColuna } from '../tipos'
import type { FiltroTipo } from './tipos'

/**
 * Detecta o tipo de input do popover para uma coluna.
 *
 * @param col                    A coluna sendo filtrada
 * @param tipoFiltroOverrides    Mapa `col.key → FiltroTipo` que sobrepõe a
 *                               regra padrão. Útil para forçar 'enum' em
 *                               colunas que o consumer sabe ter valores
 *                               discretos sem usar `tipo: 'badge'`.
 *
 * @example
 *   // Pedido força enum em algumas colunas
 *   detectarTipoColuna(col, {
 *     status: 'enum',
 *     tipo_operacao: 'enum',
 *     incoterm: 'enum',
 *     id_workspace: 'enum',
 *   })
 */
export function detectarTipoColuna<T = unknown>(
  col: GTColuna<T>,
  tipoFiltroOverrides?: Record<string, FiltroTipo>,
): FiltroTipo {
  // Override explícito tem precedência
  const override = tipoFiltroOverrides?.[col.key]
  if (override) return override

  // Regras default
  if (col.tipo === 'numero') return 'numero'
  if (col.tipo === 'badge') return 'enum'
  return 'texto'
}
