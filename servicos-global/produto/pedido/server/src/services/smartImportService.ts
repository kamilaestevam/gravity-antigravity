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
import { CAMPOS_PEDIDO_DDD_TODOS, type CampoPedidoDDD } from '../../../shared/campos-pedido-ddd.js'

function gerarId(prefixo: string): string {
  const seq = String(Math.floor(Math.random() * 9999999)).padStart(7, '0')
  const ano = String(new Date().getFullYear()).slice(-2)
  return `${prefixo}_id_${seq}/${ano}`
}

// Converte strings de data (YYYY-MM-DD, DD/MM/YYYY, etc.) para ISO-8601 DateTime
function normalizarData(valor: unknown): string {
  if (!valor) return new Date().toISOString()
  const str = String(valor).trim()
  // Já é ISO completo
  if (/^\d{4}-\d{2}-\d{2}T/.test(str)) return str
  // YYYY-MM-DD → adiciona T00:00:00.000Z
  if (/^\d{4}-\d{2}-\d{2}$/.test(str)) return `${str}T00:00:00.000Z`
  // DD/MM/YYYY
  const dmyMatch = str.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/)
  if (dmyMatch) return `${dmyMatch[3]}-${dmyMatch[2].padStart(2, '0')}-${dmyMatch[1].padStart(2, '0')}T00:00:00.000Z`
  // Tentar parse genérico
  const parsed = new Date(str)
  return isNaN(parsed.getTime()) ? new Date().toISOString() : parsed.toISOString()
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
    const { linhas: linhasBrutas, extrator_usado } = await parseArquivo(buffer, nomeArquivo, nomePlanilha)
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

    // Amostra para exemplo_valor (usada tanto na memória quanto no mapearComIA)
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
        exemplo_valor: exemplosPorColuna[m.coluna_arquivo] ?? null,
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
    const linhasMapeadas = linhasBrutas.map((linha, i) =>
      this.aplicarMapeamento(linha, mapeamento, i + 2) // linha 1 = cabecalho
    )

    // 6. Agrupar por numero_pedido para contagem
    const pedidosUnicos = new Set(
      linhasMapeadas.map(l => l.numero_pedido).filter(Boolean)
    )

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

    const dados_brutos = linhasBrutas.map((row, i) => ({
      linha: i + 2, // linha 1 = cabeçalho
      valores: Object.fromEntries(
        Object.entries(row).map(([k, v]) => [k, String(v ?? '')])
      ),
    }))

    return {
      total_linhas:    linhasComCoerencia.length,
      total_pedidos:   pedidosUnicos.size,
      total_itens:     linhasBrutas.length,
      mapeamento,
      confianca_global: Math.round(confiancaGlobal),
      memoria_aplicada: memoriaAplicada,
      preview_id:      previewId,
      linhas:          linhasComCoerencia,
      limite_excedido: linhasComCoerencia.length > LIMITE_LINHAS_AVISO,
      extrator_usado,
      dados_brutos,
    }
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
  ): Promise<SmartImportResultado> {
    // SEC — Garantir que o preview pertence ao tenant (defense in depth além da rota)
    if (!payload.preview_id.startsWith(tenantId + '-')) {
      throw new AppError('Preview nao pertence a este tenant', 403, 'UNAUTHORIZED_PREVIEW')
    }
    const cached = previewCache.get(payload.preview_id)

    // Usar linhas do cache; fallback stateless para multi-instancia (P0.3)
    const linhasParaUsar: SmartImportLinha[] = cached
      ? cached.data
      : (payload.linhas ?? []).length > 0
        ? payload.linhas as unknown as SmartImportLinha[]
        : payload.linhas_incluidas.map(n => ({
            linha_arquivo: n,
            numero_pedido: null,
            status: 'ok' as const,
            alertas: [],
            dados: {},
          }))

    const linhasFiltradas = linhasParaUsar.filter(l =>
      payload.linhas_incluidas.includes(l.linha_arquivo)
    )

    const criados:    string[] = []
    const atualizados: number[] = []
    const pulados:     number[] = []
    const erros:       { linha: number; motivo: string }[] = []

    // Ler casas decimais do workspace para aplicar nos registros criados
    const casasConfig = await this.lerCasasDecimais(tenantId)

    await this.db.$transaction(async (tx: Record<string, unknown>) => {
      for (const linha of linhasFiltradas) {
        try {
          // Aplicar numero editado pelo usuario (SEC.1 / Problema 6)
          const numeroEditado = payload.numeros_editados?.[linha.linha_arquivo]
          const dados = { ...linha.dados }
          if (numeroEditado) dados['numero_pedido'] = numeroEditado

          // Validar valor_por_unidade_item não-negativo
          const valorUnitRaw = dados['valor_por_unidade_item']
          if (valorUnitRaw !== undefined && valorUnitRaw !== null && valorUnitRaw !== '') {
            const valorUnit = Number(valorUnitRaw)
            if (!isNaN(valorUnit) && valorUnit < 0) {
              erros.push({ linha: linha.linha_arquivo, motivo: 'Valor unitario do item nao pode ser negativo' })
              continue
            }
          }

          const numeroPedido = (dados['numero_pedido'] as string) || linha.numero_pedido

          // Aplicar decisao de duplicata
          if (numeroPedido && payload.decisoes_duplicatas[numeroPedido] === 'pular') {
            pulados.push(linha.linha_arquivo)
            continue
          }

          const dadosPedido = this.montarDadosPedido(dados, tenantId, companyId ?? tenantId, casasConfig)

          if (numeroPedido && payload.decisoes_duplicatas[numeroPedido] === 'sobrescrever') {
            // Atualizar pedido existente
            const existente = await (tx as Record<string, any>)['pedido'].findFirst({
              where: { numero_pedido: numeroPedido, tenant_id: tenantId },
            })
            if (existente) {
              await (tx as Record<string, any>)['pedido'].update({
                where: { id: existente.id },
                data:  dadosPedido,
              })
              atualizados.push(linha.linha_arquivo)
              continue
            }
          }

          // Verificar se já existe pedido com este número (para importação incremental de itens)
          const numeroPedidoFinal = payload.numeros_editados?.[linha.linha_arquivo] ?? numeroPedido

          if (numeroPedidoFinal && !payload.decisoes_duplicatas[numeroPedidoFinal]) {
            // Tentar encontrar pedido existente para append incremental de item
            const pedidoExistente = await (tx as Record<string, any>)['pedido'].findFirst({
              where: { numero_pedido: numeroPedidoFinal, tenant_id: tenantId, status: { not: 'cancelado' } },
              select: { id: true },
            })

            if (pedidoExistente && (dados['part_number'] || dados['descricao_item'])) {
              // Calcular próxima sequencia_item no pedido existente
              const itemCountExistente = await (tx as Record<string, any>)['pedidoItem'].count({
                where: { pedido_id: pedidoExistente.id, tenant_id: tenantId },
              })
              // Adicionar item ao pedido existente — .catch(() => null) para graceful fallback
              // (ex: unique constraint já satisfeita → pedido já atualizado, segue em frente)
              await (tx as Record<string, any>)['pedidoItem'].create({
                data: {
                  id:                  gerarId('pite'),
                  tenant_id:           tenantId,
                  company_id:          companyId ?? tenantId,
                  pedido_id:           pedidoExistente.id,
                  sequencia_item:      dados['sequencia_item'] ? Number(dados['sequencia_item']) : itemCountExistente + 1,
                  part_number:         String(dados['part_number'] ?? ''),
                  ncm:                 String(dados['ncm'] ?? ''),
                  descricao_item:      String(dados['descricao_item'] ?? ''),
                  quantidade_inicial_pedido: Number(dados['quantidade_inicial_pedido'] ?? 0),
                  quantidade_atual_pedido:             Number(dados['quantidade_inicial_pedido'] ?? 0),
                  casas_decimais_quantidade_item: casasConfig.quantidade,
                  unidade_comercializada_item:   dados['unidade_comercializada_item'] ? String(dados['unidade_comercializada_item']) : null,
                  moeda_item:                String(dados['moeda_pedido'] ?? 'USD'),
                  valor_por_unidade_item:        dados['valor_por_unidade_item'] ? Number(dados['valor_por_unidade_item']) : null,
                  valor_total_item:          dados['valor_total_item'] ? Number(dados['valor_total_item']) : null,
                  peso_liquido_unitario: dados['peso_liquido_unitario'] ? Number(dados['peso_liquido_unitario']) : null,
                  referencia_exportador:      dados['referencia_exportador'] ? String(dados['referencia_exportador']) : null,
                  casas_decimais_valor_item:  casasConfig.valor,
                  campos_custom:             dados['_campos_extras'] ? dados['_campos_extras'] : null,
                },
              }).catch(() => null)
              atualizados.push(linha.linha_arquivo)
              continue
            }
          }

          // Criar pedido novo com o item da linha atual
          const itemPayload = (dados['part_number'] || dados['descricao_item']) ? {
            itens: {
              create: [{
                id:                  gerarId('pite'),
                tenant_id:           tenantId,
                company_id:          companyId ?? tenantId,
                sequencia_item:      dados['sequencia_item'] ? Number(dados['sequencia_item']) : 1,
                part_number:         String(dados['part_number'] ?? ''),
                ncm:                 String(dados['ncm'] ?? ''),
                descricao_item:      String(dados['descricao_item'] ?? ''),
                quantidade_inicial_pedido: Number(dados['quantidade_inicial_pedido'] ?? 0),
                quantidade_atual_pedido:             Number(dados['quantidade_inicial_pedido'] ?? 0),
                casas_decimais_quantidade_item: casasConfig.quantidade,
                unidade_comercializada_item:   dados['unidade_comercializada_item'] ? String(dados['unidade_comercializada_item']) : null,
                moeda_item:                String(dados['moeda_pedido'] ?? 'USD'),
                valor_por_unidade_item:        dados['valor_por_unidade_item'] ? Number(dados['valor_por_unidade_item']) : null,
                valor_total_item:          dados['valor_total_item'] ? Number(dados['valor_total_item']) : null,
                peso_liquido_unitario: dados['peso_liquido_unitario'] ? Number(dados['peso_liquido_unitario']) : null,
                referencia_exportador:      dados['referencia_exportador'] ? String(dados['referencia_exportador']) : null,
                casas_decimais_valor_item:  casasConfig.valor,
                campos_custom:             dados['_campos_extras'] ? dados['_campos_extras'] : null,
              }],
            },
          } : {}

          const novo = await (tx as Record<string, any>)['pedido'].create({
            data: { ...dadosPedido, ...itemPayload },
          })
          criados.push(novo.id)
        } catch (err: unknown) {
          erros.push({
            linha: linha.linha_arquivo,
            motivo: err instanceof Error ? err.message : 'Erro desconhecido',
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
    })

    // Popular agregado quantidade_total_pedido no pedido pai após criação dos itens
    if (criados.length > 0) {
      for (const pedidoId of criados) {
        const itens = await this.db['pedidoItem'].findMany({
          where: { pedido_id: pedidoId, tenant_id: tenantId },
          select: { quantidade_inicial_pedido: true },
        }) as { quantidade_inicial_pedido: number }[]
        const qtdTotal = itens.reduce((s, i) => s + Number(i.quantidade_inicial_pedido ?? 0), 0)
        await this.db['pedido'].update({
          where: { id: pedidoId },
          data: { quantidade_total_pedido: qtdTotal },
        }).catch(() => null) // campo opcional — não bloqueia se falhar
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

  private mapearComIA(cabecalhos: string[], amostra: LinhaArquivo[]): ColunaMapeadaBackend[] {
    const camposSistema = Object.keys(ALIASES_CAMPOS)

    return cabecalhos.map(cabecalho => {
      // Primeiro valor não-vazio da amostra
      const exemploValor = amostra
        .map(linha => linha[cabecalho])
        .find(v => v !== undefined && v !== null && String(v).trim() !== '')
        ?? null
      const exemploStr = exemploValor ? String(exemploValor).slice(0, 80) : null

      // Caso 1: coluna já é exatamente um campo do sistema (Gemini usa nomes internos)
      if (camposSistema.includes(cabecalho)) {
        return {
          coluna_arquivo: cabecalho,
          campo_sistema:  cabecalho,
          confianca:      99,
          nivel:          'auto' as const,
          inferido_por:   'ia' as const,
          exemplo_valor:  exemploStr,
        }
      }

      // Caso 2: matching por aliases (arquivos Excel/CSV com nomes humanos)
      // Normaliza camelCase, underscores e hífens: "pricePerUnit" → "price per unit"
      const cab = cabecalho.trim()
        .replace(/([a-z])([A-Z])/g, '$1 $2')
        .toLowerCase()
        .replace(/[_-]/g, ' ')
        .trim()
      let melhorCampo: string | null = null
      let melhorScore = 0

      for (const [campo, aliases] of Object.entries(ALIASES_CAMPOS)) {
        for (const alias of aliases) {
          if (cab === alias) { melhorCampo = campo; melhorScore = 97; break }
          // Partial match: alias ≥4 chars e coluna ≥3 chars para evitar falsos como "id" → "unid"
          if (alias.length >= 4 && cab.length >= 3 && (cab === alias || cab.includes(alias) || alias.includes(cab))) {
            const score = Math.round(70 + (Math.min(cab.length, alias.length) / Math.max(cab.length, alias.length)) * 25)
            if (score > melhorScore) { melhorCampo = campo; melhorScore = score }
          }
        }
        if (melhorScore >= 97) break
      }

      const nivel: ColunaMapeadaBackend['nivel'] =
        melhorScore >= 90 ? 'auto' :
        melhorScore >= 50 ? 'confirmado' :
        'ignorado'

      return {
        coluna_arquivo: cabecalho,
        campo_sistema:  melhorScore >= 30 ? melhorCampo : null,
        confianca:      melhorScore,
        nivel,
        inferido_por:   'ia',
        exemplo_valor:  exemploStr,
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
    const incoterms = ['FOB', 'CIF', 'EXW', 'DDP', 'DAP', 'FCA', 'CPT', 'CIP', 'DPU', 'FAS', 'CFR']
    if (amostras.every(v => incoterms.includes(v.toUpperCase().trim()))) {
      return { campo: 'incoterm', confianca: 92 }
    }

    // Detectar NCM (8 digitos)
    const ncmRegex = /^\d{4}[.\s]?\d{2}[.\s]?\d{2}$/
    if (amostras.filter(v => ncmRegex.test(v.trim())).length >= amostras.length * 0.7) {
      return { campo: 'ncm', confianca: 88 }
    }

    // Detectar moeda
    const moedas = ['USD', 'EUR', 'BRL', 'GBP', 'CNY', 'JPY', 'AUD', 'CAD']
    if (amostras.every(v => moedas.includes(v.toUpperCase().trim()))) {
      return { campo: 'moeda_pedido', confianca: 91 }
    }

    // Detectar data
    const dataRegex = /^\d{1,4}[-/]\d{1,2}[-/]\d{1,4}$/
    if (amostras.filter(v => dataRegex.test(v.trim())).length >= amostras.length * 0.8) {
      return { campo: 'data_embarque', confianca: 72 }
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

  private validarLinha(dados: Record<string, unknown>): SmartImportAlerta[] {
    const alertas: SmartImportAlerta[] = []

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

    if (!dados['numero_pedido']) {
      const partNumber = dados['part_number'] ? String(dados['part_number']) : ''
      const sugestao = partNumber ? ` Sugestao: usar Part Number "${partNumber}" como referencia` : ''
      alertas.push({
        campo: 'numero_pedido',
        tipo: 'obrigatorio_ausente',
        mensagem: `Numero do pedido ausente — sera gerado automaticamente.${sugestao}`,
        nivel: 'aviso',
      })
    }

    if (!dados['part_number']) {
      alertas.push({ campo: 'part_number', tipo: 'obrigatorio_ausente', mensagem: 'Part number ausente', nivel: 'aviso' })
    }

    const qty = Number(dados['quantidade_inicial_pedido'])
    if (dados['quantidade_inicial_pedido'] !== undefined && (isNaN(qty) || qty <= 0)) {
      alertas.push({ campo: 'quantidade_inicial_pedido', tipo: 'valor_negativo', mensagem: 'Quantidade deve ser maior que zero', nivel: 'erro' })
    }

    const val = Number(dados['valor_por_unidade_item'])
    if (dados['valor_por_unidade_item'] !== undefined && !isNaN(val) && val < 0) {
      alertas.push({ campo: 'valor_por_unidade_item', tipo: 'valor_negativo', mensagem: 'Valor unitario nao pode ser negativo', nivel: 'erro' })
    }

    const ncm = String(dados['ncm'] ?? '').replace(/[.\s-]/g, '')
    if (ncm && !/^\d{8}$/.test(ncm)) {
      alertas.push({
        campo: 'ncm',
        tipo: 'formato_invalido',
        mensagem: `NCM "${dados['ncm']}" invalido — deve ter 8 digitos numericos (ex: 84713019)`,
        nivel: 'aviso',
      })
    }

    const dataStr = String(dados['data_embarque'] ?? '')
    if (dataStr && isNaN(new Date(dataStr).getTime())) {
      alertas.push({ campo: 'data_embarque', tipo: 'formato_invalido', mensagem: 'Data de embarque com formato invalido', nivel: 'aviso' })
    }

    // ── Validacao de tipo de dados via SSOT (P1.1) ────────────────────────────
    // Para cada campo preenchido, valida conforme tipo declarado em CAMPOS_PEDIDO_DDD_TODOS:
    //   - tipo='data':   exige Date.parse() valido (DD/MM/YYYY, YYYY-MM-DD, ISO)
    //   - tipo='numero': exige Number(v) sem NaN (rejeita texto livre)
    //   - tipo='select': exige valor em opcoesSelect (case-insensitive)
    //   - tipo='texto':  sem validacao adicional (qualquer string aceita)
    // Pula campos ja validados especificamente acima (numero_pedido, part_number,
    // quantidade_inicial_pedido, valor_por_unidade_item, ncm, data_embarque,
    // tipo_linha, tipo_operacao) para evitar mensagens duplicadas.
    const CAMPOS_JA_VALIDADOS = new Set([
      'tipo_linha', 'tipo_operacao', 'numero_pedido', 'part_number',
      'quantidade_inicial_pedido', 'valor_por_unidade_item', 'ncm', 'data_embarque',
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
        // Aceita virgula como decimal (cultura BR) — converte antes de Number()
        const normalizado = valorStr.replace(',', '.')
        if (isNaN(Number(normalizado))) {
          alertas.push({
            campo: def.campo,
            tipo: 'formato_invalido',
            mensagem: `${def.rotulo}: numero invalido ("${valorStr}"). Esperado: numero (use ponto ou virgula como decimal)`,
            nivel: 'erro',
          })
        }
      } else if (def.tipo === 'select' && def.opcoesSelect && def.opcoesSelect.length > 0) {
        const valorLower = valorStr.toLowerCase()
        const opcoesLower = def.opcoesSelect.map(o => o.toLowerCase())
        if (!opcoesLower.includes(valorLower)) {
          alertas.push({
            campo: def.campo,
            tipo: 'formato_invalido',
            mensagem: `${def.rotulo}: valor invalido ("${valorStr}"). Aceitos: ${def.opcoesSelect.join(', ')}`,
            nivel: 'erro',
          })
        }
      }
    }

    return alertas
  }

  private montarDadosPedido(dados: Record<string, unknown>, tenantId: string, companyId: string, casas = CASAS_DECIMAIS_PADRAO): Record<string, unknown> {
    // P1.3 — validar enum tipo_operacao para evitar valores arbitrarios
    const TIPOS_OPERACAO_VALIDOS = ['importacao', 'exportacao'] as const
    const tipoOperacao = TIPOS_OPERACAO_VALIDOS.includes(dados['tipo_operacao'] as typeof TIPOS_OPERACAO_VALIDOS[number])
      ? dados['tipo_operacao'] as string
      : 'importacao'

    return {
      id:                gerarId('pedi'),
      tenant_id:         tenantId,
      company_id:        companyId,
      numero_pedido:     String(dados['numero_pedido'] ?? `IMP-${Date.now()}`),
      tipo_operacao:     tipoOperacao,
      status:            'draft',
      importacao_exportador_id: dados['exportador'] ? String(dados['exportador']) : null,
      fabricante_id:     dados['fabricante'] ? String(dados['fabricante']) : null,
      incoterm:          dados['incoterm'] ?? null,
      moeda_pedido:      dados['moeda_pedido'] ?? 'USD',
      data_emissao_pedido:             normalizarData(dados['data_emissao_pedido']),
      casas_decimais_valor_pedido:      casas.valor,
      casas_decimais_quantidade_pedido: casas.quantidade,
    }
  }

  private async buscarDuplicatasNoSistema(tenantId: string, numeros: string[]): Promise<Set<string>> {
    if (numeros.length === 0) return new Set()
    try {
      const existentes = await this.db['pedido'].findMany({
        where: { tenant_id: tenantId, numero_pedido: { in: numeros } },
        select: { numero_pedido: true },
      })
      return new Set((existentes as { numero_pedido: string }[]).map(p => p.numero_pedido))
    } catch {
      return new Set()
    }
  }
}
