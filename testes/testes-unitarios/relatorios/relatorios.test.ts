// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import express from 'express';
import { relatoriosRouter } from '../../../servicos-global/tenant/relatorios/server/routes/relatorios';
import { exportacaoRouter } from '../../../servicos-global/tenant/relatorios/server/routes/exportacao';
import { prisma } from '../../../servicos-global/tenant/relatorios/server/lib/prisma';
import { errorHandler } from '../../../servicos-global/tenant/relatorios/server/middleware/error-handler';

// Mock do prisma
vi.mock('../../../servicos-global/tenant/relatorios/server/lib/prisma', () => ({
  prisma: {
    relatorio: {
      findMany: vi.fn(),
      findFirst: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    exportJob: {
      create: vi.fn(),
      findFirst: vi.fn(),
      update: vi.fn(),
    },
  },
}));

// Mock do worker
vi.mock('../../../servicos-global/tenant/relatorios/server/services/export-worker', () => ({
  processExportJob: vi.fn().mockResolvedValue(undefined),
}));

const app = express();
app.use(express.json());

// Helper para mock de Tenant Authorization via req
app.use((req, _res, next) => {
  req.headers['x-tenant-id'] = req.headers['x-tenant-id'] || 'test-tenant-123';
  req.headers['x-user-id'] = req.headers['x-user-id'] || 'test-user-456';
  next();
});

// Inclui authMiddleware mockado no relatoriosRouter
import { authMiddleware } from '../../../servicos-global/tenant/relatorios/server/middleware/auth';

app.use(authMiddleware);
app.use(relatoriosRouter);
app.use(exportacaoRouter);
app.use(errorHandler);

describe('Relatórios Service - API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('GET /api/v1/relatorios/saved', () => {
    it('deve listar relatorios', async () => {
      vi.mocked(prisma.relatorio.findMany).mockResolvedValue([
        { id: '1', nome: 'Relatorio 1', tenant_id: 'test-tenant-123' } as any
      ]);

      const res = await request(app).get('/api/v1/relatorios/saved').set('x-tenant-id', 'test-tenant-123');
      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(1);
    });
  });

  describe('POST /api/v1/relatorios/saved', () => {
    it('deve retornar erro de validacao sem nome', async () => {
      const res = await request(app).post('/api/v1/relatorios/saved').send({});
      expect(res.status).toBe(422);
      expect(res.body.code).toBe('VALIDATION_ERROR');
    });

    it('deve criar relatorio corretamente', async () => {
      vi.mocked(prisma.relatorio.create).mockResolvedValue({
        id: 'new-id',
        nome: 'Meu Visão',
        tenant_id: 'test-tenant-123',
      } as any);

      const res = await request(app)
        .post('/api/v1/relatorios/saved')
        .send({ nome: 'Meu Visão' });

      expect(res.status).toBe(201);
      expect(res.body.data.nome).toBe('Meu Visão');
    });
  });

  describe('POST /api/v1/relatorios/:id/export', () => {
    it('deve enfileirar exportacao', async () => {
      vi.mocked(prisma.exportJob.create).mockResolvedValue({
        id: 'job-123',
        status: 'PENDING'
      } as any);

      const res = await request(app)
        .post('/api/v1/relatorios/report-abc/export')
        .send({ formato: 'excel' });

      expect(res.status).toBe(202);
      expect(res.body.jobId).toBe('job-123');
      expect(res.body.message).toBe('Exportação enfileirada com sucesso');
    });
  });
});
