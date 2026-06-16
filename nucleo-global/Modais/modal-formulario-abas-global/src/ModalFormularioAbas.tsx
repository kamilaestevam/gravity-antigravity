import React, { useRef, useState, useEffect } from 'react'
import { flushSync } from 'react-dom'
import { useTranslation } from 'react-i18next'
import { FloppyDisk } from '@phosphor-icons/react'
import { ModalOverlay } from '@nucleo/modal-global'
import { CabecalhoGlobal } from '@nucleo/cabecalho-global'
import { BotaoGlobal } from '@nucleo/botao-global'
import { BotaoCancelar } from '@nucleo/botoes-salvar-global'
import { StatusSalvarGlobal } from '@nucleo/status-salvar-global'

/** Garante feedback visual mínimo do spinner (save rápido some em 1 frame sem isso). */
const LOADING_MINIMO_MS = 450

export interface AbaFormulario {
  id: string
  rotulo: string
  conteudo: React.ReactNode
  desabilitada?: boolean
  tooltipTitulo?: string
  tooltipDescricao?: string
  ocultarBotoesSalvar?: boolean
  salvarSempreAtivo?: boolean
}

export interface ModalFormularioAbasProps {
  aberto: boolean
  aoFechar: () => void
  aoSalvar: () => void | Promise<void>
  icone: React.ReactNode
  titulo: string
  subtitulo?: string
  dirty?: boolean
  podesSalvar?: boolean
  tamanho?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
  larguraMaxima?: string
  altura?: string
  abas: AbaFormulario[]
  abaAtivaInicial?: string
  tipoAbas?: 'underline' | 'pill'
  centralizarAbas?: boolean
  paddingSuperiorAbas?: string
  textoSalvar?: string
  textoCancelar?: string
  carregando?: boolean
  semAbas?: boolean
  footerExtraEsquerda?: React.ReactNode
}

interface FooterFormularioAbasProps {
  abaAtivaId?: string
  abas: AbaFormulario[]
  semAbas: boolean
  aberto: boolean
  carregandoExterno: boolean
  dirty: boolean
  textoSalvar: string
  textoCancelar: string
  footerExtraEsquerda?: React.ReactNode
  aoFechar: () => void
  aoSalvar: () => void | Promise<void>
}

function FooterFormularioAbas({
  abaAtivaId,
  abas,
  semAbas,
  aberto,
  carregandoExterno,
  dirty,
  textoSalvar,
  textoCancelar,
  footerExtraEsquerda,
  aoFechar,
  aoSalvar,
}: FooterFormularioAbasProps) {
  const { t } = useTranslation()
  const [salvandoUi, setSalvandoUi] = useState(false)
  const aoSalvarRef = useRef(aoSalvar)
  aoSalvarRef.current = aoSalvar

  useEffect(() => {
    if (aberto) setSalvandoUi(false)
  }, [aberto])

  const carregando = carregandoExterno || salvandoUi
  const abaAtual = semAbas ? abas[0] : abas.find((a) => a.id === abaAtivaId)

  if (abaAtual?.ocultarBotoesSalvar) {
    return <div className="mg-footer-personalizado" />
  }

  // Habilita com dirty OU durante save — podesSalvar só valida no handler (toast se falhar).
  // Antes: dirty + !podesSalvar deixava o botão disabled mas "Alterações pendentes" visível.
  const botaoHabilitado = carregando || dirty

  const handleSalvarClick = () => {
    if (carregando || !dirty) return
    const inicio = Date.now()
    flushSync(() => setSalvandoUi(true))
    void (async () => {
      try {
        await aoSalvarRef.current()
      } finally {
        const restante = LOADING_MINIMO_MS - (Date.now() - inicio)
        if (restante > 0) {
          await new Promise<void>((resolve) => { setTimeout(resolve, restante) })
        }
        flushSync(() => setSalvandoUi(false))
      }
    })()
  }

  return (
    <div className="mg-footer-personalizado">
      <StatusSalvarGlobal
        status={carregando ? 'saving' : dirty ? 'dirty' : 'idle'}
        hideOnIdle={!carregando}
      />
      {footerExtraEsquerda}
      <div className="botoes-footer-padrao">
        <BotaoCancelar
          dirty={dirty}
          rotulo={textoCancelar}
          onClick={aoFechar}
        />
        <div
          className={botaoHabilitado && !carregando ? 'bs-btn-pulse' : ''}
          style={{ display: 'inline-flex' }}
        >
          <BotaoGlobal
            variante="primario"
            type="button"
            disabled={!botaoHabilitado}
            data-testid="modal-abas-btn-salvar"
            data-carregando={carregando ? 'true' : 'false'}
            onClick={handleSalvarClick}
            icone={<FloppyDisk size={14} weight="bold" />}
            carregando={carregando}
            textoCarregando={t('botoes.salvando')}
          >
            {textoSalvar}
          </BotaoGlobal>
        </div>
      </div>
    </div>
  )
}

export function ModalFormularioAbas({
  aberto,
  aoFechar,
  aoSalvar,
  icone,
  titulo,
  subtitulo,
  dirty = false,
  podesSalvar = false,
  tamanho = 'lg',
  larguraMaxima,
  altura = '680px',
  abas,
  abaAtivaInicial,
  tipoAbas = 'pill',
  centralizarAbas = false,
  paddingSuperiorAbas,
  textoSalvar,
  textoCancelar,
  carregando = false,
  semAbas = false,
  footerExtraEsquerda,
}: ModalFormularioAbasProps) {
  const { t } = useTranslation()
  const resolvedTextoSalvar = textoSalvar ?? t('modal.salvar_alteracoes')
  const resolvedTextoCancelar = textoCancelar ?? t('modal.cancelar')

  const [abaRodape, setAbaRodape] = useState(abaAtivaInicial ?? abas[0]?.id ?? '')
  useEffect(() => {
    if (aberto && abaAtivaInicial) setAbaRodape(abaAtivaInicial)
  }, [aberto, abaAtivaInicial])

  const cabecalho = (
    <div
      className="ws-modal-cabecalho"
      style={{
        borderBottom: '1px solid var(--ws-accent-border)',
        marginBottom: '1.5rem',
        paddingTop: '1.5rem',
        paddingBottom: '1rem',
        paddingLeft: '1.5rem',
        paddingRight: '3.5rem',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <style dangerouslySetInnerHTML={{ __html: `
        .ws-modal-cabecalho .cg-header {
          margin: 0 !important;
          padding: 0 !important;
          height: auto !important;
          min-height: 0 !important;
          background: transparent !important;
          position: static !important;
        }
        .ws-modal-cabecalho .cg-header__title-block {
          gap: 0.375rem !important;
        }
      `}} />
      <CabecalhoGlobal icone={icone} titulo={titulo} subtitulo={subtitulo || ''} />
    </div>
  )

  const rodape = (
    <FooterFormularioAbas
      abaAtivaId={semAbas ? abas[0]?.id : abaRodape}
      abas={abas}
      semAbas={semAbas}
      aberto={aberto}
      carregandoExterno={carregando}
      dirty={dirty}
      textoSalvar={resolvedTextoSalvar}
      textoCancelar={resolvedTextoCancelar}
      footerExtraEsquerda={footerExtraEsquerda}
      aoFechar={aoFechar}
      aoSalvar={aoSalvar}
    />
  )

  return (
    <ModalOverlay
      aberto={aberto}
      aoFechar={aoFechar}
      titulo=""
      cabecalhoPersonalizado={cabecalho}
      tamanho={tamanho}
      larguraMaxima={larguraMaxima}
      altura={semAbas ? undefined : altura}
      abas={semAbas ? undefined : abas}
      abaAtivaInicial={semAbas ? undefined : abaAtivaInicial}
      tipoAbas={tipoAbas}
      centralizarAbas={centralizarAbas}
      paddingSuperiorAbas={paddingSuperiorAbas}
      rodape={rodape}
      onAbaAtivaChange={semAbas ? undefined : setAbaRodape}
    >
      {semAbas ? abas[0]?.conteudo : undefined}
    </ModalOverlay>
  )
}
