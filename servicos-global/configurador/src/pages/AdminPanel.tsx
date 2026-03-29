// src/pages/AdminPanel.tsx
// Painel exclusivo para gravity_admin — gestão de todos os tenants da plataforma

import React, { useState, useEffect } from 'react'
import type { Page } from '../App'
import { HardDrives, Buildings, TreeStructure, ChartPieSlice, WarningCircle, UsersThree, MagnifyingGlass, PauseCircle, PlayCircle, FileXls, FileCsv, Database, ShieldCheck, PencilSimple, Trash } from '@phosphor-icons/react'
import { useShellStore } from '@gravity/shell'

import { BotaoNovoAdminGlobal } from '@nucleo/botao-novo-admin-global'
import { CabecalhoGlobal } from '@nucleo/cabecalho-global'
import { CardBasicoGlobal, CardGraficoGlobal } from '@nucleo/card-global'
import { TabelaGlobal, type TabelaGlobalColuna, type TabelaGlobalAcao, type TabelaExportAcao } from '@nucleo/tabela-global'
import { TooltipGlobal } from '@nucleo/tooltip-global'
import { StatusBadgeGlobal } from '@nucleo/status-badge-global'
import { PaginaGlobal } from '@nucleo/pagina-global'
import { ModalNovaOrganizacao, type DadosNovaOrg } from './admin/ModalNovaOrganizacao'
import { ModalEditarOrganizacao, type DadosEditarOrg } from './admin/ModalEditarOrganizacao'
import { ModalEditarWorkspace } from './workspace/ModalEditarWorkspace'
import { Tenant as GlobalTenant } from '../types/entidades'
import { getAcoesExportacaoPadrao } from '../utils/exportHelper'


// ─── Tipos ────────────────────────────────────────────────────────────────────

export type EmpresaStatus = 'Ativa' | 'Suspensa'

// Espelhado com interface Empresa de Workspaces.tsx
export interface Workspace {
  id: string
  nome: string
  subdominio: string
  usuarios: number
  status: EmpresaStatus
  plano: string
  criadaEm: string
  cnpj?: string
  estado?: string
  cidade?: string
  segmento?: string
  site?: string
}

export interface Tenant extends GlobalTenant {
  subscriptions: Array<{ plan: string; status: string }>
  workspaces: Workspace[]
}

interface Stats {
  totalTenants: number
  activeTenants: number
  suspendedTenants: number
  totalWorkspaces: number
  activeWorkspaces: number
  suspendedWorkspaces: number
  totalUsers: number
}

// ─── Status badge em pt-BR (padrão do configurador) ───────────────────────────

const STATUS_LABEL: Record<string, string> = {
  Ativa:    'Ativa',
  Suspensa: 'Suspensa',
}

const API = '/api/admin'

// ─── Mock ─────────────────────────────────────────────────────────────────────

const MOCK_TENANTS: Tenant[] = [
  {
    id: 't_1', name: 'Gravity Headquarters', slug: 'admin', status: 'Ativa',
    created_at: '2025-01-01', _count: { users: 12, companies: 1 },
    subscriptions: [{ plan: 'Enterprise (Admin)', status: 'ACTIVE' }],
    workspaces: [
      { id: 'ws_1_1', nome: 'Núcleo Central', subdominio: 'admin', status: 'Ativa', usuarios: 12, plano: 'Enterprise (Admin)', criadaEm: '01/01/2025' },
    ]
  },
  {
    id: 't_2', name: 'Acme Corp LTDA', slug: 'acme-ltda', status: 'Ativa',
    created_at: '2025-02-14', _count: { users: 48, companies: 3 },
    subscriptions: [
      { plan: 'Pro', status: 'ACTIVE' },
      { plan: 'SimulaCusto', status: 'ACTIVE' },
      { plan: 'Smart Read', status: 'ACTIVE' }
    ],
    workspaces: [
      { id: 'ws_2_1', nome: 'Acme São Paulo',     subdominio: 'acme-sp',     status: 'Ativa',    usuarios: 22, plano: 'Pro, SimulaCusto', criadaEm: '14/02/2025' },
      { id: 'ws_2_2', nome: 'Acme Rio de Janeiro', subdominio: 'acme-rj',    status: 'Ativa',    usuarios: 18, plano: 'Pro, Smart Read', criadaEm: '20/02/2025' },
      { id: 'ws_2_3', nome: 'Acme Campinas',       subdominio: 'acme-cps',   status: 'Suspensa', usuarios: 8,  plano: 'Pro', criadaEm: '01/03/2025' },
    ]
  },
  {
    id: 't_3', name: 'Stark Industries', slug: 'stark-global', status: 'Ativa',
    created_at: '2025-02-28', _count: { users: 120, companies: 5 },
    subscriptions: [
      { plan: 'Enterprise', status: 'ACTIVE' },
      { plan: 'SimulaCusto', status: 'ACTIVE' },
      { plan: 'Smart Read', status: 'ACTIVE' },
      { plan: 'Gestão Atividades', status: 'ACTIVE' }
    ],
    workspaces: [
      { id: 'ws_3_1', nome: 'Stark NY',    subdominio: 'stark-ny',   status: 'Ativa',        usuarios: 40, plano: 'Enterprise, SimulaCusto', criadaEm: '28/02/2025' },
      { id: 'ws_3_2', nome: 'Stark Malibu', subdominio: 'stark-ml',  status: 'Ativa',        usuarios: 30, plano: 'Enterprise', criadaEm: '02/03/2025' },
      { id: 'ws_3_3', nome: 'Stark Europe', subdominio: 'stark-eu',  status: 'Ativa',        usuarios: 25, plano: 'Enterprise', criadaEm: '05/03/2025' },
      { id: 'ws_3_4', nome: 'Stark Asia',   subdominio: 'stark-as',  status: 'Ativa',        usuarios: 20, plano: 'Enterprise', criadaEm: '10/03/2025' },
      { id: 'ws_3_5', nome: 'Stark Labs',   subdominio: 'stark-labs', status: 'Ativa', usuarios: 5,  plano: 'Enterprise', criadaEm: '20/03/2025' },
    ]
  },
  {
    id: 't_4', name: 'Wayne Enterprises', slug: 'wayne-corp', status: 'Suspensa',
    created_at: '2025-03-01', _count: { users: 5, companies: 2 },
    subscriptions: [{ plan: 'Free', status: 'PAST_DUE' }],
    workspaces: [
      { id: 'ws_4_1', nome: 'Wayne Corp HQ',    subdominio: 'wayne-hq',  status: 'Suspensa', usuarios: 3, plano: 'Free', criadaEm: '01/03/2025' },
      { id: 'ws_4_2', nome: 'Wayne Foundation',  subdominio: 'wayne-fnd', status: 'Suspensa', usuarios: 2, plano: 'Free', criadaEm: '05/03/2025' },
    ]
  },
  {
    id: 't_5', name: 'Oscorp', slug: 'oscorp-labs', status: 'Ativa',
    created_at: '2025-03-15', _count: { users: 1, companies: 1 },
    subscriptions: [{ plan: 'Trial', status: 'ACTIVE' }],
    workspaces: [
      { id: 'ws_5_1', nome: 'Oscorp Labs', subdominio: 'oscorp-labs', status: 'Ativa', usuarios: 1, plano: 'Trial', criadaEm: '15/03/2025' },
    ]
  },
  {
    id: 't_6', name: 'Cyberdyne Systems', slug: 'cyberdyne', status: 'Ativa',
    created_at: '2024-11-10', _count: { users: 0, companies: 0 },
    subscriptions: [{ plan: 'Pro', status: 'CANCELED' }],
    workspaces: []
  },
  {
    id: 't_7', name: 'Tyrell Corp', slug: 'tyrell', status: 'Ativa',
    created_at: '2025-03-18', _count: { users: 34, companies: 7 },
    subscriptions: [{ plan: 'Pro', status: 'ACTIVE' }],
    workspaces: [
      { id: 'ws_7_1', nome: 'Tyrell Corp HQ',  subdominio: 'tyrell-hq',  status: 'Ativa',        usuarios: 10, plano: 'Pro', criadaEm: '18/03/2025' },
      { id: 'ws_7_2', nome: 'Tyrell Nexus 6',  subdominio: 'tyrell-n6',  status: 'Ativa',        usuarios: 8,  plano: 'Pro', criadaEm: '20/03/2025' },
      { id: 'ws_7_3', nome: 'Tyrell Biodev',   subdominio: 'tyrell-bio', status: 'Ativa',        usuarios: 6,  plano: 'Pro', criadaEm: '22/03/2025' },
      { id: 'ws_7_4', nome: 'Tyrell Androide', subdominio: 'tyrell-and', status: 'Ativa',        usuarios: 5,  plano: 'Pro', criadaEm: '24/03/2025' },
      { id: 'ws_7_5', nome: 'Tyrell Export',   subdominio: 'tyrell-exp', status: 'Ativa',        usuarios: 3,  plano: 'Pro', criadaEm: '25/03/2025' },
      { id: 'ws_7_6', nome: 'Tyrell R&D',      subdominio: 'tyrell-rd',  status: 'Ativa', usuarios: 1,  plano: 'Pro', criadaEm: '26/03/2025' },
      { id: 'ws_7_7', nome: 'Tyrell Security', subdominio: 'tyrell-sec', status: 'Ativa',        usuarios: 1,  plano: 'Pro', criadaEm: '27/03/2025' },
    ]
  },
  {
    id: 't_8', name: 'Massive Dynamic', slug: 'massive', status: 'Ativa',
    created_at: '2025-03-20', _count: { users: 15, companies: 1 },
    subscriptions: [{ plan: 'Startup', status: 'ACTIVE' }],
    workspaces: [
      { id: 'ws_8_1', nome: 'Massive Dynamic HQ', subdominio: 'massive-hq', status: 'Ativa', usuarios: 15, plano: 'Startup', criadaEm: '20/03/2025' },
    ]
  },
  {
    id: 't_9', name: 'InGen', slug: 'ingen-bio', status: 'Ativa',
    created_at: '2025-03-22', _count: { users: 2, companies: 1 },
    subscriptions: [{ plan: 'Free', status: 'ACTIVE' }],
    workspaces: [
      { id: 'ws_9_1', nome: 'InGen Biotech', subdominio: 'ingen-bio', status: 'Ativa', usuarios: 2, plano: 'Free', criadaEm: '22/03/2025' },
    ]
  },
  {
    id: 't_10', name: 'Globex Corporation', slug: 'globex', status: 'Ativa',
    created_at: '2025-03-23', _count: { users: 77, companies: 4 },
    subscriptions: [{ plan: 'Enterprise', status: 'ACTIVE' }],
    workspaces: [
      { id: 'ws_10_1', nome: 'Globex HQ',   subdominio: 'globex-hq', status: 'Ativa',        usuarios: 30, plano: 'Enterprise', criadaEm: '23/03/2025' },
      { id: 'ws_10_2', nome: 'Globex West', subdominio: 'globex-w',  status: 'Ativa',        usuarios: 22, plano: 'Enterprise', criadaEm: '24/03/2025' },
      { id: 'ws_10_3', nome: 'Globex East', subdominio: 'globex-e',  status: 'Ativa',        usuarios: 15, plano: 'Enterprise', criadaEm: '25/03/2025' },
      { id: 'ws_10_4', nome: 'Globex Labs', subdominio: 'globex-l',  status: 'Ativa', usuarios: 10, plano: 'Enterprise', criadaEm: '26/03/2025' },
    ]
  },
  {
    id: 't_11', name: 'Soylent Corporation', slug: 'soylent', status: 'Suspensa',
    created_at: '2025-01-15', _count: { users: 3, companies: 1 },
    subscriptions: [{ plan: 'Startup', status: 'ACTIVE' }],
    workspaces: [
      { id: 'ws_11_1', nome: 'Soylent HQ', subdominio: 'soylent-hq', status: 'Suspensa', usuarios: 3, plano: 'Startup', criadaEm: '15/01/2025' },
    ]
  },
  {
    id: 't_12', name: 'Umbrella Corp', slug: 'umbrella-hub', status: 'Ativa',
    created_at: '2025-02-05', _count: { users: 210, companies: 12 },
    subscriptions: [{ plan: 'Enterprise', status: 'ACTIVE' }],
    workspaces: [
      { id: 'ws_12_1',  nome: 'Umbrella HQ',      subdominio: 'umbrella-hq',  status: 'Ativa',        usuarios: 40, plano: 'Enterprise', criadaEm: '05/02/2025' },
      { id: 'ws_12_2',  nome: 'Umbrella Europe',   subdominio: 'umbrella-eu',  status: 'Ativa',        usuarios: 35, plano: 'Enterprise', criadaEm: '10/02/2025' },
      { id: 'ws_12_3',  nome: 'Umbrella Asia',     subdominio: 'umbrella-as',  status: 'Ativa',        usuarios: 30, plano: 'Enterprise', criadaEm: '12/02/2025' },
      { id: 'ws_12_4',  nome: 'Umbrella Americas', subdominio: 'umbrella-am',  status: 'Ativa',        usuarios: 25, plano: 'Enterprise', criadaEm: '15/02/2025' },
      { id: 'ws_12_5',  nome: 'Umbrella Pharma',   subdominio: 'umbrella-ph',  status: 'Ativa',        usuarios: 20, plano: 'Enterprise', criadaEm: '18/02/2025' },
      { id: 'ws_12_6',  nome: 'Umbrella Research', subdominio: 'umbrella-rs',  status: 'Ativa',        usuarios: 18, plano: 'Enterprise', criadaEm: '20/02/2025' },
      { id: 'ws_12_7',  nome: 'Umbrella Security', subdominio: 'umbrella-sc',  status: 'Ativa',        usuarios: 15, plano: 'Enterprise', criadaEm: '22/02/2025' },
      { id: 'ws_12_8',  nome: 'Umbrella Labs',     subdominio: 'umbrella-lb',  status: 'Ativa',        usuarios: 12, plano: 'Enterprise', criadaEm: '25/02/2025' },
      { id: 'ws_12_9',  nome: 'Umbrella Defense',  subdominio: 'umbrella-df',  status: 'Ativa',        usuarios: 8,  plano: 'Enterprise', criadaEm: '28/02/2025' },
      { id: 'ws_12_10', nome: 'Umbrella Arctic',   subdominio: 'umbrella-ar',  status: 'Ativa', usuarios: 3,  plano: 'Enterprise', criadaEm: '01/03/2025' },
      { id: 'ws_12_11', nome: 'Umbrella T-Virus',  subdominio: 'umbrella-tv',  status: 'Suspensa',     usuarios: 2,  plano: 'Enterprise', criadaEm: '05/03/2025' },
      { id: 'ws_12_12', nome: 'Umbrella Wesker',   subdominio: 'umbrella-wk',  status: 'Ativa',        usuarios: 2,  plano: 'Enterprise', criadaEm: '10/03/2025' },
    ]
  },
]

const MOCK_STATS: Stats = {
  totalTenants: 154,
  activeTenants: 145,
  suspendedTenants: 9,
  totalWorkspaces: 240,
  activeWorkspaces: 212,
  suspendedWorkspaces: 28,
  totalUsers: 4832
}

// ─── Componente ───────────────────────────────────────────────────────────────

export function AdminPanel({ navigate }: { navigate: (p: Page) => void }) {
  const [tenants, setTenants] = useState<Tenant[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showNovaOrg, setShowNovaOrg] = useState(false)
  
  const [orgEditando, setOrgEditando] = useState<Tenant | null>(null)
  const [workspaceEditando, setWorkspaceEditando] = useState<Workspace | null>(null)

  const addNotification = useShellStore((state) => state.addNotification)

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

  async function updateStatus(id: string, status: EmpresaStatus) {
    setTenants(prev => prev.map(t => t.id === id ? { ...t, status } : t))
    if (status === 'Suspensa') {
      setStats(prev => prev ? { ...prev, activeTenants: prev.activeTenants - 1, suspendedTenants: prev.suspendedTenants + 1 } : null)
      addNotification({ type: 'warning', message: `Organização suspensa com sucesso.` })
    } else {
      setStats(prev => prev ? { ...prev, activeTenants: prev.activeTenants + 1, suspendedTenants: prev.suspendedTenants - 1 } : null)
      addNotification({ type: 'success', message: `Organização reativada com sucesso.` })
    }
  }

  async function updateWorkspaceStatus(id: string, status: EmpresaStatus) {
    setTenants(prev => prev.map(t => ({
      ...t,
      workspaces: t.workspaces.map(ws => ws.id === id ? { ...ws, status } : ws)
    })))
    
    if (status === 'Suspensa') {
      setStats(prev => prev ? { ...prev, activeWorkspaces: prev.activeWorkspaces - 1, suspendedWorkspaces: prev.suspendedWorkspaces + 1 } : null)
    } else {
      setStats(prev => prev ? { ...prev, activeWorkspaces: prev.activeWorkspaces + 1, suspendedWorkspaces: prev.suspendedWorkspaces - 1 } : null)
    }
    
    addNotification({ 
      type: status === 'Suspensa' ? 'warning' : 'success', 
      message: `Workspace ${status === 'Suspensa' ? 'suspenso' : 'reativado'} com sucesso.`
    })
  }

  function handleSalvarOrg(dados: DadosNovaOrg) {
    const novoID = `t_new_${Date.now()}`
    const novo: Tenant = {
      id: novoID,
      name: dados.nome,
      slug: dados.subdominio,
      status: 'Ativa',
      created_at: new Date().toISOString().split('T')[0],
      _count: { users: 1, companies: 1 },
      subscriptions: [{ plan: dados.plano, status: 'ACTIVE' }],
      workspaces: []
    }
    setTenants(prev => [novo, ...prev])
    setStats(prev => prev ? { ...prev, totalTenants: prev.totalTenants + 1, activeTenants: prev.activeTenants + 1 } : null)
    setShowNovaOrg(false)
  }

  function handleEditOrg(linha: Tenant) {
    setOrgEditando(linha)
  }

  function handleUpdateOrg(dados: Partial<DadosEditarOrg>) {
    if (!orgEditando) return
    setTenants(prev => prev.map(t => {
      if (t.id === orgEditando.id) {
        return { 
          ...t, 
          name: dados.nome || t.name, 
          slug: dados.subdominio || t.slug,
          subscriptions: t.subscriptions.length > 0 && dados.plano 
            ? [{ plan: dados.plano, status: t.subscriptions[0].status }, ...t.subscriptions.slice(1)]
            : t.subscriptions
        }
      }
      return t
    }))
    addNotification({ type: 'success', message: 'Organização atualizada com sucesso.' })
    setOrgEditando(null)
  }

  function handleEditWorkspace(linha: Workspace) {
    setWorkspaceEditando(linha)
  }

  function handleUpdateWorkspace(dados: Partial<Workspace>) {
    if (!workspaceEditando) return
    setTenants(prev => prev.map(t => ({
      ...t,
      workspaces: t.workspaces.map(ws => ws.id === workspaceEditando.id ? { ...ws, ...dados } : ws)
    })))
    addNotification({ type: 'success', message: 'Workspace atualizado com sucesso.' })
    setWorkspaceEditando(null)
  }

  // ── Colunas PAI ────────────────────────────────────────────────────────────
  const COLUNAS: TabelaGlobalColuna<Tenant>[] = [
    {
      key: 'name', label: 'Organização', tipo: 'texto',
      tooltipTitulo: 'Nó Raiz de Organização (Clerk Org ID / Supabase Schema)',
      tooltipDescricao: 'Referência principal do tenant. Isolamento lógico primário (RLS) em todas as tabelas transacionais.',
      render: (_v: unknown, item: Tenant) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
          <TooltipGlobal titulo={`ID Técnico: ${item.id}`} descricao="Chave UUID primária no cluster">
            <div style={{ width: 30, height: 30, minWidth: 30, borderRadius: '8px', background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.6875rem', fontWeight: 700, color: '#6366f1', cursor: 'help' }}>
              {item.name ? item.name.charAt(0).toUpperCase() : 'T'}
            </div>
          </TooltipGlobal>
          <span style={{ fontWeight: 600 }}>{item.name}</span>
          {item.workspaces.length > 0 && (
             <span className="ws-badge ws-badge-surface" style={{ marginLeft: 8, height: 18, fontSize: '0.65rem', padding: '0 6px' }}>
                {item.workspaces.length}
             </span>
          )}
        </div>
      )
    },
    {
      key: 'slug', label: 'Subdominio', tipo: 'texto',
      tooltipTitulo: 'Roteamento DNS (Subdomain CNAME)',
      tooltipDescricao: 'Alias em uso pelo API Gateway Edge para o Tenant Routing.',
      render: (_v: unknown, item: Tenant) => (
        <a 
          href={`http://localhost:8010/workspace/${item.slug}`} 
          target="_blank" 
          rel="noopener noreferrer" 
          style={{ display: 'inline-flex', alignItems: 'center', textDecoration: 'none' }} 
          onClick={ev => ev.stopPropagation()}
        >
          <code style={{ fontSize: '0.8125rem', color: '#c7d2fe', background: 'rgba(199,210,254,0.1)', padding: '0.125rem 0.4rem', borderRadius: '4px', transition: 'background 0.15s', cursor: 'pointer' }}
            onMouseEnter={ev => { (ev.currentTarget as HTMLElement).style.background = 'rgba(199,210,254,0.2)'; (ev.currentTarget as HTMLElement).style.textDecoration = 'underline' }}
            onMouseLeave={ev => { (ev.currentTarget as HTMLElement).style.background = 'rgba(199,210,254,0.1)'; (ev.currentTarget as HTMLElement).style.textDecoration = 'none' }}
          >
            {item.slug}.gravity.com.br
          </code>
        </a>
      )
    },
    {
      key: 'status', label: 'Status', tipo: 'texto',
      tooltipTitulo: 'Status do Tenant',
      tooltipDescricao: 'Estado operacional no middleware de borda.',
      render: (v: unknown) => <StatusBadgeGlobal valor={v as string} />
    },
    {
      key: 'id' as any, label: 'Plano / Produtos', tipo: 'texto',
      tooltipTitulo: 'Plano Contratado & Serviços',
      tooltipDescricao: 'Define quota de endpoints, restrições e armazenamento.',
      render: (_v: unknown, item: Tenant) => {
        const subs = item.subscriptions || []
        const show = subs.slice(0, 2)
        const rest = subs.length - show.length

        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexWrap: 'wrap' }}>
            {show.map((s, i) => (
              <span key={i} style={{ 
                fontSize: '0.625rem', fontWeight: 800, textTransform: 'uppercase',
                background: i === 0 ? 'rgba(99,102,241,0.1)' : 'rgba(255,255,255,0.05)',
                color: i === 0 ? '#818cf8' : 'var(--ws-muted)',
                padding: '0.125rem 0.375rem', borderRadius: '4px', border: i === 0 ? '1px solid rgba(99,102,241,0.2)' : '1px solid rgba(255,255,255,0.1)'
              }}>
                {s.plan}
              </span>
            ))}
            {rest > 0 && <span style={{ fontSize: '0.625rem', color: 'var(--ws-muted)', fontWeight: 700 }}>+{rest}</span>}
          </div>
        )
      }
    },
    {
      key: 'id' as any, label: 'Usuários', align: 'center', tipo: 'texto',
      tooltipTitulo: 'Pool de Usuários',
      tooltipDescricao: 'Registros na tabela Identity associados a este WorkspaceRoot',
      render: (_v: unknown, item: Tenant) => <span style={{ fontWeight: 600 }}>{item._count?.users || 0}</span>
    },
  ]

  // ── Colunas FILHAS ──────────────────────────────────────────────────────────
  const COLUNAS_FILHAS: TabelaGlobalColuna<Workspace>[] = [
    {
      key: 'nome', label: 'Nome do Workspace', tipo: 'texto',
      render: (_v: unknown, item: Workspace) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{ width: 24, height: 24, minWidth: 24, borderRadius: '6px', background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.5625rem', fontWeight: 700, color: '#34d399' }}>
            {item.nome.charAt(0).toUpperCase()}
          </div>
          <a 
            href={`/workspace/workspaces?id=${item.id}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{ fontWeight: 600, color: 'var(--ws-text)', textDecoration: 'none', transition: 'color 0.15s', cursor: 'pointer' }}
            onMouseEnter={e => { e.currentTarget.style.color = '#818cf8'; e.currentTarget.style.textDecoration = 'underline'; }}
            onMouseLeave={e => { e.currentTarget.style.color = 'var(--ws-text)'; e.currentTarget.style.textDecoration = 'none'; }}
            onClick={(ev) => ev.stopPropagation()}
          >
            {item.nome}
          </a>
        </div>
      )
    },
    {
      key: 'subdominio', label: 'Subdominio', tipo: 'texto',
      render: (_v: unknown, item: Workspace) => (
        <a 
          href={`http://localhost:8010/workspace/${item.subdominio}`} 
          target="_blank" 
          rel="noopener noreferrer" 
          style={{ textDecoration: 'none' }}
          onClick={ev => ev.stopPropagation()}
        >
          <code style={{ fontSize: '0.8rem', color: '#a5b4fc', background: 'rgba(165,180,252,0.08)', padding: '0.1rem 0.35rem', borderRadius: '4px', cursor: 'pointer', transition: 'all 0.15s' }}
            onMouseEnter={ev => { (ev.currentTarget as HTMLElement).style.background = 'rgba(165,180,252,0.2)'; (ev.currentTarget as HTMLElement).style.textDecoration = 'underline' }}
            onMouseLeave={ev => { (ev.currentTarget as HTMLElement).style.background = 'rgba(165,180,252,0.08)'; (ev.currentTarget as HTMLElement).style.textDecoration = 'none' }}
          >
            {item.subdominio}.gravity.com.br
          </code>
        </a>
      )
    },
    {
      key: 'status', label: 'Status', tipo: 'texto',
      render: (v: unknown) => <StatusBadgeGlobal valor={v as string} />
    },
    {
      key: 'plano', label: 'Plano / Produtos', tipo: 'texto',
      render: (v: unknown) => {
        const parts = String(v).split(',').map(p => p.trim())
        const show = parts.slice(0, 2)
        const rest = parts.length - show.length

        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            {show.map((p, i) => (
              <span key={i} style={{ 
                fontSize: '0.625rem', color: 'var(--ws-muted)', fontWeight: 600, 
                padding: '0.1rem 0.35rem', background: 'rgba(255,255,255,0.03)', 
                borderRadius: '4px', border: '1px solid rgba(255,255,255,0.08)' 
              }}>{p}</span>
            ))}
            {rest > 0 && <span style={{ fontSize: '0.625rem', color: 'var(--ws-muted)', fontWeight: 700 }}>+{rest}</span>}
          </div>
        )
      }
    },
    {
      key: 'usuarios', label: 'Usuários', align: 'center', tipo: 'texto',
      render: (v: unknown) => <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>{v as number}</span>
    },
  ]

  // ── Ações PAI ──────────────────────────────────────────────────────────────
  const ACOES: TabelaGlobalAcao<Tenant>[] = [
    {
      id: 'suspend',
      icone: <PauseCircle size={15} weight="bold" />, // icone desktop padrão, renderCustom faz o override
      tooltip: 'Alternar Status',
      onClick: (item) => updateStatus(item.id, item.status === 'Ativa' ? 'Suspensa' : 'Ativa'),
      renderCustom: (item) => (
        <button
          type="button"
          onClick={e => { e.preventDefault(); e.stopPropagation(); updateStatus(item.id, item.status === 'Ativa' ? 'Suspensa' : 'Ativa') }}
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 28, height: 28, borderRadius: '50%', background: 'transparent', border: '1px solid transparent', color: '#64748b', cursor: 'pointer', transition: 'all 0.15s', flexShrink: 0 }}
          onMouseEnter={ev => { ev.currentTarget.style.background = item.status === 'Ativa' ? 'rgba(251,191,36,0.12)' : 'rgba(52,211,153,0.12)'; ev.currentTarget.style.borderColor = item.status === 'Ativa' ? 'rgba(251,191,36,0.3)' : 'rgba(52,211,153,0.3)'; ev.currentTarget.style.color = item.status === 'Ativa' ? '#fbbf24' : '#34d399' }}
          onMouseLeave={ev => { ev.currentTarget.style.background = 'transparent'; ev.currentTarget.style.borderColor = 'transparent'; ev.currentTarget.style.color = '#64748b' }}
        >
          {item.status === 'Ativa' ? <PauseCircle size={16} weight="bold" /> : <PlayCircle size={16} weight="bold" />}
        </button>
      )
    },
    {
      id: 'edit',
      icone: <PencilSimple size={15} weight="bold" />,
      tooltip: 'Editar Organização',
      onClick: handleEditOrg,
    },
    {
      id: 'inspect',
      icone: <MagnifyingGlass size={15} weight="bold" />,
      tooltip: 'Painel de Auditoria',
      onClick: (item) => navigate({ name: 'tenant-detail', tenantId: item.id }),
    },
  ]

  // ── Ações FILHAS ───────────────────────────────────────────────────────────
  const ACOES_FILHAS: TabelaGlobalAcao<Workspace>[] = [
    {
      id: 'suspend-ws',
      icone: <PauseCircle size={14} weight="bold" />,
      tooltip: 'Alternar Status do Workspace',
      onClick: (item) => updateWorkspaceStatus(item.id, item.status === 'Ativa' ? 'Suspensa' : 'Ativa'),
      renderCustom: (item) => (
        <button
          type="button"
          onClick={e => { e.preventDefault(); e.stopPropagation(); updateWorkspaceStatus(item.id, item.status === 'Ativa' ? 'Suspensa' : 'Ativa') }}
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 26, height: 26, borderRadius: '50%', background: 'transparent', border: '1px solid transparent', color: '#64748b', cursor: 'pointer', transition: 'all 0.15s', flexShrink: 0 }}
          onMouseEnter={ev => { ev.currentTarget.style.background = item.status === 'Ativa' ? 'rgba(251,191,36,0.12)' : 'rgba(52,211,153,0.12)'; ev.currentTarget.style.borderColor = item.status === 'Ativa' ? 'rgba(251,191,36,0.3)' : 'rgba(52,211,153,0.3)'; ev.currentTarget.style.color = item.status === 'Ativa' ? '#fbbf24' : '#34d399' }}
          onMouseLeave={ev => { ev.currentTarget.style.background = 'transparent'; ev.currentTarget.style.borderColor = 'transparent'; ev.currentTarget.style.color = '#64748b' }}
        >
          {item.status === 'Ativa' ? <PauseCircle size={14} weight="bold" /> : <PlayCircle size={14} weight="bold" />}
        </button>
      )
    },
    {
      id: 'edit',
      icone: <PencilSimple size={14} weight="bold" />,
      tooltip: 'Editar',
      onClick: handleEditWorkspace,
    }
  ]

  // ── Exportação ─────────────────────────────────────────────────────────────
  const ACOES_EXPORT: TabelaExportAcao<Tenant>[] = [
    { label: 'Dump PG (Data)', icone: <Database size={14} weight="bold" />, onClick: () => {}, tooltipDescricao: 'Exporta a estrutura completa do banco de dados' },
    { label: 'Logs de Cluster (CSV)', icone: <FileCsv size={14} weight="bold" />, onClick: () => {}, tooltipDescricao: 'Gera planilha com o histórico de eventos do servidor' },
    { label: 'Matriz XML', icone: <FileXls size={14} weight="bold" />, onClick: () => {}, tooltipDescricao: 'Exporta configuração técnica para migração entre ambientes' },
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
              titulo="Total de Organizações"
              icone={<Buildings weight="duotone" size={16} style={{ color: 'var(--ws-accent)' }} />}
              valor={stats.totalTenants}
              tooltip={
                <>
                  <p className="cg-tooltip__title">Clientes & Tenants</p>
                  <div className="cg-tooltip__row"><span>Organizações Totais</span> <strong>{stats.totalTenants}</strong></div>
                  <div className="cg-tooltip__row"><span>Status Ativa</span> <strong style={{ color: '#34d399' }}>{stats.activeTenants}</strong></div>
                  <div className="cg-tooltip__row"><span>Status Suspensa</span> <strong style={{ color: '#fbbf24' }}>{stats.suspendedTenants}</strong></div>
                </>
              }
            />
            <CardBasicoGlobal
              titulo="Total de Workspaces"
              icone={<TreeStructure weight="duotone" size={16} style={{ color: '#34d399' }} />}
              valor={stats.totalWorkspaces}
              tooltip={
                <>
                  <p className="cg-tooltip__title">Ambientes Lógicos</p>
                  <div className="cg-tooltip__row"><span>Total de Workspaces</span> <strong>{stats.totalWorkspaces}</strong></div>
                  <div className="cg-tooltip__divider" />
                  <span style={{ fontSize: '0.6875rem', color: 'var(--ws-muted)', lineHeight: 1.4, display: 'block' }}>Média de {Math.round(stats.totalWorkspaces / (stats.totalTenants || 1) * 10) / 10} workspaces por organização.</span>
                </>
              }
            />
            <CardBasicoGlobal
              titulo="Total de Usuários"
              icone={<UsersThree weight="duotone" size={16} style={{ color: '#8b5cf6' }} />}
              valor={stats.totalUsers}
              tooltip={
                <>
                  <p className="cg-tooltip__title">Identidades Globais</p>
                  <div className="cg-tooltip__row"><span>Usuários Únicos</span> <strong>{stats.totalUsers}</strong></div>
                  <div className="cg-tooltip__row"><span>Sessões Ativas</span> <strong>100%</strong></div>
                </>
              }
            />
            <CardGraficoGlobal
              titulo="Status dos Workspaces"
              icone={<ChartPieSlice weight="duotone" size={16} style={{ color: '#fbbf24' }} />}
              total={stats.totalWorkspaces}
              valorPrincipal={stats.activeWorkspaces}
              corGauge="#34d399"
              legenda={[
                { label: 'Ativas',    valor: stats.activeWorkspaces,    cor: 'green'  },
                { label: 'Suspensas', valor: stats.suspendedWorkspaces, cor: 'yellow' },
              ]}
              tooltip={
                <>
                  <p className="cg-tooltip__title">Saúde Operacional</p>
                  <div className="cg-tooltip__row"><span>Workspaces Ativos</span> <strong style={{ color: '#34d399' }}>{stats.activeWorkspaces}</strong></div>
                  <div className="cg-tooltip__row"><span>Workspaces Suspensos</span> <strong style={{ color: '#fbbf24' }}>{stats.suspendedWorkspaces}</strong></div>
                  <div className="cg-tooltip__divider" />
                  <div className="cg-tooltip__row"><span>Taxa de Disponibilidade</span> <strong style={{ color: '#34d399' }}>{Math.round(stats.activeWorkspaces / (stats.totalWorkspaces || 1) * 100)}%</strong></div>
                </>
              }
            />
          </>
        ) : undefined
      }
      acoes={
        <div style={{ display: 'flex', gap: '8px' }}>
          <BotaoNovoAdminGlobal
            rotulo="Nova Instância"
            onClick={() => setShowNovaOrg(true)}
            ativo={showNovaOrg}
          />
        </div>
      }
    >
      {error && (
        <div style={{ background: '#ef444422', border: '1px solid #ef444444', borderRadius: '8px', padding: '12px 16px', color: '#ef4444', marginBottom: 20 }}>
          {error}
        </div>
      )}

      <div style={{ position: 'relative', zIndex: 10 }}>
        <TabelaGlobal<Tenant>
          id="admin-organizations"
          dados={tenants}
          colunas={COLUNAS}
          acoes={ACOES}
          acoesExportacao={getAcoesExportacaoPadrao(COLUNAS, 'dados_tabela', 'Exportação de Dados')}
          mensagemVazio={loading ? 'Interrogando estado do database global...' : 'Nenhuma instância retornou resultados.'}
          tooltipExpandir="Ver workspaces vinculados à organização"
          tooltipRecolher="Recolher visualização de workspaces"
          tooltipBusca="Localizar instância por nome ou subdomínio"
          renderExpandido={(tenant) => (
            <div style={{ padding: '0 1.25rem 1.25rem 1.25rem', background: 'rgba(0,0,0,0.15)' }}>
              <div style={{ padding: '1rem', borderTop: '1px solid rgba(129,140,248,0.1)', display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--ws-muted)', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                <TreeStructure size={14} /> Workspaces ({tenant.workspaces.length})
              </div>
              <div style={{ border: '1px solid rgba(129,140,248,0.08)', borderRadius: '12px', overflow: 'hidden' }}>
                <TabelaGlobal<Workspace>
                  id={`admin-org-workspaces-${tenant.id}`}
                  dados={tenant.workspaces}
                  colunas={COLUNAS_FILHAS}
                  acoes={ACOES_FILHAS}
                  mensagemVazio="Nenhum workspace cadastrado."
                  acoesExportacao={getAcoesExportacaoPadrao(COLUNAS_FILHAS, 'dados_tabela', 'Exportação de Dados')}
                />
              </div>
            </div>
          )}
        />
      </div>

      <ModalNovaOrganizacao
        aberto={showNovaOrg}
        aoFechar={() => setShowNovaOrg(false)}
        aoSalvar={handleSalvarOrg}
      />

      <ModalEditarOrganizacao
        aberto={!!orgEditando}
        organizacao={orgEditando}
        aoFechar={() => setOrgEditando(null)}
        aoSalvar={handleUpdateOrg}
      />

      <ModalEditarWorkspace
        aberto={!!workspaceEditando}
        empresa={workspaceEditando as any}
        aoFechar={() => setWorkspaceEditando(null)}
        aoSalvar={handleUpdateWorkspace as any}
      />
    </PaginaGlobal>
  )
}
