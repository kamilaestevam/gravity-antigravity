# Governança de Banco de Dados — Gravity Platform 🏛️

Este documento consolida a arquitetura, segurança e topologia live dos bancos de dados. Com a conclusão do **Hardening 2026**, a plataforma opera exclusivamente sobre bases isoladas no Railway.

---

## 🚀 Status dos GAPs de Infraestrutura (Hardening)

| GAP | Descrição | Status | Resolução |
|:---:|:---|:---:|:---|
| **GAP 1** | Paridade de Schema T/P | ✅ **Resolvido** | [deploy.yml](../../.github/workflows/deploy.yml) |
| **GAP 2** | Row-Level Security (RLS) | ✅ **Resolvido** | [apply-rls.sql](../../scripts/apply-rls.sql) |
| **GAP 3** | Roles Canônicas | ✅ **Resolvido** | Refatoração de Código e Schema |
| **GAP 4** | Variáveis de Ambiente | ✅ **Resolvido** | Padronização em todos os módulos |
| **GAP 5** | Isolamento de Drivers | ✅ **Resolvido** | Geração do Prisma em `/generated` |

---

## 🗺️ Topologia Live do Ecossistema (Railway)

O ecossistema Gravity roda em regime de paridade total entre Staging e Produção.

### 🧪 Cluster: Staging (T26_STAGING)
- **Configurador DB:** `gondola.proxy.rlwy.net:57584` (Ambiente: `gravity-configurador-teste`)
- **Serviços DB:** `monorail.proxy.rlwy.net:45890` (Ambiente: `gravity-servicos-teste`)
- **Finalidade:** Testes de integração, regressão e validação de massa de dados Alpha/Beta.

### 💎 Cluster: Produção (P26_PRODUCTION)
- **Configurador DB:** `gondola.proxy.rlwy.net:59644` (Ambiente: `gravity-configurador-producao`)
- **Serviços DB:** `monorail.proxy.rlwy.net:16383` (Ambiente: `gravity-servicos-producao`)
- **Finalidade:** Tráfego real de clientes e processamento oficial.

---

## 🔐 Camadas de Blindagem e Isolamento

Para garantir a paridade **SaaS Multi-tenant**, aplicamos três camadas de proteção:

1.  **Isolamento de Drivers (Prisma):** Cada schema (`configurador` e `tenant`) gera seu próprio driver isolado na pasta `/generated`. Isso evita que os tipos TypeScript se cruzem durante o desenvolvimento.
2.  **DB Security (RLS):** Ativado em **41 tabelas críticas**. O banco de dados recusa qualquer `SELECT` ou `INSERT` que não possua o `tenant_id` correto no cabeçalho da transação.
3.  **Middleware (App):** Injeção automática de filtros através das Prisma Extensions em cada serviço.

---

## 🛠️ Comandos de Manutenção (Modo Admin)
- `npm run db:migrate:dev`: Sincroniza schemas locais com os bancos do Railway.
- `npm run db:apply-rls`: Reaplica a blindagem de segurança SQL (Deve ser rodado após novas tabelas).
- `npm run db:seed:staging`: Povoa o ambiente de Teste com massa de dados representativa.

---
**Última Atualização:** 28 de Março de 2026  
**Auditor Responsável:** Antigravity AI (Hardening Squad)
