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
import { exportarExcel, exportarCSV, exportarTXT, exportarXML, exportarJSON, exportarPDF, type ColunasExport } from '../../services/exportService'
import { useShellStore } from '@gravity/shell'
import { ModalEditarUsuario } from './ModalEditarUsuario'
import { type NivelAcesso, mapRole, nivelToRole } from '../../types/niveis-acesso'
import { extractCatchError } from '../../utils/extractApiError'
import {
  usuariosApi,
  workspaceApi,
  type UsuarioListItem,
  type WorkspaceItem,
} from '../../services/apiClient'


// ─── Tipos ────────────────────────────────────────────────────────────────────
// Documentação central em src/types/niveis-acesso.ts.
//
// Naming DDD: estado guarda os campos canônicos do schema Prisma (id_usuario,
// nome_usuario, email_usuario, tipo_usuario). Label UI ("Master", "Standard"…)
// só é calculada no render via mapRole(). Status do usuário é UI-only — não
// existe coluna correspondente no schema.prisma (Mand. 02 não permite criar).

export type StatusUsuarioUI = 'ATIVO' | 'INATIVO'

export interface UsuarioOrg extends UsuarioListItem {
  status_usuario: StatusUsuarioUI
}

// Tipo restrito para o convite/edição — backend só aceita esse subset.
export type TipoUsuarioConvidavel = 'MASTER' | 'PADRAO' | 'FORNECEDOR'

// Mandamento 04 — LIMBO: MASTER, SUPER_ADMIN e ADMIN têm acesso implícito a TODOS
// os workspaces da organização, independentemente de vínculo formal em UsuarioWorkspace.
function temAcessoTotalAosWorkspaces(tipo_usuario: string): boolean {
  return tipo_usuario === 'MASTER' || tipo_usuario === 'SUPER_ADMIN' || tipo_usuario === 'ADMIN'
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

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', flexWrap: 'wrap' }}>
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
    </div>
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
  const { isLoaded: userLoaded } = useUser()
  const addNotification = useShellStore((s) => s.addNotification)
  const [usuarios, setUsuarios] = useState<UsuarioOrg[]>([])
  const [workspaces, setWorkspaces] = useState<WorkspaceItem[]>([])
  // Vínculos ativos: id_usuario → id_workspace[] (derivado da relation usuario_workspaces)
  const [vinculosMap, setVinculosMap] = useState<Record<string, string[]>>({})
  const [carregando, setCarregando] = useState(true)

  // Carregar usuários e workspaces da API real
  useEffect(() => {
    if (!userLoaded) return
    async function fetchData() {
      try {
        setCarregando(true)

        const [usuariosResp, workspacesResp] = await Promise.all([
          usuariosApi.listar(),
          workspaceApi.getWorkspaces(),
        ])

        // Status do usuário é UI-only — placeholder até o schema persistir.
        const usuariosUI: UsuarioOrg[] = usuariosResp.usuarios.map((u) => ({
          ...u,
          status_usuario: 'ATIVO',
        }))
        setUsuarios(usuariosUI)

        // Mapa de vínculos ativos: id_usuario → id_workspace[]
        const mapa: Record<string, string[]> = {}
        for (const u of usuariosResp.usuarios) {
          const ativos = u.usuario_workspaces
            .filter((uw) => uw.ativo_usuario_workspace)
            .map((uw) => uw.id_workspace)
          if (ativos.length > 0) mapa[u.id_usuario] = ativos
        }
        setVinculosMap(mapa)

        setWorkspaces(workspacesResp.workspaces)
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
  }, [userLoaded, addNotification])

  const [showForm, setShowForm] = useState(false)
  const [fNome, setFNome]       = useState('')
  const [fEmail, setFEmail]     = useState('')
  const [fTipo, setFTipo]       = useState<NivelAcesso>('Standard')
  const [fTodosWorkspaces, setFTodosWorkspaces] = useState(true)
  const [fWorkspacesSelecionados, setFWorkspacesSelecionados] = useState<string[]>([])

  const [usuarioEditando, setUsuarioEditando] = useState<UsuarioOrg | null>(null)
  const [abaEditando, setAbaEditando] = useState<string>('dados')

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
        data_criacao_usuario: new Date().toISOString(),
        usuario_workspaces: [],
        status_usuario: 'ATIVO',
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
    } catch (err) {
      addNotification({
        type: 'error',
        message: extractCatchError(err, 'Falha ao convidar usuário. Tente novamente.'),
      })
    }
    setFNome(''); setFEmail(''); setFTipo('Standard'); setFTodosWorkspaces(true); setFWorkspacesSelecionados([]); setShowForm(false)
  }

  function handleAlternarStatusUsuario(u: UsuarioOrg) {
    // Status é UI-only (sem persistência) — alterna localmente.
    setUsuarios((prev) =>
      prev.map((x) =>
        x.id_usuario === u.id_usuario
          ? { ...x, status_usuario: x.status_usuario === 'ATIVO' ? 'INATIVO' : 'ATIVO' }
          : x,
      ),
    )
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
        const ativo = v === 'ATIVO'
        return (
          <span style={{ display: 'inline-flex', padding: '0.2rem 0.625rem', borderRadius: '9999px', fontSize: '0.6875rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', background: ativo ? 'rgba(52,211,153,0.12)' : 'rgba(248,113,113,0.12)', color: ativo ? '#34d399' : '#f87171', border: `1px solid ${ativo ? 'rgba(52,211,153,0.2)' : 'rgba(248,113,113,0.2)'}` }}>{ativo ? 'Ativo' : 'Inativo'}</span>
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

  const ACOES: TabelaGlobalAcao<UsuarioOrg>[] = [
    {
      id: 'permissions',
      icone: <Key size={15} weight="bold" />,
      tooltip: 'Permissões do Usuário',
      onClick: (u) => { setUsuarioEditando(u); setAbaEditando('permissoes') },
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
            const vinculados = acessoTotal ? workspaces : workspacesDoUsuario(usuario.id_usuario)
            const nivelLabel = mapRole(usuario.tipo_usuario)
            return (
              <div style={{ padding: '0 1.5rem 1.5rem 1.5rem', background: 'rgba(0,0,0,0.15)' }}>
                <div style={{ padding: '1.25rem 1rem 0.75rem 1rem', borderTop: '1px solid rgba(129,140,248,0.1)', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--ws-muted)', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  <ShieldCheck size={14} weight="duotone" color="var(--color-primary)" /> Permissões de Acesso por Workspace
                </div>

                {acessoTotal ? (
                  // Acesso implícito (Master/Super Admin/Admin) — Mandamento 04 LIMBO.
                  // Não há vínculos formais para alternar; mostramos apenas a lista
                  // informativa, sem checkbox e sem coluna "Acesso" ambígua.
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
                          Acesso implícito a todos os workspaces ({vinculados.length})
                        </p>
                        <p style={{ margin: '0.25rem 0 0', fontSize: '0.75rem', color: '#94a3b8', lineHeight: 1.5 }}>
                          Como <strong>{nivelLabel}</strong>, <strong>{usuario.nome_usuario}</strong> tem acesso a todos os workspaces da organização sem necessidade de vínculo individual. Para revogar o acesso, altere o tipo do usuário.
                        </p>
                      </div>
                    </div>

                    {vinculados.length > 0 && (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem' }}>
                        {vinculados.map((w) => (
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
                ) : vinculados.length > 0 ? (
                  <div style={{ border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', overflow: 'hidden', background: 'var(--ws-surface)' }}>
                    <TabelaGlobal<WorkspaceItem>
                      id={`usuario-workspaces-drilldown-${usuario.id_usuario}`}
                      idKey="id_workspace"
                      dados={vinculados}
                      tooltipBusca="Filtrar workspaces por nome ou ID comercial"
                      colunas={[
                        {
                          key: 'nome_workspace',
                          label: t('workspace.users.nome_workspace'),
                          tipo: 'texto',
                          render: (v, item) => (
                            <a
                              href={`/workspace/workspaces?id=${item.id_workspace}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{ fontWeight: 600, color: 'var(--ws-text)', textDecoration: 'none', transition: 'color 0.15s', cursor: 'pointer' }}
                              onMouseEnter={(e) => { e.currentTarget.style.color = '#818cf8'; e.currentTarget.style.textDecoration = 'underline' }}
                              onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--ws-text)'; e.currentTarget.style.textDecoration = 'none' }}
                              onClick={(ev) => ev.stopPropagation()}
                            >
                              {v as string}
                            </a>
                          ),
                        },
                        { key: 'id_workspace', label: t('workspace.users.id_tecnica'), tipo: 'texto', render: (v) => <code style={{ fontSize: '0.625rem', opacity: 0.6 }}>{v as string}</code> },
                        {
                          key: 'id_workspace', label: t('workspace.users.privilegio'), tipo: 'texto',
                          render: () => (
                            <span style={{ fontSize: '0.75rem', color: 'var(--ws-muted)' }}>
                              Acesso Padrão
                            </span>
                          ),
                        },
                        {
                          // Status do VÍNCULO do usuário com o workspace (não o status do workspace).
                          key: 'id_workspace', label: 'ACESSO', tipo: 'texto', align: 'right',
                          render: () => (
                            <TooltipGlobal descricao="Vínculo ativo: este usuário pode acessar este workspace">
                              <span style={{ fontSize: '0.6875rem', color: '#34d399', fontWeight: 700, letterSpacing: '0.04em' }}>VINCULADO</span>
                            </TooltipGlobal>
                          ),
                        },
                      ]}
                      mensagemVazio="Este usuário não possui acessos vinculados."
                    />
                  </div>
                ) : (
                  <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--ws-muted)', fontSize: '0.875rem', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px dashed rgba(255,255,255,0.1)' }}>
                    O usuário <strong>{usuario.nome_usuario}</strong> ainda não possui workspaces vinculados.
                  </div>
                )}
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
                placeholder="usuario@empresa.com"
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
        carregandoWorkspaces={carregando}
        aoFechar={() => setUsuarioEditando(null)}
        aoSalvar={async (uEditado, _permissoes, workspaceIds) => {
          setUsuarios((prev) => prev.map((u) => u.id_usuario === uEditado.id_usuario ? uEditado : u))

          if (uEditado.tipo_usuario !== 'MASTER' && workspaceIds.length > 0) {
            try {
              await usuariosApi.substituirWorkspaces(uEditado.id_usuario, workspaceIds)
              setVinculosMap((prev) => ({ ...prev, [uEditado.id_usuario]: workspaceIds }))
              addNotification({
                type: 'success',
                message: `Workspaces de "${uEditado.nome_usuario}" atualizados.`,
              })
              setUsuarioEditando(null)
            } catch (err) {
              addNotification({
                type: 'error',
                message: extractCatchError(err, 'Falha ao salvar workspaces.'),
              })
              // modal permanece aberto para o usuário corrigir e tentar de novo
            }
          } else {
            addNotification({
              type: 'success',
              message: `Usuário "${uEditado.nome_usuario}" atualizado.`,
            })
            setUsuarioEditando(null)
          }
        }}
      />
    </PaginaGlobal>
  )
}
