/**
 * auditarSeed.ts — Audita a saúde do seed de Pedido no banco
 *
 * Uso:
 *   TENANT_ID=tenant-dev-gravity-2026 npx tsx scripts/auditarSeed.ts
 *
 * Conecta no Postgres via PrismaClient, roda uma bateria de checks e:
 *   - imprime resumo colorido (✅/❌) no stdout
 *   - salva JSON completo em scripts/audit-results/audit-{tenant}-{ts}.json
 *   - exit 0 se todos OK, 1 se qualquer FAIL
 *
 * Referência da fórmula canônica de saldo:
 *   saldo = max(0, quantidade_inicial - cancelada - transferida)
 */

import { PrismaClient } from '@prisma/client'
import * as fs from 'fs'
import * as path from 'path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const prisma = new PrismaClient()

type Check = {
  nome: string
  ok: boolean
  esperado?: unknown
  real?: unknown
  detalhe?: string
}

type Relatorio = {
  timestamp: string
  tenant_id: string
  ok: boolean
  checks: Check[]
  resumo: {
    total_pedidos: number
    total_itens: number
    distribuicoes: {
      perfis: Record<string, number>
      status: Record<string, number>
      tipo_operacao: Record<string, number>
      moedas: Record<string, number>
      incoterms: Record<string, number>
    }
  }
}

// Dicionários esperados (devem bater com o seed.ts)
const STATUS_OK = new Set([
  'rascunho',
  'aberto',
  'em_andamento',
  'aprovado',
  'transferencia',
  'consolidado',
  'cancelado',
])
const MOEDAS_OK = new Set(['USD', 'EUR', 'CNY', 'JPY', 'GBP', 'BRL'])
const UNIDADES_OK = new Set([
  'UNID', 'KG', 'TON', 'M', 'M2', 'M3', 'LT', 'PARES', 'DUZIA', 'JOGO',
])
const INCOTERMS_OK = new Set([
  'FOB', 'CIF', 'EXW', 'CFR', 'FCA', 'DDP', 'DAP', 'CPT', 'CIP', 'DPU', 'FAS',
])
const REGEX_NCM = /^\d{4}\.\d{2}\.\d{2}$/
const REGEX_NUMERO_PEDIDO = /^(PO|SO)-\d{4}-(\d{5}|EDG\d{5})$/
const REGEX_PART_NUMBER = /^PN-\d{5}-\d{3}$/

function n(v: unknown): number {
  if (v === null || v === undefined) return 0
  return typeof v === 'number' ? v : Number(v)
}

// Colors simples (sem dep externa)
const GREEN = '\x1b[32m'
const RED = '\x1b[31m'
const YELLOW = '\x1b[33m'
const RESET = '\x1b[0m'
const BOLD = '\x1b[1m'

async function main(): Promise<void> {
  const tenantId = process.env.TENANT_ID || 'tenant-dev-gravity-2026'
  const ts = new Date().toISOString()
  const checks: Check[] = []

  console.log(`\n${BOLD}🔎 Auditoria do Seed — tenant: ${tenantId}${RESET}\n`)

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = prisma as unknown as Record<string, { findMany: (args: unknown) => Promise<Record<string, unknown>[]> }>
  const pedidos: Record<string, unknown>[] = await db.pedido.findMany({
    where: { tenant_id: tenantId },
  })
  const itens: Record<string, unknown>[] = await db.pedidoItem.findMany({
    where: { tenant_id: tenantId },
  })

  const totalPedidos = pedidos.length
  const totalItens = itens.length

  // ── Distribuições ──────────────────────────────────────────────────────────
  const distPerfis: Record<string, number> = {}
  const distStatus: Record<string, number> = {}
  const distTipo: Record<string, number> = {}
  const distMoedas: Record<string, number> = {}
  const distIncoterms: Record<string, number> = {}

  for (const p of pedidos) {
    const idStr: string = String(p.id || '')
    // pedi_(peq|med|gra|grd|edg)_...
    const m = idStr.match(/^pedi_([a-z]+)_/i)
    const perfil = m ? m[1] : 'desconhecido'
    distPerfis[perfil] = (distPerfis[perfil] || 0) + 1
    distStatus[p.status] = (distStatus[p.status] || 0) + 1
    distTipo[p.tipo_operacao] = (distTipo[p.tipo_operacao] || 0) + 1
    distMoedas[p.moeda_pedido] = (distMoedas[p.moeda_pedido] || 0) + 1
    distIncoterms[p.incoterm] = (distIncoterms[p.incoterm] || 0) + 1
  }

  // Index de itens por pedido
  const itensPorPedido = new Map<string, any[]>()
  for (const it of itens) {
    const arr = itensPorPedido.get(it.pedido_id) || []
    arr.push(it)
    itensPorPedido.set(it.pedido_id, arr)
  }

  // ── 1. total pedidos > 0 ───────────────────────────────────────────────────
  checks.push({
    nome: '01. total de pedidos > 0',
    ok: totalPedidos > 0,
    real: totalPedidos,
  })

  // ── 2. todos pedidos têm pelo menos 1 item ────────────────────────────────
  const pedidosSemItens = pedidos.filter((p) => !itensPorPedido.get(p.id)?.length)
  checks.push({
    nome: '02. todos os pedidos têm pelo menos 1 item',
    ok: pedidosSemItens.length === 0,
    real: pedidosSemItens.length,
    detalhe: pedidosSemItens.length
      ? `ids: ${pedidosSemItens.slice(0, 5).map((p) => p.id).join(', ')}...`
      : undefined,
  })

  // ── 3. saldo == max(0, inicial - cancelada - transferida) ─────────────────
  let saldoErrados = 0
  const saldoErradosAmostra: string[] = []
  for (const it of itens) {
    const esperado = Math.max(
      0,
      n(it.quantidade_inicial_item_pedido) -
        n(it.quantidade_cancelada_item_pedido) -
        n(it.quantidade_transferida_item_pedido),
    )
    const real = n(it.saldo_item_pedido)
    if (Math.abs(real - esperado) > 0.01) {
      saldoErrados++
      if (saldoErradosAmostra.length < 5) saldoErradosAmostra.push(it.id)
    }
  }
  checks.push({
    nome: '03. saldo = max(0, inicial − cancelada − transferida)',
    ok: saldoErrados === 0,
    real: `${saldoErrados} itens com saldo incorreto`,
    detalhe: saldoErrados ? `amostra: ${saldoErradosAmostra.join(', ')}` : undefined,
  })

  // ── 4. saldo >= 0 ─────────────────────────────────────────────────────────
  const saldoNegativo = itens.filter((it) => n(it.saldo_item_pedido) < 0)
  checks.push({
    nome: '04. saldo sempre >= 0',
    ok: saldoNegativo.length === 0,
    real: saldoNegativo.length,
  })

  // ── 5. cancelada <= inicial ───────────────────────────────────────────────
  const canceladaExcedeu = itens.filter(
    (it) => n(it.quantidade_cancelada_item_pedido) > n(it.quantidade_inicial_item_pedido) + 1e-6,
  )
  checks.push({
    nome: '05. cancelada <= inicial',
    ok: canceladaExcedeu.length === 0,
    real: canceladaExcedeu.length,
  })

  // ── 6. transferida <= inicial ─────────────────────────────────────────────
  const transferidaExcedeu = itens.filter(
    (it) =>
      n(it.quantidade_transferida_item_pedido) > n(it.quantidade_inicial_item_pedido) + 1e-6,
  )
  checks.push({
    nome: '06. transferida <= inicial',
    ok: transferidaExcedeu.length === 0,
    real: transferidaExcedeu.length,
  })

  // ── 7. status dentro do enum ──────────────────────────────────────────────
  const statusInvalidos = pedidos.filter((p) => !STATUS_OK.has(p.status))
  checks.push({
    nome: '07. status dentro do enum',
    ok: statusInvalidos.length === 0,
    real: statusInvalidos.length,
    esperado: Array.from(STATUS_OK),
    detalhe: statusInvalidos.length
      ? `invalid: ${[...new Set(statusInvalidos.map((p) => p.status))].join(', ')}`
      : undefined,
  })

  // ── 8. moedas no dicionário ───────────────────────────────────────────────
  const moedasInvalidas = [
    ...pedidos.filter((p) => !MOEDAS_OK.has(p.moeda_pedido)),
    ...itens.filter((it) => !MOEDAS_OK.has(it.moeda_item)),
  ]
  checks.push({
    nome: '08. moedas no dicionário',
    ok: moedasInvalidas.length === 0,
    real: moedasInvalidas.length,
    esperado: Array.from(MOEDAS_OK),
  })

  // ── 9. incoterms no dicionário ────────────────────────────────────────────
  const incotermsInvalidos = [
    ...pedidos.filter((p) => !INCOTERMS_OK.has(p.incoterm)),
    ...itens.filter((it) => !INCOTERMS_OK.has(it.incoterm)),
  ]
  checks.push({
    nome: '09. incoterms no dicionário',
    ok: incotermsInvalidos.length === 0,
    real: incotermsInvalidos.length,
    esperado: Array.from(INCOTERMS_OK),
  })

  // ── 10. unidades no dicionário ────────────────────────────────────────────
  const unidadesInvalidas = [
    ...pedidos.filter((p) => !UNIDADES_OK.has(p.unidade_comercializada_pedido)),
    ...itens.filter((it) => !UNIDADES_OK.has(it.unidade_comercializada_item)),
  ]
  checks.push({
    nome: '10. unidades no dicionário',
    ok: unidadesInvalidas.length === 0,
    real: unidadesInvalidas.length,
    esperado: Array.from(UNIDADES_OK),
  })

  // ── 11. NCM regex ─────────────────────────────────────────────────────────
  const ncmInvalidos = itens.filter((it) => !REGEX_NCM.test(String(it.ncm || '')))
  checks.push({
    nome: '11. NCM bate \\d{4}.\\d{2}.\\d{2}',
    ok: ncmInvalidos.length === 0,
    real: ncmInvalidos.length,
  })

  // ── 12. numero_pedido regex ───────────────────────────────────────────────
  const numeroInvalidos = pedidos.filter(
    (p) => !REGEX_NUMERO_PEDIDO.test(String(p.numero_pedido || '')),
  )
  checks.push({
    nome: '12. numero_pedido bate (PO|SO)-YYYY-NNNNN',
    ok: numeroInvalidos.length === 0,
    real: numeroInvalidos.length,
    detalhe: numeroInvalidos.length
      ? `amostra: ${numeroInvalidos.slice(0, 3).map((p) => p.numero_pedido).join(', ')}`
      : undefined,
  })

  // ── 13. part_number regex ─────────────────────────────────────────────────
  const partInvalidos = itens.filter((it) => !REGEX_PART_NUMBER.test(String(it.part_number || '')))
  checks.push({
    nome: '13. part_number bate PN-\\d{5}-\\d{3}',
    ok: partInvalidos.length === 0,
    real: partInvalidos.length,
  })

  // ── 14. distribuição de perfis ────────────────────────────────────────────
  checks.push({
    nome: '14. distribuição de perfis registrada',
    ok: Object.keys(distPerfis).length > 0,
    real: distPerfis,
  })

  // ── 15. distribuição de status ────────────────────────────────────────────
  checks.push({
    nome: '15. distribuição de status registrada',
    ok: Object.keys(distStatus).length > 0,
    real: distStatus,
  })

  // ── 16. importacao tem itens com nome_exportador preenchido ───────────────
  const pedidosImp = pedidos.filter((p) => p.tipo_operacao === 'importacao')
  const impSemExp = pedidosImp.filter((p) => {
    const its = itensPorPedido.get(p.id) || []
    return its.some((it) => !it.nome_exportador)
  })
  checks.push({
    nome: '16. importacao -> itens com nome_exportador preenchido',
    ok: impSemExp.length === 0,
    real: impSemExp.length,
    detalhe: `${pedidosImp.length} pedidos de importação verificados`,
  })

  // ── 17. exportacao tem itens com nome_importador preenchido ───────────────
  const pedidosExp = pedidos.filter((p) => p.tipo_operacao === 'exportacao')
  const expSemImp = pedidosExp.filter((p) => {
    const its = itensPorPedido.get(p.id) || []
    return its.some((it) => !it.nome_importador)
  })
  checks.push({
    nome: '17. exportacao -> itens com nome_importador preenchido',
    ok: expSemImp.length === 0,
    real: expSemImp.length,
    detalhe: `${pedidosExp.length} pedidos de exportação verificados`,
  })

  // ── 18. valor_total_pedido bate soma de itens ────────────────────────────
  let valorErrados = 0
  for (const p of pedidos) {
    const its = itensPorPedido.get(p.id) || []
    const soma = its.reduce((s, it) => s + n(it.valor_total_itens), 0)
    if (Math.abs(n(p.valor_total_pedido) - soma) > 0.05) valorErrados++
  }
  checks.push({
    nome: '18. valor_total_pedido bate com soma de itens (tol 0.05)',
    ok: valorErrados === 0,
    real: valorErrados,
  })

  // ── 19. quantidade_total_inicial bate soma ───────────────────────────────
  let qtdErrados = 0
  for (const p of pedidos) {
    const its = itensPorPedido.get(p.id) || []
    const soma = its.reduce((s, it) => s + n(it.quantidade_inicial_item_pedido), 0)
    if (Math.abs(n(p.quantidade_total_inicial_pedido) - soma) > 0.05) qtdErrados++
  }
  checks.push({
    nome: '19. quantidade_total_inicial bate com soma (tol 0.05)',
    ok: qtdErrados === 0,
    real: qtdErrados,
  })

  // ── 20. range de datas (relata, não trava) ────────────────────────────────
  const datas = pedidos
    .map((p) => (p.data_emissao_pedido ? new Date(p.data_emissao_pedido).getTime() : null))
    .filter((x): x is number => x !== null)
  let rangeDias: number | null = null
  if (datas.length > 0) {
    const min = Math.min(...datas)
    const max = Math.max(...datas)
    rangeDias = Math.round((max - min) / (1000 * 60 * 60 * 24))
  }
  checks.push({
    nome: '20. range de datas (informativo)',
    ok: true,
    real: rangeDias !== null ? `${rangeDias} dias` : 'sem datas',
  })

  // ── 21. >=5 pedidos com saldo total == 0 (cancelados/transferidos) ────────
  const pedidosSaldoZero = pedidos.filter((p) => {
    const its = itensPorPedido.get(p.id) || []
    if (its.length === 0) return false
    return its.every((it) => n(it.saldo_item_pedido) === 0)
  })
  checks.push({
    nome: '21. >=5 pedidos com saldo total zerado (edge cancelado/transferido)',
    ok: pedidosSaldoZero.length >= 5,
    real: pedidosSaldoZero.length,
    esperado: '>= 5',
  })

  // ── 22. >=5 pedidos virgens (transferida=0 e cancelada=0 em todos) ───────
  const pedidosVirgens = pedidos.filter((p) => {
    const its = itensPorPedido.get(p.id) || []
    if (its.length === 0) return false
    return its.every(
      (it) =>
        n(it.quantidade_cancelada_item_pedido) === 0 &&
        n(it.quantidade_transferida_item_pedido) === 0,
    )
  })
  checks.push({
    nome: '22. >=5 pedidos virgens (cancelada=0, transferida=0)',
    ok: pedidosVirgens.length >= 5,
    real: pedidosVirgens.length,
    esperado: '>= 5',
  })

  // ── Resultado final ───────────────────────────────────────────────────────
  const ok = checks.every((c) => c.ok)

  const relatorio: Relatorio = {
    timestamp: ts,
    tenant_id: tenantId,
    ok,
    checks,
    resumo: {
      total_pedidos: totalPedidos,
      total_itens: totalItens,
      distribuicoes: {
        perfis: distPerfis,
        status: distStatus,
        tipo_operacao: distTipo,
        moedas: distMoedas,
        incoterms: distIncoterms,
      },
    },
  }

  // Imprime no stdout
  for (const c of checks) {
    const mark = c.ok ? `${GREEN}✅${RESET}` : `${RED}❌${RESET}`
    const realStr =
      c.real !== undefined && typeof c.real !== 'object'
        ? ` — ${String(c.real)}`
        : ''
    console.log(`${mark} ${c.nome}${realStr}`)
    if (!c.ok && c.detalhe) console.log(`   ${YELLOW}${c.detalhe}${RESET}`)
  }
  console.log(
    `\n${BOLD}Resumo:${RESET} ${totalPedidos} pedidos, ${totalItens} itens — ${
      ok ? `${GREEN}OK${RESET}` : `${RED}FAIL${RESET}`
    }`,
  )

  // Salva arquivo JSON
  const dir = path.join(__dirname, 'audit-results')
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
  const slugTs = ts.replace(/[:.]/g, '-')
  const filename = `audit-${tenantId}-${slugTs}.json`
  const full = path.join(dir, filename)
  fs.writeFileSync(full, JSON.stringify(relatorio, null, 2), 'utf-8')
  console.log(`📄 Relatório salvo em: ${full}\n`)

  await prisma.$disconnect()
  process.exit(ok ? 0 : 1)
}

main().catch(async (e) => {
  console.error('❌ Erro no audit:', e)
  await prisma.$disconnect()
  process.exit(1)
})
