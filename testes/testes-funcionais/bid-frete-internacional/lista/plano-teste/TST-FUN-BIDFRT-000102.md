# Plano — TST-FUN-BIDFRT-000102

**ID:** TST-FUN-BIDFRT-000102

> O modal Admin («O que será testado») agrupa os passos pelos títulos ### ETAPA … abaixo. **Não remover** essa estrutura.

**Objetivo geral:** validar rotas de duplicação e exclusão em lote da lista BID Frete Internacional.

---

## Roteiro de execução

### ETAPA 1 — Exclusões cotação

| Passo | Ação | APROVADO quando |
|-------|------|-----------------|
| **F01** | POST preview com ids válidos | retorna permitidas/bloqueadas |
| **F02** | POST preview com id inexistente | HTTP 404 `NOT_FOUND` |
| **F03** | POST confirmar exclui permitidas | persistência + histórico |

### ETAPA 2 — Exclusões BID

| Passo | Ação | APROVADO quando |
|-------|------|-----------------|
| **F04** | POST preview BID com id fantasma | HTTP 404 `NOT_FOUND` |
| **F05** | POST confirmar BID permitido | BID e cotações filhas removidos |
