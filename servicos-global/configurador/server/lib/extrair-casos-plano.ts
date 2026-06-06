export interface CasoPlanoTeste {
  ordem: string
  titulo: string
  detalhe: string
  secao?: string
}

interface PassoJson {
  numero?: number
  id?: string
  acao?: string
  preCondicao?: string
}

/** Linha numerada `1. …` ou linha de tabela `| **06** | Ação | Critério |`. */
function extrairLinhasPassoEtapa(bloco: string): Array<{ ordem: string; detalhe: string }> {
  const itens: Array<{ ordem: string; detalhe: string }> = []

  for (const raw of bloco.split('\n')) {
    const line = raw.trim()
    if (!line) continue

    const lista = line.match(/^(\d+)\.\s+(.+)$/)
    if (lista) {
      itens.push({ ordem: lista[1], detalhe: lista[2].trim() })
      continue
    }

    const tabela = line.match(/^\|\s*([^|]+?)\s*\|\s*(.+?)\s*\|\s*(.+?)\s*\|$/)
    if (!tabela) continue

    const colPasso = tabela[1].replace(/\*/g, '').trim()
    if (colPasso === 'Passo' || colPasso === '#' || colPasso.includes('---')) continue

    const passo = colPasso === '—' ? '—' : colPasso
    itens.push({
      ordem: passo,
      detalhe: `${tabela[2].trim()} — ${tabela[3].trim()}`,
    })
  }

  return itens
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
  const etapasRe = /### (ETAPA \d+[^\n]*)\n([\s\S]*?)(?=### ETAPA|\n## [A-Za-z]|\Z)/g
  let etapaMatch: RegExpExecArray | null
  while ((etapaMatch = etapasRe.exec(conteudo)) !== null) {
    const secao = etapaMatch[1].trim()
    for (const linha of extrairLinhasPassoEtapa(etapaMatch[2])) {
      casos.push({
        ordem: linha.ordem,
        titulo: secao,
        detalhe: linha.detalhe,
        secao: 'Roteiro',
      })
    }
  }

  // Termina em HR (`---` sozinho), não em separador de tabela `|---|`.
  const secaoPrints = conteudo.match(
    /## Prints planejados([\s\S]*?)(?=\n---\s*(?:\n|\r)|\n## [A-Za-z]|\Z)/i,
  )
  if (secaoPrints) {
    for (const line of secaoPrints[1].split('\n')) {
      const m = line.match(/^\|\s*(\d+)\s*\|\s*`?([^`|]+)`?\s*\|\s*(.+?)\s*\|/)
      if (m && m[1] !== '#') {
        casos.push({
          ordem: m[1].padStart(2, '0'),
          titulo: m[2].trim(),
          detalhe: m[3].trim(),
          secao: 'Prints planejados',
        })
      }
    }
  }

  const fluxoRe = /### (FLUXO \d+[^\n]*)\n([\s\S]*?)(?=### FLUXO|\n## [A-Za-z]|\Z)/g
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

  return casos
}
