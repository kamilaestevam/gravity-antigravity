import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { authMiddleware } from '../middleware/auth.js';
import { AppError } from '../lib/errors.js';
import { processExportJob } from '../services/export-worker.js';

export const exportacaoRouter = Router();

const createExportSchema = z.object({
  productId: z.string().optional().nullable(),
  formato: z.enum(['csv', 'excel', 'json', 'xml', 'txt', 'pdf']).default('csv'),
});

// ---- Iniciar Exportação (Assíncrono) ----
exportacaoRouter.post('/api/v1/relatorios/:report_id/export', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { tenantId, userId } = req.auth;
    const { report_id } = req.params;
    
    const parse = createExportSchema.safeParse(req.body);
    if (!parse.success) {
      throw new AppError(parse.error.errors[0].message, 422, 'VALIDATION_ERROR');
    }

    const { formato, productId } = parse.data;

    // Enfileira job
    const job = await prisma.exportJob.create({
      data: {
        tenant_id: tenantId,
        user_id: userId || '',
        product_id: productId || null,
        relatorio_id: report_id,
        formato,
        status: 'PENDING',
      },
    });

    // Chama o worker para iniciar o processamento em background
    processExportJob(job.id, tenantId).catch(console.error);

    res.status(202).json({
      message: 'Exportação enfileirada com sucesso',
      jobId: job.id,
      status: job.status,
    });
  } catch (err) {
    next(err);
  }
});

// ---- Consultar Status da Exportação ----
exportacaoRouter.get('/api/v1/relatorios/export/:jobId', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { tenantId, userId } = req.auth;
    const { jobId } = req.params;

    const job = await prisma.exportJob.findFirst({
      where: {
        id: jobId,
        tenant_id: tenantId,
        user_id: userId,
      },
    });

    if (!job) {
      throw new AppError('Job de exportação não encontrado', 404, 'NOT_FOUND');
    }

    res.json({ data: job });
  } catch (err) {
    next(err);
  }
});
