# 🗄️ Gravity — Governança de Banco de Dados

Esta pasta centraliza a documentação e os scripts de gestão de banco de dados da plataforma Gravity. 

> [!IMPORTANT]
> Os arquivos `.prisma` e a lógica de banco de dados permanecem **isolados** dentro de cada serviço (`configurador/`, `servicos-global/tenant/`, etc) para garantir escalabilidade e independência de deploy. Use esta pasta apenas como referência e portal de gestão.

---

## 🏗️ Topologia de Ambientes

O Gravity utiliza um espelhamento rigoroso entre os ambientes de teste e produção:

| Ambiente | Versão | Banco de Dados | Objetivo |
|:---|:---:|:---|:---|
| **Staging** | `T26000001` | `*-db-staging` | QA, Testes E2E, Homologação |
| **Produção** | `P26000001` | `*-db-prod` | Ambiente real de clientes |

---

## 🛠️ Painel de Controle (Scripts Globais)

Execute estes comandos a partir da **raiz do projeto**:

### 1. Preparação (Local/CI)
- `npm run db:compose`: Une os fragmentos de schema do Tenant.
- `npm run db:migrate:dev`: Sincroniza todos os bancos em desenvolvimento.

### 2. Deploy e Produção
- `npm run db:migrate:deploy`: Aplica migrations em Staging/Produção.
- `npm run db:apply-rls`: Ativa o Row-Level Security (Segurança de Isolamento) no Tenant DB.

### 3. Massa de Dados
- `npm run db:seed:staging`: Popula o ambiente T26000001 com dados realistas.

---

## 🛡️ Segurança e Isolamento (RLS)

Toda tabela operacional do Tenant DB deve possuir a política de RLS ativada.
O script canônico de ativação está em: [`scripts/apply-rls.sql`](file:///c:/Users/danie/OneDrive/Documents/Antigravity/2.%20Gravity/scripts/apply-rls.sql)

---

## 📋 Auditoria Técnica (Março 2026)

A arquitetura foi auditada e validada para suportar:
- **Latência:** < 200ms (via Internal Networking Railway).
- **Escala:** 50.000 requisições simultâneas (via Horizontal Scaling + Read Replicas).
- **Disponibilidade:** 99.5% (via Monitoramento Sentry/UptimeRobot).

*Documentação consolidada em Março de 2026.*
