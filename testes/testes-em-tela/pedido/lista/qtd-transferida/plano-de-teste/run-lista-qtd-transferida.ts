/**
 * @deprecated Fundido em run-lista-editar-salvar.ts (ETAPAs 23–26, passos 83–134).
 * Uso legado redireciona ao runner principal:
 */
import { spawnSync } from 'node:child_process'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const runnerPrincipal = resolve(
  dirname(fileURLToPath(import.meta.url)),
  '../../editar-salvar/plano-de-teste/run-lista-editar-salvar.ts',
)

console.warn('[EMT] run-lista-qtd-transferida.ts está obsoleto — executando run-lista-editar-salvar.ts')
const r = spawnSync(process.execPath, ['--import', 'tsx', runnerPrincipal], {
  stdio: 'inherit',
  env: process.env,
  shell: false,
})
process.exit(r.status ?? 1)
