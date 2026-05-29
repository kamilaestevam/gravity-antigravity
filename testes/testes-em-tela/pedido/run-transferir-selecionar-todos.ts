/**
 * Teste em tela — checkbox "Selecionar todos os itens" no modal Transferir Pedido (passo 2)
 * Uso: npx tsx testes/testes-em-tela/pedido/run-transferir-selecionar-todos.ts
 */
import { chromium, type Page } from 'playwright'
import { mkdirSync, writeFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import dotenv from 'dotenv'
import { clerk, clerkSetup } from '@clerk/testing/playwright'

const __dirRoot = dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: resolve(__dirRoot, '../../../.env.local') })
dotenv.config({ path: resolve(__dirRoot, '../../../servicos-global/configurador/.env') })
dotenv.config({ path: resolve(__dirRoot, '../../../servicos-global/produto/pedido/.env') })

if (!process.env.CLERK_PUBLISHABLE_KEY && process.env.VITE_CLERK_PUBLISHABLE_KEY) {
  process.env.CLERK_PUBLISHABLE_KEY = process.env.VITE_CLERK_PUBLISHABLE_KEY
}

const OUT = resolve(__dirRoot, '2026-05-28-transferir-selecionar-todos')
const BASE_UI = process.env.PLAYWRIGHT_BASE_URL ?? 'http://localhost:8001'
const WORKSPACE_CDE_PADRAO = process.env.ID_WORKSPACE_TESTE ?? 'cmorx5iwh000aclwynp7y1ofm'

const linhas: string[] = []

function log(msg: string) {
  linhas.push(msg)
  console.log(msg)
}

async function aguardarWorkspaceAtivo(page: Page): Promise<void> {
  const ok = await page.waitForFunction(() => {
    try {
      if (sessionStorage.getItem('gravity_company_id')) return true
      const raw = localStorage.getItem('gravity-shell-state')
      if (raw) {
        const parsed = JSON.parse(raw) as { state?: { idWorkspaceAtivo?: string | null } }
        if (parsed.state?.idWorkspaceAtivo) return true
      }
    } catch { /* ignore */ }
    return false
  }, undefined, { timeout: 15000 }).then(() => true).catch(() => false)

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
    log(`⚠ Workspace forçado via sessionStorage (${WORKSPACE_CDE_PADRAO})`)
  } else {
    log('✓ Workspace ativo detectado no shell')
  }
}

async function aguardarListaCarregada(page: Page): Promise<void> {
  await page.getByRole('button', { name: /novo/i }).first().waitFor({ timeout: 30000 })
  await page.locator('.gtv-linha--pai .gtv-chevron-btn').first().waitFor({ timeout: 20000 })
  await page.waitForTimeout(1500)
}

async function garantirListaPedidos(page: Page): Promise<void> {
  await aguardarWorkspaceAtivo(page)
  await page.goto(`${BASE_UI}/pedido/pedidos/lista`, { waitUntil: 'domcontentloaded', timeout: 45000 })
  await page.waitForTimeout(1000)

  if (page.url().includes('/hub')) {
    log('⚠ Redirecionado ao hub — tentando navegar novamente para lista')
    await aguardarWorkspaceAtivo(page)
    await page.goto(`${BASE_UI}/pedido/pedidos/lista`, { waitUntil: 'domcontentloaded', timeout: 45000 })
    await page.waitForTimeout(1500)
  }

  if (page.url().includes('/hub')) {
    throw new Error(`Não foi possível acessar lista de pedidos — permaneceu em ${page.url()}`)
  }

  await aguardarListaCarregada(page)
}

async function aguardarMeComOrganizacao(page: Page): Promise<void> {
  await page.waitForFunction(async () => {
    const clerkGlobal = (window as unknown as { Clerk?: { session?: { getToken: () => Promise<string | null> } } }).Clerk
    if (!clerkGlobal?.session) return false
    const token = await clerkGlobal.session.getToken()
    if (!token) return false
    const res = await fetch('/api/v1/me', { headers: { Authorization: `Bearer ${token}` } })
    if (res.status !== 200) return false
    const data = await res.json() as { organizacao?: { id_organizacao?: string } | null }
    return Boolean(data.organizacao?.id_organizacao)
  }, undefined, { timeout: 45000 })
}

async function autenticarClerk(page: Page): Promise<boolean> {
  const email =
    process.env.E2E_CLERK_USER_EMAIL ??
    process.env.E2E_EMAIL ??
    'dmmltda@gmail.com'

  if (!process.env.CLERK_SECRET_KEY) {
    log('⚠ CLERK_SECRET_KEY ausente — pulando login automático')
    return false
  }

  await page.goto(`${BASE_UI}/login`, { waitUntil: 'domcontentloaded', timeout: 45000 })
  await clerk.signIn({ page, emailAddress: email })
  await aguardarMeComOrganizacao(page)
  log(`✓ Clerk sign-in + /me com organização (${email})`)
  return true
}

async function selecionarPrimeiroPedido(page: Page): Promise<void> {
  const checkboxPai = page.locator('.gtv-linha--pai .gtv-checkbox').first()
  await checkboxPai.waitFor({ timeout: 20000 })
  await checkboxPai.click()
  await page.waitForTimeout(500)
  log('✓ Primeiro pedido selecionado na lista')
}

async function abrirModalTransferir(page: Page): Promise<void> {
  const btnTransferir = page.getByRole('button', { name: /transferir/i }).first()
  await btnTransferir.waitFor({ timeout: 10000 })
  await btnTransferir.click()
  await page.getByText(/transferir pedido/i).first().waitFor({ timeout: 15000 })
  log('✓ Modal Transferir Pedido aberto')
}

async function avancarPassoCenario(page: Page): Promise<void> {
  await page.getByText(/split.*novo pedido|novo pedido derivado/i).first().click()
  await page.waitForTimeout(400)
  await page.getByRole('button', { name: /próximo|proximo|next/i }).click()
  await page.locator('table.modal-transferir__tabela-itens').waitFor({ timeout: 10000 })
  log('✓ Passo 2 (itens) carregado')
}

async function contarCheckboxesModal(page: Page): Promise<{ linhas: number; linhasMarcadas: number; headerMarcado: boolean }> {
  return page.evaluate(() => {
    const tabela = document.querySelector('table.modal-transferir__tabela-itens')
    if (!tabela) return { linhas: 0, linhasMarcadas: 0, headerMarcado: false }
    const header = tabela.querySelector('thead input[type="checkbox"]') as HTMLInputElement | null
    const linhasChecks = Array.from(
      tabela.querySelectorAll('tbody input[type="checkbox"]'),
    ) as HTMLInputElement[]
    return {
      linhas: linhasChecks.length,
      linhasMarcadas: linhasChecks.filter(c => c.checked).length,
      headerMarcado: header?.checked ?? false,
    }
  })
}

async function obterEstadoCheckboxTodos(page: Page): Promise<{ checked: boolean; indeterminate: boolean }> {
  return page.evaluate(() => {
    const el = document.querySelector(
      'table.modal-transferir__tabela-itens thead input[type="checkbox"]',
    ) as HTMLInputElement | null
    if (!el) return { checked: false, indeterminate: false }
    return { checked: el.checked, indeterminate: el.indeterminate }
  })
}

async function testarUi() {
  log(`\n── UI (${BASE_UI}/pedido/pedidos/lista) ──`)
  mkdirSync(OUT, { recursive: true })

  const browser = await chromium.launch({ headless: true, channel: 'chrome' })
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })

  try {
    const autenticado = await autenticarClerk(page)
    if (!autenticado) {
      throw new Error('Falha na autenticação Clerk — não foi possível validar a UI')
    }

    await garantirListaPedidos(page)
    await page.reload({ waitUntil: 'domcontentloaded' })
    await aguardarListaCarregada(page)
    await page.screenshot({ path: resolve(OUT, '01-lista-pedidos-carregada.png'), fullPage: false })
    log(`URL lista: ${page.url()}`)

    if (page.url().includes('/login') || page.url().includes('accounts.dev')) {
      throw new Error(`UI bloqueada por login — URL ${page.url()}`)
    }

    await selecionarPrimeiroPedido(page)
    await page.screenshot({ path: resolve(OUT, '02-pedido-selecionado.png'), fullPage: false })

    await abrirModalTransferir(page)
    await page.screenshot({ path: resolve(OUT, '03-modal-transferir-passo1.png'), fullPage: false })

    await avancarPassoCenario(page)

    const checkboxTodos = page.locator(
      'table.modal-transferir__tabela-itens thead input[type="checkbox"]',
    )
    await checkboxTodos.waitFor({ timeout: 5000 })
    const ariaLabel = await checkboxTodos.getAttribute('aria-label')
    if (!ariaLabel || !/selecionar todos/i.test(ariaLabel)) {
      throw new Error(`aria-label inesperado no checkbox header: "${ariaLabel}"`)
    }
    log(`✓ Checkbox header presente — aria-label="${ariaLabel}"`)

    let estado = await contarCheckboxesModal(page)
    log(`Estado inicial: ${estado.linhasMarcadas}/${estado.linhas} linhas marcadas (header=${estado.headerMarcado})`)
    await page.screenshot({ path: resolve(OUT, '04-passo2-todos-pre-selecionados.png'), fullPage: false })

    if (estado.linhas < 1) {
      throw new Error('Tabela de itens sem linhas suficientes para validar seleção')
    }

    const headerInicial = await obterEstadoCheckboxTodos(page)
    if (!headerInicial.checked) {
      throw new Error('Esperado header checked quando todos os itens vêm pré-selecionados')
    }
    log('✓ PASS — header marcado com todos os itens pré-selecionados')

    await checkboxTodos.click()
    await page.waitForTimeout(400)
    estado = await contarCheckboxesModal(page)
    log(`Após desmarcar todos: ${estado.linhasMarcadas}/${estado.linhas}`)
    await page.screenshot({ path: resolve(OUT, '05-passo2-nenhum-selecionado.png'), fullPage: false })

    if (estado.linhasMarcadas !== 0) {
      throw new Error(`Desmarcar todos deveria zerar seleção, restaram ${estado.linhasMarcadas}`)
    }
    log('✓ PASS — desmarcar todos limpou seleção')

    await checkboxTodos.click()
    await page.waitForTimeout(400)
    estado = await contarCheckboxesModal(page)
    log(`Após marcar todos: ${estado.linhasMarcadas}/${estado.linhas}`)
    await page.screenshot({ path: resolve(OUT, '06-passo2-todos-selecionados-novamente.png'), fullPage: false })

    if (estado.linhasMarcadas !== estado.linhas) {
      throw new Error(
        `Marcar todos deveria selecionar ${estado.linhas} linhas, marcou ${estado.linhasMarcadas}`,
      )
    }
    log('✓ PASS — marcar todos selecionou todas as linhas')

    const linhasChecks = page.locator('table.modal-transferir__tabela-itens tbody input[type="checkbox"]')
    await linhasChecks.first().click()
    await page.waitForTimeout(300)
    const headerParcial = await obterEstadoCheckboxTodos(page)
    await page.screenshot({ path: resolve(OUT, '07-passo2-selecao-parcial-indeterminado.png'), fullPage: false })

    if (headerParcial.checked || !headerParcial.indeterminate) {
      throw new Error(
        `Esperado header indeterminado em seleção parcial (checked=${headerParcial.checked}, indeterminate=${headerParcial.indeterminate})`,
      )
    }
    log('✓ PASS — header indeterminado com seleção parcial')
  } finally {
    await browser.close()
  }
}

async function main() {
  mkdirSync(OUT, { recursive: true })
  log(`Teste transferir selecionar todos — ${new Date().toISOString()}`)
  log(`Prints: ${OUT}`)

  await clerkSetup({ debug: false, dotenv: false })
  log('✓ Clerk testing token configurado')

  await testarUi()

  writeFileSync(resolve(OUT, 'RESULTADO.txt'), linhas.join('\n'), 'utf-8')
  log('\n✅ Teste em tela PASSOU — veja RESULTADO.txt e screenshots')
}

main().catch((err) => {
  console.error(err)
  mkdirSync(OUT, { recursive: true })
  writeFileSync(
    resolve(OUT, 'RESULTADO.txt'),
    [...linhas, `ERRO: ${err instanceof Error ? err.message : String(err)}`].join('\n'),
    'utf-8',
  )
  process.exit(1)
})
