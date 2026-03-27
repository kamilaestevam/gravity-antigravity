# Governança e Auditoria de Banco de Dados — Gravity Platform v3.0 🏛️

Este documento é a **Fonte Única de Verdade (SSOT)** para a arquitetura, segurança e governança dos bancos de dados da plataforma Gravity. Ele consolida a auditoria técnica realizada para garantir escalabilidade (50k reqs) e disponibilidade (99,5%).

---

## 🚀 Status dos GAPs de Infraestrutura (Hardening)

| GAP | Descrição | Status | Resolução |
|:---:|:---|:---:|:---|
| **GAP 1** | Paridade de Schema T26000001 / P26000001 | ✅ **Resolvido** | [deploy.yml](file:///c:/Users/danie/OneDrive/Documents/Antigravity/2.%20Gravity/.github/workflows/deploy.yml) (Job: `schema-parity-gate`) |
| **GAP 2** | Row-Level Security (RLS) para Isolamento | ✅ **Resolvido** | [apply-rls.sql](file:///c:/Users/danie/OneDrive/Documents/Antigravity/2.%20Gravity/scripts/apply-rls.sql) |
| **GAP 3** | Unificação de Roles e Permissões Canônicas | ✅ **Resolvido** | [schema.prisma](file:///c:/Users/danie/OneDrive/Documents/Antigravity/2.%20Gravity/configurador/prisma/schema.prisma) + Refatoração de Código |
| **GAP 4** | Padronização de Variáveis de Ambiente | ✅ **Resolvido** | Arquivos `.env.example` em todos os módulos |

---

## 🏛️ Topologia de Dados

A arquitetura utiliza o padrão de **Isolamento Híbrido**:

1.  **Configurador DB:** Gerencia Tenants, Assinaturas, Configurações Globais e Usuários de Sistema.
2.  **Tenant DB:** Armazena dados operacionais de cada cliente (Empresas, Contatos, Atividades).
3.  **Cross-Tenant Isolation:**
    *   **Camada 1 (App):** Middleware Prisma injeta `tenant_id` automaticamente.
    *   **Camada 2 (DB):** Row-Level Security (RLS) bloqueia qualquer acesso fora do contexto do tenant.

---

## 🛠️ Comandos de Governança (Raiz)

Para facilitar a gestão multi-banco, utilize os comandos centralizados no `package.json` da raiz:

*   `npm run db:migrate:dev`: Aplica migrations em todos os ambientes de desenvolvimento.
*   `npm run db:apply-rls`: Executa o script de segurança RLS no banco Tenant.
*   `npm run db:seed:staging`: Popula o ambiente T26000001 com dados realistas para teste.

---

## 📋 Auditoria Técnica Detalhada

### ✅ Itens 100% Homologados
- Separação física Configurador vs Tenant.
- Obrigatoriedade de `tenant_id` em todos os models operacionais.
- Índices de performance validados para alta concorrência.
- Pipeline de deploy com gate de segurança manual.

### 🔴 Resolução GAP 1 — Espelhamento T/P
O pipeline de CI agora possui um job que compara o número de migrations aplicadas em Staging (`T26000001`) e Produção (`P26000001`). O deploy para produção é **bloqueado automaticamente** se houver divergência de schema.

### 🔴 Resolução GAP 2 — Camada de Defesa RLS
Implementamos o script SQL puro que ativa o RLS em 24 tabelas críticas. Isso garante que, mesmo que o código da aplicação tenha um erro, o banco de dados impedirá o vazamento de dados entre clientes.

### 🔴 Resolução GAP 3 — Roles Canônicas
O sistema foi migrado para os roles oficiais:
- `SUPER_ADMIN` / `ADMIN`: Gestão interna Gravity.
- `MASTER`: Dono do Tenant (ex-Owner).
- `STANDARD`: Usuário operacional (ex-Member).
- `SUPPLIER`: Fornecedor externo.

---

**Última atualização:** Março 2026
**Responsável:** Antigravity AI Toolkit
