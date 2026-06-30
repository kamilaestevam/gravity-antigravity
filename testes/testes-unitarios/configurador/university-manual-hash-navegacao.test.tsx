/**
 * @vitest-environment jsdom
 */
import { describe, expect, it } from 'vitest'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import {
  DocManualUmaSecao,
} from '../../../servicos-global/configurador/src/pages/university/manual-configurador-ui'
import {
  metadadosConfiguradorPagina,
  montarItensSumarioManual,
  secaoConfiguradorPorSlug,
} from '../../../servicos-global/configurador/src/pages/university/manual-configurador-conteudo'
import {
  DOC_STORE_METADADOS,
  DOC_STORE_SECAO,
} from '../../../servicos-global/configurador/src/pages/university/manual-store-conteudo'

describe('University — links internos com hash (#doc-sec-N)', () => {
  it('manual Assinaturas: Cancelar assinatura é o item 6 do sumário', () => {
    const secao = secaoConfiguradorPorSlug('assinaturas')
    expect(secao).toBeDefined()
    const itens = montarItensSumarioManual(secao!)
    expect(itens[5]).toEqual({ num: 6, titulo: 'Cancelar assinatura' })
  })

  it('Store → Assinaturas#doc-sec-6 abre a seção Cancelar assinatura', async () => {
    const secaoAssinaturas = secaoConfiguradorPorSlug('assinaturas')
    expect(secaoAssinaturas).toBeDefined()

    render(
      <MemoryRouter initialEntries={['/university-gravity/docs/store']}>
        <div data-manual-scroll-root style={{ height: 600, overflowY: 'auto' }}>
          <Routes>
            <Route
              path="/university-gravity/docs/store"
              element={<DocManualUmaSecao secao={DOC_STORE_SECAO} metadados={DOC_STORE_METADADOS} />}
            />
            <Route
              path="/university-gravity/docs/configurador/assinaturas"
              element={(
                <DocManualUmaSecao
                  secao={secaoAssinaturas!}
                  metadados={metadadosConfiguradorPagina('assinaturas')}
                />
              )}
            />
          </Routes>
        </div>
      </MemoryRouter>,
    )

    const btnSumarioStore = screen.getAllByRole('button', { name: 'Cancelar produto' })[0]
    fireEvent.click(btnSumarioStore)

    const linkCancelar = screen.getByRole('button', { name: 'Cancelar assinatura' })
    fireEvent.click(linkCancelar)

    await waitFor(() => {
      expect(document.getElementById('doc-sec-6')).toBeTruthy()
      expect(screen.getByText('Iniciar cancelamento')).toBeTruthy()
    })
  })
})
