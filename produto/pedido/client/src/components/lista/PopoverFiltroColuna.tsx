/**
 * FiltroPopoverColuna.tsx — Popover de filtro por coluna da ListaPedidos
 *
 * Exibido ao clicar no ícone de filtro do cabeçalho de cada coluna.
 * Suporta três modos: texto livre, enum (checkboxes) e intervalo numérico.
 */

import React, { useRef, useEffect } from 'react'
import { ArrowUp, ArrowDown } from '@phosphor-icons/react'
import type { FiltroAtivo } from './filtros'

export interface PopoverFiltroColunaProps {
  campo: string
  label: string
  tipo: 'texto' | 'numero' | 'enum'
  filtroAtual: FiltroAtivo | undefined
  valoresUnicos: string[]
  onAplicar: (campo: string, filtro: FiltroAtivo) => void
  onLimpar: (campo: string) => void
  onOrdenar: (campo: string, dir: 'asc' | 'desc') => void
  onFechar: () => void
  anchorRef: React.RefObject<HTMLElement>
}

export function PopoverFiltroColuna({
  campo,
  label,
  tipo,
  filtroAtual,
  valoresUnicos,
  onAplicar,
  onLimpar,
  onOrdenar,
  onFechar,
  anchorRef,
}: PopoverFiltroColunaProps) {
  const ref = useRef<HTMLDivElement>(null)

  const [pos, setPos] = React.useState({ top: 0, left: 0 })
  useEffect(() => {
    if (anchorRef.current) {
      const rect = anchorRef.current.getBoundingClientRect()
      const left = Math.max(8, rect.left - 20)
      const top = rect.bottom + 6
      setPos({ top, left })
    }
  }, [anchorRef])

  useEffect(() => {
    function fora(e: MouseEvent) {
      if (
        ref.current &&
        !ref.current.contains(e.target as Node) &&
        anchorRef.current &&
        !anchorRef.current.contains(e.target as Node)
      ) {
        onFechar()
      }
    }
    document.addEventListener('mousedown', fora)
    return () => document.removeEventListener('mousedown', fora)
  }, [onFechar, anchorRef])

  const [textoLocal, setTextoLocal] = React.useState(
    filtroAtual?.tipo === 'texto' ? filtroAtual.valor : '',
  )
  const [enumLocal, setEnumLocal] = React.useState<Set<string>>(
    filtroAtual?.tipo === 'enum' ? new Set(filtroAtual.valor) : new Set(),
  )
  const [enumBusca, setEnumBusca] = React.useState('')
  const [minLocal, setMinLocal] = React.useState(
    filtroAtual?.tipo === 'numero' && filtroAtual.valor.min != null
      ? String(filtroAtual.valor.min)
      : '',
  )
  const [maxLocal, setMaxLocal] = React.useState(
    filtroAtual?.tipo === 'numero' && filtroAtual.valor.max != null
      ? String(filtroAtual.valor.max)
      : '',
  )

  function aplicar() {
    if (tipo === 'texto' && valoresUnicos.length === 0) {
      if (textoLocal.trim()) {
        onAplicar(campo, { tipo: 'texto', valor: textoLocal.trim() })
      } else {
        onLimpar(campo)
      }
    } else if (tipo === 'enum' || (tipo === 'texto' && valoresUnicos.length > 0)) {
      if (enumLocal.size > 0) {
        onAplicar(campo, { tipo: 'enum', valor: new Set(enumLocal) })
      } else {
        onLimpar(campo)
      }
    } else if (tipo === 'numero') {
      const min = minLocal !== '' ? Number(minLocal) : undefined
      const max = maxLocal !== '' ? Number(maxLocal) : undefined
      if (min != null || max != null) {
        onAplicar(campo, { tipo: 'numero', valor: { min, max } })
      } else {
        onLimpar(campo)
      }
    }
    onFechar()
  }

  function limpar() {
    onLimpar(campo)
    onFechar()
  }

  const valoresFiltrados = valoresUnicos.filter(v =>
    v.toLowerCase().includes(enumBusca.toLowerCase()),
  )

  return (
    <div
      ref={ref}
      className="gtv-export-menu"
      style={{
        position: 'fixed',
        top: pos.top,
        left: pos.left,
        minWidth: 230,
        maxWidth: 290,
        padding: 0,
        zIndex: 9999,
        background: '#1e2130',
      }}
      role="dialog"
      aria-label={`Filtrar coluna ${label}`}
    >
      {/* Cabeçalho — nome da coluna */}
      <div className="lp-filtro-coluna-nome">{label.toUpperCase()}</div>

      {/* Ordenar */}
      <div className="gtv-col-acoes" style={{ flexDirection: 'row', gap: '0.25rem', padding: '0.375rem 0.5rem' }}>
        <button
          type="button"
          className="gtv-col-acao-btn"
          style={{ flex: 1, justifyContent: 'center' }}
          onClick={() => { onOrdenar(campo, 'asc'); onFechar() }}
        >
          <ArrowUp size={11} weight="bold" /> Cresc.
        </button>
        <button
          type="button"
          className="gtv-col-acao-btn"
          style={{ flex: 1, justifyContent: 'center' }}
          onClick={() => { onOrdenar(campo, 'desc'); onFechar() }}
        >
          <ArrowDown size={11} weight="bold" /> Decresc.
        </button>
      </div>

      <div style={{ height: 1, background: 'var(--gtv-border, rgba(255,255,255,0.07))' }} />

      {/* Filtrar por — texto (livre, apenas quando não há valores conhecidos) */}
      {tipo === 'texto' && valoresUnicos.length === 0 && (
        <div style={{ padding: '0.375rem 0.5rem' }}>
          <div className="lp-filtro-section-title">FILTRAR POR</div>
          <div className="gtv-col-busca" style={{ borderRadius: '6px', marginTop: '0.25rem' }}>
            <input
              type="text"
              className="gtv-col-busca-input"
              placeholder="Buscar..."
              value={textoLocal}
              onChange={e => setTextoLocal(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') aplicar() }}
              autoFocus
            />
          </div>
        </div>
      )}

      {/* Filtrar por — enum (checkboxes) — também para texto com valores conhecidos */}
      {(tipo === 'enum' || (tipo === 'texto' && valoresUnicos.length > 0)) && (
        <div style={{ padding: '0.375rem 0.5rem' }}>
          <div className="lp-filtro-section-title">FILTRAR POR</div>
          {valoresUnicos.length > 6 && (
            <div className="gtv-col-busca" style={{ borderRadius: '6px', margin: '0.25rem 0' }}>
              <input
                type="text"
                className="gtv-col-busca-input"
                placeholder="Buscar..."
                value={enumBusca}
                onChange={e => setEnumBusca(e.target.value)}
              />
            </div>
          )}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.125rem', maxHeight: 168, overflowY: 'auto', padding: '0.25rem 0' }}>
            {valoresFiltrados.length > 0 ? valoresFiltrados.map(v => (
              <label
                key={v}
                className="gtv-export-item"
                style={{ cursor: 'pointer', gap: '0.5rem', padding: '0.3rem 0.5rem', borderRadius: '6px' }}
              >
                <input
                  type="checkbox"
                  checked={enumLocal.has(v)}
                  style={{ accentColor: 'var(--gtv-accent, #818cf8)', cursor: 'pointer', flexShrink: 0 }}
                  onChange={() => {
                    const novo = new Set(enumLocal)
                    if (novo.has(v)) novo.delete(v)
                    else novo.add(v)
                    setEnumLocal(novo)
                    if (novo.size > 0) onAplicar(campo, { tipo: 'enum', valor: novo })
                    else onLimpar(campo)
                  }}
                />
                <span style={{ fontSize: '0.8125rem' }}>{v || '(vazio)'}</span>
              </label>
            )) : (
              <div className="gtv-col-vazio">Nenhum valor encontrado</div>
            )}
          </div>
        </div>
      )}

      {/* Filtrar por — intervalo numérico */}
      {tipo === 'numero' && (
        <div style={{ padding: '0.375rem 0.5rem' }}>
          <div className="lp-filtro-section-title">INTERVALO</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', marginTop: '0.25rem' }}>
            <div className="gtv-col-busca" style={{ borderRadius: '6px', flex: 1 }}>
              <input type="number" className="gtv-col-busca-input" placeholder="Mín" value={minLocal} onChange={e => setMinLocal(e.target.value)} />
            </div>
            <span style={{ color: 'var(--gtv-muted, #64748b)', fontSize: '0.75rem', flexShrink: 0 }}>—</span>
            <div className="gtv-col-busca" style={{ borderRadius: '6px', flex: 1 }}>
              <input type="number" className="gtv-col-busca-input" placeholder="Máx" value={maxLocal} onChange={e => setMaxLocal(e.target.value)} />
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <div style={{ height: 1, background: 'var(--gtv-border, rgba(255,255,255,0.07))' }} />
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.375rem 0.5rem' }}>
        <button type="button" className="gtv-col-acao-btn gtv-col-acao-btn--reset" onClick={limpar}>
          × Limpar filtro
        </button>
        {(tipo === 'texto' || tipo === 'numero') && (
          <button type="button" className="gtv-btn gtv-btn--ativo" style={{ padding: '0.25rem 0.75rem', fontSize: '0.75rem' }} onClick={aplicar}>
            Aplicar
          </button>
        )}
      </div>
    </div>
  )
}
