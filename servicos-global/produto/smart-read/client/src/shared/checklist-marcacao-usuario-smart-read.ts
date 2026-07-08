/**
 * checklist-marcacao-usuario-smart-read.ts — confirmação manual do usuário (campos, riscos, checklist)
 */

import { useCallback, useEffect, useState } from 'react'

const STORAGE_PREFIX_CHECKLIST = 'smart-read-chk-marcados:'
const STORAGE_PREFIX_CAMPOS = 'smart-read-campo-marcados:'
const STORAGE_PREFIX_RISCOS = 'smart-read-risco-marcados:'

type ListenerMarcacao = () => void

const cacheMarcados = new Map<string, Set<string>>()
const listenersPorChave = new Map<string, Set<ListenerMarcacao>>()

function lerMarcadosSessionStorage(storageKey: string): Set<string> {
  try {
    const raw = sessionStorage.getItem(storageKey)
    if (!raw) return new Set()
    const lista = JSON.parse(raw) as string[]
    return new Set(Array.isArray(lista) ? lista : [])
  } catch {
    return new Set()
  }
}

function obterMarcadosCache(storageKey: string): Set<string> {
  const emCache = cacheMarcados.get(storageKey)
  if (emCache) return emCache
  const carregado = lerMarcadosSessionStorage(storageKey)
  cacheMarcados.set(storageKey, carregado)
  return carregado
}

function persistirMarcados(storageKey: string, marcados: Set<string>): void {
  cacheMarcados.set(storageKey, marcados)
  try {
    sessionStorage.setItem(storageKey, JSON.stringify([...marcados]))
  } catch {
    /* quota ou modo privado — mantém só em memória */
  }
  const listeners = listenersPorChave.get(storageKey)
  if (!listeners) return
  for (const listener of listeners) listener()
}

function inscreverMarcacao(storageKey: string, listener: ListenerMarcacao): () => void {
  const conjunto = listenersPorChave.get(storageKey) ?? new Set<ListenerMarcacao>()
  conjunto.add(listener)
  listenersPorChave.set(storageKey, conjunto)
  return () => {
    const atual = listenersPorChave.get(storageKey)
    if (!atual) return
    atual.delete(listener)
    if (atual.size === 0) listenersPorChave.delete(storageKey)
  }
}

function usarMarcacaoSessaoUsuario(storagePrefix: string, chaveSessao: string) {
  const storageKey = `${storagePrefix}${chaveSessao}`

  const [marcados, setMarcados] = useState<Set<string>>(() => {
    if (!chaveSessao) return new Set()
    return new Set(obterMarcadosCache(storageKey))
  })

  useEffect(() => {
    if (!chaveSessao) {
      setMarcados(new Set())
      return
    }
    setMarcados(new Set(obterMarcadosCache(storageKey)))
    return inscreverMarcacao(storageKey, () => {
      setMarcados(new Set(obterMarcadosCache(storageKey)))
    })
  }, [storageKey, chaveSessao])

  const estaMarcado = useCallback((chave: string) => marcados.has(chave), [marcados])

  const alternarMarcado = useCallback(
    (chave: string) => {
      if (!chaveSessao) return
      const atual = obterMarcadosCache(storageKey)
      const next = new Set(atual)
      if (next.has(chave)) next.delete(chave)
      else next.add(chave)
      persistirMarcados(storageKey, next)
    },
    [chaveSessao, storageKey],
  )

  return { estaMarcado, alternarMarcado, marcados }
}

export function chaveItemChecklistUsuario(regraId: string, rotuloInvoice?: string | null): string {
  return rotuloInvoice ? `${regraId}@${rotuloInvoice}` : regraId
}

export function chaveCampoConferenciaUsuario(chaveCampo: string): string {
  return chaveCampo
}

export function chaveRiscoConferenciaUsuario(riscoId: string): string {
  return riscoId
}

export function usarChecklistMarcacaoUsuario(chaveSessao: string) {
  return usarMarcacaoSessaoUsuario(STORAGE_PREFIX_CHECKLIST, chaveSessao)
}

export function usarCamposMarcacaoConferencia(chaveSessao: string) {
  return usarMarcacaoSessaoUsuario(STORAGE_PREFIX_CAMPOS, chaveSessao)
}

export function usarRiscosMarcacaoConferencia(chaveSessao: string) {
  return usarMarcacaoSessaoUsuario(STORAGE_PREFIX_RISCOS, chaveSessao)
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

export function contarConferenciaUsuarioCamposERiscos(
  marcadosCampos: Set<string>,
  marcadosRiscos: Set<string>,
  chavesCampos: readonly string[],
  chavesRiscos: readonly string[],
): ResumoConferenciaManualChecklist & {
  marcadosCampos: number
  marcadosRiscos: number
  totalCampos: number
  totalRiscos: number
} {
  const totalCampos = chavesCampos.length
  const totalRiscos = chavesRiscos.length
  const total = totalCampos + totalRiscos
  const marcadosCamposCount = chavesCampos.filter((chave) => marcadosCampos.has(chave)).length
  const marcadosRiscosCount = chavesRiscos.filter((chave) => marcadosRiscos.has(chave)).length
  const marcados = marcadosCamposCount + marcadosRiscosCount

  return {
    total,
    marcados,
    percentual: total === 0 ? 0 : Math.round((marcados / total) * 100),
    marcadosCampos: marcadosCamposCount,
    marcadosRiscos: marcadosRiscosCount,
    totalCampos,
    totalRiscos,
  }
}
