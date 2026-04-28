/**
 * Tipos públicos do @gravity/resolver-organizacao.
 *
 * Espelha exatamente a SPEC §2 e o §2 do ADR-002.
 * Qualquer mudança aqui é breaking change e exige bump major + ADR novo.
 */

import type { Prisma } from '@prisma/client';

/**
 * Identificador canônico de cada produto/serviço de organização que consome o SDK.
 * Usado para roteamento, métricas e logs.
 */
export type ChaveProduto =
  | 'pedido'
  | 'processo'
  | 'simula-custo'
  | 'bid-frete'
  | 'bid-cambio'
  | 'nf-importacao'
  | 'financeiro-comex'
  | 'conector-erp'
  | 'organizacao-services';

/**
 * Contexto de organização resolvido para a request corrente.
 *
 * Anexado ao `req.organizacao` pelo middleware `resolverOrganizacao`.
 * NÃO contém dados sensíveis além do necessário para roteamento.
 */
export interface ContextoOrganizacao {
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
}

/**
 * Configuração do middleware. Cada produto cria 1 instância no boot.
 */
export interface ConfigResolverOrganizacao {
  /** Identificador do produto consumidor. */
  chaveProduto: ChaveProduto;
  /** Base URL do Configurador (ex.: `https://configurador.gravity.app`). */
  configuradorBaseUrl: string;
  /** Chave compartilhada `x-chave-interna` para chamadas inter-serviço. */
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
 * Handle retornado pelo `resolverOrganizacao(config)`.
 * Único objeto exposto após o bootstrap. Não exporta o cache nem o cliente
 * Prisma interno.
 */
export interface HandleResolverOrganizacao {
  /** Middleware Express que valida JWT, popula `req.organizacao` e chama `next()`. */
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
export type BancoOrganizacao = Omit<
  Prisma.TransactionClient,
  '$transaction' | '$connect' | '$disconnect' | '$on' | '$use' | '$extends'
>;

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
