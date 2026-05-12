/**
 * smartImport.ts — Rotas de importacao inteligente de pedidos
 *
 * Rota base: /api/v1/pedidos/importacoes-inteligentes
 *
 * Endpoints:
 *   POST /api/v1/pedidos/importacoes-inteligentes/analisar                              — upload multipart, parse, mock IA
 *   POST /api/v1/pedidos/importacoes-inteligentes/confirmar                             — aplicar decisoes, criar/atualizar pedidos
 *   GET  /api/v1/pedidos/importacoes-inteligentes/mapeamentos/:hash_mapeamento          — mapeamento salvo por hash
 *   POST /api/v1/pedidos/importacoes-inteligentes/mapeamentos                           — salva mapeamento
 *   POST /api/v1/pedidos/importacoes-inteligentes/reverter                              — rollback de importacao
 *   GET  /api/v1/pedidos/importacoes-inteligentes/template                              — planilha modelo
 *   GET  /api/v1/pedidos/importacoes-inteligentes/campos                                — campos do sistema
 *
 * Seguranca:
 *   - Validacao de extensao e tamanho (max 10MB) via multer
 *   - Zod em todas as rotas POST
 *   - tenant_id injetado pelo tenantIsolationMiddleware
 *   - preview_id validado contra tenant (SEC.3)
 */

import { Router, Request, Response, NextFunction } from 'express'
import multer from 'multer'
import { z } from 'zod'
import { withOrganizacao, type ContextoOrganizacao } from '@gravity/resolver-organizacao'
import { AppError } from '../errors/AppError.js'
import { SmartImportService, criarSmartImportService } from '../services/smartImportService.js'
import { MapeamentoMemoriaService } from '../services/mapeamentoMemoriaService.js'
import { smartImportPreviewSchema } from '../../../shared/smart-import-schemas.js'
import {
  CAMPOS_PEDIDO_DDD,
  CAMPOS_ITEM_DDD,
  CAMPOS_PEDIDO_DDD_TODOS,
  FORMATO_EXCEL_POR_TIPO,
  prioridadeDeCampo,
  type CampoPedidoDDD,
} from '../../../shared/campos-pedido-ddd.js'

// Versao do template. Atualize quando a ordem/estrutura mudar de forma
// incompativel. O parser e' agnostico de ordem (matcheia por rotulo via SSOT
// na fase P4), entao versoes antigas continuam abrindo na nova sem retrabalho.
//
// 2.0 (P6.2) — Ordenacao por prioridade DENTRO de cada nivel (pedido depois item)
// 3.0 (P7.1) — Ordenacao GLOBAL por prioridade (intercala pedido+item) +
//              outline grouping para colapsar zona DETALHES + super-header
//              ESSENCIAL/DETALHES + cor por nivel no sub-header
// 3.1 (P8)   — UX 10/10: paleta Solid Slate (ciano/cinza/ambar), congelar
//              2 colunas (Tipo Linha + Numero do Pedido), zona OPE propria
//              no final, asterisco vermelho em obrigatorios (em vez de
//              texto inteiro vermelho), fix super-header invisivel
// 3.2 (P9)   — Dentro de PRINCIPAL, ITEM vem antes de PEDIDO. Resultado:
//              F-O sao todos os 10 principais do ITEM (Sequencia, NCM,
//              Descricao, Unidade, Moeda, Valor Unidade, Valor Total Item,
//              Incoterm Item, Peso Liq/Bruto Unit); P-AE sao os 16 principais
//              do PEDIDO. Foco em fluxo de digitacao continuo por nivel.
// 3.3 (P10)  — Rotulos desambiguados: "Moeda" -> "Moeda do Pedido" / "Moeda
//              do Item"; "Unidade Comercializada" -> "...do Pedido" / "...do
//              Item". Referencia Importador/Exportador movidas no SSOT para
//              logo apos "Fabricante — Nome" (preservam grupo Documentos).
// 3.4 (P11)  — Zona ESSENCIAL encolhe para A-U (Incoterm). 10 campos do PEDIDO
//              rebaixados de 'principal' para 'secundaria': Moeda do Pedido,
//              Valor Total, Quantidade Total, Unidade Comercializada,
//              Condicao de Pagamento, No Proforma, No Invoice, Porto Origem,
//              Porto Destino, Data de Emissao. Continuam disponiveis na zona
//              DETALHES expansivel — apenas saem do bloco de preenchimento
//              obrigatorio rapido.
const TEMPLATE_VERSAO = '3.4'

export const smartImportRouter = Router()

// ── Rate limit: máximo 10 uploads por tenant por minuto ───────────────────────

const uploadRateLimit = new Map<string, { count: number; resetAt: number }>()

function checkRateLimit(tenantId: string): boolean {
  const now = Date.now()
  const entry = uploadRateLimit.get(tenantId)
  if (!entry || now > entry.resetAt) {
    uploadRateLimit.set(tenantId, { count: 1, resetAt: now + 60_000 })
    return true
  }
  if (entry.count >= 10) return false
  entry.count++
  return true
}

// ── Constantes ────────────────────────────────────────────────────────────────

const EXTENSOES_ACEITAS = new Set(['xlsx', 'xls', 'csv', 'xml', 'txt', 'json', 'pdf'])

// ── Multer config ─────────────────────────────────────────────────────────────

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB — valida DURANTE o stream
  fileFilter: (_req, file, cb) => {
    const ext = file.originalname.split('.').pop()?.toLowerCase() ?? ''
    if (EXTENSOES_ACEITAS.has(ext)) {
      cb(null, true)
    } else {
      cb(new AppError(`Formato .${ext} nao suportado`, 400, 'FORMATO_INVALIDO'))
    }
  },
})

// ── Zod Schemas ───────────────────────────────────────────────────────────────

const ColunaMapeadaSchema = z.object({
  coluna_arquivo: z.string(),
  campo_sistema:  z.string().nullable(),
  confianca:      z.number().min(0).max(100),
  nivel:          z.enum(['auto', 'confirmado', 'manual', 'ignorado']),
  inferido_por:   z.enum(['ia', 'dados', 'memoria', 'usuario']),
})

const LinhaSchema = z.object({
  linha_arquivo: z.number(),
  numero_pedido: z.string().nullable(),
  status:        z.enum(['ok', 'aviso', 'erro']),
  alertas:       z.array(z.unknown()),
  dados:         z.record(z.unknown()),
})

const ConfirmarSchema = z.object({
  preview_id:            z.string().min(1),
  mapeamento_confirmado: z.array(ColunaMapeadaSchema),
  decisoes_duplicatas:   z.record(z.enum(['sobrescrever', 'criar', 'pular'])),
  linhas_incluidas:      z.array(z.number().int()),
  salvar_mapeamento:     z.boolean(),
  numeros_editados:      z.record(z.coerce.number(), z.string()).optional(),
  linhas:                z.array(LinhaSchema).optional(),
})

// ── GET /template — Download de planilha modelo ───────────────────────────────
// Cobertura 100% dos campos preenchiveis de Pedido + PedidoItem (SSOT em
// `produto/pedido/shared/campos-pedido-ddd.ts`). Layout master-detail:
//   - Linha 1 (super-header): "PEDIDO" mesclado | "ITEM" mesclado
//   - Linha 2 (sub-header):   rotulos canonical PT-BR (REGRA 9 do DDD)
//   - Linha 3 (exemplo Pedido, vazia): negrito, formato pre-aplicado
//   - Linha 4 (exemplo Item, vazia):   regular, formato pre-aplicado
//
// Padrao visual identico ao exportarExcel() do frontend (exportUtils.ts):
//   Header: fundo #1e3256, fonte Calibri 11 bold azul #38bdf8, centralizado.
//
// O usuario preenche linha do Pedido (master, em negrito) e linhas de Item
// (detail) abaixo, espelhando a tabela do app. Para o segundo Pedido, repete
// o mesmo padrao.

/**
 * Handler exportado para registro DIRETO em index.ts ANTES de resolverOrganizacao.
 * O link `<a download>` no frontend nao envia JWT, entao a rota precisa ficar fora
 * do middleware de auth (esta no whitelist do requireInternalKey, e o proxy do Vite
 * injeta x-chave-interna-servico).
 *
 * Em index.ts:
 *   app.get('/api/v1/pedidos/importacoes-inteligentes/template', templateHandler)
 *   // ... DEPOIS:
 *   app.use(resolverOrganizacao(...))
 */
export const templateHandler = (_req: Request, res: Response, next: NextFunction) => {
  import('exceljs').then(async ({ default: ExcelJS }) => {
    // ─── P7.1 — Reordenacao GLOBAL por prioridade + secao OPE no final ─────────
    //
    // 3 secoes do template:
    //   1. ESSENCIAL (criticos + principais, intercalando pedido + item)
    //   2. DETALHES (secundarios EXCETO OPE — datas, snapshots, cambio, casas dec.)
    //   3. OPE (12 campos governamentais — sessao propria no final)
    //
    // Decisao 11/05 do dono: "Tudo que for OPE deve ter sua propria sessao e
    // deve ser a ultima". OPE = Operador Estrangeiro (cadastro Receita Federal).
    //
    // Sort estavel preserva ordem do SSOT dentro de cada prioridade —
    // agrupamento por bloco (Identificacao, Exportador, Comercial) mantido.
    const ordemPrioridade = { critica: 0, principal: 1, secundaria: 2 } as const
    const sortPorPrioridade = (a: CampoPedidoDDD, b: CampoPedidoDDD): number => {
      const pa = ordemPrioridade[prioridadeDeCampo(a)]
      const pb = ordemPrioridade[prioridadeDeCampo(b)]
      if (pa !== pb) return pa - pb
      // P9 — Dentro de PRINCIPAL, ITEM vem antes de PEDIDO.
      // Decisao do dono em 11/05/2026: quando o usuario edita uma linha ITEM,
      // os campos de item devem ficar CONTIGUOS aos criticos do item (D, E),
      // sem precisar saltar pelos 16 campos do Pedido (~16 colunas) para
      // chegar em "Valor por Unidade". Resultado:
      //   A-C  : Criticos Pedido (Tipo Linha, Numero, Tipo Operacao)
      //   D-E  : Criticos Item   (Part Number, Qtd. Inicial)
      //   F-O  : Principais Item (Sequencia, NCM, Descricao, Unidade,
      //                           Moeda, Valor Unidade, Valor Total Item,
      //                           Incoterm Item, Peso Liq/Bruto Unit)
      //   P-AE : Principais Pedido (Exportador, Importador, Fabricante,
      //                             Incoterm, Moeda, Valor Total Pedido, ...)
      if (pa === ordemPrioridade.principal) {
        if (a.nivel === 'item' && b.nivel === 'pedido') return -1
        if (a.nivel === 'pedido' && b.nivel === 'item') return 1
      }
      return 0
    }
    const todos = [...CAMPOS_PEDIDO_DDD, ...CAMPOS_ITEM_DDD]
    const camposOPE     = todos.filter(c => c.grupo === 'OPE')
    const camposNaoOPE  = todos.filter(c => c.grupo !== 'OPE').sort(sortPorPrioridade)
    const camposOrdenados: CampoPedidoDDD[] = [...camposNaoOPE, ...camposOPE]
    const totalColunas    = camposOrdenados.length
    const totalEssenciais = camposNaoOPE.filter(c => prioridadeDeCampo(c) !== 'secundaria').length
    const totalDetalhes   = camposNaoOPE.length - totalEssenciais
    const totalOPE        = camposOPE.length

    const wb = new ExcelJS.Workbook()
    wb.creator     = 'Gravity Platform'
    wb.created     = new Date()
    wb.title       = `Template Importacao Pedidos v${TEMPLATE_VERSAO}`
    wb.description = `Gravity Pedido Template v${TEMPLATE_VERSAO} — ` +
      `intercalado por prioridade (5 criticos + 26 principais nas primeiras 31 colunas). ` +
      `Zona DETALHES (112 colunas) inicia colapsada via outline grouping. ` +
      `Parser aceita qualquer ordem; ordem visual otimizada para UX.`
    wb.subject     = 'Smart Import - Pedido'
    wb.company     = 'Gravity'

    // Frozen panes: 2 linhas no topo (super-header + sub-header) + 2 colunas
    // a esquerda (Tipo Linha + Numero do Pedido). Decisao 11/05 do dono:
    // ao rolar horizontalmente, usuario sempre ve qual linha esta editando
    // (PEDIDO/ITEM) e a qual pedido pertence.
    const ws = wb.addWorksheet('Pedidos', {
      views: [{ showGridLines: true, state: 'frozen', xSplit: 2, ySplit: 2 }],
      properties: { outlineLevelCol: 1 },
    })

    // P7-FIX — NAO usar `key` em ws.columns; com key o ExcelJS cria uma linha
    // de header automatica que conflita com nosso mergeCells manual (bug
    // raiz do super-header nao aparecer no template v1/v2). Usamos apenas
    // `width` e controlamos as 2 primeiras linhas manualmente.
    ws.columns = camposOrdenados.map(c => ({
      width: Math.max(c.rotulo.length + 4, 18),
    }))

    // ── P8.1 Linha 1 — Super-header: 3 zonas com cores Solid Slate ────────────
    //
    // Paleta UX 10/10 — cada zona com cor sutil e profissional:
    //   ESSENCIAL: ciano-petróleo (foco prioritário, sem agressão visual)
    //   DETALHES:  cinza-azulado (neutro, opcional)
    //   OPE:       âmbar-escuro (regulatório/governamental — categoria distinta)
    //
    // Bordas verticais finas separam zonas sem brigar com sub-header.
    const linha1 = ws.getRow(1)
    linha1.height = 28

    // Zona 1 — ESSENCIAL
    ws.mergeCells(1, 1, 1, totalEssenciais)
    const cellEssencial = ws.getCell(1, 1)
    cellEssencial.value = 'ESSENCIAL  ·  preencha este bloco'
    cellEssencial.fill  = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF0E7490' } } // ciano-petroleo #0E7490 (cyan-700)
    cellEssencial.font  = { name: 'Calibri', bold: true, size: 12, color: { argb: 'FFE0F2FE' } } // ciano-claro #E0F2FE (sky-100)
    cellEssencial.alignment = { horizontal: 'center', vertical: 'middle' }
    cellEssencial.border = { right: { style: 'thin', color: { argb: 'FF1E293B' } } }

    // Zona 2 — DETALHES OPCIONAIS
    if (totalDetalhes > 0) {
      ws.mergeCells(1, totalEssenciais + 1, 1, totalEssenciais + totalDetalhes)
      const cellDetalhes = ws.getCell(1, totalEssenciais + 1)
      cellDetalhes.value = 'DETALHES  ·  expanda apenas se necessario'
      cellDetalhes.fill  = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF334155' } } // cinza-azulado #334155 (slate-700)
      cellDetalhes.font  = { name: 'Calibri', bold: true, size: 12, color: { argb: 'FFCBD5E1' } } // cinza-claro #CBD5E1 (slate-300)
      cellDetalhes.alignment = { horizontal: 'center', vertical: 'middle' }
      cellDetalhes.border = { right: { style: 'thin', color: { argb: 'FF1E293B' } } }
    }

    // Zona 3 — OPE (regulatorio Receita Federal)
    if (totalOPE > 0) {
      const inicioOPE = totalEssenciais + totalDetalhes + 1
      ws.mergeCells(1, inicioOPE, 1, totalColunas)
      const cellOPE = ws.getCell(1, inicioOPE)
      cellOPE.value = 'OPE  ·  Operador Estrangeiro (Receita Federal)'
      cellOPE.fill  = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF92400E' } } // ambar-escuro #92400E (amber-800)
      cellOPE.font  = { name: 'Calibri', bold: true, size: 12, color: { argb: 'FFFEF3C7' } } // ambar-claro #FEF3C7 (amber-100)
      cellOPE.alignment = { horizontal: 'center', vertical: 'middle' }
    }

    // ── P8.1 Linha 2 — Sub-header com cor por nivel ───────────────────────────
    //
    // Cores ajustadas para UX 10/10 — paleta Solid Slate consistente:
    //   nivel = 'pedido'  -> azul        (#1E3A5F fundo, #93C5FD texto)
    //   nivel = 'item'    -> lilas       (#2E1065 fundo, #C4B5FD texto)
    //   grupo = 'OPE'     -> ambar       (#451A03 fundo, #FCD34D texto)
    //   obrigatorio       -> mantem cor do nivel + asterisco vermelho * no rotulo
    //                        (em vez do texto inteiro vermelho — UX 10/10)
    const linha2 = ws.getRow(2)
    linha2.height = 26
    camposOrdenados.forEach((c, i) => {
      const cell = linha2.getCell(i + 1)
      const ehItem        = c.nivel === 'item'
      const ehOPE         = c.grupo === 'OPE'
      const ehObrigatorio = c.obrigatorio === true

      // Asterisco vermelho discreto antes do rotulo (sinaliza obrigatorio
      // sem comprometer a hierarquia visual do nivel)
      cell.value = ehObrigatorio ? `* ${c.rotulo}` : c.rotulo

      const cores = ehOPE
        ? { fill: 'FF451A03', text: 'FFFCD34D', borda: 'FFD97706' } // ambar-escuro / ambar-claro
        : ehItem
        ? { fill: 'FF2E1065', text: 'FFC4B5FD', borda: 'FF7C3AED' } // lilas-escuro / lilas-claro
        : { fill: 'FF1E3A5F', text: 'FF93C5FD', borda: 'FF3B82F6' } // azul-escuro / azul-claro

      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: cores.fill } }
      cell.font = { name: 'Calibri', bold: true, size: 11, color: { argb: cores.text } }
      cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true }
      cell.border = { bottom: { style: 'thin', color: { argb: cores.borda } } }
    })

    // P7.2 / P8.1 — Outline grouping: apenas zona DETALHES (secundarias
    // NAO-OPE) recebe outlineLevel=1. OPE fica sempre visivel ao rolar para
    // a direita — tem zona propria visualmente distinta (ambar) e usuario
    // que precisa de OPE quer ver imediatamente. Quem nao usa OPE simplesmente
    // nao rola ate la.
    //
    // `collapsed` e' read-only no tipo ExcelJS — para colapsar por default
    // seria necessario manipular o XML diretamente. Por ora a barra [+/-]
    // permite colapsar em 1 clique.
    camposOrdenados.forEach((c, idx) => {
      if (prioridadeDeCampo(c) === 'secundaria' && c.grupo !== 'OPE') {
        ws.getColumn(idx + 1).outlineLevel = 1
      }
    })

    // ── Aplicar numFmt por coluna conforme tipo do campo (data, numero) ───────
    camposOrdenados.forEach((c, idx) => {
      const numFmt = FORMATO_EXCEL_POR_TIPO[c.tipo]
      if (numFmt) {
        ws.getColumn(idx + 1).numFmt = numFmt
      }
    })

    // ── Data validation (dropdowns) para campos tipo 'select' ─────────────────
    // Aplica do row 3 ate 1000 (margem para o usuario adicionar linhas).
    camposOrdenados.forEach((c, idx) => {
      if (c.tipo === 'select' && c.opcoesSelect && c.opcoesSelect.length > 0) {
        const colLetter = ws.getColumn(idx + 1).letter
        for (let row = 3; row <= 1000; row++) {
          ws.getCell(`${colLetter}${row}`).dataValidation = {
            type:           'list',
            allowBlank:     false,
            formulae:       [`"${c.opcoesSelect.join(',')}"`],
            showErrorMessage: true,
            errorStyle:     'error',
            errorTitle:     'Valor invalido',
            error:          `Valores aceitos: ${c.opcoesSelect.join(', ')}`,
          }
        }
      }
    })

    // ── Linha 3 — Exemplo de Pedido (vazia, em negrito) ───────────────────────
    const linhaPedidoExemplo = ws.getRow(3)
    linhaPedidoExemplo.height = 20
    linhaPedidoExemplo.font   = { name: 'Calibri', bold: true, size: 11 }

    // ── Linha 4 — Exemplo de Item (vazia, regular) ────────────────────────────
    const linhaItemExemplo = ws.getRow(4)
    linhaItemExemplo.height = 18
    linhaItemExemplo.font   = { name: 'Calibri', bold: false, size: 11 }

    const buf = await wb.xlsx.writeBuffer()
    res.set({
      'Content-Type':        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': 'attachment; filename="template-importacao-pedidos.xlsx"',
      'Content-Length':      String((buf as unknown as Buffer).length),
    })
    res.send(buf)
  }).catch(next)
}

// Mantem a rota tambem dentro do smartImportRouter para compatibilidade S2S (chamadas
// internas com JWT). O handler standalone acima e o que serve o navegador.
smartImportRouter.get('/template', templateHandler)

// ── POST /analisar ─────────────────────────────────────────────────────────────

smartImportRouter.post('/analisar', upload.single('arquivo'), async (req: Request, res: Response, next: NextFunction) => {
  // Extrair tenantId antes de withOrganizacao — necessário para o rate limit
  const tenantId = (req as unknown as { organizacao: ContextoOrganizacao }).organizacao.idOrganizacao

  if (!checkRateLimit(tenantId)) {
    return res.status(429).json({
      error: { code: 'RATE_LIMIT_EXCEEDED', message: 'Muitas importacoes em pouco tempo. Aguarde 1 minuto.' },
    })
  }

  try {
    if (!req.file) {
      throw new AppError('Arquivo nao encontrado', 400, 'ARQUIVO_AUSENTE')
    }

    const buffer      = req.file.buffer
    const nomeArquivo = req.file.originalname

    // Validar magic bytes para PDF — rejeitar HTMLs com extensao .pdf
    const ext = nomeArquivo.split('.').pop()?.toLowerCase()
    if (ext === 'pdf') {
      const magic = buffer.slice(0, 5).toString('ascii')
      if (!magic.startsWith('%PDF')) {
        throw new AppError(
          'Este arquivo nao e um PDF valido. Arquivos salvos como pagina web (.html) nao sao aceitos. Use Excel ou CSV.',
          400,
          'PDF_INVALIDO',
        )
      }
    }

    // FEAT.8 — Detectar multiplas planilhas
    const { listarPlanilhas } = await import('../services/importEngine.js')
    const planilhas = await listarPlanilhas(buffer, nomeArquivo)
    const nomePlanilha = (req.query.sheet as string) || undefined

    // Se tem multiplas planilhas e nenhuma foi especificada, retornar lista
    if (planilhas.length > 1 && !nomePlanilha) {
      return res.json({ multiplas_planilhas: true, planilhas, preview: null })
    }

    await withOrganizacao(req, async (rawDb) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const db      = rawDb as any
      const service = criarSmartImportService(db)
      const preview = await service.analisar(tenantId, buffer, nomeArquivo, nomePlanilha)
      // REGRA 06/09 — valida contrato bilateral antes de devolver (defensive
      // serialization). Se o backend acrescentar campo novo, .parse() avisa
      // imediatamente em vez de bug silencioso no client.
      const validated = smartImportPreviewSchema.parse(preview)
      res.json(validated)
    })
  } catch (err) {
    next(err)
  }
})

// ── POST /confirmar ────────────────────────────────────────────────────────────

smartImportRouter.post('/confirmar', async (req: Request, res: Response, next: NextFunction) => {
  const parse = ConfirmarSchema.safeParse(req.body)
  if (!parse.success) {
    return res.status(400).json({
      error: {
        code:    'VALIDATION_ERROR',
        message: 'Dados invalidos',
        details: parse.error.flatten(),
      },
    })
  }

  // SEC.3 — Validar que o preview_id pertence ao tenant da requisicao
  const tenantId  = (req as unknown as { organizacao: ContextoOrganizacao }).organizacao.idOrganizacao
  const companyId = (req.headers['x-id-workspace'] as string | undefined) ?? tenantId

  if (!parse.data.preview_id.startsWith(tenantId + '-')) {
    return res.status(403).json({
      error: { code: 'UNAUTHORIZED_PREVIEW', message: 'Preview nao pertence a este tenant' },
    })
  }

  try {
    await withOrganizacao(req, async (rawDb) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const db     = rawDb as any
      const userId = (req as unknown as { organizacao: ContextoOrganizacao }).organizacao.idUsuario ?? 'system'

      const service   = criarSmartImportService(db)
      const resultado = await service.confirmar(tenantId, userId, parse.data, companyId)
      res.json(resultado)
    })
  } catch (err) {
    next(err)
  }
})

// ── GET /mapeamentos/:hash_mapeamento ─────────────────────────────────────────

smartImportRouter.get('/mapeamentos/:hash_mapeamento', async (req: Request, res: Response, next: NextFunction) => {
  const hash = req.params.hash_mapeamento

  if (!hash || hash.length < 4) {
    return res.status(400).json({
      error: { code: 'VALIDATION_ERROR', message: 'Hash de colunas invalido' },
    })
  }

  try {
    await withOrganizacao(req, async (rawDb) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const db       = rawDb as any
      const tenantId = (req as unknown as { organizacao: ContextoOrganizacao }).organizacao.idOrganizacao

      const service    = new MapeamentoMemoriaService(db)
      const mapeamento = await service.buscar(tenantId, hash)
      res.json(mapeamento ?? null)
    })
  } catch (err) {
    next(err)
  }
})

// ── GET /campos ────────────────────────────────────────────────────────────────

smartImportRouter.get('/campos', async (req: Request, res: Response, next: NextFunction) => {
  // P5.1 — devolve TODOS os 143 campos do SSOT (antes era hardcode de 15 legados).
  // Inclui nivel ('pedido'|'item') e grupo para o client agrupar com <optgroup>.
  const camposPadrao = CAMPOS_PEDIDO_DDD_TODOS.map((c) => ({
    valor:  c.campo,
    rotulo: c.rotulo,
    nivel:  c.nivel,
    grupo:  c.grupo ?? '',
  }))

  try {
    await withOrganizacao(req, async (rawDb) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const db       = rawDb as any
      const tenantId = (req as unknown as { organizacao: ContextoOrganizacao }).organizacao.idOrganizacao

      // P1.7 — Incluir colunas customizadas do tenant
      const colunasCustom = await db.pedidoListaColunaUsuario.findMany({
        where: { id_organizacao: tenantId, ativo_coluna_usuario_pedido: true },
        select: { chave_coluna_usuario_pedido: true, nome_coluna_usuario_pedido: true },
        orderBy: { ordem_coluna_usuario_pedido: 'asc' },
      }).catch(() => [] as { chave_coluna_usuario_pedido: string; nome_coluna_usuario_pedido: string }[])

      const camposCustom = (colunasCustom as { chave_coluna_usuario_pedido: string; nome_coluna_usuario_pedido: string }[]).map((c) => ({
        valor:  `custom_${c.chave_coluna_usuario_pedido}`,
        rotulo: `${c.nome_coluna_usuario_pedido} (personalizado)`,
        nivel:  'pedido' as const,
        grupo:  'Personalizado',
      }))

      res.json([...camposPadrao, ...camposCustom])
    })
  } catch (err) {
    next(err)
  }
})

// ── POST /mapeamentos ──────────────────────────────────────────────────────────

const SalvarMapeamentoSchema = z.object({
  hash_colunas: z.string().min(4),
  mapeamento:   z.array(ColunaMapeadaSchema),
})

smartImportRouter.post('/mapeamentos', async (req: Request, res: Response, next: NextFunction) => {
  const parse = SalvarMapeamentoSchema.safeParse(req.body)
  if (!parse.success) {
    return res.status(400).json({
      error: { code: 'VALIDATION_ERROR', message: 'Dados invalidos', details: parse.error.flatten() },
    })
  }

  try {
    await withOrganizacao(req, async (rawDb) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const db       = rawDb as any
      const tenantId = (req as unknown as { organizacao: ContextoOrganizacao }).organizacao.idOrganizacao

      const service = new MapeamentoMemoriaService(db)
      await service.salvar(tenantId, parse.data.hash_colunas, parse.data.mapeamento)
      res.json({ ok: true })
    })
  } catch (err) {
    next(err)
  }
})

// ── POST /reverter — Rollback de importacao (FEAT.3) ─────────────────────────

const ReverterSchema = z.object({
  ids_criados: z.array(z.string().min(1)).min(1).max(500),
})

smartImportRouter.post('/reverter', async (req: Request, res: Response, next: NextFunction) => {
  const parse = ReverterSchema.safeParse(req.body)
  if (!parse.success) {
    return res.status(400).json({
      error: { code: 'VALIDATION_ERROR', message: 'Dados invalidos', details: parse.error.flatten() },
    })
  }

  try {
    await withOrganizacao(req, async (rawDb) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const db       = rawDb as any
      const tenantId = (req as unknown as { organizacao: ContextoOrganizacao }).organizacao.idOrganizacao

      // Cancelar pedidos (soft delete via status) garantindo tenant isolation
      const resultado = await db.pedido.updateMany({
        where: {
          id: { in: parse.data.ids_criados },
          tenant_id: tenantId,
          status: 'rascunho', // Só reverter rascunhos — pedidos abertos nao podem ser revertidos
        },
        data: { status: 'cancelado' },
      })
      res.json({ revertidos: resultado.count, ids: parse.data.ids_criados })
    })
  } catch (err) {
    next(err)
  }
})

// ── Error handler local ───────────────────────────────────────────────────────

smartImportRouter.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      error: { code: err.code, message: err.message },
    })
  }
  console.error('[SmartImport]', err.message)
  res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'Erro interno do servidor' } })
})
