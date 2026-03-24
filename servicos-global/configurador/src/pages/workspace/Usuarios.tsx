import React, { useState } from 'react'
import { TooltipGlobal } from '@nucleo/tooltip-global'
import { Users, Plus, X, PauseCircle, PlayCircle, PencilSimple, Trash, FileXls, FileCsv, FileText, FilePdf, Code } from '@phosphor-icons/react'
import { BotaoGlobal } from '@nucleo/botao-global'
import { BotaoNovoGlobal } from '@nucleo/botao-novo-global'
import { CabecalhoGlobal } from '@nucleo/cabecalho-global'
import { TabelaGlobal, type TabelaGlobalColuna, type TabelaGlobalAcao, type TabelaExportAcao } from '@nucleo/tabela-global'
import { exportarExcel, exportarCSV, exportarTXT, exportarXML, exportarJSON, exportarPDF, type ColunasExport } from '../../services/exportService'

type UserType = 'Master' | 'Standard' | 'Fornecedor'
type UserStatus = 'Ativo' | 'Inativo'

export interface TenantUser {
  id: string
  nome: string
  email: string
  tipo: UserType
  status: UserStatus
}

type Filial = {
  id: string
  nome: string
  usuarios: { userId: string; role: string; habilitado: boolean }[]
}

// 50 empresas filhas mock
const ALL_FILIAIS: Filial[] = Array.from({ length: 50 }, (_, i) => ({
  id: `f${i + 1}`,
  nome: [
    'Acme Logística', 'Acme Importações', 'Acme Distribuição', 'Acme Exportação', 'Acme Varejo',
    'Acme Tech', 'Acme Sul', 'Acme Norte', 'Acme Leste', 'Acme Oeste',
    'Filial SP Centro', 'Filial SP Interior', 'Filial RJ', 'Filial MG', 'Filial RS',
    'Filial SC', 'Filial PR', 'Filial BA', 'Filial GO', 'Filial DF',
    'Unidade Campinas', 'Unidade Santos', 'Unidade Sorocaba', 'Unidade Ribeirão Preto', 'Unidade São José',
    'Unidade Belém', 'Unidade Manaus', 'Unidade Fortaleza', 'Unidade Recife', 'Unidade Salvador',
    'Depósito Central', 'Depósito Norte', 'Depósito Sul', 'Depósito Leste', 'Depósito Oeste',
    'CD São Paulo', 'CD Rio de Janeiro', 'CD Belo Horizonte', 'CD Curitiba', 'CD Porto Alegre',
    'Hub Exportação I', 'Hub Exportação II', 'Hub Importação I', 'Hub Importação II', 'Hub Logístico',
    'Escritório SP', 'Escritório RJ', 'Escritório BH', 'Escritório Curitiba', 'Escritório Recife',
  ][i],
  usuarios: [], // não usado no novo modelo centrado no usuário
}))

// Empresa filha vínculo por usuário: u2=1, u3=5, u4=10, u5=30
const mockFiliais: Filial[] = ALL_FILIAIS

const mockUsers: TenantUser[] = [
  { id: 'u01', nome: 'Daniel Marques',      email: 'daniel@acme.com.br',        tipo: 'Master',     status: 'Ativo'   },
  { id: 'u02', nome: 'Carla Souza',         email: 'carla@acme.com.br',          tipo: 'Master',     status: 'Ativo'   },
  { id: 'u03', nome: 'Felipe Lima',         email: 'felipe@acme.com.br',         tipo: 'Standard',   status: 'Inativo' },
  { id: 'u04', nome: 'Rodrigo Faria',       email: 'rodrigo@acme.com.br',        tipo: 'Standard',   status: 'Ativo'   },
  { id: 'u05', nome: 'Ana Beatriz Costa',   email: 'ana.beatriz@acme.com.br',    tipo: 'Standard',   status: 'Ativo'   },
  { id: 'u06', nome: 'Paulo Henrique',      email: 'paulo.h@acme.com.br',        tipo: 'Standard',   status: 'Ativo'   },
  { id: 'u07', nome: 'Juliana Martins',     email: 'juliana@acme.com.br',        tipo: 'Standard',   status: 'Inativo' },
  { id: 'u08', nome: 'Marcos Oliveira',     email: 'marcos@acme.com.br',         tipo: 'Standard',   status: 'Ativo'   },
  { id: 'u09', nome: 'Fernanda Rocha',      email: 'fernanda@acme.com.br',       tipo: 'Standard',   status: 'Ativo'   },
  { id: 'u10', nome: 'Gustavo Almeida',     email: 'gustavo@acme.com.br',        tipo: 'Standard',   status: 'Ativo'   },
  { id: 'u11', nome: 'Tatiane Ferreira',    email: 'tatiane@acme.com.br',        tipo: 'Standard',   status: 'Inativo' },
  { id: 'u12', nome: 'Bruno Cardoso',       email: 'bruno@acme.com.br',          tipo: 'Standard',   status: 'Ativo'   },
  { id: 'u13', nome: 'Larissa Mendes',      email: 'larissa@acme.com.br',        tipo: 'Standard',   status: 'Ativo'   },
  { id: 'u14', nome: 'Thiago Nascimento',   email: 'thiago@acme.com.br',         tipo: 'Standard',   status: 'Ativo'   },
  { id: 'u15', nome: 'Patrícia Lopes',      email: 'patricia@acme.com.br',       tipo: 'Standard',   status: 'Ativo'   },
  { id: 'u16', nome: 'Eduardo Silva',       email: 'eduardo@acme.com.br',        tipo: 'Standard',   status: 'Inativo' },
  { id: 'u17', nome: 'Camila Santos',       email: 'camila@acme.com.br',         tipo: 'Standard',   status: 'Ativo'   },
  { id: 'u18', nome: 'Leandro Pereira',     email: 'leandro@acme.com.br',        tipo: 'Standard',   status: 'Ativo'   },
  { id: 'u19', nome: 'Vanessa Ribeiro',     email: 'vanessa@acme.com.br',        tipo: 'Standard',   status: 'Ativo'   },
  { id: 'u20', nome: 'Ricardo Gomes',       email: 'ricardo@acme.com.br',        tipo: 'Standard',   status: 'Inativo' },
  { id: 'u21', nome: 'Aline Correia',       email: 'aline@acme.com.br',          tipo: 'Standard',   status: 'Ativo'   },
  { id: 'u22', nome: 'Vinicius Carvalho',   email: 'vinicius@acme.com.br',       tipo: 'Standard',   status: 'Ativo'   },
  { id: 'u23', nome: 'Renata Barbosa',      email: 'renata@acme.com.br',         tipo: 'Standard',   status: 'Ativo'   },
  { id: 'u24', nome: 'Sérgio Moraes',       email: 'sergio@acme.com.br',         tipo: 'Standard',   status: 'Ativo'   },
  { id: 'u25', nome: 'Isabela Teixeira',    email: 'isabela@acme.com.br',        tipo: 'Standard',   status: 'Inativo' },
  { id: 'u26', nome: 'Diego Cunha',         email: 'diego@acme.com.br',          tipo: 'Standard',   status: 'Ativo'   },
  { id: 'u27', nome: 'Priscila Vieira',     email: 'priscila@acme.com.br',       tipo: 'Standard',   status: 'Ativo'   },
  { id: 'u28', nome: 'Fábio Araújo',        email: 'fabio@acme.com.br',          tipo: 'Standard',   status: 'Ativo'   },
  { id: 'u29', nome: 'Monique Dias',        email: 'monique@acme.com.br',        tipo: 'Standard',   status: 'Ativo'   },
  { id: 'u30', nome: 'Henrique Cavalcanti', email: 'henrique@acme.com.br',       tipo: 'Standard',   status: 'Inativo' },
  { id: 'u31', nome: 'Sabrina Pinto',       email: 'sabrina@acme.com.br',        tipo: 'Standard',   status: 'Ativo'   },
  { id: 'u32', nome: 'Caio Rezende',        email: 'caio@acme.com.br',           tipo: 'Standard',   status: 'Ativo'   },
  { id: 'u33', nome: 'Letícia Castro',      email: 'leticia@acme.com.br',        tipo: 'Standard',   status: 'Ativo'   },
  { id: 'u34', nome: 'Omar Khalil',         email: 'omar@acme.com.br',           tipo: 'Standard',   status: 'Ativo'   },
  { id: 'u35', nome: 'Giovana Ramos',       email: 'giovana@acme.com.br',        tipo: 'Standard',   status: 'Inativo' },
  { id: 'u36', nome: 'Alex Freitas',        email: 'alex@acme.com.br',           tipo: 'Standard',   status: 'Ativo'   },
  { id: 'u37', nome: 'Debora Monteiro',     email: 'debora@acme.com.br',         tipo: 'Standard',   status: 'Ativo'   },
  { id: 'u38', nome: 'Walter Cruz',         email: 'walter@acme.com.br',         tipo: 'Standard',   status: 'Ativo'   },
  { id: 'u39', nome: 'Natália Borges',      email: 'natalia@acme.com.br',        tipo: 'Standard',   status: 'Ativo'   },
  { id: 'u40', nome: 'Rafael Nunes',        email: 'rafael@acme.com.br',         tipo: 'Standard',   status: 'Inativo' },
  { id: 'u41', nome: 'Fornecedor Alpha',    email: 'forn@alpha.com',             tipo: 'Fornecedor', status: 'Ativo'   },
  { id: 'u42', nome: 'Fornecedor Beta',     email: 'contato@beta.com.br',        tipo: 'Fornecedor', status: 'Ativo'   },
  { id: 'u43', nome: 'Fornecedor Gamma',    email: 'ops@gamma.io',               tipo: 'Fornecedor', status: 'Inativo' },
  { id: 'u44', nome: 'Fornecedor Delta',    email: 'ti@delta.com.br',            tipo: 'Fornecedor', status: 'Ativo'   },
  { id: 'u45', nome: 'Fornecedor Épsilon',  email: 'suporte@epsilon.com',        tipo: 'Fornecedor', status: 'Ativo'   },
  { id: 'u46', nome: 'Fornecedor Zeta',     email: 'admin@zeta.com.br',          tipo: 'Fornecedor', status: 'Ativo'   },
  { id: 'u47', nome: 'Fornecedor Eta',      email: 'contato@eta.net',            tipo: 'Fornecedor', status: 'Inativo' },
  { id: 'u48', nome: 'Fornecedor Theta',    email: 'ti@theta.com.br',            tipo: 'Fornecedor', status: 'Ativo'   },
  { id: 'u49', nome: 'Fornecedor Iota',     email: 'ops@iota.io',                tipo: 'Fornecedor', status: 'Ativo'   },
  { id: 'u50', nome: 'Fornecedor Kappa',    email: 'suporte@kappa.com.br',       tipo: 'Fornecedor', status: 'Ativo'   },
]

// Vínculos por usuário (id → lista de filial ids)
const VINCULOS: Record<string, string[]> = {
  // Masters: sem vínculo manual (acesso total automático)
  // Standard com 1 empresa
  u03: ['f1'],
  u07: ['f3'],
  u11: ['f7'],
  u16: ['f12'],
  u20: ['f5'],
  // Standard com 5 empresas
  u04: ['f1','f2','f3','f4','f5'],
  u08: ['f6','f7','f8','f9','f10'],
  u13: ['f11','f12','f13','f14','f15'],
  u17: ['f2','f4','f6','f8','f10'],
  u21: ['f1','f3','f5','f7','f9'],
  // Standard com 10 empresas
  u05: Array.from({ length: 10 }, (_, i) => `f${i + 1}`),
  u09: Array.from({ length: 10 }, (_, i) => `f${i + 6}`),
  u14: Array.from({ length: 10 }, (_, i) => `f${i + 11}`),
  u18: Array.from({ length: 10 }, (_, i) => `f${i + 21}`),
  u22: Array.from({ length: 10 }, (_, i) => `f${i + 31}`),
  // Standard com 30 empresas
  u06: Array.from({ length: 30 }, (_, i) => `f${i + 1}`),
  u10: Array.from({ length: 30 }, (_, i) => `f${i + 1}`),
  u23: Array.from({ length: 30 }, (_, i) => `f${i + 1}`),
  // Fornecedores com vínculos variados
  u41: ['f1','f2','f3'],
  u42: ['f5','f10','f15','f20','f25'],
  u44: Array.from({ length: 10 }, (_, i) => `f${i + 1}`),
  u45: ['f3'],
  u46: Array.from({ length: 20 }, (_, i) => `f${i + 1}`),
  u48: ['f1','f4','f7'],
  u49: ['f2'],
  u50: Array.from({ length: 15 }, (_, i) => `f${i + 5}`),
}

// ── Chips de empresas vinculadas com overflow via TooltipGlobal ─────────────────
function EmpresasAcessoCell({ empresas, isMaster }: { empresas: Filial[], isMaster: boolean }) {
  const MAX = 2

  if (isMaster) {
    return (
      <span style={{
        display: 'inline-flex', alignItems: 'center', gap: '0.25rem',
        padding: '0.2rem 0.625rem', borderRadius: '9999px',
        background: 'rgba(56,189,248,0.1)', color: '#38bdf8',
        fontSize: '0.75rem', fontWeight: 600, fontStyle: 'italic',
        border: '1px solid rgba(56,189,248,0.2)',
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
            background: 'rgba(56,189,248,0.1)', border: '1px solid rgba(56,189,248,0.25)',
            color: '#38bdf8', fontSize: '0.75rem', fontWeight: 700,
            cursor: 'default', lineHeight: 1.4,
          }}>
            +{rest.length}
          </span>
        </TooltipGlobal>
      )}
    </div>
  )
}

const typeBadge: Record<UserType, string> = {
  Master:     'ws-badge-accent',
  Standard:   'ws-badge-surface',
  Fornecedor: 'ws-badge-warning',
}

export function Usuarios() {
  const [tab, setTab]         = useState<'tenant' | 'filiais'>('tenant')
  const [users, setUsers]     = useState<TenantUser[]>(mockUsers)
  const [filiais, setFiliais] = useState<Filial[]>(mockFiliais)


  const [showForm, setShowForm] = useState(false)
  const [fNome, setFNome]       = useState('')
  const [fEmail, setFEmail]     = useState('')
  const [fTipo, setFTipo]       = useState<UserType>('Standard')

  function handleInvite() {
    if (!fNome.trim() || !fEmail.trim()) return
    const newUser: TenantUser = {
      id: String(Date.now()),
      nome: fNome.trim(),
      email: fEmail.trim(),
      tipo: fTipo,
      status: 'Ativo',
    }
    setUsers(prev => [...prev, newUser])
    setFNome(''); setFEmail(''); setFTipo('Standard'); setShowForm(false)
  }

  function handleToggleFilialUser(filialId: string, userId: string) {
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
    if (!window.confirm(`${u.status === 'Ativo' ? 'Desativar' : 'Reativar'} usuário ${u.nome}?`)) return
    setUsers(prev => prev.map(x => x.id === u.id ? { ...x, status: x.status === 'Ativo' ? 'Inativo' : 'Ativo' } : x))
  }

  const COLUNAS: TabelaGlobalColuna<TenantUser>[] = [
    {
      key: 'nome', label: 'Usuário', tipo: 'texto',
      tooltipTitulo: 'Nome Completo', tooltipDescricao: 'Nome cadastrado do usuário.',
      render: (v, item) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
          <div style={{
            width: 32, height: 32, minWidth: 32, borderRadius: '50%',
            background: item.tipo === 'Master' ? 'rgba(56,189,248,0.2)' : item.tipo === 'Fornecedor' ? 'rgba(245,158,11,0.15)' : 'rgba(255,255,255,0.07)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700,
            color: item.tipo === 'Master' ? '#38bdf8' : item.tipo === 'Fornecedor' ? '#fbbf24' : '#94a3b8',
          }}>
            {item.nome.split(' ').map(n => n[0]).join('').slice(0, 2)}
          </div>
          <span style={{ fontWeight: 600 }}>{item.nome}</span>
        </div>
      )
    },
    {
      key: 'email', label: 'E-mail', tipo: 'texto',
      tooltipTitulo: 'E-mail de Acesso', tooltipDescricao: 'E-mail utilizado no login.',
      render: (v) => <span style={{ color: 'var(--ws-muted)' }}>{v}</span>
    },
    {
      key: 'tipo', label: 'Tipo', tipo: 'texto',
      tooltipTitulo: 'Perfil Base', tooltipDescricao: 'Nível de permissão principal do usuário na plataforma',
      render: (v) => <span style={{ padding: '0.2rem 0.6rem', borderRadius: '9999px', fontSize: '0.6875rem', fontWeight: 700, letterSpacing: '0.04em', ...(v === 'Master' ? { color: '#38bdf8', background: 'rgba(56,189,248,0.1)' } : v === 'Fornecedor' ? { color: '#fbbf24', background: 'rgba(245,158,11,0.1)' } : { color: '#94a3b8', background: 'rgba(255,255,255,0.05)' }) }}>{v}</span>
    },
    {
      key: 'status', label: 'Status', tipo: 'texto',
      tooltipTitulo: 'Status Operacional', tooltipDescricao: 'Indica se o acesso está desbloqueado.',
      render: (v) => <span style={{ display: 'inline-flex', padding: '0.2rem 0.625rem', borderRadius: '9999px', fontSize: '0.6875rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', background: v === 'Ativo' ? 'rgba(52,211,153,0.12)' : 'rgba(248,113,113,0.12)', color: v === 'Ativo' ? '#34d399' : '#f87171', border: `1px solid ${v === 'Ativo' ? 'rgba(52,211,153,0.2)' : 'rgba(248,113,113,0.2)'}` }}>{v}</span>
    }
  ]

  const ACOES: TabelaGlobalAcao<TenantUser>[] = [
    {
      id: 'suspend',
      icone: <PauseCircle size={16} weight="bold" />, // Será atualizado condicionalmente
      tooltip: 'Desativar/Reativar',
      onClick: handleDeactivate,
      renderCustom: (item) => (
        <button
          type="button"
          title={item.status === 'Ativo' ? 'Desativar' : 'Reativar'}
          onClick={() => handleDeactivate(item)}
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 28, height: 28, borderRadius: '50%', background: 'transparent', border: '1px solid transparent', color: '#64748b', cursor: 'pointer', transition: 'all 0.15s', flexShrink: 0 }}
          onMouseEnter={ev => { ev.currentTarget.style.background = item.status === 'Ativo' ? 'rgba(251,191,36,0.12)' : 'rgba(52,211,153,0.12)'; ev.currentTarget.style.borderColor = item.status === 'Ativo' ? 'rgba(251,191,36,0.3)' : 'rgba(52,211,153,0.3)'; ev.currentTarget.style.color = item.status === 'Ativo' ? '#fbbf24' : '#34d399' }}
          onMouseLeave={ev => { ev.currentTarget.style.background = 'transparent'; ev.currentTarget.style.borderColor = 'transparent'; ev.currentTarget.style.color = '#64748b' }}
        >
          {item.status === 'Ativo' ? <PauseCircle size={16} weight="bold" /> : <PlayCircle size={16} weight="bold" />}
        </button>
      )
    },
    {
      id: 'edit',
      icone: <PencilSimple size={15} weight="bold" />,
      tooltip: 'Editar',
      onClick: () => {},
    },
    {
      id: 'delete',
      icone: <Trash size={15} weight="bold" />,
      tooltip: 'Excluir',
      onClick: () => {},
      onRenderStyle: () => ({ background: 'rgba(248,113,113,0.12)', borderColor: 'rgba(248,113,113,0.3)', color: '#f87171' })
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

  // Computa empresas vinculadas por usuário via VINCULOS
  function empresasDoUsuario(userId: string): Filial[] {
    const ids = VINCULOS[userId] ?? []
    return filiais.filter(f => ids.includes(f.id))
  }

  const COLUNAS_FILIAIS: TabelaGlobalColuna<TenantUser>[] = [
    {
      key: 'nome', label: 'Usuário', tipo: 'texto',
      tooltipTitulo: 'Usuário', tooltipDescricao: 'Identificação principal do usuário na plataforma',
      render: (_, item) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
          <div style={{
            width: 32, height: 32, minWidth: 32, borderRadius: '50%',
            background: item.tipo === 'Master' ? 'rgba(56,189,248,0.2)' : item.tipo === 'Fornecedor' ? 'rgba(245,158,11,0.15)' : 'rgba(255,255,255,0.07)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700,
            color: item.tipo === 'Master' ? '#38bdf8' : item.tipo === 'Fornecedor' ? '#fbbf24' : '#94a3b8',
          }}>
            {item.nome.split(' ').map(n => n[0]).join('').slice(0, 2)}
          </div>
          <span style={{ fontWeight: 600 }}>{item.nome}</span>
        </div>
      )
    },
    {
      key: 'email', label: 'E-mail', tipo: 'texto',
      tooltipTitulo: 'E-mail de Acesso', tooltipDescricao: 'E-mail utilizado no login.',
      render: (v) => <span style={{ color: 'var(--ws-muted)' }}>{v}</span>
    },
    {
      key: 'tipo', label: 'Tipo', tipo: 'texto',
      tooltipTitulo: 'Perfil Base', tooltipDescricao: 'Tipo de acesso do usuário.',
      render: (v) => <span style={{ padding: '0.2rem 0.6rem', borderRadius: '9999px', fontSize: '0.6875rem', fontWeight: 700, letterSpacing: '0.04em', ...(v === 'Master' ? { color: '#38bdf8', background: 'rgba(56,189,248,0.1)' } : v === 'Fornecedor' ? { color: '#fbbf24', background: 'rgba(245,158,11,0.1)' } : { color: '#94a3b8', background: 'rgba(255,255,255,0.05)' }) }}>{v}</span>
    },
    {
      key: 'id', label: 'Empresas vinculadas', tipo: 'texto',
      tooltipTitulo: 'Empresas vinculadas', tooltipDescricao: 'Empresas filhas às quais este usuário tem acesso.',
      render: (_, item) => {
        const isMaster = item.tipo === 'Master'
        const empresas = isMaster ? filiais : empresasDoUsuario(item.id)
        return <EmpresasAcessoCell empresas={empresas} isMaster={isMaster} />
      }
    },
  ]

  const COLUNAS_EXPORT_FILIAIS: ColunasExport[] = [
    { header: 'Nome',    key: 'nome'  },
    { header: 'E-mail',  key: 'email' },
    { header: 'Tipo',    key: 'tipo'  },
  ]
  const OPCOES_EXPORT_FILIAIS = { nomeArquivo: 'acesso-por-empresa-filha', titulo: 'Acesso por Empresa Filha' }

  const ACOES_EXPORT_FILIAIS: TabelaExportAcao<TenantUser>[] = [
    { label: 'Excel (.xlsx)', icone: <FileXls size={14} weight="bold" />, onClick: (dados) => void exportarExcel(dados as any, COLUNAS_EXPORT_FILIAIS, OPCOES_EXPORT_FILIAIS) },
    { label: 'CSV',           icone: <FileCsv  size={14} weight="bold" />, onClick: (dados) => void exportarCSV(dados as any, COLUNAS_EXPORT_FILIAIS, OPCOES_EXPORT_FILIAIS) },
    { label: 'TXT',           icone: <FileText size={14} weight="bold" />, onClick: (dados) => void exportarTXT(dados as any, COLUNAS_EXPORT_FILIAIS, OPCOES_EXPORT_FILIAIS) },
    { label: 'XML',           icone: <Code     size={14} weight="bold" />, onClick: (dados) => void exportarXML(dados as any, COLUNAS_EXPORT_FILIAIS, OPCOES_EXPORT_FILIAIS) },
    { label: 'PDF',           icone: <FilePdf  size={14} weight="bold" />, onClick: (dados) => void exportarPDF(dados as any, COLUNAS_EXPORT_FILIAIS, OPCOES_EXPORT_FILIAIS) },
    { label: 'JSON',          icone: <Code     size={14} weight="bold" />, onClick: (dados) => void exportarJSON(dados as any, COLUNAS_EXPORT_FILIAIS, OPCOES_EXPORT_FILIAIS) },
  ]

  return (
    <div className="ws-fade-up">
      <CabecalhoGlobal
        icone={<Users weight="duotone" size={22} />}
        titulo="Usuários & Permissões"
        subtitulo="Gerencie quem pode acessar a plataforma e em quais empresas cada pessoa está habilitada."
      />

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', margin: '1.5rem 0' }}>
        <div className="ws-tabs" style={{ margin: 0 }}>
          <button className={`ws-tab${tab === 'tenant' ? ' active' : ''}`} onClick={() => setTab('tenant')}>
            Perfis de Acesso
          </button>
          <button className={`ws-tab${tab === 'filiais' ? ' active' : ''}`} onClick={() => setTab('filiais')}>
            Acesso por Empresa Filha
          </button>
        </div>

        {tab === 'tenant' && (
          <BotaoNovoGlobal
            rotulo="Convidar Usuário"
            rotuloAtivo="Cancelar"
            ativo={showForm}
            onClick={() => setShowForm(v => !v)}
          />
        )}
      </div>

      {tab === 'tenant' && (
        <>
          {showForm && (
            <div className="ws-form-card ws-fade-up" style={{ marginBottom: '1.5rem' }}>
              <p className="ws-section-title">
                <Users weight="duotone" size={14} color="#38bdf8" />
                Convidar Usuário
              </p>
              <div className="ws-form-row">
                <div className="ws-field">
                  <label>Nome Completo</label>
                  <input placeholder="Ex: Ana Paula" value={fNome} onChange={e => setFNome(e.target.value)} />
                </div>
                <div className="ws-field">
                  <label>E-mail</label>
                  <input type="email" placeholder="usuario@empresa.com" value={fEmail} onChange={e => setFEmail(e.target.value)} />
                </div>
                <div className="ws-field">
                  <label>Tipo de Usuário</label>
                  <select value={fTipo} onChange={e => setFTipo(e.target.value as UserType)}>
                    <option value="Standard">Standard — Acesso conforme permissões</option>
                    <option value="Master">Master — Acesso total</option>
                    <option value="Fornecedor">Fornecedor — Acesso externo granular</option>
                  </select>
                </div>
              </div>
              <div className="ws-form-actions">
                <BotaoGlobal
                  variante="primario"
                  onClick={handleInvite}
                  disabled={!fNome.trim() || !fEmail.trim()}
                >
                  Enviar Convite
                </BotaoGlobal>
                <BotaoGlobal
                  variante="fantasma"
                  onClick={() => { setShowForm(false); setFNome(''); setFEmail('') }}
                >
                  Cancelar
                </BotaoGlobal>
              </div>
            </div>
          )}

          <div style={{ position: 'relative', zIndex: 10 }}>
            <TabelaGlobal<TenantUser>
              dados={users}
              colunas={COLUNAS}
              acoes={ACOES}
              acoesExportacao={ACOES_EXPORT}
              mensagemVazio="Nenhum usuário encontrado na busca."
              mensagemSemFiltro="Nenhum usuário cadastrado na sua conta corporativa."
            />
          </div>
        </>
      )}

      {tab === 'filiais' && (
        <div className="ws-fade-up">
          <TabelaGlobal<TenantUser>
            dados={users}
            colunas={COLUNAS_FILIAIS}
            acoesExportacao={ACOES_EXPORT_FILIAIS}
            mensagemVazio="Nenhum usuário encontrado na busca."
            mensagemSemFiltro="Nenhum usuário cadastrado."
          />
        </div>
      )}
    </div>
  )
}
