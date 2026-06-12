# Plano — TST-UNI-BIDFRT-000101

**ID:** TST-UNI-BIDFRT-000101

> O modal Admin («O que será testado») agrupa os passos pelos títulos `### ETAPA …` abaixo. **Não remover** essa estrutura.

**Objetivo geral:** garantir a regra de bloqueio de exclusão de cotações na lista BID Frete Internacional.

---

## Roteiro de execução

### ETAPA 1 — motivoBloqueioExclusaoCotacao

| Passo | Ação | APROVADO quando |
|-------|------|-----------------|
| **U01** | RASCUNHO sem propostas e sem disparos | retorna `null` (permitida) |
| **U02** | Status com propostas recebidas | retorna `COM_PROPOSTAS` |
| **U03** | Fora de RASCUNHO com disparos e sem propostas | retorna `ENVIADA_FORNECEDOR` |
