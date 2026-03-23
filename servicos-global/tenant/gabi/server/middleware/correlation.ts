// server/middleware/correlation.ts
import { Request, Response, NextFunction } from 'express'
import { randomUUID } from 'crypto'

declare global {
  namespace Express {
    interface Request {
      correlationId: string
      auth: {
        tenantId: string
        userId: string
      }
    }
  }
}

export function correlationMiddleware(
  req: Request,
  _res: Response,
  next: NextFunction
): void {
  req.correlationId = (req.headers['x-correlation-id'] as string) ?? randomUUID()
  next()
}
