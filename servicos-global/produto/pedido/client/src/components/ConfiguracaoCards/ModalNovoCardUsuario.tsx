/**
 * ModalNovoCardUsuario.tsx — Modal para criar/editar card KPI customizado
 *
 * Features:
 *  - Campo nome
 *  - Grid de ícones Phosphor (seleção visual)
 *  - Paleta de cores
 *  - Editor tokenizado (pill-based) para fórmulas — reutiliza formulaUtils
 *  - Campos disponíveis como chips clicáveis
 */

import React, { useState, useCallback } from 'react'
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
  FORMULA_ALIAS_MAP,
  tokensParaAliasFormula,
  aliasFormulaParaTokens,
  CAMPOS_FORMULA_BASE,
  type FormulaToken,
} from '../../shared/formulaUtils'
import { parsearFormula } from '../../shared/formulaEngine'
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

  const [nome, setNome]     = useState(cardEdicao?.nome ?? '')
  const [icone, setIcone]   = useState(cardEdicao?.icone ?? 'Package')
  const [cor, setCor]       = useState(cardEdicao?.cor ?? '#818cf8')
  const [tokens, setTokens] = useState<FormulaToken[]>(() =>
    cardEdicao?.formula_expressao ? aliasFormulaParaTokens(cardEdicao.formula_expressao) : [],
  )

  const formulaStr = tokensParaAliasFormula(tokens)
  const ast        = tokens.length > 0 ? (() => { try { return parsearFormula(formulaStr) } catch { return null } })() : null
  const formulaOk  = tokens.length > 0 && ast !== null
  const formulaErro = tokens.length > 0 && ast === null

  const adicionarCampo = useCallback((chave: string, label: string) => {
    setTokens(prev => [...prev, { tipo: 'campo', chave, label }])
  }, [])

  const adicionarOp = useCallback((op: string) => {
    setTokens(prev => [...prev, { tipo: 'op', valor: op }])
  }, [])

  const removerToken = useCallback((idx: number) => {
    setTokens(prev => prev.filter((_, i) => i !== idx))
  }, [])

  const [salvando, setSalvando] = useState(false)
  const podeSubmeter = nome.trim().length > 0 && formulaOk && !salvando

  async function handleSubmit() {
    if (!podeSubmeter) return
    setSalvando(true)
    try {
      await onSalvo({
        nome: nome.trim(),
        icone,
        cor,
        formula_expressao: formulaStr,
        formula_dependencias: tokens
          .filter(t => t.tipo === 'campo')
          .map(t => (t as { tipo: 'campo'; chave: string }).chave),
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

        {/* Header */}
        <div className="mcu-header">
          <h3 className="mcu-header__titulo">
            {cardEdicao ? 'Editar Card' : 'Novo Card Personalizado'}
          </h3>
          <button type="button" className="mcu-header__fechar" onClick={onFechar}>
            <X size={14} weight="bold" />
          </button>
        </div>

        {/* Body */}
        <div className="mcu-body">

          {/* Nome */}
          <div className="mcu-campo">
            <span className="mcu-campo__label">Nome</span>
            <input
              type="text"
              className="mcu-campo__input"
              placeholder="Ex: Saldo Financeiro"
              value={nome}
              onChange={e => setNome(e.target.value)}
              maxLength={100}
              autoFocus
            />
          </div>

          {/* Ícone */}
          <div className="mcu-campo">
            <span className="mcu-campo__label">Ícone</span>
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

          {/* Cor */}
          <div className="mcu-campo">
            <span className="mcu-campo__label">Cor</span>
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

          {/* Fórmula */}
          <div className="mcu-campo">
            <span className="mcu-campo__label">Fórmula</span>
            <div className={`mcu-formula-area${formulaOk ? ' mcu-formula-area--ok' : ''}${formulaErro ? ' mcu-formula-area--erro' : ''}`}>
              {tokens.length === 0 ? (
                <span className="mcu-placeholder">Adicione campos e operadores abaixo</span>
              ) : (
                tokens.map((token, i) =>
                  token.tipo === 'campo' ? (
                    <span key={i} className="mcu-token mcu-token--campo">
                      <span>{token.label}</span>
                      <button type="button" className="mcu-token__remove" onClick={() => removerToken(i)}>
                        <X size={9} weight="bold" />
                      </button>
                    </span>
                  ) : (
                    <button key={i} type="button" className="mcu-token mcu-token--op" onClick={() => removerToken(i)}>
                      {token.valor}
                    </button>
                  ),
                )
              )}
            </div>

            {/* Operadores */}
            <div className="mcu-ops" style={{ marginTop: '0.5rem' }}>
              {['+', '-', '*', '/', '(', ')'].map(op => (
                <button key={op} type="button" className="mcu-op-btn" onClick={() => adicionarOp(op)}>{op}</button>
              ))}
              {tokens.length > 0 && (
                <button type="button" className="mcu-op-btn mcu-op-btn--clear" onClick={() => setTokens([])}>Limpar</button>
              )}
            </div>
          </div>

          {/* Campos disponíveis */}
          <div className="mcu-campo">
            <span className="mcu-campo__label">Campos disponíveis</span>
            <div className="mcu-campos-disponiveis">
              {CAMPOS_FORMULA_BASE.flatMap(g => g.campos).map(campo => (
                <button
                  key={campo.chave}
                  type="button"
                  className="mcu-chip-campo"
                  onClick={() => adicionarCampo(campo.chave, campo.label)}
                >
                  {campo.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mcu-footer">
          <BotaoGlobal variante="secundario" tamanho="pequeno" onClick={onFechar}>
            Cancelar
          </BotaoGlobal>
          <BotaoGlobal variante="primario" tamanho="pequeno" onClick={handleSubmit} disabled={!podeSubmeter} carregando={salvando}>
            {cardEdicao ? 'Salvar' : 'Criar Card'}
          </BotaoGlobal>
        </div>
      </div>
    </div>,
    document.body,
  )
}
