/**
 * ProcessoPaginaTopo — título + subtítulo da view (paridade MenuTopoGlobal / BID Frete).
 */

import React from 'react'
import type { ProcessoVisualizacaoId } from './processo-visualizacao-context'
import { resolverProcessoPageMetaTopo } from '../shared/processo-page-meta-topo'

export function ProcessoPaginaTopo({ visualizacao }: { visualizacao: ProcessoVisualizacaoId }) {
  const meta = resolverProcessoPageMetaTopo(visualizacao)

  return (
    <div className="proc-pagina-topo">
      <span className="proc-pagina-topo__icone" aria-hidden="true">
        {meta.icone}
      </span>
      <div className="proc-pagina-topo__textos">
        <h1 className="proc-pagina-topo__titulo">{meta.label}</h1>
        <p className="proc-pagina-topo__subtitulo">{meta.subtitulo}</p>
      </div>
    </div>
  )
}
