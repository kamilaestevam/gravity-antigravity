/**
 * CoreDashboard.tsx — Tela inicial do Core (Dashboard do Meu Espaço)
 *
 * Placeholder que será expandido com widgets, KPIs e resumos.
 */

import React from 'react'
import { useTranslation } from 'react-i18next'
import { House } from '@phosphor-icons/react'
import { PaginaGlobal } from '@nucleo/pagina-global'
import { CabecalhoGlobal } from '@nucleo/cabecalho-global'

export default function CoreDashboard() {
  const { t } = useTranslation()
  const companyName = sessionStorage.getItem('gravity_company_name') || 'Workspace'

  return (
    <PaginaGlobal
      className="ws-fade-up"
      layout="lista"
      cabecalho={
        <CabecalhoGlobal
          icone={<House weight="duotone" size={22} />}
          titulo={t('shell.menu.dashboard')}
          subtitulo={`${t('workspace.dashboard.visao_geral')} ${companyName}`}
        />
      }
    >
      <div
        className="ws-fade-up ws-fade-up-d1"
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '1rem',
          padding: '6rem 2rem',
          color: 'var(--ws-muted, #64748b)',
        }}
      >
        <House weight="duotone" size={56} style={{ opacity: 0.3 }} />
        <p style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--ws-text, #e2e8f0)' }}>
          {t('workspace.dashboard.bem_vindo', { nome: companyName })}
        </p>
        <p style={{ fontSize: '0.875rem', maxWidth: '400px', textAlign: 'center' }}>
          {t('workspace.dashboard.instrucao_menu')}
        </p>
      </div>
    </PaginaGlobal>
  )
}
