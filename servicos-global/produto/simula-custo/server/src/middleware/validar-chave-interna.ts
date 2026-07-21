/**
 * validar-chave-interna.ts — Middleware S2S (Simula Custo)
 * Valida x-internal-key em chamadas entre serviços.
 * Skill: antigravity-autenticacao-s2s
 */
import { Request, Response, NextFunction } from 'express'
import { timingSafeEqual } from 'crypto'

function compararSeguro(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  return timingSafeEqual(Buffer.from(a), Buffer.from(b))
}

export function validarChaveInterna(req: Request, res: Response, next: NextFunction) {
  const chave = req.headers['x-internal-key'] as string | undefined
  const esperada = process.env.CHAVE_INTERNA_SERVICO

  if (!esperada) {
    console.warn('[SimulaCusto] CHAVE_INTERNA_SERVICO não configurada. Bloqueando.')
    return res.status(500).json({ error: 'Serviço mal configurado' })
  }

  if (!chave || !compararSeguro(chave, esperada)) {
    return res.status(401).json({ error: 'Chave interna inválida', code: 'UNAUTHORIZED' })
  }

  next()
}
