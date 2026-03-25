import React, { useState } from 'react'
import { ShoppingBagOpen, Tag, Users, CurrencyCircleDollar, BoxArrowUp, CalendarBlank, Wrench, Sliders, Headset, Clock, Coins, PauseCircle, PlayCircle, PencilSimple, Handshake, Buildings, CalendarCheck } from '@phosphor-icons/react'
import { PaginaGlobal } from '@nucleo/pagina-global'
import { CabecalhoGlobal } from '@nucleo/cabecalho-global'
import { TabelaGlobal, type TabelaGlobalColuna, type TabelaGlobalAcao } from '@nucleo/tabela-global'
import { StatCardGlobal } from '@nucleo/stat-card-global'
import { BotaoNovoAdminGlobal } from '@nucleo/botao-novo-admin-global'
import { ModalFormularioAbasGlobal } from '@nucleo/modal-formulario-abas-global'
import { SecaoFormularioGlobal } from '@nucleo/modal-formulario-global'
import { GeralCampoGlobal } from '@nucleo/geral-campo-global'
import { SelectGlobal } from '@nucleo/select-global'

type ProdutoStatus = 'Ativo' | 'Em Breve' | 'Legado' | 'Suspenso'

type ProdutoConfigured = {
  id: string
  nome: string
  descricao: string
  publicoAlvo: string
  valorBase: string
  limite: string
  cobrancaPor: string
  status: ProdutoStatus
}

type NegociacaoEspecial = {
  id: string
  produtoId: string
  cliente: string
  acordo: string
  vigencia: string
}

const produtosGlobais: ProdutoConfigured[] = [
  {
    id: 'p1',
    nome: 'SimulaCusto',
    descricao: 'Gestão de custos estimados de exportação e importação',
    publicoAlvo: 'Importadores, exportadores, despachantes aduaneiros e tradings',
    valorBase: 'Free',
    limite: 'Até 10 estim.',
    cobrancaPor: 'Excedente: R$10,90 / usuário',
    status: 'Ativo'
  },
  {
    id: 'p2',
    nome: 'Gravity Journey',
    descricao: 'Controle de fluxo logístico e processos end-to-end',
    publicoAlvo: 'Agentes de carga, Tradings, Importadores',
    valorBase: 'R$ 499,00',
    limite: 'Até 50 processos',
    cobrancaPor: 'R$ 5,50 / processo extra',
    status: 'Ativo'
  },
  {
    id: 'p3',
    nome: 'Gravity Analytics',
    descricao: 'Dashboards e BI em tempo real das operações',
    publicoAlvo: 'C-Level, Gestores Logísticos',
    valorBase: 'R$ 299,00',
    limite: 'Acessos ilimitados',
    cobrancaPor: 'Fixo mensal',
    status: 'Ativo'
  },
  {
    id: 'p4',
    nome: 'AutoDUIMP',
    descricao: 'Automatização e registro de DUIMP',
    publicoAlvo: 'Despachantes Aduaneiros',
    valorBase: 'R$ 899,00',
    limite: 'Até 100 DUIMPs',
    cobrancaPor: 'R$ 8,90 / DUIMP extra',
    status: 'Em Breve'
  }
]

const negociacoesEspeciaisIniciais: NegociacaoEspecial[] = [
  { id: 'n1', produtoId: 'p1', cliente: 'Importas SA', acordo: 'R$ 5,90 / usuário (excedente)', vigencia: '12 meses' },
  { id: 'n2', produtoId: 'p2', cliente: 'TechCorp Brasil', acordo: 'R$ 3,00 / processo extra', vigencia: 'Indeterminado' },
  { id: 'n3', produtoId: 'p4', cliente: 'Mega Retail', acordo: 'R$ 7,50 / DUIMP extra', vigencia: '24 meses' },
]

const getStatusBadge = (status: ProdutoStatus) => {
  switch (status) {
    case 'Ativo': return 'ws-badge-success'
    case 'Em Breve': return 'ws-badge-warning'
    case 'Legado': return 'ws-badge-danger'
    case 'Suspenso': return 'ws-badge-warning'
    default: return 'ws-badge-neutral'
  }
}

const getStatusLabel = (status: ProdutoStatus) => {
  switch (status) {
    case 'Ativo': return 'ATIVO'
    case 'Em Breve': return 'EM BREVE'
    case 'Legado': return 'LEGADO'
    case 'Suspenso': return 'SUSPENSO'
    default: return status
  }
}

const getStatusColor = (status: ProdutoStatus) => {
  switch (status) {
    case 'Ativo': return { cor: '#34d399', bg: 'rgba(52,211,153,0.12)' }
    case 'Em Breve': return { cor: '#818cf8', bg: 'rgba(129,140,248,0.12)' }
    case 'Legado': return { cor: '#f87171', bg: 'rgba(248,113,113,0.12)' }
    case 'Suspenso': return { cor: '#fbbf24', bg: 'rgba(251,191,36,0.12)' }
    default: return { cor: '#64748b', bg: 'rgba(100,116,139,0.12)' }
  }
}

const MOEDAS_OPCOES = [
  { valor: 'BRL', rotulo: 'R$ — Real Brasileiro' },
  { valor: 'AED', rotulo: 'AED — Dirham dos Emirados' },
  { valor: 'ARS', rotulo: 'ARS — Peso Argentino' },
  { valor: 'AUD', rotulo: 'AUD — Dólar Australiano' },
  { valor: 'CAD', rotulo: 'CAD — Dólar Canadense' },
  { valor: 'CHF', rotulo: 'CHF — Franco Suíço' },
  { valor: 'CLP', rotulo: 'CLP — Peso Chileno' },
  { valor: 'CNY', rotulo: 'CNY — Yuan Chinês' },
  { valor: 'COP', rotulo: 'COP — Peso Colombiano' },
  { valor: 'EUR', rotulo: 'EUR — Euro' },
  { valor: 'GBP', rotulo: 'GBP — Libra Esterlina' },
  { valor: 'JPY', rotulo: 'JPY — Iene Japonês' },
  { valor: 'MXN', rotulo: 'MXN — Peso Mexicano' },
  { valor: 'PYG', rotulo: 'PYG — Guarani Paraguaio' },
  { valor: 'USD', rotulo: 'USD — Dólar Americano' },
  { valor: 'UYU', rotulo: 'UYU — Peso Uruguaio' },
]

const TIPOS_COBRANCA_OPCOES = [
  'Mensalidade', 'Por Processo', 'Por Documento',
  'Por DI/DUIMP', 'Por DUE', 'Por Produto', 'Por Fluxo', 'Por LPCO',
].map(t => ({ valor: t, rotulo: t }))

/** Formata valor monetário durante a digitação → ex: "1.234,56" */
function mascaraMoeda(valor: string): string {
  // Remove tudo que não for dígito
  const apenasDigitos = valor.replace(/\D/g, '')
  if (!apenasDigitos) return ''
  // Interpreta os últimos 2 dígitos como centavos
  const centavos = apenasDigitos.padStart(3, '0')
  const inteiro = centavos.slice(0, -2).replace(/^0+/, '') || '0'
  const dec = centavos.slice(-2)
  // Formata parte inteira com pontos de milhar
  const inteiroFormatado = inteiro.replace(/\B(?=(\d{3})+(?!\d))/g, '.')
  return `${inteiroFormatado},${dec}`
}

export function ProdutosAdmin() {
  const [produtos, setProdutos] = useState<ProdutoConfigured[]>(produtosGlobais)
  const [negociacoes, setNegociacoes] = useState<NegociacaoEspecial[]>(negociacoesEspeciaisIniciais)

  const toggleProdutoStatus = (id: string) => {
    setProdutos(prev => prev.map(p => {
      if (p.id !== id) return p
      const novoStatus: ProdutoStatus = p.status === 'Ativo' ? 'Suspenso' : 'Ativo'
      return { ...p, status: novoStatus }
    }))
  }

  const [tab, setTab] = useState<'catalogo' | 'negociacoes'>('catalogo')
  const [modalAberto, setModalAberto] = useState(false)
  const [produtoEditando, setProdutoEditando] = useState<ProdutoConfigured | null>(null)
  const [formDirty, setFormDirty] = useState(false)

  // 01. Dados Básicos
  const [formNome, setFormNome] = useState('')
  const [formDescricao, setFormDescricao] = useState('')
  const [formDataLancamento, setFormDataLancamento] = useState('')
  const [formStatus, setFormStatus] = useState<'ativo' | 'inativo'>('ativo')

  // 02. Setup
  const [temSetup, setTemSetup] = useState<'sim' | 'nao'>('nao')
  const [moedaSetup, setMoedaSetup] = useState('BRL')
  const [valorSetup, setValorSetup] = useState('')

  // 03. Valores do Produto
  const [tipoCobranca, setTipoCobranca] = useState('')
  const [moedaProduto, setMoedaProduto] = useState('BRL')
  const [valorUnitario, setValorUnitario] = useState('')
  const [valorMinimo, setValorMinimo] = useState('')
  const [valorTotal, setValorTotal] = useState('')

  // 04. Usuários
  const [limiteUsuarios, setLimiteUsuarios] = useState<'ilimitada' | 'limitada'>('limitada')
  const [qtdUsuarios, setQtdUsuarios] = useState('')
  const [moedaUsuario, setMoedaUsuario] = useState('BRL')
  const [valorUsuarioAdicional, setValorUsuarioAdicional] = useState('')

  // 05. Help Desk
  const [totalHoras, setTotalHoras] = useState('')
  const [moedaHelpDesk, setMoedaHelpDesk] = useState('BRL')

  // 06. Negociação Especial
  const [vincularOrg, setVincularOrg] = useState<'sim' | 'nao'>('nao')
  const [orgSelecionada, setOrgSelecionada] = useState<string | null>(null)
  const [acordoNeg, setAcordoNeg] = useState('')
  const [vigenciaNeg, setVigenciaNeg] = useState('')

  const dirty = (fn: () => void) => { fn(); setFormDirty(true) }

  const handleFecharModal = () => {
    setModalAberto(false)
    setProdutoEditando(null)
    setFormDirty(false)
    setFormNome(''); setFormDescricao(''); setFormDataLancamento(''); setFormStatus('ativo')
    setTemSetup('nao'); setMoedaSetup('BRL'); setValorSetup('')
    setTipoCobranca(''); setMoedaProduto('BRL'); setValorUnitario(''); setValorMinimo(''); setValorTotal('')
    setLimiteUsuarios('limitada'); setQtdUsuarios(''); setMoedaUsuario('BRL'); setValorUsuarioAdicional('')
    setTotalHoras(''); setMoedaHelpDesk('BRL')
    setVincularOrg('nao'); setOrgSelecionada(null); setAcordoNeg(''); setVigenciaNeg('')
  }

  const handleEditarProduto = (item: ProdutoConfigured) => {
    setProdutoEditando(item)
    setFormNome(item.nome)
    setFormDescricao(item.descricao)
    setFormDataLancamento('')
    setFormStatus(item.status === 'Ativo' ? 'ativo' : 'inativo')
    setModalAberto(true)
  }



  const TogBtn = ({ val, cur, set, label }: { val: string, cur: string, set: (v: string) => void, label: string }) => (
    <button type="button" onClick={() => dirty(() => set(val))} style={{
      padding: '0.375rem 1rem', borderRadius: '9999px', cursor: 'pointer', fontSize: '0.8125rem', fontWeight: cur === val ? 600 : 400, transition: 'all 0.15s',
      border: `1px solid ${cur === val ? 'var(--color-primary)' : 'rgba(255,255,255,0.12)'}`,
      background: cur === val ? 'rgba(16,185,129,0.15)' : 'transparent',
      color: cur === val ? 'var(--color-primary)' : 'var(--ws-muted, #94a3b8)',
    }}>{label}</button>
  )

  const COLUNAS_PRODUTOS: TabelaGlobalColuna<ProdutoConfigured>[] = [
    {
      key: 'nome', label: 'Nome do Produto', tipo: 'texto',
      tooltipTitulo: 'Entity: Produto', tooltipDescricao: 'Identificação comercial mapeada na arquitetura de billing.',
      render: (v) => <span style={{ fontWeight: 600, color: 'var(--ws-text)' }}>{v}</span>
    },
    {
      key: 'descricao', label: 'O que é', tipo: 'texto',
      tooltipTitulo: 'Meta Description', tooltipDescricao: 'Resumo estruturado exibido no frontend para conversão.',
      render: (v) => <span style={{ color: 'var(--ws-muted)', fontSize: '0.85rem' }}>{v}</span>
    },
    {
      key: 'publicoAlvo', label: 'Para quem', tipo: 'texto',
      tooltipTitulo: 'Segmentação Geográfica/Mercado', tooltipDescricao: 'Filtro usado pelo motor de recomendação (IA).',
      render: (v) => <span style={{ color: 'var(--ws-muted)', fontSize: '0.85rem' }}>{v}</span>
    },
    {
      key: 'valorBase', label: 'Valor Base', tipo: 'texto',
      tooltipTitulo: 'Pricing Base', tooltipDescricao: 'SKU inicial antes de modificadores de uso ou descontos.',
      render: (v) => <span style={{ fontFamily: 'monospace', fontWeight: 700, color: 'var(--ws-text)', fontSize: '0.9375rem' }}>{v}</span>
    },
    {
      key: 'limite', label: 'Limite / Franquia', tipo: 'texto',
      tooltipTitulo: 'Rate Limit / Quota', tooltipDescricao: 'Limites técnicos (hard/soft) configurados no API Gateway.',
      render: (v) => <span style={{ color: 'var(--ws-muted)' }}>{v}</span>
    },
    {
      key: 'cobrancaPor', label: 'Cobrança Adicional', tipo: 'texto',
      tooltipTitulo: 'Billing Excedente', tooltipDescricao: 'Métrica de pay-as-you-go coletada via eventos (Kafka).',
      render: (v) => <span style={{ color: 'var(--ws-text)', fontSize: '0.85rem' }}>{v}</span>
    },
    {
      key: 'status', label: 'Status', tipo: 'texto',
      tooltipTitulo: 'Lifecycle Status', tooltipDescricao: 'Determina disponibilidade no checkout e rotina de deprecation.',
      render: (v) => {
        const st = v as ProdutoStatus
        const { cor, bg } = getStatusColor(st)
        return (
          <span style={{ display: 'inline-flex', padding: '0.2rem 0.625rem', borderRadius: '9999px', fontSize: '0.6875rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', background: bg, color: cor, border: `1px solid ${bg}` }}>
            {getStatusLabel(st)}
          </span>
        )
      }
    }
  ]

  const ACOES_PRODUTOS: TabelaGlobalAcao<ProdutoConfigured>[] = [
    {
      id: 'toggle-status',
      icone: <PauseCircle size={15} weight="bold" />,
      tooltip: 'Ativar / Suspender Produto',
      onClick: (item) => toggleProdutoStatus(item.id),
      renderCustom: (item) => (
        <button
          type="button"
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleProdutoStatus(item.id) }}
          title={item.status === 'Ativo' ? 'Suspender produto' : 'Ativar produto'}
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 28, height: 28, borderRadius: '50%', background: 'transparent', border: '1px solid transparent', color: '#64748b', cursor: 'pointer', transition: 'all 0.15s', flexShrink: 0 }}
          onMouseEnter={ev => { ev.currentTarget.style.background = item.status === 'Ativo' ? 'rgba(251,191,36,0.12)' : 'rgba(52,211,153,0.12)'; ev.currentTarget.style.borderColor = item.status === 'Ativo' ? 'rgba(251,191,36,0.3)' : 'rgba(52,211,153,0.3)'; ev.currentTarget.style.color = item.status === 'Ativo' ? '#fbbf24' : '#34d399' }}
          onMouseLeave={ev => { ev.currentTarget.style.background = 'transparent'; ev.currentTarget.style.borderColor = 'transparent'; ev.currentTarget.style.color = '#64748b' }}
        >
          {item.status === 'Ativo' ? <PauseCircle size={16} weight="bold" /> : <PlayCircle size={16} weight="bold" />}
        </button>
      )
    },
    {
      id: 'editar',
      icone: <PencilSimple size={15} weight="bold" />,
      tooltip: 'Editar Produto',
      onClick: (item) => handleEditarProduto(item),
      renderCustom: (item) => (
        <button
          type="button"
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleEditarProduto(item) }}
          title="Editar produto"
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 28, height: 28, borderRadius: '50%', background: 'transparent', border: '1px solid transparent', color: '#64748b', cursor: 'pointer', transition: 'all 0.15s', flexShrink: 0 }}
          onMouseEnter={ev => { ev.currentTarget.style.background = 'rgba(129,140,248,0.12)'; ev.currentTarget.style.borderColor = 'rgba(129,140,248,0.3)'; ev.currentTarget.style.color = '#818cf8' }}
          onMouseLeave={ev => { ev.currentTarget.style.background = 'transparent'; ev.currentTarget.style.borderColor = 'transparent'; ev.currentTarget.style.color = '#64748b' }}
        >
          <PencilSimple size={16} weight="bold" />
        </button>
      )
    }
  ]

  const COLUNAS_NEGOCIACOES: TabelaGlobalColuna<NegociacaoEspecial>[] = [
    {
      key: 'cliente', label: 'Cliente', tipo: 'texto',
      tooltipTitulo: 'Referência ao Tenant ID', tooltipDescricao: 'Vinculação FK com a tabela de Organizations (Clerk).',
      render: (v) => <span style={{ fontWeight: 600 }}>{v}</span>
    },
    {
      key: 'produtoId', label: 'Produto Relacionado', tipo: 'texto',
      tooltipTitulo: 'Referência ao Product ID', tooltipDescricao: 'FK para a tabela de produtos globais no banco master.',
      render: (v) => {
        const prod = produtos.find(p => p.id === v)
        return <span style={{ color: 'var(--ws-text)' }}>{prod ? prod.nome : '—'}</span>
      }
    },
    {
      key: 'acordo', label: 'Condição Especial', tipo: 'texto',
      tooltipTitulo: 'Override de Preço', tooltipDescricao: 'Regra de exceção aplicada no motor de billing no final do mês.',
      render: (v) => <span style={{ color: '#818cf8', fontWeight: 500 }}>{v}</span>
    },
    {
      key: 'vigencia', label: 'Vigência', tipo: 'texto',
      tooltipTitulo: 'TTL / Data de Expiração', tooltipDescricao: 'Determina reversão automática para o pricing base após a data limite.',
      render: (v) => <span style={{ color: 'var(--ws-muted)', fontSize: '0.85rem' }}>{v}</span>
    }
  ]

  return (
    <PaginaGlobal
      className="ws-fade-up"
      layout="lista"
      cabecalho={
        <CabecalhoGlobal
          titulo="Produtos & Serviços"
          subtitulo="Gestão do catálogo de produtos, franquias e negociações de preços da plataforma Gravity."
          icone={<ShoppingBagOpen weight="duotone" size={22} color="#818cf8" />}
        />
      }
      stats={
        <>
          <StatCardGlobal
            titulo="Total de Produtos"
            icone={<BoxArrowUp weight="duotone" size={16} />}
            valor={<span style={{ fontSize: '1.5rem' }}>{produtos.length}</span>}
            subtexto="No catálogo oficial"
            variante="padrao"
          />
          <StatCardGlobal
            titulo="Produtos Ativos"
            icone={<Tag weight="duotone" size={16} />}
            valor={<span style={{ fontSize: '1.5rem' }}>{produtos.filter(p => p.status === 'Ativo').length}</span>}
            subtexto="Disponíveis para assinatura"
            variante="sucesso"
          />
          <StatCardGlobal
            titulo="Negociações Ativas"
            icone={<Users weight="duotone" size={16} />}
            valor={<span style={{ fontSize: '1.5rem' }}>{negociacoes.length}</span>}
            subtexto="Condições exclusivas de clientes"
            variante="aviso"
          />
        </>
      }
      toolbar={
        <div className="ws-tabs" style={{ margin: 0 }}>
          <button className={`ws-tab${tab === 'catalogo' ? ' active' : ''}`} onClick={() => setTab('catalogo')}>
            Catálogo Geral
          </button>
          <button className={`ws-tab${tab === 'negociacoes' ? ' active' : ''}`} onClick={() => setTab('negociacoes')}>
            Negociações Especiais
          </button>
        </div>
      }
    >
      {tab === 'catalogo' && (
        <div className="ws-fade-up">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <p className="ws-section-title" style={{ margin: 0 }}>
              <Tag weight="duotone" size={14} color="#818cf8" /> Catálogo Geral
            </p>
            <BotaoNovoAdminGlobal 
              rotulo="Novo Produto" 
              onClick={() => setModalAberto(true)} 
            />
          </div>
          <div style={{ position: 'relative', zIndex: 10 }}>
            <TabelaGlobal<ProdutoConfigured>
              dados={produtos}
              colunas={COLUNAS_PRODUTOS}
              acoes={ACOES_PRODUTOS}
              mensagemVazio="Nenhum produto cadastrado no catálogo."
            />
          </div>
        </div>
      )}

      {tab === 'negociacoes' && (
        <div className="ws-fade-up">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <p className="ws-section-title" style={{ margin: 0 }}>
              <CurrencyCircleDollar weight="duotone" size={14} color="#f59e0b" /> Negociações Especiais
            </p>
          </div>
          <div style={{ position: 'relative', zIndex: 10 }}>
            <TabelaGlobal<NegociacaoEspecial>
              dados={negociacoes}
              colunas={COLUNAS_NEGOCIACOES}
              mensagemVazio="Nenhuma negociação especial registrada."
            />
          </div>
        </div>
      )}

      {/* Modal de Novo Produto */}
      <ModalFormularioAbasGlobal
        aberto={modalAberto}
        aoFechar={handleFecharModal}
        aoSalvar={() => {
          // Adiciona negociação especial se vinculada
          if (vincularOrg === 'sim' && orgSelecionada && acordoNeg.trim()) {
            const novaId = `n${Date.now()}`
            const prodId = produtoEditando?.id ?? `p${Date.now()}`
            setNegociacoes(prev => [
              ...prev,
              { id: novaId, produtoId: prodId, cliente: orgSelecionada, acordo: acordoNeg.trim(), vigencia: vigenciaNeg.trim() || 'Indeterminado' }
            ])
          }
          handleFecharModal()
        }}
        icone={<ShoppingBagOpen weight="duotone" size={24} />}
        titulo={produtoEditando ? `Editar: ${produtoEditando.nome}` : 'Novo Produto'}
        subtitulo={produtoEditando ? 'Edite os dados do produto selecionado.' : 'Preencha os dados básicos para adicionar um novo produto.'}
        tamanho="lg"
        dirty={formDirty}
        podesSalvar={formDirty && formNome.trim().length > 0}
        abas={[
          {
            id: 'dados-basicos',
            rotulo: 'Dados Básicos',
            conteudo: (
              <div style={{ padding: '1rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <SecaoFormularioGlobal icone={<Tag size={16} weight="duotone" />} titulo="Dados Básicos" tooltip="Identificação e configuração geral do produto" />

                <GeralCampoGlobal label="Nome do Produto" obrigatorio>
                  <div className="ws-input-icon-wrap">
                    <ShoppingBagOpen size={16} />
                    <input placeholder="Ex: Gravity Analytics" style={{ width: '100%' }} value={formNome} onChange={e => dirty(() => setFormNome(e.target.value))} />
                  </div>
                </GeralCampoGlobal>

                <GeralCampoGlobal label="Descrição Curta" obrigatorio>
                  <div className="ws-input-icon-wrap">
                    <Tag size={16} />
                    <input placeholder="Ex: Dashboards e BI em tempo real" style={{ width: '100%' }} value={formDescricao} onChange={e => dirty(() => setFormDescricao(e.target.value))} />
                  </div>
                </GeralCampoGlobal>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <GeralCampoGlobal label="Data de Lançamento">
                    <div className="ws-input-icon-wrap">
                      <CalendarBlank size={16} />
                      <input type="date" style={{ width: '100%' }} value={formDataLancamento} onChange={e => dirty(() => setFormDataLancamento(e.target.value))} />
                    </div>
                  </GeralCampoGlobal>

                  <GeralCampoGlobal label="Status">
                    <div style={{ display: 'flex', gap: '0.5rem', paddingTop: '0.375rem' }}>
                      <TogBtn val="ativo" cur={formStatus} set={v => setFormStatus(v as 'ativo' | 'inativo')} label="Ativo" />
                      <TogBtn val="inativo" cur={formStatus} set={v => setFormStatus(v as 'ativo' | 'inativo')} label="Inativo" />
                    </div>
                  </GeralCampoGlobal>
                </div>
              </div>
            )
          },
          {
            id: 'setup',
            rotulo: 'Setup',
            conteudo: (
              <div style={{ padding: '1rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <SecaoFormularioGlobal icone={<Wrench size={16} weight="duotone" />} titulo="Setup" />

                <GeralCampoGlobal label="Tem Setup?">
                  <div style={{ display: 'flex', gap: '0.5rem', paddingTop: '0.375rem' }}>
                    <TogBtn val="sim" cur={temSetup} set={v => setTemSetup(v as 'sim' | 'nao')} label="Sim" />
                    <TogBtn val="nao" cur={temSetup} set={v => setTemSetup(v as 'sim' | 'nao')} label="Não" />
                  </div>
                </GeralCampoGlobal>

                {temSetup === 'sim' && (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <GeralCampoGlobal label="Moeda do Setup">
                      <SelectGlobal
                        opcoes={MOEDAS_OPCOES}
                        valor={moedaSetup}
                        aoMudarValor={v => dirty(() => setMoedaSetup(String(v ?? 'BRL')))}
                        iconeEsquerda={<CurrencyCircleDollar size={16} />}
                        buscavel
                      />
                    </GeralCampoGlobal>
                    <GeralCampoGlobal label="Valor do Setup">
                      <div className="ws-input-icon-wrap">
                        <Coins size={16} />
                        <input placeholder="0,00" style={{ width: '100%' }} inputMode="numeric" value={valorSetup} onChange={e => dirty(() => setValorSetup(mascaraMoeda(e.target.value)))} />
                      </div>
                    </GeralCampoGlobal>
                  </div>
                )}
              </div>
            )
          },
          {
            id: 'valor-produto',
            rotulo: 'Valor do Produto',
            conteudo: (
              <div style={{ padding: '1rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <SecaoFormularioGlobal icone={<Sliders size={16} weight="duotone" />} titulo="Valores do Produto" />

                <GeralCampoGlobal label="Tipo de Cobrança">
                  <SelectGlobal
                    opcoes={TIPOS_COBRANCA_OPCOES}
                    valor={tipoCobranca || null}
                    aoMudarValor={v => dirty(() => setTipoCobranca(String(v ?? '')))}
                    iconeEsquerda={<Sliders size={16} />}
                    placeholder="Selecione o tipo..."
                    buscavel={false}
                  />
                </GeralCampoGlobal>

                <GeralCampoGlobal label="Moeda">
                  <SelectGlobal
                    opcoes={MOEDAS_OPCOES}
                    valor={moedaProduto}
                    aoMudarValor={v => dirty(() => setMoedaProduto(String(v ?? 'BRL')))}
                    iconeEsquerda={<CurrencyCircleDollar size={16} />}
                    buscavel
                  />
                </GeralCampoGlobal>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                  <GeralCampoGlobal label="Valor Unitário">
                    <div className="ws-input-icon-wrap">
                      <CurrencyCircleDollar size={16} />
                      <input placeholder="0,00" style={{ width: '100%' }} inputMode="numeric" value={valorUnitario} onChange={e => dirty(() => setValorUnitario(mascaraMoeda(e.target.value)))} />
                    </div>
                  </GeralCampoGlobal>
                  <GeralCampoGlobal label="Valor Mínimo">
                    <div className="ws-input-icon-wrap">
                      <CurrencyCircleDollar size={16} />
                      <input placeholder="0,00" style={{ width: '100%' }} inputMode="numeric" value={valorMinimo} onChange={e => dirty(() => setValorMinimo(mascaraMoeda(e.target.value)))} />
                    </div>
                  </GeralCampoGlobal>
                  <GeralCampoGlobal label="Valor Total">
                    <div className="ws-input-icon-wrap">
                      <CurrencyCircleDollar size={16} />
                      <input placeholder="0,00" style={{ width: '100%' }} inputMode="numeric" value={valorTotal} onChange={e => dirty(() => setValorTotal(mascaraMoeda(e.target.value)))} />
                    </div>
                  </GeralCampoGlobal>
                </div>
              </div>
            )
          },
          {
            id: 'usuarios',
            rotulo: 'Usuários',
            conteudo: (
              <div style={{ padding: '1rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <SecaoFormularioGlobal icone={<Users size={16} weight="duotone" />} titulo="Usuários" />

                <GeralCampoGlobal label="Quantidade de Usuários">
                  <div style={{ display: 'flex', gap: '0.5rem', paddingTop: '0.375rem' }}>
                    <TogBtn val="ilimitada" cur={limiteUsuarios} set={v => setLimiteUsuarios(v as 'ilimitada' | 'limitada')} label="Ilimitada" />
                    <TogBtn val="limitada" cur={limiteUsuarios} set={v => setLimiteUsuarios(v as 'ilimitada' | 'limitada')} label="Limitada" />
                  </div>
                </GeralCampoGlobal>

                {limiteUsuarios === 'limitada' && (
                  <>
                    <GeralCampoGlobal label="Quantidade">
                      <div className="ws-input-icon-wrap">
                        <Users size={16} />
                        <input type="number" placeholder="Ex: 10" style={{ width: '100%' }} value={qtdUsuarios} onChange={e => dirty(() => setQtdUsuarios(e.target.value))} />
                      </div>
                    </GeralCampoGlobal>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                      <GeralCampoGlobal label="Moeda">
                        <SelectGlobal
                          opcoes={MOEDAS_OPCOES}
                          valor={moedaUsuario}
                          aoMudarValor={v => dirty(() => setMoedaUsuario(String(v ?? 'BRL')))}
                          iconeEsquerda={<CurrencyCircleDollar size={16} />}
                          buscavel
                        />
                      </GeralCampoGlobal>
                      <GeralCampoGlobal label="Valor por Usuário Adicional">
                        <div className="ws-input-icon-wrap">
                          <Coins size={16} />
                          <input placeholder="0,00" style={{ width: '100%' }} inputMode="numeric" value={valorUsuarioAdicional} onChange={e => dirty(() => setValorUsuarioAdicional(mascaraMoeda(e.target.value)))} />
                        </div>
                      </GeralCampoGlobal>
                    </div>
                  </>
                )}
              </div>
            )
          },
          {
            id: 'help-desk',
            rotulo: 'Help Desk',
            conteudo: (
              <div style={{ padding: '1rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <SecaoFormularioGlobal icone={<Headset size={16} weight="duotone" />} titulo="Help Desk" />

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <GeralCampoGlobal label="Total de Horas Mensais">
                    <div className="ws-input-icon-wrap">
                      <Clock size={16} />
                      <input type="number" placeholder="Ex: 10" style={{ width: '100%' }} value={totalHoras} onChange={e => dirty(() => setTotalHoras(e.target.value))} />
                    </div>
                  </GeralCampoGlobal>
                  <GeralCampoGlobal label="Moeda do Adicional por Hora">
                    <SelectGlobal
                      opcoes={MOEDAS_OPCOES}
                      valor={moedaHelpDesk}
                      aoMudarValor={v => dirty(() => setMoedaHelpDesk(String(v ?? 'BRL')))}
                      iconeEsquerda={<CurrencyCircleDollar size={16} />}
                      buscavel
                    />
                  </GeralCampoGlobal>
                </div>
              </div>
            )
          }
        ]}
          ...(() => {
            // Aba extra de Negociações
            const ORGS_OPCOES = [
              { valor: 'Importas SA', rotulo: 'Importas SA' },
              { valor: 'TechCorp Brasil', rotulo: 'TechCorp Brasil' },
              { valor: 'Mega Retail', rotulo: 'Mega Retail' },
              { valor: 'Global Trade Ltda', rotulo: 'Global Trade Ltda' },
              { valor: 'Aduaneiro Plus', rotulo: 'Aduaneiro Plus' },
            ]
            return [{
              id: 'negociacao',
              rotulo: 'Negociação',
              conteudo: (
                <div style={{ padding: '1rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  <SecaoFormularioGlobal icone={<Handshake size={16} weight="duotone" />} titulo="Negociação Especial" tooltip="Condição de preço exclusiva para uma organização" />

                  <GeralCampoGlobal label="Vincular Organização?">
                    <div style={{ display: 'flex', gap: '0.5rem', paddingTop: '0.375rem' }}>
                      <TogBtn val="nao" cur={vincularOrg} set={v => dirty(() => setVincularOrg(v as 'sim' | 'nao'))} label="Não" />
                      <TogBtn val="sim" cur={vincularOrg} set={v => dirty(() => setVincularOrg(v as 'sim' | 'nao'))} label="Sim" />
                    </div>
                  </GeralCampoGlobal>

                  {vincularOrg === 'sim' && (
                    <>
                      <GeralCampoGlobal label="Empresa / Organização" obrigatorio>
                        <SelectGlobal
                          opcoes={ORGS_OPCOES}
                          valor={orgSelecionada}
                          aoMudarValor={v => dirty(() => setOrgSelecionada(v ? String(v) : null))}
                          iconeEsquerda={<Buildings size={16} />}
                          placeholder="Selecionar organização..."
                          buscavel
                        />
                      </GeralCampoGlobal>

                      <GeralCampoGlobal label="Condição Especial" obrigatorio>
                        <div className="ws-input-icon-wrap">
                          <Handshake size={16} />
                          <input
                            placeholder="Ex: R$ 3,00 / processo extra"
                            style={{ width: '100%' }}
                            value={acordoNeg}
                            onChange={e => dirty(() => setAcordoNeg(e.target.value))}
                          />
                        </div>
                      </GeralCampoGlobal>

                      <GeralCampoGlobal label="Vigência">
                        <div className="ws-input-icon-wrap">
                          <CalendarCheck size={16} />
                          <input
                            placeholder="Ex: 12 meses, Indeterminado"
                            style={{ width: '100%' }}
                            value={vigenciaNeg}
                            onChange={e => dirty(() => setVigenciaNeg(e.target.value))}
                          />
                        </div>
                      </GeralCampoGlobal>

                      {/* Preview da negociação */}
                      {orgSelecionada && acordoNeg.trim() && (
                        <div style={{ padding: '0.75rem 1rem', borderRadius: 8, background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                          <span style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#10b981' }}>Preview da Negociação</span>
                          <span style={{ fontSize: '0.875rem', color: 'var(--ws-text)' }}>
                            <strong>{orgSelecionada}</strong> — {acordoNeg}{vigenciaNeg ? ` · ${vigenciaNeg}` : ''}
                          </span>
                        </div>
                      )}
                    </>
                  )}
                </div>
              )
        ]}
      />
    </PaginaGlobal>
  )
}
