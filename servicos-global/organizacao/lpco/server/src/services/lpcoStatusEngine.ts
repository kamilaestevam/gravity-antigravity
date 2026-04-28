/**
 * lpcoStatusEngine.ts — Maquina de estados do LPCO
 *
 * REGRA: Toda transicao de status DEVE passar por este engine.
 * NUNCA fazer update direto no Prisma.
 * Toda transicao gera registro em LpcoHistorico (append-only).
 */

import { PrismaClient } from '@prisma/client'

type LpcoStatus =
  | 'rascunho'
  | 'para_analise'
  | 'em_analise'
  | 'em_exigencia'
  | 'resposta_exigencia'
  | 'deferida'
  | 'indeferida'
  | 'cancelada'

const TRANSICOES_VALIDAS: Record<LpcoStatus, LpcoStatus[]> = {
  rascunho: ['para_analise', 'cancelada'],
  para_analise: ['em_analise', 'cancelada'],
  em_analise: ['deferida', 'em_exigencia', 'indeferida', 'cancelada'],
  em_exigencia: ['resposta_exigencia', 'cancelada'],
  resposta_exigencia: ['em_analise', 'cancelada'],
  deferida: [],
  indeferida: [],
  cancelada: [],
}

export function validarTransicao(statusAtual: LpcoStatus, statusNovo: LpcoStatus): boolean {
  return TRANSICOES_VALIDAS[statusAtual]?.includes(statusNovo) ?? false
}

interface TransicaoParams {
  prisma: PrismaClient
  lpcoId: string
  tenantId: string
  companyId: string
  statusNovo: LpcoStatus
  userId: string
  userNome?: string
  descricao?: string
  dadosExtras?: Record<string, unknown>
}

interface TransicaoResult {
  success: boolean
  statusAnterior: string
  statusNovo: string
}

export class AppError extends Error {
  constructor(
    message: string,
    public statusCode: number = 400,
    public code: string = 'BAD_REQUEST'
  ) {
    super(message)
    this.name = 'AppError'
  }
}

export async function transitarStatus(params: TransicaoParams): Promise<TransicaoResult> {
  const { prisma, lpcoId, tenantId, companyId, statusNovo, userId, userNome, descricao, dadosExtras } = params

  return prisma.$transaction(async (tx) => {
    const lpco = await tx.lpco.findFirst({
      where: { id: lpcoId, id_organizacao: tenantId, company_id: companyId },
      include: { vinculos: { where: { status: 'ativo' } } },
    })

    if (!lpco) {
      throw new AppError('LPCO nao encontrado', 404, 'NOT_FOUND')
    }

    const statusAtual = lpco.status as LpcoStatus

    if (!validarTransicao(statusAtual, statusNovo)) {
      throw new AppError(
        `Transicao invalida: ${statusAtual} → ${statusNovo}`,
        422,
        'INVALID_TRANSITION'
      )
    }

    // Deferida com vinculos ativos NAO pode ser cancelada
    if (statusAtual === 'deferida' && statusNovo === 'cancelada' && lpco.vinculos.length > 0) {
      throw new AppError(
        'LPCO deferida com vinculos ativos nao pode ser cancelada',
        422,
        'HAS_ACTIVE_VINCULOS'
      )
    }

    // Campos adicionais por transicao
    const updateData: Record<string, unknown> = { status: statusNovo, updated_by: userId }

    if (statusNovo === 'para_analise') {
      updateData.data_registro = new Date()
    }
    if (statusNovo === 'deferida') {
      updateData.data_deferimento = new Date()
    }
    if (statusNovo === 'em_exigencia') {
      updateData.data_ultima_exigencia = new Date()
    }

    await tx.lpco.update({
      where: { id: lpcoId },
      data: updateData,
    })

    // Historico append-only
    await tx.lpcoHistorico.create({
      data: {
        id_organizacao: tenantId,
        company_id: companyId,
        product_id: 'lpco',
        user_id: userId,
        lpco_id: lpcoId,
        evento: `transicao_${statusAtual}_${statusNovo}`,
        status_anterior: statusAtual,
        status_novo: statusNovo,
        descricao: descricao ?? `Status alterado de ${statusAtual} para ${statusNovo}`,
        dados_extras: dadosExtras ?? undefined,
        user_nome: userNome ?? null,
      },
    })

    return { success: true, statusAnterior: statusAtual, statusNovo }
  })
}
