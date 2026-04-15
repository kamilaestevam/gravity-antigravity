import React, { useState, useEffect, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { ModalFormularioAbasGlobal } from '@nucleo/modal-formulario-abas-global'
import { CheckSquare, Square, ShieldCheck, Crown, Warning, Lightning, Info } from '@phosphor-icons/react'
import type { TenantUser } from './Usuarios'
import type { NivelAcesso } from '../../types/niveis-acesso'

// ─── Definição das Permissões por Cadeia ────────────────────────────────────────

const MODULOS_UNIVERSAIS = [
  // ── Configurador (Workspace/Cliente) ──
  {
    id: 'org',
    aba: 'configurador',
    rotulo: 'Dados da Organização',
    cor: '#818cf8',
    descricao: 'Configurações gerais e dados cadastrais da empresa matriz',
    permissoes: [
      { id: 'org:read',  rotulo: 'Ver Organização',    descricao: 'Visualizar dados da empresa' },
      { id: 'org:write', rotulo: 'Editar Organização', descricao: 'Alterar CNPJ, endereço e configurações primárias' },
    ]
  },
  {
    id: 'workspaces',
    aba: 'configurador',
    rotulo: 'Workspaces (Filiais)',
    cor: '#06b6d4',
    descricao: 'Gerenciamento das unidades de negócio e subdomínios',
    permissoes: [
      { id: 'workspaces:read',  rotulo: 'Ver Workspaces',    descricao: 'Listar e consultar workspaces' },
      { id: 'workspaces:write', rotulo: 'Editar Workspaces', descricao: 'Criar e editar dados de filiais e subdomínios' },
    ]
  },
  {
    id: 'usuarios-cliente',
    aba: 'configurador',
    rotulo: 'Gestão de Usuários',
    cor: '#f472b6',
    descricao: 'Controle de acessos, convites e perfis da equipe',
    permissoes: [
      { id: 'usuarios:read',  rotulo: 'Ver Usuários',    descricao: 'Consultar membros da equipe' },
      { id: 'usuarios:write', rotulo: 'Editar Usuários', descricao: 'Convidar membros, suspender e editar permissões' },
    ]
  },
  {
    id: 'assinaturas',
    aba: 'configurador',
    rotulo: 'Assinaturas',
    cor: '#f59e0b',
    descricao: 'Planos e módulos extras contratados da Gravity',
    permissoes: [
      { id: 'assinaturas:read',  rotulo: 'Ver Assinaturas',    descricao: 'Consultar plano atual e limites da conta' },
      { id: 'assinaturas:write', rotulo: 'Gerenciar Planos',   descricao: 'Fazer upgrade (Ad-ons) ou alterar contratações' },
    ]
  },
  {
    id: 'financeiro',
    aba: 'configurador',
    rotulo: 'Financeiro',
    cor: '#22c55e',
    descricao: 'Pagamentos, histórico de faturas e cartões',
    permissoes: [
      { id: 'financeiro:read',  rotulo: 'Ver Faturas',         descricao: 'Visualizar histórico de faturas e recibos' },
      { id: 'financeiro:write', rotulo: 'Gerenciar Pagamentos',descricao: 'Alterar cartão de crédito e métodos de pagamento' },
    ]
  },
  {
    id: 'api',
    aba: 'configurador',
    rotulo: 'Chaves de API & Webhooks',
    cor: '#a78bfa',
    descricao: 'Ações de desenvolvimento e integrações da conta',
    permissoes: [
      { id: 'api:read',  rotulo: 'Ver APIs/Logs',  descricao: 'Consultar uso e integrações cadastradas' },
      { id: 'api:write', rotulo: 'Gerenciar APIs', descricao: 'Gerar chaves (Tokens) e configurar Webhooks' },
    ]
  },
  // ── Módulos Padroes Universais ──
  {
    id: 'atividades',
    aba: 'menu',
    rotulo: 'Minhas Atividades',
    cor: '#818cf8',
    descricao: 'Gerenciamento de tarefas e atividades do usuário',
    permissoes: [
      { id: 'atividades:read',  rotulo: 'Ver Atividades',         descricao: 'Visualizar tarefas e atividades' },
      { id: 'atividades:write', rotulo: 'Criar/Editar Atividades', descricao: 'Criar, editar e concluir atividades' },
    ]
  },
  {
    id: 'email',
    aba: 'comunicacao',
    rotulo: 'Email',
    cor: '#06b6d4',
    descricao: 'Comunicação por e-mail dentro da plataforma',
    permissoes: [
      { id: 'email:read',  rotulo: 'Ver Emails',    descricao: 'Visualizar histórico e caixas de entrada' },
      { id: 'email:write', rotulo: 'Enviar Emails',  descricao: 'Redigir e enviar e-mails pela plataforma' },
    ]
  },
  {
    id: 'whatsapp',
    aba: 'comunicacao',
    rotulo: 'WhatsApp',
    cor: '#22c55e',
    descricao: 'Comunicação via WhatsApp integrado',
    permissoes: [
      { id: 'whatsapp:read',  rotulo: 'Ver Conversas',      descricao: 'Acessar histórico de conversas' },
      { id: 'whatsapp:write', rotulo: 'Enviar Mensagens',   descricao: 'Enviar mensagens e responder clientes' },
    ]
  },
  {
    id: 'relatorios',
    aba: 'menu',
    rotulo: 'Relatórios',
    cor: '#f472b6',
    descricao: 'Acesso aos relatórios e dashboards analíticos',
    permissoes: [
      { id: 'relatorios:read',  rotulo: 'Ver Relatórios',     descricao: 'Visualizar dados e dashboards existentes' },
      { id: 'relatorios:write', rotulo: 'Gerar/Exportar',     descricao: 'Criar relatórios personalizados e exportar dados' },
    ]
  },
  {
    id: 'gabi',
    aba: 'comunicacao',
    rotulo: 'Gabi IA',
    cor: '#f59e0b',
    descricao: 'Assistente de inteligência artificial da plataforma',
    permissoes: [
      { id: 'gabi:read',  rotulo: 'Consultar Gabi',      descricao: 'Fazer perguntas e consultar a IA' },
      { id: 'gabi:write', rotulo: 'Comandos Avançados',  descricao: 'Usar comandos de automação e ações da Gabi' },
    ]
  },
]

const PRODUTOS_CONTRATADOS = [
  {
    id: 'simulacusto',
    aba: 'produtos',
    rotulo: 'SimulaCusto — Estimativa de Custo DUIMP',
    cor: '#34d399',
    descricao: 'Produto para cálculo e estimativa de custos de importação',
    permissoes: [
      { id: 'simulacusto:read',  rotulo: 'Ver Simulações',   descricao: 'Visualizar simulações de custo realizadas' },
      { id: 'simulacusto:write', rotulo: 'Criar Simulações', descricao: 'Criar novas simulações de custo e DUIMP' },
      { id: 'duimp:read',        rotulo: 'Consultar DUIMP',  descricao: 'Visualizar declarações DUIMP geradas' },
      { id: 'duimp:write',       rotulo: 'Gerar DUIMP',      descricao: 'Criar e emitir declarações DUIMP' },
    ]
  },
  {
    id: 'nf-importacao',
    aba: 'produtos',
    rotulo: 'NF Importação — Nota Fiscal',
    cor: '#a78bfa',
    descricao: 'Módulo de importação e emissão de notas fiscais',
    permissoes: [
      { id: 'nf:read',  rotulo: 'Consultar Notas Fiscais', descricao: 'Visualizar NFs emitidas e importadas' },
      { id: 'nf:write', rotulo: 'Emitir Nota Fiscal',      descricao: 'Criar, importar e emitir notas fiscais' },
    ]
  },
]

const TODAS_PERMISSOES_CLIENTE = [
  ...MODULOS_UNIVERSAIS.flatMap(m => m.permissoes.map(p => p.id)),
  ...PRODUTOS_CONTRATADOS.flatMap(p => p.permissoes.map(x => x.id)),
]

const SECOES_ADMIN_GRAVITY = [
  {
    id: 'tenants',
    aba: 'configurador',
    rotulo: 'Gestão de Tenants',
    cor: '#818cf8',
    descricao: 'Visualização e edição de organizações clientes',
    permissoes: [
      { id: 'admin:tenants:read',   rotulo: 'Ver Tenants',      descricao: 'Listar e visualizar organizações' },
      { id: 'admin:tenants:write',  rotulo: 'Editar Tenants',   descricao: 'Editar dados, suspender organizações' },
    ]
  },
  {
    id: 'usuarios',
    aba: 'configurador',
    rotulo: 'Gestão de Usuários Globais',
    cor: '#06b6d4',
    descricao: 'Controle de usuários em todas as organizações',
    permissoes: [
      { id: 'admin:usuarios:read',       rotulo: 'Ver Usuários',         descricao: 'Visualizar todos os usuários' },
      { id: 'admin:usuarios:write',      rotulo: 'Editar Usuários',      descricao: 'Editar dados e permissões' },
      { id: 'admin:usuarios:impersonate',rotulo: 'Impersonar Usuário',   descricao: 'Assumir sessão de cliente' },
    ]
  },
  {
    id: 'produtos',
    aba: 'configurador',
    rotulo: 'Produtos Contratados',
    cor: '#f472b6',
    descricao: 'Gerenciamento dos produtos por tenant',
    permissoes: [
      { id: 'admin:produtos:read',  rotulo: 'Ver Produtos',   descricao: 'Consultar produtos ativos por tenant' },
      { id: 'admin:produtos:write', rotulo: 'Editar Produtos', descricao: 'Ativar e desativar produtos por tenant' },
    ]
  },
  {
    id: 'deploy',
    aba: 'configurador',
    rotulo: 'Painel de Deploy',
    cor: '#f59e0b',
    descricao: 'Controle de deploys e rollbacks Railway',
    permissoes: [
      { id: 'admin:deploy:read',  rotulo: 'Ver Deploy',      descricao: 'Visualizar versões e status' },
      { id: 'admin:deploy:write', rotulo: 'Executar Deploy',  descricao: 'Iniciar deploys e rollbacks' },
    ]
  },
  {
    id: 'financeiro',
    aba: 'menu',
    rotulo: 'Financeiro',
    cor: '#22c55e',
    descricao: 'Acesso a MRR, ARR, faturas e cobranças',
    permissoes: [
      { id: 'admin:financeiro:read',  rotulo: 'Ver Financeiro',   descricao: 'Visualizar MRR, faturas' },
      { id: 'admin:financeiro:write', rotulo: 'Editar Financeiro', descricao: 'Ajustar planos e cobranças' },
    ]
  },
  {
    id: 'apis',
    aba: 'menu',
    rotulo: 'Monitor de APIs',
    cor: '#34d399',
    descricao: 'Monitoramento de APIs externas e de clientes',
    permissoes: [
      { id: 'admin:apis:read',  rotulo: 'Ver Monitor',     descricao: 'Visualizar saúde das APIs' },
      { id: 'admin:apis:write', rotulo: 'Gerenciar APIs',  descricao: 'Configurar health checks e limites' },
    ]
  },
  {
    id: 'gabi-global',
    aba: 'comunicacao',
    rotulo: 'Gabi IA (Global)',
    cor: '#a78bfa',
    descricao: 'Controle de consumo e configuração por tenant',
    permissoes: [
      { id: 'admin:gabi:read',  rotulo: 'Ver Gabi Global',    descricao: 'Visualizar consumo da Gabi por tenant' },
      { id: 'admin:gabi:write', rotulo: 'Configurar Gabi',    descricao: 'Ajustar limites e configurações da Gabi' },
    ]
  },
]

const TODAS_PERMISSOES_ADMIN = SECOES_ADMIN_GRAVITY.flatMap(s => s.permissoes.map(p => p.id))

// ─── Tipos compartilhados ────────────────────────────────────────────────────────
interface PermissaoItem {
  id: string
  rotulo: string
  descricao: string
}

interface SecaoPermissao {
  id: string
  aba?: string
  rotulo: string
  cor: string
  descricao?: string
  permissoes: PermissaoItem[]
}

interface PermissaoCheckboxProps {
  id: string
  label: string
  descricao?: string
  selecionado: boolean
  onChange: (checked: boolean) => void
  desabilitado?: boolean
}

interface GridSecaoPermissaoProps {
  sec: SecaoPermissao
  permissoesAtivas: string[]
  desabilitado: boolean
  onToggle: (id: string, checked: boolean) => void
}

// ─── Componente Checkbox ─────────────────────────────────────────────────────────
function PermissaoCheckbox({ id, label, descricao, selecionado, onChange, desabilitado }: PermissaoCheckboxProps) {
  const isRead  = id.endsWith(':read')
  const isWrite = id.endsWith(':write') || id.endsWith(':impersonate')

  return (
    <label
      style={{
        display: 'flex', alignItems: 'flex-start', gap: '0.625rem',
        padding: '0.5rem 0.75rem', borderRadius: '8px',
        background: selecionado && !desabilitado
          ? 'rgba(129,140,248,0.07)'
          : 'rgba(255,255,255,0.02)',
        border: selecionado && !desabilitado
          ? '1px solid rgba(129,140,248,0.2)'
          : '1px solid rgba(255,255,255,0.06)',
        cursor: desabilitado ? 'not-allowed' : 'pointer',
        transition: 'all 0.15s',
        opacity: desabilitado ? 0.55 : 1,
        position: 'relative',
      }}
      onMouseEnter={e => {
        if (!desabilitado) {
          e.currentTarget.style.background = selecionado ? 'rgba(129,140,248,0.1)' : 'rgba(255,255,255,0.05)'
          e.currentTarget.style.borderColor = 'rgba(129,140,248,0.3)'
        }
      }}
      onMouseLeave={e => {
        if (!desabilitado) {
          e.currentTarget.style.background = selecionado ? 'rgba(129,140,248,0.07)' : 'rgba(255,255,255,0.02)'
          e.currentTarget.style.borderColor = selecionado ? 'rgba(129,140,248,0.2)' : 'rgba(255,255,255,0.06)'
        }
      }}
    >
      <div style={{ color: selecionado ? '#818cf8' : '#64748b', display: 'flex', alignItems: 'center', marginTop: '1px' }}>
        {selecionado
          ? <CheckSquare size={16} weight="fill" />
          : <Square size={16} weight="regular" />
        }
      </div>
      <input
        type="checkbox"
        checked={selecionado}
        disabled={desabilitado}
        onChange={e => onChange(e.target.checked)}
        style={{ display: 'none' }}
      />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
          <span style={{ fontSize: '0.8125rem', color: '#e2e8f0', fontWeight: 600, lineHeight: 1.3 }}>{label}</span>
          <span style={{
            fontSize: '0.5625rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em',
            padding: '0.1rem 0.35rem', borderRadius: '4px',
            background: isRead ? 'rgba(6,182,212,0.1)' : isWrite ? 'rgba(34,197,94,0.1)' : 'rgba(129,140,248,0.08)',
            color: isRead ? '#06b6d4' : isWrite ? '#22c55e' : '#818cf8',
            border: `1px solid ${isRead ? 'rgba(6,182,212,0.2)' : isWrite ? 'rgba(34,197,94,0.2)' : 'rgba(129,140,248,0.15)'}`,
            flexShrink: 0,
          }}>
            {isRead ? 'Acesso' : isWrite ? 'Edição' : 'Ação'}
          </span>
        </div>
        {descricao && (
          <span style={{ fontSize: '0.6875rem', color: '#64748b', lineHeight: 1.4, display: 'block', marginTop: '0.125rem' }}>
            {descricao}
          </span>
        )}
      </div>
    </label>
  )
}

function GridSecaoPermissao({ sec, permissoesAtivas, desabilitado, onToggle }: GridSecaoPermissaoProps) {
  return (
    <div style={{ marginBottom: '1.25rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.625rem' }}>
        <div style={{ width: 6, height: 6, borderRadius: '50%', background: sec.cor, flexShrink: 0 }} />
        <p style={{ fontSize: '0.75rem', fontWeight: 700, color: sec.cor, margin: 0, letterSpacing: '0.03em' }}>{sec.rotulo}</p>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '0.5rem', paddingLeft: '1rem' }}>
        {sec.permissoes.map((p) => (
          <PermissaoCheckbox
            key={p.id} id={p.id} label={p.rotulo} descricao={p.descricao}
            selecionado={desabilitado || permissoesAtivas.includes(p.id)}
            desabilitado={desabilitado}
            onChange={(checked: boolean) => onToggle(p.id, checked)}
          />
        ))}
      </div>
    </div>
  )
}

interface ModalPermissoesProps {
  usuario: TenantUser | null
  aoFechar: () => void
  aoSalvar: (permissoes: string[]) => void
  contextoAdmin?: boolean
}

export function ModalPermissoesUsuario({ usuario, aoFechar, aoSalvar, contextoAdmin = false }: ModalPermissoesProps) {
  const { t } = useTranslation()
  const [permissoesAtivas, setPermissoesAtivas] = useState<string[]>([])

  useEffect(() => {
    if (usuario) {
      const t = usuario.tipo as NivelAcesso
      if (t === 'Master' || t === 'Super Admin') {
        setPermissoesAtivas(contextoAdmin ? TODAS_PERMISSOES_ADMIN : TODAS_PERMISSOES_CLIENTE)
      } else if (t === 'Admin') {
        setPermissoesAtivas(['admin:tenants:read', 'admin:usuarios:read', 'admin:financeiro:read'])
      } else if (t === 'Standard') {
        setPermissoesAtivas(['atividades:read', 'email:read', 'gabi:read'])
      } else {
        setPermissoesAtivas([])
      }
    }
  }, [usuario, contextoAdmin])

  const handleToggle = (id: string, checked: boolean) => {
    setPermissoesAtivas(prev => checked ? [...prev, id] : prev.filter(p => p !== id))
  }

  const handleSelecionarTudoCategoria = (todas: boolean, permissoesSecoes: string[]) => {
    if (todas) {
      setPermissoesAtivas(prev => Array.from(new Set([...prev, ...permissoesSecoes])))
    } else {
      setPermissoesAtivas(prev => prev.filter(p => !permissoesSecoes.includes(p)))
    }
  }

  const isGravityUser = usuario?.tipo === 'Super Admin' || usuario?.tipo === 'Admin'
  const isMaster = usuario?.tipo === 'Master'
  const isSuperAdmin = usuario?.tipo === 'Super Admin'
  const isFornecedor = usuario?.tipo === 'Fornecedor'
  const desabilitado = isMaster || isSuperAdmin

  const bannerDescricao = useMemo(() => {
    if (isSuperAdmin) {
      return (
        <div style={{ padding: '0.875rem 1rem', borderRadius: '10px', background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.2)', display: 'flex', gap: '0.75rem', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
          <Lightning size={16} weight="duotone" color="#22c55e" style={{ marginTop: '2px', flexShrink: 0 }} />
          <div>
            <p style={{ fontSize: '0.75rem', fontWeight: 700, color: '#22c55e', margin: 0, marginBottom: '0.25rem' }}>Super Admin — Acesso Total Irrestrito</p>
            <p style={{ fontSize: '0.75rem', color: '#94a3b8', margin: 0, lineHeight: 1.5 }}>Super Admin tem acesso irrestrito a toda a plataforma. As configurações abaixo são informativas.</p>
          </div>
        </div>
      )
    }
    if (usuario?.tipo === 'Admin') {
      return (
        <div style={{ padding: '0.875rem 1rem', borderRadius: '10px', background: 'rgba(6,182,212,0.06)', border: '1px solid rgba(6,182,212,0.2)', display: 'flex', gap: '0.75rem', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
          <ShieldCheck size={16} weight="duotone" color="#06b6d4" style={{ marginTop: '2px', flexShrink: 0 }} />
          <div>
            <p style={{ fontSize: '0.75rem', fontWeight: 700, color: '#06b6d4', margin: 0, marginBottom: '0.25rem' }}>Admin — Acesso e Edição Controlados</p>
            <p style={{ fontSize: '0.75rem', color: '#94a3b8', margin: 0, lineHeight: 1.5 }}>
              O usuário Admin acessa e edita o ambiente administrativo da Gravity estritamente conforme as permissões delegadas pelo Super Admin.
            </p>
          </div>
        </div>
      )
    }
    if (isMaster) {
      return (
        <div style={{ padding: '0.875rem 1rem', borderRadius: '10px', background: 'rgba(129,140,248,0.06)', border: '1px solid rgba(129,140,248,0.2)', display: 'flex', gap: '0.75rem', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
          <Crown size={16} weight="duotone" color="#818cf8" style={{ marginTop: '2px', flexShrink: 0 }} />
          <div>
            <p style={{ fontSize: '0.75rem', fontWeight: 700, color: '#818cf8', margin: 0, marginBottom: '0.25rem' }}>Master — Acesso Total</p>
            <p style={{ fontSize: '0.75rem', color: '#94a3b8', margin: 0, lineHeight: 1.5 }}>Usuários Master têm acesso automático a todos os módulos e workspaces.</p>
          </div>
        </div>
      )
    }
    if (isFornecedor) {
      return (
        <div style={{ padding: '0.875rem 1rem', borderRadius: '10px', background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.2)', display: 'flex', gap: '0.75rem', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
          <Warning size={16} weight="duotone" color="#fbbf24" style={{ marginTop: '2px', flexShrink: 0 }} />
          <div>
            <p style={{ fontSize: '0.75rem', fontWeight: 700, color: '#fbbf24', margin: 0, marginBottom: '0.25rem' }}>Fornecedor — Permissões Obrigatórias</p>
            <p style={{ fontSize: '0.75rem', color: '#94a3b8', margin: 0, lineHeight: 1.5 }}>Defina explicitamente cada permissão que este parceiro deve ter.</p>
          </div>
        </div>
      )
    }
    return null
  }, [usuario, isSuperAdmin, isMaster, isFornecedor])

  const abas = useMemo(() => {
    if (!usuario) return []
    
    // Filtro por abas lógicas baseadas nas duas coleções (Admin vs Cliente)
    const renderSecoesDaAba = (filtrados: SecaoPermissao[]) => {
      const allPermsInTab = filtrados.flatMap(s => s.permissoes.map(p => p.id))
      const activeInTab = allPermsInTab.filter(pid => permissoesAtivas.includes(pid)).length
      const totalInTab  = allPermsInTab.length

      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', padding: '1.5rem 0.5rem 1rem 0.5rem' }}>
          {bannerDescricao}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
              <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600 }}>{t('workspace.users.selecionar')}:</span>
              <button
                type="button" onClick={() => handleSelecionarTudoCategoria(true, allPermsInTab)} disabled={desabilitado}
                style={{ padding: '0.25rem 0.625rem', borderRadius: '6px', background: 'transparent', border: '1px solid #10b981', color: '#10b981', fontSize: '0.75rem', fontWeight: 600, cursor: desabilitado ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem', opacity: desabilitado ? 0.5 : 1 }}
              >
                <CheckSquare size={13} weight="bold" /> {t('tabela.selecionar_tudo')}
              </button>
              <button
                type="button" onClick={() => handleSelecionarTudoCategoria(false, allPermsInTab)} disabled={desabilitado}
                style={{ padding: '0.25rem 0.625rem', borderRadius: '6px', background: 'transparent', border: '1px solid #ef4444', color: '#ef4444', fontSize: '0.75rem', fontWeight: 600, cursor: desabilitado ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem', opacity: desabilitado ? 0.5 : 1 }}
              >
                <Square size={13} weight="bold" /> {t('tabela.limpar')}
              </button>
            </div>
            <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>
              {activeInTab}/{totalInTab}
            </span>
          </div>

          {!isGravityUser ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {filtrados.map(sec => <GridSecaoPermissao key={sec.id} sec={sec} permissoesAtivas={permissoesAtivas} desabilitado={desabilitado} onToggle={handleToggle} />)}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {filtrados.map(sec => <GridSecaoPermissao key={sec.id} sec={sec} permissoesAtivas={permissoesAtivas} desabilitado={desabilitado} onToggle={handleToggle} />)}
            </div>
          )}
        </div>
      )
    }

    const abasCliente = [
      { id: 'configurador', rotulo: t('workspace.layout.organizacao'), icone: 'gear',       conteudo: renderSecoesDaAba(MODULOS_UNIVERSAIS.filter(s => s.aba === 'configurador')) },
      { id: 'menu',         rotulo: t('admin.layout.module_name'),     icone: 'list',       conteudo: renderSecoesDaAba(MODULOS_UNIVERSAIS.filter(s => s.aba === 'menu')) },
      { id: 'comunicacao',  rotulo: t('shell.secao.comunicacao'),      icone: 'chats',      conteudo: renderSecoesDaAba(MODULOS_UNIVERSAIS.filter(s => s.aba === 'comunicacao')) },
      { id: 'produtos',     rotulo: t('admin.layout.produtos'),        icone: 'cubes',      conteudo: renderSecoesDaAba(PRODUTOS_CONTRATADOS.filter(s => s.aba === 'produtos')) },
    ].filter(aba => aba.conteudo.props.children[1].props.children > 0 || aba.conteudo.props.children[0] !== null || aba.id !== 'configurador')

    if (isGravityUser) {
      return [
        { id: 'admin',      rotulo: t('admin.layout.module_name'), icone: 'shield-check', conteudo: renderSecoesDaAba(SECOES_ADMIN_GRAVITY) },
        ...abasCliente
      ]
    } else {
      return abasCliente
    }
  }, [usuario, permissoesAtivas, isGravityUser, desabilitado, bannerDescricao])

  // Dirty check: mock calculation
  const originalPerms = (() => {
    if (!usuario) return []
    const t = usuario.tipo as NivelAcesso
    if (t === 'Master' || t === 'Super Admin') return contextoAdmin ? TODAS_PERMISSOES_ADMIN : TODAS_PERMISSOES_CLIENTE
    if (t === 'Admin') return ['admin:tenants:read', 'admin:usuarios:read', 'admin:financeiro:read']
    if (t === 'Standard') return ['atividades:read', 'email:read', 'gabi:read']
    return []
  })()
  const dirty = permissoesAtivas.length !== originalPerms.length || permissoesAtivas.some(p => !originalPerms.includes(p))

  if (!usuario) return null

  // No contexto Admin (painel global), a persistência de permissões ainda não
  // tem endpoint backend (`PUT /admin/users/:id/permissions`). O modal é exibido
  // em modo preview: desabilitamos o botão Salvar e sinalizamos no subtítulo.
  const subtituloFinal = contextoAdmin
    ? `${t('workspace.users.permissoes_admin_subtitulo')} — Preview (persistência em desenvolvimento)`
    : isGravityUser
    ? t('workspace.users.permissoes_admin_subtitulo')
    : t('workspace.users.permissoes_cliente_subtitulo')

  return (
    <ModalFormularioAbasGlobal
      aberto={!!usuario}
      aoFechar={aoFechar}
      aoSalvar={() => aoSalvar(permissoesAtivas)}
      icone={<ShieldCheck size={20} weight="duotone" />}
      titulo={`${t('workspace.users.aba_permissoes')}: ${usuario.nome}`}
      subtitulo={subtituloFinal}
      tamanho="lg"
      altura="680px"
      tipoAbas="pill"
      abaAtivaInicial={abas[0]?.id || ''}
      abas={abas}
      dirty={dirty}
      podesSalvar={!contextoAdmin}
    />
  )
}
