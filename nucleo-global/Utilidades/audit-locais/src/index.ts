/**
 * audit-locais — tabela de lookup que traduz uma chamada HTTP em um par
 * `Sessão | Subsessão` legível para o usuário final.
 *
 * Esta é a única fonte de verdade da taxonomia de "Local" exibida na tela
 * de Histórico (e em qualquer outra UI que precise descrever onde uma
 * ação foi disparada). Reflete o mapa decidido pelo dono do projeto:
 *
 *   - Login           — autenticação (login, senha, recuperação)
 *   - Onboarding      — primeiro acesso (master criando a organização)
 *   - HUB             — seletor pós-login (escolher workspace, ativar produto)
 *   - Core            — features compartilhadas pela organização (atividades,
 *                       email, whatsapp, notificações, histórico, conector ERP)
 *   - Admin           — área Gravity admin (apenas SUPER_ADMIN/ADMIN), com
 *                       subsessão (Visão Geral, Organizações, Workspaces, ...)
 *   - Configurador    — área do workspace (qualquer usuário), com subsessão
 *                       (Organização, Workspaces, Usuários, ...)
 *   - <Produto>       — cada produto com subsessão = aba (Dashboard, Lista,
 *                       Kanban, Configurações, ...)
 *
 * Por que viver no `nucleo-global`: é fonte única de verdade compartilhada
 * pelos consumidores (tela de Histórico do Configurador, tela de Histórico
 * Global do Admin, futuros widgets de timeline em produtos). Mover para
 * uma Utilidade pura evita divergência entre UIs.
 *
 * Referências:
 *  - Mandamento 03 (DDD nomenclatura)
 *  - skill `arquitetura/observabilidade/SKILL.md` (Audit Trail Centralizado)
 *  - skill `governanca/lei/visao-geral/SKILL.md` (mapa de áreas da plataforma)
 */

export interface LocalDescriptor {
  /** Nome da sessão top-level (Login, Onboarding, HUB, Core, Admin, Configurador, ou nome do produto) */
  sessao: string
  /** Nome da subsessão (aba/tela específica), opcional. */
  subsessao?: string
}

/**
 * Entrada da tabela de lookup.
 *
 * `match`: regex aplicado contra o endpoint normalizado (path + querystring
 * removidos). Use `^...$` quando quiser bater path inteiro.
 * `local`: descritor a retornar; pode ser função para extrair subsessão de
 * `params` quando o path tem partes dinâmicas.
 */
interface RegraLocal {
  match: RegExp
  local: LocalDescriptor | ((m: RegExpMatchArray) => LocalDescriptor)
}

// ---------------------------------------------------------------------------
// Subsessões legíveis (PT-BR canonical com acentuação)
// ---------------------------------------------------------------------------

const ADMIN_SUBSESSAO: Record<string, string> = {
  'visao-geral':       'Visão Geral',
  'organizacoes':      'Organizações',
  'usuarios':          'Usuários',
  'produtos-gravity':  'Produtos Gravity',
  'financeiro':        'Financeiro',
  'historico-global':  'Histórico Global',
  'deploy':            'Deploy',
  'testes-gerais':     'Testes Gerais',
  'api-cockpit':       'API Cockpit',
  'seguranca':         'Segurança',
  'eventos-seguranca': 'Segurança',
  'integracao-ncm':    'NCM Siscomex',
  'cadastros-globais': 'Cadastros Globais',
  'faturas':           'Financeiro',
}

const CONFIGURADOR_SUBSESSAO: Record<string, string> = {
  'organizacao':           'Organização',
  'workspaces':            'Workspaces',
  'usuarios':              'Usuários',
  'empresas-e-parceiros':  'Empresas e Parceiros',
  'assinaturas':           'Assinaturas',
  'financeiro':            'Financeiro',
  'api-cockpit':           'API Cockpit',
  'conector-cargowise':    'Conector CargoWise',
  'taxas-cambio':          'Taxa de Câmbio',
  'taxa-cambio':           'Taxa de Câmbio',
  'historico-organizacao': 'Histórico',
  'preferencias':          'Preferências',
}

const CORE_SUBSESSAO: Record<string, string> = {
  'atividades':    'Atividades',
  'email':         'Email',
  'whatsapp':      'WhatsApp',
  'notificacoes':  'Notificações',
  'historico':     'Histórico',
  'conector-erp':  'Conector ERP',
  'configuracoes': 'Configurações',
}

const PRODUTO_NOME: Record<string, string> = {
  'pedido':           'Pedido',
  'bid-frete':        'Bid Frete',
  'bid-cambio':       'Bid Câmbio',
  'lpco':             'LPCO',
  'nf-importacao':    'NF Importação',
  'processo':         'Processo',
  'simula-custo':     'Simula Custo',
  'financeiro-comex': 'Financeiro Comex',
}

// ---------------------------------------------------------------------------
// Tabela de regras (avaliada em ordem — primeira que casa ganha)
// ---------------------------------------------------------------------------

const REGRAS: RegraLocal[] = [
  // ─── Login ────────────────────────────────────────────────────────────────
  { match: /^\/api\/v1\/auth\b/, local: { sessao: 'Login' } },
  { match: /^\/api\/v1\/webhooks\/clerk\b/, local: { sessao: 'Login', subsessao: 'Webhook Clerk' } },

  // ─── Onboarding ───────────────────────────────────────────────────────────
  // POST /api/v1/organizacoes (sem /me) é criação durante onboarding
  { match: /^\/api\/v1\/organizacoes\/?$/, local: { sessao: 'Onboarding' } },

  // ─── HUB ──────────────────────────────────────────────────────────────────
  { match: /^\/api\/v1\/hub\b/, local: { sessao: 'HUB' } },
  { match: /^\/api\/v1\/me\/preferencias\b/, local: { sessao: 'HUB', subsessao: 'Workspace ativo' } },
  { match: /^\/api\/v1\/me\/sugestoes-subdominio\b/, local: { sessao: 'HUB', subsessao: 'Subdomínio' } },

  // ─── Core (features compartilhadas) ───────────────────────────────────────
  {
    match: /^\/api\/tenant\/preferencias\b/,
    local: { sessao: 'Core', subsessao: 'Preferências' },
  },
  {
    match: /^\/api\/v1\/notificacoes\b/,
    local: { sessao: 'Core', subsessao: 'Notificações' },
  },
  {
    match: /^\/api\/v1\/historico-global\b|^\/api\/v1\/admin\/historico-global\b/,
    local: { sessao: 'Core', subsessao: 'Histórico Global' },
  },

  // ─── Admin (Sessão | Subsessão) ───────────────────────────────────────────
  {
    match: /^\/api\/v1\/admin\/([a-z0-9-]+)/,
    local: (m) => ({
      sessao: 'Admin',
      subsessao: ADMIN_SUBSESSAO[m[1]] ?? capitalize(m[1]),
    }),
  },

  // ─── Configurador (workspace pages) ───────────────────────────────────────
  // /api/v1/me/workspaces → Workspaces (do Configurador)
  {
    match: /^\/api\/v1\/me\/workspaces\b/,
    local: { sessao: 'Configurador', subsessao: 'Workspaces' },
  },
  {
    match: /^\/api\/v1\/organizacoes\/me\b/,
    local: { sessao: 'Configurador', subsessao: 'Organização' },
  },
  {
    match: /^\/api\/v1\/historico-organizacao\b/,
    local: { sessao: 'Configurador', subsessao: 'Histórico' },
  },
  {
    match: /^\/api\/v1\/usuarios\b/,
    local: { sessao: 'Configurador', subsessao: 'Usuários' },
  },
  {
    match: /^\/api\/v1\/faturas-produto-gravity\b/,
    local: { sessao: 'Configurador', subsessao: 'Financeiro' },
  },
  {
    match: /^\/api\/v1\/api-cockpit\/admin\b/,
    local: { sessao: 'Admin', subsessao: 'API Cockpit' },
  },
  {
    match: /^\/api\/v1\/api-cockpit\b/,
    local: { sessao: 'Configurador', subsessao: 'API Cockpit' },
  },
  {
    match: /^\/api\/v1\/taxa-cambio\b/,
    local: { sessao: 'Configurador', subsessao: 'Taxa de Câmbio' },
  },
  {
    match: /^\/api\/v1\/tokens-servico\b/,
    local: { sessao: 'Configurador', subsessao: 'Tokens de Serviço' },
  },
  // Ativação/desativação de produto em workspace
  {
    match: /^\/api\/v1\/workspaces\/[^/]+\/produtos-gravity\b/,
    local: { sessao: 'Configurador', subsessao: 'Produtos do Workspace' },
  },
  {
    match: /^\/api\/v1\/produtos-gravity\b/,
    local: { sessao: 'Configurador', subsessao: 'Produtos Gravity' },
  },

  // ─── Produtos (cada um com seu próprio prefixo) ───────────────────────────
  // Ex: /api/v1/pedido/lista, /api/v1/bid-frete/dashboard
  {
    match: /^\/api\/v1\/(pedido|bid-frete|bid-cambio|lpco|nf-importacao|processo|simula-custo|financeiro-comex)(?:\/([a-z0-9-]+))?/,
    local: (m) => ({
      sessao: PRODUTO_NOME[m[1]] ?? capitalize(m[1]),
      subsessao: m[2] ? capitalize(m[2]) : undefined,
    }),
  },

  // ─── Internos (S2S) ───────────────────────────────────────────────────────
  { match: /^\/api\/v1\/internal\b/, local: { sessao: 'Sistema', subsessao: 'S2S' } },
]

// ---------------------------------------------------------------------------
// API pública
// ---------------------------------------------------------------------------

/**
 * Traduz um endpoint HTTP em descritor de Local.
 *
 * Ordem de resolução:
 *   1. Tenta cada regra de `REGRAS` na ordem; primeira que casar retorna.
 *   2. Fallback derivado de `modulo` + `tipoRecurso` (quando passados).
 *   3. Último recurso: `{ sessao: 'Desconhecido' }`.
 *
 * Sempre retorna um descritor — nunca lança nem retorna `null`.
 *
 * @param endpoint Path da request (sem querystring), ex: "/api/v1/me/workspaces"
 * @param modulo Valor de `modulo_historico_log` do registro (fallback)
 * @param tipoRecurso Valor de `tipo_recurso_historico_log` do registro (fallback)
 */
export function caminhoParaLocal(
  endpoint: string | null | undefined,
  modulo?: string | null,
  tipoRecurso?: string | null,
): LocalDescriptor {
  const path = sanitize(endpoint)

  if (path) {
    for (const regra of REGRAS) {
      const m = path.match(regra.match)
      if (m) {
        return typeof regra.local === 'function' ? regra.local(m) : regra.local
      }
    }
  }

  // Fallback 1: módulo declarado pelo caller
  if (modulo) {
    const sessaoFromModulo = MODULO_PARA_SESSAO[modulo] ?? capitalize(modulo)
    return { sessao: sessaoFromModulo, subsessao: tipoRecurso ?? undefined }
  }

  // Fallback 2: só tipoRecurso
  if (tipoRecurso) {
    return { sessao: 'Desconhecido', subsessao: tipoRecurso }
  }

  return { sessao: 'Desconhecido' }
}

/**
 * Formata o descritor como string `Sessão | Subsessão` (ou só `Sessão`).
 */
export function formatarLocal(local: LocalDescriptor): string {
  return local.subsessao ? `${local.sessao} | ${local.subsessao}` : local.sessao
}

/** Atalho conveniente. */
export function caminhoParaLocalString(
  endpoint: string | null | undefined,
  modulo?: string | null,
  tipoRecurso?: string | null,
): string {
  return formatarLocal(caminhoParaLocal(endpoint, modulo, tipoRecurso))
}

// ---------------------------------------------------------------------------
// Internos
// ---------------------------------------------------------------------------

const MODULO_PARA_SESSAO: Record<string, string> = {
  auth:        'Login',
  configuracao: 'Configurador',
  configurador: 'Configurador',
  admin:       'Admin',
  jobs:        'Sistema',
  historico:   'Core',
  pedido:      'Pedido',
  'bid-frete': 'Bid Frete',
  'bid-cambio': 'Bid Câmbio',
  lpco:        'LPCO',
  'nf-importacao':    'NF Importação',
  processo:    'Processo',
  'simula-custo':     'Simula Custo',
  'financeiro-comex': 'Financeiro Comex',
}

function sanitize(endpoint: string | null | undefined): string {
  if (!endpoint) return ''
  // remove querystring e fragmentos
  const semQs = endpoint.split('?')[0].split('#')[0]
  // normaliza barras
  return semQs.replace(/\/+$/, '') || '/'
}

function capitalize(s: string): string {
  if (!s) return s
  return s
    .split(/[-_]/)
    .map((w) => (w ? w[0].toUpperCase() + w.slice(1).toLowerCase() : ''))
    .join(' ')
}
