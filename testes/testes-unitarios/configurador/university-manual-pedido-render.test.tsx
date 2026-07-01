/**
 * @vitest-environment jsdom
 */
import { describe, expect, it, afterEach } from 'vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { DocPedidoManual } from '../../../servicos-global/configurador/src/pages/university/manual-pedido-ui'

describe('DocPedidoManual — Pedido', () => {
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

  it('lista capítulos operacionais no sumário após Kanban', () => {
    render(
      <MemoryRouter>
        <DocPedidoManual />
      </MemoryRouter>,
    )

    expect(screen.getByRole('button', { name: 'Novo Pedido e Item' })).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Transferir Pedidos e Itens' })).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Consolidar Pedidos' })).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Edição em Massa' })).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Gerar Documentos' })).toBeTruthy()
  })
})
