/**
 * grade-produtos-core.tsx — grade do /core (Hub) com zonas Meus produtos vs Como fornecedor.
 */

import React from 'react'
import { ArrowUpRight, Handshake, ShoppingBagOpen } from '@phosphor-icons/react'
import type { CardProdutoCoreExibicao } from '../shared/entrada-produtos-core'
import {
  agruparCardsProdutosCore,
  temDuasZonasProdutosCore,
} from '../shared/agrupamento-cards-produtos-core'
import { resolverProdVisualHub, type ProdVisualBase } from '../utils/resolver-prod-visual-hub'

interface ProdVisualHub extends ProdVisualBase {
  icon: React.ReactNode
  description: string
}

export interface GradeProdutosCoreProps {
  cards: CardProdutoCoreExibicao[]
  prodVisual: Record<string, ProdVisualHub>
  defaultVisual: ProdVisualHub
  onAbrirProduto: (rota: string) => void
  t: (key: string, defaultValue?: string) => string
}

function CardProdutoHub({
  card,
  prodVisual,
  defaultVisual,
  modoFornecedor,
  onAbrir,
  t,
}: {
  card: CardProdutoCoreExibicao
  prodVisual: Record<string, ProdVisualHub>
  defaultVisual: ProdVisualHub
  modoFornecedor: boolean
  onAbrir: (rota: string) => void
  t: GradeProdutosCoreProps['t']
}) {
  const p = card.produto
  const v = resolverProdVisualHub(card.slug, prodVisual, defaultVisual, p.product_key)
  const descricao = modoFornecedor
    ? t(
        'hub.produto_fornecedor_desc',
        'Responda cotações e envie propostas como prestador convidado neste workspace.',
      )
    : (p.catalog?.description ?? v.description)

  return (
    <div
      key={card.key}
      className={modoFornecedor ? 'hb-prod-card hb-prod-card--fornecedor' : 'hb-prod-card'}
      style={{ '--hb-prod-color': v.color, '--hb-prod-dim': v.dim } as React.CSSProperties}
      onClick={() => onAbrir(card.rota)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onAbrir(card.rota)
        }
      }}
    >
      <div className="hb-prod-top">
        <div className="hb-prod-icon">{v.icon}</div>
        <span
          className={
            modoFornecedor
              ? 'hb-prod-status hb-prod-status--fornecedor'
              : 'hb-prod-status hb-prod-status--active'
          }
        >
          {modoFornecedor
            ? t('hub.produto_papel_fornecedor', 'Fornecedor')
            : t('hub.produto_ativo')}
        </span>
      </div>
      <div>
        <div className="hb-prod-name">{card.nome}</div>
        <div className="hb-prod-desc">{descricao}</div>
      </div>
      <div className="hb-prod-footer">
        <span className="hb-prod-stat">
          {modoFornecedor
            ? t('hub.produto_acessar_cotacoes', 'Acessar cotações')
            : t('hub.produto_acessar')}
        </span>
        <div className="hb-prod-arrow">
          <ArrowUpRight weight="bold" size={14} />
        </div>
      </div>
    </div>
  )
}

function GradeCards({
  cards,
  prodVisual,
  defaultVisual,
  modoFornecedor,
  onAbrir,
  t,
}: {
  cards: CardProdutoCoreExibicao[]
  prodVisual: Record<string, ProdVisualHub>
  defaultVisual: ProdVisualHub
  modoFornecedor: boolean
  onAbrir: (rota: string) => void
  t: GradeProdutosCoreProps['t']
}) {
  return (
    <div className="hb-products-grid">
      {cards.map(card => (
        <CardProdutoHub
          key={card.key}
          card={card}
          prodVisual={prodVisual}
          defaultVisual={defaultVisual}
          modoFornecedor={modoFornecedor}
          onAbrir={onAbrir}
          t={t}
        />
      ))}
    </div>
  )
}

export function GradeProdutosCore({
  cards,
  prodVisual,
  defaultVisual,
  onAbrirProduto,
  t,
}: GradeProdutosCoreProps) {
  const grupo = agruparCardsProdutosCore(cards)
  const duasZonas = temDuasZonasProdutosCore(grupo)

  if (!duasZonas) {
    const lista = grupo.meusProdutos.length > 0 ? grupo.meusProdutos : grupo.comoFornecedor
    const soFornecedor = grupo.comoFornecedor.length > 0 && grupo.meusProdutos.length === 0
    return (
      <div className={soFornecedor ? 'hb-prod-zone hb-prod-zone--fornecedor hb-prod-zone--unica' : undefined}>
        {soFornecedor && (
          <div className="hb-prod-zone-head">
            <div className="hb-prod-zone-icon">
              <Handshake weight="duotone" size={22} />
            </div>
            <div>
              <h3 className="hb-prod-zone-title">
                {t('hub.zona_como_fornecedor', 'Como fornecedor')}
              </h3>
              <p className="hb-prod-zone-sub">
                {t(
                  'hub.zona_como_fornecedor_sub',
                  'Produtos em que você atua como prestador convidado — cotações e propostas.',
                )}
              </p>
            </div>
          </div>
        )}
        <GradeCards
          cards={lista}
          prodVisual={prodVisual}
          defaultVisual={defaultVisual}
          modoFornecedor={soFornecedor}
          onAbrir={onAbrirProduto}
          t={t}
        />
      </div>
    )
  }

  return (
    <div className="hb-prod-zonas">
      <section className="hb-prod-zone hb-prod-zone--workspace" aria-labelledby="hb-zona-meus-produtos">
        <div className="hb-prod-zone-head hb-prod-zone-head--compact">
          <div className="hb-prod-zone-icon hb-prod-zone-icon--workspace">
            <ShoppingBagOpen weight="duotone" size={20} />
          </div>
          <div>
            <h3 id="hb-zona-meus-produtos" className="hb-prod-zone-title">
              {t('hub.zona_meus_produtos', 'Meus produtos')}
            </h3>
            <p className="hb-prod-zone-sub">
              {t(
                'hub.zona_meus_produtos_sub',
                'Módulos operacionais do workspace — gestão, listas e relatórios.',
              )}
            </p>
          </div>
        </div>
        <GradeCards
          cards={grupo.meusProdutos}
          prodVisual={prodVisual}
          defaultVisual={defaultVisual}
          modoFornecedor={false}
          onAbrir={onAbrirProduto}
          t={t}
        />
      </section>

      <section
        className="hb-prod-zone hb-prod-zone--fornecedor"
        aria-labelledby="hb-zona-fornecedor"
      >
        <div className="hb-prod-zone-head">
          <div className="hb-prod-zone-icon">
            <Handshake weight="duotone" size={22} />
          </div>
          <div>
            <h3 id="hb-zona-fornecedor" className="hb-prod-zone-title">
              {t('hub.zona_como_fornecedor', 'Como fornecedor')}
            </h3>
            <p className="hb-prod-zone-sub">
              {t(
                'hub.zona_como_fornecedor_sub',
                'Visões para responder convites de cotação — sem misturar com o painel operacional.',
              )}
            </p>
          </div>
        </div>
        <GradeCards
          cards={grupo.comoFornecedor}
          prodVisual={prodVisual}
          defaultVisual={defaultVisual}
          modoFornecedor
          onAbrir={onAbrirProduto}
          t={t}
        />
      </section>
    </div>
  )
}
