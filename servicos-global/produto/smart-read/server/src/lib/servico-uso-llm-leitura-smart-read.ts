/**
 * servico-uso-llm-leitura-smart-read.ts — persistência e consulta de tokens LLM
 */

import type { PrismaClient } from '../generated/client/index.js'
import {
  ResumoUsoLlmLeituraSmartReadSchema,
  type AcaoUsoLlmLeituraSmartRead,
  type ResumoUsoLlmLeituraSmartRead,
  type UsoLlmChamadaLeituraSmartRead,
} from '../../../shared/uso-llm-leitura-smart-read.js'

export type ContextoRegistroUsoLlmLeituraSmartRead = {
  prisma: PrismaClient | undefined
  id_organizacao: string
  id_usuario: string | undefined
  id_workspace: string | undefined
  id_leitura_legado: string | undefined
}

export type ParametrosRegistrarUsoLlmLeituraSmartRead = ContextoRegistroUsoLlmLeituraSmartRead & {
  acao: AcaoUsoLlmLeituraSmartRead
  modelo: string
  uso: UsoLlmChamadaLeituraSmartRead
  custo_usd: number
}

const resumoVazio = (): ResumoUsoLlmLeituraSmartRead =>
  ResumoUsoLlmLeituraSmartReadSchema.parse({
    tokens_entrada: 0,
    tokens_saida: 0,
    tokens_total: 0,
    total_chamadas: 0,
    custo_usd: 0,
  })

export async function registrarUsoLlmLeituraSmartRead(
  params: ParametrosRegistrarUsoLlmLeituraSmartRead,
): Promise<void> {
  const { prisma, id_organizacao, id_usuario, uso } = params
  if (!prisma || !id_usuario) return
  if (uso.tokens_total <= 0 && uso.tokens_entrada <= 0 && uso.tokens_saida <= 0) return

  try {
    await prisma.logUsoLlmLeituraSmartRead.create({
      data: {
        id_organizacao,
        id_usuario,
        id_workspace: params.id_workspace ?? null,
        id_leitura_legado_log_uso_llm_leitura_smart_read: params.id_leitura_legado ?? null,
        acao_log_uso_llm_leitura_smart_read: params.acao,
        modelo_log_uso_llm_leitura_smart_read: params.modelo,
        tokens_entrada_log_uso_llm_leitura_smart_read: uso.tokens_entrada,
        tokens_saida_log_uso_llm_leitura_smart_read: uso.tokens_saida,
        tokens_total_log_uso_llm_leitura_smart_read: uso.tokens_total,
        custo_usd_log_uso_llm_leitura_smart_read: params.custo_usd,
      },
    })
  } catch (erro) {
    console.error(
      '[smart-read][uso-llm] falha ao registrar',
      erro instanceof Error ? erro.message : erro,
    )
  }
}

async function agregarLogs(
  prisma: PrismaClient,
  where: {
    id_leitura_legado_log_uso_llm_leitura_smart_read?: string
    id_usuario?: string
    data_criacao_log_uso_llm_leitura_smart_read?: { gte: Date }
  },
): Promise<ResumoUsoLlmLeituraSmartRead> {
  const agregado = await prisma.logUsoLlmLeituraSmartRead.aggregate({
    where,
    _sum: {
      tokens_entrada_log_uso_llm_leitura_smart_read: true,
      tokens_saida_log_uso_llm_leitura_smart_read: true,
      tokens_total_log_uso_llm_leitura_smart_read: true,
      custo_usd_log_uso_llm_leitura_smart_read: true,
    },
    _count: { _all: true },
  })

  const tokens_entrada = agregado._sum.tokens_entrada_log_uso_llm_leitura_smart_read ?? 0
  const tokens_saida = agregado._sum.tokens_saida_log_uso_llm_leitura_smart_read ?? 0
  const tokens_total =
    agregado._sum.tokens_total_log_uso_llm_leitura_smart_read ?? tokens_entrada + tokens_saida

  return ResumoUsoLlmLeituraSmartReadSchema.parse({
    tokens_entrada,
    tokens_saida,
    tokens_total,
    total_chamadas: agregado._count._all,
    custo_usd: agregado._sum.custo_usd_log_uso_llm_leitura_smart_read ?? 0,
  })
}

export async function consultarResumoTokensLeituraSmartRead(
  prisma: PrismaClient | undefined,
  idLeituraLegado: string,
): Promise<ResumoUsoLlmLeituraSmartRead> {
  if (!prisma) return resumoVazio()
  return agregarLogs(prisma, {
    id_leitura_legado_log_uso_llm_leitura_smart_read: idLeituraLegado,
  })
}

export async function consultarResumoTokensUsuarioMesSmartRead(
  prisma: PrismaClient | undefined,
  idUsuario: string,
): Promise<ResumoUsoLlmLeituraSmartRead> {
  if (!prisma) return resumoVazio()
  const inicioMes = new Date()
  inicioMes.setUTCDate(1)
  inicioMes.setUTCHours(0, 0, 0, 0)
  return agregarLogs(prisma, {
    id_usuario: idUsuario,
    data_criacao_log_uso_llm_leitura_smart_read: { gte: inicioMes },
  })
}

export async function consultarResumoTokensOrganizacaoMesSmartRead(
  prisma: PrismaClient | undefined,
): Promise<ResumoUsoLlmLeituraSmartRead> {
  if (!prisma) return resumoVazio()
  const inicioMes = new Date()
  inicioMes.setUTCDate(1)
  inicioMes.setUTCHours(0, 0, 0, 0)
  return agregarLogs(prisma, {
    data_criacao_log_uso_llm_leitura_smart_read: { gte: inicioMes },
  })
}
