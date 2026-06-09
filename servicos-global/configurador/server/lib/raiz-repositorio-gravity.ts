// server/lib/raiz-repositorio-gravity.ts
// Raiz do repositório via import.meta.url — NÃO usar process.cwd().
// Em dev o cwd costuma ser servicos-global/configurador; em produção (Docker) é /app.
// resolve(cwd, '..', '..') quebra o registry em produção (0 planos no modal).

import { existsSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const serverDir = resolve(dirname(fileURLToPath(import.meta.url)), '..')

/** gravity-antigravity/ (contém testes/, nucleo-global/, servicos-global/) */
export const raizRepositorioGravity = resolve(serverDir, '../../..')

/** servicos-global/configurador/ */
export const configuradorRoot = resolve(serverDir, '..')

export const registryPlanosTestePath = resolve(raizRepositorioGravity, 'testes', 'test-plans-registry.json')

export function candidatosArquivoPlanoTeste(planoFile: string): string[] {
  return [
    resolve(raizRepositorioGravity, planoFile),
    resolve(raizRepositorioGravity, 'testes', planoFile.replace(/^testes\//, '')),
  ]
}

export function resolverArquivoPlanoTeste(planoFile: string): string | null {
  return candidatosArquivoPlanoTeste(planoFile).find(p => existsSync(p)) ?? null
}
