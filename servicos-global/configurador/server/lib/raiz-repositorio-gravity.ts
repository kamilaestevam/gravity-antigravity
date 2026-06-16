// server/lib/raiz-repositorio-gravity.ts
// Raiz do repositório via import.meta.url — NÃO usar process.cwd().
// Em dev o cwd costuma ser servicos-global/configurador; em produção (Docker) é /app.
// resolve(cwd, '..', '..') quebra o registry em produção (0 planos no modal).

import { existsSync } from 'node:fs'
import { dirname, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const serverDir = resolve(dirname(fileURLToPath(import.meta.url)), '..')

/** gravity-antigravity/ (contém testes/, nucleo-global/, servicos-global/) */
export const raizRepositorioGravity = resolve(serverDir, '../../..')

/** servicos-global/configurador/ */
export const configuradorRoot = resolve(serverDir, '..')

export const registryPlanosTestePath = resolve(raizRepositorioGravity, 'testes', 'test-plans-registry.json')

/**
 * SSOT — paths do registry (planoFile/specFile) são relativos à pasta testes/ na raiz do monorepo.
 * Aceita legado com prefixo testes/ duplicado (ex.: testes/testes-em-tela/...).
 */
export function normalizarRelPathTestes(relPath: string): string {
  return relPath.trim().replace(/\\/g, '/').replace(/^testes\//, '')
}

export function candidatosArquivoEmTestes(relPath: string): string[] {
  const slash = relPath.trim().replace(/\\/g, '/')
  if (!slash) return []
  const semPrefixo = normalizarRelPathTestes(slash)
  const candidatos = [resolve(raizRepositorioGravity, 'testes', semPrefixo)]
  if (slash !== semPrefixo) candidatos.push(resolve(raizRepositorioGravity, slash))
  if (semPrefixo !== slash) candidatos.push(resolve(raizRepositorioGravity, semPrefixo))
  return [...new Set(candidatos)]
}

export function resolverArquivoEmTestes(relPath: string): string | null {
  return candidatosArquivoEmTestes(relPath).find(p => existsSync(p)) ?? null
}

/** Caminho relativo à raiz do monorepo — usar em spawn tsx/playwright. */
export function relPathArquivoTesteNoMonorepo(relPath: string): string | null {
  const abs = resolverArquivoEmTestes(relPath)
  if (!abs) return null
  return relative(raizRepositorioGravity, abs).replace(/\\/g, '/')
}

export function candidatosArquivoPlanoTeste(planoFile: string): string[] {
  return candidatosArquivoEmTestes(planoFile)
}

export function resolverArquivoPlanoTeste(planoFile: string): string | null {
  return resolverArquivoEmTestes(planoFile)
}
