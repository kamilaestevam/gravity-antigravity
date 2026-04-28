import express, { Request, Response, NextFunction } from 'express'
import helmet from 'helmet'
import { PrismaClient } from '@prisma/client'
import { dashboardRouter } from './routes.js'
import { AppError } from './lib/errors.js'

const app = express()
app.use(helmet())
app.use(express.json())

// ---------------------------------------------------------------------------
// Prisma — instância global
// ---------------------------------------------------------------------------

const prisma = new PrismaClient()

// ---------------------------------------------------------------------------
// Auth — injeta req.auth a partir do header x-id-organizacao / x-id-usuario
// Em produção o gateway valida o JWT e propaga como headers internos.
// ---------------------------------------------------------------------------

app.use((req: Request, res: Response, next: NextFunction) => {
  const tenantId = req.headers['x-id-organizacao'] as string | undefined
  const userId = req.headers['x-id-usuario'] as string | undefined

  if (!tenantId) {
    return res.status(401).json({
      status: 'error',
      message: 'x-id-organizacao header is required',
    })
  }

  req.auth = { id_organizacao: tenantId, id_usuario: userId ?? '' }
  next()
})

// ---------------------------------------------------------------------------
// Tenant Isolation — injeta req.prisma com filtro automático por tenant_id
// ---------------------------------------------------------------------------

app.use((req: Request, res: Response, next: NextFunction) => {
  const tenantId = req.auth?.id_organizacao
  if (tenantId) {
    req.prisma = prisma.$extends({
      query: {
        $allModels: {
          async findMany({ args, query }: { args: Record<string, unknown>; query: (args: Record<string, unknown>) => Promise<unknown> }) {
            args.where = { ...(args.where as Record<string, unknown>), tenant_id: tenantId }
            return query(args)
          },
          async findFirst({ args, query }: { args: Record<string, unknown>; query: (args: Record<string, unknown>) => Promise<unknown> }) {
            args.where = { ...(args.where as Record<string, unknown>), tenant_id: tenantId }
            return query(args)
          },
          async create({ args, query }: { args: Record<string, unknown>; query: (args: Record<string, unknown>) => Promise<unknown> }) {
            ;(args.data as Record<string, unknown>).tenant_id = tenantId
            return query(args)
          },
          async update({ args, query }: { args: Record<string, unknown>; query: (args: Record<string, unknown>) => Promise<unknown> }) {
            args.where = { ...(args.where as Record<string, unknown>), tenant_id: tenantId }
            return query(args)
          },
          async delete({ args, query }: { args: Record<string, unknown>; query: (args: Record<string, unknown>) => Promise<unknown> }) {
            args.where = { ...(args.where as Record<string, unknown>), tenant_id: tenantId }
            return query(args)
          },
        },
      },
    }) as unknown as PrismaClient
  }
  next()
})

// ---------------------------------------------------------------------------
// Main router
// ---------------------------------------------------------------------------

app.use('/api/v1/dashboards', dashboardRouter)

// ---------------------------------------------------------------------------
// Global Error Handler
// ---------------------------------------------------------------------------

app.use((err: unknown, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({ error: err.message, code: err.code })
  }
  console.error(err)
  res.status(500).json({ error: 'Internal server error', code: 'INTERNAL_ERROR' })
})

// ---------------------------------------------------------------------------
// Server startup
// ---------------------------------------------------------------------------

const PORT = process.env.PORT || 8010

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`Dashboard service running on port ${PORT}`)
  })
}

// ---------------------------------------------------------------------------
// Graceful shutdown
// ---------------------------------------------------------------------------

process.on('SIGTERM', async () => {
  await prisma.$disconnect()
  process.exit(0)
})

export default app
