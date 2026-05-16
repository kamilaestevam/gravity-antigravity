import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useUser } from '@clerk/clerk-react'
import { TooltipGlobal } from '@nucleo/tooltip-global'
import { Users, UserCircleCheck, PauseCircle, PlayCircle, PencilSimple, FileXls, FileCsv, FileText, FilePdf, Code, ChartPieSlice, Key, User, EnvelopeSimple, ShieldCheck, Crown, Buildings } from '@phosphor-icons/react'
import { BotaoGlobal } from '@nucleo/botao-global'
import { CabecalhoGlobal } from '@nucleo/cabecalho-global'
import { PaginaGlobal } from '@nucleo/pagina-global'
import { TabelaGlobal, type TabelaGlobalColuna, type TabelaGlobalAcao, type TabelaExportAcao } from '@nucleo/tabela-global'
import { CardBasicoGlobal, CardGraficoGlobal, type PeriodoTendencia } from '@nucleo/card-global'
import { ModalFormularioGlobal } from '@nucleo/modal-formulario-global'
import { CampoGeralGlobal } from '@nucleo/campo-geral-global'
import { SelectGlobal, type SelectOpcao } from '@nucleo/campo-select-global'
import {
  BannerRequisitosGlobal,
  BannerRequisitosContexto,
  type RequisitoSalvar,
} from '@nucleo/banner-requisitos-global'
import { exportarExcel, exportarCSV, exportarTXT, exportarXML, exportarJSON, exportarPDF, type ColunasExport } from '../../services/export-service'
import { useShellStore } from '@gravity/shell'
import { ModalEditarUsuario } from './ModalEditarUsuario'
import { type NivelAcesso, mapRole, nivelToRole } from '../../types/niveis-acesso'
import { extractCatchError } from '../../utils/extract-api-error'
import {
  usuariosApi,
  workspaceApi,
  type UsuarioListItem,
  type WorkspaceItem,
} from '../../services/api-client'
import { usePodeEditarUsuario, type TipoUsuarioBackend } from '../../hooks/use-pode-editar-usuario'
import { useCarregarTipoUsuario } from '../../hooks/use-carregar-tipo-usuario'
import { useAuth } from '@clerk/clerk-react'


// ─── Tipos ────────────────────────────────────────────────────────────────────
// Documentação central em src/types/niveis-acesso.ts.
//
// Naming DDD: estado guarda os campos canônicos do schema Prisma (id_usuario,
// nome_usuario, email_usuario, tipo_usuario). Label UI ("Master", "Standard"…)
// só é calculada no render via mapRole(). Status do usuário é UI-only — não
// existe coluna correspondente no schema.prisma (Mand. 02 não permite criar).

/**
 * Status do usuário (3 valores reais — alinhado com decisão 2026-05-12):
 * - 'ATIVO': valor persistido em `Usuario.status_usuario` (enum no banco).
 * - 'INATIVO': valor persistido — admin/master desativou. requireAuth bloqueia
 *   login com 401 USUARIO_INATIVO.
 * - 'CONVIDADO': derivado em runtime pelo backend de `id_clerk_usuario.
 *   startsWith('pending_')`. Não persistido para evitar duplicar fonte da
 *   verdade do Clerk no fluxo de invite.
 *
 * Persistência via PATCH /api/v1/usuarios/:id/status (apenas ATIVO/INATIVO).
 * CONVIDADO transita pra ATIVO automaticamente quando Clerk completa cadastro.
 */
export type StatusUsuarioUI = UsuarioListItem['status_usuario']

// Alias mantido pra retrocompatibilidade dos consumidores. Schema Zod do
// api-client já retorna 'ATIVO' | 'INATIVO' | 'CONVIDADO' (validado bilateralmente).
export type UsuarioOrg = UsuarioListItem

// Tipo restrito para o convite/edição — backend só aceita esse subset.
export type TipoUsuarioConvidavel = 'MASTER' | 'PADRAO' | 'FORNECEDOR'

// Mandamento 04 — LIMBO: MASTER, SUPER_ADMIN e ADMIN têm acesso implícito a TODOS
// os workspaces da organização, independentemente de vínculo formal em UsuarioWorkspace.
function temAcessoTotalAosWorkspaces(tipo_usuario: string): boolean {
  return tipo_usuario === 'MASTER' || tipo_usuario === 'SUPER_ADMIN' || tipo_usuario === 'ADMIN'
}

// Tipos do modo edição em lote vivem em `src/components/expandido-editor-vinculos`
// (compartilhados com UsuariosAdmin). Padrão Assinaturas — cânone documentado em
// skills/ux/criacao-telas/SKILL.md.
import {
  ExpandidoEditorVinculos,
  type EdicoesPorUsuario,
} from '../../components/expandido-editor-vinculos'

// ─── Botão de ação condicional ───────────────────────────────────────────────
// Hook usePodeEditarUsuario precisa rodar por linha — sub-componente respeita
// regras dos hooks (top level). Retorna `null` quando o ator não pode editar
// (defesa em profundidade — backend ainda valida).
interface BotaoAcaoUsuarioProps {
  alvo: UsuarioOrg
  /** id_usuario do ator logado — usado para anti-escalada (não editar a si mesmo). */
  idUsuarioAtor: string | null
  icone: React.ReactNode
  tooltip: string
  onClick: (u: UsuarioOrg) => void
}

function BotaoAcaoUsuario({ alvo, idUsuarioAtor, icone, tooltip, onClick }: BotaoAcaoUsuarioProps) {
  // Workspace lista usuários da MESMA org do ator (filtro id_organizacao no findMany).
  // Logo todos os alvos têm a mesma flag da org. Lemos do /me via useCarregarTipoUsuario
  // (regra condicional 2026-05-11 — usePodeEditarUsuario exige o campo).
  const { hospedaColaboradoresGravity } = useCarregarTipoUsuario()
  const gating = usePodeEditarUsuario({
    id_usuario: alvo.id_usuario,
    tipo_usuario: alvo.tipo_usuario as TipoUsuarioBackend,
    organizacao_hospeda_colaboradores_gravity: hospedaColaboradoresGravity,
  })
  // Anti-escalada por id_usuario — hook só compara por tipo_usuario.
  // Em modo somenteLeitura, permite ver a si mesmo (sem risco de auto-edição —
  // footer sem Salvar). Decisão dono 2026-05-13 — paridade com Admin que
  // sempre mostra o lápis. ehProprio só bloqueia em modo editável.
  const ehProprio = idUsuarioAtor !== null && idUsuarioAtor === alvo.id_usuario
  if (!gating.podeEditar) return null
  if (ehProprio && !gating.somenteLeitura) return null

  return (
    <TooltipGlobal descricao={tooltip}>
      <button
        type="button"
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); onClick(alvo) }}
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 28, height: 28, borderRadius: '50%', background: 'transparent', border: '1px solid transparent', color: '#64748b', cursor: 'pointer', transition: 'all 0.15s', flexShrink: 0 }}
        onMouseEnter={(ev) => { ev.currentTarget.style.background = 'rgba(129,140,248,0.12)'; ev.currentTarget.style.borderColor = 'rgba(129,140,248,0.3)'; ev.currentTarget.style.color = '#818cf8' }}
        onMouseLeave={(ev) => { ev.currentTarget.style.background = 'transparent'; ev.currentTarget.style.borderColor = 'transparent'; ev.currentTarget.style.color = '#64748b' }}
      >
        {icone}
      </button>
    </TooltipGlobal>
  )
}

// ── Chips de workspaces vinculados com overflow via TooltipGlobal ─────────────
function WorkspacesAcessoCell({ workspaces, master }: { workspaces: WorkspaceItem[]; master: boolean }) {
  const MAX = 2

  if (master) {
    return (
      <span style={{
        display: 'inline-flex', alignItems: 'center', gap: '0.25rem',
        padding: '0.2rem 0.625rem', borderRadius: '9999px',
        background: 'rgba(129,140,248,0.1)', color: '#818cf8',
        fontSize: '0.75rem', fontWeight: 600, fontStyle: 'italic',
        border: '1px solid rgba(129,140,248,0.2)',
      }}>
        ✶ Todos os workspaces
      </span>
    )
  }

  if (workspaces.length === 0) {
    return <span style={{ color: 'var(--ws-muted)', fontSize: '0.8125rem' }}>Nenhum</span>
  }

  const visible = workspaces.slice(0, MAX)
  const rest    = workspaces.slice(MAX)

  // Wrapper inline-flex (não block) para que `text-align: center` da célula
  // <td> centralize o conjunto de chips. flexWrap continua funcionando em
  // inline-flex; maxWidth evita overflow quando há muitos chips na linha.
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem', flexWrap: 'wrap', maxWidth: '100%' }}>
      {visible.map(w => (
        <span key={w.id_workspace} style={{
          padding: '0.15rem 0.5rem', borderRadius: '9999px',
          background: 'var(--ws-surface)', border: '1px solid var(--ws-accent-border)',
          color: 'var(--ws-text)', fontSize: '0.75rem', fontWeight: 500, whiteSpace: 'nowrap',
        }}>
          {w.nome_workspace}
        </span>
      ))}
      {rest.length > 0 && (
        <TooltipGlobal
          titulo={`+${rest.length} workspace${rest.length > 1 ? 's' : ''}`}
          descricao={rest.map(w => w.nome_workspace).join(' · ')}
        >
          <span style={{
            padding: '0.15rem 0.5rem', borderRadius: '9999px',
            background: 'rgba(129,140,248,0.1)', border: '1px solid rgba(129,140,248,0.25)',
            color: '#818cf8', fontSize: '0.75rem', fontWeight: 700,
            cursor: 'default', lineHeight: 1.4,
          }}>
            +{rest.length}
          </span>
        </TooltipGlobal>
      )}
    </span>
  )
}

// ── Wrapper Configurador-específico: aplica gating via usePodeEditarUsuario ──
// O componente compartilhado `ExpandidoEditorVinculos` (em src/components/) é
// agnóstico de gating — espera `podeEditar: boolean` calculado pelo caller.
// Aqui, o gating é Mand. 08 (autorização barulhenta) + anti-self-edit.
//
// UsuariosAdmin tem seu próprio wrapper com gating diferente (opção α: SAdmin).
interface WrapperConfiguradorProps {
  usuario: UsuarioOrg
  idUsuarioAtor: string | null
  workspaces: WorkspaceItem[]
  vinculosServidor: string[]
  edicoesPendentes: EdicoesPorUsuario | undefined
  selecaoIds: string[]
  onSelecaoChange: (ids: string[]) => void
  onStagedToggle: (id_workspace: string) => void
  onAcaoEmMassa: (ids: string[], acao: 'habilitar' | 'bloquear') => void
  onDescartar: () => void
  onSalvar: () => void
  salvando: boolean
}

function ExpandidoEditorVinculosConfigurador(props: WrapperConfiguradorProps) {
  // Mesma justificativa do BotaoAcaoUsuario — flag da org via /me.
  const { hospedaColaboradoresGravity } = useCarregarTipoUsuario()
  const gating = usePodeEditarUsuario({
    id_usuario: props.usuario.id_usuario,
    tipo_usuario: props.usuario.tipo_usuario as TipoUsuarioBackend,
    organizacao_hospeda_colaboradores_gravity: hospedaColaboradoresGravity,
  })
  const ehProprio = props.idUsuarioAtor !== null && props.idUsuarioAtor === props.usuario.id_usuario
  const podeEditar = gating.podeAlterarVinculosWorkspace && !ehProprio

  return (
    <ExpandidoEditorVinculos
      usuario={{ id_usuario: props.usuario.id_usuario, nome_usuario: props.usuario.nome_usuario }}
      podeEditar={podeEditar}
      workspaces={props.workspaces}
      vinculosServidor={props.vinculosServidor}
      edicoesPendentes={props.edicoesPendentes}
      selecaoIds={props.selecaoIds}
      onSelecaoChange={props.onSelecaoChange}
      onStagedToggle={props.onStagedToggle}
      onAcaoEmMassa={props.onAcaoEmMassa}
      onDescartar={props.onDescartar}
      onSalvar={props.onSalvar}
      salvando={props.salvando}
    />
  )
}

const OPCOES_TIPO: SelectOpcao[] = [
  { 
    valor: 'Standard',   
    rotulo: 'Standard',   
    descricao: 'Acesso configurado por permissões de trabalho',
    meta: { icone: <User size={16} weight="duotone" color="#94a3b8" /> }
  },
  { 
    valor: 'Master',     
    rotulo: 'Master',     
    descricao: 'Acesso total na organização e em todos os workspaces',
    meta: { icone: <Crown size={16} weight="duotone" color="#818cf8" /> }
  },
  { 
    valor: 'Fornecedor', 
    rotulo: 'Fornecedor', 
    descricao: 'Acesso externo granular para parceiros',
    meta: { icone: <Buildings size={16} weight="duotone" color="#fbbf24" /> }
  },
]

export function Usuarios() {
  const { t } = useTranslation()
  const { isLoaded: userLoaded, user: clerkUser } = useUser()
  const addNotification = useShellStore((s) => s.addNotification)
  const idWorkspaceAtivo = useShellStore((s: { idWorkspaceAtivo: string | null }) => s.idWorkspaceAtivo)
  const [usuarios, setUsuarios] = useState<UsuarioOrg[]>([])
  const [workspaces, setWorkspaces] = useState<WorkspaceItem[]>([])
  // Vínculos ativos: id_usuario → id_workspace[] (derivado da relation usuario_workspaces)
  const [vinculosMap, setVinculosMap] = useState<Record<string, string[]>>({})
  const [carregando, setCarregando] = useState(true)

  // ── Modo edição em lote dos workspaces vinculados ───────────────────────
  // Padrão de sistema (decisão dono 2026-05-05): cliques na sub-tabela do
  // expandido (toggle play/pause) não disparam HTTP imediatamente. Vão para
  // este rascunho; o usuário aplica tudo via "Salvar alterações" no toolbar.
  // Cânone documentado em skills/ux/criacao-telas — replicado de Assinaturas.tsx.
  const [edicoesPendentesPorUsuario, setEdicoesPendentesPorUsuario] = useState<Record<string, EdicoesPorUsuario>>({})
  const [salvandoEdicoes, setSalvandoEdicoes] = useState<Set<string>>(new Set())

  // Seleção por usuário — alimenta o toolbar de ações em massa.
  // Map id_usuario → id_workspace[]. Limpa após Salvar/Descartar.
  const [selecaoPorUsuario, setSelecaoPorUsuario] = useState<Record<string, string[]>>({})
  // id_usuario do ator (banco) — usado para gating anti-escalada por id (hook
  // checa por tipo). Resolvido via match clerkUser.id ↔ id_clerk_usuario carregado
  // pela rota /me; aqui derivamos do usuários carregados.
  const idUsuarioAtor =
    usuarios.find((u) => clerkUser?.primaryEmailAddress?.emailAddress === u.email_usuario)?.id_usuario ?? null

  async function recarregarUsuarios(): Promise<void> {
    const [usuariosResp, workspacesResp] = await Promise.all([
      usuariosApi.listar(),
      workspaceApi.getWorkspaces(),
    ])
    // status_usuario vem do backend derivado de id_clerk_usuario.
    // Spread preserva o campo — sem hardcode 'ATIVO' como existia antes (bug
    // que mascarava CONVIDADO até o usuário aceitar o convite Clerk).
    const usuariosUI: UsuarioOrg[] = usuariosResp.usuarios.map((u) => ({ ...u }))
    setUsuarios(usuariosUI)
    const mapa: Record<string, string[]> = {}
    for (const u of usuariosResp.usuarios) {
      const ativos = u.usuario_workspaces
        .filter((uw) => uw.ativo_usuario_workspace)
        .map((uw) => uw.id_workspace)
      if (ativos.length > 0) mapa[u.id_usuario] = ativos
    }
    setVinculosMap(mapa)
    // Ordem alfabética por nome (paridade UX com Admin) — backend não garante.
    setWorkspaces(
      [...workspacesResp.workspaces].sort((a, b) =>
        a.nome_workspace.localeCompare(b.nome_workspace, 'pt-BR', { sensitivity: 'base' }),
      ),
    )
  }

  // Carregar usuários e workspaces da API real
  useEffect(() => {
    if (!userLoaded) return
    async function fetchData() {
      try {
        setCarregando(true)
        await recarregarUsuarios()
      } catch (err) {
        console.error('Erro ao carregar usuários:', err)
        addNotification({
          type: 'error',
          message: extractCatchError(err, 'Falha ao carregar usuários e workspaces.'),
        })
      } finally {
        setCarregando(false)
      }
    }
    fetchData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userLoaded])

  const [showForm, setShowForm] = useState(false)
  const [fNome, setFNome]       = useState('')
  const [fEmail, setFEmail]     = useState('')
  const [fTipo, setFTipo]       = useState<NivelAcesso>('Standard')
  const [fTodosWorkspaces, setFTodosWorkspaces] = useState(true)
  const [fWorkspacesSelecionados, setFWorkspacesSelecionados] = useState<string[]>([])

  const [usuarioEditando, setUsuarioEditando] = useState<UsuarioOrg | null>(null)
  const [abaEditando, setAbaEditando] = useState<string>('dados')

  // Whitelist de tipos que o ator atual pode atribuir ao usuário em edição.
  // Hook chamado incondicionalmente; quando usuarioEditando=null, retorna lista
  // vazia. Convertemos enum (BackendUserRole) → label UI (NivelAcesso) para o modal.
  // Flag da org vem do /me — todos os usuários listados são da mesma org do ator.
  const { hospedaColaboradoresGravity } = useCarregarTipoUsuario()
  const gatingEdicao = usePodeEditarUsuario(
    usuarioEditando
      ? {
          id_usuario: usuarioEditando.id_usuario,
          tipo_usuario: usuarioEditando.tipo_usuario as TipoUsuarioBackend,
          organizacao_hospeda_colaboradores_gravity: hospedaColaboradoresGravity,
        }
      : null,
  )
  const tiposPermitidosUI: NivelAcesso[] = gatingEdicao.tiposPermitidosParaPatente.map(mapRole)

  async function handleInvite() {
    if (!fNome.trim() || !fEmail.trim()) return
    try {
      // Map UI label → enum canônico do backend (PADRAO/MASTER/FORNECEDOR).
      // Super Admin/Admin não convidam por aqui — caem para PADRAO defensivamente.
      const tipoBackend = nivelToRole(fTipo)
      const tipoConvite: TipoUsuarioConvidavel =
        tipoBackend === 'MASTER' || tipoBackend === 'FORNECEDOR' ? tipoBackend : 'PADRAO'

      const workspacesAlvo: 'all' | string[] | undefined =
        tipoConvite === 'PADRAO' || tipoConvite === 'FORNECEDOR'
          ? (fTodosWorkspaces ? 'all' : fWorkspacesSelecionados)
          : undefined

      const { usuario: criado } = await usuariosApi.convidar({
        email_usuario: fEmail.trim(),
        nome_usuario: fNome.trim(),
        tipo_usuario: tipoConvite,
        workspaces_alvo: workspacesAlvo,
      })

      const novoUsuario: UsuarioOrg = {
        id_usuario: criado.id_usuario,
        nome_usuario: fNome.trim(),
        email_usuario: criado.email_usuario,
        tipo_usuario: criado.tipo_usuario,
        acesso_workspaces_futuros: criado.acesso_workspaces_futuros,
        data_criacao_usuario: new Date().toISOString(),
        usuario_workspaces: [],
        // Recém-convidado — sempre CONVIDADO até webhook/login fazer transição
        // para ATIVO via requireAuth.ts fallback (Clerk getUser por email).
        status_usuario: 'CONVIDADO',
      }

      if (tipoConvite === 'PADRAO' || tipoConvite === 'FORNECEDOR') {
        const ids = fTodosWorkspaces
          ? workspaces.map((w) => w.id_workspace)
          : fWorkspacesSelecionados
        setVinculosMap((prev) => ({ ...prev, [criado.id_usuario]: ids }))
      }

      setUsuarios((prev) => [...prev, novoUsuario])
      addNotification({
        type: 'success',
        message: `Usuário "${fNome.trim()}" convidado com sucesso!`,
      })

      // Fase 03 — Standard/Fornecedor sempre nasce sem permissão granular
      // (least privilege, Mand. 08). Abre o modal de edição na aba Permissões
      // para o admin configurar agora; se ele cancelar, fica sem acesso a
      // produtos até alguém abrir o modal manualmente.
      // Master tem bypass por Mand. 04 — não há toggles para configurar.
      if (tipoConvite === 'PADRAO' || tipoConvite === 'FORNECEDOR') {
        setUsuarioEditando(novoUsuario)
        setAbaEditando('permissoes')
      }
    } catch (err) {
      addNotification({
        type: 'error',
        message: extractCatchError(err, 'Falha ao convidar usuário. Tente novamente.'),
      })
    }
    setFNome(''); setFEmail(''); setFTipo('Standard'); setFTodosWorkspaces(true); setFWorkspacesSelecionados([]); setShowForm(false)
  }

  async function handleAlternarStatusUsuario(u: UsuarioOrg) {
    // CONVIDADO não alterna — não faz sentido "desativar" quem nunca esteve
    // ativo. Para CONVIDADO, a ação correta é "Cancelar convite" (delete +
    // revoke Clerk).
    if (u.status_usuario === 'CONVIDADO') return

    const novoStatus = u.status_usuario === 'ATIVO' ? 'INATIVO' : 'ATIVO'
    try {
      const { usuario: atualizado } = await usuariosApi.atualizarStatus(
        u.id_usuario,
        novoStatus,
      )
      // Atualiza state local com valor persistido devolvido pelo backend (paridade).
      setUsuarios((prev) =>
        prev.map((x) =>
          x.id_usuario === u.id_usuario
            ? { ...x, status_usuario: atualizado.status_usuario }
            : x,
        ),
      )
      addNotification({
        type: 'success',
        message: novoStatus === 'INATIVO'
          ? `Usuário ${u.nome_usuario} desativado.`
          : `Usuário ${u.nome_usuario} reativado.`,
      })
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erro ao alterar status do usuário.'
      // Mensagens específicas pra Mand. 04 anti-bricking e auto-protecao —
      // backend retorna codes claros, frontend amplifica pra usuário não ficar cego.
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

  async function handleCancelarConvite(u: UsuarioOrg) {
    // Confirmação simples — pode ser substituída por ModalConfirmar futuro.
    if (!window.confirm(`Cancelar convite de ${u.email_usuario}? O usuário não receberá mais o e-mail.`)) return
    try {
      await usuariosApi.cancelarConvite(u.id_usuario)
      // Remove localmente — refetch também garante consistência
      setUsuarios((prev) => prev.filter((x) => x.id_usuario !== u.id_usuario))
      addNotification({
        type: 'success',
        message: `Convite de ${u.email_usuario} cancelado.`,
      })
      await recarregarUsuarios()
    } catch (err) {
      addNotification({
        type: 'error',
        message: err instanceof Error ? err.message : 'Falha ao cancelar convite.',
      })
    }
  }

  // ── Handlers do modo edição em lote (padrão Assinaturas) ──────────────────
  // Estado servidor de um vínculo: id_workspace presente em vinculosMap[id_usuario].
  // O `efetivoPorWorkspace` (servidor + pendência) vive na sub-component
  // ExpandidoEditorVinculos, que recebe `vinculosServidor` por props.
  function ativoServidorWorkspace(id_usuario: string, id_workspace: string): boolean {
    return (vinculosMap[id_usuario] ?? []).includes(id_workspace)
  }

  /** Stage: alterna o estado pendente "toggle" do workspace para um usuário.
   *  Se já tem toggle pendente, REMOVE a pendência (volta ao estado servidor).
   *  Senão, ADICIONA toggle pendente. Mesma semântica de Assinaturas. */
  function aoStagedToggleWorkspace(id_usuario: string, id_workspace: string) {
    const ativo_servidor = ativoServidorWorkspace(id_usuario, id_workspace)
    setEdicoesPendentesPorUsuario((prev) => {
      const cur = prev[id_usuario] ?? {}
      const existente = cur[id_workspace]
      const next: EdicoesPorUsuario = { ...cur }
      if (existente) {
        delete next[id_workspace]
      } else {
        next[id_workspace] = { tipo: 'toggle', ativo: !ativo_servidor }
      }
      const proximo = { ...prev }
      if (Object.keys(next).length === 0) delete proximo[id_usuario]
      else proximo[id_usuario] = next
      return proximo
    })
  }

  /** Stage em lote: aplica a mesma ação a todos os IDs selecionados.
   *  Stage inteligente — workspace já no estado-alvo limpa pendência prévia
   *  para que o contador "X alterações pendentes" reflita só mudanças reais. */
  function aoStagedAcaoEmMassa(
    id_usuario: string,
    ids_workspace: string[],
    acao: 'habilitar' | 'bloquear',
  ) {
    if (ids_workspace.length === 0) return
    const ativo_alvo = acao === 'habilitar'
    setEdicoesPendentesPorUsuario((prev) => {
      const cur = prev[id_usuario] ?? {}
      const next: EdicoesPorUsuario = { ...cur }
      for (const id_workspace of ids_workspace) {
        const ativo_servidor = ativoServidorWorkspace(id_usuario, id_workspace)
        if (ativo_servidor === ativo_alvo) {
          delete next[id_workspace]
          continue
        }
        next[id_workspace] = { tipo: 'toggle', ativo: ativo_alvo }
      }
      const proximo = { ...prev }
      if (Object.keys(next).length === 0) delete proximo[id_usuario]
      else proximo[id_usuario] = next
      return proximo
    })
  }

  function descartarEdicoesUsuario(id_usuario: string) {
    setEdicoesPendentesPorUsuario((prev) => {
      const proximo = { ...prev }
      delete proximo[id_usuario]
      return proximo
    })
    setSelecaoPorUsuario((prev) => {
      const proximo = { ...prev }
      delete proximo[id_usuario]
      return proximo
    })
  }

  /** Calcula a lista final de id_workspace vinculados depois de aplicar as
   *  pendências sobre o estado servidor. Replace-all atômico — Mand. 04 garante
   *  que MASTER/SAdmin/ADMIN não chegam aqui (gating UI + bloqueio backend). */
  function workspacesFinaisAposPendencias(id_usuario: string): string[] {
    const pendentes = edicoesPendentesPorUsuario[id_usuario] ?? {}
    const finais = new Set<string>(vinculosMap[id_usuario] ?? [])
    for (const [id_workspace, edicao] of Object.entries(pendentes)) {
      if (edicao.ativo) finais.add(id_workspace)
      else finais.delete(id_workspace)
    }
    return Array.from(finais)
  }

  async function salvarEdicoesUsuario(id_usuario: string, nome_usuario: string) {
    const pendentes = edicoesPendentesPorUsuario[id_usuario] ?? {}
    if (Object.keys(pendentes).length === 0) return

    setSalvandoEdicoes((prev) => new Set(prev).add(id_usuario))
    try {
      const finais = workspacesFinaisAposPendencias(id_usuario)
      await usuariosApi.substituirWorkspaces(id_usuario, finais)
      // Refetch antes de descartar pendências evita flicker do badge
      // HABILITADO/BLOQUEADO (mesma técnica documentada em Assinaturas).
      await recarregarUsuarios()
      descartarEdicoesUsuario(id_usuario)
      addNotification({
        type: 'success',
        message: `Acessos de "${nome_usuario}" atualizados.`,
      })
    } catch (err) {
      addNotification({
        type: 'error',
        message: extractCatchError(err, 'Erro ao salvar alterações.'),
      })
    } finally {
      setSalvandoEdicoes((prev) => {
        const next = new Set(prev)
        next.delete(id_usuario)
        return next
      })
    }
  }

  const COLUNAS: TabelaGlobalColuna<UsuarioOrg>[] = [
    {
      key: 'nome_usuario', label: t('workspace.users.tabela.usuario'), tipo: 'texto',
      tooltipTitulo: 'Usuário', tooltipDescricao: 'Nome completo e identificação visual do usuário',
      render: (_, item) => {
        const nivel = mapRole(item.tipo_usuario)
        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
            <div style={{
              width: 32, height: 32, minWidth: 32, borderRadius: '50%',
              background: nivel === 'Master' ? 'rgba(129,140,248,0.2)' : nivel === 'Admin' ? 'rgba(6,182,212,0.15)' : nivel === 'Fornecedor' ? 'rgba(245,158,11,0.15)' : 'rgba(255,255,255,0.07)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700,
              color: nivel === 'Master' ? '#818cf8' : nivel === 'Admin' ? '#06b6d4' : nivel === 'Fornecedor' ? '#fbbf24' : '#94a3b8',
            }}>
              {item.nome_usuario.split(' ').map((n) => n[0]).join('').slice(0, 2)}
            </div>
            <span style={{ fontWeight: 600 }}>{item.nome_usuario}</span>
          </div>
        )
      },
    },
    {
      key: 'email_usuario', label: t('workspace.users.tabela.email'), tipo: 'texto',
      tooltipTitulo: 'E-mail', tooltipDescricao: 'E-mail de acesso utilizado no login da plataforma',
      render: (v) => <span style={{ color: 'var(--ws-muted)' }}>{v as string}</span>,
    },
    {
      key: 'tipo_usuario', label: t('workspace.users.tabela.tipo'), tipo: 'texto',
      tooltipTitulo: 'Tipo', tooltipDescricao: 'Define as permissões base: Master, Standard ou Fornecedor',
      render: (v) => {
        const nivel = mapRole(v as string)
        return (
          <span style={{ padding: '0.2rem 0.6rem', borderRadius: '9999px', fontSize: '0.6875rem', fontWeight: 700, letterSpacing: '0.04em', ...(nivel === 'Master' ? { color: '#818cf8', background: 'rgba(129,140,248,0.1)' } : nivel === 'Admin' ? { color: '#06b6d4', background: 'rgba(6,182,212,0.1)' } : nivel === 'Fornecedor' ? { color: '#fbbf24', background: 'rgba(245,158,11,0.1)' } : { color: '#94a3b8', background: 'rgba(255,255,255,0.05)' }) }}>{nivel}</span>
        )
      },
    },
    {
      key: 'status_usuario', label: t('workspace.users.tabela.status'), tipo: 'texto',
      tooltipTitulo: 'Status', tooltipDescricao: 'Indica se o usuário pode acessar a plataforma',
      render: (v) => {
        // 3 estados — ATIVO/CONVIDADO vêm do backend (derivados), INATIVO é UI-only.
        const ESTILO_BADGE: Record<StatusUsuarioUI, { bg: string; fg: string; border: string; label: string }> = {
          ATIVO:     { bg: 'rgba(52,211,153,0.12)', fg: '#34d399', border: 'rgba(52,211,153,0.2)', label: t('comum.ativo') },
          CONVIDADO: { bg: 'rgba(251,191,36,0.12)', fg: '#fbbf24', border: 'rgba(251,191,36,0.2)', label: t('workspace.users.status.convidado') },
          INATIVO:   { bg: 'rgba(248,113,113,0.12)', fg: '#f87171', border: 'rgba(248,113,113,0.2)', label: t('comum.inativo') },
        }
        const e = ESTILO_BADGE[v as StatusUsuarioUI] ?? ESTILO_BADGE.INATIVO
        return (
          <span style={{ display: 'inline-flex', padding: '0.2rem 0.625rem', borderRadius: '9999px', fontSize: '0.6875rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', background: e.bg, color: e.fg, border: `1px solid ${e.border}` }}>{e.label}</span>
        )
      },
    },
    {
      key: 'id_usuario', label: t('workspace.users.tabela_acesso'), tipo: 'texto',
      tooltipTitulo: 'Workspaces vinculados', tooltipDescricao: 'Workspaces aos quais este usuário tem acesso liberado',
      render: (_, item) => {
        const acessoTotal = temAcessoTotalAosWorkspaces(item.tipo_usuario)
        const lista = acessoTotal ? workspaces : workspacesDoUsuario(item.id_usuario)
        return <WorkspacesAcessoCell workspaces={lista} master={acessoTotal} />
      },
    },
  ]

  // Ações da linha — `permissions` e `edit` usam gating via BotaoAcaoUsuario
  // (renderCustom retornando null quando ator não pode editar). `suspend`
  // segue como ação UI-only (status local).
  const ACOES: TabelaGlobalAcao<UsuarioOrg>[] = [
    {
      id: 'permissions',
      icone: <Key size={15} weight="bold" />,
      tooltip: 'Permissões do Usuário',
      onClick: (u) => { setUsuarioEditando(u); setAbaEditando('permissoes') },
      renderCustom: (item) => (
        <BotaoAcaoUsuario
          alvo={item}
          idUsuarioAtor={idUsuarioAtor}
          icone={<Key size={15} weight="bold" />}
          tooltip="Permissões do Usuário"
          onClick={(u) => { setUsuarioEditando(u); setAbaEditando('permissoes') }}
        />
      ),
    },
    {
      id: 'suspend',
      icone: <PauseCircle size={16} weight="bold" />, // Será atualizado condicionalmente
      tooltip: 'Desativar/Reativar',
      onClick: handleAlternarStatusUsuario,
      renderCustom: (item) => {
        const ativo = item.status_usuario === 'ATIVO'
        return (
          <TooltipGlobal descricao={ativo ? 'Suspender o acesso deste usuário' : 'Reativar o acesso deste usuário'}>
            <button
              type="button"
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleAlternarStatusUsuario(item) }}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 28, height: 28, borderRadius: '50%', background: 'transparent', border: '1px solid transparent', color: '#64748b', cursor: 'pointer', transition: 'all 0.15s', flexShrink: 0 }}
              onMouseEnter={(ev) => { ev.currentTarget.style.background = ativo ? 'rgba(251,191,36,0.12)' : 'rgba(52,211,153,0.12)'; ev.currentTarget.style.borderColor = ativo ? 'rgba(251,191,36,0.3)' : 'rgba(52,211,153,0.3)'; ev.currentTarget.style.color = ativo ? '#fbbf24' : '#34d399' }}
              onMouseLeave={(ev) => { ev.currentTarget.style.background = 'transparent'; ev.currentTarget.style.borderColor = 'transparent'; ev.currentTarget.style.color = '#64748b' }}
            >
              {ativo ? <PauseCircle size={16} weight="bold" /> : <PlayCircle size={16} weight="bold" />}
            </button>
          </TooltipGlobal>
        )
      },
    },
    {
      id: 'edit',
      icone: <PencilSimple size={15} weight="bold" />,
      tooltip: 'Editar',
      onClick: (u) => { setUsuarioEditando(u); setAbaEditando('dados') },
      renderCustom: (item) => (
        <BotaoAcaoUsuario
          alvo={item}
          idUsuarioAtor={idUsuarioAtor}
          icone={<PencilSimple size={15} weight="bold" />}
          tooltip="Editar"
          onClick={(u) => { setUsuarioEditando(u); setAbaEditando('dados') }}
        />
      ),
    }
  ]

  // Headers e valores humanos PT-BR para o arquivo exportado (consumo final é o
  // usuário) — mapeamos enum DDD → label canonical antes de serializar.
  const COLUNAS_EXPORT: ColunasExport[] = [
    { header: 'Nome do Usuário', key: 'nome_usuario'   },
    { header: 'E-mail',          key: 'email_usuario'  },
    { header: 'Tipo de Usuário', key: 'tipo_usuario'   },
    { header: 'Status',          key: 'status_usuario' },
  ]
  const OPCOES_EXPORT = { nomeArquivo: 'todos-os-usuarios', titulo: 'Todos os Usuários' }

  const formatarParaExport = (dados: UsuarioOrg[]): Record<string, unknown>[] =>
    dados.map((u) => ({
      nome_usuario: u.nome_usuario,
      email_usuario: u.email_usuario,
      tipo_usuario: mapRole(u.tipo_usuario),
      status_usuario: u.status_usuario === 'ATIVO' ? 'Ativo' : 'Inativo',
    }))

  const ACOES_EXPORT: TabelaExportAcao<UsuarioOrg>[] = [
    { label: 'Excel (.xlsx)', icone: <FileXls size={14} weight="bold" />, onClick: (dados) => void exportarExcel(formatarParaExport(dados as UsuarioOrg[]), COLUNAS_EXPORT, OPCOES_EXPORT) },
    { label: 'CSV', icone: <FileCsv size={14} weight="bold" />, onClick: (dados) => void exportarCSV(formatarParaExport(dados as UsuarioOrg[]), COLUNAS_EXPORT, OPCOES_EXPORT) },
    { label: 'TXT', icone: <FileText size={14} weight="bold" />, onClick: (dados) => void exportarTXT(formatarParaExport(dados as UsuarioOrg[]), COLUNAS_EXPORT, OPCOES_EXPORT) },
    { label: 'XML', icone: <Code size={14} weight="bold" />, onClick: (dados) => void exportarXML(formatarParaExport(dados as UsuarioOrg[]), COLUNAS_EXPORT, OPCOES_EXPORT) },
    { label: 'PDF', icone: <FilePdf size={14} weight="bold" />, onClick: (dados) => void exportarPDF(formatarParaExport(dados as UsuarioOrg[]), COLUNAS_EXPORT, OPCOES_EXPORT) },
    { label: 'JSON', icone: <Code size={14} weight="bold" />, onClick: (dados) => void exportarJSON(formatarParaExport(dados as UsuarioOrg[]), COLUNAS_EXPORT, OPCOES_EXPORT) },
  ]

  // Computa workspaces vinculados por usuário via vinculosMap derivado da API
  function workspacesDoUsuario(id_usuario: string): WorkspaceItem[] {
    const ids = vinculosMap[id_usuario] ?? []
    return workspaces.filter((w) => ids.includes(w.id_workspace))
  }

  const totalVinculos = usuarios.reduce(
    (acc, u) => acc + (temAcessoTotalAosWorkspaces(u.tipo_usuario) ? workspaces.length : (vinculosMap[u.id_usuario]?.length || 0)),
    0,
  )
  const mediaWorkspacesPorUsuario = usuarios.length ? (totalVinculos / usuarios.length).toFixed(1) : '0'
  const usuariosComAcesso = usuarios.filter((u) =>
    temAcessoTotalAosWorkspaces(u.tipo_usuario) ? workspaces.length > 0 : (vinculosMap[u.id_usuario]?.length || 0) > 0,
  ).length

  return (
    <PaginaGlobal
      className="ws-fade-up"
      layout="lista"
      cabecalho={
        <CabecalhoGlobal
          icone={<Users weight="duotone" size={22} />}
          titulo={t('workspace.users.titulo')}
          subtitulo={t('workspace.users.subtitulo')}
        />
      }
      stats={
        <>
          <CardBasicoGlobal
            titulo={t('workspace.users.total')}
            valor={usuarios.length}
            icone={<Users weight="duotone" size={18} />}
            periodos={[
              { periodo: '7d',  rotulo: '7 dias',  valor: '+2',  direcao: 'up',   descricao: 'vs semana anterior' },
              { periodo: '30d', rotulo: '30 dias', valor: '+5',  direcao: 'up',   descricao: 'vs mês anterior'    },
              { periodo: '6m',  rotulo: '6 meses', valor: '+18', direcao: 'up',   descricao: 'vs semestre anterior' },
              { periodo: '1a',  rotulo: '1 ano',   valor: '+32', direcao: 'up',   descricao: 'vs ano anterior'    },
            ] as PeriodoTendencia[]}
            tooltip={
              <>
                <p className="cg-tooltip__title">Visão Geral</p>
                <div className="cg-tooltip__row">
                  <span>Total de registros</span>
                  <strong>{usuarios.length}</strong>
                </div>
                <div className="cg-tooltip__row">
                  <span>Novos hoje</span>
                  <strong>0</strong>
                </div>
              </>
            }
          />
          <CardBasicoGlobal
            titulo={t('workspace.users.acessos_concedidos')}
            valor={totalVinculos}
            icone={<UserCircleCheck weight="duotone" size={18} />}
            variante="sucesso"
            subtexto="Total de ligações usuário-empresa"
            periodos={[
              { periodo: '7d',  rotulo: '7 dias',  valor: '+5',  direcao: 'up',   descricao: 'vs semana anterior' },
              { periodo: '30d', rotulo: '30 dias', valor: '+15', direcao: 'up',   descricao: 'vs mês anterior'    },
              { periodo: '6m',  rotulo: '6 meses', valor: '+45', direcao: 'up',   descricao: 'vs semestre anterior' },
              { periodo: '1a',  rotulo: '1 ano',   valor: '+82', direcao: 'up',   descricao: 'vs ano anterior'    },
            ] as PeriodoTendencia[]}
            tooltip={
              <>
                <p className="cg-tooltip__title">Vínculos de Acesso</p>
                <div className="cg-tooltip__row">
                  <span>Total de acessos</span>
                  <strong style={{ color: '#34d399' }}>{totalVinculos}</strong>
                </div>
              </>
            }
          />
          <CardBasicoGlobal
            titulo={t('workspace.users.media_acessos')}
            valor={mediaWorkspacesPorUsuario}
            icone={<ChartPieSlice weight="duotone" size={18} />}
            variante="padrao"
            subtexto="Workspaces por usuário ativo"
            periodos={[
              { periodo: '7d',  rotulo: '7 dias',  valor: '+0.1', direcao: 'up' },
              { periodo: '30d', rotulo: '30 dias', valor: '+0.3', direcao: 'up' },
              { periodo: '6m',  rotulo: '6 meses', valor: '+1.2', direcao: 'up' },
              { periodo: '1a',  rotulo: '1 ano',   valor: '+2.5', direcao: 'up' },
            ] as PeriodoTendencia[]}
            tooltip={
              <>
                <p className="cg-tooltip__title">Distribuição Média</p>
                <div className="cg-tooltip__row">
                  <span>Média geral</span>
                  <strong>{mediaWorkspacesPorUsuario} workspaces</strong>
                </div>
              </>
            }
          />
          <CardGraficoGlobal
            titulo={t('workspace.users.total_workspaces')}
            icone={<ChartPieSlice weight="duotone" size={16} style={{ color: '#8b5cf6' }} />}
            total={usuarios.length}
            valorPrincipal={usuariosComAcesso}
            corGauge="#8b5cf6"
            legenda={[
              { label: t('workspace.users.com_acesso'), valor: usuariosComAcesso, cor: '#8b5cf6' },
              { label: t('workspace.users.sem_acesso'), valor: usuarios.length - usuariosComAcesso, cor: '#64748b' },
            ]}
            tooltip={
              <>
                <p className="cg-tooltip__title">Densidade & Distribuição</p>
                <div className="cg-tooltip__row">
                  <span>Total de Usuários</span>
                  <strong>{usuarios.length}</strong>
                </div>
                <div className="cg-tooltip__row">
                  <span>Total de Workspaces</span>
                  <strong>{workspaces.length}</strong>
                </div>
                <div className="cg-tooltip__divider" />
                <div className="cg-tooltip__row">
                  <span>Vínculos Ativos</span>
                  <strong>{totalVinculos}</strong>
                </div>
                <div className="cg-tooltip__row">
                  <span>Média p/ Usuário</span>
                  <strong style={{ color: '#8b5cf6' }}>{mediaWorkspacesPorUsuario}</strong>
                </div>
              </>
            }
          />
        </>
      }
      toolbar={
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', width: '100%' }}>
          <TooltipGlobal descricao="Enviar convite para um novo colaborador acessar a plataforma">
            <BotaoGlobal
              variante="primario"
              onClick={() => setShowForm(true)}
              icone={<User size={18} />}
            >
              {t('workspace.users.botao_convidar')}
            </BotaoGlobal>
          </TooltipGlobal>
        </div>
      }
    >

      <div style={{ position: 'relative', zIndex: 10 }}>
        {carregando ? (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '3rem', color: 'var(--ws-muted)', fontSize: '0.875rem' }}>
            Carregando usuários...
          </div>
        ) : (
        <TabelaGlobal<UsuarioOrg>
          id="workspace-usuarios"
          idKey="id_usuario"
          dados={usuarios}
          colunas={COLUNAS}
          acoes={ACOES}
          acoesExportacao={ACOES_EXPORT}
          mensagemVazio="Nenhum usuário encontrado na busca."
          mensagemSemFiltro="Nenhum usuário cadastrado na sua conta corporativa."
          tooltipBusca="Localizar usuário por nome, e-mail ou tipo de acesso"
          tooltipExpandir="Ver workspaces vinculados ao usuário"
          tooltipRecolher="Recolher detalhes do usuário"
          renderExpandido={(usuario) => {
            const acessoTotal = temAcessoTotalAosWorkspaces(usuario.tipo_usuario)
            const nivelLabel = mapRole(usuario.tipo_usuario)

            // Branch 1 — Master/SAdmin/Admin: Mandamento 04 LIMBO. Acesso implícito,
            // sem vínculos formais para alternar. Panel informativo, read-only.
            if (acessoTotal) {
              return (
                <div style={{ padding: '0 1.5rem 1.5rem 1.5rem', background: 'rgba(0,0,0,0.15)' }}>
                  <div style={{ padding: '1.25rem 1rem 0.75rem 1rem', borderTop: '1px solid rgba(129,140,248,0.1)', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--ws-muted)', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    <ShieldCheck size={14} weight="duotone" color="var(--color-primary)" /> Permissões de Acesso por Workspace
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
                    <div
                      role="note"
                      aria-label={`Acesso implícito de ${nivelLabel}`}
                      style={{
                        padding: '0.875rem 1rem', borderRadius: '10px',
                        background: 'rgba(129,140,248,0.06)', border: '1px solid rgba(129,140,248,0.25)',
                        display: 'flex', alignItems: 'flex-start', gap: '0.75rem',
                      }}
                    >
                      <ShieldCheck size={18} weight="fill" style={{ color: '#818cf8', flexShrink: 0, marginTop: 2 }} />
                      <div>
                        <p style={{ margin: 0, fontSize: '0.8125rem', fontWeight: 700, color: '#c7d2fe' }}>
                          Acesso implícito a todos os workspaces ({workspaces.length})
                        </p>
                        <p style={{ margin: '0.25rem 0 0', fontSize: '0.75rem', color: '#94a3b8', lineHeight: 1.5 }}>
                          Como <strong>{nivelLabel}</strong>, <strong>{usuario.nome_usuario}</strong> tem acesso a todos os workspaces da organização sem necessidade de vínculo individual. Para revogar o acesso, altere o tipo do usuário.
                        </p>
                      </div>
                    </div>

                    {workspaces.length > 0 && (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem' }}>
                        {workspaces.map((w) => (
                          <a
                            key={w.id_workspace}
                            href={`/workspace/workspaces?id=${w.id_workspace}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(ev) => ev.stopPropagation()}
                            style={{
                              padding: '0.25rem 0.625rem', borderRadius: '9999px',
                              background: 'rgba(129,140,248,0.08)', border: '1px solid rgba(129,140,248,0.2)',
                              color: '#c7d2fe', fontSize: '0.75rem', fontWeight: 500,
                              textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.375rem',
                            }}
                          >
                            <Buildings size={12} weight="duotone" /> {w.nome_workspace}
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )
            }

            // Branch 2 — Standard/Fornecedor: padrão Assinaturas (cânone).
            // Editor com checkbox, multi-select, toolbar massa, Salvar/Descartar.
            return (
              <div style={{ padding: '0 1.5rem 1.5rem 1.5rem', background: 'rgba(0,0,0,0.15)' }}>
                <div style={{ paddingTop: '1rem' }}>
                  <ExpandidoEditorVinculosConfigurador
                    usuario={usuario}
                    idUsuarioAtor={idUsuarioAtor}
                    workspaces={workspaces}
                    vinculosServidor={vinculosMap[usuario.id_usuario] ?? []}
                    edicoesPendentes={edicoesPendentesPorUsuario[usuario.id_usuario]}
                    selecaoIds={selecaoPorUsuario[usuario.id_usuario] ?? []}
                    onSelecaoChange={(ids) =>
                      setSelecaoPorUsuario((prev) => ({ ...prev, [usuario.id_usuario]: ids }))
                    }
                    onStagedToggle={(id_workspace) =>
                      aoStagedToggleWorkspace(usuario.id_usuario, id_workspace)
                    }
                    onAcaoEmMassa={(ids, acao) =>
                      aoStagedAcaoEmMassa(usuario.id_usuario, ids, acao)
                    }
                    onDescartar={() => descartarEdicoesUsuario(usuario.id_usuario)}
                    onSalvar={() => void salvarEdicoesUsuario(usuario.id_usuario, usuario.nome_usuario)}
                    salvando={salvandoEdicoes.has(usuario.id_usuario)}
                  />
                </div>
              </div>
            )
          }}
        />
        )}
      </div>

      {/* Modal Convidar Usuário */}
      {(() => {
        const requisitosConvite: RequisitoSalvar[] = [
          { chave: 'fNome',  ok: fNome.trim().length > 0,  mensagem: 'Nome completo' },
          { chave: 'fEmail', ok: fEmail.trim().length > 0, mensagem: 'E-mail válido' },
        ]
        if (fTipo === 'Standard' || fTipo === 'Fornecedor') {
          requisitosConvite.push({
            chave: 'fWorkspaces',
            ok: fTodosWorkspaces || fWorkspacesSelecionados.length > 0,
            mensagem: 'Selecione "Todos os workspaces" ou pelo menos um workspace específico',
          })
        }
        return (
      <ModalFormularioGlobal
        aberto={showForm}
        aoFechar={() => { setShowForm(false); setFNome(''); setFEmail(''); setFTipo('Standard'); setFTodosWorkspaces(true); setFWorkspacesSelecionados([]) }}
        aoSalvar={handleInvite}
        icone={<User size={20} weight="duotone" />}
        titulo={t('workspace.users.modal_convidar_titulo')}
        subtitulo={t('workspace.users.modal_convidar_subtitulo')}
        tamanho="md"
        altura={(fTipo === 'Standard' || fTipo === 'Fornecedor') ? '600px' : '480px'}
        dirty={!!(fNome || fEmail)}
        podesSalvar={requisitosConvite.every(r => r.ok)}
      >
        <BannerRequisitosContexto requisitos={requisitosConvite}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <CampoGeralGlobal label="NOME COMPLETO" obrigatorio>
            <div className="ws-input-icon-wrap">
              <User size={16} />
              <input
                value={fNome}
                placeholder="Ex: Ana Paula"
                onChange={e => setFNome(e.target.value)}
                style={{ width: '100%' }}
              />
            </div>
          </CampoGeralGlobal>

          <CampoGeralGlobal label="E-MAIL" obrigatorio>
            <div className="ws-input-icon-wrap">
              <EnvelopeSimple size={16} />
              <input
                type="email"
                value={fEmail}
                placeholder="usuario@exemplo.com"
                onChange={e => setFEmail(e.target.value)}
                style={{ width: '100%' }}
              />
            </div>
          </CampoGeralGlobal>

          <CampoGeralGlobal label="TIPO DE USUÁRIO">
            <SelectGlobal
              opcoes={OPCOES_TIPO}
              valor={fTipo}
              aoMudarValor={(v) => { setFTipo(v as NivelAcesso); setFTodosWorkspaces(true); setFWorkspacesSelecionados([]) }}
              iconeEsquerda={<ShieldCheck size={18} weight="duotone" />}
              buscavel={false}
              placeholder="Selecione o perfil..."
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

          {(fTipo === 'Standard' || fTipo === 'Fornecedor') && (
            <CampoGeralGlobal label="WORKSPACES">
              <div
                role="checkbox"
                aria-checked={fTodosWorkspaces}
                tabIndex={0}
                onClick={() => { setFTodosWorkspaces(v => !v); setFWorkspacesSelecionados([]) }}
                onKeyDown={(e) => { if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); setFTodosWorkspaces(v => !v); setFWorkspacesSelecionados([]) } }}
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.625rem',
                  cursor: 'pointer', padding: '0.5rem 0.75rem', borderRadius: '8px',
                  background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)',
                  userSelect: 'none',
                }}
              >
                <div style={{
                  width: 18, height: 18, borderRadius: '4px', flexShrink: 0,
                  background: fTodosWorkspaces ? 'rgba(129,140,248,0.2)' : 'transparent',
                  border: `2px solid ${fTodosWorkspaces ? '#818cf8' : 'rgba(255,255,255,0.2)'}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'all 0.15s',
                }}>
                  {fTodosWorkspaces && <span style={{ color: '#818cf8', fontSize: '11px', lineHeight: 1, fontWeight: 700 }}>✓</span>}
                </div>
                <span style={{ fontSize: '0.875rem', color: fTodosWorkspaces ? 'var(--ws-text)' : 'var(--ws-muted)' }}>
                  Todos os workspaces (incluindo futuros)
                </span>
              </div>

              {!fTodosWorkspaces && (
                <div style={{
                  marginTop: '0.5rem', maxHeight: '160px', overflowY: 'auto',
                  display: 'flex', flexDirection: 'column', gap: '0.25rem',
                  border: '1px solid rgba(255,255,255,0.06)', borderRadius: '8px', padding: '0.375rem',
                }}>
                  {workspaces.length === 0 ? (
                    <span style={{ padding: '0.75rem', color: 'var(--ws-muted)', fontSize: '0.8125rem', textAlign: 'center' }}>
                      Nenhum workspace ativo encontrado.
                    </span>
                  ) : workspaces.map((w) => {
                    const selecionado = fWorkspacesSelecionados.includes(w.id_workspace)
                    return (
                      <div
                        key={w.id_workspace}
                        role="checkbox"
                        aria-checked={selecionado}
                        tabIndex={0}
                        onClick={() => setFWorkspacesSelecionados((prev) =>
                          selecionado ? prev.filter((id) => id !== w.id_workspace) : [...prev, w.id_workspace],
                        )}
                        onKeyDown={(ev) => { if (ev.key === ' ' || ev.key === 'Enter') { ev.preventDefault(); setFWorkspacesSelecionados((prev) => selecionado ? prev.filter((id) => id !== w.id_workspace) : [...prev, w.id_workspace]) } }}
                        style={{
                          display: 'flex', alignItems: 'center', gap: '0.625rem',
                          cursor: 'pointer', padding: '0.375rem 0.5rem', borderRadius: '6px',
                          background: selecionado ? 'rgba(129,140,248,0.08)' : 'transparent',
                          border: `1px solid ${selecionado ? 'rgba(129,140,248,0.2)' : 'transparent'}`,
                          transition: 'all 0.15s', userSelect: 'none',
                        }}
                      >
                        <div style={{
                          width: 16, height: 16, borderRadius: '3px', flexShrink: 0,
                          background: selecionado ? 'rgba(129,140,248,0.2)' : 'transparent',
                          border: `2px solid ${selecionado ? '#818cf8' : 'rgba(255,255,255,0.2)'}`,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          transition: 'all 0.15s',
                        }}>
                          {selecionado && <span style={{ color: '#818cf8', fontSize: '9px', lineHeight: 1, fontWeight: 700 }}>✓</span>}
                        </div>
                        <span style={{ fontSize: '0.8125rem', color: 'var(--ws-text)' }}>{w.nome_workspace}</span>
                      </div>
                    )
                  })}
                </div>
              )}
            </CampoGeralGlobal>
          )}

          <BannerRequisitosGlobal />
        </div>
        </BannerRequisitosContexto>
      </ModalFormularioGlobal>
        )
      })()}

      {/* Modal Edição do Usuário */}
      <ModalEditarUsuario
        usuario={usuarioEditando}
        abaInicial={abaEditando}
        workspaces={workspaces}
        workspacesSalvos={usuarioEditando ? (vinculosMap[usuarioEditando.id_usuario] ?? []) : []}
        idWorkspaceAtivo={idWorkspaceAtivo}
        carregandoWorkspaces={carregando}
        tiposPermitidos={tiposPermitidosUI}
        somenteLeitura={gatingEdicao.somenteLeitura}
        aoFechar={() => setUsuarioEditando(null)}
        aoSalvar={async (uEditado, permissoesParaPersistir, workspaceIds) => {
          // Estado original para rollback de UI em caso de erro
          const original = usuarios.find((u) => u.id_usuario === uEditado.id_usuario) ?? null
          const tipoMudou = original !== null && original.tipo_usuario !== uEditado.tipo_usuario
          const ehVinculavel = uEditado.tipo_usuario === 'PADRAO' || uEditado.tipo_usuario === 'FORNECEDOR'

          try {
            // 1. Persiste alteração de tipo_usuario (se mudou) — Mand. 08: falha em
            //    autorização não é silenciosa, lança erro com mensagem do backend.
            if (tipoMudou) {
              const novoTipoBackend = uEditado.tipo_usuario as 'MASTER' | 'PADRAO' | 'FORNECEDOR' | 'ADMIN' | 'SUPER_ADMIN'
              // Backend só aceita MASTER/PADRAO/FORNECEDOR via /patente vindo do
              // modal — SAdmin/Admin via tela admin global. Defesa em prof.
              if (novoTipoBackend === 'SUPER_ADMIN' || novoTipoBackend === 'ADMIN') {
                throw new Error('Tipo Super Admin/Admin só pode ser atribuído pelo painel global Gravity')
              }
              await usuariosApi.alterarTipoUsuario(uEditado.id_usuario, novoTipoBackend)
            }

            // 2. Persiste vínculos de workspace — só faz sentido para PADRAO/FORNECEDOR
            //    e quando há pelo menos um workspace selecionado (Zod min(1) no backend).
            if (ehVinculavel && workspaceIds.length > 0) {
              await usuariosApi.substituirWorkspaces(uEditado.id_usuario, workspaceIds)
            }

            // 3. Persiste permissões granulares — uma chamada por (workspace, produto)
            //    que mudou. O modal já fez o diff e resolveu id_produto_gravity.
            //    Sequencial para preservar ordem de auditoria e mensagem de erro
            //    apontar exatamente qual item falhou (Mand. 08).
            for (const item of permissoesParaPersistir) {
              try {
                await usuariosApi.configurarPermissoes(uEditado.id_usuario, {
                  id_workspace: item.id_workspace,
                  id_produto_gravity: item.id_produto_gravity,
                  permissoes: item.permissoes,
                })
              } catch (errItem) {
                // Mand. 08 — enriquece a mensagem com o (workspace, produto) que falhou.
                // Itens anteriores já foram persistidos: o catch externo dispara refetch
                // para sincronizar UI com estado real.
                const baseMsg = extractCatchError(errItem, 'falha desconhecida')
                throw new Error(
                  `Permissões do produto ${item.id_produto_gravity} no workspace ${item.id_workspace}: ${baseMsg}`,
                )
              }
            }

            // 4. Refetch — fonte da verdade é o servidor após qualquer mutação
            await recarregarUsuarios()

            addNotification({
              type: 'success',
              message: `Usuário "${uEditado.nome_usuario}" atualizado.`,
            })
            setUsuarioEditando(null)
          } catch (err) {
            // Rollback UI: restaura o usuário original no estado para refletir o
            // que está realmente persistido (modal permanece aberto para retry).
            if (original) {
              setUsuarios((prev) => prev.map((u) => u.id_usuario === uEditado.id_usuario ? original : u))
            }
            // Mand. 08 — refetch também no catch: itens anteriores do loop podem ter
            // sido persistidos antes da falha. Sem o refetch, a UI fica fora de sincronia
            // com o banco até o usuário recarregar a página.
            try {
              await recarregarUsuarios()
            } catch {
              // refetch é best-effort no catch — não mascara o erro original.
            }
            addNotification({
              type: 'error',
              message: extractCatchError(err, 'Falha ao salvar alterações do usuário.'),
            })
          }
        }}
      />
    </PaginaGlobal>
  )
}
