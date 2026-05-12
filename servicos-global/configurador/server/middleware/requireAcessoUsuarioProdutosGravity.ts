// server/middleware/requireAcessoUsuarioProdutosGravity.ts
//
// PORTÃO 3 — Gate de acesso usuário × produto Gravity.
//
// Aplicado no entrypoint do server de cada produto (Pedido, BID-Frete, etc.).
// Lê o `id_workspace` do request (params, query OU header `x-id-workspace`).
//
// Modelo de 3 portões:
//   1. Org contratou produto (assinatura ATIVA/EM_TESTE) — gateado em Hub/Core
//   2. Workspace habilitou produto — gateado em Hub/Core
//   3. Usuário tem chave `<slug>:acesso_usuario_produtos_gravity:permitido` ← AQUI
//
// Mandamentos:
//   01 — tipo_usuario vem do JWT validado por requireAuth (banco, não Clerk)
//   04 — Master/SuperAdmin/Admin bypass total
//   08 — fail-closed: usuário sem linha → 403 (não fallback silencioso)
//
// Deve ser usado APÓS requireAuth.

import type { Request, Response, NextFunction } from 'express'
import { AppError } from '../lib/appError.js'
import { servicoPermissaoUsuario } from '../services/permissao-usuario-servico.js'

/**
 * Factory: gera middleware que protege rotas de UM produto específico.
 *
 * Uso típico (no entrypoint do server do produto):
 * ```ts
 * import { requireAcessoUsuarioProdutosGravity } from '@configurador-middleware/...'
 * app.use('/api/v1', requireAuth, requireAcessoUsuarioProdutosGravity('pedido'))
 * ```
 */
export function requireAcessoUsuarioProdutosGravity(slugProduto: string) {
  return async function gate(
    req: Request,
    _res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      if (!req.auth?.id_usuario || !req.auth?.id_organizacao) {
        next(new AppError('Autenticação necessária', 401, 'UNAUTHORIZED'))
        return
      }

      // Workspace pode vir de header (padrão produtos), params ou query.
      // Mand. 08: sem fallback silencioso — se não veio workspace, 400.
      const idWorkspace =
        (req.headers['x-id-workspace'] as string | undefined) ??
        (req.params.id_workspace as string | undefined) ??
        (req.query.id_workspace as string | undefined)

      if (!idWorkspace) {
        next(new AppError(
          'Workspace não informado — produto exige header x-id-workspace ou param id_workspace',
          400,
          'WORKSPACE_NAO_INFORMADO',
        ))
        return
      }

      const permitido = await servicoPermissaoUsuario.verificarAcessoUsuarioProdutoGravity({
        id_organizacao: req.auth.id_organizacao,
        id_usuario: req.auth.id_usuario,
        slug_produto: slugProduto,
        id_workspace: idWorkspace,
      })

      if (!permitido) {
        next(new AppError(
          `Acesso ao produto "${slugProduto}" não autorizado para este usuário neste workspace`,
          403,
          'ACESSO_PRODUTO_NEGADO',
        ))
        return
      }

      next()
    } catch (err) {
      next(err)
    }
  }
}
