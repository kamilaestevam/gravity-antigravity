# Plano Cross-organização — Agendamento NCM Admin

**ID:** TST-CRO-AGENDAMENTO-NCM-ADMIN-000099  
**Escopo:** singleton global `ncm_sync_agendamento` (sem `id_organizacao`)

## Objetivo

O agendamento NCM é **catálogo global** — uma única linha `id='default'` no Cadastros. Admins de organizações diferentes leem e (se SUPER_ADMIN) gravam a **mesma** configuração. Não há isolamento por org (by design).

## Matriz

| # | Cenário | Esperado |
|---|---------|----------|
| C1 | SUPER_ADMIN org A grava cron X | upsert where id=default |
| C2 | SUPER_ADMIN org B lê mesmo cron X | GET global |
| C3 | upsert nunca recebe id_organizacao | sem vazamento tenant |
| C4 | Dois PUTs sequenciais sobrescrevem singleton | último valor vence |
