/**
 * Raio-X Smart Import — cobertura SSOT vs destino (U-JSON-02)
 */
import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import {
  CAMPOS_PEDIDO_DDD,
  CAMPOS_ITEM_DDD,
  CAMPOS_PEDIDO_DDD_TODOS,
} from '../../../../../../servicos-global/produto/pedido/shared/campos-pedido-ddd.js'
import {
  CAMPOS_JSON_PEDIDO_LISTA,
} from '../../../../../../servicos-global/produto/pedido/shared/camposJsonPedidoLista.js'

const ROOT = join(process.cwd(), 'servicos-global/produto/pedido/server/src/services/smartImportService.ts')
const smartImportSrc = readFileSync(ROOT, 'utf8')

const CAMPOS_MONTAR_PEDIDO = extractStringSet(smartImportSrc, /if \(dados\['([^']+)'\]/g)
const CAMPOS_EXTRAS_IMPORT = extractBlockStrings(smartImportSrc, 'CAMPOS_EXTRAS_PEDIDO')
const CAMPOS_OPE_IMPORT = extractBlockStrings(smartImportSrc, 'CAMPOS_OPE')

function extractStringSet(src: string, re: RegExp): Set<string> {
  const s = new Set<string>()
  let m: RegExpExecArray | null
  while ((m = re.exec(src)) !== null) s.add(m[1])
  return s
}

function extractBlockStrings(src: string, constName: string): Set<string> {
  const start = src.indexOf(`const ${constName}`)
  if (start < 0) return new Set()
  const slice = src.slice(start, start + 2500)
  const s = new Set<string>()
  const re = /'([^']+)'/g
  let m: RegExpExecArray | null
  while ((m = re.exec(slice)) !== null) s.add(m[1])
  return s
}

describe('Raio-X Smart Import — cobertura SSOT (U-JSON-02)', () => {
  const camposPedido = CAMPOS_PEDIDO_DDD.map((c) => c.campo)
  const camposItem = CAMPOS_ITEM_DDD.map((c) => c.campo)

  it('lista todos os campos do SSOT (pedido + item)', () => {
    expect(CAMPOS_PEDIDO_DDD_TODOS.length).toBeGreaterThan(100)
    expect(camposPedido.length + camposItem.length).toBe(CAMPOS_PEDIDO_DDD_TODOS.length)
  })

  it('campos JSON da lista estão cobertos por extras ou detalhes no import', () => {
    const cobertosImport = new Set([...CAMPOS_EXTRAS_IMPORT, ...CAMPOS_OPE_IMPORT])
    const faltandoNoImport = CAMPOS_JSON_PEDIDO_LISTA.filter((c) => !cobertosImport.has(c))
    expect(faltandoNoImport.sort()).toEqual(['cnpj_exportador', 'cnpj_importador'].sort())
  })

  it('campos principais de parceiro existem no fluxo de extras', () => {
    for (const c of ['nome_exportador', 'nome_fabricante', 'nome_importador']) {
      expect(CAMPOS_EXTRAS_IMPORT.has(c)).toBe(true)
    }
  })

  it('referencias de documento vão para colunas Prisma (não JSON)', () => {
    expect(CAMPOS_MONTAR_PEDIDO.has('referencia_fabricante_pedido')).toBe(true)
    expect(CAMPOS_MONTAR_PEDIDO.has('referencia_exportador_pedido')).toBe(true)
    expect(CAMPOS_MONTAR_PEDIDO.has('referencia_importador_pedido')).toBe(true)
  })
})
