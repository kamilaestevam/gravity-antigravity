// src/pages/AdminPanel.tsx
// Painel exclusivo para gravity_admin — gestão de todos os tenants da plataforma

import React, { useState, useEffect } from 'react'
import type { Page } from '../App'
import { HardDrives, WarningCircle, UsersThree, MagnifyingGlass, PauseCircle, PlayCircle, FileXls, FileCsv, Database, ShieldCheck, Buildings } from '@phosphor-icons/react'

import { BotaoNovoAdminGlobal } from '../../../../nucleo-global/botao-novo-admin-global/src/index'
import { CabecalhoGlobal } from '@nucleo/cabecalho-global'
import { CardBasicoGlobal } from '@nucleo/card-global'
import { TabelaCamadasGlobal, type TCGColuna, type TCGAcao, type TCGAcaoExport } from '@nucleo/tabela-camadas-global'
import { TooltipGlobal } from '@nucleo/tooltip-global'
import { PaginaGlobal } from '@nucleo/pagina-global'

// ─── Tipos ────────────────────────────────────────────────────────────────────

export type EmpresaStatus = 'ACTIVE' | 'SUSPENDED' | 'CANCELLED' | 'PENDING_SETUP'

export interface Workspace {
  id: string
  name: string
  slug: string
  status: EmpresaStatus
  usuarios: number
  plano: string
  criado_em: string
}

export interface Tenant {
  id: string
  name: string
  slug: string
  status: EmpresaStatus
  created_at: string
  _count: { users: number; companies: number }
  subscriptions: Array<{ plan: string; status: string }>
  workspaces: Workspace[]
}

interface Stats {
  totalTenants: number
  activeTenants: number
  suspendedTenants: number
  totalUsers: number
}

const API = '/api/admin'

// ─── Mock ─────────────────────────────────────────────────────────────────────

const MOCK_TENANTS: Tenant[] = [
  {
    id: 't_1', name: 'Gravity Headquarters', slug: 'admin', status: 'ACTIVE',
    created_at: '2025-01-01', _count: { users: 12, companies: 1 },
    subscriptions: [{ plan: 'Enterprise (Admin)', status: 'ACTIVE' }],
    workspaces: [
      { id: 'ws_1_1', name: 'Núcleo Central', slug: 'admin', status: 'ACTIVE', usuarios: 12, plano: 'Enterprise (Admin)', criado_em: '2025-01-01' },
    ]
  },
  {
    id: 't_2', name: 'Acme Corp LTDA', slug: 'acme-ltda', status: 'ACTIVE',
    created_at: '2025-02-14', _count: { users: 48, companies: 3 },
    subscriptions: [{ plan: 'Pro', status: 'ACTIVE' }],
    workspaces: [
      { id: 'ws_2_1', name: 'Acme São Paulo', slug: 'acme-sp', status: 'ACTIVE', usuarios: 22, plano: 'Pro', criado_em: '2025-02-14' },
      { id: 'ws_2_2', name: 'Acme Rio de Janeiro', slug: 'acme-rj', status: 'ACTIVE', usuarios: 18, plano: 'Pro', criado_em: '2025-02-20' },
      { id: 'ws_2_3', name: 'Acme Campinas', slug: 'acme-cps', status: 'SUSPENDED', usuarios: 8, plano: 'Pro', criado_em: '2025-03-01' },
    ]
  },
  {
    id: 't_3', name: 'Stark Industries', slug: 'stark-global', status: 'ACTIVE',
    created_at: '2025-02-28', _count: { users: 120, companies: 5 },
    subscriptions: [{ plan: 'Enterprise', status: 'ACTIVE' }],
    workspaces: [
      { id: 'ws_3_1', name: 'Stark NY', slug: 'stark-ny', status: 'ACTIVE', usuarios: 40, plano: 'Enterprise', criado_em: '2025-02-28' },
      { id: 'ws_3_2', name: 'Stark Malibu', slug: 'stark-ml', status: 'ACTIVE', usuarios: 30, plano: 'Enterprise', criado_em: '2025-03-02' },
      { id: 'ws_3_3', name: 'Stark Europe', slug: 'stark-eu', status: 'ACTIVE', usuarios: 25, plano: 'Enterprise', criado_em: '2025-03-05' },
      { id: 'ws_3_4', name: 'Stark Asia', slug: 'stark-as', status: 'ACTIVE', usuarios: 20, plano: 'Enterprise', criado_em: '2025-03-10' },
      { id: 'ws_3_5', name: 'Stark Labs', slug: 'stark-labs', status: 'PENDING_SETUP', usuarios: 5, plano: 'Enterprise', criado_em: '2025-03-20' },
    ]
  },
  {
    id: 't_4', name: 'Wayne Enterprises', slug: 'wayne-corp', status: 'SUSPENDED',
    created_at: '2025-03-01', _count: { users: 5, companies: 2 },
    subscriptions: [{ plan: 'Free', status: 'PAST_DUE' }],
    workspaces: [
      { id: 'ws_4_1', name: 'Wayne Corp HQ', slug: 'wayne-hq', status: 'SUSPENDED', usuarios: 3, plano: 'Free', criado_em: '2025-03-01' },
      { id: 'ws_4_2', name: 'Wayne Foundation', slug: 'wayne-fnd', status: 'SUSPENDED', usuarios: 2, plano: 'Free', criado_em: '2025-03-05' },
    ]
  },
  {
    id: 't_5', name: 'Oscorp', slug: 'oscorp-labs', status: 'PENDING_SETUP',
    created_at: '2025-03-15', _count: { users: 1, companies: 1 },
    subscriptions: [{ plan: 'Trial', status: 'ACTIVE' }],
    workspaces: [
      { id: 'ws_5_1', name: 'Oscorp Labs', slug: 'oscorp-labs', status: 'PENDING_SETUP', usuarios: 1, plano: 'Trial', criado_em: '2025-03-15' },
    ]
  },
  {
    id: 't_6', name: 'Cyberdyne Systems', slug: 'cyberdyne', status: 'CANCELLED',
    created_at: '2024-11-10', _count: { users: 0, companies: 0 },
    subscriptions: [{ plan: 'Pro', status: 'CANCELED' }],
    workspaces: []
  },
  {
    id: 't_7', name: 'Tyrell Corp', slug: 'tyrell', status: 'ACTIVE',
    created_at: '2025-03-18', _count: { users: 34, companies: 8 },
    subscriptions: [{ plan: 'Pro', status: 'ACTIVE' }],
    workspaces: [
      { id: 'ws_7_1', name: 'Tyrell Corp HQ', slug: 'tyrell-hq', status: 'ACTIVE', usuarios: 10, plano: 'Pro', criado_em: '2025-03-18' },
      { id: 'ws_7_2', name: 'Tyrell Nexus 6', slug: 'tyrell-n6', status: 'ACTIVE', usuarios: 8, plano: 'Pro', criado_em: '2025-03-20' },
      { id: 'ws_7_3', name: 'Tyrell Biodev', slug: 'tyrell-bio', status: 'ACTIVE', usuarios: 6, plano: 'Pro', criado_em: '2025-03-22' },
      { id: 'ws_7_4', name: 'Tyrell Androide', slug: 'tyrell-and', status: 'ACTIVE', usuarios: 5, plano: 'Pro', criado_em: '2025-03-24' },
      { id: 'ws_7_5', name: 'Tyrell Export', slug: 'tyrell-exp', status: 'ACTIVE', usuarios: 3, plano: 'Pro', criado_em: '2025-03-25' },
      { id: 'ws_7_6', name: 'Tyrell R&D', slug: 'tyrell-rd', status: 'PENDING_SETUP', usuarios: 1, plano: 'Pro', criado_em: '2025-03-26' },
      { id: 'ws_7_7', name: 'Tyrell Security', slug: 'tyrell-sec', status: 'ACTIVE', usuarios: 1, plano: 'Pro', criado_em: '2025-03-27' },
    ]
  },
  {
    id: 't_8', name: 'Massive Dynamic', slug: 'massive', status: 'ACTIVE',
    created_at: '2025-03-20', _count: { users: 15, companies: 1 },
    subscriptions: [{ plan: 'Startup', status: 'ACTIVE' }],
    workspaces: [
      { id: 'ws_8_1', name: 'Massive Dynamic HQ', slug: 'massive-hq', status: 'ACTIVE', usuarios: 15, plano: 'Startup', criado_em: '2025-03-20' },
    ]
  },
  {
    id: 't_9', name: 'InGen', slug: 'ingen-bio', status: 'ACTIVE',
    created_at: '2025-03-22', _count: { users: 2, companies: 1 },
    subscriptions: [{ plan: 'Free', status: 'ACTIVE' }],
    workspaces: [
      { id: 'ws_9_1', name: 'InGen Biotech', slug: 'ingen-bio', status: 'ACTIVE', usuarios: 2, plano: 'Free', criado_em: '2025-03-22' },
    ]
  },
  {
    id: 't_10', name: 'Globex Corporation', slug: 'globex', status: 'ACTIVE',
    created_at: '2025-03-23', _count: { users: 77, companies: 4 },
    subscriptions: [{ plan: 'Enterprise', status: 'ACTIVE' }],
    workspaces: [
      { id: 'ws_10_1', name: 'Globex HQ', slug: 'globex-hq', status: 'ACTIVE', usuarios: 30, plano: 'Enterprise', criado_em: '2025-03-23' },
      { id: 'ws_10_2', name: 'Globex West', slug: 'globex-w', status: 'ACTIVE', usuarios: 22, plano: 'Enterprise', criado_em: '2025-03-24' },
      { id: 'ws_10_3', name: 'Globex East', slug: 'globex-e', status: 'ACTIVE', usuarios: 15, plano: 'Enterprise', criado_em: '2025-03-25' },
      { id: 'ws_10_4', name: 'Globex Labs', slug: 'globex-l', status: 'PENDING_SETUP', usuarios: 10, plano: 'Enterprise', criado_em: '2025-03-26' },
    ]
  },
  {
    id: 't_11', name: 'Soylent Corporation', slug: 'soylent', status: 'SUSPENDED',
    created_at: '2025-01-15', _count: { users: 3, companies: 1 },
    subscriptions: [{ plan: 'Startup', status: 'ACTIVE' }],
    workspaces: [
      { id: 'ws_11_1', name: 'Soylent HQ', slug: 'soylent-hq', status: 'SUSPENDED', usuarios: 3, plano: 'Startup', criado_em: '2025-01-15' },
    ]
  },
  {
    id: 't_12', name: 'Umbrella Corp', slug: 'umbrella-hub', status: 'ACTIVE',
    created_at: '2025-02-05', _count: { users: 210, companies: 12 },
    subscriptions: [{ plan: 'Enterprise', status: 'ACTIVE' }],
    workspaces: [
      { id: 'ws_12_1',  name: 'Umbrella HQ',      slug: 'umbrella-hq',  status: 'ACTIVE', usuarios: 40, plano: 'Enterprise', criado_em: '2025-02-05' },
      { id: 'ws_12_2',  name: 'Umbrella Europe',   slug: 'umbrella-eu',  status: 'ACTIVE', usuarios: 35, plano: 'Enterprise', criado_em: '2025-02-10' },
      { id: 'ws_12_3',  name: 'Umbrella Asia',     slug: 'umbrella-as',  status: 'ACTIVE', usuarios: 30, plano: 'Enterprise', criado_em: '2025-02-12' },
      { id: 'ws_12_4',  name: 'Umbrella Americas', slug: 'umbrella-am',  status: 'ACTIVE', usuarios: 25, plano: 'Enterprise', criado_em: '2025-02-15' },
      { id: 'ws_12_5',  name: 'Umbrella Pharma',   slug: 'umbrella-ph',  status: 'ACTIVE', usuarios: 20, plano: 'Enterprise', criado_em: '2025-02-18' },
      { id: 'ws_12_6',  name: 'Umbrella Research',  slug: 'umbrella-rs',  status: 'ACTIVE', usuarios: 18, plano: 'Enterprise', criado_em: '2025-02-20' },
      { id: 'ws_12_7',  name: 'Umbrella Security',  slug: 'umbrella-sc',  status: 'ACTIVE', usuarios: 15, plano: 'Enterprise', criado_em: '2025-02-22' },
      { id: 'ws_12_8',  name: 'Umbrella Labs',      slug: 'umbrella-lb',  status: 'ACTIVE', usuarios: 12, plano: 'Enterprise', criado_em: '2025-02-25' },
      { id: 'ws_12_9',  name: 'Umbrella Defense',   slug: 'umbrella-df',  status: 'ACTIVE', usuarios: 8,  plano: 'Enterprise', criado_em: '2025-02-28' },
      { id: 'ws_12_10', name: 'Umbrella Arctic',    slug: 'umbrella-ar',  status: 'PENDING_SETUP', usuarios: 3, plano: 'Enterprise', criado_em: '2025-03-01' },
      { id: 'ws_12_11', name: 'Umbrella T-Virus',   slug: 'umbrella-tv',  status: 'SUSPENDED', usuarios: 2, plano: 'Enterprise', criado_em: '2025-03-05' },
      { id: 'ws_12_12', name: 'Umbrella Wesker',    slug: 'umbrella-wk',  status: 'ACTIVE', usuarios: 2, plano: 'Enterprise', criado_em: '2025-03-10' },
    ]
  },
]

const MOCK_STATS: Stats = {
  totalTenants: 154,
  activeTenants: 142,
  suspendedTenants: 9,
  totalUsers: 4832
}

// ─── Helpers visuais ──────────────────────────────────────────────────────────

function StatusBadge({ v }: { v: string }) {
  let cor = '#64748b', bg = 'rgba(100,116,139,0.12)'
  if (v === 'ACTIVE')        { cor = '#34d399'; bg = 'rgba(52,211,153,0.12)' }
  if (v === 'SUSPENDED')     { cor = '#fbbf24'; bg = 'rgba(251,191,36,0.12)' }
  if (v === 'CANCELLED')     { cor = '#f87171'; bg = 'rgba(248,113,113,0.12)' }
  if (v === 'PENDING_SETUP') { cor = '#818cf8'; bg = 'rgba(129,140,248,0.12)' }
  return (
    <span style={{ display: 'inline-flex', padding: '0.2rem 0.625rem', borderRadius: '9999px', fontSize: '0.6875rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', background: bg, color: cor, border: `1px solid ${bg}` }}>
      {v === 'PENDING_SETUP' ? 'PROVISIONING...' : v}
    </span>
  )
}

// ─── Componente ───────────────────────────────────────────────────────────────

export function AdminPanel({ navigate }: { navigate: (p: Page) => void }) {
  const [tenants, setTenants] = useState<Tenant[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  async function fetchData() {
    setLoading(true)
    try {
      await new Promise(r => setTimeout(r, 600))
      setTenants(MOCK_TENANTS)
      setStats(MOCK_STATS)
    } catch {
      setError('Erro ao carregar os metadados do servidor. Painel rodando em read-only fallback.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchData() }, [])

  async function updateStatus(id: string, status: string) {
    setTenants(prev => prev.map(t => t.id === id ? { ...t, status: status as EmpresaStatus } : t))
    if (status === 'SUSPENDED') {
      setStats(prev => prev ? { ...prev, activeTenants: prev.activeTenants - 1, suspendedTenants: prev.suspendedTenants + 1 } : null)
    } else {
      setStats(prev => prev ? { ...prev, activeTenants: prev.activeTenants + 1, suspendedTenants: prev.suspendedTenants - 1 } : null)
    }
  }

  // ── Colunas PAI (Organização) ──────────────────────────────────────────────
  const COLUNAS: TCGColuna<Tenant>[] = [
    {
      key: 'name', label: 'Organização', tipo: 'texto',
      tooltipTitulo: 'Nó Raiz de Organização (Clerk Org ID / Supabase Schema)',
      tooltipDescricao: 'Referência principal do tenant no banco global. Representa o isolamento lógico primário (RLS) em todas as tabelas transacionais.',
      render: (_v, item) => (
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
      tooltipDescricao: 'Alias em uso pelo API Gateway Edge para o Tenant Routing.',
      render: (_v, item) => (
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
      tooltipDescricao: 'Indica as diretivas aplicadas no cache Redis de borda.',
      render: (v) => <StatusBadge v={v as string} />
    },
    {
      key: 'subscriptions', label: 'License / Config', tipo: 'texto',
      tooltipTitulo: 'Camada de Rate Limit Financeiro',
      tooltipDescricao: 'Define a quota de endpoints, restrições e armazenamento atribuídos via Stripe/MercadoPago.',
      render: (_v, item) => <span style={{ color: 'var(--ws-muted)' }}>{item.subscriptions?.[0]?.plan || 'N/A'}</span>
    },
    {
      key: 'users_count', label: 'Pool de Usuários', tipo: 'numero', align: 'center',
      tooltipTitulo: 'Workers & Contas de Usuário',
      tooltipDescricao: 'Registros na tabela Identity associados a este WorkspaceRoot',
      render: (_v, item) => <span style={{ fontWeight: 600 }}>{item._count?.users || 0}</span>
    },
  ]

  // ── Colunas FILHAS (Espaço de Trabalho) ────────────────────────────────────
  const COLUNAS_FILHAS: TCGColuna<Workspace>[] = [
    {
      key: 'name', label: 'Espaço de Trabalho', tipo: 'texto',
      render: (_v, item) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{ width: 24, height: 24, minWidth: 24, borderRadius: '6px', background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.5625rem', fontWeight: 700, color: '#34d399' }}>
            {item.name.charAt(0).toUpperCase()}
          </div>
          <span style={{ fontWeight: 500, fontSize: '0.875rem' }}>{item.name}</span>
        </div>
      )
    },
    {
      key: 'slug', label: 'Endpoint', tipo: 'texto',
      render: (_v, item) => (
        <code style={{ fontSize: '0.75rem', color: '#a5b4fc', background: 'rgba(165,180,252,0.08)', padding: '0.1rem 0.35rem', borderRadius: '4px' }}>
          {item.slug}.gravity.com.br
        </code>
      )
    },
    {
      key: 'status', label: 'Status', tipo: 'texto',
      render: (v) => <StatusBadge v={v as string} />
    },
    {
      key: 'plano', label: 'Plano', tipo: 'texto',
      render: (v) => <span style={{ color: 'var(--ws-muted)', fontSize: '0.875rem' }}>{v as string}</span>
    },
    {
      key: 'usuarios', label: 'Usuários', tipo: 'numero', align: 'center',
      render: (v) => <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>{v as number}</span>
    },
    {
      key: 'criado_em', label: 'Criado em', tipo: 'texto',
      render: (v) => <span style={{ color: 'var(--ws-muted)', fontSize: '0.8125rem' }}>{new Date(v as string).toLocaleDateString('pt-BR')}</span>
    },
  ]

  // ── Ações PAI ──────────────────────────────────────────────────────────────
  const ACOES: TCGAcao<Tenant>[] = [
    {
      id: 'inspect',
      icone: <MagnifyingGlass size={15} weight="bold" />,
      tooltip: 'Painel de Auditoria',
      onClick: (item) => navigate({ name: 'tenant-detail', tenantId: item.id }),
    },
    {
      id: 'suspend',
      renderCustom: (item) => (
        <TooltipGlobal descricao={item.status === 'ACTIVE' ? 'Enviar SYS_LOCK: bloqueia JWT tokens deste tenant.' : 'Enviar SYS_UNLOCK: restaura acesso ao tenant.'}>
          <button
            type="button"
            onClick={e => { e.preventDefault(); e.stopPropagation(); updateStatus(item.id, item.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE') }}
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

  // ── Ações FILHAS (Espaço de Trabalho) ──────────────────────────────────────
  const ACOES_FILHAS: TCGAcao<Workspace>[] = [
    {
      id: 'inspect-ws',
      icone: <MagnifyingGlass size={13} weight="bold" />,
      tooltip: 'Ver Espaço de Trabalho',
      onClick: () => {},
    },
  ]

  // ── Exportação ─────────────────────────────────────────────────────────────
  const ACOES_EXPORT: TCGAcaoExport[] = [
    { label: 'Dump PG (Data)', icone: <Database size={14} weight="bold" />, onClick: () => {} },
    { label: 'Logs de Cluster (CSV)', icone: <FileCsv size={14} weight="bold" />, onClick: () => {} },
    { label: 'Matriz XML', icone: <FileXls size={14} weight="bold" />, onClick: () => {} },
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
        <BotaoNovoAdminGlobal
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

      <div style={{ position: 'relative', zIndex: 10 }}>
        <TabelaCamadasGlobal<Tenant, Workspace>
          dados={tenants}
          colunas={COLUNAS}
          colunasFilhas={COLUNAS_FILHAS}
          filhos={item => item.workspaces}
          acoes={ACOES}
          acoesFilhas={ACOES_FILHAS}
          acoesExportacao={ACOES_EXPORT}
          placeholderBusca="Localizar"
          campoBusca="name"
          mensagemVazio={loading ? 'Interrogando estado do database global...' : 'Nenhuma instância retornou resultados.'}
          carregando={loading}
          itemId={item => item.id}
          itensPorPagina={10}
        />
      </div>
    </PaginaGlobal>
  )
}
