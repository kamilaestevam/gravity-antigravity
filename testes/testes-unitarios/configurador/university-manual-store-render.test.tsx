/**
 * @vitest-environment jsdom
 */
import { describe, expect, it } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { DocManualUmaSecao } from '../../../servicos-global/configurador/src/pages/university/manual-configurador-ui'
import {
  DOC_STORE_METADADOS,
  DOC_STORE_SECAO,
} from '../../../servicos-global/configurador/src/pages/university/manual-store-conteudo'

describe('DocStoreManual — Gravity Store', () => {
  it('abre Contratar um produto pelo sumário sem crash', () => {
    render(
      <MemoryRouter>
        <div data-manual-scroll-root style={{ height: 600, overflowY: 'auto' }}>
          <DocManualUmaSecao secao={DOC_STORE_SECAO} metadados={DOC_STORE_METADADOS} />
        </div>
      </MemoryRouter>,
    )

    const btnSumario = screen.getAllByRole('button', { name: 'Contratar um produto' })[0]
    fireEvent.click(btnSumario)

    expect(document.getElementById('doc-sec-6')).toBeTruthy()
    expect(screen.getByText('Clicar em Assinar')).toBeTruthy()
    expect(screen.getByText('Produto contratado')).toBeTruthy()
  })
})
