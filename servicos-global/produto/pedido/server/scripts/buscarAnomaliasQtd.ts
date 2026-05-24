/**
 * buscarAnomaliasQtd.ts — Top pedidos com quantidade_total_pedido anômala
 */
import { PrismaClient } from '../../node_modules/.prisma/client/index.js'

const prisma = new PrismaClient()

async function main() {
  const pedidos = await prisma.pedido.findMany({
    where: { data_exclusao_pedido: null },
    select: {
      numero_pedido: true,
      status_pedido: true,
      quantidade_total_pedido: true,
      valor_total_pedido: true,
      id_workspace: true,
    },
    orderBy: { quantidade_total_pedido: 'desc' },
    take: 15,
  })

  console.log('\nTop 15 quantidade_total_pedido:\n')
  for (const p of pedidos) {
    console.log(
      `${p.numero_pedido.padEnd(25)} qtd=${Number(p.quantidade_total_pedido ?? 0).toLocaleString('pt-BR')} valor=${Number(p.valor_total_pedido ?? 0).toLocaleString('pt-BR')} status=${p.status_pedido}`,
    )
  }

  const soma = pedidos.reduce((s, p) => s + Number(p.quantidade_total_pedido ?? 0), 0)
  console.log(`\nSoma top 15: ${soma.toLocaleString('pt-BR')}`)
}

main().finally(() => prisma.$disconnect())
