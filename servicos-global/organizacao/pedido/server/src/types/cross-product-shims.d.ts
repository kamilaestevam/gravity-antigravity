/**
 * cross-product-shims.d.ts
 *
 * Shims de tipo para imports cross-product (de servicos-global/organizacao/*).
 * Esses arquivos vivem fora do `rootDir` deste serviço e usam SDK legado
 * (`@gravity/tenant-resolver`) que ainda não foi migrado para
 * `@gravity/resolver-organizacao`.
 *
 * Esta declaração ambient existe para permitir Delta Zero do tsc no Pedido
 * sem precisar typechekar cross-product. A migração completa dos imports
 * cross-product para a nova SDK é trabalho de uma onda dedicada.
 */

declare module '*/processos-core/src/routes/pedidos.js' {
  import type { Router } from 'express'
  export const pedidosRouter: Router
  export type CursorSortField = string
  export const CURSOR_SORT_FIELDS: readonly string[]
}

declare module '*/processos-core/src/routes/pedidos-config.js' {
  import type { Router } from 'express'
  export const pedidosConfigRouter: Router
}

declare module '*/processos-core/src/routes/importacao.js' {
  import type { Router } from 'express'
  export const importacaoRouter: Router
}

declare module '*/processos-core/src/services/cadastrosClient.js' {
  export const cadastrosClient: unknown
  export const buscarEmpresaSnapshot: (...args: unknown[]) => Promise<unknown>
  export const buscarOpeSnapshot: (...args: unknown[]) => Promise<unknown>
  const _default: unknown
  export default _default
}

declare module '*/processos-core/src/services/pedidoSnapshots.js' {
  export const congelarSnapshotsPedido: (...args: unknown[]) => Promise<unknown>
  export const reSnapshotPedido: (...args: unknown[]) => Promise<unknown>
  const _default: unknown
  export default _default
}

declare module '*/processos-core/src/services/saldoEngine.js' {
  export const calcularSaldoPedido: (...args: unknown[]) => unknown
  export const aplicarFormulaSaldo: (...args: unknown[]) => unknown
  const _default: unknown
  export default _default
}

declare module '*/processos-core/src/services/formulaEngine.js' {
  export const avaliarFormula: (expr: string, vars: Record<string, unknown>) => unknown
  export const validarExpressao: (expr: string) => boolean
  const _default: unknown
  export default _default
}

declare module '*/middleware/apiObservability.js' {
  import type { RequestHandler } from 'express'
  export function apiObservability(productKey: string): RequestHandler
}

declare module '*/historico-global/src/product-audit-plugin.js' {
  import type { Request, RequestHandler } from 'express'
  export interface ProductAuditPluginConfig {
    product_id: string
    module: string
    getActorFromReq: (req: Request) => {
      tenant_id: string
      actor_id: string
      actor_name: string
      actor_type: string
    } | null
  }
  export function createProductAuditPlugin(config: ProductAuditPluginConfig): RequestHandler
}
