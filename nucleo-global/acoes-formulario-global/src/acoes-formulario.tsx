/**
 * AcoesFormulario — Barra de ações Salvar / Cancelar
 * @nucleo/acoes-formulario-global
 *
 * Aparece automaticamente quando dirty=true.
 * Desaparece (com animação) quando dirty=false.
 *
 * @example
 * const { dirty, resetDirty } = useDirty(dadosIniciais, dados)
 *
 * <AcoesFormulario
 *   dirty={dirty}
 *   salvando={salvando}
 *   onSalvar={async () => { await salvar(dados); resetDirty(dados) }}
 *   onCancelar={() => { setDados(dadosIniciais); resetDirty() }}
 * />
 */

import React from 'react'
import { FloppyDisk, X, Circle } from '@phosphor-icons/react'
import { BotaoGlobal } from '@nucleo/botao-global'
import type { AcoesFormularioProps, BotaoSalvarProps, BotaoCancelarProps } from './tipos.js'
import './acoes-formulario.css'

// ── BotaoSalvar ────────────────────────────────────────────────────────────

export const BotaoSalvar = React.forwardRef<HTMLButtonElement, BotaoSalvarProps>(
  function BotaoSalvar(
    { dirty = false, carregando = false, rotulo = 'Salvar', onClick, type = 'button' },
    ref,
  ) {
    return (
      <BotaoGlobal
        ref={ref}
        variante="primario"
        type={type}
        disabled={!dirty || carregando}
        onClick={onClick}
        icone={<FloppyDisk size={14} weight="bold" />}
      >
        {carregando ? 'Salvando…' : rotulo}
      </BotaoGlobal>
    )
  },
)

// ── BotaoCancelar ──────────────────────────────────────────────────────────

export const BotaoCancelar = React.forwardRef<HTMLButtonElement, BotaoCancelarProps>(
  function BotaoCancelar(
    { dirty = false, rotulo = 'Cancelar', onClick, type = 'button' },
    ref,
  ) {
    return (
      <BotaoGlobal
        ref={ref}
        variante="fantasma"
        type={type}
        disabled={!dirty}
        onClick={onClick}
        icone={<X size={14} weight="bold" />}
      >
        {rotulo}
      </BotaoGlobal>
    )
  },
)

// ── AcoesFormulario (composto) ─────────────────────────────────────────────

export function AcoesFormulario({
  dirty = false,
  salvando = false,
  onSalvar,
  onCancelar,
  alinhamento = 'direita',
}: AcoesFormularioProps) {
  return (
    <div
      className={[
        'af-barra',
        `af-barra--${alinhamento}`,
        dirty ? 'af-barra--visivel' : '',
      ]
        .filter(Boolean)
        .join(' ')}
      aria-hidden={!dirty}
    >
      {/* Hint à esquerda (apenas quando direita/centro) */}
      {alinhamento !== 'esquerda' && (
        <span className="af-hint">
          <span className="af-hint__dot" />
          Alterações não salvas
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
