/**
 * portalUnicoAuth.ts — Strategy pattern para autenticacao com Portal Unico
 *
 * Dois metodos:
 * 1. Certificado Digital (e-CNPJ/e-CPF) — mTLS → JWT 1h
 * 2. Token OAuth2 (gov.br/Serpro) — client_credentials → Bearer token
 *
 * Credenciais armazenadas com AES-256-GCM (model SiscomexCredencial)
 * JWT cacheado em memoria — NUNCA no banco
 */

interface AuthResult {
  token: string
  expiresAt: Date
  canWrite: boolean
}

export class PortalUnicoAuth {
  private tokenCache: Map<string, AuthResult> = new Map()

  async authenticate(tenantId: string, companyId: string): Promise<AuthResult> {
    // 1. Verificar cache
    const cacheKey = `${tenantId}:${companyId}`
    const cached = this.tokenCache.get(cacheKey)
    if (cached && cached.expiresAt > new Date()) {
      return cached
    }

    // 2. Buscar credenciais do banco
    // 3. Priorizar certificado digital (full access)
    // 4. Fallback para token OAuth2
    // 5. Se nenhum → throw AppError('CREDENCIAL_NAO_CONFIGURADA')

    // TODO: implementar
    throw new Error('Credencial do Portal Unico nao configurada')
  }
}
