/**
 * ProcessoInsights — visão Insights dos processos do workspace (stub).
 */

import React from 'react'
import { ChartPieSlice } from '@phosphor-icons/react'
import { PaginaGlobal } from '@nucleo/pagina-global'

export default function ProcessoInsights() {
  return (
    <PaginaGlobal className="ws-fade-up processo-insights-page processo-lista-page" layout="lista">
      <div className="proc-empty-state ws-fade-up ws-fade-up-d1">
        <ChartPieSlice weight="duotone" size={48} color="var(--text-muted)" />
        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
          Insights em desenvolvimento
        </p>
      </div>
    </PaginaGlobal>
  )
}
