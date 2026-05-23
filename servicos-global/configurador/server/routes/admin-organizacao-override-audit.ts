/**
 * admin-organizacao-override-audit.ts
 *
 * Endpoint interno S2S para gravação de audit log quando o middleware do
 * SDK `@gravity/resolver-organizacao` aceita um override de organização
 * (Pendência #4). O middleware NÃO conhece o Prisma do Configurador
 * (camada inferior na pilha) — então delega a persistência via HTTP
 * fire-and-forget.
 *
 * Rota:
 *   POST /api/v1/internal/admin/audit-organizacao-override
 *
 * Autenticação:
 *   - x-chave-interna-servico (S2S — `requireInternalKey`).
 *   - Caller é o middleware do SDK rodando em qualquer produto que
 *     aceita o header `x-organizacao-override`.
 *
 * Persistência:
 *   - Grava 1 row em `AuditLogAdmin` por troca aceita.
 *   - Campos do banco são todos NOT NULL — falha de DB derruba a request.
 *     Caller (SDK) é fire-and-forget e engole erro: troca de org NÃO é
 *     bloqueada por falha de gravação (Mand. 08 — log alto no SDK).
 *
 * Mandamentos aplicados:
 *   - 06 (Zod): body validado antes do banco.
 *   - 08: erro retorna 4xx/5xx ruidoso (não silencia). SDK decide swallow.
 *   - 09: schema bilateral — atualizar em sincronia com middleware.ts.
 */

import { Router } from 'express'
import { z } from 'zod'
import { requireInternalKey } from '../middleware/requireInternalKey.js'
import { prisma } from '../lib/prisma.js'
import { AppError } from '../lib/appError.js'

export const adminOrganizacaoOverrideAuditRouter = Router()

// Aplicado em todas as rotas deste router (defesa em profundidade)
adminOrganizacaoOverrideAuditRouter.use(requireInternalKey)

// CUID v1 — mesmo formato usado no schema Prisma (id_organizacao, id_usuario)
const cuidSchema = z.string().regex(/^c[a-z0-9]{24}$/, 'CUID inválido')

const auditOrganizacaoOverrideBodySchema = z.object({
  id_usuario_ator:          cuidSchema,
  tipo_usuario_ator:        z.enum(['SUPER_ADMIN', 'ADMIN']),
  id_organizacao_origem:    cuidSchema,
  id_organizacao_destino:   cuidSchema,
  ip_origem:                z.string().min(1).max(64),
  correlation_id:           z.string().min(1).max(128),
})

adminOrganizacaoOverrideAuditRouter.post(
  '/audit-organizacao-override',
  async (req, res, next) => {
    try {
      const body = auditOrganizacaoOverrideBodySchema.parse(req.body)

      // Defesa: origem == destino seria um no-op no middleware (idempotência),
      // não deveria nem chegar aqui. Rejeita ruidosamente para diagnóstico.
      if (body.id_organizacao_origem === body.id_organizacao_destino) {
        throw new AppError(
          'id_organizacao_origem === id_organizacao_destino — override seria no-op',
          400,
          'OVERRIDE_AUDIT_NOOP',
        )
      }

      await prisma.auditLogAdmin.create({
        data: {
          id_usuario_audit_log_admin:     body.id_usuario_ator,
          tipo_usuario_audit_log_admin:   body.tipo_usuario_ator,
          acao_audit_log_admin:           'admin.organizacao_override.trocar',
          recurso_audit_log_admin:        'organizacao',
          filtros_audit_log_admin: {
            id_organizacao_origem:  body.id_organizacao_origem,
            id_organizacao_destino: body.id_organizacao_destino,
            cross_org:              true,
          },
          qtd_resultados_audit_log_admin: 1,
          ip_origem_audit_log_admin:      body.ip_origem,
          correlation_id_audit_log_admin: body.correlation_id,
        },
      })

      res.status(201).json({ ok: true })
    } catch (err) {
      next(err)
    }
  },
)
