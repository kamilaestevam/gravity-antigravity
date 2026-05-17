import type { Request, Response, NextFunction } from 'express'

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

  if (typeof received !== 'string' || received !== expected) {
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
