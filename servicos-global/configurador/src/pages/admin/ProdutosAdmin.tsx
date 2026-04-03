import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
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
import { useAuth } from '@clerk/clerk-react'
import { useShellStore } from '@gravity/shell'
import { useHistoricoLogger } from '../../hooks/useHistoricoLogger'
import { catalogApiService } from '../../services/catalogAdapter'
import { setAuthTokenProvider } from '../../services/apiClient'
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
  const { t } = useTranslation()
  const { getToken } = useAuth()
  const addNotification = useShellStore((s) => s.addNotification)

  const getStatusLabel = (status: StatusGlobal): string => {
    switch (status) {
      case 'Ativo': return t('admin.products.status.ativo').toUpperCase()
      case 'Em Breve': return t('admin.products.status.em_breve').toUpperCase()
      case 'Legado': return t('admin.products.status.legado').toUpperCase()
      case 'Suspenso': return t('admin.products.status.suspenso').toUpperCase()
      default: return status
    }
  }
  const { logEvent } = useHistoricoLogger()
  const [produtos, setProdutos] = React.useState<ProdutoCatalogo[]>([])
  const [negociacoes, setNegociacoes] = React.useState<NegociacaoEspecial[]>([])
  const [slugsDisponiveis, setSlugsDisponiveis] = React.useState<string[]>([])
  const [loading, setLoading] = React.useState(true)

  const [carregando, setCarregando] = React.useState(true)

  const carregarDados = React.useCallback(async () => {
    // Garantir que o token Clerk está configurado ANTES de qualquer chamada API
    setAuthTokenProvider(() => getToken())

    setLoading(true)
    setCarregando(true)
    // Slugs carregados independentemente — não devem bloquear a lista de produtos
    catalogApiService.getSlugsDisponiveis().then(setSlugsDisponiveis)
    try {
      const [prods, negs] = await Promise.all([
        catalogApiService.getProdutos(),
        catalogApiService.getNegociacoes(),
      ])
      setProdutos(prods)
      setNegociacoes(negs)
    } catch (err) {
      addNotification({ type: 'error', message: err instanceof Error ? err.message : t('admin.products.msg_erro_carregar') })
    } finally {
      setLoading(false)
      setCarregando(false)
    }
  }, [getToken])

  React.useEffect(() => {
    carregarDados()
  }, [carregarDados])

  const toggleProdutoStatus = async (id: string) => {
    const produto = produtos.find(p => p.id === id)
    if (!produto) return

    const novoStatus: StatusGlobal = produto.status === 'Ativo' ? 'Suspenso' : 'Ativo'

    try {
      await catalogApiService.toggleProdutoStatus(id)
      await carregarDados()

      addNotification({
        type: 'success',
        message: t('admin.products.msg_status_alterado', { nome: produto.nome, status: novoStatus })
      })

      logEvent({
        acao: 'ALTERAÇÃO',
        entidade: 'Produtos (Catálogo)',
        oQueFoiFeito: `Alteração do Status do produto ${produto.nome}`,
        diff: [{ campo: 'Status', antes: produto.status, depois: novoStatus }]
      })
    } catch (err) {
      addNotification({
        type: 'error',
        message: t('admin.products.msg_erro_status') + (err instanceof Error ? err.message : t('admin.products.msg_desconhecido'))
      })
    }
  }

  const [tab, setTab] = useState<'catalogo' | 'negociacoes'>('catalogo')
  const [modalAberto, setModalAberto] = useState(false)
  const [produtoEditando, setProdutoEditando] = useState<ProdutoCatalogo | null>(null)
  const [produtoParaExcluir, setProdutoParaExcluir] = useState<ProdutoCatalogo | null>(null)
  const [formDirty, setFormDirty] = useState(false)

  // 01. Dados Básicos
  const [formNome, setFormNome] = React.useState('')
  const [formDescricao, setFormDescricao] = React.useState('')
  const [formDataLancamento, setFormDataLancamento] = React.useState('')
  const [formStatus, setFormStatus] = React.useState<'ativo' | 'em-breve'>('ativo')
  const [formSlugSelecionado, setFormSlugSelecionado] = React.useState<string | null>(null)

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
    setFormNome(''); setFormDescricao(''); setFormDataLancamento(''); setFormStatus('ativo'); setFormSlugSelecionado(null)
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
    setFormStatus(item.status === 'Ativo' ? 'ativo' : 'em-breve')
    setFormSlugSelecionado(item.moduloBackend ?? item.slug ?? null)
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
      key: 'nome', label: t('admin.products.tabela.nome_produto'), tipo: 'texto',
      tooltipTitulo: 'NOME COMERCIAL',
      tooltipDescricao: 'Identificação do serviço no catálogo e no marketplace',
      render: (v) => <span style={{ fontWeight: 600, color: 'var(--ws-text)' }}>{v}</span>
    },
    {
      key: 'descricao', label: t('admin.products.tabela.o_que_e'), tipo: 'texto',
      tooltipTitulo: 'DESCRIÇÃO',
      tooltipDescricao: 'Resumo das funcionalidades principais exibido para o cliente',
      render: (v) => <span style={{ color: 'var(--ws-muted)', fontSize: '0.85rem' }}>{v}</span>
    },
    {
      key: 'moduloBackend', label: t('admin.products.tabela.slug_modulo'), tipo: 'texto',
      tooltipTitulo: 'VÍNCULO TÉCNICO',
      tooltipDescricao: 'Identificador do sistema para ativação automática das funções',
      render: (v) => <code style={{ color: '#8b5cf6', fontSize: '0.75rem' }}>{v}</code>
    },
    {
      key: 'precoUnitario', label: t('admin.products.tabela.valor_adicional'), tipo: 'texto',
      tooltipTitulo: 'CUSTO EXCEDENTE',
      tooltipDescricao: 'Custo aplicado ao consumo que ultrapassa o limite da franquia',
      render: (v, item) => {
        if (item.faixasPreco && item.faixasPreco.length > 0) {
          return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              <span style={{ fontWeight: 700, color: 'var(--color-primary)', fontSize: '0.8125rem' }}>{t('admin.products.tabela.ver_camadas')} ({item.faixasPreco.length})</span>
              <span style={{ color: 'var(--ws-muted)', fontSize: '0.75rem' }}>{t('admin.products.tabela.a_partir_de')} {getSimboloMoeda(item.faixasPreco[0].moeda)} {item.faixasPreco[item.faixasPreco.length - 1].valor}</span>
            </div>
          )
        }
        const p = v as any
        return <span style={{ fontFamily: 'monospace', fontWeight: 700, color: 'var(--ws-text)', fontSize: '0.9375rem' }}>{getSimboloMoeda(p.moeda)} {p.valor}</span>
      }
    },
    {
      key: 'qtdUsuariosBase', label: t('admin.products.tabela.franquia_free'), tipo: 'texto',
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
          titulo={t('admin.products.titulo')}
          subtitulo={t('admin.products.subtitulo')}
          icone={<ShoppingBagOpen weight="duotone" size={22} color="#818cf8" />}
        />
      }
      stats={
        <>
          <CardBasicoGlobal
            titulo={t('admin.products.card_total')}
            icone={<BoxArrowUp weight="duotone" size={16} style={{ color: 'var(--ws-accent)' }} />}
            valor={produtos.length}
            subtexto={t('admin.products.card_total_subtexto')}
            tooltip={
              <>
                <p className="cg-tooltip__title">{t('admin.products.card_total_tooltip_titulo')}</p>
                <div className="cg-tooltip__row"><span>{t('admin.products.card_total_tooltip_mapeados')}</span> <strong>{produtos.length}</strong></div>
                <div className="cg-tooltip__row"><span>{t('admin.products.card_total_tooltip_disponibilidade')}</span> <strong>{t('admin.products.card_total_tooltip_global')}</strong></div>
              </>
            }
          />
          <CardBasicoGlobal
            titulo={t('admin.products.card_ativos')}
            icone={<Tag weight="duotone" size={16} style={{ color: '#34d399' }} />}
            valor={produtos.filter(p => p.status === 'Ativo').length}
            subtexto={t('admin.products.card_ativos_subtexto')}
            variante="sucesso"
            tooltip={
              <>
                <p className="cg-tooltip__title">{t('admin.products.card_ativos_tooltip_titulo')}</p>
                <div className="cg-tooltip__row"><span>{t('admin.products.card_ativos_tooltip_label')}</span> <strong>{produtos.filter(p => p.status === 'Ativo').length}</strong></div>
                <div className="cg-tooltip__row"><span>{t('admin.products.card_ativos_tooltip_checkout')}</span> <strong>{t('admin.products.opcao_sim')}</strong></div>
              </>
            }
          />
          <CardBasicoGlobal
            titulo={t('admin.products.card_negociacoes')}
            icone={<Users weight="duotone" size={16} style={{ color: '#fbbf24' }} />}
            valor={negociacoes.length}
            subtexto={t('admin.products.card_negociacoes_subtexto')}
            variante="aviso"
            tooltip={
              <>
                <p className="cg-tooltip__title">{t('admin.products.card_negociacoes_tooltip_titulo')}</p>
                <div className="cg-tooltip__row"><span>{t('admin.products.card_negociacoes_tooltip_label')}</span> <strong>{negociacoes.length}</strong></div>
                <div className="cg-tooltip__row"><span>{t('admin.products.card_negociacoes_tooltip_taxa')}</span> <strong>{t('admin.products.card_negociacoes_tooltip_alta')}</strong></div>
              </>
            }
          />
        </>
      }
      toolbar={
        <div className="ws-tabs" style={{ margin: 0 }}>
          <button className={`ws-tab${tab === 'catalogo' ? ' active' : ''}`} onClick={() => setTab('catalogo')}>
            {t('admin.products.tab_catalogo')}
          </button>
          <button className={`ws-tab${tab === 'negociacoes' ? ' active' : ''}`} onClick={() => setTab('negociacoes')}>
            {t('admin.products.tab_negociacoes')}
          </button>
        </div>
      }
    >
      {tab === 'catalogo' && (
        <div className="ws-fade-up">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <p className="ws-section-title" style={{ margin: 0 }}>
              <Tag weight="duotone" size={14} color="#818cf8" /> {t('admin.products.secao_catalogo')}
            </p>
            <BotaoNovoAdminGlobal
              rotulo={t('admin.products.btn_novo')}
              onClick={() => setModalAberto(true)}
            />
          </div>
          <div style={{ position: 'relative', zIndex: 10 }}>
            <TabelaGlobal<ProdutoCatalogo>
              id="admin-products-catalog"
              dados={produtos}
              colunas={COLUNAS_PRODUTOS}
              acoes={ACOES_PRODUTOS}
              mensagemVazio={t('admin.products.vazio_catalogo')}
              tooltipBusca={t('admin.products.tooltip_busca_catalogo')}
              acoesExportacao={getAcoesExportacaoPadrao(COLUNAS_PRODUTOS, 'dados_tabela', 'Exportação de Dados')}
            />
          </div>
        </div>
      )}

      {tab === 'negociacoes' && (
        <div className="ws-fade-up">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <p className="ws-section-title" style={{ margin: 0 }}>
              <CurrencyCircleDollar weight="duotone" size={14} color="#f59e0b" /> {t('admin.products.secao_negociacoes')}
            </p>
          </div>
          <div style={{ position: 'relative', zIndex: 10 }}>
            <TabelaGlobal<NegociacaoEspecial>
              id="admin-products-negotiations"
              dados={negociacoes}
              colunas={COLUNAS_NEGOCIACOES}
              mensagemVazio={t('admin.products.vazio_negociacoes')}
              tooltipBusca={t('admin.products.tooltip_busca_negociacoes')}
              acoesExportacao={getAcoesExportacaoPadrao(COLUNAS_NEGOCIACOES, 'dados_tabela', 'Exportação de Dados')}
            />
          </div>
        </div>
      )}

      <ModalFormularioAbasGlobal
        aberto={modalAberto}
        aoFechar={handleFecharModal}
        aoSalvar={async () => {
          const prodId = produtoEditando?.id ?? `p${Date.now()}`

          const slugResolve = formStatus === 'ativo' && formSlugSelecionado
            ? formSlugSelecionado
            : (produtoEditando?.slug ?? formNome.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''))

          const novoProduto: ProdutoCatalogo = {
            id: produtoEditando?.id ?? '',
            nome: formNome,
            descricao: formDescricao,
            slug: slugResolve,
            status: formStatus === 'ativo' ? 'Ativo' : 'Em Breve',
            moduloBackend: formStatus === 'ativo' ? formSlugSelecionado ?? undefined : undefined,
            dataLancamento: formDataLancamento,
            temSetup: temSetup === 'sim',
            precoSetup: temSetup === 'sim' ? { valor: valorSetup, moeda: moedaSetup } : undefined,
            tipoCobranca,
            precoUnitario: { valor: valorUnitario, moeda: moedaProduto },
            precoMinimo: { valor: valorMinimo, moeda: moedaProduto },
            precoTotal: valorTotal ? { valor: valorTotal, moeda: moedaProduto } : undefined,
            limiteUsuarios: limiteUsuarios,
            qtdUsuariosBase: Number(qtdUsuarios) || undefined,
            precoUsuarioAdicional: valorUsuarioAdicional ? { valor: valorUsuarioAdicional, moeda: moedaUsuario } : undefined,
            horasHelpDesk: Number(totalHoras) || 0,
            precoHoraAdicional: { valor: '0,00', moeda: moedaHelpDesk },
            faixasPreco: faixas.length > 0 ? faixas : undefined
          }

          try {
            await catalogApiService.saveProduto(novoProduto)

            if (vincularOrg === 'sim' && orgSelecionada) {
              // Em breve integrar com a nova tabela de negociações no banco
            }

            handleFecharModal()
            addNotification({
              type: 'success',
              message: produtoEditando ? t('admin.products.msg_produto_atualizado', { nome: formNome }) : t('admin.products.msg_produto_criado', { nome: formNome })
            })
            // Refresh em background — sem flash de loading
            Promise.all([
              catalogApiService.getProdutos(),
              catalogApiService.getNegociacoes(),
            ]).then(([prods, negs]) => {
              setProdutos(prods)
              setNegociacoes(negs)
            })
            catalogApiService.getSlugsDisponiveis().then(setSlugsDisponiveis)
          } catch (err) {
            addNotification({
              type: 'error',
              message: err instanceof Error ? err.message : t('admin.products.modal_falha_salvar')
            })
          }
        }}
        icone={<ShoppingBagOpen weight="duotone" size={24} />}
        titulo={produtoEditando ? `${t('admin.products.modal_editar_prefixo')}${produtoEditando.nome}` : t('admin.products.modal_novo_titulo')}
        subtitulo={produtoEditando ? t('admin.products.modal_editar_subtitulo') : t('admin.products.modal_novo_subtitulo')}
        tamanho="lg"
        dirty={formDirty}
        podesSalvar={formDirty && formNome.trim().length > 0 && (formStatus === 'em-breve' || !!formSlugSelecionado)}
        abas={[
          {
            id: 'dados-basicos',
            rotulo: t('admin.products.aba_dados_basicos'),
            tooltipTitulo: 'IDENTIFICAÇÃO',
            tooltipDescricao: 'Dados principais e categoria do produto no catálogo.',
            conteudo: (
              <div style={{ padding: '1rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <SecaoFormularioGlobal icone={<Tag size={16} weight="duotone" />} titulo={t('admin.products.aba_dados_basicos')} tooltip={t('admin.overview.dados_basicos_tooltip')} />

                <GeralCampoGlobal
                  label={t('admin.products.campo_nome_produto')}
                  obrigatorio
                  tooltipTitulo="IDENTIFICAÇÃO PRINCIPAL"
                  tooltipDescricao="Nome comercial que aparecerá no catálogo e no faturamento"
                >
                  <div className="ws-input-icon-wrap">
                    <ShoppingBagOpen size={16} />
                    <input placeholder={t('admin.products.campo_nome_placeholder')} style={{ width: '100%' }} value={formNome} onChange={e => dirty(() => setFormNome(e.target.value))} />
                  </div>
                </GeralCampoGlobal>

                <GeralCampoGlobal
                  label={t('admin.products.campo_descricao')}
                  obrigatorio
                  tooltipTitulo="RESUMO COMERCIAL"
                  tooltipDescricao="Breve explicação das funcionalidades para exibição rápida no marketplace"
                >
                  <div className="ws-input-icon-wrap">
                    <Tag size={16} />
                    <input placeholder={t('admin.products.campo_descricao_placeholder')} style={{ width: '100%' }} value={formDescricao} onChange={e => dirty(() => setFormDescricao(e.target.value))} />
                  </div>
                </GeralCampoGlobal>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <GeralCampoGlobal
                    label={t('admin.products.campo_data_lancamento')}
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
                      placeholder={t('admin.products.campo_data_placeholder')}
                    />
                  </GeralCampoGlobal>

                  <GeralCampoGlobal
                    label={t('admin.products.campo_status_label')}
                    tooltipTitulo="DISPONIBILIDADE"
                    tooltipDescricao="Ativo: produto com infraestrutura pronta (requer slug). Em Breve: produto em desenvolvimento."
                  >
                    <div style={{ display: 'flex', gap: '0.5rem', paddingTop: '0.375rem' }}>
                      <TogBtn val="ativo" cur={formStatus} set={v => { setFormStatus(v as 'ativo' | 'em-breve'); if (v === 'em-breve') setFormSlugSelecionado(null) }} label={t('admin.products.campo_status_ativo')} />
                      <TogBtn val="em-breve" cur={formStatus} set={v => { setFormStatus(v as 'ativo' | 'em-breve'); if (v === 'em-breve') setFormSlugSelecionado(null) }} label={t('admin.products.campo_status_em_breve')} />
                    </div>
                  </GeralCampoGlobal>
                </div>

                {formStatus === 'ativo' && (
                  <GeralCampoGlobal
                    label={t('admin.products.campo_slug')}
                    obrigatorio
                    tooltipTitulo="VÍNCULO TÉCNICO"
                    tooltipDescricao="Selecione o slug do produto que já existe em contracts.json. Apenas produtos com infraestrutura pronta aparecem aqui."
                  >
                    {slugsDisponiveis.length > 0 || formSlugSelecionado ? (
                      <SelectGlobal
                        opcoes={[
                          ...(formSlugSelecionado && !slugsDisponiveis.includes(formSlugSelecionado)
                            ? [{ valor: formSlugSelecionado, rotulo: formSlugSelecionado + ` ${t('admin.products.campo_slug_atual_sufixo')}` }]
                            : []),
                          ...slugsDisponiveis.map(s => ({
                            valor: s,
                            rotulo: ({
                              'simula-custo': 'Simula Custo',
                              'bid-frete': 'Bid Frete',
                              'bid-cambio': 'Bid Cambio',
                              'pedido': 'Pedido',
                              'nf-importacao': 'NF Import',
                            } as Record<string, string>)[s] ?? s,
                          })),
                        ]}
                        valor={formSlugSelecionado}
                        aoMudarValor={v => dirty(() => setFormSlugSelecionado(v ? String(v) : null))}
                        iconeEsquerda={<Tag size={16} />}
                        placeholder={t('admin.products.campo_slug_placeholder')}
                        buscavel
                      />
                    ) : (
                      <div style={{ padding: '0.625rem 0.875rem', borderRadius: '0.375rem', background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.2)', color: '#fbbf24', fontSize: '0.8125rem' }}>
                        {t('admin.products.campo_slug_vazio')}
                      </div>
                    )}
                  </GeralCampoGlobal>
                )}
              </div>
            )
          },
          {
            id: 'setup',
            rotulo: t('admin.products.aba_setup'),
            tooltipTitulo: 'OPERAÇÃO INICIAL',
            tooltipDescricao: 'Taxa de ativação e onboarding (One-time fee).',
            conteudo: (
              <div style={{ padding: '1rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <SecaoFormularioGlobal icone={<Wrench size={16} weight="duotone" />} titulo={t('admin.products.aba_setup')} />

                <GeralCampoGlobal
                  label={t('admin.products.campo_tem_setup')}
                  tooltipTitulo="ADMISSÃO DO SERVIÇO"
                  tooltipDescricao="Define se haverá um custo único de ativação ou implantação"
                >
                  <div style={{ display: 'flex', gap: '0.5rem', paddingTop: '0.375rem' }}>
                    <TogBtn val="sim" cur={temSetup} set={v => setTemSetup(v as 'sim' | 'nao')} label={t('admin.products.campo_setup_sim')} />
                    <TogBtn val="nao" cur={temSetup} set={v => setTemSetup(v as 'sim' | 'nao')} label={t('admin.products.campo_setup_nao')} />
                  </div>
                </GeralCampoGlobal>

                {temSetup === 'sim' && (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <GeralCampoGlobal
                      label={t('admin.products.campo_moeda_setup')}
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
                      label={t('admin.products.campo_valor_setup')}
                      tooltipTitulo="INVESTIMENTO INICIAL"
                      tooltipDescricao="Montante fixo cobrado apenas no primeiro ciclo"
                    >
                      <div className="ws-input-icon-wrap">
                        <span style={{ fontSize: '0.8125rem', fontWeight: 700, minWidth: '24px', textAlign: 'center', color: 'var(--ws-muted)' }}>{getSimboloMoeda(moedaSetup)}</span>
                        <input placeholder={t('admin.products.campo_valor_placeholder')} style={{ width: '100%' }} inputMode="numeric" value={valorSetup} onChange={e => dirty(() => setValorSetup(mascaraMoeda(e.target.value)))} />
                      </div>
                    </GeralCampoGlobal>
                  </div>
                )}
              </div>
            )
          },
          {
            id: 'valor-produto',
            rotulo: t('admin.products.aba_valor_produto'),
            tooltipTitulo: 'PRECIFICAÇÃO',
            tooltipDescricao: 'Modelo de cobrança, recorrência e camadas de preço.',
            conteudo: (
              <div style={{ padding: '1rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <SecaoFormularioGlobal icone={<Sliders size={16} weight="duotone" />} titulo={t('admin.products.aba_valor_produto')} />

                <GeralCampoGlobal
                  label={t('admin.products.campo_tipo_cobranca')}
                  tooltipTitulo="MÉTRICA DE VALOR"
                  tooltipDescricao="Especifica a unidade de medida para o cálculo do faturamento"
                >
                  <SelectGlobal
                    opcoes={TIPOS_COBRANCA_OPCOES}
                    valor={tipoCobranca || null}
                    aoMudarValor={v => dirty(() => setTipoCobranca(String(v ?? '')))}
                    iconeEsquerda={<Sliders size={16} />}
                    placeholder={t('admin.products.campo_tipo_cobranca_placeholder')}
                    buscavel={false}
                  />
                </GeralCampoGlobal>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <GeralCampoGlobal
                    label={t('admin.products.campo_moeda')}
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
                    label={t('admin.products.campo_franquia')}
                    tooltipTitulo="VOLUME INCLUÍDO"
                    tooltipDescricao="Quantidade mínima de uso liberada sem custos extras"
                  >
                    <div className="ws-input-icon-wrap">
                      <Tag size={16} />
                      <input type="number" placeholder={t('admin.products.campo_qtd_placeholder')} style={{ width: '100%' }} value={qtdUsuarios} onChange={e => dirty(() => setQtdUsuarios(e.target.value))} />
                    </div>
                  </GeralCampoGlobal>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                  <GeralCampoGlobal
                    label={t('admin.products.campo_valor_unitario')}
                    tooltipTitulo="PREÇO POR UNIDADE"
                    tooltipDescricao="Custo aplicado cada vez que um item adicional é consumido"
                  >
                    <div className="ws-input-icon-wrap">
                      <span style={{ fontSize: '0.8125rem', fontWeight: 700, minWidth: '24px', textAlign: 'center', color: 'var(--ws-muted)' }}>{getSimboloMoeda(moedaProduto)}</span>
                      <input placeholder={t('admin.products.campo_valor_placeholder')} style={{ width: '100%' }} inputMode="numeric" value={valorUnitario} onChange={e => dirty(() => setValorUnitario(mascaraMoeda(e.target.value)))} />
                    </div>
                  </GeralCampoGlobal>
                  <GeralCampoGlobal
                    label={t('admin.products.campo_valor_minimo')}
                    tooltipTitulo="PISO DE COBRANÇA"
                    tooltipDescricao="Menor valor possível a ser faturado em cada ciclo"
                  >
                    <div className="ws-input-icon-wrap">
                      <span style={{ fontSize: '0.8125rem', fontWeight: 700, minWidth: '24px', textAlign: 'center', color: 'var(--ws-muted)' }}>{getSimboloMoeda(moedaProduto)}</span>
                      <input placeholder={t('admin.products.campo_valor_placeholder')} style={{ width: '100%' }} inputMode="numeric" value={valorMinimo} onChange={e => dirty(() => setValorMinimo(mascaraMoeda(e.target.value)))} />
                    </div>
                  </GeralCampoGlobal>
                  <GeralCampoGlobal
                    label={t('admin.products.campo_valor_total_produto')}
                    tooltipTitulo="PREÇO DO PACOTE"
                    tooltipDescricao="Custo fixo do serviço independentemente do volume consumido"
                  >
                    <div className="ws-input-icon-wrap">
                      <span style={{ fontSize: '0.8125rem', fontWeight: 700, minWidth: '24px', textAlign: 'center', color: 'var(--ws-muted)' }}>{getSimboloMoeda(moedaProduto)}</span>
                      <input placeholder={t('admin.products.campo_valor_placeholder')} style={{ width: '100%' }} inputMode="numeric" value={valorTotal} onChange={e => dirty(() => setValorTotal(mascaraMoeda(e.target.value)))} />
                    </div>
                  </GeralCampoGlobal>
                </div>

                <div style={{ marginTop: '0.5rem', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '1.25rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                    <TooltipGlobal titulo={t('admin.products.tiers_tooltip_titulo')} descricao={t('admin.products.tiers_tooltip_desc')}>
                      <p style={{ margin: 0, fontSize: '0.875rem', fontWeight: 600, color: 'var(--ws-text)', display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                        <Stack size={18} weight="duotone" color="var(--color-primary)" /> {t('admin.products.tiers_titulo')}
                      </p>
                    </TooltipGlobal>
                    <button 
                      type="button" 
                      onClick={() => dirty(() => setFaixas([...faixas, { id: `f${Date.now()}`, de: 0, ate: undefined, valor: '0,00', moeda: moedaProduto }]))}
                      style={{ fontSize: '0.8125rem', fontWeight: 600, background: 'rgba(52,211,153,0.08)', color: '#34d399', border: '1px solid rgba(52,211,153,0.25)', padding: '0.375rem 0.875rem', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', transition: 'all 0.15s' }}
                      onMouseEnter={e => { e.currentTarget.style.background = 'rgba(52,211,153,0.15)'; e.currentTarget.style.borderColor = 'rgba(52,211,153,0.4)' }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'rgba(52,211,153,0.08)'; e.currentTarget.style.borderColor = 'rgba(52,211,153,0.25)' }}
                    >
                      <Plus size={14} weight="bold" /> {t('admin.products.tiers_btn_adicionar')}
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
                            <GeralCampoGlobal label={t('admin.products.tier_de')}>
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

                            <GeralCampoGlobal label={t('admin.products.tier_ate')}>
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

                            <GeralCampoGlobal label={t('admin.products.tier_valor')}>
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
                      <p style={{ margin: 0, color: 'var(--ws-muted)', fontSize: '0.8125rem', fontWeight: 500 }}>{t('admin.products.tiers_vazio')}</p>
                      <p style={{ margin: '4px 0 0 0', color: 'rgba(255,255,255,0.2)', fontSize: '0.75rem' }}>{t('admin.products.tiers_vazio_detalhe')}</p>
                    </div>
                  )}
                </div>
              </div>
            )
          },
          {
            id: 'usuarios',
            rotulo: t('admin.products.aba_usuarios'),
            tooltipTitulo: t('admin.products.aba_usuarios_tooltip_titulo'),
            tooltipDescricao: t('admin.products.aba_usuarios_tooltip_desc'),
            conteudo: (
              <div style={{ padding: '1rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <SecaoFormularioGlobal icone={<Users size={16} weight="duotone" />} titulo={t('admin.products.aba_usuarios')} />

                <GeralCampoGlobal
                  label={t('admin.products.campo_qtd_usuarios')}
                  tooltipTitulo={t('admin.products.campo_qtd_usuarios_tooltip_titulo')}
                  tooltipDescricao={t('admin.products.campo_qtd_usuarios_tooltip_desc')}
                >
                  <div style={{ display: 'flex', gap: '0.5rem', paddingTop: '0.375rem' }}>
                    <TogBtn val="ilimitada" cur={limiteUsuarios} set={v => setLimiteUsuarios(v as 'ilimitada' | 'limitada')} label={t('admin.products.campo_qtd_ilimitada')} />
                    <TogBtn val="limitada" cur={limiteUsuarios} set={v => setLimiteUsuarios(v as 'ilimitada' | 'limitada')} label={t('admin.products.campo_qtd_limitada')} />
                  </div>
                </GeralCampoGlobal>

                {limiteUsuarios === 'limitada' && (
                  <>
                    <GeralCampoGlobal
                      label={t('admin.products.campo_quantidade')}
                      tooltipTitulo={t('admin.products.campo_quantidade_tooltip_titulo')}
                      tooltipDescricao={t('admin.products.campo_quantidade_tooltip_desc')}
                    >
                      <div className="ws-input-icon-wrap">
                        <Users size={16} />
                        <input type="number" placeholder={t('admin.products.campo_qtd_placeholder')} style={{ width: '100%' }} value={qtdUsuarios} onChange={e => dirty(() => setQtdUsuarios(e.target.value))} />
                      </div>
                    </GeralCampoGlobal>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                      <GeralCampoGlobal
                        label={t('admin.products.campo_moeda')}
                        tooltipTitulo={t('admin.products.campo_moeda_excedente_tooltip_titulo')}
                        tooltipDescricao={t('admin.products.campo_moeda_excedente_tooltip_desc')}
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
                        label={t('admin.products.campo_valor_usuario_adicional')}
                        tooltipTitulo={t('admin.products.campo_valor_usuario_adicional_tooltip_titulo')}
                        tooltipDescricao={t('admin.products.campo_valor_usuario_adicional_tooltip_desc')}
                      >
                        <div className="ws-input-icon-wrap">
                          <span style={{ fontSize: '0.8125rem', fontWeight: 700, minWidth: '24px', textAlign: 'center', color: 'var(--ws-muted)' }}>{getSimboloMoeda(moedaUsuario)}</span>
                          <input placeholder={t('admin.products.campo_valor_placeholder')} style={{ width: '100%' }} inputMode="numeric" value={valorUsuarioAdicional} onChange={e => dirty(() => setValorUsuarioAdicional(mascaraMoeda(e.target.value)))} />
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
            rotulo: t('admin.products.aba_help_desk'),
            tooltipTitulo: t('admin.products.aba_help_desk_tooltip_titulo'),
            tooltipDescricao: t('admin.products.aba_help_desk_tooltip_desc'),
            conteudo: (
              <div style={{ padding: '1rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <SecaoFormularioGlobal icone={<Headset size={16} weight="duotone" />} titulo={t('admin.products.aba_help_desk')} />

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <GeralCampoGlobal
                    label={t('admin.products.campo_horas_mensais')}
                    tooltipTitulo={t('admin.products.campo_horas_mensais_tooltip_titulo')}
                    tooltipDescricao={t('admin.products.campo_horas_mensais_tooltip_desc')}
                  >
                    <div className="ws-input-icon-wrap">
                      <Clock size={16} />
                      <input type="number" placeholder={t('admin.products.campo_qtd_placeholder')} style={{ width: '100%' }} value={totalHoras} onChange={e => dirty(() => setTotalHoras(e.target.value))} />
                    </div>
                  </GeralCampoGlobal>
                  <GeralCampoGlobal
                    label={t('admin.products.campo_moeda_hora_adicional')}
                    tooltipTitulo={t('admin.products.campo_moeda_hora_adicional_tooltip_titulo')}
                    tooltipDescricao={t('admin.products.campo_moeda_hora_adicional_tooltip_desc')}
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
            rotulo: t('admin.products.aba_negociacao'),
            tooltipTitulo: t('admin.products.aba_negociacao_tooltip_titulo'),
            tooltipDescricao: t('admin.products.aba_negociacao_tooltip_desc'),
            conteudo: (
              <div style={{ padding: '1rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <SecaoFormularioGlobal icone={<Handshake size={16} weight="duotone" />} titulo={t('admin.products.negociacao_titulo')} tooltip={t('admin.products.negociacao_tooltip')} />

                <GeralCampoGlobal
                  label={t('admin.products.campo_vincular_org')}
                  tooltipTitulo={t('admin.products.campo_vincular_org_tooltip_titulo')}
                  tooltipDescricao={t('admin.products.campo_vincular_org_tooltip_desc')}
                >
                  <div style={{ display: 'flex', gap: '0.5rem', paddingTop: '0.375rem' }}>
                    <TogBtn val="nao" cur={vincularOrg} set={v => dirty(() => setVincularOrg(v as 'sim' | 'nao'))} label={t('admin.products.opcao_nao')} />
                    <TogBtn val="sim" cur={vincularOrg} set={v => dirty(() => setVincularOrg(v as 'sim' | 'nao'))} label={t('admin.products.opcao_sim')} />
                  </div>
                </GeralCampoGlobal>

                {vincularOrg === 'sim' && (
                  <>
                    <GeralCampoGlobal label={t('admin.products.campo_empresa_org')} obrigatorio>
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
                        placeholder={t('admin.products.campo_empresa_org_placeholder')}
                        buscavel
                      />
                    </GeralCampoGlobal>


                    <GeralCampoGlobal label={t('admin.products.campo_vigencia')}>
                      <div style={{ display: 'flex', gap: '0.5rem', paddingTop: '0.375rem', marginBottom: '0.5rem' }}>
                        <TogBtn val="nao" cur={vigenciaIlimitada} set={v => dirty(() => setVigenciaIlimitada(v as 'sim' | 'nao'))} label={t('admin.products.vigencia_com_data')} />
                        <TogBtn val="sim" cur={vigenciaIlimitada} set={v => dirty(() => { setVigenciaIlimitada(v as 'sim' | 'nao'); setVigenciaPeriodo({ inicio: null, fim: null }) })} label={t('admin.products.vigencia_ilimitada')} />
                      </div>
                      {vigenciaIlimitada === 'nao' && (
                        <CalendarioCampoGlobal
                          placeholder={t('admin.products.vigencia_placeholder')}
                          valor={vigenciaPeriodo}
                          aoMudarValor={v => dirty(() => setVigenciaPeriodo(v))}
                        />
                      )}
                      {vigenciaIlimitada === 'sim' && (
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.375rem 0.875rem', borderRadius: '9999px', background: 'rgba(129,140,248,0.08)', border: '1px solid rgba(129,140,248,0.2)', color: '#818cf8', fontSize: '0.8125rem', fontWeight: 600 }}>
                          <Infinity size={15} weight="bold" />
                          {t('admin.products.vigencia_sem_expiracao')}
                        </div>
                      )}
                    </GeralCampoGlobal>

                    {orgSelecionada && (
                      <div style={{ padding: '0.75rem 1rem', borderRadius: 8, background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                        <span style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#10b981' }}>{t('admin.products.negociacao_preview_titulo')}</span>
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
      aoCancelar={() => setProdutoParaExcluir(null)}
      aoConfirmar={async () => {
        if (!produtoParaExcluir) return
        try {
          const nome = produtoParaExcluir.nome
          await catalogApiService.deleteProduto(produtoParaExcluir.id)
          setProdutoParaExcluir(null)
          addNotification({ type: 'success', message: t('admin.products.msg_produto_excluido', { nome }) })
          carregarDados()
        } catch (err) {
          addNotification({
            type: 'error',
            message: t('admin.products.msg_erro_excluir') + (err instanceof Error ? err.message : t('admin.products.msg_desconhecido'))
          })
        }
      }}
      titulo={t('admin.products.excluir_titulo')}
      descricao={<>{t('admin.products.excluir_descricao_pre')} <strong>{produtoParaExcluir?.nome}</strong> {t('admin.products.excluir_descricao_pos')}</>}
      nomeItem={t('admin.products.excluir_aviso')}
    />
    </>
  )
}
