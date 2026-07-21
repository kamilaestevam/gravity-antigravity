#!/usr/bin/env node
/**
 * Auditoria anti-legado: falha (exit 1) se encontrar nomenclatura estimativa_custo
 * no escopo do produto simula-custo e integrações diretas.
 *
 * Uso: node scripts/sob-demanda/auditar-legado-estimativa-simula-custo.mjs
 */
import { readFileSync, readdirSync, statSync, existsSync } from 'fs'
import { join, dirname, relative } from 'path'
import { fileURLToPath } from 'url'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '../..')

const SCAN_ROOTS = [
  'servicos-global/produto/simula-custo',
  'testes/testes-unitarios/produto-gravity/simula-custo',
  'testes/testes-funcionais/produto-gravity/simula-custo',
  'documentos-tecnicos/ddd-atlas/simula-custo',
  'servicos-global/servicos-plataforma/dashboard/server/lib/catalog.ts',
  'servicos-global/servicos-plataforma/dashboard/server/lib/widget-registry.ts',
  'servicos-global/configurador/server/services/lgpd-service.ts',
  'servicos-global/servicos-plataforma/gabi/server/knowledge/segments/simula-custo.txt',
]

const SKIP_DIRS = new Set(['node_modules', 'dist', '.git'])
const SKIP_FILE = /rename-estimativa|limpar-legado|auditar-legado|corrigir-integracao/

const PATTERNS = [
  { re: /estimativa[_-]?custo/i, label: 'estimativa_custo' },
  { re: /estimativas[_-]?custo/i, label: 'estimativas_custo' },
  { re: /EstimativaCusto/, label: 'EstimativaCusto' },
  { re: /estimativaCusto/, label: 'estimativaCusto' },
  { re: /\/estimativas(?:\/|-custo)/, label: 'rota /estimativas' },
  { re: /simulacusto\.estimativas\./, label: 'i18n simulacusto.estimativas' },
  { re: /estimativas_ativas/, label: 'métrica estimativas_ativas' },
]

/** Permitido: tabela de migração histórica no atlas */
function isAllowed(rel, line) {
  if (!rel.includes('ddd-atlas/simula-custo')) return false
  if (/legado|TaxaEstimativa|estimativas_trade|TributoEstimativa|DocumentoEstimativa|SequenciaEstimativa/i.test(line)) {
    return true
  }
  return false
}

function walk(entry, files = []) {
  const full = join(ROOT, entry)
  if (!existsSync(full)) return files
  const st = statSync(full)
  if (st.isFile()) {
    files.push(full)
    return files
  }
  for (const name of readdirSync(full)) {
    if (SKIP_DIRS.has(name)) continue
    walk(join(entry, name), files)
  }
  return files
}

const files = [...new Set(SCAN_ROOTS.flatMap((e) => walk(e)))]
const hits = []

for (const file of files) {
  const rel = relative(ROOT, file).replace(/\\/g, '/')
  if (SKIP_FILE.test(rel)) continue
  const ext = rel.slice(rel.lastIndexOf('.'))
  if (!['.ts', '.tsx', '.js', '.mjs', '.css', '.prisma', '.sql', '.md', '.json', '.txt'].includes(ext)) continue

  const lines = readFileSync(file, 'utf8').split('\n')
  lines.forEach((line, i) => {
    for (const { re, label } of PATTERNS) {
      if (re.test(line) && !isAllowed(rel, line)) {
        hits.push({ rel, line: i + 1, label, text: line.trim().slice(0, 120) })
      }
    }
  })
}

if (hits.length === 0) {
  console.log('✅ Auditoria OK — zero legado estimativa_* no escopo simula-custo.')
  process.exit(0)
}

console.error(`❌ ${hits.length} ocorrência(s) legado encontrada(s):\n`)
for (const h of hits.slice(0, 80)) {
  console.error(`  ${h.rel}:${h.line} [${h.label}] ${h.text}`)
}
if (hits.length > 80) console.error(`  ... e mais ${hits.length - 80}`)
process.exit(1)
