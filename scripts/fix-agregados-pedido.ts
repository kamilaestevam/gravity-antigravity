/**
 * fix-agregados-pedido.ts
 * Script one-time para popular quantidade_total_inicial_pedido e quantidade_transferida_total
 * nos pedidos que foram criados via importação antes do fix no smartImportService.
 *
 * Pedidos afetados: aqueles com quantidade_total_inicial_pedido = null
 * Fórmula:
 *   quantidade_total_inicial_pedido = soma de quantidade_inicial_item_pedido dos itens
 *   quantidade_transferida_total    = soma de quantidade_transferida_item dos itens
 *
 * Uso: npx ts-node scripts/fix-agregados-pedido.ts
 */

import { PrismaClient } from '../produto/pedido/node_modules/.prisma/client/index.js'

const prisma = new PrismaClient({
  datasources: { db: { url: process.env.DATABASE_URL } },
})

async function main() {
  console.log('[fix-agregados-pedido] Buscando pedidos com agregados ausentes...')

  const pedidos = await prisma.pedido.findMany({
    where: { quantidade_total_inicial_pedido: null },
    select: {
      id: true,
      tenant_id: true,
      numero_pedido: true,
      itens: {
        select: {
          quantidade_inicial_item_pedido: true,
          quantidade_transferida_item: true,
        },
      },
    },
  })

  console.log(`[fix-agregados-pedido] ${pedidos.length} pedido(s) a corrigir.`)

  let totalCorrigidos = 0

  for (const pedido of pedidos) {
    const qtdInicial = pedido.itens.reduce(
      (s, i) => s + Number(i.quantidade_inicial_item_pedido ?? 0),
      0,
    )
    const qtdTransferida = pedido.itens.reduce(
      (s, i) => s + Number(i.quantidade_transferida_item ?? 0),
      0,
    )

    await prisma.pedido.update({
      where: { id: pedido.id },
      data: {
        quantidade_total_inicial_pedido: qtdInicial,
        quantidade_transferida_total: qtdTransferida,
      },
    })

    totalCorrigidos++
    if (totalCorrigidos % 50 === 0) {
      console.log(`[fix-agregados-pedido] ${totalCorrigidos}/${pedidos.length} atualizados...`)
    }
  }

  console.log(`[fix-agregados-pedido] Concluído — ${totalCorrigidos} pedido(s) corrigido(s).`)
}

main()
  .catch((e) => {
    console.error('[fix-agregados-pedido] ERRO:', e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
