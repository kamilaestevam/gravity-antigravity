/**
 * Aplica migration condicao_pagamento_siscomex em todos os schemas tenant_* com pedido.
 * Uso: PEDIDO_DATABASE_URL=<public_url> npx tsx scripts/ativamente/aplicar-migration-siscomex-pedido-tenants.ts
 */
import { aplicarMigrationEmSchemasComPedido } from './aplicar-migration-ddl-schemas-pedido.js'

const url = process.env.PEDIDO_DATABASE_URL ?? process.env.DATABASE_URL
if (!url) {
  console.error('PEDIDO_DATABASE_URL ou DATABASE_URL obrigatorio')
  process.exit(1)
}

await aplicarMigrationEmSchemasComPedido(
  url,
  '20260608180100_add_condicao_pagamento_siscomex_pedido',
  'ddl-siscomex-pedido',
  process.env.CONFIGURADOR_DATABASE_URL,
)
