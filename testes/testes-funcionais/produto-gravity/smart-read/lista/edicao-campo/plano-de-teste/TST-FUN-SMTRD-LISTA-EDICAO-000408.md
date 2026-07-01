# TST-FUN-SMTRD-LISTA-EDICAO-000408

PATCH `/api/v1/smart-read/leituras/:id_leitura/campo-documento` — edição inline na lista.

## Casos

1. `200` + `documentos_atualizados` quando body válido (`numeros_documento`).
2. Rejeita `campo_coluna` fora da allowlist antes do serviço (HTTP 400).

Spec: `TST-FUN-SMTRD-LISTA-EDICAO-000408.test.ts`
