/**
 * Teste em tela + API — limite 1.000 linhas Smart Import
 * Uso: npx tsx testes/testes-em-tela/pedido/run-import-limite-linhas.ts
 */
import { chromium } from 'playwright'
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { Blob } from 'node:buffer'
import dotenv from 'dotenv'
import { clerk, clerkSetup } from '@clerk/testing/playwright'

const __dirRoot = dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: resolve(__dirRoot, '../../../.env.local') })
dotenv.config({ path: resolve(__dirRoot, '../../../servicos-global/configurador/.env') })
dotenv.config({ path: resolve(__dirRoot, '../../../servicos-global/produto/pedido/.env') })

if (!process.env.CLERK_PUBLISHABLE_KEY && process.env.VITE_CLERK_PUBLISHABLE_KEY) {
  process.env.CLERK_PUBLISHABLE_KEY = process.env.VITE_CLERK_PUBLISHABLE_KEY
}

const __dirname = dirname(fileURLToPath(import.meta.url))
const OUT = resolve(__dirname, '2026-05-28-import-limite-linhas')
const BASE_UI = process.env.PLAYWRIGHT_BASE_URL ?? 'http://localhost:8000'
const API = process.env.PEDIDO_API_URL ?? 'http://localhost:8030'
const CHAVE = process.env.CHAVE_INTERNA_SERVICO ?? 'gravity-dev-internal-key-2026'
const CSV_1000 = resolve(__dirname, '../../../scripts/_tmp-import-limite/import-limite-1000-linhas.csv')
const CSV_1001 = resolve(__dirname, '../../../scripts/_tmp-import-limite/import-limite-1001-linhas.csv')
const WORKSPACE_CDE_PADRAO = process.env.ID_WORKSPACE_TESTE ?? 'cmorx5iwh000aclwynp7y1ofm'

const linhas: string[] = []

function log(msg: string) {
  linhas.push(msg)
  console.log(msg)
}

async function obterIdOrganizacao(): Promise<string> {
  const res = await fetch(`${API}/api/v1/pedidos?limit=1`, {
    headers: {
      'x-chave-interna-servico': CHAVE,
      'x-id-organizacao': 'probe',
    },
  }).catch(() => null)

  // Fallback: org usada em seeds locais comuns
  if (!res || res.status === 401 || res.status === 403 || res.status === 404) {
    return process.env.ID_ORGANIZACAO_TESTE ?? 'cmo6henln0000ly9mwvx3zbia'
  }

  try {
    const json = await res.json() as { data?: Array<{ id_organizacao?: string }> }
    const id = json.data?.[0]?.id_organizacao
    if (id) return id
  } catch { /* ignore */ }

  return process.env.ID_ORGANIZACAO_TESTE ?? 'cmo6henln0000ly9mwvx3zbia'
}

async function analisarArquivo(caminho: string, idOrganizacao: string): Promise<{ status: number; body: unknown }> {
  const nome = caminho.split(/[/\\]/).pop() ?? 'test.csv'
  const form = new FormData()
  form.append('arquivo', new Blob([readFileSync(caminho)], { type: 'text/csv' }), nome)

  const res = await fetch(`${API}/api/v1/pedidos/importacoes-inteligentes/analisar`, {
    method: 'POST',
    headers: {
      'x-chave-interna-servico': CHAVE,
      'x-id-organizacao': idOrganizacao,
    },
    body: form,
  })

  let body: unknown
  try {
    body = await res.json()
  } catch {
    body = await res.text()
  }
  return { status: res.status, body }
}

async function testarApi(idOrganizacao: string) {
  log(`\n── API (${API}) org=${idOrganizacao} ──`)

  const ok1000 = await analisarArquivo(CSV_1000, idOrganizacao)
  log(`API 1000 linhas: HTTP ${ok1000.status}`)
  if (ok1000.status === 200) {
    const preview = ok1000.body as { total_linhas?: number }
    log(`  total_linhas=${preview.total_linhas ?? '?'}`)
    if (preview.total_linhas !== 1000) {
      throw new Error(`Esperado total_linhas=1000, recebeu ${preview.total_linhas}`)
    }
    log('  ✓ PASS — 1000 linhas aceitas')
  } else {
    log(`  body: ${JSON.stringify(ok1000.body).slice(0, 300)}`)
    throw new Error(`1000 linhas deveria retornar 200, recebeu ${ok1000.status}`)
  }

  const bloq1001 = await analisarArquivo(CSV_1001, idOrganizacao)
  log(`API 1001 linhas: HTTP ${bloq1001.status}`)
  const err = (bloq1001.body as { error?: { code?: string; message?: string } })?.error
  if (bloq1001.status !== 400 || err?.code !== 'LIMITE_LINHAS_EXCEDIDO') {
    log(`  body: ${JSON.stringify(bloq1001.body).slice(0, 300)}`)
    throw new Error(`1001 linhas deveria retornar 400 LIMITE_LINHAS_EXCEDIDO`)
  }
  log(`  ✓ PASS — bloqueado: ${err.message?.slice(0, 80)}`)
}

async function aguardarWorkspaceAtivo(page: import('playwright').Page): Promise<void> {
  const ok = await page.waitForFunction((wsId) => {
    try {
      const sess = sessionStorage.getItem('gravity_company_id')
      if (sess) return true
      const raw = localStorage.getItem('gravity-shell-state')
      if (raw) {
        const parsed = JSON.parse(raw) as { state?: { idWorkspaceAtivo?: string | null } }
        if (parsed.state?.idWorkspaceAtivo) return true
      }
    } catch { /* ignore */ }
    return false
  }, WORKSPACE_CDE_PADRAO, { timeout: 15000 }).then(() => true).catch(() => false)

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

async function aguardarListaCarregada(page: import('playwright').Page): Promise<void> {
  await page.getByRole('button', { name: /novo/i }).first().waitFor({ timeout: 30000 })
  await page.waitForTimeout(2000)
}

async function aguardarMeComOrganizacao(page: import('playwright').Page): Promise<void> {
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

async function autenticarClerk(page: import('playwright').Page): Promise<boolean> {
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

async function abrirModalImportacao(page: import('playwright').Page): Promise<void> {
  const btnNovo = page.getByRole('button', { name: /novo/i }).first()
  await btnNovo.waitFor({ timeout: 20000 })
  await btnNovo.click()
  await page.waitForTimeout(400)

  const itemNovoPedido = page.getByText('Novo Pedido', { exact: true }).first()
  await itemNovoPedido.waitFor({ timeout: 5000 })
  await itemNovoPedido.hover()
  await page.waitForTimeout(500)

  const importar = page.getByText('Importação', { exact: true }).first()
  await importar.waitFor({ state: 'visible', timeout: 8000 })
  await importar.click()
  await page.waitForTimeout(1000)

  await page.getByText(/importar pedidos|arraste|solte|1000 linhas|10MB/i).first().waitFor({ timeout: 15000 })
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

    await page.goto(`${BASE_UI}/pedido/pedidos/lista`, { waitUntil: 'domcontentloaded', timeout: 45000 })
    await aguardarListaCarregada(page)
    await aguardarWorkspaceAtivo(page)
    await page.reload({ waitUntil: 'domcontentloaded' })
    await aguardarListaCarregada(page)
    await page.screenshot({ path: resolve(OUT, '01-lista-pedidos-carregada.png'), fullPage: true })
    log(`URL lista: ${page.url()}`)

    if (page.url().includes('/login') || page.url().includes('accounts.dev')) {
      throw new Error(`UI bloqueada por login — URL ${page.url()}`)
    }

    await abrirModalImportacao(page)
    await page.screenshot({ path: resolve(OUT, '02-modal-importar-aberto.png'), fullPage: true })

    const limiteTexto = page.getByText(/máximo:\s*1000\s*linhas|maximum:\s*1000/i)
    await limiteTexto.waitFor({ timeout: 10000 })
    log('✓ PASS — texto "Máximo: 1000 linhas" visível no upload')

    // Upload 1001 linhas — deve mostrar erro
    const inputFile = page.locator('input[type="file"]').first()
    await inputFile.setInputFiles(CSV_1001)
    await page.waitForTimeout(6000)
    await page.screenshot({ path: resolve(OUT, '03-erro-1001-linhas.png'), fullPage: true })

    const erroLimite = page.getByText('Planilha com linhas demais').first()
    await erroLimite.waitFor({ timeout: 25000 })
    log('✓ PASS — erro de limite exibido na UI para 1001 linhas')

    await page.getByRole('button', { name: /cancelar/i }).first().click()
    await page.waitForTimeout(800)
    await abrirModalImportacao(page)
    await page.locator('input[type="file"]').first().setInputFiles(CSV_1000)
    await page.getByText(/campos essenciais mapeados|\d+ de \d+/i).first().waitFor({ timeout: 90000 })
    await page.screenshot({ path: resolve(OUT, '04-mapeamento-1000-linhas.png'), fullPage: true })
    log('✓ PASS — 1000 linhas avançou para etapa Mapeamento')
  } finally {
    await browser.close()
  }
}

async function main() {
  mkdirSync(OUT, { recursive: true })
  log(`Teste limite import — ${new Date().toISOString()}`)
  log(`Prints: ${OUT}`)

  await clerkSetup({ debug: false, dotenv: false })
  log('✓ Clerk testing token configurado')

  const idOrg = await obterIdOrganizacao()
  await testarApi(idOrg)
  await testarUi()

  writeFileSync(resolve(OUT, 'RESULTADO.txt'), linhas.join('\n'), 'utf-8')
  log('\n✅ Teste concluído — veja RESULTADO.txt e screenshots')
}

main().catch((err) => {
  console.error(err)
  writeFileSync(resolve(OUT, 'RESULTADO.txt'), [...linhas, `ERRO: ${err instanceof Error ? err.message : String(err)}`].join('\n'), 'utf-8')
  process.exit(1)
})
