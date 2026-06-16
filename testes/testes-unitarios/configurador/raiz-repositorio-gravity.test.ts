// @vitest-environment node
import { existsSync, readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import {
  raizRepositorioGravity,
  registryPlanosTestePath,
  resolverArquivoPlanoTeste,
  resolverArquivoEmTestes,
  relPathArquivoTesteNoMonorepo,
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

  it('resolverArquivoEmTestes — SSOT testes/ sem prefixo duplicado (EMT 000095)', () => {
    const rel = 'testes-em-tela/admin/testes/aba-plano-de-teste/plano-de-teste/run-preferencia-teste-usuario-admin.ts'
    const abs = resolverArquivoEmTestes(rel)
    expect(abs).not.toBeNull()
    expect(relPathArquivoTesteNoMonorepo(rel)).toBe(
      'testes/testes-em-tela/admin/testes/aba-plano-de-teste/plano-de-teste/run-preferencia-teste-usuario-admin.ts',
    )
  })

  it('resolverArquivoEmTestes — aceita legado com prefixo testes/', () => {
    const rel = 'testes/testes-em-tela/pedido/lista/editar-salvar/plano-de-teste/run-lista-editar-salvar.ts'
    expect(resolverArquivoEmTestes(rel)).not.toBeNull()
    expect(relPathArquivoTesteNoMonorepo(rel)).toBe(rel)
  })
})
