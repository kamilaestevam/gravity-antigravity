# ADR-0003 — SDK `@gravity/resolver-organizacao` aceita `prismaInstance` injetado

**Status:** 🟡 Proposto — aguardando co-assinatura do Líder Técnico
**Data:** 2026-05-07
**Autores:** Coordenador (proposta) · Líder Técnico (revisão)
**Substitui:** decisão tácita Sprint 1 documentada em `packages/resolver-organizacao/src/internal-prisma.ts:13-15`

---

## Contexto

### Decisão original (Sprint 1)

O SDK `@gravity/resolver-organizacao` foi desenhado em Sprint 1 com a seguinte regra explícita, registrada como JSDoc no próprio código:

> *"Decisão Sprint 1 (Líder): consome `process.env.DATABASE_URL` direto. Cada serviço host define sua própria env apontando pro próprio banco. Sem `prismaInstance` opcional. Sem override por config."*
> — `packages/resolver-organizacao/src/internal-prisma.ts:13-15`

A implementação:

```ts
// packages/resolver-organizacao/src/internal-prisma.ts
import { PrismaClient } from '@prisma/client'

let _instance: PrismaClient | null = null

export function getInternalPrisma(): PrismaClient {
  if (_instance === null) {
    _instance = new PrismaClient({
      datasources: { db: { url: resolveDatabaseUrl() } },
    })
  }
  return _instance
}
```

### Premissa que sustentava a decisão

Schema Prisma único compartilhado entre serviços. O SDK só precisa conhecer a `DATABASE_URL`; o cliente Prisma genérico atende todos.

### Realidade descoberta no monorepo

Cada produto tem **schema Prisma próprio** com seus próprios models:

| Produto | `prisma/fragment.prisma` | Models específicos |
|---|---|---|
| Pedido | `produto/pedido/prisma/` | `Pedido`, `PedidoItem`, `PedidoSaldoFormula`, `PedidoCasasDecimais`, etc. |
| Financeiro Comex | `produto/financeiro-comex/prisma/` | `Lancamento`, `Conciliacao`, etc. |
| LPCO | `produto/lpco/prisma/` | `Licenca`, etc. |
| (e mais 4 produtos) | | |

**Problema raiz:** o `import { PrismaClient } from '@prisma/client'` resolve via Node module resolution para `node_modules/.prisma/client/` na **raiz do monorepo**. Esse client é gerado pelo último `prisma generate` que rodou — geralmente o Financeiro Comex no setup atual.

Quando o servidor do Pedido importa o SDK (que importa internamente o `@prisma/client`), o tipo do PrismaClient vem do schema do **Financeiro Comex**, que **não tem** os models do Pedido. Resultado em runtime:

```
TypeError: Cannot read properties of undefined (reading 'findUnique')
  at saldo-formula-pedido.ts:40:52
```

`db.pedidoSaldoFormula` é `undefined` porque o tipo gerado não conhece esse model.

### Sintoma observado em prod

8 endpoints `/api/v1/pedidos/*` retornando HTTP 500 desde que o Financeiro Comex foi adicionado ao monorepo:

- `/api/v1/pedidos/configuracoes/saldo-formula`
- `/api/v1/pedidos/configuracoes/casas-decimais`
- `/api/v1/pedidos/colunas-usuario`
- `/api/v1/pedidos/preferencia-usuario-coluna-pedido`
- `/api/v1/pedidos/config/status`
- `/api/v1/pedidos?ordenar=desc&limit=100` (Lista)
- `/api/v1/pedidos/dashboard-painel`
- (outros que tocam Prisma de modo similar)

### Por que a premissa Sprint 1 está obsoleta

A premissa "schema único" não condiz com a arquitetura Gravity (schema-per-produto). O SDK precisa de um mecanismo para o host injetar SEU PrismaClient (gerado contra SEU schema), não instanciar o genérico da raiz.

---

## Decisão

**O SDK `@gravity/resolver-organizacao` passa a aceitar `prismaInstance: PrismaClient` na config de inicialização. Cada produto host instancia seu próprio `PrismaClient` (gerado contra seu schema) e injeta no SDK.**

### Mudanças concretas

**1. `packages/resolver-organizacao/src/types.ts`** — `ConfigResolverOrganizacao` ganha campo:

```ts
import type { PrismaClient } from '@prisma/client'

export interface ConfigResolverOrganizacao {
  chaveProduto: ChaveProduto
  configuradorBaseUrl: string
  chaveInterna: string
  /**
   * PrismaClient específico do produto host. Cada produto importa do seu próprio
   * generated path (ex: produto/pedido/node_modules/.prisma/client) e passa aqui.
   * Substitui a auto-instanciação interna obsoleta.
   */
  prismaInstance: PrismaClient   // ← novo, obrigatório
}
```

**2. `packages/resolver-organizacao/src/internal-prisma.ts`** — deletado integralmente. Substituído por:

```ts
// packages/resolver-organizacao/src/with-organizacao.ts (atualizado)
export async function withOrganizacao<T>(
  req: Request,
  callback: (db: PrismaClient) => Promise<T>,
  config: ConfigResolverOrganizacao,
): Promise<T> {
  const tenantId = extrairOrganizacao(req)
  return config.prismaInstance.$transaction(async (tx) => {
    await tx.$executeRawUnsafe(`SET LOCAL search_path = "${escape(tenantId)}"`)
    return callback(tx as unknown as PrismaClient)
  })
}
```

**3. Cada um dos 7 produtos hosts** — `server/src/index.ts` instancia próprio cliente e passa pro SDK:

```ts
// produto/pedido/server/src/index.ts (exemplo)
import { PrismaClient } from '@prisma/client'   // resolve pro client do Pedido (gerado em pedido/node_modules/.prisma/client)
import { resolverOrganizacao } from '@gravity/resolver-organizacao'

const prismaPedido = new PrismaClient()

app.use(resolverOrganizacao({
  chaveProduto:        'pedido',
  configuradorBaseUrl: process.env.CONFIGURADOR_URL!,
  chaveInterna:        process.env.CHAVE_INTERNA_SERVICO!,
  prismaInstance:      prismaPedido,    // ← injeção
}))
```

### Bumpe de versão

SDK passa de `0.x` → `1.0.0` — major bump por quebra de contrato (campo obrigatório novo).

---

## Consequências

### Positivas

- **Resolve definitivamente os 500s** em todos os produtos consumidores do SDK.
- **Cada produto controla seu próprio cliente Prisma** — alinhado com schema-per-produto.
- **Eliminação de `node_modules/.prisma/client` da raiz** como ponto de falha — não há mais "último a rodar generate ganha".
- **Tipos corretos em runtime** — TypeScript do produto host sabe quais models existem.

### Negativas

- **Quebra contrato** — todos os hosts precisam atualizar `withOrganizacao`/`resolverOrganizacao` no mesmo PR (Mandamento 07 — sincronia front+back). 7 arquivos `index.ts` afetados.
- **Refator coordenado** — não pode ser feito incremental por produto; ou todos atualizam, ou ficam quebrados.
- **Bumpear versão major** do SDK requer atualizar lockfile e workspace deps.

### Neutras

- **Tamanho do bundle** — cada produto continua importando o mesmo `@prisma/client` runtime (só o tipo gerado é diferente). Sem impacto perceptível.

---

## Alternativas consideradas

### B — `prisma generate` por produto com output isolado

Cada `schema.prisma` declara `generator client { output = "../generated/prisma-<produto>" }`. Produto importa explicitamente desse path, não de `@prisma/client`.

**Rejeitada porque:**
- Ainda precisa do mecanismo de injeção pro SDK saber qual usar.
- Não resolve o problema de o SDK fazer `import { PrismaClient } from '@prisma/client'` internamente.
- Adiciona complexidade no schema sem resolver a raiz.

### C — Copiar manualmente arquivos do Prisma Client antes de subir o servidor

Workaround operacional: antes de iniciar o servidor do Pedido, copiar `produto/pedido/node_modules/.prisma/client/*` para `node_modules/.prisma/client/` da raiz.

**Rejeitada porque:**
- Gambiarra. Quebra na próxima vez que outro produto rodar `prisma generate`.
- Não escala para múltiplos produtos rodando em paralelo (mesma máquina dev).
- Não resolve em prod.

### D — Manter Sprint 1 e ter um schema unificado na raiz

Combinar todos os fragments em um único `schema.prisma` na raiz. SDK consome esse client unificado.

**Rejeitada porque:**
- Conflita com decisão arquitetural anterior (schema-per-produto, multi-tenant `tenant_<id>`).
- Acopla todos os produtos num único schema — quebra independência.
- Migrations ficariam globais, perdendo isolamento por onda de produto.

---

## Plano de execução

| Etapa | Trabalho | Responsável | Tempo |
|---|---|---|---|
| 1 | ADR aprovado e co-assinado | Coordenador + Líder Técnico | — |
| 2 | Atualizar `ConfigResolverOrganizacao` em `types.ts` | Líder Técnico | 10 min |
| 3 | Deletar `internal-prisma.ts`; refatorar `withOrganizacao` para usar instance injetada | Líder Técnico | 30 min |
| 4 | Atualizar 7 produtos hosts: instanciar PrismaClient próprio em cada `server/src/index.ts` | Líder Técnico | 1h |
| 5 | Bumpear versão do SDK; atualizar lockfile | Líder Técnico | 5 min |
| 6 | Smoke test em todos os 7 produtos (Pedido, Simula Custo, Bid Frete, Bid Câmbio, NF Importação, LPCO, Processo) | Líder Técnico + QA | 30 min |
| 7 | Deploy gradual: Pedido primeiro, validar, depois os outros | Coordenador | 1 dia |

**Pré-requisito obrigatório:** F3 (24 migrations Prisma do Pedido aplicadas) **antes** desta refatoração. Banco íntegro reduz ruído de regressão.

---

## Aprovações

- [ ] **Coordenador** — Daniel Martins
- [ ] **Líder Técnico** — _[a designar]_

---

## Referências

- `packages/resolver-organizacao/src/internal-prisma.ts` — código com decisão Sprint 1 documentada
- `skills/governanca/lei/9-mandamentos/SKILL.md` — Mandamento 02 (schema intocável, só Coordenador)
- `documentos-tecnicos/decisoes-arquiteturais/0001-webhook-propagacao-cadastros.md` — modelo de ADR
- Sintoma observado: análise de 2026-05-07 — 8 endpoints `/api/v1/pedidos/*` retornando 500
