import React from 'react'
import { FloppyDisk, X } from '@phosphor-icons/react'
import { BotaoGlobal } from '@nucleo/botao-global'
import type { BotoesSalvarAdminGlobalProps, BotaoSalvarAdminProps, BotaoCancelarAdminProps } from './tipos.js'
import './botao-salvar-admin.css'

export const BotaoSalvarAdmin = React.forwardRef<HTMLButtonElement, BotaoSalvarAdminProps>(
  function BotaoSalvarAdmin(
    { dirty = false, carregando = false, rotulo = 'Salvar', onClick, type = 'button' },
    ref,
  ) {
    return (
      <div className={dirty && !carregando ? 'bs-admin-btn-pulse' : ''} style={{ display: 'inline-flex' }}>
        <BotaoGlobal
          ref={ref}
          variante="primario" /* O CSS var override garante que fique verde */
          tipo={type}
          disabled={!dirty || carregando}
          onClick={onClick}
          icone={<FloppyDisk size={14} weight="bold" />}
          style={{ background: '#10b981', borderColor: '#059669', color: '#fff' }} /* Fallback inline para garantir forçadamente a cor */
        >
          {carregando ? 'Salvando…' : rotulo}
        </BotaoGlobal>
      </div>
    )
  },
)

export const BotaoCancelarAdmin = React.forwardRef<HTMLButtonElement, BotaoCancelarAdminProps>(
  function BotaoCancelarAdmin(
    { dirty = false, rotulo = 'Cancelar', onClick, type = 'button' },
    ref,
  ) {
    return (
      <BotaoGlobal
        ref={ref}
        variante="fantasma"
        tipo={type}
        disabled={!dirty}
        onClick={onClick}
        icone={<X size={14} weight="bold" />}
      >
        {rotulo}
      </BotaoGlobal>
    )
  },
)

export function BotoesSalvarAdminGlobal({
  dirty = false,
  salvando = false,
  onSalvar,
  onCancelar,
  alinhamento = 'direita',
}: BotoesSalvarAdminGlobalProps) {
  return (
    <div
      className={[
        'bs-admin-barra',
        `bs-admin-barra--${alinhamento}`,
        dirty ? 'bs-admin-barra--dirty' : '',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {alinhamento !== 'esquerda' && (
        <span className="bs-admin-hint">
          <span className="bs-admin-hint__dot" />
          Alterações não salvas
        </span>
      )}

      <BotaoCancelarAdmin
        dirty={dirty}
        onClick={onCancelar}
      />
      <BotaoSalvarAdmin
        dirty={dirty}
        carregando={salvando}
        onClick={onSalvar}
      />
    </div>
  )
}
