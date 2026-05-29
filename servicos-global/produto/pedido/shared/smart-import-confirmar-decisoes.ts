/**
 * smart-import-confirmar-decisoes.ts — SSOT da matriz POST /confirmar
 *
 * Fonte de negócio: documentos-tecnicos/produtos-gravity/pedido/SMART-IMPORT-REGRAS-NEGOCIO.md
 * § "Pedidos Duplicados" e § "Agrupamento inteligente".
 *
 * Regra central por numero_pedido:
 *   pular        → ignora TODAS as linhas do pedido (PEDIDO + ITEM + legado flat)
 *   sobrescrever → substitui cabeçalho + APAGA itens antigos + recria itens da planilha
 *   criar        → bloqueia se pedido já existe (índice único org-wide)
 *   (ausente)    → importação incremental: adiciona itens ao pedido existente
 *
 * PKs do sistema (id_pedido, id_item) NUNCA vêm da planilha.
 */

export type DecisaoDuplicataImport = 'sobrescrever' | 'criar' | 'pular'

/** Campos proibidos no payload vindo do arquivo — sempre gerados pelo servidor. */
export const CAMPOS_PK_PROIBIDOS_PLANILHA = ['id_item', 'id_pedido'] as const

export type ErroConfirmarLinha = 'criar_duplicata' | 'pedido_existe_sem_decisao'

/**
 * Plano determinístico por linha — o service executa I/O; esta função só decide.
 * Testável sem mock de Prisma.
 */
export interface PlanoConfirmarLinha {
  pular: boolean
  erro?: ErroConfirmarLinha
  prepararSobrescrita: boolean
  /** Linha só atualiza cabeçalho (tipo PEDIDO ou legado sem part number) — não cria item. */
  somenteCabecalho: boolean
  criarItemEmPedidoExistente: boolean
  criarPedidoNovo: boolean
  contarComoAtualizado: boolean
}

export function obterDecisaoDuplicataImport(
  decisoes: Record<string, DecisaoDuplicataImport>,
  ...numeros: Array<string | null | undefined>
): DecisaoDuplicataImport | undefined {
  for (const numero of numeros) {
    if (numero && decisoes[numero]) return decisoes[numero]
  }
  return undefined
}

/** Master-detail ITEM ou formato legado flat (linha com part number / descrição). */
export function ehLinhaItemSmartImport(
  tipoLinha: string,
  dados: Record<string, unknown>,
): boolean {
  const tipo = tipoLinha.trim().toUpperCase()
  if (tipo === 'ITEM') return true
  if (tipo === 'PEDIDO') return false
  return Boolean(dados['part_number_item'] || dados['descricao_item'])
}

export function linhaTemDadosItem(dados: Record<string, unknown>): boolean {
  return Boolean(dados['part_number_item'] || dados['descricao_item'])
}

export function sanitizarDadosLinhaImport(dados: Record<string, unknown>): Record<string, unknown> {
  const limpo = { ...dados }
  for (const pk of CAMPOS_PK_PROIBIDOS_PLANILHA) {
    delete limpo[pk]
  }
  return limpo
}

export function planoConfirmarLinha(input: {
  decisaoDup: DecisaoDuplicataImport | undefined
  pedidoExiste: boolean
  ehLinhaItem: boolean
  temDadosItem: boolean
  sobrescritaJaPreparada: boolean
}): PlanoConfirmarLinha {
  const vazio: PlanoConfirmarLinha = {
    pular: false,
    prepararSobrescrita: false,
    somenteCabecalho: false,
    criarItemEmPedidoExistente: false,
    criarPedidoNovo: false,
    contarComoAtualizado: false,
  }

  const { decisaoDup, pedidoExiste, ehLinhaItem, temDadosItem, sobrescritaJaPreparada } = input

  if (decisaoDup === 'pular') {
    return { ...vazio, pular: true }
  }

  if (!pedidoExiste) {
    return { ...vazio, criarPedidoNovo: true }
  }

  if (decisaoDup === 'criar') {
    if (!ehLinhaItem) {
      return { ...vazio, erro: 'criar_duplicata' }
    }
    return { ...vazio, erro: 'pedido_existe_sem_decisao' }
  }

  if (decisaoDup === 'sobrescrever') {
    const precisaPrep = !sobrescritaJaPreparada
    if (ehLinhaItem && temDadosItem) {
      return {
        ...vazio,
        prepararSobrescrita: precisaPrep,
        criarItemEmPedidoExistente: true,
        contarComoAtualizado: true,
      }
    }
    return {
      ...vazio,
      prepararSobrescrita: precisaPrep,
      somenteCabecalho: true,
      contarComoAtualizado: true,
    }
  }

  // Importação incremental — pedido já existe, sem decisão de duplicata explícita
  if (ehLinhaItem && temDadosItem) {
    return {
      ...vazio,
      criarItemEmPedidoExistente: true,
      contarComoAtualizado: true,
    }
  }

  if (ehLinhaItem && !temDadosItem) {
    return { ...vazio, contarComoAtualizado: true }
  }

  return { ...vazio, erro: 'pedido_existe_sem_decisao' }
}
