import React, { useState } from 'react'
import { CreditCard, X, ArrowUp } from '@phosphor-icons/react'
import { BotaoGlobal } from '@nucleo/botao-global'

type ProdutoStatus = 'Ativo' | 'Trial' | 'Suspenso'
type BillingType = 'SaaS' | 'Uso' | 'Setup'

type Produto = {
  id: string
  nome: string
  status: ProdutoStatus
  billing: BillingType
  valor: string
  renovacao?: string
}

const produtosContratados: Produto[] = [
  { id: 'dash',    nome: 'Dashboard Global',     status: 'Ativo',   billing: 'SaaS',  valor: 'R$ 299/mês',  renovacao: '01/05/2025' },
  { id: 'ativ',    nome: 'Gestão de Atividades',  status: 'Ativo',   billing: 'SaaS',  valor: 'R$ 199/mês',  renovacao: '01/05/2025' },
  { id: 'simcusto',nome: 'SimulaCusto',           status: 'Ativo',   billing: 'Uso',   valor: 'R$ 0,15/sim', renovacao: undefined   },
  { id: 'gabi',    nome: 'Gabi IA Assistant',     status: 'Trial',   billing: 'SaaS',  valor: 'R$ 499/mês',  renovacao: undefined   },
  { id: 'whats',   nome: 'WhatsApp Business',     status: 'Trial',   billing: 'SaaS',  valor: 'R$ 349/mês',  renovacao: undefined   },
]

const upsellProducts = [
  { id: 'erp',  nome: 'Conector ERP',    desc: 'Sincronização com Omie, TOTVS e SAP em tempo real.', valor: 'R$ 599/mês', billing: 'SaaS' as BillingType },
  { id: 'help', nome: 'Helpdesk Premium', desc: 'Tickets com SLA e relatórios para seus clientes.',    valor: 'R$ 249/mês', billing: 'SaaS' as BillingType },
  { id: 'nfe',  nome: 'NF-e Automático', desc: 'Emissão automática de notas fiscais via gateway.',     valor: 'R$ 159/mês + R$ 0,05/NF-e', billing: 'Uso' as BillingType },
]

const statusBadge: Record<ProdutoStatus, string> = {
  Ativo:    'ws-badge-success',
  Trial:    'ws-badge-warning',
  Suspenso: 'ws-badge-danger',
}

const billingColor: Record<BillingType, string> = {
  SaaS:  '#38bdf8',
  Uso:   '#a78bfa',
  Setup: '#fb923c',
}

type Plan = { name: string; valor: string; renovacao: string }
const plans: Plan[] = [
  { name: 'Enterprise', valor: 'R$ 2.499/mês', renovacao: '01/05/2025' },
  { name: 'Professional', valor: 'R$ 999/mês', renovacao: '01/05/2025' },
  { name: 'Starter', valor: 'R$ 299/mês', renovacao: '01/05/2025' },
]

export function Assinaturas() {
  const [currentPlan, setCurrentPlan] = useState(plans[0])
  const [showModal, setShowModal]     = useState(false)
  const [selectedPlan, setSelectedPlan] = useState(plans[0].name)

  function handleUpgrade() {
    const p = plans.find(pl => pl.name === selectedPlan)!
    setCurrentPlan(p)
    setShowModal(false)
  }

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

      {/* Contracted products */}
      <p className="ws-section-title ws-fade-up ws-fade-up-d1">
        Produtos Contratados
      </p>
      <div className="ws-table-wrap ws-fade-up ws-fade-up-d1" style={{ marginBottom: '1.75rem' }}>
        <table className="ws-table">
          <thead>
            <tr>
              <th>Produto</th>
              <th>Cobrança</th>
              <th>Valor</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {produtosContratados.map(p => (
              <tr key={p.id}>
                <td style={{ fontWeight: 600 }}>{p.nome}</td>
                <td>
                  <span style={{
                    display: 'inline-flex', alignItems: 'center',
                    padding: '0.175rem 0.5rem', borderRadius: '9999px',
                    fontSize: '0.6875rem', fontWeight: 700,
                    background: `${billingColor[p.billing]}18`,
                    color: billingColor[p.billing],
                    border: `1px solid ${billingColor[p.billing]}30`,
                    textTransform: 'uppercase', letterSpacing: '0.04em',
                  }}>
                    {p.billing}
                  </span>
                </td>
                <td style={{ color: 'var(--ws-muted)', fontFamily: 'monospace', fontSize: '0.875rem' }}>{p.valor}</td>
                <td><span className={`ws-badge ${statusBadge[p.status]}`}>{p.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Upsell */}
      <p className="ws-section-title ws-fade-up ws-fade-up-d2">
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
