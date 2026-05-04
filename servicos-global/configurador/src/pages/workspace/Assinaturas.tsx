import React, { useState, useEffect } from 'react'
import { useAuth } from '@clerk/clerk-react'
import { useTranslation } from 'react-i18next'
import { CreditCard, FileXls, FileCsv, FileText, FilePdf, Code, PencilSimple, Trash, PauseCircle, PlayCircle, Package, CurrencyDollar, WarningCircle, TreeStructure } from '@phosphor-icons/react'
import { BotaoGlobal } from '@nucleo/botao-global'
import { CardEstatisticaGlobal } from '@nucleo/card-global'
import { TabelaGlobal, type TabelaGlobalColuna, type TabelaGlobalAcao, type TabelaExportAcao } from '@nucleo/tabela-global'
import { TooltipGlobal } from '@nucleo/tooltip-global'
import { CabecalhoGlobal } from '@nucleo/cabecalho-global'
import { PaginaGlobal } from '@nucleo/pagina-global'
import { ModalExclusao } from './ModalConfirmarExclusao'
import { ModalEditarAssinatura } from './ModalEditarAssinatura'
import { exportarExcel, exportarCSV, exportarTXT, exportarXML, exportarJSON, exportarPDF, type ColunasExport } from '../../services/export-service'
import { catalogService } from '../../services/catalog-service'
import type { FaixaPreco } from '../../types/entidades'
import { getSimboloMoeda } from '../../utils/formatters'
import { getAcoesExportacaoPadrao } from '../../utils/export-helper'
import { useShellStore } from '@gravity/shell'


type ProdutoStatus = 'Ativo' | 'Trial' | 'Suspenso'
type BillingType = 'SaaS' | 'Uso' | 'Setup'

export interface Produto {
  id: string
  nome: string
  status: ProdutoStatus
  billing: BillingType
  valor: string
  renovacao: string
  workspacesHabilitados: string[]
  workspacesVinculados?: string[]
}

const billingColor: Record<BillingType, string> = {
  SaaS:  '#818cf8',
  Uso:   '#a78bfa',
  Setup: '#fb923c',
}

// ─── Auth helper ────────────────────────────────────────────────────────────
async function getAuthHeaders(): Promise<Record<string, string>> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  try {
    const session = await (window as any).Clerk?.session
    const token = session ? await session.getToken() : null
    if (token) headers['Authorization'] = `Bearer ${token}`
  } catch { /* sem token */ }
  return headers
}

export function Assinaturas() {
  const _auth = useAuth() // mantido para contexto Clerk
  const { t } = useTranslation()
  const addNotification = useShellStore((s) => s.addNotification)

  const upsellProducts = [
    { id: 'help', nome: t('workspace.subscriptions.upsell.helpdesk'), desc: t('workspace.subscriptions.upsell.helpdesk_desc'),    valor: 'R$ 249/mês', billing: 'SaaS' as BillingType },
    { id: 'nfe',  nome: t('workspace.subscriptions.upsell.nfe'),  desc: t('workspace.subscriptions.upsell.nfe_desc'),     valor: 'R$ 159/mês', billing: 'Uso'  as BillingType },
    { id: 'bi',   nome: t('workspace.subscriptions.upsell.bi'), desc: t('workspace.subscriptions.upsell.bi_desc'),    valor: 'R$ 399/mês', billing: 'SaaS' as BillingType },
  ]
  const [produtos, setProdutos]         = useState<Produto[]>([])
  const [catalogProdutos, setCatalogProdutos] = useState<any[]>([])
  const [workspaces, setWorkspaces] = useState<{ nome: string; status: string; id: string }[]>([])
  const [carregando, setCarregando] = useState(true)
  const [produtoParaExcluir, setProdutoParaExcluir] = useState<Produto | null>(null)
  const [produtoEditando, setProdutoEditando] = useState<Produto | null>(null)
  const [vinculoParaExcluir, setVinculoParaExcluir] = useState<{produto: Produto, workspaceNome: string} | null>(null)

  useEffect(() => {
    async function loadData() {
      try {
        setCarregando(true)
        const headers = await getAuthHeaders()

        const [allProducts, subRes, workspacesRes] = await Promise.all([
          catalogService.getProdutos(),
          fetch('/api/v1/assinaturas', { headers }).catch(() => null),
          fetch('/api/v1/me/workspaces', { headers }).catch(() => null),
        ])

        // Carregar workspaces reais
        if (workspacesRes && workspacesRes.ok) {
          const { workspaces } = await workspacesRes.json()
          setWorkspaces(workspaces.map((w: Record<string, unknown>) => ({
            id: w.id_workspace,
            nome: w.nome_workspace ?? '',
            status: w.status_workspace === 'ATIVO' ? 'Ativa' : 'Suspensa',
          })))
        }

        const subscribedSlugs = new Set<string>()
        const subscribedProducts: Produto[] = []
        if (subRes && subRes.ok) {
          const subData = await subRes.json()
          subData.products.forEach((p: Record<string, unknown>) => {
            if (p.is_active) subscribedSlugs.add(p.product_key)
            subscribedProducts.push({
              id: p.product_key ?? p.id,
              nome: p.product_name ?? p.product_key ?? '',
              status: p.is_active ? 'Ativo' : 'Suspenso',
              billing: (p.billing_type === 'USAGE' ? 'Uso' : p.billing_type === 'SETUP' ? 'Setup' : 'SaaS') as BillingType,
              valor: p.price_display ?? '',
              renovacao: p.renewal_date ? new Date(p.renewal_date).toLocaleDateString('pt-BR') : '',
              workspacesHabilitados: p.enabled_companies ?? [],
              workspacesVinculados: p.linked_companies ?? [],
            })
          })
          if (subscribedProducts.length > 0) {
            setProdutos(subscribedProducts)
          }
        }

        // Show only catalog products that are NOT subscribed
        setCatalogProdutos(allProducts.filter((p: Record<string, unknown>) => !subscribedSlugs.has(p.slug_produto_gravity as string)))
      } catch (err) {
        addNotification({ type: 'error', message: err instanceof Error ? err.message : 'Falha ao carregar assinaturas.' })
        // fallback: show all catalog products
        catalogService.getProdutos().then(setCatalogProdutos).catch(() => {})
      } finally {
        setCarregando(false)
      }
    }
    loadData()
  }, [])

  const totalAtivos = produtos.filter(p => p.status === 'Ativo' || p.status === 'Trial').length
  const totalSuspensos = produtos.filter(p => p.status === 'Suspenso').length
  
  const custoSaaSAtivos = produtos
    .filter(p => (p.status === 'Ativo' || p.status === 'Trial') && p.billing === 'SaaS')
    .reduce((acc, p) => {
      const vStr = p.valor.replace('R$ ', '').replace('/mês', '').replace('.', '').replace(',', '.')
      const v = parseFloat(vStr)
      return acc + (isNaN(v) ? 0 : v)
    }, 0)

  async function handleSuspend(p: Produto) {
    const isActivating = p.status === 'Suspenso'
    try {
      const headers = await getAuthHeaders()
      if (isActivating) {
        // Reativar: subscribe novamente
        const res = await fetch('/api/v1/assinaturas/assinar-produto', {
          method: 'POST', headers,
          body: JSON.stringify({ product_key: p.id }),
        })
        if (!res.ok) throw new Error('Falha ao reativar')
      } else {
        // Suspender: deactivate via DELETE (sets is_active=false)
        const res = await fetch(`/api/v1/assinaturas/${p.id}`, {
          method: 'DELETE', headers,
        })
        if (!res.ok) throw new Error('Falha ao suspender')
      }
      setProdutos(prev => prev.map(x => x.id === p.id
        ? { ...x, status: isActivating ? 'Ativo' : 'Suspenso' }
        : x
      ))
      addNotification({
        type: isActivating ? 'success' : 'warning',
        message: `Produto "${p.nome}" ${isActivating ? 'reativado' : 'suspenso'} com sucesso.`,
      })
    } catch {
      addNotification({ type: 'error', message: `Erro ao ${isActivating ? 'reativar' : 'suspender'} produto.` })
    }
  }

  function handleDelete(p: Produto) {
    setProdutoParaExcluir(p)
  }

  async function confirmarExclusao() {
    if (!produtoParaExcluir) return
    const nome = produtoParaExcluir.nome
    const key = produtoParaExcluir.id
    try {
      const headers = await getAuthHeaders()
      const res = await fetch(`/api/v1/assinaturas/${key}`, {
        method: 'DELETE', headers,
      })
      if (!res.ok) throw new Error('Falha ao cancelar')
      setProdutos(prev => prev.filter(x => x.id !== key))
      // Devolver ao catálogo de disponíveis
      const catProd = catalogProdutos.find(c => c.slug === key)
      if (!catProd) {
        // Recarregar catálogo para mostrar produto devolvido
        catalogService.getProdutos().then(all => {
          const subscribedIds = new Set(produtos.filter(p => p.id !== key).map(p => p.id))
          setCatalogProdutos(all.filter((p: Record<string, unknown>) => !subscribedIds.has(p.slug)))
        }).catch(() => {})
      }
      addNotification({ type: 'success', message: `Assinatura de "${nome}" cancelada com sucesso.` })
    } catch {
      addNotification({ type: 'error', message: `Erro ao cancelar assinatura de "${nome}".` })
    }
    setProdutoParaExcluir(null)
  }

  async function handleAssinar(slug: string, nome: string) {
    try {
      const headers = await getAuthHeaders()
      const res = await fetch('/api/v1/assinaturas/assinar-produto', {
        method: 'POST', headers,
        body: JSON.stringify({ product_key: slug }),
      })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body?.error?.message ?? 'Falha ao assinar')
      }
      // Adicionar à lista de contratados
      const novoProduto: Produto = {
        id: slug,
        nome,
        status: 'Ativo',
        billing: 'SaaS',
        valor: '',
        renovacao: '',
        workspacesHabilitados: [],
      }
      setProdutos(prev => [...prev, novoProduto])
      // Remover do catálogo disponível
      setCatalogProdutos(prev => prev.filter(p => p.slug !== slug))
      addNotification({ type: 'success', message: `Produto "${nome}" ativado com sucesso!` })
    } catch (err) {
      addNotification({ type: 'error', message: err instanceof Error ? err.message : 'Erro ao assinar produto.' })
    }
  }

  function confirmarExclusaoVinculo() {
    if (!vinculoParaExcluir) return
    const { produto, workspaceNome } = vinculoParaExcluir
    const vinculadosAtuais = produto.workspacesVinculados || TODOS_WORKSPACES_MAPP.map(w => w.nome)
    const novoVinculos = vinculadosAtuais.filter(n => n !== workspaceNome)
    const novoHabilitados = produto.workspacesHabilitados.filter(n => n !== workspaceNome)
    setProdutos(prev => prev.map(p => p.id === produto.id ? { ...p, workspacesVinculados: novoVinculos, workspacesHabilitados: novoHabilitados } : p))
    setVinculoParaExcluir(null)
    addNotification({ type: 'success', message: `Workspace "${workspaceNome}" removido da assinatura.` })
  }

  // ── Colunas da TabelaGlobal ───────────────────────────────────────────────────
  const COLUNAS: TabelaGlobalColuna<Produto>[] = [
    {
      key: 'nome', label: t('workspace.subscriptions.tabela.produto'), tipo: 'texto',
      tooltipTitulo: 'Produto Contratado',
      tooltipDescricao: 'Nome do módulo ou serviço ativo na plataforma.',
      render: (v) => (
        <span style={{ fontWeight: 600 }}>{v}</span>
      )
    },
    {
      key: 'billing', label: t('workspace.subscriptions.tabela.cobranca'), tipo: 'texto',
      tooltipTitulo: 'Modelo de Cobrança',
      tooltipDescricao: t('workspace.subscriptions.tabela.cobranca_desc'),
      render: (v) => {
        const cor = billingColor[v as BillingType] ?? '#94a3b8'
        return (
          <span style={{
            display: 'inline-flex', alignItems: 'center',
            padding: '0.175rem 0.5rem', borderRadius: '9999px',
            fontSize: '0.6875rem', fontWeight: 700,
            background: `${cor}18`, color: cor, border: `1px solid ${cor}30`,
            textTransform: 'uppercase', letterSpacing: '0.04em',
          }}>
            {v}
          </span>
        )
      }
    },
    {
      key: 'valor', label: t('workspace.subscriptions.tabela.valor'), tipo: 'texto',
      tooltipTitulo: 'Valor do Produto',
      tooltipDescricao: 'Preço cobrado por ciclo ou unidade de consumo.',
      render: (v) => <span style={{ fontFamily: 'monospace', color: 'var(--ws-muted)', fontSize: '0.875rem' }}>{v}</span>
    },
    {
      key: 'renovacao', label: t('workspace.subscriptions.tabela.renovacao'), tipo: 'texto',
      tooltipTitulo: 'Data de Renovação',
      tooltipDescricao: t('workspace.subscriptions.tabela.renovacao_desc'),
      render: (v) => <span style={{ color: 'var(--ws-muted)' }}>{v}</span>
    },
    {
      key: 'workspacesHabilitados', label: t('workspace.subscriptions.tabela.workspaces_habilitados'), tipo: 'texto',
      tooltipTitulo: 'Distribuição por Workspace',
      tooltipDescricao: t('workspace.subscriptions.tabela.workspaces_desc'),
      render: (v) => {
        const list = v as string[]
        if (!list || list.length === 0) return <span style={{ color: 'var(--ws-muted)', fontSize: '0.75rem' }}>{t('workspace.subscriptions.vazio_workspaces')}</span>
        
        const show = list.slice(0, 2)
        const rest = list.length - show.length

        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexWrap: 'wrap' }}>
            {show.map((name, i) => (
              <span key={i} style={{ 
                fontSize: '0.625rem', fontWeight: 700,
                background: 'rgba(52,211,153,0.08)',
                color: '#34d399',
                padding: '0.125rem 0.4rem', borderRadius: '4px', border: '1px solid rgba(52,211,153,0.15)'
              }}>
                {name}
              </span>
            ))}
            {rest > 0 && <span style={{ fontSize: '0.625rem', color: 'var(--ws-muted)', fontWeight: 700 }}>+{rest} (clique para ver)</span>}
          </div>
        )
      }
    },
    {
      key: 'status', label: t('workspace.subscriptions.tabela_status'), tipo: 'texto',
      tooltipTitulo: 'Status do Produto',
      tooltipDescricao: 'Indica se o módulo está operacional, em teste ou suspenso.',
      render: (v) => {
        const cfg: Record<string, { bg: string; color: string; border: string }> = {
          Ativo:    { bg: 'rgba(52,211,153,0.12)', color: '#34d399', border: 'rgba(52,211,153,0.2)' },
          Trial:    { bg: 'rgba(251,191,36,0.12)',  color: '#fbbf24', border: 'rgba(251,191,36,0.2)'  },
          Suspenso: { bg: 'rgba(248,113,113,0.12)', color: '#f87171', border: 'rgba(248,113,113,0.2)' },
        }
        const c = cfg[v as string] ?? cfg['Suspenso']
        return (
          <span className={v === 'Trial' ? 'ux-pulse-trial' : undefined} style={{ display: 'inline-flex', padding: '0.2rem 0.625rem', borderRadius: '9999px', fontSize: '0.6875rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', background: c.bg, color: c.color, border: `1px solid ${c.border}` }}>
            {v}
          </span>
        )
      }
    }
  ]

  // ── Ações de linha ────────────────────────────────────────────────────────────
  const ACOES: TabelaGlobalAcao<Produto>[] = [
    {
      id: 'suspend',
      icone: <PauseCircle size={16} weight="bold" />,
      tooltip: 'Suspender / Reativar',
      onClick: handleSuspend,
      renderCustom: (item) => (
        <TooltipGlobal descricao={item.status === 'Suspenso' ? 'Reativar' : 'Suspender'}>
          <button
            type="button"
            onClick={() => handleSuspend(item)}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 28, height: 28, borderRadius: '50%', background: 'transparent', border: '1px solid transparent', color: '#64748b', cursor: 'pointer', transition: 'all 0.15s', flexShrink: 0 }}
            onMouseEnter={ev => {
              ev.currentTarget.style.background = item.status === 'Suspenso' ? 'rgba(52,211,153,0.12)' : 'rgba(251,191,36,0.12)'
              ev.currentTarget.style.borderColor = item.status === 'Suspenso' ? 'rgba(52,211,153,0.3)' : 'rgba(251,191,36,0.3)'
              ev.currentTarget.style.color = item.status === 'Suspenso' ? '#34d399' : '#fbbf24'
            }}
            onMouseLeave={ev => { ev.currentTarget.style.background = 'transparent'; ev.currentTarget.style.borderColor = 'transparent'; ev.currentTarget.style.color = '#64748b' }}
          >
            {item.status === 'Suspenso' ? <PlayCircle size={16} weight="bold" /> : <PauseCircle size={16} weight="bold" />}
          </button>
        </TooltipGlobal>
      )
    },
    {
      id: 'edit',
      icone: <PencilSimple size={15} weight="bold" />,
      tooltip: 'Editar assinatura',
      onClick: (p) => setProdutoEditando(p),
    },
    {
      id: 'cancel',
      icone: <Trash size={15} weight="bold" />,
      tooltip: 'Cancelar assinatura',
      onClick: handleDelete,
      onRenderStyle: () => ({ background: 'rgba(248,113,113,0.12)', borderColor: 'rgba(248,113,113,0.3)', color: '#f87171' })
    }
  ]

  // ── Exportação ────────────────────────────────────────────────────────────────
  const COLUNAS_EXPORT: ColunasExport[] = [
    { header: 'Produto',   key: 'nome'     },
    { header: 'Cobrança',  key: 'billing'  },
    { header: 'Valor',     key: 'valor'    },
    { header: 'Renovação', key: 'renovacao'},
    { header: 'Status',    key: 'status'   },
  ]
  const OPCOES_EXPORT = { nomeArquivo: 'assinaturas', titulo: 'Assinaturas & Planos' }
  // Workspaces carregados da API (substituiu TODOS_WORKSPACES_MAPP hardcoded)
  const TODOS_WORKSPACES_MAPP = workspaces

  const ACOES_EXPORT: TabelaExportAcao<Produto>[] = [
    { label: 'Excel (.xlsx)', icone: <FileXls size={14} weight="bold" />, onClick: (d) => void exportarExcel(d as any, COLUNAS_EXPORT, OPCOES_EXPORT) },
    { label: 'CSV',           icone: <FileCsv size={14} weight="bold" />, onClick: (d) => exportarCSV(d as any, COLUNAS_EXPORT, OPCOES_EXPORT) },
    { label: 'TXT',           icone: <FileText size={14} weight="bold" />, onClick: (d) => exportarTXT(d as any, COLUNAS_EXPORT, OPCOES_EXPORT) },
    { label: 'XML',           icone: <Code size={14} weight="bold" />,     onClick: (d) => exportarXML(d as any, COLUNAS_EXPORT, OPCOES_EXPORT) },
    { label: 'PDF',           icone: <FilePdf size={14} weight="bold" />, onClick: (d) => exportarPDF(d as any, COLUNAS_EXPORT, OPCOES_EXPORT) },
    { label: 'JSON',          icone: <Code size={14} weight="bold" />,     onClick: (d) => exportarJSON(d as any, COLUNAS_EXPORT, OPCOES_EXPORT) },
  ]

  // ── Render ────────────────────────────────────────────────────────────────────
  return (
    <>
    <style>
      {`
        @keyframes ripplePulse {
          0% { box-shadow: 0 0 0 0 rgba(129, 140, 248, 0.4), 0 4px 12px rgba(0, 0, 0, 0.1); }
          70% { box-shadow: 0 0 0 8px rgba(129, 140, 248, 0), 0 4px 12px rgba(0, 0, 0, 0.1); }
          100% { box-shadow: 0 0 0 0 rgba(129, 140, 248, 0), 0 4px 12px rgba(0, 0, 0, 0.1); }
        }
        .ux-pulse-card {
          background: linear-gradient(145deg, var(--ws-surface) 0%, rgba(129, 140, 248, 0.05) 100%) !important;
          border: 1px solid rgba(129, 140, 248, 0.35) !important;
          animation: ripplePulse 2.5s infinite;
          transition: transform 0.2s ease, background 0.2s ease, border-color 0.2s ease;
          position: relative;
        }
        .ux-pulse-card:hover {
          transform: translateY(-2px);
          border-color: rgba(129, 140, 248, 0.7) !important;
          background: linear-gradient(145deg, var(--ws-surface) 0%, rgba(129, 140, 248, 0.1) 100%) !important;
          animation: none;
          box-shadow: 0 8px 24px rgba(129, 140, 248, 0.2), 0 4px 12px rgba(0, 0, 0, 0.1);
        }
        @keyframes ripplePulseTrial {
          0% { box-shadow: 0 0 0 0 rgba(251, 191, 36, 0.5); }
          70% { box-shadow: 0 0 0 6px rgba(251, 191, 36, 0); }
          100% { box-shadow: 0 0 0 0 rgba(251, 191, 36, 0); }
        }
        .ux-pulse-trial {
          animation: ripplePulseTrial 2s infinite !important;
        }
      `}
    </style>
    <PaginaGlobal
      className="ws-fade-up"
      layout="lista"
      cabecalho={
        <CabecalhoGlobal
          icone={<CreditCard weight="duotone" size={22} color="#818cf8" />}
          titulo={t('workspace.subscriptions.titulo')}
          subtitulo={t('workspace.subscriptions.subtitulo')}
        />
      }
      stats={
        <>
          <CardEstatisticaGlobal
            titulo={t('workspace.subscriptions.produtos_ativos')}
            icone={<Package weight="duotone" size={16} />}
            valor={<span style={{ fontSize: '1.5rem' }}>{totalAtivos}</span>}
            subtexto={produtos.length > 0 ? `${produtos.length} no total` : 'Sem produtos'}
            tooltip={
              <>
                <p className="cg-tooltip__title">STATUS DOS PRODUTOS</p>
                <div className="cg-tooltip__row">
                  <span>Ativos</span>
                  <strong>{produtos.filter(p => p.status === 'Ativo').length}</strong>
                </div>
                <div className="cg-tooltip__row">
                  <span>Em Trial</span>
                  <strong>{produtos.filter(p => p.status === 'Trial').length}</strong>
                </div>
              </>
            }
          />
          <CardEstatisticaGlobal
            titulo={t('workspace.subscriptions.custo_fixo')}
            icone={<CurrencyDollar weight="duotone" size={16} />}
            valor={<span style={{ fontSize: '1.5rem' }}>R$ {custoSaaSAtivos.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>}
            subtexto="Mensalidade SaaS"
            tooltip={
              <>
                <p className="cg-tooltip__title">COMPOSIÇÃO DO CUSTO</p>
                <div className="cg-tooltip__row">
                  <span>SaaS (Ativo/Trial)</span>
                  <strong>R$ {custoSaaSAtivos.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong>
                </div>
                <div className="cg-tooltip__row">
                  <span>Custo por uso</span>
                  <strong>Variável</strong>
                </div>
              </>
            }
          />
          <CardEstatisticaGlobal
            titulo={t('workspace.subscriptions.acessos_suspensos')}
            icone={<WarningCircle weight="duotone" size={16} />}
            valor={<span style={{ fontSize: '1.75rem' }}>{totalSuspensos}</span>}
            subtexto={totalSuspensos === 0 ? 'Tudo operacional' : 'Requer atenção'}
            variante={totalSuspensos > 0 ? 'perigo' : 'padrao'}
            tooltip={
              <>
                <p className="cg-tooltip__title">ATENÇÃO</p>
                <div className="cg-tooltip__row">
                  <span>Produtos suspensos</span>
                  <strong>{totalSuspensos}</strong>
                </div>
              </>
            }
          />
        </>
      }
    >
      {/* Produtos contratados — TabelaGlobal */}
      <p className="ws-section-title" style={{ marginBottom: '0.875rem', marginTop: '0.25rem' }}>
        {t('workspace.subscriptions.secao_contratados')}
      </p>
      <div style={{ marginBottom: '2rem' }}>
        {carregando ? (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '3rem', color: 'var(--ws-muted)', fontSize: '0.875rem' }}>
            Carregando assinaturas...
          </div>
        ) : (
        <TabelaGlobal<Produto>
          id="workspace-subscriptions"
          dados={produtos}
          colunas={COLUNAS}
          acoes={ACOES}
          acoesExportacao={getAcoesExportacaoPadrao(COLUNAS, 'dados_tabela', 'Exportação de Dados')}
          mensagemVazio="Nenhum produto encontrado na busca."
          mensagemSemFiltro="Nenhum produto contratado."
          tooltipBusca="Localizar assinatura por nome do produto ou status operacional"
          tooltipExpandir="Ver auditoria de consumo e workspaces vinculados a este produto"
          renderExpandido={(produto) => (
            <div style={{ padding: '0 1.25rem 1.25rem 1.25rem', background: 'rgba(0,0,0,0.15)' }}>
              <div style={{ padding: '1rem', borderTop: '1px solid rgba(129,140,248,0.1)', display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--ws-muted)', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                <TreeStructure size={14} /> Auditoria de Consumo por Workspace
              </div>
              <div style={{ border: '1px solid rgba(129,140,248,0.08)', borderRadius: '12px', overflow: 'hidden' }}>
                <TabelaGlobal<{ nome: string; status: string; id: string }>
                  id={`workspace-subscription-workspaces-${produto.id}`}
                  dados={TODOS_WORKSPACES_MAPP
                    .filter(ws => produto.workspacesVinculados ? produto.workspacesVinculados.includes(ws.nome) : true)
                    .map(ws => ({
                      ...ws,
                      status: produto.workspacesHabilitados.includes(ws.nome) ? 'Ativo' : 'Inativo'
                    }))}
                  tooltipBusca="Filtrar workspaces habilitados nesta assinatura"
                  colunas={[
                    {
                      key: 'nome',
                      label: t('workspace.subscriptions.subtabela_nome_workspace'),
                      tipo: 'texto', 
                      render: (v) => {
                        const nome = v as string;
                        const subdominio = nome.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
                        return (
                          <a 
                            href={`http://localhost:8010/workspace/${subdominio}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ fontWeight: 600, color: 'var(--ws-text)', textDecoration: 'none', transition: 'color 0.15s', cursor: 'pointer' }}
                            onMouseEnter={e => { e.currentTarget.style.color = '#818cf8'; e.currentTarget.style.textDecoration = 'underline'; }}
                            onMouseLeave={e => { e.currentTarget.style.color = 'var(--ws-text)'; e.currentTarget.style.textDecoration = 'none'; }}
                            onClick={ev => ev.stopPropagation()}
                          >
                            {nome}
                          </a>
                        )
                      }
                    },
                    {
                      key: 'status', label: t('workspace.subscriptions.subtabela_status_servico'), tipo: 'texto',
                      render: (v) => {
                        const ativo = v === 'Ativo'
                        const suspenso = produto.status === 'Suspenso'
                        return (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ 
                              display: 'inline-flex', padding: '0.15rem 0.5rem', borderRadius: '4px', 
                              fontSize: '0.625rem', fontWeight: 700, textTransform: 'uppercase',
                              background: ativo ? 'rgba(52,211,153,0.1)' : 'rgba(255,255,255,0.05)',
                              color: ativo ? '#34d399' : 'var(--ws-muted)',
                              border: ativo ? '1px solid rgba(52,211,153,0.2)' : '1px solid rgba(255,255,255,0.1)'
                            }}>
                              {ativo ? 'HABILITADO' : 'BLOQUEADO'}
                            </span>
                            {ativo && suspenso && (
                              <span style={{ 
                                display: 'inline-flex', padding: '0.15rem 0.5rem', borderRadius: '4px', 
                                fontSize: '0.625rem', fontWeight: 700, textTransform: 'uppercase',
                                background: 'rgba(248,113,113,0.1)',
                                color: '#f87171',
                                border: '1px solid rgba(248,113,113,0.2)'
                              }}>
                                SUSPENSO
                              </span>
                            )}
                          </div>
                        )
                      }
                    },
                    {
                      key: 'id', label: t('workspace.subscriptions.subtabela_acoes'), tipo: 'texto', align: 'right',
                      render: (_v, wsItem) => {
                        const ativo = produto.workspacesHabilitados.includes(wsItem.nome)
                        return (
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px' }}>
                            <TooltipGlobal descricao={ativo ? 'Suspender acesso neste workspace' : 'Reativar acesso neste workspace'}>
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation()
                                  console.log('[DEBUG] Toggle workspace:', wsItem.nome, 'for product:', produto.nome)
                                  const novoLote = ativo 
                                    ? produto.workspacesHabilitados.filter(n => n !== wsItem.nome)
                                    : [...produto.workspacesHabilitados, wsItem.nome]
                                  
                                  setProdutos(prev => prev.map(p => p.id === produto.id ? { ...p, workspacesHabilitados: novoLote } : p))
                                }}
                                style={{ 
                                  background: 'transparent', border: 'none', cursor: 'pointer', color: ativo ? '#34d399' : 'var(--ws-muted)',
                                  display: 'flex', alignItems: 'center', justifyContent: 'center', width: 24, height: 24, borderRadius: '4px', transition: 'all 0.2s'
                                }}
                                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(129,140,248,0.1)' }}
                                onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
                              >
                                {ativo ? <PauseCircle size={16} weight="bold" /> : <PlayCircle size={16} weight="bold" />}
                              </button>
                            </TooltipGlobal>

                            <TooltipGlobal descricao="Remover vínculo deste workspace">
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation()
                                  setVinculoParaExcluir({ produto, workspaceNome: wsItem.nome })
                                }}
                                style={{ 
                                  background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--ws-muted)',
                                  display: 'flex', alignItems: 'center', justifyContent: 'center', width: 24, height: 24, borderRadius: '4px', transition: 'all 0.2s'
                                }}
                                onMouseEnter={e => { e.currentTarget.style.color = '#f87171'; e.currentTarget.style.background = 'rgba(248,113,113,0.1)' }}
                                onMouseLeave={e => { e.currentTarget.style.color = 'var(--ws-muted)'; e.currentTarget.style.background = 'transparent' }}
                              >
                                <Trash size={16} weight="bold" />
                              </button>
                            </TooltipGlobal>
                          </div>
                        )
                      }
                    }
                  ]}
                  mensagemVazio="Nenhum workspace cadastrado."
                />
              </div>
            </div>
          )}
        />
        )}
      </div>

      {/* Upsell cards dinâmicos do catalogService */}
      <p className="ws-section-title ws-fade-up ws-fade-up-d2" style={{ marginBottom: '0.875rem' }}>
        {t('workspace.subscriptions.secao_disponiveis')}
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.25rem' }} className="ws-fade-up ws-fade-up-d2">
        {catalogProdutos.map(p => (
          <div key={p.id_produto_gravity} className="ux-pulse-card" style={{
            borderRadius: '12px',
            padding: '1.5rem',
            display: 'flex', flexDirection: 'column', gap: '0.75rem',
            background: 'rgba(255,255,255,0.02)',
            border: '1px solid rgba(255,255,255,0.05)',
            transition: 'all 0.2s',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <p style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--ws-text)', margin: 0 }}>{p.nome_produto_gravity}</p>
              <span style={{
                padding: '0.175rem 0.5rem', borderRadius: '4px',
                fontSize: '0.625rem', fontWeight: 800, lineHeight: 1,
                background: 'rgba(52,211,153,0.1)',
                color: '#34d399',
                border: '1px solid rgba(52,211,153,0.2)',
                textTransform: 'uppercase',
              }}>{p.tipo_cobranca_produto_gravity?.replace('POR_', '')}</span>
            </div>

            <p style={{ fontSize: '0.8125rem', color: 'var(--ws-muted)', lineHeight: 1.55, margin: 0, minHeight: '3em' }}>{p.descricao_produto_gravity}</p>

            {p.faixas_preco_produto_gravity ? (
              <div style={{ padding: '0.625rem', background: 'rgba(129,140,248,0.05)', borderRadius: '8px', border: '1px solid rgba(129,140,248,0.1)' }}>
                <p style={{ fontSize: '0.6875rem', fontWeight: 700, color: '#818cf8', marginBottom: '0.375rem', textTransform: 'uppercase' }}>Tabela de Preços</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  {p.faixas_preco_produto_gravity.slice(0, 2).map((fx: FaixaPreco, i: number) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem' }}>
                      <span style={{ color: 'var(--ws-muted)' }}>{fx.faixa_ate_faixa_preco_produto_gravity ? `${fx.faixa_de_faixa_preco_produto_gravity}-${fx.faixa_ate_faixa_preco_produto_gravity}` : `Acima de ${fx.faixa_de_faixa_preco_produto_gravity}`} {p.tipo_cobranca_produto_gravity?.replace('POR_', '')}s</span>
                      <strong style={{ color: 'var(--ws-text)' }}>{getSimboloMoeda(fx.moeda_faixa_preco_produto_gravity)} {fx.preco_faixa_preco_produto_gravity}</strong>
                    </div>
                  ))}
                  {p.faixas_preco_produto_gravity.length > 2 && <span style={{ fontSize: '0.625rem', color: 'var(--ws-muted)', textAlign: 'center', marginTop: '4px' }}>+ {p.faixas_preco_produto_gravity.length - 2} faixas disponíveis</span>}
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                 <div style={{ padding: '4px 8px', background: 'rgba(255,255,255,0.04)', borderRadius: '4px' }}>
                   <span style={{ fontSize: '0.6875rem', color: 'var(--ws-muted)', display: 'block' }}>VALOR UNITÁRIO</span>
                   <strong style={{ fontSize: '1rem', color: 'var(--ws-text)' }}>{getSimboloMoeda(p.moeda_unitario_produto_gravity)} {p.preco_unitario_produto_gravity}</strong>
                 </div>
                 {p.qtd_usuarios_base_produto_gravity && (
                   <div style={{ padding: '4px 8px', background: 'rgba(52,211,153,0.05)', borderRadius: '4px', border: '1px solid rgba(52,211,153,0.1)' }}>
                     <span style={{ fontSize: '0.6875rem', color: '#34d399', display: 'block' }}>FRANQUIA</span>
                     <strong style={{ fontSize: '1rem', color: '#34d399' }}>{p.qtd_usuarios_base_produto_gravity} Free</strong>
                   </div>
                 )}
              </div>
            )}

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0.5rem' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--ws-muted)' }}>{p.possui_setup_produto_gravity ? 'Requer Setup' : 'Ativação Instantânea'}</span>
              <TooltipGlobal descricao="Iniciar processo de contratação e ativação do produto">
                <BotaoGlobal variante="primario" tamanho="pequeno" onClick={() => handleAssinar(p.slug_produto_gravity, p.nome_produto_gravity)}>Assinar</BotaoGlobal>
              </TooltipGlobal>
            </div>
          </div>
        ))}

        {/* Produtos "Em Breve" da Gravity Store */}
        {[
          { id: 'mock-1', nome: 'Smart Read', descricao: 'Plataforma de automação (IDP) e IA para extração e validação inteligente de documentos de Comércio Exterior.', tipoCobranca: 'Subscription' },
          { id: 'mock-2', nome: 'BID Frete Internacional', descricao: 'Centralize cotações marítimas e aéreas, comparando agentes de carga em tempo real.', tipoCobranca: 'Transactional' },
          { id: 'mock-3', nome: 'BID Câmbio', descricao: 'Otimize transações de fechamento ao competir taxas entre corretoras e bancos em uma única interface.', tipoCobranca: 'Transactional' },
        ].map(p => (
          <div key={p.id} style={{
            borderRadius: '12px',
            padding: '1.5rem',
            display: 'flex', flexDirection: 'column', gap: '0.75rem',
            background: 'rgba(255,255,255,0.02)',
            border: '1px solid rgba(255,255,255,0.03)',
            opacity: 0.55,
            cursor: 'not-allowed',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <p style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--ws-muted)', margin: 0 }}>{p.nome}</p>
              <span style={{
                padding: '0.175rem 0.5rem', borderRadius: '4px',
                fontSize: '0.625rem', fontWeight: 800, lineHeight: 1,
                background: 'rgba(255,255,255,0.05)',
                color: 'var(--ws-muted)',
                border: '1px solid rgba(255,255,255,0.05)',
                textTransform: 'uppercase',
              }}>Em Breve</span>
            </div>
            <p style={{ fontSize: '0.8125rem', color: 'var(--ws-muted)', lineHeight: 1.55, margin: 0, minHeight: '3em' }}>{p.descricao}</p>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0.5rem' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--ws-muted)' }}>{p.tipoCobranca}</span>
              <BotaoGlobal variante="fantasma" tamanho="pequeno" disabled>Aguarde</BotaoGlobal>
            </div>
          </div>
        ))}
      </div>

    </PaginaGlobal>

    <ModalExclusao
      aberto={!!produtoParaExcluir}
      titulo="Cancelar Assinatura"
      descricao={<>Tem certeza de que deseja cancelar a assinatura de <strong>{produtoParaExcluir?.nome}</strong>?</>}
      nomeItem="Esta ação é irreversível e o acesso ao produto será bloqueado imediatamente."
      aoConfirmar={confirmarExclusao}
      aoCancelar={() => setProdutoParaExcluir(null)}
    />

    <ModalExclusao
      aberto={!!vinculoParaExcluir}
      titulo="Remover Vínculo do Workspace"
      descricao={<>Tem certeza de que deseja remover o workspace <strong>{vinculoParaExcluir?.workspaceNome}</strong> desta assinatura?</>}
      nomeItem="O acesso a este serviço será cortado imediatamente para essa instância de trabalho e a linha será removida da auditoria."
      aoConfirmar={confirmarExclusaoVinculo}
      aoCancelar={() => setVinculoParaExcluir(null)}
    />

    <ModalEditarAssinatura
      produto={produtoEditando}
      aoFechar={() => setProdutoEditando(null)}
      aoSalvar={(dados) => {
        setProdutos(prev => prev.map(p => p.id === dados.id ? dados : p))
        setProdutoEditando(null)
        addNotification({ type: 'success', message: `Assinatura "${dados.nome}" atualizada com sucesso!` })
      }}
    />
    </>
  )
}
