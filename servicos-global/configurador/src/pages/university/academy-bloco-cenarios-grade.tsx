import React from 'react'
import type { DocPassoVisual } from './manual-configurador-conteudo'
import { AcademyBlocoPassoVisual } from './academy-bloco-passo-visual'
import {
  MANUAL_ESPACO_ANTES_IMAGEM_ACORDEAO_PX,
  MANUAL_ESPACO_ENTRE_PASSOS_PX,
  MANUAL_ESPACO_GRADE_GALERIA_PX,
} from './manual-tipografia'

export interface PayloadCenariosGradeAcademy {
  passos: DocPassoVisual[]
  cenariosLadoALado: boolean
  cenariosImagensAlinhadas?: boolean
}

export function AcademyBlocoCenariosGrade({ payload }: { payload: PayloadCenariosGradeAcademy }) {
  const { passos, cenariosImagensAlinhadas } = payload
  if (!passos.length) return null

  if (cenariosImagensAlinhadas) {
    return (
      <>
        <div
          className="uni-player-aula__cenarios-grade"
          style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${Math.min(passos.length, 2)}, minmax(0, 1fr))`,
            gap: MANUAL_ESPACO_GRADE_GALERIA_PX,
            alignItems: 'stretch',
            marginTop: MANUAL_ESPACO_ENTRE_PASSOS_PX,
          }}
        >
          {passos.map((passo) => (
            <AcademyBlocoPassoVisual
              key={`${passo.num}-texto`}
              passo={passo}
              emGradeCenarios
              cenarioParte="texto"
            />
          ))}
        </div>
        <div
          className="uni-player-aula__cenarios-grade-figuras"
          style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${Math.min(passos.length, 2)}, minmax(0, 1fr))`,
            gap: MANUAL_ESPACO_GRADE_GALERIA_PX,
            alignItems: 'start',
            marginTop: MANUAL_ESPACO_ANTES_IMAGEM_ACORDEAO_PX,
          }}
        >
          {passos.map((passo) => (
            <AcademyBlocoPassoVisual
              key={`${passo.num}-figuras`}
              passo={passo}
              emGradeCenarios
              cenarioParte="figuras"
            />
          ))}
        </div>
      </>
    )
  }

  return (
    <div
      className="uni-player-aula__cenarios-grade"
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${Math.min(passos.length, 2)}, minmax(0, 1fr))`,
        gap: MANUAL_ESPACO_GRADE_GALERIA_PX,
        alignItems: 'start',
        marginTop: MANUAL_ESPACO_ENTRE_PASSOS_PX,
      }}
    >
      {passos.map((passo) => (
        <AcademyBlocoPassoVisual
          key={passo.num}
          passo={passo}
          emGradeCenarios
        />
      ))}
    </div>
  )
}
