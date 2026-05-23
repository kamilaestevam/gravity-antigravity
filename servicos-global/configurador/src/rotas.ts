/**
 * Constantes de rota — SSOT do frontend (Configurador + produtos).
 *
 * Lei: `documentos-tecnicos/arquitetura/rotas-convencao.md`
 * Skill: `skills/governanca/convencao-tecnica/rotas/SKILL.md`
 *
 * Padrão: `/{área}/{sub-rota}` em kebab-case PT-BR, sem prefixo intermediário.
 * Áreas vêm direto após o domínio. Slug da área = `chaveProduto` do SDK
 * `@gravity/resolver-organizacao`.
 *
 * Usar `ROTAS.configurador.usuarios` em vez de hardcoded `'/configurador/usuarios'`.
 * Erro de digitação vira erro de compilação.
 */

export const ROTAS = {
  // ── Áreas fixas (1 instância no app) ──────────────────────────────────────
  raiz: '/',
  login: '/login',
  cadastro: '/cadastro',
  recuperarSenha: '/recuperar-senha',
  trial: '/trial',
  contato: '/contato',
  waitlist: '/waitlist',
  termosDeUso: '/termos-de-uso',
  politicaDePrivacidade: '/politica-de-privacidade',

  hub: '/hub',
  store: '/store',

  core: {
    raiz: '/core',
    atividades: '/core/atividades',
    email: '/core/email',
    whatsapp: '/core/whatsapp',
    notificacoes: '/core/notificacoes',
    conectorErp: '/core/conector-erp',
    configuracoes: '/core/configuracoes',
  },

  configurador: {
    raiz: '/configurador',
    organizacao: '/configurador/organizacao',
    workspaces: '/configurador/workspaces',
    usuarios: '/configurador/usuarios',
    empresasEParceiros: '/configurador/empresas-e-parceiros',
    assinaturas: '/configurador/assinaturas',
    financeiro: '/configurador/financeiro',
    conectorCargowise: '/configurador/conector-cargowise',
    taxasMoeda: '/configurador/taxas-moeda',
    historicoOrganizacao: '/configurador/historico-organizacao',
    apiCockpit: {
      raiz: '/configurador/api-cockpit',
      tokens: '/configurador/api-cockpit/tokens',
      webhooks: '/configurador/api-cockpit/webhooks',
      consumo: '/configurador/api-cockpit/consumo',
    },
  },

  admin: {
    raiz: '/admin',
    visaoGeral: '/admin/visao-geral',
    usuarios: '/admin/usuarios',
    produtosGravity: '/admin/produtos-gravity',
    financeiro: '/admin/financeiro',
    historicoGlobal: '/admin/historico-global',
    deploy: '/admin/deploy',
    testesGerais: '/admin/testes-gerais',
    seguranca: '/admin/seguranca',
    ncmIntegracao: '/admin/ncm-integracao',
    certificadosDigitais: '/admin/certificados-digitais',
    cadastrosGlobais: '/admin/cadastros-globais',
    empresasEParceiros: '/admin/empresas-e-parceiros',
    taxasMoeda: '/admin/taxas-moeda',
    organizacoes: '/admin/organizacoes',
    organizacaoDetalhe: (idOrganizacao: string) => `/admin/organizacoes/${idOrganizacao}`,
    apiCockpit: {
      raiz: '/admin/api-cockpit',
      tokens: '/admin/api-cockpit/tokens',
      webhooks: '/admin/api-cockpit/webhooks',
      consumo: '/admin/api-cockpit/consumo',
      monitorLlm: '/admin/api-cockpit/monitor-llm',
    },
  },

  // ── Áreas por produto ─────────────────────────────────────────────────────
  pedido: {
    raiz: '/pedido',
    visaoGeral: '/pedido/pedidos/visao-geral',
    dashboard: '/pedido/pedidos/dashboard',
    lista: '/pedido/pedidos/lista',
    kanban: '/pedido/pedidos/kanban',
    novo: '/pedido/pedidos/novo',
    configuracoes: '/pedido/configuracoes',
    editar: (idPedido: string) => `/pedido/pedidos/${idPedido}/editar`,
  },

  simulaCusto: { raiz: '/simula-custo' },
  processo: { raiz: '/processo' },
  bidFrete: { raiz: '/bid-frete' },
  bidCambio: { raiz: '/bid-cambio' },

  // ── Rotas legacy (apenas para detecção de redirect; não usar em código novo) ──
  legacy: {
    workspace: '/workspace',
    produtoPedido: '/produto/pedido',
    produtoSimulaCusto: '/produto/simula-custo',
    produtoProcesso: '/produto/processo',
    produtoBidFrete: '/produto/bid-frete',
    produtoBidCambio: '/produto/bid-cambio',
  },
} as const

/**
 * Lista de pares (legacy → canônica) para o middleware de redirect e o helper
 * `NavigateComPrefixo`. Ordem importa: mais específico primeiro.
 */
export const REDIRECTS_LEGACY: ReadonlyArray<{ de: string; para: string }> = [
  { de: '/workspace', para: '/configurador' },
  { de: '/produto/pedido', para: '/pedido' },
  { de: '/produto/simula-custo', para: '/simula-custo' },
  { de: '/produto/processo', para: '/processo' },
  { de: '/produto/bid-frete', para: '/bid-frete' },
  { de: '/produto/bid-cambio', para: '/bid-cambio' },
]
