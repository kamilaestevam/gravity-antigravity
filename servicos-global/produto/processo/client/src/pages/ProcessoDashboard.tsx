/**
 * ProcessoDashboard — shell L3 (faixa PAINÉIS + toolbar); widgets em desenvolvimento.
 */
import React from 'react'
import { ChartBar } from '@phosphor-icons/react'
import { PaginaGlobal } from '@nucleo/pagina-global'
import { ProcessoDashboardFaixaPaineis } from '../components/ProcessoDashboardFaixaPaineis'
import { BarraFerramentasDashboardProcesso } from '../components/dashboard/BarraFerramentasDashboardProcesso'
import { useDashboardPainelProcesso } from '../shared/useDashboardPainelProcesso'
import './ProcessoDashboard-l3.css'
import './ProcessoDashboard.css'

export default function ProcessoDashboard() {
  const {
    paineis,
    painelAtualId,
    carregando,
    setPaineis,
    setPainelAtualId,
    onTrocarPainel,
    onCriarPainel,
  } = useDashboardPainelProcesso()

  return (
    <PaginaGlobal
      className="ws-fade-up processo-dashboard-page processo-dashboard processo-lista-page"
      layout="lista"
    >
      <div className="lp-tabela-wrapper lp-tabela-wrapper--faixa-unificada processo-dashboard-toolbar-wrapper">
        <div className="lp-tabela-chrome processo-dashboard-chrome">
          <ProcessoDashboardFaixaPaineis
            paineis={paineis}
            painelAtualId={painelAtualId}
            setPaineis={setPaineis}
            setPainelAtualId={setPainelAtualId}
            onTrocarPainel={onTrocarPainel}
            onCriarPainel={onCriarPainel}
            carregando={carregando}
          />
          <BarraFerramentasDashboardProcesso />
        </div>
      </div>

      <div className="processo-dashboard-conteudo">
        <div className="proc-empty-state ws-fade-up ws-fade-up-d1">
          <ChartBar weight="duotone" size={48} color="var(--text-muted)" />
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            Dashboard em desenvolvimento
          </p>
        </div>
      </div>
    </PaginaGlobal>
  )
}
