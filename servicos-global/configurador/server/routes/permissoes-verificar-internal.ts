// server/routes/permissoes-verificar-internal.ts
//
// Endpoint S2S (Server-to-Server) — produto consulta se um usuário tem uma
// permissão granular específica `<slug>:<secao>:<acao>` em um workspace.
// Consumido pelo helper `criarRequirePermissao` em `@gravity/resolver-organizacao`
// (Pedido + futuros produtos).
//
// Montado em: /api/v1/internal/permissoes/verificar
//
// Comportamento (delega no `servicoPermissaoUsuario.verificarPermissao`):
//   - SUPER_ADMIN/ADMIN/MASTER → bypass total (Mandamento 04 LIMBO) → permitido = true
//   - STANDARD/FORNECEDOR      → exige linha em UsuarioPermissao (sem fallback — Mand. 08)
//
// Defesa em profundidade (forged-org attack):
//   1. Middleware `requireInternalKey` exige a chave compartilhada.
//   2. Esta rota valida que o `id_usuario` pertence ao `id_organizacao` enviado
//      no body. Se não, retorna 403 + audita `securityAudit.crossTenantAttempt`.
//      Sem isso, um produto comprometido (vazamento de chave) poderia
//      consultar permissões de usuários de qualquer organização forjando
//      pares (id_usuario, id_organizacao) arbitrários.
//
// Auth: x-chave-interna-servico (via requireInternalKey middleware)

import { Router } from 'express'
import { z } from 'zod'
import { requireInternalKey } from '../middleware/requireInternalKey.js'
import { prisma } from '../lib/prisma.js'
import { servicoPermissaoUsuario } from '../services/permissao-usuario-servico.js'
import { AppError } from '../lib/appError.js'
import { securityAudit } from '../../../servicos-plataforma/historico-global/server/lib/securityAuditLogger.js'
import { SECOES_PRODUTO, ACOES_PRODUTO } from '../../shared/index.js'

export const permissoesVerificarInternalRouter = Router()

permissoesVerificarInternalRouter.use(requireInternalKey)

const CUID_V1_V2 = /^[a-z][a-z0-9]{22,24}$/

const BodySchema = z.object({
  id_organizacao: z.string().min(1),
  id_usuario:     z.string().regex(CUID_V1_V2, 'CUID v1/v2 inválido'),
  id_workspace:   z.string().regex(CUID_V1_V2, 'CUID v1/v2 inválido'),
  slug_produto:   z.string().regex(/^[a-z][a-z0-9-]*$/, 'slug inválido (lowercase, hifens)'),
  secao:          z.enum(SECOES_PRODUTO),
  acao:           z.enum(ACOES_PRODUTO),
})

/**
 * POST /api/v1/internal/permissoes/verificar
 *
 * Body: { id_organizacao, id_usuario, id_workspace, slug_produto, secao, acao }
 *
 * Response 200: { permitido: boolean, motivo: 'BYPASS' | 'CHAVE_GRANULAR' | 'SEM_CHAVE' | 'USUARIO_NAO_ENCONTRADO' }
 *
 * Response 400: body inválido (Zod)
 * Response 403: cross-org forjado (id_usuario não pertence a id_organizacao)
 */
permissoesVerificarInternalRouter.post('/verificar', async (req, res, next) => {
  try {
    const parsed = BodySchema.safeParse(req.body)
    if (!parsed.success) {
      console.error('[permissoes/verificar] Zod validation failed', {
        errors: parsed.error.errors,
        body: req.body,
      })
      throw new AppError(parsed.error.errors[0]?.message ?? 'Body inválido', 400, 'VALIDATION_ERROR')
    }
    const { id_organizacao, id_usuario, id_workspace, slug_produto, secao, acao } = parsed.data

    // Defesa cross-org: valida que id_usuario pertence a id_organizacao.
    const usuarioDaOrg = await prisma.usuario.findFirst({
      where: { id_usuario, id_organizacao },
      select: { id_usuario: true },
    })
    if (!usuarioDaOrg) {
      // Audita tentativa de cross-tenant via S2S (chave comprometida ou bug).
      void securityAudit.crossTenantAttempt(id_organizacao, id_usuario, {
        id_organizacao_alvo: id_organizacao,
        endpoint:            '/api/v1/internal/permissoes/verificar',
      }).catch(() => { /* fire-and-forget */ })
      throw new AppError(
        'id_usuario não pertence a id_organizacao (cross-org bloqueado)',
        403,
        'CROSS_TENANT_FORBIDDEN',
      )
    }

    const permitido = await servicoPermissaoUsuario.verificarPermissao({
      id_organizacao,
      id_usuario,
      id_workspace,
      slug_produto,
      secao,
      acao,
    })

    res.json({ permitido, slug_produto, secao, acao })
  } catch (err) {
    next(err)
  }
})
