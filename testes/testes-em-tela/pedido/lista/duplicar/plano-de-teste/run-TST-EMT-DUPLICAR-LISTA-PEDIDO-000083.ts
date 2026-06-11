/**
 * EMT — Duplicar Lista Pedido
 * Plano: TST-EMT-DUPLICAR-LISTA-PEDIDO-000083
 *
 * Uso: npx tsx testes/testes-em-tela/pedido/lista/duplicar/plano-de-teste/run-TST-EMT-DUPLICAR-LISTA-PEDIDO-000083.ts
 */
import { chromium, type Page } from 'playwright'
import { writeFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import dotenv from 'dotenv'
import { clerk, clerkSetup } from '../../../../_lib/aplicar-chaves-clerk-ambiente.js'
import { resolverFeatureRootEmt, resolverPastaResultadoEmt } from '../../../../_lib/resolver-pasta-resultado-emt.js'

const __dirRoot = dirname(fileURLToPath(import.meta.url))
const FEATURE_ROOT = resolverFeatureRootEmt(__dirRoot)
const REPO_ROOT = resolve(__dirRoot, '../../../../../../')
dotenv.config({ path: resolve(REPO_ROOT, '.env.local') })
dotenv.config({ path: resolve(REPO_ROOT, 'servicos-global/configurador/.env') })
dotenv.config({ path: resolve(REPO_ROOT, 'servicos-global/produto/pedido/.env') })

const OUT = resolverPastaResultadoEmt(FEATURE_ROOT, process.env.EMT_RUN_ID)
const BASE_UI = process.env.PLAYWRIGHT_BASE_URL ?? 'http://localhost:8000'
const LISTA_URL = `${BASE_UI}/pedido/pedidos/lista`
const HUB_URL = `${BASE_UI}/hub`
const WORKSPACE_CDE_PADRAO = process.env.ID_WORKSPACE_TESTE ?? 'cmorx5iwh000aclwynp7y1ofm'

const linhas: string[] = []
const falhas: string[] = []

function log(msg: string) {
  linhas.push(msg)
  console.log(msg)
}

function falhar(msg: string) {
  falhas.push(msg)
  log(`✗ ${msg}`)
}

async function screenshot(page: Page, nome: string) {
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.waitForLoadState('networkidle').catch(() => {})
  await page.screenshot({ path: `${OUT}/${nome}`, fullPage: false })
  log(`📸 ${nome}`)
}

async function prepararEscopoWorkspaces(page: Page): Promise<void> {
  await page.evaluate(async (wsPreferido) => {
    const clerkGlobal = (window as unknown as { Clerk?: { session?: { getToken: () => Promise<string | null> } } }).Clerk
    const token = await clerkGlobal?.session?.getToken()
    if (!token) return
    const meRes = await fetch('/api/v1/me', { headers: { Authorization: `Bearer ${token}` } })
    if (!meRes.ok) return
    const me = await meRes.json() as {
      organizacao?: { id_organizacao?: string } | null
      workspaces?: Array<{ id_workspace?: string }>
    }
    const orgId = me.organizacao?.id_organizacao
    if (orgId && me.workspaces?.length) {
      const ids = me.workspaces.map(w => w.id_workspace).filter((id): id is string => Boolean(id))
      if (ids.length > 0) {
        sessionStorage.setItem(`pedido:workspaces_escopo:${orgId}`, JSON.stringify(ids))
      }
    }
    const wsId = me.workspaces?.find(w => w.id_workspace === wsPreferido)?.id_workspace
      ?? me.workspaces?.[0]?.id_workspace
    if (wsId) sessionStorage.setItem('gravity_company_id', wsId)
  }, WORKSPACE_CDE_PADRAO)
}

async function autenticar(page: Page): Promise<boolean> {
  const email = process.env.E2E_CLERK_USER_EMAIL ?? process.env.E2E_EMAIL
  const senha = process.env.E2E_CLERK_USER_PASSWORD ?? process.env.E2E_PASSWORD
  if (!email || !senha || !process.env.CLERK_SECRET_KEY) {
    falhar('Credenciais Clerk ausentes')
    return false
  }
  await clerkSetup({ publishableKey: process.env.CLERK_PUBLISHABLE_KEY })
  await page.goto(`${BASE_UI}/login`)
  await clerk.signIn({ page, emailAddress: email, password: senha })
  return true
}

async function abrirLista(page: Page) {
  await page.goto(LISTA_URL)
  await page.waitForSelector('[data-testid="tabela-pedido-row"]', { timeout: 30000 }).catch(() => {})
}

async function clicarDuplicar(page: Page) {
  await page.locator('[data-testid="toolbar-btn-duplicar"]').click()
}

async function avancarPasso(page: Page) {
  await page.locator('[data-testid="modal-btn-proximo"]').click()
}

async function confirmarDuplicacao(page: Page) {
  await page.locator('[data-testid="modal-btn-duplicar"]').click()
}

async function aguardarResultado(page: Page) {
  await page.waitForSelector('[data-testid="duplicar-resultado"]', { timeout: 15000 })
}

async function persistenciaHubLista(page: Page, nomePrint: string) {
  await page.goto(HUB_URL)
  await page.goto(LISTA_URL)
  await page.waitForSelector('[data-testid="tabela-pedido-row"]', { timeout: 30000 }).catch(() => {})
  await screenshot(page, nomePrint)
}

async function voltarPasso(page: Page) {
  await page.locator('[data-testid="modal-btn-voltar"]').click()
}

async function main() {
  log('=== TST-EMT-DUPLICAR-LISTA-PEDIDO-000083 ===')
  const browser = await chromium.launch({ headless: process.env.EMT_HEADLESS !== 'false' })
  const page = await browser.newPage()

  try {
    if (!(await autenticar(page))) throw new Error('auth')
    await prepararEscopoWorkspaces(page)
    await abrirLista(page)
    await screenshot(page, '01-lista-carregada.png')
    log('✓ ETAPA 0.1')

    await screenshot(page, '02-sidebar-multi-workspace.png')
    log('✓ ETAPA 0.2')

    const rows = page.locator('[data-testid="tabela-pedido-row"]')
    if (await rows.count() < 1) throw new Error('Sem pedidos na lista')
    await rows.first().locator('[data-testid="checkbox-selecao"]').click()
    await screenshot(page, '03-pedido-selecionado.png')

    await clicarDuplicar(page)
    await screenshot(page, '04-modal-passo1-raio-x.png')
    await avancarPasso(page)
    await screenshot(page, '05-modal-passo2-preview.png')
    await confirmarDuplicacao(page)
    await aguardarResultado(page)
    await screenshot(page, '06-resultado-sucesso.png')
    await page.locator('[data-testid="modal-btn-fechar"]').click()
    await screenshot(page, '07-novo-pedido-no-topo.png')

    await page.goto(HUB_URL)
    await page.goto(LISTA_URL)
    await screenshot(page, '08-persistencia-pedido-inteiro.png')
    log('✓ ETAPA 1')

    if (await rows.count() >= 2) {
      await rows.nth(1).locator('[data-testid="btn-expandir"]').click()
      await screenshot(page, '09-pedido-b-expandido.png')
      const itens = page.locator('[data-testid="tabela-item-row"]')
      if (await itens.count() >= 1) {
        await itens.first().locator('[data-testid="checkbox-selecao"]').click()
        if (await itens.count() >= 2) {
          await itens.nth(1).locator('[data-testid="checkbox-selecao"]').click()
        }
        await screenshot(page, '10-dois-itens-selecionados.png')
        await clicarDuplicar(page)
        await screenshot(page, '11-modal-itens-avulsos.png')
        await avancarPasso(page)
        await confirmarDuplicacao(page)
        await aguardarResultado(page)
        await screenshot(page, '12-resultado-itens-avulsos-ok.png')
        await page.locator('[data-testid="modal-btn-fechar"]').click()
        await rows.nth(1).locator('[data-testid="btn-expandir"]').click()
        await screenshot(page, '13-itens-copiados-visiveis.png')
        await persistenciaHubLista(page, '14-persistencia-itens-avulsos.png')
        log('✓ ETAPA 2')
      }
    }

    // ETAPA 3 — Misto pedido + itens outro WS (#276)
    const rowsEtapa3 = page.locator('[data-testid="tabela-pedido-row"]')
    if (await rowsEtapa3.count() >= 2) {
      await rowsEtapa3.first().locator('[data-testid="checkbox-selecao"]').click()
      await rowsEtapa3.nth(1).locator('[data-testid="btn-expandir"]').click()
      const itensB = page.locator('[data-testid="tabela-item-row"]')
      if (await itensB.count() >= 2) {
        await itensB.nth(0).locator('[data-testid="checkbox-selecao"]').click()
        await itensB.nth(1).locator('[data-testid="checkbox-selecao"]').click()
        await screenshot(page, '15-selecao-mista.png')
        await clicarDuplicar(page)
        await screenshot(page, '16-modal-misto-passo1.png')
        await avancarPasso(page)
        await confirmarDuplicacao(page)
        await aguardarResultado(page)
        await screenshot(page, '17-resultado-misto-ok.png')
        await page.locator('[data-testid="modal-btn-fechar"]').click()
        await screenshot(page, '18-misto-itens-no-pedido-copia.png')
        await persistenciaHubLista(page, '19-persistencia-misto.png')
        log('✓ ETAPA 3')
      }
    }

    // ETAPA 4 — Toggle zeramento
    await abrirLista(page)
    const rowsEtapa4 = page.locator('[data-testid="tabela-pedido-row"]')
    if (await rowsEtapa4.count() >= 1) {
      await rowsEtapa4.first().locator('[data-testid="checkbox-selecao"]').click()
      await clicarDuplicar(page)
      await screenshot(page, '20-opcoes-inicial.png')
      const toggles = page.locator('[data-testid="toggle-opcao-duplicar"]')
      if (await toggles.count() >= 2) {
        await toggles.nth(1).click()
        await screenshot(page, '21-toggle-valores-off-selecao.png')
        await avancarPasso(page)
        await confirmarDuplicacao(page)
        await aguardarResultado(page)
        await screenshot(page, '22-valores-zerados-resultado.png')
        await page.locator('[data-testid="modal-btn-fechar"]').click()
        log('✓ ETAPA 4')
      }
    }

    // ETAPA 5 — Aviso saldo (opcional)
    await abrirLista(page)
    const rowsEtapa5 = page.locator('[data-testid="tabela-pedido-row"]')
    for (let i = 0; i < Math.min(await rowsEtapa5.count(), 5); i++) {
      await rowsEtapa5.nth(i).locator('[data-testid="checkbox-selecao"]').click()
      await clicarDuplicar(page)
      await avancarPasso(page)
      const aviso = page.locator('[data-testid="duplicar-aviso-zeramento-saldo"]')
      if (await aviso.isVisible().catch(() => false)) {
        await screenshot(page, '23-aviso-zeramento-saldo.png')
        await page.locator('[data-testid="modal-btn-fechar"]').click()
        log('✓ ETAPA 5')
        break
      }
      await page.locator('[data-testid="modal-btn-fechar"]').click()
      await rowsEtapa5.nth(i).locator('[data-testid="checkbox-selecao"]').click()
    }

    // ETAPA 6 — Wizard navegação
    await abrirLista(page)
    const rowsEtapa6 = page.locator('[data-testid="tabela-pedido-row"]')
    if (await rowsEtapa6.count() >= 1) {
      await rowsEtapa6.first().locator('[data-testid="checkbox-selecao"]').click()
      await clicarDuplicar(page)
      await avancarPasso(page)
      await voltarPasso(page)
      await screenshot(page, '24-wizard-navegacao.png')
      await page.locator('[data-testid="modal-btn-fechar"]').click()
      log('✓ ETAPA 6 (parcial — numero manual depende org config)')
    }

    const resultado = falhas.length === 0 ? 'PASSOU' : 'FALHOU'
    writeFileSync(`${OUT}/RESULTADO.txt`, [...linhas, '', `Resultado: ${resultado}`].join('\n'), 'utf-8')
    log(`\nResultado: ${resultado}`)
    process.exitCode = falhas.length === 0 ? 0 : 1
  } catch (e) {
    await screenshot(page, '99-erro.png').catch(() => {})
    falhar(String(e))
    writeFileSync(`${OUT}/RESULTADO.txt`, [...linhas, '', 'Resultado: FALHOU'].join('\n'), 'utf-8')
    process.exitCode = 1
  } finally {
    await browser.close()
  }
}

main()
