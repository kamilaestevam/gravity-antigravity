import React, { useState } from 'react'
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
import { ModalEditarUsuario } from './ModalEditarUsuario'
import { type NivelAcesso, type UserStatus } from '../../types/niveis-acesso'
import { getAcoesExportacaoPadrao } from '../../utils/exportHelper'


// ─── Tipos ────────────────────────────────────────────────────────────────────
// Documentação central em src/types/niveis-acesso.ts

export interface TenantUser {
  id: string
  nome: string
  email: string
  tipo: NivelAcesso
  status: UserStatus
}

type EspacoTrabalho = {
  id: string
  nome: string
  usuarios: { userId: string; role: string; habilitado: boolean }[]
}

// 50 empresas filhas mock
const ALL_FILIAIS: EspacoTrabalho[] = Array.from({ length: 50 }, (_, i) => ({
  id: `f${i + 1}`,
  nome: [
    'Acme Logística', 'Acme Importações', 'Acme Distribuição', 'Acme Exportação', 'Acme Varejo',
    'Acme Tech', 'Acme Sul', 'Acme Norte', 'Acme Leste', 'Acme Oeste',
    'EspacoTrabalho SP Centro', 'EspacoTrabalho SP Interior', 'EspacoTrabalho RJ', 'EspacoTrabalho MG', 'EspacoTrabalho RS',
    'EspacoTrabalho SC', 'EspacoTrabalho PR', 'EspacoTrabalho BA', 'EspacoTrabalho GO', 'EspacoTrabalho DF',
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
const mockEspacos: EspacoTrabalho[] = ALL_FILIAIS

const mockUsers: TenantUser[] = [
  { id: 'u01', nome: 'Daniel Marques',      email: 'daniel@acme.com.br',        tipo: 'Master',     status: 'Ativo'   },
  { id: 'u02', nome: 'Carla Souza',         email: 'carla@acme.com.br',          tipo: 'Master',     status: 'Ativo'   },
  { id: 'u01a', nome: 'Mariana Financeiro', email: 'mariana.fin@acme.com.br',    tipo: 'Admin',      status: 'Ativo'   },
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
  const [users, setUsers]     = useState<TenantUser[]>(mockUsers)
  const [espacos, setFiliais] = useState<EspacoTrabalho[]>(mockEspacos)


  const [showForm, setShowForm] = useState(false)
  const [fNome, setFNome]       = useState('')
  const [fEmail, setFEmail]     = useState('')
  const [fTipo, setFTipo]       = useState<NivelAcesso>('Standard')

  const [usuarioEditando, setUsuarioEditando] = useState<TenantUser | null>(null)
  const [abaEditando, setAbaEditando] = useState<string>('dados')

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
      key: 'nome', label: 'Usuário', tipo: 'texto',
      tooltipTitulo: 'Nome Completo', tooltipDescricao: 'Nome cadastrado do usuário.',
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
      key: 'email', label: 'E-mail', tipo: 'texto',
      tooltipTitulo: 'E-mail de Acesso', tooltipDescricao: 'E-mail utilizado no login.',
      render: (v) => <span style={{ color: 'var(--ws-muted)' }}>{v}</span>
    },
    {
      key: 'tipo', label: 'Tipo', tipo: 'texto',
      tooltipTitulo: 'Perfil Base', tooltipDescricao: 'Nível de permissão principal do usuário na plataforma',
      render: (v) => <span style={{ padding: '0.2rem 0.6rem', borderRadius: '9999px', fontSize: '0.6875rem', fontWeight: 700, letterSpacing: '0.04em', ...(v === 'Master' ? { color: '#818cf8', background: 'rgba(129,140,248,0.1)' } : v === 'Admin' ? { color: '#06b6d4', background: 'rgba(6,182,212,0.1)' } : v === 'Fornecedor' ? { color: '#fbbf24', background: 'rgba(245,158,11,0.1)' } : { color: '#94a3b8', background: 'rgba(255,255,255,0.05)' }) }}>{v as string}</span>
    },
    {
      key: 'status', label: 'Status', tipo: 'texto',
      tooltipTitulo: 'Status Operacional', tooltipDescricao: 'Indica se o acesso está desbloqueado.',
      render: (v) => <span style={{ display: 'inline-flex', padding: '0.2rem 0.625rem', borderRadius: '9999px', fontSize: '0.6875rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', background: v === 'Ativo' ? 'rgba(52,211,153,0.12)' : 'rgba(248,113,113,0.12)', color: v === 'Ativo' ? '#34d399' : '#f87171', border: `1px solid ${v === 'Ativo' ? 'rgba(52,211,153,0.2)' : 'rgba(248,113,113,0.2)'}` }}>{v}</span>
    },
    {
      key: 'id', label: 'Acesso', tipo: 'texto',
      tooltipTitulo: 'Empresas Vinculadas', tooltipDescricao: 'Resumo dos workspaces onde o usuário tem permissão.',
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

  // Computa empresas vinculadas por usuário via VINCULOS
  function espacosDoUsuario(userId: string): EspacoTrabalho[] {
    const ids = VINCULOS[userId] ?? []
    return espacos.filter(f => ids.includes(f.id))
  }

  const COLUNAS_FILIAIS: TabelaGlobalColuna<TenantUser>[] = [
    {
      key: 'nome', label: 'Usuário', tipo: 'texto',
      tooltipTitulo: 'Usuário', tooltipDescricao: 'Identificação principal do usuário na plataforma',
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
      key: 'email', label: 'E-mail', tipo: 'texto',
      tooltipTitulo: 'E-mail de Acesso', tooltipDescricao: 'E-mail utilizado no login.',
      render: (v) => <span style={{ color: 'var(--ws-muted)' }}>{v}</span>
    },
    {
      key: 'tipo', label: 'Tipo', tipo: 'texto',
      tooltipTitulo: 'Perfil Base', tooltipDescricao: 'Tipo de acesso do usuário.',
      render: (v) => <span style={{ padding: '0.2rem 0.6rem', borderRadius: '9999px', fontSize: '0.6875rem', fontWeight: 700, letterSpacing: '0.04em', ...(v === 'Master' ? { color: '#818cf8', background: 'rgba(129,140,248,0.1)' } : v === 'Admin' ? { color: '#06b6d4', background: 'rgba(6,182,212,0.1)' } : v === 'Fornecedor' ? { color: '#fbbf24', background: 'rgba(245,158,11,0.1)' } : { color: '#94a3b8', background: 'rgba(255,255,255,0.05)' }) }}>{v as string}</span>
    },
    {
      key: 'id', label: 'Empresas vinculadas', tipo: 'texto',
      tooltipTitulo: 'Empresas vinculadas', tooltipDescricao: 'Empresas filhas às quais este usuário tem acesso.',
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

  const totalVinculos = users.reduce((acc, u) => acc + (u.tipo === 'Master' ? espacos.length : (VINCULOS[u.id]?.length || 0)), 0)
  const mediaEspacosPorUsuario = users.length ? (totalVinculos / users.length).toFixed(1) : '0'
  const usuariosComAcesso = users.filter(u => u.tipo === 'Master' ? espacos.length > 0 : (VINCULOS[u.id]?.length || 0) > 0).length

  return (
    <PaginaGlobal
      className="ws-fade-up"
      layout="lista"
      cabecalho={
        <CabecalhoGlobal
          icone={<Users weight="duotone" size={22} />}
          titulo="Usuários & Permissões"
          subtitulo="Gerencie quem pode acessar a plataforma e em quais empresas cada pessoa está habilitada"
        />
      }
      stats={
        <>
          <CardBasicoGlobal
            titulo="Total de Usuários"
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
            titulo="Acessos Concedidos"
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
            titulo="Média de Acessos Concedidos"
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
            titulo="Total Workspaces"
            icone={<ChartPieSlice weight="duotone" size={16} style={{ color: '#8b5cf6' }} />}
            total={users.length}
            valorPrincipal={usuariosComAcesso}
            corGauge="#8b5cf6"
            legenda={[
              { label: 'Com acesso', valor: usuariosComAcesso, cor: '#8b5cf6' },
              { label: 'Sem acesso', valor: users.length - usuariosComAcesso, cor: '#64748b' },
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
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', width: '100%', transform: 'translateY(-7px)' }}>
          <TooltipGlobal descricao="Enviar convite para um novo colaborador acessar a plataforma">
            <BotaoGlobal
              variante="primario"
              onClick={() => setShowForm(true)}
              icone={<User size={18} />}
            >
              Convidar Usuário
            </BotaoGlobal>
          </TooltipGlobal>
        </div>
      }
    >

      <div style={{ position: 'relative', zIndex: 10 }}>
        <TabelaGlobal<TenantUser>
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
                      dados={vinculados}
                      tooltipBusca="Filtrar workspaces por nome ou ID comercial"
                      colunas={[
                        { 
                          key: 'nome', 
                          label: 'Nome do Workspace',
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
                        { key: 'id', label: 'ID Técnica', tipo: 'texto', render: (v) => <code style={{ fontSize: '0.625rem', opacity: 0.6 }}>{v as string}</code> },
                        { 
                          key: 'id', label: 'Privilégio', tipo: 'texto', 
                          render: () => (
                            <span style={{ fontSize: '0.75rem', color: 'var(--ws-muted)' }}>
                              {usuario.tipo === 'Master' ? 'Acesso Total (Master)' : 'Acesso Padrão'}
                            </span>
                          )
                        },
                        {
                          key: 'id', label: 'Status no Workspace', tipo: 'texto', align: 'right',
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
      </div>

      {/* Modal Convidar Usuário */}
      <ModalFormularioGlobal
        aberto={showForm}
        aoFechar={() => { setShowForm(false); setFNome(''); setFEmail(''); setFTipo('Standard') }}
        aoSalvar={handleInvite}
        icone={<User size={20} weight="duotone" />}
        titulo="Convidar Usuário"
        subtitulo="Preencha os dados para convidar um novo usuário para o workspace"
        tamanho="md"
        altura="480px"
        dirty={!!(fNome || fEmail)}
        podesSalvar={!!(fNome.trim() && fEmail.trim())}
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
              aoMudarValor={(v) => setFTipo(v as NivelAcesso)}
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
        </div>
      </ModalFormularioGlobal>

      {/* Modal Edição do Usuário */}
      <ModalEditarUsuario
        usuario={usuarioEditando}
        abaInicial={abaEditando}
        aoFechar={() => setUsuarioEditando(null)}
        aoSalvar={(uEditado, permissoes) => {
          setUsers(prev => prev.map(u => u.id === uEditado.id ? uEditado : u))
          setUsuarioEditando(null)
          // Aqui faria algo com `permissoes` para persistir os acessos
        }}
      />
    </PaginaGlobal>
  )
}
