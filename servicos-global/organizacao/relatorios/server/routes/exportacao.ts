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

// ---- ACL DTO ----
function toExportJobDto(j: {
  id_exportar_job: string;
  status_exportar_job: string;
  formato_exportar_job: string;
  url_arquivo_exportar_job: string | null;
  erro_exportar_job: string | null;
  iniciado_em_exportar_job: Date | null;
  concluido_em_exportar_job: Date | null;
  data_criacao_exportar_job: Date;
  id_relatorio_exportar_job: string;
}) {
  return {
    id: j.id_exportar_job,
    status: j.status_exportar_job,
    formato: j.formato_exportar_job,
    url_arquivo: j.url_arquivo_exportar_job,
    erro: j.erro_exportar_job,
    started_at: j.iniciado_em_exportar_job,
    completed_at: j.concluido_em_exportar_job,
    created_at: j.data_criacao_exportar_job,
    relatorio_id: j.id_relatorio_exportar_job,
  };
}

// ---- Iniciar Exportação (Assíncrono) ----
exportacaoRouter.post('/api/v1/relatorios/:id_relatorio/exportacoes', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id_organizacao: tenantId, id_usuario: userId } = req.auth;
    const { id_relatorio } = req.params;

    const parse = createExportSchema.safeParse(req.body);
    if (!parse.success) {
      throw new AppError(parse.error.errors[0].message, 422, 'VALIDATION_ERROR');
    }

    const { formato, productId } = parse.data;

    // Enfileira job
    const job = await prisma.relatorioExportar.create({
      data: {
        id_organizacao_exportar_job: tenantId,
        id_usuario_exportar_job: userId || null,
        id_produto_exportar_job: productId || null,
        id_relatorio_exportar_job: id_relatorio,
        formato_exportar_job: formato,
        status_exportar_job: 'PENDING',
      },
    });

    // Chama o worker para iniciar o processamento em background
    processExportJob(job.id_exportar_job, tenantId).catch(console.error);

    res.status(202).json({
      message: 'Exportação enfileirada com sucesso',
      jobId: job.id_exportar_job,
      status: job.status_exportar_job,
    });
  } catch (err) {
    next(err);
  }
});

// ---- Consultar Status da Exportação ----
exportacaoRouter.get('/api/v1/relatorios/exportacoes/:id_exportacao_relatorio', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id_organizacao: tenantId, id_usuario: userId } = req.auth;
    const { id_exportacao_relatorio } = req.params;

    const job = await prisma.relatorioExportar.findFirst({
      where: {
        id_exportar_job: id_exportacao_relatorio,
        id_organizacao_exportar_job: tenantId,
        id_usuario_exportar_job: userId,
      },
    });

    if (!job) {
      throw new AppError('Job de exportação não encontrado', 404, 'NOT_FOUND');
    }

    res.json({ data: toExportJobDto(job) });
  } catch (err) {
    next(err);
  }
});
