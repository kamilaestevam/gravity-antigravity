/**
 * NfDetalhe.test.tsx — Testes funcionais da pagina de detalhe com abas
 */
import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import NfDetalhe from '../../../produto/nf-importacao/client/src/pages/NfDetalhe/NfDetalhe'

function renderDetalhe() {
  return render(
    <MemoryRouter>
      <NfDetalhe />
    </MemoryRouter>,
  )
}

const TABS = ['Itens', 'Despesas', 'Rateio', 'Fiscal', 'Exportacao', 'Historico']

describe('NfDetalhe', () => {
  // ── Page structure ──

  it('renders page title "Detalhe da NF"', () => {
    renderDetalhe()
    expect(screen.getByText('Detalhe da NF')).toBeInTheDocument()
  })

  it('renders subtitle "Visualize todos os dados da nota fiscal"', () => {
    renderDetalhe()
    expect(screen.getByText('Visualize todos os dados da nota fiscal')).toBeInTheDocument()
  })

  it('renders inside PaginaGlobal wrapper', () => {
    renderDetalhe()
    expect(screen.getByTestId('pagina-global')).toBeInTheDocument()
  })

  it('renders inside CabecalhoGlobal wrapper', () => {
    renderDetalhe()
    expect(screen.getByTestId('cabecalho-global')).toBeInTheDocument()
  })

  it('uses layout "lista"', () => {
    renderDetalhe()
    expect(screen.getByTestId('pagina-global')).toHaveAttribute('data-layout', 'lista')
  })

  it('renders the FileText icon in header', () => {
    renderDetalhe()
    const icons = screen.getAllByTestId('icon-FileText')
    expect(icons.length).toBeGreaterThanOrEqual(1)
  })

  // ── Tab pills ──

  it('renders exactly 6 tab buttons', () => {
    renderDetalhe()
    const buttons = screen.getAllByRole('button')
    expect(buttons).toHaveLength(6)
  })

  it.each(TABS)('renders the "%s" tab', (tab) => {
    renderDetalhe()
    expect(screen.getByText(tab)).toBeInTheDocument()
  })

  it('default active tab is "Itens"', () => {
    renderDetalhe()
    // The active tab has fontWeight 600
    const itensBtn = screen.getByText('Itens')
    expect(itensBtn.style.fontWeight).toBe('600')
  })

  it('other tabs are not active by default', () => {
    renderDetalhe()
    const despesasBtn = screen.getByText('Despesas')
    expect(despesasBtn.style.fontWeight).toBe('400')
  })

  it('shows "Itens — Em desenvolvimento" content by default', () => {
    renderDetalhe()
    expect(screen.getByText('Itens — Em desenvolvimento')).toBeInTheDocument()
  })

  // ── Tab switching ──

  it('clicking Despesas tab activates it', () => {
    renderDetalhe()
    const despesasBtn = screen.getByText('Despesas')
    fireEvent.click(despesasBtn)
    expect(despesasBtn.style.fontWeight).toBe('600')
  })

  it('clicking Despesas tab deactivates Itens', () => {
    renderDetalhe()
    fireEvent.click(screen.getByText('Despesas'))
    expect(screen.getByText('Itens').style.fontWeight).toBe('400')
  })

  it('clicking Despesas tab updates content text', () => {
    renderDetalhe()
    fireEvent.click(screen.getByText('Despesas'))
    expect(screen.getByText('Despesas — Em desenvolvimento')).toBeInTheDocument()
  })

  it('clicking Rateio tab shows correct content', () => {
    renderDetalhe()
    fireEvent.click(screen.getByText('Rateio'))
    expect(screen.getByText('Rateio — Em desenvolvimento')).toBeInTheDocument()
  })

  it('clicking Fiscal tab shows correct content', () => {
    renderDetalhe()
    fireEvent.click(screen.getByText('Fiscal'))
    expect(screen.getByText('Fiscal — Em desenvolvimento')).toBeInTheDocument()
  })

  it('clicking Exportacao tab shows correct content', () => {
    renderDetalhe()
    fireEvent.click(screen.getByText('Exportacao'))
    expect(screen.getByText('Exportacao — Em desenvolvimento')).toBeInTheDocument()
  })

  it('clicking Historico tab shows correct content', () => {
    renderDetalhe()
    fireEvent.click(screen.getByText('Historico'))
    expect(screen.getByText('Historico — Em desenvolvimento')).toBeInTheDocument()
  })

  it('switching back to Itens tab re-activates it', () => {
    renderDetalhe()
    fireEvent.click(screen.getByText('Fiscal'))
    fireEvent.click(screen.getByText('Itens'))
    expect(screen.getByText('Itens').style.fontWeight).toBe('600')
    expect(screen.getByText('Itens — Em desenvolvimento')).toBeInTheDocument()
  })

  it('only one tab is active at a time', () => {
    renderDetalhe()
    fireEvent.click(screen.getByText('Rateio'))
    const buttons = screen.getAllByRole('button')
    const activeTabs = buttons.filter(b => b.style.fontWeight === '600')
    expect(activeTabs).toHaveLength(1)
    expect(activeTabs[0].textContent).toBe('Rateio')
  })
})
