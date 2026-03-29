import React, { Suspense } from 'react'
import './shell.css'
import { Sidebar } from './Sidebar'
import { Header } from './Header'
import { ToastContainer } from './ToastContainer'
import { useShellStore } from './store'
import { useLoadAllowedProducts } from './hooks/useLoadAllowedProducts'

interface LayoutProps {
  children: React.ReactNode
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
export function Layout({ children }: LayoutProps) {
  const { sidebarOpen, currentTheme, tooltipsDisabled } = useShellStore()

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

  // Detecta e persiste idioma salvo pelo usuário
  React.useEffect(() => {
    const saved = localStorage.getItem('gravity:language')
    const detected = navigator.language.split('-')[0]
    const language = saved ?? detected ?? 'pt'
    document.documentElement.setAttribute('lang', language)
  }, [])

  return (
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
  )
}
