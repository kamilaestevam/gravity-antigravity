/**
 * TST-EMT-SMTRD-NOVA-LEITURA-PASSO-DOIS-000155 — Passo 02 Análise do arquivo
 */
import { chromium, type Page } from 'playwright'
import { mkdirSync, writeFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import dotenv from 'dotenv'
import { clerk, clerkSetup } from '../../../../_lib/aplicar-chaves-clerk-ambiente.js'
import { resolverFeatureRootEmt, resolverPastaResultadoEmt } from '../../../../_lib/resolver-pasta-resultado-emt.js'

const __dirRoot = dirname(fileURLToPath(import.meta.url))
const FEATURE_ROOT = resolverFeatureRootEmt(__dirRoot)
const REPO_ROOT = resolve(__dirRoot, '../../../../../../../')
const OUT = resolverPastaResultadoEmt(FEATURE_ROOT, process.env.EMT_RUN_ID)
const BASE_UI = process.env.PLAYWRIGHT_BASE_URL ?? 'http://localhost:8000'
const FIXTURES = resolve(
  REPO_ROOT,
  'testes/testes-unitarios/produto-gravity/smart-read/nova-leitura/passo-um/fixtures/amostras',
)
const ID_LEITURA = 'emt-leitura-passo-dois-000155'

dotenv.config({ path: resolve(REPO_ROOT, '.env.local') })

mkdirSync(OUT, { recursive: true })

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

async function print(page: Page, nome: string) {
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.waitForLoadState('networkidle').catch(() => {})
  await page.screenshot({ path: resolve(OUT, nome), fullPage: false })
  log(`📸 ${nome}`)
}

async function par(
  page: Page,
  selecao: string,
  resultado: string,
  etapa: string,
  acao: () => Promise<void>,
) {
  await print(page, selecao)
  await acao()
  await print(page, resultado)
  if (falhas.some((f) => f.includes(etapa))) return
  log(`✓ ${etapa}`)
}

async function autenticar(page: Page): Promise<boolean> {
  const email = process.env.E2E_CLERK_USER_EMAIL ?? process.env.E2E_EMAIL
  const senha = process.env.E2E_CLERK_USER_PASSWORD ?? process.env.E2E_PASSWORD
  if (!email || !senha || !process.env.CLERK_SECRET_KEY) {
    falhar('Credenciais Clerk ausentes (.env.local)')
    return false
  }
  await clerkSetup({ publishableKey: process.env.CLERK_PUBLISHABLE_KEY })
  await page.goto(`${BASE_UI}/login`)
  await clerk.signIn({ page, emailAddress: email, password: senha })
  return true
}

function respostaLeituraCompleta() {
  return {
    id_leitura: ID_LEITURA,
    nome_leitura: 'Leitura EMT 742',
    status_leitura: 'COMPLETED',
    total_arquivos: 1,
    arquivos_processados: 1,
    arquivos: [
      {
        id_arquivo: 'arq-emt-dois-001',
        nome_arquivo: 'amostra.pdf',
        status_arquivo: 'COMPLETED',
        tempo_extracao_ia_ms: 4800,
        resultado_extracao: [
          { tipo_documento: 'Bill of Lading', dados: { numero: 'BL-EMT' } },
          { tipo_documento: 'Commercial Invoice', dados: { numero: 'INV-EMT' } },
        ],
      },
    ],
  }
}

async function mockarApis(page: Page) {
  await page.route('**/api/v1/smart-read/leituras', async (route) => {
    if (route.request().method() === 'POST') {
      await route.fulfill({
        status: 202,
        contentType: 'application/json',
        body: JSON.stringify({
          id_leitura: ID_LEITURA,
          id_arquivo: 'arq-emt-dois-001',
          status_leitura: 'PROCESSING',
        }),
      })
      return
    }
    await route.continue()
  })
  await page.route(`**/api/v1/smart-read/leituras/${ID_LEITURA}`, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(respostaLeituraCompleta()),
    })
  })
  await page.route('**/api/v1/smart-read/leituras/metricas/**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ transacoes: [], paginacao: { pagina: 1, limite: 50, total: 0 } }),
    })
  })
}

async function abrirWizardPassoDois(page: Page) {
  await mockarApis(page)
  await page.goto(`${BASE_UI}/smart_read/insights`)
  await page.getByRole('button', { name: /^Novo$/i }).click()
  await page.getByRole('menuitem', { name: /Nova Leitura/i }).click()
  const dialog = page.getByRole('dialog')
  await dialog.waitFor({ state: 'visible', timeout: 20_000 })
  await dialog.locator('input[type="file"]').setInputFiles(resolve(FIXTURES, 'amostra.pdf'))
  await dialog.getByRole('button', { name: 'Enviar' }).click()
  await dialog.getByText('Análise do arquivo').first().waitFor({ timeout: 15_000 })
  return dialog
}

async function main() {
  log('=== TST-EMT-SMTRD-NOVA-LEITURA-PASSO-DOIS-000155 ===')
  const browser = await chromium.launch({ headless: process.env.EMT_HEADLESS !== 'false' })
  const page = await browser.newPage()
  const inicioTotal = Date.now()

  try {
    if (!(await autenticar(page))) throw new Error('auth-falhou')

    await par(
      page,
      '01-passo2-selecao.png',
      '01-passo2-resultado.png',
      'ETAPA 1 — Passo 2 aberto',
      async () => {
        const dialog = await abrirWizardPassoDois(page)
        if ((await dialog.getByText('Análise do arquivo').count()) === 0) {
          falhar('ETAPA 1 — passo 2 não abriu')
        }
      },
    )

    const dialog = page.getByRole('dialog')

    await par(
      page,
      '02-nome-selecao.png',
      '02-nome-resultado.png',
      'ETAPA 2 — Nome da leitura',
      async () => {
        const subtitulo = dialog.locator('.sr-wizard-modal-subtitulo-leitura')
        const texto = (await subtitulo.textContent())?.trim() ?? ''
        if (!/^Leitura \d{3}$/.test(texto)) {
          falhar(`ETAPA 2 — nome inválido: "${texto}"`)
        }
      },
    )

    await par(
      page,
      '03-cards-selecao.png',
      '03-cards-resultado.png',
      'ETAPA 3 — Cards com documentos',
      async () => {
        await dialog.getByText('Bill of Lading').waitFor({ timeout: 20_000 })
        if ((await dialog.getByText('Commercial Invoice').count()) === 0) {
          falhar('ETAPA 3 — documentos não carregaram nos cards')
        }
      },
    )

    await print(page, '04-visualizar-selecao.png')
    await dialog.getByRole('button', { name: /Expandir documentos identificados/i }).click()
    const popupPromise = page.context().waitForEvent('page')
    await dialog.getByRole('button', { name: /Visualizar Bill of Lading/i }).click()
    const popup = await popupPromise
    await popup.waitForLoadState('domcontentloaded')
    if (!popup.url().startsWith('blob:')) falhar('ETAPA 4 — visualizar documento não abriu blob')
    await popup.close()
    await print(page, '04-visualizar-resultado.png')
    if (!falhas.some((f) => f.includes('ETAPA 4'))) log('✓ ETAPA 4 — Visualizar documentos')

    await par(
      page,
      '05-timer-selecao.png',
      '05-timer-resultado.png',
      'ETAPA 5 — Tempo de leitura',
      async () => {
        if ((await dialog.getByText('Tempo de leitura').count()) === 0) {
          falhar('ETAPA 5 — card Tempo de leitura ausente')
        }
        if ((await dialog.getByText(/\d{2} : \d{2} : \d{2}/).count()) === 0) {
          falhar('ETAPA 5 — timer não formatado')
        }
      },
    )

    await par(
      page,
      '06-recursos-selecao.png',
      '06-recursos-resultado.png',
      'ETAPA 6 — Recursos reduzidos',
      async () => {
        if ((await dialog.getByText('Recursos reduzidos com a leitura').count()) === 0) {
          falhar('ETAPA 6 — card Recursos reduzidos ausente')
        }
      },
    )

    await par(
      page,
      '07-acumulado-selecao.png',
      '07-acumulado-resultado.png',
      'ETAPA 7 — Tempo reduzido acumulado',
      async () => {
        if ((await dialog.getByText('Tempo reduzido acumulado').count()) === 0) {
          falhar('ETAPA 7 — card acumulado ausente')
        }
        if ((await dialog.getByText('Documentos').count()) === 0) {
          falhar('ETAPA 7 — infográfico Documentos ausente')
        }
      },
    )

    await par(
      page,
      '08-analises-selecao.png',
      '08-analises-resultado.png',
      'ETAPA 8 — Três análises',
      async () => {
        await dialog.getByText('Completo').first().waitFor({ timeout: 25_000 })
        if ((await dialog.getByText('Completo').count()) < 3) {
          falhar('ETAPA 8 — três análises não completaram')
        }
      },
    )

    await par(
      page,
      '09-globo-selecao.png',
      '09-globo-resultado.png',
      'ETAPA 9 — Globo 100%',
      async () => {
        if ((await dialog.getByText('100%').count()) < 3) {
          falhar('ETAPA 9 — globo/pipeline não chegou a 100%')
        }
      },
    )

    await par(
      page,
      '10-sla-selecao.png',
      '10-sla-resultado.png',
      'ETAPA 10 — SLA 75 segundos',
      async () => {
        const elapsed = Date.now() - inicioTotal
        if (elapsed > 75_000) {
          falhar(`ETAPA 10 — tempo ${Math.round(elapsed / 1000)}s excedeu 75s`)
        }
      },
    )
  } catch (erro) {
    falhar(String(erro))
    await print(page, '99-erro-inesperado.png').catch(() => {})
  } finally {
    await browser.close()
    const resultado = falhas.length === 0 ? 'PASSOU' : 'FALHOU'
    writeFileSync(
      resolve(OUT, 'RESULTADO.txt'),
      [...linhas, '', `Resultado: ${resultado}`, `Falhas: ${falhas.length}`].join('\n'),
      'utf-8',
    )
    log(`\nFalhas: ${falhas.length}`)
    if (falhas.length > 0) process.exitCode = 1
  }
}

void main()
