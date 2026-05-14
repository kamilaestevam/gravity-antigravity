/**
 * SelectOrganizacaoAdminGlobal.tsx — Autocomplete admin-only de organizações
 *
 * Componente reutilizável para telas administrativas Gravity (cross-org).
 * Restringe digitação livre de UUID — força escolha por nome via autocomplete
 * com debounce. Decisão do Líder Técnico durante revisão da Opção B do plano
 * Empresas e Parceiros Admin.
 *
 * Decisão arquitetural:
 * - Componente NÃO acopla URL/auth do Configurador. Recebe `fetchOrganizacoes`
 *   via prop — a página chamadora injeta o cliente HTTP correto.
 * - Não usar em telas tenant. Nome inclui "Admin" para deixar isso explícito.
 *
 * Props:
 *  - value: id_organizacao selecionado (string vazia = "todas as organizações")
 *  - onChange: callback com id_organizacao (ou '' se limpou)
 *  - fetchOrganizacoes: função async que retorna lista filtrada pela query
 *  - placeholder, label, disabled, permitirVazio
 */

import React, { useEffect, useRef, useState, useId } from 'react'
import { MagnifyingGlass, X, CaretDown } from '@phosphor-icons/react'

export interface OrganizacaoOpcao {
  id_organizacao: string
  nome_organizacao: string
}

export interface SelectOrganizacaoAdminGlobalProps {
  value:               string
  onChange:            (id_organizacao: string, nome_organizacao?: string) => void
  fetchOrganizacoes:   (busca: string) => Promise<OrganizacaoOpcao[]>
  label?:              string
  placeholder?:        string
  disabled?:           boolean
  /** Quando true, mostra opção "Todas as organizações" (default: true) */
  permitirVazio?:      boolean
  /** Texto da opção vazia — default: "Todas as organizações" */
  textoVazio?:         string
  className?:          string
}

const DEBOUNCE_MS = 300

export function SelectOrganizacaoAdminGlobal({
  value,
  onChange,
  fetchOrganizacoes,
  label             = 'Organização',
  placeholder       = 'Buscar organização...',
  disabled          = false,
  permitirVazio     = true,
  textoVazio        = 'Todas as organizações',
  className,
}: SelectOrganizacaoAdminGlobalProps): JSX.Element {
  const id = useId()
  const [busca, setBusca] = useState('')
  const [aberto, setAberto] = useState(false)
  const [resultados, setResultados] = useState<OrganizacaoOpcao[]>([])
  const [carregando, setCarregando] = useState(false)
  const [nomeSelecionado, setNomeSelecionado] = useState<string>('')
  const containerRef = useRef<HTMLDivElement>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Resolve nome quando value muda externamente (ex: navegação direta com ?id_organizacao=).
  // Faz uma busca exata para popular o nome.
  useEffect(() => {
    if (!value) {
      setNomeSelecionado('')
      return
    }
    let cancelado = false
    void (async () => {
      try {
        const lista = await fetchOrganizacoes(value)
        const achado = lista.find((o) => o.id_organizacao === value)
        if (!cancelado && achado) setNomeSelecionado(achado.nome_organizacao)
      } catch {
        // Silencioso — UI mostra o id como fallback se o nome não puder ser resolvido.
      }
    })()
    return () => { cancelado = true }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value])

  // Debounce da busca
  useEffect(() => {
    if (!aberto) return
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(async () => {
      setCarregando(true)
      try {
        const lista = await fetchOrganizacoes(busca)
        setResultados(lista)
      } catch {
        setResultados([])
      } finally {
        setCarregando(false)
      }
    }, DEBOUNCE_MS)
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [busca, aberto, fetchOrganizacoes])

  // Fecha ao clicar fora
  useEffect(() => {
    function onClickFora(e: MouseEvent): void {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setAberto(false)
      }
    }
    document.addEventListener('mousedown', onClickFora)
    return () => document.removeEventListener('mousedown', onClickFora)
  }, [])

  function selecionar(opcao: OrganizacaoOpcao): void {
    onChange(opcao.id_organizacao, opcao.nome_organizacao)
    setNomeSelecionado(opcao.nome_organizacao)
    setBusca('')
    setAberto(false)
  }

  function limpar(e: React.MouseEvent): void {
    e.stopPropagation()
    onChange('', undefined)
    setNomeSelecionado('')
    setBusca('')
  }

  const valorVisivel = value
    ? (nomeSelecionado || value) // fallback para id se nome ainda não resolvido
    : (permitirVazio ? textoVazio : '')

  return (
    <div ref={containerRef} className={className} style={{ position: 'relative' }}>
      {label && (
        <label
          htmlFor={id}
          style={{
            display: 'block',
            fontSize: '0.75rem',
            fontWeight: 500,
            color: 'var(--ws-text-muted, #94a3b8)',
            marginBottom: 4,
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
          }}
        >
          {label}
        </label>
      )}

      <button
        id={id}
        type="button"
        disabled={disabled}
        onClick={() => setAberto((a) => !a)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          width: '100%',
          padding: '8px 12px',
          background: 'var(--ws-input-bg, #1e293b)',
          border: '1px solid var(--ws-border, #334155)',
          borderRadius: 6,
          color: value ? 'var(--ws-text, #e2e8f0)' : 'var(--ws-text-muted, #94a3b8)',
          fontSize: '0.875rem',
          cursor: disabled ? 'not-allowed' : 'pointer',
          opacity: disabled ? 0.6 : 1,
          textAlign: 'left',
        }}
      >
        <MagnifyingGlass size={14} weight="bold" />
        <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {valorVisivel || placeholder}
        </span>
        {value && (
          <span
            role="button"
            tabIndex={0}
            onClick={limpar}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') limpar(e as unknown as React.MouseEvent) }}
            aria-label="Limpar seleção"
            style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}
          >
            <X size={12} weight="bold" />
          </span>
        )}
        <CaretDown size={12} weight="bold" />
      </button>

      {aberto && (
        <div
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            marginTop: 4,
            background: 'var(--ws-surface, #0f172a)',
            border: '1px solid var(--ws-border, #334155)',
            borderRadius: 6,
            boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
            zIndex: 1000,
            maxHeight: 320,
            overflow: 'auto',
          }}
        >
          <div style={{ padding: 8, borderBottom: '1px solid var(--ws-border, #334155)' }}>
            <input
              type="text"
              autoFocus
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder={placeholder}
              style={{
                width: '100%',
                padding: '6px 10px',
                background: 'var(--ws-input-bg, #1e293b)',
                border: '1px solid var(--ws-border, #334155)',
                borderRadius: 4,
                color: 'var(--ws-text, #e2e8f0)',
                fontSize: '0.875rem',
              }}
            />
          </div>

          {permitirVazio && (
            <button
              type="button"
              onClick={() => { onChange('', undefined); setNomeSelecionado(''); setAberto(false) }}
              style={{
                display: 'block',
                width: '100%',
                padding: '8px 12px',
                background: 'transparent',
                border: 'none',
                color: 'var(--ws-text-muted, #94a3b8)',
                fontSize: '0.875rem',
                fontStyle: 'italic',
                textAlign: 'left',
                cursor: 'pointer',
              }}
            >
              {textoVazio}
            </button>
          )}

          {carregando && (
            <div style={{ padding: 12, color: 'var(--ws-text-muted)', fontSize: '0.75rem' }}>
              Buscando...
            </div>
          )}

          {!carregando && resultados.length === 0 && busca && (
            <div style={{ padding: 12, color: 'var(--ws-text-muted)', fontSize: '0.75rem' }}>
              Nenhuma organização encontrada para "{busca}"
            </div>
          )}

          {!carregando && resultados.map((o) => (
            <button
              key={o.id_organizacao}
              type="button"
              onClick={() => selecionar(o)}
              style={{
                display: 'block',
                width: '100%',
                padding: '8px 12px',
                background: o.id_organizacao === value ? 'var(--ws-accent-bg, rgba(99,102,241,0.1))' : 'transparent',
                border: 'none',
                color: 'var(--ws-text, #e2e8f0)',
                fontSize: '0.875rem',
                textAlign: 'left',
                cursor: 'pointer',
              }}
            >
              <div style={{ fontWeight: 500 }}>{o.nome_organizacao}</div>
              <div style={{ fontSize: '0.7rem', color: 'var(--ws-text-muted)', marginTop: 2 }}>
                {o.id_organizacao}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
