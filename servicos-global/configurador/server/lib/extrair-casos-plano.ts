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

  const secaoPrints = conteudo.match(/## Prints planejados([\s\S]*?)(?=\n---|\n## [A-Za-z]|\Z)/)
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

  const etapasRe = /### (ETAPA \d+[^\n]*)\n([\s\S]*?)(?=### ETAPA|\n## [A-Za-z]|\Z)/g
  let etapaMatch: RegExpExecArray | null
  let ordemRoteiro = 0
  while ((etapaMatch = etapasRe.exec(conteudo)) !== null) {
    const secao = etapaMatch[1].trim()
    const linhas = etapaMatch[2].split('\n').filter(l => /^\d+\.\s/.test(l.trim()))
    for (const line of linhas) {
      ordemRoteiro += 1
      casos.push({
        ordem: String(ordemRoteiro),
        titulo: secao,
        detalhe: line.replace(/^\d+\.\s*/, '').trim(),
        secao: 'Roteiro',
      })
    }
  }

  return casos
}
