import { Request, Response, NextFunction } from 'express';
import { createCategoriaSchema, createSLASchema, createTemplateSchema } from '../schemas';
import * as configService from '../services/config.service';

export const createCategoria = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = createCategoriaSchema.parse(req.body);
    const { tenant_id, product_id } = res.locals;
    const cat = await configService.createCategoria({ ...data, tenant_id, product_id });
    res.status(201).json(cat);
  } catch (error) {
    next(error);
  }
};

export const listCategorias = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { tenant_id, product_id } = res.locals;
    const items = await configService.listCategorias(tenant_id, product_id);
    res.json(items);
  } catch (error) {
    next(error);
  }
};

export const createSLA = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = createSLASchema.parse(req.body);
    const { tenant_id, product_id } = res.locals;
    const sla = await configService.createSLA({ ...data, tenant_id, product_id });
    res.status(201).json(sla);
  } catch (error) {
    next(error);
  }
};

export const createTemplate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = createTemplateSchema.parse(req.body);
    const { tenant_id, product_id } = res.locals;
    const tpl = await configService.createTemplate({ ...data, tenant_id, product_id });
    res.status(201).json(tpl);
  } catch (error) {
    next(error);
  }
};
