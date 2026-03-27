# Governança de Banco de Dados — Gravity Platform 🏛️

Este documento consolida a arquitetura, segurança e topologia live dos bancos de dados.

---

## 🚀 Status dos GAPs de Infraestrutura (Hardening)

| GAP | Descrição | Status | Resolução |
|:---:|:---|:---:|:---|
| **GAP 1** | Paridade de Schema T/P | ✅ **Resolvido** | [deploy.yml](../../.github/workflows/deploy.yml) |
| **GAP 2** | Row-Level Security (RLS) | ✅ **Resolvido** | [apply-rls.sql](../../scripts/apply-rls.sql) |
| **GAP 3** | Roles Canônicas (MASTER/STANDARD) | ✅ **Resolvido** | Refatoração de Código e Schema |
| **GAP 4** | Variáveis de Ambiente | ✅ **Resolvido** | .env.example em todos os módulos |

---

## 🗺️ Topologia Live (Railway)

### Ambiente Teste (T26000001)
- **Configurador DB:** `gondola.proxy.rlwy.net:57584`
- **Tenant DB:** `gondola.proxy.rlwy.net:24197`

### Ambiente Produção (P26000001)
- **Configurador DB:** `gondola.proxy.rlwy.net:59644`
- **Tenant DB:** `gondola.proxy.rlwy.net:16984`

---

## 🔐 Camadas de Isolamento
1.  **Middleware:** Injeção automática de `tenant_id` via Prisma Extension.
2.  **DB Security:** Ativado via SQL (`scripts/apply-rls.sql`) nas tabelas críticas. Bloqueia leitura/escrita se o contexto do tenant não for válido.

---

## 🛠️ Comandos Globais
- `npm run db:migrate:dev`: Sincroniza schemas locais com os bancos.
- `npm run db:apply-rls`: Reaplica a blindagem de segurança.
- `npm run db:seed:staging`: Popula o ambiente de Teste com massa de dados.
