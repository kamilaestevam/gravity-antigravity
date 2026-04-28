import React, { useState, useMemo, useRef, useEffect, useCallback, memo } from 'react'
import { useTranslation } from 'react-i18next'
import ReactDOM from 'react-dom'
import { TooltipGlobal } from '@nucleo/tooltip-global'
import { Funnel, ArrowUp, ArrowDown, MagnifyingGlass, X, DownloadSimple, CheckSquare, Square, PauseCircle, PlayCircle, PencilSimple, CaretDown, FileCsv, FileText, FilePdf, FileXls, Code } from '@phosphor-icons/react'
import { exportarExcel, exportarCSV, exportarTXT, exportarXML, exportarJSON, exportarPDF, type ColunasExport } from '../../services/exportService'

export type UserType = 'Master' | 'Admin' | 'Standard' | 'Fornecedor'
export type UserStatus = 'Ativo' | 'Inativo'

export interface TenantUser {
  id: string
  nome: string
  email: string
  tipo: UserType
  status: UserStatus
}

type ColKey = keyof TenantUser
type Direcao = 'asc' | 'desc'

interface OrdenacaoState { coluna: ColKey; direcao: Direcao }

interface FiltrosState {
  nome: Set<string>
  email: Set<string>
  tipo: Set<string>
  status: Set<string>
}

const FILTROS_INICIAIS: FiltrosState = {
  nome: new Set(),
  email: new Set(),
  tipo: new Set(),
  status: new Set(),
}

interface TabelaUsuariosProps {
  dados: TenantUser[]
  onDeactivate: (id_usuario: string) => void
}

const typeBadge: Record<string, string> = {
  Master:     'ws-badge-accent',
  Admin:      'ws-badge-info',
  Standard:   'ws-badge-surface',
  Fornecedor: 'ws-badge-warning',
}

interface PopoverProps {
  tipo: 'texto'
  coluna: ColKey
  label: string
  filtros: FiltrosState
  ordenacao: OrdenacaoState | null
  valoresDisponiveis: string[]
  valoresSelecionados: Set<string>
  triggerRef: React.RefObject<HTMLButtonElement>
  onOrdenar: (col: ColKey, dir: Direcao) => void
  onToggleValor: (col: ColKey, v: string) => void
  onLimpar: () => void
  onFechar: () => void
}

function PopoverFiltro({
  tipo, coluna, label, filtros, ordenacao,
  valoresDisponiveis, valoresSelecionados,
  triggerRef,
  onOrdenar, onToggleValor, onLimpar, onFechar,
}: PopoverProps) {
  const { t } = useTranslation()
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
    background: 'rgba(129,140,248,0.05)', border: '1px solid rgba(129,140,248,0.15)',
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
    fontFamily: 'inherit', transition: 'all 0.12s', whiteSpace: 'nowrap' as const,
  })

  const style: React.CSSProperties = {
    position: 'fixed',
    top: pos.top,
    left: pos.left,
    zIndex: 9999,
    background: 'var(--ws-surface, #1e293b)',
    border: '1px solid rgba(129,140,248,0.18)',
    borderRadius: '10px',
    boxShadow: '0 12px 32px rgba(0,0,0,0.6)',
    minWidth: '220px',
    maxWidth: '280px',
    fontFamily: 'var(--font, Plus Jakarta Sans)',
  }

  return ReactDOM.createPortal(
    <div ref={ref} style={style} onClick={e => e.stopPropagation()}>
      <div style={{ padding: '0.4rem 0.875rem', borderBottom: '1px solid rgba(129,140,248,0.08)' }}>
        <span style={{ fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#64748b' }}>{label}</span>
      </div>

      <div style={{ padding: '0.5rem 0.625rem', borderBottom: '1px solid rgba(129,140,248,0.08)' }}>
        <p style={{ fontSize: '0.6rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#475569', marginBottom: '0.375rem' }}>{t('tabela.ordenar')}</p>
        <div style={{ display: 'flex', gap: '0.375rem' }}>
          {([['asc', t('tabela.crescente'), <ArrowUp key="u" size={12} weight="bold" />], ['desc', t('tabela.decrescente'), <ArrowDown key="d" size={12} weight="bold" />]] as [Direcao, string, React.ReactNode][]).map(([dir, rot, ico]) => {
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

      <div style={{ borderBottom: '1px solid rgba(129,140,248,0.08)' }}>
        <p style={{ padding: '0.45rem 0.875rem 0.25rem', fontSize: '0.6rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#475569' }}>{t('tabela.filtrar_por')}</p>

        {valoresDisponiveis.length > 5 && (
          <div style={{ padding: '0.25rem 0.625rem', position: 'relative' }}>
            <span style={{ position: 'absolute', left: '1.1rem', top: '50%', transform: 'translateY(-50%)', color: '#64748b', display: 'flex', lineHeight: 0 }}>
              <MagnifyingGlass size={11} weight="bold" />
            </span>
            <input type="text" placeholder={t('tabela.buscar')} value={buscaLocal}
              onChange={e => setBuscaLocal(e.target.value)}
              style={{ ...inputStyle, paddingLeft: '1.6rem', fontSize: '0.75rem' }}
              onFocus={e => { e.currentTarget.style.borderColor = '#818cf8' }}
              onBlur={e => { e.currentTarget.style.borderColor = 'rgba(129,140,248,0.15)' }}
            />
          </div>
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
                {coluna === 'status' ? (
                  <span style={{ padding: '0.1rem 0.45rem', borderRadius: '9999px', fontSize: '0.6875rem', fontWeight: 700, letterSpacing: '0.04em', background: v === 'Ativo' ? 'rgba(52,211,153,0.12)' : 'rgba(248,113,113,0.12)', color: v === 'Ativo' ? '#34d399' : '#f87171', border: `1px solid ${v === 'Ativo' ? 'rgba(52,211,153,0.2)' : 'rgba(248,113,113,0.2)'}` }}>{v}</span>
                ) : coluna === 'tipo' ? (
                  <span style={{ padding: '0.1rem 0.6rem', borderRadius: '9999px', fontSize: '0.6875rem', fontWeight: 700, letterSpacing: '0.04em', ...((v === 'Master') ? { color: '#818cf8', background: 'rgba(129,140,248,0.1)' } : (v === 'Admin') ? { color: '#06b6d4', background: 'rgba(6,182,212,0.1)' } : (v === 'Fornecedor') ? { color: '#fbbf24', background: 'rgba(245,158,11,0.1)' } : { color: '#94a3b8', background: 'rgba(255,255,255,0.05)' }) }}>{v}</span>
                ) : (
                  <span style={{ fontSize: '0.8125rem', color: '#cbd5e1', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{v}</span>
                )}
              </label>
            )
          })}
        </div>
      </div>

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

interface ThProps {
  label: string; coluna: ColKey; tipo: 'texto'
  filtros: FiltrosState; ordenacao: OrdenacaoState | null
  temFiltroAtivo: boolean
  dados: TenantUser[]
  onOrdenar: (col: ColKey, dir: Direcao) => void
  onToggleValor: (col: ColKey, v: string) => void
  onLimparColuna: (col: ColKey) => void
  style?: React.CSSProperties
  tooltipTitulo?: string
  tooltipDescricao?: string
}

function ThInner({ label, coluna, tipo, filtros, ordenacao, temFiltroAtivo, dados, onOrdenar, onToggleValor, onLimparColuna, style, tooltipTitulo, tooltipDescricao }: ThProps) {
  const [aberto, setAberto] = useState(false)
  const handleFechar = useCallback(() => setAberto(false), [])
  const triggerRef = useRef<HTMLButtonElement>(null)
  const sortAtivo = ordenacao?.coluna === coluna

  const valoresDisponiveis = useMemo(() => {
    const vals = dados.map(e => String(e[coluna]))
    return [...new Set(vals)].sort((a, b) => a.localeCompare(b, 'pt-BR'))
  }, [dados, coluna])

  const valoresSelecionados = useMemo<Set<string>>(() => {
    if (coluna === 'nome') return filtros.nome
    if (coluna === 'email') return filtros.email
    if (coluna === 'tipo') return filtros.tipo
    if (coluna === 'status') return filtros.status
    return new Set()
  }, [coluna, filtros])

  const labelSpan = (
    <span style={{ color: sortAtivo ? '#818cf8' : undefined, lineHeight: 1, display: 'inline-block' }}>
      {label}
    </span>
  )

  return (
    <th style={{ padding: '0.75rem 1rem', textAlign: 'left', whiteSpace: 'nowrap', fontSize: '0.6875rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: '#64748b', borderBottom: '1px solid rgba(129,140,248,0.1)', background: 'rgba(129,140,248,0.04)', position: 'relative', userSelect: 'none', verticalAlign: 'middle', ...style }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', justifyContent: (style as React.CSSProperties)?.textAlign === 'center' ? 'center' : 'flex-start' }}>
        {tooltipDescricao
          ? <TooltipGlobal titulo={tooltipTitulo} descricao={tooltipDescricao}>{labelSpan}</TooltipGlobal>
          : labelSpan
        }
        <button ref={triggerRef} type="button" onClick={e => { e.stopPropagation(); setAberto(v => !v) }}
          style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 16, height: 16, borderRadius: '4px', background: temFiltroAtivo || aberto ? 'rgba(129,140,248,0.15)' : 'transparent', border: `1px solid ${temFiltroAtivo || aberto ? 'rgba(129,140,248,0.3)' : 'transparent'}`, cursor: 'pointer', padding: 0, flexShrink: 0, color: temFiltroAtivo || aberto ? '#818cf8' : '#64748b', transition: 'all 0.12s', lineHeight: 0, verticalAlign: 'middle' }}>
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
          onLimpar={() => onLimparColuna(coluna)}
          onFechar={handleFechar}
        />
      )}
    </th>
  )
}
const Th = memo(ThInner)

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

function ExportMenuItem({ label, icon, onClick }: { label: string; icon: React.ReactNode; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick}
      style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', width: '100%', padding: '0.45rem 0.875rem', background: 'transparent', border: 'none', color: '#94a3b8', fontSize: '0.8125rem', fontFamily: 'inherit', cursor: 'pointer', textAlign: 'left', transition: 'background 0.1s, color 0.1s' }}
      onMouseEnter={e => { e.currentTarget.style.background = 'rgba(129,140,248,0.07)'; e.currentTarget.style.color = '#f1f5f9' }}
      onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#94a3b8' }}>
      <span style={{ color: '#818cf8', display: 'flex', flexShrink: 0 }}>{icon}</span>
      {label}
    </button>
  )
}

export function TabelaUsuarios({ dados, onDeactivate }: TabelaUsuariosProps) {
  const { t } = useTranslation()
  const [busca, setBusca] = useState('')
  const [ordenacao, setOrdenacao] = useState<OrdenacaoState | null>(null)
  const [filtros, setFiltros] = useState<FiltrosState>(FILTROS_INICIAIS)
  const [pagina, setPagina] = useState(1)
  const [porPagina, setPorPagina] = useState(10)
  const [selecionados, setSelecionados] = useState<Set<string>>(new Set())

  const onToggleValor = useCallback((col: ColKey, v: string) => {
    setFiltros(prev => {
      const copia = { ...prev }
      const set = new Set(prev[col as keyof FiltrosState])
      set.has(v) ? set.delete(v) : set.add(v)
      ;(copia as Record<string, unknown>)[col] = set
      return copia
    })
    setPagina(1)
  }, [])

  const onOrdenar = useCallback((col: ColKey, dir: Direcao) => setOrdenacao({ coluna: col, direcao: dir }), [])

  const onLimparColuna = useCallback((col: ColKey) => {
    setFiltros(prev => {
      const n = { ...prev }
      n[col as keyof FiltrosState] = new Set()
      return n
    })
    if (ordenacao?.coluna === col) setOrdenacao(null)
    setPagina(1)
  }, [ordenacao])

  const limparTudo = useCallback(() => {
    setBusca(''); setFiltros(FILTROS_INICIAIS); setOrdenacao(null); setPagina(1)
  }, [])

  const resultado = useMemo(() => {
    let r = [...dados]

    if (busca.trim()) {
      const buscaLower = busca.toLowerCase()
      r = r.filter(e =>
        e.nome.toLowerCase().includes(buscaLower) ||
        e.email.toLowerCase().includes(buscaLower) ||
        e.tipo.toLowerCase().includes(buscaLower) ||
        e.status.toLowerCase().includes(buscaLower)
      )
    }

    if (filtros.nome.size > 0) r = r.filter(e => filtros.nome.has(e.nome))
    if (filtros.email.size > 0) r = r.filter(e => filtros.email.has(e.email))
    if (filtros.tipo.size > 0) r = r.filter(e => filtros.tipo.has(e.tipo))
    if (filtros.status.size > 0) r = r.filter(e => filtros.status.has(e.status))

    if (ordenacao) {
      r.sort((a, b) => {
        const va = a[ordenacao.coluna], vb = b[ordenacao.coluna]
        return String(va).toLowerCase().localeCompare(String(vb).toLowerCase(), 'pt-BR') * (ordenacao.direcao === 'asc' ? 1 : -1)
      })
    }
    return r
  }, [dados, busca, filtros, ordenacao])

  const chips = useMemo(() => {
    const list: { key: string; label: string; onRemover: () => void }[] = []
    if (busca.trim()) list.push({ key: 'busca', label: `"${busca}"`, onRemover: () => setBusca('') })
    filtros.nome.forEach(v => list.push({ key: `nome-${v}`, label: `Nome: ${v}`, onRemover: () => onToggleValor('nome', v) }))
    filtros.email.forEach(v => list.push({ key: `email-${v}`, label: `Email: ${v}`, onRemover: () => onToggleValor('email', v) }))
    filtros.tipo.forEach(v => list.push({ key: `tipo-${v}`, label: `Tipo: ${v}`, onRemover: () => onToggleValor('tipo', v) }))
    filtros.status.forEach(v => list.push({ key: `status-${v}`, label: `Status: ${v}`, onRemover: () => onToggleValor('status', v) }))
    return list
  }, [busca, filtros, onToggleValor])

  const temFiltro = (col: keyof FiltrosState) => filtros[col].size > 0

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

  const COLUNAS_EXPORT: ColunasExport[] = [
    { header: 'Nome',    key: 'nome'   },
    { header: 'E-mail',  key: 'email'  },
    { header: 'Tipo',    key: 'tipo'   },
    { header: 'Status',  key: 'status' },
  ]

  const OPCOES_EXPORT = { nomeArquivo: 'usuarios-tenant', titulo: 'Usuários do Tenant' }

  const thProps = { filtros, ordenacao, dados, onOrdenar, onToggleValor, onLimparColuna }

  return (
    <div style={{ background: 'var(--ws-surface, #1e293b)', border: '1px solid rgba(129,140,248,0.1)', borderRadius: '12px', overflow: 'hidden', fontFamily: 'var(--font, Plus Jakarta Sans)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem', padding: '0.875rem 1.25rem', borderBottom: chips.length > 0 ? 'none' : '1px solid rgba(129,140,248,0.08)' }}>
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
          <span style={{ position: 'absolute', left: '0.75rem', color: '#818cf8', display: 'flex', lineHeight: 0, opacity: 0.7 }}>
            <MagnifyingGlass size={14} weight="bold" />
          </span>
          <input type="search" placeholder="Buscar..." value={busca}
            onChange={e => { setBusca(e.target.value); setPagina(1) }}
            style={{ background: 'var(--ws-bg-body, #0f172a)', border: '1px solid rgba(129,140,248,0.18)', borderRadius: '9999px', padding: '0.4375rem 1rem 0.4375rem 2.25rem', color: 'var(--ws-text, #f1f5f9)', fontSize: '0.875rem', fontFamily: 'var(--font, Plus Jakarta Sans)', fontWeight: 400, minWidth: '240px', outline: 'none', transition: 'border-color 0.15s, box-shadow 0.15s' }}
            onFocus={e => { e.currentTarget.style.borderColor = '#818cf8'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(129,140,248,0.14)' }}
            onBlur={e => { e.currentTarget.style.borderColor = 'rgba(129,140,248,0.18)'; e.currentTarget.style.boxShadow = 'none' }}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
          {chips.length > 0 && (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', padding: '0.25rem 0.65rem', borderRadius: '9999px', background: 'rgba(199,210,254,0.1)', border: '1px solid rgba(199,210,254,0.25)', color: '#c7d2fe', fontSize: '0.75rem', fontWeight: 700 }}>
              <Funnel size={11} weight="fill" />
              {chips.length} filtro{chips.length !== 1 ? 's' : ''} ativo{chips.length !== 1 ? 's' : ''}
            </span>
          )}
          {selecionados.size > 0 && (
            <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#c7d2fe', padding: '0.25rem 0.75rem', background: 'rgba(199,210,254,0.15)', borderRadius: '9999px' }}>
              {selecionados.size} selecionado{selecionados.size !== 1 ? 's' : ''}
            </span>
          )}
          <div style={{ position: 'relative' }}>
          <TooltipGlobal descricao="Baixar os dados da tabela em diferentes formatos">
            <button ref={exportBtnRef} type="button"
              onClick={() => setExportMenuAberto(v => !v)}
              style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', padding: '0.4375rem 0.875rem', borderRadius: '9999px', background: exportMenuAberto ? 'rgba(129,140,248,0.1)' : 'transparent', border: `1px solid ${exportMenuAberto ? '#818cf8' : 'rgba(129,140,248,0.12)'}`, color: exportMenuAberto ? '#818cf8' : '#94a3b8', fontSize: '0.8125rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s' }}
              onMouseEnter={e => { if (!exportMenuAberto) { e.currentTarget.style.borderColor = '#818cf8'; e.currentTarget.style.color = '#818cf8' } }}
              onMouseLeave={e => { if (!exportMenuAberto) { e.currentTarget.style.borderColor = 'rgba(129,140,248,0.12)'; e.currentTarget.style.color = '#94a3b8' } }}>
              <DownloadSimple size={13} weight="bold" /> {t('tabela.exportar')} <CaretDown size={11} weight="bold" style={{ marginLeft: 1, transition: 'transform 0.15s', transform: exportMenuAberto ? 'rotate(180deg)' : 'rotate(0deg)' }} />
            </button>
          </TooltipGlobal>

            {exportMenuAberto && (
              <div ref={exportMenuRef}
                style={{ position: 'absolute', top: 'calc(100% + 6px)', right: 0, zIndex: 9999, background: '#1e293b', border: '1px solid rgba(129,140,248,0.18)', borderRadius: '10px', boxShadow: '0 12px 32px rgba(0,0,0,0.55)', minWidth: '200px', fontFamily: 'inherit', overflow: 'hidden' }}
                onClick={e => e.stopPropagation()}>
                <ExportMenuItem label="Excel (.xlsx)" icon={<FileXls size={14} weight="bold" />} onClick={() => { void exportarExcel(resultado as any, COLUNAS_EXPORT, OPCOES_EXPORT); setExportMenuAberto(false) }} />
                <div style={{ borderTop: '1px solid rgba(129,140,248,0.08)', marginTop: '0.25rem', paddingTop: '0.25rem' }}>
                  <ExportMenuItem label="CSV" icon={<FileCsv size={14} weight="bold" />} onClick={() => { exportarCSV(resultado as any, COLUNAS_EXPORT, OPCOES_EXPORT); setExportMenuAberto(false) }} />
                  <ExportMenuItem label="TXT" icon={<FileText size={14} weight="bold" />} onClick={() => { exportarTXT(resultado as any, COLUNAS_EXPORT, OPCOES_EXPORT); setExportMenuAberto(false) }} />
                  <ExportMenuItem label="XML" icon={<Code size={14} weight="bold" />} onClick={() => { exportarXML(resultado as any, COLUNAS_EXPORT, OPCOES_EXPORT); setExportMenuAberto(false) }} />
                  <ExportMenuItem label="PDF" icon={<FilePdf size={14} weight="bold" />} onClick={() => { exportarPDF(resultado as any, COLUNAS_EXPORT, OPCOES_EXPORT); setExportMenuAberto(false) }} />
                  <ExportMenuItem label="JSON" icon={<Code size={14} weight="bold" />} onClick={() => { exportarJSON(resultado as any, COLUNAS_EXPORT, OPCOES_EXPORT); setExportMenuAberto(false) }} />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {chips.length > 0 && (
        <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '0.375rem', padding: '0.625rem 1.25rem', borderBottom: '1px solid rgba(129,140,248,0.08)', background: 'rgba(129,140,248,0.02)' }}>
          {chips.map(c => <FiltroChip key={c.key} label={c.label} onRemover={c.onRemover} />)}
          <button type="button" onClick={limparTudo}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', marginLeft: 'auto', padding: '0.2rem 0.65rem', borderRadius: '9999px', background: 'transparent', border: '1px solid rgba(239,68,68,0.25)', color: '#94a3b8', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s', whiteSpace: 'nowrap' }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.08)'; e.currentTarget.style.color = '#f87171'; e.currentTarget.style.borderColor = 'rgba(239,68,68,0.5)' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#94a3b8'; e.currentTarget.style.borderColor = 'rgba(239,68,68,0.25)' }}>
            <X size={11} weight="bold" /> {t('tabela.limpar')}
          </button>
        </div>
      )}

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem', color: '#f1f5f9' }}>
          <thead>
            <tr>
              <th style={{ padding: '0.75rem 1rem', width: 1, background: 'rgba(129,140,248,0.04)', borderBottom: '1px solid rgba(129,140,248,0.1)' }}>
                <input type="checkbox" checked={todosSelec} onChange={e => toggleTodos(e.target.checked)} style={{ accentColor: '#818cf8', width: 14, height: 14, cursor: 'pointer' }} />
              </th>
              <Th
                label={t('workspace.users.tabela.usuario')} coluna="nome" tipo="texto"
                temFiltroAtivo={temFiltro('nome')}
                tooltipTitulo={t('workspace.users.tabela.usuario')}
                tooltipDescricao="Nome completo e identificação visual do usuário"
                {...thProps}
              />
              <Th
                label={t('workspace.users.tabela.email')} coluna="email" tipo="texto"
                temFiltroAtivo={temFiltro('email')}
                tooltipTitulo={t('workspace.users.tabela.email')}
                tooltipDescricao="E-mail de acesso utilizado no login da plataforma"
                {...thProps}
              />
              <Th
                label={t('workspace.users.tabela.tipo')} coluna="tipo" tipo="texto"
                temFiltroAtivo={temFiltro('tipo')}
                tooltipTitulo={t('workspace.users.tabela.tipo')}
                tooltipDescricao="Define as permissões base: Master, Standard ou Fornecedor"
                {...thProps}
              />
              <Th
                label={t('workspace.users.tabela.status')} coluna="status" tipo="texto"
                temFiltroAtivo={temFiltro('status')}
                tooltipTitulo="Status"
                tooltipDescricao="Indica se o usuário pode acessar a plataforma"
                {...thProps}
              />
              <th style={{ padding: '0.75rem 1rem', width: 1, background: 'rgba(129,140,248,0.04)', borderBottom: '1px solid rgba(129,140,248,0.1)', fontSize: '0.6875rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: '#64748b', textAlign: 'center' }}>
                <TooltipGlobal titulo="Comandos" descricao={t('tabela.tooltip_acoes')}>
                  <span>{t('tabela.acoes')}</span>
                </TooltipGlobal>
              </th>
            </tr>
          </thead>
          <tbody>
            {paginado.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: '3rem 1rem', color: '#64748b' }}>
                  {chips.length > 0 || busca
                    ? <span>{t('tabela.sem_resultado')} <button type="button" onClick={limparTudo} style={{ background: 'none', border: 'none', color: '#818cf8', cursor: 'pointer', fontWeight: 600, fontFamily: 'inherit', fontSize: 'inherit' }}>{t('tabela.limpar_filtros')}</button></span>
                    : t('tabela.sem_filtro')
                  }
                </td>
              </tr>
            ) : paginado.map((u, i) => (
              <tr key={u.id}
                style={{ borderBottom: i < paginado.length - 1 ? '1px solid rgba(129,140,248,0.06)' : 'none', background: selecionados.has(u.id) ? 'rgba(129,140,248,0.06)' : 'transparent', transition: 'background 0.1s' }}
                onMouseEnter={ev => { if (!selecionados.has(u.id)) ev.currentTarget.style.background = 'rgba(129,140,248,0.03)' }}
                onMouseLeave={ev => { ev.currentTarget.style.background = selecionados.has(u.id) ? 'rgba(129,140,248,0.06)' : 'transparent' }}>
                <td style={{ padding: '0.875rem 1rem', width: 1 }} onClick={ev => ev.stopPropagation()}>
                  <input type="checkbox" checked={selecionados.has(u.id)} onChange={() => toggleSel(u.id)} style={{ accentColor: '#818cf8', width: 14, height: 14, cursor: 'pointer' }} />
                </td>
                <td style={{ padding: '0.875rem 1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                    <div style={{
                      width: 32, height: 32, minWidth: 32, borderRadius: '50%',
                      background: u.tipo === 'Master' ? 'rgba(129,140,248,0.2)' : u.tipo === 'Admin' ? 'rgba(6,182,212,0.15)' : u.tipo === 'Fornecedor' ? 'rgba(245,158,11,0.15)' : 'rgba(255,255,255,0.07)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700,
                      color: u.tipo === 'Master' ? '#818cf8' : u.tipo === 'Admin' ? '#06b6d4' : u.tipo === 'Fornecedor' ? '#fbbf24' : '#94a3b8',
                    }}>
                      {u.nome.split(' ').map(n => n[0]).join('').slice(0, 2)}
                    </div>
                    <span style={{ fontWeight: 600 }}>{u.nome}</span>
                  </div>
                </td>
                <td style={{ padding: '0.875rem 1rem', color: 'var(--ws-muted)' }}>
                  {u.email}
                </td>
                <td style={{ padding: '0.875rem 1rem' }}>
                  <span className={`ws-badge ${typeBadge[u.tipo.toString()] || 'ws-badge-surface'}`}>
                    {u.tipo}
                  </span>
                </td>
                <td style={{ padding: '0.875rem 1rem' }}>
                  <span style={{ display: 'inline-flex', padding: '0.2rem 0.625rem', borderRadius: '9999px', fontSize: '0.6875rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', background: u.status === 'Ativo' ? 'rgba(52,211,153,0.12)' : 'rgba(248,113,113,0.12)', color: u.status === 'Ativo' ? '#34d399' : '#f87171', border: `1px solid ${u.status === 'Ativo' ? 'rgba(52,211,153,0.2)' : 'rgba(248,113,113,0.2)'}` }}>
                    {u.status}
                  </span>
                </td>
                <td style={{ padding: '0.875rem 1rem', textAlign: 'center', whiteSpace: 'nowrap' }}>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                    <TooltipGlobal descricao={u.status === 'Ativo' ? 'Bloqueia o acesso deste usuário à plataforma' : 'Restaura o acesso deste usuário à plataforma'}>
                      <button
                        type="button"
                        onClick={() => onDeactivate(u.id)}
                        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 28, height: 28, borderRadius: '50%', background: 'transparent', border: '1px solid transparent', color: '#64748b', cursor: 'pointer', transition: 'all 0.15s', flexShrink: 0 }}
                        onMouseEnter={ev => { ev.currentTarget.style.background = u.status === 'Ativo' ? 'rgba(251,191,36,0.12)' : 'rgba(52,211,153,0.12)'; ev.currentTarget.style.borderColor = u.status === 'Ativo' ? 'rgba(251,191,36,0.3)' : 'rgba(52,211,153,0.3)'; ev.currentTarget.style.color = u.status === 'Ativo' ? '#fbbf24' : '#34d399' }}
                        onMouseLeave={ev => { ev.currentTarget.style.background = 'transparent'; ev.currentTarget.style.borderColor = 'transparent'; ev.currentTarget.style.color = '#64748b' }}
                      >
                        {u.status === 'Ativo'
                          ? <PauseCircle size={16} weight="bold" />
                          : <PlayCircle size={16} weight="bold" />}
                      </button>
                    </TooltipGlobal>
                    <TooltipGlobal descricao="Editar dados e permissões deste usuário">
                      <button
                        type="button"
                        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 28, height: 28, borderRadius: '50%', background: 'transparent', border: '1px solid transparent', color: '#64748b', cursor: 'pointer', transition: 'all 0.15s', flexShrink: 0 }}
                        onMouseEnter={ev => { ev.currentTarget.style.background = 'rgba(129,140,248,0.12)'; ev.currentTarget.style.borderColor = 'rgba(129,140,248,0.3)'; ev.currentTarget.style.color = '#818cf8' }}
                        onMouseLeave={ev => { ev.currentTarget.style.background = 'transparent'; ev.currentTarget.style.borderColor = 'transparent'; ev.currentTarget.style.color = '#64748b' }}
                      >
                        <PencilSimple size={15} weight="bold" />
                      </button>
                    </TooltipGlobal>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem', padding: '0.75rem 1.25rem', borderTop: '1px solid rgba(129,140,248,0.08)', background: 'rgba(129,140,248,0.02)' }}>
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
            style={{ background: 'var(--ws-bg-body, #0f172a)', border: '1px solid rgba(129,140,248,0.12)', borderRadius: '6px', padding: '0.25rem 0.5rem', color: '#f1f5f9', fontSize: '0.8125rem', fontFamily: 'inherit', cursor: 'pointer' }}>
            {[10, 20, 50].map(n => <option key={n} value={n}>{n}</option>)}
          </select>
        </div>
      </div>
    </div>
  )
}
