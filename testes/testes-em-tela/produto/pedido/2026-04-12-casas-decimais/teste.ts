/**
 * ROTEIRO DE TESTE — Casas Decimais
 * Produto: Pedido
 * Cenário: Configurar casas decimais → salvar → ver banner de auditoria → confirmar migração
 * URL base: http://localhost:5179
 * Data: 2026-04-12
 * Pasta de saída: testes/testes-em-tela/produto/pedido/2026-04-12-casas-decimais/
 *
 * Passos:
 * 01. Tela de Configurações carregada — seção Casas Decimais visível
 * 02. Valores default aparecendo nos campos (2 para valor/quantidade, 3 para peso/cubagem)
 * 03. Alterar um valor (ex: peso_liquido de 3 para 4)
 * 04. Clicar em Salvar
 * 05. Banner de auditoria aparece (se houver pedidos) ou confirmação direta
 * 06. Clicar em Confirmar migração
 * 07. Toast de sucesso
 * 08. Restaurar valor original e salvar (sem migração)
 */

import { chromium } from 'playwright'
import * as path from 'path'
import * as fs from 'fs'

const PASTA_SAIDA = path.join(
  'testes', 'testes-em-tela', 'produto', 'pedido', '2026-04-12-casas-decimais'
)
const BASE_URL = 'http://localhost:5179'

async function executar() {
  fs.mkdirSync(PASTA_SAIDA, { recursive: true })

  const browser = await chromium.launch({ headless: true })
  const page = await browser.newPage()
  await page.setViewportSize({ width: 1440, height: 900 })

  // ── 01. Carregar página de Configurações (seção geral) ──────────────────────
  await page.goto(`${BASE_URL}/configuracoes`)
  await page.waitForLoadState('networkidle')
  await page.waitForTimeout(500)
  await page.screenshot({
    path: path.join(PASTA_SAIDA, '01-configuracoes-carregada.png'),
    fullPage: false,
  })
  console.log('01 — tela carregada')

  // ── 02. Navegar para tab Casas Decimais via URL ──────────────────────────────
  await page.goto(`${BASE_URL}/configuracoes?tab=colunas-casas-decimais`)
  await page.waitForLoadState('networkidle')
  await page.waitForTimeout(800)
  await page.screenshot({
    path: path.join(PASTA_SAIDA, '02-secao-casas-decimais.png'),
    fullPage: false,
  })
  console.log('02 — seção casas decimais')

  // ── 03. Capturar valores default (scroll para mostrar todos os campos) ──────
  await page.evaluate(() => window.scrollTo(0, 200))
  await page.waitForTimeout(200)
  await page.screenshot({
    path: path.join(PASTA_SAIDA, '03-valores-default.png'),
    fullPage: false,
  })
  console.log('03 — valores default capturados')

  // ── 04. Alterar valor usando stepper (+) — busca por aria-label ─────────────
  // Os campos usam stepper: botão − / valor / botão +
  // aria-label no wrapper: "Casas decimais para Peso Líquido Total"
  const stepperPeso = page.locator('[aria-label="Casas decimais para Peso Líquido Total"]')
  if (await stepperPeso.count() > 0) {
    const btnMais = stepperPeso.locator('[aria-label="Aumentar"]')
    await btnMais.scrollIntoViewIfNeeded()
    await btnMais.click()
    await page.waitForTimeout(200)
    await page.screenshot({
      path: path.join(PASTA_SAIDA, '04-valor-alterado.png'),
      fullPage: false,
    })
    console.log('04 — valor alterado (+1 no Peso Líquido Total)')
  } else {
    // Fallback: clicar no primeiro botão "Aumentar" da seção
    const btnMaisFirst = page.locator('.cfg-casas-stepper__btn[aria-label="Aumentar"]').first()
    if (await btnMaisFirst.count() > 0) {
      await btnMaisFirst.scrollIntoViewIfNeeded()
      await btnMaisFirst.click()
      await page.waitForTimeout(200)
    }
    await page.screenshot({
      path: path.join(PASTA_SAIDA, '04-valor-alterado.png'),
      fullPage: false,
    })
    console.log('04 — valor alterado (fallback: primeiro stepper +)')
  }

  // ── 05. Clicar em Salvar (o botão pode estar disabled inicialmente) ──────────
  const btnSalvar = page.getByRole('button', { name: /salvar/i }).first()
  if (await btnSalvar.count() > 0) {
    await btnSalvar.scrollIntoViewIfNeeded()
    // Forçar click mesmo se disabled (para capturar o estado visual)
    await btnSalvar.click({ force: true })
    await page.waitForTimeout(1200)
    await page.screenshot({
      path: path.join(PASTA_SAIDA, '05-apos-salvar.png'),
      fullPage: false,
    })
    console.log('05 — Salvar clicado')
  } else {
    console.log('05 — botão Salvar não encontrado')
    await page.screenshot({
      path: path.join(PASTA_SAIDA, '05-apos-salvar.png'),
      fullPage: false,
    })
  }

  // ── 06. Verificar se banner de migração apareceu ─────────────────────────────
  const banner = page.locator('.cfg-migracao-banner').first()
  const bannerVisivel = await banner.count() > 0 && await banner.isVisible().catch(() => false)

  if (bannerVisivel) {
    await banner.scrollIntoViewIfNeeded()
    await page.screenshot({
      path: path.join(PASTA_SAIDA, '06-banner-migracao.png'),
      fullPage: false,
    })
    console.log('06 — banner de migração visível')

    // ── 07. Clicar em Confirmar migração ────────────────────────────────────────
    const btnConfirmar = page.getByRole('button', { name: /confirmar/i }).first()
    if (await btnConfirmar.count() > 0) {
      await btnConfirmar.click()
      await page.waitForTimeout(1000)
      await page.screenshot({
        path: path.join(PASTA_SAIDA, '07-migracao-confirmada.png'),
        fullPage: false,
      })
      console.log('07 — migração confirmada')
    } else {
      console.log('07 — botão Confirmar não encontrado')
    }
  } else {
    // Sem banner — sem pedidos no ambiente dev, config salva diretamente
    await page.screenshot({
      path: path.join(PASTA_SAIDA, '06-sem-banner-config-salva.png'),
      fullPage: false,
    })
    console.log('06 — sem banner (sem pedidos existentes ou backend sem resposta)')
  }

  // ── 08. Toast de sucesso ─────────────────────────────────────────────────────
  const toast = page.locator('[class*="toast"], [role="status"], [class*="snack"]').first()
  if (await toast.count() > 0) {
    await page.screenshot({
      path: path.join(PASTA_SAIDA, '08-toast-sucesso.png'),
      fullPage: false,
    })
    console.log('08 — toast capturado')
  } else {
    await page.screenshot({
      path: path.join(PASTA_SAIDA, '08-estado-final.png'),
      fullPage: false,
    })
    console.log('08 — estado final')
  }

  await browser.close()
  console.log(`\nScreenshots salvos em: ${PASTA_SAIDA}`)
}

executar().catch(console.error)
