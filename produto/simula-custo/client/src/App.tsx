/**
 * App.tsx — Raiz da SPA SimulaCusto
 * Skill: antigravity-criar-produto (Passo 6)
 *
 * Usa o <Layout> do @gravity/shell (CabeçalhoGlobal + MenuLateralGlobal + Gabi).
 * O PRODUCT_CONFIG define quais menus aparecem e quais serviços de tenant são acessados.
 */

import React, { lazy, Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { Layout } from '@shell'
import { PRODUCT_CONFIG } from './shared/config'

  // Lazy loading das telas do produto
import DashboardSimulaCusto from './pages/dashboard/DashboardSimulaCusto'
import EstimativasPage from './pages/estimativas/Estimativas'
import RelatoriosPage from './pages/relatorios/Relatorios'

// Keep lazy for others if needed, but for now let's simplify for debugging
const Dashboard = DashboardSimulaCusto
const Estimativas = EstimativasPage
const Relatorios = RelatoriosPage

// Importa o Dashboard Global (Tenant)
import { Dashboard as GlobalDashboard } from '@tenant/dashboard/src/Dashboard'

const LoadingFallback = () => (
  <div style={{
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    color: 'var(--text-muted)',
    fontSize: '0.875rem',
    fontFamily: 'Plus Jakarta Sans, sans-serif'
  }}>
    Carregando módulo…
  </div>
)

import { 
  Calculator, 
  Upload, 
  ChartBar, 
  CheckCircle, 
  FileText, 
  Clock, 
  Sparkle,
  Envelope,
  ChatCircle
} from '@phosphor-icons/react'

import { useShellStore } from '@shell'

export function App() {
  const { currentUser, setCurrentUser } = useShellStore()

  // Initialize mock user for demonstration
  React.useEffect(() => {
    if (!currentUser.name) {
      setCurrentUser({
        id: 'user-demo',
        name: 'Daniel Silva',
        email: 'dmmltda@gmail.com',
        tenantId: 'tenant-1',
        tenantName: 'Gravity Soluções',
      })
    }
  }, [currentUser, setCurrentUser])

  // Mapeia os ícones do config para elementos React
  const iconMap: Record<string, React.ReactNode> = {
    'calculator':   <Calculator weight="duotone" size={20} />,
    'upload':       <Upload weight="duotone" size={20} />,
    'bar-chart':    <ChartBar weight="duotone" size={20} />,
    'check-circle': <CheckCircle weight="duotone" size={20} />,
    'file-text':    <FileText weight="duotone" size={20} />,
    'clock':        <Clock weight="duotone" size={20} />,
    'sparkle':      <Sparkle weight="duotone" size={20} />,
    'envelope':     <Envelope weight="duotone" size={20} />,
    'chat-circle':  <ChatCircle weight="duotone" size={20} />,
  }

  // Função recursiva para mapear itens de navegação
  const mapNavigation = (items: any[]): any[] => {
    return items.map(item => ({
      to: item.children ? undefined : item.id,
      label: item.label,
      icon: iconMap[item.icon] || <CheckCircle weight="duotone" size={20} />,
      children: item.children ? mapNavigation(item.children) : undefined
    }))
  }

  const navItems = mapNavigation([...PRODUCT_CONFIG.navigation])


  return (
    <Layout 
      moduleName="SimulaCusto Verificada"
      moduleColor="#818cf8"
      navItems={navItems}
    >
      <Suspense fallback={<LoadingFallback />}>
        <Routes>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="estimativas" element={<Estimativas />} />
          <Route path="relatorios" element={<Relatorios />} />

          {/* Serviços de tenant globais (Meu Espaço) */}
          <Route path="meu-espaco" element={<GlobalDashboard />} />
          <Route path="meu-espaco/atividades" element={<div style={{ padding: '2rem', color: 'var(--text-muted)' }}>Módulo de Atividades (Tenant)</div>} />
          <Route path="meu-espaco/email" element={<div style={{ padding: '2rem', color: 'var(--text-muted)' }}>Módulo de E-mails (Tenant)</div>} />
          <Route path="meu-espaco/whatsapp" element={<div style={{ padding: '2rem', color: 'var(--text-muted)' }}>Módulo de Whatsapp (Tenant)</div>} />
          <Route path="historico" element={<div style={{ padding: '2rem', color: 'var(--text-muted)' }}>Módulo de Histórico (Tenant)</div>} />

          {/* Rota para Teste de Inversão de Contexto */}
          <Route path="processo/:id/*" element={<div style={{ padding: '2rem', color: 'var(--text-muted)' }}><h1>Dentro do Processo (Deep Work)</h1><p>O Menu Lateral sumiu e você está isolado aqui.</p></div>} />

          {/* Serviços de tenant são renderizados pelo Shell automaticamente via PRODUCT_CONFIG se configurado no roteador global */}
          <Route path="*" element={<Navigate to="dashboard" replace />} />
        </Routes>
      </Suspense>
    </Layout>
  )
}


// Exporta o config para uso pelo Shell
export { PRODUCT_CONFIG }
export default App
