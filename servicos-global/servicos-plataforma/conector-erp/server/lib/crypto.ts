// server/lib/crypto.ts
// Criptografia AES-256-GCM para credenciais ERP.
// NUNCA logar texto decriptado. NUNCA armazenar plain text.

import { createCipheriv, createDecipheriv, randomBytes } from 'crypto'
import { AppError } from './app-error.js'

const ALGORITHM = 'aes-256-gcm' as const

/**
 * Retorna a chave de 32 bytes (256 bits) a partir da variável de ambiente.
 * A env var deve ser um hex de 64 caracteres.
 */
function getKey(): Buffer {
  const keyHex = process.env.ERP_ENCRYPTION_KEY
  if (!keyHex || keyHex.length !== 64) {
    throw new AppError(
      'ERP_ENCRYPTION_KEY inválida — deve ser hex de 64 chars (256 bits)',
      500,
      'CRYPTO_CONFIG_ERROR'
    )
  }
  return Buffer.from(keyHex, 'hex')
}

/**
 * Criptografa texto usando AES-256-GCM.
 * Retorna string no formato "iv:authTag:ciphertext" (tudo em base64).
 */
export function encrypt(plainText: string): string {
  const key = getKey()
  const iv = randomBytes(16)
  const cipher = createCipheriv(ALGORITHM, key, iv)

  const encrypted = Buffer.concat([
    cipher.update(plainText, 'utf8'),
    cipher.final(),
  ])
  const authTag = cipher.getAuthTag()

  return [
    iv.toString('base64'),
    authTag.toString('base64'),
    encrypted.toString('base64'),
  ].join(':')
}

/**
 * Decriptografa string gerada pelo encrypt().
 */
export function decrypt(encryptedText: string): string {
  try {
    const key = getKey()
    const [ivB64, authTagB64, encryptedB64] = encryptedText.split(':')

    if (!ivB64 || !authTagB64 || !encryptedB64) {
      throw new AppError(
        'Formato de credencial criptografada inválido',
        400,
        'CRYPTO_FORMAT_ERROR'
      )
    }

    const decipher = createDecipheriv(
      ALGORITHM,
      key,
      Buffer.from(ivB64, 'base64')
    )
    decipher.setAuthTag(Buffer.from(authTagB64, 'base64'))

    return (
      decipher.update(Buffer.from(encryptedB64, 'base64')).toString('utf8') +
      decipher.final('utf8')
    )
  } catch (err) {
    if (err instanceof AppError) throw err
    throw new AppError(
      'Falha ao decriptografar credencial ERP',
      500,
      'CRYPTO_DECRYPT_ERROR'
    )
  }
}
