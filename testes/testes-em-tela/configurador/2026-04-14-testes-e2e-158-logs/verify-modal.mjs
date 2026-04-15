// verify-modal.mjs — verifica modal de planos de teste (v2)
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

const browser = await chromium.launch({ headless: false })
const page = await browser.newPage()
await page.setViewportSize({ width: 1440, height: 900 })

// Login
await page.goto(`http://localhost:8000/sign-in?__clerk_ticket=${ticket}`)
await page.waitForURL(url => !url.toString().includes('/sign-in'), { timeout: 15000 })
console.log('✓ Login OK')

// Navegar para /admin/testes e aguardar o botão Agendamento aparecer
await page.goto('http://localhost:8000/admin/testes', { waitUntil: 'domcontentloaded' })
await page.waitForFunction(
  () => Array.from(document.querySelectorAll('button')).some(b => b.textContent?.includes('Agendamento')),
  { timeout: 30000 }
)
console.log('✓ Página testes carregada')
await page.screenshot({ path: path.join(OUT, 'modal-01-pagina-testes.png') })

// Clicar no botão Agendamento ativo
const btnAgendamento = page.locator('button').filter({ hasText: /Agendamento/i }).first()
await btnAgendamento.click({ force: true })
await new Promise(r => setTimeout(r, 1500))
await page.screenshot({ path: path.join(OUT, 'modal-02-modal-aberto.png') })
console.log('✓ Modal aberto')

// Clicar na aba Manual
const abaManual = page.locator('[role="tab"]:has-text("Manual"), button:has-text("Manual")').first()
try {
  await abaManual.waitFor({ timeout: 5000 })
  await abaManual.click({ force: true })
  await new Promise(r => setTimeout(r, 1000))
  console.log('✓ Aba Manual clicada')
} catch { console.log('Aba Manual não encontrada, continuando...') }
await page.screenshot({ path: path.join(OUT, 'modal-03-aba-manual.png') })

// Verificar planos
const bodyText = await page.textContent('body')
const hasTSTE = bodyText?.includes('TSTE2E000001')
const hasConfigurador = bodyText?.toLowerCase().includes('configurador')
console.log(`TSTE2E000001 visível: ${hasTSTE}`)
console.log(`Produto Configurador: ${hasConfigurador}`)

await page.screenshot({ path: path.join(OUT, 'modal-04-planos-configurador.png'), fullPage: false })

if (hasTSTE) {
  console.log('\n✅ APROVADO — modal mostra planos com TSTE2E000001')
  fs.writeFileSync(path.join(OUT, 'resultado-modal.txt'), `APROVADO\nTSTE2E000001: visível\n${new Date().toISOString()}`)
} else {
  console.log('\n⚠ Plano TSTE2E000001 não encontrado na página')
  console.log('Texto modal (primeiros 800):', bodyText?.substring(0, 800))
  fs.writeFileSync(path.join(OUT, 'resultado-modal.txt'), `REPROVADO\nTSTE2E000001: não visível\n${new Date().toISOString()}`)
}

await browser.close()
console.log('Screenshots em:', OUT)
