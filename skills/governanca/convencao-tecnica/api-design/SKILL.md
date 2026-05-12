---
name: antigravity-api-design
description: "Use esta skill ao projetar ou modificar APIs REST. Define hierarquia de URLs DDD-aware, convenções de naming, versionamento, paginação, formato de resposta, erros, headers e boas práticas. Em conflito de naming, prevalece skills/governanca/lei/ddd-nomenclatura/SKILL.md."
---

# Gravity — Design de Rotas REST API

> **Esta skill define COMO desenhar a API.**
> Os NOMES vêm de [`skills/governanca/lei/ddd-nomenclatura/SKILL.md`](../../lei/ddd-nomenclatura/SKILL.md).
> Em conflito de naming, `ddd-nomenclatura` prevalece. Em conflito de forma, esta skill prevalece.

---

# PARTE 1 — Estrutura e Naming (DDD-aware)

## Princípio fundamental

A URL da API deve **espelhar a hierarquia de entidades do banco de dados**. A entidade raiz do Prisma vira o recurso raiz da rota. Toda tabela filha (que tem FK para a raiz) vira sub-recurso. Os nomes das rotas usam os **nomes das entidades da planilha DDD (coluna "Tabela")**, no plural e em kebab-case. A planilha DDD é a fonte da verdade — consulte-a antes de criar qualquer rota.

---

## Estrutura obrigatória

```
[MÉTODO HTTP]  /api/v1/[entidade-raiz-plural]/:id_<entidade-raiz>/[entidade-filha-plural]/:id_<entidade-filha>
```

---

## Regras

1. **Sem verbos na URL.** A URL representa apenas recursos (substantivos). Quem define a ação é o método HTTP (GET, POST, PUT, PATCH, DELETE).
   - ❌ `POST /api/v1/pedido-itens/criar`
   - ❌ `POST /api/v1/pedido-itens/deletar`
   - ✅ `POST /api/v1/pedidos/:id_pedido/pedido-itens` (criar está implícito no POST)
   - ✅ `DELETE /api/v1/pedidos/:id_pedido/pedido-itens/:id_pedido_item` (deletar está no DELETE)

   > **Exceção controlada:** ações de domínio que não são CRUD (gerar, duplicar, promover, ativar) seguem o padrão da seção **Ações que não são CRUD** (Parte 3).

2. **Nomes em português, respeitando o banco.** Os nomes das entidades vêm da coluna "Tabela" da planilha DDD. Converter para kebab-case e plural.
   - Organizacao → `organizacoes`
   - Workspace → `workspaces`
   - PedidoGeral → `pedidos`
   - PedidoItem → `pedido-itens`
   - UsuarioPermissao → `usuario-permissoes`

3. **Recursos sempre no plural.**
   - ❌ `/api/v1/organizacao`
   - ✅ `/api/v1/organizacoes`
   - ❌ `/api/v1/pedido-item`
   - ✅ `/api/v1/pedido-itens`

4. **Sem barra final (trailing slash).**
   - ❌ `/api/v1/organizacoes/`
   - ✅ `/api/v1/organizacoes`
   - ❌ `/api/v1/pedidos/:id_pedido/pedido-itens/`
   - ✅ `/api/v1/pedidos/:id_pedido/pedido-itens`

5. **Hierarquia por sub-recurso seguindo as relações do Prisma.** O recurso filho vem após o identificador do pai, espelhando a FK. **Identificadores no path sempre com prefixo `:id_<entidade>`** (nunca `:id`, `:uid`, `:org_id` ou outras abreviações).
   - ❌ `/api/v1/pedido-itens/pedido/:pedido_id`
   - ✅ `/api/v1/pedidos/:id_pedido/pedido-itens`
   - ❌ `/api/v1/usuario-permissoes/organizacao/:org_id`
   - ✅ `/api/v1/organizacoes/:id_organizacao/usuario-permissoes`
   - ❌ `/api/v1/workspaces/organizacao/:org_id`
   - ✅ `/api/v1/organizacoes/:id_organizacao/workspaces`

6. **CRUD padrão com métodos HTTP:**

   | Ação         | Método | Rota                                       |
   |-------------|--------|--------------------------------------------|
   | Listar       | GET    | `/api/v1/pedidos`                          |
   | Criar        | POST   | `/api/v1/pedidos`                          |
   | Buscar um    | GET    | `/api/v1/pedidos/:id_pedido`               |
   | Atualizar    | PUT    | `/api/v1/pedidos/:id_pedido`               |
   | Parcial      | PATCH  | `/api/v1/pedidos/:id_pedido`               |
   | Deletar      | DELETE | `/api/v1/pedidos/:id_pedido`               |

7. **Filtros e consultas vão em query params, não na URL.** Query params em **PT-BR snake_case**, com sufixo de entidade quando o nome for genérico (REGRA 1 do `ddd-nomenclatura`). Valores de enum em **EN UPPER_SNAKE** (REGRA 7).
   - ❌ `GET /api/v1/pedidos/status/aprovado`
   - ❌ `GET /api/v1/pedidos?status=aprovado` (genérico sem sufixo + valor em PT)
   - ✅ `GET /api/v1/pedidos?status_pedido=APPROVED`
   - ❌ `GET /api/v1/cambios/USD/2026-05-01`
   - ✅ `GET /api/v1/cambios?moeda_cambio=USD&data_referencia_cambio=2026-05-01`

8. **Informações consultáveis são recursos, não ações.** Disponibilidade, status, estatísticas, métricas são tratados como sub-recursos com GET.

---

## Conversão: Tabela Prisma → Rota API

| Passo | Regra                                          | Exemplo                                                                |
|-------|-------------------------------------------------|------------------------------------------------------------------------|
| 1     | Pegar nome da coluna **Tabela** na planilha DDD | `PedidoItem`                                                           |
| 2     | Converter PascalCase → kebab-case               | `pedido-item`                                                          |
| 3     | Pluralizar em português                         | `pedido-itens`                                                         |
| 4     | Se é entidade filha, aninhar sob a rota do pai  | `/pedidos/:id_pedido/pedido-itens`                                     |
| 5     | Se é relação 1:1, não usar id próprio no filho  | `GET /organizacoes/:id_organizacao/usuario-preferencias` (sem id filho) |

---

## Exemplo completo

Hierarquia Prisma: **Organizacao** → Usuario (1:N) | → Workspace (1:N) | → UsuarioPermissao (1:N)

```
# Organizacao (raiz — sem pai)
GET    /api/v1/organizacoes                                                       → listar organizações
GET    /api/v1/organizacoes/:id_organizacao                                       → buscar organização
PUT    /api/v1/organizacoes/:id_organizacao                                       → atualizar organização

# Usuario (filho de Organizacao — FK: id_organizacao)
GET    /api/v1/organizacoes/:id_organizacao/usuarios                              → listar usuários da org
POST   /api/v1/organizacoes/:id_organizacao/usuarios                              → convidar usuário
GET    /api/v1/organizacoes/:id_organizacao/usuarios/:id_usuario                  → buscar usuário
PUT    /api/v1/organizacoes/:id_organizacao/usuarios/:id_usuario                  → atualizar usuário
DELETE /api/v1/organizacoes/:id_organizacao/usuarios/:id_usuario                  → remover usuário

# Workspace (filho de Organizacao — FK: id_organizacao)
GET    /api/v1/organizacoes/:id_organizacao/workspaces                            → listar workspaces
POST   /api/v1/organizacoes/:id_organizacao/workspaces                            → criar workspace
PUT    /api/v1/organizacoes/:id_organizacao/workspaces/:id_workspace              → atualizar workspace
DELETE /api/v1/organizacoes/:id_organizacao/workspaces/:id_workspace              → deletar workspace

# UsuarioPermissao (filho de Organizacao — FK: id_organizacao)
GET    /api/v1/organizacoes/:id_organizacao/usuario-permissoes                              → listar permissões
POST   /api/v1/organizacoes/:id_organizacao/usuario-permissoes                              → criar permissão
PUT    /api/v1/organizacoes/:id_organizacao/usuario-permissoes/:id_usuario_permissao        → atualizar permissão
DELETE /api/v1/organizacoes/:id_organizacao/usuario-permissoes/:id_usuario_permissao        → remover permissão
```

---

## Checklist de validação (estrutura)

Antes de criar qualquer rota, verificar:

- [ ] O nome do recurso corresponde à coluna **Tabela** da planilha DDD?
- [ ] Está no plural em português?
- [ ] Está em kebab-case?
- [ ] A hierarquia pai/filho segue as relações do Prisma?
- [ ] Identificadores no path usam `:id_<entidade>` (sem abreviar)?
- [ ] Tem algum verbo na URL? → Remover (salvo ações não-CRUD da Parte 3).
- [ ] Tem barra final? → Remover.
- [ ] Tem filtro/data no path? → Mover para query params.
- [ ] A leitura faz sentido: "recurso-pai → id → recurso-filho"?

---

# PARTE 2 — Forma e Contrato

## Convenções REST (referência)

### URLs

```
GET    /api/v1/cotacoes                       → listar
GET    /api/v1/cotacoes/:id_cotacao           → detalhe
POST   /api/v1/cotacoes                       → criar
PUT    /api/v1/cotacoes/:id_cotacao           → atualizar (substituir)
PATCH  /api/v1/cotacoes/:id_cotacao           → atualizar parcial
DELETE /api/v1/cotacoes/:id_cotacao           → remover
```

**Regras de naming:**
- Substantivos no plural: `/cotacoes`, `/fornecedores`, `/atividades`
- kebab-case para URLs: `/api/v1/notas-fiscais`
- Sem verbos na URL: ~~`/api/v1/getCotacoes`~~
- Relações como sub-recurso: `/api/v1/cotacoes/:id_cotacao/propostas`
- Ações que não são CRUD: `POST /api/v1/cotacoes/:id_cotacao/fechar` (ver Parte 3)

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
GET /api/v1/cotacoes?pagina=1&limite=20&ordenar_por=data_criacao_cotacao&ordem=DESC

// Response
{
  "data": [...],
  "paginacao": {
    "pagina": 1,
    "limite": 20,
    "total": 156,
    "total_paginas": 8
  }
}
```

**Regras:**
- `limite` máximo: 100 (proteger contra queries pesadas)
- `limite` padrão: 20
- Sempre retornar `total` e `total_paginas`
- Ordenação padrão: `data_criacao_<entidade> DESC`
- Valores de `ordem`: `ASC` ou `DESC` (EN UPPER_SNAKE — REGRA 7)

---

## Formato de Resposta — Sucesso

> O envelope (`data`, `paginacao`, `error`) é wrapper técnico padrão REST e fica em inglês por convenção universal. Os campos **dentro** do envelope seguem DDD (snake_case PT-BR).

```json
// Objeto único
{
  "data": { "id_cotacao": "abc", "titulo_cotacao": "Cotação 001" }
}

// Lista
{
  "data": [...],
  "paginacao": { ... }
}

// Criação
// Status: 201 Created
{
  "data": { "id_cotacao": "novo-id", "titulo_cotacao": "..." }
}

// Deleção
// Status: 204 No Content (sem body)
```

---

## Formato de Resposta — Erro

Ver [Code Standards](../code-standards/SKILL.md) para o formato completo. Resumo:

```json
{
  "error": {
    "codigo": "NOT_FOUND",
    "mensagem": "Cotação não encontrada",
    "detalhes": {}
  }
}
```

> **`error` (envelope)** fica em inglês por convenção REST. **Códigos** (`NOT_FOUND`, `CONFLICT`, `VALIDATION_FAILED`) ficam em **EN UPPER_SNAKE** alinhado à REGRA 7 (constantes técnicas). **Mensagens** ficam em PT-BR canonical (REGRA 9).

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
GET /api/v1/cotacoes?status_cotacao=OPEN&modal_cotacao=SEA&busca=XPTO
```

- Filtros exatos via query params em PT-BR snake_case com sufixo de entidade quando genérico
- Busca textual via `busca=`
- Filtros de data: `data_criacao_cotacao_apos=2026-01-01&data_criacao_cotacao_antes=2026-12-31`
- Múltiplos valores: `status_cotacao=OPEN,CLOSED` (valores em EN UPPER_SNAKE — REGRA 7)

---

## Validação com Zod

Todo endpoint tem um schema Zod que serve como **contrato** da API. Campos em **snake_case PT-BR DDD**, valores de enum em **EN UPPER_SNAKE**:

```typescript
export const createCotacaoSchema = z.object({
  titulo_cotacao: z.string().min(1).max(200),
  modal_cotacao: z.enum(['SEA', 'AIR', 'ROAD']),
  data_limite_cotacao: z.string().datetime(),
  ids_fornecedor: z.array(z.string().cuid()).min(1),
})

// O schema é exportado — consumers podem importar para validação client-side
export type CreateCotacaoInput = z.infer<typeof createCotacaoSchema>
```

---

## Headers Obrigatórios

| Header | Quando | Valor |
|:---|:---|:---|
| `Authorization` | Toda rota autenticada | `Bearer <jwt>` (RFC — exceção universal) |
| `Content-Type` | POST/PUT/PATCH | `application/json` (RFC — exceção universal) |
| `x-chave-interna` | Chamadas S2S | `process.env.INTERNAL_SERVICE_KEY` |
| `x-id-correlacao` | Toda chamada S2S | SUID propagado |
| `x-id-organizacao` | Chamadas S2S | ID da organização chamadora |
| `x-chave-idempotencia` | Ações cross-boundary | Chave determinística |

> Headers customizados em **kebab-case PT-BR** com prefixo `x-` (REGRA "Headers customizados" do `ddd-nomenclatura`). `Authorization` e `Content-Type` ficam em inglês por serem RFC.

---

## Checklist — Antes de Criar um Endpoint

- [ ] URL segue convenção REST (substantivo plural, kebab-case)?
- [ ] Versionado com `/api/v1/`?
- [ ] Schema Zod definido e exportado, em snake_case PT-BR?
- [ ] Valores de enum em EN UPPER_SNAKE?
- [ ] Paginação implementada para listas (`pagina`, `limite`, `ordenar_por`, `ordem`)?
- [ ] Response segue formato padrão (`data`, `paginacao`, `error`) com campos internos em DDD?
- [ ] Códigos HTTP corretos para cada cenário?
- [ ] Headers obrigatórios em kebab-case PT-BR (salvo Authorization e Content-Type)?
- [ ] Rate limiting considerado (se rota pública)?

---

# PARTE 3 — Casos especiais

## Ações que não são CRUD

Operações de domínio que não cabem em GET/POST/PUT/PATCH/DELETE puro (gerar, duplicar, promover, ativar, fechar, cancelar) usam **verbo curto em PT-BR no final do path**, sob o recurso pai.

**Padrão obrigatório:**

```
POST /api/v1/agendas/:id_agenda/slots/gerar
POST /api/v1/pedidos/:id_pedido/duplicar
POST /api/v1/usuarios/:id_usuario/promover
POST /api/v1/cotacoes/:id_cotacao/fechar
POST /api/v1/assinaturas/:id_assinatura/cancelar
```

**Regras:**
- Sempre **POST** (mesmo que a ação leia mais do que escreve — é uma mutação de estado).
- Verbo no infinitivo PT-BR (`gerar`, `duplicar`, `promover`, `cancelar`).
- Verbo no final do path, depois do `:id_<entidade>` do recurso afetado.
- **Não** usar `actions/`, `acoes/` nem `:` (Google API style) como prefixo — só o verbo.
- Body Zod com os parâmetros da ação; resposta com o estado novo do recurso.
- Idempotência via header `x-chave-idempotencia` quando a ação não for naturalmente idempotente.

❌ `POST /api/v1/slots/gerar` (sem o pai)
❌ `POST /api/v1/pedidos/:id_pedido/actions/duplicar`
❌ `POST /api/v1/pedidos/:id_pedido:duplicar`
✅ `POST /api/v1/agendas/:id_agenda/slots/gerar`
✅ `POST /api/v1/pedidos/:id_pedido/duplicar`

---

## Relação 1:1 sem id no filho

Quando um pai tem **no máximo um filho** (FK do filho marcada `@unique` no schema), o filho fica sob `/pais/:id_pai/filho` **sem id próprio no path**.

**Exemplo canônico:** `Agenda` → `DisponibilidadeConfig` (FK `agenda_id @unique`).

```
GET    /api/v1/agendas/:id_agenda/disponibilidade-config   → busca a config (404 se não existe)
PUT    /api/v1/agendas/:id_agenda/disponibilidade-config   → cria ou substitui (idempotente)
PATCH  /api/v1/agendas/:id_agenda/disponibilidade-config   → atualiza parcial
DELETE /api/v1/agendas/:id_agenda/disponibilidade-config   → remove
```

**Regras:**
- Filho NUNCA aparece como recurso top-level (`/api/v1/disponibilidade-config` é proibido).
- Preferir **PUT** para criação (semântica "set" idempotente). Se POST for necessário, deve falhar com 409 quando já existir.
- Lista plural não existe — é sempre objeto único ou 404.

---

## PATCH parcial + normalização de vazio

> **Aprendizado validado em produção — 2026-05-06.**

PATCH parcial deve aceitar `string` vazio significando "limpar campo" (vira `null` no banco). Diferenciar `undefined` (não tocar) de `""` (apagar) é parte do contrato.

**Helper canônico:**

```ts
const vazioParaNull = (v: string | undefined): string | null | undefined => {
  if (v === undefined) return undefined  // não toca campo
  const t = v.trim()
  return t === '' ? null : t              // "" → null
}
```

**Regras:**
- Schema Zod do request usa `z.string().optional()` com `.refine(v => v === '' || regex.test(v), ...)` pra aceitar limpar OU valor válido.
- Schema Zod da **response** deve existir em paralelo ao do request — sem isso, drift de contrato fica invisível (Mandamento 09).
- Backend deve retornar a entidade completa após mutação (paridade request/response) — frontend atualiza state local sem refetch.
- Frontend faz `responseSchema.parse(json)` antes de usar — nunca consumir `await fetch().json()` cru.

**Caso real (2026-05-06):** PATCH `/admin/organizacoes/:id` aceitava o body mas descartava 5 campos. Sem Zod de response no front, o drift entre o que era enviado e o que voltava ficou invisível por meses.

---

## PUT vs PATCH

| Método | Semântica | Quando usar |
|---|---|---|
| **PUT** | Substituição completa do recurso. Cliente envia **todos os campos**. Idempotente. | Recurso é "set inteiro" (ex: configuração de disponibilidade); criação idempotente em 1:1. |
| **PATCH** | Atualização parcial. Cliente envia **só o que muda**. Idempotente. | Edição do dia a dia na UI (quase nunca a UI envia tudo). |

**Regra prática:** padrão é **PATCH** para edição. Use PUT só quando o recurso for substituído por inteiro ou quando não existe diferença de "campos opcionais".

---

## DTO em snake_case

A resposta JSON sempre devolve campos em **snake_case PT-BR DDD**, alinhado à coluna "Nome no banco/back/front - DDD" da planilha.

❌ Devolver Prisma cru com camelCase (`createdAt`, `organizacaoId`, `updatedAt`).
❌ camelCase em qualquer campo (`idOrganizacao`, `nomeUsuario`).
✅ snake_case PT-BR (`id_organizacao`, `nome_usuario`, `data_criacao_pedido`).

**Implementação:** sempre passar pelo mapper `toDTO()` na rota. Nunca devolver `await prisma.foo.findMany()` direto. Exemplo:

```typescript
function toAgendaDTO(a: AgendaRow) {
  return {
    id_agenda: a.id_agenda,
    id_organizacao: a.id_organizacao,
    nome_agenda: a.nome_agenda,
    // ...
  }
}
res.json(rows.map(toAgendaDTO))
```

**Aplica-se também a:** request body Zod (validar em snake_case DDD), query params, headers customizados.

---

## Soft delete

- **Hard delete (padrão):** quando o model não tem campo `excluido` nem `data_exclusao_<entidade>`. `DELETE` remove a linha; resposta `204 No Content`.
- **Soft delete (quando existe `excluido` ou `data_exclusao_*` no schema):**
  - `DELETE` marca `excluido = true` (ou `data_exclusao_<entidade> = now()`).
  - Toda query default (`findMany`, `findFirst`) filtra `excluido = false`.
  - Resposta `204 No Content`.
  - Para forçar hard delete (admin/limpeza): query param `?excluir_definitivo=true`. Auditar separadamente.

**Restauração:** `POST /api/v1/<recursos>/:id_<entidade>/restaurar` (ação não-CRUD, ver Parte 3).

---

## Operações em lote

Operações em lote sobre uma coleção (criar N, atualizar N, apagar N).

**Padrão:**

```
POST   /api/v1/<recursos>/lote                          → cria/atualiza N (body: { itens: [...] })
POST   /api/v1/<recursos>/excluir-lote                  → remove N (body: { ids: [...] })
DELETE /api/v1/<recursos>?ids=a,b,c                     → variante com query (limite ~50 ids)
```

**Resposta padrão (permite sucesso parcial):**

```json
{
  "data": {
    "processados": 100,
    "sucessos": 97,
    "falhas": [
      { "id_pedido": "abc", "codigo": "NOT_FOUND", "mensagem": "Pedido não encontrado" },
      { "id_pedido": "def", "codigo": "CONFLICT", "mensagem": "Já está fechado" }
    ]
  }
}
```

**Regras:**
- Status HTTP `200 OK` mesmo com falhas parciais (não 207 — front lê pelo array `falhas`).
- Limite de 500 itens por request (proteger contra timeout/memória).
- Header `x-chave-idempotencia` recomendado para evitar duplicação em retry.

---

## S2S vs autenticada

| Tipo de rota | Header obrigatório | Quem chama | Exemplo |
|---|---|---|---|
| **Autenticada** (usuário final) | `Authorization: Bearer <jwt-clerk>` | Frontend (SPA) | `GET /api/v1/agendas` |
| **S2S** (interna entre serviços) | `x-chave-interna: <env.INTERNAL_SERVICE_KEY>` + `x-id-organizacao: <id>` | Serviço Gravity → Serviço Gravity | `POST /api/v1/internal/sincronizar-organizacao` |
| **Webhook** | `x-assinatura-webhook: <hmac>` | Sistemas externos (Stripe, Clerk) | `POST /api/v1/webhooks/stripe` |
| **Pública** | nenhum | Marketplace, healthcheck | `GET /healthz` |

**Regras:**
- Rotas S2S **NÃO** carregam JWT do usuário. O serviço chamador propaga o `id_organizacao` via header `x-id-organizacao` (kebab-case) — confiando que o caller validou a autorização.
- Rotas S2S ficam sob prefixo `/api/v1/internal/...` (visível na URL).
- Validação do `x-chave-interna` é **middleware obrigatório** em toda rota interna (ver `skills/seguranca/autenticacao-s2s/SKILL.md`).
- Webhooks validam assinatura HMAC antes de qualquer parsing do body.

---

## Referências cruzadas

- [`skills/governanca/lei/ddd-nomenclatura/SKILL.md`](../../lei/ddd-nomenclatura/SKILL.md) — naming canônico (esta skill prevalece em conflito de naming)
- [`skills/seguranca/autenticacao-s2s/SKILL.md`](../../../seguranca/autenticacao-s2s/SKILL.md) — `x-chave-interna`, propagação de organização, machine tokens
- [`skills/testes/contract-testing/SKILL.md`](../../../testes/contract-testing/SKILL.md) — Zod como contrato bilateral, CI bloqueando breaking changes
- **9 Mandamentos** — REGRA 06 (Zod obrigatório), REGRA 07 (sincronia front+back), REGRA 09 (Zod bilateral)
- **Planilha mestre** — `planilha_geral_gravity.xlsx`, abas `1.ddd_campos` (campos) e `2. ddd_api` (rotas)
