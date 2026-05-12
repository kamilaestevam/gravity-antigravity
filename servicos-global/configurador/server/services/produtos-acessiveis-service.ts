// server/services/produtos-acessiveis-service.ts
//
// SSOT do filtro de produtos acessíveis por um usuário.
// Consumido por Hub (`/hub/init`) e Core (`/workspaces/:id/produtos-gravity`).
//
// Implementa os 3 PORTÕES de acesso a produto Gravity:
//   PORTÃO 1: Org contratou? — `ProdutoGravityAssinatura.status IN [ATIVA, EM_TESTE]`
//   PORTÃO 2: Workspace habilitou? — `ProdutoGravityWorkspace.ativo = true`
//   PORTÃO 3: Usuário pode abrir? — linha `<slug>:acesso_usuario_produtos_gravity:permitido` em UsuarioPermissao
//
// Master/SuperAdmin/Admin: bypass total dos portões (Mand. 04 — REGRA LIMBO).
//
// Existir aqui evita drift Hub↔Core (Mand. 09): a regra fica em UM lugar.

import { prisma } from '../lib/prisma.js'
import {
  buildAcessoUsuarioProdutosGravityString,
  temBypassPermissao,
  SECAO_ACESSO_PRODUTO,
  ACAO_ACESSO_PERMITIDO,
} from '../../shared/index.js'

const SUFIXO_CHAVE_PORTAO_3 = `:${SECAO_ACESSO_PRODUTO}:${ACAO_ACESSO_PERMITIDO}`

/**
 * Retorna os slugs de produtos que um usuário pode VER/ABRIR considerando os 3 portões.
 *
 * Master/SAdmin/Admin: retorna todos os produtos contratados pela org (Portões 1+2 da org).
 * Standard/Fornecedor: cruza com workspaces ativos + chave `acesso_usuario_produtos_gravity`.
 *
 * @param id_organizacao tenant do usuário
 * @param id_usuario     usuário consultando
 * @param id_workspace   se informado, restringe ao workspace específico (Core). Se null/undefined, agrega todos os workspaces do user (Hub).
 */
export async function listarSlugsProdutosAcessiveis(
  id_organizacao: string,
  id_usuario: string,
  id_workspace?: string,
): Promise<Set<string>> {
  // Lê tipo_usuario do banco (Mand. 01)
  const usuario = await prisma.usuario.findFirst({
    where: { id_usuario, id_organizacao },
    select: { tipo_usuario: true },
  })
  if (!usuario) return new Set()

  const ehBypass = temBypassPermissao(usuario)

  // ─── Master/SAdmin/Admin: Portões 1+2 sem Portão 3 (REGRA LIMBO Mand. 04) ───
  if (ehBypass) {
    if (id_workspace) {
      // Restrito a um workspace: Portões 1 (assinatura ATIVA) + 2 (workspace habilitou)
      const rows = await prisma.produtoGravityWorkspace.findMany({
        where: {
          id_organizacao,
          id_workspace,
          ativo_produto_gravity_workspace: true,
          produto: {
            assinaturas_produto_gravity: {
              some: {
                id_organizacao,
                status_assinatura_produto_gravity: { in: ['ATIVA', 'EM_TESTE'] },
              },
            },
          },
        },
        select: { produto: { select: { slug_produto_gravity: true } } },
      })
      return new Set(rows.map(r => r.produto.slug_produto_gravity))
    }
    // Hub (sem workspace específico): todos os produtos contratados pela org
    const configs = await prisma.produtoGravityConfiguracao.findMany({
      where: {
        id_organizacao_configuracao_produto_gravity: id_organizacao,
        ativo_configuracao_produto_gravity: true,
      },
      select: { chave_produto_configuracao_produto_gravity: true },
    })
    return new Set(configs.map(c => c.chave_produto_configuracao_produto_gravity))
  }

  // ─── Standard/Fornecedor: 3 portões obrigatórios ─────────────────────────────
  //
  // UsuarioPermissao não tem relação Prisma com ProdutoGravity/Workspace —
  // estratégia em 2 queries: (1) pega (id_produto, id_workspace) com Portão 3,
  // (2) cruza com ProdutoGravityWorkspace ativo + assinatura ATIVA.

  // Para o Hub, primeiro pegamos os workspaces onde o user tem membership ativa
  // (Portão prévio implícito: usuário precisa estar no workspace).
  // Para o Core, é o workspace específico passado.
  const workspacesDoUsuario = id_workspace
    ? [id_workspace]
    : (await prisma.usuarioWorkspace.findMany({
        where: { id_organizacao, id_usuario, ativo_usuario_workspace: true },
        select: { id_workspace: true },
      })).map(w => w.id_workspace)

  if (workspacesDoUsuario.length === 0) return new Set()

  // Query 1 — linhas de Portão 3 do usuário, nos workspaces dele
  const linhasPortao3 = await prisma.usuarioPermissao.findMany({
    where: {
      id_organizacao,
      id_usuario,
      id_workspace: { in: workspacesDoUsuario },
      permissao_usuario: { endsWith: SUFIXO_CHAVE_PORTAO_3 },
    },
    select: { id_produto_gravity: true, id_workspace: true },
  })

  if (linhasPortao3.length === 0) return new Set()

  // Set de pares (id_produto, id_workspace) onde o user tem Portão 3
  const paresPortao3 = new Set(
    linhasPortao3.map(l => `${l.id_produto_gravity}::${l.id_workspace}`),
  )
  const idsProdutosComPortao3 = [...new Set(linhasPortao3.map(l => l.id_produto_gravity))]

  // Query 2 — Portões 1 + 2: workspace tem produto ativo + assinatura ATIVA
  const workspaceProdutos = await prisma.produtoGravityWorkspace.findMany({
    where: {
      id_organizacao,
      id_workspace: { in: workspacesDoUsuario },
      id_produto_gravity: { in: idsProdutosComPortao3 },
      ativo_produto_gravity_workspace: true,
      produto: {
        assinaturas_produto_gravity: {
          some: {
            id_organizacao,
            status_assinatura_produto_gravity: { in: ['ATIVA', 'EM_TESTE'] },
          },
        },
      },
    },
    select: {
      id_produto_gravity: true,
      id_workspace: true,
      produto: { select: { slug_produto_gravity: true } },
    },
  })

  // Interseção: produto só entra se o MESMO (produto, workspace) passa nos 3 portões
  const slugs = new Set<string>()
  for (const wp of workspaceProdutos) {
    if (paresPortao3.has(`${wp.id_produto_gravity}::${wp.id_workspace}`)) {
      slugs.add(wp.produto.slug_produto_gravity)
    }
  }
  return slugs
}

/**
 * Atalho: gera a chave do Portão 3 para um produto.
 * Re-exportado por conveniência — fonte canônica em `shared/permissoes-canonicas.ts`.
 */
export { buildAcessoUsuarioProdutosGravityString }
