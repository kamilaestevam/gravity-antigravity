import React, { useState } from 'react'
import { Users, Plus, X } from '@phosphor-icons/react'
import { BotaoGlobal } from '@nucleo/botao-global'

type UserType = 'Master' | 'Standard' | 'Fornecedor'
type UserStatus = 'Ativo' | 'Inativo'

type TenantUser = {
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

  // Invite form
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

  function handleDeactivate(userId: string) {
    const u = users.find(x => x.id === userId)!
    if (!window.confirm(`${u.status === 'Ativo' ? 'Desativar' : 'Reativar'} usuário ${u.nome}?`)) return
    setUsers(prev => prev.map(x => x.id === userId ? { ...x, status: x.status === 'Ativo' ? 'Inativo' : 'Ativo' } : x))
  }

  const filial = filiais.find(f => f.id === selectedFilial)

  return (
    <div className="ws-fade-up">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ fontSize: '1.375rem', fontWeight: 700, color: 'var(--ws-text)', marginBottom: '0.25rem' }}>
            Usuários &amp; Permissões
          </h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--ws-muted)' }}>
            Gerencie quem acessa o tenant e cada empresa filha.
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

      {/* Pills tabs */}
      <div className="ws-tabs">
        <button className={`ws-tab${tab === 'tenant' ? ' active' : ''}`} onClick={() => setTab('tenant')}>
          Usuários do Tenant
        </button>
        <button className={`ws-tab${tab === 'filiais' ? ' active' : ''}`} onClick={() => setTab('filiais')}>
          Habilitações por Filial
        </button>
      </div>

      {/* ── TAB 1: Tenant users ── */}
      {tab === 'tenant' && (
        <>
          {/* Invite form */}
          {showForm && (
            <div className="ws-form-card ws-fade-up">
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

          {/* Type legend */}
          <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
            <span className="ws-badge ws-badge-accent">Master</span>
            <span style={{ fontSize: '0.75rem', color: 'var(--ws-muted)', alignSelf: 'center' }}>Acesso total · permissões granulares não se aplicam</span>
            <span className="ws-badge ws-badge-surface" style={{ marginLeft: '0.5rem' }}>Standard</span>
            <span style={{ fontSize: '0.75rem', color: 'var(--ws-muted)', alignSelf: 'center' }}>Acesso por produto</span>
            <span className="ws-badge ws-badge-warning" style={{ marginLeft: '0.5rem' }}>Fornecedor</span>
            <span style={{ fontSize: '0.75rem', color: 'var(--ws-muted)', alignSelf: 'center' }}>Externo · permissões obrigatórias</span>
          </div>

          <div className="ws-table-wrap ws-fade-up ws-fade-up-d1">
            <table className="ws-table">
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>E-mail</th>
                  <th>Tipo</th>
                  <th>Status</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                        <div style={{
                          width: 32, height: 32, borderRadius: '50%',
                          background: u.tipo === 'Master' ? 'rgba(56,189,248,0.2)' : u.tipo === 'Fornecedor' ? 'rgba(245,158,11,0.15)' : 'rgba(255,255,255,0.07)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: '0.75rem', fontWeight: 700,
                          color: u.tipo === 'Master' ? '#38bdf8' : u.tipo === 'Fornecedor' ? '#fbbf24' : '#94a3b8',
                        }}>
                          {u.nome.split(' ').map(n => n[0]).join('').slice(0, 2)}
                        </div>
                        <span style={{ fontWeight: 600 }}>{u.nome}</span>
                      </div>
                    </td>
                    <td style={{ color: 'var(--ws-muted)', fontSize: '0.875rem' }}>{u.email}</td>
                    <td><span className={`ws-badge ${typeBadge[u.tipo]}`}>{u.tipo}</span></td>
                    <td><span className={`ws-badge ${u.status === 'Ativo' ? 'ws-badge-success' : 'ws-badge-danger'}`}>{u.status}</span></td>
                    <td>
                      <BotaoGlobal
                        variante={u.status === 'Ativo' ? 'fantasma' : 'primario'}
                        tamanho="pequeno"
                        onClick={() => handleDeactivate(u.id)}
                      >
                        {u.status === 'Ativo' ? 'Desativar' : 'Reativar'}
                      </BotaoGlobal>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* ── TAB 2: Habilitações por Filial ── */}
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
