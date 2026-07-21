/**
 * Modal de aprovação — demo do simulador de marketing (paridade visual com o produto real).
 */

import { useEffect, useState } from 'react'
import ReactDOM from 'react-dom'
import {
  BellRinging,
  CheckCircle,
  CurrencyDollar,
  HandCoins,
  Info,
  X,
} from '@phosphor-icons/react'
import { formatarUsdSimuladorBidFrete } from './dados-simulador-bid-frete'
import './modal-aprovar-simulador-bid-frete.css'

export type PropostaAprovacaoSimulador = {
  fornecedor: string
  valorUsd: number
  transitDias: number
  freeTimeDias: number
  escala: string
}

export interface ModalAprovarSimuladorBidFreteProps {
  aberto: boolean
  proposta: PropostaAprovacaoSimulador | null
  savingUsd: number | null
  savingPct: number | null
  onFechar: () => void
  onConfirmar: () => void
}

function formatarBrlAprox(usd: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(usd * 5.07)
}

function montarResumoValores(valorUsd: number) {
  const taxaOrigem = Math.round(valorUsd * 0.117)
  const taxaDestino = Math.round(valorUsd * 0.0625)
  const freteBase = valorUsd - taxaOrigem - taxaDestino
  return { freteBase, taxaOrigem, taxaDestino, total: valorUsd }
}

export function ModalAprovarSimuladorBidFrete({
  aberto,
  proposta,
  savingUsd,
  savingPct,
  onFechar,
  onConfirmar,
}: ModalAprovarSimuladorBidFreteProps) {
  const [fase, setFase] = useState<'confirmar' | 'sucesso'>('confirmar')
  const [aprovando, setAprovando] = useState(false)
  const [comentario, setComentario] = useState('')

  useEffect(() => {
    if (!aberto) {
      setFase('confirmar')
      setAprovando(false)
      setComentario('')
    }
  }, [aberto])

  if (!aberto || !proposta) return null

  const nome = proposta.fornecedor
  const resumo = montarResumoValores(proposta.valorUsd)
  const validade = new Date()
  validade.setDate(validade.getDate() + 10)
  const validadeFmt = validade.toLocaleDateString('pt-BR')

  async function confirmar() {
    if (aprovando) return
    setAprovando(true)
    await new Promise((resolve) => setTimeout(resolve, 500))
    setAprovando(false)
    setFase('sucesso')
  }

  const modal = (
    <div
      className="bfs-modal-aprovar__overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="bfs-aprovar-titulo"
      onClick={(e) => {
        if (e.target === e.currentTarget && !aprovando) onFechar()
      }}
    >
      <div className="bfs-modal-aprovar__container">
        {fase === 'confirmar' ? (
          <>
            <div className="bfs-modal-aprovar__header">
              <div className="bfs-modal-aprovar__header-texto">
                <div className="bfs-modal-aprovar__titulo-linha">
                  <CheckCircle size={22} weight="duotone" className="bfs-modal-aprovar__icone-titulo" aria-hidden />
                  <h2 id="bfs-aprovar-titulo" className="bfs-modal-aprovar__titulo">
                    Confirmar Aprovação
                  </h2>
                </div>
                <p className="bfs-modal-aprovar__subtitulo">
                  Revise os dados completos da proposta de {nome} antes de confirmar.
                </p>
              </div>
              <button
                type="button"
                className="bfs-modal-aprovar__fechar"
                onClick={onFechar}
                disabled={aprovando}
                aria-label="Fechar"
              >
                <X size={18} aria-hidden />
              </button>
            </div>

            <div className="bfs-modal-aprovar__body">
              <div className="bfs-modal-aprovar__aviso" role="note">
                <BellRinging weight="duotone" size={20} aria-hidden />
                <p>
                  A partir deste momento, <strong>{nome}</strong> será avisado como ganhador da cotação.
                  As demais propostas serão reprovadas automaticamente.
                </p>
              </div>

              <div className="bfs-modal-aprovar__fornecedor">
                <CheckCircle weight="duotone" size={18} aria-hidden />
                <div>
                  <span>Fornecedor selecionado</span>
                  <strong>{nome}</strong>
                </div>
              </div>

              <div className="bfs-modal-aprovar__taxa">
                <HandCoins weight="duotone" size={20} aria-hidden />
                <div>
                  <div className="bfs-modal-aprovar__taxa-cabecalho">
                    <span>Taxa de fechamento paga por</span>
                    <strong>Fornecedor</strong>
                  </div>
                  <p>
                    Ao confirmar, a taxa de fechamento de USD 10,00 será cobrada de {nome} via boleto
                    mensal na Gravity, somente se o frete for fechado na plataforma.
                  </p>
                  <a href="#condicoes" onClick={(e) => e.preventDefault()}>
                    Saiba mais sobre as condições
                  </a>
                </div>
              </div>

              <h4 className="bfs-modal-aprovar__secao">
                <Info weight="duotone" size={16} aria-hidden />
                Dados completos da proposta
              </h4>

              <div className="bfs-modal-aprovar__resumo">
                <div className="bfs-modal-aprovar__resumo-col">
                  <span>Frete base</span>
                  <strong>{formatarUsdSimuladorBidFrete(resumo.freteBase)}</strong>
                  <small>{formatarBrlAprox(resumo.freteBase)}</small>
                </div>
                <div className="bfs-modal-aprovar__resumo-col">
                  <span>Taxas de origem</span>
                  <strong>{formatarUsdSimuladorBidFrete(resumo.taxaOrigem)}</strong>
                  <small>Pick Up Cartage</small>
                </div>
                <div className="bfs-modal-aprovar__resumo-col">
                  <span>Taxas de destino</span>
                  <strong>{formatarUsdSimuladorBidFrete(resumo.taxaDestino)}</strong>
                  <small>Desconsolidação</small>
                </div>
                <div className="bfs-modal-aprovar__resumo-col bfs-modal-aprovar__resumo-col--total">
                  <span>Valor total</span>
                  <strong>{formatarUsdSimuladorBidFrete(resumo.total)}</strong>
                  <small>{formatarBrlAprox(resumo.total)}</small>
                </div>
              </div>

              <div className="bfs-modal-aprovar__campos">
                <div><span>Transit Time</span><strong>{proposta.transitDias} dias</strong></div>
                <div><span>Free Time</span><strong>{proposta.freeTimeDias} dias</strong></div>
                <div><span>Validade</span><strong>{validadeFmt}</strong></div>
                <div><span>Transbordo</span><strong>{proposta.escala === 'Direto' ? 'Direto' : proposta.escala}</strong></div>
                <div><span>Escalas</span><strong>—</strong></div>
                <div><span>Rating</span><strong>—</strong></div>
              </div>

              <label className="bfs-modal-aprovar__comentarios" htmlFor="bfs-aprovar-comentario">
                Mensagem para o agente (opcional)
                <textarea
                  id="bfs-aprovar-comentario"
                  rows={4}
                  maxLength={2000}
                  placeholder="Ex: favor confirmar free time e validade da proposta."
                  value={comentario}
                  onChange={(e) => setComentario(e.target.value.slice(0, 2000))}
                  disabled={aprovando}
                />
              </label>
            </div>

            <footer className="bfs-modal-aprovar__footer">
              <button type="button" className="bfs-modal-aprovar__btn-sec" onClick={onFechar} disabled={aprovando}>
                Cancelar
              </button>
              <button
                type="button"
                className="bfs-modal-aprovar__btn-prim"
                onClick={() => void confirmar()}
                disabled={aprovando}
              >
                <CheckCircle size={14} weight="bold" aria-hidden />
                {aprovando ? 'Aprovando...' : 'Confirmar Aprovação'}
              </button>
            </footer>
          </>
        ) : (
          <>
            <div className="bfs-modal-aprovar__sucesso">
              <div className="bfs-modal-aprovar__sucesso-icone" aria-hidden>
                <CheckCircle weight="fill" size={40} />
              </div>
              <h3>Aprovação confirmada!</h3>
              <p>
                Fornecedor selecionado: <strong>{nome}</strong>
              </p>
              <p className="bfs-modal-aprovar__sucesso-aviso">
                O ganhador será notificado. As demais propostas foram reprovadas automaticamente.
              </p>
              {savingUsd != null && savingUsd > 0 ? (
                <div className="bfs-modal-aprovar__saving">
                  <div className="bfs-modal-aprovar__saving-topo">
                    <CurrencyDollar weight="duotone" size={18} aria-hidden />
                    <span>Saving obtido</span>
                  </div>
                  <div className="bfs-modal-aprovar__saving-valores">
                    <strong>{formatarUsdSimuladorBidFrete(savingUsd)}</strong>
                    {savingPct != null ? <span>{savingPct.toFixed(1)}%</span> : null}
                  </div>
                </div>
              ) : null}
            </div>
            <footer className="bfs-modal-aprovar__footer bfs-modal-aprovar__footer--sucesso">
              <button
                type="button"
                className="bfs-modal-aprovar__btn-prim"
                onClick={() => {
                  onConfirmar()
                  onFechar()
                }}
              >
                <CheckCircle size={14} weight="bold" aria-hidden />
                Continuar
              </button>
            </footer>
          </>
        )}
      </div>
    </div>
  )

  return ReactDOM.createPortal(modal, document.body)
}
