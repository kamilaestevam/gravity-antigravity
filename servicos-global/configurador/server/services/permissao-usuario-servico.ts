// server/services/permissao-usuario-servico.ts
// Gestão granular de permissões por organização + workspace + usuário + produto.
//
// Convenção canônica de permissão (decisão arquitetural 2026-05-04):
//   <slug_produto>:<secao>:<acao>   ex: 'pedido:dashboard:ver', 'pedido:configuracao:editar'
// Cada combinação vira UMA linha em UsuarioPermissao.permissao_usuario.
// Bypass total: SUPER_ADMIN, ADMIN, MASTER (Mandamento 04).
// STANDARD/FORNECEDOR — verificação granular obrigatória (Mandamento 08: sem fallback).

import { z } from 'zod'
import { prisma } from '../lib/prisma.js'
import { AppError } from '../lib/appError.js'
import {
  temBypassPermissao,
  SECOES_PRODUTO,
  ACOES_PRODUTO,
  PRODUTOS_COM_PERMISSOES_IMPLEMENTADAS,
  PERMISSAO_REGEX_PATTERN,
  buildPermissaoString,
  parsePermissaoString,
  buildAcessoUsuarioProdutosGravityString,
  ehPermissaoAcessoUsuarioProdutoGravity,
  extrairSlugDaPermissao,
  SECAO_ACESSO_PRODUTO,
  ACAO_ACESSO_PERMITIDO,
  type SecaoProduto,
  type AcaoProduto,
} from '../../shared/index.js'

// Re-export para consumidores que já importam tudo deste arquivo.
// Fonte da verdade canônica: shared/permissoes-canonicas.ts (Mandamento 07).
export {
  temBypassPermissao,
  SECOES_PRODUTO,
  ACOES_PRODUTO,
  PRODUTOS_COM_PERMISSOES_IMPLEMENTADAS,
  buildPermissaoString,
  parsePermissaoString,
  buildAcessoUsuarioProdutosGravityString,
  ehPermissaoAcessoUsuarioProdutoGravity,
  SECAO_ACESSO_PRODUTO,
  ACAO_ACESSO_PERMITIDO,
}
export type { SecaoProduto, AcaoProduto }

// ─── Schema Zod (Mandamento 09 — bilateral) ──────────────────────────────────

/** Regex que valida `<slug>:<secao>:<acao>`. Mesmo pattern usado no Zod do front. */
const PERMISSAO_REGEX = new RegExp(PERMISSAO_REGEX_PATTERN)

export const permissaoStringSchema = z.string().regex(
  PERMISSAO_REGEX,
  'Formato inválido — esperado <slug>:<secao>:<acao>',
)

/**
 * Validação cruzada: `<slug>:<secao>:editar` exige `<slug>:<secao>:ver` na mesma lista.
 * Editar sem Ver é estado impossível na UX (não dá pra editar o que não vê) e
 * complica o gating. Rejeitar no save evita estado inconsistente no banco.
 * Decisão dono 2026-05-13.
 *
 * EXCEÇÃO: chave de Portão 3 (`<slug>:acesso_usuario_produtos_gravity:permitido`)
 * é independente — não casa com nenhuma seção granular.
 */
function validarEditarImplicaVer(permissoes: string[]): { valido: true } | { valido: false; chaveSemVer: string } {
  const set = new Set(permissoes)
  for (const chave of permissoes) {
    // Casa apenas chaves granulares no formato <slug>:<secao>:editar
    const match = /^([a-z][a-z0-9-]*):([a-z_]+):editar$/.exec(chave)
    if (!match) continue
    const [, slug, secao] = match
    const chaveVer = `${slug}:${secao}:ver`
    if (!set.has(chaveVer)) return { valido: false, chaveSemVer: chave }
  }
  return { valido: true }
}

const CUID_OR_UUID = /^([a-z][a-z0-9]{22,24}|[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})$/

export const setPermissoesUsuarioInputSchema = z.object({
  id_workspace: z.string().regex(CUID_OR_UUID, 'CUID v1/v2 ou UUID v4 inválido'),
  id_produto_gravity: z.string().regex(CUID_OR_UUID, 'CUID v1/v2 ou UUID v4 inválido'),
  permissoes: z.array(permissaoStringSchema)
    .refine(arr => new Set(arr).size === arr.length, 'Permissões duplicadas não são permitidas')
    .refine(
      arr => validarEditarImplicaVer(arr).valido,
      arr => {
        const r = validarEditarImplicaVer(arr)
        if (r.valido) return { message: '' }
        return {
          message: `Permissão "${r.chaveSemVer}" exige a chave ":ver" correspondente da mesma seção (editar sem ver é estado inconsistente)`,
        }
      },
    ),
})

export type SetPermissoesUsuarioInput = z.infer<typeof setPermissoesUsuarioInputSchema>

// ─── DTO PT-BR (Mandamento 03) ───────────────────────────────────────────────

export interface PermissaoUsuarioDTO {
  id_organizacao: string
  id_workspace: string
  id_usuario: string
  id_produto_gravity: string
  permissao_usuario: string // formato <slug>:<secao>:<acao>
  permissao_usuario_concedido_por: string
  data_criacao_permissao_usuario: Date
}

// Helpers `buildPermissaoString` e `parsePermissaoString` vêm do shared/
// (re-exportados acima). Manter import único — Mandamento 07.

// ─── Service ─────────────────────────────────────────────────────────────────

interface VerificarPermissaoInput {
  id_organizacao: string
  id_usuario: string
  /** slug do produto — ex: 'pedido' */
  slug_produto: string
  /** seção dentro do produto */
  secao: SecaoProduto
  /** ação solicitada */
  acao: AcaoProduto
  /** workspace onde a ação está sendo executada */
  id_workspace: string
}

export const servicoPermissaoUsuario = {
  /**
   * PORTÃO 3 — Verifica se o usuário tem direito de ABRIR o produto no workspace.
   *
   * Diferente de `verificarPermissao` (granular `<slug>:<secao>:<acao>`), aqui
   * checamos apenas a chave sentinela `<slug>:acesso_usuario_produtos_gravity:permitido`.
   *
   * Bypass total para Master/SuperAdmin/Admin (Mand. 04).
   * STANDARD/FORNECEDOR sem linha → false (Mand. 08 — deny-by-default).
   *
   * Convenção da chave: ver `shared/permissoes-canonicas.ts` —
   * `buildAcessoUsuarioProdutosGravityString(slug)`.
   */
  async verificarAcessoUsuarioProdutoGravity(input: {
    id_organizacao: string
    id_usuario: string
    /** slug do produto — ex: 'pedido' */
    slug_produto: string
    /** workspace onde o produto está sendo aberto */
    id_workspace: string
  }): Promise<boolean> {
    const { id_organizacao, id_usuario, slug_produto, id_workspace } = input

    const usuario = await prisma.usuario.findFirst({
      where: { id_usuario, id_organizacao },
      select: { tipo_usuario: true },
    })

    if (!usuario) return false

    // 1. Bypass Mand. 04 — Master/SAdmin/Admin sempre acessam
    if (temBypassPermissao(usuario)) return true

    // 2. Resolve slug → id_produto_gravity (catálogo)
    const produto = await prisma.produtoGravity.findUnique({
      where: { slug_produto_gravity: slug_produto },
      select: { id_produto_gravity: true },
    })
    if (!produto) return false

    // 3. Procura linha exata da chave sentinela (Mand. 08 — sem fallback)
    const chave = buildAcessoUsuarioProdutosGravityString(slug_produto)
    const linha = await prisma.usuarioPermissao.findFirst({
      where: {
        id_organizacao,
        id_workspace,
        id_usuario,
        id_produto_gravity: produto.id_produto_gravity,
        permissao_usuario: chave,
      },
      select: { id_usuario_permissao: true },
    })

    return !!linha
  },

  /**
   * Verifica se o usuário tem permissão `<slug>:<secao>:<acao>` no workspace.
   * Bypass total para SUPER_ADMIN, ADMIN, MASTER (Mandamento 04).
   * STANDARD/FORNECEDOR exigem linha em `UsuarioPermissao` (Mandamento 08 — sem fallback).
   */
  async verificarPermissao(input: VerificarPermissaoInput): Promise<boolean> {
    const { id_organizacao, id_usuario, slug_produto, secao, acao, id_workspace } = input

    const usuario = await prisma.usuario.findFirst({
      where: { id_usuario, id_organizacao },
      select: { tipo_usuario: true },
    })

    if (!usuario) return false

    // 1. Bypass Mandamento 04 (Master/SAdmin/Admin têm acesso global)
    if (temBypassPermissao(usuario)) return true

    // 2. Resolve slug → id_produto_gravity (catálogo)
    const produto = await prisma.produtoGravity.findUnique({
      where: { slug_produto_gravity: slug_produto },
      select: { id_produto_gravity: true },
    })
    if (!produto) return false

    // 3. Verificação granular — Mandamento 08: linha ausente = NEGADO ruidoso, sem fallback
    const permissaoString = buildPermissaoString(slug_produto, secao, acao)
    const linha = await prisma.usuarioPermissao.findFirst({
      where: {
        id_organizacao,
        id_workspace,
        id_usuario,
        id_produto_gravity: produto.id_produto_gravity,
        permissao_usuario: permissaoString,
      },
      select: { id_usuario_permissao: true },
    })

    return !!linha
  },

  /**
   * Verifica se o usuario tem permissao `<slug>:<secao>:<acao>` em PELO MENOS UM
   * workspace da organizacao (sem exigir workspace especifico).
   *
   * Casos de uso: telas cross-workspace por natureza (ex: Historico de auditoria,
   * onde o usuario ve seus eventos em todos os workspaces da org). Mantem a
   * permissao modelada por workspace (consistencia Cadeia 2) mas relaxa a
   * verificacao para evitar fricca o de UX.
   *
   * Bypass total para SUPER_ADMIN, ADMIN, MASTER (Mandamento 04).
   * STANDARD/FORNECEDOR exigem ao menos uma linha em UsuarioPermissao
   * (Mandamento 08 — sem fallback).
   */
  async verificarPermissaoEmAlgumWorkspace(input: Omit<VerificarPermissaoInput, 'id_workspace'>): Promise<boolean> {
    const { id_organizacao, id_usuario, slug_produto, secao, acao } = input

    const usuario = await prisma.usuario.findFirst({
      where: { id_usuario, id_organizacao },
      select: { tipo_usuario: true },
    })

    if (!usuario) return false

    // 1. Bypass Mandamento 04 (Master/SAdmin/Admin tem acesso global)
    if (temBypassPermissao(usuario)) return true

    // 2. Resolve slug -> id_produto_gravity (catalogo)
    const produto = await prisma.produtoGravity.findUnique({
      where: { slug_produto_gravity: slug_produto },
      select: { id_produto_gravity: true },
    })
    if (!produto) return false

    // 3. Verificacao granular cross-workspace — qualquer linha basta
    const permissaoString = buildPermissaoString(slug_produto, secao, acao)
    const linha = await prisma.usuarioPermissao.findFirst({
      where: {
        id_organizacao,
        id_usuario,
        id_produto_gravity: produto.id_produto_gravity,
        permissao_usuario: permissaoString,
      },
      select: { id_usuario_permissao: true },
    })

    return !!linha
  },

  /**
   * Lista todas as permissões granulares de um usuário (DTO PT-BR — Mandamento 03).
   * Retorna apenas linhas físicas de `UsuarioPermissao` — não aplica bypass aqui
   * (o consumidor decide o que fazer com bypass exibindo banner próprio).
   */
  async listarPermissoesUsuario(
    id_organizacao: string,
    id_usuario: string,
    id_workspace?: string,
  ): Promise<PermissaoUsuarioDTO[]> {
    const rows = await prisma.usuarioPermissao.findMany({
      where: {
        id_organizacao,
        id_usuario,
        ...(id_workspace && { id_workspace }),
      },
      select: {
        id_organizacao: true,
        id_workspace: true,
        id_usuario: true,
        id_produto_gravity: true,
        permissao_usuario: true,
        permissao_usuario_concedido_por: true,
        data_criacao_permissao_usuario: true,
      },
    })
    return rows
  },

  /**
   * Substitui (atomicamente) as permissões de um usuário em UM produto/workspace.
   * Valida o formato `<slug>:<secao>:<acao>` antes de qualquer escrita (Mandamento 06).
   * Lança AppError(400) se algum item violar o formato — sem fallback silencioso.
   * Operação idempotente: chamar duas vezes com mesmo input gera o mesmo estado final.
   */
  async configurarPermissoes(args: {
    id_organizacao: string
    id_workspace: string
    id_usuario: string
    id_produto_gravity: string
    /** strings completas no formato <slug>:<secao>:<acao> */
    permissoes: string[]
    /** clerk_id do ator que está concedendo (auditoria) */
    concedido_por_clerk_id: string
  }): Promise<{ total_inseridas: number; total_removidas: number }> {
    const { id_organizacao, id_workspace, id_usuario, id_produto_gravity, permissoes, concedido_por_clerk_id } = args

    // Valida formato de cada string ANTES de tocar no banco (Mandamento 06)
    const parsed = z.array(permissaoStringSchema).safeParse(permissoes)
    if (!parsed.success) {
      throw new AppError(
        `Formato de permissão inválido: ${parsed.error.issues.map(i => i.message).join('; ')}`,
        400,
        'PERMISSION_FORMAT_INVALID',
      )
    }

    // Valida que todos os slugs apontam para o mesmo produto e que o produto existe
    const produto = await prisma.produtoGravity.findUnique({
      where: { id_produto_gravity },
      select: { id_produto_gravity: true, slug_produto_gravity: true },
    })
    if (!produto) {
      throw new AppError('Produto não encontrado no catálogo', 404, 'PRODUCT_NOT_FOUND')
    }

    // Extrai slug aceitando AMBAS as famílias (granular E Portão 3 — acesso ao produto)
    const slugsForaDoProduto = parsed.data.filter(p => extrairSlugDaPermissao(p) !== produto.slug_produto_gravity)
    if (slugsForaDoProduto.length > 0) {
      throw new AppError(
        `Permissões com slug divergente do produto ${produto.slug_produto_gravity}: ${slugsForaDoProduto.join(', ')}`,
        400,
        'PERMISSION_SLUG_MISMATCH',
      )
    }

    const result = await prisma.$transaction(async tx => {
      const removidas = await tx.usuarioPermissao.deleteMany({
        where: {
          id_organizacao,
          id_workspace,
          id_usuario,
          id_produto_gravity,
        },
      })

      if (parsed.data.length === 0) {
        return { total_inseridas: 0, total_removidas: removidas.count }
      }

      const created = await tx.usuarioPermissao.createMany({
        data: parsed.data.map(p => ({
          id_organizacao,
          id_workspace,
          id_usuario,
          id_produto_gravity,
          permissao_usuario: p,
          permissao_usuario_concedido_por: concedido_por_clerk_id,
        })),
        skipDuplicates: true,
      })

      return { total_inseridas: created.count, total_removidas: removidas.count }
    })

    return result
  },
}
