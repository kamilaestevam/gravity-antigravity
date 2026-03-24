import React from 'react'
import { NavLink, useLocation } from 'react-router-dom'
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

interface NavItem {
  to: string
  icon: React.ReactNode
  label: string
}

interface NavSection {
  label: string
  items: NavItem[]
}

const NAV_SECTIONS: NavSection[] = [
  {
    label: 'Principal',
    items: [
      { to: '/dashboard', icon: <House weight="duotone" size={20} />, label: 'Dashboard' },
      { to: '/relatorios', icon: <ChartBar weight="duotone" size={20} />, label: 'Relatórios' },
    ],
  },
  {
    label: 'Comunicação',
    items: [
      { to: '/email', icon: <Envelope weight="duotone" size={20} />, label: 'Email' },
      { to: '/whatsapp', icon: <ChatCircle weight="duotone" size={20} />, label: 'WhatsApp' },
      { to: '/notificacoes', icon: <Bell weight="duotone" size={20} />, label: 'Notificações' },
    ],
  },
  {
    label: 'Operacional',
    items: [
      { to: '/atividades', icon: <BookOpen weight="duotone" size={20} />, label: 'Atividades' },
      { to: '/cronometro', icon: <Clock weight="duotone" size={20} />, label: 'Cronômetro' },
      { to: '/historico', icon: <FileText weight="duotone" size={20} />, label: 'Histórico' },
    ],
  },
  {
    label: 'Serviços',
    items: [
      { to: '/gabi', icon: <Star weight="duotone" size={20} />, label: 'Gabi IA' },
      { to: '/helpdesk', icon: <Headset weight="duotone" size={20} />, label: 'Helpdesk' },
      { to: '/conector-erp', icon: <Plugs weight="duotone" size={20} />, label: 'Conector ERP' },
    ],
  },
  {
    label: 'Sistema',
    items: [
      { to: '/store', icon: <Star weight="duotone" size={20} />, label: 'Gravity Store' },
      { to: '/configurador', icon: <Gear weight="duotone" size={20} />, label: 'Configurações' },
    ],
  },
]

/**
 * Sidebar — menu lateral com navegação por produto/serviço.
 *
 * - Colapsa para 72px quando sidebarOpen = false (apenas ícones)
 * - Usa NavLink do react-router-dom para classe .active automática
 * - Nunca contém lógica de produto
 */
export function Sidebar() {
  const { sidebarOpen, toggleSidebar } = useShellStore()
  const location = useLocation()

  return (
    <aside
      className="shell-sidebar"
      aria-label="Menu de navegação"
      role="navigation"
    >
      {/* Logo / marca */}
      <div className="shell-sidebar__logo">
        <LogoGlobal iconOnly={!sidebarOpen} iconSize={24} />
        <button
          className="shell-sidebar__collapse-btn"
          onClick={toggleSidebar}
          aria-label={sidebarOpen ? 'Recolher menu' : 'Expandir menu'}
          title={sidebarOpen ? 'Recolher menu' : 'Expandir menu'}
        >
          {sidebarOpen ? (
            <CaretDoubleLeft size={12} weight="bold" />
          ) : (
            <CaretDoubleRight size={12} weight="bold" />
          )}
        </button>
      </div>

      {/* Itens de navegação */}
      <nav className="shell-sidebar__nav" aria-label="Módulos do sistema">
        {NAV_SECTIONS.map((section) => (
          <React.Fragment key={section.label}>
            <span
              className="shell-sidebar__section-label"
              aria-hidden={!sidebarOpen}
            >
              {section.label}
            </span>

            {section.items.map((item) => {
              const isActive =
                location.pathname === item.to ||
                location.pathname.startsWith(item.to + '/')

              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={`shell-sidebar__nav-item${isActive ? ' active' : ''}`}
                  title={!sidebarOpen ? item.label : undefined}
                  aria-label={!sidebarOpen ? item.label : undefined}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <span className="shell-sidebar__nav-icon" aria-hidden="true">
                    {item.icon}
                  </span>
                  <span className="shell-sidebar__nav-label">{item.label}</span>
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
          title={!sidebarOpen ? 'Configurações' : undefined}
          aria-label={!sidebarOpen ? 'Configurações' : undefined}
        >
          <span className="shell-sidebar__nav-icon" aria-hidden="true">
            <Gear weight="duotone" size={20} />
          </span>
          <span className="shell-sidebar__nav-label">Configurações</span>
        </NavLink>
      </div>
    </aside>
  )
}
