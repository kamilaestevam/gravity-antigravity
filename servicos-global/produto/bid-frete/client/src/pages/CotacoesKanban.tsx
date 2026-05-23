/**
 * CotacoesKanban.tsx — Kanban de Cotações com colunas dinâmicas
 * Colunas geradas a partir do status config (API → localStorage)
 */

import React, { useState, useEffect, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Package } from '@phosphor-icons/react'
import type { Cotacao, StatusCotacaoBidFreteConfig } from '../shared/types'
import { lerStatusConfigLocal, obterInfoStatus } from '../shared/types'
import { getStatusConfig } from '../shared/api'
import { sincronizarStatusLocal } from '../shared/types'

interface CotacoesKanbanProps {
  cotacoes: Cotacao[]
  carregando: boolean
  onRefresh: () => void
}

/** Gera cor de fundo com transparência */
function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  if (isNaN(r) || isNaN(g) || isNaN(b)) return `rgba(100,116,139,${alpha})`
  return `rgba(${r},${g},${b},${alpha})`
}

export default function CotacoesKanban({ cotacoes, carregando, onRefresh }: CotacoesKanbanProps) {
  const { t } = useTranslation()
  const [statusConfig, setStatusConfig] = useState<StatusCotacaoBidFreteConfig[]>(() => lerStatusConfigLocal())

  useEffect(() => {
    let cancelado = false
    async function carregar() {
      try {
        const lista = await getStatusConfig()
        if (cancelado) return
        setStatusConfig(lista)
        sincronizarStatusLocal(lista)
      } catch { /* usa localStorage */ }
    }
    carregar()
    return () => { cancelado = true }
  }, [])

  // Ocultar colunas via config do Configurador
  const colunasOcultas = useMemo(() => {
    try {
      const raw = localStorage.getItem('bid-frete:config:kanban-colunas-ocultas')
      if (raw) return JSON.parse(raw) as string[]
    } catch { /* ignore */ }
    return [] as string[]
  }, [])

  const colunasVisiveis = useMemo(() =>
    statusConfig.filter(s => !colunasOcultas.includes(s.nome_status_cotacao_bid_frete)),
    [statusConfig, colunasOcultas]
  )

  const cotacoesPorStatus = useMemo(() => {
    const mapa: Record<string, Cotacao[]> = {}
    for (const s of colunasVisiveis) {
      mapa[s.nome_status_cotacao_bid_frete] = []
    }
    for (const c of cotacoes) {
      if (mapa[c.status]) {
        mapa[c.status].push(c)
      }
    }
    return mapa
  }, [cotacoes, colunasVisiveis])

  if (carregando) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
        {t('comum.carregando', 'Carregando...')}
      </div>
    )
  }

  if (colunasVisiveis.length === 0) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', padding: '3rem', color: 'var(--text-muted)' }}>
        <Package size={40} weight="duotone" />
        <span>{t('bidfrete.kanban.semColunas', 'Nenhum status configurado')}</span>
      </div>
    )
  }

  return (
    <div style={{
      display: 'flex',
      gap: '0.75rem',
      overflowX: 'auto',
      padding: '0.5rem 0',
      flex: 1,
      minHeight: 0,
    }}>
      {colunasVisiveis.map(s => {
        const info = obterInfoStatus(s.nome_status_cotacao_bid_frete, statusConfig)
        const items = cotacoesPorStatus[s.nome_status_cotacao_bid_frete] ?? []
        return (
          <div key={s.id_status_cotacao_bid_frete} style={{
            display: 'flex',
            flexDirection: 'column',
            minWidth: '280px',
            maxWidth: '320px',
            background: 'var(--bg-surface, #1e293b)',
            borderRadius: '0.75rem',
            border: '1px solid var(--border-subtle, rgba(255,255,255,0.06))',
            overflow: 'hidden',
          }}>
            {/* Header da coluna */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.75rem 1rem',
              borderBottom: `2px solid ${info.cor}`,
            }}>
              <span style={{
                width: '8px', height: '8px', borderRadius: '50%',
                background: info.cor, flexShrink: 0,
              }} />
              <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary, #f1f5f9)' }}>
                {info.rotulo}
              </span>
              <span style={{
                marginLeft: 'auto',
                fontSize: '0.6875rem',
                fontWeight: 600,
                color: info.cor,
                background: hexToRgba(info.cor, 0.12),
                padding: '0.125rem 0.5rem',
                borderRadius: '9999px',
              }}>
                {items.length}
              </span>
            </div>

            {/* Cards */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '0.5rem',
              padding: '0.5rem',
              overflowY: 'auto',
              flex: 1,
            }}>
              {items.length === 0 ? (
                <div style={{
                  padding: '1.5rem 0.5rem',
                  textAlign: 'center',
                  fontSize: '0.75rem',
                  color: 'var(--text-muted, #64748b)',
                }}>
                  {t('bidfrete.kanban.semCotacoes', 'Nenhuma cotação')}
                </div>
              ) : (
                items.map(c => (
                  <div key={c.id} style={{
                    background: 'var(--bg-card, #0f172a)',
                    borderRadius: '0.5rem',
                    padding: '0.75rem',
                    border: '1px solid var(--border-subtle, rgba(255,255,255,0.06))',
                    cursor: 'pointer',
                    transition: 'border-color 0.15s',
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                      <span style={{
                        fontFamily: 'DM Mono, monospace',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        color: 'var(--accent, #6366f1)',
                      }}>
                        {c.numero}
                      </span>
                      <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted, #64748b)' }}>
                        {c.modal}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.8125rem', color: 'var(--text-primary, #f1f5f9)', marginBottom: '0.25rem' }}>
                      {c.origem_nome} → {c.destino_nome}
                    </div>
                    {c.valor_alvo != null && (
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary, #94a3b8)' }}>
                        {c.moeda_alvo} {c.valor_alvo.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
