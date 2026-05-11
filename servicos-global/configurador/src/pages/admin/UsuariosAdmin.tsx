import React, { useState, useEffect, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useUser } from '@clerk/clerk-react'
import {
  Users, UserCircleCheck, UserCircleMinus,
  PencilSimple,
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
import {
  adminUsersApi,
  adminOrganizacoesApi,
  usuariosApi,
  type GlobalUserApi,
  type WorkspaceItem,
} from '../../services/api-client'
import { useShellStore } from '@gravity/shell'
import { useCarregarTipoUsuario } from '../../hooks/use-carregar-tipo-usuario'
import { usePodeEditarUsuario } from '../../hooks/use-pode-editar-usuario'
import { workspaceUrl } from '../../config/constants'
import {
  ExpandidoEditorVinculos,
  type EdicoesPorUsuario,
} from '../../components/expandido-editor-vinculos'

/** Regex RFC 5322 simplificada para validação de email no frontend. */
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

// ─── Tipos globais ─────────────────────────────────────────────────────────────
// Documentação central em src/types/niveis-acesso.ts

interface VinculoWorkspaceUI {
  id_usuario_workspace: string
  id_workspace: string
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
  /** id_organizacao do alvo — necessário para lazy-load de workspaces da org. */
  id_organizacao: string
  nome_organizacao: string
  vinculos_workspace: VinculoWorkspaceUI[]
}

// ─── Helper: mapeia GlobalUserApi do backend para UsuarioGlobalUI ──────────────

function mapApiUserToGlobal(u: GlobalUserApi): UsuarioGlobalUI {
  const vinculos: VinculoWorkspaceUI[] = u.memberships.map(m => ({
    id_usuario_workspace: m.id_usuario_workspace,
    id_workspace:         m.id_workspace,
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
    id_organizacao:    u.id_organizacao,
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
  const { tipoUsuario: dbRole } = useCarregarTipoUsuario()
  const perfilLogado: NivelAcesso = mapRole(dbRole ?? '')
  const { user: clerkUser } = useUser()

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

  // id_usuario do ator (anti-escalada por id — hook usePodeEditarUsuario só
  // checa por tipo). Padrão Usuarios.tsx:253-254 — match clerkUser.email ↔
  // users[].email_usuario, já que o cache do useCarregarTipoUsuario só guarda
  // tipo, não o id_usuario do banco.
  const idUsuarioAtor =
    users.find(u => clerkUser?.primaryEmailAddress?.emailAddress === u.email_usuario)?.id_usuario ?? null
  const ehAlvoProprio = !!(usuarioEditando && idUsuarioAtor && idUsuarioAtor === usuarioEditando.id_usuario)

  // Whitelist de tipos que o ator pode atribuir ao alvo em edição.
  // Reaproveita usePodeEditarUsuario (espelha autorizarAlteracaoPatente
  // do backend em server/routes/usuario.ts:476-546). Mand. 04 — anti-escalada:
  // passa null quando ator===alvo (backend também bloqueia com FORBIDDEN_SELF_EDIT,
  // defesa em profundidade).
  const podeEditarAlvo = usePodeEditarUsuario(
    usuarioEditando && !ehAlvoProprio
      ? { id_usuario: usuarioEditando.id_usuario, tipo_usuario: nivelToRole(usuarioEditando.tipo) }
      : null
  )
  const tiposPermitidosUI: NivelAcesso[] = useMemo(
    () => podeEditarAlvo.tiposPermitidosParaPatente.map(mapRole),
    [podeEditarAlvo.tiposPermitidosParaPatente]
  )

  // ── Modo edição em lote dos vínculos workspace (cross-org) ──────────────────
  // Padrão Assinaturas — cânone em skills/ux/criacao-telas/SKILL.md.
  // Reusa `ExpandidoEditorVinculos` (componente compartilhado) e o endpoint
  // `PUT /api/v1/usuarios/:id/workspaces` (já suporta SUPER_ADMIN cross-org).
  // Gating: opção α (decisão dono 2026-05-05) — apenas SUPER_ADMIN edita aqui.
  const [edicoesPendentesPorUsuario, setEdicoesPendentesPorUsuario] =
    useState<Record<string, EdicoesPorUsuario>>({})
  const [salvandoEdicoes, setSalvandoEdicoes] = useState<Set<string>>(new Set())
  const [selecaoPorUsuario, setSelecaoPorUsuario] = useState<Record<string, string[]>>({})

  // Cache de workspaces por organização (lazy-load no expand da linha).
  const [workspacesPorOrg, setWorkspacesPorOrg] = useState<Record<string, WorkspaceItem[]>>({})
  const [carregandoWsOrg, setCarregandoWsOrg] = useState<Set<string>>(new Set())
  const [erroWsOrg, setErroWsOrg] = useState<Record<string, string>>({})

  async function carregarWorkspacesOrg(id_organizacao: string) {
    if (workspacesPorOrg[id_organizacao] || carregandoWsOrg.has(id_organizacao)) return
    setCarregandoWsOrg((prev) => new Set(prev).add(id_organizacao))
    setErroWsOrg((prev) => { const n = { ...prev }; delete n[id_organizacao]; return n })
    try {
      const { workspaces } = await adminOrganizacoesApi.listarWorkspaces(id_organizacao)
      setWorkspacesPorOrg((prev) => ({ ...prev, [id_organizacao]: workspaces }))
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Falha ao carregar workspaces da organização.'
      setErroWsOrg((prev) => ({ ...prev, [id_organizacao]: msg }))
      addNotification({ type: 'error', message: msg })
    } finally {
      setCarregandoWsOrg((prev) => { const n = new Set(prev); n.delete(id_organizacao); return n })
    }
  }

  // Estado servidor de um vínculo: id_workspace presente nos vinculos do alvo.
  function vinculosServidorDoUsuario(usuario: UsuarioGlobalUI): string[] {
    return usuario.vinculos_workspace.map((v) => v.id_workspace)
  }

  function aoStagedToggleWorkspace(usuario: UsuarioGlobalUI, id_workspace: string) {
    const ativo_servidor = vinculosServidorDoUsuario(usuario).includes(id_workspace)
    setEdicoesPendentesPorUsuario((prev) => {
      const cur = prev[usuario.id_usuario] ?? {}
      const existente = cur[id_workspace]
      const next: EdicoesPorUsuario = { ...cur }
      if (existente) delete next[id_workspace]
      else next[id_workspace] = { tipo: 'toggle', ativo: !ativo_servidor }
      const proximo = { ...prev }
      if (Object.keys(next).length === 0) delete proximo[usuario.id_usuario]
      else proximo[usuario.id_usuario] = next
      return proximo
    })
  }

  function aoStagedAcaoEmMassa(
    usuario: UsuarioGlobalUI,
    ids_workspace: string[],
    acao: 'habilitar' | 'bloquear',
  ) {
    if (ids_workspace.length === 0) return
    const ativo_alvo = acao === 'habilitar'
    const servidor = new Set(vinculosServidorDoUsuario(usuario))
    setEdicoesPendentesPorUsuario((prev) => {
      const cur = prev[usuario.id_usuario] ?? {}
      const next: EdicoesPorUsuario = { ...cur }
      for (const id_workspace of ids_workspace) {
        const ativo_servidor = servidor.has(id_workspace)
        if (ativo_servidor === ativo_alvo) { delete next[id_workspace]; continue }
        next[id_workspace] = { tipo: 'toggle', ativo: ativo_alvo }
      }
      const proximo = { ...prev }
      if (Object.keys(next).length === 0) delete proximo[usuario.id_usuario]
      else proximo[usuario.id_usuario] = next
      return proximo
    })
  }

  function descartarEdicoesUsuario(id_usuario: string) {
    setEdicoesPendentesPorUsuario((prev) => { const n = { ...prev }; delete n[id_usuario]; return n })
    setSelecaoPorUsuario((prev) => { const n = { ...prev }; delete n[id_usuario]; return n })
  }

  async function salvarEdicoesUsuario(usuario: UsuarioGlobalUI) {
    const pendentes = edicoesPendentesPorUsuario[usuario.id_usuario] ?? {}
    if (Object.keys(pendentes).length === 0) return

    setSalvandoEdicoes((prev) => new Set(prev).add(usuario.id_usuario))
    try {
      const finais = new Set<string>(vinculosServidorDoUsuario(usuario))
      for (const [id_workspace, edicao] of Object.entries(pendentes)) {
        if (edicao.ativo) finais.add(id_workspace)
        else finais.delete(id_workspace)
      }
      await usuariosApi.substituirWorkspaces(usuario.id_usuario, Array.from(finais))
      // Refetch antes de descartar pendências (evita flicker do badge HABILITADO/BLOQUEADO)
      await loadUsers()
      descartarEdicoesUsuario(usuario.id_usuario)
      addNotification({
        type: 'success',
        message: `Acessos de "${usuario.nome_usuario}" atualizados.`,
      })
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erro ao salvar alterações.'
      addNotification({ type: 'error', message: msg })
    } finally {
      setSalvandoEdicoes((prev) => { const n = new Set(prev); n.delete(usuario.id_usuario); return n })
    }
  }

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
      await adminUsersApi.inviteUser({
        email_usuario: email,
        nome_usuario:  nome,
        tipo_usuario:  nivelToRole(fTipo),
      })
      // Refetch é a fonte da verdade — backend retorna id_organizacao real e
      // demais campos completos (UsuarioGlobalUI exige id_organizacao desde
      // 2026-05-05 para alimentar o lazy-load do editor de vínculos).
      await loadUsers()
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

  // COLUNAS_FILHAS removido em 2026-05-05 — o expandido agora usa
  // ExpandidoEditorVinculos (componente compartilhado, padrão Assinaturas).

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
            renderExpandido={(user) => {
              // Branch 1 — Master/SAdmin/Admin: Mand. 04 LIMBO. Acesso implícito.
              const acessoTotal =
                user.tipo === 'Master' || user.tipo === 'Super Admin' || user.tipo === 'Admin'
              if (acessoTotal) {
                return (
                  <div style={{ padding: '0 1.25rem 1.25rem 1.25rem', background: 'rgba(0,0,0,0.15)' }}>
                    <div style={{ padding: '1rem', borderTop: '1px solid rgba(129,140,248,0.1)', display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--ws-muted)', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      <ShieldCheck size={14} weight="duotone" color="var(--color-primary)" /> Permissões de Acesso por Workspace
                    </div>
                    <div
                      role="note"
                      aria-label={`Acesso implícito de ${user.tipo}`}
                      style={{
                        padding: '0.875rem 1rem', borderRadius: '10px',
                        background: 'rgba(129,140,248,0.06)', border: '1px solid rgba(129,140,248,0.25)',
                        display: 'flex', alignItems: 'flex-start', gap: '0.75rem',
                      }}
                    >
                      <ShieldCheck size={18} weight="fill" style={{ color: '#818cf8', flexShrink: 0, marginTop: 2 }} />
                      <div>
                        <p style={{ margin: 0, fontSize: '0.8125rem', fontWeight: 700, color: '#c7d2fe' }}>
                          Acesso implícito a todos os workspaces da organização
                        </p>
                        <p style={{ margin: '0.25rem 0 0', fontSize: '0.75rem', color: '#94a3b8', lineHeight: 1.5 }}>
                          Como <strong>{user.tipo}</strong>, <strong>{user.nome_usuario}</strong> tem acesso a todos os workspaces de <strong>{user.nome_organizacao}</strong> sem necessidade de vínculo individual. Para revogar, altere o tipo do usuário.
                        </p>
                      </div>
                    </div>
                  </div>
                )
              }

              // Branch 2 — Standard/Fornecedor: editor padrão Assinaturas com lazy-load.
              // Gating α (decisão dono 2026-05-05): apenas SUPER_ADMIN edita aqui.
              const podeEditar = perfilLogado === 'Super Admin'

              if (!workspacesPorOrg[user.id_organizacao] && !carregandoWsOrg.has(user.id_organizacao)) {
                void carregarWorkspacesOrg(user.id_organizacao)
              }
              const carregando = carregandoWsOrg.has(user.id_organizacao)
              const erro = erroWsOrg[user.id_organizacao]
              const workspacesDaOrg = workspacesPorOrg[user.id_organizacao] ?? []

              return (
                <div style={{ padding: '0 1.25rem 1.25rem 1.25rem', background: 'rgba(0,0,0,0.15)' }}>
                  <div style={{ paddingTop: '1rem' }}>
                    {carregando ? (
                      <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--ws-muted)', fontSize: '0.875rem', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px dashed rgba(255,255,255,0.1)' }}>
                        Carregando workspaces de <strong>{user.nome_organizacao}</strong>…
                      </div>
                    ) : erro ? (
                      <div style={{ padding: '2rem', textAlign: 'center', color: '#f87171', fontSize: '0.875rem', background: 'rgba(248,113,113,0.05)', borderRadius: '12px', border: '1px dashed rgba(248,113,113,0.3)' }}>
                        Falha ao carregar workspaces: {erro}
                      </div>
                    ) : (
                      <ExpandidoEditorVinculos
                        usuario={{ id_usuario: user.id_usuario, nome_usuario: user.nome_usuario }}
                        podeEditar={podeEditar}
                        workspaces={workspacesDaOrg}
                        vinculosServidor={vinculosServidorDoUsuario(user)}
                        edicoesPendentes={edicoesPendentesPorUsuario[user.id_usuario]}
                        selecaoIds={selecaoPorUsuario[user.id_usuario] ?? []}
                        onSelecaoChange={(ids) =>
                          setSelecaoPorUsuario((prev) => ({ ...prev, [user.id_usuario]: ids }))
                        }
                        onStagedToggle={(id_workspace) =>
                          aoStagedToggleWorkspace(user, id_workspace)
                        }
                        onAcaoEmMassa={(ids, acao) =>
                          aoStagedAcaoEmMassa(user, ids, acao)
                        }
                        onDescartar={() => descartarEdicoesUsuario(user.id_usuario)}
                        onSalvar={() => void salvarEdicoesUsuario(user)}
                        salvando={salvandoEdicoes.has(user.id_usuario)}
                      />
                    )}
                  </div>
                </div>
              )
            }}
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
        tiposPermitidos={tiposPermitidosUI}
        aoFechar={() => setUsuarioEditando(null)}
        aoSalvar={async (uEditado, permissoesParaPersistir, workspaceIds) => {
          // Estado original para rollback em caso de erro (Mand. 08).
          const original = users.find(u => u.id_usuario === uEditado.id_usuario) ?? null
          const tipoMudou = original !== null && nivelToRole(original.tipo) !== uEditado.tipo_usuario

          // Admin global edita APENAS tipo_usuario. Permissões granulares e vínculos
          // de workspace têm fluxo dedicado (ModalPermissoesUsuario / ExpandidoEditorVinculos).
          // Mand. 08 — se vierem do modal, avisar explicitamente (não silenciar).
          if (permissoesParaPersistir.length > 0 || workspaceIds.length > 0) {
            addNotification({
              type: 'info',
              message: t('admin.usuarios-globais.msg_apenas_tipo_editavel_admin'),
            })
          }

          try {
            // Persiste alteração de tipo_usuario via PATCH /patente — backend valida
            // matriz ator×alvo (autorizarAlteracaoPatente). SAdmin/Admin podem
            // promover/rebaixar conforme regras (Mand. 04).
            if (tipoMudou) {
              await usuariosApi.alterarTipoUsuario(uEditado.id_usuario, uEditado.tipo_usuario)
            }
            // Refetch — servidor é fonte da verdade após qualquer mutação.
            await loadUsers()
            addNotification({
              type: 'success',
              message: t('admin.usuarios-globais.msg_usuario_atualizado', { nome: uEditado.nome_usuario }),
            })
            setUsuarioEditando(null)
          } catch (err) {
            // Padrão Usuarios.tsx:1130-1144 — rollback de UI + refetch best-effort.
            // Mand. 08 — propaga mensagem real do backend (CONFLICT_LAST_MASTER,
            // FORBIDDEN_SELF_EDIT, etc), sem mascarar com fallback genérico.
            if (original) {
              setUsers(prev => prev.map(u => u.id_usuario === uEditado.id_usuario ? original : u))
            }
            try { await loadUsers() } catch { /* refetch best-effort */ }
            addNotification({
              type: 'error',
              message: err instanceof Error ? err.message : t('admin.usuarios-globais.msg_erro_atualizar'),
            })
          }
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
