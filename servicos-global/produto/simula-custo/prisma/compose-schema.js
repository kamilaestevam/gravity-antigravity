#!/usr/bin/env node
/**
 * compose-schema.js — SimulaCusto
 * Compõe o schema.prisma final concatenando schema.base.prisma + fragment.prisma
 * Localização canônica: servicos-global/produto/simula-custo/prisma/
 * Skill: antigravity-criar-produto (Passo 9)
 * Skill: antigravity-schema-composition
 *
 * Usage: node prisma/compose-schema.js
 */

import { readFileSync, writeFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname  = dirname(__filename)

const base     = readFileSync(join(__dirname, 'schema.base.prisma'), 'utf8')
const fragment = readFileSync(join(__dirname, 'fragment.prisma'),    'utf8')

const composed = [
  '// schema.prisma — GERADO AUTOMATICAMENTE por compose-schema.js',
  '// NÃO EDITAR DIRETAMENTE. Edite schema.base.prisma ou fragment.prisma.',
  '',
  base,
  '',
  fragment,
].join('\n')

writeFileSync(join(__dirname, 'schema.prisma'), composed)
console.log('[compose-schema] ✅ schema.prisma gerado com sucesso.')
