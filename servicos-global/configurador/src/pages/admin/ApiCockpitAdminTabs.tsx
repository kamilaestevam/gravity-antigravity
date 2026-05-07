import React from 'react'
import { useTranslation } from 'react-i18next'
import { useLocation, useNavigate } from 'react-router-dom'

/**
 * ApiCockpitAdminTabs — faixa de pills (.ws-tabs) compartilhada pelas 5
 * visoes do API Cockpit no painel admin (Gravity HQ).
 *
 * Comportamento:
 *   - Cada aba aponta para uma sub-rota dedicada de /admin/api-cockpit
 *   - A pill ativa e derivada do pathname
 *
 * Tokens, Webhooks e Consumo usam drill-down por organizacao
 * (ver SeletorOrganizacaoAdmin) — admin escolhe a organizacao no topo
 * da aba e ve os dados isolados daquela org. Reusa endpoints existentes.
 */
type AbaCockpitAdmin = 'servidores' | 'tokens' | 'webhooks' | 'consumo' | 'monitor-llm'

const ROTA_BASE = '/admin/api-cockpit'

export function ApiCockpitAdminTabs() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { pathname } = useLocation()

  const abaAtiva: AbaCockpitAdmin = (() => {
    if (pathname.endsWith('/tokens'))      return 'tokens'
    if (pathname.endsWith('/webhooks'))    return 'webhooks'
    if (pathname.endsWith('/consumo'))     return 'consumo'
    if (pathname.endsWith('/monitor-llm')) return 'monitor-llm'
    return 'servidores'
  })()

  const irPara = (aba: AbaCockpitAdmin) => {
    if (aba === 'servidores') navigate(ROTA_BASE)
    else                       navigate(`${ROTA_BASE}/${aba}`)
  }

  const abas: { key: AbaCockpitAdmin; label: string }[] = [
    { key: 'servidores',  label: t('admin.api-cockpit.aba_servidores') },
    { key: 'tokens',      label: t('admin.api-cockpit.aba_tokens') },
    { key: 'webhooks',    label: t('admin.api-cockpit.aba_webhooks') },
    { key: 'consumo',     label: t('admin.api-cockpit.aba_consumo') },
    { key: 'monitor-llm', label: t('admin.api-cockpit.aba_monitor_llm') },
  ]

  return (
    <div className="ws-tabs" style={{ margin: 0 }} role="tablist">
      {abas.map(({ key, label }) => (
        <button
          key={key}
          role="tab"
          aria-selected={abaAtiva === key}
          className={`ws-tab${abaAtiva === key ? ' active' : ''}`}
          onClick={() => irPara(key)}
        >
          {label}
        </button>
      ))}
    </div>
  )
}

export default ApiCockpitAdminTabs
