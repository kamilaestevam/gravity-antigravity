import React from 'react'
import { useTranslation } from 'react-i18next'

export default function WhatsApp() {
  const { t } = useTranslation()
  return (
    <div className="flex flex-col h-full bg-[var(--color-bg-subtle)] text-[var(--color-text-primary)]">
      <header className="px-6 py-4 border-b border-[var(--color-border)] flex justify-between items-center bg-[var(--color-surface)]">
        <div>
          <h1 className="text-xl font-semibold">{t('whatsapp.titulo')}</h1>
          <p className="text-sm text-[var(--color-text-secondary)]">{t('whatsapp.subtitulo')}</p>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div className="w-80 border-r border-[var(--color-border)] flex flex-col bg-[var(--color-surface)]">
          <div className="p-4 border-b border-[var(--color-border)]">
            <input
              type="text"
              placeholder={t('whatsapp.buscar_conversas')}
              className="w-full px-3 py-2 bg-[var(--color-input-bg)] border border-[var(--color-input-border)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--color-focus)]"
            />
          </div>
          <div className="flex-1 overflow-y-auto p-4 flex items-center justify-center text-sm text-[var(--color-text-muted)]">
            {t('whatsapp.nenhuma_conversa')}
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col bg-[var(--color-bg-base)] items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 bg-[var(--color-surface-hover)] rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-[var(--color-text-secondary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <h2 className="text-lg font-medium text-[var(--color-text-primary)] mb-2">{t('whatsapp.caixa_vazia')}</h2>
            <p className="text-[var(--color-text-secondary)] max-w-sm">
              {t('whatsapp.caixa_vazia_desc')}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
