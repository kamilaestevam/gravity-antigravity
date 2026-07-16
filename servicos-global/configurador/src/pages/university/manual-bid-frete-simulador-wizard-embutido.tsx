import React from 'react'
import { ArrowLeft, ArrowRight, Check } from '@phosphor-icons/react'
import { BotaoGlobal } from '@nucleo/botao-global'
import {
  StepperPassoPassoGlobal,
  type PassoConfig,
} from '@nucleo/modal-passo-passo-global'
import { NC_ESTILOS_SIMULADOR_WIZARD_SHELL } from './manual-bid-frete-estilos-nc-simulador'
import { MANUAL_ESPACO_PARAGRAFO_PX } from './manual-tipografia'

type ManualBidFreteSimuladorWizardEmbutidoProps = {
  titulo: string
  subtitulo: string
  icone: React.ReactNode
  passos: PassoConfig[]
  passoAtual: number
  legendaInterativa?: string
  /** Remove max-width centralizado — uso em grade com painel guia lateral. */
  larguraTotal?: boolean
  /** Paridade com canNext() do wizard real — habilita «Próximo». */
  podeAvancar?: boolean
  /** Paridade com canBack() — passo 1 mantém «Voltar» desabilitado. */
  podeVoltar?: boolean
  /** Rótulo do botão primário (padrão: Próximo). */
  rotuloAvancar?: string
  /** Ícone à direita do botão primário; se omitido, usa seta (ou check em «Criar Cotação»). */
  iconeAvancar?: React.ReactNode
  /** Ação do botão Próximo (ex.: scroll para o próximo simulador do manual). */
  onAvancar?: () => void
  /** Ação do botão Voltar. */
  onVoltar?: () => void
  /** Substitui o footer padrão (ex.: tela de sucesso com ações customizadas). */
  footerCustom?: React.ReactNode
  /** Classes extras no shell (ex.: animação de demo interativa). */
  classNameShell?: string
  children: React.ReactNode
}

/** Shell inline do wizard Nova Cotação — sem overlay/modal (manual University). */
export function ManualBidFreteSimuladorWizardEmbutido({
  titulo,
  subtitulo,
  icone,
  passos,
  passoAtual,
  legendaInterativa,
  larguraTotal = false,
  podeAvancar = false,
  podeVoltar = false,
  rotuloAvancar = 'Próximo',
  iconeAvancar,
  onAvancar,
  onVoltar,
  footerCustom,
  classNameShell,
  children,
}: ManualBidFreteSimuladorWizardEmbutidoProps) {
  const iconePrimario = iconeAvancar
    ?? (rotuloAvancar === 'Criar Cotação'
      ? <Check size={14} weight="bold" />
      : <ArrowRight size={14} />)
  const iconeADireita = rotuloAvancar === 'Criar Cotação' ? undefined : iconePrimario
  const iconeAEsquerda = rotuloAvancar === 'Criar Cotação' ? iconePrimario : undefined
  return (
    <div style={{ marginTop: larguraTotal ? 0 : MANUAL_ESPACO_PARAGRAFO_PX }}>
      <style>{NC_ESTILOS_SIMULADOR_WIZARD_SHELL}</style>
      {legendaInterativa ? (
        <p style={{
          margin: '0 0 10px',
          fontSize: '.75rem',
          lineHeight: 1.45,
          color: 'color-mix(in srgb, var(--ws-text, #f1f5f9) 65%, transparent)',
          fontStyle: 'italic',
        }}>
          {legendaInterativa}
        </p>
      ) : null}
      <div
        className={['sim-wizard-embutido', classNameShell].filter(Boolean).join(' ')}
        style={{
          maxWidth: larguraTotal ? 'none' : 820,
          margin: larguraTotal ? 0 : '0 auto',
        }}
      >
        <div className="sim-wizard-embutido__header">
          <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', minWidth: 0 }}>
            <div className="sim-wizard-embutido__header-icone">
              {icone}
            </div>
            <div style={{ minWidth: 0 }}>
              <h3 className="sim-wizard-embutido__titulo">{titulo}</h3>
              <p className="sim-wizard-embutido__subtitulo">{subtitulo}</p>
            </div>
          </div>
        </div>

        <div className="sim-wizard-stepper-wrap">
          <StepperPassoPassoGlobal passos={passos} passoAtual={passoAtual} />
        </div>

        <div className="sim-wizard-body">
          {children}
        </div>

        {footerCustom ?? (
          <div className="sim-wizard-embutido__footer">
            <BotaoGlobal
              variante="secundario"
              tamanho="pequeno"
              icone={<ArrowLeft size={14} />}
              disabled={!podeVoltar}
              onClick={podeVoltar ? onVoltar : undefined}
            >
              Voltar
            </BotaoGlobal>
            <BotaoGlobal
              variante="primario"
              tamanho="pequeno"
              icone={iconeAEsquerda}
              iconeDireita={iconeADireita}
              disabled={!podeAvancar}
              onClick={podeAvancar ? onAvancar : undefined}
            >
              {rotuloAvancar}
            </BotaoGlobal>
          </div>
        )}
      </div>
    </div>
  )
}
