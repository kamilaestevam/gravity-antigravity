import React, { useMemo, useState, useEffect, useRef } from 'react'

/**
 * CampoDecimalGlobal — input numérico decimal com **live mask BR**.
 *
 * Padrão oficial do Gravity (Mandamento 03 + UX BR consistente):
 *   - Mostra `10.000,00` (separador de milhar `.` e decimal `,`)
 *   - Usuário digita só dígitos — máscara formata em tempo real
 *   - Valor exposto pro caller é `number | null` (não string formatada)
 *   - Casas decimais configurável via prop `casasDecimais` (default: 2)
 *   - Suporta colar (`paste`) com qualquer formato — normaliza
 *
 * Estratégia interna: armazena `displayString` (formatado BR) E expõe
 * `valor: number | null` ao caller via `aoMudarValor`. Não conflita com
 * `<input type="number">` (que tem UX ruim e não aceita máscara).
 *
 * Quando usar:
 *   - Quantidade, valor, peso, cubagem — qualquer número decimal exibido ao usuário
 *   - Não usar para inteiros simples (use input regular)
 *   - Não usar para porcentagens (criar componente próprio se necessário)
 *
 * @example
 *   <CampoDecimalGlobal
 *     valor={qtd}
 *     aoMudarValor={(n) => setQtd(n)}
 *     casasDecimais={3}
 *     placeholder="0,000"
 *   />
 */
export interface CampoDecimalGlobalProps {
  /** Valor numérico atual. `null` = campo vazio. */
  valor: number | null
  /** Callback com novo valor numérico (`null` se usuário esvaziou). */
  aoMudarValor: (valor: number | null) => void
  /** Casas decimais exibidas. Default: 2. Min: 0. Max: 6. */
  casasDecimais?: number
  /** Placeholder mostrado quando vazio. Default: gerado a partir de `casasDecimais`. */
  placeholder?: string
  /** Desabilita interação. */
  desabilitado?: boolean
  /** ID HTML para associar com `<label htmlFor>`. */
  id?: string
  /** Acessibilidade — marca campo como inválido. */
  'aria-invalid'?: boolean
  /** `name` HTML para form submissions tradicionais. */
  name?: string
  /** Estilo inline opcional (sobrescreve defaults). */
  style?: React.CSSProperties
  /** Alinhamento do texto. Default: 'right' (convenção contábil). */
  textAlign?: 'left' | 'right' | 'center'
  /** Permite negativos. Default: false. */
  permitirNegativo?: boolean
}

/**
 * Formata `n` para string BR (separador milhar `.` e decimal `,`).
 * `null` ou `NaN` → string vazia.
 */
function formatarBr(n: number | null, casasDecimais: number): string {
  if (n === null || n === undefined || isNaN(n)) return ''
  return new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: casasDecimais,
    maximumFractionDigits: casasDecimais,
  }).format(n)
}

/**
 * Converte input cru (qualquer formato — pode ter milhares, vírgulas, etc.)
 * em number. Estratégia: extrai só dígitos + sinal, divide pelo fator decimal.
 *
 * Exemplo com casasDecimais=2:
 *   "10000"     → 100.00
 *   "1000000"   → 10000.00
 *   "10.000,00" → 1000000 dígitos → 10000.00 (mesma coisa, formato irrelevante)
 *   "-500"      → -5.00 (se permitirNegativo)
 *
 * Retorna null se não houver dígito algum.
 */
function parseDecimal(raw: string, casasDecimais: number, permitirNegativo: boolean): number | null {
  const negativo = permitirNegativo && raw.trim().startsWith('-')
  const digits = raw.replace(/\D/g, '')
  if (digits.length === 0) return null
  const fator = Math.pow(10, casasDecimais)
  const n = parseInt(digits, 10) / fator
  return negativo ? -n : n
}

export function CampoDecimalGlobal({
  valor,
  aoMudarValor,
  casasDecimais = 2,
  placeholder,
  desabilitado = false,
  id,
  'aria-invalid': ariaInvalid,
  name,
  style,
  textAlign = 'right',
  permitirNegativo = false,
}: CampoDecimalGlobalProps) {
  const casas = Math.max(0, Math.min(6, casasDecimais))

  // Display interno — re-sincroniza com `valor` da prop quando muda externamente.
  // Mas durante digitação, prevalece o que o usuário tá vendo (evita "pulo do cursor").
  const [display, setDisplay] = useState<string>(() => formatarBr(valor, casas))
  const digitando = useRef(false)

  useEffect(() => {
    // Re-sincroniza quando valor externo muda E usuário não está digitando AGORA.
    if (!digitando.current) {
      setDisplay(formatarBr(valor, casas))
    }
  }, [valor, casas])

  const phResolvido = useMemo(
    () => placeholder ?? `0${casas > 0 ? ',' + '0'.repeat(casas) : ''}`,
    [placeholder, casas],
  )

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    digitando.current = true
    const raw = e.target.value
    const numero = parseDecimal(raw, casas, permitirNegativo)
    const novoDisplay = formatarBr(numero, casas)
    setDisplay(novoDisplay)
    aoMudarValor(numero)
    // Libera o flag de digitando no próximo tick (depois do re-render do caller)
    requestAnimationFrame(() => { digitando.current = false })
  }

  function handleBlur() {
    digitando.current = false
    // Garante formato final completo no blur (caso valor externo divergir do display)
    setDisplay(formatarBr(valor, casas))
  }

  return (
    <input
      type="text"
      inputMode="decimal"
      id={id}
      name={name}
      value={display}
      onChange={handleChange}
      onBlur={handleBlur}
      placeholder={phResolvido}
      disabled={desabilitado}
      aria-invalid={ariaInvalid}
      style={{
        textAlign,
        fontFamily: 'var(--font-mono, monospace)',
        ...style,
      }}
    />
  )
}
