import { describe, it, expect, vi, beforeEach } from 'vitest'
import { validateWebhookSignature } from '../servicos-global/tenant/whatsapp/server/services/webhook'
import { normalizePhoneForSend } from '../servicos-global/tenant/whatsapp/server/services/whatsapp'
import crypto from 'crypto'

describe('WhatsApp Service Unit Tests', () => {
  beforeEach(() => {
    process.env.WHATSAPP_APP_SECRET = 'test_secret_123'
  })

  describe('HMAC Webhook Validation', () => {
    it('deve retornar false se não hover signature', () => {
      expect(validateWebhookSignature('{}', '')).toBe(false)
    })

    it('deve retornar false se o secret não estiver configurado', () => {
      delete process.env.WHATSAPP_APP_SECRET
      expect(validateWebhookSignature('{}', 'sha256=123')).toBe(false)
    })

    it('deve validar um signature HMAC correto', () => {
      const payload = JSON.stringify({ test: true })
      const secret = 'test_secret_123'
      const signature = 'sha256=' + crypto.createHmac('sha256', secret).update(payload).digest('hex')
      
      expect(validateWebhookSignature(payload, signature)).toBe(true)
    })

    it('deve retornar false para signature HMAC adulterado', () => {
      const payload = JSON.stringify({ test: true })
      const secret = 'valid_secret'
      process.env.WHATSAPP_APP_SECRET = secret

      const signature = 'sha256=' + crypto.createHmac('sha256', 'wrong_secret').update(payload).digest('hex')
      
      expect(validateWebhookSignature(payload, signature)).toBe(false)
    })
  })

  describe('Phone Normalization', () => {
    it('deve injetar o nono dígito em números do Brasil com 12 dígitos', () => {
      // 55 48 8848-0707 -> 55 48 9 8848-0707
      expect(normalizePhoneForSend('554888480707')).toBe('5548988480707')
    })

    it('não deve alterar número brasileiro que já tenha 13 dígitos', () => {
      expect(normalizePhoneForSend('5548988480707')).toBe('5548988480707')
    })
    
    it('limpará os não digitos da string', () => {
      expect(normalizePhoneForSend('+55 (48) 8848-0707')).toBe('5548988480707')
      expect(normalizePhoneForSend('  +55-48-98848-0707 ')).toBe('5548988480707')
    })

    it('não deve injetar 9 digito em números internacionais', () => {
      // Numero US de exemplo - length difere ou country code não é 55
      expect(normalizePhoneForSend('14155552671')).toBe('14155552671') 
    })
  })
})
