/**
 * BarraFerramentasDashboardProcesso — toolbar do Dashboard (stub até widgets).
 */
import React from 'react'
import { useTranslation } from 'react-i18next'
import { CalendarBlank, Funnel, Plus } from '@phosphor-icons/react'
import '@nucleo/tabela-virtual-global/tabela-virtual.css'
import './BarraFerramentasDashboardProcesso.css'
import { DashboardToolbarBotaoIcon } from './DashboardToolbarBotaoIcon'
import { DASHBOARD_TOOLBAR_ICONE } from './dashboard-toolbar-icones'

export function BarraFerramentasDashboardProcesso() {
  const { t } = useTranslation()
  const ic = DASHBOARD_TOOLBAR_ICONE
  const emBreve = t('processo.dashboard.em_breve', { defaultValue: 'Em breve' })

  return (
    <div className="processo-dashboard-menu" data-testid="dashboard-barra-menu">
      <div className="gtv-container processo-dashboard-toolbar-card">
        <div className="gtv-toolbar processo-dashboard-toolbar">
          <div className="gtv-toolbar-esquerda processo-dashboard-toolbar__esquerda">
            <div className="processo-dashboard-menu__onboarding-hint">
              <span className="processo-dashboard-menu__onboarding-titulo">
                {t('processo.dashboard.stub_titulo', { defaultValue: 'Dashboard em desenvolvimento' })}
              </span>
              <span className="processo-dashboard-menu__onboarding-texto">
                {t('processo.dashboard.stub_texto', {
                  defaultValue: 'Painéis já podem ser criados; widgets e filtros chegam em breve.',
                })}
              </span>
            </div>
            <span className="processo-dashboard-menu__divisor" aria-hidden="true" />
            <div className="processo-dashboard-toolbar__icones" data-testid="dashboard-toolbar-icones">
              <DashboardToolbarBotaoIcon
                titulo={t('nucleo.dashboard.barra.periodo', { defaultValue: 'Período' })}
                descricao={emBreve}
                icone={<CalendarBlank {...ic} />}
                ariaLabel={t('nucleo.dashboard.barra.periodo', { defaultValue: 'Período' })}
                data-testid="btn-periodo-dashboard"
                disabled
              />
              <DashboardToolbarBotaoIcon
                titulo={t('nucleo.dashboard.barra.filtros', { defaultValue: 'Filtros' })}
                descricao={emBreve}
                icone={<Funnel {...ic} />}
                ariaLabel={t('nucleo.dashboard.barra.filtros', { defaultValue: 'Filtros' })}
                data-testid="btn-filtros-dashboard"
                disabled
              />
              <DashboardToolbarBotaoIcon
                titulo={t('processo.dashboard.adicionar_widget', { defaultValue: 'Adicionar widget' })}
                descricao={emBreve}
                icone={<Plus {...ic} />}
                ariaLabel={t('processo.dashboard.adicionar_widget', { defaultValue: 'Adicionar widget' })}
                data-testid="btn-adicionar-widget-dashboard"
                disabled
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
