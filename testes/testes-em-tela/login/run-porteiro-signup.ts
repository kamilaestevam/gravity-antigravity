/**
 * Script em tela — Porteiro signup (local)
 * Plano: testes/testes-em-tela/login/2026-05-26-porteiro-signup/PLANO-EM-TELA.md
 *
 * Uso: npx tsx testes/testes-em-tela/login/run-porteiro-signup.ts
 * Requer: configurador em :8000, Playwright instalado no monorepo.
 */
import { chromium } from 'playwright'
import { mkdirSync, writeFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const OUT = resolve(__dirname, '2026-05-26-porteiro-signup')
const BASE = process.env.PLAYWRIGHT_BASE_URL ?? 'http://localhost:8000'

async function main() {
  mkdirSync(OUT, { recursive: true })
  const browser = await chromium.launch({ headless: true })
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })

  const linhas: string[] = [`Base URL: ${BASE}`, `Data: ${new Date().toISOString()}`, '']

  try {
    await page.goto(`${BASE}/cadastro`, { waitUntil: 'networkidle' })
    await page.screenshot({ path: resolve(OUT, '00-cadastro-carregado.png'), fullPage: true })
    linhas.push('EMT-000: /cadastro carregou — screenshot 00 OK (manual: completar signup para EMT-001)')

    await page.goto(`${BASE}/trial`, { waitUntil: 'networkidle' })
    await page.screenshot({ path: resolve(OUT, '01-trial-direto.png'), fullPage: true })
    const url = page.url()
    linhas.push(`EMT-001 parcial: goto /trial → ${url}`)
  } catch (err) {
    linhas.push(`ERRO: ${err instanceof Error ? err.message : String(err)}`)
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
