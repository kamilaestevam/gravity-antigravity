/**
 * Parser do log EMT — SSOT para banner, % da coluna Resultado e tabelas do painel expandido.
 */

export type ResultadoEmtRun = 'APROVADO' | 'REPROVADO' | 'ERRO_CATASTROFICO' | 'ERRO'

export type LinhaEmtTabela = {
  ambiente: string
  produto: string
  local: string
  sublocal: string
  acao: string
  resultado: string
}

export type ClassificacaoEmtLog = {
  aprovadas: string[]
  reprovadas: string[]
  tabelaAprovadas: LinhaEmtTabela[]
  tabelaReprovadas: LinhaEmtTabela[]
}

export type EstadoEmtUi = {
  total: number
  aprovados: number
  reprovados: number
  /** Mesma regra para banner, coluna % e fallback de prints */
  aprovado: boolean
  classificacao: ClassificacaoEmtLog
  /** Exit ≠ 0 sem ✗/EMT_ROW reprovado no trecho parseado (ex.: log truncado) */
  falhaNaoDetalhada: boolean
}

const EMT_ROW_PREFIX = 'EMT_ROW|'

const MSG_FALHA_NAO_DETALHADA =
  'Falha no run (detalhe ausente no log exibido — possível truncamento ou exceção sem EMT_ROW)'

export function filtrarLinhasLogEmt(texto: string): string[] {
  return texto
    .split('\n')
    .map(l => l.trim())
    .filter(l => l.length > 0 && !l.startsWith('◇') && !l.startsWith('[dotenv'))
}

export function parseLinhaEmtTabela(texto: string): LinhaEmtTabela | null {
  const limpo = texto.trim()
  if (!limpo.includes(EMT_ROW_PREFIX)) return null
  const idx = limpo.indexOf(EMT_ROW_PREFIX)
  const payload = limpo.slice(idx + EMT_ROW_PREFIX.length)
  const partes = payload.split('|')
  if (partes.length < 6) return null
  const [ambiente, produto, local, sublocal, acao, resultado] = partes
  if (!ambiente || !produto || !local || !acao || !resultado) return null
  return { ambiente, produto, local, sublocal: sublocal || '—', acao, resultado }
}

function emtRowIndicaReprovado(tabela: LinhaEmtTabela): boolean {
  return /reprovado/i.test(tabela.resultado)
}

export function classificarLinhasLogEmt(linhas: string[]): ClassificacaoEmtLog {
  const aprovadas: string[] = []
  const tabelaAprovadas: LinhaEmtTabela[] = []
  const reprovadasVistas = new Set<string>()
  const reprovadas: string[] = []
  const tabelaReprovadas: LinhaEmtTabela[] = []
  let emSecaoFalhas = false

  const addReprovada = (texto: string) => {
    const limpo = texto.trim()
    if (!limpo || reprovadasVistas.has(limpo)) return
    reprovadasVistas.add(limpo)
    const tabela = parseLinhaEmtTabela(limpo)
    if (tabela) tabelaReprovadas.push(tabela)
    else reprovadas.push(limpo)
  }

  const addAprovada = (texto: string) => {
    const limpo = texto.trim()
    const tabela = parseLinhaEmtTabela(limpo)
    if (tabela) {
      if (emtRowIndicaReprovado(tabela)) tabelaReprovadas.push(tabela)
      else tabelaAprovadas.push(tabela)
      return
    }
    if (!limpo.startsWith('EMT_ROW|')) aprovadas.push(limpo)
  }

  for (const linha of linhas) {
    if (linha === 'Falhas:') {
      emSecaoFalhas = true
      continue
    }
    const matchFalhasN = linha.match(/^Falhas:\s*(\d+)$/)
    if (matchFalhasN) {
      emSecaoFalhas = Number(matchFalhasN[1]) > 0
      continue
    }

    if (linha.startsWith('✓') || (linha.includes('Resultado: PASSOU') && !linha.includes('FALHOU'))) {
      addAprovada(linha.replace(/^✓\s*/, ''))
      emSecaoFalhas = false
    } else if (linha.startsWith('✗')) {
      addReprovada(linha.replace(/^✗\s*/, ''))
      emSecaoFalhas = false
    } else if (emSecaoFalhas && (linha.startsWith('- ') || linha.startsWith('•'))) {
      addReprovada(linha.replace(/^[-•]\s*/, ''))
    } else if (
      linha.includes('Resultado: FALHOU')
      || linha.includes('Resultado final: FALHOU')
    ) {
      emSecaoFalhas = true
    }
  }

  return { aprovadas, reprovadas, tabelaAprovadas, tabelaReprovadas }
}

function runEmtReprovado(resultado: string): boolean {
  return resultado === 'REPROVADO' || resultado === 'ERRO_CATASTROFICO' || resultado === 'ERRO'
}

/**
 * Estado unificado do EMT para toda a UI Admin (banner, %, IA, prints).
 */
export function resolverEstadoEmtUi(item: {
  tipo: string
  successLog?: string | null
  erroLog?: string | null
  resultado: string
}): EstadoEmtUi | null {
  if (item.tipo !== 'EMT') return null

  const linhas = filtrarLinhasLogEmt(item.successLog ?? item.erroLog ?? '')
  const classificacao = classificarLinhasLogEmt(linhas)

  let aprovados = classificacao.tabelaAprovadas.length + classificacao.aprovadas.length
  let reprovados = classificacao.tabelaReprovadas.length + classificacao.reprovadas.length
  const runReprovado = runEmtReprovado(item.resultado)
  let falhaNaoDetalhada = false

  if (runReprovado && reprovados === 0) {
    falhaNaoDetalhada = true
    reprovados = 1
    classificacao.reprovadas.push(MSG_FALHA_NAO_DETALHADA)
  }

  const total = aprovados + reprovados
  if (total === 0) {
    if (item.resultado === 'APROVADO') {
      return {
        total: 1,
        aprovados: 1,
        reprovados: 0,
        aprovado: true,
        classificacao,
        falhaNaoDetalhada: false,
      }
    }
    return {
      total: 1,
      aprovados: 0,
      reprovados: 1,
      aprovado: false,
      classificacao: {
        ...classificacao,
        reprovadas: [...classificacao.reprovadas, MSG_FALHA_NAO_DETALHADA],
      },
      falhaNaoDetalhada: true,
    }
  }

  const aprovado = reprovados === 0 && item.resultado === 'APROVADO'

  return {
    total,
    aprovados,
    reprovados,
    aprovado,
    classificacao,
    falhaNaoDetalhada,
  }
}

export function contarPassosEmt(item: {
  tipo: string
  successLog?: string | null
  erroLog?: string | null
  resultado: string
}): { total: number; aprovados: number; reprovados: number } {
  const estado = resolverEstadoEmtUi(item)
  if (estado) {
    return { total: estado.total, aprovados: estado.aprovados, reprovados: estado.reprovados }
  }
  if (item.resultado === 'APROVADO') return { total: 1, aprovados: 1, reprovados: 0 }
  if (runEmtReprovado(item.resultado)) return { total: 1, aprovados: 0, reprovados: 1 }
  return { total: 1, aprovados: 1, reprovados: 0 }
}

export function calcularPercentuaisEmt(item: {
  tipo: string
  successLog?: string | null
  erroLog?: string | null
  resultado: string
}): { pctAprovado: number; pctReprovado: number } {
  const { total, aprovados, reprovados } = contarPassosEmt(item)
  if (total === 0) return { pctAprovado: 0, pctReprovado: 0 }
  return {
    pctAprovado: Math.round((aprovados / total) * 100),
    pctReprovado: Math.round((reprovados / total) * 100),
  }
}

/** Resultado efetivo para prints e bordas — alinhado ao banner. */
export function resultadoEfetivoEmt(item: {
  tipo: string
  successLog?: string | null
  erroLog?: string | null
  resultado: string
}): ResultadoEmtRun {
  const estado = resolverEstadoEmtUi(item)
  if (estado?.aprovado) return 'APROVADO'
  if (estado && !estado.aprovado) return 'REPROVADO'
  return item.resultado === 'APROVADO' ? 'APROVADO' : 'REPROVADO'
}
