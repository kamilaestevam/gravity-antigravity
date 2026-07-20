/**
 * catalogo-ncm-simulador-bid-frete.ts — catálogo NCM do simulador de marketing
 * usando o MESMO dado de produção (snapshot da tabela ncm_sync do serviço
 * Cadastros, sincronizada do Portal Único) e a MESMA lógica de busca do
 * backend real (motor-sync-ncm.buscarNcm):
 * - query numérica → startsWith no código (ex.: "8471")
 * - query textual  → contains case-insensitive na descrição (ex.: "processador")
 * - ordenação por código, limite 20
 * O snapshot (~530 KB) é carregado sob demanda via dynamic import.
 */

export type NcmCatalogoSimulador = {
  codigo: string
  descricao: string
}

const LIMITE_BUSCA_NCM = 20
export const MIN_CARACTERES_BUSCA_NCM = 2

let ncmCache: NcmCatalogoSimulador[] | null = null
let ncmPromise: Promise<NcmCatalogoSimulador[]> | null = null
let ultimaSyncCache: string | null = null

async function carregarNcms(): Promise<NcmCatalogoSimulador[]> {
  if (ncmCache) return ncmCache
  if (!ncmPromise) {
    ncmPromise = import('./dados-ncm-producao-simulador-bid-frete').then((m) => {
      ultimaSyncCache = m.ULTIMA_SYNC_NCM_PRODUCAO
      ncmCache = m.NCMS_CATALOGO_PRODUCAO.map((t) => ({ codigo: t[0], descricao: t[1] }))
      return ncmCache
    })
  }
  return ncmPromise
}

/** Data da última sincronização com o Portal Único (ISO) — para o footer do modal. */
export async function obterUltimaSyncNcmSimulador(): Promise<string | null> {
  await carregarNcms()
  return ultimaSyncCache
}

/**
 * Busca de NCM — paridade com buscarNcm de motor-sync-ncm.ts:
 * código parcial (só dígitos) → startsWith; texto → contains insensitive.
 */
export async function buscarNcmSimulador(query: string, limite = LIMITE_BUSCA_NCM): Promise<NcmCatalogoSimulador[]> {
  const q = query.trim()
  if (q.length === 0) return []

  const ncms = await carregarNcms()
  const isCodigoParcial = /^\d+$/.test(q)

  if (isCodigoParcial) {
    const resultado: NcmCatalogoSimulador[] = []
    for (const n of ncms) {
      if (n.codigo.startsWith(q)) {
        resultado.push(n)
        if (resultado.length >= limite) break
      }
    }
    return resultado
  }

  const qLower = q.toLowerCase()
  const resultado: NcmCatalogoSimulador[] = []
  for (const n of ncms) {
    if (n.descricao.toLowerCase().includes(qLower)) {
      resultado.push(n)
      if (resultado.length >= limite) break
    }
  }
  return resultado
}

/** Validação de código exato (8 dígitos) — paridade com useNcmValidation do produto real. */
export async function validarNcmSimulador(codigo: string): Promise<NcmCatalogoSimulador | null> {
  const d = codigo.replace(/\D/g, '')
  if (d.length !== 8) return null
  const ncms = await carregarNcms()
  return ncms.find((n) => n.codigo === d) ?? null
}
