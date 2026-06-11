# Plano Unitário — Agendamento NCM Admin

**ID:** TST-UNI-AGENDAMENTO-NCM-ADMIN-000096  
**Escopo:** `testes/testes-unitarios/admin/ncm-siscomex/plano-de-teste/`  
**Infra SSOT:** `testes/infra/admin/agendamento-ncm-admin.ts`  
**Código-fonte:** `ModalNcmAgendamentoSincronizacao.tsx`, `adminNcmSync.ts` (SaveScheduleSchema)

## Objetivo

Validar conversão cron ↔ UI, contratos Zod do payload PUT `/agendamento` e parsing da resposta GET.

## Matriz de cenários

| # | Cenário | Esperado |
|---|---------|----------|
| U1 | cron `00 02 * * *` → hora/minuto | `02h`, `00min`, Diario |
| U2 | cron `30 14 * * 1` → frequência | Semanal |
| U3 | cron inválido | fallback 02h/00min |
| U4 | horaMinutoCron Diario 03h 15min | `15 03 * * *` |
| U5 | horaMinutoCron Semanal | `00 02 * * 1` |
| U6 | saveSchedule payload válido | parse OK |
| U7 | saveSchedule cron curto | parse fail |
| U8 | notificador sem nome | parse fail |
| U9 | GET response schema | parse OK |
| U10 | PUT response schema | parse OK |
