import React from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  House,
  ChartBar,
  Envelope,
  ChatCircle,
  Clock,
  Bell,
  FileText,
  BookOpen,
  Headset,
  Plugs,
  Star,
  Gear,
  CaretDoubleLeft,
  CaretDoubleRight,
} from '@phosphor-icons/react'
import { useShellStore } from './store'
import { LogoGlobal } from '@nucleo/logo-global'

/**
 * Sidebar — menu lateral com navegação por produto/serviço.
 *
 * - Colapsa para 72px quando sidebarOpen = false (apenas ícones)
 * - Usa NavLink do react-router-dom para classe .active automática
 * - Labels traduzidos via useTranslation — nunca strings hardcoded
 * - Nunca contém lógica de produto
 */
export function Sidebar() {
  const { sidebarOpen, toggleSidebar } = useShellStore()
  const { t } = useTranslation()
  const location = useLocation()

  // Seções e itens definidos com chaves de tradução — sem strings hardcoded
  const NAV_SECTIONS = [
    {
      labelKey: 'shell.secao.principal',
      items: [
        { to: '/dashboard',   icon: <House weight="duotone" size={20} />,    labelKey: 'shell.menu.dashboard' },
        { to: '/relatorios',  icon: <ChartBar weight="duotone" size={20} />, labelKey: 'shell.menu.relatorios' },
      ],
    },
    {
      labelKey: 'shell.secao.comunicacao',
      items: [
        { to: '/email',        icon: <Envelope weight="duotone" size={20} />,   labelKey: 'shell.menu.email' },
        { to: '/whatsapp',     icon: <ChatCircle weight="duotone" size={20} />, labelKey: 'shell.menu.whatsapp' },
        { to: '/notificacoes', icon: <Bell weight="duotone" size={20} />,       labelKey: 'shell.menu.notificacoes' },
      ],
    },
    {
      labelKey: 'shell.secao.operacional',
      items: [
        { to: '/atividades', icon: <BookOpen weight="duotone" size={20} />,  labelKey: 'shell.menu.atividades' },
        { to: '/cronometro', icon: <Clock weight="duotone" size={20} />,     labelKey: 'shell.menu.cronometro' },
        { to: '/historico',  icon: <FileText weight="duotone" size={20} />,  labelKey: 'shell.menu.historico' },
      ],
    },
    {
      labelKey: 'shell.secao.servicos',
      items: [
        { to: '/gabi',        icon: <Star weight="duotone" size={20} />,   labelKey: 'shell.menu.gabi' },
        { to: '/helpdesk',    icon: <Headset weight="duotone" size={20} />, labelKey: 'shell.menu.helpdesk' },
        { to: '/conector-erp', icon: <Plugs weight="duotone" size={20} />, labelKey: 'shell.menu.conector_erp' },
      ],
    },
    {
      labelKey: 'shell.secao.sistema',
      items: [
        { to: '/store',       icon: <Star weight="duotone" size={20} />, labelKey: 'shell.menu.gravity_store' },
        { to: '/configurador', icon: <Gear weight="duotone" size={20} />, labelKey: 'shell.menu.configuracoes' },
      ],
    },
  ]

  return (
    <aside
      className="shell-sidebar"
      aria-label={t('shell.menu_navegacao')}
      role="navigation"
    >
      {/* Logo / marca */}
      <div className="shell-sidebar__logo">
        <LogoGlobal iconOnly={!sidebarOpen} iconSize={24} />
        <button
          className="shell-sidebar__collapse-btn"
          onClick={toggleSidebar}
          aria-label={sidebarOpen ? t('shell.recolher_menu') : t('shell.expandir_menu')}
          title={sidebarOpen ? t('shell.recolher_menu') : t('shell.expandir_menu')}
        >
          {sidebarOpen ? (
            <CaretDoubleLeft size={12} weight="bold" />
          ) : (
            <CaretDoubleRight size={12} weight="bold" />
          )}
        </button>
      </div>

      {/* Itens de navegação */}
      <nav className="shell-sidebar__nav" aria-label={t('shell.modulos_sistema')}>
        {NAV_SECTIONS.map((section) => (
          <React.Fragment key={section.labelKey}>
            <span
              className="shell-sidebar__section-label"
              aria-hidden={!sidebarOpen}
            >
              {t(section.labelKey)}
            </span>

            {section.items.map((item) => {
              const isActive =
                location.pathname === item.to ||
                location.pathname.startsWith(item.to + '/')
              const label = t(item.labelKey)

              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={`shell-sidebar__nav-item${isActive ? ' active' : ''}`}
                  title={!sidebarOpen ? label : undefined}
                  aria-label={!sidebarOpen ? label : undefined}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <span className="shell-sidebar__nav-icon" aria-hidden="true">
                    {item.icon}
                  </span>
                  <span className="shell-sidebar__nav-label">{label}</span>
                </NavLink>
              )
            })}
          </React.Fragment>
        ))}
      </nav>

      {/* Footer da sidebar */}
      <div className="shell-sidebar__footer">
        <NavLink
          to="/configurador"
          className={`shell-sidebar__nav-item${
            location.pathname.startsWith('/configurador') ? ' active' : ''
          }`}
          title={!sidebarOpen ? t('shell.menu.configuracoes') : undefined}
          aria-label={!sidebarOpen ? t('shell.menu.configuracoes') : undefined}
        >
          <span className="shell-sidebar__nav-icon" aria-hidden="true">
            <Gear weight="duotone" size={20} />
          </span>
          <span className="shell-sidebar__nav-label">{t('shell.menu.configuracoes')}</span>
        </NavLink>
      </div>
    </aside>
  )
}
