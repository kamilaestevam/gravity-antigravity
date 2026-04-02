/**
 * Configuracoes.tsx — Página de configurações do produto Pedido
 *
 * Estrutura em categorias expansível:
 *  ├── Cards       ← toggle visibilidade + reordenar (ativo)
 *  ├── Tabela      ← colunas padrão, filtros salvos (em breve)
 *  ├── Notificações ← alertas e gatilhos (em breve)
 *  └── Exportação  ← formato e campos padrão (em breve)
 */

import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  SquaresFour, Table, Bell, DownloadSimple,
  ArrowUp, ArrowDown, ArrowCounterClockwise, Eye,
  Package, CurrencyDollar, Scales,
} from '@phosphor-icons/react'
import { TooltipGlobal } from '@nucleo/tooltip-global'
import { useCardPreferences, CARDS_CATALOGO } from '../shared/useCardPreferences'
import './Configuracoes.css'

// ─── Mapa visual dos cards ────────────────────────────────────────────────────

const CARD_VISUAL: Record<string, { icone: React.ReactNode; cor: string }> = {
  total_pedidos: { icone: <Package        weight="duotone" size={18} />, cor: 'var(--ws-accent, #818cf8)' },
  valor_total:   { icone: <CurrencyDollar weight="duotone" size={18} />, cor: '#34d399' },
  qtd_total:     { icone: <Scales         weight="duotone" size={18} />, cor: '#fbbf24' },
}

// ─── Categorias de configuração ───────────────────────────────────────────────

const CATEGORIAS = [
  { id: 'cards',        label: 'Cards',         icone: <SquaresFour   size={15} weight="duotone" />, ativo: true  },
  { id: 'tabela',       label: 'Tabela',        icone: <Table         size={15} weight="duotone" />, ativo: false },
  { id: 'notificacoes', label: 'Notificações',  icone: <Bell          size={15} weight="duotone" />, ativo: false },
  { id: 'exportacao',   label: 'Exportação',    icone: <DownloadSimple size={15} weight="duotone" />, ativo: false },
] as const

type CategoriaId = (typeof CATEGORIAS)[number]['id']

// ─── Componente ───────────────────────────────────────────────────────────────

export default function Configuracoes() {
  const { t } = useTranslation()
  const [categoria, setCategoria] = useState<CategoriaId>('cards')
  const { prefs, toggle, mover, resetar } = useCardPreferences()

  return (
    <div className="cfg-page ws-fade-up">

      {/* ── Sidebar de categorias ── */}
      <aside className="cfg-sidebar">
        <p className="cfg-sidebar__titulo">Configurações</p>
        <nav className="cfg-sidebar__nav">
          {CATEGORIAS.map(cat => (
            <button
              key={cat.id}
              type="button"
              className={[
                'cfg-sidebar__item',
                categoria === cat.id   ? 'cfg-sidebar__item--ativo'  : '',
                !cat.ativo             ? 'cfg-sidebar__item--breve'  : '',
              ].filter(Boolean).join(' ')}
              onClick={() => { if (cat.ativo) setCategoria(cat.id) }}
            >
              <span className="cfg-sidebar__item-icon">{cat.icone}</span>
              <span className="cfg-sidebar__item-label">{cat.label}</span>
              {!cat.ativo && <span className="cfg-badge-breve">Em breve</span>}
            </button>
          ))}
        </nav>
      </aside>

      {/* ── Conteúdo ── */}
      <main className="cfg-conteudo">

        {/* ── Cards ── */}
        {categoria === 'cards' && (
          <section className="cfg-secao">
            <div className="cfg-secao__header">
              <div>
                <h2 className="cfg-secao__titulo">Cards de métricas</h2>
                <p className="cfg-secao__desc">
                  Escolha quais indicadores exibir no topo da lista e em qual ordem
                </p>
              </div>
              <TooltipGlobal descricao="Restaura a visibilidade e ordem originais dos cards">
                <button type="button" className="cfg-reset-btn" onClick={resetar}>
                  <ArrowCounterClockwise size={13} weight="bold" />
                  Restaurar padrão
                </button>
              </TooltipGlobal>
            </div>

            <div className="cfg-cards-lista">
              {prefs.map((pref, idx) => {
                const def    = CARDS_CATALOGO.find(c => c.id === pref.id)!
                const visual = CARD_VISUAL[pref.id]

                return (
                  <div
                    key={pref.id}
                    className={`cfg-card-row${!pref.visible ? ' cfg-card-row--oculto' : ''}`}
                  >
                    {/* Posição / reordenar */}
                    <div className="cfg-card-row__pos">
                      <span className="cfg-card-row__num">{idx + 1}</span>
                      <div className="cfg-card-row__arrows">
                        <button
                          type="button"
                          className="cfg-arrow-btn"
                          onClick={() => mover(pref.id, 'up')}
                          disabled={idx === 0}
                          aria-label="Mover para cima"
                        >
                          <ArrowUp size={10} weight="bold" />
                        </button>
                        <button
                          type="button"
                          className="cfg-arrow-btn"
                          onClick={() => mover(pref.id, 'down')}
                          disabled={idx === prefs.length - 1}
                          aria-label="Mover para baixo"
                        >
                          <ArrowDown size={10} weight="bold" />
                        </button>
                      </div>
                    </div>

                    {/* Ícone + nome + descrição */}
                    <div className="cfg-card-row__info">
                      <span className="cfg-card-row__icone" style={{ color: visual.cor }}>
                        {visual.icone}
                      </span>
                      <div>
                        <p className="cfg-card-row__nome">{t(def.labelKey)}</p>
                        <p className="cfg-card-row__desc">{t(def.descKey)}</p>
                      </div>
                    </div>

                    {/* Toggle */}
                    <button
                      type="button"
                      role="switch"
                      aria-checked={pref.visible}
                      aria-label={pref.visible ? 'Ocultar card' : 'Exibir card'}
                      className={`cfg-toggle${pref.visible ? ' cfg-toggle--on' : ''}`}
                      onClick={() => toggle(pref.id)}
                    >
                      <span className="cfg-toggle__thumb" />
                    </button>
                  </div>
                )
              })}
            </div>

            <p className="cfg-hint">
              <Eye size={12} weight="bold" />
              Cards ocultos não aparecem na lista, mas os dados continuam sendo calculados
            </p>
          </section>
        )}

      </main>
    </div>
  )
}
