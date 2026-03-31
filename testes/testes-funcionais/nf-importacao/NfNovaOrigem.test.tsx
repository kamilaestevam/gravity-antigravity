/**
 * NfNovaOrigem.test.tsx — Testes funcionais da pagina de origem (6 canais)
 */
import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import NfNovaOrigem from '../../../produto/nf-importacao/client/src/pages/NfNovaOrigem/NfNovaOrigem'

function renderOrigem() {
  return render(
    <MemoryRouter>
      <NfNovaOrigem />
    </MemoryRouter>,
  )
}

describe('NfNovaOrigem', () => {
  // ── Page structure ──

  it('renders the page title "Nova NF Importacao"', () => {
    renderOrigem()
    expect(screen.getByText('Nova NF Importacao')).toBeInTheDocument()
  })

  it('renders the subtitle "Selecione a origem dos dados"', () => {
    renderOrigem()
    expect(screen.getByText('Selecione a origem dos dados')).toBeInTheDocument()
  })

  it('renders inside PaginaGlobal wrapper', () => {
    renderOrigem()
    expect(screen.getByTestId('pagina-global')).toBeInTheDocument()
  })

  it('renders inside CabecalhoGlobal wrapper', () => {
    renderOrigem()
    expect(screen.getByTestId('cabecalho-global')).toBeInTheDocument()
  })

  it('uses layout "lista"', () => {
    renderOrigem()
    expect(screen.getByTestId('pagina-global')).toHaveAttribute('data-layout', 'lista')
  })

  // ── 6 channel cards ──

  it('renders exactly 6 channel cards as buttons', () => {
    renderOrigem()
    const buttons = screen.getAllByRole('button')
    expect(buttons).toHaveLength(6)
  })

  it('renders the XML card', () => {
    renderOrigem()
    expect(screen.getByText('XML')).toBeInTheDocument()
  })

  it('renders the XML card description', () => {
    renderOrigem()
    expect(screen.getByText('Importar XML da nota fiscal eletronica')).toBeInTheDocument()
  })

  it('renders the PDF (Smart Read) card', () => {
    renderOrigem()
    expect(screen.getByText('PDF (Smart Read)')).toBeInTheDocument()
  })

  it('renders the PDF card description', () => {
    renderOrigem()
    expect(screen.getByText('Extrair dados automaticamente de um PDF')).toBeInTheDocument()
  })

  it('renders the Portal Unico card', () => {
    renderOrigem()
    expect(screen.getByText('Portal Unico')).toBeInTheDocument()
  })

  it('renders the Portal Unico card description', () => {
    renderOrigem()
    expect(screen.getByText('Importar dados direto do Portal Unico Siscomex')).toBeInTheDocument()
  })

  it('renders the Processo Gravity card', () => {
    renderOrigem()
    expect(screen.getByText('Processo Gravity')).toBeInTheDocument()
  })

  it('renders the Processo card description', () => {
    renderOrigem()
    expect(screen.getByText('Vincular a um processo existente no Gravity')).toBeInTheDocument()
  })

  it('renders the ERP / API card', () => {
    renderOrigem()
    expect(screen.getByText('ERP / API')).toBeInTheDocument()
  })

  it('renders the ERP card description', () => {
    renderOrigem()
    expect(screen.getByText('Receber dados via integracao com seu ERP')).toBeInTheDocument()
  })

  it('renders the Manual card', () => {
    renderOrigem()
    expect(screen.getByText('Manual')).toBeInTheDocument()
  })

  it('renders the Manual card description', () => {
    renderOrigem()
    expect(screen.getByText('Preencher todos os campos manualmente')).toBeInTheDocument()
  })

  // ── Card interactivity ──

  it('each card is a button with type="button"', () => {
    renderOrigem()
    const buttons = screen.getAllByRole('button')
    buttons.forEach((btn) => {
      expect(btn).toHaveAttribute('type', 'button')
    })
  })

  it('each card has cursor: pointer style', () => {
    renderOrigem()
    const buttons = screen.getAllByRole('button')
    buttons.forEach((btn) => {
      expect(btn.style.cursor).toBe('pointer')
    })
  })

  it('cards are clickable without throwing errors', () => {
    renderOrigem()
    const buttons = screen.getAllByRole('button')
    buttons.forEach((btn) => {
      expect(() => fireEvent.click(btn)).not.toThrow()
    })
  })

  // ── Icons ──

  it('renders the Plus icon in the header', () => {
    renderOrigem()
    expect(screen.getByTestId('icon-Plus')).toBeInTheDocument()
  })

  it('renders the FileCode icon for XML card', () => {
    renderOrigem()
    expect(screen.getByTestId('icon-FileCode')).toBeInTheDocument()
  })

  it('renders the FileSearch icon for PDF card', () => {
    renderOrigem()
    expect(screen.getByTestId('icon-FileSearch')).toBeInTheDocument()
  })

  it('renders the Globe icon for Portal Unico card', () => {
    renderOrigem()
    expect(screen.getByTestId('icon-Globe')).toBeInTheDocument()
  })

  it('renders the Link icon for Processo card', () => {
    renderOrigem()
    expect(screen.getByTestId('icon-Link')).toBeInTheDocument()
  })

  it('renders the Database icon for ERP card', () => {
    renderOrigem()
    expect(screen.getByTestId('icon-Database')).toBeInTheDocument()
  })

  it('renders at least one PencilLine icon for Manual card', () => {
    renderOrigem()
    const pencilIcons = screen.getAllByTestId('icon-PencilLine')
    expect(pencilIcons.length).toBeGreaterThanOrEqual(1)
  })
})
