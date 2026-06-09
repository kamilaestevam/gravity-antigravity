// @vitest-environment node
import { existsSync, readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import {
  raizRepositorioGravity,
  registryPlanosTestePath,
  resolverArquivoPlanoTeste,
} from '../../../servicos-global/configurador/server/lib/raiz-repositorio-gravity.js'

describe('raiz-repositorio-gravity', () => {
  it('resolve registry independente de process.cwd()', () => {
    expect(existsSync(registryPlanosTestePath)).toBe(true)
    const raw = JSON.parse(
      readFileSync(registryPlanosTestePath, 'utf-8').replace(/^\uFEFF/, ''),
    ) as { planos?: unknown[] }
    expect(Array.isArray(raw.planos)).toBe(true)
    expect((raw.planos ?? []).length).toBeGreaterThan(0)
  })

  it('raizRepositorioGravity contém pastas testes e servicos-global', () => {
    expect(existsSync(`${raizRepositorioGravity}/testes`)).toBe(true)
    expect(existsSync(`${raizRepositorioGravity}/servicos-global`)).toBe(true)
  })

  it('resolverArquivoPlanoTeste encontra planoFile do registry', () => {
    const path = resolverArquivoPlanoTeste('testes/testes-unitarios/pedido/pedido-divergencias-referencia.test.ts')
    expect(path).not.toBeNull()
    expect(existsSync(path!)).toBe(true)
  })
})
