# Plano de Testes E2E — Configurador (Auth, Billing, Onboarding, Admin)

**Data:** 2026-03-22
**Versão:** 1.0
**Status:** aguardando aprovação do dono

---

## Escopo

**Dentro do escopo:**
- Onboarding de novos tenants (pós-checkout Stripe)
- Billing: checkout, planos, webhooks, faturas
- Autenticação de usuários via Clerk
- Controle de acesso: roles (`OWNER`, `ADMIN`, `MEMBER`, `VIEWER`)
- Memberships em empresas filhas
- Admin Panel exclusivo `gravity_admin`
- Endpoint `GET /api/internal/check-access` (S2S)

**Fora do escopo:**
- Testes de UI dos componentes React do Admin Panel (cobre apenas o fluxo do servidor)
- Testes de integração com Railway e variáveis de ambiente de produção
- NF-e (será coberto na Onda 4)

---

## Entidades testadas

| Módulo | Coberto pelo E2E |
|---|---|
| `POST /api/v1/tenants` | Criação de tenant no onboarding |
| `GET /api/v1/tenants/me` | Leitura de dados do tenant autenticado |
| `POST /api/v1/billing/checkout` | Geração de sessão de checkout Stripe |
| `GET /api/v1/billing/invoices` | Histórico de faturas |
| `POST /api/v1/users/invite` | Convite de usuário ao tenant |
| `GET /api/internal/check-access` | Autorização S2S (chamado por produtos) |
| Admin Panel (`/api/admin`) | Acesso restrito a `gravity_admin` |

---

## Categorias cobertas

- [x] CRUD (tenants, usuários, memberships)
- [x] Filtros e Busca (listagem de usuários)
- [x] Navegação e Layout (Admin Panel, roteamento por role)
- [x] Modais e Formulários (invite flow, onboarding)
- [x] Estados de Interface (loading, erros de auth)
- [x] Importação e Exportação (faturas PDF/CSV)
- [x] Autenticação e Autorização (Clerk, roles, `gravity_admin`)
- [x] Operações em Massa (gestão de permissões em lote)
- [x] Validação Visual (Percy — Admin Panel e telas de billing)
- [x] Testes específicos do produto (Configurador centraliza billing multi-produto)
- [x] Selects e Dropdowns (seleção de planos, filtro de usuários)

---

## Fluxos detalhados

### Fluxo 1 — Onboarding completo de novo tenant
**Categoria:** CRUD / Modais e Formulários
**Pré-condição:** usuário autenticado no Clerk sem tenant associado
**Passos:**
1. Acessar a URL de onboarding pós-checkout
2. Verificar que a rota `POST /api/v1/tenants` é chamada com os dados do Clerk
3. Verificar que o tenant é criado com `status: PENDING_SETUP`
4. Verificar que o usuário owner é registrado com `role: OWNER`
5. Verificar que a assinatura inicial é criada com `status: TRIALING`
6. Verificar que o slug está em formato lowercase alfanumérico
**Resultado esperado:** tenant criado, owner registrado, subscription ativa em trial
**Critério de falha:** tenant não criado, slug inválido, owner com role errado

---

### Fluxo 2 — Tentativa de criação de tenant com dados inválidos
**Categoria:** Validação
**Pré-condição:** cliente enviando dados malformados
**Passos:**
1. POST `/api/v1/tenants` com slug contendo espaços
2. Verificar resposta `400` com `code: VALIDATION_ERROR`
3. POST com email inválido no owner
4. Verificar `400` com `code: VALIDATION_ERROR`
5. POST sem campo `name`
6. Verificar `400` com `code: VALIDATION_ERROR`
**Resultado esperado:** todas as validações Zod retornam 400
**Critério de falha:** qualquer dado inválido passando na validação

---

### Fluxo 3 — Checkout Stripe e retorno de URL
**Categoria:** Importação e Exportação / Modais e Formulários
**Pré-condição:** tenant autenticado com `stripe_customer_id` configurado
**Passos:**
1. POST `/api/v1/billing/checkout` com `planKey: PROFESSIONAL`
2. Verificar que a resposta contém `url` (URL do Stripe Checkout)
3. Verificar que o `sessionId` está presente
4. POST com `planKey` inválido
5. Verificar `400` com `code: VALIDATION_ERROR`
**Resultado esperado:** URL de checkout válida para plano válido, 400 para plano inválido
**Critério de falha:** URL ausente, plano inválido aceito

---

### Fluxo 4 — Webhook Stripe — idempotência
**Categoria:** CRUD / Testes específicos do produto
**Pré-condição:** evento `customer.subscription.updated` do Stripe
**Passos:**
1. POST `/api/v1/billing/webhook` com assinatura Stripe válida
2. Verificar que o evento é processado e registrado em `StripeEvent`
3. Reenviar o mesmo evento (mesmo `id`)
4. Verificar que a resposta contém `cached: true`
5. Verificar que o evento não é processado novamente (sem side effects)
**Resultado esperado:** idempotência garantida
**Critério de falha:** evento processado duas vezes, estado duplicado

---

### Fluxo 5 — Webhook Stripe — assinatura inválida bloqueada
**Categoria:** Autenticação e Autorização
**Pré-condição:** servidor rodando com `STRIPE_WEBHOOK_SECRET` configurado
**Passos:**
1. POST `/api/v1/billing/webhook` sem header `stripe-signature`
2. Verificar resposta `400` com `code: VALIDATION_ERROR`
3. POST com assinatura inválida/falsificada
4. Verificar `400` com `code: INVALID_SIGNATURE`
**Resultado esperado:** webhooks sem assinatura válida rejeitados
**Critério de falha:** webhook sem assinatura aceito

---

### Fluxo 6 — Convite de usuário e prevenção de duplicatas
**Categoria:** CRUD / Modais e Formulários
**Pré-condição:** tenant ativo com 2 usuários criados
**Passos:**
1. POST `/api/v1/users/invite` com email não cadastrado
2. Verificar `201` com `message: "Convite enviado com sucesso"`
3. Verificar que o registro pendente foi criado no banco
4. POST `/api/v1/users/invite` com o mesmo email
5. Verificar `409` com `code: CONFLICT`
**Resultado esperado:** convite enviado uma vez, duplicata bloqueada
**Critério de falha:** usuário duplicado no banco, convite reenviado para existente

---

### Fluxo 7 — Isolamento cross-tenant em listagem de usuários
**Categoria:** Autenticação e Autorização
**Pré-condição:** dois tenants com usuários distintos
**Passos:**
1. Autenticar como usuário do Tenant A
2. GET `/api/v1/users`
3. Verificar que apenas usuários do Tenant A aparecem
4. Verificar que nenhum usuário do Tenant B está na resposta
**Resultado esperado:** isolamento total — zero vazamento cross-tenant
**Critério de falha:** qualquer dado de outro tenant retornado

---

### Fluxo 8 — Controle de acesso: rota admin sem gravity_admin
**Categoria:** Autenticação e Autorização
**Pré-condição:** usuário autenticado com role padrão (ADMIN do tenant, não gravity_admin)
**Passos:**
1. GET `/api/admin/tenants` com token de usuário normal
2. Verificar resposta `403` com `code: FORBIDDEN`
3. Sem token de autenticação
4. Verificar resposta `401` com `code: UNAUTHORIZED`
**Resultado esperado:** Admin Panel inacessível para não-admins da plataforma
**Critério de falha:** usuário normal acessando rotas de admin

---

### Fluxo 9 — check-access: cadeia completa de autorização S2S
**Categoria:** Testes específicos do produto / Autenticação e Autorização
**Pré-condição:** tenant ativo, produto `simulacusto` habilitado, usuário com permissão READ em `relatorios`
**Passos:**
1. GET `/api/internal/check-access?tenantId=T&userId=U&productKey=simulacusto`
   — sem `x-internal-key` → verificar `401`/`403`
2. Com `x-internal-key` válida
   → verificar `200` com `allowed: true`
3. Tenant suspenso
   → verificar `200` com `allowed: false, reason: TENANT_INACTIVE`
4. Produto desabilitado para o tenant
   → verificar `200` com `allowed: false, reason: PRODUCT_NOT_ENABLED`
5. Sem permissão granular para `action: MANAGE`
   → verificar `200` com `allowed: false, reason: PERMISSION_DENIED`
**Resultado esperado:** cada cenário retorna o reason correto
**Critério de falha:** acesso concedido quando deveria ser negado

---

### Fluxo 10 — Histórico de faturas
**Categoria:** Importação e Exportação
**Pré-condição:** tenant com `stripe_customer_id` e histórico de faturas
**Passos:**
1. GET `/api/v1/billing/invoices` autenticado
2. Verificar que a resposta contém array `invoices`
3. Verificar que cada invoice tem: `id`, `status`, `amount`, `currency`, `date`, `pdf`, `hostedUrl`
4. GET para tenant sem `stripe_customer_id`
5. Verificar array vazio `invoices: []`
**Resultado esperado:** faturas retornadas com todos os campos; vazio sem customer
**Critério de falha:** campos ausentes, erro 500 sem stripe_customer_id

---

### Fluxo 11 — Membership: habilitar usuário em empresa filha
**Categoria:** CRUD
**Pré-condição:** tenant com 1 empresa filha e 2 usuários
**Passos:**
1. POST `/api/v1/users/:id/memberships` com `companyId` e `role: MASTER`
2. Verificar `201` com membership criado
3. Repetir a mesma requisição (upsert)
4. Verificar que não há duplicata
5. POST com `companyId` de outro tenant
6. Verificar `404` com `code: NOT_FOUND`
7. POST com `userId` de outro tenant
8. Verificar `404` com `code: NOT_FOUND`
**Resultado esperado:** membership criado, cross-tenant bloqueado
**Critério de falha:** duplicata criada, dados cross-tenant acessíveis

---

### Fluxo 12 — Validação Visual (Percy) — Admin Panel
**Categoria:** Validação Visual (Percy)
**Snapshots obrigatórios:**
1. Lista de tenants — estado padrão (página 1)
2. Detalhe de tenant — dados completos
3. Detalhe de tenant — status SUSPENDED com badge laranja
4. Detalhe de tenant — assinatura em trial
5. Tela de listagem em dark mode (padrão)
6. Tela de listagem em light mode
7. Estado de loading (skeleton)
8. Estado sem tenants (empty state)
**Resultado esperado:** snapshots aprovados sem diff visual
**Critério de falha:** cores incorretas, layout quebrado, esquema de cores fora do Solid Slate

---

## Dados de teste necessários

| Dado | Formato | Quantidade |
|---|---|---|
| Tenant ativo | `{ id, name, slug, status: ACTIVE, stripe_customer_id }` | 2 |
| Tenant suspenso | `{ status: SUSPENDED }` | 1 |
| Usuários por tenant | `{ id, email, role }` | 3 por tenant |
| Empresa filha | `{ id, name, tenant_id }` | 1 por tenant |
| Produto habilitado | `ProductConfig { product_key: 'simulacusto', is_active: true }` | 1 |
| Evento Stripe simulado | `{ id, type: 'customer.subscription.updated', ... }` | 1 |

---

## Ambiente

Staging — nunca produção.

O Configurador requer:
- PostgreSQL (`CONFIGURADOR_DATABASE_URL`)
- Clerk (`CLERK_SECRET_KEY`, `CLERK_WEBHOOK_SECRET`)
- Stripe (`STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`)
- `INTERNAL_API_KEY` para rotas `/api/internal`

---

**Status: AGUARDANDO APROVAÇÃO DO DONO antes da criação dos specs e execução.**
