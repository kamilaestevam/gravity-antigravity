import {
  CATALOGO_NCM_SIMULADOR_PEDIDO,
  ULTIMA_SYNC_NCM_SIMULADOR_PEDIDO,
  type NcmCatalogoSimuladorPedido,
} from './dados-ncm-simulador-pedido'

export type ResultadoBuscaNcmSimuladorPedido = {
  itens: Array<{ codigo: string; descricao: string }>
  ultima_sync: string
  fuzzy: boolean
}

export type ResultadoValidarNcmSimuladorPedido = {
  valido: boolean
  descricao: string | null
  fonte: 'cache' | 'portal' | null
  ultima_sync: string | null
  motivo: string | null
  ii: number | null
  ipi: number | null
  pis: number | null
  cofins: number | null
}

const mapaPorCodigo = new Map<string, NcmCatalogoSimuladorPedido>(
  CATALOGO_NCM_SIMULADOR_PEDIDO.map((item) => [item.codigo, item]),
)

function buscarExato(query: string, limite: number): Array<{ codigo: string; descricao: string }> {
  const q = query.trim()
  if (q.length < 2) return []

  const isCodigoParcial = /^\d+$/.test(q)
  const filtrados = CATALOGO_NCM_SIMULADOR_PEDIDO.filter((item) => {
    if (isCodigoParcial) return item.codigo.startsWith(q)
    return item.descricao.toLowerCase().includes(q.toLowerCase())
  })

  return filtrados
    .slice(0, limite)
    .map((item) => ({ codigo: item.codigo, descricao: item.descricao }))
}

function buscarFuzzy(query: string, limite: number): Array<{ codigo: string; descricao: string }> {
  const palavras = query
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .filter((p) => p.length >= 2)

  if (palavras.length === 0) return []

  const pontuados = CATALOGO_NCM_SIMULADOR_PEDIDO.map((item) => {
    const desc = item.descricao.toLowerCase()
    let score = 0
    for (const palavra of palavras) {
      if (desc.includes(palavra)) score += palavra.length
    }
    return { item, score }
  })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score || a.item.codigo.localeCompare(b.item.codigo))

  return pontuados
    .slice(0, limite)
    .map((x) => ({ codigo: x.item.codigo, descricao: x.item.descricao }))
}

export function buscarNcmSimuladorPedido(query: string, limite = 20): ResultadoBuscaNcmSimuladorPedido {
  const q = query.trim()
  const limiteResolvido = Number.isFinite(limite) && limite > 0 ? Math.min(limite, 100) : 20

  if (q.length < 2) {
    return { itens: [], ultima_sync: ULTIMA_SYNC_NCM_SIMULADOR_PEDIDO, fuzzy: false }
  }

  const exatos = buscarExato(q, limiteResolvido)
  if (exatos.length > 0) {
    return { itens: exatos, ultima_sync: ULTIMA_SYNC_NCM_SIMULADOR_PEDIDO, fuzzy: false }
  }

  const isCodigoParcial = /^\d+$/.test(q)
  if (!isCodigoParcial) {
    const fuzzy = buscarFuzzy(q, limiteResolvido)
    if (fuzzy.length > 0) {
      return { itens: fuzzy, ultima_sync: ULTIMA_SYNC_NCM_SIMULADOR_PEDIDO, fuzzy: true }
    }
  }

  return { itens: [], ultima_sync: ULTIMA_SYNC_NCM_SIMULADOR_PEDIDO, fuzzy: false }
}

export function validarNcmSimuladorPedido(codigo: string): ResultadoValidarNcmSimuladorPedido {
  if (!/^\d{8}$/.test(codigo)) {
    return {
      valido: false,
      descricao: null,
      fonte: null,
      ultima_sync: null,
      motivo: 'Código NCM deve ter exatamente 8 dígitos numéricos',
      ii: null,
      ipi: null,
      pis: null,
      cofins: null,
    }
  }

  const local = mapaPorCodigo.get(codigo)
  if (local) {
    return {
      valido: true,
      descricao: local.descricao,
      fonte: 'cache',
      ultima_sync: ULTIMA_SYNC_NCM_SIMULADOR_PEDIDO,
      motivo: null,
      ii: local.ii,
      ipi: local.ipi,
      pis: local.pis,
      cofins: local.cofins,
    }
  }

  return {
    valido: false,
    descricao: null,
    fonte: null,
    ultima_sync: ULTIMA_SYNC_NCM_SIMULADOR_PEDIDO,
    motivo: 'NCM não encontrado no cache local nem no Portal Único Siscomex',
    ii: null,
    ipi: null,
    pis: null,
    cofins: null,
  }
}
