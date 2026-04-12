// @vitest-environment jsdom
/**
 * Testes unitários — useGTExpandir
 *
 * Cobre:
 *   U01 — toggle expande linha e registra snapshot imediatamente
 *   U02 — toggle colapsa linha já expandida
 *   U03 — toggle do cache registra snapshot (sem recarregar filhos)
 *   U04 — primeira mudança em dados após expansão recarrega filhos (bug fix)
 *   U05 — segunda mudança em dados também recarrega quando referência muda
 *   U06 — sem mudança de referência não recarrega
 *   U07 — colapsarTodos limpa expandidos
 *   U08 — atualizarFilhoNoCache atualiza filho individual
 *   U09 — múltiplos pais expandidos — só o pai que mudou recarrega
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { useGTExpandir } from '../../../../nucleo-global/Tabelas/tabela-virtual-global/src/hooks/useGTExpandir'

// ── Tipos ────────────────────────────────────────────────────────────────────

interface Pai { id: string; nome: string; tipo_operacao: string }
interface Filho { id: string; paiId: string; label: string }

const itemId = (p: Pai) => p.id
const filhoId = (f: Filho) => f.id

// ── Fixtures ─────────────────────────────────────────────────────────────────

function makePai(id: string, tipo: string = 'importacao'): Pai {
  return { id, nome: `Pedido ${id}`, tipo_operacao: tipo }
}

function makeFilhos(paiId: string): Filho[] {
  return [
    { id: `${paiId}-f1`, paiId, label: 'Item 1' },
    { id: `${paiId}-f2`, paiId, label: 'Item 2' },
  ]
}

// ── U01 — toggle expande e registra snapshot ──────────────────────────────────

describe('U01 — toggle expande linha e popula snapshot imediatamente', () => {
  it('filhosCache contém os filhos após toggle', async () => {
    const pai = makePai('p1')
    const onCarregarFilhos = vi.fn().mockResolvedValue(makeFilhos('p1'))

    const { result } = renderHook(() =>
      useGTExpandir<Pai, Filho>(onCarregarFilhos, [pai], itemId),
    )

    await act(async () => { await result.current.toggle('p1', pai) })

    expect(result.current.expandidos.has('p1')).toBe(true)
    expect(result.current.filhosCache.get('p1')).toHaveLength(2)
    expect(onCarregarFilhos).toHaveBeenCalledOnce()
  })

  it('snapshot é populado na expansão — mudança de dados dispara reload na 1ª vez', async () => {
    const pai = makePai('p1', 'importacao')
    const onCarregarFilhos = vi.fn().mockResolvedValue(makeFilhos('p1'))

    const { result, rerender } = renderHook(
      ({ dados }: { dados: Pai[] }) =>
        useGTExpandir<Pai, Filho>(onCarregarFilhos, dados, itemId),
      { initialProps: { dados: [pai] } },
    )

    // Expande — popula snapshot com p1@importacao
    await act(async () => { await result.current.toggle('p1', pai) })
    expect(onCarregarFilhos).toHaveBeenCalledTimes(1)

    // Simula edição do pai: nova referência com tipo diferente
    const paiEditado = makePai('p1', 'exportacao')
    await act(async () => { rerender({ dados: [paiEditado] }) })

    // Auto-revalidate deve ter disparado na 1ª mudança (fix do bug)
    await waitFor(() => expect(onCarregarFilhos).toHaveBeenCalledTimes(2))
    expect(onCarregarFilhos).toHaveBeenLastCalledWith(paiEditado)
  })
})

// ── U02 — colapsa linha já expandida ────────────────────────────────────────

describe('U02 — toggle colapsa linha já expandida', () => {
  it('remove id de expandidos mas mantém cache', async () => {
    const pai = makePai('p1')
    const onCarregarFilhos = vi.fn().mockResolvedValue(makeFilhos('p1'))

    const { result } = renderHook(() =>
      useGTExpandir<Pai, Filho>(onCarregarFilhos, [pai], itemId),
    )

    await act(async () => { await result.current.toggle('p1', pai) })
    expect(result.current.expandidos.has('p1')).toBe(true)

    await act(async () => { await result.current.toggle('p1', pai) })
    expect(result.current.expandidos.has('p1')).toBe(false)
    // Cache preservado para re-expansão rápida
    expect(result.current.filhosCache.has('p1')).toBe(true)
    expect(onCarregarFilhos).toHaveBeenCalledOnce()
  })
})

// ── U03 — toggle do cache registra snapshot ───────────────────────────────────

describe('U03 — re-expansão do cache registra snapshot e dispara reload ao mudar dados', () => {
  it('segunda expansão vinda do cache também popula snapshot', async () => {
    const pai = makePai('p1', 'importacao')
    const onCarregarFilhos = vi.fn().mockResolvedValue(makeFilhos('p1'))

    const { result, rerender } = renderHook(
      ({ dados }: { dados: Pai[] }) =>
        useGTExpandir<Pai, Filho>(onCarregarFilhos, dados, itemId),
      { initialProps: { dados: [pai] } },
    )

    // Primeira expansão → carrega filhos
    await act(async () => { await result.current.toggle('p1', pai) })
    // Colapsa
    await act(async () => { await result.current.toggle('p1', pai) })
    // Re-expande do cache
    await act(async () => { await result.current.toggle('p1', pai) })
    expect(onCarregarFilhos).toHaveBeenCalledTimes(1) // ainda só 1 carregamento

    // Agora edita o pai
    const paiEditado = makePai('p1', 'exportacao')
    await act(async () => { rerender({ dados: [paiEditado] }) })

    // Deve recarregar na primeira mudança após re-expansão
    await waitFor(() => expect(onCarregarFilhos).toHaveBeenCalledTimes(2))
  })
})

// ── U04 — sem mudança de referência não recarrega ────────────────────────────

describe('U04 — mesma referência de pai não dispara reload', () => {
  it('rerender com mesma instância de pai não chama onCarregarFilhos novamente', async () => {
    const pai = makePai('p1')
    const onCarregarFilhos = vi.fn().mockResolvedValue(makeFilhos('p1'))

    const { result, rerender } = renderHook(
      ({ dados }: { dados: Pai[] }) =>
        useGTExpandir<Pai, Filho>(onCarregarFilhos, dados, itemId),
      { initialProps: { dados: [pai] } },
    )

    await act(async () => { await result.current.toggle('p1', pai) })
    expect(onCarregarFilhos).toHaveBeenCalledTimes(1)

    // Mesmo array com mesma referência de pai
    await act(async () => { rerender({ dados: [pai] }) })

    expect(onCarregarFilhos).toHaveBeenCalledTimes(1)
  })
})

// ── U05 — múltiplos pais — só o alterado recarrega ───────────────────────────

describe('U05 — múltiplos pais expandidos — reload cirúrgico', () => {
  it('apenas o pai com referência alterada tem filhos recarregados', async () => {
    const p1 = makePai('p1', 'importacao')
    const p2 = makePai('p2', 'importacao')

    const onCarregarFilhos = vi.fn()
      .mockImplementation((p: Pai) => Promise.resolve(makeFilhos(p.id)))

    const { result, rerender } = renderHook(
      ({ dados }: { dados: Pai[] }) =>
        useGTExpandir<Pai, Filho>(onCarregarFilhos, dados, itemId),
      { initialProps: { dados: [p1, p2] } },
    )

    await act(async () => {
      await result.current.toggle('p1', p1)
      await result.current.toggle('p2', p2)
    })
    expect(onCarregarFilhos).toHaveBeenCalledTimes(2)

    // Só p1 muda de referência
    const p1Editado = makePai('p1', 'exportacao')
    await act(async () => { rerender({ dados: [p1Editado, p2] }) })

    await waitFor(() => expect(onCarregarFilhos).toHaveBeenCalledTimes(3))
    expect(onCarregarFilhos).toHaveBeenLastCalledWith(p1Editado)
  })
})

// ── U06 — colapsarTodos ───────────────────────────────────────────────────────

describe('U06 — colapsarTodos limpa expandidos', () => {
  it('expandidos fica vazio após colapsarTodos', async () => {
    const p1 = makePai('p1')
    const p2 = makePai('p2')
    const onCarregarFilhos = vi.fn()
      .mockImplementation((p: Pai) => Promise.resolve(makeFilhos(p.id)))

    const { result } = renderHook(() =>
      useGTExpandir<Pai, Filho>(onCarregarFilhos, [p1, p2], itemId),
    )

    await act(async () => {
      await result.current.toggle('p1', p1)
      await result.current.toggle('p2', p2)
    })
    expect(result.current.expandidos.size).toBe(2)

    act(() => { result.current.colapsarTodos() })
    expect(result.current.expandidos.size).toBe(0)
    expect(result.current.filhosCache.size).toBe(2) // cache preservado
  })
})

// ── U07 — atualizarFilhoNoCache ───────────────────────────────────────────────

describe('U07 — atualizarFilhoNoCache atualiza filho individual', () => {
  it('atualiza só o filho correto sem afetar os demais', async () => {
    const pai = makePai('p1')
    const filhos = makeFilhos('p1')
    const onCarregarFilhos = vi.fn().mockResolvedValue(filhos)

    const { result } = renderHook(() =>
      useGTExpandir<Pai, Filho>(onCarregarFilhos, [pai], itemId),
    )

    await act(async () => { await result.current.toggle('p1', pai) })

    const filhoAtualizado: Filho = { id: 'p1-f1', paiId: 'p1', label: 'Item 1 — EDITADO' }

    act(() => {
      result.current.atualizarFilhoNoCache(filhoAtualizado, filhoId)
    })

    const cache = result.current.filhosCache.get('p1')!
    expect(cache.find(f => f.id === 'p1-f1')?.label).toBe('Item 1 — EDITADO')
    expect(cache.find(f => f.id === 'p1-f2')?.label).toBe('Item 2') // não afetado
  })
})

// ── U08 — colapsar individual ─────────────────────────────────────────────────

describe('U08 — colapsar remove apenas linha específica', () => {
  it('colapsar p1 não afeta p2 expandido', async () => {
    const p1 = makePai('p1')
    const p2 = makePai('p2')
    const onCarregarFilhos = vi.fn()
      .mockImplementation((p: Pai) => Promise.resolve(makeFilhos(p.id)))

    const { result } = renderHook(() =>
      useGTExpandir<Pai, Filho>(onCarregarFilhos, [p1, p2], itemId),
    )

    await act(async () => {
      await result.current.toggle('p1', p1)
      await result.current.toggle('p2', p2)
    })

    act(() => { result.current.colapsar('p1') })

    expect(result.current.expandidos.has('p1')).toBe(false)
    expect(result.current.expandidos.has('p2')).toBe(true)
  })
})
