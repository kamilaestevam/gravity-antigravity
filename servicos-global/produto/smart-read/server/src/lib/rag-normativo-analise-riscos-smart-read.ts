/**
 * rag-normativo-analise-riscos-smart-read.ts — chunks KB Gabi (V3 piloto, sem pgvector)
 */

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import type { ContextoAuditoriaV1Leitura, RiscoAduaneiroLeitura } from '../../../shared/analise-riscos-leitura-smart-read.js'

const __dir = path.dirname(fileURLToPath(import.meta.url))
const SEGMENTS_DIR = path.resolve(
  __dir,
  '../../../../../servicos-plataforma/gabi/server/knowledge/segments',
)

const MAX_CHARS_POR_SEGMENTO = 1_800

const cacheSegmentos = new Map<string, string>()

function lerSegmento(nome: string): string {
  const emCache = cacheSegmentos.get(nome)
  if (emCache !== undefined) return emCache

  const caminho = path.join(SEGMENTS_DIR, `${nome}.txt`)
  if (!fs.existsSync(caminho)) {
    cacheSegmentos.set(nome, '')
    return ''
  }

  const bruto = fs.readFileSync(caminho, 'utf-8').trim()
  const truncado =
    bruto.length > MAX_CHARS_POR_SEGMENTO
      ? `${bruto.slice(0, MAX_CHARS_POR_SEGMENTO)}\n[... truncado para análise de riscos]`
      : bruto
  cacheSegmentos.set(nome, truncado)
  return truncado
}

function extrairTrechoPorPalavras(conteudo: string, palavras: string[]): string {
  if (!conteudo || palavras.length === 0) return conteudo

  const linhas = conteudo.split('\n')
  const hits = linhas.filter((linha) => {
    const norm = linha.toLowerCase()
    return palavras.some((p) => norm.includes(p.toLowerCase()))
  })

  if (hits.length === 0) return conteudo.slice(0, MAX_CHARS_POR_SEGMENTO)
  return hits.slice(0, 12).join('\n').slice(0, MAX_CHARS_POR_SEGMENTO)
}

export function precisaRagNormativoAnaliseRiscos(
  riscos: RiscoAduaneiroLeitura[],
  contexto: ContextoAuditoriaV1Leitura,
): boolean {
  const criticoNormativo = riscos.some(
    (r) =>
      r.severidade === 'critico' && (r.categoria === 'normativo' || r.categoria === 'ncm'),
  )
  return criticoNormativo || contexto.ncms_encontrados.length > 0
}

export function buscarChunksRagNormativoAnaliseRiscos(
  riscos: RiscoAduaneiroLeitura[],
  contexto: ContextoAuditoriaV1Leitura,
): string[] {
  if (!fs.existsSync(SEGMENTS_DIR)) {
    return []
  }

  const segmentos = new Set<string>(['nf-importacao'])
  const temIncoterm = riscos.some((r) => r.categoria === 'incoterm')
  const temFinanceiro = riscos.some((r) => r.categoria === 'normativo' || r.categoria === 'matematico')

  if (temIncoterm || temFinanceiro) {
    segmentos.add('financeiro-comex')
    segmentos.add('simula-custo')
  }

  const palavras: string[] = []
  for (const ncm of contexto.ncms_encontrados.slice(0, 5)) {
    palavras.push('NCM', ncm)
  }
  if (temIncoterm) palavras.push('Incoterm', 'FOB', 'CIF', 'valor aduaneiro')
  if (riscos.some((r) => r.titulo.toLowerCase().includes('siscomex'))) {
    palavras.push('Siscomex', 'classificação fiscal')
  }

  const saida: string[] = []
  for (const nome of segmentos) {
    const bruto = lerSegmento(nome)
    if (!bruto) continue
    const trecho = palavras.length > 0 ? extrairTrechoPorPalavras(bruto, palavras) : bruto
    saida.push(`[KB Gabi / ${nome}]\n${trecho}`)
  }

  return saida
}
