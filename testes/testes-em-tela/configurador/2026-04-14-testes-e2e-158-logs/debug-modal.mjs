// debug-modal.mjs — v6 (intercepta rede)
import { chromium } from 'playwright'
import https from 'https'
import path from 'path'
import fs from 'fs'

const OUT = 'testes/testes-em-tela/configurador/2026-04-14-testes-e2e-158-logs'
const CLERK_SECRET  = 'sk_test_msUQbWQhVZCIXgQKOxIAoq0UqQ2PU1TeeUBcv9o8rF'
const ADMIN_USER_ID = 'user_3BMaKkAZrO5AXkR53oXYbQl9wWo'

async function getClerkToken() {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({ user_id: ADMIN_USER_ID })
    const req = https.request({
      hostname: 'api.clerk.com', path: '/v1/sign_in_tokens', method: 'POST',
      headers: { 'Authorization': `Bearer ${CLERK_SECRET}`, 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) },
    }, res => {
      let data = ''
      res.on('data', c => data += c)
      res.on('end', () => {
        try { const p = JSON.parse(data); p.token ? resolve(p.token) : reject(new Error(data)) }
        catch(e) { reject(e) }
      })
    })
    req.on('error', reject); req.write(body); req.end()
  })
}

const ticket = await getClerkToken()
console.log('✓ Token obtido')

const browser = await chromium.launch({ headless: true })
const page = await browser.newPage()
await page.setViewportSize({ width: 1440, height: 900 })

// Interceptar respostas de rede
const apiRespostas = []
page.on('response', async resp => {
  const url = resp.url()
  if (url.includes('test-plans') || url.includes('test-logs')) {
    try {
      const body = await resp.json()
      apiRespostas.push({ url: url.replace('http://localhost:8000', ''), status: resp.status(), body })
    } catch {}
  }
})

// Login
await page.goto(`http://localhost:8000/sign-in?__clerk_ticket=${ticket}`)
await page.waitForURL(url => !url.toString().includes('/sign-in'), { timeout: 15000 })
console.log('✓ Login OK')

// Navegar para /admin/testes e aguardar
await page.goto('http://localhost:8000/admin/testes', { waitUntil: 'domcontentloaded' })
await page.waitForFunction(
  () => Array.from(document.querySelectorAll('button')).some(b => b.textContent?.includes('Agendamento')),
  { timeout: 30000 }
)

// Clicar Agendamento
const btnAgendamento = page.locator('button').filter({ hasText: /Agendamento/i }).first()
await btnAgendamento.click({ force: true })
await new Promise(r => setTimeout(r, 3000))

// Clicar aba Manual se existir
const abaManual = page.locator('[role="tab"]:has-text("Manual"), button:has-text("Manual")').first()
try {
  await abaManual.waitFor({ timeout: 3000 })
  await abaManual.click({ force: true })
  await new Promise(r => setTimeout(r, 1500))
} catch {}

await page.screenshot({ path: path.join(OUT, 'debug-modal-v6.png') })

// Reportar API calls
console.log('\nAPI calls interceptadas:', JSON.stringify(apiRespostas, null, 2))

const bodyText = await page.textContent('body')
const hasTSTE = bodyText?.includes('TSTE2E000001')
console.log('TSTE2E000001 visível:', hasTSTE)

await browser.close()
