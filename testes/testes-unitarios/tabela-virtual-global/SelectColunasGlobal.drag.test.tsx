// @vitest-environment jsdom
/**
 * Testes unitários — SelectColunasGlobal · comportamento de drag e grupos
 *
 * Cobre:
 *   U01 — Grupos iniciam EXPANDIDOS (gruposColapsados = Set vazio)
 *   U02 — Itens de todos os grupos ficam visíveis sem interação
 *   U03 — Drag dentro do mesmo grupo chama onReordenar(fromKey, toKey)
 *   U04 — Drag entre grupos diferentes NÃO chama onReordenar
 *   U05 — Sem grupos (grupo omitido): lista plana, drag chama onReordenar
 *   U06 — Drag só funciona em colunas não-bloqueadas (naoOcultavel)
 *   U07 — Ordem das colunas visíveis reflete a prop colunasVisiveis (sem reordenação por grupo)
 */

import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { SelectColunasGlobal } from '../../../nucleo-global/Tabelas/select-colunas-global/src/SelectColunasGlobal'
import type { ColunaSelectConfig } from '../../../nucleo-global/Tabelas/select-colunas-global/src/SelectColunasGlobal'

// ─── Fixtures ────────────────────────────────────────────────────────────────

const COLUNAS_COM_GRUPOS: ColunaSelectConfig[] = [
  { key: 'id',         label: 'ID',          naoOcultavel: true,  grupo: 'Identificação' },
  { key: 'numero',     label: 'Número',                           grupo: 'Identificação' },
  { key: 'exportador', label: 'Exportador',                       grupo: 'Partes' },
  { key: 'importador', label: 'Importador',                       grupo: 'Partes' },
  { key: 'qtd',        label: 'Quantidade',                       grupo: 'Quantidades' },
]

const COLUNAS_SEM_GRUPO: ColunaSelectConfig[] = [
  { key: 'numero',     label: 'Número' },
  { key: 'exportador', label: 'Exportador' },
  { key: 'importador', label: 'Importador' },
]

function renderPopover(
  colunas: ColunaSelectConfig[],
  extras: Partial<React.ComponentProps<typeof SelectColunasGlobal>> = {},
) {
  const onFechar       = vi.fn()
  const onToggle       = vi.fn()
  const onReordenar    = vi.fn()
  const colunasVisiveis = colunas.map(c => c.key)

  render(
    <SelectColunasGlobal
      colunas={colunas}
      colunasVisiveis={colunasVisiveis}
      onToggle={onToggle}
      onFechar={onFechar}
      onReordenar={onReordenar}
      {...extras}
    />,
  )

  return { onFechar, onToggle, onReordenar }
}

// ─── Helpers de drag nativo ───────────────────────────────────────────────────

function dragOver(from: HTMLElement, to: HTMLElement) {
  fireEvent.dragStart(from)
  fireEvent.dragOver(to)
  fireEvent.drop(to)
}

// ─── U01 — Grupos iniciam expandidos ─────────────────────────────────────────

describe('U01 — grupos iniciam expandidos', () => {
  it('nenhum grupo deve iniciar colapsado', () => {
    renderPopover(COLUNAS_COM_GRUPOS)

    // Cada botão de grupo deve ter aria-expanded=true
    const grupoHeaders = screen.getAllByRole('button', { name: /recolher|expandir/i })
    for (const btn of grupoHeaders) {
      expect(btn).toHaveAttribute('aria-expanded', 'true')
    }
  })
})

// ─── U02 — Itens visíveis sem interação ──────────────────────────────────────

describe('U02 — itens visíveis imediatamente', () => {
  it('todas as colunas aparecem no DOM logo após renderizar', () => {
    renderPopover(COLUNAS_COM_GRUPOS)

    expect(screen.getByLabelText('Número')).toBeInTheDocument()
    expect(screen.getByLabelText('Exportador')).toBeInTheDocument()
    expect(screen.getByLabelText('Importador')).toBeInTheDocument()
    expect(screen.getByLabelText('Quantidade')).toBeInTheDocument()
  })
})

// ─── U03 — Drag dentro do mesmo grupo chama onReordenar ──────────────────────

describe('U03 — drag dentro do mesmo grupo dispara onReordenar', () => {
  it('arrasta Exportador para Importador (mesmo grupo Partes)', () => {
    const { onReordenar } = renderPopover(COLUNAS_COM_GRUPOS)

    // Labels dos checkboxes são os rótulos das colunas
    const labelExportador = screen.getByLabelText('Exportador').closest('label')!
    const labelImportador = screen.getByLabelText('Importador').closest('label')!

    dragOver(labelExportador, labelImportador)

    expect(onReordenar).toHaveBeenCalledWith('exportador', 'importador')
  })
})

// ─── U04 — Drag entre grupos diferentes NÃO chama onReordenar ────────────────

describe('U04 — drag entre grupos distintos não dispara onReordenar', () => {
  it('não chama ao arrastar de Identificação para Partes', () => {
    const { onReordenar } = renderPopover(COLUNAS_COM_GRUPOS)

    const labelNumero     = screen.getByLabelText('Número').closest('label')!
    const labelExportador = screen.getByLabelText('Exportador').closest('label')!

    dragOver(labelNumero, labelExportador)

    expect(onReordenar).not.toHaveBeenCalled()
  })
})

// ─── U05 — Lista plana (sem grupo): drag funciona ────────────────────────────

describe('U05 — lista plana sem grupos dispara onReordenar', () => {
  it('arrasta Número para Importador em lista plana', () => {
    const { onReordenar } = renderPopover(COLUNAS_SEM_GRUPO)

    const labelNumero    = screen.getByLabelText('Número').closest('label')!
    const labelImportador = screen.getByLabelText('Importador').closest('label')!

    dragOver(labelNumero, labelImportador)

    expect(onReordenar).toHaveBeenCalledWith('numero', 'importador')
  })
})

// ─── U06 — Coluna bloqueada não tem draggable true ───────────────────────────

describe('U06 — coluna naoOcultavel tem draggable=false, não-bloqueada tem draggable=true', () => {
  it('label de coluna bloqueada tem draggable=false', () => {
    renderPopover(COLUNAS_COM_GRUPOS)

    const labelId = screen.getByLabelText('ID').closest('label')!
    // draggable={false} quando col.naoOcultavel
    expect(labelId).toHaveAttribute('draggable', 'false')
  })

  it('label de coluna não-bloqueada tem draggable=true quando onReordenar fornecido', () => {
    renderPopover(COLUNAS_COM_GRUPOS)

    const labelNumero = screen.getByLabelText('Número').closest('label')!
    expect(labelNumero).toHaveAttribute('draggable', 'true')
  })

  it('label de coluna não-bloqueada tem draggable=false quando onReordenar ausente', () => {
    renderPopover(COLUNAS_COM_GRUPOS, { onReordenar: undefined })

    const labelNumero = screen.getByLabelText('Número').closest('label')!
    expect(labelNumero).toHaveAttribute('draggable', 'false')
  })
})

// ─── U07 — Ordem reflete a prop colunas ──────────────────────────────────────

describe('U07 — lista plana mantém a ordem da prop colunas', () => {
  it('SelectColunasGlobal renderiza na ordem do array colunas (TabelaVirtualGlobal pré-ordena)', () => {
    // SelectColunasGlobal renderiza na ordem exata da prop colunas.
    // É responsabilidade do pai (TabelaVirtualGlobal) passar colunas já ordenadas.
    // Este teste verifica que a ordem da prop é preservada sem embaralhar.
    const colunas: ColunaSelectConfig[] = [
      { key: 'b', label: 'Bravo' },
      { key: 'c', label: 'Charlie' },
      { key: 'a', label: 'Alpha' },
    ]
    // colunasVisiveis determina quais estão marcadas, não a ordem
    const colunasVisiveis = ['b', 'c', 'a']

    const onFechar = vi.fn()
    const onToggle = vi.fn()
    render(
      <SelectColunasGlobal
        colunas={colunas}
        colunasVisiveis={colunasVisiveis}
        onToggle={onToggle}
        onFechar={onFechar}
      />,
    )

    const checkboxes = screen.getAllByRole('checkbox')
    const labels = checkboxes.map(cb => cb.getAttribute('aria-label'))

    // A ordem no DOM deve refletir exatamente o array colunas: Bravo, Charlie, Alpha
    expect(labels).toEqual(['Bravo', 'Charlie', 'Alpha'])
  })

  it('colunas naoOcultavel aparecem antes das opcionais dentro de cada grupo', () => {
    const colunas: ColunaSelectConfig[] = [
      { key: 'opt1', label: 'Opcional 1' },
      { key: 'lock', label: 'Bloqueada',  naoOcultavel: true },
      { key: 'opt2', label: 'Opcional 2' },
    ]
    const onFechar = vi.fn()
    const onToggle = vi.fn()
    render(
      <SelectColunasGlobal
        colunas={colunas}
        colunasVisiveis={['opt1', 'lock', 'opt2']}
        onToggle={onToggle}
        onFechar={onFechar}
      />,
    )

    const checkboxes = screen.getAllByRole('checkbox')
    const labels = checkboxes.map(cb => cb.getAttribute('aria-label'))

    // naoOcultavel sobe para o topo na lista plana
    expect(labels[0]).toBe('Bloqueada')
  })
})
