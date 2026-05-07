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
import { timingSafeEqual as cryptoTimingSafeEqual } from 'crypto'

// ---------------------------------------------------------------------------
// withInternalKeyValidation
// ---------------------------------------------------------------------------

function withInternalKeyValidation(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  // Compat: aceita ambos os nomes de env ate a nomenclatura ser uniformizada.
  const expectedKey = process.env.INTERNAL_API_KEY ?? process.env.CHAVE_INTERNA_SERVICO

  // Se a chave não está configurada, nega por segurança (fail-safe)
  if (!expectedKey || expectedKey.trim() === '') {
    res.status(403).json({
      error: 'Forbidden',
      message: 'Chave interna não configurada no servidor. Contate o administrador.',
    })
    return
  }

  // Compat: aceita ambos os nomes de header
  const providedKey =
    req.headers['x-internal-key'] ??
    req.headers['x-chave-interna-servico']

  if (!providedKey) {
    res.status(403).json({
      error: 'Forbidden',
      message: 'Header x-internal-key ou x-chave-interna-servico ausente. Este endpoint é restrito a chamadas internas.',
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
// Usa crypto.timingSafeEqual nativo do Node.js para evitar leaks de tamanho.
// ---------------------------------------------------------------------------

function timingSafeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a, 'utf8')
  const bufB = Buffer.from(b, 'utf8')

  // Se tamanhos diferem, compara bufA consigo mesmo para manter tempo constante
  // e retorna false — sem early return que vaze informação de tamanho.
  if (bufA.length !== bufB.length) {
    cryptoTimingSafeEqual(bufA, bufA)
    return false
  }

  return cryptoTimingSafeEqual(bufA, bufB)
}

// ---------------------------------------------------------------------------
// Exports
// ---------------------------------------------------------------------------

export { withInternalKeyValidation, timingSafeEqual }
