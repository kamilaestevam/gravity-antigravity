import React, { useState, useEffect } from 'react'
import { Buildings, TreeStructure, CheckCircle, Gauge, ChartPieSlice, FileXls, FileCsv, FileText, FilePdf, Code, PauseCircle, PlayCircle, PencilSimple, Trash } from '@phosphor-icons/react'
import { BotaoGlobal } from '@nucleo/botao-global'
import { BotaoNovoGlobal } from '@nucleo/botao-novo-global'
import { CabecalhoGlobal } from '@nucleo/cabecalho-global'
import { CardBasicoGlobal, CardGraficoGlobal, type PeriodoTendencia } from '@nucleo/card-global'
import { TabelaGlobal, type TabelaGlobalColuna, type TabelaGlobalAcao, type TabelaExportAcao } from '@nucleo/tabela-global'
import { TooltipGlobal } from '@nucleo/tooltip-global'
import { PaginaGlobal } from '@nucleo/pagina-global'
import { ModalEditarEspaco } from './ModalEditarEspaco'
import { ModalExclusao } from './ModalExclusao'
import { exportarExcel, exportarCSV, exportarTXT, exportarXML, exportarJSON, exportarPDF, type ColunasExport } from '../../services/exportService'

export type EmpresaStatus = 'Ativa' | 'Suspensa'

export interface Empresa {
  id: string
  nome: string
  subdominio: string
  usuarios: number
  status: EmpresaStatus
  criadaEm: string
  cnpj?: string
  estado?: string
  cidade?: string
  segmento?: string
  site?: string
  organizacao?: string
}

const mockEspacosDeTrabalho: Empresa[] = [
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


export function EspacosDeTrabalho() {
  const [empresas, setEspacosDeTrabalho] = useState<Empresa[]>(() => {
    try {
      const salvo = localStorage.getItem('gravity:espacos-trabalho-dados')
      if (salvo) return JSON.parse(salvo)
    } catch (e) {
      console.error('Erro ao ler espaços de trabalho do localStorage', e)
    }
    return mockEspacosDeTrabalho
  })

  // Salvar no localStorage sempre que houver mudança na lista de espaços de trabalho
  useEffect(() => {
    localStorage.setItem('gravity:espacos-trabalho-dados', JSON.stringify(empresas))
  }, [empresas])
  const [showForm, setShowForm]    = useState(false)
  const [nome, setNome]            = useState('')
  const [subdominio, setSubdomain] = useState('')
  const [subdErr, setSubdErr]      = useState('')
  const [empresaEditando, setEmpresaEditando] = useState<Empresa | null>(null)
  const [empresaParaExcluir, setEmpresaParaExcluir] = useState<Empresa | null>(null)

  const ativas = empresas.filter(e => e.status === 'Ativa').length
  const suspensas = empresas.filter(e => e.status === 'Suspensa').length
  const limite = 50

  function slugify(v: string) {
    return v.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '')
  }

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
    setEspacosDeTrabalho(prev => [...prev, nova])
    setNome(''); setSubdomain(''); setSubdErr(''); setShowForm(false)
  }

  function handleSuspend(linha: Empresa) {
    // Bypass window.confirm to avoid silent failures in secure iframes.
    setEspacosDeTrabalho(prev =>
      prev.map(e => e.id === linha.id
        ? { ...e, status: e.status === 'Ativa' ? 'Suspensa' : 'Ativa' }
        : e
      )
    )
  }

  function handleDelete(linha: Empresa) {
    setEmpresaParaExcluir(linha)
  }

  function confirmarExclusao() {
    if (!empresaParaExcluir) return
    setEspacosDeTrabalho(prev => prev.filter(e => e.id !== empresaParaExcluir.id))
    setEmpresaParaExcluir(null)
  }

  function handleEdit(linha: Empresa) {
    setEmpresaEditando(linha)
  }

  const COLUNAS: TabelaGlobalColuna<Empresa>[] = [
    {
      key: 'nome', label: 'Espaço de Trabalho', tipo: 'texto',
      tooltipTitulo: 'Espaço de Trabalho',
      tooltipDescricao: 'Nome do espaço de trabalho cadastrado na sua conta',
      render: (v, item) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
          <div style={{ width: 30, height: 30, minWidth: 30, borderRadius: '8px', background: 'rgba(129,140,248,0.12)', border: '1px solid rgba(129,140,248,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.6875rem', fontWeight: 700, color: '#818cf8' }}>
            {item.nome.charAt(0)}
          </div>
          <span style={{ fontWeight: 600 }}>{item.nome}</span>
        </div>
      )
    },
    {
      key: 'subdominio', label: 'Subdomínio', tipo: 'texto',
      tooltipTitulo: 'Subdomínio', tooltipDescricao: 'Endereço exclusivo deste espaço de trabalho no workspace',
      render: (v, item) => (
        <a href={`https://${item.subdominio}.gravity.com.br`} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', textDecoration: 'none' }} onClick={ev => ev.stopPropagation()}>
          <code style={{ fontSize: '0.8125rem', color: '#c7d2fe', background: 'rgba(199,210,254,0.1)', padding: '0.125rem 0.4rem', borderRadius: '4px', transition: 'background 0.15s, color 0.15s', cursor: 'pointer' }}
            onMouseEnter={ev => { (ev.currentTarget as HTMLElement).style.background = 'rgba(199,210,254,0.2)'; (ev.currentTarget as HTMLElement).style.textDecoration = 'underline' }}
            onMouseLeave={ev => { (ev.currentTarget as HTMLElement).style.background = 'rgba(199,210,254,0.1)'; (ev.currentTarget as HTMLElement).style.textDecoration = 'none' }}
          >
            {item.subdominio}.gravity.com.br
          </code>
        </a>
      )
    },
    {
      key: 'usuarios', label: 'Usuários', tipo: 'numero', align: 'center',
      tooltipTitulo: 'Usuários Ativos', tooltipDescricao: 'Total de usuários com acesso habilitado neste espaço de trabalho',
      render: (v) => <span style={{ fontWeight: 600 }}>{v}</span>
    },
    {
      key: 'status', label: 'Status', tipo: 'texto',
      tooltipTitulo: 'Status Operacional', tooltipDescricao: 'Indica se o espaço de trabalho está operando ou com acesso suspenso',
      render: (v) => (
        <span style={{ display: 'inline-flex', padding: '0.2rem 0.625rem', borderRadius: '9999px', fontSize: '0.6875rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', background: v === 'Ativa' ? 'rgba(52,211,153,0.12)' : 'rgba(248,113,113,0.12)', color: v === 'Ativa' ? '#34d399' : '#f87171', border: `1px solid ${v === 'Ativa' ? 'rgba(52,211,153,0.2)' : 'rgba(248,113,113,0.2)'}` }}>
          {v}
        </span>
      )
    },
    {
      key: 'criadaEm', label: 'Criado em', tipo: 'texto',
      tooltipTitulo: 'Data de Criação', tooltipDescricao: 'Data em que o espaço de trabalho foi cadastrado no sistema',
      render: (v) => <span style={{ color: '#94a3b8' }}>{v}</span>
    }
  ]

  const ACOES: TabelaGlobalAcao<Empresa>[] = [
    {
      id: 'suspend',
      icone: <PauseCircle size={16} weight="bold" />, // Será atualizado condicionalmente embaixo
      tooltip: 'Suspender',
      onClick: handleSuspend,
      renderCustom: (item) => (
        <TooltipGlobal descricao={item.status === 'Ativa' ? 'Todo acesso deste espaço de trabalho será bloqueado imediatamente' : 'Reativar acesso para este espaço de trabalho'}>
          <button
            type="button"
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleSuspend(item); }}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 28, height: 28, borderRadius: '50%', background: 'transparent', border: '1px solid transparent', color: '#64748b', cursor: 'pointer', transition: 'all 0.15s', flexShrink: 0 }}
            onMouseEnter={ev => { ev.currentTarget.style.background = item.status === 'Ativa' ? 'rgba(251,191,36,0.12)' : 'rgba(52,211,153,0.12)'; ev.currentTarget.style.borderColor = item.status === 'Ativa' ? 'rgba(251,191,36,0.3)' : 'rgba(52,211,153,0.3)'; ev.currentTarget.style.color = item.status === 'Ativa' ? '#fbbf24' : '#34d399' }}
            onMouseLeave={ev => { ev.currentTarget.style.background = 'transparent'; ev.currentTarget.style.borderColor = 'transparent'; ev.currentTarget.style.color = '#64748b' }}
          >
            {item.status === 'Ativa' ? <PauseCircle size={16} weight="bold" /> : <PlayCircle size={16} weight="bold" />}
          </button>
        </TooltipGlobal>
      )
    },
    {
      id: 'edit',
      icone: <PencilSimple size={15} weight="bold" />,
      tooltip: 'Editar',
      onClick: handleEdit,
    },
    {
      id: 'delete',
      icone: <Trash size={15} weight="bold" />,
      tooltip: 'Excluir',
      onClick: handleDelete,
      onRenderStyle: () => ({ background: 'rgba(248,113,113,0.12)', borderColor: 'rgba(248,113,113,0.3)', color: '#f87171' })
    }
  ]

  const COLUNAS_EXPORT: ColunasExport[] = [
    { header: 'Nome',        key: 'nome'       },
    { header: 'Subdomínio',  key: 'subdominio' },
    { header: 'Usuários',    key: 'usuarios'   },
    { header: 'Status',      key: 'status'     },
    { header: 'Criado em',   key: 'criadaEm'   },
  ]
  const OPCOES_EXPORT = { nomeArquivo: 'espacos-de-trabalho', titulo: 'Espaços de Trabalho' }

  const ACOES_EXPORT: TabelaExportAcao<Empresa>[] = [
    { label: 'Excel (.xlsx)', icone: <FileXls size={14} weight="bold" />, onClick: (dados) => void exportarExcel(dados.map(d => ({ ...d, subdominio: `${d.subdominio}.gravity.com.br` })) as any, COLUNAS_EXPORT, OPCOES_EXPORT) },
    { label: 'CSV', icone: <FileCsv size={14} weight="bold" />, onClick: (dados) => void exportarCSV(dados.map(d => ({ ...d, subdominio: `${d.subdominio}.gravity.com.br` })) as any, COLUNAS_EXPORT, OPCOES_EXPORT) },
    { label: 'TXT', icone: <FileText size={14} weight="bold" />, onClick: (dados) => void exportarTXT(dados.map(d => ({ ...d, subdominio: `${d.subdominio}.gravity.com.br` })) as any, COLUNAS_EXPORT, OPCOES_EXPORT) },
    { label: 'XML', icone: <Code size={14} weight="bold" />, onClick: (dados) => void exportarXML(dados.map(d => ({ ...d, subdominio: `${d.subdominio}.gravity.com.br` })) as any, COLUNAS_EXPORT, OPCOES_EXPORT) },
    { label: 'PDF', icone: <FilePdf size={14} weight="bold" />, onClick: (dados) => void exportarPDF(dados.map(d => ({ ...d, subdominio: `${d.subdominio}.gravity.com.br` })) as any, COLUNAS_EXPORT, OPCOES_EXPORT) },
    { label: 'JSON', icone: <Code size={14} weight="bold" />, onClick: (dados) => void exportarJSON(dados.map(d => ({ ...d, subdominio: `${d.subdominio}.gravity.com.br` })) as any, COLUNAS_EXPORT, OPCOES_EXPORT) },
  ]

  return (
    <>
    <PaginaGlobal
      className="ws-fade-up"
      layout="lista"
      cabecalho={
        <CabecalhoGlobal
          icone={<Buildings weight="duotone" size={22} />}
          titulo="Espaços de Trabalho"
          subtitulo="Gerencie todos os espaços de trabalho cadastrados na sua organização"
        />
      }
      stats={
        <>
          <CardBasicoGlobal
            titulo="Total de Espaços"
            icone={<TreeStructure weight="duotone" size={16} style={{ color: 'var(--ws-accent)' }} />}
            valor={empresas.length}
            periodos={[
              { periodo: '7d',  rotulo: '7 dias',  valor: '+1',  direcao: 'up',     descricao: 'vs semana anterior' },
              { periodo: '30d', rotulo: '30 dias', valor: '+3',  direcao: 'up',     descricao: 'vs mês anterior'    },
              { periodo: '6m',  rotulo: '6 meses', valor: '+12', direcao: 'up',     descricao: 'vs semestre anterior'},
              { periodo: '1a',  rotulo: '1 ano',   valor: '+30', direcao: 'up',     descricao: 'vs ano anterior'    },
            ] as PeriodoTendencia[]}
            tooltip={
              <>
                <p className="cg-tooltip__title">Visão Geral</p>
                <div className="cg-tooltip__row">
                  <span>Total cadastradas</span>
                  <strong>{empresas.length}</strong>
                </div>
                <div className="cg-tooltip__row">
                  <span>Adicionadas hoje</span>
                  <strong>0</strong>
                </div>
              </>
            }
          />
          <CardBasicoGlobal
            titulo="Espaços Ativos"
            icone={<CheckCircle weight="duotone" size={16} style={{ color: '#34d399' }} />}
            valor={ativas}
            variante="sucesso"
            periodos={[
              { periodo: '7d',  rotulo: '7 dias',  valor: '+1',  direcao: 'up',     descricao: 'vs semana anterior' },
              { periodo: '30d', rotulo: '30 dias', valor: '+2',  direcao: 'up',     descricao: 'vs mês anterior'    },
              { periodo: '6m',  rotulo: '6 meses', valor: '+8',  direcao: 'up',     descricao: 'vs semestre anterior'},
              { periodo: '1a',  rotulo: '1 ano',   valor: '-1',  direcao: 'down',   descricao: 'vs ano anterior'    },
            ] as PeriodoTendencia[]}
            tooltip={
              <>
                <p className="cg-tooltip__title">Atividade</p>
                <div className="cg-tooltip__row">
                  <span>Ativas</span>
                  <strong style={{ color: '#34d399' }}>{ativas}</strong>
                </div>
                <div className="cg-tooltip__row">
                  <span>Suspensas</span>
                  <strong style={{ color: '#f87171' }}>{suspensas}</strong>
                </div>
                <div className="cg-tooltip__divider" />
                <div className="cg-tooltip__row">
                  <span>Taxa de atividade</span>
                  <strong style={{ color: '#34d399' }}>{empresas.length ? Math.round(ativas / empresas.length * 100) : 0}%</strong>
                </div>
              </>
            }
          />
          <CardBasicoGlobal
            titulo="Limite do Plano"
            icone={<Gauge weight="duotone" size={16} style={{ color: '#fbbf24' }} />}
            valor={empresas.length}
            subtexto={`${limite - empresas.length} slots disponíveis`}
            periodos={[
              { periodo: '7d',  rotulo: '7 dias',  valor: '+1',  direcao: 'up',     descricao: 'vs semana anterior' },
              { periodo: '30d', rotulo: '30 dias', valor: '+3',  direcao: 'up',     descricao: 'vs mês anterior'    },
              { periodo: '6m',  rotulo: '6 meses', valor: '+12', direcao: 'up',     descricao: 'vs semestre anterior'},
              { periodo: '1a',  rotulo: '1 ano',   valor: '+30', direcao: 'up',     descricao: 'vs ano anterior'    },
            ] as PeriodoTendencia[]}
            variante="aviso"
            tooltip={
              <>
                <p className="cg-tooltip__title">Plano Enterprise</p>
                <div className="cg-tooltip__row">
                  <span>Limite total</span>
                  <strong>{limite}</strong>
                </div>
                <div className="cg-tooltip__row">
                  <span>Utilizados</span>
                  <strong style={{ color: '#fbbf24' }}>{empresas.length}</strong>
                </div>
                <div className="cg-tooltip__row">
                  <span>Disponíveis</span>
                  <strong style={{ color: '#34d399' }}>{limite - empresas.length}</strong>
                </div>
                <div className="cg-tooltip__divider" />
                <div className="cg-tooltip__row">
                  <span>Uso</span>
                  <strong style={{ color: empresas.length / limite > 0.8 ? '#f87171' : '#fbbf24' }}>
                    {Math.round(empresas.length / limite * 100)}%
                  </strong>
                </div>
              </>
            }
          />
          <CardGraficoGlobal
            titulo="Status dos Espaços"
            icone={<ChartPieSlice weight="duotone" size={16} style={{ color: '#818cf8' }} />}
            total={empresas.length}
            valorPrincipal={ativas}
            corGauge="#34d399"
            legenda={[
              { label: 'Ativas',    valor: ativas,    cor: 'green'  },
              { label: 'Suspensas', valor: suspensas, cor: 'yellow' },
            ]}
            tooltip={
              <>
                <div className="cg-tooltip__row">
                  <span>Ativas</span>
                  <strong style={{ color: '#34d399' }}>{ativas}</strong>
                </div>
                <div className="cg-tooltip__row">
                  <span>Suspensas</span>
                  <strong style={{ color: '#fbbf24' }}>{suspensas}</strong>
                </div>
                <div className="cg-tooltip__divider" />
                <div className="cg-tooltip__row">
                  <span>Total</span>
                  <strong>{empresas.length}</strong>
                </div>
                <div className="cg-tooltip__row">
                  <span>Taxa de atividade</span>
                  <strong style={{ color: '#34d399' }}>{empresas.length ? Math.round(ativas / empresas.length * 100) : 0}%</strong>
                </div>
              </>
            }
          />
        </>
      }
      acoes={
        <BotaoNovoGlobal
          rotulo="Novo Espaço de Trabalho"
          onClick={() => setShowForm(v => !v)}
          ativo={showForm}
        />
      }
    >
      {showForm && (
        <div className="ws-form-card" style={{ marginBottom: '1.5rem' }}>
          <p className="ws-section-title" style={{ width: 'max-content' }}>
            <TooltipGlobal titulo="Novo Espaço" descricao="Cadastre um novo espaço de trabalho para segregar acessos e dados operacionais">
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', cursor: 'help' }}>
                <Buildings weight="duotone" size={14} color="#818cf8" />
                Novo Espaço de Trabalho
              </span>
            </TooltipGlobal>
          </p>
          <div className="ws-form-row">
            <div className="ws-field">
              <label>
                <TooltipGlobal titulo="Nome da Empresa" descricao="Razão social ou nome fantasia do novo espaço de trabalho">
                  <span>Nome da Empresa</span>
                </TooltipGlobal>
              </label>
              <input
                placeholder="Ex: Acme Logística SP"
                value={nome}
                onChange={e => setNome(e.target.value)}
              />
            </div>
            <div className="ws-field">
              <label>
                <TooltipGlobal titulo="Subdomínio" descricao="Endereço de acesso exclusivo deste espaço de trabalho">
                  <span>Subdomínio</span>
                </TooltipGlobal>
              </label>
              <input
                placeholder="Ex: acme-logistica-sp"
                value={subdominio}
                onChange={e => handleSubChange(e.target.value)}
              />
              {subdErr && <p style={{ fontSize: '0.75rem', color: '#f87171', marginTop: '0.25rem' }}>{subdErr}</p>}
              {subdominio && !subdErr && (
                <p style={{ fontSize: '0.75rem', color: 'var(--ws-muted)', marginTop: '0.25rem' }}>
                  URL: <strong style={{ color: '#818cf8' }}>{subdominio}.gravity.com.br</strong>
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
              Criar Espaço de Trabalho
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

      <div style={{ position: 'relative', zIndex: 10 }}>
        <TabelaGlobal<Empresa>
          dados={empresas}
          colunas={COLUNAS}
          acoes={ACOES}
          acoesExportacao={ACOES_EXPORT}
          mensagemVazio="Nenhum resultado na busca."
          mensagemSemFiltro="Nenhum espaço de trabalho cadastrado."
        />
      </div>
    </PaginaGlobal>

    <ModalEditarEspaco
      empresa={empresaEditando}
      aoFechar={() => setEmpresaEditando(null)}
      aoSalvar={(dados) => {
        setEspacosDeTrabalho(prev =>
          prev.map(e => e.id === empresaEditando?.id ? { ...e, ...dados } : e)
        )
        setEmpresaEditando(null)
      }}
      aoExcluir={(emp) => {
        setEspacosDeTrabalho(prev => prev.filter(e => e.id !== emp.id))
      }}
    />

    <ModalExclusao
      aberto={!!empresaParaExcluir}
      titulo="Excluir Espaço de Trabalho"
      descricao={<>Tem certeza de que deseja excluir permanentemente o espaço de trabalho <strong>{empresaParaExcluir?.nome}</strong>?</>}
      nomeItem="Esta ação é irreversível e excluirá todos os dados permanentemente."
      aoConfirmar={confirmarExclusao}
      aoCancelar={() => setEmpresaParaExcluir(null)}
    />
    </>
  )
}

