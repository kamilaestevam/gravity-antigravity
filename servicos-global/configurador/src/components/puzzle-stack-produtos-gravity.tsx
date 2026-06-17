/**
 * puzzle-stack-produtos-gravity.tsx — peças encaixadas (puzzle) da Gravity Store.
 * Regras de owned/soon/available: lib/produtos-gravity-store-status.ts (paridade Store).
 */

import type { TFunction } from 'i18next'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, CaretLeft, CaretRight, CheckCircle, Package } from '@phosphor-icons/react'
import { PRODUCT_META, nomeExibicaoProdutoGravity } from '../data/product-meta'
import {
  mapaAssinaturaAtivaPorSlug,
  mapaCatalogoPorSlugCanonico,
  rotuloMeterStackProdutos,
  slugCanonicoProdutoGravity,
  slugsPuzzleStackProdutosGravity,
  statusProdutoGravityStore,
  type CatalogoProdutoGravityMin,
  type AssinaturaProdutoGravityMin,
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
  'smart-read': '/smart-read',
}

function rotaProduto(slug: string): string {
  return ROTAS_PRODUTO[slug] ?? `/produto/${slug}`
}

function pathPecaPuzzle(isFirst: boolean, isLast: boolean): string {
  if (isFirst && isLast) return 'M 0,0 L 120,0 L 120,90 L 0,90 Z'
  if (isFirst) return 'M 0,0 L 120,0 L 120,32 C 138,32 138,58 120,58 L 120,90 L 0,90 Z'
  if (isLast) return 'M 0,0 L 120,0 L 120,90 L 0,90 L 0,58 C 18,58 18,32 0,32 Z'
  return 'M 0,0 L 120,0 L 120,32 C 138,32 138,58 120,58 L 120,90 L 0,90 L 0,58 C 18,58 18,32 0,32 Z'
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

export function pecasPuzzleStackProdutosGravity(
  catalogo: CatalogoProdutoGravityMin[],
  assinaturas: AssinaturaProdutoGravityMin[],
): PecaPuzzleStackProduto[] {
  const catalogoPorSlug = mapaCatalogoPorSlugCanonico(catalogo)
  const assinaturaAtiva = mapaAssinaturaAtivaPorSlug(assinaturas)
  const slugsStack = slugsPuzzleStackProdutosGravity(catalogo)
  return slugsStack.map(slug => {
    const cat = catalogo.find(p => slugCanonicoProdutoGravity(p.slug) === slug)
    return {
      slug,
      nome: cat?.name ?? slug,
      status: statusProdutoGravityStore(slug, catalogoPorSlug, assinaturaAtiva),
    }
  })
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
  /** Escala visual: hub = painel compacto; full = Store. */
  escala?: 'hub' | 'full'
  /** HUB: contador abaixo do título do painel (só barras ficam no stack). */
  rotuloAbaixoTitulo?: boolean
  /** HUB: barras renderizadas fora do stack (ex.: ao lado do link Gravity Store). */
  ocultarMeterNoStack?: boolean
  /** HUB: hidrata sessão do workspace e abre o produto (atalho direto). */
  onAbrirProdutoContratado?: (slug: string, rota: string) => void
  /** HUB: peças extras (visão fornecedor BID) após o stack contratado. */
  pecasExtras?: PecaPuzzleExtraHub[]
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
  className = '',
}: PuzzleStackProdutosGravityProps) {
  const navigate = useNavigate()
  const pecasCarouselRef = useRef<HTMLDivElement>(null)
  const comCarrosselHub = escala === 'hub'
  const [navCarrosselHub, setNavCarrosselHub] = useState({ esquerda: false, direita: false })

  const atualizarNavCarrosselHub = useCallback(() => {
    const el = pecasCarouselRef.current
    if (!el) return
    const limiar = 6
    const { scrollLeft, scrollWidth, clientWidth } = el
    setNavCarrosselHub({
      esquerda: scrollLeft > limiar,
      direita: scrollLeft + clientWidth < scrollWidth - limiar,
    })
  }, [])

  useEffect(() => {
    if (!comCarrosselHub) return
    const el = pecasCarouselRef.current
    if (!el) return

    atualizarNavCarrosselHub()
    el.addEventListener('scroll', atualizarNavCarrosselHub, { passive: true })
    const observador = new ResizeObserver(atualizarNavCarrosselHub)
    observador.observe(el)

    return () => {
      el.removeEventListener('scroll', atualizarNavCarrosselHub)
      observador.disconnect()
    }
  }, [comCarrosselHub, atualizarNavCarrosselHub, catalogo, assinaturas])

  const scrollCarrosselPecas = useCallback((dir: 'left' | 'right') => {
    const el = pecasCarouselRef.current
    if (!el) return
    const peca = el.querySelector<HTMLElement>('.gs-piece')
    const passo = peca
      ? peca.offsetWidth * 2
      : Math.round(el.clientWidth * 0.85)
    el.scrollBy({ left: dir === 'right' ? passo : -passo, behavior: 'smooth' })
  }, [])

  const abrirPeca = (slug: string, isOwned: boolean, isSoon: boolean) => {
    if (isSoon) return
    if (isOwned) {
      const rota = rotaProduto(slug)
      if (onAbrirProdutoContratado) onAbrirProdutoContratado(slug, rota)
      else navigate(rota)
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

  const ownedNoStack = pecas.filter(p => p.status === 'owned').length
  const totalStack = pecas.length
  const totalPecasVisiveis = totalStack + pecasExtras.length

  if (totalPecasVisiveis === 0) return null

  const escalaClass = escala === 'hub' ? ' gs-stack--escala-hub' : ''

  const conteudoPecas = (
    <div className="gs-stack__pieces">
      {pecas.map((peca, pieceIdx) => {
        const meta = PRODUCT_META[peca.slug]
        const isOwned = peca.status === 'owned'
        const isSoon = peca.status === 'soon'
        const isFirst = pieceIdx === 0
        const isLast = pieceIdx === pecas.length - 1
        const zIdx = pecas.length - pieceIdx + 1
        const path = pathPecaPuzzle(isFirst, isLast)
        const isHubNaoContratado = escala === 'hub' && !isOwned
        const fill = isHubNaoContratado
          ? 'var(--hub-ops-kpi-bg, #1a2438)'
          : isOwned
            ? (meta?.iconBg ?? 'rgba(99,102,241,0.18)')
            : 'rgba(255,255,255,0.025)'
        const stroke = isOwned
          ? (meta?.iconColor ?? '#818cf8')
          : isHubNaoContratado
            ? 'rgba(148, 163, 184, 0.08)'
            : 'rgba(255,255,255,0.09)'
        const nomeExibicao = nomeExibicaoProdutoGravity(
          peca.slug,
          peca.nome,
          t as (key: string, defaultValue?: string) => string,
        )
        const tituloPeca = isOwned
          ? `${t('sw.acessar', 'Acessar')} — ${nomeExibicao}`
          : nomeExibicao

        return (
          <div
            key={peca.slug}
            className={`gs-piece${isOwned ? ' gs-piece--on' : ''}${isHubNaoContratado ? ' gs-piece--nao-contratado-hub' : ''}${isFirst ? '' : ' gs-piece--has-blank'}${isSoon ? ' gs-piece--soon' : ''}${isOwned && escala === 'hub' ? ' gs-piece--acesso-direto' : ''}`}
            style={{ zIndex: zIdx, '--piece-color': meta?.iconColor ?? '#818cf8' } as React.CSSProperties}
            role="button"
            tabIndex={0}
            title={tituloPeca}
            onClick={() => abrirPeca(peca.slug, isOwned, isSoon)}
            onKeyDown={e => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                abrirPeca(peca.slug, isOwned, isSoon)
              }
            }}
          >
            <svg width="138" height="90" viewBox="0 0 138 90" className="gs-piece__svg" aria-hidden="true">
              <path d={path} fill={fill} stroke={stroke} strokeWidth="1.5" strokeLinejoin="round" />
            </svg>
            <div className={`gs-piece__body${isFirst ? '' : ' gs-piece__body--indent'}`}>
              <div className="gs-piece__icon">
                {meta?.icon ?? <Package weight="duotone" size={20} color="#818cf8" />}
              </div>
              {isOwned && escala === 'hub' ? (
                <span className="gs-piece__acesso" aria-hidden="true">
                  <span className="gs-piece__name">{nomeExibicao}</span>
                  <ArrowRight size={14} weight="bold" />
                </span>
              ) : (
                <span className="gs-piece__name">{nomeExibicao}</span>
              )}
              {isOwned && (
                <span className="gs-piece__check">
                  <CheckCircle weight="fill" size={11} color="#10b981" />
                </span>
              )}
            </div>
          </div>
        )
      })}
      {pecasExtras.map((pecaExtra, extraIdx) => {
        const meta = PRODUCT_META[pecaExtra.slugVisual]
        const pieceIdx = pecas.length + extraIdx
        const isFirst = pieceIdx === 0
        const isLast = pieceIdx === totalPecasVisiveis - 1
        const zIdx = totalPecasVisiveis - pieceIdx + 1
        const path = pathPecaPuzzle(isFirst, isLast)
        const fill = meta?.iconBg ?? 'rgba(99,102,241,0.18)'
        const stroke = meta?.iconColor ?? '#818cf8'
        const tituloPeca = `${t('sw.acessar', 'Acessar')} — ${pecaExtra.nome}`

        return (
          <div
            key={pecaExtra.key}
            className={`gs-piece gs-piece--on gs-piece--fornecedor${isFirst ? '' : ' gs-piece--has-blank'}${escala === 'hub' ? ' gs-piece--acesso-direto' : ''}`}
            style={{ zIndex: zIdx, '--piece-color': '#f59e0b' } as React.CSSProperties}
            role="button"
            tabIndex={0}
            title={tituloPeca}
            aria-label={tituloPeca}
            onClick={() => abrirPecaExtra(pecaExtra)}
            onKeyDown={e => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                abrirPecaExtra(pecaExtra)
              }
            }}
          >
            <svg width="138" height="90" viewBox="0 0 138 90" className="gs-piece__svg" aria-hidden="true">
              <path d={path} fill={fill} stroke={stroke} strokeWidth="1.5" strokeLinejoin="round" />
            </svg>
            <div className={`gs-piece__body${isFirst ? '' : ' gs-piece__body--indent'}`}>
              <div className="gs-piece__icon">
                {meta?.icon ?? <Package weight="duotone" size={20} color="#818cf8" />}
              </div>
              {escala === 'hub' ? (
                <span className="gs-piece__acesso" aria-hidden="true">
                  <span className="gs-piece__name">{pecaExtra.nomeExibicao}</span>
                  <ArrowRight size={14} weight="bold" />
                </span>
              ) : (
                <span className="gs-piece__name">{pecaExtra.nomeExibicao}</span>
              )}
              <span className="gs-piece__check">
                <CheckCircle weight="fill" size={11} color="#f59e0b" />
              </span>
            </div>
          </div>
        )
      })}
    </div>
  )

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

      {comCarrosselHub ? (
        <div className="sw-ws-carousel-wrap sw-hub-prod-puzzle-carousel">
          <button
            className="sw-carousel-btn sw-carousel-btn--left"
            type="button"
            disabled={!navCarrosselHub.esquerda}
            onClick={() => scrollCarrosselPecas('left')}
            aria-label={t('sw.carrossel_anterior', 'Anterior')}
            aria-hidden={!navCarrosselHub.esquerda}
            tabIndex={navCarrosselHub.esquerda ? 0 : -1}
          >
            <CaretLeft size={14} weight="bold" />
          </button>
          <div className="gs-stack__pieces-scroll" ref={pecasCarouselRef}>
            {conteudoPecas}
          </div>
          <button
            className="sw-carousel-btn sw-carousel-btn--right"
            type="button"
            disabled={!navCarrosselHub.direita}
            onClick={() => scrollCarrosselPecas('right')}
            aria-label={t('sw.carrossel_proximo', 'Próximo')}
            aria-hidden={!navCarrosselHub.direita}
            tabIndex={navCarrosselHub.direita ? 0 : -1}
          >
            <CaretRight size={14} weight="bold" />
          </button>
        </div>
      ) : (
        <div className="gs-stack__pieces-scroll">
          {conteudoPecas}
        </div>
      )}
    </div>
  )
}
