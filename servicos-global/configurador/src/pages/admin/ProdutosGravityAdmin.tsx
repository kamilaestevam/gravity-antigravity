import React, { useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { TooltipGlobal } from '@nucleo/tooltip-global'
import { ShoppingBagOpen, Tag, Users, CurrencyCircleDollar, BoxArrowUp, Wrench, Sliders, Headset, Clock, Coins, PauseCircle, PlayCircle, PencilSimple, Handshake, Buildings, Infinity, Trash, Plus, Minus, Stack } from '@phosphor-icons/react'
import { ModalExclusao } from '../workspace/ModalConfirmarExclusao'
import { CampoCalendarioGlobal } from '@nucleo/campo-calendario-global'
import { PaginaGlobal } from '@nucleo/pagina-global'
import { CabecalhoGlobal } from '@nucleo/cabecalho-global'
import { TabelaGlobal, type TabelaGlobalColuna, type TabelaGlobalAcao } from '@nucleo/tabela-global'
import { CardBasicoGlobal } from '@nucleo/card-global'
import { BotaoNovoAdminGlobal } from '@nucleo/botao-novo-admin-global'
import { ModalFormularioAbasGlobal } from '@nucleo/modal-formulario-abas-global'
import { SecaoFormulario } from '@nucleo/modal-formulario-global'
import { CampoGeralGlobal } from '@nucleo/campo-geral-global'
import { SelectGlobal } from '@nucleo/campo-select-global'
import {
  BannerRequisitosGlobal,
  BannerRequisitosContexto,
  type RequisitoSalvar,
} from '@nucleo/banner-requisitos-global'
import { useAuth } from '@clerk/clerk-react'
import { useShellStore } from '@gravity/shell'
import { useHistoricoLogger } from '../../hooks/use-historico-logger'
import { catalogApiService, type ProdutoInput } from '../../services/catalog-adapter'
import { setAuthTokenProvider } from '../../services/api-client'
import { ProdutoCatalogo, NegociacaoEspecial, StatusGlobal, FaixaPreco } from '../../types/entidades'
import { getAcoesExportacaoPadrao } from '../../utils/export-helper'
import { extractCatchError } from '../../utils/extract-api-error'


// Dados iniciais agora vêm do catalogService

const getStatusBadge = (status: StatusGlobal) => {
  switch (status) {
    case 'ATIVO': return 'ws-badge-success'
    case 'EM_BREVE': return 'ws-badge-warning'
    case 'LEGADO': return 'ws-badge-danger'
    case 'SUSPENSO': return 'ws-badge-warning'
    default: return 'ws-badge-neutral'
  }
}

const getStatusColor = (status: StatusGlobal) => {
  switch (status) {
    case 'ATIVO': return { cor: '#34d399', bg: 'rgba(52,211,153,0.12)' }
    case 'EM_BREVE': return { cor: '#818cf8', bg: 'rgba(129,140,248,0.12)' }
    case 'LEGADO': return { cor: '#f87171', bg: 'rgba(248,113,113,0.12)' }
    case 'SUSPENSO': return { cor: '#f87171', bg: 'rgba(248,113,113,0.12)' }
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

// Valores são enum Prisma (TipoCobrancaGravity) — rótulo é UI em pt-BR.
const TIPOS_COBRANCA_OPCOES = [
  { valor: 'MENSAL',         rotulo: 'Mensalidade'    },
  { valor: 'POR_PROCESSO',   rotulo: 'Por Processo'   },
  { valor: 'POR_DOCUMENTO',  rotulo: 'Por Documento'  },
  { valor: 'POR_ESTIMATIVA', rotulo: 'Por Estimativa' },
  { valor: 'POR_DI_DUIMP',   rotulo: 'Por DI/DUIMP'   },
  { valor: 'POR_DUE',        rotulo: 'Por DUE'        },
  { valor: 'POR_PRODUTO',    rotulo: 'Por Produto'    },
  { valor: 'POR_FLUXO',      rotulo: 'Por Fluxo'      },
  { valor: 'POR_LPCO',       rotulo: 'Por LPCO'       },
]

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

export function ProdutosGravityAdmin() {
  const { t } = useTranslation()
  const { getToken } = useAuth()
  const addNotification = useShellStore((s) => s.addNotification)

  const getStatusLabel = (status: StatusGlobal): string => {
    switch (status) {
      case 'ATIVO':    return t('admin.produtos-gravity.status.ativo').toUpperCase()
      case 'EM_BREVE': return t('admin.produtos-gravity.status.em_breve').toUpperCase()
      case 'LEGADO':   return t('admin.produtos-gravity.status.legado').toUpperCase()
      case 'SUSPENSO': return t('admin.produtos-gravity.status.suspenso').toUpperCase()
      case 'INATIVO':  return 'INATIVO'
      default: return status
    }
  }
  const { logEvent } = useHistoricoLogger()
  const [produtos, setProdutos] = React.useState<ProdutoCatalogo[]>([])
  const [negociacoes, setNegociacoes] = React.useState<NegociacaoEspecial[]>([])
  const [slugsDisponiveis, setSlugsDisponiveis] = React.useState<string[]>([])
  const [carregando, setCarregando] = React.useState(true)

  // Paginação server-side
  const [pagina, setPagina] = React.useState(1)
  const [totalPaginas, setTotalPaginas] = React.useState(1)
  const [totalProdutos, setTotalProdutos] = React.useState(0)
  const LIMITE_POR_PAGINA = 50

  const carregarDados = React.useCallback(async () => {
    // Garantir que o token Clerk está configurado ANTES de qualquer chamada API
    setAuthTokenProvider(() => getToken())

    setCarregando(true)
    // Slugs carregados independentemente — não devem bloquear a lista de produtos
    catalogApiService.getSlugsDisponiveis().then(setSlugsDisponiveis)
    try {
      const [lista, negs] = await Promise.all([
        catalogApiService.listProdutos({ page: pagina, limit: LIMITE_POR_PAGINA }),
        catalogApiService.getNegociacoes(),
      ])
      setProdutos(lista.produtos)
      setTotalPaginas(lista.pages)
      setTotalProdutos(lista.total)
      setNegociacoes(negs)
    } catch (err) {
      addNotification({ type: 'error', message: extractCatchError(err, t('admin.produtos-gravity.msg_erro_carregar')) })
    } finally {
      setCarregando(false)
    }
  }, [getToken, pagina, addNotification, t])

  React.useEffect(() => {
    carregarDados()
  }, [carregarDados])

  const toggleProdutoStatus = async (id_produto_gravity: string) => {
    const produto = produtos.find(p => p.id_produto_gravity === id_produto_gravity)
    if (!produto) return

    const novoStatus: StatusGlobal = produto.status_produto_gravity === 'ATIVO' ? 'SUSPENSO' : 'ATIVO'

    try {
      await catalogApiService.toggleProdutoStatus(id_produto_gravity)
      await carregarDados()

      addNotification({
        type: 'success',
        message: t('admin.produtos-gravity.msg_status_alterado', { nome: produto.nome_produto_gravity, status: novoStatus }),
      })

      logEvent({
        action: 'ALTERAÇÃO',
        module: 'produto',
        resource_type: 'Product',
        resource_id: produto.id_produto_gravity,
        action_detail: `Alteração do status do produto ${produto.nome_produto_gravity}`,
        diff: [{ campo: 'Status', antes: produto.status_produto_gravity, depois: novoStatus }],
      })
    } catch (err) {
      addNotification({
        type: 'error',
        message: t('admin.produtos-gravity.msg_erro_status') + extractCatchError(err, t('admin.produtos-gravity.msg_desconhecido')),
      })
    }
  }

  const [tab, setTab] = useState<'catalogo' | 'negociacoes'>('catalogo')
  const [modalAberto, setModalAberto] = useState(false)
  const [produtoEditando, setProdutoEditando] = useState<ProdutoCatalogo | null>(null)
  const [produtoParaExcluir, setProdutoParaExcluir] = useState<ProdutoCatalogo | null>(null)
  const [formDirty, setFormDirty] = useState(false)

  // 01. Dados Básicos — formStatus usa o valor Prisma (UPPER_SNAKE) direto.
  // Mapas de tradução foram eliminados (Paridade Absoluta).
  type FormStatus = StatusGlobal
  const FORM_STATUS_TO_UI: Record<FormStatus, StatusGlobal> = {
    ATIVO: 'ATIVO',
    EM_BREVE: 'EM_BREVE',
    SUSPENSO: 'SUSPENSO',
    LEGADO: 'LEGADO',
    INATIVO: 'INATIVO',
  }
  const UI_STATUS_TO_FORM: Record<StatusGlobal, FormStatus> = FORM_STATUS_TO_UI
  const [formNome, setFormNome] = React.useState('')
  const [formDescricao, setFormDescricao] = React.useState('')
  const [formDataLancamento, setFormDataLancamento] = React.useState('')
  const [formStatus, setFormStatus] = React.useState<FormStatus>('ATIVO')
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

  // 08. GABI Tokens
  const [gabiQuotaMensal, setGabiQuotaMensal] = React.useState('')
  const [gabiTokenStats, setGabiTokenStats] = React.useState<{
    total_consumido: number; total_tenants: number; media_por_tenant: number; percentual: number
  } | null>(null)

  const dirty = (fn: () => void) => { fn(); setFormDirty(true) }

  const handleFecharModal = () => {
    setModalAberto(false)
    setProdutoEditando(null)
    setFormDirty(false)
    setFormNome(''); setFormDescricao(''); setFormDataLancamento('');
    setFormStatus('ATIVO'); setFormSlugSelecionado(null)
    setTemSetup('nao'); setMoedaSetup('BRL'); setValorSetup('')
    setTipoCobranca(''); setMoedaProduto('BRL'); setValorUnitario(''); setValorMinimo(''); setValorTotal('')
    setLimiteUsuarios('limitada'); setQtdUsuarios(''); setMoedaUsuario('BRL'); setValorUsuarioAdicional('')
    setTotalHoras(''); setMoedaHelpDesk('BRL')
    setVincularOrg('nao'); setOrgSelecionada(null)
    setVigenciaIlimitada('nao'); setVigenciaPeriodo({ inicio: null, fim: null }); setVigenciaNeg('')
    setFaixas([])
    setGabiQuotaMensal('')
    setGabiTokenStats(null)
  }

  const handleEditarProduto = (item: ProdutoCatalogo) => {
    setProdutoEditando(item)
    setFormNome(item.nome_produto_gravity)
    setFormDescricao(item.descricao_produto_gravity)
    setFormDataLancamento(item.data_lancamento_produto_gravity || '')
    setFormStatus(UI_STATUS_TO_FORM[item.status_produto_gravity] ?? 'EM_BREVE')
    setFormSlugSelecionado(item.modulo_backend_produto_gravity ?? item.slug_produto_gravity ?? null)
    setTemSetup(item.possui_setup_produto_gravity ? 'sim' : 'nao')
    setMoedaSetup(item.moeda_setup_produto_gravity || 'BRL')
    setValorSetup(item.preco_setup_produto_gravity || '')
    setTipoCobranca(item.tipo_cobranca_produto_gravity)
    setMoedaProduto(item.moeda_unitario_produto_gravity)
    setValorUnitario(item.preco_unitario_produto_gravity)
    setValorMinimo(item.preco_minimo_produto_gravity)
    setValorTotal(item.preco_total_produto_gravity || '')
    setLimiteUsuarios(item.tipo_limite_usuario_produto_gravity === 'LIMITADO' ? 'limitada' : 'ilimitada')
    setQtdUsuarios(String(item.qtd_usuarios_base_produto_gravity || ''))
    setMoedaUsuario(item.moeda_usuario_extra_produto_gravity || 'BRL')
    setValorUsuarioAdicional(item.preco_usuario_extra_produto_gravity || '')
    setTotalHoras(String(item.horas_helpdesk_produto_gravity))
    setMoedaHelpDesk(item.moeda_hora_extra_produto_gravity || 'BRL')
    setFaixas(item.faixas_preco_produto_gravity || [])
    setGabiQuotaMensal(String(item.quota_gabi_mensal_produto_gravity ?? 0))
    setGabiTokenStats(null)
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

  const COLUNAS_PRODUTOS = useMemo<TabelaGlobalColuna<ProdutoCatalogo>[]>(() => [
    {
      key: 'nome_produto_gravity', label: t('admin.produtos-gravity.tabela.nome_produto'), tipo: 'texto',
      tooltipTitulo: 'NOME COMERCIAL',
      tooltipDescricao: 'Identificação do serviço no catálogo e no marketplace',
      render: (v) => <span style={{ fontWeight: 600, color: 'var(--ws-text)' }}>{v}</span>,
    },
    {
      key: 'descricao_produto_gravity', label: t('admin.produtos-gravity.tabela.o_que_e'), tipo: 'texto',
      tooltipTitulo: 'DESCRIÇÃO',
      tooltipDescricao: 'Resumo das funcionalidades principais exibido para o cliente',
      render: (v) => <span style={{ color: 'var(--ws-muted)', fontSize: '0.85rem' }}>{v}</span>,
    },
    {
      key: 'modulo_backend_produto_gravity', label: t('admin.produtos-gravity.tabela.slug_modulo'), tipo: 'texto',
      tooltipTitulo: 'VÍNCULO TÉCNICO',
      tooltipDescricao: 'Identificador do sistema para ativação automática das funções',
      render: (v) => <code style={{ color: '#8b5cf6', fontSize: '0.75rem' }}>{v}</code>,
    },
    {
      key: 'preco_unitario_produto_gravity', label: t('admin.produtos-gravity.tabela.valor_adicional'), tipo: 'texto',
      tooltipTitulo: 'CUSTO EXCEDENTE',
      tooltipDescricao: 'Custo aplicado ao consumo que ultrapassa o limite da franquia',
      render: (_v, item) => {
        const faixas = item.faixas_preco_produto_gravity
        if (faixas && faixas.length > 0) {
          const ultima = faixas[faixas.length - 1]
          return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              <span style={{ fontWeight: 700, color: 'var(--color-primary)', fontSize: '0.8125rem' }}>{t('admin.produtos-gravity.tabela.ver_camadas')} ({faixas.length})</span>
              <span style={{ color: 'var(--ws-muted)', fontSize: '0.75rem' }}>{t('admin.produtos-gravity.tabela.a_partir_de')} {getSimboloMoeda(faixas[0].moeda_faixa_preco_produto_gravity)} {ultima.preco_faixa_preco_produto_gravity}</span>
            </div>
          )
        }
        return <span style={{ fontFamily: 'monospace', fontWeight: 700, color: 'var(--ws-text)', fontSize: '0.9375rem' }}>{getSimboloMoeda(item.moeda_unitario_produto_gravity)} {item.preco_unitario_produto_gravity}</span>
      },
    },
    {
      key: 'qtd_usuarios_base_produto_gravity', label: t('admin.produtos-gravity.tabela.franquia_free'), tipo: 'texto',
      tooltipTitulo: 'COTA INCLUÍDA',
      tooltipDescricao: 'Volume de uso liberado sem custo adicional em cada ciclo',
      render: (_v, item) => (
        <span style={{ color: item.qtd_usuarios_base_produto_gravity ? '#34d399' : 'var(--ws-muted)', fontSize: '0.85rem', fontWeight: item.qtd_usuarios_base_produto_gravity ? 600 : 400 }}>
          {item.qtd_usuarios_base_produto_gravity ? `${item.qtd_usuarios_base_produto_gravity} ${item.tipo_cobranca_produto_gravity.replace('POR_', '')}s` : 'Zero'}
        </span>
      ),
    },
    {
      key: 'tipo_cobranca_produto_gravity', label: 'Unidade', tipo: 'texto',
      tooltipTitulo: 'MÉTRICA',
      tooltipDescricao: 'Unidade de medida usada para o cálculo do faturamento',
      render: (v) => <span style={{ color: 'var(--ws-muted)', fontSize: '0.85rem' }}>{v}</span>,
    },
    {
      key: 'status_produto_gravity', label: 'Status', tipo: 'texto',
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
      },
    },
  ], [t, getStatusLabel])

  const ACOES_PRODUTOS: TabelaGlobalAcao<ProdutoCatalogo>[] = [
    {
      id: 'toggle-status',
      icone: <PauseCircle size={15} weight="bold" />,
      tooltip: (item) => item.status_produto_gravity === 'ATIVO' ? 'Suspender produto' : 'Ativar produto',
      onClick: (item) => toggleProdutoStatus(item.id_produto_gravity),
      renderCustom: (item) => (
        <button
          type="button"
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleProdutoStatus(item.id_produto_gravity) }}
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 28, height: 28, borderRadius: '50%', background: 'transparent', border: '1px solid transparent', color: '#64748b', cursor: 'pointer', transition: 'all 0.15s', flexShrink: 0 }}
          onMouseEnter={ev => { ev.currentTarget.style.background = item.status_produto_gravity === 'ATIVO' ? 'rgba(251,191,36,0.12)' : 'rgba(52,211,153,0.12)'; ev.currentTarget.style.borderColor = item.status_produto_gravity === 'ATIVO' ? 'rgba(251,191,36,0.3)' : 'rgba(52,211,153,0.3)'; ev.currentTarget.style.color = item.status_produto_gravity === 'ATIVO' ? '#fbbf24' : '#34d399' }}
          onMouseLeave={ev => { ev.currentTarget.style.background = 'transparent'; ev.currentTarget.style.borderColor = 'transparent'; ev.currentTarget.style.color = '#64748b' }}
        >
          {item.status_produto_gravity === 'ATIVO' ? <PauseCircle size={16} weight="bold" /> : <PlayCircle size={16} weight="bold" />}
        </button>
      ),
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
      ),
    },
    {
      id: 'excluir',
      icone: <Trash size={15} weight="bold" />,
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
          <Trash size={16} weight="bold" />
        </button>
      ),
    },
  ]

  const COLUNAS_NEGOCIACOES: TabelaGlobalColuna<NegociacaoEspecial>[] = [
    {
      key: 'nome_organizacao_negociacao_especial_preco_produto_gravity', label: 'Cliente', tipo: 'texto',
      tooltipTitulo: 'Referência ao id_organizacao', tooltipDescricao: 'Vinculação FK com a tabela de Organizacao.',
      render: (v) => <span style={{ fontWeight: 600 }}>{v}</span>
    },
    {
      key: 'id_produto_gravity', label: 'Produto Relacionado', tipo: 'texto',
      tooltipTitulo: 'Referência ao id_produto_gravity', tooltipDescricao: 'FK para a tabela de produtos globais no banco master.',
      render: (v) => {
        const prod = produtos.find(p => p.id_produto_gravity === v)
        return <span style={{ color: 'var(--ws-text)' }}>{prod ? prod.nome_produto_gravity : '—'}</span>
      }
    },
    {
      key: 'acordo_negociacao_especial_preco_produto_gravity', label: 'Condição Especial', tipo: 'texto',
      tooltipTitulo: 'Override de Preço', tooltipDescricao: 'Regra de exceção aplicada no motor de billing no final do mês.',
      render: (v) => <span style={{ color: '#818cf8', fontWeight: 500 }}>{v}</span>
    },
    {
      key: 'ilimitado_negociacao_especial_preco_produto_gravity', label: 'Vigência', tipo: 'texto',
      tooltipTitulo: 'TTL / Data de Expiração', tooltipDescricao: 'Determina reversão automática para o pricing base após a data limite.',
      render: (v, item) => (
        <span style={{ color: 'var(--ws-muted)', fontSize: '0.85rem' }}>
          {v ? 'Indeterminado' : (item.data_fim_negociacao_especial_preco_produto_gravity || 'Expirado')}
        </span>
      )
    }
  ]

  const requisitosProduto: RequisitoSalvar[] = [
    { chave: 'nome', ok: formNome.trim().length > 0, mensagem: 'Nome do produto' },
    {
      chave: 'slug',
      ok: formStatus === 'em-breve' || !!formSlugSelecionado,
      mensagem: 'Status "Em breve" ou slug do catálogo selecionado',
    },
  ]

  return (
    <>
    <PaginaGlobal
      className="ws-fade-up"
      layout="lista"
      cabecalho={
        <CabecalhoGlobal
          titulo={t('admin.produtos-gravity.titulo')}
          subtitulo={t('admin.produtos-gravity.subtitulo')}
          icone={<ShoppingBagOpen weight="duotone" size={22} color="#818cf8" />}
        />
      }
      stats={
        <>
          <CardBasicoGlobal
            titulo={t('admin.produtos-gravity.card_total')}
            icone={<BoxArrowUp weight="duotone" size={16} style={{ color: 'var(--ws-accent)' }} />}
            valor={produtos.length}
            subtexto={t('admin.produtos-gravity.card_total_subtexto')}
            tooltip={
              <>
                <p className="cg-tooltip__title">{t('admin.produtos-gravity.card_total_tooltip_titulo')}</p>
                <div className="cg-tooltip__row"><span>{t('admin.produtos-gravity.card_total_tooltip_mapeados')}</span> <strong>{produtos.length}</strong></div>
                <div className="cg-tooltip__row"><span>{t('admin.produtos-gravity.card_total_tooltip_disponibilidade')}</span> <strong>{t('admin.produtos-gravity.card_total_tooltip_global')}</strong></div>
              </>
            }
          />
          <CardBasicoGlobal
            titulo={t('admin.produtos-gravity.card_ativos')}
            icone={<Tag weight="duotone" size={16} style={{ color: '#34d399' }} />}
            valor={produtos.filter(p => p.status_produto_gravity === 'ATIVO').length}
            subtexto={t('admin.produtos-gravity.card_ativos_subtexto')}
            variante="sucesso"
            tooltip={
              <>
                <p className="cg-tooltip__title">{t('admin.produtos-gravity.card_ativos_tooltip_titulo')}</p>
                <div className="cg-tooltip__row"><span>{t('admin.produtos-gravity.card_ativos_tooltip_label')}</span> <strong>{produtos.filter(p => p.status_produto_gravity === 'ATIVO').length}</strong></div>
                <div className="cg-tooltip__row"><span>{t('admin.produtos-gravity.card_ativos_tooltip_checkout')}</span> <strong>{t('admin.produtos-gravity.opcao_sim')}</strong></div>
              </>
            }
          />
          <CardBasicoGlobal
            titulo={t('admin.produtos-gravity.card_negociacoes')}
            icone={<Users weight="duotone" size={16} style={{ color: '#fbbf24' }} />}
            valor={negociacoes.length}
            subtexto={t('admin.produtos-gravity.card_negociacoes_subtexto')}
            variante="aviso"
            tooltip={
              <>
                <p className="cg-tooltip__title">{t('admin.produtos-gravity.card_negociacoes_tooltip_titulo')}</p>
                <div className="cg-tooltip__row"><span>{t('admin.produtos-gravity.card_negociacoes_tooltip_label')}</span> <strong>{negociacoes.length}</strong></div>
                <div className="cg-tooltip__row"><span>{t('admin.produtos-gravity.card_negociacoes_tooltip_taxa')}</span> <strong>{t('admin.produtos-gravity.card_negociacoes_tooltip_alta')}</strong></div>
              </>
            }
          />
        </>
      }
      toolbar={
        <div className="ws-tabs" style={{ margin: 0 }}>
          <button className={`ws-tab${tab === 'catalogo' ? ' active' : ''}`} onClick={() => setTab('catalogo')}>
            {t('admin.produtos-gravity.tab_catalogo')}
          </button>
          <button className={`ws-tab${tab === 'negociacoes' ? ' active' : ''}`} onClick={() => setTab('negociacoes')}>
            {t('admin.produtos-gravity.tab_negociacoes')}
          </button>
        </div>
      }
    >
      {tab === 'catalogo' && (
        <div className="ws-fade-up">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <p className="ws-section-title" style={{ margin: 0 }}>
              <Tag weight="duotone" size={14} color="#818cf8" /> {t('admin.produtos-gravity.secao_catalogo')}
              {carregando && (
                <span style={{ marginLeft: 12, fontSize: '0.75rem', color: 'var(--ws-muted)', fontWeight: 400 }}>
                  {t('admin.produtos-gravity.carregando') ?? 'Carregando...'}
                </span>
              )}
            </p>
            <BotaoNovoAdminGlobal
              rotulo={t('admin.produtos-gravity.btn_novo')}
              onClick={() => setModalAberto(true)}
            />
          </div>
          <div style={{ position: 'relative', zIndex: 10 }}>
            <TabelaGlobal<ProdutoCatalogo>
              id="admin-products-catalog"
              dados={produtos}
              colunas={COLUNAS_PRODUTOS}
              acoes={ACOES_PRODUTOS}
              mensagemVazio={t('admin.produtos-gravity.vazio_catalogo')}
              tooltipBusca={t('admin.produtos-gravity.tooltip_busca_catalogo')}
              acoesExportacao={getAcoesExportacaoPadrao(COLUNAS_PRODUTOS, 'dados_tabela', 'Exportação de Dados')}
            />
            {totalPaginas > 1 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 16, padding: '0 8px', fontSize: '0.8125rem', color: 'var(--ws-muted)' }}>
                <span>
                  {t('admin.produtos-gravity.paginacao_total', { total: totalProdutos }) ?? `${totalProdutos} produto(s) no total`}
                </span>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <button
                    type="button"
                    onClick={() => setPagina(p => Math.max(1, p - 1))}
                    disabled={pagina <= 1 || carregando}
                    style={{ padding: '0.375rem 0.75rem', borderRadius: 6, border: '1px solid rgba(255,255,255,0.1)', background: 'transparent', color: 'var(--ws-text)', cursor: pagina <= 1 ? 'not-allowed' : 'pointer', opacity: pagina <= 1 ? 0.4 : 1 }}
                  >
                    ← Anterior
                  </button>
                  <span style={{ minWidth: 80, textAlign: 'center' }}>
                    Página {pagina} de {totalPaginas}
                  </span>
                  <button
                    type="button"
                    onClick={() => setPagina(p => Math.min(totalPaginas, p + 1))}
                    disabled={pagina >= totalPaginas || carregando}
                    style={{ padding: '0.375rem 0.75rem', borderRadius: 6, border: '1px solid rgba(255,255,255,0.1)', background: 'transparent', color: 'var(--ws-text)', cursor: pagina >= totalPaginas ? 'not-allowed' : 'pointer', opacity: pagina >= totalPaginas ? 0.4 : 1 }}
                  >
                    Próxima →
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {tab === 'negociacoes' && (
        <div className="ws-fade-up">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <p className="ws-section-title" style={{ margin: 0 }}>
              <CurrencyCircleDollar weight="duotone" size={14} color="#f59e0b" /> {t('admin.produtos-gravity.secao_negociacoes')}
            </p>
          </div>
          <div style={{ position: 'relative', zIndex: 10 }}>
            <TabelaGlobal<NegociacaoEspecial>
              id="admin-products-negotiations"
              dados={negociacoes}
              colunas={COLUNAS_NEGOCIACOES}
              mensagemVazio={t('admin.produtos-gravity.vazio_negociacoes')}
              tooltipBusca={t('admin.produtos-gravity.tooltip_busca_negociacoes')}
              acoesExportacao={getAcoesExportacaoPadrao(COLUNAS_NEGOCIACOES, 'dados_tabela', 'Exportação de Dados')}
            />
          </div>
        </div>
      )}

      <ModalFormularioAbasGlobal
        aberto={modalAberto}
        aoFechar={handleFecharModal}
        aoSalvar={async () => {
          const isNew = !produtoEditando
          const slugResolve = formStatus === 'ATIVO' && formSlugSelecionado
            ? formSlugSelecionado
            : (produtoEditando?.slug_produto_gravity ?? formNome.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''))

          const produtoInput: ProdutoInput = {
            id_produto_gravity: produtoEditando?.id_produto_gravity,
            nome_produto_gravity:            formNome,
            descricao_produto_gravity:       formDescricao,
            slug_produto_gravity:            slugResolve,
            status_produto_gravity:          FORM_STATUS_TO_UI[formStatus],
            modulo_backend_produto_gravity:  formStatus === 'ATIVO' ? formSlugSelecionado ?? undefined : undefined,
            data_lancamento_produto_gravity: formDataLancamento,

            possui_setup_produto_gravity: temSetup === 'sim',
            preco_setup_produto_gravity:  temSetup === 'sim' ? valorSetup : undefined,
            moeda_setup_produto_gravity:  moedaSetup,

            tipo_cobranca_produto_gravity:  tipoCobranca as ProdutoInput['tipo_cobranca_produto_gravity'],
            preco_unitario_produto_gravity: valorUnitario,
            moeda_unitario_produto_gravity: moedaProduto,
            preco_minimo_produto_gravity:   valorMinimo,
            moeda_minimo_produto_gravity:   moedaProduto,
            preco_total_produto_gravity:    valorTotal || undefined,
            moeda_total_produto_gravity:    moedaProduto,

            tipo_limite_usuario_produto_gravity: limiteUsuarios === 'limitada' ? 'LIMITADO' : 'ILIMITADO',
            qtd_usuarios_base_produto_gravity:   Number(qtdUsuarios) || undefined,
            preco_usuario_extra_produto_gravity: valorUsuarioAdicional || undefined,
            moeda_usuario_extra_produto_gravity: moedaUsuario,

            horas_helpdesk_produto_gravity:   Number(totalHoras) || 0,
            preco_hora_extra_produto_gravity: undefined,
            moeda_hora_extra_produto_gravity: moedaHelpDesk,

            faixas_preco_produto_gravity: faixas.length > 0 ? faixas : undefined,

            quota_gabi_mensal_produto_gravity: Number(gabiQuotaMensal.replace(/\./g, '').replace(',', '.')) || 0,

            publico_alvo_produto_gravity: undefined,
          }

          try {
            await catalogApiService.saveProduto(produtoInput, { isNew })

            if (vincularOrg === 'sim' && orgSelecionada) {
              // Em breve integrar com a nova tabela de negociações no banco
            }

            handleFecharModal()
            addNotification({
              type: 'success',
              message: isNew
                ? t('admin.produtos-gravity.msg_produto_criado', { nome: formNome })
                : t('admin.produtos-gravity.msg_produto_atualizado', { nome: formNome }),
            })

            // Auditoria explícita (create/update não eram registrados antes)
            logEvent({
              action: isNew ? 'CRIAÇÃO' : 'ALTERAÇÃO',
              module: 'produto',
              resource_type: 'Product',
              resource_id: produtoEditando?.id_produto_gravity ?? slugResolve,
              action_detail: isNew
                ? `Criação do produto ${formNome}`
                : `Edição do produto ${formNome}`,
            })

            // Refresh em background — sem flash de loading
            carregarDados()
          } catch (err) {
            addNotification({
              type: 'error',
              message: extractCatchError(err, t('admin.produtos-gravity.modal_falha_salvar')),
            })
          }
        }}
        icone={<ShoppingBagOpen weight="duotone" size={24} />}
        titulo={produtoEditando ? `${t('admin.produtos-gravity.modal_editar_prefixo')}${produtoEditando.nome_produto_gravity}` : t('admin.produtos-gravity.modal_novo_titulo')}
        subtitulo={produtoEditando ? t('admin.produtos-gravity.modal_editar_subtitulo') : t('admin.produtos-gravity.modal_novo_subtitulo')}
        tamanho="lg"
        dirty={formDirty}
        podesSalvar={formDirty && requisitosProduto.every(r => r.ok)}
        abas={[
          {
            id: 'dados-basicos',
            rotulo: t('admin.produtos-gravity.aba_dados_basicos'),
            tooltipTitulo: 'IDENTIFICAÇÃO',
            tooltipDescricao: 'Dados principais e categoria do produto no catálogo.',
            conteudo: (
              <BannerRequisitosContexto requisitos={requisitosProduto}>
              <div style={{ padding: '1rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <SecaoFormulario icone={<Tag size={16} weight="duotone" />} titulo={t('admin.produtos-gravity.aba_dados_basicos')} tooltip={t('admin.overview.dados_basicos_tooltip')} />

                <CampoGeralGlobal
                  label={t('admin.produtos-gravity.campo_nome_produto')}
                  obrigatorio
                  tooltipTitulo="IDENTIFICAÇÃO PRINCIPAL"
                  tooltipDescricao="Nome comercial que aparecerá no catálogo e no faturamento"
                >
                  <div className="ws-input-icon-wrap">
                    <ShoppingBagOpen size={16} />
                    <input placeholder={t('admin.produtos-gravity.campo_nome_placeholder')} style={{ width: '100%' }} value={formNome} onChange={e => dirty(() => setFormNome(e.target.value))} />
                  </div>
                </CampoGeralGlobal>

                <CampoGeralGlobal
                  label={t('admin.produtos-gravity.campo_descricao')}
                  obrigatorio
                  tooltipTitulo="RESUMO COMERCIAL"
                  tooltipDescricao="Breve explicação das funcionalidades para exibição rápida no marketplace"
                >
                  <div className="ws-input-icon-wrap">
                    <Tag size={16} />
                    <input placeholder={t('admin.produtos-gravity.campo_descricao_placeholder')} style={{ width: '100%' }} value={formDescricao} onChange={e => dirty(() => setFormDescricao(e.target.value))} />
                  </div>
                </CampoGeralGlobal>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <CampoGeralGlobal
                    label={t('admin.produtos-gravity.campo_data_lancamento')}
                    tooltipTitulo="VIGÊNCIA INICIAL"
                    tooltipDescricao="Define quando o produto estará disponível para comercialização geral"
                  >
                    <CampoCalendarioGlobal
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
                      placeholder={t('admin.produtos-gravity.campo_data_placeholder')}
                    />
                  </CampoGeralGlobal>

                  <CampoGeralGlobal
                    label={t('admin.produtos-gravity.campo_status_label')}
                    tooltipTitulo="DISPONIBILIDADE"
                    tooltipDescricao="Ativo: infraestrutura pronta. Em Breve: em desenvolvimento. Suspenso: pausado. Legado: não comercializado. Inativo: descontinuado."
                  >
                    <div style={{ display: 'flex', gap: '0.5rem', paddingTop: '0.375rem', flexWrap: 'wrap' }}>
                      {([
                        ['ativo',    t('admin.produtos-gravity.campo_status_ativo')],
                        ['em-breve', t('admin.produtos-gravity.campo_status_em_breve')],
                        ['suspenso', 'Suspenso'],
                        ['legado',   'Legado'],
                        ['inativo',  'Inativo'],
                      ] as const).map(([val, label]) => (
                        <TogBtn
                          key={val}
                          val={val}
                          cur={formStatus}
                          set={v => {
                            const novo = v as FormStatus
                            setFormStatus(novo)
                            if (novo !== 'ativo') setFormSlugSelecionado(null)
                          }}
                          label={label}
                        />
                      ))}
                    </div>
                  </CampoGeralGlobal>
                </div>

                {formStatus === 'ativo' && (
                  <CampoGeralGlobal
                    label={t('admin.produtos-gravity.campo_slug')}
                    obrigatorio
                    tooltipTitulo="VÍNCULO TÉCNICO"
                    tooltipDescricao="Selecione o slug do produto que já existe em contracts.json. Apenas produtos com infraestrutura pronta aparecem aqui."
                  >
                    {slugsDisponiveis.length > 0 || formSlugSelecionado ? (
                      <SelectGlobal
                        opcoes={[
                          ...(formSlugSelecionado && !slugsDisponiveis.includes(formSlugSelecionado)
                            ? [{ valor: formSlugSelecionado, rotulo: formSlugSelecionado + ` ${t('admin.produtos-gravity.campo_slug_atual_sufixo')}` }]
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
                        placeholder={t('admin.produtos-gravity.campo_slug_placeholder')}
                        buscavel
                      />
                    ) : (
                      <div style={{ padding: '0.625rem 0.875rem', borderRadius: '0.375rem', background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.2)', color: '#fbbf24', fontSize: '0.8125rem' }}>
                        {t('admin.produtos-gravity.campo_slug_vazio')}
                      </div>
                    )}
                  </CampoGeralGlobal>
                )}

                <BannerRequisitosGlobal />
              </div>
              </BannerRequisitosContexto>
            )
          },
          {
            id: 'setup',
            rotulo: t('admin.produtos-gravity.aba_setup'),
            tooltipTitulo: 'OPERAÇÃO INICIAL',
            tooltipDescricao: 'Taxa de ativação e onboarding (One-time fee).',
            conteudo: (
              <div style={{ padding: '1rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <SecaoFormulario icone={<Wrench size={16} weight="duotone" />} titulo={t('admin.produtos-gravity.aba_setup')} />

                <CampoGeralGlobal
                  label={t('admin.produtos-gravity.campo_tem_setup')}
                  tooltipTitulo="ADMISSÃO DO SERVIÇO"
                  tooltipDescricao="Define se haverá um custo único de ativação ou implantação"
                >
                  <div style={{ display: 'flex', gap: '0.5rem', paddingTop: '0.375rem' }}>
                    <TogBtn val="sim" cur={temSetup} set={v => setTemSetup(v as 'sim' | 'nao')} label={t('admin.produtos-gravity.campo_setup_sim')} />
                    <TogBtn val="nao" cur={temSetup} set={v => setTemSetup(v as 'sim' | 'nao')} label={t('admin.produtos-gravity.campo_setup_nao')} />
                  </div>
                </CampoGeralGlobal>

                {temSetup === 'sim' && (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <CampoGeralGlobal
                      label={t('admin.produtos-gravity.campo_moeda_setup')}
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
                    </CampoGeralGlobal>
                    <CampoGeralGlobal
                      label={t('admin.produtos-gravity.campo_valor_setup')}
                      tooltipTitulo="INVESTIMENTO INICIAL"
                      tooltipDescricao="Montante fixo cobrado apenas no primeiro ciclo"
                    >
                      <div className="ws-input-icon-wrap">
                        <span style={{ fontSize: '0.8125rem', fontWeight: 700, minWidth: '24px', textAlign: 'center', color: 'var(--ws-muted)' }}>{getSimboloMoeda(moedaSetup)}</span>
                        <input placeholder={t('admin.produtos-gravity.campo_valor_placeholder')} style={{ width: '100%' }} inputMode="numeric" value={valorSetup} onChange={e => dirty(() => setValorSetup(mascaraMoeda(e.target.value)))} />
                      </div>
                    </CampoGeralGlobal>
                  </div>
                )}
              </div>
            )
          },
          {
            id: 'valor-produto',
            rotulo: t('admin.produtos-gravity.aba_valor_produto'),
            tooltipTitulo: 'PRECIFICAÇÃO',
            tooltipDescricao: 'Modelo de cobrança, recorrência e camadas de preço.',
            conteudo: (
              <div style={{ padding: '1rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <SecaoFormulario icone={<Sliders size={16} weight="duotone" />} titulo={t('admin.produtos-gravity.aba_valor_produto')} />

                <CampoGeralGlobal
                  label={t('admin.produtos-gravity.campo_tipo_cobranca')}
                  tooltipTitulo="MÉTRICA DE VALOR"
                  tooltipDescricao="Especifica a unidade de medida para o cálculo do faturamento"
                >
                  <SelectGlobal
                    opcoes={TIPOS_COBRANCA_OPCOES}
                    valor={tipoCobranca || null}
                    aoMudarValor={v => dirty(() => setTipoCobranca(String(v ?? '')))}
                    iconeEsquerda={<Sliders size={16} />}
                    placeholder={t('admin.produtos-gravity.campo_tipo_cobranca_placeholder')}
                    buscavel={false}
                  />
                </CampoGeralGlobal>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <CampoGeralGlobal
                    label={t('admin.produtos-gravity.campo_moeda')}
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
                  </CampoGeralGlobal>
                  <CampoGeralGlobal
                    label={t('admin.produtos-gravity.campo_franquia')}
                    tooltipTitulo="VOLUME INCLUÍDO"
                    tooltipDescricao="Quantidade mínima de uso liberada sem custos extras"
                  >
                    <div className="ws-input-icon-wrap">
                      <Tag size={16} />
                      <input type="number" placeholder={t('admin.produtos-gravity.campo_qtd_placeholder')} style={{ width: '100%' }} value={qtdUsuarios} onChange={e => dirty(() => setQtdUsuarios(e.target.value))} />
                    </div>
                  </CampoGeralGlobal>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                  <CampoGeralGlobal
                    label={t('admin.produtos-gravity.campo_valor_unitario')}
                    tooltipTitulo="PREÇO POR UNIDADE"
                    tooltipDescricao="Custo aplicado cada vez que um item adicional é consumido"
                  >
                    <div className="ws-input-icon-wrap">
                      <span style={{ fontSize: '0.8125rem', fontWeight: 700, minWidth: '24px', textAlign: 'center', color: 'var(--ws-muted)' }}>{getSimboloMoeda(moedaProduto)}</span>
                      <input placeholder={t('admin.produtos-gravity.campo_valor_placeholder')} style={{ width: '100%' }} inputMode="numeric" value={valorUnitario} onChange={e => dirty(() => setValorUnitario(mascaraMoeda(e.target.value)))} />
                    </div>
                  </CampoGeralGlobal>
                  <CampoGeralGlobal
                    label={t('admin.produtos-gravity.campo_valor_minimo')}
                    tooltipTitulo="PISO DE COBRANÇA"
                    tooltipDescricao="Menor valor possível a ser faturado em cada ciclo"
                  >
                    <div className="ws-input-icon-wrap">
                      <span style={{ fontSize: '0.8125rem', fontWeight: 700, minWidth: '24px', textAlign: 'center', color: 'var(--ws-muted)' }}>{getSimboloMoeda(moedaProduto)}</span>
                      <input placeholder={t('admin.produtos-gravity.campo_valor_placeholder')} style={{ width: '100%' }} inputMode="numeric" value={valorMinimo} onChange={e => dirty(() => setValorMinimo(mascaraMoeda(e.target.value)))} />
                    </div>
                  </CampoGeralGlobal>
                  <CampoGeralGlobal
                    label={t('admin.produtos-gravity.campo_valor_total_produto')}
                    tooltipTitulo="PREÇO DO PACOTE"
                    tooltipDescricao="Custo fixo do serviço independentemente do volume consumido"
                  >
                    <div className="ws-input-icon-wrap">
                      <span style={{ fontSize: '0.8125rem', fontWeight: 700, minWidth: '24px', textAlign: 'center', color: 'var(--ws-muted)' }}>{getSimboloMoeda(moedaProduto)}</span>
                      <input placeholder={t('admin.produtos-gravity.campo_valor_placeholder')} style={{ width: '100%' }} inputMode="numeric" value={valorTotal} onChange={e => dirty(() => setValorTotal(mascaraMoeda(e.target.value)))} />
                    </div>
                  </CampoGeralGlobal>
                </div>

                <div style={{ marginTop: '0.5rem', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '1.25rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                    <TooltipGlobal titulo={t('admin.produtos-gravity.tiers_tooltip_titulo')} descricao={t('admin.produtos-gravity.tiers_tooltip_desc')}>
                      <p style={{ margin: 0, fontSize: '0.875rem', fontWeight: 600, color: 'var(--ws-text)', display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                        <Stack size={18} weight="duotone" color="var(--color-primary)" /> {t('admin.produtos-gravity.tiers_titulo')}
                      </p>
                    </TooltipGlobal>
                    <button 
                      type="button" 
                      onClick={() => dirty(() => setFaixas([...faixas, {
                        id_faixa_preco_produto_gravity:        `f${Date.now()}`,
                        id_produto_gravity_faixa_preco:        produtoEditando?.id_produto_gravity ?? '',
                        faixa_de_faixa_preco_produto_gravity:  0,
                        faixa_ate_faixa_preco_produto_gravity: undefined,
                        preco_faixa_preco_produto_gravity:     '0,00',
                        moeda_faixa_preco_produto_gravity:     moedaProduto,
                      }]))}
                      style={{ fontSize: '0.8125rem', fontWeight: 600, background: 'rgba(52,211,153,0.08)', color: '#34d399', border: '1px solid rgba(52,211,153,0.25)', padding: '0.375rem 0.875rem', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', transition: 'all 0.15s' }}
                      onMouseEnter={e => { e.currentTarget.style.background = 'rgba(52,211,153,0.15)'; e.currentTarget.style.borderColor = 'rgba(52,211,153,0.4)' }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'rgba(52,211,153,0.08)'; e.currentTarget.style.borderColor = 'rgba(52,211,153,0.25)' }}
                    >
                      <Plus size={14} weight="bold" /> {t('admin.produtos-gravity.tiers_btn_adicionar')}
                    </button>
                  </div>

                  {faixas.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {faixas.map((f, idx) => {
                        const updateFaixa = (changes: Partial<FaixaPreco>) => {
                          dirty(() => setFaixas(faixas.map(fx => fx.id_faixa_preco_produto_gravity === f.id_faixa_preco_produto_gravity ? { ...fx, ...changes } : fx)))
                        }
                        const de = f.faixa_de_faixa_preco_produto_gravity
                        const ate = f.faixa_ate_faixa_preco_produto_gravity ?? undefined

                        return (
                          <div key={f.id_faixa_preco_produto_gravity} style={{ display: 'grid', gridTemplateColumns: 'minmax(120px, 1fr) minmax(120px, 1fr) 1.5fr 44px', gap: '12px', alignItems: 'end', background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.05)' }}>
                            <CampoGeralGlobal label={t('admin.produtos-gravity.tier_de')}>
                              <div className="ws-input-icon-wrap" style={{ display: 'flex', alignItems: 'center', padding: '0 4px' }}>
                                <button type="button" onClick={() => updateFaixa({ faixa_de_faixa_preco_produto_gravity: Math.max(0, de - 1) })} style={{ background: 'transparent', border: 'none', color: 'var(--ws-muted)', cursor: 'pointer', padding: '6px', display: 'flex', alignItems: 'center' }}><Minus size={12} weight="bold" /></button>
                                <input
                                  type="text"
                                  inputMode="numeric"
                                  style={{ width: '100%', border: 'none', background: 'transparent', textAlign: 'center', color: 'var(--ws-text)', fontSize: '0.875rem', fontWeight: 600, outline: 'none' }}
                                  value={de === 0 ? '' : de}
                                  placeholder="0"
                                  onChange={e => {
                                    const val = e.target.value.replace(/\D/g, '')
                                    updateFaixa({ faixa_de_faixa_preco_produto_gravity: val === '' ? 0 : Number(val) })
                                  }}
                                />
                                <button type="button" onClick={() => updateFaixa({ faixa_de_faixa_preco_produto_gravity: de + 1 })} style={{ background: 'transparent', border: 'none', color: 'var(--ws-muted)', cursor: 'pointer', padding: '6px', display: 'flex', alignItems: 'center' }}><Plus size={12} weight="bold" /></button>
                              </div>
                            </CampoGeralGlobal>

                            <CampoGeralGlobal label={t('admin.produtos-gravity.tier_ate')}>
                              <div className="ws-input-icon-wrap" style={{ display: 'flex', alignItems: 'center', padding: '0 4px' }}>
                                <button type="button" onClick={() => updateFaixa({ faixa_ate_faixa_preco_produto_gravity: ate ? Math.max(0, ate - 1) : undefined })} style={{ background: 'transparent', border: 'none', color: 'var(--ws-muted)', cursor: 'pointer', padding: '6px', display: 'flex', alignItems: 'center' }}><Minus size={12} weight="bold" /></button>
                                <input
                                  type="text"
                                  inputMode="numeric"
                                  placeholder="∞"
                                  style={{ width: '100%', border: 'none', background: 'transparent', textAlign: 'center', color: 'var(--ws-text)', fontSize: '0.875rem', fontWeight: 600, outline: 'none' }}
                                  value={ate === undefined ? '' : ate}
                                  onChange={e => {
                                    const val = e.target.value.replace(/\D/g, '')
                                    updateFaixa({ faixa_ate_faixa_preco_produto_gravity: val === '' ? undefined : Number(val) })
                                  }}
                                />
                                <button type="button" onClick={() => updateFaixa({ faixa_ate_faixa_preco_produto_gravity: (ate || 0) + 1 })} style={{ background: 'transparent', border: 'none', color: 'var(--ws-muted)', cursor: 'pointer', padding: '6px', display: 'flex', alignItems: 'center' }}><Plus size={12} weight="bold" /></button>
                              </div>
                            </CampoGeralGlobal>

                            <CampoGeralGlobal label={t('admin.produtos-gravity.tier_valor')}>
                              <div className="ws-input-icon-wrap">
                                <span style={{ fontSize: '0.875rem', fontWeight: 700, minWidth: '24px', textAlign: 'center', color: 'var(--ws-muted)' }}>{getSimboloMoeda(moedaProduto)}</span>
                                <input style={{ width: '100%', border: 'none', background: 'transparent', color: 'var(--ws-text)', fontSize: '0.875rem', fontWeight: 600, outline: 'none' }} value={f.preco_faixa_preco_produto_gravity} onChange={e => updateFaixa({ preco_faixa_preco_produto_gravity: mascaraMoeda(e.target.value) })} />
                              </div>
                            </CampoGeralGlobal>

                            <button
                              type="button"
                              onClick={() => dirty(() => setFaixas(faixas.filter(fx => fx.id_faixa_preco_produto_gravity !== f.id_faixa_preco_produto_gravity)))}
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
                      <p style={{ margin: 0, color: 'var(--ws-muted)', fontSize: '0.8125rem', fontWeight: 500 }}>{t('admin.produtos-gravity.tiers_vazio')}</p>
                      <p style={{ margin: '4px 0 0 0', color: 'rgba(255,255,255,0.2)', fontSize: '0.75rem' }}>{t('admin.produtos-gravity.tiers_vazio_detalhe')}</p>
                    </div>
                  )}
                </div>
              </div>
            )
          },
          {
            id: 'usuarios',
            rotulo: t('admin.produtos-gravity.aba_usuarios'),
            tooltipTitulo: t('admin.produtos-gravity.aba_usuarios_tooltip_titulo'),
            tooltipDescricao: t('admin.produtos-gravity.aba_usuarios_tooltip_desc'),
            conteudo: (
              <div style={{ padding: '1rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <SecaoFormulario icone={<Users size={16} weight="duotone" />} titulo={t('admin.produtos-gravity.aba_usuarios')} />

                <CampoGeralGlobal
                  label={t('admin.produtos-gravity.campo_qtd_usuarios')}
                  tooltipTitulo={t('admin.produtos-gravity.campo_qtd_usuarios_tooltip_titulo')}
                  tooltipDescricao={t('admin.produtos-gravity.campo_qtd_usuarios_tooltip_desc')}
                >
                  <div style={{ display: 'flex', gap: '0.5rem', paddingTop: '0.375rem' }}>
                    <TogBtn val="ilimitada" cur={limiteUsuarios} set={v => setLimiteUsuarios(v as 'ilimitada' | 'limitada')} label={t('admin.produtos-gravity.campo_qtd_ilimitada')} />
                    <TogBtn val="limitada" cur={limiteUsuarios} set={v => setLimiteUsuarios(v as 'ilimitada' | 'limitada')} label={t('admin.produtos-gravity.campo_qtd_limitada')} />
                  </div>
                </CampoGeralGlobal>

                {limiteUsuarios === 'limitada' && (
                  <>
                    <CampoGeralGlobal
                      label={t('admin.produtos-gravity.campo_quantidade')}
                      tooltipTitulo={t('admin.produtos-gravity.campo_quantidade_tooltip_titulo')}
                      tooltipDescricao={t('admin.produtos-gravity.campo_quantidade_tooltip_desc')}
                    >
                      <div className="ws-input-icon-wrap">
                        <Users size={16} />
                        <input type="number" placeholder={t('admin.produtos-gravity.campo_qtd_placeholder')} style={{ width: '100%' }} value={qtdUsuarios} onChange={e => dirty(() => setQtdUsuarios(e.target.value))} />
                      </div>
                    </CampoGeralGlobal>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                      <CampoGeralGlobal
                        label={t('admin.produtos-gravity.campo_moeda')}
                        tooltipTitulo={t('admin.produtos-gravity.campo_moeda_excedente_tooltip_titulo')}
                        tooltipDescricao={t('admin.produtos-gravity.campo_moeda_excedente_tooltip_desc')}
                      >
                        <SelectGlobal
                          opcoes={MOEDAS_OPCOES}
                          valor={moedaUsuario}
                          aoMudarValor={v => dirty(() => setMoedaUsuario(String(v ?? 'BRL')))}
                          iconeEsquerda={<CurrencyCircleDollar size={16} />}
                          buscavel
                        />
                      </CampoGeralGlobal>
                      <CampoGeralGlobal
                        label={t('admin.produtos-gravity.campo_valor_usuario_adicional')}
                        tooltipTitulo={t('admin.produtos-gravity.campo_valor_usuario_adicional_tooltip_titulo')}
                        tooltipDescricao={t('admin.produtos-gravity.campo_valor_usuario_adicional_tooltip_desc')}
                      >
                        <div className="ws-input-icon-wrap">
                          <span style={{ fontSize: '0.8125rem', fontWeight: 700, minWidth: '24px', textAlign: 'center', color: 'var(--ws-muted)' }}>{getSimboloMoeda(moedaUsuario)}</span>
                          <input placeholder={t('admin.produtos-gravity.campo_valor_placeholder')} style={{ width: '100%' }} inputMode="numeric" value={valorUsuarioAdicional} onChange={e => dirty(() => setValorUsuarioAdicional(mascaraMoeda(e.target.value)))} />
                        </div>
                      </CampoGeralGlobal>
                    </div>
                  </>
                )}
              </div>
            )
          },
          {
            id: 'help-desk',
            rotulo: t('admin.produtos-gravity.aba_help_desk'),
            tooltipTitulo: t('admin.produtos-gravity.aba_help_desk_tooltip_titulo'),
            tooltipDescricao: t('admin.produtos-gravity.aba_help_desk_tooltip_desc'),
            conteudo: (
              <div style={{ padding: '1rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <SecaoFormulario icone={<Headset size={16} weight="duotone" />} titulo={t('admin.produtos-gravity.aba_help_desk')} />

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <CampoGeralGlobal
                    label={t('admin.produtos-gravity.campo_horas_mensais')}
                    tooltipTitulo={t('admin.produtos-gravity.campo_horas_mensais_tooltip_titulo')}
                    tooltipDescricao={t('admin.produtos-gravity.campo_horas_mensais_tooltip_desc')}
                  >
                    <div className="ws-input-icon-wrap">
                      <Clock size={16} />
                      <input type="number" placeholder={t('admin.produtos-gravity.campo_qtd_placeholder')} style={{ width: '100%' }} value={totalHoras} onChange={e => dirty(() => setTotalHoras(e.target.value))} />
                    </div>
                  </CampoGeralGlobal>
                  <CampoGeralGlobal
                    label={t('admin.produtos-gravity.campo_moeda_hora_adicional')}
                    tooltipTitulo={t('admin.produtos-gravity.campo_moeda_hora_adicional_tooltip_titulo')}
                    tooltipDescricao={t('admin.produtos-gravity.campo_moeda_hora_adicional_tooltip_desc')}
                  >
                    <SelectGlobal
                      opcoes={MOEDAS_OPCOES}
                      valor={moedaHelpDesk}
                      aoMudarValor={v => dirty(() => setMoedaHelpDesk(String(v ?? 'BRL')))}
                      iconeEsquerda={<CurrencyCircleDollar size={16} />}
                      buscavel
                    />
                  </CampoGeralGlobal>
                </div>
              </div>
            )
          },
          {
            id: 'tokens',
            rotulo: 'Tokens',
            tooltipTitulo: 'GABI — Tokens on-demand',
            tooltipDescricao: 'Quota mensal de tokens IA por organização. Cada chamada GABI consome tokens reais do Gemini.',
            conteudo: (
              <div style={{ padding: '1rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <SecaoFormulario icone={<Coins size={16} weight="duotone" />} titulo="Tokens GABI" tooltip="Controle da quota de tokens IA por organização/mês" />

                {/* Quota Padrão */}
                <CampoGeralGlobal
                  label="Token padrão mensal por organização"
                  tooltipTitulo="QUOTA MENSAL"
                  tooltipDescricao="Tokens disponíveis por mês para cada organização deste produto. Aplica-se a todas as organizações, salvo negociação especial. Tokens não usados expiram no dia 1 de cada mês (sem rollover)."
                >
                  <div className="ws-input-icon-wrap">
                    <Coins size={16} />
                    <input
                      type="number"
                      min={0}
                      step={1000}
                      placeholder="ex: 50000"
                      style={{ width: '100%' }}
                      value={gabiQuotaMensal}
                      onChange={e => dirty(() => setGabiQuotaMensal(e.target.value))}
                    />
                  </div>
                </CampoGeralGlobal>

                {/* Referência rápida */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
                  {[
                    { rotulo: '50k tokens', desc: 'R$ 9,90/mês', valor: '50000' },
                    { rotulo: '200k tokens', desc: 'R$ 29,90/mês', valor: '200000' },
                    { rotulo: '1M tokens', desc: 'R$ 99,90/mês', valor: '1000000' },
                  ].map(opt => (
                    <button
                      key={opt.valor}
                      type="button"
                      onClick={() => dirty(() => setGabiQuotaMensal(opt.valor))}
                      style={{
                        padding: '0.625rem 0.75rem', borderRadius: 8, cursor: 'pointer',
                        border: `1px solid ${gabiQuotaMensal === opt.valor ? 'var(--color-primary)' : 'rgba(255,255,255,0.1)'}`,
                        background: gabiQuotaMensal === opt.valor ? 'rgba(16,185,129,0.1)' : 'rgba(255,255,255,0.04)',
                        textAlign: 'left' as const, display: 'flex', flexDirection: 'column' as const, gap: '0.125rem',
                      }}
                    >
                      <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: gabiQuotaMensal === opt.valor ? 'var(--color-primary)' : 'var(--ws-text)' }}>{opt.rotulo}</span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--ws-muted)' }}>{opt.desc}</span>
                    </button>
                  ))}
                </div>

                {/* Consumo do mês (donut visual) */}
                {produtoEditando && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--ws-muted)' }}>
                      Consumo este mês (todas as organizações)
                    </span>
                    {gabiTokenStats ? (
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
                        {[
                          { label: 'Total consumido', valor: gabiTokenStats.total_consumido.toLocaleString('pt-BR') + ' tk' },
                          { label: 'Organizações ativas', valor: String(gabiTokenStats.total_tenants) },
                          { label: 'Média / organização', valor: gabiTokenStats.media_por_tenant.toLocaleString('pt-BR') + ' tk' },
                        ].map(stat => (
                          <div key={stat.label} style={{ padding: '0.75rem', borderRadius: 8, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                            <span style={{ fontSize: '0.6875rem', color: 'var(--ws-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{stat.label}</span>
                            <span style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--ws-text)' }}>{stat.valor}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={async () => {
                          try {
                            // Usa o JWT Clerk do usuário (mesmo caminho do resto da tela)
                            // — NÃO envia x-internal-key vazio, que era um bug de segurança latente.
                            const token = await getToken()
                            if (!token) return
                            const resp = await fetch(`/api/v1/gabi/admin/produtos/${produtoEditando.id}/tokens/estatisticas`, {
                              headers: { Authorization: `Bearer ${token}` },
                            })
                            if (resp.ok) {
                              const data = (await resp.json()) as {
                                total_consumido: number
                                total_tenants: number
                                media_por_tenant: number
                              }
                              setGabiTokenStats({
                                total_consumido: data.total_consumido,
                                total_tenants: data.total_tenants,
                                media_por_tenant: data.media_por_tenant,
                                percentual: 0,
                              })
                            }
                          } catch { /* silencia — stats é não-crítico */ }
                        }}
                        style={{ padding: '0.5rem 1rem', borderRadius: 8, cursor: 'pointer', fontSize: '0.8125rem', color: 'var(--ws-muted)', border: '1px solid rgba(255,255,255,0.1)', background: 'transparent', width: 'fit-content' }}
                      >
                        Carregar estatísticas do mês
                      </button>
                    )}
                  </div>
                )}

                {/* Regras */}
                <div style={{ padding: '0.875rem 1rem', borderRadius: 8, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  <span style={{ fontSize: '0.6875rem', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--ws-muted)' }}>Regras aplicadas automaticamente</span>
                  {[
                    'Reset automático: dia 1 de cada mês às 00:05 BRT',
                    'Tokens não usados expiram (sem rollover)',
                    'Ao atingir 80%: badge amarelo no cliente',
                    'Ao atingir 90%: notificação para o admin da organização',
                    'Ao atingir 100%: GABI desabilitada → opção de compra adicional',
                  ].map(rule => (
                    <span key={rule} style={{ fontSize: '0.8125rem', color: 'var(--ws-text)', display: 'flex', gap: '0.5rem' }}>
                      <span style={{ color: 'var(--color-primary)', flexShrink: 0 }}>✓</span>
                      {rule}
                    </span>
                  ))}
                </div>
              </div>
            )
          },
          {
            id: 'negociacao',
            rotulo: t('admin.produtos-gravity.aba_negociacao'),
            tooltipTitulo: t('admin.produtos-gravity.aba_negociacao_tooltip_titulo'),
            tooltipDescricao: t('admin.produtos-gravity.aba_negociacao_tooltip_desc'),
            conteudo: (
              <div style={{ padding: '1rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <SecaoFormulario icone={<Handshake size={16} weight="duotone" />} titulo={t('admin.produtos-gravity.negociacao_titulo')} tooltip={t('admin.produtos-gravity.negociacao_tooltip')} />

                <CampoGeralGlobal
                  label={t('admin.produtos-gravity.campo_vincular_org')}
                  tooltipTitulo={t('admin.produtos-gravity.campo_vincular_org_tooltip_titulo')}
                  tooltipDescricao={t('admin.produtos-gravity.campo_vincular_org_tooltip_desc')}
                >
                  <div style={{ display: 'flex', gap: '0.5rem', paddingTop: '0.375rem' }}>
                    <TogBtn val="nao" cur={vincularOrg} set={v => dirty(() => setVincularOrg(v as 'sim' | 'nao'))} label={t('admin.produtos-gravity.opcao_nao')} />
                    <TogBtn val="sim" cur={vincularOrg} set={v => dirty(() => setVincularOrg(v as 'sim' | 'nao'))} label={t('admin.produtos-gravity.opcao_sim')} />
                  </div>
                </CampoGeralGlobal>

                {vincularOrg === 'sim' && (
                  <>
                    <CampoGeralGlobal label={t('admin.produtos-gravity.campo_empresa_org')} obrigatorio>
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
                        placeholder={t('admin.produtos-gravity.campo_empresa_org_placeholder')}
                        buscavel
                      />
                    </CampoGeralGlobal>


                    <CampoGeralGlobal label={t('admin.produtos-gravity.campo_vigencia')}>
                      <div style={{ display: 'flex', gap: '0.5rem', paddingTop: '0.375rem', marginBottom: '0.5rem' }}>
                        <TogBtn val="nao" cur={vigenciaIlimitada} set={v => dirty(() => setVigenciaIlimitada(v as 'sim' | 'nao'))} label={t('admin.produtos-gravity.vigencia_com_data')} />
                        <TogBtn val="sim" cur={vigenciaIlimitada} set={v => dirty(() => { setVigenciaIlimitada(v as 'sim' | 'nao'); setVigenciaPeriodo({ inicio: null, fim: null }) })} label={t('admin.produtos-gravity.vigencia_ilimitada')} />
                      </div>
                      {vigenciaIlimitada === 'nao' && (
                        <CampoCalendarioGlobal
                          placeholder={t('admin.produtos-gravity.vigencia_placeholder')}
                          valor={vigenciaPeriodo}
                          aoMudarValor={v => dirty(() => setVigenciaPeriodo(v))}
                        />
                      )}
                      {vigenciaIlimitada === 'sim' && (
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.375rem 0.875rem', borderRadius: '9999px', background: 'rgba(129,140,248,0.08)', border: '1px solid rgba(129,140,248,0.2)', color: '#818cf8', fontSize: '0.8125rem', fontWeight: 600 }}>
                          <Infinity size={15} weight="bold" />
                          {t('admin.produtos-gravity.vigencia_sem_expiracao')}
                        </div>
                      )}
                    </CampoGeralGlobal>

                    {orgSelecionada && (
                      <div style={{ padding: '0.75rem 1rem', borderRadius: 8, background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                        <span style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#10b981' }}>{t('admin.produtos-gravity.negociacao_preview_titulo')}</span>
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
          const nome = produtoParaExcluir.nome_produto_gravity
          const id = produtoParaExcluir.id_produto_gravity
          // Soft-delete por padrão — preserva negociações especiais
          await catalogApiService.deleteProduto(id)
          setProdutoParaExcluir(null)
          addNotification({ type: 'success', message: t('admin.produtos-gravity.msg_produto_excluido', { nome }) })

          // Auditoria de exclusão (não era registrada antes)
          logEvent({
            action: 'EXCLUSÃO',
            module: 'produto',
            resource_type: 'Product',
            resource_id: id,
            action_detail: `Exclusão do produto ${nome}`,
          })

          carregarDados()
        } catch (err) {
          addNotification({
            type: 'error',
            message: t('admin.produtos-gravity.msg_erro_excluir') + extractCatchError(err, t('admin.produtos-gravity.msg_desconhecido')),
          })
        }
      }}
      titulo={t('admin.produtos-gravity.excluir_titulo')}
      descricao={<>{t('admin.produtos-gravity.excluir_descricao_pre')} <strong>{produtoParaExcluir?.nome_produto_gravity}</strong> {t('admin.produtos-gravity.excluir_descricao_pos')}</>}
      nomeItem={t('admin.produtos-gravity.excluir_aviso')}
    />
    </>
  )
}
