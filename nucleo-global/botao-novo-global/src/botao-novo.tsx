import React from 'react'
import { Plus, X } from '@phosphor-icons/react'
import { BotaoGlobal } from '@nucleo/botao-global'
import './botao-novo.css'

export interface BotaoNovoProps {
  /** Texto exibido no botão quando no estado padrão */
  rotulo: string
  /** Callback disparado ao clicar */
  onClick: () => void
  /** Quando true, o botão exibe ícone X e texto "Cancelar" */
  ativo?: boolean
  /** Texto exibido no estado ativo (padrão: "Cancelar") */
  rotuloAtivo?: string
  /** Classe CSS extra para customizações pontuais */
  className?: string
}

/**
 * BotaoNovoGlobal — Botão de ação primária para criação de registros.
 *
 * Composição: usa BotaoGlobal internamente. O CSS deste componente cuida
 * apenas do posicionamento absolute (bottom-right do contêiner relativo).
 *
 * Use dentro de um elemento com `position: relative` que envolva a tabela.
 *
 * @example
 * <div style={{ position: 'relative' }}>
 *   <TabelaEmpresas ... />
 *   <BotaoNovoGlobal rotulo="Nova Empresa Filha" onClick={toggle} ativo={showForm} />
 * </div>
 */
export function BotaoNovoGlobal({
  rotulo,
  onClick,
  ativo = false,
  rotuloAtivo = 'Cancelar',
  className = '',
}: BotaoNovoProps) {
  return (
    <div className={['bng-wrapper', className].filter(Boolean).join(' ')}>
      <BotaoGlobal
        variante={ativo ? 'fantasma' : 'primario'}
        icone={ativo ? <X weight="bold" size={15} /> : <Plus weight="bold" size={15} />}
        onClick={onClick}
      >
        {ativo ? rotuloAtivo : rotulo}
      </BotaoGlobal>
    </div>
  )
}
