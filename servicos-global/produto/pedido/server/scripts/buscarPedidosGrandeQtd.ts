/**
 * buscarPedidosGrandeQtd.ts — Pedidos com quantidade_total > limiar
 */
import { PrismaClient } from '../../node_modules/.prisma/client/index.js'

const prisma = new PrismaClient()
const LIMIAR = 1_000_000_000

async function main() {
  const rows = await prisma.$queryRaw<Array<{
    numero_pedido: string
    quantidade_total_pedido: string | number | null
    valor_total_pedido: string | number | null
    status_pedido: string
    id_workspace: string
    id_organizacao: string
  }>>`
    SELECT numero_pedido, quantidade_total_pedido, valor_total_pedido,
           status_pedido, id_workspace, id_organizacao
    FROM "public"."pedido"
    WHERE data_exclusao_pedido IS NULL
      AND quantidade_total_pedido > ${LIMIAR}
    ORDER BY quantidade_total_pedido DESC
    LIMIT 20
  `

  console.log(`\nPedidos com qtd > ${LIMIAR.toLocaleString('pt-BR')}: ${rows.length}\n`)
  for (const r of rows) {
    console.log(JSON.stringify({
      numero: r.numero_pedido,
      qtd: Number(r.quantidade_total_pedido),
      valor: Number(r.valor_total_pedido),
      status: r.status_pedido,
      workspace: r.id_workspace,
      org: r.id_organizacao,
    }))
  }

  // Pedidos exatos da screenshot (sem espaço)
  const exatos = await prisma.pedido.findMany({
    where: {
      data_exclusao_pedido: null,
      numero_pedido: { in: ['DUPLICADO03', 'DUPLICADO01', 'PEDIDO EXPO001', 'DUPLICADO 03', 'DUPLICADO 01'] },
    },
    select: { numero_pedido: true, quantidade_total_pedido: true, valor_total_pedido: true, status_pedido: true, id_workspace: true },
  })
  console.log('\nPedidos screenshot (variantes):', exatos.length)
  console.log(JSON.stringify(exatos, null, 2))
}

main().finally(() => prisma.$disconnect())
