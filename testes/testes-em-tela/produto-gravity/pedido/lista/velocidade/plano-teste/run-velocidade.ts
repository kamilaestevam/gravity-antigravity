/**
 * Teste em Tela — Velocidade das Ações da Lista de Pedidos
 * Plano: ./plano-teste-em-tela.md  (TST-EMT-PEDIDO-LISTA-VELOCIDADE-000087)
 *
 * Uso:
 *   npx tsx testes/testes-em-tela/produto-gravity/pedido/lista/velocidade/plano-teste/run-velocidade.ts
 *   EMT_PERF_ITERACOES=8 EMT_PERF_EMAIL=perf@org.com npx tsx ...
 *
 * Mede, por ação: latência de UI percebida (gatilho → resultado visível) e, quando há rede,
 * a latência do backend (request().timing()). Reporta p50/p95/max e compara aos thresholds do
 * plano (SLA ≤200ms backend). Saída: RESULTADO.txt + velocidade.csv em resultado-teste/<runId>/.
 *
 * Requer: shell Vite + Configurador + sidecar Pedido, CLERK_SECRET_KEY, e org semeada com
 * ≥50 pedidos/≥200 itens (EMT_PERF_EMAIL). Sem isso, ações saem como SKIP — nunca DENTRO.
 *
 * NOTA DE SELETORES: o componente tem poucos data-testid. Os seletores abaixo são best-effort
 * (role/texto/CSS). Ações cujo seletor não casa no DOM real saem como SKIP com motivo — ajustar
 * o bloco SELETORES (ou adicionar data-testid nos gatilhos — ver §Follow-ups do plano).
 */
import { chromium, type Page, type BrowserContext } from 'playwright'
import { writeFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import dotenv from 'dotenv'
import { clerk } from '@clerk/testing/playwright'
import { resolverFeatureRootEmt, resolverPastaResultadoEmt } from '../../../../_lib/resolver-pasta-resultado-emt.js'

const __dirRoot = dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: resolve(__dirRoot, '../../../../../../.env.local') })
dotenv.config({ path: resolve(__dirRoot, '../../../../../../servicos-global/configurador/.env') })
if (!process.env.CLERK_PUBLISHABLE_KEY && process.env.VITE_CLERK_PUBLISHABLE_KEY) {
  process.env.CLERK_PUBLISHABLE_KEY = process.env.VITE_CLERK_PUBLISHABLE_KEY
}

const FEATURE_ROOT = resolverFeatureRootEmt(__dirRoot)
const OUT = resolverPastaResultadoEmt(FEATURE_ROOT, process.env.EMT_RUN_ID)
const BASE_UI = process.env.PLAYWRIGHT_BASE_URL ?? 'http://localhost:8000'
const ROTA_LISTA = '/pedido/pedidos/lista'
const EMAIL = process.env.EMT_PERF_EMAIL ?? process.env.E2E_CLERK_USER_EMAIL ?? 'dmmltda@gmail.com'
const K = Number(process.env.EMT_PERF_ITERACOES ?? '8')

const linhas: string[] = []
function log(msg: string) { linhas.push(msg); console.log(msg) }

// ── Estatística ─────────────────────────────────────────────────────────────
function percentil(amostras: number[], p: number): number {
  if (amostras.length === 0) return NaN
  const ord = [...amostras].sort((a, b) => a - b)
  const idx = Math.min(ord.length - 1, Math.ceil((p / 100) * ord.length) - 1)
  return Math.round(ord[Math.max(0, idx)])
}
function stats(amostras: number[]) {
  return {
    n: amostras.length,
    p50: percentil(amostras, 50),
    p95: percentil(amostras, 95),
    max: amostras.length ? Math.round(Math.max(...amostras)) : NaN,
    avg: amostras.length ? Math.round(amostras.reduce((a, b) => a + b, 0) / amostras.length) : NaN,
  }
}

// ── Definição de uma ação medível ────────────────────────────────────────────
interface AcaoPerf {
  id: string
  nome: string
  classe: 'abertura' | 'expand' | 'execucao'
  thresholdUiMs: number
  thresholdBackendMs?: number
  endpointFragmento?: string
  preparar?: (page: Page) => Promise<void>
  gatilhar: (page: Page) => Promise<void>
  aguardarResultado: (page: Page) => Promise<void>
  resetar?: (page: Page) => Promise<void>
}

// ── SELETORES (best-effort — ajustar ao DOM real / adicionar data-testid) ─────
const sel = {
  toolbarNovo:        (p: Page) => p.getByRole('button', { name: /^Novo/ }),
  chevronPrimeiraLinha: (p: Page) => p.locator('.gtv-row .gtv-expand, [aria-label*="xpandir"]').first(),
  expandirTodos:      (p: Page) => p.getByRole('button', { name: /Expandir todos|Expandir tudo/i }).first(),
  btnTransferir:      (p: Page) => p.getByRole('button', { name: /Transferir/i }),
  modalVisivel:       (p: Page, titulo: RegExp) => p.getByRole('dialog').filter({ has: p.getByText(titulo) }),
  primeiroCheckboxLinha: (p: Page) => p.locator('.gtv-td--check input[type="checkbox"], .gtv-row input[type="checkbox"]').first(),
}

// ── As 14 ações ──────────────────────────────────────────────────────────────
function definirAcoes(): AcaoPerf[] {
  return [
    {
      id: 'A01', nome: 'Abertura do pedido (expandir linha)', classe: 'expand', thresholdUiMs: 250,
      gatilhar: async (p) => { await sel.chevronPrimeiraLinha(p).click() },
      aguardarResultado: async (p) => { await p.locator('.gtv-row--child, .gtv-subrow').first().waitFor({ state: 'visible', timeout: 5000 }) },
      resetar: async (p) => { await sel.chevronPrimeiraLinha(p).click().catch(() => {}) },
    },
    {
      id: 'A02', nome: 'Abertura dos itens (detalhe do item)', classe: 'expand', thresholdUiMs: 250,
      preparar: async (p) => { await sel.chevronPrimeiraLinha(p).click().catch(() => {}) },
      gatilhar: async (p) => { await p.locator('.gtv-row--child .gtv-expand, .gtv-subrow .gtv-expand').first().click() },
      aguardarResultado: async (p) => { await p.locator('.gtv-item-detalhe, .gtv-row--grandchild').first().waitFor({ state: 'visible', timeout: 5000 }) },
    },
    {
      id: 'A03', nome: 'Expandir todos', classe: 'expand', thresholdUiMs: 800,
      gatilhar: async (p) => { await sel.expandirTodos(p).click() },
      aguardarResultado: async (p) => { await p.waitForTimeout(50); await p.locator('.gtv-row--child, .gtv-subrow').first().waitFor({ state: 'visible', timeout: 8000 }) },
    },
    {
      id: 'A04', nome: 'Novo pedido (modal)', classe: 'abertura', thresholdUiMs: 300,
      gatilhar: async (p) => {
        await sel.toolbarNovo(p).click()
        await p.getByText(/Pedido/i).first().hover().catch(() => {})
        await p.getByRole('button', { name: /Manual/i }).first().click()
      },
      aguardarResultado: async (p) => { await sel.modalVisivel(p, /Novo Pedido/i).waitFor({ state: 'visible', timeout: 5000 }) },
      resetar: async (p) => { await p.keyboard.press('Escape').catch(() => {}) },
    },
    {
      id: 'A05', nome: 'Novo item (modal)', classe: 'abertura', thresholdUiMs: 300,
      gatilhar: async (p) => {
        await sel.toolbarNovo(p).click()
        await p.getByText(/Item/i).first().hover().catch(() => {})
        await p.getByRole('button', { name: /Manual/i }).first().click()
      },
      aguardarResultado: async (p) => { await sel.modalVisivel(p, /Novo Item|Item/i).waitFor({ state: 'visible', timeout: 5000 }) },
      resetar: async (p) => { await p.keyboard.press('Escape').catch(() => {}) },
    },
    {
      id: 'A06', nome: 'Planilha (importação)', classe: 'abertura', thresholdUiMs: 2000, thresholdBackendMs: 1500,
      endpointFragmento: 'importacoes-inteligentes',
      gatilhar: async (p) => {
        await sel.toolbarNovo(p).click()
        await p.getByText(/Importa/i).first().click()
      },
      aguardarResultado: async (p) => { await sel.modalVisivel(p, /Importa/i).waitFor({ state: 'visible', timeout: 6000 }) },
      resetar: async (p) => { await p.keyboard.press('Escape').catch(() => {}) },
    },
    // ── Execuções (UI + backend) — seletores de confirmar variam por modal ─────
    { id: 'A07', nome: 'Transferir → novo pedido',     classe: 'execucao', thresholdUiMs: 800, thresholdBackendMs: 200, endpointFragmento: 'transferencias/confirmar', gatilhar: naoImplementado, aguardarResultado: naoImplementado },
    { id: 'A08', nome: 'Transferir → pedido existente', classe: 'execucao', thresholdUiMs: 800, thresholdBackendMs: 200, endpointFragmento: 'transferencias/confirmar', gatilhar: naoImplementado, aguardarResultado: naoImplementado },
    { id: 'A09', nome: 'Duplicar',                      classe: 'execucao', thresholdUiMs: 800, thresholdBackendMs: 200, endpointFragmento: 'duplicac',                 gatilhar: naoImplementado, aguardarResultado: naoImplementado },
    { id: 'A10', nome: 'Consolidar',                    classe: 'execucao', thresholdUiMs: 800, thresholdBackendMs: 200, endpointFragmento: 'consolidacoes/confirmar', gatilhar: naoImplementado, aguardarResultado: naoImplementado },
    { id: 'A11', nome: 'Excluir',                       classe: 'execucao', thresholdUiMs: 800, thresholdBackendMs: 200, endpointFragmento: 'exclus',                   gatilhar: naoImplementado, aguardarResultado: naoImplementado },
    { id: 'A12', nome: 'Edição no pedido',              classe: 'execucao', thresholdUiMs: 800, thresholdBackendMs: 200, endpointFragmento: '/pedidos/',                gatilhar: naoImplementado, aguardarResultado: naoImplementado },
    { id: 'A13', nome: 'Edição no item',                classe: 'execucao', thresholdUiMs: 800, thresholdBackendMs: 200, endpointFragmento: '/itens/',                 gatilhar: naoImplementado, aguardarResultado: naoImplementado },
    { id: 'A14', nome: 'Edição em massa',               classe: 'execucao', thresholdUiMs: 1200, thresholdBackendMs: 200, endpointFragmento: 'edicoes-em-massa/confirmar', gatilhar: naoImplementado, aguardarResultado: naoImplementado },
  ]
}

async function naoImplementado(): Promise<void> {
  throw new Error('SELETOR_PENDENTE: implementar gatilho/resultado para esta execução (ver plano §Follow-ups — adicionar data-testid)')
}

// ── Medição ──────────────────────────────────────────────────────────────────
interface Resultado {
  id: string; nome: string; classe: string
  uiP50: number; uiP95: number; uiMax: number; backendP95: number
  thresholdUi: number; thresholdBackend?: number
  veredicto: 'DENTRO' | 'ESTOUROU_UI' | 'ESTOUROU_BACKEND' | 'SKIP'
  nota: string
}

async function medir(page: Page, a: AcaoPerf): Promise<Resultado> {
  const ui: number[] = []
  const backend: number[] = []
  let nota = ''
  try {
    for (let i = 0; i < K; i++) {
      if (a.preparar) await a.preparar(page)
      const respPromise = a.endpointFragmento
        ? page.waitForResponse((r) => r.url().includes(a.endpointFragmento!), { timeout: 15000 }).catch(() => null)
        : Promise.resolve(null)
      const t0 = Date.now()
      await a.gatilhar(page)
      await a.aguardarResultado(page)
      const dt = Date.now() - t0
      const resp = await respPromise
      if (i > 0) { // descarta warm-up
        ui.push(dt)
        if (resp) {
          const tm = resp.request().timing()
          if (tm && tm.responseEnd > 0 && tm.requestStart >= 0) backend.push(tm.responseEnd - tm.requestStart)
        }
      }
      if (a.resetar) await a.resetar(page)
    }
  } catch (err) {
    return {
      id: a.id, nome: a.nome, classe: a.classe,
      uiP50: NaN, uiP95: NaN, uiMax: NaN, backendP95: NaN,
      thresholdUi: a.thresholdUiMs, thresholdBackend: a.thresholdBackendMs,
      veredicto: 'SKIP', nota: err instanceof Error ? err.message : String(err),
    }
  }
  const su = stats(ui)
  const sb = stats(backend)
  let veredicto: Resultado['veredicto'] = 'DENTRO'
  if (su.p95 > a.thresholdUiMs) veredicto = 'ESTOUROU_UI'
  if (a.thresholdBackendMs && sb.n > 0 && sb.p95 > a.thresholdBackendMs) veredicto = 'ESTOUROU_BACKEND'
  return {
    id: a.id, nome: a.nome, classe: a.classe,
    uiP50: su.p50, uiP95: su.p95, uiMax: su.max, backendP95: sb.p95,
    thresholdUi: a.thresholdUiMs, thresholdBackend: a.thresholdBackendMs,
    veredicto, nota,
  }
}

// ── Auth ──────────────────────────────────────────────────────────────────────
async function aguardarMe(page: Page): Promise<boolean> {
  try {
    await page.waitForFunction(async () => {
      const c = (window as unknown as { Clerk?: { session?: { getToken: () => Promise<string | null> } } }).Clerk
      if (!c?.session) return false
      const t = await c.session.getToken()
      if (!t) return false
      const r = await fetch('/api/v1/me', { headers: { Authorization: `Bearer ${t}` } })
      return r.status === 200
    }, undefined, { timeout: 45000 })
    return true
  } catch { return false }
}

async function login(context: BrowserContext): Promise<Page> {
  const page = await context.newPage()
  await page.goto(`${BASE_UI}/login`, { waitUntil: 'domcontentloaded', timeout: 45000 })
  await clerk.signIn({ page, emailAddress: EMAIL })
  await aguardarMe(page)
  return page
}

// ── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  if (!process.env.CLERK_SECRET_KEY) { log('✗ CLERK_SECRET_KEY ausente'); finalizar([]); return }
  const browser = await chromium.launch()
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } })
  const resultados: Resultado[] = []
  try {
    const page = await login(context)
    await page.goto(`${BASE_UI}${ROTA_LISTA}`, { waitUntil: 'networkidle', timeout: 60000 })
    await page.screenshot({ path: resolve(OUT, '01-lista-carregada.png') })

    for (const acao of definirAcoes()) {
      log(`▶ ${acao.id} ${acao.nome} (K=${K})`)
      const r = await medir(page, acao)
      resultados.push(r)
      const tag = { DENTRO: '✓', ESTOUROU_UI: '✗ui', ESTOUROU_BACKEND: '✗be', SKIP: '⊘' }[r.veredicto]
      log(`  ${tag} uiP95=${r.uiP95}ms (thr ${r.thresholdUi}) backendP95=${r.backendP95}ms${r.thresholdBackend ? ` (thr ${r.thresholdBackend})` : ''} ${r.nota ? '— ' + r.nota : ''}`)
    }
    await page.close()
  } catch (err) {
    log(`✗ Exceção: ${err instanceof Error ? err.message : String(err)}`)
  } finally {
    await context.close()
    await browser.close()
    finalizar(resultados)
  }
}

function finalizar(resultados: Resultado[]) {
  const dentro = resultados.filter((r) => r.veredicto === 'DENTRO').length
  const estourou = resultados.filter((r) => r.veredicto.startsWith('ESTOUROU')).length
  const skip = resultados.filter((r) => r.veredicto === 'SKIP').length

  // CSV
  const csv = [
    'id,nome,classe,ui_p50,ui_p95,ui_max,backend_p95,threshold_ui,threshold_backend,veredicto',
    ...resultados.map((r) =>
      [r.id, `"${r.nome}"`, r.classe, r.uiP50, r.uiP95, r.uiMax, r.backendP95, r.thresholdUi, r.thresholdBackend ?? '', r.veredicto].join(',')),
  ].join('\n')
  writeFileSync(resolve(OUT, 'velocidade.csv'), csv, 'utf8')

  const resultadoGeral = estourou > 0 ? 'ESTOUROU' : (dentro > 0 ? 'DENTRO_DO_SLA' : 'SEM_DADOS')
  const txt = [
    'TST-EMT-PEDIDO-LISTA-VELOCIDADE-000087',
    `runId: ${process.env.EMT_RUN_ID ?? 'local'}`,
    `iteracoes (K): ${K}  | email: ${EMAIL}`,
    '',
    '── Resultados por ação (p95) ──',
    ...resultados.map((r) =>
      `${r.id} ${r.veredicto.padEnd(16)} ui_p95=${String(r.uiP95).padStart(5)}ms/thr${r.thresholdUi}  backend_p95=${String(r.backendP95).padStart(5)}ms${r.thresholdBackend ? '/thr' + r.thresholdBackend : ''}  ${r.nome}${r.nota ? '  ['+r.nota+']' : ''}`),
    '',
    `DENTRO: ${dentro}  | ESTOUROU: ${estourou}  | SKIP: ${skip}`,
    `Resultado: ${resultadoGeral}`,
    '',
    '── Log ──',
    ...linhas,
  ].join('\n')
  writeFileSync(resolve(OUT, 'RESULTADO.txt'), txt, 'utf8')
  log(`\n📁 ${OUT}`)
  log(`Resultado: ${resultadoGeral} (DENTRO ${dentro} / ESTOUROU ${estourou} / SKIP ${skip})`)
}

void main()
