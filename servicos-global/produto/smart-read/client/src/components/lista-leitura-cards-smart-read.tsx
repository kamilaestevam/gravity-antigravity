/**
 * ListaLeituraCardsSmartRead — KPI cards nativos (CardBasicoGlobal), paridade Pedido
 */

import React from 'react'
import { ChartLineUp, Clock, ChartDonut } from '@phosphor-icons/react'
import { CardBasicoGlobal } from '@nucleo/card-global'
import { formatarPercentualLeitura } from '../shared/formatacao-leitura-smart-read'
import type { TransacaoLeitura } from '../shared/schemas'
import {
  usePreferenciasCardsSmartRead,
  type CardDefinicaoSmartRead,
} from '../shared/use-preferencias-cards-smart-read'

type Props = {
  transacoes: TransacaoLeitura[]
  totalLeituras: number | null
  carregando?: boolean
}

function calcularMediaAcertos(transacoes: TransacaoLeitura[]): number | null {
  const valores = transacoes
    .map((t) => t.media_acertos)
    .filter((v): v is number => v != null && Number.isFinite(v))
  if (valores.length === 0) return null
  return valores.reduce((acc, v) => acc + v, 0) / valores.length
}

function renderCard(
  card: CardDefinicaoSmartRead,
  props: Props,
): React.ReactNode {
  const { transacoes, totalLeituras, carregando } = props
  const placeholder = carregando ? '…' : 'Em breve'

  if (card.id === 'leituras_realizadas') {
    const valor = carregando ? '…' : (totalLeituras ?? transacoes.length)
    const concluidas = transacoes.filter((t) => t.status_leitura === 'COMPLETED').length
    return (
      <CardBasicoGlobal
        key={card.id}
        titulo={card.titulo.toUpperCase()}
        icone={<ChartLineUp weight="duotone" size={16} style={{ color: 'var(--ws-accent, #818cf8)' }} />}
        valor={valor}
        subtexto={`${concluidas} concluída(s) nesta página`}
        tooltip={
          <>
            <p className="cg-tooltip__row">
              <span>Total (API)</span>
              <strong>{totalLeituras ?? '—'}</strong>
            </p>
            <p className="cg-tooltip__row">
              <span>Exibidas</span>
              <strong>{transacoes.length}</strong>
            </p>
          </>
        }
      />
    )
  }

  if (card.id === 'recursos_reduzidos') {
    return (
      <CardBasicoGlobal
        key={card.id}
        titulo={card.titulo.toUpperCase()}
        icone={<Clock weight="duotone" size={16} style={{ color: '#818cf8' }} />}
        valor={placeholder}
        subtexto="Métrica em integração"
        tooltip={<p className="cg-tooltip__row"><span>{card.descricao}</span></p>}
      />
    )
  }

  if (card.id === 'performance_acertos') {
    const media = calcularMediaAcertos(transacoes)
    return (
      <CardBasicoGlobal
        key={card.id}
        titulo={card.titulo.toUpperCase()}
        icone={<ChartDonut weight="duotone" size={16} style={{ color: '#34d399' }} />}
        valor={carregando ? '…' : formatarPercentualLeitura(media)}
        variante="sucesso"
        subtexto="Média das leituras visíveis"
        tooltip={<p className="cg-tooltip__row"><span>{card.descricao}</span></p>}
      />
    )
  }

  return null
}

export function ListaLeituraCardsSmartRead(props: Props) {
  const { visiveis } = usePreferenciasCardsSmartRead()

  return (
    <div className="sr-stats-row">
      <div className="sr-cards-nativos">
        {visiveis.map((card) => renderCard(card, props))}
      </div>
    </div>
  )
}
