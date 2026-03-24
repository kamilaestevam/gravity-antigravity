import React, { useState } from 'react'
import { Users, Plus, X, PauseCircle, PlayCircle, PencilSimple, Trash, FileXls, FileCsv, FileText, FilePdf, Code } from '@phosphor-icons/react'
import { BotaoGlobal } from '@nucleo/botao-global'
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

const mockUsers: TenantUser[] = [
  { id: 'u1', nome: 'Daniel Marques',   email: 'daniel@acme.com.br',   tipo: 'Master',     status: 'Ativo'  },
  { id: 'u2', nome: 'Carla Souza',      email: 'carla@acme.com.br',    tipo: 'Standard',   status: 'Ativo'  },
  { id: 'u3', nome: 'Felipe Lima',      email: 'felipe@acme.com.br',   tipo: 'Standard',   status: 'Inativo' },
  { id: 'u4', nome: 'Fornecedor Alpha', email: 'forn@alpha.com',       tipo: 'Fornecedor', status: 'Ativo'  },
]

const mockFiliais: Filial[] = [
  { id: 'f1', nome: 'Acme Logística', usuarios: [
    { userId: 'u1', role: 'Admin',    habilitado: true  },
    { userId: 'u2', role: 'Operador', habilitado: true  },
    { userId: 'u3', role: 'Leitura',  habilitado: false },
    { userId: 'u4', role: 'Externo',  habilitado: true  },
  ]},
  { id: 'f2', nome: 'Acme Importações', usuarios: [
    { userId: 'u1', role: 'Admin',    habilitado: true  },
    { userId: 'u2', role: 'Operador', habilitado: false },
  ]},
  { id: 'f3', nome: 'Acme Distribuição', usuarios: [
    { userId: 'u1', role: 'Admin',    habilitado: true  },
    { userId: 'u3', role: 'Leitura',  habilitado: true  },
    { userId: 'u4', role: 'Externo',  habilitado: false },
  ]},
]

const typeBadge: Record<UserType, string> = {
  Master:     'ws-badge-accent',
  Standard:   'ws-badge-surface',
  Fornecedor: 'ws-badge-warning',
}

export function Usuarios() {
  const [tab, setTab]         = useState<'tenant' | 'filiais'>('tenant')
  const [users, setUsers]     = useState<TenantUser[]>(mockUsers)
  const [filiais, setFiliais] = useState<Filial[]>(mockFiliais)
  const [selectedFilial, setSelectedFilial] = useState('f1')

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
      tooltipTitulo: 'Perfil Base', tooltipDescricao: 'Tipo de usuário global no tenant.',
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

  const filial = filiais.find(f => f.id === selectedFilial)

  return (
    <div className="ws-fade-up">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ fontSize: '1.375rem', fontWeight: 700, color: 'var(--ws-text)', marginBottom: '0.25rem' }}>
            Usuários &amp; Permissões
          </h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--ws-muted)' }}>
            Gerencie quem pode acessar a plataforma e em quais empresas cada pessoa está habilitada.
          </p>
        </div>
        {tab === 'tenant' && (
          <BotaoGlobal
            variante={showForm ? 'fantasma' : 'primario'}
            icone={showForm ? <X weight="bold" size={15} /> : <Plus weight="bold" size={15} />}
            onClick={() => setShowForm(v => !v)}
          >
            {showForm ? 'Cancelar' : 'Convidar Usuário'}
          </BotaoGlobal>
        )}
      </div>

      <div className="ws-tabs">
        <button className={`ws-tab${tab === 'tenant' ? ' active' : ''}`} onClick={() => setTab('tenant')}>
          Todos os Usuários
        </button>
        <button className={`ws-tab${tab === 'filiais' ? ' active' : ''}`} onClick={() => setTab('filiais')}>
          Acesso por Empresa Filha
        </button>
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

          <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
            <span className="ws-badge ws-badge-accent">Master</span>
            <span style={{ fontSize: '0.75rem', color: 'var(--ws-muted)', alignSelf: 'center' }}>Acesso total · permissões granulares não se aplicam</span>
            <span className="ws-badge ws-badge-surface" style={{ marginLeft: '0.5rem' }}>Standard</span>
            <span style={{ fontSize: '0.75rem', color: 'var(--ws-muted)', alignSelf: 'center' }}>Acesso por produto</span>
            <span className="ws-badge ws-badge-warning" style={{ marginLeft: '0.5rem' }}>Fornecedor</span>
            <span style={{ fontSize: '0.75rem', color: 'var(--ws-muted)', alignSelf: 'center' }}>Externo · permissões obrigatórias</span>
          </div>

          <div style={{ position: 'relative', zIndex: 10 }}>
            <TabelaGlobal<TenantUser>
              dados={users}
              colunas={COLUNAS}
              acoes={ACOES}
              acoesExportacao={ACOES_EXPORT}
              mensagemVazio="Nenhum usuário encontrado na busca."
              mensagemSemFiltro="Nenhum usuário cadastrado neste tenant."
            />
          </div>
        </>
      )}

      {tab === 'filiais' && (
        <div className="ws-fade-up">
          <div className="ws-filter-row">
            <label style={{ fontSize: '0.875rem', color: 'var(--ws-muted)', fontWeight: 500 }}>Empresa Filha:</label>
            <select
              className="ws-select-inline"
              value={selectedFilial}
              onChange={e => setSelectedFilial(e.target.value)}
            >
              {filiais.map(f => (
                <option key={f.id} value={f.id}>{f.nome}</option>
              ))}
            </select>
          </div>

          {filial && (
            <div className="ws-table-wrap">
              <table className="ws-table">
                <thead>
                  <tr>
                    <th>Usuário</th>
                    <th>E-mail</th>
                    <th>Tipo</th>
                    <th>Role na filial</th>
                    <th>Habilitado</th>
                  </tr>
                </thead>
                <tbody>
                  {filial.usuarios.map(fu => {
                    const user = users.find(u => u.id === fu.userId)
                    if (!user) return null
                    return (
                      <tr key={fu.userId}>
                        <td style={{ fontWeight: 600 }}>{user.nome}</td>
                        <td style={{ color: 'var(--ws-muted)', fontSize: '0.875rem' }}>{user.email}</td>
                        <td><span className={`ws-badge ${typeBadge[user.tipo]}`}>{user.tipo}</span></td>
                        <td style={{ color: 'var(--ws-muted)' }}>{fu.role}</td>
                        <td>
                          <label className="ws-toggle">
                            <input
                              type="checkbox"
                              checked={fu.habilitado}
                              onChange={() => handleToggleFilialUser(filial.id, fu.userId)}
                            />
                            <span className="ws-toggle-track" />
                            <span className="ws-toggle-thumb" />
                          </label>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
