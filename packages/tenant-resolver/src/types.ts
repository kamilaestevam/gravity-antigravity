/**
 * Tipos públicos do @gravity/tenant-resolver.
 *
 * Espelha exatamente a SPEC §2 e o §2 do ADR-002.
 * Qualquer mudança aqui é breaking change e exige bump major + ADR novo.
 */

import type { Prisma } from '@prisma/client';

/**
 * Identificador canônico de cada produto/serviço-tenant que consome o SDK.
 * Usado para roteamento, métricas e logs.
 */
export type ProductKey =
  | 'pedido'
  | 'processo'
  | 'simula-custo'
  | 'bid-frete'
  | 'bid-cambio'
  | 'nf-importacao'
  | 'financeiro-comex'
  | 'conector-erp'
  | 'tenant-services';

/**
 * Contexto de tenant resolvido para a request corrente.
 *
 * Anexado ao `req.tenant` pelo middleware `tenantResolver`.
 * NÃO contém dados sensíveis além do necessário para roteamento.
 */
export interface TenantContext {
  /** UUID do tenant (mesmo do Configurador). */
  tenantId: string;
  /** Nome do schema PostgreSQL: `tenant_<uuid_sem_hifens>`. Validado contra regex. */
  schemaName: string;
  /** Workspace ativo do usuário, opcional. */
  workspaceId?: string;
  /** UUID do usuário Clerk. */
  userId: string;
  /** Lista de roles (ex.: `['SUPER_ADMIN', 'PEDIDO_WRITE']`). */
  roles: string[];
  /** ULID gerado por request — propagado em logs/spans. */
  correlationId: string;
}

/**
 * Configuração do middleware. Cada produto cria 1 instância no boot.
 */
export interface ResolverConfig {
  /** Identificador do produto consumidor. */
  productKey: ProductKey;
  /** Base URL do Configurador (ex.: `https://configurador.gravity.app`). */
  configuradorBaseUrl: string;
  /** Chave compartilhada `x-internal-key` para chamadas inter-serviço. */
  internalKey: string;
  /** TTL do cache de tenant em ms. Default: 60_000. */
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
 * Handle retornado pelo `tenantResolver(config)`.
 * Único objeto exposto após o bootstrap. Não exporta o cache nem o cliente
 * Prisma interno.
 */
export interface TenantResolverHandle {
  /** Middleware Express que valida JWT, popula `req.tenant` e chama `next()`. */
  middleware(): import('express').RequestHandler;
  /**
   * Encerra recursos (event-bus listener, conexões Redis). Idempotente.
   * Chamar no shutdown do servidor para evitar handles pendentes.
   */
  close(): Promise<void>;
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
export type TenantDatabase = Omit<
  Prisma.TransactionClient,
  '$transaction' | '$connect' | '$disconnect' | '$on' | '$use' | '$extends'
>;

/**
 * Alias mantido para compatibilidade com o nome antigo do contrato.
 * Idêntico a `TenantDatabase`. Prefira `TenantDatabase` em código novo.
 */
export type PrismaTransactionClient = TenantDatabase;

/**
 * Augmentation do Express `Request` para incluir `req.tenant`.
 *
 * Importar este módulo (transitivamente, via `@gravity/tenant-resolver`)
 * já habilita o tipo em qualquer produto que use Express.
 */
declare module 'express-serve-static-core' {
  interface Request {
    tenant?: TenantContext;
  }
}
