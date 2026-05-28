/**
 * Seleção de fornecedores e canais para disparo de cotação.
 */

import React from 'react'
import { useTranslation } from 'react-i18next'
import { Envelope, ChatCircle } from '@phosphor-icons/react'
import type { CanalDisparo, Fornecedor, Visibilidade } from '../shared/types'

export interface SelecaoFornecedoresDisparoProps {
  visibilidade: Visibilidade
  fornecedores: Fornecedor[]
  carregando: boolean
  selecionados: string[]
  onChangeSelecionados: (ids: string[]) => void
  canais: CanalDisparo[]
  onChangeCanais: (canais: CanalDisparo[]) => void
}

function toggleItem<T extends string>(lista: T[], item: T): T[] {
  return lista.includes(item) ? lista.filter(i => i !== item) : [...lista, item]
}

export function SelecaoFornecedoresDisparo({
  visibilidade,
  fornecedores,
  carregando,
  selecionados,
  onChangeSelecionados,
  canais,
  onChangeCanais,
}: SelecaoFornecedoresDisparoProps) {
  const { t } = useTranslation()

  return (
    <div className="bf-disparo-selecao">
      <p className="bf-disparo-hint">
        {visibilidade === 'ABERTA'
          ? t('bidfrete.disparo.hint_aberta', 'A cotação será enviada a todos os fornecedores ativos que aceitam cotação aberta.')
          : t('bidfrete.disparo.hint_direcionada', 'Selecione os fornecedores que receberão o pedido de cotação por e-mail.')}
      </p>

      <div className="bf-disparo-canais">
        <span className="bf-disparo-canais-label">{t('bidfrete.disparo.canais', 'Canais')}</span>
        <label className="bf-disparo-canal">
          <input
            type="checkbox"
            checked={canais.includes('EMAIL')}
            onChange={() => onChangeCanais(toggleItem(canais, 'EMAIL'))}
          />
          <Envelope weight="duotone" size={16} /> E-mail (Resend)
        </label>
        <label className="bf-disparo-canal">
          <input
            type="checkbox"
            checked={canais.includes('WHATSAPP')}
            onChange={() => onChangeCanais(toggleItem(canais, 'WHATSAPP'))}
          />
          <ChatCircle weight="duotone" size={16} /> WhatsApp
        </label>
      </div>

      {visibilidade === 'DIRECIONADA' && (
        <div className="bf-disparo-lista">
          {carregando ? (
            <p className="bf-disparo-vazio">{t('comum.carregando')}</p>
          ) : fornecedores.length === 0 ? (
            <p className="bf-disparo-vazio">{t('bidfrete.disparo.sem_fornecedores', 'Nenhum fornecedor ativo cadastrado.')}</p>
          ) : (
            fornecedores.map(f => {
              const id = f.id_fornecedor_bid_frete_internacional
              const checked = selecionados.includes(id)
              return (
                <label key={id} className={`bf-disparo-item ${checked ? 'bf-disparo-item--selected' : ''}`}>
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => onChangeSelecionados(toggleItem(selecionados, id))}
                  />
                  <span className="bf-disparo-item-nome">{f.nome_fornecedor_bid_frete_internacional}</span>
                  <span className="bf-disparo-item-email">{f.email_fornecedor_bid_frete_internacional || '—'}</span>
                </label>
              )
            })
          )}
        </div>
      )}

      <style>{`
        .bf-disparo-selecao { display: flex; flex-direction: column; gap: 1rem; }
        .bf-disparo-hint { font-size: 0.875rem; color: var(--text-secondary, #94a3b8); margin: 0; line-height: 1.5; }
        .bf-disparo-canais { display: flex; flex-wrap: wrap; align-items: center; gap: 0.75rem 1.25rem; }
        .bf-disparo-canais-label { font-size: 0.75rem; font-weight: 600; text-transform: uppercase; color: var(--text-muted, #64748b); }
        .bf-disparo-canal { display: inline-flex; align-items: center; gap: 0.35rem; font-size: 0.875rem; cursor: pointer; color: var(--text-primary, #f1f5f9); }
        .bf-disparo-lista { display: flex; flex-direction: column; gap: 0.5rem; max-height: 280px; overflow-y: auto; }
        .bf-disparo-item {
          display: grid; grid-template-columns: auto 1fr auto; gap: 0.75rem; align-items: center;
          padding: 0.65rem 0.85rem; border-radius: 8px; border: 1px solid var(--bg-elevated, #475569);
          cursor: pointer; background: var(--bg-base, #1e293b);
        }
        .bf-disparo-item--selected { border-color: rgba(99,102,241,0.45); background: rgba(99,102,241,0.08); }
        .bf-disparo-item-nome { font-size: 0.875rem; font-weight: 600; color: var(--text-primary, #f1f5f9); }
        .bf-disparo-item-email { font-size: 0.75rem; color: var(--text-muted, #64748b); font-family: 'DM Mono', monospace; }
        .bf-disparo-vazio { font-size: 0.875rem; color: var(--text-muted, #64748b); margin: 0; }
      `}</style>
    </div>
  )
}
