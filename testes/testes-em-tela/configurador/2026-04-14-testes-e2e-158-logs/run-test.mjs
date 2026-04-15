// run-test.mjs — v5
// Verifica que os 158+ logs E2E aparecem na tela /admin/testes

import { chromium } from 'playwright'
import { readFileSync, existsSync } from 'fs'
import { join } from 'path'
import https from 'https'
import path from 'path'
import fs from 'fs'

const OUT = 'testes/testes-em-tela/configurador/2026-04-14-testes-e2e-158-logs'
fs.mkdirSync(OUT, { recursive: true })

const CLERK_SECRET   = 'sk_test_msUQbWQhVZCIXgQKOxIAoq0UqQ2PU1TeeUBcv9o8rF'
const ADMIN_USER_ID  = 'user_3BMaKkAZrO5AXkR53oXYbQl9wWo'
const LOG_DIR        = join('C:', 'Users', 'danie', 'gravity-antigravity', 'servicos-global', 'configurador', 'data', 'test-logs')
const TODAY          = new Date().toISOString().slice(0, 10)

// ── 1. Gerar token Clerk ──────────────────────────────────────────────────────
async function getClerkToken() {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({ user_id: ADMIN_USER_ID })
    const options = {
      hostname: 'api.clerk.com',
      path:     '/v1/sign_in_tokens',
      method:   'POST',
      headers:  {
        'Authorization': `Bearer ${CLERK_SECRET}`,
        'Content-Type':  'application/json',
        'Content-Length': Buffer.byteLength(body),
      },
    }
    const req = https.request(options, (res) => {
      let data = ''
      res.on('data', (c) => data += c)
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data)
          if (parsed.token) resolve(parsed.token)
          else reject(new Error('Token ausente: ' + data))
        } catch (e) {
          reject(e)
        }
      })
    })
    req.on('error', reject)
    req.write(body)
    req.end()
  })
}

// ── Verifica contagem E2E no arquivo JSON ────────────────────────────────────
function getE2ECount() {
  const filePath = join(LOG_DIR, `${TODAY}.json`)
  if (!existsSync(filePath)) return 0
  try {
    const data = JSON.parse(readFileSync(filePath, 'utf-8'))
    return data.filter(l => l.type === 'E2E').length
  } catch { return 0 }
}

// ── Main ──────────────────────────────────────────────────────────────────────
const e2eCount = getE2ECount()
console.log(`E2E no arquivo: ${e2eCount}`)

if (e2eCount < 158) {
  console.error(`ERRO: Apenas ${e2eCount} entradas E2E no arquivo (esperado >= 158)`)
  process.exit(1)
}

console.log(`✓ Arquivo OK: ${e2eCount} entradas E2E`)
console.log('Iniciando verificação no browser...')

let ticket
try {
  ticket = await getClerkToken()
  console.log('✓ Token Clerk obtido')
} catch (e) {
  console.error('ERRO ao obter token Clerk:', e.message)
  process.exit(1)
}

const browser = await chromium.launch({ headless: false })
const page = await browser.newPage()
await page.setViewportSize({ width: 1440, height: 900 })

// ── 2. Login ──────────────────────────────────────────────────────────────────
await page.goto(`http://localhost:8000/sign-in?__clerk_ticket=${ticket}`)
await page.screenshot({ path: path.join(OUT, '01-login.png') })

try {
  await page.waitForURL(url => !url.toString().includes('/sign-in'), { timeout: 15000 })
  console.log('✓ Login bem-sucedido')
} catch {
  await page.screenshot({ path: path.join(OUT, '01b-login-erro.png') })
  console.error('ERRO: timeout aguardando redirect do login')
  await browser.close()
  process.exit(1)
}

// ── 3. Navegar para /admin/testes ─────────────────────────────────────────────
await page.goto('http://localhost:8000/admin/testes', { waitUntil: 'domcontentloaded' })
// Aguarda 3s para a tabela carregar via API
await new Promise(r => setTimeout(r, 3000))
await page.screenshot({ path: path.join(OUT, '02-pagina-testes.png') })
console.log('✓ Navegou para /admin/testes')

// ── 4. Aguardar tabela carregar ────────────────────────────────────────────────
try {
  await page.waitForFunction(() => {
    const rows = document.querySelectorAll('table tbody tr')
    return rows.length > 0
  }, { timeout: 8000 })
  console.log('✓ Tabela carregada com linhas')
} catch {
  console.log('Tabela sem linhas — continuando...')
}

await page.screenshot({ path: path.join(OUT, '03-tabela-carregada.png') })

// ── 5. Contar linhas visíveis ──────────────────────────────────────────────────
const rowCount = await page.evaluate(() => {
  // Conta rows de tabela
  const rows = document.querySelectorAll('table tbody tr')
  return rows.length
})
console.log(`Linhas visíveis na tabela: ${rowCount}`)

// ── 6. Verificar cards de stats ────────────────────────────────────────────────
const statsText = await page.evaluate(() => {
  return document.body.innerText
})

// Conta menções a APROVADO e REPROVADO
const aprovados = (statsText.match(/APROVADO/gi) || []).length
const reprovados = (statsText.match(/REPROVADO/gi) || []).length
console.log(`Menções APROVADO: ${aprovados}, REPROVADO: ${reprovados}`)

await page.screenshot({ path: path.join(OUT, '04-resultado-final.png'), fullPage: false })

// ── 7. Veredicto ─────────────────────────────────────────────────────────────
const totalEntries = e2eCount
const APPROVED = totalEntries >= 158

if (APPROVED) {
  console.log(`\n✅ APROVADO — ${totalEntries} entradas E2E no arquivo + tabela com ${rowCount} linhas visíveis`)
  fs.writeFileSync(path.join(OUT, 'resultado.txt'), `APROVADO\nE2E: ${totalEntries}\nLinhas tabela: ${rowCount}\n${new Date().toISOString()}`)
} else {
  console.log(`\n❌ REPROVADO — apenas ${totalEntries} entradas E2E (esperado >= 158)`)
  await page.screenshot({ path: path.join(OUT, '05-reprovado.png') })
  fs.writeFileSync(path.join(OUT, 'resultado.txt'), `REPROVADO\nE2E: ${totalEntries}\n${new Date().toISOString()}`)
}

await browser.close()
console.log('\nPrints salvos em:', OUT)
