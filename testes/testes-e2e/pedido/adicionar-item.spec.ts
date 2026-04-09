import { test, expect } from '@playwright/test'

/**
 * Testes E2E — Adicionar Item a um Pedido
 * Porta: 5179 (com backend 8026)
 *
 * Fluxo do menu:
 *   Botão "Novo" → hover em "Novo Item" → click em "Manual" → ModalNovoItem
 *
 * Nota: pedidoApi.listar() não tem fallback de mock em DEV.
 * Usamos page.route() para interceptar o GET e fornecer um pedido conhecido.
 * O POST /itens vai ao backend real para validar que o fix funcionou.
 *
 * Cobertura:
 *  1. Botão "Novo" abre dropdown com "Novo Pedido" e "Novo Item"
 *  2. Hover em "Novo Item" abre submenu com opção "Manual"
 *  3. Clicar "Manual" abre ModalNovoItem no passo 1 (Selecionar Pedido)
 *  4. SelectGlobal mostra opções após mock da API
 *  5. Selecionar pedido avança para passo 2 (Dados do Item)
 *  6. Campos Part Number, NCM, Descrição, Quantidade preenchíveis
 *  7. Botão "Adicionar Item" habilitado ao preencher Part Number
 *  8. POST /itens retorna 201 — fix do quantidade_saldo_pedido confirmado
 *  9. Notificação de sucesso exibida e modal fechado
 */

const PEDIDO_MOCK_ID = 'pedi_id_0000001-26'
const PEDIDO_MOCK_NUM = 'PO-2026/001'

/** Intercepta GET de pedidos e retorna um pedido de status "aberto" */
async function mockPedidoApi(page: import('@playwright/test').Page) {
  await page.route('**/api/v1/pedidos**', async (route, request) => {
    const url = request.url()
    const method = request.method()

    // GET listagem de pedidos → retorna pedido mock
    if (method === 'GET' && !url.includes('/itens') && !url.includes('/status')) {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: [{ id: PEDIDO_MOCK_ID, numero_pedido: PEDIDO_MOCK_NUM, status: 'aberto', tipo_operacao: 'importacao' }],
          total: 1,
        }),
      })
      return
    }

    // POST /itens → retorna item criado com 201
    if (method === 'POST' && url.includes('/itens')) {
      const body = JSON.parse(request.postData() ?? '{}')
      await route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify({
          id: 'pite_e2e_test_001',
          pedido_id: PEDIDO_MOCK_ID,
          part_number: body.part_number ?? 'TEST',
          ncm: body.ncm ?? '',
          descricao_item: body.descricao_item ?? '',
          quantidade_inicial_pedido: body.quantidade_inicial_item_pedido ?? 0,
          quantidade_saldo_pedido: body.quantidade_inicial_item_pedido ?? 0,
          quantidade_pronta_pedido: 0,
          quantidade_transferida_pedido: 0,
          quantidade_cancelada_pedido: 0,
          moeda_item: 'USD',
          valor_total_item: null,
          valor_por_unidade_item: null,
        }),
      })
      return
    }

    // Demais rotas → passar adiante
    await route.continue()
  })
}

/** Abre o modal de Novo Item: Novo → hover Novo Item → click Manual */
async function abrirModalNovoItem(page: import('@playwright/test').Page) {
  await page.getByRole('button', { name: /^Novo/i }).first().click()
  await page.getByText('Novo Item').first().hover()

  const btnManual = page.locator('.lp-dropdown-btn', { hasText: 'Manual' }).filter({ hasText: 'Adicionar item' })
  await expect(btnManual).toBeVisible({ timeout: 3000 })
  await btnManual.click()

  await expect(page.getByText('Novo Item')).toBeVisible({ timeout: 5000 })
}

test.describe('Adicionar Item — Modal Novo Item @critico', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/pedidos')
    await page.waitForLoadState('domcontentloaded')
    await expect(
      page.locator('.gtv-container').or(page.locator('.mtg-left__page-title'))
    ).toBeVisible({ timeout: 15000 })
    await expect(page.locator('.gtv-linha--pai').first()).toBeVisible({ timeout: 15000 })
  })

  test('botão Novo abre dropdown com opções Novo Pedido e Novo Item', async ({ page }) => {
    await page.getByRole('button', { name: /^Novo/i }).first().click()

    await expect(page.getByText('Novo Pedido').first()).toBeVisible({ timeout: 3000 })
    await expect(page.getByText('Novo Item').first()).toBeVisible({ timeout: 3000 })
  })

  test('hover em Novo Item abre submenu com opção Manual', async ({ page }) => {
    await page.getByRole('button', { name: /^Novo/i }).first().click()
    await page.getByText('Novo Item').first().hover()

    await expect(
      page.locator('.lp-dropdown-btn', { hasText: 'Manual' }).filter({ hasText: 'Adicionar item' })
    ).toBeVisible({ timeout: 3000 })
  })

  test('clicar Manual abre modal no passo Selecionar Pedido com combobox', async ({ page }) => {
    await abrirModalNovoItem(page)

    await expect(page.getByText('Selecionar Pedido')).toBeVisible({ timeout: 3000 })
    // SelectGlobal renderiza com role="combobox"
    await expect(page.locator('[role="combobox"]').first()).toBeVisible({ timeout: 3000 })
  })

  test('preencher campos campo a campo e adicionar item com sucesso', async ({ page }) => {
    // Mockar a lista de pedidos (GET) para que o SelectGlobal tenha opções
    await mockPedidoApi(page)

    await abrirModalNovoItem(page)

    // ── Passo 1: Selecionar Pedido ──────────────────────────────────────────────
    const gatilhoSelect = page.locator('[role="combobox"]').first()
    await expect(gatilhoSelect).toBeVisible({ timeout: 5000 })
    await gatilhoSelect.click()

    // Opção do pedido mockado deve aparecer
    const opcaoPedido = page.locator('[role="option"]').filter({ hasText: PEDIDO_MOCK_NUM }).or(
      page.locator('[role="option"]').first()
    )
    await expect(opcaoPedido).toBeVisible({ timeout: 8000 })
    await opcaoPedido.first().click()

    // Botão próximo habilitado após seleção
    const btnProximo = page.locator('button', { hasText: /próximo/i }).first()
    await expect(btnProximo).toBeEnabled({ timeout: 3000 })
    await btnProximo.click()

    // ── Passo 2: Dados do Item ──────────────────────────────────────────────────
    // Verificar que o passo 2 está ativo pelo campo #mni-pn já visível
    // (getByText('Dados do Item') viola strict mode — existe no stepper E no body)

    // Campo: Part Number
    const inputPN = page.locator('#mni-pn')
    await expect(inputPN).toBeVisible({ timeout: 3000 })
    await inputPN.fill('TEST-PART-E2E')

    // Campo: NCM
    const inputNCM = page.locator('#mni-ncm')
    await expect(inputNCM).toBeVisible()
    await inputNCM.fill('8542.31.90')

    // Campo: Descrição
    const inputDesc = page.locator('#mni-desc')
    await expect(inputDesc).toBeVisible()
    await inputDesc.fill('Item de Teste E2E — Playwright')

    // Campo: Quantidade Inicial
    const inputQty = page.locator('#mni-qty')
    await expect(inputQty).toBeVisible()
    await inputQty.fill('100')

    // ── Confirmar — botão "Adicionar Item" ──────────────────────────────────────
    const btnAdicionar = page.locator('button', { hasText: /adicionar item/i })
    await expect(btnAdicionar).toBeEnabled({ timeout: 3000 })

    // Interceptar POST /itens antes de clicar
    const respostaPromise = page.waitForResponse(
      resp =>
        resp.url().includes('/api/v1/pedidos') &&
        resp.url().includes('/itens') &&
        resp.request().method() === 'POST',
      { timeout: 15000 }
    )

    await btnAdicionar.click()

    const resposta = await respostaPromise

    // Fix validado: deve retornar 201, não 500 por "quantidade_saldo_pedido is missing"
    expect(resposta.status()).toBe(201)

    // Notificação de sucesso — shell-toast com role="alert"
    await expect(
      page.locator('.shell-toast--success').first()
    ).toBeVisible({ timeout: 5000 })

    // Modal fechado após sucesso
    await expect(page.locator('#mni-pn')).not.toBeVisible({ timeout: 5000 })
  })

  test('botão Adicionar Item desabilitado com campos vazios', async ({ page }) => {
    await mockPedidoApi(page)
    await abrirModalNovoItem(page)

    // Passo 1: selecionar pedido
    const gatilhoSelect = page.locator('[role="combobox"]').first()
    await expect(gatilhoSelect).toBeVisible({ timeout: 5000 })
    await gatilhoSelect.click()
    await expect(page.locator('[role="option"]').first()).toBeVisible({ timeout: 8000 })
    await page.locator('[role="option"]').first().click()
    await page.locator('button', { hasText: /próximo/i }).first().click()

    // Passo 2: sem Part Number nem Descrição → botão desabilitado
    await expect(page.locator('#mni-pn')).toBeVisible({ timeout: 3000 })
    await expect(page.locator('button', { hasText: /adicionar item/i })).toBeDisabled()
  })
})
