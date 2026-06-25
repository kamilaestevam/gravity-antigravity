/**
 * TST-EMT-SMTRD-NOVA-LEITURA-PASSO-UM-000150 — Passo 01 Nova Leitura
 * Regras: documentos-tecnicos/testes/regras/08-regras-prints-em-tela.md
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
  if (falhas.some(f => f.startsWith('✗') && f.includes(etapa))) return
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

async function main() {
  log('=== TST-EMT-SMTRD-NOVA-LEITURA-PASSO-UM-000150 ===')
  const browser = await chromium.launch({ headless: process.env.EMT_HEADLESS !== 'false' })
  const page = await browser.newPage()

  try {
    if (!(await autenticar(page))) throw new Error('auth-falhou')

    await par(
      page,
      '01-insights-selecao.png',
      '01-insights-resultado.png',
      'ETAPA 1 — Abertura Insights',
      async () => {
        await page.goto(`${BASE_UI}/smart_read/insights`)
        await page.getByRole('button', { name: /^Novo$/i }).waitFor({ timeout: 20_000 })
      },
    )

    await print(page, '02-modal-selecao.png')
    await page.getByRole('button', { name: /^Novo$/i }).click()
    await page.getByRole('menuitem', { name: /Nova Leitura/i }).click()
    const dialog = page.getByRole('dialog')
    await dialog.waitFor({ state: 'visible', timeout: 20_000 })
    await print(page, '02-modal-resultado.png')
    log('✓ ETAPA 2 — Modal passo 1')

    await par(
      page,
      '03-anexar-selecao.png',
      '03-anexar-resultado.png',
      'ETAPA 3 — Anexar arquivos',
      async () => {
        await dialog.locator('input[type="file"]').setInputFiles([
          resolve(FIXTURES, 'amostra.pdf'),
          resolve(FIXTURES, 'amostra.jpg'),
          resolve(FIXTURES, 'amostra.jpeg'),
          resolve(FIXTURES, 'amostra.png'),
          resolve(FIXTURES, 'amostra.xml'),
          resolve(FIXTURES, 'amostra.csv'),
          resolve(FIXTURES, 'amostra.xls'),
          resolve(FIXTURES, 'amostra.xlsx'),
        ])
        await dialog.getByText('amostra.pdf').waitFor({ timeout: 10_000 })
      },
    )

    await par(
      page,
      '04-tipos-selecao.png',
      '04-tipos-resultado.png',
      'ETAPA 4 — Oito tipos SSOT',
      async () => {
        for (const nome of ['amostra.jpg', 'amostra.png', 'amostra.xlsx']) {
          if ((await dialog.getByText(nome).count()) === 0) {
            falhar(`ETAPA 4 — tipo ausente: ${nome}`)
            return
          }
        }
      },
    )

    await par(
      page,
      '05-card-selecao.png',
      '05-card-resultado.png',
      'ETAPA 5 — Card e nome',
      async () => {
        if ((await dialog.getByText('amostra.pdf').count()) === 0) {
          falhar('ETAPA 5 — card amostra.pdf ausente')
        }
      },
    )

    await print(page, '06-visualizar-selecao.png')
    const popupPromise = page.context().waitForEvent('page')
    await dialog.getByRole('button', { name: /Visualizar original amostra\.pdf/i }).click()
    await print(page, '06-visualizar-resultado.png')
    log('✓ ETAPA 6 — Visualizar')

    await print(page, '07-preview-selecao.png')
    const popup = await popupPromise
    await popup.waitForLoadState('domcontentloaded')
    if (!popup.url().startsWith('blob:')) falhar('ETAPA 7 — preview não abriu blob URL')
    await popup.screenshot({ path: resolve(OUT, '07-preview-resultado.png') })
    log('📸 07-preview-resultado.png')
    await popup.close()
    if (!falhas.some(f => f.includes('ETAPA 7'))) log('✓ ETAPA 7 — Preview nova aba')

    await print(page, '08-excluir-selecao.png')
    await dialog.getByRole('button', { name: /Remover amostra\.xlsx/i }).click()
    const confirm = page.getByRole('dialog', { name: /Excluir arquivo/i })
    await confirm.waitFor({ state: 'visible' })
    await confirm.getByRole('button', { name: /Excluir|Confirmar/i }).click()
    await print(page, '08-excluir-resultado.png')
    if ((await dialog.getByText('amostra.xlsx').count()) > 0) falhar('ETAPA 8 — exclusão não removeu card')
    else log('✓ ETAPA 8 — Excluir')

    await par(
      page,
      '09-cancelar-selecao.png',
      '09-cancelar-resultado.png',
      'ETAPA 9 — Cancelar',
      async () => {
        await dialog.getByRole('button', { name: 'Cancelar' }).click()
        await page.getByRole('dialog').waitFor({ state: 'hidden', timeout: 10_000 })
      },
    )

    const idLeitura = 'emt-leitura-passo-um-000150'
    await page.route('**/api/v1/smart-read/leituras', async (route) => {
      if (route.request().method() === 'POST') {
        await route.fulfill({
          status: 202,
          contentType: 'application/json',
          body: JSON.stringify({
            id_leitura: idLeitura,
            id_arquivo: 'arq-emt-001',
            status_leitura: 'PROCESSING',
          }),
        })
        return
      }
      await route.continue()
    })
    await page.route(`**/api/v1/smart-read/leituras/${idLeitura}`, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id_leitura: idLeitura,
          nome_leitura: 'Leitura EMT',
          status_leitura: 'PROCESSING',
          arquivos: [{
            id_arquivo: 'arq-emt-001',
            nome_arquivo: 'amostra.pdf',
            status_arquivo: 'PROCESSING',
            resultado_extracao: [],
          }],
        }),
      })
    })

    await page.goto(`${BASE_UI}/smart_read/insights`)
    await page.getByRole('button', { name: /^Novo$/i }).click()
    await page.getByRole('menuitem', { name: /Nova Leitura/i }).click()
    const dialog2 = page.getByRole('dialog')
    await dialog2.waitFor({ state: 'visible', timeout: 20_000 })
    await dialog2.locator('input[type="file"]').setInputFiles(resolve(FIXTURES, 'amostra.pdf'))

    await par(
      page,
      '10-enviar-selecao.png',
      '10-enviar-resultado.png',
      'ETAPA 10 — Enviar passo 2',
      async () => {
        await dialog2.getByRole('button', { name: 'Enviar' }).click()
        await dialog2.getByText('Análise do arquivo').first().waitFor({ timeout: 15_000 })
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
