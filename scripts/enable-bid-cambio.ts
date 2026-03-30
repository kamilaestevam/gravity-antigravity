import { PrismaClient } from '../configurador/generated/index.js'

const prisma = new PrismaClient()

async function main() {
  const tenantId = 'cmnbuvwyw00034rru361h5xng'
  const productKey = 'bid-cambio'

  // Verificar se já existe
  const existing = await prisma.productConfig.findUnique({
    where: { tenant_id_product_key: { tenant_id: tenantId, product_key: productKey } },
  })

  if (existing) {
    console.log('[enable] BID Câmbio já habilitado para o tenant:', existing.is_active)
    if (!existing.is_active) {
      await prisma.productConfig.update({
        where: { id: existing.id },
        data: { is_active: true },
      })
      console.log('[enable] Reativado!')
    }
    return
  }

  // Criar ProductConfig
  const config = await prisma.productConfig.create({
    data: {
      tenant_id: tenantId,
      product_key: productKey,
      is_active: true,
      config: {},
    },
  })
  console.log('[enable] BID Câmbio HABILITADO:', config.id)

  // Listar todos os produtos do tenant
  const allConfigs = await prisma.productConfig.findMany({
    where: { tenant_id: tenantId },
    select: { product_key: true, is_active: true },
  })
  console.log('[enable] Produtos do tenant:')
  for (const c of allConfigs) {
    console.log(`  - ${c.product_key}: ${c.is_active ? 'ATIVO' : 'inativo'}`)
  }
}

main()
  .catch((e) => { console.error('[enable] ERRO:', e); process.exit(1) })
  .finally(() => prisma.$disconnect())
