import React from 'react'
import { ModalGlobal } from '@nucleo/modal-global'
import { CabecalhoGlobal } from '@nucleo/cabecalho-global'
import { BotaoSalvar, BotaoCancelar } from '@nucleo/botoes-salvar-global'
import { StatusSalvarGlobal } from '@nucleo/status-salvar-global'

export interface AbaFormulario {
  id: string
  rotulo: string
  conteudo: React.ReactNode
  desabilitada?: boolean
}

export interface ModalFormularioAbasGlobalProps {
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
  abas: AbaFormulario[]
  abaAtivaInicial?: string
  tipoAbas?: 'underline' | 'pill'
  textoSalvar?: string
  textoCancelar?: string
}

export function ModalFormularioAbasGlobal({
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
  abas,
  abaAtivaInicial,
  tipoAbas = 'pill',
  textoSalvar = "Salvar Alterações",
  textoCancelar = "Cancelar"
}: ModalFormularioAbasGlobalProps) {
  return (
    <ModalGlobal
      aberto={aberto}
      aoFechar={aoFechar}
      titulo="" // Preenchido via cabecalhoPersonalizado
      cabecalhoPersonalizado={
        <div className="ws-modal-cabecalho" style={{ borderBottom: '1px solid var(--ws-accent-border)', marginBottom: '0.4rem', paddingBottom: '0.1rem', paddingTop: '8px' }}>
          <div style={{ position: 'relative', top: '1px' }}>
            <CabecalhoGlobal
              icone={icone}
              titulo={titulo}
              subtitulo={subtitulo || ''}
            />
          </div>
        </div>
      }
      tamanho={tamanho}
      altura={altura}
      abas={abas}
      abaAtivaInicial={abaAtivaInicial}
      tipoAbas={tipoAbas}
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
    />
  )
}
