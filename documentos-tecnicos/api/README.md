# Documentação de APIs — Gravity Platform 🔗

A arquitetura de APIs do Gravity segue o modelo de **Dupla Cadeia** para garantir segurança total e separação de preocupações.

---

## 1. Cockpit Admin API (Cadeia 1)
API global e restrita para a gestão da **Plataforma Gravity**.

- **Acesso:** Apenas roles `SUPER_ADMIN` e `ADMIN`.
- **Escopo:**
    - Listar todos os Tenants.
    - Provisionar novos ambientes.
    - Gestão de Faturamento (Stripe Sync).
    - Logs de Auditoria Global (Cross-tenant logs).
- **Service:** Localizado em `servicos-global/configurador` (rotas de admin).

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
