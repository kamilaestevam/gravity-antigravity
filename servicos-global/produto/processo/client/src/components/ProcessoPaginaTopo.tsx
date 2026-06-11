/**
 * ProcessoPaginaTopo — título + subtítulo da view (paridade MenuTopoGlobal / BID Frete).
 */

import React from 'react'
import { corOficialProdutoGravity } from '@nucleo/logo-produtos'
import type { ProcessoVisualizacaoId } from './processo-visualizacao-context'
import { resolverProcessoPageMetaTopo } from '../shared/processo-page-meta-topo'

const PROCESSO_COR = corOficialProdutoGravity('processo')

export function ProcessoPaginaTopo({ visualizacao }: { visualizacao: ProcessoVisualizacaoId }) {
  const meta = resolverProcessoPageMetaTopo(visualizacao)
  const icone =
    React.isValidElement(meta.icone)
      ? React.cloneElement(meta.icone as React.ReactElement<{ color?: string }>, { color: PROCESSO_COR })
      : meta.icone

  return (
    <div
      className="proc-pagina-topo"
      style={{ '--processo-product-color': PROCESSO_COR } as React.CSSProperties}
    >
      <span className="proc-pagina-topo__icone" aria-hidden="true">
        {icone}
      </span>
      <div className="proc-pagina-topo__textos">
        <h1 className="proc-pagina-topo__titulo">{meta.label}</h1>
        <p className="proc-pagina-topo__subtitulo">{meta.subtitulo}</p>
      </div>
    </div>
  )
}
