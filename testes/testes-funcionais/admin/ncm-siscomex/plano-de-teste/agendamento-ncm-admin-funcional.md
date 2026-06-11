# Plano Funcional — Agendamento NCM Admin

**ID:** TST-FUN-AGENDAMENTO-NCM-ADMIN-000097  
**Escopo:** `testes/testes-funcionais/admin/ncm-siscomex/plano-de-teste/`  
**Rotas:**  
- Configurador proxy: `PUT/GET /api/v1/admin/integracao-ncm/agendamento`  
- Cadastros S2S: `PUT/GET /api/v1/cadastros/admin/ncm-sync/agendamento`

## Objetivo

Happy path de leitura/gravação, validação Zod, restrição SUPER_ADMIN no PUT (proxy), upsert singleton `default` no Cadastros, **round-trip PUT→GET** (persistência real).

## Matriz

| # | Cenário | HTTP |
|---|---------|------|
| F1 | GET agendamento (proxy) repassa Cadastros | 200 |
| F2 | PUT SUPER_ADMIN persiste e repassa body | 200 |
| F3 | PUT ADMIN (não super) bloqueado no proxy | 403 |
| F4 | PUT body inválido (cadastros) | 400 |
| F5 | GET cadastros sem registro → defaults | 200 |
| F6 | PUT cadastros upsert cria registro default | 200 |
| F7 | GET após PUT retorna valores persistidos | 200 |
| F8 | **Round-trip PUT→GET** (mesmo mock in-memory) | 200 |
| F9 | **Round-trip proxy PUT→GET** (fetch mock stateful) | 200 |
