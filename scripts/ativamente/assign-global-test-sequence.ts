/**
 * Atribui sequência GLOBAL única (000001..N) a cada plano do registry.
 * Regra: um único número por plano em todo o catálogo — independente de tipo/escopo.
 *
 * Uso:
 *   npx tsx scripts/ativamente/assign-global-test-sequence.ts --dry-run
 *   npx tsx scripts/ativamente/assign-global-test-sequence.ts
 */

import { readFileSync, writeFileSync, readdirSync, statSync, renameSync, existsSync } from 'fs'
import { join, relative, basename, dirname } from 'path'

const ROOT = process.cwd()
const REGISTRY_PATH = join(ROOT, 'testes/test-plans-registry.json')
const DRY_RUN = process.argv.includes('--dry-run')

const SKIP_DIRS = new Set(['node_modules', '.git', 'dist', 'build', '.vite'])
const TEXT_EXT = new Set(['.ts', '.tsx', '.js', '.jsx', '.md', '.json', '.yaml', '.yml', '.cjs', '.mjs'])

interface PlanoEntry {
  id: string
  tipo: string
  escopo: string
  specFile?: string
  specFiles?: string[]
  [key: string]: unknown
}

interface RegistryShape {
  planos: PlanoEntry[]
  deletados?: unknown[]
  [key: string]: unknown
}

function padGlobal(n: number): string {
  return String(n).padStart(6, '0')
}

/** Novo ID mantendo prefixo semântico (tipo/escopo ou EMT legível) + sufixo global. */
export function construirIdPlanoGlobal(plano: PlanoEntry, sequenciaGlobal: number): string {
  const num = padGlobal(sequenciaGlobal)
  if (plano.tipo === 'EMT') {
    const prefixo = plano.id.replace(/-(?:\d{3}|\d{6})$/, '')
    return `${prefixo}-${num}`
  }
  return `TST-${plano.tipo}-${plano.escopo}-${num}`
}

export function extrairSequenciaGlobal(id: string): number | null {
  const m = id.match(/-(\d{6})$/)
  return m ? Number(m[1]) : null
}

export function proximaSequenciaGlobal(registry: RegistryShape): number {
  let max = 0
  for (const p of registry.planos) {
    const n = extrairSequenciaGlobal(p.id)
    if (n !== null && n > max) max = n
  }
  for (const d of registry.deletados ?? []) {
    if (typeof d === 'object' && d !== null && 'id' in d) {
      const n = extrairSequenciaGlobal(String((d as { id: string }).id))
      if (n !== null && n > max) max = n
    }
  }
  return max + 1
}

function shouldSkipPath(file: string): boolean {
  const rel = relative(ROOT, file).replace(/\\/g, '/')
  return (
    rel.includes('servicos-global/configurador/data/test-logs/')
    || rel.includes('assign-global-test-sequence.ts')
    || rel.includes('migrate-legacy-test-ids.ts')
  )
}

function walk(dir: string, out: string[] = []): string[] {
  for (const name of readdirSync(dir)) {
    if (SKIP_DIRS.has(name)) continue
    const full = join(dir, name)
    const st = statSync(full)
    if (st.isDirectory()) walk(full, out)
    else out.push(full)
  }
  return out
}

function main(): void {
  const registry = JSON.parse(readFileSync(REGISTRY_PATH, 'utf-8')) as RegistryShape
  const migration: Record<string, string> = {}

  registry.planos.forEach((plano, idx) => {
    const novo = construirIdPlanoGlobal(plano, idx + 1)
    if (plano.id !== novo) migration[plano.id] = novo
    plano.id = novo
  })

  const sortedOld = Object.keys(migration).sort((a, b) => b.length - a.length)

  console.log(DRY_RUN ? '🔍 dry-run sequência global' : '🔧 aplicando sequência global…')
  console.log(`   Planos: ${registry.planos.length} | Renomeações de ID: ${Object.keys(migration).length}`)

  for (const [oldId, newId] of Object.entries(migration)) {
    console.log(`   ${oldId} → ${newId}`)
  }

  if (!DRY_RUN) {
    writeFileSync(REGISTRY_PATH, `${JSON.stringify(registry, null, 2)}\n`, 'utf-8')
  }

  const renames: Array<{ from: string; to: string }> = []
  for (const [oldId, newId] of Object.entries(migration)) {
    for (const root of [join(ROOT, 'testes')]) {
      if (!existsSync(root)) continue
      for (const file of walk(root)) {
        const name = basename(file)
        if (name.includes(oldId)) {
          renames.push({ from: file, to: join(dirname(file), name.replace(oldId, newId)) })
        }
      }
    }
  }

  let renameCount = 0
  for (const { from, to } of renames) {
    if (!existsSync(from) || existsSync(to)) continue
    console.log(`📁 ${relative(ROOT, from)} → ${relative(ROOT, to)}`)
    if (!DRY_RUN) renameSync(from, to)
    renameCount++
  }

  let fileHits = 0
  let totalReplacements = 0
  const roots = [
    join(ROOT, 'testes'),
    join(ROOT, 'documentos-tecnicos'),
    join(ROOT, 'skills'),
    join(ROOT, 'scripts'),
    join(ROOT, 'servicos-global'),
  ]

  for (const root of roots) {
    if (!existsSync(root)) continue
    for (const file of walk(root)) {
      if (file.replace(/\\/g, '/') === REGISTRY_PATH.replace(/\\/g, '/')) continue
      const ext = file.slice(file.lastIndexOf('.'))
      if (!TEXT_EXT.has(ext) || shouldSkipPath(file)) continue
      let content = readFileSync(file, 'utf-8')
      let hits = 0
      for (const oldId of sortedOld) {
        const newId = migration[oldId]
        const count = content.split(oldId).length - 1
        if (count > 0) {
          content = content.split(oldId).join(newId)
          hits += count
        }
      }
      if (hits > 0) {
        fileHits++
        totalReplacements += hits
        if (!DRY_RUN) writeFileSync(file, content, 'utf-8')
      }
    }
  }

  console.log(`\n✅ Renames: ${renameCount} | Arquivos: ${fileHits} | Substituições: ${totalReplacements}`)
  if (DRY_RUN) console.log('(nenhuma alteração gravada)')
}

main()
