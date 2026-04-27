/**
 * server/scripts/seedProducts.ts
 * CLI de seed do catálogo master de produtos.
 *
 * Substitui a antiga rota HTTP POST /api/v1/admin/produtos-gravity/seed — seed é
 * operação de infraestrutura e não deve ser exposta via HTTP em produção.
 *
 * Uso:
 *   npx tsx server/scripts/seedProducts.ts
 *   npx tsx server/scripts/seedProducts.ts --demo-tenant=tenant-1
 *
 * Flags:
 *   --demo-tenant=<id>   Também ativa produtos demo para o tenant informado.
 *                        Sem a flag, apenas o catálogo é populado.
 */

import 'dotenv/config'
import { productCatalogService } from '../services/productCatalogService.js'
import { prisma } from '../lib/prisma.js'
import { logger } from '../lib/logger.js'

const log = logger.child({ module: 'seed-products' })

async function main(): Promise<void> {
  const demoTenantArg = process.argv.find(a => a.startsWith('--demo-tenant='))
  const demoTenantId = demoTenantArg?.split('=')[1]

  log.info('seeding product catalog')
  const catalogResult = await productCatalogService.seedInitialProducts()
  log.info('catalog seed complete', { ...catalogResult })

  if (demoTenantId) {
    log.info('activating demo products for tenant', { tenant_id: demoTenantId })
    const activateResult = await productCatalogService.activateProductsForTenant(
      demoTenantId,
      ['simula-custo', 'bid-cambio', 'bid-frete'],
    )
    log.info('demo activation complete', { ...activateResult })
  }
}

main()
  .catch((err: unknown) => {
    log.error('seed failed', { error: err instanceof Error ? err.message : String(err) })
    process.exitCode = 1
  })
  .finally(() => {
    void prisma.$disconnect()
  })
