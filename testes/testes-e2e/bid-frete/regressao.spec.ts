/**
 * E2E — BID Frete v2: Regressao
 * Validates critical invariants:
 * - No console errors on any page
 * - All pages render without crash
 * - Responsive: pages render at 1920px, 1366px, 768px widths
 * - Tenant isolation, security, Zod validation, data integrity
 */
import { test, expect } from '@playwright/test'
import {
  BASE_URL,
  INTERNAL_KEY,
  TENANT_ID,
  navigateTo,
  apiPost,
  apiGet,
  seedCotacao,
  seedFornecedor,
  waitForLoadingToFinish,
  screenshotStep,
} from './helpers'

// ── No Console Errors ───────────────────────────────────────────

test.describe('Regressao — No Console Errors', () => {
  const pages = [
    '/dashboard',
    '/cotacoes',
    '/fornecedores',
    '/configuracoes',
    '/importar-bloco',
  ]

  for (const path of pages) {
    test(`no console errors on ${path}`, async ({ page }) => {
      const consoleErrors: string[] = []
      page.on('console', (msg) => {
        if (msg.type() === 'error') {
          consoleErrors.push(msg.text())
        }
      })

      await navigateTo(page, path)
      await waitForLoadingToFinish(page)

      // Filter out known benign errors (e.g. favicon 404)
      const criticalErrors = consoleErrors.filter(
        (e) => !e.includes('favicon') && !e.includes('404'),
      )
      expect(criticalErrors).toHaveLength(0)
    })
  }
})

// ── All Pages Render Without Crash ──────────────────────────────

test.describe('Regressao — Pages Render', () => {
  const routes = [
    { path: '/dashboard', name: 'Dashboard' },
    { path: '/cotacoes', name: 'Cotacoes' },
    { path: '/cotacoes/nova', name: 'Nova Cotacao' },
    { path: '/fornecedores', name: 'Fornecedores' },
    { path: '/configuracoes', name: 'Configuracoes' },
    { path: '/importar-bloco', name: 'Importar Bloco' },
    { path: '/portal', name: 'Portal Fornecedor' },
  ]

  for (const route of routes) {
    test(`${route.name} renders without crash`, async ({ page }) => {
      const pageErrors: Error[] = []
      page.on('pageerror', (err) => pageErrors.push(err))

      await navigateTo(page, route.path)
      await waitForLoadingToFinish(page)

      // Page should not be blank
      const bodyText = await page.locator('body').innerText()
      expect(bodyText.length).toBeGreaterThan(0)

      // No uncaught JS errors
      expect(pageErrors).toHaveLength(0)
    })
  }
})

// ── Responsive Rendering ────────────────────────────────────────

test.describe('Regressao — Responsividade', () => {
  const viewports = [
    { width: 1920, height: 1080, label: '1920px' },
    { width: 1366, height: 768, label: '1366px' },
    { width: 768, height: 1024, label: '768px' },
  ]

  const responsivePages = ['/dashboard', '/cotacoes', '/fornecedores']

  for (const vp of viewports) {
    for (const path of responsivePages) {
      test(`${path} renders at ${vp.label}`, async ({ page }) => {
        await page.setViewportSize({ width: vp.width, height: vp.height })
        await navigateTo(page, path)
        await waitForLoadingToFinish(page)

        // No horizontal overflow
        const bodyWidth = await page.evaluate(() => document.body.scrollWidth)
        expect(bodyWidth).toBeLessThanOrEqual(vp.width + 20) // Small tolerance

        await screenshotStep(
          page,
          `responsive-${path.replace(/\//g, '-')}-${vp.label}`,
        )
      })
    }
  }
})

// ── Tenant Isolation ────────────────────────────────────────────

test.describe('Regressao — Tenant Isolation', () => {
  test('cotacoes from another tenant are not visible', async ({ page }) => {
    const cotacao = await seedCotacao(page)

    const response = await page.request.get(
      `${BASE_URL}/api/v1/bid-frete/cotacoes`,
      {
        headers: {
          'x-internal-key': INTERNAL_KEY,
          'x-tenant-id': 'tenant-outro',
          'x-user-id': 'user-outro',
        },
      },
    )
    expect(response.ok()).toBe(true)
    const data = await response.json()
    const found = data.find((c: { id: string }) => c.id === cotacao.id)
    expect(found).toBeUndefined()
  })

  test('fornecedores from another tenant are not visible', async ({ page }) => {
    const forn = await seedFornecedor(page)

    const response = await page.request.get(
      `${BASE_URL}/api/v1/bid-frete/fornecedores`,
      {
        headers: {
          'x-internal-key': INTERNAL_KEY,
          'x-tenant-id': 'tenant-outro',
          'x-user-id': 'user-outro',
        },
      },
    )
    expect(response.ok()).toBe(true)
    const data = await response.json()
    const found = data.find((f: { id: string }) => f.id === forn.id)
    expect(found).toBeUndefined()
  })

  test('detail of another tenant cotacao returns 404', async ({ page }) => {
    const cotacao = await seedCotacao(page)

    const response = await page.request.get(
      `${BASE_URL}/api/v1/bid-frete/cotacoes/${cotacao.id}`,
      {
        headers: {
          'x-internal-key': INTERNAL_KEY,
          'x-tenant-id': 'tenant-outro',
          'x-user-id': 'user-outro',
        },
      },
    )
    expect(response.status()).toBe(404)
  })
})

// ── Security ────────────────────────────────────────────────────

test.describe('Regressao — Seguranca', () => {
  test('request without x-internal-key returns 401', async ({ page }) => {
    const response = await page.request.get(
      `${BASE_URL}/api/v1/bid-frete/cotacoes`,
      {
        headers: {
          'x-tenant-id': TENANT_ID,
          'x-user-id': 'user-teste',
        },
      },
    )
    expect(response.status()).toBe(401)
  })

  test('request with invalid x-internal-key returns 401', async ({ page }) => {
    const response = await page.request.get(
      `${BASE_URL}/api/v1/bid-frete/cotacoes`,
      {
        headers: {
          'x-internal-key': 'chave-invalida',
          'x-tenant-id': TENANT_ID,
          'x-user-id': 'user-teste',
        },
      },
    )
    expect(response.status()).toBe(401)
  })

  test('request without tenant_id returns 400 or 401', async ({ page }) => {
    const response = await page.request.get(
      `${BASE_URL}/api/v1/bid-frete/cotacoes`,
      {
        headers: {
          'x-internal-key': INTERNAL_KEY,
          'x-user-id': 'user-teste',
        },
      },
    )
    expect([400, 401, 403]).toContain(response.status())
  })
})

// ── Zod Validation ──────────────────────────────────────────────

test.describe('Regressao — Validacao Zod', () => {
  test('invalid cotacao payload returns 400 with VALIDATION_ERROR', async ({
    page,
  }) => {
    const response = await page.request.post(
      `${BASE_URL}/api/v1/bid-frete/cotacoes`,
      {
        data: { tipo_operacao: 'INVALIDO' },
        headers: {
          'Content-Type': 'application/json',
          'x-internal-key': INTERNAL_KEY,
          'x-tenant-id': TENANT_ID,
          'x-user-id': 'user-teste',
        },
      },
    )
    expect(response.status()).toBe(400)
    const body = await response.json()
    expect(body.error.code).toBe('VALIDATION_ERROR')
  })

  test('fornecedor without email returns 400 with VALIDATION_ERROR', async ({
    page,
  }) => {
    const response = await page.request.post(
      `${BASE_URL}/api/v1/bid-frete/fornecedores`,
      {
        data: { nome: 'Sem Email', tipo: 'AGENTE_CARGA' },
        headers: {
          'Content-Type': 'application/json',
          'x-internal-key': INTERNAL_KEY,
          'x-tenant-id': TENANT_ID,
          'x-user-id': 'user-teste',
        },
      },
    )
    expect(response.status()).toBe(400)
    const body = await response.json()
    expect(body.error.code).toBe('VALIDATION_ERROR')
  })
})

// ── Data Integrity ──────────────────────────────────────────────

test.describe('Regressao — Integridade de Dados', () => {
  test('invalid status transition is rejected', async ({ page }) => {
    const cotacao = await seedCotacao(page)

    const response = await page.request.patch(
      `${BASE_URL}/api/v1/bid-frete/cotacoes/${cotacao.id}/status`,
      {
        data: { status: 'APROVADA' },
        headers: {
          'Content-Type': 'application/json',
          'x-internal-key': INTERNAL_KEY,
          'x-tenant-id': TENANT_ID,
          'x-user-id': 'user-teste',
        },
      },
    )
    expect([400, 422]).toContain(response.status())
  })

  test('deleting non-draft cotacao returns error', async ({ page }) => {
    const cotacao = await seedCotacao(page)
    const forn = await seedFornecedor(page)

    // Change status to EM_COTACAO via disparo
    await apiPost(page, '/api/v1/bid-frete/bids/disparar', {
      cotacao_id: cotacao.id,
      fornecedor_ids: [forn.id],
      canal: 'EMAIL',
    })

    const response = await page.request.delete(
      `${BASE_URL}/api/v1/bid-frete/cotacoes/${cotacao.id}`,
      {
        headers: {
          'x-internal-key': INTERNAL_KEY,
          'x-tenant-id': TENANT_ID,
          'x-user-id': 'user-teste',
        },
      },
    )
    expect([400, 403, 409, 422]).toContain(response.status())
  })

  test('health check returns ok', async ({ page }) => {
    const response = await page.request.get(`${BASE_URL}/health`)
    expect(response.ok()).toBe(true)
    const data = await response.json()
    expect(data.status).toBe('ok')
    expect(data.service).toContain('bid-frete')
  })
})
