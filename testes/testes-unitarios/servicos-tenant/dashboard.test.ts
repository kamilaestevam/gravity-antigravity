import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getCachedKpis, setCachedKpis } from '../../../servicos-global/tenant/dashboard/server/lib/cache';
import { AppError } from '../../../servicos-global/tenant/dashboard/server/lib/errors';
import router from '../../../servicos-global/tenant/dashboard/server/routes';
import express, { Request, Response, NextFunction } from 'express';
import request from 'supertest';

// Mock dependencies
const prismaMock = vi.hoisted(() => ({
  metricaSnapshot: {
    findMany: vi.fn(),
  },
  configDashboard: {
    findFirst: vi.fn(),
  }
}));

vi.mock('@prisma/client', () => {
  return { PrismaClient: vi.fn(() => prismaMock) };
});

const app = express();
app.use(express.json());
app.use('/api/v1/dashboard', (req, res, next) => {
  // Pass to router
  router(req, res, next);
});
app.use((err: Error & { statusCode?: number }, _req: Request, res: Response, _next: NextFunction) => {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({ error: err.message });
  }
  return res.status(500).json({ error: 'Internal error' });
});

describe('Dashboard Service', () => {
  describe('Cache Logic', () => {
    beforeEach(() => {
      // Clear cache conceptually by advancing time
      vi.useFakeTimers();
      setCachedKpis('tenant_x', undefined, null); // reset trick
    });

    it('should return null when cache is empty', () => {
      const data = getCachedKpis('tenant_new');
      expect(data).toBeNull();
    });

    it('should set and retrieve cache correctly within TTL', () => {
      const mockData = [{ name: 'Sales', value: 100 }];
      setCachedKpis('tenant_1', 'prod_1', mockData);
      
      const res = getCachedKpis('tenant_1', 'prod_1');
      expect(res).toEqual(mockData);
    });

    it('should expire cache after 5 minutes', () => {
      const mockData = [{ name: 'Sales', value: 100 }];
      setCachedKpis('tenant_1', 'prod_1', mockData);
      
      vi.advanceTimersByTime(5 * 60 * 1000 + 1000); // 5 mins and 1 sec
      
      const res = getCachedKpis('tenant_1', 'prod_1');
      expect(res).toBeNull();
    });
  });

  describe('Express Routes', () => {
    beforeEach(() => {
      vi.clearAllMocks();
    });

    it('should require tenant_id on /kpis', async () => {
      const res = await request(app).get('/api/v1/dashboard/kpis');
      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Invalid query parameters');
    });

    it('should return 200 and mocked db source on valid /kpis request', async () => {
      prismaMock.metricaSnapshot.findMany.mockResolvedValue([
        { metric_name: 'Revenue', value: 5000, snapshot_date: new Date() }
      ]);

      const res = await request(app).get('/api/v1/dashboard/kpis?tenant_id=teste');
      
      expect(res.status).toBe(200);
      expect(res.body.source).toBe('db');
      expect(res.body.data).toHaveLength(1);
      expect(res.body.data[0].name).toBe('Revenue');
    });

    it('should return 200 and default config on missing db config', async () => {
      prismaMock.configDashboard.findFirst.mockResolvedValue(null);

      const res = await request(app).get('/api/v1/dashboard/config?tenant_id=teste');
      
      expect(res.status).toBe(200);
      expect(res.body.tenant_id).toBe('teste');
      expect(res.body.widgets_layout.default).toBe(true);
    });
  });
});
