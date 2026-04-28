import React, { useState, useEffect, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { ModalFormularioAbasGlobal } from '@nucleo/modal-formulario-abas-global'
import { CampoGeralGlobal } from '@nucleo/campo-geral-global'
import { User, EnvelopeSimple, Buildings, CheckSquare, Square, ShieldCheck } from '@phosphor-icons/react'
import type { TenantUser, EspacoTrabalho } from './Usuarios'
import type { NivelAcesso } from '../../types/niveis-acesso'

interface ModalEditarUsuarioProps {
  usuario: TenantUser | null
  abaInicial?: string
  espacos: EspacoTrabalho[]
  workspacesSalvos: string[]
  carregandoEspacos?: boolean
  aoFechar: () => void
  aoSalvar: (dados: TenantUser, permissoes: string[], workspaceIds: string[]) => void
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

interface AbaDadosProps {
  nome: string
  email: string
  tipo: NivelAcesso
  onValoresChange: (campo: 'nome' | 'email' | 'tipo', valor: string) => void
}

function AbaDados({ nome, email, tipo, onValoresChange }: AbaDadosProps) {
  const { t } = useTranslation()
  return (
    <div style={{ padding: '0 0.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <div className="em-grid" style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem' }}>
        <CampoGeralGlobal label={t('workspace.users.tabela.nome_completo')} obrigatorio>
          <div className="ws-input-icon-wrap">
            <User size={16} />
            <input
              value={nome}
              placeholder="Ex: Ana Paula"
              onChange={e => onValoresChange('nome', e.target.value)}
              style={{ width: '100%' }}
            />
          </div>
        </CampoGeralGlobal>

        <CampoGeralGlobal label={t('comum.email')} obrigatorio>
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
        </CampoGeralGlobal>

        <CampoGeralGlobal label={t('workspace.users.tabela.tipo')}>
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
        </CampoGeralGlobal>

        <CampoGeralGlobal label={t('workspace.users.empresa_vinculada')}>
          <div className="ws-input-icon-wrap">
            <Buildings size={16} />
            <input
              value="Acme Logística SP"
              disabled
              style={{ width: '100%', color: 'var(--ws-muted)', cursor: 'not-allowed' }}
            />
          </div>
        </CampoGeralGlobal>
      </div>
    </div>
  )
}

function AbaEspacosVazio() {
  return (
    <div style={{
      padding: '2rem', textAlign: 'center', color: 'var(--ws-muted)', fontSize: '0.875rem',
      background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px dashed rgba(255,255,255,0.1)',
    }}>
      Nenhum workspace ativo encontrado nesta organização.
    </div>
  )
}

function AbaEspacosMaster({ espacos }: { espacos: EspacoTrabalho[] }) {
  return (
    <div style={{ padding: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      <div
        role="note"
        aria-label="Informação sobre acesso Master"
        style={{
          padding: '0.875rem 1rem', borderRadius: '8px',
          background: 'rgba(129,140,248,0.06)', border: '1px solid rgba(129,140,248,0.25)',
          fontSize: '0.8125rem', color: '#c7d2fe', fontWeight: 500,
          display: 'flex', alignItems: 'center', gap: '0.625rem',
        }}
      >
        <ShieldCheck size={16} weight="fill" style={{ color: '#818cf8', flexShrink: 0 }} />
        Usuários Master têm acesso a todos os workspaces automaticamente. Para alterar, mude o tipo para Standard.
      </div>
      {espacos.length === 0 ? (
        <div style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--ws-muted)', fontSize: '0.8125rem' }}>
          Nenhum workspace encontrado.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
          {espacos.map(e => (
            <div key={e.id} style={{
              padding: '0.5rem 0.75rem', borderRadius: '8px',
              background: 'rgba(129,140,248,0.04)', border: '1px solid rgba(129,140,248,0.12)',
              display: 'flex', alignItems: 'center', gap: '0.5rem', opacity: 0.7,
            }}>
              <Buildings size={14} style={{ color: '#818cf8', flexShrink: 0 }} />
              <span style={{ fontSize: '0.8125rem', color: '#c7d2fe' }}>{e.nome}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

interface AbaEspacosChecklistProps {
  espacos: EspacoTrabalho[]
  workspacesAtivos: string[]
  onToggle: (id: string, checked: boolean) => void
}

function AbaEspacosChecklist({ espacos, workspacesAtivos, onToggle }: AbaEspacosChecklistProps) {
  return (
    <div style={{ padding: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
      {espacos.map(e => {
        const ativo = workspacesAtivos.includes(e.id)
        return (
          <label
            key={e.id}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.625rem',
              padding: '0.5rem 0.75rem', borderRadius: '8px', cursor: 'pointer',
              background: ativo ? 'rgba(129,140,248,0.08)' : 'rgba(255,255,255,0.02)',
              border: `1px solid ${ativo ? 'rgba(129,140,248,0.25)' : 'rgba(255,255,255,0.06)'}`,
              transition: 'all 0.15s', userSelect: 'none',
            }}
          >
            <div style={{
              width: 18, height: 18, borderRadius: '4px', flexShrink: 0,
              background: ativo ? 'rgba(129,140,248,0.2)' : 'transparent',
              border: `2px solid ${ativo ? '#818cf8' : 'rgba(255,255,255,0.2)'}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s',
            }}>
              {ativo && <span style={{ color: '#818cf8', fontSize: '11px', lineHeight: 1, fontWeight: 700 }}>✓</span>}
            </div>
            <input type="checkbox" checked={ativo} onChange={ev => onToggle(e.id, ev.target.checked)} style={{ display: 'none' }} />
            <Buildings size={14} style={{ color: ativo ? '#818cf8' : 'var(--ws-muted)', flexShrink: 0 }} />
            <span style={{ fontSize: '0.8125rem', color: ativo ? 'var(--ws-text)' : 'var(--ws-muted)', fontWeight: ativo ? 600 : 400 }}>
              {e.nome}
            </span>
          </label>
        )
      })}
    </div>
  )
}

interface AbaEspacosProps {
  isMaster: boolean
  espacos: EspacoTrabalho[]
  workspacesAtivos: string[]
  carregando: boolean
  onToggle: (id: string, checked: boolean) => void
}

function AbaEspacos({ isMaster, espacos, workspacesAtivos, carregando, onToggle }: AbaEspacosProps) {
  if (carregando) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--ws-muted)', fontSize: '0.875rem' }}>
        Carregando workspaces...
      </div>
    )
  }
  if (isMaster) return <AbaEspacosMaster espacos={espacos} />
  if (espacos.length === 0) return <AbaEspacosVazio />
  return <AbaEspacosChecklist espacos={espacos} workspacesAtivos={workspacesAtivos} onToggle={onToggle} />
}

interface AbaPermissoesProps {
  master: boolean
  valores: string[]
  onToggle: (id: string, checked: boolean) => void
  onSelecionarTudo: (todas: boolean) => void
}

function AbaPermissoes({ master, valores, onToggle, onSelecionarTudo }: AbaPermissoesProps) {
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

export function ModalEditarUsuario({ usuario, abaInicial = 'dados', espacos, workspacesSalvos, carregandoEspacos = false, aoFechar, aoSalvar }: ModalEditarUsuarioProps) {
  const { t } = useTranslation()
  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [tipo, setTipo] = useState<NivelAcesso>('Standard')
  const [permissoesAtivas, setPermissoesAtivas] = useState<string[]>([])
  const [workspacesAtivos, setWorkspacesAtivos] = useState<string[]>([])

  useEffect(() => {
    if (usuario) {
      setNome(usuario.nome)
      setEmail(usuario.email)
      setTipo(usuario.tipo)
      setWorkspacesAtivos(workspacesSalvos)
      if (usuario.tipo === 'Master') {
         setPermissoesAtivas(CATEGORIAS_PERMISSAO.flatMap(c => c.itens.map(i => i.id)))
      } else {
         setPermissoesAtivas(['nav_dash', 'vis_basico'])
      }
    }
  }, [usuario, workspacesSalvos])

  const handleValoresChange = (campo: 'nome' | 'email' | 'tipo', valor: string) => {
    if (campo === 'nome') setNome(valor)
    if (campo === 'email') setEmail(valor)
    if (campo === 'tipo') setTipo(valor as NivelAcesso)
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

  const handleToggleWorkspace = (id: string, checked: boolean) => {
    setWorkspacesAtivos(prev => checked ? [...prev, id] : prev.filter(w => w !== id))
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
      conteudo: (
        <AbaEspacos
          isMaster={tipo === 'Master'}
          espacos={espacos}
          workspacesAtivos={workspacesAtivos}
          carregando={carregandoEspacos}
          onToggle={handleToggleWorkspace}
        />
      ),
    }
  ], [nome, email, tipo, permissoesAtivas, countPermissoes, workspacesAtivos, espacos, carregandoEspacos])

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
    permissoesAtivas.some(p => !originalPerms.includes(p)) ||
    (tipo !== 'Master' && (
      workspacesAtivos.length !== workspacesSalvos.length ||
      workspacesAtivos.some(id => !workspacesSalvos.includes(id))
    ))
  )

  const handleSalvar = () => {
    if (!usuario) return
    aoSalvar({ ...usuario, nome, email, tipo }, permissoesAtivas, workspacesAtivos)
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
      podesSalvar={!!nome && !!email && (tipo === 'Master' || workspacesAtivos.length > 0)}
    />
  )
}
