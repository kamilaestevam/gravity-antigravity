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
import { temBypassPermissao } from '../../shared/index.js'

// Re-export do utilitário de bypass para consumidores que já importam tudo daqui.
export { temBypassPermissao }

// ─── Constantes canônicas ────────────────────────────────────────────────────

/** Seções fixas que existem em todo produto Gravity. */
export const SECOES_PRODUTO = ['dashboard', 'kanban', 'lista', 'configuracao', 'relatorios'] as const
export type SecaoProduto = typeof SECOES_PRODUTO[number]

/** Ações fixas para cada (produto, seção). */
export const ACOES_PRODUTO = ['ver', 'editar'] as const
export type AcaoProduto = typeof ACOES_PRODUTO[number]

/**
 * Set hardcoded de produtos cuja UI já tem o sistema de permissões granulares ativo.
 * Produtos no catálogo (`ProdutoGravity`) que NÃO estão neste Set ficam OPACOS no
 * modal de permissões (rótulo "Em breve") até serem migrados.
 *
 * TODO[ARQ]: migrar para coluna `permissoes_granulares_habilitadas Boolean` em
 * `ProdutoGravity` quando houver janela de schema (Mandamento 02 — só Coordenador).
 *
 * IMPORTANTE: o teste-guardião `permissoes-guarda.test.ts` falha em CI se
 * (a) algum slug no Set não tem rotas com `requirePermissao` correspondentes, ou
 * (b) algum produto novo `ATIVO` no catálogo entrar sem decisão explícita aqui.
 * NUNCA pular o teste com `.skip` — é a única defesa contra esquecimento.
 */
export const PRODUTOS_COM_PERMISSOES_IMPLEMENTADAS = new Set<string>([
  'pedido',
])

// ─── Schema Zod (compartilhado back+front via export — Mandamento 09) ────────

/** Regex que valida `<slug>:<secao>:<acao>`. */
const PERMISSAO_REGEX = new RegExp(
  `^[a-z][a-z0-9-]*:(${SECOES_PRODUTO.join('|')}):(${ACOES_PRODUTO.join('|')})$`,
)

export const permissaoStringSchema = z.string().regex(
  PERMISSAO_REGEX,
  'Formato inválido — esperado <slug>:<secao>:<acao>',
)

export const setPermissoesUsuarioInputSchema = z.object({
  id_workspace: z.string().cuid(),
  id_produto_gravity: z.string().cuid(),
  permissoes: z.array(permissaoStringSchema)
    .refine(arr => new Set(arr).size === arr.length, 'Permissões duplicadas não são permitidas'),
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

// ─── Helpers de parsing/build da string canônica ─────────────────────────────

export function buildPermissaoString(
  slug: string,
  secao: SecaoProduto,
  acao: AcaoProduto,
): string {
  return `${slug}:${secao}:${acao}`
}

export function parsePermissaoString(
  permissao: string,
): { slug: string; secao: SecaoProduto; acao: AcaoProduto } | null {
  const match = PERMISSAO_REGEX.exec(permissao)
  if (!match) return null
  const [, secao, acao] = match
  const [slug] = permissao.split(':')
  return { slug, secao: secao as SecaoProduto, acao: acao as AcaoProduto }
}

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

    const slugsForaDoProduto = parsed.data.filter(p => parsePermissaoString(p)?.slug !== produto.slug_produto_gravity)
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
