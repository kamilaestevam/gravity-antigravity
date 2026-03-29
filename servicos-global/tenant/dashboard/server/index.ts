import express, { Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import routes from './routes';
import { AppError } from './lib/errors';

const app = express();
app.use(helmet());
app.use(express.json());

// ---------------------------------------------------------------------------
// Auth — injeta req.auth a partir do header x-tenant-id / x-user-id
// Em produção o gateway valida o JWT e propaga como headers internos.
// ---------------------------------------------------------------------------

app.use((req: Request, res: Response, next: NextFunction) => {
  const tenantId = req.headers['x-tenant-id'] as string | undefined;
  const userId = req.headers['x-user-id'] as string | undefined;

  if (!tenantId) {
    return res.status(401).json({
      status: 'error',
      message: 'x-tenant-id header is required',
    });
  }

  req.auth = { tenantId, userId: userId ?? '' };
  next();
});

// Main router setup
app.use('/api/v1/dashboard', routes);

// Global Error Handler
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      error: { code: err.code ?? 'APP_ERROR', message: err.message },
    });
  }

  console.error(err);
  return res.status(500).json({
    error: { code: 'INTERNAL_ERROR', message: 'Internal server error' },
  });
});

const PORT = process.env.PORT || 8010;

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`Dashboard service running on port ${PORT}`);
  });
}

export default app;
