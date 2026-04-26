// server/services/audit.ts
import prisma from '../lib/prisma.js'
import { AppError } from '../lib/errors.js'

// ---------------------------------------------------------------------------
// Barreira 2 & 5 — Snapshot da Conversa e Identificação de Ator
// ---------------------------------------------------------------------------
export async function auditGabiAction(
  userId: string,
  tenantId: string,
  actionTaken: string,
  conversationSnapshot: string,
  productId?: string,
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
      tipo_ator_gabi_log_uso: 'gabi', // Barreira 5: Ator identificado como gabi
      disparado_por_gabi_log_uso: userId,
    },
  })

  return log
}
