/**
 * Script para cadastrar BID Câmbio no catálogo de produtos
 * e habilitar para o tenant do dmmltda@gmail.com
 *
 * Execução: npx tsx scripts/seed-bid-cambio.ts
 */

import { PrismaClient } from '../configurador/generated/index.js'

const prisma = new PrismaClient()

async function main() {
  console.log('[seed] Conectando ao banco...')

  // 1. Listar produtos existentes
  const allProducts = await prisma.product.findMany({
    select: { id: true, name: true, slug: true, status: true, backend_module: true },
  })
  console.log(`[seed] Produtos existentes: ${allProducts.length}`)
  for (const p of allProducts) {
    console.log(`  - ${p.name} (${p.slug}) [${p.status}] module=${p.backend_module ?? 'null'}`)
  }

  // 2. Criar BID Câmbio se não existe
  const existing = await prisma.product.findUnique({ where: { slug: 'bid-cambio' } })
  let productId: string

  if (existing) {
    console.log(`[seed] BID Câmbio já existe: ${existing.id}`)
    productId = existing.id
  } else {
    const created = await prisma.product.create({
      data: {
        name: 'BID Câmbio',
        slug: 'bid-cambio',
        description: 'Gestão e cotação de câmbio comercial para operações de COMEX — marketplace de corretoras com comparativo automático e cálculo de economia',
        status: 'ACTIVE',
        billing_type: 'PER_PROCESS',
        has_setup: false,
        unit_price: 2.99,
        unit_currency: 'BRL',
        minimum_price: 199,
        minimum_currency: 'BRL',
        user_limit_type: 'UNLIMITED',
        backend_module: 'bid-cambio',
        target_audience: 'Importadores, exportadores, tradings, agentes de carga e despachantes aduaneiros',
      },
    })
    console.log(`[seed] BID Câmbio CRIADO: ${created.id}`)
    productId = created.id
  }

  // 3. Buscar o tenant do dmmltda@gmail.com
  // Primeiro verificar quais tabelas existem para tenant/org
  console.log('[seed] Buscando tenant para dmmltda@gmail.com...')

  // Verificar se existe ProductConfig para este tenant
  const configs = await prisma.configuracaoProduto.findMany({
    select: { id: true, tenant_id: true, product_key: true, is_active: true },
    take: 20,
  })
  console.log(`[seed] ProductConfigs existentes: ${configs.length}`)
  for (const c of configs) {
    console.log(`  - tenant=${c.tenant_id} product=${c.product_key} active=${c.is_active}`)
  }

  // 4. Verificar organizations/tenants
  try {
    const orgs = await prisma.$queryRaw`SELECT id, name, slug FROM "Organization" LIMIT 10` as Array<{id: string, name: string, slug: string}>
    console.log(`[seed] Organizations:`)
    for (const o of orgs) {
      console.log(`  - ${o.id}: ${o.name} (${o.slug})`)
    }
  } catch {
    console.log('[seed] Tabela Organization não existe, tentando outra...')
  }

  // Tentar encontrar o tenant correto
  try {
    const tenants = await prisma.$queryRaw`
      SELECT DISTINCT tenant_id FROM "ProductConfig" LIMIT 10
    ` as Array<{tenant_id: string}>
    console.log(`[seed] Tenants com ProductConfig: ${tenants.map(t => t.tenant_id).join(', ')}`)
  } catch (e) {
    console.log('[seed] Erro ao buscar tenants:', (e as Error).message)
  }

  console.log('[seed] Pronto! Product ID:', productId)
}

main()
  .catch((e) => {
    console.error('[seed] ERRO:', e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
