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
  textoSalvar?: string
  textoCancelar?: string
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
  children,
  textoSalvar = "Salvar Alterações",
  textoCancelar = "Cancelar"
}: ModalFormularioGlobalProps) {
  return (
    <ModalSemSessoesGlobal
      aberto={aberto}
      aoFechar={aoFechar}
      titulo="" // Preenchido via cabecalhoPersonalizado
      cabecalhoPersonalizado={
        <div 
          className="ws-modal-cabecalho" 
          style={{ 
            borderBottom: '1px solid var(--ws-accent-border)', 
            marginBottom: '1.5rem', 
            paddingTop: '1.5rem',
            paddingBottom: '1rem',
            paddingLeft: '1.5rem',
            paddingRight: '3.5rem', // Espaço para o botão fechar
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          {/* Sobrescreve margens negativas do CabecalhoGlobal que são específicas para páginas */}
          <style dangerouslySetInnerHTML={{ __html: `
            .ws-modal-cabecalho .cg-header {
              margin: 0 !important;
              padding: 0 !important;
              height: auto !important;
              min-height: 0 !important;
              background: transparent !important;
              position: static !important;
            }
          `}} />
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
              rotulo={textoCancelar}
              onClick={aoFechar}
            />
            <BotaoSalvar
              dirty={podesSalvar}
              rotulo={textoSalvar}
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
