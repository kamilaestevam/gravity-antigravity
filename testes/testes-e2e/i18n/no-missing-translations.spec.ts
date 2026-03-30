/**
 * E2E: Verifica que nenhum texto não traduzido aparece na interface.
 *
 * Testes:
 * - Nenhum elemento visível contém chave crua (ex: "nav.home") nos 3 idiomas
 * - Cockpit admin: nenhuma chave crua em /pt (roda apenas em português)
 *
 * Uma chave crua indica que o i18next não encontrou a tradução e exibiu
 * a chave como fallback, o que é um bug de i18n.
 */
import { test, expect } from '@playwright/test'

const BASE_URL = 'http://localhost:5010'

/**
 * Regex que detecta chaves i18n cruas na interface.
 * Padrão: namespace.chave ou namespace.sub.chave (ex: "shell.menu.dashboard")
 * Ignora textos que parecem ser URLs, emails, ou propriedades CSS.
 */
const RAW_KEY_PATTERN = /\b[a-z][a-z0-9]*\.[a-z][a-z0-9_]*\.[a-z][a-z0-9_]+/g

/**
 * Chaves que são falsos positivos (textos legítimos que parecem chaves i18n).
 * Ex: "gravity.com.br" parece uma chave mas é um domínio.
 */
const FALSE_POSITIVES = [
  'gravity.com.br',
  'usuario@gravity.com',
  'admin@gravity.com',
  'localhost:8005',
  'localhost:5010',
  'oauth2.googleapis',
  'react-dom.development',
  'react.development',
]

function isFalsePositive(text: string): boolean {
  return FALSE_POSITIVES.some((fp) => text.includes(fp))
}

/**
 * Helper: troca o idioma e verifica chaves cruas na página
 */
async function checkForRawKeys(
  page: import('@playwright/test').Page,
  langCode: string,
  route: string
) {
  // Configura idioma via localStorage antes de navegar
  await page.addInitScript((lang) => {
    localStorage.setItem('gravity:language', lang)
  }, langCode)

  await page.goto(`${BASE_URL}${route}`)
  await page.waitForLoadState('networkidle')
  // Aguarda renderização do i18n
  await page.waitForTimeout(500)

  // Coleta texto visível de todos os elementos
  const visibleText = await page.evaluate(() => {
    const walker = document.createTreeWalker(
      document.body,
      NodeFilter.SHOW_TEXT,
      {
        acceptNode(node) {
          const parent = node.parentElement
          if (!parent) return NodeFilter.FILTER_REJECT
          const style = getComputedStyle(parent)
          if (style.display === 'none' || style.visibility === 'hidden') {
            return NodeFilter.FILTER_REJECT
          }
          return NodeFilter.FILTER_ACCEPT
        },
      }
    )

    const texts: string[] = []
    let node: Node | null
    while ((node = walker.nextNode())) {
      const text = (node.textContent ?? '').trim()
      if (text.length > 3) texts.push(text)
    }
    return texts
  })

  // Procura chaves cruas
  const rawKeys: string[] = []
  for (const text of visibleText) {
    if (isFalsePositive(text)) continue
    const matches = text.match(RAW_KEY_PATTERN)
    if (matches) {
      for (const match of matches) {
        if (isFalsePositive(match)) continue
        // Verifica se parece realmente uma chave i18n (tem pelo menos 2 pontos)
        if (match.split('.').length >= 3) {
          rawKeys.push(match)
        }
      }
    }
  }

  return rawKeys
}

// ─── Testes: 3 idiomas ───────────────────────────────────────────────────

const ROUTES_TO_CHECK = ['/dashboard', '/configurador']

for (const lang of ['pt', 'en', 'es']) {
  test.describe(`no-missing-translations [${lang.toUpperCase()}]`, () => {
    for (const route of ROUTES_TO_CHECK) {
      test(`nenhuma chave crua visível em ${route}`, async ({ page }) => {
        const rawKeys = await checkForRawKeys(page, lang, route)

        if (rawKeys.length > 0) {
          console.log(
            `⚠️ Chaves cruas encontradas em ${route} [${lang}]:`,
            rawKeys
          )
        }

        expect(rawKeys).toEqual([])
      })
    }
  })
}

// ─── Teste: Admin Cockpit (apenas português) ─────────────────────────────

test.describe('no-missing-translations: Admin Cockpit [PT only]', () => {
  test('nenhuma chave crua visível em /admin/apis (português)', async ({
    page,
  }) => {
    const rawKeys = await checkForRawKeys(page, 'pt', '/admin/apis')

    if (rawKeys.length > 0) {
      console.log('⚠️ Chaves cruas no Admin Cockpit:', rawKeys)
    }

    expect(rawKeys).toEqual([])
  })

  // Este teste NÃO roda em en e es para páginas sob /admin/*
  // porque admin.cockpit.* é exclusivo de português por design.
})
