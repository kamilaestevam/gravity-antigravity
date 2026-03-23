// server/middleware/correlationId.ts
// Gera ou propaga x-correlation-id em todo request

import { randomUUID } from 'crypto'
import type { Request, Response, NextFunction } from 'express'

// Estende Request para incluir correlationId
declare global {
  namespace Express {
    interface Request {
      correlationId: string
    }
  }
}

export function correlationMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const id =
    (req.headers['x-correlation-id'] as string | undefined) ?? randomUUID()
  req.correlationId = id
  res.setHeader('x-correlation-id', id)
  next()
}
