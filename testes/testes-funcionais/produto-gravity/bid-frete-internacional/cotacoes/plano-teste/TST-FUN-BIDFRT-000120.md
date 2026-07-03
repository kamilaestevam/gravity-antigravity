# Plano — TST-FUN-BIDFRT-000120

**ID:** TST-FUN-BIDFRT-000120  
**Tipo:** FUN  
**Escopo:** BIDFRT / cotacoes  
**Objetivo:** POST `/cotacoes` filtra fornecedor inelegível ao modal (transportadora internacional em cotação marítima) antes de `motorBid.disparar`.

**Componente:** `servicos-global/produto/bid-frete-internacional/server/src/routes/cotacoes.ts`

**Cenários:**
1. MARITIMO + IDs [transportadora int, armador] → disparo só armador
2. MARITIMO + só transportadora int → `disparos: 0`, motor não invocado
