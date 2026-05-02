/**
 * compose-schema.js — Compõe schema.prisma a partir de base + fragment
 * Execução: node prisma/compose-schema.js
 * Skill: antigravity-schema-composition
 */

import { readFileSync, writeFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

const basePath = join(__dirname, 'schema.base.prisma')
const fragmentPath = join(__dirname, 'fragment.prisma')
const outputPath = join(__dirname, 'schema.prisma')

const base = readFileSync(basePath, 'utf-8')
const fragment = readFileSync(fragmentPath, 'utf-8')

const composed = `// ──────────────────────────────────────────────────────────────────────────────
// schema.prisma — ARQUIVO AUTO-GERADO
// NÃO EDITAR MANUALMENTE. Edite schema.base.prisma ou fragment.prisma
// Gerado por: node prisma/compose-schema.js
// ──────────────────────────────────────────────────────────────────────────────

${base}

// ─── Fragment: NF Importacao ──────────────────────────────────────────

${fragment}
`

writeFileSync(outputPath, composed, 'utf-8')
console.log(`[compose] schema.prisma gerado (${composed.split('\n').length} linhas)`)
