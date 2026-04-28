/**
 * NcmSelectGlobal.tsx — Campo de seleção de NCM
 *
 * Comportamento:
 *  - Input de texto para código NCM (8 dígitos)
 *  - Botão de lupa abre ModalBuscaNcm para busca por código ou descrição
 *  - Validação não bloqueante via useNcmValidation (debounce 600ms)
 *  - Exibe badge de status: válido (verde) / inválido (amarelo) / sem sync (cinza)
 *  - Nunca impede o salvamento — é apenas aviso informativo
 *
 * Props:
 *  - value / onChange: código NCM (string de 8 dígitos)
 *  - label / obrigatorio / disabled: padrão CampoGeralGlobal
 *  - baseUrl: URL base do serviço NCM (padrão: /api/v1/ncm)
 */

import React, { useState, useId } from 'react'
import { MagnifyingGlass, CheckCircle, Warning, ArrowsClockwise } from '@phosphor-icons/react'
import { CampoGeralGlobal } from '@nucleo/campo-geral-global'
import { ModalBuscaNcm, type NcmOpcao } from './ModalBuscaNcm.js'
import { useNcmValidation } from './useNcmValidation.js'

export interface NcmSelectGlobalProps {
  value:        string
  onChange:     (codigo: string, descricao?: string) => void
  label?:       string
  obrigatorio?: boolean
  disabled?:    boolean
  hint?:        string
  /** URL base do serviço NCM — padrão: /api/v1/ncm */
  baseUrl?:     string
  /** Classe CSS extra no wrapper */
  className?:   string
}

export function NcmSelectGlobal({
  value,
  onChange,
  label       = 'NCM',
  obrigatorio = false,
  disabled    = false,
  hint,
  baseUrl     = '/api/v1/ncm',
  className,
}: NcmSelectGlobalProps) {
  const id                       = useId()
  const [modalAberto, setModalAberto] = useState(false)
  const { status, resultado, validar, limpar } = useNcmValidation({ baseUrl })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value.replace(/\D/g, '').slice(0, 8)
    onChange(v)
    if (v.length === 8) {
      validar(v)
    } else {
      limpar()
    }
  }

  const handleSelecionarModal = (opcao: NcmOpcao) => {
    onChange(opcao.codigo, opcao.descricao)
    validar(opcao.codigo)
  }

  // ── Status badge ────────────────────────────────────────────────────────────

  const badgeElement = (() => {
    if (status === 'validando') return (
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.75rem', color: '#94a3b8' }}>
        <ArrowsClockwise size={12} style={{ animation: 'spin 1s linear infinite' }} /> Verificando…
      </span>
    )
    if (status === 'valido') return (
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.75rem', color: '#34d399' }}>
        <CheckCircle size={12} weight="fill" />
        {resultado?.descricao ? resultado.descricao.slice(0, 60) : 'NCM válido'}
      </span>
    )
    if (status === 'invalido') return (
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.75rem', color: '#fbbf24' }}>
        <Warning size={12} weight="fill" /> NCM não encontrado na tabela Siscomex
      </span>
    )
    if (status === 'sem_sync') return (
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.75rem', color: '#94a3b8' }}>
        <Warning size={12} weight="duotone" /> Tabela NCM não sincronizada
      </span>
    )
    return null
  })()

  const inputBorderColor = status === 'valido'   ? 'rgba(52,211,153,0.35)'
    : status === 'invalido' ? 'rgba(251,191,36,0.35)'
    : undefined

  return (
    <div className={className}>
      <CampoGeralGlobal
        label={label}
        htmlFor={id}
        obrigatorio={obrigatorio}
        hint={hint}
        erro={undefined}
      >
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <input
            id={id}
            type="text"
            inputMode="numeric"
            value={value}
            onChange={handleChange}
            disabled={disabled}
            maxLength={8}
            placeholder="00000000"
            aria-label={label}
            aria-describedby={badgeElement ? `${id}-status` : undefined}
            style={{
              flex: 1,
              padding: '0.5rem 0.75rem',
              background: 'var(--ws-input-bg, rgba(15,23,42,0.8))',
              border: `1px solid ${inputBorderColor ?? 'var(--ws-border, rgba(148,163,184,0.15))'}`,
              borderRadius: '0.375rem',
              color: 'var(--ws-text, #f1f5f9)',
              fontSize: '0.875rem',
              fontFamily: 'monospace',
              letterSpacing: '0.05em',
              outline: 'none',
              transition: 'border-color 0.15s',
            }}
          />
          <button
            type="button"
            onClick={() => setModalAberto(true)}
            disabled={disabled}
            aria-label="Buscar NCM"
            title="Buscar NCM por código ou descrição"
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              width: '2.25rem', height: '2.25rem', flexShrink: 0,
              background: 'var(--ws-input-bg, rgba(15,23,42,0.8))',
              border: '1px solid var(--ws-border, rgba(148,163,184,0.15))',
              borderRadius: '0.375rem',
              color: disabled ? 'var(--ws-muted, #64748b)' : '#6366f1',
              cursor: disabled ? 'not-allowed' : 'pointer',
              transition: 'all 0.15s',
            }}
            onMouseEnter={(e) => { if (!disabled) { e.currentTarget.style.background = 'rgba(99,102,241,0.12)'; e.currentTarget.style.borderColor = 'rgba(99,102,241,0.3)' } }}
            onMouseLeave={(e) => { if (!disabled) { e.currentTarget.style.background = 'var(--ws-input-bg, rgba(15,23,42,0.8))'; e.currentTarget.style.borderColor = 'var(--ws-border, rgba(148,163,184,0.15))' } }}
          >
            <MagnifyingGlass size={16} weight="bold" />
          </button>
        </div>

        {/* Status de validação (não bloqueante) */}
        {badgeElement && (
          <div id={`${id}-status`} style={{ marginTop: '0.375rem' }} aria-live="polite">
            {badgeElement}
          </div>
        )}
      </CampoGeralGlobal>

      <ModalBuscaNcm
        aberto={modalAberto}
        onFechar={() => setModalAberto(false)}
        onSelecionar={handleSelecionarModal}
        valorAtual={value}
        baseUrl={baseUrl}
      />
    </div>
  )
}
