// Re-export helpers do processos-core usados pelo init.ts
// Path de 4 níveis a partir de src/ — padrão validado no projeto
export {
  mapPedido,
  encodeCursor,
  CURSOR_SORT_FIELDS,
} from '../../../../../servicos-global/organizacao/processos-core/src/routes/pedidos.js'
export type { CursorSortField } from '../../../../../servicos-global/organizacao/processos-core/src/routes/pedidos.js'
