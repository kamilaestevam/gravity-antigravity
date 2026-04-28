import 'dotenv/config';
import express from 'express';
import helmet from 'helmet';
import { correlationMiddleware } from './middleware/correlation.js';
import { errorHandler } from './middleware/error-handler.js';
import { healthRouter } from './routes/health.js';
import { exportacaoRouter } from './routes/exportacao.js';
import { relatoriosRouter } from './routes/relatorios.js';

const app = express();
const PORT = Number(process.env.PORT ?? 8011);

app.use(helmet());
app.use(express.json());
app.use(correlationMiddleware);

app.use(healthRouter);
app.use(exportacaoRouter);
app.use(relatoriosRouter);

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`[RELATORIOS_SERVICE] ✅ Rodando na porta ${PORT}`);
  console.log(`[RELATORIOS_SERVICE]    Health: http://localhost:${PORT}/health`);
});

export default app;
