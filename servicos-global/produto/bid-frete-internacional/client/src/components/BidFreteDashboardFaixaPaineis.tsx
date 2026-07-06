/**
 * BidFreteDashboardFaixaPaineis — camada PAINÉIS do Dashboard (paridade Lista/Pedido).
 */
import React from 'react'
import { useTranslation } from 'react-i18next'
import { paineisDashboardApi, type DashboardPainel } from '../shared/api'
import { BidFreteListaPainelBar } from './BidFreteListaPainelBar'

export interface BidFreteDashboardFaixaPaineisProps {
  paineis: DashboardPainel[]
  painelAtualId: string | null
  setPaineis: (paineis: DashboardPainel[]) => void
  setPainelAtualId: (id: string) => void
  onTrocarPainel: (id: string) => void
  onCriarPainel: (nome: string) => Promise<boolean>
  carregando?: boolean
}

export function BidFreteDashboardFaixaPaineis({
  paineis,
  painelAtualId,
  setPaineis,
  setPainelAtualId,
  onTrocarPainel,
  onCriarPainel,
  carregando,
}: BidFreteDashboardFaixaPaineisProps) {
  const { t } = useTranslation()

  return (
    <nav
      className="lp-faixa-navegacao"
      aria-label={t('bidfrete.dashboard.faixa_paineis', { defaultValue: 'Painéis do dashboard' })}
      data-testid="dashboard-faixa-paineis"
    >
      <section
        className="lp-faixa-navegacao__paineis"
        aria-label={t('bidfrete.dashboard.paineis_secao', { defaultValue: 'Painéis do dashboard' })}
      >
        <BidFreteListaPainelBar
          paineis={paineis}
          painelAtualId={painelAtualId}
          setPaineis={setPaineis}
          setPainelAtualId={setPainelAtualId}
          onTrocarPainel={onTrocarPainel}
          onCriarPainel={onCriarPainel}
          carregando={carregando}
          variant="unificado"
          contexto="dashboard"
          painelApi={paineisDashboardApi}
        />
      </section>
    </nav>
  )
}
