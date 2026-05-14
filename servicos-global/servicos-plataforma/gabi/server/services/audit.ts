// server/services/audit.ts
import prisma from '../lib/prisma.js'
import { AppError } from '../lib/errors.js'
import type { KbSearchMeta } from './kb-search.js'

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
  ragMeta?: KbSearchMeta,
) {
  if (!conversationSnapshot) {
    throw new AppError(
      'Obrigatório fornecer conversationSnapshot para auditar ação da Gabi (Barreira 2)',
      400,
      'MISSING_SNAPSHOT',
    )
  }

  const snapshotComRag = ragMeta
    ? `${conversationSnapshot}\n\n[RAG] chunks=${ragMeta.chunks_retornados} score_medio=${ragMeta.score_similaridade_medio} busca_ms=${ragMeta.tempo_busca_ms} tokens_chunks=${ragMeta.tokens_total_chunks}`
    : conversationSnapshot

  const log = await prisma.gabiLogUso.create({
    data: {
      id_organizacao_gabi_log_uso: tenantId,
      id_produto_gabi_log_uso: productId ?? null,
      id_usuario_gabi_log_uso: userId,
      acao_gabi_log_uso: actionTaken,
      snapshot_conversa_gabi_log_uso: snapshotComRag,
      tipo_ator_gabi_log_uso: 'gabi',
      disparado_por_gabi_log_uso: userId,
      modelo_gabi_log_uso: llmUsage?.modelo ?? null,
      tokens_input_gabi_log_uso: llmUsage?.tokensInput ?? 0,
      tokens_output_gabi_log_uso: llmUsage?.tokensOutput ?? 0,
      custo_usd_gabi_log_uso: llmUsage?.custoUsd ?? 0,
    },
  })

  if (ragMeta) {
    console.log(`[GABI/RAG] chunks=${ragMeta.chunks_retornados} score=${ragMeta.score_similaridade_medio} busca=${ragMeta.tempo_busca_ms}ms tokens_kb=${ragMeta.tokens_total_chunks}`)
  }

  return log
}
