import { AppError } from './lib/errors'

export function errorHandler(err: any, req: any, res: any, next: any) {
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
