// src/Email.tsx
// Componente principal do serviço de Email.
// Exportado para integração no shell via lazy loading:
// const Email = lazy(() => import('@tenant/email/src/Email'))

import React from 'react'
import { useTranslation } from 'react-i18next'

export default function Email() {
  const { t } = useTranslation()
  return (
    <div data-service="email">
      <h2>{t('email_modulo.titulo')}</h2>
      <p>{t('email_modulo.descricao')}</p>
    </div>
  )
}
