/**
 * encryption.ts — AES-256-GCM para credenciais do Portal Unico
 *
 * Usado para criptografar:
 * - Certificado digital (.pfx)
 * - Senha do certificado
 * - OAuth client_secret
 *
 * Chave vem de ENCRYPTION_KEY (env) — 32 bytes hex ou base64.
 */

import { createCipheriv, createDecipheriv, randomBytes } from 'crypto'
import { AppError } from '../services/lpcoStatusEngine.js'

const ALGORITHM = 'aes-256-gcm'
const IV_LENGTH = 16
const TAG_LENGTH = 16

function getKey(): Buffer {
  const raw = process.env.ENCRYPTION_KEY
  if (!raw) {
    throw new AppError('ENCRYPTION_KEY nao configurada', 500, 'ENCRYPTION_KEY_MISSING')
  }
  // Aceita hex (64 chars) ou base64 (44 chars)
  if (raw.length === 64) return Buffer.from(raw, 'hex')
  return Buffer.from(raw, 'base64').subarray(0, 32)
}

export function encrypt(plaintext: string): string {
  const key = getKey()
  const iv = randomBytes(IV_LENGTH)
  const cipher = createCipheriv(ALGORITHM, key, iv)

  let encrypted = cipher.update(plaintext, 'utf8', 'hex')
  encrypted += cipher.final('hex')
  const tag = cipher.getAuthTag()

  // Formato: iv:tag:ciphertext (tudo em hex)
  return `${iv.toString('hex')}:${tag.toString('hex')}:${encrypted}`
}

export function decrypt(encryptedString: string): string {
  const key = getKey()
  const parts = encryptedString.split(':')

  if (parts.length !== 3) {
    throw new AppError('Formato de dado criptografado invalido', 500, 'DECRYPT_FORMAT_ERROR')
  }

  const iv = Buffer.from(parts[0], 'hex')
  const tag = Buffer.from(parts[1], 'hex')
  const ciphertext = parts[2]

  const decipher = createDecipheriv(ALGORITHM, key, iv)
  decipher.setAuthTag(tag)

  let decrypted = decipher.update(ciphertext, 'hex', 'utf8')
  decrypted += decipher.final('utf8')

  return decrypted
}
