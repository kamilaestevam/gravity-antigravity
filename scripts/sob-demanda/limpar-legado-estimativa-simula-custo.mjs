#!/usr/bin/env node
/**
 * Remove arquivos legados *estimativa* quando existe par *simula*,
 * ou renomeia quando só o legado existe.
 */
import { readdirSync, statSync, existsSync, renameSync, rmSync } from 'fs'
import { join, dirname, basename } from 'path'
import { fileURLToPath } from 'url'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '../..')

const DIRS = [
  join(ROOT, 'servicos-global/produto/simula-custo'),
  join(ROOT, 'testes/testes-unitarios/produto-gravity/simula-custo'),
  join(ROOT, 'testes/testes-funcionais/produto-gravity/simula-custo'),
]

function targetName(name) {
  return name
    .replace(/estimativas-custo/g, 'simulas-custo')
    .replace(/estimativa-custo/g, 'simula-custo')
    .replace(/EstimativaCusto/g, 'SimulaCusto')
}

function walk(dir, files = []) {
  if (!existsSync(dir)) return files
  for (const name of readdirSync(dir)) {
    const p = join(dir, name)
    if (statSync(p).isDirectory()) {
      if (name === 'node_modules' || name === 'dist') continue
      walk(p, files)
    } else files.push(p)
  }
  return files
}

let deleted = 0
let renamed = 0

for (const dir of DIRS) {
  for (const file of walk(dir)) {
    const name = basename(file)
    if (!/estimativa|Estimativa/i.test(name)) continue
    const newName = targetName(name)
    const newPath = join(dirname(file), newName)
    if (newName === name) continue
    if (existsSync(newPath)) {
      rmSync(file, { force: true })
      deleted++
      console.log('[del]', file.replace(ROOT + '\\', '').replace(ROOT + '/', ''))
    } else {
      renameSync(file, newPath)
      renamed++
      console.log('[ren]', name, '→', newName)
    }
  }
}

// migrations antigas
const mig = join(ROOT, 'servicos-global/produto/simula-custo/prisma/migrations')
if (existsSync(mig)) {
  for (const name of readdirSync(mig)) {
    if (name === 'migration_lock.toml') continue
    const p = join(mig, name)
    if (statSync(p).isDirectory()) {
      rmSync(p, { recursive: true, force: true })
      deleted++
      console.log('[del-mig]', name)
    }
  }
}

console.log(`Done. deleted=${deleted} renamed=${renamed}`)
