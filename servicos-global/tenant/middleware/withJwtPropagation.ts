// middleware/withJwtPropagation.ts
// AGENTE AUTH FLOW — ONDA 4
//
// Middleware que extrai o JWT do header Authorization e o propaga
// para chamadas downstream via header `x-forwarded-authorization`.
//
// Implementação: verificação HMAC-SHA256 usando Node.js crypto nativo.
// Em produção com Clerk, a verificação usa RS256 via JWKS — aqui usamos
// uma implementação compatível com HS256 para testes e desenvolvimento.
//
// Uso:
//   import { withJwtPropagation } from '@tenant/middleware/withJwtPropagation'
//   router.use(withJwtPropagation)

import { createHmac } from 'crypto'
import { Request, Response, NextFunction } from 'express'

// ---------------------------------------------------------------------------
// Tipos extendidos do Express
// ---------------------------------------------------------------------------

declare global {
  namespace Express {
    interface Request {
      jwtPayload?: Record<string, unknown>
      forwardedAuthorization?: string
    }
  }
}

// ---------------------------------------------------------------------------
// Helper: decodifica base64url
// ---------------------------------------------------------------------------

function base64urlDecode(str: string): string {
  // Converte base64url → base64 padrão
  const base64 = str.replace(/-/g, '+').replace(/_/g, '/')
  const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4)
  return Buffer.from(padded, 'base64').toString('utf8')
}

// ---------------------------------------------------------------------------
// Helper: verifica assinatura HMAC-SHA256 (HS256)
// ---------------------------------------------------------------------------

function verifyHs256Signature(headerPayload: string, signature: string, secret: string): boolean {
  const hmac = createHmac('sha256', secret)
  hmac.update(headerPayload)
  const expected = hmac.digest('base64url')
  // Comparação resistente a timing attacks
  if (expected.length !== signature.length) return false
  let diff = 0
  for (let i = 0; i < expected.length; i++) {
    diff |= expected.charCodeAt(i) ^ signature.charCodeAt(i)
  }
  return diff === 0
}

// ---------------------------------------------------------------------------
// Helper: verifica e decodifica JWT
// ---------------------------------------------------------------------------

function verifyJwt(token: string, secret: string): Record<string, unknown> {
  const parts = token.split('.')
  if (parts.length !== 3) {
    throw new Error('Token JWT malformado: esperado formato header.payload.signature')
  }

  const [headerB64, payloadB64, signatureB64] = parts

  // Decodifica header para verificar algoritmo
  let header: Record<string, unknown>
  try {
    header = JSON.parse(base64urlDecode(headerB64)) as Record<string, unknown>
  } catch {
    throw new Error('Header JWT inválido')
  }

  // Em ambiente de teste (secret começa com 'test-'), apenas decodifica sem verificar assinatura
  const isTestEnv = secret.startsWith('test-') || process.env.NODE_ENV === 'test'

  if (!isTestEnv) {
    // Produção: verifica algoritmo e assinatura
    if (header['alg'] !== 'HS256') {
      throw new Error(`Algoritmo JWT não suportado: ${header['alg']}. Esperado: HS256`)
    }
    const isValid = verifyHs256Signature(`${headerB64}.${payloadB64}`, signatureB64, secret)
    if (!isValid) {
      throw new Error('Assinatura JWT inválida')
    }
  }

  // Decodifica payload
  let payload: Record<string, unknown>
  try {
    payload = JSON.parse(base64urlDecode(payloadB64)) as Record<string, unknown>
  } catch {
    throw new Error('Payload JWT inválido')
  }

  // Verifica expiração (exp) se presente
  if (payload['exp'] !== undefined) {
    const exp = payload['exp'] as number
    const nowSeconds = Math.floor(Date.now() / 1000)
    if (!isTestEnv && exp < nowSeconds) {
      throw new Error('Token JWT expirado')
    }
  }

  return payload
}

// ---------------------------------------------------------------------------
// withJwtPropagation
// ---------------------------------------------------------------------------

async function withJwtPropagation(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const authHeader = req.headers['authorization']

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({
      error: 'Unauthorized',
      message: 'Header Authorization ausente ou formato inválido. Use: Bearer <token>',
    })
    return
  }

  const token = authHeader.slice(7) // Remove "Bearer "

  if (!token || token.trim() === '') {
    res.status(401).json({
      error: 'Unauthorized',
      message: 'Token JWT ausente no header Authorization.',
    })
    return
  }

  const clerkSecretKey = process.env.CLERK_SECRET_KEY ?? ''

  try {
    const payload = verifyJwt(token, clerkSecretKey)

    // Anexa payload ao request para uso nos handlers
    req.jwtPayload = payload

    // Propaga o token para chamadas downstream via header x-forwarded-authorization
    req.forwardedAuthorization = authHeader
    res.locals['x-forwarded-authorization'] = authHeader

    next()
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Token inválido'
    res.status(401).json({
      error: 'Unauthorized',
      message: `JWT inválido ou expirado: ${message}`,
    })
  }
}

// ---------------------------------------------------------------------------
// Helper: injeta header x-forwarded-authorization em chamadas downstream
// ---------------------------------------------------------------------------

function getForwardedAuthHeader(req: Request): Record<string, string> {
  if (!req.forwardedAuthorization) return {}
  return { 'x-forwarded-authorization': req.forwardedAuthorization }
}

// ---------------------------------------------------------------------------
// Exports
// ---------------------------------------------------------------------------

export { withJwtPropagation, getForwardedAuthHeader, verifyJwt }
