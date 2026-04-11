/**
 * scripts/check-deps.ts
 *
 * Verifica regras do monorepo em arquivos package.json alterados.
 * Usado pelo lint-staged no pre-commit e pelo CI em PRs.
 *
 * Regras verificadas:
 * 1. Nenhum package.json sem "name"
 * 2. Nenhum package.json sem "type": "module" (exceto raiz e generated)
 * 3. Versões travadas nos overrides não são violadas
 * 4. Nenhum "require()" em arquivos .ts/.tsx
 * 5. Nenhum @ts-ignore
 * 6. Nenhum "any" explícito
 *
 * Uso:
 *   npx tsx scripts/check-deps.ts                    # verifica todos os package.json
 *   npx tsx scripts/check-deps.ts path/package.json   # verifica arquivos específicos
 */

import { readFileSync, existsSync } from 'fs'
import { resolve, relative } from 'path'
import { execSync } from 'child_process'

const ROOT = resolve(import.meta.dirname, '..')
const errors: string[] = []

// Versões travadas (devem bater com overrides do package.json raiz)
const LOCKED_VERSIONS: Record<string, string> = {
  react: '^18.3.0',
  'react-dom': '^18.3.0',
  i18next: '^26.0.1',
  'react-i18next': '^17.0.1',
  zustand: '^5.0.12',
  '@prisma/client': '^5.22.0',
  express: '^4.19.0',
  vite: '^5.4.21',
  typescript: '^5.4.0',
}

// Arquivos a ignorar
const IGNORE_PATHS = [
  'node_modules',
  'generated',
  'demo',
  '.claude',
]

function shouldIgnore(filePath: string): boolean {
  return IGNORE_PATHS.some((p) => filePath.includes(p))
}

function checkPackageJson(filePath: string): void {
  if (shouldIgnore(filePath)) return

  const absPath = resolve(ROOT, filePath)
  if (!existsSync(absPath)) return

  const rel = relative(ROOT, absPath)
  let pkg: Record<string, unknown>

  try {
    // Remove BOM if present
    const raw = readFileSync(absPath, 'utf-8').replace(/^\uFEFF/, '')
    pkg = JSON.parse(raw)
  } catch {
    errors.push(`${rel}: JSON parse error`)
    return
  }

  // Skip pure workspace wrappers (only have workspaces + scripts, no src code)
  const isWorkspaceWrapper = Boolean(pkg.workspaces) && !pkg.dependencies && !pkg.devDependencies
  if (isWorkspaceWrapper) return

  // Regra 1: name obrigatório (exceto raiz)
  if (rel !== 'package.json' && !pkg.name) {
    errors.push(`${rel}: missing "name" field`)
  }

  // Regra 2: type: "module" obrigatório (exceto raiz, scripts, e componentes sem deps)
  const isLeafComponent = !pkg.dependencies && !pkg.devDependencies && !pkg.scripts
  if (rel !== 'package.json' && rel !== 'scripts\\package.json' && rel !== 'scripts/package.json' && !isLeafComponent) {
    if (pkg.type !== 'module') {
      errors.push(`${rel}: missing "type": "module" (has "${pkg.type || 'undefined'}")`)
    }
  }

  // Regra 3: Versões travadas
  const deps = (pkg.dependencies ?? {}) as Record<string, string>
  const devDeps = (pkg.devDependencies ?? {}) as Record<string, string>
  const allDeps = { ...deps, ...devDeps }

  for (const [lib, lockedVersion] of Object.entries(LOCKED_VERSIONS)) {
    const installedRange = allDeps[lib]
    if (!installedRange) continue

    // Extrair major version do range
    const lockedMajor = lockedVersion.replace(/[\^~>=<\s]/g, '').split('.')[0]
    const installedMajor = installedRange.replace(/[\^~>=<\s]/g, '').split('.')[0]

    if (lockedMajor !== installedMajor) {
      errors.push(
        `${rel}: ${lib}@${installedRange} conflicts with locked version ${lockedVersion} (major version mismatch)`,
      )
    }
  }
}

function checkTypeScriptFile(filePath: string): void {
  if (shouldIgnore(filePath)) return

  const absPath = resolve(ROOT, filePath)
  if (!existsSync(absPath)) return

  const rel = relative(ROOT, absPath)
  const content = readFileSync(absPath, 'utf-8')
  const lines = content.split('\n')

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const lineNum = i + 1

    // Regra 4: Nenhum require()
    if (/\brequire\s*\(/.test(line) && !/\/\//.test(line.split('require')[0])) {
      errors.push(`${rel}:${lineNum}: require() found — use import/export`)
    }

    // Regra 5: Nenhum @ts-ignore
    if (/@ts-ignore/.test(line)) {
      errors.push(`${rel}:${lineNum}: @ts-ignore found — fix the type error instead`)
    }

    // Regra 6: Nenhum "any" explícito (skip comments)
    if (/:\s*any\b/.test(line) && !/\/\//.test(line.split(':')[0])) {
      errors.push(`${rel}:${lineNum}: explicit "any" type found — define proper type`)
    }
  }
}

// Main
const args = process.argv.slice(2)
let files: string[]

// Modo lint-staged (arquivos específicos) vs CI (só package.json)
const isLintStaged = args.length > 0

if (isLintStaged) {
  // Lint-staged: verifica package.json + TS dos arquivos staged
  files = args
} else {
  // CI/manual: verifica APENAS package.json (TS tem muitos any legados)
  const output = execSync('git ls-files "*.json"', {
    cwd: ROOT,
    encoding: 'utf-8',
  })
  files = output.trim().split('\n').filter((f) => f.endsWith('package.json'))
}

for (const file of files) {
  if (file.endsWith('package.json')) {
    checkPackageJson(file)
  } else if (isLintStaged && (file.endsWith('.ts') || file.endsWith('.tsx'))) {
    // Checks de TS só rodam no lint-staged (arquivos novos/modificados)
    checkTypeScriptFile(file)
  }
}

if (errors.length > 0) {
  console.error('\n❌ Monorepo check failed:\n')
  for (const err of errors) {
    console.error(`  • ${err}`)
  }
  console.error(`\n${errors.length} error(s) found. Fix before committing.\n`)
  process.exit(1)
} else {
  console.log('✅ Monorepo check passed')
}
