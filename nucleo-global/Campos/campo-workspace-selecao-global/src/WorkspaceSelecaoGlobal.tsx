import React from 'react'
import { Buildings, CheckCircle } from '@phosphor-icons/react'

export interface Empresa {
  id: string
  nome: string
  cnpj: string
  plano: string
  cor: string
  iniciais?: string
}

export interface WorkspaceSelecaoGlobalProps {
  empresa: Empresa
  selecionando?: boolean
  onClick?: () => void
  disabled?: boolean
  planoBadgeColor?: Record<string, string>
}

const defaultPlanoBadgeColor: Record<string, string> = {
  Enterprise: '#818cf8',
  Profissional: '#818cf8',
  Básico: '#94a3b8',
}

export function WorkspaceSelecaoGlobal({
  empresa,
  selecionando = false,
  onClick,
  disabled = false,
  planoBadgeColor = defaultPlanoBadgeColor
}: WorkspaceSelecaoGlobalProps) {
  return (
    <button
      id={`sw-empresa-${empresa.id}`}
      type="button"
      onClick={onClick}
      disabled={disabled}
      style={{
        display: 'flex', alignItems: 'center', gap: '0.875rem',
        padding: '0.875rem 1rem',
        background: selecionando
          ? 'rgba(129,140,248,0.1)'
          : 'rgba(255,255,255,0.03)',
        border: `1px solid ${selecionando
          ? 'rgba(129,140,248,0.35)'
          : 'rgba(255,255,255,0.07)'}`,
        borderRadius: '12px',
        cursor: disabled ? 'default' : 'pointer',
        textAlign: 'left', width: '100%',
        fontFamily: 'var(--font)',
        transition: 'all 0.15s',
      }}
      onMouseEnter={e => {
        if (!selecionando && !disabled) {
          e.currentTarget.style.background = 'rgba(129,140,248,0.07)'
          e.currentTarget.style.borderColor = 'rgba(129,140,248,0.25)'
        }
      }}
      onMouseLeave={e => {
        if (!selecionando) {
          e.currentTarget.style.background = 'rgba(255,255,255,0.03)'
          e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)'
        }
      }}
    >
      {/* Avatar */}
      <div style={{
        width: 40, height: 40, minWidth: 40,
        borderRadius: '10px',
        background: `${empresa.cor}18`,
        border: `1px solid ${empresa.cor}30`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <Buildings weight="duotone" size={18} color={empresa.cor} />
      </div>

      {/* Info */}
      <div style={{
        flex: 1, minWidth: 0,
        display: 'flex', alignItems: 'center', gap: '0.625rem'
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
          <p style={{
            fontWeight: 600, fontSize: '0.9375rem',
            color: '#f1f5f9', margin: '0 0 0.175rem',
            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
          }}>
            {empresa.nome}
          </p>
          <p style={{ fontSize: '0.78rem', color: '#64748b', margin: 0 }}>
            {empresa.cnpj}
          </p>
        </div>
        <span style={{
          padding: '0.1rem 0.45rem',
          borderRadius: '9999px',
          fontSize: '0.7rem', fontWeight: 700,
          background: `${planoBadgeColor[empresa.plano] ?? '#94a3b8'}15`,
          color: planoBadgeColor[empresa.plano] ?? '#94a3b8',
          border: `1px solid ${planoBadgeColor[empresa.plano] ?? '#94a3b8'}25`,
          flexShrink: 0,
        }}>
          {empresa.plano}
        </span>
      </div>

      {/* Check ao selecionar */}
      {selecionando && (
        <CheckCircle weight="fill" size={20} color="#818cf8" />
      )}
    </button>
  )
}
