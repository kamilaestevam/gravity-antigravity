import React from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { CheckCircle, Lightning, Package } from '@phosphor-icons/react'
import { metaProdutoStore, nomeExibicaoProdutoGravity } from '../data/product-meta'
import {
  classePecaPuzzleStore,
  encontrarProdutoNoCatalogoStore,
  type StatusExibicaoProdutoStore,
} from '../data/status-produto-store'

type CatalogoItem = { slug: string; name: string }

/** Largura da aba/cavidade do SVG — deve coincidir com margin-left negativo no CSS. */
export const PUZZLE_PIECE_TAB_PX = 18

type Props = {
  slugs: readonly string[]
  catalog: CatalogoItem[]
  statusDe: (slug: string) => StatusExibicaoProdutoStore
  variante: 'ativos' | 'em_breve'
  /** Dentro do scroll único do stack — não cria outro wrapper de scroll. */
  embutido?: boolean
}

function pathPeca(isFirst: boolean, isLast: boolean): string {
  if (isFirst && isLast) return 'M 0,0 L 120,0 L 120,90 L 0,90 Z'
  if (isFirst) return 'M 0,0 L 120,0 L 120,32 C 138,32 138,58 120,58 L 120,90 L 0,90 Z'
  if (isLast) return 'M 0,0 L 120,0 L 120,90 L 0,90 L 0,58 C 18,58 18,32 0,32 Z'
  return 'M 0,0 L 120,0 L 120,32 C 138,32 138,58 120,58 L 120,90 L 0,90 L 0,58 C 18,58 18,32 0,32 Z'
}

export function StorePuzzleRow({ slugs, catalog, statusDe, variante, embutido = false }: Props) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const total = slugs.length

  if (total === 0) return null

  const pecas = (
      <div className={`gs-stack__pieces${variante === 'em_breve' ? ' gs-stack__pieces--soon' : ''}`}>
        {slugs.map((slug, pieceIdx) => {
          const cp = encontrarProdutoNoCatalogoStore(slug, catalog)
          const meta = metaProdutoStore(slug)
          const exibicao = statusDe(slug)
          const isContratado = exibicao === 'contratado'
          const isDisponivel = exibicao === 'disponivel'
          const isEmBreve = exibicao === 'em_breve'
          const isFirst = pieceIdx === 0
          const isLast = pieceIdx === total - 1
          const zIdx = total - pieceIdx + 1
          const corProduto = meta?.iconColor ?? '#818cf8'

          const fill =
            isContratado ? (meta?.iconBg ?? 'rgba(99,102,241,0.18)')
            : isDisponivel ? (meta?.iconBg ?? 'rgba(99,102,241,0.12)')
            : isEmBreve ? 'rgba(245,158,11,0.14)'
            : 'rgba(255,255,255,0.025)'

          const stroke =
            isContratado ? corProduto
            : isDisponivel ? corProduto
            : isEmBreve ? '#f59e0b'
            : 'rgba(255,255,255,0.09)'

          const strokeWidth = 1.5

          return (
            <div
              key={slug}
              className={`gs-piece${classePecaPuzzleStore(exibicao)}${isFirst ? '' : ' gs-piece--has-blank'}`}
              style={{ zIndex: zIdx, '--piece-color': corProduto } as React.CSSProperties}
              onClick={() => {
                if (isContratado) {
                  navigate(
                    slug === 'bid-frete' || slug === 'bid-frete-internacional'
                      ? '/bid-frete'
                      : `/produto/${slug}`,
                  )
                  return
                }
                if (exibicao === 'fora_catalogo') return
                document.getElementById(`produto-${slug}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' })
              }}
              title={nomeExibicaoProdutoGravity(slug, cp?.name ?? '', t)}
            >
              <svg width="138" height="90" viewBox="0 0 138 90" className="gs-piece__svg" aria-hidden="true">
                <path
                  d={pathPeca(isFirst, isLast)}
                  fill={fill}
                  stroke={stroke}
                  strokeWidth={strokeWidth}
                  strokeLinejoin="round"
                  vectorEffect="non-scaling-stroke"
                />
              </svg>
              <div className={`gs-piece__body${isFirst ? '' : ' gs-piece__body--indent'}`}>
                <div className="gs-piece__icon">
                  {meta?.icon ?? <Package weight="duotone" size={20} color="#818cf8" />}
                </div>
                <span className="gs-piece__name">
                  {nomeExibicaoProdutoGravity(slug, cp?.name ?? '', t)}
                </span>
                {isContratado && (
                  <span className="gs-piece__check">
                    <CheckCircle weight="fill" size={11} color="#10b981" />
                  </span>
                )}
                {isEmBreve && (
                  <span className="gs-piece__soon" aria-hidden="true">
                    <Lightning weight="fill" size={10} color="#f59e0b" />
                  </span>
                )}
              </div>
            </div>
          )
        })}
      </div>
  )

  if (embutido) return pecas

  return <div className="gs-stack__pieces-scroll">{pecas}</div>
}
