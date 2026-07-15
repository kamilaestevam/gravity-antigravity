import React, { useState } from 'react'
import {
  ArrowSquareIn,
  ArrowSquareOut,
  CheckCircle,
  GitBranch,
  Info,
  ListBullets,
} from '@phosphor-icons/react'
import { BotaoGlobal } from '@nucleo/botao-global'
import type { ResumoTransferenciaListaSimulador } from './transferir-lista-simulador-pedido'
import { fmtQuantidadeSimulador } from './transferir-lista-simulador-pedido'
import './modal-explicacao-transferencia-simulador-pedido.css'

type Props = {
  aberto: boolean
  resumo: ResumoTransferenciaListaSimulador
  onEntendi: () => void
}

type CardPedido = {
  id: 'origem' | 'destino'
  num: string
  rotulo: string
  numero: string
  cor: string
  borda: string
  fundo: string
  paragrafo: string
  pontos: string[]
  exibirOQueMudou: boolean
}

function montarParagrafoOrigem(resumo: ResumoTransferenciaListaSimulador, qty: string): string {
  const destinoNumero = resumo.pedidoNovoNumero
    ?? resumo.pedidosDestinoNumeros[0]
    ?? 'pedido destino'

  if (resumo.cenario === 'reducao_simples') {
    return `**${resumo.pedidoOrigemNumero}** teve **${qty} un.** canceladas nos itens selecionados — a operação é irreversível.`
  }

  if (resumo.pedidoNovoNumero) {
    return `**${resumo.pedidoOrigemNumero}** teve **${qty} unidades** transferidas para **${destinoNumero}**, que foi definido como um novo PO.`
  }

  return `**${resumo.pedidoOrigemNumero}** teve **${qty} unidades** transferidas para **${destinoNumero}**.`
}

function montarCardsExplicacao(resumo: ResumoTransferenciaListaSimulador): CardPedido[] {
  const qty = fmtQuantidadeSimulador(resumo.quantidadeTotal)
  const destinoNumero = resumo.pedidoNovoNumero
    ?? resumo.pedidosDestinoNumeros[0]
    ?? 'pedido destino'

  const origem: CardPedido = {
    id: 'origem',
    num: 'A',
    rotulo: 'Pedido de origem',
    numero: resumo.pedidoOrigemNumero,
    cor: '#818cf8',
    borda: 'rgba(129,140,248,.35)',
    fundo: 'rgba(99,102,241,.12)',
    paragrafo: montarParagrafoOrigem(resumo, qty),
    pontos: resumo.cenario === 'reducao_simples'
      ? [
        'Quantidade removida sem pedido destino',
        'Itens podem ficar com saldo zero',
        'Status pode mudar para Transferido quando o item zera',
      ]
      : [
        'Saldo dos itens transferidos foi reduzido',
        'Pedido de origem permanece na lista',
      ],
    exibirOQueMudou: resumo.cenario === 'reducao_simples',
  }

  if (resumo.cenario === 'reducao_simples') return [origem]

  const destino: CardPedido = {
    id: 'destino',
    num: 'B',
    rotulo: resumo.pedidoNovoNumero ? 'Novo pedido criado' : 'Pedido destino',
    numero: destinoNumero,
    cor: '#34d399',
    borda: 'rgba(52,211,153,.35)',
    fundo: 'rgba(52,211,153,.1)',
    paragrafo: resumo.pedidoNovoNumero
      ? `Foi criado o pedido **${destinoNumero}** com **${qty} un.** transferidas — ele aparece no topo da lista como **novo pedido**.`
      : `O pedido **${destinoNumero}** recebeu **${qty} un.** transferidas e ganhou novos itens na lista.`,
    pontos: resumo.pedidoNovoNumero
      ? [
        'Novo pedido inserido no topo da lista',
        'Status inicial Aberto',
        'Itens transferidos aparecem ao expandir a linha',
      ]
      : [
        'Pedido existente atualizado na lista',
        'Novos itens somados ao pedido destino',
        'Workspace e Exportador permanecem do pedido escolhido',
      ],
    exibirOQueMudou: true,
  }

  return [origem, destino]
}

function renderizarNegrito(texto: string) {
  return texto.split('**').map((parte, i) =>
    i % 2 === 1
      ? <strong key={i}>{parte}</strong>
      : parte,
  )
}

function CardExplicacaoPedido({ card, expandido, onToggle }: {
  card: CardPedido
  expandido: boolean
  onToggle: () => void
}) {
  return (
    <div
      className={`pds-transf-explicacao-card${expandido ? ' pds-transf-explicacao-card--aberto' : ''}`}
      style={{
        borderColor: card.borda,
        background: card.fundo,
      }}
    >
      <button type="button" className="pds-transf-explicacao-card__cabecalho" onClick={onToggle}>
        <span className="pds-transf-explicacao-card__icone" style={{ color: card.cor }}>
          {card.id === 'origem' ? <ArrowSquareOut size={18} weight="duotone" /> : <ArrowSquareIn size={18} weight="duotone" />}
        </span>
        <span className="pds-transf-explicacao-card__textos">
          <span className="pds-transf-explicacao-card__meta" style={{ color: card.cor }}>
            {card.num} · {card.rotulo}
          </span>
          <span className="pds-transf-explicacao-card__numero">{card.numero}</span>
        </span>
        <CheckCircle size={16} weight="fill" color={card.cor} aria-hidden />
      </button>
      {expandido && (
        <div className="pds-transf-explicacao-card__corpo" style={{ borderTopColor: card.borda }}>
          <p className="pds-transf-explicacao-secao-titulo">
            <Info size={13} weight="duotone" color={card.cor} aria-hidden />
            O que significa
          </p>
          <p className={`pds-transf-explicacao-paragrafo${card.exibirOQueMudou ? '' : ' pds-transf-explicacao-paragrafo--sem-margem'}`}>
            {renderizarNegrito(card.paragrafo)}
          </p>
          {card.exibirOQueMudou && (
            <>
              <p className="pds-transf-explicacao-secao-titulo">
                <ListBullets size={13} weight="duotone" color={card.cor} aria-hidden />
                O que mudou
              </p>
              <ul className="pds-transf-explicacao-lista">
                {card.pontos.map((ponto) => (
                  <li key={ponto} style={{ color: card.cor }}>{ponto}</li>
                ))}
              </ul>
            </>
          )}
        </div>
      )}
    </div>
  )
}

export function ModalExplicacaoTransferenciaSimuladorPedido({ aberto, resumo, onEntendi }: Props) {
  const cards = montarCardsExplicacao(resumo)
  const [cardAberto, setCardAberto] = useState<'origem' | 'destino'>('origem')

  if (!aberto) return null

  return (
    <div className="pds-transf-explicacao-overlay" role="dialog" aria-modal="true" aria-labelledby="pds-transf-explicacao-titulo">
      <div className="pds-transf-explicacao-modal">
        <header className="pds-transf-explicacao-modal__header">
          <span className="pds-transf-explicacao-modal__icone-cabecalho">
            <GitBranch size={20} weight="duotone" />
          </span>
          <div>
            <p className="pds-transf-explicacao-modal__meta">Transferência concluída</p>
            <h2 id="pds-transf-explicacao-titulo" className="pds-transf-explicacao-modal__titulo">
              O que ocorreu nos pedidos
            </h2>
            <p className="pds-transf-explicacao-modal__subtitulo">
              {resumo.itensProcessados} item{resumo.itensProcessados !== 1 ? 's' : ''} · {fmtQuantidadeSimulador(resumo.quantidadeTotal)} un.
            </p>
          </div>
        </header>

        <div className="pds-transf-explicacao-modal__cards" data-sds-tutorial-alvo="pedido-explicacao-transferencia-cards">
          {cards.map((card) => (
            <CardExplicacaoPedido
              key={card.id}
              card={card}
              expandido={cardAberto === card.id}
              onToggle={() => setCardAberto(card.id)}
            />
          ))}
        </div>

        <p className="pds-transf-explicacao-modal__dica" data-sds-tutorial-alvo="pedido-explicacao-transferencia-detalhes">
          Ao clicar em Entendi, um guia em 2 passos mostra o contexto dos pedidos e depois os saldos e quantidades transferidas.
        </p>

        <footer className="pds-transf-explicacao-modal__footer">
          <span data-sds-tutorial-alvo="pedido-explicacao-transferencia-entendi" style={{ display: 'inline-flex' }}>
          <BotaoGlobal variante="primario" tamanho="padrao" onClick={onEntendi}>
            Entendi
          </BotaoGlobal>
          </span>
        </footer>
      </div>
    </div>
  )
}
