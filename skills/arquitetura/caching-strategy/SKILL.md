---
name: antigravity-caching-strategy
description: "Use esta skill para implementar estratégia de cache. Define quando usar cache, TTL por tipo de dado, invalidação, Redis vs in-memory, isolamento por organização e padrões de implementação. Consultada pelo Backend e Estrutura de Dados ao otimizar performance para atingir 200ms/50k req."
---

# Gravity — Caching Strategy

## Por Que Cache é Necessário

Para atingir **200ms com 50k requisições simultâneas**, muitas queries precisam ser respondidas sem tocar o banco. Cache reduz latência e carga no PostgreSQL.

---

## Quando Usar Cache

| Dado | Cachear? | Razão |
|:---|:---|:---|
| Lista de produtos do catálogo | Sim | Muda raramente, consultado frequentemente |
| Permissões da organização | Sim | Verificado em toda request, muda pouco |
| Dashboard KPIs | Sim | Cálculo pesado, tolerância de 5min |
| Alíquotas fiscais (NCM) | Sim | Dados externos, cache com TTL longo |
| Cotação individual | Não | Muda frequentemente, precisa ser real-time |
| Lista de atividades | Não | Cada user vê dados diferentes |
| Dados de formulário | Não | Sempre fresh |

**Regra:** cachear dados que são lidos muitas vezes e escritos poucas vezes.

---

## Camadas de Cache

### Camada 1 — In-Memory (Node.js)

Para dados pequenos, acessados por toda instância:

```typescript
// shared/cache/memory-cache.ts
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

export function memInvalidate(pattern: string): void {
  for (const key of cache.keys()) {
    if (key.startsWith(pattern)) cache.delete(key)
  }
}
```

**Quando usar:** dados globais (não por organização), instância única, cache < 1000 entries.

### Camada 2 — Redis (Fase 3)

Para cache compartilhado entre instâncias:

```typescript
// shared/cache/redis-cache.ts
import { Redis } from 'ioredis'

const redis = new Redis(process.env.REDIS_URL!)

export async function redisGet<T>(key: string): Promise<T | null> {
  const data = await redis.get(key)
  return data ? JSON.parse(data) : null
}

export async function redisSet(key: string, data: unknown, ttlSeconds: number): Promise<void> {
  await redis.setex(key, ttlSeconds, JSON.stringify(data))
}

export async function redisInvalidate(pattern: string): Promise<void> {
  const keys = await redis.keys(`${pattern}*`)
  if (keys.length > 0) await redis.del(...keys)
}
```

**Quando usar:** cache por organização, múltiplas instâncias, cache > 1000 entries.

---

## TTL por Tipo de Dado

| Dado | TTL | Cache Layer | Invalidação |
|:---|:---|:---|:---|
| Catálogo de produtos | 1 hora | Redis | Ao criar/editar produto |
| Permissões da organização | 5 min | Redis | Ao alterar permissão |
| Dashboard KPIs | 5 min | Redis | Ao fechar período |

| Alíquotas fiscais (NCM) | 24 horas | Redis | Ao atualizar base |
| PTAX (câmbio) | 1 hora | Redis | Ao atualizar cotação |
| Config do produto | 10 min | Memory | Ao alterar config |
| Navigation/menu items | 30 min | Memory | Ao ativar/desativar produto |

---

## Padrão Cache-Aside

```typescript
// Padrão obrigatório para todo uso de cache
async function getDashboardKpis(idOrganizacao: string): Promise<KPIs> {
  const cacheKey = `dashboard:kpis:${idOrganizacao}`

  // 1. Tentar cache primeiro
  const cached = await redisGet<KPIs>(cacheKey)
  if (cached) return cached

  // 2. Se miss, buscar no banco
  const kpis = await calculateKpis(idOrganizacao)

  // 3. Salvar no cache
  await redisSet(cacheKey, kpis, 300) // 5 min

  return kpis
}
```

---

## Invalidação de Cache

### Por evento (recomendado)

```typescript
// Ao criar/editar cotação, invalidar cache do dashboard
async function createCotacao(data: CotacaoInput) {
  const cotacao = await prisma.cotacao.create({ data })

  // Invalidar cache relacionado
  await redisInvalidate(`dashboard:kpis:${data.id_organizacao}`)
  await redisInvalidate(`cotacoes:count:${data.id_organizacao}`)

  return cotacao
}
```

### Por TTL (fallback)

Se a invalidação por evento falhar, o TTL garante que o cache expira naturalmente. Nunca depender **apenas** de invalidação por evento.

---

## Cache e Isolamento de Organização

**REGRA CRÍTICA:** toda chave de cache DEVE incluir `id_organizacao`.

```typescript
// ✅ correto — cache isolado por organização
const key = `dashboard:kpis:${idOrganizacao}`

// ❌ PROIBIDO — cache compartilhado entre organizações
const key = `dashboard:kpis`
```

> Vazamento de cache entre organizações é uma **vulnerabilidade de segurança**.

---

## Checklist — Cache

- [ ] Dado realmente precisa de cache? (lido muito, escrito pouco?)
- [ ] TTL definido e adequado?
- [ ] Chave inclui `id_organizacao`?
- [ ] Invalidação por evento implementada?
- [ ] TTL como fallback de invalidação?
- [ ] Cache layer correto (memory vs Redis)?
- [ ] Sem dados sensíveis no cache?
- [ ] Métricas de hit/miss rate monitoradas?
