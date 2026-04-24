import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useUser } from '@clerk/clerk-react'
import { TooltipGlobal } from '@nucleo/tooltip-global'
import { Users, UserCircleCheck, UserCircleMinus, PauseCircle, PlayCircle, PencilSimple, FileXls, FileCsv, FileText, FilePdf, Code, ChartPieSlice, Key, User, EnvelopeSimple, ShieldCheck, Crown, Buildings } from '@phosphor-icons/react'
import { BotaoGlobal } from '@nucleo/botao-global'
import { CabecalhoGlobal } from '@nucleo/cabecalho-global'
import { PaginaGlobal } from '@nucleo/pagina-global'
import { TabelaGlobal, type TabelaGlobalColuna, type TabelaGlobalAcao, type TabelaExportAcao } from '@nucleo/tabela-global'
import { CardBasicoGlobal, CardGraficoGlobal, type PeriodoTendencia } from '@nucleo/card-global'
import { ModalFormularioGlobal } from '@nucleo/modal-formulario-global'
import { GeralCampoGlobal } from '@nucleo/campo-geral-global'
import { SelectGlobal, type SelectOpcao } from '@nucleo/campo-select-global'
import { exportarExcel, exportarCSV, exportarTXT, exportarXML, exportarJSON, exportarPDF, type ColunasExport } from '../../services/exportService'
import { useShellStore } from '@gravity/shell'
import { ModalEditarUsuario } from './ModalEditarUsuario'
import { type NivelAcesso, type UserStatus } from '../../types/niveis-acesso'
import { getAcoesExportacaoPadrao } from '../../utils/exportHelper'
import { extractApiError, extractCatchError } from '../../utils/extractApiError'


// ─── Tipos ────────────────────────────────────────────────────────────────────
// Documentação central em src/types/niveis-acesso.ts

export interface TenantUser {
  id: string
  nome: string
  email: string
  tipo: NivelAcesso
  status: UserStatus
}

export type EspacoTrabalho = {
  id: string
  nome: string
  usuarios: { userId: string; role: string; habilitado: boolean }[]
}

// ─── Auth helper (mesmo padrão de Workspaces.tsx) ──────────────────────────
async function getAuthHeaders(): Promise<Record<string, string>> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  try {
    const session = await (window as any).Clerk?.session
    const token = session ? await session.getToken() : null
    if (token) headers['Authorization'] = `Bearer ${token}`
  } catch { /* sem token */ }
  return headers
}

// Mapeia role do backend para NivelAcesso do frontend
function mapRoleToTipo(role: string): NivelAcesso {
  switch (role) {
    case 'MASTER': return 'Master'
    case 'ADMIN': return 'Admin'
    case 'SUPPLIER': return 'Fornecedor'
    default: return 'Standard'
  }
}

// ── Chips de empresas vinculadas com overflow via TooltipGlobal ─────────────────
function EmpresasAcessoCell({ empresas, isMaster }: { empresas: EspacoTrabalho[], isMaster: boolean }) {
  const MAX = 2

  if (isMaster) {
    return (
      <span style={{
        display: 'inline-flex', alignItems: 'center', gap: '0.25rem',
        padding: '0.2rem 0.625rem', borderRadius: '9999px',
        background: 'rgba(129,140,248,0.1)', color: '#818cf8',
        fontSize: '0.75rem', fontWeight: 600, fontStyle: 'italic',
        border: '1px solid rgba(129,140,248,0.2)',
      }}>
        ✶ Todas as empresas
      </span>
    )
  }

  if (empresas.length === 0) {
    return <span style={{ color: 'var(--ws-muted)', fontSize: '0.8125rem' }}>Nenhuma</span>
  }

  const visible = empresas.slice(0, MAX)
  const rest    = empresas.slice(MAX)

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', flexWrap: 'wrap' }}>
      {visible.map(e => (
        <span key={e.id} style={{
          padding: '0.15rem 0.5rem', borderRadius: '9999px',
          background: 'var(--ws-surface)', border: '1px solid var(--ws-accent-border)',
          color: 'var(--ws-text)', fontSize: '0.75rem', fontWeight: 500, whiteSpace: 'nowrap',
        }}>
          {e.nome}
        </span>
      ))}
      {rest.length > 0 && (
        <TooltipGlobal
          titulo={`+${rest.length} empresa${rest.length > 1 ? 's' : ''}`}
          descricao={rest.map(e => e.nome).join(' · ')}
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

const typeBadge: Record<NivelAcesso, string> = {
  'Super Admin': 'ws-badge-success',
  'Admin':       'ws-badge-info',
  'Master':      'ws-badge-accent',
  'Standard':    'ws-badge-surface',
  'Fornecedor':  'ws-badge-warning',
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
  const [users, setUsers]     = useState<TenantUser[]>([])
  const [espacos, setFiliais] = useState<EspacoTrabalho[]>([])
  const [membershipsMap, setMembershipsMap] = useState<Record<string, string[]>>({})
  const [carregando, setCarregando] = useState(true)

  // Carregar usuários e workspaces da API real
  useEffect(() => {
    if (!userLoaded) return
    async function fetchData() {
      try {
        setCarregando(true)
        const headers = await getAuthHeaders()

        const [usersRes, companiesRes] = await Promise.all([
          fetch('/api/v1/usuarios', { headers }),
          fetch('/api/v1/organizacao/companies', { headers }),
        ])

        if (usersRes.ok) {
          const { users: apiUsers } = await usersRes.json()
          const mappedUsers: TenantUser[] = apiUsers.map((u: { id: string; name?: string; email?: string; tipo_usuario?: string; memberships?: { is_active: boolean; company_id: string }[] }) => ({
            id: u.id,
            nome: u.name ?? '',
            email: u.email ?? '',
            tipo: mapRoleToTipo(u.tipo_usuario),
            status: 'Ativo' as UserStatus,
          }))
          setUsers(mappedUsers)

          // Construir mapa de memberships: userId -> companyIds[]
          const mMap: Record<string, string[]> = {}
          for (const u of apiUsers) {
            if (u.memberships && u.memberships.length > 0) {
              mMap[u.id] = u.memberships
                .filter((m: { is_active: boolean; company_id: string }) => m.is_active)
                .map((m: { is_active: boolean; company_id: string }) => m.company_id)
            }
          }
          setMembershipsMap(mMap)
        }

        if (companiesRes.ok) {
          const { companies } = await companiesRes.json()
          setFiliais(companies.map((c: { id: string; name?: string }) => ({
            id: c.id,
            nome: c.name ?? '',
            usuarios: [],
          })))
        }
      } catch (err) {
        console.error('Erro ao carregar usuários:', err)
      } finally {
        setCarregando(false)
      }
    }
    fetchData()
  }, [userLoaded])

  const [showForm, setShowForm] = useState(false)
  const [fNome, setFNome]       = useState('')
  const [fEmail, setFEmail]     = useState('')
  const [fTipo, setFTipo]       = useState<NivelAcesso>('Standard')
  const [fTodosWorkspaces, setFTodosWorkspaces] = useState(true)
  const [fWorkspacesSelecionados, setFWorkspacesSelecionados] = useState<string[]>([])

  const [usuarioEditando, setUsuarioEditando] = useState<TenantUser | null>(null)
  const [abaEditando, setAbaEditando] = useState<string>('dados')

  async function handleInvite() {
    if (!fNome.trim() || !fEmail.trim()) return
    try {
      const headers = await getAuthHeaders()
      const roleMap: Record<NivelAcesso, string> = {
        'Super Admin': 'MASTER',
        'Admin': 'MASTER',
        'Master': 'MASTER',
        'Standard': 'STANDARD',
        'Fornecedor': 'SUPPLIER',
      }
      const workspacesPayload = (fTipo === 'Standard' || fTipo === 'Fornecedor')
        ? (fTodosWorkspaces ? 'all' : fWorkspacesSelecionados)
        : undefined
      const res = await fetch('/api/v1/usuarios/invite', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          email: fEmail.trim(),
          name: fNome.trim(),
          role: roleMap[fTipo] ?? 'STANDARD',
          workspaces: workspacesPayload,
        }),
      })
      if (res.ok) {
        const { user: created } = await res.json()
        const newUser: TenantUser = {
          id: created.id,
          nome: fNome.trim(),
          email: created.email,
          tipo: fTipo,
          status: 'Ativo',
        }
        if (fTipo === 'Standard' || fTipo === 'Fornecedor') {
          const ids = fTodosWorkspaces ? espacos.map(e => e.id) : fWorkspacesSelecionados
          setMembershipsMap(prev => ({ ...prev, [created.id]: ids }))
        }
        setUsers(prev => [...prev, newUser])
        addNotification({ type: 'success', message: `Usuário "${fNome.trim()}" convidado com sucesso!` })
      } else {
        const body = await res.json().catch(() => ({ error: { message: 'Falha ao convidar usuário.' } }))
        addNotification({ type: 'error', message: body?.error?.message ?? body?.message ?? 'Falha ao convidar usuário.' })
      }
    } catch (err) {
      addNotification({ type: 'error', message: extractCatchError(err, 'Falha ao convidar usuário. Tente novamente.') })
    }
    setFNome(''); setFEmail(''); setFTipo('Standard'); setFTodosWorkspaces(true); setFWorkspacesSelecionados([]); setShowForm(false)
  }

  function handleToggleEspacoTrabalhoUser(filialId: string, userId: string) {
    setFiliais(prev => prev.map(f => {
      if (f.id !== filialId) return f
      return {
        ...f,
        usuarios: f.usuarios.map(u =>
          u.userId === userId ? { ...u, habilitado: !u.habilitado } : u
        ),
      }
    }))
  }

  function handleDeactivate(u: TenantUser) {
    // Bypass window.confirm to avoid silent failures in secure iframes.
    setUsers(prev => prev.map(x => x.id === u.id ? { ...x, status: x.status === 'Ativo' ? 'Inativo' : 'Ativo' } : x))
  }

  const COLUNAS: TabelaGlobalColuna<TenantUser>[] = [
    {
      key: 'nome', label: t('workspace.users.tabela.usuario'), tipo: 'texto',
      tooltipTitulo: 'Usuário', tooltipDescricao: 'Nome completo e identificação visual do usuário',
      render: (v, item) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
          <div style={{
            width: 32, height: 32, minWidth: 32, borderRadius: '50%',
            background: item.tipo === 'Master' ? 'rgba(129,140,248,0.2)' : item.tipo === 'Admin' ? 'rgba(6,182,212,0.15)' : item.tipo === 'Fornecedor' ? 'rgba(245,158,11,0.15)' : 'rgba(255,255,255,0.07)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700,
            color: item.tipo === 'Master' ? '#818cf8' : item.tipo === 'Admin' ? '#06b6d4' : item.tipo === 'Fornecedor' ? '#fbbf24' : '#94a3b8',
          }}>
            {item.nome.split(' ').map(n => n[0]).join('').slice(0, 2)}
          </div>
          <span style={{ fontWeight: 600 }}>{item.nome}</span>
        </div>
      )
    },
    {
      key: 'email', label: t('workspace.users.tabela.email'), tipo: 'texto',
      tooltipTitulo: 'E-mail', tooltipDescricao: 'E-mail de acesso utilizado no login da plataforma',
      render: (v) => <span style={{ color: 'var(--ws-muted)' }}>{v}</span>
    },
    {
      key: 'tipo', label: t('workspace.users.tabela.tipo'), tipo: 'texto',
      tooltipTitulo: 'Tipo', tooltipDescricao: 'Define as permissões base: Master, Standard ou Fornecedor',
      render: (v) => <span style={{ padding: '0.2rem 0.6rem', borderRadius: '9999px', fontSize: '0.6875rem', fontWeight: 700, letterSpacing: '0.04em', ...(v === 'Master' ? { color: '#818cf8', background: 'rgba(129,140,248,0.1)' } : v === 'Admin' ? { color: '#06b6d4', background: 'rgba(6,182,212,0.1)' } : v === 'Fornecedor' ? { color: '#fbbf24', background: 'rgba(245,158,11,0.1)' } : { color: '#94a3b8', background: 'rgba(255,255,255,0.05)' }) }}>{v as string}</span>
    },
    {
      key: 'status', label: t('workspace.users.tabela.status'), tipo: 'texto',
      tooltipTitulo: 'Status', tooltipDescricao: 'Indica se o usuário pode acessar a plataforma',
      render: (v) => <span style={{ display: 'inline-flex', padding: '0.2rem 0.625rem', borderRadius: '9999px', fontSize: '0.6875rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', background: v === 'Ativo' ? 'rgba(52,211,153,0.12)' : 'rgba(248,113,113,0.12)', color: v === 'Ativo' ? '#34d399' : '#f87171', border: `1px solid ${v === 'Ativo' ? 'rgba(52,211,153,0.2)' : 'rgba(248,113,113,0.2)'}` }}>{v}</span>
    },
    {
      key: 'id', label: t('workspace.users.tabela_acesso'), tipo: 'texto',
      tooltipTitulo: 'Empresas vinculadas', tooltipDescricao: 'Workspaces às quais este usuário tem acesso liberado',
      render: (_, item) => {
        const isMaster = item.tipo === 'Master'
        const empresas = isMaster ? espacos : espacosDoUsuario(item.id)
        return <EmpresasAcessoCell empresas={empresas} isMaster={isMaster} />
      }
    }
  ]

  const ACOES: TabelaGlobalAcao<TenantUser>[] = [
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
      onClick: handleDeactivate,
      renderCustom: (item) => (
        <TooltipGlobal descricao={item.status === 'Ativo' ? 'Suspender o acesso deste usuário' : 'Reativar o acesso deste usuário'}>
          <button
            type="button"
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleDeactivate(item); }}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 28, height: 28, borderRadius: '50%', background: 'transparent', border: '1px solid transparent', color: '#64748b', cursor: 'pointer', transition: 'all 0.15s', flexShrink: 0 }}
            onMouseEnter={ev => { ev.currentTarget.style.background = item.status === 'Ativo' ? 'rgba(251,191,36,0.12)' : 'rgba(52,211,153,0.12)'; ev.currentTarget.style.borderColor = item.status === 'Ativo' ? 'rgba(251,191,36,0.3)' : 'rgba(52,211,153,0.3)'; ev.currentTarget.style.color = item.status === 'Ativo' ? '#fbbf24' : '#34d399' }}
            onMouseLeave={ev => { ev.currentTarget.style.background = 'transparent'; ev.currentTarget.style.borderColor = 'transparent'; ev.currentTarget.style.color = '#64748b' }}
          >
            {item.status === 'Ativo' ? <PauseCircle size={16} weight="bold" /> : <PlayCircle size={16} weight="bold" />}
          </button>
        </TooltipGlobal>
      )
    },
    {
      id: 'edit',
      icone: <PencilSimple size={15} weight="bold" />,
      tooltip: 'Editar',
      onClick: (u) => { setUsuarioEditando(u); setAbaEditando('dados') },
    }
  ]

  const COLUNAS_EXPORT: ColunasExport[] = [
    { header: 'Nome',    key: 'nome'   },
    { header: 'E-mail',  key: 'email'  },
    { header: 'Tipo',    key: 'tipo'   },
    { header: 'Status',  key: 'status' },
  ]
  const OPCOES_EXPORT = { nomeArquivo: 'todos-os-usuarios', titulo: 'Todos os Usuários' }

  const ACOES_EXPORT: TabelaExportAcao<TenantUser>[] = [
    { label: 'Excel (.xlsx)', icone: <FileXls size={14} weight="bold" />, onClick: (dados) => void exportarExcel(dados as any, COLUNAS_EXPORT, OPCOES_EXPORT) },
    { label: 'CSV', icone: <FileCsv size={14} weight="bold" />, onClick: (dados) => void exportarCSV(dados as any, COLUNAS_EXPORT, OPCOES_EXPORT) },
    { label: 'TXT', icone: <FileText size={14} weight="bold" />, onClick: (dados) => void exportarTXT(dados as any, COLUNAS_EXPORT, OPCOES_EXPORT) },
    { label: 'XML', icone: <Code size={14} weight="bold" />, onClick: (dados) => void exportarXML(dados as any, COLUNAS_EXPORT, OPCOES_EXPORT) },
    { label: 'PDF', icone: <FilePdf size={14} weight="bold" />, onClick: (dados) => void exportarPDF(dados as any, COLUNAS_EXPORT, OPCOES_EXPORT) },
    { label: 'JSON', icone: <Code size={14} weight="bold" />, onClick: (dados) => void exportarJSON(dados as any, COLUNAS_EXPORT, OPCOES_EXPORT) },
  ]

  // Computa empresas vinculadas por usuário via memberships da API
  function espacosDoUsuario(userId: string): EspacoTrabalho[] {
    const ids = membershipsMap[userId] ?? []
    return espacos.filter(f => ids.includes(f.id))
  }

  const COLUNAS_FILIAIS: TabelaGlobalColuna<TenantUser>[] = [
    {
      key: 'nome', label: t('workspace.users.tabela.usuario'), tipo: 'texto',
      tooltipTitulo: 'Usuário', tooltipDescricao: 'Nome completo e identificação visual do usuário',
      render: (_, item) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
          <div style={{
            width: 32, height: 32, minWidth: 32, borderRadius: '50%',
            background: item.tipo === 'Master' ? 'rgba(129,140,248,0.2)' : item.tipo === 'Admin' ? 'rgba(6,182,212,0.15)' : item.tipo === 'Fornecedor' ? 'rgba(245,158,11,0.15)' : 'rgba(255,255,255,0.07)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700,
            color: item.tipo === 'Master' ? '#818cf8' : item.tipo === 'Admin' ? '#06b6d4' : item.tipo === 'Fornecedor' ? '#fbbf24' : '#94a3b8',
          }}>
            {item.nome.split(' ').map(n => n[0]).join('').slice(0, 2)}
          </div>
          <span style={{ fontWeight: 600 }}>{item.nome}</span>
        </div>
      )
    },
    {
      key: 'email', label: t('workspace.users.tabela.email'), tipo: 'texto',
      tooltipTitulo: 'E-mail', tooltipDescricao: 'E-mail de acesso utilizado no login da plataforma',
      render: (v) => <span style={{ color: 'var(--ws-muted)' }}>{v}</span>
    },
    {
      key: 'tipo', label: t('workspace.users.tabela.tipo'), tipo: 'texto',
      tooltipTitulo: 'Tipo', tooltipDescricao: 'Define as permissões base: Master, Standard ou Fornecedor',
      render: (v) => <span style={{ padding: '0.2rem 0.6rem', borderRadius: '9999px', fontSize: '0.6875rem', fontWeight: 700, letterSpacing: '0.04em', ...(v === 'Master' ? { color: '#818cf8', background: 'rgba(129,140,248,0.1)' } : v === 'Admin' ? { color: '#06b6d4', background: 'rgba(6,182,212,0.1)' } : v === 'Fornecedor' ? { color: '#fbbf24', background: 'rgba(245,158,11,0.1)' } : { color: '#94a3b8', background: 'rgba(255,255,255,0.05)' }) }}>{v as string}</span>
    },
    {
      key: 'id', label: t('workspace.users.tabela_empresas_vinculadas'), tipo: 'texto',
      tooltipTitulo: 'Empresas vinculadas', tooltipDescricao: 'Workspaces às quais este usuário tem acesso liberado',
      render: (_, item) => {
        const isMaster = item.tipo === 'Master'
        const empresas = isMaster ? espacos : espacosDoUsuario(item.id)
        return <EmpresasAcessoCell empresas={empresas} isMaster={isMaster} />
      }
    },
  ]

  const COLUNAS_EXPORT_FILIAIS: ColunasExport[] = [
    { header: 'Nome',    key: 'nome'  },
    { header: 'E-mail',  key: 'email' },
    { header: 'Tipo',    key: 'tipo'  },
  ]
  const OPCOES_EXPORT_FILIAIS = { nomeArquivo: 'acesso-por-workspace', titulo: 'Acesso por Workspace' }

  const ACOES_EXPORT_FILIAIS: TabelaExportAcao<TenantUser>[] = [
    { label: 'Exportação Completa', icone: <FileXls size={14} weight="bold" />, onClick: (dados) => void exportarExcel(dados as any, COLUNAS_EXPORT_FILIAIS, OPCOES_EXPORT_FILIAIS) },
  ]

  const totalVinculos = users.reduce((acc, u) => acc + (u.tipo === 'Master' ? espacos.length : (membershipsMap[u.id]?.length || 0)), 0)
  const mediaEspacosPorUsuario = users.length ? (totalVinculos / users.length).toFixed(1) : '0'
  const usuariosComAcesso = users.filter(u => u.tipo === 'Master' ? espacos.length > 0 : (membershipsMap[u.id]?.length || 0) > 0).length

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
            valor={users.length}
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
                  <strong>{users.length}</strong>
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
            valor={mediaEspacosPorUsuario}
            icone={<ChartPieSlice weight="duotone" size={18} />}
            variante="padrao"
            subtexto="Empresas por usuário ativo"
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
                  <strong>{mediaEspacosPorUsuario} empresas</strong>
                </div>
              </>
            }
          />
          <CardGraficoGlobal
            titulo={t('workspace.users.total_workspaces')}
            icone={<ChartPieSlice weight="duotone" size={16} style={{ color: '#8b5cf6' }} />}
            total={users.length}
            valorPrincipal={usuariosComAcesso}
            corGauge="#8b5cf6"
            legenda={[
              { label: t('workspace.users.com_acesso'), valor: usuariosComAcesso, cor: '#8b5cf6' },
              { label: t('workspace.users.sem_acesso'), valor: users.length - usuariosComAcesso, cor: '#64748b' },
            ]}
            tooltip={
              <>
                <p className="cg-tooltip__title">Densidade & Distribuição</p>
                <div className="cg-tooltip__row">
                  <span>Total de Usuários</span>
                  <strong>{users.length}</strong>
                </div>
                <div className="cg-tooltip__row">
                  <span>Total de Workspaces</span>
                  <strong>{espacos.length}</strong>
                </div>
                <div className="cg-tooltip__divider" />
                <div className="cg-tooltip__row">
                  <span>Vínculos Ativos</span>
                  <strong>{totalVinculos}</strong>
                </div>
                <div className="cg-tooltip__row">
                  <span>Média p/ Usuário</span>
                  <strong style={{ color: '#8b5cf6' }}>{mediaEspacosPorUsuario}</strong>
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
        <TabelaGlobal<TenantUser>
          id="workspace-users"
          dados={users}
          colunas={COLUNAS}
          acoes={ACOES}
          acoesExportacao={getAcoesExportacaoPadrao(COLUNAS, 'dados_tabela', 'Exportação de Dados')}
          mensagemVazio="Nenhum usuário encontrado na busca."
          mensagemSemFiltro="Nenhum usuário cadastrado na sua conta corporativa."
          tooltipBusca="Localizar usuário por nome, e-mail ou tipo de acesso"
          tooltipExpandir="Ver workspaces vinculados ao usuário"
          tooltipRecolher="Recolher detalhes do usuário"
          renderExpandido={(usuario) => {
            const vinculados = usuario.tipo === 'Master' ? espacos : espacosDoUsuario(usuario.id)
            return (
              <div style={{ padding: '0 1.5rem 1.5rem 1.5rem', background: 'rgba(0,0,0,0.15)' }}>
                <div style={{ padding: '1.25rem 1rem 0.75rem 1rem', borderTop: '1px solid rgba(129,140,248,0.1)', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--ws-muted)', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  <ShieldCheck size={14} weight="duotone" color="var(--color-primary)" /> Permissões de Acesso por Workspace
                </div>
                
                {vinculados.length > 0 ? (
                  <div style={{ border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', overflow: 'hidden', background: 'var(--ws-surface)' }}>
                    <TabelaGlobal<EspacoTrabalho>
                      id={`user-workspaces-drilldown-${usuario.id}`}
                      dados={vinculados}
                      tooltipBusca="Filtrar workspaces por nome ou ID comercial"
                      colunas={[
                        {
                          key: 'nome',
                          label: t('workspace.users.nome_workspace'),
                          tipo: 'texto', 
                          render: (v, item) => {
                            const nome = v as string;
                            return (
                              <a 
                                href={`/workspace/workspaces?id=${item.id}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{ fontWeight: 600, color: 'var(--ws-text)', textDecoration: 'none', transition: 'color 0.15s', cursor: 'pointer' }}
                                onMouseEnter={e => { e.currentTarget.style.color = '#818cf8'; e.currentTarget.style.textDecoration = 'underline'; }}
                                onMouseLeave={e => { e.currentTarget.style.color = 'var(--ws-text)'; e.currentTarget.style.textDecoration = 'none'; }}
                                onClick={ev => ev.stopPropagation()}
                              >
                                {nome}
                              </a>
                            )
                          }
                        },
                        { key: 'id', label: t('workspace.users.id_tecnica'), tipo: 'texto', render: (v) => <code style={{ fontSize: '0.625rem', opacity: 0.6 }}>{v as string}</code> },
                        { 
                          key: 'id', label: t('workspace.users.privilegio'), tipo: 'texto',
                          render: () => (
                            <span style={{ fontSize: '0.75rem', color: 'var(--ws-muted)' }}>
                              {usuario.tipo === 'Master' ? 'Acesso Total (Master)' : 'Acesso Padrão'}
                            </span>
                          )
                        },
                        {
                          key: 'id', label: t('workspace.users.status_workspace'), tipo: 'texto', align: 'right',
                          render: () => (
                             <span style={{ fontSize: '0.6875rem', color: '#34d399', fontWeight: 700 }}>HABILITADO</span>
                          )
                        }
                      ]}
                      mensagemVazio="Este usuário não possui acessos vinculados."
                    />
                  </div>
                ) : (
                  <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--ws-muted)', fontSize: '0.875rem', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px dashed rgba(255,255,255,0.1)' }}>
                    O usuário <strong>{usuario.nome}</strong> ainda não possui workspaces vinculados.
                  </div>
                )}
              </div>
            )
          }}
        />
        )}
      </div>

      {/* Modal Convidar Usuário */}
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
        podesSalvar={!!(fNome.trim() && fEmail.trim() && ((fTipo !== 'Standard' && fTipo !== 'Fornecedor') || fTodosWorkspaces || fWorkspacesSelecionados.length > 0))}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <GeralCampoGlobal label="NOME COMPLETO" obrigatorio>
            <div className="ws-input-icon-wrap">
              <User size={16} />
              <input
                value={fNome}
                placeholder="Ex: Ana Paula"
                onChange={e => setFNome(e.target.value)}
                style={{ width: '100%' }}
              />
            </div>
          </GeralCampoGlobal>

          <GeralCampoGlobal label="E-MAIL" obrigatorio>
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
          </GeralCampoGlobal>

          <GeralCampoGlobal label="TIPO DE USUÁRIO">
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
          </GeralCampoGlobal>

          {(fTipo === 'Standard' || fTipo === 'Fornecedor') && (
            <GeralCampoGlobal label="WORKSPACES">
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
                  {espacos.length === 0 ? (
                    <span style={{ padding: '0.75rem', color: 'var(--ws-muted)', fontSize: '0.8125rem', textAlign: 'center' }}>
                      Nenhum workspace ativo encontrado.
                    </span>
                  ) : espacos.map(e => {
                    const selecionado = fWorkspacesSelecionados.includes(e.id)
                    return (
                      <div
                        key={e.id}
                        role="checkbox"
                        aria-checked={selecionado}
                        tabIndex={0}
                        onClick={() => setFWorkspacesSelecionados(prev =>
                          selecionado ? prev.filter(id => id !== e.id) : [...prev, e.id]
                        )}
                        onKeyDown={(ev) => { if (ev.key === ' ' || ev.key === 'Enter') { ev.preventDefault(); setFWorkspacesSelecionados(prev => selecionado ? prev.filter(id => id !== e.id) : [...prev, e.id]) } }}
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
                        <span style={{ fontSize: '0.8125rem', color: 'var(--ws-text)' }}>{e.nome}</span>
                      </div>
                    )
                  })}
                </div>
              )}
            </GeralCampoGlobal>
          )}
        </div>
      </ModalFormularioGlobal>

      {/* Modal Edição do Usuário */}
      <ModalEditarUsuario
        usuario={usuarioEditando}
        abaInicial={abaEditando}
        espacos={espacos}
        workspacesSalvos={usuarioEditando ? (membershipsMap[usuarioEditando.id] ?? []) : []}
        carregandoEspacos={carregando}
        aoFechar={() => setUsuarioEditando(null)}
        aoSalvar={async (uEditado, _permissoes, workspaceIds) => {
          setUsers(prev => prev.map(u => u.id === uEditado.id ? uEditado : u))

          if (uEditado.tipo !== 'Master' && workspaceIds.length > 0) {
            try {
              const headers = await getAuthHeaders()
              const res = await fetch(`/api/v1/usuarios/${uEditado.id}/workspaces`, {
                method: 'PUT',
                headers,
                body: JSON.stringify({ workspaces: workspaceIds }),
              })
              if (res.ok) {
                setMembershipsMap(prev => ({ ...prev, [uEditado.id]: workspaceIds }))
                addNotification({ type: 'success', message: `Workspaces de "${uEditado.nome}" atualizados.` })
                setUsuarioEditando(null)
              } else {
                const body = await res.json().catch(() => ({}))
                addNotification({ type: 'error', message: body?.error?.message ?? 'Falha ao salvar workspaces.' })
                // modal permanece aberto para o usuário corrigir e tentar de novo
              }
            } catch (err) {
              addNotification({ type: 'error', message: extractCatchError(err, 'Falha ao salvar workspaces.') })
              // modal permanece aberto para o usuário corrigir e tentar de novo
            }
          } else {
            addNotification({ type: 'success', message: `Usuário "${uEditado.nome}" atualizado.` })
            setUsuarioEditando(null)
          }
        }}
      />
    </PaginaGlobal>
  )
}
