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

/** Lista numerada (`1. …`) e linhas de tabela de passo (`| **06** | … |`) dentro de um bloco ETAPA. */
function extrairDetalhesBlocoEtapa(bloco: string): string[] {
  const detalhes: string[] = []

  for (const line of bloco.split('\n')) {
    const trimmed = line.trim()
    if (!trimmed) continue

    const lista = trimmed.match(/^\d+\.\s+(.+)/)
    if (lista) {
      detalhes.push(lista[1].trim())
      continue
    }

    const tabelaPasso = trimmed.match(/^\|\s*\*?\*?(\d+)\*?\*?\s*\|\s*(.+?)\s*\|\s*(.+?)\s*\|/)
    if (tabelaPasso && tabelaPasso[1] !== 'Passo' && !tabelaPasso[1].includes('---')) {
      detalhes.push(`${tabelaPasso[2].trim()} — ${tabelaPasso[3].trim()}`)
      continue
    }

    const tabelaImpl = trimmed.match(/^\|\s*[^|]*\(impl\.\)[^|]*\|\s*(.+?)\s*\|\s*(.+?)\s*\|/)
    if (tabelaImpl) {
      detalhes.push(`${tabelaImpl[1].trim()} — ${tabelaImpl[2].trim()}`)
    }
  }

  return detalhes
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

  const secaoPrints = conteudo.match(/## Prints planejados([\s\S]*?)(?=\n---|\n## [A-Za-z]|$)/)
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

  const etapasRe = /### (ETAPA[^\n]*)\n([\s\S]*?)(?=### ETAPA|\n## [A-Za-z]|$)/g
  let etapaMatch: RegExpExecArray | null
  let ordemRoteiro = 0
  while ((etapaMatch = etapasRe.exec(conteudo)) !== null) {
    const secao = etapaMatch[1].trim()
    for (const detalhe of extrairDetalhesBlocoEtapa(etapaMatch[2])) {
      ordemRoteiro += 1
      casos.push({
        ordem: String(ordemRoteiro),
        titulo: secao,
        detalhe,
        secao: 'Roteiro',
      })
    }
  }

  return casos
}
