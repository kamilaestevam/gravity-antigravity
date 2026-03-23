// testes/conector-erp/crypto.test.ts
// Testes unitários do módulo de criptografia AES-256-GCM.

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'

// Configurar env antes de importar o módulo
const TEST_KEY = 'a'.repeat(64) // 32 bytes em hex

describe('crypto — AES-256-GCM', () => {
  beforeEach(() => {
    process.env.ERP_ENCRYPTION_KEY = TEST_KEY
  })

  afterEach(() => {
    delete process.env.ERP_ENCRYPTION_KEY
    vi.resetModules()
  })

  it('encrypt retorna string no formato iv:authTag:ciphertext', async () => {
    const { encrypt } = await import(
      '../../servicos-global/tenant/conector-erp/server/lib/crypto.js'
    )
    const result = encrypt('senha-secreta')
    const parts = result.split(':')
    expect(parts).toHaveLength(3)
    parts.forEach((p) => expect(p.length).toBeGreaterThan(0))
  })

  it('decrypt recupera o texto original', async () => {
    const { encrypt, decrypt } = await import(
      '../../servicos-global/tenant/conector-erp/server/lib/crypto.js'
    )
    const plainText = 'minha-senha-erp-123!'
    const encrypted = encrypt(plainText)
    expect(decrypt(encrypted)).toBe(plainText)
  })

  it('dois encrypts do mesmo texto produzem IVs diferentes', async () => {
    const { encrypt } = await import(
      '../../servicos-global/tenant/conector-erp/server/lib/crypto.js'
    )
    const text = 'same-text'
    const a = encrypt(text)
    const b = encrypt(text)
    expect(a).not.toBe(b) // IVs aleatórios
    expect(a.split(':')[0]).not.toBe(b.split(':')[0])
  })

  it('lança AppError se ERP_ENCRYPTION_KEY for inválida', async () => {
    process.env.ERP_ENCRYPTION_KEY = 'short'
    vi.resetModules()
    const { encrypt } = await import(
      '../../servicos-global/tenant/conector-erp/server/lib/crypto.js'
    )
    expect(() => encrypt('text')).toThrow('ERP_ENCRYPTION_KEY inválida')
  })

  it('decrypt lança AppError para formato inválido', async () => {
    const { decrypt } = await import(
      '../../servicos-global/tenant/conector-erp/server/lib/crypto.js'
    )
    expect(() => decrypt('invalido')).toThrow()
  })
})
