/**
 * produtoCatalogo.ts
 *
 * Fonte única de verdade dos produtos Gravity com seus metadados de
 * documentação. Para expor um novo produto no portal de docs do API Cockpit,
 * basta adicionar um objeto neste array — nenhuma outra alteração é necessária.
 *
 * Convenção de IDs: os IDs aqui DEVEM corresponder ao campo `id` em
 * mockProdutos (Assinaturas.tsx) para que o filtro "apenas assinados"
 * funcione corretamente.
 */

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'

export interface DocEndpoint {
  method: HttpMethod
  path: string
  titulo: string
  descricao: string
  requestBody?: string   // JSON de exemplo (string indentada)
  responseBody?: string  // JSON de exemplo da resposta
  params?: { nome: string; tipo: string; descricao: string; obrigatorio: boolean }[]
}

export interface ProdutoDoc {
  /** Deve coincidir com Produto.id em Assinaturas.tsx */
  id: string
  nome: string
  descricao: string
  baseUrl: string
  versao: string
  /** Cor de destaque (usada nos badges e seleção) */
  cor: string
  endpoints: DocEndpoint[]
}

// ─────────────────────────────────────────────────────────────────────────────
// CATÁLOGO — adicione novos produtos aqui ↓
// ─────────────────────────────────────────────────────────────────────────────
export const CATALOGO_PRODUTOS: ProdutoDoc[] = [
  // ── Dashboard Global ────────────────────────────────────────────────────────
  {
    id: 'dash',
    nome: 'Dashboard Global',
    descricao: 'Indicadores consolidados, KPIs e widgets de performance em tempo real para o workspace.',
    baseUrl: 'https://api.gravity.com.br/dashboard/v1',
    versao: 'v1',
    cor: '#818cf8',
    endpoints: [
      {
        method: 'GET',
        path: '/kpis',
        titulo: 'Listar KPIs',
        descricao: 'Retorna todos os indicadores de performance configurados para o workspace autenticado.',
        params: [
          { nome: 'periodo', tipo: 'string', descricao: 'Filtra por período: today | week | month | custom', obrigatorio: false },
        ],
        responseBody: `{
  "kpis": [
    {
      "id": "kpi_001",
      "titulo": "Processos Abertos",
      "valor": 142,
      "variacao": "+12%",
      "periodo": "month"
    }
  ]
}`,
      },
      {
        method: 'POST',
        path: '/widgets',
        titulo: 'Criar Widget',
        descricao: 'Adiciona um novo widget ao dashboard do workspace.',
        requestBody: `{
  "tipo": "stat_card",
  "titulo": "Novas Importações",
  "kpi_id": "kpi_001",
  "posicao": { "col": 1, "row": 1 }
}`,
        responseBody: `{
  "id": "wgt_abc123",
  "status": "created"
}`,
      },
    ],
  },

  // ── Gestão de Atividades ─────────────────────────────────────────────────────
  {
    id: 'ativ',
    nome: 'Gestão de Atividades',
    descricao: 'Criação, consulta e atualização de processos e tarefas dentro do workspace.',
    baseUrl: 'https://api.gravity.com.br/atividades/v2',
    versao: 'v2',
    cor: '#a78bfa',
    endpoints: [
      {
        method: 'GET',
        path: '/processos',
        titulo: 'Listar Processos',
        descricao: 'Retorna lista paginada de processos do workspace com filtros opcionais.',
        params: [
          { nome: 'status',  tipo: 'string',  descricao: 'aberto | concluido | cancelado', obrigatorio: false },
          { nome: 'page',    tipo: 'integer', descricao: 'Página (padrão: 1)',              obrigatorio: false },
          { nome: 'limit',   tipo: 'integer', descricao: 'Itens por página (máx: 100)',     obrigatorio: false },
        ],
        responseBody: `{
  "data": [{ "id": "proc_001", "titulo": "Importação MG #441", "status": "aberto" }],
  "meta": { "total": 142, "page": 1, "limit": 20 }
}`,
      },
      {
        method: 'POST',
        path: '/processos',
        titulo: 'Criar Processo',
        descricao: 'Abre um novo processo de atividade no workspace.',
        requestBody: `{
  "titulo": "Importação SP #442",
  "responsavel_id": "usr_xyz",
  "prazo": "2026-04-30",
  "prioridade": "alta"
}`,
        responseBody: `{
  "id": "proc_442",
  "status": "aberto",
  "criado_em": "2026-03-25T10:00:00Z"
}`,
      },
      {
        method: 'PATCH',
        path: '/processos/:id',
        titulo: 'Atualizar Processo',
        descricao: 'Atualiza status, responsável ou prazo de um processo existente.',
        requestBody: `{
  "status": "concluido"
}`,
        responseBody: `{
  "id": "proc_442",
  "status": "concluido",
  "atualizado_em": "2026-03-25T15:00:00Z"
}`,
      },
    ],
  },

  // ── SimulaCusto ─────────────────────────────────────────────────────────────
  {
    id: 'simcusto',
    nome: 'SimulaCusto',
    descricao: 'Motor de simulação tributária para importações — calcula II, IPI, PIS, COFINS e ICMS com base no NCM e origem.',
    baseUrl: 'https://api.gravity.com.br/sim-custo/v1',
    versao: 'v1',
    cor: '#34d399',
    endpoints: [
      {
        method: 'POST',
        path: '/simulacoes',
        titulo: 'Criar Simulação',
        descricao: 'Cria uma nova simulação de custos de importação baseada no NCM, origem e valor aduaneiro.',
        requestBody: `{
  "titulo": "Importação de Peças",
  "valor": 15000.00,
  "ncm": "84821010",
  "origem": "CN",
  "modalidade": "maritima"
}`,
        responseBody: `{
  "id": "sim_8812",
  "status": "processando",
  "estimativa_ii": 2250.00,
  "estimativa_ipi": 750.00,
  "custo_total": 19340.00
}`,
      },
      {
        method: 'GET',
        path: '/simulacoes/:id',
        titulo: 'Consultar Simulação',
        descricao: 'Retorna os detalhes e resultado de uma simulação já processada.',
        params: [
          { nome: 'id', tipo: 'string', descricao: 'ID da simulação retornado na criação', obrigatorio: true },
        ],
        responseBody: `{
  "id": "sim_8812",
  "status": "concluido",
  "impostos": {
    "ii": 2250.00, "ipi": 750.00,
    "pis": 298.50, "cofins": 1375.50, "icms": 3174.00
  },
  "custo_total": 22848.00
}`,
      },
      {
        method: 'GET',
        path: '/simulacoes',
        titulo: 'Listar Simulações',
        descricao: 'Lista todas as simulações do workspace com possibilidade de filtrar por período.',
        params: [
          { nome: 'de',  tipo: 'date', descricao: 'Data de início (YYYY-MM-DD)', obrigatorio: false },
          { nome: 'ate', tipo: 'date', descricao: 'Data de fim (YYYY-MM-DD)',    obrigatorio: false },
        ],
        responseBody: `{
  "data": [{ "id": "sim_8812", "titulo": "Importação de Peças", "custo_total": 22848.00 }],
  "meta": { "total": 37 }
}`,
      },
    ],
  },

  // ── Gabi IA Assistant ────────────────────────────────────────────────────────
  {
    id: 'gabi',
    nome: 'Gabi IA Assistant',
    descricao: 'Assistente de IA para análise de documentos de importação, classificação NCM e geração de relatórios.',
    baseUrl: 'https://api.gravity.com.br/gabi/v1',
    versao: 'v1',
    cor: '#f59e0b',
    endpoints: [
      {
        method: 'POST',
        path: '/chat',
        titulo: 'Enviar Mensagem',
        descricao: 'Envia uma mensagem para a Gabi e recebe uma resposta contextualizada sobre o workspace.',
        requestBody: `{
  "mensagem": "Qual o NCM correto para rolamentos de esferas?",
  "contexto": { "processo_id": "proc_001" }
}`,
        responseBody: `{
  "id": "msg_xyz",
  "resposta": "Para rolamentos de esferas, o NCM recomendado é 84821010...",
  "tokens_usados": 312
}`,
      },
      {
        method: 'POST',
        path: '/classificar-ncm',
        titulo: 'Classificar NCM',
        descricao: 'Envia a descrição de uma mercadoria e recebe sugestões de NCM com grau de confiança.',
        requestBody: `{
  "descricao": "Rolamento de esferas de aço inox, diâmetro 25mm, para uso industrial"
}`,
        responseBody: `{
  "sugestoes": [
    { "ncm": "84821010", "descricao": "Rolamentos de esferas", "confianca": 0.97 },
    { "ncm": "84821090", "descricao": "Outros rolamentos", "confianca": 0.62 }
  ]
}`,
      },
    ],
  },

  // ── NF Import ───────────────────────────────────────────────────────────────
  // 🆕 Exemplo: basta adicionar este objeto e o produto aparece nos docs
  {
    id: 'nf-import',
    nome: 'NF Import',
    descricao: 'Emissão automática de NF-e e NF de serviço vinculada ao processo de importação, com integração à SEFAZ e geração de DANFE.',
    baseUrl: 'https://api.gravity.com.br/nf-import/v1',
    versao: 'v1',
    cor: '#fb923c',
    endpoints: [
      {
        method: 'POST',
        path: '/emitir',
        titulo: 'Emitir NF-e',
        descricao: 'Gera e transmite uma NF-e para a SEFAZ vinculada a um processo de importação.',
        requestBody: `{
  "processo_id": "proc_001",
  "natureza_operacao": "Importação por conta e ordem",
  "valor_total": 22848.00,
  "itens": [
    {
      "descricao": "Rolamentos de esferas",
      "ncm": "84821010",
      "quantidade": 500,
      "valor_unitario": 45.00
    }
  ]
}`,
        responseBody: `{
  "chave_nfe": "35260312345678000195550010000012341234567890",
  "protocolo": "135260012345678",
  "status": "autorizado",
  "danfe_url": "https://storage.gravity.com.br/danfe/35260...pdf"
}`,
      },
      {
        method: 'GET',
        path: '/notas/:chave',
        titulo: 'Consultar NF-e',
        descricao: 'Consulta o status e os dados de uma NF-e já transmitida pelo seu chave de acesso.',
        params: [
          { nome: 'chave', tipo: 'string (44 dígitos)', descricao: 'Chave de acesso da NF-e', obrigatorio: true },
        ],
        responseBody: `{
  "chave_nfe": "35260312345678000195550010000012341234567890",
  "status": "autorizado",
  "emitida_em": "2026-03-25T10:00:00Z",
  "emitente": { "cnpj": "12.345.678/0001-95", "razao_social": "Empresa Importadora Ltda." }
}`,
      },
      {
        method: 'POST',
        path: '/cancelar/:chave',
        titulo: 'Cancelar NF-e',
        descricao: 'Solicita o cancelamento de uma NF-e já autorizada dentro do prazo legal de 24h.',
        requestBody: `{
  "justificativa": "Erro nos dados do destinatário informados na nota fiscal."
}`,
        responseBody: `{
  "status": "cancelado",
  "protocolo_cancelamento": "135260099999999",
  "cancelado_em": "2026-03-25T11:30:00Z"
}`,
      },
      {
        method: 'GET',
        path: '/danfe/:chave',
        titulo: 'Baixar DANFE',
        descricao: 'Retorna a URL de download do DANFE (PDF) para uma NF-e autorizada.',
        params: [
          { nome: 'chave', tipo: 'string (44 dígitos)', descricao: 'Chave de acesso da NF-e', obrigatorio: true },
        ],
        responseBody: `{
  "danfe_url": "https://storage.gravity.com.br/danfe/35260...pdf",
  "expira_em": "2026-03-26T10:00:00Z"
}`,
      },
    ],
  },
]

/** Busca um produto pelo ID no catálogo */
export function getProdutoDoc(id: string): ProdutoDoc | undefined {
  return CATALOGO_PRODUTOS.find(p => p.id === id)
}
