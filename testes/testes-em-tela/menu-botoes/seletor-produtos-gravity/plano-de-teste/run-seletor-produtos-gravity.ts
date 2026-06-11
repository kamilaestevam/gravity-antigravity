/**
 * EMT — Seletor Produtos Gravity (MenuLateralGlobal + useProdutosSwitcher)
 * Plano: TST-EMB-MENU-LATERAL-SELECTOR-PRODUTOS-GRAVITY
 *
 * Uso: npx tsx testes/testes-em-tela/menu-botoes/seletor-produtos-gravity/plano-de-teste/run-seletor-produtos-gravity.ts
 */
import { chromium, type Page, type Locator } from 'playwright'
import { mkdirSync, writeFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import dotenv from 'dotenv'
import { clerk, clerkSetup } from '@clerk/testing/playwright'
import { aplicarChavesClerkParaAmbiente } from '../../../_lib/aplicar-chaves-clerk-ambiente.js'
import { resolverFeatureRootEmt, resolverPastaResultadoEmt } from '../../../_lib/resolver-pasta-resultado-emt.js'

const __dirRoot = dirname(fileURLToPath(import.meta.url))
const FEATURE_ROOT = resolverFeatureRootEmt(__dirRoot)
const REPO_ROOT = resolve(__dirRoot, '../../../../../../')
dotenv.config({ path: resolve(REPO_ROOT, '.env.local') })
dotenv.config({ path: resolve(REPO_ROOT, 'servicos-global/configurador/.env') })

const { ambiente: ambienteExec } = aplicarChavesClerkParaAmbiente()

const OUT = resolverPastaResultadoEmt(FEATURE_ROOT, process.env.EMT_RUN_ID ?? 'seletor-produtos-gravity')
const BASE_UI = process.env.PLAYWRIGHT_BASE_URL ?? 'http://localhost:8000'

const PRODUTO_EMT = 'Configurador'
const LOCAL_EMT = 'menu-botoes/seletor-produtos-gravity'
const SUBLOCAL_EMT = 'seletor-produtos-gravity'

const AMBIENTE_LABEL =
  process.env.GRAVITY_TEST_AMBIENTE === 'producao' || /usegravity\.com\.br/i.test(BASE_UI)
    ? 'Producao'
    : 'Local'

type ResultadoEmtLinha = 'Aprovado' | 'Reprovado'

const linhas: string[] = []
const falhas: string[] = []

function emtRow(acao: string, resultado: ResultadoEmtLinha): string {
  return `EMT_ROW|${AMBIENTE_LABEL}|${PRODUTO_EMT}|${LOCAL_EMT}|${SUBLOCAL_EMT}|${acao}|${resultado}`
}

function log(msg: string) {
  linhas.push(msg)
  console.log(msg)
}

function falhar(msg: string) {
  falhas.push(msg)
  log(`✗ ${msg}`)
}

function aprovar(acao: string) {
  log(`✓ ${emtRow(acao, 'Aprovado')}`)
}

function reprovar(acao: string, detalhe: string) {
  falhar(emtRow(acao, 'Reprovado'))
  falhar(detalhe)
}

async function screenshot(page: Page, nome: string) {
  mkdirSync(OUT, { recursive: true })
  await page.waitForTimeout(350)
  await page.screenshot({ path: `${OUT}/${nome}`, fullPage: false })
  log(`📸 ${nome}`)
}

interface OrigemEmt {
  slug: string
  url: string
  label: string
}

const ORIGENS: OrigemEmt[] = [
  { slug: 'pedido', url: '/pedido/pedidos/lista', label: 'Pedido' },
  { slug: 'bid-frete', url: '/bid-frete/lista', label: 'Bid Frete Internacional' },
  { slug: 'bid-cambio', url: '/bid-cambio/lista', label: 'BID Cambio' },
  { slug: 'processo', url: '/acesso-processos/lista', label: 'Processos' },
]

/** Padrões de URL após troca — espelham resolverNavegacaoTrocarProduto. */
function urlDestinoPorRotulo(rotulo: string): RegExp | null {
  const n = rotulo.toLowerCase()
  if (/processos/.test(n)) return /\/acesso-processos/i
  if (/pedido/.test(n)) return /\/pedido/i
  if (/bid\s*frete|frete\s*internacional/.test(n)) return /\/bid-frete/i
  if (/bid\s*c[aâ]mbio|c[aâ]mbio/.test(n) && !/processos/.test(n)) return /\/bid-cambio/i
  return null
}

function botaoSeletor(page: Page): Locator {
  return page.locator('button.mlg-logo-area--btn[aria-haspopup="listbox"]')
}

function listbox(page: Page): Locator {
  return page.locator('.mlg-prod-dropdown[role="listbox"]')
}

async function prepararEscopoWorkspaces(page: Page): Promise<void> {
  await page.evaluate(async () => {
    for (let i = sessionStorage.length - 1; i >= 0; i--) {
      const key = sessionStorage.key(i)
      if (key?.startsWith('pedido:workspaces_escopo')) sessionStorage.removeItem(key)
    }
    const clerkGlobal = (window as unknown as { Clerk?: { session?: { getToken: () => Promise<string | null> } } }).Clerk
    const token = await clerkGlobal?.session?.getToken()
    if (!token) return
    const meRes = await fetch('/api/v1/me', { headers: { Authorization: `Bearer ${token}` } })
    if (!meRes.ok) return
    const me = await meRes.json() as {
      organizacao?: { id_organizacao?: string } | null
      workspace_ativo?: { id_workspace?: string } | null
      workspaces?: Array<{ id_workspace?: string }>
    }
    const orgId = me.organizacao?.id_organizacao
    const wsId = me.workspace_ativo?.id_workspace ?? me.workspaces?.[0]?.id_workspace ?? null
    if (wsId) sessionStorage.setItem('gravity_company_id', wsId)
    if (orgId && me.workspaces?.length) {
      const ids = me.workspaces.map(w => w.id_workspace).filter((id): id is string => Boolean(id))
      if (ids.length > 0) {
        sessionStorage.setItem(`pedido:workspaces_escopo:${orgId}`, JSON.stringify(ids))
      }
    }
  })
}

async function autenticarClerk(page: Page): Promise<boolean> {
  const email = process.env.E2E_CLERK_USER_EMAIL ?? process.env.E2E_EMAIL ?? 'dmmltda@gmail.com'
  const senha = process.env.E2E_CLERK_USER_PASSWORD ?? process.env.E2E_PASSWORD
  if (!email || !process.env.CLERK_SECRET_KEY) {
    reprovar('Login Clerk', 'Credenciais Clerk ausentes')
    return false
  }
  await page.goto(`${BASE_UI}/login`, { waitUntil: 'domcontentloaded', timeout: 60000 })
  await page.waitForFunction(() => {
    const c = (window as unknown as { Clerk?: { loaded?: boolean; client?: unknown } }).Clerk
    return Boolean(c?.loaded && c?.client)
  }, undefined, { timeout: 60000 })
  try {
    if (senha) await clerk.signIn({ page, emailAddress: email, password: senha })
    else await clerk.signIn({ page, emailAddress: email })
  } catch (err) {
    reprovar('Login Clerk', `Clerk sign-in falhou: ${err instanceof Error ? err.message : String(err)}`)
    return false
  }
  await prepararEscopoWorkspaces(page)
  aprovar('Login Clerk + workspace')
  await screenshot(page, '00-login-ok.png')
  return true
}

async function irParaOrigem(page: Page, origem: OrigemEmt): Promise<boolean> {
  try {
    await page.goto(`${BASE_UI}${origem.url}`, { waitUntil: 'domcontentloaded', timeout: 60000 })
    await botaoSeletor(page).waitFor({ state: 'visible', timeout: 45000 })
    return true
  } catch (err) {
    reprovar(
      `Navegar origem ${origem.label}`,
      err instanceof Error ? err.message : String(err),
    )
    return false
  }
}

async function abrirDropdown(page: Page): Promise<boolean> {
  const btn = botaoSeletor(page)
  await btn.click()
  try {
    await listbox(page).waitFor({ state: 'visible', timeout: 8000 })
    await btn.waitFor({ state: 'attached' })
    const expanded = await btn.getAttribute('aria-expanded')
    if (expanded !== 'true') {
      reprovar('Abrir dropdown seletor', `aria-expanded=${expanded ?? 'null'}`)
      return false
    }
    return true
  } catch (err) {
    reprovar('Abrir dropdown seletor', err instanceof Error ? err.message : String(err))
    return false
  }
}

async function fecharDropdown(page: Page): Promise<boolean> {
  const btn = botaoSeletor(page)
  await btn.click()
  try {
    await listbox(page).waitFor({ state: 'hidden', timeout: 5000 })
    const expanded = await btn.getAttribute('aria-expanded')
    if (expanded === 'true') {
      reprovar('Contrair dropdown seletor', 'aria-expanded ainda true')
      return false
    }
    aprovar('Contrair dropdown seletor')
    return true
  } catch (err) {
    reprovar('Contrair dropdown seletor', err instanceof Error ? err.message : String(err))
    return false
  }
}

interface OpcaoDropdown {
  nome: string
  selecionada: boolean
}

async function listarOpcoes(page: Page): Promise<OpcaoDropdown[]> {
  const opcoes = listbox(page).locator('[role="option"]')
  const n = await opcoes.count()
  const out: OpcaoDropdown[] = []
  for (let i = 0; i < n; i++) {
    const el = opcoes.nth(i)
    const nome = (await el.innerText()).split('\n')[0]?.trim() ?? ''
    const selecionada = (await el.getAttribute('aria-selected')) === 'true'
    if (nome) out.push({ nome, selecionada })
  }
  return out
}

async function validarExistenciaEmTodasOrigens(page: Page): Promise<void> {
  let passo = 1
  for (const origem of ORIGENS) {
    if (!(await irParaOrigem(page, origem))) continue
    const visivel = await botaoSeletor(page).isVisible()
    if (visivel) {
      aprovar(`SPG-01 seletor existe em ${origem.label}`)
      await screenshot(page, `${String(passo).padStart(2, '0')}-${origem.slug}-seletor-existe.png`)
    } else {
      reprovar(`SPG-01 seletor existe em ${origem.label}`, 'Botão não visível')
    }
    passo += 1
  }
}

async function validarExpandirContrair(page: Page): Promise<void> {
  let passo = 5
  for (const origem of ORIGENS) {
    if (!(await irParaOrigem(page, origem))) continue
    if (await abrirDropdown(page)) {
      aprovar(`SPG-02 expandir dropdown em ${origem.label}`)
      await screenshot(page, `${String(passo).padStart(2, '0')}-${origem.slug}-dropdown-aberto.png`)
      passo += 1
      if (await fecharDropdown(page)) {
        await screenshot(page, `${String(passo).padStart(2, '0')}-${origem.slug}-dropdown-fechado.png`)
      }
      passo += 1
    }
  }
}

async function validarMatrizNavegacao(page: Page): Promise<void> {
  for (const origem of ORIGENS) {
    if (!(await irParaOrigem(page, origem))) continue
    if (!(await abrirDropdown(page))) continue

    const opcoes = await listarOpcoes(page)
    if (opcoes.length < 1) {
      reprovar(`SPG-03 listar opções em ${origem.label}`, 'Listbox vazio')
      await page.keyboard.press('Escape')
      continue
    }
    aprovar(`SPG-03 listar opções em ${origem.label} (${opcoes.length} itens)`)
    await screenshot(page, `matriz-${origem.slug}-opcoes.png`)

    for (const opcao of opcoes) {
      if (opcao.selecionada) {
        const navPromise = page.waitForEvent('framenavigated', { timeout: 2000 }).catch(() => null)
        if (!(await abrirDropdown(page))) {
          await irParaOrigem(page, origem)
          await abrirDropdown(page)
        }
        await listbox(page).getByRole('option', { name: new RegExp(opcao.nome, 'i') }).first().click()
        const nav = await navPromise
        if (nav === null) {
          aprovar(`SPG-05 noop ${origem.label} → ${opcao.nome} (já selecionado)`)
        } else {
          reprovar(`SPG-05 noop ${origem.label} → ${opcao.nome}`, 'Página recarregou indevidamente')
        }
        continue
      }

      if (!(await irParaOrigem(page, origem))) continue
      if (!(await abrirDropdown(page))) continue

      const padraoUrl = urlDestinoPorRotulo(opcao.nome)
      if (!padraoUrl) {
        log(`⚠ destino desconhecido "${opcao.nome}" — pulando navegação`)
        await page.keyboard.press('Escape')
        continue
      }

      await listbox(page).getByRole('option', { name: new RegExp(opcao.nome.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i') }).first().click()
      try {
        await page.waitForURL(padraoUrl, { timeout: 25000 })
        await botaoSeletor(page).waitFor({ state: 'visible', timeout: 20000 })
        aprovar(`SPG-04 navegação ${origem.label} → ${opcao.nome}`)
        const slugDest = opcao.nome.toLowerCase().replace(/\s+/g, '-').slice(0, 24)
        await screenshot(page, `nav-${origem.slug}-para-${slugDest}-resultado.png`)
      } catch (err) {
        reprovar(
          `SPG-04 navegação ${origem.label} → ${opcao.nome}`,
          err instanceof Error ? err.message : String(err),
        )
      }
    }
  }
}

async function main() {
  await clerkSetup()
  log(`EMT Seletor Produtos Gravity — ${BASE_UI} — ambiente=${ambienteExec}`)
  log(`Saída: ${OUT}`)

  const browser = await chromium.launch({ headless: true })
  const context = await browser.newContext({ viewport: { width: 1600, height: 900 } })
  const page = await context.newPage()

  try {
    if (!(await autenticarClerk(page))) return

    await validarExistenciaEmTodasOrigens(page)
    await validarExpandirContrair(page)
    await validarMatrizNavegacao(page)
  } finally {
    await browser.close()
  }

  const resumo = falhas.length === 0 ? 'APROVADO' : `REPROVADO (${falhas.length} falha(s))`
  linhas.push('')
  linhas.push(`RESUMO: ${resumo}`)
  linhas.push(`Falhas: ${falhas.length}`)

  writeFileSync(resolve(OUT, 'RESULTADO.txt'), linhas.join('\n'), 'utf-8')
  console.log(`\n${resumo}`)
  if (falhas.length > 0) process.exit(1)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
