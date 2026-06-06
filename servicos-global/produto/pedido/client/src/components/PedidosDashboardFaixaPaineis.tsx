/**
 * PedidosDashboardFaixaPaineis — camada PAINÉIS do Dashboard (paridade Lista/BID Frete).
 */
import React from 'react'
import { useTranslation } from 'react-i18next'
import '../pages/Pedidos.css'
import { paineisDashboardApi, type DashboardPainel } from '../shared/api'
import { PedidosListaPainelBar } from './PedidosListaPainelBar'

export interface PedidosDashboardFaixaPaineisProps {
  paineis: DashboardPainel[]
  painelAtualId: string | null
  setPaineis: (paineis: DashboardPainel[]) => void
  setPainelAtualId: (id: string) => void
  onTrocarPainel: (id: string) => void
  onCriarPainel: (nome: string) => Promise<boolean>
  carregando?: boolean
}

export function PedidosDashboardFaixaPaineis({
  paineis,
  painelAtualId,
  setPaineis,
  setPainelAtualId,
  onTrocarPainel,
  onCriarPainel,
  carregando,
}: PedidosDashboardFaixaPaineisProps) {
  const { t } = useTranslation()

  return (
    <nav
      className="lp-faixa-navegacao"
      aria-label={t('pedido.dashboard.faixa_paineis', { defaultValue: 'Painéis do dashboard' })}
      data-testid="dashboard-faixa-paineis"
    >
      <section
        className="lp-faixa-navegacao__paineis"
        aria-label={t('pedido.dashboard.paineis_secao', { defaultValue: 'Painéis do dashboard' })}
      >
        <PedidosListaPainelBar
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
