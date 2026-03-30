/**
 * E2E: Persistência de idioma entre navegações e reloads.
 *
 * Testes:
 * - Após trocar para inglês, navegar para outra página mantém o idioma
 * - Recarregar a página mantém o idioma selecionado
 * - Voltar e avançar no histórico mantém o idioma correto
 */
import { test, expect } from '@playwright/test'

const BASE_URL = 'http://localhost:5010'

/**
 * Helper: troca o idioma via LanguageSwitcher
 */
async function switchLanguage(page: import('@playwright/test').Page, langCode: string) {
  await page.getByTestId('language-switcher').click()
  await page.getByTestId(`lang-option-${langCode}`).click()
  // Aguarda um momento para o i18n processar
  await page.waitForTimeout(300)
}

test.describe('language-persistence: Navegação entre páginas', () => {
  test('após trocar para inglês, navegar para outra página mantém o idioma', async ({ page }) => {
    await page.goto(`${BASE_URL}/dashboard`)
    await page.waitForLoadState('networkidle')

    // Troca para inglês
    await switchLanguage(page, 'en')

    // Verifica que está em inglês
    expect(await page.getAttribute('html', 'lang')).toBe('en')

    // Navega para outra página via sidebar ou URL direta
    await page.goto(`${BASE_URL}/historico`)
    await page.waitForLoadState('networkidle')

    // Idioma deve permanecer em inglês
    expect(await page.getAttribute('html', 'lang')).toBe('en')
    await expect(page.getByTestId('language-switcher')).toContainText('EN')
  })
})

test.describe('language-persistence: Reload da página', () => {
  test('recarregar a página mantém o idioma selecionado', async ({ page }) => {
    await page.goto(BASE_URL)
    await page.waitForLoadState('networkidle')

    // Troca para espanhol
    await switchLanguage(page, 'es')

    // Verifica espanhol
    expect(await page.getAttribute('html', 'lang')).toBe('es')

    // Recarrega a página
    await page.reload()
    await page.waitForLoadState('networkidle')

    // Idioma deve permanecer em espanhol
    expect(await page.getAttribute('html', 'lang')).toBe('es')
    await expect(page.getByTestId('language-switcher')).toContainText('ES')
  })
})

test.describe('language-persistence: Histórico do browser', () => {
  test('voltar e avançar no histórico mantém o idioma correto', async ({ page }) => {
    await page.goto(`${BASE_URL}/dashboard`)
    await page.waitForLoadState('networkidle')

    // Troca para inglês
    await switchLanguage(page, 'en')
    expect(await page.getAttribute('html', 'lang')).toBe('en')

    // Navega para outra página
    await page.goto(`${BASE_URL}/historico`)
    await page.waitForLoadState('networkidle')

    // Volta no histórico
    await page.goBack()
    await page.waitForLoadState('networkidle')

    // Idioma deve ser inglês
    expect(await page.getAttribute('html', 'lang')).toBe('en')

    // Avança no histórico
    await page.goForward()
    await page.waitForLoadState('networkidle')

    // Idioma continua inglês
    expect(await page.getAttribute('html', 'lang')).toBe('en')
  })
})
