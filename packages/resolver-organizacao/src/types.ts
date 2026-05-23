/**
 * Tipos públicos do @gravity/resolver-organizacao.
 *
 * Espelha exatamente a SPEC §2 e o §2 do ADR-002.
 * Qualquer mudança aqui é breaking change e exige bump major + ADR novo.
 */

import type { Prisma, PrismaClient } from '@prisma/client';

/**
 * Cliente Prisma que um produto pode injetar no SDK.
 *
 * Tipado como `PrismaClient` para conveniência, mas o SDK só usa `$transaction`
 * — qualquer client Prisma (de qualquer schema de produto) é estruturalmente
 * compatível. Existe porque, no monorepo, há UM único `@prisma/client` gerado
 * na raiz e o último `prisma generate` "ganha": o SDK, por morar em
 * `packages/`, sempre resolve esse client da raiz, que pode não ter os models
 * do produto. Injetar o client gerado do próprio produto elimina essa loteria.
 * Vide ADR-0003 e `internal-prisma.ts`.
 */
export type ClientePrismaInjetavel = PrismaClient;

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
  /**
   * Quando o admin (SUPER_ADMIN/ADMIN) ativou override de organização via
   * header `x-organizacao-override`, este campo guarda o id da organização
   * ORIGINAL do usuário (sua org nativa, geralmente a Gravity Interna).
   *
   * Permite que logs/audit distingam "quem você é" (ator real, da
   * `idOrganizacaoOriginal`) de "onde você está olhando" (alvo do override,
   * em `idOrganizacao`).
   *
   * - Ausente quando NÃO há override (request normal — Master/Padrao/etc.).
   * - Presente apenas quando middleware aceitou um header
   *   `x-organizacao-override` válido (admin autorizado + org alvo ATIVA).
   */
  idOrganizacaoOriginal?: string;
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
  /**
   * Cliente Prisma injetado pelo produto (ADR-0003). Capturado no boot pelo
   * middleware `resolverOrganizacao` a partir de `config.prismaClient`.
   *
   * Quando presente, o SDK usa ESTE client em vez de instanciar um a partir do
   * `@prisma/client` da raiz — que, no monorepo, pode ter os models de outro
   * produto. Quando ausente, cai no fallback `getInternalPrisma(urlBanco)`.
   */
  prismaInterno?: ClientePrismaInjetavel;
}

/**
 * Configuração do middleware. Cada produto cria 1 instância no boot.
 */
export interface ConfigResolverOrganizacao {
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
  /**
   * Cliente Prisma do PRÓPRIO produto (ADR-0003). O produto importa o client
   * gerado do seu schema e o instancia já amarrado ao seu banco
   * (`new PrismaClient({ datasources: { db: { url } } })`), passando aqui.
   *
   * Recomendado em deploy monolito-sidecar e sempre que o `@prisma/client` da
   * raiz puder não conter os models do produto. Ausente → o SDK cai no
   * fallback `getInternalPrisma` (client da raiz + `urlBanco`).
   */
  prismaClient?: ClientePrismaInjetavel;
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
