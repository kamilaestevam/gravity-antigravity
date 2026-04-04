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
  /** Quando true, usa a primeira aba como conteúdo direto sem renderizar a navegação de abas */
  semAbas?: boolean
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
  textoCancelar,
  semAbas = false,
}: ModalFormularioAbasGlobalProps) {
  const { t } = useTranslation()
  const resolvedTextoSalvar = textoSalvar ?? t('modal.salvar_alteracoes')
  const resolvedTextoCancelar = textoCancelar ?? t('modal.cancelar')

  const cabecalho = (
    <div className="ws-modal-cabecalho" style={{ borderBottom: '1px solid var(--ws-accent-border)', marginBottom: '0.4rem', paddingBottom: '0.1rem', paddingTop: '8px' }}>
      <div style={{ position: 'relative', top: '1px' }}>
        <CabecalhoGlobal
          icone={icone}
          titulo={titulo}
          subtitulo={subtitulo || ''}
        />
      </div>
    </div>
  )

  const footer = (
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
  )

  return (
    <ModalGlobal
      aberto={aberto}
      aoFechar={aoFechar}
      titulo=""
      cabecalhoPersonalizado={cabecalho}
      tamanho={tamanho}
      altura={semAbas ? undefined : altura}
      abas={semAbas ? undefined : abas}
      abaAtivaInicial={semAbas ? undefined : abaAtivaInicial}
      tipoAbas={tipoAbas}
      renderizarFooter={() => footer}
    >
      {semAbas ? abas[0]?.conteudo : undefined}
    </ModalGlobal>
  )
}
