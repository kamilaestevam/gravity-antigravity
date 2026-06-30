/**
 * @vitest-environment jsdom
 */
import { describe, expect, it } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { DocManualUmaSecao } from '../../../servicos-global/configurador/src/pages/university/manual-configurador-ui'
import {
  metadadosConfiguradorPagina,
  secaoConfiguradorPorSlug,
} from '../../../servicos-global/configurador/src/pages/university/manual-configurador-conteudo'

describe('DocConfiguradorManual — usuários', () => {
  it('abre Permissões do usuário pelo sumário sem crash', () => {
    const secao = secaoConfiguradorPorSlug('usuarios')
    expect(secao).toBeDefined()

    render(
      <MemoryRouter>
        <div data-manual-scroll-root style={{ height: 600, overflowY: 'auto' }}>
          <DocManualUmaSecao secao={secao!} metadados={metadadosConfiguradorPagina('usuarios')} />
        </div>
      </MemoryRouter>,
    )

    const btnSumario = screen.getAllByRole('button', { name: 'Permissões do usuário' })[0]
    fireEvent.click(btnSumario)

    expect(document.getElementById('doc-sec-5')).toBeTruthy()
    expect(screen.getByText('Como funcionam as permissões granulares')).toBeTruthy()
    expect(screen.getByText('Entrar na grade de permissões')).toBeTruthy()
    expect(screen.getByText('Habilitar cotação de frete internacional')).toBeTruthy()
  })
})
