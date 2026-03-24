import React, { useState, useMemo, useRef, useEffect, useCallback, memo } from 'react'
import ReactDOM from 'react-dom'
import { TooltipGlobal } from '@nucleo/tooltip-global'
import { Funnel, ArrowUp, ArrowDown, MagnifyingGlass, X, DownloadSimple, CheckSquare, Square, CaretDown } from '@phosphor-icons/react'
import './tabela.css'

export type ColType = 'texto' | 'numero'
export type SortDir = 'asc' | 'desc'

export interface TabelaGlobalColuna<T> {
  key: keyof T & string
  label: string
  tipo: ColType
  render?: (valor: any, item: T) => React.ReactNode
  tooltipTitulo?: string
  tooltipDescricao?: string
  largura?: string | number
  align?: 'left' | 'center' | 'right'
}

export interface TabelaGlobalAcao<T> {
  id: string
  icone: React.ReactNode
  tooltip: string
  onClick: (item: T) => void
  disabled?: (item: T) => boolean
  onRenderStyle?: (item: T) => { background?: string; borderColor?: string; color?: string }
  renderCustom?: (item: T) => React.ReactNode
}

export interface TabelaExportAcao<T> {
  label: string
  icone: React.ReactNode
  onClick: (dadosVisiveis: T[]) => void
}

export interface TabelaGlobalProps<T extends Record<string, any>> {
  dados: T[]
  colunas: TabelaGlobalColuna<T>[]
  acoes?: TabelaGlobalAcao<T>[]
  acoesExportacao?: TabelaExportAcao<T>[]
  idKey?: keyof T & string // Padrão "id"
  mensagemVazio?: string
  mensagemSemFiltro?: string
}

type FiltrosStateVal = Set<string> | { min: string; max: string }

function PopoverFiltro({
  tipo, coluna, label, filtros, ordenacao,
  valoresDisponiveis, valoresSelecionados,
  minMax,
  triggerRef,
  onOrdenar, onToggleValor, onFiltrarNumero, onLimpar, onFechar,
}: {
  tipo: ColType, coluna: string, label: string
  filtros: any, ordenacao: any, valoresDisponiveis: string[], valoresSelecionados: Set<string>,
  minMax: { min: string; max: string }
  triggerRef: React.RefObject<HTMLButtonElement>
  onOrdenar: (c: string, d: SortDir) => void
  onToggleValor: (c: string, v: string) => void
  onFiltrarNumero: (c: string, tipo: 'min' | 'max', v: string) => void
  onLimpar: () => void, onFechar: () => void
}) {
  const ref = useRef<HTMLDivElement>(null)
  const [buscaLocal, setBuscaLocal] = useState('')
  const [pos, setPos] = useState({ top: 0, left: 0 })

  useEffect(() => {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect()
      setPos({
        top: rect.bottom + window.scrollY + 4,
        left: rect.left + window.scrollX,
      })
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

  const sortAtivo = ordenacao?.coluna === coluna

  const valoresFiltrados = useMemo(() =>
    buscaLocal.trim()
      ? valoresDisponiveis.filter(v => v.toLowerCase().includes(buscaLocal.toLowerCase()))
      : valoresDisponiveis,
    [valoresDisponiveis, buscaLocal]
  )

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '0.375rem 0.5rem 0.375rem 1.75rem',
    background: 'rgba(56,189,248,0.05)', border: '1px solid rgba(56,189,248,0.15)',
    borderRadius: '6px', color: '#f1f5f9', fontSize: '0.8125rem',
    fontFamily: 'inherit', outline: 'none',
  }

  const pillStyle = (ativo: boolean): React.CSSProperties => ({
    flex: 1, display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    gap: '0.3rem', padding: '0.375rem 0.5rem', borderRadius: '9999px',
    background: ativo ? 'rgba(56,189,248,0.15)' : 'rgba(255,255,255,0.04)',
    border: `1px solid ${ativo ? 'rgba(56,189,248,0.35)' : 'rgba(255,255,255,0.1)'}`,
    color: ativo ? '#38bdf8' : '#94a3b8',
    fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer',
    fontFamily: 'inherit', transition: 'all 0.12s', whiteSpace: 'nowrap'
  })

  const style: React.CSSProperties = {
    position: 'fixed', top: pos.top, left: pos.left, zIndex: 9999,
    background: 'var(--ws-surface, #1e293b)', border: '1px solid rgba(56,189,248,0.18)',
    borderRadius: '10px', boxShadow: '0 12px 32px rgba(0,0,0,0.6)',
    minWidth: '220px', maxWidth: '280px', fontFamily: 'var(--font, Plus Jakarta Sans)',
  }

  return ReactDOM.createPortal(
    <div ref={ref} style={style} onClick={e => e.stopPropagation()}>
      <div style={{ padding: '0.4rem 0.875rem', borderBottom: '1px solid rgba(56,189,248,0.08)' }}>
        <span style={{ fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#64748b' }}>{label}</span>
      </div>

      <div style={{ padding: '0.5rem 0.625rem', borderBottom: '1px solid rgba(56,189,248,0.08)' }}>
        <p style={{ fontSize: '0.6rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#475569', marginBottom: '0.375rem' }}>Ordenar</p>
        <div style={{ display: 'flex', gap: '0.375rem' }}>
          {([['asc', 'Cresc.', <ArrowUp key="u" size={12} weight="bold" />], ['desc', 'Decresc.', <ArrowDown key="d" size={12} weight="bold" />]] as [SortDir, string, React.ReactNode][]).map(([dir, rot, ico]) => {
            const ativo = sortAtivo && ordenacao?.direcao === dir
            return (
              <button key={dir} type="button" onClick={() => { onOrdenar(coluna, dir); onFechar() }} style={pillStyle(ativo)}
                onMouseEnter={e => { if (!ativo) { e.currentTarget.style.background = 'rgba(56,189,248,0.08)'; e.currentTarget.style.borderColor = 'rgba(56,189,248,0.2)'; e.currentTarget.style.color = '#f1f5f9' } }}
                onMouseLeave={e => { if (!ativo) { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = '#94a3b8' } }}>
                {ico} {rot}
              </button>
            )
          })}
        </div>
      </div>

      {tipo === 'texto' && (
        <div style={{ borderBottom: '1px solid rgba(56,189,248,0.08)' }}>
          <p style={{ padding: '0.45rem 0.875rem 0.25rem', fontSize: '0.6rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#475569' }}>Filtrar por</p>
          {valoresDisponiveis.length > 5 && (
            <div style={{ padding: '0.25rem 0.625rem', position: 'relative' }}>
              <span style={{ position: 'absolute', left: '1.1rem', top: '50%', transform: 'translateY(-50%)', color: '#64748b', display: 'flex', lineHeight: 0 }}>
                <MagnifyingGlass size={11} weight="bold" />
              </span>
              <input type="text" placeholder="Buscar…" value={buscaLocal}
                onChange={e => setBuscaLocal(e.target.value)}
                style={{ ...inputStyle, paddingLeft: '1.6rem', fontSize: '0.75rem' }}
                onFocus={e => { e.currentTarget.style.borderColor = '#38bdf8' }}
                onBlur={e => { e.currentTarget.style.borderColor = 'rgba(56,189,248,0.15)' }}
              />
            </div>
          )}
          <div style={{ maxHeight: '180px', overflowY: 'auto', padding: '0.3rem 0.5rem', scrollbarWidth: 'thin', scrollbarColor: '#334155 transparent' }}>
            {valoresFiltrados.length === 0 ? (
              <p style={{ fontSize: '0.75rem', color: '#475569', padding: '0.5rem', textAlign: 'center' }}>Nenhum valor</p>
            ) : valoresFiltrados.map(v => {
              const selecionado = valoresSelecionados.has(v)
              return (
                <label key={v}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.35rem 0.375rem', cursor: 'pointer', borderRadius: '6px', transition: 'background 0.1s' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(56,189,248,0.06)' }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent' }}
                >
                  <span style={{ color: selecionado ? '#38bdf8' : '#475569', display: 'flex', lineHeight: 0, flexShrink: 0 }}>
                    {selecionado ? <CheckSquare size={15} weight="fill" /> : <Square size={15} weight="regular" />}
                  </span>
                  <input type="checkbox" checked={selecionado} onChange={() => onToggleValor(coluna, v)} style={{ display: 'none' }} />
                  <span style={{ fontSize: '0.8125rem', color: '#cbd5e1', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{v}</span>
                </label>
              )
            })}
          </div>
        </div>
      )}

      {tipo === 'numero' && (
        <div style={{ padding: '0.5rem 0.625rem', borderBottom: '1px solid rgba(56,189,248,0.08)' }}>
          <p style={{ fontSize: '0.6rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.375rem' }}>Intervalo</p>
          <div style={{ display: 'flex', gap: '0.375rem', alignItems: 'center' }}>
            {(['min', 'max'] as const).map((campo, i) => (
              <input key={campo}
                type="text" inputMode="numeric" pattern="[0-9]*"
                placeholder={i === 0 ? 'Mín' : 'Máx'}
                autoComplete="off"
                value={minMax[campo]}
                onChange={e => {
                  const v = e.target.value.replace(/[^0-9]/g, '')
                  onFiltrarNumero(coluna, campo, v)
                }}
                style={{ flex: 1, width: 0, padding: '0.375rem 0.5rem', background: 'rgba(56,189,248,0.05)', border: '1px solid rgba(56,189,248,0.15)', borderRadius: '6px', color: '#f1f5f9', fontSize: '0.8125rem', fontFamily: 'inherit', outline: 'none' }}
                onFocus={e => { e.currentTarget.style.borderColor = '#38bdf8' }}
                onBlur={e => { e.currentTarget.style.borderColor = 'rgba(56,189,248,0.15)' }}
              />
            ))}
          </div>
        </div>
      )}

      <div style={{ padding: '0.375rem 0.5rem 0.3rem' }}>
        <button type="button" onClick={() => { onLimpar(); onFechar() }}
          style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', width: '100%', padding: '0.35rem 0.5rem', borderRadius: '6px', background: 'transparent', border: 'none', cursor: 'pointer', color: '#64748b', fontSize: '0.8125rem', fontFamily: 'inherit', transition: 'color 0.12s' }}
          onMouseEnter={e => { e.currentTarget.style.color = '#f87171' }}
          onMouseLeave={e => { e.currentTarget.style.color = '#64748b' }}>
          <X size={12} weight="bold" /> Limpar filtro
        </button>
      </div>
    </div>,
    document.body
  )
}

function ThInner<T>({ col, filtros, ordenacao, dados, onOrdenar, onToggleValor, onFiltrarNumero, onLimparColuna }: { col: TabelaGlobalColuna<T>, filtros: Record<string, FiltrosStateVal>, ordenacao: any, dados: T[], onOrdenar: any, onToggleValor: any, onFiltrarNumero: any, onLimparColuna: any }) {
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
  const temFiltroAtivo = col.tipo === 'texto' ? (stateVal as Set<string>).size > 0 : !!((stateVal as {min: string, max: string}).min || (stateVal as {min: string, max: string}).max)

  const labelSpan = (
    <span style={{ color: sortAtivo ? '#38bdf8' : undefined, lineHeight: 1, display: 'inline-block' }}>
      {col.label}
    </span>
  )

  return (
    <th style={{ width: col.largura, padding: '0.75rem 1rem', textAlign: col.align || 'left', whiteSpace: 'nowrap', fontSize: '0.6875rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: '#64748b', borderBottom: '1px solid rgba(56,189,248,0.1)', background: 'rgba(56,189,248,0.04)', position: 'relative', userSelect: 'none', verticalAlign: 'middle' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', justifyContent: col.align === 'center' ? 'center' : col.align === 'right' ? 'flex-end' : 'flex-start' }}>
        {col.tooltipDescricao
          ? <TooltipGlobal titulo={col.tooltipTitulo} descricao={col.tooltipDescricao}>{labelSpan}</TooltipGlobal>
          : labelSpan
        }
        <button ref={triggerRef} type="button" onClick={e => { e.stopPropagation(); setAberto(v => !v) }}
          style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 16, height: 16, borderRadius: '4px', background: temFiltroAtivo || aberto ? 'rgba(56,189,248,0.15)' : 'transparent', border: `1px solid ${temFiltroAtivo || aberto ? 'rgba(56,189,248,0.3)' : 'transparent'}`, cursor: 'pointer', padding: 0, flexShrink: 0, color: temFiltroAtivo || aberto ? '#38bdf8' : '#64748b', transition: 'all 0.12s', lineHeight: 0, verticalAlign: 'middle' }}>
          <Funnel size={10} weight={temFiltroAtivo ? 'fill' : 'bold'} />
        </button>
      </div>
      {aberto && (
        <PopoverFiltro
          tipo={col.tipo} coluna={coluna} label={col.label}
          filtros={filtros} ordenacao={ordenacao}
          valoresDisponiveis={valoresDisponiveis}
          valoresSelecionados={col.tipo === 'texto' ? (stateVal as Set<string>) : new Set()}
          minMax={col.tipo === 'numero' ? (stateVal as {min: string, max: string}) : {min: '', max: ''}}
          triggerRef={triggerRef}
          onOrdenar={onOrdenar}
          onToggleValor={onToggleValor}
          onFiltrarNumero={onFiltrarNumero}
          onLimpar={() => onLimparColuna(coluna)}
          onFechar={handleFechar}
        />
      )}
    </th>
  )
}
const Th = memo(ThInner) as typeof ThInner

function FiltroChip({ label, onRemover }: { label: string; onRemover: () => void }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', padding: '0.2rem 0.5rem 0.2rem 0.65rem', borderRadius: '9999px', background: 'rgba(56,189,248,0.1)', border: '1px solid rgba(56,189,248,0.25)', color: '#38bdf8', fontSize: '0.75rem', fontWeight: 600, whiteSpace: 'nowrap' }}>
      {label}
      <button type="button" onClick={onRemover} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 14, height: 14, borderRadius: '50%', background: 'rgba(56,189,248,0.2)', border: 'none', cursor: 'pointer', color: '#38bdf8', padding: 0, flexShrink: 0 }}>
        <X size={9} weight="bold" />
      </button>
    </span>
  )
}

function ExportMenuItem({ label, icon, onClick }: { label: string; icon: React.ReactNode; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick}
      style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', width: '100%', padding: '0.45rem 0.875rem', background: 'transparent', border: 'none', color: '#94a3b8', fontSize: '0.8125rem', fontFamily: 'inherit', cursor: 'pointer', textAlign: 'left', transition: 'background 0.1s, color 0.1s' }}
      onMouseEnter={e => { e.currentTarget.style.background = 'rgba(56,189,248,0.07)'; e.currentTarget.style.color = '#f1f5f9' }}
      onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#94a3b8' }}>
      <span style={{ color: '#38bdf8', display: 'flex', flexShrink: 0 }}>{icon}</span>
      {label}
    </button>
  )
}

export function TabelaGlobal<T extends Record<string, any>>({ dados, colunas, acoes, acoesExportacao, idKey = 'id', mensagemVazio = 'Nenhum resultado.', mensagemSemFiltro = 'Nenhum registro cadastrado.' }: TabelaGlobalProps<T>) {
  const [busca, setBusca] = useState('')
  const [ordenacao, setOrdenacao] = useState<{ coluna: string; direcao: SortDir } | null>(null)
  
  const initialFiltros: Record<string, FiltrosStateVal> = {}
  colunas.forEach(c => {
    if (c.tipo === 'texto') initialFiltros[c.key] = new Set<string>()
    if (c.tipo === 'numero') initialFiltros[c.key] = { min: '', max: '' }
  })
  
  const [filtros, setFiltros] = useState<Record<string, FiltrosStateVal>>(initialFiltros)
  const [pagina, setPagina] = useState(1)
  const [porPagina, setPorPagina] = useState(10)
  const [selecionados, setSelecionados] = useState<Set<string>>(new Set())

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

  const onOrdenar = useCallback((col: string, dir: SortDir) => setOrdenacao({ coluna: col, direcao: dir }), [])

  const onLimparColuna = useCallback((col: string) => {
    setFiltros(prev => {
      const n = { ...prev }
      if (n[col] instanceof Set) n[col] = new Set()
      else n[col] = { min: '', max: '' }
      return n
    })
    if (ordenacao?.coluna === col) setOrdenacao(null)
    setPagina(1)
  }, [ordenacao])

  const limparTudo = useCallback(() => {
    setBusca('')
    setFiltros(initialFiltros)
    setOrdenacao(null)
    setPagina(1)
  }, [initialFiltros])

  const resultado = useMemo(() => {
    let r = [...dados]

    if (busca.trim()) {
      const t = busca.toLowerCase()
      r = r.filter(e => colunas.some(c => String(e[c.key]).toLowerCase().includes(t)))
    }

    colunas.forEach(c => {
      const st = filtros[c.key]
      if (c.tipo === 'texto') {
        const s = st as Set<string>
        if (s.size > 0) r = r.filter(e => s.has(String(e[c.key])))
      } else {
        const num = st as {min: string, max: string}
        if (num.min !== '') r = r.filter(e => Number(e[c.key]) >= Number(num.min))
        if (num.max !== '') r = r.filter(e => Number(e[c.key]) <= Number(num.max))
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
  }, [dados, busca, filtros, ordenacao, colunas])

  const chips = useMemo(() => {
    const list: { key: string; label: string; onRemover: () => void }[] = []
    if (busca.trim()) list.push({ key: 'busca', label: `"${busca}"`, onRemover: () => setBusca('') })
    
    colunas.forEach(c => {
      const st = filtros[c.key]
      if (c.tipo === 'texto') {
        const s = st as Set<string>
        s.forEach(v => list.push({ key: `${c.key}-${v}`, label: `${c.label}: ${v}`, onRemover: () => onToggleValor(c.key, v) }))
      } else {
        const num = st as {min: string, max: string}
        if (num.min !== '' || num.max !== '') {
          list.push({ key: c.key, label: `${c.label}: ${num.min || '0'}–${num.max || '∞'}`, onRemover: () => onLimparColuna(c.key) })
        }
      }
    })
    return list
  }, [busca, colunas, filtros, onToggleValor, onLimparColuna])

  const totalPags = Math.max(1, Math.ceil(resultado.length / porPagina))
  const pagSafe = Math.min(pagina, totalPags)
  const paginado = useMemo(() => resultado.slice((pagSafe - 1) * porPagina, pagSafe * porPagina), [resultado, pagSafe, porPagina])

  const todosSelec = paginado.length > 0 && paginado.every(e => selecionados.has(String(e[idKey as string])))
  const toggleSel = (id: string) => setSelecionados(prev => { const s = new Set(prev); s.has(id) ? s.delete(id) : s.add(id); return s })
  const toggleTodos = (checked: boolean) => setSelecionados(checked ? new Set(paginado.map(e => String(e[idKey as string]))) : new Set())

  const [exportMenuAberto, setExportMenuAberto] = useState(false)
  const exportBtnRef = useRef<HTMLButtonElement>(null)
  const exportMenuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function fora(e: MouseEvent) {
      if (
        exportMenuRef.current && !exportMenuRef.current.contains(e.target as Node) &&
        exportBtnRef.current && !exportBtnRef.current.contains(e.target as Node)
      ) setExportMenuAberto(false)
    }
    document.addEventListener('mousedown', fora)
    return () => document.removeEventListener('mousedown', fora)
  }, [])

  return (
    <div style={{ background: 'var(--ws-surface, #1e293b)', border: '1px solid rgba(56,189,248,0.1)', borderRadius: '12px', overflow: 'hidden', fontFamily: 'var(--font, Plus Jakarta Sans)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem', padding: '0.875rem 1.25rem', borderBottom: chips.length > 0 ? 'none' : '1px solid rgba(56,189,248,0.08)' }}>
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
          <span style={{ position: 'absolute', left: '0.75rem', color: '#818cf8', display: 'flex', lineHeight: 0, opacity: 0.7 }}>
            <MagnifyingGlass size={14} weight="bold" />
          </span>
          <input type="search" placeholder="Localizar" value={busca}
            onChange={e => { setBusca(e.target.value); setPagina(1) }}
            style={{ background: 'var(--ws-bg-body, #0f172a)', border: '1px solid rgba(129,140,248,0.18)', borderRadius: '9999px', padding: '0.4375rem 1rem 0.4375rem 2.25rem', color: 'var(--ws-text, #f1f5f9)', fontSize: '0.875rem', fontFamily: 'var(--font, Plus Jakarta Sans)', fontWeight: 400, minWidth: '240px', outline: 'none', transition: 'border-color 0.15s, box-shadow 0.15s' }}
            onFocus={e => { e.currentTarget.style.borderColor = '#818cf8'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(129,140,248,0.14)' }}
            onBlur={e => { e.currentTarget.style.borderColor = 'rgba(129,140,248,0.18)'; e.currentTarget.style.boxShadow = 'none' }}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
          {chips.length > 0 && (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', padding: '0.25rem 0.65rem', borderRadius: '9999px', background: 'rgba(56,189,248,0.08)', border: '1px solid rgba(56,189,248,0.18)', color: '#38bdf8', fontSize: '0.75rem', fontWeight: 700 }}>
              <Funnel size={11} weight="fill" />
              {chips.length} filtro{chips.length !== 1 ? 's' : ''} ativo{chips.length !== 1 ? 's' : ''}
            </span>
          )}
          {selecionados.size > 0 && (
            <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#38bdf8', padding: '0.25rem 0.75rem', background: 'rgba(56,189,248,0.1)', borderRadius: '9999px' }}>
              {selecionados.size} selecionado{selecionados.size !== 1 ? 's' : ''}
            </span>
          )}
          {(acoesExportacao && acoesExportacao.length > 0) && (
            <div style={{ position: 'relative' }}>
              <button ref={exportBtnRef} type="button"
                onClick={() => setExportMenuAberto(v => !v)}
                style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', padding: '0.4375rem 0.875rem', borderRadius: '9999px', background: exportMenuAberto ? 'rgba(56,189,248,0.1)' : 'transparent', border: `1px solid ${exportMenuAberto ? '#38bdf8' : 'rgba(56,189,248,0.12)'}`, color: exportMenuAberto ? '#38bdf8' : '#94a3b8', fontSize: '0.8125rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s' }}
                onMouseEnter={e => { if (!exportMenuAberto) { e.currentTarget.style.borderColor = '#38bdf8'; e.currentTarget.style.color = '#38bdf8' } }}
                onMouseLeave={e => { if (!exportMenuAberto) { e.currentTarget.style.borderColor = 'rgba(56,189,248,0.12)'; e.currentTarget.style.color = '#94a3b8' } }}>
                <DownloadSimple size={13} weight="bold" /> Exportar <CaretDown size={11} weight="bold" style={{ marginLeft: 1, transition: 'transform 0.15s', transform: exportMenuAberto ? 'rotate(180deg)' : 'rotate(0deg)' }} />
              </button>

              {exportMenuAberto && (
                <div ref={exportMenuRef}
                  style={{ position: 'absolute', top: 'calc(100% + 6px)', right: 0, zIndex: 9999, background: '#1e293b', border: '1px solid rgba(56,189,248,0.18)', borderRadius: '10px', boxShadow: '0 12px 32px rgba(0,0,0,0.55)', minWidth: '200px', fontFamily: 'inherit', overflow: 'hidden' }}
                  onClick={e => e.stopPropagation()}>
                  {acoesExportacao.map(a => (
                    <ExportMenuItem key={a.label} label={a.label} icon={a.icone} onClick={() => { a.onClick(resultado); setExportMenuAberto(false) }} />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {chips.length > 0 && (
        <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '0.375rem', padding: '0.625rem 1.25rem', borderBottom: '1px solid rgba(56,189,248,0.08)', background: 'rgba(56,189,248,0.02)' }}>
          {chips.map(c => <FiltroChip key={c.key} label={c.label} onRemover={c.onRemover} />)}
          <button type="button" onClick={limparTudo}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', marginLeft: 'auto', padding: '0.2rem 0.65rem', borderRadius: '9999px', background: 'transparent', border: '1px solid rgba(239,68,68,0.25)', color: '#94a3b8', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s', whiteSpace: 'nowrap' }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.08)'; e.currentTarget.style.color = '#f87171'; e.currentTarget.style.borderColor = 'rgba(239,68,68,0.5)' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#94a3b8'; e.currentTarget.style.borderColor = 'rgba(239,68,68,0.25)' }}>
            <X size={11} weight="bold" /> Limpar
          </button>
        </div>
      )}

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem', color: '#f1f5f9' }}>
          <thead>
            <tr>
              <th style={{ padding: '0.75rem 1rem', width: 1, background: 'rgba(56,189,248,0.04)', borderBottom: '1px solid rgba(56,189,248,0.1)' }}>
                <input type="checkbox" checked={todosSelec} onChange={e => toggleTodos(e.target.checked)} style={{ accentColor: '#38bdf8', width: 14, height: 14, cursor: 'pointer' }} />
              </th>
              {colunas.map(col => (
                <Th key={col.key}
                  col={col}
                  filtros={filtros}
                  ordenacao={ordenacao}
                  dados={dados}
                  onOrdenar={onOrdenar}
                  onToggleValor={onToggleValor}
                  onFiltrarNumero={onFiltrarNumero}
                  onLimparColuna={onLimparColuna}
                />
              ))}
              {acoes && acoes.length > 0 && (
                <th style={{ padding: '0.75rem 1rem', width: 1, background: 'rgba(56,189,248,0.04)', borderBottom: '1px solid rgba(56,189,248,0.1)', fontSize: '0.6875rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: '#64748b', textAlign: 'center' }}>
                  Ações
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {paginado.length === 0 ? (
              <tr>
                <td colSpan={colunas.length + (acoes?.length ? 2 : 1)} style={{ textAlign: 'center', padding: '3rem 1rem', color: '#64748b' }}>
                  {chips.length > 0 || busca
                    ? <span>{mensagemVazio} <button type="button" onClick={limparTudo} style={{ background: 'none', border: 'none', color: '#38bdf8', cursor: 'pointer', fontWeight: 600, fontFamily: 'inherit', fontSize: 'inherit' }}>Limpar filtros</button></span>
                    : mensagemSemFiltro
                  }
                </td>
              </tr>
            ) : paginado.map((item, i) => {
              const id = String(item[idKey as string])
              return (
              <tr key={id}
                style={{ borderBottom: i < paginado.length - 1 ? '1px solid rgba(56,189,248,0.06)' : 'none', background: selecionados.has(id) ? 'rgba(56,189,248,0.06)' : 'transparent', transition: 'background 0.1s' }}
                onMouseEnter={ev => { if (!selecionados.has(id)) ev.currentTarget.style.background = 'rgba(56,189,248,0.03)' }}
                onMouseLeave={ev => { ev.currentTarget.style.background = selecionados.has(id) ? 'rgba(56,189,248,0.06)' : 'transparent' }}>
                <td style={{ padding: '0.875rem 1rem', width: 1 }} onClick={ev => ev.stopPropagation()}>
                  <input type="checkbox" checked={selecionados.has(id)} onChange={() => toggleSel(id)} style={{ accentColor: '#38bdf8', width: 14, height: 14, cursor: 'pointer' }} />
                </td>
                
                {colunas.map(col => (
                  <td key={col.key} style={{ padding: '0.875rem 1rem', textAlign: col.align || 'left' }}>
                    {col.render ? col.render(item[col.key], item) : String(item[col.key] ?? '')}
                  </td>
                ))}

                {acoes && acoes.length > 0 && (
                  <td style={{ padding: '0.875rem 1rem', textAlign: 'center', whiteSpace: 'nowrap' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                      {acoes.map(acao => {
                        if (acao.renderCustom) return <React.Fragment key={acao.id}>{acao.renderCustom(item)}</React.Fragment>
                        const isDis = acao.disabled ? acao.disabled(item) : false
                        const customStyle = acao.onRenderStyle ? acao.onRenderStyle(item) : {}
                        return (
                          <button
                            key={acao.id}
                            type="button"
                            title={acao.tooltip}
                            onClick={() => !isDis && acao.onClick(item)}
                            disabled={isDis}
                            style={{ 
                              display: 'flex', alignItems: 'center', justifyContent: 'center', 
                              width: 28, height: 28, borderRadius: '50%', background: 'transparent', 
                              border: '1px solid transparent', color: '#64748b', cursor: isDis ? 'not-allowed' : 'pointer', 
                              transition: 'all 0.15s', flexShrink: 0, opacity: isDis ? 0.3 : 1
                            }}
                            onMouseEnter={ev => { if(!isDis) { ev.currentTarget.style.background = customStyle.background ?? 'rgba(56,189,248,0.12)'; ev.currentTarget.style.borderColor = customStyle.borderColor ?? 'rgba(56,189,248,0.3)'; ev.currentTarget.style.color = customStyle.color ?? '#38bdf8' } }}
                            onMouseLeave={ev => { if(!isDis) { ev.currentTarget.style.background = 'transparent'; ev.currentTarget.style.borderColor = 'transparent'; ev.currentTarget.style.color = '#64748b' } }}
                          >
                            {acao.icone}
                          </button>
                        )
                      })}
                    </div>
                  </td>
                )}
              </tr>
            )})}
          </tbody>
        </table>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem', padding: '0.75rem 1.25rem', borderTop: '1px solid rgba(56,189,248,0.08)', background: 'rgba(56,189,248,0.02)' }}>
        <span style={{ fontSize: '0.8125rem', color: '#64748b' }}>
          {resultado.length === 0 ? 'Nenhum registro' : `${(pagSafe - 1) * porPagina + 1}–${Math.min(pagSafe * porPagina, resultado.length)} de ${resultado.length}`}
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
          <button type="button" onClick={() => setPagina(1)} disabled={pagSafe === 1} style={{ padding: '0.3rem 0.5rem', minWidth: '2rem', borderRadius: '6px', fontSize: '0.875rem', cursor: 'pointer', background: 'transparent', border: '1px solid transparent', color: '#94a3b8', fontFamily: 'inherit', opacity: pagSafe === 1 ? 0.3 : 1 }}>«</button>
          <button type="button" onClick={() => setPagina(p => Math.max(1, p - 1))} disabled={pagSafe === 1} style={{ padding: '0.3rem 0.5rem', minWidth: '2rem', borderRadius: '6px', fontSize: '0.875rem', cursor: 'pointer', background: 'transparent', border: '1px solid transparent', color: '#94a3b8', fontFamily: 'inherit', opacity: pagSafe === 1 ? 0.3 : 1 }}>‹</button>
          <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#f1f5f9', minWidth: '56px', textAlign: 'center' }}>{pagSafe} / {totalPags}</span>
          <button type="button" onClick={() => setPagina(p => Math.min(totalPags, p + 1))} disabled={pagSafe === totalPags} style={{ padding: '0.3rem 0.5rem', minWidth: '2rem', borderRadius: '6px', fontSize: '0.875rem', cursor: 'pointer', background: 'transparent', border: '1px solid transparent', color: '#94a3b8', fontFamily: 'inherit', opacity: pagSafe === totalPags ? 0.3 : 1 }}>›</button>
          <button type="button" onClick={() => setPagina(totalPags)} disabled={pagSafe === totalPags} style={{ padding: '0.3rem 0.5rem', minWidth: '2rem', borderRadius: '6px', fontSize: '0.875rem', cursor: 'pointer', background: 'transparent', border: '1px solid transparent', color: '#94a3b8', fontFamily: 'inherit', opacity: pagSafe === totalPags ? 0.3 : 1 }}>»</button>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8125rem', color: '#64748b' }}>
          por página:
          <select value={porPagina} onChange={e => { setPorPagina(Number(e.target.value)); setPagina(1) }}
            style={{ background: 'var(--ws-bg-body, #0f172a)', border: '1px solid rgba(56,189,248,0.12)', borderRadius: '6px', padding: '0.25rem 0.5rem', color: '#f1f5f9', fontSize: '0.8125rem', fontFamily: 'inherit', cursor: 'pointer' }}>
            {[10, 20, 50].map(n => <option key={n} value={n}>{n}</option>)}
          </select>
        </div>
      </div>
    </div>
  )
}
