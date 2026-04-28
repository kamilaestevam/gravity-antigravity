import { PrismaClient } from '../configurador/generated/index.js'

const prisma = new PrismaClient()

async function main() {
  const products = await prisma.product.findMany({
    select: { id: true, name: true, slug: true, status: true, backend_module: true },
    orderBy: { created_at: 'desc' },
  })
  console.log(`[check] Total: ${products.length} produtos`)
  for (const p of products) {
    console.log(`  ${p.name} | slug=${p.slug} | status=${p.status} | module=${p.backend_module}`)
  }

  const configs = await prisma.produtoGravityConfiguracao.findMany({
    select: { tenant_id: true, product_key: true, is_active: true },
  })
  console.log(`\n[check] ProductConfigs: ${configs.length}`)
  for (const c of configs) {
    console.log(`  tenant=${c.tenant_id} | product=${c.product_key} | active=${c.is_active}`)
  }
}

main().finally(() => prisma.$disconnect())
