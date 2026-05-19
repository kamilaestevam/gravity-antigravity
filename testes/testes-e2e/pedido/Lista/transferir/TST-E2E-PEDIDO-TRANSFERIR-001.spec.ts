/**
 * SCAFFOLD — TST-E2E-PEDIDO-TRANSFERIR-001
 *
 * Testes E2E para transferência de itens entre pedidos.
 * Todos os fluxos estão em describe.skip até que o ambiente
 * Playwright + staging esteja configurado e o plano seja aprovado.
 *
 * Locators usam data-testid (padrão Gravity).
 * Plano completo: transferir-e2e.md
 */

import { test, expect, type Page } from '@playwright/test'

const BASE_URL = process.env.BASE_URL ?? 'http://localhost:5180'
const ROTA_LISTA = '/produto/pedido/pedidos/lista'

// ── Helpers ──────────────────────────────────────────────────────────────────

async function navegarParaLista(page: Page) {
  await page.goto(`${BASE_URL}${ROTA_LISTA}`)
  await page.waitForSelector('[data-testid="tabela-pedidos"]', { timeout: 10_000 })
}

async function abrirDetalhePedido(page: Page, pedidoId: string) {
  await page.click(`[data-testid="row-${pedidoId}"]`)
  await page.waitForSelector('[data-testid="detalhe-pedido"]', { timeout: 5_000 })
}

async function abrirModalTransferir(page: Page, itemId: string) {
  await page.click(`[data-testid="btn-transferir-${itemId}"]`)
  await page.waitForSelector('[data-testid="modal-transferir"]', { timeout: 5_000 })
}

// ── Fluxo 1 — Split novo pedido (happy path) ───────────────────────────────

test.describe.skip('Fluxo 1 — Split novo pedido (happy path)', () => {
  test('F1-01: Abrir modal de transferência a partir de um item', async ({ page }) => {
    await navegarParaLista(page)
    await abrirDetalhePedido(page, 'ped-001')
    await abrirModalTransferir(page, 'itm-001')

    await expect(page.locator('[data-testid="modal-transferir"]')).toBeVisible()
  })

  test('F1-02: Selecionar cenário split_novo_pedido e definir quantidade', async ({ page }) => {
    await navegarParaLista(page)
    await abrirDetalhePedido(page, 'ped-001')
    await abrirModalTransferir(page, 'itm-001')

    await page.selectOption('[data-testid="select-cenario"]', 'split_novo_pedido')
    await page.fill('[data-testid="input-quantidade-origem"]', '30')
    await page.click('[data-testid="btn-preview"]')

    await expect(page.locator('[data-testid="preview-resultado"]')).toBeVisible()
  })

  test('F1-03: Preview mostra impacto e confirmar → sucesso', async ({ page }) => {
    await navegarParaLista(page)
    await abrirDetalhePedido(page, 'ped-001')
    await abrirModalTransferir(page, 'itm-001')

    await page.selectOption('[data-testid="select-cenario"]', 'split_novo_pedido')
    await page.fill('[data-testid="input-quantidade-origem"]', '30')
    await page.click('[data-testid="btn-preview"]')
    await page.click('[data-testid="btn-confirmar-transferencia"]')

    await expect(page.locator('[data-testid="banner-sucesso"]')).toBeVisible({ timeout: 10_000 })
  })
})

// ── Fluxo 2 — Split para pedido existente ───────────────────────────────────

test.describe.skip('Fluxo 2 — Split para pedido existente', () => {
  test('F2-01: Selecionar pedido destino existente e confirmar', async ({ page }) => {
    await navegarParaLista(page)
    await abrirDetalhePedido(page, 'ped-001')
    await abrirModalTransferir(page, 'itm-001')

    await page.selectOption('[data-testid="select-cenario"]', 'split_pedido_existente')
    await page.fill('[data-testid="input-quantidade-origem"]', '20')
    await page.click('[data-testid="btn-selecionar-destino"]')
    await page.click('[data-testid="option-pedido-ped-002"]')
    await page.click('[data-testid="btn-preview"]')
    await page.click('[data-testid="btn-confirmar-transferencia"]')

    await expect(page.locator('[data-testid="banner-sucesso"]')).toBeVisible({ timeout: 10_000 })
  })
})

// ── Fluxo 3 — Redução simples ───────────────────────────────────────────────

test.describe.skip('Fluxo 3 — Redução simples', () => {
  test('F3-01: Redução sem destino → quantidade reduzida', async ({ page }) => {
    await navegarParaLista(page)
    await abrirDetalhePedido(page, 'ped-001')
    await abrirModalTransferir(page, 'itm-001')

    await page.selectOption('[data-testid="select-cenario"]', 'reducao_simples')
    await page.fill('[data-testid="input-quantidade-origem"]', '10')
    await page.click('[data-testid="btn-preview"]')
    await page.click('[data-testid="btn-confirmar-transferencia"]')

    await expect(page.locator('[data-testid="banner-sucesso"]')).toBeVisible({ timeout: 10_000 })
  })
})

// ── Fluxo 4 — Substituição de part_number ───────────────────────────────────

test.describe.skip('Fluxo 4 — Substituição de part_number', () => {
  test('F4-01: Trocar part_number no mesmo pedido', async ({ page }) => {
    await navegarParaLista(page)
    await abrirDetalhePedido(page, 'ped-001')
    await abrirModalTransferir(page, 'itm-001')

    await page.selectOption('[data-testid="select-cenario"]', 'substituicao_pura')
    await page.fill('[data-testid="input-part-number-novo"]', 'PN-NEW')
    await page.click('[data-testid="btn-preview"]')
    await page.click('[data-testid="btn-confirmar-transferencia"]')

    await expect(page.locator('[data-testid="banner-sucesso"]')).toBeVisible({ timeout: 10_000 })
  })
})

// ── Fluxo 5 — Tipo de operação divergente ───────────────────────────────────

test.describe.skip('Fluxo 5 — Tipo de operação divergente', () => {
  test('F5-01: Aviso de tipo divergente aparece e checkbox confirma', async ({ page }) => {
    await navegarParaLista(page)
    await abrirDetalhePedido(page, 'ped-001')
    await abrirModalTransferir(page, 'itm-001')

    await page.selectOption('[data-testid="select-cenario"]', 'split_pedido_existente')
    await page.fill('[data-testid="input-quantidade-origem"]', '20')
    await page.click('[data-testid="btn-selecionar-destino"]')
    await page.click('[data-testid="option-pedido-ped-exp-001"]')
    await page.click('[data-testid="btn-preview"]')

    await expect(page.locator('[data-testid="aviso-tipo-divergente"]')).toBeVisible()
    await page.check('[data-testid="checkbox-confirmar-tipos"]')
    await page.click('[data-testid="btn-confirmar-transferencia"]')

    await expect(page.locator('[data-testid="banner-sucesso"]')).toBeVisible({ timeout: 10_000 })
  })
})

// ── Fluxo 6 — Quantidade excedida ───────────────────────────────────────────

test.describe.skip('Fluxo 6 — Quantidade excedida', () => {
  test('F6-01: Alerta quando quantidade excede saldo', async ({ page }) => {
    await navegarParaLista(page)
    await abrirDetalhePedido(page, 'ped-001')
    await abrirModalTransferir(page, 'itm-001')

    await page.selectOption('[data-testid="select-cenario"]', 'split_novo_pedido')
    await page.fill('[data-testid="input-quantidade-origem"]', '9999')
    await page.click('[data-testid="btn-preview"]')

    await expect(page.locator('[data-testid="alerta-quantidade-excedida"]')).toBeVisible()
  })
})

// ── Fluxo 7 — Número do pedido duplicado ────────────────────────────────────

test.describe.skip('Fluxo 7 — Número do pedido duplicado', () => {
  test('F7-01: Número já em uso → mensagem de erro', async ({ page }) => {
    await navegarParaLista(page)
    await abrirDetalhePedido(page, 'ped-001')
    await abrirModalTransferir(page, 'itm-001')

    await page.selectOption('[data-testid="select-cenario"]', 'split_novo_pedido')
    await page.fill('[data-testid="input-quantidade-origem"]', '30')
    await page.fill('[data-testid="input-numero-pedido-novo"]', 'PED-EXISTENTE')
    await page.click('[data-testid="btn-preview"]')
    await page.click('[data-testid="btn-confirmar-transferencia"]')

    await expect(page.locator('text=já está em uso')).toBeVisible({ timeout: 10_000 })
  })
})

// ── Fluxo 8 — Reverter transferência ────────────────────────────────────────

test.describe.skip('Fluxo 8 — Reverter transferência', () => {
  test('F8-01: Reverter via histórico → quantidade restaurada', async ({ page }) => {
    await navegarParaLista(page)
    await abrirDetalhePedido(page, 'ped-001')

    await page.click('[data-testid="tab-historico-transferencias"]')
    await page.click('[data-testid="btn-reverter-transf-001"]')
    await page.click('[data-testid="btn-confirmar-reversao"]')

    await expect(page.locator('[data-testid="banner-reversao-sucesso"]')).toBeVisible({ timeout: 10_000 })
  })
})

// ── Fluxo 9 — Cenário irreversível ──────────────────────────────────────────

test.describe.skip('Fluxo 9 — Cenário irreversível', () => {
  test('F9-01: Redução simples → botão reverter desabilitado', async ({ page }) => {
    await navegarParaLista(page)
    await abrirDetalhePedido(page, 'ped-001')

    await page.click('[data-testid="tab-historico-transferencias"]')

    await expect(page.locator('[data-testid="btn-reverter-transf-reducao"]')).toBeDisabled()
  })
})

// ── Fluxo 10 — Histórico de transferências ──────────────────────────────────

test.describe.skip('Fluxo 10 — Histórico de transferências', () => {
  test('F10-01: Lista de transferências ordenada por data', async ({ page }) => {
    await navegarParaLista(page)
    await abrirDetalhePedido(page, 'ped-001')

    await page.click('[data-testid="tab-historico-transferencias"]')

    await expect(page.locator('[data-testid="lista-historico-transferencias"]')).toBeVisible()
  })
})

// ── Fluxo 11 — Validações de interface ──────────────────────────────────────

test.describe.skip('Fluxo 11 — Validações de interface', () => {
  test('F11-01: Campos obrigatórios → botão preview desabilitado', async ({ page }) => {
    await navegarParaLista(page)
    await abrirDetalhePedido(page, 'ped-001')
    await abrirModalTransferir(page, 'itm-001')

    await expect(page.locator('[data-testid="btn-preview"]')).toBeDisabled()
  })

  test('F11-02: Fechar modal e reabrir → dados limpos', async ({ page }) => {
    await navegarParaLista(page)
    await abrirDetalhePedido(page, 'ped-001')
    await abrirModalTransferir(page, 'itm-001')

    await page.click('[data-testid="btn-fechar-modal"]')
    await abrirModalTransferir(page, 'itm-001')

    const input = page.locator('[data-testid="input-quantidade-origem"]')
    await expect(input).toHaveValue('')
  })
})
