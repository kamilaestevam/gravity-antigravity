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
  'PEDIDO', 'NFIMP', 'LPCO', 'BIDFRT', 'BIDCAM', 'SIMCUS', 'FINCOM', 'PROCSO', 'MBOTO', 'STORE',
] as const

const ID_REGEX = new RegExp(
  `^TST-(${TIPOS_VALIDOS.join('|')})-(${ESCOPOS_VALIDOS.join('|')})-\\d{6}$`
)

const EMT_ID_REGEX = /^TST-EMT-[A-Z0-9]+(-[A-Z0-9]+){2,}-\d{6}$/

/**
 * IDs descritivos (paridade EMT) para tipos legado — o escopo real fica no campo
 * `escopo` do registry (ex.: CONFIG), enquanto o ID carrega o tema legível.
 * Cada domínio descritivo entra como um regex próprio nesta lista.
 */
const DESCRIPTIVE_REGEXES: readonly RegExp[] = [
  /^TST-(UNI|FUN|CRO|E2E)-MENU-LATERAL-SELECTOR-PRODUTOS-GRAVITY-\d{6}$/,
  /^TST-(UNI|FUN|CRO|E2E)-PEDIDO-USUARIO-FALTA-ORGANIZACAO-\d{6}$/,
]

/** Retorna o regex descritivo que casa o ID, ou undefined. */
function matchDescriptive(id: string): RegExp | undefined {
  return DESCRIPTIVE_REGEXES.find((r) => r.test(id))
}

function idValido(id: string, tipo: string): boolean {
  if (tipo === 'EMT') return EMT_ID_REGEX.test(id)
  if (matchDescriptive(id)) {
    const tipoFromId = id.match(/^TST-(UNI|FUN|CRO|E2E)-/)?.[1]
    return tipoFromId === tipo
  }
  return ID_REGEX.test(id)
}

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

const idsDeletados = new Set<string>(
  (registry.deletados ?? []).flatMap((d: string | { id?: string }) =>
    typeof d === 'string' ? [d] : d.id ? [d.id] : []
  )
)

for (const entry of registry.planos) {
  // 2a. Formato do ID
  if (!idValido(entry.id, entry.tipo)) {
    errors.push(`Registry: ID "${entry.id}" não casa com a convenção (tipo=${entry.tipo})`)
  }

  // 2b. Coerência tipo/escopo do ID com os campos
  if (entry.tipo === 'EMT') {
    if (!entry.id.startsWith('TST-EMT-')) {
      errors.push(`Registry: ID EMT "${entry.id}" deve começar com TST-EMT-`)
    }
  } else if (matchDescriptive(entry.id)) {
    const match = entry.id.match(/^TST-(UNI|FUN|CRO|E2E)-/)
    if (match && match[1] !== entry.tipo) {
      errors.push(`Registry: ID "${entry.id}" diz tipo=${match[1]} mas o campo é ${entry.tipo}`)
    }
  } else {
    const match = entry.id.match(/^TST-(\w+)-(\w+)-(\d{6})$/)
    if (match) {
      const [, tipo, escopo] = match
      if (tipo !== entry.tipo) {
        errors.push(`Registry: ID "${entry.id}" diz tipo=${tipo} mas o campo é ${entry.tipo}`)
      }
      if (escopo !== entry.escopo) {
        errors.push(`Registry: ID "${entry.id}" diz escopo=${escopo} mas o campo é ${entry.escopo}`)
      }
    }
  }

  // 2c. Duplicatas
  if (idsRegistry.has(entry.id)) {
    duplicatas.add(entry.id)
  }
  idsRegistry.add(entry.id)

  // 2d. ID deletado sendo reusado
  if (idsDeletados.has(entry.id)) {
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

const sequenciasGlobais = new Map<number, string>()
for (const entry of registry.planos) {
  const match = entry.id.match(/-(\d{6})$/)
  if (!match) continue
  const seq = Number(match[1])
  if (sequenciasGlobais.has(seq)) {
    errors.push(
      `Registry: sufixo global ${String(seq).padStart(6, '0')} duplicado entre "${sequenciasGlobais.get(seq)}" e "${entry.id}"`
    )
  } else {
    sequenciasGlobais.set(seq, entry.id)
  }
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
      const idMatchDesc =
        name.match(/TST-(UNI|FUN|CRO|E2E)-MENU-LATERAL-SELECTOR-PRODUTOS-GRAVITY-\d{6}/) ??
        name.match(/TST-(UNI|FUN|CRO|E2E)-PEDIDO-USUARIO-FALTA-ORGANIZACAO-\d{6}/)
      const idMatchLegacy = name.match(/TST-\w+-\w+-\d{6}/)
      const id = idMatchDesc?.[0] ?? idMatchLegacy?.[0]
      if (id) {
        if (!idValido(id, id.match(/^TST-(\w+)-/)?.[1] ?? '')) {
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
