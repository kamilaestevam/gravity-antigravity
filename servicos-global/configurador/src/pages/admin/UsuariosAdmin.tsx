import React, { useState, useEffect, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Users, UserCircleCheck, UserCircleMinus,
  PencilSimple, TreeStructure,
  ChartPieSlice, Key, Buildings, User, EnvelopeSimple, ShieldCheck, Crown, Lightning, ArrowClockwise
} from '@phosphor-icons/react'
import { SelectGlobal, type SelectOpcao } from '@nucleo/campo-select-global'

import { PaginaGlobal } from '@nucleo/pagina-global'
import { CabecalhoGlobal } from '@nucleo/cabecalho-global'
import { TabelaGlobal, type TabelaGlobalColuna, type TabelaGlobalAcao } from '@nucleo/tabela-global'
import { BotaoGlobal } from '@nucleo/botao-global'
import { CardBasicoGlobal, CardGraficoGlobal, type PeriodoTendencia } from '@nucleo/card-global'
import { TooltipGlobal } from '@nucleo/tooltip-global'
import { ModalFormularioGlobal } from '@nucleo/modal-formulario-global'
import { CampoGeralGlobal } from '@nucleo/campo-geral-global'
import {
  BannerRequisitosGlobal,
  BannerRequisitosContexto,
  type RequisitoSalvar,
} from '@nucleo/banner-requisitos-global'
import { getAcoesExportacaoPadrao } from '../../utils/export-helper'
import { ModalEditarUsuario } from '../workspace/ModalEditarUsuario'
import { ModalPermissoesUsuario } from '../workspace/ModalPermissoesUsuario'
import { type NivelAcesso, type UserStatus, mapRole, nivelToRole } from '../../types/niveis-acesso'
import { adminUsersApi, type GlobalUserApi } from '../../services/api-client'
import { useShellStore } from '@gravity/shell'
import { useLoadSystemRole } from '../../hooks/use-load-system-role'
import { workspaceUrl } from '../../config/constants'

/** Regex RFC 5322 simplificada para validação de email no frontend. */
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

// ─── Tipos globais ─────────────────────────────────────────────────────────────
// Documentação central em src/types/niveis-acesso.ts

interface VinculoWorkspaceUI {
  id_usuario_workspace: string
  nome_workspace: string
  subdominio_workspace: string
  perfil: string
}

// Estrutura de UI para o painel admin global de usuários — campos em DDD.
interface UsuarioGlobalUI {
  id_usuario: string
  nome_usuario: string
  email_usuario: string
  tipo: NivelAcesso
  status: UserStatus
  nome_organizacao: string
  vinculos_workspace: VinculoWorkspaceUI[]
}

// ─── Helper: mapeia GlobalUserApi do backend para UsuarioGlobalUI ──────────────

function mapApiUserToGlobal(u: GlobalUserApi): UsuarioGlobalUI {
  const vinculos: VinculoWorkspaceUI[] = u.memberships.map(m => ({
    id_usuario_workspace: m.id_usuario_workspace,
    nome_workspace:       m.workspace?.nome_workspace ?? 'N/A',
    subdominio_workspace: m.workspace?.subdominio_workspace ?? '',
    perfil:               mapRole(m.tipo_usuario_workspace),
  }))
  // Admin/SUPER_ADMIN pertencem à HQ (Gravity) — sem vínculos mas sempre ativos.
  // Demais: considerados ativos se tiverem ao menos um workspace ativo.
  const ehGravity = u.tipo_usuario === 'SUPER_ADMIN' || u.tipo_usuario === 'ADMIN'
  const status: UserStatus = ehGravity || vinculos.length > 0 ? 'Ativo' : 'Inativo'
  return {
    id_usuario:        u.id_usuario,
    nome_usuario:      u.nome_usuario,
    email_usuario:     u.email_usuario,
    tipo:              mapRole(u.tipo_usuario),
    status,
    nome_organizacao:  u.organizacao?.nome_organizacao ?? 'N/A',
    vinculos_workspace: vinculos,
  }
}

// ─── Badge de organização ───────────────────────────────────────────────────────
function OrgBadge({ nome }: { nome: string }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '0.25rem',
      padding: '0.18rem 0.55rem', borderRadius: '9999px',
      background: 'rgba(139,92,246,0.1)',
      border: '1px solid rgba(139,92,246,0.2)',
      color: '#a78bfa',
      fontSize: '0.6875rem', fontWeight: 600, whiteSpace: 'nowrap',
    }}>
      <Buildings size={11} weight="duotone" />
      {nome}
    </span>
  )
}

const OPCOES_TIPO_ADMIN: SelectOpcao[] = [
  { valor: 'Fornecedor',  rotulo: 'Fornecedor',  descricao: 'Acesso externo restrito para prestadores de serviço', meta: { icone: <Buildings size={16} weight="duotone" color="#fbbf24" /> } },
  { valor: 'Standard',    rotulo: 'Standard',    descricao: 'Usuário operacional vinculado a workspaces específicos', meta: { icone: <User size={16} weight="duotone" color="#94a3b8" /> } },
  { valor: 'Master',      rotulo: 'Master',      descricao: 'Gestor máximo da organização (acesso total no tenant)', meta: { icone: <Crown size={16} weight="duotone" color="#818cf8" /> } },
  { valor: 'Admin',       rotulo: 'Admin',       descricao: 'Administrador da plataforma com permissões específicas', meta: { icone: <ShieldCheck size={16} weight="duotone" color="#06b6d4" /> } },
  { valor: 'Super Admin', rotulo: 'Super Admin', descricao: 'Controle total global da plataforma (todas as orgs)', meta: { icone: <Lightning size={16} weight="duotone" color="#22c55e" /> } },
]

export function UsuariosAdmin() {
  const { t } = useTranslation()
  const addNotification = useShellStore((s) => s.addNotification)
  const { role: dbRole } = useLoadSystemRole()
  const perfilLogado: NivelAcesso = mapRole(dbRole ?? '')

  const [users, setUsers] = useState<UsuarioGlobalUI[]>([])
  const [carregando, setCarregando] = useState(true)
  const [erroCarregar, setErroCarregar] = useState<string | null>(null)

  const [showForm, setShowForm]   = useState(false)
  const [fNome, setFNome]         = useState('')
  const [fEmail, setFEmail]       = useState('')
  const [fTipo, setFTipo]         = useState<NivelAcesso>('Standard')
  const [fOrg, setFOrg]           = useState('')

  // Organizações extraídas dos dados reais
  const ORGS = useMemo(() => {
    const orgs = new Set(users.map(u => u.nome_organizacao))
    return Array.from(orgs).sort()
  }, [users])

  // Carregar usuários da API (com suporte a retry manual)
  async function loadUsers() {
    try {
      setCarregando(true)
      setErroCarregar(null)
      const res = await adminUsersApi.list()
      setUsers(res.usuarios.map(mapApiUserToGlobal))
    } catch (err) {
      const msg = err instanceof Error ? err.message : t('admin.usuarios-globais.msg_erro_carregar')
      setErroCarregar(msg)
      addNotification({ type: 'error', message: msg })
    } finally {
      setCarregando(false)
    }
  }

  useEffect(() => {
    void loadUsers()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const [usuarioEditando, setUsuarioEditando] = useState<UsuarioGlobalUI | null>(null)
  const [usuarioPermissoes, setUsuarioPermissoes] = useState<UsuarioGlobalUI | null>(null)
  const [abaEditando, setAbaEditando]         = useState<string>('dados')

  // Filtro de opções com base no perfil logado
  const opcoesDisponiveis = useMemo(() => {
    if (perfilLogado === 'Super Admin') return OPCOES_TIPO_ADMIN
    // Admin não pode criar Super Admin ou outro Admin
    return OPCOES_TIPO_ADMIN.filter(op => op.valor !== 'Super Admin' && op.valor !== 'Admin')
  }, [perfilLogado])

  // Admin e Super Admin pertencem à Gravity (org fixa) — os demais precisam de workspace
  const isGravityRole = fTipo === 'Admin' || fTipo === 'Super Admin'

  // Quando o tipo muda, ajusta o fOrg automaticamente
  useEffect(() => {
    if (isGravityRole) {
      setFOrg('Gravity')
    } else {
      // Volta para o primeiro workspace que não seja "Gravity"
      const firstWorkspace = ORGS.find(o => o !== 'Gravity') ?? ORGS[0] ?? ''
      setFOrg(firstWorkspace)
    }
  }, [fTipo]) // eslint-disable-line react-hooks/exhaustive-deps

  async function handleInvite() {
    const nome  = fNome.trim()
    const email = fEmail.trim()
    if (!nome || !email) return
    if (!EMAIL_REGEX.test(email)) {
      addNotification({ type: 'error', message: t('admin.usuarios-globais.msg_email_invalido') })
      return
    }
    try {
      const result = await adminUsersApi.inviteUser({
        email_usuario: email,
        nome_usuario:  nome,
        tipo_usuario:  nivelToRole(fTipo),
      })
      setUsers(prev => [...prev, {
        id_usuario:         result.usuario.id_usuario,
        nome_usuario:       fNome.trim(),
        email_usuario:      fEmail.trim(),
        tipo:               fTipo,
        status:             'Ativo',
        nome_organizacao:   fOrg,
        vinculos_workspace: [],
      }])
      addNotification({ type: 'success', message: t('admin.usuarios-globais.msg_usuario_adicionado', { nome: fNome.trim() }) })
      setFNome(''); setFEmail(''); setFTipo('Standard'); setFOrg(ORGS[0] ?? ''); setShowForm(false)
    } catch (err) {
      addNotification({ type: 'error', message: err instanceof Error ? err.message : t('admin.usuarios-globais.msg_erro_convidar') })
    }
  }

  // NOTA: suspender/reativar um usuário exige campo `status`/`is_active` no model User
  // (hoje não existe no schema Prisma). A ação "Suspender" foi removida do toolbar
  // até que o Coordenador adicione o campo via migration.

  // ─── Colunas ────────────────────────────────────────────────────────────────
  const COLUNAS: TabelaGlobalColuna<UsuarioGlobalUI>[] = [
    {
      key: 'nome_usuario', label: t('admin.usuarios-globais.tabela.usuario'), tipo: 'texto',
      tooltipTitulo: t('admin.usuarios-globais.tabela.nome_completo'), tooltipDescricao: t('admin.usuarios-globais.tabela.nome_completo_desc'),
      render: (_, item) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
          <div style={{
            width: 32, height: 32, minWidth: 32, borderRadius: '50%',
            background: item.tipo === 'Super Admin' ? 'rgba(34,197,94,0.2)' : item.tipo === 'Admin' ? 'rgba(6,182,212,0.15)' : item.tipo === 'Master' ? 'rgba(129,140,248,0.2)' : item.tipo === 'Fornecedor' ? 'rgba(245,158,11,0.15)' : 'rgba(255,255,255,0.07)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700,
            color: item.tipo === 'Super Admin' ? '#22c55e' : item.tipo === 'Admin' ? '#06b6d4' : item.tipo === 'Master' ? '#818cf8' : item.tipo === 'Fornecedor' ? '#fbbf24' : '#94a3b8',
          }}>
            {item.nome_usuario.split(' ').map(n => n[0]).join('').slice(0, 2)}
          </div>
          <span style={{ fontWeight: 600 }}>{item.nome_usuario}</span>
        </div>
      )
    },
    {
      key: 'email_usuario', label: t('admin.usuarios-globais.tabela.email'), tipo: 'texto',
      tooltipTitulo: t('admin.usuarios-globais.tabela.email_acesso'), tooltipDescricao: t('admin.usuarios-globais.tabela.email_acesso_desc'),
      render: (v) => <span style={{ color: 'var(--ws-muted)' }}>{v}</span>
    },
    {
      key: 'nome_organizacao', label: t('admin.usuarios-globais.tabela.organizacao'), tipo: 'texto',
      tooltipTitulo: t('admin.usuarios-globais.tabela.org_tooltip'), tooltipDescricao: t('admin.usuarios-globais.tabela.org_desc'),
      render: (v) => <OrgBadge nome={v as string} />
    },
    {
      key: 'tipo', label: t('admin.usuarios-globais.tabela.tipo'), tipo: 'texto',
      tooltipTitulo: t('admin.usuarios-globais.tabela.perfil_base'), tooltipDescricao: t('admin.usuarios-globais.tabela.perfil_desc'),
      render: (v) => (
        <span style={{
          padding: '0.2rem 0.6rem', borderRadius: '9999px', fontSize: '0.6875rem', fontWeight: 700, letterSpacing: '0.04em',
          ...(v === 'Super Admin'
            ? { color: '#22c55e', background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.25)' }
            : v === 'Admin'
            ? { color: '#06b6d4', background: 'rgba(6,182,212,0.1)', border: '1px solid rgba(6,182,212,0.2)' }
            : v === 'Master'
            ? { color: '#818cf8', background: 'rgba(129,140,248,0.1)' }
            : v === 'Fornecedor'
            ? { color: '#fbbf24', background: 'rgba(245,158,11,0.1)' }
            : { color: '#94a3b8', background: 'rgba(255,255,255,0.05)' })
        }}>{v as string}</span>
      )
    },
    {
      key: 'status', label: t('admin.usuarios-globais.tabela.status'), tipo: 'texto',
      tooltipTitulo: t('admin.usuarios-globais.tabela.status_operacional'), tooltipDescricao: t('admin.usuarios-globais.tabela.status_desc'),
      render: (v) => (
        <span style={{
          display: 'inline-flex', padding: '0.2rem 0.625rem', borderRadius: '9999px',
          fontSize: '0.6875rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em',
          background: v === 'Ativo' ? 'rgba(52,211,153,0.12)' : 'rgba(248,113,113,0.12)',
          color: v === 'Ativo' ? '#34d399' : '#f87171',
          border: `1px solid ${v === 'Ativo' ? 'rgba(52,211,153,0.2)' : 'rgba(248,113,113,0.2)'}`
        }}>{v as string}</span>
      )
    },
  ]

  const COLUNAS_FILHAS: TabelaGlobalColuna<VinculoWorkspaceUI>[] = [
    {
      key: 'nome_workspace', label: t('admin.usuarios-globais.children.workspace'), tipo: 'texto',
      render: (_v, item) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{ width: 24, height: 24, minWidth: 24, borderRadius: '6px', background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.5625rem', fontWeight: 700, color: '#34d399' }}>
            {item.nome_workspace.charAt(0)}
          </div>
          <a
            href={`/workspace/workspaces?id=${item.id_usuario_workspace}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{ fontWeight: 600, color: 'var(--ws-text)', textDecoration: 'none', transition: 'color 0.15s' }}
            onMouseEnter={e => { e.currentTarget.style.color = '#818cf8'; e.currentTarget.style.textDecoration = 'underline'; }}
            onMouseLeave={e => { e.currentTarget.style.color = 'var(--ws-text)'; e.currentTarget.style.textDecoration = 'none' }}
            onClick={ev => ev.stopPropagation()}
          >
            {item.nome_workspace}
          </a>
        </div>
      )
    },
    {
      key: 'subdominio_workspace', label: t('admin.usuarios-globais.children.subdominio'), tipo: 'texto',
      render: (_v, item) => (
        <a
          href={workspaceUrl(item.subdominio_workspace)}
          target="_blank"
          rel="noopener noreferrer"
          style={{ textDecoration: 'none' }}
          onClick={ev => ev.stopPropagation()}
        >
          <code style={{
            fontSize: '0.75rem',
            color: '#a5b4fc',
            background: 'rgba(165,180,252,0.05)',
            border: '1px solid rgba(165,180,252,0.1)',
            padding: '0.125rem 0.4rem',
            borderRadius: '4px',
            cursor: 'pointer',
            transition: 'all 0.15s'
          }}
            onMouseEnter={ev => { (ev.currentTarget as HTMLElement).style.background = 'rgba(165,180,252,0.15)'; (ev.currentTarget as HTMLElement).style.borderColor = 'rgba(165,180,252,0.3)'; (ev.currentTarget as HTMLElement).style.textDecoration = 'none' }}
            onMouseLeave={ev => { (ev.currentTarget as HTMLElement).style.background = 'rgba(165,180,252,0.05)'; (ev.currentTarget as HTMLElement).style.borderColor = 'rgba(165,180,252,0.1)' }}
          >
            {item.subdominio_workspace}.usegravity.com.br
          </code>
        </a>
      )
    },
    {
      key: 'perfil', label: t('admin.usuarios-globais.children.plano_perfil'), tipo: 'texto',
      render: (v) => (
        <span style={{
          fontSize: '0.625rem', color: 'var(--ws-muted)', fontWeight: 600,
          padding: '0.1rem 0.35rem', background: 'rgba(255,255,255,0.03)',
          borderRadius: '4px', border: '1px solid rgba(255,255,255,0.08)'
        }}>{String(v)}</span>
      )
    },
  ]

  const ACOES: TabelaGlobalAcao<UsuarioGlobalUI>[] = [
    {
      id: 'permissions',
      icone: <Key size={15} weight="bold" aria-label={t('admin.usuarios-globais.acao_permissoes')} />,
      tooltip: t('admin.usuarios-globais.acao_permissoes'),
      onClick: setUsuarioPermissoes,
    },
    {
      id: 'edit',
      icone: <PencilSimple size={15} weight="bold" aria-label={t('admin.usuarios-globais.acao_editar')} />,
      tooltip: t('admin.usuarios-globais.acao_editar'),
      onClick: (u) => { setUsuarioEditando(u); setAbaEditando('dados') },
    },
  ]

  // ─── Exportação ─────────────────────────────────────────────────────────────
  const ACOES_EXPORT = getAcoesExportacaoPadrao<UsuarioGlobalUI>(
    COLUNAS,
    'usuarios',
    'Usuários Globais da Plataforma',
  )

  // ─── Stats ──────────────────────────────────────────────────────────────────
  const totalUsers    = users.length
  const ativos        = users.filter(u => u.status === 'Ativo').length
  const inativos      = users.filter(u => u.status === 'Inativo').length
  const orgsAtivas    = new Set(users.map(u => u.nome_organizacao)).size

  return (
    <PaginaGlobal
      className="ws-fade-up"
      layout="lista"
      cabecalho={
        <CabecalhoGlobal
          icone={<Users weight="duotone" size={22} />}
          titulo={t('admin.usuarios-globais.titulo')}
          subtitulo={t('admin.usuarios-globais.subtitulo')}
        />
      }
      stats={
        <>
          <CardBasicoGlobal
            titulo={t('admin.usuarios-globais.card_total')}
            valor={totalUsers}
            icone={<Users weight="duotone" size={18} />}
            periodos={[
              { periodo: '7d',  rotulo: '7 dias',  valor: '+3',  direcao: 'up', descricao: 'vs semana anterior'    },
              { periodo: '30d', rotulo: '30 dias', valor: '+8',  direcao: 'up', descricao: 'vs mês anterior'       },
              { periodo: '6m',  rotulo: '6 meses', valor: '+21', direcao: 'up', descricao: 'vs semestre anterior'  },
              { periodo: '1a',  rotulo: '1 ano',   valor: '+34', direcao: 'up', descricao: 'vs ano anterior'       },
            ] as PeriodoTendencia[]}
            tooltip={
              <>
                <p className="cg-tooltip__title">{t('admin.usuarios-globais.card_total_tooltip_titulo')}</p>
                <div className="cg-tooltip__row"><span>{t('admin.usuarios-globais.card_total_tooltip_total')}</span><strong>{totalUsers}</strong></div>
                <div className="cg-tooltip__row"><span>{t('admin.usuarios-globais.card_total_tooltip_ativos')}</span><strong style={{ color: '#34d399' }}>{ativos}</strong></div>
                <div className="cg-tooltip__row"><span>{t('admin.usuarios-globais.card_total_tooltip_inativos')}</span><strong style={{ color: '#f87171' }}>{inativos}</strong></div>
              </>
            }
          />
          <CardBasicoGlobal
            titulo={t('admin.usuarios-globais.card_ativos')}
            valor={ativos}
            icone={<UserCircleCheck weight="duotone" size={18} />}
            variante="sucesso"
            periodos={[
              { periodo: '7d',  rotulo: '7 dias',  valor: '+2',  direcao: 'up' },
              { periodo: '30d', rotulo: '30 dias', valor: '+6',  direcao: 'up' },
              { periodo: '6m',  rotulo: '6 meses', valor: '+15', direcao: 'up' },
              { periodo: '1a',  rotulo: '1 ano',   valor: '+28', direcao: 'up' },
            ] as PeriodoTendencia[]}
            tooltip={
              <>
                <p className="cg-tooltip__title">{t('admin.usuarios-globais.card_ativos_tooltip_titulo')}</p>
                <div className="cg-tooltip__row"><span>{t('admin.usuarios-globais.card_ativos_tooltip_label')}</span><strong style={{ color: '#34d399' }}>{ativos}</strong></div>
              </>
            }
          />
          <CardBasicoGlobal
            titulo={t('admin.usuarios-globais.card_inativos')}
            valor={inativos}
            icone={<UserCircleMinus weight="duotone" size={18} />}
            variante="perigo"
            periodos={[
              { periodo: '7d',  rotulo: '7 dias',  valor: '+1',  direcao: 'up' },
              { periodo: '30d', rotulo: '30 dias', valor: '+2',  direcao: 'up' },
              { periodo: '6m',  rotulo: '6 meses', valor: '+6',  direcao: 'up' },
              { periodo: '1a',  rotulo: '1 ano',   valor: '+6',  direcao: 'up' },
            ] as PeriodoTendencia[]}
            tooltip={
              <>
                <p className="cg-tooltip__title">{t('admin.usuarios-globais.card_inativos_tooltip_titulo')}</p>
                <div className="cg-tooltip__row"><span>{t('admin.usuarios-globais.card_inativos_tooltip_label')}</span><strong style={{ color: '#f87171' }}>{inativos}</strong></div>
              </>
            }
          />
          <CardGraficoGlobal
            className="cg-card--reduced-2px"
            titulo={t('admin.usuarios-globais.card_orgs')}
            icone={<ChartPieSlice weight="duotone" size={16} style={{ color: '#8b5cf6' }} />}
            total={ORGS.length}
            valorPrincipal={orgsAtivas}
            corGauge="#8b5cf6"
            legenda={[
              { label: t('admin.usuarios-globais.card_orgs_com_usuarios'), valor: orgsAtivas,           cor: '#8b5cf6' },
              { label: t('admin.usuarios-globais.card_orgs_sem_usuarios'), valor: ORGS.length - orgsAtivas, cor: '#64748b' },
            ]}
            tooltip={
              <>
                <p className="cg-tooltip__title">{t('admin.usuarios-globais.card_orgs_tooltip_titulo')}</p>
                <div className="cg-tooltip__row"><span>{t('admin.usuarios-globais.card_orgs_tooltip_total')}</span><strong>{ORGS.length}</strong></div>
                <div className="cg-tooltip__row"><span>{t('admin.usuarios-globais.card_orgs_com_usuarios')}</span><strong style={{ color: '#8b5cf6' }}>{orgsAtivas}</strong></div>
                <div className="cg-tooltip__divider" />
                <div className="cg-tooltip__row"><span>{t('admin.usuarios-globais.card_orgs_tooltip_total_usuarios')}</span><strong>{totalUsers}</strong></div>
              </>
            }
          />
        </>
      }
      acoes={
        <TooltipGlobal titulo={t('admin.usuarios-globais.btn_convidar')} descricao={t('admin.usuarios-globais.btn_convidar_desc')}>
          <BotaoGlobal
            variante="primario"
            onClick={() => setShowForm(true)}
            icone={<User size={18} />}
          >
            {t('admin.usuarios-globais.btn_convidar')}
          </BotaoGlobal>
        </TooltipGlobal>
      }
    >

      {/* ── Tabela global ────────────────────────────────────────────────── */}
      <div style={{ position: 'relative', zIndex: 10 }}>
        {carregando ? (
          <div
            role="status"
            aria-live="polite"
            style={{ padding: '3rem 1rem', textAlign: 'center', color: 'var(--ws-muted)' }}
          >
            <div style={{ fontSize: '0.875rem', fontWeight: 600 }}>{t('admin.usuarios-globais.carregando')}</div>
          </div>
        ) : erroCarregar ? (
          <div
            role="alert"
            style={{ padding: '2rem 1rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}
          >
            <div style={{ fontSize: '0.875rem', color: '#f87171', fontWeight: 600 }}>{erroCarregar}</div>
            <BotaoGlobal
              variante="secundario"
              onClick={() => void loadUsers()}
              icone={<ArrowClockwise size={16} />}
              aria-label={t('admin.usuarios-globais.btn_tentar_novamente')}
            >
              {t('admin.usuarios-globais.btn_tentar_novamente')}
            </BotaoGlobal>
          </div>
        ) : (
          <TabelaGlobal<UsuarioGlobalUI>
            id="admin-global-users"
            dados={users}
            colunas={COLUNAS}
            acoes={ACOES}
            acoesExportacao={ACOES_EXPORT}
            mensagemVazio={t('admin.usuarios-globais.tabela_vazio')}
            tooltipBusca={t('admin.usuarios-globais.tabela_busca_tooltip')}
            tooltipExpandir={t('admin.usuarios-globais.tabela_expandir_tooltip')}
            tooltipRecolher={t('admin.usuarios-globais.tabela_recolher_tooltip')}
            idKey="id_usuario"
            renderExpandido={(user) => (
              <div style={{ padding: '0 1.25rem 1.25rem 1.25rem', background: 'rgba(0,0,0,0.15)' }}>
                <div style={{ padding: '1rem', borderTop: '1px solid rgba(129,140,248,0.1)', display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--ws-muted)', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  <TreeStructure size={14} /> {t('admin.usuarios-globais.espacos_trabalho')} ({user.vinculos_workspace?.length || 0})
                </div>
                <div style={{ border: '1px solid rgba(129,140,248,0.08)', borderRadius: '12px', overflow: 'hidden' }}>
                  <TabelaGlobal<VinculoWorkspaceUI>
                    dados={user.vinculos_workspace || []}
                    colunas={COLUNAS_FILHAS}
                    mensagemVazio={t('admin.usuarios-globais.espacos_vazio')}
                  />
                </div>
              </div>
            )}
          />
        )}
      </div>

      {/* ── Modal Edição ─────────────────────────────────────────────────── */}
      <ModalEditarUsuario
        usuario={usuarioEditando ? {
          id_usuario:           usuarioEditando.id_usuario,
          nome_usuario:         usuarioEditando.nome_usuario,
          email_usuario:        usuarioEditando.email_usuario,
          tipo_usuario:         nivelToRole(usuarioEditando.tipo),
          data_criacao_usuario: new Date().toISOString(),
          usuario_workspaces:   usuarioEditando.vinculos_workspace.map(v => {
            const tipoEnum = nivelToRole(v.perfil as NivelAcesso)
            // Vínculo na filial só admite MASTER/PADRAO/FORNECEDOR (Admin/SUPER_ADMIN não vinculam por filial).
            const tipoVinculo: 'MASTER' | 'PADRAO' | 'FORNECEDOR' =
              tipoEnum === 'MASTER' || tipoEnum === 'FORNECEDOR' ? tipoEnum : 'PADRAO'
            return {
              id_usuario_workspace:    v.id_usuario_workspace,
              id_workspace:            v.id_usuario_workspace,
              tipo_usuario_workspace:  tipoVinculo,
              ativo_usuario_workspace: true,
            }
          }),
          status_usuario: usuarioEditando.status === 'Ativo' ? 'ATIVO' : 'INATIVO',
        } : null}
        abaInicial={abaEditando}
        workspaces={usuarioEditando ? usuarioEditando.vinculos_workspace.map(v => ({
          id_workspace:           v.id_usuario_workspace,
          nome_workspace:         v.nome_workspace,
          subdominio_workspace:   v.subdominio_workspace,
          status_workspace:       'ATIVO',
          data_criacao_workspace: new Date().toISOString(),
        })) : []}
        workspacesSalvos={usuarioEditando?.vinculos_workspace.map(e => e.id_usuario_workspace) ?? []}
        aoFechar={() => setUsuarioEditando(null)}
        aoSalvar={(uEditado) => {
          setUsers(prev => prev.map(u => u.id_usuario === uEditado.id_usuario ? {
            ...u,
            nome_usuario:  uEditado.nome_usuario,
            email_usuario: uEditado.email_usuario,
            tipo:          mapRole(uEditado.tipo_usuario),
          } : u))
          setUsuarioEditando(null)
        }}
      />

      <ModalPermissoesUsuario
        usuario={usuarioPermissoes ? {
          id_usuario:   usuarioPermissoes.id_usuario,
          nome_usuario: usuarioPermissoes.nome_usuario,
          tipo_usuario: nivelToRole(usuarioPermissoes.tipo),
        } : null}
        contextoAdmin={true}
        aoFechar={() => setUsuarioPermissoes(null)}
        aoSalvar={() => {
          // TODO: persistir permissões via PUT /admin/usuarios-globais/:id/permissions
          // quando endpoint for criado pelo Coordenador (servicoPermissaoUsuario.configurarPermissoes).
          // Enquanto isso, o modal exibe banner de preview (contextoAdmin=true).
          addNotification({
            type: 'info',
            message: t('admin.usuarios-globais.msg_permissoes_preview'),
          })
          setUsuarioPermissoes(null)
        }}
      />

      {/* ── Modal Convidar Usuário ────────────────────────────────────────── */}
      {(() => {
        const requisitosConviteAdmin: RequisitoSalvar[] = [
          { chave: 'fNome',  ok: !!fNome.trim(),  mensagem: 'Nome completo' },
          { chave: 'fEmail', ok: !!fEmail.trim(), mensagem: 'E-mail de acesso' },
        ]
        return (
      <ModalFormularioGlobal
        aberto={showForm}
        aoFechar={() => { setShowForm(false); setFNome(''); setFEmail(''); setFTipo('Standard'); setFOrg(ORGS[0]) }}
        aoSalvar={handleInvite}
        icone={<User size={20} weight="duotone" />}
        titulo={t('admin.usuarios-globais.btn_convidar')}
        subtitulo={t('admin.usuarios-globais.modal_convidar_subtitulo')}
        tamanho="md"
        altura="560px"
        dirty={!!(fNome || fEmail)}
        podesSalvar={requisitosConviteAdmin.every(r => r.ok)}
      >
        <BannerRequisitosContexto requisitos={requisitosConviteAdmin}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <CampoGeralGlobal
            label={t('admin.usuarios-globais.tabela.nome_completo')}
            obrigatorio
            tooltipTitulo={t('admin.usuarios-globais.tabela.nome_completo')}
            tooltipDescricao={t('admin.usuarios-globais.tabela.nome_completo_desc')}
          >
            <div className="ws-input-icon-wrap">
              <User size={16} />
              <input
                value={fNome}
                placeholder={t('admin.usuarios-globais.form_nome_placeholder')}
                onChange={e => setFNome(e.target.value)}
                style={{ width: '100%' }}
              />
            </div>
          </CampoGeralGlobal>

          <CampoGeralGlobal
            label={t('admin.usuarios-globais.tabela.email')}
            obrigatorio
            tooltipTitulo={t('admin.usuarios-globais.tabela.email_acesso')}
            tooltipDescricao={t('admin.usuarios-globais.tabela.email_acesso_desc')}
          >
            <div className="ws-input-icon-wrap">
              <EnvelopeSimple size={16} />
              <input
                type="email"
                value={fEmail}
                placeholder={t('admin.usuarios-globais.form_email_placeholder')}
                onChange={e => setFEmail(e.target.value)}
                style={{ width: '100%' }}
              />
            </div>
          </CampoGeralGlobal>

          <CampoGeralGlobal label={t('admin.usuarios-globais.tabela.tipo')}>
            <SelectGlobal
              opcoes={opcoesDisponiveis}
              valor={fTipo}
              aoMudarValor={(v) => setFTipo(v as NivelAcesso)}
              iconeEsquerda={<ShieldCheck size={18} weight="duotone" />}
              buscavel={false}
              placeholder={t('admin.usuarios-globais.form_tipo_placeholder')}
              renderizarOpcao={(op) => (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ 
                    display: 'flex', alignItems: 'center', justifyContent: 'center', 
                    width: '32px', height: '32px', borderRadius: '8px', 
                    background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)'
                  }}>
                    {op.meta?.icone as React.ReactNode}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>{op.rotulo}</span>
                    <span style={{ fontSize: '0.75rem', opacity: 0.6 }}>{op.descricao}</span>
                  </div>
                </div>
              )}
            />
          </CampoGeralGlobal>

          <CampoGeralGlobal
            label={t('admin.usuarios-globais.tabela.organizacao')}
            tooltipTitulo={isGravityRole ? 'Organização Gravity' : t('admin.usuarios-globais.tabela.org_tooltip')}
            tooltipDescricao={isGravityRole
              ? 'Admin e Super Admin pertencem à plataforma Gravity e não a um workspace de cliente.'
              : t('admin.usuarios-globais.tabela.org_desc')}
          >
            {isGravityRole ? (
              // Org fixa — Admin/Super Admin sempre pertencem à Gravity
              <div style={{
                display: 'flex', alignItems: 'center', gap: '0.5rem',
                padding: '0.55rem 0.875rem', borderRadius: '0.5rem',
                background: 'rgba(16,185,129,0.06)',
                border: '1px solid rgba(16,185,129,0.25)',
                color: '#10b981', fontSize: '0.875rem', fontWeight: 600,
              }}>
                <Buildings size={16} weight="duotone" />
                Gravity
                <span style={{ marginLeft: 'auto', fontSize: '0.7rem', opacity: 0.6, fontWeight: 400 }}>
                  fixo para Admin / Super Admin
                </span>
              </div>
            ) : (
              <SelectGlobal
                opcoes={ORGS.filter(o => o !== 'Gravity').map(o => ({ valor: o, rotulo: o }))}
                valor={fOrg}
                aoMudarValor={(v) => setFOrg(v as string)}
                iconeEsquerda={<Buildings size={18} weight="duotone" />}
                placeholder={t('admin.usuarios-globais.form_org_placeholder')}
              />
            )}
          </CampoGeralGlobal>

          <BannerRequisitosGlobal />
        </div>
        </BannerRequisitosContexto>
      </ModalFormularioGlobal>
        )
      })()}

    </PaginaGlobal>
  )
}
