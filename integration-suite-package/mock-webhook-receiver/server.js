import http from 'node:http'
import crypto from 'node:crypto'

const SECRET = process.env.GRAVITY_WEBHOOK_SECRET ?? 'dev-webhook-secret'
const PORT = Number(process.env.PORT ?? 9090)

const server = http.createServer((req, res) => {
  if (req.method === 'POST' && req.url === '/webhook') {
    const chunks: Buffer[] = []
    req.on('data', (c) => chunks.push(c))
    req.on('end', () => {
      const body = Buffer.concat(chunks).toString('utf8')
      const assinatura = req.headers['x-gravity-signature']
      const esperada = crypto.createHmac('sha256', SECRET).update(body).digest('hex')
      const ok = typeof assinatura === 'string' && assinatura === esperada
      console.log('[mock-webhook]', { ok, eventId: req.headers['x-gravity-event-id'], body: body.slice(0, 200) })
      res.writeHead(ok ? 200 : 401, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify({ recebido: ok }))
    })
    return
  }
  res.writeHead(404)
  res.end()
})

server.listen(PORT, () => {
  console.log(`[mock-webhook] listening :${PORT}`)
})
