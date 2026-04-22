---
name: antigravity-definition-of-done
description: "Use esta skill para validar se uma entrega está realmente pronta. Define o checklist universal que toda tarefa deve passar antes de ser considerada concluída. Consultada pelo Líder Técnico, QA e Líder do Projeto ao avaliar entregas."
---

# Gravity — Definition of Done

## Regra Fundamental

Uma tarefa só está "Done" quando **todos** os critérios abaixo são atendidos. "Funciona na minha máquina" não é Done. Código sem teste não é Done. Código sem revisão não é Done.

---

## Checklist Universal — Todo Código

### 1. Código

- [ ] TypeScript strict, sem `any`, sem `@ts-ignore`
- [ ] Imports via aliases (`@nucleo/`, `@tenant/`, `@produto/`)
- [ ] Funções com menos de 50 linhas
- [ ] Nenhum código comentado ou morto
- [ ] Nenhum `console.log` com dados sensíveis
- [ ] Nenhuma variável de ambiente hardcoded
- [ ] Erros via `AppError`, nunca `res.status().json()` direto

### 2. Segurança

- [ ] Validação Zod em toda rota (Mandamento 06)
- [ ] Em produtos Schema-per-Organização: acesso via `withTenant`/`withTenantContext`; em Configurador (`public`): `id_organizacao` filtrado em toda query
- [ ] `x-internal-key` em toda chamada inter-serviço
- [ ] JWT do Clerk validado independentemente em cada serviço (Clerk é APENAS autenticação — Mandamento 01)
- [ ] Autorização SEMPRE via Prisma/`/api/v1/me` — **nunca** via `publicMetadata.role` do Clerk (Mandamento 01)
- [ ] Sem fallback silencioso em autorização (Mandamento 08)
- [ ] Nenhum dado sensível em logs ou responses

### 3. Testes

- [ ] Testes unitários criados (cobertura ≥ 70%, nucleo ≥ 80%)
- [ ] Testes funcionais criados para rotas
- [ ] Teste de cross-tenant implementado (serviços tenant)
- [ ] Todos os testes passam sem warnings
- [ ] Nenhum `describe.skip` ou `it.skip` sem justificativa

### 4. Revisão

- [ ] QA revisou com checklist completo (6 categorias)
- [ ] Code review aprovado pelo Líder Técnico
- [ ] Nenhuma regressão nos testes existentes

### 5. Integração

- [ ] Health check implementado (servidores novos)
- [ ] Correlation ID propagado em chamadas S2S
- [ ] Endpoints com prefixo `/api/v1/`
- [ ] Schema Zod exportado como contrato de API

### 6. Documentação e Skills (INVIOLÁVEL)

A entrega não está Done se a base de conhecimento ficou para trás. Esta categoria é tão obrigatória quanto código e testes.

- [ ] **`documentos-tecnicos/` atualizado** — diagramas, ADRs, contratos de API e README de arquitetura 100% fiéis ao código entregue
- [ ] **Skills refatoradas** — toda skill em `skills/` que cite o comportamento antigo foi reescrita para refletir o novo padrão (autorização e obrigação permanentes — não exige aprovação caso a caso)
- [ ] **Skills novas criadas** quando surgir necessidade de papel/regra que ainda não existe (linter, runbook, DR, etc.)
- [ ] Em PR, listar explicitamente arquivos de `documentos-tecnicos/` e `skills/` tocados — lista vazia exige justificativa explícita
- [ ] `.env.example` atualizado se variável nova
- [ ] Commit message descritiva

> **Regra:** o código só está pronto quando o time inteiro (através das docs e skills atualizadas) aprender o novo padrão.

### 7. Isolamento de Organização (após pivô Schema-per-Organização — ADR-001/002)

Para qualquer toque em backend de produto:

- [ ] Acesso ao banco **exclusivamente** via `withTenant(req, async (rawDb) => ...)` do `@gravity/tenant-resolver` (API real do SDK)
- [ ] Zero `import { PrismaClient } from '@prisma/client'` fora do SDK (linter CI bloqueia)
- [ ] Zero `WHERE id_organizacao` em queries de produto (modelo antigo morto — o schema **é** a organização)
- [ ] Chaves de cache prefixadas com `org:<idOrganizacao>:` ou `org:_global:` (com justificativa)
- [ ] Teste E2E de cross-organização rodando e passando

---

## Critérios Adicionais por Tipo

### Frontend

- [ ] Responsivo nos 3 breakpoints (mobile, tablet, desktop)
- [ ] Acessibilidade básica (tab navigation, aria-labels, contraste)
- [ ] Estados tratados (loading, error, empty, filled)
- [ ] Notificações via shell (`addNotification`)

### Backend

- [ ] Rate limiting considerado (se rota pública)
- [ ] Retry com backoff para chamadas cross-boundary
- [ ] Idempotência em ações que podem ser retentadas
- [ ] Rota bulk (`ids[]`)? → `detectarTiposMistos` aplicado no /preview e /confirmar, ou justificativa documentada no código

### Migration

- [ ] Backup manual antes de migration destrutiva
- [ ] Migration testada em staging
- [ ] Plano de rollback documentado

---

## Fluxo de Validação

```
Dev entrega → QA revisa (checklist acima) → Aprovado?
  → SIM: Líder notificado, merge habilitado
  → NÃO: Volta para o dev com lista de itens faltantes
```

> **Regra:** QA nunca aprova parcialmente. Ou está Done, ou não está.

---

## O Que NÃO Conta como Done

- "Está funcionando" sem testes
- "Falta só o teste E2E" (E2E é bônus, unitário+funcional é obrigatório)
- "Vou ajustar depois" — ajustar antes
- "O design mudou" — realinhar com UX e atualizar
- Código mergeado sem revisão
