---
name: antigravity-api-design
description: "Use esta skill ao projetar ou modificar APIs REST. Define convenções de naming, versionamento, paginação, formato de resposta, erros e boas práticas. Consultada pelo Líder Técnico e Backend antes de criar ou alterar qualquer endpoint."
---

# Gravity — API Design

## Convenções REST

### URLs

```
GET    /api/v1/cotacoes              → listar
GET    /api/v1/cotacoes/:id          → detalhe
POST   /api/v1/cotacoes              → criar
PUT    /api/v1/cotacoes/:id          → atualizar (substituir)
PATCH  /api/v1/cotacoes/:id          → atualizar parcial
DELETE /api/v1/cotacoes/:id          → remover
```

**Regras de naming:**
- Substantivos no plural: `/cotacoes`, `/fornecedores`, `/atividades`
- kebab-case para URLs: `/api/v1/notas-fiscais`
- Sem verbos na URL: ~~`/api/v1/getCotacoes`~~
- Relações como sub-recurso: `/api/v1/cotacoes/:id/bids`
- Ações que não são CRUD: `POST /api/v1/cotacoes/:id/actions/fechar`

---

## Versionamento

Prefixo obrigatório em toda URL: `/api/v1/`

| Mudança | Requer nova versão? |
|:---|:---|
| Adicionar campo ao response | Não |
| Adicionar query parameter opcional | Não |
| Remover campo do response | Sim → `/api/v2/` |
| Renomear endpoint | Sim → `/api/v2/` |
| Mudar tipo de campo | Sim → `/api/v2/` |
| Mudar payload de request | Sim → `/api/v2/` |

> Versão antiga mantida por pelo menos 1 ciclo de release.

---

## Paginação

Toda lista que pode crescer usa paginação cursor-based ou offset:

```typescript
// Request
GET /api/v1/cotacoes?page=1&limit=20&sort=created_at&order=desc

// Response
{
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 156,
    "totalPages": 8
  }
}
```

**Regras:**
- `limit` máximo: 100 (proteger contra queries pesadas)
- `limit` padrão: 20
- Sempre retornar `total` e `totalPages`
- Ordenação padrão: `created_at DESC`

---

## Formato de Resposta — Sucesso

```json
// Objeto único
{
  "data": { "id": "abc", "title": "Cotação 001" }
}

// Lista
{
  "data": [...],
  "pagination": { ... }
}

// Criação
// Status: 201 Created
{
  "data": { "id": "novo-id", ... }
}

// Deleção
// Status: 204 No Content (sem body)
```

---

## Formato de Resposta — Erro

Ver `antigravity-code-standards` para o formato completo. Resumo:

```json
{
  "error": {
    "code": "NOT_FOUND",
    "message": "Cotação não encontrada",
    "details": {}
  }
}
```

**Códigos HTTP:**
| Status | Quando |
|:---|:---|
| 200 | Sucesso (GET, PUT, PATCH) |
| 201 | Criado com sucesso (POST) |
| 204 | Deletado com sucesso (DELETE) |
| 400 | Validação falhou |
| 401 | Não autenticado |
| 403 | Sem permissão |
| 404 | Recurso não encontrado |
| 409 | Conflito (duplicata) |
| 429 | Rate limit excedido |
| 500 | Erro interno |

---

## Filtros e Busca

```
GET /api/v1/cotacoes?status=ABERTA&modal=MARITIMO&q=XPTO
```

- Filtros exatos via query params
- Busca textual via `q=`
- Filtros de data: `created_after=2026-01-01&created_before=2026-12-31`
- Múltiplos valores: `status=ABERTA,FECHADA`

---

## Validação com Zod

Todo endpoint tem um schema Zod que serve como **contrato** da API:

```typescript
export const createCotacaoSchema = z.object({
  titulo: z.string().min(1).max(200),
  modal: z.enum(['MARITIMO', 'AEREO', 'RODOVIARIO']),
  data_limite: z.string().datetime(),
  fornecedores: z.array(z.string().cuid()).min(1),
})

// O schema é exportado — consumers podem importar para validação client-side
export type CreateCotacaoInput = z.infer<typeof createCotacaoSchema>
```

---

## Headers Obrigatórios

| Header | Quando | Valor |
|:---|:---|:---|
| `Authorization` | Toda rota autenticada | `Bearer <jwt>` |
| `x-internal-key` | Chamadas S2S | `process.env.INTERNAL_SERVICE_KEY` |
| `x-correlation-id` | Toda chamada S2S | UUID propagado |
| `Content-Type` | POST/PUT/PATCH | `application/json` |
| `X-Idempotency-Key` | Ações cross-boundary | Chave determinística |

---

## Checklist — Antes de Criar um Endpoint

- [ ] URL segue convenção REST (substantivo plural, kebab-case)?
- [ ] Versionado com `/api/v1/`?
- [ ] Schema Zod definido e exportado?
- [ ] Paginação implementada para listas?
- [ ] Response segue formato padrão (`data`, `pagination`, `error`)?
- [ ] Códigos HTTP corretos para cada cenário?
- [ ] Headers obrigatórios documentados?
- [ ] Rate limiting considerado (se rota pública)?
