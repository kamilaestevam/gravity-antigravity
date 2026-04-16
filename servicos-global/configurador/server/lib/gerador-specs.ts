// server/lib/gerador-specs.ts
// Consome plano JSON e gera arquivo .spec.ts funcional para Playwright
// Importa de testes/playwright.fixtures.ts (NUNCA de @playwright/test direto)

import { existsSync, mkdirSync, writeFileSync } from 'fs'
import { resolve, dirname, relative } from 'path'
import type { PlanoTeste, Passo } from './test-schemas.js'

// ─── Escopo → pasta ──────────────────────────────────────────────────────────

const ESCOPO_DIR_MAP: Record<string, string> = {
  LOGIN:  'login',
  CONFIG: 'configurador',
  ADMIN:  'admin',
  HUB:    'hub',
  CORE:   'core',
  MARKET: 'marketplace',
  TENANT: 'tenant',
  DBASE:  'dashboard',
  PEDIDO: 'pedido',
  NFIMP:  'nf-importacao',
  LPCO:   'lpco',
  BIDFRT: 'bid-frete',
  BIDCAM: 'bid-cambio',
  SIMCUS: 'simulacusto',
  FINCOM: 'financeiro-comex',
  PROCSO: 'processo',
}

// ─── Gerar interacao Playwright ──────────────────────────────────────────────

function generateInteraction(passo: Passo): string {
  const inter = passo.interacao
  switch (inter.tipo) {
    case 'goto':
      return `await page.goto('${inter.rota}')`
    case 'click':
      return `await page.getByTestId('${inter.testid}').click()`
    case 'fill':
      return `await page.getByTestId('${inter.testid}').fill('${escapeString(inter.valor)}')`
    case 'select':
      return `await page.getByTestId('${inter.testid}').selectOption('${escapeString(inter.opcao)}')`
    case 'check':
      return `await page.getByTestId('${inter.testid}').check()`
    case 'uncheck':
      return `await page.getByTestId('${inter.testid}').uncheck()`
    case 'upload':
      return `await page.getByTestId('${inter.testid}').setInputFiles('${inter.arquivo}')`
    case 'hover':
      return `await page.getByTestId('${inter.testid}').hover()`
    case 'press':
      return `await page.keyboard.press('${inter.tecla}')`
    case 'reload':
      return `await page.reload()`
    case 'resize':
      return `await page.setViewportSize({ width: ${inter.largura}, height: ${inter.altura} })`
    case 'setRole':
      return `// TODO: trocar usuario para role ${inter.role}`
    case 'setLocale':
      return `// TODO: trocar locale para ${inter.locale}`
    case 'verificacao':
      return `// Verificacao pura (sem interacao)`
    default:
      return `// Interacao nao mapeada`
  }
}

// ─── Gerar assercao Playwright ───────────────────────────────────────────────

function generateAssertion(passo: Passo): string {
  if (!passo.assercao) return ''
  const a = passo.assercao
  switch (a.tipo) {
    case 'visible':
      return `await expect(page.getByTestId('${a.testid}')).toBeVisible()`
    case 'hidden':
      return `await expect(page.getByTestId('${a.testid}')).toBeHidden()`
    case 'enabled':
      return `await expect(page.getByTestId('${a.testid}')).toBeEnabled()`
    case 'disabled':
      return `await expect(page.getByTestId('${a.testid}')).toBeDisabled()`
    case 'hasText':
      return `await expect(page.getByTestId('${a.testid}')).toHaveText('${escapeString(a.texto)}')`
    case 'hasValue':
      return `await expect(page.getByTestId('${a.testid}')).toHaveValue('${escapeString(a.valor)}')`
    case 'hasClass':
      return `await expect(page.getByTestId('${a.testid}')).toHaveClass(/${a.classe}/)`
    case 'count':
      return `await expect(page.getByTestId('${a.testid}')).toHaveCount(${a.count})`
    case 'urlMatches':
      return `await expect(page).toHaveURL(/${a.regex}/)`
    case 'toastShown':
      return `await expect(page.getByText('${escapeString(a.texto)}')).toBeVisible()`
    case 'apiResponse':
      return `// TODO: interceptar API ${a.rota} e verificar status ${a.status}`
    case 'dbContains':
      return `// TODO: verificar banco modelo ${a.modelo}`
    default:
      return ''
  }
}

function escapeString(s: string): string {
  return s.replace(/'/g, "\\'").replace(/\n/g, '\\n')
}

// ─── Agrupar passos por categoria ────────────────────────────────────────────

function groupByCategory(passos: Passo[]): Map<number, Passo[]> {
  const groups = new Map<number, Passo[]>()
  for (const p of passos) {
    const existing = groups.get(p.categoria) ?? []
    existing.push(p)
    groups.set(p.categoria, existing)
  }
  return groups
}

// ─── Nomes das categorias ────────────────────────────────────────────────────

const CATEGORY_NAMES: Record<number, string> = {
  1: 'Carregamento da tela',
  2: 'Identidade visual',
  3: 'Navegacao lateral / breadcrumb',
  4: 'Read / Listagem / Visualizacao',
  5: 'Update / Edicao',
  6: 'Create / Criacao',
  7: 'Delete / Exclusao',
  8: 'Validacoes de campo',
  9: 'Estados de erro',
  10: 'Estados vazios',
  11: 'Estados de loading',
  12: 'Filtros e busca',
  13: 'Ordenacao',
  14: 'Permissoes / RBAC',
  15: 'Multi-tenant / isolamento',
  16: 'Acessibilidade (a11y)',
  17: 'Responsividade',
  18: 'Internacionalizacao (i18n)',
  19: 'Performance',
  20: 'Persistencia e refresh',
}

// ─── Funcao principal ────────────────────────────────────────────────────────

export function generateSpec(plan: PlanoTeste): string {
  const escopoDir = ESCOPO_DIR_MAP[plan.escopo] ?? plan.escopo.toLowerCase()
  const sublocalDir = plan.sublocal.toLowerCase().replace(/\s+/g, '-')

  // Calcular path relativo do spec para o fixtures
  const specDir = `testes/testes-e2e/${escopoDir}/${sublocalDir}`
  const fixturesRelative = relative(specDir, 'testes').replace(/\\/g, '/')

  const groups = groupByCategory(plan.passos)

  let spec = `// ${plan.id} — ${plan.tela}
// Gerado automaticamente por gerador-specs.ts em ${new Date().toISOString()}
// NAO edite manualmente — regenere a partir do plano JSON

import { test, expect } from '${fixturesRelative}/playwright.fixtures.js'

test.describe('${plan.id} — ${plan.tela}', () => {
`

  // Gerar tests agrupados por categoria
  const sortedCategories = [...groups.keys()].sort((a, b) => a - b)

  for (const catNum of sortedCategories) {
    const catName = CATEGORY_NAMES[catNum] ?? `Categoria ${catNum}`
    const passos = groups.get(catNum)!

    spec += `
  // ─── ${catNum}. ${catName} ───────────────────────────────
`

    for (const passo of passos) {
      const interaction = generateInteraction(passo)
      const assertion = generateAssertion(passo)

      spec += `
  test('${passo.numero}. ${escapeString(passo.acao)}', async ({ page }) => {
`
      if (passo.preCondicoes?.length) {
        for (const pre of passo.preCondicoes) {
          spec += `    // Pre-condicao: ${pre}\n`
        }
      }

      spec += `    ${interaction}\n`

      if (assertion) {
        spec += `    ${assertion}\n`
      }

      if (passo.notas) {
        spec += `    // Nota: ${passo.notas}\n`
      }

      spec += `  })\n`
    }
  }

  spec += `})\n`

  return spec
}

/**
 * Gera e salva o arquivo .spec.ts a partir do plano
 */
export function generateAndSaveSpec(plan: PlanoTeste): string {
  const escopoDir = ESCOPO_DIR_MAP[plan.escopo] ?? plan.escopo.toLowerCase()
  const sublocalDir = plan.sublocal.toLowerCase().replace(/\s+/g, '-')
  const specFileName = `${plan.id}.spec.ts`
  const specDir = resolve(process.cwd(), `testes/testes-e2e/${escopoDir}/${sublocalDir}`)
  const specPath = resolve(specDir, specFileName)

  if (!existsSync(specDir)) {
    mkdirSync(specDir, { recursive: true })
  }

  const content = generateSpec(plan)
  writeFileSync(specPath, content, 'utf-8')

  return `testes/testes-e2e/${escopoDir}/${sublocalDir}/${specFileName}`
}
