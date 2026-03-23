import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/AppError';
import { tenantHeaderSchema } from '../schemas';

export const extractTenantContext = (req: Request, res: Response, next: NextFunction) => {
  try {
    const headers = tenantHeaderSchema.parse(req.headers);
    res.locals.tenant_id = headers['x-tenant-id'];
    res.locals.product_id = headers['x-product-id'] || null;
    res.locals.user_id = headers['x-user-id'] || null;
    next();
  } catch (error) {
    next(new AppError('Cabeçalhos de contexto inválidos ou ausentes', 400));
  }
};
