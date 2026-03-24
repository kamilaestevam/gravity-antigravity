import React, { useState } from 'react'
import { CreditCard, X, ArrowUp, FileXls, FileCsv, FileText, FilePdf, Code, PencilSimple, Trash, ArrowsClockwise } from '@phosphor-icons/react'
import { BotaoGlobal } from '@nucleo/botao-global'
import { TabelaGlobal, type TabelaGlobalColuna, type TabelaGlobalAcao, type TabelaExportAcao } from '@nucleo/tabela-global'
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
  SaaS:  '#38bdf8',
  Uso:   '#a78bfa',
  Setup: '#fb923c',
}

const mockProdutos: Produto[] = [
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

type Plan = { name: string; valor: string; renovacao: string }
const plans: Plan[] = [
  { name: 'Enterprise',   valor: 'R$ 2.499/mês', renovacao: '01/05/2025' },
  { name: 'Professional', valor: 'R$ 999/mês',   renovacao: '01/05/2025' },
  { name: 'Starter',      valor: 'R$ 299/mês',   renovacao: '01/05/2025' },
]

export function Assinaturas() {
  const [currentPlan, setCurrentPlan]   = useState(plans[0])
  const [showModal, setShowModal]       = useState(false)
  const [selectedPlan, setSelectedPlan] = useState(plans[0].name)
  const [produtos, setProdutos]         = useState<Produto[]>(mockProdutos)

  function handleUpgrade() {
    const p = plans.find(pl => pl.name === selectedPlan)!
    setCurrentPlan(p)
    setShowModal(false)
  }

  function handleSuspend(p: Produto) {
    const msg = p.status === 'Suspenso'
      ? `Reativar "${p.nome}"?`
      : `Suspender "${p.nome}"? O acesso será bloqueado imediatamente.`
    if (!window.confirm(msg)) return
    setProdutos(prev => prev.map(x => x.id === p.id
      ? { ...x, status: x.status === 'Suspenso' ? 'Ativo' : 'Suspenso' }
      : x
    ))
  }

  function handleDelete(p: Produto) {
    if (!window.confirm(`Cancelar a assinatura de "${p.nome}"? Esta ação não pode ser desfeita.`)) return
    setProdutos(prev => prev.filter(x => x.id !== p.id))
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
          <span style={{ display: 'inline-flex', padding: '0.2rem 0.625rem', borderRadius: '9999px', fontSize: '0.6875rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', background: c.bg, color: c.color, border: `1px solid ${c.border}` }}>
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
      icone: <ArrowsClockwise size={15} weight="bold" />,
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
          <ArrowsClockwise size={15} weight="bold" />
        </button>
      )
    },
    {
      id: 'edit',
      icone: <PencilSimple size={15} weight="bold" />,
      tooltip: 'Editar assinatura',
      onClick: () => {},
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
    <div className="ws-fade-up">
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.375rem', fontWeight: 700, color: 'var(--ws-text)', marginBottom: '0.25rem' }}>
          Assinaturas &amp; Planos
        </h1>
        <p style={{ fontSize: '0.875rem', color: 'var(--ws-muted)' }}>
          Gerencie seus planos, produtos contratados e upgrades.
        </p>
      </div>

      {/* Current plan card */}
      <div className="ws-plan-card ws-fade-up">
        <div>
          <p className="ws-section-title" style={{ marginBottom: '0.375rem' }}>
            <CreditCard weight="duotone" size={14} color="#38bdf8" />
            Plano Atual
          </p>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#38bdf8', marginBottom: '0.25rem' }}>
            {currentPlan.name}
          </h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--ws-muted)' }}>
            Renovação em <strong style={{ color: 'var(--ws-text)' }}>{currentPlan.renovacao}</strong>
          </p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <p style={{ fontSize: '1.875rem', fontWeight: 700, color: 'var(--ws-text)', marginBottom: '0.5rem' }}>
            {currentPlan.valor}
          </p>
          <BotaoGlobal
            variante="primario"
            icone={<ArrowUp weight="bold" size={14} />}
            onClick={() => setShowModal(true)}
          >
            Upgrade de Plano
          </BotaoGlobal>
        </div>
      </div>

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
          <div key={p.id} style={{
            background: 'var(--ws-surface)',
            border: '1px solid var(--ws-accent-border)',
            borderRadius: '12px',
            padding: '1.375rem',
            display: 'flex', flexDirection: 'column', gap: '0.625rem',
            transition: 'border-color 0.15s, box-shadow 0.15s',
          }}
          onMouseEnter={e => {
            const el = e.currentTarget
            el.style.borderColor = '#38bdf8'
            el.style.boxShadow = '0 0 0 1px rgba(56,189,248,0.15), 0 4px 16px rgba(0,0,0,0.3)'
          }}
          onMouseLeave={e => {
            const el = e.currentTarget
            el.style.borderColor = 'rgba(56,189,248,0.18)'
            el.style.boxShadow = 'none'
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

      {/* Upgrade modal */}
      {showModal && (
        <div className="ws-modal-overlay" onClick={() => setShowModal(false)}>
          <div className="ws-modal" onClick={e => e.stopPropagation()}>
            <button
              type="button"
              onClick={() => setShowModal(false)}
              style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ws-muted)' }}
            >
              <X weight="bold" size={18} />
            </button>
            <h3>Alterar Plano</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
              {plans.map(pl => (
                <label key={pl.name} style={{
                  display: 'flex', alignItems: 'center', gap: '0.875rem',
                  background: selectedPlan === pl.name ? 'rgba(56,189,248,0.08)' : 'rgba(255,255,255,0.03)',
                  border: `1px solid ${selectedPlan === pl.name ? '#38bdf8' : 'rgba(56,189,248,0.1)'}`,
                  borderRadius: '10px',
                  padding: '0.875rem 1rem',
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                }}>
                  <input
                    type="radio"
                    name="plan"
                    value={pl.name}
                    checked={selectedPlan === pl.name}
                    onChange={() => setSelectedPlan(pl.name)}
                    style={{ accentColor: '#38bdf8' }}
                  />
                  <div>
                    <p style={{ fontWeight: 700, color: 'var(--ws-text)', margin: '0 0 0.125rem' }}>{pl.name}</p>
                    <p style={{ fontSize: '0.8125rem', color: 'var(--ws-muted)', margin: 0 }}>{pl.valor}</p>
                  </div>
                  {pl.name === currentPlan.name && (
                    <span className="ws-badge ws-badge-accent" style={{ marginLeft: 'auto' }}>Atual</span>
                  )}
                </label>
              ))}
            </div>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <BotaoGlobal variante="primario" onClick={handleUpgrade}>
                Confirmar Alteração
              </BotaoGlobal>
              <BotaoGlobal variante="fantasma" onClick={() => setShowModal(false)}>
                Cancelar
              </BotaoGlobal>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
