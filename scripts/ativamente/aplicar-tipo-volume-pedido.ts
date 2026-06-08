/**
 * Aplica migration 20260608120000_add_tipo_volume_pedido_item em todos os schemas com pedido.
 * Uso: PEDIDO_DATABASE_URL=... npx tsx scripts/ativamente/aplicar-tipo-volume-pedido.ts
 */
import { execSync } from 'node:child_process'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { aplicarMigrationEmSchemasComPedido } from './aplicar-migration-ddl-schemas-pedido.js'

const REPO_ROOT = resolve(import.meta.dirname, '../..')
const MIGRATION = '20260608120000_add_tipo_volume_pedido_item'

async function main(): Promise<void> {
  const pedidoUrl = process.env.PEDIDO_DATABASE_URL
  if (!pedidoUrl) {
    console.error('[tipo-volume] ERRO: PEDIDO_DATABASE_URL ausente.')
    process.exit(1)
  }

  execSync('npx tsx scripts/ativamente/compose-pedido-schema.ts', {
    cwd: REPO_ROOT,
    stdio: 'inherit',
  })

  console.log('[tipo-volume] prisma migrate deploy (public)...')
  try {
    execSync(`npx prisma migrate deploy --schema=servicos-global/produto/pedido/prisma/schema.prisma`, {
      cwd: REPO_ROOT,
      stdio: 'inherit',
      env: { ...process.env, DATABASE_URL: pedidoUrl },
    })
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    console.warn('[tipo-volume] migrate deploy public (continua):', msg.split('\n')[0] ?? msg)
  }

  await aplicarMigrationEmSchemasComPedido(pedidoUrl, MIGRATION, 'tipo-volume')
  console.log('[tipo-volume] Concluido.')
}

const isMain =
  process.argv[1] !== undefined &&
  resolve(fileURLToPath(import.meta.url)) === resolve(process.argv[1])

if (isMain) {
  main().catch(err => {
    console.error('[tipo-volume] ERRO FATAL:', err instanceof Error ? err.message : err)
    process.exit(1)
  })
}
