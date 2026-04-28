import { Router } from 'express';

export const healthRouter = Router();

healthRouter.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'relatorios',
    port: Number(process.env.PORT ?? 8011),
    timestamp: new Date().toISOString(),
  });
});
