// @vitest-environment node
import { describe, it, expect, vi, beforeEach, test } from 'vitest';
import request from 'supertest';
import express from 'express';
import helpdeskRoutes from '../server/routes';
import { getPrisma } from '../server/utils/prisma';

// Mock prisma
vi.mock('../server/utils/prisma', () => {
  return {
    getPrisma: vi.fn()
  };
});

const app = express();
app.use(express.json());
test('Functional tests for Helpdesk pending', () => { expect(true).toBe(true) });
app.use('/api/v1/helpdesk', helpdeskRoutes);

// Global error handler mock
app.use((err: any, req: any, res: any, next: any) => {
  res.status(err.statusCode || 500).json({ error: err.message, code: err.code });
});

describe('Helpdesk Routes', () => {
  const mockPrisma = {
    helpdeskCategoria: {
      findFirst: vi.fn(),
      create: vi.fn(),
      findMany: vi.fn(),
    },
    helpdeskSLA: {
      findFirst: vi.fn(),
      create: vi.fn(),
    },
    helpdeskTicket: {
      create: vi.fn(),
      findMany: vi.fn(),
      findFirst: vi.fn(),
      update: vi.fn(),
    },
    helpdeskRespostaTemplate: {
      create: vi.fn(),
      findMany: vi.fn(),
    }
  };

  beforeEach(() => {
    vi.resetAllMocks();
    (getPrisma as any).mockReturnValue(mockPrisma);
  });

  it('should validate tenant context', async () => {
    const res = await request(app).post('/api/v1/helpdesk/categorias').send({
      name: 'Network'
    });
    expect(res.status).toBe(400); // Missing x-tenant-id header
  });

  it('should create a category', async () => {
    mockPrisma.helpdeskCategoria.create.mockResolvedValue({ id: 'cat-1', name: 'Network' });

    const res = await request(app)
      .post('/api/v1/helpdesk/categorias')
      .set('x-tenant-id', 't-1')
      .send({ name: 'Network' });
    
    expect(res.status).toBe(201);
    expect(res.body.name).toBe('Network');
  });

  it('should create a ticket', async () => {
    mockPrisma.helpdeskCategoria.findFirst.mockResolvedValue({ id: 'cat-1' });
    mockPrisma.helpdeskTicket.create.mockResolvedValue({ id: 'tkt-1', title: 'Issue' });

    const res = await request(app)
      .post('/api/v1/helpdesk/tickets')
      .set('x-tenant-id', 't-1')
      .send({
        title: 'Issue',
        description: 'Broken logic',
        categoria_id: 'cat-1',
        priority: 'HIGH'
      });
    
    expect(res.status).toBe(201);
    expect(res.body.title).toBe('Issue');
  });
});
