/**
 * Script em tela — Gravity Store
 * Plano: testes/testes-em-tela/gravity-store/PLANO-EM-TELA.md
 */
import { chromium } from 'playwright'
import { mkdirSync, writeFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const OUT = resolve(__dirname, 'resultados')
const BASE = process.env.PLAYWRIGHT_BASE_URL ?? 'http://localhost:8000'

async function main() {
  mkdirSync(OUT, { recursive: true })
  const browser = await chromium.launch({ headless: true })
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
  const linhas: string[] = [`Base URL: ${BASE}`, `Data: ${new Date().toISOString()}`, '']

  try {
    await page.goto(`${BASE}/store`, { waitUntil: 'networkidle', timeout: 30_000 })
    await page.screenshot({ path: resolve(OUT, '00-store-carregada.png'), fullPage: true })
    linhas.push('EMT-STORE-001: /store carregou — screenshot 00 (validar contadores manualmente)')

    const tablist = page.locator('.gs-segmented[role="tablist"]')
    if (await tablist.count() > 0) {
      linhas.push('EMT-STORE-003: toolbar segmentada presente')
      await page.screenshot({ path: resolve(OUT, '01-toolbar.png'), fullPage: false })
    } else {
      linhas.push('EMT-STORE-003: FALHA — toolbar não encontrada (login necessário?)')
    }

    const puzzle = page.locator('.gs-puzzle-carousel--ativos')
    if (await puzzle.count() > 0) {
      linhas.push('EMT-STORE-002: faixa puzzle presente')
    }
  } catch (err) {
    linhas.push(`ERRO: ${err instanceof Error ? err.message : String(err)}`)
    linhas.push('Dica: faça login manual antes ou use sessão Clerk em staging.')
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
