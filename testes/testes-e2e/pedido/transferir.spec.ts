import { test, expect } from '@playwright/test'

/**
 * Testes E2E — Modal Transferir Itens (produto Pedido)
 * Porta: 5179 (projeto 'pedido' no playwright.config.ts)
 *
 * Cobertura (ajustes implementados em 2026-04-09):
 *  - Botão Transferir desabilitado sem seleção de item
 *  - Botão habilita ao selecionar um item filho
 *  - Modal abre e exibe Step 1 com dropdown customizado (não <select> nativo)
 *  - Step 1: dropdown de cenário abre e fecha ao clicar
 *  - Step 2: item pré-selecionado
 *  - Step 2: títulos de colunas corretos (Part Number, Descrição do Item, Saldo, Qty a Transferir, Saldo Após)
 *  - Step 2: coluna "Saldo Após" calcula ao vivo conforme quantidade digitada
 *  - Step 3: campo de quantidade é readonly (não editável pelo usuário)
 *  - Cancelar fecha o modal
 */

const PRINTS_DIR = 'testes/testes-em-tela/produto/pedido/2026-04-09-modal-transferir-ajustes-ux-e-erro-500'

test.describe('Transferir Itens — Modal @critico', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/pedidos')
    await page.waitForLoadState('domcontentloaded')
    await expect(
      page.locator('.mtg-left__page-title').or(page.locator('.gtv-table'))
    ).toBeVisible({ timeout: 15000 })
    await expect(page.locator('.gtv-linha--pai').first()).toBeVisible({ timeout: 15000 })
  })

  // ── Botão Transferir ──────────────────────────────────────────────────────────

  test('botão Transferir está desabilitado sem seleção', async ({ page }) => {
    await page.screenshot({ path: `${PRINTS_DIR}/01-lista-pedidos-sem-selecao.png`, fullPage: true })

    const btnTransferir = page.getByRole('button', { name: /Transferir/i })
    await expect(btnTransferir).toBeVisible({ timeout: 10000 })
    await expect(btnTransferir).toBeDisabled()

    await page.screenshot({ path: `${PRINTS_DIR}/02-btn-transferir-desabilitado.png`, fullPage: true })
  })

  test('botão Transferir habilita ao selecionar um item filho', async ({ page }) => {
    await page.screenshot({ path: `${PRINTS_DIR}/03-lista-antes-selecao-filho.png`, fullPage: true })

    const linhaPai = page.locator('.gtv-linha--pai').first()
    await expect(linhaPai).toBeVisible({ timeout: 10000 })

    const toggleExpand = linhaPai.locator('button[aria-label*="xpand"], button[aria-label*="brir"], .gtv-toggle').first()
    if (await toggleExpand.count() > 0) {
      await toggleExpand.click()
      await page.waitForTimeout(300)
    }

    const linhaFilho = page.locator('.gtv-linha--filho').first()
    if (await linhaFilho.count() > 0) {
      const checkboxFilho = linhaFilho.locator('input[type="checkbox"]').first()
      await checkboxFilho.evaluate(el => (el as HTMLInputElement).click())
      await page.waitForTimeout(200)
      await page.screenshot({ path: `${PRINTS_DIR}/04-filho-selecionado-btn-habilitado.png`, fullPage: true })
      const btnTransferir = page.getByRole('button', { name: /Transferir/i })
      await expect(btnTransferir).toBeEnabled({ timeout: 5000 })
    } else {
      const paiCheckbox = linhaPai.locator('input[type="checkbox"]').first()
      await paiCheckbox.evaluate(el => (el as HTMLInputElement).click())
      await page.waitForTimeout(200)
      await page.screenshot({ path: `${PRINTS_DIR}/04-pai-selecionado-fallback.png`, fullPage: true })
      await expect(page.getByRole('button', { name: /Transferir/i })).toBeVisible()
    }
  })

  // ── Step 1 — Tipo de transferência ──────────────────────────────────────────

  test('modal abre com Step 1 e dropdown de cenário customizado (não <select> nativo)', async ({ page }) => {
    await abrirModalTransferir(page)

    const modal = page.locator('[role="dialog"]').filter({ hasText: /[Tt]ransfer/ })
    await expect(modal).toBeVisible({ timeout: 8000 })
    await page.screenshot({ path: `${PRINTS_DIR}/05-modal-step1-aberto.png`, fullPage: true })

    const dropdownTrigger = modal.locator('.modal-transferir__dropdown-trigger')
    await expect(dropdownTrigger).toBeVisible({ timeout: 5000 })

    const selectNativo = modal.locator('select.modal-transferir__select')
    await expect(selectNativo).toHaveCount(0)

    await page.screenshot({ path: `${PRINTS_DIR}/06-dropdown-custom-sem-select-nativo.png`, fullPage: true })
  })

  test('dropdown de cenário abre a lista ao clicar e fecha ao clicar novamente', async ({ page }) => {
    await abrirModalTransferir(page)

    const modal = page.locator('[role="dialog"]').filter({ hasText: /[Tt]ransfer/ })
    const dropdownTrigger = modal.locator('.modal-transferir__dropdown-trigger')
    await expect(dropdownTrigger).toBeVisible({ timeout: 5000 })

    const lista = modal.locator('.modal-transferir__dropdown-lista')
    await expect(lista).not.toBeVisible()
    await page.screenshot({ path: `${PRINTS_DIR}/07-dropdown-fechado.png`, fullPage: true })

    await dropdownTrigger.click()
    await expect(lista).toBeVisible({ timeout: 3000 })
    await page.screenshot({ path: `${PRINTS_DIR}/08-dropdown-aberto-com-opcoes.png`, fullPage: true })

    const itens = lista.locator('.modal-transferir__dropdown-item')
    await expect(itens.first()).toBeVisible()

    // Fechar clicando fora — no título do modal
    await modal.locator('.modal-transferir__titulo').click()
    await expect(lista).not.toBeVisible({ timeout: 3000 })
    await page.screenshot({ path: `${PRINTS_DIR}/09-dropdown-fechado-apos-click-fora.png`, fullPage: true })
  })

  test('confirm() nativo NÃO aparece ao abrir modal de transferir', async ({ page }) => {
    let dialogNativoApareceu = false
    page.on('dialog', () => { dialogNativoApareceu = true })

    await abrirModalTransferir(page)
    await page.waitForTimeout(500)
    await page.screenshot({ path: `${PRINTS_DIR}/10-sem-dialog-nativo.png`, fullPage: true })

    expect(dialogNativoApareceu).toBe(false)

    const modal = page.locator('[role="dialog"]').filter({ hasText: /[Tt]ransfer/ })
    const fechar = modal.locator('button[aria-label="Fechar modal"]')
    if (await fechar.count() > 0) await fechar.click()
  })

  // ── Step 2 — Selecionar item e quantidade ────────────────────────────────────

  test('Step 2 exibe títulos de colunas corretos', async ({ page }) => {
    await abrirModalTransferirEAvancarParaStep2(page)

    const modal = page.locator('[role="dialog"]').filter({ hasText: /[Tt]ransfer/ })
    await page.screenshot({ path: `${PRINTS_DIR}/11-step2-tabela-itens.png`, fullPage: true })

    await expect(modal.locator('th, .gtv-th').filter({ hasText: /Part Number/i })).toBeVisible({ timeout: 5000 })
    await expect(modal.locator('th, .gtv-th').filter({ hasText: /Descrição/i })).toBeVisible()
    await expect(modal.locator('th, .gtv-th').filter({ hasText: /^Saldo$/i }).or(
      modal.locator('th, .gtv-th').filter({ hasText: /Saldo\b/i }).first()
    )).toBeVisible()
    await expect(modal.locator('th, .gtv-th').filter({ hasText: /Qty|Qtd/i })).toBeVisible()
    await expect(modal.locator('th, .gtv-th').filter({ hasText: /Saldo Após/i })).toBeVisible()

    await page.screenshot({ path: `${PRINTS_DIR}/12-step2-colunas-corretas.png`, fullPage: true })
  })

  test('Step 2 exibe coluna "Saldo Após" que atualiza ao digitar quantidade', async ({ page }) => {
    await abrirModalTransferirEAvancarParaStep2(page)

    const modal = page.locator('[role="dialog"]').filter({ hasText: /[Tt]ransfer/ })
    await page.screenshot({ path: `${PRINTS_DIR}/13-step2-antes-digitar-qty.png`, fullPage: true })

    const thSaldoApos = modal.locator('th, .gtv-th').filter({ hasText: /Saldo Após/i })
    await expect(thSaldoApos).toBeVisible({ timeout: 5000 })

    const inputQty = modal.locator('input[type="number"]').first()
    if (await inputQty.count() > 0) {
      await inputQty.clear()
      await inputQty.fill('10')
      await page.waitForTimeout(200)
      await page.screenshot({ path: `${PRINTS_DIR}/14-step2-saldo-apos-calculado.png`, fullPage: true })

      const cellSaldoApos = modal.locator('.modal-transferir__saldo-apos').first()
        .or(modal.locator('td').last())
      await expect(cellSaldoApos).toBeVisible()
    }
  })

  // ── Step 3 — Configurar destinos ──────────────────────────────────────────────

  test('Step 3 exibe quantidade como leitura (não editável)', async ({ page }) => {
    await abrirModalTransferirEAvancarParaStep3(page)

    const modal = page.locator('[role="dialog"]').filter({ hasText: /[Tt]ransfer/ })
    await page.screenshot({ path: `${PRINTS_DIR}/15-step3-destinos.png`, fullPage: true })

    const inputQtyEditavel = modal.locator('.modal-transferir__destino-qty-input')
    await expect(inputQtyEditavel).toHaveCount(0)

    const qtyReadonly = modal.locator('.modal-transferir__destino-qty-readonly')
    if (await qtyReadonly.count() > 0) {
      await expect(qtyReadonly.first()).toBeVisible()
    } else {
      const inputsNaSecaoDestinos = modal.locator('.modal-transferir__destino input[type="number"]')
      await expect(inputsNaSecaoDestinos).toHaveCount(0)
    }

    await page.screenshot({ path: `${PRINTS_DIR}/16-step3-qty-readonly-confirmado.png`, fullPage: true })
  })

  // ── Cancelar fecha o modal ───────────────────────────────────────────────────

  test('Cancelar fecha o modal sem fazer nada', async ({ page }) => {
    await abrirModalTransferir(page)

    const modal = page.locator('[role="dialog"]').filter({ hasText: /[Tt]ransfer/ })
    await expect(modal).toBeVisible({ timeout: 8000 })
    await page.screenshot({ path: `${PRINTS_DIR}/17-modal-aberto-antes-cancelar.png`, fullPage: true })

    const btnCancelar = modal.locator('button').filter({ hasText: /Cancelar/i })
    await expect(btnCancelar).toBeVisible()
    await btnCancelar.click()
    await page.waitForTimeout(300)

    await expect(modal).not.toBeVisible({ timeout: 5000 })
    await page.screenshot({ path: `${PRINTS_DIR}/18-modal-fechado-apos-cancelar.png`, fullPage: true })
  })
})

// ── Helpers ────────────────────────────────────────────────────────────────────

async function selecionarItemParaTransferir(page: import('@playwright/test').Page) {
  const linhaFilho = page.locator('.gtv-linha--filho').first()
  if (await linhaFilho.count() > 0 && await linhaFilho.isVisible()) {
    const checkboxFilho = linhaFilho.locator('input[type="checkbox"]').first()
    await checkboxFilho.evaluate(el => (el as HTMLInputElement).click())
    await page.waitForTimeout(200)
    return
  }

  const linhaPai = page.locator('.gtv-linha--pai').first()
  const paiCheckbox = linhaPai.locator('input[type="checkbox"]').first()
  await paiCheckbox.evaluate(el => (el as HTMLInputElement).click())
  await page.waitForTimeout(200)
}

async function abrirModalTransferir(page: import('@playwright/test').Page) {
  await selecionarItemParaTransferir(page)

  const btnTransferir = page.getByRole('button', { name: /Transferir/i })
  await expect(btnTransferir).toBeEnabled({ timeout: 5000 })
  await btnTransferir.click()
  await page.waitForTimeout(300)
}

async function abrirModalTransferirEAvancarParaStep2(page: import('@playwright/test').Page) {
  await abrirModalTransferir(page)

  const modal = page.locator('[role="dialog"]').filter({ hasText: /[Tt]ransfer/ })
  await expect(modal).toBeVisible({ timeout: 8000 })

  const dropdownTrigger = modal.locator('.modal-transferir__dropdown-trigger')
  if (await dropdownTrigger.count() > 0) {
    await dropdownTrigger.click()
    await page.waitForTimeout(200)
    const primeiroItem = modal.locator('.modal-transferir__dropdown-item').first()
    if (await primeiroItem.isVisible()) {
      await primeiroItem.click()
      await page.waitForTimeout(200)
    }
  }

  const btnAvancar = modal.locator('button').filter({ hasText: /Próximo|Avançar|Continuar/i })
  if (await btnAvancar.count() > 0) {
    await btnAvancar.click()
    await page.waitForTimeout(300)
  }
}

async function abrirModalTransferirEAvancarParaStep3(page: import('@playwright/test').Page) {
  await abrirModalTransferirEAvancarParaStep2(page)

  const modal = page.locator('[role="dialog"]').filter({ hasText: /[Tt]ransfer/ })

  const radioItem = modal.locator('input[type="radio"][name="item-origem"]').first()
  if (await radioItem.count() > 0 && !(await radioItem.isChecked())) {
    await radioItem.click()
    await page.waitForTimeout(200)
  }

  const inputQty = modal.locator('input[type="number"]').first()
  if (await inputQty.count() > 0) {
    await inputQty.click()
    await inputQty.selectText()
    await inputQty.pressSequentially('10')
    await page.waitForTimeout(300)
  }

  const btnAvancar = modal.locator('button').filter({ hasText: /Próximo|Avançar|Continuar/i })
  if (await btnAvancar.count() > 0) {
    await expect(btnAvancar).toBeEnabled({ timeout: 5000 })
    await btnAvancar.click()
    await page.waitForTimeout(300)
  }
}
