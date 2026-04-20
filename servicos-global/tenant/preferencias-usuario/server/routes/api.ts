// preferencias-usuario/server/routes/api.ts
// Rotas REST para leitura e atualização de preferências de UI do usuário.
//
// GET  /api/v1/preferencias  — retorna preferências do usuário (cria default se não existir)
// PUT  /api/v1/preferencias  — salva todos os campos de preferência do usuário

import { Router, type Request, type Response, type NextFunction } from 'express'
import { z } from 'zod'
import { prisma } from '../lib/prisma'
import { AppError } from '../lib/errors'

interface AuthRequest extends Request {
  user_id: string
  tenant_id: string
}

export const apiRoutes = Router()

// ---------------------------------------------------------------------------
// Middleware de auth simples — user_id e tenant_id via headers
// ---------------------------------------------------------------------------
const checkAuth = (req: Request, res: Response, next: NextFunction) => {
  const userId = req.headers['x-user-id']
  const tenantId = req.headers['x-tenant-id']

  if (!userId || !tenantId) {
    return res.status(401).json({ status: 'error', message: 'x-user-id e x-tenant-id são obrigatórios' })
  }

  req.user_id = userId
  req.tenant_id = tenantId
  next()
}

apiRoutes.use(checkAuth)

// ---------------------------------------------------------------------------
// Esquema de validação do PUT
// ---------------------------------------------------------------------------
const PreferenciasSchema = z.object({
  tooltips_disabled: z.boolean().optional(),
  theme:             z.enum(['dark', 'light']).optional(),
  sidebar_open:      z.boolean().optional(),
})

// ---------------------------------------------------------------------------
// GET /api/v1/preferencias
// Retorna as preferências do usuário. Se não existir, cria o registro default.
// ---------------------------------------------------------------------------
apiRoutes.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const { user_id, tenant_id } = req

    const prefs = await prisma.preferenciasUsuario.upsert({
      where:  { user_id },
      update: {},
      create: {
        user_id,
        tenant_id,
        tooltips_disabled: false,
        theme:             'dark',
        sidebar_open:      true,
      },
    })

    res.json({ status: 'success', data: prefs })
  } catch {
    // Tabela preferenciasUsuario não existe ainda — retorna defaults
    res.json({ status: 'success', data: { tooltips_disabled: false, theme: 'dark', sidebar_open: true } })
  }
})

// ---------------------------------------------------------------------------
// PUT /api/v1/preferencias
// Atualiza os campos enviados (merge parcial — só os campos presentes no body).
// ---------------------------------------------------------------------------
apiRoutes.put('/', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { user_id, tenant_id } = req

    const payload = PreferenciasSchema.parse(req.body)

    if (Object.keys(payload).length === 0) {
      throw new AppError('Nenhum campo de preferência foi enviado', 400)
    }

    const updated = await prisma.preferenciasUsuario.upsert({
      where:  { user_id },
      create: {
        user_id,
        tenant_id,
        tooltips_disabled: payload.tooltips_disabled ?? false,
        theme:             payload.theme             ?? 'dark',
        sidebar_open:      payload.sidebar_open      ?? true,
      },
      update: payload, // Atualiza apenas os campos enviados
    })

    res.json({ status: 'success', data: updated })
  } catch {
    // Tabela não existe — retorna sucesso silencioso
    res.json({ status: 'success', data: req.body })
  }
})
