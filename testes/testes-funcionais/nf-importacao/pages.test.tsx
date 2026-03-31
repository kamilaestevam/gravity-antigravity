/**
 * pages.test.tsx — Batch tests for all remaining page components
 */
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'

// Direct imports of page components
import NfLista from '../../../produto/nf-importacao/client/src/pages/NfLista/NfLista'
import NfNovaDuimp from '../../../produto/nf-importacao/client/src/pages/NfNovaDuimp/NfNovaDuimp'
import NfNovaDespesas from '../../../produto/nf-importacao/client/src/pages/NfNovaDespesas/NfNovaDespesas'
import NfNovaRateio from '../../../produto/nf-importacao/client/src/pages/NfNovaRateio/NfNovaRateio'
import NfNovaFiscal from '../../../produto/nf-importacao/client/src/pages/NfNovaFiscal/NfNovaFiscal'
import NfNovaExportacao from '../../../produto/nf-importacao/client/src/pages/NfNovaExportacao/NfNovaExportacao'
import DespesaCatalogo from '../../../produto/nf-importacao/client/src/pages/Config/DespesaCatalogo/DespesaCatalogo'
import DespesaTemplate from '../../../produto/nf-importacao/client/src/pages/Config/DespesaTemplate/DespesaTemplate'
import ExportLayout from '../../../produto/nf-importacao/client/src/pages/Config/ExportLayout/ExportLayout'
import FavoritosFiscais from '../../../produto/nf-importacao/client/src/pages/Config/FavoritosFiscais/FavoritosFiscais'

function renderPage(Component: React.ComponentType) {
  return render(
    <MemoryRouter>
      <Component />
    </MemoryRouter>,
  )
}

// ── NfLista ───────────────────────────────────────────────────────────────────

describe('NfLista', () => {
  it('renders the page title "Notas Fiscais"', () => {
    renderPage(NfLista)
    expect(screen.getByText('Notas Fiscais')).toBeInTheDocument()
  })

  it('renders the subtitle', () => {
    renderPage(NfLista)
    expect(screen.getByText('Lista de notas fiscais de importacao')).toBeInTheDocument()
  })

  it('renders inside PaginaGlobal wrapper', () => {
    renderPage(NfLista)
    expect(screen.getByTestId('pagina-global')).toBeInTheDocument()
  })

  it('shows "Em desenvolvimento" placeholder', () => {
    renderPage(NfLista)
    expect(screen.getByText('Em desenvolvimento')).toBeInTheDocument()
  })

  it('renders FileText icon', () => {
    renderPage(NfLista)
    const icons = screen.getAllByTestId('icon-FileText')
    expect(icons.length).toBeGreaterThanOrEqual(1)
  })
})

// ── NfNovaDuimp ──────────────────────────────────────────────────────────────

describe('NfNovaDuimp', () => {
  it('renders the page title "Dados da DUIMP"', () => {
    renderPage(NfNovaDuimp)
    expect(screen.getByText('Dados da DUIMP')).toBeInTheDocument()
  })

  it('renders the subtitle "Revise os dados importados"', () => {
    renderPage(NfNovaDuimp)
    expect(screen.getByText('Revise os dados importados')).toBeInTheDocument()
  })

  it('renders inside PaginaGlobal', () => {
    renderPage(NfNovaDuimp)
    expect(screen.getByTestId('pagina-global')).toBeInTheDocument()
  })

  it('shows "Em desenvolvimento" placeholder', () => {
    renderPage(NfNovaDuimp)
    expect(screen.getByText('Em desenvolvimento')).toBeInTheDocument()
  })
})

// ── NfNovaDespesas ───────────────────────────────────────────────────────────

describe('NfNovaDespesas', () => {
  it('renders the page title "Despesas"', () => {
    renderPage(NfNovaDespesas)
    expect(screen.getByText('Despesas')).toBeInTheDocument()
  })

  it('renders the subtitle "Adicione despesas operacionais"', () => {
    renderPage(NfNovaDespesas)
    expect(screen.getByText('Adicione despesas operacionais')).toBeInTheDocument()
  })

  it('renders inside PaginaGlobal', () => {
    renderPage(NfNovaDespesas)
    expect(screen.getByTestId('pagina-global')).toBeInTheDocument()
  })

  it('renders CurrencyDollar icon', () => {
    renderPage(NfNovaDespesas)
    const icons = screen.getAllByTestId('icon-CurrencyDollar')
    expect(icons.length).toBeGreaterThanOrEqual(1)
  })

  it('shows "Em desenvolvimento" placeholder', () => {
    renderPage(NfNovaDespesas)
    expect(screen.getByText('Em desenvolvimento')).toBeInTheDocument()
  })
})

// ── NfNovaRateio ─────────────────────────────────────────────────────────────

describe('NfNovaRateio', () => {
  it('renders the page title "Rateio"', () => {
    renderPage(NfNovaRateio)
    expect(screen.getByText('Rateio')).toBeInTheDocument()
  })

  it('renders the subtitle "Configure o rateio das despesas por item"', () => {
    renderPage(NfNovaRateio)
    expect(screen.getByText('Configure o rateio das despesas por item')).toBeInTheDocument()
  })

  it('renders inside PaginaGlobal', () => {
    renderPage(NfNovaRateio)
    expect(screen.getByTestId('pagina-global')).toBeInTheDocument()
  })

  it('renders ChartPieSlice icon', () => {
    renderPage(NfNovaRateio)
    const icons = screen.getAllByTestId('icon-ChartPieSlice')
    expect(icons.length).toBeGreaterThanOrEqual(1)
  })

  it('shows "Em desenvolvimento" placeholder', () => {
    renderPage(NfNovaRateio)
    expect(screen.getByText('Em desenvolvimento')).toBeInTheDocument()
  })
})

// ── NfNovaFiscal ─────────────────────────────────────────────────────────────

describe('NfNovaFiscal', () => {
  it('renders the page title "Classificacao Fiscal"', () => {
    renderPage(NfNovaFiscal)
    expect(screen.getByText('Classificacao Fiscal')).toBeInTheDocument()
  })

  it('renders the subtitle "Preencha CFOP e CSTs por item"', () => {
    renderPage(NfNovaFiscal)
    expect(screen.getByText('Preencha CFOP e CSTs por item')).toBeInTheDocument()
  })

  it('renders inside PaginaGlobal', () => {
    renderPage(NfNovaFiscal)
    expect(screen.getByTestId('pagina-global')).toBeInTheDocument()
  })

  it('renders Scales icon', () => {
    renderPage(NfNovaFiscal)
    const icons = screen.getAllByTestId('icon-Scales')
    expect(icons.length).toBeGreaterThanOrEqual(1)
  })

  it('shows "Em desenvolvimento" placeholder', () => {
    renderPage(NfNovaFiscal)
    expect(screen.getByText('Em desenvolvimento')).toBeInTheDocument()
  })
})

// ── NfNovaExportacao ─────────────────────────────────────────────────────────

describe('NfNovaExportacao', () => {
  it('renders the page title "Exportacao"', () => {
    renderPage(NfNovaExportacao)
    expect(screen.getByText('Exportacao')).toBeInTheDocument()
  })

  it('renders the subtitle "Revise e exporte a nota fiscal"', () => {
    renderPage(NfNovaExportacao)
    expect(screen.getByText('Revise e exporte a nota fiscal')).toBeInTheDocument()
  })

  it('renders inside PaginaGlobal', () => {
    renderPage(NfNovaExportacao)
    expect(screen.getByTestId('pagina-global')).toBeInTheDocument()
  })

  it('renders DownloadSimple icon', () => {
    renderPage(NfNovaExportacao)
    const icons = screen.getAllByTestId('icon-DownloadSimple')
    expect(icons.length).toBeGreaterThanOrEqual(1)
  })

  it('shows "Em desenvolvimento" placeholder', () => {
    renderPage(NfNovaExportacao)
    expect(screen.getByText('Em desenvolvimento')).toBeInTheDocument()
  })
})

// ── DespesaCatalogo ──────────────────────────────────────────────────────────

describe('DespesaCatalogo', () => {
  it('renders the page title "Catalogo de Despesas"', () => {
    renderPage(DespesaCatalogo)
    expect(screen.getByText('Catalogo de Despesas')).toBeInTheDocument()
  })

  it('renders the subtitle "Gerencie o catalogo de despesas da empresa"', () => {
    renderPage(DespesaCatalogo)
    expect(screen.getByText('Gerencie o catalogo de despesas da empresa')).toBeInTheDocument()
  })

  it('renders inside PaginaGlobal', () => {
    renderPage(DespesaCatalogo)
    expect(screen.getByTestId('pagina-global')).toBeInTheDocument()
  })

  it('renders Package icon', () => {
    renderPage(DespesaCatalogo)
    const icons = screen.getAllByTestId('icon-Package')
    expect(icons.length).toBeGreaterThanOrEqual(1)
  })

  it('shows "Em desenvolvimento" placeholder', () => {
    renderPage(DespesaCatalogo)
    expect(screen.getByText('Em desenvolvimento')).toBeInTheDocument()
  })
})

// ── DespesaTemplate ──────────────────────────────────────────────────────────

describe('DespesaTemplate', () => {
  it('renders the page title "Templates de Despesas"', () => {
    renderPage(DespesaTemplate)
    expect(screen.getByText('Templates de Despesas')).toBeInTheDocument()
  })

  it('renders the subtitle "Configure templates de despesas automaticas"', () => {
    renderPage(DespesaTemplate)
    expect(screen.getByText('Configure templates de despesas automaticas')).toBeInTheDocument()
  })

  it('renders inside PaginaGlobal', () => {
    renderPage(DespesaTemplate)
    expect(screen.getByTestId('pagina-global')).toBeInTheDocument()
  })

  it('renders Copy icon', () => {
    renderPage(DespesaTemplate)
    const icons = screen.getAllByTestId('icon-Copy')
    expect(icons.length).toBeGreaterThanOrEqual(1)
  })

  it('shows "Em desenvolvimento" placeholder', () => {
    renderPage(DespesaTemplate)
    expect(screen.getByText('Em desenvolvimento')).toBeInTheDocument()
  })
})

// ── ExportLayout ─────────────────────────────────────────────────────────────

describe('ExportLayout', () => {
  it('renders the page title "Layouts de Exportacao"', () => {
    renderPage(ExportLayout)
    expect(screen.getByText('Layouts de Exportacao')).toBeInTheDocument()
  })

  it('renders the subtitle "Configure o formato de saida para seu ERP"', () => {
    renderPage(ExportLayout)
    expect(screen.getByText('Configure o formato de saida para seu ERP')).toBeInTheDocument()
  })

  it('renders inside PaginaGlobal', () => {
    renderPage(ExportLayout)
    expect(screen.getByTestId('pagina-global')).toBeInTheDocument()
  })

  it('renders Columns icon', () => {
    renderPage(ExportLayout)
    const icons = screen.getAllByTestId('icon-Columns')
    expect(icons.length).toBeGreaterThanOrEqual(1)
  })

  it('shows "Em desenvolvimento" placeholder', () => {
    renderPage(ExportLayout)
    expect(screen.getByText('Em desenvolvimento')).toBeInTheDocument()
  })
})

// ── FavoritosFiscais ─────────────────────────────────────────────────────────

describe('FavoritosFiscais', () => {
  it('renders the page title "Favoritos Fiscais"', () => {
    renderPage(FavoritosFiscais)
    expect(screen.getByText('Favoritos Fiscais')).toBeInTheDocument()
  })

  it('renders the subtitle "Presets de CFOP e CSTs por NCM"', () => {
    renderPage(FavoritosFiscais)
    expect(screen.getByText('Presets de CFOP e CSTs por NCM')).toBeInTheDocument()
  })

  it('renders inside PaginaGlobal', () => {
    renderPage(FavoritosFiscais)
    expect(screen.getByTestId('pagina-global')).toBeInTheDocument()
  })

  it('renders Star icon', () => {
    renderPage(FavoritosFiscais)
    const icons = screen.getAllByTestId('icon-Star')
    expect(icons.length).toBeGreaterThanOrEqual(1)
  })

  it('shows "Em desenvolvimento" placeholder', () => {
    renderPage(FavoritosFiscais)
    expect(screen.getByText('Em desenvolvimento')).toBeInTheDocument()
  })
})
