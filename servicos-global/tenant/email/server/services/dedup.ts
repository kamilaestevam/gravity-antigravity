// server/services/dedup.ts
// Deduplicação de emails em 3 camadas:
//  1) Resend ID — bloqueia IDs já processados
//  2) Timestamp — ignora mesmo remetente/conteúdo em < 5s
//  3) Hash semântico — evita conteúdos idênticos por conteúdo

import { createHash } from 'crypto'
import { prisma } from '../lib/prisma.js'

const DEDUP_WINDOW_MS = 5_000 // 5 segundos

/**
 * Verifica se um resend_id já foi processado.
 * Retorna true se for duplicata.
 */
export async function isDuplicateResendId(resendId: string): Promise<boolean> {
  const existing = await prisma.emailMensagem.findUnique({
    where: { id_resend_email_mensagem: resendId },
    select: { id_email_mensagem: true },
  })
  return existing !== null
}

/**
 * Verifica se uma mensagem com mesmo remetente + hash de conteúdo
 * chegou nos últimos 5 segundos (camadas 2 e 3).
 */
export async function isDuplicateContent(
  tenantId: string,
  from: string,
  body: string
): Promise<boolean> {
  const contentHash = hashContent(from, body)
  const windowStart = new Date(Date.now() - DEDUP_WINDOW_MS)

  // Camada 2 — mesmo remetente em janela de 5s
  const recentSameFrom = await prisma.emailMensagem.findFirst({
    where: {
      id_organizacao_email_mensagem: tenantId,
      remetente_email_mensagem: from,
      direcao_email_mensagem: 'RECEBIDO',
      data_envio_email_mensagem: { gte: windowStart },
    },
    select: { id_email_mensagem: true, corpo_email_mensagem: true },
  })

  if (!recentSameFrom) return false

  // Camada 3 — hash de conteúdo idêntico
  const existingHash = hashContent(from, recentSameFrom.corpo_email_mensagem)
  return existingHash === contentHash
}

/**
 * Gera hash SHA-256 para comparação semântica de conteúdo.
 * Normaliza espaços e casing antes de hashear.
 */
function hashContent(from: string, body: string): string {
  const normalized = `${from.toLowerCase().trim()}:${body.trim().replace(/\s+/g, ' ')}`
  return createHash('sha256').update(normalized).digest('hex')
}
