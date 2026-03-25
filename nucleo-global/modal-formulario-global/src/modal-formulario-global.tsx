import React from 'react'
import { ModalSemSessoesGlobal } from '@nucleo/modal-sem-sessoes-global'
import { CabecalhoGlobal } from '@nucleo/cabecalho-global'
import { BotaoSalvar, BotaoCancelar } from '@nucleo/botoes-salvar-global'
import { StatusSalvarGlobal } from '@nucleo/status-salvar-global'

export interface ModalFormularioGlobalProps {
  aberto: boolean
  aoFechar: () => void
  aoSalvar: () => void
  aoExcluir?: () => void
  icone: React.ReactNode
  titulo: string
  subtitulo?: string
  dirty?: boolean
  podesSalvar?: boolean
  tamanho?: "sm" | "md" | "lg" | "xl" | "full"
  altura?: string
  children: React.ReactNode
}

export function ModalFormularioGlobal({
  aberto,
  aoFechar,
  aoSalvar,
  aoExcluir,
  icone,
  titulo,
  subtitulo,
  dirty = false,
  podesSalvar = false,
  tamanho = "lg",
  altura = "680px",
  children
}: ModalFormularioGlobalProps) {
  return (
    <ModalSemSessoesGlobal
      aberto={aberto}
      aoFechar={aoFechar}
      titulo="" // Preenchido via cabecalhoPersonalizado
      cabecalhoPersonalizado={
        <div className="ws-modal-cabecalho" style={{ borderBottom: '1px solid var(--ws-accent-border)', marginBottom: '1.5rem', paddingBottom: '0.2rem' }}>
          <CabecalhoGlobal
            icone={icone}
            titulo={titulo}
            subtitulo={subtitulo || ''}
          />
        </div>
      }
      tamanho={tamanho}
      altura={altura}
      renderizarFooter={() => (
        <div className="mg-footer-personalizado">
          {aoExcluir ? (
            <button
              className="mg-btn-danger mg-btn-danger-fix"
              onClick={aoExcluir}
            >
              Excluir
            </button>
          ) : (
            <div />
          )}
          
          <div className="botoes-footer-padrao">
            <StatusSalvarGlobal status={dirty ? 'dirty' : 'idle'} hideOnIdle={true} />
            <BotaoCancelar
              dirty={dirty}
              rotulo="Cancelar"
              onClick={aoFechar}
            />
            <BotaoSalvar
              dirty={podesSalvar}
              rotulo="Salvar Alterações"
              onClick={aoSalvar}
            />
          </div>
        </div>
      )}
    >
      {children}
    </ModalSemSessoesGlobal>
  )
}
