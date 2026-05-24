/** Diagnóstico por workspace — espelha filtro da lista */
import { PrismaClient } from '../../node_modules/.prisma/client/index.js'

const prisma = new PrismaClient()
const workspaceId = process.argv[2] ?? 'cmosr1zc70001v2hfp3bxax4s'
const hoje = new Date().toISOString().slice(0, 10)

const PARES = [
  ['data_prevista_pedido_pronto', 'data_confirmada_pedido_pronto'],
  ['data_prevista_inspecao_pedido', 'data_confirmada_inspecao_pedido'],
  ['data_prevista_coleta_pedido', 'data_confirmada_coleta_pedido'],
  ['data_previsao_recebimento_rascunho_pedido', 'data_confirmacao_recebimento_rascunho_pedido'],
  ['data_previsao_aprovacao_rascunho_pedido', 'data_confirmacao_aprovacao_rascunho_pedido'],
  ['data_previsao_recebimento_rascunho_proforma_pedido', 'data_confirmacao_recebimento_rascunho_proforma_pedido'],
  ['data_previsao_aprovacao_rascunho_proforma_pedido', 'data_confirmacao_aprovacao_rascunho_proforma_pedido'],
  ['data_previsao_envio_original_proforma_pedido', 'data_confirmacao_envio_original_proforma_pedido'],
  ['data_previsao_recebimento_original_proforma_pedido', 'data_confirmacao_recebimento_original_proforma_pedido'],
  ['data_previsao_recebimento_rascunho_invoice_pedido', 'data_confirmacao_recebimento_rascunho_invoice_pedido'],
  ['data_previsao_aprovacao_rascunho_invoice_pedido', 'data_confirmacao_aprovacao_rascunho_invoice_pedido'],
  ['data_previsao_envio_original_invoice_pedido', 'data_confirmacao_envio_original_invoice_pedido'],
  ['data_previsao_recebimento_original_invoice_pedido', 'data_confirmacao_recebimento_original_invoice_pedido'],
] as const

function isAtrasado(p: Record<string, unknown>): boolean {
  return PARES.some(([prevK, confK]) => {
    const prev = p[prevK]
    const conf = p[confK]
    if (prev == null) return false
    const prevS = prev instanceof Date ? prev.toISOString().slice(0, 10) : String(prev).slice(0, 10)
    return prevS < hoje && (conf == null || String(conf) === '')
  })
}

async function main() {
  const pedidos = await prisma.pedido.findMany({
    where: { id_workspace: workspaceId, data_exclusao_pedido: null },
    select: {
      numero_pedido: true,
      status_pedido: true,
      quantidade_total_pedido: true,
      valor_total_pedido: true,
    },
    orderBy: { numero_pedido: 'asc' },
  })

  const atrasados = pedidos.filter(p => isAtrasado(p as Record<string, unknown>))
  const qtdTotal = pedidos.reduce((s, p) => s + Number(p.quantidade_total_pedido ?? 0), 0)
  const valorTotal = pedidos.reduce((s, p) => s + Number(p.valor_total_pedido ?? 0), 0)

  console.log(`\nWorkspace ${workspaceId}`)
  console.log(`Pedidos: ${pedidos.length} | Atrasados (card): ${atrasados.length}`)
  console.log(`Card qtd_total: ${qtdTotal} | valor_total: ${valorTotal}\n`)

  for (const p of pedidos) {
    console.log(`  ${p.numero_pedido.padEnd(22)} status=${p.status_pedido?.padEnd(14)} qtd=${Number(p.quantidade_total_pedido ?? 0)} valor=${Number(p.valor_total_pedido ?? 0)} atrasado=${isAtrasado(p as Record<string, unknown>) ? 'SIM' : 'não'}`)
  }
}

main().finally(() => prisma.$disconnect())
