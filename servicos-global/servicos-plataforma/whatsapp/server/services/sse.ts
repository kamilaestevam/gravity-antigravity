export class SSEStreamHandler {
  private clients: Map<string, any[]> = new Map()

  constructor() {
    // Ping/Heartbeat a cada 30s
    setInterval(() => {
      this.clients.forEach((tenantClients, tenant_id) => {
        tenantClients.forEach(client => {
          client.res.write(':\n\n') // commendo ping do SSE
        })
      })
    }, 30000)
  }

  addClient(tenant_id: string, req: any, res: any) {
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive'
    })

    const client = { req, res }
    if (!this.clients.has(tenant_id)) {
      this.clients.set(tenant_id, [])
    }
    
    this.clients.get(tenant_id)!.push(client)

    // Cleanup when connection closes
    req.on('close', () => {
      const tenantClients = this.clients.get(tenant_id) || []
      this.clients.set(tenant_id, tenantClients.filter(c => c !== client))
    })
  }

  emit(tenant_id: string, eventType: string, payload: any) {
    const tenantClients = this.clients.get(tenant_id)
    if (!tenantClients) return

    const data = `data: ${JSON.stringify({ type: eventType, payload })}\n\n`
    tenantClients.forEach(client => {
      client.res.write(data)
    })
  }
}

export const sseStreamHandlers = new SSEStreamHandler()
