/**
 * BotaoCompletoExportar — botão de exportação com dropdown de formatos.
 *
 * O dropdown é renderizado via React Portal no document.body com
 * position: fixed e coordenadas calculadas a partir do getBoundingClientRect()
 * do botão. Isso evita clipping por ancestrais com overflow:hidden (comum em
 * cards de tabela com border-radius).
 *
 * Recalcula posição em scroll/resize enquanto o menu está aberto.
 */

import React, { useState, useRef, useEffect, useLayoutEffect } from 'react'
import { createPortal } from 'react-dom'
import type { GTAcaoExport } from './tipos.js'
import './botao-completo-exportar.css'

// ─── Ícone de exportação ──────────────────────────────────────────────────────

function IconeExport() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 3v12M8 11l4 4 4-4M4 17v2a2 2 0 002 2h12a2 2 0 002-2v-2"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

// ─── Props ────────────────────────────────────────────────────────────────────

export interface BotaoCompletoExportarProps {
  acoes: GTAcaoExport[]
}

// ─── Componente ───────────────────────────────────────────────────────────────

interface MenuPosicao {
  top:   number
  right: number
}

export function BotaoCompletoExportar({ acoes }: BotaoCompletoExportarProps) {
  const [aberto, setAberto] = useState(false)
  const [posicao, setPosicao] = useState<MenuPosicao | null>(null)
  const btnRef  = useRef<HTMLButtonElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)

  // Recalcula posicao do menu a partir do bounding rect do botao
  const recalcularPosicao = () => {
    const btn = btnRef.current
    if (!btn) return
    const rect = btn.getBoundingClientRect()
    setPosicao({
      top:   rect.bottom + 6,                  // 6px abaixo do botao
      right: window.innerWidth - rect.right,   // alinhado a direita do botao
    })
  }

  // Calcula posicao inicial sincrono com primeiro render do menu (evita flash)
  useLayoutEffect(() => {
    if (aberto) recalcularPosicao()
  }, [aberto])

  // Listeners de scroll/resize enquanto aberto — fechar OU recalcular?
  // Decisao: recalcular em ambos (UX comum em popovers — segue o botao)
  useEffect(() => {
    if (!aberto) return
    const onScrollResize = () => recalcularPosicao()
    window.addEventListener('scroll', onScrollResize, true) // capture: pega scroll de ancestrais
    window.addEventListener('resize', onScrollResize)
    return () => {
      window.removeEventListener('scroll', onScrollResize, true)
      window.removeEventListener('resize', onScrollResize)
    }
  }, [aberto])

  // Click outside — fecha quando clica fora do botao e fora do menu
  useEffect(() => {
    if (!aberto) return
    function fora(e: MouseEvent) {
      const t = e.target as Node
      if (menuRef.current?.contains(t)) return
      if (btnRef.current?.contains(t)) return
      setAberto(false)
    }
    document.addEventListener('mousedown', fora)
    return () => document.removeEventListener('mousedown', fora)
  }, [aberto])

  if (!acoes || acoes.length === 0) return null

  return (
    <div className="gtv-export-wrapper">
      <button
        ref={btnRef}
        className={`gtv-btn${aberto ? ' gtv-btn--ativo' : ''}`}
        onClick={e => {
          e.stopPropagation()
          setAberto(v => !v)
        }}
        aria-label="Exportar"
        title="Exportar"
      >
        <IconeExport />
        Exportar
      </button>

      {aberto && posicao && createPortal(
        <div
          ref={menuRef}
          className="gtv-export-menu"
          style={{ top: `${posicao.top}px`, right: `${posicao.right}px` }}
        >
          {acoes.map((acao) => (
            <button
              key={acao.label}
              className="gtv-export-item"
              onClick={() => {
                acao.onClick()
                setAberto(false)
              }}
            >
              {acao.icone}
              {acao.label}
            </button>
          ))}
        </div>,
        document.body,
      )}
    </div>
  )
}
