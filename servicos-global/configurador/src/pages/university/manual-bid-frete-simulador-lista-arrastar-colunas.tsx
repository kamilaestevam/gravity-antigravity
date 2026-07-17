import { PlayCircle } from '@phosphor-icons/react'
import { ListaSimuladorBidFrete } from '../../../../../nucleo-global/Telas-manual-marketing/produtos-gravity/bid-frete-internacional/lista-simulador-bid-frete'
import '../../../../../nucleo-global/Telas-manual-marketing/produtos-gravity/bid-frete-internacional/lista-simulador-bid-frete.css'
import { ManualInfograficoRichText } from './manual-infografico-rich-text'

/** Faixa acima de telas animadas do manual — ícone de vídeo + frase explicativa. */
export function ManualFaixaDemonstracaoAnimada({ texto }: { texto: string }) {
  return (
    <p className="manual-faixa-demonstracao-animada" role="note" aria-label="Demonstração animada">
      <PlayCircle
        size={17}
        weight="duotone"
        className="manual-faixa-demonstracao-animada__icone"
        aria-hidden
      />
      <span className="manual-faixa-demonstracao-animada__texto">
        <ManualInfograficoRichText texto={texto} />
      </span>
    </p>
  )
}

/** Manual BID Frete § Lista · Customizar — demo automática de arrastar colunas (tela recriada em React). */
export function ManualBidFreteSimuladorListaArrastarColunas({
  fraseDemonstracaoAnimada,
}: {
  fraseDemonstracaoAnimada?: string
}) {
  return (
    <div className="sim-bid-frete-lista-arrastar-bloco">
      {fraseDemonstracaoAnimada ? (
        <ManualFaixaDemonstracaoAnimada texto={fraseDemonstracaoAnimada} />
      ) : null}
      <div
        id="sim-bid-frete-lista-arrastar-colunas"
        className="uni-player-aula__figura sim-bid-frete-lista-arrastar-demo"
      >
        <ListaSimuladorBidFrete modoDemonstracaoArrastarColunas />
      </div>
    </div>
  )
}
