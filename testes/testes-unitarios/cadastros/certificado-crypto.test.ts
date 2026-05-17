// @vitest-environment node
/**
 * Testes unitários — certificado-crypto.ts (AES-256-GCM)
 *
 * Tipo de módulo: Utilitário (funções puras de criptografia)
 * Cobertura: encryptBuffer, decryptToBuffer, getKey
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { randomBytes } from 'node:crypto'

// ── Setup ────────────────────────────────────────────────────────────────────

const VALID_KEY_HEX = 'a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2'

beforeEach(() => {
  vi.clearAllMocks()
  process.env.CERTIFICADO_ENCRYPTION_KEY = VALID_KEY_HEX
})

afterEach(() => {
  delete process.env.CERTIFICADO_ENCRYPTION_KEY
})

// ── Import do módulo sob teste (após setup do env) ──────────────────────────

// Re-importar em cada teste não é necessário — env vars são lidas em runtime
import { encryptBuffer, decryptToBuffer } from '../../../servicos-global/cadastros/server/src/lib/certificado-crypto.js'

// ── encryptBuffer ───────────────────────────────────────────────────────────

describe('encryptBuffer', () => {
  it('retorna string no formato iv:authTag:ciphertext (3 partes hex)', () => {
    const input = Buffer.from('certificado de teste PFX binário')
    const result = encryptBuffer(input)

    const parts = result.split(':')
    expect(parts).toHaveLength(3)
    expect(parts[0]).toMatch(/^[0-9a-f]{32}$/) // IV = 16 bytes = 32 hex chars
    expect(parts[1]).toMatch(/^[0-9a-f]{32}$/) // AuthTag = 16 bytes = 32 hex chars
    expect(parts[2]).toMatch(/^[0-9a-f]+$/)    // Ciphertext hex
  })

  it('produz output diferente para o mesmo input (IV aleatório)', () => {
    const input = Buffer.from('dados repetidos')
    const result1 = encryptBuffer(input)
    const result2 = encryptBuffer(input)

    expect(result1).not.toBe(result2)
  })

  it('encripta buffer grande (1MB)', () => {
    const largeBuffer = randomBytes(1024 * 1024)
    const result = encryptBuffer(largeBuffer)

    expect(result.split(':')).toHaveLength(3)
    expect(result.length).toBeGreaterThan(2 * 1024 * 1024) // hex = 2x bytes
  })

  it('encripta buffer vazio sem erro', () => {
    const empty = Buffer.alloc(0)
    const result = encryptBuffer(empty)
    const parts = result.split(':')
    expect(parts).toHaveLength(3)
  })

  it('lança erro quando CERTIFICADO_ENCRYPTION_KEY não está definida', () => {
    delete process.env.CERTIFICADO_ENCRYPTION_KEY
    expect(() => encryptBuffer(Buffer.from('test'))).toThrow('CERTIFICADO_ENCRYPTION_KEY não configurada')
  })

  it('lança erro quando chave tem formato inválido (tamanho errado)', () => {
    process.env.CERTIFICADO_ENCRYPTION_KEY = 'abc123'
    expect(() => encryptBuffer(Buffer.from('test'))).toThrow('formato inválido')
  })
})

// ── decryptToBuffer ─────────────────────────────────────────────────────────

describe('decryptToBuffer', () => {
  it('roundtrip: encrypt → decrypt retorna o buffer original', () => {
    const original = Buffer.from('conteúdo PFX original com bytes binários \x00\xFF\xFE')
    const encrypted = encryptBuffer(original)
    const decrypted = decryptToBuffer(encrypted)

    expect(decrypted.equals(original)).toBe(true)
  })

  it('roundtrip com buffer grande (512KB)', () => {
    const original = randomBytes(512 * 1024)
    const encrypted = encryptBuffer(original)
    const decrypted = decryptToBuffer(encrypted)

    expect(decrypted.equals(original)).toBe(true)
  })

  it('lança erro para formato inválido (sem separadores ":")', () => {
    expect(() => decryptToBuffer('dadosinvalidos')).toThrow('Formato de certificado criptografado inválido')
  })

  it('lança erro para formato com apenas 2 partes', () => {
    expect(() => decryptToBuffer('aabb:ccdd')).toThrow('Formato de certificado criptografado inválido')
  })

  it('lança erro quando IV tem tamanho incorreto', () => {
    const shortIv = 'aabb' // muito curto
    const validTag = 'a'.repeat(32)
    const validCiphertext = 'ff'.repeat(10)
    expect(() => decryptToBuffer(`${shortIv}:${validTag}:${validCiphertext}`)).toThrow('IV ou AuthTag com tamanho inválido')
  })

  it('lança erro quando AuthTag tem tamanho incorreto', () => {
    const validIv = 'a'.repeat(32)
    const shortTag = 'bb'
    const validCiphertext = 'ff'.repeat(10)
    expect(() => decryptToBuffer(`${validIv}:${shortTag}:${validCiphertext}`)).toThrow('IV ou AuthTag com tamanho inválido')
  })

  it('lança erro para ciphertext adulterado (integrity check GCM)', () => {
    const original = Buffer.from('teste de integridade')
    const encrypted = encryptBuffer(original)
    const parts = encrypted.split(':')
    // Adulterar um byte do ciphertext
    const tampered = parts[2].substring(0, parts[2].length - 2) + 'ff'
    expect(() => decryptToBuffer(`${parts[0]}:${parts[1]}:${tampered}`)).toThrow()
  })

  it('lança erro para AuthTag adulterada', () => {
    const original = Buffer.from('teste de tag')
    const encrypted = encryptBuffer(original)
    const parts = encrypted.split(':')
    // Adulterar auth tag
    const tamperedTag = 'f'.repeat(32)
    expect(() => decryptToBuffer(`${parts[0]}:${tamperedTag}:${parts[2]}`)).toThrow()
  })

  it('lança erro quando CERTIFICADO_ENCRYPTION_KEY não está definida', () => {
    const encrypted = encryptBuffer(Buffer.from('test'))
    delete process.env.CERTIFICADO_ENCRYPTION_KEY
    expect(() => decryptToBuffer(encrypted)).toThrow('CERTIFICADO_ENCRYPTION_KEY não configurada')
  })

  it('lança erro ao tentar descriptografar com chave diferente', () => {
    const original = Buffer.from('dados sensíveis')
    const encrypted = encryptBuffer(original)

    // Mudar para outra chave válida
    process.env.CERTIFICADO_ENCRYPTION_KEY = 'b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3'
    expect(() => decryptToBuffer(encrypted)).toThrow()
  })
})

// ── getKey (testada via encrypt/decrypt) ────────────────────────────────────

describe('getKey (via encrypt/decrypt)', () => {
  it('aceita chave de 64 hex chars (32 bytes)', () => {
    process.env.CERTIFICADO_ENCRYPTION_KEY = randomBytes(32).toString('hex')
    const data = Buffer.from('ok')
    const encrypted = encryptBuffer(data)
    const decrypted = decryptToBuffer(encrypted)
    expect(decrypted.equals(data)).toBe(true)
  })

  it('aceita chave de 44 chars base64 (32 bytes)', () => {
    process.env.CERTIFICADO_ENCRYPTION_KEY = randomBytes(32).toString('base64')
    const data = Buffer.from('base64 key test')
    const encrypted = encryptBuffer(data)
    const decrypted = decryptToBuffer(encrypted)
    expect(decrypted.equals(data)).toBe(true)
  })
})
