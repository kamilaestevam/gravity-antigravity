/**
 * recalcular-agregados-pedidos.ts — Backfill dos 5 agregados oficiais do Pedido
 *
 * O bug histórico: por anos os endpoints de mutação de PedidoItem (POST/PATCH/
 * DELETE/cancelar/transfer/edição-em-massa) NÃO recalculavam os agregados
 * persistidos no Pedido pai (`valor_total_pedido`, `quantidade_total_pedido`,
 * `peso_liquido_total_pedido`, `peso_bruto_total_pedido`, `cubagem_total_pedido`).
 * Resultado: pedidos com valores armazenados que divergem da soma real dos
 * itens — visível ao usuário como "1 item, total $289k" quando o item vale $1k.
 *
 * Onda A1+A2 introduziu o helper canônico `recalcularAgregadosPedido` plugado
 * em todos os pontos de mutação. Este script ZERA O DÉBITO HISTÓRICO,
 * percorrendo todos os pedidos existentes e reconciliando os 5 agregados.
 *
 * ESCOPO:
 *   - Todos os pedidos de todas as organizações (filtro opcional via --organizacao)
 *   - Soft-deleted (`data_exclusao_pedido != null`) também são processados —
 *     evita inconsistência se o pedido for "restaurado" no futuro
 *
 * MODOS:
 *   --dry-run     : default. Imprime delta, NÃO grava. Salva relatório JSON.
 *   --apply       : grava. Salva snapshot pré-mudança em
 *                   documentos-tecnicos/_meta/backfill-agregados-pedido-{ts}.json
 *                   antes de cada UPDATE (rollback possível).
 *   --organizacao=<id>  : processa só uma organização (piloto)
 *   --batch=<N>   : tamanho do batch via cursor (default 500)
 *
 * USO:
 *   cd servicos-global/produto/pedido && \
 *     npx tsx ../../../scripts/sob-demanda/recalcular-agregados-pedidos.ts --dry-run
 *
 *   cd servicos-global/produto/pedido && \
 *     npx tsx ../../../scripts/sob-demanda/recalcular-agregados-pedidos.ts --apply
 *
 * PERFORMANCE:
 *   Cursor Prisma (não findMany em toda a tabela). Para 100k pedidos em batches
 *   de 500: 200 iterações; cada uma faz 1 SELECT pedido + 1 SELECT itens + 1
 *   UPDATE pedido (no modo --apply). Estimativa: ~3-5 minutos em DB local.
 *
 * SEGURANÇA:
 *   - Mandamento 02 — não toca em schema.prisma
 *   - Isolamento — todos os SELECTs filtram por id_organizacao
 *   - Mandamento 08 — falha alto se algum pedido for inacessível; loga e segue
 */

import dotenv from 'dotenv'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
import { writeFileSync, mkdirSync } from 'node:fs'

// Carrega env igual o pedido server: .env.local da raiz + .env específico
const __dir = dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: resolve(__dir, '../../.env.local') })
dotenv.config({ path: resolve(__dir, '../../servicos-global/produto/pedido/.env') })

// PrismaClient importado APÓS dotenv para garantir que DATABASE_URL está
// presente no momento de instanciar.
// eslint-disable-next-line import/order
import { PrismaClient } from '@prisma/client'
// Helper canônico — única fonte de escrita dos 5 agregados. Usado tanto pelos
// endpoints em runtime quanto pelo apply deste backfill: comportamento
// idêntico, sem duplicação de lógica.
// eslint-disable-next-line import/order
import { recalcularAgregadosPedido } from '../../servicos-global/produto/processos-core/src/services/recalcularAgregadosPedido.js'

interface Args {
  dryRun: boolean
  apply: boolean
  organizacao: string | null
  batch: number
}

function parseArgs(): Args {
  const argv = process.argv.slice(2)
  const args: Args = { dryRun: true, apply: false, organizacao: null, batch: 500 }
  for (const a of argv) {
    if (a === '--dry-run') args.dryRun = true
    else if (a === '--apply') { args.apply = true; args.dryRun = false }
    else if (a.startsWith('--organizacao=')) args.organizacao = a.split('=')[1]
    else if (a.startsWith('--batch=')) args.batch = parseInt(a.split('=')[1], 10) || 500
  }
  return args
}

interface DeltaPedido {
  id_pedido: string
  id_organizacao: string
  numero_pedido: string
  antes: {
    valor_total_pedido:        number | null
    quantidade_total_pedido:   number | null
    peso_liquido_total_pedido: number | null
    peso_bruto_total_pedido:   number | null
    cubagem_total_pedido:      number | null
  }
  depois: {
    // Onda A8: valor_total_pedido e quantidade_total_pedido podem ser null
    // quando moedas/unidades dos itens são heterogêneas.
    valor_total_pedido:        number | null
    quantidade_total_pedido:   number | null
    peso_liquido_total_pedido: number
    peso_bruto_total_pedido:   number
    cubagem_total_pedido:      number
  }
  diff: {
    valor:        number
    quantidade:   number
    peso_liquido: number
    peso_bruto:   number
    cubagem:      number
  }
}

function n(v: unknown): number {
  if (v == null) return 0
  const num = typeof v === 'object' ? Number((v as { toString(): string }).toString()) : Number(v)
  return isNaN(num) ? 0 : num
}

const CASAS_DEFAULT = { valor: 2, quantidade: 2, peso: 3, cubagem: 3 } as const

async function calcularDelta(prisma: PrismaClient, pedido: {
  id_pedido: string
  id_organizacao: string
  numero_pedido: string
  valor_total_pedido:               unknown
  quantidade_total_pedido:          unknown
  peso_liquido_total_pedido:        unknown
  peso_bruto_total_pedido:          unknown
  cubagem_total_pedido:             unknown
  casas_decimais_valor_pedido:      number | null
  casas_decimais_quantidade_pedido: number | null
  casas_decimais_peso_pedido:       number | null
  casas_decimais_cubagem_pedido:    number | null
}): Promise<DeltaPedido> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const itens = await (prisma as any).pedidoItem.findMany({
    where: { id_pedido: pedido.id_pedido, id_organizacao: pedido.id_organizacao },
    select: {
      valor_total_item:            true,
      quantidade_inicial_item:     true,
      peso_liquido_unitario_item:  true,
      peso_bruto_unitario_item:    true,
      cubagem_unitaria_item:       true,
      moeda_item:                  true,
      unidade_comercializada_item: true,
    },
  })

  // Onda A8 — detecta homogeneidade ANTES de somar. Mesma regra do helper.
  const moedasComValor = new Set<string>()
  const unidadesComQty = new Set<string>()
  for (const it of itens as Array<Record<string, unknown>>) {
    if (n(it.valor_total_item) > 0 && typeof it.moeda_item === 'string') {
      moedasComValor.add(it.moeda_item)
    }
    if (n(it.quantidade_inicial_item) > 0 && typeof it.unidade_comercializada_item === 'string') {
      unidadesComQty.add(it.unidade_comercializada_item)
    }
  }
  const valorHomogeneo = moedasComValor.size <= 1
  const qtyHomogenea   = unidadesComQty.size <= 1

  let somaValor = 0, somaQtd = 0, somaPesoLiq = 0, somaPesoBr = 0, somaCubagem = 0
  for (const it of itens as Array<Record<string, unknown>>) {
    const qty = n(it.quantidade_inicial_item)
    somaValor   += n(it.valor_total_item)
    somaQtd     += qty
    somaPesoLiq += n(it.peso_liquido_unitario_item) * qty
    somaPesoBr  += n(it.peso_bruto_unitario_item)   * qty
    somaCubagem += n(it.cubagem_unitaria_item)      * qty
  }

  const cv = pedido.casas_decimais_valor_pedido      ?? CASAS_DEFAULT.valor
  const cq = pedido.casas_decimais_quantidade_pedido ?? CASAS_DEFAULT.quantidade
  const cp = pedido.casas_decimais_peso_pedido       ?? CASAS_DEFAULT.peso
  const cc = pedido.casas_decimais_cubagem_pedido    ?? CASAS_DEFAULT.cubagem

  const novo = {
    valor_total_pedido:        valorHomogeneo ? parseFloat(somaValor.toFixed(cv)) : null as number | null,
    quantidade_total_pedido:   qtyHomogenea   ? parseFloat(somaQtd.toFixed(cq))   : null as number | null,
    peso_liquido_total_pedido: parseFloat(somaPesoLiq.toFixed(cp)),
    peso_bruto_total_pedido:   parseFloat(somaPesoBr.toFixed(cp)),
    cubagem_total_pedido:      parseFloat(somaCubagem.toFixed(cc)),
  }

  const antes = {
    valor_total_pedido:        pedido.valor_total_pedido        != null ? n(pedido.valor_total_pedido)        : null,
    quantidade_total_pedido:   pedido.quantidade_total_pedido   != null ? n(pedido.quantidade_total_pedido)   : null,
    peso_liquido_total_pedido: pedido.peso_liquido_total_pedido != null ? n(pedido.peso_liquido_total_pedido) : null,
    peso_bruto_total_pedido:   pedido.peso_bruto_total_pedido   != null ? n(pedido.peso_bruto_total_pedido)   : null,
    cubagem_total_pedido:      pedido.cubagem_total_pedido      != null ? n(pedido.cubagem_total_pedido)      : null,
  }

  // Diff: distância numérica para campos não-null. Para tracking de transição
  // null→valor ou valor→null usa-se infinito (representa "mudou de natureza").
  const diffEspecial = (a: number | null, b: number | null): number => {
    if (a == null && b == null) return 0
    if (a == null || b == null) return Infinity   // mudou de null↔valor
    return Math.abs(a - b)
  }

  return {
    id_pedido: pedido.id_pedido,
    id_organizacao: pedido.id_organizacao,
    numero_pedido: pedido.numero_pedido,
    antes,
    depois: novo,
    diff: {
      valor:        diffEspecial(antes.valor_total_pedido,        novo.valor_total_pedido),
      quantidade:   diffEspecial(antes.quantidade_total_pedido,   novo.quantidade_total_pedido),
      peso_liquido: Math.abs((antes.peso_liquido_total_pedido ?? 0) - novo.peso_liquido_total_pedido),
      peso_bruto:   Math.abs((antes.peso_bruto_total_pedido   ?? 0) - novo.peso_bruto_total_pedido),
      cubagem:      Math.abs((antes.cubagem_total_pedido      ?? 0) - novo.cubagem_total_pedido),
    },
  }
}

function temDivergencia(d: DeltaPedido, tol = 0.005): boolean {
  // Infinity (null↔valor) sempre passa o threshold.
  return d.diff.valor > tol || d.diff.quantidade > tol ||
         d.diff.peso_liquido > tol || d.diff.peso_bruto > tol || d.diff.cubagem > tol
}

async function main(): Promise<void> {
  const args = parseArgs()

  console.log('━'.repeat(72))
  console.log('Backfill Agregados Pedido — recalcular-agregados-pedidos.ts')
  console.log(`Modo: ${args.apply ? 'APPLY (grava!)' : 'DRY-RUN (só relata)'}`)
  if (args.organizacao) console.log(`Organização: ${args.organizacao}`)
  console.log(`Batch size: ${args.batch}`)
  console.log('━'.repeat(72))

  const prisma = new PrismaClient()
  const inicio = Date.now()

  const deltas: DeltaPedido[] = []
  let processados = 0
  let comDivergencia = 0
  let cursor: { id_pedido: string } | undefined

  // Loop com cursor — não carrega todos os pedidos em RAM
  // eslint-disable-next-line no-constant-condition
  while (true) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const pedidos: Array<any> = await (prisma as any).pedido.findMany({
      where: args.organizacao ? { id_organizacao: args.organizacao } : undefined,
      take: args.batch,
      skip: cursor ? 1 : 0,
      cursor: cursor,
      orderBy: { id_pedido: 'asc' },
      select: {
        id_pedido: true,
        id_organizacao: true,
        numero_pedido: true,
        valor_total_pedido: true,
        quantidade_total_pedido: true,
        peso_liquido_total_pedido: true,
        peso_bruto_total_pedido: true,
        cubagem_total_pedido: true,
        casas_decimais_valor_pedido: true,
        casas_decimais_quantidade_pedido: true,
        casas_decimais_peso_pedido: true,
        casas_decimais_cubagem_pedido: true,
      },
    })

    if (pedidos.length === 0) break

    for (const ped of pedidos) {
      processados++
      const d = await calcularDelta(prisma, ped)
      if (temDivergencia(d)) {
        comDivergencia++
        deltas.push(d)
        console.log(
          `[DIVERG] ${d.numero_pedido} (org=${d.id_organizacao.slice(0, 8)}…) ` +
          `Δvalor=${d.diff.valor.toFixed(2)} Δqty=${d.diff.quantidade.toFixed(2)} ` +
          `Δpeso_liq=${d.diff.peso_liquido.toFixed(3)} Δcubagem=${d.diff.cubagem.toFixed(4)}`,
        )
      }
    }

    cursor = { id_pedido: pedidos[pedidos.length - 1].id_pedido }
  }

  const duracaoMs = Date.now() - inicio

  console.log('━'.repeat(72))
  console.log(`Pedidos processados: ${processados}`)
  console.log(`Com divergência:     ${comDivergencia} (${((comDivergencia / Math.max(processados, 1)) * 100).toFixed(1)}%)`)
  console.log(`Duração:             ${(duracaoMs / 1000).toFixed(1)}s`)
  console.log('━'.repeat(72))

  // Persistir relatório JSON sempre (dry-run e apply)
  const ts = new Date().toISOString().replace(/[:.]/g, '-')
  const dir = resolve(process.cwd(), '../../../documentos-tecnicos/_meta')
  try { mkdirSync(dir, { recursive: true }) } catch { /* ok */ }
  const tipo = args.apply ? 'apply-snapshot' : 'dryrun-relatorio'
  const path = resolve(dir, `backfill-agregados-pedido-${tipo}-${ts}.json`)
  writeFileSync(path, JSON.stringify({
    timestamp: new Date().toISOString(),
    modo: args.apply ? 'apply' : 'dry-run',
    organizacao_filtro: args.organizacao,
    pedidos_processados: processados,
    pedidos_com_divergencia: comDivergencia,
    duracao_ms: duracaoMs,
    deltas,
  }, null, 2), 'utf8')
  console.log(`Relatório salvo: ${path}`)

  // Modo APPLY — gravar correções via helper canônico.
  //
  // Líder Técnico exigiu que o backfill USE o helper, não duplique lógica.
  // Ganhos: SELECT FOR UPDATE (lock pessimista), recalc no momento do apply
  // (não fica preso a delta pré-computado), transação por pedido, falha alta
  // se algo der errado (Mandamento 08). Bate com o lint A6 que mantém helper
  // como única fonte de escrita.
  if (args.apply && deltas.length > 0) {
    console.log('━'.repeat(72))
    console.log(`Aplicando ${deltas.length} correções via helper canônico...`)
    let gravados = 0, falhas = 0
    for (const d of deltas) {
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (prisma as any).$transaction(async (tx: unknown) => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          await recalcularAgregadosPedido(tx as any, d.id_pedido, d.id_organizacao)
        })
        gravados++
      } catch (e) {
        falhas++
        console.error(`[FALHA] ${d.numero_pedido}:`, e instanceof Error ? e.message : e)
      }
    }
    console.log(`Gravados: ${gravados}/${deltas.length}. Falhas: ${falhas}.`)
  }

  await prisma.$disconnect()
}

main().catch((err) => {
  console.error('FATAL:', err)
  process.exit(1)
})
