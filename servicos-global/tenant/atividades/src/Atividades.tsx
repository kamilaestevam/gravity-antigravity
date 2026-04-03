// src/Atividades.tsx
// Componente principal do serviço de Atividades para o shell.
// Carregado via lazy loading: import('@tenant/atividades/src/Atividades')

import React, { Suspense, lazy } from 'react'
import { useTranslation } from 'react-i18next'

const AtividadesView = lazy(() => import('./views/AtividadesView'))

export default function Atividades(): React.ReactElement {
  const { t } = useTranslation()
  return (
    <Suspense fallback={<div className="loading">{t('atividades.carregando')}</div>}>
      <AtividadesView />
    </Suspense>
  )
}
