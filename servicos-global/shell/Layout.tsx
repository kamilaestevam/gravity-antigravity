import React, { Suspense } from 'react'
import './shell.css'
import { Sidebar } from './Sidebar'
import { Header } from './Header'
import { ToastContainer } from './ToastContainer'
import { useShellStore } from './store'
import { I18nProvider } from '../../nucleo-global/Utilidades/Localization/provider'

interface LayoutProps {
  children: React.ReactNode
}

export function Layout({ children }: LayoutProps) {
  const { sidebarOpen, currentTheme, tooltipsDisabled } = useShellStore()

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

  return (
    <I18nProvider>
      <div className={`shell-layout${sidebarOpen ? '' : ' sidebar-collapsed'}`}>
        <Sidebar />
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
    </I18nProvider>
  )
}
