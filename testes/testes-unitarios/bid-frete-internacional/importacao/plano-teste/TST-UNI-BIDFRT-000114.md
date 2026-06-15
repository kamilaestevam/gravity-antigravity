# Plano — TST-UNI-BIDFRT-000114

**ID:** TST-UNI-BIDFRT-000114

**Objetivo geral:** garantir wiring POST de importação (porto → código/país, sem string vazia).

---

### ETAPA 1 — montar-payload-criacao-cotacao-importacao

| Passo | Ação | APROVADO quando |
|-------|------|-----------------|
| **U01** | Linha exemplo template Gravity | deriva `BRSSZ`/`CNSHA` via porto |
| **U02** | Países | `BR` e `CN`, nunca `''` |
| **U03** | Validação alinhada | linha exemplo sem erros; linha vazia falha país |
