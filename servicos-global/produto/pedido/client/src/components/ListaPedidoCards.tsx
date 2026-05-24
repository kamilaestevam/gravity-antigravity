/**
 * ListaPedidoCards — KPI cards da tela de Lista de Pedidos
 */

import React, { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Package, CurrencyDollar, CurrencyCircleDollar, Scales, Warning,
} from '@phosphor-icons/react'
import { CardBasicoGlobal } from '@nucleo/card-global'
import type { Pedido, PedidoItem } from '../shared/types'
import { fmtQuantidade } from '../shared/types'
import type { CardPreferencia } from '../shared/useCardPreferences'
import { CARDS_CATALOGO } from '../shared/useCardPreferences'
import { CARD_REGISTRY } from '../shared/cardRegistry'
import {
  computeCardStats,
  kpisApiToCardStats,
  type CardComputedStats,
} from '../shared/listaCardStats'
import { useListaCardKpis } from '../shared/useListaCardKpis'
import { useConfigRegras } from '../shared/queries'
import type { CardPeriodoCodigo } from '../shared/lista-card-schemas'
export interface ListaPedidoCardsProps {
  cardsVisiveis: CardPreferencia[]
  pedidos: Pedido[]
  pedidosFiltrados: Pedido[]
  total: number
  totalItensBanco: number
  periodo: CardPeriodoCodigo
  abaAtiva: string
  busca: string
  workspacesSelecionados: string[]
  workspaceAtivo: string
  temFiltroColunaCliente: boolean
  taxasVenda: Record<string, number>
}

function fmtMoedaCard(v: number): string {
  return fmtQuantidade(v, 2)
}

export function ListaPedidoCards({
  cardsVisiveis,
  pedidos,
  pedidosFiltrados,
  total,
  totalItensBanco,
  periodo,
  abaAtiva,
  busca,
  workspacesSelecionados,
  workspaceAtivo,
  temFiltroColunaCliente,
  taxasVenda,
}: ListaPedidoCardsProps) {
  const { t } = useTranslation()
  const hoje = useMemo(() => new Date().toISOString().slice(0, 10), [])

  const ehSelecaoDefault =
    workspacesSelecionados.length === 1 &&
    workspacesSelecionados[0] === workspaceAtivo
  const idsWorkspacesFiltro = ehSelecaoDefault ? undefined : workspacesSelecionados

  const { kpis } = useListaCardKpis({
    period: periodo,
    status: abaAtiva !== 'todos' ? abaAtiva : undefined,
    busca,
    idsWorkspacesFiltro,
    enabled: !temFiltroColunaCliente,
  })

  const { data: regrasConfig } = useConfigRegras()

  const regrasAlertas = useMemo(() => {
    if (!regrasConfig) return undefined
    return {
      alerta_numero_duplicado: regrasConfig.alerta_numero_duplicado,
      alerta_valor_total_divergente: regrasConfig.alerta_valor_total_divergente,
      alerta_quantidade_total_divergente: regrasConfig.alerta_quantidade_total_divergente,
      alerta_quantidade_pronta_divergente: regrasConfig.alerta_quantidade_pronta_divergente,
      alerta_peso_liquido_divergente: regrasConfig.alerta_peso_liquido_divergente,
      alerta_peso_bruto_divergente: regrasConfig.alerta_peso_bruto_divergente,
      alerta_cubagem_divergente: regrasConfig.alerta_cubagem_divergente,
    }
  }, [regrasConfig])

  const pedidosBase = temFiltroColunaCliente ? pedidosFiltrados : pedidos
  const todosItens = useMemo(
    () => pedidosBase.flatMap(p => p.itens ?? []) as PedidoItem[],
    [pedidosBase],
  )

  const cardStats: CardComputedStats = useMemo(() => {
    if (temFiltroColunaCliente || !kpis) {
      const totalLocal = temFiltroColunaCliente ? pedidosFiltrados.length : total
      const itensLocal = temFiltroColunaCliente
        ? pedidosFiltrados.flatMap(p => p.itens ?? []) as PedidoItem[]
        : todosItens
      return computeCardStats(
        pedidosBase,
        itensLocal,
        totalLocal,
        hoje,
        temFiltroColunaCliente ? itensLocal.length : totalItensBanco,
        taxasVenda,
        regrasAlertas,
      )
    }
    return kpisApiToCardStats(kpis)
  }, [
    temFiltroColunaCliente, kpis, pedidosBase, pedidosFiltrados, total,
    todosItens, hoje, totalItensBanco, taxasVenda, regrasAlertas,
  ])

  const cardsParaRender = cardsVisiveis

  const qtdPorUnidade: Record<string, number> = {}
  const qtdSaldoPorUnidade: Record<string, number> = {}
  for (const item of todosItens) {
    const un = (item as PedidoItem & { unidade_comercializada_item?: string }).unidade_comercializada_item ?? 'UN'
    qtdPorUnidade[un] = (qtdPorUnidade[un] ?? 0) + (Number(item.quantidade_inicial_pedido) || 0)
    qtdSaldoPorUnidade[un] = (qtdSaldoPorUnidade[un] ?? 0) + (Number(item.quantidade_atual_pedido) || 0)
  }
  const unidadesQtd = Object.keys(qtdPorUnidade)
  const unicaUnidade = unidadesQtd.length === 1 ? unidadesQtd[0] : null

  return (
    <div className="lp-stats-row">
      <div className="lp-cards">
        {cardsParaRender.map((pref) => {
          if (pref.id === 'total_pedidos') {
            return (
              <CardBasicoGlobal
                key="total_pedidos"
                titulo={t('pedido.total_pedidos')}
                icone={<Package weight="duotone" size={16} style={{ color: 'var(--ws-accent)' }} />}
                valor={cardStats.total}
                subtexto={`${cardStats.nItens} ${t('pedido.itens_total')}`}
                tooltip={<>
                  <p className="cg-tooltip__row"><span>{t('pedido.abertos')}</span><strong>{cardStats.pedidosAbertos}</strong></p>
                  <p className="cg-tooltip__row"><span>{t('pedido.em_andamento')}</span><strong>{cardStats.pedidosEmAndamento}</strong></p>
                  <p className="cg-tooltip__row"><span>{t('pedido.concluidos')}</span><strong>{pedidosBase.filter(p => p.status === 'consolidado').length}</strong></p>
                </>}
              />
            )
          }

          if (pref.id === 'valor_total') {
            return (
              <CardBasicoGlobal
                key="valor_total"
                titulo={t('pedido.valor_total')}
                icone={<CurrencyDollar weight="duotone" size={16} style={{ color: '#34d399' }} />}
                valor={fmtMoedaCard(cardStats.valorTotal)}
                variante="sucesso"
                subtexto={t('pedido.soma_pedidos')}
                tooltip={<>
                  <p className="cg-tooltip__row"><span>{t('pedido.media_por_pedido')}</span><strong>{fmtMoedaCard(cardStats.total ? cardStats.valorTotal / cardStats.total : 0)}</strong></p>
                </>}
              />
            )
          }

          if (pref.id === 'valor_total_brl') {
            const porMoeda: Record<string, number> = {}
            for (const p of pedidosBase) {
              const m = p.moeda_pedido ?? 'USD'
              porMoeda[m] = (porMoeda[m] ?? 0) + (Number(p.valor_total_pedido) || 0)
            }
            const MOEDA_ORDEM = ['USD', 'EUR', 'GBP', 'CNY', 'JPY', 'CHF', 'CAD']
            const entradas = Object.entries(porMoeda).sort(([a], [b]) => {
              const ia = MOEDA_ORDEM.indexOf(a); const ib = MOEDA_ORDEM.indexOf(b)
              return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib)
            })
            const valorBrl = cardStats.valorTotalBrl ?? 0
            return (
              <CardBasicoGlobal
                key="valor_total_brl"
                titulo={t('pedido.lista.card.total_brl_titulo')}
                icone={<CurrencyCircleDollar weight="duotone" size={16} style={{ color: '#34d399' }} />}
                valor={`R$ ${fmtMoedaCard(valorBrl)}`}
                variante="sucesso"
                subtexto={t('pedido.lista.card.total_brl_subtexto')}
                tooltip={<>
                  {entradas.map(([m, v]) => {
                    const taxa = taxasVenda[m]
                    return (
                      <p key={m} className="cg-tooltip__row">
                        <span>{m} {fmtMoedaCard(Number(v))}</span>
                        <strong>{taxa != null ? `× ${fmtQuantidade(taxa, 4)}` : t('pedido.lista.card.sem_taxa')}</strong>
                      </p>
                    )
                  })}
                </>}
              />
            )
          }

          if (pref.id === 'qtd_total') {
            return (
              <CardBasicoGlobal
                key="qtd_total"
                titulo={t('pedido.qtd_total')}
                icone={<Scales weight="duotone" size={16} style={{ color: '#fbbf24' }} />}
                valor={unicaUnidade ? `${fmtQuantidade(cardStats.qtdTotal)} ${unicaUnidade}` : fmtQuantidade(cardStats.qtdTotal)}
                variante="aviso"
                subtexto={`${fmtQuantidade(cardStats.qtdAtualTotal)} ${t('pedido.saldo_atual')}`}
                tooltip={<>
                  {unidadesQtd.length > 1
                    ? unidadesQtd.map(un => (
                        <p key={un} className="cg-tooltip__row">
                          <span>{fmtQuantidade(qtdPorUnidade[un])} {un}</span>
                          <strong>{fmtQuantidade(qtdSaldoPorUnidade[un])} {t('pedido.lista.card.saldo')}</strong>
                        </p>
                      ))
                    : <>
                        <p className="cg-tooltip__row"><span>{t('pedido.pronto')}</span><strong>{fmtQuantidade(cardStats.itensProntos)}{unicaUnidade ? ` ${unicaUnidade}` : ''}</strong></p>
                        <p className="cg-tooltip__row"><span>{t('pedido.saldo_vivo')}</span><strong>{fmtQuantidade(cardStats.qtdAtualTotal)}{unicaUnidade ? ` ${unicaUnidade}` : ''}</strong></p>
                      </>
                  }
                </>}
              />
            )
          }

          if (pref.id === 'cobertura_pendente') {
            return (
              <CardBasicoGlobal
                key="cobertura_pendente"
                titulo={t('pedido.cobertura_pendente')}
                icone={<Warning weight="duotone" size={16} style={{ color: '#f87171' }} />}
                valor={fmtMoedaCard(cardStats.coberturaPend)}
                variante="erro"
                subtexto={t('pedido.sem_cobertura')}
                tooltip={<p className="cg-tooltip__row"><span>{t('pedido.aguardando_cobertura')}</span><strong>{pedidosBase.filter(p => (p.itens ?? []).some(i => i.cobertura_cambial === 'sem_cobertura')).length}</strong></p>}
              />
            )
          }

          const registryEntry = CARD_REGISTRY[pref.id]
          if (registryEntry) {
            const def = CARDS_CATALOGO.find(c => c.id === pref.id)
            const titulo = def ? t(def.labelKey) : pref.id
            const valor = registryEntry.format(registryEntry.getValue(cardStats))
            return (
              <CardBasicoGlobal
                key={pref.id}
                titulo={titulo}
                icone={registryEntry.icone}
                valor={valor}
                variante={registryEntry.variante}
                subtexto={registryEntry.subtexto(t, cardStats)}
                tooltip={registryEntry.tooltip(t, pedidosBase, cardStats)}
              />
            )
          }

          return null
        })}
      </div>
    </div>
  )
}
