/**
 * ModalNovoCardUsuario — criar card KPI customizado (paridade Pedido).
 */

import React, { useState } from 'react'
import { createPortal } from 'react-dom'
import { useTranslation } from 'react-i18next'
import { X } from '@phosphor-icons/react'
import { BotaoGlobal } from '@nucleo/botao-global'
import {
  ICONE_CARD_COMPONENTES,
  ICONE_CARD_IDS,
} from '../shared/card-icone-map-bid-frete'
import { METRICAS_CARD_DISPONIVEIS } from '../shared/card-metrica-catalog-bid-frete'
import './ModalNovoCardUsuario.css'

const CORES_DISPONIVEIS = [
  '#818cf8', '#34d399', '#fbbf24', '#f87171', '#60a5fa',
  '#a78bfa', '#fb923c', '#38bdf8', '#a3e635', '#f59e0b',
  '#ec4899', '#14b8a6', '#94a3b8', '#e879f9',
]

export interface NovoCardUsuarioPayload {
  nome: string
  icone: string
  cor: string
  metricaId: string
}

interface ModalNovoCardProps {
  onFechar: () => void
  onSalvo: (data: NovoCardUsuarioPayload) => void
}

export function ModalNovoCardUsuario({ onFechar, onSalvo }: ModalNovoCardProps) {
  const { t } = useTranslation()

  const [nome, setNome] = useState('')
  const [icone, setIcone] = useState('Package')
  const [cor, setCor] = useState('#818cf8')
  const [metricaId, setMetricaId] = useState('')

  const podeSubmeter = nome.trim().length > 0 && metricaId.length > 0

  function handleSubmit() {
    if (!podeSubmeter) return
    onSalvo({
      nome: nome.trim(),
      icone,
      cor,
      metricaId,
    })
  }

  return createPortal(
    <div className="mcu-overlay" onClick={onFechar}>
      <div className="mcu-modal" onClick={e => e.stopPropagation()}>

        <div className="mcu-header">
          <h3 className="mcu-header__titulo">
            {t('pedido.card_usuario.titulo_novo', 'Novo Card Personalizado')}
          </h3>
          <button type="button" className="mcu-header__fechar" onClick={onFechar}>
            <X size={14} weight="bold" />
          </button>
        </div>

        <div className="mcu-body">
          <div className="mcu-campo">
            <span className="mcu-campo__label">{t('pedido.card_usuario.label_nome', 'Nome')}</span>
            <input
              type="text"
              className="mcu-campo__input"
              placeholder={t('pedido.card_usuario.ph_nome', 'Ex: Saldo Financeiro')}
              value={nome}
              onChange={e => setNome(e.target.value)}
              maxLength={100}
              autoFocus
            />
          </div>

          <div className="mcu-campo">
            <span className="mcu-campo__label">{t('pedido.card_usuario.label_icone', 'Ícone')}</span>
            <div className="mcu-icone-grid">
              {ICONE_CARD_IDS.map(id => {
                const Icone = ICONE_CARD_COMPONENTES[id]
                return (
                  <button
                    key={id}
                    type="button"
                    className={`mcu-icone-btn${icone === id ? ' mcu-icone-btn--ativo' : ''}`}
                    onClick={() => setIcone(id)}
                    aria-label={id}
                  >
                    <Icone size={16} weight="duotone" />
                  </button>
                )
              })}
            </div>
          </div>

          <div className="mcu-campo">
            <span className="mcu-campo__label">{t('pedido.card_usuario.label_cor', 'Cor')}</span>
            <div className="mcu-cor-grid">
              {CORES_DISPONIVEIS.map(c => (
                <button
                  key={c}
                  type="button"
                  className={`mcu-cor-btn${cor === c ? ' mcu-cor-btn--ativo' : ''}`}
                  style={{ background: c }}
                  onClick={() => setCor(c)}
                  aria-label={c}
                />
              ))}
            </div>
          </div>

          <div className="mcu-campo">
            <span className="mcu-campo__label">
              {t('pedido.card_usuario.label_metrica', 'O que medir')} <span className="mcu-obrigatorio">*</span>
            </span>
            <p className="mcu-campo__hint">
              {t(
                'pedido.card_usuario.hint_metrica',
                'Escolha a métrica que este card exibe na lista (mesmas opções dos cards nativos).',
              )}
            </p>
            <div className="mcu-metrica-lista" role="listbox" aria-label={t('pedido.card_usuario.label_metrica', 'O que medir')}>
              {METRICAS_CARD_DISPONIVEIS.map(def => (
                <button
                  key={def.id}
                  type="button"
                  role="option"
                  aria-selected={metricaId === def.id}
                  className={`mcu-metrica-opcao${metricaId === def.id ? ' mcu-metrica-opcao--ativa' : ''}`}
                  onClick={() => setMetricaId(def.id)}
                >
                  <span className="mcu-metrica-opcao__nome">{t(def.labelKey, def.descricao)}</span>
                  <span className="mcu-metrica-opcao__meta">{def.origem} · {def.tipoAgg}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="mcu-footer">
          <BotaoGlobal variante="secundario" tamanho="pequeno" onClick={onFechar}>
            {t('comum.cancelar', 'Cancelar')}
          </BotaoGlobal>
          <BotaoGlobal
            variante="primario"
            tamanho="pequeno"
            onClick={handleSubmit}
            disabled={!podeSubmeter}
          >
            {t('pedido.card_usuario.btn_criar', 'Criar Card')}
          </BotaoGlobal>
        </div>
      </div>
    </div>,
    document.body,
  )
}
