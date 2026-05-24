/**
 * diagnosticarCardsPedidos.ts — Diagnóstico de KPIs dos cards da Lista (Pedidos.tsx)
 *
 * Uso (a partir de servicos-global/produto/pedido/server):
 *   npx tsx scripts/diagnosticarCardsPedidos.ts
 *   npx tsx scripts/diagnosticarCardsPedidos.ts --numeros DUPLICADO03,DUPLICADO01
 *
 * Verifica por pedido:
 *   - Pedidos Atrasados (mesma lógica de computeCardStats / cardRegistry)
 *   - quantidade_total_pedido e valor_total_pedido (anomalias de agregação)
 *
 * Saída: stdout + JSON em scripts/audit-results/cards-diagnostico-{ts}.json
 */

// Client gerado em pedido/node_modules/.prisma/client (não usar @prisma/client do monorepo root)
import { PrismaClient } from '../../node_modules/.prisma/client/index.js'
import * as fs from 'fs'
import * as path from 'path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const prisma = new PrismaClient()

// ── Espelha cardRegistry.tsx computeCardStats ─────────────────────────────────

const PARES_ATRASO: Array<{
  label: string
  prev: keyof PedidoDb
  conf: keyof PedidoDb
}> = [
  { label: 'Pedido Pronto',              prev: 'data_prevista_pedido_pronto',                    conf: 'data_confirmada_pedido_pronto' },
  { label: 'Inspeção',                   prev: 'data_prevista_inspecao_pedido',                   conf: 'data_confirmada_inspecao_pedido' },
  { label: 'Coleta',                     prev: 'data_prevista_coleta_pedido',                     conf: 'data_confirmada_coleta_pedido' },
  { label: 'Receb. Rascunho Pedido',     prev: 'data_previsao_recebimento_rascunho_pedido',     conf: 'data_confirmacao_recebimento_rascunho_pedido' },
  { label: 'Aprov. Rascunho Pedido',     prev: 'data_previsao_aprovacao_rascunho_pedido',       conf: 'data_confirmacao_aprovacao_rascunho_pedido' },
  { label: 'Receb. Rascunho Proforma',   prev: 'data_previsao_recebimento_rascunho_proforma_pedido', conf: 'data_confirmacao_recebimento_rascunho_proforma_pedido' },
  { label: 'Aprov. Rascunho Proforma',   prev: 'data_previsao_aprovacao_rascunho_proforma_pedido', conf: 'data_confirmacao_aprovacao_rascunho_proforma_pedido' },
  { label: 'Envio Original Proforma',    prev: 'data_previsao_envio_original_proforma_pedido',  conf: 'data_confirmacao_envio_original_proforma_pedido' },
  { label: 'Receb. Original Proforma',   prev: 'data_previsao_recebimento_original_proforma_pedido', conf: 'data_confirmacao_recebimento_original_proforma_pedido' },
  { label: 'Receb. Rascunho Invoice',    prev: 'data_previsao_recebimento_rascunho_invoice_pedido', conf: 'data_confirmacao_recebimento_rascunho_invoice_pedido' },
  { label: 'Aprov. Rascunho Invoice',    prev: 'data_previsao_aprovacao_rascunho_invoice_pedido', conf: 'data_confirmacao_aprovacao_rascunho_invoice_pedido' },
  { label: 'Envio Original Invoice',     prev: 'data_previsao_envio_original_invoice_pedido',     conf: 'data_confirmacao_envio_original_invoice_pedido' },
  { label: 'Receb. Original Invoice',    prev: 'data_previsao_recebimento_original_invoice_pedido', conf: 'data_confirmacao_recebimento_original_invoice_pedido' },
]

type PedidoDb = {
  id_pedido: string
  id_organizacao: string
  numero_pedido: string
  status_pedido: string
  valor_total_pedido: unknown
  quantidade_total_pedido: unknown
  data_exclusao_pedido: Date | null
  [key: string]: unknown
}

function normDate(v: unknown): string | null {
  if (v == null) return null
  if (v instanceof Date) return v.toISOString()
  const s = String(v)
  return s === '' ? null : s
}

function hojeIso(): string {
  return new Date().toISOString().slice(0, 10)
}

function analisarAtraso(p: PedidoDb, hoje: string) {
  const marcosVencidos: Array<{
    marco: string
    prevista: string
    confirmada: string | null
    motivo: string
  }> = []

  for (const par of PARES_ATRASO) {
    const prevRaw = p[par.prev]
    const confRaw = p[par.conf]
    const prev = normDate(prevRaw)
    const conf = normDate(confRaw)

    if (prev == null) continue

    if (prev < hoje && !conf) {
      marcosVencidos.push({
        marco: par.label,
        prevista: prev,
        confirmada: conf,
        motivo: 'prevista < hoje e sem confirmação',
      })
    } else if (prev >= hoje) {
      // futuro — ok
    } else if (conf) {
      // vencido mas confirmado — não conta como atrasado no card
    }
  }

  return {
    atrasado: marcosVencidos.length > 0,
    marcosVencidos,
    totalMarcosPreenchidos: PARES_ATRASO.filter(par => normDate(p[par.prev]) != null).length,
  }
}

function parseNumerosArg(): string[] | null {
  const idx = process.argv.indexOf('--numeros')
  if (idx === -1 || !process.argv[idx + 1]) return null
  return process.argv[idx + 1].split(',').map(s => s.trim()).filter(Boolean)
}

function parseBuscaArg(): string | null {
  const idx = process.argv.indexOf('--busca')
  if (idx === -1 || !process.argv[idx + 1]) return null
  return process.argv[idx + 1].trim()
}

async function main() {
  const hoje = hojeIso()
  const numerosFiltro = parseNumerosArg()
  const buscaFiltro = parseBuscaArg()

  const where = {
    data_exclusao_pedido: null,
    ...(numerosFiltro ? { numero_pedido: { in: numerosFiltro } } : {}),
    ...(buscaFiltro ? { numero_pedido: { contains: buscaFiltro, mode: 'insensitive' as const } } : {}),
  }

  const pedidos = await prisma.pedido.findMany({
    where,
    select: {
      id_pedido: true,
      id_organizacao: true,
      numero_pedido: true,
      status_pedido: true,
      valor_total_pedido: true,
      quantidade_total_pedido: true,
      id_workspace: true,
      data_exclusao_pedido: true,
      data_prevista_pedido_pronto: true,
      data_confirmada_pedido_pronto: true,
      data_prevista_inspecao_pedido: true,
      data_confirmada_inspecao_pedido: true,
      data_prevista_coleta_pedido: true,
      data_confirmada_coleta_pedido: true,
      data_previsao_recebimento_rascunho_pedido: true,
      data_confirmacao_recebimento_rascunho_pedido: true,
      data_previsao_aprovacao_rascunho_pedido: true,
      data_confirmacao_aprovacao_rascunho_pedido: true,
      data_previsao_recebimento_rascunho_proforma_pedido: true,
      data_confirmacao_recebimento_rascunho_proforma_pedido: true,
      data_previsao_aprovacao_rascunho_proforma_pedido: true,
      data_confirmacao_aprovacao_rascunho_proforma_pedido: true,
      data_previsao_envio_original_proforma_pedido: true,
      data_confirmacao_envio_original_proforma_pedido: true,
      data_previsao_recebimento_original_proforma_pedido: true,
      data_confirmacao_recebimento_original_proforma_pedido: true,
      data_previsao_recebimento_rascunho_invoice_pedido: true,
      data_confirmacao_recebimento_rascunho_invoice_pedido: true,
      data_previsao_aprovacao_rascunho_invoice_pedido: true,
      data_confirmacao_aprovacao_rascunho_invoice_pedido: true,
      data_previsao_envio_original_invoice_pedido: true,
      data_confirmacao_envio_original_invoice_pedido: true,
      data_previsao_recebimento_original_invoice_pedido: true,
      data_confirmacao_recebimento_original_invoice_pedido: true,
      itens_pedido: {
        select: {
          quantidade_inicial_item: true,
          quantidade_atual_item: true,
          valor_total_item: true,
        },
      },
    },
    orderBy: { numero_pedido: 'asc' },
    take: numerosFiltro ? undefined : 500,
  })

  const detalhes = pedidos.map(p => {
    const atraso = analisarAtraso(p as PedidoDb, hoje)
    const qtdDb = Number(p.quantidade_total_pedido ?? 0)
    const valorDb = Number(p.valor_total_pedido ?? 0)
    const qtdItens = p.itens_pedido.reduce((s, i) => s + Number(i.quantidade_inicial_item ?? 0), 0)
    const valorItens = p.itens_pedido.reduce((s, i) => s + Number(i.valor_total_item ?? 0), 0)

    return {
      numero_pedido: p.numero_pedido,
      id_pedido: p.id_pedido,
      id_organizacao: p.id_organizacao,
      id_workspace: p.id_workspace,
      status: p.status_pedido,
      hoje,
      atrasado_card: atraso.atrasado,
      marcos_vencidos: atraso.marcosVencidos,
      marcos_previstos_preenchidos: atraso.totalMarcosPreenchidos,
      quantidade_total_pedido_db: qtdDb,
      soma_quantidade_inicial_itens: qtdItens,
      divergencia_qtd: Math.abs(qtdDb - qtdItens) > 0.001,
      valor_total_pedido_db: valorDb,
      soma_valor_itens: valorItens,
      divergencia_valor: Math.abs(valorDb - valorItens) > 0.001,
      n_itens: p.itens_pedido.length,
    }
  })

  const pedidosAtrasados = detalhes.filter(d => d.atrasado_card).length
  const qtdTotalAgregada = detalhes.reduce((s, d) => s + d.quantidade_total_pedido_db, 0)
  const valorTotalAgregado = detalhes.reduce((s, d) => s + d.valor_total_pedido_db, 0)

  const relatorio = {
    timestamp: new Date().toISOString(),
    hoje,
    filtro_numeros: numerosFiltro,
    total_analisados: detalhes.length,
    card_pedidos_atrasados: pedidosAtrasados,
    card_qtd_total: qtdTotalAgregada,
    card_valor_total: valorTotalAgregado,
    pedidos: detalhes,
    conclusao_atrasados:
      pedidosAtrasados === 0
        ? detalhes.every(d => d.marcos_previstos_preenchidos === 0)
          ? 'ZERO CORRETO — nenhum pedido tem data prevista preenchida'
          : 'ZERO CORRETO — há datas previstas, mas nenhuma vencida sem confirmação'
        : `${pedidosAtrasados} pedido(s) deveriam aparecer como atrasados no card`,
  }

  // ── stdout legível ──
  console.log('\n═══ Diagnóstico Cards — Pedidos Atrasados ═══\n')
  console.log(`Data de referência (hoje): ${hoje}`)
  console.log(`Pedidos analisados: ${detalhes.length}`)
  console.log(`Card "Pedidos Atrasados" computaria: ${pedidosAtrasados}`)
  console.log(`Conclusão: ${relatorio.conclusao_atrasados}\n`)

  for (const d of detalhes) {
    console.log(`── ${d.numero_pedido} (${d.status}) ──`)
    console.log(`   Atrasado no card: ${d.atrasado_card ? 'SIM' : 'NÃO'}`)
    console.log(`   Marcos previstos preenchidos: ${d.marcos_previstos_preenchidos}`)
    if (d.marcos_vencidos.length > 0) {
      for (const m of d.marcos_vencidos) {
        console.log(`   ⚠ ${m.marco}: prev=${m.prevista} conf=${m.confirmada ?? 'null'}`)
      }
    } else if (d.marcos_previstos_preenchidos === 0) {
      console.log('   (sem nenhuma data prevista no banco)')
    } else {
      console.log('   (datas previstas existem, mas nenhuma vencida sem confirmação)')
    }
    console.log(`   Qtd DB: ${d.quantidade_total_pedido_db} | Soma itens: ${d.soma_quantidade_inicial_itens}${d.divergencia_qtd ? ' ⚠ DIVERGENTE' : ''}`)
    console.log(`   Valor DB: ${d.valor_total_pedido_db} | Soma itens: ${d.soma_valor_itens}${d.divergencia_valor ? ' ⚠ DIVERGENTE' : ''}`)
    console.log('')
  }

  const outDir = path.join(__dirname, 'audit-results')
  fs.mkdirSync(outDir, { recursive: true })
  const outFile = path.join(outDir, `cards-diagnostico-${Date.now()}.json`)
  fs.writeFileSync(outFile, JSON.stringify(relatorio, null, 2), 'utf8')
  console.log(`JSON salvo: ${outFile}\n`)
}

main()
  .catch(err => {
    console.error('Erro no diagnóstico:', err)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
