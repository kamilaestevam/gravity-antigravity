// server/lib/extrator-testids.ts
// Escaneia arquivos .tsx e extrai todos os data-testid via regex
// Gera JSON de mapeamento para uso pelo agente-plano-teste

import { readFileSync, existsSync, mkdirSync, writeFileSync } from 'fs'
import { resolve, dirname } from 'path'
import type { MapeamentoTestids, ElementoMapeado } from './test-schemas.js'

// ─── Tipos internos ─────────────────────────────────────────────────────────

interface TestidExtracao {
  id:       string
  elemento: string
  linha:    number
}

// ─── Regex para extrair data-testid ──────────────────────────────────────────

const TESTID_REGEX = /data-testid=["']([^"']+)["']/g
const TESTID_DYNAMIC_REGEX = /data-testid=\{[`']([^`']*)\$\{[^}]+\}[^`']*[`']\}/g

/**
 * Infere o tipo do elemento baseado no contexto da linha
 */
function inferElementType(line: string): ElementoMapeado['tipo'] {
  const lower = line.toLowerCase()
  if (/<input\b/i.test(line) || /type=["'](text|number|email|password|tel|url|date|time)/i.test(line)) return 'input'
  if (/<textarea\b/i.test(line)) return 'textarea'
  if (/<select\b/i.test(line) || /Select\b/.test(line)) return 'select'
  if (/<button\b/i.test(line) || /Button\b/.test(line) || /onClick/i.test(line)) return 'botao'
  if (/<a\b/i.test(line) || /Link\b/.test(line) || /href=/i.test(line)) return 'link'
  if (/<nav\b/i.test(line) || /Sidebar|Breadcrumb|Nav/i.test(line)) return 'navegacao'
  if (/toast|alert|snackbar|feedback|banner/i.test(lower)) return 'feedback'
  if (/<table\b/i.test(line) || /Table\b/.test(line) || /DataGrid/i.test(line)) return 'tabela'
  if (/<tr\b/i.test(line) || /Row\b/.test(line)) return 'linha'
  if (/<td\b|<th\b/i.test(line) || /Cell\b/.test(line)) return 'celula'
  if (/Modal|Dialog/i.test(line)) return 'modal'
  if (/Tab\b|Tabs\b/i.test(line)) return 'tab'
  if (/Accordion|Collapse|Expand/i.test(line)) return 'accordion'
  return 'outro'
}

/**
 * Extrai label do campo se existir um <label> ou propriedade label= proximo
 */
function extractLabel(lines: string[], lineIndex: number): string | undefined {
  // Procura nas 3 linhas anteriores e na propria linha
  const searchRange = lines.slice(Math.max(0, lineIndex - 3), lineIndex + 1).join('\n')
  const labelMatch = searchRange.match(/label=["']([^"']+)["']/)
    ?? searchRange.match(/<label[^>]*>([^<]+)<\/label>/)
  return labelMatch?.[1]
}

/**
 * Extrai placeholder se existir
 */
function extractPlaceholder(line: string): string | undefined {
  const match = line.match(/placeholder=["']([^"']+)["']/)
  return match?.[1]
}

/**
 * Verifica se o campo e required
 */
function isRequired(line: string): boolean {
  return /\brequired\b/.test(line) || /required=\{true\}/.test(line)
}

// ─── Funcao principal de extracao ────────────────────────────────────────────

/**
 * Escaneia um arquivo .tsx e retorna todos os data-testid encontrados
 */
export function extractTestIds(filePath: string): TestidExtracao[] {
  if (!existsSync(filePath)) {
    throw new Error(`Arquivo nao encontrado: ${filePath}`)
  }

  const content = readFileSync(filePath, 'utf-8')
  const lines = content.split('\n')
  const results: TestidExtracao[] = []
  const seen = new Set<string>()

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    let match: RegExpExecArray | null

    // Reset regex lastIndex
    TESTID_REGEX.lastIndex = 0
    while ((match = TESTID_REGEX.exec(line)) !== null) {
      const id = match[1]
      if (!seen.has(id)) {
        seen.add(id)
        results.push({
          id,
          elemento: inferElementType(line),
          linha: i + 1,
        })
      }
    }
  }

  return results
}

/**
 * Gera o mapeamento completo de testids para um componente
 * e salva em _mapeamentos/<escopo>/<sublocal>.testids.json
 */
export function generateTestidMapping(
  componentFilePath: string,
  escopo: string,
  sublocal: string,
): MapeamentoTestids {
  const absolutePath = resolve(process.cwd(), componentFilePath)
  const extractions = extractTestIds(absolutePath)
  const content = readFileSync(absolutePath, 'utf-8')
  const lines = content.split('\n')

  const elementos: Record<string, ElementoMapeado> = {}
  for (const ext of extractions) {
    const line = lines[ext.linha - 1]
    elementos[ext.id] = {
      testid:      ext.id,
      tipo:        ext.elemento as ElementoMapeado['tipo'],
      descricao:   `${ext.elemento} na linha ${ext.linha}`,
      label:       extractLabel(lines, ext.linha - 1),
      placeholder: extractPlaceholder(line),
      required:    isRequired(line) || undefined,
    }
  }

  const mapping: MapeamentoTestids = {
    componente:  componentFilePath,
    extraidoEm:  new Date().toISOString(),
    elementos,
  }

  // Salva o arquivo de mapeamento
  const outputDir = resolve(process.cwd(), `testes/testes-e2e/${escopo.toLowerCase()}/_mapeamentos`)
  const outputFile = resolve(outputDir, `${sublocal.toLowerCase().replace(/\s+/g, '-')}.testids.json`)

  if (!existsSync(outputDir)) {
    mkdirSync(outputDir, { recursive: true })
  }
  writeFileSync(outputFile, JSON.stringify(mapping, null, 2), 'utf-8')

  return mapping
}

/**
 * Carrega um mapeamento existente de testids
 */
export function loadTestidMapping(escopo: string, sublocal: string): MapeamentoTestids | null {
  const mapFile = resolve(
    process.cwd(),
    `testes/testes-e2e/${escopo.toLowerCase()}/_mapeamentos/${sublocal.toLowerCase().replace(/\s+/g, '-')}.testids.json`,
  )
  if (!existsSync(mapFile)) return null
  return JSON.parse(readFileSync(mapFile, 'utf-8')) as MapeamentoTestids
}
