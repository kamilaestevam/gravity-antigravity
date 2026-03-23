import { describe, it, expect } from 'vitest'
import { generateTokenAPIKey, hashToken, encryptAES, decryptAES, generateWebhookSecret, generateHMACSignature } from '../../servicos-global/tenant/api-cockpit/server/src/crypto'

describe('API Cockpit - Crypto Utilities', () => {

  describe('Tokens API', () => {
    it('should generate a valid live token and hash', () => {
      const { token, hash } = generateTokenAPIKey('gv_live_sk_')
      
      expect(token.startsWith('gv_live_sk_')).toBe(true)
      expect(token).toHaveLength(75) // Prefix(11) + 64 hex chars
      
      const expectedHash = hashToken(token)
      expect(hash).toBe(expectedHash)
    })

    it('should generate a valid test token and hash', () => {
      const { token, hash } = generateTokenAPIKey('gv_test_sk_')
      
      expect(token.startsWith('gv_test_sk_')).toBe(true)
      expect(token).toHaveLength(75)
    })
  })

  describe('ERP Connections - AES 256 GCM', () => {
    // Exactly 64 hex characters (32 bytes)
    const mockEncryptionKey = '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef'

    it('should encrypt and decrypt a string payload successfully', () => {
      const payload = JSON.stringify({
        baseUrl: 'https://sap.example.com',
        username: 'admin',
        password: 'supersecretpassword123'
      })

      const cipherText = encryptAES(payload, mockEncryptionKey)
      expect(cipherText).toContain(':')
      expect(cipherText).not.toContain('supersecretpassword123')

      const decipheredText = decryptAES(cipherText, mockEncryptionKey)
      expect(decipheredText).toBe(payload)
      
      const parsed = JSON.parse(decipheredText)
      expect(parsed.baseUrl).toBe('https://sap.example.com')
      expect(parsed.password).toBe('supersecretpassword123')
    })

    it('should throw an error if the key length is invalid', () => {
      const invalidKey = '123'
      expect(() => {
        encryptAES('test', invalidKey)
      }).toThrow('Encryption key must be exactly 64 hex characters (32 bytes)')
    })
  })

  describe('Webhooks', () => {
    it('should generate a 64 character hex webhook secret', () => {
      const secret = generateWebhookSecret()
      expect(secret).toHaveLength(64)
      expect(/^[0-9a-f]{64}$/.test(secret)).toBe(true)
    })

    it('should generate a consistent HMAC signature', () => {
      const payload = JSON.stringify({ event: 'test', data: 123 })
      const secret = 'my_test_secret_key'

      const sig1 = generateHMACSignature(payload, secret)
      const sig2 = generateHMACSignature(payload, secret)

      expect(sig1).toBe(sig2)
      expect(sig1).toHaveLength(64) // sha256 hex length
    })
  })

})
