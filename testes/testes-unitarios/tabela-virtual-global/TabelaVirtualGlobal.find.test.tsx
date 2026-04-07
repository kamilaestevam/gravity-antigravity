// @vitest-environment jsdom
/**
 * Testes unitários — TabelaVirtualGlobal · find-in-page cross-página
 *
 * Cobre:
 *   - Highlight amarelo em headers com match
 *   - Highlight amarelo em células com match
 *   - Counter "X de N"
 *   - findProximo dentro da página (botão + Enter)
 *   - findAnterior dentro da página (botão + Shift+Enter)
 *   - findProximo no último match COM onFindProximaPagina → callback chamado
 *   - findProximo no último match SEM onFindProximaPagina → wrap-around
 *   - findAnterior no primeiro match COM onFindPaginaAnterior → callback chamado
 *   - findAnterior no primeiro match SEM onFindPaginaAnterior → wrap-around
 *   - irParaUltimoMatch: ao trocar dados após onFindPaginaAnterior, foco vai para último match
 *   - Sem resultados exibe mensagem
 *   - Limpar busca remove counter e highlights
 *   - onFindTermoChange: chamado com termo + função contarEmDados ao digitar
 *   - contarEmDados: conta headers + células em array externo
 *   - findTotalExterno: exibe total fornecido pelo pai no counter
 */

import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

// ── @nucleo/* tratados por aliases no vitest.config (stubs dedicados por pacote).
// vi.mock explícitos são desnecessários e causam conflito quando múltiplos
// pacotes apontam para o mesmo stub físico (Vitest de-duplica por path).
// Os stubs __nucleo-ui-stub__.ts / __stub-modal-moeda__.ts / __stub-modal-unidades__.ts
// já exportam o necessário para cada módulo.

import { TabelaVirtualGlobal } from '../../../nucleo-global/Tabelas/tabela-virtual-global/src/TabelaVirtualGlobal'
import type { GTColuna, GTVirtualTableProps } from '../../../nucleo-global/Tabelas/tabela-virtual-global/src/tipos'

// ─── Fixtures ────────────────────────────────────────────────────────────────

interface Pedido {
  id: string
  numero_pedido: string
  exportador: string
  valor: number
}

const COLUNAS: GTColuna<Pedido>[] = [
  { key: 'numero_pedido', label: 'Número do Pedido' },
  { key: 'exportador',    label: 'Nome do Exportador' },
  { key: 'valor',         label: 'Valor Total', tipo: 'number' },
]

function makeDados(count: number, prefixo = 'PO'): Pedido[] {
  return Array.from({ length: count }, (_, i) => ({
    id: `id-${i + 1}`,
    numero_pedido: `${prefixo}-2026-${String(i + 1).padStart(3, '0')}`,
    exportador: `Exportador ${i + 1}`,
    valor: (i + 1) * 1000,
  }))
}

function renderTabela(props: Partial<GTVirtualTableProps<Pedido>>) {
  const defaults: GTVirtualTableProps<Pedido> = {
    dados: makeDados(5),
    colunas: COLUNAS,
    itemId: (p) => p.id,
    onBuscar: vi.fn(),
    modoLocalizar: true,
  }
  return render(<TabelaVirtualGlobal<Pedido> {...defaults} {...props} />)
}

// ─── 1. Highlight em headers ──────────────────────────────────────────────────

describe('find-in-page — highlight em headers', () => {
  it('adiciona classe find-match no header quando label contém o termo', async () => {
    renderTabela({})
    const input = screen.getByRole('textbox', { name: /localizar/i })
    await userEvent.type(input, 'Exportador')

    const headers = document.querySelectorAll('.gtv-th--find-match')
    expect(headers.length).toBeGreaterThan(0)
  })
})

// ─── 2. Highlight em células ──────────────────────────────────────────────────

describe('find-in-page — highlight em células', () => {
  it('adiciona classe find-match nas células que contêm o termo', async () => {
    renderTabela({})
    const input = screen.getByRole('textbox', { name: /localizar/i })
    await userEvent.type(input, 'PO-2026-001')

    const celulas = document.querySelectorAll('.gtv-celula--find-match')
    expect(celulas.length).toBeGreaterThan(0)
  })
})

// ─── 3. Counter ───────────────────────────────────────────────────────────────

describe('find-in-page — counter', () => {
  it('exibe "1 de N" após digitar um termo com múltiplos matches', async () => {
    renderTabela({ dados: makeDados(3) })
    const input = screen.getByRole('textbox', { name: /localizar/i })
    await userEvent.type(input, 'Exportador')

    const counter = await screen.findByRole('status')
    expect(counter.textContent).toMatch(/1 de \d+/)
  })

  it('exibe mensagem de sem resultados quando o termo não tem match', async () => {
    renderTabela({})
    const input = screen.getByRole('textbox', { name: /localizar/i })
    await userEvent.type(input, 'xyzxyzxyz_nao_existe')

    expect(await screen.findByText(/sem resultados/i)).toBeTruthy()
  })
})

// ─── 4. findProximo dentro da página ─────────────────────────────────────────

describe('find-in-page — findProximo dentro da página', () => {
  it('avança o counter ao clicar no botão próximo match', async () => {
    renderTabela({ dados: makeDados(5) })
    const input = screen.getByRole('textbox', { name: /localizar/i })
    await userEvent.type(input, 'Exportador')

    const btnProximo = screen.getByRole('button', { name: /próximo match/i })
    fireEvent.click(btnProximo)

    const counter = screen.getByRole('status')
    expect(counter.textContent).toMatch(/2 de \d+/)
  })

  it('avança ao pressionar Enter no input', async () => {
    renderTabela({ dados: makeDados(5) })
    const input = screen.getByRole('textbox', { name: /localizar/i })
    await userEvent.type(input, 'Exportador')
    fireEvent.keyDown(input, { key: 'Enter' })

    const counter = screen.getByRole('status')
    expect(counter.textContent).toMatch(/2 de \d+/)
  })
})

// ─── 5. findAnterior dentro da página ────────────────────────────────────────

describe('find-in-page — findAnterior dentro da página', () => {
  it('recua o counter ao clicar no botão anterior após avançar duas vezes', async () => {
    renderTabela({ dados: makeDados(5) })
    const input = screen.getByRole('textbox', { name: /localizar/i })
    await userEvent.type(input, 'Exportador')

    const btnProximo  = screen.getByRole('button', { name: /próximo match/i })
    const btnAnterior = screen.getByRole('button', { name: /match anterior/i })

    fireEvent.click(btnProximo)  // → 2
    fireEvent.click(btnProximo)  // → 3
    fireEvent.click(btnAnterior) // → 2

    const counter = screen.getByRole('status')
    expect(counter.textContent).toMatch(/2 de \d+/)
  })

  it('recua ao pressionar Shift+Enter no input', async () => {
    renderTabela({ dados: makeDados(5) })
    const input = screen.getByRole('textbox', { name: /localizar/i })
    await userEvent.type(input, 'Exportador')

    fireEvent.keyDown(input, { key: 'Enter' })                    // → 2
    fireEvent.keyDown(input, { key: 'Enter', shiftKey: true })    // → 1

    const counter = screen.getByRole('status')
    expect(counter.textContent).toMatch(/1 de \d+/)
  })
})

// ─── 6. Boundary: findProximo com onFindProximaPagina ────────────────────────

describe('find-in-page — boundary próxima página', () => {
  it('chama onFindProximaPagina ao avançar além do último match', async () => {
    const onFindProximaPagina = vi.fn()
    // 'ABC' aparece só em numero_pedido → findMatches.length=1 → findAtivo=0=last → boundary
    const dados: Pedido[] = [{ id: '1', numero_pedido: 'ABC', exportador: 'EMPRESA_X', valor: 0 }]
    renderTabela({ dados, onFindProximaPagina })

    const input = screen.getByRole('textbox', { name: /localizar/i })
    await userEvent.type(input, 'ABC')

    const btnProximo = screen.getByRole('button', { name: /próximo match/i })
    fireEvent.click(btnProximo)

    expect(onFindProximaPagina).toHaveBeenCalledOnce()
  })

  it('faz wrap-around do último ao primeiro match quando onFindProximaPagina NÃO é passado', async () => {
    // Múltiplos matches para que os botões apareçam; sem callback → wrap interno
    renderTabela({ dados: makeDados(3), onFindProximaPagina: undefined })

    const input = screen.getByRole('textbox', { name: /localizar/i })
    await userEvent.type(input, 'Exportador')

    const btnProximo = screen.getByRole('button', { name: /próximo match/i })
    // Avança até o último match
    const counter = screen.getByRole('status')
    const total = parseInt(counter.textContent?.match(/de (\d+)/)?.[1] ?? '0')
    for (let i = 1; i < total; i++) fireEvent.click(btnProximo)
    // Mais um clique → wrap para 1
    fireEvent.click(btnProximo)
    expect(counter.textContent).toMatch(/^1 de/)
  })
})

// ─── 7. Boundary: findAnterior com onFindPaginaAnterior ──────────────────────

describe('find-in-page — boundary página anterior', () => {
  it('chama onFindPaginaAnterior ao recuar além do primeiro match', async () => {
    const onFindPaginaAnterior = vi.fn()
    const dados: Pedido[] = [{ id: '1', numero_pedido: 'ABC', exportador: 'ABC', valor: 0 }]
    renderTabela({ dados, onFindPaginaAnterior })

    const input = screen.getByRole('textbox', { name: /localizar/i })
    await userEvent.type(input, 'ABC')

    const btnAnterior = screen.getByRole('button', { name: /match anterior/i })
    fireEvent.click(btnAnterior)

    expect(onFindPaginaAnterior).toHaveBeenCalledOnce()
  })

  it('faz wrap-around do primeiro ao último match quando onFindPaginaAnterior NÃO é passado', async () => {
    // Múltiplos matches para que os botões apareçam; sem callback → wrap interno
    renderTabela({ dados: makeDados(3), onFindPaginaAnterior: undefined })

    const input = screen.getByRole('textbox', { name: /localizar/i })
    await userEvent.type(input, 'Exportador')

    const btnAnterior = screen.getByRole('button', { name: /match anterior/i })
    const counter = screen.getByRole('status')
    const total = parseInt(counter.textContent?.match(/de (\d+)/)?.[1] ?? '0')
    // No primeiro match (1 de N), clica anterior → wrap para N de N
    fireEvent.click(btnAnterior)
    expect(counter.textContent).toMatch(new RegExp(`^${total} de ${total}`))
  })
})

// ─── 8. irParaUltimoMatch ao navegar para página anterior ────────────────────

describe('find-in-page — posição ao carregar página anterior', () => {
  it('posiciona no último match quando novos dados chegam após onFindPaginaAnterior', async () => {
    const onFindPaginaAnterior = vi.fn()
    const dadosIniciais: Pedido[] = [
      { id: '1', numero_pedido: 'ABC', exportador: 'ABC', valor: 0 },
    ]

    const { rerender } = render(
      <TabelaVirtualGlobal<Pedido>
        dados={dadosIniciais}
        colunas={COLUNAS}
        itemId={(p) => p.id}
        onBuscar={vi.fn()}
        modoLocalizar={true}
        onFindPaginaAnterior={onFindPaginaAnterior}
      />,
    )

    const input = screen.getByRole('textbox', { name: /localizar/i })
    await userEvent.type(input, 'ABC')

    fireEvent.click(screen.getByRole('button', { name: /match anterior/i }))
    expect(onFindPaginaAnterior).toHaveBeenCalledOnce()

    // Simula carga da página anterior com 3 matches
    const dadosPáginaAnterior: Pedido[] = [
      { id: '2', numero_pedido: 'ABC-X', exportador: 'ABC-X', valor: 0 },
      { id: '3', numero_pedido: 'ABC-Y', exportador: 'ABC-Y', valor: 0 },
      { id: '4', numero_pedido: 'ABC-Z', exportador: 'ABC-Z', valor: 0 },
    ]
    rerender(
      <TabelaVirtualGlobal<Pedido>
        dados={dadosPáginaAnterior}
        colunas={COLUNAS}
        itemId={(p) => p.id}
        onBuscar={vi.fn()}
        modoLocalizar={true}
        onFindPaginaAnterior={onFindPaginaAnterior}
      />,
    )

    await waitFor(() => {
      const counter = screen.getByRole('status')
      // Deve estar no ÚLTIMO match da nova página, não no primeiro
      expect(counter.textContent).not.toMatch(/^1 de/)
    })
  })
})

// ─── 9. Limpar busca ──────────────────────────────────────────────────────────

describe('find-in-page — limpar busca', () => {
  it('remove counter e highlights ao clicar no × da busca', async () => {
    renderTabela({ dados: makeDados(3) })
    const input = screen.getByRole('textbox', { name: /localizar/i })
    await userEvent.type(input, 'Exportador')

    // confirma que counter apareceu
    expect(screen.getByRole('status')).toBeTruthy()

    const btnLimpar = screen.getByRole('button', { name: /limpar busca/i })
    fireEvent.click(btnLimpar)

    expect(screen.queryByRole('status')).toBeNull()
    expect(document.querySelectorAll('.gtv-celula--find-match').length).toBe(0)
  })
})

// ─── 9. onFindTermoChange — pré-scan do total global ─────────────────────────

describe('find-in-page — onFindTermoChange', () => {
  it('chama onFindTermoChange com o termo e uma função contarEmDados ao digitar', async () => {
    const onFindTermoChange = vi.fn()
    renderTabela({ dados: makeDados(3), onFindTermoChange })

    const input = screen.getByRole('textbox', { name: /localizar/i })
    await userEvent.type(input, 'PO')

    expect(onFindTermoChange).toHaveBeenCalled()
    const [termo, contarFn] = onFindTermoChange.mock.calls.at(-1)!
    expect(termo).toBe('PO')
    expect(typeof contarFn).toBe('function')
  })

  it('contarEmDados retorna contagem correta sobre array de dados fornecido', async () => {
    let capturedContar: ((dados: Pedido[]) => number) | null = null
    const onFindTermoChange = vi.fn((_, fn) => { capturedContar = fn })
    renderTabela({ dados: makeDados(3), onFindTermoChange })

    const input = screen.getByRole('textbox', { name: /localizar/i })
    await userEvent.type(input, 'PO')

    // contarEmDados deve contar headers + células
    const todosDados = makeDados(10) // simula 10 linhas de outra página
    const total = capturedContar!(todosDados)
    // 'PO' aparece em:
    //   1 header  ("Nome do Exportador" contém "po" em "ex-po-rtador")
    //   10 células numero_pedido ("PO-2026-001"…"PO-2026-010")
    //   10 células exportador ("Exportador 1"…"Exportador 10" contém "po")
    expect(total).toBe(21)
  })

  it('chama onFindTermoChange com termo vazio ao limpar a busca', async () => {
    const onFindTermoChange = vi.fn()
    renderTabela({ dados: makeDados(3), onFindTermoChange })

    const input = screen.getByRole('textbox', { name: /localizar/i })
    await userEvent.type(input, 'PO')

    onFindTermoChange.mockClear()
    const btnLimpar = screen.getByRole('button', { name: /limpar busca/i })
    fireEvent.click(btnLimpar)

    expect(onFindTermoChange).toHaveBeenCalledWith('', expect.any(Function))
  })
})

// ─── 10. findTotalExterno — exibe total fornecido pelo pai ────────────────────

describe('find-in-page — findTotalExterno', () => {
  it('exibe findTotalExterno no counter quando fornecido', async () => {
    renderTabela({ dados: makeDados(3), findTotalExterno: 224 })

    const input = screen.getByRole('textbox', { name: /localizar/i })
    await userEvent.type(input, 'Exportador')

    const counter = screen.getByRole('status')
    expect(counter.textContent).toMatch(/de 224/)
  })

  it('exibe o total local com + quando findTotalExterno é null e há próxima página', async () => {
    const onFindProximaPagina = vi.fn()
    renderTabela({ dados: makeDados(3), findTotalExterno: null, onFindProximaPagina })

    const input = screen.getByRole('textbox', { name: /localizar/i })
    await userEvent.type(input, 'Exportador')

    const counter = screen.getByRole('status')
    expect(counter.textContent).toMatch(/\+/)
  })

  it('exibe o total local sem + quando findTotalExterno é null e não há próxima página', async () => {
    renderTabela({ dados: makeDados(3), findTotalExterno: null, onFindProximaPagina: undefined })

    const input = screen.getByRole('textbox', { name: /localizar/i })
    await userEvent.type(input, 'Exportador')

    const counter = screen.getByRole('status')
    expect(counter.textContent).not.toMatch(/\+/)
  })
})
