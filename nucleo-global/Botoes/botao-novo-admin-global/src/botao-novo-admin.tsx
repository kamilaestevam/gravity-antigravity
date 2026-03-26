import React from 'react'
import { Plus, X } from '@phosphor-icons/react'
import { BotaoGlobal } from '@nucleo/botao-global'
import type { BotaoNovoAdminProps } from './tipos.js'
import './botao-novo-admin.css'

/**
 * BotaoNovoAdminGlobal — Componente de criação para o ambiente Admin (Verde Gravity).
 * Mantém a mesma interface do BotaoNovoGlobal, mas com estética administrativa.
 */
export function BotaoNovoAdminGlobal({
  rotulo,
  onClick,
  ativo = false,
  rotuloAtivo = 'Cancelar',
  className = '',
}: BotaoNovoAdminProps) {
  // Cores admin (verde)
  const estiloAdmin = !ativo ? {
    background: '#10b981',
    borderColor: '#059669',
    color: '#fff'
  } : {}

  return (
    <div className={['bng-admin-wrapper', className].filter(Boolean).join(' ')}>
      <BotaoGlobal
        variante={ativo ? 'fantasma' : 'primario'}
        icone={ativo ? <X weight="bold" size={15} /> : <Plus weight="bold" size={15} />}
        onClick={onClick}
        style={estiloAdmin}
      >
        {ativo ? rotuloAtivo : rotulo}
      </BotaoGlobal>
    </div>
  )
}
