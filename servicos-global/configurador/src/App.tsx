// src/App.tsx
// Roteamento do Admin Panel (sem react-router — hash routing leve)

import { useState, useEffect } from 'react'
import { AdminPanel } from './pages/AdminPanel'
import { TenantDetail } from './pages/TenantDetail'

export type Page =
  | { name: 'admin' }
  | { name: 'tenant-detail'; tenantId: string }

export default function App() {
  const [page, setPage] = useState<Page>({ name: 'admin' })

  const navigate = (next: Page) => setPage(next)

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-bg)' }}>
      {page.name === 'admin' && <AdminPanel navigate={navigate} />}
      {page.name === 'tenant-detail' && (
        <TenantDetail tenantId={page.tenantId} onBack={() => setPage({ name: 'admin' })} />
      )}
    </div>
  )
}
