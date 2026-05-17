// FiltrosColuna/FiltroChips.tsx
//
// Renderiza N chips de filtro ativo na toolbar. Cada chip:
//   - Mostra "Label: valor" (valor via `rotulofiltro` híbrido)
//   - É clicável (se `onEditarFiltro` passado) → reabre popover ancorado no chip
//   - Tem botão `×` para remover o filtro individualmente
//   - Mostra TooltipGlobal com lista numerada quando há 1+ valor enum
//
// Conteúdo opcional ANTES dos chips de coluna via prop `prefixo` (ex: chip
// de busca livre que cada produto controla separadamente).
//
// Refactor D9 (2026-05-13): promovido de produtos/pedido/Pedidos.tsx.
// Genérico `<T,>` (vírgula trailing) para evitar ambiguidade com tag JSX
// em arquivos .tsx — padrão Gravity para componentes React genéricos.

import React from 'react'
import { TooltipGlobal } from '@nucleo/tooltip-global'
import type { GTColuna } from '../tipos'
import type { FiltroAtivo, FiltroChipsProps } from './tipos'
import { FILTRO_TRADUCOES_PT_BR } from './tipos'
import { rotulofiltro } from './rotulofiltro'

export function FiltroChips<T,>({
  colunas,
  filtrosAtivos,
  onLimparFiltro,
  onLimparTodos,
  onEditarFiltro,
  thresholdConsolidar = 2,
  traducoes,
  prefixo,
}: FiltroChipsProps<T>): React.ReactElement | null {
  const t = { ...FILTRO_TRADUCOES_PT_BR, ...traducoes }

  // Calcula uma vez quais colunas têm filtro ativo
  const colunasComFiltro = colunas.filter((col) => filtrosAtivos[col.key] != null)

  // Se não há filtros nem prefixo, não renderiza nada (componente "vazio")
  if (colunasComFiltro.length === 0 && !prefixo) return null

  return (
    <div
      className="fc-chips-container"
      role="status"
      aria-label="Filtros ativos"
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.375rem',
        flex: 1,
      }}
    >
      {/* Conteúdo opcional do consumer (ex: chip de busca livre) */}
      {prefixo}

      {colunasComFiltro.map((col) => {
        const filtro = filtrosAtivos[col.key]!
        // Resolve rotulo com fallback ao label legado (TODO[D7]: remover ?? label após D7 promover rotulo)
        const rotuloColuna = (col as GTColuna<T> & { rotulo?: string }).rotulo ?? col.label

        // Tooltip único — lista numerada para enum (visualmente limpo quando há muitos)
        const valoresEnum = filtro.tipo === 'enum' ? Array.from(filtro.valor) : []
        const tooltipLista = valoresEnum.length > 0 ? (
          <ol
            style={{
              margin: 0,
              padding: 0,
              listStyle: 'none',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.125rem',
              lineHeight: 1.45,
            }}
          >
            {valoresEnum.map((v, i) => (
              <li key={v} style={{ display: 'flex', gap: '0.45rem' }}>
                <span style={{ opacity: 0.55, minWidth: '1.4rem', textAlign: 'right' }}>
                  {i + 1}.
                </span>
                <span>{v}</span>
              </li>
            ))}
          </ol>
        ) : null

        const chipBody = (
          <button
            type="button"
            className="fc-chip-body"
            onClick={onEditarFiltro ? (e) => onEditarFiltro(col.key, e.currentTarget) : undefined}
            style={{
              background: 'transparent',
              border: 'none',
              padding: 0,
              color: 'inherit',
              cursor: onEditarFiltro ? 'pointer' : 'default',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.3rem',
              font: 'inherit',
            }}
            aria-label="Editar filtro"
          >
            <span className="fc-chip-label">{rotuloColuna}:</span>
            <span className="fc-chip-valor">{rotulofiltro(filtro, thresholdConsolidar, traducoes)}</span>
          </button>
        )

        return (
          <span key={col.key} className="fc-chip">
            {tooltipLista ? (
              <TooltipGlobal titulo={rotuloColuna} descricao={tooltipLista}>
                <span style={{ display: 'contents' }}>{chipBody}</span>
              </TooltipGlobal>
            ) : chipBody}
            <button
              className="fc-chip-remove"
              onClick={() => onLimparFiltro(col.key)}
              aria-label={`Remover filtro ${rotuloColuna}`}
            >
              <FcChipRemoveIcon />
            </button>
          </span>
        )
      })}

      {colunasComFiltro.length > 1 && (
        <button className="fc-limpar-todos" onClick={onLimparTodos}>
          {t.limparTodos}
        </button>
      )}
    </div>
  )
}

// Ícone × interno (não dependemos do phosphor-react para minimizar peerDeps do nucleo-global)
function FcChipRemoveIcon(): React.ReactElement {
  return (
    <svg
      width="10"
      height="10"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      aria-hidden="true"
    >
      <path d="M4 4 L12 12 M12 4 L4 12" />
    </svg>
  )
}

// Helper opcional para colunas Pedido-style — calcula valores únicos das linhas para enum.
// Exportado para conveniência; cada produto pode implementar sua própria estratégia.
//
// Não é parte do FiltroChips em si — vive aqui para colocação temática.
export function calcularValoresUnicos<T>(
  rows: ReadonlyArray<T>,
  campo: string,
  labelMap?: Record<string, string>,
): string[] {
  const vals = new Set<string>()
  for (const row of rows) {
    const raw = String((row as Record<string, unknown>)[campo] ?? '').trim()
    if (!raw || raw === 'undefined' || raw === 'null') continue
    vals.add(labelMap?.[raw] ?? raw)
  }
  return Array.from(vals).sort()
}
