/**
 * VisaoGeral.tsx — Placeholder (stub)
 */
import React from 'react'
import { useTranslation } from 'react-i18next'

export default function VisaoGeral() {
  const { t } = useTranslation()
  return (
    <div style={{ padding: '2rem', color: 'var(--text-muted, #64748b)' }}>
      {t('bidfrete.visao_geral.em_construcao')}
    </div>
  )
}
