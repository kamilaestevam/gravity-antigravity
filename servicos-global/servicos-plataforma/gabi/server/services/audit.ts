// server/services/audit.ts
import prisma from '../lib/prisma.js'
import { AppError } from '../lib/errors.js'

// ---------------------------------------------------------------------------
// Barreira 2 & 5 — Snapshot da Conversa e Identificação de Ator
// ---------------------------------------------------------------------------
export interface LlmUsage {
  modelo: string
  tokensInput: number
  tokensOutput: number
  custoUsd: number
}

export async function auditGabiAction(
  userId: string,
  tenantId: string,
  actionTaken: string,
  conversationSnapshot: string,
  productId?: string,
  llmUsage?: LlmUsage,
) {
  if (!conversationSnapshot) {
    throw new AppError(
      'Obrigatório fornecer conversationSnapshot para auditar ação da Gabi (Barreira 2)',
      400,
      'MISSING_SNAPSHOT',
    )
  }

  // Cria o log com falha intencional se DB expirar, servindo de rollback (Barreira 3)
  const log = await prisma.gabiLogUso.create({
    data: {
      id_organizacao_gabi_log_uso: tenantId,
      id_produto_gabi_log_uso: productId ?? null,
      id_usuario_gabi_log_uso: userId,
      acao_gabi_log_uso: actionTaken,
      snapshot_conversa_gabi_log_uso: conversationSnapshot,
      tipo_ator_gabi_log_uso: 'gabi',
      disparado_por_gabi_log_uso: userId,
      modelo_gabi_log_uso: llmUsage?.modelo ?? null,
      tokens_input_gabi_log_uso: llmUsage?.tokensInput ?? 0,
      tokens_output_gabi_log_uso: llmUsage?.tokensOutput ?? 0,
      custo_usd_gabi_log_uso: llmUsage?.custoUsd ?? 0,
    },
  })

  return log
}
