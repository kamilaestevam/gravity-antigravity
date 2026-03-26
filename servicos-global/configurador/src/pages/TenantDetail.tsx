// src/pages/TenantDetail.tsx
// Painel de Auditoria de um Tenant — visão forense completa: dados + logs de atividade

import React, { useState, useEffect, useMemo } from 'react'
import {
  ArrowLeft, Buildings, TreeStructure, UsersThree, ShieldCheck,
  User, Robot, HardDrives, Desktop, Export, DownloadSimple, Funnel,
  ClockCounterClockwise, Package, CreditCard, Info
} from '@phosphor-icons/react'
import { PaginaGlobal } from '@nucleo/pagina-global'
import { CabecalhoGlobal } from '@nucleo/cabecalho-global'
import { CardBasicoGlobal } from '@nucleo/card-global'
import { TabelaGlobal, type TabelaGlobalColuna, type TabelaExportAcao } from '@nucleo/tabela-global'
import { TooltipGlobal } from '@nucleo/tooltip-global'
import { StatusBadgeGlobal } from '@nucleo/status-badge-global'

// ─── Tipos ────────────────────────────────────────────────────────────────────

interface Workspace {
  id: string
  nome: string
  subdominio: string
  usuarios: number
  status: string
  plano: string
  criadaEm: string
}

interface TenantMock {
  id: string
  name: string
  slug: string
  status: string
  created_at: string
  _count: { users: number; companies: number }
  subscriptions: Array<{ plan: string; status: string }>
  workspaces: Workspace[]
}

type DiffObj = { campo: string; antes: string; depois: string }

type LogAuditoria = {
  id: string
  quando: string
  quemNome: string
  quemTipo: 'user' | 'gabi' | 'system'
  acao: string
  oQueFoiFeito: string
  entidade: string
  diff?: DiffObj[]
}

type TabKey = 'auditoria' | 'workspaces' | 'usuarios' | 'billing'

// ─── Mock de Tenants (espelho do AdminPanel) ──────────────────────────────────

const MOCK_TENANTS: TenantMock[] = [
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
    subscriptions: [{ plan: 'Pro', status: 'ACTIVE' }, { plan: 'SimulaCusto', status: 'ACTIVE' }, { plan: 'Smart Read', status: 'ACTIVE' }],
    workspaces: [
      { id: 'ws_2_1', nome: 'Acme São Paulo', subdominio: 'acme-sp', status: 'Ativa', usuarios: 22, plano: 'Pro, SimulaCusto', criadaEm: '14/02/2025' },
      { id: 'ws_2_2', nome: 'Acme Rio de Janeiro', subdominio: 'acme-rj', status: 'Ativa', usuarios: 18, plano: 'Pro, Smart Read', criadaEm: '20/02/2025' },
      { id: 'ws_2_3', nome: 'Acme Campinas', subdominio: 'acme-cps', status: 'Suspensa', usuarios: 8, plano: 'Pro', criadaEm: '01/03/2025' },
    ]
  },
  {
    id: 't_3', name: 'Stark Industries', slug: 'stark-global', status: 'Ativa',
    created_at: '2025-02-28', _count: { users: 120, companies: 5 },
    subscriptions: [{ plan: 'Enterprise', status: 'ACTIVE' }, { plan: 'SimulaCusto', status: 'ACTIVE' }],
    workspaces: [
      { id: 'ws_3_1', nome: 'Stark NY', subdominio: 'stark-ny', status: 'Ativa', usuarios: 40, plano: 'Enterprise, SimulaCusto', criadaEm: '28/02/2025' },
      { id: 'ws_3_2', nome: 'Stark Malibu', subdominio: 'stark-ml', status: 'Ativa', usuarios: 30, plano: 'Enterprise', criadaEm: '02/03/2025' },
      { id: 'ws_3_3', nome: 'Stark Europe', subdominio: 'stark-eu', status: 'Ativa', usuarios: 25, plano: 'Enterprise', criadaEm: '05/03/2025' },
    ]
  },
  {
    id: 't_4', name: 'Wayne Enterprises', slug: 'wayne-corp', status: 'Suspensa',
    created_at: '2025-03-01', _count: { users: 5, companies: 2 },
    subscriptions: [{ plan: 'Free', status: 'PAST_DUE' }],
    workspaces: [
      { id: 'ws_4_1', nome: 'Wayne Corp HQ', subdominio: 'wayne-hq', status: 'Suspensa', usuarios: 3, plano: 'Free', criadaEm: '01/03/2025' },
      { id: 'ws_4_2', nome: 'Wayne Foundation', subdominio: 'wayne-fnd', status: 'Suspensa', usuarios: 2, plano: 'Free', criadaEm: '05/03/2025' },
    ]
  },
  {
    id: 't_5', name: 'Oscorp', slug: 'oscorp-labs', status: 'Ativa',
    created_at: '2025-03-15', _count: { users: 1, companies: 1 },
    subscriptions: [{ plan: 'Trial', status: 'ACTIVE' }],
    workspaces: [{ id: 'ws_5_1', nome: 'Oscorp Labs', subdominio: 'oscorp-labs', status: 'Ativa', usuarios: 1, plano: 'Trial', criadaEm: '15/03/2025' }]
  },
  {
    id: 't_7', name: 'Tyrell Corp', slug: 'tyrell', status: 'Ativa',
    created_at: '2025-03-18', _count: { users: 34, companies: 7 },
    subscriptions: [{ plan: 'Pro', status: 'ACTIVE' }],
    workspaces: [
      { id: 'ws_7_1', nome: 'Tyrell Corp HQ', subdominio: 'tyrell-hq', status: 'Ativa', usuarios: 10, plano: 'Pro', criadaEm: '18/03/2025' },
      { id: 'ws_7_2', nome: 'Tyrell Nexus 6', subdominio: 'tyrell-n6', status: 'Ativa', usuarios: 8, plano: 'Pro', criadaEm: '20/03/2025' },
    ]
  },
  {
    id: 't_10', name: 'Globex Corporation', slug: 'globex', status: 'Ativa',
    created_at: '2025-03-23', _count: { users: 77, companies: 4 },
    subscriptions: [{ plan: 'Enterprise', status: 'ACTIVE' }],
    workspaces: [
      { id: 'ws_10_1', nome: 'Globex HQ', subdominio: 'globex-hq', status: 'Ativa', usuarios: 30, plano: 'Enterprise', criadaEm: '23/03/2025' },
      { id: 'ws_10_2', nome: 'Globex West', subdominio: 'globex-w', status: 'Ativa', usuarios: 22, plano: 'Enterprise', criadaEm: '24/03/2025' },
    ]
  },
  {
    id: 't_12', name: 'Umbrella Corp', slug: 'umbrella-hub', status: 'Ativa',
    created_at: '2025-02-05', _count: { users: 210, companies: 12 },
    subscriptions: [{ plan: 'Enterprise', status: 'ACTIVE' }],
    workspaces: [
      { id: 'ws_12_1', nome: 'Umbrella HQ', subdominio: 'umbrella-hq', status: 'Ativa', usuarios: 40, plano: 'Enterprise', criadaEm: '05/02/2025' },
      { id: 'ws_12_2', nome: 'Umbrella Europe', subdominio: 'umbrella-eu', status: 'Ativa', usuarios: 35, plano: 'Enterprise', criadaEm: '10/02/2025' },
    ]
  },
]

// ─── Mock de logs de auditoria por tenant ─────────────────────────────────────

function gerarLogsMock(tenantName: string): LogAuditoria[] {
  const base = [
    {
      id: 'log_1', quando: '2026-03-26T12:30:00Z', quemNome: 'Daniel Martins', quemTipo: 'user' as const,
      acao: 'ALTERAÇÃO', oQueFoiFeito: `Editou configurações da organização ${tenantName}`,
      entidade: 'Organização',
      diff: [{ campo: 'Status', antes: 'Suspensa', depois: 'Ativa' }]
    },
    {
      id: 'log_2', quando: '2026-03-26T11:45:00Z', quemNome: 'Gabi AI', quemTipo: 'gabi' as const,
      acao: 'IA', oQueFoiFeito: 'Gerou relatório mensal de consumo automaticamente',
      entidade: 'Relatórios',
      diff: []
    },
    {
      id: 'log_3', quando: '2026-03-26T10:20:00Z', quemNome: 'João Silva', quemTipo: 'user' as const,
      acao: 'CRIAÇÃO', oQueFoiFeito: 'Criou nova estimativa de custo — NCM 8471.30.19',
      entidade: 'SimulaCusto',
      diff: [{ campo: 'NCM', antes: '', depois: '8471.30.19' }, { campo: 'Valor FOB', antes: '', depois: 'USD 12.500,00' }]
    },
    {
      id: 'log_4', quando: '2026-03-25T16:40:00Z', quemNome: 'Sistema', quemTipo: 'system' as const,
      acao: 'CONFIGURAÇÃO', oQueFoiFeito: 'Rotina de verificação de integridade de dados concluída',
      entidade: 'Sistema',
      diff: []
    },
    {
      id: 'log_5', quando: '2026-03-25T15:10:00Z', quemNome: 'Maria Souza', quemTipo: 'user' as const,
      acao: 'ENVIO', oQueFoiFeito: 'Enviou email para fornecedor — Proposta Comercial Q1/2026',
      entidade: 'Email',
      diff: [{ campo: 'Destinatário', antes: '', depois: 'fornecedor@example.com' }, { campo: 'Template', antes: '', depois: 'Proposta Comercial' }]
    },
    {
      id: 'log_6', quando: '2026-03-25T14:00:00Z', quemNome: 'Daniel Martins', quemTipo: 'user' as const,
      acao: 'ALTERAÇÃO', oQueFoiFeito: 'Alterou permissão de usuário para Administrador',
      entidade: 'Usuários',
      diff: [{ campo: 'Role', antes: 'Membro', depois: 'Administrador' }]
    },
    {
      id: 'log_7', quando: '2026-03-25T09:30:00Z', quemNome: 'Gabi AI', quemTipo: 'gabi' as const,
      acao: 'IA', oQueFoiFeito: 'Respondeu pergunta sobre alíquota de IPI para NCM 8471',
      entidade: 'Gabi',
      diff: []
    },
    {
      id: 'log_8', quando: '2026-03-24T18:15:00Z', quemNome: 'Carlos Ferreira', quemTipo: 'user' as const,
      acao: 'EXCLUSÃO', oQueFoiFeito: 'Removeu estimativa de custo duplicada #EST-2026-142',
      entidade: 'SimulaCusto',
      diff: [{ campo: 'ID', antes: 'EST-2026-142', depois: '' }, { campo: 'Status', antes: 'Rascunho', depois: '' }]
    },
    {
      id: 'log_9', quando: '2026-03-24T14:00:00Z', quemNome: 'Daniel Martins', quemTipo: 'user' as const,
      acao: 'LOGIN', oQueFoiFeito: 'Acesso ao sistema via SSO Clerk',
      entidade: 'Autenticação',
      diff: []
    },
    {
      id: 'log_10', quando: '2026-03-24T10:30:00Z', quemNome: 'Sistema', quemTipo: 'system' as const,
      acao: 'RECEBIMENTO', oQueFoiFeito: 'Recebeu webhook do Stripe — fatura paga',
      entidade: 'Financeiro',
      diff: [{ campo: 'Invoice ID', antes: '', depois: 'inv_2026_0324' }, { campo: 'Valor', antes: '', depois: 'R$ 2.490,00' }]
    },
    {
      id: 'log_11', quando: '2026-03-23T17:45:00Z', quemNome: 'Ana Costa', quemTipo: 'user' as const,
      acao: 'EXPORTAÇÃO', oQueFoiFeito: 'Exportou relatório de estimativas em PDF',
      entidade: 'Relatórios',
      diff: []
    },
    {
      id: 'log_12', quando: '2026-03-23T11:20:00Z', quemNome: 'Gabi AI', quemTipo: 'gabi' as const,
      acao: 'IA', oQueFoiFeito: 'Sugeriu correção de alíquota de ICMS para operação interestadual SP→RJ',
      entidade: 'SimulaCusto',
      diff: [{ campo: 'ICMS (%)', antes: '18%', depois: '12%' }, { campo: 'Motivo', antes: '', depois: 'Interestadual SP→RJ' }]
    },
  ]
  return base
}

// ─── Cores de ação ────────────────────────────────────────────────────────────

const corAcao: Record<string, { bg: string; text: string; border: string }> = {
  'CRIAÇÃO':       { bg: 'rgba(52,211,153,0.12)',  text: '#34d399', border: 'rgba(52,211,153,0.3)' },
  'ALTERAÇÃO':     { bg: 'rgba(129,140,248,0.12)', text: '#818cf8', border: 'rgba(129,140,248,0.3)' },
  'EXCLUSÃO':      { bg: 'rgba(248,113,113,0.12)', text: '#f87171', border: 'rgba(248,113,113,0.3)' },
  'ENVIO':         { bg: 'rgba(192,132,252,0.12)', text: '#c084fc', border: 'rgba(192,132,252,0.3)' },
  'RECEBIMENTO':   { bg: 'rgba(251,191,36,0.12)',  text: '#fbbf24', border: 'rgba(251,191,36,0.3)' },
  'EXPORTAÇÃO':    { bg: 'rgba(148,163,184,0.12)', text: '#94a3b8', border: 'rgba(148,163,184,0.3)' },
  'LOGIN':         { bg: 'rgba(45,212,191,0.12)',  text: '#2dd4bf', border: 'rgba(45,212,191,0.3)' },
  'CONFIGURAÇÃO':  { bg: 'rgba(249,115,22,0.12)',  text: '#f97316', border: 'rgba(249,115,22,0.3)' },
  'IA':            { bg: 'rgba(167,139,250,0.12)', text: '#a78bfa', border: 'rgba(167,139,250,0.3)' },
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(iso: string) {
  const d = new Date(iso)
  const pad = (n: number) => n.toString().padStart(2, '0')
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}, ${pad(d.getHours())}:${pad(d.getMinutes())}`
}

function renderDiffTable(diffs: DiffObj[]) {
  if (!diffs || diffs.length === 0) {
    return (
      <div style={{ padding: '1rem', color: '#64748b', fontSize: '0.8125rem' }}>
        Nenhum detalhe de campo alterado registrado para essa ação.
      </div>
    )
  }
  return (
    <div style={{ padding: '0.5rem 0' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8125rem' }}>
        <thead>
          <tr>
            <th style={{ textAlign: 'left', padding: '0.75rem 1rem', width: '20%', color: '#94a3b8', fontWeight: 600, borderBottom: '1px solid rgba(129,140,248,0.1)', textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '0.7rem' }}>Campo</th>
            <th style={{ textAlign: 'left', padding: '0.75rem 1rem', width: '40%', color: '#94a3b8', fontWeight: 600, borderBottom: '1px solid rgba(129,140,248,0.1)', textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '0.7rem' }}>Antes</th>
            <th style={{ textAlign: 'left', padding: '0.75rem 1rem', width: '40%', color: '#94a3b8', fontWeight: 600, borderBottom: '1px solid rgba(129,140,248,0.1)', textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '0.7rem' }}>Depois</th>
          </tr>
        </thead>
        <tbody>
          {diffs.map((d, i) => (
            <tr key={i} style={{ borderBottom: i < diffs.length - 1 ? '1px solid rgba(129,140,248,0.06)' : 'none' }}>
              <td style={{ padding: '0.75rem 1rem', color: '#cbd5e1', fontWeight: 500 }}>{d.campo}</td>
              <td style={{ padding: '0.75rem 1rem', color: '#f87171' }}>{d.antes || <span style={{ color: '#64748b', fontStyle: 'italic' }}>vazio</span>}</td>
              <td style={{ padding: '0.75rem 1rem', color: '#34d399' }}>{d.depois || <span style={{ color: '#64748b', fontStyle: 'italic' }}>vazio</span>}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// ─── Componente Principal ─────────────────────────────────────────────────────

export function TenantDetail({ tenantId, onBack }: { tenantId: string; onBack: () => void }) {
  const [tab, setTab] = useState<TabKey>('auditoria')
  const [loading, setLoading] = useState(true)

  const tenant = useMemo(() => MOCK_TENANTS.find(t => t.id === tenantId), [tenantId])
  const logs = useMemo(() => tenant ? gerarLogsMock(tenant.name) : [], [tenant])

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 400)
    return () => clearTimeout(timer)
  }, [])

  if (loading) {
    return (
      <div style={{ padding: 64, textAlign: 'center', color: 'var(--ws-text-muted, #94a3b8)' }}>
        <ClockCounterClockwise size={28} weight="duotone" style={{ marginBottom: 8, opacity: 0.5 }} />
        <div>Carregando painel de auditoria...</div>
      </div>
    )
  }

  if (!tenant) {
    return (
      <div style={{ padding: 64, textAlign: 'center', color: '#f87171' }}>
        <div style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: 8 }}>Tenant não encontrado</div>
        <div style={{ color: '#94a3b8', fontSize: '0.875rem', marginBottom: 24 }}>ID: <code style={{ color: '#818cf8' }}>{tenantId}</code></div>
        <button onClick={onBack} style={{ color: '#818cf8', background: 'rgba(129,140,248,0.08)', border: '1px solid rgba(129,140,248,0.2)', borderRadius: '8px', padding: '8px 20px', cursor: 'pointer', fontWeight: 600, fontFamily: 'inherit', fontSize: '0.875rem', transition: 'all 0.15s' }}>
          ← Voltar ao painel
        </button>
      </div>
    )
  }

  const sub = tenant.subscriptions[0]
  const totalWs = tenant.workspaces.length
  const wsAtivos = tenant.workspaces.filter(ws => ws.status === 'Ativa').length

  // ── Colunas da Tabela de Auditoria ────────────────────────────────────────

  const COLUNAS_AUDIT: TabelaGlobalColuna<LogAuditoria>[] = [
    {
      key: 'quando', label: 'QUANDO', tipo: 'periodo',
      tooltipTitulo: 'Timestamp (UTC)',
      tooltipDescricao: 'Data/hora (ISO-8601) em que o evento foi gravado na tabela de auditoria.',
      render: (v) => <span style={{ color: '#cbd5e1', fontSize: '0.8125rem' }}>{formatDate(v as string)}</span>
    },
    {
      key: 'quemNome', label: 'QUEM', tipo: 'texto',
      tooltipTitulo: 'Identity Context',
      tooltipDescricao: 'Ator autenticado ou sistema que originou a ação.',
      render: (v, item) => {
        let ico = <User size={14} weight="bold" />
        if (item.quemTipo === 'gabi') ico = <Robot size={14} weight="bold" />
        else if (item.quemTipo === 'system') ico = <HardDrives size={14} weight="bold" />
        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>{ico}</div>
            <span style={{ fontWeight: 600, color: '#f1f5f9' }}>{v as string}</span>
          </div>
        )
      }
    },
    {
      key: 'acao', label: 'AÇÃO', tipo: 'texto',
      tooltipTitulo: 'Event Type',
      tooltipDescricao: 'Taxonomia da operação registrada.',
      render: (v) => {
        const cor = corAcao[v as string] || corAcao['CRIAÇÃO']
        return (
          <span style={{
            display: 'inline-flex', padding: '0.2rem 0.625rem', borderRadius: '9999px',
            fontSize: '0.6875rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em',
            background: cor.bg, color: cor.text, border: `1px solid ${cor.border}`
          }}>
            {v as string}
          </span>
        )
      }
    },
    {
      key: 'oQueFoiFeito', label: 'O QUE FOI FEITO', tipo: 'texto',
      tooltipTitulo: 'Event Payload',
      tooltipDescricao: 'Descrição legível do que foi modificado.',
      render: (v, item) => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{
              padding: '0.1rem 0.35rem', borderRadius: '4px', background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)', fontSize: '0.65rem', fontWeight: 600, color: '#94a3b8',
            }}>
              {item.entidade.toLowerCase().replace(/ /g, '_')}
            </span>
            <span style={{ color: '#e2e8f0', fontWeight: 500, fontSize: '0.8125rem' }}>{v as string}</span>
          </div>
          {item.diff && item.diff.length > 0 && (
            <div style={{ fontSize: '0.75rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              : <span style={{ color: '#f87171', background: 'rgba(248,113,113,0.1)', padding: '0.1rem 0.3rem', borderRadius: '4px' }}>{item.diff[0].antes || '—'}</span>
              <span>→</span>
              <span style={{ color: '#34d399', background: 'rgba(52,211,153,0.1)', padding: '0.1rem 0.3rem', borderRadius: '4px' }}>{item.diff[0].depois || '—'}</span>
            </div>
          )}
        </div>
      )
    },
    {
      key: 'entidade', label: 'ENTIDADE', tipo: 'texto',
      tooltipTitulo: 'Target Entity',
      tooltipDescricao: 'Módulo alvo da ação.',
      render: (v) => <span style={{ color: '#94a3b8' }}>{v as string}</span>
    }
  ]

  // ── Colunas da Tabela de Workspaces ───────────────────────────────────────

  const COLUNAS_WS: TabelaGlobalColuna<Workspace>[] = [
    {
      key: 'nome', label: 'Workspace', tipo: 'texto',
      render: (_v, item) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{ width: 24, height: 24, minWidth: 24, borderRadius: '6px', background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.5625rem', fontWeight: 700, color: '#34d399' }}>
            {item.nome.charAt(0).toUpperCase()}
          </div>
          <span style={{ fontWeight: 500 }}>{item.nome}</span>
        </div>
      )
    },
    {
      key: 'subdominio', label: 'Subdomínio', tipo: 'texto',
      render: (v) => <code style={{ fontSize: '0.8rem', color: '#a5b4fc', background: 'rgba(165,180,252,0.08)', padding: '0.1rem 0.35rem', borderRadius: '4px' }}>{v as string}.gravity.com.br</code>
    },
    {
      key: 'status', label: 'Status', tipo: 'texto',
      render: (v) => <StatusBadgeGlobal valor={v as string} />
    },
    {
      key: 'plano', label: 'Plano', tipo: 'texto',
      render: (v) => <span style={{ color: '#94a3b8', fontSize: '0.8125rem' }}>{v as string}</span>
    },
    {
      key: 'usuarios', label: 'Usuários', align: 'center', tipo: 'texto',
      render: (v) => <span style={{ fontWeight: 600 }}>{v as number}</span>
    },
  ]

  // ── Ações de exportação ───────────────────────────────────────────────────

  const acoesExport: TabelaExportAcao<LogAuditoria>[] = [
    { label: 'Exportar CSV', icone: <Export size={14} />, onClick: () => {} },
    { label: 'Backup JSON', icone: <DownloadSimple size={14} />, onClick: () => {} },
  ]

  // ── Tabs ──────────────────────────────────────────────────────────────────

  const TABS: { key: TabKey; label: string; icon: React.ReactNode }[] = [
    { key: 'auditoria', label: 'Histórico de Auditoria', icon: <ClockCounterClockwise size={15} weight="bold" /> },
    { key: 'workspaces', label: `Workspaces (${totalWs})`, icon: <TreeStructure size={15} weight="bold" /> },
    { key: 'usuarios', label: `Usuários (${tenant._count.users})`, icon: <UsersThree size={15} weight="bold" /> },
    { key: 'billing', label: 'Faturamento', icon: <CreditCard size={15} weight="bold" /> },
  ]

  return (
    <PaginaGlobal
      className="ws-fade-up"
      layout="lista"
      cabecalho={
        <CabecalhoGlobal
          icone={<ShieldCheck weight="duotone" size={22} color="#34d399" />}
          titulo={`Painel de Auditoria — ${tenant.name}`}
          subtitulo={`Visão forense completa do tenant ${tenant.slug}.gravity.com.br • ID: ${tenant.id}`}
          acoes={
            <button
              onClick={onBack}
              style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                background: 'rgba(129,140,248,0.08)', border: '1px solid rgba(129,140,248,0.2)',
                borderRadius: '8px', padding: '8px 16px', color: '#818cf8', cursor: 'pointer',
                fontWeight: 600, fontFamily: 'inherit', fontSize: '0.8125rem', transition: 'all 0.15s',
              }}
              onMouseEnter={ev => { ev.currentTarget.style.background = 'rgba(129,140,248,0.15)' }}
              onMouseLeave={ev => { ev.currentTarget.style.background = 'rgba(129,140,248,0.08)' }}
            >
              <ArrowLeft size={15} weight="bold" />
              Voltar
            </button>
          }
        />
      }
      stats={
        <>
          <CardBasicoGlobal
            titulo="Organização"
            icone={<Buildings weight="duotone" size={16} style={{ color: '#6366f1' }} />}
            valor={tenant.name}
            tooltip={
              <>
                <p className="cg-tooltip__title">Dados do Tenant</p>
                <div className="cg-tooltip__row"><span>ID</span> <strong>{tenant.id}</strong></div>
                <div className="cg-tooltip__row"><span>Slug</span> <strong>{tenant.slug}</strong></div>
                <div className="cg-tooltip__row"><span>Criado em</span> <strong>{new Date(tenant.created_at).toLocaleDateString('pt-BR')}</strong></div>
              </>
            }
          />
          <CardBasicoGlobal
            titulo="Workspaces"
            icone={<TreeStructure weight="duotone" size={16} style={{ color: '#34d399' }} />}
            valor={`${wsAtivos} / ${totalWs}`}
            tooltip={
              <>
                <p className="cg-tooltip__title">Workspaces</p>
                <div className="cg-tooltip__row"><span>Ativos</span> <strong style={{ color: '#34d399' }}>{wsAtivos}</strong></div>
                <div className="cg-tooltip__row"><span>Total</span> <strong>{totalWs}</strong></div>
              </>
            }
          />
          <CardBasicoGlobal
            titulo="Usuários"
            icone={<UsersThree weight="duotone" size={16} style={{ color: '#8b5cf6' }} />}
            valor={tenant._count.users}
            tooltip={
              <>
                <p className="cg-tooltip__title">Pool de Identidades</p>
                <div className="cg-tooltip__row"><span>Usuários Ativos</span> <strong>{tenant._count.users}</strong></div>
              </>
            }
          />
          <CardBasicoGlobal
            titulo="Plano"
            icone={<Package weight="duotone" size={16} style={{ color: '#fbbf24' }} />}
            valor={sub?.plan || 'N/A'}
            tooltip={
              <>
                <p className="cg-tooltip__title">Assinatura</p>
                <div className="cg-tooltip__row"><span>Plano</span> <strong>{sub?.plan}</strong></div>
                <div className="cg-tooltip__row"><span>Status</span> <strong>{sub?.status}</strong></div>
                <div className="cg-tooltip__row"><span>Produtos</span> <strong>{tenant.subscriptions.length}</strong></div>
              </>
            }
          />
        </>
      }
    >
      {/* ── Tab Bar ────────────────────────────────────────────────────────── */}
      <div style={{
        display: 'flex', gap: 0,
        borderBottom: '1px solid rgba(129,140,248,0.1)',
        marginBottom: '16px',
      }}>
        {TABS.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              padding: '10px 18px',
              color: tab === t.key ? '#818cf8' : '#64748b',
              fontWeight: tab === t.key ? 600 : 400,
              cursor: 'pointer',
              background: 'transparent',
              border: 'none',
              borderBottom: `2px solid ${tab === t.key ? '#818cf8' : 'transparent'}`,
              fontFamily: 'inherit',
              fontSize: '0.8125rem',
              transition: 'all 0.15s',
            }}
            onMouseEnter={ev => { if (tab !== t.key) ev.currentTarget.style.color = '#94a3b8' }}
            onMouseLeave={ev => { if (tab !== t.key) ev.currentTarget.style.color = '#64748b' }}
          >
            {t.icon}
            {t.label}
          </button>
        ))}
      </div>

      {/* ── Tab: Auditoria ─────────────────────────────────────────────────── */}
      {tab === 'auditoria' && (
        <div className="ws-fade-up" style={{ position: 'relative', zIndex: 10 }}>
          <TabelaGlobal<LogAuditoria>
            dados={logs}
            colunas={COLUNAS_AUDIT}
            acoesExportacao={acoesExport}
            mensagemVazio="Nenhuma atividade registrada para este tenant."
            renderExpandido={(item) => renderDiffTable(item.diff || [])}
          />
        </div>
      )}

      {/* ── Tab: Workspaces ────────────────────────────────────────────────── */}
      {tab === 'workspaces' && (
        <div className="ws-fade-up" style={{ position: 'relative', zIndex: 10 }}>
          <TabelaGlobal<Workspace>
            dados={tenant.workspaces}
            colunas={COLUNAS_WS}
            mensagemVazio="Nenhum workspace cadastrado para este tenant."
          />
        </div>
      )}

      {/* ── Tab: Usuários ──────────────────────────────────────────────────── */}
      {tab === 'usuarios' && (
        <div className="ws-fade-up" style={{ padding: '24px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(129,140,248,0.08)', borderRadius: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', color: '#94a3b8', fontSize: '0.8125rem' }}>
            <Info size={16} weight="duotone" color="#3b82f6" />
            Em modo de demonstração — dados de usuários individuais não disponíveis no mock.
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
            {[
              { label: 'Total de Usuários', value: tenant._count.users },
              { label: 'Empresas Vinculadas', value: tenant._count.companies },
              { label: 'Produtos Contratados', value: tenant.subscriptions.length },
            ].map(({ label, value }) => (
              <div key={label} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '10px', padding: '16px' }}>
                <div style={{ color: '#64748b', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '6px' }}>{label}</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#f1f5f9' }}>{value}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Tab: Faturamento ───────────────────────────────────────────────── */}
      {tab === 'billing' && (
        <div className="ws-fade-up" style={{ padding: '24px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(129,140,248,0.08)', borderRadius: '12px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '20px' }}>
            {[
              { label: 'Plano Principal', value: sub?.plan || 'N/A', cor: '#818cf8' },
              { label: 'Status da Assinatura', value: sub?.status || 'N/A', cor: sub?.status === 'ACTIVE' ? '#34d399' : '#fbbf24' },
              { label: 'Produtos Ativos', value: tenant.subscriptions.filter(s => s.status === 'ACTIVE').length, cor: '#f1f5f9' },
            ].map(({ label, value, cor }) => (
              <div key={label} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '10px', padding: '16px' }}>
                <div style={{ color: '#64748b', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '6px' }}>{label}</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 700, color: cor }}>{value}</div>
              </div>
            ))}
          </div>
          {tenant.subscriptions.length > 1 && (
            <>
              <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '10px' }}>Produtos contratados</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {tenant.subscriptions.map((s, i) => (
                  <span key={i} style={{
                    fontSize: '0.75rem', fontWeight: 700, padding: '6px 14px', borderRadius: '8px',
                    background: s.status === 'ACTIVE' ? 'rgba(52,211,153,0.08)' : 'rgba(251,191,36,0.08)',
                    color: s.status === 'ACTIVE' ? '#34d399' : '#fbbf24',
                    border: `1px solid ${s.status === 'ACTIVE' ? 'rgba(52,211,153,0.2)' : 'rgba(251,191,36,0.2)'}`,
                  }}>
                    {s.plan}
                  </span>
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </PaginaGlobal>
  )
}
