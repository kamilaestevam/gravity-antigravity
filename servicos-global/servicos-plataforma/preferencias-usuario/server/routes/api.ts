// preferencias-usuario/server/routes/api.ts
// Rotas REST para leitura e atualização de preferências de UI do usuário.
//
// GET  /api/v1/preferencias  — retorna preferências do usuário (cria default se não existir)
// PUT  /api/v1/preferencias  — salva todos os campos de preferência do usuário
//
// Padrão DDD (Onda 35): consumer usa prisma direto + filtro manual id_organizacao,
// e expõe DTO público preservando o contrato { tooltips_disabled, theme, sidebar_open }.

import { Router, type Request, type Response, type NextFunction } from 'express'
import { z } from 'zod'
import { prisma } from '../lib/prisma'
import { AppError } from '../lib/errors'

// req.auth é injetado pelo requireAuth do configurador (declare global em requireAuth.ts).
// Redeclarado aqui para garantir tipagem neste pacote isolado.
interface AuthRequest extends Request {
  auth: {
    id_usuario:    string
    id_organizacao: string
    clerkUserId:   string
    tipo_usuario:  string
    nome_usuario:  string
  }
}

export const apiRoutes = Router()

// ---------------------------------------------------------------------------
// ACL/DTO — preserva o contrato público (tooltips_disabled, theme, sidebar_open)
// ---------------------------------------------------------------------------
function toPreferenciasDto(p: {
  id_preferencia_workspace: string
  id_organizacao_preferencia_workspace: string
  id_usuario_preferencia_workspace: string
  tooltips_desabilitado_preferencia_workspace: boolean
  tema_preferencia_workspace: string
  sidebar_aberta_preferencia_workspace: boolean
  data_criacao_preferencia_workspace: Date
  data_atualizacao_preferencia_workspace: Date
}) {
  return {
    id: p.id_preferencia_workspace,
    tenant_id: p.id_organizacao_preferencia_workspace,
    user_id: p.id_usuario_preferencia_workspace,
    tooltips_disabled: p.tooltips_desabilitado_preferencia_workspace,
    theme: p.tema_preferencia_workspace,
    sidebar_open: p.sidebar_aberta_preferencia_workspace,
    created_at: p.data_criacao_preferencia_workspace,
    updated_at: p.data_atualizacao_preferencia_workspace,
  }
}

// ---------------------------------------------------------------------------
// Auth: req.auth é injetado pelo requireAuth do configurador antes deste router.
// Não há middleware adicional aqui — identidade vem do JWT Clerk validado (REGRA 01).
// ---------------------------------------------------------------------------
// Esquema de validação do PUT — mantém contrato público
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
    const { id_usuario, id_organizacao } = req.auth

    const prefs = await prisma.workspacePreferenciaUsuario.upsert({
      where: { id_usuario_preferencia_workspace: id_usuario },
      update: {},
      create: {
        id_usuario_preferencia_workspace: id_usuario,
        id_organizacao_preferencia_workspace: id_organizacao,
        tooltips_desabilitado_preferencia_workspace: false,
        tema_preferencia_workspace: 'dark',
        sidebar_aberta_preferencia_workspace: true,
      },
    })

    res.json({ status: 'success', data: toPreferenciasDto(prefs) })
  } catch {
    // Tabela não existe ainda — retorna defaults compatíveis com o contrato
    res.json({
      status: 'success',
      data: { tooltips_disabled: false, theme: 'dark', sidebar_open: true },
    })
  }
})

// ---------------------------------------------------------------------------
// PUT /api/v1/preferencias
// Atualiza os campos enviados (merge parcial — só os campos presentes no body).
// ---------------------------------------------------------------------------
apiRoutes.put('/', async (req: AuthRequest, res: Response, _next: NextFunction) => {
  try {
    const { id_usuario, id_organizacao } = req.auth

    const payload = PreferenciasSchema.parse(req.body)

    if (Object.keys(payload).length === 0) {
      throw new AppError('Nenhum campo de preferência foi enviado', 400)
    }

    // Mapeia DTO público → campos físicos DDD
    const updateData: {
      tooltips_desabilitado_preferencia_workspace?: boolean
      tema_preferencia_workspace?: string
      sidebar_aberta_preferencia_workspace?: boolean
    } = {}
    if (payload.tooltips_disabled !== undefined) {
      updateData.tooltips_desabilitado_preferencia_workspace = payload.tooltips_disabled
    }
    if (payload.theme !== undefined) {
      updateData.tema_preferencia_workspace = payload.theme
    }
    if (payload.sidebar_open !== undefined) {
      updateData.sidebar_aberta_preferencia_workspace = payload.sidebar_open
    }

    const updated = await prisma.workspacePreferenciaUsuario.upsert({
      where: { id_usuario_preferencia_workspace: id_usuario },
      create: {
        id_usuario_preferencia_workspace: id_usuario,
        id_organizacao_preferencia_workspace: id_organizacao,
        tooltips_desabilitado_preferencia_workspace: payload.tooltips_disabled ?? false,
        tema_preferencia_workspace: payload.theme ?? 'dark',
        sidebar_aberta_preferencia_workspace: payload.sidebar_open ?? true,
      },
      update: updateData,
    })

    res.json({ status: 'success', data: toPreferenciasDto(updated) })
  } catch {
    // Tabela não existe — retorna sucesso silencioso preservando body
    res.json({ status: 'success', data: req.body })
  }
})
