// server/lib/sse.ts
// Server-Sent Events helper para o serviço de Cronômetro.
// Permite que o frontend receba atualizações em tempo real do timer ativo.

import { Request, Response } from 'express'

// ---------------------------------------------------------------------------
// Tipos
// ---------------------------------------------------------------------------

export type SSEMessage<T = unknown> = {
  event: string
  data: T
  id?: string
}

// ---------------------------------------------------------------------------
// SSEManager
// Gerencia conexões SSE ativas por tenant + usuario.
// ---------------------------------------------------------------------------

class SSEManager {
  // Map de "tenantId:userId" → lista de Response objects (conexões abertas)
  private connections = new Map<string, Set<Response>>()

  // Chave composta para identificar uma conexão
  private key(tenantId: string, userId: string): string {
    return `${tenantId}:${userId}`
  }

  // Registra uma nova conexão SSE
  register(tenantId: string, userId: string, res: Response): void {
    const key = this.key(tenantId, userId)
    if (!this.connections.has(key)) {
      this.connections.set(key, new Set())
    }
    this.connections.get(key)!.add(res)
  }

  // Remove uma conexão ao fechar
  remove(tenantId: string, userId: string, res: Response): void {
    const key = this.key(tenantId, userId)
    const set = this.connections.get(key)
    if (set) {
      set.delete(res)
      if (set.size === 0) this.connections.delete(key)
    }
  }

  // Envia um evento para todas as conexões de um usuário
  send<T>(tenantId: string, userId: string, message: SSEMessage<T>): void {
    const key = this.key(tenantId, userId)
    const set = this.connections.get(key)
    if (!set) return

    const payload = this.format(message)
    for (const res of set) {
      try {
        res.write(payload)
      } catch {
        // Conexão fechada — remover na próxima oportunidade
        set.delete(res)
      }
    }
  }

  // Formata a mensagem no protocolo SSE
  private format<T>(message: SSEMessage<T>): string {
    const lines: string[] = []
    if (message.id) lines.push(`id: ${message.id}`)
    lines.push(`event: ${message.event}`)
    lines.push(`data: ${JSON.stringify(message.data)}`)
    lines.push('', '') // duas quebras de linha para finalizar o evento
    return lines.join('\n')
  }
}

// Singleton — compartilhado entre todos os handlers do processo
export const sseManager = new SSEManager()

// ---------------------------------------------------------------------------
// setupSSEConnection
// Configura os headers e registra a conexão SSE.
// ---------------------------------------------------------------------------

export function setupSSEConnection(
  req: Request,
  res: Response,
  tenantId: string,
  userId: string
): void {
  res.setHeader('Content-Type', 'text/event-stream')
  res.setHeader('Cache-Control', 'no-cache')
  res.setHeader('Connection', 'keep-alive')
  res.setHeader('X-Accel-Buffering', 'no') // desativa buffering no nginx
  res.flushHeaders()

  // Heartbeat a cada 30s para manter a conexão viva
  const heartbeat = setInterval(() => {
    try {
      res.write(': heartbeat\n\n')
    } catch {
      clearInterval(heartbeat)
    }
  }, 30_000)

  sseManager.register(tenantId, userId, res)

  req.on('close', () => {
    clearInterval(heartbeat)
    sseManager.remove(tenantId, userId, res)
  })
}
