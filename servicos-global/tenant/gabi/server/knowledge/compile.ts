/**
 * compile.ts — Compila toda a base de conhecimento da plataforma Gravity
 * em um unico arquivo que a Gabi usa como contexto.
 *
 * Execucao: npx tsx server/knowledge/compile.ts
 * Saida: server/knowledge/gravity-knowledge-base.txt
 */

import fs from 'fs'
import path from 'path'

import { fileURLToPath } from 'url'
const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '../../../../../')
const OUTPUT = path.resolve(__dirname, 'gravity-knowledge-base.txt')

const SOURCES = [
  { dir: path.join(ROOT, 'skills'), label: 'SKILLS' },
  { dir: path.join(ROOT, 'documentos-tecnicos'), label: 'DOCUMENTACAO TECNICA' },
]

function collectMarkdownFiles(dir: string): string[] {
  const results: string[] = []
  if (!fs.existsSync(dir)) return results

  const entries = fs.readdirSync(dir, { withFileTypes: true })
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      results.push(...collectMarkdownFiles(fullPath))
    } else if (entry.name.endsWith('.md')) {
      results.push(fullPath)
    }
  }
  return results.sort()
}

function compile() {
  const sections: string[] = []

  // CLAUDE.md (regras do projeto)
  const claudeMd = path.join(ROOT, 'CLAUDE.md')
  if (fs.existsSync(claudeMd)) {
    sections.push('=' .repeat(80))
    sections.push('SECAO: REGRAS DO PROJETO (CLAUDE.md)')
    sections.push('='.repeat(80))
    sections.push(fs.readFileSync(claudeMd, 'utf-8'))
    sections.push('')
  }

  // Skills e docs
  for (const source of SOURCES) {
    const files = collectMarkdownFiles(source.dir)
    if (files.length === 0) continue

    sections.push('='.repeat(80))
    sections.push(`SECAO: ${source.label} (${files.length} arquivos)`)
    sections.push('='.repeat(80))
    sections.push('')

    for (const file of files) {
      const relativePath = path.relative(ROOT, file)
      const content = fs.readFileSync(file, 'utf-8').trim()
      if (!content) continue

      sections.push('-'.repeat(60))
      sections.push(`ARQUIVO: ${relativePath}`)
      sections.push('-'.repeat(60))
      sections.push(content)
      sections.push('')
    }
  }

  const output = sections.join('\n')
  fs.writeFileSync(OUTPUT, output, 'utf-8')

  const sizeKB = Math.round(output.length / 1024)
  const estimatedTokens = Math.round(output.length / 4) // ~4 chars per token
  console.log(`[COMPILE] Base de conhecimento gerada com sucesso!`)
  console.log(`[COMPILE]   Arquivo: ${OUTPUT}`)
  console.log(`[COMPILE]   Tamanho: ${sizeKB} KB`)
  console.log(`[COMPILE]   Tokens estimados: ~${estimatedTokens.toLocaleString()}`)
  console.log(`[COMPILE]   Limite Gemini 2.0 Flash: 1,000,000 tokens`)
  console.log(`[COMPILE]   Uso: ${((estimatedTokens / 1_000_000) * 100).toFixed(1)}%`)
}

compile()
