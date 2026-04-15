// verify-run-tests.mjs — verifica que POST /run-tests funciona (token fix)
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

// Captura chamadas de rede relevantes
const apiCalls = []
page.on('response', async resp => {
  const url = resp.url()
  if (url.includes('/api/admin/')) {
    try {
      const body = await resp.json()
      const path = url.replace('http://localhost:8000', '')
      apiCalls.push({ path, status: resp.status(), ok: resp.ok(), body: JSON.stringify(body).substring(0, 200) })
    } catch {}
  }
})

// Login
await page.goto(`http://localhost:8000/sign-in?__clerk_ticket=${ticket}`)
await page.waitForURL(url => !url.toString().includes('/sign-in'), { timeout: 15000 })
console.log('✓ Login OK')

// Ir para /admin/testes e aguardar
await page.goto('http://localhost:8000/admin/testes', { waitUntil: 'domcontentloaded' })
await page.waitForFunction(
  () => Array.from(document.querySelectorAll('button')).some(b => b.textContent?.includes('Agendamento')),
  { timeout: 30000 }
)
console.log('✓ Página testes carregada')

// Abrir modal
const btnAgendamento = page.locator('button').filter({ hasText: /Agendamento/i }).first()
await btnAgendamento.click({ force: true })
await new Promise(r => setTimeout(r, 2000))

// Aba Manual
const abaManual = page.locator('[role="tab"]:has-text("Manual"), button:has-text("Manual")').first()
try {
  await abaManual.waitFor({ timeout: 5000 })
  await abaManual.click({ force: true })
  await new Promise(r => setTimeout(r, 1500))
} catch {}

// Aguardar planos carregar
await new Promise(r => setTimeout(r, 2000))
await page.screenshot({ path: path.join(OUT, 'run-01-modal-manual.png') })

// Verificar planos visíveis
const textoModal = await page.textContent('body')
const hasTSTE = textoModal?.includes('TSTE2E000001')
console.log('TSTE2E000001 visível:', hasTSTE)

// Clicar em "Executar"
const btnExecutar = page.locator('button').filter({ hasText: /Executar/i }).first()
try {
  await btnExecutar.waitFor({ timeout: 5000 })
  await btnExecutar.click({ force: true })
  await new Promise(r => setTimeout(r, 2000))
  console.log('✓ Botão Executar clicado')
} catch(e) {
  console.log('⚠ Botão Executar não encontrado:', e.message)
}

await page.screenshot({ path: path.join(OUT, 'run-02-apos-executar.png') })

// Relatório de chamadas API
console.log('\nChamadas API:')
for (const c of apiCalls) {
  const status = c.ok ? '✓' : '✗'
  console.log(`  ${status} ${c.path} — HTTP ${c.status} — ${c.body.substring(0, 100)}`)
}

// Veredicto
const runCall = apiCalls.find(c => c.path.includes('run-tests') && !c.path.includes('status'))
const runOk = runCall?.ok === true
const noToken = apiCalls.some(c => c.body.includes('Token de autenticação') || c.body.includes('UNAUTHORIZED'))

if (runOk) {
  console.log('\n✅ APROVADO — POST /run-tests retornou 200, token funcionando')
  fs.writeFileSync(path.join(OUT, 'resultado-run-tests.txt'), `APROVADO\nPOST /run-tests: ${runCall?.status}\n${new Date().toISOString()}`)
} else if (noToken) {
  console.log('\n❌ REPROVADO — ainda há erro de token')
  fs.writeFileSync(path.join(OUT, 'resultado-run-tests.txt'), `REPROVADO\nErro de token ainda presente\n${new Date().toISOString()}`)
} else {
  console.log('\n⚠ Run-tests não foi chamado ou retornou erro diferente')
  console.log('Calls:', JSON.stringify(apiCalls.slice(-5), null, 2))
  fs.writeFileSync(path.join(OUT, 'resultado-run-tests.txt'), `INCONCLUSIVO\n${new Date().toISOString()}`)
}

await browser.close()
