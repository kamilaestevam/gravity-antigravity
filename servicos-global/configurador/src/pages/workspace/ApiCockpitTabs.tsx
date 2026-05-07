import React from 'react'
import { useTranslation } from 'react-i18next'
import { useLocation, useNavigate } from 'react-router-dom'

/**
 * ApiCockpitTabs — faixa unica de pills (.ws-tabs) compartilhada por
 * todas as 4 visoes do API Cockpit no workspace.
 *
 * Comportamento:
 *   - "Servidores" volta para /workspace/api-cockpit
 *   - "Tokens", "Webhooks", "Consumo" navegam para sub-rotas
 *   - A pill ativa e derivada do pathname
 *
 * A aba "Logs" foi unificada com "Consumo" (2026-05-07).
 */
type AbaCockpit = 'servidores' | 'tokens' | 'webhooks' | 'consumo'

const ROTA_BASE = '/workspace/api-cockpit'

export function ApiCockpitTabs() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { pathname } = useLocation()

  const abaAtiva: AbaCockpit = (() => {
    if (pathname.endsWith('/tokens'))    return 'tokens'
    if (pathname.endsWith('/webhooks'))  return 'webhooks'
    if (pathname.endsWith('/consumo'))   return 'consumo'
    return 'servidores'
  })()

  const irPara = (aba: AbaCockpit) => {
    if (aba === 'servidores') navigate(ROTA_BASE)
    else                       navigate(`${ROTA_BASE}/${aba}`)
  }

  const abas: { key: AbaCockpit; label: string }[] = [
    { key: 'servidores', label: t('workspace.cockpit.aba_servidores') },
    { key: 'tokens',     label: t('workspace.cockpit.aba_tokens') },
    { key: 'webhooks',   label: t('workspace.cockpit.aba_webhooks') },
    { key: 'consumo',    label: t('workspace.cockpit.aba_consumo') },
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

export default ApiCockpitTabs
