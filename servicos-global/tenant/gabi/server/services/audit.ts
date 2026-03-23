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
  productId?: string
) {
  if (!conversationSnapshot) {
    throw new AppError(
      'Obrigatório fornecer conversationSnapshot para auditar ação da Gabi (Barreira 2)',
      400,
      'MISSING_SNAPSHOT'
    )
  }

  // Cria o log com falha intencional se DB expirar, servindo de rollback (Barreira 3)
  const log = await prisma.gabiUsageLog.create({
    data: {
      tenant_id: tenantId,
      product_id: productId,
      user_id: userId,
      action_taken: actionTaken,
      conversation_snapshot: conversationSnapshot,
      actor_type: 'gabi', // Barreira 5: Ator identificado como gabi
      triggered_by: userId
    }
  })

  return log
}
