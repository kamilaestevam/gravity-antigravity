/**
 * Teste em Tela — Usuário × Organização (porteiro → produto)
 * Plano: ./plano-teste-em-tela.md  (TST-EMT-PEDIDO-USUARIO-FALTA-ORGANIZACAO-000084)
 *
 * Uso:
 *   npx tsx testes/testes-em-tela/usuario/teste-organizacao/plano-de-teste/run-teste-organizacao.ts
 *
 * Requer: shell Vite (PLAYWRIGHT_BASE_URL, default :8000) + Configurador + sidecar Pedido,
 *         CLERK_SECRET_KEY/CLERK_PUBLISHABLE_KEY no .env, e dados semeados (ver §Pré-requisitos
 *         do plano). Sem o seed, os casos que dependem de U_PENDING/ORG_B/ORG_SUSP saem como
 *         "⊘ SKIP (sem dado)" — NUNCA como PASSOU.
 *
 * Instrumentação: captura console + network (status HTTP) de cada caso e grava no RESULTADO.txt
 * a presença/ausência da string proibida "Usuário ou organização não encontrada".
 */
import { chromium, type Page, type BrowserContext } from 'playwright'
import { writeFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import dotenv from 'dotenv'
import { clerk } from '@clerk/testing/playwright'
import {
  resolverFeatureRootEmt,
  resolverPastaResultadoEmt,
} from '../../../_lib/resolver-pasta-resultado-emt.js'

const __dirRoot = dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: resolve(__dirRoot, '../../../../../.env.local') })
dotenv.config({ path: resolve(__dirRoot, '../../../../../servicos-global/configurador/.env') })

if (!process.env.CLERK_PUBLISHABLE_KEY && process.env.VITE_CLERK_PUBLISHABLE_KEY) {
  process.env.CLERK_PUBLISHABLE_KEY = process.env.VITE_CLERK_PUBLISHABLE_KEY
}

const FEATURE_ROOT = resolverFeatureRootEmt(__dirRoot)
const OUT = resolverPastaResultadoEmt(FEATURE_ROOT, process.env.EMT_RUN_ID)
const BASE_UI = process.env.PLAYWRIGHT_BASE_URL ?? 'http://localhost:8000'
const STRING_PROIBIDA = 'Usuário ou organização não encontrada'

// ── e-mails dos usuários semeados (sobrescrever via env) ────────────────────
const EMAIL_U_OK      = process.env.EMT_EMAIL_USER_OK ?? process.env.E2E_CLERK_USER_EMAIL ?? 'dmmltda@gmail.com'
const EMAIL_U_PENDING = process.env.EMT_EMAIL_USER_PENDING // sem default — se ausente, SKIP EMT-02
const EMAIL_U_OUTRO   = process.env.EMT_EMAIL_USER_OUTRO   // para EMT-05 (login de outro usuário/org)

const linhas: string[] = []
function log(msg: string) { linhas.push(msg); console.log(msg) }

async function screenshot(page: Page, nome: string) {
  await page.screenshot({ path: resolve(OUT, nome), fullPage: false })
  log(`📷 ${nome}`)
}

// ── Captura de console + rede por caso ──────────────────────────────────────
interface Captura {
  consoleErros: string[]
  requests: { url: string; status: number | 'pending' }[]
  contemStringProibida: () => boolean
}

function instrumentar(page: Page): Captura {
  const consoleErros: string[] = []
  const requests: { url: string; status: number | 'pending' }[] = []
  page.on('console', (m) => {
    const txt = m.text()
    if (m.type() === 'error' || txt.includes(STRING_PROIBIDA)) consoleErros.push(txt)
  })
  page.on('response', (r) => {
    const u = r.url()
    if (u.includes('/api/v1/')) requests.push({ url: u.split('?')[0], status: r.status() })
  })
  return {
    consoleErros,
    requests,
    contemStringProibida: () =>
      consoleErros.some((c) => c.includes(STRING_PROIBIDA)) ||
      requests.some((r) => r.status === 404 && r.url.includes('/api/v1/pedidos')),
  }
}

function statusDe(cap: Captura, fragmento: string): (number | 'pending')[] {
  return cap.requests.filter((r) => r.url.includes(fragmento)).map((r) => r.status)
}

async function aguardarMeComOrganizacao(page: Page): Promise<boolean> {
  try {
    await page.waitForFunction(async () => {
      const c = (window as unknown as { Clerk?: { session?: { getToken: () => Promise<string | null> } } }).Clerk
      if (!c?.session) return false
      const token = await c.session.getToken()
      if (!token) return false
      const res = await fetch('/api/v1/me', { headers: { Authorization: `Bearer ${token}` } })
      if (res.status !== 200) return false
      const data = (await res.json()) as { organizacao?: { id_organizacao?: string } | null }
      return Boolean(data.organizacao?.id_organizacao)
    }, undefined, { timeout: 45000 })
    return true
  } catch { return false }
}

async function login(context: BrowserContext, email: string): Promise<Page> {
  const page = await context.newPage()
  await page.goto(`${BASE_UI}/login`, { waitUntil: 'domcontentloaded', timeout: 45000 })
  await clerk.signIn({ page, emailAddress: email })
  await aguardarMeComOrganizacao(page)
  return page
}

async function logout(page: Page): Promise<void> {
  await page.evaluate(async () => {
    const c = (window as unknown as { Clerk?: { signOut?: () => Promise<void> } }).Clerk
    await c?.signOut?.()
  })
  await page.waitForTimeout(1500)
}

async function lerTenantStorage(page: Page) {
  return page.evaluate(() => ({
    ls: localStorage.getItem('gravity:idOrganizacao'),
    ssOrg: sessionStorage.getItem('gravity_id_organizacao'),
    ssCompany: sessionStorage.getItem('gravity_company_id'),
  }))
}

// ── Resultado por caso ──────────────────────────────────────────────────────
type Veredicto = 'PASSOU' | 'FALHOU' | 'SKIP' | 'FALHA_ESPERADA'
const resultados: { id: string; veredicto: Veredicto; nota: string }[] = []
function registrar(id: string, veredicto: Veredicto, nota: string) {
  const icone = { PASSOU: '✓', FALHOU: '✗', SKIP: '⊘', FALHA_ESPERADA: '⚠' }[veredicto]
  resultados.push({ id, veredicto, nota })
  log(`${icone} ${id} — ${veredicto}: ${nota}`)
}

async function main() {
  if (!process.env.CLERK_SECRET_KEY) {
    log('✗ CLERK_SECRET_KEY ausente — abortando')
    finalizar('FALHOU')
    return
  }
  const browser = await chromium.launch()
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } })

  try {
    // ── EMT-01 — Usuário vinculado abre o Pedido ──────────────────────────
    {
      const page = await login(context, EMAIL_U_OK)
      const cap = instrumentar(page)
      await page.goto(`${BASE_UI}/pedido/pedidos/lista`, { waitUntil: 'networkidle', timeout: 60000 })
      await screenshot(page, '01-login-ok.png')
      await screenshot(page, '02-lista-carregada-user-ok.png')
      const pedidos = statusDe(cap, '/api/v1/pedidos')
      const ok = !cap.contemStringProibida() && pedidos.some((s) => s === 200)
      registrar('EMT-01', ok ? 'PASSOU' : 'FALHOU',
        `pedidos=${pedidos.join(',')} stringProibida=${cap.contemStringProibida()}`)
      await page.close()
    }

    // ── EMT-02 — Usuário pending_ abre o Pedido (bug C1) ──────────────────
    if (EMAIL_U_PENDING) {
      const page = await login(context, EMAIL_U_PENDING)
      const cap = instrumentar(page)
      await page.goto(`${BASE_UI}/pedido/pedidos/lista`, { waitUntil: 'networkidle', timeout: 60000 })
      await screenshot(page, '03-pending-lista-carregada.png')
      const pref = statusDe(cap, 'preferencia-usuario-coluna-pedido')
      const pedidos = statusDe(cap, '/api/v1/pedidos')
      const ok = !cap.contemStringProibida() && pedidos.some((s) => s === 200)
      if (!ok) await screenshot(page, '99-erro.png')
      registrar('EMT-02', ok ? 'PASSOU' : 'FALHOU',
        `preferencia=${pref.join(',')} pedidos=${pedidos.join(',')} stringProibida=${cap.contemStringProibida()}`)
      await page.close()
    } else {
      registrar('EMT-02', 'SKIP', 'EMT_EMAIL_USER_PENDING não definido (seed U_PENDING ausente)')
    }

    // ── EMT-05 — Logout limpa o tenant persistido ─────────────────────────
    {
      const page = await login(context, EMAIL_U_OK)
      await page.goto(`${BASE_UI}/pedido/pedidos/lista`, { waitUntil: 'networkidle', timeout: 60000 })
      const antes = await lerTenantStorage(page)
      await logout(page)
      const depois = await lerTenantStorage(page)
      await screenshot(page, '08-apos-logout-storage-limpo.png')
      const limpou = depois.ls === null && depois.ssOrg === null && depois.ssCompany === null
      registrar('EMT-05', limpou ? 'PASSOU' : 'FALHOU',
        `antes.ls=${antes.ls ? 'presente' : 'null'} depois.ls=${depois.ls ?? 'null'}`)
      if (EMAIL_U_OUTRO && limpou) {
        const page2 = await login(context, EMAIL_U_OUTRO)
        await page2.goto(`${BASE_UI}/pedido/pedidos/lista`, { waitUntil: 'networkidle', timeout: 60000 })
        await screenshot(page2, '09-novo-login-org-nova.png')
        await page2.close()
      }
      await page.close()
    }

    // ── EMT-06 — F5 repetido (estabilidade) ───────────────────────────────
    {
      const page = await login(context, EMAIL_U_OK)
      const cap = instrumentar(page)
      let estavel = true
      for (let i = 0; i < 10; i++) {
        await page.goto(`${BASE_UI}/pedido/pedidos/lista`, { waitUntil: 'networkidle', timeout: 60000 })
        if (cap.contemStringProibida()) { estavel = false; break }
      }
      await screenshot(page, '10-f5-estavel.png')
      registrar('EMT-06', estavel ? 'PASSOU' : 'FALHOU', `10x reload, stringProibida=${!estavel}`)
      await page.close()
    }

    // ── EMT-03/04/07..13 — dependem de seed/instrumentação extra ──────────
    // Implementar conforme o seed (U_ADMIN, ORG_A/B/SUSP) ficar disponível.
    // Ver plano-teste-em-tela.md §Casos. Enquanto sem dado, registram SKIP:
    for (const id of ['EMT-03', 'EMT-04', 'EMT-07', 'EMT-08', 'EMT-09', 'EMT-10', 'EMT-11', 'EMT-12']) {
      registrar(id, 'SKIP', 'aguardando seed/instrumentação (ver plano §Pré-requisitos)')
    }
    registrar('EMT-13', 'FALHA_ESPERADA', 'modal Transferir mostra mensagem crua — follow-up C5 (UX) pendente')

    const houveFalha = resultados.some((r) => r.veredicto === 'FALHOU')
    finalizar(houveFalha ? 'FALHOU' : 'PASSOU')
  } catch (err) {
    log(`✗ Exceção: ${err instanceof Error ? err.message : String(err)}`)
    finalizar('FALHOU')
  } finally {
    await context.close()
    await browser.close()
  }
}

function finalizar(resultado: 'PASSOU' | 'FALHOU') {
  const cab = [
    'TST-EMT-PEDIDO-USUARIO-FALTA-ORGANIZACAO-000084',
    `runId: ${process.env.EMT_RUN_ID ?? 'local'}`,
    `data: (stamp pós-run)`,
    '',
    '── Casos ──',
    ...resultados.map((r) => `${r.id}: ${r.veredicto} — ${r.nota}`),
    '',
    `Resultado: ${resultado}`,
    '',
    '── Log ──',
    ...linhas,
  ].join('\n')
  writeFileSync(resolve(OUT, 'RESULTADO.txt'), cab, 'utf8')
  log(`\n📁 ${OUT}`)
  log(`Resultado: ${resultado}`)
}

void main()
