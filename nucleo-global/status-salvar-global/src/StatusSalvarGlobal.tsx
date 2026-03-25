import React, { useEffect, useState } from 'react'
import {
  CheckCircle,
  Clock,
  CircleNotch,
  WarningCircle,
  CloudCheck,
} from '@phosphor-icons/react'
import './status-salvar.css'

export type StatusSalvar = 'idle' | 'dirty' | 'saving' | 'success' | 'error'

export interface StatusSalvarGlobalProps {
  /**
   * O estado atual de salvamento.
   */
  status: StatusSalvar
  /**
   * Texto opcional exibido quando o status for "idle" / sem alterações.
   * Padrao: "Salvo"
   */
  textIdle?: string
  /**
   * Texto opcional exibido quando o status for "dirty".
   * Padrao: "Alterações não salvas"
   */
  textDirty?: string
  /**
   * Texto opcional exibido quando o status for "saving".
   * Padrao: "Salvando..."
   */
  textSaving?: string
  /**
   * Texto opcional exibido quando o status for "success".
   * Padrao: "Salvo na nuvem"
   */
  textSuccess?: string
  /**
   * Texto opcional exibido quando o status for "error".
   * Padrao: "Erro ao salvar"
   */
  textError?: string
  /**
   * Tempo (em ms) que o status 'success' ou 'error' permanece antes de voltar para 'idle'
   * (se o componente superior não controlar a volta automaticamente).
   * Padrão: 3000ms. Passe 0 para desabilitar o auto-reset interno.
   */
  autoResetMs?: number
  /**
   * Callback invocado quando o auto-reset for acionado.
   */
  onAutoReset?: () => void
  /**
   * Se true, o componente não será renderizado (ficará oculto) quando o status for "idle".
   * Útil para manter a interface mais limpa.
   */
  hideOnIdle?: boolean
}

const ICON_MAP = {
  idle: <CloudCheck size={14} weight="duotone" />,
  dirty: <Clock size={14} weight="duotone" />,
  saving: <CircleNotch size={14} weight="bold" />,
  success: <CheckCircle size={14} weight="fill" />,
  error: <WarningCircle size={14} weight="fill" />,
}

export function StatusSalvarGlobal({
  status: propStatus,
  textIdle = 'Salvo',
  textDirty = 'Alterações pendentes',
  textSaving = 'Salvando...',
  textSuccess = 'Salvo com sucesso',
  textError = 'Erro ao salvar',
  autoResetMs = 3000,
  onAutoReset,
  className = '',
  hideOnIdle = true,
}: StatusSalvarGlobalProps) {
  const [internalStatus, setInternalStatus] = useState<StatusSalvar>(propStatus)

  // Sincroniza estado interno com a propriedade externa
  useEffect(() => {
    setInternalStatus(propStatus)
  }, [propStatus])

  // Lógica de auto-reset quando o status mudar para success ou error
  useEffect(() => {
    if (autoResetMs > 0 && (internalStatus === 'success' || internalStatus === 'error')) {
      const timer = setTimeout(() => {
        setInternalStatus('idle')
        onAutoReset?.()
      }, autoResetMs)
      return () => clearTimeout(timer)
    }
  }, [internalStatus, autoResetMs, onAutoReset])

  const getText = () => {
    switch (internalStatus) {
      case 'idle': return textIdle
      case 'dirty': return textDirty
      case 'saving': return textSaving
      case 'success': return textSuccess
      case 'error': return textError
      default: return ''
    }
  }

  if (hideOnIdle && internalStatus === 'idle') {
    return null
  }

  return (
    <div
      className={`status-salvar-global status-salvar-global--${internalStatus} ${className}`}
      aria-live="polite"
      role="status"
    >
      {ICON_MAP[internalStatus]}
      <span>{getText()}</span>
    </div>
  )
}
