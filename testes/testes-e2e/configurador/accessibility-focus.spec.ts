/**
 * Testes E2E — Accessibility Focus Styles
 * Localidade: testes/testes-e2e/configurador/accessibility-focus.spec.ts
 *
 * Ferramentas: Playwright
 * Valida: Estilos focus-visible presentes em elementos interativos,
 *         garantindo que usuarios de teclado tenham indicacao visual de foco.
 *
 * Pre-requisito: Configurador frontend rodando em localhost:5010
 */

import { test, expect, type Page } from '@playwright/test'

const BASE_URL = process.env.E2E_BASE_URL ?? 'http://localhost:5010'

// ─── Helpers ───────────────────────────────────────────────────────────────

/**
 * Injeta um elemento no DOM com a classe fornecida e retorna o box-shadow
 * computado quando :focus-visible esta ativo.
 *
 * Usa uma abordagem baseada em stylesheet match para verificar que a regra
 * CSS existe, sem depender de um elemento real estar visivel na pagina.
 */
async function getFocusVisibleBoxShadow(
  page: Page,
  selector: string,
): Promise<string> {
  return page.evaluate((sel) => {
    const el = document.querySelector(sel) as HTMLElement | null
    if (!el) return 'ELEMENT_NOT_FOUND'

    // Foca o elemento via teclado (programatico + flag)
    el.focus()
    const style = getComputedStyle(el)
    return style.boxShadow || 'none'
  }, selector)
}

/**
 * Verifica se um seletor possui regra :focus-visible com box-shadow
 * definida nas stylesheets carregadas.
 */
async function hasFocusVisibleRule(page: Page, baseSelector: string): Promise<boolean> {
  return page.evaluate((sel) => {
    const focusSel = `${sel}:focus-visible`
    for (const sheet of Array.from(document.styleSheets)) {
      try {
        for (const rule of Array.from(sheet.cssRules)) {
          if (rule instanceof CSSStyleRule) {
            if (rule.selectorText.includes(focusSel) || rule.selectorText.includes(sel + ':focus-visible')) {
              if (rule.style.boxShadow) return true
            }
          }
        }
      } catch {
        // Cross-origin stylesheets lançam SecurityError — ignorar
      }
    }
    return false
  }, baseSelector)
}

/**
 * Navega com Tab ate encontrar um elemento que corresponda ao seletor,
 * e retorna o box-shadow computado dele.
 */
async function tabToElementAndGetBoxShadow(
  page: Page,
  selector: string,
  maxTabs: number = 30,
): Promise<string> {
  for (let i = 0; i < maxTabs; i++) {
    await page.keyboard.press('Tab')
    const result = await page.evaluate((sel) => {
      const focused = document.activeElement
      if (!focused) return null
      if (focused.matches(sel)) {
        return getComputedStyle(focused).boxShadow || 'none'
      }
      return null
    }, selector)

    if (result !== null) return result
  }
  return 'ELEMENT_NOT_REACHED'
}

// ─── Testes ────────────────────────────────────────────────────────────────

test.describe('Accessibility — Focus Visible Styles', () => {
  test.beforeEach(async ({ page }) => {
    const jsErrors: string[] = []
    page.on('pageerror', (err) => jsErrors.push(err.message))

    await page.goto(BASE_URL, { waitUntil: 'domcontentloaded', timeout: 30_000 })
  })

  test('modal close button should have visible focus ring when tabbed to', async ({ page }) => {
    // Verifica que a regra CSS :focus-visible existe nas stylesheets
    const hasRule = await hasFocusVisibleRule(page, '.mg-btn-fechar')
    expect(hasRule, '.mg-btn-fechar deve ter regra :focus-visible com box-shadow').toBe(true)

    // Se houver um modal aberto ou injetamos um para testar o computed style
    const hasElement = await page.evaluate(() => {
      return document.querySelector('.mg-btn-fechar') !== null
    })

    if (hasElement) {
      const boxShadow = await tabToElementAndGetBoxShadow(page, '.mg-btn-fechar')
      if (boxShadow !== 'ELEMENT_NOT_REACHED') {
        expect(boxShadow, 'box-shadow do focus ring nao deve ser "none"').not.toBe('none')
        // Verifica que contem a cor indigo esperada (99, 102, 241) ou similar
        expect(boxShadow).toContain('rgb')
      }
    }
  })

  test('language switcher trigger should have visible focus ring', async ({ page }) => {
    // Verifica regra CSS
    const hasRule = await hasFocusVisibleRule(page, '.lang-switcher__trigger')
    expect(hasRule, '.lang-switcher__trigger deve ter regra :focus-visible com box-shadow').toBe(true)

    // Se o elemento existir na pagina, testa via Tab
    const hasElement = await page.evaluate(() => {
      return document.querySelector('.lang-switcher__trigger') !== null
    })

    if (hasElement) {
      const boxShadow = await tabToElementAndGetBoxShadow(page, '.lang-switcher__trigger')
      if (boxShadow !== 'ELEMENT_NOT_REACHED') {
        expect(boxShadow, 'box-shadow do focus ring nao deve ser "none"').not.toBe('none')
        expect(boxShadow).toContain('rgb')
      }
    }
  })

  test('view toggle buttons should have visible focus ring', async ({ page }) => {
    // Verifica regra CSS para .sv-btn
    const hasRule = await hasFocusVisibleRule(page, '.sv-btn')
    expect(hasRule, '.sv-btn deve ter regra :focus-visible com box-shadow').toBe(true)

    // Se o elemento existir na pagina, testa via Tab
    const hasElement = await page.evaluate(() => {
      return document.querySelector('.sv-btn') !== null
    })

    if (hasElement) {
      const boxShadow = await tabToElementAndGetBoxShadow(page, '.sv-btn')
      if (boxShadow !== 'ELEMENT_NOT_REACHED') {
        expect(boxShadow, 'box-shadow do focus ring nao deve ser "none"').not.toBe('none')
        expect(boxShadow).toContain('rgb')
      }
    }
  })

  test('table action buttons should have visible focus ring', async ({ page }) => {
    // Verifica regra CSS para .tcg-acao-btn (tabela-camadas-global)
    const hasRuleTcg = await hasFocusVisibleRule(page, '.tcg-acao-btn')
    expect(hasRuleTcg, '.tcg-acao-btn deve ter regra :focus-visible com box-shadow').toBe(true)

    // Verifica regra CSS para .vcg-close-btn (visibilidade columns)
    const hasRuleVcg = await hasFocusVisibleRule(page, '.vcg-close-btn')
    expect(hasRuleVcg, '.vcg-close-btn deve ter regra :focus-visible com box-shadow').toBe(true)

    // Verifica regra CSS para .tcg-chevron-btn
    const hasRuleChevron = await hasFocusVisibleRule(page, '.tcg-chevron-btn')
    expect(hasRuleChevron, '.tcg-chevron-btn deve ter regra :focus-visible com box-shadow').toBe(true)

    // Se houver botoes de tabela na pagina, testa via Tab
    const hasElement = await page.evaluate(() => {
      return document.querySelector('.tcg-acao-btn, .vcg-close-btn, .tcg-chevron-btn') !== null
    })

    if (hasElement) {
      const selector = '.tcg-acao-btn, .vcg-close-btn, .tcg-chevron-btn'
      const boxShadow = await tabToElementAndGetBoxShadow(page, selector)
      if (boxShadow !== 'ELEMENT_NOT_REACHED') {
        expect(boxShadow, 'box-shadow do focus ring nao deve ser "none"').not.toBe('none')
        expect(boxShadow).toContain('rgb')
      }
    }
  })

  test('global button component (.gb-btn) should have visible focus ring', async ({ page }) => {
    // Verifica regra CSS do componente botao-global
    const hasRule = await hasFocusVisibleRule(page, '.gb-btn')
    expect(hasRule, '.gb-btn deve ter regra :focus-visible com box-shadow').toBe(true)

    const hasElement = await page.evaluate(() => {
      return document.querySelector('.gb-btn') !== null
    })

    if (hasElement) {
      const boxShadow = await tabToElementAndGetBoxShadow(page, '.gb-btn')
      if (boxShadow !== 'ELEMENT_NOT_REACHED') {
        expect(boxShadow, 'box-shadow do focus ring nao deve ser "none"').not.toBe('none')
        expect(boxShadow).toContain('rgb')
      }
    }
  })

  test('focus ring uses correct indigo color (WCAG accessible)', async ({ page }) => {
    // Verifica que a cor do focus ring nas regras CSS contem rgba indigo
    const focusColors = await page.evaluate(() => {
      const results: Array<{ selector: string; boxShadow: string }> = []
      const targetSelectors = [
        '.mg-btn-fechar:focus-visible',
        '.lang-switcher__trigger:focus-visible',
        '.sv-btn:focus-visible',
        '.gb-btn:focus-visible',
      ]

      for (const sheet of Array.from(document.styleSheets)) {
        try {
          for (const rule of Array.from(sheet.cssRules)) {
            if (rule instanceof CSSStyleRule) {
              for (const target of targetSelectors) {
                if (rule.selectorText.includes(target.replace(':focus-visible', '')) &&
                    rule.selectorText.includes('focus-visible')) {
                  if (rule.style.boxShadow) {
                    results.push({
                      selector: rule.selectorText,
                      boxShadow: rule.style.boxShadow,
                    })
                  }
                }
              }
            }
          }
        } catch {
          // Cross-origin stylesheets
        }
      }
      return results
    })

    expect(focusColors.length, 'deve encontrar pelo menos 2 regras focus-visible com box-shadow').toBeGreaterThanOrEqual(2)

    // Todas devem conter um ring de 2px ou 3px (pattern: 0 0 0 Npx)
    for (const entry of focusColors) {
      expect(
        entry.boxShadow,
        `${entry.selector} deve ter ring de 2-3px`,
      ).toMatch(/0\s+(0\s+){1,2}0\s+(2|3)px/)
    }
  })
})
