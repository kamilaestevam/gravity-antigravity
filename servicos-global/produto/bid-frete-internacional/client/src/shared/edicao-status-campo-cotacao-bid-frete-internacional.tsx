import React, { useMemo } from 'react'
import { SelectGlobal } from '@nucleo/campo-select-global'
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
  const opcoes = useMemo(
    () => OPCOES_STATUS.map(({ valor: v, rotulo }) => ({ valor: v, rotulo })),
    [],
  )

  if (!permiteEditar) {
    return (
      <span className="cdado-texto">
        {STATUS_LABELS[valor] ?? valor}
      </span>
    )
  }

  return (
    <div className="dc-campo-status-select">
      <SelectGlobal
        opcoes={opcoes}
        valor={valor}
        aoMudarValor={(v) => {
          if (v == null || salvando) return
          const novo = String(v) as StatusCotacao
          if (novo !== valor) void onConfirmar(novo)
        }}
        buscavel
        desabilitado={salvando}
        carregando={salvando}
        aria-label={label}
        tamanho="compacto"
      />
    </div>
  )
}
