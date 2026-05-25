/**
 * aplicar-migrations-pedido.ts — Aplica migrations pendentes do Pedido (public + tenant_*).
 *
 * Usado no startup do Configurador (Railway runtime) e reutilizado pelo build-site.sh.
 * Idempotente: prisma migrate deploy + migrate-all-tenants.
 */
import { execSync } from 'node:child_process'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const REPO_ROOT = resolve(import.meta.dirname, '../..')
const PEDIDO_SCHEMA = 'servicos-global/produto/pedido/prisma/schema.prisma'

export function aplicarMigrationsPedido(): void {
  const pedidoUrl = process.env.PEDIDO_DATABASE_URL
  if (!pedidoUrl) {
    console.warn('[migrations-pedido] PEDIDO_DATABASE_URL ausente — skip')
    return
  }

  const configuradorUrl =
    process.env.CONFIGURADOR_DATABASE_URL ?? process.env.DATABASE_URL
  if (!configuradorUrl) {
    console.warn(
      '[migrations-pedido] CONFIGURADOR_DATABASE_URL/DATABASE_URL ausente — tenant schemas nao serao migrados',
    )
  }

  console.log('[migrations-pedido] Compondo schema do Pedido...')
  execSync('npx tsx scripts/ativamente/compose-pedido-schema.ts', {
    cwd: REPO_ROOT,
    stdio: 'inherit',
  })

  console.log('[migrations-pedido] prisma migrate deploy (schema public)...')
  execSync(`npx prisma migrate deploy --schema=${PEDIDO_SCHEMA}`, {
    cwd: REPO_ROOT,
    stdio: 'inherit',
    env: { ...process.env, DATABASE_URL: pedidoUrl },
  })

  if (!configuradorUrl) return

  console.log('[migrations-pedido] migrate-all-tenants (schemas tenant_*)...')
  execSync('npx tsx scripts/ativamente/migrate-all-tenants.ts --product=pedido', {
    cwd: REPO_ROOT,
    stdio: 'inherit',
    env: {
      ...process.env,
      DATABASE_URL: pedidoUrl,
      CONFIGURADOR_DATABASE_URL: configuradorUrl,
    },
  })

  console.log('[migrations-pedido] Concluido.')
}

if (process.argv[1] && resolve(fileURLToPath(import.meta.url)) === resolve(process.argv[1])) {
  aplicarMigrationsPedido()
}
