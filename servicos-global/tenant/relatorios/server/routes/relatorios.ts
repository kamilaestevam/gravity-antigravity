import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { authMiddleware } from '../middleware/auth.js';
import { AppError } from '../lib/errors.js';

export const relatoriosRouter = Router();

const createRelatorioSchema = z.object({
  product_id: z.string().optional().nullable(),
  nome: z.string().min(1),
  tabelas: z.array(z.any()).optional().default([]),
  colunas: z.array(z.any()).optional().default([]),
  filtros: z.record(z.any()).optional().default({}),
  join_type: z.string().optional().default('left'),
  is_shared: z.boolean().optional().default(false),
});

const updateRelatorioSchema = createRelatorioSchema.partial();

// ---- Workspace: Listar relatórios salvos ----
relatoriosRouter.get('/api/v1/relatorios/saved', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { tenantId, userId } = req.auth;
    const { product_id } = req.query;

    const where: any = { tenant_id: tenantId };
    
    // Lista os do usuário + os compartilhados
    where.OR = [
      { user_id: userId },
      { is_shared: true }
    ];

    if (product_id) {
      where.product_id = String(product_id);
    }

    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 100));

    const relatorios = await prisma.relatorio.findMany({
      where,
      orderBy: { created_at: 'desc' },
      take: limit,
      skip: (page - 1) * limit,
    });

    res.json({ data: relatorios });
  } catch (err) {
    next(err);
  }
});

// ---- Workspace: Salvar relatório ----
relatoriosRouter.post('/api/v1/relatorios/saved', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { tenantId, userId } = req.auth;
    
    const parse = createRelatorioSchema.safeParse(req.body);
    if (!parse.success) {
      throw new AppError(parse.error.errors[0].message, 422, 'VALIDATION_ERROR');
    }

    const relatorio = await prisma.relatorio.create({
      data: {
        tenant_id: tenantId,
        user_id: userId || '',
        ...parse.data,
      },
    });

    res.status(201).json({ data: relatorio });
  } catch (err) {
    next(err);
  }
});

// ---- Workspace: Ver relatório por ID ----
relatoriosRouter.get('/api/v1/relatorios/saved/:id', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { tenantId, userId } = req.auth;
    const { id } = req.params;

    const relatorio = await prisma.relatorio.findFirst({
      where: {
        id,
        tenant_id: tenantId,
        OR: [
          { user_id: userId },
          { is_shared: true }
        ]
      },
    });

    if (!relatorio) {
      throw new AppError('Relatório não encontrado', 404, 'NOT_FOUND');
    }

    res.json({ data: relatorio });
  } catch (err) {
    next(err);
  }
});

// ---- Workspace: Atualizar relatório ----
relatoriosRouter.put('/api/v1/relatorios/saved/:id', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { tenantId, userId } = req.auth;
    const { id } = req.params;
    
    const parse = updateRelatorioSchema.safeParse(req.body);
    if (!parse.success) {
      throw new AppError(parse.error.errors[0].message, 422, 'VALIDATION_ERROR');
    }

    // Apenas dono pode editar (ou admin, mas simplificando para dono neste contexto)
    const existente = await prisma.relatorio.findFirst({
      where: { id, tenant_id: tenantId, user_id: userId }
    });

    if (!existente) {
      throw new AppError('Relatório não encontrado ou sem permissão para editar', 404, 'NOT_FOUND');
    }

    const relatorio = await prisma.relatorio.update({
      where: { id },
      data: parse.data,
    });

    res.json({ data: relatorio });
  } catch (err) {
    next(err);
  }
});

// ---- Workspace: Deletar relatório ----
relatoriosRouter.delete('/api/v1/relatorios/saved/:id', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { tenantId, userId } = req.auth;
    const { id } = req.params;

    const existente = await prisma.relatorio.findFirst({
      where: { id, tenant_id: tenantId, user_id: userId }
    });

    if (!existente) {
      throw new AppError('Relatório não encontrado ou sem permissão para deletar', 404, 'NOT_FOUND');
    }

    await prisma.relatorio.delete({
      where: { id },
    });

    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

// Mock da rota de dados (unificação)
relatoriosRouter.get('/api/v1/relatorios/:report_id', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { tenantId } = req.auth;
    // const { report_id } = req.params;
    // Aqui usaria o produto e tabela para buscar os dados de fato ou cruzar tabelas
    
    res.json({
      data: [
         { id: '1', name: 'Mock Data 1', tenant: tenantId },
         { id: '2', name: 'Mock Data 2', tenant: tenantId }
      ],
      meta: { total: 2 }
    });
  } catch (err) {
    next(err);
  }
});
