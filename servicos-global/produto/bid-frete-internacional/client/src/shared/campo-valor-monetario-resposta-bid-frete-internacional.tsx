/**
 * Valor monetário com máscara BR (0.000,00) — CampoDecimalGlobal (padrão Pedido).
 */
import React from 'react'
import { CampoDecimalGlobal } from '@nucleo/campo-decimal-global'

function valorStringParaDecimal(valor: string): number | null {
  if (!valor.trim()) return null
  const n = Number(valor)
  return Number.isFinite(n) ? n : null
}

export function CampoValorMonetarioResposta({
  valor,
  onChange,
  id,
  placeholder = '0,00',
}: {
  valor: string
  onChange: (valor: string) => void
  id?: string
  placeholder?: string
}) {
  return (
    <div className="brc-campo-decimal-wrap">
      <CampoDecimalGlobal
        id={id}
        valor={valorStringParaDecimal(valor)}
        aoMudarValor={(n) => onChange(n === null ? '' : String(n))}
        casasDecimais={2}
        placeholder={placeholder}
        textAlign="left"
        style={{ fontFamily: 'inherit' }}
      />
    </div>
  )
}
