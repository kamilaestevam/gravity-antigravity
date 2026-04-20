# 🔍 Detetive de Tela — Gravity Store (Checkpoint)

> **Status:** Análise forense completa. **Nenhuma correção aplicada ainda.**
> **Próxima ação:** decidir Opção A (executar 6 críticos agora) ou Opção B (esperar decisão de produto sobre billing/checkout).
>
> **Quando voltar:** ler este doc, decidir A/B, e me chamar de volta.

---

## Onde paramos

- **Sessão anterior fechada:** Detetive Segurança Admin commit `1ce743a` (regressões + bug histórico crítico do Bearer token).
- **Sessão atual:** Detetive Store **somente análise** — 32 achados levantados, nada modificado no código.
- **Próxima tela do backlog:** Usuários Globais (depois de Store).

---

## Identidade da Tela

- **Rota:** `/store`
- **Componente:** [Store.tsx](../../servicos-global/configurador/src/pages/Store.tsx) (828 linhas, monolítico)
- **Tipo:** Vitrine/marketplace **autenticada** (`ProtectedRoute`) — tenants navegam catálogo, ativam módulos via "Contratar", veem builder "Monte o seu Gravity"
- **Topbar:** custom, não usa `AdminLayout`

---

## Inventário Backend

| Método | Path | Handler | Status |
|---|---|---|---|
| GET | `/api/v1/products` | [products.ts:14](../../servicos-global/configurador/server/routes/products.ts:14) | 🔴 **Duplicado** + `as any[]` + catch silencioso + **sem `deleted_at` filter** |
| GET | `/api/v1/catalog/products` | [publicCatalog.ts:15](../../servicos-global/configurador/server/routes/publicCatalog.ts:15) | ✅ Caminho correto via `productCatalogService.listPublic()` |
| GET | `/api/v1/catalog/products/:slug` | [publicCatalog.ts:28](../../servicos-global/configurador/server/routes/publicCatalog.ts:28) | OK |
| GET | `/api/v1/assinaturas` | [tenantProducts.ts:32](../../servicos-global/configurador/server/routes/tenantProducts.ts:32) | 🟠 Catch silencioso retorna `[]` |
| POST | `/api/v1/assinaturas/subscribe` | [tenantProducts.ts:65](../../servicos-global/configurador/server/routes/tenantProducts.ts:65) | 🟠 Sem billing, sem rate limit *(audit: console.info adicionado)* |
| DELETE | `/api/v1/assinaturas/:key` | [tenantProducts.ts:111](../../servicos-global/configurador/server/routes/tenantProducts.ts:111) | 🟠 Sem audit |

---

## Hardcoded no frontend (duplicação de fonte de verdade)

[Store.tsx:63-183](../../servicos-global/configurador/src/pages/Store.tsx:63):

- `PRODUCT_META` — 8 produtos com ícones, cores, categorias, tags, **users (240, 185, 310, 98, 92, 154, 0)** ← números fake
- `PRODUCT_RELATIONS` — grafo "combina com"
- `STACK_ORDER` — ordem fixa do builder
- `COMING_SOON_CONFIG` — 2 produtos "em breve" hardcoded mesmo o backend ter status `COMING_SOON`

---

## 🔴 6 CRÍTICOS

### #1 — Duplicação de rota backend para o mesmo catálogo

Existem **2 rotas** retornando o mesmo catálogo, com lógicas divergentes:

| | `/api/v1/products` | `/api/v1/catalog/products` |
|---|---|---|
| Source | Prisma direto | `productCatalogService.listPublic()` |
| Filtra `deleted_at: null` | ❌ **Não** | ✅ Sim |
| Inclui `price_tiers` | ❌ Não | ✅ Sim |
| `as any[]` | ✅ Tem | ❌ Não |
| Catch silencioso | ✅ Tem | ❌ Não |
| **Quem usa** | **Store.tsx (errado)** | (ninguém ainda — landing/marketplace) |

**Consequência:** depois do fix de `deleted_at` que entreguei no Detetive de Produtos (commit `0cdcfcf`), produtos soft-deletados **continuam aparecendo na Store** porque ela usa a rota errada. **Regressão silenciosa** do meu próprio trabalho anterior.

### #2 — POST `/subscribe` sem billing, sem audit, sem rate limit

[tenantProducts.ts:64-104](../../servicos-global/configurador/server/routes/tenantProducts.ts:64)

- **Sem checkout/billing**: usuário ativa qualquer produto sem pagar nada. Contradiz o trabalho de abstração `BillingProvider` + `ContaAzulProvider` do commit `0cdcfcf`.
- **Sem audit log**: `historicoGlobal` não vê quem ativou o que. LGPD/SOC2 quebrado.
- **Sem rate limit**: pode subscribe/unsubscribe em loop.
- **Sem limite de produtos por tenant** — pode ativar 100 produtos.

### #3 — `as any[]` violando code-standards em DUAS rotas

- [products.ts:17](../../servicos-global/configurador/server/routes/products.ts:17) — `status: { in: ['ACTIVE', 'COMING_SOON'] as any[] }`
- [tenantProducts.ts:75](../../servicos-global/configurador/server/routes/tenantProducts.ts:75) — `status: { in: ['ACTIVE'] as any[] }`

### #4 — Catches silenciosos mascarando bugs em 3 lugares

- [products.ts:32](../../servicos-global/configurador/server/routes/products.ts:32) — `} catch { res.json({ products: [] }) }`
- [tenantProducts.ts:54](../../servicos-global/configurador/server/routes/tenantProducts.ts:54) — `} catch { res.json({ products: [] }) }`
- [tenantProducts.ts:75](../../servicos-global/configurador/server/routes/tenantProducts.ts:75) — `.catch(() => null)` no findFirst

### #5 — Hardcoded `PRODUCT_META` e `COMING_SOON_CONFIG` no frontend

[Store.tsx:63-183](../../servicos-global/configurador/src/pages/Store.tsx:63)

Backend tem 8 produtos. Frontend tem **8 hardcoded em PRODUCT_META** + 2 em **COMING_SOON_CONFIG**. Resultado:

- Admin cria produto novo → grid mostra com fallback `Package`, sem categoria/tags/cor.
- Admin renomeia produto → fora de sincronia com `PRODUCT_RELATIONS`.
- Números de "users" são MOCK (backend não rastreia).
- Stack builder depende de `STACK_ORDER` fixo.

### #6 — Endpoint usado pelo frontend é o errado (consequência do #1)

[Store.tsx:230](../../servicos-global/configurador/src/pages/Store.tsx:230)

```ts
fetch(`${API_URL}/products`)  // → /api/v1/products (a rota duplicada bugada)
```

Deveria ser `${API_URL}/catalog/products`.

---

## 🟠 10 ALTOS

| # | Onde | O quê |
|---|---|---|
| 7 | [Store.tsx:252](../../servicos-global/configurador/src/pages/Store.tsx:252) | `useEffect(() => { load() }, [])` com closures `getToken`/`addNotification`/`t` — stale closure |
| 8 | [Store.tsx:237](../../servicos-global/configurador/src/pages/Store.tsx:237) | Filter `'ACTIVE' \|\| 'Ativo' \|\| 'COMING_SOON'` — `'Ativo'` é label UI pt-BR, backend nunca retorna |
| 9 | [Store.tsx:275-281](../../servicos-global/configurador/src/pages/Store.tsx:275) | Sub-fetch `/companies/${companyId}/products` mascarado com `.catch(() => {})` + `companyId` do sessionStorage sem validação |
| 10 | [Store.tsx:246, 291, 294](../../servicos-global/configurador/src/pages/Store.tsx:246) | `extractCatchError` não usado — padrão `err instanceof Error` repetido |
| 11 | [tenantProducts.ts:189-190, 222-223](../../servicos-global/configurador/server/routes/tenantProducts.ts:189) | `console.log` direto em vez de logger estruturado |
| 12 | [Store.tsx:192](../../servicos-global/configurador/src/pages/Store.tsx:192) | `useShellStore` desestruturado pegando 5 coisas — re-render do componente todo (828 linhas) a cada mudança no store |
| 13 | [Store.tsx:405](../../servicos-global/configurador/src/pages/Store.tsx:405) | `Notificacoes tenantId="store"` — string literal, não é tenant ID real |
| 14 | [tenantProducts.ts:23](../../servicos-global/configurador/server/routes/tenantProducts.ts:23) | `SubscribeSchema` sem regex `^[a-z0-9-]+$` nem max length |
| 15 | [Store.tsx:252](../../servicos-global/configurador/src/pages/Store.tsx:252) | Sem cache nem revalidação — admin ativar produto não reflete sem refresh |
| 16 | [Store.tsx:475](../../servicos-global/configurador/src/pages/Store.tsx:475) | Sem error UI persistente — backend falha = tela vazia silenciosa, só toast efêmero |

---

## 🟡 11 MÉDIOS (resumo)

17. Componente monolítico 828 linhas — quebrar em `StoreHero`, `StoreStats`, `StoreStackBuilder`, `StoreToolbar`, `ProductCard`, `ComingSoonCard`
18. Sem `useMemo` em `produtoNodes`
19. Mistura status cru/UI label
20. `ROLE_LABELS` declarado dentro do componente (recriado a cada render)
21. `disabled onClick={() => {}}` antipattern
22. Builder com SVG paths hardcoded, dimensões 120x90 fixas
23. `users: 240` etc. mockados no frontend
24. Fetch direto em vez de `apiClient` central
25. Sem loading skeleton (só spinner central)
26. Filtro `'disponiveis'` existe mas lógica retorna sempre true (bug)
27. Stack builder z-index quebra se admin remover produto do `STACK_ORDER`

---

## 🟢 5 BAIXOS

28. `hs-fade-up-d${Math.min(idx + 1, 4)}` — animação só nos 4 primeiros cards
29. Topbar com 6 botões sem `aria-label` adequado
30. Footer `new Date().getFullYear()` no JSX
31. `subRes?.ok` sem log de 401/403
32. `subscribed: Map` no useState — re-renders por clone

---

## 🎯 Próxima ação — decidir A vs B

### Opção A — Fix de regressão imediato

Executar os 6 críticos + 10 altos sem decisão de produto.

**Escopo:**
1. Eliminar rota duplicada `/api/v1/products` ou redirecionar para `/catalog/products`
2. POST `/subscribe` integrar com `BillingProvider` (criar invoice via `getBillingProvider().createInvoice()` antes de upsert ProductConfig)
3. Adicionar `auditLog` em subscribe/unsubscribe via historico-global
4. Rate limit nas rotas de subscribe/unsubscribe
5. Remover `as any[]` e catches silenciosos
6. Migrar `PRODUCT_META` para colunas no Product (ou aceitar que são acessórios cosméticos e remover `users` mockados)
7. Frontend: trocar fetch direto por `apiClient`, normalizar status, useEffect deps, extractCatchError
8. `Notificacoes` com tenantId real

**Custo:** 2-3 dias de trabalho, similar aos outros Detetives executados.

**Dependência:** o item #2 (subscribe via BillingProvider) precisa que você confirme se todo subscribe deve cobrar imediatamente, ou se há trial/free tier.

### Opção B — Aguardar decisão de produto

Antes de executar Fase 1, abrir discussão sobre **modelo comercial da Store**:

- Subscribe é cobrado imediatamente?
- Há trial gratuito (X dias)?
- Há free tier (alguns produtos sempre grátis)?
- Há paywall (alguns produtos só em planos Premium)?
- Limite de produtos por tenant baseado no plano?

Sem essas respostas, executar Fase 1 é especulação — vai sair como execução técnica boa de uma regra de negócio errada.

---

## Histórico de commits relevantes desta jornada

```
1ce743a  fix(detetive): regressões + bug histórico crítico em /admin/seguranca
6955792  tabela ajuste seed 500
3a59f83  feat(admin/financeiro): filtros backend-side + confirmação de envio
0cdcfcf  commit detetive financeiro global + deploy railway
3a6fe13  commit detetive produtos gravity admin
275f2b8  fix(configurador): detetive tela seguranca admin
e7e376b  fix(configurador): correções detetive + testes na tela Gestão de Tenants
6c04928  fix(configurador): correções detetive + testes na tela Visão Geral Admin
```

## Backlog de telas pendentes do Detetive Admin

| Tela | Rota | Status |
|---|---|---|
| Gravity Store | `/store` | 🔴 **Analisado, não corrigido (esta sessão)** |
| Usuários Globais | `/admin/usuarios` | ⏳ Próxima recomendada |
| Histórico Global | `/admin/historico` | ⏳ Pendente |
| API Cockpit (Monitor) | `/admin/apis` | ⏳ Pendente |
| Detalhe Tenant | `/admin/tenant/:id` | ⏳ Verificar se já passou junto com Tenants |
| NCM Siscomex | `/admin/ncm-sync` | ⏳ Pendente |
| Testes (LogTestes) | `/admin/testes` | ⏳ Pendente (refactors recentes, provável estado bom) |
