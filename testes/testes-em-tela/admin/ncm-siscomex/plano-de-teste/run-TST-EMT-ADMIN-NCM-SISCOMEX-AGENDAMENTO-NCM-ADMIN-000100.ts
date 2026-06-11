/**
 * Teste em tela — Agendamento NCM Admin
 * Plano: TST-EMT-ADMIN-NCM-SISCOMEX-AGENDAMENTO-NCM-ADMIN-000100
 *
 * Checklist de negócio:
 *   01 — Agendamento ativo?     → Sim, Diário 02h (cron 00 02 * * *)
 *   02 — Agendamento funcionando? → Persiste após navegar
 *   03 — Sincronizar Agora       → Sucesso (toast + histórico Manual)
 */
import { chromium, type Page } from 'playwright'
import {
  CRON_DIARIO_02H,
  abrirModalAgendamentoNcm,
  configurarAgendamentoDiario02h,
  lerCronNoModal,
  salvarModalAgendamentoSeDirty,
  toolbarBadgeAgendamentoAtivo,
  validarAgendamentoAtivoDiario02h,
} from '../../../../infra/admin/ncm-agendamento-ui-helpers.js'
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

const { ambiente: ambienteExec, clerkSecretPrefix } = aplicarChavesClerkParaAmbiente()

const OUT = resolverPastaResultadoEmt(FEATURE_ROOT, process.env.EMT_RUN_ID)
const BASE_UI = process.env.PLAYWRIGHT_BASE_URL ?? 'http://localhost:8000'
const NCM_URL = `${BASE_UI}/admin/ncm-integracao`
const HUB_URL = `${BASE_UI}/hub`

const SYNC_TIMEOUT_MS = 300_000

const PRODUTO_EMT = 'Configurador'
const LOCAL_EMT = 'Admin'
const SUBLOCAL_EMT = 'ncm-siscomex/agendamento'
const AMBIENTE_LABEL = ambienteExec ?? 'Local'

const linhas: string[] = []
const falhas: string[] = []

function log(msg: string) { linhas.push(msg); console.log(msg) }
function falhar(msg: string) { falhas.push(msg); log(`✗ ${msg}`) }

function emtRow(acao: string, resultado: 'Aprovado' | 'Reprovado'): string {
  return `EMT_ROW|${AMBIENTE_LABEL}|${PRODUTO_EMT}|${LOCAL_EMT}|${SUBLOCAL_EMT}|${acao}|${resultado}`
}
function aprovado(acao: string) { log(`✓ ${emtRow(acao, 'Aprovado')}`) }
function reprovado(acao: string) { falhar(emtRow(acao, 'Reprovado')) }

async function screenshot(page: Page, nome: string) {
  mkdirSync(OUT, { recursive: true })
  await page.waitForLoadState('networkidle').catch(() => {})
  await page.waitForTimeout(400)
  await page.screenshot({ path: `${OUT}/${nome}`, fullPage: false })
  log(`📸 ${nome}`)
}

async function autenticarClerk(page: Page): Promise<boolean> {
  const email = process.env.E2E_CLERK_USER_EMAIL ?? process.env.E2E_EMAIL
  const senha = process.env.E2E_CLERK_USER_PASSWORD ?? process.env.E2E_PASSWORD
  if (!email) { falhar('E2E_CLERK_USER_EMAIL ausente'); return false }
  if (!process.env.CLERK_SECRET_KEY) { falhar('CLERK_SECRET_KEY ausente'); return false }

  log(`Auth ambiente=${ambienteExec} clerk=${clerkSecretPrefix} email=${email}`)
  await page.goto(`${BASE_UI}/login`, { waitUntil: 'domcontentloaded', timeout: 60000 })
  await page.waitForFunction(() => {
    const c = (window as unknown as { Clerk?: { loaded?: boolean; client?: unknown } }).Clerk
    return Boolean(c?.loaded && c?.client)
  }, undefined, { timeout: 60000 })

  try {
    if (senha) await clerk.signIn({ page, emailAddress: email, password: senha })
    else await clerk.signIn({ page, emailAddress: email })
  } catch (err) {
    falhar(`Clerk sign-in falhou: ${err instanceof Error ? err.message : String(err)}`)
    return false
  }
  aprovado('Login SUPER_ADMIN Gravity (Clerk)')
  return true
}

async function irParaNcm(page: Page) {
  await page.goto(NCM_URL, { waitUntil: 'domcontentloaded', timeout: 60000 })
  await page.waitForLoadState('networkidle').catch(() => {})
}

async function abrirModalAgendamento(page: Page, jaNaPaginaNcm = false): Promise<boolean> {
  try {
    if (!jaNaPaginaNcm) await irParaNcm(page)
    await abrirModalAgendamentoNcm(page)
    return true
  } catch {
    reprovado('Modal Agendamento NCM não abriu')
    return false
  }
}

async function fecharModal(page: Page) {
  await page.keyboard.press('Escape').catch(() => {})
  await page.waitForTimeout(400)
}

async function salvarModalSeDirty(page: Page): Promise<boolean> {
  const btnSalvar = page.getByTestId('modal-abas-btn-salvar')
  if (!(await btnSalvar.isEnabled({ timeout: 3000 }).catch(() => false))) return true
  await page.waitForTimeout(300)
  return salvarModalAgendamentoSeDirty(page)
}

async function configurarESalvarAgendamento(page: Page) {
  try {
    await screenshot(page, '03-configurar-agendamento-antes.png')

    const configurou = await configurarAgendamentoDiario02h(page)
    if (!configurou) {
      reprovado('Configurar agendamento — não foi possível selecionar Ativado/Diário/02h/00min')
      await screenshot(page, '03-configurar-agendamento-resultado.png')
      return
    }

    await screenshot(page, '03-configurar-agendamento-selecao.png')

    const salvou = await salvarModalSeDirty(page)
    await screenshot(page, '03-configurar-agendamento-resultado.png')

    if (salvou) aprovado('Configurar agendamento — Ativado + Diário 02h00 + Salvar')
    else reprovado('Configurar agendamento — falha ao salvar (SUPER_ADMIN? Cadastros?)')
  } catch (err) {
    reprovado(`Exceção ao configurar agendamento: ${err instanceof Error ? err.message : String(err)}`)
    await screenshot(page, '03-configurar-agendamento-resultado.png').catch(() => {})
  }
}

/** 01 — Agendamento ativo? Sim = Diário 02h */
async function checklistAgendamentoAtivo(page: Page) {
  try {
    await fecharModal(page)
    await abrirModalAgendamento(page, true)
    await screenshot(page, '04-agendamento-ativo-antes.png')

    const ok = await validarAgendamentoAtivoDiario02h(page)
    if (!ok) {
      const cron = await lerCronNoModal(page)
      log(`  cron lido="${cron ?? 'null'}" esperado="${CRON_DIARIO_02H}"`)
    }
    await screenshot(page, '04-agendamento-ativo-resultado.png')

    if (ok) {
      aprovado('01 — Agendamento ativo? Sim — Diário 02h (cron 00 02 * * *)')
    } else {
      reprovado('01 — Agendamento ativo? Não — esperado ATIVO + Diário + 02h + cron 00 02 * * *')
    }
  } catch (err) {
    reprovado(`01 — Agendamento ativo — exceção: ${err instanceof Error ? err.message : String(err)}`)
  }
}

/** 02 — Agendamento funcionando? Persiste após navegar */
async function checklistAgendamentoFuncionando(page: Page) {
  try {
    await screenshot(page, '05-agendamento-funcionando-antes.png')
    await fecharModal(page)

    await page.goto(HUB_URL, { waitUntil: 'domcontentloaded', timeout: 60000 })
    await page.waitForTimeout(800)
    await irParaNcm(page)

    const toolbarOk = await toolbarBadgeAgendamentoAtivo(page)
    await abrirModalAgendamento(page, true)

    const dirty = await page.getByText(/Alterações pendentes/i)
      .isVisible({ timeout: 2000 }).catch(() => false)
    const modalOk = await validarAgendamentoAtivoDiario02h(page)

    await screenshot(page, '05-agendamento-funcionando-resultado.png')

    if (toolbarOk && !dirty && modalOk) {
      aprovado('02 — Agendamento funcionando? Sim — persistiu após navegar (ATIVO + Diário 02h)')
    } else {
      reprovado(`02 — Agendamento funcionando? Não — toolbar=${toolbarOk} dirty=${dirty} modal=${modalOk}`)
    }
  } catch (err) {
    reprovado(`02 — Agendamento funcionando — exceção: ${err instanceof Error ? err.message : String(err)}`)
  }
}

/** 03 — Sincronizar Agora com sucesso */
async function checklistSincronizarAgora(page: Page) {
  try {
    await fecharModal(page)
    await screenshot(page, '06-sincronizar-agora-antes.png')

    const btnSync = page.getByRole('button', { name: /sincronizar agora/i }).first()
    if (!(await btnSync.isVisible({ timeout: 10000 }).catch(() => false))) {
      reprovado('03 — Sincronizar Agora — botão não encontrado')
      return
    }

    await btnSync.click()
    await screenshot(page, '06-sincronizar-agora-selecao.png')

    const toastOk = await page.locator('[data-notification-type="success"], [role="alert"]')
      .filter({ hasText: /sincroniza/i }).first()
      .isVisible({ timeout: SYNC_TIMEOUT_MS }).catch(() => false)

    await page.waitForLoadState('networkidle').catch(() => {})
    await page.waitForTimeout(2000)

    const historicoManual = await page.getByText(/^manual$/i).first()
      .isVisible({ timeout: 15000 }).catch(() => false)
    const historicoSucesso = await page.getByText(/conclu[ií]do|sucesso/i).first()
      .isVisible({ timeout: 15000 }).catch(() => false)

    await screenshot(page, '06-sincronizar-agora-resultado.png')

    if (toastOk && (historicoManual || historicoSucesso)) {
      aprovado('03 — Sincronizar Agora — sucesso (toast + histórico Manual/Concluído)')
    } else {
      reprovado(`03 — Sincronizar Agora — falhou (toast=${toastOk} manual=${historicoManual} sucesso=${historicoSucesso})`)
    }
  } catch (err) {
    reprovado(`03 — Sincronizar Agora — exceção: ${err instanceof Error ? err.message : String(err)}`)
    await screenshot(page, '06-sincronizar-agora-resultado.png').catch(() => {})
  }
}

async function confirmacaoFinal(page: Page) {
  try {
    const toolbarOk = await toolbarBadgeAgendamentoAtivo(page)
    await screenshot(page, '07-toolbar-ativo-pos-sync.png')
    if (toolbarOk) aprovado('Toolbar mantém badge ATIVO após sync')
    else reprovado('Toolbar perdeu badge ATIVO após sync')

    if (await abrirModalAgendamento(page, true)) {
      const abaMonitor = page.getByText(/monitoramento/i).first()
      if (await abaMonitor.isVisible({ timeout: 3000 }).catch(() => false)) {
        await abaMonitor.click()
        await page.waitForTimeout(500)
      }
      const cron = await lerCronNoModal(page)
      await screenshot(page, '08-monitoramento-cron.png')
      if (cron === CRON_DIARIO_02H) {
        aprovado('Monitoramento exibe cron 00 02 * * *')
      } else {
        reprovado(`Monitoramento — cron "${cron ?? 'null'}" diverge de ${CRON_DIARIO_02H}`)
      }
      await fecharModal(page)
    }
  } catch (err) {
    reprovado(`Confirmação final — exceção: ${err instanceof Error ? err.message : String(err)}`)
  }
}

async function main() {
  mkdirSync(OUT, { recursive: true })
  log('TESTE EM TELA — agendamento-ncm-admin')
  log(`Base: ${BASE_UI} | Ambiente: ${ambienteExec}`)
  log(`Checklist: 01 ativo=Diário02h | 02 funcionando=persiste | 03 Sincronizar Agora=sucesso`)
  log(`Pasta: ${OUT}`)

  let browser: Awaited<ReturnType<typeof chromium.launch>> | null = null
  let page: Page | null = null

  try {
    await clerkSetup()
    browser = await chromium.launch({ headless: true })
    page = await browser.newPage()
    await page.setViewportSize({ width: 1440, height: 900 })

    if (!(await autenticarClerk(page))) throw new Error('Autenticação falhou')
    await page.waitForTimeout(1500)
    await screenshot(page, '01-pos-login.png')

    await irParaNcm(page)
    await screenshot(page, '02-ncm-integracao.png')
    aprovado('Página Integração NCM carregada')

    if (await abrirModalAgendamento(page, true)) {
      await configurarESalvarAgendamento(page)
      await checklistAgendamentoAtivo(page)
      await checklistAgendamentoFuncionando(page)
      await checklistSincronizarAgora(page)
      await confirmacaoFinal(page)
    }

    log('')
    log('--- RESUMO CHECKLIST ---')
    log(`01 Agendamento ativo (Diário 02h): ${falhas.some(f => f.includes('01 —')) ? 'REPROVADO' : 'APROVADO'}`)
    log(`02 Agendamento funcionando:         ${falhas.some(f => f.includes('02 —')) ? 'REPROVADO' : 'APROVADO'}`)
    log(`03 Sincronizar Agora:              ${falhas.some(f => f.includes('03 —')) ? 'REPROVADO' : 'APROVADO'}`)
  } catch (err) {
    falhar(`Erro fatal: ${err instanceof Error ? err.message : String(err)}`)
    if (page) await screenshot(page, '99-erro.png').catch(() => {})
  } finally {
    await browser?.close().catch(() => {})
  }

  const veredicto = falhas.length === 0 ? 'Aprovado' : 'Reprovado'
  log(`\n=== VEREDICTO FINAL: ${veredicto} (${falhas.length} falha(s)) ===`)
  writeFileSync(`${OUT}/RESULTADO.txt`, [...linhas, '', `VEREDICTO: ${veredicto}`].join('\n'), 'utf8')
  process.exit(falhas.length === 0 ? 0 : 1)
}

main()
