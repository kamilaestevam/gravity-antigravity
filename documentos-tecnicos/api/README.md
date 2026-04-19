# Documentação de APIs — Gravity Platform 🔗

A arquitetura de APIs do Gravity segue o modelo de **Dupla Cadeia** para garantir segurança total e separação de preocupações.

---

## 1. Cockpit Admin API (Cadeia 1)
API global e restrita para a gestão da **Plataforma Gravity**.

- **Acesso:** Apenas roles `SUPER_ADMIN` e `ADMIN`.
- **Service:** Localizado em `servicos-global/configurador/server/routes/admin.ts`.

### Rotas de Tenants (Organizações)

| Método | Path | Descrição |
|--------|------|-----------|
| `GET` | `/api/admin/tenants` | Lista todos os tenants com paginação, busca e companies aninhadas (inclui `_count.memberships` por company) |
| `GET` | `/api/admin/tenants/:id` | Detalhe completo de um tenant (users, companies, subscriptions, product_configs) |
| `POST` | `/api/admin/tenants` | Cria nova organização — campos: `name`, `slug`, `plano?`, `cnpj?` |
| `PATCH` | `/api/admin/tenants/:id` | Atualiza organização — aceita `status`, `name` e/ou `slug` |
| `PATCH` | `/api/admin/workspaces/:id` | Atualiza status de um workspace — aceita `status: ACTIVE \| INACTIVE` |
| `GET` | `/api/admin/stats` | Totais globais: tenants, users (workspaces calculados client-side via `_count.companies`) |

### Demais Escopos

- Gestão de Faturamento (Stripe Sync) — `GET/POST /api/admin/financeiro-admin/invoices`
- Logs de Auditoria Global (Cross-tenant) — via `AuditService` em todas as rotas de mutação
- Provisionar novos ambientes — via `POST /api/admin/tenants`
- Usuários globais — `GET /api/admin/usuarios-globais`
- Deploys — `GET/POST /api/admin/deploy`

---

## 2. API do Configurador (Cadeia 2)
API focada na **Organização** (Tenant). É o ponto de entrada para o auto-atendimento.

- **Acesso:** Roles `MASTER`, `STANDARD` e `SUPPLIER`.
- **Escopo:**
    - Gerenciar usuários do workspace.
    - Ativar/Desativar módulos (Marketplace Sync).
    - Configurar preferências de branding e notificações.
    - Integrar com ERPs externos (via API-Cockpit).
- **Service:** Localizado em `servicos-global/configurador`.

---

## 🔐 Segurança e Auth
- **Auth Provider:** Clerk (JWT Propagation).
- **Internal S2S:** Protegido via `INTERNAL_SERVICE_KEY`.
- **Isolamento:** O `tenant_id` é propagado em todos os headers e validado no banco via RLS.
