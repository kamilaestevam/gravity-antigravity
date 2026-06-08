/** Corrige registry: sufixo global = posição no array (1..N). */
import { readFileSync, writeFileSync } from 'fs'
import { join } from 'path'

const REGISTRY = join(process.cwd(), 'testes/test-plans-registry.json')

interface Plano { id: string; tipo: string; escopo: string }

function pad(n: number): string {
  return String(n).padStart(6, '0')
}

function novoId(plano: Plano, seq: number): string {
  const num = pad(seq)
  if (plano.tipo === 'EMT') {
    const prefix = plano.id.replace(/-(?:\d{3}|\d{6})$/, '')
    return `${prefix}-${num}`
  }
  return `TST-${plano.tipo}-${plano.escopo}-${num}`
}

const registry = JSON.parse(readFileSync(REGISTRY, 'utf-8')) as { planos: Plano[] }
registry.planos.forEach((p, i) => {
  p.id = novoId(p, i + 1)
})

writeFileSync(REGISTRY, `${JSON.stringify(registry, null, 2)}\n`)

const seen = new Set<string>()
for (const p of registry.planos) {
  const m = p.id.match(/-(\d{6})$/)
  if (!m) throw new Error(`sem sufixo: ${p.id}`)
  if (seen.has(m[1])) throw new Error(`duplicado ${m[1]} em ${p.id}`)
  seen.add(m[1])
}
console.log(`✅ Registry OK — ${registry.planos.length} planos, sufixos 000001–${pad(registry.planos.length)}`)
