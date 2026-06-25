/**
 * puzzle-stack-produtos-gravity.tsx — peças encaixadas (puzzle) da Gravity Store.
 * Regras de owned/soon/available: lib/produtos-gravity-store-status.ts (paridade Store).
 */

import type { TFunction } from 'i18next'
import React, { Fragment, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { resolverRotaProdutoGravity } from '@gravity/shell'
import { CheckCircle, Package, ShoppingCart } from '@phosphor-icons/react'
import { iconeOficialProdutoGravity } from '@nucleo/logo-produtos'
import { TooltipGlobal } from '@nucleo/tooltip-global'
import {
  PRODUCT_META,
  descricaoExibicaoProdutoGravity,
  nomeExibicaoPecaPuzzleHub,
  nomeExibicaoProdutoGravity,
} from '../data/product-meta'
import { slugPuzzleParaCatalogo } from '../data/status-produto-store'
import {
  mapaAssinaturaAtivaPorSlug,
  mapaCatalogoPorSlugCanonico,
  rotuloMeterStackProdutos,
  slugCanonicoProdutoGravity,
  slugsPuzzleStackProdutosGravity,
  statusProdutoGravityStore,
  type AssinaturaProdutoGravityMin,
  type CatalogoProdutoGravityMin,
  type StatusProdutoGravityStore,
} from '../lib/produtos-gravity-store-status'

const ROTAS_PRODUTO: Record<string, string> = {
  'simula-custo': '/simula-custo',
  'nf-importacao': '/produto/nf-importacao',
  'nf-import': '/produto/nf-importacao',
  'bid-frete': '/bid-frete',
  'bid-frete-internacional': '/bid-frete',
  'bid-cambio': '/bid-cambio',
  pedido: '/pedido',
  processo: '/processo',
}

function rotaProduto(slug: string): string {
  if (slug in ROTAS_PRODUTO) return ROTAS_PRODUTO[slug]!
  const rotaCanonica = resolverRotaProdutoGravity(slug)
  if (rotaCanonica !== `/${slug}`) return rotaCanonica
  return `/produto/${slug}`
}

function pathPecaPuzzle(isFirst: boolean, isLast: boolean): string {
  if (isFirst && isLast) return 'M 0,0 L 120,0 L 120,90 L 0,90 Z'
  if (isFirst) return 'M 0,0 L 120,0 L 120,32 C 138,32 138,58 120,58 L 120,90 L 0,90 Z'
  if (isLast) return 'M 0,0 L 120,0 L 120,90 L 0,90 L 0,58 C 18,58 18,32 0,32 Z'
  return 'M 0,0 L 120,0 L 120,32 C 138,32 138,58 120,58 L 120,90 L 0,90 L 0,58 C 18,58 18,32 0,32 Z'
}

/** Preenchimento neutro do interior da peça no HUB — cor fica só no contorno. */
const FILL_PECA_HUB_INTERNO = 'var(--hub-puzzle-fill-interno, rgba(16, 24, 40, 0.96))'
const FILL_PECA_HUB_DISPONIVEL = 'var(--hub-puzzle-fill-disponivel, rgba(12, 18, 32, 0.94))'
const TAMANHO_ICONE_PECA_HUB = 22

const CHAVE_DESCRICAO_VISUAL_HUB: Record<string, string> = {
  'simula-custo': 'hub.produto_visual_simula_custo',
  'nf-importacao': 'hub.produto_visual_nf_importacao',
  'nf-import': 'hub.produto_visual_nf_importacao',
  processo: 'hub.produto_visual_processo',
  'bid-frete': 'hub.produto_visual_bid_frete',
  'bid-frete-internacional': 'hub.produto_visual_bid_frete',
  'bid-cambio': 'hub.produto_visual_bid_cambio',
  pedido: 'hub.produto_visual_pedido',
  'smart-read': 'hub.produto_visual_smart_read',
  lpco: 'hub.produto_visual_lpco',
}

type TradutorPeca = (key: string, defaultValue?: string) => string

function textoTooltipPecaHub(texto: string): string {
  return texto.replace(/\.+\s*$/, '').trimEnd()
}

function tooltipPecaPuzzleHub(
  slug: string,
  nomeExibicao: string,
  status: StatusProdutoGravityStore,
  t: TradutorPeca,
): { titulo: string; descricao: string } {
  const chaveCanon = slugCanonicoProdutoGravity(slug)
  const chaveI18n = CHAVE_DESCRICAO_VISUAL_HUB[chaveCanon] ?? CHAVE_DESCRICAO_VISUAL_HUB[slug]
  const descricaoBase = textoTooltipPecaHub(
    chaveI18n
      ? t(chaveI18n)
      : descricaoExibicaoProdutoGravity(slug, null, t),
  )

  if (status === 'soon') {
    return {
      titulo: nomeExibicao,
      descricao: `${descricaoBase} · ${t('store.status_em_breve', 'Em breve')}`,
    }
  }

  return { titulo: nomeExibicao, descricao: descricaoBase }
}

function envolverTooltipPecaHub(
  visualRefinado: boolean,
  tooltip: { titulo: string; descricao: string },
  peca: React.ReactElement,
): React.ReactElement {
  if (!visualRefinado) return peca
  return (
    <TooltipGlobal titulo={tooltip.titulo} descricao={tooltip.descricao}>
      {peca}
    </TooltipGlobal>
  )
}

function ConectorHubPuzzle({ visivel }: { visivel: boolean }) {
  if (!visivel) return null
  return (
    <div className="gs-hub-conector" aria-hidden="true">
      <span className="gs-hub-conector__linha" />
      <span className="gs-hub-conector__no" />
    </div>
  )
}

function coresSvgPecaHub(
  status: ReturnType<typeof statusProdutoGravityStore>,
  corProduto: string,
): { fill: string; stroke: string; strokeWidth: number } {
  if (status === 'owned') {
    return { fill: FILL_PECA_HUB_INTERNO, stroke: corProduto, strokeWidth: 1.75 }
  }
  if (status === 'available') {
    return {
      fill: FILL_PECA_HUB_DISPONIVEL,
      stroke: 'rgba(148, 163, 184, 0.28)',
      strokeWidth: 1.25,
    }
  }
  return {
    fill: FILL_PECA_HUB_DISPONIVEL,
    stroke: 'rgba(148, 163, 184, 0.18)',
    strokeWidth: 1.25,
  }
}

function iconePecaPuzzleHub(slug: string): React.ReactNode {
  const slugCanon = slugCanonicoProdutoGravity(slug)
  const usaVariantCard =
    slugCanon === 'bid-frete' || slugCanon === 'bid-cambio' || slugCanon === 'smart-read'
  return iconeOficialProdutoGravity(slug, TAMANHO_ICONE_PECA_HUB, {
    variant: usaVariantCard ? 'card' : 'default',
  })
}

function classeCorpoPecaPuzzle(isFirst: boolean): string {
  return isFirst ? 'gs-piece__body' : 'gs-piece__body gs-piece__body--indent'
}

export type PecaPuzzleStackProduto = {
  slug: string
  nome: string
  status: ReturnType<typeof statusProdutoGravityStore>
}

/** Peça extra no HUB (ex.: visão fornecedor BID — não é produto contratado). */
export type PecaPuzzleExtraHub = {
  key: string
  slugVisual: string
  /** Nome completo — tooltip e acessibilidade. */
  nome: string
  /** Rótulo curto na peça puzzle (evita texto espremido/borrado). */
  nomeExibicao: string
  rota: string
}

type ItemPecaPuzzleRender =
  | { tipo: 'produto'; peca: PecaPuzzleStackProduto }
  | { tipo: 'extra'; pecaExtra: PecaPuzzleExtraHub }

/** Insere peças extras no stack logo após o slug âncora (`slugVisual`). */
function ordenarPecasPuzzleComExtrasHub(
  pecas: PecaPuzzleStackProduto[],
  pecasExtras: PecaPuzzleExtraHub[],
): ItemPecaPuzzleRender[] {
  const extrasPorAncora = new Map<string, PecaPuzzleExtraHub[]>()
  for (const extra of pecasExtras) {
    const lista = extrasPorAncora.get(extra.slugVisual) ?? []
    lista.push(extra)
    extrasPorAncora.set(extra.slugVisual, lista)
  }

  const resultado: ItemPecaPuzzleRender[] = []
  for (const peca of pecas) {
    resultado.push({ tipo: 'produto', peca })
    const ancora = slugCanonicoProdutoGravity(peca.slug)
    const extras = extrasPorAncora.get(ancora)
    if (extras) {
      for (const extra of extras) resultado.push({ tipo: 'extra', pecaExtra: extra })
      extrasPorAncora.delete(ancora)
    }
  }

  for (const extras of extrasPorAncora.values()) {
    for (const extra of extras) resultado.push({ tipo: 'extra', pecaExtra: extra })
  }

  return resultado
}

export function pecasPuzzleStackProdutosGravity(
  catalogo: CatalogoProdutoGravityMin[],
  assinaturas: AssinaturaProdutoGravityMin[],
): PecaPuzzleStackProduto[] {
  const catalogoPorSlug = mapaCatalogoPorSlugCanonico(catalogo)
  const assinaturaAtiva = mapaAssinaturaAtivaPorSlug(assinaturas)
  const slugsStack = slugsPuzzleStackProdutosGravity(catalogo)
  return slugsStack
    .map(slug => {
      const cat = catalogo.find(p => slugCanonicoProdutoGravity(p.slug) === slug)
      return {
        slug,
        nome: cat?.name ?? slug,
        status: statusProdutoGravityStore(slug, catalogoPorSlug, assinaturaAtiva),
      }
    })
    .filter(peca => peca.status === 'owned' || peca.status === 'available')
}

export interface BarrasMeterPuzzleStackProdutosProps {
  pecas: PecaPuzzleStackProduto[]
  className?: string
  children?: React.ReactNode
}

/** Barrinhas de progresso do puzzle (módulos ativos no stack). */
export function BarrasMeterPuzzleStackProdutos({
  pecas,
  className = '',
  children,
}: BarrasMeterPuzzleStackProdutosProps) {
  if (pecas.length === 0) return null

  return (
    <div className={`gs-stack__meter${className ? ` ${className}` : ''}`}>
      <div className="gs-stack__meter-bar">
        {pecas.map(p => (
          <div
            key={p.slug}
            className={`gs-stack__seg${p.status === 'owned' ? ' gs-stack__seg--on' : ''}`}
            style={
              p.status === 'owned'
                ? ({ ['--seg-color' as string]: PRODUCT_META[p.slug]?.iconColor ?? '#818cf8' } as React.CSSProperties)
                : undefined
            }
          />
        ))}
      </div>
      {children}
    </div>
  )
}

export interface PuzzleStackProdutosGravityProps {
  /** Catálogo Admin (ATIVO + EM_BREVE) — mesmo filtro da Store. */
  catalogo: CatalogoProdutoGravityMin[]
  /** Assinaturas/contratos da organização (hub/init ou assinaturas-produto-gravity). */
  assinaturas: AssinaturaProdutoGravityMin[]
  t: TFunction
  /** Escala visual: hub = painel HUB; store = Gravity Store (mesmo visual refinado); full = legado SVG. */
  escala?: 'hub' | 'store' | 'full'
  /** HUB: contador abaixo do título do painel (só barras ficam no stack). */
  rotuloAbaixoTitulo?: boolean
  /** HUB: barras renderizadas fora do stack (ex.: ao lado do link Gravity Store). */
  ocultarMeterNoStack?: boolean
  /** HUB: hidrata sessão do workspace e abre o produto (atalho direto). */
  onAbrirProdutoContratado?: (slug: string, rota: string) => void
  /** HUB: peças extras ancoradas via `slugVisual` (ex.: BID Fornecedor após bid-frete). */
  pecasExtras?: PecaPuzzleExtraHub[]
  /** HUB paridade Store: só a faixa de peças (cabeçalho/carrossel no pai). */
  embutidoParidadeStore?: boolean
  className?: string
}

export function PuzzleStackProdutosGravity({
  catalogo,
  assinaturas,
  t,
  escala = 'full',
  rotuloAbaixoTitulo = false,
  ocultarMeterNoStack = false,
  onAbrirProdutoContratado,
  pecasExtras = [],
  embutidoParidadeStore = false,
  className = '',
}: PuzzleStackProdutosGravityProps) {
  const navigate = useNavigate()
  const visualRefinado = escala === 'hub' || escala === 'store'

  const abrirPeca = (slug: string, isOwned: boolean, isSoon: boolean) => {
    if (isSoon) return
    if (isOwned) {
      const rota = rotaProduto(slug)
      if (onAbrirProdutoContratado) onAbrirProdutoContratado(slug, rota)
      else navigate(rota)
      return
    }
    if (escala === 'store') {
      const slugCard = slugPuzzleParaCatalogo(slug)
      document.getElementById(`produto-${slugCard}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      navigate(`/store?produto=${slugCard}`, { replace: true })
      return
    }
    navigate(`/store?produto=${slug}`)
  }

  const abrirPecaExtra = (peca: PecaPuzzleExtraHub) => {
    if (onAbrirProdutoContratado) onAbrirProdutoContratado(peca.key, peca.rota)
    else navigate(peca.rota)
  }

  const pecas = useMemo(
    () => pecasPuzzleStackProdutosGravity(catalogo, assinaturas),
    [catalogo, assinaturas],
  )

  const pecasOrdenadas = useMemo(
    () => ordenarPecasPuzzleComExtrasHub(pecas, pecasExtras),
    [pecas, pecasExtras],
  )

  const ownedNoStack = pecas.filter(p => p.status === 'owned').length
  const totalStack = pecas.length
  const totalPecasVisiveis = pecasOrdenadas.length

  if (totalPecasVisiveis === 0) return null

  const escalaClass = visualRefinado ? ' gs-stack--escala-hub' : ''
  const classeBlankPeca = (isFirst: boolean) =>
    !visualRefinado && !isFirst ? ' gs-piece--has-blank' : ''

  const conteudoPecas = (
    <div className={`gs-stack__pieces${visualRefinado ? ' gs-stack__pieces--hub-conectado' : ''}`}>
      {pecasOrdenadas.map((item, pieceIdx) => {
        const isFirst = pieceIdx === 0
        const isLast = pieceIdx === totalPecasVisiveis - 1
        const path = pathPecaPuzzle(isFirst, isLast)

        if (item.tipo === 'extra') {
          const pecaExtra = item.pecaExtra
          const slugVisual = pecaExtra.slugVisual
          const metaVisual = PRODUCT_META[slugVisual]
          const corBidFrete = metaVisual?.iconColor ?? '#60a5fa'
          const nomeExibicaoBidFrete = nomeExibicaoPecaPuzzleHub(
            slugVisual,
            pecaExtra.nome,
            t as (key: string, defaultValue?: string) => string,
          )
          const { fill, stroke, strokeWidth } = visualRefinado
            ? coresSvgPecaHub('owned', corBidFrete)
            : {
                fill: metaVisual?.iconBg ?? 'rgba(96,165,250,0.18)',
                stroke: corBidFrete,
                strokeWidth: 1.5,
              }
          const tituloPeca = `${t('sw.acessar', 'Acessar')} — ${pecaExtra.nome}`
          const tooltipFornecedor = {
            titulo: nomeExibicaoBidFrete,
            descricao: textoTooltipPecaHub(t('hub.produto_visual_bid_frete')),
          }
          const ariaPecaFornecedor = visualRefinado
            ? `${tooltipFornecedor.titulo}. ${tooltipFornecedor.descricao}`
            : tituloPeca

          return (
            <Fragment key={pecaExtra.key}>
              {envolverTooltipPecaHub(
                visualRefinado,
                tooltipFornecedor,
                <div
                className={`gs-piece gs-piece--on gs-piece--fornecedor${classeBlankPeca(isFirst)}${visualRefinado ? ' gs-piece--hub-visual' : ''}`}
              style={
                visualRefinado
                  ? ({ '--piece-color': corBidFrete } as React.CSSProperties)
                  : ({ zIndex: totalPecasVisiveis - pieceIdx + 1, '--piece-color': corBidFrete } as React.CSSProperties)
              }
              role="button"
              tabIndex={0}
              title={visualRefinado ? undefined : tituloPeca}
              aria-label={ariaPecaFornecedor}
              onClick={() => abrirPecaExtra(pecaExtra)}
              onKeyDown={e => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  abrirPecaExtra(pecaExtra)
                }
              }}
            >
              {visualRefinado && (
                <span className="gs-piece__tag-fornecedor">
                  {t('hub.role_fornecedor', 'Fornecedor')}
                </span>
              )}
              <svg width="138" height="90" viewBox="0 0 138 90" className="gs-piece__svg" aria-hidden="true">
                <path d={path} fill={fill} stroke={stroke} strokeWidth={strokeWidth} strokeLinejoin="round" />
              </svg>
              <div className={classeCorpoPecaPuzzle(isFirst)}>
                <div className="gs-piece__stack">
                  <div className="gs-piece__icon">
                    {visualRefinado
                      ? iconePecaPuzzleHub(slugVisual)
                      : (metaVisual?.icon ?? <Package weight="duotone" size={20} color={corBidFrete} />)}
                  </div>
                  <span className="gs-piece__name">{nomeExibicaoBidFrete}</span>
                </div>
                <span className="gs-piece__check">
                  <CheckCircle weight="fill" size={11} color="#10b981" />
                </span>
              </div>
            </div>,
              )}
              <ConectorHubPuzzle visivel={visualRefinado && !isLast} />
            </Fragment>
          )
        }

        const peca = item.peca
        const meta = PRODUCT_META[peca.slug]
        const isOwned = peca.status === 'owned'
        const isSoon = peca.status === 'soon'
        const corProduto = meta?.iconColor ?? '#818cf8'
        const isHubNaoContratado = visualRefinado && !isOwned
        const isHubCompravel = isHubNaoContratado && !isSoon

        const { fill, stroke, strokeWidth } = visualRefinado
          ? coresSvgPecaHub(peca.status, corProduto)
          : {
              fill: isOwned
                ? (meta?.iconBg ?? 'rgba(99,102,241,0.18)')
                : 'rgba(255,255,255,0.025)',
              stroke: isOwned ? corProduto : 'rgba(255,255,255,0.09)',
              strokeWidth: 1.5,
            }

        const nomeExibicao = visualRefinado
          ? nomeExibicaoPecaPuzzleHub(
              peca.slug,
              peca.nome,
              t as (key: string, defaultValue?: string) => string,
            )
          : nomeExibicaoProdutoGravity(
              peca.slug,
              peca.nome,
              t as (key: string, defaultValue?: string) => string,
            )
        const tituloPeca = isOwned
          ? `${t('sw.acessar', 'Acessar')} — ${nomeExibicao}`
          : isSoon
            ? `${nomeExibicao} — ${t('store.em_breve', 'Em breve')}`
            : `${t('sw.assinar_na_store', 'Assinar na Store')} — ${nomeExibicao}`

        const tradutor = t as TradutorPeca
        const tooltipPeca = tooltipPecaPuzzleHub(peca.slug, nomeExibicao, peca.status, tradutor)
        const ariaPeca = visualRefinado
          ? `${tooltipPeca.titulo}. ${tooltipPeca.descricao}`
          : tituloPeca

        return (
          <Fragment key={peca.slug}>
            {envolverTooltipPecaHub(
              visualRefinado,
              tooltipPeca,
              <div
              className={`gs-piece${isOwned ? ' gs-piece--on' : ''}${isHubNaoContratado ? ' gs-piece--nao-contratado-hub' : ''}${isHubCompravel ? ' gs-piece--compravel-hub' : ''}${classeBlankPeca(isFirst)}${isSoon ? ' gs-piece--soon' : ''}${visualRefinado ? ' gs-piece--hub-visual' : ''}`}
            style={
              visualRefinado
                ? ({ '--piece-color': corProduto } as React.CSSProperties)
                : ({ zIndex: totalPecasVisiveis - pieceIdx + 1, '--piece-color': corProduto } as React.CSSProperties)
            }
            role="button"
            tabIndex={isSoon ? -1 : 0}
            title={visualRefinado ? undefined : tituloPeca}
            aria-label={ariaPeca}
            onClick={() => abrirPeca(peca.slug, isOwned, isSoon)}
            onKeyDown={e => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                abrirPeca(peca.slug, isOwned, isSoon)
              }
            }}
          >
            <svg width="138" height="90" viewBox="0 0 138 90" className="gs-piece__svg" aria-hidden="true">
              <path d={path} fill={fill} stroke={stroke} strokeWidth={strokeWidth} strokeLinejoin="round" />
            </svg>
            <div className={classeCorpoPecaPuzzle(isFirst)}>
              <div className="gs-piece__stack">
                <div className="gs-piece__icon">
                  {visualRefinado
                    ? iconePecaPuzzleHub(peca.slug)
                    : (meta?.icon ?? <Package weight="duotone" size={20} color="#818cf8" />)}
                </div>
                <span className="gs-piece__name">{nomeExibicao}</span>
              </div>
              {isOwned && (
                <span className="gs-piece__check">
                  <CheckCircle weight="fill" size={11} color="#10b981" />
                </span>
              )}
              {isHubNaoContratado && (
                <span className="gs-piece__cesta-store" aria-hidden="true">
                  <ShoppingCart weight="duotone" size={12} />
                </span>
              )}
            </div>
          </div>,
            )}
          <ConectorHubPuzzle visivel={visualRefinado && !isLast} />
          </Fragment>
        )
      })}
    </div>
  )

  if (embutidoParidadeStore) {
    return conteudoPecas
  }

  return (
    <div className={`gs-stack gs-stack--puzzle${escalaClass} ${className}`.trim()}>
      {!ocultarMeterNoStack && (
        <div className="gs-stack__head gs-stack__head--compact">
          <BarrasMeterPuzzleStackProdutos pecas={pecas}>
            {!rotuloAbaixoTitulo && (
              <span className="gs-stack__meter-label">
                {rotuloMeterStackProdutos(ownedNoStack, totalStack, t)}
              </span>
            )}
          </BarrasMeterPuzzleStackProdutos>
        </div>
      )}

      <div className="gs-stack__pieces-scroll">
        {conteudoPecas}
      </div>
    </div>
  )
}
