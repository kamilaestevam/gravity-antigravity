import { prisma } from '../lib/prisma.js'
async function main() {
  const configs = await prisma.configuracaoProduto.findMany()
  console.log('Total ProductConfig:', configs.length)
  configs.forEach(c => console.log(' -', c.tenant_id, '|', c.product_key, '| ativo:', c.is_active))
  await prisma.$disconnect()
}
main().catch(console.error)
