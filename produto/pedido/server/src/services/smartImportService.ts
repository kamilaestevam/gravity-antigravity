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

function gerarId(prefixo: string): string {
  const seq = String(Math.floor(Math.random() * 9999999)).padStart(7, '0')
  const ano = String(new Date().getFullYear()).slice(-2)
  return `${prefixo}_id_${seq}/${ano}`
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

export class SmartImportService {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private db: Record<string, any>
  private memoriaService: MapeamentoMemoriaService

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  constructor(prismaClient: Record<string, any>) {
    this.db = prismaClient
    this.memoriaService = new MapeamentoMemoriaService(prismaClient)
  }

  async analisar(tenantId: string, buffer: Buffer, nomeArquivo: string, nomePlanilha?: string): Promise<SmartImportPreview> {
    // 1. Parse do arquivo
    const { linhas: linhasBrutas, extrator_usado } = await parseArquivo(buffer, nomeArquivo, nomePlanilha)
    if (linhasBrutas.length === 0) {
      throw new Error('Arquivo vazio ou sem dados validos')
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

    // 9. Salvar preview no cache
    const previewId = `${tenantId}-${hashColunas}-${Date.now()}`
    previewCache.set(previewId, {
      data: linhasComDuplicatas,
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
      total_linhas:    linhasComDuplicatas.length,
      total_pedidos:   pedidosUnicos.size,
      total_itens:     linhasBrutas.length,
      mapeamento,
      confianca_global: Math.round(confiancaGlobal),
      memoria_aplicada: memoriaAplicada,
      preview_id:      previewId,
      linhas:          linhasComDuplicatas,
      limite_excedido: linhasComDuplicatas.length > LIMITE_LINHAS_AVISO,
      extrator_usado,
      dados_brutos,
    }
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

          const dadosPedido = this.montarDadosPedido(dados, tenantId, companyId ?? tenantId)

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
                  sequencia_item:      itemCountExistente + 1,
                  part_number:         String(dados['part_number'] ?? ''),
                  ncm:                 String(dados['ncm'] ?? ''),
                  descricao_item:      String(dados['descricao_item'] ?? ''),
                  quantidade_inicial_pedido:  Number(dados['quantidade_inicial_item_pedido'] ?? 0),
                  quantidade_saldo_pedido:    Number(dados['quantidade_inicial_item_pedido'] ?? 0),
                  casas_decimais_quantidade_item: 2,
                  moeda_item:            String(dados['moeda_pedido'] ?? 'USD'),
                  valor_por_unidade_item: dados['valor_por_unidade_item'] ? Number(dados['valor_por_unidade_item']) : null,
                  valor_total_item:       dados['valor_total_item'] ? Number(dados['valor_total_item']) : null,
                  casas_decimais_total_item: 2,
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
                sequencia_item:      1,
                part_number:         String(dados['part_number'] ?? ''),
                ncm:                 String(dados['ncm'] ?? ''),
                descricao_item:      String(dados['descricao_item'] ?? ''),
                quantidade_inicial_pedido:  Number(dados['quantidade_inicial_item_pedido'] ?? 0),
                quantidade_saldo_pedido:    Number(dados['quantidade_inicial_item_pedido'] ?? 0),
                casas_decimais_quantidade_item: 2,
                moeda_item:            String(dados['moeda_pedido'] ?? 'USD'),
                valor_por_unidade_item: dados['valor_por_unidade_item'] ? Number(dados['valor_por_unidade_item']) : null,
                valor_total_item:       dados['valor_total_item'] ? Number(dados['valor_total_item']) : null,
                casas_decimais_total_item: 2,
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

    // Popular agregados dos pedidos recém-criados (quantidade_total_inicial_pedido, quantidade_transferida_total)
    // A transaction cria os itens, mas não atualiza os campos agregados do pedido pai.
    if (criados.length > 0) {
      for (const pedidoId of criados) {
        const itens = await this.db['pedidoItem'].findMany({
          where: { pedido_id: pedidoId, tenant_id: tenantId },
          select: { quantidade_inicial_item_pedido: true, quantidade_transferida_item: true },
        }) as { quantidade_inicial_item_pedido: number; quantidade_transferida_item: number }[]
        const qtdInicial = itens.reduce((s, i) => s + Number(i.quantidade_inicial_item_pedido ?? 0), 0)
        const qtdTransferida = itens.reduce((s, i) => s + Number(i.quantidade_transferida_item ?? 0), 0)
        await this.db['pedido'].update({
          where: { id: pedidoId },
          data: { quantidade_total_inicial_pedido: qtdInicial, quantidade_transferida_total: qtdTransferida },
        })
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
      // Normaliza underscores/hífens para espaço: "valor_unitario" → "valor unitario"
      const cab = cabecalho.toLowerCase().trim().replace(/[_-]/g, ' ')
      let melhorCampo: string | null = null
      let melhorScore = 0

      for (const [campo, aliases] of Object.entries(ALIASES_CAMPOS)) {
        for (const alias of aliases) {
          if (cab === alias) { melhorCampo = campo; melhorScore = 97; break }
          // Partial match: só pontua se o overlap for significativo (alias com 4+ chars)
          if (alias.length >= 4 && (cab === alias || cab.includes(alias) || alias.includes(cab))) {
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

    // Detectar valor numerico grande (possivelmente valor_por_unidade_item)
    const numeros = amostras.map(v => parseFloat(v.replace(',', '.'))).filter(n => !isNaN(n))
    if (numeros.length >= amostras.length * 0.9 && numeros.some(n => n > 10)) {
      return { campo: 'valor_por_unidade_item', confianca: 58 }
    }

    return null
  }

  private aplicarMapeamento(
    linha: LinhaArquivo,
    mapeamento: ColunaMapeadaBackend[],
    numeroLinha: number,
  ): SmartImportLinha {
    const dados: Record<string, unknown> = {}

    for (const col of mapeamento) {
      if (!col.campo_sistema) continue
      const valor = linha[col.coluna_arquivo]
      if (valor !== undefined) dados[col.campo_sistema] = valor
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

    const qty = Number(dados['quantidade_inicial_item_pedido'])
    if (dados['quantidade_inicial_item_pedido'] !== undefined && (isNaN(qty) || qty <= 0)) {
      alertas.push({ campo: 'quantidade_inicial_item_pedido', tipo: 'valor_negativo', mensagem: 'Quantidade deve ser maior que zero', nivel: 'erro' })
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

    return alertas
  }

  private montarDadosPedido(dados: Record<string, unknown>, tenantId: string, companyId: string): Record<string, unknown> {
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
      cobertura_cambial: 'com_cobertura',
      data_emissao_pedido: dados['data_emissao_pedido'] ?? new Date().toISOString(),
      casas_decimais_total_pedido:           2,
      casas_decimais_quantidade_total_pedido: 3,
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
