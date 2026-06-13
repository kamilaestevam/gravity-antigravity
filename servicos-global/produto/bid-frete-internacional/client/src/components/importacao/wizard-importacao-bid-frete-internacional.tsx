/**
 * WizardImportacaoBidFreteInternacional — shell de wizard em página
 * Paridade visual com ModalPassoPassoGlobal (Pedido Smart Import)
 */

import React, { useEffect, useRef } from 'react'
import { Check, X } from '@phosphor-icons/react'
import type { PassoConfig } from '@nucleo/modal-passo-passo-global'

export interface WizardImportacaoBidFreteInternacionalProps {
  titulo: string
  subtitulo?: string
  icone?: React.ReactNode
  passos: PassoConfig[]
  passoAtual: number
  onFechar: () => void
  ocultarStepper?: boolean
  footer?: React.ReactNode
  children: React.ReactNode
}

function stepStatus(passo: PassoConfig, passoAtual: number): 'pendente' | 'ativo' | 'feito' {
  if (passo.id < passoAtual) return 'feito'
  if (passo.id === passoAtual) return 'ativo'
  return 'pendente'
}

export function WizardImportacaoBidFreteInternacional({
  titulo,
  subtitulo,
  icone,
  passos,
  passoAtual,
  onFechar,
  ocultarStepper = false,
  footer,
  children,
}: WizardImportacaoBidFreteInternacionalProps) {
  const passoAnteriorRef = useRef(passoAtual)
  const direcaoRef = useRef<'avanco' | 'retorno'>('avanco')

  useEffect(() => {
    if (passoAtual > passoAnteriorRef.current) direcaoRef.current = 'avanco'
    else if (passoAtual < passoAnteriorRef.current) direcaoRef.current = 'retorno'
    passoAnteriorRef.current = passoAtual
  }, [passoAtual])

  const passoIndex = passos.findIndex(p => p.id === passoAtual)
  const progresso = passos.length > 1 ? (passoIndex / (passos.length - 1)) * 100 : 100

  return (
    <>
      <style>{`
        @keyframes bid-wiz-content-slide-left {
          from { opacity: 0; transform: translateX(24px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes bid-wiz-content-slide-right {
          from { opacity: 0; transform: translateX(-24px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes bid-wiz-check-bounce {
          0%   { transform: scale(0) rotate(-10deg); }
          50%  { transform: scale(1.2) rotate(3deg); }
          100% { transform: scale(1) rotate(0deg); }
        }
        @keyframes bid-wiz-neon-pulse {
          0%, 100% {
            box-shadow: 0 0 8px rgba(99,102,241,0.5), 0 0 20px rgba(99,102,241,0.3), 0 0 40px rgba(99,102,241,0.15), inset 0 0 12px rgba(99,102,241,0.1);
          }
          50% {
            box-shadow: 0 0 12px rgba(99,102,241,0.7), 0 0 30px rgba(99,102,241,0.4), 0 0 60px rgba(99,102,241,0.2), inset 0 0 16px rgba(99,102,241,0.15);
          }
        }
        @keyframes bid-wiz-nucleo-glow {
          0%, 100% { opacity: 0.4; transform: translate(-50%,-50%) scale(1); }
          50%      { opacity: 0.8; transform: translate(-50%,-50%) scale(1.3); }
        }
        @keyframes bid-wiz-orbita-drift {
          from { transform: rotateX(70deg) rotateZ(0deg); }
          to   { transform: rotateX(70deg) rotateZ(360deg); }
        }
        @keyframes bid-wiz-eletron-spin {
          from { transform: translate(-50%,-50%) rotate(0deg); }
          to   { transform: translate(-50%,-50%) rotate(360deg); }
        }
        .bid-wiz-circulo-ativo { animation: bid-wiz-neon-pulse 2s ease-in-out infinite; }
        .bid-wiz-check-icon { animation: bid-wiz-check-bounce 0.35s cubic-bezier(0.34, 1.56, 0.64, 1) both; }
        .bid-wiz-content-wrap { animation: bid-wiz-content-slide-left 0.25s cubic-bezier(0.4, 0, 0.2, 1) both; }
        .bid-wiz-content-wrap--retorno { animation: bid-wiz-content-slide-right 0.25s cubic-bezier(0.4, 0, 0.2, 1) both; }
        .bid-wiz-orbita-ring--1 { transform: rotateX(70deg) rotateZ(0deg); animation: bid-wiz-orbita-drift 3s linear infinite; }
        .bid-wiz-orbita-ring--2 { transform: rotateX(70deg) rotateZ(90deg); animation: bid-wiz-orbita-drift 4.5s linear infinite reverse; }
        .bid-wiz-orbita-eletron--1 { animation: bid-wiz-eletron-spin 3s linear infinite; }
        .bid-wiz-orbita-eletron--2 { animation: bid-wiz-eletron-spin 4.5s linear infinite reverse; }
        .bid-wiz-btn-fechar:hover { color: var(--text-primary) !important; background: var(--bg-elevated, rgba(255,255,255,0.07)) !important; }
        .bid-wiz-conector-fill {
          position: absolute; top: 0; left: 0; height: 100%;
          background: linear-gradient(90deg, #22c55e, #4ade80);
          border-radius: 1px; transition: width 0.5s cubic-bezier(0.4, 0, 0.2, 1);
        }
      `}</style>

      <div className="bid-import-page">
        <div className="bid-import-dialog">
          {!ocultarStepper && (
            <div className="bid-import-progress-wrap" aria-hidden="true">
              <div className="bid-import-progress-bar" style={{ width: `${progresso}%` }} />
            </div>
          )}

          <div className="bid-import-header">
            <div className="bid-import-header-texto">
              <div className="bid-import-header-titulo-row">
                {icone && <span className="bid-import-header-icone">{icone}</span>}
                <span className="bid-import-header-titulo">{titulo}</span>
              </div>
              {subtitulo && <div className="bid-import-header-subtitulo">{subtitulo}</div>}
            </div>
            <button type="button" className="bid-wiz-btn-fechar bid-import-fechar" onClick={onFechar} aria-label="Fechar">
              <X size={18} weight="bold" />
            </button>
          </div>

          {!ocultarStepper && (
            <div className="bid-import-stepper-wrap">
              <div className="bid-import-stepper" role="list" aria-label="Passos">
                {passos.map((passo, idx) => {
                  const status = stepStatus(passo, passoAtual)
                  return (
                    <React.Fragment key={passo.id}>
                      <div className="bid-import-passo" role="listitem" aria-current={status === 'ativo' ? 'step' : undefined}>
                        <div className="bid-import-circulo-wrap">
                          <div
                            className={[
                              'bid-import-circulo',
                              status === 'ativo' ? 'bid-import-circulo-ativo bid-wiz-circulo-ativo' : '',
                              status === 'feito' ? 'bid-import-circulo-feito' : '',
                              status === 'pendente' ? 'bid-import-circulo-pendente' : '',
                            ].filter(Boolean).join(' ')}
                          >
                            {status === 'feito'
                              ? <span className="bid-wiz-check-icon"><Check size={16} weight="bold" /></span>
                              : (passo.icone ?? passo.id)}
                          </div>
                          {status === 'ativo' && (
                            <>
                              <div className="bid-wiz-orbita-3d" aria-hidden="true">
                                <div className="bid-wiz-orbita-ring bid-wiz-orbita-ring--1">
                                  <div className="bid-wiz-orbita-anel" />
                                  <div className="bid-wiz-orbita-eletron bid-wiz-orbita-eletron--1" />
                                </div>
                                <div className="bid-wiz-orbita-ring bid-wiz-orbita-ring--2">
                                  <div className="bid-wiz-orbita-anel" />
                                  <div className="bid-wiz-orbita-eletron bid-wiz-orbita-eletron--2" />
                                </div>
                              </div>
                              <div className="bid-import-nucleo-glow" aria-hidden="true" />
                            </>
                          )}
                        </div>
                        <span className={[
                          'bid-import-passo-label',
                          status === 'ativo' ? 'bid-import-passo-label-ativo' : '',
                          status === 'feito' ? 'bid-import-passo-label-feito' : '',
                        ].filter(Boolean).join(' ')}>
                          {passo.label}
                        </span>
                      </div>
                      {idx < passos.length - 1 && (
                        <div className="bid-import-conector" aria-hidden="true">
                          <div className="bid-wiz-conector-fill" style={{ width: status === 'feito' ? '100%' : '0%' }} />
                        </div>
                      )}
                    </React.Fragment>
                  )
                })}
              </div>
            </div>
          )}

          <div
            key={passoAtual}
            className={`bid-import-corpo bid-wiz-content-wrap${direcaoRef.current === 'retorno' ? ' bid-wiz-content-wrap--retorno' : ''}`}
          >
            {children}
          </div>

          {footer && <div className="bid-import-footer">{footer}</div>}
        </div>
      </div>
    </>
  )
}
