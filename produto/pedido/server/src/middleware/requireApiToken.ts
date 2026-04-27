/**
 * requireApiToken.ts — Middleware de validação de token de API pública
 *
 * Aceita requisições com header Authorization: Bearer gv_live_sk_* ou gv_test_sk_*
 * e valida o token junto ao api-cockpit antes de prosseguir.
 *
 * Ao validar com sucesso, injeta tenantId e scopes no req para uso nas rotas.
 *
 * Skill: antigravity-api-cockpit, antigravity-autenticacao-s2s
 */

import { Request, Response, NextFunction } from 'express'
import { AppError } from '../errors/AppError.js'

/** Padrão de prefixo dos tokens Gravity */
const TOKEN_PATTERN = /^gv_(live|test)_sk_/

const API_COCKPIT_URL = process.env.API_COCKPIT_URL || 'http://localhost:8016'
const INTERNAL_SERVICE_KEY = process.env.INTERNAL_SERVICE_KEY || ''

interface ValidateTokenResponse {
  valid: boolean
  tenant_id: string
  scopes: string[]
}

/** Declaração de extensão de tipo — evita any explícito */
declare module 'express-serve-static-core' {
  interface Request {
    apiTenantId?: string
    apiScopes?: string[]
  }
}

/**
 * Extrai o Bearer token do header Authorization.
 * Retorna null se o header estiver ausente ou mal formatado.
 */
function extractBearerToken(authHeader: string | undefined): string | null {
  if (!authHeader) return null
  const parts = authHeader.split(' ')
  if (parts.length !== 2 || parts[0] !== 'Bearer') return null
  return parts[1]
}

/**
 * Valida o token junto ao api-cockpit via chamada S2S.
 * Throws AppError em caso de falha de comunicação.
 */
async function validateTokenWithCockpit(token: string): Promise<ValidateTokenResponse> {
  const response = await fetch(
    `${API_COCKPIT_URL}/api/v1/api-tokens/validate`,
    {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'x-internal-key': INTERNAL_SERVICE_KEY,
        'Content-Type': 'application/json',
      },
      signal: AbortSignal.timeout(5_000),
    },
  )

  if (!response.ok) {
    throw new AppError('Token API inválido', 401, 'UNAUTHORIZED')
  }

  return response.json() as Promise<ValidateTokenResponse>
}

/**
 * Middleware factory — retorna middleware que valida token de API externo.
 *
 * Uso nas rotas públicas (sem Clerk JWT):
 *   router.use(requireApiToken())
 */
export function requireApiToken() {
  return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    try {
      const authHeader = req.headers['authorization']
      const token = extractBearerToken(authHeader)

      if (!token) {
        return next(new AppError('Token API ausente', 401, 'UNAUTHORIZED'))
      }

      if (!TOKEN_PATTERN.test(token)) {
        return next(new AppError('Formato de token inválido', 401, 'UNAUTHORIZED'))
      }

      const result = await validateTokenWithCockpit(token)

      if (!result.valid) {
        return next(new AppError('Token API inválido', 401, 'UNAUTHORIZED'))
      }

      // Injetar dados validados no request para uso nas rotas
      req.apiTenantId = result.tenant_id
      req.apiScopes = result.scopes

      next()
    } catch (err) {
      if (err instanceof AppError) {
        return next(err)
      }
      // Falha de comunicação com api-cockpit — tratar como token inválido
      next(new AppError('Não foi possível validar o token', 503, 'SERVICE_UNAVAILABLE'))
    }
  }
}
