import { Router } from 'express';
import { z } from 'zod';
import { PrismaClient } from '@prisma/client';
import { AppError } from './lib/errors';
import { getCachedKpis, setCachedKpis } from './lib/cache';

const router = Router();
const prisma = new PrismaClient();

const getKpisSchema = z.object({
  product_id: z.string().optional(),
});

const getConfigSchema = z.object({
  product_id: z.string().optional(),
  user_id: z.string().optional()
});

router.get('/kpis', async (req, res, next) => {
  try {
    const { product_id } = getKpisSchema.parse(req.query);
    const tenant_id = req.auth.tenantId;

    // Try cache first
    const cached = getCachedKpis(tenant_id, product_id);
    if (cached) {
      return res.json({ source: 'cache', data: cached });
    }

    // Prepare filter
    const whereClause: any = { tenant_id };
    if (product_id) {
      whereClause.product_id = product_id;
    }

    // Fetch latest for each metric in the tenant context
    // In a real scenario we might compute sums or averages.
    // Here we will fetch the latest snapshot date per metric.

    // Using prisma group by or straight findMany
    const snapshots = await prisma.metricaSnapshot.findMany({
      where: whereClause,
      orderBy: { snapshot_date: 'desc' }
    });

    // Take only the most recent for each metric
    const kpisMap = new Map<string, any>();
    for (const snap of snapshots) {
      if (!kpisMap.has(snap.metric_name)) {
        kpisMap.set(snap.metric_name, {
          name: snap.metric_name,
          value: snap.value,
          unit: snap.unit,
          date: snap.snapshot_date,
        });
      }
    }

    const latestKpis = Array.from(kpisMap.values());

    // Update cache
    setCachedKpis(tenant_id, product_id, latestKpis);

    res.json({ source: 'db', data: latestKpis });
  } catch (error) {
    if (error instanceof z.ZodError) {
      next(new AppError('Invalid query parameters', 400));
    } else {
      next(error);
    }
  }
});

router.get('/config', async (req, res, next) => {
  try {
    const { product_id, user_id } = getConfigSchema.parse(req.query);
    const tenant_id = req.auth.tenantId;

    const whereClause: any = { tenant_id };
    if (product_id) whereClause.product_id = product_id;
    if (user_id) whereClause.user_id = user_id;

    let config = await prisma.configDashboard.findFirst({
      where: whereClause
    });

    if (!config) {
      // Return default config instead of 404
      return res.json({
        tenant_id,
        widgets_layout: { default: true },
        refresh_rate: 300000
      });
    }

    res.json(config);
  } catch (error) {
    if (error instanceof z.ZodError) {
      next(new AppError('Invalid query parameters', 400));
    } else {
      next(error);
    }
  }
});

export default router;
