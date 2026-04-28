import { prisma } from '../lib/prisma.js'
async function main() {
  const configs = await prisma.produtoGravityConfiguracao.findMany()
  console.log('Total ProductConfig:', configs.length)
  configs.forEach(c =>
    console.log(
      ' -',
      c.id_organizacao_config_produto_gravity,
      '|',
      c.chave_produto_config_produto_gravity,
      '| ativo:',
      c.ativo_config_produto_gravity,
    ),
  )
  await prisma.$disconnect()
}
main().catch(console.error)
