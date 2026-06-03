/**
 * CLI — aplica id_processo nullable em schemas com pedido.
 * @see aplicar-migration-ddl-schemas-pedido.ts
 */
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  aplicarIdProcessoEmSchemasComPedido,
  MIGRATION_ID_PROCESSO_PEDIDO,
} from './aplicar-migration-ddl-schemas-pedido.js'

export { aplicarIdProcessoEmSchemasComPedido, MIGRATION_ID_PROCESSO_PEDIDO }

const isMain =
  process.argv[1] !== undefined &&
  resolve(fileURLToPath(import.meta.url)) === resolve(process.argv[1])

if (isMain) {
  const pedidoUrl = process.env.PEDIDO_DATABASE_URL ?? process.env.DATABASE_URL
  if (!pedidoUrl) {
    console.error('[id_processo-tenants] PEDIDO_DATABASE_URL ausente')
    process.exit(1)
  }
  const configuradorUrl =
    process.env.CONFIGURADOR_DATABASE_URL ?? process.env.DATABASE_URL
  aplicarIdProcessoEmSchemasComPedido(pedidoUrl, configuradorUrl ?? undefined).catch(err => {
    console.error('[id_processo-tenants] ERRO:', err instanceof Error ? err.message : err)
    process.exit(1)
  })
}
