import React, { Suspense } from 'react'
import './shell.css'
import { Sidebar } from './Sidebar'
import { Header } from './Header'
import { ContextualSidebar } from './ContextualSidebar'
import { useLocation } from 'react-router-dom'
import { ToastContainer } from './ToastContainer'
import { useShellStore } from './store'

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
  const { sidebarOpen, currentTheme, tooltipsDisabled, currentUser } = useShellStore()
  const location = useLocation()
  
  // Detecção Mágica de "Merculo/Deep Work"
  const isProcessoRoute = location.pathname.startsWith('/processo/')

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

  // Detecta e persiste idioma salvo pelo usuário
  React.useEffect(() => {
    const saved = localStorage.getItem('gravity:language')
    const detected = navigator.language.split('-')[0]
    const language = saved ?? detected ?? 'pt'
    document.documentElement.setAttribute('lang', language)
  }, [])

  return (
    <div className={`shell-layout${sidebarOpen ? '' : ' sidebar-collapsed'}`}>
      {isProcessoRoute ? (
        <ContextualSidebar
          tenantName={tenantName ?? currentUser.tenantName ?? 'Organização'}
          tenantPlan={tenantPlan ?? 'Plano Profissional'}
        />
      ) : (
        <Sidebar 
          navItems={navItems}
          moduleName={moduleName}
          moduleColor={moduleColor}
          tenantName={tenantName ?? currentUser.tenantName ?? 'Organização'}
          tenantPlan={tenantPlan ?? 'Plano Profissional'}
        />
      )}
      <Header />
      <main className="shell-main" role="main" aria-label="Conteúdo principal">
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
              Carregando módulo…
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
