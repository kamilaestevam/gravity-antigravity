/**
 * heuristica-checklist-instantaneo-smart-read.ts — pré-validação local (<3s) antes do LLM
 */

import type { DadosOficiaisCnpjLeitura } from './analise-riscos-leitura-smart-read.js'

const ABREVIACOES_EMPRESA: Record<string, string> = {
  ltda: 'limitada',
  sa: 'sociedade anonima',
  's/a': 'sociedade anonima',
  's a': 'sociedade anonima',
  inc: 'incorporated',
  corp: 'corporation',
  co: 'company',
}

export function normalizarTextoHeuristicaChecklist(valor: string): string {
  let texto = valor
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
  for (const [abrev, expandido] of Object.entries(ABREVIACOES_EMPRESA)) {
    const padrao = abrev.includes(' ')
      ? new RegExp(abrev.replace(/\s+/g, '\\s+'), 'g')
      : new RegExp(`\\b${abrev}\\b`, 'g')
    texto = texto.replace(padrao, expandido)
  }
  return texto.replace(/\s+/g, ' ').trim()
}

/** Similaridade 0–1 por tokens em comum (rápida, sem LLM). */
export function similaridadeTextoHeuristicaChecklist(a: string, b: string): number {
  const na = normalizarTextoHeuristicaChecklist(a)
  const nb = normalizarTextoHeuristicaChecklist(b)
  if (!na || !nb) return 0
  if (na === nb) return 1
  if (na.includes(nb) || nb.includes(na)) return 0.92

  const tokensA = new Set(na.split(' ').filter((t) => t.length > 2))
  const tokensB = new Set(nb.split(' ').filter((t) => t.length > 2))
  if (tokensA.size === 0 || tokensB.size === 0) return 0

  let intersecao = 0
  for (const token of tokensA) {
    if (tokensB.has(token)) intersecao += 1
  }
  return intersecao / Math.max(tokensA.size, tokensB.size)
}

export type ResultadoHeuristicaTexto = {
  similaridade: number
  conforme: boolean
  rotulo: 'conforme' | 'atencao' | 'sem_dado'
}

export function avaliarSimilaridadeHeuristicaChecklist(
  extraido: string | null | undefined,
  oficial: string | null | undefined,
  limiarConforme = 0.72,
): ResultadoHeuristicaTexto {
  const a = extraido?.trim()
  const b = oficial?.trim()
  if (!a) return { similaridade: 0, conforme: false, rotulo: 'sem_dado' }
  if (!b) return { similaridade: 0, conforme: false, rotulo: 'atencao' }
  const similaridade = similaridadeTextoHeuristicaChecklist(a, b)
  const conforme = similaridade >= limiarConforme
  return { similaridade, conforme, rotulo: conforme ? 'conforme' : 'atencao' }
}

export function montarEnderecoOficialCnpj(dados: DadosOficiaisCnpjLeitura): string {
  return [
    dados.logradouro,
    dados.numero,
    dados.bairro,
    dados.municipio,
    dados.uf,
    dados.cep,
  ]
    .filter((parte) => parte?.trim())
    .join(', ')
}
