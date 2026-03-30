/**
 * Testes unitários — Light Theme Tokens
 * Localização: testes/testes-unitarios/nucleo-global/tokens/light-theme.test.ts
 *
 * Ferramentas: Vitest (node)
 * Valida: exports de coresLight, conformidade WCAG AA, regras inegociáveis
 */

import { describe, it, expect } from 'vitest'
import { coresLight, cores } from '../../../../nucleo-global/Tokens/index'

// ─── Helpers WCAG ──────────────────────────────────────────────────────────

/** Converte hex (#rrggbb) para [r, g, b] no range 0-1 */
function hexToSrgb(hex: string): [number, number, number] {
  const h = hex.replace('#', '')
  return [
    parseInt(h.slice(0, 2), 16) / 255,
    parseInt(h.slice(2, 4), 16) / 255,
    parseInt(h.slice(4, 6), 16) / 255,
  ]
}

/** Lineariza componente sRGB */
function linearize(c: number): number {
  return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
}

/** Luminância relativa WCAG 2.1 */
function luminance(hex: string): number {
  const [r, g, b] = hexToSrgb(hex).map(linearize)
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

/** Contrast ratio WCAG 2.1 */
function contrastRatio(hex1: string, hex2: string): number {
  const l1 = luminance(hex1)
  const l2 = luminance(hex2)
  const lighter = Math.max(l1, l2)
  const darker = Math.min(l1, l2)
  return (lighter + 0.05) / (darker + 0.05)
}

// ─── 1. Exports ────────────────────────────────────────────────────────────

describe('Light Theme — exports', () => {
  it('exporta objeto de coresLight', () => {
    expect(coresLight).toBeDefined()
    expect(typeof coresLight).toBe('object')
  })

  it('contém todas as cores obrigatórias do light theme', () => {
    const obrigatorias = [
      'bgBody', 'bgBase', 'bgSurface', 'bgElevated',
      'accent', 'accentHover', 'accentDim', 'accentSoft',
      'textPrimary', 'textSecondary', 'textMuted',
      'success', 'successSoft', 'warning', 'warningSoft',
      'danger', 'dangerSoft',
      'borderDefault', 'borderAccent',
    ] as const

    for (const cor of obrigatorias) {
      expect(coresLight, `coresLight deve ter ${cor}`).toHaveProperty(cor)
      expect(typeof coresLight[cor]).toBe('string')
    }
  })

  it('todas as cores são hex válidos', () => {
    const hexRegex = /^#[0-9a-fA-F]{6}$/
    for (const [chave, valor] of Object.entries(coresLight)) {
      expect(valor, `coresLight.${chave} deveria ser hex válido`).toMatch(hexRegex)
    }
  })
})

// ─── 2. Regras Inegociáveis ────────────────────────────────────────────────

describe('Light Theme — regras inegociáveis', () => {
  it('NÃO usa branco puro (#ffffff) como fundo base (bg-body ou bg-base)', () => {
    expect(coresLight.bgBody).not.toBe('#ffffff')
    expect(coresLight.bgBase).not.toBe('#ffffff')
  })

  it('NÃO usa preto puro (#000000) como texto principal', () => {
    expect(coresLight.textPrimary).not.toBe('#000000')
  })

  it('bg-body é off-white com undertone frio (Slate-50 = #f1f5f9)', () => {
    expect(coresLight.bgBody).toBe('#f1f5f9')
  })

  it('accent é Indigo-600 (#4f46e5) para contraste WCAG AA', () => {
    expect(coresLight.accent).toBe('#4f46e5')
  })

  it('dark mode não foi alterado — cores originais intactas', () => {
    expect(cores.bgBody).toBe('#0f172a')
    expect(cores.bgBase).toBe('#1e293b')
    expect(cores.bgSurface).toBe('#334155')
    expect(cores.bgElevated).toBe('#475569')
    expect(cores.accent).toBe('#818cf8')
    expect(cores.textPrimary).toBe('#f1f5f9')
    expect(cores.textSecondary).toBe('#94a3b8')
    expect(cores.textMuted).toBe('#64748b')
    expect(cores.success).toBe('#22c55e')
    expect(cores.warning).toBe('#f59e0b')
    expect(cores.danger).toBe('#ef4444')
  })
})

// ─── 3. Hierarquia de Fundos ───────────────────────────────────────────────

describe('Light Theme — hierarquia de fundos', () => {
  it('4 níveis de fundo com luminância crescente', () => {
    const lElevated = luminance(coresLight.bgElevated)
    const lBody = luminance(coresLight.bgBody)
    const lBase = luminance(coresLight.bgBase)
    const lSurface = luminance(coresLight.bgSurface)

    expect(lElevated).toBeLessThan(lBody)
    expect(lBody).toBeLessThan(lBase)
    expect(lBase).toBeLessThan(lSurface)
  })

  it('fundos são distinguíveis (delta luminância > 0.02 entre níveis)', () => {
    const lElevated = luminance(coresLight.bgElevated)
    const lBody = luminance(coresLight.bgBody)
    const lBase = luminance(coresLight.bgBase)
    const lSurface = luminance(coresLight.bgSurface)

    expect(lBody - lElevated).toBeGreaterThan(0.02)
    expect(lBase - lBody).toBeGreaterThan(0.02)
    expect(lSurface - lBase).toBeGreaterThan(0.02)
  })
})

// ─── 4. WCAG 2.1 AA — Texto ───────────────────────────────────────────────

describe('Light Theme — WCAG AA contraste de texto (≥ 4.5:1)', () => {
  const backgrounds = [
    { name: 'bgBody', hex: coresLight.bgBody },
    { name: 'bgBase', hex: coresLight.bgBase },
    { name: 'bgSurface', hex: coresLight.bgSurface },
    { name: 'bgElevated', hex: coresLight.bgElevated },
  ]

  const textos = [
    { name: 'textPrimary', hex: coresLight.textPrimary },
    { name: 'textSecondary', hex: coresLight.textSecondary },
    { name: 'textMuted', hex: coresLight.textMuted },
  ]

  for (const texto of textos) {
    for (const bg of backgrounds) {
      it(`${texto.name} (${texto.hex}) em ${bg.name} (${bg.hex}) ≥ 4.5:1`, () => {
        const ratio = contrastRatio(texto.hex, bg.hex)
        expect(ratio, `${texto.name} em ${bg.name}: ${ratio.toFixed(1)}:1`).toBeGreaterThanOrEqual(4.5)
      })
    }
  }
})

// ─── 5. WCAG 2.1 AA — Cores UI (≥ 3:1) ────────────────────────────────────

describe('Light Theme — WCAG AA contraste UI (≥ 3:1)', () => {
  const backgrounds = [
    { name: 'bgBody', hex: coresLight.bgBody },
    { name: 'bgBase', hex: coresLight.bgBase },
    { name: 'bgSurface', hex: coresLight.bgSurface },
  ]

  const uiColors = [
    { name: 'accent', hex: coresLight.accent },
    { name: 'success', hex: coresLight.success },
    { name: 'warning', hex: coresLight.warning },
    { name: 'danger', hex: coresLight.danger },
  ]

  for (const ui of uiColors) {
    for (const bg of backgrounds) {
      it(`${ui.name} (${ui.hex}) em ${bg.name} (${bg.hex}) ≥ 3:1`, () => {
        const ratio = contrastRatio(ui.hex, bg.hex)
        expect(ratio, `${ui.name} em ${bg.name}: ${ratio.toFixed(1)}:1`).toBeGreaterThanOrEqual(3.0)
      })
    }
  }
})

// ─── 6. WCAG AA — Texto em Botão (branco sobre accent/status) ──────────────

describe('Light Theme — WCAG AA texto em botões (≥ 4.5:1)', () => {
  const buttonBgs = [
    { name: 'accent', hex: coresLight.accent },
    { name: 'danger', hex: coresLight.danger },
  ]

  for (const btn of buttonBgs) {
    it(`branco (#ffffff) em ${btn.name} (${btn.hex}) ≥ 4.5:1`, () => {
      const ratio = contrastRatio('#ffffff', btn.hex)
      expect(ratio, `branco em ${btn.name}: ${ratio.toFixed(1)}:1`).toBeGreaterThanOrEqual(4.5)
    })
  }
})

// ─── 7. Coerência com paleta Slate ─────────────────────────────────────────

describe('Light Theme — coerência com família Slate', () => {
  it('todos os fundos pertencem à escala Slate (Tailwind)', () => {
    const slateScale = ['#f8fafc', '#f1f5f9', '#e2e8f0', '#cbd5e1', '#94a3b8', '#64748b', '#475569', '#334155', '#1e293b', '#0f172a']
    expect(slateScale).toContain(coresLight.bgBody)
    expect(slateScale).toContain(coresLight.bgBase)
    expect(slateScale).toContain(coresLight.bgElevated)
  })

  it('todos os textos pertencem à escala Slate', () => {
    const slateScale = ['#f8fafc', '#f1f5f9', '#e2e8f0', '#cbd5e1', '#94a3b8', '#64748b', '#475569', '#334155', '#1e293b', '#0f172a']
    expect(slateScale).toContain(coresLight.textPrimary)
    expect(slateScale).toContain(coresLight.textSecondary)
    expect(slateScale).toContain(coresLight.textMuted)
  })

  it('accent pertence à família Indigo (Tailwind)', () => {
    const indigoScale = ['#eef2ff', '#e0e7ff', '#c7d2fe', '#a5b4fc', '#818cf8', '#6366f1', '#4f46e5', '#4338ca', '#3730a3', '#312e81']
    expect(indigoScale).toContain(coresLight.accent)
    expect(indigoScale).toContain(coresLight.accentHover)
    expect(indigoScale).toContain(coresLight.accentDim)
    expect(indigoScale).toContain(coresLight.accentSoft)
    expect(indigoScale).toContain(coresLight.borderAccent)
  })
})
