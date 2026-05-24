/**
 * TabelaPrecos.tsx — Portal do Fornecedor: Tabela de Precos
 * CRUD de rotas com form inline + TabelaGlobal
 */

import React, { useState, useEffect, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { PaginaGlobal } from '@nucleo/pagina-global'
import { TabelaGlobal, type TabelaGlobalColuna, type TabelaGlobalAcao } from '@nucleo/tabela-global'
import {
  CurrencyDollar,
  Plus,
  PencilSimple,
  Trash,
  X,
  FloppyDisk,
  Anchor,
  AirplaneTilt,
  Van,
} from '@phosphor-icons/react'

import { getTabelaPrecos } from '../../shared/api'
import type { TabelaPreco, ModalFrete, ModalidadeCarga } from '../../shared/types'
import { MODAL_LABELS, MODALIDADE_LABELS } from '../../shared/types'

// ─── Helpers ────────────────────────────────────────────────────────────────

interface FormRota {
  origem_codigo_cotacao_bid_frete_internacional: string
  origem_nome_cotacao_bid_frete_internacional: string
  destino_codigo_cotacao_bid_frete_internacional: string
  destino_nome_cotacao_bid_frete_internacional: string
  modal_cotacao_bid_frete_internacional: ModalFrete
  modalidade_cotacao_bid_frete_internacional: ModalidadeCarga
  moeda_ganho_bid_frete_internacional: string
  valor_frete_proposta_bid_frete_internacional: string
  taxas_origem_proposta_bid_frete_internacional: string
  taxas_destino_proposta_bid_frete_internacional: string
  dias_transito_proposta_bid_frete_internacional: string
  dias_free_time_proposta_bid_frete_internacional: string
  validade_inicio: string
  validade_fim: string
}

const FORM_VAZIO: FormRota = {
  origem_codigo_cotacao_bid_frete_internacional: '',
  origem_nome_cotacao_bid_frete_internacional: '',
  destino_codigo_cotacao_bid_frete_internacional: '',
  destino_nome_cotacao_bid_frete_internacional: '',
  modal_cotacao_bid_frete_internacional: 'MARITIMO',
  modalidade_cotacao_bid_frete_internacional: 'FCL',
  moeda_ganho_bid_frete_internacional: 'USD',
  valor_frete_proposta_bid_frete_internacional: '',
  taxas_origem_proposta_bid_frete_internacional: '',
  taxas_destino_proposta_bid_frete_internacional: '',
  dias_transito_proposta_bid_frete_internacional: '',
  dias_free_time_proposta_bid_frete_internacional: '',
  validade_inicio: '',
  validade_fim: '',
}

const MOEDAS = ['USD', 'EUR', 'BRL', 'CNY', 'GBP']
const MODAIS: ModalFrete[] = ['MARITIMO', 'AEREO', 'RODOVIARIO']
const MODALIDADES: ModalidadeCarga[] = ['FCL', 'LCL', 'AEREO_GERAL', 'RODOVIARIO_FTL', 'RODOVIARIO_LTL']

const MODAL_ICON_MAP: Record<ModalFrete, React.ReactNode> = {
  MARITIMO: <Anchor weight="duotone" size={14} />,
  AEREO: <AirplaneTilt weight="duotone" size={14} />,
  RODOVIARIO: <Van weight="duotone" size={14} />,
}

const fmtMoeda = (val: number) =>
  new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(val)

const fmtData = (iso: string) =>
  new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })

// ─── Component ──────────────────────────────────────────────────────────────

export default function TabelaPrecos() {
  const { t } = useTranslation()
  const [precos, setPrecos] = useState<TabelaPreco[]>([])
  const [carregando, setCarregando] = useState(true)
  const [formAberto, setFormAberto] = useState(false)
  const [form, setForm] = useState<FormRota>(FORM_VAZIO)
  const [editandoId, setEditandoId] = useState<string | null>(null)

  const fornecedorId = 'current'

  const carregar = useCallback(async () => {
    setCarregando(true)
    try {
      const data = await getTabelaPrecos(fornecedorId)
      setPrecos(data)
    } catch {
      // silencioso
    } finally {
      setCarregando(false)
    }
  }, [])

  useEffect(() => { carregar() }, [carregar])

  function abrirNovo() {
    setForm(FORM_VAZIO)
    setEditandoId(null)
    setFormAberto(true)
  }

  function abrirEdicao(item: TabelaPreco) {
    setForm({
      origem_codigo_cotacao_bid_frete_internacional: item.origem_codigo_cotacao_bid_frete_internacional,
      origem_nome_cotacao_bid_frete_internacional: item.origem_nome_cotacao_bid_frete_internacional,
      destino_codigo_cotacao_bid_frete_internacional: item.destino_codigo_cotacao_bid_frete_internacional,
      destino_nome_cotacao_bid_frete_internacional: item.destino_nome_cotacao_bid_frete_internacional,
      modal_cotacao_bid_frete_internacional: item.modal_cotacao_bid_frete_internacional,
      modalidade_cotacao_bid_frete_internacional: item.modalidade_cotacao_bid_frete_internacional,
      moeda_ganho_bid_frete_internacional: item.moeda_ganho_bid_frete_internacional,
      valor_frete_proposta_bid_frete_internacional: String(item.valor_frete_proposta_bid_frete_internacional),
      taxas_origem_proposta_bid_frete_internacional: String(item.taxas_origem_proposta_bid_frete_internacional),
      taxas_destino_proposta_bid_frete_internacional: String(item.taxas_destino_proposta_bid_frete_internacional),
      dias_transito_proposta_bid_frete_internacional: String(item.dias_transito_proposta_bid_frete_internacional),
      dias_free_time_proposta_bid_frete_internacional: item.dias_free_time_proposta_bid_frete_internacional != null ? String(item.dias_free_time_proposta_bid_frete_internacional) : '',
      validade_inicio: item.validade_inicio.slice(0, 10),
      validade_fim: item.validade_fim.slice(0, 10),
    })
    setEditandoId(item.id)
    setFormAberto(true)
  }

  function fecharForm() {
    setFormAberto(false)
    setEditandoId(null)
    setForm(FORM_VAZIO)
  }

  function handleChange(field: keyof FormRota, value: string) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  function handleSalvar() {
    // Salvar via API seria aqui
    fecharForm()
    carregar()
  }

  function handleExcluir(_item: TabelaPreco) {
    // Excluir via API seria aqui
    carregar()
  }

  const colunas: TabelaGlobalColuna<TabelaPreco>[] = [
    {
      key: 'rota',
      label: t('bidfrete.portal.tabela_precos.col_rota'),
      tipo: 'texto',
      largura: 220,
      render: (_val: unknown, row: TabelaPreco) => (
        <span style={{ fontSize: '0.8125rem' }}>
          {row.origem_nome_cotacao_bid_frete_internacional} &rarr; {row.destino_nome_cotacao_bid_frete_internacional}
        </span>
      ),
    },
    {
      key: 'modal_cotacao_bid_frete_internacional',
      label: t('bidfrete.portal.tabela_precos.col_modal'),
      tipo: 'texto',
      largura: 120,
      render: (val: unknown) => (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.8125rem' }}>
          {MODAL_ICON_MAP[val as ModalFrete]}
          {MODAL_LABELS[val as ModalFrete]}
        </span>
      ),
    },
    {
      key: 'moeda_ganho_bid_frete_internacional',
      label: t('bidfrete.portal.tabela_precos.col_moeda'),
      tipo: 'texto',
      largura: 80,
      render: (val: unknown) => (
        <span style={{ fontFamily: 'DM Mono, monospace', fontSize: '0.8125rem' }}>{String(val ?? '')}</span>
      ),
    },
    {
      key: 'total',
      label: t('bidfrete.portal.tabela_precos.col_total'),
      tipo: 'numero',
      largura: 130,
      align: 'right',
      render: (_val: unknown, row: TabelaPreco) => {
        const total = (row.valor_frete_proposta_bid_frete_internacional ?? 0) + (row.taxas_origem_proposta_bid_frete_internacional ?? 0) + (row.taxas_destino_proposta_bid_frete_internacional ?? 0)
        return (
          <span style={{ fontFamily: 'DM Mono, monospace', fontSize: '0.8125rem', fontWeight: 600 }}>
            {fmtMoeda(total)}
          </span>
        )
      },
    },
    {
      key: 'dias_transito_proposta_bid_frete_internacional',
      label: t('bidfrete.portal.tabela_precos.col_transit'),
      tipo: 'numero',
      largura: 90,
      align: 'center',
      render: (val: unknown) => (
        <span style={{ fontFamily: 'DM Mono, monospace', fontSize: '0.8125rem' }}>{String(val ?? '')}d</span>
      ),
    },
    {
      key: 'validade_fim',
      label: t('bidfrete.portal.tabela_precos.col_validade'),
      tipo: 'periodo',
      largura: 110,
      render: (val: unknown) => fmtData(val as string),
    },
  ]

  const acoes: TabelaGlobalAcao<TabelaPreco>[] = [
    {
      id: 'editar',
      icone: <PencilSimple weight="duotone" size={16} />,
      tooltip: t('bidfrete.portal.tabela_precos.tooltip_editar'),
      onClick: (item: TabelaPreco) => abrirEdicao(item),
    },
    {
      id: 'excluir',
      icone: <Trash weight="duotone" size={16} />,
      tooltip: t('bidfrete.portal.tabela_precos.tooltip_excluir'),
      onClick: (item: TabelaPreco) => handleExcluir(item),
    },
  ]

  return (
    <PaginaGlobal className="tp-page bid-frete-page-shell">
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
        <button className="tp-btn tp-btn--primary" type="button" onClick={abrirNovo}>
          <Plus weight="bold" size={14} />
          {t('bidfrete.portal.tabela_precos.nova_rota')}
        </button>
      </div>
      {/* Form inline */}
      {formAberto && (
        <div className="tp-form-wrapper">
          <div className="tp-form-header">
            <h3 className="tp-form-title">
              {editandoId ? t('bidfrete.portal.tabela_precos.editar_rota') : t('bidfrete.portal.tabela_precos.nova_rota')}
            </h3>
            <button className="tp-btn-icon" onClick={fecharForm}>
              <X weight="bold" size={16} />
            </button>
          </div>
          <div className="tp-form-grid">
            <div className="tp-field">
              <label className="tp-label">{t('bidfrete.portal.tabela_precos.campo_origem')}</label>
              <input
                className="tp-input"
                type="text"
                placeholder={t('bidfrete.portal.tabela_precos.placeholder_origem')}
                value={form.origem_nome_cotacao_bid_frete_internacional}
                onChange={e => handleChange('origem_nome_cotacao_bid_frete_internacional', e.target.value)}
              />
            </div>
            <div className="tp-field">
              <label className="tp-label">{t('bidfrete.portal.tabela_precos.campo_destino')}</label>
              <input
                className="tp-input"
                type="text"
                placeholder={t('bidfrete.portal.tabela_precos.placeholder_destino')}
                value={form.destino_nome_cotacao_bid_frete_internacional}
                onChange={e => handleChange('destino_nome_cotacao_bid_frete_internacional', e.target.value)}
              />
            </div>
            <div className="tp-field">
              <label className="tp-label">{t('bidfrete.portal.tabela_precos.campo_modal')}</label>
              <select className="tp-input" value={form.modal_cotacao_bid_frete_internacional} onChange={e => handleChange('modal_cotacao_bid_frete_internacional', e.target.value)}>
                {MODAIS.map(m => <option key={m} value={m}>{MODAL_LABELS[m]}</option>)}
              </select>
            </div>
            <div className="tp-field">
              <label className="tp-label">{t('bidfrete.portal.tabela_precos.campo_modalidade')}</label>
              <select className="tp-input" value={form.modalidade_cotacao_bid_frete_internacional} onChange={e => handleChange('modalidade_cotacao_bid_frete_internacional', e.target.value)}>
                {MODALIDADES.map(m => <option key={m} value={m}>{MODALIDADE_LABELS[m]}</option>)}
              </select>
            </div>
            <div className="tp-field">
              <label className="tp-label">{t('bidfrete.portal.tabela_precos.campo_moeda')}</label>
              <select className="tp-input" value={form.moeda_ganho_bid_frete_internacional} onChange={e => handleChange('moeda_ganho_bid_frete_internacional', e.target.value)}>
                {MOEDAS.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
            <div className="tp-field">
              <label className="tp-label">{t('bidfrete.portal.tabela_precos.campo_valor_frete')}</label>
              <input
                className="tp-input tp-input--mono"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={form.valor_frete_proposta_bid_frete_internacional}
                onChange={e => handleChange('valor_frete_proposta_bid_frete_internacional', e.target.value)}
              />
            </div>
            <div className="tp-field">
              <label className="tp-label">{t('bidfrete.portal.tabela_precos.campo_taxas_origem')}</label>
              <input
                className="tp-input tp-input--mono"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={form.taxas_origem_proposta_bid_frete_internacional}
                onChange={e => handleChange('taxas_origem_proposta_bid_frete_internacional', e.target.value)}
              />
            </div>
            <div className="tp-field">
              <label className="tp-label">{t('bidfrete.portal.tabela_precos.campo_taxas_destino')}</label>
              <input
                className="tp-input tp-input--mono"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={form.taxas_destino_proposta_bid_frete_internacional}
                onChange={e => handleChange('taxas_destino_proposta_bid_frete_internacional', e.target.value)}
              />
            </div>
            <div className="tp-field">
              <label className="tp-label">{t('bidfrete.portal.tabela_precos.campo_transit')}</label>
              <input
                className="tp-input tp-input--mono"
                type="number"
                min="1"
                placeholder="0"
                value={form.dias_transito_proposta_bid_frete_internacional}
                onChange={e => handleChange('dias_transito_proposta_bid_frete_internacional', e.target.value)}
              />
            </div>
            <div className="tp-field">
              <label className="tp-label">{t('bidfrete.portal.tabela_precos.campo_free_time')}</label>
              <input
                className="tp-input tp-input--mono"
                type="number"
                min="0"
                placeholder="0"
                value={form.dias_free_time_proposta_bid_frete_internacional}
                onChange={e => handleChange('dias_free_time_proposta_bid_frete_internacional', e.target.value)}
              />
            </div>
            <div className="tp-field">
              <label className="tp-label">{t('bidfrete.portal.tabela_precos.campo_validade_inicio')}</label>
              <input
                className="tp-input"
                type="date"
                value={form.validade_inicio}
                onChange={e => handleChange('validade_inicio', e.target.value)}
              />
            </div>
            <div className="tp-field">
              <label className="tp-label">{t('bidfrete.portal.tabela_precos.campo_validade_fim')}</label>
              <input
                className="tp-input"
                type="date"
                value={form.validade_fim}
                onChange={e => handleChange('validade_fim', e.target.value)}
              />
            </div>
          </div>
          <div className="tp-form-actions">
            <button className="tp-btn tp-btn--secondary" onClick={fecharForm}>
              {t('bidfrete.portal.tabela_precos.cancelar')}
            </button>
            <button className="tp-btn tp-btn--primary" onClick={handleSalvar}>
              <FloppyDisk weight="bold" size={14} />
              {editandoId ? t('bidfrete.portal.tabela_precos.salvar_alteracoes') : t('bidfrete.portal.tabela_precos.adicionar_rota')}
            </button>
          </div>
        </div>
      )}

      {carregando ? (
        <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted, #64748b)' }}>
          Carregando tabela de preços...
        </div>
      ) : (
        <TabelaGlobal
          dados={precos}
          colunas={colunas}
          acoes={acoes}
          idKey="id"
          mensagemVazio={t('bidfrete.portal.tabela_precos.vazio')}
          tooltipBusca={t('bidfrete.portal.tabela_precos.buscar')}
        />
      )}

      <style>{`
        .tp-page { }

        /* Buttons */
        .tp-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1.25rem;
          border-radius: 9999px;
          font-size: 0.875rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.15s ease;
          border: none;
          font-family: inherit;
        }
        .tp-btn--primary {
          background: var(--accent, #6366f1);
          color: #fff;
        }
        .tp-btn--primary:hover { background: var(--accent-hover, #4f46e5); }
        .tp-btn--secondary {
          background: var(--bg-surface, #334155);
          color: var(--text-secondary, #94a3b8);
          border: 1px solid var(--bg-elevated, #475569);
        }
        .tp-btn--secondary:hover {
          background: var(--bg-elevated, #475569);
          color: var(--text-primary, #f1f5f9);
        }

        .tp-btn-icon {
          background: var(--bg-elevated, #475569);
          border: none;
          border-radius: var(--radius-md, 8px);
          padding: 0.35rem;
          cursor: pointer;
          color: var(--text-secondary, #94a3b8);
          display: flex;
          align-items: center;
        }
        .tp-btn-icon:hover {
          background: var(--bg-base, #1e293b);
          color: var(--text-primary, #f1f5f9);
        }

        /* Form */
        .tp-form-wrapper {
          background: var(--bg-surface, #334155);
          border: 1px solid var(--accent, #6366f1);
          border-radius: var(--radius-lg, 12px);
          padding: 1.25rem;
          margin-bottom: 1.25rem;
        }

        .tp-form-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 1rem;
        }

        .tp-form-title {
          font-size: 0.9375rem;
          font-weight: 600;
          color: var(--text-primary, #f1f5f9);
        }

        .tp-form-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 0.75rem;
          margin-bottom: 1rem;
        }
        @media (max-width: 900px) {
          .tp-form-grid { grid-template-columns: 1fr 1fr; }
        }

        .tp-field {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .tp-label {
          font-size: 0.6875rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.04em;
          color: var(--text-muted, #64748b);
        }

        .tp-input {
          background: var(--bg-elevated, #475569);
          border: 1px solid transparent;
          border-radius: var(--radius-md, 8px);
          padding: 0.5rem 0.65rem;
          font-size: 0.8125rem;
          color: var(--text-primary, #f1f5f9);
          font-family: inherit;
          outline: none;
          transition: border-color 0.15s;
        }
        .tp-input:focus { border-color: var(--accent, #6366f1); }
        .tp-input--mono { font-family: 'DM Mono', monospace; }

        .tp-form-actions {
          display: flex;
          gap: 0.75rem;
          justify-content: flex-end;
        }
      `}</style>
    </PaginaGlobal>
  )
}
