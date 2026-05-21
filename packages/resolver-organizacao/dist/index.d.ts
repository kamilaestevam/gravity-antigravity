import { RequestHandler, Request } from 'express';
import { Prisma } from '@prisma/client';

/**
 * Identificador canônico de cada produto/serviço de organização que consome o SDK.
 * Usado para roteamento, métricas e logs.
 */
type ChaveProduto = 'pedido' | 'processo' | 'simula-custo' | 'bid-frete' | 'bid-cambio' | 'nf-importacao' | 'financeiro-comex' | 'conector-erp' | 'organizacao-services';
/**
 * Contexto de organização resolvido para a request corrente.
 *
 * Anexado ao `req.organizacao` pelo middleware `resolverOrganizacao`.
 * NÃO contém dados sensíveis além do necessário para roteamento.
 */
interface ContextoOrganizacao {
    /** SUID da organização (mesmo do Configurador). */
    idOrganizacao: string;
    /** Nome do schema PostgreSQL: `tenant_<suid_sem_hifens>`. Validado contra regex. */
    nomeSchema: string;
    /** Workspace ativo do usuário, opcional. */
    idWorkspace?: string;
    /** SUID do usuário Clerk. */
    idUsuario: string;
    /** Lista de tipos de usuário (ex.: `['SUPER_ADMIN', 'PEDIDO_WRITE']`). */
    tiposUsuario: string[];
    /** ULID gerado por request — propagado em logs/spans. */
    idCorrelacao: string;
    /**
     * URL do banco do produto, capturada no boot pelo middleware
     * `resolverOrganizacao` (quando `process.env.DATABASE_URL` ainda aponta
     * para o banco correto do produto).
     *
     * Necessária no deploy monolito-sidecar (`configurador/server/index.ts`):
     * vários produtos compartilham o mesmo processo Node e `DATABASE_URL` é
     * mutado entre os boots dos sidecars. Em tempo de request `DATABASE_URL`
     * já foi restaurado para o banco de outro produto — por isso a URL precisa
     * viajar no contexto, não ser relida do ambiente.
     *
     * Quando ausente (ex.: workers via `withOrganizacaoContext`), o SDK usa
     * `process.env.DATABASE_URL` como fallback — comportamento legado.
     */
    urlBanco?: string;
}
/**
 * Configuração do middleware. Cada produto cria 1 instância no boot.
 */
interface ConfigResolverOrganizacao {
    /** Identificador do produto consumidor. */
    chaveProduto: ChaveProduto;
    /** Base URL do Configurador (ex.: `https://configurador.gravity.app`). */
    configuradorBaseUrl: string;
    /** Chave compartilhada `x-chave-interna-servico` para chamadas inter-serviço. */
    chaveInterna: string;
    /** TTL do cache de organização em ms. Default: 60_000. */
    cacheTtlMs?: number;
    /**
     * URL do Redis (cache + BullMQ). Se ausente, o SDK degrada para cache
     * in-memory por instância e desabilita o event-bus listener — modo
     * adequado a testes e dev local.
     */
    redisUrl?: string;
    /**
     * Chave secreta do Clerk para validação de JWT. Default:
     * `process.env.CLERK_SECRET_KEY`.
     */
    clerkSecretKey?: string;
    /** Timeout em ms para chamadas ao Configurador. Default: 5_000. */
    configuradorTimeoutMs?: number;
    /** Tentativas para chamadas ao Configurador (incluindo a primeira). Default: 3. */
    configuradorRetries?: number;
}
/**
 * Cliente Prisma DENTRO de `$transaction`.
 *
 * Único tipo permitido para tocar o banco em produtos. Não expõe
 * `$transaction`, `$connect`, `$disconnect`, `$on`, `$use`, `$extends` —
 * essas operações são proibidas em handler de produto.
 *
 * `$queryRaw` e `$executeRaw` permanecem disponíveis (rodam sob a transação,
 * portanto sob o `search_path` correto). `$executeRawUnsafe` também — bloquear
 * chamadas com `SET search_path` é responsabilidade do linter, não do tipo.
 */
type BancoOrganizacao = Omit<Prisma.TransactionClient, '$transaction' | '$connect' | '$disconnect' | '$on' | '$use' | '$extends'>;
/**
 * Augmentation do Express `Request` para incluir `req.organizacao`.
 *
 * Importar este módulo (transitivamente, via `@gravity/resolver-organizacao`)
 * já habilita o tipo em qualquer produto que use Express.
 */
declare module 'express-serve-static-core' {
    interface Request {
        organizacao?: ContextoOrganizacao;
    }
}

/**
 * Middleware Express `resolverOrganizacao(config)`.
 *
 * Fluxo de 10 passos (ADR-002 §5):
 *  1. Extrai JWT do header Authorization.
 *  2. Valida JWT via @clerk/backend verifyToken.
 *  3. Extrai idUsuario do payload (sub).
 *  4. Consulta cache por idUsuario.
 *  5. Se cache miss → GET /api/v1/internal/usuarios/:id_clerk_usuario no Configurador.
 *  6. Valida que organização está active (feito no configurador-client).
 *  7. Valida nomeSchema contra regex de segurança (defense-in-depth).
 *  8. Gera idCorrelacao (SUID por request).
 *  9. Anexa req.organizacao: ContextoOrganizacao.
 * 10. Emite span OTel + chama next().
 */

/**
 * Cria o middleware Express de resolução de organização.
 *
 * Deve ser instanciado UMA VEZ no boot do servidor e reutilizado em todas
 * as requests. Cria internamente: CacheOrganizacao, ConfiguradorClient.
 *
 * @throws Error se `config` for inválida — falha no boot, não em runtime.
 */
declare function resolverOrganizacao(config: ConfigResolverOrganizacao): RequestHandler;

/**
 * Middleware Express `verificarAcessoProduto(config)`.
 *
 * PORTÃO 3 — autorização granular usuário × produto Gravity.
 *
 * Deve ser usado APÓS `resolverOrganizacao` (que injeta req.organizacao).
 * Lê `id_workspace` do header `x-id-workspace` (convenção dos produtos Gravity).
 *
 * Faz chamada S2S ao Configurador:
 *   GET /api/v1/internal/acesso-produto/verificar
 *
 * Master/SuperAdmin/Admin → permitido (bypass server-side no Configurador, Mand. 04).
 * Standard/Fornecedor → exige linha `<slug>:acesso_usuario_produtos_gravity:permitido`
 * em `usuario_permissao` para o workspace específico.
 *
 * Em caso de erro de comunicação (503), nega acesso (fail-closed, Mand. 08).
 *
 * USO:
 * ```ts
 * import { resolverOrganizacao, verificarAcessoProduto } from '@gravity/resolver-organizacao'
 * app.use(resolverOrganizacao({ chaveProduto: 'pedido', ... }))
 * app.use(verificarAcessoProduto({ chaveProduto: 'pedido', ... }))
 * ```
 */

interface ConfigVerificarAcessoProduto {
    /** Slug do produto — ex: 'pedido', 'bid-frete'. */
    chaveProduto: string;
    /** Base URL do Configurador (mesmo valor passado a resolverOrganizacao). */
    configuradorBaseUrl: string;
    /** Chave S2S — mesma usada em resolverOrganizacao. */
    chaveInterna: string;
    configuradorTimeoutMs?: number;
    configuradorRetries?: number;
}
declare function verificarAcessoProduto(config: ConfigVerificarAcessoProduto): RequestHandler;

/**
 * Middleware Express `criarRequirePermissao(config)` → factory que devolve
 * uma função `exigirPermissao(secao, acao)` retornando middleware.
 *
 * CADEIA 2 GRANULAR — autorização por `<slug>:<secao>:<acao>` em
 * `UsuarioPermissao`. Deve ser usado APÓS `resolverOrganizacao` (que injeta
 * `req.organizacao`) e idealmente APÓS `verificarAcessoProduto` (Portão 3).
 *
 * Lê `id_workspace` do header `x-id-workspace` (mesma convenção do Portão 3).
 *
 * Faz chamada S2S ao Configurador:
 *   POST /api/v1/internal/permissoes/verificar
 *
 * Master/SuperAdmin/Admin → permitido (bypass server-side no Configurador, Mand. 04).
 * Standard/Fornecedor     → exige linha `<slug>:<secao>:<acao>` em UsuarioPermissao.
 *
 * Cache em memória — TTL 30s por par (usuario, workspace, slug, secao, acao).
 * Janela de inconsistência aceitável (Master altera → próxima request <30s
 * ainda pode ver estado antigo). Cada réplica do produto tem cache próprio
 * (não compartilhado). Padrão consistente com `requireAuth.ts` do Configurador.
 *
 * Feature flag (ENV `<SLUG>_PERMISSOES_GRANULARES_ATIVO`):
 *   - `true`  (default) → bloqueia 403 quando permissão faltar
 *   - `false` → loga shadow audit "rotaria 403" mas LIBERA. Útil pra roll-out
 *     gradual sem lockout. Auditoria preserva visibilidade do blast radius.
 *
 * Em caso de erro de comunicação (503), nega acesso (fail-closed, Mand. 08).
 *
 * USO:
 * ```ts
 * import { resolverOrganizacao, verificarAcessoProduto, criarRequirePermissao }
 *   from '@gravity/resolver-organizacao'
 *
 * app.use(resolverOrganizacao({ chaveProduto: 'pedido', ... }))
 * app.use(verificarAcessoProduto({ chaveProduto: 'pedido', ... }))
 *
 * const exigirPermissao = criarRequirePermissao({
 *   chaveProduto: 'pedido',
 *   configuradorBaseUrl: process.env.CONFIGURATOR_URL!,
 *   chaveInterna: process.env.CHAVE_INTERNA_SERVICO!,
 *   flagAtivaEnvName: 'PEDIDO_PERMISSOES_GRANULARES_ATIVO',
 * })
 *
 * app.use('/api/v1/pedidos/kanban', exigirPermissao('kanban', 'ver'), kanbanRouter)
 * ```
 */

interface ConfigCriarRequirePermissao {
    /** Slug do produto — ex: 'pedido'. Usado na chave canônica `<slug>:<secao>:<acao>`. */
    chaveProduto: string;
    /** Base URL do Configurador. */
    configuradorBaseUrl: string;
    /** Chave S2S compartilhada. */
    chaveInterna: string;
    configuradorTimeoutMs?: number;
    configuradorRetries?: number;
    /**
     * Nome da variável de ambiente que liga/desliga o gating do produto.
     * Quando a env vale `'false'`, o middleware vira NOOP + shadow audit.
     * Default: ligado (flag !== 'false').
     *
     * Convenção: `<SLUG>_PERMISSOES_GRANULARES_ATIVO` (ex.: PEDIDO_..., LPCO_...).
     */
    flagAtivaEnvName?: string;
    /** TTL do cache local em ms. Default 30_000 (30s). */
    cacheTtlMs?: number;
    /**
     * Hook opcional para logar quando a flag está OFF mas a request seria bloqueada
     * com flag ON. Permite medir o blast radius sem causá-lo. Decisão dono 2026-05-13.
     *
     * Fire-and-forget — não bloqueia a request.
     */
    onShadowDeny?: (info: {
        idOrganizacao: string;
        idUsuario: string;
        idWorkspace: string;
        slugProduto: string;
        secao: string;
        acao: string;
        rota: string;
        metodo: string;
    }) => void;
}
type ExigirPermissaoFn = (secao: string, acao: 'ver' | 'editar') => RequestHandler;
declare function criarRequirePermissao(config: ConfigCriarRequirePermissao): ExigirPermissaoFn;

/**
 * `withOrganizacao` e `withOrganizacaoContext` — única forma permitida de tocar o banco.
 *
 * PADRÃO OBRIGATÓRIO (ADR-001 §"Modelo de Conexão" + ADR-002 §3):
 *
 *   _internalPrisma.$transaction(async (tx) => {
 *     await tx.$executeRawUnsafe(
 *       `SET LOCAL search_path TO "${ctx.nomeSchema}", public`
 *     );
 *     return fn(tx);
 *   }, { timeout: 10_000, isolationLevel: 'ReadCommitted' });
 *
 * Por quê:
 * - PgBouncer roda em modo `transaction` para densidade de pool.
 * - `SET LOCAL` faz o Postgres RESETAR o search_path automaticamente no
 *   COMMIT/ROLLBACK. A garantia é DO BANCO, não da aplicação.
 * - Se o handler crashar, der OOM, der timeout — o pool não vaza.
 *
 * NÃO altere esse padrão sem novo ADR. NÃO adicione caminho alternativo.
 */

/**
 * Executa `fn` dentro de uma transação Prisma com `SET LOCAL search_path`
 * apontando para o schema da organização da request.
 *
 * @throws AppError(500, 'ORGANIZACAO_MISSING') se `req.organizacao` não foi
 *         resolvido pelo middleware `resolverOrganizacao`.
 * @throws AppError(400, 'INVALID_ORGANIZACAO_ID') se o `nomeSchema` não passa
 *         pelo regex de segurança (defense-in-depth).
 */
declare function withOrganizacao<T>(req: Request, fn: (db: BancoOrganizacao) => Promise<T>, opts?: {
    timeoutMs?: number;
}): Promise<T>;
/**
 * Variante para CRON jobs / workers — sem `req`.
 * Resolve a organização pelo ID, abre transação e chama `fn(ctx, db)`.
 *
 * Cada chamada abre UMA transação isolada. NUNCA reutilize `db` fora do
 * callback nem aninhe contextos diferentes — vide skill `sdk-resolvedor-organizacao`
 * §"Cuidados em loops multi-organização".
 */
declare function withOrganizacaoContext<T>(idOrganizacao: string, fn: (ctx: ContextoOrganizacao, db: BancoOrganizacao) => Promise<T>): Promise<T>;

/**
 * Cliente HTTP para o Configurador — fonte de verdade de identidade.
 *
 * Endpoints (mounted em /api/v1/internal no Configurador, ver acesso.ts):
 *   GET /api/v1/internal/organizacoes/:id_organizacao   → resolve organizacao por ID (CRON/worker)
 *   GET /api/v1/internal/usuarios/:id_clerk_usuario     → resolve org pelo Clerk sub (middleware HTTP)
 *
 * Toda chamada inclui `x-chave-interna-servico` (S2S). Falhas mapeadas para `AppError`.
 * Cache fica em `cache.ts` — este módulo faz apenas o fetch + validação Zod.
 */

declare function resolveOrganizacaoById(idOrganizacao: string, idCorrelacao?: string): Promise<ContextoOrganizacao>;

/**
 * obter-workspaces-habilitados.ts
 *
 * Helper público para consultar a lista de workspaces que um usuário pode
 * acessar dentro de uma organização. Consumido por produtos (ex: Pedido)
 * para validar filtros multi-workspace em listas.
 *
 * Padrão de uso (dentro de uma rota Express, após `resolverOrganizacao`):
 *
 *   const { tipoUsuario, workspacesHabilitados } =
 *     await obterWorkspacesHabilitadosDoUsuario({
 *       configuradorBaseUrl: process.env.CONFIGURATOR_URL!,
 *       chaveInterna:        process.env.CHAVE_INTERNA_SERVICO!,
 *       idOrganizacao,
 *       idUsuario,
 *     });
 *
 * Retorna sempre `string[]` (nunca string mágica como 'TODOS'). Para
 * MASTER/SAdmin/Admin, a lista contém todos os workspaces ATIVOS da org.
 * Para PADRAO/FORNECEDOR, apenas os habilitados (UsuarioWorkspace.ativo).
 */
interface ObterWorkspacesHabilitadosInput {
    /** URL base do Configurador (ex: http://localhost:8000) */
    configuradorBaseUrl: string;
    /** Chave interna S2S (process.env.CHAVE_INTERNA_SERVICO) */
    chaveInterna: string;
    /** Timeout por tentativa em ms — padrão 5000 */
    timeoutMs?: number;
    /** Retries para 5xx — padrão 3 */
    retries?: number;
    /** Organização do usuário */
    idOrganizacao: string;
    /** Usuário cuja lista de workspaces queremos resolver */
    idUsuario: string;
    /** Correlation ID para trace (gerado se omitido) */
    idCorrelacao?: string;
}
interface ObterWorkspacesHabilitadosOutput {
    /** Tipo do usuário no Configurador */
    tipoUsuario: 'SUPER_ADMIN' | 'ADMIN' | 'MASTER' | 'PADRAO' | 'FORNECEDOR';
    /**
     * IDs dos workspaces que o usuário pode acessar nesta organização.
     * SUPER_ADMIN/ADMIN/MASTER → todos os ATIVOS da org.
     * PADRAO/FORNECEDOR       → apenas habilitados (UsuarioWorkspace.ativo).
     */
    workspacesHabilitados: string[];
}
declare function obterWorkspacesHabilitadosDoUsuario(input: ObterWorkspacesHabilitadosInput): Promise<ObterWorkspacesHabilitadosOutput>;

/**
 * obter-workspaces.ts
 *
 * Helper público para batch lookup de workspaces por IDs. Consumido por
 * produtos que precisam snapshot de nome+CNPJ do workspace (ex: Pedido
 * auto-fill ao trocar tipo_operacao em massa).
 *
 * Padrão de uso (dentro de uma rota Express, após `resolverOrganizacao`):
 *
 *   const workspaces = await obterWorkspaces({
 *     configuradorBaseUrl: process.env.CONFIGURATOR_URL!,
 *     chaveInterna:        process.env.CHAVE_INTERNA_SERVICO!,
 *     ids: ['ws-A', 'ws-B', 'ws-C'],
 *   });
 *
 * IDs ausentes (workspace órfão) NÃO geram erro — apenas não aparecem na
 * resposta. Caller decide tratamento (Mand. 08).
 */
interface ObterWorkspacesInput {
    /** URL base do Configurador (ex: http://localhost:8000) */
    configuradorBaseUrl: string;
    /** Chave interna S2S (process.env.CHAVE_INTERNA_SERVICO) */
    chaveInterna: string;
    /** Timeout por tentativa em ms — padrão 5000 */
    timeoutMs?: number;
    /** Retries para 5xx — padrão 3 */
    retries?: number;
    /** IDs dos workspaces a buscar (batch). Strings vazias filtradas. */
    ids: string[];
    /** Correlation ID para trace (gerado se omitido) */
    idCorrelacao?: string;
}
interface WorkspaceLookupItem {
    idWorkspace: string;
    idOrganizacao: string;
    nomeWorkspace: string;
    /** CNPJ pode ser null (workspace ainda não preencheu fiscal) */
    cnpjWorkspace: string | null;
}
declare function obterWorkspaces(input: ObterWorkspacesInput): Promise<WorkspaceLookupItem[]>;

/**
 * Erros tipados do SDK.
 *
 * Toda falha do tenant-resolver vira `AppError` — nunca `res.status().json()`
 * direto. O handler global de erro do produto traduz para resposta HTTP.
 */
/**
 * Erro de domínio do SDK (e do projeto Gravity como um todo).
 *
 * @param message    Mensagem técnica para log (não exibir cru ao usuário final).
 * @param statusCode Código HTTP a ser usado pelo handler global.
 * @param code       Código simbólico estável para clientes/i18n.
 */
declare class AppError extends Error {
    readonly statusCode: number;
    readonly code: string;
    constructor(message: string, statusCode: number, code: string);
}

export { AppError, type BancoOrganizacao, type ChaveProduto, type ConfigCriarRequirePermissao, type ConfigResolverOrganizacao, type ContextoOrganizacao, type ExigirPermissaoFn, type ObterWorkspacesHabilitadosInput, type ObterWorkspacesHabilitadosOutput, type ObterWorkspacesInput, type WorkspaceLookupItem, criarRequirePermissao, obterWorkspaces, obterWorkspacesHabilitadosDoUsuario, resolveOrganizacaoById, resolverOrganizacao, verificarAcessoProduto, withOrganizacao, withOrganizacaoContext };
