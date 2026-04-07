/**
 * InputUnidade.tsx — Campo composto: select de unidade (esquerda) + valor numérico (direita)
 *
 * Layout: [SELECT UNIDADE ▼] [  1.000,000  ]
 * Formata em tempo real no padrão pt-BR (pontos como milhar, vírgula como decimal).
 */

import React, { useId, useState, useEffect, useRef, useCallback } from 'react'
import { SelectGlobal } from '@nucleo/campo-select-global'
import { OPCOES_UOM, type UnidadeMedida } from './dados.js'
import './modal-tabela-unidades.css'

export interface InputUnidadeProps {
  label?: string
  valor: number | string
  unidade: string
  onChange: (valor: number, unidade: string) => void
  opcoes?: Pick<UnidadeMedida, 'sigla' | 'descricao'>[]
  placeholder?: string
  desabilitado?: boolean
  casasDecimais?: number
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function parsePtBR(s: string): number {
  if (!s) return 0
  return parseFloat(s.replace(/\./g, '').replace(',', '.')) || 0
}

function formatPtBR(n: number | string, casas: number): string {
  const num = typeof n === 'string' ? parsePtBR(n) : n
  if (isNaN(num)) return ''
  return num.toLocaleString('pt-BR', {
    minimumFractionDigits: casas,
    maximumFractionDigits: casas,
  })
}

/** Aplica máscara pt-BR enquanto o usuário digita (mantém posição da vírgula) */
function mascarar(raw: string, casas: number): string {
  // Só dígitos e vírgula
  let s = raw.replace(/[^\d,]/g, '')

  // Só uma vírgula
  const firstComma = s.indexOf(',')
  if (firstComma !== -1) {
    s = s.slice(0, firstComma + 1) + s.slice(firstComma + 1).replace(/,/g, '')
  }

  const [intPart, decPart] = s.split(',')

  // Formata inteiros com pontos
  const intFmt = (intPart ?? '').replace(/\B(?=(\d{3})+(?!\d))/g, '.')

  if (decPart !== undefined) {
    // Limita às casas decimais configuradas
    return `${intFmt},${decPart.slice(0, casas)}`
  }
  return intFmt
}

// ── Componente ────────────────────────────────────────────────────────────────

export function InputUnidade({
  label,
  valor,
  unidade,
  onChange,
  opcoes,
  placeholder,
  desabilitado = false,
  casasDecimais = 3,
}: InputUnidadeProps) {
  const id = useId()
  const focadoRef = useRef(false)
  const [texto, setTexto] = useState(() => formatPtBR(valor, casasDecimais))

  // Sync do valor externo quando não está focado
  useEffect(() => {
    if (!focadoRef.current) {
      setTexto(formatPtBR(valor, casasDecimais))
    }
  }, [valor, casasDecimais])

  const opcoesSelect = opcoes
    ? opcoes.map(u => ({ valor: u.sigla, rotulo: u.sigla, descricao: u.descricao }))
    : OPCOES_UOM

  const handleFocus = useCallback(() => {
    focadoRef.current = true
  }, [])

  const handleBlur = useCallback(() => {
    focadoRef.current = false
    const num = parsePtBR(texto)
    const fmt = formatPtBR(num, casasDecimais)
    setTexto(fmt)
    onChange(num, unidade)
  }, [texto, casasDecimais, unidade, onChange])

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const masked = mascarar(e.target.value, casasDecimais)
    setTexto(masked)
    // Emite o valor numérico a cada tecla
    onChange(parsePtBR(masked), unidade)
  }, [casasDecimais, unidade, onChange])

  return (
    <div className="mtu-input-unidade">
      {label && (
        <label htmlFor={id} className="mtu-label">
          {label}
        </label>
      )}
      <div className="mtu-input-row">
        <div className="mtu-select-wrap">
          <SelectGlobal
            opcoes={opcoesSelect}
            valor={unidade}
            aoMudarValor={v => onChange(parsePtBR(texto), String(v ?? 'UNID'))}
            desabilitado={desabilitado}
            buscavel={false}
            aria-label="Unidade de medida"
          />
        </div>
        <input
          id={id}
          type="text"
          inputMode="decimal"
          className="mtu-input-numero"
          value={texto}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onChange={handleChange}
          placeholder={placeholder ?? `0,${'0'.repeat(casasDecimais)}`}
          disabled={desabilitado}
          aria-label={label ?? 'Quantidade'}
        />
      </div>
    </div>
  )
}
