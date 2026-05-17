/**
 * certificado-crypto.ts — AES-256-GCM para certificado digital Siscomex (.pfx/.p12)
 *
 * Padrão Gravity: encrypt no upload, decrypt apenas no momento da auth TTCE.
 * Env var: CERTIFICADO_ENCRYPTION_KEY (64 hex chars = 32 bytes)
 * Formato armazenado: iv:authTag:ciphertext (tudo em hex)
 */

import { createCipheriv, createDecipheriv, randomBytes } from 'node:crypto'
import { AppError } from './app-error.js'

const ALGORITHM = 'aes-256-gcm'
const IV_LENGTH = 16
const TAG_LENGTH = 16

function getKey(): Buffer {
  const raw = process.env.CERTIFICADO_ENCRYPTION_KEY
  if (!raw) {
    throw new AppError('CERTIFICADO_ENCRYPTION_KEY não configurada', 500, 'CERT_ENCRYPTION_KEY_MISSING')
  }
  if (raw.length === 64) return Buffer.from(raw, 'hex')
  if (raw.length === 44) return Buffer.from(raw, 'base64').subarray(0, 32)
  throw new AppError('CERTIFICADO_ENCRYPTION_KEY formato inválido (esperado 64 hex ou 44 base64)', 500, 'CERT_ENCRYPTION_KEY_INVALID')
}

export function encryptBuffer(plainBuffer: Buffer): string {
  const key = getKey()
  const iv = randomBytes(IV_LENGTH)
  const cipher = createCipheriv(ALGORITHM, key, iv)

  const encrypted = Buffer.concat([cipher.update(plainBuffer), cipher.final()])
  const tag = cipher.getAuthTag()

  return `${iv.toString('hex')}:${tag.toString('hex')}:${encrypted.toString('hex')}`
}

export function decryptToBuffer(encryptedString: string): Buffer {
  const key = getKey()
  const parts = encryptedString.split(':')

  if (parts.length !== 3) {
    throw new AppError('Formato de certificado criptografado inválido', 500, 'CERT_DECRYPT_FORMAT_ERROR')
  }

  const iv = Buffer.from(parts[0], 'hex')
  const tag = Buffer.from(parts[1], 'hex')
  const ciphertext = Buffer.from(parts[2], 'hex')

  if (iv.length !== IV_LENGTH || tag.length !== TAG_LENGTH) {
    throw new AppError('IV ou AuthTag com tamanho inválido', 500, 'CERT_DECRYPT_SIZE_ERROR')
  }

  const decipher = createDecipheriv(ALGORITHM, key, iv)
  decipher.setAuthTag(tag)

  return Buffer.concat([decipher.update(ciphertext), decipher.final()])
}
