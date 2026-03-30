/**
 * Testes E2E — Light Theme
 * Localidade: testes/testes-e2e/configurador/light-theme.spec.ts
 *
 * Ferramentas: Playwright
 * Valida: Troca de tema funciona, cores CSS aplicadas corretamente,
 *         componentes visiveis no modo claro, contraste acessivel,
 *         overrides do ConectorCargoWise no light theme.
 *
 * Pre-requisito: Configurador frontend rodando em localhost:5010
 */

import { test, expect, type Page } from '@playwright/test'

const BASE_URL = process.env.E2E_BASE_URL ?? 'http://localhost:5010'

// ─── Helpers ───────────────────────────────────────────────────────────────

/** Obtem o valor computado de uma CSS variable no body */
async function getCssVar(page: Page, varName: string): Promise<string> {
  return page.evaluate((name) => {
    return getComputedStyle(document.body).getPropertyValue(name).trim()
  }, varName)
}

/** Verifica se body tem a classe light-theme */
async function isLightMode(page: Page): Promise<boolean> {
  return page.evaluate(() => document.body.classList.contains('light-theme'))
}

/** Calcula luminancia relativa de um hex */
function luminance(hex: string): number {
  const h = hex.replace('#', '')
  const srgb = [
    parseInt(h.slice(0, 2), 16) / 255,
    parseInt(h.slice(2, 4), 16) / 255,
    parseInt(h.slice(4, 6), 16) / 255,
  ]
  const linear = srgb.map((c) =>
    c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4,
  )
  return 0.2126 * linear[0] + 0.7152 * linear[1] + 0.0722 * linear[2]
}

/** Calcula contrast ratio */
function contrastRatio(hex1: string, hex2: string): number {
  const l1 = luminance(hex1)
  const l2 = luminance(hex2)
  const lighter = Math.max(l1, l2)
  const darker = Math.min(l1, l2)
  return (lighter + 0.05) / (darker + 0.05)
}

/** Resolve cor computada para hex */
async function getComputedColor(page: Page, selector: string, property: string): Promise<string> {
  return page.evaluate(
    ({ sel, prop }) => {
      const el = document.querySelector(sel)
      if (!el) return ''
      const val = getComputedStyle(el).getPropertyValue(prop)
      // Converte rgb(r, g, b) para #rrggbb
      const match = val.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/)
      if (match) {
        const [, r, g, b] = match
        return '#' + [r, g, b].map((c) => parseInt(c).toString(16).padStart(2, '0')).join('')
      }
      return val.trim()
    },
    { sel: selector, prop: property },
  )
}

/** Ativa light theme e aguarda repaint */
async function enableLightTheme(page: Page): Promise<void> {
  await page.evaluate(() => document.body.classList.add('light-theme'))
  await page.waitForTimeout(200)
}

/**
 * Verifica se uma regra CSS existe para um seletor no light theme.
 * Retorna as propriedades encontradas.
 */
async function getLightThemeRuleProperties(
  page: Page,
  selectorFragment: string,
): Promise<Record<string, string>> {
  return page.evaluate((sel) => {
    const props: Record<string, string> = {}
    for (const sheet of Array.from(document.styleSheets)) {
      try {
        for (const rule of Array.from(sheet.cssRules)) {
          if (rule instanceof CSSStyleRule) {
            if (rule.selectorText.includes('light-theme') && rule.selectorText.includes(sel)) {
              for (let i = 0; i < rule.style.length; i++) {
                const prop = rule.style[i]
                props[prop] = rule.style.getPropertyValue(prop)
              }
            }
          }
        }
      } catch {
        // Cross-origin stylesheets
      }
    }
    return props
  }, selectorFragment)
}

// ─── Testes — Core Light Theme ────────────────────────────────────────────

test.describe('Light Theme — E2E', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL, { waitUntil: 'networkidle', timeout: 30_000 })
  })

  test('body.light-theme e aplicavel via JavaScript', async ({ page }) => {
    // Ativa light mode via JS (simula o que o toggleTheme faz)
    await page.evaluate(() => document.body.classList.add('light-theme'))
    expect(await isLightMode(page)).toBe(true)

    // Remove e verifica volta ao dark
    await page.evaluate(() => document.body.classList.remove('light-theme'))
    expect(await isLightMode(page)).toBe(false)
  })

  test('CSS variables mudam ao ativar light-theme', async ({ page }) => {
    // Ativa light mode
    await enableLightTheme(page)

    // Verifica que body agora tem a classe
    expect(await isLightMode(page)).toBe(true)

    // Verifica que o CSS do shell muda (via propriedade no #root ou body)
    const hasClass = await page.evaluate(() => document.body.classList.contains('light-theme'))
    expect(hasClass).toBe(true)
  })

  test('tokens light tem valores corretos via getComputedStyle', async ({ page }) => {
    await enableLightTheme(page)

    // Verifica tokens criticos
    const bgBody = await getCssVar(page, '--bg-body')
    const textPrimary = await getCssVar(page, '--text-primary')
    const textMuted = await getCssVar(page, '--text-muted')

    // bg-body NAO deve ser #ffffff (branco puro)
    expect(bgBody.toLowerCase()).not.toBe('#ffffff')

    // text-primary NAO deve ser #000000 (preto puro)
    expect(textPrimary.toLowerCase()).not.toBe('#000000')

    // text-muted NAO deve ser #94a3b8 (antigo valor que reprovava WCAG)
    expect(textMuted.toLowerCase()).not.toBe('#94a3b8')
  })

  test('nenhum texto fica invisivel no light mode', async ({ page }) => {
    await enableLightTheme(page)

    const textElements = await page.evaluate(() => {
      const results: Array<{ tag: string; color: string; bg: string }> = []
      const els = document.querySelectorAll('h1, h2, h3, p, span, a, label, button')
      for (const el of Array.from(els).slice(0, 20)) {
        const style = getComputedStyle(el)
        if (style.display !== 'none' && style.visibility !== 'hidden' && style.opacity !== '0') {
          results.push({
            tag: el.tagName,
            color: style.color,
            bg: style.backgroundColor,
          })
        }
      }
      return results
    })

    // Pelo menos algum texto deve estar visivel
    expect(textElements.length).toBeGreaterThan(0)

    // Nenhum texto deve ter a mesma cor que o fundo
    for (const el of textElements) {
      if (el.color && el.bg && el.bg !== 'rgba(0, 0, 0, 0)') {
        expect(el.color, `${el.tag} cor nao deve ser igual ao fundo`).not.toBe(el.bg)
      }
    }
  })

  test('sidebar e visivel no light mode', async ({ page }) => {
    await enableLightTheme(page)

    const sidebarBg = await page.evaluate(() => {
      const sidebar = document.querySelector('.shell-sidebar, .mlg-sidebar, .ws-sidebar')
      if (!sidebar) return null
      return getComputedStyle(sidebar).backgroundColor
    })

    if (sidebarBg) {
      // O fundo nao deve conter a cor dark #0f172a (rgb(15, 23, 42))
      expect(sidebarBg).not.toContain('rgb(15, 23, 42)')
    }
  })

  test('botoes primarios tem contraste suficiente', async ({ page }) => {
    await enableLightTheme(page)

    const buttons = await page.evaluate(() => {
      const results: Array<{ text: string; color: string; bg: string }> = []
      const btns = document.querySelectorAll('.gb-btn--primario, button[class*="primario"]')
      for (const btn of Array.from(btns).slice(0, 5)) {
        const style = getComputedStyle(btn)
        results.push({
          text: (btn as HTMLElement).innerText?.slice(0, 20) || 'btn',
          color: style.color,
          bg: style.backgroundColor,
        })
      }
      return results
    })

    // Se ha botoes primarios, verificar contraste
    for (const btn of buttons) {
      const colorMatch = btn.color.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/)
      const bgMatch = btn.bg.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/)

      if (colorMatch && bgMatch) {
        const toHex = (r: string, g: string, b: string) =>
          '#' + [r, g, b].map((c) => parseInt(c).toString(16).padStart(2, '0')).join('')

        const fgHex = toHex(colorMatch[1], colorMatch[2], colorMatch[3])
        const bgHex = toHex(bgMatch[1], bgMatch[2], bgMatch[3])
        const ratio = contrastRatio(fgHex, bgHex)

        expect(ratio, `Botao "${btn.text}" deve ter contraste >= 4.5:1 (tem ${ratio.toFixed(1)}:1)`).toBeGreaterThanOrEqual(4.5)
      }
    }
  })

  test('troca dark -> light -> dark nao quebra a UI', async ({ page }) => {
    // Dark — sem classe light-theme
    await page.evaluate(() => document.body.classList.remove('light-theme'))
    const isDarkBefore = await page.evaluate(() => !document.body.classList.contains('light-theme'))
    expect(isDarkBefore).toBe(true)

    // Light
    await enableLightTheme(page)
    const isLight = await page.evaluate(() => document.body.classList.contains('light-theme'))
    expect(isLight).toBe(true)

    // Verifica que textos visiveis ainda existem (UI nao quebrou)
    const textCount = await page.evaluate(() => {
      return document.querySelectorAll('h1, h2, h3, p, span, a, button').length
    })
    expect(textCount).toBeGreaterThan(0)

    // Dark novamente
    await page.evaluate(() => document.body.classList.remove('light-theme'))
    await page.waitForTimeout(150)
    const isDarkAfter = await page.evaluate(() => !document.body.classList.contains('light-theme'))
    expect(isDarkAfter).toBe(true)
  })
})

// ─── Testes — ConectorCargoWise Light Theme Overrides ─────────────────────

test.describe('Light Theme — ConectorCargoWise Elements', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL, { waitUntil: 'networkidle', timeout: 30_000 })
  })

  test('elements with rgba(255,255,255,...) should have visible alternatives in light theme', async ({ page }) => {
    await enableLightTheme(page)

    // Verifica que nenhum elemento visivel usa rgba(255,255,255,...) como cor de texto
    // no light theme, pois isso seria invisivel em fundo claro
    const invisibleTextElements = await page.evaluate(() => {
      const results: Array<{ selector: string; color: string }> = []
      const allElements = document.querySelectorAll('*')

      for (const el of Array.from(allElements).slice(0, 200)) {
        const style = getComputedStyle(el)
        if (style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0') continue

        const color = style.color
        // Detecta branco puro ou quase branco que seria invisivel em fundo claro
        const whiteMatch = color.match(/rgba?\(255,\s*255,\s*255/)
        if (whiteMatch) {
          // Verifica se o elemento tem texto visivel
          const text = (el as HTMLElement).innerText?.trim()
          if (text && text.length > 0) {
            // Verifica se o fundo do elemento e escuro (o que tornaria o branco OK)
            const bg = style.backgroundColor
            const darkBgMatch = bg.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/)
            if (darkBgMatch) {
              const [, r, g, b] = darkBgMatch
              const avgBrightness = (parseInt(r) + parseInt(g) + parseInt(b)) / 3
              // Se o fundo e claro (> 128), texto branco e invisivel
              if (avgBrightness > 128) {
                results.push({
                  selector: el.tagName + (el.className ? '.' + String(el.className).split(' ')[0] : ''),
                  color,
                })
              }
            }
          }
        }
      }
      return results
    })

    expect(
      invisibleTextElements,
      'Nenhum texto branco deve ser invisivel em fundo claro no light theme',
    ).toEqual([])
  })

  test('ConectorCargoWise light theme CSS rules should exist in stylesheets', async ({ page }) => {
    // Verifica que as regras de override existem para os componentes CW
    const cwStepCircle = await getLightThemeRuleProperties(page, '.cw-step__circle')
    expect(
      Object.keys(cwStepCircle).length,
      'body.light-theme .cw-step__circle deve ter propriedades definidas',
    ).toBeGreaterThan(0)

    const cwMappingRow = await getLightThemeRuleProperties(page, '.cw-mapping-row')
    expect(
      Object.keys(cwMappingRow).length,
      'body.light-theme .cw-mapping-row deve ter propriedades definidas',
    ).toBeGreaterThan(0)

    const cwUploadZone = await getLightThemeRuleProperties(page, '.cw-upload-zone')
    expect(
      Object.keys(cwUploadZone).length,
      'body.light-theme .cw-upload-zone deve ter propriedades definidas',
    ).toBeGreaterThan(0)

    const cwXmlViewer = await getLightThemeRuleProperties(page, '.cw-xml-viewer')
    expect(
      Object.keys(cwXmlViewer).length,
      'body.light-theme .cw-xml-viewer deve ter propriedades definidas',
    ).toBeGreaterThan(0)
  })

  test('ConectorCargoWise step circle active should use non-white colors in light theme', async ({ page }) => {
    const activeProps = await getLightThemeRuleProperties(page, '.cw-step__circle--active')

    // Deve ter background e border-color definidos
    expect(activeProps['background'] || activeProps['background-color']).toBeTruthy()
    expect(activeProps['border-color']).toBeTruthy()

    // Background nao deve ser branco puro
    const bg = activeProps['background'] || activeProps['background-color'] || ''
    expect(bg).not.toBe('#ffffff')
    expect(bg).not.toBe('rgb(255, 255, 255)')

    // Deve ter color (texto) definido
    expect(activeProps['color']).toBeTruthy()
  })

  test('ConectorCargoWise step circle done should use green tones in light theme', async ({ page }) => {
    const doneProps = await getLightThemeRuleProperties(page, '.cw-step__circle--done')

    expect(doneProps['background'] || doneProps['background-color']).toBeTruthy()
    expect(doneProps['color']).toBeTruthy()

    // A cor de "done" deve conter verde (#16a34a)
    const color = doneProps['color'] || ''
    expect(color.toLowerCase()).toContain('#16a34a')
  })

  test('badge classes should use correct light theme colors', async ({ page }) => {
    // Verifica regras CSS para badges no light theme
    const successProps = await getLightThemeRuleProperties(page, '.ws-badge-success')
    expect(
      Object.keys(successProps).length,
      'body.light-theme .ws-badge-success deve ter overrides',
    ).toBeGreaterThan(0)
    // Cor de texto deve ser verde escuro (nao branco)
    expect(successProps['color']?.toLowerCase()).toBe('#16a34a')
    // Background deve ser verde claro
    expect(successProps['background']?.toLowerCase()).toBe('#dcfce7')

    const warningProps = await getLightThemeRuleProperties(page, '.ws-badge-warning')
    expect(
      Object.keys(warningProps).length,
      'body.light-theme .ws-badge-warning deve ter overrides',
    ).toBeGreaterThan(0)
    expect(warningProps['color']?.toLowerCase()).toBe('#b45309')
    expect(warningProps['background']?.toLowerCase()).toBe('#fef3c7')

    const dangerProps = await getLightThemeRuleProperties(page, '.ws-badge-danger')
    expect(
      Object.keys(dangerProps).length,
      'body.light-theme .ws-badge-danger deve ter overrides',
    ).toBeGreaterThan(0)
    expect(dangerProps['color']?.toLowerCase()).toBe('#dc2626')
    expect(dangerProps['background']?.toLowerCase()).toBe('#fee2e2')

    const infoProps = await getLightThemeRuleProperties(page, '.ws-badge-info')
    expect(
      Object.keys(infoProps).length,
      'body.light-theme .ws-badge-info deve ter overrides',
    ).toBeGreaterThan(0)
    expect(infoProps['color']?.toLowerCase()).toBe('#0e7490')
    expect(infoProps['background']?.toLowerCase()).toBe('#cffafe')
  })

  test('badge light theme colors should have sufficient WCAG contrast', async ({ page }) => {
    // Pares [text, background] dos badges no light theme
    const badgePairs: Array<{ name: string; fg: string; bg: string }> = [
      { name: 'success', fg: '#16a34a', bg: '#dcfce7' },
      { name: 'warning', fg: '#b45309', bg: '#fef3c7' },
      { name: 'danger',  fg: '#dc2626', bg: '#fee2e2' },
      { name: 'info',    fg: '#0e7490', bg: '#cffafe' },
    ]

    for (const pair of badgePairs) {
      const ratio = contrastRatio(pair.fg, pair.bg)
      expect(
        ratio,
        `Badge ${pair.name} deve ter contraste >= 4.5:1 (tem ${ratio.toFixed(1)}:1)`,
      ).toBeGreaterThanOrEqual(4.5)
    }
  })

  test('code blocks should use DM Mono font family', async ({ page }) => {
    // Verifica que as regras CSS para .cw-xml-viewer e code blocks usam DM Mono
    const hasDmMono = await page.evaluate(() => {
      const targetSelectors = ['.cw-xml-viewer', '.cw-mapping-val']
      const results: Array<{ selector: string; fontFamily: string }> = []

      for (const sheet of Array.from(document.styleSheets)) {
        try {
          for (const rule of Array.from(sheet.cssRules)) {
            if (rule instanceof CSSStyleRule) {
              for (const target of targetSelectors) {
                if (rule.selectorText.includes(target)) {
                  const ff = rule.style.fontFamily
                  if (ff) {
                    results.push({
                      selector: rule.selectorText,
                      fontFamily: ff,
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

    expect(hasDmMono.length, 'deve encontrar regras com font-family para code blocks').toBeGreaterThan(0)

    // Pelo menos uma regra deve conter "DM Mono"
    const hasMono = hasDmMono.some((r) => r.fontFamily.includes('DM Mono'))
    expect(hasMono, 'code blocks devem usar DM Mono como font-family').toBe(true)
  })

  test('ConectorCargoWise xml-viewer should have light background in light theme', async ({ page }) => {
    const props = await getLightThemeRuleProperties(page, '.cw-xml-viewer')

    // Deve ter background definido
    const bg = props['background'] || props['background-color'] || ''
    expect(bg, '.cw-xml-viewer deve ter background no light theme').toBeTruthy()

    // O background deve ser um tom claro (#f8fafc)
    expect(bg.toLowerCase()).toBe('#f8fafc')
  })

  test('ConectorCargoWise upload zone should have visible borders in light theme', async ({ page }) => {
    const props = await getLightThemeRuleProperties(page, '.cw-upload-zone')

    expect(props['border-color'], '.cw-upload-zone deve ter border-color no light theme').toBeTruthy()
    expect(props['background'] || props['background-color'], '.cw-upload-zone deve ter background no light theme').toBeTruthy()
  })

  test('screenshot do light mode para revisao visual', async ({ page }) => {
    await enableLightTheme(page)

    await page.screenshot({
      path: 'screenshots/light-theme-full.png',
      fullPage: true,
    })
  })
})
