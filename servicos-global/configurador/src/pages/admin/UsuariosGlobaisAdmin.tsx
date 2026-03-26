import React, { useState, useMemo } from 'react'
import {
  Users, UserCircleCheck, UserCircleMinus,
  PauseCircle, PlayCircle, PencilSimple,
  FileXls, FileCsv, FileText, FilePdf, Code, ChartPieSlice, Key, Buildings, User, EnvelopeSimple, ShieldCheck, Crown, Lightning
} from '@phosphor-icons/react'
import { SelectGlobal, type SelectOpcao } from '@nucleo/select-global'

import { PaginaGlobal } from '@nucleo/pagina-global'
import { CabecalhoGlobal } from '@nucleo/cabecalho-global'
import { TabelaCamadasGlobal, type TCGColuna, type TCGAcao, type TCGAcaoExport } from '@nucleo/tabela-camadas-global'
import { BotaoGlobal } from '@nucleo/botao-global'
import { CardBasicoGlobal, CardGraficoGlobal, type PeriodoTendencia } from '@nucleo/card-global'
import { TooltipGlobal } from '@nucleo/tooltip-global'
import { ModalFormularioGlobal } from '@nucleo/modal-formulario-global'
import { GeralCampoGlobal } from '@nucleo/geral-campo-global'
import { exportarExcel, exportarCSV, exportarTXT, exportarXML, exportarJSON, exportarPDF, type ColunasExport } from '../../services/exportService'
import { ModalEditarUsuario } from '../workspace/ModalEditarUsuario'
import { type NivelAcesso, type UserStatus } from '../../types/niveis-acesso'

// ─── Tipos globais ─────────────────────────────────────────────────────────────
// Documentação central em src/types/niveis-acesso.ts

interface GlobalUserSpace {
  id: string;
  nome: string;
  subdominio: string;
  perfil: string;
}

// GlobalUser é compatível com TenantUser mas tem tipo mais amplo
interface GlobalUser {
  id: string
  nome: string
  email: string
  tipo: NivelAcesso
  status: UserStatus
  organizacao: string
  espacos: GlobalUserSpace[]
}

// ─── Mock de organizações ───────────────────────────────────────────────────────
const ORGS = [
  'Gravity HQ',
  'Importes SA', 'Acme Logística', 'TechVision Ltda', 'Prime Distribuidora',
  'Global Commerce', 'NovaTech', 'Alpha Supply', 'Beta Serviços',
  'Gamma Soluções', 'Delta Empresas',
]

// ─── Mock: todos os usuários da plataforma (somatória de todas as orgs) ─────────
const mockAllUsers: GlobalUser[] = [
  // ── Gravity HQ — Super Admins da plataforma ──────────────────────────────────
  { id: 'sa01', nome: 'Daniel Martins Mendes', email: 'dmmltda@gmail.com',          tipo: 'Super Admin', status: 'Ativo',   organizacao: 'Gravity HQ', espacos: [{ id: 'e1', nome: 'Núcleo Central', subdominio: 'admin', perfil: 'Super Admin' }] },
  { id: 'sa02', nome: 'Lucas Ferreira',        email: 'lucas@gravity.com.br',       tipo: 'Super Admin', status: 'Ativo',   organizacao: 'Gravity HQ', espacos: [{ id: 'e1', nome: 'Núcleo Central', subdominio: 'admin', perfil: 'Super Admin' }] },
  { id: 'sa03', nome: 'Mariana Costa',         email: 'mariana@gravity.com.br',     tipo: 'Super Admin', status: 'Ativo',   organizacao: 'Gravity HQ', espacos: [{ id: 'e1', nome: 'Núcleo Central', subdominio: 'admin', perfil: 'Super Admin' }] },
  // ── Importes SA ──────────────────────────────────────────────────────────────
  { id: 'g01', nome: 'Daniel Marques',      email: 'daniel@importes.com.br',    tipo: 'Master',     status: 'Ativo',   organizacao: 'Importes SA', espacos: Array.from({ length: 50 }, (_, i) => ({ id: `e01-${i}`, nome: `Importes Filial ${i + 1}`, subdominio: `importes-f${i+1}`, perfil: i % 5 === 0 ? 'Master' : 'Standard' })) },
  { id: 'g02', nome: 'Carla Souza',         email: 'carla@importes.com.br',     tipo: 'Master',     status: 'Ativo',   organizacao: 'Importes SA', espacos: [{ id: 'e2', nome: 'Importes Matriz', subdominio: 'importes', perfil: 'Master' }] },
  { id: 'g03', nome: 'Felipe Lima',         email: 'felipe@importes.com.br',    tipo: 'Standard',   status: 'Inativo', organizacao: 'Importes SA', espacos: [{ id: 'e2', nome: 'Importes Matriz', subdominio: 'importes', perfil: 'Standard' }] },
  { id: 'g04', nome: 'Rodrigo Faria',       email: 'rodrigo@importes.com.br',   tipo: 'Standard',   status: 'Ativo',   organizacao: 'Importes SA', espacos: [{ id: 'e2', nome: 'Importes Matriz', subdominio: 'importes', perfil: 'Standard' }] },
  { id: 'g05', nome: 'Ana Beatriz Costa',   email: 'ana@importes.com.br',       tipo: 'Standard',   status: 'Ativo',   organizacao: 'Importes SA', espacos: [{ id: 'e2', nome: 'Importes Matriz', subdominio: 'importes', perfil: 'Standard' }, { id: 'e3', nome: 'Importes Filial', subdominio: 'importes-rj', perfil: 'Standard' }] },
  // Acme Logística
  { id: 'g06', nome: 'Paulo Henrique',      email: 'paulo@acme.com.br',         tipo: 'Master',     status: 'Ativo',   organizacao: 'Acme Logística', espacos: [{ id: 'e4', nome: 'Acme SP', subdominio: 'acme-sp', perfil: 'Master' }] },
  { id: 'g07', nome: 'Juliana Martins',     email: 'juliana@acme.com.br',       tipo: 'Standard',   status: 'Inativo', organizacao: 'Acme Logística', espacos: [{ id: 'e4', nome: 'Acme SP', subdominio: 'acme-sp', perfil: 'Standard' }] },
  { id: 'g08', nome: 'Marcos Oliveira',     email: 'marcos@acme.com.br',        tipo: 'Standard',   status: 'Ativo',   organizacao: 'Acme Logística', espacos: [{ id: 'e4', nome: 'Acme SP', subdominio: 'acme-sp', perfil: 'Standard' }] },
  { id: 'g09', nome: 'Fernanda Rocha',      email: 'fernanda@acme.com.br',      tipo: 'Fornecedor', status: 'Ativo',   organizacao: 'Acme Logística', espacos: [{ id: 'e4', nome: 'Acme SP', subdominio: 'acme-sp', perfil: 'Fornecedor' }] },
  // TechVision
  { id: 'g10', nome: 'Gustavo Almeida',     email: 'gustavo@techvision.com',    tipo: 'Master',     status: 'Ativo',   organizacao: 'TechVision Ltda', espacos: [{ id: 'e5', nome: 'TechVision', subdominio: 'techv', perfil: 'Master' }] },
  { id: 'g11', nome: 'Tatiane Ferreira',    email: 'tatiane@techvision.com',    tipo: 'Standard',   status: 'Inativo', organizacao: 'TechVision Ltda', espacos: [{ id: 'e5', nome: 'TechVision', subdominio: 'techv', perfil: 'Standard' }] },
  { id: 'g12', nome: 'Bruno Cardoso',       email: 'bruno@techvision.com',      tipo: 'Standard',   status: 'Ativo',   organizacao: 'TechVision Ltda', espacos: [{ id: 'e5', nome: 'TechVision', subdominio: 'techv', perfil: 'Standard' }] },
  { id: 'g13', nome: 'Larissa Mendes',      email: 'larissa@techvision.com',    tipo: 'Standard',   status: 'Ativo',   organizacao: 'TechVision Ltda', espacos: [{ id: 'e5', nome: 'TechVision', subdominio: 'techv', perfil: 'Standard' }] },
  // Prime Distribuidora
  { id: 'g14', nome: 'Thiago Nascimento',   email: 'thiago@prime.com.br',       tipo: 'Master',     status: 'Ativo',   organizacao: 'Prime Distribuidora', espacos: [{ id: 'e6', nome: 'Prime HQ', subdominio: 'prime', perfil: 'Master' }] },
  { id: 'g15', nome: 'Patrícia Lopes',      email: 'patricia@prime.com.br',     tipo: 'Standard',   status: 'Ativo',   organizacao: 'Prime Distribuidora', espacos: [{ id: 'e6', nome: 'Prime HQ', subdominio: 'prime', perfil: 'Standard' }] },
  { id: 'g16', nome: 'Eduardo Silva',       email: 'eduardo@prime.com.br',      tipo: 'Standard',   status: 'Inativo', organizacao: 'Prime Distribuidora', espacos: [{ id: 'e6', nome: 'Prime HQ', subdominio: 'prime', perfil: 'Standard' }] },
  // Global Commerce
  { id: 'g17', nome: 'Camila Santos',       email: 'camila@globalcommerce.com', tipo: 'Master',     status: 'Ativo',   organizacao: 'Global Commerce', espacos: [{ id: 'e7', nome: 'Global Hub', subdominio: 'global', perfil: 'Master' }] },
  { id: 'g18', nome: 'Leandro Pereira',     email: 'leandro@globalcommerce.com',tipo: 'Standard',   status: 'Ativo',   organizacao: 'Global Commerce', espacos: [{ id: 'e7', nome: 'Global Hub', subdominio: 'global', perfil: 'Standard' }] },
  { id: 'g19', nome: 'Vanessa Ribeiro',     email: 'vanessa@globalcommerce.com',tipo: 'Standard',   status: 'Ativo',   organizacao: 'Global Commerce', espacos: [{ id: 'e7', nome: 'Global Hub', subdominio: 'global', perfil: 'Standard' }] },
  { id: 'g20', nome: 'Ricardo Gomes',       email: 'ricardo@globalcommerce.com',tipo: 'Fornecedor', status: 'Inativo', organizacao: 'Global Commerce', espacos: [{ id: 'e7', nome: 'Global Hub', subdominio: 'global', perfil: 'Fornecedor' }] },
  // NovaTech
  { id: 'g21', nome: 'Aline Correia',       email: 'aline@novatech.io',         tipo: 'Master',     status: 'Ativo',   organizacao: 'NovaTech', espacos: [{ id: 'e8', nome: 'NovaTech', subdominio: 'nova', perfil: 'Master' }] },
  { id: 'g22', nome: 'Vinicius Carvalho',   email: 'vinicius@novatech.io',      tipo: 'Standard',   status: 'Ativo',   organizacao: 'NovaTech', espacos: [{ id: 'e8', nome: 'NovaTech', subdominio: 'nova', perfil: 'Standard' }] },
  { id: 'g23', nome: 'Renata Barbosa',      email: 'renata@novatech.io',        tipo: 'Standard',   status: 'Ativo',   organizacao: 'NovaTech', espacos: [{ id: 'e8', nome: 'NovaTech', subdominio: 'nova', perfil: 'Standard' }] },
  // Alpha Supply
  { id: 'g24', nome: 'Sérgio Moraes',       email: 'sergio@alphasupply.com.br', tipo: 'Master',     status: 'Ativo',   organizacao: 'Alpha Supply', espacos: [{ id: 'e9', nome: 'Alpha Sup', subdominio: 'alpha', perfil: 'Master' }] },
  { id: 'g25', nome: 'Isabela Teixeira',    email: 'isabela@alphasupply.com.br',tipo: 'Standard',   status: 'Inativo', organizacao: 'Alpha Supply', espacos: [{ id: 'e9', nome: 'Alpha Sup', subdominio: 'alpha', perfil: 'Standard' }] },
  // Beta Serviços
  { id: 'g26', nome: 'Diego Cunha',         email: 'diego@beta.com.br',         tipo: 'Master',     status: 'Ativo',   organizacao: 'Beta Serviços', espacos: [{ id: 'e10', nome: 'Beta HQ', subdominio: 'beta', perfil: 'Master' }] },
  { id: 'g27', nome: 'Priscila Vieira',     email: 'priscila@beta.com.br',      tipo: 'Standard',   status: 'Ativo',   organizacao: 'Beta Serviços', espacos: [{ id: 'e10', nome: 'Beta HQ', subdominio: 'beta', perfil: 'Standard' }] },
  // Gamma Soluções
  { id: 'g28', nome: 'Fábio Araújo',        email: 'fabio@gamma.io',            tipo: 'Master',     status: 'Ativo',   organizacao: 'Gamma Soluções', espacos: [{ id: 'e11', nome: 'Gamma Hub', subdominio: 'gamma', perfil: 'Master' }] },
  { id: 'g29', nome: 'Monique Dias',        email: 'monique@gamma.io',          tipo: 'Standard',   status: 'Ativo',   organizacao: 'Gamma Soluções', espacos: [{ id: 'e11', nome: 'Gamma Hub', subdominio: 'gamma', perfil: 'Standard' }] },
  { id: 'g30', nome: 'Henrique Cavalcanti', email: 'henrique@gamma.io',         tipo: 'Fornecedor', status: 'Inativo', organizacao: 'Gamma Soluções', espacos: [{ id: 'e11', nome: 'Gamma Hub', subdominio: 'gamma', perfil: 'Fornecedor' }] },
  // Delta Empresas
  { id: 'g31', nome: 'Sabrina Pinto',       email: 'sabrina@delta.com.br',      tipo: 'Master',     status: 'Ativo',   organizacao: 'Delta Empresas', espacos: [{ id: 'e12', nome: 'Delta Group', subdominio: 'delta', perfil: 'Master' }] },
  { id: 'g32', nome: 'Caio Rezende',        email: 'caio@delta.com.br',         tipo: 'Standard',   status: 'Ativo',   organizacao: 'Delta Empresas', espacos: [{ id: 'e12', nome: 'Delta Group', subdominio: 'delta', perfil: 'Standard' }] },
  { id: 'g33', nome: 'Letícia Castro',      email: 'leticia@delta.com.br',      tipo: 'Standard',   status: 'Ativo',   organizacao: 'Delta Empresas', espacos: [{ id: 'e12', nome: 'Delta Group', subdominio: 'delta', perfil: 'Standard' }] },
  { id: 'g34', nome: 'Omar Khalil',         email: 'omar@delta.com.br',         tipo: 'Standard',   status: 'Inativo', organizacao: 'Delta Empresas', espacos: [{ id: 'e12', nome: 'Delta Group', subdominio: 'delta', perfil: 'Standard' }] },
]

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
  { valor: 'Standard',    rotulo: 'Standard',    descricao: 'Usuário operacional vinculado a espaços específicos', meta: { icone: <User size={16} weight="duotone" color="#94a3b8" /> } },
  { valor: 'Master',      rotulo: 'Master',      descricao: 'Gestor máximo da organização (acesso total no tenant)', meta: { icone: <Crown size={16} weight="duotone" color="#818cf8" /> } },
  { valor: 'Admin',       rotulo: 'Admin',       descricao: 'Administrador da plataforma com permissões específicas', meta: { icone: <ShieldCheck size={16} weight="duotone" color="#06b6d4" /> } },
  { valor: 'Super Admin', rotulo: 'Super Admin', descricao: 'Controle total global da plataforma (todas as orgs)', meta: { icone: <Lightning size={16} weight="duotone" color="#22c55e" /> } },
]

export function UsuariosGlobaisAdmin() {
  // Mock do usuário logado — No futuro, recuperar de um AuthContext
  const [perfilLogado] = useState<NivelAcesso>('Super Admin')

  const [users, setUsers] = useState<GlobalUser[]>(mockAllUsers)

  const [showForm, setShowForm]   = useState(false)
  const [fNome, setFNome]         = useState('')
  const [fEmail, setFEmail]       = useState('')
  const [fTipo, setFTipo]         = useState<NivelAcesso>('Standard')
  const [fOrg, setFOrg]           = useState(ORGS[0])

  // Filtro de opções com base no perfil logado
  const opcoesDisponiveis = useMemo(() => {
    if (perfilLogado === 'Super Admin') return OPCOES_TIPO_ADMIN
    // Admin não pode criar Super Admin
    return OPCOES_TIPO_ADMIN.filter(op => op.valor !== 'Super Admin')
  }, [perfilLogado])

  const [usuarioEditando, setUsuarioEditando] = useState<GlobalUser | null>(null)
  const [abaEditando, setAbaEditando]         = useState<string>('dados')

  function handleInvite() {
    if (!fNome.trim() || !fEmail.trim()) return
    const newUser: GlobalUser = {
      id: String(Date.now()),
      nome: fNome.trim(),
      email: fEmail.trim(),
      tipo: fTipo,
      status: 'Ativo',
      organizacao: fOrg,
      espacos: [{ id: String(Date.now() + 1), nome: fOrg + ' Principal', subdominio: fOrg.toLowerCase().replace(/\s/g, ''), perfil: fTipo }]
    }
    setUsers(prev => [...prev, newUser])
    setFNome(''); setFEmail(''); setFTipo('Standard'); setFOrg(ORGS[0]); setShowForm(false)
  }

  function handleToggleStatus(u: GlobalUser) {
    setUsers(prev => prev.map(x => x.id === u.id ? { ...x, status: x.status === 'Ativo' ? 'Inativo' : 'Ativo' } : x))
  }

  // ─── Colunas ────────────────────────────────────────────────────────────────
  const COLUNAS: TCGColuna<GlobalUser>[] = [
    {
      key: 'nome', label: 'Usuário', tipo: 'texto',
      tooltipTitulo: 'Nome Completo', tooltipDescricao: 'Nome cadastrado do usuário na plataforma.',
      render: (_, item) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
          <div style={{
            width: 32, height: 32, minWidth: 32, borderRadius: '50%',
            background: item.tipo === 'Super Admin' ? 'rgba(34,197,94,0.2)' : item.tipo === 'Admin' ? 'rgba(6,182,212,0.15)' : item.tipo === 'Master' ? 'rgba(129,140,248,0.2)' : item.tipo === 'Fornecedor' ? 'rgba(245,158,11,0.15)' : 'rgba(255,255,255,0.07)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700,
            color: item.tipo === 'Super Admin' ? '#22c55e' : item.tipo === 'Admin' ? '#06b6d4' : item.tipo === 'Master' ? '#818cf8' : item.tipo === 'Fornecedor' ? '#fbbf24' : '#94a3b8',
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
      key: 'organizacao', label: 'Organização', tipo: 'texto',
      tooltipTitulo: 'Organização de Origem', tooltipDescricao: 'Empresa/tenant ao qual este usuário está vinculado.',
      render: (v) => <OrgBadge nome={v as string} />
    },
    {
      key: 'tipo', label: 'Tipo', tipo: 'texto',
      tooltipTitulo: 'Perfil Base', tooltipDescricao: 'Nível de permissão principal do usuário.',
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
      key: 'status', label: 'Status', tipo: 'texto',
      tooltipTitulo: 'Status Operacional', tooltipDescricao: 'Indica se o acesso está desbloqueado.',
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

  const COLUNAS_FILHAS: TCGColuna<GlobalUserSpace>[] = [
    {
      key: 'nome', label: 'Espaço de Trabalho',
      render: (_v, item) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{ width: 24, height: 24, minWidth: 24, borderRadius: '6px', background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.5625rem', fontWeight: 700, color: '#34d399' }}>
            {item.nome.charAt(0)}
          </div>
          <span style={{ fontWeight: 500 }}>{item.nome}</span>
        </div>
      )
    },
    {
      key: 'subdominio', label: 'Subdomínio',
      render: (_v, item) => (
        <code style={{ fontSize: '0.8rem', color: '#a5b4fc', background: 'rgba(165,180,252,0.08)', padding: '0.1rem 0.35rem', borderRadius: '4px' }}>
          {item.subdominio}.gravity.com.br
        </code>
      )
    },
    {
      key: 'org_vazia', label: '',
      render: () => <span />
    },
    {
      key: 'perfil', label: 'Perfil de Acesso',
      render: (v) => (
        <span style={{ color: '#8b5cf6', fontWeight: 600, fontSize: '0.8125rem' }}>{v as string}</span>
      )
    },
    {
      key: 'status', label: '',
      render: () => <span />
    }
  ]

  // ─── Ações ──────────────────────────────────────────────────────────────────
  const ACOES: TCGAcao<GlobalUser>[] = [
    {
      id: 'permissions',
      icone: <Key size={15} weight="bold" />,
      tooltip: 'Permissões do Usuário',
      onClick: (u) => { setUsuarioEditando(u); setAbaEditando('permissoes') },
    },
    {
      id: 'suspend',
      icone: <PauseCircle size={16} weight="bold" />,
      tooltip: 'Desativar/Reativar',
      onClick: handleToggleStatus,
      renderCustom: (item) => (
        <TooltipGlobal descricao={item.status === 'Ativo' ? 'Suspender o acesso deste usuário' : 'Reativar o acesso deste usuário'}>
          <button
            type="button"
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleToggleStatus(item) }}
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
    },
  ]

  // ─── Exportação ─────────────────────────────────────────────────────────────
  const COLUNAS_EXPORT: ColunasExport[] = [
    { header: 'Nome',          key: 'nome'         },
    { header: 'E-mail',        key: 'email'        },
    { header: 'Organização',   key: 'organizacao'  },
    { header: 'Tipo',          key: 'tipo'         },
    { header: 'Status',        key: 'status'       },
  ]
  const OPCOES_EXPORT = { nomeArquivo: 'usuarios-globais', titulo: 'Usuários Globais da Plataforma' }

  const ACOES_EXPORT: TCGAcaoExport[] = [
    { label: 'Excel (.xlsx)', icone: <FileXls size={14} weight="bold" />, onClick: () => void exportarExcel(users as any, COLUNAS_EXPORT, OPCOES_EXPORT) },
    { label: 'CSV',           icone: <FileCsv  size={14} weight="bold" />, onClick: () => void exportarCSV(users as any,   COLUNAS_EXPORT, OPCOES_EXPORT) },
    { label: 'TXT',           icone: <FileText size={14} weight="bold" />, onClick: () => void exportarTXT(users as any,   COLUNAS_EXPORT, OPCOES_EXPORT) },
    { label: 'XML',           icone: <Code     size={14} weight="bold" />, onClick: () => void exportarXML(users as any,   COLUNAS_EXPORT, OPCOES_EXPORT) },
    { label: 'PDF',           icone: <FilePdf  size={14} weight="bold" />, onClick: () => void exportarPDF(users as any,   COLUNAS_EXPORT, OPCOES_EXPORT) },
    { label: 'JSON',          icone: <Code     size={14} weight="bold" />, onClick: () => void exportarJSON(users as any,  COLUNAS_EXPORT, OPCOES_EXPORT) },
  ]

  // ─── Stats ──────────────────────────────────────────────────────────────────
  const totalUsers    = users.length
  const ativos        = users.filter(u => u.status === 'Ativo').length
  const inativos      = users.filter(u => u.status === 'Inativo').length
  const orgsAtivas    = new Set(users.map(u => u.organizacao)).size

  return (
    <PaginaGlobal
      className="ws-fade-up"
      layout="lista"
      cabecalho={
        <CabecalhoGlobal
          icone={<Users weight="duotone" size={22} />}
          titulo="Usuários Globais"
          subtitulo="Somatória de todos os usuários cadastrados em todas as organizações da plataforma"
        />
      }
      stats={
        <>
          <CardBasicoGlobal
            titulo="Total de Usuários"
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
                <p className="cg-tooltip__title">Total na Plataforma</p>
                <div className="cg-tooltip__row"><span>Total global</span><strong>{totalUsers}</strong></div>
                <div className="cg-tooltip__row"><span>Ativos</span><strong style={{ color: '#34d399' }}>{ativos}</strong></div>
                <div className="cg-tooltip__row"><span>Inativos</span><strong style={{ color: '#f87171' }}>{inativos}</strong></div>
              </>
            }
          />
          <CardBasicoGlobal
            titulo="Usuários Ativos"
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
                <p className="cg-tooltip__title">Acessos Ativos</p>
                <div className="cg-tooltip__row"><span>Usuários ativos</span><strong style={{ color: '#34d399' }}>{ativos}</strong></div>
              </>
            }
          />
          <CardBasicoGlobal
            titulo="Usuários Inativos"
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
                <p className="cg-tooltip__title">Acessos Inativos</p>
                <div className="cg-tooltip__row"><span>Usuários inativos</span><strong style={{ color: '#f87171' }}>{inativos}</strong></div>
              </>
            }
          />
          <CardGraficoGlobal
            className="cg-card--reduced-2px"
            titulo="Organizações com Usuários"
            icone={<ChartPieSlice weight="duotone" size={16} style={{ color: '#8b5cf6' }} />}
            total={ORGS.length}
            valorPrincipal={orgsAtivas}
            corGauge="#8b5cf6"
            legenda={[
              { label: 'Com usuários', valor: orgsAtivas,           cor: '#8b5cf6' },
              { label: 'Sem usuários', valor: ORGS.length - orgsAtivas, cor: '#64748b' },
            ]}
            tooltip={
              <>
                <p className="cg-tooltip__title">Distribuição por Org</p>
                <div className="cg-tooltip__row"><span>Total de orgs</span><strong>{ORGS.length}</strong></div>
                <div className="cg-tooltip__row"><span>Com usuários</span><strong style={{ color: '#8b5cf6' }}>{orgsAtivas}</strong></div>
                <div className="cg-tooltip__divider" />
                <div className="cg-tooltip__row"><span>Total usuários</span><strong>{totalUsers}</strong></div>
              </>
            }
          />
        </>
      }
      acoes={
        <BotaoGlobal
          variante="primario"
          onClick={() => setShowForm(true)}
        >
          Convidar Usuário
        </BotaoGlobal>
      }
    >

      {/* ── Tabela global ────────────────────────────────────────────────── */}
      <div style={{ position: 'relative', zIndex: 10 }}>
        <TabelaCamadasGlobal<GlobalUser, GlobalUserSpace>
          dados={users}
          colunas={COLUNAS}
          colunasFilhas={COLUNAS_FILHAS}
          filhos={u => u.espacos || []}
          acoes={ACOES}
          acoesExportacao={ACOES_EXPORT}
          mensagemVazio="Nenhum usuário encontrado na busca..."
          placeholderBusca="Localizar usuário..."
          campoBusca="nome"
          itemId={u => u.id}
          expandidosPadrao={['sa01']}
        />
      </div>

      {/* ── Modal Edição ─────────────────────────────────────────────────── */}
      <ModalEditarUsuario
        usuario={usuarioEditando as any}
        abaInicial={abaEditando}
        aoFechar={() => setUsuarioEditando(null)}
        aoSalvar={(uEditado, permissoes) => {
          setUsers(prev => prev.map(u => u.id === uEditado.id ? { ...u, ...uEditado } : u))
          setUsuarioEditando(null)
        }}
      />

      {/* ── Modal Convidar Usuário ────────────────────────────────────────── */}
      <ModalFormularioGlobal
        aberto={showForm}
        aoFechar={() => { setShowForm(false); setFNome(''); setFEmail(''); setFTipo('Standard'); setFOrg(ORGS[0]) }}
        aoSalvar={handleInvite}
        icone={<User size={20} weight="duotone" />}
        titulo="Convidar Usuário"
        subtitulo="Preencha os dados para convidar um novo usuário globalmente"
        tamanho="md"
        altura="560px"
        dirty={!!(fNome || fEmail)}
        podesSalvar={!!(fNome.trim() && fEmail.trim())}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
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
              opcoes={opcoesDisponiveis}
              valor={fTipo}
              aoMudarValor={(v) => setFTipo(v as NivelAcesso)}
              iconeEsquerda={<ShieldCheck size={18} weight="duotone" />}
              buscavel={false}
              placeholder="Selecione o perfil corporativo..."
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

          <GeralCampoGlobal label="ORGANIZAÇÃO">
            <SelectGlobal
              opcoes={ORGS.map(o => ({ valor: o, rotulo: o }))}
              valor={fOrg}
              aoMudarValor={(v) => setFOrg(v as string)}
              iconeEsquerda={<Buildings size={18} weight="duotone" />}
              placeholder="Selecionar organização de destino..."
            />
          </GeralCampoGlobal>
        </div>
      </ModalFormularioGlobal>

    </PaginaGlobal>
  )
}
