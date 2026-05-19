/**
 * SCAFFOLD — TST-E2E-PEDIDO-CONSOLIDAR-001
 *
 * Testes E2E para consolidação de pedidos.
 * Todos os fluxos estão em describe.skip até que o ambiente
 * Playwright + staging esteja configurado e o plano seja aprovado.
 *
 * Locators usam data-testid (padrão Gravity).
 * Plano completo: consolidar-e2e.md
 */

import { test, expect, type Page } from '@playwright/test'

const BASE_URL = process.env.BASE_URL ?? 'http://localhost:5180'
const ROTA_LISTA = '/produto/pedido/pedidos/lista'

// ── Helpers ──────────────────────────────────────────────────────────────────

async function navegarParaLista(page: Page) {
  await page.goto(`${BASE_URL}${ROTA_LISTA}`)
  await page.waitForSelector('[data-testid="tabela-pedidos"]', { timeout: 10_000 })
}

async function selecionarPedidos(page: Page, ids: string[]) {
  for (const id of ids) {
    await page.click(`[data-testid="checkbox-pedido-${id}"]`)
  }
}

async function abrirModalConsolidar(page: Page) {
  await page.click('[data-testid="btn-consolidar"]')
  await page.waitForSelector('[data-testid="modal-consolidar-pedidos"]', { timeout: 5_000 })
}

// ── Fluxo 1 — Happy path completo ───────────────────────────────────────────

test.describe.skip('Fluxo 1 — Consolidar 2 pedidos (happy path)', () => {
  test('F1-01: Selecionar 2 pedidos e abrir modal', async ({ page }) => {
    await navegarParaLista(page)
    await selecionarPedidos(page, ['ped-001', 'ped-002'])
    await abrirModalConsolidar(page)

    await expect(page.locator('[data-testid="modal-consolidar-pedidos"]')).toBeVisible()
  })

  test('F1-02: Passo 1 — número pré-preenchido no formato PO-CONS', async ({ page }) => {
    await navegarParaLista(page)
    await selecionarPedidos(page, ['ped-001', 'ped-002'])
    await abrirModalConsolidar(page)

    const input = page.locator('[data-testid="input-numero-pedido-consolidado"]')
    await expect(input).toHaveValue(/PO-CONS-\d{4}\/\d{3}/)
  })

  test('F1-03: Passo 1 — cards de estatísticas visíveis', async ({ page }) => {
    await navegarParaLista(page)
    await selecionarPedidos(page, ['ped-001', 'ped-002'])
    await abrirModalConsolidar(page)

    await expect(page.locator('[data-testid="card-estatisticas"]')).toBeVisible()
  })

  test('F1-04: Avançar até Passo 3 e confirmar → sucesso', async ({ page }) => {
    await navegarParaLista(page)
    await selecionarPedidos(page, ['ped-001', 'ped-002'])
    await abrirModalConsolidar(page)

    await page.click('[data-testid="btn-proximo"]')
    await page.click('[data-testid="btn-proximo"]')
    await page.click('[data-testid="btn-confirmar-consolidacao"]')

    await expect(page.locator('[data-testid="banner-sucesso"]')).toBeVisible({ timeout: 10_000 })
  })
})

// ── Fluxo 2 — Fusão de itens por part_number ────────────────────────────────

test.describe.skip('Fluxo 2 — Fusão de itens por part_number', () => {
  test('F2-01: Marcar fusão e verificar merge de quantidades', async ({ page }) => {
    await navegarParaLista(page)
    await selecionarPedidos(page, ['ped-001', 'ped-002'])
    await abrirModalConsolidar(page)

    await page.check('[data-testid="checkbox-fundir-itens"]')
    await page.click('[data-testid="btn-proximo"]')
    await page.click('[data-testid="btn-proximo"]')
    await page.click('[data-testid="btn-confirmar-consolidacao"]')

    await expect(page.locator('[data-testid="banner-sucesso"]')).toBeVisible({ timeout: 10_000 })
  })
})

// ── Fluxo 3 — Bloqueio por tipo misto ───────────────────────────────────────

test.describe.skip('Fluxo 3 — Bloqueio por tipo de operação misto', () => {
  test('F3-01: Importação + exportação → banner de conflito', async ({ page }) => {
    await navegarParaLista(page)
    await selecionarPedidos(page, ['ped-imp-001', 'ped-exp-001'])
    await abrirModalConsolidar(page)

    await expect(page.locator('[data-testid="banner-conflito-tipo"]')).toBeVisible()
  })
})

// ── Fluxo 4 — Divergências ──────────────────────────────────────────────────

test.describe.skip('Fluxo 4 — Detecção e resolução de divergências', () => {
  test('F4-01: Campos divergentes mostram badge e dropdown', async ({ page }) => {
    await navegarParaLista(page)
    await selecionarPedidos(page, ['ped-001', 'ped-002'])
    await abrirModalConsolidar(page)
    await page.click('[data-testid="btn-proximo"]')

    await expect(page.locator('[data-testid="badge-divergente"]').first()).toBeVisible()
  })

  test('F4-02: Filtrar por divergentes', async ({ page }) => {
    await navegarParaLista(page)
    await selecionarPedidos(page, ['ped-001', 'ped-002'])
    await abrirModalConsolidar(page)
    await page.click('[data-testid="btn-proximo"]')

    await page.click('[data-testid="filtro-divergentes"]')
    const iguais = page.locator('[data-testid="badge-igual"]')
    await expect(iguais).toHaveCount(0)
  })
})

// ── Fluxo 5 — Sem divergências ──────────────────────────────────────────────

test.describe.skip('Fluxo 5 — Todos campos iguais', () => {
  test('F5-01: Nenhum campo divergente → passo 2 mostra apenas iguais', async ({ page }) => {
    await navegarParaLista(page)
    await selecionarPedidos(page, ['ped-igual-001', 'ped-igual-002'])
    await abrirModalConsolidar(page)
    await page.click('[data-testid="btn-proximo"]')

    const divergentes = page.locator('[data-testid="badge-divergente"]')
    await expect(divergentes).toHaveCount(0)
  })
})

// ── Fluxo 6 — Número customizado ────────────────────────────────────────────

test.describe.skip('Fluxo 6 — Número do pedido customizado', () => {
  test('F6-01: Digitar número customizado e confirmar', async ({ page }) => {
    await navegarParaLista(page)
    await selecionarPedidos(page, ['ped-001', 'ped-002'])
    await abrirModalConsolidar(page)

    const input = page.locator('[data-testid="input-numero-pedido-consolidado"]')
    await input.clear()
    await input.fill('MINHA-CONS-001')

    await page.click('[data-testid="btn-proximo"]')
    await page.click('[data-testid="btn-proximo"]')
    await page.click('[data-testid="btn-confirmar-consolidacao"]')

    await expect(page.locator('[data-testid="banner-sucesso"]')).toBeVisible({ timeout: 10_000 })
  })
})

// ── Fluxo 7 — Número duplicado ──────────────────────────────────────────────

test.describe.skip('Fluxo 7 — Número do pedido duplicado', () => {
  test('F7-01: Número já em uso → mensagem de erro', async ({ page }) => {
    await navegarParaLista(page)
    await selecionarPedidos(page, ['ped-001', 'ped-002'])
    await abrirModalConsolidar(page)

    const input = page.locator('[data-testid="input-numero-pedido-consolidado"]')
    await input.clear()
    await input.fill('PED-EXISTENTE')

    await page.click('[data-testid="btn-proximo"]')
    await page.click('[data-testid="btn-proximo"]')
    await page.click('[data-testid="btn-confirmar-consolidacao"]')

    await expect(page.locator('text=já está em uso')).toBeVisible({ timeout: 10_000 })
  })
})

// ── Fluxo 8 — Consolidar 3+ pedidos ─────────────────────────────────────────

test.describe.skip('Fluxo 8 — Consolidar 3+ pedidos', () => {
  test('F8-01: Selecionar 3 pedidos e consolidar', async ({ page }) => {
    await navegarParaLista(page)
    await selecionarPedidos(page, ['ped-001', 'ped-002', 'ped-003'])
    await abrirModalConsolidar(page)

    await expect(page.locator('[data-testid="modal-consolidar-pedidos"]')).toBeVisible()
  })
})

// ── Fluxo 9 — Validações de interface ───────────────────────────────────────

test.describe.skip('Fluxo 9 — Validações de interface', () => {
  test('F9-01: Menos de 2 pedidos → botão Consolidar desabilitado', async ({ page }) => {
    await navegarParaLista(page)
    await selecionarPedidos(page, ['ped-001'])

    await expect(page.locator('[data-testid="btn-consolidar"]')).toBeDisabled()
  })

  test('F9-02: Cancelar consolidação → nenhum pedido alterado', async ({ page }) => {
    await navegarParaLista(page)
    await selecionarPedidos(page, ['ped-001', 'ped-002'])
    await abrirModalConsolidar(page)

    await page.click('[data-testid="btn-fechar-modal"]')
    await expect(page.locator('[data-testid="modal-consolidar-pedidos"]')).not.toBeVisible()
  })
})

// ── Fluxo 10 — Pedidos originais após consolidação ─────────────────────────

test.describe.skip('Fluxo 10 — Rastreabilidade pós-consolidação', () => {
  test('F10-01: Pedidos originais não visíveis após consolidação', async ({ page }) => {
    await navegarParaLista(page)
    // Após consolidação bem-sucedida, originais devem sumir
    await expect(page.locator('[data-testid="row-ped-001"]')).not.toBeVisible()
    await expect(page.locator('[data-testid="row-ped-002"]')).not.toBeVisible()
  })
})

// ── Fluxo 11 — Cancelamento e navegação ─────────────────────────────────────

test.describe.skip('Fluxo 11 — Navegação do wizard', () => {
  test('F11-01: Voltar do Passo 2 para Passo 1 preserva dados', async ({ page }) => {
    await navegarParaLista(page)
    await selecionarPedidos(page, ['ped-001', 'ped-002'])
    await abrirModalConsolidar(page)

    const input = page.locator('[data-testid="input-numero-pedido-consolidado"]')
    await input.clear()
    await input.fill('NUMERO-CUSTOM')

    await page.click('[data-testid="btn-proximo"]')
    await page.click('[data-testid="btn-voltar"]')

    await expect(input).toHaveValue('NUMERO-CUSTOM')
  })

  test('F11-02: Fechar e reabrir modal → dados limpos', async ({ page }) => {
    await navegarParaLista(page)
    await selecionarPedidos(page, ['ped-001', 'ped-002'])
    await abrirModalConsolidar(page)

    await page.click('[data-testid="btn-fechar-modal"]')
    await selecionarPedidos(page, ['ped-001', 'ped-002'])
    await abrirModalConsolidar(page)

    const input = page.locator('[data-testid="input-numero-pedido-consolidado"]')
    await expect(input).toHaveValue(/PO-CONS/)
  })
})
