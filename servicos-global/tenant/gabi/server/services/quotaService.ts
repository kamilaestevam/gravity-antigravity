// server/services/quotaService.ts
// Gerencia quota de tokens GABI on-demand por tenant/produto/mês
// Regras: reset dia 1 de cada mês, sem rollover, atomicidade via upsert

import prisma from '../lib/prisma.js'

/** Formato "YYYY-MM" para agrupamento mensal */
function mesAtual(): string {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
}

export interface QuotaStatus {
  tokens_usados: number
  quota_mensal: number
  esgotado: boolean
  percentual: number  // 0–100
  mes_ref: string
}

/**
 * Retorna o status da quota do tenant para o mês atual.
 * Se não houver registro, cria com quota_mensal passada.
 */
export async function checkQuota(
  tenantId: string,
  productId: string,
  quotaMensal: number,
): Promise<QuotaStatus> {
  const mes_ref = mesAtual()

  const quota = await prisma.gabiTokenWorkspace.upsert({
    where: {
      id_organizacao_gabi_token_workspace_id_produto_gabi_token_workspace_mes_ref_gabi_token_workspace: {
        id_organizacao_gabi_token_workspace: tenantId,
        id_produto_gabi_token_workspace: productId,
        mes_ref_gabi_token_workspace: mes_ref,
      },
    },
    create: {
      id_organizacao_gabi_token_workspace: tenantId,
      id_produto_gabi_token_workspace: productId,
      quota_mensal_gabi_token_workspace: quotaMensal,
      mes_ref_gabi_token_workspace: mes_ref,
      tokens_usados_gabi_token_workspace: 0,
    },
    update: {},  // não atualiza se já existe — preserva uso acumulado
  })

  const quotaTotal = quota.quota_mensal_gabi_token_workspace
  const usados = quota.tokens_usados_gabi_token_workspace
  const percentual = quotaTotal > 0 ? Math.round((usados / quotaTotal) * 100) : 100

  return {
    tokens_usados: usados,
    quota_mensal: quotaTotal,
    esgotado: usados >= quotaTotal && quotaTotal > 0,
    percentual,
    mes_ref,
  }
}

/**
 * Registra tokens consumidos numa chamada field-help.
 * Atualiza GabiTokenWorkspace.tokens_usados de forma atômica.
 */
export async function registerTokens(params: {
  tenantId: string
  productId: string
  userId: string
  campo: string
  tokensInput: number
  tokensOutput: number
  quotaMensal: number
}): Promise<void> {
  const { tenantId, productId, userId, campo, tokensInput, tokensOutput, quotaMensal } = params
  const mes_ref = mesAtual()
  const tokens_total = tokensInput + tokensOutput

  // Registra log individual
  await prisma.gabiTokenConsumido.create({
    data: {
      id_organizacao_gabi_token_consumido: tenantId,
      id_produto_gabi_token_consumido: productId,
      id_usuario_gabi_token_consumido: userId,
      campo_gabi_token_consumido: campo,
      tokens_input_gabi_token_consumido: tokensInput,
      tokens_output_gabi_token_consumido: tokensOutput,
      tokens_total_gabi_token_consumido: tokens_total,
      mes_ref_gabi_token_consumido: mes_ref,
    },
  })

  // Incrementa contador na quota (upsert garante que o registro exista)
  await prisma.gabiTokenWorkspace.upsert({
    where: {
      id_organizacao_gabi_token_workspace_id_produto_gabi_token_workspace_mes_ref_gabi_token_workspace: {
        id_organizacao_gabi_token_workspace: tenantId,
        id_produto_gabi_token_workspace: productId,
        mes_ref_gabi_token_workspace: mes_ref,
      },
    },
    create: {
      id_organizacao_gabi_token_workspace: tenantId,
      id_produto_gabi_token_workspace: productId,
      quota_mensal_gabi_token_workspace: quotaMensal,
      mes_ref_gabi_token_workspace: mes_ref,
      tokens_usados_gabi_token_workspace: tokens_total,
    },
    update: {
      tokens_usados_gabi_token_workspace: { increment: tokens_total },
    },
  })
}

/**
 * Retorna info completa de quota para exibir no badge/popover do cliente.
 */
export async function getQuotaInfo(
  tenantId: string,
  productId: string,
  quotaMensal: number,
): Promise<QuotaStatus> {
  return checkQuota(tenantId, productId, quotaMensal)
}

/**
 * Reset de quota: usado pelo token-reset-worker no dia 1 de cada mês.
 * Zera tokens_usados para todos os registros do mês anterior.
 */
export async function resetQuotaMensal(mesRef: string): Promise<number> {
  const result = await prisma.gabiTokenWorkspace.updateMany({
    where: { mes_ref_gabi_token_workspace: mesRef },
    data: { tokens_usados_gabi_token_workspace: 0 },
  })
  return result.count
}
