import React from 'react'
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
  const { notifications, removeNotification } = useShellStore()

  if (notifications.length === 0) return null

  return (
    <div
      className="shell-toast-container"
      role="region"
      aria-label="Notificações"
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
            aria-label="Fechar notificação"
            type="button"
          >
            <X size={14} weight="bold" />
          </button>
        </div>
      ))}
    </div>
  )
}
