// src/pages/AdminPanel.tsx
// Painel exclusivo para gravity_admin — gestão de todos os tenants da plataforma

import { useState, useEffect } from 'react'
import type { Page } from '../App'

interface Tenant {
  id: string
  name: string
  slug: string
  status: 'ACTIVE' | 'SUSPENDED' | 'CANCELLED' | 'PENDING_SETUP'
  created_at: string
  _count: { users: number; companies: number }
  subscriptions: Array<{ plan: string; status: string }>
}

interface Stats {
  totalTenants: number
  activeTenants: number
  suspendedTenants: number
  totalUsers: number
}

const API = '/api/admin'

const STATUS_COLORS: Record<string, string> = {
  ACTIVE: '#10b981',
  SUSPENDED: '#f59e0b',
  CANCELLED: '#ef4444',
  PENDING_SETUP: '#6366f1',
}

function StatCard({ label, value, color }: { label: string; value: number; color?: string }) {
  return (
    <div style={{
      background: 'var(--color-surface)',
      border: '1px solid var(--color-border)',
      borderRadius: 'var(--radius)',
      padding: '20px 24px',
      display: 'flex',
      flexDirection: 'column',
      gap: 8,
    }}>
      <span style={{ color: 'var(--color-text-muted)', fontSize: 13 }}>{label}</span>
      <span style={{ fontSize: 32, fontWeight: 700, color: color ?? 'var(--color-text)' }}>{value}</span>
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  return (
    <span style={{
      background: `${STATUS_COLORS[status] ?? '#64748b'}22`,
      color: STATUS_COLORS[status] ?? '#64748b',
      border: `1px solid ${STATUS_COLORS[status] ?? '#64748b'}44`,
      borderRadius: 4,
      padding: '2px 10px',
      fontSize: 12,
      fontWeight: 600,
    }}>{status}</span>
  )
}

export function AdminPanel({ navigate }: { navigate: (p: Page) => void }) {
  const [tenants, setTenants] = useState<Tenant[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const LIMIT = 20

  async function fetchData() {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: String(LIMIT),
        ...(search ? { search } : {}),
      })
      const [tenantsRes, statsRes] = await Promise.all([
        fetch(`${API}/tenants?${params}`),
        fetch(`${API}/stats`),
      ])
      const tenantsData = await tenantsRes.json()
      const statsData = await statsRes.json()
      setTenants(tenantsData.tenants ?? [])
      setTotal(tenantsData.pagination?.total ?? 0)
      setStats(statsData.stats ?? null)
    } catch {
      setError('Erro ao carregar dados. Verifique se você tem role gravity_admin.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchData() }, [page, search])

  async function updateStatus(id: string, status: string) {
    await fetch(`${API}/tenants/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    fetchData()
  }

  return (
    <div style={{ maxWidth: 1280, margin: '0 auto', padding: '32px 24px' }}>
      {/* Header */}
      <div style={{ marginBottom: 32, display: 'flex', alignItems: 'center', gap: 16 }}>
        <div style={{
          width: 40, height: 40,
          background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
          borderRadius: 10,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 20,
        }}>⚡</div>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--color-text)' }}>
            Gravity Admin Panel
          </h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: 14 }}>
            Gestão global de tenants · Apenas gravity_admin
          </p>
        </div>
      </div>

      {/* Stats */}
      {stats && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 16,
          marginBottom: 32,
        }}>
          <StatCard label="Total de Tenants" value={stats.totalTenants} />
          <StatCard label="Tenants Ativos" value={stats.activeTenants} color="#10b981" />
          <StatCard label="Suspensos" value={stats.suspendedTenants} color="#f59e0b" />
          <StatCard label="Total de Usuários" value={stats.totalUsers} color="#6366f1" />
        </div>
      )}

      {/* Search */}
      <div style={{ marginBottom: 20, display: 'flex', gap: 12, alignItems: 'center' }}>
        <input
          type="search"
          placeholder="Buscar por nome ou slug..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1) }}
          style={{
            flex: 1,
            background: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius)',
            color: 'var(--color-text)',
            padding: '10px 14px',
            fontSize: 14,
            fontFamily: 'var(--font)',
            outline: 'none',
          }}
        />
        <span style={{ color: 'var(--color-text-muted)', fontSize: 13 }}>
          {total} tenant{total !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Error */}
      {error && (
        <div style={{
          background: '#ef444422',
          border: '1px solid #ef444444',
          borderRadius: 'var(--radius)',
          padding: '12px 16px',
          color: '#ef4444',
          marginBottom: 20,
        }}>{error}</div>
      )}

      {/* Table */}
      <div style={{
        background: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius)',
        overflow: 'hidden',
      }}>
        {loading ? (
          <div style={{ padding: 48, textAlign: 'center', color: 'var(--color-text-muted)' }}>
            Carregando...
          </div>
        ) : tenants.length === 0 ? (
          <div style={{ padding: 48, textAlign: 'center', color: 'var(--color-text-muted)' }}>
            Nenhum tenant encontrado
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
                {['Nome', 'Slug', 'Status', 'Plano', 'Usuários', 'Empresas', 'Ações'].map(h => (
                  <th key={h} style={{
                    padding: '12px 16px',
                    textAlign: 'left',
                    fontSize: 12,
                    fontWeight: 600,
                    color: 'var(--color-text-muted)',
                    letterSpacing: '0.05em',
                    textTransform: 'uppercase',
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {tenants.map((t, i) => (
                <tr
                  key={t.id}
                  style={{
                    borderBottom: i < tenants.length - 1 ? '1px solid var(--color-border)' : 'none',
                    transition: 'background 0.15s',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--color-surface-2)')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                >
                  <td style={{ padding: '14px 16px', fontWeight: 600 }}>{t.name}</td>
                  <td style={{ padding: '14px 16px', color: 'var(--color-text-muted)', fontFamily: 'monospace' }}>
                    {t.slug}
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <StatusBadge status={t.status} />
                  </td>
                  <td style={{ padding: '14px 16px', color: 'var(--color-text-muted)' }}>
                    {t.subscriptions[0]?.plan ?? '—'}
                  </td>
                  <td style={{ padding: '14px 16px', textAlign: 'center' }}>{t._count.users}</td>
                  <td style={{ padding: '14px 16px', textAlign: 'center' }}>{t._count.companies}</td>
                  <td style={{ padding: '14px 16px' }}>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button
                        onClick={() => navigate({ name: 'tenant-detail', tenantId: t.id })}
                        style={{
                          background: 'transparent',
                          border: '1px solid var(--color-border)',
                          borderRadius: 6,
                          color: 'var(--color-text)',
                          padding: '6px 12px',
                          cursor: 'pointer',
                          fontSize: 13,
                          fontFamily: 'var(--font)',
                          transition: 'border-color 0.15s',
                        }}
                      >
                        Detalhes
                      </button>
                      {t.status === 'ACTIVE' ? (
                        <button
                          onClick={() => updateStatus(t.id, 'SUSPENDED')}
                          style={{
                            background: '#f59e0b22',
                            border: '1px solid #f59e0b44',
                            borderRadius: 6,
                            color: '#f59e0b',
                            padding: '6px 12px',
                            cursor: 'pointer',
                            fontSize: 13,
                            fontFamily: 'var(--font)',
                          }}
                        >
                          Suspender
                        </button>
                      ) : (
                        <button
                          onClick={() => updateStatus(t.id, 'ACTIVE')}
                          style={{
                            background: '#10b98122',
                            border: '1px solid #10b98144',
                            borderRadius: 6,
                            color: '#10b981',
                            padding: '6px 12px',
                            cursor: 'pointer',
                            fontSize: 13,
                            fontFamily: 'var(--font)',
                          }}
                        >
                          Reativar
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {total > LIMIT && (
        <div style={{ marginTop: 16, display: 'flex', gap: 8, justifyContent: 'center' }}>
          <button
            disabled={page === 1}
            onClick={() => setPage(p => p - 1)}
            style={{
              background: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              borderRadius: 6,
              color: page === 1 ? 'var(--color-text-muted)' : 'var(--color-text)',
              padding: '8px 16px',
              cursor: page === 1 ? 'not-allowed' : 'pointer',
              fontFamily: 'var(--font)',
            }}
          >
            ← Anterior
          </button>
          <span style={{
            padding: '8px 16px',
            color: 'var(--color-text-muted)',
            fontSize: 14,
            display: 'flex',
            alignItems: 'center',
          }}>
            Página {page} de {Math.ceil(total / LIMIT)}
          </span>
          <button
            disabled={page >= Math.ceil(total / LIMIT)}
            onClick={() => setPage(p => p + 1)}
            style={{
              background: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              borderRadius: 6,
              color: page >= Math.ceil(total / LIMIT) ? 'var(--color-text-muted)' : 'var(--color-text)',
              padding: '8px 16px',
              cursor: page >= Math.ceil(total / LIMIT) ? 'not-allowed' : 'pointer',
              fontFamily: 'var(--font)',
            }}
          >
            Próxima →
          </button>
        </div>
      )}
    </div>
  )
}
