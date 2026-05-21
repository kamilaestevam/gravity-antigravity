import { randomUUID } from 'crypto';
import { verifyToken } from '@clerk/backend';
import { z } from 'zod';
import { PrismaClient } from '@prisma/client';

// src/middleware.ts

// src/cache.ts
var CacheOrganizacao = class {
  /** Índice primário: idUsuario → entry. */
  byUsuario = /* @__PURE__ */ new Map();
  /** Índice reverso: idOrganizacao → Set<idUsuario> para invalidação em massa. */
  organizacaoToUsuarios = /* @__PURE__ */ new Map();
  ttlMs;
  constructor(options = {}) {
    this.ttlMs = options.ttlMs ?? 6e4;
  }
  /**
   * Busca contexto pelo idUsuario.
   * Retorna `null` se ausente ou expirado (evicção lazy).
   */
  get(idUsuario) {
    const entry = this.byUsuario.get(idUsuario);
    if (entry === void 0) return null;
    if (Date.now() > entry.expiresAt) {
      this.evict(idUsuario, entry.ctx.idOrganizacao);
      return null;
    }
    return entry.ctx;
  }
  /**
   * Insere ou atualiza o contexto de um usuário.
   * Mantém o índice reverso `organizacaoToUsuarios` sincronizado para invalidação cruzada.
   */
  set(idUsuario, ctx) {
    const existing = this.byUsuario.get(idUsuario);
    if (existing !== void 0 && existing.ctx.idOrganizacao !== ctx.idOrganizacao) {
      this.removeFromReverseIndex(idUsuario, existing.ctx.idOrganizacao);
    }
    const expiresAt = Date.now() + this.ttlMs;
    this.byUsuario.set(idUsuario, { ctx, expiresAt });
    let usuarios = this.organizacaoToUsuarios.get(ctx.idOrganizacao);
    if (usuarios === void 0) {
      usuarios = /* @__PURE__ */ new Set();
      this.organizacaoToUsuarios.set(ctx.idOrganizacao, usuarios);
    }
    usuarios.add(idUsuario);
  }
  /**
   * Invalida TODAS as entradas de uma organização — disparado por evento `OrganizacaoAtualizada`.
   */
  invalidateByOrganizacao(idOrganizacao) {
    const usuarios = this.organizacaoToUsuarios.get(idOrganizacao);
    if (usuarios === void 0) return;
    for (const idUsuario of usuarios) {
      this.byUsuario.delete(idUsuario);
    }
    this.organizacaoToUsuarios.delete(idOrganizacao);
  }
  /**
   * Invalida a entrada de um usuário — disparado por evento `UsuarioRemocaoSolicitada`.
   */
  invalidateByUsuario(idUsuario) {
    const entry = this.byUsuario.get(idUsuario);
    if (entry === void 0) return;
    this.evict(idUsuario, entry.ctx.idOrganizacao);
  }
  /** Número de entradas no cache (inclui expiradas ainda não evictadas). */
  size() {
    return this.byUsuario.size;
  }
  /** Remove entrada e limpa índice reverso. */
  evict(idUsuario, idOrganizacao) {
    this.byUsuario.delete(idUsuario);
    this.removeFromReverseIndex(idUsuario, idOrganizacao);
  }
  removeFromReverseIndex(idUsuario, idOrganizacao) {
    const usuarios = this.organizacaoToUsuarios.get(idOrganizacao);
    if (usuarios === void 0) return;
    usuarios.delete(idUsuario);
    if (usuarios.size === 0) {
      this.organizacaoToUsuarios.delete(idOrganizacao);
    }
  }
};

// src/errors.ts
var AppError = class _AppError extends Error {
  statusCode;
  code;
  constructor(message, statusCode, code) {
    super(message);
    this.name = "AppError";
    this.statusCode = statusCode;
    this.code = code;
    if (typeof Error.captureStackTrace === "function") {
      Error.captureStackTrace(this, _AppError);
    }
    Object.setPrototypeOf(this, _AppError.prototype);
  }
};

// src/schema-name.ts
var CUID_REGEX = /^[a-z][a-z0-9]{22,24}$/;
var UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;
var SCHEMA_NAME_REGEX = /^tenant_([a-z][a-z0-9]{22,24}|[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})$/;
function isValidOrganizacaoId(id) {
  return CUID_REGEX.test(id) || UUID_REGEX.test(id);
}
function buildSchemaName(idOrganizacao) {
  if (typeof idOrganizacao !== "string" || idOrganizacao.length === 0) {
    throw new AppError("idOrganizacao vazio ou inv\xE1lido", 400, "INVALID_ORGANIZACAO_ID");
  }
  if (!isValidOrganizacaoId(idOrganizacao)) {
    throw new AppError("idOrganizacao n\xE3o \xE9 um CUID/UUID v\xE1lido", 400, "INVALID_ORGANIZACAO_ID");
  }
  const name = `tenant_${idOrganizacao}`;
  if (!SCHEMA_NAME_REGEX.test(name)) {
    throw new AppError(
      "nomeSchema resultante inv\xE1lido",
      400,
      "INVALID_ORGANIZACAO_ID"
    );
  }
  return name;
}
function isValidSchemaName(nomeSchema) {
  return typeof nomeSchema === "string" && SCHEMA_NAME_REGEX.test(nomeSchema);
}

// src/configurador-client.ts
var OrganizacaoByIdSchema = z.object({
  id: z.string(),
  status: z.enum(["active", "suspended", "deleted"]),
  idWorkspace: z.string().optional().nullable()
});
var OrganizacaoByUsuarioSchema = z.object({
  idOrganizacao: z.string(),
  status: z.enum(["active", "suspended", "deleted"]),
  idUsuario: z.string().min(1),
  tiposUsuario: z.array(z.string()),
  idWorkspace: z.string().optional().nullable()
});
var RETRY_DELAYS_MS = [0, 200, 500];
async function fetchWithRetry(url, headers, timeoutMs, retries, method = "GET", body) {
  for (let attempt = 0; attempt < retries; attempt++) {
    const delay = RETRY_DELAYS_MS[attempt] ?? 500;
    if (delay > 0) await sleep(delay);
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const res = await fetch(url, { method, headers, body, signal: controller.signal });
      clearTimeout(timer);
      return res;
    } catch (err) {
      clearTimeout(timer);
      if (attempt === retries - 1) {
        throw new AppError(
          `Configurador indispon\xEDvel ap\xF3s ${retries} tentativa(s): ${String(err)}`,
          503,
          "CONFIGURADOR_UNAVAILABLE"
        );
      }
    }
  }
  throw new AppError("Configurador indispon\xEDvel", 503, "CONFIGURADOR_UNAVAILABLE");
}
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
var AcessoProdutoResponseSchema = z.object({
  permitido: z.boolean(),
  motivo: z.string().optional()
});
var PermissaoGranularResponseSchema = z.object({
  permitido: z.boolean(),
  slug_produto: z.string(),
  secao: z.string(),
  acao: z.string()
});
var WorkspacesHabilitadosResponseSchema = z.object({
  tipo_usuario: z.enum(["SUPER_ADMIN", "ADMIN", "MASTER", "PADRAO", "FORNECEDOR"]),
  workspaces_habilitados: z.array(z.string())
});
var WorkspacesBatchResponseSchema = z.object({
  workspaces: z.array(z.object({
    id_workspace: z.string(),
    id_organizacao: z.string(),
    nome_workspace: z.string(),
    cnpj_workspace: z.string().nullable()
  }))
});
function createConfiguradorClient(opts) {
  const timeoutMs = opts.timeoutMs ?? 5e3;
  const retries = opts.retries ?? 3;
  function baseHeaders(idCorrelacao) {
    return {
      "x-chave-interna-servico": opts.chaveInterna,
      "x-id-correlacao": idCorrelacao,
      "Content-Type": "application/json"
    };
  }
  return {
    async resolveOrganizacaoById(idOrganizacao, idCorrelacao = randomUUID()) {
      const res = await fetchWithRetry(
        `${opts.baseUrl}/api/v1/internal/organizacoes/${encodeURIComponent(idOrganizacao)}`,
        baseHeaders(idCorrelacao),
        timeoutMs,
        retries
      );
      if (res.status === 404) {
        throw new AppError("Organiza\xE7\xE3o n\xE3o encontrada", 404, "ORGANIZACAO_NOT_FOUND");
      }
      if (!res.ok) {
        throw new AppError(
          `Configurador retornou HTTP ${res.status}`,
          503,
          "CONFIGURADOR_UNAVAILABLE"
        );
      }
      const raw = await res.json();
      const parsed = OrganizacaoByIdSchema.safeParse(raw);
      if (!parsed.success) {
        throw new AppError(
          "Resposta inv\xE1lida do Configurador (organiza\xE7\xE3o by ID)",
          503,
          "CONFIGURADOR_INVALID_RESPONSE"
        );
      }
      if (parsed.data.status !== "active") {
        throw new AppError("Organiza\xE7\xE3o inativa ou suspensa", 403, "ORGANIZACAO_INACTIVE");
      }
      return {
        idOrganizacao: parsed.data.id,
        nomeSchema: buildSchemaName(parsed.data.id),
        idWorkspace: parsed.data.idWorkspace ?? void 0,
        idUsuario: "system",
        // background job — sem usuário
        tiposUsuario: [],
        idCorrelacao
      };
    },
    async resolveOrganizacaoByIdUsuario(idUsuario, idCorrelacao = randomUUID()) {
      const res = await fetchWithRetry(
        `${opts.baseUrl}/api/v1/internal/usuarios/${encodeURIComponent(idUsuario)}`,
        baseHeaders(idCorrelacao),
        timeoutMs,
        retries
      );
      if (res.status === 404) {
        throw new AppError("Usu\xE1rio ou organiza\xE7\xE3o n\xE3o encontrada", 404, "ORGANIZACAO_NOT_FOUND");
      }
      if (!res.ok) {
        throw new AppError(
          `Configurador retornou HTTP ${res.status}`,
          503,
          "CONFIGURADOR_UNAVAILABLE"
        );
      }
      const raw = await res.json();
      const parsed = OrganizacaoByUsuarioSchema.safeParse(raw);
      if (!parsed.success) {
        throw new AppError(
          "Resposta inv\xE1lida do Configurador (organiza\xE7\xE3o by usu\xE1rio)",
          503,
          "CONFIGURADOR_INVALID_RESPONSE"
        );
      }
      if (parsed.data.status !== "active") {
        throw new AppError("Organiza\xE7\xE3o inativa ou suspensa", 403, "ORGANIZACAO_INACTIVE");
      }
      return {
        idOrganizacao: parsed.data.idOrganizacao,
        nomeSchema: buildSchemaName(parsed.data.idOrganizacao),
        idWorkspace: parsed.data.idWorkspace ?? void 0,
        idUsuario: parsed.data.idUsuario,
        tiposUsuario: parsed.data.tiposUsuario,
        idCorrelacao
      };
    },
    async verificarAcessoProduto({ idOrganizacao, idUsuario, idWorkspace, slugProduto, idCorrelacao = randomUUID() }) {
      const params = new URLSearchParams({
        id_organizacao: idOrganizacao,
        id_usuario: idUsuario,
        id_workspace: idWorkspace,
        slug_produto: slugProduto
      });
      const res = await fetchWithRetry(
        `${opts.baseUrl}/api/v1/internal/acesso-produto/verificar?${params.toString()}`,
        baseHeaders(idCorrelacao),
        timeoutMs,
        retries
      );
      if (!res.ok) {
        throw new AppError(
          `Configurador retornou HTTP ${res.status} ao verificar acesso ao produto`,
          503,
          "CONFIGURADOR_UNAVAILABLE"
        );
      }
      const raw = await res.json();
      const parsed = AcessoProdutoResponseSchema.safeParse(raw);
      if (!parsed.success) {
        throw new AppError(
          "Resposta inv\xE1lida do Configurador (acesso-produto)",
          503,
          "CONFIGURADOR_INVALID_RESPONSE"
        );
      }
      return parsed.data;
    },
    async verificarPermissaoGranular({ idOrganizacao, idUsuario, idWorkspace, slugProduto, secao, acao, idCorrelacao = randomUUID() }) {
      const res = await fetchWithRetry(
        `${opts.baseUrl}/api/v1/internal/permissoes/verificar`,
        {
          ...baseHeaders(idCorrelacao)
        },
        timeoutMs,
        retries,
        "POST",
        JSON.stringify({
          id_organizacao: idOrganizacao,
          id_usuario: idUsuario,
          id_workspace: idWorkspace,
          slug_produto: slugProduto,
          secao,
          acao
        })
      );
      if (res.status === 403) {
        throw new AppError(
          "id_usuario n\xE3o pertence a id_organizacao (cross-org bloqueado)",
          403,
          "CROSS_TENANT_FORBIDDEN"
        );
      }
      if (!res.ok) {
        throw new AppError(
          `Configurador retornou HTTP ${res.status} ao verificar permiss\xE3o granular`,
          503,
          "CONFIGURADOR_UNAVAILABLE"
        );
      }
      const raw = await res.json();
      const parsed = PermissaoGranularResponseSchema.safeParse(raw);
      if (!parsed.success) {
        throw new AppError(
          "Resposta inv\xE1lida do Configurador (permiss\xE3o granular)",
          503,
          "CONFIGURADOR_INVALID_RESPONSE"
        );
      }
      return { permitido: parsed.data.permitido };
    },
    async obterWorkspacesHabilitadosDoUsuario({ idOrganizacao, idUsuario, idCorrelacao = randomUUID() }) {
      const params = new URLSearchParams({ id_organizacao: idOrganizacao });
      const res = await fetchWithRetry(
        `${opts.baseUrl}/api/v1/internal/usuarios/${encodeURIComponent(idUsuario)}/workspaces-habilitados?${params.toString()}`,
        baseHeaders(idCorrelacao),
        timeoutMs,
        retries
      );
      if (res.status === 404) {
        throw new AppError("Usu\xE1rio n\xE3o encontrado", 404, "USUARIO_NOT_FOUND");
      }
      if (res.status === 403) {
        throw new AppError(
          "Usu\xE1rio n\xE3o pertence \xE0 organiza\xE7\xE3o informada",
          403,
          "ORGANIZACAO_MISMATCH"
        );
      }
      if (!res.ok) {
        throw new AppError(
          `Configurador retornou HTTP ${res.status} ao obter workspaces habilitados`,
          503,
          "CONFIGURADOR_UNAVAILABLE"
        );
      }
      const raw = await res.json();
      const parsed = WorkspacesHabilitadosResponseSchema.safeParse(raw);
      if (!parsed.success) {
        throw new AppError(
          "Resposta inv\xE1lida do Configurador (workspaces-habilitados)",
          503,
          "CONFIGURADOR_INVALID_RESPONSE"
        );
      }
      return {
        tipoUsuario: parsed.data.tipo_usuario,
        workspacesHabilitados: parsed.data.workspaces_habilitados
      };
    },
    async obterWorkspaces({ ids, idCorrelacao = randomUUID() }) {
      if (ids.length === 0) return [];
      const params = new URLSearchParams({ ids: ids.join(",") });
      const res = await fetchWithRetry(
        `${opts.baseUrl}/api/v1/internal/workspaces?${params.toString()}`,
        baseHeaders(idCorrelacao),
        timeoutMs,
        retries
      );
      if (!res.ok) {
        throw new AppError(
          `Configurador retornou HTTP ${res.status} ao obter workspaces`,
          503,
          "CONFIGURADOR_UNAVAILABLE"
        );
      }
      const raw = await res.json();
      const parsed = WorkspacesBatchResponseSchema.safeParse(raw);
      if (!parsed.success) {
        throw new AppError(
          "Resposta inv\xE1lida do Configurador (workspaces batch)",
          503,
          "CONFIGURADOR_INVALID_RESPONSE"
        );
      }
      return parsed.data.workspaces.map((w) => ({
        idWorkspace: w.id_workspace,
        idOrganizacao: w.id_organizacao,
        nomeWorkspace: w.nome_workspace,
        cnpjWorkspace: w.cnpj_workspace
      }));
    }
  };
}
function resolveEnvConfig() {
  const baseUrl = process.env.CONFIGURATOR_URL;
  const chaveInterna = process.env.CHAVE_INTERNA_SERVICO;
  if (!baseUrl) {
    throw new AppError(
      "[@gravity/resolver-organizacao] CONFIGURATOR_URL n\xE3o definido",
      500,
      "SDK_MISCONFIGURED"
    );
  }
  if (!chaveInterna) {
    throw new AppError(
      "[@gravity/resolver-organizacao] CHAVE_INTERNA_SERVICO n\xE3o definido",
      500,
      "SDK_MISCONFIGURED"
    );
  }
  return { baseUrl, chaveInterna };
}
var _defaultClient = null;
function getDefaultClient() {
  if (_defaultClient === null) {
    _defaultClient = createConfiguradorClient(resolveEnvConfig());
  }
  return _defaultClient;
}
async function resolveOrganizacaoById(idOrganizacao, idCorrelacao) {
  return getDefaultClient().resolveOrganizacaoById(idOrganizacao, idCorrelacao);
}

// src/observability.ts
var _logger = null;
function getLogger() {
  if (_logger !== null) return _logger;
  const isTest = process.env.NODE_ENV === "test" || process.env.VITEST === "true";
  _logger = {
    error(obj, msg) {
      process.stderr.write(
        JSON.stringify({ level: "error", service: "@gravity/resolver-organizacao", msg, ...obj }) + "\n"
      );
    },
    warn(obj, msg) {
      if (!isTest) {
        process.stderr.write(
          JSON.stringify({ level: "warn", service: "@gravity/resolver-organizacao", msg, ...obj }) + "\n"
        );
      }
    },
    info(obj, msg) {
      if (!isTest) {
        process.stderr.write(
          JSON.stringify({ level: "info", service: "@gravity/resolver-organizacao", msg, ...obj }) + "\n"
        );
      }
    }
  };
  return _logger;
}
function recordSpan(_name, _attributes, _durationMs) {
}

// src/middleware.ts
var ConfigResolverOrganizacaoSchema = z.object({
  chaveProduto: z.string().min(1),
  configuradorBaseUrl: z.string().url(),
  chaveInterna: z.string().min(16),
  cacheTtlMs: z.number().int().positive().optional(),
  configuradorTimeoutMs: z.number().int().positive().optional(),
  configuradorRetries: z.number().int().min(1).max(5).optional(),
  clerkSecretKey: z.string().optional(),
  redisUrl: z.string().optional()
});
function resolverOrganizacao(config) {
  const parsed = ConfigResolverOrganizacaoSchema.safeParse(config);
  if (!parsed.success) {
    throw new Error(
      `[@gravity/resolver-organizacao] Configura\xE7\xE3o inv\xE1lida:
${parsed.error.toString()}`
    );
  }
  const clerkSecretKey = config.clerkSecretKey ?? process.env.CLERK_SECRET_KEY ?? "";
  if (!clerkSecretKey) {
    throw new Error(
      "[@gravity/resolver-organizacao] clerkSecretKey ausente \u2014 defina CLERK_SECRET_KEY ou passe em config."
    );
  }
  const urlBancoBoot = process.env.DATABASE_URL;
  const cache = new CacheOrganizacao({ ttlMs: config.cacheTtlMs });
  const configuradorClient = createConfiguradorClient({
    baseUrl: config.configuradorBaseUrl,
    chaveInterna: config.chaveInterna,
    timeoutMs: config.configuradorTimeoutMs,
    retries: config.configuradorRetries
  });
  const log = getLogger();
  return async (req, _res, next) => {
    const startedAt = Date.now();
    const idCorrelacao = randomUUID();
    try {
      const authHeader = req.headers["authorization"];
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        throw new AppError(
          "Header Authorization ausente ou malformado",
          401,
          "UNAUTHENTICATED"
        );
      }
      const token = authHeader.slice(7);
      let idUsuario;
      try {
        const payload = await verifyToken(token, { secretKey: clerkSecretKey });
        idUsuario = payload.sub;
      } catch {
        throw new AppError("Token JWT inv\xE1lido ou expirado", 401, "UNAUTHENTICATED");
      }
      if (!idUsuario) {
        throw new AppError("Token JWT sem sub (idUsuario)", 401, "UNAUTHENTICATED");
      }
      let ctx = cache.get(idUsuario);
      if (ctx === null) {
        ctx = await configuradorClient.resolveOrganizacaoByIdUsuario(idUsuario, idCorrelacao);
        cache.set(idUsuario, ctx);
      }
      ctx = { ...ctx, idCorrelacao, urlBanco: urlBancoBoot };
      if (!isValidSchemaName(ctx.nomeSchema)) {
        log.error(
          { idUsuario, idOrganizacao: ctx.idOrganizacao, nomeSchema: ctx.nomeSchema, idCorrelacao },
          "nomeSchema inv\xE1lido ap\xF3s resolu\xE7\xE3o \u2014 poss\xEDvel corrup\xE7\xE3o"
        );
        throw new AppError(
          "nomeSchema inv\xE1lido p\xF3s-resolu\xE7\xE3o",
          500,
          "INVALID_ORGANIZACAO_ID"
        );
      }
      req.organizacao = ctx;
      recordSpan(
        "resolver_organizacao.resolve",
        {
          idOrganizacao: ctx.idOrganizacao,
          idUsuario,
          nomeSchema: ctx.nomeSchema,
          idCorrelacao
        },
        Date.now() - startedAt
      );
      next();
    } catch (err) {
      next(err);
    }
  };
}

// src/verificar-acesso-produto.ts
function verificarAcessoProduto(config) {
  const client = createConfiguradorClient({
    baseUrl: config.configuradorBaseUrl,
    chaveInterna: config.chaveInterna,
    timeoutMs: config.configuradorTimeoutMs,
    retries: config.configuradorRetries
  });
  const log = getLogger();
  return async (req, _res, next) => {
    try {
      const ctx = req.organizacao;
      if (!ctx) {
        throw new AppError(
          "verificarAcessoProduto exige resolverOrganizacao antes (req.organizacao ausente)",
          500,
          "SDK_MISCONFIGURED"
        );
      }
      const idWorkspace = req.headers["x-id-workspace"];
      if (!idWorkspace) {
        throw new AppError(
          "Header x-id-workspace ausente \u2014 Port\xE3o 3 exige workspace espec\xEDfico",
          400,
          "WORKSPACE_NAO_INFORMADO"
        );
      }
      const { permitido, motivo } = await client.verificarAcessoProduto({
        idOrganizacao: ctx.idOrganizacao,
        idUsuario: ctx.idUsuario,
        idWorkspace,
        slugProduto: config.chaveProduto,
        idCorrelacao: ctx.idCorrelacao
      });
      if (!permitido) {
        log.warn(
          {
            idOrganizacao: ctx.idOrganizacao,
            idUsuario: ctx.idUsuario,
            idWorkspace,
            slugProduto: config.chaveProduto,
            motivo
          },
          "Port\xE3o 3 negou acesso ao produto"
        );
        throw new AppError(
          `Acesso ao produto "${config.chaveProduto}" n\xE3o autorizado neste workspace`,
          403,
          "ACESSO_PRODUTO_NEGADO"
        );
      }
      next();
    } catch (err) {
      next(err);
    }
  };
}

// src/require-permissao.ts
function criarRequirePermissao(config) {
  const client = createConfiguradorClient({
    baseUrl: config.configuradorBaseUrl,
    chaveInterna: config.chaveInterna,
    timeoutMs: config.configuradorTimeoutMs,
    retries: config.configuradorRetries
  });
  const log = getLogger();
  const cacheTtl = config.cacheTtlMs ?? 3e4;
  const cache = /* @__PURE__ */ new Map();
  const flagEnvName = config.flagAtivaEnvName;
  function chaveCache(idOrg, idUser, idWs, secao, acao) {
    return `${idOrg}|${idUser}|${idWs}|${config.chaveProduto}:${secao}:${acao}`;
  }
  function flagAtiva() {
    if (!flagEnvName) return true;
    return process.env[flagEnvName] !== "false";
  }
  return function exigirPermissao(secao, acao) {
    return async (req, _res, next) => {
      try {
        const ctx = req.organizacao;
        if (!ctx) {
          throw new AppError(
            "criarRequirePermissao exige resolverOrganizacao antes (req.organizacao ausente)",
            500,
            "SDK_MISCONFIGURED"
          );
        }
        const idWorkspace = req.headers["x-id-workspace"];
        if (!idWorkspace) {
          throw new AppError(
            "Header x-id-workspace ausente \u2014 gating granular exige workspace espec\xEDfico",
            400,
            "WORKSPACE_NAO_INFORMADO"
          );
        }
        const key = chaveCache(ctx.idOrganizacao, ctx.idUsuario, idWorkspace, secao, acao);
        const now = Date.now();
        const hit = cache.get(key);
        let permitido;
        if (hit && hit.expiraEm > now) {
          permitido = hit.permitido;
        } else {
          const r = await client.verificarPermissaoGranular({
            idOrganizacao: ctx.idOrganizacao,
            idUsuario: ctx.idUsuario,
            idWorkspace,
            slugProduto: config.chaveProduto,
            secao,
            acao,
            idCorrelacao: ctx.idCorrelacao
          });
          permitido = r.permitido;
          cache.set(key, { permitido, expiraEm: now + cacheTtl });
        }
        if (permitido) {
          next();
          return;
        }
        if (!flagAtiva()) {
          log.warn(
            {
              idOrganizacao: ctx.idOrganizacao,
              idUsuario: ctx.idUsuario,
              idWorkspace,
              slugProduto: config.chaveProduto,
              secao,
              acao,
              rota: req.originalUrl ?? req.url,
              metodo: req.method
            },
            "[shadow-deny] Permiss\xE3o granular rotaria 403, mas flag est\xE1 OFF \u2014 request liberada"
          );
          try {
            config.onShadowDeny?.({
              idOrganizacao: ctx.idOrganizacao,
              idUsuario: ctx.idUsuario,
              idWorkspace,
              slugProduto: config.chaveProduto,
              secao,
              acao,
              rota: req.originalUrl ?? req.url,
              metodo: req.method
            });
          } catch {
          }
          next();
          return;
        }
        log.warn(
          {
            idOrganizacao: ctx.idOrganizacao,
            idUsuario: ctx.idUsuario,
            idWorkspace,
            slugProduto: config.chaveProduto,
            secao,
            acao
          },
          "Cadeia 2 granular negou acesso"
        );
        throw new AppError(
          `Permiss\xE3o "${config.chaveProduto}:${secao}:${acao}" negada neste workspace`,
          403,
          "FORBIDDEN_PERMISSION"
        );
      } catch (err) {
        next(err);
      }
    };
  };
}
var _instances = /* @__PURE__ */ new Map();
function resolveDatabaseUrl(explicitUrl) {
  const url = explicitUrl ?? process.env.DATABASE_URL;
  if (!url || url.length === 0) {
    throw new Error(
      "[@gravity/resolver-organizacao] URL do banco n\xE3o definida \u2014 PrismaClient n\xE3o pode ser instanciado. Esperado `urlBanco` no contexto ou `DATABASE_URL` no ambiente. Veja ADR-001."
    );
  }
  return url;
}
function getInternalPrisma(databaseUrl) {
  const url = resolveDatabaseUrl(databaseUrl);
  let instance = _instances.get(url);
  if (instance === void 0) {
    instance = new PrismaClient({
      datasources: {
        db: { url }
      }
    });
    _instances.set(url, instance);
  }
  return instance;
}

// src/with-tenant.ts
var HTTP_TX_TIMEOUT_MS = 1e4;
var WORKER_TX_TIMEOUT_MS = 3e4;
async function withOrganizacao(req, fn, opts) {
  const ctx = req.organizacao;
  if (!ctx) {
    throw new AppError(
      "Organiza\xE7\xE3o n\xE3o resolvida \u2014 middleware resolverOrganizacao n\xE3o rodou ou n\xE3o populou req.organizacao",
      500,
      "ORGANIZACAO_MISSING"
    );
  }
  return runInOrganizacaoTransaction(ctx, fn, opts?.timeoutMs ?? HTTP_TX_TIMEOUT_MS);
}
async function withOrganizacaoContext(idOrganizacao, fn) {
  const ctx = await resolveOrganizacaoById(idOrganizacao);
  const expected = buildSchemaName(ctx.idOrganizacao);
  if (ctx.nomeSchema !== expected) {
    throw new AppError(
      "nomeSchema retornado pelo Configurador n\xE3o bate com o idOrganizacao",
      500,
      "ORGANIZACAO_SCHEMA_MISMATCH"
    );
  }
  return runInOrganizacaoTransaction(
    ctx,
    (db) => fn(ctx, db),
    WORKER_TX_TIMEOUT_MS
  );
}
async function runInOrganizacaoTransaction(ctx, fn, timeoutMs) {
  if (!isValidSchemaName(ctx.nomeSchema)) {
    throw new AppError(
      `nomeSchema inv\xE1lido: "${ctx.nomeSchema}"`,
      400,
      "INVALID_ORGANIZACAO_ID"
    );
  }
  const log = getLogger();
  const prisma = getInternalPrisma(ctx.urlBanco);
  const startedAt = Date.now();
  try {
    return await prisma.$transaction(
      async (tx) => {
        const setLocalStart = Date.now();
        await tx.$executeRawUnsafe(
          `SET LOCAL search_path TO "${ctx.nomeSchema}", public`
        );
        recordSpan("resolver_organizacao.set_local", {
          idOrganizacao: ctx.idOrganizacao,
          nomeSchema: ctx.nomeSchema,
          idCorrelacao: ctx.idCorrelacao
        }, Date.now() - setLocalStart);
        return await fn(tx);
      },
      {
        timeout: timeoutMs,
        isolationLevel: "ReadCommitted"
      }
    );
  } catch (err) {
    log.error(
      {
        err,
        idOrganizacao: ctx.idOrganizacao,
        nomeSchema: ctx.nomeSchema,
        idCorrelacao: ctx.idCorrelacao,
        durationMs: Date.now() - startedAt
      },
      "withOrganizacao transaction failed"
    );
    throw err;
  } finally {
    recordSpan(
      "resolver_organizacao.with_organizacao",
      {
        idOrganizacao: ctx.idOrganizacao,
        nomeSchema: ctx.nomeSchema,
        idCorrelacao: ctx.idCorrelacao
      });
  }
}

// src/obter-workspaces-habilitados.ts
async function obterWorkspacesHabilitadosDoUsuario(input) {
  const client = createConfiguradorClient({
    baseUrl: input.configuradorBaseUrl,
    chaveInterna: input.chaveInterna,
    timeoutMs: input.timeoutMs,
    retries: input.retries
  });
  return client.obterWorkspacesHabilitadosDoUsuario({
    idOrganizacao: input.idOrganizacao,
    idUsuario: input.idUsuario,
    idCorrelacao: input.idCorrelacao
  });
}

// src/obter-workspaces.ts
async function obterWorkspaces(input) {
  const ids = input.ids.filter((id) => id && id.length > 0);
  if (ids.length === 0) return [];
  const client = createConfiguradorClient({
    baseUrl: input.configuradorBaseUrl,
    chaveInterna: input.chaveInterna,
    timeoutMs: input.timeoutMs,
    retries: input.retries
  });
  return client.obterWorkspaces({
    ids,
    idCorrelacao: input.idCorrelacao
  });
}

export { AppError, criarRequirePermissao, obterWorkspaces, obterWorkspacesHabilitadosDoUsuario, resolveOrganizacaoById, resolverOrganizacao, verificarAcessoProduto, withOrganizacao, withOrganizacaoContext };
//# sourceMappingURL=index.js.map
//# sourceMappingURL=index.js.map