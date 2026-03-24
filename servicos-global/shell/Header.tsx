import React from 'react'
import { useLocation } from 'react-router-dom'
import {
  List,
  Sun,
  Moon,
  Bell,
  MagnifyingGlass,
} from '@phosphor-icons/react'
import { useShellStore } from './store'

/**
 * Mapa de rota → label de breadcrumb
 * Expandir conforme novos módulos forem integrados (Onda 3+)
 */
const ROUTE_LABELS: Record<string, string> = {
  '/dashboard':     'Dashboard',
  '/relatorios':    'Relatórios',
  '/email':         'Email',
  '/whatsapp':      'WhatsApp',
  '/notificacoes':  'Notificações',
  '/atividades':    'Atividades',
  '/cronometro':    'Cronômetro',
  '/historico':     'Histórico',
  '/gabi':          'Gabi IA',
  '/helpdesk':      'Helpdesk',
  '/conector-erp':  'Conector ERP',
  '/configurador':  'Configurações',
}

function getPageLabel(pathname: string): string {
  // Correspondência exata
  if (ROUTE_LABELS[pathname]) return ROUTE_LABELS[pathname]

  // Correspondência por prefixo (ex: /atividades/123)
  const base = '/' + pathname.split('/')[1]
  return ROUTE_LABELS[base] ?? 'Gravity'
}



/**
 * Header — barra superior do shell.
 *
 * Exibe:
 * - Botão toggle da sidebar
 * - Breadcrumb da rota atual
 * - Botão de busca (evento, sem lógica de produto)
 * - Toggle de tema dark/light
 * - Badge de notificações pendentes
 *
 * Info de usuário/tenant exibida na sidebar (footer).
 * Nunca contém lógica de produto.
 */
export function Header() {
  const location = useLocation()
  const {
    toggleSidebar,
    toggleTheme,
    currentTheme,
    notifications,
  } = useShellStore()

  const pageLabel = getPageLabel(location.pathname)
  const unreadCount = notifications.length

  return (
    <header className="shell-header" role="banner">
      {/* ESQUERDA: toggle + breadcrumb */}
      <div className="shell-header__left">
        <button
          className="shell-header__toggle"
          onClick={toggleSidebar}
          aria-label="Alternar menu lateral"
          title="Alternar menu lateral"
          type="button"
        >
          <List size={20} weight="bold" />
        </button>

        <nav className="shell-header__breadcrumb" aria-label="Localização atual">
          <span>Gravity</span>
          <span aria-hidden="true">/</span>
          <span
            className="shell-header__breadcrumb-current"
            aria-current="page"
          >
            {pageLabel}
          </span>
        </nav>
      </div>

      {/* DIREITA: ações + usuário */}
      <div className="shell-header__right">
        {/* Busca global — dispara evento, sem lógica de produto */}
        <button
          className="shell-header__icon-btn"
          aria-label="Busca global"
          title="Busca global"
          type="button"
          onClick={() => {
            // Produto pode escutar este evento via event bus (@nucleo/shell)
            window.dispatchEvent(new CustomEvent('shell:global-search'))
          }}
        >
          <MagnifyingGlass size={18} />
        </button>

        {/* Toggle de tema */}
        <button
          className="shell-header__icon-btn"
          aria-label={
            currentTheme === 'dark'
              ? 'Alternar para tema claro'
              : 'Alternar para tema escuro'
          }
          title={
            currentTheme === 'dark'
              ? 'Tema claro'
              : 'Tema escuro'
          }
          type="button"
          onClick={toggleTheme}
        >
          {currentTheme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        {/* Notificações */}
        <button
          className="shell-header__icon-btn"
          aria-label={
            unreadCount > 0
              ? `${unreadCount} notificaç${unreadCount === 1 ? 'ão' : 'ões'} pendente${unreadCount === 1 ? '' : 's'}`
              : 'Sem notificações pendentes'
          }
          title="Notificações"
          type="button"
          style={{ position: 'relative' }}
        >
          <Bell size={18} />
          {unreadCount > 0 && (
            <span
              aria-hidden="true"
              style={{
                position: 'absolute',
                top: '6px',
                right: '6px',
                width: '8px',
                height: '8px',
                background: 'var(--danger)',
                borderRadius: '50%',
                border: '2px solid var(--bg-base)',
              }}
            />
          )}
        </button>
      </div>
    </header>
  )
}
