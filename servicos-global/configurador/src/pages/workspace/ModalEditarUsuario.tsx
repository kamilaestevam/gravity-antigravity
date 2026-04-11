import React, { useState, useEffect, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { ModalFormularioAbasGlobal } from '@nucleo/modal-formulario-abas-global'
import { GeralCampoGlobal } from '@nucleo/campo-geral-global'
import { StatusBadgeGlobal } from '@nucleo/status-badge-global'
import { User, EnvelopeSimple, Buildings, CheckSquare, Square, ShieldCheck } from '@phosphor-icons/react'
import { TabelaGlobal, type TabelaGlobalColuna } from '@nucleo/tabela-global'
import type { TenantUser } from './Usuarios'

interface ModalEditarUsuarioProps {
  usuario: TenantUser | null
  abaInicial?: string
  aoFechar: () => void
  aoSalvar: (dados: TenantUser, permissoes: string[]) => void
}

const CATEGORIAS_PERMISSAO = [
  {
    titulo: 'NAVEGAÇÃO',
    cor: '#818cf8',
    itens: [
      { id: 'nav_dash', rotulo: 'Dashboard' },
      { id: 'nav_emp', rotulo: 'Empresas' },
      { id: 'nav_ativ', rotulo: 'Minhas Atividades' },
      { id: 'nav_relat', rotulo: 'Relatórios' },
      { id: 'nav_hist', rotulo: 'Histórico de Alterações' },
      { id: 'nav_log', rotulo: 'Log de Testes' },
      { id: 'nav_deploy', rotulo: 'Deploy Tracker' },
      { id: 'nav_gabi', rotulo: 'Gabi AI' },
    ]
  },
  {
    titulo: 'VISUALIZAR CLIENTE (ABAS)',
    cor: '#f472b6',
    itens: [
      { id: 'vis_basico', rotulo: 'Dados Básicos' },
      { id: 'vis_prod', rotulo: 'Produtos DATI' },
      { id: 'vis_cont', rotulo: 'Contatos' },
      { id: 'vis_cs', rotulo: 'Customer Success' },
      { id: 'vis_ativ', rotulo: 'Atividades' },
    ]
  },
  {
    titulo: 'EDIÇÃO',
    cor: '#34d399',
    itens: [
      { id: 'edi_basico', rotulo: 'Editar Básicos' },
      { id: 'edi_prod', rotulo: 'Editar Produtos DATI' },
      { id: 'edi_cont', rotulo: 'Editar Contatos' },
      { id: 'edi_cs', rotulo: 'Editar CS' },
      { id: 'edi_ativ', rotulo: 'Editar Atividades' },
    ]
  }
]

const TOTAL_PERMISSOES_DISPONIVEIS = CATEGORIAS_PERMISSAO.reduce((acc, c) => acc + c.itens.length, 0)

function PermissaoCheckbox({ label, selecionado, onChange, desabilitado }: { label: string, selecionado: boolean, onChange: (v: boolean) => void, desabilitado?: boolean }) {
  return (
    <label
      style={{
        display: 'flex', alignItems: 'center', gap: '0.625rem',
        padding: '0.45rem 0.75rem', borderRadius: '6px',
        background: 'rgba(255,255,255,0.02)',
        border: '1px solid rgba(255,255,255,0.06)',
        cursor: desabilitado ? 'not-allowed' : 'pointer',
        transition: 'all 0.15s',
        opacity: desabilitado ? 0.6 : 1
      }}
      onMouseEnter={e => { if(!desabilitado) (e.currentTarget.style.background = 'rgba(255,255,255,0.06)') }}
      onMouseLeave={e => { if(!desabilitado) (e.currentTarget.style.background = 'rgba(255,255,255,0.02)') }}
    >
      <div style={{ color: selecionado ? '#818cf8' : '#64748b', display: 'flex', alignItems: 'center' }}>
        {selecionado ? <CheckSquare size={18} weight="fill" /> : <Square size={18} weight="regular" />}
      </div>
      <input
        type="checkbox"
        checked={selecionado}
        disabled={desabilitado}
        onChange={e => onChange(e.target.checked)}
        style={{ display: 'none' }}
      />
      <span style={{ fontSize: '0.8125rem', color: '#e2e8f0', fontWeight: 500 }}>{label}</span>
    </label>
  )
}

function AbaDados({ nome, email, tipo, onValoresChange }: any) {
  const { t } = useTranslation()
  return (
    <div style={{ padding: '0 0.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <div className="em-grid" style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem' }}>
        <GeralCampoGlobal label={t('workspace.users.tabela.nome_completo')} obrigatorio>
          <div className="ws-input-icon-wrap">
            <User size={16} />
            <input
              value={nome}
              placeholder="Ex: Ana Paula"
              onChange={e => onValoresChange('nome', e.target.value)}
              style={{ width: '100%' }}
            />
          </div>
        </GeralCampoGlobal>

        <GeralCampoGlobal label={t('comum.email')} obrigatorio>
          <div className="ws-input-icon-wrap">
            <EnvelopeSimple size={16} />
            <input
              type="email"
              value={email}
              placeholder="Ex: usuario@empresa.com"
              onChange={e => onValoresChange('email', e.target.value)}
              style={{ width: '100%' }}
            />
          </div>
        </GeralCampoGlobal>

        <GeralCampoGlobal label={t('workspace.users.tabela.tipo')}>
          <div className="ws-input-icon-wrap" style={{ padding: 0 }}>
            <select
              value={tipo}
              onChange={e => onValoresChange('tipo', e.target.value)}
              style={{
                width: '100%',
                background: 'transparent',
                border: 'none',
                color: 'var(--ws-text)',
                padding: '0 1rem 0 2.5rem',
                appearance: 'none',
                height: '100%'
              }}
            >
              <option value="Standard">Standard — Acesso conf. permissões</option>
              <option value="Master">Master — Acesso total</option>
              <option value="Fornecedor">Fornecedor — Acesso restrito</option>
            </select>
            <ShieldCheck size={16} style={{ position: 'absolute', left: '0.875rem', color: 'var(--ws-muted)' }} />
          </div>
        </GeralCampoGlobal>

        <GeralCampoGlobal label={t('workspace.users.empresa_vinculada')}>
          <div className="ws-input-icon-wrap">
            <Buildings size={16} />
            <input
              value="Acme Logística SP"
              disabled
              style={{ width: '100%', color: 'var(--ws-muted)', cursor: 'not-allowed' }}
            />
          </div>
        </GeralCampoGlobal>
      </div>
    </div>
  )
}

function AbaEspacos() {
  const { t } = useTranslation()
  const mockTenants = [
    {
      id: 'org_1', name: 'Acme Logística', subdominio: 'acme', status: 'Ativa', plano: 'Enterprise',
      workspaces: [
        { id: 'ws_1', nome: 'Acme SP', subdominio: 'acme-sp', status: 'Ativa', plano: 'Enterprise', perfil: 'Master' },
        { id: 'ws_2', nome: 'Acme RJ', subdominio: 'acme-rj', status: 'Ativa', plano: 'Enterprise', perfil: 'Standard' }
      ]
    },
    {
      id: 'org_2', name: 'Global Commerce', subdominio: 'global', status: 'Ativa', plano: 'Pro',
      workspaces: [
        { id: 'ws_3', nome: 'Global Sul', subdominio: 'global-sul', status: 'Ativa', plano: 'Pro', perfil: 'Fornecedor' }
      ]
    }
  ]

  const COLUNAS_PAI: TabelaGlobalColuna<any>[] = [
    {
      key: 'name', label: t('comum.organizacao'), tipo: 'texto',
      render: (_v, item) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
          <div style={{ width: 30, height: 30, minWidth: 30, borderRadius: '8px', background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.6875rem', fontWeight: 700, color: '#6366f1' }}>
            {item.name.charAt(0)}
          </div>
          <span style={{ fontWeight: 600 }}>{item.name}</span>
        </div>
      )
    },
    {
      key: 'subdominio', label: t('workspace.workspaces.tabela.subdominio'), tipo: 'texto',
      render: (_v, item) => (
        <code style={{ fontSize: '0.8125rem', color: '#c7d2fe', background: 'rgba(199,210,254,0.1)', padding: '0.125rem 0.4rem', borderRadius: '4px' }}>
          {item.subdominio}.gravity.com.br
        </code>
      )
    },
    {
      key: 'status', label: t('comum.status'), tipo: 'texto',
      render: (v) => <StatusBadgeGlobal valor={v as string} genero="masculino" />
    },
    {
      key: 'plano', label: t('workspace.users.plano'), tipo: 'texto',
      render: (v) => <span style={{ color: 'var(--ws-muted)' }}>{v as string}</span>
    }
  ]

  const COLUNAS_FILHAS: TabelaGlobalColuna<any>[] = [
    {
      key: 'nome', label: t('workspace.workspaces.titulo'), tipo: 'texto',
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
      key: 'subdominio', label: t('workspace.workspaces.tabela.subdominio'), tipo: 'texto',
      render: (_v, item) => (
        <code style={{ fontSize: '0.8rem', color: '#a5b4fc', background: 'rgba(165,180,252,0.08)', padding: '0.1rem 0.35rem', borderRadius: '4px' }}>
          {item.subdominio}.gravity.com.br
        </code>
      )
    },
    {
      key: 'status', label: t('comum.status'), tipo: 'texto',
      render: (v) => <StatusBadgeGlobal valor={v as string} genero="masculino" />
    },
    {
      key: 'perfil', label: t('workspace.users.perfil_workspace'), tipo: 'texto',
      render: (v) => (
        <span style={{ color: '#818cf8', fontWeight: 600, fontSize: '0.8125rem' }}>{v as string}</span>
      )
    }
  ]

  return (
    <div style={{ padding: '0.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', minHeight: '400px' }}>
      <TabelaGlobal
        dados={mockTenants}
        colunas={COLUNAS_PAI}
        colunasFilhas={COLUNAS_FILHAS}
        filhos={item => item.workspaces}
        idKey="id"
        expandidosPadrao={['org_1', 'org_2']}
        itensPorPagina={10}
      />
    </div>
  )
}

function AbaPermissoes({ master, valores, onToggle, onSelecionarTudo }: any) {
  const { t } = useTranslation()
  return (
    <div style={{ padding: '0.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600 }}>{t('workspace.users.selecionar')}:</span>
          <button
            type="button"
            onClick={() => onSelecionarTudo(true)}
            disabled={master}
            style={{
              padding: '0.25rem 0.625rem', borderRadius: '4px', background: 'transparent',
              border: '1px solid #10b981', color: '#10b981', fontSize: '0.75rem', fontWeight: 600,
              cursor: master ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem',
              opacity: master ? 0.5 : 1
            }}
          >
            <CheckSquare size={14} weight="bold" /> {t('workspace.users.todas')}
          </button>
          <button
            type="button"
            onClick={() => onSelecionarTudo(false)}
            disabled={master}
            style={{
              padding: '0.25rem 0.625rem', borderRadius: '4px', background: 'transparent',
              border: '1px solid #ef4444', color: '#ef4444', fontSize: '0.75rem', fontWeight: 600,
              cursor: master ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem',
              opacity: master ? 0.5 : 1
            }}
          >
            <Square size={14} weight="bold" /> {t('workspace.users.nenhuma')}
          </button>
        </div>
      </div>

      {CATEGORIAS_PERMISSAO.map((cat) => (
        <div key={cat.titulo}>
          <p style={{
            fontSize: '0.6875rem', fontWeight: 800, textTransform: 'uppercase',
            letterSpacing: '0.08em', color: cat.cor, marginBottom: '0.75rem'
          }}>
            {cat.titulo}
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '0.625rem' }}>
            {cat.itens.map(it => (
              <PermissaoCheckbox
                key={it.id}
                label={it.rotulo}
                selecionado={master || valores.includes(it.id)}
                desabilitado={master}
                onChange={checked => onToggle(it.id, checked)}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

export function ModalEditarUsuario({ usuario, abaInicial = 'dados', aoFechar, aoSalvar }: ModalEditarUsuarioProps) {
  const { t } = useTranslation()
  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [tipo, setTipo] = useState('')
  const [permissoesAtivas, setPermissoesAtivas] = useState<string[]>([])

  useEffect(() => {
    if (usuario) {
      setNome(usuario.nome)
      setEmail(usuario.email)
      setTipo(usuario.tipo)
      // mocks:
      if (usuario.tipo === 'Master') {
         setPermissoesAtivas(CATEGORIAS_PERMISSAO.flatMap(c => c.itens.map(i => i.id)))
      } else {
         setPermissoesAtivas(['nav_dash', 'vis_basico'])
      }
    }
  }, [usuario])

  const handleValoresChange = (campo: string, valor: any) => {
    if (campo === 'nome') setNome(valor)
    if (campo === 'email') setEmail(valor)
    if (campo === 'tipo') setTipo(valor)
  }

  const handleTogglePermissao = (id: string, checked: boolean) => {
    setPermissoesAtivas(prev => checked ? [...prev, id] : prev.filter(p => p !== id))
  }

  const handleSelecionarTudo = (todas: boolean) => {
    if (todas) {
      setPermissoesAtivas(CATEGORIAS_PERMISSAO.flatMap(c => c.itens.map(i => i.id)))
    } else {
      setPermissoesAtivas([])
    }
  }

  const countPermissoes = tipo === 'Master' ? TOTAL_PERMISSOES_DISPONIVEIS : permissoesAtivas.length

  const abas = useMemo(() => [
    {
      id: 'dados',
      rotulo: t('workspace.users.aba_dados'),
      icone: 'user',
      conteudo: <AbaDados nome={nome} email={email} tipo={tipo} onValoresChange={handleValoresChange} />
    },
    {
      id: 'permissoes',
      rotulo: `${t('workspace.users.aba_permissoes')} (${countPermissoes}/${TOTAL_PERMISSOES_DISPONIVEIS})`,
      icone: 'shield-check',
      conteudo: <AbaPermissoes master={tipo === 'Master'} valores={permissoesAtivas} onToggle={handleTogglePermissao} onSelecionarTudo={handleSelecionarTudo} />
    },
    {
      id: 'espacos',
      rotulo: t('workspace.users.aba_espacos'),
      icone: 'buildings',
      conteudo: <AbaEspacos />
    }
  ], [nome, email, tipo, permissoesAtivas, countPermissoes])

  const originalPerms = useMemo(() => {
    if (!usuario) return []
    if (usuario.tipo === 'Master') {
      return CATEGORIAS_PERMISSAO.flatMap(c => c.itens.map(i => i.id))
    }
    return ['nav_dash', 'vis_basico'] // mocks correlacionados ao useEffect
  }, [usuario?.id, usuario?.tipo])

  const dirty = usuario && (
    nome !== usuario.nome ||
    email !== usuario.email ||
    tipo !== usuario.tipo ||
    permissoesAtivas.length !== originalPerms.length ||
    permissoesAtivas.some(p => !originalPerms.includes(p))
  )


  const handleSalvar = () => {
    if (!usuario) return
    aoSalvar({ ...usuario, nome, email, tipo: tipo as any }, permissoesAtivas)
  }

  return (
    <ModalFormularioAbasGlobal
      aberto={!!usuario}
      aoFechar={aoFechar}
      aoSalvar={handleSalvar}
      icone={<User size={20} weight="duotone" />}
      titulo={t('workspace.users.modal_editar_titulo')}
      subtitulo={t('workspace.users.modal_editar_subtitulo')}
      tamanho="lg"
      altura="650px"
      tipoAbas="pill"
      abaAtivaInicial={abaInicial}
      abas={abas}
      dirty={!!dirty}
      podesSalvar={!!nome && !!email}
    />
  )
}
