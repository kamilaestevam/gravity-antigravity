---
name: gravity-projeto-regras-gerais
description: "Regras gerais do ecossistema Gravity que todo agente do Dream Team de Produtos deve conhecer antes de qualquer trabalho. Define design system, nucleo-global, componentes obrigatórios, padrões de código, apiGlobal.ts, autenticação Clerk, isolamento de organização, dark/light mode, Lucide icons, tipografia Plus Jakarta Sans e arquitetura do monorepo."
---

# Projeto Gravity — Regras Gerais do Ecossistema

## O Que É o Gravity

Gravity é uma plataforma SaaS multi-organização que hospeda múltiplos produtos de comércio exterior e gestão empresarial. Cada organização tem seus dados completamente isolados (um schema PostgreSQL dedicado por organização). A plataforma é construída como um monorepo TypeScript com frontend React e backend Express.

---

## Arquitetura do Monorepo

```
gravity/
├── nucleo-global/           ← Componentes React puros, sem estado/servidor
├── servicos-global/
│   ├── organização/              ← Serviços 1x por organização (email, dashboard, etc.)
│   ├── produto/             ← Templates reutilizáveis
│   ├── configurador/        ← Auth (Clerk apenas autenticação), billing (provedor a definir), permissões via Prisma
│   ├── marketplace/         ← Landing pública (sem auth)
│   └── devops/              ← CI/CD, scripts, infra
├── produto/                 ← Cada produto isolado (client/ + server/)
├── scripts/                 ← Composição de schema, automações
├── testes/                  ← Unitários, funcionais, E2E centralizados
├── skills/                  ← Skills de todos os agentes
└── documentos-tecnicos/     ← Documentação técnica
```

---

## Design System — Solid Slate

O Gravity usa um design system próprio chamado **Solid Slate**, baseado em Material 3 adaptado.

### Tema

- **Dark mode é o padrão** — toda tela deve funcionar perfeitamente em dark
- **Light mode** é ativado via `body.light-theme`
- Todo agente que propõe telas DEVE considerar ambos os modos
- Nunca usar cores hardcoded — sempre variáveis CSS

### Cores Principais

| Variável | Dark | Light | Uso |
|:---|:---|:---|:---|
| `--bg-body-dark` | `#0f172a` | `#f8fafc` | Fundo da página |
| `--bg-base` | `#1e293b` | `#ffffff` | Cards, painéis |
| `--bg-surface` | `#334155` | `#f1f5f9` | Headers, sidebars |
| `--bg-elevated` | `#475569` | `#e2e8f0` | Hover, bordas |
| `--accent` | `#6366f1` | `#6366f1` | Botões, links, destaques (Indigo 500) |
| `--text-primary` | `#f1f5f9` | `#0f172a` | Texto principal |
| `--text-secondary` | `#94a3b8` | `#475569` | Labels, descrições |
| `--text-muted` | `#64748b` | `#94a3b8` | Texto terciário |
| `--success` | `#22c55e` | `#22c55e` | Status positivo |
| `--warning` | `#f59e0b` | `#f59e0b` | Alertas |
| `--danger` | `#ef4444` | `#ef4444` | Erros, exclusão |

### Tipografia

- **Fonte principal:** Plus Jakarta Sans (Google Fonts) — obrigatória para toda UI
- **Fonte de código:** DM Mono — usada apenas em blocos de código
- Escala tipográfica definida com classes: `.text-display`, `.text-h1`, `.text-h2`, `.text-h3`, `.text-body-lg`, `.text-body`, `.text-sm`, `.text-micro`
- `.text-micro` é SEMPRE uppercase — nunca usar para corpo de texto

### Ícones

- **Biblioteca obrigatória:** Lucide Icons (`lucide-react`)
- Peso padrão: `strokeWidth={2}`
- Tamanhos: 14px (badges), 16px (botões), 18px (nav), 20px (headers)
- Nunca usar outra biblioteca de ícones

### Botões

- **Todos os botões são pill** (border-radius: 9999px) — sem exceção
- Variantes: `primary` (accent), `secondary` (surface), `ghost` (transparente)
- Todo botão tem `font-weight: 600`

### Componentes Visuais Obrigatórios

| Componente | Regra |
|:---|:---|
| Select | Nunca `<select>` nativo — usar `CaixaSelectGlobal` do nucleo-global |
| Toast | Nunca criar manualmente — usar `addNotification` via Shell |
| Modal | Header/footer em `--bg-surface`, body em `--bg-base` |
| Stepper | Círculos com `min-width` e `flex-shrink: 0` obrigatórios |
| Tabs | Pill tabs para seções, underline tabs para conteúdo aninhado |
| Badges | Sempre pill, com fundo semi-transparente da cor do status |

---

## Nucleo-Global — Componentes Compartilhados

O `nucleo-global/` contém componentes React **puros** (sem estado global, sem chamadas de API, sem side effects). Todo produto e serviço deve reutilizar esses componentes antes de criar qualquer coisa nova.

### Regras do Nucleo-Global

1. **Nunca recriar** o que já existe no nucleo-global
2. **Nunca importar** nucleo-global com caminhos relativos — usar alias `@nucleo/`
3. Se precisa de algo genérico que não existe → solicitar criação no nucleo-global
4. Se é específico do produto → criar localmente no produto
5. Componentes do núcleo são **stateless** — recebem props, renderizam, devolvem eventos

### Componentes Disponíveis (Principais)

- `TabelaGlobal` — Tabela com sort, filter, paginação
- `CaixaSelectGlobal` — Select customizado (substitui `<select>` nativo)
- `InputTexto` — Campo de texto com label e validação
- `ModalGlobal` — Modal com header/body/footer padronizados
- `BadgeStatus` — Badge pill com cores de status
- `BotaoGlobal` — Botão pill com variantes
- `Loading` — Spinner/skeleton padronizado

---

## apiGlobal.ts — Chamadas de API Padronizadas

Todo produto usa um arquivo `api.ts` (ou `apiGlobal.ts`) que centraliza chamadas REST. Este arquivo:

1. Configura a base URL do backend
2. Injeta headers obrigatórios (Authorization, x-id-correlacao; o `id_organizacao` é resolvido server-side via SDK `@gravity/tenant-resolver`)
3. Trata erros de forma padronizada
4. Nunca expõe tokens ou dados sensíveis em logs

```typescript
// Padrão de chamada API
const api = createApiClient({
  baseUrl: import.meta.env.VITE_API_URL,
  getToken: () => clerk.session?.getToken(),
})

// Uso
const data = await api.get('/api/v1/estimativas')
const result = await api.post('/api/v1/estimativas', payload)
```

### Regras de API

- Toda chamada passa pelo client API — nunca `fetch()` direto
- Toda resposta de erro segue o formato `{ error: { code, message, details } }`
- Toda rota do backend tem validação Zod antes de tocar o banco
- Endpoints sempre versionados: `/api/v1/recurso`

---

## Autenticação — Clerk (APENAS autenticação)

O Gravity usa **Clerk** como provedor de autenticação. Todo produto integra com Clerk via `@clerk/clerk-react` no frontend e `@clerk/backend` no backend.

> **Mandamento 01 — inviolável:** Clerk responde APENAS por autenticação (login, senha, e-mail, `clerk_user_id`). Autorização (`tipo_usuario`, permissões, `id_organizacao`) é fonte exclusiva do Prisma do Configurador, sempre via `GET /api/v1/me`. **PROIBIDO** ler `publicMetadata.role`, `publicMetadata.tipoUsuario` ou qualquer campo do Clerk para decidir permissão.

### Frontend

- `ClerkProvider` envolve toda a aplicação
- `useAuth()` para obter token de sessão
- `useUser()` apenas para dados de identidade visual (nome, foto)
- Rotas protegidas usam `SignedIn` / `SignedOut` do Clerk para autenticação
- Decisão de papel/permissão SEMPRE via `fetch('/api/v1/me')` + `meResponseSchema.parse()`
- Token JWT enviado em toda requisição via header `Authorization: Bearer <token>`

### Backend

- JWT validado em rotas protegidas via `@clerk/backend`
- Do token extrai-se apenas `clerk_user_id` — o restante (`id_usuario`, `tipo_usuario`, `id_organizacao`) vem do Prisma
- Chamadas inter-serviço usam `x-chave-interna` (não JWT de usuário)

### Regras

- Nunca implementar auth própria — sempre Clerk
- Nunca armazenar passwords — Clerk gerencia
- Nunca expor Clerk Secret Key no frontend
- Session tokens têm expiração curta — sempre validar
- Sem fallback silencioso em autorização — falhou? `AppError` 401/403 explícito

---

## Isolamento de Organização (Multi-Organização)

Cada organização tem seus dados **completamente isolados** via **Schema-per-Organização** no PostgreSQL (cada organização ganha um schema dedicado, ex.: `tenant_<cuid>`). Esta é a regra mais crítica de segurança do Gravity.

### Regras Absolutas

1. **Todo model Prisma** tem campo `id_organizacao String` obrigatório (mapeado no banco; ver convenção abaixo)
2. **Toda query** ao banco roda dentro de `withTenant`/`withTenantContext` do SDK `@gravity/tenant-resolver`
3. **Schema-per-Organização** ativo no PostgreSQL — `SET LOCAL search_path` por requisição
4. **Middleware do SDK** resolve a organização e expõe `req.organizacao.idOrganizacao` (API real do SDK — manter o nome)
5. Nenhum endpoint retorna dados de outra organização — mesmo para Master/Super Admin (que acessam por contexto explícito, sem `UsuarioWorkspace`)
6. Produtos NUNCA acessam banco de outro produto
7. Produtos NUNCA acessam banco do Configurador diretamente
8. Serviços por organização NUNCA importam código de outro serviço por organização
9. Comunicação entre serviços APENAS via REST API

### Índices Obrigatórios por Model

> **Convenção de nomenclatura (DDD REGRA 2 — paridade Prisma↔PG):** o campo Prisma é exatamente o nome da coluna PG. **`@map` em coluna é PROIBIDO.** O nome do model é PascalCase em PT-BR, com `@@map("snake_case")` apontando para a tabela PG. O `schema.prisma` em si é **intocável** (Mandamento 02) — alterações são feitas pelo Coordenador via fragments.

```prisma
model Recurso {
  id_recurso       String   @id @default(cuid())
  id_organizacao   String
  id_usuario       String?
  // ... campos
  data_criacao_recurso     DateTime @default(now())
  data_atualizacao_recurso DateTime @updatedAt

  @@index([id_organizacao])
  @@index([id_organizacao, id_produto])
  @@index([id_organizacao, id_usuario])
  @@map("recurso")
}
```

---

## Padrões de Código

### TypeScript Obrigatório

- Todo arquivo `.ts` ou `.tsx` — nenhum `.js`
- `strict: true` — sem `@ts-ignore`
- Sem `any` explícito
- ESModules (`import`/`export`) — nunca `require()`
- Imports via alias: `@nucleo/`, `@organização/`, `@produto/`

### Naming

| Contexto | Convenção | Exemplo |
|:---|:---|:---|
| Componentes React | PascalCase | `TabelaGlobal` |
| Hooks | camelCase com `use` | `useAuth` |
| Funções/variáveis | camelCase | `calcularImposto` |
| Constantes | UPPER_SNAKE_CASE | `API_URL` |
| Pastas | kebab-case | `nucleo-global` |
| Campos Prisma/payload | snake_case DDD | `id_organizacao`, `id_usuario`, `tipo_usuario` |
| Colunas PG (paridade Prisma↔PG) | snake_case DDD idêntico ao campo Prisma | `id_organizacao`, `id_usuario` (sem `@map` — DDD REGRA 2) |
| Tabelas PG (Model Prisma PascalCase) | snake_case via `@@map` | `model Pedido { … @@map("pedido") }` |
| Booleans | adjetivo PT-BR sem prefixo | `ativo`, `gravity_admin`, `excluido` (nunca `is_*`) |

### Segurança

- Toda rota tem validação Zod
- Erros via `AppError` — nunca `res.status().json()` direto
- Sem `console.log` com dados sensíveis
- Sem variáveis de ambiente hardcoded
- JWT validado em toda rota protegida
- `x-chave-interna` em toda chamada inter-serviço

---

## As 4 Ondas de Desenvolvimento

| Onda | O que constrói | Bloqueia |
|:---|:---|:---|
| **0 — Fundação** | Skeleton, Prisma base, RLS, Marketplace | Tudo da Onda 1 |
| **1 — Base** | Núcleo UI, Shell, Configurador | Tudo da Onda 2 |
| **2 — Serviços** | 9 organização + 3 produto + 1 template | Tudo da Onda 3 |
| **3 — Integração** | Proxy, Auth Flow, Produtos, DevOps | Plataforma completa |

**Regra:** Onda N+1 só inicia após Onda N validada.

---

## O Que o Dream Team de Produtos Precisa Saber

O Dream Team de Produtos (PM, SME, Data Analyst, Pesquisador, UX Researcher, Business Analyst, Designer, Tech Lead) trabalha **antes** do Dream Team de Tecnologia. Seu papel é:

1. **Descobrir** — O que construir e por quê
2. **Validar** — Regras de negócio, viabilidade técnica, demanda de mercado
3. **Especificar** — PRD, wireframes, telas, backlog priorizado
4. **Entregar** — Handoff completo para o time de tecnologia implementar

### Restrições para o Dream Team de Produtos

- Nunca propor telas que violem o design system Solid Slate
- Nunca propor funcionalidades que quebrem o isolamento de organização
- Nunca criar componentes visuais que já existam no nucleo-global
- Sempre considerar dark/light mode em toda proposta visual
- Sempre usar Lucide icons — nunca outra biblioteca
- Sempre usar Plus Jakarta Sans — nunca outra fonte
- Sempre respeitar a arquitetura de ondas ao planejar entregas

---

## Checklist — Antes de Iniciar Qualquer Trabalho

- [ ] Li esta skill e entendo o ecossistema Gravity?
- [ ] Sei qual design system usar (Solid Slate)?
- [ ] Sei que dark mode é o padrão?
- [ ] Sei que devo usar Lucide icons e Plus Jakarta Sans?
- [ ] Entendo o isolamento de organização (Schema-per-Organização) e o SDK `@gravity/tenant-resolver`?
- [ ] Sei que devo reutilizar componentes do nucleo-global?
- [ ] Entendo a arquitetura de ondas?
- [ ] Sei onde cada tipo de código/serviço vive no monorepo?
