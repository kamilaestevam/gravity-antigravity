/**
 * Teste unitário — Layout.tsx
 *
 * Cobertura:
 * - Renderiza Sidebar, Header e children dentro do main
 * - Aplica classe sidebar-collapsed quando sidebarOpen = false
 * - Aplica/remove classe light-theme no body conforme currentTheme
 * - Envolve children em Suspense (rendering sem Suspense boundary)
 */
import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import React from 'react'

// Importa após reset — state do zustand é module-level
let Layout: typeof import('@gravity/shell')['Layout']
let useShellStore: typeof import('@gravity/shell')['useShellStore']

beforeEach(async () => {
  const mod = await import('@gravity/shell')
  Layout = mod.Layout
  useShellStore = mod.useShellStore
  useShellStore.setState({
    sidebarOpen: true,
    currentTheme: 'dark',
    currentUser: { id: '', name: '', email: '' },
    notifications: [],
  })
  document.body.className = ''
})

/**
 * Helper — monta o Layout dentro de MemoryRouter (exigido pelo react-router-dom)
 * com uma rota fictícia para evitar erros de contexto.
 */
function renderLayout(children: React.ReactNode = null) {
  return render(
    <MemoryRouter initialEntries={['/dashboard']}>
      <Layout>{children}</Layout>
    </MemoryRouter>
  )
}

// ─── Estrutura básica ────────────────────────────────────────────────────────

describe('Layout — estrutura básica', () => {
  it('renderiza o elemento <header> do Header', () => {
    renderLayout()
    expect(screen.getByRole('banner')).toBeInTheDocument()
  })

  it('renderiza o elemento <aside> da Sidebar', () => {
    renderLayout()
    expect(screen.getByRole('navigation', { name: /menu de navegação/i })).toBeInTheDocument()
  })

  it('renderiza o elemento <main> de conteúdo', () => {
    renderLayout()
    expect(screen.getByRole('main')).toBeInTheDocument()
  })

  it('renderiza children dentro do main', () => {
    renderLayout(<p>Conteúdo de teste</p>)
    expect(screen.getByText('Conteúdo de teste')).toBeInTheDocument()
  })
})

// ─── Collapse da sidebar ─────────────────────────────────────────────────────

describe('Layout — classe de colapso da sidebar', () => {
  it('não aplica sidebar-collapsed quando sidebarOpen = true', () => {
    useShellStore.setState({ sidebarOpen: true })
    const { container } = renderLayout()
    const shellLayout = container.firstChild as HTMLElement
    expect(shellLayout).not.toHaveClass('sidebar-collapsed')
  })

  it('aplica sidebar-collapsed quando sidebarOpen = false', () => {
    useShellStore.setState({ sidebarOpen: false })
    const { container } = renderLayout()
    const shellLayout = container.firstChild as HTMLElement
    expect(shellLayout).toHaveClass('sidebar-collapsed')
  })
})

// ─── Sincronização de tema ───────────────────────────────────────────────────

describe('Layout — sincronização de tema com body', () => {
  it('não adiciona light-theme ao body quando tema é dark', () => {
    useShellStore.setState({ currentTheme: 'dark' })
    renderLayout()
    expect(document.body.classList.contains('light-theme')).toBe(false)
  })

  it('adiciona light-theme ao body quando tema é light', () => {
    useShellStore.setState({ currentTheme: 'light' })
    renderLayout()
    expect(document.body.classList.contains('light-theme')).toBe(true)
  })
})

// ─── Acessibilidade ──────────────────────────────────────────────────────────

describe('Layout — acessibilidade', () => {
  it('main tem aria-label de conteúdo principal', () => {
    renderLayout()
    const main = screen.getByRole('main')
    expect(main).toHaveAttribute('aria-label', 'Conteúdo principal')
  })
})
