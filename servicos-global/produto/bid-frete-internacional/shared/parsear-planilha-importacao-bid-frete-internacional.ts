import {
  CAMPOS_IMPORTACAO_BID_FRETE_INTERNACIONAL,
  criarLinhaImportacaoVaziaBid,
  detectarLinhaCabecalhoImportacaoBid,
  normalizarNomeCampoImportacaoBidFreteInternacional,
  rotuloTemplateImportacaoBid,
  CAMPOS_TEMPLATE_GRAVITY_META,
} from './campos-importacao-bid-frete-internacional'
import {
  calcularConfiancaGlobalMapeamento,
  calcularScoreEssenciaisBid,
  mapearColunasImportacaoBidFreteInternacional,
} from './mapear-colunas-importacao-bid-frete-internacional'
import { normalizarLinhaImportacaoBid } from './normalizar-valor-importacao-bid-frete-internacional'
import type {
  CampoImportacaoBidFreteInternacional,
  ColunaMapeadaBidFreteInternacional,
  LinhaImportacaoBidFreteInternacional,
  ModoPlanilhaImportacaoBidFreteInternacional,
  ResultadoParseImportacaoBidFreteInternacional,
} from './tipos-importacao-bid-frete-internacional'

function detectarDelimitador(linha: string): string {
  if (linha.includes(';')) return ';'
  if (linha.includes('\t')) return '\t'
  return ','
}

function splitCsvLine(line: string, delimiter: string): string[] {
  return line.split(delimiter).map(c => c.trim().replace(/^["']|["']$/g, ''))
}

function linhaVazia(cells: string[]): boolean {
  return cells.every(c => c.trim().length === 0)
}

export function parseCsvBruto(content: string): {
  cabecalhos: string[]
  linhasBrutas: Record<string, string>[]
} {
  const lines = content.split(/\r?\n/).filter(l => l.trim().length > 0)
  if (lines.length < 2) return { cabecalhos: [], linhasBrutas: [] }

  const delimiter = detectarDelimitador(lines[0])
  const matrix = lines.map(l => splitCsvLine(l, delimiter))
  const headerIdx = detectarLinhaCabecalhoImportacaoBid(matrix)
  const cabecalhos = matrix[headerIdx] ?? []

  const linhasBrutas: Record<string, string>[] = []
  for (let i = headerIdx + 1; i < matrix.length; i++) {
    const cells = matrix[i]
    if (linhaVazia(cells)) continue
    const row: Record<string, string> = {}
    cabecalhos.forEach((cab, idx) => {
      row[cab] = cells[idx] ?? ''
    })
    linhasBrutas.push(row)
  }

  return { cabecalhos, linhasBrutas }
}

function linhaVaziaImportacao(row: LinhaImportacaoBidFreteInternacional): boolean {
  return Object.values(row).every(v => !v?.trim())
}

function criarLinhaVazia() {
  return criarLinhaImportacaoVaziaBid()
}

export function aplicarMapeamentoImportacaoBid(
  linhasBrutas: Record<string, string>[],
  mapeamento: ColunaMapeadaBidFreteInternacional[],
): LinhaImportacaoBidFreteInternacional[] {
  return linhasBrutas.map(bruta => {
    const row = criarLinhaVazia()
    for (const col of mapeamento) {
      if (!col.campo_sistema) continue
      const valor = bruta[col.coluna_arquivo]
      if (valor !== undefined) {
        row[col.campo_sistema] = valor
      }
    }
    return row
  }).filter(r => !linhaVaziaImportacao(r))
}

function parseCsvModoGravity(content: string): ResultadoParseImportacaoBidFreteInternacional {
  const { cabecalhos, linhasBrutas } = parseCsvBruto(content)
  if (linhasBrutas.length === 0) {
    return {
      linhas: [],
      mapeamento: [],
      confianca_global: 0,
      score_essenciais: 0,
      colunas_detectadas: new Set(),
    }
  }

  const headerNorm = cabecalhos.map(normalizarNomeCampoImportacaoBidFreteInternacional)
  const colMap: Partial<Record<CampoImportacaoBidFreteInternacional, number>> = {}
  const colunasDetectadas = new Set<CampoImportacaoBidFreteInternacional>()

  for (const meta of CAMPOS_IMPORTACAO_BID_FRETE_INTERNACIONAL) {
    const idx = headerNorm.findIndex(h => {
      const keyNorm = normalizarNomeCampoImportacaoBidFreteInternacional(meta.campo)
      const rotuloNorm = normalizarNomeCampoImportacaoBidFreteInternacional(meta.rotulo)
      return h === keyNorm || h === rotuloNorm || h.replace(/\s/g, '') === keyNorm.replace(/\s/g, '')
    })
    if (idx >= 0) {
      colMap[meta.campo] = idx
      colunasDetectadas.add(meta.campo)
    }
  }

  const mapeamento: ColunaMapeadaBidFreteInternacional[] = cabecalhos.map((cab, idx) => {
    const campo = (Object.entries(colMap).find(([, i]) => i === idx)?.[0] ?? null) as CampoImportacaoBidFreteInternacional | null
    const exemplo = linhasBrutas.find(l => l[cab]?.trim())?.[cab] ?? null
    return {
      coluna_arquivo: cab,
      campo_sistema: campo,
      confianca: campo ? 99 : 0,
      nivel: campo ? 'auto' : 'ignorado',
      inferido_por: campo ? 'nome_interno' : 'alias',
      valor_exemplo: exemplo,
    }
  })

  const linhas = linhasBrutas.map(bruta => {
    const row = criarLinhaVazia()
    for (const meta of CAMPOS_IMPORTACAO_BID_FRETE_INTERNACIONAL) {
      const idx = colMap[meta.campo]
      if (idx === undefined) continue
      const cab = cabecalhos[idx]
      row[meta.campo] = bruta[cab] ?? ''
    }
    return row
  })

  return {
    linhas,
    mapeamento,
    confianca_global: calcularConfiancaGlobalMapeamento(mapeamento),
    score_essenciais: calcularScoreEssenciaisBid(mapeamento),
    colunas_detectadas: colunasDetectadas,
  }
}

function parseCsvModoUsuario(content: string): ResultadoParseImportacaoBidFreteInternacional {
  const { cabecalhos, linhasBrutas } = parseCsvBruto(content)
  if (linhasBrutas.length === 0) {
    return {
      linhas: [],
      mapeamento: [],
      confianca_global: 0,
      score_essenciais: 0,
      colunas_detectadas: new Set(),
    }
  }

  const mapeamento = mapearColunasImportacaoBidFreteInternacional(cabecalhos, linhasBrutas)
  const linhas = aplicarMapeamentoImportacaoBid(linhasBrutas, mapeamento)
  const colunasDetectadas = new Set(
    mapeamento
      .filter(m => m.campo_sistema && m.confianca >= 70)
      .map(m => m.campo_sistema as CampoImportacaoBidFreteInternacional),
  )

  return {
    linhas,
    mapeamento,
    confianca_global: calcularConfiancaGlobalMapeamento(mapeamento),
    score_essenciais: calcularScoreEssenciaisBid(mapeamento),
    colunas_detectadas: colunasDetectadas,
  }
}

export function parsearPlanilhaImportacaoBidFreteInternacional(
  content: string,
  modo: ModoPlanilhaImportacaoBidFreteInternacional,
): ResultadoParseImportacaoBidFreteInternacional {
  const bruto = modo === 'gravity'
    ? parseCsvModoGravity(content)
    : parseCsvModoUsuario(content)

  return {
    ...bruto,
    linhas: bruto.linhas.map(normalizarLinhaImportacaoBid),
  }
}

/** Linha de exemplo — rótulos legíveis como na lista (`SIGLA — Nome`). */
export const LINHA_EXEMPLO_TEMPLATE_IMPORTACAO_BID: LinhaImportacaoBidFreteInternacional = {
  ...criarLinhaImportacaoVaziaBid(),
  referencia_interna_cotacao_bid_frete_internacional: 'PO-2026-001',
  tipo_operacao_cotacao_bid_frete_internacional: 'Importação',
  modal_cotacao_bid_frete_internacional: 'Marítimo',
  modalidade_cotacao_bid_frete_internacional: 'FCL',
  porto_origem_cotacao_bid_frete_internacional: 'BRSSZ — Santos',
  origem_nome_cotacao_bid_frete_internacional: 'Santos',
  origem_pais_cotacao_bid_frete_internacional: 'BR — Brasil',
  porto_destino_cotacao_bid_frete_internacional: 'CNSHA — Shanghai',
  destino_nome_cotacao_bid_frete_internacional: 'Shanghai',
  destino_pais_cotacao_bid_frete_internacional: 'CN — China',
  descricao_mercadoria_cotacao_bid_frete_internacional: 'Pecas automotivas',
  ncm_cotacao_bid_frete_internacional: '8708.99.90',
  quantidade_volume_cotacao_bid_frete_internacional: '10',
  tipo_container_cotacao_bid_frete_internacional: "45G1 — Dry · 40' HC",
  peso_kg_cotacao_bid_frete_internacional: '12500',
  cubagem_m3_cotacao_bid_frete_internacional: '58',
  incoterm_cotacao_bid_frete_internacional: 'FOB',
  moeda_meta_cotacao_bid_frete_internacional: 'USD',
  visibilidade_cotacao_bid_frete_internacional: 'Direcionada',
}

export function baixarTemplateCsvGravity(): string {
  const campos = CAMPOS_TEMPLATE_GRAVITY_META
  const totalEssenciais = campos.filter(c => c.grupo === 'essencial').length
  const superEssencial = 'ESSENCIAL  ·  preencha este bloco'
  const superDetalhes = 'DETALHES  ·  expanda apenas se necessario'
  const linha1 = [
    superEssencial,
    ...Array(Math.max(0, totalEssenciais - 1)).fill(''),
    superDetalhes,
    ...Array(Math.max(0, campos.length - totalEssenciais - 1)).fill(''),
  ].join(';')
  const headers = campos.map(c => rotuloTemplateImportacaoBid(c)).join(';')
  const exemplo = campos.map(c => LINHA_EXEMPLO_TEMPLATE_IMPORTACAO_BID[c.campo] ?? '').join(';')
  return `${linha1}\n${headers}\n${exemplo}\n`
}
