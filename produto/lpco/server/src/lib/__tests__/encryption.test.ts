/**
 * encryption.test.ts — Testes unitarios para AES-256-GCM encryption
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest'

// Setar ENCRYPTION_KEY antes de importar o modulo
const VALID_HEX_KEY = 'a'.repeat(64) // 64 hex chars = 32 bytes

describe('encryption', () => {
  let encrypt: (plaintext: string) => string
  let decrypt: (encryptedString: string) => string
  let originalKey: string | undefined

  beforeEach(async () => {
    originalKey = process.env.ENCRYPTION_KEY
    process.env.ENCRYPTION_KEY = VALID_HEX_KEY

    // Re-import para pegar a env atualizada
    const mod = await import('../encryption.js')
    encrypt = mod.encrypt
    decrypt = mod.decrypt
  })

  afterEach(() => {
    if (originalKey !== undefined) {
      process.env.ENCRYPTION_KEY = originalKey
    } else {
      delete process.env.ENCRYPTION_KEY
    }
  })

  // ── Round-trip ────────────────────────────────────────────────────────────

  describe('round-trip encrypt/decrypt', () => {
    it('deve criptografar e descriptografar texto simples', () => {
      const original = 'minha senha secreta'
      const encrypted = encrypt(original)
      const decrypted = decrypt(encrypted)
      expect(decrypted).toBe(original)
    })

    it('deve funcionar com string vazia', () => {
      const original = ''
      const encrypted = encrypt(original)
      const decrypted = decrypt(encrypted)
      expect(decrypted).toBe(original)
    })

    it('deve funcionar com caracteres unicode', () => {
      const original = 'senha com acentos: cafe, nariz, coracao'
      const encrypted = encrypt(original)
      const decrypted = decrypt(encrypted)
      expect(decrypted).toBe(original)
    })

    it('deve funcionar com texto longo (1KB)', () => {
      const original = 'x'.repeat(1024)
      const encrypted = encrypt(original)
      const decrypted = decrypt(encrypted)
      expect(decrypted).toBe(original)
    })

    it('deve funcionar com texto muito longo (100KB)', () => {
      const original = 'dados-sensiveis-'.repeat(6400)
      const encrypted = encrypt(original)
      const decrypted = decrypt(encrypted)
      expect(decrypted).toBe(original)
    })

    it('deve funcionar com JSON serializado', () => {
      const original = JSON.stringify({
        certificado: 'base64data...',
        senha: 'p@ssw0rd!',
        client_secret: 'sk_live_abc123',
      })
      const encrypted = encrypt(original)
      const decrypted = decrypt(encrypted)
      expect(decrypted).toBe(original)
    })

    it('deve funcionar com caracteres especiais', () => {
      const original = '!@#$%^&*()_+-=[]{}|;:,.<>?/~`'
      const encrypted = encrypt(original)
      const decrypted = decrypt(encrypted)
      expect(decrypted).toBe(original)
    })
  })

  // ── Formato ───────────────────────────────────────────────────────────────

  describe('formato do output', () => {
    it('deve retornar formato iv:tag:ciphertext', () => {
      const encrypted = encrypt('teste')
      const parts = encrypted.split(':')
      expect(parts).toHaveLength(3)
    })

    it('IV deve ter 32 hex chars (16 bytes)', () => {
      const encrypted = encrypt('teste')
      const iv = encrypted.split(':')[0]
      expect(iv).toHaveLength(32)
      expect(/^[0-9a-f]+$/.test(iv)).toBe(true)
    })

    it('Auth tag deve ter 32 hex chars (16 bytes)', () => {
      const encrypted = encrypt('teste')
      const tag = encrypted.split(':')[1]
      expect(tag).toHaveLength(32)
      expect(/^[0-9a-f]+$/.test(tag)).toBe(true)
    })

    it('ciphertext deve ser hex', () => {
      const encrypted = encrypt('teste')
      const ciphertext = encrypted.split(':')[2]
      expect(/^[0-9a-f]*$/.test(ciphertext)).toBe(true)
    })

    it('deve gerar IVs diferentes para o mesmo plaintext', () => {
      const encrypted1 = encrypt('mesmo texto')
      const encrypted2 = encrypt('mesmo texto')
      expect(encrypted1).not.toBe(encrypted2)
      // Mas ambos devem descriptografar para o mesmo valor
      expect(decrypt(encrypted1)).toBe('mesmo texto')
      expect(decrypt(encrypted2)).toBe('mesmo texto')
    })
  })

  // ── Validacao de formato ──────────────────────────────────────────────────

  describe('validacao de formato na descriptografia', () => {
    it('deve lancar erro para formato invalido (sem separadores)', () => {
      expect(() => decrypt('dadosinvalidos')).toThrow('Formato de dado criptografado invalido')
    })

    it('deve lancar erro para formato com apenas 2 partes', () => {
      expect(() => decrypt('parte1:parte2')).toThrow('Formato de dado criptografado invalido')
    })

    it('deve lancar erro para formato com 4 partes', () => {
      expect(() => decrypt('a:b:c:d')).toThrow()
    })

    it('deve lancar erro ao descriptografar com IV adulterado', () => {
      const encrypted = encrypt('texto seguro')
      const parts = encrypted.split(':')
      // Alterar IV
      parts[0] = '0'.repeat(32)
      expect(() => decrypt(parts.join(':'))).toThrow()
    })

    it('deve lancar erro ao descriptografar com tag adulterada', () => {
      const encrypted = encrypt('texto seguro')
      const parts = encrypted.split(':')
      // Alterar auth tag
      parts[1] = '0'.repeat(32)
      expect(() => decrypt(parts.join(':'))).toThrow()
    })

    it('deve lancar erro ao descriptografar com ciphertext adulterado', () => {
      const encrypted = encrypt('texto seguro')
      const parts = encrypted.split(':')
      // Alterar ciphertext
      parts[2] = '0'.repeat(parts[2].length)
      expect(() => decrypt(parts.join(':'))).toThrow()
    })
  })

  // ── Chave ausente ─────────────────────────────────────────────────────────

  describe('ENCRYPTION_KEY ausente', () => {
    it('deve lancar erro se ENCRYPTION_KEY nao esta definida', () => {
      delete process.env.ENCRYPTION_KEY
      expect(() => encrypt('teste')).toThrow('ENCRYPTION_KEY nao configurada')
    })

    it('deve lancar erro no decrypt se ENCRYPTION_KEY nao esta definida', () => {
      const encrypted = encrypt('teste')
      delete process.env.ENCRYPTION_KEY
      expect(() => decrypt(encrypted)).toThrow('ENCRYPTION_KEY nao configurada')
    })
  })
})
