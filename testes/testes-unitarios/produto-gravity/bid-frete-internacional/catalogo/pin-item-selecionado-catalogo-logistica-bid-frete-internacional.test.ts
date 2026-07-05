// @vitest-environment jsdom
// Pin do item selecionado no catálogo paginado de portos/aeroportos (TASK-000415/417).
// Garante que o porto/aeroporto selecionado NUNCA sai da lista em memória quando
// páginas/buscas substituem os itens — o snapshot de rota no submit deriva
// nome/país dessa lista (bug real: «Nome gravado (BRSSZ) não corresponde ao
// Cadastros (Santos)»).
/// <reference types="vitest/globals" />
import { renderHook, act, waitFor } from '@testing-library/react'

const { mockListarPortos, mockListarAeroportos } = vi.hoisted(() => ({
  mockListarPortos: vi.fn(),
  mockListarAeroportos: vi.fn(),
}))

vi.mock(
  '../../../../../servicos-global/produto/bid-frete-internacional/client/src/shared/cadastrosApi',
  () => ({
    cadastrosApi: {
      listarPortos: mockListarPortos,
      listarAeroportos: mockListarAeroportos,
    },
  }),
)

import { usePortosPorPais } from '../../../../../servicos-global/produto/bid-frete-internacional/client/src/shared/use-select-catalogo-logistica-cadastros-bid-frete-internacional'

const SANTOS = {
  codigo_unlocode_porto: 'BRSSZ',
  nome_porto: 'Santos',
  codigo_pais_porto: 'BR',
  ativo_porto: true,
}

const JEBEL_ALI = {
  codigo_unlocode_porto: 'AEJEA',
  nome_porto: 'Jebel Ali',
  codigo_pais_porto: 'AE',
  ativo_porto: true,
}

const ABU_DHABI = {
  codigo_unlocode_porto: 'AEAUH',
  nome_porto: 'Abu Dhabi',
  codigo_pais_porto: 'AE',
  ativo_porto: true,
}

function configurarMockCatalogo() {
  mockListarPortos.mockImplementation(async (params?: { q?: string }) => {
    // garantirSelecionado busca pelo código exato
    if (params?.q === 'BRSSZ') return { itens: [SANTOS], total: 1 }
    // busca remota do usuário — resposta NÃO contém o selecionado
    if (params?.q === 'abu') return { itens: [ABU_DHABI], total: 1 }
    // página 1 do catálogo global (alfabética por país) — sem o selecionado
    return { itens: [JEBEL_ALI], total: 300 }
  })
}

describe('pin do item selecionado no catálogo paginado', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    configurarMockCatalogo()
  })

  it('mantém o porto selecionado na lista mesmo quando a página 1 não o contém', async () => {
    const { result } = renderHook(() => usePortosPorPais('', true, 'BRSSZ'))

    await waitFor(() => {
      const codigos = result.current.portos.map((p) => p.codigo_unlocode_porto)
      expect(codigos).toContain('BRSSZ')
      expect(codigos).toContain('AEJEA')
    })
  })

  it('mantém o porto selecionado após busca remota que substitui a lista', async () => {
    const { result } = renderHook(() => usePortosPorPais('', true, 'BRSSZ'))

    await waitFor(() => {
      expect(result.current.portos.map((p) => p.codigo_unlocode_porto)).toContain('BRSSZ')
    })

    act(() => {
      result.current.aoMudarBusca('abu')
    })

    // debounce (280ms) + fetch — a resposta da busca substitui a lista,
    // mas o pin reinjeta o selecionado
    await waitFor(
      () => {
        const codigos = result.current.portos.map((p) => p.codigo_unlocode_porto)
        expect(codigos).toContain('AEAUH')
        expect(codigos).toContain('BRSSZ')
      },
      { timeout: 3000 },
    )
  })

  it('expõe o rótulo completo do selecionado (nome real, não só o código)', async () => {
    const { result } = renderHook(() => usePortosPorPais('', true, 'BRSSZ'))

    await waitFor(() => {
      const opcaoSantos = result.current.opcoes.find((o) => o.valor === 'BRSSZ')
      expect(opcaoSantos?.rotulo).toBe('BRSSZ — Santos, BR')
    })
  })

  it('sem código selecionado, não injeta item nenhum na lista', async () => {
    const { result } = renderHook(() => usePortosPorPais('', true, null))

    await waitFor(() => {
      expect(result.current.portos.length).toBeGreaterThan(0)
    })
    const codigos = result.current.portos.map((p) => p.codigo_unlocode_porto)
    expect(codigos).not.toContain('BRSSZ')
    expect(codigos).toEqual(['AEJEA'])
  })
})
