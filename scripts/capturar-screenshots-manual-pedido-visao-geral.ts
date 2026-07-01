/**
 * Captura as 4 visualizações do Pedido para o manual University (Visão geral).
 * Uso: npx tsx scripts/capturar-screenshots-manual-pedido-visao-geral.ts
 */
import { chromium, type Page } from 'playwright'
import { mkdirSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import dotenv from 'dotenv'
import { clerk, clerkSetup } from '@clerk/testing/playwright'

const __dirRoot = dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: resolve(__dirRoot, '../.env.local') })
dotenv.config({ path: resolve(__dirRoot, '../servicos-global/configurador/.env') })

if (!process.env.CLERK_PUBLISHABLE_KEY && process.env.VITE_CLERK_PUBLISHABLE_KEY) {
  process.env.CLERK_PUBLISHABLE_KEY = process.env.VITE_CLERK_PUBLISHABLE_KEY
}

const BASE_UI = process.env.PLAYWRIGHT_BASE_URL ?? 'http://localhost:8001'
const WORKSPACE_CDE_PADRAO = process.env.ID_WORKSPACE_TESTE ?? 'cmorx5iwh000aclwynp7y1ofm'
const OUT = resolve(
  __dirRoot,
  '../servicos-global/configurador/public/university/screenshots',
)

const CAPTURAS: { rota: string; arquivo: string; espera?: string }[] = [
  { rota: '/pedido/pedidos/visao-geral', arquivo: 'pedido-tela-principal.png', espera: 'canvas, .visao-geral, [data-testid]' },
  { rota: '/pedido/pedidos/lista', arquivo: 'pedido-lista.png', espera: '.gtv-linha--pai' },
  { rota: '/pedido/pedidos/dashboard', arquivo: 'pedido-dashboard.png', espera: '.pedido-dashboard, [data-testid="dashboard-toolbar-icones"]' },
  { rota: '/pedido/pedidos/kanban', arquivo: 'pedido-kanban.png', espera: '.kanban, [class*="kanban"]' },
]

async function aguardarWorkspaceAtivo(page: Page): Promise<void> {
  const ok = await page
    .waitForFunction(() => {
      try {
        if (sessionStorage.getItem('gravity_company_id')) return true
        const raw = localStorage.getItem('gravity-shell-state')
        if (raw) {
          const parsed = JSON.parse(raw) as { state?: { idWorkspaceAtivo?: string | null } }
          if (parsed.state?.idWorkspaceAtivo) return true
        }
      } catch {
        /* ignore */
      }
      return false
    }, undefined, { timeout: 15000 })
    .then(() => true)
    .catch(() => false)

  if (!ok) {
    await page.evaluate((wsId) => {
      sessionStorage.setItem('gravity_company_id', wsId)
      const key = 'gravity-shell-state'
      const raw = localStorage.getItem(key)
      if (raw) {
        const parsed = JSON.parse(raw) as { state?: Record<string, unknown> }
        parsed.state = { ...parsed.state, idWorkspaceAtivo: wsId }
        localStorage.setItem(key, JSON.stringify(parsed))
      }
    }, WORKSPACE_CDE_PADRAO)
  }
}

async function aguardarMeComOrganizacao(page: Page): Promise<void> {
  await page.waitForResponse(
    (r) => r.url().includes('/api/v1/me') && r.status() === 200,
    { timeout: 30000 },
  ).catch(() => undefined)
  await page.waitForTimeout(800)
}

async function autenticarClerk(page: Page): Promise<void> {
  const email =
    process.env.E2E_CLERK_USER_EMAIL ??
    process.env.E2E_EMAIL ??
    'dmmltda@gmail.com'

  if (!process.env.CLERK_SECRET_KEY) {
    throw new Error('CLERK_SECRET_KEY ausente — não é possível capturar prints autenticados')
  }

  await page.goto(`${BASE_UI}/login`, { waitUntil: 'domcontentloaded', timeout: 45000 })
  await clerk.signIn({ page, emailAddress: email })
  await aguardarMeComOrganizacao(page)
}

async function capturarTela(page: Page, cap: (typeof CAPTURAS)[number]): Promise<void> {
  await aguardarWorkspaceAtivo(page)
  await page.goto(`${BASE_UI}${cap.rota}`, { waitUntil: 'domcontentloaded', timeout: 45000 })
  await page.waitForTimeout(2000)

  if (cap.espera) {
    await page.locator(cap.espera).first().waitFor({ timeout: 25000 }).catch(() => undefined)
  }

  await page.waitForTimeout(1200)
  const destino = resolve(OUT, cap.arquivo)
  await page.screenshot({ path: destino, fullPage: false })
  console.log(`OK ${cap.rota} -> ${cap.arquivo}`)
}

async function main() {
  mkdirSync(OUT, { recursive: true })
  console.log(`Capturando prints Pedido em ${BASE_UI} -> ${OUT}`)

  await clerkSetup({ debug: false, dotenv: false })

  const browser = await chromium.launch({ headless: true, channel: 'chrome' })
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })

  try {
    await autenticarClerk(page)
    for (const cap of CAPTURAS) {
      await capturarTela(page, cap)
    }
    console.log('\n✅ 4 screenshots salvos — faça hard refresh em :8001/university-gravity/docs/pedido')
  } finally {
    await browser.close()
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
