/**
 * comparar-documentos-conferencia-smart-read.ts
 * Compara dois documentos (resultado_extracao.dados) campo a campo,
 * alinhando pelo caminho_campo legado (chave) dentro de cada seção DDD.
 */

import {
  extrairSecoesConferenciaLeitura,
  type SecaoConferenciaLeitura,
} from './extrair-secoes-conferencia-leitura-smart-read'

export type StatusCampoComparacao = 'igual' | 'divergente' | 'somente_a' | 'somente_b' | 'vazio'

/** Classifica um par de valores pelo conteúdo preenchido (não pela presença da chave). */
export function classificarComparacao(
  valorA: string | null,
  valorB: string | null,
): StatusCampoComparacao {
  const preenchidoA = (valorA ?? '').trim() !== ''
  const preenchidoB = (valorB ?? '').trim() !== ''
  if (preenchidoA && preenchidoB) {
    return normalizarValor(valorA) === normalizarValor(valorB) ? 'igual' : 'divergente'
  }
  if (preenchidoA) return 'somente_a'
  if (preenchidoB) return 'somente_b'
  return 'vazio'
}

export type LinhaComparacaoCampo = {
  chave: string
  rotulo: string
  valor_a: string | null
  valor_b: string | null
  status: StatusCampoComparacao
}

export type SecaoComparacaoConferencia = {
  id: string
  titulo: string
  linhas: LinhaComparacaoCampo[]
  divergencias: number
}

export type ResultadoComparacaoConferencia = {
  secoes: SecaoComparacaoConferencia[]
  total: number
  iguais: number
  divergentes: number
  somente_a: number
  somente_b: number
  vazios: number
}

const CHAVES_IGNORADAS = new Set(['isSigned'])

export function normalizarValor(valor: string | null): string {
  return (valor ?? '').trim().toLowerCase().replace(/\s+/g, ' ')
}

function indexarPorTitulo(secoes: SecaoConferenciaLeitura[]): Map<string, SecaoConferenciaLeitura> {
  const mapa = new Map<string, SecaoConferenciaLeitura>()
  for (const secao of secoes) mapa.set(secao.titulo, secao)
  return mapa
}

function ordemTitulos(
  secoesA: SecaoConferenciaLeitura[],
  secoesB: SecaoConferenciaLeitura[],
): string[] {
  const titulos: string[] = []
  const vistos = new Set<string>()
  for (const secao of [...secoesA, ...secoesB]) {
    if (!vistos.has(secao.titulo)) {
      vistos.add(secao.titulo)
      titulos.push(secao.titulo)
    }
  }
  return titulos
}

export function compararDocumentosConferencia(
  dadosA: Record<string, unknown> | null | undefined,
  dadosB: Record<string, unknown> | null | undefined,
): ResultadoComparacaoConferencia {
  const secoesA = extrairSecoesConferenciaLeitura(dadosA ?? {})
  const secoesB = extrairSecoesConferenciaLeitura(dadosB ?? {})

  const mapaA = indexarPorTitulo(secoesA)
  const mapaB = indexarPorTitulo(secoesB)

  const secoes: SecaoComparacaoConferencia[] = []
  let total = 0
  let iguais = 0
  let divergentes = 0
  let somenteA = 0
  let somenteB = 0
  let vazios = 0

  ordemTitulos(secoesA, secoesB).forEach((titulo, indice) => {
    const camposA = (mapaA.get(titulo)?.campos ?? []).filter((c) => !CHAVES_IGNORADAS.has(c.chave))
    const camposB = (mapaB.get(titulo)?.campos ?? []).filter((c) => !CHAVES_IGNORADAS.has(c.chave))

    const indiceA = new Map(camposA.map((c) => [c.chave, c]))
    const indiceB = new Map(camposB.map((c) => [c.chave, c]))

    const chaves: string[] = []
    const vistas = new Set<string>()
    for (const campo of [...camposA, ...camposB]) {
      if (!vistas.has(campo.chave)) {
        vistas.add(campo.chave)
        chaves.push(campo.chave)
      }
    }

    const linhas: LinhaComparacaoCampo[] = chaves.map((chave) => {
      const a = indiceA.get(chave)
      const b = indiceB.get(chave)
      const valor_a = a?.valor ?? null
      const valor_b = b?.valor ?? null
      const rotulo = a?.rotulo ?? b?.rotulo ?? chave

      const status = classificarComparacao(valor_a, valor_b)

      total++
      if (status === 'igual') iguais++
      else if (status === 'divergente') divergentes++
      else if (status === 'somente_a') somenteA++
      else if (status === 'somente_b') somenteB++
      else vazios++

      return { chave, rotulo, valor_a, valor_b, status }
    })

    if (linhas.length === 0) return

    secoes.push({
      id: `cmp-${indice}`,
      titulo,
      linhas,
      divergencias: linhas.filter((l) => l.status === 'divergente').length,
    })
  })

  return { secoes, total, iguais, divergentes, somente_a: somenteA, somente_b: somenteB, vazios }
}
