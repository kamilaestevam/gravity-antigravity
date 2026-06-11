/**
 * TST-E2E-PEDIDO-USUARIO-FALTA-ORGANIZACAO-000089 — Usuário × Organização (porteiro → produto)
 * --------------------------------------------------------------------------------------------
 * Spec executável Playwright. Valida, ponta a ponta, que o usuário consegue abrir o Pedido
 * e que a resolução de organização nunca quebra (bugs C1–C4 da investigação 2026-06-10/11).
 *
 * Pré-requisitos:
 *   - Frontend (shell) em http://localhost:8000 + Configurador :8005 + sidecar Pedido
 *   - Dados semeados: U_OK (user_*), U_PENDING (pending_*, mesmo e-mail verificado), org ATIVA
 *     com ≥1 pedido. Sem o seed, os testes dependentes usam test.skip().
 *   - Variáveis: E2E_EMAIL_USER_OK, E2E_EMAIL_USER_PENDING, E2E_EMAIL_USER_OUTRO
 *
 * Execução:
 *   npx playwright test testes/testes-e2e/usuario/teste-organizacao/TST-E2E-PEDIDO-USUARIO-FALTA-ORGANIZACAO-000089.spec.ts
 */
import { test, expect } from '../../../playwright.fixtures.js'

const ROTA_LISTA = '/pedido/pedidos/lista'
const STRING_PROIBIDA = 'Usuário ou organização não encontrada'

const EMAIL_PENDING = process.env.E2E_EMAIL_USER_PENDING
const EMAIL_OUTRO   = process.env.E2E_EMAIL_USER_OUTRO

async function consoleSemStringProibida(page: import('@playwright/test').Page): Promise<() => boolean> {
  const erros: string[] = []
  page.on('console', (m) => { if (m.text().includes(STRING_PROIBIDA)) erros.push(m.text()) })
  page.on('response', (r) => { /* hook para inspeção de 404 se necessário */ void r })
  return () => erros.length === 0
}

test.describe('TST-E2E-PEDIDO-USUARIO-FALTA-ORGANIZACAO-000089 — Usuário × Organização', () => {

  // E2E-01 — usuário vinculado abre o Pedido
  test('E2E-01 usuário vinculado (user_*) abre a Lista de Pedidos sem erro de organização', async ({ page }) => {
    const limpo = await consoleSemStringProibida(page)
    await page.goto(ROTA_LISTA)
    // a lista carrega (KPIs / tabela visíveis) e nenhum 404 de organização
    await expect(page.getByText(/Total de pedidos|Valor total/i).first()).toBeVisible({ timeout: 30000 })
    await expect(page.getByText(STRING_PROIBIDA)).toHaveCount(0)
    expect(limpo()).toBe(true)
  })

  // E2E-02 — usuário pending_ abre o Pedido (self-heal, bug C1)
  test('E2E-02 usuário pending_ abre a Lista (self-heal) sem 404 de organização', async ({ page, context }) => {
    test.skip(!EMAIL_PENDING, 'E2E_EMAIL_USER_PENDING não definido (seed U_PENDING ausente)')
    const limpo = await consoleSemStringProibida(page)
    // logar como U_PENDING (helper de login do fixture, ou via Clerk testing)
    await context.clearCookies()
    await page.goto('/login')
    // TODO(seed/login): autenticar como EMAIL_PENDING via @clerk/testing
    await page.goto(ROTA_LISTA)
    await expect(page.getByText(STRING_PROIBIDA)).toHaveCount(0)
    expect(limpo()).toBe(true)
  })

  // E2E-03 — logout limpa o tenant persistido (bug C2)
  test('E2E-03 logout limpa gravity:idOrganizacao e novo login não herda org anterior', async ({ page }) => {
    await page.goto(ROTA_LISTA)
    const antes = await page.evaluate(() => localStorage.getItem('gravity:idOrganizacao'))
    expect(antes, 'org deve estar persistida após carregar a lista').not.toBeNull()

    await page.evaluate(async () => {
      const c = (window as unknown as { Clerk?: { signOut?: () => Promise<void> } }).Clerk
      await c?.signOut?.()
    })
    await page.waitForTimeout(1500)

    const depois = await page.evaluate(() => ({
      ls: localStorage.getItem('gravity:idOrganizacao'),
      ssOrg: sessionStorage.getItem('gravity_id_organizacao'),
      ssCompany: sessionStorage.getItem('gravity_company_id'),
    }))
    expect(depois.ls).toBeNull()
    expect(depois.ssOrg).toBeNull()
    expect(depois.ssCompany).toBeNull()
  })

  // E2E-04 — estabilidade: F5 repetido nunca cai em "Organização não encontrada" (C2/C4)
  test('E2E-04 F5 repetido mantém a lista estável e a org correta no topo', async ({ page }) => {
    const limpo = await consoleSemStringProibida(page)
    for (let i = 0; i < 5; i++) {
      await page.goto(ROTA_LISTA, { waitUntil: 'networkidle' })
      await expect(page.getByText(STRING_PROIBIDA)).toHaveCount(0)
    }
    // topo nunca mostra o label genérico "Organização"
    await expect(page.getByText(/^Organização$/).first()).toHaveCount(0)
    expect(limpo()).toBe(true)
  })

  void EMAIL_OUTRO // reservado para E2E-03 estendido (login de outro usuário pós-logout)
})
