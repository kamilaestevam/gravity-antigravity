// server/services/sincronizar-acesso-usuario-produtos-service.ts
//
// PORTÃO 3 — Auto-sync do vínculo implícito (Interpretação 1, dono 2026-05-12)
//
// Mantém `usuario_permissao` (chave `<slug>:acesso_usuario_produtos_gravity:permitido`)
// sincronizada com a realidade do workspace:
//
//   - Produto habilitado num workspace        → todos Standards/Fornecedores ativos
//                                                ganham a chave Portão 3
//   - Produto desabilitado num workspace      → todas as linhas Portão 3 desse
//                                                produto naquele workspace são
//                                                removidas (de qualquer usuário)
//   - Usuário vinculado a um workspace        → ganha chave Portão 3 para cada
//                                                produto já habilitado nele
//   - Usuário desvinculado de um workspace    → todas as permissões do user nesse
//                                                workspace são apagadas (Portão 3
//                                                E granulares, evita órfãs)
//
// Master/SAdmin/Admin: bypass natural — não recebem linhas (Mand. 04 LIMBO).
//
// Todas as operações são idempotentes (createMany skipDuplicates / deleteMany).
// Erros são logados mas NÃO bloqueiam a operação principal — o auto-sync é
// "best-effort": se falhar, próxima ação corrige. Política consciente para
// não acoplar a mutação principal (habilitar produto, vincular usuário) à
// disponibilidade do banco para inserts em massa.
//
// Ator das linhas criadas:
//   'SISTEMA_AUTO_SYNC_PORTAO_3' (rastreável, distinguível do backfill α).

import { prisma } from '../lib/prisma.js'
import { buildAcessoUsuarioProdutosGravityString } from '../../shared/index.js'

const ATOR_AUTO_SYNC = 'SISTEMA_AUTO_SYNC_PORTAO_3'

/** Tipos que ganham linhas Portão 3 (Master/SAdmin/Admin têm bypass). */
const TIPOS_QUE_RECEBEM_PORTAO_3 = ['PADRAO', 'FORNECEDOR'] as const

// ─────────────────────────────────────────────────────────────────────────────
// PRODUTO × WORKSPACE — quando Master habilita/desabilita um produto num ws
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Master habilitou produto X no workspace Y → propaga acesso para todos
 * os Standards/Fornecedores ativos em Y (idempotente).
 */
export async function aoHabilitarProdutoNoWorkspace(args: {
  id_organizacao: string
  id_workspace: string
  id_produto_gravity: string
  slug_produto: string
}): Promise<{ linhasCriadas: number; usuariosAfetados: number }> {
  const { id_organizacao, id_workspace, id_produto_gravity, slug_produto } = args

  try {
    // Standards/Fornecedores ativos no workspace
    const memberships = await prisma.usuarioWorkspace.findMany({
      where: {
        id_organizacao,
        id_workspace,
        ativo_usuario_workspace: true,
        user: { tipo_usuario: { in: [...TIPOS_QUE_RECEBEM_PORTAO_3] } },
      },
      select: { id_usuario: true },
    })

    if (memberships.length === 0) return { linhasCriadas: 0, usuariosAfetados: 0 }

    const chave = buildAcessoUsuarioProdutosGravityString(slug_produto)
    const result = await prisma.usuarioPermissao.createMany({
      data: memberships.map((m) => ({
        id_organizacao,
        id_workspace,
        id_usuario: m.id_usuario,
        id_produto_gravity,
        permissao_usuario: chave,
        permissao_usuario_concedido_por: ATOR_AUTO_SYNC,
      })),
      skipDuplicates: true,
    })

    return { linhasCriadas: result.count, usuariosAfetados: memberships.length }
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn(
      `[sincronizar-acesso] Falha ao propagar Portão 3 ao habilitar ${slug_produto} em ${id_workspace}:`,
      err instanceof Error ? err.message : err,
    )
    return { linhasCriadas: 0, usuariosAfetados: 0 }
  }
}

/**
 * Master desabilitou produto X no workspace Y → remove TODAS as permissões
 * (Portão 3 + granulares) daquele produto naquele workspace, para qualquer
 * usuário. Evita órfãs e desbloqueia re-habilitação limpa.
 */
export async function aoDesabilitarProdutoNoWorkspace(args: {
  id_organizacao: string
  id_workspace: string
  id_produto_gravity: string
}): Promise<{ linhasRemovidas: number }> {
  const { id_organizacao, id_workspace, id_produto_gravity } = args

  try {
    const result = await prisma.usuarioPermissao.deleteMany({
      where: { id_organizacao, id_workspace, id_produto_gravity },
    })
    return { linhasRemovidas: result.count }
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn(
      `[sincronizar-acesso] Falha ao limpar Portão 3 ao desabilitar produto ${id_produto_gravity} em ${id_workspace}:`,
      err instanceof Error ? err.message : err,
    )
    return { linhasRemovidas: 0 }
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// USUÁRIO × WORKSPACE — quando Master vincula/desvincula usuário a um ws
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Master vinculou usuário U ao workspace Y → cria linhas Portão 3 para
 * todos os produtos já habilitados em Y (assinatura ATIVA/EM_TESTE).
 *
 * Apenas para PADRAO/FORNECEDOR (Master tem bypass).
 */
export async function aoVincularUsuarioAoWorkspace(args: {
  id_organizacao: string
  id_workspace: string
  id_usuario: string
}): Promise<{ linhasCriadas: number; produtosVinculados: number }> {
  const { id_organizacao, id_workspace, id_usuario } = args

  try {
    // Confere o tipo do usuário
    const usuario = await prisma.usuario.findFirst({
      where: { id_usuario, id_organizacao },
      select: { tipo_usuario: true },
    })
    if (!usuario || !TIPOS_QUE_RECEBEM_PORTAO_3.includes(usuario.tipo_usuario as 'PADRAO' | 'FORNECEDOR')) {
      return { linhasCriadas: 0, produtosVinculados: 0 }
    }

    // Produtos habilitados no workspace, com assinatura ATIVA/EM_TESTE
    const produtosDoWs = await prisma.produtoGravityWorkspace.findMany({
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
      select: {
        id_produto_gravity: true,
        produto: { select: { slug_produto_gravity: true } },
      },
    })

    if (produtosDoWs.length === 0) return { linhasCriadas: 0, produtosVinculados: 0 }

    const result = await prisma.usuarioPermissao.createMany({
      data: produtosDoWs.map((p) => ({
        id_organizacao,
        id_workspace,
        id_usuario,
        id_produto_gravity: p.id_produto_gravity,
        permissao_usuario: buildAcessoUsuarioProdutosGravityString(p.produto.slug_produto_gravity),
        permissao_usuario_concedido_por: ATOR_AUTO_SYNC,
      })),
      skipDuplicates: true,
    })

    return { linhasCriadas: result.count, produtosVinculados: produtosDoWs.length }
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn(
      `[sincronizar-acesso] Falha ao propagar Portão 3 ao vincular usuário ${id_usuario} ao workspace ${id_workspace}:`,
      err instanceof Error ? err.message : err,
    )
    return { linhasCriadas: 0, produtosVinculados: 0 }
  }
}

/**
 * Master desvinculou usuário U do workspace Y → remove TODAS as permissões
 * do user nesse workspace (Portão 3 + granulares — evita órfãs).
 */
export async function aoDesvincularUsuarioDoWorkspace(args: {
  id_organizacao: string
  id_workspace: string
  id_usuario: string
}): Promise<{ linhasRemovidas: number }> {
  const { id_organizacao, id_workspace, id_usuario } = args

  try {
    const result = await prisma.usuarioPermissao.deleteMany({
      where: { id_organizacao, id_workspace, id_usuario },
    })
    return { linhasRemovidas: result.count }
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn(
      `[sincronizar-acesso] Falha ao limpar Portão 3 ao desvincular usuário ${id_usuario} de ${id_workspace}:`,
      err instanceof Error ? err.message : err,
    )
    return { linhasRemovidas: 0 }
  }
}
