import React, { useState, useEffect, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useUser } from '@clerk/clerk-react'
import {
  Users, UserCircleCheck, UserCircleMinus,
  PencilSimple, PauseCircle, PlayCircle,
  ChartPieSlice, Key, Buildings, User, EnvelopeSimple, ShieldCheck, Crown, Lightning, ArrowClockwise
} from '@phosphor-icons/react'
import { SelectGlobal, type SelectOpcao } from '@nucleo/campo-select-global'

import { PaginaGlobal } from '@nucleo/pagina-global'
import { CabecalhoGlobal } from '@nucleo/cabecalho-global'
import { TabelaGlobal, type TabelaGlobalColuna, type TabelaGlobalAcao } from '@nucleo/tabela-global'
import { BotaoGlobal } from '@nucleo/botao-global'
import { BotaoNovoAdminGlobal } from '@nucleo/botao-novo-admin-global'
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
import { ModalEditarUsuario } from '../configurador/ModalEditarUsuario'
import { type NivelAcesso, type UserStatus, mapRole, nivelToRole } from '../../types/niveis-acesso'
import {
  adminUsuariosApi,
  adminOrganizacoesApi,
  usuariosApi,
  type UsuarioGlobalApi,
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
  /** Flag da organização do alvo (decisão dono 2026-05-11) — habilita
   *  SUPER_ADMIN/ADMIN na whitelist de tipos atribuíveis. */
  organizacao_hospeda_colaboradores_gravity: boolean
  vinculos_workspace: VinculoWorkspaceUI[]
}

// ─── Helper: mapeia UsuarioGlobalApi do backend para UsuarioGlobalUI ──────────────

function mapearApiParaUsuarioGlobal(u: UsuarioGlobalApi): UsuarioGlobalUI {
  const vinculos: VinculoWorkspaceUI[] = u.memberships.map(m => ({
    id_usuario_workspace: m.id_usuario_workspace,
    id_workspace:         m.id_workspace,
    nome_workspace:       m.workspace?.nome_workspace ?? 'N/A',
    subdominio_workspace: m.workspace?.subdominio_workspace ?? '',
    perfil:               mapRole(m.tipo_usuario_workspace),
  }))
  // Status vem derivado do backend (CONVIDADO se id_clerk_usuario começa com
  // 'pending_', ATIVO caso contrário). Decisão dono 2026-05-12.
  // Antes (bug Mand. 04): derivava por `vinculos.length > 0` — MASTER nunca
  // tem UsuarioWorkspace (Mand. 04: acesso global por tipo_usuario), então
  // todo MASTER aparecia 'Inativo' mesmo sendo usuário ativo.
  //
  // Atualização 2026-05-12: INATIVO agora é VALOR PERSISTIDO em
  // Usuario.status_usuario (enum StatusUsuario). Mapeia direto.
  const status: UserStatus =
    u.status_usuario === 'CONVIDADO' ? 'Convidado' :
    u.status_usuario === 'INATIVO'   ? 'Inativo'   :
    'Ativo'
  return {
    id_usuario:        u.id_usuario,
    nome_usuario:      u.nome_usuario,
    email_usuario:     u.email_usuario,
    tipo:              mapRole(u.tipo_usuario),
    status,
    id_organizacao:    u.id_organizacao,
    nome_organizacao:  u.organizacao?.nome_organizacao ?? 'N/A',
    organizacao_hospeda_colaboradores_gravity: u.organizacao?.hospeda_colaboradores_gravity ?? false,
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

// Catálogo completo de tipos para o modal de convite. A regra condicional
// (decisão dono 2026-05-11) é aplicada em runtime: SUPER_ADMIN/ADMIN só
// aparecem para SAdmin quando a organização-destinatária tem
// hospeda_colaboradores_gravity=true. Para o admin global, isso vem da
// própria org do ator logado (`/api/v1/me`.organizacao.hospeda_colaboradores_gravity).
const OPCOES_TIPO_ADMIN: SelectOpcao[] = [
  { valor: 'Fornecedor',  rotulo: 'Fornecedor',  descricao: 'Acesso externo restrito para prestadores de serviço', meta: { icone: <Buildings size={16} weight="duotone" color="#fbbf24" /> } },
  { valor: 'Standard',    rotulo: 'Standard',    descricao: 'Usuário operacional vinculado a workspaces específicos', meta: { icone: <User size={16} weight="duotone" color="#94a3b8" /> } },
  { valor: 'Master',      rotulo: 'Master',      descricao: 'Gestor máximo da organização (acesso total no tenant)', meta: { icone: <Crown size={16} weight="duotone" color="#818cf8" /> } },
  { valor: 'Admin',       rotulo: 'Admin',       descricao: 'Administrador da plataforma com permissões específicas (apenas em organizações Gravity)', meta: { icone: <ShieldCheck size={16} weight="duotone" color="#06b6d4" /> } },
  { valor: 'Super Admin', rotulo: 'Super Admin', descricao: 'Controle total global da plataforma (apenas em organizações Gravity)', meta: { icone: <Lightning size={16} weight="duotone" color="#22c55e" /> } },
]

export function UsuariosAdmin() {
  const { t } = useTranslation()
  const addNotification = useShellStore((s) => s.addNotification)
  const { tipoUsuario: dbRole } = useCarregarTipoUsuario()
  const perfilLogado: NivelAcesso = mapRole(dbRole ?? '')
  const { user: clerkUser } = useUser()

  const [usuarios, setUsuarios] = useState<UsuarioGlobalUI[]>([])
  const [carregando, setCarregando] = useState(true)
  const [erroCarregar, setErroCarregar] = useState<string | null>(null)

  const [showForm, setShowForm]                     = useState(false)
  const [fNome, setFNome]                           = useState('')
  const [fEmail, setFEmail]                         = useState('')
  const [fTipo, setFTipo]                           = useState<NivelAcesso>('Standard')
  // Antes era `fOrg` (nome_organizacao). Bug histórico: o backend ignorava o
  // valor e criava o usuário sempre na org do ator (Gravity HQ). Agora é o
  // id_organizacao real (CUID), enviado para o backend como id_organizacao_alvo.
  const [fIdOrganizacaoAlvo, setFIdOrganizacaoAlvo] = useState('')
  // Workspaces alvo do convite — só preenchido para PADRAO/FORNECEDOR (MASTER tem bypass).
  // Convenção do backend: 'all' = todos ATIVOs da org alvo; string[] = subset explícito.
  const [fWorkspacesAlvo, setFWorkspacesAlvo]       = useState<'all' | string[]>([])

  // Organizações derivadas dos dados reais (usado em cards de estatística:
  // total, orgs com/sem usuários). Diferente de `orgsAdmin` (lista da API
  // usada apenas para o select do modal de convite).
  const ORGS = useMemo(() => {
    const orgs = new Set(usuarios.map(u => u.nome_organizacao))
    return Array.from(orgs).sort()
  }, [usuarios])

  // Lista de orgs para o select do modal de convite — fonte real (com CUID +
  // flag hospeda_colaboradores_gravity), não derivado de `usuarios`.
  // Decisão dono 2026-05-12: para SUPER_ADMIN/ADMIN, filtrar pra mostrar
  // apenas orgs que hospedam colaboradores Gravity (auto-seleção se só 1).
  const [orgsAdmin, setOrgsAdmin] = useState<Array<{ id_organizacao: string; nome_organizacao: string; hospeda_colaboradores_gravity: boolean }>>([])

  // Carrega lista de orgs uma vez ao montar
  useEffect(() => {
    let cancel = false
    adminOrganizacoesApi.list({ limit: 200 })
      .then(res => {
        if (!cancel) setOrgsAdmin(res.organizacoes.map(o => ({
          id_organizacao: o.id_organizacao,
          nome_organizacao: o.nome_organizacao,
          hospeda_colaboradores_gravity: !!o.hospeda_colaboradores_gravity,
        })))
      })
      .catch(() => { /* mantém vazio — UI mostra placeholder */ })
    return () => { cancel = true }
  }, [])

  // Carregar usuários da API (com suporte a retry manual)
  async function loadUsers() {
    try {
      setCarregando(true)
      setErroCarregar(null)
      const res = await adminUsuariosApi.listar()
      setUsuarios(res.usuarios.map(mapearApiParaUsuarioGlobal))
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
  const [abaEditando, setAbaEditando]         = useState<string>('dados')

  // id_usuario do ator (anti-escalada por id — hook usePodeEditarUsuario só
  // checa por tipo). Padrão Usuarios.tsx:253-254 — match clerkUser.email ↔
  // usuarios[].email_usuario, já que o cache do useCarregarTipoUsuario só guarda
  // tipo, não o id_usuario do banco.
  const idUsuarioAtor =
    usuarios.find(u => clerkUser?.primaryEmailAddress?.emailAddress === u.email_usuario)?.id_usuario ?? null
  const ehAlvoProprio = !!(usuarioEditando && idUsuarioAtor && idUsuarioAtor === usuarioEditando.id_usuario)

  // Whitelist de tipos que o ator pode atribuir ao alvo em edição.
  // Reaproveita usePodeEditarUsuario (espelha autorizarAlteracaoPatente
  // do backend em server/routes/usuario.ts:476-546). Mand. 04 — anti-escalada:
  // passa null quando ator===alvo (backend também bloqueia com EDICAO_PROPRIA_NAO_PERMITIDA,
  // defesa em profundidade).
  const podeEditarAlvo = usePodeEditarUsuario(
    usuarioEditando && !ehAlvoProprio
      ? {
          id_usuario: usuarioEditando.id_usuario,
          tipo_usuario: nivelToRole(usuarioEditando.tipo),
          organizacao_hospeda_colaboradores_gravity: usuarioEditando.organizacao_hospeda_colaboradores_gravity,
        }
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

  // OPCOES_TIPO_ADMIN expõe todos os 5 tipos. A filtragem (SAdmin/Admin só
  // se a org do destinatário hospeda colaboradores Gravity — decisão dono
  // 2026-05-11) acontece em runtime via tiposPermitidosUI/usePodeEditarUsuario.
  // Sem filtro condicional por perfil aqui — o backend é a fonte da verdade.
  const opcoesDisponiveis = OPCOES_TIPO_ADMIN

  /**
   * Submit do form de convite admin (cross-org).
   *
   * Renomeado de `handleInvite` para DDD-PT (2026-05-12). Agora envia
   * id_organizacao_alvo (CUID) + workspaces_alvo. PADRAO/FORNECEDOR exigem
   * pelo menos 1 workspace (ou 'all'). MASTER/SAdmin/Admin não precisam.
   */
  async function aoConvidarUsuario() {
    const nome  = fNome.trim()
    const email = fEmail.trim()
    if (!nome || !email) return
    if (!EMAIL_REGEX.test(email)) {
      addNotification({ type: 'error', message: t('admin.usuarios-globais.msg_email_invalido') })
      return
    }
    if (!fIdOrganizacaoAlvo) {
      addNotification({ type: 'error', message: t('admin.usuarios-globais.msg_org_obrigatoria', 'Selecione a organização alvo do convite') })
      return
    }
    const tipoBackend = nivelToRole(fTipo)
    // Standard/Fornecedor exige workspaces (Mand. 08 — fail-closed)
    const exigeWorkspaces = tipoBackend === 'PADRAO' || tipoBackend === 'FORNECEDOR'
    let workspacesPayload: 'all' | string[] | undefined
    if (exigeWorkspaces) {
      if (fWorkspacesAlvo === 'all') {
        workspacesPayload = 'all'
      } else if (Array.isArray(fWorkspacesAlvo) && fWorkspacesAlvo.length > 0) {
        workspacesPayload = fWorkspacesAlvo
      } else {
        addNotification({ type: 'error', message: t('admin.usuarios-globais.msg_ws_obrigatorio', 'Selecione pelo menos um workspace para Standard/Fornecedor') })
        return
      }
    }
    try {
      await adminUsuariosApi.convidar({
        id_organizacao_alvo: fIdOrganizacaoAlvo,
        email_usuario: email,
        nome_usuario:  nome,
        tipo_usuario:  tipoBackend,
        workspaces_alvo: workspacesPayload,
      })
      // Refetch é a fonte da verdade — backend retorna id_organizacao real e
      // demais campos completos (UsuarioGlobalUI exige id_organizacao desde
      // 2026-05-05 para alimentar o lazy-load do editor de vínculos).
      await loadUsers()
      addNotification({ type: 'success', message: t('admin.usuarios-globais.msg_usuario_adicionado', { nome: fNome.trim() }) })
      setFNome(''); setFEmail(''); setFTipo('Standard'); setFIdOrganizacaoAlvo(''); setFWorkspacesAlvo([]); setShowForm(false)
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
          {/* Stack vertical: nome em cima, org embaixo, alinhados horizontalmente
              à direita do avatar. Decisão dono 2026-05-13 — paridade com Configurador
              (que não tem org), preservando visibilidade cross-org no Admin. */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem', minWidth: 0 }}>
            <span style={{ fontWeight: 600 }}>{item.nome_usuario}</span>
            <OrgBadge nome={item.nome_organizacao} />
          </div>
        </div>
      )
    },
    {
      key: 'email_usuario', label: t('admin.usuarios-globais.tabela.email'), tipo: 'texto',
      tooltipTitulo: t('admin.usuarios-globais.tabela.email_acesso'), tooltipDescricao: t('admin.usuarios-globais.tabela.email_acesso_desc'),
      render: (v) => <span style={{ color: 'var(--ws-muted)' }}>{v}</span>
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
      render: (v) => {
        // Alinhado ao padrão da tela workspace/Usuarios.tsx (decisão dono
        // 2026-05-12): 3 estados com cores idênticas no Configurador e Admin.
        // ATIVO/CONVIDADO vêm do backend, INATIVO é persistido em
        // Usuario.status_usuario (commit 74670de9).
        const ESTILO_BADGE: Record<string, { bg: string; fg: string; border: string; label: string }> = {
          Ativo:     { bg: 'rgba(52,211,153,0.12)', fg: '#34d399', border: 'rgba(52,211,153,0.2)', label: t('comum.ativo') },
          Convidado: { bg: 'rgba(251,191,36,0.12)', fg: '#fbbf24', border: 'rgba(251,191,36,0.2)', label: t('workspace.users.status.convidado') },
          Inativo:   { bg: 'rgba(248,113,113,0.12)', fg: '#f87171', border: 'rgba(248,113,113,0.2)', label: t('comum.inativo') },
        }
        const e = ESTILO_BADGE[v as string] ?? ESTILO_BADGE.Inativo
        return (
          <span style={{
            display: 'inline-flex', padding: '0.2rem 0.625rem', borderRadius: '9999px',
            fontSize: '0.6875rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em',
            background: e.bg, color: e.fg, border: `1px solid ${e.border}`,
          }}>{e.label}</span>
        )
      }
    },
    {
      // ACESSO — paridade com Configurador (workspace/Usuarios.tsx:647).
      // Master/SAdmin/Admin: chip "✶ Todos os workspaces" (LIMBO Mand. 04).
      // Standard/Fornecedor: chips com nomes dos workspaces vinculados.
      // Decisão dono 2026-05-13.
      key: 'id_usuario', label: t('workspace.users.tabela_acesso', 'Acesso'), tipo: 'texto',
      tooltipTitulo: 'Workspaces vinculados',
      tooltipDescricao: 'Workspaces aos quais este usuário tem acesso liberado',
      render: (_, item) => {
        const acessoTotal = item.tipo === 'Master' || item.tipo === 'Super Admin' || item.tipo === 'Admin'
        if (acessoTotal) {
          return (
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.25rem',
              padding: '0.2rem 0.625rem', borderRadius: '9999px',
              background: 'rgba(129,140,248,0.1)', color: '#818cf8',
              fontSize: '0.75rem', fontWeight: 600, fontStyle: 'italic',
              border: '1px solid rgba(129,140,248,0.2)', whiteSpace: 'nowrap',
            }}>✶ Todos os workspaces</span>
          )
        }
        if (item.vinculos_workspace.length === 0) {
          return <span style={{ color: 'var(--ws-muted)', fontSize: '0.8125rem' }}>—</span>
        }
        const MAX = 2
        const visiveis = item.vinculos_workspace.slice(0, MAX)
        const extras = item.vinculos_workspace.length - MAX
        return (
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', flexWrap: 'wrap' }}>
            {visiveis.map(w => (
              <span key={w.id_workspace} style={{
                padding: '0.15rem 0.5rem', borderRadius: 6, fontSize: '0.6875rem', fontWeight: 600,
                background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)',
                color: '#cbd5e1', whiteSpace: 'nowrap',
              }}>{w.nome_workspace}</span>
            ))}
            {extras > 0 && (
              <TooltipGlobal descricao={item.vinculos_workspace.slice(MAX).map(w => w.nome_workspace).join(', ')}>
                <span style={{
                  padding: '0.15rem 0.5rem', borderRadius: 6, fontSize: '0.6875rem', fontWeight: 700,
                  background: 'rgba(129,140,248,0.1)', color: '#818cf8',
                  border: '1px solid rgba(129,140,248,0.2)', cursor: 'help',
                }}>+{extras}</span>
              </TooltipGlobal>
            )}
          </div>
        )
      },
    },
  ]

  // COLUNAS_FILHAS removido em 2026-05-05 — o expandido agora usa
  // ExpandidoEditorVinculos (componente compartilhado, padrão Assinaturas).

  // Handler de toggle status (ATIVO ↔ INATIVO). Espelha o do Configurador
  // workspace (Usuarios.tsx). CONVIDADO não alterna — use Cancelar Convite.
  // Backend: PATCH /api/v1/usuarios/:id/status com 5 validações + Mand. 04
  // anti-bricking. Decisão dono 2026-05-12.
  async function handleAlternarStatusUsuario(u: UsuarioGlobalUI) {
    if (u.status === 'Convidado') return // CONVIDADO usa Cancelar Convite
    const novoStatus: 'ATIVO' | 'INATIVO' = u.status === 'Ativo' ? 'INATIVO' : 'ATIVO'
    try {
      const { usuario: atualizado } = await usuariosApi.atualizarStatus(u.id_usuario, novoStatus)
      // Atualiza estado local pra refletir imediatamente sem refetch.
      setUsuarios((prev) => prev.map((x) =>
        x.id_usuario === u.id_usuario
          ? { ...x, status: atualizado.status_usuario === 'ATIVO' ? 'Ativo' : 'Inativo' }
          : x,
      ))
      addNotification({
        type: 'success',
        message: novoStatus === 'INATIVO'
          ? `Usuário ${u.nome_usuario} desativado.`
          : `Usuário ${u.nome_usuario} reativado.`,
      })
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erro ao alterar status do usuário.'
      // Mensagens específicas (Mand. 04 — usuário não fica cego):
      addNotification({
        type: 'error',
        message: msg.includes('último Master')
          ? '⚠️ Não é possível inativar o último Master ativo da organização. Promova outro usuário a Master primeiro.'
          : msg.includes('próprio status') || msg.includes('a si mesmo')
            ? '⚠️ Você não pode alterar o próprio status. Peça a outro admin.'
            : msg.includes('CONVIDADO')
              ? '⚠️ Este usuário ainda é Convidado. Use "Cancelar Convite" para revogar.'
              : msg,
      })
    }
  }

  async function handleReenviarConvite(u: UsuarioGlobalUI) {
    if (u.status !== 'Convidado') return
    try {
      await usuariosApi.reenviarConvite(u.id_usuario)
      addNotification({
        type: 'success',
        message: `Convite reenviado para ${u.email_usuario}.`,
      })
    } catch (err) {
      addNotification({
        type: 'error',
        message: err instanceof Error ? err.message : 'Falha ao reenviar convite.',
      })
    }
  }

  const ACOES: TabelaGlobalAcao<UsuarioGlobalUI>[] = [
    {
      id: 'resend-invite',
      icone: <ArrowClockwise size={15} weight="bold" />,
      tooltip: 'Reenviar Convite',
      onClick: handleReenviarConvite,
      renderCustom: (u) => {
        if (u.status !== 'Convidado') return null
        return (
          <TooltipGlobal descricao="Reenviar Convite">
            <button
              type="button"
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); void handleReenviarConvite(u) }}
              style={{
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                width: 28, height: 28, borderRadius: '50%',
                background: 'transparent', border: '1px solid transparent',
                color: '#64748b', cursor: 'pointer', transition: 'all 0.15s', flexShrink: 0,
              }}
              onMouseEnter={(ev) => { ev.currentTarget.style.background = 'rgba(129,140,248,0.12)'; ev.currentTarget.style.borderColor = 'rgba(129,140,248,0.3)'; ev.currentTarget.style.color = '#818cf8' }}
              onMouseLeave={(ev) => { ev.currentTarget.style.background = 'transparent'; ev.currentTarget.style.borderColor = 'transparent'; ev.currentTarget.style.color = '#64748b' }}
            >
              <ArrowClockwise size={15} weight="bold" />
            </button>
          </TooltipGlobal>
        )
      },
    },
    {
      id: 'permissions',
      icone: <Key size={15} weight="bold" aria-label={t('admin.usuarios-globais.acao_permissoes')} />,
      tooltip: t('admin.usuarios-globais.acao_permissoes'),
      // Abre o mesmo modal Editar Usuário, já na aba "Permissões". Paridade
      // com Configurador (workspace/Usuarios.tsx) — modal único unificado.
      // ModalPermissoesUsuario antigo foi descontinuado (decisão dono 2026-05-13).
      onClick: (u) => {
        setUsuarioEditando(u)
        setAbaEditando('permissoes')
        void carregarWorkspacesOrg(u.id_organizacao)
      },
    },
    {
      id: 'toggle-status',
      // Ícone alterna entre Play (pra ATIVAR) e Pause (pra INATIVAR).
      // CONVIDADO: botão fica desabilitado (use Cancelar Convite).
      icone: <PauseCircle size={15} weight="bold" />,
      tooltip: (u) =>
        u.status === 'Convidado' ? 'Convidado — use Cancelar Convite' :
        u.status === 'Ativo'     ? 'Inativar usuário' :
        'Reativar usuário',
      disabled: (u) => u.status === 'Convidado',
      onClick: handleAlternarStatusUsuario,
      renderCustom: (u) => (
        <TooltipGlobal descricao={
          u.status === 'Convidado' ? 'Convidado — use Cancelar Convite' :
          u.status === 'Ativo'     ? 'Inativar usuário' :
          'Reativar usuário'
        }>
          <button
            type="button"
            disabled={u.status === 'Convidado'}
            onClick={(e) => { e.stopPropagation(); handleAlternarStatusUsuario(u) }}
            style={{
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              width: 28, height: 28, borderRadius: '50%',
              background: 'transparent', border: '1px solid transparent',
              color: u.status === 'Convidado' ? '#475569' : '#64748b',
              cursor: u.status === 'Convidado' ? 'not-allowed' : 'pointer',
              opacity: u.status === 'Convidado' ? 0.4 : 1,
              transition: 'all 0.15s', flexShrink: 0,
            }}
            onMouseEnter={(ev) => {
              if (u.status === 'Convidado') return
              const isAtivando = u.status === 'Inativo'
              ev.currentTarget.style.background = isAtivando ? 'rgba(52,211,153,0.12)' : 'rgba(251,191,36,0.12)'
              ev.currentTarget.style.borderColor = isAtivando ? 'rgba(52,211,153,0.3)' : 'rgba(251,191,36,0.3)'
              ev.currentTarget.style.color = isAtivando ? '#34d399' : '#fbbf24'
            }}
            onMouseLeave={(ev) => {
              ev.currentTarget.style.background = 'transparent'
              ev.currentTarget.style.borderColor = 'transparent'
              ev.currentTarget.style.color = '#64748b'
            }}
          >
            {u.status === 'Inativo'
              ? <PlayCircle size={16} weight="bold" />
              : <PauseCircle size={16} weight="bold" />}
          </button>
        </TooltipGlobal>
      ),
    },
    {
      id: 'edit',
      icone: <PencilSimple size={15} weight="bold" aria-label={t('admin.usuarios-globais.acao_editar')} />,
      tooltip: t('admin.usuarios-globais.acao_editar'),
      onClick: (u) => {
        setUsuarioEditando(u)
        setAbaEditando('dados')
        // Lazy-load workspaces da org do alvo para que as abas Workspaces
        // Vinculados / Produtos / Permissões do modal mostrem o catálogo
        // completo (com selecionados + disponíveis), não só os já vinculados.
        // Bug histórico: passava apenas u.vinculos_workspace → modal exibia
        // workspace inexistente "ABC IMPORTADOR" usando id_usuario_workspace
        // como id_workspace, quebrando o lookup de produtos contratados.
        void carregarWorkspacesOrg(u.id_organizacao)
      },
    },
  ]

  // ─── Exportação ─────────────────────────────────────────────────────────────
  const ACOES_EXPORT = getAcoesExportacaoPadrao<UsuarioGlobalUI>(
    COLUNAS,
    'usuarios',
    'Usuários Globais da Plataforma',
  )

  // ─── Stats ──────────────────────────────────────────────────────────────────
  const totalUsuarios    = usuarios.length
  const ativos        = usuarios.filter(u => u.status === 'Ativo').length
  const inativos      = usuarios.filter(u => u.status === 'Inativo').length
  const orgsAtivas    = new Set(usuarios.map(u => u.nome_organizacao)).size

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
            valor={totalUsuarios}
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
                <div className="cg-tooltip__row"><span>{t('admin.usuarios-globais.card_total_tooltip_total')}</span><strong>{totalUsuarios}</strong></div>
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
                <div className="cg-tooltip__row"><span>{t('admin.usuarios-globais.card_orgs_tooltip_total_usuarios')}</span><strong>{totalUsuarios}</strong></div>
              </>
            }
          />
        </>
      }
    >
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
        <BotaoNovoAdminGlobal
          rotulo={t('admin.usuarios-globais.btn_convidar')}
          onClick={() => setShowForm(true)}
          ativo={showForm}
        />
      </div>

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
            dados={usuarios}
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
                // Lazy-load workspaces da org alvo (paridade com Configurador
                // workspace/Usuarios.tsx que lista todos os ws como chips abaixo
                // do banner). Decisão dono 2026-05-13.
                if (!workspacesPorOrg[user.id_organizacao] && !carregandoWsOrg.has(user.id_organizacao)) {
                  void carregarWorkspacesOrg(user.id_organizacao)
                }
                const carregando = carregandoWsOrg.has(user.id_organizacao)
                // Backend /admin/organizacoes/:id/workspaces ja retorna so ATIVO
                // (admin.ts:398 — `where: { id_organizacao, status_workspace: 'ATIVO' }`).
                const wsDaOrg = workspacesPorOrg[user.id_organizacao] ?? []
                return (
                  <div style={{ padding: '0 1.25rem 1.25rem 1.25rem', background: 'rgba(0,0,0,0.15)' }}>
                    <div style={{ padding: '1rem', borderTop: '1px solid rgba(129,140,248,0.1)', display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--ws-muted)', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      <ShieldCheck size={14} weight="duotone" color="var(--color-primary)" /> Permissões de Acesso por Workspace
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
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
                            Acesso implícito a todos os workspaces ({wsDaOrg.length})
                          </p>
                          <p style={{ margin: '0.25rem 0 0', fontSize: '0.75rem', color: '#94a3b8', lineHeight: 1.5 }}>
                            Como <strong>{user.tipo}</strong>, <strong>{user.nome_usuario}</strong> tem acesso a todos os workspaces de <strong>{user.nome_organizacao}</strong> sem necessidade de vínculo individual. Para revogar, altere o tipo do usuário.
                          </p>
                        </div>
                      </div>

                      {/* Lista de chips dos workspaces (paridade Configurador) */}
                      {carregando ? (
                        <div style={{ padding: '1rem', textAlign: 'center', color: 'var(--ws-muted)', fontSize: '0.8125rem' }}>
                          Carregando workspaces de <strong>{user.nome_organizacao}</strong>…
                        </div>
                      ) : wsDaOrg.length > 0 ? (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem' }}>
                          {wsDaOrg.map((w) => (
                            <span
                              key={w.id_workspace}
                              style={{
                                padding: '0.25rem 0.625rem', borderRadius: '9999px',
                                background: 'rgba(129,140,248,0.08)', border: '1px solid rgba(129,140,248,0.2)',
                                color: '#c7d2fe', fontSize: '0.75rem', fontWeight: 500,
                                display: 'inline-flex', alignItems: 'center', gap: '0.375rem',
                              }}
                            >
                              <Buildings size={12} weight="duotone" /> {w.nome_workspace}
                            </span>
                          ))}
                        </div>
                      ) : null}
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
          // Campo só consultado/modificado pela tela de workspace; no admin
          // global default false (não muda o comportamento do modal).
          acesso_workspaces_futuros: false,
          data_criacao_usuario: new Date().toISOString(),
          usuario_workspaces:   usuarioEditando.vinculos_workspace.map(v => {
            const tipoEnum = nivelToRole(v.perfil as NivelAcesso)
            // Vínculo na filial só admite MASTER/PADRAO/FORNECEDOR (Admin/SUPER_ADMIN não vinculam por filial).
            const tipoVinculo: 'MASTER' | 'PADRAO' | 'FORNECEDOR' =
              tipoEnum === 'MASTER' || tipoEnum === 'FORNECEDOR' ? tipoEnum : 'PADRAO'
            return {
              id_usuario_workspace:    v.id_usuario_workspace,
              id_workspace:            v.id_workspace, // FK correta — antes usava id_usuario_workspace (bug)
              tipo_usuario_workspace:  tipoVinculo,
              ativo_usuario_workspace: true,
            }
          }),
          status_usuario: usuarioEditando.status === 'Ativo' ? 'ATIVO'
            : usuarioEditando.status === 'Inativo' ? 'INATIVO' : 'CONVIDADO',
        } : null}
        abaInicial={abaEditando}
        // Mostra catálogo completo de workspaces da org do alvo (Admin global
        // pode ver/editar qualquer org). Lazy-load disparado no onClick da
        // ação de edição via carregarWorkspacesOrg(u.id_organizacao).
        workspaces={usuarioEditando ? (workspacesPorOrg[usuarioEditando.id_organizacao] ?? []) : []}
        workspacesSalvos={usuarioEditando?.vinculos_workspace.map(e => e.id_workspace) ?? []}
        carregandoWorkspaces={usuarioEditando ? carregandoWsOrg.has(usuarioEditando.id_organizacao) : false}
        tiposPermitidos={tiposPermitidosUI}
        somenteLeitura={podeEditarAlvo.somenteLeitura}
        aoFechar={() => setUsuarioEditando(null)}
        aoSalvar={async (uEditado, permissoesParaPersistir, workspaceIds) => {
          // Estado original para rollback em caso de erro (Mand. 08).
          const original = usuarios.find(u => u.id_usuario === uEditado.id_usuario) ?? null
          const tipoMudou = original !== null && nivelToRole(original.tipo) !== uEditado.tipo_usuario
          const ehVinculavel = uEditado.tipo_usuario === 'PADRAO' || uEditado.tipo_usuario === 'FORNECEDOR'

          // SUPER_ADMIN no Admin Panel persiste tipo + vínculos workspace +
          // permissões granulares — mesmo fluxo do Configurador (workspace/Usuarios.tsx
          // aoSalvar). Backend já suporta SAdmin cross-org em PUT /workspaces e
          // PUT /permissoes (usuario.ts:485, 1033). Decisão dono 2026-05-13 —
          // remove a restricão "apenas tipo" que existia antes.
          // ADMIN continua read-only (somenteLeitura=true via hook → Salvar oculto).
          try {
            // 1) Persiste tipo_usuario (PATCH /patente) — Regra ε: SUPER_ADMIN/ADMIN
            //    só via seed; defesa em profundidade antes do request.
            if (tipoMudou) {
              const novoTipo = uEditado.tipo_usuario
              if (novoTipo === 'SUPER_ADMIN' || novoTipo === 'ADMIN') {
                throw new Error(
                  'SUPER_ADMIN/ADMIN são tipos internos da Gravity e só podem ser atribuídos via seed do banco',
                )
              }
              await usuariosApi.alterarTipoUsuario(uEditado.id_usuario, novoTipo)
            }

            // 2) Persiste vínculos de workspace — só p/ PADRAO/FORNECEDOR (Mand. 04
            //    LIMBO: MASTER/SAdmin/ADMIN não passam por UsuarioWorkspace).
            if (ehVinculavel && workspaceIds.length > 0) {
              await usuariosApi.substituirWorkspaces(uEditado.id_usuario, workspaceIds)
            }

            // 3) Persiste permissões granulares — uma chamada por (workspace, produto)
            //    que mudou. Sequencial para preservar ordem de auditoria e
            //    mensagem de erro apontar exatamente qual item falhou (Mand. 08).
            for (const item of permissoesParaPersistir) {
              try {
                await usuariosApi.configurarPermissoes(uEditado.id_usuario, {
                  id_workspace: item.id_workspace,
                  id_produto_gravity: item.id_produto_gravity,
                  permissoes: item.permissoes,
                })
              } catch (errItem) {
                const baseMsg = errItem instanceof Error ? errItem.message : 'falha desconhecida'
                throw new Error(
                  `Permissões do produto ${item.id_produto_gravity} no workspace ${item.id_workspace}: ${baseMsg}`,
                )
              }
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
            // Mand. 08 — propaga mensagem real do backend (ULTIMO_MASTER_ORGANIZACAO,
            // EDICAO_PROPRIA_NAO_PERMITIDA, etc), sem mascarar com fallback genérico.
            if (original) {
              setUsuarios(prev => prev.map(u => u.id_usuario === uEditado.id_usuario ? original : u))
            }
            try { await loadUsers() } catch { /* refetch best-effort */ }
            addNotification({
              type: 'error',
              message: err instanceof Error ? err.message : t('admin.usuarios-globais.msg_erro_atualizar'),
            })
          }
        }}
      />

      {/* ModalPermissoesUsuario descontinuado em 2026-05-13. O ícone 🔑 agora
          abre o ModalEditarUsuario unificado já na aba "Permissões", em modo
          somenteLeitura para Master/SAdmin/Admin (Mand. 04 LIMBO). Paridade
          com Configurador workspace/Usuarios.tsx. */}

      {/* ── Modal Convidar Usuário ────────────────────────────────────────── */}
      {(() => {
        const tipoBackendForm = nivelToRole(fTipo)
        const exigeWorkspacesForm = tipoBackendForm === 'PADRAO' || tipoBackendForm === 'FORNECEDOR'
        const requisitosConviteAdmin: RequisitoSalvar[] = [
          { chave: 'fNome',  ok: !!fNome.trim(),  mensagem: 'Nome completo' },
          { chave: 'fEmail', ok: !!fEmail.trim(), mensagem: 'E-mail de acesso' },
          { chave: 'fOrg',   ok: !!fIdOrganizacaoAlvo, mensagem: 'Organização alvo' },
          {
            chave: 'fWorkspaces',
            ok: !exigeWorkspacesForm || fWorkspacesAlvo === 'all' || (Array.isArray(fWorkspacesAlvo) && fWorkspacesAlvo.length > 0),
            mensagem: 'Workspaces vinculados (Standard/Fornecedor)',
          },
        ]
        return (
      <ModalFormularioGlobal
        aberto={showForm}
        aoFechar={() => {
          setShowForm(false)
          setFNome(''); setFEmail(''); setFTipo('Standard')
          setFIdOrganizacaoAlvo(''); setFWorkspacesAlvo([])
        }}
        aoSalvar={aoConvidarUsuario}
        icone={<User size={20} weight="duotone" />}
        titulo={t('admin.usuarios-globais.btn_convidar')}
        subtitulo={t('admin.usuarios-globais.modal_convidar_subtitulo')}
        tamanho="md"
        altura="640px"
        dirty={!!(fNome || fEmail || fIdOrganizacaoAlvo)}
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

          {/* Organização ALVO — comportamento condicional (decisão dono 2026-05-12):
              - SUPER_ADMIN/ADMIN: só pode ser criado em org que hospeda colaboradores
                Gravity (regra do backend). Filtra orgs elegíveis. Se há só 1, esconde
                o select e auto-seleciona (esses tipos têm acesso global por Mand. 04
                — a org é só um vínculo administrativo).
              - MASTER/PADRAO/FORNECEDOR: mostra todas as orgs ATIVAS. */}
          {(() => {
            const isGravityInterno = tipoBackendForm === 'SUPER_ADMIN' || tipoBackendForm === 'ADMIN'
            const orgsFiltradas = isGravityInterno
              ? orgsAdmin.filter(o => o.hospeda_colaboradores_gravity)
              : orgsAdmin

            // Auto-selecionar única opção (Admin/SAdmin geralmente só tem Gravity HQ)
            if (isGravityInterno && orgsFiltradas.length === 1 && fIdOrganizacaoAlvo !== orgsFiltradas[0].id_organizacao) {
              // Sincroniza no próximo tick (evita setState dentro do render)
              queueMicrotask(() => setFIdOrganizacaoAlvo(orgsFiltradas[0].id_organizacao))
            }
            // Limpa seleção se mudou tipo e a org atual não é mais elegível
            if (isGravityInterno && fIdOrganizacaoAlvo && !orgsFiltradas.find(o => o.id_organizacao === fIdOrganizacaoAlvo)) {
              queueMicrotask(() => setFIdOrganizacaoAlvo(''))
            }

            // Esconde o seletor quando há exatamente 1 org elegível p/ Admin/SAdmin
            const escondeSelect = isGravityInterno && orgsFiltradas.length === 1

            if (escondeSelect) {
              const orgEscolhida = orgsFiltradas[0]
              return (
                <CampoGeralGlobal
                  label={t('admin.usuarios-globais.tabela.organizacao')}
                  tooltipTitulo={t('admin.usuarios-globais.tabela.org_tooltip')}
                  tooltipDescricao="Admin/Super Admin têm acesso global — vinculado automaticamente à organização Gravity."
                >
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: '0.625rem',
                    padding: '0.75rem 1rem', borderRadius: 10,
                    background: 'rgba(34,197,94,0.06)',
                    border: '1px solid rgba(34,197,94,0.18)',
                    color: '#e2e8f0', fontSize: '0.8125rem',
                  }}>
                    <Buildings size={16} weight="duotone" color="#22c55e" />
                    <span style={{ fontWeight: 600 }}>{orgEscolhida.nome_organizacao}</span>
                    <span style={{ marginLeft: 'auto', fontSize: '0.6875rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      Acesso global (automático)
                    </span>
                  </div>
                </CampoGeralGlobal>
              )
            }

            return (
              <CampoGeralGlobal
                label={t('admin.usuarios-globais.tabela.organizacao')}
                obrigatorio
                tooltipTitulo={t('admin.usuarios-globais.tabela.org_tooltip')}
                tooltipDescricao={
                  isGravityInterno
                    ? 'SUPER_ADMIN/ADMIN só podem ser criados em organizações que hospedam colaboradores Gravity.'
                    : t('admin.usuarios-globais.tabela.org_desc')
                }
              >
                <SelectGlobal
                  opcoes={orgsFiltradas.map(o => ({ valor: o.id_organizacao, rotulo: o.nome_organizacao }))}
                  valor={fIdOrganizacaoAlvo}
                  aoMudarValor={(v) => {
                    const novoId = String(v)
                    setFIdOrganizacaoAlvo(novoId)
                    // Reset workspaces ao trocar org (workspaces são por org)
                    setFWorkspacesAlvo([])
                    // Dispara lazy load reusando o cache compartilhado com o editor de vínculos
                    if (novoId) void carregarWorkspacesOrg(novoId)
                  }}
                  iconeEsquerda={<Buildings size={18} weight="duotone" />}
                  buscavel
                  placeholder={t('admin.usuarios-globais.form_org_placeholder')}
                />
              </CampoGeralGlobal>
            )
          })()}

          {/* Workspaces — só para PADRAO/FORNECEDOR (MASTER/SAdmin/Admin têm bypass).
              Lazy-load: lista aparece após seleção da org. Default = nenhum selecionado. */}
          {exigeWorkspacesForm && fIdOrganizacaoAlvo && (
            <CampoGeralGlobal
              label="Workspaces vinculados"
              obrigatorio
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {!workspacesPorOrg[fIdOrganizacaoAlvo] ? (
                  <div style={{ padding: '0.75rem', textAlign: 'center', color: '#94a3b8', fontSize: '0.8125rem' }}>
                    Carregando workspaces…
                  </div>
                ) : workspacesPorOrg[fIdOrganizacaoAlvo].filter(w => w.status_workspace === 'ATIVO').length === 0 ? (
                  <div style={{ padding: '0.75rem', textAlign: 'center', color: '#94a3b8', fontSize: '0.8125rem' }}>
                    Nenhum workspace ativo nesta organização.
                  </div>
                ) : (
                  <>
                    <label
                      style={{
                        display: 'flex', alignItems: 'center', gap: '0.625rem',
                        padding: '0.5rem 0.75rem', borderRadius: '6px',
                        background: fWorkspacesAlvo === 'all' ? 'rgba(129,140,248,0.12)' : 'rgba(255,255,255,0.02)',
                        border: '1px solid rgba(255,255,255,0.08)',
                        cursor: 'pointer',
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={fWorkspacesAlvo === 'all'}
                        onChange={(e) => setFWorkspacesAlvo(e.target.checked ? 'all' : [])}
                      />
                      <span style={{ fontSize: '0.8125rem', fontWeight: 600 }}>
                        Todos os workspaces ATIVOs (acesso a futuros também)
                      </span>
                    </label>
                    {fWorkspacesAlvo !== 'all' && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', paddingLeft: '0.5rem' }}>
                        {workspacesPorOrg[fIdOrganizacaoAlvo].filter(w => w.status_workspace === 'ATIVO').map(w => {
                          const checked = Array.isArray(fWorkspacesAlvo) && fWorkspacesAlvo.includes(w.id_workspace)
                          return (
                            <label
                              key={w.id_workspace}
                              style={{
                                display: 'flex', alignItems: 'center', gap: '0.5rem',
                                padding: '0.375rem 0.625rem', borderRadius: '4px',
                                background: checked ? 'rgba(34,197,94,0.08)' : 'transparent',
                                cursor: 'pointer',
                                fontSize: '0.8125rem',
                              }}
                            >
                              <input
                                type="checkbox"
                                checked={checked}
                                onChange={(e) => {
                                  setFWorkspacesAlvo(prev => {
                                    const atuais = Array.isArray(prev) ? prev : []
                                    if (e.target.checked) return [...atuais, w.id_workspace]
                                    return atuais.filter(id => id !== w.id_workspace)
                                  })
                                }}
                              />
                              <span>{w.nome_workspace}</span>
                            </label>
                          )
                        })}
                      </div>
                    )}
                  </>
                )}
              </div>
            </CampoGeralGlobal>
          )}

          <BannerRequisitosGlobal />
        </div>
        </BannerRequisitosContexto>
      </ModalFormularioGlobal>
        )
      })()}

    </PaginaGlobal>
  )
}
