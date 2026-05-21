// TST-UNIT-INFRA-001 — migrate-tenants/_shared: funções puras de infraestrutura
//
// Cobre: buildSchemaName, loadEnv, resolveEnvs
// Sem dependência de banco real — fs.readFileSync mockado via vi.mock().
/// <reference types="vitest/globals" />

// Mock de fs ANTES do import do módulo — garante que _shared nunca toca o disco
vi.mock('fs', () => ({
  readFileSync: vi.fn(),
}))

import { readFileSync } from 'fs'
import { buildSchemaName, loadEnv, resolveEnvs } from '../../../../scripts/ativamente/migrate-tenants/_shared.js'

const mockRead = vi.mocked(readFileSync)

// ─── buildSchemaName ──────────────────────────────────────────────────────────

describe('buildSchemaName', () => {
  // CUID v1 válido: começa com 'c', seguido de exatamente 24 chars [a-z0-9] = 25 chars total
  const VALID_CUID_V1 = 'c' + 'a'.repeat(24)
  // CUID v2 válido: começa com qualquer letra, 24 chars total [a-z0-9]
  const VALID_CUID_V2 = 'y' + '95indq8sfe7fmx5kl02h8y'
  // UUID v4 válido
  const VALID_UUID = '19fa2567-16f8-4a2f-9708-3367b85e70d3'

  it('retorna "tenant_<id>" para CUID v1 válido', () => {
    expect(buildSchemaName(VALID_CUID_V1)).toBe(`tenant_${VALID_CUID_V1}`)
  })

  it('retorna "tenant_<id>" para CUID v2 válido', () => {
    expect(buildSchemaName(VALID_CUID_V2)).toBe(`tenant_${VALID_CUID_V2}`)
  })

  it('retorna "tenant_<id>" para UUID v4 válido', () => {
    expect(buildSchemaName(VALID_UUID)).toBe(`tenant_${VALID_UUID}`)
  })

  it('aceita UUID com todos os dígitos hex', () => {
    const uuid = 'abcdef01-2345-6789-abcd-ef0123456789'
    expect(buildSchemaName(uuid)).toBe(`tenant_${uuid}`)
  })

  it('lança erro para string vazia', () => {
    expect(() => buildSchemaName('')).toThrow('ID de tenant inválido')
  })

  it('lança erro para CUID muito curto (< 23 chars)', () => {
    expect(() => buildSchemaName('c' + 'a'.repeat(21))).toThrow('ID de tenant inválido')
  })

  it('lança erro para CUID muito longo (> 25 chars)', () => {
    expect(() => buildSchemaName('c' + 'a'.repeat(25))).toThrow('ID de tenant inválido')
  })

  it('lança erro para ID com letra maiúscula', () => {
    expect(() => buildSchemaName('C' + 'a'.repeat(24))).toThrow('ID de tenant inválido')
  })

  it('lança erro para ID com underscore', () => {
    expect(() => buildSchemaName('c' + '_'.repeat(24))).toThrow('ID de tenant inválido')
  })

  it('lança erro para UUID com letras maiúsculas', () => {
    expect(() => buildSchemaName('19FA2567-16F8-4A2F-9708-3367B85E70D3')).toThrow('ID de tenant inválido')
  })

  it('aceita CUID com dígitos numéricos', () => {
    const idComNumeros = 'c' + '1234567890'.repeat(2) + 'aaaa'
    expect(buildSchemaName(idComNumeros)).toBe(`tenant_${idComNumeros}`)
  })

  it('a mensagem de erro inclui o ID inválido', () => {
    expect(() => buildSchemaName('invalido')).toThrow('"invalido"')
  })
})

// ─── loadEnv ─────────────────────────────────────────────────────────────────

describe('loadEnv', () => {
  beforeEach(() => {
    mockRead.mockReset()
  })

  it('retorna {} quando o arquivo não existe (ENOENT)', () => {
    mockRead.mockImplementation(() => { throw new Error('ENOENT: no such file') })
    expect(loadEnv('inexistente.env')).toEqual({})
  })

  it('parseia KEY=VALUE corretamente', () => {
    mockRead.mockReturnValue('CHAVE=valor')
    expect(loadEnv('test.env')).toEqual({ CHAVE: 'valor' })
  })

  it('ignora linhas que começam com # (comentários)', () => {
    mockRead.mockReturnValue('# isto é um comentário\nCHAVE=valor')
    expect(loadEnv('test.env')).toEqual({ CHAVE: 'valor' })
  })

  it('ignora linhas sem sinal de igual', () => {
    mockRead.mockReturnValue('SEM_IGUAL\nCHAVE=valor')
    expect(loadEnv('test.env')).toEqual({ CHAVE: 'valor' })
  })

  it('usa apenas o primeiro "=" — valor pode conter "=" (ex: URLs)', () => {
    mockRead.mockReturnValue('URL=pg://host/db?ssl=true&mode=require')
    expect(loadEnv('test.env')).toEqual({
      URL: 'pg://host/db?ssl=true&mode=require',
    })
  })

  it('remove espaços em torno da chave', () => {
    mockRead.mockReturnValue('  CHAVE  =valor')
    expect(loadEnv('test.env')).toEqual({ CHAVE: 'valor' })
  })

  it('parseia múltiplas variáveis separadas por newline', () => {
    mockRead.mockReturnValue('A=1\nB=2\nC=3')
    expect(loadEnv('test.env')).toEqual({ A: '1', B: '2', C: '3' })
  })

  it('arquivo vazio retorna {}', () => {
    mockRead.mockReturnValue('')
    expect(loadEnv('test.env')).toEqual({})
  })

  it('arquivo apenas com comentários retorna {}', () => {
    mockRead.mockReturnValue('# linha 1\n# linha 2')
    expect(loadEnv('test.env')).toEqual({})
  })
})

// ─── resolveEnvs ─────────────────────────────────────────────────────────────

describe('resolveEnvs', () => {
  beforeEach(() => {
    mockRead.mockReset()
  })

  it('retorna configuradorUrl e sharedUrl quando ambas as variáveis estão presentes', () => {
    mockRead.mockImplementation((path: unknown) => {
      const p = String(path)
      if (p.includes('configurador')) return 'CONFIGURADOR_DATABASE_URL=postgresql://config-db'
      if (p.includes('pedido'))       return 'DATABASE_URL=postgresql://shared-db'
      return ''
    })

    const result = resolveEnvs()
    expect(result.configuradorUrl).toBe('postgresql://config-db')
    expect(result.sharedUrl).toBe('postgresql://shared-db')
  })

  it('lança erro quando CONFIGURADOR_DATABASE_URL está ausente em todos os arquivos', () => {
    mockRead.mockImplementation((path: unknown) => {
      const p = String(path)
      if (p.includes('pedido')) return 'DATABASE_URL=postgresql://shared-db'
      return ''
    })

    expect(() => resolveEnvs()).toThrow('CONFIGURADOR_DATABASE_URL não encontrado')
  })

  it('lança erro quando DATABASE_URL está ausente em todos os arquivos', () => {
    mockRead.mockImplementation((path: unknown) => {
      const p = String(path)
      if (p.includes('configurador')) return 'CONFIGURADOR_DATABASE_URL=postgresql://config-db'
      return ''
    })

    expect(() => resolveEnvs()).toThrow('DATABASE_URL não encontrado')
  })

  it('lança erro quando todos os arquivos estão ausentes ou vazios', () => {
    mockRead.mockImplementation(() => { throw new Error('ENOENT') })

    expect(() => resolveEnvs()).toThrow('CONFIGURADOR_DATABASE_URL não encontrado')
  })

  it('.env.local sobrescreve variáveis dos arquivos anteriores (merge com spread)', () => {
    mockRead.mockImplementation((path: unknown) => {
      const p = String(path)
      if (p.includes('configurador') && !p.includes('env.local'))
        return 'CONFIGURADOR_DATABASE_URL=postgresql://config-db\nDATABASE_URL=postgresql://from-configurador'
      if (p.includes('.env.local'))
        return 'DATABASE_URL=postgresql://from-env-local'
      return ''
    })

    const result = resolveEnvs()
    expect(result.sharedUrl).toBe('postgresql://from-env-local')
    expect(result.configuradorUrl).toBe('postgresql://config-db')
  })
})
