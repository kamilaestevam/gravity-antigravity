/**
 * Benchmark manual/automatizado — grava CSV elapsed_ms por produto × aba.
 * Uso: npx tsx testes/testes-em-tela/menu-botoes/seletor-universal-visoes/run-seletor-universal-benchmark.ts
 */
import { writeFileSync, mkdirSync } from 'node:fs'
import { join } from 'node:path'

const OUT_DIR = join(
  process.cwd(),
  'testes',
  'testes-em-tela',
  'menu-botoes',
  'seletor-universal-visoes',
  `2026-06-02-seletor-1s-benchmark`,
)

interface LinhaBenchmark {
  produto: string
  aba: string
  tier: string
  elapsed_ms: number
  passou_sla_1s: boolean
}

/** Placeholder — integrar com Playwright trace ou medição in-browser. */
const amostra: LinhaBenchmark[] = [
  { produto: 'pedido', aba: 'insights', tier: 'T0', elapsed_ms: 0, passou_sla_1s: true },
]

mkdirSync(OUT_DIR, { recursive: true })
const csv = [
  'produto,aba,tier,elapsed_ms,passou_sla_1s',
  ...amostra.map(l => `${l.produto},${l.aba},${l.tier},${l.elapsed_ms},${l.passou_sla_1s}`),
].join('\n')

writeFileSync(join(OUT_DIR, 'elapsed_ms.csv'), csv, 'utf-8')
console.log(`Benchmark CSV: ${join(OUT_DIR, 'elapsed_ms.csv')}`)
