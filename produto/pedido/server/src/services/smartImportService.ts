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
}

export interface SmartImportConfirmar {
  preview_id: string
  mapeamento_confirmado: ColunaMapeadaBackend[]
  decisoes_duplicatas: Record<string, 'sobrescrever' | 'criar' | 'pular'>
  linhas_incluidas: number[]
  salvar_mapeamento: boolean
}

export interface SmartImportResultado {
  criados: number
  atualizados: number
  pulados: number
  erros: { linha: number; motivo: string }[]
  ids_criados: string[]
}

// Cache simples em memoria para previews (TTL 30min)
const previewCache = new Map<string, { data: SmartImportLinha[]; ts: number; mapeamento: ColunaMapeadaBackend[] }>()
const PREVIEW_TTL_MS = 30 * 60 * 1000

// ── Service ───────────────────────────────────────────────────────────────────

export class SmartImportService {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private db: Record<string, any>
  private memoriaService: MapeamentoMemoriaService

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  constructor(prismaClient: Record<string, any>) {
    this.db = prismaClient
    this.memoriaService = new MapeamentoMemoriaService(prismaClient)
  }

  async analisar(tenantId: string, buffer: Buffer, nomeArquivo: string): Promise<SmartImportPreview> {
    // 1. Parse do arquivo
    const linhasBrutas = await parseArquivo(buffer, nomeArquivo)
    if (linhasBrutas.length === 0) {
      throw new Error('Arquivo vazio ou sem dados validos')
    }

    // 2. Extrair cabecalhos
    const cabecalhos = Object.keys(linhasBrutas[0])
    const hashColunas = calcularHashColunas(cabecalhos)

    // 3. Tentar mapeamento por memoria
    let mapeamento: ColunaMapeadaBackend[]
    let memoriaAplicada = false

    const mapeamentoSalvo = await this.memoriaService.buscar(tenantId, hashColunas)
    if (mapeamentoSalvo) {
      mapeamento = mapeamentoSalvo.map(m => ({ ...m, inferido_por: 'memoria' as const }))
      memoriaAplicada = true
    } else {
      // 4. Mapeamento mock-IA (aliases conhecidos + scores)
      const amostra = linhasBrutas.slice(0, 10)
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

    return {
      total_linhas:    linhasComDuplicatas.length,
      total_pedidos:   pedidosUnicos.size,
      total_itens:     linhasBrutas.length,
      mapeamento,
      confianca_global: Math.round(confiancaGlobal),
      memoria_aplicada: memoriaAplicada,
      preview_id:      previewId,
      linhas:          linhasComDuplicatas,
    }
  }

  async confirmar(
    tenantId: string,
    userId: string,
    payload: SmartImportConfirmar,
  ): Promise<SmartImportResultado> {
    const cached = previewCache.get(payload.preview_id)

    // Usar linhas do cache ou reprocessar com o mapeamento confirmado
    const linhasParaUsar: SmartImportLinha[] = cached
      ? cached.data
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
          const dados = linha.dados
          const numeroPedido = linha.numero_pedido

          // Aplicar decisao de duplicata
          if (numeroPedido && payload.decisoes_duplicatas[numeroPedido] === 'pular') {
            pulados.push(linha.linha_arquivo)
            continue
          }

          const dadosPedido = this.montarDadosPedido(dados, tenantId)

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

          // Criar pedido novo
          const novo = await (tx as Record<string, any>)['pedido'].create({
            data: dadosPedido,
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

    return {
      criados:    criados.length,
      atualizados: atualizados.length,
      pulados:    pulados.length,
      erros,
      ids_criados: criados,
    }
  }

  // ── Privados ──────────────────────────────────────────────────────────────────

  private mapearComIA(cabecalhos: string[], _amostra: LinhaArquivo[]): ColunaMapeadaBackend[] {
    return cabecalhos.map(cabecalho => {
      const cab = cabecalho.toLowerCase().trim()
      let melhorCampo: string | null = null
      let melhorScore = 0

      for (const [campo, aliases] of Object.entries(ALIASES_CAMPOS)) {
        for (const alias of aliases) {
          // Match exato
          if (cab === alias) { melhorCampo = campo; melhorScore = 97; break }
          // Contém
          if (cab.includes(alias) || alias.includes(cab)) {
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

    // Detectar valor numerico grande (possivelmente valor_unitario)
    const numeros = amostras.map(v => parseFloat(v.replace(',', '.'))).filter(n => !isNaN(n))
    if (numeros.length >= amostras.length * 0.9 && numeros.some(n => n > 10)) {
      return { campo: 'valor_unitario', confianca: 58 }
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
      alertas.push({ campo: 'numero_pedido', tipo: 'obrigatorio_ausente', mensagem: 'Numero do pedido ausente', nivel: 'aviso' })
    }

    if (!dados['part_number']) {
      alertas.push({ campo: 'part_number', tipo: 'obrigatorio_ausente', mensagem: 'Part number ausente', nivel: 'aviso' })
    }

    const qty = Number(dados['quantidade_inicial'])
    if (dados['quantidade_inicial'] !== undefined && (isNaN(qty) || qty <= 0)) {
      alertas.push({ campo: 'quantidade_inicial', tipo: 'valor_negativo', mensagem: 'Quantidade deve ser maior que zero', nivel: 'erro' })
    }

    const val = Number(dados['valor_unitario'])
    if (dados['valor_unitario'] !== undefined && !isNaN(val) && val < 0) {
      alertas.push({ campo: 'valor_unitario', tipo: 'valor_negativo', mensagem: 'Valor unitario nao pode ser negativo', nivel: 'erro' })
    }

    const ncm = String(dados['ncm'] ?? '')
    if (ncm && !/^\d{4}[.\s]?\d{2}[.\s]?\d{2}$/.test(ncm.trim())) {
      alertas.push({ campo: 'ncm', tipo: 'formato_invalido', mensagem: `NCM "${ncm}" parece ter formato invalido (esperado 8 digitos)`, nivel: 'aviso' })
    }

    const dataStr = String(dados['data_embarque'] ?? '')
    if (dataStr && isNaN(new Date(dataStr).getTime())) {
      alertas.push({ campo: 'data_embarque', tipo: 'formato_invalido', mensagem: 'Data de embarque com formato invalido', nivel: 'aviso' })
    }

    return alertas
  }

  private montarDadosPedido(dados: Record<string, unknown>, tenantId: string): Record<string, unknown> {
    return {
      tenant_id:         tenantId,
      numero_pedido:     String(dados['numero_pedido'] ?? `IMP-${Date.now()}`),
      tipo_operacao:     dados['tipo_operacao'] ?? 'importacao',
      status:            'draft',
      exportador_nome:   dados['exportador'] ?? null,
      fabricante_nome:   dados['fabricante'] ?? null,
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
