# Plano — TST-FUN-BIDFRT-000119

**ID:** TST-FUN-BIDFRT-000119

**Objetivo:** POST `/cotacoes` aceita porto Cadastros sem lat/long (regressão TASK-000405).

| Passo | Ação | APROVADO quando |
|-------|------|-----------------|
| **F01** | POST AEJEA → BRAAR (FCL) | 201 + snapshot origem AEJEA |
| **F02** | POST origem ZZZZZ | 400 VALIDATION_ERROR origem_codigo |
