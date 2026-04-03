import React, { useRef, useEffect, useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { X, ArrowsCounterClockwise, CheckSquare } from '@phosphor-icons/react'
import './visibilidade.css'

export interface ColunaVisibilidade {
  key: string
  label: string
  naoOcultavel?: boolean
}

interface VisibilidadeColunasGlobalProps {
  colunas: ColunaVisibilidade[]
  visibleKeys: Set<string>
  onToggle: (key: string) => void
  onReset: () => void
  onShowAll: () => void
  onHideAll: () => void
  onFechar: () => void
  triggerRef: React.RefObject<HTMLButtonElement | null>
  /** Callback para reordenar colunas (fromKey → toKey) */
  onReordenar?: (fromKey: string, toKey: string) => void
}

export function VisibilidadeColunasGlobal({
  colunas,
  visibleKeys,
  onToggle,
  onReset,
  onShowAll,
  onFechar,
  triggerRef,
  onReordenar,
}: VisibilidadeColunasGlobalProps) {
  const { t } = useTranslation()
  const ref        = useRef<HTMLDivElement>(null)
  const dragKeyRef = useRef<string | null>(null)
  const [busca, setBusca] = useState('')

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

  const colunasFiltradas = useMemo(() => {
    const termo = busca.trim().toLowerCase()
    const lista = termo
      ? colunas.filter(c => c.label.toLowerCase().includes(termo))
      : colunas
    const sorted = [...lista].sort((a, b) => a.label.localeCompare(b.label, 'pt-BR'))
    return [
      ...sorted.filter(c =>  c.naoOcultavel),
      ...sorted.filter(c => !c.naoOcultavel),
    ]
  }, [colunas, busca])

  return (
    <div
      ref={ref}
      className="vcg-popover"
      style={{ top: 'calc(100% + 6px)', right: 0 }}
      onClick={e => e.stopPropagation()}
    >
      {/* ── Header ── */}
      <div className="vcg-header">
        <span className="vcg-title">{t('tabela.paineis_visiveis', 'Colunas Visíveis')}</span>
        <button onClick={onFechar} className="vcg-close-btn">
          <X size={14} weight="bold" />
        </button>
      </div>

      {/* ── Busca ── */}
      <div className="vcg-busca">
        <svg width="13" height="13" viewBox="0 0 256 256" fill="currentColor" className="vcg-busca-icone" aria-hidden="true">
          <path d="M229.66,218.34l-50.07-50.07a88.11,88.11,0,1,0-11.31,11.31l50.06,50.07a8,8,0,0,0,11.32-11.31ZM40,112a72,72,0,1,1,72,72A72.08,72.08,0,0,1,40,112Z"/>
        </svg>
        <input
          type="text"
          className="vcg-busca-input"
          placeholder="Localizar coluna..."
          value={busca}
          onChange={e => setBusca(e.target.value)}
          autoFocus
        />
        {busca && (
          <button type="button" className="vcg-busca-clear" onClick={() => setBusca('')} aria-label="Limpar busca">
            <svg width="10" height="10" viewBox="0 0 256 256" fill="currentColor" aria-hidden="true">
              <path d="M205.66,194.34a8,8,0,0,1-11.32,11.32L128,139.31,61.66,205.66a8,8,0,0,1-11.32-11.32L116.69,128,50.34,61.66A8,8,0,0,1,61.66,50.34L128,116.69l66.34-66.35a8,8,0,0,1,11.32,11.32L139.31,128Z"/>
            </svg>
          </button>
        )}
      </div>

      {/* ── Ações em lote ── */}
      <div className="vcg-bulk-actions">
        <button className="vcg-bulk-btn" onClick={onShowAll}>
          <CheckSquare size={14} weight="fill" /> {t('tabela.selecionar_tudo', 'Selecionar tudo')}
        </button>
        <button className="vcg-bulk-btn vcg-bulk-btn--reset" onClick={onReset}>
          <ArrowsCounterClockwise size={14} weight="bold" /> {t('tabela.restaurar_padrao', 'Restaurar padrão')}
        </button>
      </div>

      {/* ── Lista ── */}
      <div className="vcg-list">
        {colunasFiltradas.length === 0 ? (
          <div className="vcg-vazio">Nenhuma coluna encontrada</div>
        ) : (
          colunasFiltradas.map((col, idx) => {
            const isVisible = visibleKeys.has(col.key)
            const prevObrigatorio = idx > 0 && colunasFiltradas[idx - 1].naoOcultavel
            return (
              <React.Fragment key={col.key}>
                {/* Divisor entre obrigatórias e opcionais */}
                {!col.naoOcultavel && prevObrigatorio && (
                  <div className="vcg-divisor" />
                )}
                <label
                  className={`vcg-item${col.naoOcultavel ? ' vcg-item--locked' : ''}`}
                  draggable={!!onReordenar && !col.naoOcultavel}
                  onDragStart={() => { dragKeyRef.current = col.key }}
                  onDragOver={e => e.preventDefault()}
                  onDrop={() => {
                    if (dragKeyRef.current && dragKeyRef.current !== col.key) {
                      onReordenar?.(dragKeyRef.current, col.key)
                    }
                    dragKeyRef.current = null
                  }}
                >
                  {/* Cadeado (obrigatória) ou handle de drag (opcional) */}
                  {onReordenar && (
                    col.naoOcultavel ? (
                      <svg width="10" height="12" viewBox="0 0 256 256" fill="currentColor" className="vcg-lock-icon" aria-hidden="true">
                        <path d="M208,80H176V56a48,48,0,0,0-96,0V80H48A16,16,0,0,0,32,96V208a16,16,0,0,0,16,16H208a16,16,0,0,0,16-16V96A16,16,0,0,0,208,80ZM96,56a32,32,0,0,1,64,0V80H96ZM208,208H48V96H208V208Zm-80-32a16,16,0,1,0-16-16A16,16,0,0,0,128,176Z"/>
                      </svg>
                    ) : (
                      <svg width="10" height="14" viewBox="0 0 10 14" fill="none" className="vcg-drag-handle" aria-hidden="true">
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
                    className="vcg-checkbox"
                    checked={isVisible}
                    disabled={col.naoOcultavel}
                    onChange={() => !col.naoOcultavel && onToggle(col.key)}
                  />
                  <span className="vcg-label">{col.label}</span>
                </label>
              </React.Fragment>
            )
          })
        )}
      </div>
    </div>
  )
}
