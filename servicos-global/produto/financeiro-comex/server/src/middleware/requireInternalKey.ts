import { Request, Response, NextFunction } from 'express'

export function requireInternalKey(req: Request, res: Response, next: NextFunction): void {
  const key = req.headers['x-internal-key']
  if (!key || key !== process.env.CHAVE_INTERNA_SERVICO) {
    res.status(401).json({ error: { code: 'UNAUTHORIZED', message: 'x-internal-key invalida' } })
    return
  }
  next()
}
