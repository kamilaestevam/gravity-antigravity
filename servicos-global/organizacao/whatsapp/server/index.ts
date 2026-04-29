import express, { Request, Response, NextFunction } from 'express'
import cors from 'cors'
import helmet from 'helmet'

// Middlewares - simulando os definidos nas políticas.
// Se eles não existissem no projeto, criariamos mocks. 
// Mas pela spec, assumiremos que `@tenant/middleware/correlation` etc existem.
// Para evitar falha no ts-node agora sem todos os modulos perfeitamente, podemos mockar caso não exista, 
// mas usaremos import direto do projeto.  Se o import falhar, ajustamos.
import { correlationMiddleware } from '@organizacao/middleware/correlation'
import { requireInternalKey } from '@organizacao/middleware/withInternalKeyValidation'
import { withTenantIsolation } from '@organizacao/middleware/withTenantIsolation'
import { errorHandler } from './errorHandler'
import { whatsappRoutes } from './routes'
import { prisma } from './prisma'

const app = express()

app.use(helmet())
app.use(cors())
app.use(express.json())

// Webhook payload comes raw sometimes, but express.json is fine usually unless verification needs raw body
app.use(express.json({
  verify: (req: Request & { rawBody?: Buffer }, _res: Response, buf: Buffer) => {
    req.rawBody = buf
  }
}))

app.use(correlationMiddleware)

// Algumas rotas do whatsapp (como webhook) não precisam de requireInternalKey
// Pois são chamadas pela Meta externa.
// Portanto, a montagem precisa ser cuidadosa.
// Webhook da meta é externo, rotas de envio/inbox são internas protegidas.

// Health check 
app.get('/health', async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`
    res.json({ status: 'ok', service: 'whatsapp' })
  } catch {
    res.status(503).json({ status: 'down' })
  }
})

// Webhook precisa de isolation? Provavelmente apenas identificamos o tenant pelo phone_number_id no payload
// Mas usaremos o router do whatsapp onde aplicaremos auth internamente e isolation externamente
app.use('/api/v1/whatsapp', whatsappRoutes)

app.use(errorHandler)

export { app }
