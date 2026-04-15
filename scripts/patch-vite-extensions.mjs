#!/usr/bin/env node
/**
 * patch-vite-extensions.mjs
 *
 * Aplica `resolve.extensions` com .ts/.tsx antes de .js em todos os
 * vite.config.ts do monorepo. Idempotente — pula arquivos que ja tem.
 *
 * Motivo: o default do Vite e ['.mjs', '.js', '.mts', '.ts', '.jsx', '.tsx', '.json'],
 * que faz artefatos .js stale vencerem o .tsx fonte, quebrando refactors
 * silenciosamente (caso UsuarioGlobal.js / dea06fd). Este override garante
 * que fonte TypeScript sempre ganha.
 *
 * Uso: node scripts/patch-vite-extensions.mjs
 */

import { readFileSync, writeFileSync } from 'fs'
import { execSync } from 'child_process'
import path from 'path'

const EXTENSIONS_LINE = `    extensions: ['.mjs', '.ts', '.tsx', '.mts', '.jsx', '.js', '.json'],`
const EXTENSIONS_COMMENT = `    // Prioriza source (.ts/.tsx) sobre compilados (.js) para evitar version skew\n    // com artefatos stale em nucleo-global (ver commit 6d6eeda).`

function findViteConfigs() {
  const out = execSync(
    `find . -name "vite.config.ts" -not -path "*/node_modules/*" -not -path "*/.claude/*"`,
    { encoding: 'utf8' }
  )
  return out.trim().split('\n').filter(Boolean).sort()
}

function patchFile(file) {
  const content = readFileSync(file, 'utf8')

  // Se ja tem extensions dentro de resolve, pula
  if (/resolve\s*:\s*\{[^}]*extensions\s*:/s.test(content)) {
    return { file, status: 'skip-already-has' }
  }

  // Procura `resolve: {` e injeta logo depois
  const match = content.match(/(\s*)resolve\s*:\s*\{\s*\n/)
  if (!match) {
    return { file, status: 'skip-no-resolve' }
  }

  const insertPos = match.index + match[0].length
  const patched =
    content.slice(0, insertPos) +
    `${EXTENSIONS_COMMENT}\n${EXTENSIONS_LINE}\n` +
    content.slice(insertPos)

  writeFileSync(file, patched)
  return { file, status: 'patched' }
}

const files = findViteConfigs()
console.log(`Encontrados ${files.length} vite.config.ts\n`)

const results = files.map(patchFile)
const patched = results.filter(r => r.status === 'patched')
const skipped = results.filter(r => r.status !== 'patched')

console.log(`✓ ${patched.length} arquivos modificados:`)
patched.forEach(r => console.log(`  ${r.file}`))

if (skipped.length) {
  console.log(`\n- ${skipped.length} pulados:`)
  skipped.forEach(r => console.log(`  ${r.file} (${r.status})`))
}
