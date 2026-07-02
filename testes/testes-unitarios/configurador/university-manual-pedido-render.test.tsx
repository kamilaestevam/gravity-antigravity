/**
 * @vitest-environment jsdom
 */
import { describe, expect, it, afterEach, beforeEach } from 'vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { DocPedidoManual } from '../../../servicos-global/configurador/src/pages/university/manual-pedido-ui'

describe('DocPedidoManual — Pedido', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  afterEach(() => cleanup())

  it('abre Tipos de visualização pelo sumário sem crash', () => {
    render(
      <MemoryRouter>
        <div data-manual-scroll-root style={{ height: 600, overflowY: 'auto' }}>
          <DocPedidoManual />
        </div>
      </MemoryRouter>,
    )

    const btnSumario = screen.getAllByRole('button', { name: 'Tipos de visualização' })[0]
    fireEvent.click(btnSumario)

    expect(document.getElementById('doc-sec-3')).toBeTruthy()
    expect(screen.getByText(/quatro visualizações/)).toBeTruthy()
  })

  it('mantém subcapítulos contraídos por padrão com controle de expandir', () => {
    render(
      <MemoryRouter>
        <DocPedidoManual />
      </MemoryRouter>,
    )

    const btnExpandir = screen.getByRole('button', { name: /Expandir 17 subcapítulos de Visão Lista/i })
    expect(btnExpandir.getAttribute('aria-expanded')).toBe('false')
    expect(screen.queryByRole('button', { name: 'Novo pedido e item' })).toBeNull()
  })

  it('lista passos operacionais da Visão Lista após expandir subcapítulos', () => {
    render(
      <MemoryRouter>
        <DocPedidoManual />
      </MemoryRouter>,
    )

    fireEvent.click(screen.getByRole('button', { name: /Expandir 17 subcapítulos de Visão Lista/i }))

    expect(screen.getByRole('button', { name: 'Alertas' })).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Filtro das colunas' })).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Novo pedido e item' })).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Transferir' })).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Consolidar' })).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Edição em massa' })).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Gerar documentos' })).toBeTruthy()
  })

  it('marca capítulo como lido e sincroniza sumário + localStorage', () => {
    render(
      <MemoryRouter>
        <DocPedidoManual />
      </MemoryRouter>,
    )

    const btnMarcar = screen.getAllByRole('button', { name: /Marcar Tipos de visualização Pedido como lido/i })[0]!
    fireEvent.click(btnMarcar)

    expect(screen.getAllByRole('button', { name: /Desmarcar Tipos de visualização Pedido/i }).length).toBeGreaterThan(0)
    expect(screen.getByText(/· 1 lidos/i)).toBeTruthy()

    const raw = localStorage.getItem('gravity-university-manual-leitura:pedido')
    expect(raw).toBeTruthy()
    expect(JSON.parse(raw!)).toContain('doc-sec-3')
  })
})
