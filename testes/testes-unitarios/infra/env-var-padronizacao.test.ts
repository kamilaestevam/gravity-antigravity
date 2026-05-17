/**
 * Teste de lint: garante que nomes legados de env var S2S
 * não reapareçam no código-fonte do monorepo.
 *
 * Nomes canônicos (únicos permitidos):
 *   - CHAVE_INTERNA_SERVICO       (backend)
 *   - VITE_CHAVE_INTERNA_SERVICO  (frontend Vite)
 *
 * Nomes proibidos (legados):
 *   - INTERNAL_SERVICE_KEY / VITE_INTERNAL_SERVICE_KEY
 *   - CHAVE_SERVICO_INTERNO  (typo DDD)
 */
import { describe, it, expect } from 'vitest'
import { execSync } from 'node:child_process'
import path from 'node:path'

const ROOT = path.resolve(import.meta.dirname, '../../..')

const NOMES_PROIBIDOS = [
  'INTERNAL_SERVICE_KEY',
  'VITE_INTERNAL_SERVICE_KEY',
  'CHAVE_SERVICO_INTERNO',
]

const EXCLUSOES = [
  '--exclude-dir=node_modules',
  '--exclude-dir=.git',
  '--exclude-dir=resultados',
  '--exclude=env-var-padronizacao.test.ts',
  '--exclude=_gerar_template_teste.ts',
]

function grepLegado(pattern: string): string[] {
  try {
    const stdout = execSync(
      `grep -rl "${pattern}" . ${EXCLUSOES.join(' ')}`,
      { cwd: ROOT, encoding: 'utf-8', timeout: 30_000, stdio: ['pipe', 'pipe', 'pipe'] },
    )
    return stdout.trim().split('\n').filter(Boolean)
  } catch {
    return []
  }
}

describe('Padronização env var S2S', () => {
  for (const nome of NOMES_PROIBIDOS) {
    it(`zero ocorrências de ${nome} no monorepo`, () => {
      const arquivos = grepLegado(nome)
      expect(arquivos, `Arquivos com nome legado "${nome}":\n${arquivos.join('\n')}`).toHaveLength(0)
    })
  }
})
