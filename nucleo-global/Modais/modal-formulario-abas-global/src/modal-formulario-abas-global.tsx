import React from 'react'
import { useTranslation } from 'react-i18next'
import { ModalGlobal } from '@nucleo/modal-global'
import { CabecalhoGlobal } from '@nucleo/cabecalho-global'
import { BotaoSalvar, BotaoCancelar } from '@nucleo/botoes-salvar-global'
import { StatusSalvarGlobal } from '@nucleo/status-salvar-global'

export interface AbaFormulario {
  id: string
  rotulo: string
  conteudo: React.ReactNode
  desabilitada?: boolean
  tooltipTitulo?: string
  tooltipDescricao?: string
}

export interface ModalFormularioAbasGlobalProps {
  aberto: boolean
  aoFechar: () => void
  aoSalvar: () => void
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
  textoSalvar,
  textoCancelar
}: ModalFormularioAbasGlobalProps) {
  const { t } = useTranslation()
  const resolvedTextoSalvar = textoSalvar ?? t('modal.salvar_alteracoes')
  const resolvedTextoCancelar = textoCancelar ?? t('modal.cancelar')
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
          <StatusSalvarGlobal status={dirty ? 'dirty' : 'idle'} hideOnIdle={true} />
          <div className="botoes-footer-padrao">
            <BotaoCancelar
              dirty={dirty}
              rotulo={resolvedTextoCancelar}
              onClick={aoFechar}
            />
            <BotaoSalvar
              dirty={podesSalvar && dirty}
              rotulo={resolvedTextoSalvar}
              onClick={aoSalvar}
            />
          </div>
        </div>
      )}
    />
  )
}
