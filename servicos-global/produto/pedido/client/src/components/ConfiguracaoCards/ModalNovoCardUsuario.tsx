/**
 * ModalNovoCardUsuario.tsx — Modal para criar/editar card KPI customizado
 *
 * Campos: nome, ícone, cor e métrica do catálogo (obrigatória).
 */

import React, { useState } from 'react'
import { createPortal } from 'react-dom'
import { useTranslation } from 'react-i18next'
import {
  X, Package, CurrencyDollar, Scales, Warning, CheckCircle, Coins,
  ClipboardText, ArrowRight, Gauge, ArrowsLeftRight, StackSimple, Money,
  ChartBar, TrendUp, TrendDown, Percent, Target, Lightning, Star,
  Heart, Fire, Trophy, Medal, Crown, Diamond,
} from '@phosphor-icons/react'
import { BotaoGlobal } from '@nucleo/botao-global'
import type { CardUsuario } from '../../shared/types'
import {
  METRICAS_CARD_DISPONIVEIS,
  encodeMetricaCard,
  decodeMetricaCard,
} from '../../shared/cardMetricaCatalog'
import './ModalNovoCardUsuario.css'

// ── Ícones disponíveis ──────────────────────────────────────────────────────

const ICONES_DISPONIVEIS: { id: string; elemento: React.ReactNode }[] = [
  { id: 'Package',          elemento: <Package          size={16} weight="duotone" /> },
  { id: 'CurrencyDollar',   elemento: <CurrencyDollar   size={16} weight="duotone" /> },
  { id: 'Scales',           elemento: <Scales           size={16} weight="duotone" /> },
  { id: 'Warning',          elemento: <Warning          size={16} weight="duotone" /> },
  { id: 'CheckCircle',      elemento: <CheckCircle      size={16} weight="duotone" /> },
  { id: 'Coins',            elemento: <Coins            size={16} weight="duotone" /> },
  { id: 'ClipboardText',    elemento: <ClipboardText    size={16} weight="duotone" /> },
  { id: 'ArrowRight',       elemento: <ArrowRight       size={16} weight="duotone" /> },
  { id: 'Gauge',            elemento: <Gauge            size={16} weight="duotone" /> },
  { id: 'ArrowsLeftRight',  elemento: <ArrowsLeftRight  size={16} weight="duotone" /> },
  { id: 'StackSimple',      elemento: <StackSimple      size={16} weight="duotone" /> },
  { id: 'Money',            elemento: <Money            size={16} weight="duotone" /> },
  { id: 'ChartBar',         elemento: <ChartBar         size={16} weight="duotone" /> },
  { id: 'TrendUp',          elemento: <TrendUp          size={16} weight="duotone" /> },
  { id: 'TrendDown',        elemento: <TrendDown        size={16} weight="duotone" /> },
  { id: 'Percent',          elemento: <Percent          size={16} weight="duotone" /> },
  { id: 'Target',           elemento: <Target           size={16} weight="duotone" /> },
  { id: 'Lightning',        elemento: <Lightning        size={16} weight="duotone" /> },
  { id: 'Star',             elemento: <Star             size={16} weight="duotone" /> },
  { id: 'Heart',            elemento: <Heart            size={16} weight="duotone" /> },
  { id: 'Fire',             elemento: <Fire             size={16} weight="duotone" /> },
  { id: 'Trophy',           elemento: <Trophy           size={16} weight="duotone" /> },
  { id: 'Medal',            elemento: <Medal            size={16} weight="duotone" /> },
  { id: 'Crown',            elemento: <Crown            size={16} weight="duotone" /> },
]

// ── Paleta de cores ──────────────────────────────────────────────────────────

const CORES_DISPONIVEIS = [
  '#818cf8', '#34d399', '#fbbf24', '#f87171', '#60a5fa',
  '#a78bfa', '#fb923c', '#38bdf8', '#a3e635', '#f59e0b',
  '#ec4899', '#14b8a6', '#94a3b8', '#e879f9',
]

// ── Props ────────────────────────────────────────────────────────────────────

interface ModalNovoCardProps {
  cardEdicao?: CardUsuario
  onFechar: () => void
  onSalvo: (data: Omit<CardUsuario, 'id' | 'tenant_id' | 'created_by' | 'created_at'>) => Promise<void> | void
}

export function ModalNovoCardUsuario({ cardEdicao, onFechar, onSalvo }: ModalNovoCardProps) {
  const { t } = useTranslation()

  const [nome, setNome] = useState(cardEdicao?.nome ?? '')
  const [icone, setIcone] = useState(cardEdicao?.icone ?? 'Package')
  const [cor, setCor] = useState(cardEdicao?.cor ?? '#818cf8')
  const [metricaId, setMetricaId] = useState(
    () => decodeMetricaCard(cardEdicao?.formula_expressao ?? '') ?? '',
  )

  const [salvando, setSalvando] = useState(false)
  const podeSubmeter = nome.trim().length > 0 && metricaId.length > 0 && !salvando

  async function handleSubmit() {
    if (!podeSubmeter) return
    setSalvando(true)
    try {
      await onSalvo({
        nome: nome.trim(),
        icone,
        cor,
        formula_expressao: encodeMetricaCard(metricaId),
        formula_dependencias: [metricaId],
        ordem: cardEdicao?.ordem ?? 0,
        ativo: cardEdicao?.ativo ?? true,
      })
    } catch {
      setSalvando(false)
    }
  }

  return createPortal(
    <div className="mcu-overlay" onClick={onFechar}>
      <div className="mcu-modal" onClick={e => e.stopPropagation()}>

        <div className="mcu-header">
          <h3 className="mcu-header__titulo">
            {cardEdicao ? t('pedido.card_usuario.titulo_editar') : t('pedido.card_usuario.titulo_novo')}
          </h3>
          <button type="button" className="mcu-header__fechar" onClick={onFechar}>
            <X size={14} weight="bold" />
          </button>
        </div>

        <div className="mcu-body">

          <div className="mcu-campo">
            <span className="mcu-campo__label">{t('pedido.card_usuario.label_nome')}</span>
            <input
              type="text"
              className="mcu-campo__input"
              placeholder={t('pedido.card_usuario.ph_nome')}
              value={nome}
              onChange={e => setNome(e.target.value)}
              maxLength={100}
              autoFocus
            />
          </div>

          <div className="mcu-campo">
            <span className="mcu-campo__label">{t('pedido.card_usuario.label_icone')}</span>
            <div className="mcu-icone-grid">
              {ICONES_DISPONIVEIS.map(ic => (
                <button
                  key={ic.id}
                  type="button"
                  className={`mcu-icone-btn${icone === ic.id ? ' mcu-icone-btn--ativo' : ''}`}
                  onClick={() => setIcone(ic.id)}
                  aria-label={ic.id}
                >
                  {ic.elemento}
                </button>
              ))}
            </div>
          </div>

          <div className="mcu-campo">
            <span className="mcu-campo__label">{t('pedido.card_usuario.label_cor')}</span>
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
              {t('pedido.card_usuario.label_metrica')} <span className="mcu-obrigatorio">*</span>
            </span>
            <p className="mcu-campo__hint">{t('pedido.card_usuario.hint_metrica')}</p>
            <div className="mcu-metrica-lista" role="listbox" aria-label={t('pedido.card_usuario.label_metrica')}>
              {METRICAS_CARD_DISPONIVEIS.map(def => (
                <button
                  key={def.id}
                  type="button"
                  role="option"
                  aria-selected={metricaId === def.id}
                  className={`mcu-metrica-opcao${metricaId === def.id ? ' mcu-metrica-opcao--ativa' : ''}`}
                  onClick={() => setMetricaId(def.id)}
                >
                  <span className="mcu-metrica-opcao__nome">{t(def.labelKey)}</span>
                  <span className="mcu-metrica-opcao__meta">{def.origem} · {def.tipoAgg}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="mcu-footer">
          <BotaoGlobal variante="secundario" tamanho="pequeno" onClick={onFechar}>
            {t('comum.cancelar')}
          </BotaoGlobal>
          <BotaoGlobal variante="primario" tamanho="pequeno" onClick={handleSubmit} disabled={!podeSubmeter} carregando={salvando}>
            {cardEdicao ? t('pedido.card_usuario.btn_salvar') : t('pedido.card_usuario.btn_criar')}
          </BotaoGlobal>
        </div>
      </div>
    </div>,
    document.body,
  )
}
