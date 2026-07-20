/**
 * Modal de exclusão em lote do simulador BID Frete — paridade visual e de fluxo
 * com modal-excluir-lista-bid-frete-internacional (preview + confirmar + toast).
 */

import { useMemo, useState } from 'react'
import { Trash, Warning, X } from '@phosphor-icons/react'
import { BotaoGlobal } from '../../../Botoes/botao-global/src/index'
import '../../../Botoes/botao-global/src/botao.css'
import {
  STATUS_SIMULADOR_BID_FRETE,
  type BidGrupoSimuladorBidFrete,
  type CotacaoSimuladorBidFrete,
} from './dados-simulador-bid-frete'
import './modal-excluir-lista-simulador-bid-frete.css'

export type TotaisExclusaoSimuladorBidFrete = { bids: number; cotacoes: number }

type Props = {
  aberto: boolean
  bids: BidGrupoSimuladorBidFrete[]
  cotacoes: CotacaoSimuladorBidFrete[]
  onFechar: () => void
  onConfirmar: (totais: TotaisExclusaoSimuladorBidFrete, idsExcluidos: string[]) => void
}

type MotivoBloqueio = 'COM_PROPOSTAS' | 'ENVIADA_FORNECEDOR'

type CotacaoPreview = {
  cotacao: CotacaoSimuladorBidFrete
  permitida: boolean
  motivo?: MotivoBloqueio
}

type BidPreview = {
  bid: BidGrupoSimuladorBidFrete
  permitido: boolean
  cotacoesBloqueadas: CotacaoPreview[]
}

function avaliarCotacao(c: CotacaoSimuladorBidFrete): CotacaoPreview {
  if (c.propostasRecebidas > 0) {
    return { cotacao: c, permitida: false, motivo: 'COM_PROPOSTAS' }
  }
  if (c.status !== 'RASCUNHO') {
    return { cotacao: c, permitida: false, motivo: 'ENVIADA_FORNECEDOR' }
  }
  return { cotacao: c, permitida: true }
}

function rotuloMotivo(motivo: MotivoBloqueio): string {
  if (motivo === 'COM_PROPOSTAS') return 'Já recebeu propostas'
  return 'Já enviada ao fornecedor'
}

function tituloContagem(nBids: number, nCotacoes: number): string {
  const partes: string[] = []
  if (nBids > 0) partes.push(`${nBids} BID${nBids !== 1 ? 's' : ''}`)
  if (nCotacoes > 0) partes.push(`${nCotacoes} cotaç${nCotacoes !== 1 ? 'ões' : 'ão'}`)
  return partes.join(' e ')
}

export function mensagemToastExclusaoSimuladorBidFrete(totais: TotaisExclusaoSimuladorBidFrete): string {
  const partes: string[] = []
  if (totais.bids > 0) partes.push(`${totais.bids} BID${totais.bids !== 1 ? 's' : ''}`)
  if (totais.cotacoes > 0) partes.push(`${totais.cotacoes} cotaç${totais.cotacoes !== 1 ? 'ões' : 'ão'}`)
  return `Excluído com sucesso: ${partes.join(' e ')}.`
}

export function ModalExcluirListaSimuladorBidFrete({
  aberto,
  bids,
  cotacoes,
  onFechar,
  onConfirmar,
}: Props) {
  const [excluindo, setExcluindo] = useState(false)

  const preview = useMemo(() => {
    const cotacoesPreview = cotacoes.map(avaliarCotacao)
    const bidsPreview: BidPreview[] = bids.map((bid) => {
      const filhas = bid.cotacoes.map(avaliarCotacao)
      const bloqueadas = filhas.filter((f) => !f.permitida)
      return {
        bid,
        permitido: bloqueadas.length === 0 && filhas.length > 0,
        cotacoesBloqueadas: bloqueadas,
      }
    })
    return {
      cotacoesPermitidas: cotacoesPreview.filter((c) => c.permitida),
      cotacoesBloqueadas: cotacoesPreview.filter((c) => !c.permitida),
      bidsPermitidos: bidsPreview.filter((b) => b.permitido),
      bidsBloqueados: bidsPreview.filter((b) => !b.permitido),
    }
  }, [bids, cotacoes])

  const totalPermitidos = preview.bidsPermitidos.length + preview.cotacoesPermitidas.length
  const totalBloqueados = preview.bidsBloqueados.length + preview.cotacoesBloqueadas.length
  const podeExcluir = totalPermitidos > 0 && !excluindo

  const contagemTitulo = tituloContagem(bids.length, cotacoes.length)

  function handleConfirmar() {
    if (!podeExcluir) return
    setExcluindo(true)
    const idsExcluidos: string[] = []
    for (const b of preview.bidsPermitidos) {
      for (const c of b.bid.cotacoes) idsExcluidos.push(c.id)
    }
    for (const c of preview.cotacoesPermitidas) idsExcluidos.push(c.cotacao.id)
    const totais: TotaisExclusaoSimuladorBidFrete = {
      bids: preview.bidsPermitidos.length,
      cotacoes: preview.cotacoesPermitidas.length,
    }
    // Pequeno delay para feedback do botão, como no real (~feedback sucesso)
    window.setTimeout(() => {
      onConfirmar(totais, idsExcluidos)
      setExcluindo(false)
      onFechar()
    }, 400)
  }

  if (!aberto) return null

  return (
    <div
      className="bfs-modal-excluir__overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="bfs-excluir-titulo"
      onClick={(e) => {
        if (e.target === e.currentTarget && !excluindo) onFechar()
      }}
    >
      <div className="bfs-modal-excluir__container">
        <div className="bfs-modal-excluir__header">
          <div className="bfs-modal-excluir__header-texto">
            <div className="bfs-modal-excluir__titulo-linha">
              <Trash size={20} weight="duotone" className="bfs-modal-excluir__icone-titulo" aria-hidden />
              <h2 id="bfs-excluir-titulo" className="bfs-modal-excluir__titulo">
                Excluir {contagemTitulo}
              </h2>
            </div>
            <p className="bfs-modal-excluir__subtitulo">
              Revise os registros antes de confirmar a exclusão
            </p>
          </div>
          <button
            type="button"
            className="bfs-modal-excluir__fechar"
            onClick={onFechar}
            disabled={excluindo}
            aria-label="Fechar"
          >
            <X size={18} aria-hidden />
          </button>
        </div>

        <div className="bfs-modal-excluir__body">
          <div className="bfs-modal-excluir__aviso">
            <Warning size={20} weight="fill" className="bfs-modal-excluir__aviso-icone" aria-hidden />
            <p className="bfs-modal-excluir__aviso-texto">
              <strong>Esta ação é irreversível.</strong>{' '}
              Apenas rascunhos ou itens nunca enviados ao fornecedor podem ser excluídos permanentemente.
            </p>
          </div>

          {preview.bidsPermitidos.length > 0 && (
            <div>
              <p className="bfs-modal-excluir__secao-titulo">
                {`${preview.bidsPermitidos.length} BID(S) SERÃO EXCLUÍDOS`}
              </p>
              <table className="bfs-modal-excluir__tabela" aria-label="BIDs que serão excluídos">
                <thead>
                  <tr>
                    <th className="bfs-modal-excluir__th">Número</th>
                    <th className="bfs-modal-excluir__th">Cotações</th>
                  </tr>
                </thead>
                <tbody>
                  {preview.bidsPermitidos.map(({ bid }) => (
                    <tr key={bid.id} className="bfs-modal-excluir__linha">
                      <td className="bfs-modal-excluir__td bfs-modal-excluir__td--numero">{bid.numero}</td>
                      <td className="bfs-modal-excluir__td bfs-modal-excluir__td--itens">
                        {bid.quantidadeCotacoes} cotação(ões)
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {preview.cotacoesPermitidas.length > 0 && (
            <div>
              <p className="bfs-modal-excluir__secao-titulo">
                {`${preview.cotacoesPermitidas.length} COTAÇÃO(ÕES) SERÃO EXCLUÍDAS`}
              </p>
              <table className="bfs-modal-excluir__tabela" aria-label="Cotações que serão excluídas">
                <thead>
                  <tr>
                    <th className="bfs-modal-excluir__th">Número</th>
                    <th className="bfs-modal-excluir__th">Status</th>
                    <th className="bfs-modal-excluir__th">Propostas</th>
                  </tr>
                </thead>
                <tbody>
                  {preview.cotacoesPermitidas.map(({ cotacao }) => (
                    <tr key={cotacao.id} className="bfs-modal-excluir__linha">
                      <td className="bfs-modal-excluir__td bfs-modal-excluir__td--numero">{cotacao.numero}</td>
                      <td className="bfs-modal-excluir__td bfs-modal-excluir__td--itens">
                        {STATUS_SIMULADOR_BID_FRETE[cotacao.status].rotulo.toUpperCase()}
                      </td>
                      <td className="bfs-modal-excluir__td bfs-modal-excluir__td--itens">
                        {cotacao.propostasRecebidas > 0
                          ? `${cotacao.propostasRecebidas} registro(s)`
                          : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {totalBloqueados > 0 && (
            <div>
              <p className="bfs-modal-excluir__secao-titulo">
                {`${totalBloqueados} BLOQUEADO(S) — USE CANCELAR EM VEZ DE EXCLUIR`}
              </p>
              <ul className="bfs-modal-excluir__bloqueados">
                {preview.bidsBloqueados.map(({ bid, cotacoesBloqueadas }) => (
                  <li key={bid.id} className="bfs-modal-excluir__item-bloqueado">
                    <span className="bfs-modal-excluir__item-bloqueado-numero">{bid.numero}</span>
                    <span className="bfs-modal-excluir__item-bloqueado-motivo">
                      {cotacoesBloqueadas.length > 0
                        ? cotacoesBloqueadas
                          .map((c) => `${c.cotacao.numero}: ${rotuloMotivo(c.motivo!)}`)
                          .join(' · ')
                        : 'BID com cotações que não podem ser excluídas'}
                    </span>
                  </li>
                ))}
                {preview.cotacoesBloqueadas.map(({ cotacao, motivo }) => (
                  <li key={cotacao.id} className="bfs-modal-excluir__item-bloqueado">
                    <span className="bfs-modal-excluir__item-bloqueado-numero">{cotacao.numero}</span>
                    <span className="bfs-modal-excluir__item-bloqueado-motivo">
                      {rotuloMotivo(motivo!)}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {totalPermitidos === 0 && (
            <div className="bfs-modal-excluir__erro" role="alert">
              Nenhum item selecionado pode ser excluído. Cancele as cotações em andamento em vez de excluí-las.
            </div>
          )}
        </div>

        <div className="bfs-modal-excluir__footer">
          <BotaoGlobal variante="secundario" onClick={onFechar} disabled={excluindo}>
            Cancelar
          </BotaoGlobal>
          <BotaoGlobal
            variante="perigo"
            onClick={handleConfirmar}
            disabled={!podeExcluir}
            carregando={excluindo}
            textoCarregando="Excluindo..."
            icone={<Trash size={14} weight="bold" />}
          >
            Excluir
          </BotaoGlobal>
        </div>
      </div>
    </div>
  )
}
