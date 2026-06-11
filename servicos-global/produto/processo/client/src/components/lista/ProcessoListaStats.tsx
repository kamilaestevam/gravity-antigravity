/**
 * ProcessoListaStats — cards de totais da lista (paridade TodosProcessosLista).
 */
import React, { useMemo } from 'react'
import {
  Cube, Hourglass, ClockCountdown, Warning, CheckCircle, CurrencyDollar, Scales,
} from '@phosphor-icons/react'
import type { ProcessoAvoLinha } from '../../shared/lista/mockListaHierarquica'
import { fmtMoeda, fmtPeso } from '../../pages/todos/_mocks'

interface ProcessoListaStatsProps {
  processos: readonly ProcessoAvoLinha[]
}

export function ProcessoListaStats({ processos }: ProcessoListaStatsProps) {
  const stats = useMemo(() => {
    const total = processos.length
    const hoje = new Date()
    const emAndamento = processos.filter(p => p.etapa_atual !== 'concluido').length
    const concluidos = processos.filter(p => p.etapa_atual === 'concluido').length
    const emAtraso = processos.filter(p =>
      p.data_chegada
      && new Date(p.data_chegada) < hoje
      && p.etapa_atual !== 'concluido',
    ).length
    const emAlerta = processos.filter(p => {
      if (p.data_embarque) return false
      const dias = (hoje.getTime() - new Date(p.data_criacao_processo).getTime()) / (1000 * 60 * 60 * 24)
      return dias > 30
    }).length
    const valorFobUSD = processos
      .filter(p => p.moeda_agregada === 'USD')
      .reduce((s, p) => s + p.valor_total_agregado, 0)
    const valorFobEUR = processos
      .filter(p => p.moeda_agregada === 'EUR')
      .reduce((s, p) => s + p.valor_total_agregado, 0)
    const pesoBrutoTotal = processos.reduce((s, p) => s + p.peso_bruto_agregado, 0)
    return { total, emAndamento, concluidos, emAtraso, emAlerta, valorFobUSD, valorFobEUR, pesoBrutoTotal }
  }, [processos])

  return (
    <div className="tp-stats pl-stats">
      <div className="tp-stat-card">
        <span className="tp-stat-icon-inline"><Cube weight="duotone" size={12} /></span>
        <span className="tp-stat-label">Total de Processos</span>
        <strong className="tp-stat-valor">{stats.total}</strong>
        <span className="tp-stat-sub">{stats.total} na lista</span>
      </div>
      <div className="tp-stat-card">
        <span className="tp-stat-icon-inline"><Hourglass weight="duotone" size={12} /></span>
        <span className="tp-stat-label">Em Andamento</span>
        <strong className="tp-stat-valor">{stats.emAndamento}</strong>
        <span className="tp-stat-sub">Processos em andamento</span>
      </div>
      <div className="tp-stat-card">
        <span className="tp-stat-icon-inline"><ClockCountdown weight="duotone" size={12} /></span>
        <span className="tp-stat-label">Em Atraso</span>
        <strong className="tp-stat-valor">{stats.emAtraso}</strong>
        <span className="tp-stat-sub">Chegada vencida</span>
      </div>
      <div className="tp-stat-card">
        <span className="tp-stat-icon-inline"><Warning weight="duotone" size={12} /></span>
        <span className="tp-stat-label">Em Alerta</span>
        <strong className="tp-stat-valor">{stats.emAlerta}</strong>
        <span className="tp-stat-sub">Sem embarque há 30d+</span>
      </div>
      <div className="tp-stat-card">
        <span className="tp-stat-icon-inline"><CheckCircle weight="duotone" size={12} /></span>
        <span className="tp-stat-label">Concluídos</span>
        <strong className="tp-stat-valor">{stats.concluidos}</strong>
        <span className="tp-stat-sub">Encerrados / entregues</span>
      </div>
      <div className="tp-stat-card">
        <span className="tp-stat-icon-inline"><CurrencyDollar weight="duotone" size={12} /></span>
        <span className="tp-stat-label">Valor FOB — USD</span>
        <strong className="tp-stat-valor">{fmtMoeda(stats.valorFobUSD, 'USD')}</strong>
        <span className="tp-stat-sub">+ {fmtMoeda(stats.valorFobEUR, 'EUR')} em EUR</span>
      </div>
      <div className="tp-stat-card">
        <span className="tp-stat-icon-inline"><Scales weight="duotone" size={12} /></span>
        <span className="tp-stat-label">Peso Bruto Total</span>
        <strong className="tp-stat-valor">{fmtPeso(stats.pesoBrutoTotal)}</strong>
        <span className="tp-stat-sub">Soma de todos</span>
      </div>
    </div>
  )
}
