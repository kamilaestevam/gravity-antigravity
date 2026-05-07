// server/services/negociacao-especial-servico.ts
// CRUD de ProdutoGravityNegociacaoEspecial — exclusivo para gravity_admin.
//
// Mandamentos:
//   01 — autorização externa (rota faz requireGravityAdmin); este service confia
//   02 — não toca em schema.prisma
//   03 — DDD-PT estrito: campos espelham @@map("negociacao_especial")
//   06 — quem chama valida com Zod antes (CreateNegociacaoEspecialSchema, etc.)

import { prisma } from '../lib/prisma.js'
import { AppError } from '../lib/appError.js'

export interface CriarNegociacaoEspecialParams {
  id_produto_gravity: string
  id_organizacao: string
  nome_organizacao_negociacao_especial: string
  acordo_negociacao_especial: string
  valor_unitario_negociacao_especial?: number | null
  moeda_negociacao_especial?: string
  data_inicio_negociacao_especial?: Date | null
  data_fim_negociacao_especial?: Date | null
  ilimitado_prazo_negociacao_especial?: boolean
}

export interface AtualizarNegociacaoEspecialParams {
  id_negociacao_especial: string
  acordo_negociacao_especial?: string
  valor_unitario_negociacao_especial?: number | null
  moeda_negociacao_especial?: string
  data_inicio_negociacao_especial?: Date | null
  data_fim_negociacao_especial?: Date | null
  ilimitado_prazo_negociacao_especial?: boolean
}

export const negociacaoEspecialServico = {
  /**
   * Lista todas as negociações especiais de UM produto (admin only — todas as orgs).
   */
  async listarNegociacoesEspeciaisPorProduto(id_produto_gravity: string) {
    const rows = await prisma.produtoGravityNegociacaoEspecial.findMany({
      where: { id_produto_gravity },
      orderBy: { data_criacao_negociacao_especial: 'desc' },
    })
    return rows
  },

  async criarNegociacaoEspecial(params: CriarNegociacaoEspecialParams) {
    // Valida que o produto existe (FK lógica)
    const produto = await prisma.produtoGravity.findUnique({
      where: { id_produto_gravity: params.id_produto_gravity },
      select: { id_produto_gravity: true },
    })
    if (!produto) {
      throw new AppError('Produto não encontrado', 404, 'NOT_FOUND')
    }

    // Bloqueia duplicidade: 1 negociação ATIVA por (produto, organizacao)
    const ja_existe = await prisma.produtoGravityNegociacaoEspecial.findFirst({
      where: {
        id_produto_gravity: params.id_produto_gravity,
        id_organizacao: params.id_organizacao,
      },
      select: { id_negociacao_especial: true },
    })
    if (ja_existe) {
      throw new AppError(
        `Já existe uma negociação para essa organização neste produto (id=${ja_existe.id_negociacao_especial}). Edite-a em vez de criar nova.`,
        409,
        'ALREADY_EXISTS',
      )
    }

    return prisma.produtoGravityNegociacaoEspecial.create({
      data: {
        id_produto_gravity:                   params.id_produto_gravity,
        id_organizacao:                       params.id_organizacao,
        nome_organizacao_negociacao_especial: params.nome_organizacao_negociacao_especial,
        acordo_negociacao_especial:           params.acordo_negociacao_especial,
        valor_unitario_negociacao_especial:   params.valor_unitario_negociacao_especial ?? null,
        moeda_negociacao_especial:            params.moeda_negociacao_especial ?? 'BRL',
        data_inicio_negociacao_especial:      params.data_inicio_negociacao_especial ?? null,
        data_fim_negociacao_especial:         params.data_fim_negociacao_especial ?? null,
        ilimitado_prazo_negociacao_especial:  params.ilimitado_prazo_negociacao_especial ?? false,
      },
    })
  },

  async atualizarNegociacaoEspecial(params: AtualizarNegociacaoEspecialParams) {
    const existente = await prisma.produtoGravityNegociacaoEspecial.findUnique({
      where: { id_negociacao_especial: params.id_negociacao_especial },
      select: { id_negociacao_especial: true },
    })
    if (!existente) {
      throw new AppError('Negociação especial não encontrada', 404, 'NOT_FOUND')
    }

    const data: Record<string, unknown> = {}
    if (params.acordo_negociacao_especial !== undefined)         data.acordo_negociacao_especial = params.acordo_negociacao_especial
    if (params.valor_unitario_negociacao_especial !== undefined) data.valor_unitario_negociacao_especial = params.valor_unitario_negociacao_especial
    if (params.moeda_negociacao_especial !== undefined)          data.moeda_negociacao_especial = params.moeda_negociacao_especial
    if (params.data_inicio_negociacao_especial !== undefined)    data.data_inicio_negociacao_especial = params.data_inicio_negociacao_especial
    if (params.data_fim_negociacao_especial !== undefined)       data.data_fim_negociacao_especial = params.data_fim_negociacao_especial
    if (params.ilimitado_prazo_negociacao_especial !== undefined) data.ilimitado_prazo_negociacao_especial = params.ilimitado_prazo_negociacao_especial

    return prisma.produtoGravityNegociacaoEspecial.update({
      where: { id_negociacao_especial: params.id_negociacao_especial },
      data,
    })
  },

  async excluirNegociacaoEspecial(id_negociacao_especial: string) {
    const existente = await prisma.produtoGravityNegociacaoEspecial.findUnique({
      where: { id_negociacao_especial },
      select: { id_negociacao_especial: true },
    })
    if (!existente) {
      throw new AppError('Negociação especial não encontrada', 404, 'NOT_FOUND')
    }
    return prisma.produtoGravityNegociacaoEspecial.delete({
      where: { id_negociacao_especial },
    })
  },
}
