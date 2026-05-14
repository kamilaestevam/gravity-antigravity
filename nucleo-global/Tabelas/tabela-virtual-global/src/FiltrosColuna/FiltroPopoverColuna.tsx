// FiltrosColuna/FiltroPopoverColuna.tsx
//
// Popover ancorado no header da coluna (ou no chip ativo) para edição/seleção
// do filtro de uma coluna. Suporta 3 modos: texto livre, enum (checkboxes
// com busca embutida + "Selecionar tudo") e numero (intervalo min/max).
//
// Refactor D9 (2026-05-13): promovido de produtos/pedido/Pedidos.tsx.
// Mudanças vs. versão original do Pedido:
//   - i18n via prop `traducoes` (default pt-BR)
//   - `labelInverso` opcional (era hardcoded em LABELS_FILTRO_INVERSO do Pedido)
//   - `zIndex` configurável (default 9999, mantém Pedido atual)
//   - CSS prefix `.fc-*` em vez de `.lp-*` (evita conflito com produtos)

import React, { useEffect, useRef, useState } from 'react'
import type { FiltroPopoverColunaProps } from './tipos'
import { FILTRO_TRADUCOES_PT_BR } from './tipos'

export function FiltroPopoverColuna({
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
  // Aceito mas não usado diretamente — fica disponível para callers que queiram
  // conhecer o mapa label↔raw (futuras integrações). A inversão real é feita
  // pelo consumer no client-side filter step, não aqui.
  labelInverso: _labelInverso,
  traducoes,
  zIndex = 9999,
}: FiltroPopoverColunaProps) {
  // Merge de traduções com defaults pt-BR
  const t = { ...FILTRO_TRADUCOES_PT_BR, ...traducoes }

  const ref = useRef<HTMLDivElement>(null)

  // Posiciona o popover ancorado ao elemento âncora.
  const [pos, setPos] = useState({ top: 0, left: 0 })
  useEffect(() => {
    if (anchorRef.current) {
      const rect = anchorRef.current.getBoundingClientRect()
      const left = Math.max(8, rect.left - 20)
      const top = rect.bottom + 6
      setPos({ top, left })
    }
  }, [anchorRef])

  // Fecha ao clicar fora (mas ignora cliques na âncora — caller controla toggle).
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

  // Estado local — copiado do filtro atual ao abrir, aplicado em batch.
  const [textoLocal, setTextoLocal] = useState(
    filtroAtual?.tipo === 'texto' ? filtroAtual.valor : '',
  )
  const [enumLocal, setEnumLocal] = useState<Set<string>>(
    filtroAtual?.tipo === 'enum' ? new Set(filtroAtual.valor) : new Set(),
  )
  const [enumBusca, setEnumBusca] = useState('')
  const [minLocal, setMinLocal] = useState(
    filtroAtual?.tipo === 'numero' && filtroAtual.valor.min != null
      ? String(filtroAtual.valor.min)
      : '',
  )
  const [maxLocal, setMaxLocal] = useState(
    filtroAtual?.tipo === 'numero' && filtroAtual.valor.max != null
      ? String(filtroAtual.valor.max)
      : '',
  )

  function aplicar(): void {
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

  function limpar(): void {
    onLimpar(campo)
    onFechar()
  }

  const valoresFiltrados = valoresUnicos.filter((v) =>
    v.toLowerCase().includes(enumBusca.toLowerCase()),
  )

  return (
    <div
      ref={ref}
      className="fc-popover gtv-export-menu"
      style={{
        position: 'fixed',
        top: pos.top,
        left: pos.left,
        minWidth: 230,
        maxWidth: 290,
        padding: 0,
        zIndex,
        background: '#1e2130',
      }}
      role="dialog"
      aria-label={`Filtrar coluna ${label}`}
    >
      {/* Cabeçalho — nome da coluna */}
      <div className="fc-popover-titulo">{label.toUpperCase()}</div>

      {/* Ordenar */}
      <div className="fc-popover-acoes gtv-col-acoes" style={{ flexDirection: 'row', gap: '0.25rem', padding: '0.375rem 0.5rem' }}>
        <button
          type="button"
          className="gtv-col-acao-btn"
          style={{ flex: 1, justifyContent: 'center' }}
          onClick={() => { onOrdenar(campo, 'asc'); onFechar() }}
        >
          ↑ {t.ordenarAsc}
        </button>
        <button
          type="button"
          className="gtv-col-acao-btn"
          style={{ flex: 1, justifyContent: 'center' }}
          onClick={() => { onOrdenar(campo, 'desc'); onFechar() }}
        >
          ↓ {t.ordenarDesc}
        </button>
      </div>

      <div style={{ height: 1, background: 'var(--gtv-border, rgba(255,255,255,0.07))' }} />

      {/* Filtrar por — texto (livre, apenas quando não há valores conhecidos) */}
      {tipo === 'texto' && valoresUnicos.length === 0 && (
        <div style={{ padding: '0.375rem 0.5rem' }}>
          <div className="fc-popover-section-title">{t.filtrarPor}</div>
          <div className="fc-popover-busca gtv-col-busca" style={{ borderRadius: '6px', marginTop: '0.25rem' }}>
            <input
              type="text"
              className="gtv-col-busca-input"
              placeholder={t.buscar}
              value={textoLocal}
              onChange={(e) => setTextoLocal(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') aplicar() }}
              autoFocus
            />
          </div>
        </div>
      )}

      {/* Filtrar por — enum (checkboxes) — também para texto com valores conhecidos */}
      {(tipo === 'enum' || (tipo === 'texto' && valoresUnicos.length > 0)) && (
        <div style={{ padding: '0.375rem 0.5rem' }}>
          <div className="fc-popover-section-title">{t.filtrarPor}</div>
          {valoresUnicos.length > 6 && (
            <div className="fc-popover-busca gtv-col-busca" style={{ borderRadius: '6px', margin: '0.25rem 0' }}>
              <input
                type="text"
                className="gtv-col-busca-input"
                placeholder={t.buscar}
                value={enumBusca}
                onChange={(e) => setEnumBusca(e.target.value)}
              />
            </div>
          )}
          {/* Selecionar tudo / Limpar — opera sobre valoresFiltrados (respeita busca) */}
          {valoresFiltrados.length > 0 && (() => {
            const totalFiltrados = valoresFiltrados.length
            const selecionadosFiltrados = valoresFiltrados.filter((v) => enumLocal.has(v)).length
            const todosSelecionados = selecionadosFiltrados === totalFiltrados
            const algumSelecionado = selecionadosFiltrados > 0 && !todosSelecionados
            return (
              <label
                className="fc-popover-selecionar-tudo gtv-export-item"
                style={{
                  cursor: 'pointer',
                  gap: '0.5rem',
                  padding: '0.3rem 0.5rem',
                  borderRadius: '6px',
                  fontWeight: 600,
                  borderBottom: '1px solid var(--gtv-border, rgba(255,255,255,0.07))',
                  marginBottom: '0.125rem',
                }}
              >
                <input
                  type="checkbox"
                  checked={todosSelecionados}
                  ref={(el) => { if (el) el.indeterminate = algumSelecionado }}
                  style={{ accentColor: 'var(--gtv-accent, #818cf8)', cursor: 'pointer', flexShrink: 0 }}
                  onChange={() => {
                    const novo = new Set(enumLocal)
                    if (todosSelecionados) {
                      // Desmarca todos os filtrados (mantém os não-filtrados marcados)
                      for (const v of valoresFiltrados) novo.delete(v)
                    } else {
                      // Marca todos os filtrados
                      for (const v of valoresFiltrados) novo.add(v)
                    }
                    setEnumLocal(novo)
                    if (novo.size > 0) onAplicar(campo, { tipo: 'enum', valor: novo })
                    else onLimpar(campo)
                  }}
                />
                <span style={{ fontSize: '0.8125rem' }}>
                  {todosSelecionados ? t.limparSelecao : t.selecionarTudo}
                  {enumBusca ? ` (${totalFiltrados})` : ''}
                </span>
              </label>
            )
          })()}
          <div
            className="fc-popover-lista"
            style={{ display: 'flex', flexDirection: 'column', gap: '0.125rem', maxHeight: 168, overflowY: 'auto', padding: '0.25rem 0' }}
          >
            {valoresFiltrados.length > 0 ? valoresFiltrados.map((v) => (
              <label
                key={v}
                className="fc-popover-item gtv-export-item"
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
                <span style={{ fontSize: '0.8125rem' }}>{v || t.vazio}</span>
              </label>
            )) : (
              <div className="fc-popover-vazio gtv-col-vazio">{t.nenhumValor}</div>
            )}
          </div>
        </div>
      )}

      {/* Filtrar por — intervalo numérico */}
      {tipo === 'numero' && (
        <div style={{ padding: '0.375rem 0.5rem' }}>
          <div className="fc-popover-section-title">{t.filtrarPor}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', marginTop: '0.25rem' }}>
            <div className="fc-popover-busca gtv-col-busca" style={{ borderRadius: '6px', flex: 1 }}>
              <input
                type="number"
                className="gtv-col-busca-input"
                placeholder={t.minimo}
                value={minLocal}
                onChange={(e) => setMinLocal(e.target.value)}
              />
            </div>
            <span style={{ color: 'var(--gtv-muted, #64748b)', fontSize: '0.75rem', flexShrink: 0 }}>—</span>
            <div className="fc-popover-busca gtv-col-busca" style={{ borderRadius: '6px', flex: 1 }}>
              <input
                type="number"
                className="gtv-col-busca-input"
                placeholder={t.maximo}
                value={maxLocal}
                onChange={(e) => setMaxLocal(e.target.value)}
              />
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <div style={{ height: 1, background: 'var(--gtv-border, rgba(255,255,255,0.07))' }} />
      <div
        className="fc-popover-footer"
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.375rem 0.5rem' }}
      >
        <button type="button" className="gtv-col-acao-btn gtv-col-acao-btn--reset" onClick={limpar}>
          {t.limparFiltro}
        </button>
        {(tipo === 'texto' || tipo === 'numero') && (
          <button
            type="button"
            className="gtv-btn gtv-btn--ativo"
            style={{ padding: '0.25rem 0.75rem', fontSize: '0.75rem' }}
            onClick={aplicar}
          >
            {t.aplicar}
          </button>
        )}
      </div>
    </div>
  )
}
