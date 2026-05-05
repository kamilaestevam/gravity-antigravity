import React from 'react'
import { useTranslation } from 'react-i18next'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'

/**
 * ApiCockpitTabs — faixa unica de pills (.ws-tabs) compartilhada por
 * todas as 5 visoes do API Cockpit no workspace.
 *
 * Comportamento:
 *   - "Inventario" e "Logs" trocam ?aba= na rota /workspace/api-cockpit
 *   - "Tokens", "Webhooks", "Consumo" navegam para sub-rotas
 *   - A pill ativa e derivada do pathname + ?aba=
 *
 * Uso:
 *   <ApiCockpitTabs />
 *
 * Para detectar qual visao mostrar dentro de /workspace/api-cockpit, leia
 * useSearchParams().get('aba') — default 'inventario'.
 */
type AbaCockpit = 'inventario' | 'logs' | 'tokens' | 'webhooks' | 'consumo'

const ROTA_BASE = '/workspace/api-cockpit'

export function ApiCockpitTabs() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const [searchParams] = useSearchParams()

  const abaAtiva: AbaCockpit = (() => {
    if (pathname.endsWith('/tokens'))    return 'tokens'
    if (pathname.endsWith('/webhooks'))  return 'webhooks'
    if (pathname.endsWith('/consumo'))   return 'consumo'
    const param = searchParams.get('aba')
    return param === 'logs' ? 'logs' : 'inventario'
  })()

  const irPara = (aba: AbaCockpit) => {
    if (aba === 'inventario') navigate(ROTA_BASE)
    else if (aba === 'logs')  navigate(`${ROTA_BASE}?aba=logs`)
    else                       navigate(`${ROTA_BASE}/${aba}`)
  }

  const abas: { key: AbaCockpit; label: string }[] = [
    { key: 'inventario', label: t('workspace.cockpit.aba_inventario') },
    { key: 'logs',       label: t('workspace.cockpit.aba_logs') },
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
