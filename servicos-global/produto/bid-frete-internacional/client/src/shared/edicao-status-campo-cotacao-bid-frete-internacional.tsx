import React from 'react'
import { STATUS_LABELS, type StatusCotacao } from './types'

export interface EdicaoStatusCampoCotacaoBidFreteInternacionalProps {
  label: string
  valor: StatusCotacao
  permiteEditar: boolean
  salvando: boolean
  onConfirmar: (status: StatusCotacao) => void | Promise<void>
}

const OPCOES_STATUS = (Object.entries(STATUS_LABELS) as Array<[StatusCotacao, string]>).map(
  ([valor, rotulo]) => ({ valor, rotulo }),
)

export function EdicaoStatusCampoCotacaoBidFreteInternacional({
  label,
  valor,
  permiteEditar,
  salvando,
  onConfirmar,
}: EdicaoStatusCampoCotacaoBidFreteInternacionalProps) {
  if (!permiteEditar) {
    return (
      <span className="cdado-texto">
        {STATUS_LABELS[valor] ?? valor}
      </span>
    )
  }

  return (
    <select
      className="dc-campo-espelho-select"
      value={valor}
      disabled={salvando}
      aria-label={label}
      onChange={(e) => void onConfirmar(e.target.value as StatusCotacao)}
    >
      {OPCOES_STATUS.map((op) => (
        <option key={op.valor} value={op.valor}>
          {op.rotulo}
        </option>
      ))}
    </select>
  )
}
