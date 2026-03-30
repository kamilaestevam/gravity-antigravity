// src/pages/AdminPanel.tsx
// Painel exclusivo para gravity_admin — gestão de todos os tenants da plataforma

import React, { useState, useEffect } from 'react'
import type { Page } from '../App'
import { HardDrives, Buildings, TreeStructure, ChartPieSlice, WarningCircle, UsersThree, MagnifyingGlass, PauseCircle, PlayCircle, FileXls, FileCsv, Database, ShieldCheck, PencilSimple, Trash } from '@phosphor-icons/react'
import { useShellStore } from '@gravity/shell'
import { adminTenantsApi, type TenantApi } from '../services/apiClient'

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

// ─── Helper: mapeia status do backend para pt-BR ──────────────────────────────

function mapTenantStatus(status: string): EmpresaStatus {
  if (status === 'ACTIVE' || status === 'Ativa') return 'Ativa'
  return 'Suspensa'
}

function mapStatusToBackend(status: EmpresaStatus): string {
  return status === 'Ativa' ? 'ACTIVE' : 'SUSPENDED'
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
      const [tenantsRes, statsRes] = await Promise.all([
        adminTenantsApi.list({ page: 1, limit: 100 }),
        adminTenantsApi.getStats(),
      ])

      // Mapeia dados do backend para formato do frontend
      const mapped: Tenant[] = tenantsRes.tenants.map((t: TenantApi) => ({
        id: t.id,
        name: t.name,
        slug: t.slug,
        status: mapTenantStatus(t.status),
        created_at: t.created_at,
        _count: t._count ?? { users: 0, companies: 0 },
        subscriptions: (t.subscriptions ?? []).map((s: { plan: string; status: string }) => ({
          plan: s.plan,
          status: s.status,
        })),
        workspaces: (t.companies ?? []).map((c: { id: string; name: string; subdomain: string | null; status: string }) => ({
          id: c.id,
          nome: c.name,
          subdominio: c.subdomain ?? t.slug,
          status: mapTenantStatus(c.status),
          usuarios: 0,
          plano: (t.subscriptions ?? []).map((s: { plan: string }) => s.plan).join(', ') || 'N/A',
          criadaEm: new Date(t.created_at).toLocaleDateString('pt-BR'),
        })),
      }))

      setTenants(mapped)

      const s = statsRes.stats
      const allWorkspaces = mapped.reduce((sum, t) => sum + t.workspaces.length, 0)
      const activeWs = mapped.reduce((sum, t) => sum + t.workspaces.filter(ws => ws.status === 'Ativa').length, 0)

      setStats({
        totalTenants: s.totalTenants,
        activeTenants: s.activeTenants,
        suspendedTenants: s.suspendedTenants,
        totalWorkspaces: allWorkspaces,
        activeWorkspaces: activeWs,
        suspendedWorkspaces: allWorkspaces - activeWs,
        totalUsers: s.totalUsers,
      })
    } catch {
      setError('Erro ao carregar os metadados do servidor. Painel rodando em read-only fallback.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchData() }, [])

  async function updateStatus(id: string, status: EmpresaStatus) {
    try {
      await adminTenantsApi.updateStatus(id, mapStatusToBackend(status))
      setTenants(prev => prev.map(t => t.id === id ? { ...t, status } : t))
      if (status === 'Suspensa') {
        setStats(prev => prev ? { ...prev, activeTenants: prev.activeTenants - 1, suspendedTenants: prev.suspendedTenants + 1 } : null)
        addNotification({ type: 'warning', message: `Organização suspensa com sucesso.` })
      } else {
        setStats(prev => prev ? { ...prev, activeTenants: prev.activeTenants + 1, suspendedTenants: prev.suspendedTenants - 1 } : null)
        addNotification({ type: 'success', message: `Organização reativada com sucesso.` })
      }
    } catch {
      addNotification({ type: 'error', message: 'Falha ao atualizar status da organização.' })
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
