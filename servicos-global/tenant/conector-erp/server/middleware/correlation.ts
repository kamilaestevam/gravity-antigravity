// server/middleware/correlation.ts
// Middleware que garante propagação de correlation ID em todas as requisições.

import type { Request, Response, NextFunction } from 'express'
import { randomUUID } from 'crypto'

declare global {
  namespace Express {
    interface Request {
      correlationId: string
    }
  }
}

export function correlationMiddleware(
  req: Request,
  _res: Response,
  next: NextFunction
): void {
  req.correlationId =
    (req.headers['x-correlation-id'] as string) || randomUUID()
  next()
}
