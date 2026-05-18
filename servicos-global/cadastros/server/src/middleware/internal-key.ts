import type { Request, Response, NextFunction } from 'express'
import { timingSafeEqual } from 'node:crypto'

/**
 * Middleware obrigatório para rotas inter-serviço.
 * Header esperado: `x-internal-key` com o valor de `process.env.CHAVE_INTERNA_SERVICO`.
 *
 * Falha alto (Mandamento 08): se a chave estiver ausente ou divergente,
 * responde 401 e loga sem expor o valor recebido.
 */
export function requireInternalKey(req: Request, res: Response, next: NextFunction): void {
  const expected = process.env.CHAVE_INTERNA_SERVICO
  const received = req.headers['x-internal-key']

  if (!expected) {
    console.error('[cadastros][internal-key] CHAVE_INTERNA_SERVICO não definida no ambiente')
    res.status(500).json({ erro: 'configuracao_incompleta' })
    return
  }

  const expectedBuf = Buffer.from(expected)
  const receivedBuf = Buffer.from(typeof received === 'string' ? received : '')
  const isValid = typeof received === 'string' && expectedBuf.length === receivedBuf.length && timingSafeEqual(expectedBuf, receivedBuf)
  if (!isValid) {
    console.warn('[cadastros][internal-key] chave inválida ou ausente', {
      rota: req.originalUrl,
      metodo: req.method,
      tem_header: typeof received === 'string',
    })
    res.status(401).json({ erro: 'chave_interna_invalida' })
    return
  }

  next()
}
