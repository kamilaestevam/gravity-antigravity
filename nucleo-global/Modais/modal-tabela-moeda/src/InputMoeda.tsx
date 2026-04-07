/**
 * InputMoeda.tsx — Campo composto: select de moeda (esquerda) + valor numérico (direita)
 *
 * Layout: [SELECT MOEDA ▼] [  1.000,00  ]
 * Formata em tempo real no padrão pt-BR (pontos como milhar, vírgula como decimal).
 */

import React, { useId, useState, useEffect, useRef, useCallback } from 'react'
import { SelectGlobal } from '@nucleo/campo-select-global'
import { OPCOES_MOEDA, type MoedaSiscomex } from './dados.js'
import './modal-tabela-moeda.css'

export interface InputMoedaProps {
  label?: string
  valor: number | string
  moeda: string
  onChange: (valor: number, moeda: string) => void
  opcoes?: Pick<MoedaSiscomex, 'sigla' | 'descricao'>[]
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

function mascarar(raw: string, casas: number): string {
  let s = raw.replace(/[^\d,]/g, '')

  const firstComma = s.indexOf(',')
  if (firstComma !== -1) {
    s = s.slice(0, firstComma + 1) + s.slice(firstComma + 1).replace(/,/g, '')
  }

  const [intPart, decPart] = s.split(',')
  const intFmt = (intPart ?? '').replace(/\B(?=(\d{3})+(?!\d))/g, '.')

  if (decPart !== undefined) {
    return `${intFmt},${decPart.slice(0, casas)}`
  }
  return intFmt
}

// ── Componente ────────────────────────────────────────────────────────────────

export function InputMoeda({
  label,
  valor,
  moeda,
  onChange,
  opcoes,
  placeholder,
  desabilitado = false,
  casasDecimais = 2,
}: InputMoedaProps) {
  const id = useId()
  const focadoRef = useRef(false)
  const [texto, setTexto] = useState(() => formatPtBR(valor, casasDecimais))

  useEffect(() => {
    if (!focadoRef.current) {
      setTexto(formatPtBR(valor, casasDecimais))
    }
  }, [valor, casasDecimais])

  const opcoesSelect = opcoes
    ? opcoes.map(m => ({ valor: m.sigla, rotulo: m.sigla, descricao: m.descricao }))
    : OPCOES_MOEDA

  const handleFocus = useCallback(() => {
    focadoRef.current = true
  }, [])

  const handleBlur = useCallback(() => {
    focadoRef.current = false
    const num = parsePtBR(texto)
    const fmt = formatPtBR(num, casasDecimais)
    setTexto(fmt)
    onChange(num, moeda)
  }, [texto, casasDecimais, moeda, onChange])

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const masked = mascarar(e.target.value, casasDecimais)
    setTexto(masked)
    onChange(parsePtBR(masked), moeda)
  }, [casasDecimais, moeda, onChange])

  return (
    <div className="mtm-input-moeda">
      {label && (
        <label htmlFor={id} className="mtm-label">
          {label}
        </label>
      )}
      <div className="mtm-input-row">
        <div className="mtm-select-wrap">
          <SelectGlobal
            opcoes={opcoesSelect}
            valor={moeda}
            aoMudarValor={v => onChange(parsePtBR(texto), String(v ?? 'USD'))}
            desabilitado={desabilitado}
            buscavel={false}
            aria-label="Moeda"
          />
        </div>
        <input
          id={id}
          type="text"
          inputMode="decimal"
          className="mtm-input-numero"
          value={texto}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onChange={handleChange}
          placeholder={placeholder ?? `0,${'0'.repeat(casasDecimais)}`}
          disabled={desabilitado}
          aria-label={label ?? 'Valor'}
        />
      </div>
    </div>
  )
}
