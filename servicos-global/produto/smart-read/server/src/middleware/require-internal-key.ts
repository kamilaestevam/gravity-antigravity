import { Request, Response, NextFunction } from 'express'

export function requireInternalKey(req: Request, res: Response, next: NextFunction): void {
  const chave = req.headers['x-internal-key'] ?? req.headers['x-chave-interna-servico']
  if (!chave || chave !== process.env.CHAVE_INTERNA_SERVICO) {
    res.status(401).json({ error: { code: 'UNAUTHORIZED', message: 'x-internal-key invalida' } })
    return
  }
  next()
}
