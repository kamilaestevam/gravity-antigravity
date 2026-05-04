// server/middleware/requirePermissao.ts
//
// Middleware factory que protege rotas de produtos (Pedido, Simula Custo, etc.)
// exigindo permissão granular `<slug>:<secao>:<acao>` para o usuário autenticado.
//
// Bypass total (Mandamento 04 — LIMBO):
//  - SUPER_ADMIN, ADMIN, MASTER → passa direto sem consultar UsuarioPermissao
//  - PADRAO/FORNECEDOR → exige linha física em UsuarioPermissao
//
// Mandamento 08 — sem fallback silencioso: linha ausente lança AppError(403),
// nunca return false ou ?? null. Permissão indefinida = NEGADA com barulho.
//
// Deve ser usado APÓS requireAuth (depende de req.auth.id_organizacao, id_usuario,
// tipo_usuario). Espera `id_workspace` em req.params ou req.query — se ausente,
// lança 400 com mensagem clara.
//
// Uso:
//   router.get('/pedidos', requireAuth, requirePermissao('pedido', 'lista', 'ver'), ...)
//   router.put('/pedidos/:id', requireAuth, requirePermissao('pedido', 'lista', 'editar'), ...)

import type { Request, Response, NextFunction } from 'express'
import { AppError } from '../lib/appError.js'
import {
  servicoPermissaoUsuario,
  SECOES_PRODUTO,
  ACOES_PRODUTO,
  type SecaoProduto,
  type AcaoProduto,
} from '../services/permissao-usuario-servico.js'
import { temBypassPermissao } from '../../shared/index.js'

/**
 * Cria middleware que exige permissão `<slug>:<secao>:<acao>`.
 * Lança AppError(403) FORBIDDEN_PERMISSION se o usuário PADRAO/FORNECEDOR
 * não tiver a linha em UsuarioPermissao (Mandamento 08).
 */
export function requirePermissao(
  slug_produto: string,
  secao: SecaoProduto,
  acao: AcaoProduto,
) {
  // Validação dev-time — falha alto se desenvolvedor passar valor errado
  if (!SECOES_PRODUTO.includes(secao)) {
    throw new Error(`requirePermissao: seção inválida "${secao}". Esperado: ${SECOES_PRODUTO.join('|')}`)
  }
  if (!ACOES_PRODUTO.includes(acao)) {
    throw new Error(`requirePermissao: ação inválida "${acao}". Esperado: ${ACOES_PRODUTO.join('|')}`)
  }

  return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.auth?.tipo_usuario || !req.auth?.id_usuario || !req.auth?.id_organizacao) {
        throw new AppError('Autenticação necessária', 401, 'UNAUTHORIZED')
      }

      // 1. Bypass Mandamento 04 — Master/SAdmin/Admin têm acesso global
      if (temBypassPermissao(req.auth)) {
        next()
        return
      }

      // 2. Granular: precisa de id_workspace (defesa por workspace)
      const id_workspace =
        (typeof req.params.id_workspace === 'string' && req.params.id_workspace) ||
        (typeof req.query.id_workspace === 'string' && req.query.id_workspace) ||
        (typeof req.body?.id_workspace === 'string' && req.body.id_workspace) ||
        undefined

      if (!id_workspace) {
        throw new AppError(
          'id_workspace é obrigatório para verificação de permissão granular',
          400,
          'WORKSPACE_REQUIRED',
        )
      }

      const permitido = await servicoPermissaoUsuario.verificarPermissao({
        id_organizacao: req.auth.id_organizacao,
        id_usuario: req.auth.id_usuario,
        slug_produto,
        secao,
        acao,
        id_workspace,
      })

      if (!permitido) {
        throw new AppError(
          `Permissão negada: ${slug_produto}:${secao}:${acao}`,
          403,
          'FORBIDDEN_PERMISSION',
        )
      }

      next()
    } catch (err) {
      next(err)
    }
  }
}
