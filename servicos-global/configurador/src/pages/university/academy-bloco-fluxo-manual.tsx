import React from 'react'
import type { DocFluxo } from './manual-configurador-conteudo'
import {
  ManualSecaoFluxo,
  ManualSubtopicosProvider,
  type ModoSecaoFluxoAcademy,
} from './manual-configurador-ui'

/** Corpo de um fluxo do manual na Academy — intro, passo isolado ou fluxo completo (/docs). */
export function AcademyBlocoFluxoManual({
  fluxo,
  numeroSecaoFluxo = 1,
  modo = 'completo',
  passoNum,
}: {
  fluxo: DocFluxo
  numeroSecaoFluxo?: number
  modo?: ModoSecaoFluxoAcademy
  passoNum?: number
}) {
  return (
    <div className="uni-academy-fluxo-manual">
      <ManualSubtopicosProvider>
        <ManualSecaoFluxo
          fluxo={fluxo}
          numeroSecaoFluxo={numeroSecaoFluxo}
          modo={modo}
          passoNum={passoNum}
          layoutGuiaAcademy
        />
      </ManualSubtopicosProvider>
    </div>
  )
}
