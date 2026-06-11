/**
 * snapshot-campos-modal-massa.ts — Verificação pontual (Onda 3, 2026-06-11)
 * Extrai campo/nivel/tipo dos builders hardcoded do ModalPedidosEdicaoMassa
 * para comparar com a derivação do SSOT. Descartável após a Onda 3.
 * Uso: npx tsx scripts/sob-demanda/snapshot-campos-modal-massa.ts > snapshot.json
 */
import { readFileSync } from 'fs'

const src = readFileSync('servicos-global/produto/pedido/client/src/components/ModalPedidosEdicaoMassa.tsx', 'utf8')
const re = /campo: '([a-z0-9_]+)',[^}]*?tipo: '(\w+)',\s*nivel: '(pedido|item)'/g
let m: RegExpExecArray | null
const campos: Array<{ campo: string; tipo: string; nivel: string }> = []
const vistos = new Set<string>()
while ((m = re.exec(src)) !== null) {
  const k = `${m[1]}:${m[3]}`
  if (vistos.has(k)) continue
  vistos.add(k)
  campos.push({ campo: m[1], tipo: m[2], nivel: m[3] })
}
console.log(JSON.stringify(campos, null, 1))
