/**
 * SSOT — Guia técnico para o time de TI do importador integrar SAP/ERP com Gravity.
 * Consumido por ModalGuiaIntegracaoSapGravity nas telas de Webhooks, Tokens e Conectores.
 */

export type FocoGuiaIntegracaoSap = 'webhook' | 'token' | 'conector' | 'completo'

export interface SecaoGuiaIntegracaoSap {
  id: FocoGuiaIntegracaoSap | 'visao-geral' | 'sap-integration-suite'
  titulo: string
  paragrafos: string[]
  lista?: string[]
  codigo?: { titulo: string; conteudo: string }[]
  diagrama?: string
}

export const TITULO_GUIA_INTEGRACAO_SAP =
  'Guia técnico — Integração SAP / ERP com Gravity'

export const SUBTITULO_GUIA_INTEGRACAO_SAP =
  'Para o time de TI do importador: como conectar SAP, SAP Integration Suite (CPI) ou middleware ao Gravity.'

export const SECOES_GUIA_INTEGRACAO_SAP: SecaoGuiaIntegracaoSap[] = [
  {
    id: 'visao-geral',
    titulo: '1. Visão geral — três formas de integrar',
    paragrafos: [
      'O Gravity expõe integração via API Cockpit (Configurador → API Cockpit). Escolha o fluxo conforme quem inicia a troca de dados:',
    ],
    diagrama: [
      '┌─────────────────────────────────────────────────────────────────┐',
      '│  A) SAP → Gravity (push)     Token API + REST                   │',
      '│     SAP/CPI chama POST/GET na API do produto (ex.: Pedido)        │',
      '├─────────────────────────────────────────────────────────────────┤',
      '│  B) Gravity → SAP (webhook)  HMAC + URL HTTPS do receptor       │',
      '│     Gravity notifica eventos (pedido.criado, cotacao.aprovada…)   │',
      '├─────────────────────────────────────────────────────────────────┤',
      '│  C) Gravity → SAP (pull)     Conector OData (opcional)            │',
      '│     Gravity busca entidades no SAP e sincroniza (quando ativo)    │',
      '└─────────────────────────────────────────────────────────────────┘',
    ].join('\n'),
    lista: [
      'Webhook e Token são complementares — não se substituem.',
      'Para integração bidirecional típica: token (entrada) + webhook (saída).',
      'Importação por arquivo continua disponível sem integração técnica.',
    ],
  },
  {
    id: 'webhook',
    titulo: '2. Webhook — Gravity notifica o SAP (saída)',
    paragrafos: [
      'Cadastre uma URL HTTPS do seu middleware (SAP CPI, Integration Suite, API Gateway ou servidor interno). O Gravity envia POST com JSON quando ocorre um evento inscrito.',
      'Na criação do webhook, copie o segredo HMAC — ele é exibido apenas uma vez. Use-o para validar que a requisição veio do Gravity.',
    ],
    lista: [
      'Método: POST',
      'Content-Type: application/json',
      'Header de assinatura: X-Gravity-Signature (HMAC-SHA256 do body com o segredo)',
      'Resposta esperada: HTTP 2xx em até 30s (retries com backoff em falha)',
      'Eventos disponíveis: pedido.criado, pedido.atualizado, cotacao.aprovada, simulacao.criada, documento.emitido, entre outros',
    ],
    codigo: [
      {
        titulo: 'Validação da assinatura (Node.js)',
        conteudo: `import crypto from 'crypto'

function validarAssinaturaGravity(
  corpoBruto: string,
  assinaturaRecebida: string,
  segredoWebhook: string,
): boolean {
  const esperada = crypto
    .createHmac('sha256', segredoWebhook)
    .update(corpoBruto, 'utf8')
    .digest('hex')
  return crypto.timingSafeEqual(
    Buffer.from(assinaturaRecebida, 'hex'),
    Buffer.from(esperada, 'hex'),
  )
}

// No handler HTTP do CPI/iFlow:
// const ok = validarAssinaturaGravity(
//   req.rawBody,
//   req.headers['x-gravity-signature'],
//   process.env.GRAVITY_WEBHOOK_SECRET,
// )`,
      },
      {
        titulo: 'Exemplo de payload de evento',
        conteudo: `{
  "evento": "pedido.criado",
  "id_organizacao": "org_xxxxxxxx",
  "id_produto_gravity": "pedido",
  "data_evento": "2026-07-14T18:30:00.000Z",
  "dados": {
    "id_pedido": "clxxxxxxxx",
    "numero_pedido": "PO-4500123456",
    "tipo_operacao": "IMPORTACAO",
    "status": "aberto"
  }
}`,
      },
    ],
  },
  {
    id: 'token',
    titulo: '3. Token de API — SAP chama o Gravity (entrada)',
    paragrafos: [
      'Gere um token na aba Tokens do API Cockpit. O sistema externo (SAP, CPI ou middleware) usa esse token para autenticar chamadas REST aos produtos Gravity contratados.',
      'Use escopo Escrita quando o SAP precisa criar ou atualizar registros; Leitura apenas para consultas.',
    ],
    lista: [
      'Header: Authorization: Bearer <token>',
      'Prefixo produção: gravity_token_api_producao_*',
      'Prefixo homologação: gravity_token_api_homologacao_*',
      'Documentação OpenAPI por produto: GET /api/v1/pedidos/openapi.json (exemplo Pedido)',
      'Rate limit padrão: 60 req/min por token (configurável na criação)',
    ],
    codigo: [
      {
        titulo: 'Exemplo — consultar pedidos (cURL)',
        conteudo: `curl -X GET "https://api.usegravity.com.br/pedido/api/v1/pedidos" \\
  -H "Authorization: Bearer gravity_token_api_producao_SEU_TOKEN" \\
  -H "Content-Type: application/json"`,
      },
      {
        titulo: 'Exemplo — iFlow SAP CPI (HTTP Receiver → Gravity)',
        conteudo: `1. Credential Store: gravar token Gravity
2. HTTP Sender no iFlow de origem SAP
3. Message Mapping: PO SAP → JSON contrato Gravity (Pedido)
4. HTTP Receiver: POST https://api.../api/v1/pedidos
   Header Authorization: Bearer {{token}}
5. Validar resposta 201 + id_pedido no body`,
      },
    ],
  },
  {
    id: 'conector',
    titulo: '4. Conector OData — Gravity busca no SAP (pull, opcional)',
    paragrafos: [
      'Use quando o Gravity precisa ir buscar dados no SAP (S/4HANA, ECC com OData). Não é obrigatório se o SAP empurra dados via API + token.',
      'Configure URL OData, usuário e senha na tela Conectores. As credenciais são armazenadas criptografadas (AES-256-GCM).',
    ],
    lista: [
      'Protocolo recomendado: OData v4 (SAP moderno)',
      'Endpoint típico: https://<host>/sap/opu/odata/sap/<service>/',
      'Autenticação: Basic Auth ou OAuth conforme ambiente SAP',
      'Disparo de sincronização: POST /api/v1/sincronizacoes-erp/disparar (entidade, $filter, $select)',
      'Alternativa: expor OData via SAP Integration Suite e apontar o conector para o endpoint do CPI',
    ],
    codigo: [
      {
        titulo: 'Exemplo — disparar sincronização OData',
        conteudo: `POST /api/v1/sincronizacoes-erp/disparar
Content-Type: application/json
x-chave-interna-servico: <chave interna>

{
  "tenant_id": "org_xxxxxxxx",
  "product_id": "pedido",
  "entity": "A_PurchaseOrder",
  "filter": "PurchaseOrderType eq 'NB'",
  "select": ["PurchaseOrder", "Supplier", "PurchaseOrderDate"],
  "top": 100,
  "triggered_by": "sap-sync-agendado"
}`,
      },
    ],
  },
  {
    id: 'sap-integration-suite',
    titulo: '5. Testar com SAP Integration Suite (CPI)',
    paragrafos: [
      'O SAP Integration Suite é o ambiente ideal para homologar antes de produção. Você pode testar os três fluxos sem alterar o SAP produtivo.',
    ],
    lista: [
      'Cenário A (SAP → Gravity): iFlow com HTTP Receiver chamando API Gravity + token sandbox',
      'Cenário B (Gravity → SAP): cadastrar URL do HTTP Receiver do CPI na aba Webhooks; validar HMAC no script Groovy/Java do iFlow',
      'Cenário C (Pull OData): publicar serviço OData no CPI e configurar Conectores com essa URL',
      'Use o botão Testar na aba Webhooks para validar conectividade antes de ir a produção',
      'Monitore entregas em Histórico (webhook) e Consumo (API) no API Cockpit',
    ],
    codigo: [
      {
        titulo: 'Checklist do time de TI',
        conteudo: `□ Token sandbox gerado (escopo correto)
□ URL webhook HTTPS cadastrada + segredo HMAC guardado
□ iFlow CPI com validação de assinatura (webhook)
□ Mapeamento PO SAP → JSON Gravity documentado
□ Teste de disparo webhook retorna HTTP 200
□ OpenAPI do produto revisado (/api/v1/.../openapi.json)
□ Firewall: liberar saída Gravity → URL do CPI e entrada CPI → api.usegravity.com.br`,
      },
    ],
  },
]

/** Retorna seções visíveis conforme o foco da tela. */
export function secoesGuiaPorFoco(foco: FocoGuiaIntegracaoSap): SecaoGuiaIntegracaoSap[] {
  if (foco === 'completo') return SECOES_GUIA_INTEGRACAO_SAP
  const idsVisiveis = new Set<FocoGuiaIntegracaoSap | 'visao-geral' | 'sap-integration-suite'>([
    'visao-geral',
    foco,
    'sap-integration-suite',
  ])
  return SECOES_GUIA_INTEGRACAO_SAP.filter((s) => idsVisiveis.has(s.id))
}
