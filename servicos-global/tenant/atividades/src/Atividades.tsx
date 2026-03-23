// src/Atividades.tsx
// Componente principal do serviço de Atividades para o shell.
// Carregado via lazy loading: import('@tenant/atividades/src/Atividades')

import React, { Suspense, lazy } from 'react'

const AtividadesView = lazy(() => import('./views/AtividadesView.js'))

export default function Atividades(): React.ReactElement {
  return (
    <Suspense fallback={<div className="loading">Carregando Atividades...</div>}>
      <AtividadesView />
    </Suspense>
  )
}
