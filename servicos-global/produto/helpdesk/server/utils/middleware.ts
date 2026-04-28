import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/AppError';
import { tenantHeaderSchema } from '../schemas';

export const extractTenantContext = (req: Request, res: Response, next: NextFunction) => {
  try {
    const headers = tenantHeaderSchema.parse(req.headers);
    res.locals.tenant_id = headers['x-id-organizacao'];
    res.locals.product_id = headers['x-id-produto'] || null;
    res.locals.user_id = headers['x-id-usuario'] || null;
    next();
  } catch (error) {
    next(new AppError('Cabeçalhos de contexto inválidos ou ausentes', 400));
  }
};
