// server/services/tools.ts
// Declarações de tools da GABI — padrão Gemini function_declarations
// Cada tool corresponde a uma operação real nos produtos da plataforma Gravity

export const GABI_TOOLS = [{
  functionDeclarations: [

    // ── RESUMO GERAL ─────────────────────────────────────────────────────────
    {
      name: 'get_user_summary',
      description: 'Retorna um resumo geral dos dados do usuário na plataforma: contagem de LPCOs por status, NFs e pedidos. Use quando o usuário perguntar "o que tenho", "meu resumo", "visão geral", "quantos registros tenho".',
      parameters: { type: 'OBJECT', properties: {} },
    },

    // ── LPCO ─────────────────────────────────────────────────────────────────
    {
      name: 'list_lpcos',
      description: 'Lista os LPCOs do usuário com filtros opcionais. Use sempre que o usuário perguntar sobre licenças, LPCOs pendentes, status de LPCOs, "minhas licenças", "quais LPCOs tenho".',
      parameters: {
        type: 'OBJECT',
        properties: {
          status: {
            type: 'STRING',
            description: 'Filtrar por status: rascunho | para_analise | em_analise | em_exigencia | resposta_exigencia | deferida | indeferida | cancelada',
          },
          orgao_anuente: {
            type: 'STRING',
            description: 'Filtrar por órgão anuente (ex: ANVISA, MAPA, INMETRO, DECEX)',
          },
          limit: { type: 'NUMBER', description: 'Máximo de resultados (padrão: 20, máx: 100)' },
        },
      },
    },
    {
      name: 'get_lpco',
      description: 'Busca detalhes completos de um LPCO específico: dados do pedido, itens, exigências, histórico de status.',
      parameters: {
        type: 'OBJECT',
        properties: {
          lpco_id: { type: 'STRING', description: 'ID do LPCO (obrigatório)' },
        },
        required: ['lpco_id'],
      },
    },
    {
      name: 'create_lpco',
      description: 'Cria um novo LPCO em status rascunho. IMPORTANTE: Na primeira chamada sem confirmed=true, retorna pedido de confirmação. Descreva a ação ao usuário e peça confirmação. Quando o usuário confirmar, chame novamente com confirmed=true.',
      parameters: {
        type: 'OBJECT',
        properties: {
          orgao_anuente: { type: 'STRING', description: 'Órgão anuente (obrigatório): ANVISA | MAPA | INMETRO | DECEX | ANATEL | EXERCITO | CNEN | DECOM | SUFRAMA | outros' },
          ncm: { type: 'STRING', description: 'Código NCM do produto (8 dígitos)' },
          descricao_mercadoria: { type: 'STRING', description: 'Descrição da mercadoria' },
          quantidade: { type: 'NUMBER', description: 'Quantidade do produto' },
          unidade_medida: { type: 'STRING', description: 'Unidade de medida (KG, UN, L, M, etc.)' },
          valor_usd: { type: 'NUMBER', description: 'Valor do produto em USD' },
          pais_origem: { type: 'STRING', description: 'País de origem da mercadoria (código ISO ou nome)' },
          processo_id: { type: 'STRING', description: 'ID do processo (DUIMP/DU-E) vinculado, se houver' },
          confirmed: { type: 'BOOLEAN', description: 'true para confirmar a execução após aprovação do usuário' },
        },
        required: ['orgao_anuente'],
      },
    },
    {
      name: 'update_lpco',
      description: 'Atualiza campos de um LPCO. IMPORTANTE: Na primeira chamada sem confirmed=true, retorna pedido de confirmação. Descreva a ação ao usuário e peça confirmação. Quando o usuário confirmar, chame novamente com confirmed=true.',
      parameters: {
        type: 'OBJECT',
        properties: {
          lpco_id: { type: 'STRING', description: 'ID do LPCO (obrigatório)' },
          ncm: { type: 'STRING' },
          descricao_mercadoria: { type: 'STRING' },
          quantidade: { type: 'NUMBER' },
          unidade_medida: { type: 'STRING' },
          valor_usd: { type: 'NUMBER' },
          pais_origem: { type: 'STRING' },
          orgao_anuente: { type: 'STRING' },
          confirmed: { type: 'BOOLEAN', description: 'true para confirmar a execução após aprovação do usuário' },
        },
        required: ['lpco_id'],
      },
    },

    // ── NF IMPORTAÇÃO ─────────────────────────────────────────────────────────
    {
      name: 'list_nfs',
      description: 'Lista as Notas Fiscais de importação do usuário. Use para perguntas sobre NFs, notas emitidas, NFs pendentes, "minhas notas fiscais".',
      parameters: {
        type: 'OBJECT',
        properties: {
          status: { type: 'STRING', description: 'Filtrar por status da NF' },
          limit: { type: 'NUMBER', description: 'Máximo de resultados (padrão: 20)' },
        },
      },
    },
    {
      name: 'get_nf',
      description: 'Busca detalhes completos de uma Nota Fiscal de importação específica.',
      parameters: {
        type: 'OBJECT',
        properties: {
          nf_id: { type: 'STRING', description: 'ID da NF (obrigatório)' },
        },
        required: ['nf_id'],
      },
    },
    {
      name: 'create_nf',
      description: 'Cria uma nova Nota Fiscal de importação. IMPORTANTE: Na primeira chamada sem confirmed=true, retorna pedido de confirmação. Descreva a ação ao usuário e peça confirmação. Quando o usuário confirmar, chame novamente com confirmed=true.',
      parameters: {
        type: 'OBJECT',
        properties: {
          numero_di: { type: 'STRING', description: 'Número da Declaração de Importação vinculada' },
          cfop: { type: 'STRING', description: 'CFOP da operação (ex: 3101, 3102)' },
          valor_total: { type: 'NUMBER', description: 'Valor total da NF em BRL' },
          fornecedor_nome: { type: 'STRING', description: 'Nome do fornecedor/exportador' },
          fornecedor_pais: { type: 'STRING', description: 'País do fornecedor' },
          natureza_operacao: { type: 'STRING', description: 'Natureza da operação' },
          confirmed: { type: 'BOOLEAN', description: 'true para confirmar a execução após aprovação do usuário' },
        },
      },
    },

    // ── PEDIDO ────────────────────────────────────────────────────────────────
    {
      name: 'list_pedidos',
      description: 'Lista os pedidos de importação do usuário. Use para perguntas sobre ordens de compra, purchase orders, pedidos pendentes.',
      parameters: {
        type: 'OBJECT',
        properties: {
          status: { type: 'STRING', description: 'Filtrar por status do pedido' },
          limit: { type: 'NUMBER', description: 'Máximo de resultados (padrão: 20)' },
        },
      },
    },
    {
      name: 'get_pedido',
      description: 'Busca detalhes completos de um pedido de importação: itens, fornecedor, status, documentos vinculados.',
      parameters: {
        type: 'OBJECT',
        properties: {
          pedido_id: { type: 'STRING', description: 'ID do pedido (obrigatório)' },
        },
        required: ['pedido_id'],
      },
    },

    {
      name: 'create_pedido',
      description: 'Cria um novo pedido de importação ou exportação em status rascunho. IMPORTANTE: Na primeira chamada sem confirmed=true, retorna pedido de confirmação. Descreva a ação ao usuário e peça confirmação. Quando o usuário confirmar, chame novamente com confirmed=true.',
      parameters: {
        type: 'OBJECT',
        properties: {
          tipo_pedido: { type: 'STRING', description: 'Tipo: importacao | exportacao (padrão: importacao)' },
          exportador: { type: 'STRING', description: 'Nome do exportador/fornecedor' },
          importador: { type: 'STRING', description: 'Nome do importador (padrão: organização do usuário)' },
          incoterm: { type: 'STRING', description: 'Incoterm: FOB | CIF | EXW | CFR | etc.' },
          moeda: { type: 'STRING', description: 'Moeda: USD | BRL | EUR (padrão: USD)' },
          confirmed: { type: 'BOOLEAN', description: 'true para confirmar a execução após aprovação do usuário' },
        },
      },
    },
    {
      name: 'update_pedido',
      description: 'Atualiza dados de um pedido existente. IMPORTANTE: Na primeira chamada sem confirmed=true, retorna pedido de confirmação. Descreva a ação ao usuário e peça confirmação. Quando o usuário confirmar, chame novamente com confirmed=true.',
      parameters: {
        type: 'OBJECT',
        properties: {
          pedido_id: { type: 'STRING', description: 'ID do pedido (obrigatório)' },
          status_pedido: { type: 'STRING', description: 'Novo status: rascunho | em_andamento | finalizado' },
          exportador: { type: 'STRING', description: 'Nome do exportador' },
          incoterm: { type: 'STRING', description: 'Incoterm' },
          confirmed: { type: 'BOOLEAN', description: 'true para confirmar a execução após aprovação do usuário' },
        },
        required: ['pedido_id'],
      },
    },
    {
      name: 'delete_pedido',
      description: 'Exclui permanentemente um pedido. Ação irreversível. Use APENAS quando o usuário pedir explicitamente para excluir/deletar um pedido.',
      parameters: {
        type: 'OBJECT',
        properties: {
          pedido_id: { type: 'STRING', description: 'ID do pedido a excluir (obrigatório)' },
          confirmed: { type: 'BOOLEAN', description: 'Deve ser true para confirmar exclusão' },
        },
        required: ['pedido_id'],
      },
    },

    // ── ORGANIZACAO / CONFIG ────────────────────────────────────────────────
    {
      name: 'get_organizacao',
      description: 'Retorna as configurações e dados da organização do usuário: nome, subdomínio, tipo, CNPJ, plano, status. Use quando o usuário perguntar sobre "minha organização", "configurações da org", "dados da empresa", "meu plano".',
      parameters: { type: 'OBJECT', properties: {} },
    },
    {
      name: 'list_usuarios',
      description: 'Lista os usuários da organização com nome, email, tipo e status. Use quando o usuário perguntar sobre "meus usuários", "quem tem acesso", "membros da equipe".',
      parameters: { type: 'OBJECT', properties: {} },
    },

    // ── SIMULACUSTO ───────────────────────────────────────────────────────────
    {
      name: 'simulate_cost',
      description: 'Simula o custo completo de importação de um produto: II, IPI, PIS, COFINS, ICMS, despesas e custo final. Use quando o usuário perguntar sobre custo de importação, tributos, valor final de um produto importado.',
      parameters: {
        type: 'OBJECT',
        properties: {
          ncm: { type: 'STRING', description: 'Código NCM do produto (obrigatório, 8 dígitos)' },
          valor_cif_usd: { type: 'NUMBER', description: 'Valor CIF em USD (produto + frete + seguro)' },
          quantidade: { type: 'NUMBER', description: 'Quantidade do produto' },
          unidade: { type: 'STRING', description: 'Unidade de medida (KG, UN, L, M)' },
          estado_destino: { type: 'STRING', description: 'Estado de destino para cálculo de ICMS (ex: SP, RJ, MG)' },
          taxa_cambio: { type: 'NUMBER', description: 'Taxa de câmbio USD/BRL (opcional — usa cotação atual se omitido)' },
        },
        required: ['ncm'],
      },
    },

  ],
}]

// Tools que executam escrita (criação/atualização)
export const WRITE_TOOLS = new Set([
  'create_lpco',
  'update_lpco',
  'create_nf',
  'create_pedido',
  'update_pedido',
])

// Tools que exigem confirmação explícita antes de executar
export const DESTRUCTIVE_TOOLS = new Set([
  'cancel_nf',
  'delete_pedido',
])
