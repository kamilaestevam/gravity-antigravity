/**
 * Testes funcionais — Light Theme CSS
 * Localização: testes/testes-funcionais/nucleo-global/light-theme-css.test.ts
 *
 * Ferramentas: Vitest (node)
 * Valida: Os arquivos CSS reais contêm os tokens corretos no body.light-theme,
 *         nenhum branco puro como fundo base, nenhuma cor hardcoded dark sem override,
 *         e consistência entre os 4 arquivos de tokens.
 */

import { describe, it, expect, beforeAll } from 'vitest'
import { readFileSync } from 'fs'
import { resolve } from 'path'

// ─── Carrega os 4 arquivos de tokens ───────────────────────────────────────

const ROOT = resolve(__dirname, '../../..')

const files = {
  tokens: readFileSync(resolve(ROOT, 'nucleo-global/Tokens/tokens.css'), 'utf-8'),
  shell: readFileSync(resolve(ROOT, 'servicos-global/shell/shell.css'), 'utf-8'),
  marketplace: readFileSync(resolve(ROOT, 'servicos-global/marketplace/src/styles/tokens.css'), 'utf-8'),
  workspace: readFileSync(resolve(ROOT, 'servicos-global/configurador/src/pages/workspace/workspace.css'), 'utf-8'),
}

/** Extrai o bloco body.light-theme de um CSS */
function extractLightBlock(css: string): string {
  const blocks: string[] = []
  const regex = /body\.light-theme\s*\{([^}]+)\}/g
  let match: RegExpExecArray | null
  while ((match = regex.exec(css)) !== null) {
    blocks.push(match[1])
  }
  return blocks.join('\n')
}

/** Extrai valor de um token CSS de dentro de um bloco */
function extractToken(block: string, tokenName: string): string | null {
  const regex = new RegExp(`${tokenName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*:\\s*([^;]+);`)
  const match = block.match(regex)
  return match ? match[1].trim() : null
}

// ─── 1. body.light-theme existe em todos os arquivos de tokens ─────────────

describe('Light Theme CSS — blocos existem', () => {
  for (const [name, css] of Object.entries(files)) {
    it(`${name} contém body.light-theme`, () => {
      expect(css).toContain('body.light-theme')
    })
  }
})

// ─── 2. Tokens canônicos (tokens.css) têm valores corretos ────────────────

describe('Light Theme CSS — tokens canônicos (tokens.css)', () => {
  let block: string

  beforeAll(() => {
    block = extractLightBlock(files.tokens)
  })

  const expectedTokens: Record<string, string> = {
    '--bg-body': '#f1f5f9',
    '--bg-base': '#f8fafc',
    '--bg-surface': '#ffffff',
    '--bg-elevated': '#e2e8f0',
    '--accent': '#4f46e5',
    '--accent-hover': '#4338ca',
    '--accent-dim': '#e0e7ff',
    '--accent-soft': '#eef2ff',
    '--text-primary': '#1e293b',
    '--text-secondary': '#334155',
    '--text-muted': '#475569',
    '--success': '#16a34a',
    '--success-soft': '#dcfce7',
    '--warning': '#b45309',
    '--warning-soft': '#fef3c7',
    '--danger': '#dc2626',
    '--danger-soft': '#fee2e2',
    '--border-default': '#cbd5e1',
    '--border-accent': '#a5b4fc',
  }

  for (const [token, expected] of Object.entries(expectedTokens)) {
    it(`${token} = ${expected}`, () => {
      const value = extractToken(block, token)
      expect(value, `${token} deveria ser ${expected}`).toBe(expected)
    })
  }
})

// ─── 3. Regras inegociáveis no CSS ─────────────────────────────────────────

describe('Light Theme CSS — regras inegociáveis', () => {
  it('bg-body NÃO é #ffffff (branco puro)', () => {
    const block = extractLightBlock(files.tokens)
    const bgBody = extractToken(block, '--bg-body')
    expect(bgBody).not.toBe('#ffffff')
  })

  it('bg-base NÃO é #ffffff (branco puro)', () => {
    const block = extractLightBlock(files.tokens)
    const bgBase = extractToken(block, '--bg-base')
    expect(bgBase).not.toBe('#ffffff')
  })

  it('text-primary NÃO é #000000 (preto puro)', () => {
    const block = extractLightBlock(files.tokens)
    const textPrimary = extractToken(block, '--text-primary')
    expect(textPrimary).not.toBe('#000000')
  })

  it('dark mode :root NÃO foi alterado (bg-body ainda é #0f172a)', () => {
    // Verifica que :root tem os valores dark originais
    const rootBlock = files.tokens.match(/:root\s*\{([^}]+)\}/)?.[1] || ''
    const bgBody = extractToken(rootBlock, '--bg-body')
    expect(bgBody).toBe('#0f172a')
  })
})

// ─── 4. Consistência entre arquivos de tokens ──────────────────────────────

describe('Light Theme CSS — consistência entre arquivos', () => {
  it('shell.css tem bg-body-dark = #f1f5f9 (mesmo que tokens.css bg-body)', () => {
    const block = extractLightBlock(files.shell)
    const value = extractToken(block, '--bg-body-dark')
    expect(value).toBe('#f1f5f9')
  })

  it('shell.css tem text-primary = #1e293b', () => {
    const block = extractLightBlock(files.shell)
    expect(extractToken(block, '--text-primary')).toBe('#1e293b')
  })

  it('shell.css tem text-muted = #475569', () => {
    const block = extractLightBlock(files.shell)
    expect(extractToken(block, '--text-muted')).toBe('#475569')
  })

  it('shell.css tem accent = #4f46e5', () => {
    const block = extractLightBlock(files.shell)
    expect(extractToken(block, '--accent')).toBe('#4f46e5')
  })

  it('marketplace tem bg-body-dark = #f1f5f9', () => {
    const block = extractLightBlock(files.marketplace)
    expect(extractToken(block, '--bg-body-dark')).toBe('#f1f5f9')
  })

  it('marketplace tem accent = #4f46e5', () => {
    const block = extractLightBlock(files.marketplace)
    expect(extractToken(block, '--accent')).toBe('#4f46e5')
  })

  it('workspace tem ws-bg-body = #f1f5f9', () => {
    const block = extractLightBlock(files.workspace)
    expect(extractToken(block, '--ws-bg-body')).toBe('#f1f5f9')
  })

  it('workspace tem ws-accent = #4f46e5', () => {
    const block = extractLightBlock(files.workspace)
    expect(extractToken(block, '--ws-accent')).toBe('#4f46e5')
  })

  it('workspace tem ws-text = #1e293b', () => {
    const block = extractLightBlock(files.workspace)
    expect(extractToken(block, '--ws-text')).toBe('#1e293b')
  })

  it('workspace tem ws-muted = #475569', () => {
    const block = extractLightBlock(files.workspace)
    expect(extractToken(block, '--ws-muted')).toBe('#475569')
  })
})

// ─── 5. Componentes críticos têm body.light-theme ──────────────────────────

describe('Light Theme CSS — componentes com overrides', () => {
  const componentFiles = [
    { name: 'botao.css', path: 'nucleo-global/Botoes/botao-global/src/botao.css' },
    { name: 'select.css', path: 'nucleo-global/Campos/campo-select-global/src/select.css' },
    { name: 'switch.css', path: 'nucleo-global/Campos/switch-global/src/switch.css' },
    { name: 'tooltip.css', path: 'nucleo-global/Feedback/tooltip-global/src/tooltip.css' },
    { name: 'login-global.css', path: 'nucleo-global/Login/login-global/src/login-global.css' },
    { name: 'card.css', path: 'nucleo-global/Layout/card-global/src/card.css' },
    { name: 'stat-card.css', path: 'nucleo-global/Layout/card-global/src/stat-card.css' },
    { name: 'campo-geral.css', path: 'nucleo-global/Campos/campo-geral-global/src/campo-geral.css' },
    { name: 'tabela.css', path: 'nucleo-global/Tabelas/tabela-global/src/tabela.css' },
    { name: 'menu-lateral.css', path: 'nucleo-global/Layout/menu-lateral-global/src/menu-lateral.css' },
    { name: 'usuario-global.css', path: 'nucleo-global/Layout/usuario-global/src/usuario-global.css' },
    { name: 'calendario.css', path: 'nucleo-global/Campos/campo-calendario-global/src/calendario.css' },
    { name: 'pagina-global.css', path: 'nucleo-global/Layout/pagina-global/src/pagina-global.css' },
  ]

  for (const comp of componentFiles) {
    it(`${comp.name} contém body.light-theme`, () => {
      const css = readFileSync(resolve(ROOT, comp.path), 'utf-8')
      expect(css, `${comp.name} deve ter body.light-theme`).toContain('body.light-theme')
    })
  }
})

// ─── 6. Nenhum branco puro ou preto puro hardcoded em overrides light ──────

describe('Light Theme CSS — sem cores proibidas nos overrides', () => {
  const componentFiles = [
    'nucleo-global/Botoes/botao-global/src/botao.css',
    'nucleo-global/Campos/campo-select-global/src/select.css',
    'nucleo-global/Campos/switch-global/src/switch.css',
    'nucleo-global/Layout/card-global/src/card.css',
    'nucleo-global/Layout/card-global/src/stat-card.css',
    'nucleo-global/Tabelas/tabela-global/src/tabela.css',
    'nucleo-global/Layout/menu-lateral-global/src/menu-lateral.css',
  ]

  for (const filePath of componentFiles) {
    it(`${filePath.split('/').pop()} não usa background: #ffffff direto no light override`, () => {
      const css = readFileSync(resolve(ROOT, filePath), 'utf-8')
      // Extrai apenas os blocos light-theme
      const lightBlocks = extractLightBlock(css)
      // Verifica que não há background: #ffffff direto (sem ser via var())
      const directWhiteBg = /background:\s*#ffffff\s*[;!]/i
      expect(lightBlocks).not.toMatch(directWhiteBg)
    })
  }
})

// ─── 7. Serviços globais com light overrides ───────────────────────────────

describe('Light Theme CSS — serviços globais', () => {
  it('hub-store.css contém body.light-theme', () => {
    const css = readFileSync(resolve(ROOT, 'servicos-global/configurador/src/pages/hub-store.css'), 'utf-8')
    expect(css).toContain('body.light-theme')
  })

  it('atividades.css contém body.light-theme', () => {
    const css = readFileSync(resolve(ROOT, 'servicos-global/tenant/atividades/src/atividades.css'), 'utf-8')
    expect(css).toContain('body.light-theme')
  })

  it('admin.css contém body.light-theme', () => {
    const css = readFileSync(resolve(ROOT, 'servicos-global/configurador/src/pages/admin/admin.css'), 'utf-8')
    expect(css).toContain('body.light-theme')
  })

  it('workspace.css contém light overrides para input/select', () => {
    const css = readFileSync(resolve(ROOT, 'servicos-global/configurador/src/pages/workspace/workspace.css'), 'utf-8')
    expect(css).toContain('body.light-theme .ws-field input')
  })
})

// ─── 8. pagina-global.css tem fallback correto (não #0f172a) ───────────────

describe('Light Theme CSS — bugfix pg-contexto-row', () => {
  it('pg-contexto-row light override NÃO aponta para #0f172a', () => {
    const css = readFileSync(resolve(ROOT, 'nucleo-global/Layout/pagina-global/src/pagina-global.css'), 'utf-8')
    const lightBlock = extractLightBlock(css)
    expect(lightBlock).not.toContain('#0f172a')
  })
})
