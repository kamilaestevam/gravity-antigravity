import React, { useState } from 'react'
import { useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  List,
  Sun,
  Moon,
  MagnifyingGlass,
  Info,
  ArrowLeft,
} from '@phosphor-icons/react'
import { useShellStore } from './store'
import { AvisoInternoGlobal, type AvisoInterno } from '@nucleo/mensageria-global'
import { UsuarioGlobal } from '@nucleo/usuario-global'
import { LanguageSwitcherGlobal } from '@nucleo/language-switcher-global'

/**
 * Mapa de rota → chave i18n de breadcrumb
 * Expandir conforme novos módulos forem integrados (Onda 3+)
 */
const ROUTE_LABEL_KEYS: Record<string, string> = {
  '/dashboard':     'shell.menu.dashboard',
  '/relatorios':    'shell.menu.relatorios',
  '/email':         'shell.menu.email',
  '/whatsapp':      'shell.menu.whatsapp',
  '/notificacoes':  'shell.menu.notificacoes',
  '/atividades':    'shell.menu.atividades',
  '/cronometro':    'shell.menu.cronometro',
  '/historico':     'shell.menu.historico',
  '/gabi':          'shell.menu.gabi',
  '/helpdesk':      'shell.menu.helpdesk',
  '/conector-erp':  'shell.menu.conector_erp',
  '/configurador':  'shell.menu.configuracoes',
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
  const { t } = useTranslation()
  const {
    toggleSidebar,
    toggleTheme,
    currentTheme,
    tooltipsDisabled,
    toggleTooltips,
    currentUser,
    clearCurrentUser,
  } = useShellStore()

  const avisosMock: AvisoInterno[] = [
    {
      id: '1',
      conteudo: t('shell.notificacoes_mock.boas_vindas'),
      autor: { nome: t('shell.sistema') },
      dataHora: new Date().toLocaleString('pt-BR'),
      lido: false,
      tipo: 'sistema',
    },
    {
      id: '2',
      conteudo: t('shell.notificacoes_mock.simulacao_concluida'),
      autor: { nome: 'SimulaCusto' },
      dataHora: new Date(Date.now() - 3600_000).toLocaleString('pt-BR'),
      lido: false,
      tipo: 'aviso',
    },
  ]

  const [avisos, setAvisos] = useState<AvisoInterno[]>(avisosMock)

  function getPageLabel(pathname: string): string {
    const key = ROUTE_LABEL_KEYS[pathname]
    if (key) return t(key)
    const base = '/' + pathname.split('/')[1]
    const baseKey = ROUTE_LABEL_KEYS[base]
    return baseKey ? t(baseKey) : t('shell.gravity')
  }

  const pageLabel = getPageLabel(location.pathname)

  const handleMarcarLido = (id: string) => {
    setAvisos(prev => prev.map(a => a.id === id ? { ...a, lido: true } : a))
  }

  const handleMarcarTodosLidos = () => {
    setAvisos(prev => prev.map(a => ({ ...a, lido: true })))
  }

  const handleCriarAviso = (texto: string) => {
    const novo: AvisoInterno = {
      id: `aviso-${Date.now()}`,
      conteudo: texto,
      autor: { nome: t('shell.voce') },
      dataHora: new Date().toLocaleString('pt-BR'),
      lido: false,
      tipo: 'aviso',
    }
    setAvisos(prev => [novo, ...prev])
  }

  const initials = currentUser.name
    ? currentUser.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : '??'

  return (
    <header className="shell-header" role="banner">
      {/* DIREITA: ações + usuário (Floating Header) */}
      <div className="shell-header__right">
        {/* Botão Voltar ao Hub */}
        <button
          className="shell-header__icon-btn shell-voltar-btn"
          onClick={() => { window.location.href = '/hub' }}
          type="button"
          title={t('shell.voltar_hub', 'Voltar ao Hub')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.375rem',
            padding: '0.375rem 0.875rem',
            borderRadius: '9999px',
            border: '1px solid rgba(129,140,248,0.25)',
            background: 'rgba(129,140,248,0.08)',
            color: '#818cf8',
            fontSize: '0.8125rem',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.15s',
            whiteSpace: 'nowrap',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(129,140,248,0.15)'; e.currentTarget.style.borderColor = 'rgba(129,140,248,0.4)' }}
          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(129,140,248,0.08)'; e.currentTarget.style.borderColor = 'rgba(129,140,248,0.25)' }}
        >
          <ArrowLeft size={16} weight="bold" />
          Hub
        </button>

        {/* Busca global — dispara evento, sem lógica de produto */}
        <button
          className="shell-header__icon-btn"
          aria-label={t('shell.busca_global')}
          title={t('shell.busca_global')}
          type="button"
          onClick={() => {
            window.dispatchEvent(new CustomEvent('shell:global-search'))
          }}
        >
          <MagnifyingGlass size={18} />
        </button>

        {/* Toggle de tooltips */}
        <button
          className="shell-header__icon-btn"
          aria-label={tooltipsDisabled ? t('shell.habilitar_dicas') : t('shell.desabilitar_dicas')}
          title={tooltipsDisabled ? t('shell.label_habilitar_dicas') : t('shell.label_desabilitar_dicas')}
          type="button"
          onClick={toggleTooltips}
          style={{ color: tooltipsDisabled ? 'var(--text-muted)' : 'var(--accent)' }}
        >
          <Info size={18} weight={tooltipsDisabled ? 'regular' : 'fill'} />
        </button>

        {/* Mensageria — Quadro de Avisos Internos */}
        <div className="shell-header__icon-btn" style={{ padding: 0, background: 'none', border: 'none' }}>
          <AvisoInternoGlobal
            avisos={avisos}
            onMarcarLido={handleMarcarLido}
            onMarcarTodosLidos={handleMarcarTodosLidos}
            onCriarAviso={handleCriarAviso}
          />
        </div>

        {/* Seletor de idioma */}
        <LanguageSwitcherGlobal />

        {/* Divisor visual */}
        <div style={{ width: '1px', height: '24px', background: 'var(--bg-elevated)', margin: '0 0.25rem' }} />

        {/* Usuário Global — Perfil e Conta */}
        <UsuarioGlobal
          userName={currentUser.name || t('shell.usuario_padrao')}
          userEmail={currentUser.email || t('shell.email_padrao')}
          userInitials={initials}
          userRole={t('shell.papel_membro')}
          isLight={currentTheme === 'light'}
          onToggleTheme={toggleTheme}
          onNavigateOrganizacao={() => console.log('Navegar para Organização')}
          onNavigateAssinaturas={() => console.log('Navegar para Assinaturas')}
          onSignOut={() => {
            clearCurrentUser()
            window.location.href = '/'
          }}
          isAdmin={currentUser.email === 'admin@gravity.com.br'}
          onNavigateAdmin={() => window.location.href = '/admin'}
        />
      </div>
    </header>
  )
}
