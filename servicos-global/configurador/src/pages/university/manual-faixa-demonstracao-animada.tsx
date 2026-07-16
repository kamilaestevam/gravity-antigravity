import { PlayCircle } from '@phosphor-icons/react'
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
