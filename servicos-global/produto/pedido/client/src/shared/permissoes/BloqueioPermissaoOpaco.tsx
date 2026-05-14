// client/src/shared/permissoes/BloqueioPermissaoOpaco.tsx
//
// Wrapper UX para "sem permissão" — exibe o conteúdo OPACO com tag
// indicando bloqueio (decisão dono 2026-05-13). NÃO esconde o item.
//
// 3 modos:
//   - 'opaco-item'    → menu lateral / chip / link de aba (inline)
//   - 'opaco-botao'   → botão de ação (Novo, Editar, Excluir...) — passa disabled
//   - 'bloqueio-tela' → rota inteira gateada (URL direta) — mostra placeholder
//
// Acessibilidade: aria-disabled, role="note", tooltip via title.
//
// Defesa em profundidade: este componente é cosmético. O backend
// (criarRequirePermissao no resolver-organizacao) rejeita 403
// independente do que o frontend mostra.

import React from 'react'
import { ShieldSlash } from '@phosphor-icons/react'

export type ModoBloqueio = 'opaco-item' | 'opaco-botao' | 'bloqueio-tela'

export interface BloqueioPermissaoOpacoProps {
  /** True = liberado (renderiza filho normal). False = bloqueado (aplica modo). */
  pode: boolean
  /** Texto curto exibido na tag/tooltip. Default: "Sem permissão". */
  motivo?: string
  /** Como bloquear visualmente. Default: 'opaco-item'. */
  modo?: ModoBloqueio
  /** Conteúdo a renderizar. */
  children: React.ReactNode
}

const MOTIVO_DEFAULT = 'Sem permissão'

/**
 * Renderiza children normalmente quando `pode === true`.
 * Quando `pode === false`, aplica overlay/disabled conforme `modo`.
 */
export function BloqueioPermissaoOpaco({
  pode,
  motivo = MOTIVO_DEFAULT,
  modo = 'opaco-item',
  children,
}: BloqueioPermissaoOpacoProps) {
  if (pode) return <>{children}</>

  if (modo === 'bloqueio-tela') {
    return (
      <div
        role="note"
        aria-label={motivo}
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.875rem',
          padding: '4rem 2rem',
          textAlign: 'center',
          color: 'var(--ws-muted)',
        }}
      >
        <ShieldSlash size={48} weight="duotone" color="#94a3b8" />
        <div>
          <p style={{ fontSize: '1rem', fontWeight: 700, color: '#cbd5e1', margin: 0 }}>
            {motivo}
          </p>
          <p style={{ fontSize: '0.8125rem', color: '#94a3b8', margin: '0.25rem 0 0' }}>
            Solicite acesso ao seu administrador para visualizar esta seção.
          </p>
        </div>
      </div>
    )
  }

  if (modo === 'opaco-botao') {
    return (
      <span
        role="note"
        aria-disabled="true"
        title={motivo}
        style={{
          opacity: 0.45,
          pointerEvents: 'none',
          cursor: 'not-allowed',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.375rem',
          position: 'relative',
        }}
      >
        {children}
        <span
          style={{
            fontSize: '0.6rem',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
            padding: '0.1rem 0.35rem',
            borderRadius: '4px',
            background: 'rgba(248,113,113,0.12)',
            color: '#fca5a5',
            border: '1px solid rgba(248,113,113,0.25)',
            whiteSpace: 'nowrap',
          }}
        >
          🔒 {motivo}
        </span>
      </span>
    )
  }

  // 'opaco-item' (default)
  return (
    <span
      role="note"
      aria-disabled="true"
      title={motivo}
      style={{
        opacity: 0.45,
        pointerEvents: 'none',
        cursor: 'not-allowed',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.5rem',
        position: 'relative',
        width: '100%',
      }}
    >
      {children}
      <span
        style={{
          fontSize: '0.6rem',
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '0.04em',
          padding: '0.08rem 0.32rem',
          borderRadius: '4px',
          background: 'rgba(248,113,113,0.12)',
          color: '#fca5a5',
          border: '1px solid rgba(248,113,113,0.25)',
          whiteSpace: 'nowrap',
          marginLeft: 'auto',
        }}
      >
        🔒
      </span>
    </span>
  )
}
