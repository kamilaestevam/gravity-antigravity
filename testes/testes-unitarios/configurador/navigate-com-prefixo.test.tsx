/**
 * NavigateComPrefixo — testes unitários
 *
 * Valida o cálculo do destino canônico a partir do prefixo legado,
 * preservando sufixo, query string e hash. Confirma também a defesa
 * contra pares fora da whitelist REDIRECTS_LEGACY (anti open-redirect).
 *
 * Ref: documentos-tecnicos/arquitetura/rotas-convencao.md §"Redirects de transição"
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render } from '@testing-library/react'
import { MemoryRouter, Routes, Route, useLocation } from 'react-router-dom'
import { NavigateComPrefixo } from '../../../servicos-global/configurador/src/routing/NavigateComPrefixo'
import { REDIRECTS_LEGACY } from '../../../servicos-global/configurador/src/rotas'

function CaptureUrl({ onCapture }: { onCapture: (url: string) => void }) {
  const loc = useLocation()
  onCapture(`${loc.pathname}${loc.search}${loc.hash}`)
  return null
}

function renderRedirect(entradaUrl: string, de: string, para: string): string {
  let capturado = ''
  render(
    <MemoryRouter initialEntries={[entradaUrl]}>
      <Routes>
        <Route path={`${de}/*`} element={<NavigateComPrefixo de={de} para={para} />} />
        <Route path={de} element={<NavigateComPrefixo de={de} para={para} />} />
        <Route path="*" element={<CaptureUrl onCapture={(u) => (capturado = u)} />} />
      </Routes>
    </MemoryRouter>
  )
  return capturado
}

describe('NavigateComPrefixo', () => {
  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  describe('whitelist REDIRECTS_LEGACY', () => {
    it('declara todos os pares canônicos esperados', () => {
      const pares = REDIRECTS_LEGACY.map((r) => `${r.de} -> ${r.para}`).sort()
      expect(pares).toContain('/workspace -> /configurador')
      expect(pares).toContain('/produto/pedido -> /pedido')
      expect(pares).toContain('/produto/simula-custo -> /simula-custo')
      expect(pares).toContain('/produto/processo -> /processo')
      expect(pares).toContain('/produto/bid-frete -> /bid-frete')
      expect(pares).toContain('/produto/bid-cambio -> /bid-cambio')
    })
  })

  describe('cálculo de destino — /workspace -> /configurador', () => {
    it('redireciona raiz', () => {
      expect(renderRedirect('/workspace', '/workspace', '/configurador')).toBe('/configurador')
    })

    it('preserva sufixo simples', () => {
      expect(renderRedirect('/workspace/organizacao', '/workspace', '/configurador')).toBe(
        '/configurador/organizacao'
      )
    })

    it('preserva sufixo aninhado', () => {
      expect(renderRedirect('/workspace/api-cockpit/tokens', '/workspace', '/configurador')).toBe(
        '/configurador/api-cockpit/tokens'
      )
    })

    it('preserva query string', () => {
      expect(
        renderRedirect('/workspace/usuarios?status=ATIVO&pagina=2', '/workspace', '/configurador')
      ).toBe('/configurador/usuarios?status=ATIVO&pagina=2')
    })

    it('preserva hash', () => {
      expect(renderRedirect('/workspace/organizacao#secao', '/workspace', '/configurador')).toBe(
        '/configurador/organizacao#secao'
      )
    })

    it('preserva query e hash juntos', () => {
      expect(
        renderRedirect('/workspace/usuarios?q=joao#topo', '/workspace', '/configurador')
      ).toBe('/configurador/usuarios?q=joao#topo')
    })
  })

  describe('cálculo de destino — /produto/{X} -> /{X}', () => {
    it('/produto/pedido -> /pedido (raiz do produto)', () => {
      expect(renderRedirect('/produto/pedido', '/produto/pedido', '/pedido')).toBe('/pedido')
    })

    it('/produto/pedido/pedidos/123/editar -> /pedido/pedidos/123/editar', () => {
      expect(
        renderRedirect('/produto/pedido/pedidos/123/editar', '/produto/pedido', '/pedido')
      ).toBe('/pedido/pedidos/123/editar')
    })

    it('/produto/bid-frete/cotacoes?visao=kanban -> /bid-frete/cotacoes?visao=kanban', () => {
      expect(
        renderRedirect('/produto/bid-frete/cotacoes?visao=kanban', '/produto/bid-frete', '/bid-frete')
      ).toBe('/bid-frete/cotacoes?visao=kanban')
    })

    it('/produto/simula-custo/resultado/abc -> /simula-custo/resultado/abc', () => {
      expect(
        renderRedirect('/produto/simula-custo/resultado/abc', '/produto/simula-custo', '/simula-custo')
      ).toBe('/simula-custo/resultado/abc')
    })
  })

  describe('defesa anti open-redirect', () => {
    it('par fora da whitelist cai para /hub', () => {
      expect(renderRedirect('/injetado/x', '/injetado', '/malicioso')).toBe('/hub')
    })

    it('par válido em REDIRECTS_LEGACY mas com `para` divergente cai para /hub', () => {
      expect(renderRedirect('/workspace/x', '/workspace', '/qualquer-outro-destino')).toBe('/hub')
    })
  })
})
