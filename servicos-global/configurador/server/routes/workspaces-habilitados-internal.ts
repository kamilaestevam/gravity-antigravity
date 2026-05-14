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
import { organizacaoService } from '../services/organizacao-service.js'
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

    // Refactor D11 (2026-05-13): consome o service SSOT
    // `organizacaoService.workspacesAcessiveis()`. Antes a regra estava
    // duplicada aqui e em /hub/init — fim do drift.
    //
    // FORNECEDOR cross-tenant: habilitamos via `permitirCrossTenantFornecedor: true`
    // — único endpoint da plataforma que aceita o vínculo cross-org legitimamente.
    // Service garante:
    //   - 404 USUARIO_NAO_ENCONTRADO (usuário inexistente)
    //   - 403 ORGANIZACAO_MISMATCH   (non-FORNECEDOR em org diferente)
    //   - tipo_usuario lido do banco (Mand. 01 — caller não pode mentir)
    const { tipoUsuario, workspaces } = await organizacaoService.workspacesAcessiveis({
      idUsuario: id_usuario,
      idOrganizacaoSolicitada: id_organizacao,
      permitirCrossTenantFornecedor: true,
    })

    // Projeção: apenas IDs (contrato S2S original — consumers fazem fetch
    // rico via outros endpoints quando precisarem de nome/cnpj/status).
    res.json({
      tipo_usuario: tipoUsuario,
      workspaces_habilitados: workspaces.map((w) => w.id_workspace),
    })
  } catch (err) {
    next(err)
  }
})
