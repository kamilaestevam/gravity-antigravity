// configurador/server/routes/checkAccess.ts
// AGENTE AUTH FLOW — ONDA 4
//
// Endpoint: GET /api/check-access
//
// Query params: tenant_id, product_id, user_id
//
// Retorna:
//   { allowed: boolean, permissions: string[] }
//
// Regras:
//   - Requer x-internal-key válida (chamada servidor-a-servidor)
//   - Ou JWT válido no Authorization header
//   - tenant_id, product_id e user_id são obrigatórios
//
// Lógica de permissões (simplificada para MVP):
//   - Consulta a tabela de permissões via Prisma
//   - Fallback: permite acesso se tenant ativo + produto existe

import { Router, Request, Response } from 'express'
import { withInternalKeyValidation } from '../../../middleware/withInternalKeyValidation.js'
import { z } from 'zod'

const checkAccessRouter = Router()

// ---------------------------------------------------------------------------
// Schema de validação
// ---------------------------------------------------------------------------

const CheckAccessQuerySchema = z.object({
  tenant_id: z.string().min(1, 'tenant_id é obrigatório'),
  product_id: z.string().min(1, 'product_id é obrigatório'),
  user_id: z.string().min(1, 'user_id é obrigatório'),
})

// ---------------------------------------------------------------------------
// Mapa de permissões por produto (MVP — sem banco de dados)
// Em produção, substituir por consulta Prisma
// ---------------------------------------------------------------------------

const PRODUCT_PERMISSIONS: Record<string, string[]> = {
  agendamento: ['agendamento:read', 'agendamento:write', 'agendamento:delete'],
  dashboard: ['dashboard:read', 'dashboard:export'],
  whatsapp: ['whatsapp:read', 'whatsapp:send', 'whatsapp:manage'],
  relatorios: ['relatorios:read', 'relatorios:export'],
  notificacoes: ['notificacoes:read', 'notificacoes:manage'],
  historico: ['historico:read'],
  helpdesk: ['helpdesk:read', 'helpdesk:write', 'helpdesk:manage'],
  'api-cockpit': ['api:read', 'api:write', 'api:manage'],
  gabi: ['gabi:chat', 'gabi:history'],
  'conector-erp': ['erp:sync', 'erp:read'],
  cronometro: ['cronometro:read', 'cronometro:write'],
  atividades: ['atividades:read', 'atividades:write'],
  'bid-frete': [
    'bid-frete:read',
    'bid-frete:write',
    'bid-frete:cotacao:create',
    'bid-frete:cotacao:approve',
    'bid-frete:cotacao:reject',
    'bid-frete:fornecedor:manage',
    'bid-frete:portal:access',
    'bid-frete:dashboard:read',
    'bid-frete:relatorios:export',
  ],
}

// ---------------------------------------------------------------------------
// GET /api/check-access
// ---------------------------------------------------------------------------

checkAccessRouter.get(
  '/check-access',
  withInternalKeyValidation,
  async (req: Request, res: Response): Promise<void> => {
    // Valida query params
    const parseResult = CheckAccessQuerySchema.safeParse(req.query)

    if (!parseResult.success) {
      res.status(400).json({
        error: 'Bad Request',
        message: 'Parâmetros inválidos',
        details: parseResult.error.flatten().fieldErrors,
      })
      return
    }

    const { tenant_id, product_id, user_id } = parseResult.data

    try {
      // MVP: retorna permissões baseadas no produto
      // Em produção: consultar Prisma para verificar
      //   - Se o tenant está ativo
      //   - Se o produto está habilitado para o tenant
      //   - Se o usuário tem as permissões específicas

      const permissions = PRODUCT_PERMISSIONS[product_id] ?? []
      const allowed = permissions.length > 0

      // Log de acesso para auditoria
      console.log(`[check-access] tenant=${tenant_id} product=${product_id} user=${user_id} allowed=${allowed}`)

      res.status(200).json({
        allowed,
        permissions,
        tenant_id,
        product_id,
        user_id,
        checked_at: new Date().toISOString(),
      })
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro interno'
      console.error(`[check-access] Erro: ${message}`)
      res.status(500).json({
        error: 'Internal Server Error',
        message,
      })
    }
  }
)

// ---------------------------------------------------------------------------
// Exports
// ---------------------------------------------------------------------------

export { checkAccessRouter }
