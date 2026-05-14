// FiltrosColuna/rotulofiltro.ts
//
// Helper que converte um filtro ativo (FiltroAtivo) na string exibida dentro
// do chip de filtro na toolbar.
//
// Modo HÍBRIDO para enum (decisão UX 2026-05-13):
//   - 0 valores             → "(nenhum)" (estado transiente, raro)
//   - 1-2 valores           → nomes diretos separados por vírgula
//   - threshold+ valores    → "N selecionados" (consolidado)
//
// Threshold default = 2 (mostra 1-2 nomes, consolida a partir de 3). Caller
// pode configurar via parâmetro `thresholdConsolidar`.
//
// Refactor D9: promovido de produtos/pedido/Pedidos.tsx para nucleo-global.

import type { FiltroAtivo, FiltroTraducoes } from './tipos'
import { FILTRO_TRADUCOES_PT_BR } from './tipos'

/**
 * Texto a exibir dentro do chip de um filtro ativo.
 *
 * @param filtro                 Filtro a renderizar
 * @param thresholdConsolidar    Acima desse número de valores enum, mostra
 *                               "N selecionados" em vez dos nomes. Default 2.
 * @param traducoes              Override de strings i18n. Default pt-BR.
 *
 * @returns String pronta pra colocar dentro do `<span>` do chip.
 *          Nunca retorna `null`/`undefined` — sempre string.
 */
export function rotulofiltro(
  filtro: FiltroAtivo,
  thresholdConsolidar = 2,
  traducoes?: Partial<FiltroTraducoes>,
): string {
  const t = { ...FILTRO_TRADUCOES_PT_BR, ...traducoes }

  if (filtro.tipo === 'texto') {
    return filtro.valor
  }

  if (filtro.tipo === 'enum') {
    const valores = Array.from(filtro.valor)
    if (valores.length === 0) return t.nenhum
    if (valores.length <= thresholdConsolidar) return valores.join(', ')
    return t.nSelecionados(valores.length)
  }

  if (filtro.tipo === 'numero') {
    const { min, max } = filtro.valor
    if (min != null && max != null) return `${min} — ${max}`
    if (min != null) return `≥ ${min}`
    if (max != null) return `≤ ${max}`
    return ''
  }

  // Defensive (TypeScript exaustivo já cobre, mas robustez em runtime):
  return ''
}
