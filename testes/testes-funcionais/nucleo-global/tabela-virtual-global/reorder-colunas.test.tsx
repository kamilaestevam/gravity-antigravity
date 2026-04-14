// @vitest-environment jsdom
/**
 * Testes funcionais — reordenação de colunas (TabelaVirtualGlobal + SelectColunasGlobal)
 *
 * Cobre:
 *   F01 — reorderColuna move coluna da posição from para to e chama onSalvarPreferencias
 *   F02 — reorderColuna ignora keys inexistentes (sem crash, sem callback)
 *   F03 — reorderColuna mantém colunas não visíveis intactas
 *   F04 — popover "Colunas" não passa grupo às colunas (lista plana, sem cabeçalho de grupo)
 *   F05 — popover reflete ordem exata de colunasVisiveis (visíveis primeiro, ocultas depois)
 *   F06 — drag de coluna no popover chama onSalvarPreferencias com nova ordem
 */

import React, { useState, useCallback } from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'
import { SelectColunasGlobal } from '../../../../nucleo-global/Tabelas/select-colunas-global/src/SelectColunasGlobal'
import type { ColunaSelectConfig } from '../../../../nucleo-global/Tabelas/select-colunas-global/src/SelectColunasGlobal'
import type { GTPreferencias } from '../../../../nucleo-global/Tabelas/tabela-virtual-global/src/tipos'

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Reproduz exatamente a lógica de reorderColuna do TabelaVirtualGlobal */
function reorderColuna(
  colunasVisiveis: string[],
  preferencias: GTPreferencias | undefined,
  fromKey: string,
  toKey: string,
  onSalvarPreferencias: (p: GTPreferencias) => void,
) {
  const ordem    = [...colunasVisiveis]
  const fromIdx  = ordem.indexOf(fromKey)
  const toIdx    = ordem.indexOf(toKey)
  if (fromIdx === -1 || toIdx === -1) return
  const [item] = ordem.splice(fromIdx, 1)
  ordem.splice(toIdx, 0, item)
  onSalvarPreferencias({ ...(preferencias ?? {}), colunas_visiveis: ordem })
}

// ─── F01 — reorderColuna move e chama callback ────────────────────────────────

describe('F01 — reorderColuna: move coluna e chama onSalvarPreferencias', () => {
  it('move "exportador" para a posição de "importador"', () => {
    const onSalvar = vi.fn()
    const visiveis = ['numero', 'exportador', 'importador', 'valor']

    reorderColuna(visiveis, undefined, 'exportador', 'importador', onSalvar)

    expect(onSalvar).toHaveBeenCalledOnce()
    const { colunas_visiveis } = onSalvar.mock.calls[0][0] as GTPreferencias
    expect(colunas_visiveis).toEqual(['numero', 'importador', 'exportador', 'valor'])
  })

  it('move primeira coluna para o final', () => {
    const onSalvar = vi.fn()
    const visiveis = ['a', 'b', 'c', 'd']

    reorderColuna(visiveis, undefined, 'a', 'd', onSalvar)

    const { colunas_visiveis } = onSalvar.mock.calls[0][0] as GTPreferencias
    expect(colunas_visiveis).toEqual(['b', 'c', 'd', 'a'])
  })

  it('move última coluna para o início', () => {
    const onSalvar = vi.fn()
    const visiveis = ['a', 'b', 'c', 'd']

    reorderColuna(visiveis, undefined, 'd', 'a', onSalvar)

    const { colunas_visiveis } = onSalvar.mock.calls[0][0] as GTPreferencias
    expect(colunas_visiveis).toEqual(['d', 'a', 'b', 'c'])
  })

  it('preserva preferências existentes ao salvar', () => {
    const onSalvar = vi.fn()
    const visiveis = ['a', 'b', 'c']
    const prefs: GTPreferencias = { colunas_visiveis: visiveis, colunas_largura: { a: 120 } }

    reorderColuna(visiveis, prefs, 'a', 'c', onSalvar)

    const saved = onSalvar.mock.calls[0][0] as GTPreferencias
    expect(saved.colunas_largura).toEqual({ a: 120 })
  })
})

// ─── F02 — reorderColuna ignora keys inexistentes ─────────────────────────────

describe('F02 — reorderColuna: keys inexistentes são ignoradas', () => {
  it('não chama onSalvarPreferencias se fromKey não existe', () => {
    const onSalvar = vi.fn()
    reorderColuna(['a', 'b'], undefined, 'x', 'a', onSalvar)
    expect(onSalvar).not.toHaveBeenCalled()
  })

  it('não chama onSalvarPreferencias se toKey não existe', () => {
    const onSalvar = vi.fn()
    reorderColuna(['a', 'b'], undefined, 'a', 'z', onSalvar)
    expect(onSalvar).not.toHaveBeenCalled()
  })
})

// ─── F03 — reorderColuna mantém lista colunasVisiveis isolada ────────────────

describe('F03 — reorderColuna: não muta o array original de colunasVisiveis', () => {
  it('array original permanece inalterado após a chamada', () => {
    const onSalvar = vi.fn()
    const visiveis = ['a', 'b', 'c']
    const original = [...visiveis]

    reorderColuna(visiveis, undefined, 'a', 'c', onSalvar)

    expect(visiveis).toEqual(original)
  })
})

// ─── F04 — popover não recebe prop grupo (lista plana) ───────────────────────

describe('F04 — popover Colunas: lista plana sem cabeçalhos de grupo', () => {
  it('não exibe botões de expandir/recolher grupo quando grupo está ausente', () => {
    const colunas: ColunaSelectConfig[] = [
      { key: 'a', label: 'Alpha' },
      { key: 'b', label: 'Bravo' },
      { key: 'c', label: 'Charlie' },
    ]
    render(
      <SelectColunasGlobal
        colunas={colunas}
        colunasVisiveis={['a', 'b', 'c']}
        onToggle={vi.fn()}
        onFechar={vi.fn()}
        onReordenar={vi.fn()}
      />,
    )

    // Sem grupos → nenhum botão de expandir/recolher
    const grupoButtons = screen.queryAllByRole('button', { name: /recolher|expandir/i })
    expect(grupoButtons).toHaveLength(0)

    // Todas as colunas visíveis
    expect(screen.getByLabelText('Alpha')).toBeInTheDocument()
    expect(screen.getByLabelText('Bravo')).toBeInTheDocument()
    expect(screen.getByLabelText('Charlie')).toBeInTheDocument()
  })
})

// ─── F05 — popover reflete ordem exata de colunasVisiveis ────────────────────

describe('F05 — popover Colunas: ordem reflete colunasVisiveis', () => {
  it('colunas visíveis aparecem na ordem fornecida, ocultas no final', () => {
    // SelectColunasGlobal renderiza na ordem da prop colunas.
    // TabelaVirtualGlobal pré-ordena: visíveis mapeadas de colunasVisiveis, ocultas no final.
    // Aqui reproduzimos esse pré-ordenamento para testar o contrato end-to-end.
    const todas = [
      { key: 'c', label: 'Charlie' },
      { key: 'a', label: 'Alpha' },
      { key: 'b', label: 'Bravo' },
      { key: 'd', label: 'Delta' },
    ]
    const colunasVisiveis = ['b', 'a']

    // Pré-ordenamento idêntico ao TabelaVirtualGlobal
    const colunas: ColunaSelectConfig[] = [
      ...colunasVisiveis.map(key => todas.find(c => c.key === key)!),
      ...todas.filter(c => !colunasVisiveis.includes(c.key)),
    ]

    render(
      <SelectColunasGlobal
        colunas={colunas}
        colunasVisiveis={colunasVisiveis}
        onToggle={vi.fn()}
        onFechar={vi.fn()}
      />,
    )

    const checkboxes = screen.getAllByRole('checkbox')
    const labels = checkboxes.map(cb => cb.getAttribute('aria-label'))

    // b e a primeiro (visíveis, na ordem), depois c e d (ocultos)
    expect(labels[0]).toBe('Bravo')
    expect(labels[1]).toBe('Alpha')
    expect(labels).toContain('Charlie')
    expect(labels).toContain('Delta')
  })

  it('lista espelha ordem do TabelaVirtualGlobal: visíveis mapeados de colunasVisiveis → colunas', () => {
    // Simula o mapeamento exato do TabelaVirtualGlobal:
    // colunasVisiveis.map(key => colunas.find(c => c.key === key)).map(c => ({ key, label }))
    const todasColunas = [
      { key: 'exportador', label: 'Exportador' },
      { key: 'numero',     label: 'Número' },
      { key: 'importador', label: 'Importador' },
      { key: 'valor',      label: 'Valor' },
    ]
    const colunasVisiveis = ['numero', 'importador', 'exportador'] // ordem customizada pelo usuário

    // Reproduz o mapeamento do TabelaVirtualGlobal
    const colunasPopover: ColunaSelectConfig[] = [
      ...colunasVisiveis
        .map(key => todasColunas.find(c => c.key === key))
        .filter((c): c is (typeof todasColunas)[0] => c != null)
        .map(c => ({ key: c.key, label: c.label })),
      ...todasColunas
        .filter(c => !colunasVisiveis.includes(c.key))
        .map(c => ({ key: c.key, label: c.label })),
    ]

    render(
      <SelectColunasGlobal
        colunas={colunasPopover}
        colunasVisiveis={colunasVisiveis}
        onToggle={vi.fn()}
        onFechar={vi.fn()}
      />,
    )

    const checkboxes = screen.getAllByRole('checkbox')
    const labels = checkboxes.map(cb => cb.getAttribute('aria-label'))

    expect(labels[0]).toBe('Número')
    expect(labels[1]).toBe('Importador')
    expect(labels[2]).toBe('Exportador')
    expect(labels[3]).toBe('Valor') // oculto
  })
})

// ─── F06 — drag no popover chama onSalvarPreferencias com nova ordem ──────────

describe('F06 — drag no popover integrado com reorderColuna', () => {
  /**
   * Componente que integra o popover com a lógica de reorderColuna,
   * reproduzindo o comportamento do TabelaVirtualGlobal em miniatura.
   */
  function PopoverIntegrado({ onSalvar }: { onSalvar: (p: GTPreferencias) => void }) {
    const [visiveis, setVisiveis] = useState(['numero', 'exportador', 'importador'])

    const todasColunas = [
      { key: 'numero',     label: 'Número' },
      { key: 'exportador', label: 'Exportador' },
      { key: 'importador', label: 'Importador' },
    ]

    const onReordenar = useCallback((fromKey: string, toKey: string) => {
      const ordem   = [...visiveis]
      const fromIdx = ordem.indexOf(fromKey)
      const toIdx   = ordem.indexOf(toKey)
      if (fromIdx === -1 || toIdx === -1) return
      const [item] = ordem.splice(fromIdx, 1)
      ordem.splice(toIdx, 0, item)
      const prefs: GTPreferencias = { colunas_visiveis: ordem }
      setVisiveis(ordem)
      onSalvar(prefs)
    }, [visiveis, onSalvar])

    const colunasPopover: ColunaSelectConfig[] = visiveis
      .map(key => todasColunas.find(c => c.key === key))
      .filter((c): c is (typeof todasColunas)[0] => c != null)
      .map(c => ({ key: c.key, label: c.label }))

    return (
      <SelectColunasGlobal
        colunas={colunasPopover}
        colunasVisiveis={visiveis}
        onToggle={vi.fn()}
        onFechar={vi.fn()}
        onReordenar={onReordenar}
      />
    )
  }

  it('drag de Número para Importador → onSalvar recebe nova ordem', () => {
    const onSalvar = vi.fn()
    render(<PopoverIntegrado onSalvar={onSalvar} />)

    const labelNumero     = screen.getByLabelText('Número').closest('label')!
    const labelImportador = screen.getByLabelText('Importador').closest('label')!

    fireEvent.dragStart(labelNumero)
    fireEvent.dragOver(labelImportador)
    fireEvent.drop(labelImportador)

    expect(onSalvar).toHaveBeenCalledOnce()
    const saved = onSalvar.mock.calls[0][0] as GTPreferencias
    expect(saved.colunas_visiveis).toEqual(['exportador', 'importador', 'numero'])
  })

  it('após drag, popover atualiza para refletir nova ordem', async () => {
    const onSalvar = vi.fn()
    render(<PopoverIntegrado onSalvar={onSalvar} />)

    const labelNumero     = screen.getByLabelText('Número').closest('label')!
    const labelImportador = screen.getByLabelText('Importador').closest('label')!

    act(() => {
      fireEvent.dragStart(labelNumero)
      fireEvent.dragOver(labelImportador)
      fireEvent.drop(labelImportador)
    })

    // Após o drag, os checkboxes devem refletir a nova ordem
    const checkboxes = screen.getAllByRole('checkbox')
    const labels = checkboxes.map(cb => cb.getAttribute('aria-label'))
    expect(labels[0]).toBe('Exportador')
    expect(labels[1]).toBe('Importador')
    expect(labels[2]).toBe('Número')
  })
})
