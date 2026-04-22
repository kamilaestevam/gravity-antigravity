/**
 * scripts/ativamente/validate-testes.ts
 * --------------------------
 * Roda todos os validators do sistema de testes em sequência.
 * Falha o CI se qualquer um falhar.
 *
 * Uso:
 *   npx tsx scripts/ativamente/validate-testes.ts
 */

import { spawnSync } from 'child_process'
import { join } from 'path'

const validators = [
  { nome: 'IDs',       script: 'validate-test-ids.ts' },
  { nome: 'Cobertura', script: 'validate-cobertura.ts' },
]

let failed = 0

console.log('\n🧪 Validando sistema de testes do Gravity\n')

for (const { nome, script } of validators) {
  console.log(`\n━━━ ${nome} ━━━`)
  const result = spawnSync('npx', ['tsx', join('scripts', script)], {
    stdio: 'inherit',
    shell: true,
  })
  if (result.status !== 0) {
    failed++
  }
}

if (failed > 0) {
  console.error(`\n❌ ${failed} validator(es) falharam\n`)
  process.exit(1)
}

console.log('\n✅ Todos os validators passaram\n')
process.exit(0)
