/**
 * modal-buscar-ncm-simulador-bid-frete.tsx — Modal de busca de NCM do simulador
 * de marketing. Réplica visual/UX do CampoBuscarNcm do núcleo (produto real),
 * mas buscando no snapshot estático da tabela NCM de produção (Portal Único)
 * em vez da API — mesma semântica: código numérico → startsWith, texto →
 * contains insensitive, mínimo 2 caracteres, debounce 400ms, limite 20.
 */

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { MagnifyingGlass, X, ArrowsClockwise, CheckCircle } from '@phosphor-icons/react'
import ReactDOM from 'react-dom'
import {
  buscarNcmSimulador,
  obterUltimaSyncNcmSimulador,
  type NcmCatalogoSimulador,
} from './catalogo-ncm-simulador-bid-frete'

export interface ModalBuscarNcmSimuladorProps {
  aberto: boolean
  onFechar: () => void
  onSelecionar: (opcao: NcmCatalogoSimulador) => void
  /** Código pré-selecionado (para destacar no resultado) */
  valorAtual?: string
}

function formatarDataSync(iso: string): string {
  try {
    const d = new Date(iso)
    const dia = d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
    const hora = d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    return `${dia} ${hora}`
  } catch {
    return iso
  }
}

export function ModalBuscarNcmSimulador({
  aberto,
  onFechar,
  onSelecionar,
  valorAtual,
}: ModalBuscarNcmSimuladorProps) {
  const [query, setQuery] = useState('')
  const [itens, setItens] = useState<NcmCatalogoSimulador[]>([])
  const [carregando, setCarregando] = useState(false)
  const [ultimaSync, setUltimaSync] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Reset ao abrir + data da última sync (do snapshot de produção)
  useEffect(() => {
    if (aberto) {
      setQuery('')
      setItens([])
      setTimeout(() => inputRef.current?.focus(), 50)
      void obterUltimaSyncNcmSimulador().then(setUltimaSync)
    }
  }, [aberto])

  const executarBusca = useCallback(async (q: string) => {
    if (q.length < 2) {
      setItens([])
      return
    }
    setCarregando(true)
    try {
      setItens(await buscarNcmSimulador(q))
    } finally {
      setCarregando(false)
    }
  }, [])

  const handleQueryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const q = e.target.value
    setQuery(q)
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => void executarBusca(q), 400)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') onFechar()
  }

  if (!aberto) return null

  const modal = (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Buscar NCM"
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'rgba(2,6,23,0.75)',
        backdropFilter: 'blur(4px)',
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onFechar() }}
    >
      <div style={{
        background: 'var(--ws-surface, #0f172a)',
        border: '1px solid var(--ws-border, rgba(148,163,184,0.12))',
        borderRadius: '0.75rem',
        width: 'min(560px, 95vw)',
        maxHeight: '80vh',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        boxShadow: '0 25px 50px rgba(0,0,0,0.5)',
      }}>
        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '1rem 1.25rem',
          borderBottom: '1px solid var(--ws-border, rgba(148,163,184,0.12))',
        }}>
          <span style={{ color: 'var(--ws-text, #f1f5f9)', fontWeight: 700, fontSize: '0.9375rem' }}>
            Buscar NCM
          </span>
          <button
            type="button"
            onClick={onFechar}
            aria-label="Fechar"
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              width: '2rem', height: '2rem', borderRadius: '0.375rem',
              border: 'none', background: 'transparent',
              color: 'var(--ws-muted, #64748b)', cursor: 'pointer',
            }}
          >
            <X size={18} weight="bold" />
          </button>
        </div>

        {/* Campo de busca */}
        <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--ws-border, rgba(148,163,184,0.12))' }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: '0.625rem',
            padding: '0.625rem 0.875rem',
            background: 'var(--ws-input-bg, rgba(15,23,42,0.8))',
            border: '1px solid var(--ws-border, rgba(148,163,184,0.15))',
            borderRadius: '0.5rem',
          }}>
            {carregando
              ? <ArrowsClockwise size={16} className="nc-sim-spin" style={{ color: '#6366f1', flexShrink: 0 }} />
              : <MagnifyingGlass size={16} style={{ color: 'var(--ws-muted, #64748b)', flexShrink: 0 }} />
            }
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={handleQueryChange}
              onKeyDown={handleKeyDown}
              placeholder="Código (ex: 8471) ou descrição (ex: processador)…"
              style={{
                flex: 1,
                background: 'transparent',
                border: 'none',
                outline: 'none',
                color: 'var(--ws-text, #f1f5f9)',
                fontSize: '0.875rem',
              }}
            />
            {query && (
              <button
                type="button"
                onClick={() => { setQuery(''); setItens([]) }}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ws-muted, #64748b)', padding: 0 }}
              >
                <X size={14} />
              </button>
            )}
          </div>
          <p style={{ marginTop: '0.5rem', fontSize: '0.75rem', color: 'var(--ws-muted, #64748b)' }}>
            Digite o código NCM (8 dígitos) ou palavras da descrição
          </p>
        </div>

        {/* Resultados */}
        <div style={{ overflowY: 'auto', flex: 1 }}>
          {query.length >= 2 && !carregando && itens.length === 0 && (
            <div style={{
              padding: '2rem 1.5rem',
              textAlign: 'center',
              color: 'var(--ws-muted, #64748b)',
              fontSize: '0.875rem',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem',
            }}>
              <MagnifyingGlass size={28} weight="duotone" style={{ color: '#94a3b8' }} />
              <span>
                Nenhum NCM encontrado para <strong>&quot;{query}&quot;</strong>.
              </span>
              <span style={{ fontSize: '0.75rem', color: 'var(--ws-muted, #64748b)', opacity: 0.7 }}>
                Verifique a grafia ou tente buscar pelo código de 8 dígitos.
              </span>
            </div>
          )}

          {query.length < 2 && (
            <div style={{ padding: '2rem 1.5rem', textAlign: 'center', color: 'var(--ws-muted, #64748b)', fontSize: '0.875rem' }}>
              Digite pelo menos 2 caracteres para buscar.
            </div>
          )}

          {itens.map((item) => {
            const isSelecionado = item.codigo === valorAtual
            return (
              <button
                key={item.codigo}
                type="button"
                onClick={() => { onSelecionar(item); onFechar() }}
                style={{
                  display: 'flex', alignItems: 'center', gap: '1rem',
                  width: '100%', padding: '0.75rem 1.25rem',
                  background: isSelecionado ? 'rgba(99,102,241,0.12)' : 'transparent',
                  border: 'none', borderBottom: '1px solid var(--ws-border, rgba(148,163,184,0.06))',
                  cursor: 'pointer', textAlign: 'left',
                  transition: 'background 0.1s',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = isSelecionado ? 'rgba(99,102,241,0.18)' : 'rgba(148,163,184,0.06)' }}
                onMouseLeave={(e) => { e.currentTarget.style.background = isSelecionado ? 'rgba(99,102,241,0.12)' : 'transparent' }}
              >
                <span style={{
                  fontFamily: 'monospace', fontWeight: 700,
                  color: isSelecionado ? '#a5b4fc' : '#94a3b8',
                  fontSize: '0.875rem', flexShrink: 0, minWidth: '5.5rem',
                }}>
                  {item.codigo}
                </span>
                <span style={{ color: 'var(--ws-text-secondary, #cbd5e1)', fontSize: '0.875rem', flex: 1 }}>
                  {item.descricao}
                </span>
                {isSelecionado && (
                  <CheckCircle size={16} weight="fill" style={{ color: '#6366f1', flexShrink: 0 }} />
                )}
              </button>
            )
          })}
        </div>

        {/* Footer — sync date + contagem */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0.625rem 1.25rem',
          borderTop: '1px solid var(--ws-border, rgba(148,163,184,0.12))',
          background: 'rgba(15,23,42,0.5)',
          fontSize: '0.75rem',
          gap: '1rem',
        }}>
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.375rem',
            color: ultimaSync ? '#34d399' : '#fbbf24',
            fontWeight: 500,
          }}>
            <ArrowsClockwise size={12} weight="bold" />
            {ultimaSync
              ? <>Última sincronização em: {formatarDataSync(ultimaSync)}</>
              : 'Tabela NCM não sincronizada'
            }
          </span>
          {itens.length > 0 && (
            <span style={{ color: 'var(--ws-muted, #94a3b8)' }}>
              {itens.length} resultado{itens.length !== 1 ? 's' : ''}
            </span>
          )}
        </div>
      </div>
    </div>
  )

  return ReactDOM.createPortal(modal, document.body)
}
