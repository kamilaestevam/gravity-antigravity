import { Request, Response, NextFunction } from 'express';
import { AppError } from '../lib/errors.js';

declare global {
  namespace Express {
    interface Request {
      auth: {
        tenantId: string;
        userId?: string;
      };
    }
  }
}

export function authMiddleware(req: Request, _res: Response, next: NextFunction) {
  const tenantId = req.headers['x-tenant-id'] as string;
  const userId = req.headers['x-user-id'] as string;

  if (!tenantId) {
    return next(new AppError('Missing x-tenant-id header', 401, 'UNAUTHORIZED'));
  }

  req.auth = {
    tenantId,
    userId,
  };

  next();
}
