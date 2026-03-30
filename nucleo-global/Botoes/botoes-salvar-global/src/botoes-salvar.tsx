/**
 * BotoesSalvarGlobal — Barra de ações Salvar / Cancelar
 * @nucleo/botoes-salvar-global
 *
 * Sempre visível na tela em modo persistente (opaco quando sem alterações).
 * Ativa animações e dicas visuais quando dirty=true.
 *
 * @example
 * const { dirty, resetDirty } = useDirty(dadosIniciais, dados)
 *
 * <BotoesSalvarGlobal
 *   dirty={dirty}
 *   salvando={salvando}
 *   onSalvar={async () => { await salvar(dados); resetDirty(dados) }}
 *   onCancelar={() => { setDados(dadosIniciais); resetDirty() }}
 * />
 */

import React from 'react'
import { useTranslation } from 'react-i18next'
import { FloppyDisk, X } from '@phosphor-icons/react'
import { BotaoGlobal } from '@nucleo/botao-global'
import { TooltipGlobal } from '@nucleo/tooltip-global'
import type { BotoesSalvarGlobalProps, BotaoSalvarProps, BotaoCancelarProps } from './tipos.js'
import './botoes-salvar.css'

// ── BotaoSalvar ────────────────────────────────────────────────────────────

export const BotaoSalvar = React.forwardRef<HTMLButtonElement, BotaoSalvarProps>(
  function BotaoSalvar(
    { dirty = false, carregando = false, rotulo, onClick, type = 'button', tooltipDescricao },
    ref,
  ) {
    const { t } = useTranslation()
    const label = rotulo ?? t('botoes.salvar')
    return (
      <div className={dirty && !carregando ? 'bs-btn-pulse' : ''} style={{ display: 'inline-flex' }}>
        <TooltipGlobal descricao={tooltipDescricao || t('botoes.salvar_tooltip')}>
          <BotaoGlobal
            ref={ref}
            variante="primario"
            type={type}
            disabled={!dirty || carregando}
            onClick={onClick}
            icone={<FloppyDisk size={14} weight="bold" />}
          >
            {carregando ? t('botoes.salvando') : label}
          </BotaoGlobal>
        </TooltipGlobal>
      </div>
    )
  },
)

// ── BotaoCancelar ──────────────────────────────────────────────────────────

export const BotaoCancelar = React.forwardRef<HTMLButtonElement, BotaoCancelarProps>(
  function BotaoCancelar(
    { dirty = false, rotulo, onClick, type = 'button', tooltipDescricao },
    ref,
  ) {
    const { t } = useTranslation()
    const label = rotulo ?? t('botoes.cancelar')
    return (
      <TooltipGlobal descricao={tooltipDescricao || t('botoes.cancelar_tooltip')}>
        <BotaoGlobal
          ref={ref}
          variante="fantasma"
          type={type}
          disabled={!dirty}
          onClick={onClick}
          icone={<X size={14} weight="bold" />}
        >
          {label}
        </BotaoGlobal>
      </TooltipGlobal>
    )
  },
)

// ── BotoesSalvarGlobal (composto) ─────────────────────────────────────────────

export function BotoesSalvarGlobal({
  dirty = false,
  salvando = false,
  onSalvar,
  onCancelar,
  alinhamento = 'direita',
}: BotoesSalvarGlobalProps) {
  const { t } = useTranslation()
  const isVisible = dirty || salvando;

  return (
    <div
      className={[
        'bs-barra',
        `bs-barra--${alinhamento}`,
        isVisible ? 'bs-barra--dirty' : '',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {/* Hint à esquerda (apenas quando direita/centro) */}
      {alinhamento !== 'esquerda' && (
        <span className="bs-hint">
          <span className="bs-hint__dot" />
          {t('botoes.alteracoes_nao_salvas')}
        </span>
      )}

      <BotaoCancelar
        dirty={dirty}
        onClick={onCancelar}
      />
      <BotaoSalvar
        dirty={dirty}
        carregando={salvando}
        onClick={onSalvar}
      />
    </div>
  )
}
