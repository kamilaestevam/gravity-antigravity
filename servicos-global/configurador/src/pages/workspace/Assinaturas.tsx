import React, { useState } from 'react'
import { CreditCard, FileXls, FileCsv, FileText, FilePdf, Code, PencilSimple, Trash, PauseCircle, PlayCircle, Package, CurrencyDollar, WarningCircle } from '@phosphor-icons/react'
import { BotaoGlobal } from '@nucleo/botao-global'
import { StatCardGlobal } from '@nucleo/stat-card-global'
import { TabelaGlobal, type TabelaGlobalColuna, type TabelaGlobalAcao, type TabelaExportAcao } from '@nucleo/tabela-global'
import { CabecalhoGlobal } from '@nucleo/cabecalho-global'
import { PaginaGlobal } from '@nucleo/pagina-global'
import { ModalExclusao } from './ModalExclusao'
import { ModalEditarAssinatura } from './ModalEditarAssinatura'
import { exportarExcel, exportarCSV, exportarTXT, exportarXML, exportarJSON, exportarPDF, type ColunasExport } from '../../services/exportService'

type ProdutoStatus = 'Ativo' | 'Trial' | 'Suspenso'
type BillingType = 'SaaS' | 'Uso' | 'Setup'

export interface Produto {
  id: string
  nome: string
  status: ProdutoStatus
  billing: BillingType
  valor: string
  renovacao: string
}

const billingColor: Record<BillingType, string> = {
  SaaS:  '#818cf8',
  Uso:   '#a78bfa',
  Setup: '#fb923c',
}

export const mockProdutos: Produto[] = [
  { id: 'dash',     nome: 'Dashboard Global',     status: 'Ativo',   billing: 'SaaS',  valor: 'R$ 299/mês',  renovacao: '01/05/2025' },
  { id: 'ativ',     nome: 'Gestão de Atividades',  status: 'Ativo',   billing: 'SaaS',  valor: 'R$ 199/mês',  renovacao: '01/05/2025' },
  { id: 'simcusto', nome: 'SimulaCusto',           status: 'Ativo',   billing: 'Uso',   valor: 'R$ 0,15/sim', renovacao: 'Variável'   },
  { id: 'gabi',     nome: 'Gabi IA Assistant',     status: 'Trial',   billing: 'SaaS',  valor: 'R$ 499/mês',  renovacao: 'Em trial'   },
  { id: 'whats',    nome: 'WhatsApp Business',     status: 'Trial',   billing: 'SaaS',  valor: 'R$ 349/mês',  renovacao: 'Em trial'   },
  { id: 'erp',      nome: 'Conector ERP',          status: 'Suspenso',billing: 'SaaS',  valor: 'R$ 599/mês',  renovacao: 'Suspenso'  },
]

const upsellProducts = [
  { id: 'help', nome: 'Helpdesk Premium', desc: 'Tickets com SLA e relatórios para seus clientes.',    valor: 'R$ 249/mês', billing: 'SaaS' as BillingType },
  { id: 'nfe',  nome: 'NF-e Automático',  desc: 'Emissão automática de notas fiscais via gateway.',     valor: 'R$ 159/mês', billing: 'Uso'  as BillingType },
  { id: 'bi',   nome: 'BI Analytics Pro', desc: 'Dashboards avançados com drill-down e exportação.',    valor: 'R$ 399/mês', billing: 'SaaS' as BillingType },
]

export function Assinaturas() {
  const [produtos, setProdutos]         = useState<Produto[]>(mockProdutos)
  const [produtoParaExcluir, setProdutoParaExcluir] = useState<Produto | null>(null)
  const [produtoParaSuspender, setProdutoParaSuspender] = useState<Produto | null>(null)
  const [produtoEditando, setProdutoEditando] = useState<Produto | null>(null)

  const totalAtivos = produtos.filter(p => p.status === 'Ativo' || p.status === 'Trial').length
  const totalSuspensos = produtos.filter(p => p.status === 'Suspenso').length
  
  const custoSaaSAtivos = produtos
    .filter(p => (p.status === 'Ativo' || p.status === 'Trial') && p.billing === 'SaaS')
    .reduce((acc, p) => {
      const vStr = p.valor.replace('R$ ', '').replace('/mês', '').replace('.', '').replace(',', '.')
      const v = parseFloat(vStr)
      return acc + (isNaN(v) ? 0 : v)
    }, 0)

  function handleSuspend(p: Produto) {
    setProdutoParaSuspender(p)
  }

  function confirmarSuspensao() {
    if (!produtoParaSuspender) return
    setProdutos(prev => prev.map(x => x.id === produtoParaSuspender.id
      ? { ...x, status: x.status === 'Suspenso' ? 'Ativo' : 'Suspenso' }
      : x
    ))
    setProdutoParaSuspender(null)
  }

  function handleDelete(p: Produto) {
    setProdutoParaExcluir(p)
  }

  function confirmarExclusao() {
    if (!produtoParaExcluir) return
    setProdutos(prev => prev.filter(x => x.id !== produtoParaExcluir.id))
    setProdutoParaExcluir(null)
  }

  // ── Colunas da TabelaGlobal ───────────────────────────────────────────────────
  const COLUNAS: TabelaGlobalColuna<Produto>[] = [
    {
      key: 'nome', label: 'Produto', tipo: 'texto',
      tooltipTitulo: 'Produto Contratado',
      tooltipDescricao: 'Nome do módulo ou serviço ativo na plataforma.',
      render: (v) => (
        <span style={{ fontWeight: 600 }}>{v}</span>
      )
    },
    {
      key: 'billing', label: 'Cobrança', tipo: 'texto',
      tooltipTitulo: 'Modelo de Cobrança',
      tooltipDescricao: 'SaaS = mensalidade; Uso = por consumo; Setup = implantação.',
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
      key: 'valor', label: 'Valor', tipo: 'texto',
      tooltipTitulo: 'Valor do Produto',
      tooltipDescricao: 'Preço cobrado por ciclo ou unidade de consumo.',
      render: (v) => <span style={{ fontFamily: 'monospace', color: 'var(--ws-muted)', fontSize: '0.875rem' }}>{v}</span>
    },
    {
      key: 'renovacao', label: 'Renovação', tipo: 'texto',
      tooltipTitulo: 'Data de Renovação',
      tooltipDescricao: 'Próxima data de cobrança ou renovação automática.',
      render: (v) => <span style={{ color: 'var(--ws-muted)' }}>{v}</span>
    },
    {
      key: 'status', label: 'Status', tipo: 'texto',
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
        <button
          type="button"
          title={item.status === 'Suspenso' ? 'Reativar' : 'Suspender'}
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
          titulo="Assinaturas & Planos"
          subtitulo="Gerencie seus planos, produtos contratados e upgrades"
        />
      }
      stats={
        <>
          <StatCardGlobal
            titulo="Produtos Ativos"
            icone={<Package weight="duotone" size={16} />}
            valor={<span style={{ fontSize: '1.5rem' }}>{totalAtivos}</span>}
            subtexto={produtos.length > 0 ? `${produtos.length} no total` : 'Sem produtos'}
            tooltip={
              <>
                <p className="scg-tooltip__title">STATUS DOS PRODUTOS</p>
                <div className="scg-tooltip__row">
                  <span>Ativos</span>
                  <strong>{produtos.filter(p => p.status === 'Ativo').length}</strong>
                </div>
                <div className="scg-tooltip__row">
                  <span>Em Trial</span>
                  <strong>{produtos.filter(p => p.status === 'Trial').length}</strong>
                </div>
              </>
            }
          />
          <StatCardGlobal
            titulo="Custo Fixo Estimado"
            icone={<CurrencyDollar weight="duotone" size={16} />}
            valor={<span style={{ fontSize: '1.5rem' }}>R$ {custoSaaSAtivos.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>}
            subtexto="Mensalidade SaaS"
            tooltip={
              <>
                <p className="scg-tooltip__title">COMPOSIÇÃO DO CUSTO</p>
                <div className="scg-tooltip__row">
                  <span>SaaS (Ativo/Trial)</span>
                  <strong>R$ {custoSaaSAtivos.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong>
                </div>
                <div className="scg-tooltip__row">
                  <span>Custo por uso</span>
                  <strong>Variável</strong>
                </div>
              </>
            }
          />
          <StatCardGlobal
            titulo="Acessos Suspensos"
            icone={<WarningCircle weight="duotone" size={16} />}
            valor={<span style={{ fontSize: '1.75rem' }}>{totalSuspensos}</span>}
            subtexto={totalSuspensos === 0 ? 'Tudo operacional' : 'Requer atenção'}
            variante={totalSuspensos > 0 ? 'perigo' : 'padrao'}
            tooltip={
              <>
                <p className="scg-tooltip__title">ATENÇÃO</p>
                <div className="scg-tooltip__row">
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
        Produtos Contratados
      </p>
      <div style={{ marginBottom: '2rem' }}>
        <TabelaGlobal<Produto>
          dados={produtos}
          colunas={COLUNAS}
          acoes={ACOES}
          acoesExportacao={ACOES_EXPORT}
          mensagemVazio="Nenhum produto encontrado na busca."
          mensagemSemFiltro="Nenhum produto contratado."
        />
      </div>

      {/* Upsell cards */}
      <p className="ws-section-title ws-fade-up ws-fade-up-d2" style={{ marginBottom: '0.875rem' }}>
        Produtos Disponíveis para Contratar
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '1rem' }} className="ws-fade-up ws-fade-up-d2">
        {upsellProducts.map(p => (
          <div key={p.id} className="ux-pulse-card" style={{
            borderRadius: '12px',
            padding: '1.375rem',
            display: 'flex', flexDirection: 'column', gap: '0.625rem',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <p style={{ fontWeight: 700, fontSize: '0.9375rem', color: 'var(--ws-text)', margin: 0 }}>{p.nome}</p>
              <span style={{
                padding: '0.175rem 0.5rem', borderRadius: '9999px',
                fontSize: '0.6875rem', fontWeight: 700, lineHeight: 1,
                background: `${billingColor[p.billing]}18`,
                color: billingColor[p.billing],
                border: `1px solid ${billingColor[p.billing]}30`,
                textTransform: 'uppercase',
              }}>{p.billing}</span>
            </div>
            <p style={{ fontSize: '0.8125rem', color: 'var(--ws-muted)', lineHeight: 1.55, margin: 0 }}>{p.desc}</p>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0.25rem' }}>
              <span style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--ws-text)' }}>{p.valor}</span>
              <BotaoGlobal variante="primario" tamanho="pequeno">Contratar</BotaoGlobal>
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
      aberto={!!produtoParaSuspender}
      titulo={produtoParaSuspender?.status === 'Suspenso' ? 'Reativar Produto' : 'Suspender Produto'}
      descricao={<>Tem certeza de que deseja {produtoParaSuspender?.status === 'Suspenso' ? 'reativar' : 'suspender'} a assinatura de <strong>{produtoParaSuspender?.nome}</strong>?</>}
      nomeItem={produtoParaSuspender?.status === 'Suspenso' ? 'O acesso será reativado para todos os usuários.' : 'O acesso será bloqueado imediatamente para todos os usuários deste serviço.'}
      aoConfirmar={confirmarSuspensao}
      aoCancelar={() => setProdutoParaSuspender(null)}
    />

    <ModalEditarAssinatura
      produto={produtoEditando}
      aoFechar={() => setProdutoEditando(null)}
      aoSalvar={(dados) => {
        setProdutos(prev => prev.map(p => p.id === dados.id ? dados : p))
        setProdutoEditando(null)
      }}
    />
    </>
  )
}
