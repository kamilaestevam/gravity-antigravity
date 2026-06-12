/**
 * Pacote local — Edição em Massa (5 tipos) em http://localhost:8000
 *
 * Ordem: UNI → FUN → CRO → E2E → EMT
 * Pré-requisito: npm run dev (proxy :8000, pedido :8030)
 */
import { execSync } from 'node:child_process'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../../../../../..')
const env = {
  ...process.env,
  PLAYWRIGHT_BASE_URL: process.env.PLAYWRIGHT_BASE_URL ?? 'http://localhost:8000',
  E2E_CLERK_USER_EMAIL: process.env.E2E_CLERK_USER_EMAIL ?? 'dmmltda@gmail.com',
}

function run(cmd: string, label: string) {
  console.log(`\n═══ ${label} ═══\n`)
  execSync(cmd, { cwd: ROOT, stdio: 'inherit', env })
}

run(
  'npx vitest run testes/testes-unitarios/pedido/lista/edicao-em-massa/plano-de-teste/TST-UNI-EDICAO-EM-MASSA-LISTA-PEDIDO-000108.test.ts',
  'UNI 000108',
)
run(
  'npx vitest run testes/testes-funcionais/pedido/Lista/edicao-em-massa/plano-de-teste/',
  'FUN 000109',
)
run(
  'npx vitest run testes/testes-cross-organizacao/pedido/lista/edicao-em-massa/plano-de-teste/TST-CRO-EDICAO-EM-MASSA-LISTA-PEDIDO-000111.test.ts',
  'CRO 000111',
)
run(
  'npx playwright test testes/testes-e2e/pedido/Lista/edicao-em-massa/plano-de-teste/TST-E2E-EDICAO-EM-MASSA-LISTA-PEDIDO-000110.spec.ts --project=pedido',
  'E2E 000110',
)
run(
  'npx tsx testes/testes-em-tela/pedido/lista/edicao-em-massa/plano-de-teste/run-lista-edicao-em-massa.ts',
  'EMT 000112',
)

console.log('\n✅ Pacote 5 tipos concluído (Local :8000)\n')
