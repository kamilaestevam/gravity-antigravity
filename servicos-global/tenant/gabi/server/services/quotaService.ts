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

  const quota = await prisma.gabiaTokenWorkspace.upsert({
    where: { tenant_id_product_id_mes_ref: { tenant_id: tenantId, product_id: productId, mes_ref } },
    create: { tenant_id: tenantId, product_id: productId, quota_mensal: quotaMensal, mes_ref, tokens_usados: 0 },
    update: {},  // não atualiza se já existe — preserva uso acumulado
  })

  const percentual = quota.quota_mensal > 0
    ? Math.round((quota.tokens_usados / quota.quota_mensal) * 100)
    : 100

  return {
    tokens_usados: quota.tokens_usados,
    quota_mensal: quota.quota_mensal,
    esgotado: quota.tokens_usados >= quota.quota_mensal && quota.quota_mensal > 0,
    percentual,
    mes_ref,
  }
}

/**
 * Registra tokens consumidos numa chamada field-help.
 * Atualiza GabiaTokenWorkspace.tokens_usados de forma atômica.
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
  await prisma.gabiaTokenConsumidos.create({
    data: {
      tenant_id: tenantId,
      product_id: productId,
      user_id: userId,
      campo,
      tokens_input: tokensInput,
      tokens_output: tokensOutput,
      tokens_total,
      mes_ref,
    },
  })

  // Incrementa contador na quota (upsert garante que o registro exista)
  await prisma.gabiaTokenWorkspace.upsert({
    where: { tenant_id_product_id_mes_ref: { tenant_id: tenantId, product_id: productId, mes_ref } },
    create: {
      tenant_id: tenantId,
      product_id: productId,
      quota_mensal: quotaMensal,
      mes_ref,
      tokens_usados: tokens_total,
    },
    update: {
      tokens_usados: { increment: tokens_total },
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
  const result = await prisma.gabiaTokenWorkspace.updateMany({
    where: { mes_ref: mesRef },
    data: { tokens_usados: 0 },
  })
  return result.count
}
