import { test, chromium } from '@playwright/test'

/**
 * Medição de performance do Hub — 2 camadas:
 *
 * 1. BACKEND: curl direto no /hub/init para medir tempo da API
 * 2. FRONTEND: intercepta API para medir tempo de render puro
 *
 * Não depende de OAuth — funciona sem login.
 */

const BASE = 'http://localhost:8000'
const API = 'http://127.0.0.1:8001'

// Dados mock realistas para medir render frontend
const MOCK_HUB_DATA = {
  tenant: {
    id: 'perf-test',
    name: 'Empresa Teste',
    slug: 'teste',
    status: 'ACTIVE',
    subscriptions: [{ status: 'ACTIVE', trial_ends_at: null }],
    _count: { users: 5, companies: 2 },
  },
  companies: [
    { id: 'c1', name: 'Matriz São Paulo', subdomain: null, cnpj: '12345678000199', status: 'ACTIVE', created_at: '2026-01-01', _count: { memberships: 5 } },
    { id: 'c2', name: 'Filial Rio', subdomain: null, cnpj: '98765432000188', status: 'ACTIVE', created_at: '2026-02-01', _count: { memberships: 3 } },
  ],
  products: [
    { product_key: 'simula-custo', is_active: true, config: {}, subscribed_at: '2026-01-15', catalog: { name: 'SimulaCusto', description: 'Simulação de custos de importação' } },
    { product_key: 'bid-frete', is_active: true, config: {}, subscribed_at: '2026-02-01', catalog: { name: 'BidFrete', description: 'Cotação de fretes internacionais' } },
  ],
  catalog: [
    { id: 'p1', name: 'SimulaCusto', slug: 'simula-custo', description: 'Simulação de custos', status: 'ACTIVE' },
    { id: 'p2', name: 'BidFrete', slug: 'bid-frete', description: 'Cotação de fretes', status: 'ACTIVE' },
    { id: 'p3', name: 'BidCâmbio', slug: 'bid-cambio', description: 'Câmbio inteligente', status: 'ACTIVE' },
    { id: 'p4', name: 'Drawback', slug: 'drawback', description: 'Gestão de regimes', status: 'COMING_SOON' },
  ],
}

test.describe('Hub Performance', () => {
  test('medir render frontend com dados mock + API real via curl', async () => {
    // ═══ PARTE 1: MEDIR BACKEND DIRETAMENTE ═══
    console.log('\n════════════════════════════════════════════')
    console.log('  MEDIÇÃO DE PERFORMANCE — HUB')
    console.log('════════════════════════════════════════════\n')

    console.log('▶ BACKEND — /api/v1/hub/init (sem auth, mede overhead)')
    for (let i = 1; i <= 3; i++) {
      const t = Date.now()
      try {
        const r = await fetch(`${API}/api/v1/hub/init`)
        const ms = Date.now() - t
        console.log(`  Tentativa ${i}: HTTP ${r.status} em ${ms}ms`)
      } catch (e) {
        console.log(`  Tentativa ${i}: ERRO em ${Date.now() - t}ms — ${e}`)
      }
    }

    // ═══ PARTE 2: MEDIR FRONTEND RENDER COM MOCK ═══
    console.log('\n▶ FRONTEND — render com dados mock (mede React puro)')

    const browser = await chromium.launch({
      headless: false,
      channel: 'msedge',
    })
    const context = await browser.newContext({
      viewport: { width: 1440, height: 900 },
    })
    const page = await context.newPage()

    // Intercepta TODAS as chamadas de API para evitar auth
    // Retorna mock para hub/init, bloqueia o resto
    await page.route('**/api/v1/hub/init', async (route) => {
      console.log('  [MOCK] /api/v1/hub/init interceptado')
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(MOCK_HUB_DATA),
      })
    })

    // Bloqueia Clerk para não travar
    await page.route('**clerk**', async (route) => {
      // Deixa passar os scripts do Clerk (necessários para o app montar)
      if (route.request().resourceType() === 'script' || route.request().resourceType() === 'stylesheet') {
        await route.continue()
      } else {
        await route.abort()
      }
    })

    // Navega para o Hub
    const t0 = Date.now()
    await page.goto(`${BASE}/hub`, { waitUntil: 'domcontentloaded' })
    const tDom = Date.now() - t0
    console.log(`  DOM ready: ${tDom}ms`)

    // Espera o Hub renderizar (com fallback se Clerk bloquear)
    let tTitle = 0, tCards = 0, tProducts = 0

    try {
      await page.locator('.sw-ws-title, text=Acessar Workspace').first().waitFor({
        state: 'visible', timeout: 15000,
      })
      tTitle = Date.now() - t0
      console.log(`  ✓ Título: ${tTitle}ms`)
    } catch {
      console.log('  ⚠ Título não apareceu — Clerk pode ter bloqueado render')
    }

    try {
      await page.locator('.sw-ws-card').first().waitFor({
        state: 'visible', timeout: 15000,
      })
      tCards = Date.now() - t0
      console.log(`  ✓ Cards: ${tCards}ms`)
    } catch {
      console.log('  ⚠ Cards não apareceram')
    }

    try {
      await page.locator('.sw-products-section').first().waitFor({
        state: 'visible', timeout: 10000,
      })
      tProducts = Date.now() - t0
      console.log(`  ✓ Produtos: ${tProducts}ms`)
    } catch {
      console.log('  ⚠ Produtos não apareceram')
    }

    const tTotal = Date.now() - t0
    await page.screenshot({ path: 'test-results/hub-perf-mock.png', fullPage: true })

    // Verifica erros no console do browser
    const errors: string[] = []
    page.on('console', msg => {
      if (msg.type() === 'error') errors.push(msg.text())
    })
    await page.waitForTimeout(2000)

    // ═══ RESUMO ═══
    console.log('\n════════════════════════════════════════════')
    console.log('  RESULTADO')
    console.log('════════════════════════════════════════════')
    console.log(`  DOM ready:           ${tDom}ms`)
    if (tTitle) console.log(`  Título visível:      ${tTitle}ms  ${tTitle < 2000 ? '✅' : '❌'}`)
    if (tCards) console.log(`  Cards visíveis:      ${tCards}ms  ${tCards < 2000 ? '✅' : '❌'}`)
    if (tProducts) console.log(`  Produtos visíveis:   ${tProducts}ms  ${tProducts < 2000 ? '✅' : '❌'}`)
    console.log(`  Total:               ${tTotal}ms  ${tTotal < 3000 ? '✅' : '❌'}`)
    console.log(`  SLA:                 < 2000ms`)
    if (errors.length > 0) {
      console.log('\n  ⚠ Erros no console:')
      errors.forEach(e => console.log(`    ${e}`))
    }
    console.log('════════════════════════════════════════════')

    console.log('\n📋 Para medir COM sessão real, cole no console do Chrome logado:')
    console.log(`
(async () => {
  const t0 = performance.now();
  const token = await window.Clerk?.session?.getToken();
  const t1 = performance.now();
  const r = await fetch('/api/v1/hub/init', { headers: { Authorization: 'Bearer ' + token } });
  const t2 = performance.now();
  const data = await r.json();
  const t3 = performance.now();
  console.table({
    'getToken()': { ms: Math.round(t1-t0) },
    'fetch API':  { ms: Math.round(t2-t1) },
    'parse JSON': { ms: Math.round(t3-t2) },
    'TOTAL':      { ms: Math.round(t3-t0) },
  });
  console.log('Status:', r.status, '| Companies:', data.companies?.length, '| Products:', data.products?.length);
})();
    `)

    await context.close()
    await browser.close()
  })
})
