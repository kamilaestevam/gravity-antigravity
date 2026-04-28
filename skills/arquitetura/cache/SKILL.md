---
name: antigravity-cache
description: "Use esta skill ao implementar, otimizar ou revisar uso de cache (in-memory ou Redis). Define camadas (Camada 1 in-memory + Camada 2 Redis), padrão Cache-Aside obrigatório, TTL recomendado por tipo de dado, estratégia de invalidação por evento + TTL de fallback e o formato de chave organizacao: aceito pelo linter. Skill de arquitetura — regras absolutas vivem em governanca/."
---

# Gravity — Cache

> ⚠️ **REGRA ABSOLUTA:** Ver [SLA Metas](../../governanca/lei/sla-metas/SKILL.md) — meta de **200ms p95 com 50.000 requisições simultâneas**. Cache é **um dos mecanismos** para atingir essa meta (ao lado de índices, paginação, queries otimizadas). Esta skill cobre apenas o padrão técnico de cache.
>
> ⚠️ **REGRA ABSOLUTA:** Ver [Lint Tenant-Safety](../../governanca/convencao-tecnica/lint-tenant-safety/SKILL.md) — **REGRA 4** do linter: toda chave de cache **deve** começar com `organizacao:` (ou `organizacao:_global:`). Esta skill mostra como o padrão é aplicado, mas a regra é validada em CI.

## Quando Usar Cache

| Dado | Cachear? | Razão |
|:---|:---|:---|
| Lista de produtos do catálogo | Sim | Muda raramente, consultado frequentemente |
| Permissões da organização | Sim | Verificado em toda request, muda pouco |
| Dashboard KPIs | Sim | Cálculo pesado, tolerância de 5 min |
| Alíquotas fiscais (NCM) | Sim | Dados externos, cache com TTL longo |
| Cotação individual | Não | Muda frequentemente, precisa ser real-time |
| Lista de atividades | Não | Cada usuário vê dados diferentes |
| Dados de formulário | Não | Sempre fresh |

**Heurística:** cachear dados que são **lidos muitas vezes e escritos poucas vezes**.

---

## Camadas

### Camada 1 — In-Memory (Node.js)

Para dados pequenos, lidos só dentro de uma instância (ex: config do produto carregada na inicialização).

```typescript
// servicos-global/cache/memory-cache.ts
const cache = new Map<string, { data: unknown; expiry: number }>()

export function memGet<T>(key: string): T | null {
  const entry = cache.get(key)
  if (!entry || Date.now() > entry.expiry) {
    cache.delete(key)
    return null
  }
  return entry.data as T
}

export function memSet(key: string, data: unknown, ttlMs: number): void {
  cache.set(key, { data, expiry: Date.now() + ttlMs })
}

export function memInvalidate(prefix: string): void {
  for (const key of cache.keys()) {
    if (key.startsWith(prefix)) cache.delete(key)
  }
}
```

**Quando usar:** dados globais (chave `organizacao:_global:...`), instância única, < 1000 entries. Mesmo no in-memory a REGRA 4 do linter se aplica. **Não** compartilhado entre réplicas — cada instância tem o seu Map.

### Camada 2 — Redis (Sprint 3+)

Para cache compartilhado entre instâncias (qualquer dado por organização):

```typescript
// servicos-global/cache/redis-cache.ts
import { Redis } from 'ioredis'

const redis = new Redis(process.env.REDIS_URL!)

export async function redisGet<T>(key: string): Promise<T | null> {
  const data = await redis.get(key)
  return data ? JSON.parse(data) : null
}

export async function redisSet(key: string, data: unknown, ttlSeconds: number): Promise<void> {
  await redis.setex(key, ttlSeconds, JSON.stringify(data))
}

// Invalidação por padrão usa SCAN — NUNCA redis.keys() em produção
// (redis.keys bloqueia o servidor enquanto varre todo o keyspace).
export async function redisInvalidate(pattern: string): Promise<number> {
  let removed = 0
  const stream = redis.scanStream({ match: `${pattern}*`, count: 100 })

  for await (const keys of stream) {
    if (keys.length > 0) {
      // unlink é não-bloqueante (libera memória em background) — preferível a del em prod
      removed += await redis.unlink(...keys)
    }
  }
  return removed
}
```

**Quando usar:** cache por organização, múltiplas instâncias, > 1000 entries.

> ⚠️ **Antipattern conhecido:** `redis.keys(pattern)` faz scan **bloqueante** do keyspace inteiro. Em produção com muitas chaves trava o servidor por segundos e afeta todas as outras operações. Sempre use `SCAN` (via `scanStream`) com `unlink` — ambos não-bloqueantes.

---

## Formato da Chave (REGRA 4 do linter)

Toda chave de cache **deve** começar com `organizacao:` ou `organizacao:_global:`. O CI bloqueia o deploy de qualquer chamada `redis.set/get/del/expire` que não respeite esse prefixo.

```typescript
// ✅ correto — prefixo organizacao:<id_organizacao> isola o cache por organização
const cacheKey = `organizacao:${id_organizacao}:dashboard:kpis`
const cacheKey = `organizacao:${id_organizacao}:produtos:${id_produto}`

// ✅ correto — _global: para dados sem organização (ex: tabela NCM)
const cacheKey = `organizacao:_global:ncm:8471.30`  // global exige justificativa em comment

// ❌ ERRO — sem prefixo organizacao:
const cacheKey = `dashboard:kpis:${id_organizacao}`     // bloqueado em CI

// ❌ ERRO — sem nenhum identificador de organização
const cacheKey = `dashboard:kpis`                       // bloqueado em CI
```

> **Helper futuro (Sprint 2 — ver [SDK Resolvedor de Organização](../../governanca/lei/sdk-resolvedor-organizacao/SKILL.md)):** `organizacaoCache(req.organizacao)` aplicará o prefixo automaticamente. Enquanto não chega, escreva o prefixo `organizacao:` na mão.

---

## TTL Recomendado por Tipo de Dado

| Dado | TTL | Camada | Invalidação |
|:---|:---|:---|:---|
| Catálogo de produtos | 1 hora | Redis | Ao criar/editar produto |
| Permissões da organização | 5 min | Redis | Ao alterar permissão |
| Dashboard KPIs | 5 min | Redis | Ao fechar período |
| Alíquotas fiscais (NCM) | 24 horas | Redis (`organizacao:_global:`) | Ao atualizar base |
| PTAX (câmbio) | 1 hora | Redis (`organizacao:_global:`) | Ao atualizar cotação |
| Config do produto | 10 min | In-memory | Ao alterar config |
| Navigation/menu items | 30 min | In-memory | Ao ativar/desativar produto |

---

## Padrão Cache-Aside (Obrigatório)

Toda leitura cacheada segue: tenta cache → se miss, busca fonte primária → grava cache → retorna.

```typescript
async function getDashboardKpis(id_organizacao: string): Promise<KPIs> {
  const cacheKey = `organizacao:${id_organizacao}:dashboard:kpis`

  // 1. Tentar cache primeiro
  const cached = await redisGet<KPIs>(cacheKey)
  if (cached) return cached

  // 2. Se miss, buscar na fonte primária (banco)
  const kpis = await calcularKpis(id_organizacao)

  // 3. Salvar no cache com TTL
  await redisSet(cacheKey, kpis, 300) // 5 min

  return kpis
}
```

> **Por quê obrigatório:** garante consistência com a fonte primária e isola a falha do cache (se Redis cair, a aplicação ainda funciona — apenas mais lenta).

---

## Invalidação

### 1. Por evento (preferida)

Toda escrita que invalida cache deve disparar a invalidação no mesmo fluxo:

```typescript
async function createCotacao(input: CotacaoInput) {
  const cotacao = await prisma.cotacao.create({ data: input })

  // Invalidar caches relacionados — chaves seguem o prefixo organizacao:
  await redisInvalidate(`organizacao:${input.id_organizacao}:dashboard:kpis`)
  await redisInvalidate(`organizacao:${input.id_organizacao}:cotacoes:count`)

  return cotacao
}
```

### 2. Por TTL (fallback obrigatório)

Se a invalidação por evento falhar (rede, deploy parcial, bug), o TTL garante que o cache expira naturalmente. **Nunca depender apenas de invalidação por evento.**

---

## Observabilidade Mínima

> ⚠️ **REGRA ABSOLUTA:** Ver [Observabilidade Mínima](../../governanca/convencao-tecnica/observabilidade-minima/SKILL.md) — métricas obrigatórias por serviço.

Para cache especificamente, expor:

- **hit rate** por prefixo de chave (`organizacao:*:dashboard:*`, etc.)
- **miss rate** com p95 de latência da fonte primária
- **invalidations** por minuto (taxa alta pode indicar churn ruim de TTL)

---

## Checklist — Ao Implementar Cache

- [ ] O dado realmente precisa de cache? (lido muito, escrito pouco?)
- [ ] TTL definido e adequado ao tipo de dado?
- [ ] Chave começa com `organizacao:${id_organizacao}:` (ou `organizacao:_global:` justificado)?
- [ ] Padrão Cache-Aside aplicado (tenta cache → miss → fonte → grava)?
- [ ] Invalidação por evento implementada para escritas relacionadas?
- [ ] TTL como fallback caso invalidação por evento falhe?
- [ ] Camada correta — in-memory para global pequeno, Redis para por-organização?
- [ ] Invalidação por padrão usa `SCAN` (nunca `redis.keys`)?
- [ ] Sem dados sensíveis em texto plano (PII, segredos, tokens — ver [Criptografia](../../governanca/convencao-tecnica/criptografia/SKILL.md))?
- [ ] Hit/miss rate exposto em métricas?
