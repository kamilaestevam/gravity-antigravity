import crypto from 'crypto'


const CIPHER_ALGO = 'aes-256-gcm'

// Hash generation for Tokens (SHA-256)
export function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex')
}

// Generate new random Token API Key
export function generateTokenAPIKey(prefix: 'gv_live_sk_' | 'gv_test_sk_'): { token: string; hash: string } {
  const randomBytes = crypto.randomBytes(32).toString('hex')
  const token = `${prefix}${randomBytes}`
  const hash = hashToken(token)
  return { token, hash }
}

// AES-256-GCM encryption
export function encryptAES(plainText: string, encryptionKey: string): string {
  if (encryptionKey.length !== 64) {
    throw new Error('Encryption key must be exactly 64 hex characters (32 bytes)')
  }
  const keyBuffer = Buffer.from(encryptionKey, 'hex')
  const iv = crypto.randomBytes(16)
  const cipher = crypto.createCipheriv(CIPHER_ALGO, keyBuffer, iv)

  let encrypted = cipher.update(plainText, 'utf8', 'hex')
  encrypted += cipher.final('hex')
  const authTag = cipher.getAuthTag().toString('hex')

  return `${iv.toString('hex')}:${authTag}:${encrypted}`
}

// AES-256-GCM decryption
export function decryptAES(cipherText: string, encryptionKey: string): string {
  try {
    const keyBuffer = Buffer.from(encryptionKey, 'hex')
    const [ivHex, authTagHex, encryptedHex] = cipherText.split(':')

    if (!ivHex || !authTagHex || !encryptedHex) {
      throw new Error('Invalid cipher text format')
    }

    const iv = Buffer.from(ivHex, 'hex')
    const authTag = Buffer.from(authTagHex, 'hex')
    const decipher = crypto.createDecipheriv(CIPHER_ALGO, keyBuffer, iv)
    decipher.setAuthTag(authTag)

    let decrypted = decipher.update(encryptedHex, 'hex', 'utf8')
    decrypted += decipher.final('utf8')
    return decrypted
  } catch (err: any) {
    throw new Error('Decryption failed')
  }
}

// Webhook HMAC validation/generation
export function generateHMACSignature(payload: string, secret: string): string {
  return crypto.createHmac('sha256', secret).update(payload).digest('hex')
}

export function generateWebhookSecret(): string {
  return crypto.randomBytes(32).toString('hex')
}
