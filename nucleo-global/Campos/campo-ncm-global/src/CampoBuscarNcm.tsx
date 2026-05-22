/**
 * CampoBuscarNcm.tsx — Modal de busca de NCM por código ou descrição
 *
 * Chama GET /api/v1/ncm/buscar?q=...&limite=20
 * A busca é local (cache do tenant) — não chama o Portal Único em tempo real.
 *
 * Regras UX:
 *  - Busca por código numérico: startsWith (ex: "8471")
 *  - Busca por texto: contains insensitive (ex: "processador")
 *  - Mínimo 2 caracteres para iniciar busca
 *  - Debounce 400ms
 *  - Exibe aviso quando tabela NCM ainda não foi sincronizada
 */

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { MagnifyingGlass, X, ArrowsClockwise, CheckCircle, Lightbulb } from '@phosphor-icons/react'
import ReactDOM from 'react-dom'

export interface NcmOpcao {
  codigo:    string
  descricao: string
}

interface ResultadoBusca {
  itens:       NcmOpcao[]
  ultima_sync: string | null
  fuzzy:       boolean
}

export interface ModalBuscaNcmProps {
  aberto:      boolean
  onFechar:    () => void
  onSelecionar: (opcao: NcmOpcao) => void
  /** Código pré-selecionado (para destacar no resultado) */
  valorAtual?: string
  /** URL base do serviço NCM — padrão: /api/v1/ncm */
  baseUrl?: string
}

async function buscarNcms(query: string, baseUrl: string): Promise<ResultadoBusca> {
  const params = new URLSearchParams({ q: query, limite: '20' })
  const res = await fetch(`${baseUrl}/buscar?${params}`, { credentials: 'include' })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  const data = await res.json()
  const itensRaw = Array.isArray(data.itens) ? data.itens : (Array.isArray(data) ? data : [])
  const itens = itensRaw.filter(
    (item: unknown): item is NcmOpcao =>
      typeof item === 'object' && item !== null &&
      typeof (item as NcmOpcao).codigo === 'string' &&
      typeof (item as NcmOpcao).descricao === 'string'
  )
  return {
    itens,
    ultima_sync: typeof data.ultima_sync === 'string' ? data.ultima_sync : null,
    fuzzy:       data.fuzzy === true,
  }
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

export function CampoBuscarNcm({
  aberto,
  onFechar,
  onSelecionar,
  valorAtual,
  baseUrl = '/api/v1/cadastros/ncm',
}: ModalBuscaNcmProps) {
  const [query, setQuery]       = useState('')
  const [itens, setItens]       = useState<NcmOpcao[]>([])
  const [carregando, setCarregando] = useState(false)
  const [erro, setErro]         = useState<string | null>(null)
  const [ultimaSync, setUltimaSync] = useState<string | null>(null)
  const [fuzzy, setFuzzy]       = useState(false)
  const inputRef                = useRef<HTMLInputElement>(null)
  const timerRef                = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Reset ao abrir
  useEffect(() => {
    if (aberto) {
      setQuery('')
      setItens([])
      setErro(null)
      setFuzzy(false)
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [aberto])

  const executarBusca = useCallback(async (q: string) => {
    if (q.length < 2) {
      setItens([])
      return
    }

    setCarregando(true)
    setErro(null)
    setFuzzy(false)

    try {
      const resultado = await buscarNcms(q, baseUrl)
      setItens(resultado.itens)
      setFuzzy(resultado.fuzzy)
      if (resultado.ultima_sync) setUltimaSync(resultado.ultima_sync)
    } catch {
      setErro('Não foi possível buscar. Verifique a conexão com o servidor.')
    } finally {
      setCarregando(false)
    }
  }, [baseUrl])

  const handleQueryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const q = e.target.value
    setQuery(q)

    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => executarBusca(q), 400)
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
              ? <ArrowsClockwise size={16} style={{ color: '#6366f1', animation: 'spin 1s linear infinite', flexShrink: 0 }} />
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
          {erro && (
            <div style={{ padding: '1.5rem', textAlign: 'center', color: '#f87171', fontSize: '0.875rem' }}>
              {erro}
            </div>
          )}

          {!erro && query.length >= 2 && !carregando && itens.length === 0 && (
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

          {!erro && query.length < 2 && (
            <div style={{ padding: '2rem 1.5rem', textAlign: 'center', color: 'var(--ws-muted, #64748b)', fontSize: '0.875rem' }}>
              Digite pelo menos 2 caracteres para buscar.
            </div>
          )}

          {/* Banner de sugestão fuzzy */}
          {fuzzy && itens.length > 0 && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: '0.5rem',
              padding: '0.5rem 1.25rem',
              background: 'rgba(251,191,36,0.08)',
              borderBottom: '1px solid var(--ws-border, rgba(148,163,184,0.12))',
              fontSize: '0.75rem', color: '#fbbf24',
            }}>
              <Lightbulb size={14} weight="fill" style={{ flexShrink: 0 }} />
              <span>
                Busca exata sem resultados — mostrando sugestões semelhantes a <strong>&quot;{query}&quot;</strong>
              </span>
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
