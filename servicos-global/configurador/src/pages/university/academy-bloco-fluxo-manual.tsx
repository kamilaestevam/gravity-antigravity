import React from 'react'
import type { DocFluxo } from './manual-configurador-conteudo'
import { ManualSecaoFluxo, ManualSubtopicosProvider } from './manual-configurador-ui'

/** Corpo completo de um fluxo do manual — paridade com /docs (passos, infográficos, acordeões). */
export function AcademyBlocoFluxoManual({ fluxo, numeroSecaoFluxo = 1 }: {
  fluxo: DocFluxo
  numeroSecaoFluxo?: number
}) {
  return (
    <div className="uni-academy-fluxo-manual">
      <ManualSubtopicosProvider>
        <ManualSecaoFluxo fluxo={fluxo} numeroSecaoFluxo={numeroSecaoFluxo} />
      </ManualSubtopicosProvider>
    </div>
  )
}
