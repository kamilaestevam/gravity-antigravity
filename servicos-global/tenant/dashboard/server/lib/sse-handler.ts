import type { Response } from 'express'

// ---------------------------------------------------------------------------
// Tipos
// ---------------------------------------------------------------------------

interface SSEClient {
  tenantId: string
  userId: string
  dashboardId: string
  res: Response
  connectedAt: Date
}

interface SSEEvent {
  type: 'widget_update' | 'alert_triggered' | 'share_created' | 'heartbeat'
  dashboardId?: string
  widgetId?: string
  data?: unknown
}

// ---------------------------------------------------------------------------
// DashboardSSEHandler
// ---------------------------------------------------------------------------

export class DashboardSSEHandler {
  private clients = new Map<string, SSEClient>()
  private heartbeatInterval: NodeJS.Timeout | null = null

  /**
   * Registra um novo cliente SSE.
   * Configura os headers obrigatórios de SSE, envia um heartbeat inicial
   * e inicia o intervalo de heartbeat se ainda não estiver rodando.
   */
  addClient(
    clientId: string,
    tenantId: string,
    userId: string,
    dashboardId: string,
    res: Response
  ): void {
    res.setHeader('Content-Type', 'text/event-stream')
    res.setHeader('Cache-Control', 'no-cache')
    res.setHeader('Connection', 'keep-alive')
    res.setHeader('X-Accel-Buffering', 'no') // desabilita buffer no nginx
    res.flushHeaders()

    const client: SSEClient = {
      tenantId,
      userId,
      dashboardId,
      res,
      connectedAt: new Date(),
    }

    this.clients.set(clientId, client)

    // Heartbeat inicial para confirmar conexão
    this.writeEvent(res, { type: 'heartbeat' })

    if (this.heartbeatInterval === null) {
      this.startHeartbeat()
    }
  }

  /**
   * Remove o cliente quando a conexão fechar.
   * Para o heartbeat se não restar nenhum cliente.
   */
  removeClient(clientId: string): void {
    this.clients.delete(clientId)

    if (this.clients.size === 0) {
      this.stopHeartbeat()
    }
  }

  /**
   * Envia um evento para todos os clientes de um dashboard específico
   * dentro de um tenant.
   */
  sendToDashboard(tenantId: string, dashboardId: string, event: SSEEvent): void {
    for (const client of this.clients.values()) {
      if (client.tenantId === tenantId && client.dashboardId === dashboardId) {
        this.writeEvent(client.res, event)
      }
    }
  }

  /**
   * Envia um evento para todos os clientes de um tenant,
   * independente do dashboard.
   */
  sendToTenant(tenantId: string, event: SSEEvent): void {
    for (const client of this.clients.values()) {
      if (client.tenantId === tenantId) {
        this.writeEvent(client.res, event)
      }
    }
  }

  /** Inicia o heartbeat a cada 30 segundos para manter conexões vivas. */
  private startHeartbeat(): void {
    this.heartbeatInterval = setInterval(() => {
      const event: SSEEvent = { type: 'heartbeat' }
      for (const client of this.clients.values()) {
        this.writeEvent(client.res, event)
      }
    }, 30_000)
  }

  private stopHeartbeat(): void {
    if (this.heartbeatInterval !== null) {
      clearInterval(this.heartbeatInterval)
      this.heartbeatInterval = null
    }
  }

  /** Escreve um evento SSE no formato padrão `data: ...\n\n`. */
  private writeEvent(res: Response, event: SSEEvent): void {
    try {
      res.write(`data: ${JSON.stringify(event)}\n\n`)
    } catch (err) {
      // Conexão pode ter sido fechada pelo cliente antes do removeClient
      const message = err instanceof Error ? err.message : String(err)
      console.error(`[SSE_HANDLER] Falha ao escrever evento: ${message}`)
    }
  }

  /** Para o heartbeat e libera recursos. Deve ser chamado ao encerrar o servidor. */
  destroy(): void {
    this.stopHeartbeat()
    this.clients.clear()
  }
}

export const sseHandler = new DashboardSSEHandler()
