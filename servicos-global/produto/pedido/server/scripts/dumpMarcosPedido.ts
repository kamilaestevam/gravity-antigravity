/** Dump marcos de data de um pedido — uso: npx tsx scripts/dumpMarcosPedido.ts "DUPLICADO 03" */
import { PrismaClient } from '../../node_modules/.prisma/client/index.js'

const prisma = new PrismaClient()
const numero = process.argv[2] ?? 'DUPLICADO 03'
const hoje = new Date().toISOString().slice(0, 10)

const CAMPOS = [
  ['Pedido Pronto', 'data_prevista_pedido_pronto', 'data_confirmada_pedido_pronto'],
  ['Inspeção', 'data_prevista_inspecao_pedido', 'data_confirmada_inspecao_pedido'],
  ['Coleta', 'data_prevista_coleta_pedido', 'data_confirmada_coleta_pedido'],
  ['Receb. Rasc. Pedido', 'data_previsao_recebimento_rascunho_pedido', 'data_confirmacao_recebimento_rascunho_pedido'],
  ['Aprov. Rasc. Pedido', 'data_previsao_aprovacao_rascunho_pedido', 'data_confirmacao_aprovacao_rascunho_pedido'],
  ['Receb. Rasc. Proforma', 'data_previsao_recebimento_rascunho_proforma_pedido', 'data_confirmacao_recebimento_rascunho_proforma_pedido'],
  ['Aprov. Rasc. Proforma', 'data_previsao_aprovacao_rascunho_proforma_pedido', 'data_confirmacao_aprovacao_rascunho_proforma_pedido'],
  ['Envio Orig. Proforma', 'data_previsao_envio_original_proforma_pedido', 'data_confirmacao_envio_original_proforma_pedido'],
  ['Receb. Orig. Proforma', 'data_previsao_recebimento_original_proforma_pedido', 'data_confirmacao_recebimento_original_proforma_pedido'],
  ['Receb. Rasc. Invoice', 'data_previsao_recebimento_rascunho_invoice_pedido', 'data_confirmacao_recebimento_rascunho_invoice_pedido'],
  ['Aprov. Rasc. Invoice', 'data_previsao_aprovacao_rascunho_invoice_pedido', 'data_confirmacao_aprovacao_rascunho_invoice_pedido'],
  ['Envio Orig. Invoice', 'data_previsao_envio_original_invoice_pedido', 'data_confirmacao_envio_original_invoice_pedido'],
  ['Receb. Orig. Invoice', 'data_previsao_recebimento_original_invoice_pedido', 'data_confirmacao_recebimento_original_invoice_pedido'],
] as const

function fmt(d: unknown): string {
  if (d == null) return '—'
  if (d instanceof Date) return d.toISOString()
  return String(d)
}

async function main() {
  const p = await prisma.pedido.findFirst({
    where: { numero_pedido: numero, data_exclusao_pedido: null },
  })
  if (!p) {
    console.log(`Pedido não encontrado: ${numero}`)
    return
  }

  console.log(`\n${p.numero_pedido} | status=${p.status_pedido} | hoje=${hoje}\n`)
  console.log('Marco                      | Prevista                 | Confirmada               | Conta atraso?')
  console.log('-'.repeat(95))

  let atrasados = 0
  for (const [label, prevK, confK] of CAMPOS) {
    const prev = p[prevK as keyof typeof p]
    const conf = p[confK as keyof typeof p]
    const prevS = fmt(prev)
    const confS = fmt(conf)
    let conta = '—'
    if (prev != null) {
      const prevIso = prev instanceof Date ? prev.toISOString() : String(prev)
      const vencido = prevIso.slice(0, 10) < hoje
      const semConf = conf == null || String(conf) === ''
      conta = vencido && semConf ? 'SIM ⚠' : vencido ? 'vencido+confirmado' : 'futuro'
      if (vencido && semConf) atrasados++
    }
    console.log(`${label.padEnd(26)} | ${prevS.slice(0, 24).padEnd(24)} | ${confS.slice(0, 24).padEnd(24)} | ${conta}`)
  }

  console.log(`\nCard computaria atrasado: ${atrasados > 0 ? 'SIM' : 'NÃO'} (${atrasados} marco(s) vencido(s) sem confirmação)\n`)
}

main().finally(() => prisma.$disconnect())
