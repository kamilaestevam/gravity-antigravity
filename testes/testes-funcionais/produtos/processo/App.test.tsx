/**
 * Testes funcionais — App.tsx do Produto Processo
 * Localização: testes/testes-funcionais/produtos/processo/App.test.tsx
 *
 * Ferramentas: Vitest + @testing-library/react
 * Valida: roteamento, redirects, lazy loading, PRODUCT_CONFIG, Layout wrapper
 *
 * Roda com: npx vitest run -c testes/testes-unitarios/produtos/processo/vitest.config.ts
 *
 * NOTA: Os mocks de componentes lazy usam React.createElement em vez de JSX
 * para evitar conflito de versoes do React (monorepo com node_modules separados).
 */

import React from 'react'
import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter, Outlet } from 'react-router-dom'

// ─── Mocks dos componentes lazy-loaded ────────────────────────────────────────
// Usamos React.createElement para garantir que o JSX use a mesma versao do React
// que o vitest.config resolve (produto/processo/client/node_modules/react).

vi.mock('../../../../produto/processo/client/src/pages/ProcessoLayout_2', () => ({
  default: () =>
    React.createElement('div', { 'data-testid': 'processo-layout' },
      React.createElement(Outlet)
    ),
}))

vi.mock('../../../../produto/processo/client/src/pages/workflow/WorkflowPage', () => ({
  default: () =>
    React.createElement('div', { 'data-testid': 'workflow-page' }, 'Workflow Page'),
}))

vi.mock('../../../../produto/processo/client/src/pages/pedidos/PedidosPage', () => ({
  default: () =>
    React.createElement('div', { 'data-testid': 'pedidos-page' }, 'Pedidos Page'),
}))

vi.mock('../../../../produto/processo/client/src/pages/dados-tecnicos/DadosTecnicosPage', () => ({
  default: () =>
    React.createElement('div', { 'data-testid': 'dados-tecnicos-page' }, 'Dados Tecnicos Page'),
}))

vi.mock('../../../../produto/processo/client/src/pages/email/EmailPage', () => ({
  default: () =>
    React.createElement('div', { 'data-testid': 'email-page' }, 'Email Page'),
}))

// ─── Import do componente sob teste ───────────────────────────────────────────

import { App, PRODUCT_CONFIG } from '../../../../produto/processo/client/src/App'

// ─── Helper de renderizacao ───────────────────────────────────────────────────

function renderApp(path = '/') {
  return render(
    React.createElement(MemoryRouter, { initialEntries: [path] },
      React.createElement(App)
    )
  )
}

// ─── Testes ───────────────────────────────────────────────────────────────────

describe('App — Produto Processo', () => {
  // ── Layout & Estrutura ────────────────────────────────────────────────────

  describe('Layout wrapper', () => {
    it('renderiza o shell Layout em volta de todo o conteudo', async () => {
      renderApp('/workflow')

      await waitFor(() => {
        expect(screen.getByTestId('shell-layout')).toBeInTheDocument()
      })
    })

    it('ProcessoLayout envolve as rotas internas', async () => {
      renderApp('/workflow')

      await waitFor(() => {
        expect(screen.getByTestId('processo-layout')).toBeInTheDocument()
      })
    })

    it('ProcessoLayout esta dentro do shell Layout', async () => {
      renderApp('/workflow')

      await waitFor(() => {
        const shellLayout = screen.getByTestId('shell-layout')
        const processoLayout = screen.getByTestId('processo-layout')
        expect(shellLayout).toContainElement(processoLayout)
      })
    })
  })

  // ── Roteamento ────────────────────────────────────────────────────────────

  describe('Roteamento', () => {
    it('rota raiz / redireciona para /workflow', async () => {
      renderApp('/')

      await waitFor(() => {
        expect(screen.getByTestId('workflow-page')).toBeInTheDocument()
      })
    })

    it('/workflow renderiza WorkflowPage', async () => {
      renderApp('/workflow')

      await waitFor(() => {
        expect(screen.getByTestId('workflow-page')).toBeInTheDocument()
        expect(screen.getByText('Workflow Page')).toBeInTheDocument()
      })
    })

    it('/pedidos renderiza PedidosPage', async () => {
      renderApp('/pedidos')

      await waitFor(() => {
        expect(screen.getByTestId('pedidos-page')).toBeInTheDocument()
        expect(screen.getByText('Pedidos Page')).toBeInTheDocument()
      })
    })

    it('/dados-tecnicos renderiza DadosTecnicosPage', async () => {
      renderApp('/dados-tecnicos')

      await waitFor(() => {
        expect(screen.getByTestId('dados-tecnicos-page')).toBeInTheDocument()
        expect(screen.getByText('Dados Tecnicos Page')).toBeInTheDocument()
      })
    })

    it('/email renderiza EmailPage', async () => {
      renderApp('/email')

      await waitFor(() => {
        expect(screen.getByTestId('email-page')).toBeInTheDocument()
        expect(screen.getByText('Email Page')).toBeInTheDocument()
      })
    })

    it('/financeiro renderiza FinanceiroPlaceholder com texto "em desenvolvimento"', async () => {
      renderApp('/financeiro')

      await waitFor(() => {
        expect(screen.getByText(/em desenvolvimento/i)).toBeInTheDocument()
      })
    })

    it('/financeiro renderiza o titulo "Financeiro" no cabecalho', async () => {
      renderApp('/financeiro')

      await waitFor(() => {
        expect(screen.getByTestId('cabecalho-titulo')).toHaveTextContent('Financeiro')
      })
    })

    it('rota desconhecida /xyz redireciona para /workflow (catch-all)', async () => {
      renderApp('/xyz')

      await waitFor(() => {
        expect(screen.getByTestId('workflow-page')).toBeInTheDocument()
      })
    })

    it('rota desconhecida /foo/bar/baz redireciona para /workflow', async () => {
      renderApp('/foo/bar/baz')

      await waitFor(() => {
        expect(screen.getByTestId('workflow-page')).toBeInTheDocument()
      })
    })
  })

  // ── ProcessoLayout em todas as rotas internas ─────────────────────────────

  describe('ProcessoLayout wrapper em rotas internas', () => {
    const rotasInternas = ['/workflow', '/pedidos', '/dados-tecnicos', '/email', '/financeiro']

    rotasInternas.forEach((rota) => {
      it(`ProcessoLayout envolve a rota ${rota}`, async () => {
        renderApp(rota)

        await waitFor(() => {
          expect(screen.getByTestId('processo-layout')).toBeInTheDocument()
        })
      })
    })
  })

  // ── PRODUCT_CONFIG ────────────────────────────────────────────────────────

  describe('PRODUCT_CONFIG', () => {
    it('id e "processo"', () => {
      expect(PRODUCT_CONFIG.id).toBe('processo')
    })

    it('productId e "processo"', () => {
      expect(PRODUCT_CONFIG.productId).toBe('processo')
    })

    it('name e "Processo"', () => {
      expect(PRODUCT_CONFIG.name).toBe('Processo')
    })

    it('port e 8025', () => {
      expect(PRODUCT_CONFIG.port).toBe(8025)
    })

    it('tem 9 tenantServices', () => {
      expect(PRODUCT_CONFIG.tenantServices).toHaveLength(9)
    })

    it('tenantServices contem os servicos esperados', () => {
      const expected = [
        'atividades',
        'dashboard',
        'relatorios',
        'historico',
        'notificacoes',
        'gabi',
        'email',
        'whatsapp',
      ]
      expected.forEach((service) => {
        expect(PRODUCT_CONFIG.tenantServices).toContain(service)
      })
    })

    it('tem 4 productServices', () => {
      expect(PRODUCT_CONFIG.productServices).toHaveLength(4)
    })

    it('productServices contem os servicos esperados', () => {
      const expected = [
        'workflow-engine',
        'follow-up-tracker',
        'documento-manager',
        'custo-estimator',
      ]
      expected.forEach((service) => {
        expect(PRODUCT_CONFIG.productServices).toContain(service)
      })
    })

    it('tem 13 itens de navegacao', () => {
      expect(PRODUCT_CONFIG.navigation).toHaveLength(13)
    })

    it('navegacao tem itens do tipo product e tenant', () => {
      const sources = PRODUCT_CONFIG.navigation.map((item) => item.source)
      expect(sources).toContain('product')
      expect(sources).toContain('tenant')
    })

    it('navegacao tem 11 itens product e 2 itens tenant', () => {
      const productItems = PRODUCT_CONFIG.navigation.filter((item) => item.source === 'product')
      const tenantItems = PRODUCT_CONFIG.navigation.filter((item) => item.source === 'tenant')
      expect(productItems).toHaveLength(11)
      expect(tenantItems).toHaveLength(2)
    })

    it('features tem todas as chaves esperadas', () => {
      const expectedKeys = [
        'workflow_automation',
        'followup_tracking',
        'documento_upload',
        'custo_estimativa',
        'email_integration',
      ]
      expectedKeys.forEach((key) => {
        expect(PRODUCT_CONFIG.features).toHaveProperty(key)
      })
    })

    it('features.workflow_automation e "active"', () => {
      expect(PRODUCT_CONFIG.features.workflow_automation).toBe('active')
    })

    it('features booleanas sao true', () => {
      expect(PRODUCT_CONFIG.features.followup_tracking).toBe(true)
      expect(PRODUCT_CONFIG.features.documento_upload).toBe(true)
      expect(PRODUCT_CONFIG.features.custo_estimativa).toBe(true)
      expect(PRODUCT_CONFIG.features.email_integration).toBe(true)
    })
  })
})
