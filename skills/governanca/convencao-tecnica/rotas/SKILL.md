---
name: antigravity-rotas
description: "Use esta skill ao criar, renomear ou refatorar QUALQUER rota do frontend (React Router): tela, sub-rota, modal-em-rota, redirect, deep link. Define o padrão único de URL alinhado ao DDD. Em conflito de naming, prevalece skills/governanca/lei/ddd-nomenclatura/SKILL.md. Em conflito de design de API REST, prevalece skills/governanca/convencao-tecnica/api-design/SKILL.md (frontend ≠ API)."
---

# Gravity — Convenção de Rotas (Frontend / SPA)

> **Esta skill é o resumo operacional.**
> A spec completa vive em [`documentos-tecnicos/arquitetura/rotas-convencao.md`](../../../../documentos-tecnicos/arquitetura/rotas-convencao.md).
> Esta skill traz o que o agente precisa saber **para não errar** em código novo.

---

## A regra única

```
www.usegravity.com.br/{área}                ← raiz da área
www.usegravity.com.br/{área}/{sub-rota}     ← tela dentro da área
www.usegravity.com.br/{área}/{sub-rota}/{id}  ← detalhe de recurso
```

**Sem prefixo intermediário.** Nada de `/produto/`, `/app/`, `/web/`, `/console/`.
A área vem **direto** após o domínio.

---

## Áreas fixas

| Área | URL | Guard |
|---|---|---|
| `hub` | `/hub` | autenticado |
| `core` | `/core` | autenticado |
| `configurador` | `/configurador` | SUPER_ADMIN, ADMIN, MASTER |
| `admin` | `/admin` | `gravity_admin = true` |
| `store` | `/store` | autenticado |

## Áreas por produto

`/pedido`, `/bid-frete`, `/bid-cambio`, `/bid-frete-internacional`, `/simula-custo`, `/processo`, `/nf-importacao`, `/lpco`, `/cadastros`

> Slug = `chaveProduto` do SDK `@gravity/resolver-organizacao`. Kebab-case PT-BR.

---

## Casing e idioma

- **kebab-case PT-BR** sempre — `bid-frete`, `nf-importacao`, `configurador/usuarios`
- ❌ `BidFrete`, `bidFrete`, `bid_frete`, `BID-Frete`
- ❌ `/users`, `/orders`, `/dashboard` em inglês — sempre PT-BR
- ✅ Exceção: termos técnicos sem tradução natural (`dashboard`, `kanban`, `api-cockpit`)

---

## Singular vs plural (DDD)

| Tipo de tela | Forma | Exemplo |
|---|---|---|
| Lista / coleção | Plural | `/configurador/usuarios`, `/admin/organizacoes` |
| Detalhe de UM recurso | Plural + ID | `/configurador/usuarios/:id_usuario` |
| Conceito-único da org | Singular | `/configurador/organizacao`, `/configurador/financeiro` |

❌ `/usuario` para lista (errado)
❌ `/organizacoes` dentro de `/configurador` (errado — org logada é uma só)

---

## Params de path

- **Naming:** `:id_recurso` em **snake_case PT-BR**, igual ao campo DDD
- ✅ `:id_usuario`, `:id_organizacao`, `:id_pedido`, `:id_item_pedido`
- ❌ `:id`, `:userId`, `:usuarioId`, `:user_id`
- **Formato:** sempre **SUID** (não numérico, não slug)

---

## Query strings

| Aspecto | Param | Exemplo |
|---|---|---|
| Busca | `q` | `?q=acme` |
| Filtro | `{nome_campo_ddd}` | `?status_pedido=aberto` |
| Múltiplo | `{campo}=v1,v2` | `?status_pedido=aberto,em_andamento` |
| Período | `{campo}_de`, `{campo}_ate` | `?data_pedido_de=2026-01-01` |
| Paginação | `pagina`, `por_pagina` | `?pagina=2&por_pagina=50` |
| Ordenação | `ordenar_por`, `ordem` | `?ordenar_por=data_pedido&ordem=desc` |
| Modo | `modo` | `?modo=kanban` |
| Aba | `aba` | `?aba=dados` |

❌ `?page`, `?perPage`, `?sortBy` (inglês)
❌ `?id_org` (abreviação — use `?id_organizacao`)
❌ Defaults na URL (`?pagina=1`)

---

## Modais — quando viram rota

**Regra:** se o link compartilhado deve reabrir a mesma visão → **VIRA ROTA**.

| Cenário | Vira rota? | Padrão |
|---|:---:|---|
| Form criar/editar | ✅ | `/configurador/usuarios/convidar`, `/configurador/usuarios/:id/editar` |
| Drill-down | ✅ | `/admin/organizacoes/:id_organizacao` |
| Wizard | ✅ | `/configurador/onboarding/passo-1` |
| Confirmação | ❌ | state local |
| Toast / Alert | ❌ | state local |
| Filtros | 🟡 | query string |

**Verbos PT-BR infinitivo:** `novo`, `editar`, `convidar`, `duplicar`, `transferir`.

---

## Frontend ↔ API

| Frontend | API |
|---|---|
| `/configurador/usuarios` | `GET /api/v1/usuarios?id_organizacao=...` |
| `/configurador/usuarios/:id_usuario` | `GET /api/v1/usuarios/:id_usuario` |
| `/configurador/usuarios/convidar` (submit) | `POST /api/v1/usuarios` |
| `/configurador/usuarios/:id_usuario/editar` (submit) | `PATCH /api/v1/usuarios/:id_usuario` |

Versionamento vive em `/api/v1` — nunca no frontend.

---

## Multi-tenant

`id_organizacao` **NÃO viaja no path** — resolvido pelo JWT.
`id_workspace` vai em **query** quando filtra view.

---

## Histórico do navegador

| Navegação | Método |
|---|---|
| Click em menu | `push` |
| Filtro/aba | `replace` |
| Fechar modal | `navigate(-1)` ou pai com `replace` |
| Redirect de transição | `replace` |
| Auth (login → hub) | `replace` |

---

## Hash

Apenas scroll dentro da mesma view ou OAuth implicit. Nunca para estado funcional.

---

## Trailing slash e case

- `/configurador/` → 301 → `/configurador`
- `/Configurador` → 301 → `/configurador`

---

## 404

- `<PaginaNaoEncontrada />` com acentos PT-BR corretos
- HTTP 200 (SPA)
- "Voltar" → `/hub` se autenticado, `/` se não
- OTel obrigatório (`url`, `referrer`, `id_usuario`, `id_organizacao`, `id_correlacao`)

---

## Anti-padrões (zero tolerância)

❌ Prefixo intermediário (`/produto/pedido`)
❌ URL em inglês (`/users`, `/new`)
❌ PascalCase / camelCase / snake_case
❌ Plural arbitrário
❌ `:id` sem qualificador
❌ ID numérico no path
❌ `window.location.href` desnecessário
❌ Hardcoded em vez de `ROTAS.{área}.{rota}`
❌ Renomear sem redirect 301 por ≥ 90 dias
❌ `/v2/...` na URL
❌ Modal de form sem mudar URL
❌ `?modal=convidar` em vez de sub-rota
❌ Defaults explícitos (`?pagina=1`)
❌ `id_organizacao` no path
❌ Subdomain por org
❌ Idioma na URL

---

## Checklist do agente antes de criar rota nova

- [ ] Slug da área vem do `chaveProduto`?
- [ ] Sub-rota em kebab-case PT-BR?
- [ ] Lista é plural? Detalhe é plural + `:id_recurso`?
- [ ] Param de path é `:id_recurso` (snake_case PT-BR DDD)?
- [ ] Filtros vão na query (snake_case PT-BR)?
- [ ] Modal de form é sub-rota com verbo?
- [ ] Adicionei entrada em `contracts.json`?
- [ ] Constante em `rotas.ts` (`ROTAS.{área}.{rota}`)?
- [ ] Se renomeei, adicionei redirect 301?
- [ ] Guard correto aplicado?

---

## Quando o agente está prestes a errar

| Sintoma | Ação |
|---|---|
| Vai criar `/produto/X/...` | Remove o `/produto/` |
| Vai usar `:id` solto | `:id_usuario`, `:id_pedido`, etc. |
| Filtros indo no path | Move para query |
| Modal sem URL | Vira sub-rota |
| `navigate('/workspace/...')` | Use `/configurador/...` |
| `window.location.href = '/configurador'` | Use `navigate('/configurador')` |
| `?page=2` em vez de `?pagina=2` | Traduz |

---

## Referências

- **Spec completa:** [`documentos-tecnicos/arquitetura/rotas-convencao.md`](../../../../documentos-tecnicos/arquitetura/rotas-convencao.md)
- **DDD:** [`skills/governanca/lei/ddd-nomenclatura/SKILL.md`](../../lei/ddd-nomenclatura/SKILL.md)
- **Code standards:** [`skills/governanca/convencao-tecnica/code-standards/SKILL.md`](../code-standards/SKILL.md)
- **API design:** [`skills/governanca/convencao-tecnica/api-design/SKILL.md`](../api-design/SKILL.md)
- **Criação de telas:** [`skills/ux/criacao-telas/SKILL.md`](../../../ux/criacao-telas/SKILL.md)
- **Service registry:** [`skills/governanca/operacao/service-registry/SKILL.md`](../../operacao/service-registry/SKILL.md)
