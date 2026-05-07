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
    baseUrl: 'https://api.usegravity.com.br/dashboard/v1',
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
    baseUrl: 'https://api.usegravity.com.br/atividades/v2',
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
    baseUrl: 'https://api.usegravity.com.br/sim-custo/v1',
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
    baseUrl: 'https://api.usegravity.com.br/gabi/v1',
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
    baseUrl: 'https://api.usegravity.com.br/nf-import/v1',
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
  "danfe_url": "https://storage.usegravity.com.br/danfe/35260...pdf"
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
  "danfe_url": "https://storage.usegravity.com.br/danfe/35260...pdf",
  "expira_em": "2026-03-26T10:00:00Z"
}`,
      },
    ],
  },

  // ── BID Frete Internacional ─────────────────────────────────────────────────
  {
    id: 'bid-frete',
    nome: 'BID Frete Internacional',
    descricao: 'Licitação inteligente de fretes internacionais. Solicite, compare e aprove cotações de múltiplos fornecedores.',
    baseUrl: 'https://api.usegravity.com.br/bid-frete/v1',
    versao: 'v1',
    cor: '#34d399',
    endpoints: [
      {
        method: 'POST',
        path: '/cotacoes',
        titulo: 'Criar Cotação',
        descricao: 'Cria um novo pedido de cotação de frete internacional.',
        requestBody: `{
  "tipo_operacao": "IMPORTACAO",
  "modal": "MARITIMO",
  "modalidade": "FCL",
  "origem_codigo": "CNSHA",
  "origem_nome": "Shanghai",
  "origem_pais": "China",
  "destino_codigo": "BRSSZ",
  "destino_nome": "Santos",
  "destino_pais": "Brasil",
  "descricao_mercadoria": "Auto Parts",
  "incoterm": "FOB",
  "quantidade": 2,
  "tipo_container": "20DRY"
}`,
        responseBody: `{
  "cotacao": {
    "id": "cot_abc123",
    "numero": "BID-20260328-0001",
    "status": "RASCUNHO"
  }
}`,
      },
      {
        method: 'GET',
        path: '/cotacoes',
        titulo: 'Listar Cotações',
        descricao: 'Lista cotações do tenant com filtros e paginação.',
        params: [
          { nome: 'status', tipo: 'string', descricao: 'Filtrar por status (RASCUNHO, EM_COTACAO, APROVADA, etc.)', obrigatorio: false },
          { nome: 'modal', tipo: 'string', descricao: 'Filtrar por modal (MARITIMO, AEREO, RODOVIARIO)', obrigatorio: false },
          { nome: 'page', tipo: 'number', descricao: 'Página (default: 1)', obrigatorio: false },
          { nome: 'limit', tipo: 'number', descricao: 'Itens por página (default: 20)', obrigatorio: false },
        ],
        responseBody: `{
  "cotacoes": [...],
  "pagination": { "page": 1, "limit": 20, "total": 50, "pages": 3 }
}`,
      },
      {
        method: 'POST',
        path: '/bids/disparar',
        titulo: 'Disparar BIDs',
        descricao: 'Dispara solicitações de cotação para fornecedores via email e/ou WhatsApp.',
        requestBody: `{
  "cotacao_id": "cot_abc123",
  "fornecedor_ids": ["f1", "f2", "f3"],
  "canais": ["EMAIL", "WHATSAPP"]
}`,
        responseBody: `{
  "disparos": 6,
  "results": [...]
}`,
      },
      {
        method: 'GET',
        path: '/comparativo/:cotacaoId',
        titulo: 'Ranking Comparativo',
        descricao: 'Ranqueia as respostas dos fornecedores por preço, transit time e avaliação.',
        params: [
          { nome: 'cotacaoId', tipo: 'string', descricao: 'ID da cotação', obrigatorio: true },
        ],
        responseBody: `{
  "ranking": [
    {
      "fornecedor_nome": "Asia Shipping",
      "valor_total": 2500,
      "transit_time_dias": 30,
      "ranking_preco": 1,
      "tags": ["MELHOR_PRECO"]
    }
  ],
  "saving": { "vs_target": 2500, "percentual": 50 }
}`,
      },
      {
        method: 'POST',
        path: '/comparativo/:cotacaoId/aprovar',
        titulo: 'Aprovar Cotação',
        descricao: 'Aprova uma cotação selecionando o fornecedor vencedor (2 cliques).',
        requestBody: `{
  "response_id": "resp_xyz789"
}`,
        responseBody: `{
  "approved": true,
  "saving_percentual": 40
}`,
      },
      {
        method: 'POST',
        path: '/fornecedores',
        titulo: 'Cadastrar Fornecedor',
        descricao: 'Cadastra um novo fornecedor (agente de carga, armador, cia aérea).',
        requestBody: `{
  "nome": "Asia Shipping",
  "tipo": "AGENTE_CARGA",
  "email": "contato@asiashipping.com",
  "whatsapp": "+5511999999999"
}`,
        responseBody: `{
  "fornecedor": {
    "id": "f_abc123",
    "nome": "Asia Shipping",
    "status": "ATIVO"
  }
}`,
      },
      {
        method: 'GET',
        path: '/dashboard',
        titulo: 'Dashboard KPIs',
        descricao: 'Retorna KPIs do BID Frete: cotações em andamento, savings, funil de status.',
        responseBody: `{
  "cotacoes_andamento": 20,
  "cotacoes_passadas": 369,
  "valor_andamento_usd": 32555,
  "savings": {
    "media_saving_percentual": 14.3,
    "total_valor_aprovado": 1332555
  }
}`,
      },
    ],
  },

  // ─── BID Cambio ──────────────────────────────────────────────────────────
  {
    id: 'bid-cambio',
    nome: 'BID Cambio',
    descricao: 'Gestão e cotação de câmbio comercial para operações de COMEX',
    baseUrl: 'https://api.usegravity.com.br/bid-cambio/v1',
    versao: 'v1',
    cor: '#22c55e',
    endpoints: [
      {
        method: 'GET',
        path: '/cambios',
        titulo: 'Listar Parcelas de Câmbio',
        descricao: 'Lista parcelas com filtros por status, moeda e data de vencimento',
        params: [
          { nome: 'status', tipo: 'string', descricao: 'PENDENTE | AGENDADO | PAGO', obrigatorio: false },
          { nome: 'moeda', tipo: 'string', descricao: 'USD | EUR | GBP | CHF | CNY | JPY', obrigatorio: false },
          { nome: 'page', tipo: 'number', descricao: 'Página (default: 1)', obrigatorio: false },
          { nome: 'limit', tipo: 'number', descricao: 'Itens por página (default: 50, max: 100)', obrigatorio: false },
        ],
      },
      {
        method: 'POST',
        path: '/cambios/agendar',
        titulo: 'Agendar Parcelas',
        descricao: 'Agenda uma ou mais parcelas pendentes para pagamento',
        requestBody: `{
  "parcela_ids": ["clx...abc", "clx...def"],
  "data_agendamento": "2026-04-20"
}`,
      },
      {
        method: 'POST',
        path: '/cambios/pagar',
        titulo: 'Registrar Pagamento',
        descricao: 'Registra pagamento com taxa e banco. Ajusta próxima parcela se valor diferente.',
        requestBody: `{
  "parcela_id": "clx...abc",
  "valor_pago": 50000,
  "taxa_fechamento": 5.2345,
  "banco_corretora": "Banco XYZ",
  "numero_contrato": "CONT-2026-001"
}`,
      },
      {
        method: 'POST',
        path: '/cotacoes',
        titulo: 'Criar Cotação de Câmbio',
        descricao: 'Cria nova cotação para envio a corretoras',
        requestBody: `{
  "moeda": "USD",
  "valor": 50000,
  "tipo_operacao": "IMPORTACAO",
  "modalidade": "PRONTO",
  "liquidacao": "D2"
}`,
      },
      {
        method: 'POST',
        path: '/bids/disparar',
        titulo: 'Disparar Cotação para Corretoras',
        descricao: 'Envia cotação para corretoras selecionadas via email com link público',
        requestBody: `{
  "cotacao_id": "clx...abc",
  "corretora_ids": ["clx...c1", "clx...c2"]
}`,
      },
      {
        method: 'GET',
        path: '/comparativo/:cotacaoId',
        titulo: 'Ranking de Propostas',
        descricao: 'Retorna respostas ordenadas com tags automáticas (MELHOR_TAXA, MELHOR_SPREAD)',
      },
      {
        method: 'POST',
        path: '/comparativo/:cotacaoId/aprovar',
        titulo: 'Aprovar Melhor Taxa',
        descricao: 'Aprova uma resposta e reprova automaticamente as demais. Calcula economia.',
        requestBody: `{
  "bid_response_id": "clx...resp1"
}`,
      },
      {
        method: 'GET',
        path: '/dashboard',
        titulo: 'Dashboard KPIs',
        descricao: 'Métricas agregadas: parcelas, financeiro, marketplace',
        responseBody: `{
  "parcelas": { "total": 45, "pendentes": 12, "agendadas": 8, "pagas_mes": 5 },
  "financeiro": { "valor_em_aberto": 350000, "economia_acumulada_mes": 12500 },
  "marketplace": { "corretoras_ativas": 8, "cotacoes_abertas": 3 }
}`,
      },
      {
        method: 'GET',
        path: '/taxas-moeda',
        titulo: 'PTAX do Dia (BCB)',
        descricao: 'Consulta PTAX atual via API OLINDA do Banco Central (cache 5 min)',
        params: [
          { nome: 'moeda', tipo: 'string', descricao: 'Código da moeda (default: USD)', obrigatorio: false },
        ],
        responseBody: `{
  "moeda": "USD",
  "data": "2026-03-28",
  "compra": 5.2000,
  "venda": 5.2100,
  "hora": "13:05",
  "fonte": "BCB/PTAX"
}`,
      },
    ],
  },
]

/** Busca um produto pelo ID no catálogo */
export function getProdutoDoc(id: string): ProdutoDoc | undefined {
  return CATALOGO_PRODUTOS.find(p => p.id === id)
}
