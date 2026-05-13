// src/pages/OrganizacoesAdmin.tsx
// Painel exclusivo para gravity_admin — gestão de todas as organizações da plataforma.
// Contrato em DDD puro: consome OrganizacaoApi direto sem mappers internos.

import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import type { Page } from '../App'
import { HardDrives, Buildings, TreeStructure, ChartPieSlice, UsersThree, MagnifyingGlass, PauseCircle, PlayCircle, FileXls, FileCsv, Database, PencilSimple } from '@phosphor-icons/react'
import { useShellStore } from '@gravity/shell'
import {
  adminOrganizacoesApi,
  adminOrganizacaoUpdateResponseSchema,
  type OrganizacaoApi,
  type WorkspaceApi,
} from '../services/api-client'

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
import type { Workspace } from './workspace/Workspaces'
import { getAcoesExportacaoPadrao } from '../utils/export-helper'

// ─── Tipos ────────────────────────────────────────────────────────────────────

export type OrganizacaoStatusUI = 'ATIVO' | 'SUSPENSO' | 'CANCELADO' | 'CONFIGURACAO_PENDENTE'

interface Stats {
  totalOrganizacoes:    number
  organizacoesAtivas:   number
  organizacoesSuspensas: number
  totalWorkspaces:      number
  workspacesAtivos:     number
  workspacesSuspensos:  number
  totalUsuarios:        number
}

// ─── Status badge / labels canonical PT-BR ────────────────────────────────────
//
// Enum no banco (REGRA 7 com dívida documentada): 'ATIVO' | 'SUSPENSO' |
// 'CANCELADO' | 'CONFIGURACAO_PENDENTE'. Labels exibidos abaixo são apenas para
// renderização — a chave canonical é o valor do enum.

function rotuloOrganizacao(status: string): string {
  if (status === 'ATIVO') return 'Ativa'
  if (status === 'CONFIGURACAO_PENDENTE') return 'Pendente'
  if (status === 'CANCELADO') return 'Cancelada'
  return 'Suspensa'
}

function rotuloWorkspace(status: string): string {
  return status === 'ATIVO' ? 'Ativa' : 'Suspensa'
}

const SHELL_URL = import.meta.env.VITE_SHELL_URL || 'http://localhost:8010'

// ─── Componente ───────────────────────────────────────────────────────────────

export function OrganizacoesAdmin({ navigate }: { navigate: (p: Page) => void }) {
  const { t } = useTranslation()
  const [organizacoes, setOrganizacoes] = useState<OrganizacaoApi[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showNovaOrg, setShowNovaOrg] = useState(false)

  const [orgEditando, setOrgEditando] = useState<OrganizacaoApi | null>(null)
  const [workspaceEditando, setWorkspaceEditando] = useState<Workspace | null>(null)

  const addNotification = useShellStore((state) => state.addNotification)

  async function fetchData() {
    setLoading(true)
    try {
      const [organizacoesRes, statsRes] = await Promise.all([
        adminOrganizacoesApi.list({ page: 1, limit: 100 }),
        adminOrganizacoesApi.getStats(),
      ])

      setOrganizacoes(organizacoesRes.organizacoes)

      const s = statsRes.stats
      const allWorkspaces = organizacoesRes.organizacoes.reduce(
        (sum, o) => sum + (o._count?.workspaces ?? 0),
        0,
      )
      const activeWs = organizacoesRes.organizacoes.reduce(
        (sum, o) => sum + (o.workspaces ?? []).filter(w => w.status_workspace === 'ATIVO').length,
        0,
      )

      setStats({
        totalOrganizacoes:     s.totalOrganizacoes,
        organizacoesAtivas:    s.ativasOrganizacoes,
        organizacoesSuspensas: s.suspensasOrganizacoes,
        totalWorkspaces:       allWorkspaces,
        workspacesAtivos:      activeWs,
        workspacesSuspensos:   allWorkspaces - activeWs,
        totalUsuarios:         s.totalUsuarios,
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar os metadados do servidor. Painel rodando em read-only fallback.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchData() }, [])

  async function updateStatus(id_organizacao: string, statusBackend: OrganizacaoStatusUI) {
    try {
      await adminOrganizacoesApi.updateStatus(id_organizacao, statusBackend)
      setOrganizacoes(prev => prev.map(o =>
        o.id_organizacao === id_organizacao ? { ...o, status_organizacao: statusBackend } : o
      ))
      if (statusBackend === 'SUSPENSO' || statusBackend === 'CANCELADO') {
        setStats(prev => prev ? { ...prev, organizacoesAtivas: prev.organizacoesAtivas - 1, organizacoesSuspensas: prev.organizacoesSuspensas + 1 } : null)
        addNotification({ type: 'warning', message: `Organização suspensa com sucesso.` })
      } else {
        setStats(prev => prev ? { ...prev, organizacoesAtivas: prev.organizacoesAtivas + 1, organizacoesSuspensas: prev.organizacoesSuspensas - 1 } : null)
        addNotification({ type: 'success', message: `Organização reativada com sucesso.` })
      }
    } catch {
      addNotification({ type: 'error', message: 'Falha ao atualizar status da organização.' })
    }
  }

  async function updateWorkspaceStatus(id_workspace: string, statusBackend: 'ATIVO' | 'INATIVO') {
    try {
      await adminOrganizacoesApi.updateWorkspaceStatus(id_workspace, statusBackend)
      setOrganizacoes(prev => prev.map(o => ({
        ...o,
        workspaces: (o.workspaces ?? []).map(w =>
          w.id_workspace === id_workspace ? { ...w, status_workspace: statusBackend } : w
        ),
      })))
      if (statusBackend === 'INATIVO') {
        setStats(prev => prev ? { ...prev, workspacesAtivos: prev.workspacesAtivos - 1, workspacesSuspensos: prev.workspacesSuspensos + 1 } : null)
      } else {
        setStats(prev => prev ? { ...prev, workspacesAtivos: prev.workspacesAtivos + 1, workspacesSuspensos: prev.workspacesSuspensos - 1 } : null)
      }
      addNotification({
        type: statusBackend === 'INATIVO' ? 'warning' : 'success',
        message: `Workspace ${statusBackend === 'INATIVO' ? 'suspenso' : 'reativado'} com sucesso.`,
      })
    } catch (err) {
      addNotification({ type: 'error', message: err instanceof Error ? err.message : 'Erro ao atualizar workspace.' })
    }
  }

  async function handleSalvarOrg(dados: DadosNovaOrg) {
    try {
      const { organizacao } = await adminOrganizacoesApi.create({
        nome_organizacao: dados.nome,
        subdominio_organizacao: dados.subdominio,
        cnpj_organizacao: dados.cnpj || undefined,
      })
      setOrganizacoes(prev => [organizacao, ...prev])
      setStats(prev => prev ? { ...prev, totalOrganizacoes: prev.totalOrganizacoes + 1, organizacoesAtivas: prev.organizacoesAtivas + 1 } : null)
      setShowNovaOrg(false)
      addNotification({ type: 'success', message: `Organização "${organizacao.nome_organizacao}" criada com sucesso!` })
    } catch (err) {
      addNotification({ type: 'error', message: err instanceof Error ? err.message : 'Erro ao criar organização.' })
    }
  }

  function handleEditOrg(linha: OrganizacaoApi) {
    setOrgEditando(linha)
  }

  async function handleUpdateOrg(dados: Partial<DadosEditarOrg>) {
    if (!orgEditando) return
    try {
      // Fix wiring 2026-05-06: antes só enviava nome+subdominio — cnpj/estado/
      // cidade/segmento/tipo eram silenciosamente descartados. UI mostrava
      // "salvo com sucesso" mentindo. Agora envia tudo que o modal coletou.
      const respostaBruta = await adminOrganizacoesApi.update(
        orgEditando.id_organizacao,
        {
          nome_organizacao:       dados.nome,
          subdominio_organizacao: dados.subdominio,
          cnpj_organizacao:       dados.cnpj,
          estado_organizacao:     dados.estado,
          cidade_organizacao:     dados.cidade,
          segmento_organizacao:   dados.segmento,
          tipo_organizacao:       dados.tipo_empresa,
        },
      )
      // Mand. 09 (contrato bilateral) + Mand. 06 (Zod strict) + Mand. 08
      // (sem fallback silencioso): parse Zod da response. Se backend mudar
      // nome de campo, o parse falha ruidoso aqui — não esconde drift.
      const parsed = adminOrganizacaoUpdateResponseSchema.safeParse(respostaBruta)
      if (!parsed.success) {
        console.error('[handleUpdateOrg] payload de PATCH /admin/organizacoes fora do contrato', parsed.error)
        throw new Error('Falha de contrato na resposta do servidor.')
      }
      const atualizada = parsed.data.organizacao

      // Atualiza state local com a versão devolvida pelo backend (paridade).
      setOrganizacoes(prev => prev.map(o =>
        o.id_organizacao === orgEditando.id_organizacao
          ? {
              ...o,
              nome_organizacao:       atualizada.nome_organizacao,
              subdominio_organizacao: atualizada.subdominio_organizacao,
              cnpj_organizacao:       atualizada.cnpj_organizacao ?? null,
              estado_organizacao:     atualizada.estado_organizacao ?? null,
              cidade_organizacao:     atualizada.cidade_organizacao ?? null,
              segmento_organizacao:   atualizada.segmento_organizacao ?? null,
              tipo_organizacao:       atualizada.tipo_organizacao ?? null,
            }
          : o
      ))
      addNotification({ type: 'success', message: 'Organização atualizada com sucesso.' })
      setOrgEditando(null)
    } catch (err) {
      addNotification({ type: 'error', message: err instanceof Error ? err.message : 'Erro ao atualizar organização.' })
    }
  }

  function handleEditWorkspace(linha: WorkspaceApi) {
    setWorkspaceEditando({
      id_workspace: linha.id_workspace,
      nome_workspace: linha.nome_workspace,
      subdominio_workspace: linha.subdominio_workspace ?? '',
      quantidade_usuarios_workspace: linha.quantidade_usuarios_workspace ?? linha._count?.vinculos_workspace ?? 0,
      status_workspace: (linha.status_workspace === 'ATIVO' ? 'ATIVO' : 'INATIVO'),
      data_criacao_workspace: linha.data_criacao_workspace ?? '',
      cnpj_workspace: linha.cnpj_workspace ?? undefined,
    })
  }

  function handleUpdateWorkspace(dados: Partial<Workspace>) {
    if (!workspaceEditando) return
    setOrganizacoes(prev => prev.map(o => ({
      ...o,
      workspaces: (o.workspaces ?? []).map(w =>
        w.id_workspace === workspaceEditando.id_workspace
          ? {
              ...w,
              nome_workspace: dados.nome_workspace ?? w.nome_workspace,
              subdominio_workspace: dados.subdominio_workspace ?? w.subdominio_workspace,
              cnpj_workspace: dados.cnpj_workspace ?? w.cnpj_workspace,
            }
          : w
      ),
    })))
    addNotification({ type: 'success', message: 'Workspace atualizado com sucesso.' })
    setWorkspaceEditando(null)
  }

  // ── Colunas PAI ────────────────────────────────────────────────────────────
  const COLUNAS: TabelaGlobalColuna<OrganizacaoApi>[] = [
    {
      key: 'nome_organizacao', label: 'Organização', tipo: 'texto',
      tooltipTitulo: 'Organização',
      tooltipDescricao: 'Entidade raiz com isolamento lógico (RLS) em todas as tabelas transacionais.',
      render: (_v, item) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
          <TooltipGlobal titulo={`ID Técnico: ${item.id_organizacao}`} descricao="Chave primária no cluster">
            <div style={{ width: 30, height: 30, minWidth: 30, borderRadius: '8px', background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.6875rem', fontWeight: 700, color: '#6366f1', cursor: 'help' }}>
              {item.nome_organizacao ? item.nome_organizacao.charAt(0).toUpperCase() : 'O'}
            </div>
          </TooltipGlobal>
          <span style={{ fontWeight: 600 }}>{item.nome_organizacao}</span>
          {(item._count?.workspaces ?? 0) > 0 && (
             <span className="ws-badge ws-badge-surface" style={{ marginLeft: 8, height: 18, fontSize: '0.65rem', padding: '0 6px' }}>
                {item._count?.workspaces}
             </span>
          )}
        </div>
      )
    },
    {
      key: 'subdominio_organizacao', label: 'Subdomínio', tipo: 'texto',
      tooltipTitulo: 'Roteamento DNS (Subdomain CNAME)',
      tooltipDescricao: 'Alias em uso pelo API Gateway para roteamento da organização.',
      render: (_v, item) => (
        <a
          href={`${SHELL_URL}/workspace/${item.subdominio_organizacao}`}
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: 'var(--ws-text)', textDecoration: 'none', transition: 'color 0.15s' }}
          onClick={ev => ev.stopPropagation()}
          onMouseEnter={ev => { (ev.currentTarget as HTMLElement).style.color = '#818cf8'; (ev.currentTarget as HTMLElement).style.textDecoration = 'underline' }}
          onMouseLeave={ev => { (ev.currentTarget as HTMLElement).style.color = 'var(--ws-text)'; (ev.currentTarget as HTMLElement).style.textDecoration = 'none' }}
        >
          {item.subdominio_organizacao}.usegravity.com.br
        </a>
      )
    },
    {
      key: 'status_organizacao', label: 'Status', tipo: 'texto',
      tooltipTitulo: 'Status da Organização',
      tooltipDescricao: 'Estado operacional da organização na plataforma.',
      render: (v) => <StatusBadgeGlobal valor={rotuloOrganizacao(v as string)} />
    },
    {
      key: 'configuracoes_produto', label: 'Produtos Gravity', tipo: 'texto',
      tooltipTitulo: 'Produtos Gravity Ativos',
      tooltipDescricao: 'Módulos habilitados para esta organização.',
      render: (_v, item) => {
        const ativos = (item.configuracoes_produto ?? []).filter(p => p.ativo_configuracao_produto_gravity)
        const show = ativos.slice(0, 2)
        const rest = ativos.length - show.length

        if (ativos.length === 0) {
          return <span style={{ fontSize: '0.75rem', color: 'var(--ws-muted)' }}>—</span>
        }
        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexWrap: 'wrap' }}>
            {show.map((p, i) => (
              <span key={i} style={{
                fontSize: '0.625rem', fontWeight: 800, textTransform: 'uppercase',
                background: i === 0 ? 'rgba(99,102,241,0.1)' : 'rgba(255,255,255,0.05)',
                color: i === 0 ? '#818cf8' : 'var(--ws-muted)',
                padding: '0.125rem 0.375rem', borderRadius: '4px', border: i === 0 ? '1px solid rgba(99,102,241,0.2)' : '1px solid rgba(255,255,255,0.1)'
              }}>
                {p.chave_produto_configuracao_produto_gravity}
              </span>
            ))}
            {rest > 0 && <span style={{ fontSize: '0.625rem', color: 'var(--ws-muted)', fontWeight: 700 }}>+{rest}</span>}
          </div>
        )
      }
    },
    {
      key: '_count', label: 'Usuários', align: 'center', tipo: 'texto',
      tooltipTitulo: 'Usuários',
      tooltipDescricao: 'Total de usuários vinculados a esta organização.',
      render: (_v, item) => <span style={{ fontWeight: 600 }}>{item._count?.usuarios ?? 0}</span>
    },
  ]

  // ── Colunas FILHAS ──────────────────────────────────────────────────────────
  const COLUNAS_FILHAS: TabelaGlobalColuna<WorkspaceApi>[] = [
    {
      key: 'nome_workspace', label: 'Nome do Workspace', tipo: 'texto',
      render: (_v, item) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{ width: 24, height: 24, minWidth: 24, borderRadius: '6px', background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.5625rem', fontWeight: 700, color: '#34d399' }}>
            {item.nome_workspace.charAt(0).toUpperCase()}
          </div>
          <a
            href={`/workspace/workspaces?id=${item.id_workspace}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{ fontWeight: 600, color: 'var(--ws-text)', textDecoration: 'none', transition: 'color 0.15s', cursor: 'pointer' }}
            onMouseEnter={e => { e.currentTarget.style.color = '#818cf8'; e.currentTarget.style.textDecoration = 'underline'; }}
            onMouseLeave={e => { e.currentTarget.style.color = 'var(--ws-text)'; e.currentTarget.style.textDecoration = 'none'; }}
            onClick={(ev) => ev.stopPropagation()}
          >
            {item.nome_workspace}
          </a>
        </div>
      )
    },
    {
      key: 'subdominio_workspace', label: 'Subdomínio', tipo: 'texto',
      render: (_v, item) => (
        <a
          href={item.subdominio_workspace ? `${SHELL_URL}/workspace/${item.subdominio_workspace}` : '#'}
          target={item.subdominio_workspace ? '_blank' : undefined}
          rel="noopener noreferrer"
          style={{ color: 'var(--ws-text)', textDecoration: 'none', transition: 'color 0.15s' }}
          onClick={ev => ev.stopPropagation()}
          onMouseEnter={ev => { (ev.currentTarget as HTMLElement).style.color = '#818cf8'; (ev.currentTarget as HTMLElement).style.textDecoration = 'underline' }}
          onMouseLeave={ev => { (ev.currentTarget as HTMLElement).style.color = 'var(--ws-text)'; (ev.currentTarget as HTMLElement).style.textDecoration = 'none' }}
        >
          {item.subdominio_workspace}.usegravity.com.br
        </a>
      )
    },
    {
      key: 'status_workspace', label: 'Status', tipo: 'texto',
      render: (v) => <StatusBadgeGlobal valor={rotuloWorkspace(v as string)} />
    },
    {
      key: '_count', label: 'Usuários', align: 'center', tipo: 'texto',
      render: (_v, item) => (
        <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>
          {item.quantidade_usuarios_workspace ?? item._count?.vinculos_workspace ?? 0}
        </span>
      )
    },
  ]

  // ── Ações PAI ──────────────────────────────────────────────────────────────
  const ACOES: TabelaGlobalAcao<OrganizacaoApi>[] = [
    {
      id: 'suspend',
      icone: <PauseCircle size={15} weight="bold" />,
      tooltip: 'Alternar Status',
      onClick: (item) => updateStatus(item.id_organizacao, item.status_organizacao === 'ATIVO' ? 'SUSPENSO' : 'ATIVO'),
      renderCustom: (item) => {
        const ativo = item.status_organizacao === 'ATIVO'
        return (
          <button
            type="button"
            onClick={e => { e.preventDefault(); e.stopPropagation(); updateStatus(item.id_organizacao, ativo ? 'SUSPENSO' : 'ATIVO') }}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 28, height: 28, borderRadius: '50%', background: 'transparent', border: '1px solid transparent', color: '#64748b', cursor: 'pointer', transition: 'all 0.15s', flexShrink: 0 }}
            onMouseEnter={ev => { ev.currentTarget.style.background = ativo ? 'rgba(251,191,36,0.12)' : 'rgba(52,211,153,0.12)'; ev.currentTarget.style.borderColor = ativo ? 'rgba(251,191,36,0.3)' : 'rgba(52,211,153,0.3)'; ev.currentTarget.style.color = ativo ? '#fbbf24' : '#34d399' }}
            onMouseLeave={ev => { ev.currentTarget.style.background = 'transparent'; ev.currentTarget.style.borderColor = 'transparent'; ev.currentTarget.style.color = '#64748b' }}
          >
            {ativo ? <PauseCircle size={16} weight="bold" /> : <PlayCircle size={16} weight="bold" />}
          </button>
        )
      }
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
      onClick: (item) => navigate({ name: 'tenant-detail', id_organizacao: item.id_organizacao }),
    },
  ]

  // ── Ações FILHAS ───────────────────────────────────────────────────────────
  const ACOES_FILHAS: TabelaGlobalAcao<WorkspaceApi>[] = [
    {
      id: 'suspend-ws',
      icone: <PauseCircle size={14} weight="bold" />,
      tooltip: 'Alternar Status do Workspace',
      onClick: (item) => updateWorkspaceStatus(item.id_workspace, item.status_workspace === 'ATIVO' ? 'INATIVO' : 'ATIVO'),
      renderCustom: (item) => {
        const ativo = item.status_workspace === 'ATIVO'
        return (
          <button
            type="button"
            onClick={e => { e.preventDefault(); e.stopPropagation(); updateWorkspaceStatus(item.id_workspace, ativo ? 'INATIVO' : 'ATIVO') }}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 26, height: 26, borderRadius: '50%', background: 'transparent', border: '1px solid transparent', color: '#64748b', cursor: 'pointer', transition: 'all 0.15s', flexShrink: 0 }}
            onMouseEnter={ev => { ev.currentTarget.style.background = ativo ? 'rgba(251,191,36,0.12)' : 'rgba(52,211,153,0.12)'; ev.currentTarget.style.borderColor = ativo ? 'rgba(251,191,36,0.3)' : 'rgba(52,211,153,0.3)'; ev.currentTarget.style.color = ativo ? '#fbbf24' : '#34d399' }}
            onMouseLeave={ev => { ev.currentTarget.style.background = 'transparent'; ev.currentTarget.style.borderColor = 'transparent'; ev.currentTarget.style.color = '#64748b' }}
          >
            {ativo ? <PauseCircle size={14} weight="bold" /> : <PlayCircle size={14} weight="bold" />}
          </button>
        )
      }
    },
    {
      id: 'edit',
      icone: <PencilSimple size={14} weight="bold" />,
      tooltip: 'Editar',
      onClick: handleEditWorkspace,
    }
  ]

  // ── Exportação ─────────────────────────────────────────────────────────────
  const ACOES_EXPORT: TabelaExportAcao<OrganizacaoApi>[] = [
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
          titulo="Organizações"
          subtitulo="Gerencie as organizações e seus workspaces e usuários."
        />
      }
      stats={
        stats ? (
          <>
            <CardBasicoGlobal
              titulo="Total de Organizações"
              icone={<Buildings weight="duotone" size={16} style={{ color: 'var(--ws-accent)' }} />}
              valor={stats.totalOrganizacoes}
              tooltip={
                <>
                  <p className="cg-tooltip__title">Organizações</p>
                  <div className="cg-tooltip__row"><span>Total</span> <strong>{stats.totalOrganizacoes}</strong></div>
                  <div className="cg-tooltip__row"><span>Ativas</span> <strong style={{ color: '#34d399' }}>{stats.organizacoesAtivas}</strong></div>
                  <div className="cg-tooltip__row"><span>Suspensas</span> <strong style={{ color: '#fbbf24' }}>{stats.organizacoesSuspensas}</strong></div>
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
                  <span style={{ fontSize: '0.6875rem', color: 'var(--ws-muted)', lineHeight: 1.4, display: 'block' }}>Média de {Math.round(stats.totalWorkspaces / (stats.totalOrganizacoes || 1) * 10) / 10} workspaces por organização.</span>
                </>
              }
            />
            <CardBasicoGlobal
              titulo="Total de Usuários"
              icone={<UsersThree weight="duotone" size={16} style={{ color: '#8b5cf6' }} />}
              valor={stats.totalUsuarios}
              tooltip={
                <>
                  <p className="cg-tooltip__title">Identidades Globais</p>
                  <div className="cg-tooltip__row"><span>Usuários Únicos</span> <strong>{stats.totalUsuarios}</strong></div>
                  <div className="cg-tooltip__row"><span>Sessões Ativas</span> <strong>100%</strong></div>
                </>
              }
            />
            <CardGraficoGlobal
              titulo="Status dos Workspaces"
              icone={<ChartPieSlice weight="duotone" size={16} style={{ color: '#fbbf24' }} />}
              total={stats.totalWorkspaces}
              valorPrincipal={stats.workspacesAtivos}
              corGauge="#34d399"
              legenda={[
                { label: 'Ativas',    valor: stats.workspacesAtivos,    cor: 'green'  },
                { label: 'Suspensas', valor: stats.workspacesSuspensos, cor: 'yellow' },
              ]}
              tooltip={
                <>
                  <p className="cg-tooltip__title">Saúde Operacional</p>
                  <div className="cg-tooltip__row"><span>Workspaces Ativos</span> <strong style={{ color: '#34d399' }}>{stats.workspacesAtivos}</strong></div>
                  <div className="cg-tooltip__row"><span>Workspaces Suspensos</span> <strong style={{ color: '#fbbf24' }}>{stats.workspacesSuspensos}</strong></div>
                  <div className="cg-tooltip__divider" />
                  <div className="cg-tooltip__row"><span>Taxa de Disponibilidade</span> <strong style={{ color: '#34d399' }}>{Math.round(stats.workspacesAtivos / (stats.totalWorkspaces || 1) * 100)}%</strong></div>
                </>
              }
            />
          </>
        ) : undefined
      }
      acoes={
        <div style={{ display: 'flex', gap: '8px' }}>
          <BotaoNovoAdminGlobal
            rotulo={t('admin.testes-gerais.org.botao_nova_organizacao')}
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
        <TabelaGlobal<OrganizacaoApi>
          id="admin-organizations"
          idKey="id_organizacao"
          dados={organizacoes}
          colunas={COLUNAS}
          acoes={ACOES}
          acoesExportacao={getAcoesExportacaoPadrao(COLUNAS, 'dados_tabela', 'Exportação de Dados')}
          mensagemVazio={loading ? 'Interrogando estado do database global...' : 'Nenhuma instância retornou resultados.'}
          tooltipExpandir="Ver workspaces vinculados à organização"
          tooltipRecolher="Recolher visualização de workspaces"
          tooltipBusca="Localizar instância por nome ou subdomínio"
          renderExpandido={(organizacao) => {
            const lista = organizacao.workspaces ?? []
            return (
              <div style={{ padding: '0 1.25rem 1.25rem 1.25rem', background: 'rgba(0,0,0,0.15)' }}>
                <div style={{ padding: '1rem', borderTop: '1px solid rgba(129,140,248,0.1)', display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--ws-muted)', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  <TreeStructure size={14} /> Workspaces ({lista.length})
                </div>
                <div style={{ border: '1px solid rgba(129,140,248,0.08)', borderRadius: '12px', overflow: 'hidden' }}>
                  <TabelaGlobal<WorkspaceApi>
                    id={`admin-organizacao-workspaces-${organizacao.id_organizacao}`}
                    idKey="id_workspace"
                    dados={lista}
                    colunas={COLUNAS_FILHAS}
                    acoes={ACOES_FILHAS}
                    mensagemVazio="Nenhum workspace cadastrado."
                    acoesExportacao={getAcoesExportacaoPadrao(COLUNAS_FILHAS, 'dados_tabela', 'Exportação de Dados')}
                  />
                </div>
              </div>
            )
          }}
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
        workspace={workspaceEditando}
        aoFechar={() => setWorkspaceEditando(null)}
        aoSalvar={handleUpdateWorkspace}
      />
    </PaginaGlobal>
  )
}
