import React, { useState, useEffect } from 'react'
import {
  Receipt, DownloadSimple, CalendarBlank, FileXls,
  ShoppingBagOpen, Tag, Users, CurrencyCircleDollar,
  Wrench, Sliders, Headset, Clock, Handshake, Infinity,
  Eye, Buildings
} from '@phosphor-icons/react'
import { BotaoGlobal } from '@nucleo/botao-global'
import { StatCardGlobal } from '@nucleo/card-global'
import { PaginaGlobal } from '@nucleo/pagina-global'
import { CabecalhoGlobal } from '@nucleo/cabecalho-global'
import { TabelaGlobal, type TabelaGlobalColuna, type TabelaGlobalAcao, type TabelaExportAcao } from '@nucleo/tabela-global'
import { ModalFormularioAbasGlobal } from '@nucleo/modal-formulario-abas-global'
import { SecaoFormularioGlobal } from '@nucleo/modal-formulario-global'
import { GeralCampoGlobal } from '@nucleo/campo-geral-global'
import { exportarExcel, type ColunasExport } from '../../services/exportService'
import { catalogService } from '../../services/catalogService'
import { ProdutoCatalogo, NegociacaoEspecial } from '../../types/entidades'
import { getSimboloMoeda } from '../../utils/formatters'
import { getAcoesExportacaoPadrao } from '../../utils/exportHelper'


// ─── Tipos de Fatura (existente) ─────────────────────────────────────────────

type FaturaStatus = 'Pago' | 'Pendente' | 'Atrasado'

type ComposicaoItem = {
  item: string
  valor: string
  tipo?: 'base' | 'adicional' | 'desconto'
}

type Fatura = {
  id: string
  num: string
  competencia: string
  descricao: string
  valor: string
  vencimento: string
  status: FaturaStatus
  composicao: ComposicaoItem[]
}

const faturas: Fatura[] = [
  {
    id: 'f1', num: '#0042', competencia: 'Mar/2025', descricao: 'Mensalidade Plano Enterprise + Produtos', valor: 'R$ 3.247,00', vencimento: '05/04/2025', status: 'Pendente',
    composicao: [
      { item: 'Plano Enterprise', valor: 'R$ 2.499,00', tipo: 'base' },
      { item: 'SimulaCusto — 68 estimativas', valor: 'R$ 637,32', tipo: 'adicional' },
      { item: 'Smart Read — 45 documentos', valor: 'R$ 269,55', tipo: 'adicional' },
      { item: 'Desconto Fidelidade 5%', valor: '- R$ 158,87', tipo: 'desconto' },
    ]
  },
  {
    id: 'f2', num: '#0041', competencia: 'Fev/2025', descricao: 'Mensalidade Plano Enterprise', valor: 'R$ 2.499,00', vencimento: '05/03/2025', status: 'Pago',
    composicao: [
      { item: 'Plano Enterprise', valor: 'R$ 2.499,00', tipo: 'base' },
    ]
  },
  {
    id: 'f3', num: '#0040', competencia: 'Jan/2025', descricao: 'Mensalidade Plano Enterprise', valor: 'R$ 2.499,00', vencimento: '05/02/2025', status: 'Pago',
    composicao: [
      { item: 'Plano Enterprise', valor: 'R$ 2.499,00', tipo: 'base' },
    ]
  },
  {
    id: 'f4', num: '#0039', competencia: 'Dez/2024', descricao: 'Plano Enterprise + SimulaCusto Setup', valor: 'R$ 2.748,00', vencimento: '05/01/2025', status: 'Pago',
    composicao: [
      { item: 'Plano Enterprise', valor: 'R$ 2.499,00', tipo: 'base' },
      { item: 'SimulaCusto — Taxa de Setup', valor: 'R$ 249,00', tipo: 'adicional' },
    ]
  },
  {
    id: 'f5', num: '#0035', competencia: 'Ago/2024', descricao: 'Mensalidade Plano Professional', valor: 'R$ 999,00', vencimento: '05/09/2024', status: 'Atrasado',
    composicao: [
      { item: 'Plano Professional', valor: 'R$ 999,00', tipo: 'base' },
    ]
  },
]

const statusBadge: Record<FaturaStatus, string> = {
  Pago:     'ws-badge-success',
  Pendente: 'ws-badge-warning',
  Atrasado: 'ws-badge-danger',
}

// ─── Nome da Organização atual (simulado) ────────────────────────────────────

const ORG_ATUAL = 'Importas SA'

// ─── Componente Principal ────────────────────────────────────────────────────

export function Financeiro() {
  // === Faturas
  const vencimento = faturas.find(f => f.status === 'Pendente')
  const emAberto  = faturas.filter(f => f.status === 'Pendente' || f.status === 'Atrasado')
  const valorAberto = emAberto.reduce((acc, f) => {
    const n = parseFloat(f.valor.replace('R$ ', '').replace('.', '').replace(',', '.'))
    return acc + n
  }, 0)

  function handleDownload(tipo: string, num: string) {
    alert(`Download de ${tipo} ${num} — funcionalidade disponível quando o backend estiver conectado.`)
  }

  // === Produtos do Catálogo (Admin)
  const [produtos, setProdutos] = useState<ProdutoCatalogo[]>([])
  const [negociacoes, setNegociacoes] = useState<NegociacaoEspecial[]>([])
  const [produtoVisualizando, setProdutoVisualizando] = useState<ProdutoCatalogo | null>(null)

  useEffect(() => {
    setProdutos(catalogService.getProdutos().filter(p => p.status === 'Ativo'))
    setNegociacoes(catalogService.getNegociacoes())
  }, [])

  // Negociações para a organização atual
  const negociacoesOrg = negociacoes.filter(n => n.tenantNome === ORG_ATUAL)

  // Busca se um produto tem negociação para esta org
  const getNegociacao = (produtoId: string): NegociacaoEspecial | undefined => {
    return negociacoesOrg.find(n => n.produtoId === produtoId)
  }

  // === Tooltip de Valor (hover)
  const [valorTooltipAberto, setValorTooltipAberto] = useState<string | null>(null)
  const [tooltipPos, setTooltipPos] = useState<{ top: number; left: number }>({ top: 0, left: 0 })
  const hoverTimeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null)

  const mostrarTooltipValor = (faturaId: string, triggerEl: HTMLElement) => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current)
    const rect = triggerEl.getBoundingClientRect()
    setTooltipPos({
      top: rect.bottom + 8,
      left: Math.max(16, rect.right - 360),
    })
    setValorTooltipAberto(faturaId)
  }

  const esconderTooltipValor = () => {
    hoverTimeoutRef.current = setTimeout(() => {
      setValorTooltipAberto(null)
    }, 200) // delay para permitir mover o mouse até o popover
  }

  const manterTooltipAberto = () => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current)
  }

  // Fecha tooltip ao scrollar
  useEffect(() => {
    if (!valorTooltipAberto) return
    const handler = () => setValorTooltipAberto(null)
    window.addEventListener('scroll', handler, true)
    return () => window.removeEventListener('scroll', handler, true)
  }, [valorTooltipAberto])

  // Fatura ativa para tooltip
  const faturaTooltip = valorTooltipAberto ? faturas.find(f => f.id === valorTooltipAberto) : null

  // === Abas de Visualização (Tab ativa)
  const [tabAtiva, setTabAtiva] = useState<'faturas' | 'produtos'>('faturas')

  // ─── Colunas Faturas ─────────────────────────────────────────────────────────

  const COLUNAS_FATURAS: TabelaGlobalColuna<Fatura>[] = [
    {
      key: 'num', label: '#', tipo: 'texto', align: 'center',
      tooltipTitulo: 'Número da Fatura', tooltipDescricao: 'Identificador único.',
      render: (v) => <code style={{ fontSize: '0.8125rem', color: '#818cf8', background: 'rgba(129,140,248,0.08)', padding: '0.125rem 0.4rem', borderRadius: '4px' }}>{v}</code>
    },
    {
      key: 'competencia', label: 'Competência', tipo: 'texto',
      tooltipTitulo: 'Mês/Ano', tooltipDescricao: 'Período de faturamento da fatura.',
      render: (v) => <span style={{ fontWeight: 600 }}>{v}</span>
    },
    {
      key: 'descricao', label: 'Descrição', tipo: 'texto',
      tooltipTitulo: 'Serviços Cobrados', tooltipDescricao: 'Resumo dos produtos em uso.',
      render: (v) => <span style={{ color: 'var(--ws-muted)', maxWidth: '260px', display: 'inline-block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{v}</span>
    },
    {
      key: 'valor', label: 'Valor', tipo: 'texto',
      tooltipTitulo: 'Valor a Pagar', tooltipDescricao: 'Passe o mouse para ver a composição detalhada.',
      render: (v, item) => (
        <span
          className="valor-tooltip-trigger"
          onMouseEnter={(e) => mostrarTooltipValor(item.id, e.currentTarget)}
          onMouseLeave={() => esconderTooltipValor()}
          style={{
            fontFamily: 'monospace', fontWeight: 700, color: 'var(--ws-text)', fontSize: '0.9375rem',
            background: valorTooltipAberto === item.id ? 'rgba(129,140,248,0.12)' : 'transparent',
            border: `1px solid ${valorTooltipAberto === item.id ? 'rgba(129,140,248,0.3)' : 'transparent'}`,
            borderRadius: '6px', padding: '0.25rem 0.5rem', cursor: 'default',
            transition: 'all 0.15s', display: 'inline-block',
          }}
        >
          {v}
        </span>
      )
    },
    {
      key: 'vencimento', label: 'Vencimento', tipo: 'texto',
      tooltipTitulo: 'Dia do Vencimento', tooltipDescricao: 'Data limite para pagamento.',
      render: (v, item) => <span style={{ color: item.status === 'Atrasado' ? '#f87171' : 'var(--ws-muted)' }}>{v}</span>
    },
    {
      key: 'status', label: 'Status', tipo: 'texto',
      tooltipTitulo: 'Status da Fatura', tooltipDescricao: 'Qual a situação atual do boleto.',
      render: (v) => <span className={`ws-badge ${statusBadge[v as FaturaStatus]}`}>{v}</span>
    }
  ]

  const ACOES_EXPORT_FATURAS: TabelaExportAcao<Fatura>[] = [
    { label: 'Excel (.xlsx)', icone: <FileXls size={14} weight="bold" />, onClick: (dados) => void exportarExcel(dados as any, COLUNAS_FATURAS as any, { nomeArquivo: 'faturas', titulo: 'Histórico de Faturas' }) },
  ]

  // ─── Colunas Produtos (Catálogo Padrão — igual ao Admin) ─────────────────────

  const COLUNAS_PRODUTOS: TabelaGlobalColuna<ProdutoCatalogo>[] = [
    {
      key: 'nome', label: 'Produto', tipo: 'texto',
      tooltipTitulo: 'Produto Contratado', tooltipDescricao: 'Identificação do serviço cadastrado no catálogo Gravity.',
      render: (v) => <span style={{ fontWeight: 600, color: 'var(--ws-text)' }}>{v}</span>
    },
    {
      key: 'tipoCobranca', label: 'Cobrança', tipo: 'texto',
      tooltipTitulo: 'Tipo de Cobrança', tooltipDescricao: 'Métrica usada para cobrança deste produto.',
      render: (v) => (
        <span style={{
          display: 'inline-flex', padding: '0.175rem 0.5rem', borderRadius: '9999px',
          fontSize: '0.6875rem', fontWeight: 700, background: 'rgba(129,140,248,0.08)',
          color: '#818cf8', border: '1px solid rgba(129,140,248,0.15)',
          textTransform: 'uppercase', letterSpacing: '0.04em',
        }}>{v}</span>
      )
    },
    {
      key: 'precoUnitario', label: 'Valor Unitário', tipo: 'texto',
      tooltipTitulo: 'Preço Base', tooltipDescricao: 'Valor cobrado por unidade ou uso adicional além da franquia.',
      render: (v, item) => {
        if (item.faixasPreco && item.faixasPreco.length > 0) {
          return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              <span style={{ fontWeight: 700, color: '#818cf8', fontSize: '0.8125rem' }}>Ver Camadas ({item.faixasPreco.length})</span>
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
      tooltipTitulo: 'Franquia Inclusa', tooltipDescricao: 'Quantidade de uso incluída sem cobrança adicional.',
      render: (v, item) => (
        <span style={{ color: item.qtdUsuariosBase ? '#34d399' : 'var(--ws-muted)', fontSize: '0.85rem', fontWeight: item.qtdUsuariosBase ? 600 : 400 }}>
          {item.qtdUsuariosBase ? `${item.qtdUsuariosBase} ${item.tipoCobranca.replace('Por ', '')}s` : 'Zero'}
        </span>
      )
    },
    {
      key: 'limiteUsuarios', label: 'Usuários', tipo: 'texto',
      tooltipTitulo: 'Configuração de Usuários', tooltipDescricao: 'Verificação do limite de usuários do produto.',
      render: (v, item) => (
        <span style={{ color: 'var(--ws-muted)', fontSize: '0.85rem' }}>
          {v === 'ilimitada' ? '∞ Ilimitados' : `${item.qtdUsuariosBase ?? 0} usuários`}
        </span>
      )
    },
    {
      key: 'horasHelpDesk', label: 'Help Desk', tipo: 'texto',
      tooltipTitulo: 'Suporte Técnico', tooltipDescricao: 'Horas mensais de help desk incluídas.',
      render: (v) => (
        <span style={{ color: Number(v) > 0 ? '#fbbf24' : 'var(--ws-muted)', fontSize: '0.85rem', fontWeight: Number(v) > 0 ? 600 : 400 }}>
          {Number(v) > 0 ? `${v}h/mês` : 'Não incluso'}
        </span>
      )
    },
    {
      key: 'id', label: 'Negociação', tipo: 'texto',
      tooltipTitulo: 'Acordo Especial', tooltipDescricao: 'Verifica se esta organização possui condições exclusivas.',
      render: (_v, item) => {
        const neg = getNegociacao(item.id)
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
      }
    }
  ]

  const ACOES_PRODUTOS: TabelaGlobalAcao<ProdutoCatalogo>[] = [
    {
      id: 'ver-detalhes',
      icone: <Eye weight="bold" size={15} />,
      tooltip: 'Ver Detalhes do Produto',
      onClick: (item) => setProdutoVisualizando(item),
      renderCustom: (item) => (
        <button
          type="button"
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); setProdutoVisualizando(item) }}
          title="Ver detalhes"
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 28, height: 28, borderRadius: '50%', background: 'transparent', border: '1px solid transparent', color: '#64748b', cursor: 'pointer', transition: 'all 0.15s', flexShrink: 0 }}
          onMouseEnter={ev => { ev.currentTarget.style.background = 'rgba(129,140,248,0.12)'; ev.currentTarget.style.borderColor = 'rgba(129,140,248,0.3)'; ev.currentTarget.style.color = '#818cf8' }}
          onMouseLeave={ev => { ev.currentTarget.style.background = 'transparent'; ev.currentTarget.style.borderColor = 'transparent'; ev.currentTarget.style.color = '#64748b' }}
        >
          <Eye size={16} weight="bold" />
        </button>
      )
    }
  ]

  // ─── Campo Somente-Leitura Helper ──────────────────────────────────────────

  const ReadOnlyField = ({ label, value, icon }: { label: string; value: React.ReactNode; icon?: React.ReactNode }) => (
    <GeralCampoGlobal label={label}>
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
    </GeralCampoGlobal>
  )

  // ─── Negociação para o produto em visualização ─────────────────────────────

  const negProdutoAtual = produtoVisualizando ? getNegociacao(produtoVisualizando.id) : undefined

  // ─── Render ────────────────────────────────────────────────────────────────

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
          titulo="Financeiro"
          subtitulo="Acompanhe faturas, boletos e notas fiscais da sua conta Gravity."
          icone={<Receipt weight="duotone" size={22} color="#818cf8" />}
        />
      }
      stats={
        <>
          <StatCardGlobal
            titulo="Próximo Vencimento"
            icone={<CalendarBlank weight="duotone" size={16} />}
            valor={<span style={{ fontSize: '1.5rem' }}>{vencimento?.vencimento ?? '—'}</span>}
            subtexto={vencimento?.competencia ?? 'Sem faturas abertas'}
            tooltip={
              <>
                <p className="cg-tooltip__title">DETALHES DA FATURA</p>
                <div className="cg-tooltip__row">
                  <span>Fatura Nº</span>
                  <strong>{vencimento?.num ?? '—'}</strong>
                </div>
                <div className="cg-tooltip__row">
                  <span>Valor esperado</span>
                  <strong>{vencimento?.valor ?? '—'}</strong>
                </div>
              </>
            }
          />
          <StatCardGlobal
            titulo="Valor a Pagar"
            valor={<span style={{ fontSize: '1.5rem' }}>{emAberto.length ? `R$ ${valorAberto.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : 'R$ 0,00'}</span>}
            variante={emAberto.length ? 'aviso' : 'sucesso'}
            tooltip={
              <>
                <p className="cg-tooltip__title">COMPOSIÇÃO DO VALOR</p>
                <div className="cg-tooltip__row">
                  <span>Faturas pendentes</span>
                  <strong>{emAberto.filter(f => f.status === 'Pendente').length}</strong>
                </div>
                <div className="cg-tooltip__row">
                  <span>Faturas atrasadas</span>
                  <strong>{emAberto.filter(f => f.status === 'Atrasado').length}</strong>
                </div>
              </>
            }
          />
          <StatCardGlobal
            titulo="Faturas em Aberto"
            valor={<span style={{ fontSize: '1.75rem' }}>{emAberto.length}</span>}
            subtexto={emAberto.length === 0 ? 'Tudo em dia 🎉' : 'Requer atenção'}
            variante={emAberto.length > 0 ? 'perigo' : 'sucesso'}
            tooltip={
              <>
                <p className="cg-tooltip__title">SITUAÇÃO GERAL</p>
                <div className="cg-tooltip__row">
                  <span>Total lançadas</span>
                  <strong>{faturas.length}</strong>
                </div>
                <div className="cg-tooltip__row">
                  <span>Faturas pagas</span>
                  <strong>{faturas.filter(x => x.status === 'Pago').length}</strong>
                </div>
              </>
            }
          />
        </>
      }
      toolbar={
        <div className="ws-tabs" style={{ margin: 0 }}>
          <button className={`ws-tab${tabAtiva === 'faturas' ? ' active' : ''}`} onClick={() => setTabAtiva('faturas')}>
            Histórico de Faturas
          </button>
          <button className={`ws-tab${tabAtiva === 'produtos' ? ' active' : ''}`} onClick={() => setTabAtiva('produtos')}>
            Produtos & Valores
          </button>
        </div>
      }
    >

      {/* ═══════ ABA 1: HISTÓRICO DE FATURAS ═══════ */}
      {tabAtiva === 'faturas' && (
        <div className="ws-fade-up">
          <p className="ws-section-title ws-fade-up ws-fade-up-d2" style={{ margin: 0, marginBottom: '16px' }}>
            <Receipt weight="duotone" size={14} color="#818cf8" />
            Histórico de Faturas
          </p>
          <div style={{ position: 'relative', zIndex: 10, marginBottom: '2rem' }}>
            <TabelaGlobal<Fatura>
              dados={faturas}
              colunas={COLUNAS_FATURAS}
              acoesExportacao={getAcoesExportacaoPadrao(COLUNAS_FATURAS, 'dados_tabela', 'Exportação de Dados')}
              acoes={[
                {
                  id: 'boleto', icone: <DownloadSimple weight="bold" size={15} />, tooltip: 'Baixar Boleto',
                  onClick: (f) => handleDownload('Boleto', f.num),
                },
                {
                  id: 'nfe', icone: <DownloadSimple weight="bold" size={15} />, tooltip: 'Baixar NF-e',
                  onClick: (f) => handleDownload('NF-e', f.num),
                }
              ]}
              mensagemVazio="Nenhuma fatura encontrada."
              mensagemSemFiltro="Sem faturas geradas."
            />
          </div>

          {/* Info card */}
          <div style={{
            background: 'rgba(129,140,248,0.06)',
            border: '1px solid rgba(129,140,248,0.15)',
            borderRadius: '10px',
            padding: '1rem 1.25rem',
            fontSize: '0.8125rem',
            color: 'var(--ws-muted)',
            lineHeight: 1.6,
          }}>
            💡 <strong style={{ color: 'var(--ws-text)' }}>Segunda via</strong> — O download de boletos e NF-e fica disponível após conectar o backend de cobrança. Para dúvidas, contate <strong style={{ color: '#818cf8' }}>financeiro@gravity.com.br</strong>.
          </div>
        </div>
      )}

      {/* ═══════ ABA 2: PRODUTOS & VALORES (Dados vindos do Admin) ═══════ */}
      {tabAtiva === 'produtos' && (
        <div className="ws-fade-up">
          {/* Info: Negociação especial ativa */}
          {negociacoesOrg.length > 0 && (
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
                  Sua organização (<strong style={{ color: 'var(--ws-text)' }}>{ORG_ATUAL}</strong>) possui {negociacoesOrg.length} acordo(s) especial(is) com condições exclusivas de preço.
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
              dados={produtos}
              colunas={COLUNAS_PRODUTOS}
              acoes={ACOES_PRODUTOS}
              mensagemVazio="Nenhum produto disponível no catálogo."
              mensagemSemFiltro="Sem produtos cadastrados."
            
        acoesExportacao={getAcoesExportacaoPadrao(COLUNAS_PRODUTOS, 'dados_tabela', 'Exportação de Dados')}
      />
          </div>

          {/* Legenda */}
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

    {/* ═══════ MODAL: VISUALIZAÇÃO DETALHADA DO PRODUTO (Read-Only, mesmas abas do Admin) ═══════ */}
    <ModalFormularioAbasGlobal
      aberto={!!produtoVisualizando}
      aoFechar={() => setProdutoVisualizando(null)}
      aoSalvar={() => setProdutoVisualizando(null)}
      icone={<ShoppingBagOpen weight="duotone" size={24} />}
      titulo={produtoVisualizando ? `${produtoVisualizando.nome}` : ''}
      subtitulo="Detalhes do produto conforme configurado no catálogo Gravity."
      tamanho="lg"
      dirty={false}
      podesSalvar={true}
      abas={[
        // ── ABA 1: Dados Básicos ──
        {
          id: 'dados-basicos',
          rotulo: 'Dados Básicos',
          conteudo: produtoVisualizando ? (
            <div style={{ padding: '1rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <SecaoFormularioGlobal icone={<Tag size={16} weight="duotone" />} titulo="Dados Básicos" tooltip="Identificação do produto no catálogo Gravity" />

              <ReadOnlyField label="Nome do Produto" value={produtoVisualizando.nome} icon={<ShoppingBagOpen size={16} />} />
              <ReadOnlyField label="Descrição Curta" value={produtoVisualizando.descricao} icon={<Tag size={16} />} />

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <ReadOnlyField label="Data de Lançamento" value={produtoVisualizando.dataLancamento || '—'} icon={<CalendarBlank size={16} />} />
                <ReadOnlyField label="Status" value={
                  <span style={{
                    display: 'inline-flex', padding: '0.2rem 0.625rem', borderRadius: '9999px',
                    fontSize: '0.6875rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em',
                    background: produtoVisualizando.status === 'Ativo' ? 'rgba(52,211,153,0.12)' : 'rgba(248,113,113,0.12)',
                    color: produtoVisualizando.status === 'Ativo' ? '#34d399' : '#f87171',
                    border: `1px solid ${produtoVisualizando.status === 'Ativo' ? 'rgba(52,211,153,0.25)' : 'rgba(248,113,113,0.25)'}`,
                  }}>
                    {produtoVisualizando.status.toUpperCase()}
                  </span>
                } />
              </div>

              {produtoVisualizando.moduloBackend && (
                <ReadOnlyField label="Módulo Backend (Slug)" value={
                  <code style={{ color: '#8b5cf6', fontSize: '0.8125rem' }}>{produtoVisualizando.moduloBackend}</code>
                } />
              )}
            </div>
          ) : null
        },
        // ── ABA 2: Setup ──
        {
          id: 'setup',
          rotulo: 'Setup',
          conteudo: produtoVisualizando ? (
            <div style={{ padding: '1rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <SecaoFormularioGlobal icone={<Wrench size={16} weight="duotone" />} titulo="Setup" />

              <ReadOnlyField label="Tem Setup?" value={
                <span style={{
                  padding: '0.2rem 0.625rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 600,
                  background: produtoVisualizando.temSetup ? 'rgba(16,185,129,0.12)' : 'rgba(255,255,255,0.05)',
                  color: produtoVisualizando.temSetup ? '#10b981' : 'var(--ws-muted)',
                  border: `1px solid ${produtoVisualizando.temSetup ? 'rgba(16,185,129,0.25)' : 'rgba(255,255,255,0.08)'}`,
                }}>
                  {produtoVisualizando.temSetup ? 'Sim' : 'Não'}
                </span>
              } />

              {produtoVisualizando.temSetup && produtoVisualizando.precoSetup && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <ReadOnlyField label="Moeda do Setup" value={produtoVisualizando.precoSetup.moeda} icon={<CurrencyCircleDollar size={16} />} />
                  <ReadOnlyField label="Valor do Setup" value={`${getSimboloMoeda(produtoVisualizando.precoSetup.moeda)} ${produtoVisualizando.precoSetup.valor}`} />
                </div>
              )}

              {!produtoVisualizando.temSetup && (
                <div style={{
                  padding: '2rem', borderRadius: '10px', textAlign: 'center',
                  background: 'rgba(255,255,255,0.01)', border: '2px dashed rgba(255,255,255,0.04)',
                }}>
                  <Wrench size={28} weight="duotone" style={{ opacity: 0.3, marginBottom: '0.5rem' }} />
                  <p style={{ margin: 0, fontSize: '0.8125rem', color: 'var(--ws-muted)' }}>Este produto não requer setup — ativação instantânea.</p>
                </div>
              )}
            </div>
          ) : null
        },
        // ── ABA 3: Valor do Produto ──
        {
          id: 'valor-produto',
          rotulo: 'Valor do Produto',
          conteudo: produtoVisualizando ? (
            <div style={{ padding: '1rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <SecaoFormularioGlobal icone={<Sliders size={16} weight="duotone" />} titulo="Valores do Produto" />

              <ReadOnlyField label="Tipo de Cobrança" value={produtoVisualizando.tipoCobranca} icon={<Sliders size={16} />} />

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <ReadOnlyField label="Moeda" value={produtoVisualizando.precoUnitario.moeda} icon={<CurrencyCircleDollar size={16} />} />
                <ReadOnlyField label="Franquia Free (Qtd)" value={
                  produtoVisualizando.qtdUsuariosBase
                    ? <span style={{ color: '#34d399', fontWeight: 600 }}>{produtoVisualizando.qtdUsuariosBase}</span>
                    : <span style={{ color: 'var(--ws-muted)' }}>Zero</span>
                } icon={<Tag size={16} />} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                <ReadOnlyField label="Valor Unitário" value={`${getSimboloMoeda(produtoVisualizando.precoUnitario.moeda)} ${produtoVisualizando.precoUnitario.valor}`} />
                <ReadOnlyField label="Valor Mínimo" value={`${getSimboloMoeda(produtoVisualizando.precoMinimo.moeda)} ${produtoVisualizando.precoMinimo.valor}`} />
                <ReadOnlyField label="Valor Total" value={
                  produtoVisualizando.precoTotal
                    ? `${getSimboloMoeda(produtoVisualizando.precoTotal.moeda)} ${produtoVisualizando.precoTotal.valor}`
                    : '—'
                } />
              </div>

              {/* Faixas de Preço (Tiers) */}
              {produtoVisualizando.faixasPreco && produtoVisualizando.faixasPreco.length > 0 && (
                <div style={{ marginTop: '0.5rem', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '1.25rem' }}>
                  <p style={{ margin: '0 0 1rem 0', fontSize: '0.875rem', fontWeight: 600, color: 'var(--ws-text)', display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                    <Sliders size={18} weight="duotone" color="var(--color-primary)" /> Configuração de Camadas (Tiers)
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {produtoVisualizando.faixasPreco.map((fx, idx) => (
                      <div key={fx.id} style={{
                        display: 'grid', gridTemplateColumns: '1fr 1fr 1.5fr', gap: '12px', alignItems: 'center',
                        background: 'rgba(255,255,255,0.03)', padding: '0.75rem 1rem', borderRadius: '10px',
                        border: '1px solid rgba(255,255,255,0.05)',
                      }}>
                        <div>
                          <span style={{ fontSize: '0.6875rem', color: 'var(--ws-muted)', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.04em' }}>De</span>
                          <p style={{ margin: 0, fontSize: '0.9375rem', fontWeight: 600, color: 'var(--ws-text)' }}>{fx.de}</p>
                        </div>
                        <div>
                          <span style={{ fontSize: '0.6875rem', color: 'var(--ws-muted)', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.04em' }}>Até</span>
                          <p style={{ margin: 0, fontSize: '0.9375rem', fontWeight: 600, color: 'var(--ws-text)' }}>{fx.ate ?? '∞'}</p>
                        </div>
                        <div>
                          <span style={{ fontSize: '0.6875rem', color: 'var(--ws-muted)', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.04em' }}>Valor</span>
                          <p style={{ margin: 0, fontSize: '0.9375rem', fontWeight: 700, color: '#818cf8' }}>{getSimboloMoeda(fx.moeda)} {fx.valor}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : null
        },
        // ── ABA 4: Usuários ──
        {
          id: 'usuarios',
          rotulo: 'Usuários',
          conteudo: produtoVisualizando ? (
            <div style={{ padding: '1rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <SecaoFormularioGlobal icone={<Users size={16} weight="duotone" />} titulo="Usuários" />

              <ReadOnlyField label="Quantidade de Usuários" value={
                <span style={{
                  padding: '0.2rem 0.625rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 600,
                  background: produtoVisualizando.limiteUsuarios === 'ilimitada' ? 'rgba(129,140,248,0.12)' : 'rgba(16,185,129,0.12)',
                  color: produtoVisualizando.limiteUsuarios === 'ilimitada' ? '#818cf8' : '#10b981',
                  border: `1px solid ${produtoVisualizando.limiteUsuarios === 'ilimitada' ? 'rgba(129,140,248,0.25)' : 'rgba(16,185,129,0.25)'}`,
                }}>
                  {produtoVisualizando.limiteUsuarios === 'ilimitada' ? '∞ Ilimitada' : 'Limitada'}
                </span>
              } />

              {produtoVisualizando.limiteUsuarios === 'limitada' && (
                <>
                  <ReadOnlyField label="Quantidade" value={produtoVisualizando.qtdUsuariosBase ?? '—'} icon={<Users size={16} />} />

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <ReadOnlyField label="Moeda" value={produtoVisualizando.precoUsuarioAdicional?.moeda ?? 'BRL'} icon={<CurrencyCircleDollar size={16} />} />
                    <ReadOnlyField label="Valor por Usuário Adicional" value={
                      produtoVisualizando.precoUsuarioAdicional
                        ? `${getSimboloMoeda(produtoVisualizando.precoUsuarioAdicional.moeda)} ${produtoVisualizando.precoUsuarioAdicional.valor}`
                        : `${getSimboloMoeda('BRL')} 0,00`
                    } />
                  </div>
                </>
              )}
            </div>
          ) : null
        },
        // ── ABA 5: Help Desk ──
        {
          id: 'help-desk',
          rotulo: 'Help Desk',
          conteudo: produtoVisualizando ? (
            <div style={{ padding: '1rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <SecaoFormularioGlobal icone={<Headset size={16} weight="duotone" />} titulo="Help Desk" />

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <ReadOnlyField label="Total de Horas Mensais" value={
                  produtoVisualizando.horasHelpDesk > 0
                    ? <span style={{ color: '#fbbf24', fontWeight: 600 }}>{produtoVisualizando.horasHelpDesk}h/mês</span>
                    : <span style={{ color: 'var(--ws-muted)' }}>Não incluso</span>
                } icon={<Clock size={16} />} />
                <ReadOnlyField label="Moeda do Adicional por Hora" value={produtoVisualizando.precoHoraAdicional?.moeda ?? 'BRL'} icon={<CurrencyCircleDollar size={16} />} />
              </div>

              {produtoVisualizando.horasHelpDesk === 0 && (
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
          ) : null
        },
        // ── ABA 6: Negociação ──
        {
          id: 'negociacao',
          rotulo: 'Negociação',
          conteudo: produtoVisualizando ? (
            <div style={{ padding: '1rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <SecaoFormularioGlobal icone={<Handshake size={16} weight="duotone" />} titulo="Negociação Especial" tooltip="Condição de preço exclusiva para sua organização" />

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
                        Condição exclusiva para <strong style={{ color: 'var(--ws-text)' }}>{negProdutoAtual.tenantNome}</strong>
                      </p>
                    </div>
                  </div>

                  <ReadOnlyField label="Organização Vinculada" value={negProdutoAtual.tenantNome} icon={<Buildings size={16} />} />
                  <ReadOnlyField label="Condição Especial" value={negProdutoAtual.acordo} icon={<Handshake size={16} />} />
                  <ReadOnlyField label="Vigência" value={
                    negProdutoAtual.ilimitada ? (
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
                        {negProdutoAtual.inicio || '—'} até {negProdutoAtual.fim || '—'}
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
          ) : null
        },
      ]}
    />

    {/* ═══════ POPOVER FIXO: COMPOSIÇÃO DA FATURA (fora do container da tabela) ═══════ */}
    {faturaTooltip && (
      <>
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
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem', paddingBottom: '0.625rem', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <Receipt weight="duotone" size={16} color="#818cf8" />
            <div>
              <p style={{ margin: 0, fontSize: '0.6875rem', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#818cf8' }}>COMPOSIÇÃO DA FATURA {faturaTooltip.num}</p>
              <p style={{ margin: 0, fontSize: '0.6875rem', color: 'var(--ws-muted)' }}>{faturaTooltip.competencia} · {faturaTooltip.descricao}</p>
            </div>
          </div>

          {/* Itens */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {faturaTooltip.composicao.map((comp, idx) => (
              <div key={idx} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                fontSize: '0.8125rem', padding: '0.375rem 0.5rem', borderRadius: '6px',
                background: comp.tipo === 'desconto' ? 'rgba(52,211,153,0.04)' : 'rgba(255,255,255,0.02)',
              }}>
                <span style={{
                  display: 'flex', alignItems: 'center', gap: '6px',
                  color: comp.tipo === 'desconto' ? '#34d399' : 'var(--ws-muted)',
                }}>
                  <span style={{
                    width: 6, height: 6, borderRadius: '50%', flexShrink: 0,
                    background: comp.tipo === 'base' ? '#818cf8' : comp.tipo === 'desconto' ? '#34d399' : '#fbbf24',
                  }} />
                  {comp.item}
                </span>
                <strong style={{
                  fontFamily: 'monospace', fontSize: '0.8125rem',
                  color: comp.tipo === 'desconto' ? '#34d399' : 'var(--ws-text)',
                }}>
                  {comp.valor}
                </strong>
              </div>
            ))}
          </div>

          {/* Divider + Total */}
          <div style={{ marginTop: '0.75rem', paddingTop: '0.625rem', borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase', color: 'var(--ws-muted)' }}>Total da Fatura</span>
            <strong style={{ fontFamily: 'monospace', fontSize: '1.0625rem', fontWeight: 800, color: 'var(--ws-text)' }}>{faturaTooltip.valor}</strong>
          </div>

          {/* Legenda */}
          <div style={{ marginTop: '0.625rem', display: 'flex', gap: '1rem', fontSize: '0.625rem', color: 'var(--ws-muted)' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><span style={{ width: 6, height: 6, borderRadius: '50%', background: '#818cf8' }} /> Base</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><span style={{ width: 6, height: 6, borderRadius: '50%', background: '#fbbf24' }} /> Adicional</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><span style={{ width: 6, height: 6, borderRadius: '50%', background: '#34d399' }} /> Desconto</span>
          </div>
        </div>
      </>
    )}
    </>
  )
}
