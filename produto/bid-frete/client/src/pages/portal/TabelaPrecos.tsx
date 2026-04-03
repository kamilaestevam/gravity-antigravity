/**
 * TabelaPrecos.tsx — Portal do Fornecedor: Tabela de Precos
 * CRUD de rotas com form inline + TabelaGlobal
 */

import React, { useState, useEffect, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { PaginaGlobal } from '@nucleo/pagina-global'
import { CabecalhoGlobal } from '@nucleo/cabecalho-global'
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
  origem_codigo: string
  origem_nome: string
  destino_codigo: string
  destino_nome: string
  modal: ModalFrete
  modalidade: ModalidadeCarga
  moeda: string
  valor_frete: string
  taxas_origem: string
  taxas_destino: string
  transit_time_dias: string
  free_time_dias: string
  validade_inicio: string
  validade_fim: string
}

const FORM_VAZIO: FormRota = {
  origem_codigo: '',
  origem_nome: '',
  destino_codigo: '',
  destino_nome: '',
  modal: 'MARITIMO',
  modalidade: 'FCL',
  moeda: 'USD',
  valor_frete: '',
  taxas_origem: '',
  taxas_destino: '',
  transit_time_dias: '',
  free_time_dias: '',
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
      origem_codigo: item.origem_codigo,
      origem_nome: item.origem_nome,
      destino_codigo: item.destino_codigo,
      destino_nome: item.destino_nome,
      modal: item.modal,
      modalidade: item.modalidade,
      moeda: item.moeda,
      valor_frete: String(item.valor_frete),
      taxas_origem: String(item.taxas_origem),
      taxas_destino: String(item.taxas_destino),
      transit_time_dias: String(item.transit_time_dias),
      free_time_dias: item.free_time_dias != null ? String(item.free_time_dias) : '',
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
      label: 'Rota',
      tipo: 'texto',
      largura: 220,
      render: (_val: unknown, row: TabelaPreco) => (
        <span style={{ fontSize: '0.8125rem' }}>
          {row.origem_nome} &rarr; {row.destino_nome}
        </span>
      ),
    },
    {
      key: 'modal',
      label: 'Modal',
      tipo: 'texto',
      largura: 120,
      render: (val: ModalFrete) => (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.8125rem' }}>
          {MODAL_ICON_MAP[val]}
          {MODAL_LABELS[val]}
        </span>
      ),
    },
    {
      key: 'moeda',
      label: 'Moeda',
      tipo: 'texto',
      largura: 80,
      render: (val: string) => (
        <span style={{ fontFamily: 'DM Mono, monospace', fontSize: '0.8125rem' }}>{val}</span>
      ),
    },
    {
      key: 'total',
      label: 'Total',
      tipo: 'numero',
      largura: 130,
      align: 'right',
      render: (_val: unknown, row: TabelaPreco) => {
        const total = row.valor_frete + row.taxas_origem + row.taxas_destino
        return (
          <span style={{ fontFamily: 'DM Mono, monospace', fontSize: '0.8125rem', fontWeight: 600 }}>
            {fmtMoeda(total)}
          </span>
        )
      },
    },
    {
      key: 'transit_time_dias',
      label: 'Transit',
      tipo: 'numero',
      largura: 90,
      align: 'center',
      render: (val: number) => (
        <span style={{ fontFamily: 'DM Mono, monospace', fontSize: '0.8125rem' }}>{val}d</span>
      ),
    },
    {
      key: 'validade_fim',
      label: 'Validade',
      tipo: 'periodo',
      largura: 110,
      render: (val: string) => fmtData(val),
    },
  ]

  const acoes: TabelaGlobalAcao<TabelaPreco>[] = [
    {
      id: 'editar',
      icone: <PencilSimple weight="duotone" size={16} />,
      tooltip: 'Editar rota',
      onClick: (item: TabelaPreco) => abrirEdicao(item),
    },
    {
      id: 'excluir',
      icone: <Trash weight="duotone" size={16} />,
      tooltip: 'Excluir rota',
      onClick: (item: TabelaPreco) => handleExcluir(item),
    },
  ]

  return (
    <PaginaGlobal
      className="tp-page"
      cabecalho={
        <CabecalhoGlobal
          icone={<CurrencyDollar weight="duotone" size={22} />}
          titulo={t('bidfrete.portal.tabela_precos.titulo')}
          subtitulo={t('bidfrete.portal.tabela_precos.subtitulo')}
          acoes={
            <button className="tp-btn tp-btn--primary" onClick={abrirNovo}>
              <Plus weight="bold" size={14} />
              {t('bidfrete.portal.tabela_precos.nova_rota')}
            </button>
          }
        />
      }
    >
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
                placeholder="Ex: Santos (BRSSZ)"
                value={form.origem_nome}
                onChange={e => handleChange('origem_nome', e.target.value)}
              />
            </div>
            <div className="tp-field">
              <label className="tp-label">{t('bidfrete.portal.tabela_precos.campo_destino')}</label>
              <input
                className="tp-input"
                type="text"
                placeholder="Ex: Shanghai (CNSHA)"
                value={form.destino_nome}
                onChange={e => handleChange('destino_nome', e.target.value)}
              />
            </div>
            <div className="tp-field">
              <label className="tp-label">{t('bidfrete.portal.tabela_precos.campo_modal')}</label>
              <select className="tp-input" value={form.modal} onChange={e => handleChange('modal', e.target.value)}>
                {MODAIS.map(m => <option key={m} value={m}>{MODAL_LABELS[m]}</option>)}
              </select>
            </div>
            <div className="tp-field">
              <label className="tp-label">{t('bidfrete.portal.tabela_precos.campo_modalidade')}</label>
              <select className="tp-input" value={form.modalidade} onChange={e => handleChange('modalidade', e.target.value)}>
                {MODALIDADES.map(m => <option key={m} value={m}>{MODALIDADE_LABELS[m]}</option>)}
              </select>
            </div>
            <div className="tp-field">
              <label className="tp-label">{t('bidfrete.portal.tabela_precos.campo_moeda')}</label>
              <select className="tp-input" value={form.moeda} onChange={e => handleChange('moeda', e.target.value)}>
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
                value={form.valor_frete}
                onChange={e => handleChange('valor_frete', e.target.value)}
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
                value={form.taxas_origem}
                onChange={e => handleChange('taxas_origem', e.target.value)}
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
                value={form.taxas_destino}
                onChange={e => handleChange('taxas_destino', e.target.value)}
              />
            </div>
            <div className="tp-field">
              <label className="tp-label">{t('bidfrete.portal.tabela_precos.campo_transit')}</label>
              <input
                className="tp-input tp-input--mono"
                type="number"
                min="1"
                placeholder="0"
                value={form.transit_time_dias}
                onChange={e => handleChange('transit_time_dias', e.target.value)}
              />
            </div>
            <div className="tp-field">
              <label className="tp-label">{t('bidfrete.portal.tabela_precos.campo_free_time')}</label>
              <input
                className="tp-input tp-input--mono"
                type="number"
                min="0"
                placeholder="0"
                value={form.free_time_dias}
                onChange={e => handleChange('free_time_dias', e.target.value)}
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

      <TabelaGlobal
        dados={precos}
        colunas={colunas}
        acoes={acoes}
        idKey="id"
        carregando={carregando}
        mensagemVazio={t('bidfrete.portal.tabela_precos.vazio')}
        tooltipBusca={t('bidfrete.portal.tabela_precos.buscar')}
      />

      <style>{`
        .tp-page { padding: 0; }

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
