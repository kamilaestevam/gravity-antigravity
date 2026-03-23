/**
 * Teste unitário — Navigation.tsx
 *
 * Cobertura:
 * - Redireciona "/" para "/dashboard"
 * - Renderiza placeholder correto por rota (lazy loading)
 * - Exibe fallback 404 para rota desconhecida
 * - Rotas de serviços de tenant presentes e alcançáveis
 * - Rotas de produto e configurador presentes e alcançáveis
 */
import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import React, { Suspense } from 'react'

let Navigation: typeof import('@gravity/shell')['Navigation']

beforeEach(async () => {
  const mod = await import('@gravity/shell')
  Navigation = mod.Navigation
})

/**
 * Helper — monta Navigation dentro de MemoryRouter + Suspense.
 * O Suspense é necessário porque Navigation usa lazy() internamente.
 */
function renderNav(initialPath: string) {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <Suspense fallback={<div>Carregando…</div>}>
        <Navigation />
      </Suspense>
    </MemoryRouter>
  )
}

// ─── Redirect da raiz ────────────────────────────────────────────────────────

describe('Navigation — redirect raiz', () => {
  it('redireciona "/" para "/dashboard" e exibe módulo Dashboard', async () => {
    renderNav('/')
    await waitFor(() => {
      expect(screen.getByText(/dashboard/i)).toBeInTheDocument()
    })
  })
})

// ─── Serviços de tenant (Onda 3) ─────────────────────────────────────────────

const TENANT_ROUTES: [string, RegExp][] = [
  ['/dashboard',    /dashboard/i],
  ['/relatorios',   /relatórios/i],
  ['/email',        /email/i],
  ['/whatsapp',     /whatsapp/i],
  ['/notificacoes', /notificações/i],
  ['/atividades',   /atividades/i],
  ['/cronometro',   /cronômetro/i],
  ['/historico',    /histórico/i],
]

describe('Navigation — rotas de serviços de tenant', () => {
  it.each(TENANT_ROUTES)(
    'rota "%s" renderiza placeholder do módulo correto',
    async (path, labelPattern) => {
      renderNav(path)
      await waitFor(() => {
        expect(screen.getByText(labelPattern)).toBeInTheDocument()
      })
    }
  )
})

// ─── Serviços de produto (Onda 3) ─────────────────────────────────────────────

const PRODUTO_ROUTES: [string, RegExp][] = [
  ['/gabi',         /gabi ia/i],
  ['/helpdesk',     /helpdesk/i],
  ['/conector-erp', /conector erp/i],
]

describe('Navigation — rotas de serviços de produto', () => {
  it.each(PRODUTO_ROUTES)(
    'rota "%s" renderiza placeholder do módulo correto',
    async (path, labelPattern) => {
      renderNav(path)
      await waitFor(() => {
        expect(screen.getByText(labelPattern)).toBeInTheDocument()
      })
    }
  )
})

// ─── Configurador ─────────────────────────────────────────────────────────────

describe('Navigation — rota do configurador', () => {
  it('rota "/configurador" renderiza placeholder de Configurações', async () => {
    renderNav('/configurador')
    await waitFor(() => {
      expect(screen.getByText(/configurações/i)).toBeInTheDocument()
    })
  })
})

// ─── 404 ──────────────────────────────────────────────────────────────────────

describe('Navigation — rota inexistente', () => {
  it('exibe "404" para rota desconhecida', async () => {
    renderNav('/rota-que-nao-existe')
    await waitFor(() => {
      expect(screen.getByText('404')).toBeInTheDocument()
    })
  })

  it('exibe mensagem "Página não encontrada" para rota 404', async () => {
    renderNav('/rota-inexistente')
    await waitFor(() => {
      expect(screen.getByText(/página não encontrada/i)).toBeInTheDocument()
    })
  })
})

// ─── Sub-rotas ────────────────────────────────────────────────────────────────

describe('Navigation — sub-rotas com wildcard', () => {
  it('sub-rota "/dashboard/123" ainda exibe o módulo Dashboard', async () => {
    renderNav('/dashboard/123')
    await waitFor(() => {
      expect(screen.getByText(/dashboard/i)).toBeInTheDocument()
    })
  })

  it('sub-rota "/atividades/detalhe/456" exibe módulo Atividades', async () => {
    renderNav('/atividades/detalhe/456')
    await waitFor(() => {
      expect(screen.getByText(/atividades/i)).toBeInTheDocument()
    })
  })
})
