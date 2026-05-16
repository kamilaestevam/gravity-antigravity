// @nucleo/tabela-camadas-global — componente principal
// Tabela em camadas: linhas pai com linhas filhas no mesmo <tbody>.

import React, { useState, useMemo, useRef, useEffect, useCallback, memo } from 'react'
import ReactDOM from 'react-dom'
import { useTranslation } from 'react-i18next'
import { TooltipGlobal } from '@nucleo/tooltip-global'
import {
  Columns, Funnel, X, ArrowUp, ArrowDown,
  MagnifyingGlass, CheckSquare, Square,
} from '@phosphor-icons/react'
import { useTablePersistence } from '../../tabela-global/src/hooks/useTablePersistence.js'
import { VisibilidadeColunas } from '../../tabela-global/src/componentes/VisibilidadeColunas.js'
import { GravityLoader } from '@nucleo/gravity-loader-global'
import './tabela-camadas.css'
import type {
  TabelaCamadasGlobalProps,
  TCGColuna,
  TCGAcao,
  TCGTipo,
  TCGAcaoLote,
} from './tipos.js'

// ─── Tipos de filtro ──────────────────────────────────────────────────────────

type SortDir = 'asc' | 'desc'
type FiltroVal = Set<string> | { min: string; max: string } | { inicio: string; fim: string }

// ─── Ícones internos ──────────────────────────────────────────────────────────

function IconeChevron() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
      <path d="M4 2L8 6L4 10" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

function IconeBusca() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
      <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2"/>
      <path d="M16.5 16.5L21 21" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  )
}

function IconeExport() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
      <path d="M12 3v12M8 11l4 4 4-4M4 17v2a2 2 0 002 2h12a2 2 0 002-2v-2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

function IconeAnterior() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
      <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

function IconeProximo() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
      <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

// ─── PopoverFiltro (portado de tabela.tsx) ────────────────────────────────────

function PopoverFiltro({
  tipo, coluna, label, ordenacao,
  valoresDisponiveis, valoresSelecionados,
  minMax, periodo, triggerRef,
  onOrdenar, onToggleValor, onFiltrarNumero, onFiltrarPeriodo, onLimpar, onFechar,
}: {
  tipo: TCGTipo
  coluna: string
  label: string
  ordenacao: { key: string; dir: SortDir } | null
  valoresDisponiveis: string[]
  valoresSelecionados: Set<string>
  minMax: { min: string; max: string }
  periodo: { inicio: string; fim: string }
  triggerRef: React.RefObject<HTMLButtonElement>
  onOrdenar: (c: string, d: SortDir) => void
  onToggleValor: (c: string, v: string) => void
  onFiltrarNumero: (c: string, campo: 'min' | 'max', v: string) => void
  onFiltrarPeriodo: (c: string, campo: 'inicio' | 'fim', v: string) => void
  onLimpar: () => void
  onFechar: () => void
}) {
  const { t } = useTranslation()
  const ref = useRef<HTMLDivElement>(null)
  const [buscaLocal, setBuscaLocal] = useState('')
  const [pos, setPos] = useState({ top: 0, left: 0 })

  useEffect(() => {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect()
      setPos({ top: rect.bottom + window.scrollY + 4, left: rect.left + window.scrollX })
    }
  }, [triggerRef])

  useEffect(() => {
    function fora(e: MouseEvent) {
      if (
        ref.current && !ref.current.contains(e.target as Node) &&
        triggerRef.current && !triggerRef.current.contains(e.target as Node)
      ) onFechar()
    }
    document.addEventListener('mousedown', fora)
    return () => document.removeEventListener('mousedown', fora)
  }, [onFechar, triggerRef])

  const sortAtivo = ordenacao?.key === coluna

  const valoresFiltrados = useMemo(() =>
    buscaLocal.trim()
      ? valoresDisponiveis.filter(v => v.toLowerCase().includes(buscaLocal.toLowerCase()))
      : valoresDisponiveis,
    [valoresDisponiveis, buscaLocal]
  )

  // ── Estilos alinhados ao SelectGlobal ──────────────────────────────────────
  const dd: React.CSSProperties = {
    position: 'fixed', top: pos.top, left: pos.left, zIndex: 9999,
    background: 'rgba(22, 34, 56, 0.96)',
    backdropFilter: 'blur(12px)',
    border: '1.5px solid rgba(129,140,248,0.25)',
    borderRadius: '8px',
    boxShadow: 'none',
    minWidth: '230px', maxWidth: '290px',
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    animation: 'tcg-popover-in .14s cubic-bezier(.16,1,.3,1)',
    overflow: 'hidden',
  }

  const sectionLabel: React.CSSProperties = {
    fontSize: '0.6rem', fontWeight: 700, textTransform: 'uppercase',
    letterSpacing: '0.07em', color: '#475569',
  }

  const fieldBase: React.CSSProperties = {
    flex: 1, width: 0, padding: '0.375rem 0.625rem',
    background: 'transparent',
    border: '1px solid rgba(129,140,248,0.2)',
    borderRadius: '6px', color: '#f1f5f9',
    fontSize: '0.8125rem', fontFamily: 'inherit', outline: 'none',
    transition: 'border-color 0.15s',
  }

  const pillStyle = (ativo: boolean): React.CSSProperties => ({
    flex: 1, display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    gap: '0.3rem', padding: '0.375rem 0.5rem', borderRadius: '9999px',
    background: ativo ? 'rgba(129,140,248,0.15)' : 'rgba(255,255,255,0.04)',
    border: `1px solid ${ativo ? 'rgba(129,140,248,0.35)' : 'rgba(255,255,255,0.08)'}`,
    color: ativo ? '#818cf8' : '#64748b',
    fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer',
    fontFamily: 'inherit', transition: 'all 0.12s', whiteSpace: 'nowrap' as const,
  })

  return ReactDOM.createPortal(
    <div ref={ref} style={dd} onClick={e => e.stopPropagation()}>

      {/* ── Cabeçalho — nome da coluna ── */}
      <div style={{ padding: '0.5rem 0.75rem 0.4rem', borderBottom: '1px solid rgba(129,140,248,0.1)' }}>
        <span style={{ ...sectionLabel, color: '#818cf8' }}>{label}</span>
      </div>

      {/* ── Ordenar ── */}
      <div style={{ padding: '0.5rem 0.75rem', borderBottom: '1px solid rgba(129,140,248,0.1)' }}>
        <p style={{ ...sectionLabel, marginBottom: '0.4rem' }}>{t('tabela.ordenar', 'Ordenar')}</p>
        <div style={{ display: 'flex', gap: '0.375rem' }}>
          {([
            ['asc',  t('tabela.crescente',   'Crescente'),   <ArrowUp   key="u" size={11} weight="bold" />],
            ['desc', t('tabela.decrescente', 'Decrescente'), <ArrowDown key="d" size={11} weight="bold" />],
          ] as [SortDir, string, React.ReactNode][]).map(([dir, rot, ico]) => {
            const ativo = sortAtivo && ordenacao?.dir === dir
            return (
              <button key={dir} type="button"
                onClick={() => { onOrdenar(coluna, dir); onFechar() }}
                style={pillStyle(ativo)}
                onMouseEnter={e => { if (!ativo) { e.currentTarget.style.background = 'rgba(129,140,248,0.08)'; e.currentTarget.style.borderColor = 'rgba(129,140,248,0.25)'; e.currentTarget.style.color = '#f1f5f9' } }}
                onMouseLeave={e => { if (!ativo) { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = '#64748b' } }}
              >
                {ico} {rot}
              </button>
            )
          })}
        </div>
      </div>

      {/* ── Filtro texto / badge — busca + lista ── */}
      {(tipo === 'texto' || tipo === 'badge' || tipo === 'custom') && (
        <>
          {/* Campo de busca — estilo SelectGlobal */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 0.75rem', borderBottom: '1px solid rgba(129,140,248,0.1)', background: 'rgba(129,140,248,0.04)' }}>
            <MagnifyingGlass size={13} weight="bold" style={{ color: '#64748b', flexShrink: 0 }} />
            <input
              type="text"
              placeholder={t('tabela.buscar', 'Localizar')}
              value={buscaLocal}
              onChange={e => setBuscaLocal(e.target.value)}
              autoFocus
              style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', color: '#f1f5f9', fontSize: '0.875rem', fontFamily: 'inherit', caretColor: '#818cf8' }}
            />
            {buscaLocal && (
              <button type="button" onClick={() => setBuscaLocal('')}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', display: 'flex', padding: 0, lineHeight: 0 }}>
                <X size={12} weight="bold" />
              </button>
            )}
          </div>
          {/* Lista de valores */}
          <div style={{ maxHeight: '200px', overflowY: 'auto', padding: '0.375rem 0.375rem', scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,255,255,0.1) transparent' }}>
            {valoresFiltrados.length === 0 ? (
              <p style={{ fontSize: '0.8125rem', color: '#475569', padding: '0.625rem 0.375rem', textAlign: 'center' }}>{t('tabela.sem_valor', 'Sem valores')}</p>
            ) : valoresFiltrados.map(v => {
              const selecionado = valoresSelecionados.has(v)
              return (
                <label key={v}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', padding: '0.5rem 0.75rem', cursor: 'pointer', borderRadius: '6px', transition: 'background 0.1s', background: selecionado ? 'rgba(129,140,248,0.12)' : 'transparent' }}
                  onMouseEnter={e => { if (!selecionado) (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.05)' }}
                  onMouseLeave={e => { if (!selecionado) (e.currentTarget as HTMLElement).style.background = 'transparent' }}
                >
                  <span style={{ color: selecionado ? '#818cf8' : '#475569', display: 'flex', lineHeight: 0, flexShrink: 0 }}>
                    {selecionado ? <CheckSquare size={14} weight="fill" /> : <Square size={14} weight="regular" />}
                  </span>
                  <input type="checkbox" checked={selecionado} onChange={() => onToggleValor(coluna, v)} style={{ display: 'none' }} />
                  <span style={{ fontSize: '0.875rem', color: selecionado ? '#818cf8' : '#cbd5e1', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{v}</span>
                </label>
              )
            })}
          </div>
        </>
      )}

      {/* ── Filtro número — intervalo min/max ── */}
      {tipo === 'numero' && (
        <div style={{ padding: '0.625rem 0.75rem', borderBottom: '1px solid rgba(129,140,248,0.1)' }}>
          <p style={{ ...sectionLabel, marginBottom: '0.5rem' }}>{t('tabela.intervalo', 'Intervalo')}</p>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            {(['min', 'max'] as const).map((campo, i) => (
              <input key={campo}
                type="text" inputMode="numeric"
                placeholder={i === 0 ? t('tabela.minimo', 'Mínimo') : t('tabela.maximo', 'Máximo')}
                autoComplete="off"
                value={minMax[campo]}
                onChange={e => onFiltrarNumero(coluna, campo, e.target.value.replace(/[^0-9.,]/g, ''))}
                style={fieldBase}
                onFocus={e => { e.currentTarget.style.borderColor = '#818cf8' }}
                onBlur={e => { e.currentTarget.style.borderColor = 'rgba(129,140,248,0.2)' }}
              />
            ))}
          </div>
        </div>
      )}

      {/* ── Filtro período — intervalo de datas ── */}
      {tipo === 'periodo' && (
        <div style={{ padding: '0.625rem 0.75rem', borderBottom: '1px solid rgba(129,140,248,0.1)' }}>
          <p style={{ ...sectionLabel, marginBottom: '0.5rem' }}>{t('tabela.selecionar_periodo', 'Período')}</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
            {(['inicio', 'fim'] as const).map((campo, i) => (
              <div key={campo} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '0.6875rem', color: '#64748b', width: 28, flexShrink: 0 }}>{i === 0 ? 'De' : 'Até'}</span>
                <input
                  type="date"
                  value={periodo[campo]}
                  onChange={e => onFiltrarPeriodo(coluna, campo, e.target.value)}
                  style={{ ...fieldBase, width: 'auto', colorScheme: 'dark' }}
                  onFocus={e => { e.currentTarget.style.borderColor = '#818cf8' }}
                  onBlur={e => { e.currentTarget.style.borderColor = 'rgba(129,140,248,0.2)' }}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Limpar filtro ── */}
      <div style={{ padding: '0.375rem 0.375rem 0.375rem' }}>
        <button type="button" onClick={() => { onLimpar(); onFechar() }}
          style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', width: '100%', padding: '0.4rem 0.75rem', borderRadius: '6px', background: 'transparent', border: 'none', cursor: 'pointer', color: '#64748b', fontSize: '0.8125rem', fontFamily: 'inherit', transition: 'color 0.12s, background 0.12s' }}
          onMouseEnter={e => { e.currentTarget.style.color = '#f87171'; e.currentTarget.style.background = 'rgba(239,68,68,0.06)' }}
          onMouseLeave={e => { e.currentTarget.style.color = '#64748b'; e.currentTarget.style.background = 'transparent' }}>
          <X size={11} weight="bold" /> {t('tabela.limpar_filtro', 'Limpar filtro')}
        </button>
      </div>
    </div>,
    document.body
  )
}

// ─── ThInner — cabeçalho com filtro por coluna ────────────────────────────────

function ThInnerFn<T>({
  col, filtros, ordenacao, dados,
  onOrdenar, onToggleValor, onFiltrarNumero, onFiltrarPeriodo, onLimparColuna,
}: {
  col: TCGColuna<T>
  filtros: Record<string, FiltroVal>
  ordenacao: { key: string; dir: SortDir } | null
  dados: T[]
  onOrdenar: (c: string, d: SortDir) => void
  onToggleValor: (c: string, v: string) => void
  onFiltrarNumero: (c: string, campo: 'min' | 'max', v: string) => void
  onFiltrarPeriodo: (c: string, campo: 'inicio' | 'fim', v: string) => void
  onLimparColuna: (c: string) => void
}) {
  const [aberto, setAberto] = useState(false)
  const handleFechar = useCallback(() => setAberto(false), [])
  const triggerRef = useRef<HTMLButtonElement>(null!)

  const coluna = col.key as string
  const sortAtivo = ordenacao?.key === coluna
  const tipo: TCGTipo = col.tipo ?? 'texto'

  const valoresDisponiveis = useMemo(() => {
    const vals = dados.map(e => String((e as any)[coluna] ?? ''))
    return [...new Set(vals)].filter(v => v !== '').sort((a, b) => a.localeCompare(b, 'pt-BR'))
  }, [dados, coluna])

  const stateVal = filtros[coluna]
  const temFiltroAtivo = !stateVal
    ? false
    : tipo === 'numero'
      ? !!((stateVal as { min: string; max: string }).min || (stateVal as { min: string; max: string }).max)
      : tipo === 'periodo'
      ? !!((stateVal as { inicio: string; fim: string }).inicio || (stateVal as { inicio: string; fim: string }).fim)
      : (stateVal as Set<string>).size > 0

  const labelSpan = (
    <span style={{ color: sortAtivo ? '#818cf8' : undefined, lineHeight: 1, display: 'inline-block' }}>
      {col.label}
    </span>
  )

  const thStyle: React.CSSProperties = {
    width: col.largura as string | undefined,
    padding: '0.75rem 1rem',
    textAlign: col.align ?? 'left',
    whiteSpace: 'nowrap',
    fontSize: '0.6875rem',
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.07em',
    color: 'var(--tcg-text)',
    borderBottom: '1px solid var(--tcg-border)',
    background: 'rgba(129,140,248,0.04)',
    position: 'relative',
    userSelect: 'none',
    verticalAlign: 'middle',
  }

  return (
    <th style={thStyle}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', justifyContent: col.align === 'center' ? 'center' : col.align === 'right' ? 'flex-end' : 'flex-start' }}>
        {col.tooltipDescricao
          ? <span style={{ marginRight: '12px' }}><TooltipGlobal titulo={col.tooltipTitulo} descricao={col.tooltipDescricao}>{labelSpan}</TooltipGlobal></span>
          : labelSpan
        }
        {col.filtravel && (
          <button
            ref={triggerRef}
            type="button"
            onClick={e => { e.stopPropagation(); setAberto(v => !v) }}
            style={{
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              width: 16, height: 16, borderRadius: '4px',
              background: temFiltroAtivo || aberto ? 'rgba(129,140,248,0.15)' : 'transparent',
              border: `1px solid ${temFiltroAtivo || aberto ? 'rgba(129,140,248,0.3)' : 'transparent'}`,
              cursor: 'pointer', padding: 0, flexShrink: 0,
              color: temFiltroAtivo || aberto ? '#818cf8' : '#64748b',
              transition: 'all 0.12s', lineHeight: 0, verticalAlign: 'middle',
            }}
          >
            <Funnel size={10} weight={temFiltroAtivo ? 'fill' : 'bold'} />
          </button>
        )}
      </div>
      {aberto && (
        <PopoverFiltro
          tipo={tipo}
          coluna={coluna}
          label={col.label}
          ordenacao={ordenacao}
          valoresDisponiveis={valoresDisponiveis}
          valoresSelecionados={tipo !== 'numero' && tipo !== 'periodo' ? (stateVal as Set<string>) ?? new Set() : new Set()}
          minMax={tipo === 'numero' ? (stateVal as { min: string; max: string }) ?? { min: '', max: '' } : { min: '', max: '' }}
          periodo={tipo === 'periodo' ? (stateVal as { inicio: string; fim: string }) ?? { inicio: '', fim: '' } : { inicio: '', fim: '' }}
          triggerRef={triggerRef as React.RefObject<HTMLButtonElement>}
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

const ThFiltro = memo(ThInnerFn) as typeof ThInnerFn

// ─── Render de célula ─────────────────────────────────────────────────────────

function renderCelula<T>(coluna: TCGColuna<T>, item: T): React.ReactNode {
  const valor = (item as any)[coluna.key]
  if (coluna.render) return coluna.render(valor, item)
  if (valor === null || valor === undefined) return <span style={{ color: 'var(--tcg-muted)' }}>—</span>
  return <span>{String(valor)}</span>
}

// ─── Loading ─────────────────────────────────────────────────────────────────

function TCGLoading({ colSpan }: { colSpan: number }) {
  return (
    <tr>
      <td colSpan={colSpan} style={{ padding: 0 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'center', paddingTop: '8%', minHeight: 200 }}>
          <GravityLoader texto="Carregando" />
        </div>
      </td>
    </tr>
  )
}

// ─── Ações de linha ───────────────────────────────────────────────────────────

function AcoesLinha<T>({ acoes, item }: { acoes: TCGAcao<T>[]; item: T }) {
  if (!acoes.length) return null
  return (
    <div className="tcg-acoes-grupo">
      {acoes.map((acao) => {
        if (acao.renderCustom) return <React.Fragment key={acao.id}>{acao.renderCustom(item)}</React.Fragment>
        return (
          <TooltipGlobal key={acao.id} descricao={acao.tooltip}>
            <button
              type="button"
              className="tcg-acao-btn"
              onClick={(e) => { e.stopPropagation(); acao.onClick?.(item) }}
            >
              {acao.icone}
            </button>
          </TooltipGlobal>
        )
      })}
    </div>
  )
}

// ─── Componente principal ─────────────────────────────────────────────────────

export function TabelaCamadasGlobal<T = any, C = any>(props: TabelaCamadasGlobalProps<T, C>) {
  const {
    dados,
    colunas,
    colunasFilhas,
    filhos,
    acoes = [],
    acoesFilhas = [],
    acoesExportacao = [],
    placeholderBusca,
    campoBusca,
    mensagemVazio,
    carregando = false,
    expandidosPadrao = [],
    itemId = (item: T) => (item as any).id,
    itensPorPagina: itensPorPaginaInicial = 10,
    id: tableId,
    acoesLote = [],
    acoesBarra,
    emptyIcon,
    emptyTitle,
    emptyDescription,
    emptyAction,
  } = props

  const { t } = useTranslation()
  const resolvedPlaceholderBusca = placeholderBusca ?? t('tabela.localizar')
  const resolvedMensagemVazio = mensagemVazio ?? t('tabela.nenhum_item')

  // ─── Visibilidade de Colunas ─────────────────────────────────────────────
  const colunasConfig = useMemo(() => colunas.map(c => ({
    key: c.key as string,
    label: c.label,
    naoOcultavel: (c as any).naoOcultavel,
  })), [colunas])

  const {
    visibleKeys,
    isVisible,
    toggleVisibility,
    resetToDefault,
    setAllVisible,
    clearAllVisible,
    columnOrder, setColumnOrder,
  } = useTablePersistence({
    tableId: tableId || 'tcg-default',
    initialKeys: colunas.map(c => c.key as string),
    defaultHiddenKeys: colunas.filter(c => (c as any).oculta).map(c => c.key as string),
  })

  // Colunas pai ordenadas conforme columnOrder persistido
  const colunasOrdenadas = useMemo(() => {
    if (!tableId || !columnOrder || columnOrder.length === 0) return colunas
    return [...colunas].sort((a, b) => {
      const ia = columnOrder.indexOf(a.key as string)
      const ib = columnOrder.indexOf(b.key as string)
      if (ia === -1) return 1
      if (ib === -1) return -1
      return ia - ib
    })
  }, [colunas, tableId, columnOrder])

  const colunasVisiveis = useMemo(() =>
    tableId ? colunasOrdenadas.filter(c => isVisible(c.key as string)) : colunasOrdenadas,
    [colunasOrdenadas, tableId, isVisible]
  )

  const colunasFilhasVisiveis = useMemo(() =>
    tableId ? colunasFilhas.filter(c => isVisible(c.key as string)) : colunasFilhas,
    [colunasFilhas, tableId, isVisible]
  )

  function handleReordenarColunas(de: number, para: number) {
    if (!setColumnOrder) return
    const chaves = colunasOrdenadas.map(c => c.key as string)
    const nova = [...chaves]
    const [item] = nova.splice(de, 1)
    nova.splice(para, 0, item)
    setColumnOrder(nova)
  }

  const [visibilidadeAberta, setVisibilidadeAberta] = useState(false)
  const visibilidadeBtnRef = useRef<HTMLButtonElement>(null)

  // ─── Busca ───────────────────────────────────────────────────────────────
  const [busca, setBusca] = useState('')

  // ─── Filtros por coluna ───────────────────────────────────────────────────
  const initialFiltros: Record<string, FiltroVal> = useMemo(() => {
    const acc: Record<string, FiltroVal> = {}
    colunas.forEach(c => {
      if (!c.filtravel) return
      if (c.tipo === 'numero') acc[c.key as string] = { min: '', max: '' }
      else if (c.tipo === 'periodo') acc[c.key as string] = { inicio: '', fim: '' }
      else acc[c.key as string] = new Set<string>()
    })
    return acc
  }, [colunas])

  const [filtrosColuna, setFiltrosColuna] = useState<Record<string, FiltroVal>>(initialFiltros)

  const toggleFiltroValor = useCallback((coluna: string, valor: string) => {
    setFiltrosColuna(prev => {
      const atual = (prev[coluna] as Set<string>) ?? new Set<string>()
      const next = new Set(atual)
      next.has(valor) ? next.delete(valor) : next.add(valor)
      return { ...prev, [coluna]: next }
    })
    setPagina(1)
  }, [])

  const filtrarNumero = useCallback((coluna: string, campo: 'min' | 'max', valor: string) => {
    setFiltrosColuna(prev => ({
      ...prev,
      [coluna]: { ...(prev[coluna] as { min: string; max: string }), [campo]: valor },
    }))
    setPagina(1)
  }, [])

  const filtrarPeriodo = useCallback((coluna: string, campo: 'inicio' | 'fim', valor: string) => {
    setFiltrosColuna(prev => ({
      ...prev,
      [coluna]: { ...(prev[coluna] as { inicio: string; fim: string }), [campo]: valor },
    }))
    setPagina(1)
  }, [])

  const limparFiltroColuna = useCallback((coluna: string) => {
    setFiltrosColuna(prev => {
      const col = colunas.find(c => c.key === coluna)
      const tipo = col?.tipo
      return {
        ...prev,
        [coluna]: tipo === 'numero'
          ? { min: '', max: '' }
          : tipo === 'periodo'
          ? { inicio: '', fim: '' }
          : new Set<string>(),
      }
    })
  }, [colunas])

  // ─── Ordenação ────────────────────────────────────────────────────────────
  const [ordenacao, setOrdenacao] = useState<{ key: string; dir: SortDir } | null>(null)

  const handleOrdenar = useCallback((coluna: string, dir: SortDir) => {
    setOrdenacao({ key: coluna, dir })
    setPagina(1)
  }, [])

  // ─── Seleção ──────────────────────────────────────────────────────────────
  const temSelecao = acoesLote.length > 0
  const [selecionados, setSelecionados] = useState<Set<string>>(new Set())
  const checkboxAllRef = useRef<HTMLInputElement>(null)

  const toggleSelecionado = (id: string) => {
    setSelecionados(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  // ─── Paginação / Expansão ─────────────────────────────────────────────────
  const [expandidos, setExpandidos] = useState<Set<string>>(new Set(expandidosPadrao))
  const [pagina, setPagina] = useState(1)
  const [itensPorPagina, setItensPorPagina] = useState(itensPorPaginaInicial)
  const [exportMenuAberto, setExportMenuAberto] = useState(false)
  const exportRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (exportRef.current && !exportRef.current.contains(e.target as Node)) {
        setExportMenuAberto(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  // ─── Pipeline de dados ────────────────────────────────────────────────────

  // 1. busca global
  const dadosBusca = useMemo(() => {
    if (!busca.trim()) return dados
    const q = busca.toLowerCase()
    return dados.filter(item => {
      if (campoBusca) return String((item as any)[campoBusca]).toLowerCase().includes(q)
      return colunasVisiveis.some(c => String((item as any)[c.key]).toLowerCase().includes(q))
    })
  }, [dados, busca, campoBusca, colunasVisiveis])

  // 2. filtros por coluna
  const dadosFiltrados = useMemo(() => {
    return dadosBusca.filter(item => {
      return colunas.every(c => {
        if (!c.filtravel) return true
        const st = filtrosColuna[c.key as string]
        if (!st) return true
        const tipo = c.tipo ?? 'texto'
        if (tipo === 'numero') {
          const { min, max } = st as { min: string; max: string }
          if (!min && !max) return true
          const num = parseFloat(String((item as any)[c.key] ?? ''))
          if (isNaN(num)) return true
          if (min && num < parseFloat(min)) return false
          if (max && num > parseFloat(max)) return false
          return true
        }
        if (tipo === 'periodo') {
          const { inicio, fim } = st as { inicio: string; fim: string }
          if (!inicio && !fim) return true
          const val = String((item as any)[c.key] ?? '').substring(0, 10)
          if (!val) return true
          if (inicio && val < inicio) return false
          if (fim && val > fim) return false
          return true
        }
        // texto / badge / custom
        const set = st as Set<string>
        if (set.size === 0) return true
        return set.has(String((item as any)[c.key] ?? ''))
      })
    })
  }, [dadosBusca, colunas, filtrosColuna])

  // 3. ordenação
  const dadosOrdenados = useMemo(() => {
    if (!ordenacao) return dadosFiltrados
    return [...dadosFiltrados].sort((a, b) => {
      const va = (a as any)[ordenacao.key]
      const vb = (b as any)[ordenacao.key]
      const cmp = va < vb ? -1 : va > vb ? 1 : 0
      return ordenacao.dir === 'asc' ? cmp : -cmp
    })
  }, [dadosFiltrados, ordenacao])

  const totalPaginas = Math.max(1, Math.ceil(dadosOrdenados.length / itensPorPagina))
  const paginaAtual = Math.min(pagina, totalPaginas)
  const inicio = (paginaAtual - 1) * itensPorPagina
  const dadosPagina = dadosOrdenados.slice(inicio, inicio + itensPorPagina)

  // checkbox "selecionar todos"
  useEffect(() => {
    if (!checkboxAllRef.current) return
    const total = dadosPagina.length
    const sel = dadosPagina.filter(item => selecionados.has(itemId(item))).length
    checkboxAllRef.current.indeterminate = sel > 0 && sel < total
    checkboxAllRef.current.checked = total > 0 && sel === total
  }, [selecionados, dadosPagina, itemId])

  const toggleSelecionarTodos = () => {
    const ids = dadosPagina.map(item => itemId(item))
    const todosSelected = ids.every(id => selecionados.has(id))
    setSelecionados(prev => {
      const next = new Set(prev)
      if (todosSelected) ids.forEach(id => next.delete(id))
      else ids.forEach(id => next.add(id))
      return next
    })
  }

  const itensSelecionados = useMemo(
    () => dados.filter(item => selecionados.has(itemId(item))),
    [dados, selecionados, itemId]
  )

  function toggleExpandido(id: string) {
    setExpandidos(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const temExport = acoesExportacao.length > 0
  const temAcoes = acoes.length > 0
  const colSpan = 1 + colunasVisiveis.length + (temAcoes ? 1 : 0) + (temSelecao ? 1 : 0)

  return (
    <div className="tcg-container">

      {/* ── Toolbar ── */}
      <div className="tcg-toolbar">
        <div className="tcg-toolbar-esquerda">
          <div className="tcg-busca-wrapper">
            <span className="tcg-busca-icone"><IconeBusca /></span>
            <input
              className="tcg-busca-input"
              type="text"
              placeholder={resolvedPlaceholderBusca}
              value={busca}
              onChange={e => { setBusca(e.target.value); setPagina(1) }}
            />
            {busca && (
              <button type="button" className="tcg-busca-clear" onClick={() => { setBusca(''); setPagina(1) }} aria-label="Limpar busca">
                <X size={12} weight="bold" />
              </button>
            )}
          </div>
        </div>

        <div className="tcg-toolbar-direita">
          {tableId && (
            <div style={{ position: 'relative' }}>
              <TooltipGlobal descricao={t('tabela.gerenciar_colunas')}>
                <button
                  ref={visibilidadeBtnRef}
                  type="button"
                  className="tcg-btn"
                  onClick={() => setVisibilidadeAberta(v => !v)}
                  style={{ minWidth: 'auto', padding: '0.4375rem 0.625rem' }}
                >
                  <Columns size={13} weight="bold" />
                </button>
              </TooltipGlobal>
              {visibilidadeAberta && (
                <VisibilidadeColunas
                  colunas={colunasConfig}
                  visibleKeys={visibleKeys}
                  onToggle={toggleVisibility}
                  onReset={resetToDefault}
                  onShowAll={setAllVisible}
                  onHideAll={clearAllVisible}
                  onFechar={() => setVisibilidadeAberta(false)}
                  triggerRef={visibilidadeBtnRef as React.RefObject<HTMLButtonElement | null>}
                  onReordenar={handleReordenarColunas}
                />
              )}
            </div>
          )}

          {temExport && (
            <div className="tcg-export-wrapper" ref={exportRef}>
              <button type="button" className="tcg-btn" onClick={() => setExportMenuAberto(v => !v)}>
                <IconeExport />
                {t('tabela.exportar')}
                <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                  <path d="M3 5l3 3 3-3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
              {exportMenuAberto && (
                <div className="tcg-export-menu">
                  {acoesExportacao.map((acao, i) => (
                    <button key={i} type="button" className="tcg-export-item" onClick={() => { acao.onClick(dadosFiltrados); setExportMenuAberto(false) }}>
                      {acao.icone}
                      {acao.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {acoesBarra}
        </div>
      </div>

      {/* ── Barra de ações em lote ── */}
      {temSelecao && selecionados.size > 0 && (
        <div className="tcg-lote-bar">
          <span className="tcg-lote-info">
            {selecionados.size} {selecionados.size === 1 ? 'item selecionado' : 'itens selecionados'}
          </span>
          <div className="tcg-lote-acoes">
            {acoesLote.map(acao => (
              <button
                key={acao.id}
                type="button"
                className={`tcg-lote-btn${acao.variant === 'danger' ? ' tcg-lote-btn--danger' : ''}`}
                onClick={() => { acao.onClick(itensSelecionados); setSelecionados(new Set()) }}
              >
                {acao.icone}
                {acao.label}
              </button>
            ))}
            <button type="button" className="tcg-lote-btn tcg-lote-btn--ghost" onClick={() => setSelecionados(new Set())}>
              <X size={12} weight="bold" />
              Limpar
            </button>
          </div>
        </div>
      )}

      {/* ── Tabela ── */}
      <div className="tcg-scroll">
        <table className="tcg-tabela">

          <thead className="tcg-cabecalho">
            <tr>
              {temSelecao && (
                <th className="tcg-th tcg-th--check">
                  <input ref={checkboxAllRef} type="checkbox" className="tcg-checkbox" onChange={toggleSelecionarTodos} aria-label="Selecionar todos" />
                </th>
              )}
              {/* Coluna expand — sem filtro */}
              <th className="tcg-th tcg-th--expand" />

              {colunasVisiveis.map(col => (
                col.filtravel
                  ? <ThFiltro
                      key={col.key as string}
                      col={col}
                      filtros={filtrosColuna}
                      ordenacao={ordenacao}
                      dados={dados}
                      onOrdenar={handleOrdenar}
                      onToggleValor={toggleFiltroValor}
                      onFiltrarNumero={filtrarNumero}
                      onFiltrarPeriodo={filtrarPeriodo}
                      onLimparColuna={limparFiltroColuna}
                    />
                  : <th
                      key={col.key as string}
                      className={[
                        'tcg-th',
                        col.align === 'center' ? 'tcg-th--center' : col.align === 'right' ? 'tcg-th--right' : '',
                      ].filter(Boolean).join(' ')}
                    >
                      <span className="tcg-th-inner">
                        {col.tooltipTitulo
                          ? <TooltipGlobal titulo={col.tooltipTitulo} descricao={col.tooltipDescricao}>{col.label}</TooltipGlobal>
                          : col.label
                        }
                      </span>
                    </th>
              ))}

              {temAcoes && <th className="tcg-th tcg-th--acoes">{t('tabela.acoes')}</th>}
            </tr>
          </thead>

          <tbody>
            {carregando ? (
              <TCGLoading colSpan={colSpan} />
            ) : dadosPagina.length === 0 ? (
              <tr>
                <td colSpan={colSpan} className="tcg-vazio">
                  {(emptyIcon || emptyTitle || emptyDescription) ? (
                    <>
                      {emptyIcon && <div className="tcg-vazio__icone">{emptyIcon}</div>}
                      <p className="tcg-vazio__titulo">{emptyTitle ?? resolvedMensagemVazio}</p>
                      {emptyDescription && <p className="tcg-vazio__desc">{emptyDescription}</p>}
                      {emptyAction && <div className="tcg-vazio__acao">{emptyAction}</div>}
                    </>
                  ) : (
                    resolvedMensagemVazio
                  )}
                </td>
              </tr>
            ) : (
              dadosPagina.map(item => {
                const id = itemId(item)
                const aberto = expandidos.has(id)
                const filhosItem = filhos(item)
                const temFilhos = filhosItem.length > 0
                const ehUltimoGrupo = dadosPagina[dadosPagina.length - 1] === item
                const estaSelecionado = selecionados.has(id)

                return (
                  <React.Fragment key={id}>
                    <tr
                      className={[
                        'tcg-tr-pai',
                        aberto ? 'tcg-tr-pai--expandida' : '',
                        !aberto && !ehUltimoGrupo ? 'tcg-tr-pai--borda' : '',
                        estaSelecionado ? 'tcg-tr-pai--selecionada' : '',
                      ].filter(Boolean).join(' ')}
                      onClick={() => temFilhos && toggleExpandido(id)}
                    >
                      {temSelecao && (
                        <td className="tcg-td tcg-td--check" onClick={e => e.stopPropagation()}>
                          <input type="checkbox" className="tcg-checkbox" checked={estaSelecionado} onChange={() => toggleSelecionado(id)} aria-label="Selecionar linha" />
                        </td>
                      )}
                      <td className="tcg-td tcg-td--expand">
                        {temFilhos ? (
                          <button type="button" className="tcg-chevron-btn" onClick={e => { e.stopPropagation(); toggleExpandido(id) }} aria-label={aberto ? 'Recolher' : 'Expandir'}>
                            <span className={`tcg-chevron-icon${aberto ? ' tcg-chevron-icon--aberto' : ''}`}><IconeChevron /></span>
                          </button>
                        ) : (
                          <span style={{ display: 'inline-block', width: 24 }} />
                        )}
                      </td>

                      {colunasVisiveis.map((col, colIdx) => (
                        <td key={col.key as string} className={`tcg-td${col.align === 'center' ? ' tcg-td--center' : col.align === 'right' ? ' tcg-td--right' : ''}`}>
                          {colIdx === 0 && temFilhos ? (
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 0 }}>
                              {renderCelula(col, item)}
                              <span className="tcg-badge-filhos">{filhosItem.length}</span>
                            </span>
                          ) : renderCelula(col, item)}
                        </td>
                      ))}

                      {temAcoes && (
                        <td className="tcg-td tcg-td--acoes" onClick={e => e.stopPropagation()}>
                          <AcoesLinha acoes={acoes} item={item} />
                        </td>
                      )}
                    </tr>

                    {temFilhos && filhosItem.map((filho, fi) => {
                      const isUltimo = fi === filhosItem.length - 1
                      return (
                        <tr key={(filho as any).id ?? fi} className={`tcg-tr-filho${aberto ? ' tcg-tr-filho--visivel' : ''}${isUltimo ? ' tcg-tr-filho--ultimo' : ''}`} style={{ animationDelay: `${fi * 20}ms` }}>
                          {temSelecao && <td className="tcg-td tcg-td--check" />}
                          <td className="tcg-td tcg-td--filho-expand">
                            <span className="tcg-conector">{isUltimo ? '└' : '├'}</span>
                          </td>
                          {colunasFilhasVisiveis.map((col, colIdx) => (
                            <td key={col.key} className={`tcg-td tcg-td--filho${col.align === 'center' ? ' tcg-td--center' : col.align === 'right' ? ' tcg-td--right' : ''}${colIdx === 0 ? ' tcg-td--filho-first' : ''}`}>
                              {renderCelula(col, filho)}
                            </td>
                          ))}
                          {temAcoes && (
                            <td className="tcg-td tcg-td--acoes tcg-td--filho">
                              {acoesFilhas.length > 0 ? <AcoesLinha acoes={acoesFilhas} item={filho} /> : null}
                            </td>
                          )}
                        </tr>
                      )
                    })}
                  </React.Fragment>
                )
              })
            )}
          </tbody>
        </table>
      </div>

      {/* ── Paginação ── */}
      <div className="tcg-paginacao">
        <span className="tcg-paginacao-info">
          {carregando
            ? t('comum.carregando')
            : `${dadosOrdenados.length === 0 ? 0 : inicio + 1}–${Math.min(inicio + itensPorPagina, dadosOrdenados.length)} de ${dadosOrdenados.length}`
          }
        </span>
        <div className="tcg-paginacao-controles">
          <button className="tcg-pag-btn" disabled={paginaAtual <= 1} onClick={() => setPagina(1)}>«</button>
          <button className="tcg-pag-btn" disabled={paginaAtual <= 1} onClick={() => setPagina((p: number) => p - 1)}><IconeAnterior /></button>
          <span className="tcg-paginacao-pagina">{paginaAtual} / {totalPaginas}</span>
          <button className="tcg-pag-btn" disabled={paginaAtual >= totalPaginas} onClick={() => setPagina((p: number) => p + 1)}><IconeProximo /></button>
          <button className="tcg-pag-btn" disabled={paginaAtual >= totalPaginas} onClick={() => setPagina(totalPaginas)}>»</button>
        </div>
        <div className="tcg-paginacao-tamanho">
          <span>{t('tabela.por_pagina_label')}</span>
          <select className="tcg-select-pagina" value={itensPorPagina} onChange={e => { setItensPorPagina(Number(e.target.value)); setPagina(1) }}>
            {[5, 10, 20, 50].map(n => <option key={n} value={n}>{n}</option>)}
          </select>
        </div>
      </div>

    </div>
  )
}
