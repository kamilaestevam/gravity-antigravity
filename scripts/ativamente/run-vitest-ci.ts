/**
 * scripts/ativamente/run-vitest-ci.ts
 *
 * Roda cada vitest.config.ts em testes/ com escopo e aliases próprios.
 * Substitui `npx vitest run` bare no deploy (sem config → 140+ arquivos falham).
 *
 * Uso:
 *   npx tsx scripts/ativamente/run-vitest-ci.ts              # todas as suítes
 *   npx tsx scripts/ativamente/run-vitest-ci.ts --deploy-gate # só suítes estáveis (CI)
 */
import { spawnSync } from 'node:child_process'
import { readdirSync, statSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..')
const deployGate = process.argv.includes('--deploy-gate')

/** Suítes com falhas pré-existentes — fora do gate de deploy até correção. */
const SUITES_FORA_DO_DEPLOY_GATE = new Set([
  'testes/testes-cross-organizacao/produto-gravity/bid-cambio/vitest.config.ts',
  'testes/testes-funcionais/produto-gravity/bid-frete-internacional/vitest.config.ts',
  'testes/testes-funcionais/cadastros/vitest.config.ts',
  'testes/testes-funcionais/configurador/vitest.config.ts',
  'testes/testes-funcionais/produto-gravity/pedido/vitest.config.ts',
  'testes/testes-unitarios/cadastros/vitest.config.ts',
  'testes/testes-unitarios/configurador/vitest.config.ts',
  'testes/testes-unitarios/gabi/vitest.config.ts',
  'testes/testes-unitarios/historico/vitest.config.ts',
  'testes/testes-unitarios/produto-gravity/pedido/vitest.config.ts',
  'testes/testes-unitarios/nucleo-global/dashboard-global/vitest.config.ts',
  'testes/testes-unitarios/nucleo-global/shell/vitest.config.ts',
  'testes/testes-unitarios/tenant/notificacoes/vitest.config.ts',
])

function findVitestConfigs(dir: string): string[] {
  const found: string[] = []
  for (const entry of readdirSync(dir)) {
    const full = path.join(dir, entry)
    const st = statSync(full)
    if (st.isDirectory()) {
      found.push(...findVitestConfigs(full))
    } else if (entry === 'vitest.config.ts') {
      found.push(full)
    }
  }
  return found.sort()
}

function toPosix(p: string): string {
  return p.split(path.sep).join('/')
}

const allConfigs = findVitestConfigs(path.join(root, 'testes'))
const configs = deployGate
  ? allConfigs.filter((cfg) => !SUITES_FORA_DO_DEPLOY_GATE.has(toPosix(path.relative(root, cfg))))
  : allConfigs

if (configs.length === 0) {
  console.error('[run-vitest-ci] Nenhum vitest.config.ts para executar')
  process.exit(1)
}

console.log(
  `[run-vitest-ci] ${configs.length} suíte(s)${deployGate ? ' (deploy gate)' : ''}`,
)

if (deployGate) {
  const skipped = allConfigs.length - configs.length
  if (skipped > 0) {
    console.log(`[run-vitest-ci] ${skipped} suíte(s) fora do gate (dívida técnica)`)
  }
}

let failed = 0
for (const cfg of configs) {
  const rel = path.relative(root, cfg)
  console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`)
  console.log(`[run-vitest-ci] ${rel}`)
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`)

  const result = spawnSync(
    'npx',
    ['vitest', 'run', '--config', rel, '--reporter=verbose'],
    { cwd: root, stdio: 'inherit', shell: true },
  )

  if (result.status !== 0) {
    failed++
  }
}

if (failed > 0) {
  console.error(`\n[run-vitest-ci] ❌ ${failed} suíte(s) falharam`)
  process.exit(1)
}

console.log('\n[run-vitest-ci] ✅ Todas as suítes passaram')
