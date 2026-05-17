/**
 * siscomex-auth.ts — Autenticação com Portal Único Siscomex via certificado digital
 *
 * Fluxo:
 * 1. Buscar certificado ativo no banco (CertificadoDigitalSiscomex)
 * 2. Descriptografar PFX (AES-256-GCM)
 * 3. Extrair cert+key como PEM via node-forge (compatível com ICP-Brasil)
 * 4. Criar HTTPS Agent com mTLS (PEM cert + key)
 * 5. POST /portal/api/autenticar → JWT
 * 6. Cache do JWT in-memory (TTL conservador: 50min de 60min validade)
 *
 * Env vars:
 *   SISCOMEX_AUTH_URL — URL de autenticação (default: portalunico.siscomex.gov.br)
 *   SISCOMEX_AUTH_ROLE — role-type header (default: RESPONSAVEL_LEGAL)
 */

import https from 'node:https'
import { prisma } from '../lib/prisma.js'
import { decryptToBuffer } from '../lib/certificado-crypto.js'
import { extrairPemDoP12 } from './certificado-parser.js'
import { AppError } from '../lib/app-error.js'

const AUTH_URL = process.env.SISCOMEX_AUTH_URL ?? 'https://portalunico.siscomex.gov.br/portal/api/autenticar'
const AUTH_ROLE = process.env.SISCOMEX_AUTH_ROLE ?? 'IMPEXP'
const TOKEN_TTL_MS = 50 * 60 * 1000 // 50 minutos (conservador)
const AUTH_TIMEOUT_MS = 15_000

interface TokenCache {
  jwt: string
  expiresAt: number
}

let tokenCache: TokenCache | null = null

export async function obterTokenSiscomex(): Promise<string> {
  if (tokenCache && tokenCache.expiresAt > Date.now()) {
    return tokenCache.jwt
  }

  const certificado = await prisma.certificadoDigitalSiscomex.findFirst({
    where: { ativo_certificado_digital_siscomex: true },
    select: {
      pfx_criptografado_certificado_digital_siscomex: true,
      senha_hash_certificado_digital_siscomex: true,
      cnpj_certificado_digital_siscomex: true,
    },
  })

  if (!certificado) {
    throw new AppError(
      'Nenhum certificado digital Siscomex ativo configurado',
      503,
      'CERT_NOT_CONFIGURED',
    )
  }

  const pfxBuffer = decryptToBuffer(certificado.pfx_criptografado_certificado_digital_siscomex)
  const senhaPfx = decryptToBuffer(certificado.senha_hash_certificado_digital_siscomex).toString('utf8')

  const agent = criarAgentMtls(pfxBuffer, senhaPfx)

  const jwt = await autenticarPortalUnico(agent, certificado.cnpj_certificado_digital_siscomex)

  tokenCache = { jwt, expiresAt: Date.now() + TOKEN_TTL_MS }

  return jwt
}

export function invalidarCacheToken(): void {
  tokenCache = null
}

function criarAgentMtls(pfxBuffer: Buffer, passphrase: string): https.Agent {
  const { certPem, keyPem } = extrairPemDoP12(pfxBuffer, passphrase)

  return new https.Agent({
    cert: certPem,
    key: keyPem,
    keepAlive: false,
    timeout: AUTH_TIMEOUT_MS,
  })
}

async function autenticarPortalUnico(agent: https.Agent, cpfCnpj: string): Promise<string> {
  const url = new URL(AUTH_URL)

  const body = JSON.stringify({ cpfCnpj })

  return new Promise((resolve, reject) => {
    const req = https.request(
      {
        hostname: url.hostname,
        port: url.port || 443,
        path: url.pathname,
        method: 'POST',
        agent,
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(body),
          'Role-Type': AUTH_ROLE,
        },
        timeout: AUTH_TIMEOUT_MS,
      },
      (res) => {
        let data = ''
        res.on('data', (chunk: Buffer) => { data += chunk.toString() })
        res.on('end', () => {
          if (res.statusCode === 200 || res.statusCode === 201) {
            try {
              const parsed = JSON.parse(data)
              const token = parsed.token ?? parsed.access_token ?? parsed.set_token
              if (token && typeof token === 'string') {
                resolve(token)
                return
              }
              const headerToken = res.headers['set-token'] ?? res.headers['x-csrf-token']
              if (headerToken && typeof headerToken === 'string') {
                resolve(headerToken)
                return
              }
              reject(new AppError('Resposta de autenticação Siscomex sem token', 502, 'SISCOMEX_AUTH_NO_TOKEN'))
            } catch {
              if (data.length > 20 && data.length < 4096) {
                resolve(data.trim())
                return
              }
              reject(new AppError('Resposta de autenticação Siscomex inválida', 502, 'SISCOMEX_AUTH_INVALID_RESPONSE'))
            }
          } else if (res.statusCode === 401 || res.statusCode === 403) {
            reject(new AppError(
              `Certificado rejeitado pelo Portal Único (HTTP ${res.statusCode}): ${data.substring(0, 500)}`,
              502,
              'SISCOMEX_AUTH_REJECTED',
            ))
          } else {
            reject(new AppError(
              `Erro na autenticação Siscomex (HTTP ${res.statusCode}): ${data.substring(0, 500)}`,
              502,
              'SISCOMEX_AUTH_ERROR',
            ))
          }
        })
      },
    )

    req.on('error', (err) => {
      reject(new AppError(
        `Falha na conexão com Portal Único: ${err.message}`,
        503,
        'SISCOMEX_AUTH_CONNECT_ERROR',
      ))
    })

    req.on('timeout', () => {
      req.destroy()
      reject(new AppError('Timeout na autenticação Siscomex', 504, 'SISCOMEX_AUTH_TIMEOUT'))
    })

    req.write(body)
    req.end()
  })
}

export function obterAgentMtlsSiscomex(pfxBuffer: Buffer, senhaPfx: string): https.Agent {
  return criarAgentMtls(pfxBuffer, senhaPfx)
}
