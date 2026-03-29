#!/usr/bin/env node
/**
 * compose-schema.js — Processo
 * Compoe o schema.prisma final concatenando schema.base.prisma + fragment.prisma
 * Skill: antigravity-criar-produto (Passo 9)
 * Skill: antigravity-schema-composition
 *
 * Usage: node scripts/compose-schema.js
 */

import { readFileSync, writeFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname  = dirname(__filename)
const prismaDir  = join(__dirname, '..', 'prisma')

const base     = readFileSync(join(prismaDir, 'schema.base.prisma'),  'utf8')
const fragment = readFileSync(join(prismaDir, 'fragment.prisma'),     'utf8')

const composed = [
  '// schema.prisma — GERADO AUTOMATICAMENTE por compose-schema.js',
  '// NAO EDITAR DIRETAMENTE. Edite schema.base.prisma ou fragment.prisma.',
  '',
  base,
  '',
  fragment,
].join('\n')

writeFileSync(join(prismaDir, 'schema.prisma'), composed)
console.log('[compose-schema] schema.prisma gerado com sucesso.')
