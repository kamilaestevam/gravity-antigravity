import React from 'react'
import { createPortal } from 'react-dom'
import { useTranslation } from 'react-i18next'
import {
  CheckCircle,
  XCircle,
  Warning,
  Info,
  X,
} from '@phosphor-icons/react'
import { useShellStore } from './store'
import type { NotificationType } from './store'

const ICON_MAP: Record<NotificationType, React.ReactNode> = {
  success: <CheckCircle weight="fill" size={18} />,
  error:   <XCircle    weight="fill" size={18} />,
  warning: <Warning    weight="fill" size={18} />,
  info:    <Info       weight="fill" size={18} />,
}

/**
 * ToastContainer — renderiza as notificações do ShellState.
 *
 * REGRA: nunca criar elementos de toast manualmente fora deste componente.
 * Todo toast entra via useShellStore().addNotification().
 */
export function ToastContainer() {
  const { t } = useTranslation()
  const { notifications, removeNotification } = useShellStore()

  if (notifications.length === 0) return null

  return createPortal(
    <div
      className="shell-toast-container"
      role="region"
      aria-label={t('shell.notificacoes')}
      aria-live="polite"
      aria-atomic="false"
    >
      {notifications.map((notif) => (
        <div
          key={notif.id}
          className={`shell-toast shell-toast--${notif.type}`}
          role="alert"
          aria-label={notif.message}
        >
          <span
            className={`shell-toast__icon shell-toast__icon--${notif.type}`}
            aria-hidden="true"
          >
            {ICON_MAP[notif.type]}
          </span>

          <p className="shell-toast__message">{notif.message}</p>

          <button
            className="shell-toast__close"
            onClick={() => removeNotification(notif.id)}
            aria-label={t('shell.fechar_notificacao')}
            type="button"
          >
            <X size={14} weight="bold" />
          </button>
        </div>
      ))}
    </div>,
    document.body,
  )
}
