/**
 * nfStatusEngine.ts — Maquina de estados da NF Importacao
 *
 * REGRA: Toda transicao de status DEVE passar por este engine.
 * NUNCA fazer update direto no Prisma.
 * Toda transicao gera registro em NFImportacaoHistorico (append-only).
 *
 * Estados: rascunho, em_composicao, pronta, exportada, cancelada
 * Transicoes:
 *   rascunho -> em_composicao (primeira despesa adicionada)
 *   rascunho -> cancelada
 *   em_composicao -> pronta (rateio calculado + fiscal preenchido)
 *   em_composicao -> cancelada
 *   pronta -> exportada (arquivo gerado)
 *   pronta -> cancelada
 *   exportada -> (somente duplicar, criando novo rascunho)
 */

import { PrismaClient } from '@prisma/client'

type TxClient = Omit<PrismaClient, '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'>

export type NfStatus =
  | 'rascunho'
  | 'em_composicao'
  | 'pronta'
  | 'exportada'
  | 'cancelada'

const TRANSICOES_VALIDAS: Record<NfStatus, NfStatus[]> = {
  rascunho: ['em_composicao', 'cancelada'],
  em_composicao: ['pronta', 'cancelada'],
  pronta: ['exportada', 'cancelada'],
  exportada: [],
  cancelada: [],
}

export function validarTransicao(statusAtual: NfStatus, statusNovo: NfStatus): boolean {
  return TRANSICOES_VALIDAS[statusAtual]?.includes(statusNovo) ?? false
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

interface TransicaoParams {
  prisma: PrismaClient
  nfId: string
  tenantId: string
  companyId: string
  statusNovo: NfStatus
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

interface ValidacaoProntaParams {
  nfId: string
  tenantId: string
  tx: TxClient
}

/**
 * Valida se a NF pode transitar para 'pronta':
 * - Deve ter rateio calculado para todas as despesas
 * - Deve ter dados fiscais preenchidos
 */
async function validarTransicaoParaPronta(params: ValidacaoProntaParams): Promise<void> {
  const { nfId, tenantId, tx } = params

  // Verificar se existem despesas
  const despesas = await (tx as Record<string, unknown> & { nFImportacaoDespesas: { findMany: (args: Record<string, unknown>) => Promise<Array<{ id: string }>> } }).nFImportacaoDespesas.findMany({
    where: { nf_importacao_id: nfId, id_organizacao: tenantId },
    select: { id: true },
  })

  if (despesas.length === 0) {
    throw new AppError(
      'NF deve ter ao menos uma despesa para ficar pronta',
      422,
      'NO_DESPESAS'
    )
  }

  // Verificar se todas as despesas possuem rateios
  for (const despesa of despesas) {
    const rateioCount = await (tx as Record<string, unknown> & { nFImportacaoRateio: { count: (args: Record<string, unknown>) => Promise<number> } }).nFImportacaoRateio.count({
      where: { nf_despesa_id: despesa.id, id_organizacao: tenantId },
    })

    if (rateioCount === 0) {
      throw new AppError(
        `Despesa ${despesa.id} nao possui rateio calculado`,
        422,
        'MISSING_RATEIO'
      )
    }
  }

  // Verificar se existem itens
  const itemCount = await (tx as Record<string, unknown> & { nFImportacaoItens: { count: (args: Record<string, unknown>) => Promise<number> } }).nFImportacaoItens.count({
    where: { nf_importacao_id: nfId, id_organizacao: tenantId },
  })

  if (itemCount === 0) {
    throw new AppError(
      'NF deve ter ao menos um item para ficar pronta',
      422,
      'NO_ITEMS'
    )
  }
}

export async function transitarStatus(params: TransicaoParams): Promise<TransicaoResult> {
  const { prisma, nfId, tenantId, companyId, statusNovo, userId, userNome, descricao, dadosExtras } = params

  return prisma.$transaction(async (tx: TxClient) => {
    const nf = await (tx as Record<string, unknown> & { nFImportacao: { findFirst: (args: Record<string, unknown>) => Promise<{ id: string; status: string } | null> } }).nFImportacao.findFirst({
      where: { id: nfId, id_organizacao: tenantId, company_id: companyId },
    })

    if (!nf) {
      throw new AppError('NF Importacao nao encontrada', 404, 'NOT_FOUND')
    }

    const statusAtual = nf.status as NfStatus

    if (!validarTransicao(statusAtual, statusNovo)) {
      throw new AppError(
        `Transicao invalida: ${statusAtual} → ${statusNovo}`,
        422,
        'INVALID_TRANSITION'
      )
    }

    // Validacoes especificas por transicao
    if (statusNovo === 'pronta') {
      await validarTransicaoParaPronta({ nfId, tenantId, tx: tx as TxClient })
    }

    // Campos adicionais por transicao
    const updateData: Record<string, unknown> = { status: statusNovo, updated_by: userId }

    if (statusNovo === 'em_composicao') {
      updateData.data_inicio_composicao = new Date()
    }
    if (statusNovo === 'pronta') {
      updateData.data_pronta = new Date()
    }
    if (statusNovo === 'exportada') {
      updateData.data_exportacao = new Date()
    }
    if (statusNovo === 'cancelada') {
      updateData.data_cancelamento = new Date()
    }

    await (tx as Record<string, unknown> & { nFImportacao: { update: (args: Record<string, unknown>) => Promise<unknown> } }).nFImportacao.update({
      where: { id: nfId },
      data: updateData,
    })

    // Historico append-only
    await (tx as Record<string, unknown> & { nFImportacaoHistorico: { create: (args: Record<string, unknown>) => Promise<unknown> } }).nFImportacaoHistorico.create({
      data: {
        id_organizacao: tenantId,
        company_id: companyId,
        product_id: 'nf-importacao',
        user_id: userId,
        nf_importacao_id: nfId,
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
