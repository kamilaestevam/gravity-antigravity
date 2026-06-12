# Plano — securityAudit

**ID:** TST-UNI-TENANT-000004

> O modal Admin («O que será testado») agrupa os passos pelos títulos `### ETAPA …` abaixo. **Não remover** essa estrutura.

**Objetivo geral:** securityAudit

---

## Roteiro de execução

### ETAPA 1 — securityAudit

| Passo | Ação | APROVADO quando |
|-------|------|-----------------|
| **C1** | TST-UNI-TENANT-000004: permissionChanged → AuditService.log com actor_type=AcaoExecutadaPor.USUARIO | asserções passam |
| **C2** | TST-UNI-TENANT-000004-002: rateLimitHit → AuditService.log com actor_type=AcaoExecutadaPor.INTEGRACAO | asserções passam |
| **C3** | t-1 | asserções passam |
| **C4** | TST-UNI-TENANT-000004-003: apiKeyUsed → AuditService.log com actor_type=AcaoExecutadaPor.API | asserções passam |
| **C5** | TST-UNI-TENANT-000004-004: webhookSignatureFailure → AuditService.log com actor_type=AcaoExecutadaPor.INTEGRACAO | asserções passam |
| **C6** | TST-UNI-TENANT-000004-005: crossTenantAttempt com blocked=true → status=EventoStatus.FALHA | asserções passam |
| **C7** | TST-UNI-TENANT-000004-006: authFailure sem blocked → status=EventoStatus.SUCESSO | asserções passam |
| **C8** | TST-UNI-TENANT-000004-007: dataDeleted → actor_type=AcaoExecutadaPor.USUARIO e module=admin | asserções passam |
| **C9** | TST-UNI-TENANT-000004-008: sem CONFIGURADOR_URL (env não definido) → fetch não é chamado | asserções passam |

