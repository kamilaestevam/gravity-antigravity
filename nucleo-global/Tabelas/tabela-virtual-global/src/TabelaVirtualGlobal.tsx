/**
 * @nucleo/tabela-virtual-global — componente principal
 * Tabela virtualizada de alto desempenho para o ecossistema Gravity.
 * Suporta hierarquia 3 níveis: Processo → Pedido → Item.
 * Renderização virtual via @tanstack/react-virtual.
 */

import React, {
  useState,
  useMemo,
  useRef,
  useEffect,
  useLayoutEffect,
  useCallback,
  memo,
} from 'react'
import { createPortal } from 'react-dom'
import { TooltipGlobal } from '@nucleo/tooltip-global'
import { useVirtualizer } from '@tanstack/react-virtual'
import { useGTExpandir } from './hooks/useGTExpandir.js'
import { useGTSelecao } from './hooks/useGTSelecao.js'
import { useGTInlineEdit } from './hooks/useGTInlineEdit.js'
import './tabela-virtual.css'
import type {
  GTVirtualTableProps,
  GTColuna,
  GTAcao,
  GTAcaoLote,
  GTAbaTipo,
  GTLinhaVirtual,
  GTPreferencias,
} from './tipos.js'

// ─── Ícones internos ──────────────────────────────────────────────────────────

function IconeChevron() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
      <path d="M4 2L8 6L4 10" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function IconeBusca() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
      <path d="M16.5 16.5L21 21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

function IconeX() {
  return (
    <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
      <path d="M1 1l8 8M9 1L1 9" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  )
}

function IconeExport() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 3v12M8 11l4 4 4-4M4 17v2a2 2 0 002 2h12a2 2 0 002-2v-2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function IconeColunas() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="3" y="3" width="5" height="18" rx="1" stroke="currentColor" strokeWidth="2" />
      <rect x="10" y="3" width="5" height="18" rx="1" stroke="currentColor" strokeWidth="2" />
      <rect x="17" y="3" width="4" height="18" rx="1" stroke="currentColor" strokeWidth="2" />
    </svg>
  )
}

function IconeFiltro() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M4 6h16M7 12h10M10 18h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

function IconeArrowUp() {
  return (
    <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
      <path d="M5 8V2M2 5l3-3 3 3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function IconeArrowDown() {
  return (
    <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
      <path d="M5 2v6M2 5l3 3 3-3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function IconeVazio() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function buildFlatRows<T, C>(
  dados: T[],
  expandidos: Set<string>,
  filhosCache: Map<string, C[]>,
  itemId: (item: T) => string,
  filhoId: (filho: C) => string,
): GTLinhaVirtual<T, C>[] {
  const linhas: GTLinhaVirtual<T, C>[] = []

  for (const item of dados) {
    const id = itemId(item)
    linhas.push({ tipo: 'pai', item, profundidade: 0, id })

    if (expandidos.has(id)) {
      const filhos = filhosCache.get(id) ?? []
      for (const filho of filhos) {
        const fid = filhoId(filho)
        linhas.push({ tipo: 'filho', item: filho, paiId: id, profundidade: 1, id: fid })
      }
    }
  }

  return linhas
}

function contarFiltrosAtivos(filtros: Record<string, unknown>): number {
  let count = 0
  for (const v of Object.values(filtros)) {
    if (v instanceof Set && v.size > 0) count++
    else if (v && typeof v === 'object') {
      const obj = v as Record<string, string>
      if (obj.min || obj.max || obj.inicio || obj.fim) count++
    }
  }
  return count
}

// ─── Subcomponente: Abas de status ────────────────────────────────────────────

const GTAbas = memo(function GTAbas({
  abas,
  abaAtiva,
  onMudarAba,
}: {
  abas: GTAbaTipo[]
  abaAtiva: string | undefined
  onMudarAba?: (aba: string) => void
}) {
  return (
    <div className="gtv-tabs" role="tablist">
      {abas.map(aba => (
        <button
          key={aba.valor}
          role="tab"
          aria-selected={abaAtiva === aba.valor}
          className={`gtv-tab${abaAtiva === aba.valor ? ' gtv-tab--ativa' : ''}`}
          onClick={() => onMudarAba?.(aba.valor)}
        >
          {aba.label}
          {aba.contagem != null && (
            <span className="gtv-tab-badge">{aba.contagem}</span>
          )}
        </button>
      ))}
    </div>
  )
})

// ─── Subcomponente: Skeleton de carregamento ──────────────────────────────────

const GTSkeleton = memo(function GTSkeleton({ rowHeight }: { rowHeight: number }) {
  return (
    <div className="gtv-tabela-scroll" aria-busy="true" aria-label="Carregando...">
      {Array.from({ length: 10 }).map((_, i) => (
        <div
          key={i}
          className="gtv-skeleton-linha"
          style={{ height: rowHeight }}
        >
          <div className="gtv-skeleton gtv-skeleton--sm" />
          <div className="gtv-skeleton gtv-skeleton--xl" />
          <div className="gtv-skeleton gtv-skeleton--md" />
          <div className="gtv-skeleton gtv-skeleton--lg" />
          <div className="gtv-skeleton gtv-skeleton--sm" />
        </div>
      ))}
    </div>
  )
})

// ─── Subcomponente: Estado vazio ──────────────────────────────────────────────

const GTVazio = memo(function GTVazio({
  emptyIcon,
  emptyTitle,
  emptyDescription,
  emptyAction,
}: {
  emptyIcon?: React.ReactNode
  emptyTitle?: string
  emptyDescription?: string
  emptyAction?: React.ReactNode
}) {
  return (
    <div className="gtv-vazio">
      <div className="gtv-vazio__icone">
        {emptyIcon ?? <IconeVazio />}
      </div>
      <p className="gtv-vazio__titulo">{emptyTitle ?? 'Nenhum resultado encontrado'}</p>
      {emptyDescription && (
        <p className="gtv-vazio__desc">{emptyDescription}</p>
      )}
      {emptyAction && (
        <div className="gtv-vazio__acao">{emptyAction}</div>
      )}
    </div>
  )
})

// ─── Subcomponente: Popover de visibilidade de colunas ────────────────────────

const GTVisibilidadeColunas = memo(function GTVisibilidadeColunas<T>({
  colunas,
  colunasVisiveis,
  onToggle,
  onFechar,
  onReordenar,
  onSelecionarTodos,
  onRestaurarPadrao,
}: {
  colunas: GTColuna<T>[]
  colunasVisiveis: string[]
  onToggle: (key: string) => void
  onFechar: () => void
  onReordenar?: (fromKey: string, toKey: string) => void
  onSelecionarTodos?: () => void
  onRestaurarPadrao?: () => void
}) {
  const ref = useRef<HTMLDivElement>(null)
  const dragKeyRef = useRef<string | null>(null)
  const [busca, setBusca] = useState('')

  useEffect(() => {
    function fora(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onFechar()
      }
    }
    document.addEventListener('mousedown', fora)
    return () => document.removeEventListener('mousedown', fora)
  }, [onFechar])

  const colunasFiltradas = useMemo(() => {
    const termo = busca.trim().toLowerCase()
    const lista = termo ? colunas.filter(c => c.label.toLowerCase().includes(termo)) : colunas
    const sorted = [...lista].sort((a, b) => a.label.localeCompare(b.label, 'pt-BR'))
    // Colunas obrigatórias (naoOcultavel) ficam sempre no topo
    const obrigatorias = sorted.filter(c => c.naoOcultavel)
    const opcionais    = sorted.filter(c => !c.naoOcultavel)
    return [...obrigatorias, ...opcionais]
  }, [colunas, busca])

  return (
    <div ref={ref} className="gtv-export-menu" style={{ minWidth: 240 }}>
      {/* ── Busca ── */}
      <div className="gtv-col-busca">
        <svg width="13" height="13" viewBox="0 0 256 256" fill="currentColor" aria-hidden="true" className="gtv-col-busca-icone">
          <path d="M229.66,218.34l-50.07-50.07a88.11,88.11,0,1,0-11.31,11.31l50.06,50.07a8,8,0,0,0,11.32-11.31ZM40,112a72,72,0,1,1,72,72A72.08,72.08,0,0,1,40,112Z"/>
        </svg>
        <input
          type="text"
          className="gtv-col-busca-input"
          placeholder="Localizar coluna..."
          value={busca}
          onChange={e => setBusca(e.target.value)}
          autoFocus
        />
        {busca && (
          <button type="button" className="gtv-col-busca-clear" onClick={() => setBusca('')} aria-label="Limpar busca">
            <svg width="10" height="10" viewBox="0 0 256 256" fill="currentColor" aria-hidden="true">
              <path d="M205.66,194.34a8,8,0,0,1-11.32,11.32L128,139.31,61.66,205.66a8,8,0,0,1-11.32-11.32L116.69,128,50.34,61.66A8,8,0,0,1,61.66,50.34L128,116.69l66.34-66.35a8,8,0,0,1,11.32,11.32L139.31,128Z"/>
            </svg>
          </button>
        )}
      </div>
      {/* ── Ações em lote ── */}
      <div className="gtv-col-acoes">
        <button type="button" className="gtv-col-acao-btn" onClick={onSelecionarTodos}>
          <svg width="14" height="14" viewBox="0 0 256 256" fill="currentColor" aria-hidden="true">
            <path d="M173.66,98.34a8,8,0,0,1,0,11.32l-56,56a8,8,0,0,1-11.32,0l-24-24a8,8,0,0,1,11.32-11.32L112,148.69l50.34-50.35A8,8,0,0,1,173.66,98.34ZM224,48H32A16,16,0,0,0,16,64V192a16,16,0,0,0,16,16H224a16,16,0,0,0,16-16V64A16,16,0,0,0,224,48Zm0,144H32V64H224V192Z"/>
          </svg>
          Selecionar tudo
        </button>
        <button type="button" className="gtv-col-acao-btn gtv-col-acao-btn--reset" onClick={onRestaurarPadrao}>
          <svg width="14" height="14" viewBox="0 0 256 256" fill="currentColor" aria-hidden="true">
            <path d="M224,128a96,96,0,1,1-21.95-61.09,8,8,0,1,1-12.33,10.18A80,80,0,1,0,207.6,136H168a8,8,0,0,1,0-16h48a8,8,0,0,1,8,8Z"/>
          </svg>
          Restaurar padrão
        </button>
      </div>
      {/* ── Lista ── */}
      {colunasFiltradas.length === 0 ? (
        <div className="gtv-col-vazio">Nenhuma coluna encontrada</div>
      ) : (
        colunasFiltradas.map((col, idx) => (
          <React.Fragment key={col.key}>
            {/* Divisor entre colunas obrigatórias e opcionais */}
            {idx > 0 && !col.naoOcultavel && colunasFiltradas[idx - 1].naoOcultavel && (
              <div className="gtv-col-divisor" />
            )}
          <label
            key={col.key}
            className="gtv-export-item"
            draggable={!!onReordenar && !col.naoOcultavel}
            onDragStart={() => { dragKeyRef.current = col.key }}
            onDragOver={e => e.preventDefault()}
            onDrop={() => {
              if (dragKeyRef.current && dragKeyRef.current !== col.key) {
                onReordenar?.(dragKeyRef.current, col.key)
              }
              dragKeyRef.current = null
            }}
            style={{ cursor: col.naoOcultavel ? 'default' : 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}
          >
            {onReordenar && (
              col.naoOcultavel ? (
                /* Cadeado — coluna obrigatória, não pode ser ocultada */
                <svg width="10" height="12" viewBox="0 0 256 256" fill="currentColor" aria-hidden="true"
                  style={{ color: 'var(--gtv-accent, #6366f1)', flexShrink: 0, opacity: 0.7 }}>
                  <path d="M208,80H176V56a48,48,0,0,0-96,0V80H48A16,16,0,0,0,32,96V208a16,16,0,0,0,16,16H208a16,16,0,0,0,16-16V96A16,16,0,0,0,208,80ZM96,56a32,32,0,0,1,64,0V80H96ZM208,208H48V96H208V208Zm-80-32a16,16,0,1,0-16-16A16,16,0,0,0,128,176Z"/>
                </svg>
              ) : (
                /* Drag handle — coluna opcional, pode ser reordenada */
                <svg width="10" height="14" viewBox="0 0 10 14" fill="none" aria-hidden="true"
                  style={{ cursor: 'grab', color: 'var(--gtv-muted, #64748b)', flexShrink: 0 }}>
                  <circle cx="3" cy="3"  r="1.2" fill="currentColor"/>
                  <circle cx="7" cy="3"  r="1.2" fill="currentColor"/>
                  <circle cx="3" cy="7"  r="1.2" fill="currentColor"/>
                  <circle cx="7" cy="7"  r="1.2" fill="currentColor"/>
                  <circle cx="3" cy="11" r="1.2" fill="currentColor"/>
                  <circle cx="7" cy="11" r="1.2" fill="currentColor"/>
                </svg>
              )
            )}
            <input
              type="checkbox"
              checked={colunasVisiveis.includes(col.key)}
              disabled={col.naoOcultavel}
              onChange={() => !col.naoOcultavel && onToggle(col.key)}
              style={{ marginRight: 4 }}
            />
            {col.label}
          </label>
          </React.Fragment>
        ))
      )}
    </div>
  )
})

// ─── Subcomponente: Popover de edição ────────────────────────────────────────

interface GTEditPopoverProps {
  overlayInfo: { rect: DOMRect; id: string; campo: string; isFilho: boolean; colLabel: string }
  valorEditando: unknown
  salvando: boolean
  onAtualizar: (valor: unknown) => void
  onConfirmar: () => void
  onCancelar: () => void
}

const POPOVER_W = 340

const GTEditPopover = memo(function GTEditPopover({
  overlayInfo,
  valorEditando,
  salvando,
  onAtualizar,
  onConfirmar,
  onCancelar,
}: GTEditPopoverProps) {
  const { rect, colLabel } = overlayInfo
  const popoverRef = useRef<HTMLDivElement>(null)
  const inputRef   = useRef<HTMLInputElement>(null)

  // Posição inicial (abaixo da célula) — reajustada pelo useLayoutEffect
  const [pos, setPos] = useState(() => {
    const left = Math.max(8, Math.min(rect.left, window.innerWidth - POPOVER_W - 8))
    return { top: rect.bottom + 8, left, arrowLeft: 16, flipUp: false }
  })

  // Reposiciona após medir altura real — evita corte na borda inferior
  useLayoutEffect(() => {
    const el = popoverRef.current
    if (!el) return
    const h = el.offsetHeight
    const w = el.offsetWidth
    const left     = Math.max(8, Math.min(rect.left, window.innerWidth - w - 8))
    const arrowLeft = Math.max(12, Math.min(w - 20, (rect.left + rect.width / 2) - left))
    const belowOk  = rect.bottom + h + 12 <= window.innerHeight
    const top      = belowOk ? rect.bottom + 8 : Math.max(8, rect.top - h - 8)
    setPos({ top, left, arrowLeft, flipUp: !belowOk })
  }, [rect])

  // Seleciona o texto ao montar para edição imediata
  useEffect(() => {
    const t = setTimeout(() => inputRef.current?.select(), 30)
    return () => clearTimeout(t)
  }, [])

  return (
    <>
      {/* Backdrop — clique fora confirma */}
      <div className="gtv-edit-popover-backdrop" onMouseDown={() => onConfirmar()} />

      {/* Popover */}
      <div
        ref={popoverRef}
        className={`gtv-edit-popover${pos.flipUp ? ' gtv-edit-popover--flip' : ''}`}
        style={{ top: pos.top, left: pos.left }}
        onMouseDown={e => e.stopPropagation()}
      >
        {/* Seta apontando para a célula */}
        <div className="gtv-edit-popover-arrow" style={{ left: pos.arrowLeft }} />

        {/* Header: nome do campo + fechar */}
        <div className="gtv-edit-popover-header">
          <span className="gtv-edit-popover-label">
            <svg width="11" height="11" viewBox="0 0 256 256" fill="currentColor" aria-hidden="true">
              <path d="M227.31,73.37,182.63,28.68a16,16,0,0,0-22.63,0L36.69,152A15.86,15.86,0,0,0,32,163.31V208a16,16,0,0,0,16,16H92.69A15.86,15.86,0,0,0,104,219.31L227.31,96a16,16,0,0,0,0-22.63ZM51.31,160l96-96,32,32-96,96ZM48,179.31,76.69,208H48Zm160-96L176,115.31,140.69,80,163.31,57.37,208,102Z"/>
            </svg>
            {colLabel}
          </span>
          <button
            type="button"
            className="gtv-edit-popover-close"
            onMouseDown={e => e.stopPropagation()}
            onClick={() => onCancelar()}
            aria-label="Cancelar edição"
          >
            <svg width="9" height="9" viewBox="0 0 256 256" fill="currentColor" aria-hidden="true">
              <path d="M205.66,194.34a8,8,0,0,1-11.32,11.32L128,139.31,61.66,205.66a8,8,0,0,1-11.32-11.32L116.69,128,50.34,61.66A8,8,0,0,1,61.66,50.34L128,116.69l66.34-66.35a8,8,0,0,1,11.32,11.32L139.31,128Z"/>
            </svg>
          </button>
        </div>

        {/* Input */}
        <div className="gtv-edit-popover-body">
          <input
            ref={inputRef}
            autoFocus
            className="gtv-edit-popover-input"
            value={String(valorEditando ?? '')}
            disabled={salvando}
            onChange={e => onAtualizar(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter')  { e.preventDefault(); onConfirmar() }
              if (e.key === 'Escape') { e.preventDefault(); onCancelar()  }
            }}
            onBlur={() => onConfirmar()}
          />
        </div>

        {/* Footer: hints + botões */}
        <div className="gtv-edit-popover-footer">
          <div className="gtv-edit-popover-hints" aria-hidden="true">
            <kbd className="gtv-edit-popover-kbd">Enter</kbd>
            <span>confirmar</span>
            <span className="gtv-edit-popover-sep">·</span>
            <kbd className="gtv-edit-popover-kbd">Esc</kbd>
            <span>cancelar</span>
          </div>
          <div className="gtv-edit-popover-actions">
            <button
              type="button"
              className="gtv-edit-popover-btn gtv-edit-popover-btn--ghost"
              onMouseDown={e => e.stopPropagation()}
              onClick={() => onCancelar()}
              tabIndex={-1}
            >
              Cancelar
            </button>
            <button
              type="button"
              className="gtv-edit-popover-btn gtv-edit-popover-btn--primary"
              onMouseDown={e => e.stopPropagation()}
              onClick={() => onConfirmar()}
              disabled={salvando}
              tabIndex={-1}
            >
              {salvando
                ? <span className="gtv-spinner" aria-label="Salvando..." />
                : <>
                    <svg width="11" height="11" viewBox="0 0 256 256" fill="currentColor" aria-hidden="true">
                      <path d="M229.66,77.66l-128,128a8,8,0,0,1-11.32,0l-56-56a8,8,0,0,1,11.32-11.32L96,188.69,218.34,66.34a8,8,0,0,1,11.32,11.32Z"/>
                    </svg>
                    Confirmar
                  </>
              }
            </button>
          </div>
        </div>
      </div>
    </>
  )
})

// ─── Componente principal ─────────────────────────────────────────────────────

export function TabelaVirtualGlobal<T = unknown, C = never>({
  dados,
  colunas,
  itemId: itemIdProp,
  colunasFilhas,
  onCarregarFilhos,
  filhoId: filhoIdProp,
  acoesFilhas,
  temMais,
  carregandoMais,
  onCarregarMais,
  abas,
  abaAtiva,
  onMudarAba,
  acoes,
  acoesLote,
  acoesExportacao,
  acoesBarra,
  onSelecaoMudar,
  onBuscar,
  placeholderBusca = 'Buscar...',
  onFiltrar,
  onOrdenar,
  sortCampo,
  sortDir,
  camposEditaveis = [],
  onEditar,
  camposEditaveisFilhos = [],
  onEditarFilho,
  onSalvoComSucesso,
  onErroAoSalvar,
  preferencias,
  onSalvarPreferencias,
  carregando,
  emptyIcon,
  emptyTitle,
  emptyDescription,
  emptyAction,
  rowHeight = 44,
  childRowHeight = 36,
  overscan = 5,
  ariaLabel = 'Tabela de dados',
}: GTVirtualTableProps<T, C>) {
  // ── Funções de ID ────────────────────────────────────────────────────────────
  const itemId = useCallback(
    (item: T): string => {
      if (itemIdProp) return itemIdProp(item)
      return String((item as Record<string, unknown>).id ?? '')
    },
    [itemIdProp],
  )

  const filhoId = useCallback(
    (filho: C): string => {
      if (filhoIdProp) return filhoIdProp(filho)
      return String((filho as Record<string, unknown>).id ?? '')
    },
    [filhoIdProp],
  )

  // ── Busca ────────────────────────────────────────────────────────────────────
  const [termoBusca, setTermoBusca] = useState('')

  const handleBusca = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const v = e.target.value
      setTermoBusca(v)
      onBuscar?.(v)
    },
    [onBuscar],
  )

  const limparBusca = useCallback(() => {
    setTermoBusca('')
    onBuscar?.('')
  }, [onBuscar])

  // ── Sort ─────────────────────────────────────────────────────────────────────
  const [sortLocal, setSortLocal] = useState<{ campo: string; dir: 'asc' | 'desc' } | null>(
    sortCampo && sortDir ? { campo: sortCampo, dir: sortDir } : null,
  )

  const handleSort = useCallback(
    (campo: string) => {
      setSortLocal(prev => {
        if (prev?.campo === campo) {
          const novaDir: 'asc' | 'desc' = prev.dir === 'asc' ? 'desc' : 'asc'
          onOrdenar?.(campo, novaDir)
          return { campo, dir: novaDir }
        }
        onOrdenar?.(campo, 'asc')
        return { campo, dir: 'asc' }
      })
    },
    [onOrdenar],
  )

  // ── Export ───────────────────────────────────────────────────────────────────
  const [exportAberto, setExportAberto] = useState(false)

  // ── Visibilidade de colunas ───────────────────────────────────────────────────
  const [colunasAbertas, setColunasAbertas] = useState(false)

  const colunasVisiveis = useMemo<string[]>(() => {
    if (preferencias?.colunas_visiveis) return preferencias.colunas_visiveis
    return colunas.filter(c => !c.oculta).map(c => c.key)
  }, [preferencias, colunas])

  const colunasFiltradas = useMemo(
    () => colunas.filter(c => colunasVisiveis.includes(c.key)),
    [colunas, colunasVisiveis],
  )

  const toggleColuna = useCallback(
    (key: string) => {
      const novaVisibilidade = colunasVisiveis.includes(key)
        ? colunasVisiveis.filter(k => k !== key)
        : [...colunasVisiveis, key]

      const prefs: GTPreferencias = {
        ...(preferencias ?? {}),
        colunas_visiveis: novaVisibilidade,
      }
      onSalvarPreferencias?.(prefs)
    },
    [colunasVisiveis, preferencias, onSalvarPreferencias],
  )

  const reorderColuna = useCallback(
    (fromKey: string, toKey: string) => {
      const ordem = [...colunasVisiveis]
      const fromIdx = ordem.indexOf(fromKey)
      const toIdx   = ordem.indexOf(toKey)
      if (fromIdx === -1 || toIdx === -1) return
      const [item] = ordem.splice(fromIdx, 1)
      ordem.splice(toIdx, 0, item)
      const prefs: GTPreferencias = {
        ...(preferencias ?? {}),
        colunas_visiveis: ordem,
      }
      onSalvarPreferencias?.(prefs)
    },
    [colunasVisiveis, preferencias, onSalvarPreferencias],
  )

  const selecionarTodasColunas = useCallback(() => {
    const todas = colunas.map(c => c.key)
    onSalvarPreferencias?.({ ...(preferencias ?? {}), colunas_visiveis: todas })
  }, [colunas, preferencias, onSalvarPreferencias])

  const restaurarPadraoColunas = useCallback(() => {
    const padrao = colunas.filter(c => !c.oculta).map(c => c.key)
    onSalvarPreferencias?.({ ...(preferencias ?? {}), colunas_visiveis: padrao })
  }, [colunas, preferencias, onSalvarPreferencias])

  // ── Larguras de colunas (resize) ──────────────────────────────────────────────
  const [larguraColunas, setLarguraColunas] = useState<Record<string, number>>(
    () => preferencias?.larguras ?? {}
  )
  const largurasPref = preferencias?.larguras
  useEffect(() => {
    setLarguraColunas(largurasPref ?? {})
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [largurasPref])

  const [resizingCol, setResizingCol] = useState<{
    key: string
    startX: number
    startWidth: number
  } | null>(null)
  const rafRef = useRef<number | null>(null)

  const getColWidth = useCallback(
    (col: GTColuna<unknown>): number => {
      const saved = larguraColunas[col.key]
      if (saved != null) return saved
      if (typeof col.largura === 'number') return col.largura
      if (typeof col.largura === 'string') return parseInt(col.largura, 10) || 150
      return 150
    },
    [larguraColunas]
  )

  // ── Overlay de edição ─────────────────────────────────────────────────────────
  const [overlayInfo, setOverlayInfo] = useState<{
    rect: DOMRect
    id: string
    campo: string
    isFilho: boolean
    colLabel: string
  } | null>(null)

  // ── Expand/collapse ───────────────────────────────────────────────────────────
  const { expandidos, filhosCache, carregandoFilhos, toggle, atualizarFilhoNoCache } = useGTExpandir<T, C>(
    onCarregarFilhos,
  )

  // ── Largura total e offsets para scroll horizontal ────────────────────────────
  const CABECALHO_HEIGHT = 40

  const larguraTotalColunas = useMemo(() => {
    const colsW = colunasFiltradas.reduce(
      (acc, col) => acc + getColWidth(col as GTColuna<unknown>),
      0
    )
    const checkW = acoesLote && acoesLote.length > 0 ? 40 : 0
    const expandW = onCarregarFilhos != null ? 40 : 0
    const acoesW  = acoes && acoes.length > 0 ? acoes.length * 32 + 16 : 0
    return colsW + checkW + expandW + acoesW
  }, [colunasFiltradas, acoesLote, onCarregarFilhos, acoes, getColWidth])

  /** left offset das colunas de dados frozen (após checkbox + expand) */
  const offsetFrozenDados = useMemo(() => {
    const checkW = acoesLote && acoesLote.length > 0 ? 40 : 0
    const expandW = onCarregarFilhos != null ? 40 : 0
    return checkW + expandW
  }, [acoesLote, onCarregarFilhos])

  // ── Seleção ───────────────────────────────────────────────────────────────────
  const {
    selecionados,
    toggleItem,
    toggleTodos,
    limpar: limparSelecao,
    todosSelecionados,
    parcialmnteSelecionados,
    selecionadosArray,
  } = useGTSelecao()

  const todosIds = useMemo(() => dados.map(itemId), [dados, itemId])

  // ── Edição inline ─────────────────────────────────────────────────────────────
  const {
    editandoCelula: editandoCelulaPai,
    valorEditando: valorEditandoPai,
    salvando: salvandoPai,
    iniciarEdicao: iniciarEdicaoPai,
    atualizarValor: atualizarValorPai,
    confirmarEdicao: confirmarEdicaoPai,
    cancelarEdicao: cancelarEdicaoPai,
  } = useGTInlineEdit<T>(
    onEditar,
    undefined,
    onSalvoComSucesso,
    onErroAoSalvar,
  )

  const atualizarFilhoCacheCallback = useCallback(
    (filho: C) => atualizarFilhoNoCache(filho, filhoId),
    [atualizarFilhoNoCache, filhoId],
  )

  const {
    editandoCelula: editandoCelulaFilho,
    valorEditando: valorEditandoFilho,
    salvando: salvandoFilho,
    iniciarEdicao: iniciarEdicaoFilho,
    atualizarValor: atualizarValorFilho,
    confirmarEdicao: confirmarEdicaoFilho,
    cancelarEdicao: cancelarEdicaoFilho,
  } = useGTInlineEdit<C>(
    onEditarFilho,
    atualizarFilhoCacheCallback,
    onSalvoComSucesso,
    onErroAoSalvar,
  )

  // ── Flat rows para o virtualizador ────────────────────────────────────────────
  const linhasVirtuais = useMemo(
    () => buildFlatRows<T, C>(dados, expandidos, filhosCache, itemId, filhoId),
    [dados, expandidos, filhosCache, itemId, filhoId],
  )

  // ── TanStack Virtual ──────────────────────────────────────────────────────────
  const parentRef = useRef<HTMLDivElement>(null)

  const virtualizer = useVirtualizer({
    count: linhasVirtuais.length,
    getScrollElement: () => parentRef.current,
    estimateSize: (i) =>
      linhasVirtuais[i]?.tipo === 'filho' ? childRowHeight : rowHeight,
    overscan,
    paddingStart: CABECALHO_HEIGHT,
  })

  // ── Load more via intersection ────────────────────────────────────────────────
  const sentinelaRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!temMais || !onCarregarMais || carregandoMais) return

    const el = sentinelaRef.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) onCarregarMais()
      },
      { root: parentRef.current, threshold: 0.1 },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [temMais, carregandoMais, onCarregarMais])

  // ── Itens selecionados (objetos) ──────────────────────────────────────────────
  const itensSelecionados = useMemo(
    () => dados.filter(item => selecionados.has(itemId(item))),
    [dados, selecionados, itemId],
  )

  useEffect(() => {
    onSelecaoMudar?.(itensSelecionados)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [itensSelecionados])

  // ── Fechar menus ao clicar fora ───────────────────────────────────────────────
  useEffect(() => {
    if (!exportAberto) return
    function fora(e: MouseEvent) {
      setExportAberto(false)
    }
    document.addEventListener('mousedown', fora)
    return () => document.removeEventListener('mousedown', fora)
  }, [exportAberto])

  // ── Fechar overlay ao sair do modo edição ────────────────────────────────────
  useEffect(() => {
    if (!editandoCelulaPai && !editandoCelulaFilho) {
      setOverlayInfo(null)
    }
  }, [editandoCelulaPai, editandoCelulaFilho])

  // ── Resize handle — mousemove/mouseup no document ─────────────────────────────
  useEffect(() => {
    if (!resizingCol) return

    function onMouseMove(e: MouseEvent) {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current)
      rafRef.current = requestAnimationFrame(() => {
        const delta = e.clientX - resizingCol!.startX
        const novaLargura = Math.max(60, resizingCol!.startWidth + delta)
        setLarguraColunas(prev => ({ ...prev, [resizingCol!.key]: novaLargura }))
      })
    }

    function onMouseUp(e: MouseEvent) {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current)
        rafRef.current = null
      }
      const delta = e.clientX - resizingCol.startX
      const novaLargura = Math.max(60, resizingCol.startWidth + delta)
      setLarguraColunas(prev => {
        const novas = { ...prev, [resizingCol!.key]: novaLargura }
        onSalvarPreferencias?.({
          ...(preferencias ?? {}),
          colunas_visiveis: colunasVisiveis,
          larguras: novas,
        })
        return novas
      })
      setResizingCol(null)
    }

    document.addEventListener('mousemove', onMouseMove)
    document.addEventListener('mouseup', onMouseUp)
    return () => {
      document.removeEventListener('mousemove', onMouseMove)
      document.removeEventListener('mouseup', onMouseUp)
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current)
        rafRef.current = null
      }
    }
  }, [resizingCol, onSalvarPreferencias, preferencias, colunasVisiveis])

  // ─── Renderização de célula ──────────────────────────────────────────────────

  function renderCelula<I>(
    item: I,
    id: string,
    col: GTColuna<I>,
    isFilho: boolean,
  ) {
    const valor = (item as Record<string, unknown>)[col.key]

    const editandoCelula  = isFilho ? editandoCelulaFilho  : editandoCelulaPai
    const valorEditando   = isFilho ? valorEditandoFilho   : valorEditandoPai
    const salvando        = isFilho ? salvandoFilho        : salvandoPai
    const iniciarEdicao   = isFilho ? iniciarEdicaoFilho   : iniciarEdicaoPai
    const atualizarValor  = isFilho ? atualizarValorFilho  : atualizarValorPai
    const confirmarEdicao = isFilho ? confirmarEdicaoFilho : confirmarEdicaoPai
    const cancelarEdicao  = isFilho ? cancelarEdicaoFilho  : cancelarEdicaoPai

    const podeEditar =
      ((isFilho ? camposEditaveisFilhos : camposEditaveis).includes(col.key) || col.editavel) &&
      !!(isFilho ? onEditarFilho : onEditar)
    const estaEditando =
      editandoCelula?.id === id && editandoCelula?.campo === col.key

    const classeAlinhamento = col.align === 'center'
      ? ' gtv-celula--center'
      : col.align === 'right'
        ? ' gtv-celula--right'
        : ''

    const classeIndent   = isFilho ? ' gtv-celula--filho-indent' : ''
    const classeEditavel = podeEditar ? ' gtv-celula--editavel' : ''
    const classeFrozen   = col.frozen ? ' gtv-celula--frozen' : ''

    const styleCelula: React.CSSProperties = {
      flex: `0 0 ${getColWidth(col as GTColuna<unknown>)}px`,
      ...(col.frozen ? { left: offsetFrozenDados } : undefined),
    }

    // Overlay está ativo para esta célula específica
    const overlayAtivo = overlayInfo?.id === id && overlayInfo?.campo === col.key

    // Conteúdo renderizado da célula (fora do estado de edição)
    const innerContent = col.render ? col.render(valor, item) : String(valor ?? '')

    // Tooltip: só para células sem render customizado (texto puro).
    // Células com render (badges, ícones) já são auto-descritivas.
    // A descrição usa o valor bruto; fallback para dica de edição.
    const tooltipDescr = !col.render && !estaEditando && !overlayAtivo
      ? (valor != null && valor !== ''
          ? String(valor)
          : podeEditar ? 'Clique para editar' : undefined)
      : undefined

    // Para células com tooltip: o TooltipGlobal envolve um <span> simples.
    // Para células sem tooltip: renderiza o conteúdo diretamente.
    // Não usamos gtv-celula-conteudo (evita dependência circular de width).
    const celConteudo = tooltipDescr ? (
      <TooltipGlobal titulo={col.label} descricao={tooltipDescr}>
        <span className="gtv-celula-text">{innerContent as string}</span>
      </TooltipGlobal>
    ) : (
      <>{innerContent}</>
    )

    return (
      <div
        key={col.key}
        className={`gtv-celula${classeAlinhamento}${classeIndent}${classeEditavel}${classeFrozen}`}
        style={styleCelula}
        onClick={e => {
          if (podeEditar && !estaEditando) {
            e.stopPropagation()
            const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
            setOverlayInfo({ rect, id, campo: col.key, isFilho, colLabel: col.label })
            iniciarEdicao(id, col.key, valor)
          }
        }}
      >
        {estaEditando && overlayAtivo ? (
          // Overlay ativo: mostra indicador visual, o input real está no popover flutuante
          <span className="gtv-celula--editando-overlay">
            {String(valorEditando ?? '')}
          </span>
        ) : estaEditando ? (
          <input
            autoFocus
            className="gtv-celula-input"
            value={String(valorEditando ?? '')}
            disabled={salvando}
            onChange={e => atualizarValor(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter') { e.preventDefault(); confirmarEdicao() }
              if (e.key === 'Escape') cancelarEdicao()
            }}
            onBlur={() => confirmarEdicao()}
            onClick={e => e.stopPropagation()}
          />
        ) : (
          celConteudo
        )}
      </div>
    )
  }

  // ─── Renderização de linha ───────────────────────────────────────────────────

  function renderLinhaPai(linha: GTLinhaVirtual<T, C> & { tipo: 'pai' }) {
    const { item, id } = linha
    const expandido = expandidos.has(id)
    const carregando_ = carregandoFilhos.has(id)
    const selecionado = selecionados.has(id)
    const temFilhos = onCarregarFilhos != null || (filhosCache.get(id)?.length ?? 0) > 0

    const classeLinha = [
      'gtv-linha',
      'gtv-linha--pai',
      expandido ? 'gtv-linha--expandida' : '',
      selecionado ? 'gtv-linha--selecionada' : '',
    ].filter(Boolean).join(' ')

    return (
      <div className={classeLinha}>
        {/* Checkbox */}
        {acoesLote && acoesLote.length > 0 && (
          <div className="gtv-celula gtv-celula--check gtv-celula--frozen" style={{ left: 0 }}>
            <input
              type="checkbox"
              className="gtv-checkbox"
              checked={selecionados.has(id)}
              aria-label={`Selecionar linha`}
              onChange={() => toggleItem(id)}
              onClick={e => e.stopPropagation()}
            />
          </div>
        )}

        {/* Botão expand */}
        {onCarregarFilhos && (
          <div
            className="gtv-celula gtv-celula--expand gtv-celula--frozen"
            style={{ left: acoesLote && acoesLote.length > 0 ? 40 : 0 }}
          >
            {carregando_ ? (
              <span className="gtv-spinner" aria-label="Carregando filhos..." />
            ) : (
              <button
                className="gtv-chevron-btn"
                aria-expanded={expandido}
                aria-label={expandido ? 'Colapsar' : 'Expandir'}
                onClick={e => {
                  e.stopPropagation()
                  toggle(id, item)
                }}
              >
                <span className={`gtv-chevron-icon${expandido ? ' gtv-chevron-icon--aberto' : ''}`}>
                  <IconeChevron />
                </span>
              </button>
            )}
          </div>
        )}

        {/* Células de dados */}
        {colunasFiltradas.map(col =>
          renderCelula<T>(item, id, col as GTColuna<T>, false)
        )}

        {/* Ações de linha */}
        {acoes && acoes.length > 0 && (
          <div className="gtv-celula gtv-celula--acoes">
            <div className="gtv-acoes-grupo">
              {acoes.map(acao => {
                if (acao.visivel && !acao.visivel(item)) return null
                if (acao.renderCustom) {
                  return <span key={acao.id}>{acao.renderCustom(item)}</span>
                }
                return (
                  <button
                    key={acao.id}
                    className={`gtv-acao-btn${acao.variant === 'danger' ? ' gtv-acao-btn--danger' : ''}`}
                    title={acao.tooltip}
                    aria-label={acao.tooltip}
                    onClick={e => {
                      e.stopPropagation()
                      acao.onClick?.(item)
                    }}
                  >
                    {acao.icone}
                  </button>
                )
              })}
            </div>
          </div>
        )}
      </div>
    )
  }

  function renderLinhaFilha(linha: GTLinhaVirtual<T, C> & { tipo: 'filho' }) {
    const { item, id } = linha
    const colsFilhas = colunasFilhas ?? (colunasFiltradas as unknown as GTColuna<C>[])

    return (
      <div className="gtv-linha gtv-linha--filho">
        {/* Espaço para alinhar com checkbox pai */}
        {acoesLote && acoesLote.length > 0 && (
          <div className="gtv-celula gtv-celula--check gtv-celula--frozen" style={{ left: 0 }} />
        )}

        {/* Conector hierárquico */}
        {onCarregarFilhos && (
          <div
            className="gtv-celula gtv-celula--expand gtv-celula--frozen"
            style={{ left: acoesLote && acoesLote.length > 0 ? 40 : 0 }}
          >
            <span className="gtv-conector" aria-hidden="true">└</span>
          </div>
        )}

        {/* Células filhas */}
        {colsFilhas.map(col =>
          renderCelula<C>(item, id, col, true)
        )}

        {/* Ações de linha filha */}
        {acoesFilhas && acoesFilhas.length > 0 && (
          <div className="gtv-celula gtv-celula--acoes">
            <div className="gtv-acoes-grupo">
              {acoesFilhas.map(acao => {
                if (acao.visivel && !acao.visivel(item)) return null
                if (acao.renderCustom) {
                  return <span key={acao.id}>{acao.renderCustom(item)}</span>
                }
                return (
                  <button
                    key={acao.id}
                    className={`gtv-acao-btn${acao.variant === 'danger' ? ' gtv-acao-btn--danger' : ''}`}
                    title={acao.tooltip}
                    aria-label={acao.tooltip}
                    onClick={e => {
                      e.stopPropagation()
                      acao.onClick?.(item)
                    }}
                  >
                    {acao.icone}
                  </button>
                )
              })}
            </div>
          </div>
        )}
      </div>
    )
  }

  // ─── Render principal ────────────────────────────────────────────────────────

  const totalSize = virtualizer.getTotalSize()
  const virtualItems = virtualizer.getVirtualItems()

  const todosSel = todosSelecionados(todosIds)
  const parcialSel = parcialmnteSelecionados(todosIds)

  return (
    <div
      className={`gtv-container${resizingCol ? ' gtv-container--resizing' : ''}`}
      role="region"
      aria-label={ariaLabel}
    >
      {/* Abas de status */}
      {abas && abas.length > 0 && (
        <GTAbas abas={abas} abaAtiva={abaAtiva} onMudarAba={onMudarAba} />
      )}

      {/* Toolbar */}
      <div className="gtv-toolbar">
        <div className="gtv-toolbar-esquerda">
          {/* Busca */}
          {onBuscar && (
            <div className="gtv-busca-wrapper">
              <span className="gtv-busca-icone"><IconeBusca /></span>
              <input
                type="search"
                className="gtv-busca-input"
                placeholder={placeholderBusca}
                value={termoBusca}
                onChange={handleBusca}
                aria-label="Buscar"
              />
              {termoBusca && (
                <button className="gtv-busca-clear" onClick={limparBusca} aria-label="Limpar busca">
                  <IconeX />
                </button>
              )}
            </div>
          )}

          {/* Slot de ações da barra */}
          {acoesBarra}

          {/* Indicador de salvamento */}
          {(salvandoPai || salvandoFilho) && (
            <span className="gtv-salvando" aria-live="polite">
              <span className="gtv-spinner" aria-hidden="true" />
              Salvando...
            </span>
          )}
        </div>

        <div className="gtv-toolbar-direita">
          {/* Visibilidade de colunas */}
          {onSalvarPreferencias && (
            <div style={{ position: 'relative' }}>
              <button
                className={`gtv-btn${colunasAbertas ? ' gtv-btn--ativo' : ''}`}
                onClick={() => setColunasAbertas(v => !v)}
                aria-label="Gerenciar colunas"
                title="Colunas"
              >
                <IconeColunas />
                Colunas
              </button>
              {colunasAbertas && (
                <GTVisibilidadeColunas
                  colunas={colunas}
                  colunasVisiveis={colunasVisiveis}
                  onToggle={toggleColuna}
                  onFechar={() => setColunasAbertas(false)}
                  onReordenar={onSalvarPreferencias ? reorderColuna : undefined}
                  onSelecionarTodos={selecionarTodasColunas}
                  onRestaurarPadrao={restaurarPadraoColunas}
                />
              )}
            </div>
          )}

          {/* Export */}
          {acoesExportacao && acoesExportacao.length > 0 && (
            <div className="gtv-export-wrapper">
              <button
                className={`gtv-btn${exportAberto ? ' gtv-btn--ativo' : ''}`}
                onClick={e => {
                  e.stopPropagation()
                  setExportAberto(v => !v)
                }}
                aria-label="Exportar"
                title="Exportar"
              >
                <IconeExport />
                Exportar
              </button>
              {exportAberto && (
                <div className="gtv-export-menu">
                  {acoesExportacao.map((acao, i) => (
                    <button
                      key={i}
                      className="gtv-export-item"
                      onClick={() => {
                        acao.onClick()
                        setExportAberto(false)
                      }}
                    >
                      {acao.icone}
                      {acao.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Barra de ações em lote */}
      {acoesLote && acoesLote.length > 0 && selecionadosArray.length > 0 && (
        <div className="gtv-lote-bar" role="toolbar" aria-label="Ações em lote">
          <span className="gtv-lote-info">
            {selecionadosArray.length} {selecionadosArray.length === 1 ? 'item selecionado' : 'itens selecionados'}
          </span>
          <div className="gtv-lote-acoes">
            {acoesLote.map(acao => (
              <button
                key={acao.id}
                className={`gtv-lote-btn${acao.variant === 'danger' ? ' gtv-lote-btn--danger' : ''}`}
                onClick={() => {
                  acao.onClick(itensSelecionados)
                  limparSelecao()
                }}
              >
                {acao.icone}
                {acao.label}
              </button>
            ))}
            <button
              className="gtv-lote-btn gtv-lote-btn--ghost"
              onClick={limparSelecao}
              aria-label="Cancelar seleção"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Skeleton de carregamento */}
      {carregando ? (
        <GTSkeleton rowHeight={rowHeight} />
      ) : (
        <div
          ref={parentRef}
          className="gtv-tabela-scroll"
          role="rowgroup"
          aria-label="Linhas da tabela"
        >
          {/* Cabeçalho sticky — dentro do scroll para alinhar horizontalmente */}
          <div className="gtv-cabecalho" role="row" style={{ minWidth: larguraTotalColunas }}>
            {/* Checkbox cabeçalho */}
            {acoesLote && acoesLote.length > 0 && (
              <div className="gtv-th gtv-th--check gtv-th--frozen" role="columnheader" aria-label="Selecionar todos" style={{ left: 0 }}>
                <input
                  type="checkbox"
                  className="gtv-checkbox"
                  checked={todosSel}
                  ref={el => {
                    if (el) el.indeterminate = parcialSel
                  }}
                  aria-label="Selecionar todos"
                  onChange={() => toggleTodos(todosIds)}
                />
              </div>
            )}

            {/* Expand col */}
            {onCarregarFilhos && (
              <div
                className="gtv-th gtv-th--expand gtv-th--frozen"
                role="columnheader"
                style={{ left: acoesLote && acoesLote.length > 0 ? 40 : 0 }}
              />
            )}

            {/* Colunas de dados */}
            {colunasFiltradas.map(col => {
              const sortAtivo   = sortLocal?.campo === col.key
              const classeSort  = col.sortavel
                ? ` gtv-th--sort${sortAtivo ? ' gtv-th--sorted' : ''}`
                : ''
              const classeAlign = col.align === 'center'
                ? ' gtv-th--center'
                : col.align === 'right'
                  ? ' gtv-th--right'
                  : ''
              const classeFrozen = col.frozen ? ' gtv-th--frozen' : ''
              const colWidth = getColWidth(col as GTColuna<unknown>)

              const styleTh: React.CSSProperties = {
                flex: `0 0 ${colWidth}px`,
                ...(col.frozen ? { left: offsetFrozenDados } : undefined),
              }

              return (
                <div
                  key={col.key}
                  role="columnheader"
                  className={`gtv-th${classeSort}${classeAlign}${classeFrozen}`}
                  style={styleTh}
                  onClick={() => col.sortavel && handleSort(col.key)}
                  aria-sort={
                    sortAtivo
                      ? sortLocal?.dir === 'asc'
                        ? 'ascending'
                        : 'descending'
                      : undefined
                  }
                >
                  {col.label}
                  {col.sortavel && (
                    <span className={`gtv-sort-icon${!sortAtivo ? ' gtv-sort-icon--idle' : ''}`}>
                      {sortAtivo ? (
                        sortLocal?.dir === 'asc' ? <IconeArrowUp /> : <IconeArrowDown />
                      ) : (
                        <em>↕</em>
                      )}
                    </span>
                  )}
                  {/* Resize handle */}
                  <div
                    className="gtv-th-resize-handle"
                    onMouseDown={e => {
                      e.stopPropagation()
                      e.preventDefault()
                      setResizingCol({ key: col.key, startX: e.clientX, startWidth: colWidth })
                    }}
                    onDoubleClick={e => {
                      e.stopPropagation()
                      // Reset para largura padrão
                      setLarguraColunas(prev => {
                        const novo = { ...prev }
                        delete novo[col.key]
                        return novo
                      })
                      if (onSalvarPreferencias && preferencias) {
                        const novas = { ...larguraColunas }
                        delete novas[col.key]
                        onSalvarPreferencias({ ...preferencias, colunas_visiveis: colunasVisiveis, larguras: novas })
                      }
                    }}
                    title="Arrastar para redimensionar · Duplo clique para resetar"
                    aria-hidden="true"
                  />
                </div>
              )
            })}

            {/* Ações col */}
            {acoes && acoes.length > 0 && (
              <div className="gtv-th gtv-th--acoes" role="columnheader" />
            )}
          </div>

          {dados.length === 0 ? (
            /* Estado vazio */
            <GTVazio
              emptyIcon={emptyIcon}
              emptyTitle={emptyTitle}
              emptyDescription={emptyDescription}
              emptyAction={emptyAction}
            />
          ) : (
            <div
              className="gtv-tabela-inner"
              style={{ height: totalSize, minWidth: larguraTotalColunas }}
            >
              {virtualItems.map(virtualItem => {
                const linha = linhasVirtuais[virtualItem.index]
                if (!linha) return null

                return (
                  <div
                    key={virtualItem.key}
                    data-index={virtualItem.index}
                    ref={virtualizer.measureElement}
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: larguraTotalColunas,
                      transform: `translateY(${virtualItem.start}px)`,
                    }}
                    role="row"
                  >
                    {linha.tipo === 'pai'
                      ? renderLinhaPai(linha as GTLinhaVirtual<T, C> & { tipo: 'pai' })
                      : renderLinhaFilha(linha as GTLinhaVirtual<T, C> & { tipo: 'filho' })}
                  </div>
                )
              })}

              {/* Sentinela para infinite scroll */}
              {temMais && (
                <div
                  ref={sentinelaRef}
                  style={{ height: 1, position: 'absolute', bottom: 0, width: '100%' }}
                  aria-hidden="true"
                />
              )}
            </div>
          )}
        </div>
      )}

      {/* Rodapé: carregar mais — fora do scroll para não deslocar */}
      {!carregando && temMais && onCarregarMais && (
        <div className="gtv-rodape">
          <button
            className="gtv-carregar-mais-btn"
            disabled={carregandoMais}
            onClick={onCarregarMais}
          >
            {carregandoMais ? (
              <>
                <span className="gtv-spinner" />
                Carregando...
              </>
            ) : (
              'Carregar mais'
            )}
          </button>
        </div>
      )}

      {/* Overlay de edição — portal direto no body para evitar problemas de stacking context */}
      {overlayInfo != null && (editandoCelulaPai != null || editandoCelulaFilho != null) && createPortal(
        <GTEditPopover
          overlayInfo={overlayInfo}
          valorEditando={overlayInfo.isFilho ? valorEditandoFilho : valorEditandoPai}
          salvando={overlayInfo.isFilho ? salvandoFilho : salvandoPai}
          onAtualizar={overlayInfo.isFilho ? atualizarValorFilho : atualizarValorPai}
          onConfirmar={overlayInfo.isFilho ? confirmarEdicaoFilho : confirmarEdicaoPai}
          onCancelar={overlayInfo.isFilho ? cancelarEdicaoFilho : cancelarEdicaoPai}
        />,
        document.body
      )}
    </div>
  )
}

export default TabelaVirtualGlobal
