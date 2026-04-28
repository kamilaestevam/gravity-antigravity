import React, { Suspense } from 'react'
import './shell.css'
import { Sidebar } from './Sidebar'
import { Header } from './Header'
import { ContextualSidebar } from './ContextualSidebar'
import { ProductSidebar } from './ProductSidebar'
import { useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { changeLanguageLazy, type SupportedLanguage } from '@nucleo/Utilidades/localization/i18n'
import { ToastContainer } from './ToastContainer'
import { useShellStore } from './store'
import { useLoadAllowedProducts } from './hooks/useLoadAllowedProducts'
import { useMeSync } from './hooks/useMeSync'

interface LayoutProps {
  children: React.ReactNode
  navItems?: { to: string; label: string; icon: React.ReactNode }[]
  moduleName?: string
  moduleColor?: string
  tenantName?: string
  tenantPlan?: string
}

/**
 * Layout — wrapper principal da aplicação Gravity.
 *
 * Responsabilidades:
 * - Grade CSS: sidebar + header + conteúdo principal
 * - Aplicar classe de colapso de sidebar ao grid
 * - Renderizar sistema de toasts (ToastContainer)
 * - Aplicar tema (dark/light) via useEffect no mount
 * - Persistir preferência de idioma no html[lang]
 */
export function Layout({ 
  children,
  navItems,
  moduleName,
  moduleColor,
  tenantName,
  tenantPlan
}: LayoutProps) {
  const { t, i18n } = useTranslation()
  const { sidebarOpen, currentTheme, tooltipsDisabled, currentUser, meStatus } = useShellStore()
  const location = useLocation()
  
  // Detecção de contexto de navegação
  const isProcessoRoute = location.pathname.startsWith('/processo/')
  const isProdutoRoute  = location.pathname.startsWith('/produto/')

  // Popula ShellStore via GET /api/v1/me (Clerk = porteiro, backend = fonte de verdade)
  useMeSync()

  // Carrega produtos permitidos para o tenant ao montar
  useLoadAllowedProducts()

  // Sincroniza tema com body no mount e nas mudanças
  React.useEffect(() => {
    document.body.classList.remove('light-theme')
    if (currentTheme === 'light') {
      document.body.classList.add('light-theme')
    }
  }, [currentTheme])

  // Sincroniza estado de tooltips com body
  React.useEffect(() => {
    if (tooltipsDisabled) {
      document.body.classList.add('tooltips-disabled')
    } else {
      document.body.classList.remove('tooltips-disabled')
    }
  }, [tooltipsDisabled])

  // Detecta e persiste idioma salvo pelo usuário, sincroniza com i18next
  React.useEffect(() => {
    const saved = localStorage.getItem('gravity:language')
    const detected = navigator.language.split('-')[0]
    const language = saved ?? detected ?? 'pt'
    document.documentElement.setAttribute('lang', language)
    if (i18n.language !== language) {
      changeLanguageLazy(language as SupportedLanguage)
    }
  }, [i18n])

  if (meStatus === 'error') {
    return (
      <div
        style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          justifyContent: 'center', height: '100vh', gap: '1rem',
          color: 'var(--text-primary, #e2e8f0)', background: 'var(--bg-primary, #0f172a)',
        }}
        role="alert"
        aria-live="assertive"
      >
        <span style={{ fontSize: '1rem' }}>{t('shell.erro_perfil')}</span>
        <button
          onClick={() => window.location.reload()}
          style={{
            padding: '0.5rem 1.25rem', borderRadius: '0.375rem',
            background: 'var(--accent-primary, #3b82f6)', color: '#fff',
            border: 'none', cursor: 'pointer', fontSize: '0.875rem',
          }}
        >
          {t('shell.tentar_novamente')}
        </button>
      </div>
    )
  }

  return (
    <div className={`shell-layout${sidebarOpen ? '' : ' sidebar-collapsed'}`}>
      {isProcessoRoute ? (
        <ContextualSidebar
          tenantName={tenantName ?? currentUser.tenantName ?? t('shell.organizacao_padrao')}
          tenantPlan={tenantPlan ?? t('shell.plano_padrao')}
        />
      ) : isProdutoRoute ? (
        <ProductSidebar
          navItems={navItems}
          moduleName={moduleName}
          moduleColor={moduleColor}
          tenantName={tenantName ?? currentUser.tenantName ?? t('shell.organizacao_padrao')}
          tenantPlan={tenantPlan ?? t('shell.plano_padrao')}
        />
      ) : (
        <Sidebar
          navItems={navItems}
          moduleName={moduleName}
          moduleColor={moduleColor}
          tenantName={tenantName ?? currentUser.tenantName ?? t('shell.organizacao_padrao')}
          tenantPlan={tenantPlan ?? t('shell.plano_padrao')}
        />
      )}
      <Header moduleName={moduleName} moduleColor={moduleColor} />
      <main className="shell-main" role="main" aria-label={t('shell.conteudo_principal')}>
        <Suspense
          fallback={
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%',
                color: 'var(--text-muted)',
                fontSize: '0.875rem',
              }}
            >
              {t('shell.carregando_modulo')}
            </div>
          }
        >
          {children}
        </Suspense>
      </main>
      <ToastContainer />
    </div>
  )
}
