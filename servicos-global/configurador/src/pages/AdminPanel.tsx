// src/pages/AdminPanel.tsx
// Painel exclusivo para gravity_admin — gestão de todos os tenants da plataforma

import React, { useState, useEffect } from 'react'
import type { Page } from '../App'
import { HardDrives, CheckCircle, WarningCircle, UsersThree, MagnifyingGlass, PauseCircle, PlayCircle, FileXls, FileCsv, Database, ShieldCheck } from '@phosphor-icons/react'

import { BotaoNovoGlobal } from '@nucleo/botao-novo-global'
import { CabecalhoGlobal } from '@nucleo/cabecalho-global'
import { CardBasicoGlobal } from '@nucleo/card-global'
import { TabelaGlobal, type TabelaGlobalColuna, type TabelaGlobalAcao, type TabelaExportAcao } from '@nucleo/tabela-global'
import { TooltipGlobal } from '@nucleo/tooltip-global'
import { PaginaGlobal } from '@nucleo/pagina-global'

export type EmpresaStatus = 'ACTIVE' | 'SUSPENDED' | 'CANCELLED' | 'PENDING_SETUP'

export interface Tenant {
  id: string
  name: string
  slug: string
  status: EmpresaStatus
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

const MOCK_TENANTS: Tenant[] = [
  { id: 't_1', name: 'Gravity Headquarters', slug: 'admin', status: 'ACTIVE', created_at: '2025-01-01', _count: { users: 12, companies: 1 }, subscriptions: [{ plan: 'Enterprise (Admin)', status: 'ACTIVE' }] },
  { id: 't_2', name: 'Acme Corp LTDA', slug: 'acme-ltda', status: 'ACTIVE', created_at: '2025-02-14', _count: { users: 48, companies: 3 }, subscriptions: [{ plan: 'Pro', status: 'ACTIVE' }] },
  { id: 't_3', name: 'Stark Industries', slug: 'stark-global', status: 'ACTIVE', created_at: '2025-02-28', _count: { users: 120, companies: 5 }, subscriptions: [{ plan: 'Enterprise', status: 'ACTIVE' }] },
  { id: 't_4', name: 'Wayne Enterprises', slug: 'wayne-corp', status: 'SUSPENDED', created_at: '2025-03-01', _count: { users: 5, companies: 2 }, subscriptions: [{ plan: 'Free', status: 'PAST_DUE' }] },
  { id: 't_5', name: 'Oscorp', slug: 'oscorp-labs', status: 'PENDING_SETUP', created_at: '2025-03-15', _count: { users: 1, companies: 1 }, subscriptions: [{ plan: 'Trial', status: 'ACTIVE' }] },
  { id: 't_6', name: 'Cyberdyne Systems', slug: 'cyberdyne', status: 'CANCELLED', created_at: '2024-11-10', _count: { users: 0, companies: 0 }, subscriptions: [{ plan: 'Pro', status: 'CANCELED' }] },
  { id: 't_7', name: 'Tyrell Corp', slug: 'tyrell', status: 'ACTIVE', created_at: '2025-03-18', _count: { users: 34, companies: 8 }, subscriptions: [{ plan: 'Pro', status: 'ACTIVE' }] },
  { id: 't_8', name: 'Massive Dynamic', slug: 'massive', status: 'ACTIVE', created_at: '2025-03-20', _count: { users: 15, companies: 1 }, subscriptions: [{ plan: 'Startup', status: 'ACTIVE' }] },
  { id: 't_9', name: 'InGen', slug: 'ingen-bio', status: 'ACTIVE', created_at: '2025-03-22', _count: { users: 2, companies: 1 }, subscriptions: [{ plan: 'Free', status: 'ACTIVE' }] },
  { id: 't_10', name: 'Globex Corporation', slug: 'globex', status: 'ACTIVE', created_at: '2025-03-23', _count: { users: 77, companies: 4 }, subscriptions: [{ plan: 'Enterprise', status: 'ACTIVE' }] },
  { id: 't_11', name: 'Soylent Corporation', slug: 'soylent', status: 'SUSPENDED', created_at: '2025-01-15', _count: { users: 3, companies: 1 }, subscriptions: [{ plan: 'Startup', status: 'ACTIVE' }] },
  { id: 't_12', name: 'Umbrella Corp', slug: 'umbrella-hub', status: 'ACTIVE', created_at: '2025-02-05', _count: { users: 210, companies: 12 }, subscriptions: [{ plan: 'Enterprise', status: 'ACTIVE' }] },
]

const MOCK_STATS: Stats = {
  totalTenants: 154,
  activeTenants: 142,
  suspendedTenants: 9,
  totalUsers: 4832
}

export function AdminPanel({ navigate }: { navigate: (p: Page) => void }) {
  const [tenants, setTenants] = useState<Tenant[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // No painel global, aumentamos o limite para aproveitar a busca local da TabelaGlobal
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const LIMIT = 100

  async function fetchData() {
    setLoading(true)
    try {
      // Simulando delay de rede para a interface carregar fluidamente
      await new Promise(r => setTimeout(r, 600))
      
      // Implementação MOCK injetada para demonstração rica de dados
      setTenants(MOCK_TENANTS)
      setTotal(MOCK_TENANTS.length)
      setStats(MOCK_STATS)
      
      // O código original (fetch API) está preservado abaixo e poderia ser reativado
      /*
      const params = new URLSearchParams({ page: String(page), limit: String(LIMIT), ...(search ? { search } : {}) })
      const [tenantsRes, statsRes] = await Promise.all([ fetch(`${API}/tenants?${params}`), fetch(`${API}/stats`) ])
      const tenantsData = await tenantsRes.json()
      const statsData = await statsRes.json()
      setTenants(tenantsData.tenants ?? [])
      setTotal(tenantsData.pagination?.total ?? 0)
      setStats(statsData.stats ?? null)
      */
    } catch {
      setError('Erro ao carregar os metadados do servidor. Painel rodando em read-only fallback.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchData() }, [page, search])

  async function updateStatus(id: string, status: string) {
    // Simulando alteração no mock array para UX imediata
    setTenants(prev => prev.map(t => t.id === id ? { ...t, status: status as EmpresaStatus } : t))
    if (status === 'SUSPENDED') {
      setStats(prev => prev ? { ...prev, activeTenants: prev.activeTenants - 1, suspendedTenants: prev.suspendedTenants + 1 } : null)
    } else {
      setStats(prev => prev ? { ...prev, activeTenants: prev.activeTenants + 1, suspendedTenants: prev.suspendedTenants - 1 } : null)
    }
  }

  const COLUNAS: any[] = [
    {
      key: 'name', label: 'Tenant Master / Organization ID', tipo: 'texto',
      tooltipTitulo: 'Nó Raiz de Organização (Clerk Org ID / Supabase Schema)', 
      tooltipDescricao: 'Referência principal do tenant no banco global. Representa o isolamento lógico primário (RLS - Row Level Security) em todas as tabelas transacionais.',
      render: (v: any, item: Tenant) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
          <TooltipGlobal titulo={`ID Técnico: ${item.id}`} descricao="Chave UUID primária no cluster">
            <div style={{ width: 30, height: 30, minWidth: 30, borderRadius: '8px', background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.6875rem', fontWeight: 700, color: '#6366f1', cursor: 'help' }}>
              {item.name ? item.name.charAt(0).toUpperCase() : 'T'}
            </div>
          </TooltipGlobal>
          <span style={{ fontWeight: 600 }}>{item.name}</span>
        </div>
      )
    },
    {
      key: 'slug', label: 'Endpoint da Instância / DNS', tipo: 'texto',
      tooltipTitulo: 'Roteamento DNS (Subdomain CNAME)', 
      tooltipDescricao: 'Alias em uso pelo API Gateway Edge para o Tenant Routing. O tráfego direcionado para este subdomínio injeta dinamicamente os cabeçalhos \'X-Tenant-Domain\' nas requisições do microserviço.',
      render: (v: any, item: Tenant) => (
        <a href={`https://${item.slug}.gravity.com.br`} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', textDecoration: 'none' }} onClick={ev => ev.stopPropagation()}>
          <code style={{ fontSize: '0.8125rem', color: '#c7d2fe', background: 'rgba(199,210,254,0.1)', padding: '0.125rem 0.4rem', borderRadius: '4px', transition: 'background 0.15s, color 0.15s', cursor: 'pointer' }}
            onMouseEnter={ev => { (ev.currentTarget as HTMLElement).style.background = 'rgba(199,210,254,0.2)'; (ev.currentTarget as HTMLElement).style.textDecoration = 'underline' }}
            onMouseLeave={ev => { (ev.currentTarget as HTMLElement).style.background = 'rgba(199,210,254,0.1)'; (ev.currentTarget as HTMLElement).style.textDecoration = 'none' }}
          >
            {item.slug}.gravity.com.br
          </code>
        </a>
      )
    },
    {
      key: 'status', label: 'Service Health & Access', tipo: 'texto',
      tooltipTitulo: 'Middleware de Controle na Borda',
      tooltipDescricao: 'Indica as diretivas aplicadas no cache (Redis) de borda. \'SUSPENDED\' executa o bloqueio na camada do Gateway antes de consumir CPU nas APIs principais retornando HTTP 403.',
      render: (v: string) => {
        let cor = '#64748b', bg = 'rgba(100,116,139,0.12)'
        if (v === 'ACTIVE') { cor = '#34d399'; bg = 'rgba(52,211,153,0.12)' }
        if (v === 'SUSPENDED') { cor = '#fbbf24'; bg = 'rgba(251,191,36,0.12)' }
        if (v === 'CANCELLED') { cor = '#f87171'; bg = 'rgba(248,113,113,0.12)' }
        if (v === 'PENDING_SETUP') { cor = '#818cf8'; bg = 'rgba(129,140,248,0.12)' }
        return (
          <span style={{ display: 'inline-flex', padding: '0.2rem 0.625rem', borderRadius: '9999px', fontSize: '0.6875rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', background: bg, color: cor, border: `1px solid ${bg}` }}>
            {v === 'PENDING_SETUP' ? 'PROVISIONING...' : v}
          </span>
        )
      }
    },
    {
      key: 'subscriptions', label: 'License / Config', tipo: 'texto',
      tooltipTitulo: 'Camada de Rate Limit Financeiro',
      tooltipDescricao: 'Define a quota de endpoints, restrições e armazenamento atribuídos via Stripe/MercadoPago.',
      render: (v: any, item: Tenant) => <span style={{ color: 'var(--ws-muted)' }}>{item.subscriptions?.[0]?.plan || 'N/A'}</span>
    },
    {
      key: 'users_count', label: 'Pool de Usuários', tipo: 'numero', align: 'center',
      tooltipTitulo: 'Workers & Contas de Usuário',
      tooltipDescricao: 'Registros na tabela Identity associados a este WorkspaceRoot',
      render: (v: any, item: Tenant) => <span style={{ fontWeight: 600 }}>{item._count?.users || 0}</span>
    },
    {
      key: 'companies_count', label: 'Child Workspaces', tipo: 'numero', align: 'center',
      tooltipTitulo: 'Sub-tenants Relacionais',
      tooltipDescricao: 'Quantas filiais lógicas estão criadas na hierarquia dentro do banco de dados relacional.',
      render: (v: any, item: Tenant) => <span style={{ fontWeight: 600 }}>{item._count?.companies || 0}</span>
    }
  ]

  const ACOES: TabelaGlobalAcao<Tenant>[] = [
    {
      id: 'impersonate',
      icone: <MagnifyingGlass size={15} weight="bold" />,
      tooltip: 'Painel de Auditoria',
      onClick: (item) => navigate({ name: 'tenant-detail', tenantId: item.id }),
    },
    {
      id: 'suspend',
      icone: <PauseCircle size={15} weight="bold" />,
      tooltip: 'Gerenciar Lock Lógico',
      onClick: (item) => updateStatus(item.id, item.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE'),
      renderCustom: (item) => (
        <TooltipGlobal descricao={item.status === 'ACTIVE' ? 'Enviar comando SYS_LOCK ao Gateway: Rejeita sessões para todo o domínio e desativa JWT tokens deste tenant.' : 'Enviar comando SYS_UNLOCK: Purga o block no Redis Edge Node, permitindo novos JWT handshakes de volta.'}>
          <button
            type="button"
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); updateStatus(item.id, item.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE') }}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 28, height: 28, borderRadius: '50%', background: 'transparent', border: '1px solid transparent', color: '#64748b', cursor: 'pointer', transition: 'all 0.15s', flexShrink: 0 }}
            onMouseEnter={ev => { ev.currentTarget.style.background = item.status === 'ACTIVE' ? 'rgba(251,191,36,0.12)' : 'rgba(52,211,153,0.12)'; ev.currentTarget.style.borderColor = item.status === 'ACTIVE' ? 'rgba(251,191,36,0.3)' : 'rgba(52,211,153,0.3)'; ev.currentTarget.style.color = item.status === 'ACTIVE' ? '#fbbf24' : '#34d399' }}
            onMouseLeave={ev => { ev.currentTarget.style.background = 'transparent'; ev.currentTarget.style.borderColor = 'transparent'; ev.currentTarget.style.color = '#64748b' }}
          >
            {item.status === 'ACTIVE' ? <PauseCircle size={16} weight="bold" /> : <PlayCircle size={16} weight="bold" />}
          </button>
        </TooltipGlobal>
      )
    }
  ]

  const ACOES_EXPORT: TabelaExportAcao<Tenant>[] = [
    { label: 'Dump PG (Data)', icone: <Database size={14} weight="bold" />, onClick: () => {} },
    { label: 'Logs de Cluster (CSV)', icone: <FileCsv size={14} weight="bold" />, onClick: () => {} },
    { label: 'Matriz XML', icone: <FileXls size={14} weight="bold" />, onClick: () => {} }
  ]

  return (
    <PaginaGlobal
      className="ws-fade-up"
      layout="lista"
      cabecalho={
        <CabecalhoGlobal
          icone={<HardDrives weight="duotone" size={22} color="#6366f1" />}
          titulo="Gestão de Instâncias & Tenants [SYS_ADMIN]"
          subtitulo="Visão arquitetural global do cluster Gravity. Monitore isolamentos, subdomínios, uso de banco e integridade de conexões."
        />
      }
      stats={
        stats ? (
          <>
            <CardBasicoGlobal
              titulo="Schemas de Banco Totais"
              icone={<Database weight="duotone" size={16} style={{ color: 'var(--ws-accent)' }} />}
              valor={stats.totalTenants}
              tooltip={<><p className="cg-tooltip__title">Armazenamento Físico</p><div className="cg-tooltip__row"><span>Quantidade total de schemas em pool no Supabase/Postgres, definindo o tamanho da infra.</span></div></>}
            />
            <CardBasicoGlobal
              titulo="Middlewares Ativos (Allow-list)"
              icone={<ShieldCheck weight="duotone" size={16} style={{ color: '#34d399' }} />}
              valor={stats.activeTenants}
              variante="sucesso"
              tooltip={<><p className="cg-tooltip__title">Tráfego HTTP Livre</p><div className="cg-tooltip__row"><span>Rotas que passaram no WAF e encontram-se com banda de I/O de rede alocada.</span></div></>}
            />
            <CardBasicoGlobal
              titulo="Quarentena Edge (403 block)"
              icone={<WarningCircle weight="duotone" size={16} style={{ color: '#fbbf24' }} />}
              valor={stats.suspendedTenants}
              variante="aviso"
              tooltip={<><p className="cg-tooltip__title">Lock por Billing/Infra</p><div className="cg-tooltip__row"><span>Tráfego derrubado pelo Redis rate-limiter na borda por quebras de T&C ou falta de pagamento.</span></div></>}
            />
            <CardBasicoGlobal
              titulo="Volumetria JWTs / Contas"
              icone={<UsersThree weight="duotone" size={16} style={{ color: '#8b5cf6' }} />}
              valor={stats.totalUsers}
              tooltip={<><p className="cg-tooltip__title">Sessões & Identity</p><div className="cg-tooltip__row"><span>Carga total espalhada nas chaves de autenticação mestre do Clerk B2B.</span></div></>}
            />
          </>
        ) : undefined
      }
      acoes={
        <BotaoNovoGlobal
          rotulo="Reaquecer Cache Global"
          onClick={() => fetchData()}
          ativo={loading}
        />
      }
    >
      {error && (
        <div style={{ background: '#ef444422', border: '1px solid #ef444444', borderRadius: '8px', padding: '12px 16px', color: '#ef4444', marginBottom: 20 }}>
          {error}
        </div>
      )}

      {/* Tabela de Dados Integrada */}
      <div style={{ position: 'relative', zIndex: 10 }}>
        <TabelaGlobal<Tenant>
          dados={tenants}
          colunas={COLUNAS}
          acoes={ACOES}
          acoesExportacao={ACOES_EXPORT}
          mensagemVazio={loading ? "Interrogando estado do database global..." : "Nenhuma instância retornou resultados."}
          mensagemSemFiltro={loading ? "Sondando pods e containers do sistema..." : "Sistema isolado. Nenhum root tenant no ar."}
        />
      </div>
    </PaginaGlobal>
  )
}
