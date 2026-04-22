/**
 * scripts/ativamente/validate-test-ids.ts
 * ----------------------------
 * Valida a convenção de IDs de testes do Gravity.
 *
 * Regras (de documentos-tecnicos/testes/regras/01-convencao-ids.md):
 *   1. Formato: TST-{TIPO}-{ESCOPO}-{NNNNNN}
 *   2. TIPO ∈ {UNI, CON, FUN, CRO, E2E, PEN}
 *   3. ESCOPO ∈ {LOGIN, CONFIG, ADMIN, HUB, CORE, MARKET, TENANT, DBASE,
 *                PEDIDO, NFIMP, LPCO, BIDFRT, BIDCAM, SIMCUS, FINCOM, PROCSO}
 *   4. NNNNNN = 6 dígitos com zero-padding
 *   5. Sem duplicatas
 *   6. Toda entrada do registry tem arquivo correspondente (sem órfãos)
 *   7. Todo arquivo TST-* tem entrada no registry
 *   8. IDs deletados não podem ser reusados
 *
 * Uso:
 *   npx tsx scripts/ativamente/validate-test-ids.ts
 *
 * Exit code 0 = ok. Exit code 1 = falhou (CI bloqueia merge).
 */

import { readFileSync, readdirSync, statSync, existsSync } from 'fs'
import { join, relative, basename } from 'path'

const ROOT      = process.cwd()
const TESTES    = join(ROOT, 'testes')
const REGISTRY  = join(TESTES, 'test-plans-registry.json')

const TIPOS_VALIDOS    = ['UNI', 'CON', 'FUN', 'CRO', 'E2E', 'PEN'] as const
const ESCOPOS_VALIDOS  = [
  'LOGIN', 'CONFIG', 'ADMIN', 'HUB', 'CORE', 'MARKET', 'TENANT', 'DBASE',
  'PEDIDO', 'NFIMP', 'LPCO', 'BIDFRT', 'BIDCAM', 'SIMCUS', 'FINCOM', 'PROCSO',
] as const

const ID_REGEX = new RegExp(
  `^TST-(${TIPOS_VALIDOS.join('|')})-(${ESCOPOS_VALIDOS.join('|')})-\\d{6}$`
)

interface RegistryEntry {
  id:           string
  tipo:         string
  escopo:       string
  planoFile?:   string
  specFile?:    string
}

interface RegistryShape {
  versao:    string
  deletados: string[]
  planos:    RegistryEntry[]
}

const errors:   string[] = []
const warnings: string[] = []

// ─── 1. Lê o registry ─────────────────────────────────────────────────────────
let registry: RegistryShape
try {
  registry = JSON.parse(readFileSync(REGISTRY, 'utf-8'))
} catch (err) {
  console.error(`❌ Não foi possível ler ${REGISTRY}:`, err)
  process.exit(1)
}

// ─── 2. Valida cada entrada do registry ───────────────────────────────────────
const idsRegistry  = new Set<string>()
const duplicatas   = new Set<string>()

for (const entry of registry.planos) {
  // 2a. Formato do ID
  if (!ID_REGEX.test(entry.id)) {
    errors.push(`Registry: ID "${entry.id}" não casa com o regex ${ID_REGEX}`)
  }

  // 2b. Coerência tipo/escopo do ID com os campos
  const match = entry.id.match(/^TST-(\w+)-(\w+)-(\d+)$/)
  if (match) {
    const [, tipo, escopo] = match
    if (tipo !== entry.tipo) {
      errors.push(`Registry: ID "${entry.id}" diz tipo=${tipo} mas o campo é ${entry.tipo}`)
    }
    if (escopo !== entry.escopo) {
      errors.push(`Registry: ID "${entry.id}" diz escopo=${escopo} mas o campo é ${entry.escopo}`)
    }
  }

  // 2c. Duplicatas
  if (idsRegistry.has(entry.id)) {
    duplicatas.add(entry.id)
  }
  idsRegistry.add(entry.id)

  // 2d. ID deletado sendo reusado
  if (registry.deletados?.includes(entry.id)) {
    errors.push(`Registry: ID "${entry.id}" foi marcado como deletado mas está sendo reusado`)
  }

  // 2e. Arquivo de spec existe (se declarado)
  if (entry.specFile) {
    const specPath = join(TESTES, entry.specFile)
    if (!existsSync(specPath)) {
      warnings.push(`Registry: spec "${entry.specFile}" do ID "${entry.id}" não existe ainda no disco`)
    }
  }

  // 2f. Arquivo de plano existe (se declarado)
  if (entry.planoFile) {
    const planoPath = join(TESTES, entry.planoFile)
    if (!existsSync(planoPath)) {
      errors.push(`Registry: plano "${entry.planoFile}" do ID "${entry.id}" não existe no disco`)
    }
  }
}

for (const dup of duplicatas) {
  errors.push(`Registry: ID "${dup}" duplicado em planos[]`)
}

// ─── 3. Varre arquivos do testes/ procurando IDs ──────────────────────────────
function walk(dir: string, found: Map<string, string>): void {
  if (!existsSync(dir)) return
  for (const name of readdirSync(dir)) {
    const path = join(dir, name)
    if (name.startsWith('_') || name === 'node_modules' || name === 'test-results' || name === 'playwright-report') continue
    const stat = statSync(path)
    if (stat.isDirectory()) {
      walk(path, found)
    } else if (/^TST-(UNI|CON|FUN|CRO|E2E|PEN)-/.test(name)) {
      const idMatch = name.match(/TST-\w+-\w+-\d{6}/)
      if (idMatch) {
        const id = idMatch[0]
        if (!ID_REGEX.test(id)) {
          errors.push(`Arquivo "${relative(ROOT, path)}": ID "${id}" não casa com o regex`)
        }
        if (found.has(id)) {
          errors.push(`Arquivo "${relative(ROOT, path)}": ID "${id}" duplicado (já existe em ${found.get(id)})`)
        }
        found.set(id, relative(ROOT, path))
      }
    }
  }
}

const idsArquivos = new Map<string, string>()
walk(TESTES, idsArquivos)

// ─── 4. Cruza registry × arquivos ─────────────────────────────────────────────
for (const [id, path] of idsArquivos) {
  if (!idsRegistry.has(id)) {
    errors.push(`Arquivo órfão: "${path}" tem ID "${id}" mas não está no registry`)
  }
}

for (const id of idsRegistry) {
  const entry = registry.planos.find(p => p.id === id)
  if (entry?.specFile && !idsArquivos.has(id)) {
    warnings.push(`Registry tem "${id}" com specFile declarado, mas o arquivo não foi encontrado em testes/`)
  }
}

// ─── 5. Relatório ─────────────────────────────────────────────────────────────
console.log(`\n📋 validate-test-ids — relatório`)
console.log(`   Registry: ${registry.planos.length} planos`)
console.log(`   Arquivos: ${idsArquivos.size} IDs encontrados em disco`)
console.log(`   Deletados (reservados): ${registry.deletados?.length ?? 0}`)

if (warnings.length > 0) {
  console.log(`\n⚠️  ${warnings.length} avisos:`)
  for (const w of warnings) console.log(`   - ${w}`)
}

if (errors.length > 0) {
  console.error(`\n❌ ${errors.length} erros:`)
  for (const e of errors) console.error(`   - ${e}`)
  process.exit(1)
}

console.log(`\n✅ Convenção de IDs OK\n`)
process.exit(0)
