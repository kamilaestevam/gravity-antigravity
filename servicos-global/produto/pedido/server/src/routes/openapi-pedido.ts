/**
 * openapi.ts — Especificação OpenAPI 3.0 das rotas públicas do produto Pedido
 *
 * Endpoint: GET /api/v1/pedidos/openapi.json
 * Sem autenticação — documentação pública do contrato da API.
 *
 * Skill: antigravity-api-cockpit (Tela 2 — Documentação)
 */

import { Router, Request, Response } from 'express'

export const openapiRouter = Router()

const BASE_URL = process.env.API_BASE_URL || 'http://localhost:8026'

/** Spec OpenAPI 3.0 das rotas do produto Pedido */
const PEDIDO_OPENAPI_SPEC = {
  openapi: '3.0.3',
  info: {
    title: 'Gravity — API Pedido',
    version: '1.0.0',
    description:
      'API REST do produto Pedido (Purchase Orders / Sales Orders). ' +
      'Autenticar com token Bearer gv_live_sk_* (produção) ou gv_test_sk_* (sandbox).',
    contact: {
      name: 'Gravity Platform',
      url: 'https://usegravity.com.br',
    },
  },
  servers: [
    {
      url: BASE_URL,
      description: 'Servidor atual',
    },
  ],
  components: {
    securitySchemes: {
      ApiToken: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'gv_live_sk_* | gv_test_sk_*',
        description:
          'Token de API gerado no API Cockpit do produto. ' +
          'Prefixo gv_live_sk_ para produção e gv_test_sk_ para sandbox.',
      },
    },
    schemas: {
      Pedido: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'cuid', description: 'ID único do pedido' },
          tenant_id: { type: 'string', description: 'ID do tenant proprietário' },
          numero_pedido: { type: 'string', description: 'Número do documento comercial (PO/SO)' },
          tipo_operacao: { type: 'string', enum: ['IMPORTACAO', 'EXPORTACAO'], description: 'Tipo de operação' },
          status: {
            type: 'string',
            enum: ['aberto', 'transferencia', 'consolidado', 'cancelado'],
            description: 'Status atual do pedido',
          },
          fornecedor: { type: 'string', description: 'Nome do fornecedor' },
          pais_origem: { type: 'string', description: 'País de origem da mercadoria' },
          incoterm: { type: 'string', description: 'Incoterm acordado (ex: FOB, CIF)' },
          moeda: { type: 'string', description: 'Código ISO 4217 da moeda (ex: USD, EUR)' },
          valor_total: { type: 'number', description: 'Valor total do pedido na moeda acordada' },
          created_at: { type: 'string', format: 'date-time' },
          updated_at: { type: 'string', format: 'date-time' },
        },
      },
      PaginatedPedidos: {
        type: 'object',
        properties: {
          data: { type: 'array', items: { '$ref': '#/components/schemas/Pedido' } },
          cursor: { type: 'string', nullable: true, description: 'Cursor para próxima página (keyset pagination)' },
          total: { type: 'integer', description: 'Total de registros (estimado)' },
        },
      },
      SmartImportAnalisarInput: {
        type: 'object',
        required: ['conteudo'],
        properties: {
          conteudo: { type: 'string', description: 'Conteúdo bruto do documento (texto ou base64)' },
          formato: { type: 'string', enum: ['texto', 'pdf_base64', 'xml'], description: 'Formato do documento' },
        },
      },
      SmartImportAnalisarOutput: {
        type: 'object',
        properties: {
          sugestoes: {
            type: 'array',
            items: { '$ref': '#/components/schemas/Pedido' },
            description: 'Pedidos extraídos automaticamente para revisão',
          },
          confianca: { type: 'number', minimum: 0, maximum: 1, description: 'Score de confiança da extração (0–1)' },
          avisos: { type: 'array', items: { type: 'string' }, description: 'Campos ambíguos ou ausentes' },
        },
      },
      ConsolidarPreviewInput: {
        type: 'object',
        required: ['pedido_ids'],
        properties: {
          pedido_ids: { type: 'array', items: { type: 'string' }, minItems: 2, description: 'IDs dos pedidos a consolidar' },
        },
      },
      TransferirPreviewInput: {
        type: 'object',
        required: ['pedido_ids', 'destino_tenant_id'],
        properties: {
          pedido_ids: { type: 'array', items: { type: 'string' }, description: 'IDs dos pedidos a transferir' },
          destino_tenant_id: { type: 'string', description: 'Tenant de destino' },
        },
      },
      Error: {
        type: 'object',
        properties: {
          error: {
            type: 'object',
            properties: {
              code: { type: 'string' },
              message: { type: 'string' },
              details: { type: 'object' },
            },
          },
        },
      },
    },
  },
  security: [{ ApiToken: [] }],
  paths: {
    '/api/v1/pedidos': {
      get: {
        summary: 'Listar pedidos',
        description: 'Retorna lista paginada de pedidos do tenant autenticado (cursor keyset pagination).',
        operationId: 'listarPedidos',
        tags: ['Pedidos'],
        parameters: [
          { name: 'status', in: 'query', schema: { type: 'string', enum: ['aberto', 'transferencia', 'consolidado', 'cancelado'] }, description: 'Filtrar por status' },
          { name: 'cursor', in: 'query', schema: { type: 'string' }, description: 'Cursor da última página' },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 50, maximum: 500 }, description: 'Itens por página' },
          { name: 'q', in: 'query', schema: { type: 'string' }, description: 'Busca por número, fornecedor ou referência' },
        ],
        responses: {
          '200': {
            description: 'Listagem bem-sucedida',
            content: { 'application/json': { schema: { '$ref': '#/components/schemas/PaginatedPedidos' } } },
          },
          '401': { description: 'Token inválido', content: { 'application/json': { schema: { '$ref': '#/components/schemas/Error' } } } },
        },
      },
      post: {
        summary: 'Criar pedido',
        description: 'Cria um novo pedido para o tenant autenticado.',
        operationId: 'criarPedido',
        tags: ['Pedidos'],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { '$ref': '#/components/schemas/Pedido' } } },
        },
        responses: {
          '201': {
            description: 'Pedido criado',
            content: { 'application/json': { schema: { '$ref': '#/components/schemas/Pedido' } } },
          },
          '400': { description: 'Dados inválidos', content: { 'application/json': { schema: { '$ref': '#/components/schemas/Error' } } } },
          '401': { description: 'Token inválido', content: { 'application/json': { schema: { '$ref': '#/components/schemas/Error' } } } },
        },
      },
    },
    '/api/v1/pedidos/{id}': {
      put: {
        summary: 'Atualizar pedido',
        description: 'Atualiza campos de um pedido existente.',
        operationId: 'atualizarPedido',
        tags: ['Pedidos'],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' }, description: 'ID do pedido (CUID)' },
        ],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { '$ref': '#/components/schemas/Pedido' } } },
        },
        responses: {
          '200': { description: 'Pedido atualizado', content: { 'application/json': { schema: { '$ref': '#/components/schemas/Pedido' } } } },
          '404': { description: 'Pedido não encontrado', content: { 'application/json': { schema: { '$ref': '#/components/schemas/Error' } } } },
          '401': { description: 'Token inválido', content: { 'application/json': { schema: { '$ref': '#/components/schemas/Error' } } } },
        },
      },
    },
    '/api/v1/pedidos/importacoes-inteligentes/analisar': {
      post: {
        summary: 'Analisar documento para importação inteligente',
        description: 'Extrai automaticamente dados de pedido a partir de um documento (PDF, XML, texto). Retorna sugestões para revisão antes de confirmar.',
        operationId: 'smartImportAnalisar',
        tags: ['Smart Import'],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { '$ref': '#/components/schemas/SmartImportAnalisarInput' } } },
        },
        responses: {
          '200': { description: 'Extração bem-sucedida', content: { 'application/json': { schema: { '$ref': '#/components/schemas/SmartImportAnalisarOutput' } } } },
          '400': { description: 'Documento inválido ou não reconhecido', content: { 'application/json': { schema: { '$ref': '#/components/schemas/Error' } } } },
          '401': { description: 'Token inválido', content: { 'application/json': { schema: { '$ref': '#/components/schemas/Error' } } } },
        },
      },
    },
    '/api/v1/pedidos/importacoes-inteligentes/confirmar': {
      post: {
        summary: 'Confirmar importação inteligente',
        description: 'Persiste os pedidos extraídos e revisados pelo usuário após análise do Smart Import.',
        operationId: 'smartImportConfirmar',
        tags: ['Smart Import'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['pedidos'],
                properties: {
                  pedidos: { type: 'array', items: { '$ref': '#/components/schemas/Pedido' } },
                },
              },
            },
          },
        },
        responses: {
          '201': { description: 'Pedidos importados com sucesso', content: { 'application/json': { schema: { type: 'object', properties: { criados: { type: 'integer' } } } } } },
          '400': { description: 'Dados inválidos', content: { 'application/json': { schema: { '$ref': '#/components/schemas/Error' } } } },
          '401': { description: 'Token inválido', content: { 'application/json': { schema: { '$ref': '#/components/schemas/Error' } } } },
        },
      },
    },
    '/api/v1/pedidos/consolidacoes/preview': {
      post: {
        summary: 'Preview de consolidação',
        description: 'Calcula o impacto de consolidar múltiplos pedidos em um único. Retorna dados do consolidado antes de confirmar.',
        operationId: 'consolidarPreview',
        tags: ['Consolidar'],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { '$ref': '#/components/schemas/ConsolidarPreviewInput' } } },
        },
        responses: {
          '200': { description: 'Preview calculado com sucesso' },
          '400': { description: 'Pedidos inválidos para consolidação', content: { 'application/json': { schema: { '$ref': '#/components/schemas/Error' } } } },
          '401': { description: 'Token inválido', content: { 'application/json': { schema: { '$ref': '#/components/schemas/Error' } } } },
        },
      },
    },
    '/api/v1/pedidos/consolidacoes/confirmar': {
      post: {
        summary: 'Confirmar consolidação',
        description: 'Executa a consolidação dos pedidos selecionados, criando um único pedido consolidado.',
        operationId: 'consolidarConfirmar',
        tags: ['Consolidar'],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { '$ref': '#/components/schemas/ConsolidarPreviewInput' } } },
        },
        responses: {
          '200': { description: 'Consolidação realizada com sucesso' },
          '400': { description: 'Dados inválidos', content: { 'application/json': { schema: { '$ref': '#/components/schemas/Error' } } } },
          '401': { description: 'Token inválido', content: { 'application/json': { schema: { '$ref': '#/components/schemas/Error' } } } },
        },
      },
    },
    '/api/v1/pedidos/{id_pedido}/transferencias/preview': {
      post: {
        summary: 'Preview de transferência',
        description: 'Calcula o impacto de transferir pedidos para outro tenant. Retorna validações antes de confirmar.',
        operationId: 'transferirPreview',
        tags: ['Transferir'],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { '$ref': '#/components/schemas/TransferirPreviewInput' } } },
        },
        responses: {
          '200': { description: 'Preview calculado com sucesso' },
          '400': { description: 'Dados inválidos para transferência', content: { 'application/json': { schema: { '$ref': '#/components/schemas/Error' } } } },
          '401': { description: 'Token inválido', content: { 'application/json': { schema: { '$ref': '#/components/schemas/Error' } } } },
        },
      },
    },
    '/api/v1/pedidos/{id_pedido}/transferencias/confirmar': {
      post: {
        summary: 'Confirmar transferência',
        description: 'Executa a transferência dos pedidos para o tenant de destino.',
        operationId: 'transferirConfirmar',
        tags: ['Transferir'],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { '$ref': '#/components/schemas/TransferirPreviewInput' } } },
        },
        responses: {
          '200': { description: 'Transferência realizada com sucesso' },
          '400': { description: 'Dados inválidos', content: { 'application/json': { schema: { '$ref': '#/components/schemas/Error' } } } },
          '401': { description: 'Token inválido', content: { 'application/json': { schema: { '$ref': '#/components/schemas/Error' } } } },
        },
      },
    },
  },
} as const

openapiRouter.get('/', (_req: Request, res: Response) => {
  res.setHeader('Content-Type', 'application/json')
  res.setHeader('Cache-Control', 'public, max-age=300')
  res.json(PEDIDO_OPENAPI_SPEC)
})
