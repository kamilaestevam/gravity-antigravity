import { chromium } from 'playwright'
import { mkdirSync, writeFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const OUT = resolve(__dirname, '2026-05-26-checklist-termos')
const BASE = process.env.PLAYWRIGHT_BASE_URL ?? 'http://localhost:8001'

async function main() {
  mkdirSync(OUT, { recursive: true })
  const browser = await chromium.launch({ headless: true })
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })

  const linhas: string[] = [`Base URL: ${BASE}`, `Data: ${new Date().toISOString()}`, '']

  try {
    await page.goto(`${BASE}/cadastro`, { waitUntil: 'networkidle' })
    await page.fill('#signup-nome', 'Daniel')
    await page.fill('#signup-sobrenome', 'Teste')
    await page.fill('#signup-email', 'teste-checklist@example.com')
    await page.fill('#signup-senha', 'Test@1234')
    await page.fill('#signup-confirmacao', 'Test@1234')

    const itens = await page.locator('.signup-requisito').allTextContents()
    const termosVisivel = await page.getByText('Aceite dos Termos de Uso e Política de Privacidade').count()
    const btnDisabledAntes = await page.locator('button.signin-button').isDisabled()

    await page.screenshot({ path: resolve(OUT, '01-checklist-termos-pendente.png'), fullPage: true })

    await page.locator('.signup-termos input[type="checkbox"]').check()
    const termosOk = await page.locator('.signup-requisito--ok', { hasText: 'Aceite dos Termos' }).count()
    const btnDisabledDepois = await page.locator('button.signin-button').isDisabled()

    await page.screenshot({ path: resolve(OUT, '02-checklist-termos-ok.png'), fullPage: true })

    const passou = itens.length === 6 && termosVisivel === 1 && termosOk === 1

    linhas.push(`Total itens checklist: ${itens.length} (esperado: 6)`)
    linhas.push(...itens.map((t, i) => `  ${i + 1}. ${t.trim()}`))
    linhas.push(`Item termos visível: ${termosVisivel === 1 ? 'SIM' : 'NAO'}`)
    linhas.push(`Botão Continuar (sem aceite): ${btnDisabledAntes ? 'desabilitado OK' : 'HABILITADO — ERRO'}`)
    linhas.push(`Item termos verde após check: ${termosOk === 1 ? 'SIM' : 'NAO'}`)
    linhas.push(`Botão Continuar (com aceite + campos): ${btnDisabledDepois ? 'desabilitado' : 'habilitado OK'}`)
    linhas.push('')
    linhas.push(passou ? 'RESULTADO: PASSOU' : 'RESULTADO: FALHOU')

    if (!passou) process.exitCode = 1
  } catch (err) {
    linhas.push(`ERRO: ${err instanceof Error ? err.message : String(err)}`)
    process.exitCode = 1
  } finally {
    await browser.close()
  }

  writeFileSync(resolve(OUT, 'RESULTADO.txt'), linhas.join('\n'), 'utf-8')
  console.log(linhas.join('\n'))
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
