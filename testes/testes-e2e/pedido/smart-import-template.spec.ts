/**
 * smart-import-template.spec.ts
 * Valida que o endpoint GET /api/v1/pedidos/smart-import/template
 * retorna 200 + xlsx sem exigir autenticação (fix: requireInternalKey + tenantIsolation isentos).
 */

import { test, expect } from '@playwright/test'

const BACKEND = 'http://localhost:8026'
const ENDPOINT = `${BACKEND}/api/v1/pedidos/smart-import/template`

test.describe('Smart Import — Download de planilha modelo', () => {
  test('GET /template retorna 200 sem headers de autenticação', async ({ request }) => {
    const res = await request.get(ENDPOINT)
    expect(res.status()).toBe(200)
  })

  test('Content-Type é xlsx', async ({ request }) => {
    const res = await request.get(ENDPOINT)
    const ct = res.headers()['content-type'] ?? ''
    expect(ct).toContain('openxmlformats-officedocument.spreadsheetml.sheet')
  })

  test('Content-Disposition indica download do arquivo correto', async ({ request }) => {
    const res = await request.get(ENDPOINT)
    const cd = res.headers()['content-disposition'] ?? ''
    expect(cd).toContain('attachment')
    expect(cd).toContain('template-importacao-pedidos.xlsx')
  })

  test('Arquivo tem conteúdo (Content-Length > 0)', async ({ request }) => {
    const res = await request.get(ENDPOINT)
    const cl = parseInt(res.headers()['content-length'] ?? '0', 10)
    expect(cl).toBeGreaterThan(0)
  })

  test('Endpoint não retorna 401 nem 500', async ({ request }) => {
    const res = await request.get(ENDPOINT)
    expect(res.status()).not.toBe(401)
    expect(res.status()).not.toBe(500)
  })
})
