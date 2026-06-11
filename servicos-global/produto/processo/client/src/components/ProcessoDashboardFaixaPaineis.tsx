/**
 * ProcessoDashboardFaixaPaineis — camada PAINÉIS do Dashboard Processo.
 */
import React from 'react'
import { useTranslation } from 'react-i18next'
import type { ProcessoDashboardPainel } from '../shared/processoDashboardPainelLocal'
import { ProcessoDashboardPainelBar } from './ProcessoDashboardPainelBar'
import '../pages/ProcessoDashboard-l3.css'

export interface ProcessoDashboardFaixaPaineisProps {
  paineis: ProcessoDashboardPainel[]
  painelAtualId: string | null
  setPaineis: (paineis: ProcessoDashboardPainel[]) => void
  setPainelAtualId: (id: string) => void
  onTrocarPainel: (id: string) => void
  onCriarPainel: (nome: string) => Promise<boolean>
  carregando?: boolean
}

export function ProcessoDashboardFaixaPaineis({
  paineis,
  painelAtualId,
  setPaineis,
  setPainelAtualId,
  onTrocarPainel,
  onCriarPainel,
  carregando,
}: ProcessoDashboardFaixaPaineisProps) {
  const { t } = useTranslation()

  return (
    <nav
      className="lp-faixa-navegacao"
      aria-label={t('processo.dashboard.faixa_paineis', { defaultValue: 'Painéis do dashboard' })}
      data-testid="dashboard-faixa-paineis"
    >
      <section
        className="lp-faixa-navegacao__paineis"
        aria-label={t('processo.dashboard.paineis_secao', { defaultValue: 'Painéis do dashboard' })}
      >
        <ProcessoDashboardPainelBar
          paineis={paineis}
          painelAtualId={painelAtualId}
          setPaineis={setPaineis}
          setPainelAtualId={setPainelAtualId}
          onTrocarPainel={onTrocarPainel}
          onCriarPainel={onCriarPainel}
          carregando={carregando}
          variant="unificado"
        />
      </section>
    </nav>
  )
}
