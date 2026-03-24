/**
 * TabelaEmpresas — filtros inline por coluna com valores da coluna (estilo Excel).
 * - Popover mostra valores únicos da coluna como checkboxes
 * - Sort pills side-by-side
 * - Chips de filtros ativos + Limpar condicional
 * Design System Gravity: Sky 400, Plus Jakarta Sans, dark mode.
 */
import React, { useState, useMemo, useRef, useEffect, useCallback, memo } from 'react'
import ReactDOM from 'react-dom'
import { Funnel, ArrowUp, ArrowDown, MagnifyingGlass, X, DownloadSimple, CheckSquare, Square, PauseCircle, PlayCircle, PencilSimple, Trash, CaretDown, FileCsv, FileText, FilePdf, FileXls, Code } from '@phosphor-icons/react'

// ─── Tipos ────────────────────────────────────────────────────────────────────

export type EmpresaStatus = 'Ativa' | 'Suspensa'

export interface Empresa {
  id: string
  nome: string
  subdominio: string
  usuarios: number
  status: EmpresaStatus
  criadaEm: string
}

type ColKey = keyof Empresa
type Direcao = 'asc' | 'desc'

interface OrdenacaoState { coluna: ColKey; direcao: Direcao }

// Todos os filtros de coluna usam Set (seleção de valores)
interface FiltrosState {
  nome: Set<string>
  subdominio: Set<string>
  usuariosMin: string
  usuariosMax: string
  status: Set<string>
  criadaEm: Set<string>
}

const FILTROS_INICIAIS: FiltrosState = {
  nome: new Set(), subdominio: new Set(),
  usuariosMin: '', usuariosMax: '',
  status: new Set(), criadaEm: new Set(),
}

interface TabelaEmpresasProps {
  dados: Empresa[]
  onSuspender: (e: Empresa) => void
  onExcluir: (e: Empresa) => void
}

// ─── Popover de filtro ────────────────────────────────────────────────────────

interface PopoverProps {
  tipo: 'texto' | 'numero'
  coluna: ColKey
  label: string
  filtros: FiltrosState
  ordenacao: OrdenacaoState | null
  valoresDisponiveis: string[]
  valoresSelecionados: Set<string>
  triggerRef: React.RefObject<HTMLButtonElement>   // ✅ para calcular posição
  onOrdenar: (col: ColKey, dir: Direcao) => void
  onToggleValor: (col: ColKey, v: string) => void
  onFiltrarNumero: (campo: 'usuariosMin' | 'usuariosMax', v: string) => void
  onLimpar: () => void
  onFechar: () => void
}

function PopoverFiltro({
  tipo, coluna, label, filtros, ordenacao,
  valoresDisponiveis, valoresSelecionados,
  triggerRef,
  onOrdenar, onToggleValor, onFiltrarNumero, onLimpar, onFechar,
}: PopoverProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [buscaLocal, setBuscaLocal] = useState('')
  const [pos, setPos] = useState({ top: 0, left: 0 })

  // Calcula posição relativa ao viewport do botão trigger
  useEffect(() => {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect()
      setPos({
        top: rect.bottom + window.scrollY + 4,
        left: rect.left + window.scrollX,
      })
    }
  }, [triggerRef])

  // Fecha ao clicar fora
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

  // Filtra lista de valores pelo campo de busca local
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
    fontFamily: 'inherit', transition: 'all 0.12s', whiteSpace: 'nowrap' as const,
  })

  // Posição via viewport (fixed) para escapar do overflow:hidden
  const style: React.CSSProperties = {
    position: 'fixed',
    top: pos.top,
    left: pos.left,
    zIndex: 9999,
    background: 'var(--ws-surface, #1e293b)',
    border: '1px solid rgba(56,189,248,0.18)',
    borderRadius: '10px',
    boxShadow: '0 12px 32px rgba(0,0,0,0.6)',
    minWidth: '220px',
    maxWidth: '280px',
    fontFamily: 'var(--font, Plus Jakarta Sans)',
  }

  return ReactDOM.createPortal(
    <div ref={ref} style={style} onClick={e => e.stopPropagation()}>

      {/* Label */}
      <div style={{ padding: '0.4rem 0.875rem', borderBottom: '1px solid rgba(56,189,248,0.08)' }}>
        <span style={{ fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#64748b' }}>{label}</span>
      </div>

      {/* Sort pills */}
      <div style={{ padding: '0.5rem 0.625rem', borderBottom: '1px solid rgba(56,189,248,0.08)' }}>
        <p style={{ fontSize: '0.6rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#475569', marginBottom: '0.375rem' }}>Ordenar</p>
        <div style={{ display: 'flex', gap: '0.375rem' }}>
          {([['asc', 'Cresc.', <ArrowUp key="u" size={12} weight="bold" />], ['desc', 'Decresc.', <ArrowDown key="d" size={12} weight="bold" />]] as [Direcao, string, React.ReactNode][]).map(([dir, rot, ico]) => {
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

      {/* Valores da coluna — checkboxes */}
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

          <div style={{ maxHeight: '180px', overflowY: 'auto', padding: '0.3rem 0.5rem' }}>
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
                  {coluna === 'status' ? (
                    <span style={{ padding: '0.1rem 0.45rem', borderRadius: '9999px', fontSize: '0.6875rem', fontWeight: 700, letterSpacing: '0.04em', background: v === 'Ativa' ? 'rgba(52,211,153,0.12)' : 'rgba(248,113,113,0.12)', color: v === 'Ativa' ? '#34d399' : '#f87171', border: `1px solid ${v === 'Ativa' ? 'rgba(52,211,153,0.2)' : 'rgba(248,113,113,0.2)'}` }}>{v}</span>
                  ) : (
                    <span style={{ fontSize: '0.8125rem', color: '#cbd5e1', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{v}</span>
                  )}
                </label>
              )
            })}
          </div>
        </div>
      )}

      {/* Número (intervalo) */}
      {tipo === 'numero' && (
        <div style={{ padding: '0.5rem 0.625rem', borderBottom: '1px solid rgba(56,189,248,0.08)' }}>
          <p style={{ fontSize: '0.6rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.375rem' }}>Intervalo</p>
          <div style={{ display: 'flex', gap: '0.375rem', alignItems: 'center' }}>
            {(['usuariosMin', 'usuariosMax'] as const).map((campo, i) => (
              <input key={campo}
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                placeholder={i === 0 ? 'Mín' : 'Máx'}
                autoComplete="off"
                value={filtros[campo]}
                onChange={e => {
                  const v = e.target.value.replace(/[^0-9]/g, '')
                  onFiltrarNumero(campo, v)
                }}
                style={{ flex: 1, width: 0, padding: '0.375rem 0.5rem', background: 'rgba(56,189,248,0.05)', border: '1px solid rgba(56,189,248,0.15)', borderRadius: '6px', color: '#f1f5f9', fontSize: '0.8125rem', fontFamily: 'inherit', outline: 'none' }}
                onFocus={e => { e.currentTarget.style.borderColor = '#38bdf8' }}
                onBlur={e => { e.currentTarget.style.borderColor = 'rgba(56,189,248,0.15)' }}
              />
            ))}
          </div>
        </div>
      )}

      {/* Limpar */}
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

// ─── Th com popover ───────────────────────────────────────────────────────────

interface ThProps {
  label: string; coluna: ColKey; tipo: 'texto' | 'numero'
  filtros: FiltrosState; ordenacao: OrdenacaoState | null
  temFiltroAtivo: boolean
  dados: Empresa[]   // para computar valores únicos
  onOrdenar: (col: ColKey, dir: Direcao) => void
  onToggleValor: (col: ColKey, v: string) => void
  onFiltrarNumero: (campo: 'usuariosMin' | 'usuariosMax', v: string) => void
  onLimparColuna: (col: ColKey) => void
  style?: React.CSSProperties
}

function ThInner({ label, coluna, tipo, filtros, ordenacao, temFiltroAtivo, dados, onOrdenar, onToggleValor, onFiltrarNumero, onLimparColuna, style }: ThProps) {
  const [aberto, setAberto] = useState(false)
  const handleFechar = useCallback(() => setAberto(false), [])
  const triggerRef = useRef<HTMLButtonElement>(null)   // ✅ ref para o botão funil
  const sortAtivo = ordenacao?.coluna === coluna

  const valoresDisponiveis = useMemo(() => {
    const vals = dados.map(e => String(e[coluna]))
    return [...new Set(vals)].sort((a, b) => a.localeCompare(b, 'pt-BR'))
  }, [dados, coluna])

  const valoresSelecionados = useMemo<Set<string>>(() => {
    if (coluna === 'nome') return filtros.nome
    if (coluna === 'subdominio') return filtros.subdominio
    if (coluna === 'status') return filtros.status
    if (coluna === 'criadaEm') return filtros.criadaEm
    return new Set()
  }, [coluna, filtros])

  return (
    <th style={{ padding: '0.75rem 1rem', textAlign: 'left', whiteSpace: 'nowrap', fontSize: '0.6875rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: '#64748b', borderBottom: '1px solid rgba(56,189,248,0.1)', background: 'rgba(56,189,248,0.04)', position: 'relative', userSelect: 'none', ...style }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', justifyContent: (style as React.CSSProperties)?.textAlign === 'center' ? 'center' : undefined }}>
        <span style={{ color: sortAtivo ? '#38bdf8' : undefined }}>{label}</span>
        {/* botão com ref para calcular posição do portal */}
        <button ref={triggerRef} type="button" onClick={e => { e.stopPropagation(); setAberto(v => !v) }}
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 20, height: 20, borderRadius: '5px', background: temFiltroAtivo || aberto ? 'rgba(56,189,248,0.15)' : 'transparent', border: `1px solid ${temFiltroAtivo || aberto ? 'rgba(56,189,248,0.3)' : 'transparent'}`, cursor: 'pointer', padding: 0, flexShrink: 0, color: temFiltroAtivo || aberto ? '#38bdf8' : '#64748b', transition: 'all 0.12s' }}>
          <Funnel size={10} weight={temFiltroAtivo ? 'fill' : 'bold'} />
        </button>
      </div>
      {aberto && (
        <PopoverFiltro
          tipo={tipo} coluna={coluna} label={label}
          filtros={filtros} ordenacao={ordenacao}
          valoresDisponiveis={valoresDisponiveis}
          valoresSelecionados={valoresSelecionados}
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
const Th = memo(ThInner)

// ─── Chip ─────────────────────────────────────────────────────────────────────

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

// ─── ExportMenuItem ───────────────────────────────────────────────────────────

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

// ─── Componente Principal ─────────────────────────────────────────────────────

export function TabelaEmpresas({ dados, onSuspender, onExcluir }: TabelaEmpresasProps) {
  const [busca, setBusca] = useState('')
  const [ordenacao, setOrdenacao] = useState<OrdenacaoState | null>(null)
  const [filtros, setFiltros] = useState<FiltrosState>(FILTROS_INICIAIS)
  const [pagina, setPagina] = useState(1)
  const [porPagina, setPorPagina] = useState(10)
  const [selecionados, setSelecionados] = useState<Set<string>>(new Set())

  // Toggle de valor selecionado numa coluna
  const onToggleValor = useCallback((col: ColKey, v: string) => {
    setFiltros(prev => {
      const copia = { ...prev }
      const set = new Set(prev[col as 'nome' | 'subdominio' | 'status' | 'criadaEm'])
      set.has(v) ? set.delete(v) : set.add(v)
      ;(copia as Record<string, unknown>)[col] = set
      return copia
    })
    setPagina(1)
  }, [])

  const onFiltrarNumero = useCallback((campo: 'usuariosMin' | 'usuariosMax', v: string) => {
    setFiltros(prev => ({ ...prev, [campo]: v })); setPagina(1)
  }, [])

  const onOrdenar = useCallback((col: ColKey, dir: Direcao) => setOrdenacao({ coluna: col, direcao: dir }), [])

  const onLimparColuna = useCallback((col: ColKey) => {
    setFiltros(prev => {
      const n = { ...prev }
      if (col === 'nome') n.nome = new Set()
      else if (col === 'subdominio') n.subdominio = new Set()
      else if (col === 'usuarios') { n.usuariosMin = ''; n.usuariosMax = '' }
      else if (col === 'status') n.status = new Set()
      else if (col === 'criadaEm') n.criadaEm = new Set()
      return n
    })
    if (ordenacao?.coluna === col) setOrdenacao(null)
    setPagina(1)
  }, [ordenacao])

  const limparTudo = useCallback(() => {
    setBusca(''); setFiltros(FILTROS_INICIAIS); setOrdenacao(null); setPagina(1)
  }, [])

  // ─── Dados filtrados ──────────────────────────────────────────────────────

  const resultado = useMemo(() => {
    let r = [...dados]

    // Busca global
    if (busca.trim()) {
      const t = busca.toLowerCase()
      r = r.filter(e =>
        e.nome.toLowerCase().includes(t) ||
        e.subdominio.toLowerCase().includes(t) ||
        e.status.toLowerCase().includes(t) ||
        String(e.usuarios).includes(t) ||
        e.criadaEm.includes(t)
      )
    }

    // Filtros por coluna (Set = lista de valores selecionados)
    if (filtros.nome.size > 0) r = r.filter(e => filtros.nome.has(e.nome))
    if (filtros.subdominio.size > 0) r = r.filter(e => filtros.subdominio.has(e.subdominio))
    if (filtros.usuariosMin !== '') r = r.filter(e => e.usuarios >= Number(filtros.usuariosMin))
    if (filtros.usuariosMax !== '') r = r.filter(e => e.usuarios <= Number(filtros.usuariosMax))
    if (filtros.status.size > 0) r = r.filter(e => filtros.status.has(e.status))
    if (filtros.criadaEm.size > 0) r = r.filter(e => filtros.criadaEm.has(e.criadaEm))

    // Ordenação
    if (ordenacao) {
      r.sort((a, b) => {
        const va = a[ordenacao.coluna], vb = b[ordenacao.coluna]
        if (typeof va === 'number' && typeof vb === 'number') return ordenacao.direcao === 'asc' ? va - vb : vb - va
        return String(va).toLowerCase().localeCompare(String(vb).toLowerCase(), 'pt-BR') * (ordenacao.direcao === 'asc' ? 1 : -1)
      })
    }
    return r
  }, [dados, busca, filtros, ordenacao])

  // ─── Chips ───────────────────────────────────────────────────────────────

  const chips = useMemo(() => {
    const list: { key: string; label: string; onRemover: () => void }[] = []
    if (busca.trim()) list.push({ key: 'busca', label: `"${busca}"`, onRemover: () => setBusca('') })
    filtros.nome.forEach(v => list.push({ key: `nome-${v}`, label: `Filial: ${v}`, onRemover: () => onToggleValor('nome', v) }))
    filtros.subdominio.forEach(v => list.push({ key: `sub-${v}`, label: `Subdomínio: ${v}`, onRemover: () => onToggleValor('subdominio', v) }))
    if (filtros.usuariosMin !== '' || filtros.usuariosMax !== '') {
      list.push({ key: 'usuarios', label: `Usuários: ${filtros.usuariosMin || '0'}–${filtros.usuariosMax || '∞'}`, onRemover: () => { onFiltrarNumero('usuariosMin', ''); onFiltrarNumero('usuariosMax', '') } })
    }
    filtros.status.forEach(v => list.push({ key: `status-${v}`, label: `Status: ${v}`, onRemover: () => onToggleValor('status', v) }))
    filtros.criadaEm.forEach(v => list.push({ key: `data-${v}`, label: `Data: ${v}`, onRemover: () => onToggleValor('criadaEm', v) }))
    return list
  }, [busca, filtros, onToggleValor, onFiltrarNumero])

  const temFiltro = (col: ColKey) => {
    if (col === 'nome') return filtros.nome.size > 0
    if (col === 'subdominio') return filtros.subdominio.size > 0
    if (col === 'usuarios') return !!filtros.usuariosMin || !!filtros.usuariosMax
    if (col === 'status') return filtros.status.size > 0
    if (col === 'criadaEm') return filtros.criadaEm.size > 0
    return false
  }

  // ─── Paginação ────────────────────────────────────────────────────────────

  const totalPags = Math.max(1, Math.ceil(resultado.length / porPagina))
  const pagSafe = Math.min(pagina, totalPags)
  const paginado = useMemo(() => resultado.slice((pagSafe - 1) * porPagina, pagSafe * porPagina), [resultado, pagSafe, porPagina])

  const todosSelec = paginado.length > 0 && paginado.every(e => selecionados.has(e.id))
  const toggleSel = (id: string) => setSelecionados(prev => { const s = new Set(prev); s.has(id) ? s.delete(id) : s.add(id); return s })
  const toggleTodos = (v: boolean) => setSelecionados(v ? new Set(paginado.map(e => e.id)) : new Set())

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

  function baixarBlob(conteudo: string, nome: string, tipo: string) {
    const a = document.createElement('a')
    a.href = URL.createObjectURL(new Blob([conteudo], { type: tipo }))
    a.download = nome
    a.click()
  }

  function exportCSV() {
    const header = 'Nome,Subdomínio,Usuários,Status,Criado em'
    const rows = resultado.map(e => `"${e.nome}","${e.subdominio}.gravity.com.br",${e.usuarios},"${e.status}","${e.criadaEm}"`).join('\n')
    baixarBlob(header + '\n' + rows, 'empresas.csv', 'text/csv;charset=utf-8;')
  }

  function exportTXT() {
    const header = 'Nome\tSubdomínio\tUsuários\tStatus\tCriado em'
    const rows = resultado.map(e => `${e.nome}\t${e.subdominio}.gravity.com.br\t${e.usuarios}\t${e.status}\t${e.criadaEm}`).join('\n')
    baixarBlob(header + '\n' + rows, 'empresas.txt', 'text/plain;charset=utf-8;')
  }

  function exportJSON() {
    const data = resultado.map(e => ({ nome: e.nome, subdominio: `${e.subdominio}.gravity.com.br`, usuarios: e.usuarios, status: e.status, criadaEm: e.criadaEm }))
    baixarBlob(JSON.stringify(data, null, 2), 'empresas.json', 'application/json')
  }

  function exportXML() {
    const rows = resultado.map(e =>
      `  <empresa>\n    <nome>${e.nome}</nome>\n    <subdominio>${e.subdominio}.gravity.com.br</subdominio>\n    <usuarios>${e.usuarios}</usuarios>\n    <status>${e.status}</status>\n    <criadaEm>${e.criadaEm}</criadaEm>\n  </empresa>`
    ).join('\n')
    baixarBlob(`<?xml version="1.0" encoding="UTF-8"?>\n<empresas>\n${rows}\n</empresas>`, 'empresas.xml', 'application/xml')
  }

  function exportExcel(ext: string) {
    // Gera um TSV (tab-separated) renomeado com a extensão escolhida
    // para abertura nativa no Excel/LibreOffice
    const header = 'Nome\tSubdomínio\tUsuários\tStatus\tCriado em'
    const rows = resultado.map(e => `${e.nome}\t${e.subdominio}.gravity.com.br\t${e.usuarios}\t${e.status}\t${e.criadaEm}`).join('\n')
    const mime = ext === 'ods' ? 'application/vnd.oasis.opendocument.spreadsheet' : 'application/vnd.ms-excel'
    baixarBlob(header + '\n' + rows, `empresas.${ext}`, mime)
  }

  function exportPDF() {
    const win = window.open('', '_blank')
    if (!win) return
    const rows = resultado.map(e =>
      `<tr><td>${e.nome}</td><td>${e.subdominio}.gravity.com.br</td><td style="text-align:center">${e.usuarios}</td><td>${e.status}</td><td>${e.criadaEm}</td></tr>`
    ).join('')
    win.document.write(`<!DOCTYPE html><html><head><title>Empresas Filhas</title><style>body{font-family:sans-serif;padding:24px}table{width:100%;border-collapse:collapse;font-size:13px}th{background:#1e293b;color:#fff;padding:8px 12px;text-align:left}td{padding:8px 12px;border-bottom:1px solid #e2e8f0}@media print{button{display:none}}</style></head><body><h2>Empresas Filhas</h2><table><thead><tr><th>Nome</th><th>Subdomínio</th><th>Usuários</th><th>Status</th><th>Criado em</th></tr></thead><tbody>${rows}</tbody></table><br/><button onclick="window.print()">🖨️ Imprimir / Salvar PDF</button></body></html>`)
    win.document.close()
  }

  const thProps = { filtros, ordenacao, dados, onOrdenar, onToggleValor, onFiltrarNumero, onLimparColuna }

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <div style={{ background: 'var(--ws-surface, #1e293b)', border: '1px solid rgba(56,189,248,0.1)', borderRadius: '12px', overflow: 'hidden', fontFamily: 'var(--font, Plus Jakarta Sans)' }}>

      {/* Toolbar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem', padding: '0.875rem 1.25rem', borderBottom: chips.length > 0 ? 'none' : '1px solid rgba(56,189,248,0.08)' }}>
        {/* Busca global */}
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
          <span style={{ position: 'absolute', left: '0.75rem', color: '#64748b', display: 'flex', lineHeight: 0 }}>
            <MagnifyingGlass size={14} weight="bold" />
          </span>
          <input type="search" placeholder="Localizar em todos os campos…" value={busca}
            onChange={e => { setBusca(e.target.value); setPagina(1) }}
            style={{ background: 'var(--ws-bg-body, #0f172a)', border: '1px solid rgba(56,189,248,0.12)', borderRadius: '9999px', padding: '0.4375rem 1rem 0.4375rem 2.25rem', color: '#f1f5f9', fontSize: '0.875rem', fontFamily: 'inherit', minWidth: '240px', outline: 'none', transition: 'border-color 0.15s, box-shadow 0.15s' }}
            onFocus={e => { e.currentTarget.style.borderColor = '#38bdf8'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(56,189,248,0.12)' }}
            onBlur={e => { e.currentTarget.style.borderColor = 'rgba(56,189,248,0.12)'; e.currentTarget.style.boxShadow = 'none' }}
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
          {/* Botão Exportar + dropdown */}
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

                {/* Excel */}
                <ExportMenuItem label="Excel (.xlsx)" icon={<FileXls size={14} weight="bold" />} onClick={() => { exportExcel('xlsx'); setExportMenuAberto(false) }} />

                {/* Outros formatos */}
                <div style={{ borderTop: '1px solid rgba(56,189,248,0.08)', marginTop: '0.25rem', paddingTop: '0.25rem' }}>
                  <ExportMenuItem label="CSV" icon={<FileCsv size={14} weight="bold" />} onClick={() => { exportCSV(); setExportMenuAberto(false) }} />
                  <ExportMenuItem label="TXT" icon={<FileText size={14} weight="bold" />} onClick={() => { exportTXT(); setExportMenuAberto(false) }} />
                  <ExportMenuItem label="XML" icon={<Code size={14} weight="bold" />} onClick={() => { exportXML(); setExportMenuAberto(false) }} />
                  <ExportMenuItem label="PDF" icon={<FilePdf size={14} weight="bold" />} onClick={() => { exportPDF(); setExportMenuAberto(false) }} />
                  <ExportMenuItem label="JSON" icon={<Code size={14} weight="bold" />} onClick={() => { exportJSON(); setExportMenuAberto(false) }} />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Chips de filtros ativos */}
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

      {/* Tabela */}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem', color: '#f1f5f9' }}>
          <thead>
            <tr>
              <th style={{ padding: '0.75rem 1rem', width: 1, background: 'rgba(56,189,248,0.04)', borderBottom: '1px solid rgba(56,189,248,0.1)' }}>
                <input type="checkbox" checked={todosSelec} onChange={e => toggleTodos(e.target.checked)} style={{ accentColor: '#38bdf8', width: 14, height: 14, cursor: 'pointer' }} />
              </th>
              <Th label="Filial" coluna="nome" tipo="texto" temFiltroAtivo={temFiltro('nome')} {...thProps} />
              <Th label="Subdomínio" coluna="subdominio" tipo="texto" temFiltroAtivo={temFiltro('subdominio')} {...thProps} />
              <Th label="Usuários" coluna="usuarios" tipo="numero" temFiltroAtivo={temFiltro('usuarios')} {...thProps} style={{ textAlign: 'center' }} />
              <Th label="Status" coluna="status" tipo="texto" temFiltroAtivo={temFiltro('status')} {...thProps} />
              <Th label="Criado em" coluna="criadaEm" tipo="texto" temFiltroAtivo={temFiltro('criadaEm')} {...thProps} />
              <th style={{ padding: '0.75rem 1rem', width: 1, background: 'rgba(56,189,248,0.04)', borderBottom: '1px solid rgba(56,189,248,0.1)', fontSize: '0.6875rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: '#64748b', textAlign: 'center' }}>
                Ações
              </th>
            </tr>
          </thead>
          <tbody>
            {paginado.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '3rem 1rem', color: '#64748b' }}>
                  {chips.length > 0 || busca
                    ? <span>Nenhum resultado. <button type="button" onClick={limparTudo} style={{ background: 'none', border: 'none', color: '#38bdf8', cursor: 'pointer', fontWeight: 600, fontFamily: 'inherit', fontSize: 'inherit' }}>Limpar filtros</button></span>
                    : 'Nenhuma empresa filial cadastrada.'
                  }
                </td>
              </tr>
            ) : paginado.map((e, i) => (
              <tr key={e.id}
                style={{ borderBottom: i < paginado.length - 1 ? '1px solid rgba(56,189,248,0.06)' : 'none', background: selecionados.has(e.id) ? 'rgba(56,189,248,0.06)' : 'transparent', transition: 'background 0.1s' }}
                onMouseEnter={ev => { if (!selecionados.has(e.id)) ev.currentTarget.style.background = 'rgba(56,189,248,0.03)' }}
                onMouseLeave={ev => { ev.currentTarget.style.background = selecionados.has(e.id) ? 'rgba(56,189,248,0.06)' : 'transparent' }}>
                <td style={{ padding: '0.875rem 1rem', width: 1 }} onClick={ev => ev.stopPropagation()}>
                  <input type="checkbox" checked={selecionados.has(e.id)} onChange={() => toggleSel(e.id)} style={{ accentColor: '#38bdf8', width: 14, height: 14, cursor: 'pointer' }} />
                </td>
                <td style={{ padding: '0.875rem 1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                    <div style={{ width: 30, height: 30, minWidth: 30, borderRadius: '8px', background: 'rgba(56,189,248,0.12)', border: '1px solid rgba(56,189,248,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.6875rem', fontWeight: 700, color: '#38bdf8' }}>
                      {e.nome.charAt(0)}
                    </div>
                    <span style={{ fontWeight: 600 }}>{e.nome}</span>
                  </div>
                </td>
                <td style={{ padding: '0.875rem 1rem' }}>
                  <code style={{ fontSize: '0.8125rem', color: '#38bdf8', background: 'rgba(56,189,248,0.08)', padding: '0.125rem 0.4rem', borderRadius: '4px' }}>
                    {e.subdominio}.gravity.com.br
                  </code>
                </td>
                <td style={{ padding: '0.875rem 1rem', textAlign: 'center', fontWeight: 600 }}>{e.usuarios}</td>
                <td style={{ padding: '0.875rem 1rem' }}>
                  <span style={{ display: 'inline-flex', padding: '0.2rem 0.625rem', borderRadius: '9999px', fontSize: '0.6875rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', background: e.status === 'Ativa' ? 'rgba(52,211,153,0.12)' : 'rgba(248,113,113,0.12)', color: e.status === 'Ativa' ? '#34d399' : '#f87171', border: `1px solid ${e.status === 'Ativa' ? 'rgba(52,211,153,0.2)' : 'rgba(248,113,113,0.2)'}` }}>
                    {e.status}
                  </span>
                </td>
                <td style={{ padding: '0.875rem 1rem', color: '#94a3b8' }}>{e.criadaEm}</td>
                <td style={{ padding: '0.875rem 1rem', textAlign: 'center', whiteSpace: 'nowrap' }}>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                    {/* Suspender / Reativar */}
                    <button
                      type="button"
                      title={e.status === 'Ativa' ? 'Suspender' : 'Reativar'}
                      onClick={() => onSuspender(e)}
                      style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 28, height: 28, borderRadius: '50%', background: 'transparent', border: '1px solid transparent', color: '#64748b', cursor: 'pointer', transition: 'all 0.15s', flexShrink: 0 }}
                      onMouseEnter={ev => { ev.currentTarget.style.background = e.status === 'Ativa' ? 'rgba(251,191,36,0.12)' : 'rgba(52,211,153,0.12)'; ev.currentTarget.style.borderColor = e.status === 'Ativa' ? 'rgba(251,191,36,0.3)' : 'rgba(52,211,153,0.3)'; ev.currentTarget.style.color = e.status === 'Ativa' ? '#fbbf24' : '#34d399' }}
                      onMouseLeave={ev => { ev.currentTarget.style.background = 'transparent'; ev.currentTarget.style.borderColor = 'transparent'; ev.currentTarget.style.color = '#64748b' }}
                    >
                      {e.status === 'Ativa'
                        ? <PauseCircle size={16} weight="bold" />
                        : <PlayCircle size={16} weight="bold" />}
                    </button>
                    {/* Editar */}
                    <button
                      type="button"
                      title="Editar"
                      style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 28, height: 28, borderRadius: '50%', background: 'transparent', border: '1px solid transparent', color: '#64748b', cursor: 'pointer', transition: 'all 0.15s', flexShrink: 0 }}
                      onMouseEnter={ev => { ev.currentTarget.style.background = 'rgba(56,189,248,0.12)'; ev.currentTarget.style.borderColor = 'rgba(56,189,248,0.3)'; ev.currentTarget.style.color = '#38bdf8' }}
                      onMouseLeave={ev => { ev.currentTarget.style.background = 'transparent'; ev.currentTarget.style.borderColor = 'transparent'; ev.currentTarget.style.color = '#64748b' }}
                    >
                      <PencilSimple size={15} weight="bold" />
                    </button>
                    {/* Excluir */}
                    <button
                      type="button"
                      title="Excluir"
                      onClick={() => onExcluir(e)}
                      style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 28, height: 28, borderRadius: '50%', background: 'transparent', border: '1px solid transparent', color: '#64748b', cursor: 'pointer', transition: 'all 0.15s', flexShrink: 0 }}
                      onMouseEnter={ev => { ev.currentTarget.style.background = 'rgba(248,113,113,0.12)'; ev.currentTarget.style.borderColor = 'rgba(248,113,113,0.3)'; ev.currentTarget.style.color = '#f87171' }}
                      onMouseLeave={ev => { ev.currentTarget.style.background = 'transparent'; ev.currentTarget.style.borderColor = 'transparent'; ev.currentTarget.style.color = '#64748b' }}
                    >
                      <Trash size={15} weight="bold" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Paginação */}
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
