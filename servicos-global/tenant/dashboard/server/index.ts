import express, { Request, Response, NextFunction } from 'express';
import routes from './routes';
import { AppError } from './lib/errors';

const app = express();
app.use(express.json());

// Main router setup
app.use('/api/v1/dashboard', routes);

// Global Error Handler
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      status: 'error',
      message: err.message,
    });
  }

  console.error(err);
  return res.status(500).json({
    status: 'error',
    message: 'Internal server error',
  });
});

const PORT = process.env.PORT || 8010;

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`Dashboard service running on port ${PORT}`);
  });
}

export default app;
