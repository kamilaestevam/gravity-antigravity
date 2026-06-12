# Plano — AlertEngine

**ID:** TST-UNI-TENANT-000003

> O modal Admin («O que será testado») agrupa os passos pelos títulos `### ETAPA …` abaixo. **Não remover** essa estrutura.

**Objetivo geral:** AlertEngine

---

## Roteiro de execução

### ETAPA 1 — AlertEngine

| Passo | Ação | APROVADO quando |
|-------|------|-----------------|
| **C1** | TST-UNI-TENANT-000003: regras vazias → resolve sem criar nenhum evento | asserções passam |
| **C2** | TST-UNI-TENANT-000003-002: 1 regra ativa sem threshold → eventoAlerta criado e dispatch chamado | asserções passam |
| **C3** | TST-UNI-TENANT-000003-003: busca inclui regras globais (tenant_id null) via OR | asserções passam |
| **C4** | TST-UNI-TENANT-000003-004: rule=null → retorna sem criar evento | asserções passam |
| **C5** | TST-UNI-TENANT-000003-005: actor_type filter não bate com o log → sem evento criado | asserções passam |
| **C6** | TST-UNI-TENANT-000003-006: action filter não bate com o log → sem evento criado | asserções passam |
| **C7** | TST-UNI-TENANT-000003-007: sem threshold → evento criado com AlertaStatus.PENDENTE e audit_log_ids=[logId] | asserções passam |
| **C8** | TST-UNI-TENANT-000003-008: sem threshold → actor_type castado para AcaoExecutadaPor.USUARIO no evento | asserções passam |
| **C9** | TST-UNI-TENANT-000003-009: com threshold, count < mínimo → sem evento e sem dispatch | asserções passam |
| **C10** | TST-UNI-TENANT-000003-010: com threshold, count >= mínimo → evento criado com AlertaStatus.PENDENTE | asserções passam |

