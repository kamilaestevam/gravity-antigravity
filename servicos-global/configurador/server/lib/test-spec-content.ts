import { existsSync, readFileSync } from 'fs'
import { resolve } from 'path'

const monorepoRoot = resolve(process.cwd(), '..', '..')

/** Lê conteúdo do spec/runner associado a uma entrada de log de teste. */
export function readSpecFileContent(logEntry: Record<string, unknown>): string {
  const module = String(logEntry.module ?? '')
  const testName = String(logEntry.test_name ?? '')

  const registryPath = resolve(monorepoRoot, 'testes', 'test-plans-registry.json')
  try {
    const raw = JSON.parse(readFileSync(registryPath, 'utf-8')) as { planos?: Array<{ id: string; specFile?: string }> }
    const entry = raw.planos?.find(p => p.id === module || p.id === testName)
    if (entry?.specFile) {
      const fromRegistry = resolve(monorepoRoot, entry.specFile)
      if (existsSync(fromRegistry)) {
        return readFileSync(fromRegistry, 'utf-8')
      }
    }
  } catch { /* registry opcional */ }

  const possiblePaths = [
    resolve(monorepoRoot, 'testes', 'testes-e2e', module, `${testName}.spec.ts`),
    resolve(monorepoRoot, 'testes', 'testes-e2e', module.toLowerCase(), `${testName}.spec.ts`),
    resolve(monorepoRoot, 'testes', 'testes-funcionais', module, `${testName}.test.ts`),
    resolve(monorepoRoot, 'testes', 'testes-unitarios', module, `${testName}.test.ts`),
  ]

  for (const p of possiblePaths) {
    if (existsSync(p)) {
      return readFileSync(p, 'utf-8')
    }
  }
  return ''
}
