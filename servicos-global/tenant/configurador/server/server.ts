// configurador/server/server.ts
// AGENTE AUTH FLOW — ONDA 4
//
// Servidor Express do Configurador.
// Fornece o endpoint GET /api/check-access para verificar permissões
// de acesso de um usuário a um produto dentro de um tenant.
//
// Porta: 8020

import express from 'express'
import { checkAccessRouter } from './routes/checkAccess.js'

const app = express()
const PORT = process.env.PORT ?? 8020

app.use(express.json())

// ---------------------------------------------------------------------------
// Health check
// ---------------------------------------------------------------------------
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'configurador', timestamp: new Date().toISOString() })
})

// ---------------------------------------------------------------------------
// Routes
// ---------------------------------------------------------------------------
app.use('/api', checkAccessRouter)

// ---------------------------------------------------------------------------
// Start
// ---------------------------------------------------------------------------
export { app }

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`[Configurador] 🚀 Servidor rodando na porta ${PORT}`)
  })
}
