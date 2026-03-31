/**
 * App.test.tsx — Testes funcionais de routing e PRODUCT_CONFIG
 */
import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { App, PRODUCT_CONFIG } from '../../../produto/nf-importacao/client/src/App'

// Helper to render App at a given route
function renderApp(initialEntry: string) {
  return render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <App />
    </MemoryRouter>,
  )
}

// ── PRODUCT_CONFIG tests ──────────────────────────────────────────────────────

describe('PRODUCT_CONFIG', () => {
  it('has id "nf-importacao"', () => {
    expect(PRODUCT_CONFIG.id).toBe('nf-importacao')
  })

  it('has productId "nf-importacao"', () => {
    expect(PRODUCT_CONFIG.productId).toBe('nf-importacao')
  })

  it('has name "NF Importacao"', () => {
    expect(PRODUCT_CONFIG.name).toBe('NF Importacao')
  })

  it('has port 8028', () => {
    expect(PRODUCT_CONFIG.port).toBe(8028)
  })

  it('includes historico in tenantServices', () => {
    expect(PRODUCT_CONFIG.tenantServices).toContain('historico')
  })

  it('includes notificacoes in tenantServices', () => {
    expect(PRODUCT_CONFIG.tenantServices).toContain('notificacoes')
  })

  it('includes email in tenantServices', () => {
    expect(PRODUCT_CONFIG.tenantServices).toContain('email')
  })

  it('includes dashboard in tenantServices', () => {
    expect(PRODUCT_CONFIG.tenantServices).toContain('dashboard')
  })

  it('includes api-cockpit in tenantServices', () => {
    expect(PRODUCT_CONFIG.tenantServices).toContain('api-cockpit')
  })

  it('includes conector-erp in tenantServices', () => {
    expect(PRODUCT_CONFIG.tenantServices).toContain('conector-erp')
  })

  it('has 6 tenant services total', () => {
    expect(PRODUCT_CONFIG.tenantServices).toHaveLength(6)
  })

  it('includes rateio-engine in productServices', () => {
    expect(PRODUCT_CONFIG.productServices).toContain('rateio-engine')
  })

  it('includes export-engine in productServices', () => {
    expect(PRODUCT_CONFIG.productServices).toContain('export-engine')
  })

  it('includes smart-read in productServices', () => {
    expect(PRODUCT_CONFIG.productServices).toContain('smart-read')
  })

  it('has 4 product services total', () => {
    expect(PRODUCT_CONFIG.productServices).toHaveLength(4)
  })

  it('has 8 navigation items', () => {
    expect(PRODUCT_CONFIG.navigation).toHaveLength(8)
  })

  it('has navigation items with correct sources', () => {
    const productItems = PRODUCT_CONFIG.navigation.filter(n => n.source === 'product')
    const tenantItems = PRODUCT_CONFIG.navigation.filter(n => n.source === 'tenant')
    expect(productItems).toHaveLength(6)
    expect(tenantItems).toHaveLength(2)
  })

  it('has all expected feature flags set to true', () => {
    expect(PRODUCT_CONFIG.features.rateio_multi_metodo).toBe(true)
    expect(PRODUCT_CONFIG.features.export_multi_formato).toBe(true)
    expect(PRODUCT_CONFIG.features.smart_read_duimp).toBe(true)
    expect(PRODUCT_CONFIG.features.catalogo_despesas).toBe(true)
    expect(PRODUCT_CONFIG.features.integracao_processo).toBe(true)
    expect(PRODUCT_CONFIG.features.integracao_erp).toBe(true)
  })
})

// ── Routing tests ─────────────────────────────────────────────────────────────

describe('App routing', () => {
  it('renders the shell layout wrapper', async () => {
    renderApp('/nf-importacao')
    expect(screen.getByTestId('shell-layout')).toBeInTheDocument()
  })

  it('/nf-importacao renders NfLista with title "Notas Fiscais"', async () => {
    renderApp('/nf-importacao')
    await waitFor(() => {
      expect(screen.getByText('Notas Fiscais')).toBeInTheDocument()
    })
  })

  it('/nf-importacao/nova renders NfNovaOrigem with title "Nova NF Importacao"', async () => {
    renderApp('/nf-importacao/nova')
    await waitFor(() => {
      expect(screen.getByText('Nova NF Importacao')).toBeInTheDocument()
    })
  })

  it('/nf-importacao/nova/duimp renders NfNovaDuimp with title "Dados da DUIMP"', async () => {
    renderApp('/nf-importacao/nova/duimp')
    await waitFor(() => {
      expect(screen.getByText('Dados da DUIMP')).toBeInTheDocument()
    })
  })

  it('/nf-importacao/nova/despesas renders NfNovaDespesas with title "Despesas"', async () => {
    renderApp('/nf-importacao/nova/despesas')
    await waitFor(() => {
      expect(screen.getByText('Despesas')).toBeInTheDocument()
    })
  })

  it('/nf-importacao/nova/rateio renders NfNovaRateio with title "Rateio"', async () => {
    renderApp('/nf-importacao/nova/rateio')
    await waitFor(() => {
      expect(screen.getByText('Rateio')).toBeInTheDocument()
    })
  })

  it('/nf-importacao/nova/fiscal renders NfNovaFiscal with title "Classificacao Fiscal"', async () => {
    renderApp('/nf-importacao/nova/fiscal')
    await waitFor(() => {
      expect(screen.getByText('Classificacao Fiscal')).toBeInTheDocument()
    })
  })

  it('/nf-importacao/nova/exportacao renders NfNovaExportacao with title "Exportacao"', async () => {
    renderApp('/nf-importacao/nova/exportacao')
    await waitFor(() => {
      expect(screen.getByText('Exportacao')).toBeInTheDocument()
    })
  })

  it('/nf-importacao/:id renders NfDetalhe with title "Detalhe da NF"', async () => {
    renderApp('/nf-importacao/abc-123')
    await waitFor(() => {
      expect(screen.getByText('Detalhe da NF')).toBeInTheDocument()
    })
  })

  it('/nf-importacao/config/despesas renders DespesaCatalogo', async () => {
    renderApp('/nf-importacao/config/despesas')
    await waitFor(() => {
      expect(screen.getByText('Catalogo de Despesas')).toBeInTheDocument()
    })
  })

  it('/nf-importacao/config/templates renders DespesaTemplate', async () => {
    renderApp('/nf-importacao/config/templates')
    await waitFor(() => {
      expect(screen.getByText('Templates de Despesas')).toBeInTheDocument()
    })
  })

  it('/nf-importacao/config/layouts renders ExportLayout', async () => {
    renderApp('/nf-importacao/config/layouts')
    await waitFor(() => {
      expect(screen.getByText('Layouts de Exportacao')).toBeInTheDocument()
    })
  })

  it('/nf-importacao/config/favoritos renders FavoritosFiscais', async () => {
    renderApp('/nf-importacao/config/favoritos')
    await waitFor(() => {
      expect(screen.getByText('Favoritos Fiscais')).toBeInTheDocument()
    })
  })

  it('unknown route redirects to /nf-importacao (NfLista)', async () => {
    renderApp('/nf-importacao/unknown-page-xyz')
    // The catch-all should redirect, but since :id route matches, it renders NfDetalhe
    // Let's test truly unknown top-level route
    renderApp('/completely-unknown')
    // The / redirect or catch-all should land on NfLista
    await waitFor(() => {
      expect(screen.getByText('Notas Fiscais')).toBeInTheDocument()
    })
  })
})
