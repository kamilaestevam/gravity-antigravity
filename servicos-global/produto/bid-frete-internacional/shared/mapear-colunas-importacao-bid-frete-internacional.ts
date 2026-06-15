import {
  CAMPO_BID_POR_ALIAS,
  CAMPO_BID_POR_NOME_INTERNO,
  CAMPO_BID_POR_ROTULO,
  CAMPOS_ESSENCIAIS_IMPORTACAO_BID,
  normalizarNomeCampoImportacaoBidFreteInternacional,
  type CampoImportacaoBidMeta,
} from './campos-importacao-bid-frete-internacional'
import type {
  CampoImportacaoBidFreteInternacional,
  ColunaMapeadaBidFreteInternacional,
  ModoPlanilhaImportacaoBidFreteInternacional,
  NivelConfiancaMapeamento,
} from './tipos-importacao-bid-frete-internacional'

const INCOTERMS = ['FOB', 'CIF', 'EXW', 'DDP', 'DAP', 'FCA', 'CPT', 'CIP', 'DPU', 'FAS', 'CFR'] as const
const TIPOS_OPERACAO = ['IMPORTACAO', 'EXPORTACAO'] as const
const MODAIS = ['MARITIMO', 'AEREO', 'RODOVIARIO'] as const

function nivelDeConfianca(confianca: number): NivelConfiancaMapeamento {
  if (confianca >= 90) return 'auto'
  if (confianca >= 70) return 'confirmado'
  return 'ignorado'
}

function cabecalhoSugereOrigem(cabNorm: string): boolean {
  return /orig|pol|loading|from|source|embarque/.test(cabNorm)
}

function cabecalhoSugereDestino(cabNorm: string): boolean {
  return /dest|pod|discharge|to|arrival|descarga/.test(cabNorm)
}

function cabecalhoSugereCodigo(cabNorm: string): boolean {
  return /cod|code|loc|unlocode|porto|port|locode/.test(cabNorm)
}

function cabecalhoSugereNome(cabNorm: string): boolean {
  return /nome|name|city|cidade|porto/.test(cabNorm) && !cabecalhoSugereCodigo(cabNorm)
}

function inferirPorDados(
  cabecalho: string,
  valores: string[],
): { campo: CampoImportacaoBidFreteInternacional; confianca: number } | null {
  const amostras = valores.filter(v => v.trim().length > 0).slice(0, 10)
  if (amostras.length === 0) return null

  const cabNorm = normalizarNomeCampoImportacaoBidFreteInternacional(cabecalho)

  if (amostras.every(v => INCOTERMS.includes(v.toUpperCase().trim() as typeof INCOTERMS[number]))) {
    return { campo: 'incoterm_cotacao_bid_frete_internacional', confianca: 92 }
  }

  if (amostras.every(v => TIPOS_OPERACAO.includes(v.toUpperCase().trim() as typeof TIPOS_OPERACAO[number]))) {
    return { campo: 'tipo_operacao_cotacao_bid_frete_internacional', confianca: 91 }
  }

  if (amostras.every(v => MODAIS.includes(v.toUpperCase().trim() as typeof MODAIS[number]))) {
    return { campo: 'modal_cotacao_bid_frete_internacional', confianca: 90 }
  }

  const ncmRegex = /^\d{4}[.\s]?\d{2}[.\s]?\d{2}$/
  if (amostras.filter(v => ncmRegex.test(v.trim())).length >= amostras.length * 0.7) {
    return { campo: 'ncm_cotacao_bid_frete_internacional', confianca: 88 }
  }

  const portCodeRegex = /^[A-Za-z]{2}[A-Za-z0-9]{3}$/
  if (amostras.filter(v => portCodeRegex.test(v.trim())).length >= amostras.length * 0.7) {
    if (cabecalhoSugereOrigem(cabNorm)) {
      if (/porto|pol|port/.test(cabNorm)) {
        return { campo: 'porto_origem_cotacao_bid_frete_internacional', confianca: 88 }
      }
      if (/aeroporto|airport|aol/.test(cabNorm)) {
        return { campo: 'aeroporto_origem_cotacao_bid_frete_internacional', confianca: 88 }
      }
      return {
        campo: cabecalhoSugereNome(cabNorm)
          ? 'origem_nome_cotacao_bid_frete_internacional'
          : 'origem_codigo_cotacao_bid_frete_internacional',
        confianca: 86,
      }
    }
    if (cabecalhoSugereDestino(cabNorm)) {
      if (/porto|pod|port/.test(cabNorm)) {
        return { campo: 'porto_destino_cotacao_bid_frete_internacional', confianca: 88 }
      }
      if (/aeroporto|airport|aod/.test(cabNorm)) {
        return { campo: 'aeroporto_destino_cotacao_bid_frete_internacional', confianca: 88 }
      }
      return {
        campo: cabecalhoSugereNome(cabNorm)
          ? 'destino_nome_cotacao_bid_frete_internacional'
          : 'destino_codigo_cotacao_bid_frete_internacional',
        confianca: 86,
      }
    }
    return { campo: 'origem_codigo_cotacao_bid_frete_internacional', confianca: 72 }
  }

  if (amostras.every(v => /^\d+$/.test(v.trim()) && Number(v) > 0)) {
    return { campo: 'quantidade_volume_cotacao_bid_frete_internacional', confianca: 85 }
  }

  if (amostras.every(v => v.trim().length >= 8)) {
    return { campo: 'descricao_mercadoria_cotacao_bid_frete_internacional', confianca: 70 }
  }

  return null
}

function mapearCabecalho(
  cabecalho: string,
  exemplo: string | null,
): ColunaMapeadaBidFreteInternacional {
  const cabNorm = normalizarNomeCampoImportacaoBidFreteInternacional(cabecalho)
  let meta: CampoImportacaoBidMeta | null = null
  let confianca = 0
  let inferido_por: ColunaMapeadaBidFreteInternacional['inferido_por'] = 'alias'

  const matchRotulo = CAMPO_BID_POR_ROTULO.get(cabNorm)
  if (matchRotulo) {
    meta = matchRotulo
    confianca = 99
    inferido_por = 'rotulo'
  }

  if (!meta) {
    const matchNome = CAMPO_BID_POR_NOME_INTERNO.get(cabNorm)
    if (matchNome) {
      meta = matchNome
      confianca = 95
      inferido_por = 'nome_interno'
    }
  }

  if (!meta) {
    const matchAlias = CAMPO_BID_POR_ALIAS.get(cabNorm)
    if (matchAlias?.length === 1) {
      meta = matchAlias[0]
      confianca = 92
      inferido_por = 'alias'
    }
  }

  if (!meta) {
    const candidatos: CampoImportacaoBidMeta[] = []
    for (const [alias, metas] of CAMPO_BID_POR_ALIAS.entries()) {
      if (alias.length < 6) continue
      if (cabNorm.includes(alias) || alias.includes(cabNorm)) {
        candidatos.push(...metas)
      }
    }
    const unicos = Array.from(new Set(candidatos.map(c => c.campo)))
    if (unicos.length === 1) {
      meta = candidatos[0]
      confianca = 70
      inferido_por = 'alias'
    }
  }

  return {
    coluna_arquivo: cabecalho,
    campo_sistema: meta?.campo ?? null,
    confianca,
    nivel: nivelDeConfianca(confianca),
    inferido_por,
    valor_exemplo: exemplo,
  }
}

export function mapearColunasImportacaoBidFreteInternacional(
  cabecalhos: string[],
  linhasBrutas: Record<string, string>[],
): ColunaMapeadaBidFreteInternacional[] {
  const mapeamentoInicial = cabecalhos.map(cab => {
    const exemplo = linhasBrutas
      .map(l => l[cab])
      .find(v => v !== undefined && v.trim().length > 0) ?? null
    return mapearCabecalho(cab, exemplo)
  })

  return mapeamentoInicial.map(col => {
    if (col.campo_sistema && col.confianca >= 80) return col
    const valores = linhasBrutas.map(l => l[col.coluna_arquivo] ?? '')
    const inferido = inferirPorDados(col.coluna_arquivo, valores)
    if (!inferido) return col
    return {
      ...col,
      campo_sistema: inferido.campo,
      confianca: Math.max(col.confianca, inferido.confianca),
      nivel: nivelDeConfianca(Math.max(col.confianca, inferido.confianca)),
      inferido_por: 'dados',
    }
  })
}

export function calcularConfiancaGlobalMapeamento(
  mapeamento: ColunaMapeadaBidFreteInternacional[],
): number {
  if (mapeamento.length === 0) return 0
  const soma = mapeamento.reduce((acc, m) => acc + m.confianca, 0)
  return Math.round(soma / mapeamento.length)
}

export function calcularScoreEssenciaisBid(
  mapeamento: ColunaMapeadaBidFreteInternacional[],
): number {
  if (CAMPOS_ESSENCIAIS_IMPORTACAO_BID.size === 0) return 0
  const mapeados = new Set(
    mapeamento
      .filter(m => m.campo_sistema && m.confianca >= 70)
      .map(m => m.campo_sistema as CampoImportacaoBidFreteInternacional),
  )
  let matched = 0
  for (const campo of CAMPOS_ESSENCIAIS_IMPORTACAO_BID) {
    if (mapeados.has(campo)) matched++
  }
  return matched / CAMPOS_ESSENCIAIS_IMPORTACAO_BID.size
}

export function camposEssenciaisAusentes(
  mapeamento: ColunaMapeadaBidFreteInternacional[],
): CampoImportacaoBidFreteInternacional[] {
  const mapeados = new Set(
    mapeamento
      .filter(m => m.campo_sistema && m.confianca >= 70)
      .map(m => m.campo_sistema as CampoImportacaoBidFreteInternacional),
  )
  return [...CAMPOS_ESSENCIAIS_IMPORTACAO_BID].filter(c => !mapeados.has(c))
}

/** Campos mapeados por mais de uma coluna do arquivo (bloqueia avanço). */
export function conflitosMapeamentoBid(
  mapeamento: ColunaMapeadaBidFreteInternacional[],
): CampoImportacaoBidFreteInternacional[] {
  const vistos = new Map<CampoImportacaoBidFreteInternacional, string>()
  const conflitos = new Set<CampoImportacaoBidFreteInternacional>()

  for (const col of mapeamento) {
    if (!col.campo_sistema) continue
    const prev = vistos.get(col.campo_sistema)
    if (prev) conflitos.add(col.campo_sistema)
    else vistos.set(col.campo_sistema, col.coluna_arquivo)
  }

  return [...conflitos]
}

/** Planilha Gravity reconhecida — pula etapa de mapeamento (paridade BID avulso × BID conjunto). */
export function podePularMapeamentoImportacaoBid(
  modo: ModoPlanilhaImportacaoBidFreteInternacional,
  mapeamento: ColunaMapeadaBidFreteInternacional[],
  totalLinhas: number,
): boolean {
  if (modo !== 'gravity') return false
  if (totalLinhas <= 0) return false
  if (camposEssenciaisAusentes(mapeamento).length > 0) return false
  if (conflitosMapeamentoBid(mapeamento).length > 0) return false
  return calcularScoreEssenciaisBid(mapeamento) >= 1
}
