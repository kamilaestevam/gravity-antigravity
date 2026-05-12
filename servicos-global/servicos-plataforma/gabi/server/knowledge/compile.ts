/**
 * compile.ts — Compila a base de conhecimento da plataforma Gravity
 * filtrando arquivos internos e gerando segmentos por produto/area.
 *
 * Execucao: npx tsx server/knowledge/compile.ts
 * Saida:
 *   - server/knowledge/gravity-knowledge-base.txt (KB filtrada)
 *   - server/knowledge/segments/*.txt (12 segmentos por produto)
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '../../../../../')
const OUTPUT = path.resolve(__dirname, 'gravity-knowledge-base.txt')
const SEGMENTS_DIR = path.resolve(__dirname, 'segments')

// Diretorios internos que NAO devem ir para a KB do usuario final
const EXCLUDED_DIRS = new Set([
  'skills/governanca',
  'skills/dream-team',
  'skills/papeis',
  'skills/processos',
  'skills/arquitetura',
  'skills/seguranca',
  'skills/testes',
  'skills/ux',
  'documentos-tecnicos/_legado',
  'documentos-tecnicos/_meta',
  'documentos-tecnicos/auditoria-skills',
  'documentos-tecnicos/arquitetura',
  'documentos-tecnicos/ddd-atlas',
  'documentos-tecnicos/decisoes-arquiteturais',
  'documentos-tecnicos/governanca',
  'documentos-tecnicos/historico-alteracoes',
  'documentos-tecnicos/operacoes',
  'documentos-tecnicos/processos',
  'documentos-tecnicos/seguranca',
  'documentos-tecnicos/testes',
  'documentos-tecnicos/ux',
  'documentos-tecnicos/produtos-gravity/gabi',
])

interface SegmentConfig {
  label: string
  matchDirs: string[]
}

const SEGMENTS: Record<string, SegmentConfig> = {
  configurador: {
    label: 'Configurador (Auth, Billing, Permissoes, Multi-Workspace)',
    matchDirs: [
      'skills/produtos-gravity/configurador',
      'documentos-tecnicos/produtos-gravity/configurador',
      'documentos-tecnicos/produtos-gravity/cadastros',
    ],
  },
  lpco: {
    label: 'LPCO (Licencas, Permissoes, Certificados e Outros)',
    matchDirs: ['documentos-tecnicos/produtos-gravity/lpco'],
  },
  pedido: {
    label: 'Pedido (Gestao de Pedidos de Importacao/Exportacao)',
    matchDirs: ['documentos-tecnicos/produtos-gravity/pedido'],
  },
  'nf-importacao': {
    label: 'NF Importacao (Nota Fiscal de Importacao)',
    matchDirs: ['documentos-tecnicos/produtos-gravity/nf-importacao'],
  },
  'bid-frete': {
    label: 'Bid Frete (Cotacao de Frete)',
    matchDirs: ['documentos-tecnicos/produtos-gravity/bid-frete'],
  },
  'bid-cambio': {
    label: 'Bid Cambio (Cotacao de Cambio)',
    matchDirs: ['documentos-tecnicos/produtos-gravity/bid-cambio'],
  },
  'financeiro-comex': {
    label: 'Financeiro COMEX',
    matchDirs: ['documentos-tecnicos/produtos-gravity/financeiro-comex'],
  },
  'simula-custo': {
    label: 'SimulaCusto (Simulador de Custos de Importacao)',
    matchDirs: ['documentos-tecnicos/produtos-gravity/simula-custo'],
  },
  processo: {
    label: 'Processo (Processos de Importacao/Exportacao)',
    matchDirs: ['documentos-tecnicos/produtos-gravity/processos-core'],
  },
  dashboard: {
    label: 'Dashboard e Hub',
    matchDirs: [
      'documentos-tecnicos/produtos-gravity/dashboard',
      'documentos-tecnicos/produtos-gravity/hub',
    ],
  },
  marketplace: {
    label: 'Gravity Store (Marketplace)',
    matchDirs: ['skills/produtos-gravity/marketplace'],
  },
  'api-cockpit': {
    label: 'API Cockpit (Tokens, Webhooks, Playground)',
    matchDirs: ['skills/produtos-gravity/api-cockpit'],
  },
}

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

function isExcluded(filePath: string): boolean {
  const rel = path.relative(ROOT, filePath).replace(/\\/g, '/')
  for (const excluded of EXCLUDED_DIRS) {
    if (rel.startsWith(excluded + '/') || rel === excluded) return true
  }
  if (rel === 'CLAUDE.md') return true
  return false
}

function stripFrontmatter(content: string): string {
  if (!content.startsWith('---')) return content
  const endIdx = content.indexOf('---', 3)
  if (endIdx === -1) return content
  return content.slice(endIdx + 3).trim()
}

function formatFileContent(relativePath: string, content: string): string {
  const cleaned = stripFrontmatter(content.trim())
  if (!cleaned) return ''
  return `--- ${relativePath} ---\n${cleaned}\n`
}

function compile() {
  const allContent: string[] = []
  const segmentContent: Record<string, string[]> = {}
  for (const key of Object.keys(SEGMENTS)) {
    segmentContent[key] = []
  }

  let included = 0
  let excluded = 0

  for (const source of SOURCES) {
    const files = collectMarkdownFiles(source.dir)
    for (const file of files) {
      if (isExcluded(file)) {
        excluded++
        continue
      }
      included++

      const relativePath = path.relative(ROOT, file).replace(/\\/g, '/')
      const raw = fs.readFileSync(file, 'utf-8')
      const formatted = formatFileContent(relativePath, raw)
      if (!formatted) continue

      allContent.push(formatted)

      for (const [segKey, segConfig] of Object.entries(SEGMENTS)) {
        if (segConfig.matchDirs.some((d) => relativePath.startsWith(d))) {
          segmentContent[segKey].push(formatted)
        }
      }
    }
  }

  // Gerar KB completa filtrada
  const output = allContent.join('\n')
  fs.writeFileSync(OUTPUT, output, 'utf-8')

  // Gerar segmentos
  if (!fs.existsSync(SEGMENTS_DIR)) fs.mkdirSync(SEGMENTS_DIR, { recursive: true })
  for (const [segKey, segConfig] of Object.entries(SEGMENTS)) {
    const content = segmentContent[segKey]
    if (content.length === 0) continue
    const segOutput = `=== ${segConfig.label} ===\n\n${content.join('\n')}`
    fs.writeFileSync(path.join(SEGMENTS_DIR, `${segKey}.txt`), segOutput, 'utf-8')
  }

  const sizeKB = Math.round(output.length / 1024)
  const estimatedTokens = Math.round(output.length / 4)
  const segCount = Object.values(segmentContent).filter((c) => c.length > 0).length

  console.log(`[COMPILE] Base de conhecimento gerada!`)
  console.log(`[COMPILE]   Incluidos: ${included} arquivos | Excluidos: ${excluded} arquivos`)
  console.log(`[COMPILE]   KB: ${sizeKB} KB (~${estimatedTokens.toLocaleString()} tokens)`)
  console.log(`[COMPILE]   Segmentos: ${segCount}`)
  for (const [segKey, content] of Object.entries(segmentContent)) {
    if (content.length === 0) continue
    const segSize = content.join('\n').length
    console.log(`[COMPILE]     ${segKey}: ${content.length} files, ~${Math.round(segSize / 4).toLocaleString()} tokens`)
  }
}

compile()
