import React, { useEffect, useCallback, useState } from 'react'
import { CheckCircle, Warning, XCircle, X } from '@phosphor-icons/react'
import './ToastDemo.css'

// ── Tipos ──────────────────────────────────────────────────────────────────────

export type ToastTipo = 'sucesso' | 'aviso' | 'erro'

export interface Toast {
  id:        string
  tipo:      ToastTipo
  mensagem:  string
  descricao?: string
}

// ── Hook ──────────────────────────────────────────────────────────────────────

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([])

  const adicionar = useCallback((tipo: ToastTipo, mensagem: string, descricao?: string) => {
    const id = Math.random().toString(36).slice(2)
    setToasts(prev => [...prev, { id, tipo, mensagem, descricao }])
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4500)
  }, [])

  const remover = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  return { toasts, adicionar, remover }
}

// ── Componente ────────────────────────────────────────────────────────────────

const ICONE: Record<ToastTipo, React.ReactNode> = {
  sucesso: <CheckCircle size={18} weight="fill" />,
  aviso:   <Warning     size={18} weight="fill" />,
  erro:    <XCircle     size={18} weight="fill" />,
}

interface ToastDemoProps {
  toasts:   Toast[]
  onRemover: (id: string) => void
}

export function ToastDemo({ toasts, onRemover }: ToastDemoProps) {
  if (toasts.length === 0) return null

  return (
    <div className="tdemo-container" aria-live="polite">
      {toasts.map(t => (
        <div key={t.id} className={`tdemo-toast tdemo-toast--${t.tipo}`}>
          <span className="tdemo-icone">{ICONE[t.tipo]}</span>
          <div className="tdemo-texto">
            <span className="tdemo-mensagem">{t.mensagem}</span>
            {t.descricao && <span className="tdemo-descricao">{t.descricao}</span>}
          </div>
          <button className="tdemo-fechar" onClick={() => onRemover(t.id)} aria-label="Fechar">
            <X size={13} />
          </button>
        </div>
      ))}
    </div>
  )
}
