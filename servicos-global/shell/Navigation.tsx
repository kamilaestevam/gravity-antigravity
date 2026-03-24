import React, { lazy, Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'

/**
 * Carregamento lazy por módulo.
 *
 * Cada rota aponta para o client do serviço de tenant ou produto correspondente.
 * Os paths dos imports serão ajustados pelo Coordenador quando os módulos
 * da Onda 3 forem integrados.
 *
 * REGRA: nunca importar código de produto aqui — apenas wrappers lazy.
 * Produto integra via react-router-dom e seu próprio entry point.
 */

// Placeholder enquanto módulos da Onda 3 não estão disponíveis
function ModulePlaceholder({ name }: { name: string }) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '60vh',
        gap: '1rem',
        color: 'var(--text-muted)',
      }}
    >
      <div
        style={{
          width: 48,
          height: 48,
          borderRadius: 'var(--radius-lg)',
          background: 'var(--bg-surface)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '1.5rem',
        }}
        aria-hidden="true"
      >
        🧩
      </div>
      <p style={{ fontSize: '0.875rem' }}>
        Módulo <strong style={{ color: 'var(--text-secondary)' }}>{name}</strong> — Onda 3
      </p>
    </div>
  )
}

/**
 * Importações lazy dos módulos (serão substituídas pelos entry points reais
 * dos serviços de tenant na Onda 3).
 *
 * Padrão de integração esperado:
 * const DashboardModule = lazy(() => import('@tenant/dashboard/client'))
 */

// Onda 3 — Serviços de tenant (stubs lazy)
const DashboardModule    = lazy(() => Promise.resolve({ default: () => <ModulePlaceholder name="Dashboard" />    }))
const RelatoriosModule   = lazy(() => Promise.resolve({ default: () => <ModulePlaceholder name="Relatórios" />   }))
const EmailModule        = lazy(() => Promise.resolve({ default: () => <ModulePlaceholder name="Email" />        }))
const WhatsAppModule     = lazy(() => Promise.resolve({ default: () => <ModulePlaceholder name="WhatsApp" />     }))
const NotificacoesModule = lazy(() => Promise.resolve({ default: () => <ModulePlaceholder name="Notificações" />  }))
const AtividadesModule   = lazy(() => Promise.resolve({ default: () => <ModulePlaceholder name="Atividades" />   }))
const CronometroModule   = lazy(() => Promise.resolve({ default: () => <ModulePlaceholder name="Cronômetro" />   }))
const HistoricoModule    = lazy(() => Promise.resolve({ default: () => <ModulePlaceholder name="Histórico" />    }))

// Onda 3 — Serviços de produto (stubs lazy)
const GabiModule         = lazy(() => Promise.resolve({ default: () => <ModulePlaceholder name="Gabi IA" />      }))
const HelpdeskModule     = lazy(() => Promise.resolve({ default: () => <ModulePlaceholder name="Helpdesk" />     }))
const ConectorErpModule  = lazy(() => Promise.resolve({ default: () => <ModulePlaceholder name="Conector ERP" />  }))

// Configurador — Onda 2 (stub, substituído quando configurador estiver pronto)
const ConfiguradorModule = lazy(() => Promise.resolve({ default: () => <ModulePlaceholder name="Configurações" />}))

function LoadingFallback() {
  return (
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
  )
}

/**
 * Navigation — define todas as rotas lazy do app.
 *
 * Este componente é renderizado dentro do <main> do Layout.
 * O BrowserRouter deve ser montado no entry point raiz da aplicação.
 */
export function Navigation() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <Routes>
        {/* Redirect da raiz para dashboard */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />

        {/* Serviços de tenant (Onda 3) */}
        <Route path="/dashboard/*"    element={<DashboardModule />} />
        <Route path="/relatorios/*"   element={<RelatoriosModule />} />
        <Route path="/email/*"        element={<EmailModule />} />
        <Route path="/whatsapp/*"     element={<WhatsAppModule />} />
        <Route path="/notificacoes/*" element={<NotificacoesModule />} />
        <Route path="/atividades/*"   element={<AtividadesModule />} />
        <Route path="/cronometro/*"   element={<CronometroModule />} />
        <Route path="/historico/*"    element={<HistoricoModule />} />

        {/* Serviços de produto (Onda 3) */}
        <Route path="/gabi/*"         element={<GabiModule />} />
        <Route path="/helpdesk/*"     element={<HelpdeskModule />} />
        <Route path="/conector-erp/*" element={<ConectorErpModule />} />

        {/* Configurador (Onda 2) e Gravity Store */}
        <Route path="/configurador/*" element={<ConfiguradorModule />} />
        <Route path="/store/*" element={<ConfiguradorModule />} />

        {/* Fallback 404 */}
        <Route
          path="*"
          element={
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                height: '60vh',
                gap: '0.75rem',
                color: 'var(--text-muted)',
              }}
            >
              <p style={{ fontSize: '2rem', fontWeight: 700 }}>404</p>
              <p style={{ fontSize: '0.875rem' }}>Página não encontrada</p>
            </div>
          }
        />
      </Routes>
    </Suspense>
  )
}
