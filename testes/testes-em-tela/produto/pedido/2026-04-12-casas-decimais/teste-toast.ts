/** Captura toast após tentativa de salvar (erro esperado: model ainda não migrado) */
import { chromium } from 'playwright'
import * as path from 'path'

const PASTA_SAIDA = path.join(
  'testes', 'testes-em-tela', 'produto', 'pedido', '2026-04-12-casas-decimais'
)
const BASE_URL = 'http://localhost:5179'

async function executar() {
  const browser = await chromium.launch({ headless: true })
  const page = await browser.newPage()
  await page.setViewportSize({ width: 1440, height: 900 })

  await page.goto(`${BASE_URL}/configuracoes?tab=colunas-casas-decimais`)
  await page.waitForLoadState('networkidle')
  await page.waitForTimeout(800)

  // Alterar valor
  const btnMais = page.locator('.cfg-casas-stepper__btn[aria-label="Aumentar"]').first()
  await btnMais.click()
  await page.waitForTimeout(200)

  // Salvar (force — pode estar momentaneamente enabled)
  const btnSalvar = page.getByRole('button', { name: /salvar/i }).first()
  await btnSalvar.click({ force: true })
  await page.waitForTimeout(1500)

  // Capturar toast
  const toast = page.locator('[class*="toast"]').first()
  if (await toast.count() > 0) {
    await toast.screenshot({ path: path.join(PASTA_SAIDA, '09-toast-detalhe.png') })
    const texto = await toast.textContent()
    console.log('Toast texto:', texto)
  }

  // Capturar footer com botão Salvar ativo
  await page.screenshot({
    path: path.join(PASTA_SAIDA, '09-estado-com-pending.png'),
    fullPage: false,
  })

  await browser.close()
}

executar().catch(console.error)
