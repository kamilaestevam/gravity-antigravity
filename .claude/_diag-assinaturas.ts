import { prisma } from '../servicos-global/configurador/server/lib/prisma.js'

async function main() {
  const assinaturas = await prisma.produtoGravityAssinatura.findMany({
    include: {
      tenant: { select: { nome_organizacao: true } },
      produto: {
        select: {
          slug_produto_gravity: true,
          nome_produto_gravity: true,
          status_produto_gravity: true,
        },
      },
    },
    orderBy: { data_criacao_assinatura_produto_gravity: 'desc' },
  })

  console.log('=== assinatura_produto_gravity ===')
  console.log('Total:', assinaturas.length)
  for (const a of assinaturas) {
    console.log(JSON.stringify({
      id_assinatura: a.id_assinatura_produto_gravity,
      org: a.tenant.nome_organizacao,
      produto: a.produto.slug_produto_gravity,
      produto_status: a.produto.status_produto_gravity,
      assinatura_status: a.status_assinatura_produto_gravity,
      criada: a.data_criacao_assinatura_produto_gravity,
      cancelada: a.data_cancelamento_assinatura_produto_gravity,
    }, null, 2))
  }

  console.log('\n=== configuracao_produto_gravity ===')
  const cfgs = await prisma.produtoGravityConfiguracao.findMany({
    orderBy: { data_criacao_configuracao_produto_gravity: 'desc' },
  })
  console.log('Total:', cfgs.length)
  for (const c of cfgs) {
    console.log(JSON.stringify({
      id: c.id_configuracao_produto_gravity,
      org: c.id_organizacao_configuracao_produto_gravity,
      chave: c.chave_produto_configuracao_produto_gravity,
      ativo: c.ativo_configuracao_produto_gravity,
      criada: c.data_criacao_configuracao_produto_gravity,
    }, null, 2))
  }

  await prisma.$disconnect()
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
