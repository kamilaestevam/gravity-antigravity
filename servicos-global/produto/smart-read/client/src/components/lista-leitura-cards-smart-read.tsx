/**
 * ListaLeituraCardsSmartRead — KPI cards nativos (CardBasicoGlobal), paridade Pedido
 */

import React from 'react'
import { ChartLineUp, Timer, ChartDonut } from '@phosphor-icons/react'
import { CardBasicoGlobal } from '@nucleo/card-global'
import {
  formatarPercentualLeitura,
  formatarSavingHorasLeitura,
  formatarSavingValorLeitura,
} from '../shared/formatacao-leitura-smart-read'
import {
  resolverMediaAcertosTransacaoLeituraSmartRead,
  resolverSavingTransacaoLeituraSmartRead,
} from '../../../shared/metricas-transacao-leitura-smart-read'
import {
  formatarErrosEvitadosEstudoSmartRead,
  resolverContagemAcertoErroEstudoSmartRead,
} from '../../../shared/dados-base-produto-tempo-smart-read'
import type { TransacaoLeitura } from '../shared/schemas'
import {
  usePreferenciasCardsSmartRead,
  type CardDefinicaoSmartRead,
} from '../shared/use-preferencias-cards-smart-read'
import { LinkMetodologiaSavingInsightsSmartRead } from '../pages/insights-smart-read/metodologia-saving-insights-smart-read'
import { ehStatusFluxoConcluidaKpi } from '../../../shared/status-fluxo-leitura-smart-read'

type Props = {
  transacoes: TransacaoLeitura[]
  totalLeituras: number | null
  carregando?: boolean
}

function calcularMediaAcertos(transacoes: TransacaoLeitura[]): number | null {
  const valores = transacoes
    .map((t) => resolverMediaAcertosTransacaoLeituraSmartRead(t))
    .filter((v): v is number => v != null && Number.isFinite(v))
  if (valores.length === 0) return null
  return valores.reduce((acc, v) => acc + v, 0) / valores.length
}

function calcularSavingAgregado(transacoes: TransacaoLeitura[]): {
  minutos: number | null
  brl: number | null
  camposErrados: number
  totalCampos: number
  leiturasComSaving: number
} {
  let minutos = 0
  let brl = 0
  let camposErrados = 0
  let totalCampos = 0
  let leiturasComSaving = 0

  for (const transacao of transacoes) {
    totalCampos += transacao.total_campos_extraidos
    camposErrados += resolverContagemAcertoErroEstudoSmartRead(
      transacao.total_campos_extraidos,
    ).errados
    const saving = resolverSavingTransacaoLeituraSmartRead(transacao)
    if (!saving || saving.saving_total_minutos <= 0) continue
    minutos += saving.saving_total_minutos
    brl += saving.saving_total_brl
    leiturasComSaving += 1
  }

  return {
    minutos: leiturasComSaving > 0 ? minutos : null,
    brl: leiturasComSaving > 0 ? brl : null,
    camposErrados,
    totalCampos,
    leiturasComSaving,
  }
}

function renderCard(
  card: CardDefinicaoSmartRead,
  props: Props,
): React.ReactNode {
  const { transacoes, totalLeituras, carregando } = props

  if (card.id === 'leituras_realizadas') {
    const valor = carregando ? '…' : (totalLeituras ?? transacoes.length)
    const concluidas = transacoes.filter((t) => ehStatusFluxoConcluidaKpi(t.status_fluxo_leitura)).length
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
    const saving = calcularSavingAgregado(transacoes)
    return (
      <CardBasicoGlobal
        key={card.id}
        titulo={card.titulo.toUpperCase()}
        icone={<Timer weight="duotone" size={16} style={{ color: '#34d399' }} />}
        valor={carregando ? '…' : formatarSavingHorasLeitura(saving.minutos)}
        variante="sucesso"
        subtexto={
          carregando
            ? '…'
            : `${formatarSavingValorLeitura(saving.brl)} evitados · leituras visíveis`
        }
        tooltip={
          <>
            <p className="cg-tooltip__row">
              <span>Tempo economizado</span>
              <strong>{formatarSavingHorasLeitura(saving.minutos)}</strong>
            </p>
            <p className="cg-tooltip__row">
              <span>Custo evitado (est.)</span>
              <strong>{formatarSavingValorLeitura(saving.brl)}</strong>
            </p>
            <p className="cg-tooltip__row">
              <span>Erros evitados (estudo)</span>
              <strong>{formatarErrosEvitadosEstudoSmartRead(saving.camposErrados, saving.totalCampos)}</strong>
            </p>
            <p className="cg-tooltip__row">
              <span>Leituras com saving</span>
              <strong>{saving.leiturasComSaving}</strong>
            </p>
            <p className="cg-tooltip__row cg-tooltip__row--link-only">
              <LinkMetodologiaSavingInsightsSmartRead>Base de cálculo →</LinkMetodologiaSavingInsightsSmartRead>
            </p>
          </>
        }
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
