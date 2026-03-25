import React, { useState, useEffect, useMemo } from 'react'
import { ModalGlobal } from '@nucleo/modal-global'
import { CabecalhoGlobal } from '@nucleo/cabecalho-global'
import { GeralCampoGlobal } from '@nucleo/geral-campo-global'
import { BotaoSalvar, BotaoCancelar } from '@nucleo/botoes-salvar-global'
import { StatusSalvarGlobal } from '@nucleo/status-salvar-global'
import { User, EnvelopeSimple, Buildings, CheckSquare, Square, ShieldCheck } from '@phosphor-icons/react'
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
  return (
    <div style={{ padding: '0 0.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <div className="em-grid" style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem' }}>
        <GeralCampoGlobal label="Nome Completo" obrigatorio>
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
        
        <GeralCampoGlobal label="E-mail" obrigatorio>
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

        <GeralCampoGlobal label="Tipo de Usuário">
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

        <GeralCampoGlobal label="Empresa Vinculada (Exemplo)">
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

function AbaPermissoes({ master, valores, onToggle, onSelecionarTudo }: any) {
  return (
    <div style={{ padding: '0.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600 }}>Selecionar:</span>
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
            <CheckSquare size={14} weight="bold" /> Todas
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
            <Square size={14} weight="bold" /> Nenhuma
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
      rotulo: 'Dados do Usuário',
      icone: 'user',
      conteudo: <AbaDados nome={nome} email={email} tipo={tipo} onValoresChange={handleValoresChange} />
    },
    {
      id: 'permissoes',
      rotulo: `Permissões (${countPermissoes}/${TOTAL_PERMISSOES_DISPONIVEIS})`,
      icone: 'shield-check',
      conteudo: <AbaPermissoes master={tipo === 'Master'} valores={permissoesAtivas} onToggle={handleTogglePermissao} onSelecionarTudo={handleSelecionarTudo} />
    }
  ], [nome, email, tipo, permissoesAtivas, countPermissoes])

  const dirty = usuario && (nome !== usuario.nome || email !== usuario.email || tipo !== usuario.tipo || permissoesAtivas.length > 0) // rough check
  
  const handleSalvar = () => {
    if (!usuario) return
    aoSalvar({ ...usuario, nome, email, tipo: tipo as any }, permissoesAtivas)
  }

  return (
    <ModalGlobal
      aberto={!!usuario}
      aoFechar={aoFechar}
      titulo="Editar Usuário"
      subtitulo="Ajuste dados básicos e permissões de acesso aos módulos"
      tamanho="lg"
      altura="650px"
      tipoAbas="pill"
      abaAtivaInicial={abaInicial}
      abas={abas}
      renderizarFooter={() => (
        <div className="mg-footer-personalizado">
          <div /> {/* Espaçador opcional para manter os botões à direita (space-between) */}
          <div className="botoes-footer-padrao">
            <StatusSalvarGlobal status={dirty ? 'dirty' : 'idle'} hideOnIdle />
            <BotaoCancelar rotulo="Cancelar" dirty={!!dirty} onClick={aoFechar} />
            <BotaoSalvar rotulo="Salvar Alterações" dirty={!!dirty && !!nome && !!email} onClick={handleSalvar} />
          </div>
        </div>
      )}
    />
  )
}
