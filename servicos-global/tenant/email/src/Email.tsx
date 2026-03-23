// src/Email.tsx
// Componente principal do serviço de Email.
// Exportado para integração no shell via lazy loading:
// const Email = lazy(() => import('@tenant/email/src/Email'))

import React from 'react'

export default function Email() {
  return (
    <div data-service="email">
      <h2>Email</h2>
      <p>Módulo de Email — integrado ao shell via lazy loading.</p>
    </div>
  )
}
