// src/pages/OrganizacaoDetalheAdmin.tsx
// Painel de Auditoria de uma Organização — visão forense completa: dados + logs de atividade

import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
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
import { getAcoesExportacaoPadrao } from '../utils/export-helper'
import { adminOrganizacoesApi, type OrganizacaoApi, type WorkspaceApi } from '../services/api-client'


// ─── Tipos ────────────────────────────────────────────────────────────────────
// Painel forense — consome OrganizacaoApi/WorkspaceApi diretos (Paridade Absoluta DDD).

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

// ─── Helpers ─────────────────────────────────────────────────────────────────

function rotuloOrganizacao(status: string): string {
  if (status === 'ATIVO') return 'Ativa'
  if (status === 'SUSPENSO') return 'Suspensa'
  if (status === 'CANCELADO') return 'Cancelada'
  if (status === 'CONFIGURACAO_PENDENTE') return 'Pendente'
  return status
}

function rotuloWorkspace(status: string): string {
  return status === 'ATIVO' ? 'Ativa' : 'Suspensa'
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

export function OrganizacaoDetalheAdmin({ id_organizacao, onBack }: { id_organizacao: string; onBack: () => void }) {
  const { t } = useTranslation()
  const [tab, setTab] = useState<TabKey>('auditoria')
  const [loading, setLoading] = useState(true)
  const [organizacao, setOrganizacao] = useState<OrganizacaoApi | null>(null)
  const [logs, setLogs] = useState<LogAuditoria[]>([])

  useEffect(() => {
    async function loadOrganizacao() {
      setLoading(true)
      try {
        const res = await adminOrganizacoesApi.getById(id_organizacao)
        setOrganizacao(res.organizacao)

        // Tentar carregar logs de auditoria do histórico global
        try {
          const logsRes = await fetch(`/api/v1/admin/historico-global/logs?id_organizacao=${id_organizacao}`)
          if (logsRes.ok) {
            const logsData = await logsRes.json()
            const mappedLogs: LogAuditoria[] = (logsData.data || []).map((dbLog: Record<string, unknown>) => ({
              id: dbLog.id as string,
              quando: dbLog.created_at as string,
              quemNome: dbLog.actor_id as string,
              quemTipo: dbLog.actor_type === 'GABI_IA' ? 'gabi' : dbLog.actor_type === 'SYSTEM' ? 'system' : 'user',
              acao: dbLog.action as string,
              oQueFoiFeito: (dbLog.metadata as Record<string, string>)?.oQueFoiFeito || dbLog.action as string,
              entidade: (dbLog.metadata as Record<string, string>)?.entidade || dbLog.product_id as string || 'Sistema',
              diff: (dbLog.metadata as Record<string, DiffObj[]>)?.diff || [],
            }))
            setLogs(mappedLogs)
          }
        } catch {
          // Logs not available yet
        }
      } catch {
        setOrganizacao(null)
      } finally {
        setLoading(false)
      }
    }
    loadOrganizacao()
  }, [id_organizacao])

  if (loading) {
    return (
      <div style={{ padding: 64, textAlign: 'center', color: 'var(--ws-text-muted, #94a3b8)' }}>
        <ClockCounterClockwise size={28} weight="duotone" style={{ marginBottom: 8, opacity: 0.5 }} />
        <div>Carregando painel de auditoria...</div>
      </div>
    )
  }

  if (!organizacao) {
    return (
      <div style={{ padding: 64, textAlign: 'center', color: '#f87171' }}>
        <div style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: 8 }}>Organização não encontrada</div>
        <div style={{ color: '#94a3b8', fontSize: '0.875rem', marginBottom: 24 }}>ID: <code style={{ color: '#818cf8' }}>{id_organizacao}</code></div>
        <button onClick={onBack} style={{ color: '#818cf8', background: 'rgba(129,140,248,0.08)', border: '1px solid rgba(129,140,248,0.2)', borderRadius: '8px', padding: '8px 20px', cursor: 'pointer', fontWeight: 600, fontFamily: 'inherit', fontSize: '0.875rem', transition: 'all 0.15s' }}>
          ← Voltar ao painel
        </button>
      </div>
    )
  }

  // NOTA: dados de assinatura ainda não são renderizados aqui.
  // Placeholders até a fonte da verdade (configuracoes_produto ou billing) ser ligada.
  const totalProdutosContratados = 0
  const planoPrincipal = 'N/A'
  const statusAssinatura = 'N/A'
  const workspacesLista = organizacao.workspaces ?? []
  const totalWs = workspacesLista.length
  const wsAtivos = workspacesLista.filter(w => w.status_workspace === 'ATIVO').length
  const totalUsuarios = organizacao._count?.usuarios ?? 0
  const totalWorkspacesCount = organizacao._count?.workspaces ?? totalWs

  // ── Colunas da Tabela de Auditoria ────────────────────────────────────────

  const COLUNAS_AUDIT: TabelaGlobalColuna<LogAuditoria>[] = [
    {
      key: 'quando', label: t('admin.organizacao_detalhe.audit.quando'), tipo: 'periodo',
      tooltipTitulo: 'Timestamp (UTC)',
      tooltipDescricao: 'Data/hora (ISO-8601) em que o evento foi gravado na tabela de auditoria.',
      render: (v) => <span style={{ color: '#cbd5e1', fontSize: '0.8125rem' }}>{formatDate(v as string)}</span>
    },
    {
      key: 'quemNome', label: t('admin.organizacao_detalhe.audit.quem'), tipo: 'texto',
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
      key: 'acao', label: t('admin.organizacao_detalhe.audit.acao'), tipo: 'texto',
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
      key: 'oQueFoiFeito', label: t('admin.organizacao_detalhe.audit.o_que_foi_feito'), tipo: 'texto',
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
      key: 'entidade', label: t('admin.organizacao_detalhe.audit.entidade'), tipo: 'texto',
      tooltipTitulo: 'Target Entity',
      tooltipDescricao: 'Módulo alvo da ação.',
      render: (v) => <span style={{ color: '#94a3b8' }}>{v as string}</span>
    }
  ]

  // ── Colunas da Tabela de Workspaces ───────────────────────────────────────

  const COLUNAS_WS: TabelaGlobalColuna<WorkspaceApi>[] = [
    {
      key: 'nome_workspace', label: t('admin.organizacao_detalhe.workspaces.workspace'), tipo: 'texto',
      render: (_v, item) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{ width: 24, height: 24, minWidth: 24, borderRadius: '6px', background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.5625rem', fontWeight: 700, color: '#34d399' }}>
            {item.nome_workspace.charAt(0).toUpperCase()}
          </div>
          <span style={{ fontWeight: 500 }}>{item.nome_workspace}</span>
        </div>
      )
    },
    {
      key: 'subdominio_workspace', label: t('admin.organizacao_detalhe.workspaces.subdominio'), tipo: 'texto',
      render: (v) => <code style={{ fontSize: '0.8rem', color: '#a5b4fc', background: 'rgba(165,180,252,0.08)', padding: '0.1rem 0.35rem', borderRadius: '4px' }}>{v as string}.usegravity.com.br</code>
    },
    {
      key: 'status_workspace', label: t('admin.organizacao_detalhe.workspaces.status'), tipo: 'texto',
      render: (v) => <StatusBadgeGlobal valor={rotuloWorkspace(v as string)} />
    },
    {
      key: 'quantidade_usuarios_workspace', label: t('admin.organizacao_detalhe.workspaces.usuarios'), align: 'center', tipo: 'texto',
      render: (_v, item) => <span style={{ fontWeight: 600 }}>{item.quantidade_usuarios_workspace ?? item._count?.vinculos_workspace ?? 0}</span>
    },
  ]

  // ── Ações de exportação ───────────────────────────────────────────────────

  const acoesExport: TabelaExportAcao<LogAuditoria>[] = [
    { label: t('admin.organizacao_detalhe.export.exportar_csv'), icone: <Export size={14} />, onClick: () => {} },
    { label: t('admin.organizacao_detalhe.export.backup_json'), icone: <DownloadSimple size={14} />, onClick: () => {} },
  ]

  // ── Tabs ──────────────────────────────────────────────────────────────────

  const TABS: { key: TabKey; label: string; icon: React.ReactNode }[] = [
    { key: 'auditoria', label: t('admin.organizacao_detalhe.tabs.auditoria'), icon: <ClockCounterClockwise size={15} weight="bold" /> },
    { key: 'workspaces', label: `${t('admin.organizacao_detalhe.tabs.workspaces')} (${totalWs})`, icon: <TreeStructure size={15} weight="bold" /> },
    { key: 'usuarios', label: `${t('admin.organizacao_detalhe.tabs.usuarios')} (${totalUsuarios})`, icon: <UsersThree size={15} weight="bold" /> },
    { key: 'billing', label: t('admin.organizacao_detalhe.tabs.faturamento'), icon: <CreditCard size={15} weight="bold" /> },
  ]

  return (
    <PaginaGlobal
      className="ws-fade-up"
      layout="lista"
      cabecalho={
        <CabecalhoGlobal
          icone={<ShieldCheck weight="duotone" size={22} color="#34d399" />}
          titulo={`Painel de Auditoria — ${organizacao.nome_organizacao}`}
          subtitulo={`Visão forense completa da organização ${organizacao.subdominio_organizacao}.usegravity.com.br • ID: ${organizacao.id_organizacao}`}
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
            valor={organizacao.nome_organizacao}
            tooltip={
              <>
                <p className="cg-tooltip__title">Dados da Organização</p>
                <div className="cg-tooltip__row"><span>ID</span> <strong>{organizacao.id_organizacao}</strong></div>
                <div className="cg-tooltip__row"><span>Slug</span> <strong>{organizacao.subdominio_organizacao}</strong></div>
                <div className="cg-tooltip__row"><span>Criado em</span> <strong>{new Date(organizacao.data_criacao_organizacao).toLocaleDateString('pt-BR')}</strong></div>
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
            valor={totalUsuarios}
            tooltip={
              <>
                <p className="cg-tooltip__title">Pool de Identidades</p>
                <div className="cg-tooltip__row"><span>Usuários Ativos</span> <strong>{totalUsuarios}</strong></div>
              </>
            }
          />
          <CardBasicoGlobal
            titulo="Plano"
            icone={<Package weight="duotone" size={16} style={{ color: '#fbbf24' }} />}
            valor={planoPrincipal}
            tooltip={
              <>
                <p className="cg-tooltip__title">Assinatura</p>
                <div className="cg-tooltip__row"><span>Plano</span> <strong>{planoPrincipal}</strong></div>
                <div className="cg-tooltip__row"><span>Status</span> <strong>{statusAssinatura}</strong></div>
                <div className="cg-tooltip__row"><span>Produtos</span> <strong>{totalProdutosContratados}</strong></div>
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
            id={`admin-organizacao-audit-${organizacao.id_organizacao}`}
            idKey="id"
            dados={logs}
            colunas={COLUNAS_AUDIT}
            acoesExportacao={getAcoesExportacaoPadrao(COLUNAS_AUDIT, 'dados_tabela', 'Exportação de Dados')}
            mensagemVazio="Nenhuma atividade registrada para esta organização."
            renderExpandido={(item) => renderDiffTable(item.diff || [])}
          />
        </div>
      )}

      {/* ── Tab: Workspaces ────────────────────────────────────────────────── */}
      {tab === 'workspaces' && (
        <div className="ws-fade-up" style={{ position: 'relative', zIndex: 10 }}>
          <TabelaGlobal<WorkspaceApi>
            id={`admin-organizacao-workspaces-${organizacao.id_organizacao}`}
            idKey="id_workspace"
            dados={workspacesLista}
            colunas={COLUNAS_WS}
            mensagemVazio="Nenhum workspace cadastrado para esta organização."
          
        acoesExportacao={getAcoesExportacaoPadrao(COLUNAS_WS, 'dados_tabela', 'Exportação de Dados')}
      />
        </div>
      )}

      {/* ── Tab: Usuários ──────────────────────────────────────────────────── */}
      {tab === 'usuarios' && (
        <div className="ws-fade-up" style={{ padding: '24px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(129,140,248,0.08)', borderRadius: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', color: '#94a3b8', fontSize: '0.8125rem' }}>
            <Info size={16} weight="duotone" color="#3b82f6" />
            Dados agregados da organização. Listagem individual de usuários disponível na seção Usuários Globais.
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
            {[
              { label: t('admin.organizacao_detalhe.stats.total_usuarios'), value: totalUsuarios },
              { label: t('admin.organizacao_detalhe.stats.empresas_vinculadas'), value: totalWorkspacesCount },
              { label: t('admin.organizacao_detalhe.stats.produtos_contratados'), value: totalProdutosContratados },
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
              { label: 'Plano Principal', value: planoPrincipal, cor: '#818cf8' },
              { label: 'Status da Assinatura', value: statusAssinatura, cor: '#fbbf24' },
              { label: 'Produtos Ativos', value: 0, cor: '#f1f5f9' },
            ].map(({ label, value, cor }) => (
              <div key={label} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '10px', padding: '16px' }}>
                <div style={{ color: '#64748b', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '6px' }}>{label}</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 700, color: cor }}>{value}</div>
              </div>
            ))}
          </div>
          {false && (
            <>
              <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '10px' }}>Produtos contratados</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {([] as Array<{ plan: string; status: string }>).map((s, i) => (
                  <span key={i} style={{
                    fontSize: '0.75rem', fontWeight: 700, padding: '6px 14px', borderRadius: '8px',
                    background: s.status === 'ATIVA' ? 'rgba(52,211,153,0.08)' : 'rgba(251,191,36,0.08)',
                    color: s.status === 'ATIVA' ? '#34d399' : '#fbbf24',
                    border: `1px solid ${s.status === 'ATIVA' ? 'rgba(52,211,153,0.2)' : 'rgba(251,191,36,0.2)'}`,
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
