/**
 * checklist-marcacao-usuario-smart-read.ts — confirmação manual do usuário por linha do checklist
 */

import { useCallback, useEffect, useState } from 'react'

const STORAGE_PREFIX_CHECKLIST = 'smart-read-chk-marcados:'
const STORAGE_PREFIX_CAMPOS = 'smart-read-campo-marcados:'

function usarMarcacaoSessaoUsuario(storagePrefix: string, chaveSessao: string) {
  const storageKey = `${storagePrefix}${chaveSessao}`

  const [marcados, setMarcados] = useState<Set<string>>(() => {
    if (!chaveSessao) return new Set()
    try {
      const raw = sessionStorage.getItem(storageKey)
      if (!raw) return new Set()
      const lista = JSON.parse(raw) as string[]
      return new Set(Array.isArray(lista) ? lista : [])
    } catch {
      return new Set()
    }
  })

  useEffect(() => {
    if (!chaveSessao) return
    sessionStorage.setItem(storageKey, JSON.stringify([...marcados]))
  }, [marcados, storageKey, chaveSessao])

  const estaMarcado = useCallback((chave: string) => marcados.has(chave), [marcados])

  const alternarMarcado = useCallback((chave: string) => {
    setMarcados((prev) => {
      const next = new Set(prev)
      if (next.has(chave)) next.delete(chave)
      else next.add(chave)
      return next
    })
  }, [])

  return { estaMarcado, alternarMarcado, marcados }
}

export function chaveItemChecklistUsuario(regraId: string, rotuloInvoice?: string | null): string {
  return rotuloInvoice ? `${regraId}@${rotuloInvoice}` : regraId
}

export function chaveCampoConferenciaUsuario(chaveCampo: string): string {
  return chaveCampo
}

export function usarChecklistMarcacaoUsuario(chaveSessao: string) {
  return usarMarcacaoSessaoUsuario(STORAGE_PREFIX_CHECKLIST, chaveSessao)
}

export function usarCamposMarcacaoConferencia(chaveSessao: string) {
  return usarMarcacaoSessaoUsuario(STORAGE_PREFIX_CAMPOS, chaveSessao)
}

export type ResumoConferenciaManualChecklist = {
  total: number
  marcados: number
  percentual: number
}

export function contarConferenciaManualChecklist(
  marcados: Set<string>,
  chavesEsperadas: readonly string[],
): ResumoConferenciaManualChecklist {
  const total = chavesEsperadas.length
  if (total === 0) return { total: 0, marcados: 0, percentual: 0 }
  const marcadosCount = chavesEsperadas.filter((chave) => marcados.has(chave)).length
  return {
    total,
    marcados: marcadosCount,
    percentual: Math.round((marcadosCount / total) * 100),
  }
}
