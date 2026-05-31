/**
 * Pedidos.tsx — Pedidos vinculados ao processo atual
 *
 * Versao simplificada: ao inves de replicar o TabelaVirtualGlobal do produto
 * Pedido, mostra os pedidos do processo (vem do contexto useProcesso) em
 * cards visuais — Painel de Insights no topo + lista de cards.
 *
 * Para listagem completa, busca avancada, kanban, importacao etc., o usuario
 * vai ao produto Pedido via link "Ver no Pedido" em cada card.
 */

import React from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { PaginaGlobal } from '@nucleo/pagina-global'
import { CabecalhoGlobal } from '@nucleo/cabecalho-global'
import { BotaoGlobal } from '@nucleo/botao-global'
import { TooltipGlobal } from '@nucleo/tooltip-global'
import {
  Package,
  CurrencyDollar,
  Scales,
  ListChecks,
  ArrowSquareOut,
  Plus,
  CalendarBlank,
  MapPin,
} from '@phosphor-icons/react'
import { useProcesso } from '../ProcessoLayout'
import type { Pedido, StatusPedido } from '../../shared/types'
import './Pedidos.css'

// ─── Helpers ────────────────────────────────────────────────────────────────

const fmtMoney = (val: number, moeda = 'USD') =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: moeda }).format(val)

const fmtPeso = (val: number) =>
  `${val.toLocaleString('pt-BR', { maximumFractionDigits: 0 })} kg`

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit' })

// Cor + label de cada status do pedido (mesma paleta semantica usada em outros lugares).
const STATUS_META: Record<StatusPedido, { label: string; color: string; dim: string }> = {
  pendente:      { label: 'Pendente',      color: '#f59e0b', dim: 'rgba(245, 158, 11, 0.15)' },
  confirmado:    { label: 'Confirmado',    color: '#22d3ee', dim: 'rgba(34, 211, 238, 0.15)' },
  em_transito:   { label: 'Em trânsito',   color: '#a78bfa', dim: 'rgba(167, 139, 250, 0.15)' },
  desembaracado: { label: 'Desembaraçado', color: '#818cf8', dim: 'rgba(129, 140, 248, 0.15)' },
  entregue:      { label: 'Entregue',      color: '#34d399', dim: 'rgba(52, 211, 153, 0.15)' },
  cancelado:     { label: 'Cancelado',     color: '#f87171', dim: 'rgba(248, 113, 113, 0.15)' },
}

// Bandeira por sigla ISO-2 do pais (emoji unicode). Fallback: globo.
const flagEmoji = (iso2: string): string => {
  if (!iso2 || iso2.length !== 2) return '🌐'
  const A = 0x1F1E6
  const codes = iso2.toUpperCase().split('').map(c => A + (c.charCodeAt(0) - 'A'.charCodeAt(0)))
  return String.fromCodePoint(...codes)
}

// ─── Componente ─────────────────────────────────────────────────────────────

export default function Pedidos() {
  const { t } = useTranslation()
  const { processo, loading } = useProcesso()

  if (loading && !processo) {
    return (
      <PaginaGlobal
        layout="lista"
        cabecalho={<CabecalhoGlobal icone={<Package weight="duotone" size={22} />} titulo="Pedidos" />}
      >
        <div className="proc-empty-state"><Package weight="duotone" size={48} color="var(--text-muted)" /></div>
      </PaginaGlobal>
    )
  }

  const pedidos: Pedido[] = processo?.pedidos ?? []

  // ── Agregados para o Painel de Insights ──
  // Somatorios por moeda (carrega mix BRL/USD sem misturar).
  const totaisPorMoeda = pedidos.reduce<Record<string, number>>((acc, p) => {
    const m = p.moeda || 'USD'
    acc[m] = (acc[m] || 0) + (p.valor_fob || 0)
    return acc
  }, {})
  const moedaPrincipal = Object.keys(totaisPorMoeda)[0] || 'USD'
  const valorPrincipal = totaisPorMoeda[moedaPrincipal] || 0

  const totalItens = pedidos.reduce((acc, p) => acc + (p.itens?.length ?? 0), 0)
  const pesoTotal = pedidos.reduce((acc, p) => acc + (p.peso_bruto || 0), 0)
  // Top NCMs (mais frequentes nos itens) — opcional, exibido como sub-info.
  const ncmCount = pedidos.flatMap(p => p.itens ?? []).reduce<Record<string, number>>((acc, it) => {
    if (it.ncm) acc[it.ncm] = (acc[it.ncm] || 0) + 1
    return acc
  }, {})
  const topNcms = Object.entries(ncmCount).sort(([, a], [, b]) => b - a).slice(0, 2).map(([k]) => k)

  // Distribuicao de status para o 3o card.
  const statusCount = pedidos.reduce<Record<string, number>>((acc, p) => {
    acc[p.status] = (acc[p.status] || 0) + 1
    return acc
  }, {})
  const aprovados = (statusCount.confirmado || 0) + (statusCount.em_transito || 0) +
                    (statusCount.desembaracado || 0) + (statusCount.entregue || 0)
  const pendentes = (statusCount.pendente || 0)
  const cancelados = (statusCount.cancelado || 0)

  // ── Renderizacao ──

  return (
    <PaginaGlobal
      className="ws-fade-up"
      layout="lista"
      cabecalho={
        <CabecalhoGlobal
          icone={<Package weight="duotone" size={22} />}
          titulo={t('processo.pedidos.titulo', 'Pedidos')}
          subtitulo={t('processo.pedidos.subtitulo', 'Pedidos de compra vinculados a este processo')}
          acoes={
            <TooltipGlobal
              titulo={t('processo.pedidos.associar', 'Associar pedido')}
              descricao={t('processo.pedidos.associar_desc', 'Vincular um pedido existente do tenant a este processo')}
            >
              {/* TODO: abrir modal de busca/associacao de pedido existente */}
              <BotaoGlobal variante="secundario" tamanho="pequeno" onClick={() => { /* TODO */ }}>
                <Plus weight="bold" size={14} />
                <span style={{ marginLeft: 6 }}>{t('processo.pedidos.associar', 'Associar pedido')}</span>
              </BotaoGlobal>
            </TooltipGlobal>
          }
        />
      }
    >
      {pedidos.length === 0 ? (
        <div className="pp-empty ws-fade-up">
          <Package weight="duotone" size={48} className="pp-empty-icon" />
          <h3 className="pp-empty-title">{t('processo.pedidos.vazio', 'Nenhum pedido vinculado')}</h3>
          <p className="pp-empty-desc">
            {t('processo.pedidos.vazio_desc', 'Use o botão acima para vincular um pedido existente a este processo.')}
          </p>
        </div>
      ) : (
        <>
          {/* ─── Painel de Insights (3 cards) ─────────────────────────── */}
          <div className="pp-insights ws-fade-up">
            <div className="pp-insights-title">{t('processo.pedidos.insights', 'Painel de Insights')}</div>
            <div className="pp-insights-grid">

              {/* Card 1 — Valor FOB total */}
              <div className="pp-insight-card">
                <div className="pp-insight-card-header">
                  <span className="pp-insight-card-label">{t('processo.pedidos.valor_fob', 'Valor FOB total')}</span>
                  <CurrencyDollar weight="fill" size={20} style={{ color: '#facc15' }} />
                </div>
                <div className="pp-insight-card-metric">{fmtMoney(valorPrincipal, moedaPrincipal)}</div>
                <div className="pp-insight-card-stats">
                  <div className="pp-insight-stat">
                    <div className="pp-insight-stat-label">{t('processo.pedidos.pedidos', 'Pedidos')}</div>
                    <div className="pp-insight-stat-value">{pedidos.length}</div>
                  </div>
                  {Object.entries(totaisPorMoeda).length > 1 && (
                    <div className="pp-insight-stat">
                      <div className="pp-insight-stat-label">{t('processo.pedidos.moedas', 'Moedas')}</div>
                      <div className="pp-insight-stat-value">{Object.keys(totaisPorMoeda).join(' · ')}</div>
                    </div>
                  )}
                </div>
              </div>

              {/* Card 2 — Mercadoria */}
              <div className="pp-insight-card">
                <div className="pp-insight-card-header">
                  <span className="pp-insight-card-label">{t('processo.pedidos.mercadoria', 'Mercadoria')}</span>
                  <Scales weight="fill" size={20} style={{ color: '#a78bfa' }} />
                </div>
                <div className="pp-insight-card-metric">{totalItens} {totalItens === 1 ? 'item' : 'itens'}</div>
                <div className="pp-insight-card-stats">
                  <div className="pp-insight-stat">
                    <div className="pp-insight-stat-label">{t('processo.pedidos.peso_bruto', 'Peso bruto')}</div>
                    <div className="pp-insight-stat-value">{fmtPeso(pesoTotal)}</div>
                  </div>
                  {topNcms.length > 0 && (
                    <div className="pp-insight-stat">
                      <div className="pp-insight-stat-label">{t('processo.pedidos.top_ncms', 'Top NCMs')}</div>
                      <div className="pp-insight-stat-value">{topNcms.join(' · ')}</div>
                    </div>
                  )}
                </div>
              </div>

              {/* Card 3 — Status */}
              <div className="pp-insight-card">
                <div className="pp-insight-card-header">
                  <span className="pp-insight-card-label">{t('processo.pedidos.status', 'Status')}</span>
                  <ListChecks weight="fill" size={20} style={{ color: '#34d399' }} />
                </div>
                <div className="pp-insight-card-metric">
                  {aprovados}/{pedidos.length}
                </div>
                <div className="pp-insight-card-stats">
                  <div className="pp-insight-stat">
                    <div className="pp-insight-stat-label">{t('processo.pedidos.aprovados', 'Aprovados')}</div>
                    <div className="pp-insight-stat-value">{aprovados}</div>
                  </div>
                  <div className="pp-insight-stat">
                    <div className="pp-insight-stat-label">{t('processo.pedidos.pendentes', 'Pendentes')}</div>
                    <div className="pp-insight-stat-value">{pendentes}</div>
                  </div>
                  {cancelados > 0 && (
                    <div className="pp-insight-stat">
                      <div className="pp-insight-stat-label">{t('processo.pedidos.cancelados', 'Cancelados')}</div>
                      <div className="pp-insight-stat-value">{cancelados}</div>
                    </div>
                  )}
                </div>
              </div>

            </div>
          </div>

          {/* ─── Lista de Pedidos (cards) ─────────────────────────────── */}
          <div className="pp-list ws-fade-up">
            <div className="pp-list-header">
              <h3 className="pp-list-title">
                {t('processo.pedidos.lista_titulo', 'Pedidos do processo')}
                <span className="pp-list-count">{pedidos.length}</span>
              </h3>
            </div>

            <div className="pp-list-items">
              {pedidos.map(p => {
                const st = STATUS_META[p.status] || STATUS_META.pendente
                const itens = p.itens ?? []
                const visiveis = itens.slice(0, 3)
                const restantes = itens.length - visiveis.length

                return (
                  <article key={p.id} className="pp-card">
                    <header className="pp-card-header">
                      <div className="pp-card-head-left">
                        <span className="pp-card-numero">{p.numero}</span>
                        <span
                          className="pp-card-status"
                          style={{ background: st.dim, color: st.color, borderColor: st.color }}
                        >
                          {st.label}
                        </span>
                      </div>
                      <div className="pp-card-valor">{fmtMoney(p.valor_fob, p.moeda)}</div>
                    </header>

                    <div className="pp-card-meta">
                      <span className="pp-card-meta-item">
                        <span className="pp-card-flag" aria-hidden>{flagEmoji(p.exportador_pais)}</span>
                        <MapPin weight="duotone" size={14} className="pp-card-meta-icon" />
                        {p.exportador_nome}
                      </span>
                      <span className="pp-card-meta-item">
                        <Scales weight="duotone" size={14} className="pp-card-meta-icon" />
                        {fmtPeso(p.peso_bruto)}
                      </span>
                      <span className="pp-card-meta-item">
                        <CalendarBlank weight="duotone" size={14} className="pp-card-meta-icon" />
                        {fmtDate(p.data_pedido)}
                      </span>
                    </div>

                    {visiveis.length > 0 && (
                      <ul className="pp-card-itens">
                        {visiveis.map(it => (
                          <li key={it.id} className="pp-card-item">
                            <span className="pp-card-item-num">#{it.numero_item}</span>
                            <span className="pp-card-item-desc" title={it.descricao}>{it.descricao}</span>
                            <span className="pp-card-item-qtd">{it.quantidade} {it.unidade}</span>
                            <span className="pp-card-item-val">{fmtMoney(it.valor_total, p.moeda)}</span>
                          </li>
                        ))}
                        {restantes > 0 && (
                          <li className="pp-card-item-more">
                            + {restantes} {restantes === 1 ? 'item' : 'itens'}
                          </li>
                        )}
                      </ul>
                    )}

                    <footer className="pp-card-footer">
                      <Link
                        to={`/pedido/pedidos/${p.id}/editar`}
                        className="pp-card-link"
                        target="_blank"
                        rel="noreferrer"
                      >
                        {t('processo.pedidos.ver_pedido', 'Ver no Pedido')}
                        <ArrowSquareOut weight="bold" size={14} />
                      </Link>
                    </footer>
                  </article>
                )
              })}
            </div>
          </div>
        </>
      )}
    </PaginaGlobal>
  )
}
