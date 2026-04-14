/**
 * useNcmValidation.ts — Hook de validação NCM (não bloqueante)
 *
 * Regras:
 *  - Só valida se o código tiver exatamente 8 dígitos numéricos
 *  - Debounce de 600ms para não disparar em cada tecla
 *  - Nunca impede o salvamento — apenas avisa o usuário
 *  - Aceita `onValidar` customizado (prod → usa /api/v1/ncm/validar/:codigo)
 */

import { useState, useEffect, useRef, useCallback } from 'react'

export type NcmValidacaoStatus = 'idle' | 'validando' | 'valido' | 'invalido' | 'sem_sync'

export interface NcmValidacaoResultado {
  valido:      boolean
  descricao:   string | null
  fonte:       'cache' | 'portal' | null
  ultima_sync: string | null
  motivo:      string | null
}

export interface UseNcmValidationOptions {
  /** URL base do serviço NCM — padrão: /api/v1/ncm */
  baseUrl?: string
  /** Função customizada de validação (útil para testes ou produtos com proxy próprio) */
  onValidar?: (codigo: string) => Promise<NcmValidacaoResultado>
  /** Milissegundos de debounce — padrão: 600 */
  debounceMs?: number
}

export interface UseNcmValidationReturn {
  status:     NcmValidacaoStatus
  resultado:  NcmValidacaoResultado | null
  validar:    (codigo: string) => void
  limpar:     () => void
}

const NCM_REGEX = /^\d{8}$/

async function validarNcmDefault(codigo: string, baseUrl: string): Promise<NcmValidacaoResultado> {
  const res = await fetch(`${baseUrl}/validar/${encodeURIComponent(codigo)}`, {
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
  })
  if (!res.ok) {
    throw new Error(`HTTP ${res.status}`)
  }
  return res.json()
}

export function useNcmValidation(options: UseNcmValidationOptions = {}): UseNcmValidationReturn {
  const {
    baseUrl    = '/api/v1/ncm',
    onValidar,
    debounceMs = 600,
  } = options

  const [status, setStatus]       = useState<NcmValidacaoStatus>('idle')
  const [resultado, setResultado] = useState<NcmValidacaoResultado | null>(null)
  const timerRef                  = useRef<ReturnType<typeof setTimeout> | null>(null)
  const abortRef                  = useRef<AbortController | null>(null)

  const limpar = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current)
    if (abortRef.current) abortRef.current.abort()
    setStatus('idle')
    setResultado(null)
  }, [])

  const validar = useCallback((codigo: string) => {
    if (timerRef.current) clearTimeout(timerRef.current)
    if (abortRef.current) abortRef.current.abort()

    // Limpa se vazio ou formato inválido
    if (!NCM_REGEX.test(codigo)) {
      setStatus('idle')
      setResultado(null)
      return
    }

    setStatus('validando')

    timerRef.current = setTimeout(async () => {
      abortRef.current = new AbortController()

      try {
        const res = onValidar
          ? await onValidar(codigo)
          : await validarNcmDefault(codigo, baseUrl)

        setResultado(res)

        if (res.valido) {
          setStatus('valido')
        } else if (res.motivo?.toLowerCase().includes('sync')) {
          setStatus('sem_sync')
        } else {
          setStatus('invalido')
        }
      } catch {
        // Falha silenciosa — não bloqueia o fluxo
        setStatus('idle')
        setResultado(null)
      }
    }, debounceMs)
  }, [baseUrl, onValidar, debounceMs])

  useEffect(() => () => {
    if (timerRef.current) clearTimeout(timerRef.current)
    if (abortRef.current) abortRef.current.abort()
  }, [])

  return { status, resultado, validar, limpar }
}
