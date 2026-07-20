/**
 * Gera smart-docs-historico-1..3.png a partir do simulador Smart Docs (marketplace :8777).
 * Uso: npx tsx scripts/ativamente/capturar-screenshots-smart-docs-historico.ts
 */
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { chromium } from 'playwright'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const destino = path.resolve(__dirname, '../../servicos-global/configurador/public/university/screenshots')
const baseUrl = process.env.MARKETPLACE_URL ?? 'http://127.0.0.1:8777'

async function main() {
  const browser = await chromium.launch()
  const page = await browser.newPage({ viewport: { width: 1440, height: 920 } })

  await page.goto(`${baseUrl}/dev/captura-smart-docs-historico`, { waitUntil: 'networkidle' })
  await page.locator('.sds-root').waitFor({ state: 'visible', timeout: 30_000 })
  await page.waitForTimeout(600)
  await page.locator('.sds-root').screenshot({
    path: path.join(destino, 'smart-docs-historico-1.png'),
  })

  await page.goto(`${baseUrl}/dev/captura-smart-docs-historico`, { waitUntil: 'networkidle' })
  await page.locator('.sds-root').waitFor({ state: 'visible', timeout: 30_000 })
  await page.waitForTimeout(600)
  await page.locator('.sds-root').screenshot({
    path: path.join(destino, 'smart-docs-historico-2.png'),
  })

  const btnExportar = page.getByRole('button', { name: /^Exportar$/i })
  await btnExportar.click()
  await page.waitForTimeout(400)
  await page.locator('.sds-root').screenshot({
    path: path.join(destino, 'smart-docs-historico-3.png'),
  })

  await browser.close()
  console.log('OK smart-docs-historico-1..3.png em', destino)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
