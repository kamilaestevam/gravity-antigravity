// server/routes/workspaces-habilitados-internal.ts
//
// Endpoint S2S (Server-to-Server) para resolver lista de workspaces que um
// usuário pode acessar dentro de uma organização. Consumido por produtos
// (ex: Pedido) para validar filtros multi-workspace em listas.
//
// Montado em: /api/v1/internal/usuarios/:id_usuario/workspaces-habilitados
//
// Padrão de permissão (replica `hub-init.ts:65-89` — SSOT do projeto):
//   - SUPER_ADMIN/ADMIN/MASTER → todos os workspaces ATIVOS da organização
//   - PADRAO/FORNECEDOR        → apenas workspaces onde UsuarioWorkspace.ativo = true
//
// Response: sempre `string[]` (lista de IDs). Nunca string mágica tipo 'TODOS'.
// O consumer faz set intersection sem branching extra.
//
// Auth: x-chave-interna-servico (via requireInternalKey middleware)

import { Router } from 'express'
import { z } from 'zod'
import { requireInternalKey } from '../middleware/requireInternalKey.js'
import { prisma } from '../lib/prisma.js'
import { AppError } from '../lib/appError.js'

export const workspacesHabilitadosInternalRouter = Router()

// Aplica x-chave-interna-servico em todas as rotas deste roteador.
// `requireInternalKey` aceita também `x-internal-key` (legado).
workspacesHabilitadosInternalRouter.use(requireInternalKey)

const QuerySchema = z.object({
  id_organizacao: z.string().min(1, 'id_organizacao obrigatório'),
})

/**
 * GET /api/v1/internal/usuarios/:id_usuario/workspaces-habilitados?id_organizacao=X
 *
 * Retorna o tipo do usuário e a lista de workspaces que ele pode acessar
 * na organização informada.
 *
 * Validações:
 *   - x-chave-interna-servico válida (middleware)
 *   - id_organizacao do query bate com id_organizacao do usuário (defesa
 *     em profundidade contra requests forjados; exceção: FORNECEDOR cross-tenant
 *     pode aparecer em múltiplas orgs — checagem mais leniente)
 *
 * Response 200:
 *   {
 *     tipo_usuario: 'SUPER_ADMIN' | 'ADMIN' | 'MASTER' | 'PADRAO' | 'FORNECEDOR',
 *     workspaces_habilitados: string[]
 *   }
 *
 * Erros:
 *   - 400 VALIDATION_ERROR    — query inválido
 *   - 404 USUARIO_NAO_ENCONTRADO
 *   - 403 ORGANIZACAO_MISMATCH — usuário não pertence à org informada
 */
workspacesHabilitadosInternalRouter.get('/:id_usuario/workspaces-habilitados', async (req, res, next) => {
  try {
    const parsedQuery = QuerySchema.safeParse(req.query)
    if (!parsedQuery.success) {
      throw new AppError(
        parsedQuery.error.errors[0]?.message ?? 'Parâmetros inválidos',
        400,
        'VALIDATION_ERROR',
      )
    }
    const { id_organizacao } = parsedQuery.data
    const id_usuario = req.params.id_usuario

    const usuario = await prisma.usuario.findUnique({
      where: { id_usuario },
      select: { id_usuario: true, id_organizacao: true, tipo_usuario: true },
    })

    if (!usuario) {
      throw new AppError('Usuário não encontrado', 404, 'USUARIO_NAO_ENCONTRADO')
    }

    // Validação cross-org (defesa em profundidade — Mand. 04)
    // FORNECEDOR cross-tenant é exceção: pode pertencer a múltiplas orgs
    // via UsuarioWorkspace, então não exigimos id_organizacao match estrito.
    if (
      usuario.tipo_usuario !== 'FORNECEDOR' &&
      usuario.id_organizacao !== id_organizacao
    ) {
      throw new AppError(
        'Usuário não pertence à organização informada',
        403,
        'ORGANIZACAO_MISMATCH',
      )
    }

    const ehAdminPlataforma =
      usuario.tipo_usuario === 'SUPER_ADMIN' ||
      usuario.tipo_usuario === 'ADMIN' ||
      usuario.tipo_usuario === 'MASTER'

    const workspaces_habilitados = ehAdminPlataforma
      ? await prisma.workspace
          .findMany({
            where: { id_organizacao, status_workspace: 'ATIVO' },
            select: { id_workspace: true },
            orderBy: { data_criacao_workspace: 'desc' },
          })
          .then((rows) => rows.map((w) => w.id_workspace))
      : await prisma.usuarioWorkspace
          .findMany({
            where: {
              id_usuario,
              id_organizacao,
              ativo_usuario_workspace: true,
              company: { status_workspace: 'ATIVO' },
            },
            select: { id_workspace: true },
          })
          .then((rows) => rows.map((w) => w.id_workspace))

    res.json({
      tipo_usuario: usuario.tipo_usuario,
      workspaces_habilitados,
    })
  } catch (err) {
    next(err)
  }
})
