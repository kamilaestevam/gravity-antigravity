import { randomUUID } from 'node:crypto'
import type { PrismaClient } from '@prisma/client'
import { AppError } from './errors.js'

// ---------------------------------------------------------------------------
// Tipos
// ---------------------------------------------------------------------------

interface ShareInput {
  tenantId: string
  userId: string
  dashboardId: string
  channel: 'link' | 'email' | 'whatsapp'
  recipientEmail?: string
  recipientPhone?: string
  expiresInHours?: number
  snapshotData?: Record<string, unknown>
}

interface ShareResult {
  shareToken: string
  shareUrl: string
  channel: string
  expiresAt: Date | null
}

// ---------------------------------------------------------------------------
// URLs dos serviços externos (contracts.json)
// ---------------------------------------------------------------------------

const EMAIL_URL = 'http://localhost:8022/api/v1/envios-email'
const WHATSAPP_URL = 'http://localhost:3001/api/v1/whatsapp/enviar'

// ---------------------------------------------------------------------------
// Helpers de notificação (fire-and-forget — não bloqueiam o retorno)
// ---------------------------------------------------------------------------

function sendEmailAsync(
  recipientEmail: string,
  shareUrl: string,
  tenantId: string
): void {
  const internalKey = process.env.INTERNAL_SERVICE_KEY

  fetch(EMAIL_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-internal-key': internalKey ?? '',
      'x-tenant-id': tenantId,
    },
    body: JSON.stringify({
      to: recipientEmail,
      subject: 'Dashboard compartilhado com você',
      body: `Você recebeu acesso a um dashboard. Acesse pelo link: ${shareUrl}`,
      metadata: { share_url: shareUrl },
    }),
  }).catch((err: unknown) => {
    const message = err instanceof Error ? err.message : String(err)
    console.error(`[SHARING_ENGINE] Falha ao enviar email para ${recipientEmail}: ${message}`)
  })
}

function sendWhatsAppAsync(
  recipientPhone: string,
  shareUrl: string,
  tenantId: string
): void {
  const internalKey = process.env.INTERNAL_SERVICE_KEY

  fetch(WHATSAPP_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-internal-key': internalKey ?? '',
      'x-tenant-id': tenantId,
    },
    body: JSON.stringify({
      phone: recipientPhone,
      message: `Você recebeu acesso a um dashboard. Acesse pelo link: ${shareUrl}`,
      metadata: { share_url: shareUrl },
    }),
  }).catch((err: unknown) => {
    const message = err instanceof Error ? err.message : String(err)
    console.error(`[SHARING_ENGINE] Falha ao enviar WhatsApp para ${recipientPhone}: ${message}`)
  })
}

// ---------------------------------------------------------------------------
// Helpers de token e URL
// ---------------------------------------------------------------------------

function buildShareUrl(token: string): string {
  const appUrl = process.env.APP_URL ?? 'http://localhost:3000'
  return `${appUrl}/dashboard/share/${token}`
}

function computeExpiresAt(expiresInHours: number | undefined): Date | null {
  if (!expiresInHours) return null
  return new Date(Date.now() + expiresInHours * 60 * 60 * 1000)
}

// ---------------------------------------------------------------------------
// SharingEngine
// ---------------------------------------------------------------------------

export class SharingEngine {
  /**
   * Cria um compartilhamento de dashboard.
   *
   * - Sempre gera um registro DashboardCompartilhar no banco.
   * - Para 'email': envia e-mail com o link (fire-and-forget).
   * - Para 'whatsapp': envia mensagem WhatsApp (fire-and-forget).
   * - Para 'link': apenas retorna a URL pública.
   */
  async createShare(
    prisma: PrismaClient,
    input: ShareInput
  ): Promise<ShareResult> {
    const {
      tenantId,
      userId,
      dashboardId,
      channel,
      recipientEmail,
      recipientPhone,
      expiresInHours,
      snapshotData,
    } = input

    if (channel === 'email' && !recipientEmail) {
      throw new AppError(
        'recipientEmail é obrigatório para compartilhamento por email',
        400,
        'MISSING_RECIPIENT_EMAIL'
      )
    }

    if (channel === 'whatsapp' && !recipientPhone) {
      throw new AppError(
        'recipientPhone é obrigatório para compartilhamento por WhatsApp',
        400,
        'MISSING_RECIPIENT_PHONE'
      )
    }

    const shareToken = randomUUID()
    const expiresAt = computeExpiresAt(expiresInHours)
    const shareUrl = buildShareUrl(shareToken)

    await prisma.dashboardCompartilhar.create({
      data: {
        tenant_id: tenantId,
        user_id: userId,
        dashboard_id: dashboardId,
        share_token: shareToken,
        channel,
        recipient_email: recipientEmail ?? null,
        recipient_phone: recipientPhone ?? null,
        snapshot_data: snapshotData ?? null,
        expires_at: expiresAt,
      },
    })

    // Envios assíncronos — não aguardam, não bloqueiam o retorno
    if (channel === 'email' && recipientEmail) {
      sendEmailAsync(recipientEmail, shareUrl, tenantId)
    }

    if (channel === 'whatsapp' && recipientPhone) {
      sendWhatsAppAsync(recipientPhone, shareUrl, tenantId)
    }

    return {
      shareToken,
      shareUrl,
      channel,
      expiresAt,
    }
  }

  /**
   * Revoga um compartilhamento existente, garantindo que pertence ao tenant.
   */
  async revokeShare(
    prisma: PrismaClient,
    tenantId: string,
    shareToken: string
  ): Promise<void> {
    const share = await prisma.dashboardCompartilhar.findFirst({
      where: { share_token: shareToken, tenant_id: tenantId },
      select: { id: true },
    })

    if (!share) {
      throw new AppError('Compartilhamento não encontrado', 404, 'NOT_FOUND')
    }

    await prisma.dashboardCompartilhar.delete({
      where: { id: share.id },
    })
  }

  /**
   * Retorna os dados de um dashboard compartilhado a partir do token.
   * Valida expiração antes de retornar.
   * Não exige tenant_id — é rota pública acessada pelo token.
   */
  async getSharedDashboard(
    prisma: PrismaClient,
    shareToken: string
  ): Promise<{ config: unknown; data: unknown } | null> {
    const share = await prisma.dashboardCompartilhar.findUnique({
      where: { share_token: shareToken },
      include: {
        dashboard: {
          select: {
            id: true,
            name: true,
            mode: true,
            layout: true,
            filters: true,
          },
        },
      },
    })

    if (!share) return null

    if (share.expires_at && share.expires_at < new Date()) {
      // Token expirado — não retorna dados
      return null
    }

    return {
      config: share.dashboard,
      data: share.snapshot_data ?? null,
    }
  }
}

export const sharingEngine = new SharingEngine()
