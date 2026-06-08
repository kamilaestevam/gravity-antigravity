/**
 * Normaliza numeração/IDs legados de planos de teste (uma vez).
 * Ver documentos-tecnicos/testes/regras/01-convencao-ids.md Regra 11.
 *
 * Uso: npx tsx scripts/ativamente/migrate-legacy-test-ids.ts
 *      npx tsx scripts/ativamente/migrate-legacy-test-ids.ts --dry-run
 */

import { readFileSync, writeFileSync, readdirSync, statSync, renameSync, existsSync } from 'fs'
import { join, relative } from 'path'

const ROOT = process.cwd()
const DRY_RUN = process.argv.includes('--dry-run')

/** Ordem: IDs mais longos primeiro para evitar substituição parcial */
const MIGRATION: Record<string, string> = {
  'TST-UNIT-TENANT-AE-001': 'TST-UNI-TENANT-000001',
  'TST-UNIT-TENANT-SAL-001': 'TST-UNI-TENANT-000002',
  'TST-UNIT-CONFIG-WSUP-001': 'TST-UNI-CONFIG-000001',
  'TST-UNIT-CONFIG-MSYNC-001': 'TST-UNI-CONFIG-000002',
  'TST-FUN-CONFIG-WSUP-001': 'TST-FUN-CONFIG-000001',
  'TST-FUN-CONFIG-ME-001': 'TST-FUN-CONFIG-000002',
  'TST-UNIT-ADMIN-VG-000001': 'TST-UNI-ADMIN-000001',
  'TST-FUN-ADMIN-VG-000001': 'TST-FUN-ADMIN-000001',
  'TST-CRO-ADMIN-VG-000001': 'TST-CRO-ADMIN-000001',
  'TST-UNI-PEDIDO-EDICAO-MASSA-000001': 'TST-UNI-PEDIDO-000002',
  'TST-UNI-PEDIDO-DUPLICAR-000001': 'TST-UNI-PEDIDO-000003',
  'TST-UNI-PEDIDO-EDITAR-SALVAR-001': 'TST-UNI-PEDIDO-000004',
  'TST-UNI-PEDIDO-CONSOLIDAR-000001': 'TST-UNI-PEDIDO-000005',
  'TST-UNI-PEDIDO-TRANSFERIR-000001': 'TST-UNI-PEDIDO-000006',
  'TST-UNI-PEDIDO-CONFIG-STATUS-001': 'TST-UNI-PEDIDO-000007',
  'TST-UNIT-PEDIDO-PAINEL-LISTA-001': 'TST-UNI-PEDIDO-000008',
  'TST-FUN-PEDIDO-EDICAO-MASSA-000001': 'TST-FUN-PEDIDO-000001',
  'TST-FUN-PEDIDO-DUPLICAR-000001': 'TST-FUN-PEDIDO-000002',
  'TST-FUN-PEDIDO-EDITAR-SALVAR-001': 'TST-FUN-PEDIDO-000003',
  'TST-FUN-PEDIDO-CONSOLIDAR-000001': 'TST-FUN-PEDIDO-000004',
  'TST-FUN-PEDIDO-TRANSFERIR-000001': 'TST-FUN-PEDIDO-000005',
  'TST-FUN-PEDIDO-CONFIG-STATUS-001': 'TST-FUN-PEDIDO-000006',
  'TST-FUN-PEDIDO-PAINEL-LISTA-001': 'TST-FUN-PEDIDO-000007',
  'TST-E2E-PEDIDO-EDICAO-MASSA-000001': 'TST-E2E-PEDIDO-000002',
  'TST-E2E-PEDIDO-DUPLICAR-000001': 'TST-E2E-PEDIDO-000003',
  'TST-E2E-PEDIDO-EDITAR-SALVAR-001': 'TST-E2E-PEDIDO-000004',
  'TST-E2E-PEDIDO-CONSOLIDAR-000001': 'TST-E2E-PEDIDO-000005',
  'TST-E2E-PEDIDO-TRANSFERIR-000001': 'TST-E2E-PEDIDO-000006',
  'TST-E2E-PEDIDO-CONFIG-STATUS-001': 'TST-E2E-PEDIDO-000007',
  'TST-E2E-PEDIDO-PAINEL-LISTA-001': 'TST-E2E-PEDIDO-000008',
  'TST-EMT-LOGIN-000001': 'TST-EMT-LOGIN-PORTEIRO-SIGNUP-001',
  'TST-EMT-STORE-000001': 'TST-EMT-STORE-CATALOGO-VALIDACAO-001',
  'TST-EMT-000002': 'TST-EMT-PEDIDO-LISTA-EDITAR-SALVAR-001',
  // Variantes legadas com sufixo -001 (3 dígitos) sem 000001 no meio
  'TST-UNI-PEDIDO-CONSOLIDAR-001': 'TST-UNI-PEDIDO-000005',
  'TST-FUN-PEDIDO-CONSOLIDAR-001': 'TST-FUN-PEDIDO-000004',
  'TST-FUN-PEDIDO-DUPLICAR-001': 'TST-FUN-PEDIDO-000002',
  'TST-UNIT-PEDIDO-DUPLICAR-001': 'TST-UNI-PEDIDO-000003',
  'TST-E2E-PEDIDO-CONSOLIDAR-001': 'TST-E2E-PEDIDO-000005',
  'TST-E2E-PEDIDO-DUPLICAR-001': 'TST-E2E-PEDIDO-000003',
  'TST-E2E-PEDIDO-TRANSFERIR-001': 'TST-E2E-PEDIDO-000006',
  // Sub-casos de planos renomeados (describe/it)
  'TST-UNIT-TENANT-AE': 'TST-UNI-TENANT-000001',
  'TST-UNIT-TENANT-SAL': 'TST-UNI-TENANT-000002',
  'TST-UNIT-CONFIG-WSUP': 'TST-UNI-CONFIG-000001',
}

const RENAMES: Array<{ from: string; to: string }> = [
  {
    from: 'testes/testes-unitarios/admin/visao-geral/plano-teste/TST-UNIT-ADMIN-VG-000001.json',
    to: 'testes/testes-unitarios/admin/visao-geral/plano-teste/TST-UNI-ADMIN-000001.json',
  },
  {
    from: 'testes/testes-funcionais/admin/visao-geral/plano-teste/TST-FUN-ADMIN-VG-000001.json',
    to: 'testes/testes-funcionais/admin/visao-geral/plano-teste/TST-FUN-ADMIN-000001.json',
  },
  {
    from: 'testes/testes-cross-organizacao/admin/visao-geral/plano-teste/TST-CRO-ADMIN-VG-000001.json',
    to: 'testes/testes-cross-organizacao/admin/visao-geral/plano-teste/TST-CRO-ADMIN-000001.json',
  },
  {
    from: 'testes/testes-e2e/pedido/Lista/duplicar/TST-E2E-PEDIDO-DUPLICAR-001.spec.ts',
    to: 'testes/testes-e2e/pedido/Lista/duplicar/TST-E2E-PEDIDO-000003.spec.ts',
  },
  {
    from: 'testes/testes-e2e/pedido/Lista/consolidar/TST-E2E-PEDIDO-CONSOLIDAR-001.spec.ts',
    to: 'testes/testes-e2e/pedido/Lista/consolidar/TST-E2E-PEDIDO-000005.spec.ts',
  },
  {
    from: 'testes/testes-e2e/pedido/Lista/transferir/TST-E2E-PEDIDO-TRANSFERIR-001.spec.ts',
    to: 'testes/testes-e2e/pedido/Lista/transferir/TST-E2E-PEDIDO-000006.spec.ts',
  },
  {
    from: 'testes/testes-e2e/pedido/Lista/editar-salvar/plano-teste/TST-E2E-PEDIDO-EDITAR-SALVAR-001.spec.ts',
    to: 'testes/testes-e2e/pedido/Lista/editar-salvar/plano-teste/TST-E2E-PEDIDO-000004.spec.ts',
  },
  {
    from: 'testes/testes-e2e/pedido/configuracao/status/TST-E2E-PEDIDO-CONFIG-STATUS-001.spec.ts',
    to: 'testes/testes-e2e/pedido/configuracao/status/TST-E2E-PEDIDO-000007.spec.ts',
  },
]

const SKIP_DIRS = new Set(['node_modules', '.git', 'dist', 'build', '.vite'])
const TEXT_EXT = new Set([
  '.ts', '.tsx', '.js', '.jsx', '.md', '.json', '.yaml', '.yml', '.cjs', '.mjs',
])

const sortedOldIds = Object.keys(MIGRATION).sort((a, b) => b.length - a.length)

function shouldSkipPath(file: string): boolean {
  const rel = relative(ROOT, file).replace(/\\/g, '/')
  return rel.includes('servicos-global/configurador/data/test-logs/')
}

function walk(dir: string, out: string[] = []): string[] {
  for (const name of readdirSync(dir)) {
    if (SKIP_DIRS.has(name)) continue
    const full = join(dir, name)
    const st = statSync(full)
    if (st.isDirectory()) walk(full, out)
    else out.push(full)
  }
  return out
}

function replaceInFile(path: string): number {
  const ext = path.slice(path.lastIndexOf('.'))
  if (!TEXT_EXT.has(ext)) return 0
  if (path.includes('migrate-legacy-test-ids.ts')) return 0
  if (shouldSkipPath(path)) return 0

  let content = readFileSync(path, 'utf-8')
  let hits = 0
  for (const oldId of sortedOldIds) {
    const newId = MIGRATION[oldId]
    const count = content.split(oldId).length - 1
    if (count > 0) {
      content = content.split(oldId).join(newId)
      hits += count
    }
  }
  if (hits > 0 && !DRY_RUN) writeFileSync(path, content, 'utf-8')
  return hits
}

function main(): void {
  console.log(DRY_RUN ? '🔍 dry-run' : '🔧 aplicando migração de IDs legados…')

  let renameCount = 0
  for (const { from, to } of RENAMES) {
    const fromAbs = join(ROOT, from)
    const toAbs = join(ROOT, to)
    if (!existsSync(fromAbs)) {
      console.warn(`⚠️  rename ignorado (ausente): ${from}`)
      continue
    }
    if (existsSync(toAbs)) {
      console.warn(`⚠️  destino já existe: ${to}`)
      continue
    }
    console.log(`📁 ${from} → ${to}`)
    if (!DRY_RUN) renameSync(fromAbs, toAbs)
    renameCount++
  }

  const roots = [
    join(ROOT, 'testes'),
    join(ROOT, 'documentos-tecnicos'),
    join(ROOT, 'skills'),
    join(ROOT, 'scripts'),
    join(ROOT, 'servicos-global'),
  ]

  let fileHits = 0
  let totalReplacements = 0
  for (const root of roots) {
    if (!existsSync(root)) continue
    for (const file of walk(root)) {
      const n = replaceInFile(file)
      if (n > 0) {
        fileHits++
        totalReplacements += n
        console.log(`  ✏️  ${relative(ROOT, file)} (${n})`)
      }
    }
  }

  console.log(`\n✅ Renames: ${renameCount} | Arquivos alterados: ${fileHits} | Substituições: ${totalReplacements}`)
  if (DRY_RUN) console.log('(nenhum arquivo gravado — rode sem --dry-run)')
}

main()
