/**
 * comparar-derivacao-vs-snapshot.ts — Verificação pontual (Onda 3, 2026-06-11)
 * Compara campo/nivel/tipo derivados do SSOT (mesma lógica do modal) contra o
 * snapshot dos builders hardcoded extraído antes do refactor. Descartável.
 * Uso: npx tsx scripts/sob-demanda/comparar-derivacao-vs-snapshot.ts
 */
import { readFileSync } from 'fs'
import {
  CAMPOS_EDICAO_MASSA_PEDIDO,
  CAMPOS_EDICAO_MASSA_ITEM,
} from '../../servicos-global/produto/pedido/shared/camposEdicaoMassa'
import { kindUiDeCampo } from '../../servicos-global/produto/pedido/shared/kind-ui-pedido'

const CAMPOS_SELECT_DINAMICO_EXTRA = new Set([
  'pais_exportador', 'pais_fabricante', 'pais_ope',
  'local_de_origem', 'local_de_destino',
  'porto_origem', 'porto_destino',
  'aeroporto_origem', 'aeroporto_destino',
  'status_pedido',
])

function tipoEdicao(campo: string): string {
  if (CAMPOS_SELECT_DINAMICO_EXTRA.has(campo)) return 'select'
  const kind = kindUiDeCampo(campo)
  if (kind === 'ncm') return 'ncm'
  if (kind === 'data') return 'data'
  if (kind === 'inteiro' || kind.startsWith('decimal_')) return 'numero'
  if (['moeda_codigo', 'incoterm', 'unidade', 'tipo_operacao', 'cobertura_cambial', 'condicao_pagamento_siscomex', 'select_ssot'].includes(kind)) return 'select'
  return 'texto'
}

// PowerShell `>` grava UTF-16 LE com BOM
const buf = readFileSync('scripts/sob-demanda/snapshot-campos-modal-massa.json')
const texto = buf[0] === 0xff && buf[1] === 0xfe ? buf.toString('utf16le').slice(1) : buf.toString('utf8')
const snapshot: Array<{ campo: string; tipo: string; nivel: string }> = JSON.parse(texto)

const derivados = new Map<string, string>()
for (const c of [...CAMPOS_EDICAO_MASSA_PEDIDO, ...CAMPOS_EDICAO_MASSA_ITEM]) {
  derivados.set(`${c.campo}:${c.nivel}`, tipoEdicao(c.campo))
}

const sumiram: string[] = []
const tipoMudou: string[] = []
for (const s of snapshot) {
  const k = `${s.campo}:${s.nivel}`
  if (!derivados.has(k)) { sumiram.push(k); continue }
  const novoTipo = derivados.get(k)
  if (novoTipo !== s.tipo) tipoMudou.push(`${k} — era '${s.tipo}', virou '${novoTipo}'`)
}
const snapKeys = new Set(snapshot.map(s => `${s.campo}:${s.nivel}`))
const novos = [...derivados.keys()].filter(k => !snapKeys.has(k))

console.log(`snapshot: ${snapshot.length} | derivados: ${derivados.size}`)
console.log(`sumiram (${sumiram.length}): ${sumiram.join(', ') || 'nenhum'}`)
console.log(`tipo mudou (${tipoMudou.length}):\n${tipoMudou.join('\n') || 'nenhum'}`)
console.log(`novos (${novos.length}): ${novos.join(', ') || 'nenhum'}`)
