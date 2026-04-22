/**
 * scripts/ativamente/validate-cobertura.ts
 * -----------------------------
 * Valida a cobertura obrigatória dos planos de teste.
 *
 * Regras (de documentos-tecnicos/testes/regras/02-cobertura-obrigatoria.md):
 *   1. Todo plano em testes/_planos/ tem exatamente 20 categorias na cobertura
 *   2. Cada categoria tem status: coberta | parcial | ausente | nao_aplicavel
 *   3. Status "nao_aplicavel" exige justificativa (≥30 chars)
 *   4. Status "ausente" é proibido (CI rejeita)
 *   5. Mínimo de passos por criticidade respeitado
 *   6. Passos com origem "humano-original" não foram removidos em re-geração
 *
 * Uso:
 *   npx tsx scripts/ativamente/validate-cobertura.ts
 */

import { readFileSync, readdirSync, statSync, existsSync } from 'fs'
import { join, relative } from 'path'

const ROOT    = process.cwd()
// Busca _planos/ dentro de cada escopo em testes-e2e/
const PLANOS  = join(ROOT, 'testes', 'testes-e2e')

const CATEGORIAS_VALIDAS = 20

// Mínimo de passos por categoria por criticidade (de 02-cobertura-obrigatoria.md)
const MINIMOS: Record<string, Record<number, number>> = {
  baixa:    { 1:2, 2:3, 3:2, 4:3, 5:0, 6:0, 7:0, 8:2, 9:1, 10:1, 11:1, 12:0, 13:0, 14:1, 15:1, 16:2, 17:1, 18:1, 19:0, 20:1 },
  media:    { 1:3, 2:5, 3:4, 4:5, 5:5, 6:4, 7:3, 8:5, 9:3, 10:2, 11:2, 12:3, 13:2, 14:3, 15:2, 16:4, 17:3, 18:2, 19:2, 20:2 },
  alta:     { 1:4, 2:7, 3:6, 4:8, 5:10, 6:8, 7:6, 8:10, 9:6, 10:3, 11:3, 12:6, 13:4, 14:6, 15:4, 16:6, 17:4, 18:4, 19:4, 20:3 },
  critica:  { 1:5, 2:8, 3:8, 4:12, 5:15, 6:12, 7:10, 8:15, 9:10, 10:4, 11:4, 12:10, 13:6, 14:10, 15:6, 16:8, 17:5, 18:5, 19:6, 20:4 },
}

interface CoberturaCategoria {
  categoria:        number
  nome:             string
  status:           'coberta' | 'parcial' | 'ausente' | 'nao_aplicavel'
  justificativa?:   string
  passosAssociados?: number[]
}

interface Passo {
  numero:    number
  categoria: number
  origem:    'humano-original' | 'agente-adicionado' | 'agente-expandido'
}

interface Plano {
  id:           string
  versao:       string
  criticidade:  'baixa' | 'media' | 'alta' | 'critica'
  cobertura:    CoberturaCategoria[]
  passos:       Passo[]
}

const errors:   string[] = []
const warnings: string[] = []

// ─── Varre testes-e2e/<escopo>/_planos/ recursivamente ───────────────────────
function walkPlanos(dir: string): string[] {
  if (!existsSync(dir)) return []
  const found: string[] = []
  for (const name of readdirSync(dir)) {
    const path = join(dir, name)
    const stat = statSync(path)
    if (stat.isDirectory()) {
      // Se encontrou _planos, varre só JSONs dentro
      if (name === '_planos') {
        for (const planFile of readdirSync(path)) {
          if (planFile.endsWith('.json')) {
            found.push(join(path, planFile))
          }
        }
      } else {
        found.push(...walkPlanos(path))
      }
    }
  }
  return found
}

const arquivosPlanos = walkPlanos(PLANOS)
console.log(`\n📋 validate-cobertura — relatório`)
console.log(`   Planos encontrados: ${arquivosPlanos.length}`)

for (const arquivo of arquivosPlanos) {
  const relPath = relative(ROOT, arquivo)
  let plano: Plano

  try {
    plano = JSON.parse(readFileSync(arquivo, 'utf-8'))
  } catch (err) {
    errors.push(`${relPath}: JSON inválido — ${(err as Error).message}`)
    continue
  }

  // ─── Regra 1: cobertura tem exatamente 20 categorias ────────────────────────
  if (!Array.isArray(plano.cobertura) || plano.cobertura.length !== CATEGORIAS_VALIDAS) {
    errors.push(`${relPath}: cobertura deve ter exatamente ${CATEGORIAS_VALIDAS} categorias (tem ${plano.cobertura?.length ?? 0})`)
    continue
  }

  // ─── Regra 2-4: status válido + justificativa pra nao_aplicavel ─────────────
  const categoriasVistas = new Set<number>()
  for (const cat of plano.cobertura) {
    categoriasVistas.add(cat.categoria)

    if (!['coberta', 'parcial', 'ausente', 'nao_aplicavel'].includes(cat.status)) {
      errors.push(`${relPath}: categoria ${cat.categoria} tem status inválido "${cat.status}"`)
    }

    if (cat.status === 'ausente') {
      errors.push(`${relPath}: categoria ${cat.categoria} (${cat.nome}) está "ausente" — proibido`)
    }

    if (cat.status === 'nao_aplicavel') {
      if (!cat.justificativa || cat.justificativa.length < 30) {
        errors.push(`${relPath}: categoria ${cat.categoria} (${cat.nome}) está "nao_aplicavel" mas justificativa ausente ou < 30 chars`)
      }
    }

    if (cat.categoria < 1 || cat.categoria > 20) {
      errors.push(`${relPath}: número de categoria ${cat.categoria} fora do range 1-20`)
    }
  }

  // Garante que todas as 20 categorias estão presentes
  for (let i = 1; i <= 20; i++) {
    if (!categoriasVistas.has(i)) {
      errors.push(`${relPath}: categoria ${i} ausente da matriz de cobertura`)
    }
  }

  // ─── Regra 5: mínimo de passos por categoria por criticidade ────────────────
  const minimos = MINIMOS[plano.criticidade]
  if (!minimos) {
    errors.push(`${relPath}: criticidade inválida "${plano.criticidade}"`)
    continue
  }

  const passosPorCategoria = new Map<number, number>()
  for (const passo of plano.passos ?? []) {
    passosPorCategoria.set(passo.categoria, (passosPorCategoria.get(passo.categoria) ?? 0) + 1)
  }

  for (const cat of plano.cobertura) {
    if (cat.status === 'nao_aplicavel') continue
    const minimo  = minimos[cat.categoria]
    const atual   = passosPorCategoria.get(cat.categoria) ?? 0
    if (atual < minimo) {
      warnings.push(`${relPath}: categoria ${cat.categoria} (${cat.nome}) tem ${atual} passos, mínimo ${minimo} para criticidade "${plano.criticidade}"`)
    }
  }

  // ─── Regra 6: passos humano-original não foram removidos ────────────────────
  // (verificação só faz sentido em re-geração; aqui apenas valida que o campo `origem` está presente)
  for (const passo of plano.passos ?? []) {
    if (!passo.origem || !['humano-original', 'agente-adicionado', 'agente-expandido'].includes(passo.origem)) {
      errors.push(`${relPath}: passo ${passo.numero} sem campo "origem" válido`)
    }
  }

  console.log(`   ✓ ${plano.id} — ${plano.passos?.length ?? 0} passos, ${plano.cobertura.filter(c => c.status === 'coberta').length}/20 cobertas`)
}

if (warnings.length > 0) {
  console.log(`\n⚠️  ${warnings.length} avisos:`)
  for (const w of warnings.slice(0, 20)) console.log(`   - ${w}`)
  if (warnings.length > 20) console.log(`   ...e mais ${warnings.length - 20}`)
}

if (errors.length > 0) {
  console.error(`\n❌ ${errors.length} erros:`)
  for (const e of errors) console.error(`   - ${e}`)
  process.exit(1)
}

console.log(`\n✅ Cobertura OK\n`)
process.exit(0)
