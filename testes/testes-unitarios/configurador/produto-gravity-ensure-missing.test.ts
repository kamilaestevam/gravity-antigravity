// Anti-regressão: ensureMissingProducts não pode apagar produtos cadastrados no Admin
// (ex.: "Em breve" com slug fora do seed) ao reiniciar cfg-back / dev:up.

import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, '../../..')
const servicePath = path.join(
  root,
  'servicos-global/configurador/server/services/produto-gravity-catalogo-service.ts',
)
const source = readFileSync(servicePath, 'utf-8')

function corpoEnsureMissingProducts(): string {
  const inicio = source.indexOf('async ensureMissingProducts()')
  if (inicio < 0) throw new Error('ensureMissingProducts não encontrado')
  const fim = source.indexOf('async activateProductsForTenant', inicio)
  if (fim < 0) throw new Error('fim do método não encontrado')
  return source.slice(inicio, fim)
}

describe('produto-gravity-catalogo-service — ensureMissingProducts', () => {
  it('não remove produtos fora da lista seed (só create/update)', () => {
    const corpo = corpoEnsureMissingProducts()
    expect(corpo).not.toMatch(/produtoGravity\.delete\b/)
    expect(corpo).not.toMatch(/toRemove/)
    expect(corpo).toMatch(/removed:\s*0/)
  })
})
