import React, { Suspense } from 'react'
import './shell.css'
import { Sidebar } from './Sidebar'
import { Header } from './Header'
import { ToastContainer } from './ToastContainer'
import { useShellStore } from './store'
import { I18nProvider } from '@nucleo/Utilidades/localization/provider'
import i18n, { RTL_LANGUAGES, type SupportedLanguage } from '@nucleo/Utilidades/localization/i18n'

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
 * - Detectar e persistir idioma do usuário (localStorage) — responsabilidade do Shell
 *   pois o nucleo-global não pode acessar localStorage diretamente.
 */
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

  // Detecta e restaura idioma salvo — responsabilidade do Shell, não do nucleo-global
  React.useEffect(() => {
    const saved = localStorage.getItem('gravity:language') as SupportedLanguage | null
    const detected = navigator.language.split('-')[0] as SupportedLanguage
    const language = saved ?? detected ?? 'pt'

    i18n.changeLanguage(language)

    const isRtl = (RTL_LANGUAGES as readonly string[]).includes(language)
    document.documentElement.setAttribute('dir', isRtl ? 'rtl' : 'ltr')
    document.documentElement.setAttribute('lang', language)
  }, [])

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
