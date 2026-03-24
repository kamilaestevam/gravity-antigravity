import React, { useState } from 'react'
import { Buildings, Plus, X } from '@phosphor-icons/react'
import { BotaoGlobal } from '@nucleo/botao-global'
import { TabelaEmpresas, type Empresa } from './TabelaEmpresas'

const mockEmpresas: Empresa[] = [
  { id: '1', nome: 'Acme Logística',    subdominio: 'acme-log',    usuarios: 8,  status: 'Ativa',    criadaEm: '12/01/2025' },
  { id: '2', nome: 'Acme Importações',  subdominio: 'acme-import', usuarios: 3,  status: 'Ativa',    criadaEm: '18/02/2025' },
  { id: '3', nome: 'Acme Distribuição', subdominio: 'acme-dist',   usuarios: 12, status: 'Ativa',    criadaEm: '05/03/2025' },
  { id: '4', nome: 'Acme Varejo SP',    subdominio: 'acme-sp',     usuarios: 5,  status: 'Suspensa', criadaEm: '22/03/2025' },
]

function slugify(v: string) {
  return v.toLowerCase().replace(/[^a-z0-9-]/g, '').replace(/--+/g, '-')
}

export function Empresas() {
  const [empresas, setEmpresas]    = useState<Empresa[]>(mockEmpresas)
  const [showForm, setShowForm]    = useState(false)
  const [nome, setNome]            = useState('')
  const [subdominio, setSubdomain] = useState('')
  const [subdErr, setSubdErr]      = useState('')

  const ativas = empresas.filter(e => e.status === 'Ativa').length
  const limite = 50

  function handleSubChange(v: string) {
    const cleaned = slugify(v)
    setSubdomain(cleaned)
    if (cleaned && !/^[a-z][a-z0-9-]*$/.test(cleaned)) {
      setSubdErr('Use apenas letras minúsculas e hífens.')
    } else {
      setSubdErr('')
    }
  }

  function handleAdd() {
    if (!nome.trim() || !subdominio.trim() || subdErr) return
    const nova: Empresa = {
      id: String(Date.now()),
      nome: nome.trim(),
      subdominio: subdominio.trim(),
      usuarios: 0,
      status: 'Ativa',
      criadaEm: new Date().toLocaleDateString('pt-BR'),
    }
    setEmpresas(prev => [...prev, nova])
    setNome(''); setSubdomain(''); setSubdErr(''); setShowForm(false)
  }

  function handleSuspend(linha: Empresa) {
    if (linha.status === 'Ativa') {
      if (!window.confirm('Suspender esta empresa filha? Todo acesso será bloqueado.')) return
    }
    setEmpresas(prev =>
      prev.map(e => e.id === linha.id
        ? { ...e, status: e.status === 'Ativa' ? 'Suspensa' : 'Ativa' }
        : e
      )
    )
  }

  function handleDelete(linha: Empresa) {
    if (!window.confirm('Excluir permanentemente esta empresa filha? Esta ação não pode ser desfeita.')) return
    setEmpresas(prev => prev.filter(e => e.id !== linha.id))
  }

  return (
    <div className="ws-fade-up">
      {/* Header — sticky, alinhado ao topo junto com o logo do sidebar */}
      <div className="ws-page-header">
        <div className="ws-page-header__title-block">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Buildings weight="duotone" size={22} style={{ color: 'var(--ws-accent)', flexShrink: 0 }} />
            <h1 className="ws-page-header__title">Empresas Filhas</h1>
          </div>
          <p className="ws-page-header__subtitle">
            Gerencie as empresas filhas do seu tenant Gravity.
          </p>
        </div>
        <BotaoGlobal
          variante={showForm ? 'fantasma' : 'primario'}
          icone={showForm ? <X weight="bold" size={15} /> : <Plus weight="bold" size={15} />}
          onClick={() => setShowForm(v => !v)}
        >
          {showForm ? 'Cancelar' : 'Nova Empresa Filha'}
        </BotaoGlobal>
      </div>

      {/* Stat cards */}
      <div className="ws-stats ws-fade-up ws-fade-up-d1">
        <div className="ws-stat-card">
          <p className="ws-stat-label">Total de Filhas</p>
          <p className="ws-stat-value">{empresas.length}</p>
        </div>
        <div className="ws-stat-card">
          <p className="ws-stat-label">Filhas Ativas</p>
          <p className="ws-stat-value" style={{ color: '#34d399' }}>{ativas}</p>
        </div>
        <div className="ws-stat-card">
          <p className="ws-stat-label">Limite do Plano</p>
          <p className="ws-stat-value">{empresas.length}<span style={{ fontSize: '1rem', fontWeight: 400, color: 'var(--ws-muted)' }}>/{limite}</span></p>
          <p className="ws-stat-sub">{limite - empresas.length} slots disponíveis</p>
        </div>
      </div>

      {/* Inline form */}
      {showForm && (
        <div className="ws-form-card ws-fade-up" style={{ marginBottom: '1.5rem' }}>
          <p className="ws-section-title">
            <Buildings weight="duotone" size={14} color="#38bdf8" />
            Nova Empresa Filha
          </p>
          <div className="ws-form-row">
            <div className="ws-field">
              <label>Nome da Empresa</label>
              <input
                placeholder="Ex: Acme Logística SP"
                value={nome}
                onChange={e => setNome(e.target.value)}
              />
            </div>
            <div className="ws-field">
              <label>Subdomínio</label>
              <input
                placeholder="Ex: acme-logistica-sp"
                value={subdominio}
                onChange={e => handleSubChange(e.target.value)}
              />
              {subdErr && <p style={{ fontSize: '0.75rem', color: '#f87171', marginTop: '0.25rem' }}>{subdErr}</p>}
              {subdominio && !subdErr && (
                <p style={{ fontSize: '0.75rem', color: 'var(--ws-muted)', marginTop: '0.25rem' }}>
                  URL: <strong style={{ color: '#38bdf8' }}>{subdominio}.gravity.com.br</strong>
                </p>
              )}
            </div>
          </div>
          <div className="ws-form-actions">
            <BotaoGlobal
              variante="primario"
              onClick={handleAdd}
              disabled={!nome.trim() || !subdominio.trim() || !!subdErr}
            >
              Criar Empresa Filha
            </BotaoGlobal>
            <BotaoGlobal
              variante="fantasma"
              onClick={() => { setShowForm(false); setNome(''); setSubdomain(''); setSubdErr('') }}
            >
              Cancelar
            </BotaoGlobal>
          </div>
        </div>
      )}

      {/* TabelaEmpresas — filtros inline por coluna */}
      <div className="ws-fade-up ws-fade-up-d2">
        <TabelaEmpresas
          dados={empresas}
          onSuspender={handleSuspend}
          onExcluir={handleDelete}
        />
      </div>
    </div>
  )
}
