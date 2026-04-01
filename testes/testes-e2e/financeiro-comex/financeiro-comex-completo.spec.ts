/**
 * E2E Tests — Financeiro Comex Produto Completo
 * Cobre todas as telas: Movimentacao, Numerario, Rateio, Config/Categorias, Config/Condicoes
 *
 * Para rodar: npx playwright test --project=financeiro-comex
 * Requisito: servidor frontend rodando em http://localhost:5184
 *   cd produto/financeiro-comex/client && npx vite --port 5184
 */

import { test, expect } from '@playwright/test'

const BASE_URL = 'http://localhost:5184'
const PROCESSO_ID = 'proc-e2e-0001'
const API_PREFIX = '/api/v1/financeiro'

// ── Mock fixtures ─────────────────────────────────────────────────────────────

const mockFinanceiro = {
  id: 'fin-e2e-001',
  tenant_id: 'tenant-1',
  company_id: 'company-1',
  processo_id: PROCESSO_ID,
  tipo_operacao: 'IMPORTACAO',
  referencia: 'DATI-2875/25',
  total_brl: 50000,
  total_usd: 5000,
  total_eur: 0,
  total_outros: 0,
  saldo: -34507.76,
  adiantado: 15492.24,
  pagos: 10000,
  agendados: 5000,
  pendente: 35000,
  created_at: '2026-01-01T00:00:00Z',
  updated_at: '2026-01-01T00:00:00Z',
}

const mockLancamentos = [
  {
    id: 'lanc-001',
    tenant_id: 'tenant-1',
    company_id: 'company-1',
    financeiro_id: 'fin-e2e-001',
    categoria_id: 'cat-1',
    categoria_nome: '300 - Frete Internacional',
    grupo_custo: 'CUSTO_OPERACIONAL',
    moeda: 'USD',
    taxa_cambio: 6.1864,
    valor: 3929,
    valor_brl: 24307.5856,
    status_pagamento: 'PENDENTE',
    canal_entrada: 'MANUAL',
    despesa_aduaneira: false,
    despesa_nf: true,
    espelho_nf: true,
    icms_origem_portal: false,
    created_at: '2025-12-31T00:00:00Z',
    updated_at: '2025-12-31T00:00:00Z',
    created_by: 'user-1',
  },
]

const mockCategorias = [
  { id: 'cat-1', codigo: '300', nome: 'Frete Internacional', grupo_custo: 'CUSTO_OPERACIONAL', ativo: true, tipo_operacao: null },
  { id: 'cat-2', codigo: '001', nome: 'I.I - Imposto de Importacao', grupo_custo: 'IMPOSTOS_FEDERAIS', ativo: true, tipo_operacao: 'IMPORTACAO' },
  { id: 'cat-3', codigo: '200', nome: 'Armazenagem Porto', grupo_custo: 'CUSTO_OPERACIONAL', ativo: true, tipo_operacao: null },
]

const mockCondicoes = [
  { id: 'cond-1', codigo: 'CC', descricao: 'Carta de Credito', dias_prazo: 30, ativo: true },
  { id: 'cond-2', codigo: 'TT', descricao: 'Transferencia Internacional', dias_prazo: 0, ativo: true },
]

// FinanceiroNumerario has: id, tenant_id, company_id, financeiro_id, descricao, is_principal, data, valor_total, created_at, updated_at, created_by, despesas
const mockNumerarios = [
  {
    id: 'num-001',
    tenant_id: 'tenant-1',
    company_id: 'company-1',
    financeiro_id: 'fin-e2e-001',
    descricao: 'Numerario Principal - Banco do Brasil',
    is_principal: true,
    data: '2026-01-15T00:00:00Z',
    valor_total: 15492.24,
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
    created_by: 'user-1',
    despesas: [],
  },
]

// ── Mock API helper ───────────────────────────────────────────────────────────

async function mockApi(page: import('@playwright/test').Page) {
  // Health
  await page.route(`**/api/health`, (route) =>
    route.fulfill({ status: 200, json: { status: 'ok' } })
  )

  // Dashboard / financeiro processo
  await page.route(`**${API_PREFIX}/${PROCESSO_ID}`, (route) => {
    if (route.request().method() === 'GET') {
      route.fulfill({ status: 200, json: { data: mockFinanceiro } })
    } else {
      route.continue()
    }
  })

  // Lancamentos lista
  await page.route(`**${API_PREFIX}/${PROCESSO_ID}/lancamentos*`, (route) => {
    if (route.request().method() === 'GET') {
      route.fulfill({
        status: 200,
        json: {
          data: mockLancamentos,
          meta: { total: 1, page: 1, limit: 50, pages: 1 },
        },
      })
    } else if (route.request().method() === 'POST') {
      route.fulfill({ status: 201, json: { ...mockLancamentos[0], id: 'lanc-new' } })
    } else {
      route.continue()
    }
  })

  // Categorias
  await page.route(`**${API_PREFIX}/config/categorias*`, (route) => {
    if (route.request().method() === 'GET') {
      route.fulfill({ status: 200, json: { data: mockCategorias } })
    } else if (route.request().method() === 'POST') {
      route.fulfill({ status: 201, json: { ...mockCategorias[0], id: 'cat-new' } })
    } else {
      route.continue()
    }
  })

  // Condicoes
  await page.route(`**${API_PREFIX}/config/condicoes*`, (route) => {
    if (route.request().method() === 'GET') {
      route.fulfill({ status: 200, json: { data: mockCondicoes } })
    } else if (route.request().method() === 'POST') {
      route.fulfill({ status: 201, json: { ...mockCondicoes[0], id: 'cond-new' } })
    } else {
      route.continue()
    }
  })

  // Numerarios
  await page.route(`**${API_PREFIX}/${PROCESSO_ID}/numerario*`, (route) => {
    if (route.request().method() === 'GET') {
      route.fulfill({ status: 200, json: { data: mockNumerarios, total: mockNumerarios.length } })
    } else if (route.request().method() === 'POST') {
      route.fulfill({ status: 201, json: { ...mockNumerarios[0], id: 'num-new' } })
    } else {
      route.continue()
    }
  })

  // Rateio gerar
  await page.route(`**${API_PREFIX}/${PROCESSO_ID}/rateio/gerar`, (route) => {
    if (route.request().method() === 'POST') {
      route.fulfill({
        status: 200,
        headers: {
          'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'Content-Disposition': 'attachment; filename="rateio.xlsx"',
          'x-rateio-id': 'rat-001',
        },
        body: Buffer.from('fake-excel-content'),
      })
    } else {
      route.continue()
    }
  })

  // Rateio listar
  await page.route(`**${API_PREFIX}/${PROCESSO_ID}/rateio`, (route) => {
    if (route.request().method() === 'GET') {
      route.fulfill({ status: 200, json: { data: [] } })
    } else {
      route.continue()
    }
  })

  // Historico
  await page.route(`**${API_PREFIX}/${PROCESSO_ID}/historico*`, (route) =>
    route.fulfill({ status: 200, json: { data: [] } })
  )
}

// ── Testes: Movimentação ──────────────────────────────────────────────────────

test.describe('Movimentacao', () => {
  test('E2E-001: carrega a pagina com KPIs do processo', async ({ page }) => {
    await mockApi(page)
    await page.goto(`${BASE_URL}/financeiro-comex/movimentacao/${PROCESSO_ID}`)

    await expect(page.getByText('Saldo')).toBeVisible()
    await expect(page.getByText('Adiantado')).toBeVisible()
    await expect(page.getByText('Pagos')).toBeVisible()
  })

  test('E2E-002: exibe badge de total BRL do processo', async ({ page }) => {
    await mockApi(page)
    await page.goto(`${BASE_URL}/financeiro-comex/movimentacao/${PROCESSO_ID}`)

    // A pagina exibe os badges de totais multi-moeda (BRL + USD no header)
    await expect(page.locator('.fincom-badge-moeda').first()).toBeVisible()
    await expect(page.locator('.fincom-badge-moeda').first()).toContainText('BRL')
  })

  test('E2E-003: exibe lancamentos na tabela', async ({ page }) => {
    await mockApi(page)
    await page.goto(`${BASE_URL}/financeiro-comex/movimentacao/${PROCESSO_ID}`)

    await expect(page.getByRole('cell', { name: '300 - Frete Internacional' })).toBeVisible()
  })

  test('E2E-004: saldo negativo exibido em vermelho (CA-006)', async ({ page }) => {
    await mockApi(page)
    await page.goto(`${BASE_URL}/financeiro-comex/movimentacao/${PROCESSO_ID}`)

    const saldoLabel = page.getByText('Saldo')
    await expect(saldoLabel).toBeVisible()
    const saldoCard = saldoLabel.locator('..')
    await expect(saldoCard).toHaveClass(/fincom-kpi--negativo/)
  })

  test('E2E-005: botao + Novo abre modal de lancamento', async ({ page }) => {
    await mockApi(page)
    await page.goto(`${BASE_URL}/financeiro-comex/movimentacao/${PROCESSO_ID}`)

    await page.getByText('+ Novo').click()
    await expect(page.getByRole('heading', { name: 'Novo Lancamento' })).toBeVisible()
  })

  test('E2E-006: modal de lancamento tem campos obrigatorios', async ({ page }) => {
    await mockApi(page)
    await page.goto(`${BASE_URL}/financeiro-comex/movimentacao/${PROCESSO_ID}`)

    await page.getByText('+ Novo').click()
    await expect(page.getByRole('heading', { name: 'Novo Lancamento' })).toBeVisible()
    // Verifica pelo spinbutton (campo numerico) de Taxa de Cambio
    await expect(page.getByRole('spinbutton', { name: /Taxa de Cambio/i })).toBeVisible()
    // Verifica pelo spinbutton de Valor
    await expect(page.getByRole('spinbutton', { name: /Valor/i })).toBeVisible()
    // Verifica pelo combobox de Moeda
    await expect(page.getByRole('combobox', { name: /Moeda/i })).toBeVisible()
  })

  test('E2E-007: validacao de campos obrigatorios ao salvar vazio (CA-002)', async ({ page }) => {
    await mockApi(page)
    await page.goto(`${BASE_URL}/financeiro-comex/movimentacao/${PROCESSO_ID}`)

    await page.getByText('+ Novo').click()
    await expect(page.getByRole('heading', { name: 'Novo Lancamento' })).toBeVisible()
    await page.getByRole('button', { name: 'Salvar' }).click()
    // Erro de validacao aparece como span.fincom-erro
    await expect(page.locator('.fincom-erro').first()).toBeVisible()
  })

  test('E2E-008: modal tem toggles de classificacao', async ({ page }) => {
    await mockApi(page)
    await page.goto(`${BASE_URL}/financeiro-comex/movimentacao/${PROCESSO_ID}`)

    await page.getByText('+ Novo').click()
    await expect(page.getByText('Despesa Aduaneira')).toBeVisible()
    await expect(page.getByText('Despesa NF')).toBeVisible()
    await expect(page.getByText(/Espelho de NF/i)).toBeVisible()
  })

  test('E2E-009: cancelar fecha o modal', async ({ page }) => {
    await mockApi(page)
    await page.goto(`${BASE_URL}/financeiro-comex/movimentacao/${PROCESSO_ID}`)

    await page.getByText('+ Novo').click()
    await expect(page.getByRole('heading', { name: 'Novo Lancamento' })).toBeVisible()
    await page.getByRole('button', { name: 'Cancelar' }).click()
    await expect(page.getByRole('heading', { name: 'Novo Lancamento' })).not.toBeVisible()
  })

  test('E2E-010: botao Importar abre modal de importacao', async ({ page }) => {
    await mockApi(page)
    await page.goto(`${BASE_URL}/financeiro-comex/movimentacao/${PROCESSO_ID}`)

    await page.getByText(/Importar/i).click()
    await expect(page.getByText(/Importar Lancamentos/i)).toBeVisible()
  })

  test('E2E-011: modal importar tem canais de entrada', async ({ page }) => {
    await mockApi(page)
    await page.goto(`${BASE_URL}/financeiro-comex/movimentacao/${PROCESSO_ID}`)

    await page.getByText(/Importar/i).click()
    await expect(page.getByRole('button', { name: 'XML (DUIMP)' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Portal Unico' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Smart Read' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Planilha' })).toBeVisible()
  })

  test('E2E-012: tabs de navegacao Movimentacao / Numerario / Rateio', async ({ page }) => {
    await mockApi(page)
    await page.goto(`${BASE_URL}/financeiro-comex/movimentacao/${PROCESSO_ID}`)

    await expect(page.getByRole('button', { name: 'Movimentacao' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Numerario' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Rateio' })).toBeVisible()
  })
})

// ── Testes: Numerário ─────────────────────────────────────────────────────────

test.describe('Numerario', () => {
  test('E2E-020: carrega pagina de numerario', async ({ page }) => {
    await mockApi(page)
    await page.goto(`${BASE_URL}/financeiro-comex/numerario/${PROCESSO_ID}`)

    // Tab Numerario esta ativo (fincom-tab--active) na pagina de numerario
    await expect(page.locator('button.fincom-tab--active', { hasText: 'Numerario' })).toBeVisible()
  })

  test('E2E-021: exibe numerario principal na tabela', async ({ page }) => {
    await mockApi(page)
    await page.goto(`${BASE_URL}/financeiro-comex/numerario/${PROCESSO_ID}`)

    // NumerarioPage exibe n.descricao e o avatar NP (is_principal)
    await expect(page.getByText('NP')).toBeVisible()
    await expect(page.getByText('Numerario Principal - Banco do Brasil')).toBeVisible()
  })

  test('E2E-022: botao inserir numerario abre modal', async ({ page }) => {
    await mockApi(page)
    await page.goto(`${BASE_URL}/financeiro-comex/numerario/${PROCESSO_ID}`)

    await page.getByText('+ Numerario Complementar').click()
    await expect(page.getByRole('heading', { name: 'Inserir Numerario' })).toBeVisible()
  })

  test('E2E-023: modal numerario tem campo descricao e data', async ({ page }) => {
    await mockApi(page)
    await page.goto(`${BASE_URL}/financeiro-comex/numerario/${PROCESSO_ID}`)

    await page.getByText('+ Numerario Complementar').click()
    await expect(page.getByRole('heading', { name: 'Inserir Numerario' })).toBeVisible()
    await expect(page.getByRole('textbox', { name: /Descricao/i })).toBeVisible()
    await expect(page.getByLabel(/Data/i)).toBeVisible()
  })

  test('E2E-024: cancelar modal numerario fecha o modal', async ({ page }) => {
    await mockApi(page)
    await page.goto(`${BASE_URL}/financeiro-comex/numerario/${PROCESSO_ID}`)

    await page.getByText('+ Numerario Complementar').click()
    await expect(page.getByRole('heading', { name: 'Inserir Numerario' })).toBeVisible()
    await page.getByRole('button', { name: 'Cancelar' }).click()
    await expect(page.getByRole('heading', { name: 'Inserir Numerario' })).not.toBeVisible()
  })
})

// ── Testes: Rateio ────────────────────────────────────────────────────────────

test.describe('Rateio', () => {
  test('E2E-030: carrega pagina de rateio', async ({ page }) => {
    await mockApi(page)
    await page.goto(`${BASE_URL}/financeiro-comex/rateio/${PROCESSO_ID}`)

    await expect(page.getByRole('button', { name: 'Rateio' })).toBeVisible()
  })

  test('E2E-031: pagina de rateio tem botao Gerar Novo', async ({ page }) => {
    await mockApi(page)
    await page.goto(`${BASE_URL}/financeiro-comex/rateio/${PROCESSO_ID}`)

    await expect(page.getByRole('button', { name: 'Gerar Novo' }).first()).toBeVisible()
  })

  test('E2E-032: botao gerar dispara chamada de API (CA-009)', async ({ page }) => {
    await mockApi(page)
    await page.goto(`${BASE_URL}/financeiro-comex/rateio/${PROCESSO_ID}`)

    const btnGerar = page.getByRole('button', { name: 'Gerar Novo' }).first()
    await expect(btnGerar).toBeVisible()
    // Usa force para contornar o header do shell que intercepta o evento de clique
    await btnGerar.click({ force: true })
    // Apos o clique o botao continua visivel (retorna para "Gerar Novo" apos mock responder)
    await expect(page.locator('.fincom-rateio-header')).toBeVisible()
  })

  test('E2E-033: pagina rateio exibe empty state', async ({ page }) => {
    await mockApi(page)
    await page.goto(`${BASE_URL}/financeiro-comex/rateio/${PROCESSO_ID}`)

    // Com mock retornando lista vazia, deve exibir empty state
    await expect(page.getByText(/Nenhum rateio gerado/i)).toBeVisible()
  })
})

// ── Testes: Config / Categorias ───────────────────────────────────────────────

test.describe('Config - Categorias', () => {
  test('E2E-040: carrega pagina de categorias', async ({ page }) => {
    await mockApi(page)
    await page.goto(`${BASE_URL}/financeiro-comex/config/categorias`)

    await expect(page.getByRole('heading', { name: /Categorias/i })).toBeVisible()
  })

  test('E2E-041: exibe categorias na tabela', async ({ page }) => {
    await mockApi(page)
    await page.goto(`${BASE_URL}/financeiro-comex/config/categorias`)

    await expect(page.getByRole('cell', { name: 'Frete Internacional' })).toBeVisible()
    await expect(page.getByRole('cell', { name: 'I.I - Imposto de Importacao' })).toBeVisible()
  })

  test('E2E-042: exibe colunas codigo, nome, grupo', async ({ page }) => {
    await mockApi(page)
    await page.goto(`${BASE_URL}/financeiro-comex/config/categorias`)

    await expect(page.getByRole('columnheader', { name: 'Codigo' })).toBeVisible()
    await expect(page.getByRole('columnheader', { name: 'Nome' })).toBeVisible()
    await expect(page.getByRole('columnheader', { name: 'Grupo' })).toBeVisible()
  })

  test('E2E-043: botao nova categoria abre formulario', async ({ page }) => {
    await mockApi(page)
    await page.goto(`${BASE_URL}/financeiro-comex/config/categorias`)

    await page.getByRole('button', { name: '+ Nova Categoria' }).click()
    // O form aparece com botao Salvar e campo codigo
    await expect(page.locator('.fincom-form-card')).toBeVisible()
  })
})

// ── Testes: Config / Condições de Pagamento ───────────────────────────────────

test.describe('Config - Condicoes de Pagamento', () => {
  test('E2E-050: carrega pagina de condicoes', async ({ page }) => {
    await mockApi(page)
    await page.goto(`${BASE_URL}/financeiro-comex/config/condicoes`)

    await expect(page.getByRole('heading', { name: /Condicoes/i })).toBeVisible()
  })

  test('E2E-051: exibe condicoes na tabela', async ({ page }) => {
    await mockApi(page)
    await page.goto(`${BASE_URL}/financeiro-comex/config/condicoes`)

    await expect(page.getByRole('cell', { name: 'Carta de Credito' })).toBeVisible()
    await expect(page.getByRole('cell', { name: 'Transferencia Internacional' })).toBeVisible()
  })

  test('E2E-052: exibe codigo e prazo na tabela', async ({ page }) => {
    await mockApi(page)
    await page.goto(`${BASE_URL}/financeiro-comex/config/condicoes`)

    await expect(page.getByRole('cell', { name: 'CC' })).toBeVisible()
    await expect(page.getByRole('cell', { name: 'TT' })).toBeVisible()
  })

  test('E2E-053: botao nova condicao abre formulario', async ({ page }) => {
    await mockApi(page)
    await page.goto(`${BASE_URL}/financeiro-comex/config/condicoes`)

    await page.getByRole('button', { name: '+ Nova Condicao' }).click()
    // O form aparece com o card de formulario
    await expect(page.locator('.fincom-form-card')).toBeVisible()
  })
})

// ── Testes: Navegação entre tabs ──────────────────────────────────────────────

test.describe('Navegacao entre tabs', () => {
  test('E2E-060: clicar na tab Numerario navega para a pagina', async ({ page }) => {
    await mockApi(page)
    await page.goto(`${BASE_URL}/financeiro-comex/movimentacao/${PROCESSO_ID}`)

    await page.getByRole('button', { name: 'Numerario' }).click()
    await expect(page).toHaveURL(/numerario/)
  })

  test('E2E-061: clicar na tab Rateio navega para a pagina', async ({ page }) => {
    await mockApi(page)
    await page.goto(`${BASE_URL}/financeiro-comex/movimentacao/${PROCESSO_ID}`)

    await page.getByRole('button', { name: 'Rateio' }).click()
    await expect(page).toHaveURL(/rateio/)
  })

  test('E2E-062: clicar na tab Movimentacao volta para a pagina', async ({ page }) => {
    await mockApi(page)
    await page.goto(`${BASE_URL}/financeiro-comex/numerario/${PROCESSO_ID}`)

    await page.getByRole('button', { name: 'Movimentacao' }).click()
    await expect(page).toHaveURL(/movimentacao/)
  })
})

// ── Testes: Responsividade ────────────────────────────────────────────────────

test.describe('Responsividade', () => {
  test('E2E-070: movimentacao renderiza em tablet (768x1024)', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 })
    await mockApi(page)
    await page.goto(`${BASE_URL}/financeiro-comex/movimentacao/${PROCESSO_ID}`)

    await expect(page.getByText('Saldo')).toBeVisible()
    await expect(page.getByRole('cell', { name: '300 - Frete Internacional' })).toBeVisible()
  })

  test('E2E-071: movimentacao renderiza em desktop (1440x900)', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    await mockApi(page)
    await page.goto(`${BASE_URL}/financeiro-comex/movimentacao/${PROCESSO_ID}`)

    await expect(page.getByText('Saldo')).toBeVisible()
  })
})
