// preferencias-usuario/server/index.ts
// Servidor Express do serviço de Preferências do Usuário.
//
// Porta: 8014
// Rotas montadas em: /api/v1/preferencias

import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { apiRoutes } from './routes/api'
import { errorHandler } from './middleware/error-handler'

dotenv.config()

const app = express()
app.use(cors())
app.use(express.json())

// Health check
app.get('/health', (_req, res) => res.json({ status: 'ok', service: 'preferencias-usuario' }))

// Rotas
app.use('/api/v1/preferencias', apiRoutes)

// Error Handler (deve ser o último middleware)
app.use(errorHandler)

const PORT = parseInt(process.env.PORT ?? '8014', 10)

app.listen(PORT, () => {
  console.log(`[Preferências] 🚀 Serviço rodando na porta ${PORT}`)
})
