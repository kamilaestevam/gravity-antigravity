/**
 * ProcessoDashboard — painéis e widgets dos processos do workspace (stub).
 */

import React from 'react'
import { ChartBar } from '@phosphor-icons/react'
import { PaginaGlobal } from '@nucleo/pagina-global'

export default function ProcessoDashboard() {
  return (
    <PaginaGlobal className="ws-fade-up processo-dashboard-page processo-lista-page" layout="lista">
      <div className="proc-empty-state ws-fade-up ws-fade-up-d1">
        <ChartBar weight="duotone" size={48} color="var(--text-muted)" />
        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
          Dashboard em desenvolvimento
        </p>
      </div>
    </PaginaGlobal>
  )
}
