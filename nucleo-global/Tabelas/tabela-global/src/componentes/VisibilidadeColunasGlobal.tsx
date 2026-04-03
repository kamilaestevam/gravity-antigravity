import React, { useRef, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { X, ArrowsCounterClockwise, CheckSquare, DotsSixVertical } from '@phosphor-icons/react'
import { SwitchGlobal } from '@nucleo/switch-global'
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
  /** Callback para reordenar colunas via drag-and-drop */
  onReordenar?: (fromIndex: number, toIndex: number) => void
}

export function VisibilidadeColunasGlobal({
  colunas,
  visibleKeys,
  onToggle,
  onReset,
  onShowAll,
  onHideAll,
  onFechar,
  triggerRef,
  onReordenar,
}: VisibilidadeColunasGlobalProps) {
  const { t } = useTranslation()
  const ref = useRef<HTMLDivElement>(null)
  const dragIndexRef = useRef<number | null>(null)

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

  return (
    <div
      ref={ref}
      className="vcg-popover"
      style={{ top: 'calc(100% + 6px)', right: 0 }}
      onClick={e => e.stopPropagation()}
    >
      <div className="vcg-header">
        <span className="vcg-title">{t('tabela.paineis_visiveis', 'Colunas Visíveis')}</span>
        <button onClick={onFechar} className="vcg-close-btn">
          <X size={14} weight="bold" />
        </button>
      </div>

      <div className="vcg-bulk-actions">
        <button className="vcg-bulk-btn" onClick={onShowAll}>
          <CheckSquare size={14} weight="fill" /> {t('tabela.selecionar_tudo', 'Selecionar Tudo')}
        </button>
        <button className="vcg-bulk-btn vcg-bulk-btn--reset" onClick={onReset}>
          <ArrowsCounterClockwise size={14} weight="bold" /> {t('tabela.restaurar_padrao', 'Restaurar Padrão')}
        </button>
      </div>

      <div className="vcg-list">
        {colunas.map((col, idx) => {
          const isVisible = visibleKeys.has(col.key)
          return (
            <div
              key={col.key}
              className="vcg-item"
              draggable={!!onReordenar && !col.naoOcultavel}
              onDragStart={() => { dragIndexRef.current = idx }}
              onDragOver={e => { e.preventDefault() }}
              onDrop={() => {
                if (dragIndexRef.current != null && dragIndexRef.current !== idx) {
                  onReordenar?.(dragIndexRef.current, idx)
                }
                dragIndexRef.current = null
              }}
            >
              {onReordenar && (
                <span className="vcg-drag-handle" title="Arrastar para reordenar">
                  <DotsSixVertical size={14} weight="bold" />
                </span>
              )}
              <SwitchGlobal
                label={col.label}
                checked={isVisible}
                onChange={() => !col.naoOcultavel && onToggle(col.key)}
                disabled={col.naoOcultavel}
              />
            </div>
          )
        })}
      </div>
    </div>
  )
}
