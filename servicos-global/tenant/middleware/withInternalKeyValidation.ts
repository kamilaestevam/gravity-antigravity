// middleware/withInternalKeyValidation.ts
// AGENTE AUTH FLOW — ONDA 4
//
// Middleware para validação de chamadas servidor-a-servidor via
// header `x-internal-key`. O valor esperado vem de process.env.INTERNAL_API_KEY.
//
// Comportamento:
//   - Header ausente          → 403 Forbidden
//   - Chave inválida          → 403 Forbidden
//   - INTERNAL_API_KEY não config → 403 Forbidden (fail-safe)
//   - Chave válida            → continua pipeline
//
// Uso:
//   import { withInternalKeyValidation } from '@tenant/middleware/withInternalKeyValidation'
//   router.use(withInternalKeyValidation)

import { Request, Response, NextFunction } from 'express'

// ---------------------------------------------------------------------------
// withInternalKeyValidation
// ---------------------------------------------------------------------------

function withInternalKeyValidation(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const expectedKey = process.env.INTERNAL_API_KEY

  // Se a chave não está configurada, nega por segurança (fail-safe)
  if (!expectedKey || expectedKey.trim() === '') {
    res.status(403).json({
      error: 'Forbidden',
      message: 'Chave interna não configurada no servidor. Contate o administrador.',
    })
    return
  }

  const providedKey = req.headers['x-internal-key']

  if (!providedKey) {
    res.status(403).json({
      error: 'Forbidden',
      message: 'Header x-internal-key ausente. Este endpoint é restrito a chamadas internas.',
    })
    return
  }

  // Comparação segura (evita timing attacks com strings de mesmo tamanho)
  const keyString = Array.isArray(providedKey) ? providedKey[0] : providedKey

  if (!timingSafeEqual(keyString, expectedKey)) {
    res.status(403).json({
      error: 'Forbidden',
      message: 'Chave interna inválida.',
    })
    return
  }

  next()
}

// ---------------------------------------------------------------------------
// Helper: comparação de strings resistente a timing attacks
// ---------------------------------------------------------------------------

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false

  let result = 0
  for (let i = 0; i < a.length; i++) {
    // XOR bit a bit — percorre o loop inteiro mesmo se diferente
    result |= a.charCodeAt(i) ^ b.charCodeAt(i)
  }
  return result === 0
}

// ---------------------------------------------------------------------------
// Exports
// ---------------------------------------------------------------------------

export { withInternalKeyValidation, timingSafeEqual }
