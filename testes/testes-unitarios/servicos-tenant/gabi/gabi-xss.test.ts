// @vitest-environment node

/**
 * Testes unitários — Gabi XSS Protection (escapeHtml)
 * Localização: testes/testes-unitarios/servicos-tenant/gabi/gabi-xss.test.ts
 *
 * Verifica que a função escapeHtml impede injeção de HTML/JS malicioso
 * no componente Gabi (chat assistant).
 */

import { describe, it, expect } from 'vitest'

// Reimplementa escapeHtml de Gabi.tsx para teste isolado (a função original
// é declarada como const local no módulo React e não é exportada).
// A lógica DEVE ser idêntica à de servicos-global/tenant/gabi/src/Gabi.tsx.
const escapeHtml = (str: string) =>
  str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

// ─── 1. Script tags ─────────────────────────────────────────────────────────────

describe('escapeHtml — XSS via script tags', () => {
  it('escapa <script>alert("xss")</script>', () => {
    const input = '<script>alert("xss")</script>'
    const result = escapeHtml(input)

    expect(result).not.toContain('<script>')
    expect(result).not.toContain('</script>')
    expect(result).toContain('&lt;script&gt;')
    expect(result).toContain('&lt;/script&gt;')
  })

  it('escapa script tags com atributos', () => {
    const input = '<script src="https://evil.com/steal.js"></script>'
    const result = escapeHtml(input)

    expect(result).not.toContain('<script')
    expect(result).toContain('&lt;script')
  })

  it('escapa nested script payloads', () => {
    const input = '<<script>script>alert("xss")<</script>/script>'
    const result = escapeHtml(input)

    expect(result).not.toContain('<script>')
  })
})

// ─── 2. Event handlers (onerror, onclick, etc.) ─────────────────────────────────

describe('escapeHtml — XSS via event handlers', () => {
  it('escapa <img onerror="alert(\'xss\')" src=x>', () => {
    const input = '<img onerror="alert(\'xss\')" src=x>'
    const result = escapeHtml(input)

    expect(result).not.toContain('<img')
    // After escaping, onerror= is still present as text but harmless
    // because the surrounding < and > are escaped, so no HTML tag is created.
    expect(result).toContain('&lt;img')
    expect(result).toContain('&quot;')
  })

  it('escapa <div onmouseover="alert(1)">', () => {
    const input = '<div onmouseover="alert(1)">'
    const result = escapeHtml(input)

    expect(result).not.toContain('<div')
    expect(result).toContain('&lt;div')
  })

  it('escapa <body onload="alert(1)">', () => {
    const input = '<body onload="alert(1)">'
    const result = escapeHtml(input)

    expect(result).not.toContain('<body')
    expect(result).toContain('&lt;body')
  })
})

// ─── 3. Anchor / javascript: protocol ───────────────────────────────────────────

describe('escapeHtml — XSS via anchor tags and javascript: protocol', () => {
  it('escapa <a href="javascript:alert(\'xss\')">click</a>', () => {
    const input = '<a href="javascript:alert(\'xss\')">click</a>'
    const result = escapeHtml(input)

    expect(result).not.toContain('<a ')
    expect(result).not.toContain('</a>')
    expect(result).toContain('&lt;a')
  })

  it('escapa <iframe src="javascript:alert(1)">', () => {
    const input = '<iframe src="javascript:alert(1)"></iframe>'
    const result = escapeHtml(input)

    expect(result).not.toContain('<iframe')
    expect(result).toContain('&lt;iframe')
  })
})

// ─── 4. Double-quote and ampersand escaping ──────────────────────────────────────

describe('escapeHtml — entity escaping correctness', () => {
  it('escapa aspas duplas para &quot;', () => {
    const input = 'He said "hello"'
    const result = escapeHtml(input)

    expect(result).toBe('He said &quot;hello&quot;')
  })

  it('escapa ampersand para &amp;', () => {
    const input = 'Tom & Jerry'
    const result = escapeHtml(input)

    expect(result).toBe('Tom &amp; Jerry')
  })

  it('preserva texto normal sem alteração', () => {
    const input = 'Texto simples sem caracteres especiais'
    const result = escapeHtml(input)

    expect(result).toBe(input)
  })

  it('escapa combinação de todos os caracteres perigosos', () => {
    const input = '<div class="xss">&</div>'
    const result = escapeHtml(input)

    expect(result).toBe('&lt;div class=&quot;xss&quot;&gt;&amp;&lt;/div&gt;')
  })
})
