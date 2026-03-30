/**
 * Testes funcionais — Renomeacao de titulos nos componentes Admin
 *
 * Verifica que:
 *   - ProdutosAdmin.tsx usa titulo "Produtos Gravity"
 *   - LogTestes.tsx usa titulo "Testes"
 *   - AdminLayout.tsx tem botao Voltar ao Hub
 *   - WorkspaceLayout.tsx tem botao Voltar ao Hub
 *   - Shell Header.tsx tem botao Voltar ao Hub
 */

import { describe, it, expect } from 'vitest'
import { readFileSync } from 'fs'
import { join } from 'path'

const ROOT = join(__dirname, '..', '..', '..')

function readFile(relativePath: string): string {
  return readFileSync(join(ROOT, relativePath), 'utf-8')
}

describe('Titulos renomeados nos componentes', () => {
  it('ProdutosAdmin.tsx: titulo = "Produtos Gravity"', () => {
    const content = readFile('servicos-global/configurador/src/pages/admin/ProdutosAdmin.tsx')
    expect(content).toContain('titulo="Produtos Gravity"')
    expect(content).not.toMatch(/titulo="Produtos"[^G]/) // Nao deve ter "Produtos" sozinho como titulo
  })

  it('LogTestes.tsx: titulo = "Testes"', () => {
    const content = readFile('servicos-global/configurador/src/pages/admin/LogTestes.tsx')
    expect(content).toContain('titulo="Testes"')
    expect(content).not.toContain('titulo="Log de Testes"')
  })
})

describe('Botao Voltar ao Hub presente nos layouts', () => {
  it('AdminLayout.tsx: tem botao Voltar com navigate(/hub)', () => {
    const content = readFile('servicos-global/configurador/src/pages/admin/AdminLayout.tsx')
    expect(content).toContain("navigate('/hub')")
    expect(content).toContain('ArrowLeft')
    expect(content).toContain('Hub')
  })

  it('WorkspaceLayout.tsx: tem botao Voltar com navigate(/hub)', () => {
    const content = readFile('servicos-global/configurador/src/pages/workspace/WorkspaceLayout.tsx')
    expect(content).toContain("navigate('/hub')")
    expect(content).toContain('ArrowLeft')
    expect(content).toContain('Hub')
  })

  it('Shell Header.tsx: tem botao Voltar com href /hub', () => {
    const content = readFile('servicos-global/shell/Header.tsx')
    expect(content).toContain("'/hub'")
    expect(content).toContain('ArrowLeft')
    expect(content).toContain('Hub')
  })
})

describe('Cores do botao Voltar respeitam a zona', () => {
  it('AdminLayout: cor verde (#10b981) — tema admin', () => {
    const content = readFile('servicos-global/configurador/src/pages/admin/AdminLayout.tsx')
    expect(content).toContain('#10b981')
  })

  it('WorkspaceLayout: cor roxa (#818cf8) — tema workspace', () => {
    const content = readFile('servicos-global/configurador/src/pages/workspace/WorkspaceLayout.tsx')
    // O botao voltar usa roxo
    const voltarSection = content.slice(content.indexOf('ws-voltar-btn'))
    expect(voltarSection).toContain('#818cf8')
  })

  it('Shell Header: cor roxa (#818cf8) — tema produto', () => {
    const content = readFile('servicos-global/shell/Header.tsx')
    const voltarSection = content.slice(content.indexOf('shell-voltar-btn'))
    expect(voltarSection).toContain('#818cf8')
  })
})
