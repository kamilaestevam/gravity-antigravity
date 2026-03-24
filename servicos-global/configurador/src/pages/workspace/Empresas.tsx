import React, { useState } from 'react'
import { Buildings } from '@phosphor-icons/react'
import { BotaoGlobal } from '@nucleo/botao-global'
import { BotaoNovoGlobal } from '@nucleo/botao-novo-global'
import { CabecalhoGlobal } from '@nucleo/cabecalho-global'
import { TabelaEmpresas, type Empresa } from './TabelaEmpresas'

const mockEmpresas: Empresa[] = [
  { id:  '1', nome: 'Acme Logística',          subdominio: 'acme-log',       usuarios:  8, status: 'Ativa',    criadaEm: '12/01/2025' },
  { id:  '2', nome: 'Acme Importações',        subdominio: 'acme-import',    usuarios:  3, status: 'Ativa',    criadaEm: '18/02/2025' },
  { id:  '3', nome: 'Acme Distribuição',       subdominio: 'acme-dist',      usuarios: 12, status: 'Ativa',    criadaEm: '05/03/2025' },
  { id:  '4', nome: 'Acme Varejo SP',          subdominio: 'acme-sp',        usuarios:  5, status: 'Suspensa', criadaEm: '22/03/2025' },
  { id:  '5', nome: 'Brasilcom Tecnologia',    subdominio: 'brasilcom-tech', usuarios: 27, status: 'Ativa',    criadaEm: '03/01/2025' },
  { id:  '6', nome: 'Brasilcom Suporte',       subdominio: 'brasilcom-sup',  usuarios:  6, status: 'Ativa',    criadaEm: '14/01/2025' },
  { id:  '7', nome: 'Delta Comercial',         subdominio: 'delta-com',      usuarios: 41, status: 'Ativa',    criadaEm: '20/01/2025' },
  { id:  '8', nome: 'Delta Financeiro',        subdominio: 'delta-fin',      usuarios:  9, status: 'Suspensa', criadaEm: '28/01/2025' },
  { id:  '9', nome: 'Delta RH',                subdominio: 'delta-rh',       usuarios:  2, status: 'Ativa',    criadaEm: '02/02/2025' },
  { id: '10', nome: 'Grupo Nexus Principal',   subdominio: 'nexus-main',     usuarios: 55, status: 'Ativa',    criadaEm: '07/02/2025' },
  { id: '11', nome: 'Grupo Nexus Regional',    subdominio: 'nexus-reg',      usuarios: 18, status: 'Ativa',    criadaEm: '11/02/2025' },
  { id: '12', nome: 'Grupo Nexus Sul',         subdominio: 'nexus-sul',      usuarios:  7, status: 'Suspensa', criadaEm: '15/02/2025' },
  { id: '13', nome: 'Fênix Exportações',       subdominio: 'fenix-exp',      usuarios: 33, status: 'Ativa',    criadaEm: '19/02/2025' },
  { id: '14', nome: 'Fênix Consultoria',       subdominio: 'fenix-cons',     usuarios:  4, status: 'Ativa',    criadaEm: '24/02/2025' },
  { id: '15', nome: 'Orion Serviços',          subdominio: 'orion-srv',      usuarios: 14, status: 'Ativa',    criadaEm: '01/03/2025' },
  { id: '16', nome: 'Orion Manufatura',        subdominio: 'orion-mfg',      usuarios: 62, status: 'Ativa',    criadaEm: '04/03/2025' },
  { id: '17', nome: 'Orion Atacado',           subdominio: 'orion-atk',      usuarios:  1, status: 'Suspensa', criadaEm: '08/03/2025' },
  { id: '18', nome: 'Vega Saúde',              subdominio: 'vega-saude',     usuarios: 22, status: 'Ativa',    criadaEm: '11/03/2025' },
  { id: '19', nome: 'Vega Hospitalar',         subdominio: 'vega-hosp',      usuarios: 38, status: 'Ativa',    criadaEm: '13/03/2025' },
  { id: '20', nome: 'Vega Clínicas',           subdominio: 'vega-clin',      usuarios:  9, status: 'Suspensa', criadaEm: '15/03/2025' },
  { id: '21', nome: 'Titan Construções',       subdominio: 'titan-const',    usuarios: 17, status: 'Ativa',    criadaEm: '17/03/2025' },
  { id: '22', nome: 'Titan Incorporações',     subdominio: 'titan-inc',      usuarios: 48, status: 'Ativa',    criadaEm: '18/03/2025' },
  { id: '23', nome: 'Radius Seguros',          subdominio: 'radius-seg',     usuarios: 11, status: 'Ativa',    criadaEm: '19/03/2025' },
  { id: '24', nome: 'Radius Previdência',      subdominio: 'radius-prev',    usuarios:  6, status: 'Suspensa', criadaEm: '20/03/2025' },
  { id: '25', nome: 'Quantum Analytics',       subdominio: 'quantum-ai',     usuarios: 29, status: 'Ativa',    criadaEm: '21/03/2025' },
  { id: '26', nome: 'Quantum Data',            subdominio: 'quantum-data',   usuarios: 73, status: 'Ativa',    criadaEm: '21/03/2025' },
  { id: '27', nome: 'Solaris Energia',         subdominio: 'solaris-enrg',   usuarios: 16, status: 'Ativa',    criadaEm: '22/03/2025' },
  { id: '28', nome: 'Solaris Renováveis',      subdominio: 'solaris-ren',    usuarios:  3, status: 'Suspensa', criadaEm: '22/03/2025' },
  { id: '29', nome: 'Atlas Transporte',        subdominio: 'atlas-transp',   usuarios: 44, status: 'Ativa',    criadaEm: '23/03/2025' },
  { id: '30', nome: 'Atlas Logística Global',  subdominio: 'atlas-global',   usuarios: 19, status: 'Ativa',    criadaEm: '23/03/2025' },
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
      <CabecalhoGlobal
        icone={<Buildings weight="duotone" size={22} />}
        titulo="Empresas Filhas"
        subtitulo="Gerencie as empresas filhas do seu tenant Gravity."
      />

      {/* Stat cards + action row */}
      <div className="ws-stats-row ws-fade-up ws-fade-up-d1">
        <div className="ws-stats">
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
        <div className="ws-stats-row__action">
          <BotaoNovoGlobal
            rotulo="Nova Empresa Filha"
            onClick={() => setShowForm(v => !v)}
            ativo={showForm}
          />
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
