import { Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { Layout } from '@shell'
import { DashboardGeralPage } from '@organizacao/dashboard'

function LoadingFallback() {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      height: '100vh', background: 'var(--bg-body)', color: 'var(--text-muted)',
      fontFamily: 'var(--font-sans)', fontSize: 'var(--text-body)'
    }}>
      Carregando dashboard...
    </div>
  )
}

export default function App() {
  return (
    <Layout>
      <Suspense fallback={<LoadingFallback />}>
        <Routes>
          <Route path="/" element={<Navigate to="geral" replace />} />
          <Route path="geral" element={<DashboardGeralPage />} />
          <Route path="*" element={<Navigate to="geral" replace />} />
        </Routes>
      </Suspense>
    </Layout>
  )
}
