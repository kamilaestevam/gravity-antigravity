# Plano — TST-UNI-BIDFRT-000118

**ID:** TST-UNI-BIDFRT-000118

**Objetivo:** validação de rota da cotação contra Cadastros usa metadados (sem exigir lat/long); mapa continua exigindo coordenadas.

| Passo | Ação | APROVADO quando |
|-------|------|-----------------|
| **U01** | AEJEA sem coords → metadados | retorna codigo/nome/pais |
| **U02** | AEJEA sem coords → coords mapa | null |
| **U03** | Cadastros 503 | console.warn + null |
| **U04** | validarRota AEJEA+BRAAR | erros vazios |
| **U05** | validarRota ZZZZZ | erro origem_codigo |
