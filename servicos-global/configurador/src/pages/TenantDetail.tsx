// src/pages/TenantDetail.tsx
// Detalhes de um tenant — usuários, empresas filhas, assinatura, produtos habilitados

import { useState, useEffect } from 'react'

interface User {
  id: string
  name: string
  email: string
  role: string
  created_at: string
}

interface Company {
  id: string
  name: string
  subdomain: string | null
  status: string
}

interface TenantData {
  id: string
  name: string
  slug: string
  status: string
  created_at: string
  users: User[]
  companies: Company[]
  subscriptions: Array<{ plan: string; status: string; trial_ends_at: string | null }>
  product_configs: Array<{ product_key: string; is_active: boolean; updated_at: string }>
}

export function TenantDetail({ tenantId, onBack }: { tenantId: string; onBack: () => void }) {
  const [tenant, setTenant] = useState<TenantData | null>(null)
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<'users' | 'companies' | 'billing' | 'products'>('users')

  useEffect(() => {
    fetch(`/api/admin/tenants/${tenantId}`)
      .then((r) => r.json())
      .then((d) => setTenant(d.tenant))
      .finally(() => setLoading(false))
  }, [tenantId])

  const tabStyle = (active: boolean): React.CSSProperties => ({
    padding: '8px 18px',
    color: active ? 'var(--color-primary)' : 'var(--color-text-muted)',
    fontWeight: active ? 600 : 400,
    cursor: 'pointer',
    background: 'transparent',
    border: 'none',
    borderBottom: `2px solid ${active ? 'var(--color-primary)' : 'transparent'}`,
    fontFamily: 'var(--font)',
    fontSize: 14,
    transition: 'color 0.15s',
  })

  if (loading) {
    return (
      <div style={{ padding: 48, textAlign: 'center', color: 'var(--color-text-muted)' }}>
        Carregando...
      </div>
    )
  }

  if (!tenant) {
    return (
      <div style={{ padding: 48, textAlign: 'center', color: '#ef4444' }}>
        Tenant não encontrado.
        <br />
        <button onClick={onBack} style={{ marginTop: 16, color: 'var(--color-primary)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font)' }}>
          ← Voltar
        </button>
      </div>
    )
  }

  const sub = tenant.subscriptions[0]

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 24px' }}>
      {/* Back */}
      <button
        onClick={onBack}
        style={{
          background: 'transparent',
          border: 'none',
          color: 'var(--color-text-muted)',
          cursor: 'pointer',
          fontSize: 14,
          fontFamily: 'var(--font)',
          marginBottom: 20,
          display: 'flex',
          alignItems: 'center',
          gap: 6,
        }}
      >
        ← Todos os tenants
      </button>

      {/* Header tenant */}
      <div style={{
        background: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius)',
        padding: 24,
        marginBottom: 24,
        display: 'flex',
        alignItems: 'center',
        gap: 20,
      }}>
        <div style={{
          width: 56,
          height: 56,
          background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
          borderRadius: 14,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 24,
        }}>🏢</div>
        <div style={{ flex: 1 }}>
          <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 4 }}>{tenant.name}</h2>
          <div style={{ display: 'flex', gap: 16, color: 'var(--color-text-muted)', fontSize: 13 }}>
            <span>slug: <code style={{ color: 'var(--color-text)' }}>{tenant.slug}</code></span>
            {sub && <span>Plano: <strong style={{ color: 'var(--color-primary)' }}>{sub.plan}</strong></span>}
            {sub && <span>Assinatura: <strong>{sub.status}</strong></span>}
          </div>
        </div>
        <div style={{
          background: tenant.status === 'ACTIVE' ? '#10b98122' : '#f59e0b22',
          color: tenant.status === 'ACTIVE' ? '#10b981' : '#f59e0b',
          border: `1px solid ${tenant.status === 'ACTIVE' ? '#10b98144' : '#f59e0b44'}`,
          borderRadius: 6,
          padding: '6px 14px',
          fontSize: 13,
          fontWeight: 600,
        }}>
          {tenant.status}
        </div>
      </div>

      {/* Tabs */}
      <div style={{
        display: 'flex',
        gap: 0,
        borderBottom: '1px solid var(--color-border)',
        marginBottom: 24,
      }}>
        {(['users', 'companies', 'billing', 'products'] as const).map((t) => (
          <button key={t} style={tabStyle(tab === t)} onClick={() => setTab(t)}>
            {{ users: `Usuários (${tenant.users.length})`, companies: `Empresas (${tenant.companies.length})`, billing: 'Faturamento', products: 'Produtos' }[t]}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div style={{
        background: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius)',
        overflow: 'hidden',
      }}>
        {tab === 'users' && (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
                {['Nome', 'Email', 'Role', 'Criado em'].map(h => (
                  <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {tenant.users.map((u, i) => (
                <tr key={u.id} style={{ borderBottom: i < tenant.users.length - 1 ? '1px solid var(--color-border)' : 'none' }}>
                  <td style={{ padding: '13px 16px', fontWeight: 500 }}>{u.name}</td>
                  <td style={{ padding: '13px 16px', color: 'var(--color-text-muted)' }}>{u.email}</td>
                  <td style={{ padding: '13px 16px' }}>
                    <span style={{ background: '#6366f122', color: '#818cf8', borderRadius: 4, padding: '2px 8px', fontSize: 12, fontWeight: 600 }}>{u.role}</span>
                  </td>
                  <td style={{ padding: '13px 16px', color: 'var(--color-text-muted)', fontSize: 13 }}>
                    {new Date(u.created_at).toLocaleDateString('pt-BR')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {tab === 'companies' && (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
                {['Nome', 'Subdomínio', 'Status'].map(h => (
                  <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {tenant.companies.map((c, i) => (
                <tr key={c.id} style={{ borderBottom: i < tenant.companies.length - 1 ? '1px solid var(--color-border)' : 'none' }}>
                  <td style={{ padding: '13px 16px', fontWeight: 500 }}>{c.name}</td>
                  <td style={{ padding: '13px 16px', color: 'var(--color-text-muted)', fontFamily: 'monospace' }}>
                    {c.subdomain ?? '—'}
                  </td>
                  <td style={{ padding: '13px 16px' }}>
                    <span style={{ background: c.status === 'ACTIVE' ? '#10b98122' : '#ef444422', color: c.status === 'ACTIVE' ? '#10b981' : '#ef4444', borderRadius: 4, padding: '2px 8px', fontSize: 12, fontWeight: 600 }}>
                      {c.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {tab === 'billing' && (
          <div style={{ padding: 24 }}>
            {sub ? (
              <div style={{ display: 'grid', gap: 16 }}>
                <div style={{ display: 'flex', gap: 12 }}>
                  {[
                    { label: 'Plano', value: sub.plan },
                    { label: 'Status', value: sub.status },
                    { label: 'Trial termina em', value: sub.trial_ends_at ? new Date(sub.trial_ends_at).toLocaleDateString('pt-BR') : 'N/A' },
                  ].map(({ label, value }) => (
                    <div key={label} style={{ flex: 1, background: 'var(--color-surface-2)', borderRadius: 'var(--radius)', padding: 16 }}>
                      <div style={{ color: 'var(--color-text-muted)', fontSize: 12, marginBottom: 6 }}>{label}</div>
                      <div style={{ fontWeight: 600, fontSize: 16 }}>{value}</div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p style={{ color: 'var(--color-text-muted)' }}>Sem assinatura registrada.</p>
            )}
          </div>
        )}

        {tab === 'products' && (
          tenant.product_configs.length === 0 ? (
            <div style={{ padding: 32, textAlign: 'center', color: 'var(--color-text-muted)' }}>
              Nenhum produto configurado para este tenant.
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
                  {['Produto', 'Status', 'Atualizado em'].map(h => (
                    <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {tenant.product_configs.map((p, i) => (
                  <tr key={p.product_key} style={{ borderBottom: i < tenant.product_configs.length - 1 ? '1px solid var(--color-border)' : 'none' }}>
                    <td style={{ padding: '13px 16px', fontWeight: 500, fontFamily: 'monospace' }}>{p.product_key}</td>
                    <td style={{ padding: '13px 16px' }}>
                      <span style={{ background: p.is_active ? '#10b98122' : '#64748b22', color: p.is_active ? '#10b981' : '#64748b', borderRadius: 4, padding: '2px 8px', fontSize: 12 }}>
                        {p.is_active ? 'Habilitado' : 'Desabilitado'}
                      </span>
                    </td>
                    <td style={{ padding: '13px 16px', color: 'var(--color-text-muted)', fontSize: 13 }}>
                      {new Date(p.updated_at).toLocaleDateString('pt-BR')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )
        )}
      </div>
    </div>
  )
}
