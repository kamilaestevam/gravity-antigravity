// server/services/catalogo-ferramentas.ts
// Catalogo declarativo de TODAS as tools do agente GABI.
// Cada tool declara: id, produto, classe de risco, schema Zod de params,
// declaracao Gemini (function_declarations) e metadata de roteamento.

import { z } from 'zod'

// ── Classificacao de risco das tools ─────────────────────────────────────────

export type ClasseRisco = 'READ' | 'WRITE_SAFE' | 'WRITE_DESTRUTIVA' | 'WRITE_FINANCEIRA'

export interface ToolDefinition {
  id: string
  produto: 'pedido' | 'configurador' | 'admin' | 'hub' | 'store' | 'gabi'
  classe: ClasseRisco
  metodo: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE'
  endpoint: string
  descricao: string
  permissao_minima?: string
  schema_params: z.ZodType
  gemini_declaration: GeminiToolDeclaration
}

interface GeminiToolDeclaration {
  name: string
  description: string
  parameters: {
    type: 'OBJECT'
    properties: Record<string, GeminiParamDef>
    required?: string[]
  }
}

interface GeminiParamDef {
  type: 'STRING' | 'NUMBER' | 'BOOLEAN' | 'ARRAY' | 'OBJECT'
  description?: string
  enum?: string[]
  items?: GeminiParamDef
}

// ── Schemas Zod compartilhados ───────────────────────────────────────────────

const idSchema = z.string().min(1)
const limitSchema = z.number().int().min(1).max(100).optional().default(20)
const periodoSchema = z.string().optional()

// ── PEDIDO — READ tools ──────────────────────────────────────────────────────

const pedidoListarParams = z.object({
  status: z.string().optional(),
  busca: z.string().optional(),
  limit: limitSchema,
  sort: z.string().optional(),
  dir: z.enum(['asc', 'desc']).optional(),
})

const pedidoDetalharParams = z.object({
  id_pedido: idSchema,
})

const pedidoKpisParams = z.object({
  period: periodoSchema,
})

const pedidoTendenciaParams = z.object({
  period: periodoSchema,
  granularity: z.enum(['month', 'week']).optional(),
})

const pedidoDistribuicaoParams = z.object({
  period: periodoSchema,
})

const pedidoInsightsParams = z.object({
  period: periodoSchema,
  from: z.string().optional(),
  to: z.string().optional(),
  role: z.string().optional(),
})

const pedidoInicializacaoParams = z.object({
  sort: z.string().optional(),
  dir: z.enum(['asc', 'desc']).optional(),
  limit: limitSchema,
  status: z.string().optional(),
  busca: z.string().optional(),
})

const pedidoSnapshotStatusParams = z.object({
  id_pedido: idSchema,
})

const pedidoColunasUsuarioParams = z.object({})

const pedidoDatasetBrutoParams = z.object({
  period: periodoSchema,
  page: z.number().int().min(1).optional(),
  pageSize: z.number().int().min(1).max(10000).optional(),
})

// ── PEDIDO — WRITE tools ─────────────────────────────────────────────────────

const pedidoCriarParams = z.object({
  numero_pedido: z.string().optional(),
  exportador_pedido: z.string().optional(),
  importador_pedido: z.string().optional(),
  incoterm_pedido: z.string().optional(),
  moeda_pedido: z.string().optional(),
  status_pedido: z.string().optional(),
})

const pedidoEditarParams = z.object({
  id_pedido: idSchema,
  campos: z.record(z.unknown()),
})

const pedidoExcluirPreviewParams = z.object({
  ids: z.array(idSchema).min(1),
})

const pedidoExcluirConfirmarParams = z.object({
  ids: z.array(idSchema).min(1),
})

const pedidoEdicaoMassaPreviewParams = z.object({
  pedido_ids: z.array(idSchema).min(1),
  item_ids: z.array(idSchema).optional(),
  pedido_ids_completo: z.array(idSchema).optional(),
  campos: z.array(z.object({
    campo: z.string(),
    tipo: z.string(),
    nivel: z.string(),
    operacao: z.string(),
    valor: z.unknown(),
  })).min(1),
  nivel: z.enum(['pedido', 'item', 'combinado']),
})

const pedidoEdicaoMassaConfirmarParams = pedidoEdicaoMassaPreviewParams

const pedidoConsolidarPreviewParams = z.object({
  ids: z.array(idSchema).min(2),
})

const pedidoConsolidarConfirmarParams = z.object({
  ids: z.array(idSchema).min(2),
  numero_pedido: z.string(),
  campos_escolhidos: z.record(z.unknown()),
  fundir_itens_mesmo_part_number: z.boolean(),
})

const pedidoTransferirPreviewParams = z.object({
  id_pedido: idSchema,
  cenario: z.string(),
  item_id: z.string(),
  quantidade_origem: z.number(),
  destinos: z.array(z.object({
    tipo: z.enum(['novo', 'existente', 'mesmo']),
    pedido_id: z.string().optional(),
    quantidade: z.number(),
    part_number: z.string().optional(),
  })),
})

const pedidoTransferirConfirmarParams = pedidoTransferirPreviewParams.extend({
  numero_pedido_novo: z.string().optional(),
})

const pedidoDuplicarPreviewParams = z.object({
  ids: z.array(idSchema).min(1),
})

const pedidoDuplicarConfirmarParams = z.object({
  ids: z.array(idSchema).min(1),
  numeros: z.record(z.string()).optional(),
  opcoes: z.object({
    copiar_datas: z.boolean().optional(),
    copiar_valores_precos: z.boolean().optional(),
    copiar_referencias_externas: z.boolean().optional(),
    copiar_pesos_cubagem: z.boolean().optional(),
    copiar_descricoes_complementares: z.boolean().optional(),
  }).optional(),
})

const pedidoAlterarStatusLotePreviewParams = z.object({
  ids: z.array(idSchema).min(1),
  status_novo: z.string(),
})

const pedidoAlterarStatusLoteConfirmarParams = pedidoAlterarStatusLotePreviewParams

// ── CONFIGURADOR — READ tools ────────────────────────────────────────────────

const configMeParams = z.object({})
const configListarWorkspacesParams = z.object({})
const configDetalharWorkspaceParams = z.object({ id_workspace: idSchema })
const configListarUsuariosParams = z.object({})
const configDetalharUsuarioParams = z.object({ id_usuario: idSchema })
const configOrganizacaoParams = z.object({})
const configProdutosAtivosParams = z.object({})
const configAssinaturasParams = z.object({})
const configHistoricoParams = z.object({
  limit: z.number().int().min(1).max(200).optional(),
  cursor: z.string().optional(),
  tipo_ator_historico_log: z.string().optional(),
  modulo_historico_log: z.string().optional(),
  acao_historico_log: z.string().optional(),
})

// ── CONFIGURADOR — WRITE tools ───────────────────────────────────────────────

const configCriarWorkspaceParams = z.object({
  nome_workspace: z.string().min(2),
  subdominio_workspace: z.string().optional(),
  cnpj_workspace: z.string().optional(),
})

const configEditarWorkspaceParams = z.object({
  id_workspace: idSchema,
  nome_workspace: z.string().min(2).optional(),
  cnpj_workspace: z.string().optional(),
  status_workspace: z.enum(['ATIVO', 'INATIVO']).optional(),
})

const configExcluirWorkspaceParams = z.object({
  id_workspace: idSchema,
})

const configConvidarUsuarioParams = z.object({
  email_usuario: z.string().email(),
  nome_usuario: z.string().min(1),
  tipo_usuario: z.enum(['MASTER', 'PADRAO', 'FORNECEDOR']).optional().default('PADRAO'),
  workspaces_alvo: z.union([z.literal('all'), z.array(idSchema)]).optional(),
})

const configVincularWorkspaceParams = z.object({
  id_usuario: idSchema,
  id_workspace: idSchema,
  tipo_usuario_workspace: z.enum(['MASTER', 'PADRAO', 'FORNECEDOR']).optional().default('PADRAO'),
})

const configAlterarPatenteParams = z.object({
  id_usuario: idSchema,
  tipo_usuario: z.enum(['SUPER_ADMIN', 'ADMIN', 'MASTER', 'PADRAO', 'FORNECEDOR']),
})

const configAlterarStatusUsuarioParams = z.object({
  id_usuario: idSchema,
  status_usuario: z.enum(['ATIVO', 'INATIVO']),
})

const configEditarOrganizacaoParams = z.object({
  nome_organizacao: z.string().min(2).optional(),
  cnpj_organizacao: z.string().optional(),
  estado_organizacao: z.string().optional(),
  cidade_organizacao: z.string().optional(),
  segmento_organizacao: z.string().optional(),
  tipo_organizacao: z.string().optional(),
})

// ── ADMIN — READ tools ───────────────────────────────────────────────────────

const adminListarOrgsParams = z.object({
  page: z.number().int().min(1).optional(),
  limit: z.number().int().min(1).max(100).optional(),
  search: z.string().optional(),
})

const adminDetalharOrgParams = z.object({
  id_organizacao: idSchema,
})

const adminListarProdutosParams = z.object({})

const adminSegurancaEventosParams = z.object({
  limit: z.number().int().min(1).max(200).optional(),
})

const adminHistoricoGlobalParams = z.object({
  limit: z.number().int().min(1).max(200).optional(),
  cursor: z.string().optional(),
  tipo_ator_historico_log: z.string().optional(),
  search: z.string().optional(),
})

const adminUsuariosGlobaisParams = z.object({})

// ── ADMIN — WRITE tools ──────────────────────────────────────────────────────

const adminEditarOrgParams = z.object({
  id_organizacao: idSchema,
  status_organizacao: z.enum(['ATIVO', 'SUSPENSO', 'CANCELADO', 'CONFIGURACAO_PENDENTE']).optional(),
  nome_organizacao: z.string().min(2).optional(),
  subdominio_organizacao: z.string().min(2).optional(),
})

const adminEditarProdutoParams = z.object({
  id_produto_gravity: idSchema,
  nome_produto_gravity: z.string().optional(),
  status_produto_gravity: z.string().optional(),
})

const adminAtivarProdutoOrgParams = z.object({
  id_organizacao: idSchema,
  slug_produto_gravity: z.string(),
})

// ── HUB / CORE — READ tools ─────────────────────────────────────────────────

const hubInitParams = z.object({})
const coreDashboardParams = z.object({})
const coreProcessosRecentesParams = z.object({
  limite: z.number().int().min(1).max(50).optional(),
})

// ── STORE — READ tools ──────────────────────────────────────────────────────

const storeCatalogoParams = z.object({})
const storeDetalheProdutoParams = z.object({ slug: z.string() })
const storePlanosParams = z.object({ slug: z.string() })

// ── CATALOGO COMPLETO ────────────────────────────────────────────────────────

export const CATALOGO_FERRAMENTAS: ToolDefinition[] = [

  // ════════════════════════════════════════════════════════════════════════════
  // PEDIDO — READ
  // ════════════════════════════════════════════════════════════════════════════

  {
    id: 'pedido.listar',
    produto: 'pedido',
    classe: 'READ',
    metodo: 'GET',
    endpoint: '/api/v1/pedidos',
    descricao: 'Lista pedidos do usuario com filtros',
    schema_params: pedidoListarParams,
    gemini_declaration: {
      name: 'pedido.listar',
      description: 'Lista os pedidos de importacao do usuario com filtros opcionais. Use quando o usuario perguntar sobre pedidos, ordens de compra, purchase orders, "meus pedidos", "pedidos atrasados".',
      parameters: {
        type: 'OBJECT',
        properties: {
          status: { type: 'STRING', description: 'Filtrar por status: rascunho|aberto|em_andamento|aprovado|transferencia|consolidado|cancelado' },
          busca: { type: 'STRING', description: 'Busca por numero, referencia ou exportador' },
          limit: { type: 'NUMBER', description: 'Maximo de resultados (padrao: 20, max: 100)' },
          sort: { type: 'STRING', description: 'Campo para ordenacao' },
          dir: { type: 'STRING', enum: ['asc', 'desc'], description: 'Direcao da ordenacao' },
        },
      },
    },
  },
  {
    id: 'pedido.detalhar',
    produto: 'pedido',
    classe: 'READ',
    metodo: 'GET',
    endpoint: '/api/v1/pedidos/:id_pedido',
    descricao: 'Detalhes completos de 1 pedido + itens',
    schema_params: pedidoDetalharParams,
    gemini_declaration: {
      name: 'pedido.detalhar',
      description: 'Busca detalhes completos de um pedido: itens, fornecedor, status, valores, datas.',
      parameters: {
        type: 'OBJECT',
        properties: {
          id_pedido: { type: 'STRING', description: 'ID do pedido (obrigatorio)' },
        },
        required: ['id_pedido'],
      },
    },
  },
  {
    id: 'pedido.kpis',
    produto: 'pedido',
    classe: 'READ',
    metodo: 'GET',
    endpoint: '/api/v1/pedidos/dashboard/kpis',
    descricao: 'KPIs agregados do dashboard de pedidos',
    schema_params: pedidoKpisParams,
    gemini_declaration: {
      name: 'pedido.kpis',
      description: 'Retorna KPIs agregados dos pedidos: total, valor, cobertura, media. Use para perguntas sobre metricas, indicadores, "quanto tenho em pedidos".',
      parameters: {
        type: 'OBJECT',
        properties: {
          period: { type: 'STRING', description: 'Periodo: 7d|30d|90d|6m|12m|ytd|current_month|custom:YYYY-MM-DD:YYYY-MM-DD' },
        },
      },
    },
  },
  {
    id: 'pedido.tendencia',
    produto: 'pedido',
    classe: 'READ',
    metodo: 'GET',
    endpoint: '/api/v1/pedidos/dashboard/tendencia',
    descricao: 'Serie temporal mensal/semanal de pedidos',
    schema_params: pedidoTendenciaParams,
    gemini_declaration: {
      name: 'pedido.tendencia',
      description: 'Retorna serie temporal de pedidos (mensal ou semanal). Use para graficos de evolucao, tendencias.',
      parameters: {
        type: 'OBJECT',
        properties: {
          period: { type: 'STRING', description: 'Periodo: 7d|30d|90d|6m|12m|ytd' },
          granularity: { type: 'STRING', enum: ['month', 'week'], description: 'Granularidade: month ou week' },
        },
      },
    },
  },
  {
    id: 'pedido.distribuicao',
    produto: 'pedido',
    classe: 'READ',
    metodo: 'GET',
    endpoint: '/api/v1/pedidos/dashboard/distribuicao',
    descricao: 'Distribuicao de pedidos por status',
    schema_params: pedidoDistribuicaoParams,
    gemini_declaration: {
      name: 'pedido.distribuicao',
      description: 'Distribuicao de pedidos por status com valores. Use para "quanto tenho por status", graficos de pizza.',
      parameters: {
        type: 'OBJECT',
        properties: {
          period: { type: 'STRING', description: 'Periodo de filtro' },
        },
      },
    },
  },
  {
    id: 'pedido.insights',
    produto: 'pedido',
    classe: 'READ',
    metodo: 'GET',
    endpoint: '/api/v1/pedidos/dashboard/insights',
    descricao: 'Insights personalizados do dashboard',
    schema_params: pedidoInsightsParams,
    gemini_declaration: {
      name: 'pedido.insights',
      description: 'Retorna insights personalizados baseados nos dados do usuario. Use para "alguma sugestao?", "o que devo observar?".',
      parameters: {
        type: 'OBJECT',
        properties: {
          period: { type: 'STRING', description: 'Periodo' },
          role: { type: 'STRING', description: 'Papel do usuario para filtrar insights' },
        },
      },
    },
  },
  {
    id: 'pedido.inicializacao',
    produto: 'pedido',
    classe: 'READ',
    metodo: 'GET',
    endpoint: '/api/v1/pedidos/inicializacao',
    descricao: 'Status + preferencias + primeira pagina de pedidos',
    schema_params: pedidoInicializacaoParams,
    gemini_declaration: {
      name: 'pedido.inicializacao',
      description: 'Carrega dados iniciais da lista de pedidos: pedidos, status disponiveis, preferencias do usuario.',
      parameters: {
        type: 'OBJECT',
        properties: {
          limit: { type: 'NUMBER', description: 'Quantidade de pedidos na primeira pagina' },
        },
      },
    },
  },
  {
    id: 'pedido.snapshot_status',
    produto: 'pedido',
    classe: 'READ',
    metodo: 'GET',
    endpoint: '/api/v1/pedidos/:id_pedido/snapshot-status',
    descricao: 'Historico de congelamentos do pedido',
    schema_params: pedidoSnapshotStatusParams,
    gemini_declaration: {
      name: 'pedido.snapshot_status',
      description: 'Verifica o status de congelamento (snapshot) de um pedido. Mostra quais dados estao congelados e por que.',
      parameters: {
        type: 'OBJECT',
        properties: {
          id_pedido: { type: 'STRING', description: 'ID do pedido (obrigatorio)' },
        },
        required: ['id_pedido'],
      },
    },
  },
  {
    id: 'pedido.colunas_usuario',
    produto: 'pedido',
    classe: 'READ',
    metodo: 'GET',
    endpoint: '/api/v1/pedidos/colunas-usuario',
    descricao: 'Colunas customizadas do usuario',
    schema_params: pedidoColunasUsuarioParams,
    gemini_declaration: {
      name: 'pedido.colunas_usuario',
      description: 'Lista as colunas customizadas criadas pelo usuario na tabela de pedidos.',
      parameters: { type: 'OBJECT', properties: {} },
    },
  },
  {
    id: 'pedido.dataset_bruto',
    produto: 'pedido',
    classe: 'READ',
    metodo: 'GET',
    endpoint: '/api/v1/pedidos/analytics/dataset-bruto',
    descricao: 'Dataset bruto para relatorios e analytics',
    schema_params: pedidoDatasetBrutoParams,
    gemini_declaration: {
      name: 'pedido.dataset_bruto',
      description: 'Retorna dataset bruto paginado dos pedidos para analises avancadas e relatorios.',
      parameters: {
        type: 'OBJECT',
        properties: {
          period: { type: 'STRING', description: 'Periodo de filtro' },
          page: { type: 'NUMBER', description: 'Pagina (minimo 1)' },
          pageSize: { type: 'NUMBER', description: 'Itens por pagina (max 10000)' },
        },
      },
    },
  },

  // ════════════════════════════════════════════════════════════════════════════
  // PEDIDO — WRITE
  // ════════════════════════════════════════════════════════════════════════════

  {
    id: 'pedido.criar',
    produto: 'pedido',
    classe: 'WRITE_SAFE',
    metodo: 'POST',
    endpoint: '/api/v1/pedidos',
    descricao: 'Criar novo pedido',
    schema_params: pedidoCriarParams,
    gemini_declaration: {
      name: 'pedido.criar',
      description: 'Cria um novo pedido de importacao. Peca confirmacao antes de criar.',
      parameters: {
        type: 'OBJECT',
        properties: {
          numero_pedido: { type: 'STRING', description: 'Numero do pedido (opcional, gerado automaticamente se omitido)' },
          exportador_pedido: { type: 'STRING', description: 'Nome do exportador/fornecedor' },
          importador_pedido: { type: 'STRING', description: 'Nome do importador' },
          incoterm_pedido: { type: 'STRING', description: 'INCOTERM (FOB, CIF, EXW, etc.)' },
          moeda_pedido: { type: 'STRING', description: 'Moeda (USD, EUR, etc.)' },
        },
      },
    },
  },
  {
    id: 'pedido.editar',
    produto: 'pedido',
    classe: 'WRITE_SAFE',
    metodo: 'PATCH',
    endpoint: '/api/v1/pedidos/:id_pedido',
    descricao: 'Editar campos de um pedido',
    schema_params: pedidoEditarParams,
    gemini_declaration: {
      name: 'pedido.editar',
      description: 'Edita campos de um pedido existente. Informe quais campos serao alterados.',
      parameters: {
        type: 'OBJECT',
        properties: {
          id_pedido: { type: 'STRING', description: 'ID do pedido (obrigatorio)' },
          campos: { type: 'OBJECT', description: 'Campos a alterar: { nome_campo: novo_valor }' },
        },
        required: ['id_pedido', 'campos'],
      },
    },
  },
  {
    id: 'pedido.excluir_preview',
    produto: 'pedido',
    classe: 'READ',
    metodo: 'POST',
    endpoint: '/api/v1/pedidos/exclusoes/preview',
    descricao: 'Preview de exclusao — quais podem ser excluidos',
    schema_params: pedidoExcluirPreviewParams,
    gemini_declaration: {
      name: 'pedido.excluir_preview',
      description: 'Mostra quais pedidos podem ser excluidos e quais estao bloqueados. Use ANTES de excluir.',
      parameters: {
        type: 'OBJECT',
        properties: {
          ids: { type: 'ARRAY', items: { type: 'STRING' }, description: 'IDs dos pedidos a verificar' },
        },
        required: ['ids'],
      },
    },
  },
  {
    id: 'pedido.excluir',
    produto: 'pedido',
    classe: 'WRITE_DESTRUTIVA',
    metodo: 'POST',
    endpoint: '/api/v1/pedidos/exclusoes/confirmar',
    descricao: 'Excluir pedidos (irreversivel)',
    schema_params: pedidoExcluirConfirmarParams,
    gemini_declaration: {
      name: 'pedido.excluir',
      description: 'Exclui pedidos permanentemente. SEMPRE mostre o preview antes e peca confirmacao explicita.',
      parameters: {
        type: 'OBJECT',
        properties: {
          ids: { type: 'ARRAY', items: { type: 'STRING' }, description: 'IDs dos pedidos a excluir' },
        },
        required: ['ids'],
      },
    },
  },
  {
    id: 'pedido.edicao_massa_preview',
    produto: 'pedido',
    classe: 'READ',
    metodo: 'POST',
    endpoint: '/api/v1/pedidos/edicoes-em-massa/preview',
    descricao: 'Preview de edicao em massa',
    schema_params: pedidoEdicaoMassaPreviewParams,
    gemini_declaration: {
      name: 'pedido.edicao_massa_preview',
      description: 'Mostra o impacto de uma edicao em massa antes de executar.',
      parameters: {
        type: 'OBJECT',
        properties: {
          pedido_ids: { type: 'ARRAY', items: { type: 'STRING' }, description: 'IDs dos pedidos' },
          campos: { type: 'ARRAY', items: { type: 'OBJECT' }, description: 'Campos a editar: [{ campo, tipo, nivel, operacao, valor }]' },
          nivel: { type: 'STRING', enum: ['pedido', 'item', 'combinado'], description: 'Nivel da edicao' },
        },
        required: ['pedido_ids', 'campos', 'nivel'],
      },
    },
  },
  {
    id: 'pedido.edicao_massa',
    produto: 'pedido',
    classe: 'WRITE_DESTRUTIVA',
    metodo: 'POST',
    endpoint: '/api/v1/pedidos/edicoes-em-massa/confirmar',
    descricao: 'Executar edicao em massa',
    schema_params: pedidoEdicaoMassaConfirmarParams,
    gemini_declaration: {
      name: 'pedido.edicao_massa',
      description: 'Executa edicao em massa nos pedidos selecionados. SEMPRE mostre preview antes.',
      parameters: {
        type: 'OBJECT',
        properties: {
          pedido_ids: { type: 'ARRAY', items: { type: 'STRING' }, description: 'IDs dos pedidos' },
          campos: { type: 'ARRAY', items: { type: 'OBJECT' }, description: 'Campos a editar' },
          nivel: { type: 'STRING', enum: ['pedido', 'item', 'combinado'] },
        },
        required: ['pedido_ids', 'campos', 'nivel'],
      },
    },
  },
  {
    id: 'pedido.consolidar_preview',
    produto: 'pedido',
    classe: 'READ',
    metodo: 'POST',
    endpoint: '/api/v1/pedidos/consolidacoes/preview',
    descricao: 'Preview de consolidacao de pedidos',
    schema_params: pedidoConsolidarPreviewParams,
    gemini_declaration: {
      name: 'pedido.consolidar_preview',
      description: 'Mostra o impacto de consolidar (fundir) pedidos: divergencias, campos iguais, itens combinados.',
      parameters: {
        type: 'OBJECT',
        properties: {
          ids: { type: 'ARRAY', items: { type: 'STRING' }, description: 'IDs dos pedidos a consolidar (minimo 2)' },
        },
        required: ['ids'],
      },
    },
  },
  {
    id: 'pedido.consolidar',
    produto: 'pedido',
    classe: 'WRITE_DESTRUTIVA',
    metodo: 'POST',
    endpoint: '/api/v1/pedidos/consolidacoes/confirmar',
    descricao: 'Consolidar (fundir) pedidos em um unico',
    schema_params: pedidoConsolidarConfirmarParams,
    gemini_declaration: {
      name: 'pedido.consolidar',
      description: 'Consolida multiplos pedidos em um unico. SEMPRE mostre preview antes e peca confirmacao.',
      parameters: {
        type: 'OBJECT',
        properties: {
          ids: { type: 'ARRAY', items: { type: 'STRING' }, description: 'IDs dos pedidos a consolidar' },
          numero_pedido: { type: 'STRING', description: 'Numero do pedido consolidado' },
          campos_escolhidos: { type: 'OBJECT', description: 'Campos escolhidos nas divergencias' },
          fundir_itens_mesmo_part_number: { type: 'BOOLEAN', description: 'Fundir itens com mesmo part number?' },
        },
        required: ['ids', 'numero_pedido', 'campos_escolhidos', 'fundir_itens_mesmo_part_number'],
      },
    },
  },
  {
    id: 'pedido.transferir_preview',
    produto: 'pedido',
    classe: 'READ',
    metodo: 'POST',
    endpoint: '/api/v1/pedidos/:id_pedido/transferencias/preview',
    descricao: 'Preview de transferencia de itens',
    schema_params: pedidoTransferirPreviewParams,
    gemini_declaration: {
      name: 'pedido.transferir_preview',
      description: 'Mostra o impacto de transferir itens entre pedidos antes de executar.',
      parameters: {
        type: 'OBJECT',
        properties: {
          id_pedido: { type: 'STRING', description: 'ID do pedido de origem' },
          cenario: { type: 'STRING', description: 'Tipo: reducao_simples|split_novo_pedido|split_pedido_existente|multi_split' },
          item_id: { type: 'STRING', description: 'ID do item a transferir' },
          quantidade_origem: { type: 'NUMBER', description: 'Quantidade no item de origem' },
          destinos: { type: 'ARRAY', items: { type: 'OBJECT' }, description: 'Destinos: [{ tipo, pedido_id?, quantidade }]' },
        },
        required: ['id_pedido', 'cenario', 'item_id', 'quantidade_origem', 'destinos'],
      },
    },
  },
  {
    id: 'pedido.transferir',
    produto: 'pedido',
    classe: 'WRITE_DESTRUTIVA',
    metodo: 'POST',
    endpoint: '/api/v1/pedidos/:id_pedido/transferencias/confirmar',
    descricao: 'Transferir itens entre pedidos',
    schema_params: pedidoTransferirConfirmarParams,
    gemini_declaration: {
      name: 'pedido.transferir',
      description: 'Transfere itens entre pedidos. SEMPRE mostre preview antes e peca confirmacao.',
      parameters: {
        type: 'OBJECT',
        properties: {
          id_pedido: { type: 'STRING', description: 'ID do pedido de origem' },
          cenario: { type: 'STRING' },
          item_id: { type: 'STRING' },
          quantidade_origem: { type: 'NUMBER' },
          destinos: { type: 'ARRAY', items: { type: 'OBJECT' } },
          numero_pedido_novo: { type: 'STRING', description: 'Numero do novo pedido (se split_novo_pedido)' },
        },
        required: ['id_pedido', 'cenario', 'item_id', 'quantidade_origem', 'destinos'],
      },
    },
  },
  {
    id: 'pedido.duplicar_preview',
    produto: 'pedido',
    classe: 'READ',
    metodo: 'POST',
    endpoint: '/api/v1/pedidos/duplicacoes/preview',
    descricao: 'Preview de duplicacao de pedidos',
    schema_params: pedidoDuplicarPreviewParams,
    gemini_declaration: {
      name: 'pedido.duplicar_preview',
      description: 'Mostra o que sera duplicado antes de executar.',
      parameters: {
        type: 'OBJECT',
        properties: {
          ids: { type: 'ARRAY', items: { type: 'STRING' }, description: 'IDs dos pedidos a duplicar' },
        },
        required: ['ids'],
      },
    },
  },
  {
    id: 'pedido.duplicar',
    produto: 'pedido',
    classe: 'WRITE_SAFE',
    metodo: 'POST',
    endpoint: '/api/v1/pedidos/duplicacoes/confirmar',
    descricao: 'Duplicar pedidos',
    schema_params: pedidoDuplicarConfirmarParams,
    gemini_declaration: {
      name: 'pedido.duplicar',
      description: 'Duplica pedidos selecionados. Peca confirmacao antes.',
      parameters: {
        type: 'OBJECT',
        properties: {
          ids: { type: 'ARRAY', items: { type: 'STRING' }, description: 'IDs dos pedidos a duplicar' },
          opcoes: { type: 'OBJECT', description: 'Opcoes: { copiar_datas, copiar_valores_precos, copiar_referencias_externas, copiar_pesos_cubagem, copiar_descricoes_complementares }' },
        },
        required: ['ids'],
      },
    },
  },
  {
    id: 'pedido.alterar_status_lote_preview',
    produto: 'pedido',
    classe: 'READ',
    metodo: 'POST',
    endpoint: '/api/v1/pedidos/alteracoes-status-lote/preview',
    descricao: 'Preview de alteracao de status em lote',
    schema_params: pedidoAlterarStatusLotePreviewParams,
    gemini_declaration: {
      name: 'pedido.alterar_status_lote_preview',
      description: 'Mostra quais pedidos podem ter o status alterado e quais estao bloqueados.',
      parameters: {
        type: 'OBJECT',
        properties: {
          ids: { type: 'ARRAY', items: { type: 'STRING' }, description: 'IDs dos pedidos' },
          status_novo: { type: 'STRING', description: 'Novo status: rascunho|aberto|em_andamento|aprovado|cancelado' },
        },
        required: ['ids', 'status_novo'],
      },
    },
  },
  {
    id: 'pedido.alterar_status_lote',
    produto: 'pedido',
    classe: 'WRITE_DESTRUTIVA',
    metodo: 'POST',
    endpoint: '/api/v1/pedidos/alteracoes-status-lote/confirmar',
    descricao: 'Alterar status de pedidos em lote',
    schema_params: pedidoAlterarStatusLoteConfirmarParams,
    gemini_declaration: {
      name: 'pedido.alterar_status_lote',
      description: 'Altera o status de multiplos pedidos. SEMPRE mostre preview antes e peca confirmacao.',
      parameters: {
        type: 'OBJECT',
        properties: {
          ids: { type: 'ARRAY', items: { type: 'STRING' } },
          status_novo: { type: 'STRING' },
        },
        required: ['ids', 'status_novo'],
      },
    },
  },

  // ════════════════════════════════════════════════════════════════════════════
  // CONFIGURADOR — READ
  // ════════════════════════════════════════════════════════════════════════════

  {
    id: 'config.me',
    produto: 'configurador',
    classe: 'READ',
    metodo: 'GET',
    endpoint: '/api/v1/me',
    descricao: 'Perfil completo do usuario: dados, org, workspaces, produtos',
    schema_params: configMeParams,
    gemini_declaration: {
      name: 'config.me',
      description: 'Retorna perfil completo do usuario: nome, email, tipo, organizacao, workspaces ativos e produtos. Use para "quem sou eu", "meu perfil", "minhas permissoes".',
      parameters: { type: 'OBJECT', properties: {} },
    },
  },
  {
    id: 'config.listar_workspaces',
    produto: 'configurador',
    classe: 'READ',
    metodo: 'GET',
    endpoint: '/api/v1/me/workspaces',
    descricao: 'Workspaces do usuario',
    schema_params: configListarWorkspacesParams,
    gemini_declaration: {
      name: 'config.listar_workspaces',
      description: 'Lista os workspaces (filiais) do usuario.',
      parameters: { type: 'OBJECT', properties: {} },
    },
  },
  {
    id: 'config.detalhar_workspace',
    produto: 'configurador',
    classe: 'READ',
    metodo: 'GET',
    endpoint: '/api/v1/me/workspaces/:id_workspace',
    descricao: 'Detalhes de 1 workspace',
    schema_params: configDetalharWorkspaceParams,
    gemini_declaration: {
      name: 'config.detalhar_workspace',
      description: 'Detalhes de um workspace especifico.',
      parameters: {
        type: 'OBJECT',
        properties: {
          id_workspace: { type: 'STRING', description: 'ID do workspace (obrigatorio)' },
        },
        required: ['id_workspace'],
      },
    },
  },
  {
    id: 'config.listar_usuarios',
    produto: 'configurador',
    classe: 'READ',
    metodo: 'GET',
    endpoint: '/api/v1/usuarios',
    descricao: 'Usuarios da organizacao',
    schema_params: configListarUsuariosParams,
    gemini_declaration: {
      name: 'config.listar_usuarios',
      description: 'Lista todos os usuarios da organizacao com seus vinculos de workspace e patentes.',
      parameters: { type: 'OBJECT', properties: {} },
    },
  },
  {
    id: 'config.detalhar_usuario',
    produto: 'configurador',
    classe: 'READ',
    metodo: 'GET',
    endpoint: '/api/v1/usuarios/:id_usuario',
    descricao: 'Perfil + vinculos de 1 usuario',
    schema_params: configDetalharUsuarioParams,
    gemini_declaration: {
      name: 'config.detalhar_usuario',
      description: 'Perfil completo de um usuario com vinculos de workspace.',
      parameters: {
        type: 'OBJECT',
        properties: {
          id_usuario: { type: 'STRING', description: 'ID do usuario (obrigatorio)' },
        },
        required: ['id_usuario'],
      },
    },
  },
  {
    id: 'config.organizacao',
    produto: 'configurador',
    classe: 'READ',
    metodo: 'GET',
    endpoint: '/api/v1/organizacoes/me',
    descricao: 'Dados da organizacao atual',
    schema_params: configOrganizacaoParams,
    gemini_declaration: {
      name: 'config.organizacao',
      description: 'Dados da organizacao do usuario: nome, CNPJ, estado, cidade, segmento.',
      parameters: { type: 'OBJECT', properties: {} },
    },
  },
  {
    id: 'config.produtos_ativos',
    produto: 'configurador',
    classe: 'READ',
    metodo: 'GET',
    endpoint: '/api/v1/produtos-gravity',
    descricao: 'Catalogo de produtos Gravity',
    schema_params: configProdutosAtivosParams,
    gemini_declaration: {
      name: 'config.produtos_ativos',
      description: 'Lista todos os produtos disponiveis na plataforma Gravity com precos e descricoes.',
      parameters: { type: 'OBJECT', properties: {} },
    },
  },
  {
    id: 'config.assinaturas',
    produto: 'configurador',
    classe: 'READ',
    metodo: 'GET',
    endpoint: '/api/v1/organizacoes/me/assinaturas-produto-gravity',
    descricao: 'Assinaturas ativas da organizacao',
    schema_params: configAssinaturasParams,
    gemini_declaration: {
      name: 'config.assinaturas',
      description: 'Lista as assinaturas ativas da organizacao: quais produtos estao contratados, status, periodo.',
      parameters: { type: 'OBJECT', properties: {} },
    },
  },
  {
    id: 'config.historico',
    produto: 'configurador',
    classe: 'READ',
    metodo: 'GET',
    endpoint: '/api/v1/admin/historico-global/logs',
    descricao: 'Historico de auditoria da organizacao',
    schema_params: configHistoricoParams,
    gemini_declaration: {
      name: 'config.historico',
      description: 'Consulta o historico de auditoria: acoes dos usuarios, alteracoes, logins.',
      parameters: {
        type: 'OBJECT',
        properties: {
          limit: { type: 'NUMBER', description: 'Maximo de registros (padrao: 50, max: 200)' },
          tipo_ator_historico_log: { type: 'STRING', description: 'Tipo de ator: USUARIO|API|IA|JOB|INTEGRACAO' },
          search: { type: 'STRING', description: 'Busca textual nos logs' },
        },
      },
    },
  },

  // ════════════════════════════════════════════════════════════════════════════
  // CONFIGURADOR — WRITE
  // ════════════════════════════════════════════════════════════════════════════

  {
    id: 'config.criar_workspace',
    produto: 'configurador',
    classe: 'WRITE_SAFE',
    metodo: 'POST',
    endpoint: '/api/v1/me/workspaces',
    descricao: 'Criar workspace (filial)',
    permissao_minima: 'MASTER',
    schema_params: configCriarWorkspaceParams,
    gemini_declaration: {
      name: 'config.criar_workspace',
      description: 'Cria um novo workspace (filial) na organizacao. Requer patente MASTER.',
      parameters: {
        type: 'OBJECT',
        properties: {
          nome_workspace: { type: 'STRING', description: 'Nome do workspace (minimo 2 caracteres)' },
          subdominio_workspace: { type: 'STRING', description: 'Subdominio (opcional, gerado automaticamente)' },
          cnpj_workspace: { type: 'STRING', description: 'CNPJ do workspace (opcional)' },
        },
        required: ['nome_workspace'],
      },
    },
  },
  {
    id: 'config.editar_workspace',
    produto: 'configurador',
    classe: 'WRITE_SAFE',
    metodo: 'PATCH',
    endpoint: '/api/v1/me/workspaces/:id_workspace',
    descricao: 'Editar workspace',
    permissao_minima: 'MASTER',
    schema_params: configEditarWorkspaceParams,
    gemini_declaration: {
      name: 'config.editar_workspace',
      description: 'Edita dados de um workspace existente.',
      parameters: {
        type: 'OBJECT',
        properties: {
          id_workspace: { type: 'STRING', description: 'ID do workspace (obrigatorio)' },
          nome_workspace: { type: 'STRING' },
          status_workspace: { type: 'STRING', enum: ['ATIVO', 'INATIVO'] },
        },
        required: ['id_workspace'],
      },
    },
  },
  {
    id: 'config.excluir_workspace',
    produto: 'configurador',
    classe: 'WRITE_DESTRUTIVA',
    metodo: 'DELETE',
    endpoint: '/api/v1/me/workspaces/:id_workspace',
    descricao: 'Excluir workspace',
    permissao_minima: 'MASTER',
    schema_params: configExcluirWorkspaceParams,
    gemini_declaration: {
      name: 'config.excluir_workspace',
      description: 'Exclui um workspace permanentemente. ACAO DESTRUTIVA — peca confirmacao explicita.',
      parameters: {
        type: 'OBJECT',
        properties: {
          id_workspace: { type: 'STRING', description: 'ID do workspace a excluir (obrigatorio)' },
        },
        required: ['id_workspace'],
      },
    },
  },
  {
    id: 'config.convidar_usuario',
    produto: 'configurador',
    classe: 'WRITE_SAFE',
    metodo: 'POST',
    endpoint: '/api/v1/usuarios/convidar',
    descricao: 'Convidar usuario para a organizacao',
    permissao_minima: 'MASTER',
    schema_params: configConvidarUsuarioParams,
    gemini_declaration: {
      name: 'config.convidar_usuario',
      description: 'Convida um usuario para a organizacao por email. Requer patente MASTER.',
      parameters: {
        type: 'OBJECT',
        properties: {
          email_usuario: { type: 'STRING', description: 'Email do usuario a convidar' },
          nome_usuario: { type: 'STRING', description: 'Nome do usuario' },
          tipo_usuario: { type: 'STRING', enum: ['MASTER', 'PADRAO', 'FORNECEDOR'], description: 'Patente (padrao: PADRAO)' },
          workspaces_alvo: { type: 'STRING', description: '"all" para todos os workspaces, ou lista de IDs' },
        },
        required: ['email_usuario', 'nome_usuario'],
      },
    },
  },
  {
    id: 'config.vincular_workspace',
    produto: 'configurador',
    classe: 'WRITE_SAFE',
    metodo: 'POST',
    endpoint: '/api/v1/usuarios/:id_usuario/vinculos',
    descricao: 'Vincular usuario a workspace',
    permissao_minima: 'MASTER',
    schema_params: configVincularWorkspaceParams,
    gemini_declaration: {
      name: 'config.vincular_workspace',
      description: 'Vincula um usuario a um workspace com uma patente especifica.',
      parameters: {
        type: 'OBJECT',
        properties: {
          id_usuario: { type: 'STRING', description: 'ID do usuario' },
          id_workspace: { type: 'STRING', description: 'ID do workspace' },
          tipo_usuario_workspace: { type: 'STRING', enum: ['MASTER', 'PADRAO', 'FORNECEDOR'], description: 'Patente no workspace' },
        },
        required: ['id_usuario', 'id_workspace'],
      },
    },
  },
  {
    id: 'config.alterar_patente',
    produto: 'configurador',
    classe: 'WRITE_DESTRUTIVA',
    metodo: 'PATCH',
    endpoint: '/api/v1/usuarios/:id_usuario/patente',
    descricao: 'Alterar patente (nivel de acesso) de usuario',
    permissao_minima: 'MASTER',
    schema_params: configAlterarPatenteParams,
    gemini_declaration: {
      name: 'config.alterar_patente',
      description: 'Altera o nivel de acesso (patente) de um usuario. ACAO SENSIVEL — peca confirmacao.',
      parameters: {
        type: 'OBJECT',
        properties: {
          id_usuario: { type: 'STRING', description: 'ID do usuario' },
          tipo_usuario: { type: 'STRING', enum: ['SUPER_ADMIN', 'ADMIN', 'MASTER', 'PADRAO', 'FORNECEDOR'], description: 'Nova patente' },
        },
        required: ['id_usuario', 'tipo_usuario'],
      },
    },
  },
  {
    id: 'config.alterar_status_usuario',
    produto: 'configurador',
    classe: 'WRITE_DESTRUTIVA',
    metodo: 'PATCH',
    endpoint: '/api/v1/usuarios/:id_usuario/status',
    descricao: 'Ativar/desativar usuario',
    permissao_minima: 'MASTER',
    schema_params: configAlterarStatusUsuarioParams,
    gemini_declaration: {
      name: 'config.alterar_status_usuario',
      description: 'Ativa ou desativa um usuario na organizacao. ACAO SENSIVEL — peca confirmacao.',
      parameters: {
        type: 'OBJECT',
        properties: {
          id_usuario: { type: 'STRING', description: 'ID do usuario' },
          status_usuario: { type: 'STRING', enum: ['ATIVO', 'INATIVO'], description: 'Novo status' },
        },
        required: ['id_usuario', 'status_usuario'],
      },
    },
  },
  {
    id: 'config.editar_organizacao',
    produto: 'configurador',
    classe: 'WRITE_SAFE',
    metodo: 'PATCH',
    endpoint: '/api/v1/organizacoes/me',
    descricao: 'Editar dados da organizacao',
    permissao_minima: 'MASTER',
    schema_params: configEditarOrganizacaoParams,
    gemini_declaration: {
      name: 'config.editar_organizacao',
      description: 'Edita dados da organizacao: nome, CNPJ, estado, cidade, segmento.',
      parameters: {
        type: 'OBJECT',
        properties: {
          nome_organizacao: { type: 'STRING', description: 'Novo nome' },
          cnpj_organizacao: { type: 'STRING', description: 'CNPJ formatado' },
          estado_organizacao: { type: 'STRING', description: 'UF (2 caracteres)' },
          cidade_organizacao: { type: 'STRING', description: 'Cidade' },
        },
      },
    },
  },

  // ════════════════════════════════════════════════════════════════════════════
  // ADMIN — READ (somente ADMIN/SUPER_ADMIN)
  // ════════════════════════════════════════════════════════════════════════════

  {
    id: 'admin.listar_orgs',
    produto: 'admin',
    classe: 'READ',
    metodo: 'GET',
    endpoint: '/api/v1/admin/organizacoes',
    descricao: 'Listar todas as organizacoes',
    permissao_minima: 'ADMIN',
    schema_params: adminListarOrgsParams,
    gemini_declaration: {
      name: 'admin.listar_orgs',
      description: 'Lista todas as organizacoes da plataforma. Somente ADMIN/SUPER_ADMIN.',
      parameters: {
        type: 'OBJECT',
        properties: {
          page: { type: 'NUMBER', description: 'Pagina (padrao: 1)' },
          limit: { type: 'NUMBER', description: 'Itens por pagina (padrao: 20)' },
          search: { type: 'STRING', description: 'Busca por nome ou subdominio' },
        },
      },
    },
  },
  {
    id: 'admin.detalhar_org',
    produto: 'admin',
    classe: 'READ',
    metodo: 'GET',
    endpoint: '/api/v1/admin/organizacoes/:id_organizacao',
    descricao: 'Detalhes de 1 organizacao',
    permissao_minima: 'ADMIN',
    schema_params: adminDetalharOrgParams,
    gemini_declaration: {
      name: 'admin.detalhar_org',
      description: 'Detalhes completos de uma organizacao.',
      parameters: {
        type: 'OBJECT',
        properties: {
          id_organizacao: { type: 'STRING', description: 'ID da organizacao' },
        },
        required: ['id_organizacao'],
      },
    },
  },
  {
    id: 'admin.listar_produtos',
    produto: 'admin',
    classe: 'READ',
    metodo: 'GET',
    endpoint: '/api/v1/admin/produtos-gravity',
    descricao: 'Catalogo global de produtos',
    permissao_minima: 'ADMIN',
    schema_params: adminListarProdutosParams,
    gemini_declaration: {
      name: 'admin.listar_produtos',
      description: 'Catalogo global de produtos Gravity (visao admin).',
      parameters: { type: 'OBJECT', properties: {} },
    },
  },
  {
    id: 'admin.seguranca_eventos',
    produto: 'admin',
    classe: 'READ',
    metodo: 'GET',
    endpoint: '/api/v1/admin/seguranca/eventos',
    descricao: 'Eventos de seguranca',
    permissao_minima: 'ADMIN',
    schema_params: adminSegurancaEventosParams,
    gemini_declaration: {
      name: 'admin.seguranca_eventos',
      description: 'Eventos de seguranca da plataforma: logins suspeitos, tentativas de acesso negadas.',
      parameters: {
        type: 'OBJECT',
        properties: {
          limit: { type: 'NUMBER', description: 'Maximo de eventos' },
        },
      },
    },
  },
  {
    id: 'admin.historico_global',
    produto: 'admin',
    classe: 'READ',
    metodo: 'GET',
    endpoint: '/api/v1/admin/historico-global/logs',
    descricao: 'Auditoria global (cross-organizacao)',
    permissao_minima: 'ADMIN',
    schema_params: adminHistoricoGlobalParams,
    gemini_declaration: {
      name: 'admin.historico_global',
      description: 'Historico global de auditoria de toda a plataforma. Somente ADMIN.',
      parameters: {
        type: 'OBJECT',
        properties: {
          limit: { type: 'NUMBER' },
          search: { type: 'STRING' },
        },
      },
    },
  },
  {
    id: 'admin.usuarios_globais',
    produto: 'admin',
    classe: 'READ',
    metodo: 'GET',
    endpoint: '/api/v1/admin/usuarios',
    descricao: 'Todos os usuarios da plataforma',
    permissao_minima: 'ADMIN',
    schema_params: adminUsuariosGlobaisParams,
    gemini_declaration: {
      name: 'admin.usuarios_globais',
      description: 'Lista todos os usuarios de todas as organizacoes. Somente ADMIN.',
      parameters: { type: 'OBJECT', properties: {} },
    },
  },

  // ════════════════════════════════════════════════════════════════════════════
  // ADMIN — WRITE
  // ════════════════════════════════════════════════════════════════════════════

  {
    id: 'admin.editar_org',
    produto: 'admin',
    classe: 'WRITE_DESTRUTIVA',
    metodo: 'PATCH',
    endpoint: '/api/v1/admin/organizacoes/:id_organizacao',
    descricao: 'Editar organizacao (admin)',
    permissao_minima: 'ADMIN',
    schema_params: adminEditarOrgParams,
    gemini_declaration: {
      name: 'admin.editar_org',
      description: 'Edita uma organizacao (status, nome, subdominio). ACAO ADMIN — peca confirmacao.',
      parameters: {
        type: 'OBJECT',
        properties: {
          id_organizacao: { type: 'STRING' },
          status_organizacao: { type: 'STRING', enum: ['ATIVO', 'SUSPENSO', 'CANCELADO'] },
          nome_organizacao: { type: 'STRING' },
        },
        required: ['id_organizacao'],
      },
    },
  },
  {
    id: 'admin.editar_produto',
    produto: 'admin',
    classe: 'WRITE_DESTRUTIVA',
    metodo: 'PATCH',
    endpoint: '/api/v1/admin/produtos-gravity/:id_produto_gravity',
    descricao: 'Editar produto global (admin)',
    permissao_minima: 'ADMIN',
    schema_params: adminEditarProdutoParams,
    gemini_declaration: {
      name: 'admin.editar_produto',
      description: 'Edita um produto global da plataforma. ACAO ADMIN — peca confirmacao.',
      parameters: {
        type: 'OBJECT',
        properties: {
          id_produto_gravity: { type: 'STRING' },
          nome_produto_gravity: { type: 'STRING' },
          status_produto_gravity: { type: 'STRING' },
        },
        required: ['id_produto_gravity'],
      },
    },
  },
  {
    id: 'admin.ativar_produto_org',
    produto: 'admin',
    classe: 'WRITE_DESTRUTIVA',
    metodo: 'POST',
    endpoint: '/api/v1/admin/organizacoes/:id_organizacao/produtos',
    descricao: 'Ativar produto para organizacao',
    permissao_minima: 'ADMIN',
    schema_params: adminAtivarProdutoOrgParams,
    gemini_declaration: {
      name: 'admin.ativar_produto_org',
      description: 'Ativa um produto para uma organizacao. ACAO ADMIN — peca confirmacao.',
      parameters: {
        type: 'OBJECT',
        properties: {
          id_organizacao: { type: 'STRING' },
          slug_produto_gravity: { type: 'STRING', description: 'Slug do produto a ativar' },
        },
        required: ['id_organizacao', 'slug_produto_gravity'],
      },
    },
  },

  // ════════════════════════════════════════════════════════════════════════════
  // HUB / CORE — READ
  // ════════════════════════════════════════════════════════════════════════════

  {
    id: 'hub.init',
    produto: 'hub',
    classe: 'READ',
    metodo: 'GET',
    endpoint: '/api/v1/hub/init',
    descricao: 'Dados de inicializacao do Hub',
    schema_params: hubInitParams,
    gemini_declaration: {
      name: 'hub.init',
      description: 'Carrega dados iniciais do Hub: menus, modulos ativos.',
      parameters: { type: 'OBJECT', properties: {} },
    },
  },
  {
    id: 'core.dashboard',
    produto: 'hub',
    classe: 'READ',
    metodo: 'GET',
    endpoint: '/api/v1/core/kpis',
    descricao: 'KPIs consolidados cross-produto',
    schema_params: coreDashboardParams,
    gemini_declaration: {
      name: 'core.dashboard',
      description: 'KPIs consolidados de todos os produtos: pedidos em andamento, NFs, etc.',
      parameters: { type: 'OBJECT', properties: {} },
    },
  },
  {
    id: 'core.processos_recentes',
    produto: 'hub',
    classe: 'READ',
    metodo: 'GET',
    endpoint: '/api/v1/core/processos-recentes',
    descricao: 'Ultimos processos do usuario',
    schema_params: coreProcessosRecentesParams,
    gemini_declaration: {
      name: 'core.processos_recentes',
      description: 'Lista os processos mais recentes do usuario em todos os produtos.',
      parameters: {
        type: 'OBJECT',
        properties: {
          limite: { type: 'NUMBER', description: 'Maximo de processos (padrao: 10)' },
        },
      },
    },
  },

  // ════════════════════════════════════════════════════════════════════════════
  // STORE — READ
  // ════════════════════════════════════════════════════════════════════════════

  {
    id: 'store.catalogo',
    produto: 'store',
    classe: 'READ',
    metodo: 'GET',
    endpoint: '/api/v1/catalogo/produtos-gravity',
    descricao: 'Catalogo publico de produtos Gravity',
    schema_params: storeCatalogoParams,
    gemini_declaration: {
      name: 'store.catalogo',
      description: 'Lista os produtos disponiveis na Gravity Store com precos e descricoes.',
      parameters: { type: 'OBJECT', properties: {} },
    },
  },
  {
    id: 'store.detalhe_produto',
    produto: 'store',
    classe: 'READ',
    metodo: 'GET',
    endpoint: '/api/v1/catalogo/produtos-gravity/:slug',
    descricao: 'Detalhes de 1 produto na loja',
    schema_params: storeDetalheProdutoParams,
    gemini_declaration: {
      name: 'store.detalhe_produto',
      description: 'Detalhes de um produto da Gravity Store: recursos, precos, planos.',
      parameters: {
        type: 'OBJECT',
        properties: {
          slug: { type: 'STRING', description: 'Slug do produto (obrigatorio)' },
        },
        required: ['slug'],
      },
    },
  },
  {
    id: 'store.planos',
    produto: 'store',
    classe: 'READ',
    metodo: 'GET',
    endpoint: '/api/v1/catalogo/produtos-gravity/:slug/planos',
    descricao: 'Planos disponiveis de um produto',
    schema_params: storePlanosParams,
    gemini_declaration: {
      name: 'store.planos',
      description: 'Lista os planos e precos disponiveis de um produto.',
      parameters: {
        type: 'OBJECT',
        properties: {
          slug: { type: 'STRING', description: 'Slug do produto (obrigatorio)' },
        },
        required: ['slug'],
      },
    },
  },
]

// ── Helpers ──────────────────────────────────────────────────────────────────

const _toolMap = new Map<string, ToolDefinition>()
for (const t of CATALOGO_FERRAMENTAS) _toolMap.set(t.id, t)

export function buscarTool(toolId: string): ToolDefinition | undefined {
  return _toolMap.get(toolId)
}

export function listarToolsPorProduto(produto: string): ToolDefinition[] {
  return CATALOGO_FERRAMENTAS.filter((t) => t.produto === produto)
}

export function listarToolsPorClasse(classe: ClasseRisco): ToolDefinition[] {
  return CATALOGO_FERRAMENTAS.filter((t) => t.classe === classe)
}

export function isWriteTool(toolId: string): boolean {
  const tool = _toolMap.get(toolId)
  return tool ? tool.classe !== 'READ' : false
}

export function gerarGeminiDeclarations(toolIds?: string[]): object[] {
  const tools = toolIds
    ? toolIds.map((id) => _toolMap.get(id)).filter(Boolean)
    : CATALOGO_FERRAMENTAS
  return [{
    functionDeclarations: tools.map((t) => ({
      ...t!.gemini_declaration,
      name: t!.gemini_declaration.name.replace(/\./g, '_'),
    })),
  }]
}

export function geminiNameToToolId(geminiName: string): string {
  return geminiName.replace(/_/, '.')
}

export function filtrarToolsPorPermissao(
  tipoUsuario: string,
  toolIds?: string[],
): ToolDefinition[] {
  const hierarquia: Record<string, number> = {
    SUPER_ADMIN: 5,
    ADMIN: 4,
    MASTER: 3,
    PADRAO: 2,
    FORNECEDOR: 1,
  }
  const nivelUsuario = hierarquia[tipoUsuario] ?? 0

  const all = toolIds
    ? toolIds.map((id) => _toolMap.get(id)).filter(Boolean) as ToolDefinition[]
    : CATALOGO_FERRAMENTAS

  return all.filter((t) => {
    if (!t.permissao_minima) return true
    const nivelMinimo = hierarquia[t.permissao_minima] ?? 0
    return nivelUsuario >= nivelMinimo
  })
}
