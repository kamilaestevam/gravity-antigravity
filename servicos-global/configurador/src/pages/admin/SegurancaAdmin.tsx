import React, { useState, useEffect } from 'react'
import {
  ShieldCheck, ShieldWarning, ShieldSlash,
  Lock, LockOpen, Eye, Warning, CheckCircle,
  ArrowsClockwise, UserCircle, Database,
  Globe, Key, Webhook, Bug, Timer,
  Funnel,
} from '@phosphor-icons/react'
import { PaginaGlobal } from '@nucleo/pagina-global'
import { CabecalhoGlobal } from '@nucleo/cabecalho-global'
import { TabelaGlobal, type TabelaGlobalColuna } from '@nucleo/tabela-global'
import { StatCardGlobal } from '@nucleo/card-global'
import { SelectGlobal } from '@nucleo/campo-select-global'
import { TooltipGlobal } from '@nucleo/tooltip-global'

// ─── Tipos ────────────────────────────────────────────────────────────────

type Severidade = 'CRITICAL' | 'WARNING' | 'INFO'
type EventStatus = 'BLOCKED' | 'ALLOWED' | 'DETECTED'
type CamadaStatus = 'OK' | 'DEGRADED' | 'DOWN'

interface SecurityEvent {
  id: string
  timestamp: string
  tipo: string
  severidade: Severidade
  status: EventStatus
  tenant: string
  actor: string
  descricao: string
  ip: string
  correlationId: string
}

interface CamadaSeguranca {
  nome: string
  status: CamadaStatus
  ultimoCheck: string
  detalhes: string
}

interface RateLimitEntry {
  tenant: string
  ip: string
  endpoint: string
  count: number
  limit: number
  blocked: boolean
  lastHit: string
}

// ─── Mock Data ────────────────────────────────────────────────────────────

const CAMADAS_MOCK: CamadaSeguranca[] = [
  { nome: 'Rede (SSL/Railway)', status: 'OK', ultimoCheck: 'agora', detalhes: 'SSL ativo em todas as conexoes' },
  { nome: 'Autenticacao (Clerk JWT)', status: 'OK', ultimoCheck: '2s atras', detalhes: '0 falhas de auth nos ultimos 5min' },
  { nome: 'Autorizacao (RBAC)', status: 'OK', ultimoCheck: '5s atras', detalhes: '5 papeis, 47 permissoes granulares ativas' },
  { nome: 'Isolamento (Prisma + RLS)', status: 'OK', ultimoCheck: '1s atras', detalhes: '0 tentativas cross-tenant detectadas' },
  { nome: 'Auditoria (HistoryLog)', status: 'OK', ultimoCheck: '3s atras', detalhes: '1.247 eventos registrados hoje' },
  { nome: 'Rate Limiting', status: 'OK', ultimoCheck: '1s atras', detalhes: '0 IPs bloqueados atualmente' },
  { nome: 'Security Headers (Helmet)', status: 'OK', ultimoCheck: 'boot', detalhes: '17/17 servicos com helmet ativo' },
]

const EVENTS_MOCK: SecurityEvent[] = [
  { id: 'e1', timestamp: '2026-03-29 14:32:15', tipo: 'AUTH_FAILURE', severidade: 'WARNING', status: 'BLOCKED', tenant: 'tenant-abc', actor: 'anonymous', descricao: 'JWT expirado - tentativa de acesso a /api/v1/tenants', ip: '189.45.12.8', correlationId: 'corr-001' },
  { id: 'e2', timestamp: '2026-03-29 14:30:02', tipo: 'RATE_LIMIT_HIT', severidade: 'WARNING', status: 'BLOCKED', tenant: 'tenant-xyz', actor: 'user-456', descricao: 'Rate limit 30/min atingido em /api/v1/master-data', ip: '201.33.44.55', correlationId: 'corr-002' },
  { id: 'e3', timestamp: '2026-03-29 14:28:44', tipo: 'CROSS_TENANT_ATTEMPT', severidade: 'CRITICAL', status: 'BLOCKED', tenant: 'tenant-abc', actor: 'user-789', descricao: 'Tentativa de acessar recurso do tenant-xyz via ID direto', ip: '189.45.12.8', correlationId: 'corr-003' },
  { id: 'e4', timestamp: '2026-03-29 14:25:11', tipo: 'PERMISSION_GRANTED', severidade: 'INFO', status: 'ALLOWED', tenant: 'tenant-abc', actor: 'admin-001', descricao: 'Permissao email:write concedida ao usuario user-123', ip: '10.0.0.1', correlationId: 'corr-004' },
  { id: 'e5', timestamp: '2026-03-29 14:22:33', tipo: 'ROLE_CHANGED', severidade: 'CRITICAL', status: 'ALLOWED', tenant: 'tenant-abc', actor: 'master-001', descricao: 'Role de user-456 alterado de STANDARD para ADMIN', ip: '10.0.0.2', correlationId: 'corr-005' },
  { id: 'e6', timestamp: '2026-03-29 14:20:00', tipo: 'WEBHOOK_SIGNATURE_FAILURE', severidade: 'CRITICAL', status: 'BLOCKED', tenant: 'system', actor: 'webhook', descricao: 'Assinatura Svix invalida em webhook Clerk - possivel replay attack', ip: '52.18.93.1', correlationId: 'corr-006' },
  { id: 'e7', timestamp: '2026-03-29 14:18:45', tipo: 'CREDENTIAL_CREATED', severidade: 'INFO', status: 'ALLOWED', tenant: 'tenant-xyz', actor: 'admin-002', descricao: 'Nova API key criada: gv_live_sk_***...a3f2 (scope: READ)', ip: '10.0.0.3', correlationId: 'corr-007' },
  { id: 'e8', timestamp: '2026-03-29 14:15:22', tipo: 'ADMIN_ACCESS', severidade: 'INFO', status: 'ALLOWED', tenant: 'gravity-hq', actor: 'gravity-admin', descricao: 'Admin acessou dados do tenant-abc via painel', ip: '10.0.0.1', correlationId: 'corr-008' },
  { id: 'e9', timestamp: '2026-03-29 14:10:01', tipo: 'DATA_DELETED', severidade: 'CRITICAL', status: 'ALLOWED', tenant: 'tenant-xyz', actor: 'admin-002', descricao: 'LGPD: Dados do usuario user-old excluidos (3 tabelas, 47 registros)', ip: '10.0.0.3', correlationId: 'corr-009' },
  { id: 'e10', timestamp: '2026-03-29 14:05:55', tipo: 'AUTH_FAILURE', severidade: 'WARNING', status: 'BLOCKED', tenant: 'system', actor: 'anonymous', descricao: 'x-internal-key invalida em chamada S2S para /api/v1/cockpit/tokens', ip: '172.16.0.5', correlationId: 'corr-010' },
]

const RATE_LIMIT_MOCK: RateLimitEntry[] = [
  { tenant: 'tenant-xyz', ip: '201.33.44.55', endpoint: '/api/v1/master-data', count: 31, limit: 30, blocked: true, lastHit: '14:30:02' },
  { tenant: 'tenant-abc', ip: '189.45.12.8', endpoint: '/api/v1/plans', count: 22, limit: 30, blocked: false, lastHit: '14:29:50' },
  { tenant: 'anonymous', ip: '52.18.93.1', endpoint: '/api/v1/webhooks', count: 88, limit: 100, blocked: false, lastHit: '14:28:11' },
]

// ─── Helpers ──────────────────────────────────────────────────────────────

function getSeveridadeStyle(sev: Severidade) {
  switch (sev) {
    case 'CRITICAL': return { background: '#991b1b', color: '#fecaca' }
    case 'WARNING': return { background: '#92400e', color: '#fde68a' }
    case 'INFO': return { background: '#1e3a5f', color: '#93c5fd' }
  }
}

function getStatusStyle(status: EventStatus) {
  switch (status) {
    case 'BLOCKED': return { background: '#7f1d1d', color: '#fca5a5' }
    case 'ALLOWED': return { background: '#14532d', color: '#86efac' }
    case 'DETECTED': return { background: '#78350f', color: '#fcd34d' }
  }
}

function getCamadaStatusStyle(status: CamadaStatus) {
  switch (status) {
    case 'OK': return { color: '#34d399' }
    case 'DEGRADED': return { color: '#fbbf24' }
    case 'DOWN': return { color: '#f87171' }
  }
}

function getCamadaIcon(status: CamadaStatus) {
  switch (status) {
    case 'OK': return <ShieldCheck weight="fill" size={20} style={{ color: '#34d399' }} />
    case 'DEGRADED': return <ShieldWarning weight="fill" size={20} style={{ color: '#fbbf24' }} />
    case 'DOWN': return <ShieldSlash weight="fill" size={20} style={{ color: '#f87171' }} />
  }
}

// ─── Componente Principal ─────────────────────────────────────────────────

export function SegurancaAdmin() {
  const [filtroSeveridade, setFiltroSeveridade] = useState<string>('TODOS')
  const [filtroTipo, setFiltroTipo] = useState<string>('TODOS')
  const [abaAtiva, setAbaAtiva] = useState<'overview' | 'events' | 'ratelimit' | 'secrets'>('overview')

  // Contadores para stat cards
  const criticalCount = EVENTS_MOCK.filter(e => e.severidade === 'CRITICAL').length
  const warningCount = EVENTS_MOCK.filter(e => e.severidade === 'WARNING').length
  const blockedCount = EVENTS_MOCK.filter(e => e.status === 'BLOCKED').length
  const allOk = CAMADAS_MOCK.every(c => c.status === 'OK')

  // Eventos filtrados
  const eventsFiltrados = EVENTS_MOCK.filter(e => {
    if (filtroSeveridade !== 'TODOS' && e.severidade !== filtroSeveridade) return false
    if (filtroTipo !== 'TODOS' && e.tipo !== filtroTipo) return false
    return true
  })

  // Colunas da tabela de eventos
  const colunasEventos: TabelaGlobalColuna<SecurityEvent>[] = [
    { key: 'timestamp', label: 'Horario', width: '140px' },
    {
      key: 'severidade', label: 'Severidade', width: '100px',
      render: (row) => (
        <span style={{
          ...getSeveridadeStyle(row.severidade),
          padding: '2px 8px', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 600,
        }}>
          {row.severidade}
        </span>
      ),
    },
    {
      key: 'status', label: 'Status', width: '90px',
      render: (row) => (
        <span style={{
          ...getStatusStyle(row.status),
          padding: '2px 8px', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 600,
        }}>
          {row.status}
        </span>
      ),
    },
    { key: 'tipo', label: 'Tipo', width: '200px' },
    { key: 'tenant', label: 'Tenant', width: '120px' },
    { key: 'actor', label: 'Ator', width: '110px' },
    { key: 'descricao', label: 'Descricao' },
    { key: 'ip', label: 'IP', width: '120px' },
  ]

  // Colunas da tabela de rate limiting
  const colunasRateLimit: TabelaGlobalColuna<RateLimitEntry>[] = [
    { key: 'tenant', label: 'Tenant', width: '140px' },
    { key: 'ip', label: 'IP', width: '130px' },
    { key: 'endpoint', label: 'Endpoint' },
    {
      key: 'count', label: 'Requests', width: '100px',
      render: (row) => (
        <span style={{ color: row.count >= row.limit ? '#f87171' : '#34d399', fontWeight: 600 }}>
          {row.count}/{row.limit}
        </span>
      ),
    },
    {
      key: 'blocked', label: 'Bloqueado', width: '100px',
      render: (row) => row.blocked
        ? <span style={{ color: '#f87171', fontWeight: 600 }}>SIM</span>
        : <span style={{ color: '#64748b' }}>Nao</span>,
    },
    { key: 'lastHit', label: 'Ultimo Hit', width: '100px' },
  ]

  // Tipos unicos para filtro
  const tiposUnicos = ['TODOS', ...new Set(EVENTS_MOCK.map(e => e.tipo))]

  return (
    <PaginaGlobal>
      <CabecalhoGlobal
        titulo="Seguranca"
        subtitulo="Monitoramento em tempo real — sem pontos cegos"
        icone={<ShieldCheck weight="duotone" size={24} />}
      />

      {/* ── Stat Cards ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
        <StatCardGlobal
          titulo="Status Geral"
          valor={allOk ? 'PROTEGIDO' : 'ATENCAO'}
          icone={allOk ? <ShieldCheck weight="fill" size={22} /> : <ShieldWarning weight="fill" size={22} />}
          cor={allOk ? '#10b981' : '#f59e0b'}
        />
        <StatCardGlobal
          titulo="Eventos Criticos"
          valor={String(criticalCount)}
          icone={<Warning weight="fill" size={22} />}
          cor={criticalCount > 0 ? '#ef4444' : '#10b981'}
        />
        <StatCardGlobal
          titulo="Alertas"
          valor={String(warningCount)}
          icone={<ShieldWarning weight="fill" size={22} />}
          cor={warningCount > 0 ? '#f59e0b' : '#10b981'}
        />
        <StatCardGlobal
          titulo="Bloqueados Hoje"
          valor={String(blockedCount)}
          icone={<Lock weight="fill" size={22} />}
          cor="#6366f1"
        />
      </div>

      {/* ── Abas ── */}
      <div style={{ display: 'flex', gap: '0.25rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--ws-border, #334155)' }}>
        {[
          { key: 'overview' as const, label: 'Camadas de Defesa', icon: <ShieldCheck size={16} /> },
          { key: 'events' as const, label: 'Eventos de Seguranca', icon: <Eye size={16} /> },
          { key: 'ratelimit' as const, label: 'Rate Limiting', icon: <Timer size={16} /> },
          { key: 'secrets' as const, label: 'Secrets & Rotacao', icon: <Key size={16} /> },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setAbaAtiva(tab.key)}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.4rem',
              padding: '0.6rem 1rem', border: 'none', cursor: 'pointer',
              background: abaAtiva === tab.key ? 'var(--ws-surface, #1e293b)' : 'transparent',
              color: abaAtiva === tab.key ? '#10b981' : 'var(--ws-muted, #94a3b8)',
              borderBottom: abaAtiva === tab.key ? '2px solid #10b981' : '2px solid transparent',
              fontSize: '0.85rem', fontWeight: abaAtiva === tab.key ? 600 : 400,
              transition: 'all 0.15s',
            }}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* ── Aba: Camadas de Defesa ── */}
      {abaAtiva === 'overview' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {CAMADAS_MOCK.map((camada, idx) => (
            <div
              key={idx}
              style={{
                display: 'flex', alignItems: 'center', gap: '1rem',
                padding: '1rem 1.25rem',
                background: 'var(--ws-surface, #1e293b)',
                borderRadius: '8px',
                border: '1px solid var(--ws-border, #334155)',
              }}
            >
              {getCamadaIcon(camada.status)}
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--ws-text, #f1f5f9)' }}>
                  Camada {idx + 1} — {camada.nome}
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--ws-muted, #94a3b8)', marginTop: '2px' }}>
                  {camada.detalhes}
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ ...getCamadaStatusStyle(camada.status), fontWeight: 700, fontSize: '0.85rem' }}>
                  {camada.status}
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--ws-muted, #64748b)', marginTop: '2px' }}>
                  {camada.ultimoCheck}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Aba: Eventos de Seguranca ── */}
      {abaAtiva === 'events' && (
        <>
          <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem' }}>
            <SelectGlobal
              label="Severidade"
              value={filtroSeveridade}
              onChange={(e) => setFiltroSeveridade(e.target.value)}
              options={[
                { value: 'TODOS', label: 'Todas' },
                { value: 'CRITICAL', label: 'Critica' },
                { value: 'WARNING', label: 'Alerta' },
                { value: 'INFO', label: 'Info' },
              ]}
            />
            <SelectGlobal
              label="Tipo"
              value={filtroTipo}
              onChange={(e) => setFiltroTipo(e.target.value)}
              options={tiposUnicos.map(t => ({ value: t, label: t.replace(/_/g, ' ') }))}
            />
          </div>
          <TabelaGlobal
            dados={eventsFiltrados}
            colunas={colunasEventos}
            keyField="id"
            mensagemVazio="Nenhum evento de seguranca registrado"
          />
        </>
      )}

      {/* ── Aba: Rate Limiting ── */}
      {abaAtiva === 'ratelimit' && (
        <>
          <div style={{
            padding: '1rem', marginBottom: '1rem',
            background: 'var(--ws-surface, #1e293b)', borderRadius: '8px',
            border: '1px solid var(--ws-border, #334155)',
            fontSize: '0.82rem', color: 'var(--ws-muted, #94a3b8)',
          }}>
            <strong style={{ color: 'var(--ws-text, #f1f5f9)' }}>Presets ativos:</strong>{' '}
            Publico (30/min) | Auth (10/min) | Webhook (100/min) | Interno (200/min)
          </div>
          <TabelaGlobal
            dados={RATE_LIMIT_MOCK}
            colunas={colunasRateLimit}
            keyField="ip"
            mensagemVazio="Nenhum rate limit ativo"
          />
        </>
      )}

      {/* ── Aba: Secrets & Rotacao ── */}
      {abaAtiva === 'secrets' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {[
            { nome: 'INTERNAL_SERVICE_KEY', ultimaRotacao: '2026-01-15', proximaRotacao: '2026-04-15', status: 'OK' as const, dias: 17 },
            { nome: 'CLERK_SECRET_KEY', ultimaRotacao: '2026-02-01', proximaRotacao: '2026-05-01', status: 'OK' as const, dias: 33 },
            { nome: 'STRIPE_SECRET_KEY', ultimaRotacao: '2025-12-01', proximaRotacao: '2026-03-01', status: 'VENCIDA' as const, dias: -28 },
            { nome: 'ENCRYPTION_KEY (AES)', ultimaRotacao: '2026-03-01', proximaRotacao: '2026-06-01', status: 'OK' as const, dias: 64 },
            { nome: 'WHATSAPP_APP_SECRET', ultimaRotacao: '2026-02-15', proximaRotacao: '2026-05-15', status: 'OK' as const, dias: 47 },
          ].map((secret, idx) => (
            <div
              key={idx}
              style={{
                display: 'flex', alignItems: 'center', gap: '1rem',
                padding: '1rem 1.25rem',
                background: 'var(--ws-surface, #1e293b)',
                borderRadius: '8px',
                border: `1px solid ${secret.status === 'VENCIDA' ? '#7f1d1d' : 'var(--ws-border, #334155)'}`,
              }}
            >
              <Key weight="duotone" size={20} style={{ color: secret.status === 'VENCIDA' ? '#f87171' : '#10b981' }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--ws-text, #f1f5f9)' }}>
                  {secret.nome}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--ws-muted, #94a3b8)', marginTop: '2px' }}>
                  Ultima rotacao: {secret.ultimaRotacao} | Proxima: {secret.proximaRotacao}
                </div>
              </div>
              <div style={{
                padding: '3px 10px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600,
                background: secret.status === 'VENCIDA' ? '#7f1d1d' : '#14532d',
                color: secret.status === 'VENCIDA' ? '#fca5a5' : '#86efac',
              }}>
                {secret.status === 'VENCIDA' ? `VENCIDA (${Math.abs(secret.dias)}d)` : `OK (${secret.dias}d)`}
              </div>
            </div>
          ))}

          <div style={{
            padding: '1rem', marginTop: '0.5rem',
            background: 'var(--ws-surface-alt, #0f172a)', borderRadius: '8px',
            border: '1px solid var(--ws-border, #334155)',
            fontSize: '0.8rem', color: 'var(--ws-muted, #94a3b8)',
          }}>
            Para rotacionar chaves, execute: <code style={{ color: '#10b981' }}>npx tsx scripts/rotate-internal-key.ts</code>
          </div>
        </div>
      )}
    </PaginaGlobal>
  )
}
