/**
 * smartImportService.ts — Servico de importacao inteligente de pedidos
 *
 * Orquestra:
 *   1. Parse do arquivo (importEngine)
 *   2. Mapeamento via mock-IA (aliases conhecidos + scores simulados)
 *   3. Inferencia pelos dados (NCM, incoterm, moeda, data)
 *   4. Agrupamento por numero_pedido
 *   5. Validacao linha a linha
 *   6. Criacao/atualizacao de pedidos ($transaction)
 */

import { parseArquivo, ALIASES_CAMPOS, calcularHashColunas, type LinhaArquivo } from './importEngine.js'
import { MapeamentoMemoriaService, type ColunaMapeadaBackend } from './mapeamentoMemoriaService.js'
import { AppError } from '../errors/AppError.js'
import {
  CAMPOS_PEDIDO_DDD_TODOS,
  type CampoPedidoDDD,
  normalizarNomeCampo,
  CAMPO_POR_ROTULO_NORMALIZADO,
  CAMPO_POR_NOME_INTERNO,
  CAMPO_POR_ALIAS_LEGADO,
} from '../../../shared/campos-pedido-ddd.js'
import {
  calcularScoreEssenciais,
  classificarPipelineImportacao,
  ehPlanilhaTemplateGravity,
  type PipelineImportacao,
} from '../../../shared/classificarImportacao.js'
import { recalcularAgregadosPedido } from '../../../../processos-core/src/services/recalcularAgregadosPedido.js'
import { parseNumeroBr, parseNumeroBrOpcional } from '../../../shared/formatadores.js'
import {
  aplicarParceirosResolvidosNoPedido,
  type ParceirosResolvidosPedido,
} from './smartImportParceirosService.js'
import type { NomesEmpresaItem } from '../../../shared/mapaPropagacaoPedidoItem.js'

export { parseNumeroBr, parseNumeroBrOpcional } from '../../../shared/formatadores.js'

/** Linha do arquivo onde o numero_pedido aparece pela 1a vez (ordem master-detail). */
export function calcularPrimeiraLinhaPorNumeroPedido(
  linhas: Array<{ linha_arquivo: number; numero_pedido?: string | null; dados?: Record<string, unknown> }>,
  numerosEditados: Record<number, string> = {},
): Map<string, number> {
  const map = new Map<string, number>()
  for (const linha of linhas) {
    const num =
      numerosEditados[linha.linha_arquivo]
      ?? (linha.dados?.['numero_pedido'] as string | undefined)
      ?? linha.numero_pedido
      ?? undefined
    if (!num) continue
    const atual = map.get(num)
    if (atual === undefined || linha.linha_arquivo < atual) {
      map.set(num, linha.linha_arquivo)
    }
  }
  return map
}

/**
 * data_emissao_pedido sintetica para a lista (sort padrao DESC).
 * Pedido que aparece antes na planilha recebe timestamp mais recente.
 */
export function dataEmissaoPorOrdemPlanilha(primeiraLinhaArquivo: number, anchorImportacaoMs: number): string {
  return new Date(anchorImportacaoMs - primeiraLinhaArquivo * 60_000).toISOString()
}

interface OpcoesOrdemPlanilhaImportacao {
  primeiraLinhaPlanilha: number
  anchorImportacaoMs: number
}

const CAMPOS_BLOQ_PARA_ITEM: ReadonlySet<string> = new Set([
  // NOTA: 'numero_pedido' NAO entra aqui — é o campo de vinculo que liga ITEM ao PEDIDO pai.
  // Apenas campos AGREGADOS de pedido sao bloqueados em linhas ITEM.
  'valor_total_pedido',
  'quantidade_total_pedido',
  'quantidade_volumes_pedido',
  'valor_total_cambio_pedido',
])
const CAMPOS_BLOQ_PARA_PEDIDO: ReadonlySet<string> = new Set([
  'sequencia_item_pedido',
  'part_number_item',
  'ncm_item',
  'descricao_item',
  'quantidade_inicial_item',
  'quantidade_atual_item',
  'quantidade_transferida_item',
  'quantidade_pronta_total_item',
  'quantidade_cancelada_item',
  'valor_por_unidade_item',
  'nome_exportador_item',
  'nome_importador_item',
  'nome_fabricante_item',
  'peso_liquido_unitario_item',
  'peso_bruto_unitario_item',
  'cubagem_unitaria_item',
  'data_embarque_item_pedido',
])

/**
 * Colunas Prisma que existem no schema PedidoItem mas NAO estao no SSOT
 * (campos-pedido-ddd.ts). Sao campos de "Edicao em Massa" e dados extras
 * que o mapper precisa reconhecer para nao cair no fuzzy match (Tier 4)
 * e mapear incorretamente para outro campo.
 *
 * Chave = nome normalizado da coluna (lowercase, sem acentos, sem "* ")
 * Valor = nome exato da coluna Prisma
 */
const CAMPOS_PRISMA_EXTRAS_MAPEAMENTO = new Map<string, string>([
  // Chave = forma NORMALIZADA (underscores viram espaços, lowercase, sem acentos)
  // Valor = nome exato da coluna Prisma
  ['descricao completa item pt', 'descricao_completa_item_pt'],
  ['descricao completa item en', 'descricao_completa_item_en'],
  ['descricao completa item es', 'descricao_completa_item_es'],
  ['descricao completa item nf', 'descricao_completa_item_nf'],
  ['texto posicao ncm', 'texto_posicao_ncm'],
  ['grupo item', 'grupo_item'],
  ['subgrupo item', 'subgrupo_item'],
  ['campo especial item', 'campo_especial_item'],
  ['atributos catalogo', 'atributos_catalogo'],
  ['tipo embalagem', 'tipo_embalagem'],
  ['numero lpco', 'numero_lpco'],
  ['numero certificado origem', 'numero_certificado_origem'],
  ['data certificado origem', 'data_certificado_origem'],
  ['data embarque item', 'data_embarque_item'],
])

/** Prisma encerrou a transação (timeout P2024, desconexão, etc.). */
export function transacaoPrismaExpiradaOuEncerrada(err: unknown): boolean {
  if (!(err instanceof Error)) return false
  const msg = err.message
  return (
    msg.includes('Transaction not found')
    || msg.includes('Transaction API error')
    || msg.includes('Transaction already closed')
    || msg.includes('P2024')
    || /transaction.*timed?\s*out/i.test(msg)
  )
}

const MSG_IMPORT_TX_TIMEOUT =
  'A importacao demorou mais que o limite do servidor e foi interrompida. Divida a planilha em lotes menores e tente novamente.'

function lancarSeTransacaoEncerrada(err: unknown): void {
  if (transacaoPrismaExpiradaOuEncerrada(err)) {
    throw new AppError(MSG_IMPORT_TX_TIMEOUT, 408, 'HTTP_408')
  }
}

async function executarSavepointSql(db: unknown, sql: string): Promise<void> {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (db as any).$executeRawUnsafe(sql)
  } catch (err) {
    lancarSeTransacaoEncerrada(err)
    throw err
  }
}

function traduzirErroPrisma(err: unknown): string {
  if (!(err instanceof Error)) return 'Erro desconhecido ao processar linha'
  const msg = err.message
  if (transacaoPrismaExpiradaOuEncerrada(err)) {
    return MSG_IMPORT_TX_TIMEOUT
  }
  // Prisma P2002 — unique constraint
  if (msg.includes('Unique constraint failed')) {
    const camposMatch = msg.match(/fields:\s*\(([^)]+)\)/)
    const campos = camposMatch ? camposMatch[1].replace(/`/g, '').trim() : ''
    if (campos.includes('numero_pedido')) {
      return 'Já existe um pedido com este número. Use a opção "Sobrescrever" na tela anterior para atualizar.'
    }
    return `Registro duplicado nos campos: ${campos || 'desconhecidos'}. Verifique os dados na planilha e tente novamente.`
  }
  // Prisma P2003 — FK constraint
  if (msg.includes('Foreign key constraint failed')) {
    return 'Referência inválida — verifique se os dados relacionados (status, moeda, etc.) existem no sistema.'
  }
  // Prisma P2025 — record not found
  if (msg.includes('Record to update not found') || msg.includes('not found')) {
    return 'Registro não encontrado para atualização. Ele pode ter sido removido.'
  }
  // NOT NULL violation
  if (msg.includes('must not be null') || msg.includes('NOT NULL')) {
    const campoMatch = msg.match(/column\s+"?([^"]+)"?/)
    return `Campo obrigatório ausente: ${campoMatch?.[1] ?? 'verifique a planilha'}.`
  }
  // Genérico — extrair linha útil do Prisma (evita mostrar só "Invalid invocation")
  const linhas = msg.split('\n').map(l => l.trim()).filter(Boolean)
  const linhaUtil = linhas.find(l =>
    l.startsWith('Argument ')
    || l.startsWith('Unknown argument')
    || l.includes('Error converting field')
    || l.includes('Invalid value')
    || l.includes('Provided ')
  )
  if (linhaUtil) {
    return linhaUtil.length > 220 ? `${linhaUtil.slice(0, 220)}...` : linhaUtil
  }
  if (linhas[0]?.includes('Invalid `prisma') && linhas.length > 1) {
    const detalhe = linhas.slice(1).join(' — ')
    return detalhe.length > 220 ? `${detalhe.slice(0, 220)}...` : detalhe
  }
  const primeira = linhas[0] ?? 'Erro ao gravar no banco'
  return primeira.length > 200 ? `${primeira.slice(0, 200)}...` : primeira
}

function gerarId(prefixo: string): string {
  const seq = String(Math.floor(Math.random() * 9999999)).padStart(7, '0')
  const ano = String(new Date().getFullYear()).slice(-2)
  return `${prefixo}_id_${seq}/${ano}`
}

// Converte strings de data (YYYY-MM-DD, DD/MM/YYYY, etc.) para ISO-8601 DateTime.
// Retorna null quando o valor nao foi preenchido — campo nullable no schema.
function normalizarData(valor: unknown): string | null {
  if (!valor) return null
  const str = String(valor).trim()
  if (!str) return null
  // Já é ISO completo
  if (/^\d{4}-\d{2}-\d{2}T/.test(str)) return str
  // YYYY-MM-DD → adiciona T00:00:00.000Z
  if (/^\d{4}-\d{2}-\d{2}$/.test(str)) return `${str}T00:00:00.000Z`
  // DD/MM/YYYY
  const dmyMatch = str.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/)
  if (dmyMatch) return `${dmyMatch[3]}-${dmyMatch[2].padStart(2, '0')}-${dmyMatch[1].padStart(2, '0')}T00:00:00.000Z`
  // Excel serial number (dias desde 1899-12-30). Valido se numerico e no range
  // plausivel de datas (1 = 1900-01-01, ~55000 = 2050). O .125/.5/.75 são frações de dia (hora).
  const num = Number(str)
  if (!isNaN(num) && num > 1 && num < 60000) {
    // Offset do Excel para Unix: 25569 dias entre 1899-12-30 e 1970-01-01
    const ms = Math.round((num - 25569) * 86400 * 1000)
    const d = new Date(ms)
    if (!isNaN(d.getTime())) return d.toISOString()
  }
  // Tentar parse genérico
  const parsed = new Date(str)
  return isNaN(parsed.getTime()) ? null : parsed.toISOString()
}

// Normaliza valor NCM para formato padrao XXXX.XX.XX (Siscomex).
// Aceita 8 digitos puros, com pontos, espacos ou tracos. Retorna string vazia
// se o valor nao for um NCM valido de 8 digitos.
export function formatarNcm(valor: unknown): string {
  if (!valor) return ''
  const soDigitos = String(valor).replace(/[^\d]/g, '')
  if (soDigitos.length !== 8) return String(valor)
  return `${soDigitos.slice(0, 4)}.${soDigitos.slice(4, 6)}.${soDigitos.slice(6, 8)}`
}

// Extrai codigo de valor no formato "CODIGO — Nome" (dropdown do template v3.7+).
// Se o valor nao contem " — ", retorna a string original (compativel com planilhas
// antigas que usam apenas o codigo).
export function extrairCodigoDropdown(valor: unknown): string {
  if (!valor) return ''
  const s = String(valor).trim()
  const idx = s.indexOf(' — ')
  return idx > 0 ? s.slice(0, idx) : s
}

// ── Tipos locais (espelham os tipos do client) ────────────────────────────────

export interface SmartImportAlerta {
  campo: string
  tipo: 'obrigatorio_ausente' | 'formato_invalido' | 'valor_negativo' | 'duplicado_sistema' | 'duplicado_arquivo'
  mensagem: string
  nivel: 'aviso' | 'erro'
}

export interface SmartImportLinha {
  linha_arquivo: number
  numero_pedido: string | null
  status: 'ok' | 'aviso' | 'erro'
  alertas: SmartImportAlerta[]
  dados: Record<string, unknown>
}

/** P2.4 — Conflito quando 2+ colunas do arquivo mapeiam para o mesmo campo do sistema. */
export interface ConflitoMapeamento {
  campo_sistema: string
  colunas_arquivo: string[]
}

export interface SmartImportPreview {
  total_linhas: number
  total_pedidos: number
  total_itens: number
  mapeamento: ColunaMapeadaBackend[]
  confianca_global: number
  memoria_aplicada: boolean
  preview_id: string
  linhas: SmartImportLinha[]
  limite_excedido: boolean
  extrator_usado: string
  dados_brutos: Array<{ linha: number; valores: Record<string, string> }>
  /** P2.4 — Lista de conflitos onde 2+ colunas apontam para o mesmo campo_sistema. */
  conflitos_mapeamento: ConflitoMapeamento[]
  /** Roteador de pipeline — deterministico evita Gemini. */
  pipeline_importacao?: PipelineImportacao
  /** Proporcao (0–1) de campos essenciais mapeados. */
  score_essenciais?: number
  /** Planilha oficial Gravity detectada (super-header + colunas template). */
  template_detectado?: boolean
}

export interface SmartImportConfirmar {
  preview_id: string
  mapeamento_confirmado: ColunaMapeadaBackend[]
  decisoes_duplicatas: Record<string, 'sobrescrever' | 'criar' | 'pular'>
  linhas_incluidas: number[]
  salvar_mapeamento: boolean
  numeros_editados?: Record<number, string>
  // linhas vindas do client: alertas tipados como unknown[] para compatibilidade com o Zod schema
  linhas?: Array<Omit<SmartImportLinha, 'alertas'> & { alertas: unknown[] }>
}

export interface SmartImportResultado {
  criados: number
  atualizados: number
  pulados: number
  erros: { linha: number; motivo: string }[]
  ids_criados: string[]
}

// FEAT.4 — Limite de linhas recomendado
const LIMITE_LINHAS_AVISO = 1000

// Cache simples em memoria para previews (TTL 30min)
const previewCache = new Map<string, { data: SmartImportLinha[]; ts: number; mapeamento: ColunaMapeadaBackend[] }>()
const PREVIEW_TTL_MS = 30 * 60 * 1000

// ── Service ───────────────────────────────────────────────────────────────────

export function criarSmartImportService(prismaClient: Record<string, unknown>): SmartImportService {
  return new SmartImportService(prismaClient)
}

/** Preenche nomes de parceiro do pedido no item sem sobrescrever valor já vindo da linha. */
function mesclarNomesItemParceiros(
  itemData: Record<string, unknown>,
  nomesItem: NomesEmpresaItem | undefined,
): Record<string, unknown> {
  if (!nomesItem) return itemData
  const out = { ...itemData }
  if (nomesItem.nome_exportador_item && !out.nome_exportador_item) {
    out.nome_exportador_item = nomesItem.nome_exportador_item
  }
  if (nomesItem.nome_importador_item && !out.nome_importador_item) {
    out.nome_importador_item = nomesItem.nome_importador_item
  }
  if (nomesItem.nome_fabricante_item && !out.nome_fabricante_item) {
    out.nome_fabricante_item = nomesItem.nome_fabricante_item
  }
  return out
}

function aplicarFksParceirosNoPedido(
  dadosPedido: Record<string, unknown>,
  parceiros: ParceirosResolvidosPedido | undefined,
): void {
  if (!parceiros) return
  if (parceiros.tipo_operacao === 'importacao' && parceiros.suid_exportador) {
    dadosPedido.id_importacao_exportador_pedido = parceiros.suid_exportador
  }
  if (parceiros.tipo_operacao === 'exportacao' && parceiros.suid_importador) {
    dadosPedido.id_exportacao_importador_pedido = parceiros.suid_importador
  }
  if (parceiros.suid_fabricante) {
    dadosPedido.id_fabricante_pedido = parceiros.suid_fabricante
  }
}

/** Monta linhas filtradas do payload de confirmar (cache ou stateless). */
export function prepararLinhasFiltradasConfirmacao(
  tenantId: string,
  payload: SmartImportConfirmar,
): SmartImportLinha[] {
  if (!payload.preview_id.startsWith(tenantId + '-')) {
    throw new AppError('Preview nao pertence a este tenant', 403, 'UNAUTHORIZED_PREVIEW')
  }
  const cached = previewCache.get(payload.preview_id)
  const linhasParaUsar: SmartImportLinha[] = cached
    ? cached.data
    : (payload.linhas ?? []).length > 0
      ? payload.linhas as unknown as SmartImportLinha[]
      : payload.linhas_incluidas.map((n) => ({
          linha_arquivo: n,
          numero_pedido: null,
          status: 'ok' as const,
          alertas: [],
          dados: {},
        }))
  return linhasParaUsar.filter((l) => payload.linhas_incluidas.includes(l.linha_arquivo))
}

// Defaults alinhados com PedidoCasasDecimais (schema Prisma)
const CASAS_DECIMAIS_PADRAO = {
  valor:      2,
  quantidade: 2,
  peso:       3,
  cubagem:    3,
}

export class SmartImportService {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private db: Record<string, any>
  private memoriaService: MapeamentoMemoriaService

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  constructor(prismaClient: Record<string, any>) {
    this.db = prismaClient
    this.memoriaService = new MapeamentoMemoriaService(prismaClient)
  }

  // Lê a config de casas decimais do workspace; usa defaults se ainda não configurado
  private async lerCasasDecimais(tenantId: string): Promise<typeof CASAS_DECIMAIS_PADRAO> {
    try {
      const cfg = await this.db['pedidoCasasDecimais'].findUnique({
        where: { id_organizacao: tenantId },
      })
      if (!cfg) return CASAS_DECIMAIS_PADRAO
      return {
        valor:      cfg.valor_total_pedido      ?? CASAS_DECIMAIS_PADRAO.valor,
        quantidade: cfg.quantidade_total_pedido ?? CASAS_DECIMAIS_PADRAO.quantidade,
        peso:       cfg.peso_liquido_total_pedido ?? CASAS_DECIMAIS_PADRAO.peso,
        cubagem:    cfg.cubagem_total_pedido     ?? CASAS_DECIMAIS_PADRAO.cubagem,
      }
    } catch {
      return CASAS_DECIMAIS_PADRAO
    }
  }

  async analisar(tenantId: string, buffer: Buffer, nomeArquivo: string, nomePlanilha?: string): Promise<SmartImportPreview> {
    // 1. Parse do arquivo
    const { linhas: linhasBrutas, extrator_usado, linhas_cabecalho } = await parseArquivo(buffer, nomeArquivo, nomePlanilha)
    if (linhasBrutas.length === 0) {
      throw new AppError(
        'A planilha nao tem nenhuma linha de dados.',
        400,
        'ARQUIVO_SEM_DADOS',
      )
    }

    // 2. Extrair cabecalhos
    const cabecalhos = Object.keys(linhasBrutas[0])
    const hashColunas = calcularHashColunas(cabecalhos)

    // 3. Tentar mapeamento por memoria
    let mapeamento: ColunaMapeadaBackend[]
    let memoriaAplicada = false

    // Amostra para valor_exemplo_coluna_pedido (usada tanto na memória quanto no mapearComIA)
    const amostra = linhasBrutas.slice(0, 10)
    const exemplosPorColuna: Record<string, string> = {}
    for (const cab of cabecalhos) {
      const val = amostra.map(r => r[cab]).find(v => v !== undefined && v !== null && String(v).trim() !== '')
      if (val) exemplosPorColuna[cab] = String(val).slice(0, 80)
    }

    const mapeamentoSalvo = await this.memoriaService.buscar(tenantId, hashColunas)
    if (mapeamentoSalvo) {
      mapeamento = mapeamentoSalvo.map(m => ({
        ...m,
        inferido_por: 'memoria' as const,
        valor_exemplo_coluna_pedido: exemplosPorColuna[m.coluna_arquivo] ?? null,
      }))
      memoriaAplicada = true
    } else {
      // 4. Mapeamento mock-IA (aliases conhecidos + scores)
      mapeamento = this.mapearComIA(cabecalhos, amostra)
      // Refinar com inferencia pelos dados
      mapeamento = mapeamento.map(m => {
        if (m.campo_sistema || m.confianca >= 80) return m
        const valores = linhasBrutas.slice(0, 20).map(r => r[m.coluna_arquivo] ?? '')
        const inferido = this.inferirPorDados(m.coluna_arquivo, valores)
        if (inferido) {
          return {
            ...m,
            campo_sistema: inferido.campo,
            confianca:     Math.max(m.confianca, inferido.confianca),
            nivel:         inferido.confianca >= 90 ? 'auto' as const : 'confirmado' as const,
            inferido_por:  'dados' as const,
          }
        }
        return m
      })
    }

    // 5. Aplicar mapeamento nas linhas
    // linhas_cabecalho = 1 (normal) ou 2 (super-header do template DDD)
    // Primeira linha de dados = linhas_cabecalho + 1 (1-indexed no Excel)
    const linhasMapeadasBruto = linhasBrutas.map((linha, i) =>
      this.aplicarMapeamento(linha, mapeamento, i + linhas_cabecalho + 1)
    )

    // 5.5. Heranca posicional: ITEM com numero_pedido vazio herda do PEDIDO acima
    const linhasComHeranca = this.herdarNumeroPedidoParaItens(linhasMapeadasBruto)

    // 5.6. Filtrar linhas ITEM vazias: apenas tipo_linha preenchido, sem dados reais
    // (artefato de dropdowns de validacao no template — nao sao dados reais)
    const CAMPOS_ESTRUTURAIS = new Set(['tipo_linha', 'numero_pedido'])
    const linhasMapeadas = linhasComHeranca.filter(l => {
      const tipo = String(l.dados['tipo_linha'] ?? '').trim().toUpperCase()
      if (tipo !== 'ITEM') return true // PEDIDO e formato legado — manter sempre
      const temDadoReal = Object.entries(l.dados).some(([k, v]) =>
        !CAMPOS_ESTRUTURAIS.has(k) && v !== undefined && v !== null && String(v).trim() !== ''
      )
      return temDadoReal
    })

    // 6. Agrupar por numero_pedido para contagem (P4.4 — corrigido)
    //
    // Antes: total_pedidos = numero_pedido distintos; total_itens = linhasBrutas.length
    // Bug exposto pelo teste manual de 11/05/2026: 1 linha PEDIDO sem
    // numero_pedido mapeado dava "0 pedido(s) — 1 item(ns)". Agora respeita
    // a coluna tipo_linha quando ela existe (template DDD novo).
    const temTipoLinha = linhasMapeadas.some(l => l.dados['tipo_linha'] !== undefined)
    const pedidosUnicos = new Set(
      linhasMapeadas.map(l => l.numero_pedido).filter(Boolean) as string[]
    )
    // Quando o arquivo tem tipo_linha, conta linhas PEDIDO e ITEM corretamente.
    // Quando nao tem (formato legado flat), trata cada linha como 1 item e
    // usa pedidosUnicos como antes (numero_pedido distintos).
    const totalPedidosCalc = temTipoLinha
      ? linhasMapeadas.filter(l => String(l.dados['tipo_linha'] ?? '').trim().toUpperCase() === 'PEDIDO').length
      : pedidosUnicos.size
    const totalItensCalc = temTipoLinha
      ? linhasMapeadas.filter(l => String(l.dados['tipo_linha'] ?? '').trim().toUpperCase() === 'ITEM').length
      : linhasBrutas.length

    // 7. Verificar duplicatas no banco
    const numerosArquivo = Array.from(pedidosUnicos).filter(Boolean) as string[]
    const duplicatasNoSistema = await this.buscarDuplicatasNoSistema(tenantId, numerosArquivo)

    // 8. Marcar duplicatas nas linhas
    const linhasComDuplicatas = linhasMapeadas.map(l => {
      if (l.numero_pedido && duplicatasNoSistema.has(l.numero_pedido)) {
        const alerta: SmartImportAlerta = {
          campo: 'numero_pedido',
          tipo: 'duplicado_sistema',
          mensagem: `Pedido ${l.numero_pedido} ja existe no sistema`,
          nivel: 'aviso',
        }
        return {
          ...l,
          status: 'aviso' as const,
          alertas: [...l.alertas, alerta],
        }
      }
      return l
    })

    // FEAT.4 — Alertar se exceder limite recomendado
    if (linhasComDuplicatas.length > LIMITE_LINHAS_AVISO) {
      console.warn(`[SmartImport] tenant=${tenantId} arquivo com ${linhasComDuplicatas.length} linhas (limite recomendado: ${LIMITE_LINHAS_AVISO})`)
    }

    // 8.5. Validacao de coerencia cross-linha (master-detail) — P1.2
    const linhasComCoerencia = this.validarCoerenciaMasterDetail(linhasComDuplicatas)

    // 9. Salvar preview no cache
    const previewId = `${tenantId}-${hashColunas}-${Date.now()}`
    previewCache.set(previewId, {
      data: linhasComCoerencia,
      mapeamento,
      ts: Date.now(),
    })
    // Limpar entradas expiradas
    for (const [k, v] of previewCache.entries()) {
      if (Date.now() - v.ts > PREVIEW_TTL_MS) previewCache.delete(k)
    }

    const confiancaGlobal = mapeamento.reduce((sum, m) => sum + m.confianca, 0) / mapeamento.length

    const extensaoArquivo = nomeArquivo.split('.').pop()?.toLowerCase() ?? ''
    const templateDetectado = ehPlanilhaTemplateGravity(cabecalhos, linhas_cabecalho, hashColunas)
    const scoreEssenciais = calcularScoreEssenciais(mapeamento)
    const pipelineImportacao = classificarPipelineImportacao({
      memoriaAplicada,
      templateDetectado,
      scoreEssenciais,
      extratorUsado: extrator_usado,
      extensaoArquivo,
    })

    if (pipelineImportacao !== 'deterministico') {
      console.info(
        `[SmartImport] tenant=${tenantId} pipeline=${pipelineImportacao} score=${scoreEssenciais.toFixed(2)} template=${templateDetectado} — reservado para Gemini; usando heuristica`,
      )
    }

    // P2.4 — Detecta conflitos: 2+ colunas mapeadas para o mesmo campo_sistema.
    // O usuario precisa decidir qual coluna mantem e qual ignora antes de avancar.
    const conflitos_mapeamento = this.detectarConflitosMapeamento(mapeamento)

    const dados_brutos = linhasBrutas.map((row, i) => ({
      linha: i + linhas_cabecalho + 1,
      valores: Object.fromEntries(
        Object.entries(row).map(([k, v]) => [k, String(v ?? '')])
      ),
    }))

    return {
      total_linhas:    linhasComCoerencia.length,
      total_pedidos:   totalPedidosCalc,
      total_itens:     totalItensCalc,
      mapeamento,
      confianca_global: Math.round(confiancaGlobal),
      memoria_aplicada: memoriaAplicada,
      preview_id:      previewId,
      linhas:          linhasComCoerencia,
      limite_excedido: linhasComCoerencia.length > LIMITE_LINHAS_AVISO,
      extrator_usado,
      dados_brutos,
      conflitos_mapeamento,
      pipeline_importacao: pipelineImportacao,
      score_essenciais: Math.round(scoreEssenciais * 1000) / 1000,
      template_detectado: templateDetectado,
    }
  }

  /**
   * P2.4 — Detecta conflitos de mapeamento (2+ colunas -> mesmo campo_sistema).
   *
   * Ignora colunas com `nivel === 'ignorado'` ou sem `campo_sistema`.
   * Retorna apenas grupos com 2 ou mais ocorrencias.
   *
   * Se um conflito ocorrer, a UI deve forcar o usuario a escolher qual coluna
   * mantem (e marcar as demais como `ignorado`) antes de habilitar a importacao.
   * Sem isso, o ultimo valor sobrescreve o anterior em `aplicarMapeamento`,
   * gerando perda silenciosa de dados.
   */
  private detectarConflitosMapeamento(
    mapeamento: ColunaMapeadaBackend[],
  ): ConflitoMapeamento[] {
    const grupos = new Map<string, string[]>()
    for (const col of mapeamento) {
      if (!col.campo_sistema) continue
      if (col.nivel === 'ignorado') continue
      const arr = grupos.get(col.campo_sistema) ?? []
      arr.push(col.coluna_arquivo)
      grupos.set(col.campo_sistema, arr)
    }
    const conflitos: ConflitoMapeamento[] = []
    for (const [campo_sistema, colunas_arquivo] of grupos.entries()) {
      if (colunas_arquivo.length >= 2) {
        conflitos.push({ campo_sistema, colunas_arquivo })
      }
    }
    return conflitos
  }

  /**
   * Heranca posicional: linhas ITEM com numero_pedido vazio herdam do PEDIDO
   * mais recente acima delas. No template master-detail, o usuario preenche
   * numero_pedido apenas na linha PEDIDO — os ITENs abaixo pertencem a ele
   * implicitamente pela posicao na planilha.
   */
  private herdarNumeroPedidoParaItens(linhas: SmartImportLinha[]): SmartImportLinha[] {
    const temTipoLinha = linhas.some(l => l.dados['tipo_linha'] !== undefined)
    if (!temTipoLinha) return linhas

    let ultimoPedidoNumero: string | null = null

    return linhas.map(l => {
      const tipo = String(l.dados['tipo_linha'] ?? '').trim().toUpperCase()

      if (tipo === 'PEDIDO' && l.numero_pedido) {
        ultimoPedidoNumero = l.numero_pedido
        return l
      }

      if (tipo === 'ITEM' && !l.numero_pedido && ultimoPedidoNumero) {
        return {
          ...l,
          numero_pedido: ultimoPedidoNumero,
          dados: { ...l.dados, numero_pedido: ultimoPedidoNumero },
        }
      }

      return l
    })
  }

  /**
   * P1.2 — Coerencia master-detail entre linhas Pedido (master) e Item (detail).
   *
   * Verifica:
   *   1. Linha PEDIDO duplicada — mesmo numero_pedido em 2+ linhas PEDIDO no arquivo.
   *   2. Linha ITEM antes de qualquer PEDIDO — ordem invertida (sem pai posicional).
   *   3. Linha ITEM com numero_pedido orfao — refere a um numero que nao existe
   *      em nenhuma linha PEDIDO do arquivo.
   *   4. Linha PEDIDO sem nenhum ITEM associado — aviso (pode ser intencional).
   *
   * Cada problema gera alerta especifico na linha afetada (nivel 'erro' para
   * casos criticos, 'aviso' para casos toleraveis).
   *
   * Casos onde a coluna `tipo_linha` nao existe (formato legado): nao aplica
   * validacao master-detail (parser cai no comportamento flat antigo).
   */
  private validarCoerenciaMasterDetail(linhas: SmartImportLinha[]): SmartImportLinha[] {
    // Detecta se a coluna tipo_linha existe (template novo) ou nao (legado).
    const temTipoLinha = linhas.some(l => l.dados['tipo_linha'] !== undefined)
    if (!temTipoLinha) return linhas

    // Indexa por numero_pedido
    const pedidosNoArquivo = new Map<string, number[]>()  // numero -> [linha_arquivo]
    const itensPorPedido   = new Map<string, number[]>()  // numero -> [linha_arquivo]
    let primeiraLinhaPedido = Infinity

    linhas.forEach(l => {
      const tipo = String(l.dados['tipo_linha'] ?? '').trim().toUpperCase()
      const numero = (l.dados['numero_pedido'] as string)?.trim() || ''
      if (tipo === 'PEDIDO' && numero) {
        const arr = pedidosNoArquivo.get(numero) ?? []
        arr.push(l.linha_arquivo)
        pedidosNoArquivo.set(numero, arr)
        if (l.linha_arquivo < primeiraLinhaPedido) primeiraLinhaPedido = l.linha_arquivo
      } else if (tipo === 'ITEM' && numero) {
        const arr = itensPorPedido.get(numero) ?? []
        arr.push(l.linha_arquivo)
        itensPorPedido.set(numero, arr)
      }
    })

    return linhas.map(l => {
      const tipo = String(l.dados['tipo_linha'] ?? '').trim().toUpperCase()
      const numero = (l.dados['numero_pedido'] as string)?.trim() || ''
      const novosAlertas: SmartImportAlerta[] = []

      // 1. PEDIDO duplicado no arquivo
      if (tipo === 'PEDIDO' && numero) {
        const ocorrencias = pedidosNoArquivo.get(numero) ?? []
        if (ocorrencias.length > 1) {
          const outras = ocorrencias.filter(n => n !== l.linha_arquivo).join(', ')
          novosAlertas.push({
            campo: 'numero_pedido',
            tipo: 'duplicado_arquivo',
            mensagem: `Pedido "${numero}" aparece em ${ocorrencias.length} linhas PEDIDO do arquivo (linhas: ${outras}). Mantenha apenas 1.`,
            nivel: 'erro',
          })
        }

        // 4. PEDIDO sem nenhum ITEM
        const itens = itensPorPedido.get(numero) ?? []
        if (itens.length === 0) {
          novosAlertas.push({
            campo: 'tipo_linha',
            tipo: 'obrigatorio_ausente',
            mensagem: `Pedido "${numero}" nao tem nenhum ITEM associado abaixo. Adicione pelo menos 1 linha ITEM com mesmo numero_pedido.`,
            nivel: 'aviso',
          })
        }
      }

      // 2. ITEM antes de qualquer PEDIDO (ordem invertida)
      if (tipo === 'ITEM' && l.linha_arquivo < primeiraLinhaPedido) {
        novosAlertas.push({
          campo: 'tipo_linha',
          tipo: 'formato_invalido',
          mensagem: `Linha ITEM aparece antes de qualquer linha PEDIDO. Reordene: PEDIDO primeiro, depois seus ITENs.`,
          nivel: 'erro',
        })
      }

      // 3. ITEM com numero_pedido orfao (sem PEDIDO correspondente)
      if (tipo === 'ITEM' && numero && !pedidosNoArquivo.has(numero)) {
        novosAlertas.push({
          campo: 'numero_pedido',
          tipo: 'formato_invalido',
          mensagem: `Item refere ao Pedido "${numero}" que nao esta em nenhuma linha PEDIDO do arquivo. Adicione a linha PEDIDO correspondente ou corrija o numero.`,
          nivel: 'erro',
        })
      }

      if (novosAlertas.length === 0) return l

      const alertasCombinados = [...l.alertas, ...novosAlertas]
      const novoStatus: SmartImportLinha['status'] =
        alertasCombinados.some(a => a.nivel === 'erro')  ? 'erro'  :
        alertasCombinados.some(a => a.nivel === 'aviso') ? 'aviso' :
        'ok'

      return { ...l, alertas: alertasCombinados, status: novoStatus }
    })
  }

  async confirmar(
    tenantId: string,
    userId: string,
    payload: SmartImportConfirmar,
    companyId?: string,
    parceirosPorNumero: Map<string, ParceirosResolvidosPedido> = new Map(),
  ): Promise<SmartImportResultado> {
    // SEC — Garantir que o preview pertence ao tenant (defense in depth além da rota)
    if (!payload.preview_id.startsWith(tenantId + '-')) {
      throw new AppError('Preview nao pertence a este tenant', 403, 'UNAUTHORIZED_PREVIEW')
    }

    const linhasFiltradas = prepararLinhasFiltradasConfirmacao(tenantId, payload)
    const cached = previewCache.get(payload.preview_id)

    const criados:    string[] = []
    const atualizados: number[] = []  // numeros de linha do arquivo (resposta ao cliente)
    const pulados:     number[] = []
    const erros:       { linha: number; motivo: string }[] = []
    // Q5 — Set separado para guardar IDs de pedido que precisam de recalculo
    // de agregados. ANTES o codigo passava `atualizados.map(String)` direto pro
    // recalcularAgregadosPedido — mas `atualizados` guarda numero de LINHA do
    // arquivo, nao id de pedido. recalcularAgregadosPedido recebia "2" e
    // crashava com "Pedido nao encontrado", abortando toda a transacao.
    // Resultado: nenhum pedido era persistido apesar da UI nao mostrar erro.
    const idsPedidosParaRecalcular: Set<string> = new Set()
    /** Próxima sequência por pedido — ordem do arquivo, ignorando coluna "Sequencia do Item" da planilha. */
    const proximaSequenciaPorPedido = new Map<string, number>()
    /** Ordem dos pedidos na planilha → data_emissao sintetica para sort da lista. */
    const anchorImportacaoMs = Date.now()
    const primeiraLinhaPorNumero = calcularPrimeiraLinhaPorNumeroPedido(
      linhasFiltradas,
      payload.numeros_editados ?? {},
    )
    const ordemPlanilhaPorIdPedido = new Map<string, number>()

    const registrarOrdemPlanilhaPedido = (idPedido: string, numero: string | null | undefined): void => {
      if (!numero) return
      const primeiraLinha = primeiraLinhaPorNumero.get(numero)
      if (primeiraLinha !== undefined) {
        ordemPlanilhaPorIdPedido.set(idPedido, primeiraLinha)
      }
    }

    const optsOrdemPlanilha = (numero: string | null | undefined): OpcoesOrdemPlanilhaImportacao | undefined => {
      if (!numero) return undefined
      const primeiraLinha = primeiraLinhaPorNumero.get(numero)
      if (primeiraLinha === undefined) return undefined
      return { primeiraLinhaPlanilha: primeiraLinha, anchorImportacaoMs }
    }

    const obterProximaSequenciaItem = async (idPedido: string): Promise<number> => {
      let proxima = proximaSequenciaPorPedido.get(idPedido)
      if (proxima === undefined) {
        const itemCountExistente = await (this.db as Record<string, any>)['pedidoItem'].count({
          where: { id_pedido: idPedido, id_organizacao: tenantId },
        })
        proxima = itemCountExistente + 1
      }
      proximaSequenciaPorPedido.set(idPedido, proxima + 1)
      return proxima
    }

    // Ler casas decimais do workspace para aplicar nos registros criados
    const casasConfig = await this.lerCasasDecimais(tenantId)

    // Débito 2B — lookup do FK do status 'rascunho' uma vez para toda a importação.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const statusRascunhoSmart = await (this.db as any).statusPedido.findFirst({
      where: { id_organizacao: tenantId, nome_pedido_status: 'rascunho' },
      select: { id_pedido_status: true },
    })
    if (!statusRascunhoSmart) {
      console.warn(
        `[smartImport] StatusPedido 'rascunho' nao encontrado na organizacao=${tenantId}; ` +
        `pedidos importados serao criados sem vinculo id_status_pedido.`,
      )
    }
    const idStatusRascunho: string | null = statusRascunhoSmart?.id_pedido_status ?? null

    // this.db já é TransactionClient de withOrganizacao — não abrir $transaction aninhada
    {
      for (const linha of linhasFiltradas) {
        // Savepoint PG por linha: se uma linha falhar (ex: unique constraint),
        // o rollback é apenas dessa linha, sem abortar a transação inteira.
        const spName = `sp_linha_${linha.linha_arquivo}`
        await executarSavepointSql(this.db, `SAVEPOINT ${spName}`)
        try {
          // Aplicar numero editado pelo usuario (SEC.1 / Problema 6)
          const numeroEditado = payload.numeros_editados?.[linha.linha_arquivo]
          const dados = { ...linha.dados }
          if (numeroEditado) dados['numero_pedido'] = numeroEditado

          // P15.3 — Filtrar campos do nivel errado (seguranca no parser)
          const tipoLinha = String(dados['tipo_linha'] ?? '').trim().toUpperCase()
          if (tipoLinha === 'ITEM') {
            for (const campo of CAMPOS_BLOQ_PARA_ITEM) delete dados[campo]
          } else if (tipoLinha === 'PEDIDO') {
            for (const campo of CAMPOS_BLOQ_PARA_PEDIDO) delete dados[campo]
          }

          // Validar valor_por_unidade_item não-negativo
          const valorUnitRaw = dados['valor_por_unidade_item']
          if (valorUnitRaw !== undefined && valorUnitRaw !== null && valorUnitRaw !== '') {
            const valorUnit = parseNumeroBr(valorUnitRaw, NaN)
            if (Number.isFinite(valorUnit) && valorUnit < 0) {
              erros.push({ linha: linha.linha_arquivo, motivo: 'Valor unitario do item nao pode ser negativo' })
              await executarSavepointSql(this.db, `RELEASE SAVEPOINT ${spName}`)
              continue
            }
          }

          // Validar numeros antes de falar com o Prisma (mensagem clara vs "Invalid invocation")
          const erroNumeros = this.validarNumerosParaGravar(dados, tipoLinha)
          if (erroNumeros) {
            erros.push({ linha: linha.linha_arquivo, motivo: erroNumeros })
            await executarSavepointSql(this.db, `RELEASE SAVEPOINT ${spName}`)
            continue
          }

          const numeroPedido = (dados['numero_pedido'] as string) || linha.numero_pedido

          // Aplicar decisao de duplicata — SOMENTE para linhas PEDIDO (não ITEM).
          // Linhas ITEM sempre devem seguir para o caminho de "adicionar item ao pedido existente".
          if (tipoLinha !== 'ITEM' && numeroPedido && payload.decisoes_duplicatas[numeroPedido] === 'pular') {
            pulados.push(linha.linha_arquivo)
            await executarSavepointSql(this.db, `RELEASE SAVEPOINT ${spName}`)
            continue
          }

          const numeroPedidoFinal = payload.numeros_editados?.[linha.linha_arquivo] ?? numeroPedido
          const parceirosNumero = numeroPedidoFinal
            ? parceirosPorNumero.get(numeroPedidoFinal)
            : undefined

          const dadosPedido = {
            ...this.montarDadosPedido(
              dados,
              tenantId,
              companyId ?? tenantId,
              casasConfig,
              optsOrdemPlanilha(numeroPedidoFinal ?? numeroPedido),
            ),
            id_status_pedido: idStatusRascunho,
          }
          aplicarFksParceirosNoPedido(dadosPedido, parceirosNumero)

          if (tipoLinha !== 'ITEM' && numeroPedido && payload.decisoes_duplicatas[numeroPedido] === 'sobrescrever') {
            const existente = await (this.db as Record<string, any>)['pedido'].findFirst({
              where: { numero_pedido: numeroPedido, id_organizacao: tenantId },
            })
            if (existente) {
              await (this.db as Record<string, any>)['pedido'].update({
                where: { id_pedido: existente.id_pedido },
                data:  dadosPedido,
              })
              if (parceirosNumero) {
                await aplicarParceirosResolvidosNoPedido(this.db, existente.id_pedido, tenantId, parceirosNumero)
              }
              registrarOrdemPlanilhaPedido(existente.id_pedido, numeroPedido)
              atualizados.push(linha.linha_arquivo)
              idsPedidosParaRecalcular.add(existente.id_pedido)
              await executarSavepointSql(this.db, `RELEASE SAVEPOINT ${spName}`)
              continue
            }
          }

          // Verificar se já existe pedido com este número (para importação incremental de itens)
          if (numeroPedidoFinal && (tipoLinha === 'ITEM' || !payload.decisoes_duplicatas[numeroPedidoFinal])) {
            const pedidoExistente = await (this.db as Record<string, any>)['pedido'].findFirst({
              where: { numero_pedido: numeroPedidoFinal, id_organizacao: tenantId, status_pedido: { not: 'cancelado' } },
              select: { id_pedido: true },
            })

            if (pedidoExistente && (dados['part_number_item'] || dados['descricao_item'])) {
              try {
                const seqItem = await obterProximaSequenciaItem(pedidoExistente.id_pedido)
                const itemData = mesclarNomesItemParceiros(
                  this.montarDadosItem(dados, tenantId, companyId ?? tenantId, casasConfig, seqItem),
                  parceirosNumero?.nomesItem,
                )
                itemData.pedido_item = { connect: { id_pedido: pedidoExistente.id_pedido } }
                await (this.db as Record<string, any>)['pedidoItem'].create({ data: itemData })
                if (parceirosNumero) {
                  await aplicarParceirosResolvidosNoPedido(this.db, pedidoExistente.id_pedido, tenantId, parceirosNumero)
                }
                registrarOrdemPlanilhaPedido(pedidoExistente.id_pedido, numeroPedidoFinal)
                atualizados.push(linha.linha_arquivo)
                idsPedidosParaRecalcular.add(pedidoExistente.id_pedido)
              } catch (errInsert: unknown) {
                await executarSavepointSql(this.db, `ROLLBACK TO SAVEPOINT ${spName}`)
                erros.push({
                  linha: linha.linha_arquivo,
                  motivo: `Falha ao adicionar item ao pedido "${numeroPedidoFinal}": ${traduzirErroPrisma(errInsert)}`,
                })
              }
              await executarSavepointSql(this.db, `RELEASE SAVEPOINT ${spName}`)
              continue
            }

            if (pedidoExistente) {
              // Pedido existe mas linha não tem dados de item — pular silenciosamente
              await executarSavepointSql(this.db, `RELEASE SAVEPOINT ${spName}`)
              atualizados.push(linha.linha_arquivo)
              idsPedidosParaRecalcular.add(pedidoExistente.id_pedido)
              continue
            }
          }

          // Criar pedido novo com o item da linha atual (P14 — nomes do SSOT)
          // Q5 — Relacao no schema chama `itens_pedido` (nao `itens`). Tambem
          // troca id/tenant_id/company_id por id_item/id_organizacao/id_workspace.
          // Usa montarDadosItem para mapeamento completo (100% cobertura).
          const itemPayload = (dados['part_number_item'] || dados['descricao_item']) ? {
            itens_pedido: {
              create: [
                mesclarNomesItemParceiros(
                  this.montarDadosItemInline(dados, tenantId, companyId ?? tenantId, casasConfig, 1),
                  parceirosNumero?.nomesItem,
                ),
              ],
            },
          } : {}

          const snapshotsPayload = parceirosNumero?.snapshots.length
            ? { snapshots_empresa_pedido: { create: parceirosNumero.snapshots } }
            : {}

          const novo = await (this.db as Record<string, any>)['pedido'].create({
            data: { ...dadosPedido, ...itemPayload, ...snapshotsPayload },
          })
          if (itemPayload.itens_pedido) {
            proximaSequenciaPorPedido.set(novo.id_pedido, 2)
          }
          registrarOrdemPlanilhaPedido(novo.id_pedido, numeroPedidoFinal ?? numeroPedido)
          criados.push(novo.id_pedido)
          idsPedidosParaRecalcular.add(novo.id_pedido)
          await executarSavepointSql(this.db, `RELEASE SAVEPOINT ${spName}`)
        } catch (err: unknown) {
          await executarSavepointSql(this.db, `ROLLBACK TO SAVEPOINT ${spName}`)
          erros.push({
            linha: linha.linha_arquivo,
            motivo: traduzirErroPrisma(err),
          })
        }
      }

      // Salvar mapeamento se solicitado
      if (payload.salvar_mapeamento && cached) {
        const hashColunas = payload.preview_id.split('-')[1] ?? ''
        if (hashColunas) {
          await this.memoriaService.salvar(tenantId, hashColunas, payload.mapeamento_confirmado)
        }
      }

      // Recalcular os 5 agregados de cada pedido criado/atualizado a partir
      // dos itens. Roda DENTRO da transação principal (regra "tx obrigatório"
      // do helper). Q5 — usa `idsPedidosParaRecalcular` (Set de id_pedido reais)
      // em vez de `atualizados.map(String)` que continha numero de linha do
      // arquivo (bug que abortava toda a transacao).
      for (const pedidoId of idsPedidosParaRecalcular) {
        const spRecalc = `sp_recalc_${pedidoId.replace(/[^a-zA-Z0-9_]/g, '_')}`
        await executarSavepointSql(this.db, `SAVEPOINT ${spRecalc}`)
        try {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          await recalcularAgregadosPedido(this.db as any, pedidoId, tenantId)
          await executarSavepointSql(this.db, `RELEASE SAVEPOINT ${spRecalc}`)
        } catch (errRecalc: unknown) {
          await executarSavepointSql(this.db, `ROLLBACK TO SAVEPOINT ${spRecalc}`)
          const msgInterna = errRecalc instanceof Error ? errRecalc.message : 'Erro desconhecido'
          console.warn(`[smartImport:confirmar] recalcularAgregadosPedido falhou pedido=${pedidoId}: ${msgInterna}`)
          erros.push({ linha: 0, motivo: `Pedido importado, mas o cálculo dos totais falhou. Abra o pedido e salve novamente para recalcular.` })
        }
      }

      // Normalizar sequencia_item_pedido → 1..N na ordem do arquivo (ignora coluna da planilha).
      for (const pedidoId of idsPedidosParaRecalcular) {
        const spSeq = `sp_seq_${pedidoId.replace(/[^a-zA-Z0-9_]/g, '_')}`
        await executarSavepointSql(this.db, `SAVEPOINT ${spSeq}`)
        try {
          await this.resequenciarItensPedido(tenantId, pedidoId)
          await executarSavepointSql(this.db, `RELEASE SAVEPOINT ${spSeq}`)
        } catch (errSeq: unknown) {
          await executarSavepointSql(this.db, `ROLLBACK TO SAVEPOINT ${spSeq}`)
          const msgSeq = errSeq instanceof Error ? errSeq.message : 'Erro desconhecido'
          console.warn(`[smartImport:confirmar] resequenciarItensPedido falhou pedido=${pedidoId}: ${msgSeq}`)
        }
      }

      // Ordem dos pedidos na lista = ordem de 1a aparicao na planilha (sort data_emissao DESC).
      for (const [pedidoId, primeiraLinha] of ordemPlanilhaPorIdPedido) {
        const spOrdem = `sp_ordem_${pedidoId.replace(/[^a-zA-Z0-9_]/g, '_')}`
        await executarSavepointSql(this.db, `SAVEPOINT ${spOrdem}`)
        try {
          await (this.db as Record<string, any>)['pedido'].update({
            where: { id_pedido: pedidoId },
            data: {
              data_emissao_pedido: dataEmissaoPorOrdemPlanilha(primeiraLinha, anchorImportacaoMs),
            },
          })
          await executarSavepointSql(this.db, `RELEASE SAVEPOINT ${spOrdem}`)
        } catch (errOrdem: unknown) {
          await executarSavepointSql(this.db, `ROLLBACK TO SAVEPOINT ${spOrdem}`)
          const msgOrdem = errOrdem instanceof Error ? errOrdem.message : 'Erro desconhecido'
          console.warn(`[smartImport:confirmar] ordem planilha falhou pedido=${pedidoId}: ${msgOrdem}`)
        }
      }
    }

    return {
      criados:    criados.length,
      atualizados: atualizados.length,
      pulados:    pulados.length,
      erros,
      ids_criados: criados,
    }
  }

  // ── Privados ──────────────────────────────────────────────────────────────────

  /**
   * P4.2 — Mapeamento determinístico baseado em SSOT (campos-pedido-ddd.ts).
   *
   * Ordem de match (cada tier so e' tentado se o anterior nao encontrou):
   *   1. ROTULO PT-BR exato (do SSOT) — confianca 99, nivel 'auto'
   *      Ex: "Numero do Pedido" -> numero_pedido
   *      Se 2 campos compartilham rotulo (caso "Moeda" -> pedido + item),
   *      escolhe o de nivel='pedido' por padrao e marca confianca 85
   *      (ainda 'auto' — desambiguar por contexto e' tarefa futura)
   *   2. CAMPO interno exato (do SSOT) — confianca 95, nivel 'auto'
   *      Ex: "numero_pedido" -> numero_pedido (export do Gemini)
   *   3. ALIAS LEGADO exato — confianca 92 (sem ambiguidade) ou 75 (ambiguo)
   *      Ex: "po number" -> numero_pedido
   *   4. ALIAS LEGADO substring (>=6 chars, sem ambiguidade) — confianca 70
   *      Ex: "PO Number Reference" contem "po number" -> numero_pedido
   *
   * SEM fallback frouxo: substring de aliases <6 chars ou ambiguos retornam
   * null em vez de chutar (REGRA 08 — sem fallback silencioso).
   */
  private mapearComIA(cabecalhos: string[], amostra: LinhaArquivo[]): ColunaMapeadaBackend[] {
    return cabecalhos.map(cabecalho => {
      // Primeiro valor não-vazio da amostra
      const exemploValor = amostra
        .map(linha => linha[cabecalho])
        .find(v => v !== undefined && v !== null && String(v).trim() !== '')
        ?? null
      const exemploStr = exemploValor ? String(exemploValor).slice(0, 80) : null

      const cabNorm = normalizarNomeCampo(cabecalho)
      let campoEscolhido: CampoPedidoDDD | null = null
      let confianca = 0

      // Tier 1: rotulo PT-BR exato
      const matchRotulo = CAMPO_POR_ROTULO_NORMALIZADO.get(cabNorm)
      if (matchRotulo && matchRotulo.length > 0) {
        if (matchRotulo.length === 1) {
          campoEscolhido = matchRotulo[0]
          confianca = 99
        } else {
          // Ambiguidade (ex: "Moeda" -> moeda_pedido + moeda_item).
          // Escolhe o de nivel='pedido' como default; UI ja permite trocar.
          campoEscolhido = matchRotulo.find(c => c.nivel === 'pedido') ?? matchRotulo[0]
          confianca = 85
        }
      }

      // Tier 2: nome interno exato
      if (!campoEscolhido) {
        const matchNome = CAMPO_POR_NOME_INTERNO.get(cabNorm)
        if (matchNome) {
          campoEscolhido = matchNome
          confianca = 95
        }
      }

      // Tier 2.5: coluna Prisma extra (nao esta no SSOT mas existe no schema)
      // Previne que descricao_completa_item_pt caia no Tier 4 como "descricao_item"
      if (!campoEscolhido) {
        const matchExtra = CAMPOS_PRISMA_EXTRAS_MAPEAMENTO.get(cabNorm)
        if (matchExtra) {
          // Retorna como campo_sistema = nome da coluna Prisma (vai para _campos_extras -> extração)
          return {
            coluna_arquivo: cabecalho,
            campo_sistema: matchExtra,
            confianca: 93,
            nivel: 'auto' as const,
            inferido_por: 'dados' as const,
            valor_exemplo_coluna_pedido: exemploStr,
          }
        }
      }

      // Tier 3: alias legado exato
      if (!campoEscolhido) {
        const matchAlias = CAMPO_POR_ALIAS_LEGADO.get(cabNorm)
        if (matchAlias && matchAlias.length > 0) {
          if (matchAlias.length === 1) {
            campoEscolhido = matchAlias[0]
            confianca = 92
          } else {
            campoEscolhido = matchAlias.find(c => c.nivel === 'pedido') ?? matchAlias[0]
            confianca = 75
          }
        }
      }

      // Tier 4: substring de alias legado (>=6 chars, sem ambiguidade)
      if (!campoEscolhido) {
        const aliasesPossiveis: CampoPedidoDDD[] = []
        for (const [alias, campos] of CAMPO_POR_ALIAS_LEGADO.entries()) {
          if (alias.length < 6) continue
          if (cabNorm.includes(alias) || alias.includes(cabNorm)) {
            aliasesPossiveis.push(...campos)
          }
        }
        // Sem ambiguidade = exatamente um campo unico em todos os matches
        const camposUnicos = Array.from(new Set(aliasesPossiveis.map(c => c.campo)))
        if (camposUnicos.length === 1) {
          campoEscolhido = aliasesPossiveis[0]
          confianca = 70
        }
        // Se ambiguidade (2+ campos), deixa null — usuario decide manualmente
      }

      const nivel: ColunaMapeadaBackend['nivel'] =
        confianca >= 90 ? 'auto' :
        confianca >= 70 ? 'confirmado' :
        'ignorado'

      return {
        coluna_arquivo: cabecalho,
        campo_sistema:  campoEscolhido?.campo ?? null,
        confianca,
        nivel,
        inferido_por:   'ia',
        valor_exemplo_coluna_pedido:  exemploStr,
      }
    })
  }

  private inferirPorDados(
    _coluna: string,
    valores: string[],
  ): { campo: string; confianca: number } | null {
    const amostras = valores.filter(v => v.trim().length > 0).slice(0, 10)
    if (amostras.length === 0) return null

    // Detectar Incoterm
    // SSOT: cadastros.incoterm. Esta lista é cache local da heurística de
    // detecção de coluna no Smart Import (rodada para cada coluna no upload).
    // Buscar do Cadastros aqui adicionaria latência por linha — TODO refatorar
    // para lazy-load cacheado se a lista de Incoterms 2020 mudar.
    const incoterms = ['FOB', 'CIF', 'EXW', 'DDP', 'DAP', 'FCA', 'CPT', 'CIP', 'DPU', 'FAS', 'CFR']
    if (amostras.every(v => incoterms.includes(v.toUpperCase().trim()))) {
      return { campo: 'incoterm', confianca: 92 }
    }

    // Detectar NCM (8 digitos)
    const ncmRegex = /^\d{4}[.\s]?\d{2}[.\s]?\d{2}$/
    if (amostras.filter(v => ncmRegex.test(v.trim())).length >= amostras.length * 0.7) {
      // P14 — campo NCM no schema e' `ncm_item` (Pedido tem ncm via Item)
      return { campo: 'ncm_item', confianca: 88 }
    }

    // Detectar moeda
    const moedas = ['USD', 'EUR', 'BRL', 'GBP', 'CNY', 'JPY', 'AUD', 'CAD']
    if (amostras.every(v => moedas.includes(v.toUpperCase().trim()))) {
      return { campo: 'moeda_pedido', confianca: 91 }
    }

    // Detectar data — P14: data_embarque nao existe mais no SSOT.
    // data_emissao_pedido e' o canonical mais provavel para coluna de data
    // sem contexto adicional (e' campo principal do Pedido).
    const dataRegex = /^\d{1,4}[-/]\d{1,2}[-/]\d{1,4}$/
    if (amostras.filter(v => dataRegex.test(v.trim())).length >= amostras.length * 0.8) {
      return { campo: 'data_emissao_pedido', confianca: 72 }
    }

    return null
  }

  private aplicarMapeamento(
    linha: LinhaArquivo,
    mapeamento: ColunaMapeadaBackend[],
    numeroLinha: number,
  ): SmartImportLinha {
    const dados: Record<string, unknown> = {}
    const camposExtras: Record<string, string> = {}

    for (const col of mapeamento) {
      const valor = linha[col.coluna_arquivo]
      // '__drop__' = usuário escolheu descartar explicitamente
      if (col.campo_sistema === '__drop__') continue
      if (col.campo_sistema) {
        if (valor !== undefined) dados[col.campo_sistema] = valor
      } else {
        // Sem campo sistema → preservar em campos_custom do item (zero data loss)
        const v = valor !== undefined ? String(valor).trim() : ''
        if (v) camposExtras[col.coluna_arquivo] = v
      }
    }

    // Composition e campos similares: concatenar na descricao_item quando existir
    const MERGE_EM_DESCRICAO = ['composition', 'composição', 'material composition', 'fabric', 'tecido']
    for (const key of Object.keys(camposExtras)) {
      if (MERGE_EM_DESCRICAO.includes(key.toLowerCase())) {
        const descAtual = dados['descricao_item'] ? String(dados['descricao_item']) : ''
        const composicao = camposExtras[key]
        if (composicao) {
          dados['descricao_item'] = descAtual ? `${descAtual} | ${composicao}` : composicao
        }
        delete camposExtras[key]
      }
    }

    if (Object.keys(camposExtras).length > 0) {
      dados['_campos_extras'] = camposExtras
    }

    const alertas = this.validarLinha(dados)
    const status: SmartImportLinha['status'] =
      alertas.some(a => a.nivel === 'erro')  ? 'erro'  :
      alertas.some(a => a.nivel === 'aviso') ? 'aviso' :
      'ok'

    return {
      linha_arquivo: numeroLinha,
      numero_pedido: (dados['numero_pedido'] as string) || null,
      status,
      alertas,
      dados,
    }
  }

  private validarNumerosParaGravar(dados: Record<string, unknown>, tipoLinha: string): string | null {
    const ehItem = tipoLinha === 'ITEM'
      || Boolean(dados['part_number_item'] || dados['descricao_item'])

    if (!ehItem) return null

    if (dados['quantidade_inicial_item'] !== undefined && dados['quantidade_inicial_item'] !== '') {
      const qty = parseNumeroBrOpcional(dados['quantidade_inicial_item'])
      if (qty === null || qty <= 0) {
        return `Quantidade invalida ("${dados['quantidade_inicial_item']}"). Use numero com virgula ou ponto decimal (ex: 1,00 ou 1.00).`
      }
    }

    const camposNumericos: Array<[string, string]> = [
      ['valor_por_unidade_item', 'Valor por unidade'],
      ['valor_total_item', 'Valor total do item'],
      ['sequencia_item_pedido', 'Sequencia do item'],
      ['peso_liquido_unitario_item', 'Peso liquido unitario'],
      ['peso_bruto_unitario_item', 'Peso bruto unitario'],
      ['cubagem_unitaria_item', 'Cubagem unitaria'],
    ]

    for (const [campo, rotulo] of camposNumericos) {
      if (dados[campo] === undefined || dados[campo] === '') continue
      if (parseNumeroBrOpcional(dados[campo]) === null) {
        return `${rotulo} invalido ("${dados[campo]}"). Use numero com virgula ou ponto decimal.`
      }
    }

    return null
  }

  private validarLinha(dados: Record<string, unknown>): SmartImportAlerta[] {
    const alertas: SmartImportAlerta[] = []

    // ── P3.3 — Erros de formula do Excel ──────────────────────────────────
    // Quando uma celula contem #REF!, #N/A, #VALUE!, #DIV/0!, #NAME?, #NULL!,
    // #NUM! — o XLSX serializa como string. Isso indica que o arquivo foi
    // exportado com formulas quebradas (links a celulas removidas, divisoes
    // por zero, etc.). Sem deteccao, esses valores entram no banco como texto
    // literal "#REF!" — bug invisivel.
    const REGEX_ERRO_EXCEL = /^#(REF|N\/A|VALUE|DIV\/0|NAME|NULL|NUM)[!?]?$/
    for (const [campo, valor] of Object.entries(dados)) {
      if (typeof valor !== 'string') continue
      if (!REGEX_ERRO_EXCEL.test(valor.trim())) continue
      alertas.push({
        campo,
        tipo: 'formato_invalido',
        mensagem: `Celula contem erro de formula do Excel ("${valor}"). Verifique a planilha de origem antes de importar.`,
        nivel: 'erro',
      })
    }

    // ── Tipo Linha (master-detail) ─────────────────────────────────────────
    // Coluna obrigatoria do template DDD novo. Aceita PEDIDO ou ITEM (case-insensitive).
    if (dados['tipo_linha'] !== undefined) {
      const tipoLinha = String(dados['tipo_linha']).trim().toUpperCase()
      if (tipoLinha && !['PEDIDO', 'ITEM'].includes(tipoLinha)) {
        alertas.push({
          campo: 'tipo_linha',
          tipo: 'formato_invalido',
          mensagem: `Tipo Linha "${dados['tipo_linha']}" invalido — aceitos apenas: PEDIDO, ITEM`,
          nivel: 'erro',
        })
      }
    }

    // ── Tipo Operacao (enum critico) ──────────────────────────────────────
    // Antes era silencioso (vira 'importacao' default). Agora avisa.
    if (dados['tipo_operacao'] !== undefined) {
      const tipoOp = String(dados['tipo_operacao']).trim().toLowerCase()
      if (tipoOp && !['importacao', 'exportacao'].includes(tipoOp)) {
        alertas.push({
          campo: 'tipo_operacao',
          tipo: 'formato_invalido',
          mensagem: `Tipo de Operacao "${dados['tipo_operacao']}" invalido — aceitos apenas: importacao, exportacao`,
          nivel: 'erro',
        })
      }
    }

    // P14 — Validacao por nivel da linha (master-detail).
    // tipo_linha controla se o registro e' Pedido (master) ou Item (detail).
    // Quando ausente, modo legado/flat — valida tudo como antes.
    const tipoLinhaUpper = String(dados['tipo_linha'] ?? '').trim().toUpperCase()
    const ehLinhaItem    = tipoLinhaUpper === 'ITEM'
    const ehLinhaPedido  = tipoLinhaUpper === 'PEDIDO'
    const ehFormatoFlat  = tipoLinhaUpper === ''  // sem tipo_linha — formato legado

    // Numero do pedido (campo do Pedido — nao valida em linha ITEM isolada)
    if (!dados['numero_pedido'] && (ehLinhaPedido || ehFormatoFlat)) {
      const partNumber = dados['part_number_item'] ? String(dados['part_number_item']) : ''
      const sugestao = partNumber ? ` Sugestao: usar Part Number "${partNumber}" como referencia` : ''
      alertas.push({
        campo: 'numero_pedido',
        tipo: 'obrigatorio_ausente',
        mensagem: `Numero do pedido ausente — sera gerado automaticamente.${sugestao}`,
        nivel: 'aviso',
      })
    }

    // Part Number (campo do Item — so valida em linha ITEM ou flat)
    if (!dados['part_number_item'] && (ehLinhaItem || ehFormatoFlat)) {
      alertas.push({ campo: 'part_number_item', tipo: 'obrigatorio_ausente', mensagem: 'Part number ausente', nivel: 'aviso' })
    }

    // Quantidade inicial (campo do Item)
    if (ehLinhaItem || ehFormatoFlat) {
      const qty = parseNumeroBrOpcional(dados['quantidade_inicial_item'])
      if (
        dados['quantidade_inicial_item'] !== undefined
        && dados['quantidade_inicial_item'] !== ''
        && (qty === null || qty <= 0)
      ) {
        alertas.push({ campo: 'quantidade_inicial_item', tipo: 'valor_negativo', mensagem: 'Quantidade deve ser maior que zero', nivel: 'erro' })
      }
    }

    // Valor por unidade (campo do Item)
    const val = parseNumeroBrOpcional(dados['valor_por_unidade_item'])
    if (dados['valor_por_unidade_item'] !== undefined && dados['valor_por_unidade_item'] !== '' && val !== null && val < 0) {
      alertas.push({ campo: 'valor_por_unidade_item', tipo: 'valor_negativo', mensagem: 'Valor unitario nao pode ser negativo', nivel: 'erro' })
    }

    // NCM (campo do Item) — deve ter 8 digitos
    const ncm = String(dados['ncm_item'] ?? '').replace(/[.\s-]/g, '')
    if (ncm && !/^\d{8}$/.test(ncm)) {
      alertas.push({
        campo: 'ncm_item',
        tipo: 'formato_invalido',
        mensagem: `NCM "${dados['ncm_item']}" invalido — deve ter 8 digitos numericos (ex: 84713019)`,
        nivel: 'aviso',
      })
    }
    // P14 — Validacao de data_embarque removida: o campo nao existe no SSOT
    // atual (substituido por datas especificas de etapa: data_emissao_pedido,
    // data_documento_pedido, data_prevista_pedido_pronto, etc.).

    // ── Validacao de tipo de dados via SSOT (P1.1) ────────────────────────────
    // Para cada campo preenchido, valida conforme tipo declarado em CAMPOS_PEDIDO_DDD_TODOS:
    //   - tipo='data':   exige Date.parse() valido (DD/MM/YYYY, YYYY-MM-DD, ISO)
    //   - tipo='numero': exige Number(v) sem NaN (rejeita texto livre)
    //   - tipo='select': exige valor em opcoesSelect (case-insensitive)
    //   - tipo='texto':  sem validacao adicional (qualquer string aceita)
    // Pula campos ja validados especificamente acima (numero_pedido, part_number_item,
    // quantidade_inicial_item, valor_por_unidade_item, ncm_item, tipo_linha,
    // tipo_operacao) para evitar mensagens duplicadas.
    // P14 — Nomes alinhados ao SSOT atual (eram legados: part_number, ncm,
    // quantidade_inicial_pedido, data_embarque — que nao existem mais).
    const CAMPOS_JA_VALIDADOS = new Set([
      'tipo_linha', 'tipo_operacao', 'numero_pedido', 'part_number_item',
      'quantidade_inicial_item', 'valor_por_unidade_item', 'ncm_item',
    ])
    for (const def of CAMPOS_PEDIDO_DDD_TODOS as readonly CampoPedidoDDD[]) {
      if (CAMPOS_JA_VALIDADOS.has(def.campo)) continue
      const valor = dados[def.campo]
      if (valor === undefined || valor === null || valor === '') continue
      const valorStr = String(valor).trim()
      if (!valorStr) continue

      if (def.tipo === 'data') {
        if (isNaN(new Date(valorStr).getTime())) {
          alertas.push({
            campo: def.campo,
            tipo: 'formato_invalido',
            mensagem: `${def.rotulo}: data invalida ("${valorStr}"). Formato esperado: DD/MM/YYYY ou YYYY-MM-DD`,
            nivel: 'aviso',
          })
        }
      } else if (def.tipo === 'numero') {
        if (parseNumeroBrOpcional(valor) === null) {
          alertas.push({
            campo: def.campo,
            tipo: 'formato_invalido',
            mensagem: `${def.rotulo}: numero invalido ("${valorStr}"). Esperado: numero (use ponto ou virgula como decimal)`,
            nivel: 'erro',
          })
        }
      } else if (def.tipo === 'select' && def.opcoesSelect && def.opcoesSelect.length > 0) {
        const valorCodigo = extrairCodigoDropdown(valorStr)
        const valorLower = valorCodigo.toLowerCase()
        const opcoesLower = def.opcoesSelect.map(o => o.toLowerCase())
        if (!opcoesLower.includes(valorLower) && !opcoesLower.includes(valorStr.toLowerCase())) {
          alertas.push({
            campo: def.campo,
            tipo: 'formato_invalido',
            mensagem: `${def.rotulo}: valor invalido ("${valorStr}"). Aceitos: ${def.opcoesSelect.join(', ')}`,
            nivel: 'erro',
          })
        }
      }
    }

    // ── P2.1 — Coerencia matematica ─────────────────────────────────────────
    // Verifica relacoes esperadas entre campos numericos. Tolerancia de 1% para
    // evitar falsos positivos por arredondamento. Tudo nivel 'aviso' — usuario
    // pode estar importando dados legados com pequena divergencia.

    const numFlex = (v: unknown): number | null => parseNumeroBrOpcional(v)

    // valor_total_item = quantidade_inicial × valor_por_unidade (tolerancia 1%)
    // P14 — quantidade_inicial_pedido (legado) -> quantidade_inicial_item
    const qtyItem = numFlex(dados['quantidade_inicial_item'])
    const valorUnit = numFlex(dados['valor_por_unidade_item'])
    const valorTotal = numFlex(dados['valor_total_item'])
    if (qtyItem !== null && valorUnit !== null && valorTotal !== null && qtyItem > 0 && valorUnit > 0) {
      const esperado = qtyItem * valorUnit
      const tolerancia = Math.max(0.01, esperado * 0.01)
      if (Math.abs(esperado - valorTotal) > tolerancia) {
        alertas.push({
          campo: 'valor_total_item',
          tipo: 'formato_invalido',
          mensagem: `Valor total (${valorTotal.toFixed(2)}) nao bate com Qtd × Valor unitario (${qtyItem} × ${valorUnit} = ${esperado.toFixed(2)})`,
          nivel: 'aviso',
        })
      }
    }

    // peso_bruto >= peso_liquido (impossibilidade fisica)
    // P14 — schema PedidoItem usa _item: peso_liquido_unitario_item, peso_bruto_unitario_item
    const pesoLiq = numFlex(dados['peso_liquido_unitario_item'])
    const pesoBruto = numFlex(dados['peso_bruto_unitario_item'])
    if (pesoLiq !== null && pesoBruto !== null && pesoLiq > 0 && pesoBruto > 0 && pesoBruto < pesoLiq) {
      alertas.push({
        campo: 'peso_bruto_unitario_item',
        tipo: 'formato_invalido',
        mensagem: `Peso bruto (${pesoBruto}) menor que peso liquido (${pesoLiq}) — impossibilidade fisica`,
        nivel: 'aviso',
      })
    }

    // peso_bruto_total >= peso_liquido_total (mesma logica para totais)
    const pesoLiqTotal = numFlex(dados['peso_liquido_total_pedido'])
    const pesoBrutoTotal = numFlex(dados['peso_bruto_total_pedido'])
    if (pesoLiqTotal !== null && pesoBrutoTotal !== null && pesoLiqTotal > 0 && pesoBrutoTotal > 0 && pesoBrutoTotal < pesoLiqTotal) {
      alertas.push({
        campo: 'peso_bruto_total_pedido',
        tipo: 'formato_invalido',
        mensagem: `Peso bruto total (${pesoBrutoTotal}) menor que peso liquido total (${pesoLiqTotal}) — impossibilidade fisica`,
        nivel: 'aviso',
      })
    }

    // Coerencia temporal: previsao <= confirmada <= meta (e o oposto se data_meta
    // for 'limite' e nao 'objetivo'). Aplicado em pares conhecidos.
    const validarOrdemDatas = (campoA: string, campoB: string, rotuloA: string, rotuloB: string) => {
      const a = dados[campoA] ? new Date(String(dados[campoA])).getTime() : NaN
      const b = dados[campoB] ? new Date(String(dados[campoB])).getTime() : NaN
      if (!isNaN(a) && !isNaN(b) && a > b) {
        alertas.push({
          campo: campoB,
          tipo: 'formato_invalido',
          mensagem: `${rotuloA} (${dados[campoA]}) e posterior a ${rotuloB} (${dados[campoB]}) — verifique a sequencia`,
          nivel: 'aviso',
        })
      }
    }
    // Pedido pronto
    validarOrdemDatas('data_prevista_pedido_pronto', 'data_confirmada_pedido_pronto',
      'Data Prevista — Pedido Pronto', 'Data Confirmada — Pedido Pronto')
    validarOrdemDatas('data_emissao_pedido', 'data_documento_invoice_pedido',
      'Data de Emissao', 'Data Documento Invoice')

    // ── P2.2 — Formatos especiais (CNPJ, email) ────────────────────────────

    // CNPJ — 14 digitos (com ou sem mascara)
    const cnpj = String(dados['cnpj_importador_pedido'] ?? '').replace(/\D/g, '')
    if (cnpj && cnpj.length !== 14) {
      alertas.push({
        campo: 'cnpj_importador_pedido',
        tipo: 'formato_invalido',
        mensagem: `CNPJ "${dados['cnpj_importador_pedido']}" deve ter 14 digitos (formato: 00.000.000/0000-00)`,
        nivel: 'aviso',
      })
    } else if (cnpj && !this.cnpjDigitoVerificadorValido(cnpj)) {
      alertas.push({
        campo: 'cnpj_importador_pedido',
        tipo: 'formato_invalido',
        mensagem: `CNPJ "${dados['cnpj_importador_pedido']}" tem digito verificador invalido`,
        nivel: 'aviso',
      })
    }

    // Email — regex basica (RFC 5322 simplificada)
    const email = String(dados['email_contato_exportador'] ?? '').trim()
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      alertas.push({
        campo: 'email_contato_exportador',
        tipo: 'formato_invalido',
        mensagem: `Email "${email}" tem formato invalido (esperado: usuario@dominio.com)`,
        nivel: 'aviso',
      })
    }

    // Email OPE
    const emailOpe = String(dados['email_ope'] ?? '').trim()
    if (emailOpe && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailOpe)) {
      alertas.push({
        campo: 'email_ope',
        tipo: 'formato_invalido',
        mensagem: `Email OPE "${emailOpe}" tem formato invalido`,
        nivel: 'aviso',
      })
    }

    return alertas
  }

  /**
   * Valida digitos verificadores do CNPJ (modulo 11).
   * Retorna true se DV bate, false caso contrario.
   */
  private cnpjDigitoVerificadorValido(cnpj: string): boolean {
    if (cnpj.length !== 14) return false
    if (/^(\d)\1{13}$/.test(cnpj)) return false  // todos digitos iguais (11111111111111)

    const calc = (slice: string, pesos: number[]): number => {
      const soma = slice.split('').reduce((acc, d, i) => acc + parseInt(d, 10) * pesos[i], 0)
      const resto = soma % 11
      return resto < 2 ? 0 : 11 - resto
    }

    const dv1 = calc(cnpj.slice(0, 12), [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2])
    const dv2 = calc(cnpj.slice(0, 13), [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2])

    return dv1 === parseInt(cnpj[12], 10) && dv2 === parseInt(cnpj[13], 10)
  }

  /**
   * Q5 — Atualizado para schema DDD atual.
   *
   * Antes (P14 corrigiu apenas o lado do PedidoItem): usava nomes LEGADOS
   *   id, tenant_id, company_id, tipo_operacao, status,
   *   importacao_exportador_id, fabricante_id, incoterm
   * que NAO existem no schema atual. Prisma 5.22 ignora unknown silenciosamente,
   * o create efetivava com NULL em id_pedido/id_organizacao/id_workspace
   * (campos obrigatorios) → erro NOT NULL ou pedido invisivel.
   *
   * Agora alinhado com schema (fragment.prisma:15 — Pedido):
   *   id_pedido, id_organizacao, id_workspace, tipo_operacao_pedido,
   *   status_pedido, id_importacao_exportador_pedido, id_fabricante_pedido,
   *   incoterm_pedido, moeda_pedido, data_emissao_pedido, casas_decimais_*.
   * Tambem leu data_emissao do nome legado `data_emissao_pedido` (idem).
   */
  private montarDadosPedido(
    dados: Record<string, unknown>,
    tenantId: string,
    companyId: string,
    casas = CASAS_DECIMAIS_PADRAO,
    ordemPlanilha?: OpcoesOrdemPlanilhaImportacao,
  ): Record<string, unknown> {
    // P1.3 — validar enum tipo_operacao_pedido para evitar valores arbitrarios.
    // SSOT (campos-pedido-ddd.ts) usa `tipo_operacao` como nome do campo no
    // upload; schema usa `tipo_operacao_pedido`. Aceitamos ambos no `dados[]`
    // por tolerancia (preview pode ter usado um ou outro alias).
    const TIPOS_OPERACAO_VALIDOS = ['importacao', 'exportacao'] as const
    const tipoOperacaoRaw = (dados['tipo_operacao_pedido'] ?? dados['tipo_operacao']) as string | undefined
    const tipoOperacao = TIPOS_OPERACAO_VALIDOS.includes(tipoOperacaoRaw as typeof TIPOS_OPERACAO_VALIDOS[number])
      ? tipoOperacaoRaw as string
      : 'importacao'

    const dataEmissaoPlanilha = normalizarData(dados['data_emissao_pedido'])

    // ── Campos obrigatórios (sempre incluídos) ──────────────────────────────
    const result: Record<string, unknown> = {
      id_pedido:                        gerarId('pedi'),
      id_organizacao:                   tenantId,
      id_workspace:                     companyId,
      numero_pedido:                    String(dados['numero_pedido'] ?? `IMP-${Date.now()}`),
      tipo_operacao_pedido:             tipoOperacao,
      status_pedido:                    'rascunho',
      moeda_pedido:                     extrairCodigoDropdown(dados['moeda_pedido'] ?? 'USD'),
      data_emissao_pedido:              ordemPlanilha
        ? dataEmissaoPorOrdemPlanilha(ordemPlanilha.primeiraLinhaPlanilha, ordemPlanilha.anchorImportacaoMs)
        : (dataEmissaoPlanilha ?? new Date().toISOString()),
      casas_decimais_valor_pedido:      casas.valor,
      casas_decimais_quantidade_pedido: casas.quantidade,
      casas_decimais_peso_pedido:       casas.peso ?? 3,
      casas_decimais_cubagem_pedido:    casas.cubagem ?? 3,
    }

    // ── Campos String opcionais — só incluir se tiverem valor real ───────────
    if (dados['id_importacao_exportador_pedido']) result.id_importacao_exportador_pedido = String(dados['id_importacao_exportador_pedido'])
    if (dados['id_exportacao_importador_pedido']) result.id_exportacao_importador_pedido = String(dados['id_exportacao_importador_pedido'])
    if (dados['id_fabricante_pedido']) result.id_fabricante_pedido = String(dados['id_fabricante_pedido'])
    if (dados['incoterm_pedido'] ?? dados['incoterm']) result.incoterm_pedido = String(dados['incoterm_pedido'] ?? dados['incoterm'])
    if (dados['unidade_comercializada_pedido']) result.unidade_comercializada_pedido = extrairCodigoDropdown(dados['unidade_comercializada_pedido'])
    if (dados['condicao_pagamento_pedido']) result.condicao_pagamento_pedido = String(dados['condicao_pagamento_pedido'])
    if (dados['numero_proforma_pedido']) result.numero_proforma_pedido = String(dados['numero_proforma_pedido'])
    if (dados['numero_invoice_pedido']) result.numero_invoice_pedido = String(dados['numero_invoice_pedido'])
    if (dados['referencia_importador_pedido']) result.referencia_importador_pedido = String(dados['referencia_importador_pedido'])
    if (dados['referencia_exportador_pedido']) result.referencia_exportador_pedido = String(dados['referencia_exportador_pedido'])
    if (dados['referencia_fabricante_pedido']) result.referencia_fabricante_pedido = String(dados['referencia_fabricante_pedido'])
    if (dados['moeda_cambio_pedido']) result.moeda_cambio_pedido = extrairCodigoDropdown(dados['moeda_cambio_pedido'])
    if (dados['contrato_cambio_id_pedido']) result.contrato_cambio_id_pedido = String(dados['contrato_cambio_id_pedido'])
    if (dados['cnpj_importador_pedido']) result.cnpj_importador_pedido = String(dados['cnpj_importador_pedido'])
    if (dados['cobertura_cambial_pedido']) result.cobertura_cambial_pedido = String(dados['cobertura_cambial_pedido'])
    // Logística — SSOT usa 'porto_origem_pedido', Prisma usa 'porto_origem'
    if (dados['porto_origem_pedido'] ?? dados['porto_origem']) result.porto_origem = String(dados['porto_origem_pedido'] ?? dados['porto_origem']).toUpperCase()
    if (dados['porto_destino_pedido'] ?? dados['porto_destino']) result.porto_destino = String(dados['porto_destino_pedido'] ?? dados['porto_destino']).toUpperCase()
    if (dados['local_de_origem_pedido'] ?? dados['local_de_origem']) result.local_de_origem = String(dados['local_de_origem_pedido'] ?? dados['local_de_origem']).toUpperCase()
    if (dados['local_de_destino_pedido'] ?? dados['local_de_destino']) result.local_de_destino = String(dados['local_de_destino_pedido'] ?? dados['local_de_destino']).toUpperCase()
    if (dados['aeroporto_origem_pedido'] ?? dados['aeroporto_origem']) result.aeroporto_origem = String(dados['aeroporto_origem_pedido'] ?? dados['aeroporto_origem']).toUpperCase()
    if (dados['aeroporto_destino_pedido'] ?? dados['aeroporto_destino']) result.aeroporto_destino = String(dados['aeroporto_destino_pedido'] ?? dados['aeroporto_destino']).toUpperCase()

    // ── Campos numéricos (Decimal) opcionais ────────────────────────────────
    if (dados['taxa_cambio_estimada_pedido']) result.taxa_cambio_estimada_pedido = parseNumeroBr(dados['taxa_cambio_estimada_pedido'])
    if (dados['peso_liquido_total_pedido']) result.peso_liquido_total_pedido = parseNumeroBr(dados['peso_liquido_total_pedido'])
    if (dados['peso_bruto_total_pedido']) result.peso_bruto_total_pedido = parseNumeroBr(dados['peso_bruto_total_pedido'])
    if (dados['cubagem_total_pedido']) result.cubagem_total_pedido = parseNumeroBr(dados['cubagem_total_pedido'])

    // ── Campos Int opcionais ────────────────────────────────────────────────
    if (dados['quantidade_volumes_pedido']) result.quantidade_volumes_pedido = Math.round(parseNumeroBr(dados['quantidade_volumes_pedido']))
    const valorTotalPed = parseNumeroBrOpcional(dados['valor_total_pedido'] ?? dados['valor_total_item'])
    if (valorTotalPed !== null && !dados['part_number_item']) {
      result.valor_total_pedido = valorTotalPed
    }

    // ── Campos DateTime opcionais — todas as datas do Pedido ────────────────
    const DATAS_PEDIDO: string[] = [
      'data_documento_pedido',
      'data_documento_proforma_pedido',
      'data_documento_invoice_pedido',
      'data_consolidacao_pedido',
      'data_prevista_pedido_pronto',
      'data_confirmada_pedido_pronto',
      'data_meta_pedido_pronto',
      'data_prevista_inspecao_pedido',
      'data_confirmada_inspecao_pedido',
      'data_meta_inspecao_pedido',
      'data_prevista_coleta_pedido',
      'data_confirmada_coleta_pedido',
      'data_meta_coleta_pedido',
      // Draft Pedido — Recebimento + Aprovação
      'data_previsao_recebimento_rascunho_pedido',
      'data_confirmacao_recebimento_rascunho_pedido',
      'data_meta_recebimento_rascunho_pedido',
      'data_previsao_aprovacao_rascunho_pedido',
      'data_confirmacao_aprovacao_rascunho_pedido',
      'data_meta_aprovacao_rascunho_pedido',
      // Draft Proforma — Recebimento + Aprovação + Envio Original + Recebimento Original
      'data_previsao_recebimento_rascunho_proforma_pedido',
      'data_confirmacao_recebimento_rascunho_proforma_pedido',
      'data_meta_recebimento_rascunho_proforma_pedido',
      'data_previsao_aprovacao_rascunho_proforma_pedido',
      'data_confirmacao_aprovacao_rascunho_proforma_pedido',
      'data_meta_aprovacao_rascunho_proforma_pedido',
      'data_previsao_envio_original_proforma_pedido',
      'data_confirmacao_envio_original_proforma_pedido',
      'data_meta_envio_original_proforma_pedido',
      'data_previsao_recebimento_original_proforma_pedido',
      'data_confirmacao_recebimento_original_proforma_pedido',
      'data_meta_recebimento_original_proforma_pedido',
      // Draft Invoice — Recebimento + Aprovação + Envio Original + Recebimento Original
      'data_previsao_recebimento_rascunho_invoice_pedido',
      'data_confirmacao_recebimento_rascunho_invoice_pedido',
      'data_meta_recebimento_rascunho_invoice_pedido',
      'data_previsao_aprovacao_rascunho_invoice_pedido',
      'data_confirmacao_aprovacao_rascunho_invoice_pedido',
      'data_meta_aprovacao_rascunho_invoice_pedido',
      'data_previsao_envio_original_invoice_pedido',
      'data_confirmacao_envio_original_invoice_pedido',
      'data_meta_envio_original_invoice_pedido',
      'data_previsao_recebimento_original_invoice_pedido',
      'data_confirmacao_recebimento_original_invoice_pedido',
      'data_meta_recebimento_original_invoice_pedido',
      // Edição em Massa — datas extras
      'data_embarque_origem',
      'data_proforma_invoice',
      'data_invoice',
      'data_transferencia_saldo_pedido',
    ]
    for (const campo of DATAS_PEDIDO) {
      const val = normalizarData(dados[campo])
      if (val) result[campo] = val
    }

    // ── JSON — OPE (detalhes operacionais) ──────────────────────────────────
    // Campos OPE do SSOT não têm coluna própria no Prisma — são armazenados
    // como JSON em `detalhes_operacionais_pedido`.
    const CAMPOS_OPE = [
      'codigo_ope', 'nome_ope', 'endereco_ope', 'pais_ope',
      'estado_ope', 'cidade_ope', 'zip_code_ope', 'tin_ope',
      'email_ope', 'situacao_ope', 'versao_ope', 'cnpj_raiz_empresa_responsavel',
    ]
    const ope: Record<string, string> = {}
    for (const campo of CAMPOS_OPE) {
      if (dados[campo]) ope[campo] = String(dados[campo])
    }
    if (Object.keys(ope).length > 0) result.detalhes_operacionais_pedido = ope

    // ── JSON — dados extras (campos sem coluna própria no Prisma) ────────────
    // Exportador, Importador (nome), Fabricante (detalhes), Contato — vão para
    // `dados_extras_importacao_pedido` como JSON enriquecido.
    const CAMPOS_EXTRAS_PEDIDO = [
      'nome_exportador', 'endereco_exportador', 'pais_exportador',
      'estado_exportador', 'cidade_exportador', 'zip_code_exportador',
      'exportador_ou_fabricante', 'relacao_exportador_fabricante',
      'nome_contato_exportador', 'email_contato_exportador',
      'whatsapp_contato_exportador', 'cargo_contato_exportador',
      'departamento_contato_exportador',
      'nome_importador',
      'nome_fabricante', 'endereco_fabricante', 'pais_fabricante',
      'estado_fabricante', 'cidade_fabricante', 'zip_code_fabricante',
    ]
    const extras: Record<string, string> = {}
    for (const campo of CAMPOS_EXTRAS_PEDIDO) {
      if (dados[campo]) extras[campo] = String(dados[campo])
    }
    if (ordemPlanilha && dataEmissaoPlanilha) {
      extras._data_emissao_planilha = dataEmissaoPlanilha
    }
    // Merge com _campos_extras existentes (campos que não mapearam para nenhum nome conhecido)
    if (dados['_campos_extras'] && typeof dados['_campos_extras'] === 'object') {
      Object.assign(extras, dados['_campos_extras'])
    }
    if (Object.keys(extras).length > 0) result.dados_extras_importacao_pedido = extras

    return result
  }

  /**
   * Monta payload COMPLETO de um PedidoItem para `pedidoItem.create()` standalone.
   * Usa inclusão condicional (omitir undefined) para evitar drift do Prisma client.
   * O chamador deve adicionar `pedido_item: { connect: ... }` ao resultado.
   */
  private montarDadosItem(dados: Record<string, unknown>, tenantId: string, companyId: string, casas = CASAS_DECIMAIS_PADRAO, seqPadrao = 1): Record<string, unknown> {
    const itemData: Record<string, unknown> = {
      id_item:                       gerarId('pite'),
      id_organizacao:                tenantId,
      id_workspace:                  companyId,
      // Sequencia vem da ordem das linhas no arquivo (seqPadrao), nunca da coluna da planilha
      // (templates Detroit usam 174, 175… como referencia ERP — lista deve mostrar 1, 2, 3…).
      sequencia_item_pedido:         seqPadrao,
      part_number_item:              String(dados['part_number_item'] ?? ''),
      ncm_item:                      formatarNcm(dados['ncm_item']),
      descricao_item:                String(dados['descricao_item'] ?? ''),
      quantidade_inicial_item:       parseNumeroBr(dados['quantidade_inicial_item'], 0),
      quantidade_atual_item:         parseNumeroBr(dados['quantidade_inicial_item'], 0),
      casas_decimais_quantidade_item: casas.quantidade,
      moeda_item:                    extrairCodigoDropdown(dados['moeda_item'] ?? dados['moeda_pedido'] ?? 'USD'),
      casas_decimais_valor_item:     casas.valor,
      casas_decimais_peso_item:      casas.peso ?? 3,
      casas_decimais_cubagem_item:   casas.cubagem ?? 3,
    }

    // ── Campos String opcionais ───────────────────────────────────────────
    if (dados['tipo_operacao_item'] ?? dados['tipo_operacao']) itemData.tipo_operacao_item = String(dados['tipo_operacao_item'] ?? dados['tipo_operacao'])
    if (dados['unidade_comercializada_item']) itemData.unidade_comercializada_item = extrairCodigoDropdown(dados['unidade_comercializada_item'])
    if (dados['cobertura_cambial_item']) itemData.cobertura_cambial_item = String(dados['cobertura_cambial_item'])
    if (dados['nome_exportador_item'] ?? dados['nome_exportador']) itemData.nome_exportador_item = String(dados['nome_exportador_item'] ?? dados['nome_exportador'])
    if (dados['nome_importador_item'] ?? dados['nome_importador']) itemData.nome_importador_item = String(dados['nome_importador_item'] ?? dados['nome_importador'])
    if (dados['nome_fabricante_item'] ?? dados['nome_fabricante']) itemData.nome_fabricante_item = String(dados['nome_fabricante_item'] ?? dados['nome_fabricante'])
    if (dados['referencia_importador_item']) itemData.referencia_importador_item = String(dados['referencia_importador_item'])
    if (dados['referencia_exportador_item']) itemData.referencia_exportador_item = String(dados['referencia_exportador_item'])
    if (dados['referencia_fabricante_item']) itemData.referencia_fabricante_item = String(dados['referencia_fabricante_item'])
    if (dados['incoterm_item'] ?? dados['incoterm_pedido']) itemData.incoterm_item = String(dados['incoterm_item'] ?? dados['incoterm_pedido'])
    if (dados['condicao_pagamento_item'] ?? dados['condicao_pagamento_pedido']) itemData.condicao_pagamento_item = String(dados['condicao_pagamento_item'] ?? dados['condicao_pagamento_pedido'])
    if (dados['peso_liquido_unidade_item']) itemData.peso_liquido_unidade_item = String(dados['peso_liquido_unidade_item'])
    if (dados['peso_bruto_unidade_item']) itemData.peso_bruto_unidade_item = String(dados['peso_bruto_unidade_item'])
    if (dados['cubagem_unidade_item']) itemData.cubagem_unidade_item = String(dados['cubagem_unidade_item'])
    // Edição em Massa — campos texto
    if (dados['descricao_completa_item_pt']) itemData.descricao_completa_item_pt = String(dados['descricao_completa_item_pt'])
    if (dados['descricao_completa_item_en']) itemData.descricao_completa_item_en = String(dados['descricao_completa_item_en'])
    if (dados['descricao_completa_item_es']) itemData.descricao_completa_item_es = String(dados['descricao_completa_item_es'])
    if (dados['descricao_completa_item_nf']) itemData.descricao_completa_item_nf = String(dados['descricao_completa_item_nf'])
    if (dados['texto_posicao_ncm']) itemData.texto_posicao_ncm = String(dados['texto_posicao_ncm'])
    if (dados['grupo_item']) itemData.grupo_item = String(dados['grupo_item'])
    if (dados['subgrupo_item']) itemData.subgrupo_item = String(dados['subgrupo_item'])
    if (dados['campo_especial_item']) itemData.campo_especial_item = String(dados['campo_especial_item'])
    if (dados['atributos_catalogo']) itemData.atributos_catalogo = String(dados['atributos_catalogo'])
    if (dados['tipo_embalagem']) itemData.tipo_embalagem = String(dados['tipo_embalagem'])
    if (dados['numero_lpco']) itemData.numero_lpco = String(dados['numero_lpco'])
    if (dados['numero_certificado_origem']) itemData.numero_certificado_origem = String(dados['numero_certificado_origem'])

    // ── Campos numéricos (Decimal) opcionais ──────────────────────────────
    const valorUnit = parseNumeroBrOpcional(dados['valor_por_unidade_item'])
    if (valorUnit !== null) itemData.valor_por_unidade_item = valorUnit
    const valorTotal = parseNumeroBrOpcional(dados['valor_total_item'])
    if (valorTotal !== null) itemData.valor_total_item = valorTotal
    const pesoLiq = parseNumeroBrOpcional(dados['peso_liquido_unitario_item'])
    if (pesoLiq !== null) itemData.peso_liquido_unitario_item = pesoLiq
    const pesoBruto = parseNumeroBrOpcional(dados['peso_bruto_unitario_item'])
    if (pesoBruto !== null) itemData.peso_bruto_unitario_item = pesoBruto
    const cubagem = parseNumeroBrOpcional(dados['cubagem_unitaria_item'])
    if (cubagem !== null) itemData.cubagem_unitaria_item = cubagem
    const qtdTransf = parseNumeroBrOpcional(dados['quantidade_transferida_item'])
    if (qtdTransf !== null) itemData.quantidade_transferida_item = qtdTransf
    // SSOT usa 'quantidade_pronta_total_item', Prisma usa 'quantidade_pronta_item'
    const qtdPronta = parseNumeroBrOpcional(dados['quantidade_pronta_total_item'] ?? dados['quantidade_pronta_item'])
    if (qtdPronta !== null) itemData.quantidade_pronta_item = qtdPronta
    const qtdCancel = parseNumeroBrOpcional(dados['quantidade_cancelada_item'])
    if (qtdCancel !== null) itemData.quantidade_cancelada_item = qtdCancel

    // ── Campos DateTime opcionais — todas as datas do Item ────────────────
    const DATAS_ITEM: string[] = [
      'data_emissao_item',
      'data_consolidacao_item',
      'data_prevista_item_pronto',
      'data_confirmada_item_pronto',
      'data_meta_item_pronto',
      'data_prevista_inspecao_item',
      'data_confirmada_inspecao_item',
      'data_meta_inspecao_item',
      'data_prevista_coleta_item',
      'data_confirmada_coleta_item',
      'data_meta_coleta_item',
      // Rascunho Pedido — Recebimento + Aprovação
      'data_previsao_recebimento_rascunho_item',
      'data_confirmacao_recebimento_rascunho_item',
      'data_meta_recebimento_rascunho_item',
      'data_previsao_aprovacao_rascunho_item',
      'data_confirmacao_aprovacao_rascunho_item',
      'data_meta_aprovacao_rascunho_item',
      // Documento Pedido
      'data_documento_item',
      // Proforma — Recebimento Rascunho + Aprovação + Envio Original + Recebimento Original + Documento
      'data_previsao_recebimento_rascunho_proforma_item',
      'data_confirmacao_recebimento_rascunho_proforma_item',
      'data_meta_recebimento_rascunho_proforma_item',
      'data_previsao_aprovacao_rascunho_proforma_item',
      'data_confirmacao_aprovacao_rascunho_proforma_item',
      'data_meta_aprovacao_rascunho_proforma_item',
      'data_previsao_envio_original_proforma_item',
      'data_confirmacao_envio_original_proforma_item',
      'data_meta_envio_original_proforma_item',
      'data_previsao_recebimento_original_proforma_item',
      'data_confirmacao_recebimento_original_proforma_item',
      'data_meta_recebimento_original_proforma_item',
      'data_documento_proforma_item',
      // Invoice — Recebimento Rascunho + Aprovação + Envio Original + Recebimento Original + Documento
      'data_previsao_recebimento_rascunho_invoice_item',
      'data_confirmacao_recebimento_rascunho_invoice_item',
      'data_meta_recebimento_rascunho_invoice_item',
      'data_previsao_aprovacao_rascunho_invoice_item',
      'data_confirmacao_aprovacao_rascunho_invoice_item',
      'data_meta_aprovacao_rascunho_invoice_item',
      'data_previsao_envio_original_invoice_item',
      'data_confirmacao_envio_original_invoice_item',
      'data_meta_envio_original_invoice_item',
      'data_previsao_recebimento_original_invoice_item',
      'data_confirmacao_recebimento_original_invoice_item',
      'data_meta_recebimento_original_invoice_item',
      'data_documento_invoice_item',
      // Outras datas replicáveis
      'data_consolidacao_pedido_replicada_item',
      'data_transferencia_saldo_item',
      // Edição em Massa
      'data_certificado_origem',
      'data_embarque_item',
    ]
    for (const campo of DATAS_ITEM) {
      // SSOT pode usar variantes de nome (ex: 'data_embarque_item_pedido' → Prisma 'data_embarque_item')
      const val = normalizarData(dados[campo])
      if (val) itemData[campo] = val
    }
    // Tratar alias SSOT 'data_embarque_item_pedido' → Prisma 'data_embarque_item'
    if (!itemData['data_embarque_item'] && dados['data_embarque_item_pedido']) {
      const val = normalizarData(dados['data_embarque_item_pedido'])
      if (val) itemData.data_embarque_item = val
    }

    // ── Extrair campos Prisma extras (não estão no SSOT) ─────────────────
    // Campos "Edição em Massa" existem no Prisma mas não no SSOT. Podem chegar
    // por 2 caminhos: (a) mapeados via Tier 2.5 direto em dados[campo], ou
    // (b) em _campos_extras (quando o mapper não reconhecia o header).
    // Verificamos ambos.
    const CAMPOS_EXTRAS_COM_COLUNA_PROPRIA: string[] = [
      'descricao_completa_item_pt', 'descricao_completa_item_en',
      'descricao_completa_item_es', 'descricao_completa_item_nf',
      'texto_posicao_ncm', 'grupo_item', 'subgrupo_item',
      'campo_especial_item', 'atributos_catalogo', 'tipo_embalagem',
      'numero_lpco', 'numero_certificado_origem',
    ]
    const DATAS_EXTRAS_COM_COLUNA: string[] = ['data_certificado_origem', 'data_embarque_item']

    // (a) Extrair de dados[] direto (Tier 2.5 do mapper)
    for (const campo of CAMPOS_EXTRAS_COM_COLUNA_PROPRIA) {
      if (dados[campo] && !itemData[campo]) {
        itemData[campo] = String(dados[campo])
      }
    }
    for (const campo of DATAS_EXTRAS_COM_COLUNA) {
      if (dados[campo] && !itemData[campo]) {
        const val = normalizarData(dados[campo])
        if (val) itemData[campo] = val
      }
    }

    // (b) Extrair de _campos_extras (fallback para mappers antigos)
    const extras = (dados['_campos_extras'] && typeof dados['_campos_extras'] === 'object')
      ? { ...(dados['_campos_extras'] as Record<string, unknown>) }
      : null

    if (extras) {
      for (const campo of CAMPOS_EXTRAS_COM_COLUNA_PROPRIA) {
        if (extras[campo] && !itemData[campo]) {
          itemData[campo] = String(extras[campo])
          delete extras[campo]
        }
      }
      for (const campo of DATAS_EXTRAS_COM_COLUNA) {
        if (extras[campo] && !itemData[campo]) {
          const val = normalizarData(extras[campo])
          if (val) {
            itemData[campo] = val
            delete extras[campo]
          }
        }
      }
      // Guardar os restantes que não têm coluna própria
      if (Object.keys(extras).length > 0) {
        itemData.dados_extras_importacao_item = extras
      }
    }

    return itemData
  }

  /**
   * Monta payload de item para uso INLINE dentro de `pedido.create({ data: { itens_pedido: { create: [...] } } })`.
   * Diferença do `montarDadosItem`: não inclui `pedido_item: { connect }` (Prisma infere da relação aninhada),
   * e campos null são aceitos (Prisma nested create tolera null em opcionais).
   */
  private montarDadosItemInline(dados: Record<string, unknown>, tenantId: string, companyId: string, casas = CASAS_DECIMAIS_PADRAO, seqPadrao = 1): Record<string, unknown> {
    // Reutiliza montarDadosItem e remove o campo de relação (não aplicável em nested create)
    const itemData = this.montarDadosItem(dados, tenantId, companyId, casas, seqPadrao)
    delete itemData.pedido_item
    return itemData
  }

  /** Renumera itens do pedido para 1..N contíguo, preservando ordem atual. */
  private async resequenciarItensPedido(tenantId: string, pedidoId: string): Promise<void> {
    const itens = await (this.db as Record<string, any>)['pedidoItem'].findMany({
      where: { id_pedido: pedidoId, id_organizacao: tenantId },
      orderBy: { sequencia_item_pedido: 'asc' },
      select: { id_item: true, sequencia_item_pedido: true },
    }) as Array<{ id_item: string; sequencia_item_pedido: number | null }>

    for (let i = 0; i < itens.length; i++) {
      const seqCorreta = i + 1
      if (Number(itens[i].sequencia_item_pedido) !== seqCorreta) {
        await (this.db as Record<string, any>)['pedidoItem'].update({
          where: { id_item: itens[i].id_item },
          data: { sequencia_item_pedido: seqCorreta },
        })
      }
    }
  }

  private async buscarDuplicatasNoSistema(tenantId: string, numeros: string[]): Promise<Set<string>> {
    if (numeros.length === 0) return new Set()
    try {
      const existentes = await this.db['pedido'].findMany({
        where: { id_organizacao: tenantId, numero_pedido: { in: numeros } },
        select: { numero_pedido: true },
      })
      return new Set((existentes as { numero_pedido: string }[]).map(p => p.numero_pedido))
    } catch {
      return new Set()
    }
  }
}
