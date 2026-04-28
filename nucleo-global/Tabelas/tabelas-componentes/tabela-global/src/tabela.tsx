import React, { useState, useMemo, useRef, useEffect, useCallback, memo } from 'react'
import { BotaoCompletoExportar } from '@nucleo/tabela-virtual-global'
import { useTranslation } from 'react-i18next'
import ReactDOM from 'react-dom'
import { TooltipGlobal } from '@nucleo/tooltip-global'
import { Funnel, ArrowUp, ArrowDown, MagnifyingGlass, X, DownloadSimple, CheckSquare, Square, CaretDown, Columns, List, SquaresFour } from '@phosphor-icons/react'
import { KanbanGlobal } from '@nucleo/kanban-global'
import type { KanbanColunaDef } from '@nucleo/kanban-global'
import { CampoCalendarioGlobal } from '@nucleo/campo-calendario-global'
import { useTablePersistence } from './hooks/useTablePersistence'
import { SelectColunasGlobal } from '@nucleo/select-colunas-global'
import { ModalConfirmarExcluirGlobal } from '@nucleo/modal-confirmar-excluir-global'
import { ModalOverlay } from '@nucleo/modal-global'
import { ModalFormularioGlobal } from '@nucleo/modal-formulario-global'
import { ModalFormularioAbasGlobal } from '@nucleo/modal-formulario-abas-global'
import './tabela.css'

export type ColType = 'texto' | 'numero' | 'periodo'
export type SortDir = 'asc' | 'desc'

export interface TabelaGlobalColuna<T> {
  key: keyof T & string
  label: string
  tipo: ColType
  render?: (valor: unknown, item: T) => React.ReactNode
  tooltipTitulo?: string
  tooltipDescricao?: string
  largura?: string | number
  align?: 'left' | 'center' | 'right'
  /** Transforma o valor bruto em label legível no popover de filtro (checkboxes) */
  renderFiltroLabel?: (val: string) => string
  /** Renderiza JSX customizado para cada item do filtro (sobrepõe renderFiltroLabel) */
  renderFiltroItem?: (val: string) => React.ReactNode
}

export interface TabelaGlobalAcao<T> {
  id: string
  icone: React.ReactNode
  tooltip: string | ((item: T) => string)
  onClick: (item: T) => void
  disabled?: (item: T) => boolean
  onRenderStyle?: (item: T) => { background?: string; borderColor?: string; color?: string }
  renderCustom?: (item: T) => React.ReactNode
  /** Se definido, exibe modal de confirmação antes de executar onClick */
  confirmarExclusao?: {
    titulo?: string
    descricao?: string
    nomeItem?: (item: T) => string
  }
  /** Se definido, abre modal de visualização ao clicar (onClick não é chamado) */
  abrirVisualizar?: {
    titulo?: string | ((item: T) => string)
    subtitulo?: string | ((item: T) => string)
    icone?: React.ReactNode
    tamanho?: 'sm' | 'md' | 'lg' | 'xl'
    renderConteudo: (item: T) => React.ReactNode
  }
  /** Se definido, abre modal de edição ao clicar (onClick não é chamado) */
  abrirEditar?: {
    titulo?: string | ((item: T) => string)
    subtitulo?: string | ((item: T) => string)
    icone?: React.ReactNode
    tamanho?: 'sm' | 'md' | 'lg' | 'xl'
    textoSalvar?: string
    renderConteudo: (item: T) => React.ReactNode
    aoSalvar?: (item: T) => void
  }
}

export interface TabelaExportAcao<T> {
  label: string
  icone: React.ReactNode
  onClick: (dadosVisiveis: T[]) => void
  tooltipDescricao?: string
}

export interface TabelaKanbanConfig<T> {
  /** Definições de colunas (status lanes) do kanban */
  colunas: KanbanColunaDef[]
  /** Renderiza o conteúdo do card. O item deve ter `id: string` e `colunaKey: string`. */
  renderCard: (item: T, isDragging: boolean) => React.ReactNode
  /** Callback quando item muda de coluna */
  onMoverItem?: (itemId: string, novaColunaKey: string, posicao: number) => void | Promise<void>
  /** Callback quando itens são reordenados dentro de uma coluna */
  onReorderItem?: (colunaKey: string, itemIds: string[]) => void | Promise<void>
  /** Callback ao clicar num card */
  onCardClick?: (item: T) => void
  /** Extrai rótulo textual para ordenação alfabética */
  getItemLabel?: (item: T) => string
  /** Extrai data para ordenação cronológica */
  getItemDate?: (item: T) => string | Date | undefined
  /** Texto para estado vazio */
  emptyLabel?: string
  /** Estado de carregamento */
  carregando?: boolean
}

export interface TabelaGlobalProps<T extends Record<string, any>> {
  dados: T[]
  colunas: TabelaGlobalColuna<T>[]
  acoes?: TabelaGlobalAcao<T>[]
  acoesExportacao?: TabelaExportAcao<T>[]
  idKey?: keyof T & string // Padrão "id"
  mensagemVazio?: string
  mensagemSemFiltro?: string
  renderExpandido?: (item: T) => React.ReactNode
  tooltipExpandir?: string | ((item: T) => string)
  tooltipRecolher?: string | ((item: T) => string)
  tooltipBusca?: string

  // ─── Camadas (Hierarquia) ───
  /** Função que retorna os itens filhos de um registro */
  filhos?: (item: T) => any[]
  /** Colunas específicas para os registros filhos */
  colunasFilhas?: TabelaGlobalColuna<any>[]
  /** Ações específicas para os registros filhos */
  acoesFilhas?: TabelaGlobalAcao<any>[]
  /** IDs que devem iniciar expandidos */
  expandidosPadrao?: string[]
  /** ID único para persistência de colunas (localStorage) */
  id?: string
  /** Itens por página */
  itensPorPagina?: number
  /** Configuração da view Kanban. Se fornecida, exibe o seletor Lista/Kanban no toolbar. */
  kanban?: TabelaKanbanConfig<T>
  /** Quantidade de colunas de dados iniciais a congelar (sticky horizontal). A coluna de controle (checkbox/expand) é sempre congelada junto quando > 0. */
  frozenColunas?: number
}

type FiltrosStateVal = Set<string> | { min: string; max: string } | { inicio: Date | null; fim: Date | null }

function PopoverFiltro({
  tipo, coluna, label, filtros, ordenacao,
  valoresDisponiveis, valoresSelecionados,
  minMax, periodo,
  triggerRef,
  renderFiltroLabel,
  renderFiltroItem,
  onOrdenar, onToggleValor, onFiltrarNumero, onFiltrarPeriodo, onLimpar, onFechar,
}: {
  tipo: ColType, coluna: string, label: string
  filtros: unknown, ordenacao: unknown, valoresDisponiveis: string[], valoresSelecionados: Set<string>,
  minMax: { min: string; max: string }
  periodo: { inicio: Date | null; fim: Date | null }
  triggerRef: React.RefObject<HTMLButtonElement>
  renderFiltroLabel?: (val: string) => string
  renderFiltroItem?: (val: string) => React.ReactNode
  onOrdenar: (c: string, d: SortDir) => void
  onToggleValor: (c: string, v: string) => void
  onFiltrarNumero: (c: string, tipo: 'min' | 'max', v: string) => void
  onFiltrarPeriodo: (c: string, p: { inicio: Date | null; fim: Date | null }) => void
  onLimpar: () => void, onFechar: () => void
}) {
  const { t } = useTranslation()
  const ref = useRef<HTMLDivElement>(null)
  const [buscaLocal, setBuscaLocal] = useState('')
  const calcPos = () => {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect()
      // position:fixed → coords são relativas ao viewport (sem scrollX/scrollY)
      // Clamp left para não ultrapassar a borda direita da tela
      const left = Math.max(0, Math.min(rect.left, window.innerWidth - 292))
      return { top: rect.bottom + 4, left }
    }
    return { top: 0, left: 0 }
  }

  const [pos, setPos] = useState(calcPos)

  useEffect(() => { setPos(calcPos()) }, [triggerRef])

  useEffect(() => {
    function fora(e: MouseEvent) {
      const target = e.target as Element
      // Não fechar quando o clique é dentro de portais filhos (calendário, select dropdown)
      if (target.closest?.('.ws-calendario-panel') || target.closest?.('[id$="-portal"]') || target.closest?.('.sg-dropdown')) return
      if (
        ref.current && !ref.current.contains(e.target as Node) &&
        triggerRef.current && !triggerRef.current.contains(e.target as Node)
      ) onFechar()
    }
    document.addEventListener('mousedown', fora)
    return () => document.removeEventListener('mousedown', fora)
  }, [onFechar, triggerRef])

  const sortAtivo = ordenacao?.coluna === coluna

  const valoresFiltrados = useMemo(() =>
    buscaLocal.trim()
      ? valoresDisponiveis.filter(v => v.toLowerCase().includes(buscaLocal.toLowerCase()))
      : valoresDisponiveis,
    [valoresDisponiveis, buscaLocal]
  )

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '0.375rem 0.5rem 0.375rem 1.75rem',
    background: 'rgba(129,140,248,0.05)', border: '1px solid var(--ws-accent-border)',
    borderRadius: '6px', color: '#f1f5f9', fontSize: '0.8125rem',
    fontFamily: 'inherit', outline: 'none',
  }

  const pillStyle = (ativo: boolean): React.CSSProperties => ({
    flex: 1, display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    gap: '0.3rem', padding: '0.375rem 0.5rem', borderRadius: '9999px',
    background: ativo ? 'rgba(129,140,248,0.15)' : 'rgba(255,255,255,0.04)',
    border: `1px solid ${ativo ? 'rgba(129,140,248,0.35)' : 'rgba(255,255,255,0.1)'}`,
    color: ativo ? '#818cf8' : '#94a3b8',
    fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer',
    fontFamily: 'inherit', transition: 'all 0.12s', whiteSpace: 'nowrap'
  })

  const style: React.CSSProperties = {
    position: 'fixed', top: pos.top, left: pos.left, zIndex: 9999,
    background: 'var(--ws-surface, #1e293b)', border: '1px solid var(--ws-accent-border)',
    borderRadius: '10px', boxShadow: '0 12px 32px rgba(0,0,0,0.6)',
    minWidth: '220px', maxWidth: '280px', fontFamily: 'var(--font, Plus Jakarta Sans)',
  }

  return ReactDOM.createPortal(
    <div ref={ref} style={style} className="tg-popover-filtro" onClick={e => e.stopPropagation()}>
      <div style={{ padding: '0.4rem 0.875rem', borderBottom: '1px solid var(--ws-accent-border)' }}>
        <span style={{ fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#64748b' }}>{label}</span>
      </div>

      <div style={{ padding: '0.5rem 0.625rem', borderBottom: '1px solid var(--ws-accent-border)' }}>
        <p style={{ fontSize: '0.6rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#475569', marginBottom: '0.375rem' }}>{t('tabela.ordenar')}</p>
        <div style={{ display: 'flex', gap: '0.375rem' }}>
          {([['asc', t('tabela.crescente'), <ArrowUp key="u" size={12} weight="bold" />], ['desc', t('tabela.decrescente'), <ArrowDown key="d" size={12} weight="bold" />]] as [SortDir, string, React.ReactNode][]).map(([dir, rot, ico]) => {
            const ativo = sortAtivo && ordenacao?.direcao === dir
            return (
              <button key={dir} type="button" onClick={() => { onOrdenar(coluna, dir); onFechar() }} style={pillStyle(ativo)}
                onMouseEnter={e => { if (!ativo) { e.currentTarget.style.background = 'rgba(129,140,248,0.08)'; e.currentTarget.style.borderColor = 'rgba(129,140,248,0.2)'; e.currentTarget.style.color = '#f1f5f9' } }}
                onMouseLeave={e => { if (!ativo) { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = '#94a3b8' } }}>
                {ico} {rot}
              </button>
            )
          })}
        </div>
      </div>

      {tipo === 'texto' && (
        <div style={{ borderBottom: '1px solid var(--ws-accent-border)' }}>
          <p style={{ padding: '0.45rem 0.875rem 0.25rem', fontSize: '0.6rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#475569' }}>{t('tabela.filtrar_por')}</p>
          {valoresDisponiveis.length > 5 && (
              <TooltipGlobal descricao={t('tabela.pesquisar_valores')}>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <span style={{ position: 'absolute', left: '0.45rem', top: '50%', transform: 'translateY(-50%)', color: '#64748b', display: 'flex', lineHeight: 0 }}>
                    <MagnifyingGlass size={11} weight="bold" />
                  </span>
                  <input type="text" placeholder={t('tabela.buscar')} value={buscaLocal}
                    onChange={e => setBuscaLocal(e.target.value)}
                    style={{ ...inputStyle, paddingLeft: '1.6rem', fontSize: '0.75rem' }}
                    onFocus={e => { e.currentTarget.style.borderColor = '#818cf8' }}
                    onBlur={e => { e.currentTarget.style.borderColor = 'rgba(129,140,248,0.15)' }}
                  />
                </div>
              </TooltipGlobal>
          )}
          <div style={{ maxHeight: '180px', overflowY: 'auto', padding: '0.3rem 0.5rem', scrollbarWidth: 'thin', scrollbarColor: '#334155 transparent' }}>
            {valoresFiltrados.length === 0 ? (
              <p style={{ fontSize: '0.75rem', color: '#475569', padding: '0.5rem', textAlign: 'center' }}>{t('tabela.sem_valor')}</p>
            ) : valoresFiltrados.map(v => {
              const selecionado = valoresSelecionados.has(v)
              return (
                <label key={v}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.35rem 0.375rem', cursor: 'pointer', borderRadius: '6px', transition: 'background 0.1s' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(129,140,248,0.06)' }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent' }}
                >
                  <span style={{ color: selecionado ? '#818cf8' : '#475569', display: 'flex', lineHeight: 0, flexShrink: 0 }}>
                    {selecionado ? <CheckSquare size={15} weight="fill" /> : <Square size={15} weight="regular" />}
                  </span>
                  <input type="checkbox" checked={selecionado} onChange={() => onToggleValor(coluna, v)} style={{ display: 'none' }} />
                  {renderFiltroItem
                    ? <span style={{ display: 'flex', alignItems: 'center' }}>{renderFiltroItem(v)}</span>
                    : <span style={{ fontSize: '0.8125rem', color: '#cbd5e1', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{renderFiltroLabel ? renderFiltroLabel(v) : v}</span>
                  }
                </label>
              )
            })}
          </div>
        </div>
      )}

      {tipo === 'numero' && (
        <div style={{ padding: '0.5rem 0.625rem', borderBottom: '1px solid var(--ws-accent-border)' }}>
          <p style={{ fontSize: '0.6rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.375rem' }}>{t('tabela.intervalo')}</p>
          <div style={{ display: 'flex', gap: '0.375rem', alignItems: 'center' }}>
            {(['min', 'max'] as const).map((campo, i) => (
              <input key={campo}
                type="text" inputMode="numeric" pattern="[0-9]*"
                placeholder={i === 0 ? t('tabela.minimo') : t('tabela.maximo')}
                autoComplete="off"
                value={minMax[campo]}
                onChange={e => {
                  const v = e.target.value.replace(/[^0-9]/g, '')
                  onFiltrarNumero(coluna, campo, v)
                }}
                style={{ flex: 1, width: 0, padding: '0.375rem 0.5rem', background: 'rgba(129,140,248,0.05)', border: '1px solid var(--ws-accent-border)', borderRadius: '6px', color: '#f1f5f9', fontSize: '0.8125rem', fontFamily: 'inherit', outline: 'none' }}
                onFocus={e => { e.currentTarget.style.borderColor = '#818cf8' }}
                onBlur={e => { e.currentTarget.style.borderColor = 'rgba(129,140,248,0.15)' }}
              />
            ))}
          </div>
        </div>
      )}

      {tipo === 'periodo' && (
        <div style={{ padding: '0.625rem 0.5rem', borderBottom: '1px solid var(--ws-accent-border)' }}>
          <p style={{ fontSize: '0.6rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.375rem' }}>{t('tabela.selecionar_periodo')}</p>
          <CampoCalendarioGlobal
            valor={periodo as unknown as { inicio: Date | null; fim: Date | null }}
            aoMudarValor={(v: { inicio: Date | null; fim: Date | null }) => { onFiltrarPeriodo(coluna, v) }}
          />
        </div>
      )}

      <div style={{ padding: '0.375rem 0.5rem 0.3rem' }}>
        <button type="button" onClick={() => { onLimpar(); onFechar() }}
          style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', width: '100%', padding: '0.35rem 0.5rem', borderRadius: '6px', background: 'transparent', border: 'none', cursor: 'pointer', color: '#64748b', fontSize: '0.8125rem', fontFamily: 'inherit', transition: 'color 0.12s' }}
          onMouseEnter={e => { e.currentTarget.style.color = '#f87171' }}
          onMouseLeave={e => { e.currentTarget.style.color = '#64748b' }}>
          <X size={12} weight="bold" /> {t('tabela.limpar_filtro')}
        </button>
      </div>
    </div>,
    document.body
  )
}

function ThInner<T>({ col, filtros, ordenacao, dados, onOrdenar, onToggleValor, onFiltrarNumero, onFiltrarPeriodo, onLimparColuna, stickyLeft }: { col: TabelaGlobalColuna<T>, filtros: Record<string, FiltrosStateVal>, ordenacao: unknown, dados: T[], onOrdenar: unknown, onToggleValor: unknown, onFiltrarNumero: unknown, onFiltrarPeriodo: unknown, onLimparColuna: unknown, stickyLeft?: number }) {
  const [aberto, setAberto] = useState(false)
  const handleFechar = useCallback(() => setAberto(false), [])
  const triggerRef = useRef<HTMLButtonElement>(null)
  
  const coluna = col.key
  const sortAtivo = ordenacao?.coluna === coluna

  const valoresDisponiveis = useMemo(() => {
    const vals = dados.map(e => String(e[coluna as keyof T] ?? ''))
    return [...new Set(vals)].sort((a, b) => a.localeCompare(b, 'pt-BR'))
  }, [dados, coluna])

  const stateVal = filtros[coluna]
  const temFiltroAtivo = !stateVal ? false : col.tipo === 'texto' ? (stateVal as Set<string>).size > 0 
    : col.tipo === 'numero' ? !!((stateVal as {min: string, max: string}).min || (stateVal as {min: string, max: string}).max)
    : !!((stateVal as {inicio: Date | null, fim: Date | null}).inicio || (stateVal as {inicio: Date | null, fim: Date | null}).fim)

  const labelSpan = (
    <span style={{ color: sortAtivo ? '#818cf8' : undefined, lineHeight: 1, display: 'inline-block' }}>
      {col.label}
    </span>
  )

  return (
    <th style={{ width: col.largura, padding: '0.875rem 1rem', textAlign: col.align || 'center', whiteSpace: 'nowrap', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#ffffff', borderBottom: '2px solid rgba(129,140,248,0.2)', background: '#1e293b', position: 'sticky', top: 0, zIndex: stickyLeft !== undefined ? 3 : 2, ...(stickyLeft !== undefined ? { left: stickyLeft } : {}), userSelect: 'none', verticalAlign: 'middle' }}>
      <TooltipGlobal titulo={col.tooltipTitulo} descricao={col.tooltipDescricao || col.label}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem', justifyContent: col.align === 'right' ? 'flex-end' : col.align === 'left' ? 'flex-start' : 'center' }}>
          {labelSpan}
          <button ref={triggerRef} type="button" onClick={e => { e.stopPropagation(); setAberto(v => !v) }}
            style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 16, height: 16, borderRadius: '4px', background: temFiltroAtivo || aberto ? 'rgba(129,140,248,0.15)' : 'transparent', border: `1px solid ${temFiltroAtivo || aberto ? 'rgba(129,140,248,0.3)' : 'transparent'}`, cursor: 'pointer', padding: 0, flexShrink: 0, color: temFiltroAtivo || aberto ? '#818cf8' : '#94a3b8', transition: 'all 0.12s', lineHeight: 0, verticalAlign: 'middle' }}>
            <Funnel size={10} weight={temFiltroAtivo ? 'fill' : 'bold'} />
          </button>
        </div>
      </TooltipGlobal>
      {aberto && (
        <PopoverFiltro
          tipo={col.tipo} coluna={coluna} label={col.label}
          filtros={filtros} ordenacao={ordenacao}
          valoresDisponiveis={valoresDisponiveis}
          valoresSelecionados={col.tipo === 'texto' ? (stateVal as Set<string>) : new Set()}
          minMax={col.tipo === 'numero' ? (stateVal as {min: string, max: string}) : {min: '', max: ''}}
          periodo={col.tipo === 'periodo' ? (stateVal as {inicio: Date | null, fim: Date | null}) : {inicio: null, fim: null}}
          triggerRef={triggerRef}
          renderFiltroLabel={col.renderFiltroLabel}
          renderFiltroItem={col.renderFiltroItem}
          onOrdenar={onOrdenar}
          onToggleValor={onToggleValor}
          onFiltrarNumero={onFiltrarNumero}
          onFiltrarPeriodo={onFiltrarPeriodo}
          onLimpar={() => onLimparColuna(coluna)}
          onFechar={handleFechar}
        />
      )}
    </th>
  )
}
const Th = memo(ThInner) as typeof ThInner

// ─── Componentes Internos de Camadas ───

function IconeChevron() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
      <path d="M4 2L8 6L4 10" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

function renderCelulaCamada<T>(coluna: TabelaGlobalColuna<T>, item: T): React.ReactNode {
  const valor = (item as any)[coluna.key]
  if (coluna.render) return coluna.render(valor, item)
  return <span>{String(valor ?? '—')}</span>
}

function FiltroChip({ label, onRemover }: { label: string; onRemover: () => void }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', padding: '0.2rem 0.5rem 0.2rem 0.65rem', borderRadius: '9999px', background: 'rgba(199,210,254,0.1)', border: '1px solid rgba(199,210,254,0.25)', color: '#c7d2fe', fontSize: '0.75rem', fontWeight: 600, whiteSpace: 'nowrap' }}>
      {label}
      <button type="button" onClick={onRemover} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 14, height: 14, borderRadius: '50%', background: 'rgba(199,210,254,0.2)', border: 'none', cursor: 'pointer', color: '#c7d2fe', padding: 0, flexShrink: 0 }}>
        <X size={9} weight="bold" />
      </button>
    </span>
  )
}


export function TabelaGlobal<T extends Record<string, any>>(props: TabelaGlobalProps<T>) {
  const { t } = useTranslation()
  const {
    dados, colunas, acoes, acoesExportacao, idKey = 'id', mensagemVazio, mensagemSemFiltro,
    renderExpandido, tooltipExpandir, tooltipRecolher, tooltipBusca,
    filhos, colunasFilhas, acoesFilhas, expandidosPadrao = [], itensPorPagina = 10,
    id: tableId, kanban, frozenColunas = 0
  } = props

  const [viewMode, setViewMode] = useState<'lista' | 'kanban'>('lista')

  // ─── Visibilidade de Colunas (Persistência) ───
  const colunasConfig = useMemo(() => colunas.map(c => ({
    key: c.key,
    label: c.label,
  })), [colunas])

  const initialKeys        = useMemo(() => colunas.map(c => c.key), [colunas])
  const defaultHiddenKeys  = useMemo(() => colunas.filter(c => (c as any).oculta).map(c => c.key), [colunas])

  const {
    visibleKeys,
    isVisible,
    toggleVisibility,
    resetToDefault,
    setAllVisible,
    clearAllVisible
  } = useTablePersistence({
    tableId: tableId || 'default',
    initialKeys,
    defaultHiddenKeys,
  })

  const [columnOrder, setColumnOrder] = useState<string[]>(() => colunas.map(c => c.key))

  const colunasVisiveis = useMemo(() => {
    const base = tableId ? colunas.filter(c => isVisible(c.key)) : colunas
    return [...base].sort((a, b) => {
      const ai = columnOrder.indexOf(a.key)
      const bi = columnOrder.indexOf(b.key)
      if (ai === -1 && bi === -1) return 0
      if (ai === -1) return 1
      if (bi === -1) return -1
      return ai - bi
    })
  }, [colunas, tableId, isVisible, columnOrder])

  const theadRef = useRef<HTMLTableSectionElement>(null)
  const [stickyOffsets, setStickyOffsets] = useState<number[]>([])
  useEffect(() => {
    if (!frozenColunas || frozenColunas === 0 || !theadRef.current) { setStickyOffsets([]); return }
    const ths = Array.from(theadRef.current.querySelectorAll('th'))
    const checkboxW = ths[0]?.offsetWidth ?? 48
    const offsets: number[] = []
    let acc = checkboxW
    for (let i = 0; i < frozenColunas; i++) {
      offsets.push(acc)
      acc += ths[i + 1]?.offsetWidth ?? 0
    }
    setStickyOffsets(offsets)
  }, [frozenColunas, colunasVisiveis])

  function handleReordenarColunas(fromKey: string, toKey: string) {
    setColumnOrder(prev => {
      const arr  = [...prev]
      const from = arr.indexOf(fromKey)
      const to   = arr.indexOf(toKey)
      if (from === -1 || to === -1) return prev
      arr.splice(from, 1)
      arr.splice(to, 0, fromKey)
      return arr
    })
  }

  const [visibilidadeAberta, setVisibilidadeAberta] = useState(false)
  const visibilidadeBtnRef = useRef<HTMLButtonElement>(null)

  const defaultMensagemVazio = mensagemVazio ?? t('tabela.sem_resultado')
  const defaultMensagemSemFiltro = mensagemSemFiltro ?? t('tabela.sem_filtro')
  const [busca, setBusca] = useState('')
  const [ordenacao, setOrdenacao] = useState<{ coluna: string; direcao: SortDir } | null>(null)
  
  const initialFiltros: Record<string, FiltrosStateVal> = {}
  colunas.forEach(c => {
    if (c.tipo === 'texto') initialFiltros[c.key] = new Set<string>()
    if (c.tipo === 'numero') initialFiltros[c.key] = { min: '', max: '' }
    if (c.tipo === 'periodo') initialFiltros[c.key] = { inicio: null, fim: null }
  })
  
  const [filtros, setFiltros] = useState<Record<string, FiltrosStateVal>>(initialFiltros)
  const [pagina, setPagina] = useState(1)
  const [porPagina, setPorPagina] = useState(itensPorPagina)
  const [selecionados, setSelecionados] = useState<Set<string>>(new Set())
  const [expandidos, setExpandidos] = useState<Set<string>>(new Set(expandidosPadrao))
  const [confirmacaoExclusao, setConfirmacaoExclusao] = useState<{ item: T; acao: TabelaGlobalAcao<T> } | null>(null)
  const [modalVisualizar, setModalVisualizar] = useState<{ item: T; acao: TabelaGlobalAcao<T> } | null>(null)
  const [modalEditar, setModalEditar] = useState<{ item: T; acao: TabelaGlobalAcao<T> } | null>(null)

  const toggleExpandido = useCallback((id: string) => {
    setExpandidos(prev => {
      const s = new Set(prev)
      s.has(id) ? s.delete(id) : s.add(id)
      return s
    })
  }, [])

  const onToggleValor = useCallback((col: string, v: string) => {
    setFiltros(prev => {
      const copia = { ...prev }
      const set = new Set(prev[col] as Set<string>)
      set.has(v) ? set.delete(v) : set.add(v)
      copia[col] = set
      return copia
    })
    setPagina(1)
  }, [])

  const onFiltrarNumero = useCallback((col: string, tipo: 'min' | 'max', v: string) => {
    setFiltros(prev => {
      const copia = { ...prev }
      copia[col] = { ...(prev[col] as {min: string, max: string}), [tipo]: v }
      return copia
    })
    setPagina(1)
  }, [])

  const onFiltrarPeriodo = useCallback((col: string, val: { inicio: Date | null, fim: Date | null }) => {
    setFiltros(prev => ({ ...prev, [col]: val }))
    setPagina(1)
  }, [])

  const onOrdenar = useCallback((col: string, dir: SortDir) => setOrdenacao({ coluna: col, direcao: dir }), [])

  const onLimparColuna = useCallback((col: string) => {
    setFiltros(prev => {
      const n = { ...prev }
      if (colunas.find(x => x.key === col)?.tipo === 'periodo') n[col] = { inicio: null, fim: null }
      else if (n[col] instanceof Set) n[col] = new Set()
      else n[col] = { min: '', max: '' }
      return n
    })
    if (ordenacao?.coluna === col) setOrdenacao(null)
    setPagina(1)
  }, [ordenacao, colunas])

  const limparTudo = useCallback(() => {
    setBusca('')
    setFiltros(initialFiltros)
    setOrdenacao(null)
    setPagina(1)
  }, [initialFiltros])

  const resultado = useMemo(() => {
    let r = [...dados]

    if (busca.trim()) {
      const q = busca.toLowerCase()
      r = r.filter(e => colunasVisiveis.some(c => String(e[c.key]).toLowerCase().includes(q)))
    }

    colunasVisiveis.forEach(c => {
      const st = filtros[c.key]
      if (c.tipo === 'texto') {
        const s = st as Set<string>
        if (s.size > 0) r = r.filter(e => s.has(String(e[c.key])))
      } else if (c.tipo === 'numero') {
        const num = st as {min: string, max: string}
        if (num.min !== '') r = r.filter(e => Number(e[c.key]) >= Number(num.min))
        if (num.max !== '') r = r.filter(e => Number(e[c.key]) <= Number(num.max))
      } else if (c.tipo === 'periodo') {
        const p = st as { inicio: Date | null; fim: Date | null }
        if (p.inicio || p.fim) {
          r = r.filter(e => {
            const val = e[c.key]
            if (!val) return false
            const d = new Date(val as any)
            if (isNaN(d.getTime())) return true // ignora filtragem real se o campo n for data
            if (p.inicio) {
              const ini = new Date(p.inicio)
              ini.setHours(0,0,0,0)
              if (d < ini) return false
            }
            if (p.fim) {
              const fim = new Date(p.fim)
              fim.setHours(23,59,59,999)
              if (d > fim) return false
            }
            return true
          })
        }
      }
    })

    if (ordenacao) {
      r.sort((a, b) => {
        const va = a[ordenacao.coluna], vb = b[ordenacao.coluna]
        if (typeof va === 'number' && typeof vb === 'number') return ordenacao.direcao === 'asc' ? va - vb : vb - va
        return String(va).toLowerCase().localeCompare(String(vb).toLowerCase(), 'pt-BR') * (ordenacao.direcao === 'asc' ? 1 : -1)
      })
    }
    return r
  }, [dados, busca, filtros, ordenacao, colunasVisiveis])

  const chips = useMemo(() => {
    const list: { key: string; label: string; onRemover: () => void }[] = []
    if (busca.trim()) list.push({ key: 'busca', label: `"${busca}"`, onRemover: () => setBusca('') })
    
    colunasVisiveis.forEach(c => {
      const st = filtros[c.key]
      if (c.tipo === 'texto') {
        const s = st as Set<string>
        s.forEach(v => list.push({ key: `${c.key}-${v}`, label: `${c.label}: ${v}`, onRemover: () => onToggleValor(c.key, v) }))
      } else if (c.tipo === 'numero') {
        const num = st as {min: string, max: string}
        if (num.min !== '' || num.max !== '') {
          list.push({ key: c.key, label: `${c.label}: ${num.min || '0'}–${num.max || '∞'}`, onRemover: () => onLimparColuna(c.key) })
        }
      } else if (c.tipo === 'periodo') {
        const p = st as { inicio: Date | null, fim: Date | null }
        if (p.inicio || p.fim) {
          const iniStr = p.inicio ? p.inicio.toLocaleDateString('pt-BR') : '...'
          const fimStr = p.fim ? p.fim.toLocaleDateString('pt-BR') : '...'
          list.push({ key: c.key, label: `${c.label}: ${iniStr} - ${fimStr}`, onRemover: () => onLimparColuna(c.key) })
        }
      }
    })
    return list
  }, [busca, colunasVisiveis, filtros, onToggleValor, onLimparColuna])

  const totalPags = Math.max(1, Math.ceil(resultado.length / porPagina))
  const pagSafe = Math.min(pagina, totalPags)
  const paginado = useMemo(() => resultado.slice((pagSafe - 1) * porPagina, pagSafe * porPagina), [resultado, pagSafe, porPagina])

  const todosSelec = paginado.length > 0 && paginado.every(e => selecionados.has(String(e[idKey as string])))
  const toggleSel = (id: string) => setSelecionados(prev => { const s = new Set(prev); s.has(id) ? s.delete(id) : s.add(id); return s })
  const toggleTodos = (checked: boolean) => setSelecionados(checked ? new Set(paginado.map(e => String(e[idKey as string]))) : new Set())

  // Auto-wire card click para abrir o modal de visualização/edição já configurado em `acoes`
  const handleKanbanCardClick = useCallback((item: T) => {
    if (kanban?.onCardClick) {
      kanban.onCardClick(item)
      return
    }
    const acaoVis = acoes?.find(a => a.abrirVisualizar)
    if (acaoVis) { setModalVisualizar({ item, acao: acaoVis }); return }
    const acaoEdit = acoes?.find(a => a.abrirEditar)
    if (acaoEdit) { setModalEditar({ item, acao: acaoEdit }) }
  }, [kanban, acoes])

  return (
    <>
    <div className={`tg-container ${expandidos.size > 0 ? 'tg-container--focado' : ''}`} style={{ background: 'var(--ws-surface, #1e293b)', border: '1px solid var(--ws-accent-border)', borderRadius: '12px', overflow: 'hidden', fontFamily: 'var(--font, Plus Jakarta Sans)', display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem', padding: '0.875rem 1.25rem', borderBottom: chips.length > 0 ? 'none' : '1px solid var(--ws-accent-border)' }}>
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
          <TooltipGlobal descricao={tooltipBusca || t('tabela.buscar_tooltip_padrao')}>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <span style={{ position: 'absolute', left: '0.75rem', color: '#94a3b8', display: 'flex', lineHeight: 0 }}>
                <MagnifyingGlass size={14} weight="bold" />
              </span>
              <input type="search" placeholder="Localizar" value={busca}
                onChange={e => { setBusca(e.target.value); setPagina(1) }}
                className="tg-busca-input"
                style={{ background: 'var(--ws-bg-body, #0f172a)', border: '1px solid var(--ws-accent-border)', borderRadius: '9999px', padding: '0.4375rem 1rem 0.4375rem 2.25rem', color: 'var(--ws-text, #f1f5f9)', fontSize: '0.875rem', fontFamily: 'var(--font, Plus Jakarta Sans)', fontWeight: 400, minWidth: '240px', outline: 'none', transition: 'border-color 0.15s, box-shadow 0.15s' }}
                onFocus={e => { e.currentTarget.style.borderColor = '#818cf8'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(129,140,248,0.14)' }}
                onBlur={e => { e.currentTarget.style.borderColor = 'rgba(129,140,248,0.18)'; e.currentTarget.style.boxShadow = 'none' }}
              />
            </div>
          </TooltipGlobal>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
          {chips.length > 0 && (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', padding: '0.25rem 0.65rem', borderRadius: '9999px', background: 'rgba(199,210,254,0.1)', border: '1px solid rgba(199,210,254,0.25)', color: '#c7d2fe', fontSize: '0.75rem', fontWeight: 700 }}>
              <Funnel size={11} weight="fill" />
              {chips.length === 1 ? t('tabela.filtro_ativo_singular', { count: chips.length }) : t('tabela.filtro_ativo_plural', { count: chips.length })}
            </span>
          )}
          {selecionados.size > 0 && (
            <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#c7d2fe', padding: '0.25rem 0.75rem', background: 'rgba(199,210,254,0.15)', borderRadius: '9999px' }}>
              {selecionados.size === 1 ? t('tabela.selecionado_singular', { count: selecionados.size }) : t('tabela.selecionado_plural', { count: selecionados.size })}
            </span>
          )}
          {kanban && (
            <div style={{ display: 'flex', borderRadius: '9999px', border: '1px solid rgba(129,140,248,0.18)', overflow: 'hidden' }}>
              {(['lista', 'kanban'] as const).map(mode => {
                const ativo = viewMode === mode
                return (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => setViewMode(mode)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '0.3rem',
                      padding: '0.375rem 0.75rem',
                      background: ativo ? 'rgba(129,140,248,0.15)' : 'transparent',
                      border: 'none',
                      color: ativo ? '#818cf8' : '#64748b',
                      fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer',
                      fontFamily: 'inherit', transition: 'all 0.15s',
                    }}
                  >
                    {mode === 'lista' ? <List size={13} weight="bold" /> : <SquaresFour size={13} weight="bold" />}
                    {mode === 'lista' ? t('tabela.view_lista', { defaultValue: 'Lista' }) : t('tabela.view_kanban', { defaultValue: 'Kanban' })}
                  </button>
                )
              })}
            </div>
          )}
          {tableId && (
            <div style={{ position: 'relative' }}>
              <TooltipGlobal descricao={t('tabela.gerenciar_colunas')}>
                <button
                  ref={visibilidadeBtnRef}
                  type="button"
                  onClick={() => setVisibilidadeAberta(v => !v)}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', padding: '0.4375rem 0.875rem', borderRadius: '9999px', background: visibilidadeAberta ? 'rgba(129,140,248,0.1)' : 'transparent', border: `1px solid ${visibilidadeAberta ? '#818cf8' : 'rgba(129,140,248,0.12)'}`, color: visibilidadeAberta ? '#818cf8' : '#94a3b8', fontSize: '0.8125rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s' }}
                  onMouseEnter={e => { if (!visibilidadeAberta) { e.currentTarget.style.borderColor = '#818cf8'; e.currentTarget.style.color = '#818cf8' } }}
                  onMouseLeave={e => { if (!visibilidadeAberta) { e.currentTarget.style.borderColor = 'rgba(129,140,248,0.12)'; e.currentTarget.style.color = '#94a3b8' } }}
                >
                  <Columns size={13} weight="bold" />
                </button>
              </TooltipGlobal>
              {visibilidadeAberta && (
                <SelectColunasGlobal
                  colunas={colunasConfig}
                  colunasVisiveis={[...visibleKeys]}
                  onToggle={toggleVisibility}
                  onSelecionarTodos={setAllVisible}
                  onRestaurarPadrao={resetToDefault}
                  onFechar={() => setVisibilidadeAberta(false)}
                  onReordenar={handleReordenarColunas}
                  triggerRef={visibilidadeBtnRef as React.RefObject<HTMLButtonElement | null>}
                  posicao={{ top: 'calc(100% + 6px)', right: 0 }}
                />
              )}
            </div>
          )}
          {(acoesExportacao && acoesExportacao.length > 0) && (
            <BotaoCompletoExportar
              acoes={acoesExportacao.map(a => ({
                label: a.label,
                icone: a.icone,
                onClick: () => a.onClick(resultado),
              }))}
            />
          )}
        </div>
      </div>

      {chips.length > 0 && (
        <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '0.375rem', padding: '0.625rem 1.25rem', borderBottom: '1px solid var(--ws-accent-border)', background: 'rgba(129,140,248,0.02)' }}>
          {chips.map(c => <FiltroChip key={c.key} label={c.label} onRemover={c.onRemover} />)}
          <button type="button" onClick={limparTudo}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', marginLeft: 'auto', padding: '0.2rem 0.65rem', borderRadius: '9999px', background: 'transparent', border: '1px solid rgba(239,68,68,0.25)', color: '#94a3b8', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s', whiteSpace: 'nowrap' }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.08)'; e.currentTarget.style.color = '#f87171'; e.currentTarget.style.borderColor = 'rgba(239,68,68,0.5)' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#94a3b8'; e.currentTarget.style.borderColor = 'rgba(239,68,68,0.25)' }}>
            <X size={11} weight="bold" /> {t('tabela.limpar')}
          </button>
        </div>
      )}

      {viewMode === 'kanban' && kanban ? (
        <div style={{ flex: 1, overflow: 'hidden' }}>
          <KanbanGlobal
            colunas={kanban.colunas}
            itens={resultado as any}
            renderCard={kanban.renderCard as any}
            onMoverItem={kanban.onMoverItem}
            onReorderItem={kanban.onReorderItem}
            onCardClick={handleKanbanCardClick as any}
            getItemLabel={kanban.getItemLabel as any}
            getItemDate={kanban.getItemDate as any}
            emptyLabel={kanban.emptyLabel}
            isLoading={kanban.carregando}
          />
        </div>
      ) : (
      <div style={{ overflowX: 'auto', overflowY: 'auto', flex: 1, minHeight: 0 }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem', color: '#f1f5f9' }}>
          <thead ref={theadRef}>
            <tr>
              <th style={{ padding: '0.75rem 1rem', width: 1, background: '#1e293b', borderBottom: '2px solid rgba(129,140,248,0.3)', color: 'white', fontSize: '0.7rem', position: 'sticky', top: 0, zIndex: frozenColunas > 0 ? 3 : 2, ...(frozenColunas > 0 ? { left: 0 } : {}) }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input type="checkbox" checked={todosSelec} onChange={e => toggleTodos(e.target.checked)} style={{ accentColor: '#818cf8', width: 14, height: 14, cursor: 'pointer' }} />
                  <span style={{ opacity: 0.5 }}>#</span>
                </div>
              </th>
              {colunasVisiveis.map((col, cIdx) => (
                <Th
                  key={col.key}
                  col={col}
                  filtros={filtros}
                  ordenacao={ordenacao}
                  dados={dados}
                  onOrdenar={onOrdenar}
                  onToggleValor={onToggleValor}
                  onFiltrarNumero={onFiltrarNumero}
                  onFiltrarPeriodo={onFiltrarPeriodo}
                  onLimparColuna={onLimparColuna}
                  stickyLeft={cIdx < frozenColunas ? (stickyOffsets[cIdx] ?? undefined) : undefined}
                />
              ))}
              {acoes && acoes.length > 0 && (
                <th style={{ padding: '0.75rem 1rem', width: 1, background: '#1e293b', borderBottom: '2px solid rgba(129,140,248,0.2)', fontSize: '0.6875rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: '#64748b', textAlign: 'center', position: 'sticky', top: 0, zIndex: 2 }}>
                  <TooltipGlobal titulo={t('tabela.acoes')} descricao={t('tabela.tooltip_acoes')}>
                    <span>{t('tabela.acoes')}</span>
                  </TooltipGlobal>
                </th>
              )}
              {renderExpandido && (
                <th style={{ padding: '0.75rem 1rem', width: 1, background: '#1e293b', borderBottom: '2px solid rgba(129,140,248,0.2)', position: 'sticky', top: 0, zIndex: 2 }}></th>
              )}
            </tr>
          </thead>
          <tbody>
            {paginado.length === 0 ? (
              <tr>
                <td colSpan={colunas.length + (acoes?.length ? 1 : 0) + (renderExpandido ? 1 : 0) + 1} style={{ textAlign: 'center', padding: '3rem 1rem', color: '#64748b' }}>
                  {chips.length > 0 || busca
                    ? <span>{defaultMensagemVazio} <button type="button" onClick={limparTudo} style={{ background: 'none', border: 'none', color: '#818cf8', cursor: 'pointer', fontWeight: 600, fontFamily: 'inherit', fontSize: 'inherit' }}>{t('tabela.limpar_filtros')}</button></span>
                    : defaultMensagemSemFiltro
                  }
                </td>
              </tr>
            ) : paginado.map((item, i) => {
              const id = String(item[idKey as string])
              const isExpanded = expandidos.has(id)
              const filhosItem = filhos ? filhos(item) : []
              const temFilhos = filhosItem.length > 0
              const ehUltimoDoPagina = i === paginado.length - 1

              return (
                <React.Fragment key={id}>
                  {/* ── Linha Principal (PAI) ── */}
                  <tr
                    className={`tg-tr ${isExpanded ? (filhos ? 'tg-tr--pai-expandida' : 'tg-tr--expandida') : ''}`}
                    onClick={(renderExpandido || temFilhos) ? () => toggleExpandido(id) : undefined}
                    style={{ 
                      cursor: (renderExpandido || temFilhos) ? 'pointer' : 'default', 
                      borderBottom: (isExpanded || !ehUltimoDoPagina) ? '1px solid var(--tg-border)' : 'none',
                      background: selecionados.has(id) ? 'var(--tg-bg-selected)' : 'transparent' 
                    }}
                  >
                    <td className="tg-td tg-td--checkbox" onClick={ev => ev.stopPropagation()} style={frozenColunas > 0 ? { position: 'sticky', left: 0, zIndex: 1, background: selecionados.has(id) ? 'rgba(129,140,248,0.08)' : 'var(--ws-surface, #1e293b)' } : undefined}>
                      {filhos ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <input type="checkbox" className="tg-checkbox" checked={selecionados.has(id)} onChange={() => toggleSel(id)} />
                          {temFilhos && (
                            <TooltipGlobal 
                              descricao={
                                isExpanded 
                                  ? (typeof tooltipRecolher === 'function' ? tooltipRecolher(item) : tooltipRecolher || t('tabela.recolher_detalhes'))
                                  : (typeof tooltipExpandir === 'function' ? tooltipExpandir(item) : tooltipExpandir || t('tabela.expandir_detalhes'))
                              }
                            >
                              <button
                                type="button"
                                className="tg-chevron-btn"
                                onClick={e => { e.stopPropagation(); toggleExpandido(id) }}
                              >
                                <span className={`tg-chevron-icon ${isExpanded ? 'tg-chevron-icon--aberto' : ''}`}>
                                  <IconeChevron />
                                </span>
                              </button>
                            </TooltipGlobal>
                          )}
                        </div>
                      ) : (
                        <input type="checkbox" className="tg-checkbox" checked={selecionados.has(id)} onChange={() => toggleSel(id)} />
                      )}
                    </td>
                    
                    {colunasVisiveis.map((col, cIdx) => (
                      <td key={col.key} className="tg-td" style={{ textAlign: col.align || 'center', ...(cIdx < frozenColunas && stickyOffsets[cIdx] !== undefined ? { position: 'sticky', left: stickyOffsets[cIdx], zIndex: 1, background: selecionados.has(id) ? 'rgba(129,140,248,0.08)' : 'var(--ws-surface, #1e293b)' } : {}) }}>
                        {cIdx === 0 && temFilhos ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            {col.render ? col.render(item[col.key], item) : String(item[col.key] ?? '')}
                            <span className="tg-badge-filhos">{filhosItem.length}</span>
                          </div>
                        ) : (
                          col.render ? col.render(item[col.key], item) : String(item[col.key] ?? '')
                        )}
                      </td>
                    ))}

                    {acoes && acoes.length > 0 && (
                      <td className="tg-td tg-td--acoes">
                        <div className="tg-acoes-grupo">
                          {acoes.map(acao => {
                            const tooltipDesc = typeof acao.tooltip === 'function' ? acao.tooltip(item) : acao.tooltip
                            
                            if (acao.renderCustom) {
                              const customNode = acao.renderCustom(item)
                              return tooltipDesc ? (
                                <TooltipGlobal key={acao.id} descricao={tooltipDesc}>
                                  {customNode}
                                </TooltipGlobal>
                              ) : <React.Fragment key={acao.id}>{customNode}</React.Fragment>
                            }
                            const isDis = acao.disabled ? acao.disabled(item) : false
                            const customStyle = acao.onRenderStyle ? acao.onRenderStyle(item) : {}
                            return (
                              <TooltipGlobal key={acao.id} descricao={tooltipDesc}>
                                <button
                                  type="button"
                                  className="tg-acao-btn"
                                  onClick={() => {
                                    if (isDis) return
                                    if (acao.confirmarExclusao) {
                                      setConfirmacaoExclusao({ item, acao })
                                    } else if (acao.abrirVisualizar) {
                                      setModalVisualizar({ item, acao })
                                    } else if (acao.abrirEditar) {
                                      setModalEditar({ item, acao })
                                    } else {
                                      acao.onClick(item)
                                    }
                                  }}
                                  disabled={isDis}
                                  style={{ ...customStyle, opacity: isDis ? 0.3 : 1 }}
                                >
                                  {acao.icone}
                                </button>
                              </TooltipGlobal>
                            )
                          })}
                        </div>
                      </td>
                    )}
                    
                    {renderExpandido && !filhos && (
                      <td className="tg-td tg-td--expand">
                        <TooltipGlobal 
                          descricao={
                            isExpanded 
                              ? (typeof tooltipRecolher === 'function' ? tooltipRecolher(item) : tooltipRecolher || t('tabela.recolher_detalhes'))
                              : (typeof tooltipExpandir === 'function' ? tooltipExpandir(item) : tooltipExpandir || t('tabela.expandir_detalhes'))
                          }
                        >
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <CaretDown size={14} weight="bold" style={{ transform: isExpanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s', color: '#64748b' }} />
                          </div>
                        </TooltipGlobal>
                      </td>
                    )}
                  </tr>

                  {/* ── Linhas de Camadas (FILHAS) ── */}
                  {isExpanded && temFilhos && colunasFilhas && filhosItem.map((filho, fi) => {
                    const isUltimoFilho = fi === filhosItem.length - 1
                    return (
                      <tr key={(filho as any).id ?? fi} className={`tg-tr-filho tg-tr-filho--visivel ${isUltimoFilho ? 'tg-tr-filho--ultimo' : ''}`}>
                        <td className="tg-td--filho-expand">
                          <span className="tg-conector">{isUltimoFilho ? '└' : '├'}</span>
                        </td>
                        {colunasFilhas.map((cf, cfIdx) => (
                          <td key={cf.key} className={`tg-td ${cfIdx === 0 ? 'tg-td--filho-first' : ''}`} style={{ textAlign: cf.align || 'center' }}>
                            {renderCelulaCamada(cf, filho)}
                          </td>
                        ))}
                        {/* ── Manter o mesmo número de colunas do pai ── */}
                        {acoesFilhas ? (
                          <td className="tg-td tg-td--acoes">
                            <div className="tg-acoes-grupo">
                              {acoesFilhas.map(af => (
                                <TooltipGlobal key={af.id} descricao={af.tooltip}>
                                  <button type="button" className="tg-acao-btn" onClick={() => af.onClick?.(filho)}>
                                    {af.icone}
                                  </button>
                                </TooltipGlobal>
                              ))}
                            </div>
                          </td>
                        ) : (
                          acoes && acoes.length > 0 && <td className="tg-td tg-td--acoes" />
                        )}
                        {renderExpandido && !filhos && <td className="tg-td" />}
                      </tr>
                    )
                  })}

                  {/* ── Conteúdo Expandido (Modo Legado/Simples) ── */}
                  {isExpanded && renderExpandido && !filhos && (
                    <tr className="tg-tr-expandida-conteudo">
                      <td colSpan={colunas.length + (acoes?.length ? 1 : 0) + 2} style={{ padding: 0 }}>
                        {renderExpandido(item)}
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              )
            })}
          </tbody>
        </table>
      </div>
      )}

      {(viewMode === 'lista' || !kanban) && <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem', padding: '0.75rem 1.25rem', borderTop: '1px solid var(--ws-accent-border)', background: 'rgba(129,140,248,0.02)' }}>
        <span style={{ fontSize: '0.8125rem', color: '#64748b' }}>
          {resultado.length === 0 ? t('tabela.nenhum_registro') : `${(pagSafe - 1) * porPagina + 1}–${Math.min(pagSafe * porPagina, resultado.length)} ${t('tabela.de')} ${resultado.length}`}
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
          <button type="button" onClick={() => setPagina(1)} disabled={pagSafe === 1} style={{ padding: '0.3rem 0.5rem', minWidth: '2rem', borderRadius: '6px', fontSize: '0.875rem', cursor: 'pointer', background: 'transparent', border: '1px solid transparent', color: '#94a3b8', fontFamily: 'inherit', opacity: pagSafe === 1 ? 0.3 : 1 }}>«</button>
          <button type="button" onClick={() => setPagina(p => Math.max(1, p - 1))} disabled={pagSafe === 1} style={{ padding: '0.3rem 0.5rem', minWidth: '2rem', borderRadius: '6px', fontSize: '0.875rem', cursor: 'pointer', background: 'transparent', border: '1px solid transparent', color: '#94a3b8', fontFamily: 'inherit', opacity: pagSafe === 1 ? 0.3 : 1 }}>‹</button>
          <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#f1f5f9', minWidth: '56px', textAlign: 'center' }}>{pagSafe} / {totalPags}</span>
          <button type="button" onClick={() => setPagina(p => Math.min(totalPags, p + 1))} disabled={pagSafe === totalPags} style={{ padding: '0.3rem 0.5rem', minWidth: '2rem', borderRadius: '6px', fontSize: '0.875rem', cursor: 'pointer', background: 'transparent', border: '1px solid transparent', color: '#94a3b8', fontFamily: 'inherit', opacity: pagSafe === totalPags ? 0.3 : 1 }}>›</button>
          <button type="button" onClick={() => setPagina(totalPags)} disabled={pagSafe === totalPags} style={{ padding: '0.3rem 0.5rem', minWidth: '2rem', borderRadius: '6px', fontSize: '0.875rem', cursor: 'pointer', background: 'transparent', border: '1px solid transparent', color: '#94a3b8', fontFamily: 'inherit', opacity: pagSafe === totalPags ? 0.3 : 1 }}>»</button>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8125rem', color: '#64748b' }}>
          {t('tabela.por_pagina_label')}
          <select value={porPagina} onChange={e => { setPorPagina(Number(e.target.value)); setPagina(1) }}
            style={{ background: 'var(--ws-bg-body, #0f172a)', border: '1px solid var(--ws-accent-border)', borderRadius: '6px', padding: '0.25rem 0.5rem', color: '#f1f5f9', fontSize: '0.8125rem', fontFamily: 'inherit', cursor: 'pointer' }}>
            {[10, 20, 50].map(n => <option key={n} value={n}>{n}</option>)}
          </select>
        </div>
      </div>}
    </div>

    {confirmacaoExclusao && (
      <ModalConfirmarExcluirGlobal
        aberto
        titulo={confirmacaoExclusao.acao.confirmarExclusao?.titulo ?? 'Excluir item'}
        descricao={confirmacaoExclusao.acao.confirmarExclusao?.descricao ?? 'Esta ação não pode ser desfeita.'}
        nomeItem={confirmacaoExclusao.acao.confirmarExclusao?.nomeItem?.(confirmacaoExclusao.item)}
        aoConfirmar={() => {
          confirmacaoExclusao.acao.onClick(confirmacaoExclusao.item)
          setConfirmacaoExclusao(null)
        }}
        aoCancelar={() => setConfirmacaoExclusao(null)}
      />
    )}

    {modalVisualizar && (() => {
      const cfg      = modalVisualizar.acao.abrirVisualizar!
      const titulo   = typeof cfg.titulo    === 'function' ? cfg.titulo(modalVisualizar.item)    : (cfg.titulo    ?? 'Visualizar')
      const subtit   = typeof cfg.subtitulo === 'function' ? cfg.subtitulo(modalVisualizar.item) : (cfg.subtitulo ?? '')
      const onFechar = () => setModalVisualizar(null)
      return (
        <ModalOverlay
          aberto
          aoFechar={onFechar}
          titulo={cfg.icone ? <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>{cfg.icone}{titulo}</span> : titulo}
          subtitulo={subtit || undefined}
          tamanho={cfg.tamanho ?? 'md'}
          botoes={[{
            rotulo: t('modal.fechar', { defaultValue: 'Fechar' }),
            variante: 'secondary',
            ao_clicar: onFechar,
          }]}
        >
          <div style={{ padding: '0.25rem 0', maxHeight: '55vh', overflowY: 'auto', scrollbarWidth: 'thin', scrollbarColor: '#334155 transparent' }}>
            {cfg.renderConteudo(modalVisualizar.item)}
          </div>
        </ModalOverlay>
      )
    })()}

    {modalEditar && (() => {
      const cfg = modalEditar.acao.abrirEditar!
      const titulo    = typeof cfg.titulo    === 'function' ? cfg.titulo(modalEditar.item)    : (cfg.titulo    ?? 'Editar')
      const subtitulo = typeof cfg.subtitulo === 'function' ? cfg.subtitulo(modalEditar.item) : (cfg.subtitulo ?? '')
      const onSalvar  = () => { cfg.aoSalvar?.(modalEditar.item); setModalEditar(null) }
      const onFechar  = () => setModalEditar(null)
      return (
        <ModalFormularioGlobal
          aberto
          aoFechar={onFechar}
          aoSalvar={onSalvar}
          icone={cfg.icone ?? null}
          titulo={titulo}
          subtitulo={subtitulo}
          tamanho={cfg.tamanho ?? 'lg'}
          textoSalvar={cfg.textoSalvar}
          podesSalvar
          dirty
        >
          <div style={{ maxHeight: '55vh', overflowY: 'auto', scrollbarWidth: 'thin', scrollbarColor: '#334155 transparent' }}>
            {cfg.renderConteudo(modalEditar.item)}
          </div>
        </ModalFormularioGlobal>
      )
    })()}
    </>
  )
}
