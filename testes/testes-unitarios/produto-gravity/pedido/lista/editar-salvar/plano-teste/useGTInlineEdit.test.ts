// @vitest-environment jsdom
/**
 * TST-UNI-PEDIDO-EDITAR-SALVAR — useGTInlineEdit hook
 *
 * Testa o ciclo completo do hook: iniciar, editar, confirmar/cancelar,
 * rollback, propagacao replicar_em_itens.
 *
 * Plano: editar-salvar-unitario.md (secoes 11-13)
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useGTInlineEdit } from '@nucleo/tabela-virtual-global/hooks/useGTInlineEdit'

beforeEach(() => { vi.useFakeTimers() })
afterEach(() => { vi.useRealTimers() })

// ── 11. Ciclo iniciar → confirmar → sucesso ─────────────────────────────────

describe('useGTInlineEdit — ciclo iniciar → confirmar → sucesso', () => {
  it('U-HOOK-01: iniciarEdicao(id, campo, valor) → editandoCelula + valorEditando', () => {
    const { result } = renderHook(() => useGTInlineEdit())

    act(() => result.current.iniciarEdicao('ped-001', 'ncm', '8471.30.19'))

    expect(result.current.editandoCelula).toEqual({ id: 'ped-001', campo: 'ncm' })
    expect(result.current.valorEditando).toBe('8471.30.19')
  })

  it('U-HOOK-02: atualizarValor(novoValor) → valorEditando atualizado', () => {
    const { result } = renderHook(() => useGTInlineEdit())

    act(() => result.current.iniciarEdicao('ped-001', 'ncm', '8471.30.19'))
    act(() => result.current.atualizarValor('8471.30.20'))

    expect(result.current.valorEditando).toBe('8471.30.20')
  })

  it('U-HOOK-03: confirmarEdicao() chama onEditar(id, campo, novoValor)', async () => {
    const mockOnEditar = vi.fn().mockResolvedValue({ id: 'ped-001' })
    const { result } = renderHook(() => useGTInlineEdit(mockOnEditar))

    act(() => result.current.iniciarEdicao('ped-001', 'ncm', '8471.30.19'))
    act(() => result.current.atualizarValor('8471.30.20'))
    await act(() => result.current.confirmarEdicao())

    expect(mockOnEditar).toHaveBeenCalledWith('ped-001', 'ncm', '8471.30.20', undefined)
  })

  it('U-HOOK-04: Apos confirmar: resultado=sucesso, salvando=false', async () => {
    const mockOnEditar = vi.fn().mockResolvedValue({})
    const { result } = renderHook(() => useGTInlineEdit(mockOnEditar))

    act(() => result.current.iniciarEdicao('ped-001', 'ncm', 'A'))
    act(() => result.current.atualizarValor('B'))
    await act(() => result.current.confirmarEdicao())

    expect(result.current.resultado).toBe('sucesso')
    expect(result.current.salvando).toBe(false)
  })

  it('U-HOOK-05: Apos 600ms: cleanup automatico (editandoCelula=null, resultado=null)', async () => {
    const mockOnEditar = vi.fn().mockResolvedValue({})
    const { result } = renderHook(() => useGTInlineEdit(mockOnEditar))

    act(() => result.current.iniciarEdicao('ped-001', 'ncm', 'A'))
    act(() => result.current.atualizarValor('B'))
    await act(() => result.current.confirmarEdicao())

    expect(result.current.resultado).toBe('sucesso')

    act(() => { vi.advanceTimersByTime(600) })

    expect(result.current.editandoCelula).toBeNull()
    expect(result.current.resultado).toBeNull()
    expect(result.current.celulaResultado).toBeNull()
  })

  it('U-HOOK-06: Valor identico ao original: nao chama onEditar, popover fecha', async () => {
    const mockOnEditar = vi.fn().mockResolvedValue({})
    const { result } = renderHook(() => useGTInlineEdit(mockOnEditar))

    act(() => result.current.iniciarEdicao('ped-001', 'ncm', '8471.30.19'))
    // Nao muda valor — mantem o original
    await act(() => result.current.confirmarEdicao())

    expect(mockOnEditar).not.toHaveBeenCalled()
    expect(result.current.editandoCelula).toBeNull()
  })
})

// ── 12. Cancelar e erro com rollback ─────────────────────────────────────────

describe('useGTInlineEdit — cancelar e erro com rollback', () => {
  it('U-HOOK-10: cancelarEdicao() → editandoCelula=null, valorEditando=null', () => {
    const { result } = renderHook(() => useGTInlineEdit())

    act(() => result.current.iniciarEdicao('ped-001', 'ncm', 'A'))
    expect(result.current.editandoCelula).not.toBeNull()

    act(() => result.current.cancelarEdicao())

    expect(result.current.editandoCelula).toBeNull()
    expect(result.current.valorEditando).toBeNull()
  })

  it('U-HOOK-11: onEditar rejeita → valorEditando volta ao original (rollback)', async () => {
    const mockOnEditar = vi.fn().mockRejectedValue(new Error('Falha no servidor'))
    const { result } = renderHook(() => useGTInlineEdit(mockOnEditar))

    act(() => result.current.iniciarEdicao('ped-001', 'ncm', 'ORIGINAL'))
    act(() => result.current.atualizarValor('MODIFICADO'))
    await act(() => result.current.confirmarEdicao())

    expect(result.current.valorEditando).toBe('ORIGINAL')
  })

  it('U-HOOK-12: Apos erro: resultado=erro, erro=mensagem', async () => {
    const mockOnEditar = vi.fn().mockRejectedValue(new Error('Campo invalido'))
    const { result } = renderHook(() => useGTInlineEdit(mockOnEditar))

    act(() => result.current.iniciarEdicao('ped-001', 'ncm', 'A'))
    act(() => result.current.atualizarValor('B'))
    await act(() => result.current.confirmarEdicao())

    expect(result.current.resultado).toBe('erro')
    expect(result.current.erro).toBe('Campo invalido')
  })

  it('U-HOOK-13: Apos 1000ms: cleanup automatico', async () => {
    const mockOnEditar = vi.fn().mockRejectedValue(new Error('Falha'))
    const { result } = renderHook(() => useGTInlineEdit(mockOnEditar))

    act(() => result.current.iniciarEdicao('ped-001', 'ncm', 'A'))
    act(() => result.current.atualizarValor('B'))
    await act(() => result.current.confirmarEdicao())

    expect(result.current.resultado).toBe('erro')

    act(() => { vi.advanceTimersByTime(1000) })

    expect(result.current.editandoCelula).toBeNull()
    expect(result.current.resultado).toBeNull()
  })

  it('U-HOOK-14: onEditar nao fornecido → noop, fecha sem chamar nada', async () => {
    const { result } = renderHook(() => useGTInlineEdit(undefined))

    act(() => result.current.iniciarEdicao('ped-001', 'ncm', 'A'))
    act(() => result.current.atualizarValor('B'))
    await act(() => result.current.confirmarEdicao())

    expect(result.current.editandoCelula).toBeNull()
  })
})

// ── 13. Propagacao replicar_em_itens ─────────────────────────────────────────

describe('useGTInlineEdit — propagacao replicar_em_itens', () => {
  it('U-HOOK-20: confirmarEdicao({ replicar_em_itens: true }) com valor identico → CHAMA onEditar', async () => {
    const mockOnEditar = vi.fn().mockResolvedValue({})
    const { result } = renderHook(() => useGTInlineEdit(mockOnEditar))

    act(() => result.current.iniciarEdicao('ped-001', 'incoterm', 'FOB'))
    // Nao muda valor — mantem FOB
    await act(() => result.current.confirmarEdicao({ replicar_em_itens: true }))

    expect(mockOnEditar).toHaveBeenCalledWith('ped-001', 'incoterm', 'FOB', { replicar_em_itens: true })
  })

  it('U-HOOK-21: confirmarEdicao({ replicar_em_itens: false }) com valor identico → NAO chama', async () => {
    const mockOnEditar = vi.fn().mockResolvedValue({})
    const { result } = renderHook(() => useGTInlineEdit(mockOnEditar))

    act(() => result.current.iniciarEdicao('ped-001', 'incoterm', 'FOB'))
    await act(() => result.current.confirmarEdicao({ replicar_em_itens: false }))

    expect(mockOnEditar).not.toHaveBeenCalled()
  })

  it('U-HOOK-22: confirmarEdicao() sem opts com valor identico → NAO chama', async () => {
    const mockOnEditar = vi.fn().mockResolvedValue({})
    const { result } = renderHook(() => useGTInlineEdit(mockOnEditar))

    act(() => result.current.iniciarEdicao('ped-001', 'incoterm', 'FOB'))
    await act(() => result.current.confirmarEdicao())

    expect(mockOnEditar).not.toHaveBeenCalled()
  })

  it('U-HOOK-23: opts passado intacto para onEditar(id, campo, valor, opts)', async () => {
    const mockOnEditar = vi.fn().mockResolvedValue({})
    const { result } = renderHook(() => useGTInlineEdit(mockOnEditar))

    act(() => result.current.iniciarEdicao('ped-001', 'incoterm', 'FOB'))
    act(() => result.current.atualizarValor('CIF'))
    await act(() => result.current.confirmarEdicao({ replicar_em_itens: true }))

    expect(mockOnEditar).toHaveBeenCalledWith('ped-001', 'incoterm', 'CIF', { replicar_em_itens: true })
  })
})
