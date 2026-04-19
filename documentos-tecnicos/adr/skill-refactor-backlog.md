# Skill Refactor Backlog — Pivô Schema-per-Tenant

**Status:** Em execução (S0 → S5)
**Origem:** Diretriz operacional 2026-04-17 — toda entrega obrigatoriamente atualiza docs e skills (ver `gestao/definition-of-done` §6).
**Objetivo:** Garantir que nenhuma das 57 skills do Dream Team referencie o modelo antigo (`WHERE tenant_id` + RLS) após o cutover.

---

## Critério de Triagem

| Categoria | Definição | Ação |
|---|---|---|
| 🔴 **CRÍTICA** | Skill descreve diretamente o modelo de isolamento, queries, ou padrão de acesso ao banco | Reescrever no Sprint correspondente, antes do cutover |
| 🟡 **TOCAR** | Skill menciona `tenant_id` em passagem; precisa de revisão de seção | Atualizar seção afetada; manter o resto |
| 🟢 **OK** | Skill menciona apenas conceitualmente "tenant" como fronteira de dado, sem padrão técnico | Sem ação — revisar ao final só por garantia |

---

## 🔴 Críticas — Reescrita Obrigatória

| Skill | Sprint | Motivo |
|---|---|---|
| `arquitetura/tenant-isolation` | **S0** ✅ Reescrita | A regra-mãe; descrevia `$extends` + RLS |
| `arquitetura/tier1-security` | S0 | Dependente de tenant-isolation |
| `arquitetura/schema-composition` | S0 | Composição via `compose-tenant-schema.ts` muda — agora é multi-schema por banco |
| `arquitetura/servicos-tenant` | S1 | Padrão de criação de serviço tenant precisa adotar SDK |
| `governanca/code-standards` | S0 | Regra "todo model tem `tenant_id`" muda para "models de produto não têm `tenant_id`" |
| `governanca/agent-policy` | S0 | Regras invioláveis precisam refletir SDK obrigatório |
| `infra-estrutura/database-operations` | S1 | Migrations agora rodam em N schemas; backup/restore por schema |
| `infra-estrutura/criar-produto` | S2 | Template de novo produto inclui SDK desde o nascimento |
| `seguranca/seguranca-5-camadas` | S0 | Camada 4 (Isolamento) muda completamente |
| `seguranca/cross-boundary` | S1 | Padrão de chamada cross-banco usa SDK |
| `agentes/qa` | S0 | Checklist de revisão precisa cobrir o novo padrão |
| `agentes/coordenador` | S0 | Composição de schema é por produto, não global |
| `gestao/code-review` | S0 | Checklist de PR muda |
| `gestao/definition-of-done` | **S0** ✅ Atualizada | Adicionou §6 (docs+skills) e §7 (tenant isolation) |
| `arquitetura/testes` | S1 | Padrão de teste cross-tenant muda — agora `withTenantContext` |

---

## 🟡 Tocar — Atualização Pontual

| Skill | Sprint | Seção a atualizar |
|---|---|---|
| `arquitetura/observabilidade` | S1 | Métricas do SDK + spans OTel |
| `arquitetura/caching-strategy` | S1 | Regra de prefixo `tenant:<id>:` obrigatório |
| `arquitetura/contract-testing` | S1 | Schemas Zod do `/api/me` e eventos do Event Bus |
| `seguranca/permissoes` | S1 | Roles agora vêm do `/api/me`, não do Clerk metadata |
| `seguranca/sla-performance` | S2 | Overhead `SET LOCAL` ~0.3ms p95 contabilizado no budget |
| `seguranca/rate-limiting` | S2 | Chave de rate limit prefixada por tenant |
| `seguranca/pentest` | S2 | Cenário de pentest novo: tentar burlar o `withTenant` |
| `infra-estrutura/admin` | S2 | Painel de Segurança ganha aba "Schemas" e "Eventos" |
| `infra-estrutura/api-cockpit` | S2 | Tokens de API resolvem tenant via SDK |
| `governanca/visao-geral` | S0 | Diagrama de arquitetura |
| `governanca/deploy` | S2 | Migration agora é "deploy + migrate-all-tenants" |
| `produtos/pedido` | S4 | Refatoração do produto Pedido para usar SDK |
| `produtos/lpco` | S4 | Idem |
| `produtos/nf-importacao` | S4 | Idem |
| `produtos/simulacusto` | S4 | Idem |
| `dream-team-pedido` | S4 | Idem |
| `dream-team-detetive-tela` | S2 | Adicionar checagem de uso do SDK |
| `servicos/historico` | S4 | Histórico em schema-per-tenant; backfill de logs |
| `servicos/email`, `gabi`, `notificacoes`, `whatsapp`, `relatorios`, `cronometro`, `conector-erp` | S4 | Cada serviço migrado adota SDK |
| `dream-team-produtos/00-projeto-gravity` | S0 | Princípios atualizados |
| `dream-team-produtos/08-agente-tech-lead` | S0 | Decisões técnicas refletem novo padrão |
| `dream-team-produtos/10-entregaveis-handoff` | S0 | Pacote de handoff inclui SDK desde o início |

---

## 🟢 OK — Revisar ao Final

| Skill | Por quê |
|---|---|
| `gestao/onboarding-produto` | Menciona "tenant" só conceitualmente |
| `dream-team-tecnologia/README` | Menciona como conceito |

---

## ➕ Skills Novas a Criar

| Skill nova | Sprint | Motivo |
|---|---|---|
| `arquitetura/sdk-tenant-resolver` | S1 | Como consumir o SDK; padrões; armadilhas; exemplos |
| `seguranca/lint-tenant-safety` | S1 | Regra ESLint custom + script CI; como adicionar novas regras |
| `infra-estrutura/schema-orchestration` | S2 | Como rodar migrations em N schemas; troubleshooting |
| `infra-estrutura/dr-per-tenant` | S2 | Backup, restore e LGPD por tenant via `pg_dump`/`DROP SCHEMA` |
| `arquitetura/event-bus` | S2 | Contratos `TenantProvisioned`, `TenantUpdated`, `UserDeletionRequested`; DLQ |

---

## Auditoria de Saída — Critério de Sucesso da Onda

Ao final de S5:
- `grep -rE "WHERE tenant_id|withTenantIsolation|prisma\.\$extends" skills/` retorna **zero** matches em skills marcadas críticas/tocar.
- `grep -rE "import.*PrismaClient.*@prisma/client" produto/ servicos-global/tenant/ | grep -v packages/tenant-resolver` retorna **zero** matches.
- Toda skill da seção "Reescrita Obrigatória" tem timestamp de modificação posterior à entrega do SDK 1.0.0.
