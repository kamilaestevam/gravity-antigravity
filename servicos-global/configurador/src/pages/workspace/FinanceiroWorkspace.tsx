import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Receipt, DownloadSimple, CalendarBlank, FileXls,
  ShoppingBagOpen, Tag, Users, CurrencyCircleDollar,
  Wrench, Sliders, Headset, Clock, Handshake, Infinity,
  Eye, Buildings
} from '@phosphor-icons/react'
import { TooltipGlobal } from '@nucleo/tooltip-global'
import { CardEstatisticaGlobal } from '@nucleo/card-global'
import { PaginaGlobal } from '@nucleo/pagina-global'
import { CabecalhoGlobal } from '@nucleo/cabecalho-global'
import { TabelaGlobal, type TabelaGlobalColuna, type TabelaGlobalAcao } from '@nucleo/tabela-global'
import { ModalFormularioAbasGlobal } from '@nucleo/modal-formulario-abas-global'
import { SecaoFormulario } from '@nucleo/modal-formulario-global'
import { CampoGeralGlobal } from '@nucleo/campo-geral-global'
import { exportarExcel } from '../../services/exportService'
import { catalogApiService } from '../../services/catalogAdapter'
import { ProdutoCatalogo, NegociacaoEspecial } from '../../types/entidades'
import { getSimboloMoeda } from '../../utils/formatters'
import { getAcoesExportacaoPadrao } from '../../utils/exportHelper'
import { apiFetch } from '../../services/apiClient'
import {
  listaFaturasProdutoGravitySchema,
  itensFaturaProdutoGravitySchema,
  type FaturaProdutoGravity,
  type FaturaItemProdutoGravity,
  type StatusFaturaProdutoGravity,
} from '../../schemas/faturaProdutoGravity'

// ─── Mapa de status → classe de badge ────────────────────────────────────────

const statusBadgeFaturaProdutoGravity: Record<StatusFaturaProdutoGravity, string> = {
  DRAFT:         'ws-badge-neutral',
  OPEN:          'ws-badge-warning',
  PAID:          'ws-badge-success',
  VOID:          'ws-badge-neutral',
  OVERDUE:       'ws-badge-danger',
  UNCOLLECTIBLE: 'ws-badge-danger',
}

// ─── Helpers de formatação ───────────────────────────────────────────────────

function formatarMoeda(valor: number, moeda: string): string {
  const locale = moeda.toLowerCase() === 'brl' ? 'pt-BR' : 'en-US'
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: moeda.toUpperCase(),
    minimumFractionDigits: 2,
  }).format(valor)
}

function formatarData(iso: string | null): string {
  if (!iso) return '—'
  const d = new Date(iso)
  if (isNaN(d.getTime())) return '—'
  return d.toLocaleDateString('pt-BR')
}

// ─── Componente principal ────────────────────────────────────────────────────

export function FinanceiroWorkspace() {
  const { t } = useTranslation()

  // Faturas (fonte primária — backend)
  const [faturas, setFaturas] = useState<FaturaProdutoGravity[]>([])
  const [carregandoFaturas, setCarregandoFaturas] = useState(true)

  // Itens por fatura (lazy-load quando expande linha)
  const [itensPorFatura, setItensPorFatura] = useState<Record<string, FaturaItemProdutoGravity[]>>({})

  // Organização atual (vem de /api/v1/organizacoes/me)
  const [organizacaoAtual, setOrganizacaoAtual] = useState<{ id_organizacao: string; nome_organizacao: string } | null>(null)

  // Catálogo (Produtos × Valores)
  const [produtos, setProdutos] = useState<ProdutoCatalogo[]>([])
  const [negociacoes, setNegociacoes] = useState<NegociacaoEspecial[]>([])
  const [produtoVisualizando, setProdutoVisualizando] = useState<ProdutoCatalogo | null>(null)

  // Aba ativa
  const [tabAtiva, setTabAtiva] = useState<'faturas' | 'produtos'>('faturas')

  // ── Carregar dados ────────────────────────────────────────────────────────

  useEffect(() => {
    let cancelado = false

    async function carregar() {
      try {
        const [faturasRes, orgRes] = await Promise.all([
          apiFetch('/api/v1/faturas'),
          apiFetch('/api/v1/organizacoes/me'),
        ])

        if (cancelado) return

        if (!faturasRes.ok) {
          console.error('[FinanceiroWorkspace] falha ao carregar faturas', faturasRes.status)
          setFaturas([])
        } else {
          const raw = await faturasRes.json()
          const parsed = listaFaturasProdutoGravitySchema.safeParse(raw)
          if (!parsed.success) {
            console.error('[FinanceiroWorkspace] payload de /api/v1/faturas fora do contrato', parsed.error)
            setFaturas([])
          } else {
            setFaturas(parsed.data.faturas)
          }
        }

        if (orgRes.ok) {
          const orgRaw: unknown = await orgRes.json().catch(() => null)
          const o = orgRaw?.organizacao ?? orgRaw
          if (o?.id_organizacao && o?.nome_organizacao) {
            setOrganizacaoAtual({
              id_organizacao:   String(o.id_organizacao),
              nome_organizacao: String(o.nome_organizacao),
            })
          }
        }
      } catch (err) {
        console.error('[FinanceiroWorkspace] erro ao carregar dados', err)
      } finally {
        if (!cancelado) setCarregandoFaturas(false)
      }
    }

    carregar()

    catalogApiService.getProdutos().then(lista => {
      if (cancelado) return
      setProdutos(lista.filter(p => p.status_produto_gravity === 'ATIVO'))
    })
    catalogApiService.getNegociacoes().then(negs => {
      if (cancelado) return
      setNegociacoes(negs)
    })

    return () => { cancelado = true }
  }, [])

  // Negociações da organização atual (apenas após sessão carregada)
  const negociacoesOrg = organizacaoAtual
    ? negociacoes.filter(n => n.id_organizacao === organizacaoAtual.id_organizacao)
    : []

  const getNegociacao = (id_produto_gravity: string): NegociacaoEspecial | undefined =>
    negociacoesOrg.find(n => n.id_produto_gravity === id_produto_gravity)

  // ── Stats (cards no topo) ─────────────────────────────────────────────────

  const faturasEmAberto = faturas.filter(f =>
    f.status_fatura_produto_gravity === 'OPEN' ||
    f.status_fatura_produto_gravity === 'OVERDUE'
  )

  const proximaFatura = faturasEmAberto
    .slice()
    .sort((a, b) => {
      const da = a.data_vencimento_fatura_produto_gravity ?? ''
      const db = b.data_vencimento_fatura_produto_gravity ?? ''
      return da.localeCompare(db)
    })[0] ?? null

  const valorEmAberto = faturasEmAberto.reduce(
    (acc, f) => acc + (f.valor_total_fatura_produto_gravity - f.valor_pago_fatura_produto_gravity),
    0,
  )

  // ── Tooltip de valor (hover sobre célula da tabela) ───────────────────────

  const [valorTooltipAberto, setValorTooltipAberto] = useState<string | null>(null)
  const [tooltipPos, setTooltipPos] = useState<{ top: number; left: number }>({ top: 0, left: 0 })
  const hoverTimeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null)

  const mostrarTooltipValor = (id_fatura: string, triggerEl: HTMLElement) => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current)
    const rect = triggerEl.getBoundingClientRect()
    setTooltipPos({ top: rect.bottom + 8, left: Math.max(16, rect.right - 360) })
    setValorTooltipAberto(id_fatura)
    void carregarItensFatura(id_fatura)
  }

  const esconderTooltipValor = () => {
    hoverTimeoutRef.current = setTimeout(() => setValorTooltipAberto(null), 200)
  }

  const manterTooltipAberto = () => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current)
  }

  useEffect(() => {
    if (!valorTooltipAberto) return
    const handler = () => setValorTooltipAberto(null)
    window.addEventListener('scroll', handler, true)
    return () => window.removeEventListener('scroll', handler, true)
  }, [valorTooltipAberto])

  async function carregarItensFatura(id_fatura: string) {
    if (itensPorFatura[id_fatura]) return // já carregado
    try {
      const res = await apiFetch(`/api/v1/faturas/${encodeURIComponent(id_fatura)}/itens`)
      if (!res.ok) return
      const raw = await res.json()
      const parsed = itensFaturaProdutoGravitySchema.safeParse(raw)
      if (!parsed.success) {
        console.error('[FinanceiroWorkspace] itens fora do contrato', parsed.error)
        return
      }
      setItensPorFatura(prev => ({ ...prev, [id_fatura]: parsed.data.itens_fatura_produto_gravity }))
    } catch (err) {
      console.error('[FinanceiroWorkspace] erro ao carregar itens', err)
    }
  }

  const faturaTooltip = valorTooltipAberto ? faturas.find(f => f.id_fatura_produto_gravity === valorTooltipAberto) : null
  const itensFaturaTooltip = faturaTooltip ? itensPorFatura[faturaTooltip.id_fatura_produto_gravity] ?? [] : []

  // ── Download de documento ─────────────────────────────────────────────────

  function abrirDocumento(fatura: FaturaProdutoGravity, tipo: 'boleto' | 'nfe') {
    const doc = fatura.documentos_fatura_produto_gravity.find(d => d.tipo_documento_fatura_produto_gravity === tipo)
    if (doc?.url_documento_fatura_produto_gravity) {
      window.open(doc.url_documento_fatura_produto_gravity, '_blank', 'noopener,noreferrer')
    } else {
      console.warn(`[FinanceiroWorkspace] Documento ${tipo} indisponível para fatura ${fatura.numero_fatura_produto_gravity}`)
    }
  }

  // ── Colunas da tabela de faturas ──────────────────────────────────────────

  const COLUNAS_FATURAS: TabelaGlobalColuna<FaturaProdutoGravity>[] = [
    {
      key: 'numero_fatura_produto_gravity', label: '#', tipo: 'texto', align: 'center',
      tooltipTitulo: 'Número da Fatura', tooltipDescricao: 'Identificador único.',
      render: (v) => <code style={{ fontSize: '0.8125rem', color: '#818cf8', background: 'rgba(129,140,248,0.08)', padding: '0.125rem 0.4rem', borderRadius: '4px' }}>{String(v ?? '—')}</code>,
    },
    {
      key: 'competencia_fatura_produto_gravity', label: t('workspace.financial.col_competencia'), tipo: 'texto',
      tooltipTitulo: 'Mês/Ano', tooltipDescricao: 'Período de faturamento da fatura.',
      render: (v) => <span style={{ fontWeight: 600 }}>{String(v ?? '—')}</span>,
    },
    {
      key: 'descricao_fatura_produto_gravity', label: t('workspace.financial.col_descricao'), tipo: 'texto',
      tooltipTitulo: 'Serviços Cobrados', tooltipDescricao: 'Resumo dos produtos em uso.',
      render: (v) => <span style={{ color: 'var(--ws-muted)', maxWidth: '260px', display: 'inline-block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{String(v ?? '')}</span>,
    },
    {
      key: 'valor_total_fatura_produto_gravity', label: t('workspace.financial.col_valor'), tipo: 'texto',
      tooltipTitulo: 'Valor a Pagar', tooltipDescricao: 'Passe o mouse para ver a composição detalhada.',
      render: (_v, item) => (
        <span
          className="valor-tooltip-trigger"
          onMouseEnter={(e) => mostrarTooltipValor(item.id_fatura_produto_gravity, e.currentTarget)}
          onMouseLeave={() => esconderTooltipValor()}
          style={{
            fontFamily: 'monospace', fontWeight: 700, color: 'var(--ws-text)', fontSize: '0.9375rem',
            background: valorTooltipAberto === item.id_fatura_produto_gravity ? 'rgba(129,140,248,0.12)' : 'transparent',
            border: `1px solid ${valorTooltipAberto === item.id_fatura_produto_gravity ? 'rgba(129,140,248,0.3)' : 'transparent'}`,
            borderRadius: '6px', padding: '0.25rem 0.5rem', cursor: 'default',
            transition: 'all 0.15s', display: 'inline-block',
          }}
        >
          {formatarMoeda(item.valor_total_fatura_produto_gravity, item.moeda_fatura_produto_gravity)}
        </span>
      ),
    },
    {
      key: 'data_vencimento_fatura_produto_gravity', label: t('workspace.financial.col_vencimento'), tipo: 'texto',
      tooltipTitulo: 'Dia do Vencimento', tooltipDescricao: 'Data limite para pagamento.',
      render: (v, item) => (
        <span style={{ color: item.status_fatura_produto_gravity === 'OVERDUE' ? '#f87171' : 'var(--ws-muted)' }}>
          {formatarData(v as string | null)}
        </span>
      ),
    },
    {
      key: 'status_fatura_produto_gravity', label: t('workspace.financial.col_status'), tipo: 'texto',
      tooltipTitulo: 'Status da Fatura', tooltipDescricao: 'Qual a situação atual do boleto.',
      render: (v) => {
        const status = v as StatusFaturaProdutoGravity
        const label = t(`workspace.financial.status.${status.toLowerCase()}`, { defaultValue: status })
        return <span className={`ws-badge ${statusBadgeFaturaProdutoGravity[status] ?? 'ws-badge-neutral'}`}>{label}</span>
      },
    },
  ]

  // ── Colunas da tabela de produtos (catálogo) ──────────────────────────────

  const COLUNAS_PRODUTOS: TabelaGlobalColuna<ProdutoCatalogo>[] = [
    {
      key: 'nome_produto_gravity', label: t('workspace.financial.col_produto'), tipo: 'texto',
      tooltipTitulo: 'Produto Contratado', tooltipDescricao: 'Identificação do serviço cadastrado no catálogo Gravity.',
      render: (v) => <span style={{ fontWeight: 600, color: 'var(--ws-text)' }}>{String(v ?? '')}</span>,
    },
    {
      key: 'tipo_cobranca_produto_gravity', label: t('workspace.financial.col_cobranca'), tipo: 'texto',
      tooltipTitulo: 'Tipo de Cobrança', tooltipDescricao: 'Métrica usada para cobrança deste produto.',
      render: (v) => (
        <span style={{
          display: 'inline-flex', padding: '0.175rem 0.5rem', borderRadius: '9999px',
          fontSize: '0.6875rem', fontWeight: 700, background: 'rgba(129,140,248,0.08)',
          color: '#818cf8', border: '1px solid rgba(129,140,248,0.15)',
          textTransform: 'uppercase', letterSpacing: '0.04em',
        }}>{String(v ?? '')}</span>
      ),
    },
    {
      key: 'preco_unitario_produto_gravity', label: t('workspace.financial.col_valor_unitario'), tipo: 'texto',
      tooltipTitulo: 'Preço Base', tooltipDescricao: 'Valor cobrado por unidade ou uso adicional além da franquia.',
      render: (_v, item) => {
        const faixas = item.faixas_preco_produto_gravity
        if (faixas && faixas.length > 0) {
          const ultima = faixas[faixas.length - 1]
          return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              <span style={{ fontWeight: 700, color: '#818cf8', fontSize: '0.8125rem' }}>Ver Camadas ({faixas.length})</span>
              <span style={{ color: 'var(--ws-muted)', fontSize: '0.75rem' }}>A partir de {getSimboloMoeda(faixas[0].moeda_faixa_preco_produto_gravity)} {ultima.preco_faixa_preco_produto_gravity}</span>
            </div>
          )
        }
        return <span style={{ fontFamily: 'monospace', fontWeight: 700, color: 'var(--ws-text)', fontSize: '0.9375rem' }}>{getSimboloMoeda(item.moeda_unitario_produto_gravity)} {item.preco_unitario_produto_gravity}</span>
      },
    },
    {
      key: 'qtd_usuarios_base_produto_gravity', label: t('workspace.financial.col_franquia'), tipo: 'texto',
      tooltipTitulo: 'Franquia Inclusa', tooltipDescricao: 'Quantidade de uso incluída sem cobrança adicional.',
      render: (_v, item) => (
        <span style={{ color: item.qtd_usuarios_base_produto_gravity ? '#34d399' : 'var(--ws-muted)', fontSize: '0.85rem', fontWeight: item.qtd_usuarios_base_produto_gravity ? 600 : 400 }}>
          {item.qtd_usuarios_base_produto_gravity ? `${item.qtd_usuarios_base_produto_gravity} ${item.tipo_cobranca_produto_gravity.replace('POR_', '')}s` : 'Zero'}
        </span>
      ),
    },
    {
      key: 'tipo_limite_usuario_produto_gravity', label: t('workspace.financial.col_usuarios'), tipo: 'texto',
      tooltipTitulo: 'Configuração de Usuários', tooltipDescricao: 'Verificação do limite de usuários do produto.',
      render: (v, item) => (
        <span style={{ color: 'var(--ws-muted)', fontSize: '0.85rem' }}>
          {v === 'ILIMITADO' ? '∞ Ilimitados' : `${item.qtd_usuarios_base_produto_gravity ?? 0} usuários`}
        </span>
      ),
    },
    {
      key: 'horas_helpdesk_produto_gravity', label: t('workspace.financial.col_helpdesk'), tipo: 'texto',
      tooltipTitulo: 'Suporte Técnico', tooltipDescricao: 'Horas mensais de help desk incluídas.',
      render: (v) => (
        <span style={{ color: Number(v) > 0 ? '#fbbf24' : 'var(--ws-muted)', fontSize: '0.85rem', fontWeight: Number(v) > 0 ? 600 : 400 }}>
          {Number(v) > 0 ? `${v}h/mês` : 'Não incluso'}
        </span>
      ),
    },
    {
      key: 'id_produto_gravity', label: t('workspace.financial.col_negociacao'), tipo: 'texto',
      tooltipTitulo: 'Acordo Especial', tooltipDescricao: 'Verifica se esta organização possui condições exclusivas.',
      render: (_v, item) => {
        const neg = getNegociacao(item.id_produto_gravity)
        if (neg) {
          return (
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: '4px',
              padding: '0.175rem 0.5rem', borderRadius: '9999px',
              fontSize: '0.6875rem', fontWeight: 700,
              background: 'rgba(16,185,129,0.08)', color: '#10b981',
              border: '1px solid rgba(16,185,129,0.2)',
            }}>
              <Handshake size={12} weight="bold" /> ATIVA
            </span>
          )
        }
        return <span style={{ color: 'var(--ws-muted)', fontSize: '0.75rem' }}>Padrão</span>
      },
    },
  ]

  const ACOES_PRODUTOS: TabelaGlobalAcao<ProdutoCatalogo>[] = [
    {
      id: 'ver-detalhes',
      icone: <Eye weight="bold" size={15} />,
      tooltip: 'Ver Detalhes do Produto',
      onClick: (item) => setProdutoVisualizando(item),
      renderCustom: (item) => (
        <TooltipGlobal descricao="Ver detalhes">
          <button
            type="button"
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); setProdutoVisualizando(item) }}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 28, height: 28, borderRadius: '50%', background: 'transparent', border: '1px solid transparent', color: '#64748b', cursor: 'pointer', transition: 'all 0.15s', flexShrink: 0 }}
            onMouseEnter={ev => { ev.currentTarget.style.background = 'rgba(129,140,248,0.12)'; ev.currentTarget.style.borderColor = 'rgba(129,140,248,0.3)'; ev.currentTarget.style.color = '#818cf8' }}
            onMouseLeave={ev => { ev.currentTarget.style.background = 'transparent'; ev.currentTarget.style.borderColor = 'transparent'; ev.currentTarget.style.color = '#64748b' }}
          >
            <Eye size={16} weight="bold" />
          </button>
        </TooltipGlobal>
      ),
    },
  ]

  // ── Helper read-only field ────────────────────────────────────────────────

  const ReadOnlyField = ({ label, value, icon }: { label: string; value: React.ReactNode; icon?: React.ReactNode }) => (
    <CampoGeralGlobal label={label}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: '0.5rem',
        padding: '0.5rem 0.75rem', borderRadius: '8px',
        background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)',
        fontSize: '0.875rem', color: 'var(--ws-text)', fontWeight: 500,
        minHeight: '38px',
      }}>
        {icon && <span style={{ color: 'var(--ws-muted)', display: 'flex', alignItems: 'center' }}>{icon}</span>}
        {value}
      </div>
    </CampoGeralGlobal>
  )

  const negProdutoAtual = produtoVisualizando ? getNegociacao(produtoVisualizando.id_produto_gravity) : undefined

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <>
    <style>{`
      @keyframes fadeInScale {
        from { opacity: 0; transform: translateY(-4px) scale(0.97); }
        to   { opacity: 1; transform: translateY(0) scale(1); }
      }
    `}</style>
    <PaginaGlobal
      className="ws-fade-up"
      layout="lista"
      cabecalho={
        <CabecalhoGlobal
          titulo={t('workspace.financial.titulo')}
          subtitulo={t('workspace.financial.subtitulo')}
          icone={<Receipt weight="duotone" size={22} color="#818cf8" />}
        />
      }
      stats={
        <>
          <CardEstatisticaGlobal
            titulo={t('workspace.financial.proximo_vencimento')}
            icone={<CalendarBlank weight="duotone" size={16} />}
            valor={<span style={{ fontSize: '1.5rem' }}>{formatarData(proximaFatura?.data_vencimento_fatura_produto_gravity ?? null)}</span>}
            subtexto={proximaFatura?.competencia_fatura_produto_gravity ?? 'Sem faturas abertas'}
            tooltip={
              <>
                <p className="cg-tooltip__title">DETALHES DA FATURA</p>
                <div className="cg-tooltip__row">
                  <span>Fatura Nº</span>
                  <strong>{proximaFatura?.numero_fatura_produto_gravity ?? '—'}</strong>
                </div>
                <div className="cg-tooltip__row">
                  <span>Valor esperado</span>
                  <strong>
                    {proximaFatura
                      ? formatarMoeda(proximaFatura.valor_total_fatura_produto_gravity, proximaFatura.moeda_fatura_produto_gravity)
                      : '—'}
                  </strong>
                </div>
              </>
            }
          />
          <CardEstatisticaGlobal
            titulo={t('workspace.financial.valor_pagar')}
            valor={<span style={{ fontSize: '1.5rem' }}>{formatarMoeda(valorEmAberto, proximaFatura?.moeda_fatura_produto_gravity ?? 'brl')}</span>}
            variante={faturasEmAberto.length ? 'aviso' : 'sucesso'}
            tooltip={
              <>
                <p className="cg-tooltip__title">COMPOSIÇÃO DO VALOR</p>
                <div className="cg-tooltip__row">
                  <span>Faturas pendentes</span>
                  <strong>{faturasEmAberto.filter(f => f.status_fatura_produto_gravity === 'OPEN').length}</strong>
                </div>
                <div className="cg-tooltip__row">
                  <span>Faturas atrasadas</span>
                  <strong>{faturasEmAberto.filter(f => f.status_fatura_produto_gravity === 'OVERDUE').length}</strong>
                </div>
              </>
            }
          />
          <CardEstatisticaGlobal
            titulo={t('workspace.financial.faturas_abertas')}
            valor={<span style={{ fontSize: '1.75rem' }}>{faturasEmAberto.length}</span>}
            subtexto={faturasEmAberto.length === 0 ? 'Tudo em dia' : 'Requer atenção'}
            variante={faturasEmAberto.length > 0 ? 'perigo' : 'sucesso'}
            tooltip={
              <>
                <p className="cg-tooltip__title">SITUAÇÃO GERAL</p>
                <div className="cg-tooltip__row">
                  <span>Total lançadas</span>
                  <strong>{faturas.length}</strong>
                </div>
                <div className="cg-tooltip__row">
                  <span>Faturas pagas</span>
                  <strong>{faturas.filter(x => x.status_fatura_produto_gravity === 'PAID').length}</strong>
                </div>
              </>
            }
          />
        </>
      }
      toolbar={
        <div className="ws-tabs" style={{ margin: 0 }}>
          <button className={`ws-tab${tabAtiva === 'faturas' ? ' active' : ''}`} onClick={() => setTabAtiva('faturas')}>
            {t('workspace.financial.aba_faturas')}
          </button>
          <button className={`ws-tab${tabAtiva === 'produtos' ? ' active' : ''}`} onClick={() => setTabAtiva('produtos')}>
            {t('workspace.financial.aba_produtos')}
          </button>
        </div>
      }
    >

      {/* ═══════ ABA 1: HISTÓRICO DE FATURAS ═══════ */}
      {tabAtiva === 'faturas' && (
        <div className="ws-fade-up">
          <p className="ws-section-title ws-fade-up ws-fade-up-d2" style={{ margin: 0, marginBottom: '16px' }}>
            <Receipt weight="duotone" size={14} color="#818cf8" />
            {t('workspace.financial.aba_faturas')}
          </p>
          <div style={{ position: 'relative', zIndex: 10, marginBottom: '2rem' }}>
            <TabelaGlobal<FaturaProdutoGravity>
              id="workspace-financeiro-faturas"
              dados={faturas}
              colunas={COLUNAS_FATURAS}
              acoesExportacao={getAcoesExportacaoPadrao(COLUNAS_FATURAS, 'dados_tabela', 'Exportação de Dados')}
              mensagemVazio={carregandoFaturas ? 'Carregando faturas…' : 'Nenhuma fatura encontrada.'}
              mensagemSemFiltro="Você não possui histórico de faturas."
              tooltipBusca="Localizar faturas por número, competência ou descrição dos serviços"
              tooltipExpandir="Ver detalhamento completo da composição desta fatura"
              renderExpandido={(fatura) => {
                const itens = itensPorFatura[fatura.id_fatura_produto_gravity]
                if (!itens) {
                  void carregarItensFatura(fatura.id_fatura_produto_gravity)
                  return (
                    <div style={{ padding: '1rem 1.5rem', color: 'var(--ws-muted)', fontSize: '0.8125rem' }}>
                      Carregando composição da fatura {fatura.numero_fatura_produto_gravity ?? ''}…
                    </div>
                  )
                }
                if (itens.length === 0) {
                  return (
                    <div style={{ padding: '1rem 1.5rem', color: 'var(--ws-muted)', fontSize: '0.8125rem' }}>
                      Esta fatura não possui itens detalhados.
                    </div>
                  )
                }
                return (
                  <div style={{ padding: '1rem 1.5rem', background: 'rgba(255,255,255,0.02)', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                    <p style={{ margin: '0 0 1rem 0', fontSize: '0.875rem', fontWeight: 600, color: 'var(--ws-text)', display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                      <Receipt size={18} weight="duotone" color="var(--color-primary)" /> Detalhamento da Fatura {fatura.numero_fatura_produto_gravity ?? ''}
                    </p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {itens.map((item) => (
                        <div key={item.id_fatura_item_produto_gravity ?? item.posicao_fatura_item_produto_gravity} style={{
                          display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: '12px', alignItems: 'center',
                          background: 'rgba(255,255,255,0.03)', padding: '0.75rem 1rem', borderRadius: '10px',
                          border: '1px solid rgba(255,255,255,0.05)',
                        }}>
                          <div>
                            <span style={{ fontSize: '0.6875rem', color: 'var(--ws-muted)', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.04em' }}>Descrição</span>
                            <p style={{ margin: 0, fontSize: '0.9375rem', fontWeight: 600, color: 'var(--ws-text)' }}>{item.descricao_fatura_item_produto_gravity}</p>
                          </div>
                          <div>
                            <span style={{ fontSize: '0.6875rem', color: 'var(--ws-muted)', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.04em' }}>Qtd.</span>
                            <p style={{ margin: 0, fontSize: '0.9375rem', fontWeight: 600 }}>{item.quantidade_fatura_item_produto_gravity}</p>
                          </div>
                          <div>
                            <span style={{ fontSize: '0.6875rem', color: 'var(--ws-muted)', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.04em' }}>Valor unit.</span>
                            <p style={{ margin: 0, fontSize: '0.9375rem', fontWeight: 600 }}>{formatarMoeda(item.valor_unitario_fatura_item_produto_gravity, item.moeda_fatura_item_produto_gravity)}</p>
                          </div>
                          <div>
                            <span style={{ fontSize: '0.6875rem', color: 'var(--ws-muted)', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.04em' }}>Valor total</span>
                            <p style={{ margin: 0, fontSize: '0.9375rem', fontWeight: 700, color: '#818cf8' }}>{formatarMoeda(item.valor_total_fatura_item_produto_gravity, item.moeda_fatura_item_produto_gravity)}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              }}
              acoes={[
                {
                  id: 'boleto', icone: <DownloadSimple weight="bold" size={15} />, tooltip: 'Baixar Boleto',
                  onClick: (f) => abrirDocumento(f, 'boleto'),
                },
                {
                  id: 'nfe', icone: <DownloadSimple weight="bold" size={15} />, tooltip: 'Baixar NF-e',
                  onClick: (f) => abrirDocumento(f, 'nfe'),
                },
              ]}
            />
          </div>

          <div style={{
            background: 'rgba(129,140,248,0.06)',
            border: '1px solid rgba(129,140,248,0.15)',
            borderRadius: '10px',
            padding: '1rem 1.25rem',
            fontSize: '0.8125rem',
            color: 'var(--ws-muted)',
            lineHeight: 1.6,
          }}>
            💡 <strong style={{ color: 'var(--ws-text)' }}>Segunda via</strong> — O download de boletos e NF-e abre o documento direto do provedor de cobrança configurado. Para dúvidas, contate <strong style={{ color: '#818cf8' }}>financeiro@gravity.com.br</strong>.
          </div>
        </div>
      )}

      {/* ═══════ ABA 2: PRODUTOS & VALORES ═══════ */}
      {tabAtiva === 'produtos' && (
        <div className="ws-fade-up">
          {negociacoesOrg.length > 0 && organizacaoAtual && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: '0.75rem',
              padding: '0.875rem 1.25rem', borderRadius: '10px',
              background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.2)',
              marginBottom: '16px',
            }}>
              <Handshake weight="duotone" size={20} color="#10b981" />
              <div>
                <p style={{ margin: 0, fontSize: '0.8125rem', fontWeight: 700, color: '#10b981' }}>
                  Negociação Especial Ativa
                </p>
                <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--ws-muted)' }}>
                  Sua organização (<strong style={{ color: 'var(--ws-text)' }}>{organizacaoAtual.nome_organizacao}</strong>) possui {negociacoesOrg.length} acordo(s) especial(is) com condições exclusivas de preço.
                </p>
              </div>
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <p className="ws-section-title" style={{ margin: 0 }}>
              <ShoppingBagOpen weight="duotone" size={14} color="#818cf8" /> Tabela de Produtos × Valores
            </p>
          </div>

          <div style={{ position: 'relative', zIndex: 10 }}>
            <TabelaGlobal<ProdutoCatalogo>
              id="workspace-financeiro-catalogo"
              dados={produtos}
              colunas={COLUNAS_PRODUTOS}
              acoes={ACOES_PRODUTOS}
              mensagemVazio="Nenhum produto disponível no catálogo."
              mensagemSemFiltro="Sem produtos cadastrados."
              acoesExportacao={getAcoesExportacaoPadrao(COLUNAS_PRODUTOS, 'dados_tabela', 'Exportação de Dados')}
              tooltipBusca="Localizar produtos por nome, modalidade de cobrança ou status"
            />
          </div>

          <div style={{
            display: 'flex', gap: '1.5rem', flexWrap: 'wrap',
            marginTop: '1.25rem', padding: '0.75rem 1rem', borderRadius: '8px',
            background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)',
            fontSize: '0.75rem', color: 'var(--ws-muted)',
          }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#818cf8' }} /> Valor Unitário = preço adicional por unidade após franquia
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#34d399' }} /> Franquia Free = quantidade inclusa sem custo
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981' }} /> Negociação = condição exclusiva para sua organização
            </span>
          </div>
        </div>
      )}

    </PaginaGlobal>

    {/* ═══════ MODAL: VISUALIZAÇÃO DETALHADA DO PRODUTO ═══════ */}
    <ModalFormularioAbasGlobal
      aberto={!!produtoVisualizando}
      aoFechar={() => setProdutoVisualizando(null)}
      aoSalvar={() => setProdutoVisualizando(null)}
      icone={<ShoppingBagOpen weight="duotone" size={24} />}
      titulo={produtoVisualizando ? `${produtoVisualizando.nome_produto_gravity}` : ''}
      subtitulo="Detalhes do produto conforme configurado no catálogo Gravity."
      tamanho="lg"
      dirty={false}
      podesSalvar={true}
      abas={[
        {
          id: 'dados-basicos',
          rotulo: 'Dados Básicos',
          conteudo: produtoVisualizando ? (
            <div style={{ padding: '1rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <SecaoFormulario icone={<Tag size={16} weight="duotone" />} titulo="Dados Básicos" tooltip="Identificação do produto no catálogo Gravity" />
              <ReadOnlyField label="Nome do Produto" value={produtoVisualizando.nome_produto_gravity} icon={<ShoppingBagOpen size={16} />} />
              <ReadOnlyField label="Descrição Curta" value={produtoVisualizando.descricao_produto_gravity} icon={<Tag size={16} />} />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <ReadOnlyField label="Data de Lançamento" value={produtoVisualizando.data_lancamento_produto_gravity || '—'} icon={<CalendarBlank size={16} />} />
                <ReadOnlyField label="Status" value={
                  <span style={{
                    display: 'inline-flex', padding: '0.2rem 0.625rem', borderRadius: '9999px',
                    fontSize: '0.6875rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em',
                    background: produtoVisualizando.status_produto_gravity === 'ATIVO' ? 'rgba(52,211,153,0.12)' : 'rgba(248,113,113,0.12)',
                    color: produtoVisualizando.status_produto_gravity === 'ATIVO' ? '#34d399' : '#f87171',
                    border: `1px solid ${produtoVisualizando.status_produto_gravity === 'ATIVO' ? 'rgba(52,211,153,0.25)' : 'rgba(248,113,113,0.25)'}`,
                  }}>
                    {produtoVisualizando.status_produto_gravity}
                  </span>
                } />
              </div>
              {produtoVisualizando.modulo_backend_produto_gravity && (
                <ReadOnlyField label="Módulo Backend (Slug)" value={
                  <code style={{ color: '#8b5cf6', fontSize: '0.8125rem' }}>{produtoVisualizando.modulo_backend_produto_gravity}</code>
                } />
              )}
            </div>
          ) : null,
        },
        {
          id: 'setup',
          rotulo: 'Setup',
          conteudo: produtoVisualizando ? (
            <div style={{ padding: '1rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <SecaoFormulario icone={<Wrench size={16} weight="duotone" />} titulo="Setup" />
              <ReadOnlyField label="Tem Setup?" value={
                <span style={{
                  padding: '0.2rem 0.625rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 600,
                  background: produtoVisualizando.possui_setup_produto_gravity ? 'rgba(16,185,129,0.12)' : 'rgba(255,255,255,0.05)',
                  color: produtoVisualizando.possui_setup_produto_gravity ? '#10b981' : 'var(--ws-muted)',
                  border: `1px solid ${produtoVisualizando.possui_setup_produto_gravity ? 'rgba(16,185,129,0.25)' : 'rgba(255,255,255,0.08)'}`,
                }}>
                  {produtoVisualizando.possui_setup_produto_gravity ? 'Sim' : 'Não'}
                </span>
              } />
              {produtoVisualizando.possui_setup_produto_gravity && produtoVisualizando.preco_setup_produto_gravity && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <ReadOnlyField label="Moeda do Setup" value={produtoVisualizando.moeda_setup_produto_gravity} icon={<CurrencyCircleDollar size={16} />} />
                  <ReadOnlyField label="Valor do Setup" value={`${getSimboloMoeda(produtoVisualizando.moeda_setup_produto_gravity)} ${produtoVisualizando.preco_setup_produto_gravity}`} />
                </div>
              )}
              {!produtoVisualizando.possui_setup_produto_gravity && (
                <div style={{
                  padding: '2rem', borderRadius: '10px', textAlign: 'center',
                  background: 'rgba(255,255,255,0.01)', border: '2px dashed rgba(255,255,255,0.04)',
                }}>
                  <Wrench size={28} weight="duotone" style={{ opacity: 0.3, marginBottom: '0.5rem' }} />
                  <p style={{ margin: 0, fontSize: '0.8125rem', color: 'var(--ws-muted)' }}>Este produto não requer setup — ativação instantânea.</p>
                </div>
              )}
            </div>
          ) : null,
        },
        {
          id: 'valor-produto',
          rotulo: 'Valor do Produto',
          conteudo: produtoVisualizando ? (
            <div style={{ padding: '1rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <SecaoFormulario icone={<Sliders size={16} weight="duotone" />} titulo="Valores do Produto" />
              <ReadOnlyField label="Tipo de Cobrança" value={produtoVisualizando.tipo_cobranca_produto_gravity} icon={<Sliders size={16} />} />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <ReadOnlyField label="Moeda" value={produtoVisualizando.moeda_unitario_produto_gravity} icon={<CurrencyCircleDollar size={16} />} />
                <ReadOnlyField label="Franquia Free (Qtd)" value={
                  produtoVisualizando.qtd_usuarios_base_produto_gravity
                    ? <span style={{ color: '#34d399', fontWeight: 600 }}>{produtoVisualizando.qtd_usuarios_base_produto_gravity}</span>
                    : <span style={{ color: 'var(--ws-muted)' }}>Zero</span>
                } icon={<Tag size={16} />} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                <ReadOnlyField label="Valor Unitário" value={`${getSimboloMoeda(produtoVisualizando.moeda_unitario_produto_gravity)} ${produtoVisualizando.preco_unitario_produto_gravity}`} />
                <ReadOnlyField label="Valor Mínimo" value={`${getSimboloMoeda(produtoVisualizando.moeda_minimo_produto_gravity)} ${produtoVisualizando.preco_minimo_produto_gravity}`} />
                <ReadOnlyField label="Valor Total" value={
                  produtoVisualizando.preco_total_produto_gravity
                    ? `${getSimboloMoeda(produtoVisualizando.moeda_total_produto_gravity)} ${produtoVisualizando.preco_total_produto_gravity}`
                    : '—'
                } />
              </div>
              {produtoVisualizando.faixas_preco_produto_gravity && produtoVisualizando.faixas_preco_produto_gravity.length > 0 && (
                <div style={{ marginTop: '0.5rem', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '1.25rem' }}>
                  <p style={{ margin: '0 0 1rem 0', fontSize: '0.875rem', fontWeight: 600, color: 'var(--ws-text)', display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                    <Sliders size={18} weight="duotone" color="var(--color-primary)" /> Configuração de Camadas (Tiers)
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {produtoVisualizando.faixas_preco_produto_gravity.map((fx) => (
                      <div key={fx.id_faixa_preco_produto_gravity} style={{
                        display: 'grid', gridTemplateColumns: '1fr 1fr 1.5fr', gap: '12px', alignItems: 'center',
                        background: 'rgba(255,255,255,0.03)', padding: '0.75rem 1rem', borderRadius: '10px',
                        border: '1px solid rgba(255,255,255,0.05)',
                      }}>
                        <div>
                          <span style={{ fontSize: '0.6875rem', color: 'var(--ws-muted)', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.04em' }}>De</span>
                          <p style={{ margin: 0, fontSize: '0.9375rem', fontWeight: 600, color: 'var(--ws-text)' }}>{fx.faixa_de_faixa_preco_produto_gravity}</p>
                        </div>
                        <div>
                          <span style={{ fontSize: '0.6875rem', color: 'var(--ws-muted)', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.04em' }}>Até</span>
                          <p style={{ margin: 0, fontSize: '0.9375rem', fontWeight: 600, color: 'var(--ws-text)' }}>{fx.faixa_ate_faixa_preco_produto_gravity ?? '∞'}</p>
                        </div>
                        <div>
                          <span style={{ fontSize: '0.6875rem', color: 'var(--ws-muted)', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.04em' }}>Valor</span>
                          <p style={{ margin: 0, fontSize: '0.9375rem', fontWeight: 700, color: '#818cf8' }}>{getSimboloMoeda(fx.moeda_faixa_preco_produto_gravity)} {fx.preco_faixa_preco_produto_gravity}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : null,
        },
        {
          id: 'usuarios',
          rotulo: 'Usuários',
          conteudo: produtoVisualizando ? (
            <div style={{ padding: '1rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <SecaoFormulario icone={<Users size={16} weight="duotone" />} titulo="Usuários" />
              <ReadOnlyField label="Quantidade de Usuários" value={
                <span style={{
                  padding: '0.2rem 0.625rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 600,
                  background: produtoVisualizando.tipo_limite_usuario_produto_gravity === 'ILIMITADO' ? 'rgba(129,140,248,0.12)' : 'rgba(16,185,129,0.12)',
                  color: produtoVisualizando.tipo_limite_usuario_produto_gravity === 'ILIMITADO' ? '#818cf8' : '#10b981',
                  border: `1px solid ${produtoVisualizando.tipo_limite_usuario_produto_gravity === 'ILIMITADO' ? 'rgba(129,140,248,0.25)' : 'rgba(16,185,129,0.25)'}`,
                }}>
                  {produtoVisualizando.tipo_limite_usuario_produto_gravity === 'ILIMITADO' ? '∞ Ilimitada' : 'Limitada'}
                </span>
              } />
              {produtoVisualizando.tipo_limite_usuario_produto_gravity === 'LIMITADO' && (
                <>
                  <ReadOnlyField label="Quantidade" value={produtoVisualizando.qtd_usuarios_base_produto_gravity ?? '—'} icon={<Users size={16} />} />
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <ReadOnlyField label="Moeda" value={produtoVisualizando.moeda_usuario_extra_produto_gravity ?? 'BRL'} icon={<CurrencyCircleDollar size={16} />} />
                    <ReadOnlyField label="Valor por Usuário Adicional" value={
                      produtoVisualizando.preco_usuario_extra_produto_gravity
                        ? `${getSimboloMoeda(produtoVisualizando.moeda_usuario_extra_produto_gravity)} ${produtoVisualizando.preco_usuario_extra_produto_gravity}`
                        : `${getSimboloMoeda('BRL')} 0,00`
                    } />
                  </div>
                </>
              )}
            </div>
          ) : null,
        },
        {
          id: 'help-desk',
          rotulo: 'Help Desk',
          conteudo: produtoVisualizando ? (
            <div style={{ padding: '1rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <SecaoFormulario icone={<Headset size={16} weight="duotone" />} titulo="Help Desk" />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <ReadOnlyField label="Total de Horas Mensais" value={
                  produtoVisualizando.horas_helpdesk_produto_gravity > 0
                    ? <span style={{ color: '#fbbf24', fontWeight: 600 }}>{produtoVisualizando.horas_helpdesk_produto_gravity}h/mês</span>
                    : <span style={{ color: 'var(--ws-muted)' }}>Não incluso</span>
                } icon={<Clock size={16} />} />
                <ReadOnlyField label="Moeda do Adicional por Hora" value={produtoVisualizando.moeda_hora_extra_produto_gravity ?? 'BRL'} icon={<CurrencyCircleDollar size={16} />} />
              </div>
              {produtoVisualizando.horas_helpdesk_produto_gravity === 0 && (
                <div style={{
                  padding: '2rem', borderRadius: '10px', textAlign: 'center',
                  background: 'rgba(255,255,255,0.01)', border: '2px dashed rgba(255,255,255,0.04)',
                }}>
                  <Headset size={28} weight="duotone" style={{ opacity: 0.3, marginBottom: '0.5rem' }} />
                  <p style={{ margin: 0, fontSize: '0.8125rem', color: 'var(--ws-muted)' }}>Nenhuma hora de help desk incluída neste produto.</p>
                  <p style={{ margin: '4px 0 0 0', fontSize: '0.75rem', color: 'rgba(255,255,255,0.2)' }}>Contate o suporte para contratar horas adicionais.</p>
                </div>
              )}
            </div>
          ) : null,
        },
        {
          id: 'negociacao',
          rotulo: 'Negociação',
          conteudo: produtoVisualizando ? (
            <div style={{ padding: '1rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <SecaoFormulario icone={<Handshake size={16} weight="duotone" />} titulo="Negociação Especial" tooltip="Condição de preço exclusiva para sua organização" />
              {negProdutoAtual ? (
                <>
                  <div style={{
                    padding: '0.875rem 1.25rem', borderRadius: '10px',
                    background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.2)',
                    display: 'flex', alignItems: 'center', gap: '0.75rem',
                  }}>
                    <Handshake weight="duotone" size={20} color="#10b981" />
                    <div>
                      <p style={{ margin: 0, fontSize: '0.8125rem', fontWeight: 700, color: '#10b981' }}>Acordo Especial Ativo</p>
                      <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--ws-muted)' }}>
                        Condição exclusiva para <strong style={{ color: 'var(--ws-text)' }}>{negProdutoAtual.nome_organizacao_negociacao_especial_preco_produto_gravity}</strong>
                      </p>
                    </div>
                  </div>
                  <ReadOnlyField label="Organização Vinculada" value={negProdutoAtual.nome_organizacao_negociacao_especial_preco_produto_gravity} icon={<Buildings size={16} />} />
                  <ReadOnlyField label="Condição Especial" value={negProdutoAtual.acordo_negociacao_especial_preco_produto_gravity} icon={<Handshake size={16} />} />
                  <ReadOnlyField label="Vigência" value={
                    negProdutoAtual.ilimitado_negociacao_especial_preco_produto_gravity ? (
                      <span style={{
                        display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                        padding: '0.2rem 0.625rem', borderRadius: '9999px',
                        background: 'rgba(129,140,248,0.08)', border: '1px solid rgba(129,140,248,0.2)',
                        color: '#818cf8', fontSize: '0.8125rem', fontWeight: 600,
                      }}>
                        <Infinity size={15} weight="bold" /> Sem data de expiração
                      </span>
                    ) : (
                      <span style={{ color: 'var(--ws-text)' }}>
                        {negProdutoAtual.data_inicio_negociacao_especial_preco_produto_gravity || '—'} até {negProdutoAtual.data_fim_negociacao_especial_preco_produto_gravity || '—'}
                      </span>
                    )
                  } />
                </>
              ) : (
                <div style={{
                  padding: '2.5rem', borderRadius: '10px', textAlign: 'center',
                  background: 'rgba(255,255,255,0.01)', border: '2px dashed rgba(255,255,255,0.04)',
                }}>
                  <Handshake size={32} weight="duotone" style={{ opacity: 0.3, marginBottom: '0.75rem' }} />
                  <p style={{ margin: 0, fontSize: '0.875rem', fontWeight: 600, color: 'var(--ws-text)' }}>Sem Negociação Especial</p>
                  <p style={{ margin: '4px 0 0 0', fontSize: '0.75rem', color: 'var(--ws-muted)' }}>
                    Sua organização utiliza os valores padrão do catálogo para este produto.
                  </p>
                  <p style={{ margin: '8px 0 0 0', fontSize: '0.6875rem', color: 'rgba(255,255,255,0.2)' }}>
                    Entre em contato com o time comercial para solicitar condições especiais.
                  </p>
                </div>
              )}
            </div>
          ) : null,
        },
      ]}
    />

    {/* ═══════ POPOVER FIXO: COMPOSIÇÃO DA FATURA ═══════ */}
    {faturaTooltip && (
      <div
        className="valor-tooltip-popover"
        onMouseEnter={manterTooltipAberto}
        onMouseLeave={esconderTooltipValor}
        style={{
          position: 'fixed',
          top: tooltipPos.top,
          left: tooltipPos.left,
          zIndex: 99999,
          width: '360px',
          background: 'var(--ws-surface, #1e293b)',
          border: '1px solid rgba(129,140,248,0.2)',
          borderRadius: '12px',
          boxShadow: '0 12px 40px rgba(0,0,0,0.5), 0 0 0 1px rgba(129,140,248,0.08)',
          padding: '1rem',
          animation: 'fadeInScale 0.15s ease-out',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem', paddingBottom: '0.625rem', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <Receipt weight="duotone" size={16} color="#818cf8" />
          <div>
            <p style={{ margin: 0, fontSize: '0.6875rem', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#818cf8' }}>
              COMPOSIÇÃO DA FATURA {faturaTooltip.numero_fatura_produto_gravity ?? ''}
            </p>
            <p style={{ margin: 0, fontSize: '0.6875rem', color: 'var(--ws-muted)' }}>
              {faturaTooltip.competencia_fatura_produto_gravity ?? '—'} · {faturaTooltip.descricao_fatura_produto_gravity}
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {itensFaturaTooltip.length === 0 ? (
            <span style={{ fontSize: '0.75rem', color: 'var(--ws-muted)' }}>Carregando composição…</span>
          ) : (
            itensFaturaTooltip.map((item, idx) => (
              <div key={item.id_fatura_item_produto_gravity ?? idx} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                fontSize: '0.8125rem', padding: '0.375rem 0.5rem', borderRadius: '6px',
                background: 'rgba(255,255,255,0.02)',
              }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--ws-muted)' }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', flexShrink: 0, background: '#818cf8' }} />
                  {item.descricao_fatura_item_produto_gravity}
                  {item.quantidade_fatura_item_produto_gravity !== 1 && (
                    <span style={{ opacity: 0.6 }}> × {item.quantidade_fatura_item_produto_gravity}</span>
                  )}
                </span>
                <strong style={{ fontFamily: 'monospace', fontSize: '0.8125rem', color: 'var(--ws-text)' }}>
                  {formatarMoeda(item.valor_total_fatura_item_produto_gravity, item.moeda_fatura_item_produto_gravity)}
                </strong>
              </div>
            ))
          )}
        </div>

        <div style={{ marginTop: '0.75rem', paddingTop: '0.625rem', borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase', color: 'var(--ws-muted)' }}>Total da Fatura</span>
          <strong style={{ fontFamily: 'monospace', fontSize: '1.0625rem', fontWeight: 800, color: 'var(--ws-text)' }}>
            {formatarMoeda(faturaTooltip.valor_total_fatura_produto_gravity, faturaTooltip.moeda_fatura_produto_gravity)}
          </strong>
        </div>
      </div>
    )}
    </>
  )
}

export default FinanceiroWorkspace
