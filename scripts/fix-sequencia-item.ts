/**
 * fix-sequencia-item.ts
 * Script one-time para renumerar sequencia_item de itens existentes no banco.
 *
 * Antes: itens tinham sequencia_item = 10, 20, 30... (convenção ERP indevida)
 * Depois: itens têm sequencia_item = 1, 2, 3... (posição dentro do pedido)
 *
 * A renumeração preserva a ordem relativa original (ORDER BY sequencia_item ASC).
 *
 * Uso: npx ts-node scripts/fix-sequencia-item.ts
 */

import { PrismaClient } from '../servicos-global/tenant/generated/index.js'

const prisma = new PrismaClient()

async function main() {
  console.log('[fix-sequencia-item] Iniciando renumeração...')

  // Busca todos os pedidos que têm itens com sequencia_item >= 10
  // (indicativo do padrão antigo `(index + 1) * 10`)
  const pedidos = await prisma.pedido.findMany({
    where: {
      itens: {
        some: {
          sequencia_item: { gte: 10 },
        },
      },
    },
    select: {
      id: true,
      tenant_id: true,
      itens: {
        orderBy: { sequencia_item: 'asc' },
        select: { id: true, sequencia_item: true },
      },
    },
  })

  console.log(`[fix-sequencia-item] ${pedidos.length} pedido(s) com itens a renumerar.`)

  let totalItens = 0

  for (const pedido of pedidos) {
    for (let i = 0; i < pedido.itens.length; i++) {
      const item = pedido.itens[i]
      const novaSequencia = i + 1

      if (item.sequencia_item === novaSequencia) continue

      await prisma.pedidoItem.update({
        where: { id: item.id },
        data: { sequencia_item: novaSequencia },
      })
      totalItens++
    }
  }

  console.log(`[fix-sequencia-item] ${totalItens} item(ns) renumerado(s). Concluído.`)
}

main()
  .catch((e) => {
    console.error('[fix-sequencia-item] ERRO:', e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
