import React, { useState } from 'react'
import { TooltipGlobal } from '@nucleo/tooltip-global'
import { ShoppingBagOpen, Tag, Users, CurrencyCircleDollar, BoxArrowUp, CalendarBlank, Wrench, Sliders, Headset, Clock, Coins, PauseCircle, PlayCircle, PencilSimple, Handshake, Buildings, Infinity, Trash, Plus, Minus, Stack } from '@phosphor-icons/react'
import { ModalExclusao } from '../workspace/ModalExclusao'
import { CalendarioCampoGlobal } from '@nucleo/campo-calendario-global'
import { PaginaGlobal } from '@nucleo/pagina-global'
import { CabecalhoGlobal } from '@nucleo/cabecalho-global'
import { TabelaGlobal, type TabelaGlobalColuna, type TabelaGlobalAcao } from '@nucleo/tabela-global'
import { CardBasicoGlobal } from '@nucleo/card-global'
import { BotaoNovoAdminGlobal } from '@nucleo/botao-novo-admin-global'
import { ModalFormularioAbasGlobal } from '@nucleo/modal-formulario-abas-global'
import { SecaoFormularioGlobal } from '@nucleo/modal-formulario-global'
import { GeralCampoGlobal } from '@nucleo/campo-geral-global'
import { SelectGlobal } from '@nucleo/campo-select-global'
import { useHistoricoLogger } from '../../hooks/useHistoricoLogger'
import { catalogService } from '../../services/catalogService'
import { ProdutoCatalogo, NegociacaoEspecial, StatusGlobal, FaixaPreco } from '../../types/entidades'
import { getAcoesExportacaoPadrao } from '../../utils/exportHelper'


// Dados iniciais agora vêm do catalogService

const getStatusBadge = (status: StatusGlobal) => {
  switch (status) {
    case 'Ativo': return 'ws-badge-success'
    case 'Em Breve': return 'ws-badge-warning'
    case 'Legado': return 'ws-badge-danger'
    case 'Suspenso': return 'ws-badge-warning'
    default: return 'ws-badge-neutral'
  }
}

const getStatusLabel = (status: StatusGlobal) => {
  switch (status) {
    case 'Ativo': return 'ATIVO'
    case 'Em Breve': return 'EM BREVE'
    case 'Legado': return 'LEGADO'
    case 'Suspenso': return 'SUSPENSO'
    default: return status
  }
}

const getStatusColor = (status: StatusGlobal) => {
  switch (status) {
    case 'Ativo': return { cor: '#34d399', bg: 'rgba(52,211,153,0.12)' }
    case 'Em Breve': return { cor: '#818cf8', bg: 'rgba(129,140,248,0.12)' }
    case 'Legado': return { cor: '#f87171', bg: 'rgba(248,113,113,0.12)' }
    case 'Suspenso': return { cor: '#f87171', bg: 'rgba(248,113,113,0.12)' }
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

function getSimboloMoeda(moeda: string): string {
  switch (moeda) {
    case 'BRL': return 'R$'
    case 'USD': return '$'
    case 'EUR': return '€'
    case 'GBP': return '£'
    case 'ARS': return 'AR$'
    case 'CNY': return '¥'
    case 'JPY': return '¥'
    default: return moeda
  }
}

const TIPOS_COBRANCA_OPCOES = [
  'Mensalidade', 'Por Processo', 'Por Documento', 'Por Estimativa',
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
  const { logEvent } = useHistoricoLogger()
  const [produtos, setProdutos] = React.useState<ProdutoCatalogo[]>([])
  const [negociacoes, setNegociacoes] = React.useState<NegociacaoEspecial[]>([])

  const carregarDados = React.useCallback(() => {
    let prods = catalogService.getProdutos()
    // Silent Migration: se encontrar o preço antigo ou portfólio legado, reseta
    const simula = prods.find(p => p.id === 'p1')
    if (simula && simula.precoUnitario.valor === '10,90') {
      catalogService.resetParaIniciais()
      prods = catalogService.getProdutos()
    }
    setProdutos(prods)
    setNegociacoes(catalogService.getNegociacoes())
  }, [])

  React.useEffect(() => {
    carregarDados()
  }, [carregarDados])

  const toggleProdutoStatus = (id: string) => {
    const produto = produtos.find(p => p.id === id)
    if (!produto) return

    const novoStatus: StatusGlobal = produto.status === 'Ativo' ? 'Suspenso' : 'Ativo'
    
    catalogService.toggleProdutoStatus(id)
    carregarDados()

    logEvent({
      acao: 'ALTERAÇÃO',
      entidade: 'Produtos (Catálogo)',
      oQueFoiFeito: `Alteração do Status do produto ${produto.nome}`,
      diff: [{ campo: 'Status', antes: produto.status, depois: novoStatus }]
    })
  }

  const [tab, setTab] = useState<'catalogo' | 'negociacoes'>('catalogo')
  const [modalAberto, setModalAberto] = useState(false)
  const [produtoEditando, setProdutoEditando] = useState<ProdutoCatalogo | null>(null)
  const [produtoParaExcluir, setProdutoParaExcluir] = useState<ProdutoCatalogo | null>(null)
  const [formDirty, setFormDirty] = useState(false)

  // 01. Dados Básicos
  // 01. Dados Básicos
  const [formNome, setFormNome] = React.useState('')
  const [formDescricao, setFormDescricao] = React.useState('')
  const [formDataLancamento, setFormDataLancamento] = React.useState('')
  const [formStatus, setFormStatus] = React.useState<'ativo' | 'inativo'>('ativo')

  // 02. Setup
  const [temSetup, setTemSetup] = React.useState<'sim' | 'nao'>('nao')
  const [moedaSetup, setMoedaSetup] = React.useState('BRL')
  const [valorSetup, setValorSetup] = React.useState('')

  // 03. Valores do Produto
  const [tipoCobranca, setTipoCobranca] = React.useState('')
  const [moedaProduto, setMoedaProduto] = React.useState('BRL')
  const [valorUnitario, setValorUnitario] = React.useState('')
  const [valorMinimo, setValorMinimo] = React.useState('')
  const [valorTotal, setValorTotal] = React.useState('')

  // 04. Usuários
  const [limiteUsuarios, setLimiteUsuarios] = React.useState<'ilimitada' | 'limitada'>('limitada')
  const [qtdUsuarios, setQtdUsuarios] = React.useState('')
  const [moedaUsuario, setMoedaUsuario] = React.useState('BRL')
  const [valorUsuarioAdicional, setValorUsuarioAdicional] = React.useState('')

  // 05. Help Desk
  const [totalHoras, setTotalHoras] = React.useState('')
  const [moedaHelpDesk, setMoedaHelpDesk] = React.useState('BRL')

  // 06. Negociação Especial
  const [vincularOrg, setVincularOrg] = React.useState<'sim' | 'nao'>('nao')
  const [orgSelecionada, setOrgSelecionada] = React.useState<string | null>(null)
  const [vigenciaIlimitada, setVigenciaIlimitada] = React.useState<'sim' | 'nao'>('nao')
  const [vigenciaPeriodo, setVigenciaPeriodo] = React.useState<{ inicio: Date | null; fim: Date | null }>({ inicio: null, fim: null })
  const [vigenciaNeg, setVigenciaNeg] = React.useState('')

  // 07. Faixas de Preço (Novo na Onda 3)
  const [faixas, setFaixas] = React.useState<FaixaPreco[]>([])

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
    setVincularOrg('nao'); setOrgSelecionada(null)
    setVigenciaIlimitada('nao'); setVigenciaPeriodo({ inicio: null, fim: null }); setVigenciaNeg('')
    setFaixas([])
  }

  const handleEditarProduto = (item: ProdutoCatalogo) => {
    setProdutoEditando(item)
    setFormNome(item.nome)
    setFormDescricao(item.descricao)
    setFormDataLancamento(item.dataLancamento || '')
    setFormStatus(item.status === 'Ativo' ? 'ativo' : 'inativo')
    setTemSetup(item.temSetup ? 'sim' : 'nao')
    setMoedaSetup(item.precoSetup?.moeda || 'BRL')
    setValorSetup(item.precoSetup?.valor || '')
    setTipoCobranca(item.tipoCobranca)
    setMoedaProduto(item.precoUnitario.moeda)
    setValorUnitario(item.precoUnitario.valor)
    setValorMinimo(item.precoMinimo.valor)
    setValorTotal(item.precoTotal?.valor || '')
    setLimiteUsuarios(item.limiteUsuarios)
    setQtdUsuarios(String(item.qtdUsuariosBase || ''))
    setMoedaUsuario(item.precoUsuarioAdicional?.moeda || 'BRL')
    setValorUsuarioAdicional(item.precoUsuarioAdicional?.valor || '')
    setTotalHoras(String(item.horasHelpDesk))
    setMoedaHelpDesk(item.precoHoraAdicional?.moeda || 'BRL')
    setFaixas(item.faixasPreco || [])
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

  const COLUNAS_PRODUTOS: TabelaGlobalColuna<ProdutoCatalogo>[] = [
    {
      key: 'nome', label: 'Nome do Produto', tipo: 'texto',
      tooltipTitulo: 'NOME COMERCIAL',
      tooltipDescricao: 'Identificação do serviço no catálogo e no marketplace',
      render: (v) => <span style={{ fontWeight: 600, color: 'var(--ws-text)' }}>{v}</span>
    },
    {
      key: 'descricao', label: 'O que é', tipo: 'texto',
      tooltipTitulo: 'DESCRIÇÃO',
      tooltipDescricao: 'Resumo das funcionalidades principais exibido para o cliente',
      render: (v) => <span style={{ color: 'var(--ws-muted)', fontSize: '0.85rem' }}>{v}</span>
    },
    {
      key: 'moduloBackend', label: 'Slug / Módulo', tipo: 'texto',
      tooltipTitulo: 'VÍNCULO TÉCNICO',
      tooltipDescricao: 'Identificador do sistema para ativação automática das funções',
      render: (v) => <code style={{ color: '#8b5cf6', fontSize: '0.75rem' }}>{v}</code>
    },
    {
      key: 'precoUnitario', label: 'Valor Adicional', tipo: 'texto',
      tooltipTitulo: 'CUSTO EXCEDENTE',
      tooltipDescricao: 'Custo aplicado ao consumo que ultrapassa o limite da franquia',
      render: (v, item) => {
        if (item.faixasPreco && item.faixasPreco.length > 0) {
          return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              <span style={{ fontWeight: 700, color: 'var(--color-primary)', fontSize: '0.8125rem' }}>Ver Camadas ({item.faixasPreco.length})</span>
              <span style={{ color: 'var(--ws-muted)', fontSize: '0.75rem' }}>A partir de {getSimboloMoeda(item.faixasPreco[0].moeda)} {item.faixasPreco[item.faixasPreco.length - 1].valor}</span>
            </div>
          )
        }
        const p = v as any
        return <span style={{ fontFamily: 'monospace', fontWeight: 700, color: 'var(--ws-text)', fontSize: '0.9375rem' }}>{getSimboloMoeda(p.moeda)} {p.valor}</span>
      }
    },
    {
      key: 'qtdUsuariosBase', label: 'Franquia Free', tipo: 'texto',
      tooltipTitulo: 'COTA INCLUÍDA',
      tooltipDescricao: 'Volume de uso liberado sem custo adicional em cada ciclo',
      render: (v, item) => (
        <span style={{ color: item.qtdUsuariosBase ? '#34d399' : 'var(--ws-muted)', fontSize: '0.85rem', fontWeight: item.qtdUsuariosBase ? 600 : 400 }}>
          {item.qtdUsuariosBase ? `${item.qtdUsuariosBase} ${item.tipoCobranca.replace('Por ', '')}s` : 'Zero'}
        </span>
      )
    },
    {
      key: 'tipoCobranca', label: 'Unidade', tipo: 'texto',
      tooltipTitulo: 'MÉTRICA',
      tooltipDescricao: 'Unidade de medida usada para o cálculo do faturamento',
      render: (v) => <span style={{ color: 'var(--ws-muted)', fontSize: '0.85rem' }}>{v}</span>
    },
    {
      key: 'status', label: 'Status', tipo: 'texto',
      tooltipTitulo: 'DISPONIBILIDADE',
      tooltipDescricao: 'Indica se o serviço está ativo para novas contratações',
      render: (v) => {
        const st = v as StatusGlobal
        const { cor, bg } = getStatusColor(st)
        return (
          <span style={{ display: 'inline-flex', padding: '0.2rem 0.625rem', borderRadius: '9999px', fontSize: '0.6875rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', background: bg, color: cor, border: `1px solid ${bg}` }}>
            {getStatusLabel(st)}
          </span>
        )
      }
    }
  ]

  const ACOES_PRODUTOS: TabelaGlobalAcao<ProdutoCatalogo>[] = [
    {
      id: 'toggle-status',
      icone: <PauseCircle size={15} weight="bold" />,
      tooltip: (item) => item.status === 'Ativo' ? 'Suspender produto' : 'Ativar produto',
      onClick: (item) => toggleProdutoStatus(item.id),
      renderCustom: (item) => (
        <button
          type="button"
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleProdutoStatus(item.id) }}
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
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 28, height: 28, borderRadius: '50%', background: 'transparent', border: '1px solid transparent', color: '#64748b', cursor: 'pointer', transition: 'all 0.15s', flexShrink: 0 }}
          onMouseEnter={ev => { ev.currentTarget.style.background = 'rgba(129,140,248,0.12)'; ev.currentTarget.style.borderColor = 'rgba(129,140,248,0.3)'; ev.currentTarget.style.color = '#818cf8' }}
          onMouseLeave={ev => { ev.currentTarget.style.background = 'transparent'; ev.currentTarget.style.borderColor = 'transparent'; ev.currentTarget.style.color = '#64748b' }}
        >
          <PencilSimple size={16} weight="bold" />
        </button>
      )
    },
    {
      id: 'excluir',
      icone: <Tag size={15} weight="bold" />,
      tooltip: 'Excluir Produto',
      onClick: (item) => setProdutoParaExcluir(item),
      renderCustom: (item) => (
        <button
          type="button"
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); setProdutoParaExcluir(item) }}
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 28, height: 28, borderRadius: '50%', background: 'transparent', border: '1px solid transparent', color: '#64748b', cursor: 'pointer', transition: 'all 0.15s', flexShrink: 0 }}
          onMouseEnter={ev => { ev.currentTarget.style.background = 'rgba(239,68,68,0.12)'; ev.currentTarget.style.borderColor = 'rgba(239,68,68,0.3)'; ev.currentTarget.style.color = '#ef4444' }}
          onMouseLeave={ev => { ev.currentTarget.style.background = 'transparent'; ev.currentTarget.style.borderColor = 'transparent'; ev.currentTarget.style.color = '#64748b' }}
        >
          <Tag size={16} weight="bold" style={{ transform: 'rotate(45deg)' }} />
        </button>
      )
    }
  ]

  const COLUNAS_NEGOCIACOES: TabelaGlobalColuna<NegociacaoEspecial>[] = [
    {
      key: 'tenantNome', label: 'Cliente', tipo: 'texto',
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
      key: 'ilimitada', label: 'Vigência', tipo: 'texto',
      tooltipTitulo: 'TTL / Data de Expiração', tooltipDescricao: 'Determina reversão automática para o pricing base após a data limite.',
      render: (v, item) => (
        <span style={{ color: 'var(--ws-muted)', fontSize: '0.85rem' }}>
          {v ? 'Indeterminado' : (item.fim || 'Expirado')}
        </span>
      )
    }
  ]

  return (
    <>
    <PaginaGlobal
      className="ws-fade-up"
      layout="lista"
      cabecalho={
        <CabecalhoGlobal
          titulo="Produtos"
          subtitulo="Toda a gestão de produtos, catálogos e negociações da plataforma Gravity é realizada por aqui."
          icone={<ShoppingBagOpen weight="duotone" size={22} color="#818cf8" />}
        />
      }
      stats={
        <>
          <CardBasicoGlobal
            titulo="Total de Produtos"
            icone={<BoxArrowUp weight="duotone" size={16} style={{ color: 'var(--ws-accent)' }} />}
            valor={produtos.length}
            subtexto="No catálogo oficial"
            tooltip={
              <>
                <p className="cg-tooltip__title">Portfólio de Soluções</p>
                <div className="cg-tooltip__row"><span>Produtos Mapeados</span> <strong>{produtos.length}</strong></div>
                <div className="cg-tooltip__row"><span>Disponibilidade</span> <strong>Global</strong></div>
              </>
            }
          />
          <CardBasicoGlobal
            titulo="Produtos Ativos"
            icone={<Tag weight="duotone" size={16} style={{ color: '#34d399' }} />}
            valor={produtos.filter(p => p.status === 'Ativo').length}
            subtexto="Disponíveis para assinatura"
            variante="sucesso"
            tooltip={
              <>
                <p className="cg-tooltip__title">Status Comercial</p>
                <div className="cg-tooltip__row"><span>Ativos no Catálogo</span> <strong>{produtos.filter(p => p.status === 'Ativo').length}</strong></div>
                <div className="cg-tooltip__row"><span>Checkout Habilitado</span> <strong>Sim</strong></div>
              </>
            }
          />
          <CardBasicoGlobal
            titulo="Negociações Ativas"
            icone={<Users weight="duotone" size={16} style={{ color: '#fbbf24' }} />}
            valor={negociacoes.length}
            subtexto="Condições exclusivas de clientes"
            variante="aviso"
            tooltip={
              <>
                <p className="cg-tooltip__title">Acordos Especiais</p>
                <div className="cg-tooltip__row"><span>Contratos de Exceção</span> <strong>{negociacoes.length}</strong></div>
                <div className="cg-tooltip__row"><span>Taxa de Conversão</span> <strong>Alta</strong></div>
              </>
            }
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
            <TabelaGlobal<ProdutoCatalogo>
              dados={produtos}
              colunas={COLUNAS_PRODUTOS}
              acoes={ACOES_PRODUTOS}
              mensagemVazio="Nenhum produto cadastrado no catálogo."
              tooltipBusca="Localizar produto por nome, ID ou descrição"
              acoesExportacao={getAcoesExportacaoPadrao(COLUNAS_PRODUTOS, 'dados_tabela', 'Exportação de Dados')}
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
              tooltipBusca="Localizar negociação por cliente ou produto"
              acoesExportacao={getAcoesExportacaoPadrao(COLUNAS_NEGOCIACOES, 'dados_tabela', 'Exportação de Dados')}
            />
          </div>
        </div>
      )}

      <ModalFormularioAbasGlobal
        aberto={modalAberto}
        aoFechar={handleFecharModal}
        aoSalvar={() => {
          const prodId = produtoEditando?.id ?? `p${Date.now()}`
          
          const novoProduto: ProdutoCatalogo = {
            id: prodId,
            nome: formNome,
            descricao: formDescricao,
            slug: formNome.toLowerCase().replace(/\s+/g, '-'),
            status: formStatus === 'ativo' ? 'Ativo' : 'Inativo',
            dataLancamento: formDataLancamento,
            temSetup: temSetup === 'sim',
            precoSetup: temSetup === 'sim' ? { valor: valorSetup, moeda: moedaSetup } : undefined,
            tipoCobranca,
            precoUnitario: { valor: valorUnitario, moeda: moedaProduto },
            precoMinimo: { valor: valorMinimo, moeda: moedaProduto },
            precoTotal: valorTotal ? { valor: valorTotal, moeda: moedaProduto } : undefined,
            limiteUsuarios,
            qtdUsuariosBase: Number(qtdUsuarios) || undefined,
            precoUsuarioAdicional: valorUsuarioAdicional ? { valor: valorUsuarioAdicional, moeda: moedaUsuario } : undefined,
            horasHelpDesk: Number(totalHoras) || 0,
            precoHoraAdicional: { valor: '0,00', moeda: moedaHelpDesk },
            faixasPreco: faixas.length > 0 ? faixas : undefined
          }

          catalogService.saveProduto(novoProduto)

          if (vincularOrg === 'sim' && orgSelecionada) {
            catalogService.saveNegociacao({
              id: `n${Date.now()}`,
              produtoId: prodId,
              tenantId: 't_unknown',
              tenantNome: orgSelecionada,
              acordo: 'Negociação personalizada via catálogo',
              ilimitada: vigenciaIlimitada === 'sim',
              fim: vigenciaPeriodo.fim?.toISOString().split('T')[0]
            })
          }
          
          carregarDados()
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
            tooltipTitulo: 'IDENTIFICAÇÃO',
            tooltipDescricao: 'Dados principais e categoria do produto no catálogo.',
            conteudo: (
              <div style={{ padding: '1rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <SecaoFormularioGlobal icone={<Tag size={16} weight="duotone" />} titulo="Dados Básicos" tooltip="Identificação e configuração geral do produto" />

                <GeralCampoGlobal 
                  label="Nome do Produto" 
                  obrigatorio
                  tooltipTitulo="IDENTIFICAÇÃO PRINCIPAL"
                  tooltipDescricao="Nome comercial que aparecerá no catálogo e no faturamento"
                >
                  <div className="ws-input-icon-wrap">
                    <ShoppingBagOpen size={16} />
                    <input placeholder="Ex: Gravity Analytics" style={{ width: '100%' }} value={formNome} onChange={e => dirty(() => setFormNome(e.target.value))} />
                  </div>
                </GeralCampoGlobal>

                <GeralCampoGlobal 
                  label="Descrição Curta" 
                  obrigatorio
                  tooltipTitulo="RESUMO COMERCIAL"
                  tooltipDescricao="Breve explicação das funcionalidades para exibição rápida no marketplace"
                >
                  <div className="ws-input-icon-wrap">
                    <Tag size={16} />
                    <input placeholder="Ex: Dashboards e BI em tempo real" style={{ width: '100%' }} value={formDescricao} onChange={e => dirty(() => setFormDescricao(e.target.value))} />
                  </div>
                </GeralCampoGlobal>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <GeralCampoGlobal 
                    label="Data de Lançamento"
                    tooltipTitulo="VIGÊNCIA INICIAL"
                    tooltipDescricao="Define quando o produto estará disponível para comercialização geral"
                  >
                    <CalendarioCampoGlobal
                      valor={{
                        inicio: formDataLancamento ? new Date(formDataLancamento + 'T00:00:00') : null,
                        fim: formDataLancamento ? new Date(formDataLancamento + 'T00:00:00') : null,
                      }}
                      aoMudarValor={(v: { inicio: Date | null; fim: Date | null }) => {
                        const d = v.inicio
                        if (d) {
                          const iso = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
                          dirty(() => setFormDataLancamento(iso))
                        } else {
                          dirty(() => setFormDataLancamento(''))
                        }
                      }}
                      placeholder="Selecione a data..."
                    />
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
            tooltipTitulo: 'OPERAÇÃO INICIAL',
            tooltipDescricao: 'Taxa de ativação e onboarding (One-time fee).',
            conteudo: (
              <div style={{ padding: '1rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <SecaoFormularioGlobal icone={<Wrench size={16} weight="duotone" />} titulo="Setup" />

                <GeralCampoGlobal 
                  label="Tem Setup?"
                  tooltipTitulo="ADMISSÃO DO SERVIÇO"
                  tooltipDescricao="Define se haverá um custo único de ativação ou implantação"
                >
                  <div style={{ display: 'flex', gap: '0.5rem', paddingTop: '0.375rem' }}>
                    <TogBtn val="sim" cur={temSetup} set={v => setTemSetup(v as 'sim' | 'nao')} label="Sim" />
                    <TogBtn val="nao" cur={temSetup} set={v => setTemSetup(v as 'sim' | 'nao')} label="Não" />
                  </div>
                </GeralCampoGlobal>

                {temSetup === 'sim' && (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <GeralCampoGlobal 
                      label="Moeda do Setup"
                      tooltipTitulo="MOEDA DE TRANSAÇÃO"
                      tooltipDescricao="Moeda utilizada para o faturamento inicial"
                    >
                      <SelectGlobal
                        opcoes={MOEDAS_OPCOES}
                        valor={moedaSetup}
                        aoMudarValor={v => dirty(() => setMoedaSetup(String(v ?? 'BRL')))}
                        iconeEsquerda={<CurrencyCircleDollar size={16} />}
                        buscavel
                      />
                    </GeralCampoGlobal>
                    <GeralCampoGlobal 
                      label="Valor do Setup"
                      tooltipTitulo="INVESTIMENTO INICIAL"
                      tooltipDescricao="Montante fixo cobrado apenas no primeiro ciclo"
                    >
                      <div className="ws-input-icon-wrap">
                        <span style={{ fontSize: '0.8125rem', fontWeight: 700, minWidth: '24px', textAlign: 'center', color: 'var(--ws-muted)' }}>{getSimboloMoeda(moedaSetup)}</span>
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
            tooltipTitulo: 'PRECIFICAÇÃO',
            tooltipDescricao: 'Modelo de cobrança, recorrência e camadas de preço.',
            conteudo: (
              <div style={{ padding: '1rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <SecaoFormularioGlobal icone={<Sliders size={16} weight="duotone" />} titulo="Valores do Produto" />

                <GeralCampoGlobal 
                  label="Tipo de Cobrança"
                  tooltipTitulo="MÉTRICA DE VALOR"
                  tooltipDescricao="Especifica a unidade de medida para o cálculo do faturamento"
                >
                  <SelectGlobal
                    opcoes={TIPOS_COBRANCA_OPCOES}
                    valor={tipoCobranca || null}
                    aoMudarValor={v => dirty(() => setTipoCobranca(String(v ?? '')))}
                    iconeEsquerda={<Sliders size={16} />}
                    placeholder="Selecione o tipo..."
                    buscavel={false}
                  />
                </GeralCampoGlobal>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <GeralCampoGlobal 
                    label="Moeda"
                    tooltipTitulo="MOEDA BASE"
                    tooltipDescricao="Moeda padrão para exibição e faturamento deste serviço"
                  >
                    <SelectGlobal
                      opcoes={MOEDAS_OPCOES}
                      valor={moedaProduto}
                      aoMudarValor={v => dirty(() => setMoedaProduto(String(v ?? 'BRL')))}
                      iconeEsquerda={<CurrencyCircleDollar size={16} />}
                      buscavel
                    />
                  </GeralCampoGlobal>
                  <GeralCampoGlobal 
                    label="Franquia Free (Qtd)"
                    tooltipTitulo="VOLUME INCLUÍDO"
                    tooltipDescricao="Quantidade mínima de uso liberada sem custos extras"
                  >
                    <div className="ws-input-icon-wrap">
                      <Tag size={16} />
                      <input type="number" placeholder="Ex: 10" style={{ width: '100%' }} value={qtdUsuarios} onChange={e => dirty(() => setQtdUsuarios(e.target.value))} />
                    </div>
                  </GeralCampoGlobal>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                  <GeralCampoGlobal 
                    label="Valor Unitário"
                    tooltipTitulo="PREÇO POR UNIDADE"
                    tooltipDescricao="Custo aplicado cada vez que um item adicional é consumido"
                  >
                    <div className="ws-input-icon-wrap">
                      <span style={{ fontSize: '0.8125rem', fontWeight: 700, minWidth: '24px', textAlign: 'center', color: 'var(--ws-muted)' }}>{getSimboloMoeda(moedaProduto)}</span>
                      <input placeholder="0,00" style={{ width: '100%' }} inputMode="numeric" value={valorUnitario} onChange={e => dirty(() => setValorUnitario(mascaraMoeda(e.target.value)))} />
                    </div>
                  </GeralCampoGlobal>
                  <GeralCampoGlobal 
                    label="Valor Mínimo"
                    tooltipTitulo="PISO DE COBRANÇA"
                    tooltipDescricao="Menor valor possível a ser faturado em cada ciclo"
                  >
                    <div className="ws-input-icon-wrap">
                      <span style={{ fontSize: '0.8125rem', fontWeight: 700, minWidth: '24px', textAlign: 'center', color: 'var(--ws-muted)' }}>{getSimboloMoeda(moedaProduto)}</span>
                      <input placeholder="0,00" style={{ width: '100%' }} inputMode="numeric" value={valorMinimo} onChange={e => dirty(() => setValorMinimo(mascaraMoeda(e.target.value)))} />
                    </div>
                  </GeralCampoGlobal>
                  <GeralCampoGlobal 
                    label="Valor Total"
                    tooltipTitulo="PREÇO DO PACOTE"
                    tooltipDescricao="Custo fixo do serviço independentemente do volume consumido"
                  >
                    <div className="ws-input-icon-wrap">
                      <span style={{ fontSize: '0.8125rem', fontWeight: 700, minWidth: '24px', textAlign: 'center', color: 'var(--ws-muted)' }}>{getSimboloMoeda(moedaProduto)}</span>
                      <input placeholder="0,00" style={{ width: '100%' }} inputMode="numeric" value={valorTotal} onChange={e => dirty(() => setValorTotal(mascaraMoeda(e.target.value)))} />
                    </div>
                  </GeralCampoGlobal>
                </div>

                <div style={{ marginTop: '0.5rem', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '1.25rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                    <TooltipGlobal titulo="TABELA DE FAIXAS" descricao="Estrutura de precificação progressiva por volume de unidades.">
                      <p style={{ margin: 0, fontSize: '0.875rem', fontWeight: 600, color: 'var(--ws-text)', display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                        <Stack size={18} weight="duotone" color="var(--color-primary)" /> Configuração de Camadas (Tiers)
                      </p>
                    </TooltipGlobal>
                    <button 
                      type="button" 
                      onClick={() => dirty(() => setFaixas([...faixas, { id: `f${Date.now()}`, de: 0, ate: undefined, valor: '0,00', moeda: moedaProduto }]))}
                      style={{ fontSize: '0.8125rem', fontWeight: 600, background: 'rgba(52,211,153,0.08)', color: '#34d399', border: '1px solid rgba(52,211,153,0.25)', padding: '0.375rem 0.875rem', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', transition: 'all 0.15s' }}
                      onMouseEnter={e => { e.currentTarget.style.background = 'rgba(52,211,153,0.15)'; e.currentTarget.style.borderColor = 'rgba(52,211,153,0.4)' }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'rgba(52,211,153,0.08)'; e.currentTarget.style.borderColor = 'rgba(52,211,153,0.25)' }}
                    >
                      <Plus size={14} weight="bold" /> Adicionar Faixa
                    </button>
                  </div>

                  {faixas.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {faixas.map((f, idx) => {
                        const updateFaixa = (changes: Partial<FaixaPreco>) => {
                          dirty(() => setFaixas(faixas.map(fx => fx.id === f.id ? { ...fx, ...changes } : fx)))
                        }

                        return (
                          <div key={f.id} style={{ display: 'grid', gridTemplateColumns: 'minmax(120px, 1fr) minmax(120px, 1fr) 1.5fr 44px', gap: '12px', alignItems: 'end', background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.05)' }}>
                            <GeralCampoGlobal label="De">
                              <div className="ws-input-icon-wrap" style={{ display: 'flex', alignItems: 'center', padding: '0 4px' }}>
                                <button type="button" onClick={() => updateFaixa({ de: Math.max(0, f.de - 1) })} style={{ background: 'transparent', border: 'none', color: 'var(--ws-muted)', cursor: 'pointer', padding: '6px', display: 'flex', alignItems: 'center' }}><Minus size={12} weight="bold" /></button>
                                <input 
                                  type="text" 
                                  inputMode="numeric"
                                  style={{ width: '100%', border: 'none', background: 'transparent', textAlign: 'center', color: 'var(--ws-text)', fontSize: '0.875rem', fontWeight: 600, outline: 'none' }} 
                                  value={f.de === 0 ? '' : f.de} 
                                  placeholder="0"
                                  onChange={e => {
                                    const val = e.target.value.replace(/\D/g, '')
                                    updateFaixa({ de: val === '' ? 0 : Number(val) })
                                  }} 
                                />
                                <button type="button" onClick={() => updateFaixa({ de: f.de + 1 })} style={{ background: 'transparent', border: 'none', color: 'var(--ws-muted)', cursor: 'pointer', padding: '6px', display: 'flex', alignItems: 'center' }}><Plus size={12} weight="bold" /></button>
                              </div>
                            </GeralCampoGlobal>

                            <GeralCampoGlobal label="Até">
                              <div className="ws-input-icon-wrap" style={{ display: 'flex', alignItems: 'center', padding: '0 4px' }}>
                                <button type="button" onClick={() => updateFaixa({ ate: f.ate ? Math.max(0, f.ate - 1) : undefined })} style={{ background: 'transparent', border: 'none', color: 'var(--ws-muted)', cursor: 'pointer', padding: '6px', display: 'flex', alignItems: 'center' }}><Minus size={12} weight="bold" /></button>
                                <input 
                                  type="text" 
                                  inputMode="numeric"
                                  placeholder="∞" 
                                  style={{ width: '100%', border: 'none', background: 'transparent', textAlign: 'center', color: 'var(--ws-text)', fontSize: '0.875rem', fontWeight: 600, outline: 'none' }} 
                                  value={f.ate === undefined ? '' : f.ate} 
                                  onChange={e => {
                                    const val = e.target.value.replace(/\D/g, '')
                                    updateFaixa({ ate: val === '' ? undefined : Number(val) })
                                  }} 
                                />
                                <button type="button" onClick={() => updateFaixa({ ate: (f.ate || 0) + 1 })} style={{ background: 'transparent', border: 'none', color: 'var(--ws-muted)', cursor: 'pointer', padding: '6px', display: 'flex', alignItems: 'center' }}><Plus size={12} weight="bold" /></button>
                              </div>
                            </GeralCampoGlobal>

                            <GeralCampoGlobal label="Valor da Camada">
                              <div className="ws-input-icon-wrap">
                                <span style={{ fontSize: '0.875rem', fontWeight: 700, minWidth: '24px', textAlign: 'center', color: 'var(--ws-muted)' }}>{getSimboloMoeda(moedaProduto)}</span>
                                <input style={{ width: '100%', border: 'none', background: 'transparent', color: 'var(--ws-text)', fontSize: '0.875rem', fontWeight: 600, outline: 'none' }} value={f.valor} onChange={e => updateFaixa({ valor: mascaraMoeda(e.target.value) })} />
                              </div>
                            </GeralCampoGlobal>

                            <button 
                              type="button" 
                              onClick={() => dirty(() => setFaixas(faixas.filter(fx => fx.id !== f.id)))}
                              style={{ width: '40px', height: '40px', borderRadius: '8px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.15)', color: '#ef4444', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s' }}
                              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.15)'; e.currentTarget.style.borderColor = 'rgba(239,68,68,0.3)' }}
                              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.08)'; e.currentTarget.style.borderColor = 'rgba(239,68,68,0.15)' }}
                            >
                              <Trash size={18} />
                            </button>
                          </div>
                        )
                      })}
                    </div>
                  ) : (
                    <div style={{ padding: '2.5rem', border: '2px dashed rgba(255,255,255,0.04)', borderRadius: '12px', textAlign: 'center', background: 'rgba(255,255,255,0.01)' }}>
                      <div style={{ opacity: 0.4, marginBottom: '0.75rem' }}><Sliders size={32} weight="duotone" /></div>
                      <p style={{ margin: 0, color: 'var(--ws-muted)', fontSize: '0.8125rem', fontWeight: 500 }}>Nenhuma faixa configurada.</p>
                      <p style={{ margin: '4px 0 0 0', color: 'rgba(255,255,255,0.2)', fontSize: '0.75rem' }}>O sistema utilizará o valor unitário base definido acima.</p>
                    </div>
                  )}
                </div>
              </div>
            )
          },
          {
            id: 'usuarios',
            rotulo: 'Usuários',
            tooltipTitulo: 'LICENCIAMENTO',
            tooltipDescricao: 'Regras de cobrança por assento e usuários excedentes.',
            conteudo: (
              <div style={{ padding: '1rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <SecaoFormularioGlobal icone={<Users size={16} weight="duotone" />} titulo="Usuários" />

                <GeralCampoGlobal 
                  label="Quantidade de Usuários"
                  tooltipTitulo="CONTROLE DE ACESSO"
                  tooltipDescricao="Define se o produto possui limite fixo de usuários ou é ilimitado"
                >
                  <div style={{ display: 'flex', gap: '0.5rem', paddingTop: '0.375rem' }}>
                    <TogBtn val="ilimitada" cur={limiteUsuarios} set={v => setLimiteUsuarios(v as 'ilimitada' | 'limitada')} label="Ilimitada" />
                    <TogBtn val="limitada" cur={limiteUsuarios} set={v => setLimiteUsuarios(v as 'ilimitada' | 'limitada')} label="Limitada" />
                  </div>
                </GeralCampoGlobal>

                {limiteUsuarios === 'limitada' && (
                  <>
                    <GeralCampoGlobal 
                      label="Quantidade"
                      tooltipTitulo="LIMITE DE ASSENTOS"
                      tooltipDescricao="Total de usuários permitidos antes da cobrança de excedentes"
                    >
                      <div className="ws-input-icon-wrap">
                        <Users size={16} />
                        <input type="number" placeholder="Ex: 10" style={{ width: '100%' }} value={qtdUsuarios} onChange={e => dirty(() => setQtdUsuarios(e.target.value))} />
                      </div>
                    </GeralCampoGlobal>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                      <GeralCampoGlobal 
                        label="Moeda"
                        tooltipTitulo="MOEDA DO EXCEDENTE"
                        tooltipDescricao="Moeda aplicada para o faturamento de usuários adicionais"
                      >
                        <SelectGlobal
                          opcoes={MOEDAS_OPCOES}
                          valor={moedaUsuario}
                          aoMudarValor={v => dirty(() => setMoedaUsuario(String(v ?? 'BRL')))}
                          iconeEsquerda={<CurrencyCircleDollar size={16} />}
                          buscavel
                        />
                      </GeralCampoGlobal>
                      <GeralCampoGlobal 
                        label="Valor por Usuário Adicional"
                        tooltipTitulo="CUSTO EXTRA"
                        tooltipDescricao="Preço unitário por cada novo usuário acima da franquia"
                      >
                        <div className="ws-input-icon-wrap">
                          <span style={{ fontSize: '0.8125rem', fontWeight: 700, minWidth: '24px', textAlign: 'center', color: 'var(--ws-muted)' }}>{getSimboloMoeda(moedaUsuario)}</span>
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
            tooltipTitulo: 'SUPORTE TÉCNICO',
            tooltipDescricao: 'Franquia de horas mensais e custo de hora adicional.',
            conteudo: (
              <div style={{ padding: '1rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <SecaoFormularioGlobal icone={<Headset size={16} weight="duotone" />} titulo="Help Desk" />

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <GeralCampoGlobal 
                    label="Total de Horas Mensais"
                    tooltipTitulo="SUPORTE INCLUÍDO"
                    tooltipDescricao="Cota de horas de suporte técnico disponíveis por mês"
                  >
                    <div className="ws-input-icon-wrap">
                      <Clock size={16} />
                      <input type="number" placeholder="Ex: 10" style={{ width: '100%' }} value={totalHoras} onChange={e => dirty(() => setTotalHoras(e.target.value))} />
                    </div>
                  </GeralCampoGlobal>
                  <GeralCampoGlobal 
                    label="Moeda do Adicional por Hora"
                    tooltipTitulo="MOEDA DE SUPORTE"
                    tooltipDescricao="Moeda para cobrança de horas técnicas excedentes"
                  >
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
          },
          {
            id: 'negociacao',
            rotulo: 'Negociação',
            tooltipTitulo: 'CONDIÇÃO ESPECIAL',
            tooltipDescricao: 'Preço exclusivo vinculado a uma organização específica.',
            conteudo: (
              <div style={{ padding: '1rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <SecaoFormularioGlobal icone={<Handshake size={16} weight="duotone" />} titulo="Negociação Especial" tooltip="Condição de preço exclusiva para uma organização" />

                <GeralCampoGlobal 
                  label="Vincular Organização?"
                  tooltipTitulo="FOCO COMERCIAL"
                  tooltipDescricao="Permite definir uma condição de preço exclusiva para um cliente"
                >
                  <div style={{ display: 'flex', gap: '0.5rem', paddingTop: '0.375rem' }}>
                    <TogBtn val="nao" cur={vincularOrg} set={v => dirty(() => setVincularOrg(v as 'sim' | 'nao'))} label="Não" />
                    <TogBtn val="sim" cur={vincularOrg} set={v => dirty(() => setVincularOrg(v as 'sim' | 'nao'))} label="Sim" />
                  </div>
                </GeralCampoGlobal>

                {vincularOrg === 'sim' && (
                  <>
                    <GeralCampoGlobal label="Empresa / Organização" obrigatorio>
                      <SelectGlobal
                        opcoes={[
                          { valor: 'Importas SA', rotulo: 'Importas SA' },
                          { valor: 'TechCorp Brasil', rotulo: 'TechCorp Brasil' },
                          { valor: 'Mega Retail', rotulo: 'Mega Retail' },
                          { valor: 'Global Trade Ltda', rotulo: 'Global Trade Ltda' },
                          { valor: 'Aduaneiro Plus', rotulo: 'Aduaneiro Plus' },
                        ]}
                        valor={orgSelecionada}
                        aoMudarValor={v => dirty(() => setOrgSelecionada(v ? String(v) : null))}
                        iconeEsquerda={<Buildings size={16} />}
                        placeholder="Selecionar organização..."
                        buscavel
                      />
                    </GeralCampoGlobal>


                    <GeralCampoGlobal label="Vigência">
                      <div style={{ display: 'flex', gap: '0.5rem', paddingTop: '0.375rem', marginBottom: '0.5rem' }}>
                        <TogBtn val="nao" cur={vigenciaIlimitada} set={v => dirty(() => setVigenciaIlimitada(v as 'sim' | 'nao'))} label="Com data" />
                        <TogBtn val="sim" cur={vigenciaIlimitada} set={v => dirty(() => { setVigenciaIlimitada(v as 'sim' | 'nao'); setVigenciaPeriodo({ inicio: null, fim: null }) })} label="Ilimitada" />
                      </div>
                      {vigenciaIlimitada === 'nao' && (
                        <CalendarioCampoGlobal
                          placeholder="Selecione o período de vigência..."
                          valor={vigenciaPeriodo}
                          aoMudarValor={v => dirty(() => setVigenciaPeriodo(v))}
                        />
                      )}
                      {vigenciaIlimitada === 'sim' && (
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.375rem 0.875rem', borderRadius: '9999px', background: 'rgba(129,140,248,0.08)', border: '1px solid rgba(129,140,248,0.2)', color: '#818cf8', fontSize: '0.8125rem', fontWeight: 600 }}>
                          <Infinity size={15} weight="bold" />
                          Sem data de expiração
                        </div>
                      )}
                    </GeralCampoGlobal>

                    {orgSelecionada && (
                      <div style={{ padding: '0.75rem 1rem', borderRadius: 8, background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                        <span style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#10b981' }}>Preview da Negociação</span>
                        <span style={{ fontSize: '0.875rem', color: 'var(--ws-text)' }}>
                          <strong>{orgSelecionada}</strong>{vigenciaNeg ? ` · ${vigenciaNeg}` : ''}
                        </span>
                      </div>
                    )}
                  </>
                )}
              </div>
            )
          }
        ]}
      />
    </PaginaGlobal>

    <ModalExclusao
      aberto={!!produtoParaExcluir}
      titulo="Excluir Produto do Catálogo"
      descricao={<>Tem certeza de que deseja remover <strong>{produtoParaExcluir?.nome}</strong> do catálogo de produtos?</>}
      nomeItem="Esta ação é irreversível. Todos os vínculos com organizações e negociações especiais serão removidos."
      aoConfirmar={() => {
        if (produtoParaExcluir) {
          catalogService.deleteProduto(produtoParaExcluir.id)
          carregarDados()
          setProdutoParaExcluir(null)
        }
      }}
      aoCancelar={() => setProdutoParaExcluir(null)}
    />
    </>
  )
}
