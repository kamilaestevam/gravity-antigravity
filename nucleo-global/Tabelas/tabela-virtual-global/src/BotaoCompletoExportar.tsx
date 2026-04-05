/**
 * BotaoCompletoExportar — botão de exportação com dropdown de formatos.
 * Encapsula estado de abrir/fechar, click-outside e renderização dos itens.
 * Usado internamente pela TabelaVirtualGlobal via prop acoesExportacao.
 */

import React, { useState, useRef, useEffect } from 'react'
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

export function BotaoCompletoExportar({ acoes }: BotaoCompletoExportarProps) {
  const [aberto, setAberto] = useState(false)
  const btnRef  = useRef<HTMLButtonElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)

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

      {aberto && (
        <div ref={menuRef} className="gtv-export-menu">
          {acoes.map((acao, i) => (
            <button
              key={i}
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
        </div>
      )}
    </div>
  )
}
