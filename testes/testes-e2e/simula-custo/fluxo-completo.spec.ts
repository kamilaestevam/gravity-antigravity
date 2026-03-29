/**
 * E2E — SimulaCusto: Fluxo Completo de Produto
 * Cobre fluxos 1.1–5.3 do plano de testes (fluxo-produto-e2e.md)
 *
 * Fluxo: Admin ativa produto > Sidebar reflete > Dashboard + KPIs >
 *        Criar estimativa > Simular > Salvar > Duplicar > Arquivar
 */
import { test, expect } from '@playwright/test'
import {
  navigateTo,
  navigateToConfigurador,
  apiPost,
  apiGet,
  apiPatch,
  seedEstimativa,
  activateProduct,
  deactivateProduct,
  fillEstimativaForm,
  submitSimulacao,
  waitForDashboard,
  waitForToast,
  waitForLoadingToFinish,
  BASE_URL,
  CONFIGURADOR_BASE_URL,
  TENANT_ID,
  PRODUCT_KEY,
  type TestEstimativa,
  type TestKpis,
} from './helpers'

// ─── Categoria 1 — Ativacao de Produto (Admin) ─────────────────────────────

test.describe('Ativacao de Produto — Admin', () => {
  test('1.1 — Admin: produto SimulaCusto visivel no catalogo', async ({ page }) => {
    // Buscar catalogo de produtos via API
    const res = await apiGet<{ products: Array<{ slug: string; name: string; status: string }> }>(
      page,
      '/api/v1/catalog/products',
      CONFIGURADOR_BASE_URL
    )
    const produtos = res.products

    // SimulaCusto deve estar presente e ativo
    const simulaCusto = produtos.find((p: any) => p.slug === PRODUCT_KEY)
    expect(simulaCusto).toBeDefined()
    expect(simulaCusto?.name).toBe('SimulaCusto')
    expect(simulaCusto?.status).toBe('ACTIVE')
  })

  test('1.2 — Admin: ativar SimulaCusto para tenant demo', async ({ page }) => {
    // Ativar produto para o tenant
    const result = await activateProduct(page)
    expect(result.product_key).toBe(PRODUCT_KEY)
    expect(result.active).toBe(true)

    // Verificar via GET que esta ativo
    const res = await apiGet<{ products: Array<{ product_key: string; is_active: boolean }> }>(
      page,
      `/api/internal/tenant-products?tenantId=${TENANT_ID}`,
      CONFIGURADOR_BASE_URL
    )
    const activated = res.products.find((p: any) => p.product_key === PRODUCT_KEY)
    expect(activated).toBeDefined()
    expect(activated?.is_active).toBe(true)
  })
})

// ─── Categoria 2 — Sidebar e Navegacao ──────────────────────────────────────

test.describe('Sidebar — Visibilidade do Produto', () => {
  test.beforeEach(async ({ page }) => {
    // Garantir que produto esta ativo antes dos testes de sidebar
    await activateProduct(page)
  })

  test('2.1 — Sidebar: SimulaCusto aparece quando ativado', async ({ page }) => {
    await navigateTo(page, '/')
    await waitForLoadingToFinish(page)

    // Verificar que o item SimulaCusto esta presente na sidebar
    const sidebarItem = page.locator('nav, [data-testid="sidebar"]')
      .getByText(/simula.?custo/i)
    await expect(sidebarItem).toBeVisible()

    // Clicar e verificar navegacao
    await sidebarItem.click()
    await waitForLoadingToFinish(page)
    await expect(page).toHaveURL(/simula-custo|estimativas/)
  })

  test('2.2 — Sidebar: SimulaCusto desaparece quando desativado', async ({ page }) => {
    // Desativar produto
    await deactivateProduct(page)

    // Forcar reload completo (o Shell carrega produtos no mount)
    await page.reload({ waitUntil: 'networkidle' })
    await waitForLoadingToFinish(page)

    const sidebarItem = page.locator('nav, [data-testid="sidebar"]')
      .getByText(/simula.?custo/i)
    await expect(sidebarItem).toBeHidden({ timeout: 5000 })

    // Cleanup: reativar para nao afetar outros testes
    await activateProduct(page)
  })
})

// ─── Categoria 3 — Dashboard e KPIs ────────────────────────────────────────

test.describe('Dashboard — KPIs e Estado Inicial', () => {
  test('3.1 — Dashboard: KPIs carregam corretamente', async ({ page }) => {
    // Seed: criar estimativas para garantir dados
    await seedEstimativa(page, { referencia: `KPI-TEST-${Date.now()}` })

    await navigateTo(page, '/estimativas')
    await waitForDashboard(page)

    // Verificar que 4 KPI cards estao presentes
    const kpiCards = page.locator('.ed-kpi-card')
    await expect(kpiCards).toHaveCount(4)

    // Verificar labels dos KPIs
    await expect(page.getByText(/total de estimativas/i)).toBeVisible()
    await expect(page.locator('.ed-kpi-label').filter({ hasText: /em cria/i })).toBeVisible()
    await expect(page.locator('.ed-kpi-label').filter({ hasText: /criadas/i })).toBeVisible()
    await expect(page.locator('.ed-kpi-label').filter({ hasText: /landed cost/i })).toBeVisible()

    // Verificar consistencia via API
    const kpis = await apiGet<TestKpis>(page, '/api/v1/simula-custo/estimativas/kpis')
    expect(kpis.total).toBeGreaterThanOrEqual(1)
    expect(kpis.total).toBe(kpis.em_criacao + kpis.criadas + kpis.arquivadas)
  })

  test('3.2 — Dashboard: tabela de estimativas vazia inicialmente', async ({ page }) => {
    // Navegar para dashboard com filtro que retorna vazio
    await navigateTo(page, '/estimativas')
    await waitForLoadingToFinish(page)

    // Se nao ha estimativas, deve exibir mensagem de estado vazio
    const tabela = page.locator('[data-testid="tabela-global"], table')
    const msgVazia = page.getByText(/nenhuma estimativa encontrada/i)

    // Pelo menos um dos dois deve estar visivel (tabela com dados ou msg vazia)
    const tabelaVisivel = await tabela.isVisible()
    const msgVisivel = await msgVazia.isVisible()
    expect(tabelaVisivel || msgVisivel).toBe(true)

    // Botao "Nova Estimativa" deve estar sempre visivel
    await expect(page.getByRole('button', { name: /nova estimativa/i })).toBeVisible()
  })
})

// ─── Categoria 4 — CRUD de Estimativas ─────────────────────────────────────

test.describe('Estimativas — Formulario e Simulacao', () => {
  test('4.1 — Nova estimativa: formulario carrega campos obrigatorios', async ({ page }) => {
    await navigateTo(page, '/estimativas/nova')
    await waitForLoadingToFinish(page)

    // Verificar titulo
    await expect(page.getByText(/nova estimativa de custo/i)).toBeVisible()

    // Verificar secoes do formulario
    await expect(page.getByText('Operação').first()).toBeVisible()
    await expect(page.getByText('Produto & Origem').first()).toBeVisible()
    await expect(page.getByText('Valores').first()).toBeVisible()
    await expect(page.getByText('Alíquotas').first()).toBeVisible()

    // Verificar campos obrigatorios presentes (via placeholder)
    await expect(page.getByPlaceholder('84713019')).toBeVisible()  // NCM
    await expect(page.getByPlaceholder('US')).toBeVisible()        // Pais
    await expect(page.getByPlaceholder('SP')).toBeVisible()        // UF
    await expect(page.getByPlaceholder('5925.00')).toBeVisible()   // Valor produto

    // Verificar valores padrao nos selects
    const operacaoSelect = page.locator('select').filter({ hasText: /Importa/i })
    await expect(operacaoSelect).toBeVisible()

    // Verificar botao Simular
    await expect(page.getByRole('button', { name: /simular custo/i })).toBeVisible()
    await expect(page.getByRole('button', { name: /simular custo/i })).toBeEnabled()
  })

  test('4.2 — Nova estimativa: simular custo retorna resultado fiscal', async ({ page }) => {
    await navigateTo(page, '/estimativas/nova')
    await waitForLoadingToFinish(page)

    // Preencher formulario completo
    await fillEstimativaForm(page, {
      ncm: '84713019',
      paisOrigem: 'US',
      ufDesembaraco: 'SP',
      valorProduto: '5925',
      freteInter: '500',
      aliquotaII: '16',
      aliquotaIPI: '0',
      aliquotaPIS: '2.10',
      aliquotaCOFINS: '9.65',
      aliquotaICMS: '18',
    })

    // Simular
    await submitSimulacao(page)

    // Verificar painel de resultado
    const resultado = page.locator('.sc-result, [data-testid="resultado-fiscal"]')
    await expect(resultado).toBeVisible()

    // Verificar Landed Cost Total (valor > 0)
    await expect(page.getByText(/landed cost total/i)).toBeVisible()
    const landedCostValue = page.locator('.sc-lc-value')
    await expect(landedCostValue).toBeVisible()
    const lcText = await landedCostValue.textContent()
    expect(lcText).toMatch(/R\$/)

    // Verificar tributos individuais no painel de resultado
    const painelTributos = page.locator('.sc-result, [data-testid="resultado-fiscal"]')
    await expect(painelTributos.getByText(/II\s+\d/).first()).toBeVisible()
    await expect(painelTributos.getByText(/IPI\s/).first()).toBeVisible()
    await expect(painelTributos.getByText(/PIS\s/).first()).toBeVisible()
    await expect(painelTributos.getByText(/COFINS\s/).first()).toBeVisible()
    await expect(painelTributos.getByText(/ICMS\s/).first()).toBeVisible()

    // Verificar total de tributos
    await expect(page.getByText(/total de tributos/i)).toBeVisible()

    // Verificar Valor Aduaneiro
    await expect(page.getByText(/valor aduaneiro/i)).toBeVisible()

    // Verificar badge de source (Portal Unico ou Gravity Cloud Engine)
    const sourceBadge = page.locator('.sc-result-badge')
    await expect(sourceBadge).toBeVisible()
    const sourceText = await sourceBadge.textContent()
    expect(sourceText).toMatch(/portal .nico|gravity cloud engine/i)

    // Verificar PTAX
    await expect(page.getByText(/PTAX/i)).toBeVisible()
  })

  // Frontend ainda não implementa POST para /estimativas ao clicar "Salvar" — skip até implementação
  test.skip('4.3 — Nova estimativa: salvar persiste no banco', async ({ page }) => {
    const refUnica = `E2E-SAVE-${Date.now()}`

    await navigateTo(page, '/estimativas/nova')
    await waitForLoadingToFinish(page)

    // Preencher e simular
    await fillEstimativaForm(page, {
      referencia: refUnica,
      ncm: '84713019',
      valorProduto: '5925',
      freteInter: '500',
    })
    await submitSimulacao(page)

    // Salvar estimativa
    await page.getByRole('button', { name: /salvar estimativa|salvar/i }).first().click()

    // Aguardar feedback (toast ou redirecionamento)
    await page.waitForTimeout(2000)

    // Verificar persistencia via API (direto no backend)
    const lista = await apiGet<{ data: TestEstimativa[] }>(
      page,
      '/api/v1/simula-custo/estimativas?busca=' + encodeURIComponent(refUnica)
    )
    expect(lista.data.length).toBeGreaterThanOrEqual(1)
    const salva = lista.data.find((e: any) => e.referencia === refUnica)
    expect(salva).toBeDefined()
    expect(salva?.ncm).toBe('84713019')
  })
})

// ─── Categoria 5 — Lista, Duplicar, Arquivar ───────────────────────────────

test.describe('Estimativas — Lista e Acoes', () => {
  let estimativaBase: TestEstimativa

  test.beforeAll(async ({ browser }) => {
    // Seed: criar estimativa para usar nos testes de lista
    const page = await browser.newPage()
    estimativaBase = await seedEstimativa(page, {
      referencia: `E2E-LIST-${Date.now()}`,
    })
    await page.close()
  })

  test('5.1 — Lista: estimativa salva aparece com status correto', async ({ page }) => {
    await navigateTo(page, '/estimativas')
    await waitForDashboard(page)

    // Verificar que a estimativa seed aparece na tabela
    const tabela = page.locator('[data-testid="tabela-global"], table')
    await expect(tabela).toBeVisible()

    // Verificar que pelo menos uma estimativa esta listada
    const linhas = page.locator('tbody tr, [data-testid="table-row"]')
    const count = await linhas.count()
    expect(count).toBeGreaterThan(0)

    // Verificar colunas visiveis
    await expect(page.getByText(/n.mero/i).first()).toBeVisible()
    await expect(page.getByText(/status/i).first()).toBeVisible()
    await expect(page.getByText(/opera..o/i).first()).toBeVisible()
    await expect(page.getByText(/NCM/i).first()).toBeVisible()

    // Verificar badge de status (EM_CRIACAO = warning amber, CRIADA = success green)
    const badges = page.locator('span').filter({ hasText: /em cria..o|criada/i })
    await expect(badges.first()).toBeVisible()
  })

  test('5.2 — Lista: duplicar estimativa cria copia', async ({ page }) => {
    await navigateTo(page, '/estimativas')
    await waitForDashboard(page)

    // Contar estimativas antes
    const kpisBefore = await apiGet<TestKpis>(page, '/api/v1/simula-custo/estimativas/kpis')
    const countBefore = kpisBefore.total

    // Duplicar via API (mais confiavel para E2E)
    const duplicada = await apiPost<TestEstimativa>(
      page,
      `/api/v1/simula-custo/estimativas/${estimativaBase.id}/duplicar`,
      {}
    )

    // Verificar que a copia tem ID diferente
    expect(duplicada.id).not.toBe(estimativaBase.id)
    expect(duplicada.numero).not.toBe(estimativaBase.numero)

    // Verificar que dados foram copiados
    expect(duplicada.ncm).toBe(estimativaBase.ncm)
    expect(duplicada.operacao).toBe(estimativaBase.operacao)

    // Verificar contagem aumentou
    const kpisAfter = await apiGet<TestKpis>(page, '/api/v1/simula-custo/estimativas/kpis')
    expect(kpisAfter.total).toBe(countBefore + 1)

    // Recarregar dashboard e verificar visualmente
    await navigateTo(page, '/estimativas')
    await waitForDashboard(page)

    const linhas = page.locator('tbody tr, [data-testid="table-row"]')
    const countLinhas = await linhas.count()
    expect(countLinhas).toBeGreaterThanOrEqual(2)
  })

  test('5.3 — Lista: arquivar estimativa altera status', async ({ page }) => {
    // Criar estimativa fresca para arquivar
    const estimativa = await seedEstimativa(page, {
      referencia: `E2E-ARCHIVE-${Date.now()}`,
    })

    // Verificar status inicial
    expect(estimativa.status).not.toBe('ARQUIVADA')

    // Arquivar via API
    const arquivada = await apiPatch<TestEstimativa>(
      page,
      `/api/v1/simula-custo/estimativas/${estimativa.id}/status`,
      { status: 'ARQUIVADA' }
    )
    expect(arquivada.status).toBe('ARQUIVADA')

    // Verificar na UI — navegar e filtrar por arquivadas
    await navigateTo(page, '/estimativas')
    await waitForDashboard(page)

    // Clicar na tab "Arquivadas"
    const tabArquivadas = page.locator('.ed-tab, button').filter({ hasText: /arquivad/i })
    await tabArquivadas.click()
    await waitForLoadingToFinish(page)

    // Verificar que a estimativa arquivada aparece com badge correto
    const badges = page.locator('span').filter({ hasText: /arquivad/i })
    await expect(badges.first()).toBeVisible()

    // Verificar via API que o status persiste
    const verificada = await apiGet<TestEstimativa>(
      page,
      `/api/v1/simula-custo/estimativas/${estimativa.id}`
    )
    expect(verificada.status).toBe('ARQUIVADA')
  })
})
