/** Soma quantidades dos itens de um pedido — uso: npx tsx scripts/somarItensPedido.ts "DUPLICADO 03" */
import { PrismaClient } from '../../node_modules/.prisma/client/index.js'

const prisma = new PrismaClient()
const numero = process.argv[2] ?? 'DUPLICADO 03'

async function main() {
  const ped = await prisma.pedido.findFirst({
    where: { numero_pedido: numero, data_exclusao_pedido: null },
    include: { itens_pedido: true },
  })
  if (!ped) {
    console.log(`Pedido não encontrado: ${numero}`)
    return
  }
  const itens = ped.itens_pedido
  const sums = {
    inicial: itens.reduce((s, i) => s + Number(i.quantidade_inicial_item ?? 0), 0),
    atual: itens.reduce((s, i) => s + Number(i.quantidade_atual_item ?? 0), 0),
    pronta: itens.reduce((s, i) => s + Number(i.quantidade_pronta_item ?? 0), 0),
    cancelada: itens.reduce((s, i) => s + Number(i.quantidade_cancelada_item ?? 0), 0),
  }
  const qtdDb = Number(ped.quantidade_total_pedido ?? 0)
  const saldoCard = Math.max(0, qtdDb - sums.pronta - sums.cancelada)
  console.log(JSON.stringify({ numero: ped.numero_pedido, qtdDb, nItens: itens.length, sums, saldoCard }, null, 2))
}

main().finally(() => prisma.$disconnect())
