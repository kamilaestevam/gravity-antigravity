# Convenção de Rotas — SSOT (Single Source of Truth)

> **Tema:** Padrão único de URL para todas as áreas e produtos do monolito-sidecar
> **Versão:** 1.0
> **Data:** 2026-05-23
> **Status:** 📋 Especificação aprovada — refatoração em andamento (Pendência #5)
> **Origem:** Diagnóstico do bug `/configurador → 404` (PR #21)

---

## Sumário

1. Por que existe
2. A regra (uma só)
3. Inventário de áreas
4. Estado atual × estado-alvo
5. Inventário de rotas a migrar
6. Redirects de transição (deprecação suave)
7. Checklist de refatoração
8. Anti-padrões
9. Como adicionar uma área nova
10. Referências

---

## Por que existe

Sem uma convenção única, o time mistura prefixos (`/produto/pedido` vs `/pedido`,
`/workspace` vs `/configurador`) e cria drift entre o que o usuário digita, o que
o código navega via `navigate()`, e o que o `App.tsx` registra como `<Route>`.

Drift de URL não dá erro de compilação — vira **404 em produção**, com bug
invisível na navegação interna (ex.: botão "Configurador" do menu do avatar dos
5 produtos cai em 404 porque a rota foi renomeada para `/workspace` mas os
produtos seguem chamando `/configurador`).

Este documento é o **único lugar** onde a convenção vive. Skills, código, docs
e memory devem citá-lo — nunca redefini-lo.

---

## A regra (uma só)

Toda URL do app segue **exatamente** este padrão:

```
www.usegravity.com.br/{área}                       ← raiz da área (landing/dashboard)
www.usegravity.com.br/{área}/{sub-rota}            ← tela dentro da área
www.usegravity.com.br/{área}/{sub-rota}/{id}       ← detalhe de recurso
```

**Sem prefixo intermediário.** Nada de `/produto/`, `/app/`, `/web/`, `/console/`.
A `{área}` vem **direto** após o domínio.

**`{área}` é o slug DDD do produto/área**, em `kebab-case` PT-BR:
- ✅ `pedido`, `bid-frete`, `simula-custo`, `nf-importacao`, `api-cockpit`
- ❌ `pedidos` (plural), `BidFrete` (PascalCase), `bidFrete` (camelCase), `bid_frete` (snake_case)

**`{sub-rota}` é o slug da tela**, em `kebab-case` PT-BR, alinhado ao nome do menu lateral:
- ✅ `lista`, `dashboard`, `kanban`, `configuracao`, `organizacao`, `workspaces`, `usuarios`
- ❌ `list`, `Dashboard`, `config`, `users`

---

## Inventário de áreas

### Áreas fixas (uma instância no app, sempre)

| Área | URL raiz | Para que serve |
|------|---------|----------------|
| `hub` | `/hub` | Seletor de workspace + cards de acesso rápido. Tela inicial pós-login. |
| `core` | `/core` | Serviços transversais (notificações, e-mail, WhatsApp, conector-erp, atividades) |
| `configurador` | `/configurador` | Gestão da organização do cliente (workspaces, usuários, empresas, assinaturas, financeiro, api-cockpit, taxas, certificados) |
| `admin` | `/admin` | Painel interno Gravity (`gravity_admin` only). Visão cross-organização. |
| `store` | `/store` | Catálogo de produtos Gravity contratáveis |

### Áreas por produto

| Área | URL raiz |
|------|---------|
| `/pedido` | Produto Pedido |
| `/bid-frete` | Produto BID Frete |
| `/bid-cambio` | Produto BID Câmbio |
| `/bid-frete-internacional` | Produto BID Frete Internacional |
| `/simula-custo` | Produto Simulador de Custo |
| `/processo` | Produto Processo |
| `/nf-importacao` | Produto NF Importação |
| `/lpco` | Produto LPCO |
| `/cadastros` | Produto Cadastros (compartilhado) |

### Áreas públicas (sem autenticação)

| Área | URL |
|------|-----|
| Landing | `/` |
| Autenticação | `/login`, `/cadastro`, `/recuperar-senha` |
| Legais | `/termos-de-uso`, `/politica-de-privacidade` |
| Marketing | `/trial`, `/contato`, `/waitlist` |

---

## Estado atual × estado-alvo

### `/configurador` (era `/workspace`)

| Hoje (errado) | Alvo |
|---|---|
| `/workspace` | `/configurador` |
| `/workspace/organizacao` | `/configurador/organizacao` |
| `/workspace/workspaces` | `/configurador/workspaces` |
| `/workspace/usuarios` | `/configurador/usuarios` |
| `/workspace/empresas-e-parceiros` | `/configurador/empresas-e-parceiros` |
| `/workspace/assinaturas` | `/configurador/assinaturas` |
| `/workspace/financeiro` | `/configurador/financeiro` |
| `/workspace/api-cockpit` | `/configurador/api-cockpit` |
| `/workspace/api-cockpit/tokens` | `/configurador/api-cockpit/tokens` |
| `/workspace/api-cockpit/webhooks` | `/configurador/api-cockpit/webhooks` |
| `/workspace/api-cockpit/consumo` | `/configurador/api-cockpit/consumo` |
| `/workspace/conector-cargowise` | `/configurador/conector-cargowise` |
| `/workspace/taxas-moeda` | `/configurador/taxas-moeda` |
| `/workspace/historico-organizacao` | `/configurador/historico-organizacao` |
| `/selecionar-workspace` (já redireciona para `/hub`) | manter redirect |

### Produtos (remover prefixo `/produto/`)

| Hoje (errado) | Alvo |
|---|---|
| `/produto/pedido/*` | `/pedido/*` |
| `/produto/bid-frete/*` | `/bid-frete/*` |
| `/produto/bid-cambio/*` | `/bid-cambio/*` |
| `/produto/bid-frete-internacional/*` | `/bid-frete-internacional/*` |
| `/produto/simula-custo/*` | `/simula-custo/*` |
| `/produto/processo/*` | `/processo/*` |

### `/admin` (mantém raiz, valida sub-rotas)

Permanece em `/admin/*`. É **área separada** de `/configurador` por design — `/admin`
é Gravity interno (`gravity_admin = true` only, cross-org); `/configurador` é da
organização do cliente.

A sobreposição de nomes de tela (ex.: `/admin/usuarios` × `/configurador/usuarios`)
é intencional: a Gravity gerencia usuários cross-org no `/admin`, o cliente
gerencia os usuários da própria org no `/configurador`.

### Singular vs plural (alinhado ao DDD)

| Tipo de tela | Plural ou singular | Exemplo |
|---|---|---|
| Lista / coleção | **Plural** | `/configurador/usuarios`, `/pedido/lista`, `/admin/organizacoes` |
| Detalhe de UM recurso | **Plural + ID** | `/configurador/usuarios/:id_usuario` |
| Ação sobre UM recurso | **Plural + ID + verbo** | `/configurador/usuarios/:id_usuario/editar` |
| Criar (sem ID ainda) | **Plural + verbo** | `/configurador/usuarios/convidar`, `/pedido/lista/novo` |
| Conceito-único da org | **Singular** | `/configurador/organizacao`, `/configurador/financeiro`, `/pedido/dashboard` |

### Params de path — naming e formato

**Naming:** `:id_recurso` em **snake_case PT-BR**, igual ao campo da planilha DDD.

```tsx
<Route path="/configurador/usuarios/:id_usuario" element={<UsuarioDetalhe />} />
<Route path="/admin/organizacoes/:id_organizacao" element={<OrganizacaoDetalhe />} />
```

❌ `:id`, `:userId`, `:usuarioId`, `:idUsuario`, `:user_id`
✅ `:id_usuario`, `:id_organizacao`, `:id_pedido`

**Formato do valor:** sempre **SUID**. ❌ ID numérico (vaza ordem), slug (colide).

### Query strings — convenção

| Aspecto | Param | Exemplo |
|---|---|---|
| Busca | `q` | `?q=acme` |
| Filtro por campo | `{nome_campo_ddd}` | `?status_pedido=aberto&id_workspace=01HXKY...` |
| Filtro múltiplo | `{campo}=v1,v2` | `?status_pedido=aberto,em_andamento` |
| Período | `{campo}_de`, `{campo}_ate` | `?data_pedido_de=2026-01-01` |
| Paginação | `pagina`, `por_pagina` | `?pagina=2&por_pagina=50` |
| Ordenação | `ordenar_por`, `ordem` | `?ordenar_por=data_pedido&ordem=desc` |
| View mode | `modo` | `?modo=kanban` |
| Aba | `aba` | `?aba=dados` |

**Princípios:**
- Filtros preservam refresh
- Filtros viajam no link compartilhado
- Estado puramente UI não vai pra URL
- Defaults omitidos (se `pagina=1` é default, omite)
- Ordem dos params irrelevante

❌ `?page`, `?perPage`, `?sortBy` (inglês)
❌ `?id_org` (abreviação)

### Hash (`#âncora`)

Apenas para scroll dentro da mesma view ou callback forçado por provedor
(OAuth implicit). Nunca para estado funcional.

### Trailing slash e case-sensitivity

- `/configurador/` → 301 → `/configurador`
- `/Configurador` → 301 → `/configurador`

Implementação: middleware Express em `server/index.ts` antes do catch-all SPA.

### 404 e fallback

- Renderiza `<PaginaNaoEncontrada />` (com acentos PT-BR corretos)
- HTTP 200 (SPA), tela mostra 404 visual
- Botão "Voltar ao início" → `/hub` se autenticado, `/` se não
- OTel obrigatório: span + log com `url`, `referrer`, `id_usuario`, `id_organizacao`, `id_correlacao`
- Alerta: > 10 404/min mesma URL → page automático

### Histórico do navegador

| Navegação | Método |
|---|---|
| Click em menu / link primário | `push` |
| Trocar filtro/aba/ordenação | `replace` |
| Fechar modal | `navigate(-1)` ou `navigate('/rota-pai', { replace: true })` |
| Redirect de transição | `replace` |
| Auth redirect (login → hub) | `replace` |

### Frontend ↔ API

| Frontend | API |
|---|---|
| `/configurador/usuarios` | `GET /api/v1/usuarios?id_organizacao=...` |
| `/configurador/usuarios/:id_usuario` | `GET /api/v1/usuarios/:id_usuario` |
| `/configurador/usuarios/convidar` (submit) | `POST /api/v1/usuarios` |
| `/configurador/usuarios/:id_usuario/editar` (submit) | `PATCH /api/v1/usuarios/:id_usuario` |

**Slug do recurso é o mesmo nos dois.** Versionamento vive em `/api/v1` — nunca no frontend.

### Multi-tenant na URL

- `id_organizacao` **NÃO viaja no path** — resolvido pelo JWT
- `id_workspace` em **query** quando filtra view (`?id_workspace=01HXKY...`)
- NUNCA criar `/{org}/configurador` ou subdomain por org

### Versionamento e i18n

- ❌ `/v2/configurador` — proibido (use feature flag)
- ❌ `/pt-br/configurador` — URL sempre PT-BR sem prefixo de idioma

### Lazy loading e code-splitting

Regra: uma área = um chunk dinâmico (`React.lazy()`).

### Deep linking — link compartilhável carrega TUDO

✅ Área e sub-rota | ✅ Recurso (`:id` + verbo) | ✅ Filtros | ✅ Ordenação | ✅ Página | ✅ Aba
❌ Seleção em massa | ❌ Posição de scroll | ❌ Hover/foco

### Service registry / contracts.json

Cada produto registra suas rotas em `contracts.json` (ver `skills/governanca/operacao/service-registry/SKILL.md`).
CI valida: toda nova rota no `App.tsx` precisa de entrada em `contracts.json`.

### URLs públicas geradas para terceiros (webhooks, OAuth, etc.)

| Tipo | Padrão | Exemplo |
|---|---|---|
| Webhook | `/api/v1/webhooks/{provedor}` | `/api/v1/webhooks/stripe` |
| OAuth callback | `/{área}/sso-callback` | `/login/sso-callback`, `/cadastro/sso-callback` |
| Stripe success/cancel | `/configurador/financeiro/checkout-{resultado}` | (futuro) |
| Convite por e-mail | `/cadastro/continuar?token={suid}` | — |
| Compartilhamento público | `/p/{suid_publico}` | (futuro) |

### Modais que viram sub-rota

**Regra prática:** se o link compartilhado deve reabrir a mesma visão → **VIRA ROTA**.

| Cenário | Vira rota? | Padrão |
|---|:---:|---|
| Form criar/editar | ✅ | `/{área}/{recurso}/novo`, `/{área}/{recurso}/:id/editar` |
| Drill-down de recurso | ✅ | `/admin/organizacoes/:id_organizacao` |
| Wizard multi-step | ✅ | `/configurador/onboarding/passo-1` |
| Confirmação ("apagar?") | ❌ | state local |
| Toast / Alert | ❌ | state local |
| Popover / Tooltip | ❌ | state local |
| Filtros e busca | 🟡 | query string |

**Verbos PT-BR infinitivo:** `novo`, `editar`, `convidar`, `duplicar`, `transferir`.

### Guarda de rota — quem entra onde

| Área | Guard | Quem entra |
|---|---|---|
| `/hub`, `/store`, `/core/*` | `<ProtectedRoute>` | autenticado |
| `/configurador/*` | `<ConfiguradorRoute>` | SUPER_ADMIN, ADMIN, MASTER |
| `/admin/*` | `<AdminRoute>` | `gravity_admin = true` |
| `/{produto}/*` | `<ProtectedRoute>` + permissão | quem contratou |
| Públicas | `<PublicRoute>` ou sem guard | qualquer |

---

## Inventário de rotas a migrar

### 1. `App.tsx` — registro de rotas

Arquivo: `servicos-global/configurador/src/App.tsx`

Substituir:
- `<Route path="/workspace">` → `<Route path="/configurador">`
- `<Route path="/produto/pedido/*">` → `<Route path="/pedido/*">`
- `<Route path="/produto/bid-frete/*">` → `<Route path="/bid-frete/*">`
- `<Route path="/produto/bid-cambio/*">` → `<Route path="/bid-cambio/*">`
- `<Route path="/produto/simula-custo/*">` → `<Route path="/simula-custo/*">`
- `<Route path="/produto/processo/*">` → `<Route path="/processo/*">`

### 2. Navegação interna no Configurador

Arquivos com `navigate('/workspace/...')` ou `navigate('/produto/...')`:
- `servicos-global/configurador/src/pages/Hub.tsx`
- `servicos-global/configurador/src/pages/Core.tsx`
- `servicos-global/configurador/src/pages/Store.tsx`
- `servicos-global/configurador/src/pages/SelecionarWorkspace.tsx`
- `servicos-global/configurador/src/pages/workspace/WorkspaceLayout.tsx` (após rename → `pages/configurador/`)
- `servicos-global/configurador/src/pages/admin/AdminLayout.tsx`
- `servicos-global/configurador/src/components/GabiOnboardingWidget.tsx`

### 3. Produtos (5 App.tsx)

Hoje todos navegam para `/configurador` (correto). Quando o `App.tsx` migrar,
ficam automaticamente OK.

### 4. Pasta `pages/workspace/` → `pages/configurador/`

`git mv servicos-global/configurador/src/pages/workspace/ servicos-global/configurador/src/pages/configurador/`

Atualizar todos os imports.

### 5. Skills / Docs / Memory

Buscar e substituir `/workspace/` e `/produto/`:
- `skills/produtos-gravity/configurador/SKILL.md` e sub-skills
- `skills/produtos-gravity/api-cockpit/SKILL.md`
- `documentos-tecnicos/arquitetura/admin-cross-org-pattern.md`
- `documentos-tecnicos/arquitetura/workspaces-acessiveis-ssot.md`
- Memory: `project_api_cockpit_roadmap.md`

### 6. Testes E2E

`grep -rn "goto('/workspace\|goto('/produto" testes/`

### 7. Servidor (Express) — middleware novo

- Trailing slash → 301 sem barra
- Case → 301 minúsculas
- Legacy `/workspace`, `/produto/{X}` → 301 canônica

---

## Redirects de transição (deprecação suave)

Durante 90 dias, todas as URLs antigas respondem com 301 para a nova:

```tsx
<Route path="/workspace/*" element={<NavigateComPrefixo de="/workspace" para="/configurador" />} />
<Route path="/produto/pedido/*" element={<NavigateComPrefixo de="/produto/pedido" para="/pedido" />} />
<Route path="/produto/bid-frete/*" element={<NavigateComPrefixo de="/produto/bid-frete" para="/bid-frete" />} />
<Route path="/produto/bid-cambio/*" element={<NavigateComPrefixo de="/produto/bid-cambio" para="/bid-cambio" />} />
<Route path="/produto/simula-custo/*" element={<NavigateComPrefixo de="/produto/simula-custo" para="/simula-custo" />} />
<Route path="/produto/processo/*" element={<NavigateComPrefixo de="/produto/processo" para="/processo" />} />
```

**Prazo de remoção:** 90 dias após merge ou 0 hits em observabilidade (o que vier primeiro).

---

## Checklist de refatoração

- [ ] `App.tsx` registra novas rotas (`/configurador`, `/pedido`, etc.)
- [ ] `App.tsx` mantém redirects das antigas (compatibilidade)
- [ ] Pasta `pages/workspace/` renomeada para `pages/configurador/`
- [ ] Todos os `navigate('/workspace/...')` substituídos
- [ ] Todos os `navigate('/produto/...')` substituídos
- [ ] Todos os `window.location.href = '/workspace...'` substituídos
- [ ] Todos os `<Link to="/workspace/...">` e `<Link to="/produto/...">` substituídos
- [ ] Skills atualizadas
- [ ] Memory entries atualizadas
- [ ] Documentos-técnicos atualizados
- [ ] Testes E2E atualizados (URLs hardcoded)
- [ ] Middleware Express adicionado (trailing slash + case + legacy)
- [ ] CI roda OK: lint, type-check, testes
- [ ] Smoke manual: login → /hub → cada produto → menu avatar → "Configurador" abre sem 404
- [ ] Cross-tipo de usuário: SUPER_ADMIN, ADMIN, MASTER, PADRAO, FORNECEDOR todos OK
- [ ] Dashboard de 404 monitorado por 7 dias pós-deploy

---

## Anti-padrões

❌ Prefixos intermediários (`/produto/`, `/app/`, `/web/`)
❌ URLs em inglês (`/users`, `/orders`)
❌ PascalCase / camelCase / snake_case (use kebab-case)
❌ `:id` solto (use `:id_usuario`, `:id_pedido`)
❌ ID numérico no path (SUID sempre)
❌ Slug como identificador no path
❌ `window.location.href` quando dá pra `navigate()`
❌ Hardcoded em string em vez de `ROTAS.{área}.{rota}`
❌ Renomear rota sem manter redirect ≥ 90 dias
❌ Versionamento na URL (`/v2/...`)
❌ Modal de form sem mudar URL
❌ `?modal=convidar` quando merece sub-rota
❌ Defaults explícitos na URL (`?pagina=1`)
❌ `id_organizacao` no path
❌ Subdomain por org
❌ Idioma na URL (`/pt-br/...`)

---

## Como adicionar uma área nova

1. Slug DDD: definir `chaveProduto` no SDK
2. Rota raiz: `/{slug}` — registrar em `App.tsx`
3. Sub-rotas: `/{slug}/lista`, `/{slug}/dashboard` — kebab-case PT-BR
4. Constantes: adicionar bloco em `rotas.ts`
5. Sem prefixo `/produto/`
6. Atualizar este documento

---

## Referências

- Naming DDD: `skills/governanca/lei/ddd-nomenclatura/SKILL.md`
- Code standards: `skills/governanca/convencao-tecnica/code-standards/SKILL.md`
- Criação de telas: `skills/ux/criacao-telas/SKILL.md`
- Workspaces acessíveis SSOT: `documentos-tecnicos/arquitetura/workspaces-acessiveis-ssot.md`
- Bug que originou este doc: PR #21 (botão "Configurador" cai em 404)
