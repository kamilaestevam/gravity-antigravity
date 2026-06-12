export interface CasoPlanoTeste {
  ordem: string
  titulo: string
  detalhe: string
  acao?: string
  aprovadoQuando?: string
  secao?: string
}

interface PassoJson {
  numero?: number
  id?: string
  acao?: string
  preCondicao?: string
}

function linhaEhSeparadorTabela(line: string): boolean {
  const cells = line.split('|').slice(1, -1).map(c => c.trim())
  return cells.length > 0 && cells.every(c => /^:?-{2,}:?$/.test(c.replace(/\*/g, '')))
}

function normalizarOrdemCelula(raw: string): string {
  return raw.replace(/\*\*/g, '').trim()
}

interface LinhaPassoEtapa {
  ordem: string
  detalhe: string
  acao?: string
  aprovadoQuando?: string
}

/** Faixa `95–96` ou `95-96` vira passos individuais no modal Admin. */
function expandirOrdensPasso(ordem: string): string[] {
  const norm = ordem.replace(/\*\*/g, '').trim()
  const faixa = norm.match(/^(\d+(?:\.\d+)?)\s*[–—-]\s*(\d+(?:\.\d+)?)$/)
  if (faixa) {
    const inicio = Number(faixa[1])
    const fim = Number(faixa[2])
    if (
      Number.isInteger(inicio)
      && Number.isInteger(fim)
      && fim >= inicio
      && fim - inicio <= 24
    ) {
      return Array.from({ length: fim - inicio + 1 }, (_, i) => String(inicio + i))
    }
  }
  return [norm]
}

/** Linha numerada `1. …` ou linha de tabela `| **06** | Ação | Critério |`. */
function extrairLinhasPassoEtapa(bloco: string): LinhaPassoEtapa[] {
  const itens: LinhaPassoEtapa[] = []

  for (const raw of bloco.split('\n')) {
    const line = raw.trim()
    if (!line) continue

    const lista = line.match(/^(\d+)\.\s+(.+)$/)
    if (lista) {
      itens.push({ ordem: lista[1], detalhe: lista[2].trim() })
      continue
    }

    if (!line.startsWith('|') || linhaEhSeparadorTabela(line)) continue

    const cols = line.split('|').map(c => c.trim()).filter((_, i, arr) => i > 0 && i < arr.length - 1)
    if (cols.length < 2) continue

    const colPasso = normalizarOrdemCelula(cols[0])
    if (!colPasso || colPasso === 'Passo' || colPasso === '#' || colPasso === 'Sub-etapa') continue
    if (colPasso.toLowerCase() === 'ação' || colPasso.toLowerCase() === 'acao') continue

    const acao = cols.length >= 2 ? cols[1].trim() : undefined
    const aprovadoQuando = cols.length >= 3 ? cols[2].trim() : undefined
    const detalhe = acao && aprovadoQuando
      ? `${acao} — ${aprovadoQuando}`
      : acao ?? aprovadoQuando ?? ''

    for (const ordem of expandirOrdensPasso(colPasso === '—' ? '—' : colPasso)) {
      itens.push({ ordem, detalhe, acao, aprovadoQuando })
    }
  }

  return itens
}

/** Tabela em `## Prints planejados` — faixas (`03–05`), negrito (`**25**`) e linhas de continuação. */
function extrairLinhasPrintsPlanejados(bloco: string): Array<{ ordem: string; titulo: string; detalhe: string }> {
  const itens: Array<{ ordem: string; titulo: string; detalhe: string }> = []
  let ultimaOrdem = ''
  let subIdx = 0

  for (const raw of bloco.split('\n')) {
    const line = raw.trim()
    if (!line.startsWith('|') || linhaEhSeparadorTabela(line)) continue

    const cols = line.split('|').map(c => c.trim()).filter((_, i, arr) => i > 0 && i < arr.length - 1)
    if (cols.length < 2) continue

    const colNum = normalizarOrdemCelula(cols[0])
    const colArquivo = (cols[1] ?? '').replace(/`/g, '').trim()
    const colDesc = (cols[2] ?? cols[1] ?? '').trim()

    if (colNum === '#' || colArquivo === 'Arquivo' || colDesc === 'Estado capturado') continue
    if (!colNum && !colArquivo && !colDesc) continue

    let ordem: string
    if (colNum) {
      ultimaOrdem = colNum
      subIdx = 0
      ordem = colNum
    } else if (ultimaOrdem) {
      subIdx += 1
      ordem = `${ultimaOrdem}.${String(subIdx).padStart(2, '0')}`
    } else {
      continue
    }

    const titulo = colArquivo || colDesc
    const detalhe = colArquivo && colDesc && colArquivo !== colDesc ? colDesc : titulo

    itens.push({ ordem, titulo, detalhe })
  }

  return itens
}

/**
 * Objetivo do plano para o modal Admin: parágrafo `**Objetivo geral:** …` ou,
 * como fallback em planos legados, o primeiro parágrafo de `## Escopo`.
 */
export function extrairObjetivoDoPlano(conteudo: string): string | null {
  const objetivo = conteudo.match(/\*\*Objetivo geral:\*\*\s*([\s\S]*?)(?=\n\s*\n|$)/)
  if (objetivo) {
    return objetivo[1].replace(/\s+/g, ' ').replace(/\*\*/g, '').trim() || null
  }

  const escopo = conteudo.match(/## (?:Escopo|Resumo Executivo|Objetivo)[^\n]*\n+([\s\S]*?)(?=\n\s*\n|\n#|$)/)
  if (escopo) {
    return escopo[1].replace(/\s+/g, ' ').replace(/\*\*/g, '').trim() || null
  }

  // Planos EMT legados: linha `> **Escopo:** …` no cabeçalho.
  const escopoInline = conteudo.match(/\*\*Escopo:\*\*\s*([^\n]+)/)
  if (escopoInline) {
    return escopoInline[1].replace(/\*\*/g, '').replace(/^>\s*/, '').trim() || null
  }

  return null
}

/** Check-list `- [x] **U01** — descrição` (planos legados UNI/FUN/CRO/E2E). */
function extrairLinhasChecklist(bloco: string): LinhaPassoEtapa[] {
  const itens: LinhaPassoEtapa[] = []
  const re = /^[-*]\s*\[[ xX]\]\s*(?:\*\*([^*]+)\*\*\s*[—–:-]?\s*)?(.+)$/

  for (const raw of bloco.split('\n')) {
    const m = raw.trim().match(re)
    if (!m) continue
    const ordem = (m[1] ?? String(itens.length + 1)).trim()
    const detalhe = m[2].trim()

    // `ação → resultado esperado` vira Ação / APROVADO quando no modal.
    const sep = detalhe.match(/\s*(?:→|->)\s*/)
    const seta = sep?.index ?? -1
    if (sep && seta > 0) {
      itens.push({
        ordem,
        detalhe,
        acao: detalhe.slice(0, seta).trim(),
        aprovadoQuando: detalhe.slice(seta + sep[0].length).trim(),
      })
    } else {
      itens.push({ ordem, detalhe })
    }
  }

  return itens
}

/** Primeira célula que parece código de caso (`U-ZOD-01`, `**06**`, `F03`) — filtra cabeçalhos e tabelas informativas. */
function pareceOrdemCaso(ordem: string): boolean {
  const limpo = ordem.replace(/[`*]/g, '').trim()
  return limpo.length > 0 && limpo.length <= 24 && /\d/.test(limpo)
}

export function extrairCasosDoPlano(conteudo: string, planoFile: string): CasoPlanoTeste[] {
  if (planoFile.endsWith('.json')) {
    try {
      const plan = JSON.parse(conteudo) as { passos?: PassoJson[] }
      return (plan.passos ?? []).map(p => ({
        ordem: String(p.numero ?? p.id ?? ''),
        titulo: p.id ?? `Passo ${p.numero ?? ''}`,
        detalhe: [p.acao, p.preCondicao ? `Pré-condição: ${p.preCondicao}` : null]
          .filter((x): x is string => Boolean(x))
          .join(' · '),
        secao: 'Passos E2E',
      }))
    } catch {
      return []
    }
  }

  const casos: CasoPlanoTeste[] = []

  // Roteiro primeiro — passo a passo é o foco do modal «O que será testado».
  const etapasRe = /### (ETAPA \d+[^\n]*)\n([\s\S]*?)(?=### ETAPA|\n## [A-Za-z]|$)/g
  let etapaMatch: RegExpExecArray | null
  while ((etapaMatch = etapasRe.exec(conteudo)) !== null) {
    const secao = etapaMatch[1].trim()
    for (const linha of extrairLinhasPassoEtapa(etapaMatch[2])) {
      casos.push({
        ordem: linha.ordem,
        titulo: secao,
        detalhe: linha.detalhe,
        acao: linha.acao,
        aprovadoQuando: linha.aprovadoQuando,
        secao: 'Roteiro',
      })
    }
  }

  // Blocos `## Roteiro — …` legados (sem `### ETAPA` no mesmo bloco).
  const roteiroRe = /## Roteiro[^\n]*\n([\s\S]*?)(?=\n---\s*(?:\n|\r)|\n## [A-Za-z]|$)/gi
  let roteiroMatch: RegExpExecArray | null
  while ((roteiroMatch = roteiroRe.exec(conteudo)) !== null) {
    if (/### ETAPA \d+/i.test(roteiroMatch[1])) continue
    const tituloBloco = roteiroMatch[0].split('\n')[0].replace(/^##\s*/, '').trim()
    for (const linha of extrairLinhasPassoEtapa(roteiroMatch[1])) {
      casos.push({
        ordem: linha.ordem,
        titulo: tituloBloco,
        detalhe: linha.detalhe,
        acao: linha.acao,
        aprovadoQuando: linha.aprovadoQuando,
        secao: 'Roteiro',
      })
    }
  }

  // Termina em HR (`---` sozinho), não em separador de tabela `|---|`.
  const secaoPrints = conteudo.match(
    /## Prints planejados([\s\S]*?)(?=\n---\s*(?:\n|\r)|\n## [A-Za-z]|$)/i,
  )
  if (secaoPrints) {
    for (const linha of extrairLinhasPrintsPlanejados(secaoPrints[1])) {
      casos.push({
        ordem: linha.ordem,
        titulo: linha.titulo,
        detalhe: linha.detalhe,
        secao: 'Prints planejados',
      })
    }
  }

  const fluxoRe = /### (FLUXO \d+[^\n]*)\n([\s\S]*?)(?=### FLUXO|\n## [A-Za-z]|$)/g
  let fluxoMatch: RegExpExecArray | null
  while ((fluxoMatch = fluxoRe.exec(conteudo)) !== null) {
    const secao = fluxoMatch[1].trim()
    const bloco = fluxoMatch[2]
    let encontrouPasso = false

    for (const line of bloco.split('\n')) {
      const pm = line.match(/^\|\s*([\d.]+)\s*\|\s*`?([^`|]+)`?\s*\|\s*(.+?)\s*\|\s*(.+?)\s*\|/)
      if (pm && pm[1] !== 'Passo' && !pm[1].includes('---')) {
        encontrouPasso = true
        casos.push({
          ordem: pm[1],
          titulo: pm[2].trim(),
          detalhe: `${pm[3].trim()} — ${pm[4].trim()}`,
          secao,
        })
      }
    }

    if (!encontrouPasso) {
      const casosCount = bloco.match(/\*\*Casos:\*\*\s*(\d+)/)
      if (casosCount) {
        casos.push({
          ordem: secao.replace(/^FLUXO\s+/i, ''),
          titulo: secao,
          detalhe: `${casosCount[1]} casos neste fluxo (ver plano completo)`,
          secao: 'Fluxos',
        })
      }
    }
  }

  // Fallback genérico — planos legados sem ETAPA/Roteiro/FLUXO: check-lists
  // (`- [x] **U01** — …`) e tabelas de casos (`| U-ZOD-01 | Caso | Resultado |`)
  // agrupados pelo título `##`/`###` mais próximo.
  if (casos.length === 0) {
    const blocoRe = /(^|\n)#{2,3}\s+([^\n]+)\n([\s\S]*?)(?=\n#{2,3}\s|$)/g
    let blocoMatch: RegExpExecArray | null
    while ((blocoMatch = blocoRe.exec(conteudo)) !== null) {
      const heading = blocoMatch[2].replace(/[#*`]/g, '').trim()
      const relevante = /^\d+[.)]?\s/.test(heading)
        || /caso|check|cen[aá]rio|valida|fluxo|snapshot/i.test(heading)
      if (!relevante) continue

      const linhas = [
        ...extrairLinhasPassoEtapa(blocoMatch[3]),
        ...extrairLinhasChecklist(blocoMatch[3]),
      ]
      for (const linha of linhas) {
        if (!linha.detalhe || !pareceOrdemCaso(linha.ordem)) continue
        casos.push({
          ordem: linha.ordem,
          titulo: heading,
          detalhe: linha.detalhe,
          acao: linha.acao,
          aprovadoQuando: linha.aprovadoQuando,
          secao: 'Roteiro',
        })
      }
    }
  }

  return casos
}
