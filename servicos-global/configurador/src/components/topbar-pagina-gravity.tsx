/**
 * TopbarPaginaGravity — barra superior SSOT do Configurador (HUB, Store, …).
 *
 * Esquerda: logo Gravity + nome da tela (Hub, Store, …).
 * Direita: atalho opcional, busca, mensageria, tooltips, localizador, idioma, config, usuário.
 * Mesma ordem e mesma âncora em todas as páginas que usam este componente.
 */

import React from 'react'
import { useTranslation } from 'react-i18next'
import { Gear, Hexagon, Info, MagnifyingGlass } from '@phosphor-icons/react'
import { SeletorIdiomaGlobal } from '@nucleo/language-switcher-global'
import { UsuarioGlobal, type UsuarioGlobalProps } from '@nucleo/usuario-global'
import {
  LocalizadorGlobal,
  type EcosystemNode,
  type LocalizadorEntry,
} from '@nucleo/localizador-global'
import { useShellStore } from '@gravity/shell'
import { Notificacoes } from '../../../servicos-plataforma/notificacoes/src/Notificacoes'
import './topbar-pagina-gravity.css'
import '../pages/hub.css'

export interface AtalhoTopbarPaginaGravity {
  label: string
  title?: string
  icon: React.ReactNode
  onClick: () => void
}

export interface TopbarPaginaGravityProps {
  rotuloTela: string
  atalho?: AtalhoTopbarPaginaGravity
  onBuscar: () => void
  workspaceName: string
  localizador: {
    currentProductId: string
    currentProductLabel: string
    currentProductColor: string
    currentPageLabel: string
    history: LocalizadorEntry[]
    nodes: EcosystemNode[]
    onNavigate: (node: EcosystemNode) => void
  }
  onAbrirConfigurador: () => void
  usuario: Pick<
    UsuarioGlobalProps,
    | 'userName'
    | 'userEmail'
    | 'userInitials'
    | 'userRole'
    | 'onNavigateWorkspace'
    | 'onNavigateMarketPlace'
    | 'onSignOut'
    | 'isAdmin'
    | 'onNavigateAdmin'
    | 'temAcessoTrocarOrganizacao'
    | 'organizacaoOverrideAtiva'
    | 'aoTrocarOrganizacao'
    | 'aoVoltarParaGravity'
  >
}

export function TopbarPaginaGravity({
  rotuloTela,
  atalho,
  onBuscar,
  workspaceName,
  localizador,
  onAbrirConfigurador,
  usuario,
}: TopbarPaginaGravityProps) {
  const { t } = useTranslation()
  const { toggleTooltips, tooltipsDisabled, currentTheme, toggleTheme } = useShellStore()
  const isLight = currentTheme === 'light'

  return (
    <header className="gravity-topbar-pagina" role="banner">
      <div className="gravity-topbar-pagina__inner">
        <div className="gravity-topbar-pagina__esq">
          <div className="gravity-topbar-pagina__marca">
            <Hexagon weight="duotone" size={22} color="#818cf8" aria-hidden />
            <span className="gravity-topbar-pagina__marca-nome">Gravity</span>
          </div>
          <div className="gravity-topbar-pagina__div" aria-hidden />
          <span className="gravity-topbar-pagina__rotulo">{rotuloTela}</span>
        </div>

        <div className="gravity-topbar-pagina__dir">
          {atalho ? (
            <>
              <button
                className="hb-topbar-navlink"
                type="button"
                title={atalho.title ?? atalho.label}
                onClick={atalho.onClick}
              >
                {atalho.icon}
                {atalho.label}
              </button>
              <div className="hb-topbar-sep" />
            </>
          ) : null}

          <button
            className="hb-topbar-btn"
            type="button"
            title={t('comum.buscar')}
            aria-label={t('comum.buscar')}
            onClick={onBuscar}
          >
            <MagnifyingGlass weight="bold" size={16} />
          </button>

          <Notificacoes />

          <button
            className="hb-topbar-btn"
            type="button"
            title={tooltipsDisabled ? t('shell.label_habilitar_dicas') : t('shell.label_desabilitar_dicas')}
            aria-label={tooltipsDisabled ? t('shell.habilitar_dicas') : t('shell.desabilitar_dicas')}
            onClick={toggleTooltips}
            style={{ color: tooltipsDisabled ? 'var(--hb-muted)' : 'var(--hb-accent)' }}
          >
            <Info weight={tooltipsDisabled ? 'regular' : 'fill'} size={16} />
          </button>

          <LocalizadorGlobal
            workspaceName={workspaceName}
            iconOnly
            currentProductId={localizador.currentProductId}
            currentProductLabel={localizador.currentProductLabel}
            currentProductColor={localizador.currentProductColor}
            currentPageLabel={localizador.currentPageLabel}
            history={localizador.history}
            nodes={localizador.nodes}
            onNavigate={localizador.onNavigate}
          />

          <SeletorIdiomaGlobal iconOnly />

          <div className="hb-topbar-sep" />

          <button
            className="hb-topbar-btn"
            type="button"
            title={t('workspace.layout.modulo_nome')}
            onClick={onAbrirConfigurador}
          >
            <Gear weight="duotone" size={16} />
          </button>

          <UsuarioGlobal
            {...usuario}
            isLight={isLight}
            onToggleTheme={toggleTheme}
            compact
          />
        </div>
      </div>
    </header>
  )
}
