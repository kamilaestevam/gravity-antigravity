import crypto from 'crypto'


const CIPHER_ALGO = 'aes-256-gcm'

// Hash generation for Tokens (SHA-256)
export function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex')
}

// Prefixos DDD canonicos para tokens de API
export type PrefixoApiToken = 'gravity_token_api_producao_' | 'gravity_token_api_homologacao_'

/** Retorna o prefixo correto para o ambiente atual. */
export function obterPrefixoApiToken(): PrefixoApiToken {
  return process.env.NODE_ENV === 'production'
    ? 'gravity_token_api_producao_'
    : 'gravity_token_api_homologacao_'
}

/** Gera um novo token de API com prefixo DDD + 32 bytes hex aleatorios. */
export function gerarApiToken(
  prefixo: PrefixoApiToken,
): { valor_api_token: string; hash_api_token: string } {
  const randomBytes = crypto.randomBytes(32).toString('hex')
  const valor_api_token = `${prefixo}${randomBytes}`
  const hash_api_token = hashToken(valor_api_token)
  return { valor_api_token, hash_api_token }
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
  } catch {
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
