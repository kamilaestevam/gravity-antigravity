/**
 * Singleton do PrismaClient do produto Pedido (ADR-0003).
 *
 * O schema do Pedido gera o client em
 * `servicos-global/produto/pedido/node_modules/.prisma/client`.
 * Importar `@prisma/client` a partir deste pacote garante models `pedido`,
 * `pedidoItem`, etc. — distinto do `@prisma/client` hoisted na raiz do monorepo
 * (que pode conter models de outro produto, ex.: bid-frete).
 *
 * Lazy init: só instancia após dotenv no `index.ts`.
 */

/**
 * Client gerado pelo schema do Pedido — NÃO usar `@prisma/client` hoisted na raiz
 * do monorepo (contém models de outro produto, ex.: bid-frete).
 * Output configurado em `prisma/schema.base.prisma` → `node_modules/.prisma/client`.
 */
import { PrismaClient } from '../../node_modules/.prisma/client/index.js'

let instancia: PrismaClient | undefined

export function obterClientePrismaPedido(): PrismaClient {
  if (instancia) return instancia

  const url = process.env.DATABASE_URL
  if (!url) {
    throw new Error(
      '[Pedido] DATABASE_URL ausente — impossível instanciar PrismaClient. ' +
        'Verifique servicos-global/produto/pedido/.env',
    )
  }

  instancia = new PrismaClient({
    datasources: { db: { url } },
  })

  return instancia
}

/** Valida que o client gerado contém os models do Pedido antes de aceitar requests. */
export function validarClientePrismaPedido(client: PrismaClient): void {
  if (!('pedido' in client) || typeof (client as Record<string, unknown>).pedido !== 'object') {
    throw new Error(
      '[Pedido] PrismaClient não contém model `pedido`. ' +
        'Execute: npm run prisma:generate (em servicos-global/produto/pedido)',
    )
  }
}
