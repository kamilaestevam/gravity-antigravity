/**
 * Servidor temporário que recebe screenshots do browser e salva em disco.
 * Rodar com: node scripts/screenshot-server.mjs
 */
import http from 'http'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const PUBLIC_DIR = path.resolve(__dirname, '../public')
const PORT = 7788

const server = http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  if (req.method === 'OPTIONS') { res.writeHead(204); res.end(); return }
  if (req.method !== 'POST') { res.writeHead(405); res.end(); return }

  let body = ''
  req.on('data', chunk => body += chunk)
  req.on('end', () => {
    try {
      const { arquivo, dataUrl } = JSON.parse(body)
      const base64 = dataUrl.replace(/^data:image\/\w+;base64,/, '')
      const destino = path.join(PUBLIC_DIR, arquivo)
      fs.mkdirSync(path.dirname(destino), { recursive: true })
      fs.writeFileSync(destino, Buffer.from(base64, 'base64'))
      console.log('✅ Salvo:', arquivo)
      res.writeHead(200, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify({ ok: true, arquivo }))
    } catch (e) {
      console.error('❌ Erro:', e.message)
      res.writeHead(500)
      res.end(JSON.stringify({ error: e.message }))
    }
  })
})

server.listen(PORT, () => console.log(`📡 Screenshot server em http://localhost:${PORT}`))
