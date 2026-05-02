// server/index.ts
// Servidor Express do serviço de Atividades (CRM).
// Porta: configurada via variável de ambiente ATIVIDADES_PORT (padrão 8006 em produção).
// NOTA: Nunca hardcode a porta — use apenas process.env.

import express from 'express'
import helmet from 'helmet'
import { correlationMiddleware } from './middleware/correlation.js'
import { errorHandler } from './middleware/error-handler.js'
import { prisma } from './lib/prisma.js'
import { empresasRouter } from './routes/empresas.js'
import { contatosRouter } from './routes/contatos.js'
import { atividadesRouter } from './routes/atividades.js'
import { pipelinesRouter } from './routes/pipelines.js'
import { kanbanRouter } from './routes/kanban.js'

const app = express()

// ---------------------------------------------------------------------------
// 1. Security Headers
// ---------------------------------------------------------------------------

app.use(helmet())

// ---------------------------------------------------------------------------
// 2. Parse de body
// ---------------------------------------------------------------------------

app.use(express.json())

// ---------------------------------------------------------------------------
// 2. Correlation ID
// ---------------------------------------------------------------------------

app.use(correlationMiddleware)

// ---------------------------------------------------------------------------
// 3. Auth — injeta req.auth a partir do header x-id-organizacao / x-id-usuario
//    Em produção o gateway valida o JWT e propaga como headers internos.
// ---------------------------------------------------------------------------

app.use((req, _res, next) => {
  const tenantId = req.headers['x-id-organizacao'] as string | undefined
  const userId = req.headers['x-id-usuario'] as string | undefined

  if (!tenantId) {
    _res.status(401).json({
      error: { code: 'UNAUTHORIZED', message: 'x-id-organizacao obrigatório' },
    })
    return
  }

  req.auth = { id_organizacao: tenantId, id_usuario: userId ?? '' }
  next()
})

// ---------------------------------------------------------------------------
// 4. Health check — sem autenticação
// ---------------------------------------------------------------------------

app.get('/health', async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`
    res.json({ status: 'ok', service: 'atividades' })
  } catch {
    res.status(503).json({ status: 'down', service: 'atividades' })
  }
})

// ---------------------------------------------------------------------------
// 5. Rotas de negócio
// ---------------------------------------------------------------------------

app.use('/api/v1/empresas', empresasRouter)
app.use('/api/v1/contatos', contatosRouter)
app.use('/api/v1/atividades', atividadesRouter)
app.use('/api/v1/pipelines', pipelinesRouter)
app.use('/api/v1/colunas-kanban', kanbanRouter)

// ---------------------------------------------------------------------------
// 6. Error handler — sempre o último
// ---------------------------------------------------------------------------

app.use(errorHandler)

// ---------------------------------------------------------------------------
// Export — o servidor é iniciado externamente ou via dev script
// ---------------------------------------------------------------------------

export { app }

// Inicialização local via `npm run dev`
if (process.env.NODE_ENV !== 'test') {
  const PORT = Number(process.env.ATIVIDADES_PORT ?? 8006)
  app.listen(PORT, () => {
    console.log(`[atividades] servidor rodando na porta ${PORT}`)
  })
}
