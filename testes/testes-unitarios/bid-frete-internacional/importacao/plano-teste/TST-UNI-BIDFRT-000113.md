# Plano — TST-UNI-BIDFRT-000113

**ID:** TST-UNI-BIDFRT-000113

**Objetivo geral:** garantir prefixos COT- (cotação) e BID- (agrupador) no SSOT de numeração.

---

### ETAPA 1 — numeracao-bid-frete-internacional

| Passo | Ação | APROVADO quando |
|-------|------|-----------------|
| **U01** | `gerarNumeroCotacaoFreteInternacional()` | retorna `COT-YYYYMMDD-NNNN` |
| **U02** | `gerarNumeroBidFreteInternacional()` | retorna `BID-YYYYMMDD-NNNN` |
| **U03** | Comparar funções | cotação nunca contém `BID-` |
