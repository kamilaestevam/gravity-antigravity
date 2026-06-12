# Plano — TST-CRO-BIDFRT-000104

**ID:** TST-CRO-BIDFRT-000104

> O modal Admin («O que será testado») agrupa os passos pelos títulos ### ETAPA … abaixo. **Não remover** essa estrutura.

**Objetivo geral:** garantir isolamento cross-organização nas rotas de exclusão da lista BID Frete Internacional.

---

## Roteiro de execução

### ETAPA 1 — Isolamento tenant

| Passo | Ação | APROVADO quando |
|-------|------|-----------------|
| **C01** | Preview/confirmar com id de outra organização | HTTP 404 — registro não encontrado no tenant |
| **C02** | Exclusão só afeta ids do tenant autenticado | dados da org B intactos |
