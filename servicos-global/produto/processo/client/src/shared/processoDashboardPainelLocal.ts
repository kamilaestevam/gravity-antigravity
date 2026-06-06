/**
 * Painéis do Dashboard Processo — persistência local até API dedicada (stub).
 */

function novoIdPainel(): string {
  return `processo_${globalThis.crypto.randomUUID()}`
}

export interface ProcessoDashboardPainel {
  id: string
  nome: string
  ordem: number
  is_visivel: boolean
}

const STORAGE_PAINEIS = 'processo:dashboard:paineis'
const STORAGE_PAINEL_ATUAL = 'processo:dashboard:painel-atual-id'

function lerPaineis(): ProcessoDashboardPainel[] {
  try {
    const raw = localStorage.getItem(STORAGE_PAINEIS)
    if (!raw) return []
    const parsed = JSON.parse(raw) as ProcessoDashboardPainel[]
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function gravarPaineis(paineis: ProcessoDashboardPainel[]): void {
  localStorage.setItem(STORAGE_PAINEIS, JSON.stringify(paineis))
}

function painelPrincipal(): ProcessoDashboardPainel {
  return {
    id: novoIdPainel(),
    nome: 'Principal',
    ordem: 0,
    is_visivel: true,
  }
}

export const paineisDashboardProcessoLocal = {
  listar(): ProcessoDashboardPainel[] {
    const data = lerPaineis()
    if (data.length === 0) {
      const padrao = painelPrincipal()
      gravarPaineis([padrao])
      localStorage.setItem(STORAGE_PAINEL_ATUAL, padrao.id)
      return [padrao]
    }
    return data
  },

  lerPainelAtualId(): string | null {
    try {
      return localStorage.getItem(STORAGE_PAINEL_ATUAL)
    } catch {
      return null
    }
  },

  gravarPainelAtualId(id: string): void {
    localStorage.setItem(STORAGE_PAINEL_ATUAL, id)
  },

  criar(nome: string): ProcessoDashboardPainel {
    const paineis = lerPaineis()
    const proximo: ProcessoDashboardPainel = {
      id: novoIdPainel(),
      nome,
      ordem: (paineis.at(-1)?.ordem ?? -1) + 1,
      is_visivel: true,
    }
    gravarPaineis([...paineis, proximo])
    return proximo
  },

  atualizar(id: string, patch: { nome?: string; is_visivel?: boolean }): ProcessoDashboardPainel {
    const paineis = lerPaineis()
    const idx = paineis.findIndex(p => p.id === id)
    if (idx === -1) throw new Error('Painel não encontrado')
    const atualizado = { ...paineis[idx], ...patch }
    paineis[idx] = atualizado
    gravarPaineis(paineis)
    return atualizado
  },

  deletar(id: string): void {
    const paineis = lerPaineis().filter(p => p.id !== id)
    gravarPaineis(paineis)
  },

  reordenar(ids: string[]): void {
    const mapa = new Map(lerPaineis().map(p => [p.id, p]))
    const reordenados = ids
      .map((id, index) => {
        const p = mapa.get(id)
        return p ? { ...p, ordem: index } : null
      })
      .filter((p): p is ProcessoDashboardPainel => p != null)
    gravarPaineis(reordenados)
  },
}

/** Porta async para ProcessoDashboardPainelBar (paridade API remota). */
export const paineisDashboardProcessoApi = {
  atualizar: (id: string, patch: { nome?: string; is_visivel?: boolean }) =>
    Promise.resolve(paineisDashboardProcessoLocal.atualizar(id, patch)),
  deletar: (id: string) => {
    paineisDashboardProcessoLocal.deletar(id)
    return Promise.resolve(undefined)
  },
  reordenar: (ids: string[]) => {
    paineisDashboardProcessoLocal.reordenar(ids)
    return Promise.resolve(undefined)
  },
}
