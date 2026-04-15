import type { Request, Response, NextFunction } from 'express'
import { AppError } from '../lib/errors'

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      status: 'error',
      message: err.message
    })
  }

  console.error('Unhandled Server Error:', err)
  res.status(500).json({
    status: 'error',
    message: 'Internal server error'
  })
}
