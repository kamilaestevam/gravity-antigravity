/**
 * @nucleo/tabela-virtual-global — ponto de entrada
 */

export { TabelaVirtualGlobal } from './TabelaVirtualGlobal.js'
export { BotaoCompletoExportar } from './BotaoCompletoExportar.js'
export type { BotaoCompletoExportarProps } from './BotaoCompletoExportar.js'
export type {
  GTColuna,
  GTAcao,
  GTAcaoLote,
  GTAcaoExport,
  GTFiltroConfig,
  GTFiltrosAtivos,
  GTAbaTipo,
  GTPreferencias,
  GTLinhaVirtual,
  GTVirtualTableProps,
  GTAlign,
  GTTipo,
  GTMapaColunasFilho,
  GTAcaoLinha,
  GTValorMoeda,
  GTValorUnidade,
  GTUnidadeOpcao,
  GTVirtualHandle,
} from './tipos.js'

// ─── FiltrosColuna (refactor D9 — 2026-05-13) ─────────────────────────────────
// Subsistema de filtros de coluna (chips + popover). Promovido de
// produtos/pedido/Pedidos.tsx para reuso por outros produtos.
export { FiltroChips, calcularValoresUnicos } from './FiltrosColuna/FiltroChips.js'
export { FiltroPopoverColuna } from './FiltrosColuna/FiltroPopoverColuna.js'
export { rotulofiltro } from './FiltrosColuna/rotulofiltro.js'
export { detectarTipoColuna } from './FiltrosColuna/detectarTipoColuna.js'
export { FILTRO_TRADUCOES_PT_BR } from './FiltrosColuna/tipos.js'
export type {
  FiltroAtivo,
  FiltrosAtivosMap,
  FiltroTipo,
  FiltroTraducoes,
  FiltroChipsProps,
  FiltroPopoverColunaProps,
} from './FiltrosColuna/tipos.js'
