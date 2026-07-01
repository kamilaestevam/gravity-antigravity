/**
 * @vitest-environment jsdom
 */
import { describe, expect, it } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { DocConfiguradorManual } from '../../../servicos-global/configurador/src/pages/university/manual-configurador-ui'

describe('DocConfiguradorManual — API Cockpit', () => {
  it('abre Tokens pelo sumário sem crash', () => {
    render(
      <MemoryRouter>
        <div data-manual-scroll-root style={{ height: 600, overflowY: 'auto' }}>
          <DocConfiguradorManual paginaSlug="api-cockpit" />
        </div>
      </MemoryRouter>,
    )

    const btnSumario = screen.getAllByRole('button', { name: 'Tokens' })[0]
    fireEvent.click(btnSumario)

    expect(document.getElementById('doc-sec-4')).toBeTruthy()
    expect(screen.getByText('Abrir Novo token')).toBeTruthy()
  })
})
