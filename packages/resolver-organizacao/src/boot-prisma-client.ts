/**
 * Cliente Prisma registrado no boot do produto (ADR-0003).
 *
 * Quando `withOrganizacaoContext` roda fora de request HTTP (webhooks, CRON,
 * workers), o contexto vindo do Configurador não carrega `prismaInterno`.
 * O client registrado aqui — via `resolverOrganizacao({ prismaClient })` —
 * garante que workers do mesmo processo usem o schema correto do produto.
 *
 * NÃO exportar de `index.ts` — estritamente interno ao SDK.
 */

import type { ClientePrismaInjetavel } from './types.js';

let clientePrismaBoot: ClientePrismaInjetavel | undefined;

export function registrarClientePrismaBoot(client: ClientePrismaInjetavel): void {
  clientePrismaBoot = client;
}

export function obterClientePrismaBoot(): ClientePrismaInjetavel | undefined {
  return clientePrismaBoot;
}

/** Uso exclusivo em testes — não exportar em `index.ts`. */
export function _resetClientePrismaBootForTests(): void {
  clientePrismaBoot = undefined;
}
