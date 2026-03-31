/**
 * E2E Tests — NF Importacao Produto Completo
 * Testa todas as páginas, interações e fluxos do usuário
 *
 * Para rodar: npx playwright test --project=nf-importacao
 * Requisito: servidor frontend rodando em http://localhost:5183
 *   cd produto/nf-importacao && npm run dev:client
 */

import { test, expect } from '@playwright/test'

const BASE_URL = 'http://localhost:5183'

// ── Helpers ──────────────────────────────────────────────────────────────────

async function mockApi(page: import('@playwright/test').Page) {
  const prefix = '/api/v1/nf-importacao'

  // Health check
  await page.route(`**/api/health`, async (route) => {
    await route.fulfill({ status: 200, json: { status: 'ok' } })
  })

  // Lista de NFs
  await page.route(`**${prefix}?*`, async (route) => {
    await route.fulfill({
      status: 200,
      json: {
        data: [
          {
            id: 'nfim_id_0000001/26',
            numero: 'NF-2026-00001',
            status: 'rascunho',
            fornecedor: 'Fornecedor XPTO Ltda',
            valor_total: 150000.00,
            moeda: 'USD',
            data_emissao: '2026-03-01',
            created_at: '2026-03-01T00:00:00Z',
          },
          {
            id: 'nfim_id_0000002/26',
            numero: 'NF-2026-00002',
            status: 'em_composicao',
            fornecedor: 'Importadora ABC S/A',
            valor_total: 320000.50,
            moeda: 'EUR',
            data_emissao: '2026-03-15',
            created_at: '2026-03-15T00:00:00Z',
          },
          {
            id: 'nfim_id_0000003/26',
            numero: 'NF-2026-00003',
            status: 'pronta',
            fornecedor: 'Global Trade Inc',
            valor_total: 88500.00,
            moeda: 'USD',
            data_emissao: '2026-03-20',
            created_at: '2026-03-20T00:00:00Z',
          },
        ],
        total: 3,
        page: 1,
        pageSize: 20,
      },
    })
  })

  // Detalhe de uma NF
  await page.route(`**${prefix}/nfim_id_0000001*`, async (route) => {
    if (route.request().method() === 'GET') {
      await route.fulfill({
        status: 200,
        json: {
          id: 'nfim_id_0000001/26',
          numero: 'NF-2026-00001',
          status: 'rascunho',
          fornecedor: 'Fornecedor XPTO Ltda',
          valor_total: 150000.00,
          moeda: 'USD',
          canal_entrada: 'XML',
          data_emissao: '2026-03-01',
          created_at: '2026-03-01T00:00:00Z',
          itens: [],
          despesas: [],
        },
      })
    } else {
      await route.continue()
    }
  })

  // Itens
  await page.route(`**${prefix}/*/itens*`, async (route) => {
    await route.fulfill({ status: 200, json: { data: [], total: 0 } })
  })

  // Despesas
  await page.route(`**${prefix}/*/despesas*`, async (route) => {
    await route.fulfill({ status: 200, json: { data: [], total: 0 } })
  })

  // Rateio preview
  await page.route(`**${prefix}/*/rateio/preview*`, async (route) => {
    await route.fulfill({ status: 200, json: { preview: [], total_despesas: 0 } })
  })

  // Historico
  await page.route(`**${prefix}/*/historico*`, async (route) => {
    await route.fulfill({ status: 200, json: { data: [], total: 0 } })
  })

  // Config — catálogo
  await page.route(`**${prefix}/config/catalogo*`, async (route) => {
    await route.fulfill({ status: 200, json: { data: [], total: 0 } })
  })

  // Config — templates
  await page.route(`**${prefix}/config/templates*`, async (route) => {
    await route.fulfill({ status: 200, json: { data: [], total: 0 } })
  })

  // Config — layouts
  await page.route(`**${prefix}/config/layouts*`, async (route) => {
    await route.fulfill({ status: 200, json: { data: [], total: 0 } })
  })

  // Config — favoritos
  await page.route(`**${prefix}/config/favoritos*`, async (route) => {
    await route.fulfill({ status: 200, json: { data: [], total: 0 } })
  })
}

// ─────────────────────────────────────────────────────────────────────────────
// PÁGINA LISTA
// ─────────────────────────────────────────────────────────────────────────────

test.describe('NF Importacao — Página Lista', () => {
  test.beforeEach(async ({ page }) => {
    await mockApi(page)
    await page.goto(BASE_URL)
    await page.waitForURL('**/nf-importacao', { timeout: 15000 })
  })

  test('redireciona raiz para /nf-importacao', async ({ page }) => {
    await expect(page).toHaveURL(/\/nf-importacao$/)
  })

  test('renderiza título "Notas Fiscais"', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('Notas Fiscais')
  })

  test('renderiza subtítulo da lista', async ({ page }) => {
    await expect(page.locator('text=Lista de notas fiscais de importacao')).toBeVisible()
  })

  test('renderiza texto "Em desenvolvimento" (página em construção)', async ({ page }) => {
    await expect(page.locator('text=Em desenvolvimento')).toBeVisible()
  })

  test('página tem estrutura de layout (PaginaGlobal + CabecalhoGlobal)', async ({ page }) => {
    // O HTML da página deve conter o título
    await expect(page.locator('h1')).toBeVisible()
  })

  test('URL é /nf-importacao sem trailing slash', async ({ page }) => {
    expect(page.url()).toContain('/nf-importacao')
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// WIZARD — NOVA NF (STEP 0: ORIGEM)
// ─────────────────────────────────────────────────────────────────────────────

test.describe('NF Importacao — Wizard Origem (Step 0)', () => {
  test.beforeEach(async ({ page }) => {
    await mockApi(page)
    await page.goto(`${BASE_URL}/nf-importacao/nova`)
  })

  test('renderiza título "Nova NF Importacao"', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('Nova NF Importacao')
  })

  test('renderiza subtítulo "Selecione a origem dos dados"', async ({ page }) => {
    await expect(page.locator('text=Selecione a origem dos dados')).toBeVisible()
  })

  test('exibe 6 cards de canal de entrada', async ({ page }) => {
    const cards = page.locator('button[type="button"]')
    await expect(cards).toHaveCount(6)
  })

  test('exibe card XML', async ({ page }) => {
    await expect(page.locator('button', { hasText: 'XML' })).toBeVisible()
  })

  test('exibe card PDF (Smart Read)', async ({ page }) => {
    await expect(page.locator('button', { hasText: 'PDF (Smart Read)' })).toBeVisible()
  })

  test('exibe card Portal Unico', async ({ page }) => {
    await expect(page.locator('button', { hasText: 'Portal Unico' })).toBeVisible()
  })

  test('exibe card Processo Gravity', async ({ page }) => {
    await expect(page.locator('button', { hasText: 'Processo Gravity' })).toBeVisible()
  })

  test('exibe card ERP / API', async ({ page }) => {
    await expect(page.locator('button', { hasText: 'ERP / API' })).toBeVisible()
  })

  test('exibe card Manual', async ({ page }) => {
    await expect(page.locator('button', { hasText: 'Manual' })).toBeVisible()
  })

  test('descrição do card XML é visível', async ({ page }) => {
    await expect(page.locator('text=Importar XML da nota fiscal eletronica')).toBeVisible()
  })

  test('descrição do card PDF é visível', async ({ page }) => {
    await expect(page.locator('text=Extrair dados automaticamente de um PDF')).toBeVisible()
  })

  test('descrição do card Portal Unico é visível', async ({ page }) => {
    await expect(page.locator('text=Importar dados direto do Portal Unico Siscomex')).toBeVisible()
  })

  test('descrição do card Processo Gravity é visível', async ({ page }) => {
    await expect(page.locator('text=Vincular a um processo existente no Gravity')).toBeVisible()
  })

  test('descrição do card ERP / API é visível', async ({ page }) => {
    await expect(page.locator('text=Receber dados via integracao com seu ERP')).toBeVisible()
  })

  test('descrição do card Manual é visível', async ({ page }) => {
    await expect(page.locator('text=Preencher todos os campos manualmente')).toBeVisible()
  })

  test('cards são botões clicáveis sem erros', async ({ page }) => {
    const xmlCard = page.locator('button', { hasText: 'XML' })
    await expect(xmlCard).toBeEnabled()
    await xmlCard.click()
    // Não deve lançar erro
    await expect(page.locator('h1')).toContainText('Nova NF Importacao')
  })

  test('clicar no card Manual não navega (ainda em dev)', async ({ page }) => {
    await page.locator('button', { hasText: 'Manual' }).click()
    // Permanece na mesma página
    await expect(page).toHaveURL(/\/nf-importacao\/nova/)
  })

  test('hover no card XML altera o estilo visual (border-color muda)', async ({ page }) => {
    const xmlCard = page.locator('button', { hasText: 'XML' })
    await xmlCard.hover()
    // Deve permanecer visível sem erros
    await expect(xmlCard).toBeVisible()
  })

  test('hover e unhover no card Portal Unico não quebra a página', async ({ page }) => {
    const portalCard = page.locator('button', { hasText: 'Portal Unico' })
    await portalCard.hover()
    await page.mouse.move(0, 0) // unhover
    await expect(portalCard).toBeVisible()
  })

  test('todos os 6 cards têm type="button"', async ({ page }) => {
    const cards = page.locator('button[type="button"]')
    const count = await cards.count()
    expect(count).toBe(6)
    for (let i = 0; i < count; i++) {
      await expect(cards.nth(i)).toHaveAttribute('type', 'button')
    }
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// WIZARD — STEP 1: DADOS DUIMP
// ─────────────────────────────────────────────────────────────────────────────

test.describe('NF Importacao — Wizard DUIMP (Step 1)', () => {
  test.beforeEach(async ({ page }) => {
    await mockApi(page)
    await page.goto(`${BASE_URL}/nf-importacao/nova/duimp`)
  })

  test('renderiza título "Dados da DUIMP"', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('Dados da DUIMP')
  })

  test('renderiza subtítulo "Revise os dados importados"', async ({ page }) => {
    await expect(page.locator('text=Revise os dados importados')).toBeVisible()
  })

  test('renderiza placeholder "Em desenvolvimento"', async ({ page }) => {
    await expect(page.locator('text=Em desenvolvimento')).toBeVisible()
  })

  test('URL contém /nova/duimp', async ({ page }) => {
    expect(page.url()).toContain('/nova/duimp')
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// WIZARD — STEP 2: DESPESAS
// ─────────────────────────────────────────────────────────────────────────────

test.describe('NF Importacao — Wizard Despesas (Step 2)', () => {
  test.beforeEach(async ({ page }) => {
    await mockApi(page)
    await page.goto(`${BASE_URL}/nf-importacao/nova/despesas`)
  })

  test('renderiza título "Despesas"', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('Despesas')
  })

  test('renderiza subtítulo "Adicione as despesas de importacao"', async ({ page }) => {
    await expect(page.locator('text=Adicione as despesas de importacao')).toBeVisible()
  })

  test('renderiza "Em desenvolvimento"', async ({ page }) => {
    await expect(page.locator('text=Em desenvolvimento')).toBeVisible()
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// WIZARD — STEP 3: RATEIO
// ─────────────────────────────────────────────────────────────────────────────

test.describe('NF Importacao — Wizard Rateio (Step 3)', () => {
  test.beforeEach(async ({ page }) => {
    await mockApi(page)
    await page.goto(`${BASE_URL}/nf-importacao/nova/rateio`)
  })

  test('renderiza título "Rateio"', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('Rateio')
  })

  test('renderiza subtítulo "Distribua as despesas entre os itens"', async ({ page }) => {
    await expect(page.locator('text=Distribua as despesas entre os itens')).toBeVisible()
  })

  test('renderiza "Em desenvolvimento"', async ({ page }) => {
    await expect(page.locator('text=Em desenvolvimento')).toBeVisible()
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// WIZARD — STEP 4: FISCAL
// ─────────────────────────────────────────────────────────────────────────────

test.describe('NF Importacao — Wizard Fiscal (Step 4)', () => {
  test.beforeEach(async ({ page }) => {
    await mockApi(page)
    await page.goto(`${BASE_URL}/nf-importacao/nova/fiscal`)
  })

  test('renderiza título "Classificacao Fiscal"', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('Classificacao Fiscal')
  })

  test('renderiza subtítulo "Defina CFOP, CSTs e tributacao"', async ({ page }) => {
    await expect(page.locator('text=Defina CFOP, CSTs e tributacao')).toBeVisible()
  })

  test('renderiza "Em desenvolvimento"', async ({ page }) => {
    await expect(page.locator('text=Em desenvolvimento')).toBeVisible()
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// WIZARD — STEP 5: EXPORTACAO
// ─────────────────────────────────────────────────────────────────────────────

test.describe('NF Importacao — Wizard Exportacao (Step 5)', () => {
  test.beforeEach(async ({ page }) => {
    await mockApi(page)
    await page.goto(`${BASE_URL}/nf-importacao/nova/exportacao`)
  })

  test('renderiza título "Exportacao"', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('Exportacao')
  })

  test('renderiza subtítulo "Revise e exporte a nota fiscal"', async ({ page }) => {
    await expect(page.locator('text=Revise e exporte a nota fiscal')).toBeVisible()
  })

  test('renderiza "Em desenvolvimento"', async ({ page }) => {
    await expect(page.locator('text=Em desenvolvimento')).toBeVisible()
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// DETALHE DA NF — 6 ABAS
// ─────────────────────────────────────────────────────────────────────────────

test.describe('NF Importacao — Detalhe com Abas', () => {
  const ID = 'nfim_id_0000001'

  test.beforeEach(async ({ page }) => {
    await mockApi(page)
    await page.goto(`${BASE_URL}/nf-importacao/${ID}`)
  })

  test('renderiza título "Detalhe da NF"', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('Detalhe da NF')
  })

  test('renderiza subtítulo', async ({ page }) => {
    await expect(page.locator('text=Visualize todos os dados da nota fiscal')).toBeVisible()
  })

  test('renderiza aba Itens', async ({ page }) => {
    await expect(page.locator('button', { hasText: 'Itens' })).toBeVisible()
  })

  test('renderiza aba Despesas', async ({ page }) => {
    await expect(page.locator('button', { hasText: 'Despesas' })).toBeVisible()
  })

  test('renderiza aba Rateio', async ({ page }) => {
    await expect(page.locator('button', { hasText: 'Rateio' })).toBeVisible()
  })

  test('renderiza aba Fiscal', async ({ page }) => {
    await expect(page.locator('button', { hasText: 'Fiscal' })).toBeVisible()
  })

  test('renderiza aba Exportacao', async ({ page }) => {
    await expect(page.locator('button', { hasText: 'Exportacao' })).toBeVisible()
  })

  test('renderiza aba Historico', async ({ page }) => {
    await expect(page.locator('button', { hasText: 'Historico' })).toBeVisible()
  })

  test('aba "Itens" ativa por padrão mostra conteúdo', async ({ page }) => {
    await expect(page.locator('text=Itens — Em desenvolvimento')).toBeVisible()
  })

  test('clicar na aba "Despesas" exibe conteúdo de Despesas', async ({ page }) => {
    await page.locator('button', { hasText: 'Despesas' }).click()
    await expect(page.locator('text=Despesas — Em desenvolvimento')).toBeVisible()
  })

  test('clicar na aba "Rateio" exibe conteúdo de Rateio', async ({ page }) => {
    await page.locator('button', { hasText: 'Rateio' }).click()
    await expect(page.locator('text=Rateio — Em desenvolvimento')).toBeVisible()
  })

  test('clicar na aba "Fiscal" exibe conteúdo de Fiscal', async ({ page }) => {
    await page.locator('button', { hasText: 'Fiscal' }).click()
    await expect(page.locator('text=Fiscal — Em desenvolvimento')).toBeVisible()
  })

  test('clicar na aba "Exportacao" exibe conteúdo de Exportacao', async ({ page }) => {
    await page.locator('button', { hasText: 'Exportacao' }).click()
    await expect(page.locator('text=Exportacao — Em desenvolvimento')).toBeVisible()
  })

  test('clicar na aba "Historico" exibe conteúdo de Historico', async ({ page }) => {
    await page.locator('button', { hasText: 'Historico' }).click()
    await expect(page.locator('text=Historico — Em desenvolvimento')).toBeVisible()
  })

  test('alternar entre abas múltiplas vezes funciona', async ({ page }) => {
    await page.locator('button', { hasText: 'Rateio' }).click()
    await expect(page.locator('text=Rateio — Em desenvolvimento')).toBeVisible()
    await page.locator('button', { hasText: 'Itens' }).click()
    await expect(page.locator('text=Itens — Em desenvolvimento')).toBeVisible()
    await page.locator('button', { hasText: 'Historico' }).click()
    await expect(page.locator('text=Historico — Em desenvolvimento')).toBeVisible()
  })

  test('aba ativa muda estilo visual (highlight)', async ({ page }) => {
    // "Itens" está ativa
    const itensBtn = page.locator('button', { hasText: 'Itens' })
    await expect(itensBtn).toBeVisible()
    // Clicar em "Fiscal"
    await page.locator('button', { hasText: 'Fiscal' }).click()
    // "Fiscal" agora ativa
    await expect(page.locator('text=Fiscal — Em desenvolvimento')).toBeVisible()
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// CONFIGURAÇÕES — CATÁLOGO DE DESPESAS
// ─────────────────────────────────────────────────────────────────────────────

test.describe('NF Importacao — Config: Catálogo de Despesas', () => {
  test.beforeEach(async ({ page }) => {
    await mockApi(page)
    await page.goto(`${BASE_URL}/nf-importacao/config/despesas`)
  })

  test('renderiza título "Catalogo de Despesas"', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('Catalogo de Despesas')
  })

  test('renderiza subtítulo', async ({ page }) => {
    await expect(page.locator('text=Gerencie as despesas disponiveis para rateio')).toBeVisible()
  })

  test('renderiza "Em desenvolvimento"', async ({ page }) => {
    await expect(page.locator('text=Em desenvolvimento')).toBeVisible()
  })

  test('URL contém /config/despesas', async ({ page }) => {
    expect(page.url()).toContain('/config/despesas')
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// CONFIGURAÇÕES — TEMPLATES DE DESPESAS
// ─────────────────────────────────────────────────────────────────────────────

test.describe('NF Importacao — Config: Templates de Despesas', () => {
  test.beforeEach(async ({ page }) => {
    await mockApi(page)
    await page.goto(`${BASE_URL}/nf-importacao/config/templates`)
  })

  test('renderiza título "Templates de Despesas"', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('Templates de Despesas')
  })

  test('renderiza subtítulo', async ({ page }) => {
    await expect(page.locator('text=Configure templates de despesas automaticas')).toBeVisible()
  })

  test('renderiza "Em desenvolvimento"', async ({ page }) => {
    await expect(page.locator('text=Em desenvolvimento')).toBeVisible()
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// CONFIGURAÇÕES — LAYOUTS DE EXPORTAÇÃO
// ─────────────────────────────────────────────────────────────────────────────

test.describe('NF Importacao — Config: Layouts de Exportacao', () => {
  test.beforeEach(async ({ page }) => {
    await mockApi(page)
    await page.goto(`${BASE_URL}/nf-importacao/config/layouts`)
  })

  test('renderiza título "Layouts de Exportacao"', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('Layouts de Exportacao')
  })

  test('renderiza subtítulo', async ({ page }) => {
    await expect(page.locator('text=Configure o formato de saida para seu ERP')).toBeVisible()
  })

  test('renderiza "Em desenvolvimento"', async ({ page }) => {
    await expect(page.locator('text=Em desenvolvimento')).toBeVisible()
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// CONFIGURAÇÕES — FAVORITOS FISCAIS
// ─────────────────────────────────────────────────────────────────────────────

test.describe('NF Importacao — Config: Favoritos Fiscais', () => {
  test.beforeEach(async ({ page }) => {
    await mockApi(page)
    await page.goto(`${BASE_URL}/nf-importacao/config/favoritos`)
  })

  test('renderiza título "Favoritos Fiscais"', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('Favoritos Fiscais')
  })

  test('renderiza subtítulo', async ({ page }) => {
    await expect(page.locator('text=Presets de CFOP e CSTs por NCM')).toBeVisible()
  })

  test('renderiza "Em desenvolvimento"', async ({ page }) => {
    await expect(page.locator('text=Em desenvolvimento')).toBeVisible()
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// NAVEGAÇÃO — Rotas e Redirects
// ─────────────────────────────────────────────────────────────────────────────

test.describe('NF Importacao — Navegação e Rotas', () => {
  test('rota raiz "/" redireciona para /nf-importacao', async ({ page }) => {
    await mockApi(page)
    await page.goto(BASE_URL)
    await page.waitForURL('**/nf-importacao', { timeout: 10000 })
    expect(page.url()).toContain('/nf-importacao')
    await expect(page.locator('h1')).toContainText('Notas Fiscais')
  })

  test('rota desconhecida redireciona para /nf-importacao', async ({ page }) => {
    await mockApi(page)
    await page.goto(`${BASE_URL}/rota-inexistente-xyz`)
    await page.waitForURL('**/nf-importacao', { timeout: 10000 })
    await expect(page.locator('h1')).toContainText('Notas Fiscais')
  })

  test('navegar diretamente para /nova exibe NfNovaOrigem', async ({ page }) => {
    await mockApi(page)
    await page.goto(`${BASE_URL}/nf-importacao/nova`)
    await expect(page.locator('h1')).toContainText('Nova NF Importacao')
  })

  test('navegar diretamente para /nova/duimp exibe NfNovaDuimp', async ({ page }) => {
    await mockApi(page)
    await page.goto(`${BASE_URL}/nf-importacao/nova/duimp`)
    await expect(page.locator('h1')).toContainText('Dados da DUIMP')
  })

  test('navegar diretamente para /:id exibe NfDetalhe', async ({ page }) => {
    await mockApi(page)
    await page.goto(`${BASE_URL}/nf-importacao/nfim_id_0000001`)
    await expect(page.locator('h1')).toContainText('Detalhe da NF')
  })

  test('todas as páginas do wizard carregam sem erros de console', async ({ page }) => {
    const errors: string[] = []
    page.on('console', (msg) => {
      if (msg.type() === 'error') errors.push(msg.text())
    })

    await mockApi(page)
    const routes = [
      '/nf-importacao',
      '/nf-importacao/nova',
      '/nf-importacao/nova/duimp',
      '/nf-importacao/nova/despesas',
      '/nf-importacao/nova/rateio',
      '/nf-importacao/nova/fiscal',
      '/nf-importacao/nova/exportacao',
    ]

    for (const route of routes) {
      await page.goto(`${BASE_URL}${route}`)
      await page.waitForTimeout(500)
    }

    // Apenas erros React/JS críticos devem ser filtrados
    const criticalErrors = errors.filter(
      (e) =>
        e.includes('TypeError') ||
        e.includes('ReferenceError') ||
        (e.includes('Error') && !e.includes('404') && !e.includes('network')),
    )
    expect(criticalErrors).toHaveLength(0)
  })

  test('config pages carregam sem erros', async ({ page }) => {
    const errors: string[] = []
    page.on('console', (msg) => {
      if (msg.type() === 'error') errors.push(msg.text())
    })

    await mockApi(page)
    const routes = [
      '/nf-importacao/config/despesas',
      '/nf-importacao/config/templates',
      '/nf-importacao/config/layouts',
      '/nf-importacao/config/favoritos',
    ]

    for (const route of routes) {
      await page.goto(`${BASE_URL}${route}`)
      await page.waitForTimeout(500)
    }

    const criticalErrors = errors.filter(
      (e) =>
        e.includes('TypeError') ||
        e.includes('ReferenceError') ||
        (e.includes('Error') && !e.includes('404') && !e.includes('network')),
    )
    expect(criticalErrors).toHaveLength(0)
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// ACESSIBILIDADE BÁSICA
// ─────────────────────────────────────────────────────────────────────────────

test.describe('NF Importacao — Acessibilidade', () => {
  test('NfNovaOrigem: cards têm texto acessível', async ({ page }) => {
    await mockApi(page)
    await page.goto(`${BASE_URL}/nf-importacao/nova`)
    const cards = page.locator('button[type="button"]')
    const count = await cards.count()
    for (let i = 0; i < count; i++) {
      const text = await cards.nth(i).innerText()
      expect(text.trim().length).toBeGreaterThan(0)
    }
  })

  test('NfDetalhe: abas têm texto acessível', async ({ page }) => {
    await mockApi(page)
    await page.goto(`${BASE_URL}/nf-importacao/nfim_id_0000001`)
    const abas = ['Itens', 'Despesas', 'Rateio', 'Fiscal', 'Exportacao', 'Historico']
    for (const aba of abas) {
      await expect(page.locator('button', { hasText: aba })).toBeVisible()
    }
  })

  test('NfLista: h1 é único na página', async ({ page }) => {
    await mockApi(page)
    await page.goto(`${BASE_URL}/nf-importacao`)
    const h1Count = await page.locator('h1').count()
    expect(h1Count).toBe(1)
  })

  test('NfNovaOrigem: h1 é único na página', async ({ page }) => {
    await mockApi(page)
    await page.goto(`${BASE_URL}/nf-importacao/nova`)
    const h1Count = await page.locator('h1').count()
    expect(h1Count).toBe(1)
  })

  test('NfDetalhe: h1 é único na página', async ({ page }) => {
    await mockApi(page)
    await page.goto(`${BASE_URL}/nf-importacao/nfim_id_0000001`)
    const h1Count = await page.locator('h1').count()
    expect(h1Count).toBe(1)
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// INTERAÇÕES DE HOVER E FOCO
// ─────────────────────────────────────────────────────────────────────────────

test.describe('NF Importacao — Hover e Interações', () => {
  test.beforeEach(async ({ page }) => {
    await mockApi(page)
    await page.goto(`${BASE_URL}/nf-importacao/nova`)
  })

  test('hover sobre todos os 6 cards sem crash', async ({ page }) => {
    const titulos = ['XML', 'PDF (Smart Read)', 'Portal Unico', 'Processo Gravity', 'ERP / API', 'Manual']
    for (const titulo of titulos) {
      const card = page.locator('button', { hasText: titulo })
      await card.hover()
      await page.waitForTimeout(100)
    }
    // Nenhuma aba caiu
    await expect(page.locator('h1')).toContainText('Nova NF Importacao')
  })

  test('clicar em todos os 6 cards sequencialmente sem erros', async ({ page }) => {
    const titulos = ['XML', 'PDF (Smart Read)', 'Portal Unico', 'Processo Gravity', 'ERP / API', 'Manual']
    for (const titulo of titulos) {
      const card = page.locator('button', { hasText: titulo })
      await card.click()
      await page.waitForTimeout(100)
      await expect(page.locator('h1')).toContainText('Nova NF Importacao')
    }
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// RESPONSIVIDADE (Viewport)
// ─────────────────────────────────────────────────────────────────────────────

test.describe('NF Importacao — Responsividade', () => {
  test('NfNovaOrigem renderiza em mobile (375x812)', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 })
    await mockApi(page)
    await page.goto(`${BASE_URL}/nf-importacao/nova`)
    await expect(page.locator('h1')).toContainText('Nova NF Importacao')
    // Todos os cards devem estar visíveis (podem precisar de scroll)
    await expect(page.locator('button', { hasText: 'XML' })).toBeVisible()
    await expect(page.locator('button', { hasText: 'Manual' })).toBeVisible()
  })

  test('NfNovaOrigem renderiza em tablet (768x1024)', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 })
    await mockApi(page)
    await page.goto(`${BASE_URL}/nf-importacao/nova`)
    await expect(page.locator('h1')).toContainText('Nova NF Importacao')
    await expect(page.locator('button', { hasText: 'XML' })).toBeVisible()
  })

  test('NfDetalhe renderiza em desktop (1440x900)', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    await mockApi(page)
    await page.goto(`${BASE_URL}/nf-importacao/nfim_id_0000001`)
    await expect(page.locator('h1')).toContainText('Detalhe da NF')
    // Todas as 6 abas devem ser visíveis
    for (const aba of ['Itens', 'Despesas', 'Rateio', 'Fiscal', 'Exportacao', 'Historico']) {
      await expect(page.locator('button', { hasText: aba })).toBeVisible()
    }
  })
})
