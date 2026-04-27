/**
 * portalUnicoAuth.ts — Strategy pattern para autenticacao com Portal Unico
 *
 * Dois metodos:
 * 1. Certificado Digital (e-CNPJ/e-CPF) — mTLS → JWT 1h
 * 2. Token OAuth2 (gov.br/Serpro) — client_credentials → Bearer token
 *
 * Credenciais armazenadas com AES-256-GCM (model PortalCredencial)
 * JWT cacheado em memoria — NUNCA no banco
 */

import https from 'https'
import axios from 'axios'
import { PrismaClient } from '@prisma/client'
import { decrypt } from '../lib/encryption.js'
import { AppError } from '../services/lpcoStatusEngine.js'

export interface AuthResult {
  token: string
  expiresAt: Date
  canWrite: boolean
  method: 'CERTIFICADO_DIGITAL' | 'TOKEN_OAUTH2'
}

interface AuthStrategy {
  authenticate(): Promise<AuthResult>
  canWrite(): boolean
}

const PORTAL_BASE_URL = process.env.PORTAL_UNICO_ENV === 'production'
  ? process.env.PORTAL_UNICO_BASE_URL ?? 'https://api.portalunico.siscomex.gov.br'
  : process.env.PORTAL_UNICO_TRAINING_URL ?? 'https://val.portalunico.siscomex.gov.br'

// ── Strategy 1: Certificado Digital (mTLS → JWT 1h) ─────────────────────────

class CertificadoDigitalStrategy implements AuthStrategy {
  private pfxBuffer: Buffer
  private pfxSenha: string

  constructor(pfxEncrypted: string, senhaEncrypted: string) {
    this.pfxBuffer = Buffer.from(decrypt(pfxEncrypted), 'base64')
    this.pfxSenha = decrypt(senhaEncrypted)
  }

  canWrite(): boolean {
    return true
  }

  async authenticate(): Promise<AuthResult> {
    const httpsAgent = new https.Agent({
      pfx: this.pfxBuffer,
      passphrase: this.pfxSenha,
      rejectUnauthorized: process.env.NODE_ENV === 'production',
    })

    const response = await axios.post(
      `${PORTAL_BASE_URL}/portal/api/autenticar`,
      {},
      {
        httpsAgent,
        headers: { 'Content-Type': 'application/json' },
        timeout: 30_000,
      }
    )

    const token = response.data?.token ?? response.data?.access_token
    if (!token) {
      throw new AppError('Resposta de autenticacao do Portal Unico sem token', 502, 'PORTAL_AUTH_NO_TOKEN')
    }

    // JWT do Portal tem validade de 1h — refresh 5min antes
    const expiresAt = new Date(Date.now() + 55 * 60 * 1000)

    return { token, expiresAt, canWrite: true, method: 'CERTIFICADO_DIGITAL' }
  }
}

// ── Strategy 2: Token OAuth2 (client_credentials → Bearer) ───────────────────

class TokenOAuth2Strategy implements AuthStrategy {
  private clientId: string
  private clientSecret: string
  private scope: string

  constructor(clientId: string, clientSecretEncrypted: string, scope: string) {
    this.clientId = clientId
    this.clientSecret = decrypt(clientSecretEncrypted)
    this.scope = scope
  }

  canWrite(): boolean {
    // OAuth2 pode ter escopo limitado a consultas
    return this.scope.includes('escrita') || this.scope.includes('write')
  }

  async authenticate(): Promise<AuthResult> {
    const params = new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: this.clientId,
      client_secret: this.clientSecret,
      scope: this.scope,
    })

    const response = await axios.post(
      `${PORTAL_BASE_URL}/portal/api/oauth/token`,
      params.toString(),
      {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        timeout: 30_000,
      }
    )

    const token = response.data?.access_token
    if (!token) {
      throw new AppError('Resposta OAuth2 do Portal Unico sem access_token', 502, 'PORTAL_OAUTH_NO_TOKEN')
    }

    const expiresIn = response.data?.expires_in ?? 3600
    const expiresAt = new Date(Date.now() + (expiresIn - 300) * 1000)

    return {
      token,
      expiresAt,
      canWrite: this.canWrite(),
      method: 'TOKEN_OAUTH2',
    }
  }
}

// ── Gerenciador de Autenticacao ──────────────────────────────────────────────

export class PortalUnicoAuth {
  private tokenCache: Map<string, AuthResult> = new Map()
  private prisma: PrismaClient

  constructor(prisma: PrismaClient) {
    this.prisma = prisma
  }

  async authenticate(tenantId: string, companyId: string): Promise<AuthResult> {
    // 1. Verificar cache
    const cacheKey = `${tenantId}:${companyId}`
    const cached = this.tokenCache.get(cacheKey)
    if (cached && cached.expiresAt > new Date()) {
      return cached
    }

    // 2. Buscar credenciais do banco — priorizar certificado digital
    const credenciais = await this.prisma.portalCredencial.findMany({
      where: { tenant_id: tenantId, company_id: companyId, status: 'ativo' },
      orderBy: { tipo_auth: 'asc' }, // CERTIFICADO_DIGITAL vem antes de TOKEN_OAUTH2
    })

    if (credenciais.length === 0) {
      throw new AppError(
        'Nenhuma credencial do Portal Unico configurada para esta empresa',
        400,
        'CREDENCIAL_NAO_CONFIGURADA'
      )
    }

    // 3. Tentar autenticar com cada credencial (prioridade: certificado > oauth2)
    let lastError: Error | null = null

    for (const cred of credenciais) {
      try {
        let strategy: AuthStrategy

        if (cred.tipo_auth === 'CERTIFICADO_DIGITAL') {
          if (!cred.certificado_encrypted || !cred.certificado_senha_encrypted) {
            continue
          }
          // Verificar validade do certificado
          if (cred.certificado_validade && cred.certificado_validade < new Date()) {
            console.error(`[PortalUnicoAuth] Certificado expirado para ${cacheKey}`)
            continue
          }
          strategy = new CertificadoDigitalStrategy(
            cred.certificado_encrypted,
            cred.certificado_senha_encrypted
          )
        } else if (cred.tipo_auth === 'TOKEN_OAUTH2') {
          if (!cred.oauth_client_id || !cred.oauth_client_secret_encrypted) {
            continue
          }
          strategy = new TokenOAuth2Strategy(
            cred.oauth_client_id,
            cred.oauth_client_secret_encrypted,
            cred.oauth_scope ?? ''
          )
        } else {
          continue
        }

        const result = await strategy.authenticate()

        // 4. Cachear resultado em memoria
        this.tokenCache.set(cacheKey, result)

        // 5. Atualizar ultimo_uso
        await this.prisma.portalCredencial.update({
          where: { id: cred.id },
          data: { ultimo_uso: new Date() },
        }).catch(() => {})

        return result
      } catch (err) {
        lastError = err instanceof Error ? err : new Error(String(err))
        console.error(`[PortalUnicoAuth] Falha com ${cred.tipo_auth}: ${lastError.message}`)
      }
    }

    throw new AppError(
      `Falha ao autenticar com Portal Unico: ${lastError?.message ?? 'nenhuma credencial valida'}`,
      502,
      'PORTAL_AUTH_FAILED'
    )
  }

  /**
   * Verificar se tem credencial que permite escrita (registrar LPCO).
   * Se so tem OAuth2 sem escopo de escrita, retorna false.
   */
  async canWrite(tenantId: string, companyId: string): Promise<boolean> {
    try {
      const result = await this.authenticate(tenantId, companyId)
      return result.canWrite
    } catch {
      return false
    }
  }

  /**
   * Invalidar cache (usar apos rotacao de credenciais)
   */
  invalidateCache(tenantId: string, companyId: string): void {
    this.tokenCache.delete(`${tenantId}:${companyId}`)
  }
}
